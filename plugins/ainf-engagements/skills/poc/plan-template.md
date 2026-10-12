# poc-plan.md: [engagement]

Status: DRAFT
Riskiest assumption tested: [quote from intent.md]

## Timebox
[5 days], [start] to [end]. The verdict is written on the last day whatever the state.

## Environment
- [Sandbox / dev org / namespace / Terraform workspace], owned by [role]
- No production credentials. No production data.

## Sample data
- [What, how many, synthetic or masked, who provides it]

## Measurement
- [How each pass / fail number is collected, and by whom]

## Tests
| Test | Proves | Pass looks like | Evidence goes to |
|---|---|---|---|
| [what is run] | [AC1 (R1)] | [the observable result, with the number] | [E- ID in poc-result.md] |

## Stop and ask
<!-- The builder (person or agent) stops and asks before any of these. -->
- [Anything that needs real client data, a production credential or a licence we do not have]
- [A result that contradicts facts.md: facts.md wins until a person supersedes the entry]
- [Scope creeping beyond the claim]

## What we will NOT build
- [Production-quality error handling, UI polish, integrations beyond the claim, ...]

## Action boundaries
- May edit: `poc/**`
- Never: production orgs, clusters or databases

## Review
Result reviewed by [client sponsor] and [engagement lead] on [date].
