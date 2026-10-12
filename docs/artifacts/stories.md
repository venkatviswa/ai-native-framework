# stories.md

**Template:** [`templates/docs/stories.md`](../../plugins/ainf/templates/docs/stories.md) · written by `/ainf:stories` from an approved spec · optional · checked by `drift-check --stories`

## What it is for

The join between your tracker and the spec. The tracker keeps each story's key, status, estimate and sprint. stories.md says which requirement and criterion IDs each story delivers, so nobody copies the spec into tickets and the repo can say what a story's evidence is: tests, tasks and commits.

## Who owns it, when it changes

The product owner or tech lead, whoever slices the backlog. It changes when stories are split, merged or added. When a CR changes a requirement, `--impact` lists the stories that cite it.

## Line format

```
- PAY-123 Reminder per owner (R1, AC1)
- PAY-124 Snooze (R2)
| AB#4521 | Retry without a second email | REM-R3, REM-AC4 |
```

- The key first, exactly as the tracker shows it. `storyPattern` in `.ainf.json` sets what counts as a key; the default matches Jira, Azure Boards and GitHub issues.
- Then a title, then the IDs. A bare requirement means all its criteria; list ACs when the story delivers part of a requirement.
- Every requirement in spec.md belongs to at least one story. A key appears once.
- With an ID prefix, short IDs are fine here.

## Reading the report

`node scripts/drift-check.mjs --stories` gives, per story: requirements, criteria tested out of criteria in scope, tasks, and commits whose subject contains the key. `--csv` gives the same for a spreadsheet.

It is evidence, not status. A story with commits but untested criteria is not done, whatever the board says. A story with tests for every criterion still needs Gate 5 to confirm the tests prove them.

## Weak vs strong

| Weak | Strong |
|---|---|
| "- PAY-123 Reminders (see spec)" | "- PAY-123 Reminder per owner (R1, AC1)" |
| A story per layer: "PAY-1 database", "PAY-2 API" | A story per behaviour a user can see, citing its R and AC |
| A requirement no story covers | Every R in some story, or moved out of scope in spec.md with approval |
