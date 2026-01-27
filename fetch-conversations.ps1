param(
    [int]$Limit = 100,
    [int]$Offset = 0
)

. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)

# Note: Do NOT filter by CampaignIds - we want ALL unseen conversations
Get-HeyReachConversations -LinkedInAccountIds $linkedInAccountIds -Seen $false -Limit $Limit -Offset $Offset | ConvertTo-Json -Depth 10
