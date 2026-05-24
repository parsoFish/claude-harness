/**
 * Integration tests for the --out <path> flag added to src/cli.ts.
 *
 * AC1: --out /tmp/trail.md → the file at the given path is written with the full trail markdown
 * AC2: --out /tmp/trail.md → stdout contains exactly 'wrote trail to /tmp/trail.md' and nothing else
 * AC3: (no --out)         → stdout contains the full trail markdown (regression: existing behaviour unchanged)
 * AC4: --out /nonexistent-dir/trail.md → exits non-zero and stderr contains an error message
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

// ── Fixture helpers ───────────────────────────────────────────────────────────

const INIT_ID = 'INIT-OUT-TEST';

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

/** Minimal events.jsonl for a cycle. */
function makeEvents(costUsd: number): string {
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

// ── Fixture setup (shared across AC1/AC2/AC3) ─────────────────────────────────

let fixtureDir: string;
const CYCLE_ID = `2026-05-24T10-00-00Z_${INIT_ID}`;

before(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'out-flag-test-'));

  const logsDir = join(fixtureDir, '_logs');
  mkdirSync(logsDir);

  const cycleDir = join(logsDir, CYCLE_ID);
  mkdirSync(cycleDir);
  writeFileSync(join(cycleDir, 'events.jsonl'), makeEvents(0.42));
});

after(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

// ── AC1: --out <path> writes the full trail markdown to the given file ────────

describe('--out flag: AC1', () => {
  it('writes the full trail markdown content to the given file path', () => {
    const outPath = join(fixtureDir, 'trail-ac1.md');
    const { exitCode, stderr } = runCli(
      [INIT_ID, '--out', outPath],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);

    const content = readFileSync(outPath, 'utf8');
    // Should contain typical trail markdown sections
    assert.ok(
      content.includes('## Summary'),
      `file should contain "## Summary"; got:\n${content}`,
    );
    assert.ok(
      content.includes(INIT_ID),
      `file should contain initiative ID "${INIT_ID}"; got:\n${content}`,
    );
    // Should not be empty
    assert.ok(content.length > 0, 'written file should not be empty');
  });
});

// ── AC2: --out <path> → stdout is exactly 'wrote trail to <path>' ─────────────

describe('--out flag: AC2', () => {
  it('stdout contains exactly the confirmation line and nothing else', () => {
    const outPath = join(fixtureDir, 'trail-ac2.md');
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--out', outPath],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);

    const expectedLine = `wrote trail to ${outPath}`;
    assert.equal(
      stdout.trim(),
      expectedLine,
      `stdout should be exactly "${expectedLine}"; got:\n${stdout}`,
    );
  });

  it('stdout does NOT contain the trail markdown when --out is used', () => {
    const outPath = join(fixtureDir, 'trail-ac2b.md');
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--out', outPath],
      fixtureDir,
    );

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      !stdout.includes('## Summary'),
      `stdout should NOT contain trail markdown "## Summary"; got:\n${stdout}`,
    );
  });
});

// ── AC3: no --out → stdout contains full trail markdown (backward compat) ─────

describe('--out flag: AC3 (no --out, backward-compat)', () => {
  it('exits 0 and stdout contains the full trail markdown', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID], fixtureDir);

    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('## Summary'),
      `stdout should contain "## Summary"; got:\n${stdout}`,
    );
    assert.ok(
      stdout.includes(INIT_ID),
      `stdout should contain initiative ID "${INIT_ID}"; got:\n${stdout}`,
    );
  });

  it('stdout does NOT contain confirmation line when --out is absent', () => {
    const { exitCode, stdout } = runCli([INIT_ID], fixtureDir);

    assert.equal(exitCode, 0);
    assert.ok(
      !stdout.includes('wrote trail to'),
      `stdout should NOT contain "wrote trail to" when --out is absent; got:\n${stdout}`,
    );
  });
});

// ── AC4: --out /nonexistent-dir/trail.md → non-zero exit + stderr error msg ───

describe('--out flag: AC4 (nonexistent parent directory)', () => {
  it('exits non-zero when the parent directory does not exist', () => {
    const outPath = '/nonexistent-dir-out-flag-test/trail.md';
    const { exitCode } = runCli(
      [INIT_ID, '--out', outPath],
      fixtureDir,
    );

    assert.notEqual(exitCode, 0, 'CLI should exit with a non-zero exit code');
  });

  it('stderr contains an error message when the parent directory does not exist', () => {
    const outPath = '/nonexistent-dir-out-flag-test/trail.md';
    const { stderr } = runCli(
      [INIT_ID, '--out', outPath],
      fixtureDir,
    );

    assert.ok(
      stderr.length > 0,
      `stderr should contain an error message; got empty stderr`,
    );
    assert.ok(
      stderr.toLowerCase().includes('error'),
      `stderr should contain "error"; got:\n${stderr}`,
    );
  });
});
