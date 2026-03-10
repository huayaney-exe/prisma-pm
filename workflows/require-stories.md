<purpose>
Transform a PRD into implementable user stories with full acceptance criteria. Each story must be self-sufficient for AI-assisted implementation — the bridge between PM and engineering. Stories are sized for 1-3 day implementation, include Given/When/Then criteria, example data, and file path hints. Completeness is validated through an iteration loop.
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
INIT=$(node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs init require "{slug}" --include state)
```

Parse JSON. If `--from` flag provided, read that PRD. Otherwise, list available PRDs:

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs file list-definitions
```

If multiple PRDs exist, use AskUserQuestion:
- header: "PRD"
- question: "Which PRD should I break into stories?"
- options: [{label: "{slug}-PRD.md", description: "{feature name}"}]

Read the selected PRD fully.

## 2. Display Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► WRITING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 3. Epic Identification

Group related functionality from the PRD into epics (2-5 epics per PRD is typical).

Present the proposed epic structure:

```
Proposed Epics for {Feature Name}:

1. {Epic 1 Name} — {scope description}
2. {Epic 2 Name} — {scope description}
3. {Epic 3 Name} — {scope description}
```

Use AskUserQuestion:
- header: "Epics"
- question: "Does this epic breakdown work for {Feature Name}?"
- options:
  - "Approved" — Looks good, break into stories
  - "Adjust" — I want to change the epic structure

If adjust: refine epic structure based on feedback.

## 4. Story Breakdown

For each epic, create stories following INVEST criteria:
- **I**ndependent — can be implemented without other stories
- **N**egotiable — implementation approach is flexible
- **V**aluable — delivers user value on its own
- **E**stimable — small enough to estimate confidently
- **S**mall — 1-3 days of implementation work
- **T**estable — has clear acceptance criteria

<step name="story-creation">
For each story, include:

**User Story Statement:**
"**As a** {persona/user type} **I want to** {action} **So that** {outcome tied to JTBD}"

**Acceptance Criteria (Given/When/Then):**
Every story needs at least:
- 1 happy path criterion
- 1 unhappy path criterion (error/edge case)
- Example data with concrete values

**Context Engineering Block:**
- File paths where changes should happen (if known)
- Existing patterns to follow
- Data model impacts
- API changes

**Definition of Done:**
- [ ] Acceptance criteria pass
- [ ] Edge cases handled
- [ ] Error states have user-facing messages
- [ ] Tests written (unit + integration)
- [ ] No regressions
</step>

## 5. Write Requirements

Write `.product/DEFINITIONS/{slug}-REQUIREMENTS.md`:

```markdown
---
initiative: "{slug}"
stage: requiring
prd_source: "{slug}-PRD.md"
epic_count: {N}
story_count: {N}
created: "{ISO date}"
---

# Requirements: {Feature Name}

## Traceability Matrix
| Requirement | PRD Section | User Job | Priority |
|-------------|------------|----------|----------|
| REQ-01 | {section} | {JTBD} | Must Have |
| REQ-02 | {section} | {JTBD} | Must Have |

## Epic 1: {Epic Name}

### REQ-01: {Story Title}
**As a** {persona/user type}
**I want to** {action}
**So that** {outcome tied to JTBD}

**Acceptance Criteria:**

**AC-01a: Happy Path**
**Given** {precondition with example data}
**When** {action with specific values}
**Then** {observable result with expected values}

**AC-01b: Error Handling**
**Given** {error precondition}
**When** {action that triggers error}
**Then** {error behavior — user message, recovery path}

**Example Data:**
| Field | Example Value | Notes |
|-------|---------------|-------|
| {field} | {concrete value} | {constraints} |

**Technical Context:**
- File path: `{where changes go}`
- Pattern: `{existing pattern to follow}`
- Dependencies: `{what this needs}`

**Definition of Done:**
- [ ] AC-01a passes
- [ ] AC-01b passes
- [ ] Unit tests written
- [ ] No regressions

---

{Continue for all stories in all epics}

## Implementation Notes
{Cross-cutting concerns, sequencing dependencies, technical decisions}

## Story Map
| Epic | Must Have | Should Have | Could Have |
|------|-----------|-------------|------------|
| {epic 1} | REQ-01, REQ-02 | REQ-03 | REQ-04 |
```

## 6. Completeness Validation

**Iteration loop (max 3):**

```
──── Completeness Check 1/3 ────
```

Check:
- [ ] Every PRD acceptance criterion maps to at least one story
- [ ] Every story has happy + unhappy path criteria
- [ ] Every story includes example data
- [ ] No story is larger than 3 days of work
- [ ] Requirements trace to user jobs, not stakeholder wishes
- [ ] MoSCoW priorities assigned

**If any check fails:**
- Identify the gap
- Fix it (split large stories, add missing criteria, add example data)
- Re-check

```
──── Completeness Check 2/3 ────
{All checks pass: PASS}
```

## 7. Checkpoint: Review

Use AskUserQuestion:
- header: "Review"
- question: "Requirements: {story_count} stories across {epic_count} epics. Approve?"
- options:
  - "Approved" — Looks good, proceed
  - "Needs changes" — I'll describe what to adjust

If changes: update requirements. Loop until approved (max 3 iterations).

## 8. Update State

```bash
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state advance-initiative "{slug}" --to requiring
node ~/.claude/skills/prisma-pm/bin/pm-tools.cjs state add-learning "Requirements: {N} stories across {M} epics for {slug}"
```

## 9. Done

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► REQUIREMENTS COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**{Feature Name}** — {story_count} stories across {epic_count} epics
Must Have: {count} | Should Have: {count} | Could Have: {count}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Hand off to Engineering** — these requirements are implementation-ready

`/gsd:new-project` — use GSD to implement from these requirements

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:strategy` — rank initiative priority
- `/pm:help` — see all commands

───────────────────────────────────────────────────────────────
```

</process>

<output>

- `.product/DEFINITIONS/{slug}-REQUIREMENTS.md` — User stories with acceptance criteria

</output>

<success_criteria>

- [ ] PRD loaded and understood
- [ ] Epic structure proposed and approved via checkpoint
- [ ] Stories follow INVEST criteria
- [ ] Every story has Given/When/Then acceptance criteria
- [ ] Every story has example data with concrete values
- [ ] Unhappy paths included for every story
- [ ] Traceability matrix links stories to PRD sections and user jobs
- [ ] Completeness validation loop passed (max 3 iterations)
- [ ] MoSCoW priorities assigned
- [ ] Story map created
- [ ] Checkpoint: user reviewed and approved
- [ ] Initiative stage advanced to "requiring"
- [ ] Next-up block displayed

</success_criteria>
