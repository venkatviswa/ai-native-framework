---
name: stories
description: Map backlog stories (Jira, Azure Boards, GitHub issues) to a feature's requirement and criterion IDs in docs/<feature>/stories.md, then report each story's coverage - requirements, criteria tested, tasks and commits - with drift-check --stories. Use when the user asks to link stories or tickets to the spec, slice a spec into stories, check which stories are done, or produce a story traceability report.
---

# stories.md: backlog keys on the ID thread

The backlog tool owns the story: its key, status, estimate and sprint. The repo owns what the story means, as R and AC IDs. stories.md is the join between them, one line per story, so the tracker never needs a copy of the spec and the spec never needs a copy of the tracker.

## Write or update

1. Read `docs/<feature>/spec.md` (and tasks.md if it exists). If spec.md is not approved, say so: stories cut from a draft spec get re-cut.
2. Get the stories. Ask the user for keys and titles, or read a pasted export. Do not invent keys. If there is no backlog yet, propose slices and mark each key `TBD-1`, `TBD-2`... for the user to create in their tracker.
3. Write `docs/<feature>/stories.md` from the template: the repo's `docs/_templates/stories.md` if it exists, otherwise `<this skill's base directory>/../../templates/docs/stories.md`. Each line is `- KEY Title (R#, AC#)`:
   - the key first, exactly as the tracker shows it (`PAY-123`, `AB#4521`, `#87`);
   - the IDs it delivers, never a paraphrase of them. Citing only `R2` means all of R2's criteria; cite the ACs when a story delivers part of a requirement;
   - every requirement belongs to at least one story, and each story is small enough for one sprint;
   - with an `ID prefix:` in spec.md, short IDs are fine here; they resolve to the feature's prefix.
4. Run `node scripts/drift-check.mjs --stories --feature docs/<feature>` and fix what it reports: a story naming no ID, a key listed twice, a requirement no story covers, a stale ID.
5. Suggest the user paste each story's IDs into the tracker item (a field or the description), so someone reading the ticket can find the spec lines.

## Report

`node scripts/drift-check.mjs --stories` prints one row per story across every feature: the requirements it covers, criteria tested out of criteria in scope, the tasks that cite those IDs, and the commits whose subject names the story key. `--csv` gives the same rows for a spreadsheet or a tracker import.

Read it as evidence, not status. "3/3 criteria tested" means three tests are named after the criteria; whether they prove them is Gate 5's question. A story with tasks but no commits has not started; a story with commits but untested criteria is not done, whatever the tracker says.

Commits carry the key when the team wants this column: `REM-T2 (REM-R1): reminder rows per owner [PAY-123]`. drift-check does not require it.
