<purpose>
Rank all initiatives in the backlog using RICE scoring enhanced with Product Power. Produces a force-ranked backlog with no ties allowed. Detects the "P1 Everything" anti-pattern and forces unique rankings. Combines quantitative scoring (RICE + Power) with strategic alignment assessment.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init strategy "" --include state,backlog,product)
```

Parse JSON. Read BACKLOG.md and all discovery briefs:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs file list-discoveries
```

**If fewer than 2 initiatives in backlog:**

```
╔══════════════════════════════════════════════════════════════╗
║  ERROR                                                       ║
╚══════════════════════════════════════════════════════════════╝

Need at least 2 initiatives to rank. Current backlog has {count}.

**To fix:** Run `/pm:discover "problem"` to add initiatives.
```

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► RANKING STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Anti-Pattern Check

**If 80%+ of existing initiatives are marked P1/High Priority:**

```
⚠  "P1 Everything" anti-pattern detected.

If everything is priority 1, nothing is. This ranking will force
unique positions — every initiative gets a different rank.
```

## 4. Score Each Initiative

For each initiative, collect or calculate three scores:

<step name="rice-scoring">
### RICE Scoring

For each initiative, ask the user (or pull from discovery brief):

| Factor | Scale | Description |
|--------|-------|-------------|
| **Reach** | # users/quarter | How many users will this impact? |
| **Impact** | 0.25, 0.5, 1, 2, 3 | Minimal → Massive |
| **Confidence** | 0-100% | How confident in these estimates? |
| **Effort** | person-months | How much work is this? |

`RICE = (Reach × Impact × Confidence) / Effort`

Present scoring as a table for user input:

```
| Initiative | Reach | Impact | Confidence | Effort | RICE |
|------------|-------|--------|------------|--------|------|
| {name 1} | ? | ? | ? | ? | — |
| {name 2} | ? | ? | ? | ? | — |
```

Use AskUserQuestion for each factor, or accept batch input.
</step>

<step name="power-scoring">
### Product Power

If discovery brief exists → use the power score from the brief.
If no brief → run quick inline scoring:

"Rate {initiative} on three dimensions (1-10 each):
- ΔState: How big is the transformation?
- Intensity: How viscerally do users feel this?
- Frequency: How often do they encounter it?"

`Power = ΔState × Intensity × Frequency`
</step>

<step name="alignment-scoring">
### Strategic Alignment (1-5)

For each initiative, assess alignment with the transformation thesis from PRODUCT.md:

| Score | Meaning |
|-------|---------|
| 5 | Core to transformation thesis |
| 4 | Strongly supports thesis |
| 3 | Moderate support |
| 2 | Tangential |
| 1 | Off-strategy (flag for removal) |
</step>

## 5. Composite Ranking

Calculate composite score:

```
Composite = (RICE_normalized × 0.4) + (Power_normalized × 0.4) + (Alignment_normalized × 0.2)
```

Normalize each score to 0-100 range before combining.

## 6. Force-Rank

Sort by composite score. Break ties:
1. Higher Product Power wins
2. If still tied, higher Confidence wins
3. If still tied, lower Effort wins

**No ties allowed.** Every initiative gets a unique rank.

## 7. Checkpoint: Decision

Present the ranked table:

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Decision Required                               ║
╚══════════════════════════════════════════════════════════════╝

| Rank | Initiative | Power | RICE | Align | Composite |
|------|-----------|-------|------|-------|-----------|
| 1 | {name} | {score} | {score} | {1-5} | {score} |
| 2 | {name} | {score} | {score} | {1-5} | {score} |

Highlights:
- Top pick: {name} — {why it ranks first}
- Low Power (<100): {names if any} — consider dropping
- Off-strategy (align <3): {names if any} — flag for removal

──────────────────────────────────────────────────────────────
→ Select: approve / adjust scores / override ranking
──────────────────────────────────────────────────────────────
```

**If "adjust scores":** Re-collect specific scores and re-rank.
**If "override ranking":** Accept manual ranking but document the override reason.
**If "approve":** Proceed to write.

## 8. Update Backlog

Rewrite `.product/BACKLOG.md`:

```markdown
# Product Backlog

## Ranked Initiatives
<!-- Force-ranked by RICE + Product Power. No ties. Last ranked: {date} -->

| Rank | Initiative | Power | RICE | Alignment | Composite | Stage | Jobs |
|------|-----------|-------|------|-----------|-----------|-------|------|
| 1 | {name} | {score} | {score} | {1-5} | {composite} | {stage} | {jobs} |
| 2 | {name} | {score} | {score} | {1-5} | {composite} | {stage} | {jobs} |

## Ranking Rationale
{Brief explanation of top 3 rankings and any surprising results}

## Recommendations
- **Pursue**: {top initiative} — {one-line reason}
- **Consider dropping**: {any with Power <100}
- **Flag**: {any with alignment <3 — off-strategy}

## Parking Lot
<!-- Ideas captured but not yet scored -->
```

## 9. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "Strategy: {N} initiatives ranked. Top: {top initiative name}"
```

## 10. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► STRATEGY COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{N} initiatives ranked** — Top: {name} (Composite: {score})

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Define the top initiative** — write a context-engineered PRD

`/pm:define "{top-initiative-slug}"`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:validate --from {slug}` — validate before defining
- `/pm:discover "new problem"` — explore another problem
- `/pm:help` — see all commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/BACKLOG.md` — Force-ranked initiative backlog

</output>

<success_criteria>

- [ ] At least 2 initiatives in backlog
- [ ] P1 Everything anti-pattern checked
- [ ] RICE scores collected for all initiatives
- [ ] Product Power scores populated (from briefs or quick scoring)
- [ ] Strategic alignment assessed against transformation thesis
- [ ] Composite scores calculated with proper normalization
- [ ] Force-ranked with no ties
- [ ] Checkpoint: user reviewed and approved (or overrode with documented reason)
- [ ] BACKLOG.md rewritten with rankings and rationale
- [ ] Low-power and off-strategy initiatives flagged
- [ ] STATE.md updated
- [ ] Next-up block displayed with `/pm:define` suggestion

</success_criteria>
