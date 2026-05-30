# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN a valid cycle directory with events.jsonl containing a cycle.end event with verdict='approve' and cost_usd 0.12 each for developer and cycle.end phases WHEN the CLI is invoked as `node --experimental-strip-types src/cli.ts INIT-FIXTURE-1 --compact` from a tmpdir containing the INIT-FIXTURE-1 fixture THEN stdout is exactly `# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n` and exit code is 0
- [ ] AC2: GIVEN a cycle directory whose events.jsonl has no cycle.end event (no verdict, no cost) WHEN the CLI is invoked with `--compact` THEN stdout shows `Verdict: (unknown)` on line 2 and `Cost: $0.00` on line 3, and exit code is 0
