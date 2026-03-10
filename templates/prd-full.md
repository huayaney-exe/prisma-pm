# Full PRD Template

Used by `/pm:define --format full` for major initiatives.

```markdown
---
initiative: "{slug}"
stage: defining
power_score: {score}
jobs_addressed: []
format: full
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

## 1. Transformation
**From**: {undesired state — specific, concrete}
**To**: {preferred state — specific, measurable}
**Who**: {ICP segment}
**Why Now**: {urgency driver}

## 2. Background & Context
{Why this initiative exists. What evidence led to it.
Reference discovery briefs and validation results.}

## 3. System Context
{What systems interact with this feature.
Describe data flow: where data comes from, where it goes.
Include external services, APIs, and existing system integrations.}

## 4. Solution Overview
{Comprehensive description of the solution approach.
Include key design decisions and their rationale.}

## 5. User Experience

### 5.1 Happy Path
1. {Step 1 — user action → system response}
2. {Step 2 — user action → system response}
3. {Step N}

### 5.2 Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| Empty state | {behavior} |
| Error state | {behavior} |
| Boundary values | {behavior} |
| Concurrent access | {behavior} |
| Partial completion | {behavior} |
| Timeout | {behavior} |
| Offline/degraded | {behavior} |

### 5.3 Permissions & Access Control
{Who can do what. Role-based access if applicable.}

## 6. Context Block

### 6.1 Data Model
{Complete entity-relationship description with field types}

| Entity | Field | Type | Constraints | Notes |
|--------|-------|------|-------------|-------|
| {entity} | {field} | {type} | {constraints} | {rules} |

### 6.2 API Specification
{Full endpoint specifications}

#### {METHOD} {/endpoint}
**Request:** {schema with example}
**Response (200):** {schema with example}
**Errors:** {error codes and conditions}

### 6.3 Technical Constraints
{Performance targets, SLAs, compatibility requirements}

### 6.4 Technical Hints
{Libraries, patterns, integration guides}

## 7. Security Considerations
{Authentication, authorization, data handling, compliance}

## 8. Performance Requirements
| Metric | Target | Measurement |
|--------|--------|-------------|
| {metric} | {target} | {method} |

## 9. Acceptance Criteria

### AC-1: {Criterion Name}
**Given** {precondition}
**When** {action}
**Then** {observable result}

{Continue for all criteria}

## 10. Success Metrics
| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|--------------------|
| {outcome} | {current} | {goal} | {how} |

## 11. Phased Delivery Plan
| Phase | Scope | Timeline | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 (MVP) | {core functionality} | {timeframe} | None |
| Phase 2 | {enhancements} | {timeframe} | Phase 1 |
| Phase 3 | {full feature} | {timeframe} | Phase 2 |

## 12. Migration Plan
{If modifying existing features: migration strategy, backwards compatibility}

## 13. Rollback Strategy
{How to safely revert if things go wrong}

## 14. Out of Scope
{Explicit list of exclusions}

## 15. Open Questions
{Unresolved decisions}

## 16. Appendix
{Supporting research, competitive analysis, mockups}
```
