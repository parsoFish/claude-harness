import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { costByPhase, type EventRecord } from '../src/events.ts';

// ── AC1: costByPhase sums cost_usd per phase ──────────────────────────────────

describe('costByPhase', () => {
  it('AC1: returns a Map with one entry per phase summing cost_usd values', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'iteration', timestamp: '2026-01-01T00:00:00Z', cost_usd: 0.10 },
      { phase: 'developer', event: 'iteration', timestamp: '2026-01-01T01:00:00Z', cost_usd: 0.25 },
      { phase: 'architect', event: 'iteration', timestamp: '2026-01-01T02:00:00Z', cost_usd: 0.05 },
      { phase: 'developer', event: 'iteration', timestamp: '2026-01-01T03:00:00Z', cost_usd: 0.30 },
    ];

    const result = costByPhase(events);

    assert.ok(result instanceof Map);
    assert.equal(result.size, 2);
    assert.ok(result.has('architect'));
    assert.ok(result.has('developer'));
    assert.equal(result.get('architect'), 0.10 + 0.05);
    assert.equal(result.get('developer'), 0.25 + 0.30);
  });

  // ── AC2: events without cost_usd are silently skipped ────────────────────────

  it('AC2: silently skips events with no cost_usd field', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'start', timestamp: '2026-01-01T00:00:00Z' },
      { phase: 'architect', event: 'iteration', timestamp: '2026-01-01T01:00:00Z', cost_usd: 0.10 },
      { phase: 'developer', event: 'start', timestamp: '2026-01-01T02:00:00Z' },
    ];

    const result = costByPhase(events);

    assert.ok(result instanceof Map);
    assert.equal(result.size, 1, 'Only phases with cost_usd events should be present');
    assert.ok(result.has('architect'));
    assert.equal(result.get('architect'), 0.10);
    assert.ok(!result.has('developer'), 'developer phase has no cost_usd events so should be absent');
  });

  it('AC2: silently skips events where cost_usd is not a number', () => {
    const events: EventRecord[] = [
      { phase: 'architect', event: 'iteration', timestamp: '2026-01-01T00:00:00Z', cost_usd: '0.10' },
      { phase: 'architect', event: 'iteration', timestamp: '2026-01-01T01:00:00Z', cost_usd: null },
      { phase: 'developer', event: 'iteration', timestamp: '2026-01-01T02:00:00Z', cost_usd: 0.50 },
    ];

    const result = costByPhase(events);

    assert.ok(result instanceof Map);
    assert.equal(result.size, 1);
    assert.ok(!result.has('architect'), 'architect events have non-numeric cost_usd — should be skipped');
    assert.equal(result.get('developer'), 0.50);
  });

  // ── AC3: empty array returns empty Map ───────────────────────────────────────

  it('AC3: returns an empty Map for an empty events array', () => {
    const result = costByPhase([]);

    assert.ok(result instanceof Map);
    assert.equal(result.size, 0);
  });
});
