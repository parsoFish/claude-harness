import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { countEventsByPhase } from '../src/stats.ts';

// ---- helpers ----------------------------------------------------------------

function writeTmpJsonl(lines: string[]): string {
  const dir = mkdirSync(join(tmpdir(), `stats-test-${Date.now()}`), { recursive: true }) as string | undefined;
  const filePath = join(tmpdir(), `stats-test-${Date.now()}.jsonl`);
  writeFileSync(filePath, lines.join('\n'), 'utf8');
  return filePath;
}

// ---- AC1 & AC2 ---------------------------------------------------------------

test('AC1+AC2: returns per-phase counts and total from multi-phase events.jsonl', () => {
  // 3 architect events, 2 project-manager events → total 5
  const lines = [
    JSON.stringify({ phase: 'architect',       event: 'e1', timestamp: 't1' }),
    JSON.stringify({ phase: 'architect',       event: 'e2', timestamp: 't2' }),
    JSON.stringify({ phase: 'architect',       event: 'e3', timestamp: 't3' }),
    JSON.stringify({ phase: 'project-manager', event: 'e4', timestamp: 't4' }),
    JSON.stringify({ phase: 'project-manager', event: 'e5', timestamp: 't5' }),
  ];
  const filePath = writeTmpJsonl(lines);

  const result = countEventsByPhase(filePath);

  // AC1: record has one key per phase plus 'total'
  assert.ok('architect' in result,       "should have 'architect' key");
  assert.ok('project-manager' in result, "should have 'project-manager' key");
  assert.ok('total' in result,           "should have 'total' key");

  // AC2: correct per-phase counts; total equals 5
  assert.equal(result['architect'],       3, 'architect count should be 3');
  assert.equal(result['project-manager'], 2, 'project-manager count should be 2');
  assert.equal(result['total'],           5, 'total should be 5');
});

// ---- AC1 (multi-phase fixture) -----------------------------------------------

test('AC1: works with the standard fixture file covering architect, project-manager, developer, cycle.end phases', () => {
  const fixturePath = new URL(
    './fixtures/cycle-INIT-FIXTURE-1/events.jsonl',
    import.meta.url,
  ).pathname;

  const result = countEventsByPhase(fixturePath);

  // Fixture has 4 distinct phases
  assert.ok('architect' in result,       "fixture: should have 'architect' key");
  assert.ok('project-manager' in result, "fixture: should have 'project-manager' key");
  assert.ok('developer' in result,       "fixture: should have 'developer' key");
  assert.ok('cycle.end' in result,       "fixture: should have 'cycle.end' key");
  assert.ok('total' in result,           "fixture: should have 'total' key");

  // Verify totals add up
  const phaseSum = Object.entries(result)
    .filter(([k]) => k !== 'total')
    .reduce((sum, [, v]) => sum + v, 0);
  assert.equal(result['total'], phaseSum, "'total' should equal sum of all phase counts");
});

// ---- AC3 --------------------------------------------------------------------

test('AC3: blank lines are skipped and do not contribute to counts', () => {
  const lines = [
    JSON.stringify({ phase: 'developer-loop', event: 'e1', timestamp: 't1' }),
    '',            // blank line — must be skipped
    '   ',         // whitespace-only line — must be skipped
    JSON.stringify({ phase: 'developer-loop', event: 'e2', timestamp: 't2' }),
    '',
  ];
  const filePath = writeTmpJsonl(lines);

  const result = countEventsByPhase(filePath);

  assert.equal(result['developer-loop'], 2,   'only 2 valid events, blank lines skipped');
  assert.equal(result['total'],          2,   'total should equal 2');
  // No spurious keys beyond the one phase and total
  const keys = Object.keys(result);
  assert.deepEqual(keys.sort(), ['developer-loop', 'total'].sort(), 'unexpected keys in result');
});
