---
name: drift-review
description: Convergence-style drift review of a feature - read-only on code, checks whether the code and tests actually do what spec.md, plan.md and tasks.md say (meaning, not just IDs), prints severity-graded findings with evidence, and appends remediation tasks under "## Convergence" in tasks.md until it reports Converged. Use when tasks are marked done, before Gate 5 or a release, or when the user asks whether code matches the spec.
---

# Drift review: when references pass but meaning drifts

`drift-check` proves the IDs line up. A drift review asks whether the code does what the artifacts say. It never edits code.

Argument: the feature directory (`/ainf:drift-review docs/reminders`).

1. Run `node scripts/drift-check.mjs --feature docs/<feature>` and fix nothing yet. If it has problems, report them first: references must line up before meaning can be judged.
2. Dispatch the `ainf:spec-reviewer` subagent on the feature (all tasks marked done, against the main branch). For a large feature, one reviewer per requirement group, in parallel.
3. Read each finding's evidence yourself before accepting it. The reviewer can be wrong about drift too. Drop findings whose evidence does not hold, and say so.
4. Print findings:

   ```
   HIGH   R3: unknown outcome retried blindly
          evidence: src/sender.js:41 catches TIMEOUT and retries without lookup();
                    test "AC4" asserts attempts only
          task: - [ ] T7b Confirm by reference before retry (R3, AC4)
   ```

   LOW findings that need no code (wording, a non-blocking open question) get "no task: tracked" and an owner.
5. Append the accepted tasks to `docs/<feature>/tasks.md` under `## Convergence` (create the heading once). Show the user the appended lines.
6. If there are no HIGH or MEDIUM findings, report **Converged**. Otherwise: "Run `/ainf:build` on the new tasks, then review again." Each pass should find fewer items.

When code and spec disagree, the review does not decide which is right. It asks: either fix the code, or change the spec through `/ainf:cr`. A spec that lies is worse than none.
