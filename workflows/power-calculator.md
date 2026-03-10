<purpose>
Calculate the Product Power score for any problem or opportunity. This is a standalone calculator that can be used independently or as part of the discovery workflow. Product Power = ΔState × Emotional Intensity × Problem Frequency. The formula quantifies willingness to pay — people pay for the delta between states, not for features.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init power "" --include state)
```

Parse JSON. This command works with or without a product workspace.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► CALCULATING POWER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Collect Dimensions

If a problem description is provided in $ARGUMENTS, use it as context. Otherwise ask:

"What problem or opportunity do you want to score?"

Then score each dimension ONE AT A TIME:

<step name="delta-state">
**Dimension 1: ΔState (1-10)**
"How big is the gap between the current state and the ideal state?"

| Score | Meaning | Example |
|-------|---------|---------|
| 1-2 | Marginal improvement | Slightly faster loading |
| 3-4 | Noticeable improvement | Saves 30 min/week |
| 5-6 | Significant transformation | Changes daily workflow |
| 7-8 | Major life/work change | Eliminates a job function |
| 9-10 | Fundamental paradigm shift | Creates new category |

"Your rating and why?"
</step>

<step name="intensity">
**Dimension 2: Emotional Intensity (1-10)**
"How viscerally do people feel this problem?"

| Score | Meaning | Signal |
|-------|---------|--------|
| 1-2 | Barely noticed | No complaints |
| 3-4 | Mildly annoyed | Occasional mentions |
| 5-6 | Frustrated | Active complaints |
| 7-8 | Angry/desperate | Seeking alternatives |
| 9-10 | In crisis | Will pay anything |

"Your rating and why?"
</step>

<step name="frequency">
**Dimension 3: Problem Frequency (1-10)**
"How often do they encounter this problem?"

| Score | Meaning | Cadence |
|-------|---------|---------|
| 1-2 | Rarely | Yearly |
| 3-4 | Occasionally | Monthly |
| 5-6 | Regularly | Weekly |
| 7-8 | Frequently | Daily |
| 9-10 | Constantly | Always present |

"Your rating and why?"
</step>

## 4. Calculate and Display

Calculate: `Power = ΔState × Intensity × Frequency`

Display using the Product Power Score format from ui-brand.md:

```
┌──────────────────────────────────────────┐
│  Product Power: {SCORE} ({TIER})         │
│                                          │
│  ΔState:    {X}/10  ██████████░░░░░░░░░  │
│  Intensity: {Y}/10  ████████░░░░░░░░░░░  │
│  Frequency: {Z}/10  ████████████░░░░░░░  │
│                                          │
│  Formula: {X} × {Y} × {Z} = {SCORE}     │
└──────────────────────────────────────────┘
```

Tier interpretation:

| Tier | Score | Interpretation |
|------|-------|----------------|
| Low | <100 | Nice-to-have. Hard to monetize. Users won't switch for this. |
| Medium | 100-400 | Viable. Needs strong execution and clear positioning. |
| High | 400-700 | Strong opportunity. Clear willingness to pay. |
| Exceptional | 700+ | Category-defining. Build immediately. |

## 5. Strategic Interpretation

Provide interpretation based on the score:

**If Low (<100):**
"This problem may not be worth solving as a standalone product. Consider: Is it a feature of a larger product? Can you increase frequency through bundling? Is there a more painful adjacent problem?"

**If Medium (100-400):**
"Viable opportunity but competitive. Key question: Can you deliver a 10x better experience than alternatives? What's your unfair advantage?"

**If High (400-700):**
"Strong signal for willingness to pay. Focus on: Who feels this most intensely? How do you reach them? What's the minimum viable solution?"

**If Exceptional (700+):**
"Category-defining opportunity. Validate quickly and build. Risk: others will see this too — speed matters."

## 6. Optional: Update Initiative

If a product workspace exists and a matching initiative is in the backlog:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state update-power-score "{slug}" {score}
```

## 7. Done

```
───────────────────────────────────────────────────────────────

## ▶ Next Up

**Explore this problem deeper** — Socratic discovery with agent analysis

`/pm:discover "{problem description}"`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:validate` — design experiments to test assumptions
- `/pm:strategy` — rank against other initiatives

───────────────────────────────────────────────────────────────
```

</process>

<output>

- Product Power Score displayed to user
- Optional: BACKLOG.md updated with score

</output>

<success_criteria>

- [ ] Problem or opportunity described
- [ ] Three dimensions scored with justifications
- [ ] Product Power calculated correctly
- [ ] Score displayed with visual format
- [ ] Tier interpretation provided with strategic guidance
- [ ] Initiative updated in backlog if applicable
- [ ] Next-up block displayed

</success_criteria>
