---
name: pm:new
description: Initialize product workspace with vision, market context, and transformation thesis
argument-hint: '"Product Name"'
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Initialize a new product management workspace. Entry point for all Prisma PM work.

**Creates:**
- `.product/PRODUCT.md` — Vision, transformation thesis, Product Power score
- `.product/BACKLOG.md` — Ranked initiative backlog (empty)
- `.product/STATE.md` — Product state tracker
- `.product/config.json` — Prisma PM preferences
- Directory structure: `PERSONAS/`, `DISCOVERY/`, `DEFINITIONS/`, `SPRINTS/`, `LAUNCHES/`, `METRICS/`, `RETROS/`

**After this command:** Run `/pm:icp` to define your Ideal Customer Profile.
</context>

<execution_context>
@prisma-pm/workflows/new-product.md
@prisma-pm/references/questioning.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/references/ui-brand.md
@prisma-pm/templates/product-vision.md
</execution_context>

<process>
Execute the new-product workflow end-to-end.
Preserve all workflow gates (Socratic questioning, checkpoint review, state update, next-up block).
</process>
