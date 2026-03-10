<purpose>
Define the Ideal Customer Profile through thinking-partner questioning. The ICP is the most important targeting document — it defines who you serve AND who you explicitly don't. Every downstream artifact (personas, discovery, messaging, GTM) is grounded in this document. Knowing who you DON'T serve is as important as knowing who you do.
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Other" and their response signals they want to describe something in their own words, you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response
</freeform_rule>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init icp "" --include state,product)
```

Parse JSON. Read `.product/PRODUCT.md` to understand the transformation thesis and target user.

**If PRODUCT.md not found:** Error — run `/pm:new` first.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DEFINING ICP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Open with context from PRODUCT.md as **plain text** (NOT AskUserQuestion):

"Your transformation thesis is: {from} → {to}. Tell me about the person who feels this most intensely."

Wait for the user's freeform response before continuing.

## 3. Thinking-Partner ICP Exploration

**CRITICAL INTERACTION RULE:** Follow threads naturally based on what the user says. Do NOT walk through a checklist. Use `AskUserQuestion` with contextual options that respond to what the user just shared. Each follow-up should feel like a conversation, not an interrogation.

**Background context checklist** (weave these in naturally — don't march through them):
- Demographics (role, org size, industry, geography)
- Circumstance trigger (the moment they become a buyer)
- Behavioral signals (how to find them in the wild)
- Psychographics (decision style, risk tolerance, values)
- Disqualification criteria (who is NOT your customer)
- Willingness to pay (value of the transformation in their terms)

After the user's opening response, follow whatever thread is strongest. Use `AskUserQuestion` with 2-4 concrete options that build on what they just said. Headers must be max 12 characters.

**Example flow** (adapt based on actual responses):

If the user describes a role, follow with circumstance:
Use `AskUserQuestion`:
- header: "Trigger"
- question: "What specific event or frustration makes {role they described} actively seek a solution — not just wish for one?"
- 2-4 concrete options derived from their previous answer

If the user describes a trigger, follow with behavioral signals:
Use `AskUserQuestion`:
- header: "Signals"
- question: "How would you spot this person before they raise their hand? What do they search for, what communities are they in, what tools do they already use?"
- 2-4 concrete options derived from context

If the user describes behaviors, follow with psychographics:
Use `AskUserQuestion`:
- header: "Mindset"
- question: "How does this person make buying decisions? Data-driven or gut feel? Early adopter or wait-and-see?"
- 2-4 concrete options derived from context

When you have enough signal, probe disqualification:
Use `AskUserQuestion`:
- header: "Not Them"
- question: "Who looks like your customer but isn't? What characteristics should disqualify someone even if they seem to fit?"
- 2-4 concrete options derived from context

Push for at least 3 disqualification criteria.

When you have enough signal, probe willingness to pay:
Use `AskUserQuestion`:
- header: "Value"
- question: "What would {role} pay to solve this? What's the transformation worth in their terms — time saved, revenue gained, pain eliminated?"
- 2-4 concrete options derived from context

**Thread-following:** If any answer reveals something worth exploring deeper, use `AskUserQuestion` to probe before moving on. Don't rush to cover all checklist items — depth beats breadth.

## 4. Decision Gate

When all background context areas have been covered (even if out of order), present the decision gate.

Use `AskUserQuestion`:
- header: "Ready?"
- question: "I have a clear picture of your ideal customer. Ready to create ICP.md?"
- options:
  - "Create ICP.md" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring": continue the conversation using `AskUserQuestion` or plain text as appropriate. Return to this gate when the user signals readiness.

## 5. Write ICP.md

Write `.product/ICP.md`:

```markdown
---
product: "{from PRODUCT.md}"
last_updated: "{ISO date}"
---

# Ideal Customer Profile

## Demographics
- **Role/Title**: {from conversation}
- **Organization Size**: {from conversation}
- **Industry**: {from conversation}
- **Geography**: {from conversation}

## Circumstance Trigger
{The moment they become a buyer — specific event or frustration}

## Behavioral Signals
{How to identify them — search terms, communities, tools, content}

## Psychographic Profile
- **Decision Style**: {from conversation}
- **Risk Tolerance**: {from conversation}
- **Values**: {from conversation}

## Pain Intensity Map
| Dimension | Rating (1-10) | Evidence |
|-----------|---------------|----------|
| Severity | {rating} | {evidence} |
| Frequency | {rating} | {evidence} |
| Urgency | {rating} | {evidence} |
| Willingness to Pay | {rating} | {evidence} |

## Disqualification Criteria
{Who is NOT your customer}
- ❌ {criterion 1}
- ❌ {criterion 2}
- ❌ {criterion 3}

## Economic Profile
- **Willingness to Pay**: {from conversation}
- **Value of Transformation**: {from conversation}
- **Budget Authority**: {inferred}
```

## 6. Checkpoint: Review

Use `AskUserQuestion`:
- header: "Review"
- question: "ICP: {role} at {company type}. Trigger: {circumstance}. Approve?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

If "Needs changes": update ICP.md accordingly and ask again. Loop until approved (max 3 iterations).

## 7. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "ICP defined: {one-line summary}"
```

## 8. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DEFINING ICP COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ICP**: {role} at {company type}
**Trigger**: {circumstance}
**Disqualified**: {count} criteria defined

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Generate Synthetic Personas** — create testable user archetypes from your ICP

`/pm:persona`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:discover "problem"` — explore a specific problem space
- `/pm:help` — see all available commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/ICP.md` — Complete Ideal Customer Profile with disqualification criteria

</output>

<success_criteria>

- [ ] PRODUCT.md read for transformation thesis context
- [ ] Opening prompt delivered as plain text with transformation thesis
- [ ] Thinking-partner exploration covers: demographics, circumstance trigger, behavioral signals, psychographics, disqualification, willingness to pay
- [ ] At least 3 disqualification criteria defined
- [ ] Pain intensity map populated with ratings and evidence
- [ ] Decision gate: user confirmed readiness before writing ICP.md
- [ ] ICP.md written with full content
- [ ] Checkpoint: user reviewed and approved via AskUserQuestion
- [ ] STATE.md updated
- [ ] Next-up block displayed with `/pm:persona` suggestion

</success_criteria>
</output>
