<purpose>
Initialize a new product management workspace through deep, adaptive questioning. This is the most leveraged moment in PM work — the quality of questioning here determines everything downstream. One workflow takes you from idea to a scaffolded .product/ workspace with vision, transformation thesis, and Product Power score.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
See also: @prisma-pm/references/questioning.md for the GSD questioning philosophy.
</required_reading>

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Other" and their response signals they want to describe something in their own words (e.g., "let me describe it", "I'll explain", "something else", or any open-ended reply that isn't choosing/modifying an existing option), you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response

The same applies if YOU include a freeform-indicating option (like "Let me explain") and the user selects it.
</freeform_rule>

<process>

## 1. Setup

**MANDATORY FIRST STEP — Execute before ANY user interaction:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init new "" --include state)
```

Parse JSON for: `product_dir`, `product_exists`, `state`.

**If `product_exists` is true:** Error — product already initialized:

```
╔══════════════════════════════════════════════════════════════╗
║  ERROR                                                       ║
╚══════════════════════════════════════════════════════════════╝

Product workspace already exists at .product/

**To fix:** Use `/pm:help` to see current state, or delete .product/ to start over.
```

**If no product name in $ARGUMENTS:** Ask inline (freeform):

"What's the name of your product?"

## 2. Deep Questioning — Thinking Partner Approach

**Display stage banner:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► INITIALIZING PRODUCT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Philosophy

You are a thinking partner, NOT a checklist walker. The goal is to deeply understand the product vision through natural conversation. You have six dimensions to cover, but you weave through them organically based on what the user shares — not by marching Q1 through Q6.

### Background Context Checklist

Track which dimensions have been covered. You do NOT show this to the user. It is your internal guide to know what still needs exploring.

- [ ] **Transformation** — What before/after state does this product create?
- [ ] **Who** — Who specifically feels this pain most acutely?
- [ ] **Intensity** — How painful is the current state (1-10)?
- [ ] **Frequency** — How often do they encounter this problem (1-10)?
- [ ] **Landscape** — What do people use today? What's broken about it?
- [ ] **Advantage** — What makes this solution fundamentally better?

### Opening: Freeform Start

Begin with a plain text question (NOT AskUserQuestion):

> "Tell me about {Product Name} — what do you want to build, and why does it need to exist?"

This is intentionally open-ended. Let them talk. Their answer will likely touch on multiple dimensions at once. Parse what they share and check off any dimensions their answer already covers.

### Following Threads

After the opening answer, identify:
1. Which dimensions their answer already addressed (even partially)
2. Which dimensions remain uncovered
3. Which parts of their answer deserve deeper exploration

Then continue the conversation adaptively. Use AskUserQuestion for structured choices where options genuinely help the user think. Use plain text for open-ended follow-ups where structure would constrain them.

**Guidelines for when to use AskUserQuestion vs plain text:**
- Use AskUserQuestion when offering distinct directions to explore (structured choices help)
- Use plain text when probing deeper into something they said (freeform is better)
- Use plain text when their previous answer was rich and you want to reflect back and ask a follow-up
- Always respect the freeform_rule above

### Dimension-Specific Guidance

When you need to cover a dimension not yet addressed, use these patterns. Adapt the wording to fit the conversation flow — do not use these verbatim if it would feel robotic.

<dimension name="transformation">
**Transformation** — The before/after state.

If not yet covered, use AskUserQuestion:
- header: "Transform"
- question: "What transformation does {Product Name} enable? What's the undesired state today, and what's the preferred state after?"
- options:
  - "Efficiency gain" — Users waste time/effort on something that could be faster
  - "Pain removal" — Users suffer from a specific problem with no good solution
  - "New capability" — Users can't do something today that they need to do
  - "Let me explain" — I'll describe the transformation in my own words

If they select "Let me explain" or their answer is vague, follow up in plain text: "Make it concrete — what specifically is bad about today? What specifically is better after?"
</dimension>

<dimension name="who">
**Who** — The person who feels this most intensely.

If not yet covered, use AskUserQuestion:
- header: "Who"
- question: "Who specifically experiences this pain? Not 'everyone' — the person who feels it most. What's their role, context, situation?"
- options:
  - "Technical role" — Developer, engineer, data scientist, etc.
  - "Business role" — Manager, founder, analyst, marketer, etc.
  - "End consumer" — Individual user, shopper, learner, etc.
  - "Let me explain" — I have a specific person in mind
</dimension>

<dimension name="intensity">
**Intensity** — How painful the current state is.

If not yet covered, use AskUserQuestion:
- header: "Intensity"
- question: "How painful is their current situation? What evidence supports your rating?"
- options:
  - "1-3: Mild" — Annoying but livable, they work around it easily
  - "4-6: Significant" — Slows them down, they actively complain
  - "7-9: Critical" — Blocks key workflows, costs real money or time
  - "10: Existential" — Business or livelihood at risk without a solution
</dimension>

<dimension name="frequency">
**Frequency** — How often the problem occurs.

If not yet covered, use AskUserQuestion:
- header: "Frequency"
- question: "How often do they hit this problem?"
- options:
  - "Rarely (yearly)" — Rating: 1-2
  - "Monthly" — Rating: 3-5
  - "Weekly" — Rating: 6-8
  - "Constantly" — Rating: 9-10, always present
</dimension>

<dimension name="landscape">
**Landscape** — Current alternatives and their shortcomings.

If not yet covered, use AskUserQuestion:
- header: "Landscape"
- question: "What do people use today to deal with this? What's broken about those solutions?"
- options:
  - "Competitor tools" — They use existing products but those fall short
  - "Manual workarounds" — Spreadsheets, duct-tape processes, human labor
  - "They just suffer" — No real alternative exists, they accept the pain
  - "Let me explain" — I know the landscape well
</dimension>

<dimension name="advantage">
**Advantage** — The fundamental differentiator.

If not yet covered, use AskUserQuestion:
- header: "Advantage"
- question: "What will make your solution fundamentally better? Not incrementally — what makes the old way feel broken once they try yours?"
- options:
  - "Speed/automation" — 10x faster than manual or existing tools
  - "Simplicity" — Dramatically easier to use than alternatives
  - "New approach" — Solves the problem in a fundamentally different way
  - "Let me explain" — I have a specific insight
</dimension>

### Completion Check

Once all six dimensions are covered, briefly summarize your understanding back to the user in plain text. Then proceed to the decision gate.

### Decision Gate — Ready to Create

Use AskUserQuestion:
- header: "Ready?"
- question: "I have a clear picture of your product vision. Ready to create PRODUCT.md?"
- options:
  - "Create PRODUCT.md" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring": identify which dimensions feel thin or have gaps. Probe naturally with follow-up questions (plain text or AskUserQuestion as appropriate). Loop back to this gate when you've gathered more.

Continue until "Create PRODUCT.md" is selected.

## 3. Scaffold Workspace

After the user confirms, scaffold the workspace:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs scaffold "{Product Name}"
```

## 4. Calculate Product Power

Using the user's answers, calculate the Product Power Score:

```
Product Power = ΔState × Emotional Intensity × Problem Frequency
```

Score the three dimensions (each 1-10) based on user answers:
- **ΔState**: From intensity + transformation answers (magnitude of the change)
- **Emotional Intensity**: Derived from transformation + intensity answers (how viscerally they feel it)
- **Problem Frequency**: From frequency answers

Determine tier:

| Tier | Score | Meaning |
|------|-------|---------|
| Low | <100 | Nice-to-have. Hard to monetize. |
| Medium | 100-400 | Viable. Needs strong execution. |
| High | 400-700 | Strong opportunity. |
| Exceptional | 700+ | Category-defining. Build immediately. |

## 5. Write PRODUCT.md

Synthesize all answers into `.product/PRODUCT.md`:

```markdown
---
product: "{Product Name}"
stage: discovering
created: "{ISO date}"
---

# {Product Name}

## Transformation Thesis
**From**: {undesired state — verbatim from user}
**To**: {preferred state — verbatim from user}

## Target User
{Who experiences this pain — from questioning}

## Product Power Score
- **ΔState**: {1-10} — {justification}
- **Emotional Intensity**: {1-10} — {justification}
- **Problem Frequency**: {1-10} — {justification}
- **Score**: {product} — **{tier}**

## Current Landscape
{What exists today and why it falls short}

## Unique Advantage
{Why this product wins — the fundamental differentiator}

## Open Questions
{Any gaps or uncertainties identified during questioning}
```

Do not compress. Capture everything gathered.

## 6. Checkpoint: Review

Display the Product Power Score using ui-brand.md score display format, then present the review gate:

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: Review Required                                 ║
╚══════════════════════════════════════════════════════════════╝
```

Use AskUserQuestion:
- header: "Review"
- question: "Product Power Score: {score} ({tier}). Does the PRODUCT.md look good?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

If "Needs changes": switch to plain text and ask what they want to adjust. Update PRODUCT.md accordingly. Then present this review gate again. Loop until approved (max 3 iterations).

## 7. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "Product initialized: {Product Name} — Power Score: {score} ({tier})"
```

## 8. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► INITIALIZING PRODUCT COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Product Name}** — Power: {score} ({tier})

Transformation: {from} → {to}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Define your Ideal Customer Profile** — precision targeting and disqualification

`/pm:icp`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:persona` — generate synthetic personas (requires ICP first)
- `/pm:discover "problem"` — explore a specific problem space

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/PRODUCT.md` — Vision, transformation thesis, Product Power score
- `.product/BACKLOG.md` — Empty ranked backlog
- `.product/STATE.md` — State tracker with initialization entry
- `.product/config.json` — Default preferences
- Directory structure: `PERSONAS/`, `DISCOVERY/`, `DEFINITIONS/`, `SPRINTS/`, `LAUNCHES/`, `METRICS/`, `RETROS/`

</output>

<success_criteria>

- [ ] Product name captured
- [ ] All 6 dimensions explored through adaptive conversation (not rigid Q1-Q6)
- [ ] Freeform rule respected — plain text used when user wants to explain freely
- [ ] Product Power Score calculated from user responses
- [ ] Decision gate passed — user confirmed readiness to create PRODUCT.md
- [ ] .product/ workspace scaffolded via pm-tools.cjs
- [ ] PRODUCT.md written with full context
- [ ] Review checkpoint: user approved via AskUserQuestion
- [ ] STATE.md updated with initialization entry
- [ ] Next-up block displayed with `/pm:icp` suggestion

</success_criteria>
</content>
</invoke>