---
name: intent
description: Write docs/<feature>/intent.md, the outcome layer of the artifact chain (why, for whom, how we will know). Interviews the user first and never proposes a design. Use when starting a new feature, epic or change, when the user says "I want to add...", or when an outcome, target or Done-means needs to be pinned down. For client discovery, write a hypothesis intent where every line carries a source and a label.
---

# intent.md: why, for whom, and when it is done

The intent states outcomes and boundaries. How to build it belongs in plan.md; a plan that creeps into the intent locks in decisions nobody weighed.

## Steps

1. Read README.md, CLAUDE.md and constitution.md. Pick a short kebab-case feature name and use `docs/<feature>/`.
2. **Interview, one question at a time, maximum 8**, about: the outcome and its baseline, the users, constraints already decided, what is out of scope, and how we will know it worked. Do not propose a design. If the user is unsure, record it as an open question rather than filling the gap.
3. When the user says "write it", create `docs/<feature>/intent.md` from `template.md` in this skill's directory. Status starts as `DRAFT`.
4. Under **Open questions**, mark a question `BLOCKING:` when it affects scope, safety, architecture or acceptance. Give every other question an owner and a date.
5. Sort every line: if it says *how* (a scheduler, a table, a library), move it out. Technology that is already decided stays, as a **Constraint**.
6. Run Gate 1 (`/ainf:gate 1 docs/<feature>`) and show the result. Do not mark it approved yourself.

## Discovery variant (consulting, pre-SOW)

When the input is call notes or a client brief, the intent is a hypothesis you expect to be wrong in places:
- Every line carries a label and a source: `[fact · who/where]`, `[inference · basis]`, `[recommendation · ours]`, `[open question · who can resolve]`. A line with no label will be read as a promise.
- Constraints are labelled Known, Assumed or Unknown.
- Replace "Done means" with **What we must learn** before we can commit.
- Never invent a fact. Unsourced statements are inferences or open questions, and say so.
