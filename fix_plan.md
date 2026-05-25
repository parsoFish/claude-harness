# Fix Plan

> Checklist for WI-2. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a ProbeResult object with initiativeId='INIT-abc', totalEvents=47, phaseCount=6, dominantPhase='developer-loop', dominantCount=22 WHEN formatProbeSummary() is called with that object THEN it returns exactly the string 'INIT-abc: 47 events, 6 phases, dominant=developer-loop (22 events)'
- [ ] AC2: GIVEN a ProbeResult where dominantPhase is an empty string and dominantCount is 0 WHEN formatProbeSummary() is called THEN it returns a string matching '<initiativeId>: <N> events, 0 phases, dominant= (0 events)' without throwing
- [ ] AC3: GIVEN a ProbeResult with totalEvents=1, phaseCount=1, dominantCount=1 WHEN formatProbeSummary() is called THEN it returns a string with singular counts rendered correctly (no plural vs singular branching required — the format spec uses bare numbers)
