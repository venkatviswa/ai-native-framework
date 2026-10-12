# Shape Up

Shape Up works in fixed cycles (typically six weeks) with a cool-down between them. Senior people shape a pitch with an appetite, a betting table chooses which pitches to build, and a small team owns the whole cycle with no backlog and no tickets handed down.

## Artifact mapping

| Shape Up item | Framework artifact | Notes |
|---|---|---|
| Pitch (problem, appetite, solution sketch, rabbit holes, no-gos) | `intent.md` | Problem → **Outcome**; appetite → a **Constraint**; no-gos → **Out of scope**; rabbit holes → **Open questions** with an owner. |
| The shaped solution's elements | Seeds for `spec.md` | A pitch is deliberately rough. The team writes R and AC lines in week one, at the level of detail the pitch left open. |
| Scopes (named, integrated slices of the work) | Groups of tasks in `tasks.md`, or one `tasks-<scope>.md` per scope | drift-check reads `tasks-*.md` files, so a file per scope works without changes. |
| Hill chart | Task progress plus `--complete` | Uphill is open questions and unproven criteria; downhill is tasks with tests. A scope is over the hill when its spec lines have no open questions. |
| Scope hammering | A CR that moves requirements out of scope | Record it as `CR-n`, so the cut is visible and traceable rather than silent. |

## Gates in the cycle

| Gate | Where it usually happens | Approver |
|---|---|---|
| 1 intent | Betting table | Whoever bets on the pitch |
| 2 spec | End of the first week, once the team has mapped scopes | The team's senior designer or engineer, with the shaper |
| 3 plan | Same review, for the riskiest scope | Technical lead |
| 4 tasks | Per scope, as the team discovers it | The team |
| 5 review | Before ship, and before the circuit breaker | The person who shaped the pitch |

## Practical notes

- **Do not front-load the spec.** Shape Up leaves detail to the team on purpose. Writing a full spec before the bet defeats the method. Gate 2 belongs inside the cycle.
- **The circuit breaker** is a kind of rollback decision: if the cycle ends unfinished, the work stops by default. The plan's **Release and rollback** section should say what "stop" means for anything already merged.
- **No tickets** means `stories.md` is usually unnecessary. Scopes and tasks carry the IDs.
- **Cool-down** is the right time for `/ainf:drift-review` and `/ainf:retro`.
