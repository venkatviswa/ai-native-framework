# delivery.md: [feature / programme]

Status: DRAFT

## Phases
| Phase | Artifacts | Gate | Approver |
|---|---|---|---|
| Design · [3 weeks] | constitution, intent.md, spec.md (numbered), plan.md (data model, integrations, environments, migration, risks) | Formal design signoff | [client role] + [architect] |
| Build · sprints 1–[6] | tasks-sprint-N.md, code, unit tests first from acceptance criteria | Sprint review against the spec, per task | [product owner] |
| SIT | sit.md: integration cases from spec and plan contracts | Exit: no open severity 1 or 2 | [test lead] |
| UAT | uat.md: business scenarios from acceptance criteria, same IDs | Business signoff | [business owner] |
| Go-live | cutover.md: cutover, rollback, runbook | Go / no-go with named approvers | [named people] |

## Sprint plan
| Sprint | Targets | Notes |
|---|---|---|
| 1 | R1, R2 (AC1–AC4) | shared contracts first |

## Environments
| Environment | Purpose | Promoted by | Data |
|---|---|---|---|
| dev | build | [pipeline] | synthetic |
| SIT | integration | [pipeline + approval] | masked |
| UAT | business test | [pipeline + approval] | masked |
| production | live | [named person] | live |

## Baseline (design signoff)
| File | Version | Commit / tag |
|---|---|---|
| spec.md | v1.0 | [baseline-v1.0] |
| plan.md | v1.0 | [baseline-v1.0] |

Signed by: [name, role, date], recorded by [name]

## Changes since baseline
| CR | Requirement IDs | spec.md version | Approved by |
|---|---|---|---|
