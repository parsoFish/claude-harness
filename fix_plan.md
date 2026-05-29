# Fix Plan

> Checklist for WI-6. Tick items as you complete them; add items as you discover sub-problems.

- [x] AC1: GIVEN a path to a directory that does not exist WHEN claude-trail tail <nonexistent-dir> is invoked via the CLI entry point THEN the process exits with a non-zero code and stderr contains a human-readable error message (no stack trace)
- [x] AC2: GIVEN a path to a directory that exists but contains no events.jsonl WHEN claude-trail tail <empty-dir> is invoked THEN the process exits non-zero and stderr contains a message referencing the missing events.jsonl
- [x] AC3: GIVEN a path to a file that exists but is not a directory WHEN claude-trail tail <file-path> is invoked THEN the process exits non-zero and stderr contains a clear error (no stack trace)
- [x] AC4: GIVEN a valid cycle directory whose events.jsonl contains zero non-blank lines WHEN claude-trail tail <cycle-dir> is invoked THEN stdout is empty (or a single blank line) and the process exits 0
