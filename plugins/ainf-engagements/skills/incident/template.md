# incident.md: [id] [one-line summary]

Status: OPEN · Severity: [1-4] · Declared: [time, time zone] by [name]
Commander: [name] · Operations lead: [name] · Communications lead: [name] · Agent: read-only helper

## Restore first
[One paragraph: what users cannot do, the restore goal, then root cause, then trust.]

## Observed vs expected
- Observed: [behaviour, with evidence reference E1]
- Expected: [behaviour, with spec / requirement ID if one exists]
- Reproduction: [steps in sandbox / not yet reproduced]

## Timeline of changes
| Time | Change | Source |
|---|---|---|
| [Fri 18:00] | [release 2.4 deployed] | [release notes] |

## Hypotheses (ranked)
| # | Hypothesis | Cheapest check that confirms or kills it | Status |
|---|---|---|---|
| H1 | [...] | [bounded read / sandbox repro] | open |

## Action boundaries
- Agent may: read the material provided, run local analysis, reproduce in [sandbox]
- Needs a named human: any production read beyond [authorized scope], any production change, bulk data pulls, credentials, client-facing actions

## Actions needing human approval
| Action | Changes | Reversible? Undo | Justified by | Approved by, time |
|---|---|---|---|---|

## Evidence log
| # | Time | Who | What was run / read | What it showed |
|---|---|---|---|---|
| E1 | | | | |

## Communications
<!-- Drafts only. A person sends them. Facts, timeline, next update time; no speculation. -->

## Aftermath
- [ ] Spec corrected via CR: [CR id]
- [ ] Regression test: [test name citing R#]
- [ ] Runbook updated: [yes / not needed]
- [ ] Constitution rule: [only if an enduring policy]
