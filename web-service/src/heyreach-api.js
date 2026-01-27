import { config } from './config.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Make a request to the HeyReach API with retry logic
 */
async function heyreachRequest(endpoint, options = {}) {
  const url = `${config.heyreachBaseUrl}${endpoint}`;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-API-KEY': config.heyreachApiKey,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      // Rate limit handling
      if (response.status === 429) {
        console.warn('Rate limit hit. Waiting 60 seconds...');
        await delay(60000);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HeyReach API error ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < maxRetries) {
        console.warn(`API call failed (attempt ${attempt}/${maxRetries}): ${error.message}`);
        await delay(2000 * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}

/**
 * Health check - verify API key is valid
 */
export async function healthCheck() {
  try {
    await heyreachRequest('/api/public/auth/CheckApiKey', { method: 'GET' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get conversations (V2)
 */
export async function getConversations({
  linkedInAccountIds = [],
  campaignIds = [],
  seen = null,
  limit = 100,
  offset = 0
}) {
  const body = {
    filters: {
      linkedInAccountIds,
      campaignIds
    },
    offset,
    limit: Math.min(limit, 100)
  };

  if (seen !== null) {
    body.filters.seen = seen;
  }

  return heyreachRequest('/api/public/inbox/GetConversationsV2', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

/**
 * Get full chatroom with all messages
 */
export async function getChatroom(accountId, conversationId) {
  return heyreachRequest(
    `/api/public/inbox/GetChatroom?accountId=${accountId}&conversationId=${conversationId}`,
    { method: 'GET' }
  );
}

/**
 * Send a message
 */
export async function sendMessage({ linkedInAccountId, conversationId, message, subject = '' }) {
  return heyreachRequest('/api/public/inbox/SendMessage', {
    method: 'POST',
    body: JSON.stringify({
      linkedInAccountId,
      conversationId,
      message,
      subject
    })
  });
}

/**
 * Add tags to a lead
 */
export async function addTagsToLead({ profileUrl, tags, createIfNotExists = true }) {
  return heyreachRequest('/api/public/lead/AddTags', {
    method: 'POST',
    body: JSON.stringify({
      leadProfileUrl: profileUrl,
      tags,
      createTagIfNotExisting: createIfNotExists
    })
  });
}

/**
 * Get overall stats
 */
export async function getOverallStats({ accountIds = [], campaignIds = [], startDate = null, endDate = null }) {
  const body = { accountIds, campaignIds };
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;

  return heyreachRequest('/api/public/stats/GetOverallStats', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}
