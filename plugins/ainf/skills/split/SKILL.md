---
name: split
description: Split one approved spec and plan across several developers, each with an agent - work items with one accountable owner, the R/AC IDs each satisfies, the shared contracts it depends on and must not change, the component tests it owns, and the integration tests nobody owns yet. Use when a feature will be built in parallel by a team, or when the user asks to divide work, assign stories or plan parallel agents.
---

# Split: one shared spec, several developers, several agents

Individually passing components still need integration evidence. "My unit tests pass" is evidence for a component; "the story is done" needs the integration tests, the acceptance criteria and the Definition of Done.

1. Read `docs/<feature>/spec.md` and `plan.md`. Ask how many developers, if not given.
2. **Agree the shared things first.** List the interfaces, schemas and state transitions every item depends on (name the file, function or table). If any is not written down in plan.md, that is the first work item, and nothing else starts until it is approved.
3. Write `docs/<feature>/split.md` with one row per work item:

   | Work item | Owner | Satisfies | Depends on (contracts) | Must not change | Component tests it owns | Can start |
   |---|---|---|---|---|---|---|

   Every acceptance criterion has exactly one accountable owner. Mark items that cannot start until another finishes.
4. **Integration tests nobody owns yet**: list each (two workers at once, the full journey, cross-component failure cases), the criteria it proves, and the single person who should own it.
5. **Scoped agent instructions**: for each item, a short block the developer pastes into their agent: the files and globs it may edit, the contracts it must not change, the IDs it satisfies. An agent helping one developer must not silently change a contract another is building against.
6. Self-check, printed at the end: every criterion has one owner; shared contracts are written down before anyone starts; each agent block names its boundaries; at least one integration test exists that no component test would catch.

A story is ready when a stranger could start it from the IDs alone.
