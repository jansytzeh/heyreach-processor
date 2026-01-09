# Pattern Extraction Framework

> Version: 1.0
> Last Updated: 2026-01-03

Systematic method for extracting learnable patterns from Jan's manual responses and successful conversations.

---

## Extraction Process

### Step 1: Collect Sample

1. Fetch conversations tagged `Manual Handled Jan`:
   ```
   mcp__heyreach__get_conversations_v2
     seen: true
     limit: 25
   ```

2. Filter by tag in `correspondentProfile.tags`

3. Get full conversation with `mcp__heyreach__get_chatroom`

### Step 2: Analyze Each Message

For each of Jan's messages, extract:

| Element | Question to Answer |
|---------|-------------------|
| **Trigger** | What prompted this response? |
| **Tone** | Formal? Casual? Enthusiastic? |
| **Structure** | How is the message organized? |
| **Opening** | How does it start? |
| **Closing** | How does it end? |
| **CTA** | What action is requested? |
| **Personalization** | What's customized for this prospect? |
| **Context Reference** | Does it reference their specific situation? |
| **Length** | Short (<50 words)? Medium? Long (>150 words)? |
| **Special Techniques** | Anything unique or clever? |

### Step 3: Categorize Pattern

| Category | Description |
|----------|-------------|
| **Opening Pattern** | New way to start a message |
| **Closing Pattern** | New way to end a message |
| **CTA Pattern** | New call-to-action style |
| **Objection Handling** | How to address concerns |
| **Relationship Building** | Warmth/rapport techniques |
| **Value Proposition** | How to explain benefits |
| **Urgency Creation** | How to encourage action |
| **Personalization** | Ways to customize messages |

### Step 4: Document Pattern

Use this template:

```markdown
## Pattern: [Name]

**Category:** [Opening/Closing/CTA/etc.]
**Source:** [Conversation ID or Jan session date]

### Trigger Context
[When to use this pattern]

### Example
```
[Exact message or paraphrased example]
```

### Key Elements
1. [Element 1]
2. [Element 2]

### Variations
- [Variation 1]
- [Variation 2]

### DO
- [Best practice]

### DON'T
- [Anti-pattern]
```

---

## Extracted Patterns Library

### Opening Patterns

#### OP-001: Warm Acknowledgment
**Category:** Opening
**Source:** Initial config

**Trigger Context:** Responding to thank-you messages

**Example:**
```
¡Con gusto María! Me alegra que te hayan servido los perfiles.
```

**Key Elements:**
1. Exclamation for warmth
2. Name included naturally
3. Acknowledges what they thanked us for

**Variations:**
- "¡Perfecto [Name]!"
- "¡Me alegra que te sirva, [Name]!"
- "Happy to help, [Name]!"

---

#### OP-002: [To be extracted from Jan's responses]

---

### Closing Patterns

#### CL-001: Question CTA
**Category:** Closing
**Source:** Initial config

**Trigger Context:** When we want them to pick a candidate

**Example:**
```
¿Con cuál candidato te gustaría que te conecte?
```

**Key Elements:**
1. Question format (invites response)
2. Specific action (connect with candidate)
3. Implies we can help further

**Variations:**
- "¿Cuál te llamó más la atención?"
- "Any of them catch your eye?"
- "Which one would you like to meet?"

---

#### CL-002: [To be extracted from Jan's responses]

---

### Objection Handling Patterns

#### OH-001: [To be extracted]

---

### Personalization Patterns

#### PP-001: [To be extracted]

---

## Extraction Sessions Log

| Date | Conversations Reviewed | Patterns Extracted | Added to Config |
|------|------------------------|-------------------|-----------------|
| | | | |

---

## Pattern Quality Criteria

Before adding a pattern, verify:

| Criteria | Check |
|----------|-------|
| **Repeatable** | Can this be used in multiple situations? |
| **Effective** | Did it lead to positive outcomes? |
| **Natural** | Does it sound human, not robotic? |
| **Aligned** | Does it fit our brand/tone? |
| **Measurable** | Can we track if it works? |

---

## Integration Workflow

When a valuable pattern is identified:

1. Document in this file under appropriate category
2. Add to `config.md` Response Guidelines
3. Update `knowledge-base.md` if it changes detection logic
4. Log in `improvement-log.md`
5. Test in dry-run mode before live use
