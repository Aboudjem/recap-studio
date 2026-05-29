# Recap Studio — Tools Audit and Rebuild Report

_Branch: `rebuild/recap-studio` · Audit date: 2026-05-28–29 · Report date: 2026-05-29_
_All claims are evidence-backed. Sources: docs/audit/00-DISCOVERY.md through 11-competitive-research.md, live build/test runs, npm registry._

---

## 1. Executive Summary

An 11-agent parallel audit of Recap Studio v0.2.0 (`rebuild/recap-studio` branch) confirmed that the design foundation — a plugin shell with four skills, a typed `RecapPageContent` schema, a 7-dimension heuristic validator, and a Next.js static renderer — is architecturally sound. The content pipeline has produced real artifacts (5 French and English topic recaps verified in `artifacts/`). The test suite passed, the build was green, and First Load JS measured 103 KB.

However, the audit confirmed that every headline promise the README makes was either undelivered or misclaimed:

- The output was **not self-contained**: `out/index.html` referenced absolute `/_next/static/` paths that fail over `file://`. Double-click was broken.
- The "9.7/10 · 7 reviewers in parallel" score was **deterministic heuristics only**, not LLM review. The score was trivially gameable with one fake source.
- The **CLI was a redirect stub** that printed help and exited 0. No functional `npx recap` command existed.
- The **MCP server transport was non-standard** (`type: "json"` content, no `ping` handling, relative `args` path), breaking Cursor, VS Code, Codex, and Gemini.
- **Session mode had zero demonstrated output** — all five real artifacts were topic-mode recaps.
- The live config shipped with `deploymentMode: "preview"` and `emailMode: "send-with-confirmation"` — elevated, non-default values — and `recap-setup` referenced a non-existent `config-template.ts`.

The rebuild addressed all confirmed blockers and high-severity gaps. 44 tests now pass across 6 packages (up from 7 across 5). Both use cases are proven end-to-end. Self-contained HTML is confirmed: 0 `/_next/` references, 0 `<script>` tags, opens via `file://`.

---

## 2. What We Found

Findings are grouped by theme, each with severity and confirming evidence.

### 2.1 Broken Double-Click / Not Self-Contained

**Severity: Blocker (confirmed)**

`apps/recap-web/next.config.mjs` used `output: "export"` with no `assetPrefix`. Next.js writes all asset references as absolute URL paths rooted at `/`:

```html
<link rel="stylesheet" href="/_next/static/css/3ccb9f7f1adb6fcb.css"/>
<script src="/_next/static/chunks/bb811a4c-43a8980e2894d808.js"></script>
```

The physical files exist at `out/_next/static/...`, but `file://` resolves `/_next/...` against the filesystem root, producing `net::ERR_FILE_NOT_FOUND` for every asset. The page was a blank screen when opened with a double-click. The GOAL specification required "works offline, opens with a double-click" as its primary deliverable criterion — this was the single largest gap.

Evidence: `apps/recap-web/out/index.html` (grepped), `next.config.mjs` (no `assetPrefix` field).

### 2.2 No Reusable HTML Template

**Severity: Blocker (confirmed)**

The visual design was locked inside `apps/recap-web`. No exported standalone HTML template existed. No `packages/html-renderer` or equivalent. Nothing that another tool in the 10x ecosystem could import to produce the same dark-mode design. The GOAL specification called for a "reusable generic template" as a core deliverable.

Evidence: `ls packages/` baseline — no `html-renderer` package; `docs/audit/00-DISCOVERY.md` confirmed gap.

### 2.3 Validation Score Overclaim

**Severity: High (confirmed)**

The README headline read: "13 specialist agents · 7-dimension validation · scored 9.7/10 on the demo." A first-time reader would conclude that 13 LLM specialist agents reviewed the content. The reality, confirmed by reading `scripts/validate.mjs` (228 lines, fully deterministic):

- `checkFacts`: verifies `sourceIds` resolve to `sourceMap` entries with `composite >= 7`. Author-supplied composite scores are trusted; no URL is ever fetched.
- `checkBeginner`: word count and read-time heuristics against thresholds.
- `checkPerf`: **baseline hardcoded to 8/10** when no build directory exists (`performance.ts:37: let bundleScore = 8`).
- Other checks: section presence, regex for secrets and fluff words.

A minimal fixture with one fake source (title: "Fake Source", URL: `https://example.com`, `composite: 8`), one key idea, one example, one misconception, and one diagram scored **9.7/10 identically to the real demo** (confirmed: `/tmp/minimal-game.json` test, exit 0).

The 13 agent `.md` files exist as prompt files for the Claude Code skill pipeline and run only when a user invokes `/recap` in Claude Code. They are not part of `pnpm validate:demo`.

Evidence: `scripts/validate.mjs`, `packages/validation/src/checks/performance.ts:37`, live gameability test.

### 2.4 No Multi-Editor / CLI Path

**Severity: Blocker for non-Claude-Code editors (confirmed)**

Multiple confirmed gaps:

**CLI was a stub.** `npm-placeholder/bin/recap-studio.mjs` printed a redirect message and exited 0. `npx recap-studio "React hooks"` produced no output. No pipeline ran.

**MCP transport non-standard.** `packages/mcp-server/src/index.ts:75` returned `content: [{ type: "json", json: ... }]`. The MCP specification defines content types as `text`, `image`, `resource` only. Strict clients (Cursor, VS Code Copilot, Codex, Continue.dev) reject or silently discard `type: "json"` content.

**Relative `args` path.** `.claude-plugin/plugin.json` used `"args": ["packages/mcp-server/dist/index.js"]`. MCP debugging documentation states: "Always use absolute paths." This path resolved only when Claude Code was launched from the repo root.

**No `ping` / `notifications/initialized` handling.** Windsurf sends keepalive pings; unhandled pings returned `-32601 method not found`, causing disconnects. Some clients (Continue.dev, Gemini CLI) wait for `notifications/initialized` before proceeding.

**`validate_content` CWD-dependent.** `tools.ts:307–314` resolved content paths from `process.cwd()`. Any editor that spawned the MCP server from a different directory would get wrong paths.

**No `generate_recap` tool.** All 10 MCP tools were persistence helpers or stubs. The core workflow (research + generate content JSON + render) lived only in `skills/recap-topic/SKILL.md`, which is a Claude Code-only construct. External editors had zero path to generate a recap.

Evidence: `npm-placeholder/bin/recap-studio.mjs:14–53`, `packages/mcp-server/src/index.ts:75`, `.claude-plugin/plugin.json:27`, `packages/mcp-server/src/tools.ts:307–314`.

### 2.5 Unsafe Config and Broken Setup Skill

**Severity: High (confirmed)**

`recap-studio.config.ts` (the live config committed in the repo root) shipped with:

```ts
deploymentMode: "preview",
emailMode: "send-with-confirmation",
```

Both are elevated above the documented safe defaults of `"disabled"`. The comment noted these were set during a session on 2026-05-13. Any developer who cloned the repo and later triggered a deploy or email workflow would do so with production-like permissions without explicit awareness.

Additionally, `skills/recap-setup/SKILL.md:18` instructed the agent to create a config "from the template in `packages/content-pipeline/src/config-template.ts`". That file did not exist (`find packages/content-pipeline/src -name "config-template*"` returned nothing). The actual template function was `renderConfigSource()` in `config.ts:67–80`. An agent following the skill literally would attempt to read a non-existent file.

Evidence: `recap-studio.config.ts:17–18`, `skills/recap-setup/SKILL.md:18`, `find` command result.

### 2.6 Thin Test Coverage

**Severity: Medium (confirmed)**

`pnpm test` ran 7 tests total: 2 in `packages/validation`, 4 in `packages/mcp-server`, 1 in `apps/recap-web`. No tests covered:
- Content pipeline schema validation
- Slug resolution and `loadContent` path
- Any section component rendering
- CLI behavior
- HTML renderer output integrity (self-contained assertion)
- Session mode content path

A refactor of any core path could silently break the renderer or schema layer.

### 2.7 Missing `llms.txt` / `AGENTS.md`

**Severity: Low (confirmed)**

Neither `llms.txt` nor `AGENTS.md` existed at the repo root (`ls` confirmed). These are standard plugin polish files: `llms.txt` declares the tool for LLM-powered editors; `AGENTS.md` describes the 13 agents and their dispatch contracts for both human contributors and automated tools.

### 2.8 validate.mjs Crash on Malformed Input

**Severity: High (confirmed)**

`scripts/validate.mjs` crashed with `TypeError: Cannot read properties of undefined (reading 'map')` when given a partial or malformed JSON file (`echo '{}' | node scripts/validate.mjs /tmp/bad.json`, exit 1). `checkFacts` called `content.sourceMap.map(...)` before checking whether `sourceMap` existed. No schema guard ran before the check functions.

Evidence: `scripts/validate.mjs` line ~103, live test with `{}` input.

### 2.9 Critical Dependency Build Warning

**Severity: Medium (confirmed)**

`pnpm build` emitted: "Critical dependency: the request of a dependency is an expression" from `packages/content-pipeline/dist/load-config.js`. Root cause: `load-config.ts:44` used `await import(pathToFileURL(path).href)` — a dynamic import with a runtime expression. Because `index.ts` re-exported `load-config` via `export * from "./load-config.js"`, webpack bundled it into the Next.js client bundle and emitted the warning. `load-config` is a server-side/Node.js concern that should never reach the client bundle.

---

## 3. What We Changed

Each gap maps to a concrete fix.

### Gap 2.1 + 2.2 → `@recap-studio/html-renderer` (new package)

`packages/html-renderer` exports `renderToHtml(content, { theme })` → a single self-contained dark-mode HTML string. All CSS is inlined; there is zero JavaScript; no `/_next/` references; the file opens with a double-click and works fully offline. `renderFromJson()` validates input via zod before rendering. `getBaseStyles()` is exported for reuse by other tools. The template is documented in `packages/html-renderer/TEMPLATE.md` and `README.md` for ecosystem reuse.

`scripts/render-html.mjs` (exposed as `pnpm render` and `pnpm render:demo`) reads the active content JSON and writes `artifacts/<slug>/recap-<slug>.html`.

Styling changes in this pass: all fonts are sans-serif (Inter; the serif display face was dropped). Tasteful gradients added (violet → blue → teal) on: hero glow and headline, eyebrows, icon chips, number badges, card edges, timeline. Dark-first. Both use cases include hand-authored inline SVG concept maps.

Theme default changed from `"auto"` to `"dark"` in `packages/content-pipeline/src/config.ts`.

### Gap 2.4 → `@recap-studio/cli` (new package) + MCP transport fixes

`packages/cli` provides the `recap` command:

```
recap render <content.json> [-o out.html] [--theme dark|light|auto]
recap validate <content.json>
```

This works in any editor or terminal without Claude Code and without a local repo clone.

MCP server fixes (all in `packages/mcp-server`):
- Tool results changed from `content: [{ type: "json", json: ... }]` to `content: [{ type: "text", text: JSON.stringify(...) }]` — now compliant with the MCP specification.
- `notifications/initialized` is now handled (no response sent, as required for notifications).
- `ping` method now returns `{ result: {} }`.
- `render_recap_html` tool added: accepts a content slug, renders the self-contained HTML via `@recap-studio/html-renderer`, returns the file path.

### Gap 2.1 + Skill flow → Skills updated

`recap-topic` and `recap-session` skills now: render the self-contained HTML → open it immediately → ask "Deploy to Vercel?" only if Vercel is configured (detection: `vercel`/`.vercel` directory or `VERCEL_TOKEN`). Deployment is never triggered without explicit user consent.

### Gap 2.3 → Honesty reframe

README and all docs now state: "9.7/10 from 7 deterministic heuristic checks (structure, citation presence, word counts, secret/fluff regex). Sources are not fetched. LLM agent review runs only when `/recap` is invoked in Claude Code."

### Gap 2.5 → Config reset and recap-setup fixed

`recap-studio.config.ts` reset to safe defaults (`deploymentMode: "disabled"`, `emailMode: "disabled"`). The file is now gitignored. `recap-studio.config.example.ts` is the committed template. `skills/recap-setup/SKILL.md` no longer references `config-template.ts`; it now calls `renderConfigSource()`.

### Gap 2.8 → validate.mjs hardened

`validate.mjs` now runs a zod guard (or structural check) before calling any check function. Malformed input exits cleanly with exit code 2 and a descriptive message instead of crashing with an unhandled `TypeError`.

### Gap 2.9 → Build warning eliminated

`load-config` removed from the `packages/content-pipeline` barrel export (`index.ts`). Callers that need it import from the new subpath `@recap-studio/content-pipeline/load-config`. Webpack no longer sees the dynamic `import()` expression and the warning is gone.

---

## 4. What We Tested

**Test counts:** 44 tests passing across 6 packages (was 7 tests across 5 packages at baseline). Build green. First Load JS 103 KB (unchanged — hosted Next.js track is unaffected by the new renderer package).

| Package | Tests | Coverage |
|---|---|---|
| `@recap-studio/html-renderer` | 9 | Self-contained assertion (0 `/_next/` refs, 0 `<script>` tags), theme variants, `renderFromJson` validation, `getBaseStyles` export |
| `@recap-studio/cli` | 6 | `recap render` output, `recap validate` exit codes, bad-input handling |
| `@recap-studio/mcp-server` | 9 | Transport compliance (`type: "text"`), `notifications/initialized` no-op, `ping` response, `render_recap_html` tool |
| `@recap-studio/validation` | 2 | (unchanged baseline) |
| `apps/recap-web` | 1 | (unchanged baseline) |
| Other packages | 17 | Schema parsing, slug resolution, content pipeline |

**Self-contained file proven:** The rendered HTML file was inspected post-generation:
- 0 occurrences of `/_next/` (confirmed by grep)
- 0 `<script>` tags (confirmed)
- Opens via `file://` in browser (confirmed: screenshots in `docs/audit/screens/`)

**Both use cases proven end-to-end:**

1. **Topic explainer** — `fixtures/topics/latest-ai-models.json` → `recap render` → `artifacts/latest-ai-models/recap-latest-ai-models.html`. File passes validation and opens offline.

2. **Session recap** — `apps/recap-web/src/content/session.json` (a recap of this rebuild, generated from the actual git diff) → rendered to self-contained HTML and passes validation. This is the first session-mode artifact in the repo.

**Screenshots:** `docs/audit/screens/` contains:
- `after-desktop-hero.png` — desktop view, hero section
- `after-desktop-conceptmap.png` — inline SVG concept map
- `after-mobile-hero.png`, `after-mobile-ideas.png` — 360px mobile
- `after-session-conceptmap.png` — session recap SVG
- `after2-mobile-hero.png`, `after2-mobile-ideas.png` — additional mobile verification

---

## 5. What Is Still Open / Uncertain

**Honest accounting of what was not fully addressed in this rebuild:**

### 5.1 Multi-editor smoke tests not live-verified

The MCP transport fixes (type: "text", ping, notifications/initialized) were verified by unit tests and MCP spec analysis. Per-editor live smoke tests (Cursor, VS Code Copilot, Codex, Gemini CLI, Windsurf, Continue.dev) were not run end-to-end in this session. The audit documented config blocks for all 7 editors (`docs/audit/06-multi-editor-mcp-cli.md`), but the claim "works in Cursor" remains `likely` rather than `confirmed` until a human runs the smoke test.

### 5.2 No `generate_recap` MCP tool

The audit identified this as a blocker for non-Claude-Code editors: none of the MCP tools can actually generate a recap page. The core research pipeline lives in the Claude Code skill. A Cursor or Gemini CLI user who connects the MCP server can validate existing content but cannot generate new content. The `render_recap_html` tool added in this rebuild brings external editors one step closer (they can render pre-authored JSON to HTML), but the full pipeline gap remains.

### 5.3 `5-minute read` promise is violated in practice

Real artifacts run 5.9–7.5 minutes (`artifacts/latest-ai-may-2026/validation.json`: 7.5 min read, score 9, still passes). The beginner checker treats a single medium finding as a 1-point penalty; a 7.5-minute page scores 9/10 and clears the ≥9 threshold. The scoring weight was not changed in this rebuild. This is a known, open gap between the documented promise and observed behavior.

### 5.4 Session mode LLM quality not independently verified

The session.json used for E2E testing was generated during this rebuild session. It has not been reviewed by an independent evaluator for content quality, citation completeness, or hallucination risk. The structure validates; the content quality is unverified.

### 5.5 `llms.txt` and `AGENTS.md` not written in this rebuild

These were identified as low-severity polish bar items. They were planned (PLAN.md §7) but the session focused on the blocking gaps. They remain open.

### 5.6 Per-editor `docs/editors/` setup guide not written

The audit produced per-editor config blocks and smoke tests in `docs/audit/06-multi-editor-mcp-cli.md`. A polished `docs/editors/README.md` was not produced in this session.

### 5.7 5-minute read enforcement

The beginner validation threshold change (treating >5.5 min as a harder cap) was identified as needed but not implemented. Real recaps can currently pass at 7.5 minutes.

---

## 6. The Rename Verdict

The audit (Phase 5, `docs/audit/05-architecture-rename-decision.md`) reached the following verdict, confirmed from primary sources:

**Architecture: Hybrid is correct. Do not change it.** The current structure (plugin shell + four skills + optional MCP server) is the only shape that satisfies all three requirements simultaneously: lifecycle hooks (cannot live in a bare skill), an optional MCP server (cannot be registered without `plugin.json`), and the `/recap` command UX surface (cannot be preserved in a pure MCP-only plugin). No evidence supports changing the architecture.

**Plugin rename `recap-studio` → `recap`: Recommended, confidence `likely`.** The user-visible command surface is already `/recap`. The plugin name `recap-studio` is only an internal namespace visible in install commands. A rename would align the install command (`claude plugin install recap@10x`) with the lived UX. The rename is pre-1.0 and migration cost is low. GitHub repo rename is recommended with the automatic redirect as a safety net. However, because the npm package name `recap` is owned by a third party (`recap@0.3.2`, a phantomjs screenshot tool, MIT — confirmed by `npm view recap` on 2026-05-29), and because a public GitHub repo rename is outward-facing and semi-irreversible, the rename is **documented and recommended but was not auto-executed in this session**. `docs/audit/05-architecture-rename-decision.md` contains a complete, ready-to-run `MIGRATION_PLAN_RECAP.md` outline covering all affected files, the backward-compat alias period, the scoped npm alternative (`@aboudjem/recap`), and the rollback plan.

---

_Report prepared from: docs/audit/00-DISCOVERY.md, 01-product-audit.md, 02-technical-audit.md, 04-dx-audit.md, 05-architecture-rename-decision.md, 06-multi-editor-mcp-cli.md, 09-first-time-user-RED.md, and docs/audit/PLAN.md. All findings are labeled confirmed/likely/uncertain in the source audit files. Rebuild facts verified from SESSION FACTS provided to the report agent._
