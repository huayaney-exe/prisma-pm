<purpose>
Produce a Design Specification that covers the FEEL layer — messaging strategy, CTA hierarchy, information architecture, user flows, AI UX patterns, and design system foundations. This is the artifact that bridges the PRD (what to build) and requirements (how to build it in stories). Spawns design-critic agent for evaluation. The output must be build-ready: a builder should be able to implement the interface without asking "what should this look like?" or "what should this say?"
</purpose>

<required_reading>
Read all files referenced by the invoking command's execution_context before starting.
</required_reading>

<freeform_rule>
When the user wants to explain freely, STOP using AskUserQuestion.

If a user selects "Other" and their response signals freeform intent, you MUST:
1. Ask your follow-up as plain text — NOT via AskUserQuestion
2. Wait for them to type at the normal prompt
3. Resume AskUserQuestion only after processing their freeform response
</freeform_rule>

<process>

## 1. Setup

**MANDATORY FIRST STEP:**

```bash
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init design "{slug}" --include state,product,icp)
```

Parse JSON. Determine scope from $ARGUMENTS:
- `--scope landing` (marketing/landing page focus)
- `--scope product` (in-app experience focus)
- `--scope full` (both — default)

Read PRD if `--from` flag provided or if `.product/DEFINITIONS/{slug}-PRD.md` exists.
Read ICP if `.product/ICP.md` exists.
Read personas if `.product/PERSONAS/*.md` files exist.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DESIGNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Context Gathering

**If PRD exists:**

Use AskUserQuestion:
- header: "Design Focus"
- question: "Your PRD defines the transformation: {from} → {to}. Now let's design how this feels. What's your biggest design concern?"
- options:
  - "Messaging" — How to communicate the value proposition clearly
  - "User flow" — The experience sequence and key interactions
  - "Look & feel" — Visual direction and brand expression
  - "Other" — Something else is top of mind

Follow threads naturally based on the user's response. Keep a background checklist and weave items in naturally as the conversation flows:

- [ ] Brand context — existing identity, visual constraints, tone of voice
- [ ] Audience sophistication — how technical is the ICP? what language do they use?
- [ ] Messaging hierarchy — primary transformation message, supporting messages
- [ ] Competitive visual landscape — what do alternatives look like? where can we differentiate?
- [ ] Key user flows — which flows are highest stakes? where do users drop off?
- [ ] AI UX considerations — any LLM-powered features requiring wait state design?
- [ ] Design system direction — color mood, typography personality, component philosophy

Do NOT march through these sequentially. Pick the most natural next thread based on what the user just said.

**Design-specific probes to weave in:**

*Messaging thread:*
- "If a user lands on this for the first time, what do they need to understand in 5 seconds?"
- "What jargon does your industry use that we should either adopt or kill?"
- "Show me the old world vs. new world — what's the before and after?"

*Flow thread:*
- "Walk me through the first 60 seconds of a new user's experience."
- "Where's the highest-friction moment in this flow?"
- "Is there an AI/LLM component where users will be waiting for results?"

*Brand thread:*
- "Do you have existing brand constraints (colors, typography, tone)?"
- "What's one product whose design quality you admire for this kind of thing?"
- "What visual tropes should we specifically avoid?"

*Design system thread:*
- "Should this feel dense and data-rich, or spacious and editorial?"
- "Rounded and friendly, or sharp and precise?"
- "What personality should the product's voice have?"

**If NO PRD exists:**

Open with a freeform prompt as plain text (NOT AskUserQuestion):

"Tell me about what you want to design. What's the product or feature, who is it for, and what should the experience feel like? Share as much or as little as you want — I'll ask follow-ups."

Wait for the user to respond at the normal prompt. Then follow threads using AskUserQuestion with the same background checklist above.

Continue until the background checklist is substantially covered (at minimum: messaging direction, key user flows, and brand/visual direction).

## 4. Design Synthesis

Before spawning the agent, organize conversation insights into structured design intent:

1. **Messaging strategy** — 4-Question Test answers, headline direction, old/new world framing
2. **CTA hierarchy** — primary actions per section, commitment sequencing
3. **Information architecture** — section order, content types, narrative arc
4. **User flows** — key flows with steps, empty/error/wait states
5. **AI UX requirements** — wait state needs, thinking transparency (if applicable)
6. **Brand constraints** — color direction, typography intent, prohibitions
7. **Design system foundations** — component philosophy, tone of voice, interaction philosophy

This synthesis becomes the input for the design-critic agent.

## 5. Decision Gate

Use AskUserQuestion:
- header: "Ready?"
- question: "I have enough design context for critique. Proceed?"
- options:
  - "Critique it" — Spawn design-critic agent
  - "Keep exploring" — I want to add more design context

If "Keep exploring": return to context gathering, ask what they want to add, then re-present this gate.

If "Critique it": proceed to agent spawning.

## 6. Design Critic Analysis

```
◆ Spawning design-critic agent...
```

```
Agent(
  subagent_type="general-purpose",
  prompt="First, read ~/.claude/skills/prisma-pm/agents/design-critic.md for your role and instructions.

<design_intent>
Messaging Strategy:
{4-Question answers, headline direction, old/new world, jargon map}

CTA Hierarchy:
{primary CTAs per section, commitment sequencing, rules}

Information Architecture:
{section order, content types, narrative arc}

User Flows:
{key flows with steps, empty/error/wait states}

AI UX Requirements:
{wait state needs, thinking transparency — or 'N/A'}

Brand Direction:
{color mood, typography intent, prohibitions, visual continuity}

Design System Foundations:
{component philosophy, tone of voice, interaction philosophy}
</design_intent>

<feature_context>
Feature: {feature name}
Transformation: {from} → {to}
Scope: {landing|product|full}
</feature_context>

<product_context>
{PRODUCT.md summary — transformation thesis, Product Power score}
</product_context>

<icp_context>
{ICP.md summary — demographics, pain intensity, language they use}
</icp_context>

<task>
Perform design critique:
1. Apply 4-Question Test to messaging
2. Audit CTA hierarchy for commitment sequencing
3. Evaluate information architecture against narrative arc
4. Critique user flows for friction, empty/error/wait states
5. Check anti-slop compliance
6. Assess design system coherence
7. Generate priority-ordered recommendations

Return structured analysis in markdown following your output_format.
</task>",
  description="Design critique analysis"
)
```

```
✓ Design critic complete: Critique ready
```

## 7. Write Design Specification

Write `.product/DEFINITIONS/{slug}-DESIGN.md` combining:
- User's design intent from conversation (Steps 3-4)
- Design-critic agent's critique and recommendations (Step 6)
- Template structure from `templates/design-spec.md`

Integrate the agent's critique into the spec:
- Apply critical fixes directly (update messaging, fix CTA hierarchy, etc.)
- Include the critique summary in the "Design Critique Summary" section
- Add remaining recommendations for the builder's consideration
- Surface unresolved decisions in "Open Questions"

## 8. Design Sufficiency Validation

**Iteration loop (max 3):**

Review the Design Spec against the Design Sufficiency Test:

```
──── Design Sufficiency Check 1/3 ────

"Could a builder implement this interface without asking
'what should this look like?' or 'what should this say?'"

- [ ] Messaging passes the 4-Question Test
- [ ] CTA hierarchy defined for each section/screen
- [ ] IA specifies section order with clear purposes
- [ ] User flows cover happy path + error + empty states
- [ ] AI wait states designed (if applicable)
- [ ] Design system foundations established (color, type, components, tone)
- [ ] Anti-slop guardrails specified
```

**If any check fails:**
- Fill the gap by asking the user targeted questions
- Update the Design Spec
- Re-check (up to 3 iterations)

**If all pass after iteration:**
Set `design_sufficient: true` in frontmatter.

**If still failing after 3 iterations:**
Set `design_sufficient: false` and note gaps in Open Questions.

## 9. Checkpoint: Review

Use AskUserQuestion:
- header: "Review"
- question: "Design Spec: {Feature Name} ({scope}). Design Sufficient: {yes/no}. Approve?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

If "Needs changes": update Design Spec based on feedback. Loop until approved (max 3 iterations).

## 10. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state advance-initiative "{slug}" --to designing
```

## 11. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► DESIGN COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Feature Name}** — {scope} Design Specification
Design Sufficient: {yes/no}
Sections: {count} | User Flows: {count}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Write Requirements** — break PRD + Design Spec into implementable stories

`/pm:require --from {slug}`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:define` — refine the PRD
- `/pm:help` — see all commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/DEFINITIONS/{slug}-DESIGN.md` — Design Specification (messaging, IA, flows, design system)

</output>

<success_criteria>

- [ ] PRD loaded if available (provides feature context and transformation)
- [ ] ICP and personas loaded if available (provides audience context and language)
- [ ] Context gathered through thinking-partner conversation (not checklist walking)
- [ ] Design intent synthesized into structured categories before agent spawn
- [ ] Decision gate passed before spawning design-critic
- [ ] Design-critic agent spawned and returned structured critique
- [ ] Critical fixes from critique integrated into the spec
- [ ] Design Spec written with all template sections populated
- [ ] Design Sufficiency validation loop completed (max 3 iterations)
- [ ] 4-Question Test answers are specific (not generic "good product")
- [ ] CTA hierarchy has one primary CTA per section with commitment sequencing
- [ ] Design system foundations are directional and coherent
- [ ] Checkpoint: user reviewed and approved via AskUserQuestion
- [ ] Initiative stage advanced to "designing"
- [ ] Next-up block displayed with `/pm:require` suggestion

</success_criteria>
