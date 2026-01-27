# Fetch all unseen conversations
. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)

# Fetch WITHOUT campaign filter to get ALL unseen conversations
$result = Get-HeyReachConversations -LinkedInAccountIds $linkedInAccountIds -Seen $false -Offset 0 -Limit 100

Write-Output "Total unseen conversations: $($result.totalCount)"
Write-Output "Fetched in this batch: $($result.items.Count)"

# Show how many pages we need
$totalPages = [Math]::Ceiling($result.totalCount / 100)
Write-Output "Pages needed to fetch all: $totalPages"

# Output the result as JSON
$result | ConvertTo-Json -Depth 10
