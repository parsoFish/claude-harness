/**
 * Basic tests for --compact flag: verifies renderCompact() output via CLI.
 *
 * AC1: happy path — compact output matches 3-line format with INIT-FIXTURE-1 data.
 * AC2: placeholder path — missing cycle.end → '(unknown)' verdict, '$0.00' cost.
 *
 * Self-contained: creates its own tmpdir, copies fixtures, cleans up.
 * Uses node:test and node:assert/strict only. Pattern mirrors tests/format-flag.test.ts.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Run the CLI from a given cwd directory, returning stdout/stderr/exitCode. */
function runCli(
  args: string[],
  cwd: string,
): { exitCode: number; stdout: string; stderr: string } {
  const cliPath = resolve(
    import.meta.dirname ?? join(process.cwd(), 'tests'),
    '../src/cli.ts',
  );
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', cliPath, ...args],
    { encoding: 'utf8', cwd },
  );
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

// ── Fixture paths ─────────────────────────────────────────────────────────────

const INIT_ID = 'INIT-FIXTURE-1';
// Cycle directory name must contain INIT_ID so CLI can match it
const CYCLE_NAME = `2026-05-24T10-00-00Z_${INIT_ID}`;

const FIXTURES_DIR = resolve(
  import.meta.dirname ?? join(process.cwd(), 'tests'),
  'fixtures',
);

// ── AC1: happy path — events.jsonl with cycle.end verdict='approve' ───────────

let ac1TmpDir: string;

before(() => {
  ac1TmpDir = mkdtempSync(join(tmpdir(), 'compact-basic-ac1-'));
  const logsDir = join(ac1TmpDir, '_logs');
  mkdirSync(logsDir);
  const cycleDir = join(logsDir, CYCLE_NAME);
  mkdirSync(cycleDir);

  // Copy events.jsonl from the shared INIT-FIXTURE-1 fixture
  const srcEvents = join(FIXTURES_DIR, 'cycle-INIT-FIXTURE-1', 'events.jsonl');
  writeFileSync(join(cycleDir, 'events.jsonl'), readFileSync(srcEvents));
});

after(() => {
  rmSync(ac1TmpDir, { recursive: true, force: true });
});

describe('--compact flag: AC1 (happy path with cycle.end verdict=approve)', () => {
  it('exits 0', () => {
    const { exitCode, stderr } = runCli([INIT_ID, '--compact'], ac1TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('stdout is exactly the 3-line compact format', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], ac1TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const expected = `# Trail — ${INIT_ID}\nVerdict: approve\nCost: $0.24\n`;
    assert.equal(
      stdout,
      expected,
      `stdout did not match expected compact output.\nExpected: ${JSON.stringify(expected)}\nGot:      ${JSON.stringify(stdout)}`,
    );
  });

  it('first line is the title heading', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], ac1TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[0],
      `# Trail — ${INIT_ID}`,
      `Line 1 should be "# Trail — ${INIT_ID}"; got: "${lines[0]}"`,
    );
  });

  it('second line shows Verdict: approve', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], ac1TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[1],
      'Verdict: approve',
      `Line 2 should be "Verdict: approve"; got: "${lines[1]}"`,
    );
  });

  it('third line shows Cost: $0.24', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], ac1TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[2],
      'Cost: $0.24',
      `Line 3 should be "Cost: $0.24"; got: "${lines[2]}"`,
    );
  });
});

// ── AC2: no cycle.end event — verdict (unknown), cost $0.00 ──────────────────

const AC2_INIT_ID = 'INIT-COMPACT-NO-END';
const AC2_CYCLE_NAME = `2026-05-30T10-00-00Z_${AC2_INIT_ID}`;

/** Minimal events.jsonl with no cycle.end event (no verdict, no cost). */
function makeEventsNoEnd(): string {
  return [
    JSON.stringify({
      phase: 'architect',
      event: 'cycle.start',
      timestamp: '2026-05-30T09:00:00Z',
      initiative_id: AC2_INIT_ID,
    }),
    JSON.stringify({
      phase: 'developer',
      event: 'wi.started',
      timestamp: '2026-05-30T09:15:00Z',
      work_item_id: 'WI-1',
    }),
  ].join('\n') + '\n';
}

let ac2TmpDir: string;

before(() => {
  ac2TmpDir = mkdtempSync(join(tmpdir(), 'compact-basic-ac2-'));
  const logsDir = join(ac2TmpDir, '_logs');
  mkdirSync(logsDir);
  const cycleDir = join(logsDir, AC2_CYCLE_NAME);
  mkdirSync(cycleDir);
  writeFileSync(join(cycleDir, 'events.jsonl'), makeEventsNoEnd());
});

after(() => {
  rmSync(ac2TmpDir, { recursive: true, force: true });
});

describe('--compact flag: AC2 (no cycle.end event — unknown verdict, zero cost)', () => {
  it('exits 0', () => {
    const { exitCode, stderr } = runCli([AC2_INIT_ID, '--compact'], ac2TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('second line shows Verdict: (unknown)', () => {
    const { exitCode, stdout, stderr } = runCli([AC2_INIT_ID, '--compact'], ac2TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[1],
      'Verdict: (unknown)',
      `Line 2 should be "Verdict: (unknown)"; got: "${lines[1]}"`,
    );
  });

  it('third line shows Cost: $0.00', () => {
    const { exitCode, stdout, stderr } = runCli([AC2_INIT_ID, '--compact'], ac2TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[2],
      'Cost: $0.00',
      `Line 3 should be "Cost: $0.00"; got: "${lines[2]}"`,
    );
  });

  it('stdout has exactly 4 parts when split by newline (3 lines + trailing newline)', () => {
    const { exitCode, stdout, stderr } = runCli([AC2_INIT_ID, '--compact'], ac2TmpDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parts = stdout.split('\n');
    assert.equal(
      parts.length,
      4,
      `stdout should split into 4 parts (3 lines + empty trailing); got ${parts.length}: ${JSON.stringify(parts)}`,
    );
    assert.equal(
      parts[3],
      '',
      `Last part after split should be empty string (trailing newline); got: "${parts[3]}"`,
    );
  });
});
