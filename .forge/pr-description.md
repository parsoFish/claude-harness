## Why

`claude-trail` always emitted the full multi-section markdown trail — summary, cost breakdown, git activity, filter phases — with no way to get a quick single-glance answer to "did this initiative approve and what did it cost?". Operators wanting a terminal-readable verdict had to scroll or pipe-grep. A `--compact` flag delivering a 3-line markdown view addresses this directly, with no risk to existing output (golden-pinned).

## What

- **`src/trail.ts`** — new `renderCompact(initiativeId, verdict, costUsd)` function: 3-line markdown output (`# Trail — <id>`, `Verdict: <v>`, `Cost: $<c>`).
- **`src/cli.ts`** — `--compact` boolean flag parsed from argv; 3 mutual-exclusion guards (errors on `--compact --format json`, `--compact --out`, `--compact --since`); compact output branch after existing format/out checks.
- **`tests/compact-flag.test.ts`** — integration tests: compact golden match (AC1), and all three conflict-exit paths (AC2–AC4).
- **`tests/compact-basic.test.ts`** — unit tests for `renderCompact()` including placeholder tokens for missing verdict (`(unknown)`) and zero cost (`$0.00`).
- **`tests/compact-conflicts.test.ts`** — exhaustive conflict-path tests for all mutual-exclusion guards.
- **`tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md`** — golden file pinning the 3-line compact output for the INIT-FIXTURE-1 fixture.

## How

`renderCompact()` is a pure function — no async, no filesystem reads — added alongside the existing `renderTrail()`. In `cli.ts`, `--compact` is parsed from `process.argv` identically to existing flags. The mutual-exclusion checks are inline `if` guards that write to stderr and `process.exit(1)` before any cycle resolution, matching the style of the existing `--format`/`--out` conflict checks. The full trail rendering path is completely unchanged; `--compact` is an early-exit branch. All 248 tests pass (`npm test`: 248 pass, 0 fail, 0 skip).
