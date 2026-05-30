## Why

Reading a full `claude trail` document (with ## Summary, ## Phases, ## Cost rollup, ## Git activity sections) is cumbersome when you just want to check verdict and cost — e.g. from a CI status script or a quick glance. There was no terse, machine-friendly output mode. This initiative adds `--compact`, a single-purpose flag that collapses the trail to three lines: title, verdict, and cost.

## What

- **`src/trail.ts`** — new `renderCompact(initiativeId, verdict, costUsd)` function that returns the exact 3-line format: `# Trail — <id>\nVerdict: <v>\nCost: $<c>\n`.
- **`src/cli.ts`** — `--compact` boolean flag parsed from argv; compact/non-compact output branches; three mutual-exclusion guards (`--compact` + `--format json`, `--compact` + `--out`, `--compact` + `--since`) each exit non-zero with an explanatory stderr message naming both conflicting flags.
- **`tests/compact-basic.test.ts`** (210 lines) — unit tests for `renderCompact` covering approve verdicts, unknown verdicts, zero cost, fractional cost.
- **`tests/compact-conflicts.test.ts`** (294 lines) — CLI integration tests for all three mutual-exclusion combinations (exit code + stderr content).
- **`tests/compact-flag.test.ts`** (292 lines) — end-to-end CLI tests using the INIT-FIXTURE-1 fixture: golden-file comparison, conflict flags from fixture dir, and regression guard that the non-compact output is unchanged.
- **`tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md`** (3 lines) — compact output golden file; used as the byte-for-byte reference in AC7/AC8.

All 245 tests pass (`npm test`). 12 acceptance criteria across 3 work items are green.

## How

`renderCompact` in `src/trail.ts` is a pure function — it receives the already-parsed `initiativeId`, `verdict`, and `costUsd` values (the same ones used by the full markdown render path) and formats them with `Array.join('\n')`. No new parsing, no new I/O.

In `src/cli.ts` the `--compact` flag is detected with `process.argv.slice(3).includes('--compact')`. The three conflict guards run immediately after flag parsing (before any file I/O) and call `process.exit(1)` with an unambiguous stderr message. The compact output branch reuses `extractCycleMeta` and the existing cost accumulation loop — no duplicated logic.

The golden file is produced by running the CLI against the INIT-FIXTURE-1 fixture (verdict=approve, two 0.12 USD events → $0.24 total) and is committed verbatim. The test reads it with `readFileSync` and compares stdout with `trimEnd()` to avoid trailing-newline noise.

## Demo

See [demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md](../demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md).
