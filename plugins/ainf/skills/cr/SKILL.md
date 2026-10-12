---
name: cr
description: Run a change request through the artifact chain - record CR-n with its evidence, list everything that depends on the changed requirement IDs (drift-check --impact), propose targeted edits starting with spec.md, show diffs before applying, then implement test-first. Use when a requirement changes, a stakeholder asks for a change to an approved spec, or the user says "change R2", "CR", "change request" or "the requirement changed".
---

# Change request: change one requirement, update only what it touches

After a spec is approved, it changes only through a change request. Agents propose targeted edits from the approved change, never from a chat, and a person reviews the diff.

## 1. Record it

Create `docs/<feature>/changes/CR-<n>.md` from `template.md` in this skill's directory: the request, the evidence behind it, who approved it, and the re-measure date if it targets the outcome. If no one has approved it yet, stop at this step and say so.

## 2. Impact, from the files

Run, with the requirement or criterion IDs the change touches:

```bash
node scripts/drift-check.mjs --impact R2 --feature docs/<feature>
```

It lists every line, task, test, code comment and commit that cites those IDs (a requirement brings its criteria). Paste it into the CR's **Impact** section. Then add what IDs cannot show: plan sections that depend on the behaviour without citing it (read the plan), and contracts other teams consume.

## 3. Propose targeted edits, earliest artifact first

In this order, and only for the items in the impact list:
1. `spec.md`: the changed requirement and new or changed criteria (suffixes like `AC3b`, `AC3c`). Bump `Status` to the next minor version with the CR id.
2. `intent.md`, only if the outcome, scope or Done means changed.
3. `plan.md`: the sections that implement it (data model, contracts, risks such as time-zone or DST handling).
4. `tasks.md`: new tasks with suffixed IDs (`T6b`), each citing the CR's requirement IDs.

**Show the user every diff before applying it.** Never rewrite a whole artifact. Edits outside the impact list need a reason in the CR.

## 4. Implement and verify

Use the build loop (`/ainf:build`): failing tests first, including the edge cases the CR names (another time zone, a daylight-saving boundary). Then:

```bash
node scripts/drift-check.mjs
```

Self-check, recorded in the CR: only the impacted items changed; drift-check passes; the diff touches no files outside the action boundaries; each new criterion has a test that would fail on the old behaviour.
