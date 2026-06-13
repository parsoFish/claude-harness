## Why

Terminal-glance checks of a cycle's verdict and cost required scrolling through the full markdown trail (dozens of lines). Operators reviewing cycles at the CLI need a quick `approve / $0.24` answer, not a full document. The `--compact` flag provides a focused 3-line view designed for pipelines, tmux status bars, and quick sanity checks — the canonical trail output is not touched.

## What

- `src/trail.ts` — new `renderCompact(initiativeId, verdict, costUsd)` export returning exactly 3 lines: `# Trail — <id>`, `Verdict: <v>`, `Cost: $<n>`.
- `src/cli.ts` — `--compact` boolean flag parsed from argv; mutual-exclusion guards reject `--compact --format json`, `--compact --out`, and `--compact --since` with descriptive stderr messages and non-zero exit; compact rendering wired into the markdown output branch.
- `tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md` — golden file pinning the exact 3-line output for the INIT-FIXTURE-1 fixture (verdict: approve, cost: $0.24).
- `tests/compact-flag.test.ts` — 4 integration tests covering AC1–AC4 (golden match, json conflict, out conflict, since conflict).
- `tests/compact-basic.test.ts`, `tests/compact-conflicts.test.ts` — additional unit coverage on the implementation.
- `tests/compact-smoke.test.ts` — end-to-end smoke test added on this branch.

## How

`renderCompact` is a pure function in `trail.ts` — same module as all other renderers. The CLI parses `--compact` after all other flags so conflict guards can reference already-parsed `formatValue`, `outValue`, and `sinceValue`. Placeholder handling is free: `extractCycleMeta()` already returns `'(unknown)'` when no `cycle.end` event exists; missing cost accumulates to `0` which renders as `$0.00`.

All 246 tests pass (`npm test`). The existing golden file `INIT-FIXTURE-1.trail.golden.md` is byte-for-byte unchanged.
