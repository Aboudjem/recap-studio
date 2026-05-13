# Workflows

## Quick start

```bash
pnpm install
pnpm demo:latest-ai-models
pnpm validate:demo
pnpm --filter recap-web dev
```

## /recap topic

```
/recap "Latest AI models"
/recap topic "Quantum computing" --depth beginner --research balanced
/recap topic "Startup fundraising" --style dark --animation medium
```

1. Parse intent and load `RecapStudioConfig`.
2. research-scout → source-librarian.
3. learning-architect emits a draft `RecapPageContent`.
4. visual-story-designer adds `VisualPlan`.
5. frontend-builder writes `apps/recap-web/src/content/<slug>.json`.
6. Validation board runs in parallel; failing dimensions trigger patches.
7. Build (if local pnpm install succeeded). Otherwise the run completes
   with a documented blocker.
8. Final report prints (see template below).

## /recap session

```
/recap session
/recap session --deep
```

1. Read-only git commands enumerate the session.
2. repo-session-analyst builds `SessionDelta` (and `redactedPaths`).
3. learning-architect adapts to the session schema.
4. Rest mirrors topic mode, plus a privacy pass.

## /recap setup

Writes `recap-studio.config.ts` with safe defaults. Refuses to enable
deploy/email automatically.

## /recap validate

Re-runs the deterministic checks. Skips reviewers via `--only fact-checker,...`
for fast turn-around after patches.

## Final report format

Print this block at the end of every `/recap` run:

```markdown
## Recap Studio — run report
- Mode: topic | session
- Topic / ref: "..."
- Files written:
  - apps/recap-web/src/content/<slug>.json
  - apps/recap-web/src/app/page.tsx (touched? yes/no)
  - <other paths>
- Commands run:
  - pnpm demo:latest-ai-models  (exit 0/1)
  - pnpm validate:demo          (exit 0/1)
  - pnpm --filter recap-web build (exit 0/1 or blocked)
- Validation scores:
  | dim | score | target | status |
  ...
- Blockers (if any):
- Demo command: `pnpm demo:latest-ai-models`
- Deploy: see `docs/vercel-deployment.md`. Off by default.
- Email: see `docs/configuration.md`. Off by default.
- Env vars consulted: VERCEL_TOKEN (no), RESEND_API_KEY (no), ...
- Known limitations: ...
```
