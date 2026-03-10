# Product Power Formula

The north-star framework for evaluating product opportunities.

## Formula

```
Product Power = ΔState × Emotional Intensity × Problem Frequency
```

**Range:** 1 to 1,000

## Dimensions

### ΔState (1-10)
How large is the gap between the undesired and preferred state?

| Score | Label | Description | Example |
|-------|-------|-------------|---------|
| 1-3 | Minor inconvenience | Slightly annoying, easy to ignore | Cosmetic UI issue |
| 4-6 | Significant friction | Wastes time, causes stress | Manual data entry |
| 7-9 | Critical pain | Blocks major goals, causes real suffering | Can't close deals |
| 10 | Existential | Threatens livelihood, safety, identity | Compliance violation |

### Emotional Intensity (1-10)
How deeply does the user FEEL this pain?

| Score | Label | Description | Example |
|-------|-------|-------------|---------|
| 1-3 | Rational awareness | Knows it's a problem, no urgency | "We should fix this someday" |
| 4-6 | Emotional engagement | Frustrated, motivated to solve | "This wastes my whole afternoon" |
| 7-9 | Visceral need | Desperate, will pay premium | "I'll try anything that works" |
| 10 | Identity-level | Problem defines daily experience | "This is ruining my career" |

### Problem Frequency (1-10)
How often does the user encounter this problem?

| Score | Label | Description | Example |
|-------|-------|-------------|---------|
| 1-3 | Rarely | Yearly, quarterly | Annual tax filing |
| 4-6 | Regularly | Monthly, weekly | Monthly reporting |
| 7-9 | Frequently | Daily, multiple times per day | Email management |
| 10 | Constantly | Always present, ambient pain | Noisy open office |

## Interpretation Tiers

| Tier | Score Range | Interpretation | Action |
|------|-----------|----------------|--------|
| Low | <100 | Nice-to-have. Hard to monetize. | Reconsider framing or find sharper pain |
| Medium | 100-400 | Viable product. Needs strong execution. | Validate demand before investing |
| High | 400-700 | Strong opportunity. Clear willingness to pay. | Prioritize and build |
| Exceptional | 700+ | Category-defining. Build immediately. | All resources on this |

## Classic Examples

| Product | ΔState | Intensity | Frequency | Score | Tier |
|---------|--------|-----------|-----------|-------|------|
| Uber (ride-hailing) | 8 | 8 | 9 | 576 | High |
| Slack (team chat) | 6 | 7 | 10 | 420 | High |
| Notion (workspace) | 7 | 6 | 9 | 378 | Medium |
| A nicer calendar UI | 3 | 2 | 8 | 48 | Low |

## Usage in Prisma PM

- `/pm:power` — Standalone scoring calculator
- `/pm:discover` — Scores opportunities during discovery
- `/pm:strategy` — Used as 40% weight in composite ranking
- PRD frontmatter — Every PRD includes power_score

## Common Mistakes

1. **Inflating ΔState**: "Our product is a 10" — if you're not saving lives, it's probably not a 10
2. **Confusing intensity with frequency**: A rare but painful problem (tooth extraction) differs from a frequent but mild one (slow loading page)
3. **Forgetting the user's perspective**: Score from the USER's view, not yours. You may care deeply; they may not
4. **Static scoring**: Re-score as you learn more. Discovery should change your estimates
