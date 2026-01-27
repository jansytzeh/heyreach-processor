# Classify conversations - identify those needing response vs already closed
$data = Get-Content "all-correspondent-conversations.json" -Raw | ConvertFrom-Json

$needsResponse = @()
$alreadyClosed = @()
$manualHandled = @()
$emptyMessages = @()

# Patterns for "already closed" - simple acknowledgments after we closed
$closedPatterns = @(
    "^gracias\.?$",
    "^thanks\.?$",
    "^thank you\.?$",
    "^muchas gracias\.?$",
    "^ok,? gracias\.?$",
    "^okay,? gracias\.?$",
    "^will do,? thanks\.?$",
    "^cheers\.?$",
    "^saludos\.?$",
    "^ok\.?$",
    "^thnx!?$",
    "^de acuerdo\.?$",
    "^any time\.?$",
    "^no problem\.?$"
)

foreach ($conv in $data.conversations) {
    $name = "$($conv.correspondentProfile.firstName) $($conv.correspondentProfile.lastName)"
    $msg = $conv.lastMessageText.Trim().ToLower()
    $tags = $conv.correspondentProfile.tags

    # Skip empty messages
    if ([string]::IsNullOrWhiteSpace($msg)) {
        $emptyMessages += @{
            name = $name
            id = $conv.id
            accountId = $conv.linkedInAccountId
        }
        continue
    }

    # Skip manually handled
    if ($tags -contains "Manual Handled Jan") {
        $manualHandled += @{
            name = $name
            id = $conv.id
            accountId = $conv.linkedInAccountId
            message = $conv.lastMessageText
        }
        continue
    }

    # Check for simple closed patterns
    $isClosed = $false
    foreach ($pattern in $closedPatterns) {
        if ($msg -match $pattern) {
            $isClosed = $true
            break
        }
    }

    # Additional closed indicators
    if (-not $isClosed) {
        # Position filled
        if ($msg -match "ya (fue )?cubri(da|erta|o)|already (have|covered|filled)|ya tenemos|ya arm[e�] al equipo|ya encontr[e�]|position is no longer|no longer available|vacante (ya )?cerr[o�]") {
            $isClosed = $true
        }
        # Explicit stop requests
        elseif ($msg -match "dejar de enviar|please don't send|no me env[i�]es") {
            $isClosed = $true
        }
        # We recruit elsewhere / different service
        elseif ($msg -match "we recruit in|somos recruiter|hacemos lo mismo|no necesito personal|no utilizamos") {
            $isClosed = $true
        }
        # Simple one-word thanks with emoji or minor additions
        elseif ($msg -match "^(muchas )?gracias[!\. ]*$|^thank(s| you)[!\. ]*$") {
            $isClosed = $true
        }
    }

    if ($isClosed) {
        $alreadyClosed += @{
            name = $name
            id = $conv.id
            accountId = $conv.linkedInAccountId
            message = $conv.lastMessageText
        }
    } else {
        $needsResponse += @{
            name = $name
            id = $conv.id
            accountId = $conv.linkedInAccountId
            message = $conv.lastMessageText
            headline = $conv.correspondentProfile.headline
            company = $conv.correspondentProfile.companyName
            tags = $tags
        }
    }
}

Write-Host "=== CLASSIFICATION RESULTS ==="
Write-Host "Total conversations: $($data.conversations.Count)"
Write-Host "Empty messages (skip): $($emptyMessages.Count)"
Write-Host "Manual Handled Jan (skip): $($manualHandled.Count)"
Write-Host "Already closed (skip): $($alreadyClosed.Count)"
Write-Host "NEEDS RESPONSE: $($needsResponse.Count)"
Write-Host ""

Write-Host "=== CONVERSATIONS NEEDING RESPONSE ==="
$needsResponse | ForEach-Object {
    $msg = $_.message
    if ($msg.Length -gt 80) { $msg = $msg.Substring(0, 80) + "..." }
    Write-Host "$($_.name) | $($_.accountId) | $msg"
}

# Save eligible conversations to JSON
$needsResponse | ConvertTo-Json -Depth 5 | Out-File -FilePath "needs-response.json" -Encoding UTF8
Write-Host "`nSaved $($needsResponse.Count) eligible conversations to needs-response.json"
