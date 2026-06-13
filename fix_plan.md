# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems.

- [x] AC1: GIVEN a valid cycle directory with events.jsonl containing verdict='approve' and total cost $0.24 WHEN claude-trail INIT-FIXTURE-1 --compact is run THEN stdout is exactly '# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n' and exit code is 0
- [x] AC2: GIVEN CLI invoked with --compact and --format json together WHEN the CLI processes the flags THEN exit code is non-zero and stderr contains '--compact'
- [x] AC3: GIVEN CLI invoked with --compact and --out together WHEN the CLI processes the flags THEN exit code is non-zero and stderr contains '--out'
- [x] AC4: GIVEN CLI invoked with --compact and --since together WHEN the CLI processes the flags THEN exit code is non-zero and stderr contains '--since'
- [x] AC5: GIVEN a cycle directory with no cycle.end event WHEN claude-trail <id> --compact is run THEN stdout shows 'Verdict: (unknown)' and 'Cost: $0.00' and exit code is 0
- [x] AC6: GIVEN the existing INIT-FIXTURE-1 fixture WHEN claude-trail INIT-FIXTURE-1 (no --compact) is run THEN stdout matches the existing golden file INIT-FIXTURE-1.trail.golden.md byte-for-byte (trimEnd)

## Notes

- All implementation was already present in src/trail.ts (renderCompact) and src/cli.ts (--compact flag + conflict guards).
- tests/compact-flag.test.ts already exercises all 6 ACs comprehensively.
- The only missing artifact was tests/compact-smoke.test.ts (the creates: mandatory output).
- Quality gate passes: `node --test --experimental-strip-types tests/compact-smoke.test.ts` → 1 pass, 0 fail.
