---
name: init
description: Scaffold a repository for the AI-native SDLC: constitution.md, CLAUDE.md, drift-check, git hooks, CI workflow and per-step permission profiles. Use when the user asks to set up, bootstrap or initialise a repo for the ainf workflow.
disable-model-invocation: true
---

# ainf init

1. Run the scaffolder against the repository root (it never overwrites a file):

   ```bash
   node "<this skill's base directory>/../../scripts/init.mjs" "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
   ```

2. Read the repo (package manifest, build files, test layout) and tailor what was created, showing the user each edit:
   - `CLAUDE.md` "Stack and commands": the real test, build and lint commands.
   - `.ainf.json`: `testCommand`, `codeDirs` (where production code lives), and `testPatterns` if tests live somewhere unusual (for Salesforce: `force-app/**/classes/*Test.cls`).
   - `.claude/settings*.json`: replace `npm test` and `src/**` with the stack's real commands and paths.
3. For anything the scaffolder reported as `exists`, show the user the difference and offer a merge. Do not overwrite.
4. Tell the user what is still theirs to do, plainly:
   - Fill in `constitution.md` with the team's real principles (the defaults are a starting point).
   - Commit the scaffold, then turn on branch protection and make the `drift-check` workflow a required check.
   - Start the first feature with `/ainf:intent`.
