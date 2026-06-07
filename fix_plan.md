# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [x] AC1 (WI-1): GIVEN a valid cycle directory with events.jsonl containing a cycle.end event with verdict='approve' and total cost $0.24 WHEN claude-trail INIT-FIXTURE-1 --compact is run THEN stdout is exactly '# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n' and exit code is 0
- [x] AC2 (WI-1): GIVEN any valid cycle directory WHEN claude-trail <id> --compact --format json is run THEN exit code is non-zero and stderr contains '--compact is not compatible with --format json'
- [x] AC3 (WI-1): GIVEN any valid cycle directory WHEN claude-trail <id> --compact --out /path/to/file is run THEN exit code is non-zero and stderr contains '--compact is not compatible with --out'
- [x] AC4 (WI-1): GIVEN any valid cycle directory WHEN claude-trail <id> --compact --since <cycle-id> is run THEN exit code is non-zero and stderr contains '--compact is not compatible with --since'
- [x] AC5 (WI-1): GIVEN a cycle directory with events.jsonl that has no cycle.end event WHEN claude-trail <id> --compact is run THEN stdout shows 'Verdict: (unknown)' and 'Cost: $0.00' and exit code is 0
- [x] AC6 (WI-1): GIVEN the existing INIT-FIXTURE-1 fixture WHEN claude-trail INIT-FIXTURE-1 (no --compact) is run THEN stdout matches the existing golden file INIT-FIXTURE-1.trail.golden.md byte-for-byte
- [x] AC7 (WI-1): GIVEN this initiative is merged WHEN the tests/fixtures directory is listed THEN tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md exists with the 3-line compact output
