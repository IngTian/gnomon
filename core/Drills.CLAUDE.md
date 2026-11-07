# Drills — Claude Instructions

This CLAUDE.md is loaded when Claude operates under `Drills/`. It scopes drill-specific rules without polluting the root vault instructions.

## Drill flow at a glance

A drill is run by `/drill` (the thin general-purpose primitive) or invoked as a sub-routine from `/session:rep` (the consolidation-day session — see § Day rhythm). Either way the per-drill flow is the same:

1. **Pick a target** — see the three drill modes below.
2. **Decide branch.** If on `main`, warn once then commit there; otherwise stay on the invoking branch (`/session:rep` commits on the current branch — a sprint branch during a chapter, or a working branch between chapters). *No scope guard* — drills may edit `Drills/`, `Concepts/`, `assets/`, and vocabulary files alike.
3. **Climb the four-rung ladder on a whiteboard,** one rung at a time. Strict pacing, mentor framing.
4. **Capture gaps as they surface,** routing each gap to its right durable home (concept note, vocabulary file, memory entry, or this drill's `Gaps surfaced` section).
5. **Mark the rep:** update the artifact under `Drills/<Topic>/<Title>.md`, the relevant state file (`Drills/Schedule.md`, `Drills/Backlog.md`, or `Drills/Maintenance.md` per the kind), and propose graduate / demote / promote-slip per § Drill kinds. Commit on the working branch.

The whiteboard is throwaway. The artifact + the three state files (`Schedule.md`, `Backlog.md`, `Maintenance.md`) are durable.

The difference between `/drill` and `/session:rep`: `/drill` is ad-hoc — no day-orient, no Plan.md update, no automatic surfacing past the rep itself. `/session:rep` runs the consolidation-day ritual: recall-open, orient against today's row, force-rank a sequence bracketed by concept-tied compute, surface inline at mark-time, wrap up with Plan.md / ledger / commit. Both call the same per-drill ladder.

## Day rhythm — day:learn vs day:rep

Study days come in two types, tagged on each `Plan.md` row. The line between them is **accrues vs. drains**:

- **`day:learn`** (`/session:learn`) — intake from the source (lecture or textbook section), per root `CLAUDE.md` § Source-First Intake. 1–2 concepts nailed deep (proof/derivation + **required** worked examples + connections + intuition), across ~2 sessions, with the note in the learner's own words. **No spaced reps or drills.** Same-day cold recall and running the source's own worked example by hand are part of intake, not reps or compute — they never enter `Schedule.md`, never count toward graduation, and a cold-recall gap is never logged as a rep failure or weakness pattern.
- **`day:rep`** (`/session:rep`) — consolidation, zero new intake. Recall the last learning day's concept (observational), run the spaced proof reps due on the rail (~4 soft cap, fresh-first) plus up to 2 due kind-3 weakness drills, **bracket them with concept-tied computations**, close with one random retrieval.

**Day vs. session.** A *day* is the rhythm unit (tagged in `Plan.md`, usually ~2 sessions); a *session* is one ~90-min block (the `/session:*` command). The first `/session:*` of a day writes/confirms its tag.

**Event-driven, not calendar.** A `day:rep` follows any `day:learn` that produced intake. After an interruption (a busy stretch, illness, a hard week), re-entry is a `day:rep`, warm-from-cache — overdue reps just surface more spaced; nothing is "behind." Rest and reorg days are the learner's own: `Profile.subject.md` § Weekly rhythm (root `CLAUDE.md` § Workflow).

**With orrery** (an optional companion that allocates days across vaults; root `CLAUDE.md` § Workflow → Optional: orrery), its week decides which days belong to this vault and which are rep days: a `day:rep` follows on orrery's schedule, and consecutive learn days are allowed. Re-entry after a gap still stays a `day:rep`, even on an orrery learn day — the orient says so once. Without orrery, nothing changes.

**Concept-tied compute — the reflex lane's home.** Kind-1 muscle computation doesn't rotate by category on its own block; it **rides the reps** on a `day:rep`. For each concept being repped, drill the computations it actually uses (a proof that leans on a given computation → drill that computation by hand; a recurring operation appears → drill a few of them). `Schedule.md` § Computational reflex categories is the *menu* the bracket draws from, not a rotation queue; the source's exercise sets are a valid draw too. The bar is understanding + less friction, not speed — and every nontrivial result gets its second-angle check (root `CLAUDE.md`).

## Three drill modes

When picking a drill target, Claude operates in one of three modes — explicit in the user's prompt or default-chosen per the rules below.

1. **Targeted** (default for `/drill <concept>` with explicit arg): user names the proof or definition; Claude runs the four-rung ladder on it.
2. **Schedule-march** (default for empty `/drill`, and the kind-2 portion of `/session:rep`): pull the next due rep from `Drills/Schedule.md` § Active proof drills, or the next unworked item from `Drills/Backlog.md` § Newly-learned content backlog if no reps are due.
3. **Random retrieval** (`/drill random`, `/drill --random`, or the cooldown slot of `/session:rep`): pick a random previously-graduated item from `Drills/Maintenance.md`, weighted inversely by time-since-last-rep. **No advance warning, no context cue** — name the target and start at rung 1.

### Eligibility for random retrieval

An item is eligible for the random pool iff:
- It lives in `Drills/Maintenance.md` (already graduated from kind 2 or kind 3 — see § Drill kinds).
- Last rep was **> 3 days ago** (don't re-rep right after a fresh rep).

**Weighting.** Probability of selection grows with time-since-last-rep. Concretely: pick weights $w_i \propto \max(\text{days since last rep}_i - 3, 1)$, then sample. Items at the long-tail end of the maintenance pool get drawn most often, which is exactly when their reflex is decaying fastest.

### Why random retrieval

Targeted and schedule-march modes are **blocked practice** — the brain knows what topic it's in and uses that cue to retrieve. Random retrieval is **interleaved practice** — without the topic cue, the brain has to *generate* the cue from the problem itself, which is harder and more durable. Documented in cognitive-science literature as the more durable form of consolidation; matches the conditions of interview / exam / paper / talk, where the cue is absent. Interleaved practice *feels* worse while it works (Rohrer & Taylor 2007) — the *feeling* that it is harder is expected and not on its own a trigger; an actually rough run (several slips, a stalled rep, visible frustration) still counts per root `CLAUDE.md`. Interleave only topics that are genuinely confusable.

Recommended cadence: **1 random retrieval per `/session:rep`** at cooldown end, unless `Profile.subject.md` § Weekly rhythm moves the pulls elsewhere (e.g. a capped weekly batch). Scale random reps up inside a rep session if they feel stale, down when cognitive load is high.

## Drill kinds

Every drillable item belongs to exactly one of four kinds. The kind determines where the item lives, how it cadences, and whether it can graduate.

| Kind | Name | Source | Cadence | Lives in |
|---|---|---|---|---|
| **(1)** | Muscle | Computational reflex categories (e.g. your recurring computational categories) | **Concept-tied**: brackets the reps on a `day:rep`, drilling the computations the day's concepts use. Menu (not a rotation queue) in `Schedule.md`. **Never graduates.** | `Schedule.md` § Computational reflex categories (last-run logged) |
| **(2)** | Newly-learned | Concepts/proofs just landed on a `day:learn` (`/session:learn`) | 5-rep schedule (1d / 1w / 3w / 7w / …). Graduates to (4) on **2-3 clean reps** (NOT 5). | `Schedule.md` § Active proof drills (in flight) · `Backlog.md` § Newly-learned content backlog (untouched) |
| **(3)** | Weakness | Failure patterns surfaced from kinds (1), (2), or (4) — during a `day:rep` recall-open, compute bracket, or proof rep, or during `day:learn` post-intake work (audit, probes, examples) — never from a `day:learn` cold-recall gap, which is an expected diagnostic | Drilled until reflex; no fixed N. Graduates to (4) when the pattern stops recurring across reps — judgment call, no fixed counter. | `Backlog.md` § Open weakness patterns (the single global ledger) · `<Topic>/<Pattern Name>.md` (drill artifact) |
| **(4)** | Maintenance | Graduated from (2) on 2-3 clean reps, or graduated from (3) when the pattern stops recurring | Random retrieval; weighted by time-since-last-rep | `Maintenance.md` |

### Lifecycle graph

```
  (1) Muscle ──────────── failure pattern surfaces ──────────────────┐
                                                                     │
                                                                     ▼
  (2) Newly-learned ──── failure pattern surfaces ──────►  (3) Weakness drills
       │                                                             │
       │ 2-3 clean reps                                               │ pattern stops recurring
       │                                                              │
       ▼                                                              ▼
       └────────────────────►  (4) Maintenance pool   ◄───────────────┘
                                  (random retrieval)
                                       │
                                       │ single failed rep exposes same pattern
                                       │
                                       ▼
                                   back to (3)
```

### Lifecycle rules

- **(1) → (4) is impossible.** Muscle drills are rotation-based, not rep-based; they stay in `Schedule.md` indefinitely.
- **(1) → (3)** when a recurring slip surfaces inside the compute bracket of a `day:rep` (e.g. the same computational-shape error appearing twice). The slip becomes a kind-3 weakness pattern with its own artifact.
- **(2) → (4)** on **2-3 clean reps**, NOT 5. Threshold is updatable by user.
- **(2) → (3)** when the failure mode is a recurring pattern (not just a one-off slip on this proof). The kind-2 artifact stays in flight; the underlying pattern spawns a separate kind-3 entry.
- **(3) → (4)** when the pattern stops recurring across reps. Judgment call by Claude + user at mark-time.
- **(4) → (3)** on a **single failed rep** that exposes the same pattern. One signal of decay → demote.
- **Failures from (1) and (2) never go directly to (4).** They surface as candidates for (3). Graduation to (4) only happens via the clean-rep / pattern-stops-recurring routes above.

### Where each kind lives

- `Drills/Schedule.md` holds all *active* state: in-flight kind-2 reps with target dates, and kind-1 computational reflex categories with last-run dates.
- `Drills/Backlog.md` holds all *waiting* and *open* state: kind-2 concepts that landed but haven't started repping yet (§ Newly-learned content backlog), and the single global kind-3 ledger (§ Open weakness patterns).
- `Drills/Maintenance.md` holds all *reflexed* state: graduated items, drawn from at random.
- `Drills/<Topic>/<Pattern Name>.md` is a kind-3 drill artifact — a recurring-slip pattern with multiple worked examples.
- `Drills/<Topic>/<Drill Title>.md` is a kind-2 drill artifact — a single proof or definition, repped through the 5-rep schedule.

## Scope: drilling enriches the vault

Drills are *not* scoped to the `Drills/` folder. Gap-fixing — concept-note edits, vocabulary additions, memory-pattern entries — is a feature of the drill flow, not a violation of it. When a drill exposes a gap (a fuzzy definition, a missing piece of intuition, a wrong implication, a missing image), the drill is allowed to fix it on the same branch.

The exception: **concept-note edits during a drill follow the inline-prose rules and shape rules** — see [[Note Standard]] at the vault root (`Concepts/CLAUDE.md` is only a loader pointer; rules live in Note Standard). The pre-commit hook lints those on every branch, so you'll be caught if a drill commit violates the concept-note shape.

### Where gaps land

When a gap surfaces during a drill, classify it before fixing:

| Gap kind | Lands in |
|---|---|
| Fuzzy / wrong fact in a concept note | The concept note. Edit inline (small fix) or surface for filling (larger). |
| Stub concept note | Stub-fill flow during `/session:learn`; can be done in this drill if quick, or deferred. |
| New named pattern, transferable lesson | Auto-memory entry (the persistent memory directory named in the system prompt's Memory section). |
| New technique or error type | Vocabulary addition (`Drills/Vocabulary/Techniques.md` or `Error Types.md`) via `AskUserQuestion`. |
| Recurring slip (≥2 occurrences across artifacts) | Promote to a kind-3 weakness drill — `Backlog.md` § Open weakness patterns row + `<Topic>/<Pattern Name>.md` artifact. |
| Reusable diagnostic about how the user solves things | Drill artifact's `Gaps surfaced` heading + memory entry. |
| Missing image / figure | `assets/Concepts/<Topic>/...` via the `.py-plot` pipeline; embed in the concept note. |

If unclear, ask the user where it should land before writing.

## Ephemeral working files

- `scratch/drills/YYYY-MM-DD/` — gitignored daily scratch directory. Optional. Used for one-off practice not tied to an artifact, such as a worksheet you want to throw away. The standard flow does not write here — it goes through whiteboards into the durable artifact.
- `scratch/whiteboard/drill-<concept-slug>-<YYYY-MM-DD>.md` (single-target `/drill`) or `scratch/whiteboard/rep-<YYYY-MM-DD>.md` (the per-`/session:rep` whiteboard) — gitignored, the active surface where the drill ladder runs. Throw away after marking. **Whiteboard interactivity rules per root `CLAUDE.md` § Whiteboard Workflow apply unconditionally**: one rung at a time, wait for the user to fill before posting the next, never pre-draft.

The `Drills/` folder itself holds only durable product: the three state files, vocabularies, and the per-topic drill artifacts.

## File schema reminders

**Drill file frontmatter:**
```yaml
Created: DD/MM/YYYY HH:mm:ss
Tags: [drill, draft]           # or [drill, manual] for Templater-created
Topic: <Topic>                  # matches a top-level vault folder name
Subtopic: <Subtopic>            # optional
Concept: "[[Some Concept]]"     # wiki-link to the concept note
Technique: <technique-slug>     # must exist in Vocabulary/Techniques.md
Difficulty: easy | medium | hard
Kind: proof | calculation | conceptual | puzzle | pattern   # pattern = kind-3 weakness artifact
Status: attempted | marked
Outcome: pass | partial | fail          # filled at marking time
ErrorTypes: [missing-hypothesis, ...]   # filled at marking time; terms from Vocabulary/Error Types.md
NeedsReview: false                      # true if generation-time self-solve diverged
SelfSolveNote:                          # brief note when NeedsReview is true
```

**Drill body sections** (in order):
1. `# <Title>`
2. `> [!question] Problem` callout
3. `## Your Solution` placeholder (where the user writes during a rep — though re-reps happen on a whiteboard, not here)
4. `> [!abstract]- Official Solution` collapsed callout containing the canonical proof skeleton
5. `## Marking` with these subsections, in order:
   - `### Rep log` — append-only `Rep #N (date)` entries with outcome and hints required
   - `### Failed strategies` (when applicable) — what was tried before the right move
   - `### Gaps surfaced` (when applicable) — sub-skill weaknesses revealed by this proof, with crosslinks to memory entries
   - `### Rep schedule` — table with target dates for reps 2–5, methodology curve (kind-2 only; kind-3 is open-ended)
   - `### Verdict` — pass / partial / fail and a one-line summary
   - `### What's correct` — what landed at the most recent rep
   - `### What's missing or wrong` — what didn't
   - `### Suggested improvements` — cooldown drills, technique additions, etc.

Older artifacts may have a flatter Marking section (just Verdict / What's correct / What's missing / Suggested improvements). That's fine — the additional headings are added when a rep surfaces material that needs them. `/refactor` can flag artifacts whose Marking section is structurally out of date.

## Vocabulary-proposal workflow

Before writing any state-file or artifact update:
1. Check that the drill's `Technique` exists in `Drills/Vocabulary/Techniques.md`.
2. Check that every `ErrorTypes` value exists in `Drills/Vocabulary/Error Types.md`.
3. If any term is missing, stop and propose the addition via `AskUserQuestion` with a suggested description. On accept, append a bullet to the vocab file **in the same commit** that updates the artifact / state file. On reject, pick a different existing term or halt and ask.

## Weakness pattern rules — single global ledger

Kind-3 weakness patterns are tracked in **one place**: `Drills/Backlog.md` § Open weakness patterns. There are no per-topic `Index.md` files — do not create them.

The ledger is keyed by `Technique` (or by named pattern when the slip is technique-agnostic — e.g. a named cross-cutting slip). For each pattern bucket:

- **Cap = 5 exemplars** per pattern.
- **Promotion only on `Outcome: fail` or `Outcome: partial`.** Passes update last-seen but do not add an exemplar.
- **6th qualifying failure → propose swap.** Compare the new candidate against the existing 5 by illustrativeness and recency; propose a swap via `AskUserQuestion`; only swap on confirm.
- **Pattern graduation.** When the pattern stops recurring across reps (judgment call at `/session:rep` mark-time or via `/backlog` lifecycle audit), retire the bucket and move the underlying artifact to `Maintenance.md`.

Cap+swap discipline is enforced by `/backlog` (or by Claude inline at mark-time when the 6th failure lands during a session).

## Folder layout

`Drills/` (vault top-level) holds only durable product:

- `Drills/Schedule.md` — tracked. Active state: kind-2 reps with target dates, kind-1 computational reflex categories with last-run dates. Updated by `/session:rep` at mark-time (reps + concept-tied compute bracket).
- `Drills/Backlog.md` — tracked. Two sections: § Newly-learned content backlog (kind-2 untouched), § Open weakness patterns (kind-3 single global ledger).
- `Drills/Maintenance.md` — tracked. Reflexed pool for random retrieval (kind-4).
- `Drills/Vocabulary/` — tracked. `Techniques.md` and `Error Types.md` define the controlled vocabularies.
- `Drills/<Topic>/` — tracked. Holds per-topic **drill artifacts only**: kind-2 single-proof drills (`<Drill Title>.md`) and kind-3 recurring-pattern drills (`<Pattern Name>.md`). **No `Index.md`** — the weakness ledger is `Backlog.md` § Open weakness patterns.
- `Drills/CLAUDE.md` — this file.

Names follow the vault-wide convention (see root `CLAUDE.md → Naming Convention`): `Capitalized/` means permanent content, `lowercase/` like `scratch` means temporary. Respect this when creating new subfolders.

## Drill Methodology

These rules govern *how* drills are run. Schema rules above govern *what* drill files look like. Both apply.

### The four-rung ladder

Drilling a concept is a ladder, climbed one rung at a time on the whiteboard:

1. **Name** — Claude names the target concept. User says "go" when ready.
2. **Definition** — User writes the definition from memory. Claude checks.
3. **Proof sketch** — User gives the high-level strategy ("apply X, reduce to Y, contradict Z"). Claude checks.
4. **Proof reconstruction** — User writes the proof in full. Claude checks.

For pure definition concepts, the ladder ends at rung 2 with a short "explain in your own words + one concrete example" coda. For theorems we go to rung 4.

**Never compress two rungs.** Don't ask for definition + proof sketch in one move. Don't post the next rung until the current one is filled.

**Never pre-generate the whole drill.** Drills are *interactive* — Claude posts one rung, the user fills it, Claude responds, Claude posts the next rung. Pre-written drill files (one big question with a collapsed solution) are the wrong shape.

### Calibration: rusty memory is the baseline

The cold-start assumption is **rust**, not confident recall. If a concept was last touched a week ago, start at rung 1, never skip ahead. *Too hard trips the learner into shutdown (root `CLAUDE.md` § Distress and support); too easy wastes the session.* When uncertain, err easier and ratchet up — never the reverse.

### Stretching to new material — gently and signposted

Introducing a new technique, a new concept, or an adjacent idea inside a drill is fine when it's a natural reach. The bar is *gentle and signposted*, not banned.

When stretching: announce it ("this brings in X, which is new — quick orient before we use it"), give the orient in 1–2 sentences, then proceed. Don't smuggle a new prerequisite in as if it were already known. If the user struggles with the new piece — or a rep exposes a gap — give a one-line orient plus a pointer to the source section; teach it explicitly only if the source skipped it or the learner asks you to (their call, per root `CLAUDE.md` § Source-First Intake), then resume the drill. If the note has no `Source:`, follow the fallback in `/session:rep` § 3c gap rule.

The trip-wire concern is *un-signposted* leaps that feel like "I should already know this" — those are what cause shutdown, not new material per se.

### Proof drilling — recognition ≠ reconstruction

Four rules govern proof drilling specifically:

1. **Never assume reconstruction from one pass.** Reading a proof builds recognition. Writing a proof once builds partial procedural memory for the *execution* (the typing of the steps). Neither builds the *strategy-selection cue* ("when I see X, I reach for contradiction") — that move was made silently once and is not rehearsed by re-reading. Default assumption: from cold, after weeks, the user has zero ability to reconstruct unless we've drilled it ≥ N times. Calibrate accordingly — don't ask for full reconstruction the first time a proof is touched after a hiatus; expect a sketch with hints, then ratchet up across sessions.

2. **Reps are high-volume and spaced, not one-shot.** Each proof gets multiple reps across sessions, with diminishing cost per rep (first attempt: many hints; fifth: one hint; twentieth: reflex). Fold proof reconstruction into the cooldown / muscle-memory cycle, not just computational drills.

3. **Document the failed thinking, not just the outcome.** When a proof attempt fails, the most valuable artifact is the *trace of the strategy that didn't work*: "tried direct, hit wall at step X, didn't switch to contradiction." Capture this in the drill's `Marking` section under a `Failed strategies` heading, alongside the existing `Verdict`, `What's correct`, and `What's missing or wrong` fields. Without this trace, the next failure looks new because the previous one's thinking wasn't captured, only its outcome — that's how every attempt at a proof comes to feel like starting from scratch. Each rep on a recurring proof gets a `Rep #N` entry under the marking section recording: outcome, hints required, and (on failure) the failed-strategy trace.

4. **Separate "solve cost" from "formalize cost" — they are different competencies and need different time budgets.**
   - **Solve cost** = reach the correct strategy + construction + bookkeeping. Sketch-grade output is fine — bullet points, abbreviated prose, exam-style "jot it down for full credit." This is what reps consolidate. Reflex target: under 5 min for a consolidated proof.
   - **Formalize cost** = polish the sketch into reader-ready prose: compact wording, correct grammar, no redundancy, structural flow, formal mathematical style. This is a *separate* skill that tracks general mathematical maturity, not per-proof reps. Do NOT put hard per-proof time targets on it — formalizing speed grows slowly across years, not weeks. A consolidated proof can have ~5-min solve cost but 30-min formalize cost without that being a regression.

   When marking reps, distinguish: *did they solve it* (rep target) vs *did they polish it formally* (separate, ungated). When the user produces a correct sketch, that's a passed rep — don't keep them at the whiteboard chasing formal polish during the rep itself.

### Mentor framing

When the user makes a mistake on any rung: frame it as tightening the argument, not as "wrong." Phrasing like "here's a cleaner way to see this" or "let's nail this hypothesis down" beats "that's incorrect." Always explain the fix, never just flag the error. Hint cadence when stuck: one-sentence hint → second hint → show answer. No grinding past 30 min per problem.

## Coordinating with root

See the root `CLAUDE.md` for the squash-merge rule, the reminder that Claude never auto-merges, and the chapter-sprint branch model that drills can run inside.

`/drill` operates on the invoking branch (unless on `main`, where it warns once then commits there, or the user asks to branch elsewhere). `/session:rep` commits on the current branch — a sprint branch during a chapter, or a working branch between chapters. There is no separate workflow branch and no scope guard, because drilling also enriches `Concepts/`. The only constraint is the vault-lint pre-commit hook, which checks concept-note shape on every branch.

For aggregation operations across the three drill state files (stale-row scans, recurring-pattern detection, vocab cleanup, bucket exemplar swaps, lifecycle audits), see `/backlog`. Most aggregation fires automatically from `/plan:close`; `/backlog` can also be invoked directly when the user wants a sweep.
