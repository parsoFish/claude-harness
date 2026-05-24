/**
 * Integration test: PR metadata section end-to-end.
 *
 * Covers:
 *   AC1 — stdout contains '## PR' between '## Git activity' and '## Themes consulted'
 *   AC2 — stdout matches INIT-FIXTURE-1.trail.golden.md byte-for-byte (path-normalised)
 *   AC3 — when .forge/_pr-metadata.json is absent the '## PR' section is omitted and no error is emitted
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  readdirSync,
  rmSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const CYCLE_FIXTURE = join(FIXTURES_DIR, 'cycle-INIT-FIXTURE-1');
const GOLDEN_FILE = join(FIXTURES_DIR, 'INIT-FIXTURE-1.trail.golden.md');
const CLI_PATH = resolve(__dirname, '..', 'src', 'cli.ts');
const PR_METADATA_FIXTURE = join(CYCLE_FIXTURE, '.forge', '_pr-metadata.json');

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

/**
 * Sets up a temp dir with _logs/cycle-INIT-FIXTURE-1 and optionally
 * .forge/_pr-metadata.json at the root (so readPrMetadata(cwd) finds it).
 */
function setupTempDir(options: { withPrMetadata: boolean }): {
  tmpBase: string;
  cycleTarget: string;
} {
  const tmpBase = mkdtempSync(join(tmpdir(), 'pr-integration-test-'));
  const cycleTarget = join(tmpBase, '_logs', 'cycle-INIT-FIXTURE-1');
  copyDirRecursive(CYCLE_FIXTURE, cycleTarget);

  if (options.withPrMetadata) {
    // Place _pr-metadata.json at <tmpBase>/.forge/_pr-metadata.json
    // so readPrMetadata(cwd) resolves it (cwd = tmpBase when CLI is spawned).
    mkdirSync(join(tmpBase, '.forge'), { recursive: true });
    copyFileSync(PR_METADATA_FIXTURE, join(tmpBase, '.forge', '_pr-metadata.json'));
  }

  return { tmpBase, cycleTarget };
}

describe('PR integration — INIT-FIXTURE-1', () => {
  it('AC1: stdout contains ## PR between ## Git activity and ## Themes consulted', () => {
    const { tmpBase, cycleTarget } = setupTempDir({ withPrMetadata: true });

    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', CLI_PATH, 'INIT-FIXTURE-1'],
      { cwd: tmpBase, encoding: 'utf8' },
    );

    assert.strictEqual(result.status, 0, `CLI exited non-zero. stderr:\n${result.stderr}`);

    const stdout: string = result.stdout;
    const prIdx = stdout.indexOf('## PR');
    const gitIdx = stdout.indexOf('## Git activity');
    const themesIdx = stdout.indexOf('## Themes consulted');

    assert.ok(prIdx !== -1, 'stdout should contain ## PR');
    assert.ok(gitIdx !== -1, 'stdout should contain ## Git activity');
    assert.ok(themesIdx !== -1, 'stdout should contain ## Themes consulted');
    assert.ok(
      gitIdx < prIdx,
      `## Git activity (pos ${gitIdx}) should appear before ## PR (pos ${prIdx})`,
    );
    assert.ok(
      prIdx < themesIdx,
      `## PR (pos ${prIdx}) should appear before ## Themes consulted (pos ${themesIdx})`,
    );

    // cleanup
    rmSync(tmpBase, { recursive: true, force: true });
    void cycleTarget; // used above
  });

  it('AC2: stdout matches golden file byte-for-byte (path-normalised)', () => {
    const { tmpBase, cycleTarget } = setupTempDir({ withPrMetadata: true });

    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', CLI_PATH, 'INIT-FIXTURE-1'],
      { cwd: tmpBase, encoding: 'utf8' },
    );

    assert.strictEqual(result.status, 0, `CLI exited non-zero. stderr:\n${result.stderr}`);

    // Normalise the absolute tmpdir prefix in theme paths to a stable placeholder
    const actualRaw: string = result.stdout;
    const normalised = actualRaw.split(cycleTarget).join('{CYCLE_DIR}');

    const goldenRaw = readFileSync(GOLDEN_FILE, 'utf8');

    assert.strictEqual(
      normalised.trimEnd(),
      goldenRaw.trimEnd(),
      'CLI stdout does not match golden file',
    );

    // cleanup
    rmSync(tmpBase, { recursive: true, force: true });
  });

  it('AC3: ## PR section absent when .forge/_pr-metadata.json does not exist', () => {
    const { tmpBase, cycleTarget } = setupTempDir({ withPrMetadata: false });

    const result = spawnSync(
      process.execPath,
      ['--experimental-strip-types', CLI_PATH, 'INIT-FIXTURE-1'],
      { cwd: tmpBase, encoding: 'utf8' },
    );

    assert.strictEqual(result.status, 0, `CLI exited non-zero. stderr:\n${result.stderr}`);
    assert.strictEqual(result.stderr, '', `CLI emitted unexpected stderr:\n${result.stderr}`);
    assert.ok(
      !result.stdout.includes('## PR'),
      '## PR section should be absent when no _pr-metadata.json exists',
    );

    // cleanup
    rmSync(tmpBase, { recursive: true, force: true });
    void cycleTarget;
  });
});
