#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const crypto = require('crypto');

const PACKAGE_ROOT = path.join(__dirname, '..');
const MANIFEST_NAME = 'prisma-pm-manifest.json';
const VERSION = require('../package.json').version;

// ── ANSI Colors ───────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(msg) { console.log(msg); }
function logGreen(msg) { log(`${c.green}${msg}${c.reset}`); }
function logYellow(msg) { log(`${c.yellow}${msg}${c.reset}`); }
function logRed(msg) { log(`${c.red}${msg}${c.reset}`); }
function logBold(msg) { log(`${c.bold}${msg}${c.reset}`); }

// ── Supported Runtimes ───────────────────────────────
const RUNTIMES = {
  claude: {
    name: 'Claude Code',
    dirs: ['.claude'],
    env: ['CLAUDE_CONFIG_DIR'],
    supportsHooks: true,
    supportsStatusLine: true,
  },
  gemini: {
    name: 'Gemini CLI',
    dirs: ['.gemini'],
    env: ['GEMINI_CONFIG_DIR'],
    supportsHooks: false,
    supportsStatusLine: false,
  },
  codex: {
    name: 'Codex',
    dirs: ['.codex'],
    env: ['CODEX_HOME'],
    supportsHooks: false,
    supportsStatusLine: false,
  },
  opencode: {
    name: 'OpenCode',
    dirs: ['.config/opencode', '.opencode'],
    env: ['OPENCODE_CONFIG_DIR', 'OPENCODE_CONFIG'],
    supportsHooks: false,
    supportsStatusLine: false,
  },
};

// ── CLI Flags ─────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  global: args.includes('--global'),
  local: args.includes('--local'),
  uninstall: args.includes('--uninstall'),
  force: args.includes('--force'),
  help: args.includes('--help') || args.includes('-h'),
  // Runtime flags
  claude: args.includes('--claude'),
  gemini: args.includes('--gemini'),
  codex: args.includes('--codex'),
  opencode: args.includes('--opencode'),
};

// ── Help ──────────────────────────────────────────────
if (flags.help) {
  log('');
  logBold('  Product Builder — Transformation-Driven Product Engineering');
  log('');
  log('  Usage:');
  log('    npx product-builder@latest              Install (interactive)');
  log('    npx product-builder@latest --global     Install globally');
  log('    npx product-builder@latest --local      Install to project');
  log('    npx product-builder@latest --uninstall  Remove installed files');
  log('    npx product-builder@latest --force      Overwrite without prompting');
  log('');
  log('  Runtime targets:');
  log('    --claude      Claude Code   (~/.claude/)');
  log('    --gemini      Gemini CLI    (~/.gemini/)');
  log('    --codex       Codex         (~/.codex/)');
  log('    --opencode    OpenCode      (~/.config/opencode/)');
  log('');
  log('  If no runtime flag is provided, auto-detects installed CLIs.');
  log('');
  process.exit(0);
}

// ── Runtime Detection ─────────────────────────────────
function detectInstalledRuntimes(scope) {
  const detected = [];
  // Check global first, then local. If both exist for the same runtime, prefer scope.
  const baseDirs = scope === 'local'
    ? [process.cwd(), os.homedir()]
    : [os.homedir(), process.cwd()];

  const seen = new Set();

  // Check env var overrides first (e.g. CLAUDE_CONFIG_DIR)
  for (const [id, runtime] of Object.entries(RUNTIMES)) {
    for (const envVar of runtime.env) {
      const envPath = process.env[envVar];
      if (envPath && fs.existsSync(envPath)) {
        detected.push({ id, ...runtime, configDir: envPath, relDir: path.relative(os.homedir(), envPath) || envPath });
        seen.add(id);
        break;
      }
    }
  }

  // Then scan filesystem
  for (const baseDir of baseDirs) {
    for (const [id, runtime] of Object.entries(RUNTIMES)) {
      if (seen.has(id)) continue;
      for (const dir of runtime.dirs) {
        const fullPath = path.join(baseDir, dir);
        if (fs.existsSync(fullPath)) {
          detected.push({ id, ...runtime, configDir: fullPath, relDir: dir });
          seen.add(id);
          break;
        }
      }
    }
  }

  return detected;
}

function getExplicitRuntime() {
  for (const [id, runtime] of Object.entries(RUNTIMES)) {
    if (!flags[id]) continue;
    for (const dir of runtime.dirs) {
      const globalPath = path.join(os.homedir(), dir);
      const localPath = path.join(process.cwd(), dir);
      // Prefer local when --local is set
      if (flags.local && fs.existsSync(localPath)) {
        return { id, ...runtime, configDir: localPath, relDir: dir };
      }
      // Check global first, fall back to local
      if (fs.existsSync(globalPath)) {
        return { id, ...runtime, configDir: globalPath, relDir: dir };
      }
      if (fs.existsSync(localPath)) {
        return { id, ...runtime, configDir: localPath, relDir: dir };
      }
    }
    logRed(`  ✗ ${runtime.name} not found (~/${runtime.dirs[0]}/ doesn't exist)`);
    log(`    Install ${runtime.name} first, then re-run this installer.`);
    process.exit(1);
  }
  return null;
}

async function selectRuntime() {
  // 1. Check for explicit runtime flag
  const explicit = getExplicitRuntime();
  if (explicit) return explicit;

  // 2. Auto-detect installed runtimes
  const scope = flags.local ? 'local' : 'global';
  const detected = detectInstalledRuntimes(scope);

  if (detected.length === 0) {
    logRed('  ✗ No supported AI CLI found.');
    log('');
    log('  Supported runtimes:');
    for (const [id, rt] of Object.entries(RUNTIMES)) {
      log(`    ${c.cyan}--${id}${c.reset}  ${rt.name}  ${c.dim}(~/${rt.dirs[0]}/)${c.reset}`);
    }
    log('');
    log('  Install one of the above, then re-run this installer.');
    process.exit(1);
  }

  if (detected.length === 1) {
    log(`  ${c.dim}Detected:${c.reset} ${detected[0].name}`);
    return detected[0];
  }

  // 3. Interactive selector for multiple runtimes
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    log(`  ${c.bold}Detected AI CLIs:${c.reset}`);
    log('');
    detected.forEach((r, i) => {
      const marker = i === 0 ? ` ${c.dim}(default)${c.reset}` : '';
      log(`    ${c.cyan}${i + 1}${c.reset}  ${r.name} ${c.dim}~/${r.relDir}/${c.reset}${marker}`);
    });
    log('');
    rl.question(`  Select target [${c.bold}1${c.reset}]: `, (answer) => {
      rl.close();
      const idx = parseInt(answer || '1', 10) - 1;
      const selected = detected[Math.max(0, Math.min(idx, detected.length - 1))];
      log(`  ${c.dim}Installing to:${c.reset} ${selected.name}`);
      resolve(selected);
    });
  });
}

// ── Scope (Global / Local) ───────────────────────────
async function resolveTarget(runtime) {
  if (flags.global) return runtime.configDir;
  if (flags.local) {
    // For local, resolve relative to cwd
    for (const dir of runtime.dirs) {
      const localPath = path.join(process.cwd(), dir);
      if (fs.existsSync(localPath)) return localPath;
    }
    // Create in first dir option
    const localPath = path.join(process.cwd(), runtime.dirs[0]);
    fs.mkdirSync(localPath, { recursive: true });
    return localPath;
  }

  // If runtime was auto-detected, its configDir is already resolved
  // But ask if both global and local exist
  const globalPath = runtime.configDir;
  const localCandidates = runtime.dirs.map(d => path.join(process.cwd(), d)).filter(fs.existsSync);

  if (localCandidates.length > 0 && globalPath !== localCandidates[0]) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      log('');
      log(`  ${c.cyan}g${c.reset} — Global install (${globalPath}) ${c.dim}recommended${c.reset}`);
      log(`  ${c.cyan}l${c.reset} — Local install (${localCandidates[0]})`);
      log('');
      rl.question(`  Install location [${c.bold}g${c.reset}/l]: `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase().startsWith('l') ? localCandidates[0] : globalPath);
      });
    });
  }

  return globalPath;
}

// ── File Operations ───────────────────────────────────
function hashFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function copyRecursive(src, dest, manifest, stats, pathReplacer) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, manifest, stats, pathReplacer);
    } else {
      const relativePath = path.relative(dest, destPath);
      const existed = fs.existsSync(destPath);

      if (existed && !flags.force) {
        const existingHash = hashFile(destPath);
        const newHash = hashFile(srcPath);
        if (existingHash === newHash) {
          stats.skipped++;
          manifest.push({ path: relativePath, hash: newHash });
          continue;
        }
        stats.updated++;
      } else if (!existed) {
        stats.created++;
      } else {
        stats.updated++;
      }

      let content = fs.readFileSync(srcPath, 'utf-8');
      // Replace .claude/ paths with target runtime paths (like GSD's copyWithPathReplacement)
      if (pathReplacer && entry.name.endsWith('.md')) {
        content = pathReplacer(content);
      }
      fs.writeFileSync(destPath, content);
      manifest.push({ path: relativePath, hash: hashFile(destPath) });
    }
  }
}

// ── Installation Mapping ──────────────────────────────
function getInstallMap(targetDir) {
  return [
    {
      src: path.join(PACKAGE_ROOT, 'commands'),
      dest: path.join(targetDir, 'commands'),
      label: 'commands/pm/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'skill'),
      dest: path.join(targetDir, 'skills', 'prisma-pm'),
      label: 'skills/prisma-pm/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'agents'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'agents'),
      label: 'skills/prisma-pm/agents/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'frameworks'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'frameworks'),
      label: 'skills/prisma-pm/frameworks/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'templates'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'templates'),
      label: 'skills/prisma-pm/templates/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'workflows'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'workflows'),
      label: 'skills/prisma-pm/workflows/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'references'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'references'),
      label: 'skills/prisma-pm/references/',
    },
    {
      src: path.join(PACKAGE_ROOT, 'bin', 'pm-tools.cjs'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'bin', 'pm-tools.cjs'),
      label: 'skills/prisma-pm/bin/pm-tools.cjs',
      isFile: true,
    },
    {
      src: path.join(PACKAGE_ROOT, 'VERSION'),
      dest: path.join(targetDir, 'skills', 'prisma-pm', 'VERSION'),
      label: 'skills/prisma-pm/VERSION',
      isFile: true,
    },
  ];
}

// ── Hooks & StatusLine (Claude Code only) ────────────
function registerHooks(configDir) {
  const settingsPath = path.join(configDir, 'settings.json');
  const hookDir = path.join(configDir, 'hooks');
  const hookPath = path.join(hookDir, 'pb-check-update.js');
  const hookCommand = `node "${hookPath}"`;

  // Copy hook file
  fs.mkdirSync(hookDir, { recursive: true });
  const src = path.join(PACKAGE_ROOT, 'bin', 'pb-check-update.js');
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, hookPath);
  }

  // Read existing settings
  if (!fs.existsSync(settingsPath)) return;
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch (e) { return; }

  // Append to SessionStart hooks (don't duplicate)
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];

  const alreadyRegistered = settings.hooks.SessionStart.some(entry =>
    entry.hooks && entry.hooks.some(h => h.command && h.command.includes('pb-check-update'))
  );

  if (!alreadyRegistered) {
    settings.hooks.SessionStart.push({
      hooks: [{
        type: 'command',
        command: hookCommand,
      }],
    });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }
}

function patchStatusLine(configDir) {
  const statusLinePath = path.join(configDir, 'hooks', 'gsd-statusline.js');
  if (!fs.existsSync(statusLinePath)) return;

  let content = fs.readFileSync(statusLinePath, 'utf-8');

  // Already patched?
  if (content.includes('pb-update-check.json')) return;

  // Insert PB update check after the GSD update check block
  const marker = '    // Output';
  if (!content.includes(marker)) return;

  const pbBlock = `    // Product Builder update available?
    let pbUpdate = '';
    const pbCacheFile = path.join(homeDir, '.claude', 'cache', 'pb-update-check.json');
    if (fs.existsSync(pbCacheFile)) {
      try {
        const pbCache = JSON.parse(fs.readFileSync(pbCacheFile, 'utf8'));
        if (pbCache.update_available) {
          pbUpdate = '\\x1b[33m\u2b06 /pm:update\\x1b[0m \u2502 ';
        }
      } catch (e) {}
    }

    // Output`;

  content = content.replace(marker, pbBlock);

  // Prepend pbUpdate to output lines
  content = content.replace(
    /process\.stdout\.write\(`\$\{gsdUpdate\}/g,
    'process.stdout.write(`${gsdUpdate}${pbUpdate}'
  );

  fs.writeFileSync(statusLinePath, content);
}

function removeHooks(configDir) {
  // Remove hook file
  const hookPath = path.join(configDir, 'hooks', 'pb-check-update.js');
  if (fs.existsSync(hookPath)) fs.unlinkSync(hookPath);

  // Remove cache
  const cachePath = path.join(configDir, 'cache', 'pb-update-check.json');
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

  // Remove SessionStart entry from settings.json
  const settingsPath = path.join(configDir, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      if (settings.hooks && settings.hooks.SessionStart) {
        settings.hooks.SessionStart = settings.hooks.SessionStart.filter(entry =>
          !(entry.hooks && entry.hooks.some(h => h.command && h.command.includes('pb-check-update')))
        );
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      }
    } catch (e) {}
  }

  // Remove PB patch from statusline
  const statusLinePath = path.join(configDir, 'hooks', 'gsd-statusline.js');
  if (fs.existsSync(statusLinePath)) {
    let content = fs.readFileSync(statusLinePath, 'utf-8');
    if (content.includes('pb-update-check.json')) {
      content = content.replace(/    \/\/ Product Builder update available\?[\s\S]*?    \/\/ Output/, '    // Output');
      content = content.replace(/\$\{pbUpdate\}/g, '');
      fs.writeFileSync(statusLinePath, content);
    }
  }
}

// ── Uninstall ─────────────────────────────────────────
function uninstall(targetDir, runtime) {
  const manifestPath = path.join(targetDir, MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) {
    logYellow('  No Prisma PM installation found.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  // Remove commands
  const pmCommandsDir = path.join(targetDir, 'commands', 'pm');
  if (fs.existsSync(pmCommandsDir)) {
    fs.rmSync(pmCommandsDir, { recursive: true });
  }

  // Remove skill directory
  const skillDir = path.join(targetDir, 'skills', 'prisma-pm');
  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true });
  }

  // Remove manifest
  fs.unlinkSync(manifestPath);

  // Remove hooks only for runtimes that support them
  if (runtime.supportsHooks) {
    removeHooks(targetDir);
  }

  log('');
  logGreen(`  ✓ Prisma PM v${manifest.version} uninstalled from ${runtime.name}`);
  log(`    Removed from: ${targetDir}`);
  log('');
}

// ── True-Color Gradient ──────────────────────────────
function rgb(r, g, b) {
  return `\x1b[38;2;${r};${g};${b}m`;
}

const GRADIENT_STOPS = [
  [71, 255, 191],   // #47FFBF cyan
  [131, 118, 255],  // #8376FF purple
  [255, 72, 199],   // #FF48C7 pink
];

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function gradientColor(col, totalCols) {
  const t = col / Math.max(totalCols - 1, 1);
  const seg = t * (GRADIENT_STOPS.length - 1);
  const i = Math.min(Math.floor(seg), GRADIENT_STOPS.length - 2);
  const lt = seg - i;
  return [
    lerp(GRADIENT_STOPS[i][0], GRADIENT_STOPS[i + 1][0], lt),
    lerp(GRADIENT_STOPS[i][1], GRADIENT_STOPS[i + 1][1], lt),
    lerp(GRADIENT_STOPS[i][2], GRADIENT_STOPS[i + 1][2], lt),
  ];
}

function colorizeRow(row, width, darken) {
  let out = '';
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === ' ') {
      out += ' ';
    } else {
      const [r, g, b] = gradientColor(i, width);
      out += rgb(
        Math.round(r * darken),
        Math.round(g * darken),
        Math.round(b * darken)
      ) + ch;
    }
  }
  return out + c.reset;
}

// ── Brand Logo ────────────────────────────────────────
function printLogo() {
  const W = rgb(255, 255, 255);
  const prisma = [
    '  ██████  ██████  ██ ███████ ██   ██  █████ ',
    '  ██   ██ ██   ██ ██ ██      ███ ███ ██   ██',
    '  ██████  ██████  ██ ███████ ██ █ ██ ███████',
    '  ██      ██  ██  ██      ██ ██   ██ ██   ██',
    '  ██      ██   ██ ██ ███████ ██   ██ ██   ██',
  ];
  const prismaShadow = '  ▀▀      ▀▀   ▀▀ ▀▀ ▀▀▀▀▀▀▀ ▀▀   ▀▀ ▀▀   ▀▀';
  const maxPrisma = Math.max(...prisma.map(r => r.length));

  log('');
  for (let i = 0; i < prisma.length; i++) {
    const gradientPart = colorizeRow(prisma[i].padEnd(maxPrisma), maxPrisma, 1);
    if (i === 2) {
      log(gradientPart + `  ${W}✦${c.reset}`);
    } else {
      log(gradientPart);
    }
  }
  log(colorizeRow(prismaShadow.padEnd(maxPrisma), maxPrisma, 0.4));
  log('');
  log(`  ${W}✦${c.reset} ${c.bold}Product Builder${c.reset} ${c.dim}v${VERSION}${c.reset}`);
  log(`  ${c.dim}Stop managing. Start building.${c.reset}`);
}

// ── Main ──────────────────────────────────────────────
async function main() {
  printLogo();
  log('');

  // Select runtime (auto-detect or explicit flag)
  const runtime = await selectRuntime();
  const targetDir = await resolveTarget(runtime);

  if (flags.uninstall) {
    uninstall(targetDir, runtime);
    return;
  }

  // Check for existing installation
  const manifestPath = path.join(targetDir, MANIFEST_NAME);
  if (fs.existsSync(manifestPath) && !flags.force) {
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    logYellow(`  Existing installation found: v${existing.version}`);
    log(`  Updating to v${VERSION}...`);
  }

  const allManifestEntries = [];
  const stats = { created: 0, updated: 0, skipped: 0 };
  const installMap = getInstallMap(targetDir);

  // Build path replacer for non-Claude runtimes (like GSD's copyWithPathReplacement)
  // Replaces ~/.claude/ paths with the target runtime's path in .md files
  let pathReplacer = null;
  if (runtime.id !== 'claude') {
    const runtimeDir = runtime.relDir; // e.g. '.gemini', '.codex'
    pathReplacer = (content) => {
      return content
        .replace(/~\/\.claude\//g, `~/.${runtimeDir.replace(/^\./, '')}/`)
        .replace(/\$HOME\/\.claude\//g, `$HOME/.${runtimeDir.replace(/^\./, '')}/`);
    };
  }

  log('');

  for (const mapping of installMap) {
    if (mapping.isFile) {
      const destDir = path.dirname(mapping.dest);
      fs.mkdirSync(destDir, { recursive: true });
      if (fs.existsSync(mapping.src)) {
        let content = fs.readFileSync(mapping.src, 'utf-8');
        if (pathReplacer && mapping.src.endsWith('.md')) {
          content = pathReplacer(content);
        }
        fs.writeFileSync(mapping.dest, content);
        stats.created++;
        allManifestEntries.push({ path: mapping.label, hash: '' });
      }
    } else {
      copyRecursive(mapping.src, mapping.dest, allManifestEntries, stats, pathReplacer);
    }
    log(`  ${c.green}✓${c.reset} Installed ${mapping.label}`);
  }

  // Write manifest (includes runtime info)
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        version: VERSION,
        runtime: runtime.id,
        runtime_name: runtime.name,
        installed_at: new Date().toISOString(),
        target: targetDir,
        files: allManifestEntries,
      },
      null,
      2
    )
  );

  // Register hooks only for runtimes that support them
  if (runtime.supportsHooks) {
    registerHooks(targetDir);
    log(`  ${c.green}✓${c.reset} Registered update check hook`);
  }
  if (runtime.supportsStatusLine) {
    patchStatusLine(targetDir);
  }

  // Success banner
  log('');
  logGreen(`  ✦ Done!`);
  log(`  ${c.dim}Installed to ${runtime.name} (${targetDir})${c.reset}`);
  log(`  ${c.dim}${stats.created} created, ${stats.updated} updated, ${stats.skipped} unchanged${c.reset}`);

  // Commands reference
  log('');
  log(`  ${c.bold}COMMANDS${c.reset}`);
  log(`  ${c.cyan}/pm:new${c.reset} ${c.dim}"Name"${c.reset}       Initialize product workspace`);
  log(`  ${c.cyan}/pm:icp${c.reset}              Define Ideal Customer Profile`);
  log(`  ${c.cyan}/pm:persona${c.reset}          Generate synthetic personas with JTBD`);
  log(`  ${c.cyan}/pm:discover${c.reset} ${c.dim}"problem"${c.reset} Socratic problem exploration`);
  log(`  ${c.cyan}/pm:power${c.reset} ${c.dim}"problem"${c.reset}   Product Power calculator`);
  log(`  ${c.cyan}/pm:strategy${c.reset}         Force-ranked backlog`);
  log(`  ${c.cyan}/pm:validate${c.reset} ${c.dim}"hyp"${c.reset}    Experiment design + kill criteria`);
  log(`  ${c.cyan}/pm:define${c.reset} ${c.dim}"feature"${c.reset}  Context-engineered PRD`);
  log(`  ${c.cyan}/pm:design${c.reset}           Design spec — messaging, IA, flows, taste`);
  log(`  ${c.cyan}/pm:require${c.reset}          PRD to user stories + acceptance criteria`);
  log(`  ${c.cyan}/pm:help${c.reset}             Full command reference`);
  log(`  ${c.cyan}/pm:update${c.reset}           Check for latest version`);

  // Origin + brand
  log('');
  log(`  ${c.dim}From Latin America, for the world.${c.reset}  ${c.cyan}#VamosLatam${c.reset}`);
  log(`  ${c.cyan}getprisma.lat/product-builder${c.reset}`);

  // Getting started
  log('');
  log(`  Run ${c.cyan}/pm:help${c.reset} to get started. ✦`);
  log('');
}

main().catch((err) => {
  logRed(`  ✗ Installation failed: ${err.message}`);
  process.exit(1);
});
