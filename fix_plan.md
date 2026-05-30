# Fix Plan

> Checklist for WI-2. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN a valid cycle directory WHEN the CLI is invoked with both `--compact` and `--format json` THEN exit code is non-zero and stderr contains both '--compact' and 'json'
- [ ] AC2: GIVEN a valid cycle directory WHEN the CLI is invoked with both `--compact` and `--out /some/path` THEN exit code is non-zero and stderr contains both '--compact' and '--out'
- [ ] AC3: GIVEN a valid cycle directory WHEN the CLI is invoked with both `--compact` and `--since some-cycle-id` THEN exit code is non-zero and stderr contains both '--compact' and '--since'
- [ ] AC4: GIVEN a valid cycle directory with a cycle.end event WHEN the CLI is invoked with `--compact` alone (no conflicting flags) THEN exit code is 0 and stdout is the 3-line compact output (regression guard)
