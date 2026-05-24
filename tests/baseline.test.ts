/**
 * Baseline test — exists so `npm test` has at least one passing case on
 * the bare project. The architect / dev-loop will add real tests on top
 * of this; you can delete this file once any real test exists.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

test('baseline — package is wired up', () => {
  assert.ok(true, 'reachable');
});
