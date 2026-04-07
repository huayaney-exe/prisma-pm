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

// ── Supported Runtimes (matching GSD) ────────────────
const RUNTIMES = {
  claude: {
    name: 'Claude Code',
    dirName: '.claude',
    dirs: ['.claude'],
    env: ['CLAUDE_CONFIG_DIR'],
    supportsHooks: true,
    supportsStatusLine: true,
    commandFormat: 'md',
  },
  gemini: {
    name: 'Gemini CLI',
    dirName: '.gemini',
    dirs: ['.gemini'],
    env: ['GEMINI_CONFIG_DIR'],
    supportsHooks: false,
    supportsStatusLine: false,
    commandFormat: 'toml',
  },
  codex: {
    name: 'Codex',
    dirName: '.codex',
    dirs: ['.codex'],
    env: ['CODEX_HOME'],
    supportsHooks: false,
    supportsStatusLine: false,
    commandFormat: 'md',
  },
  copilot: {
    name: 'GitHub Copilot',
    dirName: '.copilot',
    dirs: ['.copilot'],
    env: ['COPILOT_CONFIG_DIR'],
    supportsHooks: false,
    supportsStatusLine: false,
    commandFormat: 'md',
  },
  cursor: {
    name: 'Cursor',
    dirName: '.cursor',
    dirs: ['.cursor'],
    env: ['CURSOR_CONFIG_DIR'],
    supportsHooks: false,
    supportsStatusLine: false,
    commandFormat: 'md',
  },
  opencode: {
    name: 'OpenCode',
    dirName: '.opencode',
    dirs: ['.config/opencode', '.opencode'],
    env: ['OPENCODE_CONFIG_DIR', 'OPENCODE_CONFIG'],
    supportsHooks: false,
    supportsStatusLine: false,
    commandFormat: 'md',
  },
};

// ── Tool Name Mapping Per Runtime (matching GSD) ─────
const TOOL_MAPS = {
  gemini: {
    Read: 'read_file',
    Write: 'write_file',
    Edit: 'replace',
    Bash: 'run_shell_command',
    Glob: 'glob',
    Grep: 'search_file_content',
    WebSearch: 'google_web_search',
    WebFetch: 'web_fetch',
    AskUserQuestion: 'ask_user',
    Agent: null, // auto-registered
  },
  copilot: {
    Read: 'read',
    Write: 'edit',
    Edit: 'edit',
    Bash: 'execute',
    Grep: 'search',
    Glob: 'search',
    WebSearch: 'web',
    WebFetch: 'web',
    AskUserQuestion: 'ask_user',
    Agent: 'agent',
  },
  cursor: {
    Bash: 'Shell',
    Edit: 'StrReplace',
    AskUserQuestion: null, // use conversational prompting
    Agent: null,
  },
  codex: {},
  opencode: {
    AskUserQuestion: 'question',
    WebFetch: 'webfetch',
    WebSearch: 'websearch',
  },
};

// ── CLI Flags ─────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {
  global: args.includes('--global') || args.includes('-g'),
  local: args.includes('--local') || args.includes('-l'),
  uninstall: args.includes('--uninstall') || args.includes('-u'),
  force: args.includes('--force'),
  all: args.includes('--all'),
  help: args.includes('--help') || args.includes('-h'),
  // Runtime flags
  claude: args.includes('--claude'),
  gemini: args.includes('--gemini'),
  codex: args.includes('--codex'),
  copilot: args.includes('--copilot'),
  cursor: args.includes('--cursor'),
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
  log('    npx product-builder@latest --all        Install to all detected CLIs');
  log('    npx product-builder@latest --uninstall  Remove installed files');
  log('    npx product-builder@latest --force      Overwrite without prompting');
  log('');
  log('  Runtime targets:');
  log('    --claude      Claude Code       (~/.claude/)');
  log('    --gemini      Gemini CLI        (~/.gemini/)');
  log('    --codex       Codex             (~/.codex/)');
  log('    --copilot     GitHub Copilot    (~/.copilot/)');
  log('    --cursor      Cursor            (~/.cursor/)');
  log('    --opencode    OpenCode          (~/.config/opencode/)');
  log('    --all         All detected CLIs');
  log('');
  log('  If no runtime flag is provided, auto-detects installed CLIs.');
  log('');
  process.exit(0);
}

// ── Runtime Detection ─────────────────────────────────
function detectInstalledRuntimes(scope) {
  const detected = [];
  const baseDirs = scope === 'local'
    ? [process.cwd(), os.homedir()]
    : [os.homedir(), process.cwd()];

  const seen = new Set();

  // Check env var overrides first
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

function getExplicitRuntimes() {
  const selected = [];
  for (const [id, runtime] of Object.entries(RUNTIMES)) {
    if (!flags[id]) continue;
    let found = false;
    for (const dir of runtime.dirs) {
      const globalPath = path.join(os.homedir(), dir);
      const localPath = path.join(process.cwd(), dir);
      if (flags.local && fs.existsSync(localPath)) {
        selected.push({ id, ...runtime, configDir: localPath, relDir: dir });
        found = true;
        break;
      }
      if (fs.existsSync(globalPath)) {
        selected.push({ id, ...runtime, configDir: globalPath, relDir: dir });
        found = true;
        break;
      }
      if (fs.existsSync(localPath)) {
        selected.push({ id, ...runtime, configDir: localPath, relDir: dir });
        found = true;
        break;
      }
    }
    if (!found) {
      logRed(`  ✗ ${runtime.name} not found (~/${runtime.dirs[0]}/ doesn't exist)`);
      log(`    Install ${runtime.name} first, then re-run this installer.`);
      process.exit(1);
    }
  }
  return selected;
}

async function selectRuntimes() {
  // 1. --all: install to every detected runtime
  if (flags.all) {
    const scope = flags.local ? 'local' : 'global';
    const detected = detectInstalledRuntimes(scope);
    if (detected.length === 0) {
      logRed('  ✗ No supported AI CLI found.');
      process.exit(1);
    }
    log(`  ${c.dim}Installing to all detected CLIs (${detected.map(r => r.name).join(', ')})${c.reset}`);
    return detected;
  }

  // 2. Explicit flags
  const explicit = getExplicitRuntimes();
  if (explicit.length > 0) return explicit;

  // 3. Auto-detect
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
    return [detected[0]];
  }

  // Interactive selector
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    log(`  ${c.bold}Detected AI CLIs:${c.reset}`);
    log('');
    detected.forEach((r, i) => {
      const marker = i === 0 ? ` ${c.dim}(default)${c.reset}` : '';
      log(`    ${c.cyan}${i + 1}${c.reset}  ${r.name} ${c.dim}~/${r.relDir}/${c.reset}${marker}`);
    });
    log(`    ${c.cyan}a${c.reset}  All of the above`);
    log('');
    rl.question(`  Select target [${c.bold}1${c.reset}]: `, (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'a') {
        log(`  ${c.dim}Installing to all${c.reset}`);
        resolve(detected);
        return;
      }
      const idx = parseInt(answer || '1', 10) - 1;
      const selected = detected[Math.max(0, Math.min(idx, detected.length - 1))];
      log(`  ${c.dim}Installing to:${c.reset} ${selected.name}`);
      resolve([selected]);
    });
  });
}

// ── Scope (Global / Local) ───────────────────────────
async function resolveTarget(runtime) {
  if (flags.global) return runtime.configDir;
  if (flags.local) {
    for (const dir of runtime.dirs) {
      const localPath = path.join(process.cwd(), dir);
      if (fs.existsSync(localPath)) return localPath;
    }
    const localPath = path.join(process.cwd(), runtime.dirs[0]);
    fs.mkdirSync(localPath, { recursive: true });
    return localPath;
  }

  // For multi-runtime installs (--all), skip the global/local prompt
  if (flags.all) return runtime.configDir;

  const globalPath = runtime.configDir;
  const localCandidates = runtime.dirs.map(d => path.join(process.cwd(), d)).filter(fs.existsSync);

  if (localCandidates.length > 0 && globalPath !== localCandidates[0]) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
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

// ── Runtime Content Conversion (matching GSD) ────────

// Replace ~/.claude/ paths with runtime-specific paths
function replacePaths(content, runtimeId, dirName, isGlobal) {
  if (runtimeId === 'claude') return content;
  const target = dirName.replace(/^\./, '');
  if (isGlobal) {
    content = content.replace(/~\/\.claude\//g, `~/.${target}/`);
    content = content.replace(/\$HOME\/\.claude\//g, `$HOME/.${target}/`);
  } else {
    content = content.replace(/~\/\.claude\//g, `.${target}/`);
    content = content.replace(/\$HOME\/\.claude\//g, `.${target}/`);
  }
  content = content.replace(/\.\/\.claude\//g, `./.${target}/`);
  return content;
}

// Convert allowed-tools in YAML frontmatter to runtime-specific tool names
function convertToolNames(content, runtimeId) {
  const toolMap = TOOL_MAPS[runtimeId];
  if (!toolMap || Object.keys(toolMap).length === 0) return content;

  return content.replace(/^(allowed-tools:\n)((?:\s+-\s+.+\n)+)/m, (match, header, tools) => {
    const converted = tools.split('\n')
      .filter(line => line.trim().startsWith('- '))
      .map(line => {
        const tool = line.trim().replace(/^-\s+/, '');
        const mapped = toolMap.hasOwnProperty(tool) ? toolMap[tool] : tool.toLowerCase();
        return mapped ? `  - ${mapped}` : null;
      })
      .filter(Boolean)
      .join('\n');
    return header + converted + '\n';
  });
}

// Convert Claude .md command to Gemini TOML format (matching GSD's convertClaudeToGeminiToml)
function convertToGeminiToml(content) {
  if (!content.startsWith('---')) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    return `prompt = ${JSON.stringify(content)}\n`;
  }

  const frontmatter = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();

  let description = '';
  for (const line of frontmatter.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('description:')) {
      description = trimmed.substring(12).trim();
      break;
    }
  }

  let toml = '';
  if (description) {
    toml += `description = ${JSON.stringify(description)}\n`;
  }
  toml += `prompt = ${JSON.stringify(body)}\n`;
  return toml;
}

// Convert content for Cursor (matching GSD's convertClaudeToCursorMarkdown)
function convertForCursor(content) {
  let converted = content;
  // Tool references in body text
  converted = converted.replace(/\bBash\(/g, 'Shell(');
  converted = converted.replace(/\bEdit\(/g, 'StrReplace(');
  converted = converted.replace(/\bAskUserQuestion\b/g, 'conversational prompting');
  // Path references
  converted = converted.replace(/\.claude\/skills\//g, '.cursor/skills/');
  converted = converted.replace(/\bClaude Code\b/g, 'Cursor');
  return converted;
}

// ── File Operations ───────────────────────────────────
function hashFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function copyWithReplacement(src, dest, manifest, stats, runtimeId, dirName, isGlobal, isCommand) {
  if (!fs.existsSync(src)) return;

  // Clean install: remove existing dest to prevent orphaned files (matching GSD)
  if (fs.existsSync(dest) && flags.force) {
    fs.rmSync(dest, { recursive: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyWithReplacement(srcPath, destPath, manifest, stats, runtimeId, dirName, isGlobal, isCommand);
    } else if (entry.name.endsWith('.md')) {
      const relativePath = path.relative(dest, destPath);
      let content = fs.readFileSync(srcPath, 'utf-8');

      // Apply path replacement
      content = replacePaths(content, runtimeId, dirName, isGlobal);

      // Apply tool name conversion for commands
      if (isCommand) {
        content = convertToolNames(content, runtimeId);
      }

      // Apply runtime-specific conversions
      if (runtimeId === 'cursor') {
        content = convertForCursor(content);
      }

      // Gemini commands: convert to TOML (matching GSD)
      if (runtimeId === 'gemini' && isCommand) {
        const tomlContent = convertToGeminiToml(content);
        const tomlPath = destPath.replace(/\.md$/, '.toml');
        fs.writeFileSync(tomlPath, tomlContent);
        stats.created++;
        manifest.push({ path: relativePath.replace(/\.md$/, '.toml'), hash: '' });
        continue;
      }

      // Check for updates vs new
      const existed = fs.existsSync(destPath);
      if (existed && !flags.force) {
        const existingHash = hashFile(destPath);
        const newHash = crypto.createHash('md5').update(content).digest('hex');
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

      fs.writeFileSync(destPath, content);
      manifest.push({ path: relativePath, hash: hashFile(destPath) });
    } else {
      // Non-md files: copy as-is
      const relativePath = path.relative(dest, destPath);
      const existed = fs.existsSync(destPath);
      if (!existed) stats.created++;
      else stats.updated++;
      fs.copyFileSync(srcPath, destPath);
      manifest.push({ path: relativePath, hash: '' });
    }
  }
}

// ── Installation Mapping ──────────────────────────────
function getInstallMap(targetDir) {
  return [
    { src: path.join(PACKAGE_ROOT, 'commands'), dest: path.join(targetDir, 'commands'), label: 'commands/pm/', isCommand: true },
    { src: path.join(PACKAGE_ROOT, 'skill'), dest: path.join(targetDir, 'skills', 'prisma-pm'), label: 'skills/prisma-pm/' },
    { src: path.join(PACKAGE_ROOT, 'agents'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'agents'), label: 'skills/prisma-pm/agents/' },
    { src: path.join(PACKAGE_ROOT, 'frameworks'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'frameworks'), label: 'skills/prisma-pm/frameworks/' },
    { src: path.join(PACKAGE_ROOT, 'templates'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'templates'), label: 'skills/prisma-pm/templates/' },
    { src: path.join(PACKAGE_ROOT, 'workflows'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'workflows'), label: 'skills/prisma-pm/workflows/' },
    { src: path.join(PACKAGE_ROOT, 'references'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'references'), label: 'skills/prisma-pm/references/' },
    { src: path.join(PACKAGE_ROOT, 'bin', 'pm-tools.cjs'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'bin', 'pm-tools.cjs'), label: 'skills/prisma-pm/bin/pm-tools.cjs', isFile: true },
    { src: path.join(PACKAGE_ROOT, 'VERSION'), dest: path.join(targetDir, 'skills', 'prisma-pm', 'VERSION'), label: 'skills/prisma-pm/VERSION', isFile: true },
  ];
}

// ── Hooks & StatusLine (Claude Code only) ────────────
function registerHooks(configDir) {
  const settingsPath = path.join(configDir, 'settings.json');
  const hookDir = path.join(configDir, 'hooks');
  const hookPath = path.join(hookDir, 'pb-check-update.js');
  const hookCommand = `node "${hookPath}"`;

  fs.mkdirSync(hookDir, { recursive: true });
  const src = path.join(PACKAGE_ROOT, 'bin', 'pb-check-update.js');
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, hookPath);
  }

  if (!fs.existsSync(settingsPath)) return;
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch (e) { return; }

  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.SessionStart) settings.hooks.SessionStart = [];

  const alreadyRegistered = settings.hooks.SessionStart.some(entry =>
    entry.hooks && entry.hooks.some(h => h.command && h.command.includes('pb-check-update'))
  );

  if (!alreadyRegistered) {
    settings.hooks.SessionStart.push({
      hooks: [{ type: 'command', command: hookCommand }],
    });
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  }
}

function patchStatusLine(configDir) {
  const statusLinePath = path.join(configDir, 'hooks', 'gsd-statusline.js');
  if (!fs.existsSync(statusLinePath)) return;

  let content = fs.readFileSync(statusLinePath, 'utf-8');
  if (content.includes('pb-update-check.json')) return;

  const marker = '    // Output';
  if (!content.includes(marker)) return;

  const pbBlock = `    // Product Builder update available?
    let pbUpdate = '';
    const pbCacheFile = path.join(homeDir, '.claude', 'cache', 'pb-update-check.json');
    if (fs.existsSync(pbCacheFile)) {
      try {
        const pbCache = JSON.parse(fs.readFileSync(pbCacheFile, 'utf8'));
        if (pbCache.update_available) {
          pbUpdate = '\\x1b[33m⬆ /pm:update\\x1b[0m │ ';
        }
      } catch (e) {}
    }

    // Output`;

  content = content.replace(marker, pbBlock);
  content = content.replace(
    /process\.stdout\.write\(`\$\{gsdUpdate\}/g,
    'process.stdout.write(`${gsdUpdate}${pbUpdate}'
  );
  fs.writeFileSync(statusLinePath, content);
}

function removeHooks(configDir) {
  const hookPath = path.join(configDir, 'hooks', 'pb-check-update.js');
  if (fs.existsSync(hookPath)) fs.unlinkSync(hookPath);

  const cachePath = path.join(configDir, 'cache', 'pb-update-check.json');
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);

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
    logYellow(`  No Prisma PM installation found in ${runtime.name}.`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const pmCommandsDir = path.join(targetDir, 'commands', 'pm');
  if (fs.existsSync(pmCommandsDir)) fs.rmSync(pmCommandsDir, { recursive: true });

  const skillDir = path.join(targetDir, 'skills', 'prisma-pm');
  if (fs.existsSync(skillDir)) fs.rmSync(skillDir, { recursive: true });

  fs.unlinkSync(manifestPath);

  if (runtime.supportsHooks) removeHooks(targetDir);

  log(`  ${c.green}✓${c.reset} Uninstalled v${manifest.version} from ${runtime.name}`);
}

// ── Install One Runtime ───────────────────────────────
function installToRuntime(runtime, targetDir) {
  const manifestPath = path.join(targetDir, MANIFEST_NAME);
  const isGlobal = targetDir.startsWith(os.homedir());

  if (fs.existsSync(manifestPath) && !flags.force) {
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    logYellow(`  ${runtime.name}: v${existing.version} → v${VERSION}`);
  }

  const allManifestEntries = [];
  const stats = { created: 0, updated: 0, skipped: 0 };
  const installMap = getInstallMap(targetDir);

  for (const mapping of installMap) {
    if (mapping.isFile) {
      const destDir = path.dirname(mapping.dest);
      fs.mkdirSync(destDir, { recursive: true });
      if (fs.existsSync(mapping.src)) {
        let content = fs.readFileSync(mapping.src, 'utf-8');
        if (mapping.src.endsWith('.md')) {
          content = replacePaths(content, runtime.id, runtime.dirName, isGlobal);
        }
        fs.writeFileSync(mapping.dest, content);
        stats.created++;
        allManifestEntries.push({ path: mapping.label, hash: '' });
      }
    } else {
      copyWithReplacement(
        mapping.src, mapping.dest, allManifestEntries, stats,
        runtime.id, runtime.dirName, isGlobal, !!mapping.isCommand
      );
    }
  }

  // Write manifest
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({
      version: VERSION,
      runtime: runtime.id,
      runtime_name: runtime.name,
      installed_at: new Date().toISOString(),
      target: targetDir,
      files: allManifestEntries,
    }, null, 2)
  );

  // Hooks (Claude Code only)
  if (runtime.supportsHooks) {
    registerHooks(targetDir);
  }
  if (runtime.supportsStatusLine) {
    patchStatusLine(targetDir);
  }

  const hookNote = runtime.supportsHooks ? ' + hook' : '';
  log(`  ${c.green}✓${c.reset} ${runtime.name} — ${stats.created} new, ${stats.updated} updated, ${stats.skipped} unchanged${hookNote}`);
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

  // Select runtime(s)
  const runtimes = await selectRuntimes();

  // Resolve targets and execute
  if (flags.uninstall) {
    for (const runtime of runtimes) {
      const targetDir = await resolveTarget(runtime);
      uninstall(targetDir, runtime);
    }
    log('');
    return;
  }

  log('');
  for (const runtime of runtimes) {
    const targetDir = await resolveTarget(runtime);
    installToRuntime(runtime, targetDir);
  }

  // Success banner
  log('');
  logGreen(`  ✦ Done!`);
  if (runtimes.length > 1) {
    log(`  ${c.dim}Installed to ${runtimes.length} runtimes${c.reset}`);
  }

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

  log('');
  log(`  ${c.dim}From Latin America, for the world.${c.reset}  ${c.cyan}#VamosLatam${c.reset}`);
  log(`  ${c.cyan}getprisma.lat/product-builder${c.reset}`);

  log('');
  log(`  Run ${c.cyan}/pm:help${c.reset} to get started. ✦`);
  log('');
}

main().catch((err) => {
  logRed(`  ✗ Installation failed: ${err.message}`);
  process.exit(1);
});
