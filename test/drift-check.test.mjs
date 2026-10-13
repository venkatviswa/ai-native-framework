import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { check, checkCommitMessage, globToRegExp, impact, parseSpec, parseStories, stories } from '../plugins/ainf/scripts/drift-check.mjs';

const pluginRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'plugins', 'ainf');

const SPEC = `# spec.md: reminders
Status: APPROVED v1.0 (Venkat, 2026-10-12)

## Requirements
R1 When an open task is due within 24 h, the system shall email each owner one reminder.
R2 While a task is snoozed, the system shall not send reminders.

## Acceptance criteria
AC1 (R1) Given two owners When the job runs twice Then one email each
AC3 (R2) Given a 4 h snooze When it ends Then one follow-up
AC3b (R2) Given Kolkata 20:00 When snoozed until 9:00 Then 03:30 UTC
`;

const PLAN = `# plan.md
## Data model
reminders(id, taskId, ownerId) satisfies R1, AC1
## Action boundaries
- May edit: \`src/reminders/**\`, \`test/**\`
- Ask first: \`src/store.js\`
- Never: production data
## Release and rollback
`;

const TASKS = `# tasks.md
- [x] T1 Reminder store (R1, AC1)
- [ ] T2 Snooze (R2, AC3, AC3b)
`;

function repo(files) {
  const root = mkdtempSync(join(tmpdir(), 'ainf-'));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  return root;
}

const base = (extra = {}) => repo({
  'docs/reminders/spec.md': SPEC,
  'docs/reminders/plan.md': PLAN,
  'docs/reminders/tasks.md': TASKS,
  'test/reminders.test.js': "test('AC1: two owners', () => {})\ntest('AC3: snooze', () => {})\n",
  ...extra,
});

test('globs: ** spans directories, * stays in one segment', () => {
  assert.ok(globToRegExp('src/**').test('src/a/b.js'));
  assert.ok(globToRegExp('**/*.test.*').test('a/b/c.test.js'));
  assert.ok(globToRegExp('**/*.test.*').test('c.test.js'));
  assert.ok(!globToRegExp('src/*.js').test('src/a/b.js'));
});

test('parses requirements and criteria with their mapping', () => {
  const { requirements, criteria } = parseSpec(SPEC);
  assert.deepEqual([...requirements], ['R1', 'R2']);
  assert.deepEqual(criteria.get('AC3b'), ['R2']);
});

test('dev mode: a consistent feature passes and reports untested criteria as a note', () => {
  const { problems, notes } = check({ root: base(), changed: [] });
  assert.deepEqual(problems, []);
  assert.ok(notes.some((n) => n.includes('AC3b not yet tested')));
});

test('dev mode: stale IDs, uncovered requirements and unlinked tasks are problems', () => {
  const root = base({
    'docs/reminders/tasks.md': '- [ ] T1 Reminder store (R1, AC9)\n- [ ] T2 Tidy up\n',
    'test/old.test.js': "test('R7 legacy', () => {})\n",
  });
  const { problems } = check({ root, changed: [] });
  assert.ok(problems.some((p) => p.includes('tasks.md cites AC9')));
  assert.ok(problems.some((p) => p.includes('T2 names no requirement')));
  assert.ok(problems.some((p) => p.startsWith('R2 is in docs/reminders/spec.md but no task cites it')));
  assert.ok(problems.some((p) => p.includes('tests cite R7')));
});

test('dev mode: action boundaries, ask-first and approval override', () => {
  const root = base();
  const touched = ['src/reminders/scan.js', 'src/billing.js', 'src/store.js', 'docs/reminders/spec.md', '.github/workflows/ci.yml', 'constitution.md'];
  const { problems } = check({ root, changed: touched });
  assert.equal(problems.length, 2);
  assert.ok(problems.some((p) => p.startsWith('src/billing.js is staged but outside')));
  assert.ok(problems.some((p) => p.startsWith('src/store.js needs human approval')));

  process.env.AINF_APPROVED = 'src/store.js';
  try {
    assert.equal(check({ root, changed: touched }).problems.length, 1);
  } finally {
    delete process.env.AINF_APPROVED;
  }
});

test('complete mode: every criterion needs a test; a requirement is covered through its criteria', () => {
  const root = base();
  const { problems } = check({ root, complete: true, changed: [] });
  assert.deepEqual(problems, ['AC3b is in docs/reminders/spec.md but no test cites it']);

  writeFileSync(join(root, 'test/dst.test.js'), "test('AC3b: Kolkata', () => {})\n");
  assert.deepEqual(check({ root, complete: true, changed: [] }).problems, []);
});

test('markdown under docs never counts as a test, even if named *.spec.md', () => {
  const root = base({ 'docs/reminders/old.spec.md': 'AC3b' });
  assert.ok(check({ root, complete: true, changed: [] }).problems.length > 0);
});

test('commit-msg: code changes must name task and requirement', () => {
  assert.equal(checkCommitMessage('T3 (R1): scan due tasks\n', ['src/a.js']), null);
  assert.equal(checkCommitMessage('T7b (R3, R4): confirm before retry', ['src/a.js']), null);
  assert.equal(checkCommitMessage('docs: tidy', ['docs/x.md']), null);
  assert.equal(checkCommitMessage('Merge branch main', ['src/a.js']), null);
  assert.match(checkCommitMessage('fix stuff', ['src/a.js']), /names no task and requirement/);
});

test('init: stamps the scaffold and never overwrites', () => {
  const root = repo({ 'CLAUDE.md': 'mine\n' });
  execFileSync('git', ['init', '-q'], { cwd: root });
  const out = execFileSync('node', [join(pluginRoot, 'scripts/init.mjs'), root], { encoding: 'utf8' });
  assert.match(out, /created {2}scripts\/drift-check\.mjs/);
  assert.match(out, /exists {3}CLAUDE\.md/);
  assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), 'mine\n');
  assert.equal(execFileSync('git', ['config', 'core.hooksPath'], { cwd: root, encoding: 'utf8' }).trim(), '.githooks');
});

test('artifact index: summarises status, blocking questions and task progress', () => {
  const root = base({ 'docs/reminders/intent.md': 'Status: DRAFT\n## Open questions\n- BLOCKING: two owners?\n' });
  const out = execFileSync('node', [join(pluginRoot, 'scripts/artifact-index.mjs')], {
    encoding: 'utf8', env: { ...process.env, CLAUDE_PROJECT_DIR: root },
  });
  assert.match(out, /intent DRAFT \(1 BLOCKING\) · spec APPROVED v1\.0 · plan no status · tasks 1\/2/);
});

test('impact: a requirement brings its criteria, and lists lines, tasks, tests and commits', () => {
  const root = base({ 'src/reminders/snooze.js': '// R2: snooze window\n' });
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'T2 (R2): snooze'], { cwd: root });
  const r = impact({ root, ids: ['R2'] });
  assert.deepEqual(r.expanded.sort(), ['AC3', 'AC3b', 'R2']);
  assert.deepEqual(r.tasks, ['T2']);
  assert.equal(r.commits.length, 1);
  const files = new Set(r.hits.map((h) => h.file));
  for (const f of ['docs/reminders/spec.md', 'docs/reminders/tasks.md', 'test/reminders.test.js', 'src/reminders/snooze.js']) assert.ok(files.has(f), f);
  assert.ok(!r.hits.some((h) => h.text.startsWith('AC1')), 'R1-only lines are not impacted');
  assert.throws(() => impact({ root, ids: ['--output=x'] }), /not a requirement/);
});

test('phased delivery: per-sprint task files count as tasks, and stale IDs in them are caught', () => {
  const root = base({
    'docs/reminders/tasks.md': '',
    'docs/reminders/tasks-sprint-1.md': '- [x] T1 Reminder store (R1, AC1)\n',
    'docs/reminders/tasks-sprint-2.md': '- [ ] T2 Snooze (R2, AC3, AC9)\n',
  });
  const { problems } = check({ root, changed: [] });
  assert.deepEqual(problems, ['docs/reminders/tasks-sprint-2.md cites AC9, not defined in spec.md (stale ID)']);
  assert.deepEqual(impact({ root, ids: ['R2'] }).tasks, ['T2']);
});

test('init stamps docs/_templates, never overwrites, and drift-check skips them', () => {
  const root = repo({ 'CLAUDE.md': '# ours\n' });
  execFileSync('node', [join(pluginRoot, 'scripts/init.mjs'), root], { stdio: 'ignore' });
  for (const n of ['intent', 'spec', 'plan', 'tasks', 'stories', 'cr']) {
    assert.equal(readFileSync(join(root, `docs/_templates/${n}.md`), 'utf8'),
      readFileSync(join(pluginRoot, `templates/docs/${n}.md`), 'utf8'));
  }
  assert.equal(readFileSync(join(root, 'CLAUDE.md'), 'utf8'), '# ours\n');
  const { problems, features } = check({ root, changed: [] });
  assert.deepEqual(features, []);
  assert.deepEqual(problems, []);
});

test('templates keep the line formats drift-check parses', () => {
  const tpl = (n) => readFileSync(join(pluginRoot, `templates/docs/${n}.md`), 'utf8');
  const { requirements, criteria } = parseSpec(tpl('spec'));
  assert.deepEqual([...requirements], ['R1', 'R2', 'R3']);
  assert.deepEqual(criteria.get('AC3'), ['R3']);
  const root = repo({ 'docs/f/spec.md': tpl('spec'), 'docs/f/plan.md': tpl('plan'), 'docs/f/tasks.md': tpl('tasks') });
  const { problems } = check({ root, changed: [] });
  assert.deepEqual(problems, []);
});

// Two features that both number from R1 and AC1, told apart by their ID prefixes.
const prefixed = (extra = {}) => repo({
  'docs/reminders/spec.md': SPEC.replace('Status:', 'ID prefix: REM\nStatus:'),
  'docs/reminders/plan.md': PLAN,
  'docs/reminders/tasks.md': TASKS,
  'docs/payments/spec.md': 'ID prefix: PAY\nR1 When a card is charged, the system shall send one receipt.\nAC1 (R1) Given a retry When it succeeds Then one receipt\n',
  'docs/payments/tasks.md': '- [ ] T1 Receipt (R1, AC1)\n',
  'test/reminders.test.js': "test('REM-AC1: two owners', () => {})\ntest('REM-AC3: snooze', () => {})\ntest('REM-AC3b: Kolkata', () => {})\n",
  'test/payments.test.js': "test('PAY-AC1: one receipt', () => {})\n",
  ...extra,
});

test('ID prefixes: short IDs in a feature docs resolve to its prefix; tests use the full ID', () => {
  const spec = parseSpec(SPEC.replace('Status:', 'ID prefix: REM\nStatus:'));
  assert.equal(spec.prefix, 'REM');
  assert.deepEqual([...spec.requirements], ['REM-R1', 'REM-R2']);
  assert.deepEqual(spec.criteria.get('REM-AC3b'), ['REM-R2']);
  assert.deepEqual(check({ root: prefixed(), complete: true, changed: [] }).problems, []);
  const root = prefixed({ 'test/old.test.js': "test('AC1: which feature?', () => {})\n" });
  assert.deepEqual(check({ root, changed: [] }).problems, ['tests cite AC1, not defined in any spec.md (stale ID)']);
});

test('ID prefixes: unprefixed features sharing IDs get a note; duplicate, foreign and missing prefixes are problems', () => {
  const clash = repo({
    'docs/a/spec.md': 'R1 When x, the system shall y.\n',
    'docs/b/spec.md': 'R1 When p, the system shall q.\n',
  });
  assert.ok(check({ root: clash, changed: [] }).notes.some((n) => n.startsWith('R1 defined in docs/a, docs/b') && n.includes('ID prefix:')));
  const root = prefixed({
    'docs/refunds/spec.md': 'ID prefix: PAY\nR1 When refunded, the system shall notify.\nPAY-R2 x\nREM-R5 y\n',
    'docs/refunds/tasks.md': '- [ ] T1 Notify (R1, R2)\n',
    'docs/legacy/spec.md': 'R9 When z, the system shall w.\n',
    'docs/legacy/tasks.md': '- [ ] T1 W (R9)\n',
    '.ainf.json': JSON.stringify({ requireIdPrefix: true }),
  });
  const { problems } = check({ root, changed: [] });
  assert.ok(problems.includes('ID prefix PAY is declared by docs/payments and docs/refunds: prefixes must be unique'), problems.join('\n'));
  assert.ok(problems.includes('docs/refunds/spec.md defines REM-R5, but its ID prefix is PAY'));
  assert.ok(problems.includes('docs/legacy/spec.md has no "ID prefix:" line (required by .ainf.json requireIdPrefix)'));
});

test('ID prefixes: qualified cross-feature citations resolve, and --feature still sees every spec', () => {
  const root = prefixed({ 'docs/payments/plan.md': '# plan.md\nReuses the scheduler from REM-R1 (REM-AC1).\nSee also REM-R9.\n' });
  assert.deepEqual(check({ root, changed: [] }).problems, ['docs/payments/plan.md cites REM-R9, not defined in spec.md (stale ID)']);
  // Before the fix, PAY-AC1 in test/payments.test.js was reported stale when only reminders was checked.
  assert.deepEqual(check({ root: prefixed(), feature: 'docs/reminders', changed: [] }).problems, []);
});

test('ID prefixes: commit subjects and impact take full IDs', () => {
  const touches = ['src/reminders/scan.js'];
  assert.equal(checkCommitMessage('REM-T3 (REM-R1): scan due tasks', touches), null);
  assert.equal(checkCommitMessage('REM-T7b (REM-R3, REM-R4): fix [PAY-12]', touches), null);
  assert.match(checkCommitMessage('REM-T3: scan due tasks', touches), /names no task and requirement/);
  const root = prefixed({ 'src/reminders/snooze.js': '// REM-R2: snooze window\n' });
  const r = impact({ root, ids: ['REM-R2'] });
  assert.deepEqual(r.expanded.sort(), ['REM-AC3', 'REM-AC3b', 'REM-R2']);
  assert.deepEqual(r.tasks, ['REM-T2']);
  const files = new Set(r.hits.map((h) => h.file));
  for (const f of ['docs/reminders/spec.md', 'docs/reminders/tasks.md', 'test/reminders.test.js', 'src/reminders/snooze.js']) assert.ok(files.has(f), f);
  assert.ok(!files.has('docs/payments/spec.md') && !files.has('test/payments.test.js'));
  assert.deepEqual(impact({ root, ids: ['R1'], feature: 'docs/payments' }).expanded.sort(), ['PAY-AC1', 'PAY-R1']);
});

test('stories: keys map to IDs, a bare requirement brings its criteria, gaps are problems', () => {
  assert.deepEqual(parseStories('- PAY-123 Reminder per owner (R1, AC1)\n| AB#7 | Snooze | R2 |\n- [x] #42 Fix\n').map((s) => s.key), ['PAY-123', 'AB#7', '#42']);
  const root = base({ 'docs/reminders/stories.md': '- PAY-1 Reminder per owner (R1)\n- PAY-2 Snooze in the owner zone (AC3b)\n' });
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '--allow-empty', '-m', 'T1 (R1): store [PAY-1]'], { cwd: root });
  const r = stories({ root });
  assert.deepEqual(r.problems, []);
  assert.deepEqual(r.rows.map(({ key, requirements, criteria, tested, tasks, commits }) => ({ key, requirements, criteria, tested, tasks, commits })), [
    { key: 'PAY-1', requirements: ['R1'], criteria: ['AC1'], tested: 1, tasks: ['T1'], commits: 1 },
    { key: 'PAY-2', requirements: ['R2'], criteria: ['AC3b'], tested: 0, tasks: ['T2'], commits: 0 },
  ]);
  const bad = base({ 'docs/reminders/stories.md': '- PAY-1 Reminder (R1)\n- PAY-1 Again (R1)\n- PAY-3 Spike\n- PAY-4 Old (R9)\n' });
  const { problems } = check({ root: bad, changed: [] });
  for (const p of [
    'docs/reminders/stories.md cites R9, not defined in spec.md (stale ID)',
    'docs/reminders/stories.md lists PAY-1 twice',
    'docs/reminders/stories.md PAY-3 names no requirement or criterion',
    'R2 is in docs/reminders/spec.md but no story in stories.md covers it',
  ]) assert.ok(problems.includes(p), p);
});

test('the stories template parses once its keys are filled', () => {
  const tpl = (n) => readFileSync(join(pluginRoot, `templates/docs/${n}.md`), 'utf8');
  const root = repo({
    'docs/f/spec.md': tpl('spec'), 'docs/f/tasks.md': tpl('tasks'),
    'docs/f/stories.md': tpl('stories').replace(/\[KEY-(\d)\]/g, 'PAY-$1'),
  });
  assert.deepEqual(check({ root, changed: [] }).problems, []);
  assert.equal(stories({ root }).rows.length, 3);
});

test('--base that git cannot compare exits 2 instead of passing on an empty diff', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ainf-base-'));
  const g = (args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { cwd: dir, stdio: 'ignore' });
  g(['init', '-q']);
  mkdirSync(join(dir, 'docs', 'f'), { recursive: true });
  writeFileSync(join(dir, 'docs', 'f', 'spec.md'), '# spec\n- R1 When x, the system shall y.\n- AC1 (R1) Given a When b Then c\n');
  g(['add', '-A']); g(['commit', '-qm', 'init']);
  const r = spawnSync(process.execPath, [join(pluginRoot, 'scripts', 'drift-check.mjs'), '--base', 'no-such-ref'], { cwd: dir, encoding: 'utf8' });
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /cannot compare/);
});
