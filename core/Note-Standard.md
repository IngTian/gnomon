# Note Standard

This is the canonical reference for how concept notes look in this vault — taxonomy, required shape, wiki-link convention, the knowledge-DAG protocol, and the driver test that decides what goes in `Depends On:`. If I'm writing a new concept note or auditing an existing one, this is the document I check against.

It is not loaded automatically into Claude's context — `Concepts/CLAUDE.md` carries a thin loading-trigger and points here. The full standard lives in one place so I can read it cover-to-cover when I want a refresher, and so the rules don't fragment across three CLAUDE.md files.

Drill artifacts are *not* covered here. Their shape (drill kinds taxonomy, lifecycle, schema, vocabulary workflow) lives in `Drills/CLAUDE.md`. This document is concept-note specific.

---

## 1. Note Taxonomy

Every note carries exactly one `#Type/` tag, drawn from four semantic categories:

- **`#Type/Definition`** — *what an object is*. Introduces a new object via a membership criterion.
- **`#Type/Property`** — *what is true of a single object*. Describes an internal characteristic, behavior, or invariant of one specific concept (an *intrinsic* property — true of the object itself, regardless of what other objects exist). Lives in a `Properties/` subfolder under its host concept's folder.
- **`#Type/Theorem` / `#Type/Proposition` / `#Type/Lemma`** — *a relationship between multiple objects*, or a statement about a class of objects. The three subtags differ only in role/severity (Lemma = subordinate to a Theorem, Proposition = standalone result, Theorem = major standalone result); **they share one note-shape category** (Summary / Statement / Proof / Examples — see § 2). Audits and refactors should treat them uniformly.
- **`#Type/Axiom`** — *what is assumed, not derived*. The one statement type whose defining feature is the **absence** of a proof.

### 1.1. Why Axiom is its own type

Definitions carry no truth value; theorems, propositions, lemmas, and properties are all *derived* and carry a `# Proof`. An axiom is asserted. There is no slot for "true by assumption" among the other three, so an axiom forced into the Property or Theorem shape carries a `# Proof` section that can never be filled — a shape error the taxonomy itself creates.

**A type earns its place by preventing a wrong shape, not by member count.** The expected population is small — a field typically has a handful of genuine axioms — and that is fine.

**What replaces `# Proof`:** `# Independence` — the structure in which the axiom *fails*. That section does the same structural work a proof does (it justifies the statement's status), and it is what keeps an axiom from being vacuous. See § 2.4.

**Axioms normally have empty `Depends On:`** — by construction an axiom has no drivers. If you find yourself wanting to fill it, the note is probably a theorem in disguise.

**Placement:** at the topic level alongside the object it constrains, *not* inside `Properties/`. An axiom is not a property, so the `Properties/` subfolder rule (§ 8.1) does not apply to it, and it must **not** be listed in the host's `Properties:` field. Folder adjacency carries the host relationship, exactly as it does for properties.

The Property-vs-Theorem distinction matters for placement:

- **Property** = true of *one* object → goes in that object's `Properties/` subfolder.
- **Theorem / Lemma / Proposition** = relates *multiple* objects → goes at the topic level.

Rule of thumb: if removing the "host" definition would make the note pointless, it's a Property. If the note coordinates two or more independently-meaningful concepts, it's Theorem-shaped. Example: *Uniqueness of the Identity* is a Property of a group (one object). *Mean Value Theorem* is Theorem-shaped (relates the derivative to function values at endpoints — multiple objects).

---

## 2. Required Note Shape

### 2.1. Every note starts with a brief `[!info]` callout

**Definition brief:**

```markdown
> [!info]
> **Created:** DD/MM/YYYY HH:mm:ss
> **Tags:** #Type/Definition #Topic/<path>
> **Generalization:** [[Parent Concept]]       ← leave empty if none
> **Depends On:** [[Driver Concept]]         ← driver concepts; leave empty if none
> **Properties:** [[Property Note]]          ← leave empty if none
> **Source:** <Course> Lecture 5 slides pp.5–12; <Book> §4.2 pp.85–88  ← plain text, no wikilinks (see below)
```

**Theorem / Lemma / Proposition brief:**

```markdown
> [!info]
> **Created:** DD/MM/YYYY HH:mm:ss
> **Tags:** #Type/Theorem #Topic/<path>
> **Depends On:** [[Driver Theorem]], [[Driver Concept]]  ← see § 4–5 below; leave empty if none
> **Source:** <Course> Lecture 5 slides pp.5–12; <Book> §4.2 pp.85–88  ← plain text, no wikilinks (see below)
```

**Property brief:**

```markdown
> [!info]
> **Created:** DD/MM/YYYY HH:mm:ss
> **Tags:** #Type/Property #Topic/<path>
> **Depends On:** [[Lemma Used in Proof]]  ← non-host drivers only; the host concept is implicit via folder placement, do NOT list it
> **Source:** <Course> Lecture 5 slides pp.5–12; <Book> §4.2 pp.85–88  ← plain text, no wikilinks (see below)
```

**Axiom brief:**

```markdown
> [!info]
> **Created:** DD/MM/YYYY HH:mm:ss
> **Tags:** #Type/Axiom #Topic/<path>
> **Depends On:**   ← normally empty; an axiom has no drivers by construction (§ 1.1)
> **Source:** <Course> Lecture 5 slides pp.5–12; <Book> §4.2 pp.85–88  ← plain text, no wikilinks (see below)
```

The host concept is **not** listed in a Property's `Depends On:` — it's already established by the folder layout (`<Host>/Properties/<Property>.md`) and by the host's own `Properties:` field pointing in. Repeating it in `Depends On:` would be redundant. List only the *non-host* drivers — typically theorems or lemmas the property's proof leans on.

Keep empty fields as dangling placeholders (e.g. `**Generalization:** ` with nothing after) — they're forward-looking prompts to fill in later, not errors. I don't delete them during edits, and `/concept:audit` does not flag them.

**`Source:`** names the expert source the note was learned from — lecture deck + PDF page range, book section + pages — per root `CLAUDE.md` § Source-First Intake. It is **plain text, never a wikilink**: it is not a structural field (§ 3.1), and the hook resolves every `[[…]]` in the note. Required on **new notes only** — there is no retroactive backfill of existing notes; add one to an old note only when it is next reworked against a source.

### 2.2. Definition body

```
# Intuition          (plain English + geometric picture — prose, image, or both)
# Definition         (the [!definition] callout)
# Examples           (one or more [!example] callouts)
```

`# Intuition` carries both the verbal intuition *and* the geometric/spatial picture (figures via `![[image.png]]` live here) — one section, because most geometric content folds naturally into the intuition. If a concept genuinely has no useful spatial picture, the intuition is just the verbal part — that's fine.

### 2.3. Theorem / Lemma / Proposition / Property body

`#Type/Theorem`, `#Type/Lemma`, `#Type/Proposition`, and `#Type/Property` share one note shape — they are all "Theorem-shaped" and use the same structure. The tag picks out role (Theorem vs Lemma vs Proposition) or scope (Theorem-shaped result vs Property-of-one-object); the body layout is identical:

```
# Summary                 (plain-English intuition + geometric picture — prose, image, or both)
# Statement               (the [!theorem] / [!lemma] / [!proposition] / [!property] callout)
# Proof                   (the proof, ending with <span class="qed"></span>)
# Corollary / Corollaries (optional — see below)
# Examples                (one or more [!example] callouts)
```

`# Summary` carries both the verbal intuition *and* the geometric picture (figures via `![[image.png]]` live here), mirroring `# Intuition` on Definition notes. There is no standalone `# Geometric Picture` section.

**Statement callout per type.** Pick the callout that matches the `#Type/` tag:

- `#Type/Theorem` → `> [!theorem]`
- `#Type/Lemma` → `> [!lemma]`
- `#Type/Proposition` → `> [!proposition]`
- `#Type/Property` → `> [!property]` (custom callout — styled in `.obsidian/snippets/math-callouts.css`)
- `#Type/Axiom` → `> [!axiom]` (custom callout — same snippet; see § 2.4)

A `[!property]` is semantically *intrinsic to one object* (the host concept), distinguishing it from theorems / lemmas / propositions which relate multiple concepts. The custom callout preserves that semantic distinction visually in the typeset note.

**Geometric picture lives in `# Summary` (theorems) / `# Intuition` (definitions).** Most theorems have a useful picture (Rolle: horizontal tangent on a closed-and-equal-endpoint curve; MVT: tangent parallel to chord; EVT: continuous-image-of-compact attains its bounds). Properties often have one too (triangle inequality of a metric: the direct path is never longer than a detour). Fold it into the Summary/Intuition prose, with a figure if helpful. When the result is genuinely abstract and resists a picture, the Summary is just the verbal part — no need to flag the absence.

**Corollary section (optional).** Corollaries land naturally on their parent theorem/proposition, so a `# Corollary` (one) or `# Corollaries` (multiple) section between `# Proof` and `# Examples` is allowed and encouraged. Each corollary is a `[!corollary]` callout (with a short title after the keyword) followed by its own `*Proof.*` block ending in `<span class="qed"></span>`. I don't promote a corollary to its own note unless it grows enough machinery to stand alone.

**Images in examples.** Inside an `[!example]` callout, an image beneath the prose (Obsidian `![[image.png]]` syntax) is a natural and encouraged fit — a sketch of the geometric setup often does more than another paragraph. The same applies to the `# Intuition` / `# Summary` section where the geometric picture now lives. Keep the prose explaining what the image shows; the image supplements, doesn't replace.

### 2.4. Axiom body

```
# Summary          (plain-English intuition + geometric picture — prose, image, or both)
# Statement        (the [!axiom] callout)
# Independence     (the structure where the axiom FAILS — replaces # Proof)
# Examples         (one or more [!example] callouts)
```

**`# Independence` is the axiom's analogue of `# Proof`.** An axiom cannot be proved — that is what makes it an axiom — but it still owes the reader a justification for *existing as a separate assumption*. That justification is a structure satisfying everything else while violating this one. Without it, the axiom might be a hidden theorem, or vacuous.

Canonically: completeness of $\mathbb{R}$ is independent because $\mathbb{Q}$ is an ordered field in which $\{x \in \mathbb{Q} : x^{2} < 2\}$ is bounded above with no rational supremum. The parallel postulate is independent because spherical and hyperbolic geometry satisfy the other four.

**A `#Type/Axiom` note must not contain a `# Proof` section** — the pre-commit hook rejects it (§ 11). If you find you *can* prove the statement from what the vault already has, it isn't an axiom in this development; retype it as a Theorem or Property.

**No `# Consequences` section.** What an axiom buys you is exactly its backlink set, and § 4 already defines backlinks as "notes that directly build on this one." Obsidian renders that for free; restating it in prose would violate the link-don't-duplicate rule (§ 3, § 6).

**How to generate figures.** Default to a matplotlib / plotly script run in a local, gitignored working directory (e.g. `.py-plot/`) rather than hand-written SVG. Plotted figures look cleaner, are reproducible, and can be regenerated when the example changes. The exact directory and pipeline setup are local — gitignored so the script + venv don't pollute the repo. Hand-written SVG is a last resort — use it only if the figure is genuinely diagrammatic (e.g., commutative diagrams, abstract set-membership pictures) and Python plotting would be the wrong tool.

---

## 3. Wiki-Link Convention

**Two rules, in order of importance.**

### 3.1. Wikilinks live in the brief callout's structural fields only

The only places a wikilink appears in a concept note are the structural fields of the `[!info]` brief at the top:

- `**Generalization:**` (Definition only)
- `**Depends On:**`
- `**Properties:**` (Definition only)

`**Source:**` sits in the brief too but is **not** a structural field — it is plain-text provenance and carries no wikilinks (§ 2.1).

**Every other section — `# Summary`, `# Intuition`, `# Definition`, `# Statement`, `# Proof`, `# Corollary`, `# Examples` — carries no wikilinks.** Concept names in prose are written as plain text.

This is a strong rule. It applies even when an example or remark genuinely refers to another concept by name. Reader navigates via Obsidian's quick-switcher (Cmd-O), the local graph, or the structural fields of the brief — not via inline clickability.

**Why no prose links:**

- The DAG is already encoded in `Depends On:`. An inline `[[Concept]]` in prose either (a) duplicates a structural edge, or (b) creates a phantom edge that didn't make it past the driver test. Both pollute the graph.
- Two notes that share a structural parent (e.g., both list `[[Rolle's Theorem]]` in `Depends On:`) are already visually grouped in the local graph. They don't need manual peer-cross-linking — the graph shows the sibling relationship.
- Liberal prose linking inflates the global graph over time. Past ~50 notes, the global view becomes visually busy regardless of how clean each note's structural edges are; manual prose links accelerate the decay.
- Less rope to hang yourself. With one rule ("only in brief structural fields"), `/concept:audit` and `/refactor` have a single check to enforce: any `[[…]]` outside the brief is a violation.

### 3.2. Bare filename, not folder-qualified

Inside the structural fields, write `[[Note Title]]`, not `[[Topic/Subtopic/Note Title]]`. Obsidian resolves by filename so the bare form works globally and survives folder moves. The folder-qualified form is acceptable only inside preserved math / proof text the user wrote that way originally — don't rewrite such links.

---

## 4. Knowledge-DAG Linking Protocol

The vault is a **knowledge DAG**. Each theorem-like or definition note declares its **driver parents** in the structural `Depends On:` field at the top of the brief. Backlinks to a node mean exactly: "notes that directly build on this one" — transitive ancestors and routine machinery are excluded.

### 4.1. Linking philosophy — what `Depends On:` is *for*

The DAG encoded by `Depends On:` edges captures the **mathematical content** of the vault — the *learning order*, the strategic dependencies between proofs and constructions. It is **not** a visual organization tool.

Two principles, which together rule out a common failure mode:

1. **Math is genuinely a web.** Concepts interrelate. The DAG isn't going to look tree-shaped; it will have hubs (in analysis, the limit and the derivative) that drive many downstream notes precisely *because* those concepts are central. **Hub concepts are truth-respecting, not noise.** A hub means "this concept really does drive a lot of work" — that is information, not clutter.

2. **The global graph view is for navigation, not aesthetics.** Once the vault has more than ~50 notes the global graph becomes visually busy regardless of how clean the linking is. The right tool for legibility is **Obsidian's local graph (per-note neighborhood) plus graph filters** — not the global view. Trying to thin out `Depends On:` edges to make the global graph look cleaner is *destroying real information* in service of a visual goal that filtering already solves.

**Hard rule:** **Never water down `Depends On:` to thin the visual graph.** If the driver test says X drives T, list X. If the global graph looks busy as a result, that is the correct signal — use a filter to scope the view, do not delete real edges. The DAG is a description of the mathematics; do not deform the description to match a preference about the picture.

The driver test in § 5 is the *only* criterion for inclusion in `Depends On:`. Visual considerations are not.

### 4.2. The three structural fields

- **`Generalization:`** (Definition notes only) — the parent concept that this one specializes. Single link, optional. Leaving it empty is a fine signal that no parent exists (or hasn't been written yet).
- **`Depends On:`** — the driver parents (see § 5 for the test). Zero or more links. The single most important field for DAG integrity.
- **`Properties:`** (Definition notes only) — outgoing pointers to `#Type/Property` notes hosted under this concept's folder. This field is forward-looking; the canonical edge is the property note's own placement in the host's `Properties/` subfolder.

---

## 5. Driver Test

The driver test is the *only* criterion for inclusion in `Depends On:`. It is one rule with three flavors — one each for Theorems, Definitions, and Properties. Same name throughout; the test specializes to the note type.

### 5.1. Driver test for Theorems / Lemmas / Propositions

A node X is a driver of theorem T if T's **proof strategy** is *"apply X"* / *"reduce to X"* / *"construct via X"* — remove X and T needs a different idea, not just a small fix.

Three filters:

- **Routine ≠ driver.** Continuity, differentiability, limit laws, basic algebra, basic sequence machinery, open / closed sets, open balls, neighborhoods — all appear in nearly every theorem but rarely *drive* one. They are the language proofs are written in, not the levers. Plain text in the proof; do **not** list in `Depends On:`.
- **Transitive ≠ driver.** If parent A is reachable through another listed parent B, A is not a parent of T. Example: MVT's `Depends On:` lists `[[Rolle's Theorem]]`, not `[[Derivative]]` — Rolle covers the derivative edge transitively.
- **Used in statement ≠ driver.** A concept that *appears* in the theorem's statement isn't automatically a driver. Ask whether removing it would force a different *proof strategy*; if you'd just rewrite the statement using a different but equivalent gadget (open ball → open box, $\varepsilon$-ball → $\delta$-neighborhood, etc.), it wasn't driving — it was vocabulary.

### 5.2. Driver test for Definitions

A node X is a driver of definition T if T is **built around** X — the conceptual move that organizes the definition uses X as its central construct. Remove X and the definition needs a fundamentally different organizing idea, not just a notational rephrase.

**Most definitions have empty `Depends On:`.** The two common cases:

- **Specialization of a generalization.** A definition that narrows or extends another concept lists the parent in `Generalization:`, not `Depends On:`. Example: `[[Open Ball]]` generalizes to `[[Open Set]]` — fill `Generalization:`, leave `Depends On:` empty.
- **Basic construction with no precursor.** Foundational definitions (`[[Compact Set]]`, `[[Limit]]`, `[[Sequence]]`) are built on nothing; both `Generalization:` and `Depends On:` are empty.

`Depends On:` on a definition should be filled **only** when the definition is genuinely built on a prior concept's *idea*, not its *notation*. The canonical example: `[[Limit]]` is a driver of `[[Continuity]]` — continuity is *built on* the limit-of-$f(x)$ idea, and replacing the limit machinery would mean defining continuity differently from scratch.

The same three filters apply (routine / transitive / used-in-statement). The "used-in-statement" filter is the most common false-positive for definitions — `[[Open Ball]]` appears in the statement of `[[Local Extremum]]` ("there exists an open ball around $x_0$ such that..."), but it's not a driver: any neighborhood basis (open box, $\varepsilon$-cube) would let you state the same definition. So `[[Open Ball]]` stays out of `Depends On:`.

If you're filling `Depends On:` on a definition and aren't sure, the default answer is **leave it empty**. Most definitions are foundational or specialize a parent; few are genuinely built on another concept's idea.

### 5.3. Driver test for Properties

A property's `Depends On:` lists **non-host drivers only**. The host concept is implicit via folder placement (`<Host>/Properties/<Property>.md`) and the host's outgoing `Properties:` field; do not duplicate it.

Apply the **theorem driver test** (§ 5.1) to non-host candidates: a node X is a driver of the property if the property's *proof strategy* leans on X as a lever. Most property `Depends On:` entries are theorems or lemmas the proof of the property invokes.

**Many properties have empty `Depends On:`.** A property whose proof reduces to direct unfolding of the host's definition has no non-host drivers — `Depends On:` is empty. Example: a property that's true by the definition's own clauses ("the host satisfies $X$ because the definition says so") has no driver beyond the host.

### 5.4. Cardinality expectation (Theorems and Properties)

- **0 parents:** for definitions, this is the common case (see § 5.2). For properties, also common (proof reduces to definition unfolding). For theorems, it should be rare — a theorem with no driver usually means a missing edge.
- **1 parent:** theorem reduces cleanly to one prior result (MVT → Rolle).
- **2 parents:** existence/structure result combined with a characterization (Rolle → EVT + Fermat).
- **3 parents:** occasional — a theorem unifying two prior results via a third construction.
- **4+ is a smell.** Refactor through an intermediate lemma, or some entries aren't true drivers.

For definitions, cardinality 0–1 covers nearly all cases. 2 is rare and worth questioning. 3+ is almost certainly a sign that the "definition" is actually a theorem-shaped result wearing a definition's clothing — split it.

---

## 6. Inline-Prose Rule

This is the operational form of § 3.1, repeated here so it's easy to find when editing prose:

**No wikilinks in any prose section** — `# Summary`, `# Intuition`, `# Definition`, `# Statement`, `# Proof`, `# Corollary`, `# Examples`. Concept names in prose are written as plain text, regardless of whether the target is an ancestor, a peer, or a hypothetical future note.

Practical check when editing: if I'm about to type `[[`, I stop and either move the link into the brief callout's `Depends On:` (if it's a driver per § 5) or leave the concept as plain text (if it's a peer or routine).

The single allowed exception is image embeds: `![[image.png]]` syntax for figures inside the `# Intuition` / `# Summary` section and `[!example]` callouts is fine — it embeds an image, not a link to another note.

---

## 7. Draft Markers

When Claude generates content I should review:

- Examples and exercises lifted from the note's source carry a plain-text citation instead, e.g. `(<Book> Ex. 4.3)` — they are the source's, not Claude's, and take no draft marker.
- Examples drafted by Claude end with `%% draft — please review %%`.
- Proof / intuition / summary placeholders use `*TODO: add intuition*`, `*TODO: add summary*`, `*TODO: add proof*`, `*TODO: add example*`.

These markers are greppable — I can find Claude's contributions and vet them.

What Claude may and may not write into a note is the authorship line in root `CLAUDE.md` § Source-First Intake; this section covers only the markers.

`%% … %%` is Obsidian's comment syntax — invisible in reading view. I use it *only* for the draft-marker on examples. I do **not** stash planning notes, workflow seeds, or TODOs inside concept files using `%%…%%` — it can render visibly in some contexts and clutters the prose. The only allowed inline markers are the `*TODO: add …*` placeholders and `%% draft — please review %%` tags on drafted `[!example]` callouts.

---

## 8. Folder Layout Inside `Concepts/`

```
Concepts/
├── <Topic A>/       — one folder per subject in Profile.subject.md § The field and its subjects
├── <Topic B>/       — subfolders by sub-topic as the folder grows (§ 8.2)
└── <Topic C>/
```

### 8.1. Property notes get a host folder

If a definition has any `#Type/Property` notes attached to it, the definition gets its own folder (named after the definition) and the properties live in a `Properties/` subfolder inside it. This makes the host explicit — without the enclosing folder, a top-level `Properties/` is ambiguous about which concept the properties belong to.

```
Concepts/<Topic>/<Host Concept>/
├── <Host Concept>.md          ← the host definition
└── Properties/
    ├── <Property A>.md
    └── <Property B>.md
```

Trigger and consequences:

- The moment I add the first `Property` note for a concept, I promote that concept to a folder. I don't leave a top-level `Properties/` floating in a topic folder.
- Property notes' `#Topic/` tag mirrors the new depth (e.g., `#Topic/<Topic>/<HostConcept>`). The host definition's tag stays at topic depth.
- Wikilinks are bare-filename anyway, so moves don't break links — but I `grep` for any folder-qualified references before moving.

A definition with zero properties stays as a flat `<Concept>.md` file in its topic folder. Don't create the folder preemptively.

### 8.2. Folder Discipline

Subdivide a topic folder before its note count gets large. The point isn't depth for its own sake — it's that a folder of, say, 15+ peer notes silently conflates unrelated ideas, and the structure between them stops being legible. A subfolder forces me to decide what category each note belongs to, and that act of categorization is itself useful learning.

When proposing a new note in a folder, briefly check whether the folder is already heterogeneous. If it is, propose a split (subfolders by sub-topic) before adding more. The `#Topic/` tag may run two or three segments deep to mirror the folder layout — depth is a signal of structure, not a problem in itself.

---

## 9. Things to Avoid

- Don't invent intuition prose when I haven't written it yet — leave a TODO.
- Don't drop or rewrite LaTeX math during edits. Preserve it character-for-character unless I explicitly ask for a math change.
- Don't restructure the vault's folders without being asked.
- Don't add fields that the spec removed (`Types:`, `Constructions:`, `Sufficiencies:`, `Equivalences:`, and the legacy `Conditions:` — superseded by `Depends On:`) — Obsidian's backlink graph handles those.
- Don't abbreviate "Without loss of generality" to "WLOG" in prose. Spell it out in `# Summary`, `# Intuition`, and `# Proof` bodies. Symbolic notation (∀, ∃, etc.) is fine; this rule is about prose words only.
- Don't wikilink anything inline in prose. Wikilinks live in the brief callout's structural fields only (`Generalization:`, `Depends On:`, `Properties:`). Every other section — Summary / Intuition / Definition / Statement / Proof / Corollary / Examples — carries no wikilinks. Concept names in prose are written as plain text. See §§ 3 and 6 for the rule and the rationale.
- Don't stash planning notes, workflow seeds, or TODOs inside concept files using Obsidian's `%%…%%` comment syntax — see § 7.
- Don't water down `Depends On:` to thin the global graph. See § 4.1's hard rule.

---

## 10. Proof / Solution Formatting

`*Proof.*` sits on its own line (with two trailing spaces for the line break), followed by a blank line, then the proof body. I don't put the first sentence of the proof on the same line as `*Proof.*`. Personal aesthetic preference — keep it consistent across the vault. The proof block ends with `<span class="qed"></span>`, which renders as ∎.

**Solutions** (worked drills, computational examples) follow the parallel convention: `*Solution.*` on its own line with two trailing spaces, blank line, then the body, ending with `<span class="qef"></span>` (renders as □). Templater snippet at `_templates/solution.md`. Use this anywhere a worked computation needs an end-marker — most often inside a `[!example]` callout, or as the visible body of a collapsed `[!abstract]- Solution` block in drill-style notes.

---

## 11. Pre-commit Hook Coupling

The pre-commit hook in `.githooks/pre-commit` enforces required-section presence per `#Type/` tag — that is, it greps each staged note for the `#` headings listed in § 2 above for that note's type and rejects the commit if a section is missing. The hook is the runtime check; this document is the human reference.

**Coupling rule:** if I change the *required* (mandatory) sections in § 2, I update `.githooks/pre-commit` in the same commit. Letting the two drift means either the standard says one thing while the hook quietly enforces something else, or the hook starts blocking commits that match the new standard.

**Currently required sections** — the hook enforces exactly these:

- **Definition** (3 sections): `# Intuition`, `# Definition`, `# Examples`.
- **Theorem-shaped** (Theorem / Lemma / Proposition / Property — 4 sections): `# Summary`, `# Statement`, `# Proof`, `# Examples`.
- **Axiom** (4 sections): `# Summary`, `# Statement`, `# Independence`, `# Examples`. Additionally the hook **rejects a `# Proof` section** on an Axiom note — an axiom is assumed, not derived (§ 1.1, § 2.4).

The hook also rejects an **unrecognized `#Type/`** outright rather than silently skipping the shape check. A typo'd or invented type fails loudly, which means adding a genuinely new type requires updating § 2 and the hook's `case` together — that is the coupling rule doing its job.

**DAG integrity.** Beyond shape, the hook rejects a **written note that declares `Depends On:` an unwritten one.**

Why this exists: the wiki-link check (§ 3) verifies that a link *resolves* — it never verifies the target has content. That gap lets a finished theorem rest on an empty prerequisite stub for months, passing every commit, because the link resolves. *Resolution and substance are different properties, and only one of them was being checked.*

**What counts as "unwritten" is narrow, and the narrowness is the point.** The test is whether the note's **defining section** still holds a `*TODO` — `# Definition` for a Definition, `# Statement` for anything theorem-shaped or an Axiom — **not** whether the file contains a `*TODO` anywhere. The coarse version (any `*TODO` in the file) flags notes with complete statements and proofs whose `# Summary` or `# Examples` simply haven't been filled. Those are not broken dependencies. A check that cries wolf gets bypassed, so precision here is load-bearing rather than fastidious.

Three deliberate scoping choices:

- **Unwritten-depends-on-unwritten is allowed.** Scaffolding a branch of the DAG top-down is ordinary practice; the rule fires only when something *finished* rests on something empty.
- **Only `Depends On:` is scanned.** `Generalization:` and `Properties:` may legitimately point at planned or in-progress notes. `Depends On:` is the one field asserting *"this note's correctness rests on that one"* — which is the claim worth enforcing.
- **It is forward-looking, not retroactive.** Because the check runs only on staged files, a pre-existing violation surfaces the next time its note is edited rather than as a wall of failures on the commit introducing the rule. Backfilling one particular stub is a patch; this check is the structural fix, and the two are not substitutes for each other.

**Optional sections** are not hook-enforced. The current optional section is `# Corollaries` (allowed between `# Proof` and `# Examples` on Theorem-shaped notes per § 2.3) — present when there are corollaries to state, omitted otherwise. If I add a new optional section to § 2, it does *not* require a hook change.

The hook does **not**:

- enforce a branch-name scope;
- shape-lint vault-root files like this one or the drill state files in `Drills/` — they are human reference documents, not concept notes, and `/backlog` handles its own validation;
- lint commit messages;
- lint the brief's `Source:` field (§ 2.1). A plain-text `Source:` line touches none of the checks above, so no hook change was needed — but a `[[…]]` inside it would trip link resolution, which is one more reason it stays plain text. Deliberately skipped: a presence lint for `Source:` on new notes; add one if new notes start shipping without it.

---

## 12. Naming Convention

The full file/folder naming convention (Capitalized = permanent content, `_name/` = templates, `.name/` = config, lowercase `name/` = ephemeral, `assets/` = the one lowercase exception for permanent image attachments) lives in the root `CLAUDE.md` § "Naming Convention." When I'm deciding where a new artifact goes — concept note, drill artifact, scratch whiteboard, image — that section is the canonical reference. This document covers concept-note shape only; the broader vault-level naming rules sit one level up.

---

## Adapting the taxonomy to your domain

The Definition / Property / Theorem taxonomy above covers STEM domains (mathematics, physics, statistics and similar) — anything built from definitions, properties, and results that relate them. The worked examples are drawn from mathematics because that is this framework's reference implementation; read them as illustrations of the *shape*, not as required content.

If a note in your domain genuinely doesn't fit any of the three types, add a new type here rather than forcing a bad fit — and because `Note Standard.md` is a shared core file, every vault that vendors the core inherits it once you do. Keep the driver test, the DAG protocol, and the wiki-link convention unchanged; those are domain-independent.
