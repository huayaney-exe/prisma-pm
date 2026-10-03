/**
 * praxis-config.cjs — Detect and register the Praxis MCP server per runtime.
 *
 * Praxis is Prisma's product-memory MCP (https://mcp.getprisma.lat/mcp).
 * Shared by bin/install.js (registration) and pm-tools.cjs (status).
 *
 * Detection matches by URL host, never by server name — users may have it
 * registered as "praxis", "prisma", or as a claude.ai connector.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const PRAXIS_URL = 'https://mcp.getprisma.lat/mcp';
const PRAXIS_HOST = 'mcp.getprisma.lat';
const PRAXIS_NAME = 'praxis';

function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.pb-tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, filePath);
}

function serversPointToPraxis(servers) {
  if (!servers || typeof servers !== 'object') return null;
  for (const [name, cfg] of Object.entries(servers)) {
    if (JSON.stringify(cfg || {}).includes(PRAXIS_HOST)) return name;
  }
  return null;
}

function fileMentionsPraxis(filePath) {
  try {
    return fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf-8').includes(PRAXIS_HOST);
  } catch (e) {
    return false;
  }
}

function commandExists(cmd) {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [cmd], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// ── Detection ─────────────────────────────────────────
// Returns { configured: bool, name?: string, where?: string }

function detectClaude(configDir, cwd) {
  // Claude Code keeps user/local MCP servers in ~/.claude.json (or $CLAUDE_CONFIG_DIR/.claude.json)
  const candidates = [
    path.join(os.homedir(), '.claude.json'),
    path.join(configDir || path.join(os.homedir(), '.claude'), '.claude.json'),
  ];
  for (const file of candidates) {
    const data = readJSON(file);
    if (!data) continue;
    const userName = serversPointToPraxis(data.mcpServers);
    if (userName) return { configured: true, name: userName, where: `${file} (user)` };
    const project = data.projects && data.projects[cwd];
    const projectName = project && serversPointToPraxis(project.mcpServers);
    if (projectName) return { configured: true, name: projectName, where: `${file} (local)` };
  }
  const mcpJson = readJSON(path.join(cwd, '.mcp.json'));
  const sharedName = mcpJson && serversPointToPraxis(mcpJson.mcpServers);
  if (sharedName) return { configured: true, name: sharedName, where: path.join(cwd, '.mcp.json') };
  return { configured: false };
}

function detectInJsonKey(file, key) {
  const data = readJSON(file);
  const name = data && serversPointToPraxis(data[key]);
  return name ? { configured: true, name, where: file } : { configured: false };
}

function detect(runtimeId, configDir, cwd) {
  cwd = cwd || process.cwd();
  switch (runtimeId) {
    case 'claude':
      return detectClaude(configDir, cwd);
    case 'cursor':
      return detectInJsonKey(path.join(configDir, 'mcp.json'), 'mcpServers');
    case 'gemini':
      return detectInJsonKey(path.join(configDir, 'settings.json'), 'mcpServers');
    case 'opencode': {
      for (const f of ['opencode.json', 'opencode.jsonc', 'config.json']) {
        const file = path.join(configDir, f);
        if (fileMentionsPraxis(file)) return { configured: true, name: PRAXIS_NAME, where: file };
      }
      return { configured: false };
    }
    case 'codex': {
      const file = path.join(configDir, 'config.toml');
      return fileMentionsPraxis(file) ? { configured: true, name: PRAXIS_NAME, where: file } : { configured: false };
    }
    case 'copilot': {
      const file = path.join(configDir, 'mcp-config.json');
      return fileMentionsPraxis(file) ? { configured: true, name: PRAXIS_NAME, where: file } : { configured: false };
    }
    default:
      return { configured: false };
  }
}

// ── Manual instructions (always correct, printed when we can't write config) ──

function manualSteps(runtimeId) {
  switch (runtimeId) {
    case 'claude':
      return [
        `claude mcp add --transport http --scope user ${PRAXIS_NAME} ${PRAXIS_URL}`,
        `Then inside Claude Code: /mcp → ${PRAXIS_NAME} → Authenticate`,
      ];
    case 'cursor':
      return [`Add to ~/.cursor/mcp.json → "mcpServers": { "${PRAXIS_NAME}": { "url": "${PRAXIS_URL}" } }`];
    case 'gemini':
      return [
        `Add to ~/.gemini/settings.json → "mcpServers": { "${PRAXIS_NAME}": { "httpUrl": "${PRAXIS_URL}" } }`,
        `Then inside Gemini CLI: /mcp auth ${PRAXIS_NAME}`,
      ];
    case 'opencode':
      return [`Add to opencode.json → "mcp": { "${PRAXIS_NAME}": { "type": "remote", "url": "${PRAXIS_URL}" } }`];
    default:
      return [`Register a remote (streamable HTTP) MCP server named "${PRAXIS_NAME}" with URL ${PRAXIS_URL}`];
  }
}

// ── Registration ──────────────────────────────────────
// Returns { ok: bool, method: 'cli'|'config'|'manual', where?, next?: string[], error? }

function registerClaude() {
  if (!commandExists('claude')) {
    return { ok: false, method: 'manual', next: manualSteps('claude'), error: '`claude` CLI not on PATH' };
  }
  try {
    execFileSync('claude', ['mcp', 'add', '--transport', 'http', '--scope', 'user', PRAXIS_NAME, PRAXIS_URL], {
      stdio: 'ignore',
      timeout: 20000,
    });
    return {
      ok: true,
      method: 'cli',
      where: 'claude mcp (user scope)',
      next: [`Inside Claude Code: /mcp → ${PRAXIS_NAME} → Authenticate`],
    };
  } catch (e) {
    return { ok: false, method: 'manual', next: manualSteps('claude'), error: 'claude mcp add failed' };
  }
}

function registerInJson(file, key, entry, runtimeId) {
  let data = {};
  if (fs.existsSync(file)) {
    data = readJSON(file);
    if (data === null) {
      return { ok: false, method: 'manual', next: manualSteps(runtimeId), error: `${file} is not plain JSON — left untouched` };
    }
  }
  if (!data[key] || typeof data[key] !== 'object') data[key] = {};
  if (data[key][PRAXIS_NAME]) {
    return { ok: false, method: 'manual', next: manualSteps(runtimeId), error: `a different "${PRAXIS_NAME}" server already exists in ${file}` };
  }
  data[key][PRAXIS_NAME] = entry;
  writeJSON(file, data);
  return { ok: true, method: 'config', where: file };
}

function register(runtimeId, configDir) {
  switch (runtimeId) {
    case 'claude':
      return registerClaude();
    case 'cursor':
      return registerInJson(path.join(configDir, 'mcp.json'), 'mcpServers', { url: PRAXIS_URL }, 'cursor');
    case 'gemini': {
      const res = registerInJson(path.join(configDir, 'settings.json'), 'mcpServers', { httpUrl: PRAXIS_URL }, 'gemini');
      if (res.ok) res.next = [`Inside Gemini CLI: /mcp auth ${PRAXIS_NAME}`];
      return res;
    }
    case 'opencode': {
      if (fs.existsSync(path.join(configDir, 'opencode.jsonc'))) {
        return { ok: false, method: 'manual', next: manualSteps('opencode'), error: 'opencode.jsonc detected — left untouched' };
      }
      return registerInJson(
        path.join(configDir, 'opencode.json'),
        'mcp',
        { type: 'remote', url: PRAXIS_URL, enabled: true },
        'opencode'
      );
    }
    default:
      return { ok: false, method: 'manual', next: manualSteps(runtimeId) };
  }
}

module.exports = {
  PRAXIS_URL,
  PRAXIS_HOST,
  PRAXIS_NAME,
  detect,
  register,
  manualSteps,
};
