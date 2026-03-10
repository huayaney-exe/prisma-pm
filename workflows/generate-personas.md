<purpose>
Generate realistic synthetic personas from ICP and discovery data. Each persona is behaviorally grounded — defined by circumstance and JTBD, not demographic fiction. Spawns persona-architect agent per persona to ensure diversity and depth. Personas include day-in-the-life narratives, simulated interview responses, and predictive feedback capability.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init persona "" --include state,product,icp,personas)
```

Parse JSON. Read `.product/ICP.md` and `.product/PRODUCT.md`.

**If ICP.md not found:** Error — run `/pm:icp` first.

Determine count from $ARGUMENTS:
- `--count N` → generate N personas (default: 3)
- `--for {slug}` → read discovery brief to contextualize personas

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► GENERATING PERSONAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Existing Persona Check

Check for existing personas in `.product/PERSONAS/`:

**If personas already exist:**

"Found {N} existing personas: {names}. New personas will be generated to complement these — varying by different dimensions."

## 4. Spawn Persona Architects

For each persona, spawn a persona-architect agent. Generate in parallel when count > 1.

```
◆ Spawning {count} persona-architect agents...
  → Persona 1/{count}
  → Persona 2/{count}
  → Persona 3/{count}
```

For each persona:

```
Agent(
  subagent_type="general-purpose",
  prompt="First, read ~/.claude/skills/prisma-pm/agents/persona-architect.md for your role and instructions.

<icp_context>
{Full ICP.md content}
</icp_context>

<product_context>
{PRODUCT.md content}
</product_context>

<discovery_context>
{Discovery brief content if --for flag was used, otherwise 'No specific discovery context'}
</discovery_context>

<existing_personas>
{Summary of existing personas if any, otherwise 'None yet'}
</existing_personas>

<task>
Generate persona #{N} of {total}. Each persona must represent a DIFFERENT segment within the ICP.

Vary by these dimensions (ensure no two personas share the same profile):
- Circumstance intensity: desperate vs. frustrated vs. annoyed
- Decision-making style: analytical vs. intuitive vs. consensus-driven
- Technical sophistication: power user vs. competent vs. novice
- Organization context: startup vs. mid-market vs. enterprise
- Adoption tendency: early adopter vs. early majority vs. late majority

The persona must be JTBD-based, not demographic fiction. Define them by their circumstance and what they're trying to accomplish, not by age and hobbies.

Write the complete persona following this structure:

```markdown
---
persona: "{Name}"
segment: "{ICP segment variation}"
pain_intensity: {1-10}
decision_style: "{analytical|intuitive|consensus|authority}"
created: "{ISO date}"
---

# {Name} — {One-line circumstance}

## Circumstance
When [situation], they need [outcome] because [motivation]

## Job-to-be-Done
**Primary JTBD**: {functional job}
**Emotional JTBD**: {how they want to feel}
**Social JTBD**: {how they want to be perceived}

## Day in the Life
{Narrative paragraph showing a typical day where the problem manifests.
Include specific moments of friction, workarounds they use, and
emotional reactions. Make it vivid and concrete — not generic.}

## Decision-Making Profile
- **Information Sources**: {where they research}
- **Buying Triggers**: {what pushes them to act}
- **Objections**: {why they might not buy}
- **Champions vs. Blockers**: {who helps/hinders}

## Simulated Interview

**Q: "Tell me about the last time you experienced {the problem}?"**
A: "{realistic response in their voice — include hesitations, specific details}"

**Q: "What have you tried to solve this?"**
A: "{response showing current workarounds — be specific}"

**Q: "If you could wave a magic wand, what would the ideal solution look like?"**
A: "{response revealing latent needs}"

**Q: "What would make you switch from your current solution?"**
A: "{response showing switching costs and thresholds}"

## Predictive Feedback
{Empty — populated when /pm:validate runs concept tests}
```

Return the complete persona document.
</task>",
  description="Generate persona {N}"
)
```

Display completion for each:
```
✓ Persona {N} complete: {Name} — {one-line circumstance}
```

## 5. Diversity Check

After all personas are generated, verify diversity:

```
──── Diversity Check ────

| Persona | Intensity | Decision | Tech Level | Org | Adoption |
|---------|-----------|----------|------------|-----|----------|
| {Name 1} | {level} | {style} | {level} | {type} | {tendency} |
| {Name 2} | {level} | {style} | {level} | {type} | {tendency} |
| {Name 3} | {level} | {style} | {level} | {type} | {tendency} |

Diversity score: {count of unique dimension combinations} / {total possible}
```

**If two personas are too similar** (share 3+ dimension values):
- Flag the similarity
- Regenerate the less distinct one with explicit differentiation instructions

## 6. Write Persona Files

Write each persona to `.product/PERSONAS/{slugified-name}-PERSONA.md`.

## 7. Checkpoint: Review

Present the summary, then ask for approval:

```
Generated {count} personas:
1. {Name} — {circumstance} (Intensity: {score}/10)
2. {Name} — {circumstance} (Intensity: {score}/10)
3. {Name} — {circumstance} (Intensity: {score}/10)
```

Use AskUserQuestion:
- header: "Review"
- question: "Generated {count} personas covering {dimension spread}. Approve?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Needs changes" and their response signals freeform intent (e.g., "let me describe it", "I'll explain", "something else"), you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response
</freeform_rule>

If changes: regenerate specific personas. Loop until approved (max 3 iterations).

## 8. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "Generated {N} personas: {names}"
```

## 9. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► PERSONAS COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{count} personas generated**

| Persona | JTBD | Intensity |
|---------|------|-----------|
| {Name 1} | {primary job} | {score}/10 |
| {Name 2} | {primary job} | {score}/10 |
| {Name 3} | {primary job} | {score}/10 |

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Discover Problems** — explore problem spaces with your personas as context

`/pm:discover "problem description"`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:validate "hypothesis"` — test concepts against these personas
- `/pm:help` — see all commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/PERSONAS/{name}-PERSONA.md` — One file per generated persona

</output>

<success_criteria>

- [ ] ICP.md and PRODUCT.md read for context
- [ ] Existing personas checked for complementarity
- [ ] Persona-architect agent spawned per persona
- [ ] Each persona is JTBD-based, not demographic fiction
- [ ] Day-in-the-life narratives are vivid and specific
- [ ] Simulated interviews have realistic, voiced responses
- [ ] Diversity check passed (no two personas too similar)
- [ ] All persona files written to PERSONAS/
- [ ] Checkpoint: user reviewed and approved
- [ ] STATE.md updated
- [ ] Next-up block displayed

</success_criteria>
</output>
