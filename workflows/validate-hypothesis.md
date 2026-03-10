<purpose>
Design fast validation experiments with clear kill criteria. Prevents the "build-first-validate-later" anti-pattern. Spawns experiment-designer agent for experiment design and optionally runs synthetic persona pre-validation. Every experiment must have kill criteria defined BEFORE running — if you can't define what would make you stop, you're not validating, you're confirming.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init validate "{slug}" --include state,personas)
```

Parse JSON. If `--from` flag provided, read `.product/DISCOVERY/{slug}-BRIEF.md` to extract assumptions.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► VALIDATING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Identify Assumptions

**If coming from a discovery brief:**

List all assumptions from the brief's assumptions table:

```
Assumptions from Discovery Brief "{slug}":

| # | Assumption | Risk Level |
|---|-----------|------------|
| A1 | {assumption} | {risk} |
| A2 | {assumption} | {risk} |
```

Use AskUserQuestion:
- header: "Assumptions"
- question: "Which assumptions should we validate? (Start with highest risk)"
- multiSelect: true
- options: [{label: "A1: {assumption}", description: "{risk level}"}]

**If standalone (no discovery brief):**

Ask inline:
"What assumption do you need to validate? Frame it as: 'We believe {assumption}. If true, {consequence}. If false, {alternative}.'"

## 4. Hypothesis Structuring

For each selected assumption, structure a testable hypothesis:

```
**We believe** {target users}
**will** {expected behavior}
**because** {rationale}
**We'll know this is true when** {measurable outcome}
**within** {timeframe}
```

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Required                                 ║
╚══════════════════════════════════════════════════════════════╝

Hypothesis: {structured hypothesis}

──────────────────────────────────────────────────────────────
→ Type "approved" or refine the hypothesis
──────────────────────────────────────────────────────────────
```

Loop until approved (max 3 iterations).

## 5. Experiment Design

Spawn experiment-designer agent:

```
◆ Spawning experiment-designer agent...
```

```
Agent(
  subagent_type="general-purpose",
  prompt="First, read ~/.claude/skills/prisma-pm/agents/experiment-designer.md for your role and instructions.

<hypothesis>
{Structured hypothesis from Step 4}
</hypothesis>

<icp_context>
{ICP.md summary if available}
</icp_context>

<constraints>
{Available resources — time, budget, access to users}
</constraints>

<task>
Design the minimum viable experiment:
1. Select experiment type (survey, landing page, prototype, concierge, Wizard of Oz, A/B test, interview, smoke test)
2. Justify why this type over alternatives (optimize for speed × signal quality)
3. Calculate sample size needed for statistical significance
4. Estimate duration
5. Define success metric with specific threshold
6. Define KILL CRITERIA — what result would make us STOP pursuing this
7. Estimate cost (time + money)
8. Identify potential biases and how to mitigate them

Bias the design toward speed. The fastest experiment that produces a clear signal wins.

Return structured analysis in markdown.
</task>",
  description="Experiment design"
)
```

```
✓ Experiment designer complete: Validation plan ready
```

## 6. Synthetic Persona Pre-Validation (optional)

Check if personas exist:

```bash
PERSONAS=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init validate "" --include personas)
```

**If personas exist:**

Use AskUserQuestion:
- header: "Pre-Validation"
- question: "Run hypothesis against synthetic personas for predictive feedback? (This is NOT real validation — just directional signal)"
- options:
  - "Yes" — Run persona predictions
  - "Skip" — Proceed without

**If "Yes":**

For each persona, predict their response:

```
Persona Pre-Validation:

**{Persona Name}** ({circumstance}):
Predicted response: {positive/negative/mixed}
Confidence: {H/M/L}
Reasoning: {why this persona would/wouldn't exhibit the expected behavior}
```

⚠ Note: This is synthetic prediction, not real data. Document as directional signal only.

## 7. Write Validation Plan

Write `.product/DISCOVERY/{slug}-VALIDATION.md`:

```markdown
---
initiative: "{slug}"
hypothesis_count: {N}
status: designed
created: "{ISO date}"
---

# Validation Plan: {Initiative Name}

## Hypothesis 1
**We believe** {target users}
**will** {expected behavior}
**because** {rationale}
**We'll know this is true when** {measurable outcome}
**within** {timeframe}

### Experiment Design
- **Type**: {experiment type}
- **Rationale**: {why this type}
- **Sample Size**: {N}
- **Duration**: {timeframe}
- **Cost**: {estimate}

### Success Criteria
| Metric | Threshold | Current Baseline |
|--------|-----------|-----------------|
| {metric} | {threshold} | {baseline or "unknown"} |

### Kill Criteria
**If** {condition} **then** we abandon this direction **because** {reasoning}.

### Bias Mitigation
| Bias | Mitigation |
|------|------------|
| {bias 1} | {strategy} |
| {bias 2} | {strategy} |

### Synthetic Persona Predictions
| Persona | Predicted Response | Confidence | Notes |
|---------|-------------------|------------|-------|
| {name} | {positive/negative/mixed} | {H/M/L} | {reasoning} |

## Execution Checklist
- [ ] Recruit participants matching ICP criteria
- [ ] Execute experiment for {duration}
- [ ] Collect data against success metrics
- [ ] Evaluate against kill criteria FIRST
- [ ] Decision: advance to `/pm:define` or pivot

## Next Steps
- [ ] Execute experiment
- [ ] Collect data for {duration}
- [ ] Evaluate against thresholds
- [ ] Decision: advance or pivot
```

## 8. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state advance-initiative "{slug}" --to validating
```

## 9. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► VALIDATION PLAN COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Initiative}** — {hypothesis_count} hypothesis(es) to test
Experiment Type: {type}
Duration: {timeframe}
Kill Criteria: Defined ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Execute the experiment.** Come back with results.

If kill criteria are met → pivot. Don't rationalize.
If success criteria are met → `/pm:define "{slug}"`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:strategy` — rank against other initiatives
- `/pm:discover "new problem"` — explore a different problem
- `/pm:help` — see all commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/DISCOVERY/{slug}-VALIDATION.md` — Validation plan with experiment design and kill criteria

</output>

<success_criteria>

- [ ] Assumptions identified (from discovery brief or user input)
- [ ] Hypotheses structured in testable format
- [ ] Hypothesis checkpoint: user reviewed and approved
- [ ] Experiment-designer agent spawned and returned design
- [ ] Kill criteria defined BEFORE experiment design
- [ ] Bias mitigation strategies identified
- [ ] Synthetic persona predictions run (if personas exist and user opts in)
- [ ] Validation plan written with all sections
- [ ] Initiative stage advanced to "validating"
- [ ] Next-up block displayed with clear decision guidance

</success_criteria>
