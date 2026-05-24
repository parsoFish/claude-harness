# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [ ] AC1 (WI-1): GIVEN a cycle events.jsonl where cycle.end has metadata fields verdict and outcome WHEN extractCycleMeta is called with those events THEN it returns an object with verdict and outcome matching those metadata values
- [ ] AC2 (WI-1): GIVEN a cycle events.jsonl where cycle.end has no verdict or outcome fields WHEN extractCycleMeta is called with those events THEN it returns verdict: "(unknown)" and outcome: "(unknown)"
- [ ] AC3 (WI-1): GIVEN the fixture events.jsonl has verdict: "approve" and outcome: "merged" on cycle.end, and the golden summary includes Verdict and Outcome lines WHEN the CLI is spawned against the fixture THEN stdout matches the updated golden file byte-for-byte (path-normalised)
