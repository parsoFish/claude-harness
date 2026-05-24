import type { EventRecord } from './events.ts';

/**
 * Renders the title section of a trail document.
 *
 * @param initiativeId - The initiative identifier (e.g. INIT-2026-05-24-example).
 * @returns A markdown heading string.
 */
export function renderTitle(initiativeId: string): string {
  return `# Trail — ${initiativeId}\n`;
}

/**
 * Renders the summary section of a trail document.
 *
 * @param initiativeId - The initiative identifier.
 * @param verdict - The outcome verdict (e.g. 'complete', 'failed').
 * @param costUsd - Total cost in USD.
 * @returns A markdown string containing a '## Summary' heading and a paragraph
 *          mentioning the initiative id, verdict, and formatted cost.
 */
export function renderSummarySection(
  initiativeId: string,
  verdict: string,
  costUsd: number,
): string {
  const formattedCost = `$${costUsd.toFixed(2)}`;
  return [
    '## Summary',
    '',
    `Initiative **${initiativeId}** completed with verdict: **${verdict}**. Total cost: ${formattedCost}.`,
    '',
  ].join('\n');
}

/**
 * Renders the phases section of a trail document.
 *
 * @param phaseMap - Map produced by rollupByPhase: phase name → EventRecord[].
 * @returns A markdown string containing a '## Phases' heading, one sub-heading
 *          per phase, and a list of events beneath each sub-heading.
 */
export function renderPhasesSection(phaseMap: Map<string, EventRecord[]>): string {
  const lines: string[] = ['## Phases', ''];

  for (const [phase, events] of phaseMap) {
    lines.push(`### ${phase}`, '');
    for (const evt of events) {
      lines.push(`- ${evt.event} (${evt.timestamp})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
