## Why

Users running `claude-trail` in CI or scripted pipelines need to capture the
trail markdown as a file rather than piping stdout. Without a dedicated flag,
the only option was shell redirection, which conflicts with anything else
printed to stdout. This initiative adds a first-class `--out <path>` flag so
the file-write path is explicit, observable, and error-handled.

## What

- **`src/cli.ts`** — extended arg parsing to accept `--out <path>` (both
  `--out value` and `--out=value` forms). When `--out` is present the
  assembled trail markdown is written to the given path via
  `node:fs/promises.writeFile`; stdout receives only the confirmation line
  `wrote trail to <path>`. Without `--out`, existing stdout behavior is
  100% unchanged.
- **`tests/out-flag.test.ts`** — new integration test file (7 assertions across
  4 `describe` suites) covering all four acceptance criteria: file is written,
  stdout is exactly the confirmation line, backward compat without the flag,
  and non-zero exit + stderr on a bad path.

## How

The `--out` flag is parsed with the same loop pattern already used by
`--since`: scan `argv` from index 3 onward, match the bare flag + next-arg
form or the `=`-delimited form. The resolved path is stored in `outValue`.
After the trail is assembled, a single `if (outValue !== undefined)` branch
calls `await writeFile(outPath, trailContent)`, catching errors and emitting
them to stderr before calling `process.exit(1)`. The happy path writes
`wrote trail to ${outPath}\n` to stdout.

No new runtime dependencies were introduced. All 53 pre-existing tests
continue to pass alongside the 7 new `out-flag` tests (60 total).

### Changed files (`git diff --stat main...HEAD`)

```
src/cli.ts             |  48 ++++++++++--
tests/out-flag.test.ts | 206 +++++++++++++++++++++++++++++++++++++++++++++++++
2 files changed, 247 insertions(+), 7 deletions(-)
```

## Demo

See [demo/INIT-2026-05-25-claude-trail-out-flag/DEMO.md](../demo/INIT-2026-05-25-claude-trail-out-flag/DEMO.md)
for the full grep-and-run guide that lets a reviewer independently verify all
four acceptance criteria.
