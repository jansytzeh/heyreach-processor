. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

$linkedInAccountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)
$campaignIds = @(223998, 240191, 274509, 181549, 180990, 180988)

Get-HeyReachConversations -LinkedInAccountIds $linkedInAccountIds -CampaignIds $campaignIds -Seen $false -Limit 50 | ConvertTo-Json -Depth 10
