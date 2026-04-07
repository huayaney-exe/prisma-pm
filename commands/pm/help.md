---
name: pm:help
description: Prisma PM command reference, project state, and getting started guide
allowed-tools:
  - Read
  - Bash
---

<context>
Show available Prisma PM commands, current project state, and contextual guidance.
</context>

<process>
## Step 1: Check for .product/ workspace

Detect which runtime is active by checking this command's execution_context path, then find pm-tools.cjs:

```bash
# Check runtimes in order — use whichever has prisma-pm installed
for DIR in ".claude" ".gemini" ".codex" ".config/opencode" ".opencode"; do
  TOOLS="$HOME/$DIR/skills/prisma-pm/bin/pm-tools.cjs"
  if [ -f "$TOOLS" ]; then
    node "$TOOLS" init help "" --include state,config 2>/dev/null
    break
  fi
done
```

## Step 2: Display Command Reference

```
◆ Prisma PM — AI-Native Product Management

  Product Power = ΔState × Emotional Intensity × Problem Frequency

FOUNDATION (run once per product)
  /pm:new "Name"        Initialize product workspace with vision & transformation thesis
  /pm:icp               Define Ideal Customer Profile with disqualification criteria
  /pm:persona [--count] Generate synthetic personas with JTBD & simulated interviews

DISCOVERY & STRATEGY (run per initiative)
  /pm:discover "problem" Socratic problem exploration → Discovery Brief
  /pm:power "problem"    Product Power Formula calculator (works standalone)
  /pm:strategy           RICE + Product Power ranking → Force-ranked backlog
  /pm:validate "hyp"     Hypothesis → Experiment design → Kill criteria

DEFINITION & DESIGN (run per feature)
  /pm:define "feature"   Problem → PRD with context-engineering blocks
  /pm:design             Design spec — messaging, IA, flows, design system foundations
  /pm:require            PRD → User stories + acceptance criteria → Engineering handoff

UTILITY
  /pm:help               This reference
  /pm:update             Check for and install latest version
```

## Step 3: Show Project State (if .product/ exists)

If a workspace exists, show:
- Product name and current phase
- Active initiatives with their stages
- Recent learnings
- Suggested next action based on current state

```
PROJECT STATE
  Product: {name}
  Phase: {current phase}
  Initiatives: {count} active

  ACTIVE INITIATIVES
  | Initiative | Stage | Power Score |
  |------------|-------|-------------|
  | {name}     | {stage} | {score}   |

  RECENT LEARNINGS
  - {learning 1}
  - {learning 2}

  SUGGESTED NEXT ACTION
  → {contextual suggestion based on state}
```

## Step 4: Show Getting Started (if no .product/ exists)

```
GETTING STARTED
  1. Run /pm:new "Your Product Name" to initialize workspace
  2. Run /pm:icp to define your Ideal Customer Profile
  3. Run /pm:persona to generate synthetic personas
  4. Run /pm:discover "problem" to explore a problem space
  5. Run /pm:power to score opportunities

  Or try /pm:power standalone — no workspace needed!
```

## Step 5: Show Philosophy Reminder

```
PHILOSOPHY
  Products are transformation engines — people pay for the delta between states.
  Context engineering is everything — specs must be self-sufficient for AI implementation.
  Evidence over intuition — measure the transformation, not the output.
```
</process>
