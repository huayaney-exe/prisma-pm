# Lean PRD Template

Used by `/pm:define --format lean` to create `.product/DEFINITIONS/{slug}-PRD.md`.

```markdown
---
initiative: "{slug}"
stage: defining
power_score: {score}
jobs_addressed: []
format: lean
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
2. {Step 2 — user action → system response}
3. {Step N — user action → system response}

### Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Empty state | {what user sees with no data} |
| Error state | {what happens on failure} |
| Boundary values | {min/max/overflow handling} |
| Concurrent access | {multi-user behavior} |
| Partial completion | {interrupted workflow handling} |

## Context Block

### Data Model
{Key entities, relationships, field types, constraints}

### API Shape
{Endpoints, request/response schemas, error codes}

### Technical Constraints
{Performance targets, compatibility, infrastructure limits}

### Technical Hints
{Suggested libraries, existing patterns, integration points}

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
| {outcome metric} | {threshold} | {how to measure} |

## Out of Scope
{Explicit list of what this does NOT include}

## Open Questions
{Unresolved decisions needing input}
```
