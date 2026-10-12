# cutover.md: [feature]

Status: DRAFT
Derived from: plan.md vX (Release and rollback, Environments, Migration) · Window: [date, start–end, time zone]

## Pre-cutover checks
- [ ] SIT exit met (sit.md), owner [name]
- [ ] UAT signed (uat.md), owner [name]
- [ ] Traceability: no GAP (traceability.md)
- [ ] Backups / export taken, owner [name]
- [ ] Communications sent, owner [name]

## Cutover steps
| # | Step | Owner | Start | Duration | Verify |
|---|---|---|---|---|---|
| 1 | [deploy metadata / run migration] | [name] | [hh:mm] | [min] | [check] |

## Rollback
- Trigger: [observable condition, e.g. error rate > x% for 10 min, reconciliation off by > n records]
- Called by: [name]
- Point of no return: after step [n], because [why]
- Steps: [ordered]

## Go / no-go
| Approver | Role | Decision | Time |
|---|---|---|---|

## Hypercare
[Duration], on-call [rota], success metric [from intent.md], handover to [team] on [date]
