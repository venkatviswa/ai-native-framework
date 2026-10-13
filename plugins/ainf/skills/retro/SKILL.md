---
name: retro
description: Run the method's own retro when an outcome misses or a defect escapes - separates what the evidence shows from hypotheses, classifies the cause (intent, spec, boundary, test, review, context or process gap), and names the artifact to change first. Use after a release misses its intent.md target, after an escaped defect or incident, or when the user asks "why did this get through?".
---

# Retro: name which artifact let it through

A missed target is the product's failure. Naming the artifact that should have caught it is the method's failure, and that one you can fix before the next feature.

## 1. Evidence before hypotheses

Gather what is actually known: the intent.md metric (same definition, same population, against a comparison group), signals per requirement, the audit log, interviews, the defect and its timeline. Label each item with its source. "Opened but still late" is a list of hypotheses, not a finding. Do not choose a change until the evidence separates the hypotheses.

## 2. Classify the cause

| Cause | What it looks like | Fix first in |
|---|---|---|
| Intent gap | The outcome or its metric was wrong or unmeasurable | intent.md: outcome, Done means, metric definition |
| Spec gap | A behaviour users needed was never stated | spec.md, then its tests (usually via `/ainf:cr`) |
| Boundary gap | The agent decided something it should have asked about | plan.md Action boundaries and the permission profile |
| Test gap | A criterion had no test, or a test asserted too little | tasks.md: the task that owns the criterion |
| Review miss | The test existed and the reviewer skipped it | the Gate 5 checklist, and who signs it |
| Context gap | The agent lacked a fact the repo already held | CLAUDE.md and the artifact index |
| Process design | The method itself made the wrong thing easy | constitution.md; a change request on the way of working |

There can be more than one cause. Rank them by how much each explains.

## 3. Output

Write `docs/<feature>/retro-<date>.md` with: evidence (sourced), hypotheses considered and how each was kept or ruled out, the causes with their artifact, and the changes proposed: each one a targeted edit or a CR, with an owner and a re-measure date. Add a constitution rule only when the lesson is an enduring policy, not for every incident.

**The second-time rule.** If the same mistake has now happened twice, the fix is a missing line, not a backlog item: add it to CLAUDE.md under "Things the agent gets wrong" (mistake, fix, how to check), or to a skill or a hook, in this retro.
