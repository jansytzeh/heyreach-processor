# Conversation Analysis Framework

> Version: 1.0.0
> Created: 2026-01-08
> Purpose: Systematic approach for analyzing conversations and making intelligent response decisions

---

## Overview

This framework replaces rigid trigger/template matching with intelligent conversation analysis. For every conversation, follow this systematic process.

---

## Step 1: Context Gathering

### Prospect Profile Analysis

| Data Point | Where to Find | What It Tells You |
|------------|---------------|-------------------|
| **Name** | `correspondentProfile.firstName` | Personalization |
| **Full Name** | firstName + lastName | Formal context |
| **Headline** | `correspondentProfile.headline` | Role, company, seniority |
| **Location** | Profile data | Language preference, local candidates |
| **Tags** | `correspondentProfile.tags` | Previous handling, quality notes |
| **Custom Fields** | `correspondentProfile.customFields` | Campaign-specific data |

### Conversation History Analysis

| What to Check | Why It Matters |
|---------------|----------------|
| Total messages exchanged | Engagement depth |
| Our previous messages | What we already told them |
| Their response patterns | Their communication style |
| Topics already covered | What to avoid repeating |
| Last interaction date | Timing context |

### Campaign Identification

| Method | Priority |
|--------|----------|
| Content detection (links in conversation) | Primary |
| Campaign ID lookup | Secondary |
| If unknown | Default to CazVid |

---

## Step 2: Message Analysis

### Language Detection

| Check | Determine |
|-------|-----------|
| Words in their message | Spanish vs English |
| Their profile location | Geographic context |
| Previous conversation language | Established pattern |
| Explicit request ("in English please") | Override |

### Intent Classification

| Intent | Signals |
|--------|---------|
| **Interest** | "tell me more", "how does it work", "yes", "sounds good" |
| **Gratitude** | "thanks", "gracias", "appreciate it" |
| **Question** | Any interrogative, question marks, "what", "how", "when" |
| **Objection** | "but", "however", "not sure", concerns raised |
| **Decline** | "not interested", "no thanks", "we're set" |
| **Action Ready** | "send me", "let's do it", "I want to try" |
| **Confusion** | "I don't understand", "what do you mean", multiple questions |
| **Information** | They're sharing context, situation, needs |

### Emotion Detection

| Emotion | Signals |
|---------|---------|
| **Enthusiastic** | !!! exclamation marks, positive adjectives, emojis |
| **Neutral** | Flat punctuation, straightforward language |
| **Skeptical** | Questions, "but", conditional language |
| **Frustrated** | Short responses, negative language, complaint markers |
| **Confused** | Multiple questions, "I don't understand" |
| **Warm** | Personal touches, friendliness markers |
| **Cold** | Minimal words, no pleasantries |

### Energy Level Assessment

| Their Message Length | Their Energy | Your Target |
|---------------------|--------------|-------------|
| 1-10 words | Minimal | 15-35 words |
| 11-25 words | Brief | 30-60 words |
| 26-50 words | Engaged | 50-100 words |
| 50+ words | Detailed | Full response as needed |

---

## Step 3: Deal Stage Assessment

### Stage Definitions

| Stage | Description | Characteristics |
|-------|-------------|-----------------|
| **COLD** | Initial contact | No meaningful response yet |
| **ENGAGED** | Showing interest | Responded, asking questions |
| **QUALIFIED** | Confirmed fit | Has need, right target, shows buying signals |
| **ACTION** | Ready to move | Wants samples, demo, to post job |
| **WON** | Took action | Posted job, booked demo, subscribed |
| **LOST** | Not pursuing | Declined, wrong target, disqualified |

### Stage Indicators

**ENGAGED signals:**
- Any substantive response
- Questions about product/service
- Request for information

**QUALIFIED signals:**
- Confirmed they're hiring
- Confirmed they're a staffing agency (for Agency Leads)
- Asked about pricing/process
- Expressed specific need

**ACTION signals:**
- "Send me the samples"
- "How do I post a job?"
- "Yes, let's do it"
- "I want to try"

**LOST signals:**
- "Not interested"
- BPO/outsourcing company (Agency Leads)
- Freelance recruiter
- Clear decline with no wiggle room

---

## Step 4: Strategic Decision

### Decision Matrix

| Their Situation | Your Action | Rationale |
|-----------------|-------------|-----------|
| Interest signal + new prospect | ENGAGE with value | Opportunity to advance |
| Interest signal + already processed | SKIP | Don't repeat yourself |
| Question asked | ANSWER directly | They want information |
| Ambiguous thanks | PROBE | Clarify interest level |
| Clear thanks + context | ADVANCE to next step | They're engaged |
| Soft objection | LABEL + PROBE | Understand the hesitation |
| Hard decline | CLOSE gracefully | Respect their decision |
| Wrong target | CLOSE gracefully | Don't waste their time |
| Complex situation | ESCALATE | Human judgment needed |
| Already pushed twice | HOLD | Don't be pushy |

### Action Definitions

| Action | What It Means |
|--------|---------------|
| **ENGAGE** | Substantive response moving toward goal |
| **PROBE** | Ask clarifying question to understand better |
| **ADVANCE** | Push toward next step (post job, book demo) |
| **ANSWER** | Directly address their question |
| **HOLD** | Minimal response or wait |
| **CLOSE** | End conversation gracefully |
| **ESCALATE** | Flag for human review |
| **SKIP** | Don't respond (already processed) |

---

## Step 5: Response Crafting

### Response Structure

```
[Opening - acknowledge their message]
[Body - address their need, provide value]
[Close - clear next step or graceful ending]
```

### Opening Variations

**Gratitude responses:**
- "Happy to help, [Name]!"
- "Glad to hear, [Name]!"
- "Of course, [Name]!"
- "My pleasure, [Name]!"
- "De nada, [Name]."
- "Con gusto, [Name]!"

**Question responses:**
- "Great question, [Name]!"
- "Let me explain, [Name]."
- "Good thinking, [Name]."

**Objection responses:**
- "I understand, [Name]."
- "That makes sense, [Name]."
- "I hear you, [Name]."

### Chris Voss Technique Selection

| Situation | Technique | Application |
|-----------|-----------|-------------|
| Need more info | **Mirror** | Repeat their key words |
| Objection raised | **Label** | "It sounds like..." |
| Complex situation | **Calibrated Question** | "What would need to change...?" |
| Before big ask | **Summary** | Paraphrase their situation |
| Prospect hesitant | **Accusation Audit** | Preempt their concerns |

### Required Elements Checklist

**When advancing CazVid prospect:**
- [ ] Job posting link (correct language)
- [ ] Tutorial video (correct language)
- [ ] Clear CTA

**When sending Agency Leads samples:**
- [ ] 3 lead samples
- [ ] Calendly link
- [ ] Specific time suggestions

**When probing:**
- [ ] Acknowledge their message
- [ ] Ask ONE clear question
- [ ] Keep it short

---

## Step 6: Quality Check

Before sending, verify:

| Check | Question |
|-------|----------|
| **Relevance** | Did I address what they actually said? |
| **Tone** | Does this match their energy? |
| **Length** | Is this appropriate for their message length? |
| **Language** | Am I using their language? |
| **Personalization** | Did I use their name and context? |
| **Elements** | Did I include required links (if advancing)? |
| **Next Step** | Is there a clear next step or closing? |
| **Humanity** | Does this sound like a human wrote it? |

---

## Common Patterns Reference

### Interest Signals

| They Say | Intent | Your Move |
|----------|--------|-----------|
| "Tell me more" | Info seeking | Explain with links |
| "How does it work?" | Info seeking | Walk through process |
| "What's the cost?" | Price concern | Explain value + pricing |
| "Yes" / "Sure" | Ready for action | Deliver what they want |
| "Send me..." | Action request | Provide immediately |

### Gratitude Signals

| They Say | True Intent | Your Move |
|----------|-------------|-----------|
| Short "thanks" | Could be brush-off | PROBE |
| "Thanks!" + context | Genuine appreciation | ADVANCE |
| "Gracias!!!" (enthusiastic) | Very positive | Match energy, ADVANCE |
| "Thanks, but..." | Objection coming | Handle objection |

### Objection Signals

| They Say | Underlying Concern | Your Move |
|----------|-------------------|-----------|
| "Not sure" | Need more info | PROBE deeper |
| "Maybe later" | Timing | Acknowledge, offer follow-up |
| "We're set" | Already solved | Close or probe gently |
| "Not interested" | Clear decline | Close gracefully |
| "Too expensive" | Price concern | Reframe value |

### Wrong Target Signals

| They Say | What It Means | Your Move |
|----------|---------------|-----------|
| "We're a BPO" | Sell workers, don't buy | Close gracefully |
| "I'm freelance" | Wrong product fit | Close gracefully |
| "We offer staffing services" | They're competition | Close gracefully |

---

## Escalation Criteria

Flag for human review when:

1. **Complex multi-party situation** - Multiple decision makers, org dynamics
2. **Pricing negotiation** - Asking for discounts, custom terms
3. **Partnership inquiry** - Integration, reseller, API access
4. **Complaint** - Negative experience, angry prospect
5. **Legal/compliance** - Regulatory questions, contracts
6. **Unusual request** - Outside normal patterns
7. **High-value opportunity** - Enterprise, large volume
8. **Uncertainty** - You're not confident in the right response

---

## Analysis Example

### Scenario

**Their message:** "Hola Juan, muchas gracias por los candidatos!!!! Me gustaron mucho. Cómo funciona para contactarlos?"

### Analysis

| Element | Assessment |
|---------|------------|
| **Language** | Spanish (clear from text) |
| **Intent** | Interest + Question |
| **Emotion** | Enthusiastic (!!!! + "muchas" + "mucho") |
| **Energy** | High (detailed, excited) |
| **Stage** | Engaged → Qualifying |
| **Campaign** | CazVid (mentioned candidates) |

### Decision

- **Action:** ENGAGE with answer
- **Strategy:** Match enthusiasm, explain pricing, provide links
- **Tone:** Warm, excited
- **Required elements:** Pricing info, job posting link, tutorial

### Response

```
¡Qué bueno que te gustaron, [Name]!

Para contactarlos, publica tu vacante gratis aquí: [link].
La enviamos a los mejores candidatos y te llegan sus currículums por correo.
Cuando encuentres al indicado, con $50 USD/mes puedes contactarlo directamente.

Este video te muestra cómo: [tutorial]

¿Con cuál te gustaría conectarte?
```

---

## Continuous Improvement

After each run:
1. Note any patterns that were unclear
2. Add new edge cases to edge-cases.md
3. Refine decision criteria based on outcomes
4. Track what works in knowledge-base.md
