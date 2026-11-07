---
description: Create a new chapter sprint — generate a day-typed (learn/rep) plan, branch off main, append to Plan.md.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite, WebFetch
---

You are `/plan:create`. Open a new chapter sprint: turn varied source material into a **learn-day sequence** (`day:learn` / `day:rep`), branch off main, append a new chapter section to the rolling top-level `Plan.md`, commit. There is no separate plan file under `scratch/plans/`, no `STATE.md`, no per-session sub-branch — the sprint branch + the chapter section in `Plan.md` *are* the container.

# Phase 1 — Resolve the source

`$ARGUMENTS` carries the source. Treat as one of:

- A source reference — a textbook chapter, a paper, a course or lecture, notes, a video, or a topic you simply name (e.g. `"<your source>"`, `"<Source> §<x>"`) — use prior knowledge; if you don't know it, ask via `AskUserQuestion` for a table-of-contents or outline paste.
- Path ending in `.md` to a spec the user already wrote — read it.
- Free-text describing what to learn.
- Empty `$ARGUMENTS` → prompt with `AskUserQuestion` for one of the above.

Do NOT silently fabricate a chapter ToC.

**Identify the candidate source(s) (root `CLAUDE.md` § Source-First Intake).** New material comes from a curated source; each learn day gets its route in Phase 5, so here only identify the candidates and check they exist (`WebFetch` on the course page, or the book PDF in `docs/`). Prefer a **lecture** when a good one exists; fall back to the **textbook section** otherwise. When routes are assigned (Phase 5), cite the deck title plus the page range of the specific slide PDF you fetched, and name the recording year when the published decks and the videos differ (e.g. older recordings vs current slides). Book routes cite section plus pages (the PDF is usually in `docs/`). Timestamps only if the learner logs them. Never fabricate slide numbers, pages, or timestamps — if you can't verify, ask.

# Phase 2 — Verify no active sprint exists

A sprint is "active" if either condition holds:

1. **A `sprint-*` branch exists ahead of main.** Check via:

   ```bash
   for b in $(git branch --list 'sprint-*' --format='%(refname:short)'); do
     ahead=$(git rev-list --count "main..$b" 2>/dev/null || echo 0)
     [ "$ahead" -gt 0 ] && echo "$b ($ahead commits ahead)"
   done
   ```

2. **`Plan.md` has an open chapter section without a `✅` close marker.** Scan top-level chapter headings; the active one is referenced from the `> [!info]` block as `**Active sprint:** ...`.

If either signal fires, refuse: surface the active sprint's branch + chapter title, then `AskUserQuestion`: (a) Run `/plan:close` first → print `Run /plan:close, then re-invoke /plan:create.` and stop (do NOT auto-invoke `/plan:close` — user reviews retro before next chapter), (b) Cancel → stop with no changes.

# Phase 3 — Verify on main + working tree clean

```bash
current="$(git rev-parse --abbrev-ref HEAD)"
if [ "$current" != "main" ]; then
  echo "error: /plan:create expects to be on main (currently on $current). Switch to main first."
  exit 1
fi
if [ -n "$(git status --short)" ]; then
  echo "error: working tree dirty. Commit or stash before /plan:create."
  exit 1
fi
```

Surface either error to the user and stop — do NOT auto-switch or auto-stash.

# Phase 4 — Identify topic + plan slug

Infer the top-level topic folder under `Concepts/` from the subjects in `Profile.subject.md` § The field and its subjects and the folders already under `Concepts/`; if ambiguous, or the source fits no existing topic, `AskUserQuestion` (a new topic gets a new top-level folder).

Compute a plan slug: lowercase, hyphenated, no spaces or special chars, **no date prefix**. Examples: "<Textbook> Ch.<N>" → `<textbook>-<n>`; "<Source> §<x> — <Topic>" → `<source>-<x>-<topic>`; "<Paper / Course / Lecture> — <Topic>" → `<source>-<topic>`. The slug feeds the branch name (`sprint-<plan-slug>`) and the `Plan.md` section heading.

# Phase 5 — Generate the learn-day sequence

The chapter plan is a **dependency-ordered sequence of learn days** (`day:learn`), each followed by a rep day (`day:rep`) that consolidates it (on orrery's schedule when orrery is in use; root `CLAUDE.md` § Workflow). Draft the learn days. Calibration:

- **Each learn day covers 1–2 concepts** (prefer 1 for a hard proof; pair only small, tightly-linked concepts). This is the intake cap — do not pack three.
- **Each learn day carries a route** — `Watch` (lecture deck + PDF pages + recording) and/or `Read` (book section + pages), resolved and verified here from the Phase 1 sources (WebFetch the deck / check the pages). Size by lecture segment: one 75–80 min lecture is typically **2–3 learn units**; the 1–2 concept cap still binds. A second source gets a named job (e.g. "which hypothesis does <Book B> add that <Book A> skips?"), not a full re-read.
- Time budget per learn day: **~2 sessions** (see the day-type model in `Drills/CLAUDE.md` § Day rhythm).
- Big concepts (theorems with substantial proof, multi-part algorithms) get a learn day of their own.
- Order respects dependencies — never schedule a concept before its prerequisites in the same plan.
- **Do not enumerate or date the rep days.** Each learn day is followed by a `day:rep` consolidation day, but rep days are **event-driven** — `/session:rep` writes the rep day's row when it runs; the plan is the *intake sequence*, not a dated calendar. This keeps the plan thin (root `CLAUDE.md` / `Plan.md` planning principle).
- Learn days carry **no drill counts** — reps happen on the following rep day. Per concept, instead note the *techniques its later reps will target* (a "reps will drill" hint), not a number.
- Use `find Concepts -iname '<title>.md'` to check whether referenced concept notes already exist; flag stubs to create per learn day.

**Prerequisite pass (mandatory — root CLAUDE.md "Plan prerequisites explicitly").** Before surfacing the draft, for **each concept** list its prerequisites and classify each one:

- **owned** — an existing concept note (`find Concepts -iname '<prereq>.md'` hits) or a session earlier in *this* plan that lands it;
- **missing** — no note, not scheduled → it must become its own earlier session/step, or a flagged blocker;
- **unsure** — you cannot tell from the vault whether the learner actually has it (especially foundational prerequisites: upstream mechanics, core computation reflexes, deep structural background the vault doesn't record).

**For every `unsure` prerequisite, ask the learner directly via `AskUserQuestion` before finalizing the plan** — do not assume it's present. **Never schedule a concept whose prerequisites are `missing` or unconfirmed-`unsure`**: either insert the prerequisite as an earlier session or surface it as a blocker. Remember each advanced concept tends to fan out into 2–4 foundation prerequisites; that fan-out *is* part of the plan, not a surprise (see the learner's planning calibration in `Profile.psych.md`). A plan that hides a prerequisite inside a one-line concept is unmeetable, and an unmeetable plan is actively harmful — surface every prerequisite up front.

Surface the draft to the user as a table with an explicit **Prereqs** column (mark each `✓owned` / `⚠missing` / `?ask`):

```
Learn-day sequence for <plan-slug>  (each learn day → a rep day, event-driven):

| #  | Topic (1–2 concepts)     | Watch                          | Read                 | Note(s)                  | Prereqs                             | Reps will drill |
|----|--------------------------|--------------------------------|----------------------|--------------------------|-------------------------------------|-----------------|
| L1 | <concept 1>, <concept 2> | <deck> pp.<a–b> (<rec. year>)  | <book> §<x> pp.<a–b> | [[<Concept 1>]], ...     | ✓ <owned prereq>, ? <unsure prereq> | <computations>  |
| ...|                          |                                |                      |                          |                                     |                 |
```

Then `AskUserQuestion`: (a) Looks good — write it, (b) Needs revision — describe what (iterate), (c) Cancel — stop with no changes (no branch, no commit, no `Plan.md` edit). If any `?ask` prerequisites remain, resolve them in this AskUserQuestion round first — don't write a plan with unconfirmed prerequisites.

# Phase 6 — Branch off main

```bash
sprint_branch="sprint-<plan-slug>"
git checkout -b "$sprint_branch"
```

No date prefix — one sprint per chapter, slug carries identity.

# Phase 7 — Append chapter section to Plan.md

`Plan.md` is the rolling top-level plan at vault root. If it doesn't exist yet (a fresh vault), create it first:

```markdown
# Plan

> [!info]
> **Last updated:** <YYYY-MM-DD> — plan started
> **Active sprint:** none
```

Read it, then append a new chapter section *below* existing content (do NOT clobber prior chapters — the file accumulates as a journal).

Update the `> [!info]` block at the top: `**Last updated:**` → today + short note ("new chapter `<plan-slug>` opened"); `**Active sprint:**` → new chapter title, plan slug, branch.

Append the new section just before `## Journal` if one exists, else at end-of-file:

```markdown
## Chapter: <Plan Title>

**Source:** <verbatim source description>
**Branch:** sprint-<plan-slug>
**Started:** <YYYY-MM-DD>
**Status:** active
**Topic folder:** Concepts/<Topic>/<Subfolder>/

### Learn-day sequence

Each learn day (`day:learn`) is followed by a rep day (`day:rep`, consolidation) — **event-driven** (on orrery's schedule when orrery is in use), tagged on the actual day's row by `/session:rep` when it runs, not pre-dated here.

| # | Topic | Watch | Read | Note(s) | Prereqs | Status |
|---|-------|-------|------|---------|---------|--------|
| L1   | ...   | ...   | ...  | ...     | ...     | upcoming |
| L2   | ...   | ...   | ...  | ...     | ...     | upcoming |
| ...  |       |       |      |         |         |        |

### Learn day L1: <Title>

**Type:** `day:learn` · **Time budget:** ~2 sessions · **Status:** upcoming

**Route:** Watch <deck title> pp.<a–b> (<recording year>) · Read <book> §<x> pp.<a–b>

**Concepts to land** (in order, 1–2):
1. [[<Concept 1>]] — <one-line scope>
2. [[<Concept 2>]] — <one-line scope>

**Deliverables per concept:** note (definition/proof or derivation) **+ worked examples + connections + intuition** — all required; a learn day isn't done until these land. The content is the learner's own words (root `CLAUDE.md` § Source-First Intake): Claude may scaffold the note, propose examples/exercises and draw figures, but does not author the content.

**New stubs to create:**
- Concepts/<Topic>/<Subfolder>/<Concept 1>.md

**Existing notes to read first:**
- [[<Existing Concept>]]

**Reps will drill** (on the following rep day): <technique-1>, <technique-2>.

**Checkpoint criteria:**
- [ ] <Behavioral checkpoint>

### Learn day L2: ...

(repeat per learn day)
```

Wikilinks are **bare filenames**, no folder qualification.

# Phase 8 — Commit

Stage `Plan.md` and commit on the sprint branch using a HEREDOC for the multi-line message:

```bash
git add Plan.md
git commit -m "$(cat <<'EOF'
chore: start sprint <plan-slug>

Open chapter <Plan Title>. <N> learn days planned.
Source: <source verbatim>.
EOF
)"
```

This makes the new chapter section durable on the sprint branch and leaves the working tree clean for subsequent `/session:*` commits.

# Phase 8b — Publish to orrery (optional)

If the `orrery` MCP server's tools are available, read `week(<subject>)` and publish the agenda as `/plan:adapt` Phase 6b step 1 does (root `CLAUDE.md` § Workflow → Optional: orrery). Time asks go through `/plan:adapt`. Without the tools, skip this phase.

# Phase 9 — Report

Print branch name, plan slug, learn-day count, total time budget, confirmation that `Plan.md` was committed, the orrery agenda # if Phase 8b ran, and the next step: `/session:learn` to start learn day L1.

# Constraints

- **Do NOT** create `scratch/plans/<plan-slug>/plan.md` or any `STATE.md` — the sprint branch + `Plan.md` chapter section *are* the marker.
- **Do NOT** create per-session sub-branches; `/session:*` commit directly on the sprint branch.
- **Do NOT** generate concept stubs themselves — `/session:learn` creates stubs per-session as concepts land.
- **Do NOT** push the sprint branch (push happens at `/plan:close`) or auto-invoke `/plan:close`.
- Wikilinks are bare filenames. If you don't know a chapter in detail, ask for the section list — don't fabricate a ToC.
- **Never fabricate a route** — slide pages, book pages, and recordings are verified (Phase 5) or asked for; timestamps only if the learner logs them.
