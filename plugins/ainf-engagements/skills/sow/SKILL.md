---
name: sow
description: Derive a draft statement of work (docs/<engagement>/sow.md) from the discovery artifacts - objectives from confirmed intent outcomes, scope from intent boundaries and the POC result, assumptions the POC did not retire, acceptance criteria citing numbered requirements, estimate and phasing from the plan - then check traceability mechanically and dispatch the sow-reviewer. Use when the user asks to scope, price, write or review an SOW, proposal or order form.
---

# SOW: what we commit to, derived from the artifacts

Every scope item and acceptance criterion traces to a requirement, and every assumption is visible. A line the client can read as a promise must be one we can keep.

## 1. Inputs

Read `docs/<engagement>/intent.md`, `poc-spec.md`, `poc-result.md` and, if present, a first-cut `spec.md` and `plan.md`. If there is no POC result, say so: the SOW will carry the untested claim as an assumption.

## 2. Derive, section by section

Write `docs/<engagement>/sow.md` from `template.md` in this skill's directory:

| SOW section | Comes from |
|---|---|
| Objectives | intent.md outcomes the client **confirmed** (fact lines only) |
| Scope and out of scope | intent.md boundaries and the POC result |
| Assumptions and dependencies | intent.md assumptions the POC did not retire |
| Acceptance criteria | requirements in a first-cut spec.md, numbered R1, R2... |
| Estimate and phasing | plan: data model, integrations, environments, risks |

Rules:
- Every Scope and Acceptance item cites its requirement: `(R3)`.
- Anything that depends on an open question is marked **to confirm** and is **not estimated**.
- Never invent a requirement, number or rate. Put a placeholder in its place and list it under open items.

## 3. Check

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" sow docs/<engagement>/sow.md --spec docs/<engagement>/spec.md
```

If there is no first-cut spec yet, use `--spec docs/<engagement>/poc-spec.md`. Fix everything it reports.

## 4. Review

Dispatch the `ainf-engagements:sow-reviewer` subagent on `sow.md`. It reads as the client's procurement lead would. Show its findings next to the check output.

**Stop for the engagement lead's review.** Commercial terms, rates and legal language belong to people and the firm's templates; this skill drafts the traceable core only. Gate:
- Every SOW item traces to a requirement.
- Every assumption is visible.
- Nothing "to confirm" is priced.
