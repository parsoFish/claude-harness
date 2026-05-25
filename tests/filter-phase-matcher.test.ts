/**
 * tests/filter-phase-matcher.test.ts
 *
 * Tests for matchPhase() from src/filter-phase.ts.
 * Quality gate: node --test --experimental-strip-types tests/filter-phase-matcher.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { matchPhase } from '../src/filter-phase.ts';
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

// ---------------------------------------------------------------------------
// AC1: At least one event with matching phase → returns true
// ---------------------------------------------------------------------------

describe('matchPhase — AC1: matching phase present', () => {
  it('returns true when exactly one event has the target phase', () => {
    const events: EventRecord[] = [makeEvent('reflection')];
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, events), true);
  });

  it('returns true when multiple events exist and one has the target phase', () => {
    const events: EventRecord[] = [
      makeEvent('planner'),
      makeEvent('reflection'),
      makeEvent('developer'),
    ];
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, events), true);
  });

  it('returns true when multiple events have the target phase', () => {
    const events: EventRecord[] = [
      makeEvent('reflection'),
      makeEvent('reflection'),
    ];
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, events), true);
  });
});

// ---------------------------------------------------------------------------
// AC2: No event with matching phase → returns false
// ---------------------------------------------------------------------------

describe('matchPhase — AC2: matching phase absent', () => {
  it('returns false when no event has the target phase', () => {
    const events: EventRecord[] = [
      makeEvent('planner'),
      makeEvent('developer'),
    ];
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, events), false);
  });

  it('does not match on a different phase name', () => {
    const events: EventRecord[] = [makeEvent('reflections')]; // note the plural
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, events), false);
  });

  it('is case-sensitive — uppercase does not match lowercase filter', () => {
    const events: EventRecord[] = [makeEvent('Reflection')];
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, events), false);
  });
});

// ---------------------------------------------------------------------------
// AC3: Empty events array → returns false
// ---------------------------------------------------------------------------

describe('matchPhase — AC3: empty events array', () => {
  it('returns false for an empty events array', () => {
    assert.equal(matchPhase({ key: 'phase', value: 'any' }, []), false);
  });

  it('returns false for any filter value when events is empty', () => {
    assert.equal(matchPhase({ key: 'phase', value: 'reflection' }, []), false);
    assert.equal(matchPhase({ key: 'phase', value: '' }, []), false);
  });
});
