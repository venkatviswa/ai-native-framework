---
name: spec
description: Write or harden docs/<feature>/spec.md from an approved intent.md - numbered EARS requirements (R1, R2...), Given/When/Then acceptance criteria (AC1 (R1)...) including failure cases, definitions and blocking open questions. Also runs the clarify/attack pass that lists every ambiguity as a question. Use when the user asks for a spec, requirements, acceptance criteria, or to review a spec for gaps.
---

# spec.md: what must the system do

The agent's first spec always looks finished. It is not. Write it, then attack it.

## Write

Read `docs/<feature>/intent.md` (stop and say so if it has an unanswered BLOCKING question). Create `docs/<feature>/spec.md` from `template.md` in this skill's directory:

- **Definitions** for every term whose meaning changes behaviour: time and time zones, identity, units, "occurrence".
- **Requirements** numbered `R1`, `R2`... at the start of the line, each in an EARS pattern (see `references/ears.md`). One behaviour per requirement.
- **Acceptance criteria** as `ACn (Rn) Given ... When ... Then ...` at the start of the line. At least one per requirement, including failure cases (rejections, timeouts, retries, concurrency, restarts). Suffixes such as `AC3b` are fine for added cases.
- **Open questions**, `BLOCKING` or with an owner and a date.
- Do not choose technology. That is plan.md.

These line formats are what `drift-check` parses. Keep them exact.

## Attack (the clarify pass)

Then review the spec as a skeptical tester, and **do not edit the file yet**. Output a numbered list of:
- every vague word ("fast", "appropriate", "soon", "etc.") and undefined term;
- every requirement without an acceptance criterion;
- every case it does not cover: multiple owners or recipients, time zones and daylight saving, failed / lost / duplicated sends, two workers at once, changes after scheduling.

Phrase each as a question for the user. Apply answers as targeted edits and record decisions under **Decisions recorded at the gate**.

## Finish

Check that nothing contradicts intent.md and that every promise in intent.md is covered. Run Gate 2 (`/ainf:gate 2 docs/<feature>`).
