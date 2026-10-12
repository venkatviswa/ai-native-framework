# constitution.md

**Template:** [`templates/constitution.md`](../../plugins/ainf/templates/constitution.md) · stamped by `/ainf:init` at the repo root · read by every plan.md's Constitution check

## What it is for

The handful of rules that hold for every feature in the project, whoever or whatever writes the code. These are things you would block a merge over. A plan that breaks a rule needs an approved exception, written down, not silence.

## Who owns it, when it changes

The tech lead and product owner, or whoever the file names under *Changing this file*. It changes rarely: after a retro finds an enduring lesson, or when the organisation's policy changes. A rule added for every incident turns it into noise the agent learns to skim.

## Sections

| Section | Fill with |
|---|---|
| Rules 1–5 | The method's defaults: test first, no new vendor without approval, no personal data in logs, files over chat, a human at each gate. Keep them unless you have a reason. |
| Rules 6+ | Your project's enduring policies: money representation, idempotency, data residency, accessibility level, supported browsers. |
| Approvers | A named role per gate. `/ainf:gate` names the approver from this table. |
| Changing this file | Who approves a change to the rules, and where the approval is recorded. |

## Weak vs strong

| Weak | Strong |
|---|---|
| "Write good code." | "Every external call has a timeout and an idempotency key." |
| "Be secure." | "Logs carry ids only, never personal data." |
| "Use best practices for money." | "Money is integer minor units with an ISO 4217 currency." |

A rule is good if a reviewer can point at a line of a plan or a diff and say it breaks the rule.

## Not here

Commands, paths and stack details go in CLAUDE.md. Feature-specific constraints go in that feature's intent.md.
