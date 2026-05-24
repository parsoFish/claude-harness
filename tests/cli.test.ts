/**
 * Tests for src/trail.ts (AC1, AC2) and src/cli.ts (AC3, AC4).
 *
 * Renderer tests are pure unit tests — no disk I/O.
 * CLI tests spawn `node --experimental-strip-types src/cli.ts` as a subprocess.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { renderPhasesSection, renderSummarySection } from '../src/trail.ts';
import type { EventRecord } from '../src/events.ts';

// ── AC1: renderPhasesSection ──────────────────────────────────────────────────

describe('renderPhasesSection', () => {
  it('AC1: contains ## Phases heading and per-phase sub-headings with events', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'architect', event: 'end', timestamp: '2026-01-01T00:30:00Z' },
      { phase: 'architect', event: 'reflect', timestamp: '2026-01-01T00:45:00Z' },
      { phase: 'developer', event: 'start', timestamp: '2026-01-01T01:00:00Z' },
      { phase: 'developer', event: 'commit', timestamp: '2026-01-01T01:30:00Z' },
      { phase: 'developer', event: 'end', timestamp: '2026-01-01T02:00:00Z' },
    ];
    const phaseMap = new Map<string, EventRecord[]>();
    phaseMap.set('architect', events.slice(0, 3));
    phaseMap.set('developer', events.slice(3, 6));

    const result = renderPhasesSection(phaseMap);

    // Must contain the top-level heading
    assert.ok(result.includes('## Phases'), 'should contain "## Phases"');

    // Must contain one sub-heading per phase
    assert.ok(result.includes('### architect'), 'should contain "### architect"');
    assert.ok(result.includes('### developer'), 'should contain "### developer"');

    // Must list all events under each phase
    assert.ok(result.includes('start'), 'architect events: start');
    assert.ok(result.includes('end'), 'architect events: end');
    assert.ok(result.includes('reflect'), 'architect events: reflect');
    assert.ok(result.includes('commit'), 'developer events: commit');

    // Sub-headings appear before events (architect section before developer section)
    const architectPos = result.indexOf('### architect');
    const developerPos = result.indexOf('### developer');
    assert.ok(architectPos < developerPos, 'architect section before developer section');
  });
});

// ── AC2: renderSummarySection ─────────────────────────────────────────────────

describe('renderSummarySection', () => {
  it('AC2: contains ## Summary heading and mentions initiative id, verdict, and cost', () => {
    const result = renderSummarySection('INIT-2026-TEST', 'complete', 1.23);

    assert.ok(result.includes('## Summary'), 'should contain "## Summary"');
    assert.ok(result.includes('INIT-2026-TEST'), 'should mention the initiative id');
    assert.ok(result.includes('complete'), 'should mention the verdict');
    // Cost must be formatted (e.g. "$1.23")
    assert.ok(result.includes('1.23'), 'should mention the formatted cost');
  });

  it('AC2: formats zero cost correctly', () => {
    const result = renderSummarySection('INIT-ZERO', 'failed', 0);
    assert.ok(result.includes('## Summary'), 'should contain "## Summary"');
    assert.ok(result.includes('INIT-ZERO'));
    assert.ok(result.includes('failed'));
    assert.ok(result.includes('0.00') || result.includes('0'), 'should mention the cost');
  });
});

// ── AC3 & AC4: CLI subprocess tests ──────────────────────────────────────────

/**
 * Helper: run the CLI via node --experimental-strip-types and return the result.
 */
function runCli(args: string[], cwd?: string): { exitCode: number; stdout: string; stderr: string } {
  const cliPath = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '../src/cli.ts');
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', cliPath, ...args],
    {
      encoding: 'utf8',
      cwd: cwd ?? process.cwd(),
    },
  );
  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

describe('CLI entry point', () => {
  it('AC4: exits non-zero and prints usage when no argument is passed', () => {
    const { exitCode, stderr } = runCli([]);
    assert.notEqual(exitCode, 0, 'should exit with non-zero code');
    assert.ok(stderr.length > 0, 'should print to stderr');
    // Usage instructions should be present
    assert.ok(
      stderr.toLowerCase().includes('usage'),
      `expected "usage" in stderr, got: ${stderr}`,
    );
  });

  it('AC3: exits non-zero and prints error when _logs dir does not exist', () => {
    // Use a fresh temp dir that has no _logs subdirectory
    const tmpCwd = mkdtempSync(join(tmpdir(), 'cli-test-'));
    try {
      const { exitCode, stderr } = runCli(['INIT-FIXTURE-1'], tmpCwd);
      assert.notEqual(exitCode, 0, 'should exit with non-zero code');
      assert.ok(stderr.length > 0, 'should print an error to stderr');
    } finally {
      rmSync(tmpCwd, { recursive: true, force: true });
    }
  });
});
