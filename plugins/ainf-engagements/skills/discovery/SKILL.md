---
name: discovery
description: New-client discovery - turn raw call notes and client documents into docs/<engagement>/discovery-notes.md and a HYPOTHESIS intent.md where every line carries a label (fact, inference, recommendation, open question) and a source, then check the labels mechanically. Use for pre-sales or pre-SOW work, when the user has call notes, a client brief, a process document or a sponsor "who wants a number".
---

# Discovery: intent.md is a hypothesis you expect to be wrong in places

A discovery document fails quietly when a guess reads like a finding. Label every line, so whoever writes the SOW knows which lines they can sign.

**Client data first.** Discovery notes hold confidential client information. Before reading any, confirm with the user that this tool is allowed by the client contract and the firm's policy, and that the notes are redacted (names, personal data). Keep everything in the engagement's approved repository.

## 1. Notes: what was said

Write `docs/<engagement>/discovery-notes.md` from `notes-template.md` in this skill's directory: one section per call or document, with who, what, direct quotes and documents received. Record; do not interpret. If the notes already exist, read them and skip this step.

## 2. Hypothesis intent: what we believe

Write `docs/<engagement>/intent.md` from `intent-template.md` in this skill's directory. Rules:
- Every bullet ends with a label and a source:
  - `[fact · Support head, call 1]` means someone said it or a document shows it. Weak sources stay facts, with the weakness written down.
  - `[inference · basis]` means we concluded it from facts: an estimate, a pattern, reading between the lines.
  - `[recommendation · ours]` means we propose it. It can be wrong without anyone having lied.
  - `[open question · who can resolve it]` means it is unresolved, and the line names who can resolve it.
- Every constraint also says **Known**, **Assumed** or **Unknown**.
- Replace "Done means" with **What we must learn** before we can commit.
- **Never invent a fact.** A statement with no source in the notes is an inference or an open question, and says so.
- Expect **Open questions** to be the longest section; it is the most valuable one.
- Status starts as `DRAFT (hypothesis)`.

## 3. Check, then review

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" labels docs/<engagement>/intent.md
```

Fix every line it reports. Then present the gate to the user. It is reviewed by the **client sponsor and the engagement lead**, not by a product owner:
- Every goal has a source the client can recognise, and every line carries its label.
- The riskiest assumption is named, as the candidate for a POC.
- Nothing reads like a commitment.

Next: `/ainf-engagements:poc` to test the riskiest assumption, then `/ainf-engagements:sow`.
