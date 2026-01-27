// HeyReach Agent Dashboard - Frontend JavaScript

let sessionToken = localStorage.getItem('heyreach_session') || '';
let currentDraft = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  checkAuth();
});

// Tab switching
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
    });
  });
}

// Check authentication status
async function checkAuth() {
  updateStatus('connecting');

  try {
    const response = await fetch('/api/auth/status', {
      headers: { 'x-session-token': sessionToken }
    });
    const data = await response.json();

    if (data.authenticated) {
      // Already authenticated or no password required
      showDashboard();
    } else if (data.passwordRequired) {
      // Show password prompt
      document.getElementById('auth-section').classList.remove('hidden');
      document.getElementById('main-content').classList.add('hidden');
      updateStatus('error');
    } else {
      // No password, auto-login
      await login();
    }
  } catch (error) {
    updateStatus('error');
    showToast('Failed to connect: ' + error.message, 'error');
  }
}

// Login with password
async function login(password = null) {
  updateStatus('connecting');

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (data.success) {
      sessionToken = data.token;
      localStorage.setItem('heyreach_session', sessionToken);
      showDashboard();
    } else {
      updateStatus('error');
      showToast('Invalid password', 'error');
    }
  } catch (error) {
    updateStatus('error');
    showToast('Login failed: ' + error.message, 'error');
  }
}

// Called from HTML button
function authenticate() {
  const password = document.getElementById('password-input').value;
  login(password);
}

function showDashboard() {
  updateStatus('connected');
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('main-content').classList.remove('hidden');
  loadDashboard();
}

function updateStatus(status) {
  const dot = document.getElementById('status-indicator');
  const text = document.getElementById('status-text');
  dot.className = 'status-dot';

  switch (status) {
    case 'connected':
      dot.classList.add('connected');
      text.textContent = 'Connected';
      break;
    case 'connecting':
      text.textContent = 'Connecting...';
      break;
    case 'error':
      dot.classList.add('error');
      text.textContent = 'Disconnected';
      break;
  }
}

// Load dashboard data
async function loadDashboard() {
  await Promise.all([
    loadStats(),
    refreshDrafts(),
    loadRuns()
  ]);
}

// Load stats
async function loadStats() {
  try {
    const response = await apiCall('/api/stats');
    const data = await response.json();

    if (data.localStats) {
      document.getElementById('stat-pending').textContent = data.localStats.pendingApproval || 0;
      document.getElementById('stat-sent').textContent = data.localStats.sent || 0;
      document.getElementById('stat-rejected').textContent = data.localStats.rejected || 0;
      document.getElementById('stat-auto').textContent = data.localStats.autoApproved || 0;
    }

    const sendEnabled = document.getElementById('config-send-enabled');
    sendEnabled.textContent = data.sendEnabled ? 'Enabled' : 'Disabled';
    sendEnabled.className = 'config-value ' + (data.sendEnabled ? 'enabled' : 'disabled');

    document.getElementById('config-threshold').textContent =
      (data.autoApproveConfidence * 100).toFixed(0) + '%';

    if (data.config) {
      document.getElementById('config-primary-model').textContent = data.config.primaryModel || '-';
      document.getElementById('config-review-model').textContent = data.config.reviewModel || '-';
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Load drafts
async function refreshDrafts() {
  try {
    const response = await apiCall('/api/drafts');
    const data = await response.json();
    renderDrafts(data.drafts || []);
    document.getElementById('stat-pending').textContent = data.count || 0;
  } catch (error) {
    console.error('Failed to load drafts:', error);
    showToast('Failed to load drafts', 'error');
  }
}

function renderDrafts(drafts) {
  const container = document.getElementById('drafts-list');

  if (drafts.length === 0) {
    container.innerHTML = '<p class="empty-state">No pending drafts. Run a processing job to generate drafts.</p>';
    return;
  }

  container.innerHTML = drafts.map(draft => `
    <div class="draft-card" onclick="openDraftModal('${draft.draftId}')">
      <div class="draft-header">
        <div>
          <div class="draft-prospect">${escapeHtml(draft.prospect?.name || 'Unknown')}</div>
          <div class="draft-company">${escapeHtml(draft.prospect?.company || '')}</div>
        </div>
        <div>
          <span class="confidence-badge ${getConfidenceClass(draft.confidence)}">
            ${Math.round((draft.confidence || 0) * 100)}%
          </span>
          ${draft.autoApproveEligible ? '<span class="auto-approve-badge">Auto-Eligible</span>' : ''}
        </div>
      </div>
      <div class="draft-message-preview">
        ${escapeHtml(truncate(draft.message || 'No message', 150))}
      </div>
      <div class="draft-meta">
        <span>Action: ${draft.action || '-'}</span>
        <span>Lang: ${(draft.language || 'en').toUpperCase()}</span>
        <span>Campaign: ${draft.campaignType || '-'}</span>
      </div>
    </div>
  `).join('');
}

function getConfidenceClass(confidence) {
  if (confidence >= 0.85) return 'confidence-high';
  if (confidence >= 0.70) return 'confidence-medium';
  return 'confidence-low';
}

// Load runs history
async function loadRuns() {
  try {
    const response = await apiCall('/api/runs');
    const data = await response.json();
    renderRuns(data.runs || []);
  } catch (error) {
    console.error('Failed to load runs:', error);
  }
}

function renderRuns(runs) {
  const container = document.getElementById('runs-list');

  if (runs.length === 0) {
    container.innerHTML = '<p class="empty-state">No runs yet. Start a processing run to see history.</p>';
    return;
  }

  container.innerHTML = runs.map(run => `
    <div class="run-card">
      <div class="run-info">
        <span class="run-mode ${run.mode === 'live' ? 'live' : 'dry-run'}">
          ${run.mode === 'live' ? 'LIVE' : 'DRY RUN'}
        </span>
        <span class="run-time">${formatTime(run.startTime)}</span>
      </div>
      <div class="run-stats">
        <span>Drafted: ${run.summary?.drafted || 0}</span>
        <span>Sent: ${run.summary?.sent || 0}</span>
        <span>Skipped: ${run.summary?.skipped || 0}</span>
      </div>
    </div>
  `).join('');
}

// Start a processing run
async function startRun() {
  const mode = document.getElementById('run-mode').value;
  const maxMessages = parseInt(document.getElementById('max-messages').value) || 10;

  const runBtn = document.getElementById('run-btn');
  const progress = document.getElementById('run-progress');

  runBtn.disabled = true;
  progress.classList.remove('hidden');

  try {
    const response = await apiCall('/api/runs', {
      method: 'POST',
      body: JSON.stringify({ mode, maxMessages })
    });

    const data = await response.json();

    if (data.success) {
      showToast(`Run complete: ${data.draftsCount} drafts generated`, 'success');
      await loadDashboard();
    } else {
      showToast('Run failed: ' + (data.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    showToast('Run failed: ' + error.message, 'error');
  } finally {
    runBtn.disabled = false;
    progress.classList.add('hidden');
  }
}

// Approve all eligible drafts
async function approveAllEligible() {
  if (!confirm('Approve and send all auto-eligible drafts?')) return;

  try {
    const response = await apiCall('/api/drafts/approve-all', { method: 'POST' });
    const data = await response.json();
    showToast(`Sent: ${data.sent}, Failed: ${data.failed}`, data.failed > 0 ? 'warning' : 'success');
    await loadDashboard();
  } catch (error) {
    showToast('Bulk approve failed: ' + error.message, 'error');
  }
}

// Draft Modal
async function openDraftModal(draftId) {
  try {
    const response = await apiCall(`/api/drafts/${draftId}`);
    currentDraft = await response.json();

    document.getElementById('modal-prospect-name').textContent =
      currentDraft.prospect?.name || 'Unknown';

    document.getElementById('modal-confidence').textContent =
      Math.round((currentDraft.confidence || 0) * 100) + '%';
    document.getElementById('modal-confidence').className =
      'confidence-badge ' + getConfidenceClass(currentDraft.confidence);

    document.getElementById('modal-prospect-info').innerHTML = `
      <strong>${escapeHtml(currentDraft.prospect?.company || '-')}</strong><br>
      ${escapeHtml(currentDraft.prospect?.headline || '-')}<br>
      ${escapeHtml(currentDraft.prospect?.location || '-')}
    `;

    document.getElementById('modal-last-message').textContent =
      currentDraft.lastProspectMessage || 'No message';

    const analysis = currentDraft.analysis || {};
    document.getElementById('modal-analysis').innerHTML = `
      <p><span>Intent:</span> ${analysis.intent || '-'}</p>
      <p><span>Emotion:</span> ${analysis.emotion || '-'}</p>
      <p><span>Energy:</span> ${analysis.energy_level || '-'}</p>
      <p><span>Stage:</span> ${analysis.deal_stage || '-'}</p>
      <p><span>Action:</span> ${currentDraft.action || '-'}</p>
      <p><span>Reasoning:</span> ${escapeHtml(currentDraft.reasoning || '-')}</p>
    `;

    document.getElementById('modal-message').value = currentDraft.message || '';

    const warningsBox = document.getElementById('modal-warnings');
    if (currentDraft.warnings && currentDraft.warnings.length > 0) {
      warningsBox.classList.remove('hidden');
      warningsBox.innerHTML = `
        <strong>Warnings:</strong>
        <ul>${currentDraft.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
      `;
    } else {
      warningsBox.classList.add('hidden');
    }

    document.getElementById('draft-modal').classList.remove('hidden');
  } catch (error) {
    showToast('Failed to load draft: ' + error.message, 'error');
  }
}

function closeModal() {
  document.getElementById('draft-modal').classList.add('hidden');
  currentDraft = null;
}

async function approveDraft() {
  if (!currentDraft) return;

  const editedMessage = document.getElementById('modal-message').value;

  try {
    const response = await apiCall(`/api/drafts/${currentDraft.draftId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ editedMessage })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Message sent successfully!', 'success');
      closeModal();
      await loadDashboard();
    } else {
      showToast('Send failed: ' + (data.error || 'Unknown'), 'error');
    }
  } catch (error) {
    showToast('Approve failed: ' + error.message, 'error');
  }
}

async function rejectDraft() {
  if (!currentDraft) return;

  const reason = prompt('Rejection reason (optional):') || 'Manual rejection';

  try {
    const response = await apiCall(`/api/drafts/${currentDraft.draftId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });

    const data = await response.json();

    if (data.success) {
      showToast('Draft rejected', 'success');
      closeModal();
      await loadDashboard();
    } else {
      showToast('Reject failed', 'error');
    }
  } catch (error) {
    showToast('Reject failed: ' + error.message, 'error');
  }
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Close modal on backdrop click
document.getElementById('draft-modal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) closeModal();
});

// API Helper with session token
async function apiCall(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': sessionToken,
      ...options.headers
    }
  });

  if (response.status === 401) {
    // Session expired or invalid
    sessionToken = '';
    localStorage.removeItem('heyreach_session');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');
    updateStatus('error');
    throw new Error('Session expired');
  }

  return response;
}

// Toast notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Utility functions
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function truncate(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatTime(isoString) {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleString();
}
