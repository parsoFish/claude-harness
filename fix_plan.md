# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems.

- [x] AC1: GIVEN the worktree already contains renderCompact() in src/trail.ts and --compact wiring in src/cli.ts WHEN npm test is run THEN all tests pass with exit code 0, including tests/compact-flag.test.ts, tests/compact-basic.test.ts, and tests/compact-conflicts.test.ts
- [x] AC2: GIVEN the INIT-FIXTURE-1 fixture (verdict=approve, cost=$0.24) WHEN claude-trail INIT-FIXTURE-1 --compact is run in a tmpdir with _logs/cycle-INIT-FIXTURE-1/ THEN stdout is exactly: # Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n and exit code is 0
- [x] AC3: GIVEN the initiative INIT-2026-05-30-claude-trail-compact-flag is complete WHEN demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md is read THEN it exists and shows before/after for each AC: full trail unchanged without --compact, compact 3-line output with --compact, and each error-path conflict
