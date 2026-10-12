# constitution.md: [project name]

Project principles. Changes rarely, and only with approval. Every plan.md runs a Constitution check against these rules.

## Rules

1. Every behaviour has a test first.
2. No new vendor or dependency without approval.
3. Logs carry ids only, never personal data.
4. The files are the source of truth, not the chat. When a later artifact is wrong, fix the earliest artifact that caused it.
5. A human approves each gate, in proportion to the risk, and before anything irreversible.
6. [Project rule that is an enduring policy, e.g. "Money is stored as integer minor units with an ISO 4217 currency."]
7. [Project rule, e.g. "Every external call has a timeout and an idempotency key."]

## Approvers

| Gate | What is approved | Approver |
|---|---|---|
| 1 | intent.md: outcome, scope, Done means | [product owner] |
| 2 | spec.md: requirements and criteria | [product owner + tech lead] |
| 3 | plan.md: design, boundaries, rollback | [tech lead / architect] |
| 4 | tasks.md: slicing and coverage | [tech lead] |
| 5 | the change: tests, drift-check, review | [reviewer] |

## Changing this file

[Who may approve a change to these rules, e.g. "the tech lead and the product owner, recorded in the commit message".]
