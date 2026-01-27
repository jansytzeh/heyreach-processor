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

### Pre-Flight Health Check

Test the API connection:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File ./test-api.ps1
```

If this fails after 3 retries, switch to Manual mode.

### Steps

1. **Find Agency Leads list:**
   ```bash
   powershell -NoProfile -ExecutionPolicy Bypass -Command "
     . './heyreach-api.ps1'
     Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
     Get-HeyReachLists -Keyword 'Agency Leads' -ListType 'USER_LIST' -Limit 10 | ConvertTo-Json -Depth 10
   "
   ```

2. **Fetch leads from the list:**
   ```bash
   powershell -NoProfile -ExecutionPolicy Bypass -Command "
     . './heyreach-api.ps1'
     Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='
     Get-HeyReachLeadsFromList -ListId [found list ID] -Limit 20 | ConvertTo-Json -Depth 10
   "
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
