# AI-Native Framework

Claude Code plugins for **The Architect's AI-Native SDLC**: humans own intent and judgment, agents do the typing, and the files keep the two honest.

The chain is `intent.md → spec.md → plan.md → tasks.md → code + tests`. A person reviews each artifact before the next one starts, in proportion to the risk. Requirement and criterion IDs (`R1`, `AC3`, `T6`) are the thread that ties every file, test and commit together, and `drift-check` keeps that thread honest.

## Install

```bash
claude plugin marketplace add venkatviswa/ai-native-framework
claude plugin install ainf@ai-native-framework
```

Then, in the repository you want to work in:

```
/ainf:init                      scaffold constitution, CLAUDE.md, drift-check, hooks, CI, permission profiles
/ainf:intent                    interview, then write docs/<feature>/intent.md
/ainf:spec                      EARS requirements + acceptance criteria, then the clarify/attack pass
/ainf:plan                      constitution check, data model, decisions, action boundaries
/ainf:tasks                     small, ID-linked, test-first tasks
/ainf:build                     explore → plan → code → commit, one task at a time
/ainf:gate <1-5> docs/<feature> run a gate checklist with evidence; only a person approves

/ainf:triage                    how much ceremony does this change earn? tier, gates, approvers, evidence
/ainf:cr                        change request: record CR-n, impact by ID, targeted diffs spec-first
/ainf:drift-review docs/<f>     does the code do what the artifacts say? findings → ## Convergence tasks
/ainf:split                     one spec across several developers and agents, with integration-test owners
/ainf:retro                     the outcome missed: which artifact let it through?
```

Reviewer subagents (read-only, raise but never block): `skeptical-tester` (spec, before Gate 2), `plan-reviewer` (before Gate 3), `spec-reviewer` and `standards-reviewer` (Gate 5, run in parallel).

The artifact skills also trigger on their own when the conversation calls for them ("I want to add due-date reminders…").

## What `init` puts in your repo

| File | Job |
|---|---|
| `constitution.md` | Project principles. Every plan runs a constitution check against them. |
| `CLAUDE.md` | Operating instructions the agent reads every session. |
| `scripts/drift-check.mjs` | Dev mode: no stale IDs, every requirement has a task, changed code inside plan.md's action boundaries. `--complete`: every requirement and criterion has a test. `--base <ref>` for CI. `--impact R2`: every line, task, test and commit a change touches. |
| `.githooks/pre-commit`, `commit-msg` | Run tests and drift-check; code commits must name `T# (R#)`. |
| `.github/workflows/drift-check.yml` | Dev mode on pull requests, complete mode on `release/**`. |
| `.claude/settings*.json` | Permission profiles per step: explore, code, release. |
| `.ainf.json` | Where features, code and tests live, and the test command. |

Guidance is not enforcement. `CLAUDE.md` shapes what the agent tries; permissions, hooks and CI decide what can land. The plugin ships both.

## Conventions drift-check reads

```
spec.md   R1 When ..., the system shall ...
          AC1 (R1) Given ... When ... Then ...
plan.md   ## Action boundaries
          - May edit: `src/reminders/**`, `test/**`
          - Ask first: `src/store.js`
tasks.md  - [ ] T3 scan due tasks (R1, AC1)
tests     test('AC1: two owners get one email each', ...)
commits   T3 (R1): scan due tasks
```

It checks references, not meaning. A person still reviews whether a test proves its criterion.

## Repository layout

```
.claude-plugin/marketplace.json   the marketplace
plugins/ainf/                     core plugin: skills, agents, scripts, hook, templates
test/                             tests for drift-check, init and the session index
course-map.md                     which course slide each component comes from
```

## Roadmap

- **v0.3** `ainf-engagements` plugin: discovery (labelled hypothesis intent, POC, SOW), phased delivery (sprint tasks, traceability matrix, SIT/UAT), incident (`incident.md`, read-only, a named human on production changes). Salesforce worked examples plus the cloud-native variant.

## Development

```bash
npm test
npm run validate
```

See [CHANGELOG.md](CHANGELOG.md).

Known limitation: IDs are not namespaced per feature, so two features that both define `AC1` share it for test coverage. Use distinct prefixes per feature if that matters.
