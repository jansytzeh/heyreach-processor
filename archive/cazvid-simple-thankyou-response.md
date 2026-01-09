# HeyReach Conversation Response Handler

## Overview

This document describes the process for handling standard responses from HeyReach LinkedIn outreach campaigns that require templated replies:

1. **CazVid Simple Thank-You** - Leads who received candidate recommendations and responded with "Gracias" or "Thanks"
2. **Agency Leads Simple Decline** - Leads who responded with "Not interested" or "No thanks" without additional context
3. **Agency Leads Sample Request** - Leads who want the 3 lead sample offered in the pitch
4. **CazVid Information Request** - Leads asking for more information about CazVid (Spanish)

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| **FETCH_LIMIT** | `200` | Number of unread conversations to fetch from HeyReach |
| **MAX_MESSAGES_TO_SEND** | `10` | Maximum number of messages to actually send per run |

### Already Processed Detection

Before sending a message, check the conversation history for these patterns to avoid duplicates:

| Response Type | Detection Pattern |
|---------------|-------------------|
| CazVid Thank-You (ES) | Message contains "De nada" AND "share.cazvid.app" |
| CazVid Thank-You (EN) | Message contains "You're welcome" AND "share.cazvid.app" |
| Agency Leads Decline | Message contains "timing, fit, or need" |
| Agency Leads Sample | Message contains "Here are 3 quick examples" |
| CazVid Info Request | Message contains "$50 USD al mes" OR "50 dólares al mes" |

**Process:**
1. Get chatroom details with `mcp__heyreach__get_chatroom`
2. Check all messages where `senderType == "SELF"`
3. If any self-sent message matches the detection pattern, SKIP this conversation

### Agency Leads 3 Lead Sample (Update Weekly)

| Variable | Value |
|----------|-------|
| **LEAD_SAMPLE_1** | `Senior Legal Personal Assistant: Mishcon de Reya LLP - Cambridge, United Kingdom` |
| **LEAD_SAMPLE_2** | `Associate Attorney: Feldman Jackson, PC - Bethesda, Maryland` |
| **LEAD_SAMPLE_3** | `Executive Assistant to SVP of Legal: Rush University Medical Center - Chicago, Illinois` |

---

## Quick Start Prompts

**CazVid Thank-You Responses:**
```
Process CazVid simple thank-you responses from HeyReach unread conversations
```

**Agency Leads Decline Responses:**
```
Process Agency Leads simple decline responses from HeyReach unread conversations
```

**Agency Leads Sample Requests:**
```
Process Agency Leads sample request responses from HeyReach unread conversations
```

**CazVid Information Requests:**
```
Process CazVid information request responses from HeyReach unread conversations
```

**All Standard Responses:**
```
Process all standard responses from HeyReach unread conversations
```

---

## Process Summary

### CazVid Thank-You Flow
1. **Fetch unread conversations** from HeyReach
2. **Filter for simple thank-you responses** (Spanish: "gracias", English: "thanks")
3. **Verify CazVid campaign** (check for cazvid.com links in conversation)
4. **Send templated response** with personalized merge tags + YouTube video

### Agency Leads Decline Flow
1. **Fetch unread conversations** from HeyReach
2. **Filter for simple decline responses** ("not interested", "no thanks", "I'm ok")
3. **Verify Agency Leads campaign** (check for agency-leads.com links in conversation)
4. **Send "timing, fit, or need"** response with first name only

### Agency Leads Sample Request Flow
1. **Fetch unread conversations** from HeyReach
2. **Filter for sample request responses** ("send me", "I'd like to see", "yes please", "sure")
3. **Verify Agency Leads campaign** (check for agency-leads.com links in conversation)
4. **Send 3 lead sample** from Configuration + calendly link

### CazVid Information Request Flow
1. **Fetch unread conversations** from HeyReach
2. **Filter for info request responses** ("cómo funciona", "más información", "cuánto cuesta")
3. **Verify CazVid campaign** (check for cazvid.com links in conversation)
4. **Send pricing/platform explanation** with free job posting link

---

## Message Templates

### Spanish Template

**Trigger phrases:** "gracias", "muchas gracias", "mil gracias"

```
De nada [First Name],

Puedes publicar tu vacante gratis en https://share.cazvid.app/cazvid3.0/es/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=[Sender Last Name]&utm_content=candidate. Además te comparto un video para mostrarte cómo contactar los candidatos que te envié: https://youtu.be/c0E8sfSFqeM

¿Con cuál candidato te puedo conectar, [First Name]?
```

**YouTube Video (Spanish):** https://youtu.be/c0E8sfSFqeM

---

### English Template

**Trigger phrases:** "thanks", "thank you", "thx"

```
You're welcome [First Name],

You can post your job opening for free at https://share.cazvid.app/cazvid3.0/en/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=[Sender Last Name]&utm_content=candidate. I'm also sharing a video to show you how to contact the candidates I sent you: https://youtu.be/mldU26l91ZA

Which one of the candidates can I connect you with, [First Name]?
```

**YouTube Video (English):** https://youtu.be/mldU26l91ZA

---

## Agency Leads Decline Templates

### English Decline Template

**Trigger phrases:** "not interested", "no thanks", "no thank you", "I'm ok", "I'm good", "pass"

```
No worries [First Name], is it timing, fit, or need?

I'll tag it correctly so we don't pitch again.
```

---

### Spanish Decline Template

**Trigger phrases:** "no gracias", "no estoy interesado", "no me interesa", "estoy bien así"

```
No hay problema [First Name], ¿es por el momento, el servicio, o simplemente no lo necesitas?

Lo voy a etiquetar correctamente para no volver a contactarte.
```

---

## Agency Leads Sample Request Template

**Trigger phrases:** "send me", "I'd like to see", "yes please", "sure", "sounds good", "let's see", "show me"

```
Perfect, [First Name]!

Here's your 3 lead sample:
- [LEAD_SAMPLE_1]
- [LEAD_SAMPLE_2]
- [LEAD_SAMPLE_3]

Let me show you exactly who their hiring managers are and their contact details in a short 15 minute demo.

I have some spots available for tomorrow 11AM, 2PM, and 3PM. Which would work best for you?

You can check out my calendar over at: https://calendly.com/agency-leads/agency-leads-premium-staffing-leads-c0100
```

**Note:** Replace `[LEAD_SAMPLE_1]`, `[LEAD_SAMPLE_2]`, `[LEAD_SAMPLE_3]` with values from Configuration section.

---

## CazVid Information Request Template (Spanish)

**Trigger phrases:** "cómo funciona", "más información", "cuánto cuesta", "qué es cazvid", "explícame", "cuéntame más"

```
Hola [First Name]. Claro que sí.

En CazVid puedes publicar tu vacante gratis y buscar candidatos.

Después de colectar postulantes, se necesita una suscripción de $50USD/mes para contactar los candidatos. Eso significa que si no hay resultados, no hay pago.

Aquí una introducción de la plataforma: https://youtu.be/XJZcKKnymcU?si=rDPURy5bsqL4RhBF

Puedes publicar tu vacante gratis en https://share.cazvid.app/cazvid3.0/es/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=[Sender Last Name]&utm_content=candidate. Avísame cuando publicaste tu oferta y te ayudo con gusto con los siguientes pasos.

¿Publicamos tu vacante gratis y te ponemos en marcha hoy mismo?
```

**YouTube Video (CazVid Intro Spanish):** https://youtu.be/XJZcKKnymcU

---

## Merge Tags

| Tag | Source | Example |
|-----|--------|---------|
| `[First Name]` | `correspondentProfile.firstName` | "Oscar" |
| `[Sender Last Name]` | `linkedInAccount.lastName` | "Ledaine" |

---

## Response Classification

### CAZVID: Simple Thank You (PROCESS)
These responses qualify for the CazVid thank-you template:

| Language | Examples |
|----------|----------|
| Spanish | "Gracias", "Muchas gracias", "Mil gracias", "Hola, gracias", "Genial muchas gracias" |
| English | "Thanks", "Thank you", "Thank you so much", "Thanks for the message" |

### AGENCY LEADS: Simple Decline (PROCESS)
These responses qualify for the Agency Leads decline template:

| Language | Examples |
|----------|----------|
| English | "No thanks", "Not interested", "I'm ok for this thanks", "I'm good", "Pass" |
| Spanish | "No gracias", "No estoy interesado", "No me interesa", "Estoy bien así" |

### AGENCY LEADS: Sample Request (PROCESS)
These responses indicate interest in seeing the 3 lead sample:

| Language | Examples |
|----------|----------|
| English | "Send me the sample", "Yes please", "Sure", "Sounds good", "I'd like to see", "Show me" |

### CAZVID: Information Request (PROCESS)
These responses ask for more information about CazVid:

| Language | Examples |
|----------|----------|
| Spanish | "Cómo funciona?", "Más información", "Cuánto cuesta?", "Qué es CazVid?", "Explícame" |

### DO NOT PROCESS (Requires Manual Handling)

| Type | Examples | Why |
|------|----------|-----|
| Questions | "How does this work?", "What's the cost?" | Needs personalized answer |
| Vacancy Closed | "Ya cerré la vacante, gracias", "the role was closed" | Position filled - no follow-up needed |
| Will Review | "Gracias, lo estaré revisando", "I'll take a look" | Already engaged - may reply naturally |
| Wrong Target | "I'm not a recruiter", "Soy reclutador freelance", "I no longer work with" | Misqualified lead |
| Location Mismatch | "la vacante es en villahermosa", "we are based in karachi" | Wrong geographic fit |
| Using Own Resources | "estamos seleccionando por nuestros recursos" | Already have solution |
| Detailed Objection | "Not interested, we use internal recruiting" | Has context - needs custom response |
| Uncertainty | "I'm not sure", "Maybe", "Let me think" | Not a clear yes - don't push |

### Exclusion Keywords

When filtering, EXCLUDE messages containing these phrases even if they match trigger words:

**Spanish Exclusions:**
- "cerré la vacante" / "cerré vacante" (closed position)
- "lo estaré revisando" / "lo revisaré" (will review)
- "soy reclutador freelance" (freelance recruiter)
- "por nuestros recursos" (using own resources)
- "la vacante es en" (location mismatch)
- "no estoy en" (not in location)

**English Exclusions:**
- "role was closed" / "position filled" (closed position)
- "I'll take a look" / "I'll review" (will review)
- "I'm not a recruiter" / "I no longer work" (wrong target)
- "we are based in" / "we're located in" (location context)
- "I'm not sure" / "maybe" / "let me think" (uncertainty)

---

## Campaign Identification

Use **either** method - both are valid. Older campaigns may have different IDs.

### Method 1: Known Campaign IDs

| Campaign Type | Known Campaign IDs |
|---------------|-------------------|
| **Agency Leads** | `223998`, `240191` |
| **CazVid** | Others (but verify with content if unsure) |

### Method 2: Message Content Detection

**Agency Leads Campaigns** (check conversation for):
- "Agency Leads" mentions
- "agency-leads.com" links
- "calendly.com/agency-leads" booking links

**CazVid Campaigns** (check conversation for):
- "candidatos potenciales" / "potential candidates"
- "cazvid.com" or "cazvid.app" links
- Job title references like "para tu vacante de..."

> **Note:** If campaign ID is NOT in the known list, always verify with content detection. Old Agency Leads campaigns may have different IDs.

### Key Definitions

| Term | Meaning |
|------|---------|
| **Seen** | Conversation has been handled (by AI or Jan) |
| **Unseen** | Conversation needs handling |
| **Jan** | Business developer who manages conversations manually |

---

## Technical Process

### Step 1: Fetch Unread Conversations
```
mcp__heyreach__get_conversations_v2
- seen: false
- limit: 100
```

### Step 2: Filter Conversations

**For CazVid Thank-You:**
- `lastMessageSender == "CORRESPONDENT"`
- `lastMessageText` contains "gracias" or "thank"
- Message length < 60-80 characters
- Exclude decline patterns: "no gracias", "no thanks"
- Verify conversation contains CazVid campaign content (cazvid.com links)

**For Agency Leads Decline:**
- `lastMessageSender == "CORRESPONDENT"`
- `lastMessageText` contains "not interested", "no thanks", "I'm ok", "no gracias"
- Message length < 80 characters
- Exclude questions or detailed objections
- Verify conversation contains Agency Leads campaign content (agency-leads.com links)

### Step 3: Extract Required Data
For each qualifying conversation:
- `conversationId`: `item.id`
- `linkedInAccountId`: `item.linkedInAccountId`
- `firstName`: `item.correspondentProfile.firstName`
- `senderLastName`: `item.linkedInAccount.lastName`

### Step 4: Send Message
```
mcp__heyreach__send_message
- conversationId: [from step 3]
- linkedInAccountId: [from step 3]
- subject: "" (empty)
- message: [template with merged tags]
```

---

## Sender Account Reference

| Account ID | Name | Last Name (for UTM) |
|------------|------|---------------------|
| 93126 | Wesley Bouwmeester | Bouwmeester |
| 94527 | Viviana Rodriguez | Rodriguez |
| 94530 | David Mendoza | Mendoza |
| 94531 | Pedro Alejandro Colunga López | Colunga |
| 94533 | John Acebedo | Acebedo |
| 94534 | Jan Sytze Heegstra | Heegstra |
| 94559 | Juan Fajardo | Fajardo |
| 94853 | Filip Vandamme | Vandamme |
| 96268 | Anthony Squillante | Squillante |
| 96269 | Yuvi Shmul | Shmul |
| 96280 | Asaf Hartenstein | Hartenstein |
| 103961 | Shadai Escalona | Escalona |
| 106125 | Emile Ledaine | Ledaine |
| 118434 | Camila Martinez | Martinez |

---

## Example Workflows

### CazVid Thank-You Example

**Input conversation:**
```
Lead: Oscar Campos
Response: "Hola, muchas gracias"
Account: Emile Ledaine (ID: 106125)
Campaign: CazVid (contains cazvid.com links)
```

**Output message:**
```
De nada Oscar,

Puedes publicar tu vacante gratis en https://share.cazvid.app/cazvid3.0/es/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=Ledaine&utm_content=candidate. Además te comparto un video para mostrarte cómo contactar los candidatos que te envié: https://youtu.be/c0E8sfSFqeM

¿Con cuál candidato te puedo conectar, Oscar?
```

---

### Agency Leads Decline Example

**Input conversation:**
```
Lead: Dan Craddock
Response: "Hi Fillip I'm ok for this thanks"
Account: Filip Vandamme (ID: 94853)
Campaign: Agency Leads (contains agency-leads.com links)
```

**Output message:**
```
No worries Dan, is it timing, fit, or need?

I'll tag it correctly so we don't pitch again.
```

---

### Agency Leads Sample Request Example

**Input conversation:**
```
Lead: Sarah Johnson
Response: "Sure, send me the sample"
Account: Yuvi Shmul (ID: 96269)
Campaign: Agency Leads (contains agency-leads.com links)
```

**Output message:**
```
Perfect, Sarah!

Here's your 3 lead sample:
- DNS Network Engineer: DLS Engineering - Montgomery, Alabama
- Manufacturing Mechanic: Lassonde Pappas & Company - Hendersonville, North Carolina
- Senior Brand Manager: Pilgrim's - Greeley, Colorado

Let me show you exactly who their hiring managers are and their contact details in a short 15 minute demo.

I have some spots available for tomorrow 11AM, 2PM, and 3PM. Which would work best for you?

You can check out my calendar over at: https://calendly.com/agency-leads/agency-leads-premium-staffing-leads-c0100
```

---

### CazVid Information Request Example

**Input conversation:**
```
Lead: Miguel Torres
Response: "Hola, cómo funciona esto?"
Account: Asaf Hartenstein (ID: 96280)
Campaign: CazVid (contains cazvid.com links)
```

**Output message:**
```
Hola Miguel. Claro que sí.

En CazVid puedes publicar tu vacante gratis y buscar candidatos.

Después de colectar postulantes, se necesita una suscripción de $50USD/mes para contactar los candidatos. Eso significa que si no hay resultados, no hay pago.

Aquí una introducción de la plataforma: https://youtu.be/XJZcKKnymcU?si=rDPURy5bsqL4RhBF

Puedes publicar tu vacante gratis en https://share.cazvid.app/cazvid3.0/es/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=Hartenstein&utm_content=candidate. Avísame cuando publicaste tu oferta y te ayudo con gusto con los siguientes pasos.

¿Publicamos tu vacante gratis y te ponemos en marcha hoy mismo?
```

---

## Language Detection

| If message contains... | Language | Use Template |
|------------------------|----------|--------------|
| "gracias" | Spanish | Spanish template + /es/ URL |
| "thanks", "thank you", "thx" | English | English template + /en/ URL |

---

## Notes

- The HeyReach API `send_message` does not support file attachments, so we use YouTube links instead
- Always verify the sender account's last name matches the linkedInAccountId
- **Fetch vs Send limits:** FETCH_LIMIT controls how many conversations to retrieve (200), MAX_MESSAGES_TO_SEND controls how many to actually process (10)
- **Conversations remain unread:** The HeyReach API does NOT mark conversations as read after sending. Use the "Already Processed Detection" patterns to avoid duplicates
- **Agency Leads declines:** No UTM tracking or video needed - just the simple timing/fit/need question
- **CazVid thank-yous:** Include the free job posting URL with UTM tracking and YouTube video
- Always check the conversation history to confirm which campaign type (CazVid vs Agency Leads) before selecting template

### Processing Flow

```
1. Fetch 200 unread conversations (FETCH_LIMIT)
         ↓
2. Filter by trigger phrases + exclusions
         ↓
3. For each candidate (up to MAX_MESSAGES_TO_SEND):
   → Get chatroom details
   → Check if already processed (detection patterns)
   → Skip if already responded, otherwise send message
         ↓
4. Report: fetched, qualified, skipped, sent
```

---

## Slash Commands

Custom slash commands are available in the `.claude/commands/` directory:

| Command | Description |
|---------|-------------|
| `/process-heyreach` | Process unread HeyReach conversations with templated responses |
| `/update-lead-samples` | Update the 3 lead sample variables for Agency Leads |
| `/update-config` | Update configuration settings |
| `/train-heyreach` | **Training mode** - Improve AI based on feedback |

### Processing Usage

```
/process-heyreach
```

You will be asked:
1. Which response type to process
2. How many messages to send

### Training Usage

```
/train-heyreach
```

Training modes available:
1. **Review Tagged** - Analyze conversations tagged Good/Bad/Mediocre in HeyReach
2. **Teach New** - Add a new response type
3. **Refine Templates** - Improve existing templates
4. **Audit Recent** - Review recent AI processing quality
5. **Edge Case Deep Dive** - Document and implement edge cases

---

## Training System

The AI training infrastructure is located in the `training/` folder:

| File | Purpose |
|------|---------|
| `knowledge-base.md` | Accumulated learnings, patterns, and rules |
| `improvement-log.md` | Version history of all changes |
| `edge-cases.md` | Documented edge cases with detection rules |
| `sessions/` | Individual training session logs |

### Training Workflow

1. **Process conversations** with `/process-heyreach`
2. **Tag only when needed** (see below)
3. **Run training** with `/train-heyreach` when you have feedback
4. **Teach new response types** with `/train-heyreach` → Teach New

### HeyReach Tags for Training

#### Handling Tags (Who Responded)

| Tag | When to Use |
|-----|-------------|
| `AI Input` | AI contributed to this conversation |
| `Manual Handled Jan` | Jan handled this manually |
| Both tags | Collaboration - AI started, Jan refined (or vice versa) |

#### Quality Tags (Optional - For Learning)

| Tag | When to Use |
|-----|-------------|
| `Good AI Handling` | Only for tricky cases where AI did well unexpectedly |
| `Bad AI Handling` | AI made a mistake - **always tag these** |
| `Mediocre AI Handling` | Could be better - tag if worth improving |

**Quality tags are optional** - only tag when there's something to learn from:
- Don't tag routine successes like standard "gracias" → template responses
- The training system learns most from mistakes and edge cases

#### Training Value by Tag Combination

| Combination | Training Use |
|-------------|--------------|
| `AI Input` only | Evaluate AI performance |
| `Manual Handled Jan` only | Learn Jan's communication style, propose new response types |
| Both tags | Understand handoff patterns, when AI needs human help |
