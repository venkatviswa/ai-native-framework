# CLAUDE.md

## Project
[One paragraph: what this system is, who uses it, and what must never break.]

## Stack and commands
- Language and framework: [e.g. TypeScript 5, Node 20, Fastify]
- Test: `[test command, e.g. npm test]`
- Build: `[build command]`
- Lint: `[lint command]`
- Drift check: `node scripts/drift-check.mjs` (dev) · `--complete` before calling a feature done

## Where things live
- Production code: `[src/]`
- Tests: `[test/]`
- Feature docs: `docs/<feature>/` · templates for new ones: `docs/_templates/`

## Read first
- constitution.md, then the feature's docs/<feature>/intent.md, spec.md, plan.md, tasks.md, in that order.

## Things the agent gets wrong
<!-- One entry per mistake that happened twice: the mistake, the fix, how to check for it. This is the one section that must grow (REVIEW.md, the second-time rule). -->
- [mistake] → [fix] → [how to check]

## Always
- Write a failing test before code. Name tests after the criterion they prove: `AC3: snooze 4 h sends one follow-up`.
- One task per commit. Subject names the task and requirement: `T3 (R1): scan due tasks`.
- If the feature's spec.md has an `ID prefix:` line, tests and commits use the full ID: `REM-AC3: ...`, `REM-T3 (REM-R1): ...`. Inside the feature's own docs a short `R1` is fine.
- Stay inside plan.md's Action boundaries. Ask before touching anything under "Ask first".
- If code and spec disagree, stop and ask. Never silently pick one.
- If behaviour changes, spec.md and plan.md change first, with targeted edits, not rewrites.

## Never
- Add a dependency or vendor without approval.
- Put personal data in logs.
- Change migrations or schema without human approval.
- Mark a gate approved yourself. Only a named person approves.
- Approve or block a review on your own findings. Reviews follow REVIEW.md: three passes, at most five nits, two questions for the human.
- [Project-specific never, e.g. "Call the payments sandbox from tests; use the fake in test/fakes/".]

## Enforced elsewhere
- `.githooks/pre-commit` runs tests and drift-check; `.githooks/commit-msg` requires `T# (R#)` for code changes.
- `.claude/settings.json` permissions; CI runs drift-check on pull requests.
- Required before team use: branch protection, secret scanning, managed settings.
