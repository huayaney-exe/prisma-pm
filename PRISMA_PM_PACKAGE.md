# Prisma Product Management — npx-installable Claude Code Skill

## What This Is

An npm package that installs product management skills, agents, and frameworks into `~/.claude/` via a single command:

```bash
npx prisma-pm@latest
```

Modeled after [get-shit-done-cc](https://github.com/gsd-build/get-shit-done) but focused on product management workflows instead of software delivery.

---

## Package Architecture

```
prisma-pm/
├── bin/
│   └── install.js              # CLI entry point — handles all installation logic
├── commands/
│   └── pm/                     # All skills: /pm:discover, /pm:define, etc.
│       ├── <command>.md         # Each file = one skill with YAML frontmatter
│       └── ...
├── agents/                     # Multi-step agent definitions
│   ├── <agent-name>.md         # Each file = one agent spec
│   └── ...
├── frameworks/                 # PM frameworks (RAÍZ, JTBD, etc.)
│   └── ...
├── templates/                  # PRD templates, experiment briefs, etc.
│   └── ...
├── context/                    # Optional: example context structure
│   └── README.md               # Explains how users should populate /context
├── package.json
├── README.md
└── LICENSE
```

---

## package.json

```json
{
  "name": "prisma-pm",
  "version": "0.1.0",
  "description": "Product management copilot for Claude Code",
  "bin": {
    "prisma-pm": "bin/install.js"
  },
  "files": [
    "bin/",
    "commands/",
    "agents/",
    "frameworks/",
    "templates/"
  ],
  "engines": {
    "node": ">=16.7.0"
  },
  "keywords": [
    "claude-code",
    "product-management",
    "ai-copilot",
    "claude-skills"
  ],
  "license": "MIT"
}
```

**Key fields:**
- `bin` — maps the `prisma-pm` CLI command to `bin/install.js`. This is what `npx` executes.
- `files` — only these directories get published to npm. Everything else (tests, CI, dev configs) is excluded.

---

## bin/install.js — The Installer

This is the only code in the entire package. Everything else is markdown content.

### What It Does

```
npx prisma-pm@latest
    │
    ▼
1. Parse CLI flags (--global, --local, --uninstall)
    │
    ▼
2. Prompt user: "Install globally (~/.claude/) or locally (./.claude/)?"
    │
    ▼
3. Determine target directories:
   - commands/pm/   → <target>/commands/pm/
   - agents/        → <target>/agents/
   - frameworks/    → <target>/frameworks/
   - templates/     → <target>/templates/
    │
    ▼
4. Backup existing user modifications (if updating)
    │
    ▼
5. Copy files with path replacement
   (adjust internal @references to match install location)
    │
    ▼
6. Write prisma-pm-manifest.json (tracks installed files for updates)
    │
    ▼
7. Print success message + next steps
```

### Skeleton Implementation

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

const PACKAGE_ROOT = path.join(__dirname, '..');
const MANIFEST_NAME = 'prisma-pm-manifest.json';

// ── CLI Flags ──────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  global: args.includes('--global'),
  local: args.includes('--local'),
  uninstall: args.includes('--uninstall'),
};

// ── Target Directory ───────────────────────────────────
function getGlobalDir() {
  return path.join(os.homedir(), '.claude');
}

function getLocalDir() {
  return path.join(process.cwd(), '.claude');
}

async function promptInstallLocation() {
  if (flags.global) return getGlobalDir();
  if (flags.local) return getLocalDir();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\nInstall globally (~/.claude/) or locally (./.claude/)? [g/l]: ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase().startsWith('l') ? getLocalDir() : getGlobalDir());
      }
    );
  });
}

// ── File Operations ────────────────────────────────────
function copyRecursive(src, dest, manifest) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, manifest);
    } else {
      let content = fs.readFileSync(srcPath, 'utf-8');
      // Path replacement logic goes here if needed
      fs.writeFileSync(destPath, content);
      manifest.push(path.relative(dest, destPath));
    }
  }
}

// ── Uninstall ──────────────────────────────────────────
function uninstall(targetDir) {
  const manifestPath = path.join(targetDir, MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) {
    console.log('No Prisma PM installation found.');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  for (const file of manifest.files) {
    const fp = path.join(targetDir, file);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  fs.unlinkSync(manifestPath);
  console.log('Prisma PM uninstalled.');
}

// ── Main ───────────────────────────────────────────────
async function main() {
  console.log('\n◆ Prisma Product Management — Installer\n');

  const targetDir = await promptInstallLocation();

  if (flags.uninstall) {
    uninstall(targetDir);
    return;
  }

  const manifest = [];

  // Directories to install
  const dirs = [
    { src: 'commands', dest: 'commands' },
    { src: 'agents', dest: 'agents' },
    { src: 'frameworks', dest: 'frameworks' },
    { src: 'templates', dest: 'templates' },
  ];

  for (const { src, dest } of dirs) {
    copyRecursive(
      path.join(PACKAGE_ROOT, src),
      path.join(targetDir, dest),
      manifest
    );
  }

  // Write manifest
  fs.writeFileSync(
    path.join(targetDir, MANIFEST_NAME),
    JSON.stringify({ version: require('../package.json').version, files: manifest }, null, 2)
  );

  console.log(`\n✓ Installed to ${targetDir}`);
  console.log(`  ${manifest.length} files copied\n`);
  console.log('Next steps:');
  console.log('  1. Open Claude Code');
  console.log('  2. Run /pm:help to see available commands\n');
}

main().catch(console.error);
```

---

## How Skills Are Defined

Each skill is a `.md` file in `commands/pm/` with YAML frontmatter. Claude Code auto-discovers them — no registry needed.

```yaml
---
name: pm:discover
description: Interactive requirements discovery through Socratic dialogue
argument-hint: "<topic or problem space>"
allowed-tools:
  - Read
  - Write
  - Grep
  - Glob
  - Bash
  - Agent
  - TodoWrite
  - AskUserQuestion
---

# Objective
[What this command does]

# Process
[Step-by-step workflow]

# Output
[What gets produced]
```

**Naming convention:** All commands use the `pm:` namespace → appear as `/pm:discover`, `/pm:define`, `/pm:validate`, etc.

---

## How Agents Are Defined

Each agent is a `.md` file in `agents/`. Referenced from skills via the `Agent` tool with `subagent_type`.

```markdown
# Agent: pm-strategic-advisor

## Role
[What this agent does]

## Context Files
[What it reads before analyzing]

## Process
[How it works]

## Output Format
[What it returns]
```

**Registration:** Agents are registered in Claude Code's `settings.json` or `.claude/settings.json` under the `agentConfig` key. The installer can optionally merge these entries.

---

## Installation Targets

```
~/.claude/
├── commands/
│   └── pm/                    ← Skills go here
│       ├── discover.md
│       ├── define.md
│       ├── validate.md
│       └── help.md
├── agents/                    ← Agents go here
│   ├── pm-strategic-advisor.md
│   ├── pm-experiment-designer.md
│   └── pm-customer-voice.md
├── frameworks/                ← Frameworks go here
│   ├── jtbd.md
│   └── raiz.md
├── templates/                 ← Templates go here
│   ├── prd-amazon-prfaq.md
│   └── experiment-brief.md
└── prisma-pm-manifest.json    ← Tracks installed files
```

---

## Publishing to npm

```bash
# 1. Create npm account (if needed)
npm adduser

# 2. From the package root:
npm publish

# 3. Users install with:
npx prisma-pm@latest

# 4. To update, bump version and publish again:
npm version patch
npm publish
```

---

## Update Flow

```
npx prisma-pm@latest     (user runs update)
    │
    ▼
install.js reads existing prisma-pm-manifest.json
    │
    ▼
Backs up user-modified files (diff check against manifest hash)
    │
    ▼
Overwrites with new version
    │
    ▼
Writes updated manifest with new version
    │
    ▼
Reports: "Updated 0.1.0 → 0.2.0 — 3 new commands, 1 updated agent"
```

For robustness, store file hashes in the manifest so the installer can detect user modifications and back them up before overwriting.

---

## Development Workflow

```bash
# Local development — test without publishing
cd prisma-pm/
node bin/install.js --local

# Test in Claude Code
# → /pm:help should appear

# When ready to publish
npm version patch
npm publish
```

---

## Differences from GSD

| Aspect | GSD | Prisma PM |
|--------|-----|-----------|
| Domain | Software delivery | Product management |
| Namespace | `/gsd:*` | `/pm:*` |
| State files | `.planning/` (PLAN.md, STATE.md) | TBD by user |
| Agents | Executor, planner, debugger | Strategic advisor, experiment designer, customer voice |
| Extras | Git hooks, wave execution | Frameworks, PRD templates, context structure |
| Multi-runtime | Claude, OpenCode, Gemini, Codex | Claude Code only (v1) |

---

## Repo Setup Checklist

- [ ] Create GitHub repo `prisma-pm/prisma-pm`
- [ ] Scaffold directory structure (bin/, commands/pm/, agents/, frameworks/, templates/)
- [ ] Write `bin/install.js` (start from skeleton above)
- [ ] Add `package.json` with bin/files config
- [ ] Create `/pm:help` command (first skill)
- [ ] Add one agent as proof of concept
- [ ] Test locally: `node bin/install.js --local`
- [ ] Verify skills appear in Claude Code
- [ ] `npm publish` — test `npx prisma-pm@latest`
- [ ] Add README with installation instructions
- [ ] Populate commands, agents, frameworks, templates (iterative)

---

## Next Steps (User-Driven)

The following will be defined by the user and added to this package:

- **Commands** — the `/pm:*` skill definitions and their workflows
- **Agents** — specialized agent prompts for each PM function
- **Frameworks** — PM frameworks to bundle
- **Templates** — PRD and document templates
- **Context structure** — how users should organize their organizational context
