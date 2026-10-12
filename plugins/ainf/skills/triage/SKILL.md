---
name: triage
description: Decide how much ceremony a change needs (proportionate rigour) - rates it on three dials (blast radius, data and money sensitivity, reversibility), then names the tier, which artifacts to write, which gates run, who approves, and what evidence is required. Use at the start of any change, when the user asks "do I need a spec for this?", or wants to skip a gate.
---

# Triage: not every change needs every gate

Run the full chain on everything and you have rebuilt waterfall in markdown. Rate the change, then do exactly the ceremony it earns.

## The three dials

| Dial | Low (0) | Medium (1) | High (2) |
|---|---|---|---|
| **Blast radius** | one file or copy, one team | a feature, a shared module | a contract other teams use, many users, a migration |
| **Sensitivity** | no user data, no money | user-visible behaviour, non-personal data | personal or regulated data, money, security, production access |
| **Reversibility** | revert the commit | flag off or a follow-up deploy | data written, emails sent, schema changed, external effects |

Any High on **Sensitivity** or **Reversibility** puts the change in Tier 3, whatever the sum.

## Tiers

| Tier | Score | Artifacts | Gates | Approver | Evidence |
|---|---|---|---|---|---|
| 1 Small | 0–1 | a task line citing the requirement it touches | 5 | any reviewer | tests, drift-check |
| 2 Standard | 2–3 | spec delta (or a CR) + tasks | 2, 4, 5 | feature owner | criteria tests, drift-check, spec-reviewer |
| 3 High-risk | 4+, or any High on sensitivity/reversibility | full chain: intent, spec, plan, tasks | 1–5 | named approver per gate | all of Tier 2, plus integration evidence, release and rollback plan, standards-reviewer |

These thresholds are illustrative. If `constitution.md` or the organisation sets its own, use those and say so.

## Output

State each dial with a one-line reason, the tier, and the list of artifacts, gates, approvers and evidence. Then two rules that travel with every tier:
- **When a requirement changes:** follow the IDs (`drift-check --impact`), make targeted edits, review the diff like code, rerun the checks.
- **Open questions:** one that affects scope, safety, architecture or acceptance blocks approval; anything else gets an owner and a date.

If the user wants less ceremony than the tier says, name the specific risk they accept, then follow their decision and record it in the feature's spec or CR.
