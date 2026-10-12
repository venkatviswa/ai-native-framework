# intent.md

**Template:** [`templates/docs/intent.md`](../../plugins/ainf/templates/docs/intent.md) · written by `/ainf:intent` into `docs/<feature>/intent.md` · approved at **Gate 1**

## What it is for

Why the feature exists, for whom, and how you will know it worked. It holds outcomes and boundaries, never design. A plan that creeps into the intent locks in decisions nobody weighed.

## Who owns it, when it changes

The product owner approves it. After approval it changes only when the outcome, scope or *Done means* changes, usually through a change request. Most requirement changes do not touch it.

## Sections

| Section | Fill with |
|---|---|
| Status | `DRAFT`, then `APPROVED v1 (who, date)`. Only a named person sets it. |
| Outcome | A measurable change for named people, with a baseline: "late-task rate 40% -> 30% within 60 days". |
| Who | Users and stakeholders, including who approves. |
| Constraints | Budget, dates, policy, and technology already decided. Decided technology is a constraint, not a design choice. |
| Out of scope | What it will not do. Written, so nobody assumes otherwise. |
| Done means | Observable conditions, including how and when the outcome is measured, with the same metric definition as the baseline. |
| Open questions | `BLOCKING:` if it affects scope, safety, architecture or acceptance; otherwise an owner and a date. A BLOCKING question stops Gate 2. |

## Weak vs strong

| Weak | Strong |
|---|---|
| "Improve reminders." | "Owners miss fewer due dates: late-task rate 40% -> 30% within 60 days." |
| "Use a cron job and SendGrid." (design) | "Must use the existing email provider." (constraint) |
| "Done when it ships." | "Done when the late-task rate, measured the same way as the baseline, reaches 30% at day 60." |

## Discovery variant

In a consulting engagement before the SOW, `/ainf-engagements:discovery` writes a hypothesis intent where every line carries a label and a source: `[fact · source]`, `[inference · basis]`, `[recommendation · ours]`, `[open question · who]`. *Done means* becomes *What we must learn*.
