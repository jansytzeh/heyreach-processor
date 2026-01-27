# HeyReach API Module
# Direct API calls to replace unreliable MCP server
# Base URL: https://api.heyreach.io
# Rate Limit: 300 requests/minute

$script:HeyReachBaseUrl = "https://api.heyreach.io"
$script:HeyReachApiKey = $null

# Error classification for smart retry logic
$script:RetryableStatusCodes = @(500, 502, 503, 504, 429)  # Server errors + rate limit
$script:NonRetryableStatusCodes = @(400, 401, 403, 404, 422)  # Client errors - don't retry

function Set-HeyReachApiKey {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ApiKey
    )
    $script:HeyReachApiKey = $ApiKey
}

function Get-HeyReachHeaders {
    if (-not $script:HeyReachApiKey) {
        throw "API Key not set. Call Set-HeyReachApiKey first."
    }
    return @{
        "X-API-KEY" = $script:HeyReachApiKey
        "Content-Type" = "application/json"
    }
}

function New-ApiResult {
    <#
    .SYNOPSIS
    Creates a standardized API result object for consistent error handling.
    #>
    param(
        [bool]$Success = $false,
        [object]$Data = $null,
        [int]$StatusCode = 0,
        [string]$ErrorMessage = $null,
        [bool]$IsRetryable = $false
    )
    return [PSCustomObject]@{
        Success = $Success
        Data = $Data
        StatusCode = $StatusCode
        ErrorMessage = $ErrorMessage
        IsRetryable = $IsRetryable
        Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
}

function Invoke-HeyReachApi {
    <#
    .SYNOPSIS
    Makes API calls with robust retry logic, timeout handling, and structured error responses.
    .PARAMETER ThrowOnError
    If $true (default for backward compatibility), throws on final failure.
    If $false, returns a structured result object with Success=$false.
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Endpoint,

        [Parameter(Mandatory=$false)]
        [string]$Method = "GET",

        [Parameter(Mandatory=$false)]
        [hashtable]$Body = $null,

        [Parameter(Mandatory=$false)]
        [int]$RetryCount = 3,

        [Parameter(Mandatory=$false)]
        [int]$RetryDelaySeconds = 2,

        [Parameter(Mandatory=$false)]
        [int]$TimeoutSeconds = 30,

        [Parameter(Mandatory=$false)]
        [bool]$ThrowOnError = $true
    )

    $uri = "$script:HeyReachBaseUrl$Endpoint"
    $headers = Get-HeyReachHeaders
    $lastError = $null
    $lastStatusCode = 0

    for ($i = 1; $i -le $RetryCount; $i++) {
        try {
            $params = @{
                Uri = $uri
                Method = $Method
                Headers = $headers
                ContentType = "application/json"
                TimeoutSec = $TimeoutSeconds
            }

            if ($Body -and $Method -ne "GET") {
                $params.Body = ($Body | ConvertTo-Json -Depth 10)
            }

            $response = Invoke-RestMethod @params

            # Success - return result
            if (-not $ThrowOnError) {
                return New-ApiResult -Success $true -Data $response -StatusCode 200
            }
            return $response
        }
        catch {
            $statusCode = 0
            $errorMessage = $_.Exception.Message

            # Extract status code if available
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }

            $lastError = $errorMessage
            $lastStatusCode = $statusCode

            # Check if error is retryable
            $isRetryable = ($statusCode -in $script:RetryableStatusCodes) -or ($statusCode -eq 0)

            # Non-retryable errors - fail immediately (404, 400, 401, 403, 422)
            if ($statusCode -in $script:NonRetryableStatusCodes) {
                Write-Warning "Non-retryable error ($statusCode): $errorMessage"
                if (-not $ThrowOnError) {
                    return New-ApiResult -Success $false -StatusCode $statusCode -ErrorMessage $errorMessage -IsRetryable $false
                }
                throw "API call failed (non-retryable, status $statusCode): $errorMessage"
            }

            # Rate limit - wait longer and retry
            if ($statusCode -eq 429) {
                Write-Warning "Rate limit hit. Waiting 60 seconds before retry..."
                Start-Sleep -Seconds 60
                continue
            }

            # Retryable errors (500, 502, 503, 504, timeout) - retry with exponential backoff + jitter
            if ($i -lt $RetryCount) {
                $backoffSeconds = [Math]::Min(($RetryDelaySeconds * [Math]::Pow(2, $i - 1)), 30)
                $jitter = Get-Random -Minimum 0 -Maximum 1000
                $totalWait = $backoffSeconds + ($jitter / 1000)

                Write-Warning "API call failed (attempt $i/$RetryCount, status $statusCode): $errorMessage"
                Write-Warning "Retrying in $([Math]::Round($totalWait, 1)) seconds..."
                Start-Sleep -Seconds $totalWait
            }
        }
    }

    # All retries exhausted
    if (-not $ThrowOnError) {
        return New-ApiResult -Success $false -StatusCode $lastStatusCode -ErrorMessage $lastError -IsRetryable $true
    }
    throw "API call failed after $RetryCount attempts: $lastError"
}

#region Authentication

function Test-HeyReachApiKey {
    <#
    .SYNOPSIS
    Verifies if the API key is valid.
    .OUTPUTS
    Returns $true if valid, throws error if invalid.
    #>
    try {
        Invoke-HeyReachApi -Endpoint "/api/public/auth/CheckApiKey" -Method "GET"
        return $true
    }
    catch {
        throw "Invalid API Key: $($_.Exception.Message)"
    }
}

#endregion

#region LinkedIn Accounts

# Note: LinkedIn account endpoints may not be available in all API versions.
# Account IDs are stored in config.md and returned in campaign data.

function Get-HeyReachLinkedInAccountsFromConfig {
    <#
    .SYNOPSIS
    Returns LinkedIn account IDs from the config. Use this instead of API call.
    .DESCRIPTION
    The LinkedIn accounts endpoint may not be publicly available.
    Account IDs are stored in config.md → API Required Parameters section.
    #>
    return @(93126, 94526, 94527, 94530, 94531, 94533, 94534, 94559, 94576, 94837, 94853, 96268, 96269, 96274, 96280, 96283, 96291, 96298, 103961, 106125, 118434, 122980, 123017, 123026, 135173, 135177, 135181, 135183, 135189)
}

function Get-HeyReachLinkedInAccounts {
    <#
    .SYNOPSIS
    Gets LinkedIn accounts from campaign data.
    .DESCRIPTION
    Extracts unique account IDs from active campaigns since direct endpoint may not be available.
    #>
    param(
        [int]$Limit = 100
    )

    # Get accounts from IN_PROGRESS campaigns
    $campaigns = Get-HeyReachCampaigns -Limit 100 -Statuses @("IN_PROGRESS")
    $accountIds = @()

    foreach ($campaign in $campaigns.items) {
        $accountIds += $campaign.campaignAccountIds
    }

    $uniqueAccounts = $accountIds | Select-Object -Unique

    return @{
        totalCount = $uniqueAccounts.Count
        items = $uniqueAccounts | Select-Object -First $Limit
    }
}

#endregion

#region Campaigns

function Get-HeyReachCampaigns {
    <#
    .SYNOPSIS
    Gets a paginated list of campaigns.
    .PARAMETER Offset
    Zero-based offset for pagination.
    .PARAMETER Limit
    Max records to return (max 100).
    .PARAMETER Keyword
    Optional filter by name.
    .PARAMETER Statuses
    Optional array of statuses: DRAFT, IN_PROGRESS, PAUSED, FINISHED, CANCELED, FAILED, STARTING
    .PARAMETER AccountIds
    Optional array of sender account IDs.
    #>
    param(
        [int]$Offset = 0,
        [int]$Limit = 100,
        [string]$Keyword = $null,
        [string[]]$Statuses = $null,
        [int[]]$AccountIds = $null
    )

    $body = @{
        offset = $Offset
        limit = [Math]::Min($Limit, 100)
    }

    if ($Keyword) { $body.keyword = $Keyword }
    if ($Statuses) { $body.statuses = $Statuses }
    if ($AccountIds) { $body.accountIds = $AccountIds }

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/GetAll" -Method "POST" -Body $body
}

function Get-HeyReachCampaignById {
    param(
        [Parameter(Mandatory=$true)]
        [long]$CampaignId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/GetById?campaignId=$CampaignId" -Method "GET"
}

function Resume-HeyReachCampaign {
    param(
        [Parameter(Mandatory=$true)]
        [long]$CampaignId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/Resume?campaignId=$CampaignId" -Method "POST"
}

function Suspend-HeyReachCampaign {
    param(
        [Parameter(Mandatory=$true)]
        [long]$CampaignId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/Pause?campaignId=$CampaignId" -Method "POST"
}

function Add-HeyReachLeadsToCampaign {
    <#
    .SYNOPSIS
    Adds leads to a campaign (V2).
    .PARAMETER CampaignId
    Target campaign ID.
    .PARAMETER AccountLeadPairs
    Array of objects with linkedInAccountId and lead properties.
    .PARAMETER ResumeFinishedCampaign
    Whether to restart campaign if finished.
    .PARAMETER ResumePausedCampaign
    Whether to resume if currently paused.
    #>
    param(
        [Parameter(Mandatory=$true)]
        [long]$CampaignId,

        [Parameter(Mandatory=$true)]
        [array]$AccountLeadPairs,

        [bool]$ResumeFinishedCampaign = $false,
        [bool]$ResumePausedCampaign = $false
    )

    $body = @{
        campaignId = $CampaignId
        accountLeadPairs = $AccountLeadPairs
        resumeFinishedCampaign = $ResumeFinishedCampaign
        resumePausedCampaign = $ResumePausedCampaign
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/AddLeadsToCampaignV2" -Method "POST" -Body $body
}

function Stop-HeyReachLeadInCampaign {
    param(
        [Parameter(Mandatory=$true)]
        [long]$CampaignId,

        [Parameter(Mandatory=$true)]
        [string]$LeadUrl,

        [string]$LeadMemberId = $null
    )

    $body = @{
        campaignId = $CampaignId
        leadUrl = $LeadUrl
    }

    if ($LeadMemberId) {
        $body.leadMemberId = $LeadMemberId
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/StopLeadInCampaign" -Method "POST" -Body $body
}

function Get-HeyReachLeadsFromCampaign {
    <#
    .SYNOPSIS
    Gets leads from a campaign.
    .PARAMETER CampaignId
    Campaign ID.
    .PARAMETER Offset
    Pagination offset.
    .PARAMETER Limit
    Max records (max 100).
    .PARAMETER TimeFrom
    ISO 8601 start date.
    .PARAMETER TimeTo
    ISO 8601 end date.
    .PARAMETER TimeFilter
    Filter type: CreationTime, LastActionTakenTime, FailedTime, Everywhere
    #>
    param(
        [Parameter(Mandatory=$true)]
        [long]$CampaignId,

        [int]$Offset = 0,
        [int]$Limit = 100,
        [string]$TimeFrom = $null,
        [string]$TimeTo = $null,
        [string]$TimeFilter = "Everywhere"
    )

    $body = @{
        campaignId = $CampaignId
        offset = $Offset
        limit = [Math]::Min($Limit, 100)
        timeFilter = $TimeFilter
    }

    if ($TimeFrom) { $body.timeFrom = $TimeFrom }
    if ($TimeTo) { $body.timeTo = $TimeTo }

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/GetLeadsFromCampaign" -Method "POST" -Body $body
}

function Get-HeyReachCampaignsForLead {
    <#
    .SYNOPSIS
    Finds campaigns a lead is involved in.
    .DESCRIPTION
    At least one of Email, LinkedInId, or ProfileUrl must be provided.
    #>
    param(
        [string]$Email = $null,
        [string]$LinkedInId = $null,
        [string]$ProfileUrl = $null,
        [int]$Offset = 0,
        [int]$Limit = 100
    )

    $body = @{
        offset = $Offset
        limit = [Math]::Min($Limit, 100)
    }

    if ($Email) { $body.email = $Email }
    if ($LinkedInId) { $body.linkedinId = $LinkedInId }
    if ($ProfileUrl) { $body.profileUrl = $ProfileUrl }

    return Invoke-HeyReachApi -Endpoint "/api/public/campaign/GetCampaignsForLead" -Method "POST" -Body $body
}

#endregion

#region Inbox / Conversations

function Get-HeyReachConversations {
    <#
    .SYNOPSIS
    Gets paginated LinkedIn conversations (V2).
    .PARAMETER LinkedInAccountIds
    Array of sender account IDs.
    .PARAMETER CampaignIds
    Array of campaign IDs.
    .PARAMETER LeadProfileUrl
    Specific lead URL to filter by.
    .PARAMETER Tags
    Array of tags to filter by.
    .PARAMETER Seen
    Filter by read/unread status. $null = all, $true = read, $false = unread
    .PARAMETER Offset
    Pagination offset.
    .PARAMETER Limit
    Max records (max 100).
    #>
    param(
        [int[]]$LinkedInAccountIds = @(),
        [int[]]$CampaignIds = @(),
        [string]$LeadProfileUrl = $null,
        [string[]]$Tags = $null,
        [Nullable[bool]]$Seen = $null,
        [int]$Offset = 0,
        [int]$Limit = 100
    )

    $filters = @{
        linkedInAccountIds = $LinkedInAccountIds
    }

    # Only include campaignIds if explicitly provided (non-empty)
    # Omitting it fetches ALL conversations across all campaigns
    if ($CampaignIds -and $CampaignIds.Count -gt 0) {
        $filters.campaignIds = $CampaignIds
    }

    if ($LeadProfileUrl) { $filters.leadProfileUrl = $LeadProfileUrl }
    if ($Tags) { $filters.tags = $Tags }
    if ($null -ne $Seen) { $filters.seen = $Seen }

    $body = @{
        filters = $filters
        offset = $Offset
        limit = [Math]::Min($Limit, 100)
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/inbox/GetConversationsV2" -Method "POST" -Body $body
}

function Get-HeyReachChatroom {
    <#
    .SYNOPSIS
    Gets a specific conversation with all messages.
    .PARAMETER AccountId
    LinkedIn account ID.
    .PARAMETER ConversationId
    Conversation ID.
    #>
    param(
        [Parameter(Mandatory=$true)]
        [int]$AccountId,

        [Parameter(Mandatory=$true)]
        [string]$ConversationId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/inbox/GetChatroom?accountId=$AccountId&conversationId=$ConversationId" -Method "GET"
}

function Send-HeyReachMessage {
    <#
    .SYNOPSIS
    Sends a message to a LinkedIn conversation.
    .PARAMETER LinkedInAccountId
    Sender account ID.
    .PARAMETER ConversationId
    Target conversation ID.
    .PARAMETER Message
    Message content.
    .PARAMETER Subject
    Message subject (usually empty for regular messages).
    #>
    param(
        [Parameter(Mandatory=$true)]
        [int]$LinkedInAccountId,

        [Parameter(Mandatory=$true)]
        [string]$ConversationId,

        [Parameter(Mandatory=$true)]
        [string]$Message,

        [string]$Subject = ""
    )

    $body = @{
        linkedInAccountId = $LinkedInAccountId
        conversationId = $ConversationId
        message = $Message
        subject = $Subject
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/inbox/SendMessage" -Method "POST" -Body $body
}

function Send-HeyReachMessageSafe {
    <#
    .SYNOPSIS
    Robust message sending with structured error handling for batch processing.
    Returns a result object instead of throwing - ideal for processing multiple conversations.

    .OUTPUTS
    PSCustomObject with properties:
    - Success: $true if message sent
    - ConversationId: The conversation ID attempted
    - StatusCode: HTTP status code (0 if timeout/connection error)
    - ErrorMessage: Error details if failed
    - IsRetryable: Whether the error could succeed on retry
    - ShouldSkip: Whether to skip this conversation in future runs

    .EXAMPLE
    $result = Send-HeyReachMessageSafe -LinkedInAccountId 93126 -ConversationId "abc123" -Message "Hello"
    if ($result.Success) { Write-Host "Sent!" }
    elseif ($result.ShouldSkip) { Write-Host "Skip this conversation: $($result.ErrorMessage)" }
    else { Write-Host "Retry later: $($result.ErrorMessage)" }
    #>
    param(
        [Parameter(Mandatory=$true)]
        [int]$LinkedInAccountId,

        [Parameter(Mandatory=$true)]
        [string]$ConversationId,

        [Parameter(Mandatory=$true)]
        [string]$Message,

        [string]$Subject = "",

        [int]$TimeoutSeconds = 30,

        [int]$RetryCount = 3
    )

    $body = @{
        linkedInAccountId = $LinkedInAccountId
        conversationId = $ConversationId
        message = $Message
        subject = $Subject
    }

    $result = Invoke-HeyReachApi -Endpoint "/api/public/inbox/SendMessage" -Method "POST" -Body $body -ThrowOnError $false -TimeoutSeconds $TimeoutSeconds -RetryCount $RetryCount

    # Add conversation context and skip recommendation
    $shouldSkip = $false
    if (-not $result.Success) {
        # 404 = conversation doesn't exist or is stale - skip permanently
        # 400/422 = bad request - likely invalid conversation - skip
        # 403 = forbidden - account issue - skip for this account
        $shouldSkip = $result.StatusCode -in @(400, 403, 404, 422)
    }

    return [PSCustomObject]@{
        Success = $result.Success
        ConversationId = $ConversationId
        LinkedInAccountId = $LinkedInAccountId
        Data = $result.Data
        StatusCode = $result.StatusCode
        ErrorMessage = $result.ErrorMessage
        IsRetryable = $result.IsRetryable
        ShouldSkip = $shouldSkip
        Timestamp = $result.Timestamp
    }
}

#endregion

#region Lists

function Get-HeyReachLists {
    <#
    .SYNOPSIS
    Gets lead/company lists.
    .PARAMETER Offset
    Pagination offset.
    .PARAMETER Limit
    Max records (max 100).
    .PARAMETER Keyword
    Filter by name.
    .PARAMETER ListType
    USER_LIST or COMPANY_LIST
    .PARAMETER CampaignIds
    Filter by associated campaigns.
    #>
    param(
        [int]$Offset = 0,
        [int]$Limit = 100,
        [string]$Keyword = $null,
        [string]$ListType = $null,
        [int[]]$CampaignIds = $null
    )

    $body = @{
        offset = $Offset
        limit = [Math]::Min($Limit, 100)
    }

    if ($Keyword) { $body.keyword = $Keyword }
    if ($ListType) { $body.listType = $ListType }
    if ($CampaignIds) { $body.campaignIds = $CampaignIds }

    return Invoke-HeyReachApi -Endpoint "/api/public/list/GetAll" -Method "POST" -Body $body
}

function Get-HeyReachListById {
    param(
        [Parameter(Mandatory=$true)]
        [long]$ListId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/list/GetById?listId=$ListId" -Method "GET"
}

function Add-HeyReachLeadsToList {
    <#
    .SYNOPSIS
    Adds leads to a list (V2).
    .PARAMETER ListId
    Target list ID.
    .PARAMETER Leads
    Array of lead objects.
    #>
    param(
        [Parameter(Mandatory=$true)]
        [long]$ListId,

        [Parameter(Mandatory=$true)]
        [array]$Leads
    )

    $body = @{
        listId = $ListId
        leads = $Leads
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/list/AddLeadsToListV2" -Method "POST" -Body $body
}

function Get-HeyReachLeadsFromList {
    param(
        [Parameter(Mandatory=$true)]
        [long]$ListId,

        [int]$Offset = 0,
        [int]$Limit = 100,
        [string]$Keyword = $null,
        [string]$LeadLinkedInId = $null,
        [string]$LeadProfileUrl = $null,
        [string]$CreatedFrom = $null,
        [string]$CreatedTo = $null
    )

    $body = @{
        listId = $ListId
        offset = $Offset
        limit = [Math]::Min($Limit, 1000)
    }

    if ($Keyword) { $body.keyword = $Keyword }
    if ($LeadLinkedInId) { $body.leadLinkedInId = $LeadLinkedInId }
    if ($LeadProfileUrl) { $body.leadProfileUrl = $LeadProfileUrl }
    if ($CreatedFrom) { $body.createdFrom = $CreatedFrom }
    if ($CreatedTo) { $body.createdTo = $CreatedTo }

    return Invoke-HeyReachApi -Endpoint "/api/public/list/GetLeadsFromList" -Method "POST" -Body $body
}

function New-HeyReachList {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ListName,

        [Parameter(Mandatory=$true)]
        [ValidateSet("USER_LIST", "COMPANY_LIST", "EVENT_LIST", "GROUP_LIST")]
        [string]$ListType = "USER_LIST"
    )

    $body = @{
        listName = $ListName
        listType = $ListType
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/list/CreateEmptyList" -Method "POST" -Body $body
}

function Remove-HeyReachLeadsFromList {
    param(
        [Parameter(Mandatory=$true)]
        [long]$ListId,

        [Parameter(Mandatory=$true)]
        [string[]]$LeadMemberIds
    )

    $body = @{
        listId = $ListId
        leadMemberIds = $LeadMemberIds
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/list/DeleteLeadsFromList" -Method "POST" -Body $body
}

#endregion

#region Stats

function Get-HeyReachOverallStats {
    <#
    .SYNOPSIS
    Gets aggregated statistics.
    .PARAMETER AccountIds
    Array of sender IDs (empty = all).
    .PARAMETER CampaignIds
    Array of campaign IDs (empty = all).
    .PARAMETER StartDate
    ISO 8601 start date.
    .PARAMETER EndDate
    ISO 8601 end date.
    #>
    param(
        [int[]]$AccountIds = @(),
        [int[]]$CampaignIds = @(),
        [string]$StartDate = $null,
        [string]$EndDate = $null
    )

    $body = @{
        accountIds = $AccountIds
        campaignIds = $CampaignIds
    }

    if ($StartDate) { $body.startDate = $StartDate }
    if ($EndDate) { $body.endDate = $EndDate }

    return Invoke-HeyReachApi -Endpoint "/api/public/stats/GetOverallStats" -Method "POST" -Body $body
}

#endregion

#region Leads / Tags

function Get-HeyReachLead {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProfileUrl
    )

    $body = @{
        profileUrl = $ProfileUrl
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/lead/GetLead" -Method "POST" -Body $body
}

function Add-HeyReachTagsToLead {
    <#
    .SYNOPSIS
    Adds tags to a lead.
    .PARAMETER ProfileUrl
    Lead's LinkedIn URL.
    .PARAMETER LeadLinkedInId
    Lead's LinkedIn ID (optional if ProfileUrl provided).
    .PARAMETER Tags
    Array of tag names.
    .PARAMETER CreateTagIfNotExisting
    Whether to create tags that don't exist.
    #>
    param(
        [string]$ProfileUrl = $null,
        [string]$LeadLinkedInId = $null,

        [Parameter(Mandatory=$true)]
        [string[]]$Tags,

        [bool]$CreateTagIfNotExisting = $true
    )

    $body = @{
        tags = $Tags
        createTagIfNotExisting = $CreateTagIfNotExisting
    }

    if ($ProfileUrl) { $body.leadProfileUrl = $ProfileUrl }
    if ($LeadLinkedInId) { $body.leadLinkedInId = $LeadLinkedInId }

    return Invoke-HeyReachApi -Endpoint "/api/public/lead/AddTags" -Method "POST" -Body $body
}

function Get-HeyReachTagsForLead {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProfileUrl
    )

    $body = @{
        profileUrl = $ProfileUrl
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/lead/GetTagsForLead" -Method "POST" -Body $body
}

function Set-HeyReachLeadTags {
    <#
    .SYNOPSIS
    Replaces all tags for a lead.
    #>
    param(
        [string]$ProfileUrl = $null,
        [string]$LeadLinkedInId = $null,

        [Parameter(Mandatory=$true)]
        [string[]]$Tags,

        [bool]$CreateTagIfNotExisting = $true
    )

    $body = @{
        tags = $Tags
        createTagIfNotExisting = $CreateTagIfNotExisting
    }

    if ($ProfileUrl) { $body.profileUrl = $ProfileUrl }
    if ($LeadLinkedInId) { $body.leadLinkedInId = $LeadLinkedInId }

    return Invoke-HeyReachApi -Endpoint "/api/public/lead/ReplaceTags" -Method "POST" -Body $body
}

function Get-HeyReachListsForLead {
    param(
        [string]$Email = $null,
        [string]$LinkedInId = $null,
        [string]$ProfileUrl = $null,
        [int]$Offset = 0,
        [int]$Limit = 100
    )

    $body = @{
        offset = $Offset
        limit = [Math]::Min($Limit, 1000)
    }

    if ($Email) { $body.email = $Email }
    if ($LinkedInId) { $body.linkedinId = $LinkedInId }
    if ($ProfileUrl) { $body.profileUrl = $ProfileUrl }

    return Invoke-HeyReachApi -Endpoint "/api/public/lead/GetListsForLead" -Method "POST" -Body $body
}

#endregion

#region Webhooks

function Get-HeyReachWebhooks {
    param(
        [int]$Offset = 0,
        [int]$Limit = 100
    )

    $body = @{
        offset = $Offset
        limit = [Math]::Min($Limit, 100)
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/webhook/GetAll" -Method "POST" -Body $body
}

function Get-HeyReachWebhookById {
    param(
        [Parameter(Mandatory=$true)]
        [long]$WebhookId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/webhook/GetById?webhookId=$WebhookId" -Method "GET"
}

function New-HeyReachWebhook {
    param(
        [Parameter(Mandatory=$true)]
        [string]$WebhookName,

        [Parameter(Mandatory=$true)]
        [string]$WebhookUrl,

        [Parameter(Mandatory=$true)]
        [ValidateSet("CONNECTION_REQUEST_SENT", "CONNECTION_REQUEST_ACCEPTED", "MESSAGE_SENT",
                     "MESSAGE_REPLY_RECEIVED", "INMAIL_SENT", "INMAIL_REPLY_RECEIVED",
                     "FOLLOW_SENT", "LIKED_POST", "VIEWED_PROFILE", "CAMPAIGN_COMPLETED",
                     "LEAD_TAG_UPDATED", "LEAD_FINISHED_SEQUENCE_WITHOUT_REPLYING",
                     "EVERY_MESSAGE_REPLY_RECEIVED")]
        [string]$EventType,

        [int[]]$CampaignIds = $null
    )

    $body = @{
        webhookName = $WebhookName
        webhookUrl = $WebhookUrl
        eventType = $EventType
    }

    if ($CampaignIds) { $body.campaignIds = $CampaignIds }

    return Invoke-HeyReachApi -Endpoint "/api/public/webhook/Create" -Method "POST" -Body $body
}

function Update-HeyReachWebhook {
    param(
        [Parameter(Mandatory=$true)]
        [long]$WebhookId,

        [string]$WebhookName = $null,
        [string]$WebhookUrl = $null,
        [string]$EventType = $null,
        [int[]]$CampaignIds = $null,
        [Nullable[bool]]$IsActive = $null
    )

    $body = @{
        webhookId = $WebhookId
    }

    if ($WebhookName) { $body.webhookName = $WebhookName }
    if ($WebhookUrl) { $body.webhookUrl = $WebhookUrl }
    if ($EventType) { $body.eventType = $EventType }
    if ($CampaignIds) { $body.campaignIds = $CampaignIds }
    if ($null -ne $IsActive) { $body.isActive = $IsActive }

    return Invoke-HeyReachApi -Endpoint "/api/public/webhook/Update" -Method "POST" -Body $body
}

function Remove-HeyReachWebhook {
    param(
        [Parameter(Mandatory=$true)]
        [long]$WebhookId
    )

    return Invoke-HeyReachApi -Endpoint "/api/public/webhook/Delete?webhookId=$WebhookId" -Method "DELETE"
}

#endregion

#region My Network

function Get-HeyReachMyNetwork {
    param(
        [Parameter(Mandatory=$true)]
        [int]$SenderId,

        [int]$PageNumber = 0,
        [int]$PageSize = 100
    )

    $body = @{
        senderId = $SenderId
        pageNumber = $PageNumber
        pageSize = [Math]::Min($PageSize, 100)
    }

    return Invoke-HeyReachApi -Endpoint "/api/public/mynetwork/GetMyNetworkForSender" -Method "POST" -Body $body
}

#endregion

# Note: All functions are automatically available when dot-sourcing this file
# Usage: . './heyreach-api.ps1'
