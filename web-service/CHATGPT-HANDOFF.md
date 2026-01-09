# ChatGPT Handoff Document

**Context**: Claude Code created a web service for HeyReach LinkedIn outreach automation. This document summarizes what was built and what might need discussion.

---

## What Was Built

A simple Node.js/Express web service that:

1. **Exposes HTTP endpoints** to trigger LinkedIn outreach processing
2. **Uses Claude API** (Anthropic) to generate intelligent, personalized responses
3. **Calls HeyReach API** directly for fetching conversations and sending messages
4. **Includes Sentry** integration for error tracking
5. **Deploys to Render** with a cron job for nightly automation

## File Structure

```
web-service/
├── src/
│   ├── index.js        # Express server with endpoints
│   ├── config.js       # Configuration from env vars
│   ├── heyreach-api.js # HeyReach REST API wrapper
│   ├── agent.js        # Claude AI response generation
│   ├── knowledge.js    # Embedded knowledge base
│   ├── processor.js    # Main processing logic
│   └── cli.js          # CLI for local testing
├── package.json
├── render.yaml         # Render deployment config
├── .env.example        # Environment template
└── README.md
```

## Key Design Decisions

### 1. Uses Claude API (Not OpenAI)
The original system was built on Claude Code with Claude's capabilities. The web service continues using Anthropic's Claude API for consistency with the existing training and persona.

**If you want to switch to OpenAI:**
- Replace `@anthropic-ai/sdk` with `openai` package
- Modify `agent.js` to use OpenAI's `responses.create()` instead of Anthropic's `messages.create()`
- The prompt structure would need adjustment

### 2. Knowledge Base is Embedded (Not RAG)
For simplicity, the knowledge base is embedded directly in `knowledge.js` rather than using vector stores or RAG.

**To add OpenAI RAG:**
- Create a Vector Store in OpenAI and upload the training files
- Modify `agent.js` to use file_search tool
- This would allow dynamic knowledge updates without code changes

### 3. Processing Flow

```
Trigger (HTTP/Cron)
       │
       ▼
┌──────────────────┐
│  Fetch unseen    │
│  conversations   │──► HeyReach API
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  For each conv:  │
│  Get full chat   │──► HeyReach API
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Generate        │
│  response        │──► Claude API
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Validate        │
│  guardrails      │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│  Send message    │
│  (or dry-run)    │──► HeyReach API
└──────────────────┘
```

### 4. Safety Mechanisms

- **Guardrail validation** before sending (checks pricing claims, required elements)
- **Dry-run mode** for preview without sending
- **API key authentication** on all endpoints
- **Rate limit handling** with exponential backoff
- **Sentry error tracking** for production monitoring

## What Might Need Discussion

### 1. OpenAI vs Claude
The current implementation uses Claude. If you want to use OpenAI instead for consistency with their platform:
- Swap the SDK
- Adjust prompt formatting
- Consider using OpenAI's Vector Store for knowledge

### 2. Knowledge Base Updates
Currently knowledge is hardcoded. Options:
- **Simple**: Edit `knowledge.js` and redeploy
- **Dynamic**: Use OpenAI Vector Store + file_search
- **Database**: Store in MongoDB and fetch at runtime

### 3. Approval Workflow
Current design: either auto-send or dry-run preview.

For a "draft and approve" flow:
- Store drafts in database
- Add `/drafts` endpoint to list pending
- Add `/drafts/:id/approve` endpoint
- Only send when approved

### 4. Mobile Access
Current options:
- HTTP request from any client
- iOS Shortcut to trigger endpoint
- Simple web dashboard

For Claude iOS integration as ChatGPT suggested:
- Would need to build a Remote MCP server
- Expose tools like `outreach.run()`, `outreach.status()`
- More complex but allows natural language control

### 5. Cost Optimization
- Consider `claude-3-haiku` for cheaper runs
- Or OpenAI's `gpt-4o-mini`
- Batch processing for nightly runs

## Environment Variables Needed

```
HEYREACH_API_KEY=MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4=
ANTHROPIC_API_KEY=sk-ant-api03-xxx
SERVICE_API_KEY=random-secret-for-auth
SENTRY_DSN=https://xxx@sentry.io/yyy
```

## Deployment Steps

1. Push `web-service/` folder to GitHub
2. Create Render account
3. New > Blueprint > Connect repo > Select render.yaml
4. Add environment variables in Render dashboard
5. Deploy

## Questions for Further Discussion

1. Do you want to switch from Claude to OpenAI for the AI brain?
2. Should drafts require manual approval before sending?
3. Do you need a proper web dashboard or is API-only sufficient?
4. How should the knowledge base be updated (code vs. dynamic)?
5. What monitoring/alerting do you need beyond Sentry?

---

**Share this document with ChatGPT to continue the implementation discussion.**
