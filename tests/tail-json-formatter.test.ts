import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTailJson } from '../src/tail.ts';
import { type EventRecord } from '../src/events.ts';

// ── helpers ───────────────────────────────────────────────────────────────────

function makeEvent(phase: string, event: string, extra?: Record<string, unknown>): EventRecord {
  return { phase, event, timestamp: '2026-01-01T00:00:00Z', ...extra };
}

// ── AC1: returns a valid JSON string that parses to the same event objects ────

describe('formatTailJson', () => {
  it('AC1: returns a valid JSON string that parses to an array of the same event objects', () => {
    const events: EventRecord[] = [
      makeEvent('architect', 'start'),
      makeEvent('developer-loop', 'wi.start', { work_item_id: 'WI-1' }),
    ];

    const result = formatTailJson(events);

    // Must be a valid JSON string
    let parsed: unknown;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(result);
    }, 'result must be valid JSON');

    // Must parse to an array
    assert.ok(Array.isArray(parsed), 'parsed result must be an array');

    // Each element must deep-equal the original event object
    const arr = parsed as EventRecord[];
    assert.equal(arr.length, events.length, 'parsed array must have same length as input');
    assert.deepEqual(arr[0], events[0], 'first element must match first event');
    assert.deepEqual(arr[1], events[1], 'second element must match second event');
  });

  // ── AC2: empty array returns '[]' ─────────────────────────────────────────

  it('AC2: returns the string "[]" for an empty array', () => {
    const result = formatTailJson([]);
    assert.equal(result, '[]', 'empty array must return the string "[]"');
  });

  // ── AC3: insertion order preserved; index 0 matches first event exactly ───

  it('AC3: parsed array has length 2 and index 0 matches the first event object exactly', () => {
    const first = makeEvent('orchestrator', 'cycle.start', { run_id: 'run-42' });
    const second = makeEvent('developer-loop', 'wi.complete', { work_item_id: 'WI-3' });
    const events: EventRecord[] = [first, second];

    const result = formatTailJson(events);
    const parsed = JSON.parse(result) as EventRecord[];

    assert.equal(parsed.length, 2, 'parsed array must have exactly 2 elements');
    assert.deepEqual(parsed[0], first, 'index 0 must match the first event object exactly');
    assert.deepEqual(parsed[1], second, 'index 1 must match the second event object exactly');
  });
});
