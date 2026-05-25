/**
 * filter-status.ts — Status matcher for cycle event filtering.
 *
 * Exports:
 *   - matchStatus(filter: FilterSpec, events: EventRecord[]): boolean
 *
 * Returns true if any event in the array has a field named `filter.key`
 * whose value equals `filter.value` (case-sensitive string equality).
 *
 * The canonical use-case is `--filter status:done`, which passes
 * `{ key: 'status', value: 'done' }` and returns true when any event
 * carries `status === 'done'` — including the terminal event's top-level
 * `status` field.
 */

import type { FilterSpec } from './filter.ts';
import type { EventRecord } from './events.ts';

/**
 * Returns true if at least one event in `events` has a field named
 * `filter.key` whose value equals `filter.value` (case-sensitive string
 * equality).
 *
 * Returns false for an empty events array.
 *
 * @param filter - A FilterSpec whose `key` names the field to inspect and
 *                 `value` is the expected string value.
 * @param events - Array of EventRecord objects to search.
 * @returns boolean — true when any event's field matches, false otherwise.
 */
export function matchStatus(filter: FilterSpec, events: EventRecord[]): boolean {
  return events.some((event) => event[filter.key] === filter.value);
}
