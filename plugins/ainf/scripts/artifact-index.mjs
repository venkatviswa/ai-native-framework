#!/usr/bin/env node
// SessionStart hook: prints a short index of features and their gate status so the agent
// starts from the files, not from memory. Silent when the repo has no feature docs.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
let featuresDir = 'docs';
try { featuresDir = JSON.parse(readFileSync(join(root, '.ainf.json'), 'utf8')).featuresDir || featuresDir; } catch { /* default */ }

const dir = join(root, featuresDir);
if (!existsSync(dir)) process.exit(0);

// Core chain first, then the engagement artifacts (ainf-engagements) when present.
const ARTIFACTS = ['intent.md', 'poc-spec.md', 'spec.md', 'plan.md', 'sow.md', 'incident.md'];
const isTasks = (n) => /^tasks(-[\w.-]+)?\.md$/.test(n);
const rows = [];
for (const name of readdirSync(dir).sort()) {
  if (name.startsWith('_')) continue; // docs/_templates
  const files = ARTIFACTS.filter((f) => existsSync(join(dir, name, f)));
  const taskFiles = existsSync(join(dir, name)) && statSync(join(dir, name)).isDirectory()
    ? readdirSync(join(dir, name)).filter(isTasks) : [];
  if (!files.length && !taskFiles.length) continue;
  const parts = files.map((f) => {
    const text = readFileSync(join(dir, name, f), 'utf8');
    const status = (text.match(/^Status:\s*(.+)$/m) || [])[1]?.trim() || 'no status';
    const blocking = (text.match(/BLOCKING:/g) || []).length;
    return `${f.replace('.md', '')} ${status.split(/\s+\(/)[0]}${blocking ? ` (${blocking} BLOCKING)` : ''}`;
  });
  if (taskFiles.length) {
    const text = taskFiles.map((f) => readFileSync(join(dir, name, f), 'utf8')).join('\n');
    const done = (text.match(/^\s*[-*]\s+\[[xX]\]/gm) || []).length;
    const all = (text.match(/^\s*[-*]\s+\[[ xX]\]/gm) || []).length;
    parts.push(`tasks ${done}/${all}${taskFiles.length > 1 ? ` in ${taskFiles.length} files` : ''}`);
  }
  rows.push(`- ${featuresDir}/${name}: ${parts.join(' · ')}`);
}
if (!rows.length) process.exit(0);

console.log([
  'AI-native SDLC artifacts in this repo (files are the source of truth; read them before editing):',
  ...rows,
  'Fix the earliest artifact that caused a problem. Only a named person approves a gate.',
].join('\n'));
