<purpose>
Explore a problem space through thinking-partner questioning and multi-agent analysis. This is the core PM discovery workflow — understand before solving. Spawns customer-voice and strategic-advisor agents for deep analysis. Produces a Discovery Brief with JTBD analysis, Product Power score, and assumptions to validate.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init discover "{slug}" --include state,backlog,icp,personas,product)
```

Parse JSON. Read `.product/PRODUCT.md`, `ICP.md`, and any existing personas.

**If no slug provided:** Ask inline: "What problem or opportunity do you want to explore?"

Generate slug from their response (lowercase, hyphenated, max 30 chars).

## 2. Anti-Pattern Check

**CRITICAL — Check before proceeding:**

If the user's problem description sounds like a solution (contains words like "build", "create", "add", "implement", "dashboard", "feature"):

```
⚠  Solution detected, not a problem.

You said: "{their description}"

Let's back up: what's the undesired state that makes you think
{their solution} is needed? Who is experiencing this, and how often?
```

Wait for them to reframe as a problem. If they insist on the solution framing, note it as an assumption to validate and proceed.

## 3. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DISCOVERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 4. Thinking-Partner Discovery

### AskUserQuestion Format Rules

Every `AskUserQuestion` call in this workflow MUST follow these rules:
- **header**: max 12 characters
- **options**: 2-4 concrete options, each with a short label + description
- **options style**: interpretations or examples, NOT generic categories — give the user something specific to react to
- Always include an "Other" option so the user can go off-script

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Other" and their response signals they want to describe something in their own words (e.g., "let me describe it", "I'll explain", "something else", or any open-ended reply that isn't choosing/modifying an existing option), you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response
</freeform_rule>

### Opening Question

Start with an open freeform question as **plain text** (NOT AskUserQuestion):

> Tell me about this problem. What's going wrong, for whom, and why does it matter? Just talk — I'll follow up.

Wait for their response.

### Follow the Thread

After the opening response, shift to `AskUserQuestion` to follow threads. Use the **background context checklist** below to track what you've covered — but do NOT walk through it in order. Weave questions naturally based on what the user just said.

**Background Context Checklist** (track internally, not shown to user):
- [ ] **Pain** — concrete undesired state, what failure looks like
- [ ] **Who** — specific person/role, connection to ICP
- [ ] **Frequency** — how often, in what context/workflow
- [ ] **Workarounds** — what they do today, cost of workaround
- [ ] **Transformation** — what "solved" looks like, what changes

**How to follow threads:**

After each answer, pick the most interesting thread to pull. Craft `AskUserQuestion` options that are specific interpretations or examples based on what the user just said — not generic buckets.

Example — if the user mentions "our sales team wastes time on bad leads":

```
AskUserQuestion:
  header: "Bad leads"
  question: "When you say 'bad leads' — what makes a lead bad? Where does the breakdown happen?"
  options:
    - "Wrong fit" — They look good on paper but don't match your ICP once you dig in
    - "Not ready" — They're in your ICP but haven't hit the pain point yet
    - "Junk data" — The lead info itself is incomplete or wrong
    - "Other" — I'll describe it
```

Continue asking follow-up questions until you've covered at least 4 of the 5 checklist items. Each question should build on the previous answer, not jump to an unrelated topic. When a checklist item is naturally covered by something the user already said, check it off — don't ask redundantly.

### Decision Gate

Once you believe you have enough context (4+ checklist items covered), present the decision gate:

Use `AskUserQuestion`:
- header: "Ready?"
- question: "I think I have enough context to analyze this problem. Ready for deep analysis?"
- options:
  - "Analyze it" — Spawn customer-voice and strategic-advisor agents
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring": continue the conversation — ask what else is on their mind, or probe the uncovered checklist items. Loop back to this gate when ready.

If "Analyze it": proceed to Agent Analysis.

## 5. Agent Analysis

<runtime_compatibility>
**Agent spawning is runtime-specific:**
- **Claude Code / Cursor / OpenCode:** Use `Agent()` to spawn both agents in parallel — customer-voice and strategic-advisor run simultaneously
- **Gemini CLI / Codex / Copilot:** Agent tool unavailable. Execute both analyses sequentially inline — read each agent file and follow its full process. Run customer-voice first, then strategic-advisor
</runtime_compatibility>

After the decision gate, perform deeper analysis with two specialist agents:

**If Agent tool is available** (Claude Code, Cursor, OpenCode) — spawn in parallel:

```
◆ Spawning 2 agents in parallel...
  → Customer voice analysis
  → Strategic advisor review
```

**Customer Voice Agent:**

```
Agent(
  subagent_type="general-purpose",
  prompt="First, read ~/.claude/skills/prisma-pm/agents/customer-voice.md for your role and instructions.

<discovery_context>
Problem: {user's problem description}
{All discovery answers collected during thinking-partner conversation, organized by checklist item}
</discovery_context>

<icp_context>
{ICP.md content}
</icp_context>

<persona_context>
{Persona summaries if they exist, otherwise 'No personas generated yet'}
</persona_context>

<task>
Analyze this problem through the customer voice lens:
1. Extract the JTBD (functional, emotional, social)
2. Map the transformation (from → intermediate steps → to)
3. Define hiring/firing criteria for a solution
4. Assess competitive alternatives and their shortcomings
5. Identify unmet needs the user hasn't articulated

Return structured analysis in markdown.
</task>",
  description="Customer voice analysis"
)
```

**Strategic Advisor Agent:**

```
Agent(
  subagent_type="general-purpose",
  prompt="First, read ~/.claude/skills/prisma-pm/agents/strategic-advisor.md for your role and instructions.

<discovery_context>
Problem: {user's problem description}
{All discovery answers collected during thinking-partner conversation}
</discovery_context>

<product_context>
{PRODUCT.md content}
</product_context>

<task>
Challenge this problem framing:
1. Score using Product Power Formula (ΔState × Intensity × Frequency, each 1-10)
2. List all embedded assumptions (minimum 3)
3. Identify adjacent problems that might be more valuable
4. Surface blind spots in this discovery
5. Rate strategic alignment with the product's transformation thesis (1-5)

Return structured analysis in markdown.
</task>",
  description="Strategic advisor review"
)
```

Display completion:
```
✓ Customer voice complete: JTBD analysis ready
✓ Strategic advisor complete: Assumption audit ready
```

**If Agent tool is NOT available** (Gemini, Codex, Copilot) — execute sequentially inline:

**Step 5a: Customer Voice Analysis (inline)**
Read `~/.claude/skills/prisma-pm/agents/customer-voice.md` now. Execute its full process inline:
1. Adopt the customer-voice role
2. Use the discovery context, ICP context, and persona context above as input
3. Follow every step in `<process>` (JTBD extraction, transformation mapping, hiring/firing criteria, alternatives, unmet needs)
4. Validate against `<checkpoints>`
5. Format output per `<output_format>` — store the results for integration into the Discovery Brief

```
✓ Customer voice analysis complete (inline)
```

**Step 5b: Strategic Advisor Review (inline)**
Read `~/.claude/skills/prisma-pm/agents/strategic-advisor.md` now. Execute its full process inline:
1. Adopt the strategic-advisor role
2. Use the discovery context and product context above as input
3. Follow every step in `<process>` (Product Power scoring, assumption audit, blind spots, strategic alignment)
4. Validate against `<checkpoints>`
5. Format output per `<output_format>` — store the results for integration into the Discovery Brief

```
✓ Strategic advisor review complete (inline)
```

## 6. Synthesize Discovery Brief

Combine user answers + agent outputs into `.product/DISCOVERY/{slug}-BRIEF.md`:

```markdown
---
initiative: "{slug}"
stage: discovering
discovered: "{ISO date}"
power_score: {calculated}
jobs_addressed: [{JTBD list}]
assumptions_count: {N}
---

# Discovery Brief: {Problem Title}

## Problem Statement
**From**: {undesired state}
**To**: {preferred state}
**Who**: {target user from ICP}
**Frequency**: {how often}

## Product Power Score
- **ΔState**: {1-10} — {justification}
- **Emotional Intensity**: {1-10} — {justification}
- **Problem Frequency**: {1-10} — {justification}
- **Score**: {product} — **{tier}**

## Jobs-to-be-Done
| Type | Job Statement |
|------|---------------|
| Functional | {from customer voice agent} |
| Emotional | {from customer voice agent} |
| Social | {from customer voice agent} |

## Current Alternatives
| Alternative | Strengths | Weaknesses |
|-------------|-----------|------------|
| {alt 1} | | |
| {alt 2} | | |
| {doing nothing} | | |

## Assumptions to Validate
| # | Assumption | Risk Level | Validation Method |
|---|-----------|------------|-------------------|
| A1 | {assumption} | High/Med/Low | {how to test} |
| A2 | {assumption} | High/Med/Low | {how to test} |

## Transformation Map
{From customer voice agent — from-state → intermediate steps → to-state}

## Blind Spots
{From strategic advisor — what's missing from this analysis}

## Recommended Next Steps
- [ ] Validate assumption A1 via `/pm:validate`
- [ ] Score against backlog via `/pm:strategy`
- [ ] Define solution via `/pm:define`
```

## 7. Checkpoint: Review

Display the Discovery Brief summary:

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Required                                 ║
╚══════════════════════════════════════════════════════════════╝

Discovery Brief Summary:
- Problem: {one-line}
- Power: {score} ({tier})
- JTBD: {functional job}
- Assumptions: {count} identified
- Blind Spots: {count} flagged
```

Use `AskUserQuestion`:
- header: "Review"
- question: "Discovery Brief complete. Power: {score} ({tier}). Approve?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

If "Needs changes": update brief accordingly and present this checkpoint again. Loop until approved (max 3 iterations).

## 8. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-initiative "{problem title}" --power-score {score} --stage discovering
```

## 9. Done

Display Product Power score using ui-brand.md score display format.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DISCOVERY COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Problem Title}** — Power: {score} ({tier})

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Validate Assumptions** — design experiments before committing resources

`/pm:validate --from {slug}`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:strategy` — rank this against other initiatives
- `/pm:define "{slug}"` — skip validation, define solution directly
- `/pm:power` — recalculate Product Power with different inputs

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/DISCOVERY/{slug}-BRIEF.md` — Discovery brief with JTBD, Power score, assumptions
- `.product/BACKLOG.md` — Updated with new initiative

</output>

<success_criteria>

- [ ] Anti-pattern check performed (solution vs. problem framing)
- [ ] Thinking-partner discovery completed (4+ checklist items covered)
- [ ] Freeform rule respected — plain text used when user wants to explain freely
- [ ] Decision gate presented before spawning agents
- [ ] Customer-voice agent spawned and returned JTBD analysis
- [ ] Strategic-advisor agent spawned and returned assumption audit
- [ ] Product Power Score calculated with justifications
- [ ] Discovery brief written with all sections populated
- [ ] Assumptions identified with risk levels and validation methods
- [ ] Checkpoint: user reviewed and approved via AskUserQuestion
- [ ] BACKLOG.md updated with new initiative
- [ ] STATE.md updated
- [ ] Next-up block displayed

</success_criteria>
