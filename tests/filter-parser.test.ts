/**
 * filter-parser.test.ts — unit tests for parseFilters() in src/filter.ts
 *
 * AC1: single --filter flag returns one FilterSpec
 * AC2: two --filter flags return two FilterSpecs
 * AC3: --filter token without colon throws an error mentioning the bad token
 * AC4: no --filter flags returns empty array
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters } from '../src/filter.ts';

// AC1: single --filter phase:reflection
test('AC1 — single --filter flag returns one FilterSpec', () => {
  const result = parseFilters(['--filter', 'phase:reflection']);
  assert.deepEqual(result, [{ key: 'phase', value: 'reflection' }]);
});

// AC2: two --filter flags accumulate into two entries
test('AC2 — two --filter flags return two FilterSpecs', () => {
  const result = parseFilters([
    '--filter', 'phase:reflection',
    '--filter', 'status:done',
  ]);
  assert.deepEqual(result, [
    { key: 'phase', value: 'reflection' },
    { key: 'status', value: 'done' },
  ]);
});

// AC3: --filter token without colon throws
test('AC3 — --filter token without colon throws with token in message', () => {
  assert.throws(
    () => parseFilters(['--filter', 'badformat']),
    (err: unknown) => {
      assert.ok(err instanceof Error, 'should be an Error');
      assert.ok(
        err.message.includes('badformat'),
        `error message should mention the bad token; got: ${err.message}`,
      );
      return true;
    },
  );
});

// AC4: no --filter flags → empty array
test('AC4 — no --filter flags returns empty array', () => {
  const result = parseFilters(['--since', 'some-cycle', '--out', 'trail.md']);
  assert.deepEqual(result, []);
});

// Bonus: --filter=key:value equals form (design note from WI spec)
test('equals form --filter=key:value is parsed correctly', () => {
  const result = parseFilters(['--filter=type:iteration']);
  assert.deepEqual(result, [{ key: 'type', value: 'iteration' }]);
});

// Bonus: empty argv
test('empty argv returns empty array', () => {
  assert.deepEqual(parseFilters([]), []);
});
