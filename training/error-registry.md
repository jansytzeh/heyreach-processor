# HeyReach Error Registry

> Last Updated: 2026-01-08
> Active Errors: 0 | Resolved: 9

Central tracking for all errors encountered during `/process-heyreach` and `/train-heyreach` runs. The `/troubleshoot` command uses this registry to identify, diagnose, and resolve issues.

---

## Error Status Workflow

```
OPEN → IN_PROGRESS → RESOLVED
                  → WONTFIX (not a real issue)
                  → NEEDS_MANUAL (cannot auto-fix)
```

---

## Error Categories

| Category | Description | Auto-Fixable |
|----------|-------------|--------------|
| `API_ERROR` | HeyReach API issues (rate limits, auth, timeouts) | Sometimes |
| `OVERFLOW_ERROR` | Response exceeds token/size limits | Yes (reduce limit) |
| `CONFIG_ERROR` | Configuration file issues | Yes |
| `TEMPLATE_ERROR` | Template substitution failures | Yes |
| `MCP_ERROR` | MCP connection/tool access issues | Sometimes |
| `LOGIC_ERROR` | Wrong processing decisions | Yes (update rules) |
| `DATA_ERROR` | Malformed data/parsing issues | Sometimes |

---

## Active Errors (OPEN / IN_PROGRESS)

*No active errors*

---

## Recently Resolved (Jan 2026)

### ERR-009: API Response Overflow (597KB)
| Field | Value |
|-------|-------|
| **ID** | ERR-009 |
| **Status** | RESOLVED |
| **Category** | OVERFLOW_ERROR |
| **Severity** | MEDIUM |
| **First Seen** | 2026-01-08 |
| **Resolved** | 2026-01-08 |
| **Run Log** | `2026-01-08_troubleshoot-1.md` |

**Error Message:**
```
File content (597.3KB) exceeds maximum allowed size (256KB). Please use offset and limit parameters to read specific portions of the file.
```

**Context:**
- Command: `/process-heyreach`
- Step: Reading API response from get_conversations_v2
- FETCH_LIMIT was set to 99, causing massive response

**Root Cause:**
Fetching 99 conversations at once produces a response file too large (~600KB) for Claude to read. The 256KB limit is exceeded.

**Resolution:**
Reduced `FETCH_LIMIT` in config.md from `99` to `25`. This keeps responses under the size limit while still processing a reasonable batch.

**Prevention:**
- Keep FETCH_LIMIT at 25 or lower
- If more conversations needed, run multiple batches
- Monitor response sizes when adjusting limits

---

### ERR-008: API Required Parameters Missing
| Field | Value |
|-------|-------|
| **ID** | ERR-008 |
| **Status** | RESOLVED |
| **Category** | API_ERROR |
| **Severity** | HIGH |
| **First Seen** | 2026-01-08 |
| **Resolved** | 2026-01-08 |
| **Run Log** | `2026-01-08_troubleshoot-1.md` |

**Error Message:**
```
An error occurred invoking 'get_conversations_v2'.
```

**Context:**
- Command: `/process-heyreach`
- Step: Fetching unseen conversations
- API call made without required `linkedInAccountIds` and `campaignIds` parameters
- Same issue affects `get_all_campaigns` (requires `statuses` and `accountIds`)

**Root Cause:**
HeyReach MCP API schema marks `linkedInAccountIds` and `campaignIds` as **required** fields for `get_conversations_v2`, even though their descriptions say "optional." The API silently fails when these arrays are not provided.

Similarly, `get_all_campaigns` requires `statuses` and `accountIds` arrays.

**Resolution:**
1. Added `API_REQUIRED_PARAMS` section to `config.md` with all account IDs and campaign IDs
2. Updated `knowledge-base.md` with correct API call patterns
3. All API calls must now include these required arrays

**Working API Call Pattern:**
```json
// get_conversations_v2
{
  "linkedInAccountIds": [93126, 94527, 94530, ...],  // Required
  "campaignIds": [223998, 274509, 240191, ...],      // Required
  "seen": false,
  "limit": 50
}

// get_all_campaigns
{
  "statuses": ["IN_PROGRESS"],  // Required
  "accountIds": [93126],        // Required
  "limit": 100
}
```

**Prevention:**
- Always include required arrays in API calls
- Reference `config.md` API_REQUIRED_PARAMS section for current IDs
- Periodically refresh IDs if accounts/campaigns change

---

### ERR-007: Location Objection After Rejection
| Field | Value |
|-------|-------|
| **ID** | ERR-007 |
| **Status** | RESOLVED |
| **Category** | LOGIC_ERROR |
| **Severity** | MEDIUM |
| **First Seen** | 2026-01-07 |
| **Resolved** | 2026-01-07 |
| **Run Log** | `2026-01-07_review-tagged-1.md` |

**Error Message:**
```
AI pushed platform signup after prospect explicitly rejected profiles
```

**Context:**
- Command: `/train-heyreach` Mode 1 (Review Tagged)
- Prospect: Macarena Gutierrez said "no cumplen con el requisito de residencia" (they don't meet requirements)
- AI Response: Long message pushing CazVid signup despite rejection
- Score: ~58/100

**Root Cause:**
Location objection template doesn't distinguish between:
1. "I need candidates in X location" (we can help)
2. "Your candidates don't meet my location requirements" (we already failed)

**Resolution:**
Added "Location Objection AFTER REJECTION" variant to config.md with:
- Detection triggers: "no cumplen", "don't meet requirements", "wrong location"
- New template: Apologize first, ask which location they need, NO links until confirmed
- Clear distinction table between proactive vs reactive scenarios

**Prevention:**
- Add rejection detection before applying location objection template
- When prospect says profiles "don't meet" requirements, acknowledge the miss first
- See EC-047 in edge-cases.md

---

### ERR-006: BPO vs Staffing Agency Confusion
| Field | Value |
|-------|-------|
| **ID** | ERR-006 |
| **Status** | RESOLVED |
| **Category** | LOGIC_ERROR |
| **Severity** | HIGH |
| **First Seen** | 2026-01-07 |
| **Resolved** | 2026-01-07 |
| **Run Log** | `2026-01-07_review-tagged-1.md` |

**Error Message:**
```
AI incorrectly told BPO company that Agency Leads "helps companies like yours"
```

**Context:**
- Command: `/train-heyreach` Mode 1 (Review Tagged)
- Prospect: Mel Labay from BPO company asked if Agency Leads helps companies that provide outsourced workers
- AI Response: "Yes, Agency Leads helps companies like yours" - WRONG
- Score: ~55/100

**Root Cause:**
AI doesn't distinguish between:
- **Staffing Agency:** Places candidates at client companies (OUR TARGET)
- **BPO Company:** Provides their own employees as outsourced service (NOT our target)

Mel is SELLING workers, not PLACING candidates. Fundamentally different business model.

**Resolution:**
Added comprehensive BPO/Outsourcing detection to config.md:
- New "BPO/Outsourcing Exclusions" section with 8 detection phrases
- Table explaining why each phrase indicates BPO
- Clear action: EXCLUDE from Agency Leads processing
- Reference to EC-046 for handling guidance

**Prevention:**
- Add keywords to exclusion list: "BPO", "outsourcing", "provide resources", "cost-effective solutions"
- When detected, clarify Agency Leads is for recruitment agencies placing candidates
- See EC-046 in edge-cases.md

---

### ERR-005: Stale Conversation ID 404 Errors
| Field | Value |
|-------|-------|
| **ID** | ERR-005 |
| **Status** | RESOLVED |
| **Category** | DATA_ERROR |
| **Severity** | LOW |
| **First Seen** | 2026-01-06 |
| **Resolved** | 2026-01-07 |
| **Run Log** | `2026-01-06_process-2.md` |

**Error Message:**
```
Previous session conversation IDs returned 404s
```

**Context:**
- Command: `/process-heyreach`
- Conversation IDs from previous session no longer valid
- API returns 404 when trying to fetch chatroom details

**Root Cause:**
Conversation IDs may be session-specific or have TTL. When context carries over from previous session, IDs become stale.

**Resolution:**
- Workaround documented in config.md "Technical Notes" section
- Added DO/DON'T table for session handling
- Added to "Known Issues & Workarounds" in error-registry.md

**Prevention:**
- Never cache or reuse conversation IDs across sessions
- Always fetch fresh conversation list at start of processing

---

### ERR-004: Campaign ID "Does Not Exist" Error
| Field | Value |
|-------|-------|
| **ID** | ERR-004 |
| **Status** | RESOLVED |
| **Category** | API_ERROR |
| **Severity** | MEDIUM |
| **First Seen** | 2026-01-06 |
| **Resolved** | 2026-01-07 |
| **Run Log** | `2026-01-06_16-47_process-3.md` |

**Error Message:**
```
Campaign IDs returned "does not exist" error
```

**Context:**
- Command: `/process-heyreach`
- Campaign filter parameter rejected by API
- Campaign IDs from config.md not recognized

**Root Cause:**
Campaign IDs in config.md may be outdated or API endpoint doesn't support campaign filtering in the expected format.

**Resolution:**
- Added warning to config.md Campaign Identification section
- Promoted content detection to "PRIMARY METHOD"
- Added to "Known Issues & Workarounds" in error-registry.md
- Workaround: Fetch without campaign filter, use content detection

**Prevention:**
- Verify campaign IDs periodically
- Use content-based campaign detection as primary method
- Campaign ID filtering as optional optimization only

---

## Error Log

### ERR-003: MCP Tools Not Exposed to Session
| Field | Value |
|-------|-------|
| **ID** | ERR-003 |
| **Status** | RESOLVED |
| **Category** | MCP_ERROR |
| **Severity** | HIGH |
| **First Seen** | 2026-01-03 |
| **Resolved** | 2026-01-03 |
| **Run Log** | `2026-01-03_mode2-learn-jan.md` |

**Error Message:**
```
No such tool available: mcp__heyreach__get_conversations_v2
```

**Context:**
- Command: `/train-heyreach` Mode 2
- MCP server shows "Connected" in `claude mcp list`
- All three HeyReach tools failing: get_conversations_v2, get_chatroom, send_message
- Other MCP servers (zoho, mongodb, clickup) are working

**Root Cause:**
Session-level tool exposure issue. Server is connected but tools aren't available in current Claude session.

**Resolution:**
Implemented Pre-Flight Health Check in v1.8.0:
- Both `/process-heyreach` and `/train-heyreach` now verify MCP tools before starting
- If tools unavailable, user is immediately notified to restart session
- Prevents wasted processing time and unclear errors

**Prevention:**
Health check catches this before any work begins. User gets clear actionable message.

---

### ERR-002: Config Variable Naming Mismatch
| Field | Value |
|-------|-------|
| **ID** | ERR-002 |
| **Status** | RESOLVED |
| **Category** | CONFIG_ERROR |
| **Severity** | MEDIUM |
| **First Seen** | 2026-01-03 15:30 |
| **Resolved** | 2026-01-03 15:35 |
| **Run Log** | `2026-01-03_15-30_system-review-1.md` |

**Error Message:**
```
Referenced MAX_CONVERSATIONS_TO_PROCESS which doesn't exist in config.md
```

**Context:**
- Command: `/update-config`
- File: `.claude/commands/update-config.md`
- Was looking for variable that was never defined

**Root Cause:**
Variable naming inconsistency between command file and config.md

**Resolution:**
Updated `update-config.md` to reference correct variables: `FETCH_LIMIT` and `MAX_MESSAGES_TO_SEND`

**Prevention:**
- Always verify variable names exist in config.md before referencing
- Use consistent naming conventions

---

### ERR-001: MCP Tool Transient Unavailability
| Field | Value |
|-------|-------|
| **ID** | ERR-001 |
| **Status** | RESOLVED |
| **Category** | MCP_ERROR |
| **Severity** | LOW |
| **First Seen** | 2026-01-03 14:41 |
| **Resolved** | 2026-01-03 14:50 |
| **Run Log** | `2026-01-03_14-41_process-1.md` |

**Error Message:**
```
No such tool available: mcp__heyreach__get_conversations_v2
```

**Context:**
- Command: `/process-heyreach`
- Tool: `get_conversations_v2`
- Transient connection issue

**Root Cause:**
Temporary MCP connection drop. Tools work correctly after retry.

**Resolution:**
Retry in same session. No code changes needed.

**Prevention:**
- Add retry logic for transient MCP errors
- Wait 2-3 seconds before retrying

---

## Error Template

Use this template when logging new errors:

```markdown
### ERR-XXX: [Short Title]
| Field | Value |
|-------|-------|
| **ID** | ERR-XXX |
| **Status** | OPEN |
| **Category** | [API_ERROR/OVERFLOW_ERROR/CONFIG_ERROR/TEMPLATE_ERROR/MCP_ERROR/LOGIC_ERROR/DATA_ERROR] |
| **Severity** | [CRITICAL/HIGH/MEDIUM/LOW] |
| **First Seen** | YYYY-MM-DD HH:MM |
| **Resolved** | - |
| **Run Log** | `filename.md` |

**Error Message:**
```
[Exact error message]
```

**Context:**
- Command: [which command was running]
- Step: [what step in the process]
- Additional context

**Root Cause:**
[To be determined by troubleshooter]

**Resolution:**
[To be filled when resolved]

**Prevention:**
[How to prevent recurrence]
```

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Errors Logged | 9 |
| Resolved | 9 |
| Open | 0 |
| In Progress | 0 |
| Needs Manual | 0 |
| Auto-Fix Rate | 100% |

### By Category
| Category | Count | Resolved |
|----------|-------|----------|
| CONFIG_ERROR | 1 | 1 |
| MCP_ERROR | 2 | 2 |
| API_ERROR | 2 | 2 |
| DATA_ERROR | 1 | 1 |
| LOGIC_ERROR | 2 | 2 |
| OVERFLOW_ERROR | 1 | 1 |

### By Severity
| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 3 |
| MEDIUM | 4 |
| LOW | 2 |

---

## Known Issues & Workarounds

### API Limit of 100
**Issue:** HeyReach API has hard limit of 100 conversations per request
**Workaround:** Use `limit=10` to avoid overflow; run multiple times for more coverage

### Large Response Overflow
**Issue:** Responses >50KB can overflow token limits
**Workaround:** Reduce FETCH_LIMIT to 10-25; save to api-logs/ if needed

### Transient MCP Errors
**Issue:** Occasional "tool not available" errors
**Workaround:** Retry after 2-3 seconds; usually resolves immediately

### Campaign ID Not Recognized (ERR-004)
**Issue:** Campaign IDs may return "does not exist" error from API
**Workaround:** Fetch conversations without campaign filter; detect campaign by sender/content instead

### Stale Conversation IDs (ERR-005)
**Issue:** Conversation IDs from previous sessions may return 404
**Workaround:** Always fetch fresh conversation list at start of each session; never reuse cached IDs

### API Required Parameters (ERR-008)
**Issue:** `get_conversations_v2` and `get_all_campaigns` fail silently without required array parameters
**Workaround:** Always include `linkedInAccountIds` and `campaignIds` arrays from `config.md` API_REQUIRED_PARAMS section. These are marked "optional" in schema descriptions but are actually required.

### Stale Cache Files After Config Change (ERR-009 Related)
**Issue:** After reducing FETCH_LIMIT, old cached response files may still be too large
**Location:** `~\.claude\projects\...\tool-results\mcp-heyreach-*.txt`
**Workaround:** Delete stale cache files before re-running:
```bash
rm ~/.claude/projects/*/tool-results/mcp-heyreach-*.txt
```
