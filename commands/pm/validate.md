---
name: pm:validate
description: Design experiments to validate assumptions before committing resources
argument-hint: '"assumption or hypothesis" [--from discovery-slug]'
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Design fast validation experiments with clear kill criteria. Prevents the "build-first-validate-later" anti-pattern.

**Reads:** `.product/DISCOVERY/{slug}-BRIEF.md`, `PERSONAS/`
**Creates:** `.product/DISCOVERY/{slug}-VALIDATION.md`
**Spawns:** experiment-designer agent

**Core principle:** Every experiment must have kill criteria defined BEFORE running.
</context>

<execution_context>
@prisma-pm/workflows/validate-hypothesis.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/references/ui-brand.md
@prisma-pm/agents/experiment-designer.md
@prisma-pm/templates/experiment-brief.md
@prisma-pm/templates/hypothesis-card.md
</execution_context>

<process>
Execute the validate-hypothesis workflow end-to-end.
Preserve all workflow gates (assumption identification, hypothesis checkpoint, agent spawning, persona pre-validation, state update, next-up block).
</process>
