/**
 * Sync Knowledge Files to OpenAI Vector Store
 *
 * Use this script after training sessions to update the Vector Store
 * with your latest knowledge files.
 *
 * Run with: npm run sync:knowledge
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

// Knowledge files to sync
const KNOWLEDGE_FILES = [
  'agent-persona.md',
  'config.md',
  'training/knowledge-base.md',
  'training/conversation-analysis-framework.md',
  'training/quality-rubric.md',
  'training/edge-cases.md',
  'training/deal-tracking.md',
  'training/curriculum.md',
];

// Track file hashes to detect changes
const HASH_FILE = path.join(__dirname, '.knowledge-hashes.json');

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

function loadHashes() {
  if (fs.existsSync(HASH_FILE)) {
    return JSON.parse(fs.readFileSync(HASH_FILE, 'utf-8'));
  }
  return {};
}

function saveHashes(hashes) {
  fs.writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));
}

async function main() {
  console.log('='.repeat(60));
  console.log('HeyReach Knowledge Base - Sync to Vector Store');
  console.log('='.repeat(60));
  console.log();

  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not set');
    process.exit(1);
  }

  if (!VECTOR_STORE_ID) {
    console.error('ERROR: OPENAI_VECTOR_STORE_ID not set');
    console.error('Run npm run setup:vector-store first');
    process.exit(1);
  }

  console.log(`Vector Store: ${VECTOR_STORE_ID}`);
  console.log();

  // Check which files have changed
  const oldHashes = loadHashes();
  const newHashes = {};
  const changedFiles = [];

  console.log('Checking for changes...');
  for (const file of KNOWLEDGE_FILES) {
    const fullPath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  SKIP: ${file} (not found)`);
      continue;
    }

    const hash = getFileHash(fullPath);
    newHashes[file] = hash;

    if (oldHashes[file] !== hash) {
      changedFiles.push(file);
      console.log(`  CHANGED: ${file}`);
    } else {
      console.log(`  OK: ${file}`);
    }
  }

  if (changedFiles.length === 0) {
    console.log();
    console.log('No changes detected. Vector Store is up to date.');
    return;
  }

  console.log();
  console.log(`Found ${changedFiles.length} changed file(s). Updating...`);
  console.log();

  // Get current files in vector store
  const existingFiles = await openai.vectorStores.files.list(VECTOR_STORE_ID);
  const existingFileMap = new Map();

  for (const file of existingFiles.data) {
    // Note: We can't easily map file IDs to names, so we'll do a full refresh
    // of changed files
  }

  // For simplicity, delete all files and re-upload changed ones
  // (OpenAI doesn't provide easy file name lookup)
  console.log('Clearing Vector Store...');
  for (const file of existingFiles.data) {
    try {
      await openai.vectorStores.files.del(VECTOR_STORE_ID, file.id);
    } catch (e) {
      // Ignore errors
    }
  }

  // Upload all files (not just changed, since we cleared)
  console.log('Uploading files...');
  for (const file of KNOWLEDGE_FILES) {
    const fullPath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const uploaded = await openai.files.create({
        file: fs.createReadStream(fullPath),
        purpose: 'assistants',
      });

      await openai.vectorStores.files.create(VECTOR_STORE_ID, {
        file_id: uploaded.id,
      });

      console.log(`  OK: ${file}`);
    } catch (error) {
      console.error(`  ERROR: ${file} - ${error.message}`);
    }
  }

  // Save new hashes
  saveHashes(newHashes);

  // Wait for processing
  console.log();
  console.log('Waiting for Vector Store to process...');
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const store = await openai.vectorStores.retrieve(VECTOR_STORE_ID);
    if (store.status === 'completed') break;
    process.stdout.write('.');
    attempts++;
  }
  console.log();

  const finalStore = await openai.vectorStores.retrieve(VECTOR_STORE_ID);
  console.log();
  console.log('='.repeat(60));
  console.log('SYNC COMPLETE');
  console.log('='.repeat(60));
  console.log(`Status: ${finalStore.status}`);
  console.log(`Files: ${finalStore.file_counts?.total || 0}`);
  console.log(`Bytes: ${finalStore.usage_bytes || 0}`);
  console.log();
}

main().catch(console.error);
