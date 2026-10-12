---
name: sit-uat
description: Derive system integration test cases (docs/<feature>/sit.md, SIT-n citing R/AC IDs, from spec.md and plan.md contracts) and user acceptance scenarios (docs/<feature>/uat.md, UAT-n written in business language from acceptance criteria, same requirement IDs), with entry and exit criteria and a defect severity scale. Use when preparing SIT or UAT, writing test scripts for business users, or when the user asks what to test before signoff.
---

# SIT and UAT: same IDs, different audiences

SIT proves the parts work together against the plan's contracts. UAT proves the business can do its job, in its own words. Both cite the same requirement IDs, so `/ainf-engagements:traceability` can join them.

## SIT: docs/<feature>/sit.md

Write it from `sit-template.md` in this skill's directory. Derive the cases from:
- every **contract** in plan.md: integrations, APIs, events, the data migration mapping;
- every acceptance criterion that crosses a component boundary;
- the failure paths: timeouts, retries, duplicates, partial failure, permissions.

Each case is a line `- SIT-n (R#, AC#) [setup] → [action] → [expected]`, with its environment and data.

**Exit criteria:** no open severity 1 or 2 defects, and every case has run once. Cloud-native: SIT is contract tests between services plus one end-to-end run.

## UAT: docs/<feature>/uat.md

Write it from `uat-template.md` in this skill's directory. Each scenario comes from one or more acceptance criteria. Write it as a business user would do it, as role, goal, steps and what they should see, with no system internals. Each is a line `- UAT-n (R#, AC#) ...`. Include the unhappy paths the business cares about. **Exit:** a named business owner signs.

## Rules

- **Do not invent requirements.** If a sensible test has no requirement behind it, list it under "Proposed, no requirement" and ask: it may be a missing requirement, which means `/ainf:cr`.
- Where a requirement is best verified by **inspection** (a configuration, a permission set, a report), add `INS-n (R#)` lines to `docs/<feature>/inspection.md` with what to inspect and who signs.
- Use masked or synthetic data in SIT and UAT, never copies of production personal data, unless the client has approved it in writing.

Then run `/ainf-engagements:traceability`.
