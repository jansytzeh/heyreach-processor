param([string]$InputFile, [int]$Limit = 50)

$data = Get-Content $InputFile -Raw | ConvertFrom-Json
$eligible = $data.items | Where-Object { $_.lastMessageSender -eq "CORRESPONDENT" }

# Output all eligible conversations for processing
$eligible | Select-Object -First $Limit | ForEach-Object {
    $conv = $_
    
    # Get sender last name for UTM
    $senderMap = @{
        93126 = "Bouwmeester"
        94526 = "Robles"
        94527 = "Rodriguez"
        94530 = "Mendoza"
        94531 = "Colunga"
        94533 = "Acebedo"
        94534 = "Heegstra"
        94559 = "Fajardo"
        94576 = "Bright"
        94837 = "Stacy"
        94853 = "Vandamme"
        96268 = "Squillante"
        96269 = "Shmul"
        96274 = "Daunt"
        96280 = "Hartenstein"
        96283 = "Cloward"
        96291 = "Morrow"
        96298 = "Russel"
        103961 = "Escalona"
        106125 = "Ledaine"
        118434 = "Orozco"
        135177 = "Rivera"
    }
    $senderLastName = $senderMap[$conv.linkedInAccountId]
    if (-not $senderLastName) { $senderLastName = "CazVid" }
    
    # Detect campaign from message content
    $campaign = "CazVid"
    $allMessages = ($conv.messages | ForEach-Object { $_.body }) -join " "
    if ($allMessages -match "agency-leads|calendly.com/agency-leads") {
        $campaign = "Agency Leads"
    }
    
    Write-Output "=== CONVERSATION ==="
    Write-Output "ID: $($conv.id)"
    Write-Output "AccountID: $($conv.linkedInAccountId)"
    Write-Output "SenderLastName: $senderLastName"
    Write-Output "Campaign: $campaign"
    Write-Output "Name: $($conv.correspondentProfile.firstName) $($conv.correspondentProfile.lastName)"
    Write-Output "Headline: $($conv.correspondentProfile.headline)"
    Write-Output "ProfileURL: $($conv.correspondentProfile.profileUrl)"
    Write-Output "Tags: $($conv.correspondentProfile.tags -join ', ')"
    Write-Output "TotalMessages: $($conv.totalMessages)"
    Write-Output ""
    Write-Output "--- MESSAGE HISTORY ---"
    $conv.messages | ForEach-Object {
        Write-Output "[$($_.sender)] $($_.body)"
        Write-Output "---"
    }
    Write-Output "=== END CONVERSATION ===`n"
}
