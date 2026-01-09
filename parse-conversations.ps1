$inputFile = $args[0]
$data = (Get-Content $inputFile | ConvertFrom-Json)[0].text | ConvertFrom-Json
$filtered = $data.items | Where-Object { $_.lastMessageSender -eq 'CORRESPONDENT' }

Write-Host "Total needing response: $($filtered.Count)"
Write-Host ""

$filtered | Select-Object -First 60 | ForEach-Object {
    $msgLen = [Math]::Min(100, $_.lastMessageText.Length)
    $msg = $_.lastMessageText.Substring(0, $msgLen)
    if ($_.lastMessageText.Length -gt 100) { $msg += "..." }

    Write-Host "---"
    Write-Host "ID: $($_.id)"
    Write-Host "AccountId: $($_.linkedInAccountId)"
    Write-Host "Name: $($_.correspondentProfile.firstName) $($_.correspondentProfile.lastName)"
    Write-Host "Campaign: $($_.campaignId)"
    Write-Host "Message: $msg"
}
