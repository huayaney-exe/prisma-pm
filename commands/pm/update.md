---
name: pm:update
description: Update Prisma PM to the latest version
allowed-tools:
  - Read
  - Bash
  - AskUserQuestion
---

<context>
Check for updates and install the latest version of Prisma PM.

Detects whether the current installation is global (~/.claude/) or local (./.claude/) and updates accordingly.
</context>

<process>
## Step 1: Detect Current Installation

Check for the VERSION file and manifest to determine installation type:

```bash
# Check global installation
GLOBAL_VERSION=$(cat ~/.claude/skills/prisma-pm/VERSION 2>/dev/null || echo "not installed")

# Check local installation
LOCAL_VERSION=$(cat ./.claude/skills/prisma-pm/VERSION 2>/dev/null || echo "not installed")
```

Determine which installation exists and its current version.

## Step 2: Check Latest Version

```bash
LATEST=$(npm view prisma-pm version 2>/dev/null || echo "unknown")
```

If the npm package isn't published yet, inform the user and suggest using the git source.

## Step 3: Compare Versions

If current version equals latest:
```
✓ Prisma PM is up to date (v{version})
```
Stop here.

If update available, show:
```
  Prisma PM Update Available

  Installed: v{current}
  Latest:    v{latest}

  This will update all commands, agents, frameworks, and templates.
  Your .product/ workspace data is NOT affected.
```

## Step 4: Confirm and Update

Ask the user to confirm, then run:

```bash
# For global installation
npx prisma-pm@latest --global --force

# For local installation
npx prisma-pm@latest --local --force
```

## Step 5: Verify

```bash
NEW_VERSION=$(cat ~/.claude/skills/prisma-pm/VERSION 2>/dev/null || cat ./.claude/skills/prisma-pm/VERSION 2>/dev/null)
```

Print confirmation:
```
✓ Prisma PM updated to v{new_version}
  Restart Claude Code to load updated commands.
```
</process>
