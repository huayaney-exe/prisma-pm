---
name: pm:icp
description: Define Ideal Customer Profile with precision targeting and disqualification criteria
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
---
<context>
Define the Ideal Customer Profile for the product. Feeds all downstream work — discovery, personas, messaging, and GTM.

**Requires:** `.product/PRODUCT.md` (run `/pm:new` first)
**Creates:** `.product/ICP.md`

**Key principle:** Knowing who you DON'T serve is as important as knowing who you do.
</context>

<execution_context>
@prisma-pm/workflows/icp-definition.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/references/ui-brand.md
@prisma-pm/templates/icp-profile.md
</execution_context>

<process>
Execute the icp-definition workflow end-to-end.
Preserve all workflow gates (Socratic questioning, checkpoint review, state update, next-up block).
</process>
