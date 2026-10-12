---
name: phased
description: Set up a phased delivery (design weeks, build sprints, SIT, UAT, go-live) on the artifact chain - write docs/<feature>/delivery.md mapping each phase to its artifacts and gate, the environment path, platform limits as plan constraints, and the signed design baseline with dated file versions; after signoff, route every spec change through change control. Use for a signed-off client implementation, a fixed-scope programme, or when the user mentions design signoff, sprints plus SIT/UAT, or a baseline.
---

# Phased delivery: the chain maps onto the phases

The chain does not disappear in a phased plan. Design produces the baseline, sprints build against it, SIT and UAT verify it with the same IDs, and go-live is decided by named people.

## 1. Design phase: the baseline

Use the core skills to produce the design artifacts: `/ainf:intent`, `/ainf:spec`, `/ainf:plan`, each through its gate (`/ainf:gate 1-3`).

**Spend the AI's speed on the clarify pass here.** In a phased plan a missed requirement is usually found in UAT, the most expensive point on the curve.

Before signoff, check that `plan.md` covers the delivery realities as constraints and risks, before any sprint starts:
- the **environment path** (for example dev → SIT → UAT → production) and what is promoted how;
- **data migration**: source, mapping owner, mock loads, reconciliation;
- **platform limits**: Salesforce governor limits; cloud-native service quotas and SLOs;
- **integrations**: contracts, owners, test doubles for SIT.

See `<this skill's base directory>/../../references/platforms.md` for the Salesforce and cloud-native specifics.

## 2. delivery.md

Write `docs/<feature>/delivery.md` from `template.md` in this skill's directory:
- the phase map, giving the artifacts and the gate for each phase;
- the sprint plan, with which requirement IDs each sprint targets;
- the environments;
- the signoff record.

## 3. Signoff is a contractual baseline

Your gate checklists feed the design signoff, but **the client signs**. Record the baseline in delivery.md:
- each file and its `Status` version;
- the git commit or tag;
- who signed and the date.

Suggest tagging the commit `baseline-v1.0`. Never record a signature the user has not told you about.

## 4. After signoff

- `spec.md` changes **only** through `/ainf:cr`, and each change bumps the spec version and is logged in delivery.md.
- Each sprint: `/ainf-engagements:sprint` to cut it and to close it with a drift diff.
- Verification: `/ainf-engagements:sit-uat`, then `/ainf-engagements:traceability`.
- Go-live: `/ainf-engagements:golive`.

Change-control gate, checked at every sprint close and before SIT and UAT:
- Every requirement appears in the traceability matrix with at least one appropriate verification method.
- Any change since signoff has a change request and an updated spec.md version.
- The sprint's built behaviour matches spec.md and plan.md, or one of them was updated first.
