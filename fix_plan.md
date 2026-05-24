# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [ ] AC1 (WI-1): GIVEN a valid _logs directory with a cycle for INIT-X WHEN claude-trail INIT-X --format json is invoked THEN stdout is valid JSON containing top-level keys: initiativeId, outcome, verdict, totalCostUsd, phases, themes, filesTouched, commits, pr, costByPhase
- [ ] AC2 (WI-1): GIVEN a valid _logs directory with a cycle for INIT-X WHEN claude-trail INIT-X is invoked without --format (or with --format markdown) THEN stdout begins with '# Trail' and existing markdown behaviour is preserved
- [ ] AC3 (WI-1): GIVEN the --format flag is passed an unrecognised value (e.g. --format xml) WHEN claude-trail INIT-X --format xml is invoked THEN the CLI exits non-zero and prints an error to stderr
