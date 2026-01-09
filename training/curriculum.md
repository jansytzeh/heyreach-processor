# HeyReach AI Training Curriculum

> Version: 1.1
> Last Updated: 2026-01-05

Structured learning path to systematically improve AI conversation handling.

---

## Training Levels

| Level | Focus | Graduation Criteria |
|-------|-------|---------------------|
| **Level 1: Foundation** | Basic trigger detection | 95% accuracy on simple triggers |
| **Level 2: Exclusions** | Edge case handling | 90% accuracy on exclusion detection |
| **Level 3: Personalization** | Energy matching, variation | No identical messages in 10 consecutive sends |
| **Level 4: Context** | Deep personalization | References specific prospect context |
| **Level 5: Negotiation** | Chris Voss techniques | Uses labeling, mirroring, calibrated questions |
| **Level 6: Mastery** | Predictive responses | Anticipates follow-up questions, achieves "That's right" |

---

## Level 1: Foundation

### Learning Objectives
- [ ] Correctly identify all trigger phrases
- [ ] Match triggers to correct response type
- [ ] Detect language (Spanish vs English)
- [ ] Identify campaign type (CazVid vs Agency Leads)

### Training Activities
1. Review 20 "Good AI Handling" conversations
2. Document all trigger phrase variations seen
3. Test detection on 10 new conversations (dry-run)

### Graduation Test
Process 20 conversations in dry-run mode. Must achieve:
- 100% correct trigger detection
- 100% correct language detection
- 95% correct campaign identification

### Current Status
- [x] Basic triggers defined in config.md
- [x] Language detection working
- [ ] Comprehensive trigger list validated

---

## Level 2: Exclusions

### Learning Objectives
- [ ] Correctly identify all exclusion phrases
- [ ] Understand WHY each exclusion exists
- [ ] Handle mixed signals (trigger + exclusion)
- [ ] Know when to skip vs escalate

### Training Activities
1. Review all "Bad AI Handling" conversations
2. Document false positive patterns
3. Study edge-cases.md thoroughly
4. Add 5 new exclusion patterns from observations

### Graduation Test
Process 20 conversations including 5 with exclusion phrases. Must achieve:
- 100% correct exclusion detection
- 0 false positives
- Clear reasoning for each skip decision

### Current Status
- [x] Basic exclusions defined
- [ ] Exclusion reasoning documented
- [ ] Mixed signal handling tested

---

## Level 3: Personalization

### Learning Objectives
- [ ] Match response energy to prospect energy
- [ ] Vary opening phrases (never repeat consecutively)
- [ ] Adjust message length to match prospect
- [ ] Use natural, conversational tone

### Training Activities
1. Analyze 10 enthusiastic prospect messages - practice matching
2. Create 5 variations of each opening phrase
3. Practice brief vs detailed response matching
4. Review "Mediocre AI Handling" for improvement areas

### Graduation Test
Generate 10 responses. Must achieve:
- 0 identical openings in sequence
- Energy level matches prospect in 90% of cases
- Human reviewer rates 8/10 average naturalness

### Current Status
- [x] Opening variations defined in config.md
- [x] Energy matching principle documented
- [ ] Variation tracking implemented

---

## Level 4: Context

### Learning Objectives
- [ ] Reference specific details from prospect message
- [ ] Acknowledge their situation/context
- [ ] Adapt response based on their role/industry
- [ ] Handle multi-topic messages

### Training Activities
1. Study Jan's manual responses for context usage
2. Practice extracting key details from messages
3. Create context-aware response variations
4. Handle 5 multi-topic messages correctly

### Graduation Test
Process 10 context-rich conversations. Must achieve:
- References prospect-specific detail in 80% of responses
- Correctly prioritizes when multiple topics present
- No generic/impersonal responses

### Current Status
- [ ] Context extraction patterns defined
- [ ] Multi-topic handling documented
- [ ] Role/industry adaptation rules

---

## Level 5: Negotiation (Chris Voss Framework)

### Learning Objectives
- [ ] Apply tactical empathy to identify underlying emotions
- [ ] Use labeling ("It sounds like...") to acknowledge feelings
- [ ] Use mirroring (repeat last 1-3 words) to encourage elaboration
- [ ] Ask calibrated questions ("How/What" not "Why/Can")
- [ ] Aim for "That's right" not just "yes"
- [ ] Maintain "Late-Night FM DJ" tone (calm, confident)

### Training Activities
1. Review knowledge-base.md Negotiation Philosophy section
2. Practice labeling on 10 decline messages
3. Rewrite 5 responses using calibrated questions
4. Identify "That's right" opportunities in Jan's conversations
5. Apply accusation audit to cold outreach templates

### Graduation Test
Process 15 objection-type conversations. Must achieve:
- Uses labeling in 80% of objection responses
- Uses calibrated questions (How/What) instead of closed questions
- Tone is calm/confident, not pushy/desperate
- At least 3 "That's right" or equivalent responses elicited

### Current Status
- [x] Negotiation philosophy documented in knowledge-base.md
- [ ] Labeling practice completed
- [ ] Calibrated questions applied
- [ ] Accusation audit templates created

---

## Level 6: Mastery

### Learning Objectives
- [ ] Anticipate follow-up questions
- [ ] Proactively address common concerns
- [ ] Optimize for conversion (meeting bookings)
- [ ] Handle unexpected message types gracefully
- [ ] Combine all techniques fluidly

### Training Activities
1. Analyze conversion patterns (what led to meetings)
2. Study objection handling from Jan's responses
3. Create proactive FAQ responses
4. Practice graceful "I don't know" responses

### Graduation Test
Track 20 conversations through to outcome. Must achieve:
- 25% conversion rate to next step
- 0 confused/frustrated prospect responses
- Positive sentiment in 90% of replies

### Current Status
- [ ] Conversion patterns identified
- [ ] Objection handling documented
- [ ] FAQ responses created

---

## Training Schedule

### Daily (5 min)
- Review any "Bad AI Handling" tags from previous day
- Quick check of error registry

### Weekly (30 min)
- Run `/metrics` to review stats
- Run `/train-heyreach` Mode 1 (Review Tagged)
- Update `/update-lead-samples` (Auto mode)

### Monthly (1 hour)
- Full curriculum progress review
- Run `/train-heyreach` Mode 7 (System Improvement)
- Update exclusion patterns
- Review and update edge-cases.md

---

## Progress Tracking

| Date | Level | Activity | Outcome |
|------|-------|----------|---------|
| 2026-01-03 | 1 | Initial setup | Foundation established |
| 2026-01-03 | 1 | Reviewed 9 Good AI Handling | All correct |
| 2026-01-05 | 1 | Reviewed 1 Mediocre AI Handling | Found 3 issues, added 2 core principles |

---

## Next Training Focus

Based on current progress, focus on:

1. **Immediate:** Complete Level 1 graduation test
2. **This week:** Begin Level 2 (Exclusions) training
3. **Next week:** Validate Level 2, start Level 3

---

## Training Commands Quick Reference

| Goal | Command | Mode |
|------|---------|------|
| Review what AI did | `/train-heyreach` | Mode 1: Review Tagged |
| Learn from Jan | `/train-heyreach` | Mode 2: Learn from Jan |
| Check conversion | `/train-heyreach` | Mode 3: Analyze Reactions |
| Add new response | `/train-heyreach` | Mode 4: Teach New Type |
| Improve existing | `/train-heyreach` | Mode 5: Refine Templates |
| Handle edge cases | `/train-heyreach` | Mode 6: Edge Case Deep Dive |
| System review | `/train-heyreach` | Mode 7: System Improvement |
