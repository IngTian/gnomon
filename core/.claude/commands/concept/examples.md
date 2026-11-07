---
description: Generate the 4-example spread (concrete / edge / counter / short proof) for a concept note. Appends to # Examples as drafts.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion, WebFetch
---

You are `/concept:examples`. Generate a calibrated example spread for a single concept note and append drafts to its `# Examples` section.

# 1. Resolve the target note

Resolution protocol:

1. If `$ARGUMENTS` is non-empty: path first, then title lookup under `Concepts/`, disambiguate on multiple matches via `AskUserQuestion`.
2. If empty: most recent git change in the last 7 days under `Concepts/**/*.md` (excluding `Concepts/CLAUDE.md`), then mtime fallback, then prompt.
3. Announce the target: "Generating examples for **<Note Title>**."

# 2. Read context

- Read the target note fully.
- Read its `Properties/` subfolder (if present).
- Read direct backlinks — notes that contain `[[<Note Title>]]`. Use `grep -rln '\[\[<Title>\]\]' Concepts/`.
- Read the vault's example conventions from [[Note Standard]] so your drafts match house style.
- **Read the cited source first.** If the brief has a `Source:` field, open that section (see root `CLAUDE.md` § Source-First Intake) and collect its worked examples and exercises. If there is no `Source:`, ask which source the note came from before generating; generate from scratch only if there is none.

# 3. Generate the spread

**Source first, then fill.** For each of the four slots below, lift a fitting example or exercise from the source when it has one, with a plain-text citation (e.g. `(<Book> Ex. 4.3)`) and no draft marker. Generate only the slots the source leaves empty — usually the edge and counter cases. A Python figure (per [[Note Standard]]'s figure pipeline) is fine when a picture carries the example.

Produce four examples tailored to the concept, with difficulty calibrated to the surrounding notes (don't drop measure-theory machinery into a set-theory file):

1. **Concrete instance.** A direct, canonical illustration of the definition/theorem working as expected. The "does what it says" example.
2. **Edge case / degenerate.** Something at the boundary of the hypotheses — a one-point set, identity map, zero function, trivial group — where the concept still applies but barely. Name the degeneracy.
3. **Counter-example.** A case that violates a hypothesis and shows the conclusion fails. Explicitly state which hypothesis is violated and what goes wrong.
4. **Short proof exercise.** A 2–4 line proof problem whose solution exercises the note's technique. Pose it as a problem; don't provide the solution.

Format each as a `> [!example]` callout. End every Claude-generated example with `%% draft — please review %%` so the user can find it with grep. Use LaTeX consistent with the note (match their existing $…$ vs $$…$$ conventions).

Example of the format:

```markdown
> [!example]
> **Concrete.** For $f(x) = x^2$ on $\mathbb{R}$, $Df(x_0) = 2x_0$ as a linear map $h \mapsto 2x_0 h$.
> %% draft — please review %%
```

# 4. Append to the note

- Locate the `# Examples` heading in the note. If it exists, append the four callouts after any existing examples, separated by blank lines.
- If it doesn't exist, add a `# Examples` heading at the end of the file and then the four callouts beneath it.
- Preserve everything else in the note character-for-character. Do not reformat LaTeX, reflow prose, or touch existing callouts.

# 5. Report

Print a short confirmation:

```
Appended 4 examples to Concepts/<path>:
  • Concrete: <one-line summary>  (<source citation> | draft)
  • Edge:     <one-line summary>  (<source citation> | draft)
  • Counter:  <one-line summary>  (<source citation> | draft)
  • Proof:    <one-line summary>  (<source citation> | draft)

Drafts marked `%% draft — please review %%`; source lifts carry their citation. Revise or remove as needed.
```

# 6. Constraints

- **Do not commit.** Leave the edit in the working tree; the user decides when and whether to commit.
- **Do not switch branches.** The command runs on whatever branch the user invoked it from.
- **Do not solve lifted source exercises.** Pose them; the solution is the learner's.
- **Do not invent intuition prose outside the examples.** This command only adds `[!example]` callouts; it does not touch `# Intuition`, `# Definition`, `# Statement`, `# Proof`, etc.
- **Respect difficulty calibration.** If the surrounding notes in the same topic are undergraduate-analysis, don't drop functional-analysis concepts into examples.
- **One concept per example.** Don't cram two illustrations into one callout.
