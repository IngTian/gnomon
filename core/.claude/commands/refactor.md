---
description: Vault-wide refactor — scan Concepts/, Drills/, .claude/commands/, CLAUDE.md, scripts; flag size/placement/orphan/drift issues; propose changes per-item; apply on claude/refactor-<date>.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite
---

You are `/refactor`. Scan the vault for structural drift across all tracked content, propose changes per-item, and apply accepted proposals on a `claude/refactor-<YYYY-MM-DD>` branch.

Run it when the system itself drifts: workflow commands fall behind actual behavior, drill artifacts retire, vocabulary accumulates dead entries, CLAUDE.md duplicates content across files, etc. Concepts-folder restructuring is a primary use case but not the only one.

# 1. Scan the vault

Run signals in parallel where possible. Group findings by category.

## 1a. Concepts/ — structural

For `Concepts/`:

1. **Folder size.** Count `.md` files per subfolder (recursive). Flag folders with >10 notes as candidates for subfolder splits. Report counts.
2. **Topic-tag/folder mismatch.** For each note, compare `#Topic/` tag in `[!info]` brief to folder path. Mismatch = flag.
3. **Property placement.** Each `#Type/Property` note must live under a `Properties/` subfolder of its host. Notes outside that pattern = flag.
4. **Orphans.** Notes with zero incoming and zero outgoing wiki-links. Informational only — surface but don't propose moves automatically.
5. **Weak cohesion (judgment).** Folders with ≥5 notes: scan titles + briefs. If the notes appear to span two distinct subtopics, flag with a suggested split. LLM-judgment, not a mechanical rule — surface as a proposal.

## 1b. Drills/ — structural and content

For `Drills/`:

1. **Stale weakness patterns.** `Drills/Backlog.md` § Open weakness patterns: rows whose `Last Surfaced` date is >60 days ago. Candidates for retirement. (These ops largely overlap with `/backlog` aggregation; `/refactor` flags them as drift signals at the structural level — fixing usually means invoking `/backlog`.)
2. **Synonym patterns.** Two pattern rows in `Drills/Backlog.md` § Open weakness patterns whose names look semantically equivalent (synonym, plural/tense variant). Candidates for merge via `/backlog`.
3. **Stale artifacts.** `Drills/<Topic>/<Title>.md` whose latest rep entry is >60 days old. Candidate for retirement (or move to `Drills/Maintenance.md` if the proof has been consolidated).
4. **Vocabulary cleanup.** `Drills/Vocabulary/Techniques.md` and `Error Types.md`: terms that haven't been used in any current artifact's frontmatter or any pattern row in `Drills/Backlog.md`. Candidates for removal via `/backlog`.
5. **Schedule drift.** `Drills/Schedule.md`: rows whose next-rep target is overdue by >2 weeks. Candidates for retirement or rep-now.
6. **Maintenance pool drift.** `Drills/Maintenance.md`: items not drawn for >6 weeks via random retrieval. Candidates for re-promotion or retirement.

## 1c. Workflow commands — drift

For `.claude/commands/*.md`:

1. **Stale references.** Commands referencing other commands that no longer exist (e.g. `/old-command` after it was merged into another). Flag for fixing.
2. **Behavior drift.** Commands whose described flow no longer matches what's been happening in actual sessions — surface as a candidate for spec rewrite. This is judgment-based: scan recent commit messages and recent session journals for patterns the spec doesn't cover.
3. **Description-vs-front-matter drift.** Each command has a `description:` in frontmatter — check that it still summarizes what the command body actually does.
4. **Orphan commands.** Commands not invoked anywhere in the last 30 days of git history *and* not referenced from any other command, CLAUDE.md, or README. Candidates for retirement.

## 1d. CLAUDE.md — duplication / drift

Across the three CLAUDE.md files (root, `Concepts/`, `Drills/`):

1. **Duplicated rules.** Same content text appearing in two places. Flag the duplicates; propose keeping one (the most-scoped one) and replacing the others with a one-line pointer.
2. **Topic leak.** Drill-specific or concept-specific rules that ended up in root. The separation-of-concerns rule (root CLAUDE.md) names the boundary — flag violations.
3. **Stale references.** Commands or files mentioned by name that no longer exist. Includes the slash-command index in root CLAUDE.md.
4. **Memory-vs-CLAUDE.md drift.** Memory entries in the persistent auto-memory directory that have been validated and stuck for ≥30 days are candidates for promotion into CLAUDE.md (durable rules). Conversely, CLAUDE.md rules that turned out to be wrong or churned recently are candidates for memory entries.

## 1e. Scripts and tooling

For `.py-plot/scripts/*` (if any persist between sessions — they shouldn't per the workflow doc) and other tooling:

1. **Persistent figure scripts.** `.py-plot/scripts/<Topic>/*.py` files older than 7 days. Per `.py-plot/README.md`, scripts are deleted after the figure is approved and embedded — persistent scripts are leftover. Candidates for deletion.
2. **Stale `.gitignore` entries.** Patterns referencing paths that no longer exist.
3. **Orphan assets.** PNGs under `assets/` that aren't embedded in any concept note via `![[...]]`. Informational only.

# 2. Print the diagnostic report

Group by section (Concepts, Drills, Commands, CLAUDE.md, Scripts). Each item gets a one-line description with category prefix. Example:

```
=== Concepts/ ===

Folder size:
  Concepts/<Topic A>/<Subtopic>/ — 12 notes (candidate for split)
Topic-tag/folder mismatch:
  Concepts/<Topic B>/<Note>.md is tagged #Topic/<Topic A>
Property placement:
  Concepts/<Topic A>/<Host>/<Property>.md is #Type/Property but not under Properties/
Orphans (informational):
  Concepts/<Topic C>/<Isolated Note>.md — no in/out wiki-links
Cohesion suggestions (judgment):
  Concepts/<Topic A>/<Subtopic>/ splits naturally into two sub-themes.

=== Drills/ ===

Stale weakness patterns:
  Drills/Backlog.md → sign-convention-slip (last surfaced 2026-03-15, candidate for retire via /backlog)
Synonym patterns:
  Drills/Backlog.md → "epsilon-delta-discontinuity" and "eps-delta-failure" — looks redundant (merge via /backlog)
Vocabulary cleanup:
  Vocabulary/Techniques.md → "<technique-slug>" — never used in any artifact frontmatter

=== Commands ===

Stale references:
  drill.md → references "/old-command", which doesn't exist
Behavior drift:
  session/rep.md Phase 3 references "/old-command-a" + "/old-command-b" instead of the unified /drill

=== CLAUDE.md ===

Duplicated rules:
  Drill methodology paragraph in root and Drills/CLAUDE.md — keep Drills/CLAUDE.md, slim root.
Stale references:
  README.md → references /old-command-a, /old-command-b

=== Scripts ===

Persistent figure scripts:
  .py-plot/scripts/<Topic A>/<figure>.py — 9 days old, candidate for deletion
```

If all sections are empty, say so explicitly: "No drift detected. Vault looks clean." and stop. No branch checkout.

# 3. Propose changes per-item

For each flagged item with a concrete action (skip orphan-informational and cohesion-only), ask the user via `AskUserQuestion` — **one proposal at a time**.

```
Proposal 1/N: Concepts/<Topic B>/<Note>.md is tagged #Topic/<Topic A>.
  Options:
  (a) Move to Concepts/<Topic A>/ and retag.
  (b) Update tag to #Topic/<Topic B>, keep location.
  (c) Skip for now.
```

Accumulate accepted proposals. Skipped or declined proposals are logged to the report but not applied.

If the user accepts zero proposals, print "No changes applied." and stop. No branch checkout.

# 4. Apply accepted proposals

Only run if at least one proposal was accepted.

## 4a. Resolve target branch

```bash
target_branch="$(git rev-parse --abbrev-ref HEAD)"
case "$target_branch" in
  claude/refactor-*|claude/restructure-*)
    echo "error: /refactor must be invoked from a non-workflow branch (currently on $target_branch). Switch to your sprint, session, or feature branch first."
    exit 1
    ;;
esac
```

## 4b. Checkout the work branch

```bash
today="$(date +%Y-%m-%d)"
work_branch="claude/refactor-$today"
if git show-ref --verify --quiet "refs/heads/$work_branch"; then
  git checkout "$work_branch"
else
  git checkout -b "$work_branch"
fi
```

## 4c. Apply each accepted proposal in order

Common operations by category:

| Category | Operation |
|---|---|
| Folder split | `mkdir -p Concepts/<Topic>/<Subfolder>` then `git mv` notes |
| Move to different topic | `git mv` and update `#Topic/` tag |
| Fix Property placement | `mkdir -p Concepts/<Host>/Properties` then `git mv` |
| Pattern retirement | edit `Drills/Backlog.md` § Open weakness patterns (or invoke `/backlog`); `git rm` exemplar artifacts if their signal is gone |
| Pattern merge | edit `Drills/Backlog.md` § Open weakness patterns (or invoke `/backlog`); sum failures, merge exemplar lists; vocab change if needed |
| Stale artifact retirement | move to `Drills/Maintenance.md` *or* `git rm` if abandoned |
| Vocab cleanup | edit `Drills/Vocabulary/Techniques.md` or `Error Types.md` |
| Stale command reference | `Edit` the command file |
| CLAUDE.md duplication | replace the duplicate with a one-line pointer to the canonical |
| Persistent figure script | `rm` (gitignored, no commit needed) |

## 4d. Commit each proposal as its own commit

One proposal = one commit. Clear messages:

```bash
git commit -m "refactor(concepts): move <Note> to Concepts/<Topic A>/"
git commit -m "refactor(drills): retire stale bucket epsilon-delta-discontinuity"
git commit -m "refactor(commands): fix /drill stale /old-command reference"
git commit -m "refactor(claude.md): slim root drill methodology, point at Drills/CLAUDE.md"
```

The pre-commit hook still vault-lints staged concept notes for shape on every branch.

## 4e. Squash-merge into target

```bash
git checkout "$target_branch"
git merge --squash "$work_branch"
git commit -m "refactor: <one-line summary of N applied proposals across <categories>>"
git branch -D "$work_branch"
```

## 4f. PR-or-stop

If `target_branch` is `main`: push. Don't auto-open a PR (the user controls PR opening per root `CLAUDE.md`'s git workflow).

If `target_branch` is not `main`: nothing else. The squash-commit is on the target branch; the user controls when that branch becomes a PR.

# 5. Report

```
Refactor session 2026-05-22: applied 5 of 9 proposals.
Branch: claude/refactor-2026-05-22 (deleted after squash).
Categories touched: concepts (2), drills (1), commands (1), claude.md (1).
Squash-commit: <SHA>.

Did not merge to main / open a PR. Review on <target_branch> and ship when satisfied.
```

# 6. Constraints

- **Per-proposal confirmation only.** Never batch-approve. The user gates every change.
- **Wiki-link safety.** All vault links are bare filenames. Moves don't need link rewriting *unless* the move also renames the file. If a rename is implied, surface a separate `AskUserQuestion` confirming the rename and warning about downstream link breakage if any folder-qualified form was used.
- **No deletes without surfacing.** Never silently `git rm`. Even when removing stale buckets / artifacts / vocab terms, the proposal must spell it out.
- **No `--no-verify`.** Vault lint failures stop the commit. Investigate and fix.
- **Don't auto-open PRs from the squash commit.** Per root `CLAUDE.md`, the user opens PRs.
- **Cohesion proposals are LLM judgment.** Frame them explicitly as such. Don't present a split suggestion as a rule violation.
