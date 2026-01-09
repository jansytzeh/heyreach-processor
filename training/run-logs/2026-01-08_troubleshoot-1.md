# Troubleshoot Run: 2026-01-08

## Mode
System Health Check (Mode 3)

## Issue Investigated
`/process-heyreach` failing with error: "An error occurred invoking 'get_conversations_v2'"

---

## Health Check Results

| Component | Status | Notes |
|-----------|--------|-------|
| MCP Connection | PASS | 33 LinkedIn accounts connected |
| get_all_linked_in_accounts | PASS | Returns account data |
| get_all_campaigns | PASS | Requires `statuses` + `accountIds` params |
| get_conversations_v2 | PASS | Requires `linkedInAccountIds` + `campaignIds` params |

---

## Root Cause Analysis

### Problem
The HeyReach MCP API was failing silently when `get_conversations_v2` was called without the `linkedInAccountIds` and `campaignIds` arrays.

### Root Cause
The API schema marks these parameters as **required** (in the `required` array), even though their descriptions say "optional." When called without these arrays, the API returns a generic error instead of a helpful validation message.

### Evidence
```
// This FAILS:
get_conversations_v2({ seen: false, limit: 50 })
// Error: "An error occurred invoking 'get_conversations_v2'"

// This WORKS:
get_conversations_v2({
  linkedInAccountIds: [93126, 94527, ...],
  campaignIds: [223998, 274509, ...],
  seen: false,
  limit: 50
})
// Returns: { totalCount: 29, items: [...] }
```

---

## Resolution Applied

### 1. Error Registry (ERR-008)
Added new error entry documenting the issue, root cause, and solution.

### 2. Config.md Updates
Added new section "API Required Parameters (CRITICAL)" containing:
- Full list of LinkedIn Account IDs (29 active accounts)
- Full list of Campaign IDs (6 IN_PROGRESS campaigns)
- Usage examples for both API calls

### 3. Knowledge Base Updates
- Version bumped to 3.1.0
- Added "CRITICAL: Required API Parameters (ERR-008)" section
- Documented the required parameters and reference to config.md

### 4. Process Command Updates
- Updated Step 1 (Fetch Conversations) with critical note
- Added new error type to Error Handling table
- References config.md for parameter values

---

## Files Modified

| File | Change |
|------|--------|
| `training/error-registry.md` | Added ERR-008, updated stats |
| `config.md` | Added API_REQUIRED_PARAMS section |
| `training/knowledge-base.md` | Added required params documentation |
| `.claude/commands/process-heyreach.md` | Updated Step 1 and error handling |

---

## Prevention

Future runs will:
1. Read `config.md` API Required Parameters section
2. Include both arrays in all `get_conversations_v2` calls
3. Include `statuses` and `accountIds` in `get_all_campaigns` calls

---

## Verification

Tested API call with required parameters:
```
get_conversations_v2({
  linkedInAccountIds: [93126, 94527, 94530, 94531, 94533, 94534, 94559],
  campaignIds: [223998, 274509, 180990, 180988, 181549],
  seen: false,
  limit: 10
})
// Result: SUCCESS - returned 29 total conversations
```

---

## Next Steps
Ready to re-run `/process-heyreach` with correct parameters.
