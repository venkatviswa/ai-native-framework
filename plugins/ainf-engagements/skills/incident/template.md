# incident.md: [id] [one-line summary]

Status: OPEN · Severity: [sev-1 | sev-2 | sev-3] · Declared: [time, time zone] by [name] · Accountable owner: [one named person]
<!-- sev-1: production down or data loss; immediate response; rollback or hotfix by a named human. sev-2: degraded but usable; fix within the working day. sev-3: cosmetic or low impact; scheduled through the normal chain. -->
Commander: [name] · Operations lead: [name] · Communications lead: [name] · Agent: read-only helper

## Restore first
[One paragraph: what users cannot do, the restore goal, then root cause, then trust.]

## Observed vs expected
- Observed: [behaviour, with evidence reference E-1]
- Expected: [behaviour, with spec / requirement ID if one exists]
- Reproduction: [steps in sandbox / not yet reproduced]

## Timeline of changes
| Time | Change | Source |
|---|---|---|
| [Fri 18:00] | [release 2.4 deployed] | [release notes] |

## Hypotheses (ranked)
| ID | Hypothesis | Cheapest check that confirms or kills it | Status |
|---|---|---|---|
| H-1 | [...] | [bounded read / sandbox repro] | open |

## Action boundaries
- Agent may: read the material provided, run local analysis, reproduce in [sandbox]
- Needs a named human: any production read beyond [authorized scope], any production change, bulk data pulls, credentials, client-facing actions

## Actions needing human approval
| Action | Changes | Reversible? Undo | Justified by | Approved by, time |
|---|---|---|---|---|

## Evidence log
| ID | Time | Who | What was run / read | What it showed |
|---|---|---|---|---|
| E-1 | | | | |

## Communications
<!-- Drafts only. A person sends them. Facts, timeline, next update time; no speculation. -->

## Aftermath
- [ ] Spec corrected via CR: [CR id]
- [ ] Regression test: [test name citing R#]
- [ ] Runbook updated: [yes / not needed]
- [ ] Constitution rule: [only if an enduring policy]
- [ ] Recurring or still red after restore: escalation opened in [docs/escalation-<slug>/], citing this incident as INC-n
