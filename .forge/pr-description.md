## Why

Operators running claude-trail to check on an initiative's outcome had to parse a full multi-section markdown trail or a JSON blob just to answer "did it pass and how much did it cost?" There was no quick terminal-glance option. This initiative adds a `--compact` flag that emits a minimal 3-line markdown summary — title, verdict, cost — to stdout in a single command, with no file writes and no changes to the existing output formats.

## What

- **`src/trail.ts`** — new `renderCompact(initiativeId, verdict, costUsd)` function that returns a 3-line markdown string (`# Trail — <id>`, `Verdict: <verdict>`, `Cost: $<cost>`).
- **`src/cli.ts`** — new `--compact` boolean flag; inline conflict checks that exit non-zero with descriptive errors when combined with `--format json`, `--out`, or `--since`; compact output branch wired after the checks.
- **`tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md`** — new golden file with the expected 3-line compact output for the shared fixture.
- **`tests/compact-flag.test.ts`** — new integration test file covering AC1–AC6: compact golden match, three flag-conflict error paths, placeholder handling for missing verdict/cost, and regression guard on the existing full-trail golden.

No changes to the full markdown trail output, JSON format, or any other existing behaviour.

## How

`renderCompact()` is a pure function that formats its three arguments with `toFixed(2)` for cost — no shared helper, no abstraction, per the spec's non-goals. The CLI parses `--compact` via `process.argv.slice(3).includes('--compact')` and validates conflicts against already-parsed `formatValue`, `outValue`, and `sinceValue` before cycle resolution. Missing verdict falls through from the existing `extractCycleMeta()` `(unknown)` placeholder; missing cost remains `0` (renders as `$0.00`).

All 7 acceptance criteria are covered by `tests/compact-flag.test.ts`. The existing `INIT-FIXTURE-1.trail.golden.md` golden test (AC6) confirms zero regression on the full trail path. `npm test` runs all 42 test suites green.
