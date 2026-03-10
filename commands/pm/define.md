---
name: pm:define
description: Write context-engineered PRDs and product specifications
argument-hint: '"feature name" [--from discovery-slug] [--format lean|full|one-pager]'
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Write PRDs that pass the Context Sufficiency Test for AI-assisted implementation.

**Reads:** `.product/DISCOVERY/{slug}-BRIEF.md`, `VALIDATION.md`, `ICP.md`, `PRODUCT.md`
**Creates:** `.product/DEFINITIONS/{slug}-PRD.md`
**Formats:** `lean` (default), `full`, `one-pager`
**Spawns:** delivery-architect agent
</context>

<execution_context>
@prisma-pm/workflows/define-product.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/skill/rules/context-engineering.md
@prisma-pm/references/ui-brand.md
@prisma-pm/agents/delivery-architect.md
@prisma-pm/templates/prd-lean.md
@prisma-pm/templates/prd-full.md
@prisma-pm/templates/one-pager.md
</execution_context>

<process>
Execute the define-product workflow end-to-end.
Preserve all workflow gates (context gathering, agent spawning, context sufficiency loop, checkpoint review, state update, next-up block).
</process>
