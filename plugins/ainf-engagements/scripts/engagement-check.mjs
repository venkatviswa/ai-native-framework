#!/usr/bin/env node
// engagement-check: the mechanical half of the engagement gates. Judgement stays with people.
//
//   node engagement-check.mjs labels docs/northfield/intent.md
//       every bullet carries [fact | inference | recommendation | open question · source];
//       every bullet under Constraints says Known, Assumed or Unknown
//   node engagement-check.mjs sow docs/northfield/sow.md [--spec docs/northfield/poc-spec.md]
//       every Scope and Acceptance item cites a requirement defined in the spec;
//       nothing marked "to confirm" carries an estimate; Assumptions and Out of scope exist
//   node engagement-check.mjs matrix docs/billing [--write]
//       traceability: each requirement against unit tests, SIT cases, UAT scenarios, inspections;
//       flags requirements with no verification, cases citing no or unknown IDs, tests citing nothing
//
// Run from the repository root. `matrix` reuses scripts/drift-check.mjs from /ainf:init.

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const LABEL = /\[(fact|inference|recommendation|open question)\s*[·:\-–—]\s*[^\]\s][^\]]*\]/i;
const BULLET = /^\s*(?:[-*+]|\d+[.)])\s+(?!\[[ xX]\])\S/;
const CONSTRAINT_KIND = /\b(Known|Assumed|Unknown)\b/;
const REQ = /\bR\d+\b/g;
const ESTIMATE = /\b\d+(?:\.\d+)?\s*(?:d|days?|h|hrs?|hours?|w|wks?|weeks?|sprints?|pd|person[- ]days?|FTE)\b|[$€£₹]\s*\d/i;
const CASE_DEF = /^\s*(?:[-*]\s+|\|\s*)?(?:\*\*)?((?:SIT|UAT|INS)-\d+[a-z]?)\b/;
const ID_REF = /\b(AC\d+[a-z]?|R\d+)\b/g;

// Walks markdown, skipping fenced code and HTML comments, tracking the current heading.
function* mdLines(text) {
  let heading = '';
  let fenced = false;
  let comment = false;
  const all = text.split('\n');
  for (let i = 0; i < all.length; i++) {
    const line = all[i];
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (comment) { if (line.includes('-->')) comment = false; continue; }
    if (/^\s*<!--/.test(line)) { if (!line.includes('-->')) comment = true; continue; }
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { heading = h[1].trim(); continue; }
    yield { n: i + 1, line, heading };
  }
}

export function checkLabels(text) {
  const problems = [];
  let bullets = 0;
  for (const { n, line, heading } of mdLines(text)) {
    if (!BULLET.test(line)) continue;
    bullets++;
    const short = line.trim().slice(0, 70);
    if (!LABEL.test(line)) problems.push(`line ${n}: no label and source: "${short}"`);
    if (/^constraints?\b/i.test(heading) && !CONSTRAINT_KIND.test(line)) {
      problems.push(`line ${n}: constraint not marked Known, Assumed or Unknown: "${short}"`);
    }
  }
  return { problems, bullets };
}

export function definedRequirements(specText) {
  const ids = new Set();
  for (const line of specText.split('\n')) {
    const m = line.match(/^\s*(?:[-*]\s+|\|\s*)?(?:\*\*)?(R\d+)\b/);
    if (m) ids.add(m[1]);
  }
  return ids;
}

export function checkSow(sowText, specText = null) {
  const problems = [];
  const defined = specText ? definedRequirements(specText) : null;
  const headings = new Set();
  for (const { n, line, heading } of mdLines(sowText)) {
    headings.add(heading.toLowerCase());
    const traced = /^(in )?scope\b|^acceptance/i.test(heading) && !/out of scope/i.test(heading);
    const isItem = BULLET.test(line) || (/^\s*\|/.test(line) && !/^\s*\|[\s:|-]+\|\s*$/.test(line));
    if (!isItem) continue;
    const short = line.trim().slice(0, 70);
    const reqs = line.match(REQ) || [];
    if (traced && !/^\s*\|\s*(item|scope|criterion|id)\b/i.test(line)) {
      if (!reqs.length) problems.push(`line ${n}: ${heading} item cites no requirement: "${short}"`);
      const unknown = defined ? reqs.filter((r) => !defined.has(r)) : [];
      if (unknown.length) problems.push(`line ${n}: cites ${unknown.join(', ')}, not defined in the spec`);
    }
    if (/to confirm/i.test(line) && ESTIMATE.test(line)) {
      problems.push(`line ${n}: marked "to confirm" but carries an estimate: "${short}"`);
    }
  }
  const has = (re) => [...headings].some((h) => re.test(h));
  if (!has(/assumption/)) problems.push('no Assumptions section: every assumption must be visible');
  if (!has(/out of scope/)) problems.push('no Out of scope section');
  if (!has(/^(in )?scope\b/)) problems.push('no Scope section');
  return { problems };
}

// Parses SIT-n / UAT-n / INS-n case definitions with the IDs each cites.
export function parseCases(text) {
  const cases = [];
  for (const { line } of mdLines(text)) {
    const m = line.match(CASE_DEF);
    if (m) cases.push({ id: m[1], refs: [...new Set(line.slice(m.index + m[0].length).match(ID_REF) || [])] });
  }
  return cases;
}

const KIND = { SIT: 'sit', UAT: 'uat', INS: 'inspection' };

export async function matrix({ root = process.cwd(), feature }) {
  const dc = join(root, 'scripts', 'drift-check.mjs');
  if (!existsSync(dc)) throw new Error('scripts/drift-check.mjs not found: run /ainf:init first');
  const { parseSpec, listFiles, loadConfig, isTest } = await import(pathToFileURL(dc).href);
  if (!listFiles || !isTest) throw new Error('scripts/drift-check.mjs is older than ainf 0.3: copy the current one from the ainf plugin');

  const config = loadConfig(root);
  const specPath = join(root, feature, 'spec.md');
  if (!existsSync(specPath)) throw new Error(`${feature}/spec.md not found`);
  const { requirements, criteria } = parseSpec(readFileSync(specPath, 'utf8'));
  const defined = new Set([...requirements, ...criteria.keys()]);
  const toReqs = (refs) => new Set(refs.flatMap((id) => (id.startsWith('R') ? [id] : criteria.get(id) || [])));

  const rows = new Map([...requirements].map((r) => [r, { unit: new Set(), sit: new Set(), uat: new Set(), inspection: new Set() }]));
  const problems = [];

  const caseFiles = readdirSync(join(root, feature)).filter((n) => /^(sit|uat|inspection)[\w.-]*\.md$/i.test(n)).sort();
  for (const name of caseFiles) {
    for (const c of parseCases(readFileSync(join(root, feature, name), 'utf8'))) {
      const unknown = c.refs.filter((id) => !defined.has(id));
      if (!c.refs.length) problems.push(`${name} ${c.id} cites no requirement`);
      if (unknown.length) problems.push(`${name} ${c.id} cites ${unknown.join(', ')}, not in spec.md`);
      for (const r of toReqs(c.refs)) rows.get(r)?.[KIND[c.id.split('-')[0]]].add(c.id);
    }
  }

  for (const f of listFiles(root).filter((x) => isTest(config, x))) {
    const refs = [...new Set(readFileSync(join(root, f), 'utf8').match(ID_REF) || [])];
    if (!refs.length) { problems.push(`${f} cites no requirement or criterion`); continue; }
    for (const r of toReqs(refs.filter((id) => defined.has(id)))) rows.get(r)?.unit.add(f);
  }

  for (const [r, v] of rows) {
    if (!v.unit.size && !v.sit.size && !v.uat.size && !v.inspection.size) problems.push(`${r} has no verification`);
  }
  return { rows, problems, caseFiles };
}

export function renderMatrix(feature, { rows, problems }) {
  const cell = (s) => (s.size ? [...s].sort().join(', ') : '—');
  const out = [
    `# traceability.md: ${feature}`,
    '',
    '<!-- Generated by engagement-check matrix. Regenerate; do not hand-edit the table. -->',
    'Code coverage is not requirement coverage: every requirement needs a verification that fits it.',
    '',
    '| Requirement | Unit tests | SIT cases | UAT scenarios | Inspection | Status |',
    '|---|---|---|---|---|---|',
  ];
  for (const [r, v] of rows) {
    const ok = v.unit.size || v.sit.size || v.uat.size || v.inspection.size;
    out.push(`| ${r} | ${cell(v.unit)} | ${cell(v.sit)} | ${cell(v.uat)} | ${cell(v.inspection)} | ${ok ? 'verified by' : '**GAP**'} |`);
  }
  out.push('', '## Gaps', '', ...(problems.length ? problems.map((p) => `- ${p}`) : ['None.']), '');
  return out.join('\n');
}

async function main(argv) {
  const [cmd, target] = argv;
  const arg = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
  const readArg = (p) => readFileSync(resolve(p), 'utf8');
  let problems;
  if (cmd === 'labels' && target) {
    const r = checkLabels(readArg(target));
    problems = r.problems;
    console.log(`engagement-check labels: ${r.bullets} line(s), ${problems.length} problem(s)`);
  } else if (cmd === 'sow' && target) {
    const spec = arg('--spec');
    problems = checkSow(readArg(target), spec ? readArg(spec) : null).problems;
    console.log(`engagement-check sow: ${problems.length} problem(s)${spec ? '' : ' (no --spec: IDs not checked against a spec)'}`);
  } else if (cmd === 'matrix' && target) {
    const feature = target.replace(/\/$/, '');
    const r = await matrix({ feature });
    problems = r.problems;
    const md = renderMatrix(feature, r);
    if (argv.includes('--write')) {
      writeFileSync(join(feature, 'traceability.md'), md);
      console.log(`wrote ${feature}/traceability.md`);
    } else {
      console.log(md);
    }
    console.log(`engagement-check matrix: ${r.rows.size} requirement(s), ${problems.length} gap(s)`);
  } else {
    console.error('usage: engagement-check.mjs labels <intent.md> | sow <sow.md> [--spec <spec.md>] | matrix <feature-dir> [--write]');
    return 2;
  }
  for (const p of problems) console.log(`  - ${p}`);
  return problems.length ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main(process.argv.slice(2)));
