# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Both plugins (`ainf`, `ainf-engagements`) are released together under one version and tagged `vX.Y.Z`.

## [Unreleased]

## [0.6.1] - 2026-10-13

Sync with the course at Version 13.

### Fixed
- `drift-check --base <ref>`: when git cannot compare the ref (unknown ref, shallow clone), the check now prints git's error and exits 2. It used to treat the failure as an empty diff and pass, which let CI go green with nothing checked.

### Added
- `templates/REVIEW.md` (copied by `/ainf:init`): three passes, severity meaning, at most five nits, the two questions a human answers, the second-time rule.
- `templates/github/PULL_REQUEST_TEMPLATE.md` (copied to `.github/`): tasks, requirement and criterion IDs, files inside the boundaries, evidence before review.
- CLAUDE.md template: a "Things the agent gets wrong" section and the second-time rule; a Never line against self-approving reviews.
- `/ainf:gate 5` reports against REVIEW.md; `/ainf:retro` applies the second-time rule.
- Incident template: sev-1/2/3 definitions and an accountable owner.
- README: an Adoption order section.
- Reference docs: the CLAUDE.md guide covers "Things the agent gets wrong"; the docs index lists REVIEW.md and the pull-request template.

### Changed
- `/ainf:gate 5` falls back to REVIEW.md's defaults in repos that have none.
- The `ainf-engagements` marketplace and plugin descriptions name the workspace, readouts and escalations added in 0.6.0.

## [0.6.0] - 2026-10-12

Engagement workspace, escalations and readouts.

### Added
- `ainf-engagements`: `/ainf-engagements:workspace` and `templates/workspace/`. One ledger per kind of thing (facts `F-n`, decisions `D-n`, actions `A-n`, questions `Q-n`, risks `RISK-n`, gaps `GAP-n`, systems `SYS-n` and integrations `INT-n`), a status.md snapshot, a prepend-only journal.md, per-session notes, stakeholders, and a workspace CLAUDE.md (source-of-truth order, absolute dates, supersede-never-delete, draft-never-send).
- `engagement-check ledger <dir>`: IDs defined once and cited only where they exist and are current (readouts included); superseded entries name an existing successor; actions have owners and real dates; accepted decisions have an approver and a reversal condition; facts have a label and a source; answered questions say where; hypothesis statuses are valid; status.md is not older than the newest journal entry.
- `/ainf-engagements:escalation` for red accounts and chronic problems: mission intent with three-tier done, identities and topology verified first, related incidents (`INC-n`), a sceptical read of third-party RCAs, an rca-plan with confirm and kill tests and decision gates, an RCA with a cause tree, remediation with containment apart from cure and capability tags, a triage-only runbook, monitoring signals, an exit scorecard, handover and closure.
- `/ainf-engagements:readout`: client readouts drafted from the ledgers, every claim citing its ID, checked by `ledger`.
- POC plan: a test table and a stop-and-ask list; POC results record E- evidence and update hypotheses and facts.
- Reference doc `docs/engagements.md`, and `docs/mappings/` for SAFe, Shape Up and Team Topologies.
- The session index shows an engagement workspace's last status update, and rca, remediation and exit files.

### Changed
- `/ainf-engagements:discovery` runs on the workspace: session notes keyed to question IDs with a carry-forward list, `?` and `⚠` markers, facts written once in facts.md, a hypothesis table with dated status, risks kept apart from gaps and decisions, and SOW entry criteria. `notes-template.md` is replaced by `document-template.md`; session notes use the workspace's template.
- `/ainf-engagements:incident` covers acute outages and hands recurring or still-red problems to escalation. **Convention change:** incident hypotheses and evidence are numbered `H-1` and `E-1` (were `H1`, `E1`) so the ledger check reads them.
- The session index trims a status line at ` · `.

## [0.5.0] - 2026-10-12

Namespaced IDs and backlog stories.

### Added
- ID prefixes: a spec.md line `ID prefix: REM` makes the feature's IDs `REM-R1`, `REM-AC1` and `REM-T1`, so two features can both define `AC1`. Short IDs still work inside the feature's own docs; tests, code and commits use the full ID. Opt-in: a repo without prefixes behaves as before.
- drift-check reports duplicate prefixes and IDs a spec defines under another feature's prefix, and notes unprefixed features that share IDs. `requireIdPrefix` in `.ainf.json` makes a missing prefix a problem.
- Cross-feature citations: a full ID from another feature (`REM-R1` in the payments plan) is valid wherever that feature defines it.
- `/ainf:stories` skill, `templates/docs/stories.md` (stamped by init) and `drift-check --stories [--csv]`: backlog keys (Jira, Azure Boards, GitHub) mapped to R and AC IDs, with requirements, criteria tested, tasks and commits per story. `storyPattern` in `.ainf.json` sets the key format.
- `--impact` accepts full IDs (`REM-R2`), and short IDs with `--feature`.
- The session index shows each feature's prefix: `docs/reminders [REM]`.
- Reference docs: namespaced IDs and stories in `concepts.md`, and a stories.md guide.
- drift-check exports `refs` and `isReq`.

### Changed
- `ainf-engagements`: `engagement-check sow` accepts prefixed IDs, and `matrix` resolves them the way drift-check does (older drift-check copies fall back to short IDs).
- The commit-msg check accepts `REM-T3 (REM-R1): …`.

### Fixed
- `drift-check --feature` reported tests citing another feature's IDs as stale, because it read only the selected spec. It now reads every spec.
- course-map pointed at the template paths from before 0.4.

## [0.4.0] - 2026-10-12

Reference docs and project-owned templates.

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

[Unreleased]: https://github.com/venkatviswa/ai-native-framework/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/venkatviswa/ai-native-framework/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/venkatviswa/ai-native-framework/releases/tag/v0.1.0
