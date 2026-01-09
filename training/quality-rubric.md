# Message Quality Scoring Rubric

> Version: 1.1
> Last Updated: 2026-01-05

Objective scoring system to evaluate AI-generated message quality.

---

## Quick Score Guide

| Score | Rating | Quality Tag | Description |
|-------|--------|-------------|-------------|
| 90-100 | Excellent | `Excellent AI Handling` | Indistinguishable from Jan's best messages, creative thinking, or impressive diversiveness |
| 80-89 | Good | `Good AI Handling` | Natural, effective, minor improvements possible |
| 70-79 | Mediocre | `Mediocre AI Handling` | Functional but somewhat generic |
| 60-69 | Bad | `Bad AI Handling` | Robotic, missing elements, or mismatched |
| <60 | Very Bad | `Very Bad AI Handling` | Wrong response, missing critical elements |

---

## Scoring Categories

### 1. Accuracy (20 points)

| Criteria | Points | Description |
|----------|--------|-------------|
| Correct trigger detection | 5 | Identified the right message type |
| Correct language | 5 | Spanish/English matches prospect |
| Correct campaign | 5 | CazVid vs Agency Leads correct |
| No exclusion missed | 5 | Correctly handled any exclusion phrases |

**Scoring:**
- 20/20: All correct
- 15/20: One minor error
- 10/20: One major error
- 0/20: Wrong response type entirely

---

### 2. Required Elements (20 points)

| Criteria | Points | Description |
|----------|--------|-------------|
| Correct link included | 5 | Right URL for campaign/response type |
| CTA present | 5 | Clear call-to-action |
| Key information | 5 | Pricing, value prop, etc. as needed |
| Proper formatting | 5 | Links work, structure clear |

**Scoring:**
- 20/20: All elements present and correct
- 15/20: Minor formatting issue
- 10/20: Missing one element
- 0/20: Missing critical element (link/CTA)

---

### 3. Personalization (20 points)

| Criteria | Points | Description |
|----------|--------|-------------|
| Name used naturally | 5 | Not forced or awkward placement |
| Energy matching | 5 | Tone matches prospect's enthusiasm |
| Context reference | 5 | Mentions something specific to them |
| Appropriate length | 5 | Matches their message length/style |

**Scoring:**
- 20/20: Feels personally written for this prospect
- 15/20: Good personalization, minor miss
- 10/20: Generic but has name
- 5/20: Only has name, nothing else personal
- 0/20: No personalization at all

---

### 4. Natural Language (20 points)

| Criteria | Points | Description |
|----------|--------|-------------|
| Opening variation | 5 | Doesn't start same as last message |
| Conversational flow | 5 | Reads like human wrote it |
| No robotic phrases | 5 | Avoids template-sounding language |
| Appropriate punctuation | 5 | Not over/under punctuated |

**Scoring:**
- 20/20: Completely natural, couldn't tell it's AI
- 15/20: Mostly natural, one slightly stiff phrase
- 10/20: Functional but clearly templated
- 5/20: Robotic in places
- 0/20: Obviously copy-pasted template

---

### 5. Effectiveness (20 points)

| Criteria | Points | Description |
|----------|--------|-------------|
| Clear value proposition | 5 | Prospect understands benefit |
| Compelling CTA | 5 | CTA is inviting, not pushy |
| Addresses their need | 5 | Relevant to what they asked/said |
| Moves conversation forward | 5 | Creates opportunity for next step |

**Scoring:**
- 20/20: Prospect would likely respond positively
- 15/20: Good message, decent chance of response
- 10/20: Adequate but not compelling
- 5/20: Unlikely to get response
- 0/20: Would confuse or annoy prospect

---

## Score Calculation

```
Total Score = Accuracy + Required Elements + Personalization + Natural Language + Effectiveness
Maximum = 100 points
```

| Total Score | Grade | Quality Tag | Action |
|-------------|-------|-------------|--------|
| 90-100 | A | `Excellent AI Handling` | Use as example - creative thinking, diversiveness, or perfect execution |
| 80-89 | B | `Good AI Handling` | Minor refinements only |
| 70-79 | C | `Mediocre AI Handling` | Note specific improvements needed |
| 60-69 | D | `Bad AI Handling` | Review patterns, update training |
| <60 | F | `Very Bad AI Handling` | Investigate root cause urgently |

---

## Scoring Worksheet

Use this for each message evaluation:

```markdown
## Message Quality Score

**Date:**
**Conversation ID:**
**Response Type:**
**Evaluator:**

### Scores

| Category | Score | Max | Notes |
|----------|-------|-----|-------|
| Accuracy | /20 | 20 | |
| Required Elements | /20 | 20 | |
| Personalization | /20 | 20 | |
| Natural Language | /20 | 20 | |
| Effectiveness | /20 | 20 | |
| **TOTAL** | /100 | 100 | |

### Grade: [A/B/C/D/F]

### Strengths
-

### Improvements Needed
-

### Action Items
-
```

---

## Benchmarks

### Target Scores by Level

| Training Level | Target Score |
|----------------|--------------|
| Level 1: Foundation | 60+ |
| Level 2: Exclusions | 70+ |
| Level 3: Personalization | 80+ |
| Level 4: Context | 85+ |
| Level 5: Mastery | 90+ |

### Historical Scores

| Date | Messages Scored | Average | High | Low |
|------|-----------------|---------|------|-----|
| | | | | |

---

## Quick Evaluation Checklist

For rapid scoring without full rubric:

- [ ] Right response type? (+20 if yes, 0 if no)
- [ ] All required links/CTAs present? (+20 if yes, -20 if missing)
- [ ] Name used + energy matched? (+20 if both, +10 if one)
- [ ] Sounds natural? (+20 if yes, +10 if mostly)
- [ ] Would you respond to this? (+20 if yes, +10 if maybe)

**Quick Score: ___/100**

---

## Red Flags (Automatic Fail)

Any of these = score capped at 50:

- [ ] Wrong language
- [ ] Wrong campaign link
- [ ] Missing required link entirely
- [ ] Sent to already-processed conversation
- [ ] Contains placeholder text like `[First Name]`
- [ ] Responds to exclusion phrase message
