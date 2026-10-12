# CR-<n>: [one-line change]

Feature: docs/<feature>
Status: PROPOSED | APPROVED (who, date) | DONE (date)
Changes: R# (and AC# added or changed)

## Request
[What changes, in the requester's words.]

## Evidence
[Why: measurement, audit log, interviews, incident. Source for each line.]

## Impact
<!-- paste: node scripts/drift-check.mjs --impact R# --feature docs/<feature> -->
<!-- then: plan sections and external contracts the IDs do not show -->

## Edits
- spec.md: 
- intent.md: (only if outcome, scope or Done means changed)
- plan.md: 
- tasks.md: 

## Verification
- [ ] Only impacted items changed
- [ ] New criteria have tests that fail on the old behaviour
- [ ] drift-check passes
- [ ] No files outside action boundaries

## Re-measure
[Date and metric from intent.md, if this change targets the outcome.]
