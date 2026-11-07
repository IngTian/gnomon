---
description: Read-only audit of a single concept note — correctness, shape drift, missing pieces, wiki-link hygiene. Report-only; no writes.
allowed-tools: Bash, Read, Glob, Grep, AskUserQuestion, WebFetch
---

You are `/concept:audit`. Read a single concept note and produce a structured report on what's right, what's off, and what's missing. **No file writes.**

This command has two invocation modes:

- **Inline (per-concept checkpoint inside `/session:learn`).** Fired automatically at concept-close before the wrap-up surface. The audit's findings feed directly into the wrap-up's user-confirmation list (proposals; the user accepts and the session itself applies edits later — *this command never writes*).
- **Standalone.** User spot-checks a note — could be one they wrote yesterday, a stub they want to inspect, a note flagged by `/refactor` or `/backlog`, etc. Pure report; no follow-up action assumed.

Both modes produce the same structured report. The only difference is consumer — in inline mode the parent `/session:learn` flow reads the report; in standalone mode the user reads it.

# 1. Resolve the target note

Resolution protocol:

1. If `$ARGUMENTS` is non-empty: path first, then title lookup under `Concepts/`, disambiguate on multiple matches via `AskUserQuestion`.
2. If empty: most recent git change in the last 7 days under `Concepts/**/*.md` (excluding `Concepts/CLAUDE.md`), then mtime fallback, then prompt.
3. Announce the target: "Auditing **<Note Title>**."

# 2. Read context

- Read the target note fully.
- Read `[[Note Standard]]` (vault root) — this is the spec the audit checks against (note taxonomy, required shape, wiki-link convention, knowledge-DAG protocol, driver test, draft markers).
- Read any notes referenced by `[[wiki-links]]` in the target, to verify the links resolve. For `Depends On:` entries specifically, also read their own `Depends On:` field one level deep — needed for the transitive-redundancy check below.
- If the brief has a `Source:` field, open that source section — `Read` the PDF pages in `docs/`, or `WebFetch` the lecture deck. If it can't be opened, say so in the report rather than claim a source check.

# 3. Produce the structured report

Print (to stdout) a report with these sections, in order. Skip a section entirely if it's empty — don't write "None." Use cooperative mentor voice: cite the rule, explain why it matters, suggest the fix.

### Correctness
Mathematical issues.
- Wrong or imprecise statements (quote the exact line).
- Missing hypotheses in theorem/definition statements.
- Proof gaps: an unjustified step in a `# Proof` section.
- Notation that's ambiguous or inconsistent with the rest of the note.
- **Against the source.** If the brief has a `Source:` field, check the note against that section: statements or hypotheses that drift from the source, or source notation changed without a one-line mapping. Quote both the note line and the source location.

### Shape
Drift from the required structure in `[[Note Standard]]`.
- Missing `[!info]` brief callout.
- Wrong `#Type/` tag (e.g. a Theorem-shaped note tagged `#Type/Definition`).
- Missing required sections: Definitions need `# Intuition`, `# Definition`, `# Examples`. Theorem/Lemma/Proposition/Property need `# Summary`, `# Statement`, `# Proof`, `# Examples`. (The geometric picture lives inside `# Intuition` / `# Summary`; flag a standalone `# Geometric Picture` section as drift.)
- Property notes not inside a `Properties/` subfolder.
- Empty brief fields left dangling (e.g. `**Generalization:** `, `**Depends On:** `, `**Properties:** ` with no value). Dangling is allowed by spec — these are forward-looking placeholders. Note them as informational, not as violations.

### DAG Hygiene
Adherence to the Knowledge-DAG Linking Protocol (see `[[Note Standard]]`).
- **Driver test failures:** entries in `Depends On:` that look routine rather than driver — e.g., `[[Continuity]]` listed only because the theorem's hypothesis says "continuous", with no proof step that *applies* continuity as a lever. Quote the entry and explain why it looks routine. The driver test asks: "Does the proof or definition body actually *use* this concept as a lever, or is it just background context?" Routine references go in the brief callout's narrative, not in `Depends On:`.
- **Transitive redundancy:** entries in `Depends On:` reachable via another listed entry. Walk the listed parents' own `Depends On:` fields one level deep; if a sibling parent is in the chain, flag it.
- **Cardinality smell:** more than 3 entries in `Depends On:`. Suggest factoring through an intermediate lemma; identify which entries look weakest.
- **Inline ancestor links in prose:** wikilinks `[[X]]` appearing in `# Summary` / `# Intuition` / `# Statement` / `# Proof` body where `X` is in this note's `Depends On:` (or a transitive ancestor). Cite the line and quote the link. Peer-reference links (e.g., a sibling theorem in `# Examples`, or a related-but-not-ancestor note) are NOT flagged.

### Missing
Content gaps inside the existing structure.
- Open `*TODO: add intuition*` / `*TODO: add proof*` / etc. — list them.
- `# Examples` section exists but is empty.
- `# Intuition` is a paragraph of `*TODO*` markers rather than actual content.
- `[!example]` callouts tagged `%% draft — please review %%` that may need your review.

### Wiki-link hygiene
- `[[links]]` that don't resolve to any file in the vault. Search all of `Concepts/` and `Drills/`, plus vault-root `.md` files (so links like `[[Note Standard]]` and `[[Plan]]` resolve).
- Folder-qualified links like `[[Topic/Note Title]]` that should be bare. Exception: if a folder-qualified link appears inside a `[!proof]` callout or was clearly written by the user as-is, don't flag it (per `[[Note Standard]]` wiki-link convention).
- Orphan status: note this if the target note has zero incoming links (`grep -rln '\[\[<Title>\]\]' Concepts/ Drills/` returns nothing). This isn't a bug — just an observation.
- Note that *ancestor* wikilinks in prose are checked under "DAG Hygiene" above, not here. This section covers only resolution and folder-qualified syntax.

### Suggestions
Optional — use this only for proactive direction, not duplicates of the issues above. For example:
- "You don't have a `[[Directional Derivative]]` note yet — worth adding, given how central it is to what you've got here."
- "Strong candidate for `/concept:examples` — only one example is present."
- "This proof has a construction step (build a sequence with $\delta_k = 1/k$) that's a recurring pattern in your work — worth noting in the brief callout's *Strategy:* line."

# 4. Constraints

- **No file writes.** This is a read-only audit. The `/session:learn` wrap-up phase, or the user, decides what to act on.
- **No branch checkout.**
- **Cite specific lines** when pointing at an issue (`line 37:`, or quote the exact text).
- **Voice:** mentor framing, cooperative. "Here's a way to tighten this…" beats "This is wrong."
- **Do not grade the mathematics beyond flagging errors.** The user is the source of truth for what they want to learn; the audit's job is to catch mistakes and drift, not to gate-keep mathematical taste.
- **Short or empty reports are good.** Clean note → short report. Don't manufacture findings to fill space.
- **Do not propose drill promotions or vocab additions here** — those are `/session:learn` wrap-up's job. The audit reports drift; downstream commands route slips.
