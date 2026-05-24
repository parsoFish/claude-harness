import { existsSync, readdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { readEvents, rollupByPhase, costByPhase, extractCycleMeta } from './events.ts';
import { renderTitle, renderSummarySection, renderPhasesSection, renderCostSection, renderGitActivity, renderPrSection } from './trail.ts';
import { findThemesForInitiative, renderThemesSection } from './brain.ts';
import { readPrMetadata } from './pr.ts';
import { getCommits } from './git.ts';

const initiativeId = process.argv[2];

if (!initiativeId) {
  process.stderr.write(
    'Usage: node --experimental-strip-types src/cli.ts <initiative-id> [--since <cycle-id>]\n',
  );
  process.exit(1);
}

// Parse --since flag from argv: supports "--since <value>" or "--since=<value>"
let sinceValue: string | undefined;
for (let i = 3; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--since' && i + 1 < process.argv.length) {
    sinceValue = process.argv[i + 1];
    break;
  }
  if (arg.startsWith('--since=')) {
    sinceValue = arg.slice('--since='.length);
    break;
  }
}

// Parse --out flag from argv: supports "--out <value>" or "--out=<value>"
let outValue: string | undefined;
for (let i = 3; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === '--out' && i + 1 < process.argv.length) {
    outValue = process.argv[i + 1];
    break;
  }
  if (arg.startsWith('--out=')) {
    outValue = arg.slice('--out='.length);
    break;
  }
}

// Parse --format flag from argv: supports "--format <value>" or "--format=<value>"
// Valid values: 'json' | 'markdown' (default: 'markdown')
let formatValue: 'json' | 'markdown' = 'markdown';
for (let i = 3; i < process.argv.length; i++) {
  const arg = process.argv[i];
  let raw: string | undefined;
  if (arg === '--format' && i + 1 < process.argv.length) {
    raw = process.argv[i + 1];
  } else if (arg.startsWith('--format=')) {
    raw = arg.slice('--format='.length);
  }
  if (raw !== undefined) {
    if (raw !== 'json' && raw !== 'markdown') {
      process.stderr.write(
        `Error: --format must be "json" or "markdown"; got "${raw}"\n`,
      );
      process.exit(1);
    }
    formatValue = raw as 'json' | 'markdown';
    break;
  }
}

// Resolve the _logs directory relative to cwd
const logsDir = resolve(process.cwd(), '_logs');

if (!existsSync(logsDir)) {
  process.stderr.write(
    `Error: _logs directory not found at "${logsDir}"\n`,
  );
  process.exit(1);
}

// Walk _logs for sub-directories whose name contains the initiativeId
let allCycleDirs: string[] = [];
try {
  const entries = readdirSync(logsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.includes(initiativeId)) {
      allCycleDirs.push(entry.name);
    }
  }
  // Sort ascending (lexicographic timestamp prefix ensures chronological order)
  allCycleDirs.sort();
} catch (cause) {
  process.stderr.write(
    `Error: cannot read _logs directory "${logsDir}": ${(cause as Error).message}\n`,
  );
  process.exit(1);
}

// Determine the set of cycle directories to process
let selectedCycleNames: string[];
if (sinceValue !== undefined) {
  // --since mode: include all cycles with name >= sinceValue
  selectedCycleNames = allCycleDirs.filter((name) => name >= sinceValue!);
} else {
  // Legacy single-cycle mode: pick the first matching cycle dir (original behaviour)
  const first = allCycleDirs[0];
  selectedCycleNames = first !== undefined ? [first] : [];
}

if (selectedCycleNames.length === 0) {
  process.stderr.write(
    `Error: no cycle directory found in "${logsDir}" for initiative "${initiativeId}"` +
      (sinceValue !== undefined ? ` with --since "${sinceValue}"` : '') +
      '\n',
  );
  process.exit(1);
}

// Resolve to full paths
const selectedCycleDirs = selectedCycleNames.map((name) => join(logsDir, name));

// Aggregate events from all selected cycle dirs
const allEvents = selectedCycleDirs.flatMap((dir) =>
  readEvents(join(dir, 'events.jsonl')),
);

const phaseMap = rollupByPhase(allEvents);
const costMap = costByPhase(allEvents);

// Derive verdict, outcome, and cost from aggregated events
const cycleMeta = extractCycleMeta(allEvents);
let verdict = cycleMeta.verdict;
const outcome = cycleMeta.outcome;
let costUsd = 0;
for (const evt of allEvents) {
  if (typeof evt['cost_usd'] === 'number') costUsd += evt['cost_usd'];
}

// Brain themes: look for a brain/ dir inside the FIRST selected cycle directory
const brainDir = join(selectedCycleDirs[0]!, 'brain');
const themes = findThemesForInitiative(brainDir, initiativeId);

// Files touched: gracefully return empty list if git is unavailable
let filesTouched: string[] = [];
const worktreePathEvent = allEvents.find(
  (evt) => typeof evt['worktree_path'] === 'string',
);
if (worktreePathEvent) {
  const worktreePath = worktreePathEvent['worktree_path'] as string;
  try {
    const { getFilesTouched } = await import('./git.ts');
    filesTouched = getFilesTouched(worktreePath, 'HEAD~1', 'HEAD');
  } catch {
    // git unavailable or not a repo — leave filesTouched empty
  }
}

// Commits: aggregate from commits.json across all selected cycle dirs
let commits: { sha: string; subject: string }[] = [];
for (const dir of selectedCycleDirs) {
  const commitsJsonPath = join(dir, 'commits.json');
  if (existsSync(commitsJsonPath)) {
    try {
      commits = commits.concat(getCommits(commitsJsonPath));
    } catch {
      // malformed commits.json — skip this cycle's commits
    }
  }
}

// ── Render ────────────────────────────────────────────────────────────────────

const prMeta = readPrMetadata(process.cwd());

if (formatValue === 'json') {
  // ── JSON output branch ─────────────────────────────────────────────────────
  // Build phases array: [{ phase: string, events: EventRecord[] }, ...]
  const phasesArray = Array.from(phaseMap.entries()).map(([phase, events]) => ({
    phase,
    events,
  }));

  // Build costByPhase object: { <phase>: <cost> }
  const costByPhaseObj: Record<string, number> = {};
  for (const [phase, cost] of costMap.entries()) {
    costByPhaseObj[phase] = cost;
  }

  const jsonOutput = {
    initiativeId,
    outcome: verdict,
    verdict,
    totalCostUsd: costUsd,
    phases: phasesArray,
    themes,
    filesTouched,
    commits,
    pr: prMeta,
    costByPhase: costByPhaseObj,
  };

  process.stdout.write(JSON.stringify(jsonOutput) + '\n');
} else {
  // ── Markdown output branch (default) ──────────────────────────────────────
  let trailContent = '';
  trailContent += renderTitle(initiativeId);

  // Emit '## Cycles included' section when --since is used (multi-cycle mode)
  if (sinceValue !== undefined) {
    trailContent += renderCyclesIncludedSection(selectedCycleNames);
  }

  trailContent += renderSummarySection(initiativeId, verdict, costUsd, outcome);
  trailContent += renderPhasesSection(phaseMap);
  trailContent += renderCostSection(costMap);
  trailContent += renderGitActivity(commits, filesTouched);
  trailContent += renderPrSection(prMeta);
  trailContent += renderThemesSection(themes);

  if (outValue !== undefined) {
    // --out mode: write to file, print confirmation to stdout
    const outPath = resolve(outValue);
    try {
      await writeFile(outPath, trailContent);
    } catch (cause) {
      process.stderr.write(
        `Error: cannot write trail to "${outPath}": ${(cause as Error).message}\n`,
      );
      process.exit(1);
    }
    process.stdout.write(`wrote trail to ${outPath}\n`);
  } else {
    // Default mode: print trail to stdout
    process.stdout.write(trailContent);
  }
}

/**
 * Renders a '## Cycles included' section listing each matched cycle ID.
 * Only emitted when --since is present.
 */
function renderCyclesIncludedSection(cycleNames: string[]): string {
  const lines: string[] = ['## Cycles included\n\n'];
  for (const name of cycleNames) {
    lines.push(`- ${name}\n`);
  }
  lines.push('\n');
  return lines.join('');
}
