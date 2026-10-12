# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Both plugins (`ainf`, `ainf-engagements`) are released together under one version and tagged `vX.Y.Z`.

## [Unreleased]

### Added
- MIT license.
- Reference docs in `docs/`: `concepts.md` (IDs, drift, drift-check, guidance vs enforcement) and one guide per artifact (constitution, CLAUDE.md, intent, spec, plan, tasks, change request), linked from the README.
- `/ainf:init` stamps placeholder templates for intent, spec, plan, tasks and CR into `docs/_templates/`. The skills use the repo's copy when it exists, so a team sets its house style once.
- `constitution.md` template: project-rule placeholders, an Approvers table per gate, and who may change the file. `/ainf:gate` names the approver from it.
- `CLAUDE.md` template: Project and Where things live sections, with stack placeholders that init fills from the repo.

### Changed
- The artifact templates moved from `skills/<name>/template.md` to `plugins/ainf/templates/docs/<name>.md`, so each one lives in a single place.
- drift-check and the session index skip folders under `docs/` whose names start with `_`.

### Fixed
- README: the change-request sequence diagram failed to render on GitHub (a semicolon ends a Mermaid statement).

## [0.3.0] - 2026-10-12

Consulting engagements.

### Added
- New plugin **`ainf-engagements`** (requires `ainf`):
  - Discovery: `discovery` (labelled hypothesis intent), `poc` (one falsifiable claim, pass/fail agreed in advance), `sow` (traceable core).
  - Phased delivery: `phased` (signed baseline), `sprint` (cut and close), `sit-uat`, `traceability`, `golive` (cutover and go/no-go, never deploys).
  - Incident: `incident` (living incident.md, read-only agent, a named human on every production change).
  - `sow-reviewer` subagent (read-only).
  - `scripts/engagement-check.mjs` with three commands:
    - `labels` checks every discovery line for a label and a source.
    - `sow` checks that every Scope and Acceptance item cites a defined requirement and that "to confirm" items carry no estimate.
    - `matrix` builds a traceability matrix across unit tests, `SIT-n`, `UAT-n` and `INS-n`.
  - `templates/settings.incident.json`, a read-only incident permission profile covering Salesforce CLI, kubectl, helm and terraform.
  - `references/platforms.md`: Salesforce and cloud-native compared.
- `ainf`: drift-check reads per-sprint task files (`tasks-*.md`) alongside `tasks.md`, for stale IDs, coverage and `--impact`.
- `ainf`: drift-check exports `listFiles`, `loadConfig` and `isTest` so other tools see tests the same way.
- `ainf`: the SessionStart index shows poc-spec, sow and incident status, and task progress across sprint files.
- Detailed README: rationale, installation, skill catalog, architecture diagrams and version log.

## [0.2.0] - 2026-10-12

Change control and review.

### Added
- Skills:
  - `cr`: change request with a CR-n record, impact by ID, and targeted diffs, spec first.
  - `drift-review`: convergence-style findings that append `## Convergence` tasks.
  - `triage`: three dials → tier, gates, approvers and evidence.
  - `retro`: seven-cause taxonomy, and the artifact to fix first.
  - `split`: one spec across several developers, with integration-test owners and scoped agent instructions.
- Subagents, all read-only:
  - `skeptical-tester` and `plan-reviewer`, used at Gates 2 and 3.
  - `spec-reviewer` and `standards-reviewer`, which Gate 5 runs in parallel.
- `drift-check --impact R2[,AC7]`: every line, task, test, code comment and commit that cites the IDs; a requirement brings its criteria.

## [0.1.0] - 2026-10-12

The core chain.

### Added
- Skills: `init`, `intent`, `spec`, `plan`, `tasks`, `build`, `gate`.
- `drift-check`: dev mode, complete mode, `--base` for CI, and commit-msg.
- Git hooks, the CI workflow, and explore/code/release permission profiles.
- SessionStart artifact index.

[Unreleased]: https://github.com/venkatviswa/ai-native-framework/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/venkatviswa/ai-native-framework/releases/tag/v0.1.0
