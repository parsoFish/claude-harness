# DEMO — INIT-2026-05-30-claude-trail-compact-flag

## AC1: --compact outputs 3-line markdown

**Before** (full trail, no --compact):

```
# Trail — INIT-FIXTURE-1
## Summary

Initiative **INIT-FIXTURE-1** completed with verdict: **approve**. Total cost: $0.24.

Verdict: approve
```

**After** (--compact):

```
# Trail — INIT-FIXTURE-1
Verdict: approve
Cost: $0.24
```

## AC2: --compact --format json → non-zero exit

**Command**: `claude-trail INIT-FIXTURE-1 --compact --format json`
**stderr**: `Error: --compact cannot be used with --format json; these flags are mutually exclusive.`
**exit code**: 1

## AC3: --compact --out → non-zero exit

**Command**: `claude-trail INIT-FIXTURE-1 --compact --out /tmp/out.md`
**stderr**: `Error: --compact cannot be used with --out; these flags are mutually exclusive.`
**exit code**: 1

## AC4: --compact --since → non-zero exit

**Command**: `claude-trail INIT-FIXTURE-1 --compact --since cycle-INIT-FIXTURE-1`
**stderr**: `Error: --compact cannot be used with --since; these flags are mutually exclusive.`
**exit code**: 1

## AC5: Placeholder for missing data

**Input**: events.jsonl with no cycle.end event
**Output**:
```
# Trail — <id>
Verdict: (unknown)
Cost: $0.00
```

## AC6: Full trail unchanged

**Command**: `claude-trail INIT-FIXTURE-1` (no --compact)
**Result**: stdout matches INIT-FIXTURE-1.trail.golden.md byte-for-byte ✓
