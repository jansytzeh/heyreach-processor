# Deal Stage Tracking System

> Version: 1.0.0
> Created: 2026-01-08
> Purpose: Track prospect progression through deal stages

---

## Overview

Every prospect is on a journey. This system tracks where they are and what moves them forward.

---

## Deal Stages

### Stage Definitions

| Stage | Code | Description | Goal |
|-------|------|-------------|------|
| **Cold** | COLD | No engagement yet | Get response |
| **Engaged** | ENGAGED | They responded | Qualify them |
| **Qualified** | QUALIFIED | Confirmed fit + need | Move to action |
| **Action** | ACTION | Ready to take step | Close the action |
| **Won** | WON | Took desired action | Nurture relationship |
| **Lost** | LOST | Declined/disqualified | Close gracefully |

---

## Stage Transition Triggers

### Cold → Engaged

**Trigger:** They respond to our outreach.

| Signal | Example |
|--------|---------|
| Any substantive reply | "Thanks for reaching out" |
| Question asked | "How does this work?" |
| Interest expressed | "Tell me more" |

### Engaged → Qualified

**Trigger:** They confirm fit and show buying signals.

| Signal | Example |
|--------|---------|
| Confirmed hiring need | "Yes, we're hiring" |
| Confirmed right target | "I'm the hiring manager" / "We place candidates" |
| Asked about pricing | "What does it cost?" |
| Asked about process | "How do I get started?" |

### Qualified → Action

**Trigger:** They want to take the next step.

| CazVid Signals | Agency Leads Signals |
|----------------|---------------------|
| "I'll post a job" | "Send me the samples" |
| "Which candidate...?" | "Let's schedule a demo" |
| "Show me how to contact" | "Yes, I want to see more" |

### Action → Won

**Trigger:** They completed the desired action.

| CazVid Won | Agency Leads Won |
|------------|------------------|
| Posted a job on platform | Booked a demo |
| Contacted a candidate | Requested pricing |
| Subscribed to platform | Started trial |

### Any → Lost

**Trigger:** Clear disqualification or decline.

| Lost Signal | Reason |
|-------------|--------|
| "Not interested" + final | Clear decline |
| BPO/outsourcing company | Wrong target |
| Freelance recruiter | Wrong target |
| Multiple declines | Persistent rejection |
| "Stop contacting me" | Explicit opt-out |

---

## Stage-Appropriate Actions

### Cold Stage Actions

| Action | Purpose |
|--------|---------|
| Initial outreach | Generate response |
| Follow-up (if no response) | Second touch |
| Different angle | New value prop |

### Engaged Stage Actions

| Action | Purpose |
|--------|---------|
| Answer questions | Build trust |
| Provide value | Demonstrate expertise |
| Qualify them | Confirm fit |
| Probe for need | Understand situation |

### Qualified Stage Actions

| Action | Purpose |
|--------|---------|
| Present solution | Show how you help |
| Handle objections | Address concerns |
| Offer next step | Move toward action |
| Create urgency | Motivate action |

### Action Stage Actions

| Action | Purpose |
|--------|---------|
| Facilitate action | Make it easy |
| Provide resources | Links, tutorials |
| Follow up | Ensure completion |
| Celebrate progress | Positive reinforcement |

### Won Stage Actions

| Action | Purpose |
|--------|---------|
| Confirm success | Ensure satisfaction |
| Ask for expansion | Upsell/cross-sell |
| Request referral | Generate new leads |
| Nurture relationship | Long-term value |

### Lost Stage Actions

| Action | Purpose |
|--------|---------|
| Close gracefully | Maintain reputation |
| Ask for reason | Learn and improve |
| Leave door open | Future opportunity |
| Move on | Don't waste time |

---

## Tracking in Conversations

### During Processing

For each conversation processed, note in run log:

```markdown
### [Prospect Name] - [Company]
**Campaign:** CazVid / Agency Leads
**Stage:** ENGAGED
**Stage Change:** Cold → Engaged (they responded positively)
**Their Message:** "[message]"
**My Response:** "[response]"
**Next Action Needed:** Qualify their need
```

### Stage Change Log (Optional)

If tracking stage changes over time:

```markdown
## Stage Changes - [Date]

| Prospect | From | To | Trigger |
|----------|------|-----|---------|
| María García | Cold | Engaged | Asked how it works |
| John Smith | Engaged | Qualified | Confirmed hiring need |
| Laura Chen | Qualified | Won | Posted job on platform |
| Mike Brown | Engaged | Lost | BPO company |
```

---

## Stage-Based Response Strategy

### Responding to Cold Prospects
- Focus: Generate interest
- Tone: Value-forward, not pushy
- Goal: Get ANY response

### Responding to Engaged Prospects
- Focus: Qualify and inform
- Tone: Helpful, curious
- Goal: Understand their situation

### Responding to Qualified Prospects
- Focus: Present solution
- Tone: Confident, solution-oriented
- Goal: Get commitment to next step

### Responding to Action-Ready Prospects
- Focus: Facilitate
- Tone: Supportive, clear
- Goal: Complete the action

---

## CazVid Deal Progression

```
COLD
  ↓ (they respond)
ENGAGED
  ↓ (they ask questions, show interest)
QUALIFIED
  ↓ (they want to post job / contact candidates)
ACTION
  ↓ (they post job OR subscribe)
WON
```

### CazVid Success Metrics

| Stage | Success Indicator |
|-------|-------------------|
| Engaged | Response rate to outreach |
| Qualified | Question/interest rate |
| Action | Job posting attempts |
| Won | Jobs posted, subscriptions |

---

## Agency Leads Deal Progression

```
COLD
  ↓ (they respond)
ENGAGED
  ↓ (they ask about leads, show interest)
QUALIFIED
  ↓ (they want samples / demo)
ACTION
  ↓ (they book demo OR request trial)
WON
```

### Agency Leads Success Metrics

| Stage | Success Indicator |
|-------|-------------------|
| Engaged | Response rate to outreach |
| Qualified | Sample/demo request rate |
| Action | Demo bookings |
| Won | Demos held, trials started |

---

## Pipeline Health Indicators

### Healthy Pipeline

- **Many engaged:** Prospects are responding
- **Good qualification rate:** Engaged → Qualified conversion strong
- **Action taking:** Qualified prospects move to action
- **Low lost rate:** Not losing too many in early stages

### Unhealthy Pipeline Signs

| Sign | Problem | Fix |
|------|---------|-----|
| Few engaged | Poor initial messaging | Improve outreach |
| Low qualification | Attracting wrong targets | Better targeting |
| Stuck in qualified | Not closing effectively | Improve CTAs |
| High lost rate | Product-market fit issues | Review offering |

---

## Integration with HeyReach Tags

### Recommended Tags for Stage Tracking

| Tag | Meaning |
|-----|---------|
| `Stage: Engaged` | Moved to engaged |
| `Stage: Qualified` | Confirmed qualified |
| `Stage: Action` | Ready for action |
| `Stage: Won` | Completed action |
| `Stage: Lost` | Disqualified/declined |
| `Needs Follow-Up` | Requires attention |
| `Hot Lead` | High priority |
| `Wrong Target` | Disqualified - don't contact |

### Tagging Best Practices

1. **Update stage tags** when stage changes
2. **Remove old stage tags** when moving forward
3. **Add context tags** ("Hot Lead", "Wrong Target") as needed
4. **Use consistently** across all sender accounts

---

## Notes

- Stage tracking is implicit in conversation analysis
- Explicit tagging in HeyReach is optional but recommended for high-value prospects
- Focus on advancing deals, not just responding to messages
- Every interaction should move toward the appropriate next step
