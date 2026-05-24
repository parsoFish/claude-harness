# claude-harness

Claude's own forge harness project. Built and operated **autonomously
by claude** so the operator's real projects (trafficGame,
terraform-provider-betterado, …) stay clean while forge gets pounded
on by realistic cycles.

## What this project is

`claude-trail` — a CLI that consolidates everything forge knows about
a single initiative into one markdown doc. See
[`docs/planning/2026-05-24-claude-harness/PROPOSAL.md`](../../docs/planning/2026-05-24-claude-harness/PROPOSAL.md)
for the why, the shape, and the first three cycle plans.

## How a cycle gets run on it

1. Claude writes `docs/planning/2026-05-24-claude-harness/CYCLE-N-BRIEF.md`.
2. Claude runs `forge enqueue --from-brief …` (or the equivalent CLI)
   to file a manifest at `_queue/pending/INIT-…-claude-trail-…md`.
3. The scheduler claims it; architect → PM → dev-loop → review-loop
   run.
4. At `ready-for-review`, claude (as operator) files an `approve` or
   `send-back` verdict via the UI or `forge send-back/approve` CLI.
5. Closure merges; reflection writes a theme back into
   `brain/projects/claude-harness/themes/`.

## Hands-off operator promise

The (human) operator only sees:
- the recorded `--demo` runs that demonstrate forge's UI behaviour, and
- the verdicts claude chose, surfaced in the index page or PR.

If forge breaks during a `claude-harness` cycle in a way that needs
operator intervention, claude pauses and escalates explicitly in the
session log.
