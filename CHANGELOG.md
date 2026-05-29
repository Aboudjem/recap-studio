# Changelog

All notable changes to Recap Studio are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-05-28

### Changed

- **Honest framing in art assets and npm placeholder:** removed the
  retired "13 agents / 7-dimension validation board / 9.7 / 10"
  phrasing from `social-preview.svg`, `hero-diagram.svg`, and the
  `npm-placeholder` package (version, description, help banner).
  Replaced with plain language: "self-contained HTML",
  "deterministic heuristic checks", "opens offline".
- **SVG diagram labels:** `hero-diagram.svg` relabels "+ 7 reviewers
  (parallel)" -> "7 heuristic checks"; "Validation board" per-dimension
  score table -> named heuristic dimensions; OUTPUT card removes the
  stale "103 KB First Load JS" figure.
- **social-preview.svg:** bumped version label v0.2.0 -> v0.3.1;
  replaced 9.7/10 chip with "offline HTML" label.
- **SECURITY.md:** supported-versions table updated: 0.3.x supported,
  0.2.x and 0.1.x unsupported (was listing only 0.1.x as supported).
- **README.md:** replaced `shields.io/npm/v` badge (rendered stale
  0.2.0) with `shields.io/github/v/tag` badge tracking the git tag.
- **llms.txt:** added caveats to the npm Links section: the
  `@recap-studio/cli` and `@recap-studio/html-renderer` packages are
  not yet published; the `recap-studio` placeholder redirects to the
  10x marketplace.
- **AGENTS.md:** corrected `design-system` test entry: "yes" -> "no"
  (package.json test script is `echo no tests`).
- **CHANGELOG.md:** fixed "third plugin" historical note (marketplace
  now ships four plugins); added Keep-a-Changelog footer comparison
  links.
- **npm-placeholder version** bumped 0.2.0 -> 0.3.1.

## [0.3.0] - 2026-05-29

The "make it real" rebuild. Audited end-to-end (11 specialist passes), then
rebuilt the output, opened it to every editor, and made the claims honest.

### Added

- **Self-contained HTML output:** new `@recap-studio/html-renderer`:
  `renderToHtml()` produces ONE dark-mode HTML file with all CSS inlined and
  **zero JavaScript** that opens with a double-click, offline. Fixes the
  long-standing `file://` breakage where `out/index.html` referenced absolute
  `/_next/` paths and rendered blank without a server.
- **Reusable template:** the renderer is a shared, documented asset
  (`packages/html-renderer/TEMPLATE.md`) other 10x tools can call with a
  `RecapPageContent` and a `{theme}`.
- **`recap` CLI** (`@recap-studio/cli`): `recap render` / `recap validate`
  work in any editor/terminal, no Claude Code required.
- **MCP `render_recap_html` tool:** turn a stored content slug into a
  self-contained page from Cursor, VS Code, Codex, Gemini, Continue, etc.
- **`scripts/render-html.mjs`** (`pnpm render` / `pnpm render:demo`).
- **`llms.txt`, `AGENTS.md`, `docs/multi-editor.md`, self-hosted
  `.claude-plugin/marketplace.json`** (standalone install path).

### Changed

- **All-sans-serif** type system + tasteful violet→blue→teal gradients
  (dark-first). `theme` default is now `dark`.
- **Honest validation framing:** the score is deterministic heuristic checks
  (structure, citations, word counts, secret/fluff scans); it does not fetch
  sources or run an LLM. Full agent review runs only via `/recap` in Claude Code.
- **MCP transport** is now MCP-spec compliant: tool results use `type: "text"`
  (was `type: "json"`, which broke several clients); handles
  `notifications/initialized` and `ping`.
- **Skills** (`recap-topic`, `recap-session`) now render the self-contained
  HTML, open it, THEN ask to deploy to Vercel only if configured, never
  without explicit consent.
- **CI** hardened: strict `--frozen-lockfile`, a self-contained-output
  assertion, a `recap` CLI smoke test, and a secrets-scan job.

### Fixed

- **`Critical dependency` build warning:** `load-config` is no longer in the
  content-pipeline barrel (use `@recap-studio/content-pipeline/load-config`).
- **`validate.mjs` crash on malformed input:** now guards required fields and
  exits 2 with a helpful message instead of an unhandled `TypeError`.
- **`recap-setup`** referenced a non-existent `config-template.ts`.

### Security

- **Reset shipped config to safe defaults.** `recap-studio.config.ts` had
  shipped with `deploymentMode: "preview"` and
  `emailMode: "send-with-confirmation"`. Both are now `disabled`; the live
  config file is gitignored, with `recap-studio.config.example.ts` as the
  copy-me template.

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

- **`scripts/vercel-set-public.sh`:** opt-in helper to toggle Vercel's
  project-level Deployment Protection (`ssoProtection`). Defaults to
  disabling SSO so `*.vercel.app` preview URLs are publicly readable.
  Requires `RECAP_USER_CONFIRMED_PUBLIC=1`. Documented in
  `docs/vercel-deployment.md#deployment-protection-sso-gate` and
  `docs/known-issues.md#vercel-sso-protection`.
- **`docs/known-issues.md`:** living catalog of bugs and surprises with
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
  [`Aboudjem/10x`](https://github.com/Aboudjem/10x) as one of the plugins.
- README restructured to install-first format with badge row + collapsible
  editor setup.

## [0.1.0] - 2026-05-13

### Added

- Initial release. Claude Code plugin with 4 skills, 13 specialist subagents,
  5 deterministic hooks, 4 typed packages, optional MCP server scaffold,
  Next.js 15 App Router renderer, deterministic 7-dimension validation
  board, and the `latest-ai-models` offline-safe demo path.
- Final validation report scored 9.7/10 overall, every threshold passed.

[0.3.1]: https://github.com/Aboudjem/recap-studio/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Aboudjem/recap-studio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Aboudjem/recap-studio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Aboudjem/recap-studio/releases/tag/v0.1.0
