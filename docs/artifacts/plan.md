# plan.md

**Template:** [`templates/docs/plan.md`](../../plugins/ainf/templates/docs/plan.md) · written by `/ainf:plan` from an approved spec · reviewed by the `plan-reviewer` agent · approved at **Gate 3** · Action boundaries parsed by drift-check

## What it is for

How it will be built, and what the agent must not decide alone. It is where the expensive, hard-to-reverse choices get made on purpose: data model, contracts, rollout.

## Who owns it, when it changes

The tech lead or architect approves it. It changes when the spec changes (via a CR), or when building proves an assumption wrong. In that case, stop, update the plan, and re-approve it. Do not quietly diverge.

## Sections

| Section | Fill with |
|---|---|
| Summary, Technical context | The approach, and what existing code it reuses. Explore the code first. |
| Constitution check | Pass or fail per rule, with a reason. A fail needs an approved exception. |
| Data model | Entities, keys, time zones, retention. The keys must be able to *enforce* the spec, e.g. recipient and occurrence in a unique key. The costliest section to get wrong. |
| Contracts | Shapes, events, error codes, versioning. Other people and agents code against these. |
| Decisions | The chosen option **and the rejected ones**, with for and against, so the next session does not re-argue them. |
| Risks and non-functional limits | Latency, volume, availability, security, cost, and assumptions to verify. |
| Action boundaries | `May edit:`, `Ask first:` and `Never:` with backticked globs. drift-check fails a staged file outside them. |
| Release and rollback | Flag, steps, what cannot be undone, and one signal per requirement it protects. |
| Traceability | Every R and AC and the section that satisfies it. An empty row is a gap. |

## Weak vs strong

| Weak | Strong |
|---|---|
| "Retry on failure." | "On TIMEOUT, look up the send by idempotency key before retrying (R3, AC4)." |
| "Store reminders in a table." | "reminders(task_id, owner_id, occurrence_utc) UNIQUE: enforces one reminder per owner per occurrence (AC1)." |
| "Use the UTC offset." | "Store the IANA zone; compute the offset at send time (spec Definitions: Due)." |
| Decisions table with one row | Chosen option plus at least one rejected option with the reason. |

## Action boundaries example

```
- May edit: `src/reminders/**`, `test/reminders/**`
- Ask first: `migrations/**`, `src/shared/mailer.ts`
- Never: production data, credentials, `git push`
```
