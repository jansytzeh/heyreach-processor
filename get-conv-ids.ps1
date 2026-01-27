# Mode 1 file (offset 100-150)
$f1 = 'C:\Users\jshee\.claude\projects\C--Users-jshee-Documents-heyreach-processor-git\fd2146ec-9893-45d9-84e6-1cefa2a30943\tool-results\mcp-heyreach-get_conversations_v2-1768243206933.txt'
$j1 = Get-Content $f1 -Raw | ConvertFrom-Json
$d1 = $j1[0].text | ConvertFrom-Json

$qualityTags = @('Excellent AI Handling', 'Good AI Handling', 'Mediocre AI Handling', 'Bad AI Handling', 'Very Bad AI Handling')

$tagged = $d1.items | Where-Object {
    $tags = $_.correspondentProfile.tags
    if ($tags) {
        $hasQualityTag = $false
        foreach ($t in $tags) {
            if ($qualityTags -contains $t) { $hasQualityTag = $true; break }
        }
        $hasQualityTag
    } else { $false }
}

Write-Host "=== MODE 1: Conversations with Quality Tags ==="
$tagged | ForEach-Object {
    $n = $_.correspondentProfile.firstName + ' ' + $_.correspondentProfile.lastName
    $qualTag = $_.correspondentProfile.tags | Where-Object { $qualityTags -contains $_ }
    Write-Host "$n | $qualTag | AccountId: $($_.linkedInAccountId) | ConvId: $($_.id)"
}

# Mode 3 file (unseen)
$f3 = 'C:\Users\jshee\.claude\projects\C--Users-jshee-Documents-heyreach-processor-git\fd2146ec-9893-45d9-84e6-1cefa2a30943\tool-results\mcp-heyreach-get_conversations_v2-1768243029582.txt'
$j3 = Get-Content $f3 -Raw | ConvertFrom-Json
$d3 = $j3[0].text | ConvertFrom-Json

$replies = $d3.items | Where-Object { $_.lastMessageSender -eq 'CORRESPONDENT' }

Write-Host ""
Write-Host "=== MODE 3: Interesting Prospect Replies ==="

# Filter for interesting ones (not just "thank you" or short acks)
$interesting = $replies | Where-Object {
    $m = $_.lastMessageText.ToLower()
    # Include: declines, questions, job seekers, wrong targets, errors
    $m -match 'no thank|not interested|position is taken|no longer|recruiting|at the moment|unfortunately|not received|email' -or
    $_.correspondentProfile.tags -contains 'Bad AI Handling' -or
    $_.correspondentProfile.tags -contains 'Mediocre AI Handling'
}

$interesting | Select-Object -First 10 | ForEach-Object {
    $n = $_.correspondentProfile.firstName + ' ' + $_.correspondentProfile.lastName
    $t = if ($_.correspondentProfile.tags) { $_.correspondentProfile.tags -join ', ' } else { 'none' }
    $m = $_.lastMessageText
    if ($m.Length -gt 80) { $m = $m.Substring(0, 80) + '...' }
    Write-Host "Name: $n | Tags: $t"
    Write-Host "AccountId: $($_.linkedInAccountId) | ConvId: $($_.id)"
    Write-Host "Msg: $m"
    Write-Host "---"
}
