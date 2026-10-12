# sit.md: [feature]

Derived from: spec.md vX, plan.md vX · Environment: [SIT org / namespace] · Data: [masked set]

## Entry criteria
- Sprint [n] closed; drift-check passes; deployed to SIT by [pipeline]

## Cases
- SIT-1 (R2, AC4) [setup] → [action across components] → [expected, observable]
- SIT-2 (R2, AC4b) [failure path: timeout / duplicate / retry] → [expected]

## Proposed, no requirement
- [case idea]: missing requirement? ask [owner]

## Exit criteria
- No open severity 1 or 2 defects. Every case run at least once.

## Severity
1 blocks the business, no workaround · 2 major, workaround exists · 3 minor · 4 cosmetic
