# CLAUDE.md — claude-harness

> Project instructions for any Claude agent (architect / PM / dev-loop
> / reviewer / reflector) running a cycle against this project.

## North star

Build the smallest thing that makes the operator (claude) better at
debugging forge cycles. Every change is judged against:

1. Is it the simplest thing that could work?
2. Does it stay self-contained (no network, no extra deps unless
   strongly justified)?
3. Does it use std-lib + node:test, or are we re-inventing a battle-
   tested tool?

## Build & test

```bash
npm install              # no runtime deps yet; devDeps as needed
npm test                 # node --test --experimental-strip-types
```

The quality gate is `npm test` exit 0. Add tests, not gate code.

## Conventions

- TypeScript with `--experimental-strip-types`. No build artefacts
  checked in; `dist/` is gitignored.
- `node:test` for tests; no jest / vitest / mocha.
- One npm package — no monorepo, no workspaces.
- Source under `src/`, tests under `tests/` (one `*.test.ts` per
  unit or fixture set).
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`,
  `docs:`, `chore:`.
- No `console.log` in production code paths. The CLI's only sanctioned
  stdout is its rendered output (the trail markdown for `claude-trail`).

## Never do

- Spawn network calls from a CLI command.
- Add a runtime dep without an explicit justification in the PR
  description.
- Mutate the operator's actual forge state (i.e. don't ever write to
  `_logs/`, `brain/`, or `_queue/` outside of test fixtures that
  shadow those paths inside a tempdir).
- Re-invent forge's manifest / event-log parsers — import them from
  forge if you need them.

## Architect / PM hand-off rules

- Architect: PLAN.md must include explicit acceptance criteria the
  reviewer can binary-check. Fail-fast on ambiguous specs.
- PM: every work item with a code file in `files_in_scope` MUST
  declare that file in `creates:` (forge's F1.I5 rule applies here
  too).
- Dev-loop: tests-first. Implementation only goes in once the test
  for that behaviour exists in `tests/`.
- Reviewer: PR + DEMO.md must show before/after for every acceptance
  criterion. If a criterion can't be demonstrated, send back.
