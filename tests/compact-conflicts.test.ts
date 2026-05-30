/**
 * Tests for --compact flag conflict detection in src/cli.ts.
 *
 * AC1: --compact + --format json → non-zero exit, stderr contains '--compact' and 'json'
 * AC2: --compact + --out /some/path → non-zero exit, stderr contains '--compact' and '--out'
 * AC3: --compact + --since some-cycle-id → non-zero exit, stderr contains '--compact' and '--since'
 * AC4: --compact alone (no conflicting flags) → exit 0, 3-line compact output (regression guard)
 *
 * Self-contained: creates its own tmpdir, generates fixture events.jsonl, cleans up.
 * Uses node:test + node:assert/strict only. Mirrors pattern from tests/format-flag.test.ts.
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

// ── Shared fixture ────────────────────────────────────────────────────────────

const INIT_ID = 'INIT-COMPACT-CONFLICTS';
const CYCLE_NAME = `2026-05-30T12-00-00Z_${INIT_ID}`;

/** Minimal events.jsonl with a cycle.end event carrying a verdict and cost. */
function makeEvents(): string {
  return [
    JSON.stringify({
      phase: 'developer',
      event: 'wi.started',
      timestamp: '2026-05-30T11:00:00Z',
      initiative_id: INIT_ID,
    }),
    JSON.stringify({
      phase: 'cycle.end',
      event: 'cycle.complete',
      timestamp: '2026-05-30T12:00:00Z',
      verdict: 'approve',
      cost_usd: 0.10,
    }),
  ].join('\n') + '\n';
}

let fixtureDir: string;

before(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'compact-conflicts-'));
  const logsDir = join(fixtureDir, '_logs');
  mkdirSync(logsDir);
  const cycleDir = join(logsDir, CYCLE_NAME);
  mkdirSync(cycleDir);
  writeFileSync(join(cycleDir, 'events.jsonl'), makeEvents());
});

after(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

// ── AC1: --compact + --format json → non-zero exit ────────────────────────────

describe('--compact conflict: AC1 (--compact + --format json)', () => {
  it('exits non-zero when --compact and --format json are combined', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.notEqual(
      exitCode,
      0,
      'CLI should exit non-zero when --compact and --format json are combined',
    );
  });

  it('stderr contains "--compact" when --compact and --format json are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact'),
      `stderr should contain "--compact"; got:\n${stderr}`,
    );
  });

  it('stderr contains "json" when --compact and --format json are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('json'),
      `stderr should contain "json"; got:\n${stderr}`,
    );
  });

  it('also works with --format=json (equals syntax)', () => {
    const { exitCode, stderr } = runCli(
      [INIT_ID, '--compact', '--format=json'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --format=json');
    assert.ok(stderr.includes('--compact'), `stderr should contain "--compact"; got:\n${stderr}`);
    assert.ok(stderr.includes('json'), `stderr should contain "json"; got:\n${stderr}`);
  });
});

// ── AC2: --compact + --out → non-zero exit ────────────────────────────────────

describe('--compact conflict: AC2 (--compact + --out)', () => {
  it('exits non-zero when --compact and --out are combined', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--compact', '--out', '/tmp/some-output.md'],
      fixtureDir,
    );
    assert.notEqual(
      exitCode,
      0,
      'CLI should exit non-zero when --compact and --out are combined',
    );
  });

  it('stderr contains "--compact" when --compact and --out are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--out', '/tmp/some-output.md'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact'),
      `stderr should contain "--compact"; got:\n${stderr}`,
    );
  });

  it('stderr contains "--out" when --compact and --out are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--out', '/tmp/some-output.md'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--out'),
      `stderr should contain "--out"; got:\n${stderr}`,
    );
  });

  it('also works with --out=<path> (equals syntax)', () => {
    const { exitCode, stderr } = runCli(
      [INIT_ID, '--compact', '--out=/tmp/some-output.md'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --out=<path>');
    assert.ok(stderr.includes('--compact'), `stderr should contain "--compact"; got:\n${stderr}`);
    assert.ok(stderr.includes('--out'), `stderr should contain "--out"; got:\n${stderr}`);
  });
});

// ── AC3: --compact + --since → non-zero exit ─────────────────────────────────

describe('--compact conflict: AC3 (--compact + --since)', () => {
  it('exits non-zero when --compact and --since are combined', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--compact', '--since', 'some-cycle-id'],
      fixtureDir,
    );
    assert.notEqual(
      exitCode,
      0,
      'CLI should exit non-zero when --compact and --since are combined',
    );
  });

  it('stderr contains "--compact" when --compact and --since are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--since', 'some-cycle-id'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact'),
      `stderr should contain "--compact"; got:\n${stderr}`,
    );
  });

  it('stderr contains "--since" when --compact and --since are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--since', 'some-cycle-id'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--since'),
      `stderr should contain "--since"; got:\n${stderr}`,
    );
  });

  it('also works with --since=<value> (equals syntax)', () => {
    const { exitCode, stderr } = runCli(
      [INIT_ID, '--compact', '--since=some-cycle-id'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --since=<value>');
    assert.ok(stderr.includes('--compact'), `stderr should contain "--compact"; got:\n${stderr}`);
    assert.ok(stderr.includes('--since'), `stderr should contain "--since"; got:\n${stderr}`);
  });
});

// ── AC4: --compact alone → exit 0, 3-line compact output (regression guard) ───

describe('--compact conflict: AC4 (--compact alone — regression guard)', () => {
  it('exits 0 when --compact is used without conflicting flags', () => {
    const { exitCode, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI should exit 0 with --compact alone; stderr: ${stderr}`);
  });

  it('stdout is the 3-line compact format', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI should exit 0 with --compact alone; stderr: ${stderr}`);
    const expected = `# Trail — ${INIT_ID}\nVerdict: approve\nCost: $0.10\n`;
    assert.equal(
      stdout,
      expected,
      `stdout did not match expected compact output.\nExpected: ${JSON.stringify(expected)}\nGot:      ${JSON.stringify(stdout)}`,
    );
  });

  it('stdout first line is the title heading', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI should exit 0 with --compact alone; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[0],
      `# Trail — ${INIT_ID}`,
      `Line 1 should be "# Trail — ${INIT_ID}"; got: "${lines[0]}"`,
    );
  });

  it('stdout second line shows the verdict', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI should exit 0 with --compact alone; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[1],
      'Verdict: approve',
      `Line 2 should be "Verdict: approve"; got: "${lines[1]}"`,
    );
  });

  it('stdout third line shows the cost', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI should exit 0 with --compact alone; stderr: ${stderr}`);
    const lines = stdout.split('\n');
    assert.equal(
      lines[2],
      'Cost: $0.10',
      `Line 3 should be "Cost: $0.10"; got: "${lines[2]}"`,
    );
  });

  it('stdout has exactly 4 parts when split by newline (3 lines + trailing newline)', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI should exit 0 with --compact alone; stderr: ${stderr}`);
    const parts = stdout.split('\n');
    assert.equal(
      parts.length,
      4,
      `stdout should split into 4 parts (3 lines + empty trailing); got ${parts.length}: ${JSON.stringify(parts)}`,
    );
    assert.equal(parts[3], '', `Last part should be empty string (trailing newline); got: "${parts[3]}"`);
  });
});
