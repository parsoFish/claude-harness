/**
 * Unit tests for renderCostSection (src/trail.ts).
 *
 * AC1: GIVEN a Map<string, number> with two phase entries WHEN renderCostSection
 *      is called THEN the returned string contains a '## Cost rollup' heading,
 *      one bullet per phase with its cost formatted to two decimal places, and
 *      a 'Total:' line with the summed cost.
 *
 * AC2: GIVEN an empty Map WHEN renderCostSection(new Map()) is called THEN the
 *      function returns an empty string (section is omitted when no cost data exists).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderCostSection } from '../src/trail.ts';

describe('renderCostSection', () => {
  it('AC1: contains ## Cost rollup heading, one bullet per phase, and Total line', () => {
    const costMap = new Map<string, number>([
      ['developer', 0.12],
      ['architect', 0.05],
    ]);

    const result = renderCostSection(costMap);

    assert.ok(result.includes('## Cost rollup'), 'should contain "## Cost rollup"');

    // One bullet per phase with cost formatted to two decimal places
    assert.ok(result.includes('developer'), 'should mention developer phase');
    assert.ok(result.includes('0.12'), 'developer cost formatted to 2dp');
    assert.ok(result.includes('architect'), 'should mention architect phase');
    assert.ok(result.includes('0.05'), 'architect cost formatted to 2dp');

    // Total line with summed cost (0.12 + 0.05 = 0.17)
    assert.ok(result.includes('Total'), 'should contain a Total line');
    assert.ok(result.includes('0.17'), 'Total should be sum of all phase costs');
  });

  it('AC1: each phase is a bullet line with cost formatted to two decimal places', () => {
    const costMap = new Map<string, number>([
      ['developer', 0.12],
      ['architect', 0.05],
    ]);

    const result = renderCostSection(costMap);
    const lines = result.split('\n');

    // Each phase should appear as a bullet
    const developerLine = lines.find((l) => l.includes('developer'));
    assert.ok(developerLine, 'should have a line for developer');
    assert.ok(developerLine!.startsWith('-'), 'developer line should be a bullet');
    assert.ok(developerLine!.includes('0.12'), 'developer line should have $0.12');

    const architectLine = lines.find((l) => l.includes('architect'));
    assert.ok(architectLine, 'should have a line for architect');
    assert.ok(architectLine!.startsWith('-'), 'architect line should be a bullet');
    assert.ok(architectLine!.includes('0.05'), 'architect line should have $0.05');
  });

  it('AC1: Total line sums all phase costs correctly', () => {
    const costMap = new Map<string, number>([
      ['developer', 1.00],
      ['architect', 2.50],
      ['reflector', 0.30],
    ]);

    const result = renderCostSection(costMap);

    assert.ok(result.includes('Total'), 'should contain Total line');
    // 1.00 + 2.50 + 0.30 = 3.80
    assert.ok(result.includes('3.80'), 'Total should equal 3.80');
  });

  it('AC2: returns empty string for an empty Map', () => {
    const result = renderCostSection(new Map());

    assert.strictEqual(result, '', 'should return empty string for empty Map');
  });
});
