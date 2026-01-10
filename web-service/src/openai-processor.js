import * as Sentry from '@sentry/node';
import { config } from './config.js';
import * as heyreach from './heyreach-api.js';
import { generateResponse } from './openai-agent.js';
import { checkAlreadyProcessed, validateResponse } from './knowledge.js';

/**
 * Process conversations using OpenAI with Vector Store RAG
 * Returns drafts for approval (web UI workflow)
 */
export async function processConversations({ dryRun = true, maxMessages = 30, runId = null }) {
  const startTime = Date.now();
  // Use provided runId or generate one
  runId = runId || `run_${new Date().toISOString().replace(/[:.]/g, '-')}`;

  const results = {
    runId,
    mode: dryRun ? 'dry-run' : 'live',
    startTime: new Date().toISOString(),
    drafts: [],          // Drafts for approval
    autoApproved: [],    // Auto-approved and sent (if live mode)
    skipped: [],         // Skipped conversations
    escalated: [],       // Flagged for human review
    errors: [],          // Errors encountered
    summary: {
      fetched: 0,
      processed: 0,
      drafted: 0,
      autoApproved: 0,
      sent: 0,
      skipped: 0,
      escalated: 0,
      errors: 0
    }
  };

  try {
    // Step 1: Fetch unseen conversations
    console.log(`[${runId}] Fetching unseen conversations...`);

    const conversationsResponse = await heyreach.getConversations({
      linkedInAccountIds: config.linkedInAccountIds,
      campaignIds: config.campaignIds,
      seen: false,
      limit: config.fetchLimit
    });

    const conversations = conversationsResponse?.items || [];
    results.summary.fetched = conversations.length;

    console.log(`[${runId}] Fetched ${conversations.length} conversations`);

    if (conversations.length === 0) {
      results.endTime = new Date().toISOString();
      results.durationMs = Date.now() - startTime;
      return results;
    }

    // Step 2: Filter to only conversations where prospect sent last message
    const eligibleConversations = conversations.filter(conv =>
      conv.lastMessageSender === 'CORRESPONDENT'
    );

    console.log(`[${runId}] ${eligibleConversations.length} eligible (prospect sent last)`);

    // Step 3: Process each conversation
    let messagesSent = 0;

    for (const conversation of eligibleConversations) {
      // Check message limit
      if (messagesSent >= maxMessages) {
        console.log(`[${runId}] Max messages limit reached (${maxMessages})`);
        break;
      }

      const draft = await processOneConversation(conversation, runId);
      results.summary.processed++;

      // Categorize result
      if (draft.outcome === 'error') {
        results.errors.push(draft);
        results.summary.errors++;
        continue;
      }

      if (draft.outcome === 'skipped') {
        results.skipped.push(draft);
        results.summary.skipped++;
        continue;
      }

      if (draft.outcome === 'escalated') {
        results.escalated.push(draft);
        results.summary.escalated++;
        continue;
      }

      // Check auto-approval
      const canAutoApprove = shouldAutoApprove(draft);

      if (!dryRun && canAutoApprove && config.sendEnabled) {
        // Auto-approve and send
        try {
          await heyreach.sendMessage({
            linkedInAccountId: draft.accountId,
            conversationId: draft.conversationId,  // Use draft.conversationId (extracted from conversation.id)
            message: draft.message
          });

          draft.outcome = 'sent';
          draft.autoApproved = true;
          results.autoApproved.push(draft);
          results.summary.autoApproved++;
          results.summary.sent++;
          messagesSent++;

          console.log(`[${runId}] Auto-approved & sent to ${draft.prospect.name}`);

        } catch (error) {
          draft.outcome = 'error';
          draft.error = `Send failed: ${error.message}`;
          results.errors.push(draft);
          results.summary.errors++;
        }
      } else {
        // Queue for manual approval
        draft.outcome = dryRun ? 'draft' : 'pending_approval';
        draft.autoApproveEligible = canAutoApprove;
        results.drafts.push(draft);
        results.summary.drafted++;
      }
    }

  } catch (error) {
    console.error(`[${runId}] Fatal error:`, error);
    Sentry.captureException(error);
    results.errors.push({
      type: 'fatal',
      message: error.message,
      stack: error.stack
    });
  }

  results.endTime = new Date().toISOString();
  results.durationMs = Date.now() - startTime;

  console.log(`[${runId}] Complete: ${results.summary.drafted} drafts, ${results.summary.sent} sent, ${results.summary.skipped} skipped`);

  return results;
}

/**
 * Process a single conversation
 */
async function processOneConversation(conversation, runId) {
  // Note: API returns 'id' for conversation ID, not 'conversationId'
  const conversationId = conversation.id || conversation.conversationId;

  const draft = {
    draftId: `draft_${conversationId}_${Date.now()}`,
    conversationId: conversationId,
    accountId: conversation.linkedInAccountId,
    prospect: null,
    action: null,
    message: null,
    confidence: 0,
    analysis: null,
    guardrailCheck: null,
    outcome: null,
    reasoning: null,
    error: null,
    createdAt: new Date().toISOString()
  };

  try {
    // Use data from conversation object (GetConversationsV2 includes messages)
    // No need for separate getChatroom call
    const correspondent = conversation?.correspondentProfile || conversation?.correspondent || {};
    draft.prospect = {
      name: correspondent.fullName || `${correspondent.firstName || ''} ${correspondent.lastName || ''}`.trim() || 'Unknown',
      firstName: correspondent.firstName || '',
      lastName: correspondent.lastName || '',
      company: correspondent.companyName || '',
      headline: correspondent.headline || '',
      location: correspondent.location || '',
      profileUrl: correspondent.profileUrl || correspondent.publicProfileUrl || ''
    };

    // Get messages from conversation (already included in GetConversationsV2 response)
    const messages = conversation?.messages || [];
    const lastProspectMessage = messages.filter(m => m.sender === 'CORRESPONDENT').pop();

    if (!lastProspectMessage) {
      draft.outcome = 'skipped';
      draft.reasoning = 'No prospect message to respond to';
      return draft;
    }

    draft.lastProspectMessage = lastProspectMessage.body || lastProspectMessage.messageBody || lastProspectMessage.text || '';

    // Check if we've already processed this
    const alreadyProcessed = checkAlreadyProcessed(messages);
    draft.alreadyProcessed = alreadyProcessed;

    // Generate response using OpenAI with file_search
    console.log(`[${runId}] Generating response for ${draft.prospect.name}...`);
    // Pass conversation as both params - it has all the data from GetConversationsV2
    const agentResponse = await generateResponse(conversation, conversation);

    draft.action = agentResponse.action;
    draft.reasoning = agentResponse.reasoning;
    draft.confidence = agentResponse.confidence;
    draft.analysis = agentResponse.analysis;
    draft.guardrailCheck = agentResponse.guardrail_check;
    draft.reviewedByGpt5 = agentResponse.reviewed_by_gpt5 || false;

    // Handle different actions
    if (agentResponse.action === 'ESCALATE') {
      draft.outcome = 'escalated';
      draft.message = null;
      console.log(`[${runId}] Escalated: ${draft.prospect.name} - ${agentResponse.reasoning}`);
      return draft;
    }

    if (agentResponse.action === 'HOLD') {
      draft.outcome = 'skipped';
      draft.reasoning = agentResponse.reasoning;
      return draft;
    }

    if (!agentResponse.message) {
      draft.outcome = 'error';
      draft.error = 'No message generated';
      return draft;
    }

    // Validate response against guardrails
    const validation = validateResponse(agentResponse.message, agentResponse.campaignType);
    draft.validation = validation;

    if (!validation.valid) {
      draft.outcome = 'error';
      draft.error = `Guardrail violation: ${validation.errors.join(', ')}`;
      console.log(`[${runId}] Guardrail violation for ${draft.prospect.name}: ${validation.errors.join(', ')}`);
      return draft;
    }

    draft.message = agentResponse.message;
    draft.campaignType = agentResponse.campaignType;
    draft.language = agentResponse.language;
    draft.warnings = validation.warnings;
    draft.outcome = 'ready'; // Ready for approval or sending

    return draft;

  } catch (error) {
    console.error(`[${runId}] Error processing ${conversationId}:`, error);
    draft.outcome = 'error';
    draft.error = error.message;
    return draft;
  }
}

/**
 * Check if a draft should be auto-approved
 */
function shouldAutoApprove(draft) {
  // Must have high confidence
  if (draft.confidence < config.autoApproveConfidence) {
    return false;
  }

  // Must have passed all guardrails
  if (draft.guardrailCheck) {
    const checks = Object.values(draft.guardrailCheck);
    if (checks.some(v => v === false)) {
      return false;
    }
  }

  // Must not have validation warnings
  if (draft.warnings && draft.warnings.length > 0) {
    return false;
  }

  // Must not be reviewed by gpt-5 (indicates it was flagged as risky)
  // Actually, if reviewed by gpt-5 and passed, it's probably OK
  // But let's be conservative for now
  if (draft.reviewedByGpt5) {
    return false;
  }

  // Must be a safe action type
  const safeActions = ['ENGAGE', 'PROBE'];
  if (!safeActions.includes(draft.action)) {
    return false;
  }

  return true;
}

/**
 * Approve and send a draft
 */
export async function approveDraft(draftId, conversationId, accountId, message) {
  if (!config.sendEnabled) {
    throw new Error('Sending is disabled (SEND_ENABLED=false)');
  }

  try {
    await heyreach.sendMessage({
      linkedInAccountId: accountId,
      conversationId: conversationId,
      message: message
    });

    return {
      success: true,
      draftId,
      sentAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Failed to send draft ${draftId}:`, error);
    return {
      success: false,
      draftId,
      error: error.message
    };
  }
}

/**
 * Get processing stats
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
      stats,
      config: {
        sendEnabled: config.sendEnabled,
        autoApproveConfidence: config.autoApproveConfidence,
        maxMessagesPerRun: config.maxMessagesPerRun,
        primaryModel: config.openaiPrimaryModel,
        reviewModel: config.openaiReviewModel
      }
    };
  } catch (error) {
    Sentry.captureException(error);
    return {
      success: false,
      error: error.message
    };
  }
}
