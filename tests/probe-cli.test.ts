/**
 * Integration tests for the `probe` subcommand of src/cli.ts (WI-3).
 *
 * Spawns `node --experimental-strip-types src/cli.ts probe <cycle-dir>`
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
 * Run the CLI with the `probe` subcommand and return exit code + streams.
 */
function runProbe(args: string[]): { exitCode: number; stdout: string; stderr: string } {
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', CLI_PATH, 'probe', ...args],
    { encoding: 'utf8' },
  );
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/**
 * Derive expected probe statistics from the fixture events.jsonl
 * programmatically so magic numbers are never hardcoded.
 */
function deriveExpected(cycleDir: string): {
  initiativeId: string;
  totalEvents: number;
  phaseCount: number;
  dominantPhase: string;
  dominantCount: number;
} {
  const eventsPath = join(cycleDir, 'events.jsonl');
  const lines = readFileSync(eventsPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() !== '');

  const events = lines.map((l) => JSON.parse(l) as Record<string, unknown>);
  const totalEvents = events.length;

  // Count events per phase
  const phaseCounts = new Map<string, number>();
  for (const evt of events) {
    const phase = typeof evt['phase'] === 'string' ? evt['phase'] : '';
    phaseCounts.set(phase, (phaseCounts.get(phase) ?? 0) + 1);
  }
  const phaseCount = phaseCounts.size;

  // Find initiative_id from first event carrying it
  let initiativeId = '';
  for (const evt of events) {
    if (typeof evt['initiative_id'] === 'string' && evt['initiative_id'] !== '') {
      initiativeId = evt['initiative_id'];
      break;
    }
  }

  // Determine dominant phase (most events)
  let dominantPhase = '';
  let dominantCount = 0;
  for (const [phase, count] of phaseCounts) {
    if (count > dominantCount) {
      dominantCount = count;
      dominantPhase = phase;
    }
  }

  return { initiativeId, totalEvents, phaseCount, dominantPhase, dominantCount };
}

// ── AC1: valid cycle directory ────────────────────────────────────────────────

describe('probe subcommand — valid cycle directory (AC1)', () => {
  it('exits 0 and prints exactly one summary line matching the expected format', () => {
    const expected = deriveExpected(FIXTURE_CYCLE_DIR);
    const expectedLine =
      `${expected.initiativeId}: ${expected.totalEvents} events, ` +
      `${expected.phaseCount} phases, dominant=${expected.dominantPhase} ` +
      `(${expected.dominantCount} events)`;

    const { exitCode, stdout, stderr } = runProbe([FIXTURE_CYCLE_DIR]);

    assert.equal(exitCode, 0, `expected exit 0, got ${exitCode}. stderr: ${stderr}`);

    const lines = stdout.split('\n').filter((l) => l.trim() !== '');
    assert.equal(
      lines.length,
      1,
      `expected exactly 1 output line, got ${lines.length}: ${JSON.stringify(lines)}`,
    );
    assert.equal(
      lines[0],
      expectedLine,
      `output line does not match expected format.\nGot:      ${lines[0]}\nExpected: ${expectedLine}`,
    );
  });
});

// ── AC2: non-existent path ────────────────────────────────────────────────────

describe('probe subcommand — non-existent path (AC2)', () => {
  it('exits non-zero and prints an error to stderr', () => {
    const nonExistentPath = join(ROOT, 'tests', 'fixtures', 'does-not-exist-xyz-12345');
    const { exitCode, stderr } = runProbe([nonExistentPath]);

    assert.notEqual(exitCode, 0, 'should exit with non-zero code');
    assert.ok(stderr.length > 0, 'should print an error to stderr');
  });

  it('exits non-zero when probe is called with no cycle-dir argument', () => {
    const { exitCode, stderr } = runProbe([]);

    assert.notEqual(exitCode, 0, 'should exit with non-zero code');
    assert.ok(stderr.length > 0, 'should print usage or error to stderr');
  });
});
