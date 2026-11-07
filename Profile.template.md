---
layer: psych
---

# Profile — Who You Are & Calibration

The "who I am" companion to `CLAUDE.md`: your baseline, how the mentor should calibrate for you, the psychology to design around, and the operating rules that follow from it. Load-bearing — it changes how everything else in `CLAUDE.md` is applied (pace, feedback framing, planning, emotional guardrails). Copy this file to `Profile.psych.md` at your vault root and fill in every prompt below with your own answers; it is imported by `CLAUDE.md` via `@Profile.psych.md` so it always loads. This file carries the person-level (②) layer only — subject-level calibration (your field, the mentor persona to adopt, the subjects this vault covers, how rusty you are specifically in *this* field, which sub-areas are weak) belongs in `Profile.subject.md` (③), started from `Profile.subject.template.md`, not here.

Delete every `> _prompt_` line as you replace it with your own answer. Nothing in this template should survive into your filled-in copy — if a prompt is still here, that section isn't done yet.

## Baseline

> _State your honest current level relative to the goal you're working toward — a rough percentage or plain description is fine. Be specific about where the gaps are: which of computation, structure recognition, constructing the right objects/functions/arguments, and write-up/proof are strongest and weakest for you. This is the single most load-bearing fact in this file — the mentor calibrates pace and feedback framing off it, so don't round it up._

## Calibration rules

> _The rules below are a starting menu drawn from what has worked for STEM learners in this framework. Keep the ones that apply to you, edit the ones that need tuning, delete the ones that don't fit, and add any of your own. Each one should end up as a rule the mentor can act on, not just a description of you._

**No great leaps.**
> _How do you want pacing handled — small steps and fast cadence, or do you tolerate bigger jumps? Say what "too much prerequisite machinery for one question" looks like for you._

**Expect rough first passes.**
> _Is a wrong or messy first attempt your normal baseline, or does a miss usually mean something specific went missing? Tell the mentor how to frame a rough first pass so it reads as expected, not as a failure._

**Time-box attempts.**
> _Give a rough upper bound on how long you'll grind on a first-pass attempt before wanting help extracting the lesson and moving on._

**Generalize every error.**
> _Do you want every mistake distilled into a named, transferable pattern ("what does this class of mistake look like, and how do I catch it next time"), or do some mistakes not need that treatment? Note any exceptions._

**Comparison policy.**
> _Is there a target (a role, an exam, a peer group) the mentor should never compare your current work against? Name it here if so, and say what that comparison does to you when it happens._

**Drill and learning calibration.**
> _Describe your default starting point for drills and reps — rusty memory that needs to rebuild from scratch, or something you can usually recall with a light nudge? This sets which rung of the ladder the mentor should open on._

**Match the learning mode to the content type.**
> _In your field, is there a split between "run it first" material (methods, algorithms, procedures) and "prove it first" material (theorems, definitions, abstract results)? Name your field's version of that split, if one exists, so the mentor knows which mode to lead with for which kind of content._

**Second-angle check.**
> _Name a few structural sanity checks specific to your field that a computed answer should satisfy (the kind of check that catches a dropped sign or a units mismatch cheaply) — these become the reflexive verification habit the mentor should train alongside every nontrivial computation._

**Plan prerequisites explicitly.**
> _Confirm you want every plan (new topic, restructuring, mid-chapter adaptation) to name prerequisites explicitly and ask before assuming one is already in place, rather than guessing. Note anything special about how you want that check to happen._

## Psychology to design around

> _This section is where the mentor learns your emotional wiring around mistakes, setbacks, and success — the part of you the framework needs to actively design guardrails around rather than ignore. Be as honest here as in the baseline section; vague answers produce generic guardrails that won't actually catch anything._

**Relationship to mistakes and setbacks.**
> _When something goes wrong — a slip, a stalled concept, a bad drill rep — does it usually stay contained to that one thing, or does it tend to escalate into a broader verdict about your ability or worth? Describe what that escalation looks like if it happens, and how early the mentor should try to catch it._

**What actually helps vs. what feels hollow.**
> _Describe what kind of encouragement or reorientation lands for you (e.g., cited evidence of specific past progress vs. generic reassurance) and what tends to feel performative or make things worse._

**The double-edged trait, if there is one.**
> _If there's a trait that's both your drive and your vulnerability (e.g., a strong perfectionist streak that pushes achievement but also turns a small miss into a global judgment), name it plainly and say which edge the mentor should nurture and which edge it should build guardrails around. Be explicit that adapting to a reflex is not the same as agreeing with the belief behind it — if there's a belief here that's actually false, say so, so the mentor knows to keep gently dismantling it rather than validate it._

**Anything else.**
> _Any other calibration notes — engagement style, how you like concepts explained, external pressures or constraints that throttle your capacity on a given day, or anything else the mentor should know to avoid mis-reading a bad day as a bad learner._

## Working setup

**Editor.**
> _Where do you read Claude's replies — the terminal, VS Code, another editor? Say whether it shows math typeset or as raw LaTeX source. The mentor moves math to the whiteboard when your chat can't render it._

**Reply language.**
> _Which language should the mentor reply in? "The one I'm writing in" is a fine answer; say so if you switch languages and want it matched turn by turn._

## Emotional-safety calibration

The commands (`/drill`, `/session:*`, `/cheer`) read this section when a session goes badly. Root `CLAUDE.md` § Distress and support holds the default protocol; this section adds what is yours.

**Trip-wire phrases.**
> _List the phrases or thought patterns you fall into under frustration (e.g. "I can't do this", "I'm not good enough"). Any of them halts the session and switches to reorientation: the facts of what you have actually done, then `/cheer`'s cited evidence. The mentor also treats any voiced self-doubt about your ability as a trip-wire, listed or not._

**Support resources.**
> _If you ever voice acute distress or thoughts of self-harm, the mentor stops the session's work and points you to real people. By default it suggests someone you trust or a professional, local emergency services if you are in immediate danger, and a crisis line: 988 (call or text, US and Canada), or https://findahelpline.com elsewhere. Add your own here: a person to reach, your doctor or therapist, your local crisis line, and any phrasing that helps you in that moment; the mentor offers them first. Emergency services in immediate danger always stay._
