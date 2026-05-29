# Changelog

All notable changes to Recap Studio are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Vercel deploy fails on pnpm workspace.** `scripts/deploy-preview.sh`
  and `scripts/deploy-prod.sh` now build locally with `vercel build` and
  upload with `vercel deploy --prebuilt`, bypassing the remote `npm install`
  that chokes on `workspace:*` deps in `apps/recap-web`. See
  `docs/known-issues.md#vercel-monorepo-pnpm`.
- **Silent fallback when active slug has no content file.**
  `apps/recap-web/src/lib/content.ts` and `scripts/validate.mjs` now emit
  a loud `console.warn` instead of quietly rendering the fixture page.
  See `docs/known-issues.md#active-slug-silent-fallback`.

### Added

- **`scripts/vercel-set-public.sh`** — opt-in helper to toggle Vercel's
  project-level Deployment Protection (`ssoProtection`). Defaults to
  disabling SSO so `*.vercel.app` preview URLs are publicly readable.
  Requires `RECAP_USER_CONFIRMED_PUBLIC=1`. Documented in
  `docs/vercel-deployment.md#deployment-protection-sso-gate` and
  `docs/known-issues.md#vercel-sso-protection`.
- **`docs/known-issues.md`** — living catalog of bugs and surprises with
  their guardrails. Single source of truth so future sessions don't
  re-debug the same things.
- **Email FROM guidance.** `docs/configuration.md` now documents the
  `onboarding@resend.dev` sandbox sender as the fallback when
  `RESEND_API_KEY` is restricted to send-only (can't list verified
  domains). See `docs/known-issues.md#resend-restricted-key-fallback`.
- **Cold-build cost note.** `docs/vercel-deployment.md` calls out the
  ~10 min cold `vercel build` time so it's not a surprise.
- **Plugin-cache write target guardrail.**
  `skills/recap-topic/SKILL.md` now resolves a writable repo root
  (`$RECAP_STUDIO_ROOT` → `~/projects/recap-studio` → `cwd` → plugin
  cache) before any file write, and surfaces a warning in the final
  report when it has to fall back to the cache. See
  `docs/known-issues.md#plugin-cache-write-target`.
- **Email deliverability gotchas section.** `docs/configuration.md`
  documents the M365/Outlook silent-quarantine pattern that makes
  `POST /emails 200 + id` look like a successful send when the mail is
  actually invisible. See
  `docs/known-issues.md#resend-200-ok-not-delivery`.

## [0.2.0] - 2026-05-13

### Added

- **Run history dashboard.** `scripts/history.mjs` lists every recap in
  `artifacts/` with topic, score, and timestamp; renders into
  `apps/recap-web/src/app/history/page.tsx`.
- **Multi-language scaffold.** `packages/content-pipeline/src/locales/`
  ships `en.json` and a typed locale resolver. Pages declare a `locale`
  field and fall back to `en`.
- **RAG source vault.** `packages/content-pipeline/src/source-vault.ts`
  extends the JSONL source cache with content hashing, dedup, and a small
  query API used by the research-scout agent.
- **Auto-refresh script.** `scripts/auto-refresh.mjs <slug>` re-validates a
  stored recap; intended for cron use.
- **Template marketplace structure.** `templates/` directory with two
  starter templates (`tech-explainer`, `coding-session`) and a manifest.
- **Human review mode.** `recap-studio.config.ts` accepts
  `humanReviewMode: "off" | "before-publish" | "before-deploy"`; reviewers
  surface as a checklist artifact.
- **Reader analytics scaffold.** `packages/content-pipeline/src/analytics.ts`
  exposes a privacy-friendly local-only counter the app can opt into.
- **GitHub Actions CI.** Matrix test + typecheck + build on Node 20/22.
- **Animated SVG logo pair** at `.github/assets/logo-{light,dark}.svg`.
- Community files: `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `SECURITY.md`.

### Changed

- Marketplace integration. Recap Studio is listed in
  [`Aboudjem/10x`](https://github.com/Aboudjem/10x) as the third plugin.
- README restructured to install-first format with badge row + collapsible
  editor setup.

## [0.1.0] - 2026-05-13

### Added

- Initial release. Claude Code plugin with 4 skills, 13 specialist subagents,
  5 deterministic hooks, 4 typed packages, optional MCP server scaffold,
  Next.js 15 App Router renderer, deterministic 7-dimension validation
  board, and the `latest-ai-models` offline-safe demo path.
- Final validation report scored 9.7/10 overall, every threshold passed.
