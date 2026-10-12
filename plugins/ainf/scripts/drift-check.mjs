#!/usr/bin/env node
// drift-check: keeps spec.md, plan.md, tasks.md, tests and commits on one ID thread.
//
//   node scripts/drift-check.mjs                 dev mode, checks staged files
//   node scripts/drift-check.mjs --base main     dev mode, checks files changed since main (CI)
//   node scripts/drift-check.mjs --complete      every requirement and criterion has a test
//   node scripts/drift-check.mjs --feature docs/reminders
//   node scripts/drift-check.mjs --run-tests     run config.testCommand first (pre-commit)
//   node scripts/drift-check.mjs --commit-msg .git/COMMIT_EDITMSG
//   node scripts/drift-check.mjs --impact R2[,AC7]   every line, task, test and commit that cites them
//   node scripts/drift-check.mjs --stories [--csv]   backlog stories -> requirements, tasks, tests
//
// It checks references, not meaning. A human still reviews whether a test proves its criterion.
// Optional config in .ainf.json at the repo root; see DEFAULTS.
//
// IDs: a spec.md with an "ID prefix: REM" line owns REM-R1, REM-AC1, REM-T1. Inside that feature's
// docs a short R1 means REM-R1; tests, code and commits use the full ID. Without a prefix, IDs are
// short and shared by every unprefixed feature, as before.

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
  requireIdPrefix: false,
  storyPattern: '[A-Z][A-Z0-9]+-\\d+|AB#\\d+|#\\d+', // Jira, Azure Boards, GitHub issues
};

const P = '[A-Z][A-Z0-9]{1,7}';
const PREFIX_DEF = new RegExp(`^ID prefix:\\s*(${P})\\s*$`, 'm');
const REQ_DEF = new RegExp(`^\\s*(?:[-*]\\s+)?(?:\\*\\*)?(?:(${P})-)?(R\\d+)\\b`);
const AC_DEF = new RegExp(`^\\s*(?:[-*]\\s+)?(?:\\*\\*)?(?:(${P})-)?(AC\\d+[a-z]?)\\b`);
const TASK_DEF = new RegExp(`^\\s*[-*]\\s+\\[[ xX]\\]\\s+(?:\\*\\*)?(?:(${P})-)?(T\\d+[a-z]?)\\b`);
const ID_REF = new RegExp(`\\b(?:(${P})-)?(AC\\d+[a-z]?|R\\d+)\\b`, 'g');
const COMMIT_ID = new RegExp(`\\b(?:${P}-)?T\\d+[a-z]?\\b.*\\(\\s*(?:${P}-)?R\\d+(?:\\s*,\\s*(?:${P}-)?R\\d+)*\\s*\\)`);

export const isReq = (id) => /(?:^|-)R\d+$/.test(id);

// A written prefix counts once the repo declares any prefix; before that, REM-R1 reads as R1.
const qualify = (p, id, ns, known) => (p && known.size ? `${p}-${id}` : ns ? `${ns}-${id}` : id);

// Every requirement and criterion ID cited in text, in canonical form (REM-R1, or R1 if unprefixed).
export function refs(text, ns = '', known = new Set()) {
  return [...text.matchAll(ID_REF)].map((m) => qualify(m[1], m[2], ns, known));
}

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
  const prefix = (text.match(PREFIX_DEF) || [])[1] || '';
  const own = new Set(prefix ? [prefix] : []);
  const requirements = new Set();
  const criteria = new Map(); // AC id -> [R ids it verifies]
  const foreign = []; // IDs written with a prefix other than the spec's own
  for (const line of text.split('\n')) {
    const ac = line.match(AC_DEF);
    if (ac) {
      if (ac[1] && prefix && ac[1] !== prefix) foreign.push(`${ac[1]}-${ac[2]}`);
      const mapped = line.slice(ac.index + ac[0].length).match(/^\s*\(([^)]*)\)/);
      criteria.set(qualify(null, ac[2], prefix, own), mapped ? refs(mapped[1], prefix, own).filter(isReq) : []);
      continue;
    }
    const r = line.match(REQ_DEF);
    if (r) {
      if (r[1] && prefix && r[1] !== prefix) foreign.push(`${r[1]}-${r[2]}`);
      requirements.add(qualify(null, r[2], prefix, own));
    }
  }
  return { prefix, requirements, criteria, foreign };
}

export function parseTasks(text, ns = '', known = new Set()) {
  const tasks = [];
  for (const line of text.split('\n')) {
    const t = line.match(TASK_DEF);
    if (t) tasks.push({ id: qualify(t[1], t[2], ns, known), refs: new Set(refs(line.slice(t.index + t[0].length), ns, known)) });
  }
  return tasks;
}

// stories.md: "- PAY-123 Reminder per owner (R1, AC1)" or a table row starting with the key.
export function parseStories(text, pattern = DEFAULTS.storyPattern, ns = '', known = new Set()) {
  const def = new RegExp(`^\\s*(?:[-*]\\s+(?:\\[[ xX]\\]\\s+)?|\\|\\s*)(?:\\*\\*)?(${pattern})(?![\\w-])(.*)$`);
  const stories = [];
  for (const line of text.split('\n')) {
    const m = line.match(def);
    if (!m) continue;
    const rest = m[2].replace(/\*\*/g, '');
    const title = rest.replace(/\([^)]*\)/g, '').replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
    stories.push({ key: m[1], title, refs: new Set(refs(rest, ns, known)) });
  }
  return stories;
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

export function listFiles(root) {
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

export function loadConfig(root) {
  const file = join(root, '.ainf.json');
  return existsSync(file) ? { ...DEFAULTS, ...JSON.parse(readFileSync(file, 'utf8')) } : { ...DEFAULTS };
}

function discoverFeatures(root, config, only) {
  if (only) return existsSync(join(root, only, 'spec.md')) ? [only.replace(/\/$/, '')] : [];
  const dir = join(root, config.featuresDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('_')) // docs/_templates and other non-features
    .map((name) => `${config.featuresDir}/${name}`)
    .filter((f) => existsSync(join(root, f, 'spec.md')));
}

export const isTest = (config, f) => !f.startsWith(`${config.featuresDir}/`) && !f.endsWith('.md') && matchesAny(f, config.testPatterns);
const isCode = (config, f) => config.codeDirs.some((d) => f === d || f.startsWith(`${d}/`));

const read = (root, file) => (existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : '');

// tasks.md, plus one file per sprint in phased delivery (tasks-sprint-3.md).
const taskFiles = (root, feat) => (existsSync(join(root, feat))
  ? readdirSync(join(root, feat)).filter((n) => /^tasks(-[\w.-]+)?\.md$/.test(n)).sort()
  : []);

// Every spec in the repo is read, even when one feature is checked, so cross-feature IDs resolve.
function loadFeatures(root, config, feature) {
  const selected = discoverFeatures(root, config, feature);
  const all = [...new Set([...discoverFeatures(root, config, null), ...selected])];
  const specs = new Map(all.map((f) => [f, parseSpec(read(root, `${f}/spec.md`))]));
  const known = new Set([...specs.values()].map((s) => s.prefix).filter(Boolean));
  const allDefined = new Set();
  for (const s of specs.values()) for (const id of [...s.requirements, ...s.criteria.keys()]) allDefined.add(id);
  return { selected, specs, known, allDefined };
}

const featureTasks = (root, feat, ns, known) => parseTasks(taskFiles(root, feat).map((n) => read(root, `${feat}/${n}`)).join('\n'), ns, known);

// The criteria a story covers: those it cites, plus all criteria of each requirement it cites alone.
function storyScope(story, spec) {
  const reqs = new Set([...story.refs].filter(isReq));
  const acs = new Set([...story.refs].filter((id) => spec.criteria.has(id)));
  for (const r of reqs) {
    const own = [...spec.criteria].filter(([, rs]) => rs.includes(r)).map(([ac]) => ac);
    if (!own.some((ac) => acs.has(ac))) own.forEach((ac) => acs.add(ac));
  }
  for (const ac of acs) for (const r of spec.criteria.get(ac) || []) reqs.add(r);
  return { reqs, acs };
}

function storyProblems(feat, spec, stories) {
  const problems = [];
  const seen = new Set();
  const covered = new Set();
  for (const s of stories) {
    if (seen.has(s.key)) problems.push(`${feat}/stories.md lists ${s.key} twice`);
    seen.add(s.key);
    const { reqs } = storyScope(s, spec);
    if (!reqs.size) problems.push(`${feat}/stories.md ${s.key} names no requirement or criterion`);
    reqs.forEach((r) => covered.add(r));
  }
  for (const r of spec.requirements) if (!covered.has(r)) problems.push(`${r} is in ${feat}/spec.md but no story in stories.md covers it`);
  return problems;
}

export function check({ root = process.cwd(), complete = false, base = null, feature = null, changed = null } = {}) {
  const config = loadConfig(root);
  const problems = [];
  const notes = [];
  const { selected: features, specs, known, allDefined } = loadFeatures(root, config, feature);
  if (features.length === 0) {
    notes.push(`no feature found (looked for ${feature || config.featuresDir + '/*'}/spec.md)`);
    return { problems, notes, features };
  }

  // Prefixes must be unique; unprefixed features that reuse an ID make citations ambiguous.
  const byPrefix = new Map();
  const owners = new Map();
  for (const [f, s] of specs) {
    if (s.prefix) byPrefix.set(s.prefix, [...(byPrefix.get(s.prefix) || []), f]);
    else for (const id of [...s.requirements, ...s.criteria.keys()]) owners.set(id, [...(owners.get(id) || []), f]);
  }
  for (const [p, fs] of byPrefix) {
    if (fs.length > 1 && fs.some((f) => features.includes(f))) problems.push(`ID prefix ${p} is declared by ${fs.join(' and ')}: prefixes must be unique`);
  }
  const clashes = [...owners].filter(([, fs]) => fs.length > 1 && fs.some((f) => features.includes(f)));
  if (clashes.length) {
    const ids = clashes.map(([id]) => id);
    const where = [...new Set(clashes.flatMap(([, fs]) => fs))].join(', ');
    notes.push(`${ids.slice(0, 5).join(', ')}${ids.length > 5 ? ` and ${ids.length - 5} more` : ''} defined in ${where}: tests and commits citing them cannot say which feature. Add an "ID prefix:" line to each spec.md`);
  }

  const files = listFiles(root);
  const testFiles = files.filter((f) => isTest(config, f));
  const testRefs = new Set();
  for (const f of testFiles) for (const id of refs(read(root, f), '', known)) testRefs.add(id);

  const allow = [];
  const ask = [];

  for (const feat of features) {
    const spec = specs.get(feat);
    const { prefix: ns, requirements, criteria } = spec;
    const defined = new Set([...requirements, ...criteria.keys()]);
    // A qualified ID from another feature is a legitimate cross-reference.
    const citable = (id) => defined.has(id) || (id.includes('-') && !id.startsWith(`${ns}-`) && allDefined.has(id));
    if (config.requireIdPrefix && !ns) problems.push(`${feat}/spec.md has no "ID prefix:" line (required by .ainf.json requireIdPrefix)`);
    for (const id of spec.foreign) problems.push(`${feat}/spec.md defines ${id}, but its ID prefix is ${ns}`);

    const plan = read(root, `${feat}/plan.md`);
    const taskTexts = taskFiles(root, feat).map((n) => [n, read(root, `${feat}/${n}`)]);
    const tasksText = taskTexts.map(([, t]) => t).join('\n');
    const tasks = parseTasks(tasksText, ns, known);
    const storiesText = read(root, `${feat}/stories.md`);

    for (const [file, text] of [['plan.md', plan], ...taskTexts, ...(storiesText ? [['stories.md', storiesText]] : [])]) {
      const stale = [...new Set(refs(text, ns, known))].filter((id) => !citable(id));
      if (stale.length) problems.push(`${feat}/${file} cites ${stale.join(', ')}, not defined in spec.md (stale ID)`);
    }
    for (const [ac, reqs] of criteria) {
      const bad = reqs.filter((r) => !requirements.has(r));
      if (bad.length) problems.push(`${feat}/spec.md ${ac} maps to ${bad.join(', ')}, not a requirement`);
    }

    if (tasksText) {
      const cited = new Set(tasks.flatMap((t) => [...t.refs]));
      const where = taskTexts.length === 1 ? taskTexts[0][0] : 'tasks';
      for (const t of tasks) if (![...t.refs].some(isReq)) problems.push(`${feat}/${where} ${t.id} names no requirement`);
      for (const r of requirements) if (!cited.has(r)) problems.push(`${r} is in ${feat}/spec.md but no task cites it`);
    } else if (requirements.size) {
      notes.push(`${feat}: no tasks.md yet`);
    }

    if (storiesText) problems.push(...storyProblems(feat, spec, parseStories(storiesText, config.storyPattern, ns, known)));

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

// Everything that cites the given IDs: the change-request impact list. A requirement brings its criteria with it.
export function impact({ root = process.cwd(), ids, feature = null }) {
  const config = loadConfig(root);
  const bad = ids.filter((id) => !new RegExp(`^(?:${P}-)?(R\\d+|AC\\d+[a-z]?)$`).test(id));
  if (bad.length) throw new Error(`not a requirement or criterion ID: ${bad.join(', ')}`);

  const { selected: features, specs, known } = loadFeatures(root, config, feature);
  // With --feature, a short ID means that feature's own.
  const ns = feature && features[0] ? specs.get(features[0]).prefix : '';
  const wanted = ids.flatMap((id) => refs(id, ns, known));
  const expanded = new Set(wanted);
  for (const feat of features) {
    for (const [ac, reqs] of specs.get(feat).criteria) {
      if (reqs.some((r) => wanted.includes(r))) expanded.add(ac);
    }
  }
  const cites = (text, at) => refs(text, at, known).filter((id) => expanded.has(id));

  const files = listFiles(root);
  const scan = [
    ...features.flatMap((f) => files.filter((x) => x.startsWith(`${f}/`) && x.endsWith('.md')).map((x) => [x, specs.get(f).prefix])),
    ...files.filter((f) => isTest(config, f) || isCode(config, f)).map((x) => [x, '']),
  ];
  const hits = [];
  const done = new Set();
  for (const [file, at] of scan) {
    if (done.has(file)) continue;
    done.add(file);
    read(root, file).split('\n').forEach((text, i) => {
      if (cites(text, at).length) hits.push({ file, line: i + 1, text: text.trim() });
    });
  }
  const tasks = features.flatMap((f) => featureTasks(root, f, specs.get(f).prefix, known)
    .filter((t) => [...t.refs].some((id) => expanded.has(id))).map((t) => t.id));
  const commits = lines(git(['log', '--format=%h %s'], root)).filter((l) => cites(l, '').length);
  return { expanded: [...expanded], hits, tasks, commits };
}

// Backlog stories joined to the ID thread: requirements, criteria tested, tasks and commits per story.
export function stories({ root = process.cwd(), feature = null } = {}) {
  const config = loadConfig(root);
  const { selected, specs, known } = loadFeatures(root, config, feature);
  const testRefs = new Set();
  for (const f of listFiles(root).filter((x) => isTest(config, x))) for (const id of refs(read(root, f), '', known)) testRefs.add(id);
  const log = lines(git(['log', '--format=%h %s'], root));
  const rows = [];
  const problems = [];
  const withStories = selected.filter((f) => existsSync(join(root, f, 'stories.md')));
  for (const feat of withStories) {
    const spec = specs.get(feat);
    const list = parseStories(read(root, `${feat}/stories.md`), config.storyPattern, spec.prefix, known);
    problems.push(...storyProblems(feat, spec, list));
    const tasks = featureTasks(root, feat, spec.prefix, known);
    for (const s of list) {
      const { reqs, acs } = storyScope(s, spec);
      const scope = new Set([...reqs, ...acs]);
      const keyRe = new RegExp(`(^|[^\\w-])${s.key.replace(/#/g, '\\#')}(?![\\w-])`);
      rows.push({
        feature: feat, key: s.key, title: s.title, requirements: [...reqs], criteria: [...acs],
        tested: [...acs].filter((ac) => testRefs.has(ac)).length,
        tasks: tasks.filter((t) => [...t.refs].some((id) => scope.has(id))).map((t) => t.id),
        commits: log.filter((l) => keyRe.test(l.slice(l.indexOf(' ') + 1))).length,
      });
    }
  }
  return { rows, problems, features: withStories };
}

function main(argv) {
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
  const root = git(['rev-parse', '--show-toplevel'], process.cwd())?.trim() || process.cwd();
  const config = loadConfig(root);

  const impactIds = arg('--impact');
  if (impactIds) {
    const ids = impactIds.split(',').map((s) => s.trim()).filter(Boolean);
    const r = impact({ root, ids, feature: arg('--feature') });
    console.log(`impact of ${ids.join(', ')} (with criteria: ${r.expanded.join(', ')}): ${r.hits.length} line(s)`);
    let last = null;
    for (const h of r.hits) {
      if (h.file !== last) console.log(`  ${h.file}`);
      console.log(`    ${String(h.line).padStart(4)}  ${h.text}`);
      last = h.file;
    }
    console.log(`  tasks:   ${r.tasks.join(', ') || 'none'}`);
    console.log(`  commits: ${r.commits.length ? '' : 'none'}`);
    for (const c of r.commits) console.log(`    ${c}`);
    return 0;
  }

  if (argv.includes('--stories')) {
    const r = stories({ root, feature: arg('--feature') });
    if (argv.includes('--csv')) {
      const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
      console.log('feature,story,title,requirements,criteria,criteria_tested,tasks,commits');
      for (const s of r.rows) console.log([s.feature, s.key, s.title, s.requirements.join(' '), s.criteria.join(' '), s.tested, s.tasks.join(' '), s.commits].map(q).join(','));
    } else {
      console.log(`drift-check (stories): ${r.rows.length} story(ies) in ${r.features.length} feature(s), ${r.problems.length} problem(s)`);
      if (r.rows.length) {
        console.log('| Feature | Story | Requirements | Criteria tested | Tasks | Commits |');
        console.log('|---|---|---|---|---|---|');
        for (const s of r.rows) {
          console.log(`| ${s.feature} | ${s.key} ${s.title} | ${s.requirements.join(', ') || '—'} | ${s.tested}/${s.criteria.length} | ${s.tasks.join(', ') || '—'} | ${s.commits} |`);
        }
      } else {
        console.log('  (no stories.md found; /ainf:stories writes one)');
      }
    }
    for (const p of r.problems) console.error(`  - ${p}`);
    return r.problems.length ? 1 : 0;
  }

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
