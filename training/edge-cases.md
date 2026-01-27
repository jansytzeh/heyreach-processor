# HeyReach Edge Cases Registry

This document catalogs edge cases encountered during conversation processing. Each case includes the context, why it's tricky, and the correct handling.

---

## Edge Case Format

```
## EC-XXX: [Short Title]

**Category:** [Response Type]
**Discovered:** [Date]
**Source:** [Training session / Manual review / Processing error]

**Trigger Message:**
> [The actual message that caused the edge case]

**Why It's Tricky:**
[Explanation of why this is an edge case]

**Correct Handling:**
[What should happen]

**Detection Rule:**
[How to identify this case programmatically]

**Status:** [Active / Resolved / Under Review]
```

---

## Thank-You Edge Cases

### EC-001: Vacancy Closed with Thanks

**Category:** CazVid Thank-You → **Vacancy Closed**
**Discovered:** 2026-01-03
**Updated:** 2026-01-03 (Mode 2 Training)
**Source:** Initial testing → Jan's Manual Handling

**Trigger Message:**
> "gracias shdai, ya cerré la vacante gracias por los perfiles"

**Why It's Tricky:**
Contains "gracias" (trigger word) but also indicates the position is filled. ~~Responding with the standard template asking "which candidate to connect with" is inappropriate.~~ **Update:** Jan doesn't abandon these - he asks about next opportunity.

**Correct Handling:**
~~EXCLUDE - No follow-up needed. Position is filled.~~
**RESPOND** - Acknowledge graciously, ask about other open positions.

**Jan's Approach (learned 2026-01-03):**
> "De nada, [Name]. ¿Hay otras vacantes en el momento que te gustaría llenar?"

**Detection Rule:**
- Contains: "cerré la vacante", "cerré vacante", "ya cerré", "position filled", "role closed", "role was closed"
- **Now handled by:** Vacancy Closed response type (see config.md)

**Status:** ~~Active~~ **Resolved - Converted to Response Type**

---

### EC-002: Will Review Response

**Category:** CazVid Thank-You
**Discovered:** 2026-01-03
**Source:** Initial testing

**Trigger Message:**
> "hola john, muchas gracias, lo estaré revisando en el transcurso del día."

**Why It's Tricky:**
Contains "muchas gracias" but the lead is already engaged and planning to review. Sending our template interrupts their natural flow.

**Correct Handling:**
EXCLUDE - Already engaged, let them review and respond naturally.

**Detection Rule:**
- Contains: "revisando", "lo revisaré", "voy a revisar", "I'll review", "I'll take a look", "let me look"

**Status:** Active

---

### EC-003: Wrong Target (Freelance Recruiter)

**Category:** CazVid Thank-You
**Discovered:** 2026-01-03
**Source:** Initial testing

**Trigger Message:**
> "buenas tardes juan! muchas gracias pero te cuento que soy reclutador freelance"

**Why It's Tricky:**
Contains "muchas gracias" but reveals they're a freelance recruiter, not our target audience (companies with hiring needs).

**Correct Handling:**
EXCLUDE - Misqualified lead, our service isn't relevant for them.

**Detection Rule:**
- Contains: "soy reclutador freelance", "freelance recruiter", "I'm a recruiter", "recruiting agency"

**Status:** Active

---

### EC-004: Location Mismatch → Location Objection

**Category:** CazVid Thank-You → **Location Objection**
**Discovered:** 2026-01-03
**Updated:** 2026-01-03 (Mode 2 Training)
**Source:** Initial testing → Jan's Manual Handling

**Trigger Message:**
> "hola buenas tardes. muchas gracias por la sugerencia. pero la vacante es el villahermosa, tabasco."

**Why It's Tricky:**
Contains "muchas gracias" but indicates a location mismatch - the candidates we sent don't match their location needs. ~~Can't help.~~ **Update:** Jan doesn't give up - he offers to find candidates in their location.

**Correct Handling:**
~~EXCLUDE - Can't help with this specific need.~~
**RESPOND** - Acknowledge their location, offer to find candidates there.

**Jan's Approach (learned 2026-01-03):**
> "¡Perfecto [Name]! Tenemos candidatos en [city]. ¿Te gustaría que te envíe algunos perfiles de esa zona directamente?"

**Detection Rule:**
- Contains: "la vacante es en", "vacante está en", "we are based in", "located in", "position is in", "estamos en [city]"
- **Now handled by:** Location Objection response type (see config.md)

**Status:** ~~Active~~ **Resolved - Converted to Response Type**

---

### EC-005: Using Own Resources

**Category:** CazVid Thank-You
**Discovered:** 2026-01-03
**Source:** Initial testing

**Trigger Message:**
> "hola emile gracias por tu información estamos seleccionando por nuestros recursos los candidatos"

**Why It's Tricky:**
Contains "gracias" but indicates they're using their own recruiting resources, not interested in our help.

**Correct Handling:**
EXCLUDE - Already have a solution.

**Detection Rule:**
- Contains: "nuestros recursos", "por nuestra cuenta", "internal recruiting", "our own team"

**Status:** Active

---

### EC-006: No Longer at Company

**Category:** CazVid Thank-You (English)
**Discovered:** 2026-01-03
**Source:** Initial testing

**Trigger Message:**
> "i no longer work with eye to eye careers. please remove me from your list. thank you."

**Why It's Tricky:**
Contains "thank you" but is actually a removal request, not gratitude for our service.

**Correct Handling:**
EXCLUDE - Wrong target, they've left the company. Should be removed from lists.

**Detection Rule:**
- Contains: "no longer work", "left the company", "don't work there", "ya no trabajo"

**Status:** Active

---

## Decline Edge Cases

### EC-010: Decline with Reason

**Category:** Agency Leads Decline
**Discovered:** 2026-01-03
**Source:** Initial testing

**Trigger Message:**
> "im not a recruiter. not interested thank you"

**Why It's Tricky:**
Contains "not interested" (trigger) but also provides context (not a recruiter). The standard "timing, fit, or need?" response doesn't fit.

**Correct Handling:**
EXCLUDE - They've already given the reason (wrong target). No need to ask.

**Detection Rule:**
- "not interested" + contains explanation/reason in same message

**Status:** Under Review - need more examples

---

## Sample Request Edge Cases

### EC-020: Vague Affirmative

**Category:** Agency Leads Sample Request
**Discovered:** 2026-01-03
**Source:** Initial testing

**Trigger Message:**
> "i'm not sure"

**Why It's Tricky:**
Could be interpreted as openness to seeing samples, but is actually uncertainty/hesitation.

**Correct Handling:**
EXCLUDE - Not a clear yes. Need clearer signal before sending samples.

**Detection Rule:**
- Contains: "not sure", "maybe", "I don't know", "let me think", "no sé"

**Status:** Active

---

## Info Request Edge Cases

### EC-030: Question with Objection

**Category:** CazVid Info Request
**Discovered:** Pending
**Source:** Anticipated

**Trigger Message:**
> "cómo funciona? parece caro"

**Why It's Tricky:**
Contains info request trigger but also includes an objection that should be addressed.

**Correct Handling:**
MANUAL - Need to address both the question and the objection.

**Detection Rule:**
- Contains info trigger + objection words: "caro", "expensive", "no creo", "don't think"

**Status:** Anticipated - no examples yet

---

## New Response Type Edge Cases (Jan's Patterns)

### EC-040: Casual Greeting Only

**Category:** Casual Greeting (NEW)
**Discovered:** 2026-01-03
**Source:** Jan's Manual Handling - Pankaj Dewari conversation

**Trigger Message:**
> "Hola"

**Why It's Tricky:**
Simple greeting with no context. Could be:
- Just being polite before asking something
- Checking if we're active
- Starting a conversation but not sure what to say
Previously would have been ignored or caused confusion.

**Correct Handling:**
**RESPOND** - Reply warmly, redirect to business by asking if they're still hiring.

**Jan's Approach (learned 2026-01-03):**
> "¡Hola [Name]! ¿Sigues buscando candidatos para tu vacante?"

**Detection Rule:**
- Message is SHORT (< 20 characters)
- Contains only greeting words: "hola", "hello", "hi", "how are you"
- NO follow-up question or context in same message

**Status:** Active - New Response Type

---

### EC-041: CV/Email Request

**Category:** CV/Email Request (NEW)
**Discovered:** 2026-01-03
**Source:** Jan's Manual Handling - Karen Letelier, José Tomás Célèry conversations

**Trigger Messages:**
> "hola me puedes enviar los cv de estos postulantes a mi correo?"
> "Puedes enviarmelo a mi correo?"

**Why It's Tricky:**
They're asking for CVs via email instead of using the platform. Options:
- ❌ Send CVs directly (loses platform value)
- ❌ Refuse (loses the lead)
- ✅ Redirect to platform signup (Jan's approach)

**Correct Handling:**
**RESPOND** - Agree enthusiastically, but redirect to platform signup first.

**Jan's Approach (learned 2026-01-03):**
> "Claro que sí, [Name]. Por favor publica tu vacante directamente en CazVid y te enviaré mis recomendaciones directamente por ahí. Puedes publicar gratis en: [link]"

**Key Insight:** Never refuse - always "yes, and..." with platform as prerequisite.

**Detection Rule:**
- Contains: "envíame los CVs", "mándame los CVs", "send me the CVs", "to my email", "a mi correo"

**Status:** Active - New Response Type

---

### EC-042: Multiple Cities Location

**Category:** Location Objection (Variant)
**Discovered:** 2026-01-03
**Source:** Jan's Manual Handling - HR Simran Sharma conversation

**Trigger Message:**
> "Hi jan, We hire for delhi, bangalore, Hyderabad, mumbai, pune, chennai. Please do share with me profiles for admin and hr roles"

**Why It's Tricky:**
Multiple locations mentioned + specific role requests. Need to:
1. Acknowledge their scope
2. Clarify which location to prioritize
3. Note the role preferences

**Correct Handling:**
**RESPOND** - Acknowledge locations, ask which to prioritize, pivot to next step.

**Jan's Approach (learned 2026-01-03):**
> "Hi [Name]! Nice to meet you! [...] To kick us off, which city should we prioritize first, and what's the most urgent role you need filled?"

**Detection Rule:**
- Multiple city names mentioned
- AND contains job role types
- Treat as Location Objection + clarification needed

**Status:** Active - Edge case of Location Objection

---

### EC-043: Commission/Pricing Question

**Category:** Info Request (Variant)
**Discovered:** 2026-01-03
**Source:** Jan's Manual Handling - Rodrigo Echeverría conversation

**Trigger Message:**
> "Hola que tal! ¿Cuál es la comisión por colocación?"

**Why It's Tricky:**
They're asking about commission (placement fee model), but CazVid uses subscription model instead. Need to:
1. Clarify the model difference
2. Be transparent about pricing
3. Highlight value proposition

**Correct Handling:**
**RESPOND** - Clarify no commission model, explain subscription approach, emphasize value.

**Jan's Approach (learned 2026-01-03):**
> "¡Hola [Name]! Nuestra plataforma es diferente—no cobramos comisión por colocación. [...] $50 USD al mes para contactar candidatos ilimitados [...] Si no te sirve, cancelas cuando quieras."

**Key Insight:** Transparency builds trust. "Cancelas cuando quieras" reduces commitment fear.

**Detection Rule:**
- Contains: "comisión", "commission", "placement fee", "fee per hire", "cuánto cobran por"

**Status:** Active - Variant of Info Request

---

### EC-044: Probing Deeper on Decline

**Category:** Agency Leads Decline (Variant)
**Discovered:** 2026-01-03
**Source:** Jan's Manual Handling - Hanson Raju conversation

**Trigger Message:**
> "Not Looking"

**Why It's Tricky:**
Very short decline without context. Standard "timing, fit, or need?" works, but Jan probes even deeper to understand if there's still an opportunity.

**Correct Handling:**
**RESPOND** - Ask for specific reason, offer to adjust approach.

**Jan's Approach (learned 2026-01-03):**
> "[Name], Just curious—is it timing, or are you not actively hiring at the moment? If things change, I'd be happy to reconnect!"

**Key Insight:** "If things change" leaves door open without being pushy.

**Detection Rule:**
- Very short decline (< 20 chars): "not looking", "pass", "no"
- Use enhanced decline response that probes deeper

**Status:** Active - Variant of Agency Leads Decline

---

### EC-045: Short Ambiguous Thank-You

**Category:** CazVid Thank-You (Ambiguous)
**Discovered:** 2026-01-06
**Source:** Training Mode 1 - Brisa Bonetti conversation (Mediocre AI Handling)

**Trigger Message:**
> "Hola John, te agradezco!"

**Why It's Tricky:**
- Very short message (4 words)
- No enthusiasm markers (no !!!, no specific praise)
- "Te agradezco" in Latin America can mean:
  - "Thank you" (genuine gratitude)
  - "I'm good" / "No thanks" (polite decline)
- Ambiguous intent - we don't know if they liked the profiles

**What Went Wrong:**
AI responded with full template dump:
- 50+ words to a 4-word message (energy mismatch)
- Said "te sirvan los perfiles" but she never said they served her (fabricated context)
- Assumed positive intent without confirmation

**Correct Handling:**
**RESPOND with SHORT probe first** - Match their brevity, ask calibrated question to discover intent.

**Ideal Response:**
```
¡Gracias a ti! ¿Qué te parecieron los perfiles?
```

**Why This Works:**
- Mirrors her gratitude (3 words to 4 words)
- Open "What" question (calibrated, not closed)
- No links/video/CTA until we know intent
- Feels like conversation, not script

**Detection Rule:**
- Thank-you trigger present (gracias, te agradezco, thanks)
- Message is SHORT (< 15 words)
- NO enthusiasm markers (!!!, "me sirve", "excelente", "great")
- NO specific mention of candidates/profiles

**Follow-Up Rule:**
- If they respond positively → Send full template with links
- If they respond negatively/neutral → Acknowledge gracefully, leave door open

**Status:** Active - New Response Variant

---

### EC-046: BPO/Outsourcing Company (Wrong Target)

**Category:** Agency Leads (Wrong Target)
**Discovered:** 2026-01-07
**Source:** Training Mode 1 - Mel Labay conversation (Bad AI Handling)

**Trigger Message:**
> "Thanks for reaching out Viviana. We are a BPO company that offers US companies cost-effective solutions by providing resources from our hub in the Philippines. Are you helping similar companies like ours? And these leads you provide, are they interested in hiring someone outside of US?"

**Why It's Tricky:**
- Mel is asking if we help "companies like ours"
- BPO companies SELL workers/services, they don't BUY candidates
- Agency Leads is for STAFFING AGENCIES that PLACE candidates at client companies
- AI incorrectly said "Yes, Agency Leads helps companies like yours"

**The Critical Difference:**
| Type | What They Do | Agency Leads Fit |
|------|--------------|------------------|
| Staffing Agency | Places candidates at CLIENT companies | ✅ YES - Our target |
| BPO Company | Provides their OWN employees as a service | ❌ NO - Wrong target |

**Correct Handling:**
**CLARIFY** - Acknowledge their model, explain we're designed for staffing agencies, ask if they're looking to fill their own internal roles.

**Better Response:**
> "Great question, Mel! Agency Leads is actually designed for recruitment/staffing agencies that place candidates at client companies. Since you're offering BPO services (providing your own team), it might not be the right fit. That said - are you ever looking to grow your internal team in the Philippines? CazVid might help with that!"

**Detection Rule:**
- Contains: "BPO company", "outsourcing", "provide resources from", "hub in Philippines", "nearshore", "offshore staffing", "we offer [workers/resources] to"
- Action: Flag for clarification or exclude from Agency Leads

**Status:** Active - Critical Wrong Target Detection

---

### EC-047: Location Objection After Rejection

**Category:** Location Objection (After Profiles Rejected)
**Discovered:** 2026-01-07
**Source:** Training Mode 1 - Macarena Gutierrez conversation (Bad AI Handling)

**Trigger Message:**
> "Hola como estas! Gracias, pero no cumplen con el requisito de residencia. Saludos! Buen año"

**Why It's Tricky:**
- Standard Location Objection (EC-004) is when they mention their preferred location
- This is DIFFERENT - she already received profiles and says they DON'T MEET requirements
- She's closing the conversation ("Saludos! Buen año")
- AI wrongly pushed platform signup after being told profiles failed

**What Went Wrong:**
AI responded with:
> "¡Gracias Macarena, igualmente buen año! Entiendo lo de la ubicación. Lo bueno es que puedes publicar tu vacante GRATIS en CazVid..."

Issues:
- Long response to brief closing message (energy mismatch)
- Pushed platform after profiles were already rejected
- Didn't ask WHERE she needs candidates

**Correct Handling:**
**PROBE FIRST** - Acknowledge the miss, ask which location they need, THEN offer to help if we can.

**Better Response:**
> "¡Buen año Macarena! Lamento que no hayan sido la ubicación correcta. ¿En qué zona necesitas candidatos? Tenemos gente en muchas ciudades."

**Why This Works:**
- Brief (matches her closing energy)
- Apologizes for the miss (tactical empathy)
- Asks specific question to reopen (calibrated)
- No links until we know we can help

**Detection Rule:**
- Location rejection phrases: "no cumplen", "don't meet requirements", "wrong location", "not in [city]"
- AFTER profiles were already sent (check conversation history)
- Distinction: EC-004 is proactive location mention, EC-047 is reactive rejection

**Status:** Active - Location Objection Variant

---

### EC-048: False Video Profile Claim

**Category:** CazVid Response (Incorrect Information)
**Discovered:** 2026-01-07
**Source:** Training Mode 3 - Joy Sharon Okpala conversation (Very Bad AI Handling)

**Trigger Message:**
> "Thank you so kindly for this"

**AI's Bad Response:**
> "You're welcome Joy! Each candidate on CazVid has a **video profile** so you can evaluate their communication and presentation before reaching out."

**Why It's Critical:**
- **FALSE CLAIM** - NOT all candidates have video profiles
- This is a platform feature, not a guarantee for every candidate
- Making false promises damages trust and credibility
- Joy responded positively and asked for more candidates - the lie "worked" but is still wrong

**Correct Handling:**
Never claim "each candidate has a video profile." Instead:
- Focus on actual platform benefits
- If mentioning video profiles, say "many candidates" or "some candidates"

**Better Response:**
> "You're welcome Joy! CazVid makes it easy to review candidates and reach out directly. Would you like me to send more candidates for the Secretary position?"

**Detection Rule:**
- **NEVER generate:** "each candidate has a video", "every candidate has video", "all candidates have video profiles"
- These phrases should trigger rewrite

**Status:** Active - Critical False Information Prevention

---

### EC-049: Wrong Language (Non-LATAM/Spain Locations)

**Category:** Language Detection Error
**Discovered:** 2026-01-07
**Source:** Training Mode 3 - Jordan Dahlquist conversation (Wrong Language)

**Trigger Message:**
> "Δεν μιλάω καλά Ισπανικά" (Greek: "I don't speak Spanish well")

**Context:**
- Prospect location: Nicosia, **Cyprus**
- We sent Spanish message to a Greek-speaking prospect
- Cyprus is NOT a Spanish-speaking country

**Why It's Critical:**
- System sent Spanish based on candidate locations (Brazil/LatAm), not prospect's location
- Cyprus = Greek/Turkish, not Spanish
- Sending wrong language = immediate credibility loss
- Jordan explicitly told us he doesn't speak Spanish

**Root Cause:**
The language detection looked at candidate locations instead of prospect's location/language.

**Countries That Should Get ENGLISH (not Spanish):**
| Region | Countries |
|--------|-----------|
| Europe (non-Spain) | Cyprus, Greece, Turkey, Italy, France, Germany, UK, etc. |
| Middle East | UAE, Israel, Saudi Arabia, etc. |
| Asia | India, Philippines, Singapore, etc. |
| Africa | Nigeria, Ghana, South Africa, Kenya, etc. |

**Correct Handling:**
ALWAYS check prospect's location before choosing language:
1. If prospect is in Spain or Latin America → Spanish
2. If prospect is anywhere else → English (default safe choice)
3. If prospect writes in specific language → Match their language

**Detection Rule:**
Before sending, check `correspondentProfile.location`:
- Contains "Cyprus", "Greece", "India", "Philippines", "Nigeria", "UK", "United States", etc. → Use English
- Contains "Mexico", "Argentina", "Colombia", "Spain", "Chile", "Peru", etc. → Use Spanish

**Status:** Active - Critical Language Detection Fix Needed

---

### EC-050: Language Switch Request

**Category:** Language Request
**Discovered:** 2026-01-07
**Source:** Training Mode 3 - Dhanshree Gade conversation

**Trigger Message:**
> "Hi Omer, Can we communicate in English?"

**Context:**
- Prospect in India received Spanish messages
- Politely asking to switch to English
- NOT a rejection - still interested!

**Correct Handling:**
**RESPOND** - Switch to English immediately, acknowledge their request, continue the conversation.

**Ideal Response:**
> "Of course, Dhanshree! Happy to continue in English. Did any of those candidates look like a good fit for your SAP ABAP position?"

**Detection Rule:**
- Contains: "communicate in English", "speak English", "in English please", "English?", "do you speak English"
- Action: Switch language AND continue conversation (don't just acknowledge)

**Status:** Active - New Response Type

---

### EC-051: PDF/Contact Request vs CV/Email Request Confusion

**Category:** Request Misclassification
**Discovered:** 2026-01-07
**Source:** Training Mode 1 - Shivani Saini & Midhun M conversations (Bad AI Handling)

**Trigger Messages:**
> "Please share me Email id and contact no also." (Shivani - after receiving candidates)
> "can you share their pdf resumes" (Midhun - after receiving candidates)

**Why It's Critical:**
- Both prospects asked for MORE INFO about candidates **we already sent**
- AI incorrectly used CV/Email Request template ("post your job on CazVid...")
- This doesn't make sense - they DON'T need to post a job, they have candidates!
- Should have used PDF Request template ("Contact Now button on candidate pages I sent you")

**The Critical Difference:**

| Request Type | Context | What They Want | Correct Response |
|--------------|---------|----------------|------------------|
| **CV/Email Request** | No candidates sent yet | "Send me CVs for my open role" | Redirect to post job first |
| **PDF Request** | Candidates ALREADY sent | "Share PDFs/contact info of those candidates" | Point to Contact Now button |

**What Went Wrong (AI Response):**
```
"If you post your job on CazVid, I can send the candidate details directly through the platform."
```
↑ WRONG: They already HAVE candidate links! They don't need to post a job.

**Correct Response:**
```
"Absolutely, Shivani! You can access the contact details directly through the CazVid platform. Just select the 'Contact Now' button on the candidate pages I sent you.

Here's a quick video showing how: https://youtu.be/mldU26l91ZA"
```

**Detection Rule:**

Check conversation history BEFORE classifying:
1. If we ALREADY sent candidate links in this conversation:
   - "pdf", "resume", "cv", "contact", "email id", "phone" → **PDF Request**
2. If NO candidates sent yet:
   - "send me cvs", "email me cvs" → **CV/Email Request**

**Key Phrases for PDF Request (when candidates already sent):**
- "their pdf", "their resume", "their cv", "their contact"
- "email id", "contact no", "phone number"
- "share pdf", "send pdf", "their linkedin"

**Key Phrases for CV/Email Request (no candidates sent):**
- "send me cvs to my email", "email me candidates"
- "send to my correo", "envíame los cvs"

**Status:** Active - Critical Misclassification Prevention

---

### EC-052: More Candidates Request (Redirect to Platform)

**Category:** CazVid - Candidate Request
**Discovered:** 2026-01-08
**Source:** Training Feedback - Cristhian Rodríguez conversation (Mediocre AI Handling)

**Trigger Message:**
> "Muchas Gracias David, si puedes enviarme mas, te lo agradecería."
> ("Thanks David, if you can send me more, I'd appreciate it.")

**Context:**
- We already sent candidates to Cristhian
- He's asking for MORE candidates
- AI sent 5 more candidates manually

**Why It's Mediocre (Not Bad):**
- Technically fulfilled his request
- But doesn't scale - keeps him dependent on manual sends
- Missed opportunity to convert to platform user

**Correct Handling:**
**RESPOND** - Redirect to POST A JOB for automatic candidate flow.

**Ideal Response:**
```
¡Con gusto Cristhian! La mejor forma de recibir candidatos continuamente es publicar tu vacante gratis aquí: [link]

Cuando lo hagas, enviamos tu oferta automáticamente a los 100 mejores candidatos que coincidan. Así recibes aplicaciones sin tener que pedir más.

¿Te ayudo con algo más?
```

**Why This Is Better:**
- Acknowledges his request warmly
- Explains the SCALABLE solution (job posting)
- Frames platform as MORE EFFICIENT for him
- Manual candidate sharing = teaser, platform = solution

**Detection Rule:**
- Prospect asks for "more candidates", "más candidatos", "envíame más", "send more", "more profiles"
- AND we already sent candidates in this conversation
- Action: Redirect to post job, explain automatic matching

**Status:** Active - Conversion Optimization

---

### EC-053: Recruiter Asking About CazVid

**Category:** CazVid - Recruiter-Specific Value Proposition
**Discovered:** 2026-01-08
**Source:** Training Feedback - Milton Andrade Villegas conversation (Good AI Handling - Enhancement)

**Trigger Message:**
> "...veo en tu pagina web que brindas el servicio para reclutadores... cuéntame como funciona eso por favor porque yo soy un reclutador"

**Context:**
- Milton is a RECRUITER (not a hiring manager)
- He's asking about services for recruiters
- AI correctly explained both CazVid and Agency Leads
- But missed opportunity to emphasize recruiter-specific benefits

**Why Enhancement Needed:**
- Standard CazVid pitch works for hiring managers
- Recruiters have DIFFERENT needs (more volume, more jobs)
- Should highlight recruiter-specific benefits

**Correct Handling:**
**RESPOND** - Include standard pitch PLUS recruiter-specific value:

**Enhanced Response for Recruiters:**
```
[Standard CazVid explanation...]

Como reclutador, CazVid puede ser especialmente útil para ti:
- Publicaciones ilimitadas - publica todas las vacantes que necesites
- Mensajes ilimitados - contacta candidatos sin límite
- Amplia base de datos - busca y explora directamente
- Como manejas más vacantes que un gerente típico, la plataforma escala contigo
```

**Recruiter Detection:**
- Headline contains: recruiter, reclutador, headhunter, talent acquisition, staffing
- They mention: "soy reclutador", "I'm a recruiter", "recruitment agency"
- They ask: "servicios para reclutadores", "for recruiters"

**Important Distinction:**
| Prospect Type | What They Need | CazVid Pitch |
|---------------|----------------|--------------|
| Hiring Manager | Fill their open role | Standard (free posting, $50 to contact) |
| Recruiter | Fill MANY roles efficiently | Standard + volume benefits |
| Staffing Agency | Leads to companies hiring | Agency Leads (different product) |

**Detection Rule:**
- Prospect identified as RECRUITER (headline, self-identification)
- Asking about CazVid or what we offer
- Action: Add recruiter-specific value proposition to response

**Status:** Active - Value Proposition Enhancement

---

### EC-054: Job Seeker (Redirect to CazVid App)

**Category:** Wrong Target - Redirect
**Discovered:** 2026-01-10
**Source:** Live Conversation - 2-OTIxOGQ3NGMtMmZiNS00ZWE0LTgwN2MtYWY0MTk2NDExY2Y4XzEwMA%3D%3D

**Trigger Messages:**
> "I'm looking for a job"
> "Do you have any openings?"
> "Busco trabajo"
> "Estoy buscando empleo"

**Context:**
- These are CANDIDATES looking for work, not employers hiring
- We're pitching to employers, but job seekers sometimes respond
- They're valuable - just need to go to the right place!

**Why It's Tricky:**
- Not a "wrong target" to close on - we CAN help them, just differently
- Don't want to brush them off rudely
- Should redirect them helpfully to job seeker registration

**Correct Handling:**
**REDIRECT** - Warmly redirect to CazVid job seeker registration at `https://cazvid.app.link`

**Ideal Response (English):**
```
Hi [Name]! Actually, we help companies find candidates - but great news: you can register as a job seeker on CazVid and get matched with employers looking for people like you!

Sign up here: https://cazvid.app.link

Good luck with your search!
```

**Ideal Response (Spanish):**
```
¡Hola [Name]! Nosotros ayudamos a empresas a encontrar candidatos, pero tengo buenas noticias: puedes registrarte como buscador de empleo en CazVid y conectarte con empleadores que buscan personas como tú.

Regístrate aquí: https://cazvid.app.link

¡Éxito en tu búsqueda!
```

**Detection Rule:**
- English: "looking for a job", "looking for work", "job hunting", "job searching", "open to opportunities", "between jobs", "do you have openings", "are you hiring"
- Spanish: "busco trabajo", "buscando trabajo", "busco empleo", "buscando empleo", "estoy desempleado", "sin trabajo", "busco oportunidades"

**Status:** Active - New Redirect Type

---

### EC-055: Link Trust Question

**Category:** Trust/Security Concern
**Discovered:** 2026-01-12
**Source:** Training Mode 2 - Mahmoud Abdelaziz conversation (Manual Handled Jan)

**Trigger Messages:**
> "is this link trust ?"
> "Is this link safe?"
> "Can I trust this link?"

**Context:**
- Prospect received candidate links with UTM parameters
- The long URL with parameters looks suspicious to them
- They're hesitant to click

**Why It's Tricky:**
- Legitimate security concern - we should address it
- Need to explain without being condescending
- Should offer alternative if they're still hesitant

**Correct Handling:**
**RESPOND** - Confirm legitimacy, explain simply, offer alternative.

**Jan's Response (learned 2026-01-12):**
```
Hi [Name], yes, this link is to an official page of CazVid and contains UTM parameters for marketing tracking.

You can also search for CazVid on google and get started from our website.
```

**Why This Works:**
- Confirms it's official
- Explains the technical part simply (UTM = marketing tracking)
- Offers alternative (search Google) for cautious prospects

**Detection Rule:**
- Contains: "is this link safe", "is this link trust", "can I trust this", "is this legitimate", "is this real", "looks suspicious"

**Status:** Active - New Response Type

---

### EC-056: Platform Hesitation

**Category:** Objection - Friction Concern
**Discovered:** 2026-01-12
**Source:** Training Mode 2 - Daniela Volio conversation (Manual Handled Jan)

**Trigger Messages:**
> "I am not looking to join any additional platforms"
> "I don't want to sign up for another service"
> "Too many platforms already"

**Context:**
- Prospect has platform fatigue
- Worried about commitment, subscriptions, complexity
- May have had bad experiences with other platforms

**Why It's Tricky:**
- Valid concern - people are overwhelmed with tools
- Need to address the friction directly
- Can't just ignore and push the link anyway

**Correct Handling:**
**RESPOND** - Address friction directly, emphasize simplicity.

**Jan's Response (learned 2026-01-12):**
```
No problem, [Name]. All you need to post your job for free over at CazVid, is your email.

No subscription required.

Might you feel it appropriate, you can post your job for free over at: [link]

Have a great weekend!
```

**Why This Works:**
- Acknowledges their concern: "No problem"
- Removes friction: "All you need is your email"
- Removes fear: "No subscription required"
- Soft language: "Might you feel it appropriate"
- Warm close: "Have a great weekend!"

**Detection Rule:**
- Contains: "don't want to join", "not looking to join", "another platform", "too many platforms", "don't want to sign up", "no more tools"

**Status:** Active - New Response Type

---

### EC-057: Not Decision Maker (Referral Request)

**Category:** Wrong Contact - Referral Opportunity
**Discovered:** 2026-01-12
**Source:** Training Mode 2 - Joanna Toro conversation (Manual Handled Jan)

**Trigger Messages:**
> "I'm not involved in vendor selection or purchasing decisions"
> "I'm not the decision maker"
> "You need to talk to my manager"
> "I don't handle that"

**Context:**
- Prospect is not the right person to sell to
- But they might know who IS the right person
- Opportunity to get a warm referral

**Why It's Tricky:**
- Easy to give up and move on
- But a referral is valuable
- Need to ask without being pushy

**Correct Handling:**
**RESPOND** - Acknowledge briefly, ask for referral.

**Jan's Response (learned 2026-01-12):**
```
Sounds good, [Name]. Is there any specific person I should reach out to?
```

**Why This Works:**
- Brief acknowledgment: "Sounds good"
- Direct referral request
- No over-explaining or apologizing
- Short and respectful

**Detection Rule:**
- Contains: "not the decision maker", "not involved in", "don't handle purchasing", "talk to my manager", "reach out to our", "not my area", "individual contributor"

**Status:** Active - New Response Type

---

### EC-058: Wrong Company Info

**Category:** Data Error - Recovery
**Discovered:** 2026-01-12
**Source:** Training Mode 2 - Sara Drake conversation (Manual Handled Jan)

**Trigger Messages:**
> "I don't work at [Company]"
> "I left that company"
> "That's not my company"
> "Wrong person"

**Context:**
- Our data is outdated - they changed jobs
- Embarrassing but recoverable
- They might still be a valid prospect

**Why It's Tricky:**
- Tempting to over-apologize
- Could lose the prospect if handled poorly
- Need to pivot quickly

**Correct Handling:**
**RESPOND** - Acknowledge briefly, ask clarifying question to stay in conversation.

**Jan's Response (learned 2026-01-12):**
```
Got it [Name]. Are you still in business development?
```

**Why This Works:**
- Brief acknowledgment: "Got it"
- Clarifying question to re-qualify them
- No excessive apology
- Stays in conversation

**Detection Rule:**
- Contains: "don't work at", "I left", "no longer at", "that's not my company", "wrong company", "I'm at [different company] now"

**Status:** Active - New Response Type

---

### EC-059: Phone Number Request

**Category:** High Interest - Contact Request
**Discovered:** 2026-01-12
**Source:** Training Mode 2 - Silpa Nayak conversation (Manual Handled Jan)

**Trigger Messages:**
> "Please forward your number"
> "I'll call you"
> "What's your phone number?"
> "Can I call you?"

**Context:**
- Prospect wants to talk on phone - HIGH INTEREST signal
- Need to provide contact info
- Still redirect to platform

**Correct Handling:**
**RESPOND** - Provide phone number + WhatsApp + redirect to platform.

**Jan's Response (learned 2026-01-12):**
```
Hi [Name], you may call us over at +16233047338 or write us on WhatsApp on that number.

Please post your job on [link] so I can send you candidates directly.
```

**Why This Works:**
- Provides phone number
- Offers WhatsApp alternative
- Still redirects to platform action

**Company Phone:** +16233047338

**Detection Rule:**
- Contains: "your number", "phone number", "call you", "I'll call", "can I call", "want to speak", "talk on phone"

**Status:** Active - New Response Type

---

### EC-060: Counter-Pitch (Someone Selling TO Us)

**Category:** Inbound Sales - Redirect
**Discovered:** 2026-01-12
**Source:** Training Mode 2 - Sarah Jones conversation (Manual Handled Jan)

**Trigger Messages:**
> "We help recruiters find candidates..."
> "We offer CV sourcing services..."
> "Would you like a free trial?"

**Context:**
- Someone is pitching THEIR services to us
- Often BPO or recruiting service providers
- We should decline but potentially redirect them to OUR product

**Correct Handling:**
**RESPOND** - Politely decline, pivot to our product if relevant.

**Jan's Response (learned 2026-01-12):**
```
Hi [Name], thanks but this does not apply to me.

You might be able to use our free job posting and candidate sourcing platform, CazVid.

Let me know if you'd like more info on that
```

**Why This Works:**
- Polite decline: "thanks but this does not apply to me"
- Pivot to our product
- Soft close: "Let me know if you'd like more info"

**Detection Rule:**
- Message is FROM them (not response to us)
- Contains sales language: "we help", "we offer", "free trial", "our services", "would you be interested"
- They're pitching, not responding

**Status:** Active - New Response Type

---

### EC-061: Gave Up Too Soon (Prospect Says "All Set")

**Category:** Persistence - Recovery Opportunity
**Discovered:** 2026-01-12
**Source:** Jan's Feedback - Corey Lee conversation (Bad AI Handling)

**Trigger Messages:**
> "I think we've got it covered"
> "We have everything we need"
> "Candidate scarce market" (said as reason)
> "All set thanks"

**Context:**
- Corey Lee (Founder @ Venture Recruit) said his market was "candidate scarce"
- AI responded: "Thanks for sharing that, Corey! I'll stop reaching out"
- This is WRONG - "candidate scarce" is a BUYING SIGNAL, not a close signal

**Why It's Critical:**
- "Candidate scarce" = They NEED candidates → CazVid helps!
- AI gave up when prospect presented a PROBLEM we can solve
- Should have pivoted to CazVid as the solution

**What Went Wrong (AI Response):**
```
"Thanks for sharing that, Corey! I'll stop reaching out for now, but if things change or you want to explore new talent sources, feel free to reconnect. Best of luck!"
```
↑ WRONG: Gave up when he NEEDS what we offer

**Correct Handling:**
**RESPOND** - Challenge them with a demo or make it a game.

**Jan's Instruction:**
> "If he really thinks he has everything let's review it in a demo. Make it a game."

**Better Response:**
```
"I hear you, Corey! Candidate-scarce market is exactly why we built CazVid though - our database has video-first candidates others don't see.

Tell you what - give me 2 minutes in a demo. If I can't show you candidates you haven't found yet, I'll never reach out again. Fair?"
```

**Why This Works:**
- Acknowledges their situation
- Pivots the PROBLEM into OUR SOLUTION
- Creates a low-risk "game" (2-minute demo)
- Stakes are clear (never reach out again if we fail)
- Makes it interesting, not pushy

**Detection Rule:**
- Prospect says: "all set", "covered", "have everything", "not hiring", "candidate scarce", "market is dry"
- AI is about to close/give up
- **STOP** - Offer demo challenge instead

**Status:** Active - Critical Persistence Pattern

---

### EC-062: Missing CTA (Dead End Message)

**Category:** Message Quality - Missing Action
**Discovered:** 2026-01-12
**Source:** Jan's Feedback - Conversation 2-Zjg2MzkwMTkt...

**What Happened:**
- AI sent a response that lacked a clear call-to-action
- Message was informative but didn't drive any action
- Prospect has nowhere to go after reading it

**Why It's Critical:**
- Every message should move the conversation forward
- No CTA = dead conversation
- "Activating messages" are what convert

**Correct Handling:**
**ALWAYS include one of these CTAs:**

1. **If they haven't posted a job:**
   - "Post your job for free here: [link]"

2. **If they've seen profiles:**
   - "Which candidate would you like to contact first?"
   - "Here's how to reach out: [video link]"

3. **If they're asking questions:**
   - "Want me to show you in a quick demo?"
   - "Would you like to see some sample candidates?"

4. **If they're declining:**
   - "Is it timing, fit, or need?"
   - "What would need to change for this to be useful?"

**Detection Rule:**
- Response is being generated
- Check: Does it contain a CTA or question?
- If NO → Add one before sending

**Status:** Active - Quality Guardrail

---

### EC-064: Demo/Call Request (Inbound Only - CazVid)

**Category:** CazVid - Meeting Request (Inbound)
**Discovered:** 2026-01-12
**Source:** Jan's Instruction - Weekly webinar introduction

**Trigger Messages:**
> "Can we schedule a call?"
> "I'd like to see a demo"
> "Can you show me how it works?"
> "¿Podemos agendar una llamada?"
> "Me gustaría una demostración"

**Context:**
- Prospect is ASKING US for a demo or call
- This is an INBOUND request - they initiated
- CazVid now has weekly webinars on Wednesdays

**Why It's Important:**
- Weekly webinars are efficient (group format)
- Prospect self-books, reducing friction
- Shows we're organized and professional
- BUT: Only offer when THEY ask first

**CRITICAL RULES:**

1. **ONLY for inbound requests** - Prospect must ask first
2. **CazVid ONLY** - Not for Agency Leads conversations
3. **Do NOT proactively offer** - Wait for them to request
4. **Let them self-book** - Provide link, they choose slot

**Webinar Schedule:**
| Language | Day | Time (Pacific) | Booking URL |
|----------|-----|----------------|-------------|
| Spanish | Wednesday | 10:00-10:30 AM | https://calendly.com/cazvid/demo-es |
| English | Wednesday | 11:00-11:30 AM | https://calendly.com/cazvid/demo-en |

**Correct Handling:**
**RESPOND** - Offer weekly webinar with self-booking link.

**Example Response (English):**
```
Of course [Name]! We do weekly webinars on Wednesdays from 11:00 to 11:30 AM Pacific time. You can reserve your spot here: https://calendly.com/cazvid/demo-en

Would that work for you?
```

**Example Response (Spanish):**
```
¡Claro [Name]! Hacemos webinars semanales los miércoles de 10:00 a 10:30 AM hora del Pacífico. Puedes reservar tu lugar aquí: https://calendly.com/cazvid/demo-es

¿Te funcionaría ese horario?
```

**Detection Rule:**
- CazVid conversation (not Agency Leads)
- Prospect message contains: "demo", "call", "meeting", "show me", "schedule", "llamada", "demostración", "reunión", "agendar"
- Message is a REQUEST, not just a question about the product
- Action: Offer weekly webinar with booking link

**What NOT to Do:**
- Don't proactively say "Would you like a demo?"
- Don't offer this in Agency Leads conversations
- Don't push demo when they just have simple questions

**Status:** Active - New Response Type (Inbound Only)

---

### EC-063: Context Not Used (Redundant Questions)

**Category:** Message Quality - Context Awareness
**Discovered:** 2026-01-12
**Source:** Jan's Feedback - Conversation 2-ZWMxZDUzZjct...

**What Happened:**
- AI asked "Do you have any job openings?"
- Prospect had ALREADY SAID "yes" about a customer service position
- AI didn't use the context from previous messages

**Why It's Critical:**
- Shows we're not listening
- Makes us look like a bot
- Damages trust instantly
- Prospect thinks: "Didn't I just say that?"

**Jan's Feedback:**
> "Did not use the context. We asked if they are still hiring for the customer service position, they said yes, and then we asked if they have any job."

**Correct Handling:**
**ALWAYS check conversation history before asking questions.**

**Before asking ANY question, verify:**
1. Has this already been asked?
2. Has the prospect already answered this?
3. Can I reference what they've already said?

**Example of BAD:**
```
Prospect: "Yes, we're still hiring for customer service"
AI: "Great! Do you have any open positions?"
```
↑ WRONG: They JUST told us they're hiring for customer service

**Example of GOOD:**
```
Prospect: "Yes, we're still hiring for customer service"
AI: "Perfect! I've got some customer service candidates in mind. Would you like me to send a few profiles over?"
```
↑ RIGHT: Uses context, advances conversation

**Detection Rule:**
- Before generating a question, search conversation history
- If similar question/answer exists → Reference it, don't repeat
- "You mentioned [X]..." is better than asking again

**Status:** Active - Quality Guardrail

---

## Adding New Edge Cases

When you encounter a new edge case:

1. Assign next available EC-XXX number
2. Document using the format above
3. Add detection rule to `config.md` exclusions
4. Log the addition in `improvement-log.md`
5. Update `knowledge-base.md` edge case registry table
