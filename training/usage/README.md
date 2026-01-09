# Token Usage Tracking

This folder contains daily token usage logs for cost tracking and ROI analysis.

## Structure

```
usage/
  YYYY-MM-DD.json    # Daily summary (machine-readable)
  YYYY-MM-DD.md      # Daily report (human-readable)
```

## Daily JSON Format

Each day creates a `YYYY-MM-DD.json` file:

```json
{
  "date": "2026-01-07",
  "runs": [
    {
      "timestamp": "2026-01-07T14:30:00",
      "run_type": "process",
      "run_log": "2026-01-07_14-30_process-1.md",
      "tokens": {
        "input": 15000,
        "output": 3000,
        "total": 18000
      },
      "metrics": {
        "conversations_processed": 25,
        "messages_sent": 8,
        "errors": 0
      }
    }
  ],
  "totals": {
    "runs": 3,
    "input_tokens": 45000,
    "output_tokens": 9000,
    "total_tokens": 54000,
    "estimated_cost_usd": 0.81
  },
  "outcomes": {
    "messages_sent": 15,
    "conversations_processed": 75,
    "training_updates": 2
  }
}
```

## Cost Calculation

Based on Claude Opus 4.5 pricing (as of Jan 2026):
- Input: $15.00 / 1M tokens
- Output: $75.00 / 1M tokens

Formula:
```
cost = (input_tokens * 0.000015) + (output_tokens * 0.000075)
```

## How to Log Token Usage

### 1. At End of Each Run

Add this section to your run log:

```markdown
## Token Usage
| Metric | Count |
|--------|-------|
| Input Tokens | 15,000 |
| Output Tokens | 3,000 |
| Total Tokens | 18,000 |
| Estimated Cost | $0.27 |
```

### 2. Update Daily JSON

After each run, append to today's `YYYY-MM-DD.json`:

```bash
# The AI agent should update this automatically
# Or use /metrics to generate reports
```

### 3. Getting Token Counts

Token usage is visible in Claude Code's session info. After a run:
- Check the session stats for input/output token counts
- Log these in the run log's "Token Usage" section

## Reports

Generate reports using `/metrics`:
- Daily summaries
- Weekly cost analysis
- ROI calculations (cost per message sent)

## Key Metrics for ROI

| Metric | Definition |
|--------|------------|
| **Cost per Message** | total_cost / messages_sent |
| **Cost per Conversation** | total_cost / conversations_processed |
| **Daily Run Cost** | Sum of all run costs |
| **Efficiency** | messages_sent / total_tokens * 1000 |

## Retention

- Keep daily JSON files for 90 days
- Generate monthly summaries for long-term tracking
- Archive to `usage/archive/` after 90 days
