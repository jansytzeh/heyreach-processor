// IMPORTANT: Import Sentry instrumentation FIRST before anything else
import "./instrument.js";

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';
import { config } from './config.js';
import { processConversations } from './processor.js';
import { processConversations as processWithOpenAI, approveDraft, getStats } from './openai-processor.js';
import { healthCheck } from './heyreach-api.js';

// ES Module path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory store for drafts (replace with MongoDB in production)
const draftStore = new Map();
const runStore = new Map();

const app = express();
app.use(express.json());

// Serve static files from public folder (dashboard UI)
app.use(express.static(path.join(__dirname, '../public')));

// Session-based auth for dashboard
const sessions = new Set();

// Check if password protection is enabled
app.get('/api/auth/status', (req, res) => {
  res.json({
    passwordRequired: !!config.dashboardPassword,
    authenticated: !config.dashboardPassword || sessions.has(req.headers['x-session-token'])
  });
});

// Login with password
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;

  if (!config.dashboardPassword) {
    // No password set, auto-authenticate
    const token = generateToken();
    sessions.add(token);
    return res.json({ success: true, token });
  }

  if (password === config.dashboardPassword) {
    const token = generateToken();
    sessions.add(token);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.headers['x-session-token'];
  if (token) sessions.delete(token);
  res.json({ success: true });
});

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Auth middleware - checks session token
const authenticate = (req, res, next) => {
  // No password configured = open access
  if (!config.dashboardPassword) {
    return next();
  }

  const token = req.headers['x-session-token'];
  if (token && sessions.has(token)) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Health check endpoint (no auth required)
app.get('/health', async (req, res) => {
  try {
    const heyreachOk = await healthCheck();
    res.json({
      status: 'ok',
      heyreach: heyreachOk ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Main processing endpoint
app.post('/process', authenticate, async (req, res) => {
  const { dryRun = false, maxMessages = 30 } = req.body;

  console.log('[Process] Starting', { dryRun, maxMessages });

  try {
    const result = await processConversations({
      dryRun,
      maxMessages
    });

    console.log('[Process] Completed', { runId: result.runId, ...result.summary });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('[Process] Failed', error.message);
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Quick status endpoint
app.get('/status', authenticate, async (req, res) => {
  res.json({
    service: 'heyreach-outreach',
    version: '1.0.0',
    environment: config.environment,
    timestamp: new Date().toISOString()
  });
});

// Scheduled job endpoint (for Render cron)
app.post('/cron/nightly', authenticate, async (req, res) => {
  console.log('[Cron] Nightly job triggered');

  try {
    const result = await processConversations({
      dryRun: false,
      maxMessages: config.maxMessagesPerRun
    });

    console.log('[Cron] Nightly job completed', { runId: result.runId, ...result.summary });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Cron] Nightly job failed', error.message);
    Sentry.captureException(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Sentry endpoint (for verification)
app.get('/debug-sentry', authenticate, (req, res) => {
  console.log('[Debug] User triggered test error');

  try {
    // Intentional error for testing
    throw new Error("Sentry test error - this is intentional!");
  } catch (e) {
    Sentry.captureException(e);
    res.json({ message: 'Test error sent to Sentry - check your Sentry dashboard' });
  }
});

// ==============================================
// OpenAI Web Agent API Endpoints
// ==============================================

// POST /api/runs - Trigger a new processing run
app.post('/api/runs', authenticate, async (req, res) => {
  const {
    mode = 'dry_run',  // 'dry_run' or 'live'
    maxMessages = config.maxMessagesPerRun
  } = req.body;

  const dryRun = mode === 'dry_run';

  console.log(`[API] Starting ${mode} run with max ${maxMessages} messages`);

  try {
    const result = await processWithOpenAI({
      dryRun,
      maxMessages
    });

    // Store run and drafts
    runStore.set(result.runId, result);

    for (const draft of result.drafts) {
      draftStore.set(draft.draftId, draft);
    }

    res.json({
      success: true,
      runId: result.runId,
      mode: result.mode,
      summary: result.summary,
      draftsCount: result.drafts.length,
      drafts: result.drafts.map(d => ({
        draftId: d.draftId,
        prospect: d.prospect,
        action: d.action,
        confidence: d.confidence,
        autoApproveEligible: d.autoApproveEligible,
        messagePreview: d.message ? d.message.substring(0, 100) + '...' : null
      }))
    });

  } catch (error) {
    console.error('[API] Run failed:', error);
    Sentry.captureException(error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/runs - List recent runs
app.get('/api/runs', authenticate, (req, res) => {
  const runs = Array.from(runStore.values())
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 20)
    .map(r => ({
      runId: r.runId,
      mode: r.mode,
      startTime: r.startTime,
      endTime: r.endTime,
      summary: r.summary
    }));

  res.json({ runs });
});

// GET /api/runs/:id - Get run details
app.get('/api/runs/:id', authenticate, (req, res) => {
  const run = runStore.get(req.params.id);

  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }

  res.json(run);
});

// GET /api/drafts - Get pending drafts for approval
app.get('/api/drafts', authenticate, (req, res) => {
  const pendingDrafts = Array.from(draftStore.values())
    .filter(d => d.outcome === 'draft' || d.outcome === 'pending_approval' || d.outcome === 'ready')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({
    count: pendingDrafts.length,
    drafts: pendingDrafts.map(d => ({
      draftId: d.draftId,
      conversationId: d.conversationId,
      accountId: d.accountId,
      prospect: d.prospect,
      lastProspectMessage: d.lastProspectMessage,
      analysis: d.analysis,
      action: d.action,
      message: d.message,
      confidence: d.confidence,
      language: d.language,
      campaignType: d.campaignType,
      autoApproveEligible: d.autoApproveEligible,
      warnings: d.warnings,
      createdAt: d.createdAt
    }))
  });
});

// GET /api/drafts/:id - Get specific draft
app.get('/api/drafts/:id', authenticate, (req, res) => {
  const draft = draftStore.get(req.params.id);

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  res.json(draft);
});

// POST /api/drafts/:id/approve - Approve and send a draft
app.post('/api/drafts/:id/approve', authenticate, async (req, res) => {
  const draft = draftStore.get(req.params.id);

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  // Allow editing the message before sending
  const messageToSend = req.body.editedMessage || draft.message;

  if (!messageToSend) {
    return res.status(400).json({ error: 'No message to send' });
  }

  try {
    const result = await approveDraft(
      draft.draftId,
      draft.conversationId,
      draft.accountId,
      messageToSend
    );

    if (result.success) {
      // Update draft status
      draft.outcome = 'sent';
      draft.sentAt = result.sentAt;
      draft.finalMessage = messageToSend;
      draftStore.set(draft.draftId, draft);
    }

    res.json(result);

  } catch (error) {
    console.error('[API] Approve failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/drafts/:id/reject - Reject a draft
app.post('/api/drafts/:id/reject', authenticate, (req, res) => {
  const draft = draftStore.get(req.params.id);

  if (!draft) {
    return res.status(404).json({ error: 'Draft not found' });
  }

  draft.outcome = 'rejected';
  draft.rejectedAt = new Date().toISOString();
  draft.rejectionReason = req.body.reason || 'Manual rejection';
  draftStore.set(draft.draftId, draft);

  res.json({ success: true, draftId: draft.draftId });
});

// GET /api/stats - Get processing stats
app.get('/api/stats', authenticate, async (req, res) => {
  try {
    const stats = await getStats({
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });

    // Add local stats
    const allDrafts = Array.from(draftStore.values());
    const localStats = {
      totalDrafts: allDrafts.length,
      pendingApproval: allDrafts.filter(d => d.outcome === 'pending_approval' || d.outcome === 'draft' || d.outcome === 'ready').length,
      sent: allDrafts.filter(d => d.outcome === 'sent').length,
      rejected: allDrafts.filter(d => d.outcome === 'rejected').length,
      autoApproved: allDrafts.filter(d => d.autoApproved).length
    };

    res.json({
      ...stats,
      localStats,
      sendEnabled: config.sendEnabled,
      autoApproveConfidence: config.autoApproveConfidence
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/drafts/approve-all - Approve all auto-approvable drafts
app.post('/api/drafts/approve-all', authenticate, async (req, res) => {
  const pendingDrafts = Array.from(draftStore.values())
    .filter(d =>
      (d.outcome === 'draft' || d.outcome === 'pending_approval' || d.outcome === 'ready') &&
      d.autoApproveEligible
    );

  const results = {
    total: pendingDrafts.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  for (const draft of pendingDrafts) {
    try {
      const result = await approveDraft(
        draft.draftId,
        draft.conversationId,
        draft.accountId,
        draft.message
      );

      if (result.success) {
        draft.outcome = 'sent';
        draft.sentAt = result.sentAt;
        draft.autoApproved = true;
        draftStore.set(draft.draftId, draft);
        results.sent++;
      } else {
        results.failed++;
        results.errors.push({ draftId: draft.draftId, error: result.error });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ draftId: draft.draftId, error: error.message });
    }
  }

  res.json(results);
});

// ==============================================
// End OpenAI Web Agent API
// ==============================================

// Sentry error handler - MUST be after all controllers
Sentry.setupExpressErrorHandler(app);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HeyReach Outreach Service running on port ${PORT}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`Sentry: enabled`);
});
