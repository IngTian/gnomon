# Concepts — Claude Instructions

This CLAUDE.md is loaded when Claude operates under `Concepts/`. It scopes mentor context for concept-note work; the durable note-shape rules live in [[Note Standard]] at the vault root.

## When this file applies

- Reading, drafting, editing, or auditing any note under `Concepts/`.
- Loaded alongside the root `CLAUDE.md` (mentor persona, git/PR workflow, naming convention) and `[[Note Standard]]` (note shape, taxonomy, wiki-link convention, knowledge-DAG / driver test, draft markers, folder layout, figure pipeline).

## Mentor context for Concepts/ work

- The five standing responsibilities (verify correctness, generate practice material, explain concepts, restructure occasionally, route to source) from root apply here in full. Audits and example-generation are the two most common asks under this scope.
- **Preserve LaTeX math character-for-character** unless the user explicitly asks for a math change. This is the one edit rule that gets reasserted often enough to belong in scope.
- **Scaffold, don't author** — the line lives in root `CLAUDE.md` § Source-First Intake (authorship line); markers per [[Note Standard]] § Draft Markers.
- When the user adds a draft of a note that's missing a section, leave a `*TODO: add …*` placeholder there (or propose an example draft, if the gap is `# Examples`) rather than silently filling.
- When you spot adjacency (a sibling note that would deepen understanding, a missing driver, a candidate for the standard 4-example spread), surface it. Don't wait to be asked — proactive direction is part of the mentor role.

## Concepts-specific command coupling

- `/concept:audit <note>` — read-only structured audit (correctness, shape drift, missing pieces, wiki-link hygiene, DAG hygiene per the driver test). Fired inline by `/session:learn` at concept-close, or invoked standalone.
- `/concept:examples <note>` — generates the 4-example spread (concrete / edge / counter / short proof), lifting from the note's `Source:` first and drafting only the missing slots, and appends to the note's `# Examples` section.
- For multi-note moves, splits, or merges, defer to `/refactor` — it operates on its own branch and handles vault-wide drift. Don't restructure folders inside a concept-scoped session.

## Coordinating with the rest of the vault

- Note shape, taxonomy, callout briefs, wiki-link convention, knowledge-DAG protocol (driver test + inline-prose rule), draft markers, folder layout, property-host-folder rule, figure pipeline → see [[Note Standard]].
- Mentor persona, calibration baseline, whiteboard workflow, branch and sprint shape, slash-command index → see root `CLAUDE.md`.
- Drill flow, drill-kinds taxonomy, weakness-pattern routing → see `Drills/CLAUDE.md`.

If a rule about concept notes isn't in [[Note Standard]] or here, it doesn't exist yet — don't infer one. Ask, or surface a proposal.
