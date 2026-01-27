param([string]$InputFile)

$data = Get-Content $InputFile -Raw | ConvertFrom-Json
$eligible = $data.items | Where-Object { $_.lastMessageSender -eq "CORRESPONDENT" }

$eligible | Select-Object -First 3 | ForEach-Object {
    Write-Output "=========================================="
    Write-Output "Name: $($_.correspondentProfile.firstName) $($_.correspondentProfile.lastName)"
    Write-Output "Account ID: $($_.linkedInAccountId)"
    Write-Output "Conversation ID: $($_.id)"
    Write-Output "Campaign ID: $($_.campaignId)"
    Write-Output "Total Messages: $($_.totalMessages)"
    Write-Output ""
    Write-Output "MESSAGES:"
    $_.messages | ForEach-Object {
        Write-Output "  [$($_.sender)] $($_.createdAt): $($_.body)"
    }
    Write-Output ""
}
