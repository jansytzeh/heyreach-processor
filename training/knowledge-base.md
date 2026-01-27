# HeyReach AI Training Knowledge Base

> Last Updated: 2026-01-12
> Version: 3.3.0

This document contains accumulated learnings from training sessions. Combined with `agent-persona.md`, it forms the agent's intelligence.

---

## Architecture Reference (v3.0)

As of v3.0, the system uses an **intelligent Business Developer Agent**, not templates.

| File | Purpose |
|------|---------|
| `agent-persona.md` | Agent identity, decision framework, Chris Voss techniques |
| `config.md` | Settings, links, guardrails |
| `process-heyreach.md` | Processing workflow |
| `conversation-analysis-framework.md` | Analysis methodology |
| `deal-tracking.md` | Pipeline stage system |

**The agent analyzes each conversation contextually and crafts intelligent responses.**

---

## Hierarchy of Goals (CRITICAL)

> Added: 2026-01-12 | Source: Jan's direct feedback on conversation handling

**Understanding the conversion funnel is ESSENTIAL for crafting effective responses.**

| Priority | Goal | How It Happens | Why It Matters |
|----------|------|----------------|----------------|
| **1. POST A JOB** | Get them to post a job on CazVid | Via platform OR direct link | Entry point - even before signup |
| **2. SIGN UP** | Get them to sign up for CazVid | Auto-signup on posting OR login prompt when contacting | Creates account relationship |
| **3. CONTACT CANDIDATES** | Get them to pay $50/month and contact candidates | After seeing candidates they want | Highest value but hardest to achieve |

**Critical Insight:** Posting a job can happen BEFORE signup (the post triggers signup). Contacting a candidate requires login, which prompts signup. Everything leads to the ultimate goal: **getting them to contact candidates**.

### How This Affects Messaging

1. **Primary CTA = Post a Job** (most accessible)
   - "Post your job for free here: [link]"
   - This triggers the signup naturally

2. **Secondary CTA = Contact Candidates** (if they've seen profiles)
   - Use video tutorials to explain how
   - Spanish: https://youtu.be/c0E8sfSFqeM
   - English: https://youtu.be/mldU26l91ZA

3. **ALWAYS include a CTA** - Never send a message without directing them toward an action

### Video Tutorial URLs

| Language | URL | When to Use |
|----------|-----|-------------|
| **Spanish** | https://youtu.be/c0E8sfSFqeM | When explaining how to contact candidates (ES) |
| **English** | https://youtu.be/mldU26l91ZA | When explaining how to contact candidates (EN) |

**Use these videos when:**
- Prospect asks how to contact candidates
- Prospect asks about next steps after seeing profiles
- Closing a conversation where they seem interested

---

## Core Principles (Preserved from Training)

| Principle | Description |
|-----------|-------------|
| **Match their energy** | Enthusiastic message (!!!) → enthusiastic response |
| **Vary openings** | Use different opening phrases naturally |
| **Be conversational** | Write like a real person, not a bot |
| **ALWAYS include required elements** | Links and CTAs when advancing to action |
| **Personalize beyond name** | Reference their specific context when possible |

## Critical Guardrails (See also: `agent-persona.md` and `config.md`)

| Guardrail | Consequence if Violated |
|-----------|------------------------|
| **NEVER fabricate features** | False claims like "video profile" damage trust |
| **NEVER claim contacting is FREE** | Contacting candidates costs $50/month |
| **NEVER skip required links** | Missing links = failed conversion opportunity |
| **NEVER skip YouTube tutorial** | Missing tutorial = confused prospect |
| **NEVER push after clear decline** | Damages reputation |
| **ALWAYS include a CTA** | Every message must drive action - no "dead end" messages |
| **NEVER give up too soon** | If they seem covered, offer demo/challenge (see EC-061) |
| **ALWAYS use conversation context** | Don't ask questions already answered in history |

### CazVid Pricing Truth

| FREE | PAID ($50/month) |
|------|------------------|
| Posting jobs | Contacting candidates |
| Browsing candidates | Sending messages |
| Viewing video overviews | Accessing contact info |
| Receiving applications | - |

**Correct:** "Free to post, free to browse, subscription when ready to contact"

### What Varies vs. What MUST Stay Constant

| Can Vary | MUST Stay Constant |
|----------|-------------------|
| Opening phrases | Job posting link (share.cazvid.app) |
| Sentence structure | YouTube tutorial link |
| Enthusiasm level | CTA format ("Which candidate would you like me to connect you with?") |
| Greeting style | All required elements from config.md |

### BAD Example (What Caused v2.0.0 Fix)

```
You're welcome Saloni! Let me know if any of the Native English Speaker candidates look promising. Each one has a video profile so you can evaluate their communication before reaching out. Would you like me to find more candidates?
```
↑ WRONG: Fabricated "video profile", missing links, wrong CTA

---

## Key Definitions

| Term | Definition |
|------|------------|
| **Seen** | Conversation has been handled (by AI or Jan) |
| **Unseen** | Conversation needs handling |
| **Jan** | Business developer who manages HeyReach and handles conversations manually |
| **AI Handling** | Automated response using templated messages |

## Campaign Identification

Use **either** method - both are valid. Old campaigns may have different IDs.

| Campaign Type | Known IDs | Content Detection |
|---------------|-----------|-------------------|
| **Agency Leads** | `223998`, `240191` | "agency-leads.com" links |
| **CazVid** | Others | "cazvid.com" or "cazvid.app" links |

> If campaign ID is unknown, always verify with content detection.

## Training Data Sources

| Source | Purpose | How to Access |
|--------|---------|---------------|
| **Tagged Conversations** | Learn what AI did right/wrong | Filter by `correspondentProfile.tags` |
| **Jan's Manual Responses** | Learn expert communication style | Filter for tag: `Manual Handled Jan` |
| **Prospect Reactions** | Learn what messaging works | Analyze responses to our messages |

> **API Note:** Tags are included in conversation responses at `correspondentProfile.tags` (array of strings). Filter conversations by checking this field for the desired tag(s).

## HeyReach API Response Structure

### CRITICAL: Required API Parameters (ERR-008)

> **Despite being labeled "optional" in the schema, these parameters are REQUIRED or the API will fail silently.**

| API Call | Required Parameters |
|----------|---------------------|
| `get_conversations_v2` | `linkedInAccountIds` (array), `campaignIds` (array) |
| `get_all_campaigns` | `statuses` (array), `accountIds` (array) |

**Always reference `config.md` → "API Required Parameters" section for current IDs.**

Example working call:
```json
{
  "linkedInAccountIds": [93126, 94526, 94527, ...],
  "campaignIds": [223998, 240191, 274509, ...],
  "seen": false,
  "limit": 50
}
```

### Conversation Object (from `get_conversations_v2`)

```
{
  "id": "conversation-id",
  "read": true/false,
  "lastMessageAt": "ISO-datetime",
  "lastMessageText": "string",
  "lastMessageSender": "ME" | "CORRESPONDENT",
  "totalMessages": number,
  "campaignId": number,
  "linkedInAccountId": number,
  "correspondentProfile": {
    "linkedin_id": "string",
    "profileUrl": "https://linkedin.com/in/...",
    "firstName": "string",
    "lastName": "string",
    "tags": ["Tag1", "Tag2"],  // <-- TAGS ARE HERE
    "customFields": [{"name": "...", "value": "..."}]
  },
  "linkedInAccount": {
    "id": number,
    "firstName": "string",
    "lastName": "string"  // <-- Use for UTM campaign parameter
  },
  "messages": [
    {
      "createdAt": "ISO-datetime",
      "body": "message text",
      "sender": "ME" | "CORRESPONDENT"
    }
  ]
}
```

> **Reference:** See `heyReachApiDocumentation.md` for complete API documentation.

### Handling Large API Responses

When API responses exceed token limits, they're saved to a file. The file format is:
```json
[{"type": "text", "text": "{\"totalCount\":...,\"items\":[...]}"}]
```

**To parse correctly:**
```python
import json
with open(filepath, 'r') as f:
    wrapper = json.load(f)
    data = json.loads(wrapper[0]['text'])  # Parse the nested JSON string
    conversations = data['items']
    for conv in conversations:
        tags = conv.get('correspondentProfile', {}).get('tags', [])
```

**Best practice:** Use smaller limits (e.g., `limit: 25`) to avoid file saves and keep responses in-context.

**Log storage:** When large responses must be saved, store them in `training/api-logs/` with naming convention:
`YYYY-MM-DD_HH-MM_<operation>_<details>.json`

## Training Infrastructure

| Folder | Purpose |
|--------|---------|
| `training/sessions/` | High-level session summaries (outcomes, decisions) |
| `training/run-logs/` | Detailed execution logs (step-by-step, debugging) |
| `training/api-logs/` | Raw API response data (large files) |

> **Run logs are mandatory** for every `/process-heyreach` and `/train-heyreach` execution. See `training/run-logs/README.md` for templates.

## HeyReach Tags

### Handling Tags (Who Responded)

| Tag | Meaning |
|-----|---------|
| `AI Input` | AI contributed to this conversation |
| `Manual Handled Jan` | Jan handled this manually |
| Both tags | Collaboration - AI started, Jan refined (or vice versa) |

### Quality Tags (How Well - Optional)

| Tag | When to Use |
|-----|-------------|
| `Good AI Handling` | AI did well on a tricky case (optional) |
| `Bad AI Handling` | AI made a mistake - always tag these |
| `Mediocre AI Handling` | Could be better |

### Training Value

| Combination | Training Use |
|-------------|--------------|
| `AI Input` only | Evaluate AI performance |
| `Manual Handled Jan` only | Learn Jan's communication style |
| Both tags | Understand handoff patterns, when AI needs human help |

---

## Response Quality Patterns

### What Makes a GOOD Response

| Pattern | Description | Example |
|---------|-------------|---------|
| Correct trigger detection | Message correctly identified as matching response type | "gracias" → Spanish thank-you |
| Proper exclusion | Correctly skipped messages that seem like triggers but aren't | "gracias, ya cerré la vacante" → excluded |
| Right campaign match | Verified campaign type before sending (CazVid vs Agency Leads) | Checked for cazvid.app link |
| Appropriate personalization | Used correct first name and sender last name | "De nada María" with correct UTM |
| **Energy matching** | Response tone matches prospect's enthusiasm | "!!!!" in message → enthusiastic reply |
| **Natural variation** | Opening/phrasing differs from previous responses | "¡Con gusto!" instead of always "De nada" |
| **Conversational flow** | Feels like human wrote it, not copy-pasted | References their specific context |

### What Makes a BAD Response

| Pattern | Description | Example |
|---------|-------------|---------|
| False positive trigger | Sent response when shouldn't have | Responded to "gracias pero no me interesa" |
| Wrong campaign template | Sent CazVid template to Agency Leads conversation | - |
| Missed exclusion | Didn't catch obvious exclusion phrase | Responded to vacancy closed message |
| Double response | Sent message to already-processed conversation | - |
| **Robotic/identical** | Same exact phrasing as previous messages | Always starts "De nada [Name]," |
| **Energy mismatch** | Flat response to enthusiastic message | Brief reply to "!!!! Thanks so much!!!!" |
| **Missing required elements** | Forgot link, CTA, or key information | No share.cazvid.app link included |

### What Makes a MEDIOCRE Response

| Pattern | Description | Example |
|---------|-------------|---------|
| Technically correct but suboptimal timing | Right message but could have waited for more context | - |
| Correct but could be better personalized | Template was right but missed opportunity | - |
| Edge case uncertainty | Processed when manual review would be better | - |

---

## Learned Trigger Phrases

### CazVid Thank-You (Spanish)
**Include:** gracias, muchas gracias, mil gracias, te agradezco, muy amable
**Exclude:** gracias pero, gracias sin embargo, ya cerré, lo revisaré, soy freelance

### CazVid Thank-You (English)
**Include:** thanks, thank you, thx, appreciate it, ty
**Exclude:** thanks but, no thanks, thanks anyway, role closed, I'll review

### Agency Leads Decline
**Include:** not interested, no thanks, I'm ok, I'm good, pass, no thank you, not for me
**Exclude:** not interested right now (timing signal), not interested in X specifically

### Agency Leads Sample Request
**Include:** send me, yes please, sounds good, I'd like to see, show me, let's see them
**Exclude:** sure (too vague), maybe, I'm not sure

### CazVid Info Request (Spanish)
**Include:** cómo funciona, como funciona, más información, cuánto cuesta, qué es cazvid, explícame
**Exclude:** (none yet)

---

## Edge Cases Registry

> Edge cases are documented in detail in `edge-cases.md`

| ID | Category | Short Description | Handling |
|----|----------|-------------------|----------|
| EC-001 | ~~Thank-You~~ Vacancy Closed | Vacancy closed with thanks | ~~EXCLUDE~~ **RESPOND** - ask about next opportunity |
| EC-002 | Thank-You | Will review response | EXCLUDE - already engaged |
| EC-003 | Thank-You | Wrong target (freelancer) | EXCLUDE - misqualified |
| EC-004 | ~~Thank-You~~ Location | Location mismatch | ~~EXCLUDE~~ **RESPOND** - offer local candidates |
| EC-005 | Decline | "Not interested" + reason | MANUAL - needs custom response |
| EC-006 | Sample | Vague affirmative | EXCLUDE - need clearer signal |
| EC-040 | Casual Greeting | Short greeting only | **RESPOND** - redirect to business |
| EC-041 | CV/Email Request | Send CVs to email | **RESPOND** - redirect to platform |
| EC-042 | Location (Variant) | Multiple cities mentioned | **RESPOND** - clarify priority |
| EC-043 | Info Request (Variant) | Commission question | **RESPOND** - explain subscription model |
| EC-044 | Decline (Variant) | Very short decline | **RESPOND** - probe deeper with empathy |
| EC-045 | Thank-You (Ambiguous) | Short ambiguous thank-you | **RESPOND** - probe first with calibrated question |
| EC-046 | Agency Leads (Wrong Target) | BPO/Outsourcing company | **EXCLUDE** - they sell workers, don't buy |
| EC-047 | Location (After Rejection) | "No cumplen" after profiles sent | **RESPOND** - probe first, NO platform push |
| EC-048 | CazVid (False Info) | Video profile claim | **NEVER** - don't claim all have video profiles |
| EC-049 | Language Detection | Non-LATAM/Spain prospect | **FIX** - check prospect location, not candidate |
| EC-050 | Language Switch | "Can we communicate in English?" | **RESPOND** - switch AND continue business |
| EC-051 | Request Misclassification | PDF Request vs CV/Email Request | **CHECK HISTORY** - if candidates sent, use PDF Request |
| EC-052 | More Candidates Request | "Send me more candidates" | **RESPOND** - redirect to POST A JOB for automatic flow |
| EC-053 | Recruiter CazVid Pitch | Recruiter asks about CazVid | **RESPOND** - add recruiter-specific value (unlimited posts, scale) |
| EC-054 | Job Seeker | "Looking for a job" / "Busco trabajo" | **REDIRECT** - send to cazvid.app.link for job seeker registration |
| EC-055 | Link Trust Question | "Is this link safe/trust?" | **RESPOND** - confirm official, explain UTM, offer Google search alternative |
| EC-056 | Platform Hesitation | "Not looking to join platforms" | **RESPOND** - address friction (just email, no subscription required) |
| EC-057 | Not Decision Maker | "I'm not involved in purchasing" | **RESPOND** - ask for referral to right person |
| EC-058 | Wrong Company Info | "I don't work at [Company]" | **RESPOND** - acknowledge briefly, ask if still in role |
| EC-059 | Phone Number Request | "Can I call you?" / "What's your number?" | **RESPOND** - provide phone + WhatsApp, still redirect to platform |
| EC-060 | Counter-Pitch | Someone pitches their services TO us | **RESPOND** - polite decline, pivot to CazVid as alternative |
| EC-061 | Gave Up Too Soon | "All set" / "Candidate scarce market" | **CHALLENGE** - offer demo game, don't close conversation |
| EC-062 | Missing CTA | Message lacks call-to-action | **GUARDRAIL** - always include CTA in every message |
| EC-063 | Context Not Used | Ask question already answered | **GUARDRAIL** - check history before asking questions |
| EC-064 | Demo Request (Inbound) | "Can we schedule a call?" | **RESPOND** - offer weekly webinar link (CazVid only, inbound only) |

---

## Response Guidelines Evolution

> Note: As of v1.7.0, we use **Response Guidelines** not strict templates. Each message is generated fresh.

### CazVid Thank-You (Spanish)
- **v1.0** (2026-01-03): Initial template with YouTube link
- **v1.7** (2026-01-03): Converted to Response Guidelines with opening variations

### CazVid Thank-You (English)
- **v1.0** (2026-01-03): Initial template with YouTube link
- **v1.7** (2026-01-03): Converted to Response Guidelines with opening variations

### Agency Leads Decline
- **v1.0** (2026-01-03): Initial "timing, fit, or need" template
- **v1.1** (2026-01-03): Changed "reach out" to "pitch"
- **v1.7** (2026-01-03): Converted to Response Guidelines

### Agency Leads Sample Request
- **v1.0** (2026-01-03): Initial 3-lead sample template
- **v1.7** (2026-01-03): Converted to Response Guidelines

### CazVid Info Request
- **v1.0** (2026-01-03): Initial pricing explanation template
- **v1.7** (2026-01-03): Converted to Response Guidelines

### Vacancy Closed (NEW)
- **v1.0** (2026-01-03): Added from Jan's patterns - ask about next opportunity

### Casual Greeting (NEW)
- **v1.0** (2026-01-03): Added from Jan's patterns - redirect to business

### CV/Email Request (NEW)
- **v1.0** (2026-01-03): Added from Jan's patterns - redirect to platform

### Location Objection (NEW)
- **v1.0** (2026-01-03): Added from Jan's patterns - offer local candidates

---

## Confidence Thresholds

| Confidence Level | Action |
|------------------|--------|
| HIGH (>90%) | Process automatically |
| MEDIUM (70-90%) | Process but flag for review |
| LOW (<70%) | Skip - needs manual handling |

### Confidence Signals

**Increases confidence:**
- Short message (<50 chars)
- Single clear trigger phrase
- No exclusion phrases present
- Clear campaign identification

**Decreases confidence:**
- Long message (>100 chars)
- Multiple topics/questions
- Mixed signals (thanks + but)
- Unclear campaign type

---

## Training Statistics

| Metric | Value |
|--------|-------|
| Total conversations analyzed | 43 |
| Excellent AI Handling | 4 |
| Good AI Handling | 33 |
| Bad AI Handling | 4 |
| Mediocre AI Handling | 5 |
| Accuracy rate | 86% |

### Breakdown by Response Type
| Response Type | Excellent | Good | Bad | Mediocre |
|---------------|-----------|------|-----|----------|
| CazVid Thank-You (ES) | 1 | 17 | 0 | 0 |
| CazVid Thank-You (EN) | 0 | 6 | 0 | 0 |
| Vacancy Closed | 1 | 4 | 0 | 1 |
| Agency Leads Decline | 1 | 3 | 0 | 0 |
| Agency Leads Sample | 0 | 2 | 0 | 0 |
| CV/Resume Request | 0 | 1 | 0 | 0 |
| Location Objection | 0 | 0 | 1 | 1 |
| Info Request | 1 | 0 | 1 | 1 |
| PDF Request | 0 | 0 | 2 | 0 |
| Dual-Intent (Vacancy+Info) | 1 | 0 | 0 | 0 |
| Will Review (Exclusion) | 0 | 0 | 0 | 1 |

---

## Notes from Training Sessions

> Recent learnings are added here during training sessions

### Session 1 (2026-01-03)
- Initial setup
- Established base patterns from manual testing
- No tagged conversations reviewed yet

### Session 2 (2026-01-03) - Review Tagged Conversations
- Reviewed 9 conversations tagged "Good AI Handling"
- All were CazVid Thank-You responses (7 Spanish, 2 English)
- **Confirmed success patterns:**
  - Name personalization works correctly (uses lead's name, not sender's)
  - Language detection accurate across all cases
  - Prefix handling works ("Hola", "Okay" don't interfere)
  - Enthusiasm (!!!!) doesn't break detection
  - Context phrases ("por la referencia") don't block triggers
- No Bad or Mediocre cases found in this batch
- Recommendation: Tag more edge cases for future review

### Session 4 (2026-01-05) - Review Mediocre AI Handling
- Reviewed 1 conversation tagged "Mediocre AI Handling"
- **Lead:** PATRICIA CHIPEL (Vacancy Closed response)
- **Problems Found:**
  1. **Fabricated context:** AI said "qué bueno que los dejaste en cartera" - prospect never mentioned this
  2. **ALL CAPS name:** Used "PATRICIA" instead of "Patricia" - looks robotic
  3. **Overly wordy:** Response was too long compared to Jan's simple pattern
- **Fixes Applied:**
  - Added Core Principle #6: Never fabricate context
  - Added Core Principle #7: Fix name capitalization
  - Updated Vacancy Closed guidelines with CRITICAL RULES
  - Added BAD Example to avoid
  - Added new trigger: "la he completado"
- **Quality Score:** 68/100 (Grade D)
- **Key Insight:** Simplicity beats embellishment - stick to what they actually said

### Session 3 (2026-01-03) - Learn from Jan's Manual Responses
- Reviewed 8 conversations tagged "Manual Handled Jan"
- **Major paradigm shift discovered:**
  - Previous exclusions should be active response types
  - Jan doesn't give up on objections - he redirects

- **New Response Types Added (4):**
  1. **Vacancy Closed** - Ask about next opportunity instead of ending
  2. **Casual Greeting** - Redirect to business instead of ignoring
  3. **CV/Email Request** - Redirect to platform instead of sending directly
  4. **Location Objection** - Offer local candidates instead of giving up

- **Key Jan Patterns Learned:**
  | Pattern | Jan's Approach |
  |---------|----------------|
  | Never refuse | Always "yes, and..." with platform as prerequisite |
  | Probe deeper | Ask "timing or not hiring?" on declines |
  | Forward-looking | "If things change, happy to reconnect" |
  | Transparency | Explain pricing model clearly, no hidden fees |
  | Next opportunity | Always ask about other positions |

- **Edge Cases Updated:**
  - EC-001: Vacancy Closed → now RESPOND (was EXCLUDE)
  - EC-004: Location Mismatch → now RESPOND (was EXCLUDE)
  - EC-040 to EC-044: New edge cases added

- **Config.md Updates:**
  - Added 4 new response types to Response Types table
  - Added Already Processed Detection patterns
  - Added full Response Guidelines sections
  - Updated Exclusion Keywords with conversion notes

### Session 5 (2026-01-07) - Review All Tagged Conversations
- Reviewed 12 conversations with quality tags (found at API offset 100-200)
- **Distribution:** 1 Excellent, 7 Good, 2 Mediocre, 2 Bad

**Excellent AI Handling (1):**
- Letícia Alves: Info Request for new vacancy (SAP BTP in Spain) - Matched warm greeting, acknowledged specific question, pivoted naturally to platform

**Good AI Handling Highlights (7):**
- Edgar Orozco: Vacancy Closed → Perfect EC-001 application
- Paul Saez: Short Thank-You "Gracias" → Perfect EC-045 probe ("¿Qué te parecieron los perfiles?")
- Chris Relth: Sample Request → Delivered samples + offered specific meeting times
- Matt Mynard: Decline → Appreciative, asked for reason, offered to stop contacting

**CRITICAL ISSUE FOUND - BPO vs Staffing Confusion:**
- Mel Labay conversation tagged "Bad AI Handling"
- **Problem:** AI said "Yes, Agency Leads helps companies like yours" to a BPO company
- **Reality:** Agency Leads is for STAFFING AGENCIES that PLACE candidates, not BPO companies that SELL outsourcing services
- **Root Cause:** AI doesn't distinguish between:
  - Staffing Agency: Places candidates at client companies (OUR TARGET)
  - BPO Company: Provides their own employees as a service (NOT our target)
- **Detection needed:** Phrases like "BPO", "outsourcing", "provide resources from", "hub in Philippines"
- **Correct Response:** "Actually Mel, Agency Leads is designed for recruitment agencies. Since you're offering BPO services, it might not be the right fit."

**Location Objection Issue:**
- Macarena Gutierrez conversation tagged "Bad AI Handling"
- **Problem:** AI pushed platform signup AFTER she said profiles don't meet requirements
- **Should have:** Asked which location she needs before suggesting any action
- **Key Learning:** When someone says "no cumplen" (don't meet requirements), FIRST acknowledge and ask for clarification, THEN offer to help

**Quality Tags Now Working:**
- Tags found at offset 100-200 in API responses
- Recent conversations (offset 0-50) had no quality tags applied yet
- Recommendation: Apply quality tags more frequently during manual review

### Session 6 (2026-01-07) - Analyze Prospect Reactions (Mode 3)
- Analyzed 10 unseen conversations with prospect replies

**Reaction Summary:**
| Category | Count | Examples |
|----------|-------|----------|
| Positive | 3 | Silpa Nayak (wants to call!), Valeria Frias (enthusiastic), Joy Okpala (wants more) |
| Neutral | 3 | Faustino Merlo, Priscila Coccaro, Tharik Basha |
| Decline | 2 | Saffron Ramsey, Luke Dexter (both Agency Leads) |
| Language Issue | 2 | Dhanshree Gade (India), Jordan Dahlquist (Cyprus) |

**CRITICAL ISSUE 1 - False Video Profile Claim (EC-048):**
- Joy Sharon Okpala conversation tagged "Very Bad AI Handling"
- **AI claimed:** "Each candidate on CazVid has a video profile"
- **Reality:** NOT all candidates have video profiles - this is FALSE
- **Impact:** Makes promises we can't keep, damages trust
- **Fix:** Never claim "each/every/all" candidates have video profiles

**CRITICAL ISSUE 2 - Wrong Language Detection (EC-049):**
- Jordan Dahlquist (Cyprus) received Spanish message
- **His reply:** "Δεν μιλάω καλά Ισπανικά" (Greek: "I don't speak Spanish well")
- **Root cause:** Language detected from CANDIDATE locations (Brazil/LatAm), not PROSPECT location
- **Fix:** Always check prospect's location/language, not candidate locations
- **Countries needing English:** Cyprus, Greece, India, Philippines, UK, US, etc.

**NEW RESPONSE TYPE - Language Switch Request (EC-050):**
- Dhanshree Gade: "Can we communicate in English?"
- **Key insight:** This is NOT a rejection - they're still interested!
- **Correct handling:** Switch to English AND continue business conversation
- **Example:** "Of course! Did any of those candidates look like a good fit?"

**Edge Cases Added:**
- EC-048: False Video Profile Claim → NEVER claim all have video profiles
- EC-049: Wrong Language Detection → Check prospect location, not candidates
- EC-050: Language Switch Request → Switch AND continue business

**Config.md Updates:**
- Added Language Switch Request to Response Types
- Added Language Switch Response Guidelines
- Added Already Processed Detection pattern

### Session 7 (2026-01-07) - Review All Tagged Conversations
- Reviewed 21 quality-tagged conversations across offsets 0-600
- **Distribution:** 3 Excellent, 17 Good, 2 Mediocre, 2 Bad

**CRITICAL ISSUE FOUND - PDF Request vs CV/Email Request Confusion:**
- Shivani Saini (Bad): Asked "Please share me Email id and contact no" for candidates WE SENT
- Midhun M (Bad): Asked "can you share their pdf resumes" for candidates WE SENT
- **Root Cause:** AI used CV/Email Request template ("post your job...") instead of PDF Request template ("Contact Now button...")
- **The Difference:**
  | Request Type | What They Want | Correct Response |
  |--------------|----------------|------------------|
  | CV/Email Request | Send me CVs for my job | Redirect to post job |
  | PDF Request | More info about candidates YOU SENT | Point to Contact Now button |

**"Will Review" Exclusion Ignored:**
- Abbas Samay (Mediocre): Said "we will check the profiles to see who would be the best fit"
- AI sent full template with links and CTA instead of brief acknowledgment
- **Should have:** EXCLUDE or send brief "Sounds good! Let me know which ones stand out."

**Excellent Handling Examples:**
1. **George Lopez (Excellent):** Combined Vacancy Closed + Info Request seamlessly
   - His message: "ya cerramos esa búsqueda pero me interesa conocer más sobre tu plataforma"
   - AI handled BOTH intents in one natural response
2. **David Vásquez (Excellent):** Clean CazVid Thank-You execution
3. **Tami Sullivan (Excellent):** Perfect Agency Leads Decline - respectful, asked for feedback

**Edge Cases Added:**
- EC-051: PDF Request vs CV/Email Request confusion (see edge-cases.md)

**Key Learnings:**
1. When prospect asks about candidates WE ALREADY SENT → Use PDF Request template
2. When prospect says "will review/check" → EXCLUDE or minimal response
3. Dual-intent messages should address BOTH parts naturally (like George Lopez case)

### Session 8 (2026-01-12) - Learn from Jan's Manual Responses (Mode 2)
- Reviewed 11 conversations tagged "Manual Handled Jan"
- **Purpose:** Extract communication patterns from Jan's expert handling

**Conversations Analyzed:**
| Name | Situation | Jan's Pattern |
|------|-----------|---------------|
| Silpa Nayak | "Please forward your number / I'll call you" | Phone + WhatsApp + platform link |
| Sarah Jones | She pitched TO us (BPO services) | Polite decline + pivot to CazVid |
| Harlee Chapman | "Send to my email" for samples | Redirect to call for "bigger sample" |
| Sara Drake | "I don't work at Everstaff" | Acknowledge + ask if still in BD |
| Sandra Wallace | "Hi, how are you doing today?" | Answer + redirect to business |
| Mahmoud Abdelaziz | "Is this link trust?" | Confirm official + explain UTM + Google alternative |
| Hanson Raju | "Not currently recruiting" | Probe deeper: "What is stopping you?" |
| Sobia Sajid | "We are based in Karachi" (wrong location) | Confirm we have candidates there + offer |
| Daniela Volio | "Not looking to join platforms" | Address friction: just email, no subscription |
| Joanna Toro | "I'm not involved in purchasing" | Ask for referral to right person |
| Reid Orlando | "No thank you" | Standard timing/fit/need + "I'll tag correctly" |

**New Patterns Discovered (6):**

1. **Phone Number Request (EC-059)**
   - Provide phone + WhatsApp: +16233047338
   - Still redirect to platform

2. **Counter-Pitch (EC-060)**
   - Polite decline: "thanks but this does not apply to me"
   - Pivot to CazVid as alternative

3. **Link Trust Question (EC-055)**
   - Confirm legitimacy
   - Explain UTM = marketing tracking
   - Offer Google search alternative

4. **Platform Hesitation (EC-056)**
   - Address friction: "just email, no subscription"
   - Soft language: "Might you feel it appropriate"

5. **Not Decision Maker (EC-057)**
   - Short acknowledgment: "Sounds good"
   - Direct referral request: "Is there any specific person I should reach out to?"

6. **Wrong Company Info (EC-058)**
   - Brief acknowledgment: "Got it"
   - Clarifying question to stay in conversation
   - No excessive apology

**Key Jan Communication Principles:**
1. **Never refuse outright** - Always "yes, and..." with platform/call as next step
2. **Address objections directly** - Don't ignore friction, tackle it head-on
3. **Keep it short** - Brief acknowledgments, no over-explaining
4. **Always ask a question** - Keeps conversation alive
5. **Soft closes work** - "Let me know if...", "Might you feel it appropriate..."
6. **Warm sign-offs** - "Have a great weekend!", "Thanks for reaching out"

**Patterns Confirmed:**
- EC-040 Casual Greeting: Sandra Wallace - redirect to business immediately
- EC-004 Location Mismatch: Sobia Sajid - confirm we have candidates + offer
- Timing/Fit/Need Decline: Reid Orlando - standard pattern + "I'll tag correctly"

---

## Negotiation Philosophy (Chris Voss Framework)

> Source: "Never Split the Difference" by Chris Voss, FBI Lead International Kidnapping Negotiator
> Added: 2026-01-05

The following techniques from FBI hostage negotiation training apply directly to LinkedIn outreach conversations. These tactics work because **people are emotional, not rational decision-makers**. System 1 (emotional) guides System 2 (rational).

### Core Principle: Tactical Empathy

**Definition:** Understanding the feelings and mindset of your counterpart in the moment, and hearing what's behind those feelings.

**Application to HeyReach:**
- Before responding, identify what the prospect is *feeling*, not just what they're *saying*
- A "no thanks" might mean: fear of wasting time, bad past experience, wrong timing
- Address the underlying emotion, not just the surface objection

---

### Technique 1: Mirroring

**What it is:** Repeat the last 1-3 critical words of what someone said.

**Why it works:** Triggers the instinct to elaborate. People feel understood and will explain more.

**How to use in HeyReach:**

| Prospect Says | Mirror Response |
|---------------|-----------------|
| "We're not hiring right now" | "Not hiring right now?" |
| "I already have a recruiting partner" | "A recruiting partner?" |
| "The timing isn't great" | "The timing isn't great..." |

**Key rule:** After mirroring, **stay silent**. Let it work. Don't pile on with another question.

---

### Technique 2: Labeling

**What it is:** Verbally acknowledge someone's emotion using "It seems like..." / "It sounds like..." / "It looks like..."

**Why it works:** Labeling an emotion disrupts its intensity. It shows you understand without agreeing or disagreeing.

**How to use in HeyReach:**

| Situation | Label |
|-----------|-------|
| Prospect seems hesitant | "It sounds like you've had some frustrating experiences with recruiters before." |
| Prospect is busy | "It seems like you're juggling a lot right now." |
| Prospect declines | "It sounds like this isn't a priority at the moment." |

**Label Starters (never use "I"):**
- "It seems like..."
- "It sounds like..."
- "It looks like..."

**Why avoid "I":** "I'm hearing that..." makes it about you. "It sounds like..." keeps focus on them.

---

### Technique 3: The Accusation Audit

**What it is:** List every negative thing your counterpart could say about you BEFORE they say it.

**Why it works:** Preemptively addressing concerns neutralizes them. It's disarming.

**How to use in HeyReach:**

For cold outreach, prospects might think:
- "This is just another recruiter spam"
- "They don't actually know my needs"
- "They'll waste my time"

**Example opening:**
```
You're probably thinking "great, another recruiter message" - and I totally get that.
Most outreach is generic. But I noticed [specific detail about their role]...
```

---

### Technique 4: Getting to "That's Right"

**What it is:** Summarize their situation so well that they respond "That's right."

**Why it works:** "That's right" = breakthrough. It means they feel completely understood. It's NOT the same as "You're right" (which often means "leave me alone").

**How to use in HeyReach:**

| Goal | Approach |
|------|----------|
| Before asking for anything | Summarize their situation first |
| After an objection | Paraphrase their concern back to them |
| To build rapport | Show you understand their world |

**Example:**
```
So you're managing multiple open roles, probably getting dozens of messages from recruiters,
and you need quality candidates - not just more resumes to sort through. That's exactly why
we built this differently...
```

When they say "That's right" (or equivalent: "Exactly", "Yes, that's it"), you've earned the right to make your ask.

---

### Technique 5: Calibrated Questions

**What it is:** Open-ended questions that start with "How" or "What" - never "Why" (accusatory).

**Why it works:** Makes your counterpart solve your problems. Gives them the illusion of control while you guide the conversation.

**Power Questions for HeyReach:**

| Question | When to Use |
|----------|-------------|
| "What's the biggest challenge you're facing with hiring right now?" | Discovery |
| "How would you like me to proceed?" | After sharing info |
| "What would make this work for you?" | Handling objections |
| "How can I help make this easier?" | Building rapport |
| "What's preventing us from moving forward?" | Unsticking conversations |

**Avoid:**
- "Why don't you want to...?" (defensive)
- "Can you...?" / "Will you...?" (yes/no = easy to dismiss)
- "Do you...?" (closed-ended)

---

### Technique 6: The Late-Night FM DJ Voice

**What it is:** Slow, calm, downward-inflecting voice. In text: measured, unhurried tone.

**Why it works:** Creates calm. Signals confidence and control. Never sounds desperate.

**In written messages:**
- No exclamation overload (one "!" max per message)
- Avoid ALL CAPS
- Short sentences
- No rushed, run-on enthusiasm
- Confident, not pleading

| Instead of... | Write... |
|---------------|----------|
| "I'd LOVE to help you!! Let me know!!!" | "Happy to help. What works for you?" |
| "Please please let me know if you're interested!" | "Let me know if this fits what you need." |

---

### Technique 7: "No" is Not the End

**What it is:** Understand that "No" often means something other than rejection.

**What "No" often means:**
- "I'm not ready yet"
- "You're making me uncomfortable"
- "I don't understand"
- "I want to talk it over"
- "I need more information"

**How to respond:**

| Their "No" | Your Response |
|------------|---------------|
| "Not interested" | "What would need to change for this to be a fit?" |
| "We're all set" | "Sounds like you've got things covered. What are you using now?" |
| "Bad timing" | "Totally understand. When would be a better time to reconnect?" |

---

### Application Matrix: Techniques by Response Type

| Response Type | Primary Techniques | Example Application |
|---------------|-------------------|---------------------|
| **Thank-You** | Mirroring, Labeling | "It sounds like the profiles were helpful. Which one caught your eye?" |
| **Decline** | Labeling, Calibrated Questions | "It sounds like this isn't the right fit. Is it timing, or just not what you need?" |
| **Info Request** | Accusation Audit, Summary | Preempt pricing concerns, summarize value before asking |
| **Sample Request** | That's Right, Calibrated Q | Confirm understanding, then ask "How would you like to proceed?" |
| **Vacancy Closed** | Labeling, Forward-Looking | "It sounds like you found someone great. Any other roles coming up?" |
| **Location Objection** | Labeling, Pivot | "It sounds like location is important. We have candidates in [city] - want me to send some over?" |

---

### Key Mindset Shifts

| Old Approach | Voss Approach |
|--------------|---------------|
| Push for "yes" | Aim for "That's right" |
| Overcome objections | Understand objections first |
| Close aggressively | Let them feel in control |
| Script rigidly | Listen and adapt |
| See "no" as failure | See "no" as beginning |
| Be enthusiastic | Be calm and confident |
| Ask "Why?" | Ask "What?" and "How?" |

---

### Quick Reference Card

**Before every response, ask yourself:**

1. **What are they feeling?** (Not just saying)
2. **Can I label it?** ("It sounds like...")
3. **Can I mirror?** (Repeat their key words)
4. **Am I asking "How/What" not "Why/Can"?**
5. **Am I calm, not desperate?** (DJ voice)
6. **Have I earned the right to ask?** (Summary → "That's right" → Ask)

---

## Situational Handling Patterns

### "More Candidates" Request Pattern

> Added: 2026-01-08 | Source: Training Feedback (Cristhian Rodríguez conversation)

**Situation:** After we send candidates, prospect asks for MORE candidates.

**❌ Mediocre Handling:**
- Keep manually sending more candidate profiles
- This doesn't scale and keeps them dependent on us

**✅ Correct Handling:**
- Acknowledge their request warmly
- Point them to POST A JOB on the platform
- Explain: When you post, we automatically send it to the top 100 matching candidates
- Frame it as MORE efficient for them, not as us being lazy

**Example Response (Spanish):**
```
¡Con gusto! La mejor forma de recibir candidatos continuamente es publicar tu vacante gratis aquí: [link]

Cuando lo hagas, enviamos tu oferta automáticamente a los 100 mejores candidatos que coincidan con tus requisitos. Así recibes aplicaciones sin tener que pedir más.

¿Te ayudo con algo más?
```

**Example Response (English):**
```
Happy to help! The best way to keep receiving candidates is to post your job for free here: [link]

When you post, we automatically send it to the top 100 matching candidates. That way you'll receive applications continuously without having to ask.

Need help with anything else?
```

**Key Insight:** Manual candidate sharing is a teaser - the platform is the solution.

---

### Recruiter-Specific CazVid Value Proposition

> Added: 2026-01-08 | Source: Training Feedback (Milton Andrade Villegas conversation)

**Situation:** A RECRUITER (not hiring manager) asks about CazVid or what we offer.

**Context Detection:**
- They mention being a recruiter / reclutador
- Their headline says recruiter / headhunter / talent acquisition
- They ask about "recruiter services" or "for recruiters"

**Standard CazVid Pitch (for Hiring Managers):**
- Post jobs FREE
- We send to top 100 candidates
- Receive applications by email
- $50/month to contact directly

**Enhanced Recruiter Pitch (ONLY for recruiters):**

All the standard benefits PLUS:
- **Unlimited job posts** - Post as many jobs as you need
- **Unlimited messaging** - Contact candidates without limits
- **Wide candidate database** - Search and browse directly
- **Efficiency for volume** - Since recruiters fill MORE jobs, CazVid scales with you

**Example Addition (Spanish):**
```
Como reclutador, CazVid puede ser especialmente útil para ti - tienes publicaciones ilimitadas, mensajes ilimitados, y acceso a toda nuestra base de candidatos. Como manejas más vacantes que un gerente de RRHH típico, la plataforma escala contigo.
```

**Example Addition (English):**
```
As a recruiter, CazVid can be especially valuable - you get unlimited posts, unlimited messaging, and access to our full candidate database. Since you're filling more positions than a typical hiring manager, the platform scales with your volume.
```

**IMPORTANT:** Only add this pitch when talking to RECRUITERS. For regular hiring managers, stick to the standard value proposition.

**Do NOT confuse with Agency Leads:**
- Agency Leads = Leads to companies hiring (for staffing agencies placing candidates)
- CazVid for Recruiters = Access to candidates (for anyone hiring, but extra valuable for high-volume recruiters)

---

### Session 9 (2026-01-12) - Jan's Direct Feedback on AI Handling

> Source: Jan reviewed 4 specific conversations and provided feedback + general learnings

**Conversations Reviewed:**

| Conv ID | Issue | Feedback |
|---------|-------|----------|
| 2-Zjg2MzkwMTkt... | Missing CTA | "Message lacks a CTA. We should always send activating messages." |
| 2-ZWMxZDUzZjct... | Context ignored | "Did not use context. We asked about customer service, they said yes, then we asked if they have any job." |
| 2-YzE4ZTdkYTIt... | ✅ Good example | "No critics, just very good job here" |
| 2-MzdlZTU5YjEt... (Corey Lee) | Gave up too soon | "If he really thinks he has everything let's review it in a demo. Make it a game." |

**Critical New Framework - Hierarchy of Goals:**

Jan clarified the conversion funnel priority:

1. **POST A JOB** → Entry point (can happen before signup)
2. **SIGN UP** → Auto-triggers from posting
3. **CONTACT CANDIDATES** → Ultimate goal ($50/month)

**Key insight:** Posting triggers signup. Everything leads to contacting candidates.

**Video Tutorial URLs Added:**
- Spanish: https://youtu.be/c0E8sfSFqeM
- English: https://youtu.be/mldU26l91ZA

**New Guardrails Added:**
1. **ALWAYS include CTA** - No dead-end messages
2. **NEVER give up too soon** - Offer demo challenge instead
3. **ALWAYS use context** - Don't ask questions already answered

**Edge Cases Added:**
- EC-061: Gave Up Too Soon - When prospect says "all set" or mentions problem we solve, challenge with demo
- EC-062: Missing CTA - Every message must have an action
- EC-063: Context Not Used - Check history before asking questions

**CSV User Export Analysis:**
- Jan shared 3 CSV exports of CazVid signups
- These are users who signed up via LinkedIn outreach
- Used for tracking conversion success

**Key Jan Quotes:**
- "We should always send activating messages"
- "Make it a game" (for demo challenges)
- "The goal is to get them to contact candidates"

**Weekly Webinar Added (EC-064):**
- Spanish: Wednesdays 10:00-10:30 AM Pacific → https://calendly.com/cazvid/demo-es
- English: Wednesdays 11:00-11:30 AM Pacific → https://calendly.com/cazvid/demo-en
- **CRITICAL:** Only offer when prospect REQUESTS demo first (inbound only)
- CazVid only - not for Agency Leads
