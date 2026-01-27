# Fetch all unseen conversations - all pages
. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)

$allConversations = @()
$offset = 0
$limit = 100

do {
    Write-Host "Fetching offset $offset..."
    $result = Get-HeyReachConversations -LinkedInAccountIds $linkedInAccountIds -Seen $false -Offset $offset -Limit $limit

    $allConversations += $result.items
    $offset += $limit

    Write-Host "  Got $($result.items.Count) items, total so far: $($allConversations.Count)"
} while ($result.items.Count -eq $limit -and $allConversations.Count -lt $result.totalCount)

Write-Host "`nTotal fetched: $($allConversations.Count)"
Write-Host "Total reported by API: $($result.totalCount)"

# Filter for CORRESPONDENT last messages
$correspondentLast = $allConversations | Where-Object { $_.lastMessageSender -eq "CORRESPONDENT" }
Write-Host "`nConversations where CORRESPONDENT messaged last: $($correspondentLast.Count)"

# Output summary of each
$correspondentLast | ForEach-Object {
    $name = "$($_.correspondentProfile.firstName) $($_.correspondentProfile.lastName)"
    $msg = $_.lastMessageText
    if ($msg.Length -gt 60) { $msg = $msg.Substring(0, 60) + "..." }
    $tags = if ($_.correspondentProfile.tags) { $_.correspondentProfile.tags -join "," } else { "" }
    Write-Host "$name | $($_.linkedInAccountId) | $tags | $msg"
}

# Output as JSON for processing
$output = @{
    totalFetched = $allConversations.Count
    correspondentLastCount = $correspondentLast.Count
    conversations = $correspondentLast
}
$output | ConvertTo-Json -Depth 10 | Out-File -FilePath "all-correspondent-conversations.json" -Encoding UTF8
Write-Host "`nSaved to all-correspondent-conversations.json"
