---
name: golive
description: Prepare go-live for a phased delivery - write docs/<feature>/cutover.md from plan.md (pre-cutover checks, ordered cutover steps with owners and timings, data migration and reconciliation, the rollback plan with its trigger and point of no return, hypercare) and run the go / no-go checklist with named approvers. Never deploys. Use when the user mentions cutover, go-live, release weekend, deployment runbook or go/no-go.
---

# Go-live: cutover and rollback from the plan, decided by named people

The agent drafts the runbook and checks the evidence. People decide and deploy.

## 1. cutover.md

Write `docs/<feature>/cutover.md` from `template.md` in this skill's directory, from plan.md's Release and rollback section, environments and migration:
- **Pre-cutover checks**: SIT exit met, UAT signed, the traceability matrix has no gaps, change freeze, backups, and communications sent.
- **Cutover steps**: ordered, each with an owner, start time, expected duration and a verification step. Salesforce: metadata deploy order, permission sets, data loads (parents before children), scheduled jobs and integrations switched on last. Cloud-native: migrations, deployment strategy (blue-green or canary), feature flags, consumer offsets.
- **Rollback**: the trigger (an observable condition, not a feeling); the steps; the **point of no return**, which says what can no longer be undone after which step; and who calls it.
- **Hypercare**: duration, on-call, the success metric from intent.md, and the support handover.

## 2. Go / no-go

Run the checklist with evidence: quote the file or command output for each item.
- SIT exit met: no open severity 1 or 2 (`sit.md`).
- UAT signed by the named business owner (`uat.md`).
- `node scripts/drift-check.mjs --complete` passes, and the traceability matrix shows no GAP.
- Every change since baseline has a CR and the spec version matches (`delivery.md`).
- The rollback has been rehearsed in a non-production environment, or the risk of not rehearsing it is accepted in writing.
- Each cutover step has a named owner, and the approvers are named.

Report **GO** or **NO-GO** as a recommendation, with the shortest list of blockers. **The decision belongs to the named approvers.** Record it only when the user tells you who decided, and when.

**Never run a production deployment, data load or rollback yourself.** Start the session with the ainf release profile (`claude --settings .claude/settings.release.json`).
