/**
 * tests/filter-renderer.test.ts
 *
 * Tests for filterCycles() from src/filter-renderer.ts.
 * Quality gate: node --test --experimental-strip-types tests/filter-renderer.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterCycles } from '../src/filter-renderer.ts';
import type { CycleEvents } from '../src/filter-renderer.ts';
import type { EventRecord } from '../src/events.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(phase: string, extra?: Record<string, unknown>): EventRecord {
  return {
    phase,
    event: 'test.event',
    timestamp: '2024-01-01T00:00:00Z',
    ...extra,
  };
}

function makeCycle(name: string, events: EventRecord[]): CycleEvents {
  return { name, events };
}

// ---------------------------------------------------------------------------
// AC1: Single phase filter — only matching cycles returned
// ---------------------------------------------------------------------------

describe('filterCycles — AC1: single phase filter', () => {
  it('returns only cycles that have a reflection event when filtered by phase:reflection', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('planner'), makeEvent('reflection')]),
      makeCycle('cycle-b', [makeEvent('planner'), makeEvent('developer')]),
      makeCycle('cycle-c', [makeEvent('reflection'), makeEvent('developer')]),
    ];
    const result = filterCycles(cycles, [{ key: 'phase', value: 'reflection' }]);
    assert.deepEqual(
      result.map((c) => c.name),
      ['cycle-a', 'cycle-c'],
    );
  });

  it('returns an empty array when no cycle has the target phase', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('planner')]),
      makeCycle('cycle-b', [makeEvent('developer')]),
    ];
    const result = filterCycles(cycles, [{ key: 'phase', value: 'reflection' }]);
    assert.deepEqual(result, []);
  });

  it('returns all cycles when every cycle matches the phase filter', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('reflection')]),
      makeCycle('cycle-b', [makeEvent('reflection'), makeEvent('developer')]),
    ];
    const result = filterCycles(cycles, [{ key: 'phase', value: 'reflection' }]);
    assert.deepEqual(
      result.map((c) => c.name),
      ['cycle-a', 'cycle-b'],
    );
  });

  it('preserves the original cycle objects (not copies)', () => {
    const cycle = makeCycle('cycle-a', [makeEvent('reflection')]);
    const result = filterCycles([cycle], [{ key: 'phase', value: 'reflection' }]);
    assert.strictEqual(result[0], cycle);
  });
});

// ---------------------------------------------------------------------------
// AC2: Empty filters array — all cycles returned unchanged
// ---------------------------------------------------------------------------

describe('filterCycles — AC2: empty filters array', () => {
  it('returns all cycles unchanged when filters is empty', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('planner')]),
      makeCycle('cycle-b', [makeEvent('reflection')]),
      makeCycle('cycle-c', [makeEvent('developer')]),
    ];
    const result = filterCycles(cycles, []);
    assert.strictEqual(result, cycles); // same reference — no copy
  });

  it('returns an empty array unchanged when the input list is also empty', () => {
    const result = filterCycles([], []);
    assert.deepEqual(result, []);
  });
});

// ---------------------------------------------------------------------------
// AC3: Multiple filters — AND semantics
// ---------------------------------------------------------------------------

describe('filterCycles — AC3: AND semantics for multiple filters', () => {
  it('returns only cycles satisfying BOTH a phase filter and a status filter', () => {
    const cycles: CycleEvents[] = [
      // satisfies phase:reflection but NOT status:done
      makeCycle('cycle-a', [makeEvent('reflection'), makeEvent('developer')]),
      // satisfies status:done but NOT phase:reflection
      makeCycle('cycle-b', [makeEvent('planner', { status: 'done' })]),
      // satisfies BOTH
      makeCycle('cycle-c', [
        makeEvent('reflection'),
        makeEvent('planner', { status: 'done' }),
      ]),
      // satisfies neither
      makeCycle('cycle-d', [makeEvent('planner')]),
    ];

    const result = filterCycles(cycles, [
      { key: 'phase', value: 'reflection' },
      { key: 'status', value: 'done' },
    ]);

    assert.deepEqual(
      result.map((c) => c.name),
      ['cycle-c'],
    );
  });

  it('returns all cycles when all satisfy every filter', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('reflection', { status: 'done' })]),
      makeCycle('cycle-b', [makeEvent('reflection'), makeEvent('planner', { status: 'done' })]),
    ];
    const result = filterCycles(cycles, [
      { key: 'phase', value: 'reflection' },
      { key: 'status', value: 'done' },
    ]);
    assert.deepEqual(
      result.map((c) => c.name),
      ['cycle-a', 'cycle-b'],
    );
  });

  it('returns empty array when no cycle satisfies all filters', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('reflection')]),
      makeCycle('cycle-b', [makeEvent('planner', { status: 'done' })]),
    ];
    const result = filterCycles(cycles, [
      { key: 'phase', value: 'reflection' },
      { key: 'status', value: 'done' },
    ]);
    assert.deepEqual(result, []);
  });

  it('treats unknown filter keys as pass-through (does not exclude cycles)', () => {
    const cycles: CycleEvents[] = [
      makeCycle('cycle-a', [makeEvent('reflection')]),
      makeCycle('cycle-b', [makeEvent('developer')]),
    ];
    // 'unknown-key' is not dispatched — should be treated as always-passing
    const result = filterCycles(cycles, [
      { key: 'phase', value: 'reflection' },
      { key: 'unknown-key', value: 'anything' },
    ]);
    assert.deepEqual(
      result.map((c) => c.name),
      ['cycle-a'],
    );
  });
});
