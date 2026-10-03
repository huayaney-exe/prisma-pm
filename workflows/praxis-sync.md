<purpose>
Make Praxis the home of this product: connect it, link the local `.product/` workspace to a Praxis product, and upload every local artifact that isn't there yet (or changed since its last sync), plus anything queued after a failed write.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting. `praxis.md` is the contract for every call below.
</required_reading>

<process>

## 0. Arguments

If `$ARGUMENTS` is `nudge off` or `nudge on`:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis nudge off   # or: on
```

Confirm in one line and stop.

## 1. Status

```bash
STATUS=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis status)
```

Parse: `workspace` (is there a `.product/`), `linked`, `product_id`, `unsynced[]`, `queue[]`.

Detect Praxis tools as in `praxis.md` §1 (search for `pm_get_state` if tools are deferred).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► PRAXIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 2. Not connected → how to connect, then stop

If there are no Praxis tools:

```
Praxis isn't connected in this session.

Praxis is Prisma's multiplayer product memory: your vision, ICP, discoveries,
PRDs, backlog, bets and decisions — versioned and shared with your team, readable
by any agent in any session. 7-day free trial.

  Connect:        npx product-builder@latest --praxis
  Claude Code:    claude mcp add --transport http --scope user praxis https://mcp.getprisma.lat/mcp
                  then /mcp → praxis → Authenticate
  claude.ai:      add the Praxis connector, URL https://mcp.getprisma.lat/mcp

Then run /pm:praxis again — it uploads the {N} documents in .product/.
```

(`{N}` = `unsynced` length; drop that sentence when there's no workspace.) Stop.

If the tools exist but calls fail with an auth error, say how to authenticate (Claude Code: `/mcp` → praxis → Authenticate) and stop. `PAYMENT_REQUIRED` → say Praxis access isn't active and the queue will upload once it is; stop.

## 3. Connected, no local workspace

If `workspace` is false: call `pm_get_state`, show the products it lists (name + one-line `is`), and suggest `/pm:new "Name"` to start one — it will be created in Praxis automatically. Stop.

## 4. Link the product

If `linked` is false, call `pm_get_state` and use AskUserQuestion:
- header: "Product"
- question: "Which Praxis product is '{product_name}'?"
- options: up to 3 products from `about[]` (name-matching first) + "Create '{product_name}' in Praxis"

Create → `pm_create_product` from `PRODUCT.md` exactly as the `/pm:new` row of `praxis.md` §3 (team visibility, transformation map, power score/tier).

Then:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis link --workspace "<workspace_id>" --product "<product_id>" --workspace-name "<workspace_name>"
```

If already linked: call `pm_get_state(product_id)` and, with the stored cursor, `pm_get_changes` — apply `praxis.md` §6 to any local file that is `modified` while its Praxis artifact also changed.

## 5. Upload

Build the upload list from `unsynced[]` plus every key in `queue[]`. If empty → skip to step 6.

Show it grouped (new / modified) and ask once:
- header: "Upload"
- question: "Upload {N} documents to Praxis? Your team will see them in {workspace_name}."
- options: "Upload all" · "Not now"

Upload in dependency order, following `praxis.md` §2–§3 for every call (versions for existing records, team visibility, frontmatter, idempotency keys, `praxis record` after each success):

1. `vision`, `icp`, then each `persona/<slug>`
2. Per initiative slug: `work_item/{slug}` (create if missing, from the brief's title and problem statement) → `discovery/{slug}` → `hypothesis/{slug}` → `prd/{slug}` → `design/{slug}` → `requirements/{slug}`
3. Links: prd → discovery `derived_from`, design → prd `addresses`, requirements → prd `derived_from` (use `pm_link_artifacts_batch` when there are several)

A failure on one item doesn't stop the rest: queue it (`praxis queue add`) and continue.

## 6. Refresh AGENTS.md

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs agents-md --product-name "{product_name}"
```

This switches the AGENTS.md block to Praxis mode (product and workspace ids) so every coding agent in the repo uses Praxis.

## 7. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► PRAXIS ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{product_name}** → Praxis · {workspace_name}

  Uploaded:  {n} new · {m} new versions
  Queued:    {q} (retry with /pm:praxis)
  AGENTS.md: {created|updated} — agents in this repo now read Praxis first
```

Include the product URL if a Praxis response returned one.

</process>

<success_criteria>

- [ ] Not connected → connection steps shown, nothing else attempted
- [ ] Product linked (existing or created) and recorded in `.product/praxis.json`
- [ ] Every unsynced or queued artifact uploaded or re-queued — none silently skipped
- [ ] Re-uploads created new versions, never duplicates
- [ ] AGENTS.md refreshed in Praxis mode

</success_criteria>
