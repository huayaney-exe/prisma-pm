---
name: pm:persona
description: Generate synthetic personas with JTBD mapping and simulated interview responses
argument-hint: "[--count N] [--for discovery-slug]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
---
<context>
Generate realistic synthetic personas from ICP and discovery data. JTBD-based, not demographic fiction.

**Requires:** `.product/ICP.md` (run `/pm:icp` first)
**Reads:** `.product/PRODUCT.md`, `.product/DISCOVERY/*.md`
**Creates:** `.product/PERSONAS/{name}-PERSONA.md` (one per persona)
**Spawns:** persona-architect agent (one per persona)

**Flags:**
- `--count N` — Number of personas (default: 3)
- `--for {slug}` — Contextualize to a specific discovery problem
</context>

<execution_context>
@prisma-pm/workflows/generate-personas.md
@prisma-pm/skill/rules/philosophy.md
@prisma-pm/references/ui-brand.md
@prisma-pm/agents/persona-architect.md
@prisma-pm/templates/persona-profile.md
</execution_context>

<process>
Execute the generate-personas workflow end-to-end.
Preserve all workflow gates (existing persona check, agent spawning, diversity check, checkpoint review, state update, next-up block).
</process>
