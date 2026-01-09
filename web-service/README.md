# HeyReach Outreach Web Service

A simple web service that automates your LinkedIn outreach via HeyReach. Deployable to Render with Sentry error tracking.

## What This Does

1. **Fetches** unseen LinkedIn conversations from HeyReach
2. **Analyzes** each conversation using Claude AI
3. **Generates** intelligent, personalized responses
4. **Sends** messages (or previews in dry-run mode)
5. **Logs** all activity with full audit trail

## Quick Start (Local)

```bash
# 1. Install dependencies
cd web-service
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env with your API keys

# 3. Test the connection
npm run health

# 4. Dry-run (preview without sending)
npm run process:dry

# 5. Live run (actually sends messages)
npm run process
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/status` | GET | Yes | Service status |
| `/process` | POST | Yes | Trigger processing |
| `/cron/nightly` | POST | Yes | For scheduled jobs |

### Authentication

All authenticated endpoints require the `X-API-KEY` header (or `?api_key=` query param).

### Process Endpoint

```bash
# Dry run
curl -X POST https://your-service.onrender.com/process \
  -H "X-API-KEY: your-key" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": true, "maxMessages": 10}'

# Live run
curl -X POST https://your-service.onrender.com/process \
  -H "X-API-KEY: your-key" \
  -H "Content-Type: application/json" \
  -d '{"dryRun": false, "maxMessages": 30}'
```

## Deploy to Render

### Option 1: Using Blueprint (Recommended)

1. Push this `web-service` folder to a GitHub repo
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" > "Blueprint"
4. Connect your repo and select the `render.yaml` file
5. Set your environment variables in the dashboard

### Option 2: Manual Setup

1. Create a new "Web Service" in Render
2. Connect your GitHub repo
3. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables (see `.env.example`)

### Setting Up Nightly Cron

1. In Render, create a new "Cron Job"
2. Connect the same repo
3. Set:
   - Schedule: `0 6 * * *` (6 AM UTC daily)
   - Command: `node src/cli.js process --max=30`
4. Share environment variables from the web service

## Setting Up Sentry

1. Go to [sentry.io](https://sentry.io) and create a project
2. Select "Node.js" as the platform
3. Copy the DSN from the setup page
4. Add `SENTRY_DSN` to your environment variables

Sentry will automatically capture:
- Uncaught exceptions
- Unhandled promise rejections
- All errors during processing

## Mobile Access

### From Claude iOS App

The service itself doesn't connect to Claude iOS. For mobile access:

1. **Web trigger**: Open Safari/Chrome and hit your `/process` endpoint
2. **Shortcuts app**: Create an iOS Shortcut that makes the HTTP request
3. **Dashboard**: Build a simple mobile-friendly web page

### Example iOS Shortcut

1. Open Shortcuts app
2. New Shortcut > "Get Contents of URL"
3. URL: `https://your-service.onrender.com/process`
4. Method: POST
5. Headers: `X-API-KEY: your-key`
6. Body: `{"dryRun": false, "maxMessages": 30}`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HEYREACH_API_KEY` | Yes | Your HeyReach API key |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `SERVICE_API_KEY` | Recommended | Auth key for your endpoints |
| `SENTRY_DSN` | Recommended | Sentry error tracking |
| `FETCH_LIMIT` | No | Max conversations to fetch (default: 25) |
| `MAX_MESSAGES_PER_RUN` | No | Max messages per run (default: 30) |
| `CLAUDE_MODEL` | No | Model to use (default: claude-sonnet-4-20250514) |

## Architecture

```
Mobile/Web/Cron
      |
      v
  [Express API]
      |
      +---> [Processor]
              |
              +---> HeyReach API (fetch conversations)
              |
              +---> Claude API (generate responses)
              |
              +---> HeyReach API (send messages)
              |
              +---> Sentry (error tracking)
```

## Costs

- **Render Free Tier**: $0/month (750 hours, sleeps after inactivity)
- **Render Starter**: $7/month (always on, better for production)
- **Claude API**: ~$0.003-0.015 per conversation (varies by model)
- **Sentry Free Tier**: 5K errors/month free

## Files

```
web-service/
├── src/
│   ├── index.js       # Express server
│   ├── config.js      # Configuration
│   ├── heyreach-api.js # HeyReach API wrapper
│   ├── agent.js       # Claude AI agent
│   ├── knowledge.js   # Knowledge base
│   ├── processor.js   # Main processing logic
│   └── cli.js         # Command line interface
├── package.json
├── render.yaml        # Render deployment config
├── .env.example       # Environment template
└── README.md
```

## Troubleshooting

### "API Key not set"
Make sure `HEYREACH_API_KEY` and `ANTHROPIC_API_KEY` are in your `.env` file.

### "Unauthorized" on endpoints
Check that your `SERVICE_API_KEY` matches what you're sending in `X-API-KEY` header.

### Rate limit errors
HeyReach allows 300 requests/minute. The service has built-in retry with backoff.

### No conversations found
- Check that you have IN_PROGRESS campaigns
- Verify the LinkedIn account IDs match your HeyReach account
- Ensure there are unseen conversations with prospect replies
