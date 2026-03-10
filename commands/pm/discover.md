---
name: pm:discover
description: Socratic problem exploration — deep problem understanding through structured inquiry
argument-hint: '"problem description"'
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Explore a problem space through Socratic questioning and multi-agent analysis. Core PM discovery workflow.

**Requires:** `.product/` workspace (run `/pm:new` first)
**Reads:** `ICP.md`, `PERSONAS/`, `PRODUCT.md`
**Creates:** `.product/DISCOVERY/{slug}-BRIEF.md`
**Updates:** `BACKLOG.md`, `STATE.md`
**Spawns:** customer-voice agent, strategic-advisor agent
</context>

<execution_context>
@prisma-pm/workflows/discover-problem.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/skill/rules/anti-patterns.md
@prisma-pm/references/ui-brand.md
@prisma-pm/agents/customer-voice.md
@prisma-pm/agents/strategic-advisor.md
@prisma-pm/frameworks/jtbd.md
@prisma-pm/frameworks/product-power-formula.md
@prisma-pm/templates/discovery-brief.md
</execution_context>

<process>
Execute the discover-problem workflow end-to-end.
Preserve all workflow gates (anti-pattern check, 5-layer questioning, agent spawning, checkpoint review, state update, next-up block).
</process>
