# Prisma PM

AI-native product management for Claude Code. The complete PM lifecycle — from ideation to measurement — powered by context engineering.

## Install

```bash
npx prisma-pm@latest
```

Installs `/pm:*` slash commands into your Claude Code environment.

## What It Does

Prisma PM transforms product management from coordination theater into architectural thinking. Every command is grounded in a real PM job-to-be-done.

**Core thesis:** Products are transformation engines. People pay for the delta between states — not for features.

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
| `/pm:strategy` | RICE + Product Power → Force-ranked backlog |
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

## The Product Power Formula

```
Product Power = ΔState × Emotional Intensity × Problem Frequency
```

| Tier | Score | Meaning |
|------|-------|---------|
| Low | <100 | Nice-to-have. Hard to monetize. |
| Medium | 100-400 | Viable. Needs strong execution. |
| High | 400-700 | Strong opportunity. Clear willingness to pay. |
| Exceptional | 700+ | Category-defining. Build immediately. |

## How It Works

```
/pm:new → /pm:icp → /pm:persona → /pm:discover → /pm:power
    → /pm:strategy → /pm:validate → /pm:define → /pm:require
```

Each command reads the output of previous commands — context chains automatically. State is tracked in `.product/STATE.md`.

## Project Structure

After `/pm:new`, your workspace looks like:

```
.product/
├── PRODUCT.md          # Vision, transformation thesis
├── ICP.md              # Ideal Customer Profile
├── BACKLOG.md          # Force-ranked initiatives
├── STATE.md            # Current state tracker
├── config.json         # Preferences
├── PERSONAS/           # Synthetic personas
├── DISCOVERY/          # Discovery briefs + validation plans
└── DEFINITIONS/        # PRDs + requirements
```

## Frameworks

Prisma PM includes reference knowledge for:
- **Product Power Formula** — Opportunity scoring
- **Jobs-to-be-Done** — Customer understanding
- **RICE** — Prioritization
- **Amazon PR/FAQ** — Working backwards
- **Opportunity Solution Tree** — Discovery mapping

## Requirements

- Claude Code (CLI)
- Node.js >= 18

## License

MIT
