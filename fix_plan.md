# Fix Plan

> Checklist for WI-3. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a cycle's events contain at least one event whose 'status' field is 'done' (or the terminal event carries status 'done' as a top-level field) WHEN matchStatus({ key: 'status', value: 'done' }, cycleEvents) is called THEN the function returns true
- [ ] AC2: GIVEN a cycle's events carry no 'status' field equal to 'done' WHEN matchStatus({ key: 'status', value: 'done' }, cycleEvents) is called THEN the function returns false
- [ ] AC3: GIVEN an empty events array WHEN matchStatus({ key: 'status', value: 'done' }, []) is called THEN the function returns false
