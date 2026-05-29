import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readTailEvents } from '../src/tail.ts';
import { type EventRecord } from '../src/events.ts';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeEvent(i: number): EventRecord {
  return {
    phase: `phase-${i}`,
    event: `event-${i}`,
    timestamp: `2026-01-01T${String(i).padStart(2, '0')}:00:00Z`,
  };
}

function makeTmpJsonl(events: EventRecord[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'tail-test-'));
  const filePath = join(dir, 'events.jsonl');
  const content = events.map((e) => JSON.stringify(e)).join('\n');
  writeFileSync(filePath, content, 'utf8');
  return filePath;
}

// ── AC1: returns exactly the last N events in chronological order ─────────────

describe('readTailEvents', () => {
  it('AC1: returns exactly the last 10 of 15 events in chronological order (oldest first)', () => {
    const allEvents = Array.from({ length: 15 }, (_, i) => makeEvent(i));
    const filePath = makeTmpJsonl(allEvents);

    const result = readTailEvents(filePath, 10);

    assert.equal(result.length, 10, 'should return exactly 10 events');
    // The tail is events 5..14 (last 10), in chronological order
    for (let i = 0; i < 10; i++) {
      const expected = allEvents[5 + i];
      assert.equal(result[i].phase, expected.phase, `event at index ${i} should match phase`);
      assert.equal(result[i].event, expected.event, `event at index ${i} should match event`);
      assert.equal(result[i].timestamp, expected.timestamp, `event at index ${i} should match timestamp`);
    }
    // Verify oldest-first order: timestamps should be ascending
    for (let i = 1; i < result.length; i++) {
      assert.ok(
        result[i].timestamp >= result[i - 1].timestamp,
        `events should be in chronological order at index ${i}`,
      );
    }
  });

  // ── AC2: N larger than file — returns all events ────────────────────────────

  it('AC2: returns all 5 events when N=10 is larger than the file count', () => {
    const allEvents = Array.from({ length: 5 }, (_, i) => makeEvent(i));
    const filePath = makeTmpJsonl(allEvents);

    const result = readTailEvents(filePath, 10);

    assert.equal(result.length, 5, 'should return all 5 events without error or padding');
    for (let i = 0; i < 5; i++) {
      assert.equal(result[i].phase, allEvents[i].phase);
      assert.equal(result[i].event, allEvents[i].event);
    }
  });

  // ── AC3: empty file (0 non-blank lines) returns [] ──────────────────────────

  it('AC3: returns empty array for a file with 0 non-blank lines', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tail-test-'));
    const filePath = join(dir, 'empty.jsonl');
    // Write a file that has only blank lines
    writeFileSync(filePath, '\n\n\n', 'utf8');

    const result = readTailEvents(filePath, 10);

    assert.deepEqual(result, [], 'should return empty array for blank-only file');
  });

  it('AC3: returns empty array for a completely empty file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tail-test-'));
    const filePath = join(dir, 'empty.jsonl');
    writeFileSync(filePath, '', 'utf8');

    const result = readTailEvents(filePath, 10);

    assert.deepEqual(result, [], 'should return empty array for empty file');
  });

  // ── AC4: non-existent path throws Error containing the path ─────────────────

  it('AC4: throws an Error whose message contains the path for a non-existent file', () => {
    const nonExistent = '/tmp/this-file-does-not-exist-xyzzy-tail-99999.jsonl';

    assert.throws(
      () => readTailEvents(nonExistent, 10),
      (err: unknown) => {
        assert.ok(err instanceof Error, 'should throw an Error instance');
        assert.ok(
          err.message.includes(nonExistent),
          `Expected error message to contain "${nonExistent}" but got: ${err.message}`,
        );
        return true;
      },
    );
  });

  // ── edge cases ───────────────────────────────────────────────────────────────

  it('skips blank lines interspersed among events and still returns correct tail', () => {
    const events = Array.from({ length: 5 }, (_, i) => makeEvent(i));
    const dir = mkdtempSync(join(tmpdir(), 'tail-test-'));
    const filePath = join(dir, 'events.jsonl');
    // Intersperse blank lines
    const content = events.map((e) => JSON.stringify(e)).join('\n\n');
    writeFileSync(filePath, content, 'utf8');

    const result = readTailEvents(filePath, 3);

    assert.equal(result.length, 3);
    // Last 3 events are events[2], events[3], events[4]
    assert.equal(result[0].phase, events[2].phase);
    assert.equal(result[1].phase, events[3].phase);
    assert.equal(result[2].phase, events[4].phase);
  });

  it('returns correct events when N equals the total count exactly', () => {
    const events = Array.from({ length: 7 }, (_, i) => makeEvent(i));
    const filePath = makeTmpJsonl(events);

    const result = readTailEvents(filePath, 7);

    assert.equal(result.length, 7);
    for (let i = 0; i < 7; i++) {
      assert.equal(result[i].phase, events[i].phase);
    }
  });
});
