# Agent Memory — WI-5

> Institutional memory for this work item across Ralph iterations. Read at the start of every iteration; updated at the end.

## Brain context (loaded at iteration 1)

_(no brain context seeded — read theme files yourself if needed; the system prompt has the navigation index.)_

## What I've tried

### Iteration 1 (complete)

- Read the fixture at `tests/fixtures/cycle-INIT-FIXTURE-1/events.jsonl` — confirmed 10 events.
- Read `src/tail.ts` to understand `readTailEvents`, `formatTailText`, `formatTailJson` signatures.
- Checked existing test patterns from `tests/tail-text-formatter.test.ts` and `tests/filter-golden.test.ts`.
- Wrote `tests/tail-golden.test.ts` with all 3 ACs in a single `describe` block.
- Ran `node --test --experimental-strip-types tests/tail-golden.test.ts` — 3/3 pass.
- Committed as `test: add tail golden tests for readTailEvents + formatTailText/Json (WI-5)`.

## What worked

- **Reading the fixture directly** to derive golden strings rather than computing them — avoids logic errors.
- **Inline golden constants** (GOLDEN_TEXT_N10, GOLDEN_TEXT_N3_FULL) as string arrays joined with `\n` — readable and exact.
- **Asserting both length and content** for each AC — belt-and-suspenders.
- `import.meta.dirname` with `join(process.cwd(), 'tests'), '..'` fallback for ROOT resolution — same pattern used in filter-golden.test.ts.

## What didn't work

_(no dead ends encountered in iteration 1)_

## Open questions

_(none)_

## Notes for reflection

- All 3 ACs completed in a single iteration (estimated was 2). The WI was well-specified: knowing the exact fixture content and the function signatures meant golden strings could be derived without ambiguity.
- `work_item_id` field in fixture events uses the key exactly as `formatTailText` expects — no aliasing issues.
