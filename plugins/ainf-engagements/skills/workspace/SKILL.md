---
name: workspace
description: Set up and keep an engagement workspace in docs/<engagement>/ - one ledger per kind of thing (facts F-, decisions D-, actions A-, questions Q-, risks RISK-, gaps GAP-, systems SYS-/INT-), a status.md snapshot and a prepend-only journal.md, so every other document cites IDs instead of restating facts; then lint it with engagement-check ledger. Use at the start of any discovery, escalation or delivery engagement, after every client session ("update the docs from today's call"), or when facts have started to disagree between files.
---

# Workspace: write each fact once, cite it everywhere

Engagement documents drift for one reason: the same fact is copied into many files, one copy is corrected and the others are not. A status deck says one thing, the notes another, and nobody can tell which is current. The fix is to give each kind of thing one home and an ID, and to make every other file cite the ID.

**Client data first.** Workspace files hold confidential client information. Before reading or writing any, confirm with the user that this tool is allowed by the client contract and the firm's policy. Keep everything in the engagement's approved repository. Fill in each file's `Sensitivity:` line.

## 1. Stamp the workspace

If `docs/<engagement>/status.md` is missing, copy the templates without overwriting anything:

```bash
mkdir -p docs/<engagement> && cp -Rn "<this skill's base directory>/../../templates/workspace/." docs/<engagement>/
```

Then fill in README.md's header and status.md's first snapshot. `systems.md` is optional; delete it if the engagement has no integration landscape. `CLAUDE.md` holds the workspace rules; keep it next to the ledgers so every session in this folder loads them.

## 2. The ledgers

| ID | File | One entry is | It must carry |
|---|---|---|---|
| F-n | facts.md | one fact | a label (confirmed, inferred, to confirm), a source, a date |
| D-n | decisions.md | one decision record | status; once accepted, an approver and a reversal condition |
| A-n | actions.md | one commitment | an owner and a date, or `none` with a reason |
| Q-n | questions.md | one question | what it drives and who can answer; once answered, where |
| RISK-n | risks.md | "If … then …" | likelihood, impact, mitigation, owner, when we'll know |
| GAP-n | risks.md | something the baseline needs that is missing | what it blocks, and what closes it |
| SYS-n, INT-n | systems.md | one system or integration | owner, confidence, source |
| H-n, E-n | the file that tests them | a hypothesis, a piece of evidence | a status; what was run and what it showed |

Rules that keep the ledgers honest:
- **IDs are permanent and unique across the folder.** Never reuse a number, even after deleting a draft; the POC's E-3 and the RCA's E-3 cannot both exist. The next ID is one more than the highest ever used.
- **Correct by superseding.** Set the old entry's status to `superseded by F-12` and add the new entry. Do not strike through or rewrite history; the journal says why it changed.
- **Cite, don't restate.** A status line says "Region confirmed (F-3)", not the region again. If a file needs a fact that is not in facts.md, add it there first.
- **A risk that happens becomes a gap.** Close the RISK-, open a GAP- that cites it.
- **Inferred stays inferred** until a source confirms it. Readouts word inferred items as approximate.
- **IDs live in the repository.** An ID that exists only in a spreadsheet or a slide is a dangling citation.

## 3. After every session

1. Write `notes/<YYYY-MM-DD>-<slug>.md` from `notes/_session-template.md`. Key every answer to a Q- ID; list what was not covered under **Not covered (carry forward)**. Mark unverified claims `?` and conflicts `⚠ see F-n`.
2. Move what you learned into the ledgers: new facts, decisions, actions (mirror every commitment), answered questions with **Answered in**, risks and gaps.
3. Overwrite status.md (posture, workstreams, blocked on, next actions, decisions needed) and set **Last updated**. Status is a snapshot; do not keep a "recently done" list there. That is the journal's job.
4. Prepend a journal.md entry: Prompt, Did, Learned, Changed, Scope guard, Decisions spawned, Next.
5. Draft any recap or follow-up from the ledgers. **A person sends it; you never do.**

## 4. Check

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" ledger docs/<engagement>
```

It reports:
- IDs cited but defined in no ledger in the folder, and IDs defined twice;
- citations of superseded entries outside the journal and the correction line itself, including in readouts;
- superseded entries that do not name an existing successor;
- actions with no owner or a due date like ASAP or soon;
- accepted decisions with no approver or reversal condition;
- facts with no label or source, answered questions with no Answered in, risks with no owner, hypotheses with an unknown status;
- a status.md older than the newest journal entry.

Fix every line. Judgement stays with people: the check proves the ledgers are consistent, not that they are right.

Next, depending on the engagement shape: `/ainf-engagements:discovery`, `/ainf-engagements:escalation`, `/ainf-engagements:phased`, and `/ainf-engagements:readout` for anything the client will read.
