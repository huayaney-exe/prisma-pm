<purpose>
Write context-engineered PRDs that are self-sufficient for AI-assisted implementation. Every spec must pass the Context Sufficiency Test: "If I gave this to an AI coding agent with zero prior context, could it implement a correct solution?" Spawns delivery-architect agent for technical decomposition. Supports lean, full, and one-pager formats.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init define "{slug}" --include state,product,icp)
```

Parse JSON. Determine format from $ARGUMENTS:
- `--format lean` (default)
- `--format full`
- `--format one-pager`

Read discovery brief if `--from` flag provided or if `.product/DISCOVERY/{slug}-BRIEF.md` exists.
Read validation results if `.product/DISCOVERY/{slug}-VALIDATION.md` exists.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DEFINING FEATURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Context Gathering

**If discovery brief exists:**

"Based on your discovery brief, the transformation is: {from} → {to}, with Power Score {score} ({tier}). Any changes before we define the solution?"

Wait for confirmation or adjustments.

**If NO discovery brief exists:**

Ask essential questions ONE AT A TIME:

<step name="problem">
**Q1**: "What problem does this feature solve? Describe the from-state and to-state."
</step>

<step name="audience">
**Q2**: "Who is this for? Which ICP segment?"
</step>

<step name="constraints">
**Q3**: "What are the constraints — technical, regulatory, timeline, budget?"
</step>

<step name="success">
**Q4**: "What does success look like? How will you measure the transformation?"
</step>

## 4. Solution Definition

Guide the user through solution design:

<step name="happy-path">
**Q5**: "Describe the user experience. Walk me through the happy path step by step."
</step>

<step name="edge-cases">
**Q6**: "What happens when things go wrong? Error states, edge cases, empty states."
</step>

<step name="data-model">
**Q7**: "What data entities are involved? What are their relationships?"
</step>

<step name="integrations">
**Q8**: "Are there integration points — APIs, third-party services, existing systems?"
</step>

## 5. Delivery Architect Analysis

Spawn delivery-architect agent for technical decomposition:

```
◆ Spawning delivery-architect agent...
```

```
Agent(
  subagent_type="general-purpose",
  prompt="First, read ~/.claude/skills/prisma-pm/agents/delivery-architect.md for your role and instructions.

<feature_context>
Feature: {feature name}
Transformation: {from} → {to}
Happy Path: {steps from Q5}
Edge Cases: {from Q6}
Data Entities: {from Q7}
Integrations: {from Q8}
</feature_context>

<product_context>
{PRODUCT.md summary}
</product_context>

<task>
Perform technical decomposition:
1. Define data model with entity relationships and field types
2. Specify API shape (endpoints, request/response schemas, error codes)
3. Enumerate edge cases not covered by the user
4. Identify technical constraints and performance targets
5. Suggest implementation patterns and technical hints
6. Flag any architectural decisions that need PM input

Return structured analysis in markdown.
</task>",
  description="Technical decomposition"
)
```

```
✓ Delivery architect complete: Technical decomposition ready
```

## 6. Write PRD

### Lean Format (default)

Write `.product/DEFINITIONS/{slug}-PRD.md` combining user answers + agent analysis:

```markdown
---
initiative: "{slug}"
stage: defining
power_score: {from discovery or calculated}
jobs_addressed: [{JTBD IDs}]
format: {lean|full|one-pager}
transformation:
  from: "{undesired state}"
  to: "{preferred state}"
  delta: {1-10}
  intensity: {1-10}
  frequency: {1-10}
context_sufficient: {true|false}
created: "{ISO date}"
---

# PRD: {Feature Name}

## Transformation
**From**: {undesired state — specific, concrete}
**To**: {preferred state — specific, measurable}
**Who**: {ICP segment}
**Why Now**: {urgency driver}

## Solution Overview
{2-3 paragraph description of the solution approach}

## User Experience

### Happy Path
1. {Step 1 — user action → system response}
2. {Step 2}
3. {Step N}

### Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Empty state | {behavior} |
| Error state | {behavior} |
| Boundary values | {behavior} |
| Concurrent access | {behavior} |
| Partial completion | {behavior} |

## Context Block

### Data Model
{From delivery architect — entities, relationships, field types}

### API Shape
{From delivery architect — endpoints, request/response, errors}

### Technical Constraints
{From delivery architect — performance, compatibility, infrastructure}

### Technical Hints
{From delivery architect — libraries, patterns, integration points}

## Acceptance Criteria

### AC-1: {Criterion Name}
**Given** {precondition}
**When** {action}
**Then** {observable result}

### AC-2: {Criterion Name}
**Given** {precondition}
**When** {action}
**Then** {observable result}

## Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|--------------------|
| {metric} | {threshold} | {how} |

## Out of Scope
{Explicit exclusions}

## Open Questions
{Unresolved decisions}
```

### Full Format

Uses lean format plus adds:
- System context diagram description
- Data flow description
- Security considerations
- Performance requirements with SLAs
- Migration plan (if modifying existing features)
- Rollback strategy
- Phased delivery plan

### One-Pager Format

Use template from `templates/one-pager.md` — abbreviated for stakeholder communication.

## 7. Context Sufficiency Validation

**Iteration loop (max 3):**

Review the PRD against the Context Sufficiency Test:

```
──── Context Sufficiency Check 1/3 ────

"Could an AI coding agent implement this without asking a single clarifying question?"

- [ ] Data model defined with field types
- [ ] API endpoints specified with request/response shapes
- [ ] Error cases enumerated
- [ ] Acceptance criteria are concrete (no "should be intuitive")
- [ ] Technical hints provided
- [ ] Edge cases covered
```

**If any check fails:**
- Fill the gap by asking the user targeted questions
- Update the PRD
- Re-check (up to 3 iterations)

**If all pass after iteration:**
Set `context_sufficient: true` in frontmatter.

**If still failing after 3 iterations:**
Set `context_sufficient: false` and note gaps in Open Questions.

## 8. Checkpoint: Review

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Required                                 ║
╚══════════════════════════════════════════════════════════════╝

PRD: {Feature Name} ({format} format)
Context Sufficient: {yes/no}
Acceptance Criteria: {count}
Edge Cases: {count}

──────────────────────────────────────────────────────────────
→ Type "approved" or describe changes
──────────────────────────────────────────────────────────────
```

If changes: update PRD. Loop until approved (max 3 iterations).

## 9. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state advance-initiative "{slug}" --to defining
```

## 10. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DEFINITION COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Feature Name}** — {format} PRD
Context Sufficient: {yes/no}
Acceptance Criteria: {count}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Write Requirements** — break this PRD into implementable user stories

`/pm:require --from {slug}`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:strategy` — rank this initiative against others
- `/pm:help` — see all commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/DEFINITIONS/{slug}-PRD.md` — Context-engineered PRD

</output>

<success_criteria>

- [ ] Discovery brief loaded if available
- [ ] Context gathered (from brief or through questioning)
- [ ] Solution defined with happy path and edge cases
- [ ] Delivery-architect agent spawned and returned technical decomposition
- [ ] PRD written in requested format with all sections
- [ ] Context Sufficiency validation loop completed (max 3 iterations)
- [ ] Acceptance criteria in Given/When/Then format
- [ ] Checkpoint: user reviewed and approved
- [ ] Initiative stage advanced to "defining"
- [ ] Next-up block displayed with `/pm:require` suggestion

</success_criteria>
