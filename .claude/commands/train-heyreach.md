# Train HeyReach AI

Interactive training to improve conversation handling based on feedback.

## Pre-Flight Health Check with Auto-Retry

**Before training, verify HeyReach API is accessible.**

> **Note:** We use direct API calls instead of MCP for better reliability.

### Retry Protocol

Test API connection with PowerShell:

```powershell
powershell -Command "
  . './heyreach-api.ps1'
  Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
  Test-HeyReachApiKey
"
```

The API module has built-in retry logic (3 attempts with backoff).

### Implementation

1. **Attempt lightweight health check** using `Test-HeyReachApiKey`
2. **On success**: Log "✓ API connection verified" and proceed
3. **On error**:
   - The PowerShell module auto-retries 3 times
   - Log error as API_ERROR in run log
   - Inform user: "HeyReach API unavailable. Check API key and network connection."
   - Do NOT proceed with training

## Before Starting

Read these files:
1. `agent-persona.md` - Agent identity and decision framework
2. `training/knowledge-base.md` - Accumulated learnings
3. `training/edge-cases.md` - Documented edge cases
4. `training/curriculum.md` - Current training level and progress
5. `training/quality-rubric.md` - Quality scoring criteria
6. `config.md` - Settings, links, and guardrails

## Training Modes

Ask the user which mode to run:

### 1. Review Tagged Conversations
Analyze conversations tagged with Good/Bad/Mediocre AI Handling.

### 2. Learn from Jan's Manual Responses
Study how Jan handles conversations to learn patterns.

### 3. Analyze Prospect Reactions
Review how prospects responded to our messages.

### 4. Teach New Pattern
User demonstrates a new conversation pattern to learn.

### 5. Refine Agent Behavior
Improve how the agent handles specific situations.

### 6. Edge Case Deep Dive
Document and implement edge case handling.

### 7. System Improvement Discussion
Review setup and suggest improvements.

### 8. Quality Scoring Session
Score recent AI messages using the quality rubric.

### 9. Outcome Review
Track responses to AI messages and update outcome metrics.

---

## Mode 1: Review Tagged Conversations

1. Ask: "Which tag? (Excellent / Good / Mediocre / Bad / Very Bad / AI Input / All)"

2. Fetch seen conversations:
   ```powershell
   powershell -Command "
     . './heyreach-api.ps1'
     Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
     `$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)
     `$campaignIds = @(223998, 240191, 274509, 181549, 180990, 180988)
     Get-HeyReachConversations -LinkedInAccountIds `$linkedInAccountIds -CampaignIds `$campaignIds -Seen `$true -Limit 25 | ConvertTo-Json -Depth 10
   "
   ```

3. Filter where `correspondentProfile.tags` contains ANY of:
   - "Excellent AI Handling" - AI handled exceptionally well (top tier)
   - "Good AI Handling" - AI performed well
   - "Mediocre AI Handling" - Could be better
   - "Bad AI Handling" - AI made a mistake
   - "Very Bad AI Handling" - AI made a serious mistake (worst tier)
   - "AI Input" - AI participated (useful to find ALL AI conversations)

4. **Important:** Check for MULTIPLE tags. A conversation may have both "AI Input" AND a quality tag.

5. For each tagged conversation:
   - Get full history:
     ```powershell
     Get-HeyReachChatroom -AccountId <accountId> -ConversationId '<conversationId>' | ConvertTo-Json -Depth 10
     ```
   - Identify the AI's response (look for messages from "ME")
   - Analyze what happened
   - Note which quality tag (if any) was applied

6. Ask user clarifying questions

7. Update knowledge base with learnings

---

## Mode 2: Learn from Jan's Responses

1. Fetch conversations tagged `Manual Handled Jan`:
   ```powershell
   powershell -Command "
     . './heyreach-api.ps1'
     Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
     `$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)
     `$campaignIds = @(223998, 240191, 274509, 181549, 180990, 180988)
     Get-HeyReachConversations -LinkedInAccountIds `$linkedInAccountIds -CampaignIds `$campaignIds -Seen `$true -Limit 25 | ConvertTo-Json -Depth 10
   "
   ```

2. Filter by `correspondentProfile.tags` containing "Manual Handled Jan"

3. For each:
   - Get full conversation using `Get-HeyReachChatroom`
   - Identify Jan's manual messages
   - Extract patterns, phrases, style

4. Look for recurring patterns that could become new response types

5. Propose new templates based on findings

---

## Mode 3: Analyze Prospect Reactions

1. Fetch seen conversations with replies after our message

2. Categorize reactions:
   - **Positive:** Interest, questions, booking
   - **Negative:** Not interested, complaints
   - **Neutral:** Acknowledgment only
   - **Conversion:** Booked meeting

3. Correlate with which templates we used

4. Identify what works and what doesn't

---

## Mode 4: Teach New Pattern

1. Gather from user:
   - What situation is the agent encountering?
   - 2-3 example conversations
   - What's the ideal response approach?
   - Any new guardrails needed?

2. Analyze the pattern and document learnings

3. Update relevant files:
   - `agent-persona.md` if new decision framework needed
   - `training/edge-cases.md` for edge case patterns
   - `config.md` for new guardrails or detection patterns

4. Add to already-processed detection if applicable

5. Log in `training/improvement-log.md`

---

## Mode 5: Refine Agent Behavior

1. Ask what behavior needs refinement

2. Gather feedback:
   - What's the agent doing wrong?
   - Show problem conversation?
   - What should it do instead?

3. Propose changes to:
   - `agent-persona.md` (decision framework)
   - `training/conversation-analysis-framework.md` (analysis approach)
   - `training/knowledge-base.md` (learned patterns)

4. If approved, update the relevant files

---

## Mode 6: Edge Case Deep Dive

1. Ask focus: review existing, document new, or test detection

2. For new edge cases, gather:
   - Exact trigger message
   - Why it's tricky
   - Correct handling
   - Detection rule

3. Add to `training/edge-cases.md`

4. Add exclusion to `config.md` if needed

---

## Mode 7: System Improvement

1. Review all config and training files

2. Fetch sample conversations to understand patterns

3. Suggest improvements:
   - New response types needed?
   - Templates to refine?
   - Missing edge cases?
   - Workflow improvements?

4. Discuss with user and implement agreed changes

---

## Mode 8: Quality Scoring Session

1. **Get recent AI messages:**
   - Fetch conversations tagged `AI Input` from last 7 days
   - Or ask user for specific conversation IDs

2. **For each message, score using `training/quality-rubric.md`:**
   - Accuracy (20 pts)
   - Required Elements (20 pts)
   - Personalization (20 pts)
   - Natural Language (20 pts)
   - Effectiveness (20 pts)

3. **Calculate scores:**
   - Total score per message
   - Average across session
   - Identify lowest-scoring category

4. **Update tracking:**
   - Log scores in `training/quality-rubric.md` Historical Scores table
   - Update curriculum progress if thresholds met

5. **Generate improvement actions:**
   - If Personalization low → Focus on energy matching
   - If Natural Language low → Review opening variations
   - If Effectiveness low → Analyze what CTAs work best

---

## Mode 9: Outcome Review

1. **Check for responses to AI messages:**
   ```powershell
   powershell -Command "
     . './heyreach-api.ps1'
     Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
     `$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)
     `$campaignIds = @(223998, 240191, 274509, 181549, 180990, 180988)
     Get-HeyReachConversations -LinkedInAccountIds `$linkedInAccountIds -CampaignIds `$campaignIds -Seen `$false -Limit 25 | ConvertTo-Json -Depth 10
   "
   ```

2. **For each response after our AI message:**
   - Read full conversation with `Get-HeyReachChatroom`
   - Categorize outcome: Positive / Converted / Neutral / Negative / Confused

3. **Apply outcome tags in HeyReach:**
   - `Positive Outcome` - Interested, asking questions
   - `Converted` - Booked meeting
   - `Neutral Outcome` - Acknowledged only
   - `Negative Outcome` - Not interested
   - `Confused Response` - Asked for clarification

4. **Update `training/outcome-tracking.md`:**
   - Log each outcome in the table
   - Update conversion funnel metrics
   - Note any patterns

5. **Analyze correlations:**
   - Which response types lead to conversions?
   - Which opening phrases get positive responses?
   - What causes confusion?

6. **Create action items:**
   - Update config.md if patterns emerge
   - Start A/B test if unclear which variation works

---

## Tagging Reference

### Handling Tags
| Tag | Meaning |
|-----|---------|
| `AI Input` | AI handled this |
| `Manual Handled Jan` | Jan handled manually |

### Quality Tags (5-Tier System)
| Tag | Tier | Meaning |
|-----|------|---------|
| `Excellent AI Handling` | 1 (Best) | AI handled exceptionally well - creative thinking, diversiveness, or perfect response |
| `Good AI Handling` | 2 | AI did well - correct handling, good quality |
| `Mediocre AI Handling` | 3 | Could be better - acceptable but room for improvement |
| `Bad AI Handling` | 4 | AI made a mistake - needs correction |
| `Very Bad AI Handling` | 5 (Worst) | Serious mistake - wrong response type, embarrassing error |

### Outcome Tags
| Tag | Meaning |
|-----|---------|
| `Positive Outcome` | Prospect responded positively |
| `Converted` | Booked meeting or took action |
| `Neutral Outcome` | Acknowledged only |
| `Negative Outcome` | Not interested |
| `Confused Response` | Asked for clarification |

---

## Run Logging

Create log at `training/run-logs/YYYY-MM-DD_HH-MM_<mode>-N.md`:

```markdown
# Run Log: [Mode Name]
**Started:** YYYY-MM-DD HH:MM
**Mode:** [1-9]
**Status:** In Progress

---

## Steps Taken
[Log each API call and decision]

## Errors Encountered
| Time | Error | Resolution |
|------|-------|------------|

## Changes Made
[List files modified]

## Final Status
**Completed:** Yes/No
```

---

## Session Logging

Also create session summary at `training/sessions/YYYY-MM-DD-session-N.md`:

```markdown
# Training Session - [Date]

## Summary
[What was accomplished]

## Key Learnings
1. [Learning 1]
2. [Learning 2]

## Changes Made
- [ ] Updated config.md
- [ ] Updated knowledge-base.md
- [ ] Updated edge-cases.md

## Next Steps
- [Follow-up 1]
```

---

## Sync to Web Agent (IMPORTANT)

After training sessions that modify knowledge files, sync changes to the OpenAI Vector Store:

```bash
cd web-service
npm run sync:knowledge
```

This updates the web agent's knowledge base with your training improvements.

**Files that trigger sync:**
- `agent-persona.md`
- `config.md`
- `training/knowledge-base.md`
- `training/conversation-analysis-framework.md`
- `training/quality-rubric.md`
- `training/edge-cases.md`
- `training/deal-tracking.md`
- `training/curriculum.md`

**Always remind the user at the end of training:** "Knowledge files updated. Run `cd web-service && npm run sync:knowledge` to sync to the web agent."

---

## Error Handling

When errors occur:

1. **Log immediately** in the run log's "Errors Encountered" table
2. **Categorize** the error:
   - `API_ERROR` - HeyReach API issues (module auto-retries)
   - `OVERFLOW_ERROR` - Response too large (reduce limit to 10)
   - `CONFIG_ERROR` - Config file issues
   - `RATE_LIMIT` - 429 error (module auto-waits 60s)
   - `DATA_ERROR` - Unexpected data format
3. **Add to error registry** (`training/error-registry.md`):
   - Assign next ERR-XXX number
   - Set status = OPEN
   - Link to this run log
4. **Attempt recovery** if possible:
   - API errors: The PowerShell module auto-retries with backoff
   - Rate limits: Module auto-waits and retries
   - Overflow: Reduce limit and retry
   - Data errors: Log sample and continue with remaining data
5. **If unrecoverable**, complete run log and notify user to run `/troubleshoot`

### Common Errors & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| "result exceeds maximum allowed tokens" | Use Limit=10 in API call |
| Connection timeout | Check network, module will auto-retry |
| No tagged conversations found | Verify tags exist in HeyReach, check spelling |
| "correspondentProfile.tags" is undefined | Handle null case, some convos have no tags |
| Invalid API Key | Verify key in config.md |
