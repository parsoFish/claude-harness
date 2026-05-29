import { readFileSync } from 'node:fs';
import { type EventRecord } from './events.ts';

/**
 * Reads the last `n` EventRecord objects from a JSONL file at `filePath`.
 * Blank lines are skipped. Events are returned in chronological order
 * (oldest first). If the file contains fewer than `n` non-blank lines,
 * all events are returned.
 *
 * @param filePath - Absolute or relative path to the events.jsonl file.
 * @param n - Maximum number of tail events to return.
 * @returns Array of up to `n` EventRecord objects in file order (oldest first).
 * @throws Error containing `filePath` if the file does not exist or cannot be
 *         read.
 */
export function readTailEvents(filePath: string, n: number): EventRecord[] {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (cause) {
    throw new Error(`readTailEvents: cannot read file "${filePath}"`, { cause });
  }

  const records: EventRecord[] = [];
  for (const line of raw.split('\n')) {
    if (line.trim() === '') continue;
    records.push(JSON.parse(line) as EventRecord);
  }

  // Return the last n records in chronological order (oldest first)
  return records.slice(-n);
}
