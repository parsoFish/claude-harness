/**
 * Integration tests for the --compact flag added to src/cli.ts.
 *
 * AC1: --compact with INIT-FIXTURE-1 → stdout is exactly the 3-line compact output
 * AC2: --compact --format json → non-zero exit, stderr contains incompatibility message
 * AC3: --compact --out /path → non-zero exit, stderr contains incompatibility message
 * AC4: --compact --since <cycle-id> → non-zero exit, stderr contains incompatibility message
 * AC5: --compact with no cycle.end event → 'Verdict: (unknown)' and 'Cost: $0.00'
 * AC6: no --compact with INIT-FIXTURE-1 → stdout matches INIT-FIXTURE-1.trail.golden.md
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const CYCLE_FIXTURE = join(FIXTURES_DIR, 'cycle-INIT-FIXTURE-1');
const PR_METADATA_FIXTURE = join(FIXTURES_DIR, 'INIT-FIXTURE-1.pr-metadata.json');

/**
 * Recursively copies a directory tree from src to dst.
 */
function copyDirRecursive(src: string, dst: string): void {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const dstPath = join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      copyFileSync(srcPath, dstPath);
    }
  }
}

// ── Fixture helpers ───────────────────────────────────────────────────────────

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

// ── AC1 / AC5: use actual INIT-FIXTURE-1 fixture from tests/fixtures ──────────

// Resolve the real fixture _logs dir (tests/fixtures/cycle-INIT-FIXTURE-1 lives
// under tests/fixtures, but the CLI looks for _logs/<name-containing-id>).
// We create a temp dir with a _logs/<cycle-name> → symlink isn't safe cross-platform,
// so we copy the fixture events into a temp dir.

const FIXTURE_INIT_ID = 'INIT-FIXTURE-1';
// Cycle name the CLI will pick up (contains FIXTURE_INIT_ID)
const FIXTURE_CYCLE_NAME = `cycle-${FIXTURE_INIT_ID}`;

let fixtureDir: string;

before(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), 'compact-flag-test-'));

  const logsDir = join(fixtureDir, '_logs');
  mkdirSync(logsDir);

  // Copy the real events.jsonl from the project's tests/fixtures/cycle-INIT-FIXTURE-1
  const srcEventsFile = resolve(
    import.meta.dirname ?? join(process.cwd(), 'tests'),
    'fixtures',
    FIXTURE_CYCLE_NAME,
    'events.jsonl',
  );
  const cycleDir = join(logsDir, FIXTURE_CYCLE_NAME);
  mkdirSync(cycleDir);
  const eventsContent = readFileSync(srcEventsFile, 'utf8');
  writeFileSync(join(cycleDir, 'events.jsonl'), eventsContent);
});

after(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

// ── AC1: --compact with INIT-FIXTURE-1 → exact 3-line output ─────────────────

describe('--compact flag: AC1 (compact output for INIT-FIXTURE-1)', () => {
  it('exits 0 when --compact is passed', () => {
    const { exitCode, stderr } = runCli(
      [FIXTURE_INIT_ID, '--compact'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('stdout is exactly the 3-line compact output', () => {
    const { exitCode, stdout, stderr } = runCli(
      [FIXTURE_INIT_ID, '--compact'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    const expected = `# Trail — ${FIXTURE_INIT_ID}\nVerdict: approve\nCost: $0.24\n`;
    assert.equal(
      stdout,
      expected,
      `stdout mismatch.\nExpected: ${JSON.stringify(expected)}\nGot:      ${JSON.stringify(stdout)}`,
    );
  });

  it('stdout matches the compact golden file', () => {
    const { exitCode, stdout, stderr } = runCli(
      [FIXTURE_INIT_ID, '--compact'],
      fixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);

    const goldenPath = resolve(
      import.meta.dirname ?? join(process.cwd(), 'tests'),
      'fixtures',
      `${FIXTURE_INIT_ID}.trail-compact.golden.md`,
    );
    const golden = readFileSync(goldenPath, 'utf8');
    assert.equal(
      stdout,
      golden,
      `stdout does not match compact golden file.\nExpected: ${JSON.stringify(golden)}\nGot:      ${JSON.stringify(stdout)}`,
    );
  });
});

// ── AC2: --compact --format json → non-zero + stderr message ─────────────────

describe('--compact flag: AC2 (conflict with --format json)', () => {
  it('exits non-zero when --compact --format json is passed', () => {
    const { exitCode } = runCli(
      [FIXTURE_INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --format json');
  });

  it('stderr contains incompatibility message for --format json', () => {
    const { stderr } = runCli(
      [FIXTURE_INIT_ID, '--compact', '--format', 'json'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact is not compatible with --format json'),
      `stderr should contain "--compact is not compatible with --format json"; got:\n${stderr}`,
    );
  });
});

// ── AC3: --compact --out /path → non-zero + stderr message ───────────────────

describe('--compact flag: AC3 (conflict with --out)', () => {
  it('exits non-zero when --compact --out /tmp/x is passed', () => {
    const { exitCode } = runCli(
      [FIXTURE_INIT_ID, '--compact', '--out', '/tmp/compact-test-out.md'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --out');
  });

  it('stderr contains incompatibility message for --out', () => {
    const { stderr } = runCli(
      [FIXTURE_INIT_ID, '--compact', '--out', '/tmp/compact-test-out.md'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact is not compatible with --out'),
      `stderr should contain "--compact is not compatible with --out"; got:\n${stderr}`,
    );
  });
});

// ── AC4: --compact --since <cycle-id> → non-zero + stderr message ─────────────

describe('--compact flag: AC4 (conflict with --since)', () => {
  it('exits non-zero when --compact --since <cycle-id> is passed', () => {
    const { exitCode } = runCli(
      [FIXTURE_INIT_ID, '--compact', '--since', 'some-cycle-id'],
      fixtureDir,
    );
    assert.notEqual(exitCode, 0, 'CLI should exit non-zero for --compact --since');
  });

  it('stderr contains incompatibility message for --since', () => {
    const { stderr } = runCli(
      [FIXTURE_INIT_ID, '--compact', '--since', 'some-cycle-id'],
      fixtureDir,
    );
    assert.ok(
      stderr.includes('--compact is not compatible with --since'),
      `stderr should contain "--compact is not compatible with --since"; got:\n${stderr}`,
    );
  });
});

// ── AC5: --compact with no cycle.end event → '(unknown)' and '$0.00' ─────────

describe('--compact flag: AC5 (no cycle.end event → unknown verdict and zero cost)', () => {
  let noEndFixtureDir: string;
  const NO_END_INIT_ID = 'INIT-NO-END-TEST';
  const NO_END_CYCLE_NAME = `2026-05-01T00-00-00Z_${NO_END_INIT_ID}`;

  before(() => {
    noEndFixtureDir = mkdtempSync(join(tmpdir(), 'compact-no-end-test-'));

    const logsDir = join(noEndFixtureDir, '_logs');
    mkdirSync(logsDir);

    const cycleDir = join(logsDir, NO_END_CYCLE_NAME);
    mkdirSync(cycleDir);

    // events.jsonl with no cycle.end event and no cost_usd
    const events = [
      JSON.stringify({
        phase: 'developer',
        event: 'wi.started',
        timestamp: '2026-05-01T09:00:00Z',
        initiative_id: NO_END_INIT_ID,
      }),
      JSON.stringify({
        phase: 'developer',
        event: 'wi.committed',
        timestamp: '2026-05-01T09:30:00Z',
      }),
    ].join('\n') + '\n';

    writeFileSync(join(cycleDir, 'events.jsonl'), events);
  });

  after(() => {
    rmSync(noEndFixtureDir, { recursive: true, force: true });
  });

  it('exits 0 when --compact is passed and there is no cycle.end event', () => {
    const { exitCode, stderr } = runCli(
      [NO_END_INIT_ID, '--compact'],
      noEndFixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
  });

  it('stdout contains "Verdict: (unknown)" when no cycle.end event', () => {
    const { exitCode, stdout, stderr } = runCli(
      [NO_END_INIT_ID, '--compact'],
      noEndFixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('Verdict: (unknown)'),
      `stdout should contain "Verdict: (unknown)"; got:\n${stdout}`,
    );
  });

  it('stdout contains "Cost: $0.00" when no cost events', () => {
    const { exitCode, stdout, stderr } = runCli(
      [NO_END_INIT_ID, '--compact'],
      noEndFixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);
    assert.ok(
      stdout.includes('Cost: $0.00'),
      `stdout should contain "Cost: $0.00"; got:\n${stdout}`,
    );
  });
});

// ── AC6: no --compact with INIT-FIXTURE-1 → matches full golden file ──────────

describe('--compact flag: AC6 (no --compact preserves existing golden output)', () => {
  let fullFixtureDir: string;
  let cycleTarget: string;

  before(() => {
    // Create a full fixture dir that mirrors the layout expected by trail.test.ts:
    // <tmpDir>/_logs/cycle-INIT-FIXTURE-1/{events.jsonl,commits.json,brain/...}
    // <tmpDir>/.forge/_pr-metadata.json
    fullFixtureDir = mkdtempSync(join(tmpdir(), 'compact-full-fixture-'));
    cycleTarget = join(fullFixtureDir, '_logs', 'cycle-INIT-FIXTURE-1');
    copyDirRecursive(CYCLE_FIXTURE, cycleTarget);
    mkdirSync(join(fullFixtureDir, '.forge'), { recursive: true });
    copyFileSync(PR_METADATA_FIXTURE, join(fullFixtureDir, '.forge', '_pr-metadata.json'));
  });

  after(() => {
    rmSync(fullFixtureDir, { recursive: true, force: true });
  });

  it('stdout matches INIT-FIXTURE-1.trail.golden.md when --compact is NOT used', () => {
    const { exitCode, stdout, stderr } = runCli(
      [FIXTURE_INIT_ID],
      fullFixtureDir,
    );
    assert.equal(exitCode, 0, `CLI exited with ${exitCode}; stderr: ${stderr}`);

    // Normalise the absolute tmpdir prefix in theme paths to a stable placeholder
    const normalised = stdout.split(cycleTarget).join('{CYCLE_DIR}');

    const goldenPath = join(FIXTURES_DIR, `${FIXTURE_INIT_ID}.trail.golden.md`);
    const golden = readFileSync(goldenPath, 'utf8');
    assert.equal(
      normalised.trimEnd(),
      golden.trimEnd(),
      `stdout does not match full golden file.\nExpected (first 300 chars): ${JSON.stringify(golden.slice(0, 300))}\nGot (first 300 chars):      ${JSON.stringify(stdout.slice(0, 300))}`,
    );
  });
});
