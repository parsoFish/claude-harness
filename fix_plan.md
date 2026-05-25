# Fix Plan

> Checklist for WI-6. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a fixture cycles-dir containing two cycle subdirs (one matching phase:reflection, one not) WHEN the CLI is invoked with '--filter phase:reflection <fixture-cycles-dir>' and stdout is captured THEN the output matches the content of 'tests/fixtures/filter-golden.txt' exactly (golden file comparison)
- [ ] AC2: GIVEN the golden fixture file 'tests/fixtures/filter-golden.txt' is updated to reflect a deliberate output change WHEN the golden test is re-run THEN the test passes with the new fixture and fails with the old one
- [ ] AC3: GIVEN all 184 pre-existing tests in the test suite WHEN npm test is run after all WI-1 through WI-6 changes are merged THEN all tests pass with exit code 0
