# Outcome Tracking System

> Version: 1.0
> Last Updated: 2026-01-03

Track what happens after AI sends messages to measure effectiveness and improve.

---

## Outcome Categories

| Outcome | Definition | Tags to Apply |
|---------|------------|---------------|
| **Positive Reply** | Prospect responds positively, asks questions, shows interest | `Positive Outcome` |
| **Conversion** | Prospect books meeting or takes desired action | `Converted` |
| **Neutral Reply** | Acknowledgment only, no clear next step | `Neutral Outcome` |
| **Negative Reply** | Not interested, complaint, unsubscribe request | `Negative Outcome` |
| **No Reply** | No response within 7 days | `No Response` |
| **Confused** | Prospect seems confused by our message | `Confused Response` |

---

## Tracking Workflow

### After Processing Run

1. **Wait 24-48 hours** for prospects to respond

2. **Check responses:**
   ```
   mcp__heyreach__get_conversations_v2
     seen: false
     limit: 25
   ```

3. **For each response to an AI message:**
   - Categorize the outcome
   - Apply appropriate tag
   - Log in outcome table below

4. **Weekly aggregation:**
   - Run `/metrics` to see outcome breakdown
   - Calculate conversion rate
   - Identify patterns in negative outcomes

---

## Outcome Log

### Format
```
| Date | Lead Name | Our Message Type | Their Response | Outcome | Notes |
```

### January 2026

| Date | Lead Name | Message Type | Response Summary | Outcome | Notes |
|------|-----------|--------------|------------------|---------|-------|
| | | | | | |

---

## Conversion Funnel

```
Messages Sent
    ↓
Responses Received (Response Rate: __%)
    ↓
Positive Responses (Positive Rate: __%)
    ↓
Conversions (Conversion Rate: __%)
```

### Current Metrics

| Metric | This Week | All Time |
|--------|-----------|----------|
| Messages Sent | 0 | 17 |
| Responses | 0 | - |
| Response Rate | - | - |
| Positive Responses | 0 | - |
| Positive Rate | - | - |
| Conversions | 0 | - |
| Conversion Rate | - | - |

---

## Response Pattern Analysis

### What Leads to Positive Outcomes

| Pattern | Frequency | Example |
|---------|-----------|---------|
| | | |

### What Leads to Negative Outcomes

| Pattern | Frequency | Example | Fix |
|---------|-----------|---------|-----|
| | | | |

### What Leads to Confusion

| Pattern | Frequency | Example | Fix |
|---------|-----------|---------|-----|
| | | | |

---

## A/B Testing Log

Track which message variations perform better.

### Active Tests

| Test ID | Variable | Variation A | Variation B | Start Date | Status |
|---------|----------|-------------|-------------|------------|--------|
| AB-001 | Opening phrase | "De nada" | "¡Con gusto!" | - | Not started |
| AB-002 | CTA style | Question | Statement | - | Not started |

### Completed Tests

| Test ID | Winner | Lift | Confidence | Applied |
|---------|--------|------|------------|---------|
| | | | | |

---

## Weekly Review Checklist

- [ ] Reviewed all responses to AI messages
- [ ] Tagged each with outcome category
- [ ] Logged outcomes in table above
- [ ] Updated conversion funnel metrics
- [ ] Identified any patterns in negative outcomes
- [ ] Created action items for improvements

---

## Outcome Tags Reference

Apply these tags in HeyReach to enable tracking:

| Tag | When to Use | Color |
|-----|-------------|-------|
| `Positive Outcome` | Interested, asking questions | Green |
| `Converted` | Booked meeting, took action | Blue |
| `Neutral Outcome` | Acknowledged but no action | Gray |
| `Negative Outcome` | Not interested, complaint | Red |
| `No Response` | 7+ days without reply | Gray |
| `Confused Response` | Unclear, asked for clarification | Orange |

---

## Alerts

Set up reviews when these thresholds are hit:

| Alert | Threshold | Action |
|-------|-----------|--------|
| High negative rate | >20% negative | Review message content |
| Low response rate | <30% response | Review timing/targeting |
| Confusion spike | >10% confused | Clarify message wording |
| Conversion drop | <10% conversion | Analyze CTA effectiveness |
