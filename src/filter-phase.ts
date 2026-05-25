/**
 * filter-phase.ts — Phase matcher for cycle event filtering.
 *
 * Exports:
 *   - matchPhase(filter: FilterSpec, events: EventRecord[]): boolean
 *
 * Returns true if any event in the array has `event.phase === filter.value`
 * (case-sensitive). Does not touch status, verdict, or any other field.
 */

import type { FilterSpec } from './filter.ts';
import type { EventRecord } from './events.ts';

/**
 * Returns true if at least one event in `events` has a `phase` field that
 * equals `filter.value` (case-sensitive string equality).
 *
 * Returns false for an empty events array.
 *
 * @param filter - A FilterSpec whose `value` is the phase name to match.
 * @param events - Array of EventRecord objects to search.
 * @returns boolean — true when any event's phase matches, false otherwise.
 */
export function matchPhase(filter: FilterSpec, events: EventRecord[]): boolean {
  return events.some((event) => event.phase === filter.value);
}
