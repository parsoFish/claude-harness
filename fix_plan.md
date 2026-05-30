# Fix Plan

> Checklist for WI-3. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN the fixture cycle-INIT-FIXTURE-1 with verdict=approve and total cost $0.24 WHEN the CLI is run with `INIT-FIXTURE-1 --compact` from a tmpdir containing that fixture THEN stdout matches tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md byte-for-byte (trimEnd comparison)
- [ ] AC2: GIVEN the compact golden file exists at tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md WHEN its content is inspected THEN it contains exactly 3 non-empty lines: '# Trail — INIT-FIXTURE-1', 'Verdict: approve', 'Cost: $0.24'
- [ ] AC3: GIVEN the CLI is invoked with `INIT-FIXTURE-1 --compact --format json` WHEN run from a tmpdir containing the INIT-FIXTURE-1 fixture THEN exit code is non-zero and stderr mentions '--compact'
- [ ] AC4: GIVEN the CLI is invoked with `INIT-FIXTURE-1 --compact --out /tmp/x.md` WHEN run from a tmpdir containing the INIT-FIXTURE-1 fixture THEN exit code is non-zero and stderr mentions '--out'
- [ ] AC5: GIVEN the CLI is invoked with `INIT-FIXTURE-1 --compact --since some-id` WHEN run from a tmpdir containing the INIT-FIXTURE-1 fixture THEN exit code is non-zero and stderr mentions '--since'
- [ ] AC6: GIVEN the INIT-FIXTURE-1 fixture is run WITHOUT --compact WHEN `claude-trail INIT-FIXTURE-1` is executed THEN stdout matches the existing golden file INIT-FIXTURE-1.trail.golden.md byte-for-byte (full trail unchanged)
