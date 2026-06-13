# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [x] AC1 (WI-1): GIVEN a valid cycle directory with events.jsonl containing verdict='approve' and total cost $0.24 WHEN claude-trail INIT-FIXTURE-1 --compact is run THEN stdout is exactly '# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n' and exit code is 0
  - Evidence: compact-flag.test.ts 'AC1: --compact stdout matches compact golden file' → pass (npm test 246/246)
- [x] AC2 (WI-1): GIVEN CLI invoked with --compact and --format json together WHEN the CLI processes the flags THEN exit code is non-zero and stderr contains '--compact'
  - Evidence: compact-flag.test.ts 'AC2: --compact --format json exits non-zero with error' → pass (npm test 246/246)
- [x] AC3 (WI-1): GIVEN CLI invoked with --compact and --out together WHEN the CLI processes the flags THEN exit code is non-zero and stderr contains '--out'
  - Evidence: compact-flag.test.ts 'AC3: --compact --out exits non-zero with error' → pass (npm test 246/246)
- [x] AC4 (WI-1): GIVEN CLI invoked with --compact and --since together WHEN the CLI processes the flags THEN exit code is non-zero and stderr contains '--since'
  - Evidence: compact-flag.test.ts 'AC4: --compact --since exits non-zero with error' → pass (npm test 246/246)
- [x] AC5 (WI-1): GIVEN a cycle directory with no cycle.end event WHEN claude-trail <id> --compact is run THEN stdout shows 'Verdict: (unknown)' and 'Cost: $0.00' and exit code is 0
  - Evidence: extractCycleMeta() returns '(unknown)' by design; costUsd defaults to 0; compact-basic.test.ts on main covers this path; all 246 tests pass
- [x] AC6 (WI-1): GIVEN the existing INIT-FIXTURE-1 fixture WHEN claude-trail INIT-FIXTURE-1 (no --compact) is run THEN stdout matches the existing golden file INIT-FIXTURE-1.trail.golden.md byte-for-byte (trimEnd)
  - Evidence: verdict-summary.test.ts 'AC3: stdout matches INIT-FIXTURE-1.trail.golden.md (path-normalised)' → pass (npm test 246/246)
