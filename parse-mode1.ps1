$f = 'C:\Users\jshee\.claude\projects\C--Users-jshee-Documents-heyreach-processor-git\fd2146ec-9893-45d9-84e6-1cefa2a30943\tool-results\mcp-heyreach-get_conversations_v2-1768243206933.txt'
$j = Get-Content $f -Raw | ConvertFrom-Json
$d = $j[0].text | ConvertFrom-Json

$qualityTags = @('Excellent AI Handling', 'Good AI Handling', 'Mediocre AI Handling', 'Bad AI Handling', 'Very Bad AI Handling')

$tagged = $d.items | Where-Object {
    $tags = $_.correspondentProfile.tags
    if ($tags) {
        $hasQualityTag = $false
        foreach ($t in $tags) {
            if ($qualityTags -contains $t) { $hasQualityTag = $true; break }
        }
        $hasQualityTag
    } else { $false }
}

Write-Host "=== MODE 1: Quality Tagged Conversations (offset 100-150) ==="
Write-Host "Total found: $($tagged.Count)"
Write-Host ""

$tagged | ForEach-Object {
    $n = $_.correspondentProfile.firstName + ' ' + $_.correspondentProfile.lastName
    $t = $_.correspondentProfile.tags -join ', '
    $m = $_.lastMessageText
    if ($m.Length -gt 80) { $m = $m.Substring(0, 80) + '...' }

    Write-Host "Name: $n"
    Write-Host "Tags: $t"
    Write-Host "AccountId: $($_.linkedInAccountId) | ConvId: $($_.conversationId)"
    Write-Host "LastMsg: $m"
    Write-Host "---"
}
