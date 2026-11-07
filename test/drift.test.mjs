import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { spawnSync } from 'node:child_process';
import { parseManifest, sync } from '../bin/mentor-sync.mjs';
import { drift } from '../bin/mentor-drift.mjs';

test('drift: no mutation -> empty drifted list', () => {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-drift-'));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    const manifest = parseManifest(manifestText);
    sync({ coreRoot, vaultRoot, manifest });

    const { drifted } = drift({ vaultRoot });
    assert.deepEqual(drifted, []);
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('drift: mutated vendored file -> reported', () => {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-drift-'));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    const manifest = parseManifest(manifestText);
    sync({ coreRoot, vaultRoot, manifest });

    fs.appendFileSync(path.join(vaultRoot, 'CLAUDE.md'), '\nedited in place\n');

    const { drifted } = drift({ vaultRoot });
    assert.ok(drifted.includes('CLAUDE.md'));
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('drift: mutated file inside a vendored directory -> reported with vault-relative path', () => {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-drift-'));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    const manifest = parseManifest(manifestText);
    sync({ coreRoot, vaultRoot, manifest });

    const editedPath = path.join(vaultRoot, '.claude', 'commands', 'plan', 'create.md');
    fs.appendFileSync(editedPath, '\nedited in place\n');

    const { drifted } = drift({ vaultRoot });
    assert.ok(drifted.includes(path.join('.claude', 'commands', 'plan', 'create.md')));
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('drift: file missing from a vendored directory in the vault -> reported', () => {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-drift-'));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    const manifest = parseManifest(manifestText);
    sync({ coreRoot, vaultRoot, manifest });

    fs.rmSync(path.join(vaultRoot, '.claude', 'commands', 'plan', 'create.md'));

    const { drifted } = drift({ vaultRoot });
    assert.ok(drifted.includes(path.join('.claude', 'commands', 'plan', 'create.md')));
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('drift: extra file added to a vendored directory in the vault -> reported', () => {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-drift-'));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    const manifest = parseManifest(manifestText);
    sync({ coreRoot, vaultRoot, manifest });

    fs.writeFileSync(path.join(vaultRoot, '.claude', 'commands', 'plan', 'zzz-extra.md'), 'x');

    const { drifted } = drift({ vaultRoot });
    assert.ok(drifted.includes(path.join('.claude', 'commands', 'plan', 'zzz-extra.md')));
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('drift CLI: the vendored hook path exits 1 on drift, from a path with a space', () => {
  // os.tmpdir() is behind a symlink on macOS (/var -> /private/var), so this
  // also covers the entry guard's realpath comparison. A broken guard exits 0.
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor drift '));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    sync({ coreRoot, vaultRoot, manifest: parseManifest(manifestText) });

    const cli = path.join(vaultRoot, '.mentor', 'bin', 'mentor-drift.mjs');
    assert.equal(spawnSync(process.execPath, [cli, vaultRoot]).status, 0);

    fs.appendFileSync(path.join(vaultRoot, 'CLAUDE.md'), '\nedited in place\n');
    const r = spawnSync(process.execPath, [cli, vaultRoot], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /drift: CLAUDE\.md/);
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});
