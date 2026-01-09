# HeyReach Configuration

> This file contains essential settings, links, and guardrails.
> For agent behavior and decision-making, see `agent-persona.md`.

---

## Settings

| Setting | Value | Description |
|---------|-------|-------------|
| **FETCH_LIMIT** | `25` | Conversations to fetch per run (reduced from 99 to prevent overflow) |
| **MAX_MESSAGES_TO_SEND** | `30` | Messages to send per run |

---

## HeyReach API Configuration

> **NEW:** Direct API calls replace the unreliable MCP server for better reliability.

### API Credentials

| Setting | Value |
|---------|-------|
| **Base URL** | `https://api.heyreach.io` |
| **API Key** | `MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4=` |
| **Rate Limit** | 300 requests/minute |

### Using the API Module

Load the module in PowerShell:
```powershell
. ".\heyreach-api.ps1"
Set-HeyReachApiKey -ApiKey "MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4="
```

### Key Functions Available

| Function | Description |
|----------|-------------|
| `Get-HeyReachConversations` | Get conversations (replaces `get_conversations_v2`) |
| `Get-HeyReachChatroom` | Get full conversation (replaces `get_chatroom`) |
| `Send-HeyReachMessage` | Send message (replaces `send_message`) |
| `Get-HeyReachCampaigns` | Get campaigns (replaces `get_all_campaigns`) |
| `Get-HeyReachLinkedInAccounts` | Get accounts (replaces `get_all_linked_in_accounts`) |
| `Add-HeyReachTagsToLead` | Add tags (replaces `add_tags_to_lead`) |
| `Get-HeyReachOverallStats` | Get stats (replaces `get_overall_stats`) |

---

## API Required Parameters (CRITICAL)

> **ERR-008 Fix:** These arrays are REQUIRED for HeyReach API calls, despite being labeled "optional" in the schema.

### LinkedIn Account IDs (Active)

```json
[93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189]
```

### Campaign IDs (IN_PROGRESS)

```json
[223998, 240191, 274509, 181549, 180990, 180988]
```

### Usage Examples

**get_conversations_v2:**
```json
{
  "linkedInAccountIds": [93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189],
  "campaignIds": [223998, 240191, 274509, 181549, 180990, 180988],
  "seen": false,
  "limit": 50
}
```

**get_all_campaigns:**
```json
{
  "statuses": ["IN_PROGRESS"],
  "accountIds": [93126],
  "limit": 100
}
```

> **Note:** Update these IDs periodically if accounts or campaigns change. Use `get_all_linked_in_accounts` and `get_all_campaigns` to refresh.

---

## Agency Leads Sample Data (Update Weekly)

| Variable | Value |
|----------|-------|
| **LEAD_SAMPLE_1** | `Senior Legal Personal Assistant: Mishcon de Reya LLP - Cambridge, United Kingdom` |
| **LEAD_SAMPLE_2** | `Associate Attorney: Feldman Jackson, PC - Bethesda, Maryland` |
| **LEAD_SAMPLE_3** | `Executive Assistant to SVP of Legal: Rush University Medical Center - Chicago, Illinois` |

---

## Product Links

### CazVid Links

| Purpose | Spanish | English |
|---------|---------|---------|
| **Job Posting** | `https://share.cazvid.app/cazvid3.0/es/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=[SenderLastName]&utm_content=candidate` | `https://share.cazvid.app/cazvid3.0/en/free-job-posting?utm_source=linkedin&utm_medium=message&utm_campaign=[SenderLastName]&utm_content=candidate` |
| **Tutorial Video** | `https://youtu.be/c0E8sfSFqeM` | `https://youtu.be/mldU26l91ZA` |
| **Platform Intro** | `https://youtu.be/XJZcKKnymcU` | `https://youtu.be/XJZcKKnymcU` |

### Agency Leads Links

| Purpose | Link |
|---------|------|
| **Demo Booking** | `https://calendly.com/agency-leads/agency-leads-premium-staffing-leads-c0100` |

---

## Pricing Truth (NEVER Misrepresent)

### CazVid Pricing

| FREE | PAID ($50/month) |
|------|------------------|
| Posting jobs | Contacting candidates |
| Browsing candidates | Sending messages |
| Viewing video overviews | Accessing contact info |
| Receiving applications by email | - |

**Correct framing:** "Free to post, free to browse, $50/month when you want to contact candidates directly."

**NEVER say:**
- "Contacting candidates is free" (FALSE)
- "All candidates have video profiles" (FALSE - not all have videos)
- "I can match you with candidates" (FALSE - candidates apply, we don't manually match)

### What Happens When They Post a Job

1. We send their job to the **top 100 matching candidates**
2. Candidates apply directly
3. They **receive resumes by email**
4. They can browse and view profiles for FREE
5. $50/month subscription to contact candidates directly

---

## Campaign Identification

### Known Campaign IDs

| Campaign | IDs |
|----------|-----|
| Agency Leads | `223998`, `240191` |
| CazVid | All others |

### Content Detection (Primary Method)

| Campaign | Look For |
|----------|----------|
| Agency Leads | "agency-leads.com", "calendly.com/agency-leads" |
| CazVid | "cazvid.com", "cazvid.app", "candidatos potenciales" |

---

## Already Processed Detection

Skip conversations where we already sent these patterns:

| Pattern in Our Messages | Meaning |
|------------------------|---------|
| `share.cazvid.app` | We sent job posting link |
| `$50 USD` or `50 dólares` | We explained pricing |
| `calendly.com/agency-leads` | We offered demo |
| `timing, fit, or need` | We asked for decline reason |
| `¿Qué te parecieron los perfiles?` | We already probed |
| `What did you think of the profiles?` | We already probed |

---

## Sender Accounts

| ID | Name | Last Name (for UTM) |
|----|------|---------------------|
| 93126 | Wesley Bouwmeester | Bouwmeester |
| 94527 | Viviana Rodriguez | Rodriguez |
| 94530 | David Mendoza | Mendoza |
| 94531 | Pedro Alejandro Colunga López | Colunga |
| 94533 | John Acebedo | Acebedo |
| 94534 | Jan Sytze Heegstra | Heegstra |
| 94559 | Juan Fajardo | Fajardo |
| 94853 | Filip Vandamme | Vandamme |
| 96268 | Anthony Squillante | Squillante |
| 96269 | Yuvi Shmul | Shmul |
| 96280 | Asaf Hartenstein | Hartenstein |
| 103961 | Shadai Escalona | Escalona |
| 106125 | Emile Ledaine | Ledaine |
| 118434 | Camila Martinez | Martinez |

---

## Critical Guardrails

### ALWAYS Include When Advancing to Action

**For CazVid prospects ready to take action:**
1. Job posting link (correct language)
2. Tutorial video (correct language)
3. Clear call-to-action

**For Agency Leads sample requests:**
1. 3 lead samples
2. Calendly link
3. Specific time suggestions

### NEVER Do

| Violation | Why It's Critical |
|-----------|-------------------|
| Claim contacting is free | Damages trust, false advertising |
| Claim all have video profiles | Not true, sets wrong expectations |
| Skip required links when advancing | Loses conversion opportunity |
| Respond after clear decline | Feels spammy, damages reputation |
| Push BPO/outsourcing companies | Wrong target, wastes time |
| Fabricate context they didn't mention | Creepy, breaks trust |
| Use ALL CAPS names | Looks robotic |

### ALWAYS Do

| Principle | Why It Matters |
|-----------|----------------|
| Match their energy | Builds rapport |
| Use correct language | Basic respect |
| Address their actual message | Shows you listened |
| Personalize with their name | Feels human |
| End with clear next step | Advances the deal |

---

## Wrong Targets (Do Not Pursue)

### BPO/Outsourcing Companies (Agency Leads)

These companies SELL workers, they don't BUY candidates. Not our target.

**Detection phrases:**
- "BPO company" / "outsourcing company"
- "provide resources from [country]"
- "hub in [country]" (offshore delivery center language)
- "offshore staffing" / "nearshore"
- "we offer workers/resources to clients"

**Action:** Close gracefully, explain we're for staffing agencies that place candidates.

### Freelance Recruiters (Both)

**Detection phrases:**
- "soy reclutador freelance"
- "I'm an independent recruiter"

**Action:** Close gracefully, our products work best for companies/agencies.

---

## Language Detection

### Use Spanish for:
- Mexico, Latin America, Spain
- Messages in Spanish
- Profiles with Spanish names and LATAM locations

### Use English for:
- US, UK, Canada, Australia, India, Philippines, Singapore
- Messages in English
- Profiles with English names and Anglo locations

### When Unclear:
- Check their message language first
- Check their LinkedIn profile location
- Default to English if truly ambiguous

---

## Technical Notes

### Session Handling

**ALWAYS fetch fresh conversation list at start of each run.** Conversation IDs from previous sessions may return 404 errors.

### API Limits

- `get_conversations_v2`: Max 100 per call
- `send_message`: No documented limit, but pace yourself
- Large responses: May overflow context, use smaller limits

---

## Reference Architecture

```
agent-persona.md      → Who you are and how you think
config.md (this file) → Settings, links, guardrails
knowledge-base.md     → Learned patterns and edge cases
process-heyreach.md   → Execution workflow
```
