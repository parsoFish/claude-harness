# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [ ] AC1 (WI-1): GIVEN an events.jsonl file with events across multiple phases WHEN probeCore() is called with the path to that file THEN it returns an object with totalEvents count, phaseCount, and dominantPhase (the phase with the most events) plus its event count
- [ ] AC2 (WI-1): GIVEN an events.jsonl where two phases have equal event counts WHEN probeCore() is called THEN it returns one of the tied phases as dominantPhase without throwing
- [ ] AC3 (WI-1): GIVEN an empty events.jsonl (zero records) WHEN probeCore() is called THEN it returns totalEvents=0, phaseCount=0, and dominantPhase as an empty string or null sentinel
- [ ] AC4 (WI-2): GIVEN a ProbeResult object with initiativeId='INIT-abc', totalEvents=47, phaseCount=6, dominantPhase='developer-loop', dominantCount=22 WHEN formatProbeSummary() is called with that object THEN it returns exactly the string 'INIT-abc: 47 events, 6 phases, dominant=developer-loop (22 events)'
- [ ] AC5 (WI-2): GIVEN a ProbeResult where dominantPhase is an empty string and dominantCount is 0 WHEN formatProbeSummary() is called THEN it returns a string matching '<initiativeId>: <N> events, 0 phases, dominant= (0 events)' without throwing
- [ ] AC6 (WI-2): GIVEN a ProbeResult with totalEvents=1, phaseCount=1, dominantCount=1 WHEN formatProbeSummary() is called THEN it returns a string with singular counts rendered correctly (no plural vs singular branching required — the format spec uses bare numbers)
- [ ] AC7 (WI-3): GIVEN a cycle log directory containing a valid events.jsonl with known content WHEN claude-trail probe <cycle-dir> is invoked via node --experimental-strip-types src/cli.ts probe <cycle-dir> THEN stdout contains exactly one line matching '<initiative-id>: <N> events, <M> phases, dominant=<phase> (<K> events)' and the process exits 0
- [ ] AC8 (WI-3): GIVEN a path that does not exist is passed as the cycle-dir argument WHEN claude-trail probe <nonexistent-path> is invoked THEN the process exits non-zero and prints an error to stderr
- [ ] AC9 (WI-3): GIVEN the existing test suite (baseline.test.ts, events.test.ts, cli.test.ts, trail.test.ts, etc.) is run WHEN npm test is executed after this WI is merged THEN all pre-existing tests continue to pass (no regressions from cli.ts modification)
