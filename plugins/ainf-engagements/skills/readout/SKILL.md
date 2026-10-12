---
name: readout
description: Draft a client-facing readout, status update or steering deck from the engagement ledgers - bottom line first, takeaway titles, every claim citing the F-, D-, A-, RISK- or H- ID it comes from, inferred items worded as approximate, dates only from decisions and actions, and a "decisions needed" section - then check it against the ledgers so it cannot drift from the docs. Use when the user asks for a readout, exec summary, status deck, steering update, weekly update or sponsor briefing for an engagement.
---

# Readout: generated from the ledgers, never written beside them

A hand-written deck drifts from the docs within a week: a corrected fact stays wrong on slide 4, and the client quotes slide 4. Generate the readout from the ledgers, cite the IDs, and check it the same way as everything else.

## 1. Read, don't remember

Read status.md, the journal entries since the last readout, facts.md, decisions.md, actions.md, risks.md and the shape-specific files (intent.md, rca.md, remediation.md, exit.md). Use only current entries; a superseded entry is history, not news. If the workspace does not exist, run `/ainf-engagements:workspace` first: a readout with no ledgers behind it has nothing to cite.

Ask who the audience is (sponsor, steering group, technical counterparts) and how long they will spend on it.

## 2. Write `readout-<YYYY-MM-DD>.md`

From `template.md` in this skill's directory, in `docs/<engagement>/`:
- **Bottom line first.** Three sentences: where we are, what changed, what we need from them.
- **Takeaway titles.** Every section title is a sentence that states its conclusion ("Containment has held for 9 days"), not a topic ("Containment").
- **Every claim cites its ID**, in brackets at the end: `(F-12)`, `(D-3)`. A claim you cannot cite is either missing from the ledgers (add it there first) or should not be in the readout.
- **Confidence shows in the wording.** A `confirmed` fact is stated; an `inferred` one is "about", "we estimate", "likely"; a `to confirm` one is "reported, not yet verified". An open hypothesis is never a finding.
- **Dates come from the ledgers.** A date in the readout is an action's due date or a decision's date. Never promise a date nobody has committed to.
- **Decisions needed** lists what the audience must decide, by when, and what happens if they do not.
- **No reassurance.** Say what the evidence shows; let the audience judge.
- Keep internal-only material (rates, internal names, unconfirmed suspicions about the client's people) out. Check the Sensitivity line of every file you draw from.

If the client wants slides, build them from this file afterwards, and keep this file as the source: the slide text should be a subset of it, with the same IDs in the speaker notes.

## 3. Check

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" ledger docs/<engagement>
```

The ledger check reads the readout too: it reports any citation of an ID that is undefined or superseded. Fix the readout, not the ledger, unless the ledger is what is wrong.

Then hand it to the engagement lead for review. **A person sends it; you never do.** After it is sent, add a journal entry saying what was sent, to whom and when.
