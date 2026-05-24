# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [ ] AC1 (WI-1): GIVEN tests/fixtures/cycle-INIT-FIXTURE-1/.forge/_pr-metadata.json exists with url, title, state fields WHEN the CLI is invoked against the fixture THEN stdout contains a '## PR' section positioned between '## Git activity' and '## Themes consulted'
- [ ] AC2 (WI-1): GIVEN tests/fixtures/cycle-INIT-FIXTURE-1/.forge/_pr-metadata.json exists WHEN the CLI is invoked against the fixture THEN stdout matches the updated INIT-FIXTURE-1.trail.golden.md byte-for-byte (after path normalisation)
- [ ] AC3 (WI-1): GIVEN no .forge/_pr-metadata.json exists in cwd WHEN the CLI is invoked THEN the '## PR' section is absent from stdout and no error is emitted
