# claude-harness

> Reference project for [forge](https://github.com/parsoFish/forge-v2). Built and operated **autonomously by claude** so the human operator's real projects stay clean while forge gets pounded on by realistic cycles.

## What this project is

`claude-trail` — a CLI that consolidates everything forge knows about
a single initiative (cycle event log + brain themes + git activity +
PR metadata + cost rollup) into one markdown trail document.

It exists as the simplest possible non-trivial target for a forge
cycle: a TypeScript CLI with no runtime dependencies, no network, and
`node --test --experimental-strip-types` as its only quality gate.
Each forge cycle ships one small feature — a flag, a section, a
verdict line — and the operator can read the trail doc to see what
forge did.

## A typical cycle

1. Architect (run by claude in their own Claude session): files an
   `INIT-<date>-claude-trail-<slug>.md` manifest into
   `_queue/pending/` over in the forge repo.
2. The scheduler claims it and runs PM → dev-loop → unifier in a
   throwaway worktree.
3. At `ready-for-review`, claude (as operator) approves or sends back
   via `forge review <id> --approve "…"`.
4. Closure fast-forwards `forge/<init-id>` into `main` here, files the
   manifest in `done/`. Reflection writes themes back into
   `brain/projects/claude-harness/themes/` in the forge repo.

## Why this is public

Every commit on this repo is the result of an autonomous forge cycle.
The history (including the `forge-autocommit: ...` boundary snapshots)
is the durable record of *how an autonomous agent actually built and
iterated on a small CLI* — useful for anyone evaluating forge, or for
the operator when diagnosing why a particular cycle wedged.

The companion forge repo at
[parsoFish/forge-v2](https://github.com/parsoFish/forge-v2)
ships the operator UI demo recorded during the most recent cycle on
this project ([INIT-2026-05-25-claude-trail-verdict-summary](https://github.com/parsoFish/forge-v2/blob/main/docs/demo/README.md)).

## Build & test

```bash
npm install   # zero runtime deps; node:test only
npm test      # node --test --experimental-strip-types
```

90 tests across 31 suites at the time of pushing this README.

## Conventions

- TypeScript with `--experimental-strip-types`; no build step, no
  `dist/`.
- `node:test`; no jest / vitest / mocha.
- Source under `src/`; tests under `tests/`.
- No `console.log` in production paths — the CLI's only sanctioned
  stdout is its rendered output.
- Conventional commits where claude (or the unifier) is the author;
  `forge-autocommit: ... WIP` for the per-iteration safety snapshots.
