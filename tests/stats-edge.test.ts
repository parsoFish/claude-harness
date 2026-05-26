/**
 * Edge-case integration tests for the `stats` subcommand of src/cli.ts (WI-6).
 *
 * Covers three boundary/failure modes:
 *   AC1: cycle dir exists but has no events.jsonl → exit 1 + stderr message
 *   AC2: events.jsonl contains only blank lines   → exit 0, all counts zero
 *   AC3: cycle dir path does not exist at all     → exit 1 + stderr message
 *
 * Uses os.tmpdir() + mkdtempSync for ephemeral dirs, cleaned up in `after()`.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// ── helpers ───────────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '..');
const CLI_PATH = join(ROOT, 'src', 'cli.ts');

/**
 * Run `claude-trail stats` with the given args. Returns exit code + streams.
 */
function runStats(args: string[]): { exitCode: number; stdout: string; stderr: string } {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_PATH, 'stats', ...args],
    { encoding: 'utf8' },
  );
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

// ── Shared temp directory ─────────────────────────────────────────────────────

let tmpBase: string;

before(() => {
  tmpBase = mkdtempSync(join(tmpdir(), 'stats-edge-test-'));
});

after(() => {
  rmSync(tmpBase, { recursive: true, force: true });
});

// ── AC1: empty directory (events.jsonl absent) ────────────────────────────────

describe('stats edge — AC1: empty directory (no events.jsonl)', () => {
  let emptyDir: string;

  before(() => {
    emptyDir = join(tmpBase, 'empty-dir');
    mkdirSync(emptyDir);
    // Intentionally do NOT create events.jsonl inside
  });

  it('exits 1', () => {
    const { exitCode } = runStats([emptyDir]);
    assert.equal(exitCode, 1, `expected exit 1, got ${exitCode}`);
  });

  it('stderr contains a message indicating events.jsonl was not found', () => {
    const { stderr } = runStats([emptyDir]);
    assert.ok(
      stderr.length > 0,
      'stderr should not be empty',
    );
    assert.ok(
      stderr.toLowerCase().includes('events.jsonl'),
      `stderr should mention "events.jsonl"; got:\n${stderr}`,
    );
  });
});

// ── AC2: events.jsonl with only blank lines ───────────────────────────────────

describe('stats edge — AC2: events.jsonl contains only blank lines', () => {
  let blankDir: string;

  before(() => {
    blankDir = join(tmpBase, 'blank-events-dir');
    mkdirSync(blankDir);
    // Write only blank/whitespace lines — no valid JSON events
    writeFileSync(join(blankDir, 'events.jsonl'), '\n\n   \n\n');
  });

  it('exits 0', () => {
    const { exitCode, stderr } = runStats([blankDir]);
    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);
  });

  it('stdout shows total as zero', () => {
    const { stdout } = runStats([blankDir]);
    assert.ok(
      stdout.includes('total'),
      `stdout should contain "total" row; got:\n${stdout}`,
    );
    assert.ok(
      stdout.includes('0'),
      `stdout should show 0 total count; got:\n${stdout}`,
    );
  });

  it('stdout shows no phase rows other than header and total', () => {
    const { stdout } = runStats([blankDir]);
    // Should have header line and total line — no phase-specific rows
    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    // Expect exactly 2 lines: header + total
    assert.equal(
      lines.length,
      2,
      `expected 2 lines (header + total), got ${lines.length}:\n${stdout}`,
    );
  });

  it('JSON output has total: 0 and no other keys', () => {
    const { exitCode, stdout, stderr } = runStats(['--json', blankDir]);
    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(lines.length, 1, `expected 1 JSON line, got ${lines.length}`);

    const parsed = JSON.parse(lines[0]!) as Record<string, number>;
    assert.equal(parsed['total'], 0, `expected total: 0, got ${parsed['total']}`);

    // No phase keys other than 'total'
    const keys = Object.keys(parsed);
    assert.deepEqual(keys, ['total'], `expected only "total" key, got ${JSON.stringify(keys)}`);
  });
});

// ── AC3: path does not exist on the filesystem ────────────────────────────────

describe('stats edge — AC3: path does not exist', () => {
  const nonExistentPath = '/tmp/stats-edge-nonexistent-dir-that-should-not-exist-ever';

  it('exits 1', () => {
    const { exitCode } = runStats([nonExistentPath]);
    assert.equal(exitCode, 1, `expected exit 1, got ${exitCode}`);
  });

  it('stderr contains a message indicating the directory was not found', () => {
    const { stderr } = runStats([nonExistentPath]);
    assert.ok(
      stderr.length > 0,
      'stderr should not be empty',
    );
    assert.ok(
      stderr.toLowerCase().includes('not found') || stderr.toLowerCase().includes('directory'),
      `stderr should mention directory not found; got:\n${stderr}`,
    );
  });
});
