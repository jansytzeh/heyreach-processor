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

  const lastMessage = messages[messages.length - 1];
  const wordCount = (lastMessage?.text || '').split(/\s+/).filter(w => w.length > 0).length;

  const reviewPrompt = `You are a senior reviewer checking an AI-generated LinkedIn message for ${campaignType === 'cazvid' ? 'CazVid' : 'Agency Leads'}.

## Original Draft to Review
- Action: ${draft.action}
- Message: ${draft.message || 'None'}
- Confidence: ${draft.confidence}
- Reasoning: ${draft.reasoning}

## Prospect Context
- Name: ${prospect.fullName} (first name: ${prospect.firstName})
- Company: ${prospect.company}
- Campaign: ${campaignType}
- Language: ${language}
- Their last message word count: ${wordCount}

## CRITICAL REVIEW CHECKLIST

### 1. FORMAT VIOLATIONS (MUST FIX)
- [ ] Contains em-dashes (—) → MUST replace with regular dashes (-) or commas
- [ ] Contains placeholder brackets [Name] → MUST use actual name "${prospect.firstName}"
- [ ] Uses corporate speak (leverage, synergy, optimize) → MUST rewrite naturally

### 2. PRICING VIOLATIONS (ZERO TOLERANCE)
- [ ] Claims contacting is FREE → FALSE! It costs $50/month
- [ ] Claims ALL candidates have videos → FALSE! Say "many candidates"
- [ ] Fabricates features that don't exist → MUST remove

### 3. ENERGY MISMATCH (CRITICAL)
- Their message: ${wordCount} words
- Expected response length: ${wordCount <= 10 ? '15-35 words MAX' : wordCount <= 25 ? '30-60 words MAX' : wordCount <= 50 ? '50-100 words MAX' : 'Full response OK'}
- [ ] Response is TOO LONG for their energy level → MUST shorten

### 4. TONE ISSUES
- [ ] Too pushy after decline → MUST soften or close gracefully
- [ ] Too formal/robotic → MUST make conversational
- [ ] Doesn't match their emotion → MUST adjust

### 5. REQUIRED ELEMENTS
${campaignType === 'cazvid' ? `
For CazVid advancement:
- [ ] Missing job posting link (ES: https://cazvid.com/es/vacantes/publicar, EN: https://cazvid.com/en/vacancies/post)
- [ ] Missing tutorial video (ES: https://youtu.be/mldU26l91ZA, EN: https://youtu.be/Y3l1YJlLWIk)
` : `
For Agency Leads advancement:
- [ ] Missing Calendly link (https://calendly.com/jan-at-cazvid/agency-leads)
- [ ] Not offering sample leads
`}

## YOUR DECISION

If ANY issues found:
1. Fix all issues
2. Regenerate the message
3. Return the corrected version

If no issues found:
1. Return the original message unchanged
2. Confirm in reasoning why it passed

## QUALITY STANDARD

The response must:
- Sound like a human friend wrote it (not a bot)
- Match their energy precisely
- Use their first name naturally (not forced)
- Have NO em-dashes (—)
- Include correct links ONLY if advancing
- Be honest about pricing

Respond with valid JSON matching the schema. Set "reviewed_by_gpt5": true`;

  // Rest of the function continues...

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
  // Handle both API response formats (correspondentProfile from V2, correspondent from chatroom)
  const correspondent = chatroom?.correspondentProfile || chatroom?.correspondent ||
                       conversation?.correspondentProfile || conversation?.correspondent || {};

  return {
    firstName: correspondent.firstName || 'there',
    lastName: correspondent.lastName || '',
    fullName: correspondent.fullName || `${correspondent.firstName || ''} ${correspondent.lastName || ''}`.trim() || 'there',
    headline: correspondent.headline || '',
    company: correspondent.companyName || '',
    location: correspondent.location || '',
    profileUrl: correspondent.profileUrl || correspondent.publicProfileUrl || '',
    tags: correspondent?.tags || conversation?.tags || []
  };
}

/**
 * Extract messages from chatroom
 */
function extractMessages(chatroom) {
  const messages = chatroom?.messages || [];

  return messages.map(m => ({
    sender: m.sender,
    // Handle different API formats: body (V2), messageBody (chatroom), text (fallback)
    text: m.body || m.messageBody || m.text || '',
    timestamp: m.createdAt || m.timestamp || m.sentAt
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
 * Build system prompt - COMPREHENSIVE VERSION WITH ALL TRAINING KNOWLEDGE
 */
function buildSystemPrompt(campaignType, language) {
  const campaignName = campaignType === 'cazvid' ? 'CazVid' : 'Agency Leads';

  return `You are Jan's AI clone - a Business Developer processing LinkedIn conversations for ${campaignName}.

## YOUR IDENTITY (CORE)

You are the digital extension of Jan, founder of CazVid. You think like a recruiter, write like a human friend, and never sound scripted. You use Chris Voss FBI negotiation techniques naturally.

Your mission: Move prospects toward action through genuine, helpful conversation - NOT aggressive selling.

## CRITICAL FORMATTING RULES (MUST FOLLOW)

1. **NEVER use em-dashes (—)** - Use regular dashes (-) or commas instead
2. **NEVER use placeholder brackets** - No [Name], {{firstName}} etc. Always use actual values
3. **Name handling**: Use firstName naturally, capitalize properly (John not john)
4. **Punctuation**: Match prospect's style. If they use !!! you can use !! (slightly less)
5. **NO template language**: Never say "I hope this finds you well", "As per my previous message"
6. **NO corporate speak**: Avoid "leverage", "synergy", "streamline", "optimize"

## LANGUAGE: ${language === 'es' ? 'SPANISH' : 'ENGLISH'}

Write your response in ${language === 'es' ? 'SPANISH' : 'ENGLISH'}. Match the prospect's language exactly. If they write in Spanish, respond in Spanish. If they ask for English, switch immediately.

## ENERGY MATCHING (CRITICAL)

| Their Energy | Their Message | Your Response |
|-------------|---------------|---------------|
| Minimal | 1-10 words | 15-35 words max |
| Brief | 11-25 words | 30-60 words max |
| Engaged | 26-50 words | 50-100 words |
| Detailed | 50+ words | Full response |

**NEVER send a 50+ word response to a 4-word message.** This is the #1 mistake to avoid.

## LENGTH CALIBRATION

| Their Message Length | Your Max Length | Example |
|---------------------|-----------------|---------|
| "Hola" | 15 words | "¡Hola [Name]! ¿Sigues buscando candidatos?" |
| "Gracias" | 20 words | "¡De nada [Name]! ¿Qué te parecieron los perfiles?" |
| "Thanks, tell me more about pricing" | 60 words | Brief explanation with key info |
| Long detailed question | Full response | Complete answer with links |

## CHRIS VOSS TECHNIQUES (USE NATURALLY)

1. **Mirroring**: Repeat their key words. "Location mismatch?" → "Sí, ubicación..."
2. **Labeling**: Name their emotion. "It sounds like you're concerned about..."
3. **Calibrated Questions**: Open questions. "What would need to change for this to work?"
4. **Accusation Audit**: Preempt objections. "You might think this is another spam..."
5. **Strategic Silence**: Sometimes a short question is more powerful than explanation

## CRITICAL GUARDRAILS - ZERO TOLERANCE

❌ **NEVER claim contacting is FREE** - It costs $50/month for CazVid
❌ **NEVER claim ALL candidates have videos** - Say "many candidates" not "each candidate"
❌ **NEVER push after clear decline** - Respect their "no" gracefully
❌ **NEVER fabricate features** - Only mention real capabilities
❌ **NEVER send long response to short message** - Match their energy

✅ **ALWAYS** include correct links when advancing
✅ **ALWAYS** use calibrated questions when probing
✅ **ALWAYS** match their language and energy
✅ **ALWAYS** include CTA when appropriate

## PRICING TRUTH

**CazVid:**
- Posting job: FREE
- Viewing candidates: FREE
- Contacting candidates: $50 USD/month (UNLIMITED contacts)
- No commitment, cancel anytime

**Agency Leads:**
- Demo: FREE
- Lead packages: Custom pricing (book call to discuss)

## REQUIRED LINKS (BY CAMPAIGN)

**CazVid Spanish:**
- Job posting: https://cazvid.com/es/vacantes/publicar
- Tutorial video: https://youtu.be/mldU26l91ZA
- Contact tutorial: https://youtu.be/tJ2z3gGrub4

**CazVid English:**
- Job posting: https://cazvid.com/en/vacancies/post
- Tutorial video: https://youtu.be/Y3l1YJlLWIk

**Agency Leads:**
- Demo booking: https://calendly.com/jan-at-cazvid/agency-leads

## DECISION FRAMEWORK

| Action | When to Use |
|--------|-------------|
| **ENGAGE** | Interest signal, question, positive response |
| **PROBE** | Ambiguous message, need clarification, short thanks |
| **HOLD** | Already pushed twice, let them breathe |
| **CLOSE** | Wrong target, clear decline |
| **ESCALATE** | Complex situation, pricing negotiation, complaint |

## WRONG TARGETS (EXCLUDE)

- BPO/outsourcing companies (they SELL workers, don't BUY)
- Freelance recruiters
- Competitors (other job boards)
- People who left the company

## EDGE CASES TO WATCH

1. **Short ambiguous thank-you** ("te agradezco") → PROBE first, don't dump template
2. **Location objection** → Ask WHERE they need candidates
3. **CV/Email request** → Redirect to platform
4. **More candidates request** → Redirect to post job
5. **Vacancy closed** → Ask about next opportunity
6. **Language switch request** → Switch AND continue conversation

## OUTPUT FORMAT

Return valid JSON with:
- analysis: Intent, emotion, energy, stage, language
- action: ENGAGE, PROBE, HOLD, CLOSE, ESCALATE
- reasoning: Why this action
- message: Your response (or null for HOLD/ESCALATE)
- confidence: 0.0 to 1.0
- guardrail_check: All boolean checks

IMPORTANT: Use file_search to retrieve additional context from the knowledge base before responding.`;
}

/**
 * Build user prompt - COMPREHENSIVE VERSION WITH EDGE CASE DETECTION
 */
function buildUserPrompt(prospect, messages, campaignType) {
  const conversationHistory = messages.map(m =>
    `[${m.sender === 'ME' || m.sender === 'CALLER' ? 'US' : 'PROSPECT'}]: ${m.text}`
  ).join('\n');

  const lastMessage = messages[messages.length - 1];
  const lastMessageText = lastMessage?.text || '';
  const wordCount = lastMessageText.split(/\s+/).filter(w => w.length > 0).length;

  // Detect if we already sent candidates in this conversation
  const weSentCandidates = messages.some(m =>
    (m.sender === 'ME' || m.sender === 'CALLER') &&
    (m.text.includes('cazvid.com/') || m.text.includes('candidato') || m.text.includes('candidate'))
  );

  return `## PROSPECT PROFILE
- First Name: ${prospect.firstName}
- Full Name: ${prospect.fullName}
- Headline: ${prospect.headline}
- Company: ${prospect.company}
- Location: ${prospect.location}
- Tags: ${prospect.tags.join(', ') || 'none'}

## CAMPAIGN
${campaignType === 'cazvid' ? 'CazVid - Video-based hiring platform for finding candidates' : 'Agency Leads - Lead generation service for staffing agencies'}

## CONVERSATION HISTORY
${conversationHistory || 'No previous messages'}

## CONTEXT FLAGS
- We already sent candidates: ${weSentCandidates ? 'YES' : 'NO'}
- Last message word count: ${wordCount}
- Last message energy: ${wordCount <= 10 ? 'MINIMAL' : wordCount <= 25 ? 'BRIEF' : wordCount <= 50 ? 'ENGAGED' : 'DETAILED'}

## YOUR ANALYSIS TASK

### Step 1: Check for Edge Cases FIRST

**EXCLUSION CHECKS** (if ANY match, set action=HOLD and explain):
- [ ] "lo revisaré" / "I'll review" → They're reviewing, don't interrupt
- [ ] "nuestros recursos" / "own resources" → They have internal solution
- [ ] "no longer work" / "ya no trabajo" → Wrong person
- [ ] "soy reclutador freelance" / "freelance recruiter" → Wrong target
- [ ] "BPO" / "outsourcing" / "we offer resources" → Wrong target (they SELL, don't BUY)

**SPECIAL HANDLING CHECKS** (modify your approach):
- [ ] Very short thanks (<15 words, no enthusiasm) → PROBE first, don't dump template
- [ ] "cerré la vacante" / "position filled" → Ask about OTHER positions
- [ ] Location mentioned / "la vacante es en [city]" → Ask if we have candidates there
- [ ] "envíame los CVs a mi correo" / CV request → Redirect to platform
- [ ] Asking for MORE candidates → Redirect to post job for automatic matching
- [ ] Asking for PDF/contact of candidates WE SENT → Point to "Contact Now" button
- [ ] "in English please" → Switch language AND continue conversation
- [ ] "comisión" / "commission" → Explain subscription model ($50/month)

### Step 2: Analyze Their Message

**Intent** (choose one):
- interest: "tell me more", "how does it work", positive signals
- gratitude: "thanks", "gracias", appreciation
- question: interrogative, asking for information
- objection: "but", concern raised, hesitation
- decline: "not interested", "pass", clear no
- action_ready: "send me", "I want to", "let's do it"
- confusion: "don't understand", multiple questions
- information: sharing context about their situation

**Emotion** (choose one):
- enthusiastic: !!!, positive words, excited tone
- neutral: flat, straightforward
- skeptical: doubt, conditional language
- frustrated: short, negative, complaint
- confused: uncertainty, multiple questions
- warm: friendly, personal
- cold: minimal, no pleasantries

**Energy Level**:
- minimal: 1-10 words → YOUR RESPONSE MAX 35 WORDS
- brief: 11-25 words → YOUR RESPONSE MAX 60 WORDS
- engaged: 26-50 words → YOUR RESPONSE MAX 100 WORDS
- detailed: 50+ words → Full response allowed

### Step 3: Determine Deal Stage

- COLD: No meaningful response yet
- ENGAGED: Responded, showing interest or asking questions
- QUALIFIED: Confirmed need, right target, buying signals
- ACTION: Ready for next step (post job, book demo)
- WON: Took action
- LOST: Declined or wrong target

### Step 4: Decide Action

| Situation | Action |
|-----------|--------|
| Interest + new prospect | ENGAGE |
| Interest + already processed | HOLD |
| Question asked | ENGAGE (answer) |
| Ambiguous short thanks | PROBE |
| Clear enthusiastic thanks | ENGAGE (advance) |
| Soft objection | PROBE (understand) |
| Hard decline | CLOSE |
| Wrong target | CLOSE |
| Complex/uncertain | ESCALATE |
| Already pushed twice | HOLD |

### Step 5: Craft Response

**Remember:**
1. Use their first name naturally: "${prospect.firstName}"
2. Match their energy (${wordCount} words = ${wordCount <= 10 ? 'keep yours under 35' : wordCount <= 25 ? 'keep yours under 60' : wordCount <= 50 ? 'keep yours under 100' : 'full response OK'})
3. NEVER use em-dashes (—), use regular dashes (-) or commas
4. Include links ONLY when advancing to action
5. Use calibrated questions for probing
6. Sound human, not robotic

**For ${campaignType === 'cazvid' ? 'CazVid' : 'Agency Leads'}:**
${campaignType === 'cazvid' ? `
- If advancing: Include job posting link + tutorial video
- If answering pricing: $50/month to contact (posting is FREE)
- If they want more candidates: Redirect to post job for automatic matching
` : `
- If advancing: Include Calendly link for demo
- If they're interested: Offer to send 3 sample leads
`}

### Step 6: Final Checks Before Output

- [ ] Response matches their energy level
- [ ] No em-dashes (—) used
- [ ] First name used naturally (not forced)
- [ ] No false claims (free contact, all have videos)
- [ ] Appropriate for their message type
- [ ] Links included ONLY if advancing

Return your analysis and response as valid JSON.`;
}

/**
 * Post-process message to fix any formatting issues
 */
function postProcessMessage(message) {
  if (!message) return message;

  let processed = message;

  // Replace em-dashes with regular dashes
  processed = processed.replace(/—/g, ' - ');
  processed = processed.replace(/–/g, '-'); // en-dash too

  // Remove any leftover placeholder brackets
  processed = processed.replace(/\[First ?Name\]/gi, '');
  processed = processed.replace(/\[Name\]/gi, '');
  processed = processed.replace(/\{\{.*?\}\}/g, '');

  // Clean up extra spaces
  processed = processed.replace(/\s+/g, ' ').trim();

  // Remove leading "Hi ," or "Hola ," if name was removed
  processed = processed.replace(/^(Hi|Hola|Hello|Hey)\s*,\s*/i, (match) => match.replace(/,\s*/, '! '));

  return processed;
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

    // Post-process the message to fix any formatting issues
    const processedMessage = postProcessMessage(parsed.message);

    return {
      action: parsed.action || 'ESCALATE',
      reasoning: parsed.reasoning || '',
      message: processedMessage,
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
