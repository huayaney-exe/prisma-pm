# Praxis Protocol

**Praxis** is Prisma's multiplayer product-memory MCP server (`https://mcp.getprisma.lat/mcp`). It holds the product, its ICEDG-scored backlog, committed bets, tasks, versioned artifacts and learnings — shared by every agent and teammate.

Product Builder is the method; Praxis is where the work lives. Every workflow that produces something **intends to save it in Praxis**, and always writes the local `.product/` mirror too. This file is the contract every workflow follows. Never block a workflow on Praxis.

---

## 1. Preflight — decide the mode (before any user interaction)

**Detect Praxis tools.** Praxis is available when a tool whose name ends in `pm_get_state` exists — e.g. `mcp__praxis__pm_get_state`, `mcp__prisma__pm_get_state`, `mcp__claude_ai_prisma__pm_get_state`, `mcp__plugin_pm_praxis__pm_get_state`. MCP tools may be deferred: if your runtime has a tool-search tool (e.g. `ToolSearch`), search for `pm_get_state` before concluding Praxis is absent. Use the same prefix for every `pm_*` call below.

| Mode | When | Persistence |
|------|------|-------------|
| **PRAXIS** | Praxis tools available | Praxis first, then `.product/` mirror |
| **LOCAL** | No Praxis tools, filesystem available | `.product/` only · Praxis offered only at the 3 save moments (§4) |
| **CHAT** | No Praxis tools and no filesystem/shell (e.g. claude.ai chat) | Deliver the document in the conversation · same 3 save moments |

**In PRAXIS mode**, read the link (the `praxis` object is also included in every `pm-tools init` output):

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis status
```

- **Queue first**: if `queue` is not empty, upload those items now (§2 rules, once the product is linked) before working — skip `SCOPE_PENDING_COMMIT` items whose work item is still a candidate. One line: `✓ {N} queued documents are now in Praxis`. This is how a user who chose Praxis before connecting gets exactly what they chose.
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
| `PAYMENT_REQUIRED` (403) | Praxis access is not active. Continue in LOCAL; queue every write (§6). |
| Network / other | Continue in LOCAL; queue every write (§6). |

---

## 2. Write rules (PRAXIS mode)

- **Visibility: always `team`.**
- **No confirmation per write.** Saving is the default. The only questions are the ones listed in this file (product resolution in §1, commit rite in `/pm:validate`, and the three save moments in §4 — LOCAL / CHAT only).
- **Work item visibility**: `pm_add_work_item` has no `visibility` input and Praxis creates work items as personal. Don't try to work around it; artifacts and learnings still go `team`.
- **Re-runs version, never duplicate.** Before saving, `praxis get <key>`. If a record exists → `pm_update_artifact(artifact_id, markdown, bump_version: true)`. Otherwise → `pm_save_artifact`.
- **Keys**: product-level kinds use the bare kind (`vision`, `icp`); everything else is `<kind>/<slug>` (`persona/andrea`, `discovery/{slug}`, `prd/{slug}`, `work_item/{slug}`).
- **Idempotency**: pass `idempotency_key: "pb:<key>:<YYYY-MM-DD>"` on every write.
- **Frontmatter** on every artifact: `{ "source": "product-builder@<VERSION>", "local_path": ".product/<file>" }` — `<VERSION>` is in `~/.claude/skills/prisma-pm/VERSION`.
- **Transformation map** (`pm_create_product` / `pm_update_product`): one key per state that changes, `{"<from>": "<to>"}` — never `{from, to}`. Keys are ≤120 characters: shorten the From state to fit; the verbatim text lives in the vision artifact.
- **Scope**: `vision`, `icp`, `persona`, `strategy` are product-level (no `work_item_id`). `discovery`, `hypothesis`, `validation`, `prd`, `design`, `requirements` are scoped to the initiative's work item (`work_item_id` = record of `work_item/{slug}`).
- **Missing work item**: if an initiative-level artifact has no `work_item/{slug}` record, create it first with `pm_add_work_item` (title, slug, `problem_statement`) and record it.
- **Scoped save rejected** (`UPSTREAM_ERROR` on a save that passes `work_item_id` while `dry_run` passes): Praxis currently accepts initiative-scoped kinds (`discovery`, `hypothesis`, `validation`, `prd`, `design`, `requirements`) only on *committed* work items, and rejects them at product level. Don't work around it. Queue it — `praxis queue add <key> --reason SCOPE_PENDING_COMMIT` — and show: `○ {Artifact} saved locally · Praxis takes it once the bet is committed (/pm:validate), then it uploads on its own`.
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

## 4. Save moments (LOCAL / CHAT) — offer, never push

Nobody wants to be pushed. Praxis is offered **only when the user has just produced something worth keeping**, and the offer names what Praxis does for *that* thing. Every other workflow says nothing about Praxis in LOCAL / CHAT mode — no banner, no line.

| Moment | Where | Question (AskUserQuestion, header "Praxis") | "Save in Praxis" description |
|--------|-------|-----------------------------------|------------------------------|
| `product` | `/pm:new`, right after PRODUCT.md is approved | "Your product is defined. Where should it live?" | Any agent, session or teammate starts from it. 7-day free trial. |
| `handoff` | `/pm:define`, right after the PRD is approved | "This PRD goes to engineering. Keep it where their agents can read it?" | Your team's agents read the latest version directly. 7-day free trial. |
| `bet` | `/pm:validate`, right after the commit decision | "Want Praxis to hold the team to this bet?" | It keeps the kill criteria and reminds the team on {review date}. 7-day free trial. |

Options, in this order: **Save in Praxis** · **Keep it in this folder** (CHAT: *Keep it in this chat*) — "Stays in .product/ on this machine" · **Don't ask again**.

Ask a moment only if `praxis status` shows `nudge: true`, the moment is not in `offers_shown`, and `preference` is not `"praxis"`. Then run `praxis offer-shown <moment>` whatever the answer.

**Save in Praxis** (tools not available yet):
1. `praxis prefer praxis` and queue what was just created: `praxis queue add <key> --reason AWAITING_CONNECTION`.
2. Connect, by runtime:
   - **Claude Code** — offer to run `claude mcp add --transport http --scope user praxis https://mcp.getprisma.lat/mcp`, then: "/mcp → praxis → Authenticate".
   - **claude.ai / Cowork** — add the Praxis connector with URL `https://mcp.getprisma.lat/mcp`.
   - **Any other CLI** — `npx product-builder@latest --praxis`.
3. Say: *"Your {artifact} is waiting — it goes to Praxis the moment Praxis responds, in this session or the next."* If Praxis tools appear in this session, drain the queue right away (§1).
   In CHAT mode there's no queue: give the connect step and say to re-run the command once connected; the document stays in the conversation.

**Keep it in this folder** → nothing else. **Don't ask again** → `praxis nudge off`.

**Chose Praxis, still not connected** (`preference: "praxis"`, no tools): no question — one line under the banner: `○ Waiting for Praxis · {N} documents queued · connect: {step for this runtime}`.

---

## 5. Result line (PRAXIS mode)

Print exactly one line right under the workflow's completion banner, in the user's language.

| Situation | Line |
|-----------|------|
| Saved | `✓ Saved in Praxis · {Artifact} v{n} · visible to your team` |
| Other local docs not yet uploaded | append ` · {N} local docs not in Praxis yet → /pm:praxis` |
| Fell back after an error | `○ Praxis unavailable ({reason}) · saved locally and queued → uploads when it's back` |

---

## 6. Fallback queue

When a write fails, or the mode fell back to LOCAL after a Praxis error:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs praxis queue add "<key>" --reason "<error code>"
```

`/pm:praxis` drains the queue and uploads everything `praxis unsynced` reports.

---

## 7. Mirror rule

- The local mirror is always written (PRAXIS and LOCAL modes).
- **Praxis wins.** Never overwrite a Praxis artifact with a stale mirror: if `praxis status` shows a local file as `modified` but `pm_get_changes` shows the artifact also changed in Praxis since the last sync, show both versions to the user and ask which one to keep.
