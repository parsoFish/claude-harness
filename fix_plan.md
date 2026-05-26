# Fix Plan

> Checklist for WI-4. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN a valid cycle directory path is passed as the argument to 'claude-trail stats' WHEN the command is run without --json THEN the process exits 0 and stdout contains the text table produced by formatStatsText with the correct per-phase counts for that cycle directory
- [ ] AC2: GIVEN a valid cycle directory path is passed with the --json flag WHEN the command 'claude-trail stats --json <cycle-dir>' is run THEN the process exits 0 and stdout is a single-line JSON object with per-phase counts and a 'total' key, matching formatStatsJson output
- [ ] AC3: GIVEN the 'stats' subcommand is invoked with no cycle-dir argument WHEN the CLI is run THEN the process exits 1 and stderr contains a usage hint
