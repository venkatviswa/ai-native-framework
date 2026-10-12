# Course map

Where each part of the plugin comes from in *The Architect's AI-Native SDLC*. When the course changes, update the component it points to.

| Course chapter | Component | Status |
|---|---|---|
| The artifact chain; fix the earliest artifact | `CLAUDE.md` template, `constitution.md` rule 4, SessionStart artifact index | v0.1 |
| intent.md anatomy, smells, Gate 1, Lab 1 | `skills/intent`, `skills/gate` (Gate 1) | v0.1 |
| Constitution vs CLAUDE.md | `templates/constitution.md`, `templates/CLAUDE.md` | v0.1 |
| Guidance vs enforcement | `templates/githooks/*`, `templates/claude/settings*.json`, `templates/ci/drift-check.yml` | v0.1 |
| spec.md, EARS, clarify, Lab 2, Gate 2 | `skills/spec`, `skills/spec/references/ears.md`, `skills/gate` (Gate 2) | v0.1 |
| plan.md flaw hunt, what to pin down, Lab 3, Gate 3 | `skills/plan`, `skills/gate` (Gate 3) | v0.1 |
| Action boundaries per step | `## Action boundaries` convention, explore/code/release profiles | v0.1 |
| Record rejected options | `skills/plan/template.md` Decisions table | v0.1 |
| Feature spec to stories; story readiness | `skills/tasks` (readiness note) | v0.1 (partial) |
| tasks.md, Gate 4 | `skills/tasks`, `skills/gate` (Gate 4) | v0.1 |
| Explore, plan, code, commit; Lab 4 | `skills/build` | v0.1 |
| Gate 5 review; provenance ladder | `skills/gate` (Gate 5, provenance rule) | v0.1 |
| Traceability; drift and change control | `scripts/drift-check.mjs` (dev, complete, `--base`, commit-msg) | v0.1 |
| Proportionate rigour | `skills/gate` (short note) → `triage` skill | v0.1 note, v0.2 |
| Drift review (convergence) | `/ainf:drift-review` | v0.2 |
| Capstone CR-1 | `/ainf:cr` | v0.2 |
| Release and learn; method retro | `retro` skill, Release and rollback section | v0.1 template, v0.2 skill |
| One spec, three developers | split-work prompt, integration-test owner | v0.2 |
| Three engagements | `ainf-engagements` plugin | v0.3 (intent discovery variant in v0.1) |
| Tool landscape, governance, adoption, SAFe / Shape Up / Team Topologies | README and docs only; no component | n/a |
