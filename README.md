```
██████  ██████  ██ ███████ ██   ██  █████
██   ██ ██   ██ ██ ██      ███ ███ ██   ██
██████  ██████  ██ ███████ ██ █ ██ ███████
██      ██  ██  ██      ██ ██   ██ ██   ██
██      ██   ██ ██ ███████ ██   ██ ██   ██
```

# Product Builder

AI-native product management for Claude Code.

## Philosophy

Products are transformation engines — people pay for the delta between states, not for features. PMs are becoming builders: the ones who think clearly, frame precisely, and ship fast will define the next era of product. AI compresses the PM cycle from weeks to hours, making it possible to run 10x more discovery, validate 10x more hypotheses, and iterate 10x faster.

## What It Does

- **Discover** — Socratic problem exploration with 5-layer deep questioning
- **Define ICP** — Ideal Customer Profile with precision targeting and disqualification criteria
- **Generate Personas** — Synthetic personas with JTBD mapping and simulated interviews
- **Write PRDs** — Context-engineered specs that AI can implement without clarifying questions
- **Prioritize** — Force-ranked backlog with RICE + Product Power scoring, no ties allowed
- **Validate** — Experiment design with kill criteria before committing resources
- **Score Problems** — Product Power Formula calculator for any opportunity

## The Product Power Formula

```
Willingness to Pay = ΔState × Emotional Intensity × Problem Frequency
```

- **ΔState** (1-10): How large is the gap between current and desired state?
- **Emotional Intensity** (1-10): How deeply does the user feel this pain?
- **Problem Frequency** (1-10): How often does the user encounter this?

| Score | Tier | Meaning |
|-------|------|---------|
| <100 | Low | Nice-to-have. Hard to monetize. |
| 100-400 | Medium | Viable. Needs strong execution. |
| 400-700 | High | Strong opportunity. Clear willingness to pay. |
| 700+ | Exceptional | Category-defining. Build immediately. |

## Install

```bash
npx product-builder@latest
```

## Commands

### Foundation (run once per product)
| Command | What It Does |
|---------|-------------|
| `/pm:new "Name"` | Initialize product workspace with transformation thesis |
| `/pm:icp` | Define Ideal Customer Profile with disqualification criteria |
| `/pm:persona` | Generate synthetic personas with JTBD and simulated interviews |

### Discovery & Strategy (run per initiative)
| Command | What It Does |
|---------|-------------|
| `/pm:discover "problem"` | Socratic problem exploration → Discovery Brief |
| `/pm:power "problem"` | Product Power Formula calculator (works standalone) |
| `/pm:strategy` | RICE + Product Power → Force-ranked backlog, no ties |
| `/pm:validate "hypothesis"` | Experiment design with kill criteria |

### Definition (run per feature)
| Command | What It Does |
|---------|-------------|
| `/pm:define "feature"` | Context-engineered PRD (lean, full, or one-pager) |
| `/pm:require` | PRD → User stories + acceptance criteria |

### Utility
| Command | What It Does |
|---------|-------------|
| `/pm:help` | Command reference + project state |
| `/pm:update` | Update to latest version |

## Architecture

```
┌─────────────────────────────────────────┐
│  Commands (thin routers)                │
│  /pm:discover, /pm:define, /pm:power... │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Workflows (cognitive engines)          │
│  Socratic loops, RICE scoring,          │
│  context chaining, state management     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Agents (deep specialists)              │
│  Strategic Advisor, Customer Voice,     │
│  Experiment Designer, Persona Architect │
└─────────────────────────────────────────┘
```

Each command reads the output of previous commands — context chains automatically. State is tracked in `.product/STATE.md`.

## Requirements

- [Claude Code](https://claude.ai/code) (CLI)
- Node.js >= 18

## From Latin America

**#VamosLatam** · [getprisma.lat](https://getprisma.lat/product-builder)

## License

MIT
