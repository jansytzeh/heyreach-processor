import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';
import { loadKnowledgeBase } from './knowledge.js';

const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey
});

/**
 * Generate a response for a conversation using Claude
 */
export async function generateResponse(conversation, chatroom) {
  const knowledge = await loadKnowledgeBase();

  // Extract conversation context
  const prospect = extractProspectInfo(conversation, chatroom);
  const messages = extractMessages(chatroom);
  const lastMessage = messages[messages.length - 1];
  const campaignType = detectCampaignType(conversation, messages);
  const language = detectLanguage(lastMessage?.text || '');

  // Build the prompt
  const systemPrompt = buildSystemPrompt(knowledge, campaignType, language);
  const userPrompt = buildUserPrompt(prospect, messages, campaignType);

  try {
    const response = await anthropic.messages.create({
      model: config.claudeModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const content = response.content[0]?.text || '';

    // Parse the structured response
    return parseAgentResponse(content, {
      prospect,
      campaignType,
      language,
      lastMessage
    });
  } catch (error) {
    console.error('Claude API error:', error);
    throw error;
  }
}

/**
 * Extract prospect information from conversation and chatroom
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
 * Detect campaign type (CazVid vs Agency Leads)
 */
function detectCampaignType(conversation, messages) {
  // Check campaign ID
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
 * Detect language from text
 */
function detectLanguage(text) {
  const spanishIndicators = [
    'hola', 'gracias', 'cmo', 'qué', 'est', 'bien', 'bueno', 'para',
    'con', 'por', 'que', 'si', 'no', 'muy', 'todo', 'esta', 'pero'
  ];

  const lowerText = text.toLowerCase();
  const spanishCount = spanishIndicators.filter(word =>
    lowerText.includes(word)
  ).length;

  return spanishCount >= 2 ? 'es' : 'en';
}

/**
 * Build system prompt with knowledge base
 */
function buildSystemPrompt(knowledge, campaignType, language) {
  return `You are a Business Developer for ${campaignType === 'cazvid' ? 'CazVid' : 'Agency Leads'}.

${knowledge.persona}

## Product Knowledge
${campaignType === 'cazvid' ? knowledge.cazvid : knowledge.agencyLeads}

## Critical Guardrails
${knowledge.guardrails}

## Communication Style
- Match the prospect's energy and message length
- Be a helpful colleague, not a salesperson
- Use ${language === 'es' ? 'Spanish' : 'English'}
- Sound natural and human, never robotic

## Response Format
You MUST respond with a JSON object in this exact format:
{
  "action": "ENGAGE" | "PROBE" | "HOLD" | "CLOSE" | "ESCALATE",
  "reasoning": "Brief explanation of your decision",
  "message": "The actual message to send (or null if ESCALATE)",
  "confidence": 0.0 to 1.0
}

Important:
- action "ENGAGE" = send a substantive response
- action "PROBE" = ask a clarifying question
- action "HOLD" = minimal response, wait for more info
- action "CLOSE" = end conversation gracefully (they declined or wrong target)
- action "ESCALATE" = flag for human review (complex situation)`;
}

/**
 * Build user prompt with conversation context
 */
function buildUserPrompt(prospect, messages, campaignType) {
  const conversationHistory = messages.map(m =>
    `${m.sender === 'CALLER' ? 'You' : 'Them'}: ${m.text}`
  ).join('\n');

  return `## Prospect Profile
- Name: ${prospect.fullName}
- Headline: ${prospect.headline}
- Company: ${prospect.company}
- Location: ${prospect.location}
- Tags: ${prospect.tags.join(', ') || 'none'}

## Conversation History
${conversationHistory || 'No previous messages'}

## Campaign
${campaignType === 'cazvid' ? 'CazVid (video-based hiring platform)' : 'Agency Leads (staffing agency tool)'}

## Your Task
Analyze this conversation and generate an appropriate response.
Consider:
1. What is their intent? (Interest, Question, Objection, Decline, etc.)
2. Have we already sent key information? (Don't repeat links/pricing)
3. What's the appropriate next step?

Respond with the JSON format specified in your instructions.`;
}

/**
 * Parse the agent's response
 */
function parseAgentResponse(content, context) {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      action: parsed.action || 'ESCALATE',
      reasoning: parsed.reasoning || '',
      message: parsed.message || null,
      confidence: parsed.confidence || 0.5,
      prospect: context.prospect,
      campaignType: context.campaignType,
      language: context.language
    };
  } catch (error) {
    console.error('Failed to parse agent response:', error);
    console.error('Raw response:', content);

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
