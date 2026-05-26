# Fix Plan

> Checklist for WI-3. Tick items as you complete them; add items as you discover sub-problems.

- [x] AC1: GIVEN a Record<string, number> with phase counts including a 'total' key WHEN formatStatsJson is called with that record THEN it returns a JSON string that, when parsed, equals the input record exactly (same keys and values)
- [x] AC2: GIVEN a record {architect: 12, 'project-manager': 8, total: 20} WHEN formatStatsJson is called THEN the returned string is valid JSON and JSON.parse of it produces {architect: 12, 'project-manager': 8, total: 20}
- [x] AC3: GIVEN an empty record {} WHEN formatStatsJson is called THEN the returned string is '{}'
