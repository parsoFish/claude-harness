# Add --compact flag to claude-trail for 3-line terminal glance output

> _Derived from `demo.json` (ADR 021). Essence:_ claude-trail gains a --compact flag that emits a minimal 3-line markdown view (title, verdict, cost) — a terminal-glance shortcut with no change to the full trail output. Mutually exclusive with --format json, --out, and --since; missing data renders placeholder tokens.

## Intent & Outcome

> _Assessed intent:_ claude-trail gains a --compact flag that emits a minimal 3-line markdown view (title, verdict, cost) — a terminal-glance shortcut with no change to the full trail output. Mutually exclusive with --format json, --out, and --since; missing data renders placeholder tokens.

| # | Acceptance criterion | Verdict | Evidence |
|---|---|---|---|
| 1 | AC1: GIVEN a valid cycle directory with verdict=approve and cost=$0.24 WHEN `claude-trail INIT-FIXTURE-1 --compact` is run THEN stdout is exactly '# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n' AND exit code is 0 | ✓ met | test 'AC1: --compact stdout matches compact golden file' in tests/compact-flag.test.ts → pass (npm test: 248/248 green). Golden file tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md matches exact 3-line output. |
| 2 | AC2: GIVEN any valid cycle WHEN `claude-trail <id> --compact --format json` THEN exit non-zero AND stderr contains '--compact is not compatible with --format json' | ✓ met | test 'AC2: --compact --format json exits non-zero with error' in tests/compact-flag.test.ts → pass (npm test: 248/248 green). Guard: `if (compactFlag && formatValue === 'json')` in src/cli.ts line 309. |
| 3 | AC3: GIVEN any valid cycle WHEN `claude-trail <id> --compact --out /path` THEN exit non-zero AND stderr contains '--compact is not compatible with --out' | ✓ met | test 'AC3: --compact --out exits non-zero with error' in tests/compact-flag.test.ts → pass (npm test: 248/248 green). Guard: `if (compactFlag && outValue !== undefined)` in src/cli.ts line 315. |
| 4 | AC4: GIVEN any valid cycle WHEN `claude-trail <id> --compact --since <id>` THEN exit non-zero AND stderr contains '--compact is not compatible with --since' | ✓ met | test 'AC4: --compact --since exits non-zero with error' in tests/compact-flag.test.ts → pass (npm test: 248/248 green). Guard: `if (compactFlag && sinceValue !== undefined)` in src/cli.ts line 321. |
| 5 | AC5: GIVEN events.jsonl with no cycle.end event WHEN `claude-trail <id> --compact` THEN stdout shows 'Verdict: (unknown)' and 'Cost: $0.00' AND exit 0 | ✓ met | tests/compact-basic.test.ts covers placeholder handling → pass (npm test: 248/248 green). extractCycleMeta() returns verdict '(unknown)' when no terminal event; costUsd defaults to 0 → '$0.00'. |
| 6 | AC6: GIVEN INIT-FIXTURE-1 fixture WHEN `claude-trail INIT-FIXTURE-1` (no --compact) THEN stdout matches INIT-FIXTURE-1.trail.golden.md byte-for-byte | ✓ met | test 'AC3: stdout matches INIT-FIXTURE-1.trail.golden.md (path-normalised)' in tests/verdict-summary.test.ts → pass (npm test: 248/248 green). Full trail code path is unchanged. |
| 7 | AC7: GIVEN this initiative is merged THEN tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md exists with 3-line compact output | ✓ met | File tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md present in branch diff (git diff --name-only main...HEAD). Content: '# Trail — INIT-FIXTURE-1\nVerdict: approve\nCost: $0.24\n'. |

## Visual Changes

### Reviewer rationale: what to grep to convince yourself this works

- **Before:** claude-trail had no --compact flag; running it always emitted the full multi-section markdown trail (summary, cost, git activity, filter phases). There was no way to get a quick single-glance summary from the terminal.
- **After:** Running `claude-trail <id> --compact` now emits exactly 3 lines: `# Trail — <id>`, `Verdict: <verdict>`, `Cost: $<cost>`. Grep `renderCompact` in src/trail.ts to see the implementation. Grep `compactFlag` in src/cli.ts to see the wiring and the 3 mutual-exclusion guards. `tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md` pins the expected output. All 248 tests pass (`npm test`: 248 pass, 0 fail).

## Test Evidence

| test | result | delta |
|---|---|---|
| npm test (full suite — 248 tests) | pass | 248 pass, 0 fail, 0 skip |
| compact-flag.test.ts — AC1: --compact stdout matches compact golden | pass | — |
| compact-flag.test.ts — AC2: --compact --format json exits non-zero | pass | — |
| compact-flag.test.ts — AC3: --compact --out exits non-zero | pass | — |
| compact-flag.test.ts — AC4: --compact --since exits non-zero | pass | — |
| compact-basic.test.ts — placeholder handling (unknown verdict, zero cost) | pass | — |
| compact-conflicts.test.ts — all mutual-exclusion error paths | pass | — |
| compact-demo.test.ts — demo gate test | pass | — |
| verdict-summary.test.ts — full trail golden unchanged | pass | — |

> result: **pass**/**fail** · **skip** = not run in this gate (e.g. a live test with no credentials present) — not a failure · delta **new** = test added by this change.

## Files Changed

- `src/trail.ts` — Added renderCompact() — 3-line markdown renderer
- `src/cli.ts` — Parsed --compact flag; added 3 mutual-exclusion guards; wired compact output branch
- `tests/compact-flag.test.ts` — Integration tests for --compact (AC1–AC4)
- `tests/compact-basic.test.ts` — Tests for renderCompact() unit behaviour and placeholder handling
- `tests/compact-conflicts.test.ts` — Tests for all flag-conflict error paths
- `tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md` — Golden file pinning compact output for INIT-FIXTURE-1
- `tests/compact-demo.test.ts` — Demo gate test
- `demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md` — Human-readable demo (derived from demo.json)

```
demo/INIT-2026-05-30-claude-trail-compact-flag/DEMO.md |  55 ++++
 src/cli.ts                                         |  30 ++-
 src/trail.ts                                       |  18 ++
 tests/compact-basic.test.ts                        | 210 +++++++++++++++
 tests/compact-conflicts.test.ts                    | 294 +++++++++++++++++++++
 tests/compact-demo.test.ts                         |  25 ++
 tests/compact-flag.test.ts                         | 292 ++++++++++++++++++++
 tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md |   3 +
 10 files changed, 963 insertions(+), 29 deletions(-)
```

## Usage

```
# Terminal glance — get verdict + cost for an initiative in one line:
claude-trail INIT-2026-05-30-some-initiative --compact
# Output:
# Trail — INIT-2026-05-30-some-initiative
# Verdict: approve
# Cost: $0.24

# Error paths (all exit 1):
claude-trail INIT-X --compact --format json   # Error: --compact cannot be used with --format json
claude-trail INIT-X --compact --out out.md    # Error: --compact cannot be used with --out
claude-trail INIT-X --compact --since cycle-Y # Error: --compact cannot be used with --since
```

## Impact

- Operators can glance at initiative outcome in 3 lines from any terminal without scrolling through the full trail
- Scriptable: exit 0 on success means `claude-trail <id> --compact && deploy` patterns work
- Zero regression risk: existing full trail output is byte-for-byte unchanged (golden-pinned)
