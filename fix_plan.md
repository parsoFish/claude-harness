# Fix Plan

> Checklist for WI-4. Tick items as you complete them; add items as you discover sub-problems.

- [x] AC1: GIVEN a valid cycle directory path containing an events.jsonl with 12 events WHEN claude-trail tail <cycle-dir> is run THEN stdout contains exactly 10 lines in '[phase] event_type' format and the exit code is 0
- [x] AC2: GIVEN a valid cycle directory with 12 events WHEN claude-trail tail --n 3 <cycle-dir> is run THEN stdout contains exactly 3 lines and the exit code is 0
- [x] AC3: GIVEN a valid cycle directory with 5 events WHEN claude-trail tail --json <cycle-dir> is run THEN stdout is a valid JSON array with 5 elements and the exit code is 0
- [x] AC4: GIVEN a cycle directory whose events.jsonl contains 3 events WHEN claude-trail tail --n 10 <cycle-dir> is run THEN stdout contains exactly 3 lines (N larger than count; no crash)
