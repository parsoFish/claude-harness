# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN a valid events.jsonl path with 15 events WHEN readTailEvents(path, 10) is called THEN it returns exactly the last 10 EventRecord objects in chronological order (oldest first)
- [ ] AC2: GIVEN a valid events.jsonl path with 5 events WHEN readTailEvents(path, 10) is called with N larger than total count THEN it returns all 5 events (no error, no padding)
- [ ] AC3: GIVEN a valid events.jsonl path with 0 non-blank lines WHEN readTailEvents(path, 10) is called THEN it returns an empty array
- [ ] AC4: GIVEN a path that does not exist WHEN readTailEvents is called THEN it throws an Error whose message contains the path
