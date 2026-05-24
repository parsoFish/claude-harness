# Demo — INIT-2026-05-25-claude-trail-out-flag

> Demo shape: **none** (infra-only CLI change; no browser, no rendered UI)
>
> This document explains what a reviewer should grep/inspect to be confident
> the `--out <path>` flag works correctly.

## What shipped

`src/cli.ts` now accepts an `--out <path>` flag. When present:

- The trail markdown is written to the given file via `node:fs/promises.writeFile`.
- Only `wrote trail to <path>` is printed to stdout.
- The markdown does **not** appear on stdout.

Without `--out`, the original stdout behavior is entirely unchanged.

## How to convince yourself this works

### 1 — Read the arg-parsing block in `src/cli.ts`

```
grep -n '\-\-out' src/cli.ts
```

Lines 32–44 define a `for` loop mirroring the `--since` loop directly above
it; it populates `outValue`. At lines 162–177, `outValue` gates the write-path
vs. the print-path.

### 2 — Run the dedicated test file

```
node --test --experimental-strip-types tests/out-flag.test.ts
```

Expected output: **4 suites, 7 assertions, 0 failures**.

The test file covers:

| AC  | Test description |
|-----|------------------|
| AC1 | File is written and contains `## Summary` + initiative ID |
| AC2 | stdout is exactly `wrote trail to <path>` (two sub-cases) |
| AC3 | Without `--out`, stdout still contains full trail (backward compat) |
| AC4 | Nonexistent parent dir → non-zero exit + stderr contains "error" |

### 3 — Run the full test suite (regression check)

```
npm test
```

Expected: **60 tests pass, 0 failures**. The 53 pre-existing tests are
preserved alongside the 7 new `out-flag` tests.

### 4 — Spot-check the git diff

```
git diff --stat main...HEAD
```

Only two files changed:

- `src/cli.ts` — 48 lines added (arg-parsing + write branch)
- `tests/out-flag.test.ts` — 206 lines (new test file, as required by the WI)

No other files were modified; no new runtime dependencies were introduced.
