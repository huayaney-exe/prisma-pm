<purpose>
Define the Ideal Customer Profile through Socratic questioning. The ICP is the most important targeting document — it defines who you serve AND who you explicitly don't. Every downstream artifact (personas, discovery, messaging, GTM) is grounded in this document. Knowing who you DON'T serve is as important as knowing who you do.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init icp "" --include state,product)
```

Parse JSON. Read `.product/PRODUCT.md` to understand the transformation thesis and target user.

**If PRODUCT.md not found:** Error — run `/pm:new` first.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DEFINING ICP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Open with context from PRODUCT.md:
"Your transformation thesis is: {from} → {to}. Let's define exactly who experiences this most intensely."

## 3. Socratic ICP Definition

Ask these questions ONE AT A TIME. Follow threads when answers reveal something worth exploring.

<step name="demographics">
**Q1 — Demographics**
"What is your ideal customer's role/title? What size organization? What industry? What geography?"

Probe: "Is this a technical role or business role? Does company size change the pain intensity?"
</step>

<step name="circumstance">
**Q2 — Circumstance Trigger**
"What specific circumstance or trigger makes them actively seek a solution? Not 'they need our product' — what event or frustration pushes them to act?"

This is the moment they become a buyer. Be precise.
</step>

<step name="behavioral-signals">
**Q3 — Behavioral Signals**
"How would you identify this person in the wild? What do they search for? What communities are they in? What tools do they currently use? What content do they consume?"
</step>

<step name="psychographics">
**Q4 — Psychographic Profile**
"How do they make decisions — data-driven or intuition? Do they value speed or thoroughness? Early adopter or wait-and-see? What do they care about beyond the functional problem?"
</step>

<step name="disqualification">
**Q5 — Disqualification Criteria**
"Who is explicitly NOT your customer? What characteristics disqualify someone even if they seem to fit?"

This is critical. Push for at least 3 disqualification criteria.
</step>

<step name="willingness-to-pay">
**Q6 — Willingness to Pay**
"What would this person pay to solve this problem? What's the value of the transformation in their terms — time saved, revenue gained, pain eliminated?"
</step>

## 4. Write ICP.md

Write `.product/ICP.md`:

```markdown
---
product: "{from PRODUCT.md}"
last_updated: "{ISO date}"
---

# Ideal Customer Profile

## Demographics
- **Role/Title**: {from Q1}
- **Organization Size**: {from Q1}
- **Industry**: {from Q1}
- **Geography**: {from Q1}

## Circumstance Trigger
{From Q2 — the moment they become a buyer}

## Behavioral Signals
{From Q3 — how to identify them}

## Psychographic Profile
- **Decision Style**: {from Q4}
- **Risk Tolerance**: {from Q4}
- **Values**: {from Q4}

## Pain Intensity Map
| Dimension | Rating (1-10) | Evidence |
|-----------|---------------|----------|
| Severity | {rating} | {evidence} |
| Frequency | {rating} | {evidence} |
| Urgency | {rating} | {evidence} |
| Willingness to Pay | {rating} | {evidence} |

## Disqualification Criteria
{From Q5 — who is NOT your customer}
- ❌ {criterion 1}
- ❌ {criterion 2}
- ❌ {criterion 3}

## Economic Profile
- **Willingness to Pay**: {from Q6}
- **Value of Transformation**: {from Q6}
- **Budget Authority**: {inferred}
```

## 5. Checkpoint: Review

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Required                                 ║
╚══════════════════════════════════════════════════════════════╝

ICP Summary:
- Target: {role} at {company type}
- Trigger: {circumstance}
- Disqualified: {top 3 criteria}

──────────────────────────────────────────────────────────────
→ Type "approved" or describe changes
──────────────────────────────────────────────────────────────
```

If changes: update ICP.md. Loop until approved (max 3 iterations).

## 6. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "ICP defined: {one-line summary}"
```

## 7. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DEFINING ICP COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ICP**: {role} at {company type}
**Trigger**: {circumstance}
**Disqualified**: {count} criteria defined

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Generate Synthetic Personas** — create testable user archetypes from your ICP

`/pm:persona`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:discover "problem"` — explore a specific problem space
- `/pm:help` — see all available commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/ICP.md` — Complete Ideal Customer Profile with disqualification criteria

</output>

<success_criteria>

- [ ] PRODUCT.md read for transformation thesis context
- [ ] 6 Socratic questions asked and answered
- [ ] At least 3 disqualification criteria defined
- [ ] Pain intensity map populated with ratings and evidence
- [ ] ICP.md written with full content
- [ ] Checkpoint: user reviewed and approved
- [ ] STATE.md updated
- [ ] Next-up block displayed with `/pm:persona` suggestion

</success_criteria>
