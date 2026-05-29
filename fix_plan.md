# Fix Plan

> Checklist for WI-5. Tick items as you complete them; add items as you discover sub-problems.

- [x] AC1: GIVEN the fixture cycle directory at tests/fixtures/cycle-INIT-FIXTURE-1 (10 events) WHEN readTailEvents + formatTailText is called with n=10 THEN the output matches the expected golden lines character-for-character
- [x] AC2: GIVEN the fixture cycle directory at tests/fixtures/cycle-INIT-FIXTURE-1 (10 events) WHEN readTailEvents + formatTailText is called with n=3 THEN only the last 3 events appear in the output, matching expected golden lines
- [x] AC3: GIVEN the fixture cycle directory at tests/fixtures/cycle-INIT-FIXTURE-1 WHEN readTailEvents + formatTailJson is called with n=10 THEN the JSON output parses to an array whose length equals min(10, total-events) and the first element's phase matches the fixture's first-in-tail event
