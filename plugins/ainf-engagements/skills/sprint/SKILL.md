---
name: sprint
description: Cut one sprint of a phased delivery into docs/<feature>/tasks-sprint-<n>.md (small, testable, ID-citing tasks with the Apex/Flow/unit test stated first and the files or objects each may touch, parallel tasks marked P, nothing from other sprints), and close a sprint by diffing what was built against spec.md and plan.md so the signed spec does not quietly age. Use when the user says plan sprint N, sprint backlog, sprint review or sprint close.
---

# Sprint: cut it from the baseline, close it against the baseline

Arguments: `cut <n>` or `close <n>`, plus the feature directory. Infer them from context if they are missing, and say what you assumed.

## Cut

1. Read `docs/<feature>/spec.md`, `plan.md` and `delivery.md`, which gives the requirement IDs this sprint targets.
2. Write `docs/<feature>/tasks-sprint-<n>.md` from `template.md` in this skill's directory. Each task:
   - is small and testable, and is one commit;
   - cites the requirement and criterion IDs it satisfies, `(R3, AC5)`;
   - **states its test first**: an Apex test class and method, a Flow test, or a unit test, named after the criterion;
   - names the files, metadata or objects it may touch, inside plan.md's action boundaries;
   - is marked `P` if it can run in parallel, and `(approval)` if it touches anything under "Ask first".
3. **Do not include work that belongs to other sprints.** If a targeted requirement needs something not yet built, list it under "Depends on" instead.
4. Run `node scripts/drift-check.mjs --feature docs/<feature>`. ainf 0.3 or later reads `tasks-*.md` alongside `tasks.md`. Then stop for the user's review: `/ainf:gate 4 docs/<feature>`.

## Close

Build decisions pile up in sprints 4 to 6 and the signed spec ages. Every sprint ends with a diff:

1. Run `/ainf:drift-review docs/<feature>` on the sprint's commits (`git log --format=%h\ %s` since the sprint start).
2. For each divergence, decide with the user: **either** change the code back **or** change spec.md or plan.md. After signoff, a spec change goes through `/ainf:cr`.
3. Tick finished tasks. Carry the unfinished ones to the next sprint file with the same IDs; never renumber them.
4. Append a sprint-close note to the task file:
   - what was built;
   - divergences and how each was resolved;
   - drift-check output.

Gate: the sprint's built behaviour matches spec.md and plan.md, or one of them was updated first.
