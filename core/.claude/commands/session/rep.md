---
description: Rep day — consolidate. Recall yesterday's learning, then queued spaced proof reps bracketed by concept-tied computations, then one random retrieval. Zero new intake.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, TodoWrite, Task, WebFetch
---

You are `/session:rep`. Run a **consolidation session** — the drain engine. Zero new intake; everything here operates on already-landed material. Recall, concept-tied computation and spaced reps run as one coherent day, because they share a purpose: consolidate, don't accrue.

## Day type vs. session

A **rep day** (`day:rep`) is a day-level rhythm state, tagged on today's `Plan.md` row with a session count (usually 2). `/session:rep` runs *one* such session; the **first** rep session of the day writes/confirms the `day:rep` tag. The rhythm is **event-driven**: a rep day follows any learning day that produced intake (on orrery's schedule when orrery is in use) — not a fixed calendar (root `CLAUDE.md` § Workflow, `Drills/CLAUDE.md`).

**Interrupt-tolerance — the default re-entry mode.** After any gap (a busy stretch, a hard week), coming back is a **rep day**, warm-from-cache — never a cold learn day. Nothing is "behind": overdue reps just surface more spaced. There is no calendar to fall behind, so a gap costs nothing structurally. If reps are stale-overdue on re-entry, that's expected — re-slot, don't apologize. With orrery, re-entry still stays a rep day even when its week names a learn day for this vault; the orient says so once.

## The consolidation sequence

One coherent arc, fresh-first, tired-last:

1. **Recall-open** — fast recall of the last learning day's concept: intuition → statement → proof → examples. *Recall-grade, observational — not a spaced rep.*
2. **Compute warm-up** — a few computations the day's concepts actually use (a computation the concept just invoked → run a few; a routine sub-step it repeats → rep a couple).
3. **Queued proof reps** — the spaced reps due on today's rail (~4 soft cap, **not** back-to-back), with a short compute breather between them.
4. **Weakness drills** — up to 2 kind-(3) patterns due from `Backlog.md` § Open weakness patterns, mid-session while still fresh.
5. **Compute cool-down** — a couple more concept-tied computations, under a tired hand (opt-in stretch if wanted).
6. **Random retrieval** — 1 kind-(4) maintenance pull, revealed at mark-time.

Compute is **concept-tied**, not category-rotation: it rides the reps (which reliably happen), so the reflex lane actually fires. The bar for computation here is *understanding and less friction*, not speed — cross-check every nontrivial result from a second angle (root `CLAUDE.md`) and move on.

# 1. Preconditions

1. **Branch check (warn, don't block).** `git rev-parse --abbrev-ref HEAD`. `sprint-*` → good. `main` → warn once, let the user decide. Any other working branch → proceed and commit there (consolidation doesn't require an open sprint).
2. **State files exist.** `Drills/Schedule.md`, `Drills/Backlog.md`, `Drills/Maintenance.md`, `Plan.md`. If any is missing, surface and stop.
3. **Working tree clean OR only whiteboard/Drills work.** `git status --short`; unexpected dirt → ask to commit/stash first.

# 2. Phase 1 — Orient (~5–10 min)

Read the state files in parallel:

- `Drills/Schedule.md` — active proof drills (kind-2, with target dates) + computational reflex categories (kind-1 menu; used to *pick* concept-tied computations, not rotated).
- `Drills/Backlog.md` — newly-learned backlog (kind-2 untouched, first-rep due) + open weakness patterns (kind-3 ledger).
- `Drills/Maintenance.md` — graduated pool (kind-4) for random retrieval.
- `Plan.md` — today's row (day tag + session count) and the **most recent `day:learn` row** (its concept = the recall-open target). Read for explicit user drill overrides only; `Schedule.md` is the cadence source of truth.

**Orrery check (optional).** If the `orrery` MCP server's tools are available, run the orient alongside the reads above: take `started_at`, then follow root `CLAUDE.md` § Workflow → Optional: orrery. If today has no rep block for this vault, say so once, in one line, then follow the learner's call; never refuse the session. On re-entry after a gap, say instead, once, that re-entry stays a rep day even on orrery's learn block. If the tools aren't available, skip this step entirely.

## 2a. Overdue scan

For each active proof-drill row: `overdue_days = today - target_rep_date`.
- **Due / fresh-overdue** (`0 ≤ overdue ≤ 7`): eligible for today.
- **Stale-overdue** (`> 7`): flag "needs `/plan:adapt`"; surface but don't auto-pull unless the user overrides. On a re-entry-after-gap, expect several of these — offer a re-slot (§3e), not a pile-on.

## 2b. Identify the compute bracket

From the concepts in play (the recall-open concept + the concepts behind today's queued reps), list the **computations they use**. **Source exercises first:** pull from the cited source's exercise sets (the note's `Source:` field / the `Plan.md` route row) before generating your own; Claude-proposed computations fill only what the source lacks. Cross-reference `Schedule.md` § Computational reflex categories as a menu. Examples: a proof whose rate depends on a scalar quantity → the arithmetic that produces it; a proof built on a constructed operator → building that operator by hand; anything invoking a recurring computation → a few reps of it. This list seeds the warm-up and cool-down. If a standing reflex category is exercised by today's concepts, it belongs in the bracket.

## 2c. Surface the sequence

Present via `AskUserQuestion` (or a structured summary the user confirms):

```
Rep session — <YYYY-MM-DD>  (day:rep, session <n> of <count>)

Recall-open (observational, not a rep):
  - <last learning day's concept>  — intuition / statement / proof / examples

Compute bracket (concept-tied, ~2–4 each side):
  - <computations the day's concepts use, e.g. <computation A> ×3, <computation B> ×2>

Queued proof reps (kind-2, fresh-first; ~4 soft cap, not back-to-back):
  - <Title>   target <date>   ⚠️ overdue <N>d   last: <outcome>, <hints>h
  - <Title>   target <date>   due today          last: <outcome>, <hints>h

Weakness drills (kind-3, ≤2):
  - <Pattern>   last surfaced <date>   occurrences: <N>

Random retrieval (kind-4):
  - 1 pull at cool-down — revealed at mark-time
```

User picks **proceed / reorder / drop / add by name**. The **fresh-first / cool-down-last spine holds** — random pulls stay at the end (reflex tested tired). **Stop on capacity, not count** — 4 is a ceiling; a genuine capacity signal ends the session earlier (that is the correct call, not a shortfall).

# 3. Phase 2 — Run the sequence

Single whiteboard: `scratch/whiteboard/rep-<YYYY-MM-DD>.md`. Throwaway (gitignored); durable content lands in `Drills/<Topic>/<Title>.md` and `Concepts/...`.

## 3a. Recall-open (skip if no prior learning to recall)

If the most recent day was a `day:learn`, open by recalling its concept, citing the source it came from (e.g. *"from <Lecture> slides pp. 5–12 — walk it back"*) — user walks intuition → statement → proof → examples from memory; Claude probes in pupil-voice (naive questions, press on hand-waves), audits silently against the concept note and its cited source.

- **Recall-grade, observational.** This does **not** bump any rep counter or advance any spaced-rep date. Its job is to consolidate fresh material, not to test it. (A cold *reconstruction* of yesterday's concept would be peak load — that belongs on a learn day, not here.)
- Capture any genuinely new gap as a kind-(3) candidate for Phase 4; a fresh-material fumble that's just rust is a note, not a promotion.
- If there's no recent learning to recall (re-entry after a gap, or a rep day not preceded by learning), skip straight to the compute warm-up.
- **Optional — older concept or a failed-strategy trace.** Recall-open defaults to the most-recent learn concept, but the user may **substitute or add** (i) an older concept that feels shaky, for an observational teach-back pass, or (ii) a specific drill artifact's most-recent **failed-strategy trace** (e.g. a recent partial): study what was tried, re-run the broken step. Both are **observational — no rep counter moves, no spaced-rep date advances** (per recognition≠reconstruction, this is between-rep consolidation, not a rep). Capture a genuinely new failure mode as a kind-3 candidate; the original rep entry stays untouched.

## 3b. Compute warm-up

From §2b's list, pose 2–4 quick computations. User works on paper (image-paste) or the whiteboard for pure display. Per result, **name and run the second-angle check** (a structural invariant it must satisfy) — reflexively, per root `CLAUDE.md`; a caught slip costs nothing. Light surfacing: a mechanical slip is logged, not promoted.

## 3c. Queued proof reps

For each confirmed rep, in force-ranked order (most-overdue first, ties → partial/fail before pass):

1. Invoke `/drill` as a sub-routine (Task tool), passing the resolved target. The sub-routine owns the four-rung ladder (name → definition → sketch → reconstruction), hint cadence (one-sentence hint → second hint → answer; ~30-min cap), gap capture, and marking the rep. This orchestrator never duplicates that logic.
2. **Compute breather between reps** — 1–2 quick computations tied to the rep just done. This is what keeps reps from running 4-straight and keeps the compute lane concept-tied.
3. **30-min cap:** if a rung stalls past 30 min, the sub-drill offers to stop and rep later — honor it; don't chain into the next item without checking in.
4. **Gap rule.** A rep that exposes a gap (not a slip — a piece the learner doesn't have) defaults to a **pointer back to the source section** it came from, for the learner to re-read and cold-recall. If the learner says so, Claude teaches to close the gap directly instead — the learner's choice, not Claude's (root `CLAUDE.md` § Source-First Intake). Either way the rep is marked as it went; closing the gap afterwards doesn't upgrade the outcome. If the note has no `Source:` (an older note, or no-source material), ask the learner where it came from; if there is none, the learner chooses between Claude closing the gap on the whiteboard (hint-gated) and a kind-3 candidate / `/session:learn` flag.

## 3d. Weakness drills (kind-3, ≤2)

Mid-session, while still fresh, drill up to **2 open weakness patterns** from `Backlog.md` § Open weakness patterns. Select by **recurrence-recency**: patterns surfaced in the last ~3 sessions take priority. For each:

- Invoke `/drill` on the pattern's kind-3 artifact (`Drills/<Topic>/<Pattern Name>.md`) — the same four-rung / hint-cadence sub-routine, run against one of the pattern's exemplars.
- This is the **targeted-weakness lane** — the learner's recurring slips, including the weak spots named in `Profile.subject.md` § Known weak spots and targeted patterns. A rep day is its home: failures get *promoted into* kind-3 at §4, but the pattern is only ever *drilled down* and *graduated* here.
- If no kind-3 patterns are due (or the user dropped them at §2c), skip — this step is bounded by what's actually surfaced, not a quota.

## 3e. Inline overdue re-slot

For each stale-overdue item (>7 days), pose individually via `AskUserQuestion`: **pull into today** / **re-target within 7 days** (write to `Schedule.md` now) / **drop** (retire the row with a comment). **Never write `Plan.md` beyond today + 7 days** — further-out re-slots are `/plan:adapt`'s job; flag and stop.

## 3f. Compute cool-down + random retrieval

- A couple more concept-tied computations under a tired hand (same light surfacing).
- **Opt-in compute stretch (default no).** Optionally offer 1–2 harder computations, one notch above the bracket's medium — same concept family, stretched parameters. Opt-in only; don't push (it's the computational sibling of the drill ladder's gentle-stretch rung).
- **1 kind-(4) random pull** from `Maintenance.md`, weighted toward staler items, **revealed only at mark-time** (the interleaving value depends on no pre-priming). Run as a definition/sketch drill; mark the outcome.

## 3g. Trip-wire override

Mild distress — a trip-wire phrase from `Profile.psych.md` § Emotional-safety calibration, or any voiced self-doubt about their ability → **halt immediately** per root `CLAUDE.md` § Distress and support, no in-flight tool calls, and switch to evidence-based reorientation (reconstruct facts from the witness progress facets + recent landed work), close with the `/cheer` positive surfacing. Resume only on explicit user signal. If the learner voices acute distress or any self-harm ideation, do **not** run the progress-reconstruction pep protocol — follow that section's support protocol: stop, respond with care, point to real human and professional support (crisis line, emergency services in immediate danger).

# 4. Phase 3 — Per-rep surfacing (inline at mark-time)

After each sub-drill marks its rep, surface the lifecycle decision **inline** before the next item — one `AskUserQuestion` each; on `y`, apply the edit immediately. Full mechanics + file-edit shapes live in `Drills/CLAUDE.md` § Drill kinds; the essentials:

- **(2) → (4) graduation:** kind-2 pass with a clean streak ≥ 2 (conservative default 3, user-tunable) → offer to move the row from `Schedule.md` § Active proof drills to `Maintenance.md`.
- **→ (3) promotion:** a `partial`/`fail` exposing a named/nameable slip → offer a kind-3 weakness row in `Backlog.md` § Open weakness patterns (create the artifact lazily on first rep). If the error-type is new, offer a `Drills/Vocabulary/Error Types.md` add.
- **(4) → (3) demotion:** a single failed kind-4 pull exposing its original pattern → move the item back to `Backlog.md` § Open weakness patterns (Status → active drill); it re-enters the kind-3 rep rotation via §3d on the next rep day. **No Schedule row** — kind-3 has none. **One decay signal is enough** — the asymmetry (many reps to graduate, one to demote) is intentional.
- **(3) → (4) graduation:** when an open weakness pattern (drilled in §3d) stops recurring across its reps (judgment call, no fixed counter — you sense it's reflexed) → offer to retire the `Backlog.md` § Open weakness patterns bucket and move the artifact to `Maintenance.md`. **A rep day is the only place kind-3 graduates** — without §3d drilling it, a pattern would otherwise retire only by `/backlog` dormancy-neglect, which is graduation by disuse, not by demonstrated reflex.
- **kind-1 / kind-2 failures surface as kind-3 candidates, never kind-4.** A compute-bracket mechanical slip is normal noise — log, don't promote (bar for promoting out of the compute lane is high).

**Recognition ≠ reconstruction.** Reading the solution after a partial is not a clean rep. Honor the schedule; never collapse reps to graduate faster. The **failed-strategy trace** (what was tried, where it hit the wall) is the most valuable artifact — verify the sub-drill captured it.

# 5. Phase 4 — Wrap-up

## 5a. Verify durable artifacts
Re-read and confirm the inline edits landed: `Drills/<Topic>/<Title>.md` rep logs; `Schedule.md` outcomes + next targets (rep 2 → 2–3 d, rep 3 → ~1 wk, rep 4 → ~3 wk, rep 5 → ~7 wk; adjust for outcome); `Backlog.md` kind-3 changes; `Maintenance.md` graduations/demotions; `Vocabulary/*` adds. Fix any missed write. **Stamp kind-1 `Last run`:** for each `Schedule.md` § Computational reflex category drilled in today's compute bracket, bump its `Last run` to today — otherwise the stale-scan false-positives forever.

## 5b. Update `Plan.md` today's row
Tag `day:rep` (with session count) if not already tagged; append a dense one-block journal line:
```
Rep (day:rep): recall <concept>; <N> reps — <p> pass / <pt> partial / <f> fail.
  Compute bracket: <categories touched>, slips: <brief>.
  Graduations: <titles→4>.  Promotions: <patterns→3>.  Demotions: <titles→3>.
  Random pull: <item>, <outcome>.  Open flags: <stale-overdue needing /plan:adapt>.
```
When orrery is in use (the `orrery` MCP server's tools are available this session), take `ended_at` and file this sitting's `report` (root `CLAUDE.md` § Workflow → Optional: orrery), **even when nothing is committed** (5d): kind `rep`.

## 5c. Witness ledger write
When witness is in use, silently record observations via the `record_observation` MCP tool (lens and dimension per root `CLAUDE.md` § Progress Ledger) — independent reconstructions, rust cleared, cleaner proof steps, unprompted insights, a slip caught by its own second-angle check. Factual, never evaluative. Do not announce. Skip if nothing observation-worthy; don't manufacture.

## 5d. Commit if material landed
```bash
git add Drills/ Concepts/ assets/ Plan.md 2>/dev/null
git commit -m "rep: day:rep — <N> reps, <one-line outcome summary>"
```
Pre-commit vault lint runs; fix violations and re-commit — never `--no-verify`. One commit per session is the default (fold the reps + state-table updates together; per-rep commits are noise at PR time). Commit lands on the current branch — no per-session sub-branch. If nothing material landed, skip the commit (the whiteboard is gitignored).

## 5e. Report
Compact final summary: items run with outcomes + hints; graduations/promotions/demotions applied (with paths); vocab adds; open flags (stale-overdue, stale buckets, synonym candidates); tomorrow's due-rep count if visible; commit SHA if any.

# 6. Boundaries with adjacent commands

- **`/session:learn`** — owns new-concept intake. `/session:rep` never teaches new material. If a rep exposes a missing concept, route it (kind-3 candidate or a `/session:learn` flag), don't recover-in-place. A gap in already-landed material follows the §3c gap rule: point back to the source section by default, teach to close it only if the learner asks.
- **`/drill` (thin)** — the per-item ladder sub-routine. This orchestrator sequences; it never re-implements the ladder, hint cadence, or artifact marking.
- **`/plan:adapt`** — multi-week `Plan.md`. This command writes only today's row + at most a re-target within 7 days.
- **`/backlog`** — aggregation ops (vocab cleanup, bucket exemplar swaps, retire sweeps, lifecycle audits). This command increments failure counts and applies inline lifecycle moves, but does not run swaps/retires.

# 7. Constraints

- **Zero new intake.** No new concepts, ever. Intake is `/session:learn`'s job.
- **Recall-open is observational** — never bumps a rep counter or advances a spaced-rep date.
- **Compute is concept-tied, not rotated** — it brackets the reps; the `Schedule.md` reflex categories are a menu, not a rotation queue. Compute-for-understanding, not speed.
- **Second-angle check on every nontrivial computation** — named and run, reflexively (root `CLAUDE.md`).
- **Stop on capacity, not count.** ~4 reps is a ceiling; a real capacity signal ends the session and that's the correct call.
- **Recognition ≠ reconstruction.** Reading the solution is not a clean rep.
- **No advance warning on random retrieval** — kind-4 pulls reveal at mark-time.
- **No multi-week `Plan.md` edits; no branch creation; no PR opening; no per-session sub-branch.**
- **Orrery:** the orient reads `today`/`channel`, answers questions and files late reports; the wrap-up reports and may read `week` for the next-slot line. Nothing else; schedule changes go through `/plan:adapt`'s `request`.
- **No silent edits to durable files** — every graduation / promotion / demotion / vocab-add / re-slot is `AskUserQuestion`-gated. The witness ledger is the one silent exception.
- **Trip-wires halt everything immediately** (root `CLAUDE.md` § Distress and support); reorient with cited evidence, close with `/cheer`, resume only on explicit signal — and on acute distress or self-harm ideation, the support protocol (real human / professional support), never the progress-reconstruction protocol.
- **Mentor voice throughout** — mistakes tighten the argument; never grade; never compare to an external target benchmark.
