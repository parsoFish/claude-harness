# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [ ] AC1 (WI-1): GIVEN argv contains '--filter phase:reflection' WHEN parseFilters(argv) is called THEN the returned array contains { key: 'phase', value: 'reflection' }
- [ ] AC2 (WI-1): GIVEN argv contains '--filter phase:reflection' and '--filter status:done' WHEN parseFilters(argv) is called THEN the returned array contains two entries: { key: 'phase', value: 'reflection' } and { key: 'status', value: 'done' }
- [ ] AC3 (WI-1): GIVEN argv contains '--filter badformat' (no colon) WHEN parseFilters(argv) is called THEN the function throws an error mentioning the malformed filter token
- [ ] AC4 (WI-1): GIVEN argv contains no '--filter' flags WHEN parseFilters(argv) is called THEN the returned array is empty
- [ ] AC5 (WI-2): GIVEN a cycle whose events include at least one event with phase 'reflection' WHEN matchPhase({ key: 'phase', value: 'reflection' }, cycleEvents) is called THEN the function returns true
- [ ] AC6 (WI-2): GIVEN a cycle whose events contain no event with phase 'reflection' WHEN matchPhase({ key: 'phase', value: 'reflection' }, cycleEvents) is called THEN the function returns false
- [ ] AC7 (WI-2): GIVEN an empty events array WHEN matchPhase({ key: 'phase', value: 'any' }, []) is called THEN the function returns false
- [ ] AC8 (WI-3): GIVEN a cycle's events contain at least one event whose 'status' field is 'done' (or the terminal event carries status 'done' as a top-level field) WHEN matchStatus({ key: 'status', value: 'done' }, cycleEvents) is called THEN the function returns true
- [ ] AC9 (WI-3): GIVEN a cycle's events carry no 'status' field equal to 'done' WHEN matchStatus({ key: 'status', value: 'done' }, cycleEvents) is called THEN the function returns false
- [ ] AC10 (WI-3): GIVEN an empty events array WHEN matchStatus({ key: 'status', value: 'done' }, []) is called THEN the function returns false
- [ ] AC11 (WI-4): GIVEN a list of cycle event arrays and a FilterSpec array containing { key: 'phase', value: 'reflection' } WHEN filterCycles(cycleEventsList, filters) is called THEN only cycles that satisfy all supplied filters are returned
- [ ] AC12 (WI-4): GIVEN a filters array that is empty WHEN filterCycles(cycleEventsList, []) is called THEN all cycles are returned unchanged
- [ ] AC13 (WI-4): GIVEN a filters array containing both a phase filter and a status filter WHEN filterCycles is called with cycles where only some satisfy both filters THEN only cycles satisfying BOTH conditions are returned (AND semantics)
- [ ] AC14 (WI-5): GIVEN process.argv contains '--filter phase:reflection' before a cycles-dir argument WHEN the CLI is invoked in filter mode (cycles-dir as first positional after any flags) THEN only cycles whose events include a 'reflection' phase are printed to stdout, one summary line each
- [ ] AC15 (WI-5): GIVEN process.argv contains '--filter phase:reflection' and '--filter status:done' WHEN the CLI is invoked with two cycle subdirs, only one of which satisfies both filters THEN exactly one cycle summary line is written to stdout
- [ ] AC16 (WI-5): GIVEN process.argv contains no '--filter' flags and a valid cycles-dir WHEN the CLI is invoked in filter mode THEN all cycle subdirs in the directory produce a summary line (no filtering applied)
- [ ] AC17 (WI-6): GIVEN a fixture cycles-dir containing two cycle subdirs (one matching phase:reflection, one not) WHEN the CLI is invoked with '--filter phase:reflection <fixture-cycles-dir>' and stdout is captured THEN the output matches the content of 'tests/fixtures/filter-golden.txt' exactly (golden file comparison)
- [ ] AC18 (WI-6): GIVEN the golden fixture file 'tests/fixtures/filter-golden.txt' is updated to reflect a deliberate output change WHEN the golden test is re-run THEN the test passes with the new fixture and fails with the old one
- [ ] AC19 (WI-6): GIVEN all 184 pre-existing tests in the test suite WHEN npm test is run after all WI-1 through WI-6 changes are merged THEN all tests pass with exit code 0
