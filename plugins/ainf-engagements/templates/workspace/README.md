# [engagement]: workspace map

Sensitivity: [client confidential | internal | shareable] · Repository approved for client data: [yes / reference]

Each kind of thing lives in exactly one file, with an ID. Everything else cites the ID instead of restating it.

| Doc | Role | Question it answers | IDs |
|---|---|---|---|
| status.md | Snapshot, overwritten | Where are we right now, and what is blocked? | cites |
| journal.md | History, prepend-only | What happened in each session, and what changed? | cites |
| facts.md | Canonical store | What do we know, how sure are we, and who said so? | F- |
| decisions.md | Decision records | What did we decide, who approved it, and what would reverse it? | D- |
| actions.md | Commitments | Who owes what, by when? | A- |
| questions.md | Open questions | What do we still need to learn, and from whom? | Q- |
| risks.md | Risks and gaps | What could go wrong, and what is already missing? | RISK-, GAP- |
| stakeholders.md | People and roles | Who decides, who knows, who is affected? | |
| systems.md | Systems inventory (optional) | What exists, how it connects, how sure we are | SYS-, INT- |
| notes/ | One file per session | What was said, keyed to Q- IDs | cites |

Shape-specific files (discovery intent, POC, SOW, escalation RCA, readout) sit beside these and cite the same IDs. Hypotheses (H-) and evidence (E-) live in the file that tests them.

## Reading order for a new person

1. status.md, then the last three journal entries.
2. facts.md and decisions.md.
3. questions.md, actions.md, risks.md.
4. The shape-specific files.

## After every session

1. Write `notes/<YYYY-MM-DD>-<slug>.md`.
2. Move what you learned into the ledgers: facts, decisions, actions, answered questions, risks.
3. Refresh status.md and add a journal entry.
4. Draft any recap. A person sends it.
5. Run `node <engagements plugin>/scripts/engagement-check.mjs ledger docs/[engagement]`.
