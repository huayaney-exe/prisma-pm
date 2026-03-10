# ICP Profile Template

Used by `/pm:icp` to create `.product/ICP.md`.

```markdown
---
product: "{Product Name}"
last_updated: "{ISO date}"
---

# Ideal Customer Profile

## Demographics
- **Role/Title**: {specific roles that match}
- **Organization Size**: {employee count or revenue range}
- **Industry**: {specific industries or verticals}
- **Geography**: {markets served}

## Circumstance Trigger
{The specific moment or situation that makes them actively seek a solution.
Not "they need our product" — what event pushes them to act?}

## Behavioral Signals
{Observable behaviors that identify this person:}
- **Searches for**: {keywords, topics}
- **Communities**: {where they gather — forums, Slack, LinkedIn groups}
- **Current tools**: {what they use today}
- **Content consumed**: {blogs, podcasts, newsletters}

## Psychographic Profile
- **Decision Style**: {analytical / intuitive / consensus / authority-driven}
- **Risk Tolerance**: {early adopter / pragmatist / conservative}
- **Values**: {what they care about beyond the functional problem}
- **Communication preference**: {how they prefer to learn about solutions}

## Pain Intensity Map
| Dimension | Rating (1-10) | Evidence |
|-----------|---------------|----------|
| Severity of problem | {score} | {what makes it this severe} |
| Frequency of encounter | {score} | {how often they hit this} |
| Urgency to solve | {score} | {what drives urgency} |
| Willingness to pay | {score} | {what are they paying now} |

## Disqualification Criteria
{Who is explicitly NOT your customer, even if they seem to fit:}
- ❌ {criterion 1 — e.g., "Companies with <10 employees"}
- ❌ {criterion 2 — e.g., "Users who need X which we don't offer"}
- ❌ {criterion 3 — e.g., "Industries with Y regulatory requirement"}

## Economic Profile
- **Willingness to Pay**: {price range or pricing model}
- **Value of Transformation**: {what solving this is worth in their terms}
- **Budget Authority**: {can they buy independently or need approval}
- **Buying Cycle**: {how long from awareness to purchase}
```
