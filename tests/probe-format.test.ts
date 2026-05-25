import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatProbeSummary, type ProbeResult } from '../src/probe.ts';

// ── AC1: full ProbeResult → exact format string ───────────────────────────────

describe('formatProbeSummary — AC1: full ProbeResult', () => {
  it("returns exactly 'INIT-abc: 47 events, 6 phases, dominant=developer-loop (22 events)'", () => {
    const result: ProbeResult = {
      initiativeId: 'INIT-abc',
      totalEvents: 47,
      phaseCount: 6,
      dominantPhase: 'developer-loop',
      dominantCount: 22,
    };

    const summary = formatProbeSummary(result);

    assert.equal(summary, 'INIT-abc: 47 events, 6 phases, dominant=developer-loop (22 events)');
  });
});

// ── AC2: empty dominantPhase and zero dominantCount → no throw ────────────────

describe('formatProbeSummary — AC2: empty dominantPhase and zero counts', () => {
  it('returns a string matching the format template without throwing', () => {
    const result: ProbeResult = {
      initiativeId: 'INIT-xyz',
      totalEvents: 10,
      phaseCount: 0,
      dominantPhase: '',
      dominantCount: 0,
    };

    let summary: string;
    assert.doesNotThrow(() => {
      summary = formatProbeSummary(result);
    });

    // Must match: '<initiativeId>: <N> events, 0 phases, dominant= (0 events)'
    assert.equal(summary!, 'INIT-xyz: 10 events, 0 phases, dominant= (0 events)');
  });
});

// ── AC3: singular counts rendered correctly ───────────────────────────────────

describe('formatProbeSummary — AC3: singular counts', () => {
  it('renders bare numbers (no plural vs singular branching required)', () => {
    const result: ProbeResult = {
      initiativeId: 'INIT-single',
      totalEvents: 1,
      phaseCount: 1,
      dominantPhase: 'planner',
      dominantCount: 1,
    };

    const summary = formatProbeSummary(result);

    assert.equal(summary, 'INIT-single: 1 events, 1 phases, dominant=planner (1 events)');
  });
});
