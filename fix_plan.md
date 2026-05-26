# Fix Plan

> Checklist for WI-2. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN a Record<string, number> with phase counts including a 'total' key, produced by countEventsByPhase WHEN formatStatsText is called with that record THEN it returns a string with a two-column table: left column is phase name, right column is the event count, with a header row 'phase' / 'events', phases listed in the order they appear in the record, and 'total' on the last row
- [ ] AC2: GIVEN a record where the longest phase name is 'developer-loop' (13 chars) WHEN formatStatsText is called THEN the left column is padded so all lines align and the output matches the spec format shown in the initiative manifest
- [ ] AC3: GIVEN a record with a single phase plus total WHEN formatStatsText is called THEN the output is a valid two-row table (header + 1 phase + total) with correct padding
