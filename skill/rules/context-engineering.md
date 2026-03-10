# Context Engineering for Product Managers

## What It Means

Context engineering is the practice of writing product specifications that are self-sufficient for AI-assisted implementation. When an AI coding agent (Claude Code, Cursor, Copilot) reads your spec, it should be able to implement without asking a single clarifying question.

This is the most important PM skill in the AI era. The quality of your context directly determines the quality of AI-generated code.

## The Context Block Pattern

Every implementable unit (PRD section, user story, ticket) should contain a context block:

```markdown
## Context Block

### Problem
[What undesired state exists. Who experiences it. How frequently.]

### Transformation
[What preferred state looks like. How the user's life changes.]

### Constraints
[Technical limitations, regulatory requirements, performance targets.]
[What this CANNOT do is as important as what it CAN do.]

### Data Model
[Key entities, relationships, and fields. Even rough shapes help.]

### API Shape
[Expected inputs, outputs, error cases. Even pseudocode helps.]

### Edge Cases
[What happens when: empty state, error state, boundary values,
concurrent access, partial completion, timeout.]

### Acceptance Criteria
Given [precondition]
When [action]
Then [observable result]

### Technical Hints
[Suggested libraries, existing patterns to follow, integration points.
These are hints, not mandates — the implementer may choose differently.]
```

## Why This Matters

### Without context engineering:
```
Story: "As a user, I want to see my dashboard"
→ Engineer asks: What data? What layout? What permissions?
→ AI generates: Generic dashboard with wrong data
→ Result: 3 rounds of revision, 2 weeks lost
```

### With context engineering:
```
Story: "As a premium user viewing my analytics dashboard..."
[Full context block with data model, API shape, edge cases]
→ Engineer implements directly from spec
→ AI generates: Correct dashboard on first pass
→ Result: Shipped in hours, not weeks
```

## Context Sufficiency Test

Ask yourself: "If I gave this spec to an AI coding agent with zero prior context about our product, could it implement a correct solution?"

If no, you're missing context. Add it.

## Applying to Each PM Artifact

### PRDs
- Include system context diagram description (what systems interact)
- Include data flow (where data comes from, where it goes)
- Include success metrics with specific thresholds (not "improve engagement")

### User Stories
- Include Given/When/Then for every acceptance criterion
- Include the "unhappy path" — what happens when things go wrong
- Include example data (concrete values, not "user data")

### Sprint Tickets
- Include file paths where changes should happen (if known)
- Include existing patterns to follow ("see how auth works in /src/auth/")
- Include the Definition of Done checklist

## The Compression Multiplier

Better context → faster AI implementation → compressed cycle times → more iterations → better product.

Context engineering is not overhead. It's the highest-leverage activity a PM can do in the AI era. Every hour spent on context saves 10 hours of implementation back-and-forth.
