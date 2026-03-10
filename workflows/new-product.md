<purpose>
Initialize a new product management workspace through Socratic questioning. This is the most leveraged moment in PM work — deep questioning here means better discovery, better definitions, better outcomes. One workflow takes you from idea to a scaffolded .product/ workspace with vision, transformation thesis, and Product Power score.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP — Execute before ANY user interaction:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init new "" --include state)
```

Parse JSON for: `product_dir`, `product_exists`, `state`.

**If `product_exists` is true:** Error — product already initialized:

```
╔══════════════════════════════════════════════════════════════╗
║  ERROR                                                       ║
╚══════════════════════════════════════════════════════════════╝

Product workspace already exists at .product/

**To fix:** Use `/pm:help` to see current state, or delete .product/ to start over.
```

**If no product name in $ARGUMENTS:** Ask inline (freeform):

"What's the name of your product?"

## 2. Deep Questioning

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► INITIALIZING PRODUCT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Ask these questions ONE AT A TIME. Wait for each answer before proceeding. Follow threads — each answer may reveal something worth exploring deeper.

<step name="transformation">
**Q1 — The Transformation**
"What transformation does this product enable? Describe the undesired state your users are in today, and the preferred state your product moves them toward."

Probe if vague: "Make it concrete — what specifically is bad about today? What specifically is better after?"
</step>

<step name="who">
**Q2 — The Who**
"Who specifically experiences this pain? Not 'everyone' — the person who feels this most intensely. What's their role, context, circumstance?"
</step>

<step name="intensity">
**Q3 — The Pain Intensity**
"On a scale of 1-10, how painful is their current state? What evidence supports your rating?"

| Scale | Meaning |
|-------|---------|
| 1-3 | Minor inconvenience |
| 4-6 | Significant friction |
| 7-9 | Critical pain |
| 10 | Existential threat |
</step>

<step name="frequency">
**Q4 — The Frequency**
"How often do they encounter this problem?"

| Frequency | Rating |
|-----------|--------|
| Rarely (yearly) | 1-2 |
| Regularly (monthly) | 3-5 |
| Frequently (weekly) | 6-8 |
| Constantly (always present) | 9-10 |
</step>

<step name="landscape">
**Q5 — The Landscape**
"What do people use today to solve this? Competitors, manual workarounds, or do they just suffer? What's broken about current solutions?"
</step>

<step name="advantage">
**Q6 — The Advantage**
"What will make your solution fundamentally better? Not incrementally — what makes the old way feel broken once they try yours?"
</step>

## 3. Scaffold Workspace

After collecting all answers, scaffold the workspace:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs scaffold "{Product Name}"
```

## 4. Calculate Product Power

Using the user's ratings, calculate the Product Power Score:

```
Product Power = ΔState × Emotional Intensity × Problem Frequency
```

Score the three dimensions (each 1-10) based on user answers:
- **ΔState**: From Q3 (pain intensity = magnitude of transformation)
- **Emotional Intensity**: Derived from Q1 + Q3 (how viscerally they feel it)
- **Problem Frequency**: From Q4

Determine tier:

| Tier | Score | Meaning |
|------|-------|---------|
| Low | <100 | Nice-to-have. Hard to monetize. |
| Medium | 100-400 | Viable. Needs strong execution. |
| High | 400-700 | Strong opportunity. |
| Exceptional | 700+ | Category-defining. Build immediately. |

## 5. Write PRODUCT.md

Synthesize all answers into `.product/PRODUCT.md`:

```markdown
---
product: "{Product Name}"
stage: discovering
created: "{ISO date}"
---

# {Product Name}

## Transformation Thesis
**From**: {undesired state — verbatim from user}
**To**: {preferred state — verbatim from user}

## Target User
{Who experiences this pain — from Q2}

## Product Power Score
- **ΔState**: {1-10} — {justification}
- **Emotional Intensity**: {1-10} — {justification}
- **Problem Frequency**: {1-10} — {justification}
- **Score**: {product} — **{tier}**

## Current Landscape
{From Q5 — what exists today}

## Unique Advantage
{From Q6 — why this product wins}

## Open Questions
{Any gaps or uncertainties identified during questioning}
```

Do not compress. Capture everything gathered.

## 6. Checkpoint: Review

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Required                                 ║
╚══════════════════════════════════════════════════════════════╝

Product Power Score displayed using ui-brand.md score display format.

──────────────────────────────────────────────────────────────
→ Type "approved" or describe changes
──────────────────────────────────────────────────────────────
```

If changes requested: update PRODUCT.md accordingly. Loop until approved (max 3 iterations).

## 7. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "Product initialized: {Product Name} — Power Score: {score} ({tier})"
```

## 8. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► INITIALIZING PRODUCT COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Product Name}** — Power: {score} ({tier})

Transformation: {from} → {to}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Define your Ideal Customer Profile** — precision targeting and disqualification

`/pm:icp`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:persona` — generate synthetic personas (requires ICP first)
- `/pm:discover "problem"` — explore a specific problem space

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/PRODUCT.md` — Vision, transformation thesis, Product Power score
- `.product/BACKLOG.md` — Empty ranked backlog
- `.product/STATE.md` — State tracker with initialization entry
- `.product/config.json` — Default preferences
- Directory structure: `PERSONAS/`, `DISCOVERY/`, `DEFINITIONS/`, `SPRINTS/`, `LAUNCHES/`, `METRICS/`, `RETROS/`

</output>

<success_criteria>

- [ ] Product name captured
- [ ] 6 Socratic questions asked and answered (threads followed, not rushed)
- [ ] Product Power Score calculated from user responses
- [ ] .product/ workspace scaffolded via pm-tools.cjs
- [ ] PRODUCT.md written with full context
- [ ] Checkpoint: user reviewed and approved
- [ ] STATE.md updated with initialization entry
- [ ] Next-up block displayed with `/pm:icp` suggestion

</success_criteria>
