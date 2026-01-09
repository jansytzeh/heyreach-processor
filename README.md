# HeyReach Business Developer Agent

An intelligent AI agent that handles all LinkedIn conversations for CazVid and Agency Leads campaigns like a skilled business development professional.

> **Version 3.0** - Complete transformation from template-based to intelligent agent

---

## What's New in v3.0

This system has evolved from a trigger/template matcher into a **true Business Developer Agent**:

| Before (v2.x) | Now (v3.0) |
|---------------|------------|
| Match triggers → Apply template | Analyze context → Strategic response |
| 13 rigid response types | Handles ANY conversation intelligently |
| Binary decision logic | Nuanced understanding of prospects |
| Energy matching only | Full emotional intelligence |
| Reactive responses | Proactive deal advancement |

---

## Quick Start

1. Open a terminal in this folder
2. Run `claude` to start Claude Code
3. Use `/process-heyreach` to handle conversations

---

## Commands

| Command | What It Does |
|---------|--------------|
| `/process-heyreach` | Process conversations as a Business Developer |
| `/train-heyreach` | Train the AI (9 modes) |
| `/recommend` | Get training recommendations |
| `/troubleshoot` | Diagnose and fix errors |
| `/metrics` | View performance stats |
| `/update-config` | Change settings |
| `/update-lead-samples` | Update Agency Leads samples |

---

## How the Agent Thinks

For every conversation, the agent:

1. **Gathers Context** - Who is this person? What's their situation?
2. **Analyzes Message** - What are they saying? What do they need?
3. **Assesses Stage** - Where are they in the deal progression?
4. **Decides Strategy** - Engage, probe, hold, close, or escalate?
5. **Crafts Response** - Human, personalized, strategic
6. **Quality Checks** - Ensures guardrails before sending

---

## Agent Identity

The agent operates as a **Business Developer** representing:

### CazVid
A hiring platform where employers post jobs for free, receive candidate applications by email, and pay $50/month to contact candidates directly.

### Agency Leads
A lead generation service providing staffing agencies with companies actively hiring.

---

## Core Files

```
agent-persona.md                    → Agent identity and decision framework
config.md                           → Settings, links, guardrails
.claude/commands/process-heyreach.md → Processing workflow
training/knowledge-base.md          → Learned patterns
training/conversation-analysis-framework.md → Analysis methodology
training/deal-tracking.md           → Deal stage system
```

---

## Run Modes

| Mode | Description |
|------|-------------|
| **Live** | Send messages for real |
| **Dry-Run** | Preview messages without sending (safe testing) |

---

## Deal Stages

The agent tracks prospects through:

| Stage | Description |
|-------|-------------|
| **Cold** | Initial contact |
| **Engaged** | They responded |
| **Qualified** | Confirmed fit and need |
| **Action** | Ready to take next step |
| **Won** | Completed action |
| **Lost** | Declined or disqualified |

---

## Critical Guardrails

The agent NEVER:
- Claims contacting candidates is free (costs $50/month)
- Claims all candidates have video profiles (not true)
- Skips required links when advancing to action
- Responds after clear decline
- Fabricates context not mentioned by prospect

---

## Training System

The AI improves through structured learning:

| Level | Focus |
|-------|-------|
| 1 | Foundation - Basic accuracy |
| 2 | Exclusions - Edge case handling |
| 3 | Personalization - Natural variation |
| 4 | Context - Deep personalization |
| 5 | Negotiation - Chris Voss techniques |
| 6 | Mastery - Predictive responses |

Use `/recommend` to see what to train on next.

---

## Tagging in HeyReach

### Quality Tags
| Tag | Meaning |
|-----|---------|
| `AI Input` | AI handled this |
| `Manual Handled Jan` | Jan handled manually |
| `Good AI Handling` | AI did well |
| `Bad AI Handling` | AI made mistake |

### Outcome Tags
| Tag | Meaning |
|-----|---------|
| `Positive Outcome` | Showed interest |
| `Converted` | Took action |
| `Negative Outcome` | Declined |

---

## Troubleshooting

If something goes wrong:

1. Run `/troubleshoot`
2. Check `training/error-registry.md`
3. Review recent run logs in `training/run-logs/`

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   AGENT PERSONA                          │
│              (agent-persona.md)                          │
│  Identity • Mission • Decision Framework • Techniques    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 CONVERSATION ANALYSIS                    │
│        (training/conversation-analysis-framework.md)     │
│  Context • Intent • Emotion • Stage • Strategy           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 PROCESSING ENGINE                        │
│           (.claude/commands/process-heyreach.md)         │
│  Fetch • Analyze • Decide • Generate • Send • Log        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    GUARDRAILS                            │
│                   (config.md)                            │
│  Pricing Truth • Required Elements • Never Do List       │
└─────────────────────────────────────────────────────────┘
```

---

*Built for CazVid and Agency Leads by CV LLC*
