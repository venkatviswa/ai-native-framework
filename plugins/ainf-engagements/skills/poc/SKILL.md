---
name: poc
description: Design a proof of concept that can fail - write poc-spec.md (ONE falsifiable claim, numbered requirements, pass and fail criteria agreed in advance) and poc-plan.md (timebox, sandbox setup, sample data, what we will NOT build, the riskiest assumption it tests), then record the result in poc-result.md. Use after discovery, when the user wants to de-risk an estimate, prove feasibility, or "do a quick POC".
---

# POC: one claim, agreed failure, a timebox

A POC that cannot fail is a demo. Agree what failure means before anyone builds, so the result changes what goes in the SOW.

## 1. Pick the claim

Read `docs/<engagement>/intent.md`. Take the riskiest assumption from **What we must learn** (or the most expensive open question) and state it as **one** claim that a measurement can prove or disprove:
- Salesforce: "Email-to-Case with assignment rules routes 95% of 200 sample emails to the right queue with no Apex."
- Cloud-native: "Consumer lag stays under 5 seconds at 2,000 orders a second on the proposed topics."

If the user offers several claims, ask which one changes the SOW the most and park the rest as open questions.

## 2. poc-spec.md

Write `docs/<engagement>/poc-spec.md` from `spec-template.md` in this skill's directory:
- the claim, and the intent.md line it tests;
- numbered requirements `R1, R2...` in EARS form, with criteria `AC1 (R1)`;
- **Pass** and **Fail** criteria, with numbers and how each is measured. Add an **Inconclusive** case that says what happens next.

## 3. poc-plan.md

Write `docs/<engagement>/poc-plan.md` from `plan-template.md` in this skill's directory. It covers:
- the timebox, 5 days by default;
- the sandbox or environment;
- the sample data needed, synthetic or masked (never production personal data);
- the measurement method;
- **what we will NOT build**;
- who reviews the result.

The POC's action boundaries are a sandbox only, with no production credentials.

**Stop here for review by the client sponsor and the engagement lead.** The gate:
- The claim can fail.
- Failure was agreed in advance.
- The timebox is real.

## 4. Result

After the POC, write `docs/<engagement>/poc-result.md` from `result-template.md` in this skill's directory:
- the verdict (**Held**, **Failed** or **Inconclusive**), set against the pre-agreed criteria, with the evidence;
- which intent.md assumptions it retired and which it did not;
- what changes in the SOW.

Update the labels in intent.md: a retired assumption becomes a `fact · POC result`.

Next: `/ainf-engagements:sow`.
