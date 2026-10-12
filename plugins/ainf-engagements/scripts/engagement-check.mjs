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
//   node engagement-check.mjs ledger docs/northfield
//       the engagement workspace: every F-, H-, E-, D-, A-, Q-, RISK-, GAP-, SYS-, INT-, INC- ID is defined
//       once and cited only where it exists and is current; actions have owners and real dates;
//       accepted decisions have a reversal condition and an approver; status.md is not behind the journal
//
// Run from the repository root. `matrix` reuses scripts/drift-check.mjs from /ainf:init.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const LABEL = /\[(fact|inference|recommendation|open question)\s*[·:\-–—]\s*[^\]\s][^\]]*\]/i;
const BULLET = /^\s*(?:[-*+]|\d+[.)])\s+(?!\[[ xX]\])\S/;
const CONSTRAINT_KIND = /\b(Known|Assumed|Unknown)\b/;
// IDs may carry a feature prefix (REM-R1, ainf 0.5); the SOW check compares them without it.
const PFX = '(?:[A-Z][A-Z0-9]{1,7}-)?';
const REQ = new RegExp(`\\b${PFX}R\\d+\\b`, 'g');
const bare = (id) => id.replace(/^[A-Z][A-Z0-9]{1,7}-/, '');
const ESTIMATE = /\b\d+(?:\.\d+)?\s*(?:d|days?|h|hrs?|hours?|w|wks?|weeks?|sprints?|pd|person[- ]days?|FTE)\b|[$€£₹]\s*\d/i;
const CASE_DEF = /^\s*(?:[-*]\s+|\|\s*)?(?:\*\*)?((?:SIT|UAT|INS)-\d+[a-z]?)\b/;
const ID_REF = new RegExp(`\\b${PFX}(?:AC\\d+[a-z]?|R\\d+)\\b`, 'g');

// Walks markdown, skipping fenced code and HTML comments, tracking the current heading.
function* mdLines(text, { headings = false } = {}) {
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
    if (h) { heading = h[1].trim(); if (headings) yield { n: i + 1, line, heading, isHeading: true }; continue; }
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
    const m = line.match(new RegExp(`^\\s*(?:[-*]\\s+|\\|\\s*)?(?:\\*\\*)?${PFX}(R\\d+)\\b`));
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
      const unknown = defined ? reqs.filter((r) => !defined.has(bare(r))) : [];
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

const localIds = (text) => text.match(ID_REF) || [];

// Parses SIT-n / UAT-n / INS-n case definitions with the IDs each cites.
export function parseCases(text, ids = localIds) {
  const cases = [];
  for (const { line } of mdLines(text)) {
    const m = line.match(CASE_DEF);
    if (m) cases.push({ id: m[1], refs: [...new Set(ids(line.slice(m.index + m[0].length)))] });
  }
  return cases;
}

const KIND = { SIT: 'sit', UAT: 'uat', INS: 'inspection' };

export async function matrix({ root = process.cwd(), feature }) {
  const dc = join(root, 'scripts', 'drift-check.mjs');
  if (!existsSync(dc)) throw new Error('scripts/drift-check.mjs not found: run /ainf:init first');
  const { parseSpec, listFiles, loadConfig, isTest, refs, isReq } = await import(pathToFileURL(dc).href);
  if (!listFiles || !isTest) throw new Error('scripts/drift-check.mjs is older than ainf 0.3: copy the current one from the ainf plugin');

  const config = loadConfig(root);
  const specPath = join(root, feature, 'spec.md');
  if (!existsSync(specPath)) throw new Error(`${feature}/spec.md not found`);
  const { prefix = '', requirements, criteria } = parseSpec(readFileSync(specPath, 'utf8'));
  // ainf 0.5+ resolves prefixed IDs the way drift-check does; older copies fall back to short IDs.
  const featuresDir = join(root, config.featuresDir);
  const known = new Set(refs && existsSync(featuresDir)
    ? readdirSync(featuresDir).map((n) => join(featuresDir, n, 'spec.md')).filter(existsSync)
      .map((s) => parseSpec(readFileSync(s, 'utf8')).prefix).filter(Boolean)
    : []);
  const idsIn = (ns) => (refs ? (text) => refs(text, ns, known) : localIds);
  const req = isReq || ((id) => id.startsWith('R'));
  const defined = new Set([...requirements, ...criteria.keys()]);
  const toReqs = (ids) => new Set(ids.flatMap((id) => (req(id) ? [id] : criteria.get(id) || [])));

  const rows = new Map([...requirements].map((r) => [r, { unit: new Set(), sit: new Set(), uat: new Set(), inspection: new Set() }]));
  const problems = [];

  const caseFiles = readdirSync(join(root, feature)).filter((n) => /^(sit|uat|inspection)[\w.-]*\.md$/i.test(n)).sort();
  for (const name of caseFiles) {
    for (const c of parseCases(readFileSync(join(root, feature, name), 'utf8'), idsIn(prefix))) {
      const unknown = c.refs.filter((id) => !defined.has(id));
      if (!c.refs.length) problems.push(`${name} ${c.id} cites no requirement`);
      if (unknown.length) problems.push(`${name} ${c.id} cites ${unknown.join(', ')}, not in spec.md`);
      for (const r of toReqs(c.refs)) rows.get(r)?.[KIND[c.id.split('-')[0]]].add(c.id);
    }
  }

  for (const f of listFiles(root).filter((x) => isTest(config, x))) {
    const cited = [...new Set(idsIn('')(readFileSync(join(root, f), 'utf8')))];
    if (!cited.length) { problems.push(`${f} cites no requirement or criterion`); continue; }
    for (const r of toReqs(cited.filter((id) => defined.has(id)))) rows.get(r)?.unit.add(f);
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

// ---- ledger: the engagement workspace's IDs ----

const LID = '(?:RISK|GAP|SYS|INT|INC|[FHEDAQ])-\\d+[a-z]?';
const LID_RE = new RegExp(`\\b${LID}\\b`, 'g');
const LID_EXACT = new RegExp(`^${LID}$`);
const HEADING_DEF = new RegExp(`^#{2,4}\\s+(?:~~)?(${LID})\\b`);
const SUCCESSOR = new RegExp(`superseded by\\s+(?:\\*\\*)?(${LID})`, 'i');
const TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/;
const HISTORY_LINE = /supersed|replaces|amended|\bwas\b/i; // corrections may name the old ID
const blank = (v) => v === undefined || /^(?:|—|–|-|\?|tbd|n\/a)$/i.test(v.trim());
const cellsOf = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const plain = (s) => s.replace(/[*~`]/g, '').trim();

// Definitions: a table row whose first cell is the ID, or a heading that starts with it.
export function ledgerEntries(text) {
  const all = [...mdLines(text, { headings: true })];
  const entries = [];
  let header = null;
  let block = null;
  for (let i = 0; i < all.length; i++) {
    const { n, line, isHeading } = all[i];
    if (isHeading) {
      const m = line.match(HEADING_DEF);
      block = m ? { id: m[1], n, text: line, fields: {} } : null;
      if (block) entries.push(block);
      header = null;
      continue;
    }
    if (block) {
      block.text += `\n${line}`;
      for (const f of line.matchAll(/\*\*([^*:]+):\*\*\s*([^·]*?)\s*(?=·|\*\*[^*]+:\*\*|$)/g)) block.fields[f[1].trim().toLowerCase()] = plain(f[2]);
      const b = line.match(/^\s*[-*]\s+([A-Za-z][\w' ]*?):\s+(.+)$/);
      if (b) block.fields[b[1].trim().toLowerCase()] ??= plain(b[2]);
    }
    if (!/^\s*\|/.test(line)) { header = null; continue; }
    if (TABLE_SEP.test(line)) continue;
    if (TABLE_SEP.test(all[i + 1]?.line || '')) { header = cellsOf(line).map((h) => plain(h).toLowerCase()); continue; }
    if (!header) continue;
    const cells = cellsOf(line);
    const id = plain(cells[0]);
    if (LID_EXACT.test(id)) entries.push({ id, n, text: line, fields: Object.fromEntries(header.map((h, k) => [h, plain(cells[k] || '')])) });
  }
  return entries;
}

const field = (e, ...names) => {
  const key = Object.keys(e.fields).find((k) => names.some((nm) => k.includes(nm)));
  return key === undefined ? undefined : e.fields[key];
};
const statusOf = (e) => field(e, 'status') || (e.text.split('\n')[0].match(/\(([^)]+)\)\s*$/) || [])[1] || '';
const isSuperseded = (e) => /supersed|⛔/i.test(statusOf(e)) || /^#.*(⛔|superseded)/i.test(e.text);

function ledgerFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const name of readdirSync(d).sort()) {
      if (name.startsWith('_') || name.startsWith('.') || name === 'node_modules') continue;
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(md|html?)$/i.test(name)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

export function checkLedger(dir) {
  const problems = [];
  const files = ledgerFiles(dir).map((full) => ({ full, rel: relative(dir, full), text: readFileSync(full, 'utf8') }));
  const defs = new Map();
  for (const f of files.filter((x) => x.rel.endsWith('.md'))) {
    for (const e of ledgerEntries(f.text)) {
      e.file = f.rel;
      if (defs.has(e.id)) {
        const first = defs.get(e.id);
        problems.push(`${e.id} defined twice: ${first.file}:${first.n} and ${e.file}:${e.n}. IDs are never reused; cite the first, or give the new one the next number`);
      } else defs.set(e.id, e);
    }
  }

  for (const e of defs.values()) {
    const at = `${e.file}:${e.n} ${e.id}`;
    const kind = e.id.split('-')[0];
    if (isSuperseded(e)) {
      const next = e.text.match(SUCCESSOR)?.[1];
      if (!next) problems.push(`${at} is superseded but does not say by what (write "superseded by <ID>")`);
      else if (!defs.has(next)) problems.push(`${at} is superseded by ${next}, which is not defined`);
      continue;
    }
    if (kind === 'A') {
      const owner = field(e, 'owner');
      const due = field(e, 'due', 'eta', 'date');
      if (blank(owner)) problems.push(`${at} has no owner`);
      if (due && /\b(asap|soon|next week|later|eow|eod|tbc)\b/i.test(due)) problems.push(`${at} is due "${due}": give a date, or "none" with a reason`);
    }
    if (kind === 'D' && /accepted|✅/i.test(statusOf(e))) {
      if (blank(field(e, 'reversal', 'revisit'))) problems.push(`${at} is accepted but has no reversal condition`);
      if (blank(field(e, 'approved', 'approver'))) problems.push(`${at} is accepted but names no approver`);
    }
    if (kind === 'F') {
      const label = field(e, 'label', 'confidence');
      if (blank(label) || !/confirmed|inferred|to confirm/i.test(label)) problems.push(`${at} has no label (confirmed, inferred or to confirm)`);
      if (blank(field(e, 'source'))) problems.push(`${at} has no source`);
    }
    if (kind === 'Q' && /^answered/i.test(statusOf(e)) && blank(field(e, 'answered in', 'answer'))) problems.push(`${at} is answered but does not say where (Answered in)`);
    if (kind === 'RISK' && blank(field(e, 'owner'))) problems.push(`${at} has no owner`);
    if (kind === 'H' && !/^(open|testing|confirmed|killed|eliminated|parked)\b/i.test(statusOf(e))) problems.push(`${at} status "${statusOf(e)}" is not open, testing, confirmed, killed, eliminated or parked`);
  }

  for (const f of files) {
    const undefinedIds = new Set();
    const isJournal = basename(f.rel) === 'journal.md';
    // Inline code and fenced blocks are examples, not citations.
    for (const { n, line: raw } of mdLines(f.text, { headings: true })) {
      const line = raw.replace(/`[^`]*`/g, '');
      const i = n - 1;
      for (const m of line.matchAll(LID_RE)) {
        const id = m[0];
        const d = defs.get(id);
        if (!d) { undefinedIds.add(id); continue; }
        if (d.file === f.rel && d.n === i + 1) continue; // its own definition
        if (isSuperseded(d) && !isJournal && !HISTORY_LINE.test(line) && !(d.file === f.rel && d.text.includes(line))) {
          const next = d.text.match(SUCCESSOR)?.[1];
          problems.push(`${f.rel}:${i + 1} cites ${id}, superseded${next ? ` by ${next}` : ''}`);
        }
      }
    }
    if (undefinedIds.size) problems.push(`${f.rel} cites ${[...undefinedIds].sort().join(', ')}, defined in no ledger in this folder`);
  }

  const statusFile = files.find((f) => f.rel === 'status.md');
  const journal = files.find((f) => f.rel === 'journal.md');
  if (statusFile && journal) {
    const updated = (statusFile.text.match(/Last updated:?\**\s*(\d{4}-\d{2}-\d{2})/i) || [])[1];
    const newest = [...journal.text.matchAll(/^#{2,3}\s+(\d{4}-\d{2}-\d{2})/gm)].map((m) => m[1]).sort().pop();
    if (newest && (!updated || updated < newest)) problems.push(`status.md last updated ${updated || 'never'}, but journal.md has an entry for ${newest}: refresh status.md`);
  }

  const counts = {};
  for (const id of defs.keys()) { const k = id.split('-')[0]; counts[k] = (counts[k] || 0) + 1; }
  return { problems, counts, files: files.length };
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
  } else if (cmd === 'ledger' && target) {
    const r = checkLedger(resolve(target));
    problems = r.problems;
    const summary = Object.entries(r.counts).map(([k, v]) => `${k} ${v}`).join(' · ') || 'none';
    console.log(`engagement-check ledger: ${r.files} file(s), IDs defined: ${summary}; ${problems.length} problem(s)`);
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
    console.error('usage: engagement-check.mjs labels <intent.md> | sow <sow.md> [--spec <spec.md>] | matrix <feature-dir> [--write] | ledger <engagement-dir>');
    return 2;
  }
  for (const p of problems) console.log(`  - ${p}`);
  return problems.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(await main(process.argv.slice(2)));
