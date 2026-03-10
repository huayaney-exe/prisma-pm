---
name: pm:require
description: Break PRDs into implementable user stories with acceptance criteria
argument-hint: '[--from definitions/slug-PRD.md]'
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Transform a PRD into implementable user stories with Given/When/Then acceptance criteria. The bridge between PM and engineering.

**Reads:** `.product/DEFINITIONS/{slug}-PRD.md`
**Creates:** `.product/DEFINITIONS/{slug}-REQUIREMENTS.md`

**Key principle:** Every requirement traces to a user job, not a stakeholder wish.
</context>

<execution_context>
@prisma-pm/workflows/require-stories.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/skill/rules/context-engineering.md
@prisma-pm/references/ui-brand.md
</execution_context>

<process>
Execute the require-stories workflow end-to-end.
Preserve all workflow gates (epic approval checkpoint, completeness validation loop, checkpoint review, state update, next-up block).
</process>
