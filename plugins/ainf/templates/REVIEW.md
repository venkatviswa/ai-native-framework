# Review standard

Applies to every review of a change, whether an agent or a person runs it. Evidence before opinions.

## Three passes, every change
- **Bugs**: logic errors, broken edge cases, regressions. Cite file and line.
- **Security**: injection, secrets, personal data in logs, new dependencies.
- **Compliance**: the change matches spec.md (by requirement and criterion ID), plan.md (contracts, data model, action boundaries) and constitution.md; `drift-check` passes.

Findings are ranked by severity. **Important** is reserved for anything that would break behaviour, leak data or breach a rule. Style and naming are nits.

## Cap the nits
At most five nits per review; summarise the rest as a count. An Important finding buried under thirty nits has been hidden.

## What a human answers
Agent findings neither approve nor block on their own (provenance rule: generated text can raise, not block). The human reviewer answers two questions:
1. Is this the change the plan intended?
2. Is the risk acceptable?

Line-by-line human review is reserved for regulated and critical-path code: [list the paths, e.g. `src/payments/**`, migrations].

## The second-time rule
When a review catches a mistake for the second time, the correction goes into CLAUDE.md ("Things the agent gets wrong"), a skill or a hook as part of that review, not into a backlog.

## Do not report
Generated files and anything CI already enforces (lint, formatting, drift-check).
