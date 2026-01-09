# **HeyReach API Documentation**

**Base URL**: https://api.heyreach.io

## **Authentication**

All requests must be authenticated using an API key provided in the request header.

* **Header Name**: X-API-KEY  
* **Value**: Your unique API key.

### **Check API Key**

Verifies if your API key is valid.

* **Method**: GET  
* **Endpoint**: /api/public/auth/CheckApiKey

curl \--location '\[https://api.heyreach.io/api/public/auth/CheckApiKey\](https://api.heyreach.io/api/public/auth/CheckApiKey)' \\  
\--header 'X-API-KEY: \<YOUR\_API\_KEY\>'

Response (200 OK):  
No body content. Returns 200 if valid.

## **Rate Limits**

* **Limit**: 300 requests per minute.  
* **Exceeded**: Returns 429 Too Many Requests.

## **Campaigns**

### **Get All Campaigns**

Get a paginated collection of all campaigns (limit 100 per request).

* **Method**: POST  
* **Endpoint**: /api/public/campaign/GetAll

**Body Parameters**:

| Parameter | Type | Description |
| :---- | :---- | :---- |
| offset | integer | Records to skip. |
| limit | integer | Max records to return. |
| keyword | string | (Optional) Filter by name. |
| statuses | array | (Optional) Filter by status (e.g., "DRAFT", "PAUSED"). |
| accountIds | array | (Optional) Filter by sender account IDs. |

**Example Request**:

{  
  "offset": 0,  
  "keyword": "my campaign name",  
  "statuses": \["DRAFT", "PAUSED"\],  
  "accountIds": \[123, 2, 5\],  
  "limit": 10  
}

**Example Response**:

{  
  "totalCount": 15,  
  "items": \[  
    {  
      "id": 12345,  
      "name": "Outreach Campaign Q1",  
      "creationTime": "2024-01-01T12:00:00Z",  
      "linkedInUserListName": "My Lead List",  
      "linkedInUserListId": 98765,  
      "campaignAccountIds": \[123, 456\],  
      "status": "IN\_PROGRESS",  
      "progressStats": {  
        "totalUsers": 100,  
        "totalUsersInProgress": 50,  
        "totalUsersPending": 0,  
        "totalUsersFinished": 40,  
        "totalUsersFailed": 10  
      },  
      "excludeAlreadyMessagedGlobal": false,  
      "excludeAlreadyMessagedCampaignAccounts": false,  
      "excludeFirstConnectionCampaignAccounts": false,  
      "excludeFirstConnectionGlobal": false,  
      "excludeNoProfilePicture": false,  
      "excludeListId": null  
    }  
  \]  
}

### **Get Campaign By ID**

* **Method**: GET  
* **Endpoint**: /api/public/campaign/GetById?campaignId=\<long\>

**Query Parameters**:

* campaignId (Required): ID of the campaign.

**Example Response**:

{  
  "id": 274079,  
  "name": "My First Campaign",  
  "creationTime": "2025-12-01T08:06:15.463169Z",  
  "linkedInUserListName": "LinkedIn Ad BF Leads",  
  "linkedInUserListId": 123456,  
  "campaignAccountIds": \[ 113298 \],  
  "status": "IN\_PROGRESS",  
  "progressStats": {  
    "totalUsers": 9,  
    "totalUsersInProgress": 8,  
    "totalUsersPending": 0,  
    "totalUsersFinished": 1,  
    "totalUsersFailed": 0,  
    "totalUsersManuallyStopped": 0,  
    "totalUsersExcluded": 0  
  },  
  "excludeInOtherCampaigns": false,  
  "excludeHasOtherAccConversations": false,  
  "excludeContactedFromSenderInOtherCampaign": false,  
  "excludeListId": null,  
  "organizationUnitId": 12345  
}

### **Resume Campaign**

* **Method**: POST  
* **Endpoint**: /api/public/campaign/Resume?campaignId=\<long\>

**Response**: No body content (200 OK).

### **Pause Campaign**

* **Method**: POST  
* **Endpoint**: /api/public/campaign/Pause?campaignId=\<long\>

**Response**: No body content (200 OK).

### **Add Leads to Campaign (V2)**

Adds leads to a campaign. Returns counts of added/updated/failed leads.

* **Method**: POST  
* **Endpoint**: /api/public/campaign/AddLeadsToCampaignV2

**Body Parameters**:

| Parameter | Type | Description |
| :---- | :---- | :---- |
| campaignId | long | Target campaign ID. |
| accountLeadPairs | array | List of leads paired with sender accounts. |
| resumeFinishedCampaign | boolean | Restart campaign if finished? |
| resumePausedCampaign | boolean | Resume if currently paused? |

**Example Request**:

{  
  "campaignId": 235,  
  "accountLeadPairs": \[  
    {  
      "linkedInAccountId": 123,  
      "lead": {  
        "firstName": "John",  
        "lastName": "Doe",  
        "location": "USA",  
        "summary": "SDR",  
        "companyName": "HeyReach",  
        "position": "SDR",  
        "emailAddress": "john\_doe@example.com",  
        "profileUrl": "\[https://www.linkedin.com/in/john-doe\](https://www.linkedin.com/in/john-doe)",  
        "customUserFields": \[  
          { "name": "favorite\_color", "value": "blue" }  
        \]  
      }  
    }  
  \],  
  "resumeFinishedCampaign": false,  
  "resumePausedCampaign": true  
}

**Example Response**:

{  
    "addedLeadsCount": 10,  
    "updatedLeadsCount": 1,  
    "failedLeadsCount": 0  
}

### **Stop Lead in Campaign**

Stops a specific lead's progression in a campaign.

* **Method**: POST  
* **Endpoint**: /api/public/campaign/StopLeadInCampaign

**Body Parameters**:

* campaignId: ID of the campaign.  
* leadUrl: LinkedIn URL of the lead.  
* leadMemberId: (Optional) Internal Lead Member ID.

**Response**: No body content (200 OK).

### **Get Leads From Campaign**

Retrieves leads currently in a campaign (Lead Analytics).

* **Method**: POST  
* **Endpoint**: /api/public/campaign/GetLeadsFromCampaign

**Body Parameters**:

* campaignId: ID of the campaign.  
* offset, limit: Pagination.  
* timeFrom, timeTo: ISO 8601 Date/Time range.  
* timeFilter: Filter logic (CreationTime, LastActionTakenTime, FailedTime, Everywhere).

**Example Response**:

{  
  "totalCount": 152,  
  "items": \[  
    {  
      "id": 62658,  
      "linkedInUserProfileId": "AC9sANasasasX0Ia-q6DQxyS35UD7a8716G5c8",  
      "linkedInUserProfile": {  
        "linkedin\_id": "58344979",  
        "profileUrl": "\[https://www.linkedin.com/in/johndoe\](https://www.linkedin.com/in/johndoe)",  
        "firstName": "John",  
        "lastName": "Doe",  
        "headline": "Communications and Marketing Professional",  
        "imageUrl": "\[https://media.licdn.com/dms/image/\](https://media.licdn.com/dms/image/)...",  
        "location": "Princetown",  
        "companyName": "ACME",  
        "companyUrl": null,  
        "position": "",  
        "about": null,  
        "connections": 0,  
        "followers": 0,  
        "emailAddress": null  
      },  
      "lastActionTime": "2024-10-01T03:28:22.414791Z",  
      "failedTime": null,  
      "creationTime": "2024-09-30T21:28:06.933349Z",  
      "leadCampaignStatus": "Finished",  
      "leadConnectionStatus": "None",  
      "leadMessageStatus": "None",  
      "errorCode": null,  
      "leadCampaignStatusMessage": null,  
      "linkedInSenderId": 1108,  
      "linkedInSenderFullName": "Jane Doe"  
    }  
  \]  
}

### **Get Campaigns for Lead**

Find which campaigns a specific lead is involved in.

* **Method**: POST  
* **Endpoint**: /api/public/campaign/GetCampaignsForLead

**Body Parameters**:

* email, linkedinId, or profileUrl: At least one identifier is required.

**Example Response**:

{  
  "leadFullName": "John Doe",  
  "totalCount": 2,  
  "items": \[  
    {  
      "campaignId": 1082,  
      "campaignName": "Campaign For Veterans",  
      "campaignStatus": "PAUSED",  
      "leadStatus": "Finished"  
    },  
    {  
      "campaignId": 1451,  
      "campaignName": "Campaign 5",  
      "campaignStatus": "CANCELED",  
      "leadStatus": "Finished"  
    }  
  \]  
}

## **Inbox**

### **Get Conversations (V2)**

Get paginated LinkedIn conversations with filtering options.

* **Method**: POST  
* **Endpoint**: /api/public/inbox/GetConversationsV2

**Body Parameters**:

| Parameter | Type | Description |
| :---- | :---- | :---- |
| filters | object | Filter criteria (see below). |
| offset | integer | Pagination offset. |
| limit | integer | Max records (up to 100). |

**Filters Object**:

* linkedInAccountIds: Array of sender IDs.  
* campaignIds: Array of campaign IDs.  
* leadProfileUrl: Specific lead URL.  
* tags: Array of tags (e.g., \["Lead tag1"\]).  
* seen: Boolean (read/unread).

**Example Request**:

{  
  "filters": {  
    "linkedInAccountIds": \[\],  
    "campaignIds": \[\],  
    "leadProfileUrl": "\[https://www.linkedin.com/in/john\_doe/\](https://www.linkedin.com/in/john\_doe/)",  
    "tags": \["Lead tag1"\],  
    "seen": null  
  },  
  "offset": 0,  
  "limit": 10  
}

**Example Response**:

{  
  "totalCount": 0,  
  "items": \[  
    {  
      "id": "string",  
      "read": true,  
      "groupChat": true,  
      "blockedByMe": true,  
      "blockedByParticipant": true,  
      "lastMessageAt": "2025-03-28T12:00:19.007Z",  
      "lastMessageText": "string",  
      "lastMessageType": "TEXT",  
      "lastMessageSender": "ME",  
      "totalMessages": 0,  
      "campaignId": 0,  
      "linkedInAccountId": 0,  
      "correspondentProfile": {  
        "id": "string",  
        "linkedin\_id": "string",  
        "profileUrl": "string",  
        "firstName": "string",  
        "lastName": "string",  
        "headline": "string",  
        "imageUrl": "string",  
        "location": "string",  
        "companyName": "string",  
        "companyUrl": "string",  
        "position": "string",  
        "about": "string",  
        "connections": 0,  
        "followers": 0,  
        "tags": \[  
          "string"  
        \],  
        "emailAddress": "string",  
        "customFields": \[  
          {  
            "name": "string",  
            "value": "string"  
          }  
        \]  
      },  
      "linkedInAccount": {  
        "id": 0,  
        "emailAddress": "string",  
        "firstName": "string",  
        "lastName": "string",  
        "isActive": true,  
        "activeCampaigns": 0,  
        "authIsValid": true,  
        "isValidNavigator": true,  
        "isValidRecruiter": true  
      },  
      "messages": \[  
        {  
          "createdAt": "2025-03-28T12:00:19.007Z",  
          "body": "string",  
          "subject": "string",  
          "postLink": "string",  
          "isInMail": true,  
          "sender": "ME"  
        }  
      \]  
    }  
  \]  
}

## **Lists**

### **Add Leads to List (V2)**

Adds leads to a specific list.

* **Method**: POST  
* **Endpoint**: /api/public/list/AddLeadsToListV2

**Body Parameters**:

* listId: Integer ID of the list.  
* leads: Array of lead objects.

**Example Request**:

{  
  "leads": \[  
    {  
      "firstName": "John",  
      "lastName": "Doe",  
      "location": "USA",  
      "summary": "SDR @ HeyReach",  
      "companyName": "HeyReach",  
      "position": "SDR",  
      "emailAddress": "john\_doe@example.com",  
      "profileUrl": "\[https://www.linkedin.com/in/john-doe\](https://www.linkedin.com/in/john-doe)",  
      "customUserFields": \[  
         { "name": "favorite\_color", "value": "blue" }  
      \]  
    }  
  \],  
  "listId": 123  
}

## **Stats**

### **Get Overall Stats**

Gets aggregated statistics for accounts or campaigns.

* **Method**: POST  
* **Endpoint**: /api/public/stats/GetOverallStats

**Body Parameters**:

* accountIds: Array of sender IDs (empty \= all).  
* campaignIds: Array of campaign IDs (empty \= all).  
* startDate: ISO 8601 Date.  
* endDate: ISO 8601 Date.

## **Leads**

### **Add Tags to Lead**

Adds tags to a specific lead.

* **Method**: POST  
* **Endpoint**: /api/public/lead/AddTags

**Body Parameters**:

* leadProfileUrl: LinkedIn URL.  
* leadLinkedInId: Internal ID (optional).  
* tags: Array of strings.  
* createTagIfNotExisting: Boolean.

**Example Response**:

{  
    "newAssignedTags": \[ "tag2" \]  
}

## **Missing Sections**

*The following sections exist in the documentation but could not be retrieved from the source file. Please provide content for detailed schemas.*

* **PublicLinkedInAccount**  
* **PublicWebhooks**  
* **PublicMyNetwork**