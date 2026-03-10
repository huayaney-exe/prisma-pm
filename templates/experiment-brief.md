# Experiment Brief Template

Used by `/pm:validate` to create `.product/DISCOVERY/{slug}-VALIDATION.md`.

```markdown
---
initiative: "{slug}"
hypothesis_count: {N}
status: designed
created: "{ISO date}"
---

# Validation Plan: {Initiative Name}

## Hypothesis 1

**We believe** {target users}
**will** {expected behavior}
**because** {rationale}
**We'll know this is true when** {measurable outcome}
**within** {timeframe}

### Experiment Design
- **Type**: {fake door | landing page | survey | concierge | wizard of oz | prototype | A/B test | pilot}
- **Description**: {what we'll actually do}
- **Duration**: {timeframe}
- **Sample Size**: {N} (for {confidence level} confidence)
- **Cost**: {time + money estimate}

### Success Criteria
| Metric | Minimum (fail below) | Target | Stretch |
|--------|---------------------|--------|---------|
| {metric 1} | {threshold} | {expected} | {exceeding} |
| {metric 2} | {threshold} | {expected} | {exceeding} |

### Kill Criteria
**Stop if**: {specific measurable condition}
**Because**: {what this tells us about our assumption}
**Then**: {alternative direction}

### Bias Risks
| Bias | Risk | Mitigation |
|------|------|------------|
| {bias type} | {how it could mislead} | {prevention strategy} |

### Synthetic Persona Predictions
| Persona | Predicted Response | Confidence | Reasoning |
|---------|-------------------|------------|-----------|
| {name} | Positive/Negative/Mixed | H/M/L | {why} |

## Implementation Steps
1. {Preparation — what to build/create}
2. {Recruitment — how to find participants}
3. {Execution — how to run the experiment}
4. {Collection — how to gather data}
5. {Analysis — how to interpret results}

## Decision Framework
- **Metric > Target** → Proceed to `/pm:define`
- **Minimum < Metric < Target** → Iterate experiment design
- **Metric < Minimum** → Kill criteria met — pivot or abandon
```
