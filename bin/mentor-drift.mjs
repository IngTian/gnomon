#!/usr/bin/env node
// mentor-drift: detect vendored core-managed files edited in place.
//
// Usage: node mentor-drift.mjs <vaultRoot>
//
// Reads <vaultRoot>/.mentor/MANIFEST (the vendored manifest copy — a
// consuming vault only has this, not the core repo checkout) for the dest
// list, and <vaultRoot>/.mentor/lock (a sha256-per-file hash lockfile — see
// mentor-sync.mjs) for the expected hash of each vendored file. For each
// {dest} entry, re-hashes <vaultRoot>/<dest> and compares against the lock.
// Any mismatch — including files missing from the vault or extra files
// present under a vendored directory that aren't in the lock — is drift:
// the vault copy was edited in place instead of the core being edited and
// re-synced.

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { parseManifest, sha256File } from './mentor-sync.mjs';

/**
 * Recursively list all file paths under `dir`, relative to `dir`.
 * Returns [] if `dir` does not exist.
 */
function listFilesRelative(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  const walk = (current, rel) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryRel = rel ? path.join(rel, entry.name) : entry.name;
      const entryAbs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(entryAbs, entryRel);
      } else {
        out.push(entryRel);
      }
    }
  };
  walk(dir, '');
  return out;
}

/**
 * Parse the lock file text into a Map of normalized (forward-slash)
 * vault-relative path -> expected sha256 hex digest.
 */
function parseLock(text) {
  const map = new Map();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const [lockPath, hash] = line.split('\t');
    map.set(lockPath, hash);
  }
  return map;
}

/** True if the file at absPath exists and its sha256 matches expectedHash. */
function fileMatchesHash(absPath, expectedHash) {
  if (!fs.existsSync(absPath)) return false;
  if (!fs.statSync(absPath).isFile()) return false;
  return sha256File(absPath) === expectedHash;
}

/**
 * Compare each manifest dest in vaultRoot against its lock hash(es).
 * Returns { drifted: string[] } — vault-relative paths whose current
 * contents don't match the lock, or that are missing/extra vs the lock.
 */
export function drift({ vaultRoot }) {
  const manifestPath = path.join(vaultRoot, '.mentor', 'MANIFEST');
  const manifestText = fs.readFileSync(manifestPath, 'utf8');
  const manifest = parseManifest(manifestText);

  const lockPath = path.join(vaultRoot, '.mentor', 'lock');
  const lockText = fs.readFileSync(lockPath, 'utf8');
  const lock = parseLock(lockText);

  const drifted = [];

  for (const { dest } of manifest) {
    const normalizedDest = dest.split(path.sep).join('/');
    const vaultPath = path.join(vaultRoot, dest);

    if (lock.has(normalizedDest)) {
      // File dest: the lock has a single entry keyed exactly by dest.
      if (!fileMatchesHash(vaultPath, lock.get(normalizedDest))) {
        drifted.push(dest);
      }
      continue;
    }

    // Directory dest: every lock entry under `dest/` is an expected file.
    const prefix = `${normalizedDest}/`;
    for (const [lockPathKey, expectedHash] of lock) {
      if (!lockPathKey.startsWith(prefix)) continue;
      const relParts = lockPathKey.slice(prefix.length).split('/');
      const absPath = path.join(vaultRoot, ...normalizedDest.split('/'), ...relParts);
      if (!fileMatchesHash(absPath, expectedHash)) {
        drifted.push(path.join(dest, ...relParts));
      }
    }

    // Extra files: present in the vault subtree but absent from the lock.
    for (const rel of listFilesRelative(vaultPath)) {
      const relNormalized = rel.split(path.sep).join('/');
      const lockKey = `${normalizedDest}/${relNormalized}`;
      if (!lock.has(lockKey)) {
        drifted.push(path.join(dest, rel));
      }
    }
  }

  return { drifted };
}

// argv[1] is a raw path; import.meta.url is a percent-encoded realpath URL.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === url.fileURLToPath(import.meta.url)) {
  const vaultRoot = process.argv[2] || '.';
  const { drifted } = drift({ vaultRoot });

  if (drifted.length > 0) {
    for (const p of drifted) {
      console.error(`drift: ${p} — edit the core, then re-run mentor-sync`);
    }
    process.exit(1);
  }
}
