/**
 * Tests for: claude-trail tail <cycle-dir> [--n <N>] [--json]
 *
 * AC1: Default 10 lines from 12-event file
 * AC2: --n 3 returns 3 lines
 * AC3: --json returns valid JSON array with all 5 events
 * AC4: --n 10 with 3 events returns 3 lines (N larger than count; no crash)
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/** Helper: create a temp cycle dir with events.jsonl containing `count` events */
function makeCycleDir(count: number): string {
  const dir = mkdtempSync(join(tmpdir(), 'tail-cli-test-'));
  const lines: string[] = [];
  for (let i = 0; i < count; i++) {
    lines.push(
      JSON.stringify({
        phase: `phase-${i % 3}`,
        event: `event_type_${i}`,
        timestamp: `2026-01-01T00:${String(i).padStart(2, '0')}:00Z`,
      }),
    );
  }
  writeFileSync(join(dir, 'events.jsonl'), lines.join('\n') + '\n');
  return dir;
}

/** Invoke cli.ts via node --experimental-strip-types */
function runTail(args: string[]): { stdout: string; stderr: string; status: number } {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', 'src/cli.ts', 'tail', ...args],
    {
      cwd: join(import.meta.dirname, '..'),
      encoding: 'utf8',
      timeout: 10_000,
    },
  );
  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status ?? 1,
  };
}

// AC1: 12-event file → default 10 lines in '[phase] event_type' format, exit 0
test('AC1: tail with 12-event file returns exactly 10 lines by default', () => {
  const cycleDir = makeCycleDir(12);
  const { stdout, status } = runTail([cycleDir]);

  assert.equal(status, 0, 'exit code should be 0');

  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 10, `expected 10 lines, got ${lines.length}`);

  // Each line must match '[phase] event_type' format
  for (const line of lines) {
    assert.match(line, /^\[.+\] \S+/, `line does not match format: ${line}`);
  }
});

// AC2: 12-event file + --n 3 → exactly 3 lines, exit 0
test('AC2: tail --n 3 with 12-event file returns exactly 3 lines', () => {
  const cycleDir = makeCycleDir(12);
  const { stdout, status } = runTail(['--n', '3', cycleDir]);

  assert.equal(status, 0, 'exit code should be 0');

  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 3, `expected 3 lines, got ${lines.length}`);
});

// AC3: 5-event file + --json → valid JSON array with 5 elements, exit 0
test('AC3: tail --json with 5-event file returns JSON array with 5 elements', () => {
  const cycleDir = makeCycleDir(5);
  const { stdout, status } = runTail(['--json', cycleDir]);

  assert.equal(status, 0, 'exit code should be 0');

  let parsed: unknown;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(stdout);
  }, 'stdout should be valid JSON');

  assert.ok(Array.isArray(parsed), 'parsed JSON should be an array');
  assert.equal((parsed as unknown[]).length, 5, `expected 5 elements, got ${(parsed as unknown[]).length}`);
});

// AC4: 3-event file + --n 10 → exactly 3 lines (no crash), exit 0
test('AC4: tail --n 10 with 3-event file returns exactly 3 lines (N > count)', () => {
  const cycleDir = makeCycleDir(3);
  const { stdout, status } = runTail(['--n', '10', cycleDir]);

  assert.equal(status, 0, 'exit code should be 0');

  const lines = stdout.trimEnd().split('\n');
  assert.equal(lines.length, 3, `expected 3 lines, got ${lines.length}`);
});
