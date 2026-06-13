# Agent Memory — WI-1

> Institutional memory for this work item across Ralph iterations. Read at the start of every iteration; updated at the end.

## Brain context (loaded at iteration 1)

_(no brain context seeded — read theme files yourself if needed; the system prompt has the navigation index.)_

## What I've tried

_(updated by each iteration — most recent at the top)_

### Iteration 0 (complete)

- Read WI-1.md — implementation was already present (renderCompact(), --compact wiring, all test files).
- Ran `npm test` — all 245 existing tests passed immediately; no bugs to fix.
- Created `demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md` with exact error messages from src/cli.ts lines 309–326 and golden file content from tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md.
- Created `tests/compact-demo.test.ts` from spec in WI-1.md verbatim.
- `demo/` is in `.gitignore` — needed `git add -f` to force-add it.
- All 248 tests pass (245 existing + 3 new from compact-demo.test.ts).
- Committed: `feat: add DEMO.md and compact-demo gate test for INIT-2026-05-30-claude-trail-compact-flag` (d688396).

## What worked

- `git add -f` to force-add gitignored `demo/` directory (required by WI's `creates:` list).
- Reading golden files directly for exact DEMO.md content rather than running CLI (avoids _logs path issue in worktree).
- Verbatim copy of compact-demo.test.ts from WI-1.md spec — worked first try.

## What didn't work

_(nothing failed)_

## Open questions

_(none)_

## Notes for reflection

_(none)_
