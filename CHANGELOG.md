# Changelog

## 0.2.0

Change control and review.

- Skills: `cr` (change request with CR-n record, impact by ID, targeted diffs spec-first), `drift-review` (convergence-style findings that append `## Convergence` tasks), `triage` (three dials → tier, gates, approvers, evidence), `retro` (seven-cause taxonomy, artifact to fix first), `split` (one spec across several developers, integration-test owners, scoped agent instructions).
- Subagents, all read-only: `skeptical-tester`, `plan-reviewer`, `spec-reviewer`, `standards-reviewer`. Gate 5 runs the last two in parallel; Gates 2 and 3 use the first two.
- `drift-check --impact R2[,AC7]`: every line, task, test, code comment and commit that cites the IDs; a requirement brings its criteria.

## 0.1.0

Core chain: `init`, `intent`, `spec`, `plan`, `tasks`, `build`, `gate`; `drift-check` (dev, complete, `--base`, commit-msg); git hooks, CI workflow and permission profiles; SessionStart artifact index.
