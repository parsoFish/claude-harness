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
 * Renders the cost rollup section of a trail document.
 *
 * @param costMap - Map produced by costByPhase: phase name → total cost in USD.
 * @returns A markdown string containing a '## Cost rollup' heading with one
 *          bullet per phase and a 'Total:' line — or an empty string if the
 *          map is empty (section is silently omitted when no cost data exists).
 */
export function renderCostSection(costMap: Map<string, number>): string {
  if (costMap.size === 0) return '';

  const lines: string[] = ['## Cost rollup', ''];
  let total = 0;

  for (const [phase, cost] of costMap) {
    lines.push(`- **${phase}**: $${cost.toFixed(2)}`);
    total += cost;
  }

  lines.push('');
  lines.push(`**Total**: $${total.toFixed(2)}`);
  lines.push('');

  return lines.join('\n');
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
