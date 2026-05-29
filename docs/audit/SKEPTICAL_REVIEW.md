# Phase 11 — Skeptical Reviewer sign-off

_2026-05-29. A separate adversarial agent re-derived every load-bearing claim from PRIMARIES (live files + real command runs), not from any report. Verdicts: CONFIRMED / CORRECTED / UNVERIFIED. Issues it raised were then fixed; this doc records both._

## Verdict table (re-derived from primaries)

| # | Claim | Verdict | Evidence |
|---|---|---|---|
| 1 | Generated HTML is self-contained (0 `/_next/`, 0 `<script>`, 1 `<style>`, no external css/js) | **CONFIRMED** | grep on both `artifacts/latest-ai-models/recap-latest-ai-models.html` and `artifacts/session/recap-session.html` + a fresh CLI render |
| 2 | 44 tests pass across the workspace | **CONFIRMED** | `pnpm -w test`: content-pipeline 17, html-renderer 9, mcp-server 9, cli 6, validation 2, recap-web 1 = 44; design-system has no tests (prints a notice) |
| 3 | Build green, no Critical-dependency warning, 103 KB First Load JS | **CONFIRMED** | `pnpm --filter recap-web build` exit 0, 0 "Critical dependency" hits, shared chunk 103 kB |
| 4 | Validation is deterministic heuristics, no network/LLM | **CONFIRMED** | `scripts/validate.mjs` + `packages/validation/src/checks/*` — no fetch/http/llm primitives; only word-count/regex/array logic |
| 5 | theme default is `dark` | **CONFIRMED** | `packages/content-pipeline/src/config.ts:13` |
| 6 | Shipped config is safe + gitignored | **CONFIRMED** | `.gitignore:33`; `git ls-files \| grep recap-studio.config.ts` empty; example has deploy/email disabled |
| 7 | MCP tool results use `type:"text"` | **CONFIRMED** | `packages/mcp-server/src/index.ts` — `content:[{type:"text",text}]`; transport test passes |
| 8 | `recap` CLI works headless | **CONFIRMED** | `node packages/cli/dist/index.js validate/render` exit 0; output self-contained |
| 9 | Both use cases validate (topic + session) | **CONFIRMED** | both → 9.7/10, exit 0 |
| 10 | Rename NOT executed | **CONFIRMED** | `plugin.json` name still `recap-studio`; `MIGRATION_PLAN_RECAP.md` marked NOT YET EXECUTED |
| 11 | No remaining doc overclaims | **CORRECTED** | one live overclaim found + fixed (below) |

## Issues raised → resolution

1. **`npx @recap-studio/cli` is 404 (not published).** The README advertised `npx`/`npm i -g` as the primary "anywhere" path, but the `@recap-studio/*` packages are not on npm. **FIXED**: README, `packages/cli/README.md`, `docs/multi-editor.md`, and `llms.txt` now lead with the works-today from-source form (`node packages/cli/dist/index.js …`) and clearly mark `npx` as available after the 0.3.0 npm publish. (npm publish is an outward-facing op left to the release owner — not done unilaterally this session.)
2. **Performance dimension uses a hardcoded baseline (8/10) when no build dir.** Honest finding text is already printed ("no .next build found — static-only"); documented in the report and TEST_REPORT. Left as-is (labeled), not silently inflated.
3. **"Session mode proven end-to-end" implied automated skill generation.** **FIXED**: `TOOLS_AUDIT_AND_REBUILD_REPORT.md` now states the session content was authored for this session (not produced by an automated `/recap session` run); the render→validate→read pipeline is what's proven E2E.
4. **CI badge / "runs on every push" not confirmable until pushed.** True — confirmed on first push to `origin`.
5. **Multi-editor smoke tests are documented, not automated.** True and disclosed; per-editor live handshake remains UNVERIFIED in `TEST_REPORT.md`.

## Sign-off

All load-bearing technical claims **CONFIRMED from primaries**. The one live overclaim (npx) was **CORRECTED** in the docs. Remaining items are honestly labeled **UNVERIFIED** (live per-editor MCP handshake; clean-environment marketplace install; live Vercel deploy) in `TEST_REPORT.md`. No dishonest claim remains in the shipped docs.
