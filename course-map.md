# Course map

Where each part of the plugin comes from in *The Architect's AI-Native SDLC*. When the course changes, update the component it points to.

| Course chapter | Component | Status |
|---|---|---|
| The artifact chain; fix the earliest artifact | `CLAUDE.md` template, `constitution.md` rule 4, SessionStart artifact index | v0.1 |
| intent.md anatomy, smells, Gate 1, Lab 1 | `skills/intent`, `skills/gate` (Gate 1) | v0.1 |
| Constitution vs CLAUDE.md | `templates/constitution.md`, `templates/CLAUDE.md` | v0.1 |
| Guidance vs enforcement | `templates/githooks/*`, `templates/claude/settings*.json`, `templates/ci/drift-check.yml` | v0.1 |
| spec.md, EARS, clarify, Lab 2, Gate 2 | `skills/spec`, `skills/spec/references/ears.md`, `agents/skeptical-tester`, `skills/gate` (Gate 2) | v0.1, agent v0.2 |
| plan.md flaw hunt, what to pin down, Lab 3, Gate 3 | `skills/plan`, `agents/plan-reviewer`, `skills/gate` (Gate 3) | v0.1, agent v0.2 |
| Action boundaries per step | `## Action boundaries` convention, explore/code/release profiles | v0.1 |
| Record rejected options | `skills/plan/template.md` Decisions table | v0.1 |
| Feature spec to stories; story readiness | `skills/tasks` (readiness note) | v0.1 (partial) |
| tasks.md, Gate 4 | `skills/tasks`, `skills/gate` (Gate 4) | v0.1 |
| Explore, plan, code, commit; Lab 4 | `skills/build` | v0.1 |
| Gate 5 review; provenance ladder | `skills/gate` (Gate 5, provenance rule), `agents/spec-reviewer` + `agents/standards-reviewer` in parallel | v0.1, agents v0.2 |
| Traceability; drift and change control | `scripts/drift-check.mjs` (dev, complete, `--base`, commit-msg) | v0.1 |
| Proportionate rigour | `skills/triage` | v0.2 |
| Drift review (convergence) | `skills/drift-review` | v0.2 |
| Capstone CR-1 | `skills/cr`, `skills/cr/template.md`, `drift-check --impact` | v0.2 |
| Release and learn; method retro | `skills/retro`, plan.md Release and rollback section | v0.2 |
| One spec, three developers | `skills/split` | v0.2 |
| Three engagements: discovery, label every line | `ainf-engagements/skills/discovery`, `engagement-check labels` | v0.3 (intent discovery variant in v0.1) |
| Discovery notes to POC and SOW | `ainf-engagements/skills/poc`, `skills/sow`, `agents/sow-reviewer`, `engagement-check sow` | v0.3 |
| Phased delivery: phases, baseline, four things that change | `ainf-engagements/skills/phased`, `skills/sprint`, drift-check `tasks-*.md` | v0.3 |
| Cut a sprint; SIT and UAT from the spec; traceability matrix | `ainf-engagements/skills/sprint`, `skills/sit-uat`, `skills/traceability`, `engagement-check matrix` | v0.3 |
| Go-live: cutover, rollback, go / no-go | `ainf-engagements/skills/golive` | v0.3 |
| Red account: incident chain, action boundaries, aftermath | `ainf-engagements/skills/incident`, `templates/settings.incident.json` | v0.3 |
| Three engagements compared; cloud-native | `ainf-engagements/references/platforms.md` | v0.3 |
| Tool landscape, governance, adoption, SAFe / Shape Up / Team Topologies | README and docs only; no component | n/a |
