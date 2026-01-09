# Training Run Logs

This folder contains detailed execution logs from training sessions. These are step-by-step traces for debugging and improvement.

## Purpose

| Log Type | Purpose |
|----------|---------|
| **Session Summaries** (`sessions/`) | High-level outcomes, decisions made, changes implemented |
| **Run Logs** (`run-logs/`) | Detailed execution trace, API calls, errors, decisions |

## File Naming Convention

```
YYYY-MM-DD_HH-MM_mode-N.md
```

Examples:
- `2026-01-03_14-30_review-tagged-1.md`
- `2026-01-03_15-00_learn-from-jan-1.md`
- `2026-01-03_16-00_system-improvement-1.md`

## Log Structure

Each run log should follow this template:

```markdown
# Run Log: [Mode Name]
**Started:** YYYY-MM-DD HH:MM
**Mode:** [1-7]
**Status:** In Progress / Completed / Failed

---

## Step 1: [Step Name]
**Time:** HH:MM
**Action:** [What was attempted]
**API Call:** [If applicable]
**Result:** [What happened]
**Notes:** [Any observations]

---

## Step 2: ...

---

## Errors Encountered
| Time | Error | Context | Resolution |
|------|-------|---------|------------|
| HH:MM | [Error message] | [What we were doing] | [How it was fixed] |

---

## Final Status
**Completed:** Yes/No
**Conversations Processed:** N
**Messages Sent:** N
**Changes Made:** [List]
**Issues to Address:** [List]

---

## Token Usage
| Metric | Count |
|--------|-------|
| Input Tokens | X,XXX |
| Output Tokens | X,XXX |
| Total Tokens | X,XXX |
| Estimated Cost | $X.XX |

*Cost calculated at: Input $15/1M, Output $75/1M (Claude Opus 4.5)*
```

## What to Log

### Always Log
- API calls made (tool name, key parameters)
- API responses (summary, not full data unless error)
- Decisions made and why
- Errors and how they were handled
- User interactions/clarifications
- **Token usage** (input, output, total, cost) - REQUIRED for cost tracking

### Log Selectively
- Full conversation content (only for debugging)
- Large API responses (reference api-logs/ instead)

## Example Entries

### API Call Entry
```
## Fetch Conversations
**Time:** 14:32
**Action:** Fetch seen conversations with tags
**API Call:** `get_conversations_v2(seen=true, limit=25, offset=0)`
**Result:** 25 conversations returned, 3 with quality tags
**Notes:** Tags found: 2x "Bad AI Handling", 1x "Good AI Handling"
```

### Error Entry
```
## Error: Tag Filtering Failed
**Time:** 14:35
**Error:** `AttributeError: 'str' object has no attribute 'get'`
**Context:** Parsing large API response saved to file
**Resolution:** Used correct wrapped JSON parsing from knowledge-base.md
```

### Decision Entry
```
## Decision: Skip Conversation
**Time:** 14:40
**Conversation:** conv-abc123 (Maria Garcia)
**Trigger:** "gracias pero ya cerré la vacante"
**Decision:** SKIP - Exclusion phrase "cerré la vacante" detected
**Confidence:** HIGH
```

## Error Logging Standards

When an error occurs during a run, you MUST:

### 1. Log in Run Log (Immediate)

Add to the "Errors Encountered" table:

```markdown
## Errors Encountered
| Time | Error | Context | Resolution |
|------|-------|---------|------------|
| HH:MM | [Error message] | [What we were doing] | [PENDING/How it was fixed] |
```

### 2. Add to Error Registry (Within Same Session)

If the error is new (not already in registry):

1. Read `training/error-registry.md`
2. Assign next ERR-XXX number
3. Add new error entry using template
4. Set status = OPEN

If error matches existing entry:
- Reference existing ERR-XXX in run log
- Don't create duplicate

### 3. Error Severity Guide

| Severity | Criteria |
|----------|----------|
| CRITICAL | System completely non-functional |
| HIGH | Core feature broken, workaround difficult |
| MEDIUM | Feature impacted, workaround exists |
| LOW | Minor issue, doesn't block work |

### 4. Link Run Log to Error

In error-registry.md, always include:
```
**Run Log** | `YYYY-MM-DD_HH-MM_mode-N.md`
```

This enables `/troubleshoot` to trace errors back to full context.

---

## Retention

- Keep run logs for 30 days minimum
- Archive logs from sessions that led to major improvements
- Delete routine successful runs after 30 days
- NEVER delete run logs linked to OPEN errors
