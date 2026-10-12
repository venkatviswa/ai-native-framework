---
name: init
description: Scaffold a repository for the AI-native SDLC: constitution.md, CLAUDE.md, artifact templates in docs/_templates/, drift-check, git hooks, CI workflow and per-step permission profiles. Use when the user asks to set up, bootstrap or initialise a repo for the ainf workflow.
disable-model-invocation: true
---

# ainf init

1. Run the scaffolder against the repository root. It copies the plugin's sample files as they are, never generates them, and never overwrites a file:

   ```bash
   node "<this skill's base directory>/../../scripts/init.mjs" "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
   ```

2. Read the repo (README, package manifest, build files, test layout) and fill the `[placeholders]` in what was created, showing the user each edit:
   - `CLAUDE.md`: Project, Stack and commands, Where things live. Use the real test, build and lint commands.
   - `constitution.md`: the project name. Leave the project rules and Approvers placeholders for the user unless they tell you the answers.
   - `.ainf.json`: `testCommand`, `codeDirs` (where production code lives), and `testPatterns` if tests live somewhere unusual (for Salesforce: `force-app/**/classes/*Test.cls`).
   - `.claude/settings*.json`: replace `npm test` and `src/**` with the stack's real commands and paths.
   Ask about whatever the repo cannot tell you instead of guessing. Do not fill in `docs/_templates/`: those placeholders are for each feature.
3. For anything the scaffolder reported as `exists`, show the user the difference and offer a merge. Do not overwrite.
4. Tell the user what is still theirs to do, plainly:
   - Fill in `constitution.md` with the team's real principles and approvers (the defaults are a starting point).
   - Optionally edit `docs/_templates/` to the team's house style. The skills use these copies over the plugin's. Keep the `R#`, `AC# (R#)`, `- [ ] T# (R#, AC#)` and Action boundaries line formats, because drift-check parses them.
   - Commit the scaffold, then turn on branch protection and make the `drift-check` workflow a required check.
   - Start the first feature with `/ainf:intent`.
