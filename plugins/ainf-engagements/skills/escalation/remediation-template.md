# remediation.md: [escalation]

Status: DRAFT · Sensitivity: [client confidential | internal | shareable]

## Containment (stops the harm now)
| Option | Addresses | Reversible? Undo | Capability | Decision |
|---|---|---|---|---|
| [workaround] | [F- IDs] | [yes: how] | [supported / preview / custom / internal] | [D- ID] |

## Cure (removes the cause), least to most disruptive
| Option | Addresses | Disruption | Reversible? Undo | Capability | Decision |
|---|---|---|---|---|---|
| [configuration change] | [F- IDs] | [low] | [yes: how] | [supported] | [D- ID] |
| [redesign] | [F- IDs] | [high] | [partly] | [custom] | |

## Preconditions for any destructive or production change
- [ ] Backup or export taken, and its restore tested
- [ ] Rollback written down and rehearsed outside production
- [ ] Tested outside production, with the evidence cited (E- ID)
- [ ] Approved by [named human], time logged in journal.md

## Runbook: when the symptom appears again
1. **Triage:** [what to look at first, and the threshold that means it is this problem]
2. **Capture:** [the evidence to save before anything changes]
3. **Escalate to:** [role and channel]. Do not change production from this runbook.
