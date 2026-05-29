# Test Report — Recap Studio v0.2.0

**Date:** 2026-05-29  
**Branch:** rebuild/recap-studio  
**Author:** Adam Boudjemaa (Aboudjem)  
**Repo:** github.com/Aboudjem/recap-studio

---

## Summary

| Metric | Value |
|--------|-------|
| Total tests | **44** |
| Passing | **44** |
| Failing | **0** |
| Packages with tests | **5 of 6** (design-system has no tests by design — consumed by recap-web) |
| Build status | GREEN |
| First Load JS (hosted Next.js track) | **103 KB** |

---

## Test Counts by Package

| Package | Tests | Pass | Fail |
|---------|-------|------|------|
| `@recap-studio/content-pipeline` | 17 | 17 | 0 |
| `@recap-studio/validation` | 2 | 2 | 0 |
| `@recap-studio/html-renderer` | 9 | 9 | 0 |
| `@recap-studio/mcp-server` | 9 | 9 | 0 |
| `recap-web` (Next.js app) | 1 | 1 | 0 |
| `@recap-studio/cli` | 6 | 6 | 0 |
| `@recap-studio/design-system` | 0 | — | — |
| **TOTAL** | **44** | **44** | **0** |

---

## Category Results

### 1. Smoke — pnpm install + build

**Result: GREEN**

`pnpm install` resolves the workspace cleanly. `pnpm build` compiles all six packages without errors. The Next.js hosted track reports First Load JS of **103 KB**. The "Critical dependency" warning from `load-config` in the content-pipeline barrel export was resolved by adding the `@recap-studio/content-pipeline/load-config` subpath; the build is warning-free.

### 2. CLI — `recap render` / `recap validate`

**Result: GREEN — 6/6 tests passing**

Test file: `packages/cli/src/cli.test.ts`

| Test | Status |
|------|--------|
| `recap --version` prints a semver string | PASS |
| `recap --help` shows USAGE and `recap render` | PASS |
| `recap render <fixture>` produces a self-contained HTML file | PASS |
| `recap validate <fixture>` exits 0 and prints "Validation report" + "deterministic heuristic checks" | PASS |
| `recap render <bad-input>` exits 2 with "schema validation" message | PASS |
| `recap <unknown-command>` exits 2 | PASS |

The CLI is invoked via `node --import tsx packages/cli/src/index.ts` in tests and compiles to a standalone `recap` binary in the published package.

### 3. Docs-example — README commands

**Result: GREEN**

The two canonical README commands work end-to-end:

- `pnpm render` (alias for `scripts/render-html.mjs`) writes `artifacts/latest-ai-models/recap-latest-ai-models.html` (48 582 bytes).
- `pnpm render:demo` writes the session recap to `artifacts/session/recap-session.html` (42 852 bytes).

Both files pass `recap validate` (exit 0) and open via `file://` in a browser without a server.

### 4. Bad-input — exit 2 on garbage

**Result: GREEN**

Two independent code paths are exercised:

**`recap render` (CLI):** Passing `{}` as input JSON causes the CLI to print "content failed schema validation" with the full list of missing required fields and exit with code **2**. Verified by CLI test #5 (`recap render on bad input exits 2 with a helpful message`).

**`validate.mjs` script:** Malformed or missing input causes a clean exit with code **2** and no unhandled `TypeError`. The guard added to `validate.mjs` is exercised by validation package test #2 (`run.test.ts`).

Neither path throws an unhandled exception or exits with code 1 (generic error).

### 5. Output quality — specific, cited, self-contained

**Result: GREEN**

Fixture used: `fixtures/topics/latest-ai-models.json` → `artifacts/latest-ai-models/recap-latest-ai-models.html`

**Self-contained check (machine-verified):**
- `/_next/` references in HTML: **0**
- `<script` tags in HTML: **0**
- File opens via `file://` offline: confirmed (no external resource requests required)

**Validation score (deterministic heuristic checks — NOT an LLM judge):**

> The 9.7/10 score is produced by deterministic regex + word-count + structure checks in `packages/validation/src/run.ts`. It does NOT fetch live sources or run an LLM. The LLM agent review only runs when `/recap` is invoked inside an active Claude Code session.

| Dimension | Score | Target | Status |
|-----------|-------|--------|--------|
| facts | 10/10 | 9 | PASS |
| beginner | 10/10 | 9 | PASS |
| accessibility | 10/10 | 9 | PASS |
| ux | 10/10 | 8 | PASS |
| performance | 8/10 | 8 | PASS |
| security-privacy | 10/10 | 9 | PASS |
| simplicity | 10/10 | 9 | PASS |
| **Overall** | **9.7/10** | — | **PASS** |

Blockers: none.

### 6. Regression — recap-web build still 103 KB

**Result: GREEN**

The Next.js hosted track (`apps/recap-web`) builds cleanly. First Load JS remains at **103 KB** — the same figure recorded at baseline before the rebuild. The one content test (`tests/content.test.ts`) passes, confirming that `apps/recap-web/src/content/session.json` is valid JSON with all required fields.

### 7. First-time user — session recap readable by a non-technical reader

**Result: GREEN**

Evaluated against the criteria in `docs/audit/09-first-time-user-RED.md`. The session recap (`artifacts/session/recap-session.html`) uses:
- Sans-serif body copy (Inter) throughout — no mixed serif/sans confusion.
- A single linear narrative flow with a hero, key ideas, timeline, and glossary.
- No jargon left unexplained at the point of first use.
- Inline SVG concept map replacing a wall of bullet points.

The audit document records friction in the README install flow (Friction points 1–3: sub-headline front-loads implementation details; `Aboudjem/10x` marketplace is not explained; no confirmation step after install). These are **README copy issues**, not rendering or content issues. The rendered HTML artifact itself is judged readable by a non-technical reader. Status: **GREEN for rendered output**; README copy friction is noted as a separate open item (not a test failure).

### 8. Multi-editor smoke — MCP transport + CLI headless

**Result: PARTIAL — transport tests GREEN; live editor handshake UNVERIFIED (see below)**

**MCP transport tests (machine-verified, 9/9 passing):**

Test file: `packages/mcp-server/src/tools.test.ts`

| Test | Status |
|------|--------|
| Exposes the ten documented tools | PASS |
| Refuses to deploy without confirmation | PASS |
| Refuses to send email without confirmation | PASS |
| Validates mermaid diagram type prefix | PASS |
| `render_recap_html` produces a self-contained HTML file | PASS |
| `tools/call` returns a `text` content block (MCP-compliant, not `type:json`) | PASS |
| Notifications get no response (`null`) | PASS |
| Responds to `ping` | PASS |
| `initialize` advertises protocol + tools capability | PASS |

The fix that changed tool result content type from `"json"` to `"text"` is covered by the dedicated transport test ("tools/call returns a text content block"). `notifications/initialized` returning `null` (no response) is verified by the notifications test.

**CLI headless:** The `recap` binary works without Claude Code present. Confirmed by the 6 CLI tests which invoke the binary via `execFileSync` in a clean subprocess with no editor or MCP context.

### 9. Independent verification — Skeptical pass

**Result: NOTED**

A separate Skeptical auditor pass (`docs/audit/`) re-derived the load-bearing claims independently. Key findings confirmed independently:

- The `type: "json"` → `type: "text"` transport fix was identified and verified against the MCP spec (the `tools/call` transport test was written to lock this in).
- The `notifications/initialized` silent-discard behavior was verified against `modelcontextprotocol.io` spec.
- The self-contained HTML claim (0 `/_next/` refs, 0 `<script>` tags) was machine-verified by the CLI test `recap render produces a self-contained HTML file` which asserts both conditions on the output file.
- The 9.7/10 validation score was re-read against `packages/validation/src/run.ts` and confirmed to be a deterministic heuristic score (no LLM involved).
- The MCP server `args` path is relative (`packages/mcp-server/dist/index.js`), which the multi-editor audit (`docs/audit/06-multi-editor-mcp-cli.md`) flags as a known gap: absolute paths are required for all editors. This is documented and not auto-fixed.

---

## What Is UNVERIFIED

The following items were not exercised end-to-end in this test run and must be verified before claiming full multi-editor support:

1. **Live MCP handshake in each real editor.** The transport tests run the JSON-RPC layer in-process. A live handshake — where Cursor, VS Code Copilot, Windsurf, Continue.dev, OpenAI Codex CLI, or Google Gemini CLI actually spawn `node packages/mcp-server/dist/index.js` and exchange `initialize` / `tools/list` messages — was not performed. The relative `args` path in `.claude-plugin/plugin.json` is a known blocker for this (documented in `docs/audit/06-multi-editor-mcp-cli.md`).

2. **Marketplace install path (`claude plugin marketplace add Aboudjem/10x`).** The `10x` marketplace was not exercised end-to-end in a clean environment. The plugin is listed in `marketplace.json` but a fresh install from a machine with no prior `10x` configuration was not simulated.

3. **Vercel deploy flow.** `deploy_vercel_preview` is gated behind `VERCEL_TOKEN` and `deploymentMode !== disabled`. The gate logic is tested (the "refuses to deploy without confirmation" test), but an actual Vercel deploy was not triggered. The config default (`deploymentMode: disabled`) is intentional and documented.

4. **Email draft flow.** `send_email_draft` is similarly gated. Gate logic is tested; actual email composition was not exercised.

5. **Hosted Next.js track on a remote Vercel environment.** The 103 KB First Load JS figure is from a local `pnpm build`. A production Vercel build with CDN, image optimization, and edge functions was not measured.

---

## Artifacts on Disk

| File | Size | Verified |
|------|------|---------|
| `artifacts/latest-ai-models/recap-latest-ai-models.html` | 48 582 bytes | Self-contained, 0 `/_next/`, 0 `<script>` |
| `artifacts/latest-ai-models/validation.json` | — | 9.7/10, all dimensions PASS |
| `artifacts/latest-ai-models/validation.md` | — | Human-readable report |
| `artifacts/session/recap-session.html` | 42 852 bytes | Self-contained |
| `docs/audit/` | 12 files | Independent Skeptical pass evidence |
