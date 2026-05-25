/**
 * filter-renderer.ts — Filtered renderer for cycle event lists.
 *
 * Exports:
 *   - CycleEvents: { name: string; events: EventRecord[] }
 *   - filterCycles(cycleEventsList: CycleEvents[], filters: FilterSpec[]): CycleEvents[]
 *
 * Dispatch by filter.key:
 *   - 'phase'  → matchPhase
 *   - 'status' → matchStatus
 *   - unknown keys are silently skipped (treated as a pass-through for that
 *     filter), so callers can extend the key-space without a hard failure.
 *
 * Multiple filters are ANDed: a cycle must pass ALL filters to be included.
 * An empty filters array is a no-op — all cycles are returned unchanged.
 */

import type { FilterSpec } from './filter.ts';
import type { EventRecord } from './events.ts';
import { matchPhase } from './filter-phase.ts';
import { matchStatus } from './filter-status.ts';

/**
 * A named collection of event records representing one cycle.
 *
 * The `name` field is a human-readable identifier for the cycle
 * (e.g. the cycle's directory name or initiative id).
 */
export interface CycleEvents {
  name: string;
  events: EventRecord[];
}

/**
 * Filters a list of cycle event arrays by all supplied filters (AND semantics).
 *
 * For each filter, dispatch is by `filter.key`:
 * - `'phase'`  → delegates to `matchPhase`
 * - `'status'` → delegates to `matchStatus`
 * - Any other key is silently skipped (treated as always-passing for that filter).
 *
 * A cycle is included in the result only if it passes ALL filters.
 * An empty `filters` array returns all cycles unchanged.
 *
 * @param cycleEventsList - Array of CycleEvents to filter.
 * @param filters         - Array of FilterSpec to apply (AND semantics).
 * @returns               Subset of `cycleEventsList` that satisfies all filters.
 */
export function filterCycles(
  cycleEventsList: CycleEvents[],
  filters: FilterSpec[],
): CycleEvents[] {
  if (filters.length === 0) return cycleEventsList;

  return cycleEventsList.filter((cycle) =>
    filters.every((filter) => {
      if (filter.key === 'phase') return matchPhase(filter, cycle.events);
      if (filter.key === 'status') return matchStatus(filter, cycle.events);
      // Unknown key — silently skip (pass-through)
      return true;
    }),
  );
}
