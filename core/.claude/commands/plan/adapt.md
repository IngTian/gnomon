---
description: Adapt the rolling Plan.md window — re-slot day:learn focus, retag day:learn/day:rep, add user-requested drill overrides.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite
---

# /plan:adapt — Re-slot the rolling Plan.md window

Mid-sprint reorganization, often after deferred days. Re-slot `day:learn` focus across days, reorder upcoming days, retag `day:learn` / `day:rep`, and stitch in user-requested drill overrides on specific Plan.md day rows.

This command is a **plan-shape editor**, not a drill scheduler and not a session driver. It moves rows around. It does not pull due reps automatically (that's `/session:rep` orient) and does not write today's row (that's whichever `/session:*` is running today).

## When to invoke

Trigger conditions:
- A `day:learn` got deferred — tomorrow now needs to absorb today's planned focus.
- The chapter pace shifted — later learn days (e.g. L4–L10) need re-spreading.
- User wants a specific drill scheduled on a specific rep day next week (e.g. "drill <concept A> on Wed").
- Multi-day overflow — content stacking up on later days, want to pull some forward.

Anti-patterns:
- "Pull all overdue items into today" — that's `/session:rep` orient, with today's user in the loop.
- "Update what just happened" — that's `/session:*` wrap-up.
- "Run a drill" — that's `/drill` or `/session:rep`.

## Row ownership rule

| Row date | Owner |
|---|---|
| Today | `/session:*` wrap-up (learn / rep) |
| Any other day in the rolling window | `/plan:adapt` |

`/plan:adapt` refuses to edit today's row. If user asks for a today-row change, redirect to the appropriate `/session:*` command.

## Phases

### Phase 1 — Branch check

Verify on the active sprint branch. Refuse on `main`.

```bash
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "main" ]; then
  echo "Refuse: /plan:adapt edits a sprint's plan; main has no active sprint."
  exit 1
fi
case "$branch" in
  sprint-*) ;;
  *) echo "Warning: branch '$branch' is not a sprint-* branch. Confirm before proceeding." ;;
esac
```

If the branch is `claude/refactor-*` or any other non-sprint branch, surface a warning and ask the user whether to continue. Don't auto-abort — they may intentionally be adapting from a side branch.

**Orrery (optional).** If the `orrery` MCP server's tools are available, take `started_at` now (root `CLAUDE.md` § Workflow → Optional: orrery); Phase 6b keys requests with it. Without the tools, skip every orrery step below.

### Phase 2 — Read state

Pull the current planning surface:

1. **`Plan.md`** — rolling 14-day view. Note the `Last updated` line, the `Active sprint` line, the `Horizon`, and walk through every day row inside the horizon.
2. **`Drills/Schedule.md`** — § Active proof drills (target dates per row), § Computational reflex categories (last-run dates per row).
3. **`Drills/Backlog.md`** — § Newly-learned content backlog (kind 2 untouched), § Open weakness patterns (kind 3 candidates).
4. **`Drills/Maintenance.md`** — for awareness only; this command does not slot maintenance items.
5. **orrery** (if its tools are available) — `week(<subject>)`, this vault's blocks for the week with `>` on today, and `channel(<subject>)`, its unacknowledged outcomes and pending requests.

Read fully before doing anything else. Don't ask the user questions while still loading state.

### Phase 3 — Detect issues

Run a structural pass over the loaded state. Issues to flag:

- **Overdue items >1 week** in `Schedule.md` § Active proof drills — target date is more than 7 days behind today.
- **Double-booked `day:learn` days** in `Plan.md` — two distinct concepts / heavyweight focuses slotted into the same learn day (the cap is 1–2 concepts).
- **Kind-2 items aging >2 weeks untouched** in `Backlog.md` § Newly-learned — never had rep #1 scheduled.
- **Empty learn days inside the horizon** — tagged `day:learn` but no concept focus assigned.
- **Conflicts with the day-type model** — intake (learn) content on a rest/reorg day (`Profile.subject.md` § Weekly rhythm); a `day:rep` with no reps or recall to consolidate; a learn day carrying spaced reps or drills. **Not a conflict:** same-day cold recall and hand-running the source's own worked example on a learn day — those are intake, not reps or compute (root `CLAUDE.md` § Source-First Intake), and they never enter `Schedule.md`.
- **Learn days with no route** — a `day:learn` inside the horizon with no `Watch` / `Read` source assigned (see `/plan:create` Phase 5). `none (Claude-led)` and `backfill` are valid routes (`/session:learn` § 2a), not gaps.

Do not fix anything yet. Collect the list.

### Phase 4 — Surface state + issues

Print to chat (not whiteboard, this is short structured text):

1. **Active sprint** — branch, plan slug, sprint window from `Plan.md`.
2. **Today's marker** — today's date and which row is "today" in `Plan.md`.
3. **Horizon** — the 14-day window currently rendered.
4. **Issue list** — the detected items from Phase 3, with row references (date + day-type).
5. **orrery** (if in use) — each unacknowledged outcome (`#id` and what it gave), pending requests, and any time ask the issue list points to (overdue reps piling up, a chapter running long, a blocker).
6. **Open question** — "What do you want to adjust?" Permissive: user describes the change in chat, no rigid menu.

If the user invoked `/plan:adapt` with a freeform argument (e.g. `/plan:adapt defer <concept A> to Thu`), parse it and use it as the starting proposal — but still surface the issue list first so the user sees the broader context.

### Phase 5 — Interactive re-draft

Run a chat-based loop:

1. User describes one adjustment (e.g. "move Tue's learn concept to Wed, push Wed's concept to Thu").
2. Claude proposes the concrete row edits — exact rows touched, exact text changes — as a small markdown diff or numbered list. Don't write to `Plan.md` yet.
3. User confirms / refines / rejects.
4. On confirm, hold the edit in a TodoWrite list. Loop back to step 1 for the next adjustment.

Conventions during proposals:

- **Quote the exact existing line** when proposing a replacement, so the user can verify nothing else gets clobbered.
- **Show the new line in full** — don't show diff hunks for short rows.
- **Preserve LaTeX character-for-character.** Math text moves verbatim.
- **Don't compress two days' content into one row.** If a deferral creates double-booking, surface that immediately — "this would put <concept A> + <concept B> on the same learn day; want me to push <concept B> to Thu instead?"
- **Re-check prerequisites on every re-slot (mandatory — root CLAUDE.md "Plan prerequisites explicitly").** Moving a concept earlier, or into a tighter window, can strand it *ahead of a prerequisite* that was fine in the original order. Before confirming any re-slot that pulls a concept forward, verify its prerequisites still land first; if the move would schedule a concept over a `missing` or `unsure` prerequisite, **flag it and ask** ("pulling <concept A> to Tue puts it before the <foundation prereq> foundation — do you have that, or should it go first?") rather than silently applying. An unmeetable re-slot is as harmful as an unmeetable plan — a missed concept whose prerequisites weren't confirmed is the plan's error, never the user's.
- **Re-slot by source segment when that's the natural unit.** A lecture split across learn units can be re-cut (e.g. "move the second half of the <Lecture> deck to Thu"); carry the route's deck/pages with the concept so the row stays routed.
- **Drill overrides go inline, and only onto a `day:rep`.** When user says "drill X on Wed", the target day must be a rep day; the new row text reads `Rep override: [[X]] (user) + due reps`. The override is explicit, not implicit. Never schedule a drill onto a `day:learn` — learn days carry no reps.
- **Retag on explicit direction only.** Edits are scoped to the bullet content under each day's heading. The day's **type tag** (`### Tue 2026-06-02 — day:rep`) only changes if the *kind* of day changes (`day:learn` ↔ `day:rep` ↔ rest/reorg) — this retag is `/plan:adapt`'s to make, but only on explicit user direction; don't flip a day's type silently.
- **With orrery, match its day assignments.** If the learner runs orrery (an optional companion that allocates days across vaults) and the `orrery` MCP server's tools are available, propose against the `week` read in Phase 2: learn days go on the days its week gives this vault, rep days on its rep days. Without the tools, re-slot as usual.
- **With orrery, a front asks for time with a request**, not by re-slotting onto days its week doesn't give this vault. A proposal can be `file request: <kind>, ±<sessions>, by <date>, <why>` (`by` optional), confirmed like any row edit; Phase 6b files it and orrery holds it for the learner to approve.

If the user proposes something that conflicts with the day-type model in `Drills/CLAUDE.md` § Day rhythm (e.g. intake content on a rest day, three concepts on one learn day, a drill on a learn day), push back once — quote the rule, ask if they want to override anyway. Don't lecture; one sentence and the question.

### Phase 6 — Apply edits

Once the loop ends (user says "that's all" or equivalent), apply every confirmed edit to `Plan.md` via `Edit` tool calls. One edit per Todo item. (A confirmed orrery request isn't a `Plan.md` edit; Phase 6b files it.)

After all edits:

1. Update the `Last updated` line at the top of `Plan.md` to today's date with a one-sentence summary of the adaptation (e.g. `2026-05-30 — adapt: pulled <concept A> rep #2 from 6/12 to 5/31, deferred <concept B> Tue→Wed`).
2. If any drill override was added, cross-reference `Drills/Schedule.md` — verify the row's target date matches what `Plan.md` now claims. If it doesn't, surface the mismatch and ask the user which file is canonical (default: `Schedule.md` is canonical for rep dates; `Plan.md` reflects them).
3. Run `git diff Plan.md` and show the user the final delta before commit.

### Phase 6b — Publish to orrery

Skip unless orrery's tools are available. These calls are routine and need no ask (root `CLAUDE.md` § Workflow → Optional: orrery):

1. **`agenda(<subject>, entries)`** — this week from `week`'s today (`>`) row on, one entry `{date, item, kind: learn}` per learn block; never a past day, no deadline entries. `date` is `YYYY-MM-DD` (`week` prints no year: take it from the sitting's day, the next year for a January day in a December week). `item` is `Plan.md`'s row for that date if one exists, else the next learn day of the `### Learn-day sequence` that hasn't landed and isn't already named by an earlier entry.
2. **`request(<subject>, text, kind, delta, key, by)`** for each request confirmed in Phase 5 — `text` is the why, `delta` the ±sessions, `by` (optional) a `YYYY-MM-DD` date with the year as in step 1, `key` is `<subject>:request:<started_at>:<n>` with n = 1, 2, … within this run.
3. **`ack(<subject>, <message_id>)`**, with the outcome line's leading `#id` (not the `request #n` inside it), for each outcome surfaced in Phase 4 that this run settled: a re-slot confirmed for it, or the learner saying none is needed (always the case for a decline).

### Phase 7 — Commit

Single commit on the sprint branch:

```
chore: adapt Plan.md — <one-line summary of adjustments>

<2-4 line bullet list of the specific re-slots, mirrors the Last updated line>
```

Examples:
- `chore: adapt Plan.md — defer <concept A> Tue→Wed, push <concept B> Wed→Thu`
- `chore: adapt Plan.md — pull <concept A> rep #2 forward to Fri day:rep`
- `chore: adapt Plan.md — re-slot learn days L6–L8 across week 2`

Do not push. Do not open a PR. The sprint stays open; the eventual `/plan:close` opens the chapter PR.

## Notes

- **No new files.** This command only edits `Plan.md`. If the user wants to retro-add a drill artifact or stub a concept note, that's a separate flow (`/concept:examples`, `/drill`, or just opening the file).
- **No silent edits.** Every row change goes through Phase 5 confirmation. The standing principle is "I surface, you decide."
- **No ledger write.** `/plan:adapt` is structural housekeeping, not a session — nothing observational lands in the progress ledger.
- **Whiteboard not used.** Adaptation is a short structured chat, not a math session. If the user wants to think through the re-slot on a whiteboard, they'll ask explicitly.
- **Idempotent re-runs.** Running `/plan:adapt` twice in one day is fine — the second run reads the now-updated `Plan.md` and proposes against that. Each commit stands alone.
