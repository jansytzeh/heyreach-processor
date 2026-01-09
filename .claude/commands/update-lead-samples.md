# Update Agency Leads Sample Variables

Update the 3 lead samples used in Agency Leads sample request responses.

## Modes

Ask the user which mode to run:

| Mode | Description |
|------|-------------|
| **Auto** | Fetch fresh leads from Agency Leads list via API (recommended) |
| **Manual** | User provides 3 lead samples manually |

---

## Mode: Auto (Recommended)

### Pre-Flight Health Check with Auto-Retry

MCP connections can be temporarily unavailable. Implement automatic retries before falling back.

```
Attempt 1: mcp__heyreach__get_all_linked_in_accounts with limit: 1
  ↓ If "No such tool available"
  Wait 2 seconds
  ↓
Attempt 2: mcp__heyreach__get_all_linked_in_accounts with limit: 1
  ↓ If "No such tool available"
  Wait 5 seconds
  ↓
Attempt 3: mcp__heyreach__get_all_linked_in_accounts with limit: 1
  ↓ If "No such tool available"
  Fall back to Manual mode
```

Wait command: `timeout /t N /nobreak >nul 2>&1 || sleep N`

If all 3 attempts fail, inform user and switch to Manual mode.

### Steps

1. **Find Agency Leads list:**
   ```
   mcp__heyreach__get_all_lists
     keyword: "Agency Leads"
     listType: "USER_LIST"
     limit: 10
   ```

2. **Fetch leads from the list:**
   ```
   mcp__heyreach__get_leads_from_list
     listId: [found list ID]
     limit: 20
   ```

3. **Select 3 diverse leads:**
   - Pick leads with different job titles
   - Pick leads from different locations
   - Ensure variety (not all same industry)

4. **Format each lead:**
   ```
   [Position]: [Company Name] - [Location]
   ```

   Example:
   ```
   Senior Legal Assistant: Mishcon de Reya LLP - Cambridge, United Kingdom
   ```

5. **Update `config.md`** with new LEAD_SAMPLE_1, LEAD_SAMPLE_2, LEAD_SAMPLE_3

6. **Report:**
   - Show old vs new values
   - Confirm update complete

---

## Mode: Manual

1. Read `config.md` and show current values:
   - LEAD_SAMPLE_1
   - LEAD_SAMPLE_2
   - LEAD_SAMPLE_3

2. Ask for new values (format: `Job Title: Company - Location`)

3. Update `config.md` with new values

4. Confirm the update

---

## Format

```
Job Title: Company Name - City, State/Country
```

Examples:
```
DNS Network Engineer: DLS Engineering - Montgomery, Alabama
Executive Assistant to SVP: Rush Medical Center - Chicago, Illinois
Associate Attorney: Feldman Jackson, PC - Bethesda, Maryland
```

---

## Scheduling Recommendation

Run this command weekly (Mondays recommended) to keep samples fresh and relevant.
