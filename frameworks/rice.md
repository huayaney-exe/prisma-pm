# RICE Scoring Framework

Objective prioritization for product initiatives. Eliminates the "P1 Everything" anti-pattern.

## Formula

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

## Dimensions

### Reach
How many users will this impact in a defined time period?

| Scale | Description | Example |
|-------|-------------|---------|
| Actual number | Users per quarter | 500 users/quarter |

Use real data when available. Estimate conservatively when not.

### Impact
How much will this improve the experience for those reached?

| Score | Label | Description |
|-------|-------|-------------|
| 3 | Massive | Transforms the experience completely |
| 2 | High | Significant improvement |
| 1 | Medium | Noticeable improvement |
| 0.5 | Low | Minor improvement |
| 0.25 | Minimal | Barely noticeable |

### Confidence
How confident are you in your estimates?

| Score | Label | Based On |
|-------|-------|----------|
| 100% | High | User research, data, validated hypothesis |
| 80% | Medium | Some data, strong intuition, analogous evidence |
| 50% | Low | Gut feeling, limited data |
| 20% | Moonshot | Pure speculation, no supporting data |

### Effort
How much work is this?

| Scale | Unit | Description |
|-------|------|-------------|
| Actual estimate | Person-months | Total engineering + design + PM effort |

Estimate in person-months. Include all disciplines, not just engineering.

## Example Scoring

| Initiative | Reach | Impact | Confidence | Effort | RICE |
|-----------|-------|--------|------------|--------|------|
| Onboarding redesign | 1000 | 2 | 80% | 3 | 533 |
| Dark mode | 500 | 0.5 | 100% | 1 | 250 |
| API v2 | 200 | 3 | 50% | 6 | 50 |
| Logo refresh | 5000 | 0.25 | 100% | 0.5 | 2500 |

## Integration with Product Power

In Prisma PM, RICE alone doesn't drive priority. The composite ranking is:

```
Composite = (RICE_normalized × 0.4) + (ProductPower_normalized × 0.4) + (StrategicAlignment × 0.2)
```

RICE measures execution efficiency (reach per effort).
Product Power measures opportunity magnitude (how big is this pain).
Together they answer: "Is this a big opportunity AND can we execute it efficiently?"

## Common Mistakes

1. **Inflating Reach**: "All our users will benefit" — probably not. Be specific about who.
2. **Ignoring Confidence**: A high-RICE initiative with 20% confidence is a gamble, not a priority.
3. **Underestimating Effort**: Include PM, design, QA, documentation, and support — not just dev time.
4. **Using RICE alone**: RICE favors quick wins. Pair with Product Power to ensure you're solving real problems, not just shipping easy features.
5. **Allowing ties**: Force unique rankings. If two initiatives score equally, break the tie with Product Power.

## Application in Prisma PM

- `/pm:strategy` — RICE scoring for all backlog initiatives
- Composite ranking in `BACKLOG.md`
- Force-ranked with no ties allowed
