param(
    [string]$InputFile
)

$data = Get-Content $InputFile -Raw | ConvertFrom-Json
$eligible = $data.items | Where-Object { $_.lastMessageSender -eq "CORRESPONDENT" }

Write-Output "Total: $($data.totalCount), Eligible (CORRESPONDENT): $($eligible.Count)"
Write-Output ""

$eligible | Select-Object -First 60 | ForEach-Object {
    Write-Output "---"
    Write-Output "ID: $($_.id)"
    Write-Output "Name: $($_.correspondentProfile.firstName) $($_.correspondentProfile.lastName)"
    Write-Output "Headline: $($_.correspondentProfile.headline)"
    Write-Output "Account: $($_.linkedInAccountId)"
    Write-Output "Last Message: $($_.lastMessageText)"
    Write-Output ""
}
