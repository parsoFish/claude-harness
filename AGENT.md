# Unifier Agent Memory — INIT-2026-05-30-claude-trail-compact-flag

> Institutional memory across unifier-Ralph iterations. Read at the start of every iteration; updated at the end.

## What I tried

_(updated by each iteration — most recent at the top)_

### Iteration 1 (unifier packaging)

- Read WI-1.md, initiative manifest, AGENT.md (fresh), fix_plan.md (fresh).
- Observed: `git diff main...HEAD` showed only 3 files: AGENT.md, fix_plan.md, tests/compact-smoke.test.ts. The core implementation (src/cli.ts, src/trail.ts, tests/compact-flag.test.ts, tests/compact-basic.test.ts, tests/compact-conflicts.test.ts, tests/fixtures/INIT-FIXTURE-1.trail-compact.golden.md) was already committed to **main** by prior dev-loop iterations — NOT in the branch diff. This is expected: the per-WI dev loop committed these files.
- Ran `npm test` → 246 pass, 0 fail. Quality gate green.
- Wrote `demo/INIT-2026-05-30-claude-trail-compact-flag/demo.json` with full acEvaluations (all 6 ACs), testEvidence, filesChanged, summary.
- Wrote `.forge/pr-description.md` with substantive Why/What/How sections. No `## Demo` section.
- Ran `forge demo render INIT-2026-05-30-claude-trail-compact-flag --dir <absolute-path>` from `/home/parso/forge` (necessary because pm-invocation.ts is a top-level import that resolves SKILL.md relative to process.cwd() — must run from forge root to find skills/project-manager/SKILL.md).
- Force-added demo/ and .forge/pr-description.md (both gitignored; `-f` required).
- Committed as `feat(INIT-2026-05-30-claude-trail-compact-flag): unify and demo`.
- Pushed branch to origin.
- Updated fix_plan.md with all ACs ticked.

## Notes for reflection

_(observations the reflector should capture into the brain)_

- `forge demo render` must be run from the forge root (`/home/parso/forge`), not from the worktree, because `pm-invocation.ts` is a top-level ESM import in cli.ts. At module import time, `process.cwd()` is the worktree; `deriveAgentSpec` uses `process.cwd()` as root to resolve `skills/project-manager/SKILL.md`, which doesn't exist in the worktree. Using `--dir <absolute-path>` flag with forge root as cwd resolves this.
- The gitignore in this project excludes `demo/` and `.forge/`. The unifier must use `git add -f` to track these files.
