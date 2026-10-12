# tasks.md

**Template:** [`templates/docs/tasks.md`](../../plugins/ainf/templates/docs/tasks.md) · written by `/ainf:tasks` from an approved plan · approved at **Gate 4** · parsed by drift-check · in phased delivery, one `tasks-sprint-N.md` per sprint

## What it is for

Steps small enough that an agent can finish one, a reviewer can check it in one sitting, and it lands as one commit. Each task names the requirement it serves and the criterion its test proves, so a commit can be traced back to a promise.

## Who owns it, when it changes

The tech lead approves the slicing. Boxes are ticked in the same commit as the work. `/ainf:drift-review` appends remediation tasks under `## Convergence`. A CR adds tasks with suffixes (`T6b`) rather than renumbering.

## Line format

```
- [ ] T3 Snooze table and scheduler skip (R2, AC3, AC3b) (approval)
- [ ] T4 Reminder email copy (R1, AC2) P
```

- `T#`, never reused.
- At least one `R#`. drift-check fails a task with none, and fails a requirement no task cites.
- `(approval)` when it touches anything under plan.md's *Ask first*.
- `P` when it can run in parallel with its neighbours.

## Ordering and size

Put the riskiest shared contract first: the schema, the state machine, the sender interface. A task is too big if its commit touches more than one concern, or if you cannot name the single test that proves it is done.

## Weak vs strong

| Weak | Strong |
|---|---|
| "- [ ] Build reminders" | "- [ ] T2 Reminder rows per owner, unique per occurrence (R1, AC1)" |
| "- [ ] Tidy up" (no requirement) | Drop it, or cite the requirement it serves. |
| "- [ ] Write tests" as the last task | The failing test is part of every task. |
