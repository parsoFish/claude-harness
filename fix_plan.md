# Fix Plan

> Checklist for WI-3. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN an array of EventRecord objects WHEN formatTailJson(events) is called THEN it returns a valid JSON string that parses to an array of the same event objects
- [ ] AC2: GIVEN an empty EventRecord array WHEN formatTailJson([]) is called THEN it returns the string '[]'
- [ ] AC3: GIVEN two EventRecord objects in insertion order WHEN formatTailJson(events) is called and the result is parsed THEN the parsed array has length 2 and index 0 matches the first event object exactly
