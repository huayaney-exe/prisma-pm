#!/usr/bin/env node
// pb-hook-version: 0.3.0
// Check for Product Builder updates in background, write result to cache
// Called by SessionStart hook - runs once per session
// Supports multi-runtime detection (Claude Code, Gemini CLI, Codex, OpenCode)

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const homeDir = os.homedir();
const cwd = process.cwd();

// Detect runtime config directory (supports Claude, Gemini, Codex, OpenCode)
function detectConfigDir(baseDir) {
  // Check env override first
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir && fs.existsSync(path.join(envDir, 'skills', 'prisma-pm', 'VERSION'))) {
    return envDir;
  }
  // Scan known runtime dirs for prisma-pm installation
  for (const dir of ['.config/opencode', '.opencode', '.gemini', '.codex', '.claude']) {
    const candidate = path.join(baseDir, dir);
    if (fs.existsSync(path.join(candidate, 'skills', 'prisma-pm', 'VERSION'))) {
      return candidate;
    }
  }
  return envDir || path.join(baseDir, '.claude');
}

const globalConfigDir = detectConfigDir(homeDir);
const projectConfigDir = detectConfigDir(cwd);
const cacheDir = path.join(globalConfigDir, 'cache');
const cacheFile = path.join(cacheDir, 'pb-update-check.json');

// VERSION file locations (check project first, then global)
const projectVersionFile = path.join(projectConfigDir, 'skills', 'prisma-pm', 'VERSION');
const globalVersionFile = path.join(globalConfigDir, 'skills', 'prisma-pm', 'VERSION');

// Ensure cache directory exists
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

// Run check in background (spawn detached process)
const child = spawn(process.execPath, ['-e', `
  const fs = require('fs');
  const { execSync } = require('child_process');

  const cacheFile = ${JSON.stringify(cacheFile)};
  const projectVersionFile = ${JSON.stringify(projectVersionFile)};
  const globalVersionFile = ${JSON.stringify(globalVersionFile)};

  // Check project directory first (local install), then global
  let installed = '0.0.0';
  try {
    if (fs.existsSync(projectVersionFile)) {
      installed = fs.readFileSync(projectVersionFile, 'utf8').trim();
    } else if (fs.existsSync(globalVersionFile)) {
      installed = fs.readFileSync(globalVersionFile, 'utf8').trim();
    }
  } catch (e) {}

  let latest = null;
  try {
    latest = execSync('npm view product-builder version', {
      encoding: 'utf8', timeout: 10000, windowsHide: true
    }).trim();
  } catch (e) {}

  const result = {
    update_available: latest && installed !== latest,
    installed,
    latest: latest || 'unknown',
    checked: Math.floor(Date.now() / 1000)
  };

  fs.writeFileSync(cacheFile, JSON.stringify(result));
`], {
  stdio: 'ignore',
  windowsHide: true,
  detached: true
});

child.unref();
