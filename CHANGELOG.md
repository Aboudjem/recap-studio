# Changelog

All notable changes to Recap Studio are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.4] - 2026-11-17

Pick your agent, install for all your projects, and two CLI fixes.

### Fixed

- **`recap demo -o <folder>` writes the page inside the folder.** It used to crash with `EISDIR`.
  `render -o <folder>` gets the same fix. A path that ends with `/` also counts as a folder.
- **`recap <command> --help` prints the help.** `recap demo --help` used to write the demo page
  instead. New tests for both in `packages/cli/src/cli.test.ts`.

### Changed

- **Install starts with "Pick your agent".** One row of agent badges (Claude Code, Codex, Cursor,
  Gemini CLI, GitHub Copilot, OpenCode), each linked to its one command and its test status.
- **Global install by default.** The skills commands use `npx skills add Aboudjem/recap-studio
  -g -a <agent> -y`, which installs for all your projects. Drop `-g` for one project. Checked in
  an empty home folder for all five skills agents.
- **Shorter first screen.** Three short answers: what it is, when to use it, what you get.
- **`docs/editors.md`:** the install folders for Codex, Cursor, GitHub Copilot, Gemini CLI and
  OpenCode now match what `skills@1.9.0 add -g` does: `~/.agents/skills/`.
- **Descriptions** rewritten to be shorter and clearer.

## [0.6.3] - 2026-11-17

A first screen that shows what you get. No change to how the tool behaves.

### Changed

- **README first screen.** It now opens with what you get: understand what was done, one page
  to send, checked before you send. Each point has its proof and a command. A `Works with` line
  says which agents were tested and that the writing uses your agent's model.
- **Plain English across the README and the four translations.** Short sentences, common
  words, and a short explanation for terms such as MCP, heuristic and Mermaid.
- **New hero and social image.** Built by `node scripts/build-visuals.mjs` from one layout:
  40 commits become one page, with the real demo line `Verdict: PASS · 49.8 KB · 0 script tags ·
  9.7/10`, the three points, the agents, and the start command.
- **Descriptions.** The plugin manifests, `package.json`, `server.json`, the `.mcpb` bundle,
  `llms.txt`, `AGENTS.md` and the landing page now share the new one-liner.

## [0.6.2] - 2026-11-17

A clearer first screen, true wording, and one hook fix.

### Fixed

- **`block-secret-writes` now guards edits, not only new files.** The hook was wired to the
  `Write` tool only, so an `Edit` of an existing `.env` in a recap project went through. It now
  runs on `Write`, `Edit`, `MultiEdit` and `NotebookEdit`, and reads `notebook_path` too. It
  stays silent outside a recap-studio project. New tests in `hooks/block-secret-writes.test.mjs`.

### Changed

- **README first screen says why.** A tagline, the situation it solves, and a "Why use it" block
  with three benefits and their proof. The score and Mermaid limits now sit next to the promise.
  The four translations match.
- **Descriptions.** The plugin manifests, `package.json`, `server.json`, `llms.txt`, `AGENTS.md`
  and the Pages site say the same thing: one page you can email, attach to a PR, or read offline.
  `AGENTS.md` no longer promises a page "in under 5 minutes".
- **Visuals.** The hero SVGs and the social preview carry the new headline. The architecture
  diagram shows the current test count.

No change to rendering, scoring, the CLI or the MCP tools.

## [0.6.1] - 2026-11-17

Fixes from an independent review of 0.6.0. The tools now say exactly what they do.

### Changed

- **Deploy and email MCP tools describe themselves as stubs.** `deploy_vercel_preview` never
  deploys: it returns the shell command to run yourself. `send_email_draft` never sends: it
  returns the draft, even with `confirmed: true` and a key. The old hint named a
  `scripts/send-email.sh` that does not exist; it is gone.
- **CLI hints work for npx users.** `demo`, `example`, `--help` and error messages print the
  command you used, such as `npx -y github:Aboudjem/recap-studio render content.json`, instead of
  a bare `recap` that is not on your PATH.
- **`block-secret-writes` checks temp paths too.** macOS temp folders under `/private/tmp` and
  `/private/var` are allowed, but a `.env`, `.pem`, `.key` or SSH key file there is still blocked.
  `.key` files are now blocked everywhere.

### Added

- **`npm run test:count`** runs `npm test` and prints the total test count, for the README proof row.
- **README:** a note on the harmless "packages not installed" line in `claude plugin list`, and
  one line on what `recap` stands for.

## [0.6.0] - 2026-11-17

The plugin now works in any project with nothing to build. The MCP server starts from an
installed plugin, the hooks stay out of unrelated projects, and the CLI runs with one `npx` line.

### Added

- **`bin/recap.mjs`**: the CLI and the MCP server in one committed, dependency-free file, built
  by `scripts/build-bundle.mjs`. `npm test` fails when it drifts from the sources.
- **`npx -y github:Aboudjem/recap-studio`** runs the CLI with no clone and no npm package.
- **`recap demo`**: a first page in one command, no input, no network. Verdict first.
- **`recap example`**: writes the built-in content JSON as a starting file. Refuses to overwrite.
- **`recap mcp`**: serves the MCP tools over stdio.
- **`/recap` router skill**: picks topic or session mode, or runs the demo.
- **`server.json`** (`io.github.Aboudjem/recap-studio`) and a `recap-studio.mcpb` bundle on each
  release, built byte for byte the same on every machine. The release workflow checks its sha256.
- **`docs/mcp-tools.md`**, generated from the server's own `tools/list` and checked by a test.
- **`tests/plugin.test.mjs`**: copies the plugin to an empty folder and drives it from there.
- **`.claude-plugin/icon.png`**.

### Changed

- **The plugin's MCP entry now starts.** It pointed at an unbuilt `dist/` file with a relative path.
  It now runs `${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs mcp`.
- **Hooks act only in a recap-studio project**: a folder (or parent) with a
  `recap-studio.config.*` file, a `.recap-studio/` folder, or this repo. Elsewhere they exit at
  once. `RECAP_HOOKS_EVERYWHERE=1` restores the old behavior. Prettier only formats files inside
  that project, and never downloads itself.
- **Skills work in any project.** They write `artifacts/<slug>/content.json` and render with the
  MCP tools or the bundled CLI, instead of needing a clone of this repo.
- **`validate_content` and `render_recap_html` work outside this repo.** They read
  `artifacts/<slug>/content.json` first. The artifact tools refuse a path that leaves `artifacts/`.
- **`recap validate` prints the verdict first**, then up to three things to fix, then the table.
  `--json` keeps its shape.
- **npm workspaces replace pnpm.** One package manager, `npm test` runs every suite.
- Validator messages and the diagram caption no longer use em dashes.

### Removed

- The author email in `.claude-plugin/plugin.json`.

## [0.5.2] - 2026-10-15

The git guard is no longer all-or-nothing: you can let Claude push while history-rewriting
commands stay blocked.

### Added

- **`RECAP_ALLOW_GIT_PUSH=1`**, a narrow opt-in for `hooks/block-destructive-git.mjs`. It allows a
  plain `git push` (new branch, fast-forward, tags). Force, force-with-lease, `+refspec`,
  `:refspec`, `--delete`/`-d`, `--mirror` and `--prune` pushes stay blocked, as do `reset --hard`,
  `rebase`, `clean -fdx`, `branch -D` and the rest. `RECAP_ALLOW_DESTRUCTIVE_GIT=1` still opens
  everything. With neither set, every push is refused, as before.
- `hooks/block-destructive-git.test.mjs` (node:test), run in CI.

### Changed

- The guard checks each shell segment separately and skips git's global options, so
  `git -C <dir> push --force` and `git -C <dir> reset --hard` are now caught.
- Text inside quotes is no longer matched (`git commit -m "then git push"` is not a push), unless
  the command re-evaluates strings (`bash -c`, `eval`, `$(...)` and similar).
- The refusal message names the variable that would allow the command.

## [0.5.1] - 2026-09-03

A motion identity, and the literal synthwave scenery removed. No behaviour changes.

### Changed

- **Every asset is rebuilt around one principle:** the whole mark is drawn once as a muted track,
  and a single bright element travels over it, so no frame of the loop is an incomplete logo and
  the reduced-motion resting frame is the finished mark. This plugin's motion is
  a page whose corner folds while a second page stacks up behind it.
- **The scenery is gone.** No sun disc, no horizon line, no perspective grid and no band cuts in
  any tracked SVG. The palette, the soft dual-tone wash, the restrained glow and the mono eyebrows
  stay.
- **Zero SMIL.** Every animation is now CSS, gradient colour drift included, so the
  `prefers-reduced-motion` guard reaches all of it. Verified by phase offset in a single page load,
  not by two renders at different virtual-time budgets, which gives a false negative.
- **More vibrant, still readable.** The ground is lifted off near-black and tinted with this
  plugin's own hue, every gradient drifts between two accents, and every text fill was re-measured
  against the ground it actually ships on. Tightest pair in this repo: 5.37:1.

### Added

- `.github/assets/logo-mark-animated.svg` and `.github/assets/logo-mark-animated-light.svg`, a 256x256 animated mark on a
  rounded tile, under 6 KB each, with dark and light variants.
- `logo-mark.png`, `logo-mark-512.png` and `social-preview.png` are now headless-Chrome renders of
  the mark's reduced-motion resting frame, so the raster is reproducible from the vector by one
  command and cannot drift from it.

## [0.5.0] - 2026-09-02

Three CLI features, a rebuilt visual identity, and one install page instead of an install matrix.
The renderer's guarantee is unchanged: the page it writes still has zero JavaScript and makes no
external request.

### Added

- **`recap render --print`**: an `@media print` block in `packages/html-renderer/src/css.ts`,
  applied when the flag is passed. White ground, black text, page breaks kept off atomic blocks,
  source URLs spelled out, and the glossary emitted as `<details open>` so paper shows it.
  Tests: four in `packages/html-renderer/src/render.test.ts` plus one in
  `packages/cli/src/cli.test.ts` that shells out to the real CLI.
- **`recap validate --json` and `--fail-under <score>`**: `--json` writes one JSON document on
  stdout with the honesty note on stderr, so a pipe to `jq` parses. `--fail-under` replaces the
  per-dimension threshold rule with an overall-score gate, and a blocker still fails the run
  whatever the score. Tests: `validate --fail-under gates on the overall score and still parses at
  exit 1` and two siblings in `packages/cli/src/cli.test.ts`.
- **`recap render --format html|md|txt`**: two pure serializers in
  `packages/html-renderer/src/serializers.ts`, no new dependency. `--theme` and `--print` are
  rejected on `md` and `txt` rather than ignored. Tests in
  `packages/html-renderer/src/render.test.ts`.
- **Neon Noir visual identity**: new `hero-dark.svg` and `hero-light.svg` banners, rebuilt
  `logo-dark.svg`, `logo-light.svg`, `hero-diagram.svg` and `social-preview.svg`, plus raster
  `logo-mark.png`, `logo-mark-512.png` and a 1280x640 `social-preview.png` for the GitHub repo
  card. Every SVG is GitHub-safe: no script, no external reference, a `prefers-reduced-motion`
  guard on anything animated.
- **`docs/editors.md`**, the single install page: the `npx skills add` agent-code table plus MCP
  snippets for Claude Code, Cursor, VS Code (`servers`), Codex (TOML), Gemini CLI, Windsurf,
  Continue, OpenCode and Zed (flat `command` and `args`).
- **`docs/cli.md`, `docs/faq.md`, `docs/comparison.md`**: the command tables, the FAQ and the
  comparison that used to live in the README.

### Changed

- **`install.sh` delegates to the skills CLI.** The default path runs
  `npx --yes skills@1.5.23 add Aboudjem/recap-studio -a <agent> -g -y`, mapping all 13 platform
  ids to agent codes verified against the live vercel-labs/skills table. The old copy and symlink
  logic stays reachable as `--legacy`, which is also the automatic fallback when `npx` is absent.
  `--update`, `--uninstall` and `--no-mcp` keep working.
- **README rewritten** from 381 lines to 179: one install block above the first heading, one
  editor table instead of a 100-line matrix, two alerts instead of five, five jump links instead
  of eight. Every image is an absolute `raw.githubusercontent.com` URL so npm renders it. The four
  translations in `READMEs/{zh-CN,ja,es,fr}.md` were rewritten from the new English.
- **Version 0.4.0 to 0.5.0** in `package.json`, `.claude-plugin/plugin.json`,
  `.cursor-plugin/plugin.json` and `.copilot-plugin/plugin.json`. `npm-placeholder/` is untouched.
- **Test figure corrected** to 73 tests across six workspace projects, re-derived from `pnpm test`.
  The README, `CLAUDE.md` and `AGENTS.md` previously carried 43 and then 72; the recap-web vitest
  project was never counted.
- **`docs/multi-editor.md` is now a stub** pointing at `docs/editors.md`, so older links resolve.
  Its `npx @recap-studio/cli` instructions are gone: those packages are not published.
- **`.github/assets/page-preview.svg` removed.** It was a mock of the rendered page; the real
  screenshot `page-preview.png` shows the same thing and nothing referenced the mock.

### Fixed

- **Non-deterministic validation scoring.** `packages/validation/src/checks/security-privacy.ts`
  declared `SECRET_PATTERNS` at module scope with the `/g` flag and used them with `.test()`. A
  global regex keeps `lastIndex` between calls, so the same page alternated between "leaked key"
  and "clean" on consecutive runs. The flag is dropped and a test runs the same planted-key
  content six times and asserts every run is deep-equal. This was a shipped bug, not one this
  release introduced.
- **`--fail-under` no longer lets a blocker through.** The gate requires `overall >= n` **and**
  zero blockers, so a leaked key cannot pass CI on a good average.

## [0.4.0] - 2026-05-30

Portability and discoverability layer. The plugin now installs into any AI CLI,
ships cross-editor manifests, has a static GitHub Pages demo, and reads honestly.
No behaviour changes to the renderer or the agents themselves.

### Added

- **Multi-CLI installer** (`install.sh` plus `install.ps1`): symlinks the four
  skills into 13 host CLIs (Gemini, Codex, OpenCode, Pi, Vibe, VS Code/Copilot,
  Trae, OpenClaw, Antigravity, Hermes, Cline, Kimi), with `--update`,
  `--uninstall`, and a curl-pipe one-liner. The optional local MCP server is the
  universal fallback.
- **Cross-editor manifests:** `.cursor-plugin/plugin.json` and
  `.copilot-plugin/plugin.json` mirror `.claude-plugin/plugin.json` (name,
  version, description, author, skills, and the MCP block for dual-mode).
- **GitHub Pages demo:** `site/index.html` (dark static landing page) plus
  `.github/workflows/deploy-pages.yml`. It reuses the shipped `demo.gif` and a
  real, pre-rendered self-contained recap (`.github/sample-recap.html`). Vercel
  and the hosted Next.js app are untouched; see CLAUDE.md for the
  Pages-vs-Vercel decision.
- **README portability blocks:** a language switcher, an install matrix with a
  per-editor setup section, and a Star History chart.
- **Localized READMEs:** full translations at `READMEs/{zh-CN,ja,es,fr}.md`.
- **`CLAUDE.md`:** project header plus contributor notes (host-agnostic agents
  rationale, installer target-dir table, manifests-to-sync list, version-bump
  checklist, Pages-vs-Vercel decision, the npm gap).
- **`.github/FUNDING.yml`** (`github: Aboudjem`).
- Embedded the `demo.gif` walkthrough in the README (carried over from the
  prior unreleased polish).

### Changed

- **Host-agnostic agents (#167):** dropped the `model:` pin from all 13 agent
  prompt files so every host CLI falls back to its own default model. The
  cost/quality split (haiku for lookups, sonnet for synthesis) is now documented
  in `AGENTS.md` as a suggestion, not enforced in frontmatter.
- **Honest test figure:** corrected "44 tests across 6 packages" to "43 tests
  across 5 test-bearing packages" in `README.md` and `AGENTS.md`
  (`design-system` ships no tests).
- Unified the `/recap session` command form (space form is canonical).
- Corrected the unshipped-npm claims (the `@recap-studio` packages are not yet
  published).
- De-serif'd `og.svg` to the sans-serif type system.

### Removed

- **Stray self-marketplace manifest** `.claude-plugin/marketplace.json`. The
  canonical distribution is the [Aboudjem/10x](https://github.com/Aboudjem/10x)
  hub; the self-hosted manifest added in 0.3.0 is no longer needed.
- Internal rebuild and migration docs, plus audit evidence.
- The stale "103 KB First Load JS" metric.

### Fixed

- Removed em-dashes (U+2014) from docs, agent prompts, skill files, and the
  load-bearing JSON manifest descriptions, replacing them with commas, colons,
  or parentheticals per the house style.
- Animated SVGs now respect `prefers-reduced-motion`.

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

[Unreleased]: https://github.com/Aboudjem/recap-studio/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/Aboudjem/recap-studio/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/Aboudjem/recap-studio/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/Aboudjem/recap-studio/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Aboudjem/recap-studio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Aboudjem/recap-studio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Aboudjem/recap-studio/releases/tag/v0.1.0
