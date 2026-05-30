/**
 * Integration tests for the --compact flag added to src/cli.ts.
 *
 * AC1: GIVEN fixture cycle-INIT-FIXTURE-1 (verdict=approve, cost=$0.24)
 *      WHEN CLI is run with `INIT-FIXTURE-1 --compact`
 *      THEN stdout matches tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md byte-for-byte (trimEnd comparison)
 *
 * AC2: GIVEN the compact golden file exists at tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md
 *      WHEN its content is inspected
 *      THEN it contains exactly 3 non-empty lines: '# Trail — INIT-FIXTURE-1', 'Verdict: approve', 'Cost: $0.24'
 *
 * AC3: GIVEN CLI invoked with `INIT-FIXTURE-1 --compact --format json`
 *      THEN exit code is non-zero and stderr mentions '--compact'
 *
 * AC4: GIVEN CLI invoked with `INIT-FIXTURE-1 --compact --out /tmp/x.md`
 *      THEN exit code is non-zero and stderr mentions '--out'
 *
 * AC5: GIVEN CLI invoked with `INIT-FIXTURE-1 --compact --since some-id`
 *      THEN exit code is non-zero and stderr mentions '--since'
 *
 * AC6: GIVEN the INIT-FIXTURE-1 fixture run WITHOUT --compact
 *      WHEN `claude-trail INIT-FIXTURE-1` is executed
 *      THEN stdout matches the existing golden file INIT-FIXTURE-1.trail.golden.md byte-for-byte
 *
 * Self-contained: creates tmpdir, copies INIT-FIXTURE-1 fixture, cleans up.
 * Uses node:test + node:assert/strict only. Pattern mirrors tests/format-flag.test.ts.
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
// Cycle directory name must contain INIT_ID so the CLI can match it
const CYCLE_NAME = `2026-05-24T10-00-00Z_${INIT_ID}`;

const FIXTURES_DIR = resolve(
  import.meta.dirname ?? join(process.cwd(), 'tests'),
  'fixtures',
);

const COMPACT_GOLDEN_PATH = join(FIXTURES_DIR, 'INIT-FIXTURE-1.trail-compact.golden.md');
const FULL_GOLDEN_PATH = join(FIXTURES_DIR, 'INIT-FIXTURE-1.trail.golden.md');

// ── Shared tmpdir setup ───────────────────────────────────────────────────────

let fixtureDir: string;

before(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'compact-flag-test-'));
  const logsDir = join(fixtureDir, '_logs');
  mkdirSync(logsDir);
  const cycleDir = join(logsDir, CYCLE_NAME);
  mkdirSync(cycleDir);

  // Copy the frozen fixture files into the tmpdir
  const srcDir = join(FIXTURES_DIR, 'cycle-INIT-FIXTURE-1');
  writeFileSync(join(cycleDir, 'events.jsonl'), readFileSync(join(srcDir, 'events.jsonl')));

  // Copy commits.json if it exists (for the full-trail test AC6)
  const commitsJsonSrc = join(srcDir, 'commits.json');
  try {
    writeFileSync(join(cycleDir, 'commits.json'), readFileSync(commitsJsonSrc));
  } catch {
    // commits.json may not be present — that's fine
  }

  // Copy PR metadata at the initiative root if present
  const prMetaSrc = join(FIXTURES_DIR, `${INIT_ID}.pr-metadata.json`);
  try {
    writeFileSync(join(fixtureDir, `${INIT_ID}.pr-metadata.json`), readFileSync(prMetaSrc));
  } catch {
    // pr-metadata.json may not be present — that's fine
  }
});

after(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

// ── AC1: stdout matches compact golden file byte-for-byte (trimEnd) ───────────

describe('--compact flag: AC1 (golden file comparison)', () => {
  it('exits 0 when --compact is passed with INIT-FIXTURE-1', () => {
    const { exitCode, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('stdout trimEnd matches compact golden file trimEnd', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID, '--compact'], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);

    const golden = readFileSync(COMPACT_GOLDEN_PATH, 'utf8');
    assert.equal(
      stdout.trimEnd(),
      golden.trimEnd(),
      `stdout did not match compact golden file.\nExpected (trimEnd):\n${golden.trimEnd()}\n\nGot (trimEnd):\n${stdout.trimEnd()}`,
    );
  });
});

// ── AC2: compact golden file contains exactly 3 non-empty lines ───────────────

describe('--compact flag: AC2 (golden file content inspection)', () => {
  it('compact golden file exists and is readable', () => {
    let content: string;
    try {
      content = readFileSync(COMPACT_GOLDEN_PATH, 'utf8');
    } catch (e) {
      assert.fail(`Could not read compact golden file at "${COMPACT_GOLDEN_PATH}": ${(e as Error).message}`);
    }
    assert.ok(content.length > 0, 'Compact golden file should not be empty');
  });

  it('compact golden file has exactly 3 non-empty lines', () => {
    const content = readFileSync(COMPACT_GOLDEN_PATH, 'utf8');
    const nonEmptyLines = content.split('\n').filter((line) => line.trim().length > 0);
    assert.equal(
      nonEmptyLines.length,
      3,
      `Compact golden file should have exactly 3 non-empty lines; got ${nonEmptyLines.length}: ${JSON.stringify(nonEmptyLines)}`,
    );
  });

  it('compact golden file first non-empty line is "# Trail — INIT-FIXTURE-1"', () => {
    const content = readFileSync(COMPACT_GOLDEN_PATH, 'utf8');
    const nonEmptyLines = content.split('\n').filter((line) => line.trim().length > 0);
    assert.equal(
      nonEmptyLines[0],
      '# Trail — INIT-FIXTURE-1',
      `First non-empty line should be "# Trail — INIT-FIXTURE-1"; got: "${nonEmptyLines[0]}"`,
    );
  });

  it('compact golden file second non-empty line is "Verdict: approve"', () => {
    const content = readFileSync(COMPACT_GOLDEN_PATH, 'utf8');
    const nonEmptyLines = content.split('\n').filter((line) => line.trim().length > 0);
    assert.equal(
      nonEmptyLines[1],
      'Verdict: approve',
      `Second non-empty line should be "Verdict: approve"; got: "${nonEmptyLines[1]}"`,
    );
  });

  it('compact golden file third non-empty line is "Cost: $0.24"', () => {
    const content = readFileSync(COMPACT_GOLDEN_PATH, 'utf8');
    const nonEmptyLines = content.split('\n').filter((line) => line.trim().length > 0);
    assert.equal(
      nonEmptyLines[2],
      'Cost: $0.24',
      `Third non-empty line should be "Cost: $0.24"; got: "${nonEmptyLines[2]}"`,
    );
  });
});

// ── AC3: --compact + --format json → non-zero exit, stderr mentions '--compact' ─

describe('--compact flag: AC3 (conflicts with --format json)', () => {
  it('exits non-zero when --compact and --format json are combined', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --format json');
  });

  it('stderr mentions "--compact" when --compact and --format json are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact'),
      `stderr should mention "--compact"; got:\n${stderr}`,
    );
  });
});

// ── AC4: --compact + --out → non-zero exit, stderr mentions '--out' ────────────

describe('--compact flag: AC4 (conflicts with --out)', () => {
  it('exits non-zero when --compact and --out are combined', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--compact', '--out', '/tmp/x.md'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --out');
  });

  it('stderr mentions "--out" when --compact and --out are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--out', '/tmp/x.md'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--out'),
      `stderr should mention "--out"; got:\n${stderr}`,
    );
  });
});

// ── AC5: --compact + --since → non-zero exit, stderr mentions '--since' ────────

describe('--compact flag: AC5 (conflicts with --since)', () => {
  it('exits non-zero when --compact and --since are combined', () => {
    const { exitCode } = runCli(
      [INIT_ID, '--compact', '--since', 'some-id'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --since');
  });

  it('stderr mentions "--since" when --compact and --since are combined', () => {
    const { stderr } = runCli(
      [INIT_ID, '--compact', '--since', 'some-id'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--since'),
      `stderr should mention "--since"; got:\n${stderr}`,
    );
  });
});

// ── AC6: WITHOUT --compact → stdout matches full golden file byte-for-byte ────

describe('--compact flag: AC6 (full trail unchanged without --compact)', () => {
  it('exits 0 when no --compact flag is given', () => {
    const { exitCode, stderr } = runCli([INIT_ID], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('stdout trimEnd matches the existing full trail golden file trimEnd', () => {
    const { exitCode, stdout, stderr } = runCli([INIT_ID], fixtureDir);
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);

    const golden = readFileSync(FULL_GOLDEN_PATH, 'utf8');
    assert.equal(
      stdout.trimEnd(),
      golden.trimEnd(),
      `stdout (without --compact) did not match full golden file.\nExpected (trimEnd):\n${golden.trimEnd()}\n\nGot (trimEnd):\n${stdout.trimEnd()}`,
    );
  });
});
