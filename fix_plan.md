# Fix Plan — unifier sub-phase

> Initiative-level acceptance criteria. Tick each as you prove it against branch tip. Iteration 1 is initial prep; iterations 2+ react to either gate failures or send-back feedback.

- [x] AC1 (WI-1): GIVEN a valid events.jsonl path with 15 events WHEN readTailEvents(path, 10) is called THEN it returns exactly the last 10 EventRecord objects in chronological order (oldest first)
- [x] AC2 (WI-1): GIVEN a valid events.jsonl path with 5 events WHEN readTailEvents(path, 10) is called with N larger than total count THEN it returns all 5 events (no error, no padding)
- [x] AC3 (WI-1): GIVEN a valid events.jsonl path with 0 non-blank lines WHEN readTailEvents(path, 10) is called THEN it returns an empty array
- [x] AC4 (WI-1): GIVEN a path that does not exist WHEN readTailEvents is called THEN it throws an Error whose message contains the path
- [x] AC5 (WI-2): GIVEN an array of EventRecord objects each with phase, event, and optional detail fields WHEN formatTailText(events) is called THEN it returns a newline-joined string where each line is '[<phase>] <event_type>' with optional ' <detail>' appended when a detail field is present
- [x] AC6 (WI-2): GIVEN an empty EventRecord array WHEN formatTailText([]) is called THEN it returns an empty string
- [x] AC7 (WI-2): GIVEN an event with phase='developer-loop' and event='wi.start' and no extra fields WHEN formatTailText([event]) is called THEN the line is '[developer-loop] wi.start' (no trailing space or extra tokens)
- [x] AC8 (WI-2): GIVEN an event with phase='developer-loop' and event='wi.start' and work_item_id='FEAT-1-WI-1' WHEN formatTailText([event]) is called THEN the line is '[developer-loop] wi.start FEAT-1-WI-1'
- [x] AC9 (WI-3): GIVEN an array of EventRecord objects WHEN formatTailJson(events) is called THEN it returns a valid JSON string that parses to an array of the same event objects
- [x] AC10 (WI-3): GIVEN an empty EventRecord array WHEN formatTailJson([]) is called THEN it returns the string '[]'
- [x] AC11 (WI-3): GIVEN two EventRecord objects in insertion order WHEN formatTailJson(events) is called and the result is parsed THEN the parsed array has length 2 and index 0 matches the first event object exactly
- [x] AC12 (WI-4): GIVEN a valid cycle directory path containing an events.jsonl with 12 events WHEN claude-trail tail <cycle-dir> is run THEN stdout contains exactly 10 lines in '[phase] event_type' format and the exit code is 0
- [x] AC13 (WI-4): GIVEN a valid cycle directory with 12 events WHEN claude-trail tail --n 3 <cycle-dir> is run THEN stdout contains exactly 3 lines and the exit code is 0
- [x] AC14 (WI-4): GIVEN a valid cycle directory with 5 events WHEN claude-trail tail --json <cycle-dir> is run THEN stdout is a valid JSON array with 5 elements and the exit code is 0
- [x] AC15 (WI-4): GIVEN a cycle directory whose events.jsonl contains 3 events WHEN claude-trail tail --n 10 <cycle-dir> is run THEN stdout contains exactly 3 lines (N larger than count; no crash)
- [x] AC16 (WI-5): GIVEN the fixture cycle directory at tests/fixtures/cycle-INIT-FIXTURE-1 (10 events) WHEN readTailEvents + formatTailText is called with n=10 THEN the output matches the expected golden lines character-for-character
- [x] AC17 (WI-5): GIVEN the fixture cycle directory at tests/fixtures/cycle-INIT-FIXTURE-1 (10 events) WHEN readTailEvents + formatTailText is called with n=3 THEN only the last 3 events appear in the output, matching expected golden lines
- [x] AC18 (WI-5): GIVEN the fixture cycle directory at tests/fixtures/cycle-INIT-FIXTURE-1 WHEN readTailEvents + formatTailJson is called with n=10 THEN the JSON output parses to an array whose length equals min(10, total-events) and the first element's phase matches the fixture's first-in-tail event
- [x] AC19 (WI-6): GIVEN a path to a directory that does not exist WHEN claude-trail tail <nonexistent-dir> is invoked via the CLI entry point THEN the process exits with a non-zero code and stderr contains a human-readable error message (no stack trace)
- [x] AC20 (WI-6): GIVEN a path to a directory that exists but contains no events.jsonl WHEN claude-trail tail <empty-dir> is invoked THEN the process exits non-zero and stderr contains a message referencing the missing events.jsonl
- [x] AC21 (WI-6): GIVEN a path to a file that exists but is not a directory WHEN claude-trail tail <file-path> is invoked THEN the process exits non-zero and stderr contains a clear error (no stack trace)
- [x] AC22 (WI-6): GIVEN a valid cycle directory whose events.jsonl contains zero non-blank lines WHEN claude-trail tail <cycle-dir> is invoked THEN stdout is empty (or a single blank line) and the process exits 0
