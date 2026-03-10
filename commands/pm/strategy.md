---
name: pm:strategy
description: Prioritize initiatives with RICE + Product Power scoring — force-ranked, no ties
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Rank all initiatives using RICE + Product Power composite scoring. Force-ranked backlog — no ties allowed.

**Requires:** `.product/BACKLOG.md` with at least 2 initiatives
**Reads:** `BACKLOG.md`, `STATE.md`, `DISCOVERY/*.md`
**Updates:** `.product/BACKLOG.md` (force-ranked)

**Anti-pattern:** If 80%+ items are P1, forces unique rankings.
</context>

<execution_context>
@prisma-pm/workflows/strategy-ranking.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/references/ui-brand.md
@prisma-pm/frameworks/rice.md
@prisma-pm/frameworks/product-power-formula.md
</execution_context>

<process>
Execute the strategy-ranking workflow end-to-end.
Preserve all workflow gates (anti-pattern check, RICE scoring, power scoring, alignment scoring, decision checkpoint, state update, next-up block).
</process>
