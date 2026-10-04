# Praxis Protocol

**Praxis** is Prisma's multiplayer product-memory MCP server (`https://mcp.getprisma.lat/mcp`). It holds the product, its ICEDG-scored backlog, committed bets, tasks, versioned artifacts and learnings — shared by every agent and teammate.

Product Builder is the method; Praxis is where the work lives. Every workflow that produces something **intends to save it in Praxis**, and always writes the local `.product/` mirror too. This file is the contract every workflow follows. Never block a workflow on Praxis.

---

## 1. Preflight — decide the mode (before any user interaction)

**Detect Praxis tools.** Praxis is available when a tool whose name ends in `pm_get_state` exists — e.g. `mcp__praxis__pm_get_state`, `mcp__prisma__pm_get_state`, `mcp__claude_ai_prisma__pm_get_state`, `mcp__plugin_pm_praxis__pm_get_state`. MCP tools may be deferred: if your runtime has a tool-search tool (e.g. `ToolSearch`), search for `pm_get_state` before concluding Praxis is absent. Use the same prefix for every `pm_*` call below.

| Mode | When | Persistence |
|------|------|-------------|
| **PRAXIS** | Praxis tools available | Praxis first, then `.product/` mirror |
| **LOCAL** | No Praxis tools, filesystem available | `.product/` only + nudge line |
| **CHAT** | No Praxis tools and no filesystem/shell (e.g. claude.ai chat) | Deliver the document in the conversation + nudge line |

**In PRAXIS mode**, read the link (the `praxis` object is also included in every `pm-tools init` output):

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis status
```

- **Linked** (`linked: true`): call `pm_get_state` with `product_id`. If `cursor` is set, call `pm_get_changes(since_cursor)` and iterate while `truncated=true`. If a change touches an artifact this workflow reads (vision, ICP, a PRD…), fetch it with `pm_get_artifact` (`view: "full"`) and overwrite the local mirror file **before** working — Praxis wins, a teammate may have changed it. Save the new cursor: `praxis cursor <cursor>`.
- **Not linked**: resolve the product before creating anything — a product may already exist under another name. Call `pm_get_state` (no arguments) and read `about[]` (each product's name and its one-line `is`).
  - `about[]` is empty → create it: `/pm:new` per its workflow; any other workflow from `PRODUCT.md` with `pm_create_product` (§3, `/pm:new` row). No question.
  - `about[]` has products → ask once (AskUserQuestion), header "Praxis", question *"Is '{product_name}' one of these Praxis products?"*, options: the closest matches first (same or similar name, or an `is` that describes the same transformation — up to 3, each labeled `{name} — {is}`), then *"No — create '{product_name}'"*. Never create silently when products exist.
  - Multi-workspace users: if the active workspace has no plausible match, check `pm_list_workspaces` and mention which workspace the product will be created in.
  - Then: `praxis link --workspace <workspace.id> --product <id> --workspace-name "<workspace.name>"`.
  - If `praxis status` shows other unsynced local artifacts, do not upload them here — mention `/pm:praxis` in the result line.

**Errors — fall back, never stop:**

| Error | What to do |
|-------|-----------|
| Auth / unauthorized | Continue in LOCAL. Tell the user once: authenticate Praxis (Claude Code: `/mcp` → praxis → Authenticate). |
| `NOT_A_MEMBER` | Recover with `pm_list_workspaces`; pass the right `workspace_id`. Not an auth error — never re-run OAuth. |
| `PAYMENT_REQUIRED` (403) | Praxis access is not active. Continue in LOCAL; queue every write (§5). |
| Network / other | Continue in LOCAL; queue every write (§5). |

---

## 2. Write rules (PRAXIS mode)

- **Visibility: always `team`.**
- **No confirmation per write.** Saving is the default. The only questions are the ones listed in this file (product resolution in §1, commit rite in `/pm:validate`).
- **Work item visibility**: `pm_add_work_item` has no `visibility` input and Praxis creates work items as personal. Don't try to work around it; artifacts and learnings still go `team`.
- **Re-runs version, never duplicate.** Before saving, `praxis get <key>`. If a record exists → `pm_update_artifact(artifact_id, markdown, bump_version: true)`. Otherwise → `pm_save_artifact`.
- **Keys**: product-level kinds use the bare kind (`vision`, `icp`); everything else is `<kind>/<slug>` (`persona/andrea`, `discovery/{slug}`, `prd/{slug}`, `work_item/{slug}`).
- **Idempotency**: pass `idempotency_key: "pb:<key>:<YYYY-MM-DD>"` on every write.
- **Frontmatter** on every artifact: `{ "source": "product-builder@<VERSION>", "local_path": ".product/<file>" }` — `<VERSION>` is in `~/.claude/skills/prisma-pm/VERSION`.
- **Transformation map** (`pm_create_product` / `pm_update_product`): one key per state that changes, `{"<from>": "<to>"}` — never `{from, to}`. Keys are ≤120 characters: shorten the From state to fit; the verbatim text lives in the vision artifact.
- **Scope**: `vision`, `icp`, `persona`, `strategy` are product-level (no `work_item_id`). `discovery`, `hypothesis`, `validation`, `prd`, `design`, `requirements` are scoped to the initiative's work item (`work_item_id` = record of `work_item/{slug}`).
- **Missing work item**: if an initiative-level artifact has no `work_item/{slug}` record, create it first with `pm_add_work_item` (title, slug, `problem_statement`) and record it.
- **Scoped save rejected** (`UPSTREAM_ERROR` / RPC exception on a save that passes `work_item_id`, while `dry_run` passes): Praxis currently accepts initiative-scoped artifacts only on *committed* work items, and discovery, validation and PRDs come before the commit. Retry once **without** `work_item_id`, adding `"work_item_id"` and `"work_item_slug"` to the frontmatter, then `praxis record <key> <id> --work-item <work_item_id>`. It is still saved in Praxis — show the normal ✓ result line, no error.
- **ICEDG scores are server-computed** — propose the five inputs, never compute or narrate a number you calculated.
- **Team notice**: on the first write for a product (`team_notice_shown: false`), add one line — *"Saved for your team in {workspace_name}"* — then run `praxis team-notice-shown`.

---

## 3. What each workflow saves

| Workflow | Praxis calls | Record keys | Local mirror |
|----------|--------------|-------------|--------------|
| `/pm:new` | `pm_create_product(name, role: "owner", visibility: "team", transformation: {"<from>": "<to>"}, power_score: round(score/10), power_tier)` → `praxis link`; then `pm_save_artifact(kind: "vision", slug: "vision", markdown: PRODUCT.md)` | `vision` | `PRODUCT.md` |
| `/pm:icp` | `pm_save_artifact(kind: "icp", slug: "icp")` | `icp` | `ICP.md` |
| `/pm:persona` | one `pm_save_artifact(kind: "persona", slug: "<persona-slug>")` per persona | `persona/<slug>` | `PERSONAS/` |
| `/pm:discover` | `pm_add_work_item(title, slug, problem_statement)` → `pm_save_artifact(kind: "discovery", work_item_id)` → `pm_add_learning(kind: "insight")` for the top insight | `work_item/{slug}`, `discovery/{slug}` | `DISCOVERY/{slug}-BRIEF.md` |
| `/pm:power` | Matches a work item → `pm_add_learning(kind: "insight", work_item_id, text: "Product Power {score} ({tier}): ΔState {x} × Intensity {y} × Frequency {z}")`. Scores the whole product → `pm_update_product(power_score: round(score/10), power_tier)` | — | `BACKLOG.md` |
| `/pm:strategy` | `pm_score_work_items` for every ranked initiative (create missing ones with `pm_add_work_item` first). Praxis computes the official rank | `work_item/{slug}` | `BACKLOG.md` (Praxis order) |
| `/pm:validate` | `pm_save_artifact(kind: "hypothesis", work_item_id)`; then the **commit rite** (see workflow) | `hypothesis/{slug}` | `DISCOVERY/{slug}-VALIDATION.md` |
| `/pm:define` | `pm_save_artifact(kind: "prd", work_item_id)` → `pm_link_artifacts(prd → discovery, relation: "derived_from")` if a discovery record exists | `prd/{slug}` | `DEFINITIONS/{slug}-PRD.md` |
| `/pm:design` | `pm_save_artifact(kind: "design", work_item_id)` → `pm_link_artifacts(design → prd, relation: "addresses")` | `design/{slug}` | `DEFINITIONS/{slug}-DESIGN.md` |
| `/pm:require` | `pm_save_artifact(kind: "requirements", work_item_id)` → `pm_link_artifacts(requirements → prd, relation: "derived_from")` | `requirements/{slug}` | `DEFINITIONS/{slug}-REQUIREMENTS.md` |
| Any checkpoint decision | `pm_add_learning(kind: "decision", provenance: "user_stated")` | — | `STATE.md` learning |

After every successful write:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis record "<key>" "<id>" [--work-item <work_item_id>] [--version <n>]
```

**ICEDG from the method's own scores** (`/pm:strategy`, `/pm:discover` when scoring):
- `impacto` ← Product Power: `clamp(round(power / 100), 1, 10)`, rationale *"Product Power {score} ({tier})"*.
- `confianza` ← RICE confidence: 100% → 1.0, 80% → 0.8, 50% → 0.5; untested hypothesis → 0.3.
- `esfuerzo` ← RICE effort: hours 1 · days 3 · a week 5 · multi-week 8 · month+ 10.
- `dependencias` (≥1, 1 = self-contained) and `gestion` (1-10, post-launch upkeep) ← propose from context. At most one clarifying question per item; never a form.

---

## 4. Result line

Print exactly one line right under the workflow's completion banner.

| Situation | Line |
|-----------|------|
| PRAXIS, saved | `✓ Saved in Praxis · {Artifact} v{n} · visible to your team` |
| PRAXIS, other local docs not yet uploaded | append ` · {N} local docs not in Praxis yet → /pm:praxis` |
| LOCAL / CHAT | `○ Saved only in .product/ · Praxis versions it and shares it with your team — 7-day free trial: npx product-builder@latest --praxis` |
| LOCAL, `unsynced_count ≥ 3` | `○ {N} documents live only on this machine · Praxis keeps them versioned and shared — 7-day free trial: npx product-builder@latest --praxis` |
| Fallback after an error | `○ Praxis unavailable ({reason}) · saved locally and queued → /pm:praxis uploads it when it's back` |

In CHAT mode replace "Saved only in .product/" with "Not saved anywhere yet". If `nudge` is `false` in `praxis status`, omit the LOCAL/CHAT lines entirely. Write the line in the user's language.

---

## 5. Fallback queue

When a write fails, or the mode fell back to LOCAL after a Praxis error:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis queue add "<key>" --reason "<error code>"
```

`/pm:praxis` drains the queue and uploads everything `praxis unsynced` reports.

---

## 6. Mirror rule

- The local mirror is always written (PRAXIS and LOCAL modes).
- **Praxis wins.** Never overwrite a Praxis artifact with a stale mirror: if `praxis status` shows a local file as `modified` but `pm_get_changes` shows the artifact also changed in Praxis since the last sync, show both versions to the user and ask which one to keep.
