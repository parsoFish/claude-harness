# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [x] AC1 (WI-1): GIVEN a CLI invocation with '--out /tmp/trail.md' and a valid initiative + _logs fixture WHEN the command runs successfully THEN the file at /tmp/trail.md is written with the full trail markdown content
- [x] AC2 (WI-1): GIVEN a CLI invocation with '--out /tmp/trail.md' and a valid initiative + _logs fixture WHEN the command runs successfully THEN stdout contains exactly the line 'wrote trail to /tmp/trail.md' and nothing else
- [x] AC3 (WI-1): GIVEN a CLI invocation WITHOUT '--out' and a valid initiative + _logs fixture WHEN the command runs successfully THEN stdout contains the full trail markdown (regression: existing behaviour unchanged)
- [x] AC4 (WI-1): GIVEN a CLI invocation with '--out /nonexistent-dir/trail.md' where the parent directory does not exist WHEN the command attempts to write the file THEN the process exits with a non-zero exit code and stderr contains an error message
