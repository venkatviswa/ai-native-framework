#!/usr/bin/env node
// drift-check: keeps spec.md, plan.md, tasks.md, tests and commits on one ID thread.
//
//   node scripts/drift-check.mjs                 dev mode, checks staged files
//   node scripts/drift-check.mjs --base main     dev mode, checks files changed since main (CI)
//   node scripts/drift-check.mjs --complete      every requirement and criterion has a test
//   node scripts/drift-check.mjs --feature docs/reminders
//   node scripts/drift-check.mjs --run-tests     run config.testCommand first (pre-commit)
//   node scripts/drift-check.mjs --commit-msg .git/COMMIT_EDITMSG
//
// It checks references, not meaning. A human still reviews whether a test proves its criterion.
// Optional config in .ainf.json at the repo root; see DEFAULTS.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULTS = {
  featuresDir: 'docs',
  codeDirs: ['src', 'lib', 'app', 'force-app'],
  testPatterns: [
    'test/**', 'tests/**', '**/__tests__/**',
    '**/*.test.*', '**/*.spec.*', '**/*_test.*', '**/*Test.cls', '**/*Tests.cls',
  ],
  testCommand: null,
};

const REQ_DEF = /^\s*(?:[-*]\s+)?(?:\*\*)?(R\d+)\b/;
const AC_DEF = /^\s*(?:[-*]\s+)?(?:\*\*)?(AC\d+[a-z]?)\b/;
const TASK_DEF = /^\s*[-*]\s+\[[ xX]\]\s+(?:\*\*)?(T\d+[a-z]?)\b/;
const ID_REF = /\b(AC\d+[a-z]?|R\d+)\b/g;
const COMMIT_ID = /\bT\d+[a-z]?\b.*\(\s*R\d+(?:\s*,\s*R\d+)*\s*\)/;

export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      if (glob[i + 2] === '/') { re += '(?:.*/)?'; i += 2; } else { re += '.*'; i += 1; }
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

const matchesAny = (file, globs) => globs.some((g) => globToRegExp(g).test(file));

function git(args, cwd) {
  try { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return null; }
}

const lines = (s) => (s || '').split('\n').map((l) => l.trim()).filter(Boolean);

function section(text, heading) {
  const out = [];
  let inside = false;
  for (const line of text.split('\n')) {
    if (/^#{1,6}\s/.test(line)) inside = new RegExp(`^#{1,6}\\s*${heading}`, 'i').test(line);
    else if (inside) out.push(line);
  }
  return out;
}

const backticked = (line) => [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());

export function parseSpec(text) {
  const requirements = new Set();
  const criteria = new Map(); // AC id -> [R ids it verifies]
  for (const line of text.split('\n')) {
    const ac = line.match(AC_DEF);
    if (ac) {
      const mapped = line.slice(ac.index + ac[0].length).match(/^\s*\(([^)]*)\)/);
      criteria.set(ac[1], mapped ? (mapped[1].match(/R\d+/g) || []) : []);
      continue;
    }
    const r = line.match(REQ_DEF);
    if (r) requirements.add(r[1]);
  }
  return { requirements, criteria };
}

export function parseTasks(text) {
  const tasks = [];
  for (const line of text.split('\n')) {
    const t = line.match(TASK_DEF);
    if (t) tasks.push({ id: t[1], refs: new Set(line.slice(t.index + t[0].length).match(ID_REF) || []) });
  }
  return tasks;
}

export function parseBoundaries(planText) {
  const allow = [];
  const ask = [];
  for (const line of section(planText, 'Action boundaries')) {
    if (/may edit|allowed?:/i.test(line)) allow.push(...backticked(line));
    else if (/ask first|needs? (human )?approval|ask:/i.test(line)) ask.push(...backticked(line));
  }
  return { allow, ask };
}

function listFiles(root) {
  const listed = git(['ls-files', '--cached', '--others', '--exclude-standard'], root);
  if (listed !== null) return lines(listed);
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === '.git' || name === 'node_modules') continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full); else out.push(relative(root, full).split(sep).join('/'));
    }
  };
  walk(root);
  return out;
}

function changedFiles(root, base) {
  if (base) {
    if (base.startsWith('-')) throw new Error(`--base must be a git ref, got "${base}"`);
    return lines(git(['diff', '--name-only', `${base}...HEAD`], root));
  }
  return lines(git(['diff', '--cached', '--name-only', '--diff-filter=ACMRD'], root));
}

function loadConfig(root) {
  const file = join(root, '.ainf.json');
  return existsSync(file) ? { ...DEFAULTS, ...JSON.parse(readFileSync(file, 'utf8')) } : { ...DEFAULTS };
}

function discoverFeatures(root, config, only) {
  if (only) return existsSync(join(root, only, 'spec.md')) ? [only.replace(/\/$/, '')] : [];
  const dir = join(root, config.featuresDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((name) => `${config.featuresDir}/${name}`)
    .filter((f) => existsSync(join(root, f, 'spec.md')));
}

const isTest = (config, f) => !f.startsWith(`${config.featuresDir}/`) && !f.endsWith('.md') && matchesAny(f, config.testPatterns);
const isCode = (config, f) => config.codeDirs.some((d) => f === d || f.startsWith(`${d}/`));

const read = (root, file) => (existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : '');

export function check({ root = process.cwd(), complete = false, base = null, feature = null, changed = null } = {}) {
  const config = loadConfig(root);
  const problems = [];
  const notes = [];
  const features = discoverFeatures(root, config, feature);
  if (features.length === 0) {
    notes.push(`no feature found (looked for ${feature || config.featuresDir + '/*'}/spec.md)`);
    return { problems, notes, features };
  }

  const files = listFiles(root);
  const testFiles = files.filter((f) => isTest(config, f));
  const testRefs = new Set();
  for (const f of testFiles) for (const id of read(root, f).match(ID_REF) || []) testRefs.add(id);

  const allDefined = new Set();
  const allow = [];
  const ask = [];

  for (const feat of features) {
    const { requirements, criteria } = parseSpec(read(root, `${feat}/spec.md`));
    const defined = new Set([...requirements, ...criteria.keys()]);
    defined.forEach((id) => allDefined.add(id));
    const plan = read(root, `${feat}/plan.md`);
    const tasksText = read(root, `${feat}/tasks.md`);
    const tasks = parseTasks(tasksText);

    for (const [file, text] of [['plan.md', plan], ['tasks.md', tasksText]]) {
      const stale = [...new Set(text.match(ID_REF) || [])].filter((id) => !defined.has(id));
      if (stale.length) problems.push(`${feat}/${file} cites ${stale.join(', ')}, not defined in spec.md (stale ID)`);
    }
    for (const [ac, reqs] of criteria) {
      const bad = reqs.filter((r) => !requirements.has(r));
      if (bad.length) problems.push(`${feat}/spec.md ${ac} maps to ${bad.join(', ')}, not a requirement`);
    }

    if (tasksText) {
      const cited = new Set(tasks.flatMap((t) => [...t.refs]));
      for (const t of tasks) if (![...t.refs].some((id) => id.startsWith('R'))) problems.push(`${feat}/tasks.md ${t.id} names no requirement`);
      for (const r of requirements) if (!cited.has(r)) problems.push(`${r} is in ${feat}/spec.md but no task cites it`);
    } else if (requirements.size) {
      notes.push(`${feat}: no tasks.md yet`);
    }

    const untested = [...criteria.keys()].filter((ac) => !testRefs.has(ac));
    const reqTested = (r) => testRefs.has(r) || [...criteria].some(([ac, reqs]) => reqs.includes(r) && testRefs.has(ac));
    const untestedReqs = [...requirements].filter((r) => !reqTested(r));
    if (complete) {
      for (const ac of untested) problems.push(`${ac} is in ${feat}/spec.md but no test cites it`);
      for (const r of untestedReqs) problems.push(`${r} is in ${feat}/spec.md but no test covers it or any of its criteria`);
    } else if (untested.length) {
      notes.push(`${untested.join(', ')} not yet tested: fine while in progress`);
    }

    const b = parseBoundaries(plan);
    allow.push(...b.allow);
    ask.push(...b.ask);
  }

  const staleInTests = [...testRefs].filter((id) => !allDefined.has(id));
  if (staleInTests.length) problems.push(`tests cite ${staleInTests.sort().join(', ')}, not defined in any spec.md (stale ID)`);

  const touched = changed ?? changedFiles(root, base);
  if (touched.length && allow.length) {
    const approved = (process.env.AINF_APPROVED || '').split(',').map((s) => s.trim()).filter(Boolean);
    // Boundaries govern code and tests. Config, CI and hooks are guarded by permissions and review.
    const governed = (f) => isCode(config, f) || isTest(config, f);
    for (const f of touched.filter(governed)) {
      if (matchesAny(f, ask) && !approved.includes(f)) {
        problems.push(`${f} needs human approval (plan.md: Ask first). Once approved: AINF_APPROVED=${f}`);
      } else if (!matchesAny(f, allow) && !matchesAny(f, ask)) {
        problems.push(`${f} is ${base ? 'changed' : 'staged'} but outside plan.md's action boundaries`);
      }
    }
  } else if (touched.length) {
    notes.push('no "May edit:" globs in any plan.md Action boundaries section; boundary check skipped');
  }

  return { problems, notes, features };
}

export function checkCommitMessage(message, stagedFiles, config = DEFAULTS) {
  const subject = message.split('\n').find((l) => l.trim() && !l.startsWith('#')) || '';
  if (/^(Merge|Revert|fixup!|squash!)/.test(subject)) return null;
  const touchesCode = stagedFiles.some((f) => isCode(config, f));
  if (!touchesCode || COMMIT_ID.test(subject)) return null;
  return `commit touches ${config.codeDirs.join('/, ')}/ but the subject names no task and requirement.\n  Expected e.g. "T3 (R1): scan due tasks", got "${subject}"`;
}

function main(argv) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
  const root = git(['rev-parse', '--show-toplevel'], process.cwd())?.trim() || process.cwd();
  const config = loadConfig(root);

  const msgFile = arg('--commit-msg');
  if (msgFile) {
    const err = checkCommitMessage(readFileSync(msgFile, 'utf8'), changedFiles(root, null), config);
    if (err) { console.error(`drift-check (commit-msg): ${err}`); return 1; }
    return 0;
  }

  if (argv.includes('--run-tests') && config.testCommand) {
    // testCommand comes from the repo's own committed .ainf.json, like an npm script.
    const r = spawnSync(config.testCommand, { cwd: root, shell: true, stdio: 'inherit' });
    if (r.status !== 0) { console.error('drift-check: tests failed, commit blocked'); return 1; }
  }

  const complete = argv.includes('--complete');
  const { problems, notes } = check({ root, complete, base: arg('--base'), feature: arg('--feature') });
  console.log(`drift-check (${complete ? 'complete' : 'dev'}): ${problems.length} problem(s)`);
  for (const p of problems) console.log(`  - ${p}`);
  for (const n of notes) console.log(`  (${n})`);
  if (complete && problems.length) console.log('Run this before calling the feature done.');
  return problems.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main(process.argv.slice(2)));
