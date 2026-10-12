# Reference

Background for people using the framework: what each artifact is for, how to fill it in, and the ideas that hold it together. The skills do not load these files. The editable placeholder templates live in the plugin, under [`plugins/ainf/templates/`](../plugins/ainf/templates/), and `/ainf:init` copies them into your project.

## Concepts

- [IDs, drift and drift-check](concepts.md): the ID thread, the two kinds of drift, every drift-check mode and how to fix what it reports, guidance vs enforcement, proportionate rigour.

## Artifacts

| Artifact | Guide | Template | Where it lives in your project | Gate |
|---|---|---|---|---|
| constitution.md | [guide](artifacts/constitution.md) | [template](../plugins/ainf/templates/constitution.md) | repo root | all plans check it |
| CLAUDE.md | [guide](artifacts/claude-md.md) | [template](../plugins/ainf/templates/CLAUDE.md) | repo root | n/a |
| intent.md | [guide](artifacts/intent.md) | [template](../plugins/ainf/templates/docs/intent.md) | `docs/<feature>/` | 1 |
| spec.md | [guide](artifacts/spec.md) | [template](../plugins/ainf/templates/docs/spec.md) | `docs/<feature>/` | 2 |
| plan.md | [guide](artifacts/plan.md) | [template](../plugins/ainf/templates/docs/plan.md) | `docs/<feature>/` | 3 |
| tasks.md | [guide](artifacts/tasks.md) | [template](../plugins/ainf/templates/docs/tasks.md) | `docs/<feature>/` | 4 |
| stories.md | [guide](artifacts/stories.md) | [template](../plugins/ainf/templates/docs/stories.md) | `docs/<feature>/` | optional; checked by `--stories` |
| CR-n.md | [guide](artifacts/change-request.md) | [template](../plugins/ainf/templates/docs/cr.md) | `docs/<feature>/changes/` | approval before edits |

## How the templates reach your project

```
plugins/ainf/templates/constitution.md   ->  constitution.md         (init; you fill rules and approvers)
plugins/ainf/templates/CLAUDE.md         ->  CLAUDE.md               (init; it fills stack and commands from the repo)
plugins/ainf/templates/docs/*.md         ->  docs/_templates/*.md    (init; copied as is)
docs/_templates/<artifact>.md            ->  docs/<feature>/<artifact>.md   (each skill, placeholders filled)
```

Init copies files and never overwrites one. Each skill uses your project's `docs/_templates/<artifact>.md` when it exists, and falls back to the plugin's copy otherwise. So you can change the house style once, in your repo, and every feature follows it. Keep the `ID prefix:`, `R#`, `AC# (R#)`, `- [ ] T# (R#, AC#)`, story and Action boundaries line formats, because drift-check parses them. drift-check and the session index skip folders under `docs/` whose names start with `_`.

The engagement artifacts (discovery notes, POC, SOW, delivery, SIT/UAT, cutover, incident) have their templates next to their skills in [`plugins/ainf-engagements/skills/`](../plugins/ainf-engagements/skills/).
