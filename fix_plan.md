# Fix Plan

> Checklist for WI-2. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [x] AC1: GIVEN a cycle whose events include at least one event with phase 'reflection' WHEN matchPhase({ key: 'phase', value: 'reflection' }, cycleEvents) is called THEN the function returns true
- [x] AC2: GIVEN a cycle whose events contain no event with phase 'reflection' WHEN matchPhase({ key: 'phase', value: 'reflection' }, cycleEvents) is called THEN the function returns false
- [x] AC3: GIVEN an empty events array WHEN matchPhase({ key: 'phase', value: 'any' }, []) is called THEN the function returns false
