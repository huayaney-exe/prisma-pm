#!/usr/bin/env node

/**
 * pm-tools.cjs — State management CLI for Prisma PM
 *
 * Equivalent to GSD's gsd-tools.cjs but for product management state.
 * Called by /pm:* workflows to manage .product/ directory state.
 *
 * Usage:
 *   node pm-tools.cjs scaffold <product-name>
 *   node pm-tools.cjs init <command> <slug> [--include state,backlog,icp,personas,discoveries,definitions]
 *   node pm-tools.cjs state add-initiative <name> [--power-score N] [--stage discovering]
 *   node pm-tools.cjs state advance-initiative <slug> --to <stage>
 *   node pm-tools.cjs state update-power-score <slug> <score>
 *   node pm-tools.cjs state list-initiatives [--stage X]
 *   node pm-tools.cjs state add-learning <text>
 *   node pm-tools.cjs state validate-workspace
 *   node pm-tools.cjs file list-discoveries
 *   node pm-tools.cjs file list-definitions
 *   node pm-tools.cjs praxis status
 *   node pm-tools.cjs praxis link --workspace <id> --product <id> [--workspace-name <name>]
 *   node pm-tools.cjs praxis record <key> <id> [--work-item <id>] [--version N]
 *   node pm-tools.cjs praxis get <key>
 *   node pm-tools.cjs praxis cursor <cursor>
 *   node pm-tools.cjs praxis queue add|clear <key> | queue list
 *   node pm-tools.cjs praxis unsynced
 *   node pm-tools.cjs praxis nudge on|off
 *   node pm-tools.cjs agents-md --product-name <name> [--transformation "<from> → <to>"]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const PRODUCT_DIR = '.product';

// ── Helpers ───────────────────────────────────────────

function findProductDir() {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, PRODUCT_DIR))) {
      return path.join(dir, PRODUCT_DIR);
    }
    dir = path.dirname(dir);
  }
  return null;
}

function requireProductDir() {
  const productDir = findProductDir();
  if (!productDir) {
    outputError('No .product/ directory found. Run /pm:new first.', 'ERR_NO_WORKSPACE');
    process.exit(1);
  }
  return productDir;
}

function safeReadFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    outputError(`Failed to read ${filePath}: ${err.message}`, 'ERR_READ_FILE');
  }
  return null;
}

function safeWriteFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    return true;
  } catch (err) {
    outputError(`Failed to write ${filePath}: ${err.message}`, 'ERR_WRITE_FILE');
    return false;
  }
}

function safeParseJSON(content, filePath) {
  try {
    return JSON.parse(content);
  } catch (err) {
    outputError(`Invalid JSON in ${filePath}: ${err.message}`, 'ERR_INVALID_JSON');
    return null;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function timestamp() {
  return new Date().toISOString();
}

function today() {
  return timestamp().split('T')[0];
}

function findUpdateCache() {
  const home = os.homedir();
  for (const dir of ['.claude', '.gemini', '.codex', '.config/opencode', '.opencode']) {
    const candidate = path.join(home, dir, 'cache', 'pb-update-check.json');
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(home, '.claude', 'cache', 'pb-update-check.json');
}

function outputJSON(data) {
  console.log(JSON.stringify(data, null, 2));
}

function outputError(message, code) {
  console.error(JSON.stringify({ error: message, code: code || 'ERR_UNKNOWN' }));
}

// ── Frontmatter Parser ───────────────────────────────

function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) return { frontmatter: null, body: content };

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) return { frontmatter: null, body: content };

  const yamlBlock = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();

  const frontmatter = {};
  for (const line of yamlBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Parse simple types
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^\d+$/.test(value)) value = parseInt(value, 10);
    else if (/^\d+\.\d+$/.test(value)) value = parseFloat(value);
    else if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    else if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);

    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

// ── Backlog Table Parser ─────────────────────────────

function parseBacklogTable(content) {
  const initiatives = [];
  const lines = content.split('\n');
  let inTable = false;
  let headerPassed = false;

  for (const line of lines) {
    if (line.startsWith('| Rank |')) {
      inTable = true;
      continue;
    }
    if (inTable && line.startsWith('|---')) {
      headerPassed = true;
      continue;
    }
    if (inTable && headerPassed && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 5) {
        initiatives.push({
          rank: cells[0] === '-' ? null : parseInt(cells[0], 10),
          name: cells[1],
          slug: slugify(cells[1]),
          power_score: cells[2] === '-' ? null : parseInt(cells[2], 10),
          rice_score: cells[3] === '-' ? null : parseInt(cells[3], 10),
          stage: cells[4],
          jobs: cells[5] || '-',
        });
      }
    }
    if (inTable && headerPassed && !line.startsWith('|')) {
      break;
    }
  }

  return initiatives;
}

// ── Scaffold ──────────────────────────────────────────

function scaffold(productName) {
  const dir = path.join(process.cwd(), PRODUCT_DIR);

  const dirs = [
    dir,
    path.join(dir, 'PERSONAS'),
    path.join(dir, 'DISCOVERY'),
    path.join(dir, 'DEFINITIONS'),
    path.join(dir, 'SPRINTS'),
    path.join(dir, 'LAUNCHES'),
    path.join(dir, 'METRICS'),
    path.join(dir, 'RETROS'),
  ];

  for (const d of dirs) {
    fs.mkdirSync(d, { recursive: true });
  }

  const state = `# Product State

## Current Status
- **Product**: ${productName || 'Unnamed Product'}
- **Phase**: Initializing
- **Last Updated**: ${timestamp()}

## Active Initiatives
| Initiative | Stage | Power Score | Last Activity |
|------------|-------|-------------|---------------|

## Learnings
<!-- Compound learnings from retros and validations -->

## Session History
| Date | Command | Action | Outcome |
|------|---------|--------|---------|
| ${today()} | /pm:new | Initialized product workspace | .product/ created |
`;

  const backlog = `# Product Backlog

## Ranked Initiatives
<!-- Force-ranked by RICE + Product Power. No ties. -->

| Rank | Initiative | Power Score | RICE Score | Stage | Jobs Addressed |
|------|------------|-------------|------------|-------|----------------|

## Parking Lot
<!-- Ideas captured but not yet scored or ranked -->
`;

  const config = {
    product_name: productName || 'Unnamed Product',
    version: '0.2.0',
    created_at: timestamp(),
    preferences: {
      default_prd_format: 'lean',
      auto_advance: false,
      persona_count: 3,
    },
    lifecycle_stages: [
      'discovering',
      'validating',
      'defining',
      'designing',
      'requiring',
      'planning',
      'building',
      'testing',
      'launching',
      'measuring',
      'learning',
    ],
  };

  safeWriteFile(path.join(dir, 'STATE.md'), state);
  safeWriteFile(path.join(dir, 'BACKLOG.md'), backlog);
  safeWriteFile(path.join(dir, 'config.json'), JSON.stringify(config, null, 2));

  return { dir, dirs_created: dirs.length, files_created: 3 };
}

// ── Init (load context for a command) ─────────────────

function init(command, slug, includes) {
  const productDir = requireProductDir();

  const includeSet = new Set(includes ? includes.split(',') : []);
  const result = {
    product_dir: productDir,
    command,
    slug: slug || '',
    timestamp: timestamp(),
  };

  if (includeSet.has('state') || includeSet.size === 0) {
    result.state_content = safeReadFile(path.join(productDir, 'STATE.md'));
  }
  if (includeSet.has('backlog')) {
    result.backlog_content = safeReadFile(path.join(productDir, 'BACKLOG.md'));
  }
  if (includeSet.has('product')) {
    result.product_content = safeReadFile(path.join(productDir, 'PRODUCT.md'));
  }
  if (includeSet.has('icp')) {
    result.icp_content = safeReadFile(path.join(productDir, 'ICP.md'));
  }
  if (includeSet.has('personas')) {
    const personaDir = path.join(productDir, 'PERSONAS');
    if (fs.existsSync(personaDir)) {
      const files = fs.readdirSync(personaDir).filter(f => f.endsWith('.md'));
      result.personas = {};
      for (const file of files) {
        result.personas[file] = fs.readFileSync(path.join(personaDir, file), 'utf-8');
      }
    }
  }
  if (includeSet.has('config')) {
    const configPath = path.join(productDir, 'config.json');
    const raw = safeReadFile(configPath);
    if (raw) result.config = safeParseJSON(raw, configPath);
  }
  if (includeSet.has('discoveries')) {
    result.discoveries = listDiscoveries(productDir);
  }
  if (includeSet.has('definitions')) {
    result.definitions = listDefinitions(productDir);
  }

  // Load specific discovery/definition if slug provided
  if (slug) {
    result.brief_content = safeReadFile(path.join(productDir, 'DISCOVERY', `${slug}-BRIEF.md`));
    result.validation_content = safeReadFile(path.join(productDir, 'DISCOVERY', `${slug}-VALIDATION.md`));
    result.prd_content = safeReadFile(path.join(productDir, 'DEFINITIONS', `${slug}-PRD.md`));
    result.requirements_content = safeReadFile(path.join(productDir, 'DEFINITIONS', `${slug}-REQUIREMENTS.md`));
  }

  result.praxis = praxisSummary(productDir);

  // Check for update cache (scan runtimes)
  const cacheFile = findUpdateCache();
  try {
    if (fs.existsSync(cacheFile)) {
      const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      if (cache.update_available) {
        result.update_available = true;
        result.update_latest = cache.latest;
        result.update_installed = cache.installed;
      }
    }
  } catch (e) {}

  outputJSON(result);
}

// ── State Operations ──────────────────────────────────

function stateAddInitiative(name, powerScore, stage) {
  const productDir = requireProductDir();

  const backlogPath = path.join(productDir, 'BACKLOG.md');
  let backlog = fs.readFileSync(backlogPath, 'utf-8');

  const slug = slugify(name);
  const row = `| - | ${name} | ${powerScore || '-'} | - | ${stage || 'discovering'} | - |`;

  backlog = backlog.replace(
    /(## Ranked Initiatives\n.*\n\|.*\|.*\|.*\|.*\|.*\|.*\|)/s,
    `$1\n${row}`
  );

  safeWriteFile(backlogPath, backlog);

  const statePath = path.join(productDir, 'STATE.md');
  let state = fs.readFileSync(statePath, 'utf-8');
  state = state.replace(
    /\*\*Last Updated\*\*: .*/,
    `**Last Updated**: ${timestamp()}`
  );

  const stateRow = `| ${name} | ${stage || 'discovering'} | ${powerScore || '-'} | ${today()} |`;
  state = state.replace(
    /(## Active Initiatives\n\|.*\|\n\|.*\|)/s,
    `$1\n${stateRow}`
  );

  safeWriteFile(statePath, state);

  outputJSON({ action: 'add-initiative', slug, name, stage: stage || 'discovering' });
}

function stateAdvanceInitiative(slug, toStage) {
  const productDir = requireProductDir();

  const statePath = path.join(productDir, 'STATE.md');
  let state = fs.readFileSync(statePath, 'utf-8');
  state = state.replace(
    /\*\*Last Updated\*\*: .*/,
    `**Last Updated**: ${timestamp()}`
  );
  safeWriteFile(statePath, state);

  outputJSON({ action: 'advance-initiative', slug, to: toStage });
}

function stateUpdatePowerScore(slug, score) {
  const productDir = requireProductDir();

  const backlogPath = path.join(productDir, 'BACKLOG.md');
  let backlog = fs.readFileSync(backlogPath, 'utf-8');

  // Find the initiative row by slug match (slugify each initiative name)
  const lines = backlog.split('\n');
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('|') && !lines[i].startsWith('| Rank') && !lines[i].startsWith('|---')) {
      const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3 && slugify(cells[1]) === slug) {
        cells[2] = String(score);
        lines[i] = '| ' + cells.join(' | ') + ' |';
        updated = true;
        break;
      }
    }
  }

  if (updated) {
    safeWriteFile(backlogPath, lines.join('\n'));
  }

  // Update STATE.md timestamp
  const statePath = path.join(productDir, 'STATE.md');
  let state = fs.readFileSync(statePath, 'utf-8');
  state = state.replace(/\*\*Last Updated\*\*: .*/, `**Last Updated**: ${timestamp()}`);
  safeWriteFile(statePath, state);

  outputJSON({ action: 'update-power-score', slug, score, updated });
}

function stateListInitiatives(filterStage) {
  const productDir = requireProductDir();

  const backlogPath = path.join(productDir, 'BACKLOG.md');
  const backlog = safeReadFile(backlogPath);
  if (!backlog) {
    outputJSON([]);
    return;
  }

  let initiatives = parseBacklogTable(backlog);

  if (filterStage) {
    initiatives = initiatives.filter(i => i.stage === filterStage);
  }

  outputJSON(initiatives);
}

function stateAddLearning(text) {
  const productDir = requireProductDir();

  const statePath = path.join(productDir, 'STATE.md');
  let state = fs.readFileSync(statePath, 'utf-8');

  state = state.replace(
    /(## Learnings\n)/,
    `$1- [${today()}] ${text}\n`
  );

  state = state.replace(
    /\*\*Last Updated\*\*: .*/,
    `**Last Updated**: ${timestamp()}`
  );

  safeWriteFile(statePath, state);
  outputJSON({ action: 'add-learning', text });
}

function stateValidateWorkspace() {
  const productDir = findProductDir();

  if (!productDir) {
    outputJSON({ valid: false, missing: ['.product/'], warnings: ['No workspace found. Run /pm:new first.'] });
    return;
  }

  const missing = [];
  const warnings = [];

  // Required files
  const requiredFiles = ['STATE.md', 'BACKLOG.md', 'config.json'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(productDir, file))) {
      missing.push(file);
    }
  }

  // Required directories
  const requiredDirs = ['PERSONAS', 'DISCOVERY', 'DEFINITIONS'];
  for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(productDir, dir))) {
      missing.push(dir + '/');
    }
  }

  // Validate config.json is valid JSON
  const configPath = path.join(productDir, 'config.json');
  if (fs.existsSync(configPath)) {
    const raw = safeReadFile(configPath);
    if (raw && !safeParseJSON(raw, configPath)) {
      warnings.push('config.json contains invalid JSON');
    }
  }

  // Optional files — warn if missing
  if (!fs.existsSync(path.join(productDir, 'PRODUCT.md'))) {
    warnings.push('PRODUCT.md not found — run /pm:new to create it');
  }
  if (!fs.existsSync(path.join(productDir, 'ICP.md'))) {
    warnings.push('ICP.md not found — run /pm:icp to define your customer profile');
  }

  outputJSON({
    valid: missing.length === 0,
    product_dir: productDir,
    missing,
    warnings,
  });
}


// ── Praxis link (product memory MCP) ─────────────────
// .product/praxis.json maps local artifacts to Praxis ids so re-runs
// version the same artifact instead of duplicating it.

const PRAXIS_FILE = 'praxis.json';

function emptyPraxis() {
  return {
    workspace_id: null,
    workspace_name: null,
    product_id: null,
    linked_at: null,
    cursor: null,
    nudge: true,
    team_notice_shown: false,
    records: {},
    queue: [],
  };
}

function readPraxis(productDir) {
  const raw = safeReadFile(path.join(productDir, PRAXIS_FILE));
  if (!raw) return emptyPraxis();
  try {
    return { ...emptyPraxis(), ...JSON.parse(raw) };
  } catch (e) {
    return emptyPraxis();
  }
}

function writePraxis(productDir, data) {
  safeWriteFile(path.join(productDir, PRAXIS_FILE), JSON.stringify(data, null, 2) + '\n');
}

function contentHash(filePath) {
  const content = safeReadFile(filePath);
  return content === null ? null : crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

// Every local artifact that has a Praxis counterpart, keyed "<kind>/<slug>"
// (product-level kinds use the bare kind: "vision", "icp").
function localArtifacts(productDir) {
  const out = [];
  const add = (key, kind, slug, rel) => {
    if (fs.existsSync(path.join(productDir, rel))) out.push({ key, kind, slug, file: rel });
  };
  add('vision', 'vision', 'vision', 'PRODUCT.md');
  add('icp', 'icp', 'icp', 'ICP.md');

  const listDir = (dir, suffix) => {
    const full = path.join(productDir, dir);
    if (!fs.existsSync(full)) return [];
    return fs.readdirSync(full).filter(f => f.endsWith(suffix)).map(f => f.slice(0, -suffix.length));
  };
  for (const slug of listDir('PERSONAS', '-PERSONA.md')) add(`persona/${slug}`, 'persona', slug, `PERSONAS/${slug}-PERSONA.md`);
  for (const slug of listDir('DISCOVERY', '-BRIEF.md')) add(`discovery/${slug}`, 'discovery', slug, `DISCOVERY/${slug}-BRIEF.md`);
  for (const slug of listDir('DISCOVERY', '-VALIDATION.md')) add(`hypothesis/${slug}`, 'hypothesis', slug, `DISCOVERY/${slug}-VALIDATION.md`);
  for (const slug of listDir('DEFINITIONS', '-PRD.md')) add(`prd/${slug}`, 'prd', slug, `DEFINITIONS/${slug}-PRD.md`);
  for (const slug of listDir('DEFINITIONS', '-DESIGN.md')) add(`design/${slug}`, 'design', slug, `DEFINITIONS/${slug}-DESIGN.md`);
  for (const slug of listDir('DEFINITIONS', '-REQUIREMENTS.md')) add(`requirements/${slug}`, 'requirements', slug, `DEFINITIONS/${slug}-REQUIREMENTS.md`);
  return out;
}

function unsyncedArtifacts(productDir, praxis) {
  return localArtifacts(productDir)
    .map(a => {
      const rec = praxis.records[a.key];
      const hash = contentHash(path.join(productDir, a.file));
      const status = !rec ? 'new' : (rec.hash !== hash ? 'modified' : 'synced');
      return { ...a, status, id: rec ? rec.id : null };
    })
    .filter(a => a.status !== 'synced');
}

function praxisSummary(productDir) {
  const praxis = readPraxis(productDir);
  const unsynced = unsyncedArtifacts(productDir, praxis);
  return {
    linked: Boolean(praxis.product_id),
    workspace_id: praxis.workspace_id,
    workspace_name: praxis.workspace_name,
    product_id: praxis.product_id,
    cursor: praxis.cursor,
    nudge: praxis.nudge,
    team_notice_shown: praxis.team_notice_shown,
    records_count: Object.keys(praxis.records).length,
    queue: praxis.queue,
    unsynced_count: unsynced.length,
  };
}

function praxisStatus() {
  const productDir = findProductDir();
  if (!productDir) {
    outputJSON({ workspace: false, linked: false });
    return;
  }
  const praxis = readPraxis(productDir);
  outputJSON({
    workspace: true,
    ...praxisSummary(productDir),
    unsynced: unsyncedArtifacts(productDir, praxis),
  });
}

function praxisLink(workspaceId, productId, workspaceName) {
  const productDir = requireProductDir();
  if (!productId) {
    outputError('praxis link requires --product <id>', 'ERR_MISSING_ARG');
    process.exit(1);
  }
  const praxis = readPraxis(productDir);
  praxis.workspace_id = workspaceId || praxis.workspace_id;
  praxis.workspace_name = workspaceName || praxis.workspace_name;
  praxis.product_id = productId;
  praxis.linked_at = timestamp();
  writePraxis(productDir, praxis);
  outputJSON({ action: 'praxis-link', workspace_id: praxis.workspace_id, product_id: productId });
}

function praxisRecord(key, id, workItemId, version) {
  const productDir = requireProductDir();
  if (!key || !id) {
    outputError('praxis record requires <key> <id>', 'ERR_MISSING_ARG');
    process.exit(1);
  }
  const praxis = readPraxis(productDir);
  const local = localArtifacts(productDir).find(a => a.key === key);
  praxis.records[key] = {
    id,
    work_item_id: workItemId || (praxis.records[key] && praxis.records[key].work_item_id) || null,
    version: version ? parseInt(version, 10) : null,
    file: local ? local.file : null,
    hash: local ? contentHash(path.join(productDir, local.file)) : null,
    synced_at: timestamp(),
  };
  praxis.queue = praxis.queue.filter(q => q.key !== key);
  writePraxis(productDir, praxis);
  outputJSON({ action: 'praxis-record', key, ...praxis.records[key] });
}

function praxisGet(key) {
  const productDir = requireProductDir();
  const praxis = readPraxis(productDir);
  outputJSON({ key, record: praxis.records[key] || null });
}

function praxisCursor(cursor) {
  const productDir = requireProductDir();
  const praxis = readPraxis(productDir);
  praxis.cursor = cursor || null;
  writePraxis(productDir, praxis);
  outputJSON({ action: 'praxis-cursor', cursor: praxis.cursor });
}

function praxisQueue(action, key, reason) {
  const productDir = requireProductDir();
  const praxis = readPraxis(productDir);
  if (action === 'add') {
    if (!praxis.queue.some(q => q.key === key)) praxis.queue.push({ key, reason: reason || null, queued_at: timestamp() });
    writePraxis(productDir, praxis);
  } else if (action === 'clear') {
    praxis.queue = key ? praxis.queue.filter(q => q.key !== key) : [];
    writePraxis(productDir, praxis);
  }
  outputJSON({ queue: praxis.queue });
}

function praxisSet(field, value) {
  const productDir = requireProductDir();
  const praxis = readPraxis(productDir);
  praxis[field] = value;
  writePraxis(productDir, praxis);
  outputJSON({ action: `praxis-${field}`, [field]: value });
}

// ── AGENTS.md (cross-agent project instructions) ─────
// Claude Code reads AGENTS.md natively (v2.1.277+) only when no CLAUDE.md
// counts for the working directory; otherwise CLAUDE.md must import it.

const AGENTS_START = '<!-- praxis:start -->';
const AGENTS_END = '<!-- praxis:end -->';

function agentsBlock(praxis) {
  if (praxis.product_id) {
    return `${AGENTS_START}
## Product memory: Praxis

This product is managed in **Praxis** — Prisma's multiplayer product-memory MCP server
(\`https://mcp.getprisma.lat/mcp\`). The team's ICEDG-scored backlog, committed bets with
kill criteria and review dates, tasks with owners, versioned deliverables (vision, ICP,
PRDs, designs, requirements) and decisions live there. Praxis is the source of truth;
\`.product/\` is a local mirror.

- Product: \`${praxis.product_id}\`${praxis.workspace_id ? ` · Workspace: \`${praxis.workspace_id}\`` : ''}
- Start every session with \`pm_get_state\`, then \`pm_get_changes\` to see what teammates changed.
- Task with an owner and a date → \`pm_add_task\` (assignees: \`pm_list_members\`)
- Idea or bet for the backlog → \`pm_add_work_item\`; commit it with \`pm_commit_work_item\`
- Decision, insight or blocker → \`pm_add_learning\`
- PRD, discovery, design, requirements → \`pm_save_artifact\` (visibility: team)
- Building or changing something? Read the spec first: \`pm_get_backlog\` / \`pm_get_work_item\` for the
  initiative, then \`pm_get_artifact\` (\`view: "full"\`) for its PRD, design and requirements — and
  record decisions you make while building with \`pm_add_learning\` so the PM sees them.

No Praxis tools in your session? Read \`.product/\` instead, and connect Praxis with
\`npx product-builder@latest --praxis\`. It's always the better path: the context survives
sessions, machines and agents, and the whole team sees it.
${AGENTS_END}`;
  }
  return `${AGENTS_START}
## Product memory

This product's context lives in \`.product/\` (see below) — read it before product work.
Tasks, backlog and decisions are designed to live in **Praxis**, Prisma's multiplayer
product-memory MCP server (\`https://mcp.getprisma.lat/mcp\`). If Praxis tools
(\`pm_get_state\`, \`pm_add_task\`, \`pm_add_work_item\`…) are available in your session,
use them; to connect Praxis: \`npx product-builder@latest --praxis\`.
${AGENTS_END}`;
}

const AGENTS_FILES_SECTION = `## Product files (\`.product/\`)

- \`PRODUCT.md\` — vision, transformation thesis, Product Power score
- \`ICP.md\` — ideal customer profile and disqualification criteria
- \`PERSONAS/\` — synthetic personas
- \`DISCOVERY/\` — discovery briefs and validation plans
- \`DEFINITIONS/\` — PRDs, design specs, requirements
- \`BACKLOG.md\`, \`STATE.md\` — local backlog and state
`;

function claudeVersionBelow(minimum) {
  try {
    const out = execFileSync('claude', ['--version'], { encoding: 'utf-8', timeout: 4000, stdio: ['ignore', 'pipe', 'ignore'] });
    const m = out.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return false;
    const [a, b, c] = m.slice(1).map(Number);
    const [x, y, z] = minimum;
    return a < x || (a === x && (b < y || (b === y && c < z)));
  } catch (e) {
    return false; // claude not installed → nothing to adapt for
  }
}

// CLAUDE.md files that make Claude Code skip AGENTS.md: in the project
// root or any directory above it — except the user's ~/.claude/CLAUDE.md.
function findCountingClaudeMd(root) {
  const userMemory = path.join(os.homedir(), '.claude', 'CLAUDE.md');
  const found = { root: null, above: null };
  for (const name of ['CLAUDE.md', path.join('.claude', 'CLAUDE.md'), 'CLAUDE.local.md']) {
    const candidate = path.join(root, name);
    if (fs.existsSync(candidate)) { found.root = candidate; break; }
  }
  let dir = path.dirname(root);
  while (dir !== path.dirname(dir) && !found.above) {
    for (const name of ['CLAUDE.md', path.join('.claude', 'CLAUDE.md'), 'CLAUDE.local.md']) {
      const candidate = path.join(dir, name);
      if (candidate !== userMemory && fs.existsSync(candidate)) { found.above = candidate; break; }
    }
    dir = path.dirname(dir);
  }
  return found;
}

function writeAgentsMd(productName, transformation) {
  const productDir = requireProductDir();
  const root = path.dirname(productDir);
  const praxis = readPraxis(productDir);
  const block = agentsBlock(praxis);
  const agentsPath = path.join(root, 'AGENTS.md');

  let agentsAction;
  const existing = safeReadFile(agentsPath);
  if (existing === null) {
    const header = `# ${productName || 'Product'}\n\n${transformation ? `${transformation}\n\n` : ''}`;
    safeWriteFile(agentsPath, `${header}${block}\n\n${AGENTS_FILES_SECTION}`);
    agentsAction = 'created';
  } else if (existing.includes(AGENTS_START) && existing.includes(AGENTS_END)) {
    const start = existing.indexOf(AGENTS_START);
    const end = existing.indexOf(AGENTS_END) + AGENTS_END.length;
    safeWriteFile(agentsPath, existing.slice(0, start) + block + existing.slice(end));
    agentsAction = 'updated';
  } else {
    safeWriteFile(agentsPath, `${existing.replace(/\s*$/, '')}\n\n${block}\n`);
    agentsAction = 'appended';
  }

  // Make sure Claude Code loads it
  let claudeAction = 'none';
  const counting = findCountingClaudeMd(root);
  const rootClaude = path.join(root, 'CLAUDE.md');
  const importLine = '@AGENTS.md';
  const hasImport = (file) => (safeReadFile(file) || '').split('\n').some(l => l.trim() === importLine);

  if (counting.root && counting.root.endsWith('CLAUDE.local.md') && !fs.existsSync(rootClaude)) {
    safeWriteFile(rootClaude, `${importLine}\n`);
    claudeAction = 'created';
  } else if (counting.root && !counting.root.endsWith('CLAUDE.local.md')) {
    if (!hasImport(counting.root)) {
      const current = safeReadFile(counting.root) || '';
      safeWriteFile(counting.root, `${current.replace(/\s*$/, '')}\n\n${importLine}\n`);
      claudeAction = 'appended';
    }
  } else if (counting.above || claudeVersionBelow([2, 1, 277])) {
    if (!fs.existsSync(rootClaude)) {
      safeWriteFile(rootClaude, `${importLine}\n`);
      claudeAction = 'created';
    } else if (!hasImport(rootClaude)) {
      safeWriteFile(rootClaude, `${(safeReadFile(rootClaude) || '').replace(/\s*$/, '')}\n\n${importLine}\n`);
      claudeAction = 'appended';
    }
  }

  outputJSON({
    agents_md: agentsAction,
    agents_path: agentsPath,
    mode: praxis.product_id ? 'praxis' : 'local',
    claude_md: claudeAction,
    claude_md_path: claudeAction === 'none' ? null : (counting.root && !counting.root.endsWith('CLAUDE.local.md') ? counting.root : rootClaude),
  });
}

// ── File Operations ───────────────────────────────────

function listDiscoveries(productDir) {
  productDir = productDir || requireProductDir();
  const discoveryDir = path.join(productDir, 'DISCOVERY');
  const results = [];

  if (!fs.existsSync(discoveryDir)) return results;

  const files = fs.readdirSync(discoveryDir).filter(f => f.endsWith('-BRIEF.md'));
  for (const file of files) {
    const slug = file.replace('-BRIEF.md', '');
    const content = safeReadFile(path.join(discoveryDir, file));
    const { frontmatter } = parseFrontmatter(content);

    const hasValidation = fs.existsSync(path.join(discoveryDir, `${slug}-VALIDATION.md`));

    results.push({
      slug,
      file,
      title: frontmatter?.initiative || slug,
      stage: frontmatter?.stage || 'discovering',
      power_score: frontmatter?.power_score || null,
      assumptions_count: frontmatter?.assumptions_count || 0,
      has_validation: hasValidation,
      created: frontmatter?.discovered || null,
    });
  }

  return results;
}

function listDefinitions(productDir) {
  productDir = productDir || requireProductDir();
  const defsDir = path.join(productDir, 'DEFINITIONS');
  const results = [];

  if (!fs.existsSync(defsDir)) return results;

  const files = fs.readdirSync(defsDir).filter(f => f.endsWith('-PRD.md'));
  for (const file of files) {
    const slug = file.replace('-PRD.md', '');
    const content = safeReadFile(path.join(defsDir, file));
    const { frontmatter } = parseFrontmatter(content);

    const hasRequirements = fs.existsSync(path.join(defsDir, `${slug}-REQUIREMENTS.md`));

    results.push({
      slug,
      file,
      title: frontmatter?.initiative || slug,
      format: frontmatter?.format || 'lean',
      stage: frontmatter?.stage || 'defining',
      power_score: frontmatter?.power_score || null,
      has_requirements: hasRequirements,
      linked_discovery: slug,
      created: frontmatter?.created || null,
    });
  }

  return results;
}

// ── Main ──────────────────────────────────────────────

const [,, command, ...rest] = process.argv;

function getFlag(args, flag) {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
}

function getNonFlagArgs(args) {
  const result = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { i++; continue; }
    result.push(args[i]);
  }
  return result;
}

switch (command) {
  case 'scaffold': {
    const name = rest.join(' ') || 'Unnamed Product';
    const result = scaffold(name);
    outputJSON(result);
    break;
  }

  case 'init': {
    const [subcommand, slug] = rest;
    const includes = getFlag(rest, '--include');
    init(subcommand, slug, includes);
    break;
  }

  case 'state': {
    const [action, ...actionArgs] = rest;
    switch (action) {
      case 'add-initiative': {
        const name = getNonFlagArgs(actionArgs).join(' ');
        const score = getFlag(actionArgs, '--power-score');
        const stage = getFlag(actionArgs, '--stage');
        stateAddInitiative(name, score, stage);
        break;
      }
      case 'advance-initiative': {
        const slug = actionArgs[0];
        const to = getFlag(actionArgs, '--to');
        stateAdvanceInitiative(slug, to);
        break;
      }
      case 'update-power-score': {
        const slug = actionArgs[0];
        const score = actionArgs[1];
        stateUpdatePowerScore(slug, parseInt(score, 10));
        break;
      }
      case 'list-initiatives': {
        const stage = getFlag(actionArgs, '--stage');
        stateListInitiatives(stage);
        break;
      }
      case 'add-learning': {
        const text = actionArgs.join(' ');
        stateAddLearning(text);
        break;
      }
      case 'validate-workspace': {
        stateValidateWorkspace();
        break;
      }
      default:
        outputError(`Unknown state action: ${action}`, 'ERR_UNKNOWN_ACTION');
        process.exit(1);
    }
    break;
  }

  case 'file': {
    const [action] = rest;
    const productDir = requireProductDir();
    switch (action) {
      case 'list-discoveries': {
        outputJSON(listDiscoveries(productDir));
        break;
      }
      case 'list-definitions': {
        outputJSON(listDefinitions(productDir));
        break;
      }
      default:
        outputError(`Unknown file action: ${action}`, 'ERR_UNKNOWN_ACTION');
        process.exit(1);
    }
    break;
  }

  case 'praxis': {
    const [action, ...actionArgs] = rest;
    switch (action) {
      case 'status':
        praxisStatus();
        break;
      case 'link':
        praxisLink(getFlag(actionArgs, '--workspace'), getFlag(actionArgs, '--product'), getFlag(actionArgs, '--workspace-name'));
        break;
      case 'record': {
        const [key, id] = getNonFlagArgs(actionArgs);
        praxisRecord(key, id, getFlag(actionArgs, '--work-item'), getFlag(actionArgs, '--version'));
        break;
      }
      case 'get':
        praxisGet(actionArgs[0]);
        break;
      case 'cursor':
        praxisCursor(actionArgs[0]);
        break;
      case 'queue': {
        const [queueAction, key] = getNonFlagArgs(actionArgs);
        praxisQueue(queueAction || 'list', key, getFlag(actionArgs, '--reason'));
        break;
      }
      case 'unsynced': {
        const productDir = requireProductDir();
        outputJSON(unsyncedArtifacts(productDir, readPraxis(productDir)));
        break;
      }
      case 'nudge':
        praxisSet('nudge', actionArgs[0] !== 'off');
        break;
      case 'team-notice-shown':
        praxisSet('team_notice_shown', true);
        break;
      default:
        outputError(`Unknown praxis action: ${action}`, 'ERR_UNKNOWN_ACTION');
        process.exit(1);
    }
    break;
  }

  case 'agents-md': {
    writeAgentsMd(getFlag(rest, '--product-name'), getFlag(rest, '--transformation'));
    break;
  }

  default:
    outputError(`Unknown command: ${command}`, 'ERR_UNKNOWN_COMMAND');
    console.error('Usage: pm-tools <scaffold|init|state|file|praxis|agents-md> [args]');
    process.exit(1);
}
