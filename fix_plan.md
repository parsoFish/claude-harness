# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a valid _logs directory with a cycle for INIT-X WHEN claude-trail INIT-X --format json is invoked THEN stdout is valid JSON containing top-level keys: initiativeId, outcome, verdict, totalCostUsd, phases, themes, filesTouched, commits, pr, costByPhase
- [ ] AC2: GIVEN a valid _logs directory with a cycle for INIT-X WHEN claude-trail INIT-X is invoked without --format (or with --format markdown) THEN stdout begins with '# Trail' and existing markdown behaviour is preserved
- [ ] AC3: GIVEN the --format flag is passed an unrecognised value (e.g. --format xml) WHEN claude-trail INIT-X --format xml is invoked THEN the CLI exits non-zero and prints an error to stderr
