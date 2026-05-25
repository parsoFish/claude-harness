# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN an events.jsonl file with events across multiple phases WHEN probeCore() is called with the path to that file THEN it returns an object with totalEvents count, phaseCount, and dominantPhase (the phase with the most events) plus its event count
- [ ] AC2: GIVEN an events.jsonl where two phases have equal event counts WHEN probeCore() is called THEN it returns one of the tied phases as dominantPhase without throwing
- [ ] AC3: GIVEN an empty events.jsonl (zero records) WHEN probeCore() is called THEN it returns totalEvents=0, phaseCount=0, and dominantPhase as an empty string or null sentinel
