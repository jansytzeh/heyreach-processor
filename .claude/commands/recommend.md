# Training Recommendations

Analyze the current system state and recommend what to train on next.

## Instructions

1. **Read all training data sources:**
   - `training/curriculum.md` - Current level and progress
   - `training/knowledge-base.md` - Training statistics
   - `training/outcome-tracking.md` - Conversion metrics
   - `training/error-registry.md` - Recent errors
   - `training/quality-rubric.md` - Quality benchmarks

2. **Check conversation tags:**
   ```bash
   powershell -NoProfile -ExecutionPolicy Bypass -Command "
     . './heyreach-api.ps1'
     Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
     Get-HeyReachConversations -LinkedInAccountIds (Get-HeyReachLinkedInAccountsFromConfig) -Seen `$true -Limit 25 | ConvertTo-Json -Depth 10
   "
   ```
   Count conversations with each tag type.

3. **Analyze gaps and generate recommendations:**

## Recommendation Logic

### Priority 1: Errors (Critical)
If `error-registry.md` has OPEN errors:
- **Recommend:** Run `/troubleshoot` first
- **Reason:** Unresolved errors block normal operation

### Priority 2: Bad Handling (High)
If conversations tagged `Bad AI Handling` exist unreviewed:
- **Recommend:** `/train-heyreach` Mode 1 → filter "Bad"
- **Reason:** Learn from mistakes immediately

### Priority 3: Curriculum Progress (Medium)
Based on current level in `curriculum.md`:
- **Level 1 incomplete:** Focus on trigger accuracy
- **Level 2 incomplete:** Focus on exclusions
- **Level 3 incomplete:** Focus on personalization
- **Level 4 incomplete:** Focus on context
- **Level 5 incomplete:** Focus on conversion

### Priority 4: Data Gaps (Medium)
If training statistics show low coverage:
- **Few conversations reviewed:** `/train-heyreach` Mode 1
- **No Jan patterns extracted:** `/train-heyreach` Mode 2
- **No outcome data:** Review `outcome-tracking.md`

### Priority 5: Metrics (Low)
If no recent metrics:
- **Recommend:** Run `/metrics` for baseline
- **Reason:** Can't improve what you don't measure

### Priority 6: Maintenance (Low)
Weekly tasks:
- **Lead samples stale:** `/update-lead-samples`
- **No recent training:** Schedule training session

## Output Format

```markdown
# Training Recommendations

**Generated:** [Date/Time]
**Current Level:** [From curriculum.md]
**Last Training:** [From sessions folder]

## Priority Actions

### 1. [HIGH/MEDIUM/LOW] - [Action]
**Why:** [Reason]
**Command:** [Exact command to run]
**Time:** [Estimated time]

### 2. [Priority] - [Action]
...

## Data Summary

| Metric | Value | Status |
|--------|-------|--------|
| Open errors | X | [OK/NEEDS ATTENTION] |
| Unreviewed Bad AI | X | [OK/NEEDS ATTENTION] |
| Curriculum level | X/5 | [X% complete] |
| Conversations analyzed | X | [OK/LOW] |
| Patterns extracted | X | [OK/LOW] |
| Outcome data points | X | [OK/LOW] |

## Suggested Schedule

| Day | Task | Time |
|-----|------|------|
| Today | [Task] | X min |
| This week | [Task] | X min |
| This month | [Task] | X min |
```

## Quick Recommendations

If user just wants quick advice:

| Situation | Quick Recommendation |
|-----------|---------------------|
| Just starting | Run `/train-heyreach` Mode 1 with "All" tags |
| After processing run | Check for Bad AI Handling tags |
| Weekly review | Run `/metrics` then `/train-heyreach` Mode 7 |
| Something went wrong | Run `/troubleshoot` |
| Want to improve | Run `/train-heyreach` Mode 2 (Learn from Jan) |
