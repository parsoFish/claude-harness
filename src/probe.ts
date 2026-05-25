import { readEvents, rollupByPhase } from './events.ts';

/**
 * The result of probing an events.jsonl file for core statistics.
 */
export interface ProbeResult {
  initiativeId: string;
  totalEvents: number;
  phaseCount: number;
  dominantPhase: string;
  dominantCount: number;
}

/**
 * Reads the events.jsonl file at `filePath`, computes core statistics, and
 * returns a plain ProbeResult object.
 *
 * - `totalEvents` — total number of event records in the file.
 * - `phaseCount`  — number of distinct phase names.
 * - `dominantPhase` — the phase with the highest event count. When two phases
 *   tie, one is returned deterministically (first one encountered in the Map
 *   iteration order, which is insertion order). Returns `''` for empty files.
 * - `dominantCount` — number of events in the dominant phase. `0` for empty files.
 * - `initiativeId` — first non-empty `initiative_id` field seen in the events,
 *   or `''` if none carries the field.
 *
 * Pure computation: no stdout, no process.exit, no argument parsing.
 *
 * @param filePath - Path to an events.jsonl file.
 * @returns ProbeResult object.
 */
export function probeCore(filePath: string): ProbeResult {
  const events = readEvents(filePath);
  const byPhase = rollupByPhase(events);

  const totalEvents = events.length;
  const phaseCount = byPhase.size;

  // Find initiative_id from first event that carries it.
  let initiativeId = '';
  for (const event of events) {
    if (typeof event['initiative_id'] === 'string' && event['initiative_id'] !== '') {
      initiativeId = event['initiative_id'];
      break;
    }
  }

  // Determine dominant phase (most events).
  let dominantPhase = '';
  let dominantCount = 0;

  for (const [phase, phaseEvents] of byPhase) {
    if (phaseEvents.length > dominantCount) {
      dominantCount = phaseEvents.length;
      dominantPhase = phase;
    }
  }

  return { initiativeId, totalEvents, phaseCount, dominantPhase, dominantCount };
}

/**
 * Formats a ProbeResult as a single-line health summary string.
 *
 * Format: `<initiativeId>: <totalEvents> events, <phaseCount> phases, dominant=<dominantPhase> (<dominantCount> events)`
 *
 * @param result - ProbeResult to format.
 * @returns The formatted summary string.
 */
export function formatProbeSummary(result: ProbeResult): string {
  return `${result.initiativeId}: ${result.totalEvents} events, ${result.phaseCount} phases, dominant=${result.dominantPhase} (${result.dominantCount} events)`;
}
