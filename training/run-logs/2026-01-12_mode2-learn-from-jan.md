# Run Log: Learn from Jan's Manual Responses
**Started:** 2026-01-12
**Mode:** 2 - Learn from Jan's Manual Responses
**Status:** Completed

---

## Summary

Analyzed 11 conversations tagged "Manual Handled Jan" to extract communication patterns and improve AI response handling.

## Conversations Analyzed

| # | Name | Situation | Jan's Pattern |
|---|------|-----------|---------------|
| 1 | Silpa Nayak | "Please forward your number / I'll call you" | Phone + WhatsApp + platform link |
| 2 | Sarah Jones | She pitched TO us (BPO services) | Polite decline + pivot to CazVid |
| 3 | Harlee Chapman | "Send to my email" for samples | Redirect to call for "bigger sample" |
| 4 | Sara Drake | "I don't work at Everstaff" | Acknowledge + ask if still in BD |
| 5 | Sandra Wallace | "Hi, how are you doing today?" | Answer + redirect to business |
| 6 | Mahmoud Abdelaziz | "Is this link trust?" | Confirm official + explain UTM + Google alternative |
| 7 | Hanson Raju | "Not currently recruiting" | Probe deeper: "What is stopping you?" |
| 8 | Sobia Sajid | "We are based in Karachi" (wrong location) | Confirm we have candidates there + offer |
| 9 | Daniela Volio | "Not looking to join platforms" | Address friction: just email, no subscription |
| 10 | Joanna Toro | "I'm not involved in purchasing" | Ask for referral to right person |
| 11 | Reid Orlando | "No thank you" | Standard timing/fit/need + "I'll tag correctly" |

---

## New Patterns Discovered

### 1. Phone Number Request (NEW)
**Trigger:** Prospect asks for phone number / wants to call
**Jan's Response:**
```
Hi [Name], you may call us over at +16233047338 or write us on WhatsApp on that number.

Please post your job on [link] so I can send you candidates directly.
```
**Key Elements:**
- Provides phone number
- Offers WhatsApp as alternative
- Still redirects to platform

### 2. Counter-Pitch (NEW)
**Trigger:** Someone pitches their services TO us
**Jan's Response:**
```
Hi [Name], thanks but this does not apply to me.

You might be able to use our free job posting and candidate sourcing platform, CazVid.

Let me know if you'd like more info on that
```
**Key Elements:**
- Polite decline: "thanks but this does not apply to me"
- Pivot to our product
- Soft close: "Let me know if you'd like more info"

### 3. Link Trust Question (NEW - EC-055)
**Trigger:** "Is this link trust/safe?"
**Jan's Response:**
```
Hi [Name], yes, this link is to an official page of CazVid and contains UTM parameters for marketing tracking.

You can also search for CazVid on google and get started from our website.
```
**Key Elements:**
- Confirm legitimacy
- Explain technical stuff simply (UTM = marketing tracking)
- Offer alternative (search on Google)

### 4. Platform Hesitation (NEW - EC-056)
**Trigger:** "Not looking to join additional platforms"
**Jan's Response:**
```
No problem, [Name]. All you need to post your job for free over at CazVid, is your email.

No subscription required.

Might you feel it appropriate, you can post your job for free over at: [link]

Have a great weekend!
```
**Key Elements:**
- Address friction directly: "just email"
- Remove fear: "No subscription required"
- Soft language: "Might you feel it appropriate"
- Warm close

### 5. Referral Request (NEW - EC-057)
**Trigger:** "I'm not involved in vendor selection/purchasing"
**Jan's Response:**
```
Sounds good, [Name]. Is there any specific person I should reach out to?
```
**Key Elements:**
- Short acknowledgment
- Direct referral request
- No over-explaining

### 6. Wrong Company Info (NEW - EC-058)
**Trigger:** "I don't work at [Company]"
**Jan's Response:**
```
Got it [Name]. Are you still in business development?
```
**Key Elements:**
- Brief acknowledgment: "Got it"
- Clarifying question to stay in conversation
- Doesn't apologize excessively

---

## Confirmed Existing Patterns

| Pattern | Edge Case | Confirmation |
|---------|-----------|--------------|
| Casual Greeting | EC-040 | Sandra Wallace - redirect to business immediately |
| Location Mismatch | EC-004 | Sobia Sajid - confirm we have candidates + offer |
| Timing/Fit/Need Decline | Standard | Reid Orlando - "I'll tag it correctly so we don't reach out again" |

---

## Key Jan Communication Principles

1. **Never refuse outright** - Always "yes, and..." with platform/call as next step
2. **Address objections directly** - Don't ignore friction, tackle it head-on
3. **Keep it short** - Brief acknowledgments, no over-explaining
4. **Always ask a question** - Keeps conversation alive
5. **Soft closes work** - "Let me know if...", "Might you feel it appropriate..."
6. **Warm sign-offs** - "Have a great weekend!", "Thanks for reaching out"

---

## Files to Update

- [x] knowledge-base.md - Add new patterns (Session 8 + Edge Cases Registry)
- [x] edge-cases.md - Add EC-055 through EC-060
- [ ] config.md - Add detection phrases for new patterns (optional)

---

## Final Status
**Completed:** 2026-01-12
**Conversations Analyzed:** 11
**New Patterns Found:** 6
**Patterns Confirmed:** 3
