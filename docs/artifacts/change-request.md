# Change request (CR-n)

**Template:** [`templates/docs/cr.md`](../../plugins/ainf/templates/docs/cr.md) · written by `/ainf:cr` into `docs/<feature>/changes/CR-<n>.md` · needs a named approver before any edit

## What it is for

The only way an approved spec changes. It records why, lists everything the change touches, and keeps the edits targeted, so the diff a reviewer reads is exactly the change, not a regenerated document.

## Flow

1. **Record** the request and its evidence. No approver means stop here.
2. **Impact**: `node scripts/drift-check.mjs --impact R2 --feature docs/<feature>` lists every line, task, test and commit citing R2 and its criteria. Add the plan sections and external contracts that IDs do not show.
3. **Edit** spec.md first, then intent.md (only if outcome, scope or *Done means* changed), then plan.md and tasks.md. Show each diff before applying it.
4. **Build** test-first. New criteria get tests that fail on the old behaviour.
5. **Verify**: only impacted items changed, drift-check passes, nothing outside the action boundaries.

## IDs in a change

Add, do not renumber: `AC3b`, `T6b`. A removed requirement leaves its number unused, so a stale citation surfaces as a drift-check problem instead of silently pointing at something else.

## Weak vs strong

| Weak | Strong |
|---|---|
| "Customer wants snooze to work better." | "Snooze ends at 09:00 in the owner's zone, not 24 h later. Evidence: 31 of 40 support tickets in September (link)." |
| "Regenerate spec.md with the new rule." | "spec.md: edit R2; add AC3b. plan.md: Data model, until_utc computed from IANA zone. tasks.md: add T4b." |
