import { readFileSync } from 'node:fs';

/**
 * A single event record parsed from an events.jsonl file.
 * Requires at minimum phase, event, and timestamp fields;
 * additional fields are permitted via the index signature.
 */
export interface EventRecord {
  phase: string;
  event: string;
  timestamp: string;
  [key: string]: unknown;
}

/**
 * Reads a JSONL file at `filePath` and returns an array of parsed EventRecord
 * objects. Blank lines are skipped. Throws if the file cannot be read.
 *
 * @param filePath - Absolute or relative path to the events.jsonl file.
 * @returns Array of parsed EventRecord objects in file order.
 * @throws Error containing `filePath` if the file does not exist or cannot be
 *         read.
 */
export function readEvents(filePath: string): EventRecord[] {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (cause) {
    throw new Error(`readEvents: cannot read file "${filePath}"`, { cause });
  }

  const records: EventRecord[] = [];
  for (const line of raw.split('\n')) {
    if (line.trim() === '') continue;
    records.push(JSON.parse(line) as EventRecord);
  }
  return records;
}

/**
 * Accumulates cost_usd values from an array of EventRecord objects into a Map
 * keyed by phase name. Events without a numeric cost_usd field are silently
 * skipped. Returns an empty Map when no events carry cost data.
 *
 * @param events - Array of EventRecord objects (typically from readEvents).
 * @returns Map<phaseName, number> — one entry per distinct phase, summing that
 *          phase's cost_usd values.
 */
export function costByPhase(events: EventRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const event of events) {
    if (typeof event.cost_usd !== 'number') continue;
    const current = map.get(event.phase) ?? 0;
    map.set(event.phase, current + event.cost_usd);
  }
  return map;
}

/**
 * Groups an array of EventRecord objects into a Map keyed by phase name.
 * Within each phase the events appear in their original insertion order.
 *
 * @param events - Array of EventRecord objects (typically from readEvents).
 * @returns Map<phaseName, EventRecord[]> — one entry per distinct phase.
 */
export function rollupByPhase(events: EventRecord[]): Map<string, EventRecord[]> {
  const map = new Map<string, EventRecord[]>();
  for (const event of events) {
    const bucket = map.get(event.phase);
    if (bucket === undefined) {
      map.set(event.phase, [event]);
    } else {
      bucket.push(event);
    }
  }
  return map;
}
