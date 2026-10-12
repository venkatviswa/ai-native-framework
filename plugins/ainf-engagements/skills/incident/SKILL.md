---
name: incident
description: Run an acute production incident on a compressed artifact chain - one living docs/incident-<date>-<slug>/incident.md (restore first, observed vs expected with a timeline of changes, up to 5 ranked hypotheses H-n each with its cheapest discriminating check, an evidence log E-n), the agent strictly read-only and bounded, every production-changing action listed as "needs human approval", then reproduce-first fix, update the sources, and draft (never send) customer updates. Use when production is broken right now, an integration is failing, records are locking, or the user says incident, outage or sev1. For a recurring problem or a red account that lasts beyond the restore, hand off to /ainf-engagements:escalation.
---

# Incident: restore first, read-only first, a human on every production change

Time pressure is exactly when agents guess most, and when a wrong write to production costs most. Run it as an incident, not a debugging session.

An incident ends when service is restored and the fix is in. If the problem keeps coming back, or the client is still red after the restore, open an escalation with `/ainf-engagements:escalation` and cite this incident there as an INC-.

**Roles.** An incident commander leads. An operations lead does the hands-on work. A communications lead sends the updates. **You are a read-only helper to the operations lead.** Ask who holds each role, and write their names in incident.md.

## 0. Lock down first

Recommend that the session run with the incident profile. If `.claude/settings.incident.json` is missing, copy it from `<this skill's base directory>/../../templates/settings.incident.json`, show it, and tell the user to restart with `claude --settings .claude/settings.incident.json`. It allows reads and local analysis. It asks before any production read. It denies deploys, data writes, rollouts, credential changes and pushes.

- **May do alone:** read the logs, release notes, error history and code you have been given; reproduce in a sandbox or scratch environment.
- **Needs a named human:** anything that changes production state, credentials or the client's view; bulk data pulls. Production reads too, unless they are authorized, minimal (only the records and fields a hypothesis needs) and low-load.

## 1. incident.md, in minutes

Create `docs/incident-<YYYY-MM-DD>-<slug>/incident.md` from `template.md` in this skill's directory. The four rows of the chain live under four headings:

| Normal artifact | In the incident |
|---|---|
| intent | **Restore service first**, then root cause, then rebuild trust. One paragraph. |
| spec | **Observed vs expected** behaviour, with a reproduction, and a **timeline of changes** (deploys, config, data loads, integrations). |
| plan | **Up to 5 ranked hypotheses**, each with the *cheapest check that would confirm or kill it*, and the action boundaries. |
| tasks | **Small, reversible diagnostic steps** with an **evidence log**: time, who, what was run, what it showed. |

Sort evidence by the provenance ladder:
1. A live metric or log outranks the runbook.
2. The runbook outranks what someone remembers.

Number hypotheses H-1, H-2 and evidence E-1, E-2, and never renumber. Mark eliminated hypotheses **eliminated**, with their evidence. Do not delete them. `engagement-check.mjs ledger docs/incident-<date>-<slug>` catches a reused number or a citation of evidence that was never logged.

## 2. Actions that change production

List each one under **Actions needing human approval** with:
- what it changes;
- whether it is reversible, and how to undo it;
- the evidence that justifies it.

For example: rolling back the release, disabling a flow or trigger, pausing an integration, killing sessions, or a data fix.

**Never run any of them.** The gate before any change to production:
- It is reproduced and tested outside production first.
- It is reversible, and the rollback is written down.
- A named human approved it, and the time is logged in the evidence log.

## 3. Fix: reproduce first

Write a failing test or a sandbox reproduction before the hotfix, using `/ainf:build` in a non-production environment. The fix is reviewed against incident.md, then **deployed by a human**.

## 4. Learn: update the sources

- Correct the spec that missed the case (`/ainf:cr`), and add the regression test, citing the requirement ID.
- If the response was slow, update the runbook.
- Add a constitution rule only when the lesson is an enduring policy, not for every incident.
- For anything bigger, run `/ainf:retro`.

## 5. Trust: customer communication

On the cadence the commander sets, draft updates from incident.md: facts, the timeline, what is being done, and the next update time. **No speculation, and no hypotheses presented as findings.** Write each draft into the **Communications** section. **A person sends it; you never do.**

For platform specifics (Salesforce debug logs, locking and governor limits; Kubernetes, Kafka and Postgres), see `<this skill's base directory>/../../references/platforms.md`.
