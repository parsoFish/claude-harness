/**
 * Integration tests for the --since <cycle-id> flag added to src/cli.ts.
 *
 * AC1: --since <earlierCycleId> → stdout contains '## Cycles included' listing both cycle IDs
 * AC2: --since <earlierCycleId> → events from both cycles are aggregated
 * AC3: --since <laterCycleId>   → stdout contains '## Cycles included' with only the later cycle
 * AC4: (no --since)             → behaviour identical to pre-flag (existing tests still pass)
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// ── Fixture helpers ───────────────────────────────────────────────────────────

const INIT_ID = 'INIT-SINCE-TEST';

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

/** Minimal events.jsonl for a cycle that contributes a deterministic cost. */
function makeEvents(cycleId: string, costUsd: number): string {
  return [
    JSON.stringify({
      phase: 'developer',
      event: 'wi.started',
      timestamp: '2026-05-24T09:00:00Z',
      initiative_id: INIT_ID,
    }),
    JSON.stringify({
      phase: 'cycle.end',
      event: 'cycle.complete',
      timestamp: '2026-05-24T10:00:00Z',
      verdict: 'complete',
      cost_usd: costUsd,
    }),
  ].join('\n') + '\n';
}

// ── Two-cycle fixture (shared across AC1/AC2/AC3) ─────────────────────────────

let fixtureDir: string;
const CYCLE_EARLY = `2026-05-24T10-00-00Z_${INIT_ID}`;
const CYCLE_LATE  = `2026-05-24T14-00-00Z_${INIT_ID}`;

before(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'since-flag-test-'));

  const logsDir = join(fixtureDir, '_logs');
  mkdirSync(logsDir);

  // Early cycle — cost $0.10
  const earlyDir = join(logsDir, CYCLE_EARLY);
  mkdirSync(earlyDir);
  writeFileSync(join(earlyDir, 'events.jsonl'), makeEvents(CYCLE_EARLY, 0.10));

  // Late cycle — cost $0.20
  const lateDir = join(logsDir, CYCLE_LATE);
  mkdirSync(lateDir);
  writeFileSync(join(lateDir, 'events.jsonl'), makeEvents(CYCLE_LATE, 0.20));
});

after(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

// ── AC1: --since <earlyId> → '## Cycles included' lists both cycles ──────────

describe('--since flag: AC1', () => {
  it('stdout contains ## Cycles included section listing both cycle IDs', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--since', CYCLE_EARLY],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('## Cycles included'),
      `stdout should contain "## Cycles included"; got:\n${stdout}`,
    );
    assert.ok(
      stdout.includes(CYCLE_EARLY),
      `stdout should list early cycle "${CYCLE_EARLY}"; got:\n${stdout}`,
    );
    assert.ok(
      stdout.includes(CYCLE_LATE),
      `stdout should list late cycle "${CYCLE_LATE}"; got:\n${stdout}`,
    );
  });
});

// ── AC2: --since <earlyId> → aggregated cost covers both cycles ───────────────

describe('--since flag: AC2', () => {
  it('aggregated cost reflects combined data from both cycles ($0.30)', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--since', CYCLE_EARLY],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    // Combined cost should be $0.30 (0.10 + 0.20)
    assert.ok(
      stdout.includes('0.30'),
      `stdout should include combined cost "0.30"; got:\n${stdout}`,
    );
  });

  it('phases section includes events from both cycles', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--since', CYCLE_EARLY],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    // Both cycles have developer events — the phases section must show 'developer'
    assert.ok(
      stdout.includes('developer'),
      `stdout should include "developer" phase section; got:\n${stdout}`,
    );
  });
});

// ── AC3: --since <lateId> → only the late cycle is included ──────────────────

describe('--since flag: AC3', () => {
  it('stdout contains ## Cycles included with only the later cycle ID', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--since', CYCLE_LATE],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('## Cycles included'),
      `stdout should contain "## Cycles included"; got:\n${stdout}`,
    );
    assert.ok(
      stdout.includes(CYCLE_LATE),
      `stdout should list late cycle "${CYCLE_LATE}"; got:\n${stdout}`,
    );
    assert.ok(
      !stdout.includes(CYCLE_EARLY),
      `stdout should NOT list early cycle "${CYCLE_EARLY}"; got:\n${stdout}`,
    );
  });

  it('cost reflects only the later cycle ($0.20)', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--since', CYCLE_LATE],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    // Only late cycle: $0.20
    assert.ok(
      stdout.includes('0.20'),
      `stdout should include cost "0.20"; got:\n${stdout}`,
    );
    // Should NOT show $0.30 as total
    assert.ok(
      !stdout.includes('0.30'),
      `stdout should NOT include combined cost "0.30" when only late cycle selected; got:\n${stdout}`,
    );
  });
});

// ── AC4: no --since → existing single-cycle behaviour unchanged ───────────────

describe('--since flag: AC4 (no --since, backward-compat)', () => {
  it('exits 0 and produces output containing ## Summary without --since', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID], fixtureDir);

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('## Summary'),
      `stdout should contain "## Summary"; got:\n${stdout}`,
    );
  });

  it('does NOT output ## Cycles included when --since is omitted', () => {
    const { exitCode, stdout } = runCli([INIT_ID], fixtureDir);

    assert.equal(exitCode, 0);
    assert.ok(
      !stdout.includes('## Cycles included'),
      `stdout should NOT contain "## Cycles included" when --since is absent; got:\n${stdout}`,
    );
  });
});
