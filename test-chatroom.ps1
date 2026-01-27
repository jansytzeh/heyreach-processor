param(
    [int]$AccountId,
    [string]$ConversationId
)

Add-Type -AssemblyName System.Web

. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

$encoded = [System.Web.HttpUtility]::UrlEncode($ConversationId)
Write-Output "Raw: $ConversationId"
Write-Output "Encoded: $encoded"

$headers = @{
    "X-API-KEY" = "MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4="
    "Content-Type" = "application/json"
}

$uri = "https://api.heyreach.io/api/public/inbox/GetChatroom?accountId=$AccountId&conversationId=$encoded"
Write-Output "URI: $uri"

try {
    $response = Invoke-RestMethod -Uri $uri -Headers $headers -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Output "Error: $($_.Exception.Message)"
    Write-Output "Status: $($_.Exception.Response.StatusCode)"
}
