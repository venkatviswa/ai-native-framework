import assert from 'node:assert/strict';
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkLabels, checkLedger, checkSow, ledgerEntries, matrix, parseCases, renderMatrix } from '../plugins/ainf-engagements/scripts/engagement-check.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const plugin = (p) => join(here, '..', 'plugins', p);

test('labels: every bullet needs a label with a source; constraints need Known, Assumed or Unknown', () => {
  const intent = [
    '# intent.md · Northfield',
    'Status: DRAFT (hypothesis)',
    '## What we believe',
    '- About 1,800 cases a month. [fact · Support head, call 1]',
    '- Around 15% get no first reply within a day. [inference · an estimate, no report]',
    '- Measure first reply within 24 hours. [recommendation · ours]',
    '- Support staff have no licences. [open question · verify with IT]',
    '- Volume will double next year.',
    '- Licences are cheap. [fact]',
    '## Constraints',
    '- Known: Service Cloud is decided. [fact · CIO, call 2]',
    '- Go-live before March. [fact · sponsor, call 1]',
    '```',
    '- not a bullet inside a fence',
    '```',
  ].join('\n');
  const { problems, bullets } = checkLabels(intent);
  assert.equal(bullets, 8);
  assert.equal(problems.length, 3);
  assert.match(problems[0], /line 8: no label/);
  assert.match(problems[1], /line 9: no label/, 'a label without a source does not count');
  assert.match(problems[2], /line 12: constraint not marked/);
});

test('discovery intent template passes its own label check', () => {
  const text = readFileSync(join(plugin('ainf-engagements'), 'skills/discovery/intent-template.md'), 'utf8');
  assert.deepEqual(checkLabels(text).problems, []);
});

test('sow: scope and acceptance cite defined requirements; to-confirm items carry no estimate', () => {
  const spec = 'R1 When ...\nR2 When ...\n';
  const sow = [
    '## Objectives', '- Faster first reply',
    '## Scope', '- Case routing (R1)', '- Escalation flow (R7)', '- Reporting pack', '- Migration (R2) **to confirm**, 10 days',
    '## Out of scope', '- Telephony',
    '## Assumptions and dependencies', '- Client provides sample emails',
    '## Acceptance criteria', '- 95% routed correctly (R1, AC1)',
  ].join('\n');
  const { problems } = checkSow(sow, spec);
  assert.equal(problems.length, 3, problems.join('\n'));
  assert.ok(problems.some((p) => p.includes('R7, not defined')));
  assert.ok(problems.some((p) => p.includes('cites no requirement: "- Reporting pack"')));
  assert.ok(problems.some((p) => p.includes('"to confirm" but carries an estimate')));
  assert.ok(checkSow('## Scope\n- x (R1)\n').problems.some((p) => p.includes('no Assumptions')));
});

test('sow template passes its own check', () => {
  const text = readFileSync(join(plugin('ainf-engagements'), 'skills/sow/template.md'), 'utf8');
  assert.deepEqual(checkSow(text, 'R1\nR4\n').problems, []);
});

test('cases: SIT, UAT and INS lines with the IDs they cite', () => {
  assert.deepEqual(parseCases('- SIT-1 (R2, AC4) setup → act → expect\n- UAT-3 (R1) As an agent...\nnot a case SIT-9\n'), [
    { id: 'SIT-1', refs: ['R2', 'AC4'] },
    { id: 'UAT-3', refs: ['R1'] },
  ]);
});

test('matrix: joins unit tests, SIT, UAT and inspection by requirement and flags gaps', async () => {
  const root = mkdtempSync(join(tmpdir(), 'ainf-eng-'));
  const put = (p, body) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), body); };
  mkdirSync(join(root, 'scripts'));
  copyFileSync(join(plugin('ainf'), 'scripts/drift-check.mjs'), join(root, 'scripts/drift-check.mjs'));
  put('docs/billing/spec.md', 'R1 When ...\nR2 When ...\nR3 When ...\nR4 When ...\nAC1 (R1) Given\nAC2 (R2) Given\n');
  put('docs/billing/sit.md', '- SIT-1 (AC2) invoice sync\n- SIT-2 retry storm\n');
  put('docs/billing/uat.md', '- UAT-1 (R1) As a clerk...\n- UAT-2 (R9) As a manager...\n');
  put('docs/billing/inspection.md', '- INS-1 (R3) permission set reviewed\n');
  put('test/billing.test.js', "test('AC1: totals', () => {})\n");
  put('test/helpers.test.js', "test('formats money', () => {})\n");

  const r = await matrix({ root, feature: 'docs/billing' });
  assert.deepEqual([...r.rows.get('R1').unit], ['test/billing.test.js']);
  assert.deepEqual([...r.rows.get('R1').uat], ['UAT-1']);
  assert.deepEqual([...r.rows.get('R2').sit], ['SIT-1'], 'a criterion counts for its requirement');
  assert.deepEqual([...r.rows.get('R3').inspection], ['INS-1']);
  assert.deepEqual(r.problems.sort(), [
    'R4 has no verification',
    'sit.md SIT-2 cites no requirement',
    'test/helpers.test.js cites no requirement or criterion',
    'uat.md UAT-2 cites R9, not in spec.md',
  ]);
  const md = renderMatrix('docs/billing', r);
  assert.match(md, /\| R4 \| — \| — \| — \| — \| \*\*GAP\*\* \|/);
});

test('prefixed IDs: sow compares without the prefix; matrix resolves them like drift-check', async () => {
  assert.deepEqual(checkSow('## Scope\n- Reminders (REM-R1)\n## Assumptions\n- a\n## Out of scope\n- b\n', 'ID prefix: REM\nREM-R1 When x\n').problems, []);
  assert.ok(checkSow('## Scope\n- Reminders (REM-R7)\n', 'R1\n').problems.includes('line 2: cites REM-R7, not defined in the spec'));
  const root = mkdtempSync(join(tmpdir(), 'ainf-eng-'));
  const put = (p, body) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), body); };
  mkdirSync(join(root, 'scripts'));
  copyFileSync(join(plugin('ainf'), 'scripts/drift-check.mjs'), join(root, 'scripts/drift-check.mjs'));
  put('docs/billing/spec.md', 'ID prefix: BIL\nR1 When ...\nR2 When ...\nAC1 (R1) Given\n');
  put('docs/other/spec.md', 'ID prefix: OTH\nR1 When ...\nAC1 (R1) Given\n');
  put('docs/billing/uat.md', '- UAT-1 (R2) As a clerk...\n');
  put('test/billing.test.js', "test('BIL-AC1: totals', () => {})\n");
  put('test/other.test.js', "test('OTH-AC1: other', () => {})\n");
  const r = await matrix({ root, feature: 'docs/billing' });
  assert.deepEqual([...r.rows.keys()], ['BIL-R1', 'BIL-R2']);
  assert.deepEqual([...r.rows.get('BIL-R1').unit], ['test/billing.test.js'], 'OTH-AC1 is not BIL-AC1');
  assert.deepEqual([...r.rows.get('BIL-R2').uat], ['UAT-1']);
  assert.deepEqual(r.problems, []);
});

const ledgerDir = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  return dir;
};

test('ledger entries: table rows keyed by their first cell, headings with field lines', () => {
  const entries = ledgerEntries([
    '| ID | Fact | Label | Source |',
    '|---|---|---|---|',
    '| F-1 | Batch runs nightly | confirmed | admin console, 2026-10-01 |',
    '| not an id | x | y | z |',
    '### D-2 Keep the batch',
    '- **Status:** accepted · **Date:** 2026-10-03',
    '- **Reversal condition:** volume doubles',
    '```',
    '| F-9 | inside a fence | | |',
    '```',
  ].join('\n'));
  assert.deepEqual(entries.map((e) => e.id), ['F-1', 'D-2']);
  assert.equal(entries[0].fields.label, 'confirmed');
  assert.equal(entries[1].fields.status, 'accepted');
  assert.equal(entries[1].fields['reversal condition'], 'volume doubles');
});

test('ledger: one definition per ID, citations current, actions owned and dated, decisions reversible', () => {
  const dir = ledgerDir({
    'facts.md': [
      '| ID | Fact | Label | Source | Status |',
      '|---|---|---|---|---|',
      '| F-1 | Region is east | confirmed | session 2026-10-01 | superseded by F-3 |',
      '| F-2 | Batch runs nightly | | | current |',
      '| F-3 | Region is west | confirmed | admin console 2026-10-05 | current |',
      '| F-4 | Old claim | inferred | doc | superseded |',
      '| F-5 | Corrected | confirmed | doc | superseded by F-99 |',
    ].join('\n'),
    'decisions.md': [
      '### D-1 Queue retries',
      '- **Status:** accepted · **Date:** 2026-10-02',
      '- **Reversal condition:** —',
      '### D-2 Keep batch',
      '- **Status:** accepted',
      '- **Reversal condition:** volume doubles',
      '- **Approved by:** client lead',
    ].join('\n'),
    'actions.md': [
      '| ID | Action | Owner | Due | Status |',
      '|---|---|---|---|---|',
      '| A-1 | Pull logs | | ASAP | open |',
      '| A-2 | Confirm region (F-3) | client admin | 2026-10-20 | open |',
    ].join('\n'),
    'questions.md': [
      '| ID | Question | Status | Answered in |',
      '|---|---|---|---|',
      '| Q-1 | Which region? | answered | |',
    ].join('\n'),
    'rca-plan.md': [
      '| ID | Hypothesis | Status |',
      '|---|---|---|',
      '| H-1 | Lock contention | open |',
      '| H-1 | Same number again | open |',
      '| H-2 | Retry storm | maybe |',
    ].join('\n'),
    'status.md': 'Last updated: 2026-10-04\nRegion per F-1. Blocked on Q-9. Example only: `F-77`.\n',
    'journal.md': '## 2026-10-06 Session\n- F-1 was wrong; see F-3.\n',
    'readout-2026-10-06.html': '<p>Region east (F-1)</p>',
  });
  const { problems, counts } = checkLedger(dir);
  const has = (re) => assert.ok(problems.some((p) => re.test(p)), `expected ${re}\n${problems.join('\n')}`);
  has(/^H-1 defined twice: rca-plan\.md:3 and rca-plan\.md:4/);
  has(/A-1 has no owner/);
  has(/A-1 is due "ASAP"/);
  has(/D-1 is accepted but has no reversal condition/);
  has(/D-1 is accepted but names no approver/);
  has(/F-2 has no label/);
  has(/F-2 has no source/);
  has(/F-4 is superseded but does not say by what/);
  has(/F-5 is superseded by F-99, which is not defined/);
  has(/Q-1 is answered but does not say where/);
  has(/H-2 status "maybe"/);
  has(/^status\.md:2 cites F-1, superseded by F-3$/);
  has(/^readout-2026-10-06\.html:1 cites F-1, superseded/);
  has(/^status\.md cites Q-9, defined in no ledger/);
  has(/status\.md last updated 2026-10-04, but journal\.md has an entry for 2026-10-06/);
  assert.ok(!problems.some((p) => /journal\.md:\d+ cites F-1/.test(p)), 'the journal may name superseded IDs');
  assert.ok(!problems.some((p) => /F-77/.test(p)), 'inline code is an example, not a citation');
  assert.ok(!problems.some((p) => /\b(D-2|A-2|F-3) (is|has|status)\b/.test(p)), problems.join('\n'));
  assert.equal(counts.F, 5);
});

test('workspace templates, stamped with each engagement shape, pass their own ledger check', () => {
  const skills = plugin('ainf-engagements/skills');
  const shapes = {
    discovery: { 'intent.md': 'discovery/intent-template.md', 'notes/2026-10-01-doc-brief.md': 'discovery/document-template.md' },
    poc: { 'poc-spec.md': 'poc/spec-template.md', 'poc-plan.md': 'poc/plan-template.md', 'poc-result.md': 'poc/result-template.md' },
    escalation: Object.fromEntries(['intent', 'rca-plan', 'rca', 'remediation', 'exit'].map((f) => [`${f}.md`, `escalation/${f}-template.md`])),
    incident: { 'incident.md': 'incident/template.md' },
    readout: { 'readout-2026-10-01.md': 'readout/template.md' },
  };
  for (const [shape, files] of Object.entries(shapes)) {
    const dir = mkdtempSync(join(tmpdir(), `ws-${shape}-`));
    cpSync(plugin('ainf-engagements/templates/workspace'), dir, { recursive: true });
    for (const [to, from] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, to)), { recursive: true });
      copyFileSync(join(skills, from), join(dir, to));
    }
    assert.deepEqual(checkLedger(dir).problems, [], shape);
  }
});
