. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

$accountIds = @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)

$result = Get-HeyReachConversations -LinkedInAccountIds $accountIds -Seen $false -Limit 5
Write-Output "Total Count: $($result.totalCount)"

foreach ($conv in $result.items) {
    Write-Output "---"
    Write-Output "ID: $($conv.id)"
    Write-Output "AccountId: $($conv.linkedInAccountId)"
    Write-Output "Name: $($conv.correspondentProfile.firstName) $($conv.correspondentProfile.lastName)"
    Write-Output "lastMessageSender: $($conv.lastMessageSender)"
    Write-Output "Last Message: $($conv.lastMessageText)"
}
