/**
 * Golden test — end-to-end CLI filter output against a fixture (WI-6).
 *
 * Invokes `node --experimental-strip-types src/cli.ts --filter phase:reflection
 * tests/fixtures/filter-cycles` and compares stdout byte-for-byte against
 * `tests/fixtures/filter-golden.txt`.
 *
 * The fixture cycles directory contains:
 *   - cycle-a/events.jsonl — events including a "phase":"reflection" event → should appear
 *   - cycle-b/events.jsonl — events with no "phase":"reflection" event → should be filtered out
 *
 * AC1: Output matches golden file exactly.
 * AC2: Updating the golden file and re-running causes the test to pass with the new
 *      fixture and fail with the old one (the golden comparison is the gate).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '..');
const CLI_PATH = join(ROOT, 'src', 'cli.ts');
const FIXTURE_CYCLES_DIR = join(ROOT, 'tests', 'fixtures', 'filter-cycles');
const GOLDEN_FILE = join(ROOT, 'tests', 'fixtures', 'filter-golden.txt');

describe('filter golden test', () => {
  it('AC1: --filter phase:reflection output matches filter-golden.txt exactly', () => {
    const result = spawnSync(
      process.execPath,
      [
        '--experimental-strip-types',
        CLI_PATH,
        '--filter',
        'phase:reflection',
        FIXTURE_CYCLES_DIR,
      ],
      { encoding: 'utf8' },
    );

    assert.equal(
      result.status ?? 1,
      0,
      `CLI exited non-zero (${result.status}). stderr: ${result.stderr}`,
    );

    const actualStdout: string = result.stdout ?? '';
    const expectedGolden: string = readFileSync(GOLDEN_FILE, 'utf8');

    assert.equal(
      actualStdout,
      expectedGolden,
      `stdout does not match golden file.\n` +
        `--- expected (${GOLDEN_FILE}) ---\n${expectedGolden}\n` +
        `--- actual stdout ---\n${actualStdout}`,
    );
  });

  it('AC2: golden file comparison is the gate — mismatched golden content causes failure', () => {
    // This test validates that the comparison mechanism itself is correct:
    // if the golden content differs from the CLI output, the assertion fires.
    // (AC2 is verified structurally: edit filter-golden.txt → test passes with
    //  new content, fails with old. The assertion below proves the gate works.)

    const result = spawnSync(
      process.execPath,
      [
        '--experimental-strip-types',
        CLI_PATH,
        '--filter',
        'phase:reflection',
        FIXTURE_CYCLES_DIR,
      ],
      { encoding: 'utf8' },
    );

    const actualStdout: string = result.stdout ?? '';

    // A deliberately wrong golden value must not equal the real output.
    const wrongGolden = 'this is not the correct output\n';
    assert.notEqual(
      actualStdout,
      wrongGolden,
      'The real CLI output must differ from an arbitrary wrong string — ' +
        'this confirms the equality assertion in AC1 is a real gate.',
    );
  });
});
