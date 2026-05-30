## Why

Long AI conversation trails are hard to review. The raw `claude trail` output includes all intermediate reasoning steps, repeated tool calls, and assistant "thinking" noise — making it impractical to share trails for code review or archival. The `--compact` flag gives users a clean, conflict-free summary they can actually read.

## What

- New `--compact` CLI flag on `claude trail` (WI-1: `src/cli.ts`)
- Compact summarisation logic in `src/trail.ts` — collapses duplicate tool calls, strips intermediate reasoning, surfaces only meaningful user/assistant exchanges
- Conflict-resolution pass that deterministically handles duplicate tool invocations (WI-3)
- Golden-file regression test for compact output format
- Three new test suites: `tests/compact-basic.test.ts`, `tests/compact-conflicts.test.ts`, `tests/compact-flag.test.ts` (874 lines of coverage)

## How

The compact pass is implemented as a post-processing step in `src/trail.ts`. After parsing a trail file, if `--compact` is requested:
1. Tool calls are deduplicated by a stable key (tool name + input hash); only the last result is kept.
2. Intermediate assistant reasoning blocks (without tool use) are dropped.
3. Remaining turns are re-serialised into the compact markdown format (golden-file at `tests/fixtures/...`).

The CLI (`src/cli.ts`) wires the new `--compact` boolean option through to the trail parser and exits cleanly when the flag is absent (no behaviour change for existing users).

## Demo

See [demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md](../demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md).
