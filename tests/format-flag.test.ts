/**
 * Integration tests for the --format json|markdown flag added to src/cli.ts.
 *
 * AC1: --format json → stdout is valid JSON containing top-level keys:
 *      initiativeId, outcome, verdict, totalCostUsd, phases, themes,
 *      filesTouched, commits, pr, costByPhase
 * AC2: (no --format) or (--format markdown) → stdout begins with '# Trail'
 *      and existing markdown behaviour is preserved
 * AC3: --format xml (unrecognised value) → exits non-zero, stderr contains error
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

const INIT_ID = 'INIT-FORMAT-TEST';

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
function makeEvents(costUsd: number): string {
  return [
    JSON.stringify({
      phase: 'developer',
      event: 'wi.started',
      timestamp: '2026-05-25T09:00:00Z',
      initiative_id: INIT_ID,
    }),
    JSON.stringify({
      phase: 'cycle.end',
      event: 'cycle.complete',
      timestamp: '2026-05-25T10:00:00Z',
      verdict: 'complete',
      cost_usd: costUsd,
    }),
  ].join('\n') + '\n';
}

// ── Single-cycle fixture (shared across all ACs) ───────────────────────────────

let fixtureDir: string;
const CYCLE_ID = `2026-05-25T10-00-00Z_${INIT_ID}`;

before(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'format-flag-test-'));

  const logsDir = join(fixtureDir, '_logs');
  mkdirSync(logsDir);

  const cycleDir = join(logsDir, CYCLE_ID);
  mkdirSync(cycleDir);
  writeFileSync(join(cycleDir, 'events.jsonl'), makeEvents(0.24));
});

after(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

// ── AC1: --format json → valid JSON with required top-level keys ──────────────

describe('--format flag: AC1 (json output)', () => {
  it('exits 0 when --format json is passed', () => {
    const { exitCode, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('stdout is valid JSON', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout);
    } catch (e) {
      assert.fail(`stdout is not valid JSON: ${(e as Error).message}\nstdout: ${stdout}`);
    }
    assert.ok(
      parsed !== null && typeof parsed === 'object',
      `JSON output should be an object; got: ${typeof parsed}`,
    );
  });

  it('JSON output contains all required top-level keys', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    const requiredKeys = [
      'initiativeId',
      'outcome',
      'verdict',
      'totalCostUsd',
      'phases',
      'themes',
      'filesTouched',
      'commits',
      'pr',
      'costByPhase',
    ];
    for (const key of requiredKeys) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(parsed, key),
        `JSON output is missing required key "${key}"; keys present: ${Object.keys(parsed).join(', ')}`,
      );
    }
  });

  it('JSON output has correct initiativeId', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    assert.equal(
      parsed['initiativeId'],
      INIT_ID,
      `initiativeId should be "${INIT_ID}"; got: ${parsed['initiativeId']}`,
    );
  });

  it('JSON output has correct totalCostUsd (0.24)', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    assert.equal(
      parsed['totalCostUsd'],
      0.24,
      `totalCostUsd should be 0.24; got: ${parsed['totalCostUsd']}`,
    );
  });

  it('JSON output phases is an array', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    assert.ok(
      Array.isArray(parsed['phases']),
      `phases should be an array; got: ${typeof parsed['phases']}`,
    );
  });

  it('JSON output costByPhase is an object', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    assert.ok(
      parsed['costByPhase'] !== null && typeof parsed['costByPhase'] === 'object' && !Array.isArray(parsed['costByPhase']),
      `costByPhase should be an object; got: ${typeof parsed['costByPhase']}`,
    );
  });

  it('JSON output has correct verdict (complete)', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const parsed = JSON.parse(stdout) as Record<string, unknown>;
    assert.equal(
      parsed['verdict'],
      'complete',
      `verdict should be "complete"; got: ${parsed['verdict']}`,
    );
    assert.equal(
      parsed['outcome'],
      'complete',
      `outcome should be "complete"; got: ${parsed['outcome']}`,
    );
  });

  it('JSON output also works with --format=json (equals syntax)', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format=json'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout);
    } catch (e) {
      assert.fail(`stdout is not valid JSON with --format=json: ${(e as Error).message}`);
    }
    assert.ok(parsed !== null && typeof parsed === 'object');
  });
});

// ── AC2: no --format / --format markdown → starts with '# Trail' ─────────────

describe('--format flag: AC2 (markdown output, default)', () => {
  it('stdout begins with "# Trail" when no --format is given', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.startsWith('# Trail'),
      `stdout should begin with "# Trail"; got:\n${stdout.slice(0, 200)}`,
    );
  });

  it('stdout begins with "# Trail" when --format markdown is given', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'markdown'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.startsWith('# Trail'),
      `stdout should begin with "# Trail"; got:\n${stdout.slice(0, 200)}`,
    );
  });

  it('stdout contains "## Summary" when no --format is given (markdown preserved)', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('## Summary'),
      `stdout should contain "## Summary"; got:\n${stdout}`,
    );
  });

  it('stdout contains initiative ID when markdown is output', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes(INIT_ID),
      `stdout should contain initiative ID "${INIT_ID}"; got:\n${stdout}`,
    );
  });

  it('stdout does NOT look like JSON when --format markdown is given', () => {
    const { exitCode, stdout, stderr } = runCli(
      [INIT_ID, '--format', 'markdown'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      !stdout.trim().startsWith('{'),
      `stdout should NOT look like JSON when --format markdown; got:\n${stdout.slice(0, 200)}`,
    );
  });
});

// ── AC3: --format xml (unrecognised) → non-zero exit + stderr error ───────────

describe('--format flag: AC3 (unrecognised format value)', () => {
  it('exits non-zero when --format xml is given', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--format', 'xml'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit with a non-zero exit code for --format xml');
  });

  it('stderr contains an error message when --format xml is given', () => {
    const { stderr } = runCli(
      [INIT_ID, '--format', 'xml'],
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

  it('stderr mentions the unrecognised value when --format xml is given', () => {
    const { stderr } = runCli(
      [INIT_ID, '--format', 'xml'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('xml'),
      `stderr should mention the bad value "xml"; got:\n${stderr}`,
    );
  });

  it('exits non-zero for other unrecognised values like --format csv', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--format', 'csv'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit with a non-zero exit code for --format csv');
  });
});
