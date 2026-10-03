---
name: pm:praxis
description: Connect Praxis, link this product, and upload everything that only lives in .product/
argument-hint: '[nudge on|off]'
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
  - mcp__praxis
  - mcp__prisma
  - mcp__claude_ai_prisma
  - mcp__plugin_pm_praxis
---
<context>
Praxis is Prisma's multiplayer product-memory MCP server. Every Prisma PM command saves to it first; this command is the one-stop place to connect it, link the local workspace to a Praxis product, and backfill or retry anything that is still only local.

**Reads:** `.product/praxis.json`, every local artifact
**Writes:** Praxis product + artifacts (team visibility), `.product/praxis.json`, `AGENTS.md`
**Arguments:** `nudge off` / `nudge on` — silence or restore the "Saved only in .product/" line
</context>

<execution_context>
@prisma-pm/workflows/praxis-sync.md
@prisma-pm/references/praxis.md
@prisma-pm/references/ui-brand.md
</execution_context>

<process>
Execute the praxis-sync workflow end-to-end.
</process>
