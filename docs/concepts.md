# Concepts: IDs, drift and drift-check

The framework rests on three ideas. Every artifact gets a stable ID. Drift is what happens when the IDs stop lining up with each other or with the code. drift-check is the script that notices, in seconds, every time.

- [IDs: one thread from intent to commit](#ids-one-thread-from-intent-to-commit)
- [Namespaced IDs: two features, one repo](#namespaced-ids-two-features-one-repo)
- [Stories: backlog keys on the thread](#stories-backlog-keys-on-the-thread)
- [Drift: when the artifacts stop telling the truth](#drift-when-the-artifacts-stop-telling-the-truth)
- [drift-check: what it checks and what it cannot](#drift-check-what-it-checks-and-what-it-cannot)
- [Guidance vs enforcement](#guidance-vs-enforcement)
- [Proportionate rigour](#proportionate-rigour)

## IDs: one thread from intent to commit

Each layer names the things it promises and cites the things it satisfies.

| ID | Defined in | Format (at the start of a line) | Cited by |
|---|---|---|---|
| `R1` | spec.md | `R1 When [event], the system shall [response].` | criteria, plan traceability, tasks, tests, commits |
| `AC1` | spec.md | `AC1 (R1) Given ... When ... Then ...` | plan traceability, tasks, test names |
| `T1` | tasks.md | `- [ ] T1 [step] (R1, AC1)` | commit subjects |
| `CR-1` | `changes/CR-1.md` | `# CR-1: [change]` | the edits it causes, the commits that implement it |

Suffixes add without renumbering: a criterion added by a change is `AC3b`, a remediation task is `T7b`. **IDs are never reused or renumbered.** A deleted requirement leaves a gap, because something somewhere may still cite the old number, and drift-check should find that citation, not silently re-point it.

```
spec.md       R2 While a task is snoozed, the system shall not send reminders.
              AC3 (R2) Given a 4 h snooze When it ends Then one follow-up
plan.md       | AC3 | Data model: snoozes(taskId, until_utc) |
tasks.md      - [x] T4 Snooze table and scheduler skip (R2, AC3)
test          test('AC3: snooze 4 h sends one follow-up', ...)
commit        T4 (R2): skip snoozed tasks
```

### Why IDs matter

1. **Traceability without a tool.** Any line can be followed up (why does this test exist? R2) or down (what proves R2? AC3, T4, one test, one commit) with `grep`. No ALM licence, no spreadsheet that goes stale.
2. **Change impact is a query, not a meeting.** When R2 changes, `drift-check --impact R2` lists every line, task, test and commit that cites it, including its criteria. You edit those and only those. Without IDs, an agent asked to "update for the new snooze rule" rewrites whatever looks related, and a reviewer cannot tell what was meant to change.
3. **Agents can be held to them.** An agent can be told "every task cites an R, every test names its AC", and a script can check it. "Make sure it matches the spec" cannot be checked.
4. **Coverage becomes countable.** "Every criterion has a test" is a set difference between AC IDs in spec.md and AC IDs in test names.
5. **Reviews get specific.** "T6 claims AC4 but the test asserts attempts, not the observable result" is a review comment someone can act on. "Looks fine" is not.

### Why the formats are strict

drift-check reads plain text with a handful of regular expressions. `R1` at the start of the line is a requirement. `AC1 (R1)` is a criterion mapped to R1. `- [ ] T1 ... (R1, AC1)` is a task. In plan.md, `May edit:`, `Ask first:` and `Never:` with backticked globs are the action boundaries. Change the shape of these lines in your templates and the checks go quiet. Everything else in every artifact is free text.

## Namespaced IDs: two features, one repo

Every feature numbers from `R1` and `AC1`. With one feature that is fine. With two, a test named `AC1: …` could prove either one, and drift-check would count it for both.

A prefix fixes that. One line in spec.md:

```
ID prefix: REM
```

Now the feature owns `REM-R1`, `REM-AC1` and `REM-T1`. Inside its own docs (spec, plan, tasks, stories) a short `R1` still means `REM-R1`, so the files stay readable. Everywhere else, the full ID is required:

```
test          test('REM-AC3: snooze 4 h sends one follow-up', ...)
commit        REM-T4 (REM-R2): skip snoozed tasks
other plan    Reuses the scheduler from REM-R1.          (a cross-feature citation)
```

Rules drift-check enforces:
- prefixes are 2 to 8 capitals or digits, starting with a capital, and unique in the repo;
- a spec may only define IDs with its own prefix;
- once any feature has a prefix, a short `AC1` in a test or commit is stale unless an unprefixed feature defines `AC1`;
- a full ID from another feature is a legitimate citation in plan, tasks or stories, as long as that feature defines it;
- `requireIdPrefix: true` in `.ainf.json` makes a spec without a prefix a problem.

Prefixes are opt-in. A repo with none behaves as before, and if two unprefixed features share an ID, drift-check prints a note naming them. **Pick the prefix before tests and commits cite the IDs.** Changing it later is a rename across every citation, which is exactly the kind of edit IDs exist to avoid.

## Stories: backlog keys on the thread

Teams plan in a tracker: Jira, Azure Boards, GitHub issues. The tracker owns a story's key, status, estimate and sprint. The repo owns what the story means. `docs/<feature>/stories.md` joins them, one line per story:

```
- PAY-123 Reminder per owner (R1, AC1)
- PAY-124 Snooze (R2)
```

A story that cites only a requirement covers all of that requirement's criteria. Cite the ACs when a story delivers part of one. `drift-check --stories` prints a row per story: the requirements it covers, how many of its criteria have a test, the tasks that cite its IDs, and how many commits name its key. It fails when a story names no ID, a key appears twice, or a requirement belongs to no story. `/ainf:stories` writes the file and reads the report with you.

The point is to make "is PAY-123 done?" a question the repo can answer with evidence, instead of a status someone dragged across a board.

## Drift: when the artifacts stop telling the truth

Drift is any gap between what the artifacts say and what the system does. It comes in two kinds.

**Reference drift** means the IDs no longer line up:
- a task or test cites `R7`, which no longer exists (stale ID);
- a requirement that no task cites, so nobody is building it;
- a criterion with no test, so nobody has proved it;
- a task with no requirement, which is work nobody asked for;
- a commit to code that names no task;
- a file changed outside the plan's action boundaries.

**Meaning drift** means the IDs line up but the content does not:
- the test named `AC4` asserts the retry count, while AC4 promises "no duplicate email";
- the code handles time zones with a fixed UTC offset, while the spec's definition says IANA zone;
- the spec says one thing, a hotfix made the code do another, and nobody updated the spec.

### Why drift matters more with agents

An agent reads the files at the start of every session and treats them as true. A spec that lies is worse than no spec, because the next agent will confidently build on the lie. Agents also produce code fast enough that a human can no longer keep the whole picture in their head, so drift that used to surface in a stand-up now surfaces in production.

The rule that stops it: **fix the earliest artifact that is wrong.** If the code is right and the spec is wrong, change the spec through a change request, then the plan, the tasks and the tests, in that order. Never patch the code and leave the spec behind.

## drift-check: what it checks and what it cannot

[`scripts/drift-check.mjs`](../plugins/ainf/scripts/drift-check.mjs) is plain Node with no dependencies. Init copies it into each project so the git hooks and CI run the same file.

| Mode | When | Fails on |
|---|---|---|
| `node scripts/drift-check.mjs` | pre-commit hook, during development | stale IDs, uncovered requirements, tasks without a requirement, staged files outside the action boundaries. Untested criteria are only a note. |
| `--run-tests` | pre-commit hook | runs `testCommand` from `.ainf.json` first |
| `--commit-msg <file>` | commit-msg hook | a commit touching code whose subject has no `T# (R#)` |
| `--base main` | CI on pull requests | same as dev mode, over every file changed since `main` |
| `--complete` | before calling a feature done, at Gate 5 | all of the above, plus every criterion and requirement must have a test |
| `--impact R2[,AC7]` | change requests | nothing. It prints every line, task, test and commit that cites the IDs. Use full IDs (`REM-R2`), or short ones with `--feature`. |
| `--stories [--csv]` | sprint review, `/ainf:stories` | a story with no ID, a duplicate key, a requirement no story covers. Prints coverage per story. |
| `--feature docs/<name>` | any mode | limits the run to one feature. Every spec is still read, so citations of other features' IDs resolve. |

Folders under `docs/` whose names start with `_` (such as `docs/_templates/`) are not features and are skipped.

**What it cannot do:** judge meaning. It knows a test named `AC4` exists. It does not know whether the test proves AC4. That part is the job of `/ainf:drift-review`, which dispatches the read-only `spec-reviewer` agent to compare code and tests against what the artifacts say, and of the human at Gate 5. Use the script for the cheap, mechanical half every commit, and the review and the person for the expensive half at the gates.

### Fixing what it reports

| Report | Usual fix |
|---|---|
| `cites R7, not defined in spec.md (stale ID)` | the requirement was removed or renumbered: update the citation, or restore the requirement via a CR |
| `R3 is in spec.md but no task cites it` | add a task, or move R3 out of scope in spec.md (with approval) |
| `T5 names no requirement` | cite the requirement it serves, or ask why the task exists |
| `AC4 ... no test cites it` (`--complete`) | write the test, named after the criterion |
| `outside plan.md's action boundaries` | revert, or update plan.md's boundaries with approval |
| `needs human approval (plan.md: Ask first)` | get approval, then rerun with `AINF_APPROVED=<file>` |
| commit-msg rejected | `T3 (R1): what changed`, or `REM-T3 (REM-R1): …` with a prefix |
| `R1 ... defined in docs/a, docs/b` (note) | add an `ID prefix:` line to each spec.md, then use full IDs in tests and commits |
| `ID prefix X is declared by ...` | give one of the features a different prefix |
| `no story in stories.md covers it` | add the requirement to a story, or create one in the tracker |

## Guidance vs enforcement

CLAUDE.md and the skills are **guidance**: the agent usually follows them, and sometimes does not. Anything that must always hold needs an **enforcement** layer that does not depend on the agent's cooperation.

| Layer | Example | Who can bypass it |
|---|---|---|
| CLAUDE.md, skills | "one task per commit", "test first" | the agent, by forgetting |
| Permissions (`.claude/settings*.json`) | deny `git push`, ask before editing migrations | the user, by changing settings |
| Git hooks | pre-commit runs tests and drift-check | anyone with `--no-verify` |
| CI | drift-check `--base main` on every pull request | nobody, once it is a required check |
| Branch protection | required reviews and checks on `main` | repo admins only |

Put each rule in the lowest layer that is enough for its risk. Also state it in CLAUDE.md, so the agent knows why it was blocked.

## Proportionate rigour

Not every change needs every artifact. `/ainf:triage` rates a change on blast radius, sensitivity and reversibility, and names the tier: a typo needs a task line and Gate 5; a payment flow needs the full chain and a named approver per gate. The IDs and drift-check apply at every tier, because they cost seconds.
