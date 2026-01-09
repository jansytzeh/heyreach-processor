#!/usr/bin/env node
import { config } from './config.js';
import { processConversations } from './processor.js';
import { healthCheck } from './heyreach-api.js';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log('HeyReach Outreach CLI');
  console.log('=====================\n');

  switch (command) {
    case 'process':
      await runProcess();
      break;

    case 'health':
      await runHealthCheck();
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

async function runProcess() {
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const maxMessages = parseInt(
    args.find(a => a.startsWith('--max='))?.split('=')[1] ||
    config.maxMessagesPerRun
  );

  console.log(`Mode: ${dryRun ? 'DRY-RUN (no messages sent)' : 'LIVE (will send messages)'}`);
  console.log(`Max messages: ${maxMessages}`);
  console.log('');

  if (!dryRun) {
    console.log('WARNING: This will send real messages!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log('Starting processing...\n');

  try {
    const result = await processConversations({ dryRun, maxMessages });

    console.log('\n=== RESULTS ===');
    console.log(`Run ID: ${result.runId}`);
    console.log(`Duration: ${result.durationMs}ms`);
    console.log('');
    console.log('Summary:');
    console.log(`  Fetched: ${result.summary.fetched}`);
    console.log(`  Processed: ${result.summary.processed}`);
    console.log(`  Sent: ${result.summary.sent}`);
    console.log(`  Skipped: ${result.summary.skipped}`);
    console.log(`  Escalated: ${result.summary.escalated}`);
    console.log(`  Errors: ${result.summary.errors}`);

    if (result.conversations.length > 0) {
      console.log('\nConversations:');
      for (const conv of result.conversations) {
        console.log(`  - ${conv.prospect?.name || 'Unknown'}: ${conv.outcome} (${conv.action})`);
        if (conv.message) {
          console.log(`    Message: ${conv.message.substring(0, 80)}...`);
        }
        if (conv.error) {
          console.log(`    Error: ${conv.error}`);
        }
      }
    }

    if (result.errors.length > 0) {
      console.log('\nErrors:');
      for (const err of result.errors) {
        console.log(`  - ${err.conversationId || 'general'}: ${err.message || err.error}`);
      }
    }

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

async function runHealthCheck() {
  console.log('Running health checks...\n');

  // Check config
  console.log('Configuration:');
  console.log(`  HeyReach API Key: ${config.heyreachApiKey ? 'Set' : 'MISSING'}`);
  console.log(`  Anthropic API Key: ${config.anthropicApiKey ? 'Set' : 'MISSING'}`);
  console.log(`  Sentry DSN: ${config.sentryDsn ? 'Set' : 'Not configured'}`);
  console.log(`  Accounts: ${config.linkedInAccountIds.length}`);
  console.log(`  Campaigns: ${config.campaignIds.length}`);
  console.log('');

  // Check HeyReach API
  console.log('HeyReach API:');
  try {
    const ok = await healthCheck();
    console.log(`  Status: ${ok ? 'Connected' : 'Error'}`);
  } catch (error) {
    console.log(`  Status: Error - ${error.message}`);
  }

  console.log('\nHealth check complete.');
}

function showHelp() {
  console.log('Usage: node cli.js <command> [options]\n');
  console.log('Commands:');
  console.log('  process          Process unseen conversations');
  console.log('  health           Run health checks');
  console.log('  help             Show this help\n');
  console.log('Options:');
  console.log('  --dry-run, -d    Preview messages without sending');
  console.log('  --max=N          Maximum messages to send (default: 30)');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
