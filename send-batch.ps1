<#
.SYNOPSIS
Batch message sender with robust error handling.
Reads messages from a JSON file and sends them, tracking successes and failures.

.PARAMETER InputFile
JSON file with array of messages: [{accountId, conversationId, message}, ...]

.PARAMETER OutputFile
Optional file to write results (defaults to batch-results-{timestamp}.json)

.PARAMETER ContinueOnError
If true, continues processing after errors (default: true)

.PARAMETER DelayBetweenMs
Delay between messages in milliseconds to avoid rate limits (default: 500)

.EXAMPLE
.\send-batch.ps1 -InputFile messages.json
#>

param(
    [Parameter(Mandatory=$true)][string]$InputFile,
    [string]$OutputFile = $null,
    [bool]$ContinueOnError = $true,
    [int]$DelayBetweenMs = 500,
    [int]$TimeoutSeconds = 30,
    [int]$RetryCount = 3
)

. './heyreach-api.ps1'
Set-HeyReachApiKey -ApiKey 'MOUg/+IrTkTdT/jnZ4lfDePCCPhefADsWhmNFW1vuT4='

# Generate output filename if not provided
if (-not $OutputFile) {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $OutputFile = "batch-results-$timestamp.json"
}

# Read input messages
if (-not (Test-Path $InputFile)) {
    Write-Error "Input file not found: $InputFile"
    exit 1
}

$messages = Get-Content $InputFile -Raw | ConvertFrom-Json

Write-Host "=== Batch Message Sender ===" -ForegroundColor Cyan
Write-Host "Messages to send: $($messages.Count)"
Write-Host "Output file: $OutputFile"
Write-Host ""

# Track results
$results = @{
    startTime = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    endTime = $null
    totalMessages = $messages.Count
    successful = 0
    failed = 0
    skipped = 0
    retryable = 0
    messages = @()
}

$index = 0
foreach ($msg in $messages) {
    $index++
    Write-Host "[$index/$($messages.Count)] Sending to $($msg.conversationId)..." -NoNewline

    $result = Send-HeyReachMessageSafe `
        -LinkedInAccountId $msg.accountId `
        -ConversationId $msg.conversationId `
        -Message $msg.message `
        -TimeoutSeconds $TimeoutSeconds `
        -RetryCount $RetryCount

    # Record result
    $messageResult = @{
        index = $index
        accountId = $msg.accountId
        conversationId = $msg.conversationId
        success = $result.Success
        statusCode = $result.StatusCode
        errorMessage = $result.ErrorMessage
        shouldSkip = $result.ShouldSkip
        isRetryable = $result.IsRetryable
        timestamp = $result.Timestamp
    }
    $results.messages += $messageResult

    if ($result.Success) {
        Write-Host " OK" -ForegroundColor Green
        $results.successful++
    } elseif ($result.ShouldSkip) {
        Write-Host " SKIP ($($result.StatusCode))" -ForegroundColor Yellow
        $results.skipped++
    } else {
        Write-Host " FAIL ($($result.StatusCode))" -ForegroundColor Red
        $results.failed++
        if ($result.IsRetryable) {
            $results.retryable++
        }

        if (-not $ContinueOnError) {
            Write-Host "Stopping due to error (ContinueOnError=false)" -ForegroundColor Red
            break
        }
    }

    # Delay between messages to avoid rate limits
    if ($index -lt $messages.Count) {
        Start-Sleep -Milliseconds $DelayBetweenMs
    }
}

$results.endTime = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Write results to file
$results | ConvertTo-Json -Depth 10 | Out-File $OutputFile -Encoding UTF8

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Successful: $($results.successful)" -ForegroundColor Green
Write-Host "Skipped: $($results.skipped)" -ForegroundColor Yellow
Write-Host "Failed: $($results.failed)" -ForegroundColor Red
Write-Host "  Retryable: $($results.retryable)"
Write-Host ""
Write-Host "Results saved to: $OutputFile"

# Exit with appropriate code
if ($results.failed -gt 0 -and $results.retryable -gt 0) {
    exit 1  # Some retryable failures
} elseif ($results.failed -gt 0) {
    exit 2  # All failures are non-retryable (skips)
} else {
    exit 0  # All success
}
