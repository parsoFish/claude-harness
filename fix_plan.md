# Fix Plan

> Checklist for WI-3. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a cycle log directory containing a valid events.jsonl with known content WHEN claude-trail probe <cycle-dir> is invoked via node --experimental-strip-types src/cli.ts probe <cycle-dir> THEN stdout contains exactly one line matching '<initiative-id>: <N> events, <M> phases, dominant=<phase> (<K> events)' and the process exits 0
- [ ] AC2: GIVEN a path that does not exist is passed as the cycle-dir argument WHEN claude-trail probe <nonexistent-path> is invoked THEN the process exits non-zero and prints an error to stderr
- [ ] AC3: GIVEN the existing test suite (baseline.test.ts, events.test.ts, cli.test.ts, trail.test.ts, etc.) is run WHEN npm test is executed after this WI is merged THEN all pre-existing tests continue to pass (no regressions from cli.ts modification)
