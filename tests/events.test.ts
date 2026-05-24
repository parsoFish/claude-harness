import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readEvents, rollupByPhase, type EventRecord } from '../src/events.ts';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeTmpFile(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'events-test-'));
  const filePath = join(dir, 'events.jsonl');
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ── AC1: readEvents returns array of EventRecord objects ─────────────────────

describe('readEvents', () => {
  it('AC1: returns parsed event objects with phase, event, and timestamp fields', () => {
    const lines = [
      JSON.stringify({ phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' }),
      JSON.stringify({ phase: 'project-manager', event: 'end', timestamp: '2026-01-01T01:00:00Z' }),
    ].join('\n');
    const filePath = makeTmpFile(lines);

    const events = readEvents(filePath);

    assert.equal(events.length, 2);
    assert.equal(events[0].phase, 'architect');
    assert.equal(events[0].event, 'start');
    assert.equal(events[0].timestamp, '2026-01-01T00:00:00Z');
    assert.equal(events[1].phase, 'project-manager');
    assert.equal(events[1].event, 'end');
    assert.equal(events[1].timestamp, '2026-01-01T01:00:00Z');
  });

  it('AC1: skips blank lines in the JSONL file', () => {
    const lines = [
      JSON.stringify({ phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' }),
      '',
      JSON.stringify({ phase: 'architect', event: 'end', timestamp: '2026-01-01T00:30:00Z' }),
      '',
    ].join('\n');
    const filePath = makeTmpFile(lines);

    const events = readEvents(filePath);

    assert.equal(events.length, 2);
  });

  it('AC1: returns empty array for file with only blank lines', () => {
    const filePath = makeTmpFile('\n\n');
    const events = readEvents(filePath);
    assert.deepEqual(events, []);
  });

  // AC3: throws on non-existent file
  it('AC3: throws an error containing the file path for a non-existent file', () => {
    const nonExistent = '/tmp/this-file-does-not-exist-xyzzy-12345.jsonl';
    assert.throws(
      () => readEvents(nonExistent),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.ok(
          err.message.includes(nonExistent),
          `Expected error message to contain "${nonExistent}" but got: ${err.message}`,
        );
        return true;
      },
    );
  });
});

// ── AC2: rollupByPhase groups events by phase ─────────────────────────────────

describe('rollupByPhase', () => {
  it('AC2: returns a Map keyed by phase with ordered event arrays', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'project-manager', event: 'start', timestamp: '2026-01-01T01:00:00Z' },
      { phase: 'architect', event: 'end', timestamp: '2026-01-01T00:30:00Z' },
      { phase: 'project-manager', event: 'end', timestamp: '2026-01-01T01:30:00Z' },
    ];

    const byPhase = rollupByPhase(events);

    assert.ok(byPhase instanceof Map);
    assert.equal(byPhase.size, 2);
    assert.ok(byPhase.has('architect'));
    assert.ok(byPhase.has('project-manager'));

    const architectEvents = byPhase.get('architect')!;
    assert.equal(architectEvents.length, 2);
    assert.equal(architectEvents[0].event, 'start');
    assert.equal(architectEvents[1].event, 'end');

    const pmEvents = byPhase.get('project-manager')!;
    assert.equal(pmEvents.length, 2);
    assert.equal(pmEvents[0].event, 'start');
    assert.equal(pmEvents[1].event, 'end');
  });

  it('AC2: returns empty Map for empty events array', () => {
    const byPhase = rollupByPhase([]);
    assert.ok(byPhase instanceof Map);
    assert.equal(byPhase.size, 0);
  });

  it('AC2: preserves insertion order within each phase', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'first', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'architect', event: 'second', timestamp: '2026-01-01T00:01:00Z' },
      { phase: 'architect', event: 'third', timestamp: '2026-01-01T00:02:00Z' },
    ];

    const byPhase = rollupByPhase(events);
    const architectEvents = byPhase.get('architect')!;

    assert.equal(architectEvents[0].event, 'first');
    assert.equal(architectEvents[1].event, 'second');
    assert.equal(architectEvents[2].event, 'third');
  });
});
