import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { parseManifest, sync, sha256File } from '../bin/mentor-sync.mjs';
import { drift } from '../bin/mentor-drift.mjs';

test('parseManifest: pairs, comments, blanks', () => {
  const txt = '# c\ncore/CLAUDE.md\tCLAUDE.md\n\ncore/.claude/commands\t.claude/commands\n';
  assert.deepEqual(parseManifest(txt), [
    { source: 'core/CLAUDE.md', dest: 'CLAUDE.md' },
    { source: 'core/.claude/commands', dest: '.claude/commands' },
  ]);
});

test('sync: round-trip vendors files + lock (no snapshots), VERSION, and tooling', () => {
  const coreRoot = path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-'));
  try {
    const manifestText = fs.readFileSync(path.join(coreRoot, 'MANIFEST'), 'utf8');
    const manifest = parseManifest(manifestText);

    const { written } = sync({ coreRoot, vaultRoot, manifest });

    // file copied to vault root (the real vendored file)
    assert.ok(fs.existsSync(path.join(vaultRoot, 'CLAUDE.md')));

    // directory subtree copied (the real vendored files)
    assert.ok(fs.existsSync(path.join(vaultRoot, '.claude', 'commands', 'plan', 'create.md')));

    // space-in-dest handled
    assert.ok(fs.existsSync(path.join(vaultRoot, 'Note Standard.md')));

    // NO snapshot copies under .mentor/ anymore
    assert.equal(fs.existsSync(path.join(vaultRoot, '.mentor', 'CLAUDE.md')), false);
    assert.equal(
      fs.existsSync(path.join(vaultRoot, '.mentor', '.claude', 'commands', 'plan', 'create.md')),
      false,
    );

    // VERSION recorded as a 40-char hex SHA
    const version = fs.readFileSync(path.join(vaultRoot, '.mentor', 'VERSION'), 'utf8').trim();
    assert.match(version, /^[0-9a-f]{40}$/);

    // tooling vendored into .mentor/
    assert.ok(fs.existsSync(path.join(vaultRoot, '.mentor', 'bin', 'mentor-sync.mjs')));
    assert.ok(fs.existsSync(path.join(vaultRoot, '.mentor', 'MANIFEST')));

    // lock file: one line per vendored file, "<path>\t<sha256hex>"
    const lockPath = path.join(vaultRoot, '.mentor', 'lock');
    assert.ok(fs.existsSync(lockPath));
    const lockLines = fs.readFileSync(lockPath, 'utf8').trim().split('\n');
    const lockMap = new Map(lockLines.map((line) => line.split('\t')));

    assert.ok(lockMap.has('CLAUDE.md'));
    assert.match(lockMap.get('CLAUDE.md'), /^[0-9a-f]{64}$/);
    assert.equal(lockMap.get('CLAUDE.md'), sha256File(path.join(vaultRoot, 'CLAUDE.md')));

    assert.ok(lockMap.has('.claude/commands/plan/create.md'));
    assert.match(lockMap.get('.claude/commands/plan/create.md'), /^[0-9a-f]{64}$/);

    // written list
    assert.ok(written.includes('CLAUDE.md'));
    assert.ok(written.includes('.claude/commands'));
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('sha256File: matches known sha256 of "abc"', () => {
  const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sha256-')), 'input.txt');
  fs.writeFileSync(tmpFile, 'abc');
  const digest = sha256File(tmpFile);
  assert.equal(digest, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
});

const realCore = () => path.dirname(path.dirname(url.fileURLToPath(import.meta.url)));
const realManifest = () => parseManifest(fs.readFileSync(path.join(realCore(), 'MANIFEST'), 'utf8'));

test("sync: re-sync keeps the vault's own command (the lock never managed it)", () => {
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-'));
  try {
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });
    const mine = path.join(vaultRoot, '.claude', 'commands', 'mine.md');
    fs.writeFileSync(mine, 'mine');
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });
    assert.equal(fs.readFileSync(mine, 'utf8'), 'mine');
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('sync: re-sync removes a command the previous lock managed and the core dropped', () => {
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-'));
  try {
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });
    // stands in for a command an older core shipped and the current core removed
    const stale = path.join(vaultRoot, '.claude', 'commands', 'retired.md');
    fs.writeFileSync(stale, 'old');
    fs.appendFileSync(path.join(vaultRoot, '.mentor', 'lock'), `.claude/commands/retired.md\t${sha256File(stale)}\n`);
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });

    assert.equal(fs.existsSync(stale), false);
    assert.deepEqual(drift({ vaultRoot }).drifted, []);
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('sync: a core file renamed by case alone ends up under its new name (case-insensitive disks too)', () => {
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-'));
  try {
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });
    // stands in for an older core that shipped Cheer.md where the current one ships cheer.md
    const dir = path.join(vaultRoot, '.claude', 'commands');
    fs.renameSync(path.join(dir, 'cheer.md'), path.join(dir, 'Cheer.md'));
    const lock = path.join(vaultRoot, '.mentor', 'lock');
    const old = fs.readFileSync(lock, 'utf8').replace('.claude/commands/cheer.md\t', '.claude/commands/Cheer.md\t');
    fs.writeFileSync(lock, old);
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });

    const names = fs.readdirSync(dir).filter((n) => n.toLowerCase() === 'cheer.md');
    assert.deepEqual(names, ['cheer.md']);
    assert.deepEqual(drift({ vaultRoot }).drifted, []);
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test("sync: first sync (no lock) keeps the vault's own commands and notes", () => {
  const vaultRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-'));
  try {
    const mine = path.join(vaultRoot, '.claude', 'commands', 'plan', 'mine.md');
    const note = path.join(vaultRoot, 'Concepts', 'Mine.md');
    fs.mkdirSync(path.dirname(mine), { recursive: true });
    fs.mkdirSync(path.dirname(note), { recursive: true });
    fs.writeFileSync(mine, 'mine');
    fs.writeFileSync(note, 'note');
    sync({ coreRoot: realCore(), vaultRoot, manifest: realManifest() });

    assert.equal(fs.readFileSync(mine, 'utf8'), 'mine');
    assert.equal(fs.readFileSync(note, 'utf8'), 'note');
    assert.ok(fs.existsSync(path.join(vaultRoot, '.claude', 'commands', 'plan', 'create.md')));
    assert.doesNotMatch(fs.readFileSync(path.join(vaultRoot, '.mentor', 'lock'), 'utf8'), /mine\.md/);
  } finally {
    fs.rmSync(vaultRoot, { recursive: true, force: true });
  }
});

test('sync: a row whose source and destination are the same path errors without deleting', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mentor-'));
  try {
    const file = path.join(root, 'core', 'cmds', 'a.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'a');
    for (const row of [{ source: 'core/cmds', dest: 'core/cmds' }, { source: 'core/cmds/a.md', dest: 'core/cmds/a.md' }]) {
      assert.throws(() => sync({ coreRoot: root, vaultRoot: root, manifest: [row] }), /same path/);
      assert.equal(fs.readFileSync(file, 'utf8'), 'a');
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
