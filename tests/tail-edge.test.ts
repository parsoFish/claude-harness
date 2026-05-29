/**
 * Edge-case integration tests for the `tail` subcommand of src/cli.ts (WI-6).
 *
 * Covers four boundary/failure modes:
 *   AC1: cycle dir path does not exist → exit non-zero + stderr human-readable, no stack trace
 *   AC2: cycle dir exists but has no events.jsonl → exit non-zero + stderr references "events.jsonl"
 *   AC3: path is a file (not a directory) → exit non-zero + stderr clear error, no stack trace
 *   AC4: valid cycle dir with zero non-blank lines in events.jsonl → stdout empty/blank, exit 0
 *
 * Uses os.tmpdir() + mkdtempSync for ephemeral dirs, cleaned up in `after()`.
 * Spawns `node --experimental-strip-types src/cli.ts tail <...>` as a child process.
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
 * Run `claude-trail tail` with the given args. Returns exit code + streams.
 */
function runTail(args: string[]): { exitCode: number; stdout: string; stderr: string } {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_PATH, 'tail', ...args],
    { encoding: 'utf8', timeout: 10_000 },
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
  tmpBase = mkdtempSync(join(tmpdir(), 'tail-edge-test-'));
});

after(() => {
  rmSync(tmpBase, { recursive: true, force: true });
});

// ── AC1: path does not exist on the filesystem ────────────────────────────────

describe('tail edge — AC1: path does not exist', () => {
  const nonExistentPath = '/tmp/tail-edge-nonexistent-dir-that-should-not-exist-ever-xyz-12345';

  it('exits non-zero', () => {
    const { exitCode } = runTail([nonExistentPath]);
    assert.notEqual(exitCode, 0, `expected non-zero exit, got ${exitCode}`);
  });

  it('stderr contains a human-readable error message (no stack trace)', () => {
    const { stderr } = runTail([nonExistentPath]);
    assert.ok(
      stderr.length > 0,
      'stderr should not be empty',
    );
    // Human-readable: should contain "Error" or "not found" or similar phrase
    assert.ok(
      stderr.toLowerCase().includes('not found') ||
      stderr.toLowerCase().includes('error') ||
      stderr.toLowerCase().includes('directory'),
      `stderr should contain a human-readable message; got:\n${stderr}`,
    );
    // No stack trace: should not contain "at " lines (Node.js stack trace pattern)
    assert.ok(
      !stderr.includes('\n    at '),
      `stderr should not contain a stack trace; got:\n${stderr}`,
    );
  });

  it('stdout is empty on error', () => {
    const { stdout } = runTail([nonExistentPath]);
    assert.equal(stdout.trim(), '', `stdout should be empty on error; got: ${JSON.stringify(stdout)}`);
  });
});

// ── AC2: directory exists but has no events.jsonl ────────────────────────────

describe('tail edge — AC2: directory exists but events.jsonl is missing', () => {
  let emptyDir: string;

  before(() => {
    emptyDir = join(tmpBase, 'empty-dir');
    mkdirSync(emptyDir);
    // Intentionally do NOT create events.jsonl inside
  });

  it('exits non-zero', () => {
    const { exitCode } = runTail([emptyDir]);
    assert.notEqual(exitCode, 0, `expected non-zero exit, got ${exitCode}`);
  });

  it('stderr references "events.jsonl"', () => {
    const { stderr } = runTail([emptyDir]);
    assert.ok(
      stderr.length > 0,
      'stderr should not be empty',
    );
    assert.ok(
      stderr.includes('events.jsonl'),
      `stderr should reference "events.jsonl"; got:\n${stderr}`,
    );
  });

  it('stderr contains no stack trace', () => {
    const { stderr } = runTail([emptyDir]);
    assert.ok(
      !stderr.includes('\n    at '),
      `stderr should not contain a stack trace; got:\n${stderr}`,
    );
  });
});

// ── AC3: path is a file, not a directory ─────────────────────────────────────

describe('tail edge — AC3: path is a file (not a directory)', () => {
  let filePath: string;

  before(() => {
    filePath = join(tmpBase, 'not-a-directory.txt');
    writeFileSync(filePath, 'this is a plain file, not a directory\n');
  });

  it('exits non-zero', () => {
    const { exitCode } = runTail([filePath]);
    assert.notEqual(exitCode, 0, `expected non-zero exit, got ${exitCode}`);
  });

  it('stderr contains a clear error message (no stack trace)', () => {
    const { stderr } = runTail([filePath]);
    assert.ok(
      stderr.length > 0,
      'stderr should not be empty',
    );
    // Should be a meaningful message — "Error:", "not found", or similar
    assert.ok(
      stderr.toLowerCase().includes('error') ||
      stderr.toLowerCase().includes('not found') ||
      stderr.toLowerCase().includes('events.jsonl'),
      `stderr should contain a clear error; got:\n${stderr}`,
    );
    // No stack trace
    assert.ok(
      !stderr.includes('\n    at '),
      `stderr should not contain a stack trace; got:\n${stderr}`,
    );
  });

  it('stdout is empty on error', () => {
    const { stdout } = runTail([filePath]);
    assert.equal(stdout.trim(), '', `stdout should be empty on error; got: ${JSON.stringify(stdout)}`);
  });
});

// ── AC4: valid cycle dir with zero non-blank lines in events.jsonl ────────────

describe('tail edge — AC4: valid cycle dir with empty events.jsonl (zero non-blank lines)', () => {
  let emptyEventsDir: string;

  before(() => {
    emptyEventsDir = join(tmpBase, 'empty-events-dir');
    mkdirSync(emptyEventsDir);
    // Create events.jsonl with only blank/whitespace lines — no actual events
    writeFileSync(join(emptyEventsDir, 'events.jsonl'), '\n\n   \n\n');
  });

  it('exits 0', () => {
    const { exitCode, stderr } = runTail([emptyEventsDir]);
    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);
  });

  it('stdout is empty or a single blank line', () => {
    const { stdout } = runTail([emptyEventsDir]);
    // Strip all whitespace — should be nothing meaningful
    assert.equal(
      stdout.trim(),
      '',
      `stdout should be empty (or just whitespace) for zero-event file; got: ${JSON.stringify(stdout)}`,
    );
  });

  it('stderr is empty on success', () => {
    const { stderr } = runTail([emptyEventsDir]);
    assert.equal(stderr.trim(), '', `stderr should be empty on success; got: ${JSON.stringify(stderr)}`);
  });
});
