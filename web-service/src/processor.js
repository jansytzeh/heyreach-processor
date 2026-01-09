import * as Sentry from '@sentry/node';
import { config } from './config.js';
import * as heyreach from './heyreach-api.js';
import { generateResponse } from './agent.js';
import { checkAlreadyProcessed, validateResponse } from './knowledge.js';

/**
 * Main processing function - fetches conversations and generates/sends responses
 */
export async function processConversations({ dryRun = false, maxMessages = 30 }) {
  const startTime = Date.now();
  const runId = new Date().toISOString().replace(/[:.]/g, '-');

  const results = {
    runId,
    mode: dryRun ? 'dry-run' : 'live',
    startTime: new Date().toISOString(),
    conversations: [],
    summary: {
      fetched: 0,
      processed: 0,
      sent: 0,
      skipped: 0,
      escalated: 0,
      errors: 0
    },
    errors: []
  };

  try {
    // Step 1: Fetch unseen conversations
    console.log('Fetching unseen conversations', { runId });

    const conversationsResponse = await heyreach.getConversations({
      linkedInAccountIds: config.linkedInAccountIds,
      campaignIds: config.campaignIds,
      seen: false,
      limit: config.fetchLimit
    });

    const conversations = conversationsResponse?.items || [];
    results.summary.fetched = conversations.length;

    console.log('Conversations fetched', { runId, count: conversations.length });

    if (conversations.length === 0) {
      results.endTime = new Date().toISOString();
      results.durationMs = Date.now() - startTime;
      return results;
    }

    // Step 2: Filter to only conversations where prospect sent last message
    const eligibleConversations = conversations.filter(conv =>
      conv.lastMessageSender === 'CORRESPONDENT'
    );

    console.log('Eligible conversations filtered', { runId, eligible: eligibleConversations.length });

    // Step 3: Process each conversation
    let messagesSent = 0;

    for (const conversation of eligibleConversations) {
      // Check message limit
      if (messagesSent >= maxMessages) {
        console.log('Max messages limit reached', { runId, limit: maxMessages });
        break;
      }

      const conversationResult = await processOneConversation(
        conversation,
        dryRun,
        runId
      );

      results.conversations.push(conversationResult);

      // Update summary
      results.summary.processed++;

      if (conversationResult.outcome === 'sent') {
        results.summary.sent++;
        messagesSent++;
      } else if (conversationResult.outcome === 'skipped') {
        results.summary.skipped++;
      } else if (conversationResult.outcome === 'escalated') {
        results.summary.escalated++;
      } else if (conversationResult.outcome === 'error') {
        results.summary.errors++;
        results.errors.push({
          conversationId: conversationResult.conversationId,
          error: conversationResult.error
        });
      }
    }

  } catch (error) {
    console.error('Fatal processing error', { runId, error: error.message });
    Sentry.captureException(error);
    results.errors.push({
      type: 'fatal',
      message: error.message,
      stack: error.stack
    });
  }

  results.endTime = new Date().toISOString();
  results.durationMs = Date.now() - startTime;

  return results;
}

/**
 * Process a single conversation
 */
async function processOneConversation(conversation, dryRun, runId) {
  // Note: API returns 'id' for conversation ID, not 'conversationId'
  const conversationId = conversation.id || conversationId;

  const result = {
    conversationId: conversationId,
    accountId: conversation.linkedInAccountId,
    prospect: null,
    action: null,
    message: null,
    outcome: null,
    error: null,
    reasoning: null
  };

  try {
    // Get full chatroom with all messages
    const chatroom = await heyreach.getChatroom(
      conversation.linkedInAccountId,
      conversationId
    );

    // Extract prospect info
    const correspondent = chatroom?.correspondent || conversation?.correspondent || {};
    result.prospect = {
      name: correspondent.fullName || correspondent.firstName || 'Unknown',
      company: correspondent.companyName || '',
      headline: correspondent.headline || ''
    };

    // Check if we've already processed this (sent key info)
    const messages = chatroom?.messages || [];
    const alreadyProcessed = checkAlreadyProcessed(messages);

    // If we've already sent key info and they haven't responded with new info, skip
    const lastProspectMessage = messages.filter(m => m.sender === 'CORRESPONDENT').pop();
    if (!lastProspectMessage) {
      result.outcome = 'skipped';
      result.reasoning = 'No prospect message to respond to';
      return result;
    }

    // Generate response using Claude
    const agentResponse = await generateResponse(conversation, chatroom);

    result.action = agentResponse.action;
    result.reasoning = agentResponse.reasoning;
    result.confidence = agentResponse.confidence;

    // Handle different actions
    if (agentResponse.action === 'ESCALATE') {
      result.outcome = 'escalated';
      result.message = null;
      console.warn('Conversation escalated', { runId, prospect: result.prospect.name, reason: agentResponse.reasoning });
      return result;
    }

    if (agentResponse.action === 'HOLD') {
      result.outcome = 'skipped';
      result.reasoning = agentResponse.reasoning;
      console.log('Conversation on hold', { runId, prospect: result.prospect.name, reason: agentResponse.reasoning });
      return result;
    }

    if (agentResponse.action === 'CLOSE') {
      // For CLOSE, we still send a graceful closing message
      if (!agentResponse.message) {
        result.outcome = 'skipped';
        result.reasoning = 'CLOSE but no message generated';
        return result;
      }
    }

    // For ENGAGE, PROBE, or CLOSE with message
    if (!agentResponse.message) {
      result.outcome = 'error';
      result.error = 'No message generated';
      return result;
    }

    // Validate response against guardrails
    const validation = validateResponse(agentResponse.message, agentResponse.campaignType);
    if (!validation.valid) {
      result.outcome = 'error';
      result.error = `Guardrail violation: ${validation.errors.join(', ')}`;
      console.error('Guardrail violation', { runId, prospect: result.prospect.name, errors: validation.errors });
      return result;
    }

    if (validation.warnings.length > 0) {
      console.warn('Response warnings', { runId, prospect: result.prospect.name, warnings: validation.warnings });
    }

    result.message = agentResponse.message;

    // Send or preview
    if (dryRun) {
      result.outcome = 'dry-run';
      console.log('Dry-run message preview', {
        runId,
        prospect: result.prospect.name,
        action: result.action,
        messagePreview: result.message.substring(0, 100)
      });
    } else {
      // Actually send the message
      await heyreach.sendMessage({
        linkedInAccountId: conversation.linkedInAccountId,
        conversationId: conversationId,
        message: agentResponse.message
      });

      result.outcome = 'sent';
      console.log('Message sent', {
        runId,
        prospect: result.prospect.name,
        action: result.action,
        conversationId: conversationId
      });
    }

    return result;

  } catch (error) {
    console.error('Error processing conversation', {
      runId,
      conversationId: conversationId,
      error: error.message
    });
    Sentry.captureException(error);
    result.outcome = 'error';
    result.error = error.message;
    return result;
  }
}

/**
 * Get processing stats for dashboard
 */
export async function getStats({ startDate = null, endDate = null } = {}) {
  try {
    const stats = await heyreach.getOverallStats({
      accountIds: config.linkedInAccountIds,
      campaignIds: config.campaignIds,
      startDate,
      endDate
    });

    return {
      success: true,
      stats
    };
  } catch (error) {
    Sentry.captureException(error);
    return {
      success: false,
      error: error.message
    };
  }
}
