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
 */

const fs = require('fs');
const path = require('path');

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

  default:
    outputError(`Unknown command: ${command}`, 'ERR_UNKNOWN_COMMAND');
    console.error('Usage: pm-tools <scaffold|init|state|file> [args]');
    process.exit(1);
}
