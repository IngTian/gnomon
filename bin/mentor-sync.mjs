#!/usr/bin/env node
// mentor-sync: vendor core-managed files (per MANIFEST) into a consuming vault.
//
// Usage: node bin/mentor-sync.mjs <vaultRoot>
//
// For each `<source>\t<dest>` row in MANIFEST:
//   1. copies <coreRoot>/<source> over <vaultRoot>/<dest> (file or directory
//      subtree, overwriting), then removes only the files the previous
//      .mentor/lock listed under <dest> that the core no longer ships. A file
//      the lock never managed (the vault's own command or note) is left alone.
// Then, once:
//   2. records the core git SHA at <vaultRoot>/.mentor/VERSION
//   3. vendors the tooling itself: <coreRoot>/bin -> <vaultRoot>/.mentor/bin,
//      and <coreRoot>/MANIFEST -> <vaultRoot>/.mentor/MANIFEST
//      (the vendored pre-commit hook runs .mentor/bin/mentor-drift.mjs
//      against .mentor/MANIFEST from inside the consuming vault, so both must
//      be vendored or drift-lint breaks in every vault that syncs.)
//   4. writes a sha256 hash lockfile at <vaultRoot>/.mentor/lock — one line
//      per vendored file (directory dests expanded to their individual
//      files), "<vault-relative-path>\t<sha256hex>", sorted for determinism.
//      mentor-drift re-hashes and compares against this lock, so .mentor/
//      never duplicates the vendored content itself.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

/** sha256 hex digest of a file's contents. Exported so mentor-drift can reuse it. */
export function sha256File(absPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
}

/**
 * Recursively collect absolute file paths under `absPath`.
 * If `absPath` is itself a file, returns [absPath].
 */
function collectFiles(absPath) {
  const stat = fs.statSync(absPath);
  if (stat.isFile()) return [absPath];

  const out = [];
  for (const entry of fs.readdirSync(absPath, { withFileTypes: true })) {
    const entryAbs = path.join(absPath, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(entryAbs));
    } else {
      out.push(entryAbs);
    }
  }
  return out;
}

/**
 * Parse MANIFEST text into an array of {source, dest} pairs.
 * Drops blank lines and `#`-comment lines. Splits each remaining line on the
 * TAB character only (dest values may contain spaces, e.g. "Note Standard.md").
 */
export function parseManifest(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const [source, dest] = line.split('\t');
      return { source, dest };
    });
}

/**
 * Sync core-managed files from coreRoot into vaultRoot per manifest.
 * Returns { written: string[] } — vault-relative dest paths copied.
 */
export function sync({ coreRoot, vaultRoot, manifest }) {
  const written = [];
  const lockEntries = [];
  const managed = new Set();

  // Paths the previous sync installed; only these may ever be deleted.
  const lockPath = path.join(vaultRoot, '.mentor', 'lock');
  const previous = fs.existsSync(lockPath)
    ? fs.readFileSync(lockPath, 'utf8').split('\n').map((l) => l.split('\t')[0].trim()).filter(Boolean)
    : [];

  // Validate every row before writing anything.
  for (const { source, dest } of manifest) {
    const src = path.join(coreRoot, source);
    const dst = path.join(vaultRoot, dest);
    if (!fs.existsSync(src)) {
      throw new Error(`mentor-sync: MANIFEST source not found: ${source}`);
    }
    if (fs.existsSync(dst) && fs.realpathSync(dst) === fs.realpathSync(src)) {
      throw new Error(`mentor-sync: ${source} and ${dest} resolve to the same path; nothing synced`);
    }
  }

  // What the core provides now, from its own files: the new lock and the managed set.
  for (const { source, dest } of manifest) {
    const src = path.join(coreRoot, source);
    for (const absFile of collectFiles(src)) {
      const relFromSrc = path.relative(src, absFile);
      const normalized = (relFromSrc ? path.join(dest, relFromSrc) : dest).split(path.sep).join('/');
      managed.add(normalized);
      lockEntries.push(`${normalized}\t${sha256File(absFile)}`);
    }
  }

  // A file the core dropped must not linger (and get re-locked). Deleted BEFORE copying: on a
  // case-insensitive disk a file renamed by case alone is the same entry as its new name, and
  // deleting the old name after the copy would delete the copy.
  const dsts = manifest.map(({ dest }) => path.join(vaultRoot, dest) + path.sep);
  for (const rel of previous) {
    const abs = path.join(vaultRoot, rel);
    if (!managed.has(rel) && dsts.some((d) => abs.startsWith(d))) fs.rmSync(abs, { force: true });
  }

  for (const { source, dest } of manifest) {
    const src = path.join(coreRoot, source);
    const dst = path.join(vaultRoot, dest);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.cpSync(src, dst, { recursive: true });
    written.push(dest);
  }

  // Record the core git SHA so the lock can be attributed
  // to the exact core version it came from.
  const sha = execSync('git rev-parse HEAD', { cwd: coreRoot }).toString().trim();
  const versionPath = path.join(vaultRoot, '.mentor', 'VERSION');
  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, sha);

  // Vendor the tooling itself into .mentor/ so drift-lint can run from
  // inside the consuming vault without depending on the core repo checkout.
  const binDst = path.join(vaultRoot, '.mentor', 'bin');
  fs.mkdirSync(path.dirname(binDst), { recursive: true });
  fs.cpSync(path.join(coreRoot, 'bin'), binDst, { recursive: true });

  const manifestDst = path.join(vaultRoot, '.mentor', 'MANIFEST');
  fs.mkdirSync(path.dirname(manifestDst), { recursive: true });
  fs.cpSync(path.join(coreRoot, 'MANIFEST'), manifestDst, { recursive: true });

  // Write the hash lockfile: one "<path>\t<sha256hex>" line per vendored
  // file, sorted for determinism.
  lockEntries.sort();
  fs.writeFileSync(lockPath, lockEntries.length ? lockEntries.join('\n') + '\n' : '');

  return { written };
}

// argv[1] is a raw path; import.meta.url is a percent-encoded realpath URL.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === url.fileURLToPath(import.meta.url)) {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = process.argv[2];
  if (!vaultRoot) {
    console.error('Usage: node bin/mentor-sync.mjs <vaultRoot>');
    process.exit(1);
  }

  const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
  const manifest = parseManifest(manifestText);
  const { written } = sync({ coreRoot, vaultRoot, manifest });

  const version = fs.readFileSync(path.join(vaultRoot, '.mentor', 'VERSION'), 'utf8').trim();
  console.log('Synced:');
  for (const dest of written) {
    console.log(`  ${dest}`);
  }
  console.log(`Recorded VERSION: ${version}`);
}
