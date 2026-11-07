# gnomon

A versioned `CLAUDE.md` core for Obsidian + Claude Code study vaults: a mentor persona, session and drill slash commands, a note standard, and a lint hook. Vaults vendor it with one command, and a drift check keeps the vendored copy honest.

## What it is

gnomon turns a folder of markdown notes into a study workspace that Claude Code runs as a mentor. The learner takes new material from a lecture or textbook; Claude routes, primes, checks recall, audits notes, and runs spaced, interleaved reps on a whiteboard, one step at a time. It targets definition-and-proof-shaped fields (mathematics, physics, statistics and similar), not one subject. [PHILOSOPHY.md](PHILOSOPHY.md) explains the design.

It is not a fork-once template. Vaults **vendor** the core and re-sync to upgrade, so the framework improves once and every vault gets it. Each vault keeps three layers apart:

- **① Core** (this repo): the subject-agnostic mentor, session workflow, drill method, note standard, commands and hook. Vendored verbatim; never edited in the vault.
- **② You** (`Profile.psych.md`): your baseline, calibration, psychology, working setup and support resources.
- **③ Subject** (`Profile.subject.md`, plus the notes, drills and `Plan.md`): the field, the mentor persona, the topics, the weekly rhythm, and the companion-tool settings.

## Requirements

- **Node 22+.** The sync uses `fs.cpSync`, and the tests use `node:test`.
- **git.** gnomon must be a git clone, not a zip: the sync records the core's commit. The vault is a git repo too.
- **bash**, for the pre-commit hook.
- **[Claude Code](https://claude.com/claude-code).** `/plan:close` also uses the `gh` CLI and a remote to open its PR.
- **Obsidian** (optional, recommended). Notes and whiteboards are written to be read typeset there.

## Quickstart

```bash
git clone https://github.com/IngTian/gnomon.git
mkdir my-vault && cd my-vault && git init -b main

# your Profile: copy both templates under these names, then fill in every prompt
cp ../gnomon/Profile.template.md         Profile.psych.md
cp ../gnomon/Profile.subject.template.md Profile.subject.md

# vendor the core
node ../gnomon/bin/mentor-sync.mjs .

# enable the vendored hook, ignore the scratch area, create the drill state files
git config core.hooksPath .githooks
echo 'scratch/' >> .gitignore
mkdir -p Concepts Drills/Vocabulary
touch Drills/Schedule.md Drills/Backlog.md Drills/Maintenance.md \
      Drills/Vocabulary/Techniques.md "Drills/Vocabulary/Error Types.md"
git add -A && git commit -m "Start the vault"
```

Then open the vault in Claude Code and run `/plan:create <source>` (a textbook chapter, a course, or a topic), then `/session:learn` for the first learn day. Claude fills in the drill files' sections (named in `Drills/CLAUDE.md`) as it first writes to them. In Obsidian, add `scratch/` to *Files and links → Excluded files* so whiteboards stay out of search and the graph.

### What the sync writes

`node bin/mentor-sync.mjs <vault>` copies every row of [`MANIFEST`](MANIFEST) into the vault's real paths: `CLAUDE.md`, `Concepts/CLAUDE.md`, `Drills/CLAUDE.md`, `Note Standard.md`, `.githooks/pre-commit`, and the `.claude/commands/` tree. It then writes:

- `.mentor/VERSION`: the core commit the files came from.
- `.mentor/lock`: one `<path>\t<sha256>` line per vendored file.
- `.mentor/bin/` and `.mentor/MANIFEST`: the tooling, so the vault can check itself without the core checkout.

The vendored pre-commit hook runs `.mentor/bin/mentor-drift.mjs` on every commit. It re-hashes each vendored file against `.mentor/lock`, and a file edited in place, deleted, or added inside a vendored directory blocks the commit. Change the core instead and re-sync. To check by hand: `node .mentor/bin/mentor-drift.mjs .` (exit 1 names the drifted files). The same hook lints staged concept notes against `Note Standard.md`.

The sync overwrites only core-managed files. In `.claude/commands/` it copies the core's commands over yours and deletes only a command an earlier sync installed (it is in `.mentor/lock`) that the core has since dropped. It never deletes a file it didn't install, but drift still blocks a file of your own inside a vendored directory, so keep none there. Your Profiles, notes, drills and `Plan.md` are never touched.

### Upgrading

`git pull` in your gnomon clone, then re-run `node bin/mentor-sync.mjs <vault>` and commit. This rewrites `.mentor/VERSION` and `.mentor/lock`, and removes any command the new core dropped or renamed.

## Vault layout

```
Profile.psych.md       you (from Profile.template.md)
Profile.subject.md     this vault's field (from Profile.subject.template.md)
Plan.md                the rolling plan; /plan:create writes it
Concepts/<Topic>/      concept notes, one top-level folder per subject
Drills/                Schedule.md, Backlog.md, Maintenance.md, Vocabulary/, drill artifacts
scratch/               whiteboards and other throwaway files (gitignored)
```

## Commands

| command | what it does |
|---|---|
| `/plan:create <source>` | Open a chapter: a dependency-ordered learn-day plan with verified routes, a `sprint-<slug>` branch, a section in `Plan.md`. |
| `/plan:adapt` | Re-slot upcoming days mid-chapter. |
| `/plan:close` | Write the chapter retro, run `/backlog`, push, open a PR. Never merges. |
| `/session:learn` | A learn day: route to the source, you take it in, then cold recall, an audit, and the note in your words. |
| `/session:rep` | A rep day: recall, spaced proof reps bracketed by concept-tied computation, one random retrieval. |
| `/drill [target \| random]` | One interactive drill on the four-rung ladder. |
| `/concept:audit <note>` | Read-only audit of one note: correctness, shape, DAG and link hygiene. |
| `/concept:examples <note>` | The four-example spread, from the note's source first. |
| `/backlog` | Aggregation over drill state: stale rows, recurring patterns, vocabulary, lifecycle. |
| `/cheer [topic]` | Cited evidence of progress, for a setback or on request. |
| `/refactor` | Vault-wide drift scan, applied on its own branch. |

## Companions (optional)

witness records progress, gnomon runs the sessions in a vault, and orrery plans the week across vaults. Both companions are optional: without their tools, the commands skip every step that uses them.

- **[witness](https://github.com/IngTian/witness)**: a local archive of evidence-grounded learning observations, read and written over MCP. Register its server under the name `witness`, because the commands call `mcp__witness__get_facets`, `mcp__witness__get_profile`, `mcp__witness__search_observations` and `mcp__witness__record_observation`. Set the lens and its dimensions in `Profile.subject.md` (`witness lens:`, `witness dimensions:`, `witness progress dimensions:`); with no lens line, the vault uses witness's always-on `default` lens.
- **[orrery](https://github.com/IngTian/orrery)**: a study-week planner that gives each vault its days, over MCP. Register its server as `orrery` and add an `` orrery front: `<subject>` `` line to `Profile.subject.md`.

## Development

```bash
node --test test/*.test.mjs
```

## License

MIT. See [LICENSE](LICENSE).
