# Fix Plan

> Checklist for WI-1. Tick items as you complete them; add items as you discover sub-problems. The orchestrator uses this list (count of unchecked items) to detect when the loop is wedged.

- [ ] AC1: GIVEN tests/fixtures/cycle-INIT-FIXTURE-1/.forge/_pr-metadata.json exists with url, title, state fields WHEN the CLI is invoked against the fixture THEN stdout contains a '## PR' section positioned between '## Git activity' and '## Themes consulted'
- [ ] AC2: GIVEN tests/fixtures/cycle-INIT-FIXTURE-1/.forge/_pr-metadata.json exists WHEN the CLI is invoked against the fixture THEN stdout matches the updated INIT-FIXTURE-1.trail.golden.md byte-for-byte (after path normalisation)
- [ ] AC3: GIVEN no .forge/_pr-metadata.json exists in cwd WHEN the CLI is invoked THEN the '## PR' section is absent from stdout and no error is emitted
