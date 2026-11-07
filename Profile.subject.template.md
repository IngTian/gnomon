---
layer: subject
subject: <name your field here, e.g. mathematics, physics, statistics>
---

# Profile (Subject) — Your Field & Subject-Level Calibration

The subject-level (③) companion to `CLAUDE.md`. It carries everything specific to *this* vault's field — as opposed to `Profile.psych.md`, which carries who you are as a learner regardless of subject. Copy this file to `Profile.subject.md` at your vault root and fill in every prompt; it is imported by `CLAUDE.md` via `@Profile.subject.md` so it always loads. One subject per vault, so the filename is fixed (`Profile.subject.md`) — the actual field is named in the frontmatter above and defined below.

The **test** for what belongs here vs. in `Profile.psych.md`: *"Would this still be true if you switched to a completely different subject tomorrow?"* Yes → it's person-level, put it in `Profile.psych.md`. No → it's subject-level, put it here.

Delete every `> _prompt_` line as you replace it with your own answer.

## The mentor persona

> _`CLAUDE.md` delegates the mentor's identity to this file. Define it: what expert role should the mentor embody (e.g. "a patient senior researcher in your field", "an analysis professor who loves counterexamples"), and in what tone? This is the persona the mentor adopts for every session in this vault._

## The field and its subjects

> _Name the field and list the subjects/areas this vault covers (e.g. for physics: "classical mechanics, electromagnetism, thermodynamics, quantum mechanics"). This is the map of what lives under `Concepts/` and `Drills/`: each subject is a top-level topic folder, and `/plan:create` files a new chapter under one of them. Name the folders if they differ from the subject names._

## Subject-level baseline

> _How rusty or strong are you in *this specific field* right now, and which sub-areas are weakest? (Your general learner baseline — computation vs. structure vs. construction vs. write-up — lives in `Profile.psych.md`; here, get concrete about this field: which topics you own, which are shaky, which you've never touched.)_

## Learning-mode split for this field

> _`Profile.psych.md` says whether you want methods learned run-it-first and theory learned prove-it-first. Here, name this field's concrete version: which kinds of content are "run it first" (e.g. algorithms, procedures, valuation/derivation mechanics) and which are "prove it first" (e.g. theorems, lemmas, structural results)._

## Field-specific second-angle checks

> _List the structural sanity checks specific to this field that a computed answer must satisfy — the cheap invariants that catch a dropped sign or a units mismatch (e.g. "a variance is never negative", "a probability lies in [0,1]", "units/dimensions match"). These become the reflexive verification habit for every nontrivial computation in this vault._

## Known weak spots and targeted patterns

> _Name the recurring, field-specific weaknesses worth drilling with extra reps (e.g. "dropping boundary terms in integration by parts", "choosing the coordinate system", specific notation traps). Leave blank at the start and let them accrue as drills surface them._

## Weekly rhythm

> _Name any fixed days this vault keeps: e.g. one note-reorg day and one rest day ("Wed = note-reorg, Sun = rest"), or "learn on Tue and Thu only" for a part-time subject. Say where random-retrieval pulls run if not one per rep session (e.g. a capped weekly batch). Delete this section to keep no fixed days: you call rest days as they come, and with orrery its week decides._

## Companion tools (optional)

> _Only for the companions you use; each line is read exactly as written. Keep the backticks._
>
> _`` orrery front: `<subject>` `` — the subject this vault reports to [orrery](https://github.com/IngTian/orrery) under (case-sensitive)._
>
> _`` witness lens: `<lens>` `` — the [witness](https://github.com/IngTian/witness) lens this vault writes to and reads from. Leave it out to use witness's always-on `default` lens._
>
> _`` witness dimensions: `<dim>`, `<dim>`, … `` — the dimensions of that lens an observation may use (e.g. `mastery`, `independence`, `struggle`)._
>
> _`` witness progress dimensions: `<dim>`, `<dim>` `` — the dimensions whose facets trace progress over time (e.g. `mastery`, `resilience`); `/cheer` and reorientation cite them._
