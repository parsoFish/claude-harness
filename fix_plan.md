# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [ ] AC1 (WI-1): GIVEN a valid cycle directory with events.jsonl containing a cycle.end event with verdict='approve' and cost_usd 0.12 each for developer and cycle.end phases WHEN the CLI is invoked as `node --experimental-strip-types src/cli.ts INIT-FIXTURE-1 --compact` from a tmpdir containing the INIT-FIXTURE-1 fixture THEN stdout is exactly `# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n` and exit code is 0
- [ ] AC2 (WI-1): GIVEN a cycle directory whose events.jsonl has no cycle.end event (no verdict, no cost) WHEN the CLI is invoked with `--compact` THEN stdout shows `Verdict: (unknown)` on line 2 and `Cost: $0.00` on line 3, and exit code is 0
- [ ] AC3 (WI-2): GIVEN a valid cycle directory WHEN the CLI is invoked with both `--compact` and `--format json` THEN exit code is non-zero and stderr contains both '--compact' and 'json'
- [ ] AC4 (WI-2): GIVEN a valid cycle directory WHEN the CLI is invoked with both `--compact` and `--out /some/path` THEN exit code is non-zero and stderr contains both '--compact' and '--out'
- [ ] AC5 (WI-2): GIVEN a valid cycle directory WHEN the CLI is invoked with both `--compact` and `--since some-cycle-id` THEN exit code is non-zero and stderr contains both '--compact' and '--since'
- [ ] AC6 (WI-2): GIVEN a valid cycle directory with a cycle.end event WHEN the CLI is invoked with `--compact` alone (no conflicting flags) THEN exit code is 0 and stdout is the 3-line compact output (regression guard)
- [ ] AC7 (WI-3): GIVEN the fixture cycle-INIT-FIXTURE-1 with verdict=approve and total cost $0.24 WHEN the CLI is run with `INIT-FIXTURE-1 --compact` from a tmpdir containing that fixture THEN stdout matches tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md byte-for-byte (trimEnd comparison)
- [ ] AC8 (WI-3): GIVEN the compact golden file exists at tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md WHEN its content is inspected THEN it contains exactly 3 non-empty lines: '# Trail — INIT-FIXTURE-1', 'Verdict: approve', 'Cost: $0.24'
- [ ] AC9 (WI-3): GIVEN the CLI is invoked with `INIT-FIXTURE-1 --compact --format json` WHEN run from a tmpdir containing the INIT-FIXTURE-1 fixture THEN exit code is non-zero and stderr mentions '--compact'
- [ ] AC10 (WI-3): GIVEN the CLI is invoked with `INIT-FIXTURE-1 --compact --out /tmp/x.md` WHEN run from a tmpdir containing the INIT-FIXTURE-1 fixture THEN exit code is non-zero and stderr mentions '--out'
- [ ] AC11 (WI-3): GIVEN the CLI is invoked with `INIT-FIXTURE-1 --compact --since some-id` WHEN run from a tmpdir containing the INIT-FIXTURE-1 fixture THEN exit code is non-zero and stderr mentions '--since'
- [ ] AC12 (WI-3): GIVEN the INIT-FIXTURE-1 fixture is run WITHOUT --compact WHEN `claude-trail INIT-FIXTURE-1` is executed THEN stdout matches the existing golden file INIT-FIXTURE-1.trail.golden.md byte-for-byte (full trail unchanged)
