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
 * @param verdict - The cycle verdict from cycle.end metadata (e.g. 'approve', 'reject').
 * @param costUsd - Total cost in USD.
 * @param outcome - The cycle outcome from cycle.end metadata (e.g. 'merged', 'abandoned').
 * @returns A markdown string containing a '## Summary' heading, a paragraph
 *          mentioning the initiative id and cost, plus explicit Verdict and Outcome lines.
 */
export function renderSummarySection(
  initiativeId: string,
  verdict: string,
  costUsd: number,
  outcome: string = '(unknown)',
): string {
  const formattedCost = `$${costUsd.toFixed(2)}`;
  return [
    '## Summary',
    '',
    `Initiative **${initiativeId}** completed with verdict: **${verdict}**. Total cost: ${formattedCost}.`,
    '',
    `Verdict: ${verdict}`,
    `Outcome: ${outcome}`,
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

/**
 * Renders the PR metadata section of a trail document.
 *
 * @param meta - PR metadata object with `url`, `title`, and `state` fields,
 *               or `null` when no PR metadata is available.
 * @returns A markdown string containing a '## PR' heading with the PR details,
 *          or an empty string when `meta` is `null` (section is silently skipped).
 */
export function renderPrSection(
  meta: { url: string; title: string; state: string } | null,
): string {
  if (meta === null) return '';

  return [
    '## PR',
    '',
    `**Title**: ${meta.title}`,
    `**URL**: ${meta.url}`,
    `**State**: ${meta.state}`,
    '',
  ].join('\n');
}

/**
 * Renders the combined Git activity section of a trail document.
 *
 * Contains two sub-blocks:
 * - `### Commits` — oneline list from getCommits() (sha + subject)
 * - `### Files touched` — list of touched file paths from getFilesTouched()
 *
 * If commits is empty, emits `_(none)_` under Commits.
 * If filePaths is empty, emits `_(none)_` under Files touched.
 *
 * @param commits - Array of `{sha, subject}` commit objects.
 * @param filePaths - Array of file path strings that were touched.
 * @returns A markdown string containing a '## Git activity' heading with both sub-blocks.
 */
export function renderGitActivity(
  commits: { sha: string; subject: string }[],
  filePaths: string[],
): string {
  const lines: string[] = ['## Git activity', ''];

  lines.push('### Commits', '');
  if (commits.length === 0) {
    lines.push('_(none)_', '');
  } else {
    for (const commit of commits) {
      lines.push(`- ${commit.sha} ${commit.subject}`);
    }
    lines.push('');
  }

  lines.push('### Files touched', '');
  if (filePaths.length === 0) {
    lines.push('_(none)_', '');
  } else {
    for (const filePath of filePaths) {
      lines.push(`- ${filePath}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
