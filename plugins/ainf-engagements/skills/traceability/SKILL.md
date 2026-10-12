---
name: traceability
description: Generate docs/<feature>/traceability.md - a requirement-by-verification matrix joining spec.md requirements to unit tests, SIT cases, UAT scenarios and inspections by ID - and flag every requirement with no verification, every case citing no or unknown IDs, and every test citing no requirement. Use before SIT or UAT exit, at design signoff, for an audit, or when the user asks "is everything tested?" or for a traceability matrix or RTM.
---

# Traceability: one ID from design to verification

Code coverage is not requirement coverage. Every requirement needs a verification that fits it: a unit test, an integration or SIT case, a UAT scenario, or an inspection.

## 1. Generate

From the repository root (it needs `scripts/drift-check.mjs` from `/ainf:init`, ainf 0.3 or later):

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" matrix docs/<feature> --write
```

It reads `spec.md`, every test file (`.ainf.json` test patterns), and the `sit*.md`, `uat*.md` and `inspection*.md` files in the feature folder. A criterion's test counts for its requirement.

## 2. Judge the fit (the part the script cannot do)

For each requirement, check that the verification method fits:
- business rules → unit;
- contracts and cross-system flows → SIT;
- what the business must be able to do → UAT;
- configuration, permissions and reports → inspection.

Shape the mix like a practical test pyramid: mostly unit, some integration and contract, few end-to-end.

Add a short **Fit review** section under the generated table, listing requirements whose only verification is the wrong kind (for example a data-integrity rule verified only by a UAT scenario).

## 3. Close the gaps

- A requirement with no verification gets a proposed test or case. Propose; do not write it without the user's go-ahead.
- A test or case that cites no requirement either gets the ID it proves, or is a sign of a missing requirement, which goes to `/ainf:cr`. **Do not invent requirements.**

Gate: every requirement appears with at least one appropriate verification method. Re-run `--write` after changes; never hand-edit the table.
