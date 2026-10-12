# plan.md: [feature]

Status: DRAFT | APPROVED vX (who, date)
Derived from: spec.md vX

## Summary
[Two or three sentences: the approach, and what it reuses.]

## Technical context
[Existing modules, services and stores this touches; versions; environments.]

## Constitution check
<!-- pass or fail per rule, with reasons. Exceptions need approval. -->
| Rule | Result | Reason |
|---|---|---|
| 1 | [pass/fail] | [reason] |

## Data model
[Entities, keys, time zones, retention. The keys must be able to enforce the spec.]

## Contracts
[Request/response shapes, events, error codes, versioning.]

## Decisions
| Option | For | Against | Verdict |
|---|---|---|---|
| [chosen option] | | | chosen |
| [rejected option] | | | rejected: [why] |

## Risks and non-functional limits
- [latency, volume, availability, security, cost; assumptions to verify]

## Action boundaries
<!-- drift-check reads these three lines. Keep backticked globs. -->
- May edit: `[src/feature/**]`, `[test/**]`
- Ask first: `[migrations/**]`, `[shared contract files]`
- Never: production data, credentials, `git push`

## Release and rollback
<!-- flag, rollout steps, one signal per requirement it protects -->
- Flag: [name, default off]
- Rollout: [steps]
- Rollback: [steps, and what cannot be undone]
- Signals: [R1: metric or alert]

## Traceability
<!-- Every R and AC, and the plan section that satisfies it. An empty row is a gap. -->
| ID | Satisfied by (plan section) |
|---|---|
| R1 | [section] |
| AC1 | [section] |
