import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { check, checkCommitMessage, globToRegExp, impact, parseSpec } from '../plugins/ainf/scripts/drift-check.mjs';

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
  for (const n of ['intent', 'spec', 'plan', 'tasks', 'cr']) {
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
