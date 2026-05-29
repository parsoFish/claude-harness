/**
 * Integration test: runs src/cli.ts INIT-FIXTURE-1 against a frozen fixture
 * and asserts stdout matches the golden file byte-for-byte (newline-tolerant).
 *
 * The brain theme path in the output is an absolute tmpdir path; the test
 * normalises it to `{FIXTURE_DIR}` before comparing so the golden is stable.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const CYCLE_FIXTURE = join(FIXTURES_DIR, 'cycle-INIT-FIXTURE-1');
const GOLDEN_FILE = join(FIXTURES_DIR, 'INIT-FIXTURE-1.trail.golden.md');
const CLI_PATH = resolve(__dirname, '..', 'src', 'cli.ts');
// Tracked fixture (not under the gitignored .forge/ dir) so the test
// survives a fresh worktree checkout.
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

describe('trail integration — INIT-FIXTURE-1', () => {
  it('AC15+AC16: stdout matches golden file (path-normalised)', () => {
    // Create a tempdir that mimics the expected layout:
    // <tmpdir>/_logs/cycle-INIT-FIXTURE-1/{events.jsonl,brain/...}
    const tmpBase = mkdtempSync(join(tmpdir(), 'trail-test-'));
    const cycleTarget = join(tmpBase, '_logs', 'cycle-INIT-FIXTURE-1');
    copyDirRecursive(CYCLE_FIXTURE, cycleTarget);

    // Place _pr-metadata.json at <tmpBase>/.forge/_pr-metadata.json so that
    // readPrMetadata(cwd) finds it (cwd = tmpBase when the CLI is spawned).
    mkdirSync(join(tmpBase, '.forge'), { recursive: true });
    copyFileSync(PR_METADATA_FIXTURE, join(tmpBase, '.forge', '_pr-metadata.json'));

    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', CLI_PATH, 'INIT-FIXTURE-1'],
      { cwd: tmpBase, encoding: 'utf8' },
    );

    assert.strictEqual(result.status, 0, `CLI exited non-zero. stderr:\n${result.stderr}`);

    // Normalise the absolute tmpdir prefix in theme paths to a stable placeholder
    const actualRaw: string = result.stdout;
    const normalised = actualRaw.split(cycleTarget).join('{CYCLE_DIR}');

    // Read and normalise the golden file similarly (it uses the same placeholder)
    const goldenRaw = readFileSync(GOLDEN_FILE, 'utf8');

    assert.strictEqual(
      normalised.trimEnd(),
      goldenRaw.trimEnd(),
      'CLI stdout does not match golden file',
    );
  });
});
