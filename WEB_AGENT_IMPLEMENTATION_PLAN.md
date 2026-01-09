# HeyReach Web Agent Implementation Plan

## Executive Summary

This document outlines the complete architecture and implementation plan for transforming your local Claude Code HeyReach processor into a **web-accessible AI agent** hosted on Render, powered by **OpenAI's Responses API** with **Vector Store + file_search** for knowledge retrieval.

---

## Part 1: Architecture Overview

### Target Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              YOUR WEB APPLICATION (Render)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐        │
│  │    Web UI        │     │   API Server     │     │   Job Worker     │        │
│  │  (React/Next.js) │────▶│   (Express.js)   │────▶│  (Bull Queue)    │        │
│  │                  │     │                  │     │                  │        │
│  │ - Dashboard      │     │ POST /runs       │     │ - Process jobs   │        │
│  │ - Run triggers   │     │ GET  /runs       │     │ - Call OpenAI    │        │
│  │ - Draft review   │     │ POST /approve    │     │ - Call HeyReach  │        │
│  │ - Run history    │     │ GET  /stats      │     │ - Log results    │        │
│  │ - Settings       │     │ WebSocket /live  │     │                  │        │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘        │
│           │                        │                        │                   │
└───────────┼────────────────────────┼────────────────────────┼───────────────────┘
            │                        │                        │
            │                        │                        │
            ▼                        ▼                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SERVICES                                 │
├───────────────────────┬───────────────────────┬───────────────────────────────┤
│                       │                       │                               │
│  ┌─────────────────┐  │  ┌─────────────────┐  │  ┌─────────────────────────┐  │
│  │  OpenAI API     │  │  │  HeyReach API   │  │  │  MongoDB Atlas          │  │
│  │                 │  │  │                 │  │  │                         │  │
│  │ - Responses API │  │  │ - Conversations │  │  │ - Run history           │  │
│  │ - Vector Store  │  │  │ - Chatrooms     │  │  │ - Sent registry         │  │
│  │ - file_search   │  │  │ - Send message  │  │  │ - Drafts                │  │
│  │                 │  │  │ - Stats         │  │  │ - Audit logs            │  │
│  └─────────────────┘  │  └─────────────────┘  │  └─────────────────────────┘  │
│                       │                       │                               │
└───────────────────────┴───────────────────────┴───────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **Web UI** | User interface for triggering runs, reviewing drafts, viewing history |
| **API Server** | REST endpoints, authentication, request validation |
| **Job Worker** | Async processing, OpenAI calls, HeyReach API calls |
| **OpenAI Vector Store** | Knowledge base (persona, config, training, guardrails) |
| **MongoDB** | Run history, sent registry (idempotency), draft storage |
| **Redis** | Job queue (Bull), caching, rate limiting |

---

## Part 2: OpenAI Integration Design

### 2.1 Vector Store Structure (file_search)

Your knowledge base will be organized into a single Vector Store with categorized files:

```
Vector Store: "heyreach-knowledge-base"
├── agent-persona.md              (Identity, decision framework, techniques)
├── config.md                     (Settings, links, API config)
├── knowledge-base.md             (Accumulated learnings, principles)
├── conversation-analysis.md      (Analysis methodology)
├── quality-rubric.md             (Scoring system)
├── edge-cases.md                 (Complex scenario handling)
├── deal-tracking.md              (Pipeline stages)
└── curriculum.md                 (Training levels)
```

### 2.2 Responses API Call Structure

```javascript
const response = await openai.responses.create({
  model: "gpt-5-mini",  // Use gpt-5 for high-risk review
  tools: [
    {
      type: "file_search",
      vector_store_ids: ["vs_xxxxxxxxxxxxxxxx"]  // Your Vector Store ID
    }
  ],
  input: [
    {
      role: "system",
      content: SYSTEM_PROMPT  // See below
    },
    {
      role: "user",
      content: USER_PROMPT    // Conversation context
    }
  ],
  text: {
    format: {
      type: "json_schema",
      name: "outreach_response",
      schema: RESPONSE_SCHEMA  // See below
    }
  }
});
```

### 2.3 System Prompt (Condensed for API)

```javascript
const SYSTEM_PROMPT = `
You are a Business Developer AI assistant processing LinkedIn conversations.
Your job is to analyze conversations and generate appropriate responses.

BEFORE generating any response, you MUST use file_search to retrieve:
1. Agent persona and communication guidelines
2. Product information (CazVid or Agency Leads)
3. Critical guardrails and pricing rules
4. Relevant edge cases for this situation

CRITICAL RULES (never violate):
- Never claim contacting candidates is free (it's $50/month)
- Never claim all candidates have videos
- Never push after a clear decline
- Always include required links when appropriate

OUTPUT FORMAT: You must return valid JSON matching the provided schema.
`;
```

### 2.4 User Prompt Template

```javascript
const buildUserPrompt = (prospect, conversation, campaign) => `
## PROSPECT PROFILE
- Name: ${prospect.firstName} ${prospect.lastName}
- Headline: ${prospect.headline}
- Company: ${prospect.companyName}
- Location: ${prospect.location}
- Tags: ${prospect.tags?.join(', ') || 'None'}

## CAMPAIGN
Type: ${campaign} (${campaign === 'CazVid' ? 'Video hiring platform' : 'Lead generation service'})

## CONVERSATION HISTORY
${conversation.messages.map(m =>
  `[${m.sender === 'ME' ? 'US' : 'PROSPECT'}]: ${m.text}`
).join('\n')}

## TASK
1. Use file_search to retrieve relevant guidelines for this situation
2. Analyze the prospect's last message (intent, emotion, energy level)
3. Determine the deal stage (COLD/ENGAGED/QUALIFIED/ACTION/WON/LOST)
4. Decide on action: ENGAGE, PROBE, HOLD, CLOSE, or ESCALATE
5. Generate an appropriate response

Return your analysis and response as JSON.
`;
```

### 2.5 Response JSON Schema

```javascript
const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    analysis: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: ["interest", "gratitude", "question", "objection", "decline", "action_ready", "confusion", "information"]
        },
        emotion: {
          type: "string",
          enum: ["enthusiastic", "neutral", "skeptical", "frustrated", "confused", "warm", "cold"]
        },
        energy_level: {
          type: "string",
          enum: ["minimal", "brief", "engaged", "detailed"]
        },
        deal_stage: {
          type: "string",
          enum: ["COLD", "ENGAGED", "QUALIFIED", "ACTION", "WON", "LOST"]
        },
        language: {
          type: "string",
          enum: ["en", "es"]
        }
      },
      required: ["intent", "emotion", "energy_level", "deal_stage", "language"]
    },
    action: {
      type: "string",
      enum: ["ENGAGE", "PROBE", "HOLD", "CLOSE", "ESCALATE"]
    },
    reasoning: {
      type: "string",
      description: "Brief explanation of why this action was chosen"
    },
    message: {
      type: "string",
      description: "The actual message to send (empty if HOLD or ESCALATE)"
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1
    },
    required_elements_included: {
      type: "object",
      properties: {
        job_posting_link: { type: "boolean" },
        tutorial_link: { type: "boolean" },
        demo_link: { type: "boolean" },
        pricing_mentioned: { type: "boolean" }
      }
    },
    guardrail_check: {
      type: "object",
      properties: {
        no_false_free_claims: { type: "boolean" },
        no_fabricated_features: { type: "boolean" },
        appropriate_length: { type: "boolean" },
        energy_matched: { type: "boolean" }
      }
    }
  },
  required: ["analysis", "action", "reasoning", "message", "confidence", "guardrail_check"]
};
```

---

## Part 3: Web Application Design

### 3.1 Project Structure

```
heyreach-web-agent/
├── package.json
├── .env.example
├── render.yaml                    # Render deployment config
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Dashboard
│   │   ├── runs/
│   │   │   ├── page.tsx           # Run history
│   │   │   └── [id]/page.tsx      # Run details
│   │   ├── drafts/
│   │   │   └── page.tsx           # Draft review & approval
│   │   └── settings/
│   │       └── page.tsx           # Configuration
│   │
│   ├── api/                       # API Routes
│   │   ├── runs/
│   │   │   ├── route.ts           # POST /api/runs (trigger), GET (list)
│   │   │   └── [id]/route.ts      # GET /api/runs/:id (details)
│   │   ├── drafts/
│   │   │   ├── route.ts           # GET /api/drafts (pending)
│   │   │   └── [id]/
│   │   │       ├── approve/route.ts
│   │   │       └── reject/route.ts
│   │   ├── stats/route.ts         # GET /api/stats
│   │   └── health/route.ts        # Health check
│   │
│   ├── lib/
│   │   ├── openai.ts              # OpenAI client & Vector Store
│   │   ├── heyreach.ts            # HeyReach API client
│   │   ├── mongodb.ts             # MongoDB connection
│   │   ├── redis.ts               # Redis/Bull queue
│   │   ├── guardrails.ts          # Safety validation
│   │   └── auth.ts                # Authentication
│   │
│   ├── workers/
│   │   └── processor.ts           # Bull worker for processing jobs
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   │
│   └── components/
│       ├── Dashboard.tsx
│       ├── RunCard.tsx
│       ├── DraftReview.tsx
│       ├── ConversationView.tsx
│       └── StatsWidget.tsx
│
├── scripts/
│   ├── setup-vector-store.ts      # Upload files to OpenAI
│   └── sync-knowledge.ts          # Sync local files to Vector Store
│
└── knowledge/                     # Copy of training docs for sync
    ├── agent-persona.md
    ├── config.md
    └── ...
```

### 3.2 Key Environment Variables

```env
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxx
OPENAI_VECTOR_STORE_ID=vs_xxxxxxxx

# HeyReach
HEYREACH_API_KEY=MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4=
HEYREACH_BASE_URL=https://api.heyreach.io

# MongoDB
MONGODB_URI=mongodb+srv://...

# Redis (for Bull queue)
REDIS_URL=redis://...

# Auth
AUTH_SECRET=your-secret-key
ALLOWED_EMAILS=jan@example.com,wesley@example.com

# Feature Flags
SEND_ENABLED=false          # Kill switch - set true to enable actual sending
MAX_MESSAGES_PER_RUN=30
AUTO_APPROVE_CONFIDENCE=0.9 # Auto-approve drafts above this confidence
```

### 3.3 API Endpoints Specification

#### POST /api/runs - Trigger a new run
```typescript
// Request
{
  mode: "dry_run" | "live",
  max_messages?: number,        // default: 30
  account_ids?: number[],       // default: all
  campaign_ids?: number[],      // default: all
  auto_approve?: boolean        // default: false (requires review)
}

// Response
{
  run_id: "run_2026-01-09_14-30-00",
  status: "queued",
  estimated_conversations: 25
}
```

#### GET /api/runs - List run history
```typescript
// Response
{
  runs: [
    {
      run_id: "run_2026-01-09_14-30-00",
      status: "completed" | "in_progress" | "failed",
      mode: "dry_run" | "live",
      started_at: "2026-01-09T14:30:00Z",
      completed_at: "2026-01-09T14:32:15Z",
      stats: {
        conversations_processed: 25,
        messages_drafted: 18,
        messages_sent: 15,
        messages_skipped: 7,
        escalations: 2,
        errors: 0
      }
    }
  ],
  pagination: { page: 1, total: 50 }
}
```

#### GET /api/drafts - Pending drafts for approval
```typescript
// Response
{
  drafts: [
    {
      draft_id: "draft_xxxxx",
      run_id: "run_2026-01-09_14-30-00",
      conversation_id: "conv_123",
      account_id: 93126,
      prospect: {
        name: "Maria Garcia",
        headline: "HR Manager at TechCorp",
        company: "TechCorp"
      },
      conversation_preview: "Their last message...",
      analysis: { intent: "interest", emotion: "enthusiastic", ... },
      action: "ENGAGE",
      message: "Drafted message...",
      confidence: 0.85,
      created_at: "2026-01-09T14:30:45Z"
    }
  ]
}
```

#### POST /api/drafts/:id/approve - Approve and send a draft
```typescript
// Request
{
  edited_message?: string  // Optional: send edited version instead
}

// Response
{
  success: true,
  sent_at: "2026-01-09T14:35:00Z"
}
```

---

## Part 4: Safety Architecture

### 4.1 Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: INPUT VALIDATION                 │
│  - API authentication                                        │
│  - Request rate limiting                                     │
│  - Parameter validation                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Layer 2: AI GUARDRAILS (in prompt)           │
│  - Pricing accuracy rules                                    │
│  - Feature truth requirements                                │
│  - Decline detection                                         │
│  - Energy matching                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Layer 3: OUTPUT VALIDATION (in code)           │
│  - JSON schema enforcement                                   │
│  - Guardrail flag verification                               │
│  - Confidence threshold                                      │
│  - Required elements check                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Layer 4: BUSINESS RULES                    │
│  - Daily send caps (per account)                             │
│  - Idempotency (no double-sends)                             │
│  - Banned phrase detection                                   │
│  - Link validation                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Layer 5: HUMAN APPROVAL (optional)             │
│  - Draft review before send                                  │
│  - Escalation handling                                       │
│  - Low-confidence review                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 6: AUDIT TRAIL                      │
│  - Every decision logged                                     │
│  - Every send recorded                                       │
│  - Rollback capability                                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Guardrails Implementation

```typescript
// src/lib/guardrails.ts

interface Draft {
  message: string;
  analysis: Analysis;
  confidence: number;
  guardrail_check: GuardrailCheck;
}

interface ValidationResult {
  passed: boolean;
  issues: string[];
  auto_approvable: boolean;
}

export function validateDraft(draft: Draft, campaign: string): ValidationResult {
  const issues: string[] = [];

  // Check 1: AI self-reported guardrail violations
  if (!draft.guardrail_check.no_false_free_claims) {
    issues.push("CRITICAL: May contain false free claims");
  }
  if (!draft.guardrail_check.no_fabricated_features) {
    issues.push("CRITICAL: May contain fabricated features");
  }

  // Check 2: Message content validation
  const message = draft.message.toLowerCase();

  // Pricing accuracy
  if (message.includes("free") && message.includes("contact")) {
    issues.push("WARNING: May incorrectly claim contacting is free");
  }

  // Required links for CazVid interest responses
  if (campaign === "CazVid" &&
      draft.analysis.intent === "interest" &&
      !message.includes("share.cazvid.app")) {
    issues.push("MISSING: Job posting link not included");
  }

  // Check 3: Confidence threshold
  const AUTO_APPROVE_THRESHOLD = 0.85;
  const autoApprovable = draft.confidence >= AUTO_APPROVE_THRESHOLD && issues.length === 0;

  // Check 4: Length appropriateness
  const wordCount = draft.message.split(/\s+/).length;
  if (draft.analysis.energy_level === "minimal" && wordCount > 50) {
    issues.push("WARNING: Response may be too long for brief prospect");
  }

  // Check 5: Escalation handling
  if (draft.action === "ESCALATE") {
    issues.push("INFO: Flagged for human review");
  }

  return {
    passed: issues.filter(i => i.startsWith("CRITICAL")).length === 0,
    issues,
    auto_approvable: autoApprovable
  };
}
```

### 4.3 Idempotency System

```typescript
// src/lib/mongodb.ts

// Sent registry schema
const sentRegistrySchema = {
  conversation_id: String,
  account_id: Number,
  message_hash: String,      // SHA256 of message content
  sent_at: Date,
  run_id: String
};

// Before sending, check if already sent
async function canSendMessage(conversationId: string, messageHash: string): Promise<boolean> {
  const existing = await SentRegistry.findOne({
    conversation_id: conversationId,
    message_hash: messageHash,
    sent_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24h
  });
  return !existing;
}

// After sending, record it
async function recordSent(conversationId: string, accountId: number, message: string, runId: string) {
  await SentRegistry.create({
    conversation_id: conversationId,
    account_id: accountId,
    message_hash: crypto.createHash('sha256').update(message).digest('hex'),
    sent_at: new Date(),
    run_id: runId
  });
}
```

---

## Part 5: Web UI Design

### 5.1 Dashboard (Home Page)

```
┌─────────────────────────────────────────────────────────────────────┐
│  HeyReach Outreach Agent                            [Jan] [Logout]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │  TODAY'S STATS    │  │  PENDING DRAFTS   │  │  QUICK ACTIONS  │  │
│  │                   │  │                   │  │                 │  │
│  │  Processed: 45    │  │  Awaiting: 12     │  │ [Run Dry-Run]   │  │
│  │  Sent: 38         │  │  High conf: 8     │  │ [Run Live]      │  │
│  │  Skipped: 7       │  │  Low conf: 4      │  │ [View Drafts]   │  │
│  │  Errors: 0        │  │                   │  │                 │  │
│  └───────────────────┘  └───────────────────┘  └─────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  RECENT RUNS                                                │    │
│  │                                                             │    │
│  │  ● 2026-01-09 14:30  Live     45 processed  38 sent  ✓     │    │
│  │  ● 2026-01-09 08:00  Dry-Run  52 processed  0 sent   ✓     │    │
│  │  ● 2026-01-08 22:00  Live     48 processed  41 sent  ✓     │    │
│  │  ● 2026-01-08 14:30  Live     39 processed  35 sent  ✓     │    │
│  │                                           [View All Runs →] │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  SYSTEM STATUS                                              │    │
│  │                                                             │    │
│  │  OpenAI API:     ● Connected    Vector Store: 8 files      │    │
│  │  HeyReach API:   ● Connected    Accounts: 30 active        │    │
│  │  MongoDB:        ● Connected    Send Mode: DISABLED        │    │
│  │                                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Draft Review Page

```
┌─────────────────────────────────────────────────────────────────────┐
│  Draft Review                                    [← Back] [Refresh] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  12 drafts pending  │  [Approve All High-Conf]  [Reject All]       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Maria Garcia - HR Manager at TechCorp           [ES] 95%  │    │
│  │  ─────────────────────────────────────────────────────────  │    │
│  │  THEIR MESSAGE:                                             │    │
│  │  "Hola! Me interesa saber más sobre cómo funciona esto.    │    │
│  │   ¿Tienen precios especiales para empresas pequeñas?"       │    │
│  │                                                             │    │
│  │  OUR DRAFT:                                                 │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │ ¡Hola Maria! Qué gusto que te interese.             │   │    │
│  │  │                                                      │   │    │
│  │  │ Te cuento: publicar vacantes es 100% gratis. Solo   │   │    │
│  │  │ pagas $50 USD/mes si quieres contactar candidatos.  │   │    │
│  │  │                                                      │   │    │
│  │  │ ¿Te gustaría probar publicando una vacante primero? │   │    │
│  │  │ share.cazvid.app/...                                │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                             │    │
│  │  Analysis: INTEREST → ENGAGE | Stage: ENGAGED              │    │
│  │  ✓ Guardrails passed  ✓ Required links included            │    │
│  │                                                             │    │
│  │              [✓ Approve]  [✎ Edit & Approve]  [✗ Reject]   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  John Smith - CEO at StartupXYZ                  [EN] 72%  │    │
│  │  ─────────────────────────────────────────────────────────  │    │
│  │  THEIR MESSAGE:                                             │    │
│  │  "Thanks"                                                   │    │
│  │                                                             │    │
│  │  OUR DRAFT:                                                 │    │
│  │  ┌─────────────────────────────────────────────────────┐   │    │
│  │  │ Happy to help, John!                                │   │    │
│  │  │                                                      │   │    │
│  │  │ Would you like me to share more about how our video │   │    │
│  │  │ profiles work? Or if you're ready, you can post     │   │    │
│  │  │ your first job here: share.cazvid.app/...           │   │    │
│  │  └─────────────────────────────────────────────────────┘   │    │
│  │                                                             │    │
│  │  Analysis: GRATITUDE → PROBE | Stage: ENGAGED              │    │
│  │  ⚠ Low confidence - recommend human review                 │    │
│  │                                                             │    │
│  │              [✓ Approve]  [✎ Edit & Approve]  [✗ Reject]   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Run Trigger Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  Start New Run                                           [✕]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Mode:                                                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ◉ Dry Run (drafts only, no sending)                   │    │
│  │  ○ Live (send after approval)                          │    │
│  │  ○ Live + Auto-approve (send high-confidence directly) │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Max Messages: [30        ] ▼                                   │
│                                                                 │
│  Campaigns:                                                     │
│  ☑ CazVid                                                       │
│  ☑ Agency Leads                                                 │
│                                                                 │
│  Accounts:                                                      │
│  ☑ All 30 accounts                                              │
│  ○ Select specific accounts...                                  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│                              [Cancel]  [Start Run →]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Step-by-Step Implementation Plan

### Phase 0: Prerequisites (1-2 hours)

| Step | Task | Details |
|------|------|---------|
| 0.1 | Create OpenAI account | platform.openai.com, add payment method |
| 0.2 | Get API key | Dashboard → API Keys → Create new key |
| 0.3 | Create Vector Store | Dashboard → Storage → Create vector store |
| 0.4 | Create Render account | render.com, connect GitHub |
| 0.5 | Set up MongoDB Atlas | If not already done, create free cluster |
| 0.6 | Create Redis instance | Render Redis or Upstash |

### Phase 1: Knowledge Base Setup (2-3 hours)

| Step | Task | Details |
|------|------|---------|
| 1.1 | Prepare files | Copy training docs to `knowledge/` folder |
| 1.2 | Upload to OpenAI | Use Files API to upload each document |
| 1.3 | Add to Vector Store | Attach files to your Vector Store |
| 1.4 | Test retrieval | Make test queries to verify file_search works |
| 1.5 | Create sync script | Automate future updates to Vector Store |

```bash
# Script: scripts/setup-vector-store.ts
# Uploads all knowledge files and creates/updates the Vector Store
```

### Phase 2: Core API Development (4-6 hours)

| Step | Task | Details |
|------|------|---------|
| 2.1 | Initialize Next.js | `npx create-next-app@latest heyreach-web-agent` |
| 2.2 | Set up project structure | Create folders as specified |
| 2.3 | Implement OpenAI client | `src/lib/openai.ts` with Responses API |
| 2.4 | Implement HeyReach client | Port from existing `heyreach-api.js` |
| 2.5 | Implement guardrails | `src/lib/guardrails.ts` |
| 2.6 | Implement MongoDB models | Run, Draft, SentRegistry schemas |
| 2.7 | Create API routes | `/api/runs`, `/api/drafts`, etc. |
| 2.8 | Test API locally | Use Postman/curl to verify endpoints |

### Phase 3: Worker Implementation (3-4 hours)

| Step | Task | Details |
|------|------|---------|
| 3.1 | Set up Bull queue | Redis connection, job definitions |
| 3.2 | Create processor worker | Main processing logic |
| 3.3 | Implement conversation flow | Fetch → Analyze → Generate → Validate |
| 3.4 | Add logging | Structured logs for debugging |
| 3.5 | Test worker locally | Process test conversations |

### Phase 4: Web UI Development (4-6 hours)

| Step | Task | Details |
|------|------|---------|
| 4.1 | Install UI dependencies | Tailwind, shadcn/ui, etc. |
| 4.2 | Build Dashboard page | Stats, quick actions, recent runs |
| 4.3 | Build Runs page | History list, run details |
| 4.4 | Build Drafts page | Review interface with approve/reject |
| 4.5 | Build Settings page | Configuration management |
| 4.6 | Add authentication | Simple auth (email allowlist) |
| 4.7 | Test UI locally | Full workflow testing |

### Phase 5: Deployment (2-3 hours)

| Step | Task | Details |
|------|------|---------|
| 5.1 | Create `render.yaml` | Web service + worker config |
| 5.2 | Set environment variables | All secrets in Render dashboard |
| 5.3 | Deploy to Render | Connect repo, deploy |
| 5.4 | Test production | Full workflow on live system |
| 5.5 | Set up monitoring | Error tracking, alerts |

### Phase 6: Go Live (1-2 hours)

| Step | Task | Details |
|------|------|---------|
| 6.1 | Dry-run testing | Multiple dry runs to verify behavior |
| 6.2 | Enable sending | Set `SEND_ENABLED=true` |
| 6.3 | First live run | Small batch with full review |
| 6.4 | Monitor and iterate | Adjust based on results |

---

## Part 7: Render Deployment Configuration

### render.yaml

```yaml
services:
  # Main web application
  - type: web
    name: heyreach-agent
    runtime: node
    buildCommand: npm ci && npm run build
    startCommand: npm start
    envVars:
      - key: OPENAI_API_KEY
        sync: false  # Set manually in dashboard
      - key: OPENAI_VECTOR_STORE_ID
        sync: false
      - key: HEYREACH_API_KEY
        sync: false
      - key: MONGODB_URI
        sync: false
      - key: REDIS_URL
        fromService:
          name: heyreach-redis
          type: redis
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: SEND_ENABLED
        value: "false"  # Safety default

  # Background worker for processing jobs
  - type: worker
    name: heyreach-worker
    runtime: node
    buildCommand: npm ci
    startCommand: npm run worker
    envVars:
      # Same as web service
      - key: OPENAI_API_KEY
        sync: false
      # ... (same env vars)

  # Redis for job queue
  - type: redis
    name: heyreach-redis
    plan: starter  # 25MB, free
```

---

## Part 8: Cost Estimates

### Monthly Operating Costs (estimated)

| Service | Tier | Est. Cost |
|---------|------|-----------|
| **Render Web** | Starter | $7/month |
| **Render Worker** | Starter | $7/month |
| **Render Redis** | Starter | Free |
| **MongoDB Atlas** | M0 (Free) or M10 | $0-57/month |
| **OpenAI API** | Pay-as-you-go | $10-50/month* |

*OpenAI costs depend on:
- Model: gpt-5-mini (primary) + gpt-5 (review for high-risk items)
- Volume: ~100 conversations/day = ~3000/month
- file_search adds minimal cost

**Total estimated: $25-120/month** depending on volume and model choice.

---

## Part 9: Training Workflow (Local Claude Code)

You mentioned keeping training local with Claude Code. Here's how that fits:

### Sync Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOCAL (Claude Code + Training)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /train-heyreach  →  Updates knowledge files locally                 │
│       │                                                              │
│       ▼                                                              │
│  training/knowledge-base.md (updated)                                │
│  training/edge-cases.md (updated)                                    │
│  etc.                                                                │
│       │                                                              │
│       ▼                                                              │
│  git commit + push                                                   │
│                                                                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUD (OpenAI Vector Store)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  GitHub Action or Manual script triggers:                            │
│       │                                                              │
│       ▼                                                              │
│  scripts/sync-knowledge.ts                                           │
│       │                                                              │
│       ▼                                                              │
│  OpenAI Files API → upload changed files                             │
│       │                                                              │
│       ▼                                                              │
│  Vector Store updated                                                │
│       │                                                              │
│       ▼                                                              │
│  Web agent now uses updated knowledge                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Sync Script Example

```typescript
// scripts/sync-knowledge.ts
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI();
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID!;

const KNOWLEDGE_FILES = [
  'agent-persona.md',
  'config.md',
  'training/knowledge-base.md',
  'training/conversation-analysis-framework.md',
  'training/edge-cases.md',
  'training/quality-rubric.md',
  'training/deal-tracking.md',
  'training/curriculum.md'
];

async function syncKnowledge() {
  // 1. Get current files in vector store
  const currentFiles = await openai.vectorStores.files.list(VECTOR_STORE_ID);

  // 2. Delete old versions
  for (const file of currentFiles.data) {
    await openai.vectorStores.files.del(VECTOR_STORE_ID, file.id);
  }

  // 3. Upload new versions
  for (const filePath of KNOWLEDGE_FILES) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const file = await openai.files.create({
        file: fs.createReadStream(fullPath),
        purpose: 'assistants'  // Required for vector stores
      });

      await openai.vectorStores.files.create(VECTOR_STORE_ID, {
        file_id: file.id
      });

      console.log(`Uploaded: ${filePath}`);
    }
  }

  console.log('Knowledge base sync complete!');
}

syncKnowledge();
```

---

## Part 10: Configuration Decisions (FINALIZED)

### Model Strategy: Two-Tier Quality Control
| Tier | Model | Use Case |
|------|-------|----------|
| **Primary** | `gpt-5-mini` | All initial draft generation (fast, cheap) |
| **Review** | `gpt-5` | Second-pass review for high-risk items (pricing mentions, escalations, low confidence) |

### Approval Flow
- **Auto-approve**: Drafts with confidence ≥ 85% AND no guardrail warnings
- **Manual review**: Everything else (low confidence, escalations, guardrail flags)

### Scheduling
- **None** - Manual trigger only via web UI
- Keep architecture simple: no cron, no Bull queue initially
- Can add later if needed

### Scope
- Web UI for manual triggering and draft review
- No mobile app, no Claude iOS MCP integration (for now)
- Responsive web UI works on phone browsers

---

## Appendix A: File Templates

### A.1 OpenAI Client (src/lib/openai.ts)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID!;

export interface GenerateResponseInput {
  prospect: {
    firstName: string;
    lastName: string;
    headline: string;
    companyName: string;
    location: string;
    tags: string[];
  };
  conversation: {
    id: string;
    messages: Array<{
      sender: 'ME' | 'CORRESPONDENT';
      text: string;
      timestamp: string;
    }>;
  };
  campaign: 'CazVid' | 'AgencyLeads';
}

export interface GeneratedResponse {
  analysis: {
    intent: string;
    emotion: string;
    energy_level: string;
    deal_stage: string;
    language: string;
  };
  action: 'ENGAGE' | 'PROBE' | 'HOLD' | 'CLOSE' | 'ESCALATE';
  reasoning: string;
  message: string;
  confidence: number;
  guardrail_check: {
    no_false_free_claims: boolean;
    no_fabricated_features: boolean;
    appropriate_length: boolean;
    energy_matched: boolean;
  };
}

export async function generateOutreachResponse(
  input: GenerateResponseInput
): Promise<GeneratedResponse> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);

  const response = await openai.responses.create({
    model: process.env.OPENAI_PRIMARY_MODEL || 'gpt-5-mini',
    tools: [
      {
        type: 'file_search',
        vector_store_ids: [VECTOR_STORE_ID],
      },
    ],
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'outreach_response',
        schema: RESPONSE_SCHEMA,
      },
    },
  });

  // Parse the JSON response
  const result = JSON.parse(response.output_text);
  return result as GeneratedResponse;
}

function buildSystemPrompt(): string {
  return `
You are a Business Developer AI assistant processing LinkedIn conversations.
Your job is to analyze conversations and generate appropriate responses.

BEFORE generating any response, you MUST use file_search to retrieve:
1. Agent persona and communication guidelines
2. Product information (CazVid or Agency Leads)
3. Critical guardrails and pricing rules
4. Relevant edge cases for this situation

CRITICAL RULES (never violate):
- Never claim contacting candidates is free (it's $50/month)
- Never claim all candidates have videos
- Never push after a clear decline
- Always include required links when appropriate

OUTPUT FORMAT: You must return valid JSON matching the provided schema.
`;
}

function buildUserPrompt(input: GenerateResponseInput): string {
  const { prospect, conversation, campaign } = input;

  return `
## PROSPECT PROFILE
- Name: ${prospect.firstName} ${prospect.lastName}
- Headline: ${prospect.headline}
- Company: ${prospect.companyName}
- Location: ${prospect.location}
- Tags: ${prospect.tags?.join(', ') || 'None'}

## CAMPAIGN
Type: ${campaign} (${campaign === 'CazVid' ? 'Video hiring platform' : 'Lead generation service'})

## CONVERSATION HISTORY
${conversation.messages.map(m =>
  `[${m.sender === 'ME' ? 'US' : 'PROSPECT'}]: ${m.text}`
).join('\n')}

## TASK
1. Use file_search to retrieve relevant guidelines for this situation
2. Analyze the prospect's last message (intent, emotion, energy level)
3. Determine the deal stage (COLD/ENGAGED/QUALIFIED/ACTION/WON/LOST)
4. Decide on action: ENGAGE, PROBE, HOLD, CLOSE, or ESCALATE
5. Generate an appropriate response

Return your analysis and response as JSON.
`;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    analysis: {
      type: 'object',
      properties: {
        intent: { type: 'string' },
        emotion: { type: 'string' },
        energy_level: { type: 'string' },
        deal_stage: { type: 'string' },
        language: { type: 'string' },
      },
      required: ['intent', 'emotion', 'energy_level', 'deal_stage', 'language'],
    },
    action: { type: 'string', enum: ['ENGAGE', 'PROBE', 'HOLD', 'CLOSE', 'ESCALATE'] },
    reasoning: { type: 'string' },
    message: { type: 'string' },
    confidence: { type: 'number' },
    guardrail_check: {
      type: 'object',
      properties: {
        no_false_free_claims: { type: 'boolean' },
        no_fabricated_features: { type: 'boolean' },
        appropriate_length: { type: 'boolean' },
        energy_matched: { type: 'boolean' },
      },
    },
  },
  required: ['analysis', 'action', 'reasoning', 'message', 'confidence', 'guardrail_check'],
};
```

### A.2 HeyReach Client (src/lib/heyreach.ts)

```typescript
const BASE_URL = process.env.HEYREACH_BASE_URL || 'https://api.heyreach.io';
const API_KEY = process.env.HEYREACH_API_KEY!;

async function heyreachFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HeyReach API error: ${response.status}`);
  }

  return response.json();
}

export async function getConversations(params: {
  linkedInAccountIds: number[];
  campaignIds: number[];
  seen?: boolean;
  limit?: number;
}) {
  return heyreachFetch('/api/v1/conversations/v2', {
    method: 'POST',
    body: JSON.stringify({
      linkedInAccountIds: params.linkedInAccountIds,
      campaignIds: params.campaignIds,
      seen: params.seen ?? false,
      limit: params.limit ?? 25,
    }),
  });
}

export async function getChatroom(accountId: number, conversationId: string) {
  return heyreachFetch(
    `/api/v1/conversations/chatroom?accountId=${accountId}&conversationId=${conversationId}`
  );
}

export async function sendMessage(params: {
  linkedInAccountId: number;
  conversationId: string;
  message: string;
}) {
  return heyreachFetch('/api/v1/conversations/send-message', {
    method: 'POST',
    body: JSON.stringify({
      linkedInAccountId: params.linkedInAccountId,
      conversationId: params.conversationId,
      message: params.message,
      subject: '',
    }),
  });
}
```

---

This plan provides everything you need to build a production-ready web-accessible agent. The key innovation is using OpenAI's Responses API with file_search to give the AI "knowledge" of your training materials, while your web app controls all the infrastructure, safety, and business logic.

**Would you like me to start implementing any specific part of this plan?**
