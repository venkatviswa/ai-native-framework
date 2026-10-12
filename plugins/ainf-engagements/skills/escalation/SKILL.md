---
name: escalation
description: Run a red-account or chronic-problem escalation over days or weeks on the engagement workspace - mission intent with three-tier done (containment shipped, cure held, exit on agreed metrics), identities and topology verified before any analysis, an investigation with related incidents and a sceptical read of any vendor or third-party RCA, an rca-plan of hypotheses with confirm and kill tests and decision gates, an RCA with a cause tree and dated findings, remediation that keeps containment apart from cure, monitoring and an exit scorecard, and a handover. The agent is read-only; every production change waits for a named human. Use when a sponsor is escalating, an account is red, a problem keeps recurring, or the user says escalation, red account, war room or get-well plan.
---

# Escalation: verify first, contain, cure, prove it held, hand it back

An escalation is not a long incident. An incident restores service in hours; an escalation rebuilds a client's confidence over weeks, with competing theories, a vendor's RCA, executives reading every update and the same symptom returning. Most of what goes wrong is drift: a mapping that was wrong on day 2 is still in the deck on day 20, two hypotheses share a number, and nobody can say which actions are still open. Run it on ledgers.

**Roles.** An escalation lead owns the plan and the client relationship. A technical lead owns the diagnosis. A communications owner sends updates. **You are a read-only analyst.** Ask who holds each role and write them in stakeholders.md.

**Lock down.** Recommend the incident profile: if `.claude/settings.incident.json` is missing, copy it from `<this skill's base directory>/../../templates/settings.incident.json`, show it, and tell the user to restart with `claude --settings .claude/settings.incident.json`. If the problem is an acute outage right now, run `/ainf-engagements:incident` first and come back when service is restored.

## 0. Workspace and mission

Run `/ainf-engagements:workspace` for `docs/escalation-<slug>/` if it does not exist. Then write `intent.md` from `intent-template.md` in this skill's directory:
- **Mission**: one sentence a sponsor would agree with.
- **Situation**: what is happening, citing F- IDs.
- **Goals**, numbered. Every later artifact traces to a goal; anything that traces to none is out of scope.
- **Done, in three tiers**: containment shipped (the bleeding stopped), cure held for N cycles of the failing workload, exit on the scorecard metrics agreed with the client. Agree the metrics now, not at the end.
- **Principles, non-goals and audience** (who reads what).

## 1. Verify identities and topology first (gate)

Before any analysis, confirm with live evidence which environments, instances, accounts, tenants, jobs and integrations are involved, and how they map to each other. Record each as a `confirmed` F- whose source is a captured screen, query or log with a date, not a document or memory. Fill systems.md.

**Gate:** no hypothesis work until the identity and topology facts are confirmed. A wrong mapping found in week two invalidates everything built on it.

## 2. Investigation

Write `rca-plan.md` from `rca-plan-template.md` in this skill's directory, starting with the investigation sections:
- **Related incidents**: each prior incident as INC-n, with date, symptom and what was concluded then.
- **What we were told**: for any vendor or third-party RCA, record what it says, what it closes, where it disagrees with our evidence, and what it does not change. Treat it as a source to test, not a conclusion.

## 3. Diagnosis

In the same rca-plan.md:
- **Hypotheses** H-n, each with *confirmed if* and *killed if* tests and a status (open, testing, confirmed, killed, parked). Never renumber; a new idea gets the next number.
- **Evidence checklist** E-n: what must be captured, by whom, and whether it has been. Update it every session; a checklist that is never ticked is worse than none.
- **Decision gates**: the points at which the team commits (e.g. "if H-2 is confirmed by E-4, stop testing H-3 and plan the cure").

When the evidence is in, write `rca.md` from `rca-template.md`: the conclusion, a cause tree, and findings with a confidence, the H- and E- they rest on, an owner and a date. Record each confirmed finding in facts.md as an F-. **Keep "we believe" and "we showed" apart in the wording.**

## 4. Remediation

Write `remediation.md` from `remediation-template.md`:
- **Containment and cure, kept separate.** Containment stops the harm now and may be ugly; cure removes the cause. A containment that is never followed by a cure becomes the system.
- **Options from least to most disruptive**, each citing the findings it addresses, with its reversibility and a **capability** tag: supported (a documented product feature), preview (not yet generally available), custom (we build and own it) or internal (needs the vendor's own team). Only promise supported behaviour to the client without a caveat.
- **Preconditions** for any destructive or production-changing step: backup taken, rollback written, tested outside production, approved by a named human with the time logged. **You never run them.**
- A **runbook** for the people who will see the symptom next: how to triage it and whom to escalate to. A runbook that tells an operator to make a production change is a remediation, and needs its own approval.

Each chosen option is a D- decision record with an approver and a reversal condition.

## 5. Monitoring and exit

Write `exit.md` from `exit-template.md`:
- **Signals**: leading (warns before it fails), coincident (shows it failing), trailing (confirms the damage). Each with a threshold, where it is watched and who watches it.
- **Exit scorecard**: the metrics agreed in step 0, the target, the current value with its date, and whether it has held for the agreed cycles.
- **Handover**: who owns each signal, runbook and open action after the escalation closes; residual risks, accepted by name.
- **Closure**: the sponsor's sign-off, dated. Without it, the escalation never ends; it just goes quiet.

## Every session

Follow the workspace loop: notes, ledgers, status, journal, check. Draft updates with `/ainf-engagements:readout`; every claim in them cites an ID, so the ledger check catches a deck that has drifted from the docs. **A person sends them; you never do.**

```bash
node "<this skill's base directory>/../../scripts/engagement-check.mjs" ledger docs/escalation-<slug>
```

When the cure changes code or configuration, run it through the normal chain (`/ainf:cr` against the spec that missed the case, a regression test citing the requirement, `/ainf:build` outside production), and a human deploys it.
