# intent.md: [escalation] mission

Status: DRAFT · Sensitivity: [client confidential | internal | shareable]
Escalation lead: [role] · Technical lead: [role] · Sponsor: [client role]

## Mission
[One sentence the sponsor would agree with.]

## Situation
[What is happening and since when, citing F- IDs. No causes yet.]

## Goals
<!-- Numbered. Everything later traces to one of them. -->
1. [Stop the recurring harm to the affected users or workload]
2. [Find and remove the cause]
3. [Leave the client able to see it coming and handle it without us]

## Done, in three tiers
| Tier | Means | Measured by | Agreed with |
|---|---|---|---|
| Containment shipped | [the harm has stopped, even if by a workaround] | [signal in exit.md] | [client role] |
| Cure held | [the cause is removed, and the workload has run clean for N cycles] | [scorecard metric] | [client role] |
| Exit | [scorecard targets met and handover signed] | [exit.md scorecard] | [sponsor] |

## Principles
- Verify identities and topology before analysing.
- Containment and cure are separate decisions.
- Nothing changes production without preconditions and a named approver.
- [Engagement-specific principle]

## Non-goals
- [What this escalation will not fix, even if found]

## Audience
| Who | Reads | How often |
|---|---|---|
| [sponsor] | [readout] | [weekly] |
| [technical counterparts] | [rca-plan.md, remediation.md] | [daily] |
