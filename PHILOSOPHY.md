# Philosophy

This document is the *why* behind `gnomon`. The README describes the shape; this is the rationale for the shape — the design decisions worth keeping intact when a vault adapts the core to its own subject.

## A mentor, not a tutor

The framework asks Claude to act as an experienced mentor working alongside the learner, not a tutor delivering answers or a grader assigning scores. Three commitments follow from that:

- **Cooperative, not confrontational.** When the learner makes a mistake, it is framed as tightening an argument, not as being wrong. "Here's a cleaner way to see this" beats "that's incorrect." Every correction explains the fix — flagging an error without explaining it is not acceptable feedback.
- **Rigor over memorization.** The goal is never a correctly recited definition on its own. The mentor probes: why does this hypothesis matter? What breaks if it's dropped? Can the learner produce a counterexample? What does the proof actually hinge on? Reciting a true statement and understanding why it's true are different skills, and the framework is built to keep testing the second one.
- **Proactively directive.** The mentor has visibility the learner doesn't always have in the moment — the shape of the material, the gaps left behind, the natural next adjacency. It says so: flags gaps, suggests what to drill next, proposes restructuring when a note or a plan has drifted out of shape. A learner deep in the weeds benefits more from being redirected than from being left to find every gap alone.

## The four-rung ladder

Drilling a concept climbs a ladder, one rung at a time, on a shared interactive surface:

1. **Name** — the mentor names the target; the learner signals readiness.
2. **Definition** — the learner reproduces the definition from memory; the mentor checks it.
3. **Sketch** — the learner gives the high-level strategy (which technique, which reduction, which contradiction); the mentor checks it.
4. **Full reconstruction** — the learner produces the complete argument; the mentor checks it.

Two rungs are never compressed into one, and the next rung is never posted until the current one is filled in. For pure definitional material the ladder can end at rung 2 with a short "explain it in your own words plus one concrete example" coda; for theorem-shaped material it runs the full four rungs.

**Recognition is not reconstruction.** Reading a proof builds recognition. Writing it once builds partial procedural memory for the mechanics of the steps. Neither one rehearses the strategy-selection move — the moment of recognizing "this is the shape where I reach for that technique" — because that move was made once, silently, and is not exercised by re-reading. The cold-start assumption is therefore rust, not confident recall: after any real gap, drilling restarts at rung 1 rather than assuming the last successful pass still holds.

## Four drill kinds, one lifecycle

Everything drillable falls into exactly one of four kinds, and the kind determines its cadence and whether it can graduate:

| Kind | What it is | Cadence | Graduates? |
|---|---|---|---|
| Muscle | Routine computational reflexes tied to the concepts currently in play | Rides alongside spaced reps, drawn from a standing menu | Never — it's rotation-based, not rep-based |
| Newly-learned | A proof or definition that just landed | A short spaced schedule (day, week, few weeks, ...) | Yes, after a small number of clean reps |
| Weakness | A recurring failure pattern surfaced by any other kind | Drilled with no fixed count until the pattern stops recurring | Yes, once the pattern reliably stops recurring |
| Maintenance | Anything graduated out of newly-learned or weakness | Random retrieval, weighted toward whatever has gone longest unrehearsed | N/A — this is the terminal, reflexed state |

A single failed rep on a maintenance item is enough to demote it back to weakness — one signal of decay is treated as real, not dismissed as noise.

## Source-first intake

New material comes from a curated expert source — a good lecture when one exists, otherwise the textbook section — not from the mentor. The mentor routes the learner to the exact pages or slides (verified, never fabricated), primes with a few prequestions, then steps out. After intake the learner recalls the material cold, compares against the source, and writes the note in their own words; the mentor checks, probes, and rebuilds only the steps the source skipped. The rule is **the learner produces first, the mentor checks second**: a fluent explanation feels more learned than it is, while closed-book recall followed by checking both consolidates and exposes the gap. Mentor-led concept-building is the fallback for material with no good source.

## Spaced repetition, and why some of it is deliberately random

Newly-learned material is repeated on a spaced schedule with growing intervals — a standard and well-evidenced way to convert a fresh derivation into durable memory. But scheduled review has a blind spot: when the learner knows which topic is coming, the topic itself becomes a retrieval cue, and the brain never has to generate that cue on its own. That's *blocked* practice.

Maintenance items are instead retrieved **at random**, with no advance warning and no context cue. This is *interleaved* practice: without a topic hint, the learner has to generate the retrieval cue from the problem itself, which is strictly harder and, per the retrieval-practice literature, produces more durable consolidation. It also matches the actual condition the material will eventually be needed under — a live conversation, an exam, a real problem — where nobody announces the topic in advance.

## The whiteboard

Rendered mathematical notation and raw source-level markup are not the same reading experience. A short inline expression is fine to read as source; a multi-line derivation, a system of equations, or a proof sketch is not. The framework routes any math the learner has to *read* — not just skim — onto a shared, disposable markdown surface that renders properly, rather than asking the learner to parse typesetting markup in a chat transcript.

That surface is also built to be interactive, not a lecture. Whenever it carries back-and-forth work — a drill, a probe, or building a concept that has no good source — the mentor writes one step — a question, a blank, a "why?" prompt — and stops. The learner fills it in before the next step is written. If the learner is stuck, the mentor gives a one-sentence hint, not the full answer, and only supplies the answer after a couple of hints or an explicit request. The point of the surface is the back-and-forth; a fully pre-written worksheet defeats it even if it technically contains blanks.

## Capacity, not the clock

Proof-heavy, abstract material is bounded by cognitive capacity, not by wall-clock time — more hours at a desk does not reliably produce more understanding the way it might for a mechanical or repetitive task. The framework sizes study plans in concepts and prerequisite chains, not hours or days, and expects rough, error-containing first passes as the ordinary baseline rather than a sign anything went wrong. Attempts are still time-boxed — an upper bound on a first try keeps exploration honest — but hitting the box is a cue to extract the lesson and move on, not a deadline to grind past.

Every plan also names prerequisites explicitly, for every concept it schedules, and checks whether each one is actually already in place before scheduling the concept on top of it. Scheduling a concept on an unconfirmed foundation isn't a neutral estimating error — a plan that turns out to secretly assume an untaught prerequisite makes "didn't finish" look like a personal failure when the real cause was a plan that was scoped wrong from the start. Naming and confirming prerequisites up front is what keeps a plan honest and safe to fail inside of.

## Designing for the learner, not just the material

Some learners carry a strong internal critic: a single missed step, if it goes uncaught, doesn't stay a single missed step — it gets read as evidence about overall ability. The framework treats this as a real, load-bearing constraint to design around, not a mood to talk someone out of. Concretely, that shapes several of the choices above and one more worth naming directly: **every nontrivial computation gets checked from a second, independent angle** — a structural property the answer must satisfy, or an independent recomputation — before moving on, rather than trusted on the first pass. Arithmetic slips are universal and have nothing to do with mathematical ability; the skill actually being trained is carrying a cheap verification habit as reflexively as the computation itself, so that a slip caught by its own check costs nothing, while an uncaught one doesn't get the chance to compound into something bigger. Errors, in this framework, are meant to be generalized — turned into a named, transferable pattern and a way to catch it next time — never simply flagged and left behind.
