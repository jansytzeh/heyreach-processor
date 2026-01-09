# HeyReach Training Run Log

**Date:** 2026-01-03
**Mode:** Mode 2 - Learn from Jan's Manual Responses
**Type:** Training (no messages sent)

---

## Summary

| Metric | Count |
|--------|-------|
| Conversations Reviewed | 8 |
| New Response Types Added | 4 |
| Edge Cases Updated | 2 |
| Edge Cases Added | 5 |
| Config.md Sections Added | 4 |

---

## Conversations Analyzed

| # | Lead Name | Pattern Learned | Account |
|---|-----------|-----------------|---------|
| 1 | Karen Letelier | CV/Email Request → Redirect to platform | John Acebedo (94533) |
| 2 | Hanson Raju | Short Decline → Probe deeper | Jan Sytze Heegstra (94534) |
| 3 | Sobia Sajid | Location Objection → Offer local candidates | Jan Sytze Heegstra (94534) |
| 4 | HR Simran Sharma | Multiple Cities → Clarify priority | Jan Sytze Heegstra (94534) |
| 5 | Pankaj Dewari | Casual Greeting → Redirect to business | Jan Sytze Heegstra (94534) |
| 6 | Rodrigo Echeverria | Commission Question → Explain subscription | Jan Sytze Heegstra (94534) |
| 7 | Edgard Murillo | Vacancy Closed → Ask about next opportunity | Juan Fajardo (94559) |
| 8 | Jose Tomas Celery | Email Request → Redirect to platform | Jan Sytze Heegstra (94534) |

---

## Key Learnings

### Paradigm Shift: Exclusions → Response Types

Jan's approach revealed that several previous "exclusions" should be active response types:

| Previously | Now | Jan's Approach |
|------------|-----|----------------|
| Vacancy Closed = SKIP | Vacancy Closed = RESPOND | Ask about next opportunity |
| Location Mismatch = SKIP | Location Objection = RESPOND | Offer to find local candidates |
| Casual Greeting = IGNORE | Casual Greeting = RESPOND | Redirect to business |
| CV Request = N/A | CV/Email Request = RESPOND | Redirect to platform |

### Jan's Communication Patterns

1. **Never refuse directly** - Always "yes, and..." approach
2. **Probe deeper on declines** - "Is it timing, or not hiring?"
3. **Forward-looking language** - "If things change, happy to reconnect"
4. **Transparency builds trust** - Clear pricing, "cancel when you want"
5. **Always ask about next** - Closed position → other positions?

---

## Files Modified

| File | Changes |
|------|---------|
| `config.md` | Added 4 response types, detection patterns, guidelines |
| `training/edge-cases.md` | Updated EC-001, EC-004; Added EC-040 to EC-044 |
| `training/knowledge-base.md` | Added Session 3 notes, updated edge case registry |

---

## New Response Types Added

### 1. Vacancy Closed
- **Triggers:** cerré la vacante, position filled, ya cerré
- **Response:** Acknowledge graciously, ask about other positions
- **Example:** "De nada, [Name]. Hay otras vacantes en el momento?"

### 2. Casual Greeting
- **Triggers:** hola (alone), hello (alone), short greeting
- **Response:** Reply warmly, redirect to business
- **Example:** "Hola [Name]! Sigues buscando candidatos?"

### 3. CV/Email Request
- **Triggers:** envíame los CVs, send to my email, a mi correo
- **Response:** Agree, redirect to platform signup first
- **Example:** "Claro que sí! Publica tu vacante en CazVid y te los envío por ahí."

### 4. Location Objection
- **Triggers:** estamos en [city], we are based in, candidatos de [city]
- **Response:** Acknowledge, offer to find candidates there
- **Example:** "Perfecto! Tenemos candidatos en [city]. Te envío algunos?"

---

## Edge Cases Registry Updates

### Updated (EXCLUDE → RESPOND)
- EC-001: Vacancy Closed with Thanks
- EC-004: Location Mismatch

### Added (NEW)
- EC-040: Casual Greeting Only
- EC-041: CV/Email Request
- EC-042: Multiple Cities Location
- EC-043: Commission/Pricing Question
- EC-044: Probing Deeper on Decline

---

## API Notes

- Initial limit=25 caused overflow (196,039 chars)
- Reduced to limit=10, still overflow (77,521 chars)
- Final working limit=5 per batch
- Used pagination with offset 0, 5, 10, 15 to cover all tagged conversations

---

## Next Steps

1. **Test new response types** - Run `/process-heyreach` in dry-run mode
2. **Monitor quality** - Tag responses for quality review
3. **Refine triggers** - Add more trigger variations as encountered
4. **Continue Level 1** - Complete graduation test per curriculum

---

## Version Updates

| Document | Old Version | New Version |
|----------|-------------|-------------|
| knowledge-base.md | 1.9.0 | 2.0.0 |
| config.md | N/A | +4 response types |
| edge-cases.md | 6 cases | 11 cases |

