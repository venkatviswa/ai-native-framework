---
name: tasks
description: Cut an approved plan.md into docs/<feature>/tasks.md - small, ordered, testable tasks (T1, T2...) that each cite their requirement and acceptance criterion IDs, test first, with approval-needed and parallel tasks marked. Use when the user asks to break a plan into tasks, steps, tickets or a sprint backlog.
---

# tasks.md: steps an agent can finish and check

1. Read `docs/<feature>/plan.md` and `spec.md`.
2. Write `docs/<feature>/tasks.md` from `template.md` in this skill's directory. Each line is `- [ ] Tn <step> (R#, AC#)`:
   - small enough to review in one sitting, and one commit;
   - names its requirement IDs (drift-check fails a task with none) and the criterion its test proves;
   - test first: the failing test is part of the task, named after its criterion;
   - mark `(approval)` when it touches anything under plan.md's "Ask first", and `P` when it can run in parallel;
   - order so the riskiest shared contract (schema, state machine, sender interface) lands first.
3. Check coverage: every acceptance criterion is covered by some task. List any that is not.
4. **Stop for the user's review.** Then run Gate 4 (`/ainf:gate 4 docs/<feature>`).

For a team, these rows sit under stories. A story is ready when a stranger could start it from the IDs alone: it names its R and AC IDs (not paraphrased), has one accountable owner, a verification method per criterion, and no blocking question.
