# CLAUDE.md

**Template:** [`templates/CLAUDE.md`](../../plugins/ainf/templates/CLAUDE.md) · stamped by `/ainf:init` at the repo root, which fills the stack placeholders from the repo · loaded by Claude Code into every session

## What it is for

The agent's standing briefing: what this project is, how to build and test it, where things live, what to read first, and the house rules it must follow. It is **guidance**: the agent usually follows it. Anything that must always hold is also enforced by permissions, hooks or CI, and the *Enforced elsewhere* section says so, so the agent knows why it was blocked.

## Who owns it, when it changes

The team. Update it when the stack, the commands or the layout changes, or when a retro finds a *context gap*: the agent lacked a fact the repo already held.

## Sections

| Section | Fill with |
|---|---|
| Project | One paragraph: what the system does, who uses it, what must never break. |
| Stack and commands | The real test, build and lint commands. The agent runs these, so they must work as written. |
| Where things live | Code, tests, feature docs and templates. |
| Read first | constitution.md, then the feature's intent, spec, plan and tasks. Keeps the agent starting from files, not memory. |
| Always / Never | Short, checkable house rules. Add project-specific ones under the defaults. |
| Enforced elsewhere | Which rules hooks, permissions and CI back up. |

## Keep it short

Every session loads it, so every line costs context, every time. Aim for under 60 lines. Prefer a pointer ("see docs/architecture.md") over a pasted explanation. Rules belong in constitution.md; feature detail belongs in the feature's docs.

## Weak vs strong

| Weak | Strong |
|---|---|
| "Run the tests." | "Test: `pnpm vitest run`" |
| "Follow our conventions." | "One task per commit: `T3 (R1): scan due tasks`" |
| "Be careful with the database." | "Never edit `migrations/**` without approval (also enforced: settings.json asks)." |
