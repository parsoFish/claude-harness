# Fix Plan

> Checklist for WI-2. Tick items as you complete them; add items as you discover sub-problems.

- [ ] AC1: GIVEN an array of EventRecord objects each with phase, event, and optional detail fields WHEN formatTailText(events) is called THEN it returns a newline-joined string where each line is '[<phase>] <event_type>' with optional ' <detail>' appended when a detail field is present
- [ ] AC2: GIVEN an empty EventRecord array WHEN formatTailText([]) is called THEN it returns an empty string
- [ ] AC3: GIVEN an event with phase='developer-loop' and event='wi.start' and no extra fields WHEN formatTailText([event]) is called THEN the line is '[developer-loop] wi.start' (no trailing space or extra tokens)
- [ ] AC4: GIVEN an event with phase='developer-loop' and event='wi.start' and work_item_id='FEAT-1-WI-1' WHEN formatTailText([event]) is called THEN the line is '[developer-loop] wi.start FEAT-1-WI-1'
