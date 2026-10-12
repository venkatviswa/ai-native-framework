# rca-plan.md: [escalation]

Status: DRAFT · Sensitivity: [client confidential | internal | shareable]
<!-- Hypotheses and evidence are numbered for the whole engagement and never renumbered. -->

## Identity and topology (gate)
- [ ] Every environment, instance, account and job involved is a confirmed F- with live evidence ([F- IDs])
- [ ] systems.md lists each integration on the failing path, with confidence

## Related incidents
| ID | Date | Symptom | Concluded then | Source |
|---|---|---|---|---|
| INC-1 | [YYYY-MM-DD] | [what users saw] | [what was decided at the time] | [ticket or report reference] |

## What we were told
<!-- One block per vendor or third-party RCA. A source to test, not a conclusion. -->
### [Report name, version, date]
- **Says:** [its conclusion]
- **Closes:** [which hypotheses it would settle, if true]
- **Disagrees with our evidence:** [where, citing E- IDs]
- **Does not change:** [what remains open whatever it says]

## Hypotheses
| ID | Hypothesis | Confirmed if | Killed if | Status | Evidence |
|---|---|---|---|---|---|
| H-1 | [cause, stated so it can be wrong] | [observation] | [observation] | open | |

## Evidence checklist
| ID | Evidence | Tests | Captured by | Status | Date |
|---|---|---|---|---|---|
| E-1 | [log, query, trace, metric to capture] | [H-1] | [role] | needed | |

## Decision gates
- [If H-1 is confirmed by E-1, stop testing the others and plan the cure (remediation.md)]
