# Engagements: the workspace, its ledgers and the ledger check

The core chain (intent → spec → plan → tasks → code) keeps a feature honest with requirement IDs. Consulting engagements have a second problem the chain does not cover: the *working knowledge* around the build. That means what the client told us, what we decided, who owes what, which theories are still alive. It lives in call notes, status decks, questionnaires and decision logs, and it drifts in the same way code drifts from a spec.

This page explains the workspace that `ainf-engagements` (0.6+) puts under every engagement, and why it is shaped the way it is.

## Why engagement documents drift

The same failure turns up in discovery work and in long escalations alike:

1. A fact is learned in a session and written into the notes.
2. It is copied into the status page, the intent, the deck, the SOW draft and a questionnaire.
3. A week later the fact turns out to be wrong. Someone corrects two of the copies.
4. The other copies keep the old value, and nobody can tell which copy is current. The client quotes the deck.

Related symptoms:
- IDs that exist only in a spreadsheet or a slide, so the docs cite things nobody can find.
- Two hypotheses given the same number by different people on different days.
- A status page that slowly grows into a second journal.
- Actions due "ASAP", decisions with no approver, and an evidence checklist nobody ticks.
- Corrections done with strikethrough until a table cannot be read.

The fix is the one the chain already uses for requirements: **give each thing one home and an ID, and make everything else cite the ID.**

## The ledgers

| ID | File | One entry is | It must carry |
|---|---|---|---|
| `F-n` | facts.md | one fact | a label (confirmed, inferred, to confirm), a source, a date |
| `D-n` | decisions.md | one decision record | status; once accepted, an approver and a reversal condition |
| `A-n` | actions.md | one commitment, by us or the client | an owner and a date, or `none` with a reason |
| `Q-n` | questions.md | one question | what it drives, who can answer; once answered, where |
| `RISK-n` | risks.md | "If … then …" | likelihood, impact, mitigation, owner, when we'll know |
| `GAP-n` | risks.md | something the baseline needs that is missing | what it blocks and what closes it |
| `SYS-n`, `INT-n` | systems.md | a system, an integration | owner, confidence, source |
| `H-n`, `E-n` | the file that tests them | a hypothesis, a piece of evidence | a status; what was run and what it showed |
| `INC-n` | rca-plan.md | a related incident | date, symptom, what was concluded then |

These IDs use a dash and a single kind letter, so they never collide with the chain's `R1`, `AC1`, `T1` or a feature prefix like `REM-R1`.

Around the ledgers:
- **status.md** is a snapshot, overwritten every session: posture, workstreams, blocked on, next actions, decisions needed. No "recently done" list; that is the journal's job.
- **journal.md** is prepend-only. Each entry records the Prompt, what was Done, what was Learned, what Changed, the Scope guard, the Decisions spawned and what comes Next. Old entries are never edited.
- **notes/** holds one file per session or document, keyed to the Q- IDs it answers, with a **Not covered (carry forward)** list.
- **stakeholders.md** lists roles first, adding names only where the engagement agreement allows.
- **CLAUDE.md** holds the workspace rules, so every session in the folder loads them.
- **README.md** is the map: each file's role and the question it answers.

## The rules that make it work

- **Write each fact once.** Other files cite `F-3`; they do not restate the fact.
- **IDs are permanent and unique across the folder.** Never reuse a number.
- **Correct by superseding.** Set the old entry's status to `superseded by F-12`, add the new one, and say why in the journal. Nothing is deleted or struck through.
- **Source of truth, highest first:** live evidence (a captured log, query or screen, dated), then a document with a version, then what someone said (role and date), and last, memory, which is never cited.
- **Absolute dates only.** "Next week" means nothing in a journal read a month later.
- **Risks, gaps and decisions are different things.** A risk might happen. A gap is already true. A decision is a choice someone approved. When a risk happens, close it and open a gap that cites it.
- **Inferred stays inferred** until a source confirms it, and readouts word it as approximate.
- **The agent drafts; a person sends.** No client message, push or production change goes out from the agent.

## The ledger check

```bash
node <engagements plugin>/scripts/engagement-check.mjs ledger docs/<engagement>
```

It reads every `.md` and `.html` file under the folder, skipping names that start with `_` or `.`. A definition is a table row whose first cell is the ID, or a heading that starts with it (`### D-4 Keep the nightly batch`) with `**Field:** value` lines beneath. Inline code and fenced blocks are examples, not citations.

| It reports | Usually means | Fix |
|---|---|---|
| `X cites Q-9, defined in no ledger in this folder` | the ID lives in a spreadsheet, a slide or someone's head | add the entry to its ledger, or remove the citation |
| `H-3 defined twice` | two people numbered independently | keep the first; give the second the next free number and update its citations |
| `status.md:4 cites F-2, superseded by F-7` | a copy kept the old fact; often a deck or readout | cite F-7, and reword if the fact changed |
| `F-5 is superseded but does not say by what` | a correction with no successor | write `superseded by F-n` |
| `A-3 has no owner` / `is due "ASAP"` | a commitment nobody will feel | name a role and a date, or `none` with a reason |
| `D-2 is accepted but has no reversal condition` / `names no approver` | a decision nobody can revisit or defend | write the observation that would reverse it, and who approved |
| `F-8 has no label` / `no source` | a guess that reads like a finding | label it confirmed, inferred or to confirm, and cite where it came from |
| `Q-4 is answered but does not say where` | an answer that cannot be checked | fill **Answered in** with the session note or document |
| `status.md last updated …, but journal.md has an entry for …` | the snapshot fell behind the history | refresh status.md |

The journal may name superseded IDs, because it is history; so may the correction line itself. Everywhere else, a superseded citation is drift.

Like drift-check, the ledger check proves the documents are consistent with each other, not that they are right. Whether a hypothesis was really killed by its evidence is still a judgement for the technical lead.

## Engagement shapes on the workspace

| Shape | Skill | Adds beside the ledgers |
|---|---|---|
| Discovery | `/ainf-engagements:discovery` | intent.md as a hypothesis (labels, an H- table, entry criteria), session and document notes |
| POC | `/ainf-engagements:poc` | poc-spec, poc-plan (test table, stop-and-ask list), poc-result with E- evidence |
| Acute incident | `/ainf-engagements:incident` | one incident.md: restore first, H- and E- in a single file |
| Escalation / red account | `/ainf-engagements:escalation` | mission intent with three-tier done, rca-plan, rca, remediation, exit |
| Any client-facing update | `/ainf-engagements:readout` | readout-<date>.md where every claim cites an ID |

### Discovery: what the workspace changes

- The questionnaire becomes questions.md: each question says what it **drives** and who can answer, and it gets a status.
- Session notes are keyed to Q- IDs, mark unverified claims `?` and conflicts `⚠ see F-n`, and carry forward what was not covered.
- intent.md cites F- IDs as its sources and keeps a hypothesis table with dated status.
- Entry criteria for the SOW are tied to the risks and questions they close.
- The POC brief is written so an agent could run it unattended, and facts.md wins over anything the POC run "discovers".

### Escalation: what is different from an incident

An incident restores service in hours. An escalation rebuilds a client's confidence over weeks: competing theories, a vendor RCA, executives reading every update, and a symptom that keeps returning. The escalation skill adds:

- **Three-tier done**, agreed up front: containment shipped, cure held for N cycles, exit on scorecard metrics.
- **Identities and topology verified first**, as a gate. A wrong mapping found in week two invalidates everything built on it.
- **A sceptical read of any third-party RCA**: what it says, what it closes, where it disagrees with our evidence, what it does not change.
- **Hypotheses with confirm and kill tests**, an evidence checklist that is ticked every session, and decision gates.
- **Containment kept apart from cure**, options ordered from least to most disruptive, each with a capability tag (supported, preview, custom, internal) so nothing unsupported is promised.
- **Preconditions** for destructive changes, and a runbook that triages and escalates but never changes production.
- **Monitoring signals** (leading, coincident, trailing) rolled into an exit scorecard, then a handover and a dated sponsor sign-off. Without the sign-off, an escalation never ends; it just goes quiet.

### Readouts: generated, not written beside the docs

A readout is drafted from the ledgers. The bottom line comes first and section titles state their takeaway. Every claim cites its ID, confidence shows in the wording, and the only dates are those in actions and decisions. Because the ledger check reads readouts too, a deck that drifts from the docs is caught like any other copy.
