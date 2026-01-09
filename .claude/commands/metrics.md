# HeyReach Metrics Dashboard

Generate aggregated metrics from run logs and training sessions.

## Modes

Ask the user which report to generate:

| Mode | Description |
|------|-------------|
| **Weekly Summary** | Last 7 days of activity |
| **All Time** | Complete historical metrics |
| **By Response Type** | Breakdown by CazVid/Agency Leads types |
| **Error Analysis** | Error frequency and resolution stats |

---

## Data Sources

| Source | Location | Data |
|--------|----------|------|
| Run logs | `training/run-logs/*.md` | Messages sent, skipped, errors |
| Error registry | `training/error-registry.md` | Error counts by type/status |
| Knowledge base | `training/knowledge-base.md` | Training statistics |
| Improvement log | `training/improvement-log.md` | Version history |

---

## Weekly Summary Report

1. **Read all run logs from last 7 days:**
   - Pattern: `training/run-logs/YYYY-MM-DD_*.md`
   - Extract: messages sent, skipped, errors

2. **Aggregate metrics:**

   ```markdown
   ## Weekly Summary: [Date Range]

   ### Processing Stats
   | Metric | Value |
   |--------|-------|
   | Total runs | X |
   | Messages sent | X |
   | Messages skipped | X |
   | Conversations processed | X |
   | Success rate | X% |

   ### By Response Type
   | Type | Sent | Skipped |
   |------|------|---------|
   | CazVid Thank-You (ES) | X | X |
   | CazVid Thank-You (EN) | X | X |
   | Agency Leads Decline | X | X |
   | Agency Leads Sample | X | X |

   ### Errors
   | Category | Count | Resolved |
   |----------|-------|----------|
   | API_ERROR | X | X |
   | MCP_ERROR | X | X |

   ### Training Sessions
   | Mode | Count |
   |------|-------|
   | Review Tagged | X |
   | Learn from Jan | X |
   ```

3. **Save report to:** `training/metrics/YYYY-MM-DD_weekly.md`

---

## All Time Report

Same structure as Weekly, but aggregate ALL run logs.

Save to: `training/metrics/YYYY-MM-DD_all-time.md`

---

## Error Analysis Report

1. **Read error registry**
2. **Generate breakdown:**

   ```markdown
   ## Error Analysis: [Date]

   ### By Status
   | Status | Count |
   |--------|-------|
   | OPEN | X |
   | IN_PROGRESS | X |
   | RESOLVED | X |
   | WONTFIX | X |

   ### By Category
   | Category | Total | Open | Resolved |
   |----------|-------|------|----------|
   | API_ERROR | X | X | X |
   | MCP_ERROR | X | X | X |
   | CONFIG_ERROR | X | X | X |

   ### Resolution Time
   | Error ID | Days Open |
   |----------|-----------|
   | ERR-XXX | X |

   ### Recurring Issues
   [List errors that have occurred multiple times]
   ```

---

## Output

All reports are saved to `training/metrics/` folder.

Display summary to user after generating.
