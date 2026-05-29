# Demo — INIT-2026-05-29-claude-trail-verify-cascade-v4

## Shape: none (infra-only — no browser/UI change)

This initiative adds a `claude-trail tail` subcommand that streams the last N
events from a cycle's `events.jsonl` to stdout. No visual rendering or browser
surface changed; the demo below describes what a reviewer would grep/run to
convince themselves this works.

---

## What to verify

### 1. Core library (`src/tail.ts`)

```
grep -n 'readTailEvents\|formatTailText\|formatTailJson' src/tail.ts
```

Expect three exported functions:
- `readTailEvents(filePath, n)` — reads JSONL, returns last N `EventRecord`s
  in chronological order; throws an `Error` whose message contains the path
  on missing files.
- `formatTailText(events)` — returns `[<phase>] <event>[ <work_item_id>]`
  lines joined by `\n`; empty array → empty string.
- `formatTailJson(events)` — returns `JSON.stringify(events)`; empty → `'[]'`.

### 2. CLI integration (`src/cli.ts`)

```
grep -n "'tail'" src/cli.ts | head -5
```

Expect the `tail` subcommand block to handle `--n`, `--json`, path validation
(directory-not-found → non-zero + stderr; no events.jsonl → non-zero + stderr;
path-is-file → non-zero + stderr).

### 3. Test suite (203 pass, 0 fail)

```
npm test 2>&1 | tail -8
```

Expected output:
```
# tests 203
# suites 66
# pass 203
# fail 0
```

Relevant test files:
| File | What it covers |
|---|---|
| `tests/tail-parser.test.ts` | `readTailEvents` — 15-event slice, N>count, empty file, missing file |
| `tests/tail-text-formatter.test.ts` | `formatTailText` — AC5–AC8 |
| `tests/tail-json-formatter.test.ts` | `formatTailJson` — AC9–AC11 |
| `tests/tail-cli.test.ts` | `claude-trail tail` CLI — AC12–AC15 |
| `tests/tail-golden.test.ts` | Golden file comparison on fixture — AC16–AC18 |
| `tests/tail-edge.test.ts` | CLI error paths — AC19–AC22 |

### 4. Fixture

```
cat tests/fixtures/cycle-INIT-FIXTURE-1/events.jsonl | wc -l
```

Expect 10 lines (10 events). Used by golden + edge-case tests.

### 5. Quick manual smoke-test

```bash
node --experimental-strip-types src/cli.ts tail \
  tests/fixtures/cycle-INIT-FIXTURE-1
```

Expect 10 `[phase] event_type` lines on stdout, exit 0.

```bash
node --experimental-strip-types src/cli.ts tail --n 3 \
  tests/fixtures/cycle-INIT-FIXTURE-1
```

Expect 3 lines (last 3 events), exit 0.

```bash
node --experimental-strip-types src/cli.ts tail --json \
  tests/fixtures/cycle-INIT-FIXTURE-1
```

Expect a single-line JSON array of 10 objects, exit 0.

---

All 22 acceptance criteria across WI-1 through WI-6 are exercised by the test
suite and verified green on the initiative branch tip.
