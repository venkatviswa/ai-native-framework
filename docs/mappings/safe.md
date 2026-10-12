# SAFe

SAFe organises work as epics, features and stories across an Agile Release Train, planned in Program Increments (PIs). The framework attaches to the feature level, because that is where one spec and one plan make sense.

## Artifact mapping

| SAFe item | Framework artifact | Notes |
|---|---|---|
| Epic (with its hypothesis and lean business case) | `intent.md`, discovery variant, at the epic level | Label the hypothesis lines `[inference]` until the MVP proves them. The epic's leading indicators become **Done means**. |
| Feature (with benefit hypothesis and acceptance criteria) | `docs/<feature>/spec.md` | One feature, one spec, one `ID prefix:`. The feature's acceptance criteria become `AC#` lines, each mapped to an `R#`. |
| Enabler (architectural, infrastructure) | `plan.md` decisions and contracts, or its own feature folder | An enabler with its own behaviour gets a spec; one that only serves a feature lives in that feature's plan. |
| Story | a line in `stories.md`, and one or more tasks | The story key maps to R and AC IDs; tasks cite them. |
| Architectural runway | `constitution.md` rules and shared contracts | Contracts other features rely on are named in each consuming plan, with the owning feature's prefix: `PLAT-R3`. |
| Non-functional requirements | `R#` lines with an EARS *Where* or *While* pattern, or constitution rules when they apply everywhere | |

## Gates in the PI cycle

| Gate | Where it usually happens | Approver (set in constitution.md) |
|---|---|---|
| 1 intent | Epic review in the portfolio Kanban, before the epic is approved for implementation | Epic owner |
| 2 spec | Feature refinement before PI planning | Product manager |
| 3 plan | PI planning, architecture breakout | System architect |
| 4 tasks | Iteration planning | Team, product owner |
| 5 review | Before the system demo counts the feature as done | Product owner, with the review agents' findings |

## Practical notes

- **Prefixes per feature, not per team.** Features move between teams; prefixes should not.
- **The PI objectives** can cite requirement IDs. "Deliver REM-R1..R3" is checkable; "deliver reminders" is not.
- **Inspect & Adapt** is a natural place for `/ainf:retro`: classify each escaped defect by cause and fix the earliest artifact.
- **Run `drift-check --stories --csv`** before the system demo and attach it. It shows, per story, which criteria have tests.
- **Watch for:** specs written only to satisfy a PI planning template. A spec nobody reads at build time is drift waiting to happen.
