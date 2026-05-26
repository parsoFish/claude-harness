import { readEvents } from './events.ts';

/**
 * Reads an events.jsonl file and counts events grouped by phase.
 *
 * @param eventsFilePath - Absolute or relative path to the events.jsonl file.
 * @returns A plain object with one key per distinct phase (containing the count
 *          of events in that phase), plus a `"total"` key holding the sum of
 *          all per-phase counts. Blank lines in the file are skipped.
 */
export function countEventsByPhase(eventsFilePath: string): Record<string, number> {
  const events = readEvents(eventsFilePath);

  const counts: Record<string, number> = {};
  for (const event of events) {
    counts[event.phase] = (counts[event.phase] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  return { ...counts, total };
}
