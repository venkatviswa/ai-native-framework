---
name: gate
description: Run one of the five human gates of the AI-native SDLC against a feature's artifacts and report pass/fail per checklist item with evidence - Gate 1 intent.md, Gate 2 spec.md, Gate 3 plan.md, Gate 4 tasks.md, Gate 5 code review against the spec. Use when the user asks to check, review or approve an artifact, or after writing one. Usage: /ainf:gate <1-5> docs/<feature>
---

# Gates: the agent checks, a person approves

Arguments: gate number and feature directory (`/ainf:gate 2 docs/reminders`). If either is missing, infer from context and say what you assumed.

For each checklist item report **PASS**, **FAIL** or **UNSURE**, with evidence: quote the line or name the file. End with a verdict and the shortest list of fixes.

**Provenance rule.** A finding may *block* only if its source is an approved artifact or the live system (signed spec, ADR, the diff, a real schema, a provider's published contract) or a reviewed document. Anything lower (what someone said, text an agent generated, a hunch) becomes an open question with an owner: recorded, but not blocking. Your own review can raise, not block, until a person checks it.

**Approval.** Name who should approve this gate, from the Approvers table in constitution.md if it has one. Never set `Status: APPROVED` yourself. If the verdict is pass and the user explicitly says they approve, write `Status: APPROVED vX (their name, today's date)`, and only then.

**Proportionate rigour.** Not every change needs every gate. If it is unclear which gates this change needs, run `/ainf:triage` first. If the user asks to skip a gate, say what risk that accepts, then do as they decide.

## Gate 1: intent.md
- The outcome is measurable or at least observable, with a baseline.
- No new design choices. Technology that is already decided is written as a constraint.
- Out of scope is written down, not assumed.
- Every unknown is listed; the ones that affect scope or acceptance are flagged BLOCKING.
- (Discovery) every line carries a label and a source.

## Gate 2: spec.md
- Every requirement is testable and has at least one acceptance criterion, including failure cases.
- No unexplained "fast", "easy", "appropriate" or "etc."; key terms are defined.
- No open question that affects scope, safety, architecture or acceptance. Others have an owner and a date.
- Nothing contradicts intent.md, and every promise in intent.md is covered.
- Requirements and criteria are numbered (R1, AC1 (R1)) so tasks and tests can point to them.

## Gate 3: plan.md
Dispatch the `ainf:plan-reviewer` subagent first and fold its findings into the items below.
- Every requirement and acceptance criterion maps to something in the plan (check the Traceability table).
- The constitution check is honest, and exceptions are approved.
- The data model can enforce the spec.
- Rejected options, risks and assumptions to verify are written down.
- Action boundaries say what the agent must ask about, and which controls enforce them.

## Gate 4: tasks.md (before the agent builds)
- Every acceptance criterion is covered by a task.
- Each task is small enough to review in one sitting, names its requirement, and has a test it can pass on its own.
- Tasks that need human approval are marked.
- Run `node scripts/drift-check.mjs --feature docs/<feature>` and include its output.

## Gate 5: code review against the spec
Review the diff on two axes. Dispatch the `ainf:spec-reviewer` and `ainf:standards-reviewer` subagents **in parallel** on the same diff range, check the evidence behind each HIGH finding yourself, then report against this checklist:
- Every acceptance criterion in scope has a test, and you read what the tests *assert*. Tests are evidence, not proof.
- No changes outside the files the task and action boundaries allow.
- Code matches the plan's contracts and data model, or the plan was updated first.
- No secrets, personal data in logs, or unreviewed new dependencies.
- Commits name the task and requirement.
- If behaviour changed, spec.md and plan.md changed first.
- For a story: integration evidence exists, not only component tests.
- Run `node scripts/drift-check.mjs` (and `--complete` if the feature is being called done) and include the output.
