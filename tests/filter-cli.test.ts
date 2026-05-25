/**
 * Integration tests for the filter (cycles-dir) mode of src/cli.ts (WI-5).
 *
 * Spawns `node --experimental-strip-types src/cli.ts [--filter ...] <cycles-dir>`
 * against a temporary cycles directory constructed in-memory from test fixtures.
 *
 * All three acceptance criteria:
 *   AC1: --filter phase:reflection → only cycles with a reflection phase event
 *   AC2: --filter phase:reflection --filter status:done → AND semantics
 *   AC3: no --filter flags → all cycles returned
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

// ── helpers ───────────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '..');
const CLI_PATH = join(ROOT, 'src', 'cli.ts');

/** Spawn the CLI in filter (cycles-dir) mode and return exit code + streams. */
function runFilter(args: string[]): { exitCode: number; stdout: string; stderr: string } {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_PATH, ...args],
    { encoding: 'utf8' },
  );
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/**
 * Create a temporary cycles directory with the given cycle subdirs.
 * Each entry has:
 *   - name: subdir name (used as cycle name)
 *   - events: JSONL lines (already serialised) to write to events.jsonl
 *
 * Returns the path to the temp directory.
 */
function makeCyclesDir(
  cycles: Array<{ name: string; events: object[] }>,
): string {
  const dir = join(tmpdir(), `filter-cli-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  for (const cycle of cycles) {
    const cycleDir = join(dir, cycle.name);
    mkdirSync(cycleDir, { recursive: true });
    const jsonl = cycle.events.map((e) => JSON.stringify(e)).join('\n') + '\n';
    writeFileSync(join(cycleDir, 'events.jsonl'), jsonl, 'utf8');
  }
  return dir;
}

// ── fixtures ──────────────────────────────────────────────────────────────────

/** A cycle that includes a 'reflection' phase and status:done. */
const CYCLE_WITH_REFLECTION_DONE = [
  { phase: 'developer', event: 'wi.started', timestamp: '2026-01-01T00:00:00Z' },
  { phase: 'reflection', event: 'reflection.start', timestamp: '2026-01-01T01:00:00Z' },
  { phase: 'reflection', event: 'reflection.end', timestamp: '2026-01-01T02:00:00Z', status: 'done' },
];

/** A cycle that includes a 'reflection' phase but status is NOT 'done'. */
const CYCLE_WITH_REFLECTION_PENDING = [
  { phase: 'architect', event: 'plan.created', timestamp: '2026-01-02T00:00:00Z' },
  { phase: 'reflection', event: 'reflection.start', timestamp: '2026-01-02T01:00:00Z' },
  { phase: 'reflection', event: 'reflection.end', timestamp: '2026-01-02T02:00:00Z', status: 'pending' },
];

/** A cycle with NO reflection phase. */
const CYCLE_NO_REFLECTION = [
  { phase: 'developer', event: 'wi.started', timestamp: '2026-01-03T00:00:00Z' },
  { phase: 'developer', event: 'wi.committed', timestamp: '2026-01-03T01:00:00Z', cost_usd: 0.01 },
];

// ── AC1: --filter phase:reflection ───────────────────────────────────────────

describe('filter CLI — AC1: --filter phase:reflection', () => {
  let cyclesDir: string;

  before(() => {
    // Two cycles with reflection, one without
    cyclesDir = makeCyclesDir([
      { name: 'cycle-A', events: CYCLE_WITH_REFLECTION_DONE },
      { name: 'cycle-B', events: CYCLE_NO_REFLECTION },
      { name: 'cycle-C', events: CYCLE_WITH_REFLECTION_PENDING },
    ]);
  });

  after(() => {
    rmSync(cyclesDir, { recursive: true, force: true });
  });

  it('exits 0 and prints one summary line per cycle that has a reflection phase', () => {
    const { exitCode, stdout, stderr } = runFilter(['--filter', 'phase:reflection', cyclesDir]);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(
      lines.length,
      2,
      `expected 2 output lines (cycle-A and cycle-C), got ${lines.length}: ${JSON.stringify(lines)}`,
    );

    // Each line should be a summary line starting with the cycle name
    const names = lines.map((l) => l.split(':')[0]);
    assert.ok(names.includes('cycle-A'), `cycle-A not found in output: ${JSON.stringify(lines)}`);
    assert.ok(names.includes('cycle-C'), `cycle-C not found in output: ${JSON.stringify(lines)}`);
    assert.ok(!names.includes('cycle-B'), `cycle-B should be filtered out: ${JSON.stringify(lines)}`);
  });

  it('each printed line has the expected summary format', () => {
    const { exitCode, stdout, stderr } = runFilter(['--filter', 'phase:reflection', cyclesDir]);

    assert.equal(exitCode, 0, `expected exit 0. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    for (const line of lines) {
      // Format: `<name>: <N> events, <M> phases, dominant=<phase> (<k> events) [status=<s>]`
      assert.match(
        line,
        /^[\w-]+: \d+ events, \d+ phases, dominant=\S+ \(\d+ events\) \[status=.+\]$/,
        `line does not match expected format: "${line}"`,
      );
    }
  });
});

// ── AC2: --filter phase:reflection --filter status:done (AND semantics) ───────

describe('filter CLI — AC2: --filter phase:reflection --filter status:done', () => {
  let cyclesDir: string;

  before(() => {
    // cycle-A: reflection + status:done → should pass both filters
    // cycle-B: no reflection → should fail phase filter
    cyclesDir = makeCyclesDir([
      { name: 'cycle-A', events: CYCLE_WITH_REFLECTION_DONE },
      { name: 'cycle-B', events: CYCLE_WITH_REFLECTION_PENDING },
    ]);
  });

  after(() => {
    rmSync(cyclesDir, { recursive: true, force: true });
  });

  it('exits 0 and prints exactly one summary line when only one cycle satisfies both filters', () => {
    const { exitCode, stdout, stderr } = runFilter([
      '--filter', 'phase:reflection',
      '--filter', 'status:done',
      cyclesDir,
    ]);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(
      lines.length,
      1,
      `expected exactly 1 output line, got ${lines.length}: ${JSON.stringify(lines)}`,
    );

    // The one line should be for cycle-A
    assert.ok(
      lines[0]!.startsWith('cycle-A:'),
      `expected output line to start with "cycle-A:", got "${lines[0]}"`,
    );
  });

  it('cycle-B (reflection but status:pending) is excluded', () => {
    const { stdout, stderr } = runFilter([
      '--filter', 'phase:reflection',
      '--filter', 'status:done',
      cyclesDir,
    ]);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    const names = lines.map((l) => l.split(':')[0]);
    assert.ok(
      !names.includes('cycle-B'),
      `cycle-B should be excluded (status:pending). stderr: ${stderr}. output: ${JSON.stringify(lines)}`,
    );
  });
});

// ── AC3: no --filter flags → all cycles returned ──────────────────────────────

describe('filter CLI — AC3: no --filter flags → all cycles returned', () => {
  let cyclesDir: string;

  before(() => {
    // Three cycles of varying types — all should be returned
    cyclesDir = makeCyclesDir([
      { name: 'cycle-A', events: CYCLE_WITH_REFLECTION_DONE },
      { name: 'cycle-B', events: CYCLE_NO_REFLECTION },
      { name: 'cycle-C', events: CYCLE_WITH_REFLECTION_PENDING },
    ]);
  });

  after(() => {
    rmSync(cyclesDir, { recursive: true, force: true });
  });

  it('exits 0 and prints one summary line per cycle subdir (no filtering applied)', () => {
    const { exitCode, stdout, stderr } = runFilter([cyclesDir]);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(
      lines.length,
      3,
      `expected 3 output lines (all cycles), got ${lines.length}: ${JSON.stringify(lines)}`,
    );

    const names = lines.map((l) => l.split(':')[0]);
    assert.ok(names.includes('cycle-A'), `cycle-A not found in output`);
    assert.ok(names.includes('cycle-B'), `cycle-B not found in output`);
    assert.ok(names.includes('cycle-C'), `cycle-C not found in output`);
  });

  it('each line has the expected summary format even without filtering', () => {
    const { exitCode, stdout, stderr } = runFilter([cyclesDir]);

    assert.equal(exitCode, 0, `expected exit 0. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    for (const line of lines) {
      assert.match(
        line,
        /^[\w-]+: \d+ events, \d+ phases, dominant=\S+ \(\d+ events\) \[status=.+\]$/,
        `line does not match expected format: "${line}"`,
      );
    }
  });
});
