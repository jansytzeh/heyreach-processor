$f = 'C:\Users\jshee\.claude\projects\C--Users-jshee-Documents-heyreach-processor-git\fd2146ec-9893-45d9-84e6-1cefa2a30943\tool-results\mcp-heyreach-get_conversations_v2-1768243029582.txt'
$j = Get-Content $f -Raw | ConvertFrom-Json
$d = $j[0].text | ConvertFrom-Json

$replies = $d.items | Where-Object { $_.lastMessageSender -eq 'CORRESPONDENT' }

Write-Host "=== MODE 3: Unseen Conversations with Prospect Replies ==="
Write-Host "Total found: $($replies.Count)"
Write-Host ""

$replies | Select-Object -First 25 | ForEach-Object {
    $n = $_.correspondentProfile.firstName + ' ' + $_.correspondentProfile.lastName
    $t = if ($_.correspondentProfile.tags) { $_.correspondentProfile.tags -join ', ' } else { 'none' }
    $m = $_.lastMessageText
    if ($m.Length -gt 100) { $m = $m.Substring(0, 100) + '...' }

    Write-Host "Name: $n"
    Write-Host "Tags: $t"
    Write-Host "AccountId: $($_.linkedInAccountId) | ConvId: $($_.conversationId)"
    Write-Host "LastMsg: $m"
    Write-Host "---"
}
