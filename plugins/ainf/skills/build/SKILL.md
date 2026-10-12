---
name: build
description: Implement tasks from docs/<feature>/tasks.md with the explore, plan, code, commit loop - failing test first named after its criterion, minimal code, one task per commit with a "T3 (R1): ..." subject, inside plan.md's action boundaries, then drift-check. Use when the user asks to implement, build or code tasks T1..Tn of a feature.
---

# Build: explore, plan, code, commit

For each task, one at a time:

1. **Explore.** Read the task, the requirement and criterion it cites in spec.md, and the plan's contracts and data model. No edits yet.
2. **Plan.** State in two or three lines what you will change and which files. If any file is outside plan.md's `May edit:` globs or matches `Ask first:`, stop and ask.
3. **Code.** Write the failing test first, named after its criterion (`AC1: two owners get one email each`). Run the tests and see it fail for the right reason. Write the minimal code to pass. Run all tests. Refactor while green.
4. **Commit.** One task per commit: `T2 (R1): reminder rows per owner`. Tick the task in tasks.md in the same commit.

If spec.md has an `ID prefix:` line (say `REM`), tests and commits outside the feature's docs use the full ID: `REM-AC1: two owners get one email each`, `REM-T2 (REM-R1): reminder rows per owner`. If the task belongs to a backlog story, the story key may follow: `REM-T2 (REM-R1): reminder rows per owner [PAY-123]`.

After the requested tasks, run `node scripts/drift-check.mjs` and show the user the diff and its output.

Rules that do not bend:
- If the code and the spec disagree, stop and ask which is right. If the spec is wrong, the fix starts in spec.md (then plan, tasks, tests), not in the code.
- A test that only counts attempts does not prove "no duplicate". Assert the observable result the criterion names.
- Never bypass the git hooks (`--no-verify`) or edit them.
