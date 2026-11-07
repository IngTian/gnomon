---
description: Close current chapter sprint — write retro to Plan.md, auto-fire /backlog cleanup, push branch, open PR to main.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite, Task
---

You are `/plan:close`. Close the current chapter sprint: verify all planned learn days are accounted for, write a chapter retro into `Plan.md`, auto-fire `/backlog` for a cleanup pass, commit, push the sprint branch, and open a PR to main. **Do not merge** — the user reviews and squash-merges manually.

There is no `STATE.md` in the new model. The sprint branch name (`sprint-<plan-slug>`) and the current chapter section in `Plan.md` together are the container.

# 1. Verify branch state

```bash
current="$(git rev-parse --abbrev-ref HEAD)"
case "$current" in
  sprint-*) ;;
  *)
    echo "error: /plan:close must run on a sprint-<plan-slug> branch; currently on $current."
    echo "  Switch to the chapter's sprint branch and re-run."
    exit 1
    ;;
esac

plan_slug="${current#sprint-}"
```

Working tree clean: `git status --short` must be empty. If dirty, stop and ask the user to commit or stash before closing.

# 2. Verify all planned learn days are accounted for

Read `Plan.md`. Locate the section for this chapter (heading mentions `<plan-slug>` or matches the `sprint-<plan-slug>` branch).

Inside the chapter section, find the learn-day status table (or day list). Each row should be marked one of:
- ✅ done
- ⏭ retired / dropped (with a one-line reason in the row)
- 🔁 deferred to next chapter (explicit, with target sprint named)

If any row is still ⏳ in-progress or unmarked:

```
Found <N> learn day(s) not marked done / retired / deferred:
  - <row text>
  - <row text>

Cannot close until each is resolved. Options per row:
  (a) mark ✅ done
  (b) mark ⏭ retired and give a reason
  (c) mark 🔁 deferred and name the target sprint
  (d) cancel /plan:close — finish the work first
```

Use `AskUserQuestion` to resolve each unresolved row. Apply the user's marks to `Plan.md` before continuing.

# 3. Compose the chapter retro

Read the chapter section of `Plan.md` plus the per-learn-day rows / journal entries written during the sprint (found inline under the chapter).

Compose a retro block in this shape:

```markdown
## Chapter close — <plan-slug> (<YYYY-MM-DD>)

**Concepts landed:** <comma-list of concept-note titles, with [[wiki-links]] when they're vault notes>

**Sources consumed:** <lecture decks / book sections actually worked through, with pages, e.g. "<Course> Lecture 5 slides pp.5–12; <Book> §4.1–4.2">

**Drills run:** <count by kind, e.g. "12 kind-2 reps (8 clean, 3 partial, 1 fail), 4 kind-3 weakness reps, 6 kind-4 maintenance pulls, 7 kind-1 concept-tied compute-bracket runs">

**Patterns surfaced:** <named recurring slips that got promoted to (3) weakness drills during the sprint, with brief one-line trace each>

**Open threads:**
- <deferred concept that didn't land — name it, say what blocked it>
- <weakness still recurring — name the pattern, point at its Backlog.md row>
- <retired session — name it, brief reason>
- <follow-up that belongs in the next chapter — name it explicitly>
```

Be concrete: cite specific concept titles, pattern names, drill artifacts. Do **not** manufacture findings to fill space — if a section is empty (e.g. no patterns surfaced), drop the section entirely rather than padding.

The retro is **observational, not evaluative.** Do not grade the sprint, score the user, or compare against an external target benchmark. Describe what happened.

# 4. Append retro to Plan.md

Append the retro block to the end of the chapter's section in `Plan.md` (after the learn-day table / journal entries, before the next chapter section if any). Use `Edit` so existing chapter content is preserved character-for-character.

# 5. Auto-fire /backlog cleanup

Before opening the PR, auto-fire `/backlog` once as part of the close ritual. This is one of `/backlog`'s documented auto-fire trigger paths (chapter-close cleanup) — not user-invoked from chat. The intent is a final cleanup pass:

- Stale-row scan across `Schedule.md`, `Backlog.md`, `Maintenance.md`.
- Recurring-pattern detection — anything that fired ≥2 times during this sprint and isn't yet a (3) drill.
- Vocabulary cleanup — flag any unused terms added this sprint.
- Bucket exemplar swaps in `Backlog.md § Open weakness patterns` if any pattern accumulated a 6th qualifying failure.
- New-content promotion — `Backlog.md § Newly-learned content` items added during this sprint that haven't seen a rep #1 yet.
- Lifecycle audit — items eligible for graduation / demotion / promotion that inline surfacing missed.

Invoke via the `Task` tool, passing the slash-command instruction:

```
Task tool, subagent_type: general-purpose
prompt: Run /backlog as a chapter-close cleanup pass. Surface findings as proposals; apply edits the user approves. Pay specific attention to anything that surfaced during sprint <plan-slug>. Report the surfaced items + applied edits at the end.
```

If `/backlog` produces material file edits, fold them into the same commit as the retro (next step). If it surfaces only proposals the user wants to defer, log them under `Open threads` in the retro before committing.

# 6. Commit retro on sprint branch

```bash
git add Plan.md
# Plus any files /backlog touched in step 5 — add explicitly by name, never `git add -A`.
git add Drills/Schedule.md Drills/Backlog.md Drills/Maintenance.md 2>/dev/null || true

git commit -m "$(cat <<'EOF'
chore: close sprint <plan-slug> — chapter retro + backlog cleanup

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

Substitute `<plan-slug>` with the concrete value (no literal angle-bracket text in the commit message).

# 7. Push the sprint branch

```bash
git push -u origin "sprint-$plan_slug"
```

# 8. Open PR to main

Compute the body inputs from the retro you wrote and the sprint's commit log:

- `concepts_landed` — line-list, one concept per line.
- `drills_run` — kind-by-kind counts.
- `patterns_surfaced` — named patterns with one-line traces.
- `open_threads` — deferred / retired / next-chapter items.

PR title format: `<chapter>: <short summary>` (e.g. `<Chapter / Module / Source>: <key concepts>`). Keep title under ~70 chars; details go in the body.

```bash
gh pr create --base main --head "sprint-$plan_slug" \
  --title "<chapter>: <short summary>" \
  --body "$(cat <<EOF
## Concepts landed

<bulleted list, one concept per line, [[wiki-link]] form for vault notes>

## Drills run

- Kind 1 (concept-tied compute bracket): <count> runs across <category-list>
- Kind 2 (newly-learned reps): <count> reps, <pass>/<partial>/<fail>
- Kind 3 (weakness drills): <count> reps on <pattern-list>
- Kind 4 (maintenance pulls): <count> random retrievals

## Patterns surfaced

<bulleted list of named recurring slips promoted to (3) this sprint, with one-line trace each. Omit section if none.>

## Open threads

<bulleted list — deferred concepts, weakness still recurring, retired sessions with reason, follow-ups for next chapter. Omit section if none.>

## Test plan

- [ ] Open each new concept note in Obsidian; verify intuition / examples render
- [ ] Spot-check wiki-links resolve
- [ ] Verify Plan.md chapter section + retro match what landed
- [ ] Verify Drills/{Schedule,Backlog,Maintenance}.md are consistent post-cleanup

Generated with Claude Code.
EOF
)"
```

The body should land in the ~30-50 line range. If it's running short because a section legitimately had nothing, drop the section rather than padding. If it's running long, tighten the prose — concepts and patterns are the load-bearing parts; trim drill counts to one line each.

# 9. Report

```
Sprint sprint-<plan-slug> closed.
  Branch: sprint-<plan-slug>
  PR: <URL from gh output>
  Concepts landed: <N>
  Patterns surfaced: <N>
  Open threads: <N>

I did not merge. Review the PR and squash-merge with:
  gh pr merge --squash <PR-number>
```

# 10. Constraints

- **Do not merge the PR.** Per project workflow, opening is enough — the user reviews and runs `gh pr merge --squash` themselves.
- **Do not delete the sprint branch.** It survives until the PR is merged.
- **No `STATE.md` work.** The new model has no `STATE.md`. The retro section in `Plan.md` plus the merged PR is the durable closure record.
- **Auto-firing `/backlog` is required**, not optional — chapter close is the natural cleanup boundary, and skipping it lets stale state pile up across sprints.
- **One concept per commit** discipline is for in-sprint work; the retro commit at close is a single chore commit and that's expected.
- **Never auto-delete vocabulary or drill artifacts** during the auto-fired `/backlog`. Surface, propose, apply on user confirm — same rule as standalone `/backlog`.
- **Never skip hooks** (`--no-verify`, `--no-gpg-sign`). If the pre-commit hook fails on the retro commit, fix the underlying issue and re-commit. The hook's wiki-link resolver covers vault-root files (including `Plan.md` and `Note Standard.md`), so retro links should resolve cleanly.
