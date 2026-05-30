# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN a valid cycle directory with events.jsonl containing a cycle.end event with verdict='approve' and cost_usd summing to $0.24 WHEN claude-trail INIT-FIXTURE-1 --compact is run THEN stdout is exactly '# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n' and exit code is 0
- [ ] AC2: GIVEN a valid cycle directory with events.jsonl that has no cycle.end event WHEN claude-trail <id> --compact is run THEN stdout shows 'Verdict: (unknown)' and 'Cost: $0.00' and exit code is 0
- [ ] AC3: GIVEN claude-trail is called without --compact WHEN INIT-FIXTURE-1 is rendered THEN stdout matches the existing INIT-FIXTURE-1.trail.golden.md byte-for-byte (full trail unchanged)
