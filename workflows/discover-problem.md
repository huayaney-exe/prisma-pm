<purpose>
Explore a problem space through Socratic questioning and multi-agent analysis. This is the core PM discovery workflow — understand before solving. Spawns customer-voice and strategic-advisor agents for deep analysis. Produces a Discovery Brief with JTBD analysis, Product Power score, and assumptions to validate.
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

## 4. Socratic Discovery (5 Layers)

**CRITICAL INTERACTION RULE:** You MUST use the `AskUserQuestion` tool for EVERY question below. Do NOT output questions as plain text. Do NOT continue without receiving the user's actual response via the tool. Ask each question ONE AT A TIME — call `AskUserQuestion`, wait for the response, then proceed to the next question. Follow threads — each answer opens new areas to explore. If an answer is vague, use `AskUserQuestion` again to probe deeper before moving on.

<step name="pain">
**Layer 1 — The Pain**
Use `AskUserQuestion` with question: "Describe the undesired state in concrete terms. Not 'users are frustrated' — what specifically happens that's bad? What does failure look like?"
Provide these options as thought-starters:
- Option 1: "Process failure" — "A workflow or process breaks down or is too slow"
- Option 2: "Information gap" — "Users lack data or visibility they need"
- Option 3: "Cost/waste" — "Resources (time, money, effort) are being wasted"
</step>

<step name="who">
**Layer 2 — The Who**
Use `AskUserQuestion` with question: "Who experiences this most intensely? Connect to your ICP: {reference ICP.md summary}. Is this a primary segment or edge case?"
Provide these options:
- Option 1: "Primary ICP segment" — "Core target user, this is their daily pain"
- Option 2: "Secondary segment" — "Adjacent user who also feels it but less intensely"
- Option 3: "Edge case" — "Niche scenario, not the main audience"
</step>

<step name="frequency">
**Layer 3 — The Frequency & Context**
Use `AskUserQuestion` with question: "How often does this happen? In what context — what are they trying to do when they hit this problem? Walk me through the scenario."
Provide these options:
- Option 1: "Daily or constant" — "Part of their routine, unavoidable"
- Option 2: "Weekly" — "Comes up regularly in specific workflows"
- Option 3: "Monthly or less" — "Occasional but painful when it hits"
</step>

<step name="workarounds">
**Layer 4 — Current Workarounds**
Use `AskUserQuestion` with question: "What do people do today when they hit this problem? Manual workarounds, competitor tools, or just accept the pain? What's the cost of the workaround?"
Provide these options as thought-starters:
- Option 1: "Competitor tools" — "They use existing products but those fall short"
- Option 2: "Manual workarounds" — "Spreadsheets, duct-tape processes, human labor"
- Option 3: "They just suffer" — "No real alternative exists, they accept the pain"
</step>

<step name="transformation">
**Layer 5 — The Transformation**
Use `AskUserQuestion` with question: "If this problem were perfectly solved, what would change for the user? How would their life/work be different? What would they be able to do that they can't today?"
Provide these options as thought-starters:
- Option 1: "Time savings" — "Hours freed up, faster outcomes"
- Option 2: "Better outcomes" — "Higher quality results, fewer errors"
- Option 3: "New possibilities" — "They can do things that were impossible before"
</step>

## 5. Agent Analysis

After collecting all 5 layers, spawn two agents in parallel for deeper analysis:

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
Layer 1 (Pain): {answer}
Layer 2 (Who): {answer}
Layer 3 (Frequency): {answer}
Layer 4 (Workarounds): {answer}
Layer 5 (Transformation): {answer}
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
Layer 1-5 answers: {all answers}
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

Display the Discovery Brief summary, then use `AskUserQuestion` to get approval:

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

Use `AskUserQuestion` with question: "Review the Discovery Brief above. Do you approve?"
Provide these options:
- Option 1: "Approved" — "Everything looks good, proceed"
- Option 2: "Needs changes" — "I'll describe what to adjust (use Other)"

If "Needs changes" or custom input: update brief accordingly and ask again. Loop until approved (max 3 iterations).

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
- [ ] 5-layer Socratic questioning completed
- [ ] Customer-voice agent spawned and returned JTBD analysis
- [ ] Strategic-advisor agent spawned and returned assumption audit
- [ ] Product Power Score calculated with justifications
- [ ] Discovery brief written with all sections populated
- [ ] Assumptions identified with risk levels and validation methods
- [ ] Checkpoint: user reviewed and approved
- [ ] BACKLOG.md updated with new initiative
- [ ] STATE.md updated
- [ ] Next-up block displayed

</success_criteria>
