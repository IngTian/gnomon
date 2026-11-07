---
description: Aggregation ops on drill state — stale-row scan, recurring-pattern detection, vocab cleanup, bucket exemplar swaps, new-content promotion, lifecycle audit.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite, Task
---

# /backlog

Aggregation pass over the drill ecosystem. Six operations, all surface-then-confirm,
nothing silent.

This is a **rare** command from the user's side. It's expected to fire mostly when
Claude detects a strong signal mid-flow, or auto-fired from `/plan:close` as part
of the chapter-close ritual. Explicit user invocation is the third path and the
least common.

---

## Trigger paths

1. **Explicit user invocation** — `/backlog` with no args. Full pass, all six ops
   with surfacing. Rare; usually when the user notices the system feels stale and
   wants a deliberate cleanup.
2. **Claude-detected signal** — user describes a symptom in chat ("I haven't
   touched X in forever", "is Y still relevant?", "this slip keeps happening")
   and Claude proposes `/backlog` as the right tool. Targeted pass — only the
   ops the symptom maps to.
3. **Auto-fired from `/plan:close`** — light pass at chapter end. Conservative
   surfacing: only strong signals, no judgment-call edges. The chapter-close
   PR is already cognitively heavy; don't pile on borderline cleanup.

The trigger path determines surfacing density (see § Phase 2 below).

---

## Six aggregation operations

### Op 1 — Stale-row scan

Scan every drill-state surface for entries that haven't moved in their respective
freshness window. Each hit becomes a candidate for the user to retire, re-target,
or promote.

| Surface | Stale threshold | Default proposal |
|---|---|---|
| `Drills/Schedule.md` § Active proof drills | target date >1 week overdue | re-slot or retire |
| `Drills/Schedule.md` § Computational reflex categories (kind 1) | last-run >14 days | bump to the compute bracket of a /session:rep |
| `Drills/<Topic>/<Pattern Name>.md` rep logs (kind 3) | no rep activity >3 weeks | retire pattern, demote to inline note, or pull into next /session:rep |
| `Drills/Maintenance.md` (kind 4) | not drawn >6 weeks | force-pull into next /session:rep cooldown OR retire if user judges reflexed |
| `Drills/Vocabulary/Techniques.md`, `Drills/Vocabulary/Error Types.md` | term unused (no artifact references) >3 months | see Op 3 (vocab cleanup) |
| `Drills/Backlog.md` § Newly-learned content backlog (kind 2 untouched) | aging >2 weeks since landed | see Op 5 (new-content promotion) |

**For each hit:** AskUserQuestion with three options — **retire**, **re-target**
(propose specific new date or session block), **promote** (route to a different
kind per the lifecycle table). The default proposal in the table above is the
suggested first option but never the only one offered.

**No auto-action.** A stale row is a question, not a problem. The user might be
deliberately resting an item and a forced re-target would damage that.

### Op 2 — Recurring-pattern detection

Scan rep logs across `Drills/<Topic>/<Title>.md` for the same Failed-strategies
trace appearing 2+ times across distinct artifacts. The 2-occurrence threshold
matches the existing Drills/CLAUDE.md routing rule: ≥2 occurrences across
artifacts ⇒ promote to kind 3.

**Detection mechanics:**
- Read the Failed strategies / Trace section of every drill artifact under
  `Drills/<Topic>/`.
- Normalize phrasing (Claude's job — same idea phrased two ways still counts).
- Cluster by underlying pattern, not by surface wording. *"Forgot to check the
  hypothesis is non-degenerate"* and *"didn't verify the assumption holds at the
  boundary"* are the same pattern.
- Cluster of size ≥2 across distinct artifacts ⇒ candidate.

**For each candidate:** AskUserQuestion — promote to a standalone kind 3
weakness drill?
- **Yes:** create a new artifact under `Drills/<Topic>/<Pattern Name>.md`
  (Topic is the most common containing topic across the cluster; user confirms
  pattern name). Add row to `Drills/Backlog.md` § Open weakness patterns with
  the cluster members as initial exemplars (cap = 5; if cluster has more, user
  picks the 5 most illustrative).
- **No:** record the rejection — don't re-surface the same cluster on the next
  /backlog run unless a new occurrence joins.

This is the operation that justifies one global `Backlog.md § Open weakness
patterns` ledger over per-topic indexes — cross-topic patterns would be
invisible in a per-topic layout.

### Op 3 — Vocabulary cleanup

For each term in `Drills/Vocabulary/Techniques.md` or
`Drills/Vocabulary/Error Types.md` with no incoming references in any drill
artifact for >3 months: AskUserQuestion with three options:

- **Deprecate** — strike through, leave in file as historical record. Searchable,
  not linkable.
- **Merge** — collapse into a more-active synonym. User picks the merge target.
- **Keep** — vocabulary deliberately broad; not every term sees use every quarter.

**Hard rule: never auto-delete.** Vocabulary is high-cost to rebuild — even an
unused term may be reactivated by the next chapter. The bias is preservation.

### Op 4 — Bucket exemplar swaps

When `Drills/Backlog.md` § Open weakness patterns has a pattern bucket with 6+
qualifying failures (the pattern recurred in a 6th drill artifact while the
bucket already holds the cap of 5 exemplars), propose a swap.

**Swap mechanics:**
- New failure (the 6th) is the swap-in candidate.
- Existing 5 are swap-out candidates.
- AskUserQuestion: *"Pattern X bucket is full. New failure: <one-liner>. Which
  existing exemplar should it replace, or should the new one be dropped?"*
  Options: each of the 5 existing (with summary), plus "drop new failure".
- User picks per illustrativeness + recency. Default ranking surfaced by
  Claude: most-recent and most-distinct exemplars stay; oldest similar one
  leaves.

**Cap = 5 per pattern.** Hardcoded. A pattern that needs more than 5 exemplars
to characterize is probably two patterns; if Claude detects this during the swap,
propose a split as an alternative to the swap.

### Op 5 — New-content promotion

`Drills/Backlog.md` § Newly-learned content backlog holds kind 2 (newly-learned)
items that haven't yet had rep #1 scheduled. After 2 weeks of sitting there
untouched, the item is at risk of decaying past the point where 2-3 reps will
graduate it cleanly.

**For each aging item (>2 weeks since landed in concept note):**
AskUserQuestion:
- **Schedule rep #1 in next 7 days** — pick day or "next /session:rep". Move
  row from `Backlog.md` § Newly-learned to `Schedule.md` § Active proof drills
  with target date.
- **Retire** — concept landed but isn't worth drilling (peripheral, already
  reflexed via use, or user judges it stable). Move to `Maintenance.md` directly
  if reflexed-via-use, or strike from the system if peripheral.
- **Defer one more week** — explicit acknowledgment the item is aging. If it
  ages another week (3 weeks total), next /backlog escalates: only retire / now.

The 2-week threshold matches the existing kind 2 cadence — if rep #1 hasn't
happened by then, the 1d/1w/3w/7w schedule is already broken; better to either
restart it deliberately or retire the item.

### Op 6 — Lifecycle audit

Catch lifecycle transitions that surfacing-at-mark-time missed. The per-rep
inline surfacing in `/session:rep` is the primary mechanism; this op is
the safety net.

**Three sub-checks:**

1. **Missed graduation (kind 2 → kind 4):** scan `Schedule.md` § Active proof
   drills. Any item with 2-3 consecutive clean reps that wasn't moved to
   `Maintenance.md`? Surface as missed graduation. Default proposal: graduate
   now.

2. **Missed demotion (kind 4 → kind 3):** scan `Maintenance.md` last rep
   outcome. Any item where the last rep failed in a way that exposed a
   pattern, but the item is still in maintenance? Surface as missed demotion.
   Default proposal: demote to kind 3, create a new pattern artifact if the
   exposed pattern doesn't match an existing kind 3 row.

3. **Missed promotion (kind 3 stagnant):** scan `Backlog.md` § Open weakness
   patterns. Any pattern with no rep activity for >4 weeks AND with all
   exemplar artifacts also dormant? Either the pattern has reflexed (graduate
   to kind 4) or it's no longer the right framing (retire). AskUserQuestion
   to decide.

**Hard rule: lifecycle audit never auto-fires graduations or demotions.** Each
candidate becomes a surfaced question. The inline mechanism in `/session:rep`
is the trusted path; this op is for catching what slipped through.

---

## Phases

### Phase 1 — Detection scan

**No user interaction.** Read everything, build the candidate-ops list. Files
read:

- `Plan.md` — current chapter context (what's actively being worked on; affects
  re-target proposals).
- `Drills/Schedule.md` — active reps, computational reflex categories, target
  dates, last-run dates.
- `Drills/Backlog.md` — newly-learned items, open weakness patterns.
- `Drills/Maintenance.md` — reflexed pool, last-drawn dates.
- `Drills/<Topic>/*.md` — every drill artifact, for rep logs and Failed-strategies
  traces (Op 2 input).
- `Drills/Vocabulary/Techniques.md`, `Drills/Vocabulary/Error Types.md` — term
  list and last-reference scan (Op 3 input).

Aggregate into a candidate-ops list with one entry per surfaced question:

```
[
  { op: "stale-row", surface: "Schedule.md", row: "<some drill> reps #2",
    detail: "target 2026-05-21, 9d overdue", default: "re-target this week" },
  { op: "recurring-pattern", cluster: "Hidden division by zero",
    artifacts: ["<Concept A>", "<Concept B>"],
    default: "promote to kind 3" },
  ...
]
```

**No edits in this phase.** Read-only scan.

### Phase 2 — Surface to user (density varies by trigger)

Surfacing density depends on which trigger fired this run:

| Trigger | Density | Behavior |
|---|---|---|
| Auto-fired from `/plan:close` | **Light** | Only strong-signal candidates. Borderline ones get logged for next time. Cap ≈ 5-8 questions total. |
| Claude-detected from chat signal | **Medium** | Just the ops that map to the detected symptom. Other ops skipped silently. Cap ≈ 8-12 questions. |
| Explicit `/backlog` from user | **Full** | Every candidate ops surfaced. No cap, but Claude bundles related ones (e.g., 3 stale rows in same topic = one combined question). |

**Bundling rule:** if 3+ candidates within one op share an obvious dimension
(same topic, same default action, same root cause), bundle them into one
AskUserQuestion with the bundled ones grouped. Don't fire 12 micro-questions
if 3 grouped ones cover the same ground.

### Phase 3 — Per-op confirmation and apply

For each candidate, fire the AskUserQuestion as defined per op. Each approved
answer triggers an immediate file edit. **Apply edits inline, not batched.**
Reasons:

- A user who approves 5 then declines the 6th shouldn't lose all 5 if they
  abort the run.
- Each edit is small and well-scoped; no benefit to batching.
- The audit log (commit message at the end) summarizes what landed.

**File-edit invariants:**

- All edits stay within `Drills/` and `Drills/<subdir>/`. Never touch concept
  notes (that's `/concept:audit` territory).
- Never touch `Plan.md` (that's `/plan:adapt`'s territory; if a stale row
  needs re-targeting against the rolling Plan window, surface to the user
  to run `/plan:adapt` instead).
- Never touch `Note Standard.md`, `CLAUDE.md`, or `.claude/commands/`.
- Never run drill execution (no rep is a `/backlog` action).

### Phase 4 — Wrap

After all approved ops are applied:

1. **Single commit on the current sprint branch** with a summary message:

   ```
   chore: backlog cleanup — <N> ops applied

   - <op summary 1>
   - <op summary 2>
   - ...
   ```

   Example body lines: *"retired 3 stale Maintenance items"*, *"promoted
   Hidden-division-by-zero to kind 3 standalone"*, *"swapped Sign-convention
   exemplar #4 for new MVT failure"*.

2. **No separate audit-log file.** Commit history is the audit log. Op 4
   (bucket swaps) is the most diff-noisy op; don't worry about that — the
   commit body explains.

3. **No ledger write.** `/backlog` is housekeeping, not a learning event.
   The ledger captures growth; aggregation cleanup isn't growth.

4. **Working tree must be clean** at end. If anything didn't apply (user
   declined or aborted), the working tree should match what the user
   approved — no orphan edits.

---

## Constraints

Hard rules that bound `/backlog`'s reach:

- **No drill execution.** Reps happen in `/session:rep` or `/drill` only.
  `/backlog` proposes that a rep should be scheduled; it does not run the rep.
- **No concept-note creation or edits.** That's `/session:learn` and the
  `/concept:*` commands' territory. If a `/backlog` candidate suggests a
  concept-note edit (e.g., a stale stub note surfacing during pattern
  detection), surface it as a follow-up suggestion, don't apply.
- **No `Plan.md` writes** beyond what `/plan:adapt` would do anyway. If a
  stale-row scan candidate would require `Plan.md` edit (e.g., re-slotting
  a learn-day focus), the AskUserQuestion option is *"propose to /plan:adapt"*
  rather than direct edit. Row ownership rule (`/plan:adapt`): if the row
  belongs to today, /session owns it; any other day, /plan:adapt owns it.
  /backlog never owns it.
- **No vocab auto-deletion.** Op 3 explicit rule.
- **No silent edits.** Every file change is preceded by an approved
  AskUserQuestion. The "I surface, you decide" principle is absolute here.
- **No new branch.** /backlog runs on whatever branch is checked out
  (typically the current sprint branch, or `claude/refactor-<date>` if
  /refactor invoked it indirectly). Branch creation is /plan:create's job.

---

## Notes on cross-command coupling

`/backlog` is the pressure-relief valve for the surfacing-at-mark-time approach
elsewhere. Inline surfacing in `/session:*` commands handles the per-event
case; `/backlog` handles aggregation across events.

If `/backlog` is firing frequently (say, more than once per chapter),
something upstream is leaking — inline surfacing in /session:rep or
/session:learn is missing what it should catch. Treat that as a meta-signal
worth raising to the user, not as a normal cadence.
