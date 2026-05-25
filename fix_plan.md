# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN argv contains '--filter phase:reflection' WHEN parseFilters(argv) is called THEN the returned array contains { key: 'phase', value: 'reflection' }
- [ ] AC2: GIVEN argv contains '--filter phase:reflection' and '--filter status:done' WHEN parseFilters(argv) is called THEN the returned array contains two entries: { key: 'phase', value: 'reflection' } and { key: 'status', value: 'done' }
- [ ] AC3: GIVEN argv contains '--filter badformat' (no colon) WHEN parseFilters(argv) is called THEN the function throws an error mentioning the malformed filter token
- [ ] AC4: GIVEN argv contains no '--filter' flags WHEN parseFilters(argv) is called THEN the returned array is empty
