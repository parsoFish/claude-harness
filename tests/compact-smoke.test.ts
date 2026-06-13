// tests/compact-smoke.test.ts
// Smoke test: --compact flag golden file match.
// Exercises AC1 of INIT-2026-05-30-claude-trail-compact-flag end-to-end.

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

function copyDirRecursive(src: string, dst: string): void {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const s = join(src, entry.name);
    const d = join(dst, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else copyFileSync(s, d);
  }
}

const FIXTURES_DIR = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), 'fixtures');
const CLI_PATH = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '../src/cli.ts');
const COMPACT_GOLDEN = join(FIXTURES_DIR, 'INIT-FIXTURE-1.trail-compact.golden.md');
const PR_META_SRC = join(FIXTURES_DIR, 'INIT-FIXTURE-1.pr-metadata.json');

let tmpBase: string;

before(() => {
  tmpBase = mkdtempSync(join(tmpdir(), 'compact-smoke-'));
  const logsDir = join(tmpBase, '_logs');
  mkdirSync(logsDir);
  copyDirRecursive(join(FIXTURES_DIR, 'cycle-INIT-FIXTURE-1'), join(logsDir, 'cycle-INIT-FIXTURE-1'));
  mkdirSync(join(tmpBase, '.forge'), { recursive: true });
  try { copyFileSync(PR_META_SRC, join(tmpBase, '.forge', '_pr-metadata.json')); } catch { /* ok */ }
});

after(() => { rmSync(tmpBase, { recursive: true, force: true }); });

describe('compact smoke: --compact golden match', () => {
  it('exits 0 and stdout trimEnd matches compact golden file', () => {
    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', CLI_PATH, 'INIT-FIXTURE-1', '--compact'],
      { encoding: 'utf8', cwd: tmpBase },
    );
    assert.equal(result.status, 0, `exited ${result.status}; stderr: ${result.stderr}`);
    const golden = readFileSync(COMPACT_GOLDEN, 'utf8');
    assert.equal(result.stdout.trimEnd(), golden.trimEnd(), 'stdout does not match compact golden');
  });
});
