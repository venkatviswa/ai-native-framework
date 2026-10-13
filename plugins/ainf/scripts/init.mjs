#!/usr/bin/env node
// Stamps the AI-native SDLC scaffold into a repository. Never overwrites an existing file.
//
//   node init.mjs [target-dir]

import { execFileSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const plugin = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(process.argv[2] || process.cwd());

const FILES = [
  ['templates/constitution.md', 'constitution.md'],
  ['templates/CLAUDE.md', 'CLAUDE.md'],
  ['templates/REVIEW.md', 'REVIEW.md'],
  ['templates/github/PULL_REQUEST_TEMPLATE.md', '.github/PULL_REQUEST_TEMPLATE.md'],
  ['templates/ainf.json', '.ainf.json'],
  ['templates/githooks/pre-commit', '.githooks/pre-commit', 0o755],
  ['templates/githooks/commit-msg', '.githooks/commit-msg', 0o755],
  ['scripts/drift-check.mjs', 'scripts/drift-check.mjs', 0o755],
  ['templates/ci/drift-check.yml', '.github/workflows/drift-check.yml'],
  ['templates/claude/settings.json', '.claude/settings.json'],
  ['templates/claude/settings.explore.json', '.claude/settings.explore.json'],
  ['templates/claude/settings.release.json', '.claude/settings.release.json'],
  // Placeholder templates for each feature artifact. Skills use the repo's copy when it exists,
  // so a team edits these once instead of the plugin. The leading _ keeps drift-check off them.
  ...['intent', 'spec', 'plan', 'tasks', 'stories', 'cr'].map((n) => [`templates/docs/${n}.md`, `docs/_templates/${n}.md`]),
];

const created = [];
const skipped = [];
for (const [from, to, mode] of FILES) {
  const dest = join(target, to);
  if (existsSync(dest)) { skipped.push(to); continue; }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(plugin, from), dest);
  if (mode) chmodSync(dest, mode);
  created.push(to);
}

let hooks = 'not a git repository: run `git init`, then `git config core.hooksPath .githooks`';
try {
  execFileSync('git', ['rev-parse', '--git-dir'], { cwd: target, stdio: 'ignore' });
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: target });
  hooks = 'git core.hooksPath set to .githooks';
} catch { /* keep the message above */ }

console.log(`ainf init in ${target}`);
for (const f of created) console.log(`  created  ${f}`);
for (const f of skipped) console.log(`  exists   ${f} (left unchanged; merge by hand if needed)`);
console.log(`  ${hooks}`);
