---
name: pm:design
description: Design specification — messaging, IA, CTA hierarchy, user flows, design system foundations
argument-hint: '"feature name" [--from slug-PRD] [--scope landing|product|full]'
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Write Design Specifications that bridge the PRD (what to build) and requirements (how to build it). Covers the FEEL layer — how the product should look, feel, and communicate.

**Reads:** `.product/DEFINITIONS/{slug}-PRD.md`, `PRODUCT.md`, `ICP.md`, `PERSONAS/*.md`
**Creates:** `.product/DEFINITIONS/{slug}-DESIGN.md`
**Scopes:** `landing` (marketing page), `product` (in-app UX), `full` (both — default)
**Spawns:** design-critic agent
</context>

<execution_context>
@prisma-pm/workflows/design-specification.md
@prisma-pm/references/questioning.md
@prisma-pm/references/design-taste.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/skill/rules/context-engineering.md
@prisma-pm/references/ui-brand.md
@prisma-pm/agents/design-critic.md
@prisma-pm/templates/design-spec.md
</execution_context>

<process>
Execute the design-specification workflow end-to-end.
Preserve all workflow gates (context gathering, design synthesis, agent spawning, design sufficiency loop, checkpoint review, state update, next-up block).
</process>
