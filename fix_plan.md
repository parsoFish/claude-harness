# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN a cycle events.jsonl where cycle.end has metadata fields verdict and outcome WHEN extractCycleMeta is called with those events THEN it returns an object with verdict and outcome matching those metadata values
- [ ] AC2: GIVEN a cycle events.jsonl where cycle.end has no verdict or outcome fields WHEN extractCycleMeta is called with those events THEN it returns verdict: "(unknown)" and outcome: "(unknown)"
- [ ] AC3: GIVEN the fixture events.jsonl has verdict: "approve" and outcome: "merged" on cycle.end, and the golden summary includes Verdict and Outcome lines WHEN the CLI is spawned against the fixture THEN stdout matches the updated golden file byte-for-byte (path-normalised)
