import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTailText } from '../src/tail.ts';
import { type EventRecord } from '../src/events.ts';

// ── helpers ───────────────────────────────────────────────────────────────────

function makeEvent(phase: string, event: string, extra?: Record<string, unknown>): EventRecord {
  return { phase, event, timestamp: '2026-01-01T00:00:00Z', ...extra };
}

// ── AC1: newline-joined lines, optional detail ────────────────────────────────

describe('formatTailText', () => {
  it('AC1: returns a newline-joined string for multiple events with and without detail', () => {
    const events: EventRecord[] = [
      makeEvent('architect', 'start'),
      makeEvent('developer-loop', 'wi.start', { work_item_id: 'FEAT-1-WI-1' }),
      makeEvent('orchestrator', 'cycle.complete'),
    ];

    const result = formatTailText(events);

    const lines = result.split('\n');
    assert.equal(lines.length, 3, 'should produce exactly 3 lines');
    assert.equal(lines[0], '[architect] start');
    assert.equal(lines[1], '[developer-loop] wi.start FEAT-1-WI-1');
    assert.equal(lines[2], '[orchestrator] cycle.complete');
  });

  // ── AC2: empty array returns empty string ────────────────────────────────────

  it('AC2: returns empty string for an empty array', () => {
    const result = formatTailText([]);
    assert.equal(result, '', 'empty array should produce empty string');
  });

  // ── AC3: no trailing space when no detail field ───────────────────────────────

  it('AC3: produces "[developer-loop] wi.start" with no trailing space when work_item_id is absent', () => {
    const event = makeEvent('developer-loop', 'wi.start');
    const result = formatTailText([event]);
    assert.equal(result, '[developer-loop] wi.start', 'should have no trailing space or extra tokens');
    assert.ok(!result.endsWith(' '), 'result must not end with a space');
  });

  // ── AC4: detail appended when work_item_id present ───────────────────────────

  it('AC4: appends work_item_id when present: "[developer-loop] wi.start FEAT-1-WI-1"', () => {
    const event = makeEvent('developer-loop', 'wi.start', { work_item_id: 'FEAT-1-WI-1' });
    const result = formatTailText([event]);
    assert.equal(result, '[developer-loop] wi.start FEAT-1-WI-1');
  });

  // ── edge cases ────────────────────────────────────────────────────────────────

  it('ignores non-string work_item_id (e.g. numeric) — no detail appended', () => {
    const event = makeEvent('some-phase', 'some.event', { work_item_id: 42 });
    const result = formatTailText([event]);
    assert.equal(result, '[some-phase] some.event');
  });

  it('handles a single event without any extra fields correctly', () => {
    const event = makeEvent('reflector', 'reflect.done');
    const result = formatTailText([event]);
    assert.equal(result, '[reflector] reflect.done');
  });
});
