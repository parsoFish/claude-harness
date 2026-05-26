# Fix Plan

> Checklist for WI-5. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN the fixture at tests/fixtures/cycle-INIT-FIXTURE-1/ is passed to 'claude-trail stats' WHEN the stats golden test runs THEN stdout matches the content of tests/fixtures/stats-golden.txt exactly (byte-for-byte after trimming trailing newline)
- [ ] AC2: GIVEN the fixture at tests/fixtures/cycle-INIT-FIXTURE-1/ is passed to 'claude-trail stats --json' WHEN the stats JSON golden test runs THEN stdout is valid JSON and the parsed object matches the expected per-phase counts for the INIT-FIXTURE-1 events
- [ ] AC3: GIVEN the golden file tests/fixtures/stats-golden.txt exists WHEN the text-format output of running stats on the fixture is compared to it THEN the comparison passes with no diff
