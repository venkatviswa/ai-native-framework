---
name: plan
description: Write docs/<feature>/plan.md from an approved spec - constitution check, data model, contracts, decisions with rejected options, risks and non-functional limits, action boundaries for agents, release and rollback, and a traceability table mapping every R and AC to a plan section. Also reviews an existing plan against its spec. Use when the user asks how to build a specified feature, for a technical design, or to review a plan.
---

# plan.md: how, technically, and what agents must not decide alone

Review a plan against the spec, not against whether it sounds right. Every line of a plausible plan reads well; that is the danger.

## Write

1. Read CLAUDE.md, constitution.md, `docs/<feature>/intent.md` and `spec.md`. **Explore the code first** and reuse what exists (queues, clocks, providers, stores). Do not write implementation code.
2. Create `docs/<feature>/plan.md` from `template.md` in this skill's directory:
   - **Constitution check**: pass or fail per rule, with a reason. A failure needs an approved exception, not silence.
   - **Data model**: entities, keys, time zones, retention. The model must be able to *enforce* the spec (e.g. recipient and occurrence in a unique key). Wrong here is the costliest rework.
   - **Contracts**: request/response shapes, error codes, versioning. Agents and other teams code against these.
   - **Decisions**: the option chosen *and the ones rejected*, with for/against. The next session starts from this table instead of re-arguing it.
   - **Risks and non-functional limits**: latency, volume, availability, security, cost; assumptions to verify (e.g. "the provider's 'not found' is a promise").
   - **Action boundaries**, in this exact form so drift-check can read it:
     - `May edit:` backticked globs the agent may change on its own
     - `Ask first:` backticked globs that need a person each time (schema, migrations, shared contracts)
     - `Never:` what is denied outright
   - **Release and rollback**: flag, rollout steps, one signal per requirement it protects.
   - **Traceability**: every requirement and acceptance criterion and the plan section that satisfies it. A row with nothing in it is a gap.
3. Run Gate 3 (`/ainf:gate 3 docs/<feature>`).

## Review an existing plan

Check each line against R*/AC* and the constitution. For each flaw: quote the line, name the requirement or rule it breaks, and propose the corrected line. Typical misses: retries that can duplicate, fixed UTC offsets instead of IANA zones, in-memory state lost on restart, personal data in logs, a new vendor, a unique key that omits the recipient.
