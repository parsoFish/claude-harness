/**
 * Tests for verdict/outcome summary feature (WI-1).
 *
 * AC1: extractCycleMeta returns correct verdict and outcome when present.
 * AC2: extractCycleMeta defaults both to "(unknown)" when absent.
 * AC3: CLI stdout matches updated golden file byte-for-byte (path-normalised).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { extractCycleMeta, type EventRecord } from '../src/events.ts';

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

// ── AC1: extractCycleMeta returns verdict and outcome when present ─────────────

describe('extractCycleMeta', () => {
  it('AC1: returns verdict and outcome from cycle.end event metadata', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'cycle.start', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'developer', event: 'wi.committed', timestamp: '2026-01-01T01:00:00Z' },
      {
        phase: 'cycle.end',
        event: 'cycle.complete',
        timestamp: '2026-01-01T02:00:00Z',
        verdict: 'approve',
        outcome: 'merged',
      },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, 'approve');
    assert.strictEqual(meta.outcome, 'merged');
  });

  it('AC1: returns verdict and outcome when event is cycle.complete (not phase)', () => {
    const events: EventRecord[] = [
      {
        phase: 'some-phase',
        event: 'cycle.complete',
        timestamp: '2026-01-01T02:00:00Z',
        verdict: 'reject',
        outcome: 'abandoned',
      },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, 'reject');
    assert.strictEqual(meta.outcome, 'abandoned');
  });

  it('AC1: returns verdict and outcome when phase is cycle.end (fallback)', () => {
    const events: EventRecord[] = [
      {
        phase: 'cycle.end',
        event: 'some.event',
        timestamp: '2026-01-01T02:00:00Z',
        verdict: 'approve',
        outcome: 'merged',
      },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, 'approve');
    assert.strictEqual(meta.outcome, 'merged');
  });

  // ── AC2: extractCycleMeta defaults to "(unknown)" when absent ────────────────

  it('AC2: defaults verdict and outcome to "(unknown)" when no terminal event is present', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'cycle.start', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'developer', event: 'wi.committed', timestamp: '2026-01-01T01:00:00Z' },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, '(unknown)');
    assert.strictEqual(meta.outcome, '(unknown)');
  });

  it('AC2: defaults verdict to "(unknown)" when terminal event has no verdict field', () => {
    const events: EventRecord[] = [
      {
        phase: 'cycle.end',
        event: 'cycle.complete',
        timestamp: '2026-01-01T02:00:00Z',
        outcome: 'merged',
        // verdict is absent
      },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, '(unknown)');
    assert.strictEqual(meta.outcome, 'merged');
  });

  it('AC2: defaults outcome to "(unknown)" when terminal event has no outcome field', () => {
    const events: EventRecord[] = [
      {
        phase: 'cycle.end',
        event: 'cycle.complete',
        timestamp: '2026-01-01T02:00:00Z',
        verdict: 'approve',
        // outcome is absent
      },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, 'approve');
    assert.strictEqual(meta.outcome, '(unknown)');
  });

  it('AC2: defaults both to "(unknown)" when terminal event has no verdict or outcome fields', () => {
    const events: EventRecord[] = [
      {
        phase: 'cycle.end',
        event: 'cycle.complete',
        timestamp: '2026-01-01T02:00:00Z',
        // neither verdict nor outcome
      },
    ];

    const meta = extractCycleMeta(events);

    assert.strictEqual(meta.verdict, '(unknown)');
    assert.strictEqual(meta.outcome, '(unknown)');
  });

  it('AC2: defaults both to "(unknown)" when events array is empty', () => {
    const meta = extractCycleMeta([]);

    assert.strictEqual(meta.verdict, '(unknown)');
    assert.strictEqual(meta.outcome, '(unknown)');
  });
});

// ── AC3: CLI stdout matches golden file byte-for-byte ─────────────────────────

describe('CLI — verdict summary golden', () => {
  it('AC3: stdout matches INIT-FIXTURE-1.trail.golden.md (path-normalised)', () => {
    // Create a tempdir that mimics the expected layout:
    // <tmpdir>/_logs/cycle-INIT-FIXTURE-1/{events.jsonl,brain/...}
    const tmpBase = mkdtempSync(join(tmpdir(), 'verdict-test-'));
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
