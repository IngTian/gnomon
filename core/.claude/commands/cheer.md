---
description: Evidence-grounded encouragement — surface cited proof of progress (witness archive, commits, landed notes, cleared drills) to refill motivation and catch setback-spirals. Read-only.
allowed-tools: Bash, Read, Glob, Grep, mcp__witness__get_facets, mcp__witness__get_profile, mcp__witness__search_observations
---

# /cheer — evidence-grounded encouragement

Surface **cited** proof of progress to refill motivation and catch setback-spirals before they harden. Every line is anchored to a real artifact — a witness observation, a commit, a landed note, a cleared drill rep. Never uncited praise. **Read-only:** this command reads the record and reflects it back; it writes nothing.

The reason this exists: learning hard material is setback-heavy, and for a learner with high self-expectations a run of slips can spiral into a global self-verdict ("I keep failing → I'm not good enough"). The counterweight is a positive feedback loop built on *evidence* — proof aimed at the exact doubt. Hollow praise backfires (the learner detects it instantly); the whole value is that every claim cites a real artifact.

## When it runs

Three entry points (mirrors the Progress Ledger surfacing triggers in root `CLAUDE.md`):

1. **On-demand.** User types `/cheer`, or `/cheer <topic>` to focus (e.g. `/cheer linear-algebra`, `/cheer computation`).
2. **Pre-spiral catch (proactive).** Fire on *milder* setback signals — a rough drill run, several slips in one session, a stalled or deferred concept, visible frustration — *before* they harden into acute distress. This arm is a **behavior you follow**, not a background process: you notice the signal and run the engine. **Sparing** — genuine setback only; potency dies if it becomes noise.
3. **Reorientation positive-close.** When the reorientation flow (the trip-wire, root `CLAUDE.md` § Distress and support) fires and the facts have been reconstructed, close it by surfacing trajectory evidence — "here are three things you did this week you couldn't do a month ago" — so the moment lands on cited proof, not just generic reassurance. (For acute distress or any self-harm ideation, never run `/cheer`: the support protocol in that same section governs. This positive-close is for mild setbacks only.)

Distinct from the `/plan:close` retro (chapter-boundary archive surfacing). `/cheer` is any-time and setback-targeted.

## What it must never be

**Hollow.** The learner detects empty praise instantly and it actively backfires (see what helps vs. what feels hollow in `Profile.psych.md` § Psychology to design around). The entire value is that **every claim is cited to a real artifact.** If you can't cite it, don't say it. No grading, no scores, no "great job!".

## Phases

### Phase 1 — Read the record

Pull evidence, in priority order. Read broadly before selecting:

1. **Witness archive (primary, when the `witness` tools are available).** Lens and progress dimensions per root `CLAUDE.md` § Progress Ledger (`Profile.subject.md`'s `witness lens:` and `witness progress dimensions:` lines; without a lens line, `"default"`).
   - `get_facets(lens=<lens>)` → the progress dimensions' facets (written specifically to cite trajectory arcs). `get_profile(lens=<lens>)` is optional, for the readable prose overview.
   - `search_observations(lens=<lens>, query=<the current struggle, or the `/cheer` topic arg>)` → raw observations relevant to *this* moment.
2. **Recent git history.** `git log --oneline -30` (and `git log --stat` as needed) — concepts landed, proofs built, rules encoded, drills graduated. Commits are dated, undeniable receipts.
3. **Landed notes + drills.** Recent concept notes under `Concepts/`; graduated / clean reps in `Drills/Schedule.md`.

### Phase 2 — Select with the contrast mechanic

The least-hollow cheer is **then→now**. Match the evidence to the wound:

- Setback is a *computation* slip → pull a recent *computation* win, ideally a "couldn't do X a short time ago → did X" arc (the progress facets are built for exactly this).
- Setback is a *stall* on a concept → pull the last concept that also felt stuck and then landed.
- On-demand with no specific wound → lead with the strongest recent arc from the progress facets.

Pick **2–4 items**, most-relevant first. More dilutes; fewer feels thin.

### Phase 3 — Deliver

- **Evidence-first, warmth-second.** State the cited facts plainly; let the warmth sit in the framing, not in adjectives. Proof over pep; understated over effusive — you respect the learner by handing them receipts.
- **Cite every claim** — the observation, the commit, the note, the rep.
- **Reply in the learner's language** (per `Profile.psych.md` § Working setup; otherwise the language they are writing in); tone-match, don't language-switch.
- **Keep it short** — 2–4 cited items and a one-line close. A refill, not a report.

## Constraints

- **Read-only.** No file writes, no witness writes — recording growth stays `record_observation`'s job at session/chapter boundaries. `/cheer` only reads and reflects.
- **Sparing on the proactive arm.** Genuine setback only, with restraint between fires. The "never volunteer progress reports unprompted" rule still holds: the proactive arm is gated to real setbacks, not a heartbeat.
- **Never invent.** If there is genuinely no fresh evidence to cite, say so honestly and reach for the nearest real arc — do not fabricate a win. (There almost always is one.)
- **Not difficulty-regulation.** Keeping setbacks at a reasonable level lives in the planning/calibration layer (capacity-sizing, time-boxing), not here. `/cheer` does one thing: cheer, with receipts.
