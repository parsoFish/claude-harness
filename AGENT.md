# Unifier Agent Memory — INIT-2026-05-30-claude-trail-compact-flag

> Institutional memory across unifier-Ralph iterations. Read at the start of every iteration; updated at the end.

## What I tried

_(updated by each iteration — most recent at the top)_

### Iteration 1 (2026-06-07)

- Read manifest, WI-1 spec, AGENT.md, fix_plan.md.
- Ran `npm test` — all 42 test suites green (no quality gate failures).
- Confirmed per-WI commits already on branch: `18318c7 feat: add --compact flag to claude-trail` + `793220b chore: update AGENT.md and fix_plan.md`.
- Authored `demo/INIT-2026-05-30-claude-trail-compact-flag/demo.json` — full schema with all 7 acEvaluations (all `met`), summary, apiDiff, testEvidence, filesChanged, usage_example, impact.
- Fixed `apiDiff[0].before: null` → `"(did not exist)"` (renderer's `looksLikeJson` crashed on null).
- Ran `forge demo render INIT-2026-05-30-claude-trail-compact-flag --dir <worktree>/demo/...` — emitted DEMO.md + DEMO.html successfully.
- Wrote `.forge/pr-description.md` with substantive Why/What/How sections (no `## Demo`).
- Force-added demo/ and .forge/ (both in .gitignore) plus AGENT.md/fix_plan.md.
- Committed as `feat(INIT-2026-05-30-claude-trail-compact-flag): unify and demo` and pushed.

### Key gotcha for future iterations

- `forge demo render` always resolves `demo/<id>` relative to the forge root (`/home/parso/forge`), NOT the worktree. Must pass `--dir <absolute-worktree-path>/demo/<id>`.
- `demo/` and `.forge/` are in `.gitignore`; use `git add -f` to track the demo artefacts.
- `apiDiff[].before` and `apiDiff[].after` must be non-null strings — the HTML renderer calls `.trim()` on them without a null guard.

## Notes for reflection

- The `forge demo render --dir` flag is the correct mechanism for worktree-relative demo paths. Document this in the demo skill for future unifiers.
- The `looksLikeJson` null crash is a latent bug in `cli/demo-html.ts` — worth raising as a hardening ticket.
