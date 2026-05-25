# Fix Plan

> Checklist for WI-5. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN process.argv contains '--filter phase:reflection' before a cycles-dir argument WHEN the CLI is invoked in filter mode (cycles-dir as first positional after any flags) THEN only cycles whose events include a 'reflection' phase are printed to stdout, one summary line each
- [ ] AC2: GIVEN process.argv contains '--filter phase:reflection' and '--filter status:done' WHEN the CLI is invoked with two cycle subdirs, only one of which satisfies both filters THEN exactly one cycle summary line is written to stdout
- [ ] AC3: GIVEN process.argv contains no '--filter' flags and a valid cycles-dir WHEN the CLI is invoked in filter mode THEN all cycle subdirs in the directory produce a summary line (no filtering applied)
