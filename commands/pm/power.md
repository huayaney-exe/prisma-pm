---
name: pm:power
description: Product Power Formula calculator — score any problem or opportunity
argument-hint: '"problem or opportunity description"'
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<context>
Quick Product Power Formula scoring. Can be used standalone (describe a problem) or with an existing discovery brief.

**Formula:** `Product Power = ΔState × Emotional Intensity × Problem Frequency`
**Range:** 1 to 1,000
**Tiers:** Low (<100), Medium (100-400), High (400-700), Exceptional (700+)

No workspace required — this works anywhere as a standalone calculator.
</context>

<objective>
Score a problem or opportunity using the Product Power Formula. This is the north-star metric for prioritization.
</objective>

<process>
## If argument is a description (standalone mode):

Ask three focused questions:

**Q1 — ΔState (1-10)**
"How large is the gap between the undesired and preferred state?
- 1-3: Minor inconvenience
- 4-6: Significant friction (wastes time, causes stress)
- 7-9: Critical pain (blocks major goals)
- 10: Existential (threatens livelihood, safety, identity)

Rate the ΔState and explain why."

**Q2 — Emotional Intensity (1-10)**
"How deeply does the user FEEL this pain?
- 1-3: Rational awareness (knows it's a problem, no urgency)
- 4-6: Emotional engagement (frustrated, motivated to solve)
- 7-9: Visceral need (desperate, will pay premium)
- 10: Identity-level (this problem defines their daily experience)

Rate the intensity and explain why."

**Q3 — Problem Frequency (1-10)**
"How often does the user encounter this problem?
- 1-3: Rarely (yearly, quarterly)
- 4-6: Regularly (monthly, weekly)
- 7-9: Frequently (daily, multiple times per day)
- 10: Constantly (always present, ambient pain)

Rate the frequency and explain why."

## Calculate and present:

```
╔══════════════════════════════════════════════╗
║  PRODUCT POWER SCORE                         ║
╠══════════════════════════════════════════════╣
║  Problem: {description}                      ║
║                                              ║
║  ΔState:              {X}/10                 ║
║  Emotional Intensity: {Y}/10                 ║
║  Problem Frequency:   {Z}/10                 ║
║                                              ║
║  Product Power: {X × Y × Z}                 ║
║  Tier: {Low|Medium|High|Exceptional}         ║
╚══════════════════════════════════════════════╝
```

## Interpretation:

- **Low (<100)**: Nice-to-have. Hard to monetize. Consider pivoting the framing or finding a sharper pain.
- **Medium (100-400)**: Viable product. Needs strong execution and clear differentiation to win.
- **High (400-700)**: Strong product opportunity. Clear willingness to pay. Prioritize this.
- **Exceptional (700+)**: Category-defining opportunity. Build this immediately.

## If `.product/` exists:

Update the initiative's power score in BACKLOG.md if the problem matches an existing initiative.

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "Power scored '{problem}': {score} ({tier})"
```

## Comparison mode:

If the user provides multiple problems, score each and present a ranked comparison table:

| Rank | Problem | ΔState | Intensity | Frequency | Score | Tier |
|------|---------|--------|-----------|-----------|-------|------|
| 1 | {highest} | | | | | |
| 2 | {next} | | | | | |
</process>
