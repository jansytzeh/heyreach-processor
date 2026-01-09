# Troubleshoot HeyReach Errors

Strategic and surgical error resolution for HeyReach command failures.

---

## Troubleshooting Modes

Ask user which mode:

| Mode | Description |
|------|-------------|
| **1. Diagnose Active Errors** | Find and fix OPEN errors in error-registry.md |
| **2. Analyze Recent Run Log** | Parse latest run log for unreported errors |
| **3. Test System Health** | Quick connectivity and config validation |
| **4. Investigate Specific Error** | Deep-dive into a specific ERR-XXX |

---

## Mode 1: Diagnose Active Errors

### Step 1: Read Error Registry
```
Read: training/error-registry.md
```

Extract all errors with status = OPEN or IN_PROGRESS

### Step 2: For Each Active Error

#### 2a. Gather Context
- Read the linked run log file
- Identify the exact step that failed
- Check if error is reproducible

#### 2b. Categorize & Strategize

| Category | Diagnostic Approach |
|----------|---------------------|
| API_ERROR | Check API limits, auth, test with `Test-HeyReachApiKey` |
| OVERFLOW_ERROR | Reduce limits in config.md |
| CONFIG_ERROR | Validate config.md syntax, check variable references |
| TEMPLATE_ERROR | Test template substitution with sample data |
| RATE_LIMIT | Wait 60 seconds, module auto-handles this |
| LOGIC_ERROR | Review trigger/exclusion logic in config.md |
| DATA_ERROR | Check API response structure against knowledge-base.md |

#### 2c. Apply Surgical Fix

**Principles:**
1. **Minimal changes** - Fix only what's broken
2. **One fix at a time** - Don't bundle unrelated changes
3. **Verify before closing** - Test the fix works
4. **Document everything** - Update error registry with resolution

#### 2d. Update Error Registry

Change status from OPEN to:
- **RESOLVED** - Fix applied and verified
- **WONTFIX** - Not actually an error
- **NEEDS_MANUAL** - Cannot auto-fix, explain why

Add:
- Root cause
- Resolution applied
- Prevention guidance

---

## Mode 2: Analyze Recent Run Log

### Step 1: Find Latest Run Log
```
Glob: training/run-logs/*.md
```
Sort by date, read the most recent

### Step 2: Parse for Errors

Look for:
- "Error" or "ERROR" in text
- "Failed" or "FAILED" status
- "Exception" mentions
- Tables with error columns
- Empty results when data expected

### Step 3: For Each New Error Found

Check if already in error-registry.md:
- If exists: Link to existing ERR-XXX
- If new: Create new ERR-XXX entry

### Step 4: Attempt Resolution

Follow Mode 1 Step 2 process for each new error

---

## Mode 3: Test System Health

### Quick Health Check Sequence

#### 3a. API Connection
```powershell
powershell -Command "
  . './heyreach-api.ps1'
  Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
  Test-HeyReachApiKey
  Get-HeyReachLinkedInAccounts -Limit 1 | ConvertTo-Json
"
```
Expected: Returns at least 1 account

If fails:
- Check API key in config.md
- Check network connection

#### 3b. Configuration Validity
```
Read: config.md
Validate:
- FETCH_LIMIT is number between 1-100
- MAX_MESSAGES_TO_SEND is number > 0
- All templates have [First Name] and [Sender Last Name] placeholders
- All sender accounts have IDs listed
- API key is present and valid
```

#### 3c. API Response Test
```powershell
powershell -Command "
  . './heyreach-api.ps1'
  Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
  `$linkedInAccountIds = @(93126)
  `$campaignIds = @(223998)
  Get-HeyReachConversations -LinkedInAccountIds `$linkedInAccountIds -CampaignIds `$campaignIds -Seen `$false -Limit 1 | ConvertTo-Json -Depth 5
"
```
Expected: Returns conversation object with expected structure

Validate response matches structure in knowledge-base.md

#### 3d. Report Status

| Component | Status | Notes |
|-----------|--------|-------|
| API Connection | PASS/FAIL | |
| Config Syntax | PASS/FAIL | |
| API Response | PASS/FAIL | |
| Templates | PASS/FAIL | |

---

## Mode 4: Investigate Specific Error

### Step 1: Get Error ID
Ask: "Which error ID? (e.g., ERR-001)"

### Step 2: Deep Analysis

1. Read error entry from error-registry.md
2. Read linked run log
3. Reproduce the error if possible
4. Trace through the code path that failed

### Step 3: Root Cause Analysis

Answer these questions:
1. **What failed?** (specific operation)
2. **Why did it fail?** (immediate cause)
3. **Why was that possible?** (root cause)
4. **How to prevent?** (systemic fix)

### Step 4: Fix & Verify

1. Apply minimal fix
2. Test the exact scenario that failed
3. Confirm no regression in related functionality
4. Update error registry

---

## Error Resolution Patterns

### Pattern: API Limit Exceeded
**Symptom:** "Limit must be between 1 and 100"
**Fix:**
```
Edit config.md: FETCH_LIMIT = 10
```
**Verify:** Re-run with new limit

### Pattern: Response Overflow
**Symptom:** "result exceeds maximum allowed tokens"
**Fix:**
```
Edit config.md: FETCH_LIMIT = 10
```
**Verify:** Response stays under limit

### Pattern: Template Variable Missing
**Symptom:** "[First Name]" appears literally in sent message
**Fix:**
1. Check correspondentProfile.firstName exists
2. Add null check before substitution
**Verify:** Test with sample conversation

### Pattern: API Connection Failed
**Symptom:** "API call failed after 3 attempts"
**Fix:**
1. Check API key is correct in config.md
2. Check network connection
3. Verify HeyReach service is up
**Verify:** `Test-HeyReachApiKey` returns true

### Pattern: Rate Limit Hit
**Symptom:** "Rate limit hit" or 429 status
**Fix:**
1. The module auto-waits 60 seconds
2. If persists, reduce request frequency
**Verify:** Module auto-recovers after wait

### Pattern: Wrong Campaign Detection
**Symptom:** Sent CazVid template to Agency Leads conversation
**Fix:**
1. Verify campaign ID list in config.md
2. Add content detection as fallback
**Verify:** Check recent conversations for correct matching

### Pattern: Duplicate Response Sent
**Symptom:** Same template sent twice to same person
**Fix:**
1. Verify already-processed detection patterns
2. Check conversation history before sending
**Verify:** Run through same conversation, confirm skip

---

## Resolution Checklist

Before marking RESOLVED:

- [ ] Root cause identified
- [ ] Fix applied to correct file(s)
- [ ] Fix verified with test
- [ ] No regression in related functionality
- [ ] Error registry updated with:
  - [ ] Status = RESOLVED
  - [ ] Resolution timestamp
  - [ ] Root cause documented
  - [ ] Prevention guidance added
- [ ] Run log updated (if applicable)
- [ ] Knowledge base updated (if new pattern learned)

---

## Escalation

If error cannot be resolved:

1. Set status = NEEDS_MANUAL
2. Document what was tried
3. Document why auto-fix failed
4. Provide recommended manual steps
5. Alert user: "Error ERR-XXX requires manual intervention"

---

## Post-Resolution

After fixing errors:

1. Ask if user wants to re-run the failed command
2. Monitor the retry for new errors
3. If successful, confirm error is fully resolved
