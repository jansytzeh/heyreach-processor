# API Response Logs

This folder stores large HeyReach API responses that exceed the token limit for in-context processing.

## Purpose

1. **Debugging** - Review raw API responses when issues occur
2. **Training Data** - Historical conversation data for analysis
3. **Audit Trail** - Record of what was fetched during training sessions

## File Naming Convention

```
YYYY-MM-DD_HH-MM_<operation>_<details>.json
```

Examples:
- `2026-01-03_14-30_conversations_seen-true_limit-25.json`
- `2026-01-03_15-00_chatroom_conv-abc123.json`

## File Format

Files are saved in wrapped format by the system:
```json
[{"type": "text", "text": "{\"totalCount\":...,\"items\":[...]}"}]
```

### Parsing in Python

```python
import json

with open('filename.json', 'r') as f:
    wrapper = json.load(f)
    data = json.loads(wrapper[0]['text'])  # Unwrap the nested JSON

    # For conversations
    conversations = data.get('items', [])
    for conv in conversations:
        tags = conv.get('correspondentProfile', {}).get('tags', [])
```

## Retention

Old logs can be deleted after 30 days unless needed for specific debugging.
