param(
    [Parameter(Mandatory=$true)][int]$AccountId,
    [Parameter(Mandatory=$true)][string]$ConversationId,
    [string]$Message,
    [string]$MessageFile,
    [switch]$Safe,  # Use safe mode with structured error handling
    [int]$TimeoutSeconds = 30,
    [int]$RetryCount = 3
)

. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

# If MessageFile is provided, read message from file (supports complex multi-line messages)
if ($MessageFile -and (Test-Path $MessageFile)) {
    $Message = Get-Content -Path $MessageFile -Raw
}

if (-not $Message) {
    Write-Error "Message is required. Provide -Message or -MessageFile"
    exit 1
}

if ($Safe) {
    # Use safe mode - returns structured result, never throws
    $result = Send-HeyReachMessageSafe -LinkedInAccountId $AccountId -ConversationId $ConversationId -Message $Message -Subject '' -TimeoutSeconds $TimeoutSeconds -RetryCount $RetryCount
    $result | ConvertTo-Json -Depth 5

    # Exit with appropriate code
    if ($result.Success) {
        exit 0
    } elseif ($result.ShouldSkip) {
        exit 2  # Skip - don't retry this conversation
    } else {
        exit 1  # Retryable error
    }
} else {
    # Legacy mode - throws on error (backward compatible)
    Send-HeyReachMessage -LinkedInAccountId $AccountId -ConversationId $ConversationId -Message $Message -Subject '' | ConvertTo-Json -Depth 5
}
