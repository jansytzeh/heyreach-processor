/**
 * Setup OpenAI Vector Store for HeyReach Knowledge Base
 *
 * This script:
 * 1. Creates a new Vector Store (or uses existing one)
 * 2. Uploads all knowledge files from the parent directory
 * 3. Saves the Vector Store ID to .env
 *
 * Run with: npm run setup:vector-store
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Load environment variables
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Knowledge files to upload (relative to project root)
const KNOWLEDGE_FILES = [
  { path: 'agent-persona.md', description: 'Agent identity, decision framework, communication style, Chris Voss techniques' },
  { path: 'config.md', description: 'Configuration settings, product links, pricing, campaign IDs, guardrails' },
  { path: 'training/knowledge-base.md', description: 'Accumulated learnings, patterns, principles, best practices' },
  { path: 'training/conversation-analysis-framework.md', description: 'How to analyze conversations: context, intent, emotion, deal stage' },
  { path: 'training/quality-rubric.md', description: 'Message scoring system (Excellent/Good/Mediocre/Bad)' },
  { path: 'training/edge-cases.md', description: 'Complex scenario handling, unusual situations' },
  { path: 'training/deal-tracking.md', description: 'Deal stages: Cold, Engaged, Qualified, Action, Won, Lost' },
  { path: 'training/curriculum.md', description: 'Training levels and progression milestones' },
];

async function main() {
  console.log('='.repeat(60));
  console.log('HeyReach Knowledge Base - Vector Store Setup');
  console.log('='.repeat(60));
  console.log();

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY not found in environment variables.');
    console.error('Create a .env file with: OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  // Step 1: Create Vector Store
  console.log('[1/4] Creating Vector Store...');
  let vectorStore;

  // Check if we already have a vector store ID
  if (process.env.OPENAI_VECTOR_STORE_ID) {
    console.log(`     Using existing Vector Store: ${process.env.OPENAI_VECTOR_STORE_ID}`);
    try {
      vectorStore = await openai.vectorStores.retrieve(process.env.OPENAI_VECTOR_STORE_ID);
      console.log(`     Found: "${vectorStore.name}"`);
    } catch (error) {
      console.log('     Existing Vector Store not found, creating new one...');
      vectorStore = null;
    }
  }

  if (!vectorStore) {
    vectorStore = await openai.vectorStores.create({
      name: 'heyreach-knowledge-base',
      expires_after: {
        anchor: 'last_active_at',
        days: 30, // Will auto-renew when used
      },
    });
    console.log(`     Created: ${vectorStore.id}`);
    console.log();
    console.log('     IMPORTANT: Add this to your .env file:');
    console.log(`     OPENAI_VECTOR_STORE_ID=${vectorStore.id}`);
    console.log();
  }

  // Step 2: Delete existing files (clean slate)
  console.log('[2/4] Clearing existing files from Vector Store...');
  const existingFiles = await openai.vectorStores.files.list(vectorStore.id);

  for (const file of existingFiles.data) {
    try {
      await openai.vectorStores.files.del(vectorStore.id, file.id);
      console.log(`     Removed: ${file.id}`);
    } catch (error) {
      console.log(`     Could not remove ${file.id}: ${error.message}`);
    }
  }
  console.log(`     Cleared ${existingFiles.data.length} files`);

  // Step 3: Upload new files
  console.log('[3/4] Uploading knowledge files...');
  const uploadedFiles = [];

  for (const fileInfo of KNOWLEDGE_FILES) {
    const fullPath = path.join(ROOT_DIR, fileInfo.path);

    if (!fs.existsSync(fullPath)) {
      console.log(`     SKIP: ${fileInfo.path} (not found)`);
      continue;
    }

    try {
      // Upload file to OpenAI
      const file = await openai.files.create({
        file: fs.createReadStream(fullPath),
        purpose: 'assistants', // Required for vector stores
      });

      // Attach to vector store
      await openai.vectorStores.files.create(vectorStore.id, {
        file_id: file.id,
      });

      uploadedFiles.push({ name: fileInfo.path, id: file.id });
      console.log(`     OK: ${fileInfo.path}`);
    } catch (error) {
      console.error(`     ERROR: ${fileInfo.path} - ${error.message}`);
    }
  }

  // Step 4: Verify
  console.log('[4/4] Verifying Vector Store...');

  // Wait for processing
  let attempts = 0;
  let status = 'in_progress';

  while (status === 'in_progress' && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const store = await openai.vectorStores.retrieve(vectorStore.id);
    status = store.status;
    attempts++;
    process.stdout.write('.');
  }
  console.log();

  const finalStore = await openai.vectorStores.retrieve(vectorStore.id);
  const finalFiles = await openai.vectorStores.files.list(vectorStore.id);

  console.log();
  console.log('='.repeat(60));
  console.log('SETUP COMPLETE');
  console.log('='.repeat(60));
  console.log();
  console.log(`Vector Store ID: ${vectorStore.id}`);
  console.log(`Name:            ${finalStore.name}`);
  console.log(`Status:          ${finalStore.status}`);
  console.log(`Files:           ${finalFiles.data.length} uploaded`);
  console.log(`File bytes:      ${finalStore.usage_bytes || 0} bytes`);
  console.log();
  console.log('Uploaded files:');
  for (const file of uploadedFiles) {
    console.log(`  - ${file.name}`);
  }
  console.log();
  console.log('Next steps:');
  console.log('1. Add to .env: OPENAI_VECTOR_STORE_ID=' + vectorStore.id);
  console.log('2. Run: npm run sync:knowledge (to update files later)');
  console.log();
}

main().catch(console.error);
