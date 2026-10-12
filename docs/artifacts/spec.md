# spec.md

**Template:** [`templates/docs/spec.md`](../../plugins/ainf/templates/docs/spec.md) · written by `/ainf:spec` from an approved intent · approved at **Gate 2** · parsed by drift-check

## What it is for

What the system must do, precisely enough that a test can prove it and an agent cannot reinterpret it. It defines the `R#` and `AC#` IDs that every later artifact cites. See [Concepts: IDs](../concepts.md#ids-one-thread-from-intent-to-commit).

## Who owns it, when it changes

The product owner and tech lead approve it. Once it is approved, it changes only through `/ainf:cr`: targeted edits, with the impact listed by `drift-check --impact`.

## Sections

| Section | Fill with |
|---|---|
| ID prefix | Optional. A short code unique in the repo (`ID prefix: REM`), so this feature's IDs read `REM-R1`, `REM-AC1` in tests and commits. Set it as soon as the repo has a second feature. See [namespaced IDs](../concepts.md#namespaced-ids-two-features-one-repo). |
| Definitions | Every term whose meaning changes behaviour: time and time zones, identity, units, what counts as one "occurrence". |
| Requirements | `R1 ...` at the start of the line, one behaviour each, in an [EARS](../../plugins/ainf/skills/spec/references/ears.md) pattern: *When / While / If ... then / Where*. |
| Acceptance criteria | `AC1 (R1) Given ... When ... Then ...`. At least one per requirement, **including failure cases**: rejection, timeout, retry, duplicates, concurrency, restart. |
| Decisions recorded at the gate | What the clarify pass resolved, with who and when. |
| Open questions | BLOCKING or owner and date. |

No technology choices. Those belong in plan.md.

## The attack pass

The first draft always looks finished. `/ainf:spec` then runs the `skeptical-tester` agent, which lists every vague word, undefined term, requirement without a criterion and missing case as a question for you. Answers become targeted edits.

## Weak vs strong

| Weak | Strong |
|---|---|
| "The system should send reminders on time." | "R1 When an open task is due within 24 h, the system shall email each owner one reminder." |
| "AC1 Reminders work." | "AC1 (R1) Given a task with two owners When the job runs twice Then each owner has exactly one email" |
| (no failure case) | "AC4 (R3) Given the provider times out When the job retries Then the provider is queried by reference first and no second email is sent" |

## Line formats drift-check reads

`R\d+` at the start of a line (optionally after `- ` or `**`) is a requirement. `AC\d+[a-z]? (R#, ...)` at the start of a line is a criterion and its mapping. Either may carry the spec's own prefix (`REM-R1`); a short `R1` in this feature's docs means the same. `ID prefix: XXX` on a line of its own sets the prefix: 2 to 8 capitals or digits, starting with a capital. Keep these shapes if you edit the template.
