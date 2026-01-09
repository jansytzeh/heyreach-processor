import OpenAI from 'openai';
import { config } from './config.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey
});

// Vector Store ID for knowledge retrieval
const VECTOR_STORE_ID = config.openaiVectorStoreId;

// Models
const PRIMARY_MODEL = config.openaiPrimaryModel || 'gpt-5-mini';
const REVIEW_MODEL = config.openaiReviewModel || 'gpt-5';

/**
 * Generate a response using OpenAI with file_search (RAG)
 */
export async function generateResponse(conversation, chatroom) {
  // Extract conversation context
  const prospect = extractProspectInfo(conversation, chatroom);
  const messages = extractMessages(chatroom);
  const lastMessage = messages[messages.length - 1];
  const campaignType = detectCampaignType(conversation, messages);
  const language = detectLanguage(lastMessage?.text || '');

  // Build prompts
  const systemPrompt = buildSystemPrompt(campaignType, language);
  const userPrompt = buildUserPrompt(prospect, messages, campaignType);

  try {
    // Primary generation with gpt-5-mini
    const response = await openai.responses.create({
      model: PRIMARY_MODEL,
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [VECTOR_STORE_ID]
        }
      ],
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'outreach_response',
          schema: RESPONSE_SCHEMA,
          strict: true
        }
      }
    });

    // Parse the response
    const result = parseResponse(response, { prospect, campaignType, language, lastMessage });

    // Check if needs secondary review (high-risk or low confidence)
    if (needsSecondaryReview(result)) {
      return await performSecondaryReview(result, prospect, messages, campaignType, language);
    }

    return result;

  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      action: 'ESCALATE',
      reasoning: `API error: ${error.message}`,
      message: null,
      confidence: 0,
      prospect,
      campaignType,
      language,
      error: error.message
    };
  }
}

/**
 * Check if draft needs secondary review with gpt-5
 */
function needsSecondaryReview(result) {
  // Low confidence
  if (result.confidence < 0.70) return true;

  // Escalation
  if (result.action === 'ESCALATE') return true;

  // High-risk content detection
  const msg = (result.message || '').toLowerCase();

  // Pricing mentions
  if (msg.includes('$') || msg.includes('free') || msg.includes('price') ||
      msg.includes('cost') || msg.includes('gratis') || msg.includes('precio')) {
    return true;
  }

  // Negative sentiment handling
  if (result.analysis?.emotion === 'frustrated' ||
      result.analysis?.emotion === 'skeptical') {
    return true;
  }

  return false;
}

/**
 * Perform secondary review with gpt-5 for high-risk drafts
 */
async function performSecondaryReview(draft, prospect, messages, campaignType, language) {
  console.log(`[REVIEW] Running secondary review with ${REVIEW_MODEL}`);

  const reviewPrompt = `You are a senior reviewer checking an AI-generated LinkedIn message.

## Original Draft
Action: ${draft.action}
Message: ${draft.message || 'None'}
Confidence: ${draft.confidence}
Reasoning: ${draft.reasoning}

## Prospect Context
Name: ${prospect.fullName}
Company: ${prospect.company}
Campaign: ${campaignType}
Language: ${language}

## Your Task
1. Use file_search to retrieve guardrails and pricing rules
2. Check for ANY of these issues:
   - False claims about pricing (contacting is NOT free - it's $50/month)
   - Fabricated features
   - Too pushy after decline
   - Missing required elements (links, CTA)
   - Wrong language
   - Energy mismatch

3. If issues found: regenerate a better message
4. If no issues: approve the original

Respond with JSON matching the schema. Set "reviewed_by_gpt5": true`;

  try {
    const response = await openai.responses.create({
      model: REVIEW_MODEL,
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [VECTOR_STORE_ID]
        }
      ],
      input: [
        { role: 'user', content: reviewPrompt }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'outreach_response',
          schema: RESPONSE_SCHEMA,
          strict: true
        }
      }
    });

    const reviewedResult = parseResponse(response, {
      prospect,
      campaignType,
      language,
      lastMessage: messages[messages.length - 1]
    });

    reviewedResult.reviewed_by_gpt5 = true;
    reviewedResult.original_confidence = draft.confidence;

    return reviewedResult;

  } catch (error) {
    console.error('Secondary review error:', error);
    // Fall back to original draft
    draft.review_error = error.message;
    return draft;
  }
}

/**
 * Extract prospect information
 */
function extractProspectInfo(conversation, chatroom) {
  const correspondent = chatroom?.correspondent || conversation?.correspondent || {};

  return {
    firstName: correspondent.firstName || 'there',
    lastName: correspondent.lastName || '',
    fullName: correspondent.fullName || correspondent.firstName || 'there',
    headline: correspondent.headline || '',
    company: correspondent.companyName || '',
    location: correspondent.location || '',
    profileUrl: correspondent.publicProfileUrl || correspondent.profileUrl || '',
    tags: conversation?.tags || []
  };
}

/**
 * Extract messages from chatroom
 */
function extractMessages(chatroom) {
  const messages = chatroom?.messages || [];

  return messages.map(m => ({
    sender: m.sender,
    text: m.messageBody || m.text || '',
    timestamp: m.timestamp || m.sentAt
  }));
}

/**
 * Detect campaign type
 */
function detectCampaignType(conversation, messages) {
  const cazvidCampaigns = [274509, 181549, 180990, 180988];
  const agencyLeadsCampaigns = [223998, 240191];

  if (cazvidCampaigns.includes(conversation.campaignId)) {
    return 'cazvid';
  }
  if (agencyLeadsCampaigns.includes(conversation.campaignId)) {
    return 'agency_leads';
  }

  // Content-based detection
  const allText = messages.map(m => m.text.toLowerCase()).join(' ');

  if (allText.includes('cazvid') || allText.includes('video curriculum') ||
      allText.includes('candidatos') || allText.includes('candidates')) {
    return 'cazvid';
  }

  if (allText.includes('agency leads') || allText.includes('staffing') ||
      allText.includes('recruitment') || allText.includes('demo')) {
    return 'agency_leads';
  }

  return 'cazvid'; // Default
}

/**
 * Detect language
 */
function detectLanguage(text) {
  const spanishIndicators = [
    'hola', 'gracias', 'cómo', 'qué', 'está', 'bien', 'bueno', 'para',
    'con', 'por', 'que', 'si', 'no', 'muy', 'todo', 'esta', 'pero'
  ];

  const lowerText = text.toLowerCase();
  const spanishCount = spanishIndicators.filter(word =>
    lowerText.includes(word)
  ).length;

  return spanishCount >= 2 ? 'es' : 'en';
}

/**
 * Build system prompt
 */
function buildSystemPrompt(campaignType, language) {
  return `You are a Business Developer AI processing LinkedIn conversations for ${campaignType === 'cazvid' ? 'CazVid' : 'Agency Leads'}.

IMPORTANT: Before generating ANY response, you MUST use file_search to retrieve:
1. Agent persona and communication guidelines from "agent-persona.md"
2. Product information and links from "config.md"
3. Critical guardrails and pricing rules from "knowledge-base.md"
4. Relevant edge cases from "edge-cases.md"

Language: Use ${language === 'es' ? 'SPANISH' : 'ENGLISH'} for your response.

CRITICAL GUARDRAILS (verify against knowledge base):
- NEVER claim contacting candidates is free (it costs $50/month)
- NEVER claim all candidates have videos
- NEVER push after a clear decline
- ALWAYS include required links when advancing to action

OUTPUT: Return valid JSON matching the provided schema.`;
}

/**
 * Build user prompt
 */
function buildUserPrompt(prospect, messages, campaignType) {
  const conversationHistory = messages.map(m =>
    `[${m.sender === 'CALLER' ? 'US' : 'PROSPECT'}]: ${m.text}`
  ).join('\n');

  return `## PROSPECT PROFILE
- Name: ${prospect.fullName}
- Headline: ${prospect.headline}
- Company: ${prospect.company}
- Location: ${prospect.location}
- Tags: ${prospect.tags.join(', ') || 'none'}

## CAMPAIGN
${campaignType === 'cazvid' ? 'CazVid (video-based hiring platform)' : 'Agency Leads (staffing agency lead generation)'}

## CONVERSATION HISTORY
${conversationHistory || 'No previous messages'}

## YOUR TASK
1. Use file_search to retrieve relevant guidelines and product info
2. Analyze the prospect's last message:
   - Intent: interest, gratitude, question, objection, decline, action_ready, confusion, information
   - Emotion: enthusiastic, neutral, skeptical, frustrated, confused, warm, cold
   - Energy level: minimal (1-10 words), brief (11-25), engaged (26-50), detailed (50+)
3. Determine deal stage: COLD, ENGAGED, QUALIFIED, ACTION, WON, LOST
4. Decide action: ENGAGE, PROBE, HOLD, CLOSE, or ESCALATE
5. Generate appropriate response (match their energy/length)

Return your analysis and response as JSON.`;
}

/**
 * Parse the API response
 */
function parseResponse(response, context) {
  try {
    // Get the text output
    const outputText = response.output_text || response.choices?.[0]?.message?.content || '';

    // Try to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON in response');
      }
    }

    return {
      action: parsed.action || 'ESCALATE',
      reasoning: parsed.reasoning || '',
      message: parsed.message || null,
      confidence: parsed.confidence || 0.5,
      analysis: parsed.analysis || {},
      guardrail_check: parsed.guardrail_check || {},
      prospect: context.prospect,
      campaignType: context.campaignType,
      language: context.language
    };

  } catch (error) {
    console.error('Failed to parse response:', error);
    return {
      action: 'ESCALATE',
      reasoning: 'Failed to parse AI response',
      message: null,
      confidence: 0,
      prospect: context.prospect,
      campaignType: context.campaignType,
      language: context.language,
      parseError: error.message
    };
  }
}

/**
 * JSON Schema for structured output
 */
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    analysis: {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          enum: ['interest', 'gratitude', 'question', 'objection', 'decline', 'action_ready', 'confusion', 'information']
        },
        emotion: {
          type: 'string',
          enum: ['enthusiastic', 'neutral', 'skeptical', 'frustrated', 'confused', 'warm', 'cold']
        },
        energy_level: {
          type: 'string',
          enum: ['minimal', 'brief', 'engaged', 'detailed']
        },
        deal_stage: {
          type: 'string',
          enum: ['COLD', 'ENGAGED', 'QUALIFIED', 'ACTION', 'WON', 'LOST']
        },
        language: {
          type: 'string',
          enum: ['en', 'es']
        }
      },
      required: ['intent', 'emotion', 'energy_level', 'deal_stage', 'language'],
      additionalProperties: false
    },
    action: {
      type: 'string',
      enum: ['ENGAGE', 'PROBE', 'HOLD', 'CLOSE', 'ESCALATE']
    },
    reasoning: {
      type: 'string'
    },
    message: {
      type: ['string', 'null']
    },
    confidence: {
      type: 'number'
    },
    guardrail_check: {
      type: 'object',
      properties: {
        no_false_free_claims: { type: 'boolean' },
        no_fabricated_features: { type: 'boolean' },
        appropriate_length: { type: 'boolean' },
        energy_matched: { type: 'boolean' },
        required_links_included: { type: 'boolean' }
      },
      required: ['no_false_free_claims', 'no_fabricated_features', 'appropriate_length', 'energy_matched', 'required_links_included'],
      additionalProperties: false
    }
  },
  required: ['analysis', 'action', 'reasoning', 'message', 'confidence', 'guardrail_check'],
  additionalProperties: false
};
