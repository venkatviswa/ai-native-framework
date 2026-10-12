# CLAUDE.md

## Stack and commands
- Test: `npm test`
- Drift check: `node scripts/drift-check.mjs` (dev) · `--complete` before calling a feature done

## Read first
- constitution.md, then the feature's docs/<feature>/intent.md, spec.md, plan.md, tasks.md, in that order.

## Always
- Write a failing test before code. Name tests after the criterion they prove: `AC3: snooze 4 h sends one follow-up`.
- One task per commit. Subject names the task and requirement: `T3 (R1): scan due tasks`.
- Stay inside plan.md's Action boundaries. Ask before touching anything under "Ask first".
- If code and spec disagree, stop and ask. Never silently pick one.
- If behaviour changes, spec.md and plan.md change first, with targeted edits, not rewrites.

## Never
- Add a dependency or vendor without approval.
- Put personal data in logs.
- Change migrations or schema without human approval.
- Mark a gate approved yourself. Only a named person approves.

## Enforced elsewhere
- `.githooks/pre-commit` runs tests and drift-check; `.githooks/commit-msg` requires `T# (R#)` for code changes.
- `.claude/settings.json` permissions; CI runs drift-check on pull requests.
- Required before team use: branch protection, secret scanning, managed settings.
