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

Detects whether the current installation is global or local, and which runtime it targets (Claude Code, Gemini CLI, Codex, OpenCode).
</context>

<process>
## Step 1: Detect Current Installation

Derive `PREFERRED_RUNTIME` from this command's execution_context path:
- Path contains `/.codex/` -> `codex`
- Path contains `/.gemini/` -> `gemini`
- Path contains `/.config/opencode/` or `/.opencode/` -> `opencode`
- Otherwise -> `claude`

Check for the VERSION file and manifest to determine installation type:

```bash
# Runtime config directories to check
RUNTIME_DIRS=( "claude:.claude" "opencode:.config/opencode" "opencode:.opencode" "gemini:.gemini" "codex:.codex" )

# Check local first
LOCAL_VERSION="not installed"
LOCAL_DIR=""
LOCAL_RUNTIME=""
for entry in "${RUNTIME_DIRS[@]}"; do
  runtime="${entry%%:*}"
  dir="${entry#*:}"
  if [ -f "./$dir/skills/prisma-pm/VERSION" ]; then
    LOCAL_VERSION=$(cat "./$dir/skills/prisma-pm/VERSION" 2>/dev/null)
    LOCAL_DIR="./$dir"
    LOCAL_RUNTIME="$runtime"
    break
  fi
done

# Check global
GLOBAL_VERSION="not installed"
GLOBAL_DIR=""
GLOBAL_RUNTIME=""
for entry in "${RUNTIME_DIRS[@]}"; do
  runtime="${entry%%:*}"
  dir="${entry#*:}"
  if [ -f "$HOME/$dir/skills/prisma-pm/VERSION" ]; then
    GLOBAL_VERSION=$(cat "$HOME/$dir/skills/prisma-pm/VERSION" 2>/dev/null)
    GLOBAL_DIR="$HOME/$dir"
    GLOBAL_RUNTIME="$runtime"
    break
  fi
done

echo "Local: $LOCAL_VERSION ($LOCAL_RUNTIME) | Global: $GLOBAL_VERSION ($GLOBAL_RUNTIME)"
```

Use whichever installation exists. Prefer local if both exist.

## Step 2: Check Latest Version

```bash
LATEST=$(npm view product-builder version 2>/dev/null || echo "unknown")
echo "Latest: $LATEST"
```

## Step 3: Compare Versions

If current version equals latest:
```
✓ Prisma PM is up to date (v{version})
```
Stop here.

If update available, show:
```
  Prisma PM Update Available

  Installed: v{current} ({runtime_name})
  Latest:    v{latest}

  This will update all commands, agents, frameworks, and templates.
  Your .product/ workspace data is NOT affected.
```

## Step 4: Confirm and Update

Ask the user to confirm, then run with the correct runtime flag:

```bash
# For global installation — include runtime flag
npx product-builder@latest --global --{runtime} --force

# For local installation — include runtime flag
npx product-builder@latest --local --{runtime} --force
```

## Step 5: Verify

```bash
# Read new version from the detected location
NEW_VERSION=$(cat "{detected_dir}/skills/prisma-pm/VERSION" 2>/dev/null)
echo "Updated to: $NEW_VERSION"
```

Print confirmation:
```
✓ Prisma PM updated to v{new_version}
  Restart your CLI session to load updated commands.
```

## Step 6: Clear Update Cache

Remove the update cache so the statusline alert disappears. Check all possible runtime cache locations:

```bash
rm -f ~/.claude/cache/pb-update-check.json
rm -f ~/.gemini/cache/pb-update-check.json
rm -f ~/.codex/cache/pb-update-check.json
rm -f ~/.config/opencode/cache/pb-update-check.json
rm -f ~/.opencode/cache/pb-update-check.json
rm -f ./.claude/cache/pb-update-check.json 2>/dev/null
```
</process>
