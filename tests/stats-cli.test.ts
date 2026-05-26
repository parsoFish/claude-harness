/**
 * Integration tests for the `stats` subcommand of src/cli.ts (WI-4).
 *
 * Spawns `node --experimental-strip-types src/cli.ts stats [--json] <cycle-dir>`
 * against the existing fixture at tests/fixtures/cycle-INIT-FIXTURE-1/
 * which has a frozen events.jsonl — no network, hermetic.
 *
 * Expected counts are derived programmatically from the fixture so the tests
 * stay correct if the fixture is ever extended.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ── helpers ───────────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '..');
const CLI_PATH = join(ROOT, 'src', 'cli.ts');
const FIXTURE_CYCLE_DIR = join(ROOT, 'tests', 'fixtures', 'cycle-INIT-FIXTURE-1');

/**
 * Run the CLI with the `stats` subcommand and return exit code + streams.
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

/**
 * Derive expected per-phase counts from the fixture events.jsonl
 * programmatically so magic numbers are never hardcoded.
 */
function deriveCounts(cycleDir: string): Record<string, number> {
  const eventsPath = join(cycleDir, 'events.jsonl');
  const lines = readFileSync(eventsPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() !== '');

  const events = lines.map((l) => JSON.parse(l) as Record<string, unknown>);

  const counts: Record<string, number> = {};
  for (const evt of events) {
    const phase = typeof evt['phase'] === 'string' ? evt['phase'] : '';
    counts[phase] = (counts[phase] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return { ...counts, total };
}

// ── AC1: text table output (no --json flag) ───────────────────────────────────

describe('stats subcommand — text table output (AC1)', () => {
  it('exits 0 and stdout contains a phase: header and per-phase counts', () => {
    const expected = deriveCounts(FIXTURE_CYCLE_DIR);

    const { exitCode, stdout, stderr } = runStats([FIXTURE_CYCLE_DIR]);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    // Must contain header line starting with 'phase:'
    assert.ok(
      stdout.includes('phase:'),
      `stdout should contain 'phase:' header. Got:\n${stdout}`,
    );

    // Must contain 'events' column header
    assert.ok(
      stdout.includes('events'),
      `stdout should contain 'events' column header. Got:\n${stdout}`,
    );

    // Must contain each phase name
    for (const phase of Object.keys(expected).filter((k) => k !== 'total')) {
      assert.ok(
        stdout.includes(phase),
        `stdout should contain phase '${phase}'. Got:\n${stdout}`,
      );
    }

    // Must contain the total count
    assert.ok(
      stdout.includes('total'),
      `stdout should contain 'total' row. Got:\n${stdout}`,
    );
    assert.ok(
      stdout.includes(String(expected['total'])),
      `stdout should contain total count ${expected['total']}. Got:\n${stdout}`,
    );

    // Must contain each phase count
    for (const [phase, count] of Object.entries(expected)) {
      if (phase === 'total') continue;
      assert.ok(
        stdout.includes(String(count)),
        `stdout should contain count ${count} for phase '${phase}'. Got:\n${stdout}`,
      );
    }
  });
});

// ── AC2: JSON output (--json flag) ────────────────────────────────────────────

describe('stats subcommand — JSON output (AC2)', () => {
  it('exits 0 and stdout is a single-line JSON object with per-phase counts and a total key', () => {
    const expected = deriveCounts(FIXTURE_CYCLE_DIR);

    const { exitCode, stdout, stderr } = runStats(['--json', FIXTURE_CYCLE_DIR]);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    // Must be a single non-empty line (JSON object on one line)
    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(
      lines.length,
      1,
      `expected exactly 1 output line, got ${lines.length}: ${JSON.stringify(lines)}`,
    );

    // Must be valid JSON
    let parsed: Record<string, number>;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(lines[0]!) as Record<string, number>;
    }, `stdout should be valid JSON. Got: ${lines[0]}`);

    // Must have a 'total' key
    assert.ok(
      'total' in parsed!,
      `JSON output should have a 'total' key. Got: ${lines[0]}`,
    );

    // Per-phase counts must match
    for (const [phase, count] of Object.entries(expected)) {
      assert.equal(
        parsed![phase],
        count,
        `JSON output for phase '${phase}' should be ${count}, got ${parsed![phase]}`,
      );
    }
  });

  it('also accepts --json after the cycle-dir positional argument', () => {
    const { exitCode, stdout, stderr } = runStats([FIXTURE_CYCLE_DIR, '--json']);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(lines.length, 1, `expected 1 line, got ${lines.length}`);

    assert.doesNotThrow(() => {
      JSON.parse(lines[0]!);
    }, `stdout should be valid JSON. Got: ${lines[0]}`);
  });
});

// ── AC3: no cycle-dir argument ────────────────────────────────────────────────

describe('stats subcommand — no cycle-dir argument (AC3)', () => {
  it('exits 1 and stderr contains a usage hint when no cycle-dir is supplied', () => {
    const { exitCode, stderr } = runStats([]);

    assert.equal(exitCode, 1, `expected exit 1, got ${exitCode}`);
    assert.ok(
      stderr.length > 0,
      'should print a usage hint to stderr',
    );
    assert.ok(
      stderr.toLowerCase().includes('usage'),
      `stderr should contain 'usage' hint. Got: ${stderr}`,
    );
  });

  it('exits 1 when only --json is supplied (no positional cycle-dir)', () => {
    const { exitCode, stderr } = runStats(['--json']);

    assert.equal(exitCode, 1, `expected exit 1, got ${exitCode}`);
    assert.ok(stderr.length > 0, 'should print usage or error to stderr');
  });
});
