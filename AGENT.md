# Unifier Agent Memory — INIT-2026-05-30-claude-trail-compact-flag

> Institutional memory across unifier-Ralph iterations. Read at the start of every iteration; updated at the end.

## What I tried

_(updated by each iteration — most recent at the top)_

### Iteration 1 (unifier)

- Read WI-1.md, fix_plan.md, AGENT.md, manifest. Verified git log: all per-WI dev work already committed (src/cli.ts, src/trail.ts, compact tests, golden file).
- Ran `npm test` → 248 pass, 0 fail, 0 skip. Gate green.
- Wrote `demo/INIT-2026-05-30-claude-trail-compact-flag/demo.json` (all 7 ACs evaluated with concrete test evidence).
- Ran `renderDemoBundle` directly via node (forge demo render fails from worktree CWD due to pm-invocation.ts module-load CWD issue — workaround: call renderDemoBundle directly). DEMO.md + DEMO.html rendered successfully.
- Wrote `.forge/pr-description.md` (substantive Why/What/How; no ## Demo section).
- Force-added all files (demo/ and .forge/ are gitignored; -f required).
- Committed as `feat(INIT-2026-05-30-claude-trail-compact-flag): unify and demo`.
- Pushed to origin — branches in sync.

## Notes for reflection

_(observations the reflector should capture into the brain)_

- **`forge demo render` fails from worktree CWD**: `pm-invocation.ts` is imported as a module-level side-effect and calls `deriveAgentSpec('skills/project-manager/SKILL.md', process.cwd())` before `cli.ts` can `process.chdir(FORGE_ROOT)`. Workaround: call `renderDemoBundle` directly via `node --experimental-strip-types -e "import ... renderDemoBundle(...)"`. This is repeatable and safe.
