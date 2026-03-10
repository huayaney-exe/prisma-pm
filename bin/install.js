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
  magenta: '\x1b[35m',
  white: '\x1b[37m',
};

function log(msg) { console.log(msg); }
function logCyan(msg) { log(`${c.cyan}${msg}${c.reset}`); }
function logGreen(msg) { log(`${c.green}${msg}${c.reset}`); }
function logYellow(msg) { log(`${c.yellow}${msg}${c.reset}`); }
function logRed(msg) { log(`${c.red}${msg}${c.reset}`); }
function logBold(msg) { log(`${c.bold}${msg}${c.reset}`); }

// ── CLI Flags ─────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  global: args.includes('--global'),
  local: args.includes('--local'),
  uninstall: args.includes('--uninstall'),
  force: args.includes('--force'),
  help: args.includes('--help') || args.includes('-h'),
};

// ── Help ──────────────────────────────────────────────
if (flags.help) {
  log('');
  logBold('  Prisma PM — AI-Native Product Management for Claude Code');
  log('');
  log('  Usage:');
  log('    npx prisma-pm@latest              Install (interactive)');
  log('    npx prisma-pm@latest --global     Install to ~/.claude/');
  log('    npx prisma-pm@latest --local      Install to ./.claude/');
  log('    npx prisma-pm@latest --uninstall  Remove installed files');
  log('    npx prisma-pm@latest --force      Overwrite without prompting');
  log('');
  process.exit(0);
}

// ── Target Directory ──────────────────────────────────
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
    log('');
    log(`  ${c.cyan}g${c.reset} — Global install (~/.claude/) ${c.dim}recommended${c.reset}`);
    log(`  ${c.cyan}l${c.reset} — Local install (./.claude/)`);
    log('');
    rl.question(`  Install location [${c.bold}g${c.reset}/l]: `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith('l') ? getLocalDir() : getGlobalDir());
    });
  });
}

// ── File Operations ───────────────────────────────────
function hashFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function copyRecursive(src, dest, manifest, stats) {
  if (!fs.existsSync(src)) return;

  const entries = fs.readdirSync(src, { withFileTypes: true });
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, manifest, stats);
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

      const content = fs.readFileSync(srcPath, 'utf-8');
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

// ── Uninstall ─────────────────────────────────────────
function uninstall(targetDir) {
  const manifestPath = path.join(targetDir, MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) {
    logYellow('  No Prisma PM installation found.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  let removed = 0;

  // Remove commands
  const pmCommandsDir = path.join(targetDir, 'commands', 'pm');
  if (fs.existsSync(pmCommandsDir)) {
    fs.rmSync(pmCommandsDir, { recursive: true });
    removed++;
  }

  // Remove skill directory
  const skillDir = path.join(targetDir, 'skills', 'prisma-pm');
  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true });
    removed++;
  }

  // Remove manifest
  fs.unlinkSync(manifestPath);

  log('');
  logGreen(`  ✓ Prisma PM v${manifest.version} uninstalled`);
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
  const rows = [
    '  ██████  ██████  ██ ███████ ██   ██  █████ ',
    '  ██   ██ ██   ██ ██ ██      ███ ███ ██   ██',
    '  ██████  ██████  ██ ███████ ██ █ ██ ███████',
    '  ██      ██  ██  ██      ██ ██   ██ ██   ██',
    '  ██      ██   ██ ██ ███████ ██   ██ ██   ██',
  ];
  const shadow = '  ▀▀      ▀▀   ▀▀ ▀▀ ▀▀▀▀▀▀▀ ▀▀   ▀▀ ▀▀   ▀▀';
  const width = rows[0].length;

  log('');
  for (const row of rows) {
    log(colorizeRow(row, width, 1));
  }
  log(colorizeRow(shadow, width, 0.4));
  log('');
  log(`  ${c.bold}Product Builder${c.reset} ${c.dim}v${VERSION}${c.reset}`);
  log(`  ${c.dim}Stop managing. Start building.${c.reset}`);
}

// ── Main ──────────────────────────────────────────────
async function main() {
  printLogo();
  log('');

  // Check Claude Code exists
  const globalDir = getGlobalDir();
  if (!fs.existsSync(globalDir)) {
    logRed('  ✗ ~/.claude/ not found. Is Claude Code installed?');
    log('    Install Claude Code first: https://claude.ai/code');
    process.exit(1);
  }

  const targetDir = await promptInstallLocation();

  if (flags.uninstall) {
    uninstall(targetDir);
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

  log('');

  for (const mapping of installMap) {
    if (mapping.isFile) {
      // Single file copy
      const destDir = path.dirname(mapping.dest);
      fs.mkdirSync(destDir, { recursive: true });
      if (fs.existsSync(mapping.src)) {
        fs.copyFileSync(mapping.src, mapping.dest);
        stats.created++;
        allManifestEntries.push({ path: mapping.label, hash: '' });
      }
    } else {
      copyRecursive(mapping.src, mapping.dest, allManifestEntries, stats);
    }
    log(`  ${c.green}✓${c.reset} Installed ${mapping.label}`);
  }

  // Write manifest
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        version: VERSION,
        installed_at: new Date().toISOString(),
        target: targetDir,
        files: allManifestEntries,
      },
      null,
      2
    )
  );

  // Success banner
  log('');
  logGreen(`  Done!`);
  log(`  ${c.dim}${stats.created} created, ${stats.updated} updated, ${stats.skipped} unchanged${c.reset}`);

  // Commands reference
  log('');
  log(`  ${c.bold}COMMANDS${c.reset}`);
  log(`  ${c.cyan}/pm:new${c.reset} ${c.dim}\"Name\"${c.reset}       Initialize product workspace`);
  log(`  ${c.cyan}/pm:icp${c.reset}              Define Ideal Customer Profile`);
  log(`  ${c.cyan}/pm:discover${c.reset} ${c.dim}\"problem\"${c.reset} Socratic problem exploration`);
  log(`  ${c.cyan}/pm:power${c.reset} ${c.dim}\"problem\"${c.reset}   Product Power calculator`);
  log(`  ${c.cyan}/pm:define${c.reset} ${c.dim}\"feature\"${c.reset}  Context-engineered PRD`);
  log(`  ${c.cyan}/pm:strategy${c.reset}         Force-ranked backlog`);
  log(`  ${c.cyan}/pm:help${c.reset}             Full command reference`);

  // Origin + brand
  log('');
  log(`  ${c.dim}From Latin America, for the world.${c.reset}  ${c.cyan}#VamosLatam${c.reset}`);
  log(`  ${c.cyan}getprisma.lat/product-builder${c.reset}`);

  // Getting started
  log('');
  log(`  Run ${c.cyan}/pm:help${c.reset} to get started.`);
  log('');
}

main().catch((err) => {
  logRed(`  ✗ Installation failed: ${err.message}`);
  process.exit(1);
});
