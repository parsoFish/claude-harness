import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { probeCore } from '../src/probe.ts';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTmpJsonl(lines: object[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'probe-core-test-'));
  const filePath = join(dir, 'events.jsonl');
  const content = lines.map((l) => JSON.stringify(l)).join('\n');
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ── AC1: multiple phases → correct counts and dominant phase ─────────────────

describe('probeCore — AC1: multi-phase events file', () => {
  it('returns totalEvents, phaseCount, dominantPhase, and dominantCount', () => {
    const filePath = makeTmpJsonl([
      { phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'architect', event: 'end', timestamp: '2026-01-01T00:30:00Z' },
      { phase: 'architect', event: 'review', timestamp: '2026-01-01T00:45:00Z' },
      { phase: 'developer-loop', event: 'start', timestamp: '2026-01-01T01:00:00Z' },
      { phase: 'developer-loop', event: 'end', timestamp: '2026-01-01T02:00:00Z' },
      { phase: 'reflector', event: 'start', timestamp: '2026-01-01T03:00:00Z' },
    ]);

    const result = probeCore(filePath);

    assert.equal(result.totalEvents, 6);
    assert.equal(result.phaseCount, 3);
    assert.equal(result.dominantPhase, 'architect');
    assert.equal(result.dominantCount, 3);
  });

  it('picks the phase with the most events as dominant', () => {
    const filePath = makeTmpJsonl([
      { phase: 'planner', event: 'a', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'developer-loop', event: 'a', timestamp: '2026-01-01T01:00:00Z' },
      { phase: 'developer-loop', event: 'b', timestamp: '2026-01-01T01:01:00Z' },
      { phase: 'developer-loop', event: 'c', timestamp: '2026-01-01T01:02:00Z' },
      { phase: 'developer-loop', event: 'd', timestamp: '2026-01-01T01:03:00Z' },
      { phase: 'reflector', event: 'a', timestamp: '2026-01-01T02:00:00Z' },
      { phase: 'reflector', event: 'b', timestamp: '2026-01-01T02:01:00Z' },
    ]);

    const result = probeCore(filePath);

    assert.equal(result.totalEvents, 7);
    assert.equal(result.phaseCount, 3);
    assert.equal(result.dominantPhase, 'developer-loop');
    assert.equal(result.dominantCount, 4);
  });

  it('extracts initiativeId from the first event that carries it', () => {
    const filePath = makeTmpJsonl([
      { phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z', initiative_id: 'INIT-abc' },
      { phase: 'developer-loop', event: 'start', timestamp: '2026-01-01T01:00:00Z', initiative_id: 'INIT-xyz' },
    ]);

    const result = probeCore(filePath);

    assert.equal(result.initiativeId, 'INIT-abc');
  });

  it('returns empty initiativeId when no event carries the field', () => {
    const filePath = makeTmpJsonl([
      { phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' },
    ]);

    const result = probeCore(filePath);

    assert.equal(result.initiativeId, '');
  });
});

// ── AC2: tied phase counts → returns one without throwing ────────────────────

describe('probeCore — AC2: tied phase event counts', () => {
  it('returns one of the tied phases as dominantPhase without throwing', () => {
    const filePath = makeTmpJsonl([
      { phase: 'alpha', event: 'a', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'alpha', event: 'b', timestamp: '2026-01-01T00:01:00Z' },
      { phase: 'beta', event: 'a', timestamp: '2026-01-01T01:00:00Z' },
      { phase: 'beta', event: 'b', timestamp: '2026-01-01T01:01:00Z' },
    ]);

    let result: ReturnType<typeof probeCore>;
    assert.doesNotThrow(() => {
      result = probeCore(filePath);
    });

    // dominantPhase must be one of the tied phases
    assert.ok(
      result!.dominantPhase === 'alpha' || result!.dominantPhase === 'beta',
      `Expected dominantPhase to be 'alpha' or 'beta', got '${result!.dominantPhase}'`,
    );
    assert.equal(result!.dominantCount, 2);
    assert.equal(result!.totalEvents, 4);
    assert.equal(result!.phaseCount, 2);
  });

  it('handles three-way tie without throwing', () => {
    const filePath = makeTmpJsonl([
      { phase: 'x', event: 'a', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'y', event: 'a', timestamp: '2026-01-01T01:00:00Z' },
      { phase: 'z', event: 'a', timestamp: '2026-01-01T02:00:00Z' },
    ]);

    let result: ReturnType<typeof probeCore>;
    assert.doesNotThrow(() => {
      result = probeCore(filePath);
    });

    assert.ok(
      ['x', 'y', 'z'].includes(result!.dominantPhase),
      `Expected dominantPhase to be one of x/y/z, got '${result!.dominantPhase}'`,
    );
    assert.equal(result!.dominantCount, 1);
    assert.equal(result!.phaseCount, 3);
  });
});

// ── AC3: empty events.jsonl → zero sentinel values ───────────────────────────

describe('probeCore — AC3: empty events.jsonl', () => {
  it('returns totalEvents=0, phaseCount=0, and empty/null dominantPhase', () => {
    const dir = mkdtempSync(join(tmpdir(), 'probe-core-empty-'));
    const filePath = join(dir, 'events.jsonl');
    writeFileSync(filePath, '', 'utf8');

    const result = probeCore(filePath);

    assert.equal(result.totalEvents, 0);
    assert.equal(result.phaseCount, 0);

    // dominantPhase must be '' (empty string) or null
    assert.ok(
      result.dominantPhase === '' || result.dominantPhase === null,
      `Expected dominantPhase to be '' or null, got '${result.dominantPhase}'`,
    );

    assert.equal(result.dominantCount, 0);
  });

  it('returns totalEvents=0 for a file with only blank lines', () => {
    const dir = mkdtempSync(join(tmpdir(), 'probe-core-blanks-'));
    const filePath = join(dir, 'events.jsonl');
    writeFileSync(filePath, '\n\n\n', 'utf8');

    const result = probeCore(filePath);

    assert.equal(result.totalEvents, 0);
    assert.equal(result.phaseCount, 0);
  });
});
