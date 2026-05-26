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

/**
 * Formats a phase-count record (as returned by countEventsByPhase) into a
 * human-readable two-column table string.
 *
 * The output format is:
 *   phase:           events
 *   architect          12
 *   developer-loop     47
 *   total              93
 *
 * Left column width = max(longest phase name, length of "phase:") + 2 spaces of padding.
 * Phases are listed in the order they appear in the record; 'total' is last.
 *
 * @param counts - Record<string, number> with phase counts and a 'total' key.
 * @returns Formatted table string.
 */
export function formatStatsText(counts: Record<string, number>): string {
  // Separate 'total' from phase entries, preserving insertion order for phases.
  const entries = Object.entries(counts).filter(([k]) => k !== 'total');
  const total = counts['total'] ?? 0;

  // Determine left column width.
  // "phase:" header label has 6 chars; compare against longest phase name.
  const headerLabel = 'phase:';
  const maxPhaseLen = entries.reduce((m, [k]) => Math.max(m, k.length), 0);
  const colWidth = Math.max(maxPhaseLen, headerLabel.length) + 2;

  const lines: string[] = [];

  // Header row
  lines.push(`${headerLabel.padEnd(colWidth)}events`);

  // Phase rows
  for (const [phase, count] of entries) {
    lines.push(`${phase.padEnd(colWidth)}${count}`);
  }

  // Total row
  lines.push(`${'total'.padEnd(colWidth)}${total}`);

  return lines.join('\n');
}

/**
 * Formats a phase-count record (as returned by countEventsByPhase) into a
 * compact single-line JSON string.
 *
 * This is intentionally the simplest possible formatter: JSON.stringify(counts)
 * with no extra indentation or wrapping.
 *
 * Example output:
 *   {"architect":12,"project-manager":8,"developer-loop":47,"total":93}
 *
 * @param counts - Record<string, number> with phase counts and a 'total' key.
 * @returns Compact JSON string.
 */
export function formatStatsJson(counts: Record<string, number>): string {
  return JSON.stringify(counts);
}
