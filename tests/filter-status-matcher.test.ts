/**
 * tests/filter-status-matcher.test.ts
 *
 * Tests for matchStatus() from src/filter-status.ts.
 * Quality gate: node --test --experimental-strip-types tests/filter-status-matcher.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchStatus } from '../src/filter-status.ts';
import type { EventRecord } from '../src/events.ts';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(overrides?: Record<string, unknown>): EventRecord {
  return {
    phase: 'developer',
    event: 'test.event',
    timestamp: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// AC1: At least one event with status 'done' → returns true
// ---------------------------------------------------------------------------

describe('matchStatus — AC1: status done present', () => {
  it('returns true when exactly one event has status done', () => {
    const events: EventRecord[] = [makeEvent({ status: 'done' })];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), true);
  });

  it('returns true when multiple events exist and one has status done', () => {
    const events: EventRecord[] = [
      makeEvent({ status: 'running' }),
      makeEvent({ status: 'done' }),
      makeEvent({ status: 'failed' }),
    ];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), true);
  });

  it('returns true when the terminal event carries status done as a top-level field', () => {
    const events: EventRecord[] = [
      makeEvent({ event: 'cycle.start' }),
      makeEvent({ event: 'cycle.complete', status: 'done' }),
    ];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), true);
  });

  it('returns true when multiple events have status done', () => {
    const events: EventRecord[] = [
      makeEvent({ status: 'done' }),
      makeEvent({ status: 'done' }),
    ];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), true);
  });
});

// ---------------------------------------------------------------------------
// AC2: No event with status 'done' → returns false
// ---------------------------------------------------------------------------

describe('matchStatus — AC2: status done absent', () => {
  it('returns false when no event has status done', () => {
    const events: EventRecord[] = [
      makeEvent({ status: 'running' }),
      makeEvent({ status: 'failed' }),
    ];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), false);
  });

  it('returns false when events have no status field at all', () => {
    const events: EventRecord[] = [
      makeEvent(),
      makeEvent({ phase: 'reflection' }),
    ];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), false);
  });

  it('is case-sensitive — Done does not match done', () => {
    const events: EventRecord[] = [makeEvent({ status: 'Done' })];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), false);
  });

  it('returns false for a partial match — "done" does not match "done-with-errors"', () => {
    const events: EventRecord[] = [makeEvent({ status: 'done-with-errors' })];
    assert.equal(matchStatus({ key: 'status', value: 'done' }, events), false);
  });
});

// ---------------------------------------------------------------------------
// AC3: Empty events array → returns false
// ---------------------------------------------------------------------------

describe('matchStatus — AC3: empty events array', () => {
  it('returns false for an empty events array', () => {
    assert.equal(matchStatus({ key: 'status', value: 'done' }, []), false);
  });

  it('returns false for any filter value when events is empty', () => {
    assert.equal(matchStatus({ key: 'status', value: 'done' }, []), false);
    assert.equal(matchStatus({ key: 'status', value: 'failed' }, []), false);
    assert.equal(matchStatus({ key: 'status', value: '' }, []), false);
  });
});
