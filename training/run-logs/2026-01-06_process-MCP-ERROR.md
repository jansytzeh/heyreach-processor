# Process Run: 2026-01-06 MCP ERROR

**Mode:** Pre-flight check failed
**Status:** ABORTED

## Error Details

| Field | Value |
|-------|-------|
| Error Type | MCP_ERROR |
| Error Code | ERR-MCP-001 |
| Tool | `mcp__heyreach__get_conversations_v2` |
| Message | "No such tool available" |
| Retry Attempts | 2 |
| Time | 2026-01-06 |

## Action Required

The HeyReach MCP tools are not available. This typically means:

1. The MCP server connection was lost
2. The Claude session needs to be restarted
3. The HeyReach MCP configuration needs to be checked

**User should:**
- Restart the Claude Code session
- Verify MCP server is configured in `.claude/settings.json`
- Run `/troubleshoot` if issue persists

## Summary

- Conversations fetched: 0
- Messages sent: 0
- Status: FAILED (MCP unavailable)
