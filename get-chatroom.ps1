param(
    [Parameter(Mandatory=$true)][int]$AccountId,
    [Parameter(Mandatory=$true)][string]$ConversationId
)

. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

Get-HeyReachChatroom -AccountId $AccountId -ConversationId $ConversationId | ConvertTo-Json -Depth 10
