# Discovery Brief Template

Used by `/pm:discover` to create `.product/DISCOVERY/{slug}-BRIEF.md`.

```markdown
---
initiative: "{slug}"
stage: discovering
discovered: "{ISO date}"
power_score: {calculated}
jobs_addressed: []
assumptions_count: {N}
---

# Discovery Brief: {Problem Title}

## Problem Statement
**From**: {undesired state — concrete and specific}
**To**: {preferred state — concrete and measurable}
**Who**: {target user from ICP}
**Frequency**: {how often this occurs}

## Product Power Score
- **ΔState**: {1-10} — {justification}
- **Emotional Intensity**: {1-10} — {justification}
- **Problem Frequency**: {1-10} — {justification}
- **Score**: {product} — **{tier}**

## Jobs-to-be-Done
| Type | Job Statement |
|------|---------------|
| Functional | {what they need to accomplish} |
| Emotional | {how they want to feel} |
| Social | {how they want to be perceived} |

## Current Alternatives
| Alternative | Strengths | Weaknesses |
|-------------|-----------|------------|
| {competitor/workaround 1} | {what it does well} | {where it fails} |
| {competitor/workaround 2} | {what it does well} | {where it fails} |
| {doing nothing} | {no cost/effort} | {ongoing pain} |

## Assumptions to Validate
| # | Assumption | Risk Level | Validation Method |
|---|-----------|------------|-------------------|
| A1 | {assumption} | High/Med/Low | {how to test} |
| A2 | {assumption} | High/Med/Low | {how to test} |
| A3 | {assumption} | High/Med/Low | {how to test} |

## Transformation Map
{Detailed from-state → to-state with intermediate steps}

## Blind Spots
{What's missing from this analysis — gaps, uncertainties, things we don't know}

## Recommended Next Steps
- [ ] Validate assumption A1 via `/pm:validate`
- [ ] Score against backlog via `/pm:strategy`
- [ ] Define solution via `/pm:define`
```
