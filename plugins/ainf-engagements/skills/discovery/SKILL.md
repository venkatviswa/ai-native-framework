---
name: discovery
description: New-client discovery - on top of the engagement workspace, turn client sessions and documents into dated notes keyed to question IDs, a canonical facts.md, and a HYPOTHESIS intent.md where every line carries a label (fact, inference, recommendation, open question) and a source, with a hypothesis table, risks, gaps and entry criteria; then check labels and ledgers mechanically. Use for pre-sales or pre-SOW work, when the user has call notes, a client brief, a process document or a sponsor "who wants a number".
---

# Discovery: intent.md is a hypothesis you expect to be wrong in places

A discovery document fails quietly when a guess reads like a finding, or when a corrected fact survives in five other files. Label every line, and write each fact once, so whoever writes the SOW knows which lines they can sign.

**Client data first.** Discovery material holds confidential client information. Before reading any, confirm with the user that this tool is allowed by the client contract and the firm's policy, and that the notes are redacted (names, personal data). Keep everything in the engagement's approved repository.

## 0. Workspace

If `docs/<engagement>/status.md` is missing, run `/ainf-engagements:workspace` first. Discovery uses its ledgers: facts.md, questions.md, actions.md, decisions.md, risks.md, stakeholders.md, and systems.md when there is an integration landscape.

Seed questions.md before the first session: the questions you need answered, each with what it **drives** (a scope line, an estimate, a risk) and the role who can answer. A questionnaire with no status column becomes a list nobody can track.

## 1. Notes: what was said, per session

For each session, write `notes/<YYYY-MM-DD>-<slug>.md` from the workspace's `notes/_session-template.md`. For each document, write `notes/<YYYY-MM-DD>-doc-<slug>.md` from `document-template.md` in this skill's directory. Record; do not interpret.
- Key every answer to the Q- it answers. Put agenda items not reached under **Not covered (carry forward)**, so they lead the next agenda.
- Mark claims nobody has verified `?`, and claims that contradict another source `⚠ see F-n`.
- If notes already exist in another shape, read them and carry on in this one; do not rewrite history.

Then move what you learned into the ledgers (the workspace skill's after-session loop): facts with a label and source, answered questions with **Answered in**, every commitment as an A-, decisions as proposed D- records.

## 2. Hypothesis intent: what we believe

Write `docs/<engagement>/intent.md` from `intent-template.md` in this skill's directory. Rules:
- Every bullet ends with a label and a source:
  - `[fact · F-3]` or `[fact · Support head, session 1]` means someone said it or a document shows it. Prefer the F- ID; weak sources stay facts, with the weakness written in facts.md.
  - `[inference · basis]` means we concluded it from facts: an estimate, a pattern, reading between the lines.
  - `[recommendation · ours]` means we propose it. It can be wrong without anyone having lied.
  - `[open question · Q-4]` means it is unresolved; the Q- names who can resolve it.
- Every constraint also says **Known**, **Assumed** or **Unknown**.
- **Hypotheses** are a table: what we believe, what would confirm it, what would kill it, a status (open, testing, confirmed, killed, parked) and dated evidence. Never delete a killed hypothesis; it is what stops the next person proposing it again.
- Replace "Done means" with **What we must learn** before we can commit.
- **Keep risks, gaps and decisions apart.** A risk might happen (RISK- in risks.md, written "If … then …" with **When we'll know**). A gap is already true against the baseline (GAP-). A decision is a choice someone approved (D-). One finding can create all three; each is written once and cited.
- **Entry criteria** list what must be true before the SOW can be signed, each tied to the RISK- or Q- it closes. They become the SOW's assumptions and dependencies.
- **Never invent a fact.** A statement with no source is an inference or an open question, and says so.
- Expect **Open questions** to be the longest section; it is the most valuable one.
- Status starts as `DRAFT (hypothesis)`.

When the landscape matters, fill systems.md: each system and integration with an owner, a confidence label and a source. An inventory without confidence labels is read as confirmed.

## 3. Check, then review

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" labels docs/<engagement>/intent.md
node "<this skill's base directory>/../../scripts/engagement-check.mjs" ledger docs/<engagement>
```

Fix every line they report. Then present the gate to the user. It is reviewed by the **client sponsor and the engagement lead**, not by a product owner:
- Every goal has a source the client can recognise, and every line carries its label.
- The riskiest hypothesis is named, as the candidate for a POC.
- Every BLOCKING question has an owner and a date.
- Nothing reads like a commitment.

For a status update or a sponsor readout, use `/ainf-engagements:readout`: it is generated from the ledgers, so it cannot drift from them.

Next: `/ainf-engagements:poc` to test the riskiest hypothesis, then `/ainf-engagements:sow`.
