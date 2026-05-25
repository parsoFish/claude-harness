# Fix Plan

> Checklist for WI-4. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a list of cycle event arrays and a FilterSpec array containing { key: 'phase', value: 'reflection' } WHEN filterCycles(cycleEventsList, filters) is called THEN only cycles that satisfy all supplied filters are returned
- [ ] AC2: GIVEN a filters array that is empty WHEN filterCycles(cycleEventsList, []) is called THEN all cycles are returned unchanged
- [ ] AC3: GIVEN a filters array containing both a phase filter and a status filter WHEN filterCycles is called with cycles where only some satisfy both filters THEN only cycles satisfying BOTH conditions are returned (AND semantics)
