<purpose>
Calculate the Product Power score for any problem or opportunity. This is a standalone calculator that can be used independently or as part of the discovery workflow. Product Power = ΔState × Emotional Intensity × Problem Frequency. The formula quantifies willingness to pay — people pay for the delta between states, not for features.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Other" and their response signals freeform intent (e.g., "let me describe it", "I'll explain", "something else"), you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response
</freeform_rule>

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

**If a problem description is provided in $ARGUMENTS:** Acknowledge the problem and proceed directly to scoring.

**If no problem provided:** Ask as plain text:
"What problem or opportunity do you want to score?"

Wait for the user to respond at the normal prompt before continuing.

Then score each dimension using AskUserQuestion:

<step name="delta-state">
**Dimension 1: ΔState (1-10)**

Use AskUserQuestion:
- header: "ΔState"
- question: "How big is the gap between current and ideal state for this problem?"
- options:
  - "1-3: Marginal" — Slight improvement, barely noticeable
  - "4-6: Significant" — Changes daily workflow meaningfully
  - "7-8: Major" — Eliminates entire job functions or pain points
  - "9-10: Paradigm" — Creates a new category entirely

After the user selects a range, acknowledge their choice. If they picked a range (e.g., "4-6"), ask as plain text: "You said significant — would you put it closer to 4, 5, or 6? Quick gut check." Then use their specific number.
</step>

<step name="intensity">
**Dimension 2: Emotional Intensity (1-10)**

Use AskUserQuestion:
- header: "Intensity"
- question: "How viscerally do people feel this problem?"
- options:
  - "1-3: Mild" — Noticed but not complained about
  - "4-6: Frustrated" — Active complaints, seeking workarounds
  - "7-8: Desperate" — Angry, actively seeking alternatives
  - "9-10: Crisis" — Will pay anything to solve this now

After the user selects a range, acknowledge their choice. If they picked a range, ask as plain text for the specific number within that range.
</step>

<step name="frequency">
**Dimension 3: Problem Frequency (1-10)**

Use AskUserQuestion:
- header: "Frequency"
- question: "How often do they encounter this problem?"
- options:
  - "1-3: Rare" — Monthly or less
  - "4-6: Regular" — Weekly occurrence
  - "7-8: Daily" — Hits them every day
  - "9-10: Constant" — Always present, never goes away

After the user selects a range, acknowledge their choice. If they picked a range, ask as plain text for the specific number within that range.
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
