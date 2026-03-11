<ui_patterns>

Visual patterns for user-facing Prisma PM output. Workflows @-reference this file.

## Stage Banners

Use for major workflow transitions.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PM ► {STAGE NAME}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Stage names (uppercase):**
- `INITIALIZING PRODUCT`
- `DEFINING ICP`
- `GENERATING PERSONAS`
- `DISCOVERING`
- `CALCULATING POWER`
- `RANKING STRATEGY`
- `VALIDATING`
- `DEFINING FEATURE`
- `DESIGNING`
- `WRITING REQUIREMENTS`
- `DISCOVERY COMPLETE ✓`
- `DEFINITION COMPLETE ✓`
- `DESIGN COMPLETE ✓`
- `STRATEGY COMPLETE ✓`

---

## Checkpoint Boxes

User action required. 62-character width.

```
╔══════════════════════════════════════════════════════════════╗
║  CHECKPOINT: {Type}                                          ║
╚══════════════════════════════════════════════════════════════╝

{Content}

──────────────────────────────────────────────────────────────
→ {ACTION PROMPT}
──────────────────────────────────────────────────────────────
```

**Types:**
- `CHECKPOINT: Decision Required` → `→ Select: option-a / option-b / option-c`
- `CHECKPOINT: Review Required` → `→ Type "approved" or describe changes`
- `CHECKPOINT: Context Needed` → `→ Provide the requested information`

---

## Status Symbols

```
✓  Complete / Validated / Approved
✗  Failed / Missing / Blocked
◆  In Progress / Spawning
○  Pending / Not Started
⚠  Warning / Needs Attention
```

---

## Progress Display

**Initiative level:**
```
Progress: ████████░░ 80%
```

**Stage level:**
```
Steps: 3/5 complete
```

---

## Spawning Indicators

```
◆ Spawning customer-voice agent...

◆ Spawning 2 agents in parallel...
  → Customer voice analysis
  → Strategic advisor review

✓ Customer voice complete: JTBD analysis ready
✓ Strategic advisor complete: Assumption audit ready
```

---

## Iteration Loop Display

```
──── Iteration 1/3 ────
{Work performed}
{Quality check result}

──── Iteration 2/3 ────
{Refinement}
{Quality check result: PASS}
```

---

## Next Up Block

Always at end of major completions.

```
───────────────────────────────────────────────────────────────

## ▶ Next Up

**{Stage}** — {one-line description}

`/pm:{command} "{argument}"`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- `/pm:command-1` — description
- `/pm:command-2` — description

───────────────────────────────────────────────────────────────
```

---

## Error Box

```
╔══════════════════════════════════════════════════════════════╗
║  ERROR                                                       ║
╚══════════════════════════════════════════════════════════════╝

{Error description}

**To fix:** {Resolution steps}
```

---

## Product Power Score Display

```
┌──────────────────────────────────────────┐
│  Product Power: {SCORE} ({TIER})         │
│                                          │
│  ΔState:    {X}/10  ██████████░░░░░░░░░  │
│  Intensity: {Y}/10  ████████░░░░░░░░░░░  │
│  Frequency: {Z}/10  ████████████░░░░░░░  │
│                                          │
│  Formula: {X} × {Y} × {Z} = {SCORE}     │
└──────────────────────────────────────────┘
```

**Tiers:**
```
Low:         <100   Nice-to-have
Medium:      100-400 Viable, needs strong execution
High:        400-700 Strong opportunity
Exceptional: 700+   Category-defining
```

---

## Tables

```
| Initiative | Stage | Power | RICE | Rank |
|------------|-------|-------|------|------|
| Auth flow  | ✓     | 720   | 84   | 1    |
| Dashboard  | ◆     | 480   | 72   | 2    |
| Reports    | ○     | 310   | 58   | 3    |
```

---

## Anti-Patterns

- Varying box/banner widths
- Mixing banner styles (`===`, `---`, `***`)
- Skipping `PM ►` prefix in banners
- Random emoji (`🚀`, `✨`, `💫`)
- Missing Next Up block after completions
- Showing raw JSON to the user (format it)

</ui_patterns>
