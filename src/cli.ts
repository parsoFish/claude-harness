import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readEvents, rollupByPhase } from './events.ts';
import { renderTitle, renderSummarySection, renderPhasesSection } from './trail.ts';

const initiativeId = process.argv[2];

if (!initiativeId) {
  process.stderr.write(
    'Usage: node --experimental-strip-types src/cli.ts <initiative-id>\n',
  );
  process.exit(1);
}

// Resolve the _logs directory relative to cwd
const logsDir = resolve(process.cwd(), '_logs');

if (!existsSync(logsDir)) {
  process.stderr.write(
    `Error: _logs directory not found at "${logsDir}"\n`,
  );
  process.exit(1);
}

// Walk _logs for a sub-directory whose name contains the initiativeId
let cycleDir: string | undefined;
try {
  const entries = readdirSync(logsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.includes(initiativeId)) {
      cycleDir = join(logsDir, entry.name);
      break;
    }
  }
} catch (cause) {
  process.stderr.write(
    `Error: cannot read _logs directory "${logsDir}": ${(cause as Error).message}\n`,
  );
  process.exit(1);
}

if (!cycleDir) {
  process.stderr.write(
    `Error: no cycle directory found in "${logsDir}" for initiative "${initiativeId}"\n`,
  );
  process.exit(1);
}

const eventsPath = join(cycleDir, 'events.jsonl');
const events = readEvents(eventsPath);
const phaseMap = rollupByPhase(events);

// Derive verdict and cost from events (best-effort: look for a summary event or use defaults)
let verdict = 'unknown';
let costUsd = 0;
for (const evt of events) {
  if (typeof evt['verdict'] === 'string') verdict = evt['verdict'];
  if (typeof evt['cost_usd'] === 'number') costUsd += evt['cost_usd'];
}

process.stdout.write(renderTitle(initiativeId));
process.stdout.write(renderSummarySection(initiativeId, verdict, costUsd));
process.stdout.write(renderPhasesSection(phaseMap));
