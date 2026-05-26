# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN an events.jsonl file with events from multiple phases (architect, project-manager, developer-loop) WHEN countEventsByPhase is called with the path to that file THEN it returns a record mapping each phase name to the count of events in that phase, plus a 'total' key with the sum
- [ ] AC2: GIVEN an events.jsonl where one phase has 3 events and another has 2 WHEN countEventsByPhase is called THEN the returned record has the correct per-phase counts and total equals 5
- [ ] AC3: GIVEN an events.jsonl containing only blank lines and valid JSON lines WHEN countEventsByPhase is called THEN blank lines are skipped and only valid events contribute to the count
