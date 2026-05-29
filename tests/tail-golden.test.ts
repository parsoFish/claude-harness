/**
 * Golden tests for tail output — exercises readTailEvents, formatTailText,
 * and formatTailJson directly against the fixture at
 * tests/fixtures/cycle-INIT-FIXTURE-1/events.jsonl (10 events).
 *
 * Fixture events (in order):
 *   architect×3, project-manager×2, developer×4, cycle.end×1
 *
 * AC1: readTailEvents + formatTailText with n=10 matches expected golden lines
 *      character-for-character.
 * AC2: readTailEvents + formatTailText with n=3 returns only the last 3 events.
 * AC3: readTailEvents + formatTailJson with n=10 returns a valid JSON array of
 *      length 10 whose first element has phase === 'architect'.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { readTailEvents, formatTailText, formatTailJson } from '../src/tail.ts';

const ROOT = resolve(import.meta.dirname ?? join(process.cwd(), 'tests'), '..');
const FIXTURE_JSONL = join(
  ROOT,
  'tests',
  'fixtures',
  'cycle-INIT-FIXTURE-1',
  'events.jsonl',
);

// ── Expected golden output (n=10, all 10 events) ─────────────────────────────
// Derived directly from the fixture file content.
const GOLDEN_TEXT_N10 = [
  '[architect] cycle.start',
  '[architect] plan.created',
  '[architect] work-items.created',
  '[project-manager] wi.assigned WI-1',
  '[project-manager] wi.assigned WI-2',
  '[developer] wi.started WI-1',
  '[developer] wi.committed WI-1',
  '[developer] wi.started WI-2',
  '[developer] wi.committed WI-2',
  '[cycle.end] cycle.complete',
].join('\n');

// ── Expected golden output (n=3, last 3 events) ───────────────────────────────
const GOLDEN_TEXT_N3 = [
  '[developer] wi.committed WI-2',
  '[cycle.end] cycle.complete',
].join('\n');

// NOTE: The fixture's last 3 events are:
//   8: developer wi.started WI-2
//   9: developer wi.committed WI-2
//  10: cycle.end cycle.complete
const GOLDEN_TEXT_N3_FULL = [
  '[developer] wi.started WI-2',
  '[developer] wi.committed WI-2',
  '[cycle.end] cycle.complete',
].join('\n');

describe('tail golden tests', () => {
  // ── AC1: readTailEvents + formatTailText with n=10 ──────────────────────────
  it('AC1: formatTailText(n=10) matches expected golden lines character-for-character', () => {
    const events = readTailEvents(FIXTURE_JSONL, 10);

    assert.equal(events.length, 10, 'should read exactly 10 events');
    assert.equal(events[0].phase, 'architect', 'first event phase should be architect');
    assert.equal(events[9].phase, 'cycle.end', 'last event phase should be cycle.end');

    const text = formatTailText(events);
    const lines = text.split('\n');

    assert.equal(lines.length, 10, 'output should have exactly 10 lines');
    assert.equal(
      text,
      GOLDEN_TEXT_N10,
      `formatTailText output does not match golden.\n` +
        `--- expected ---\n${GOLDEN_TEXT_N10}\n` +
        `--- actual ---\n${text}`,
    );
  });

  // ── AC2: readTailEvents + formatTailText with n=3 ───────────────────────────
  it('AC2: formatTailText(n=3) returns only the last 3 events matching expected golden lines', () => {
    const events = readTailEvents(FIXTURE_JSONL, 3);

    assert.equal(events.length, 3, 'should read exactly 3 events');

    const text = formatTailText(events);
    const lines = text.split('\n');

    assert.equal(lines.length, 3, 'output should have exactly 3 lines');
    assert.equal(
      text,
      GOLDEN_TEXT_N3_FULL,
      `formatTailText(n=3) output does not match golden.\n` +
        `--- expected ---\n${GOLDEN_TEXT_N3_FULL}\n` +
        `--- actual ---\n${text}`,
    );

    // The last 3 fixture events: developer wi.started WI-2, developer wi.committed WI-2, cycle.end cycle.complete
    assert.equal(events[0].phase, 'developer');
    assert.equal(events[0].event, 'wi.started');
    assert.equal(events[1].phase, 'developer');
    assert.equal(events[1].event, 'wi.committed');
    assert.equal(events[2].phase, 'cycle.end');
    assert.equal(events[2].event, 'cycle.complete');
  });

  // ── AC3: readTailEvents + formatTailJson with n=10 ──────────────────────────
  it('AC3: formatTailJson(n=10) parses to array of length 10 with first element phase === architect', () => {
    const events = readTailEvents(FIXTURE_JSONL, 10);

    assert.equal(events.length, 10, 'should read exactly 10 events');

    const jsonStr = formatTailJson(events);

    // Must be valid JSON
    let parsed: unknown;
    assert.doesNotThrow(() => {
      parsed = JSON.parse(jsonStr);
    }, 'formatTailJson output must be valid JSON');

    assert.ok(Array.isArray(parsed), 'parsed JSON must be an array');
    const arr = parsed as Array<{ phase: string }>;

    assert.equal(
      arr.length,
      Math.min(10, 10),
      `array length should equal min(10, total-events) = 10`,
    );

    assert.equal(
      arr[0].phase,
      'architect',
      `first element phase should be 'architect', got '${arr[0].phase}'`,
    );
  });
});
