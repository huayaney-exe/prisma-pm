# Design Specification Template

Used by `/pm:design` to create `.product/DEFINITIONS/{slug}-DESIGN.md`.

```markdown
---
initiative: "{slug}"
stage: designing
scope: {landing|product|full}
prd_source: "{slug}-PRD.md"
design_sufficient: {true|false}
created: "{ISO date}"
---

# Design Spec: {Feature Name}

## Design Context
**Transformation**: {from} → {to}
**ICP**: {who this is for — in their language}
**Scope**: {landing page | product UI | full}
**Brand Direction**: {visual identity summary — personality, mood, constraints}

## Messaging Strategy

### 4-Question Test Answers
| Question | Answer |
|----------|--------|
| What is this? | {clear, jargon-free answer} |
| Is it for me? | {ICP-specific identification — user sees themselves} |
| Does it work? | {evidence/proof strategy} |
| Is it credible? | {trust signals} |

### Primary Message
**Headline**: {the primary message — aspirational or literal}
**Sub-headline**: {literal explanation if headline is aspirational}
**Old World**: {what the user deals with today — specific, painful}
**New World**: {what life looks like with the product — specific, desirable}

### Jargon Map
| Industry Term | Plain Language Alternative | Rationale |
|--------------|---------------------------|-----------|
| {term} | {what to say instead} | {why the alternative is better} |

## CTA Hierarchy

| Section/Screen | Primary CTA | CTA Text | Commitment Level | Precondition |
|----------------|-------------|----------|------------------|--------------|
| {section} | {action} | {button text} | {low/medium/high} | {what value was shown first} |

### CTA Sequencing Rules
- {Rule 1 — e.g., "No signup prompt before feature tour complete"}
- {Rule 2 — e.g., "Pricing only shown after transformation is clear"}
- {Rule 3 — e.g., "Free trial CTA appears only after proof section"}

## Information Architecture

### Section Map
| # | Section | Purpose | Content Type | Key Message |
|---|---------|---------|-------------|-------------|
| 1 | {section name} | {why this section exists here} | {hero/feature/proof/CTA/nav} | {what it communicates} |
| 2 | {section name} | {purpose} | {type} | {message} |

### Content Hierarchy Rules
- {Rule — e.g., "H1 reserved for primary transformation. No competing H1s."}
- {Rule — e.g., "Social proof follows feature explanation, never precedes it."}
- {Rule — e.g., "Scroll peek: next section visible ~10px above fold."}

## User Flows

### Flow 1: {Flow Name}
**Trigger**: {what initiates this flow}
**Goal**: {what the user accomplishes}

| Step | User Action | System Response | Design Notes |
|------|-------------|-----------------|--------------|
| 1 | {action} | {response} | {messaging/CTA/UX note} |
| 2 | {action} | {response} | {note} |

**Empty State**: {what user sees with no data — messaging, illustration direction, CTA}
**Error State**: {what happens on failure — tone, recovery guidance, fallback}
**Loading/Wait State**: {how processing is communicated — transparency level, user agency}

### Flow 2: {Flow Name}
{same structure}

## AI UX Specification
{Include only if the product has LLM/AI-powered features. Delete this section otherwise.}

### Wait State Design
| AI Action | User Sees | Duration Expectation | Interaction During Wait |
|-----------|-----------|---------------------|------------------------|
| {action} | {what's displayed} | {typical time} | {can user do anything? cancel? explore?} |

### Thinking Transparency
- **Exposed to user**: {which processing steps are visible}
- **Hidden from user**: {which steps are abstracted away}
- **Confirmation points**: {where user input is needed during AI processing}

## Design System Foundations

### Color Direction
{Primary palette intent, accent strategy, neutral tone philosophy. Mood, not hex values.}

### Typography Intent
{Hierarchy structure, personality direction, density preference. Character, not font names.}

### Component Philosophy
{Visual personality: rounded/sharp, dense/spacious, card-based/list-based, etc.}

### Tone of Voice
{How the product speaks: formal/casual, technical/accessible, encouraging/neutral. Examples of good/bad copy.}

### Interaction Philosophy
{Minimal and fast vs rich and explorable? Progressive disclosure vs everything visible?}

### Explicit Prohibitions
- {prohibition — e.g., "No purple gradient backgrounds"}
- {prohibition — e.g., "No generic AI dashboard mockups"}
- {prohibition — e.g., "No stock photography — illustration or real product only"}

### Visual Continuity Rules
- {rule — e.g., "Marketing page and product UI share the same color system"}
- {rule — e.g., "All user avatars processed with consistent filter/style"}

## Design Critique Summary
{From the design-critic agent — integrated into the spec after critique}

### Strengths
- {what works well in the design intent}

### Critical Fixes Applied
1. {what was fixed and why}

### Remaining Recommendations
1. {improvement to consider during implementation}

## Out of Scope
Deferred to builder / frontend-taste skill:
- Specific CSS values (spacing, font sizes, breakpoints, hex colors)
- Animation timing and easing curves
- Component-level hover/focus/active state implementations
- Responsive breakpoint definitions
- Component library selection
- Build tooling and framework choice

## Open Questions
{Unresolved design decisions needing input}
```
