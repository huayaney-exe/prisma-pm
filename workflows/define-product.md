<purpose>
Write context-engineered PRDs that are self-sufficient for AI-assisted implementation. Every spec must pass the Context Sufficiency Test: "If I gave this to an AI coding agent with zero prior context, could it implement a correct solution?" Spawns delivery-architect agent for technical decomposition. Supports lean, full, and one-pager formats.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Other" and their response signals freeform intent, you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response
</freeform_rule>

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

Use AskUserQuestion:
- header: "Discovery"
- question: "Based on your brief, the transformation is: {from} → {to}, with Power Score {score} ({tier}). Want to adjust anything before we define the solution?"
- options:
  - "Looks good" — Proceed with the brief as-is
  - "Adjust" — I want to tweak the transformation or scope
  - "Start fresh" — Ignore the brief, let me re-explain

Follow threads naturally with AskUserQuestion based on which option they pick. If they pick "Adjust", ask targeted follow-ups about what to change.

**If NO discovery brief exists:**

Open with a freeform prompt as plain text (NOT AskUserQuestion):

"Tell me about the feature you want to define. What problem does it solve, who is it for, and what does the end state look like? Share as much or as little as you want — I'll ask follow-ups."

Wait for the user to respond at the normal prompt.

After their response, follow threads using AskUserQuestion with contextual options derived from what they said. Keep a background checklist and weave items in naturally as the conversation flows:

- [ ] Problem / transformation (from-state → to-state)
- [ ] Audience / ICP segment
- [ ] Constraints (technical, regulatory, timeline, budget)
- [ ] Success criteria / metrics
- [ ] Happy path (step-by-step UX)
- [ ] Edge cases and error states
- [ ] Data model / entities
- [ ] Integration points

Do NOT march through these sequentially. Pick the most natural next thread based on what the user just said. Use AskUserQuestion with 2-4 concrete options (header max 12 chars, each option has label + description). Always include an "Other" option when the user might want to go off-script.

Example after user describes the problem:

Use AskUserQuestion:
- header: "Next"
- question: "Got it — {paraphrase their problem}. What should we dig into next?"
- options:
  - "Users" — Who exactly hits this problem?
  - "Solution" — Walk me through the ideal experience
  - "Constraints" — Technical or business limitations
  - "Other" — I want to explain something else

If the user selects "Other", follow the freeform_rule above.

Continue until the background checklist is substantially covered (at minimum: problem, audience, happy path, and edge cases).

## 4. Solution Definition

If the user has not yet described the happy path and edge cases during context gathering, guide them through solution design using AskUserQuestion:

Use AskUserQuestion:
- header: "UX"
- question: "Walk me through the happy path — what does the user do step by step, and what does the system respond with?"
- options:
  - "Step by step" — I'll describe each interaction
  - "High level" — Let me give a summary first
  - "Diagram" — I'll describe a flow

After the happy path, probe edge cases:

Use AskUserQuestion:
- header: "Edge Cases"
- question: "What happens when things go wrong? Think about error states, empty states, boundary values."
- options:
  - "I have ideas" — Let me list the ones I know
  - "Help me think" — Suggest common edge cases for this type of feature
  - "Skip for now" — Let the delivery architect handle it

Continue with data model and integrations if not yet covered:

Use AskUserQuestion:
- header: "Data"
- question: "What data entities are involved and how do they relate?"
- options:
  - "Describe" — I'll walk through the model
  - "Infer" — Figure it out from what I've told you
  - "Other" — I want to explain something else

Use AskUserQuestion:
- header: "Integrations"
- question: "Any integration points — APIs, third-party services, existing systems?"
- options:
  - "Yes" — Let me describe them
  - "None" — This is self-contained
  - "Unsure" — Flag it as an open question

## 5. Delivery Architect Analysis

**Decision gate before spawning:**

Use AskUserQuestion:
- header: "Ready?"
- question: "I have enough context for technical decomposition. Proceed?"
- options:
  - "Analyze it" — Spawn delivery-architect agent
  - "Keep exploring" — I want to add more context

If "Keep exploring": return to context gathering / solution definition, ask what they want to add, then re-present this gate.

If "Analyze it": spawn the delivery-architect agent.

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
Happy Path: {steps from conversation}
Edge Cases: {from conversation}
Data Entities: {from conversation}
Integrations: {from conversation}
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

Use AskUserQuestion:
- header: "Review"
- question: "PRD: {Feature Name} ({format}). Context Sufficient: {yes/no}. Approve?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

If "Needs changes": update PRD based on feedback. Loop until approved (max 3 iterations).

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

**Design the Experience** — specify messaging, flows, and design system foundations

`/pm:design --from {slug}`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:require` — skip design, go straight to user stories
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
- [ ] Context gathered (from brief or through thinking-partner conversation)
- [ ] Solution defined with happy path and edge cases
- [ ] Decision gate passed before spawning delivery-architect
- [ ] Delivery-architect agent spawned and returned technical decomposition
- [ ] PRD written in requested format with all sections
- [ ] Context Sufficiency validation loop completed (max 3 iterations)
- [ ] Acceptance criteria in Given/When/Then format
- [ ] Checkpoint: user reviewed and approved via AskUserQuestion
- [ ] Initiative stage advanced to "defining"
- [ ] Next-up block displayed with `/pm:require` suggestion

</success_criteria>
