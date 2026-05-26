import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatStatsJson } from '../src/stats.ts';

// ---- AC1: round-trips a Record<string, number> including a 'total' key ------

test('AC1: returns a JSON string that, when parsed, equals the input record exactly', () => {
  const counts: Record<string, number> = {
    architect: 12,
    'project-manager': 8,
    'developer-loop': 47,
    'review-loop': 9,
    closure: 5,
    reflection: 12,
    total: 93,
  };

  const result = formatStatsJson(counts);

  // Must be a string
  assert.equal(typeof result, 'string', 'formatStatsJson should return a string');

  // Must be valid JSON
  let parsed: unknown;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result);
  }, 'formatStatsJson result must be valid JSON');

  // Parsed value must deep-equal the input
  assert.deepEqual(parsed, counts, 'parsed JSON must equal the input record');
});

// ---- AC2: specific record {architect: 12, 'project-manager': 8, total: 20} --

test("AC2: {architect: 12, 'project-manager': 8, total: 20} round-trips correctly", () => {
  const counts: Record<string, number> = {
    architect: 12,
    'project-manager': 8,
    total: 20,
  };

  const result = formatStatsJson(counts);

  // Must be a string
  assert.equal(typeof result, 'string', 'formatStatsJson should return a string');

  // Must be valid JSON
  let parsed: unknown;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(result);
  }, 'result must be valid JSON');

  // Parsed value must deep-equal the specific input record
  assert.deepEqual(
    parsed,
    { architect: 12, 'project-manager': 8, total: 20 },
    "parsed JSON must equal {architect: 12, 'project-manager': 8, total: 20}"
  );
});

// ---- AC3: empty record {} returns '{}' --------------------------------------

test("AC3: empty record {} returns '{}'", () => {
  const counts: Record<string, number> = {};

  const result = formatStatsJson(counts);

  assert.equal(result, '{}', "formatStatsJson({}) must return '{}'");
});
