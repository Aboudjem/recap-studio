# Phase 1 — Discovery & Repo Mapping (ground truth)

_Run 2026-05-28 by the rebuild orchestrator. Every claim here was verified live, not taken from the README._

## Stack (verified)
- pnpm monorepo (`pnpm@10`, Node ≥20). Branch: `rebuild/recap-studio` (off `main`, WIP checkpointed in commit `e9f3b54`).
- `apps/recap-web` — Next.js **15.5.18** App Router, static export (`output: export` → `out/`). Renders a typed `RecapPageContent` JSON into a one-page site. 14 section/ui components + `Mermaid.tsx` diagram.
- `packages/content-pipeline` — zod schemas (`schema.ts`, `schema-session.ts`), `config.ts`, `load-config.ts` (WIP), `source-cache`, `source-vault` (RAG), `slugify`, `locales`, `analytics`.
- `packages/validation` — **deterministic heuristic** checks for 7 dimensions (NOT LLM agents).
- `packages/mcp-server` — MCP scaffold, tools.ts (~9 documented tools), marked `optional`.
- `packages/design-system` — tokens.
- `agents/` — 13 agent prompt `.md` files (the product's runtime agents).
- `skills/` — `recap-topic`, `recap-session`, `recap-setup`, `recap-validate`.
- `hooks/` — block-destructive-git, block-secret-writes, validate-before-deploy, format-after-edit, qa-summary-on-stop.
- `templates/` — `tech-explainer`, `coding-session`. `artifacts/` — past validation outputs (several real French-language runs → tool has had real use).

## Baseline (verified GREEN, exit 0)
- `pnpm typecheck` ✅ all 5 projects.
- `pnpm build` ✅ static export OK. **First Load JS = 103 KB shared / 105 KB for `/`** (README's "103 KB" claim CONFIRMED). One warning: `Critical dependency: the request of a dependency is an expression` from `packages/content-pipeline/dist/load-config.js` (dynamic require in the new WIP loader) — should be fixed.
- `pnpm test` ✅ but only **7 tests total** (validation 2, mcp-server 4, recap-web 1). Coverage is thin vs. the standards' required suite.
- `pnpm demo:latest-ai-models` ✅ runs fully offline.
- `pnpm validate:demo` ✅ → "9.7/10". **This score is from deterministic heuristics** (word counts, sourceId presence, regex for secrets/fluff), not LLM review.

## Confirmed gaps (evidence) — feed the audit
1. **`file://` double-click BROKEN (HARD GOAL REQ).** `out/index.html` references absolute `/_next/static/css/...` and `/_next/static/chunks/...`. Opening the file directly (no server) loads no CSS/JS. GOAL: "work offline and open with a double-click." → Need a genuinely self-contained single-file HTML output / reusable template.
2. **No reusable, documented, generic dark-mode HTML template asset** (GOAL core deliverable). The design is locked inside the Next.js app; nothing is packaged for the other 10x tools to reuse.
3. **Theme default = `"auto"`** (`config.ts:13`). GOAL demands dark-mode-first.
4. **README overclaims** "13 specialist agents · 7-dimension validation (7 reviewers in parallel) · scored 9.7/10". The automated scorer is deterministic; LLM review only happens if the skill's pipeline is actually run by Claude at runtime. Honesty finding for the Skeptical Reviewer.
5. **`llms.txt` MISSING, `AGENTS.md` MISSING** (polish bar).
6. **Multi-editor MCP/CLI unproven.** STANDARDS require first-class, tested MCP/CLI in Claude Code + Cursor + VS Code + Codex + Gemini + Windsurf + Continue, with copy-paste setup + smoke test per editor. Current MCP server is an `optional` scaffold; no CLI; no per-editor docs.
7. **"Open the HTML, then ask to deploy to Vercel (only if configured)" UX** not clearly implemented in the skills.
8. **Command/name tension** feeding the rename decision: README/UX markets `/recap`, skills are `recap-topic`/`recap-session`, repo/plugin/npm = `recap-studio` (npm 0.2.0 placeholder published).

## Load-bearing claims to RE-DERIVE (Skeptical Reviewer)
- "103 KB First Load JS" → CONFIRMED by build output.
- "9.7/10" → it's a deterministic heuristic score, not LLM review. CORRECTED framing needed.
- "13 specialist agents" → 13 `.md` files exist; verify they're wired + not dead.
- "Beautiful, calm, mobile-first, ~5-min" → must be verified visually (360px + desktop screenshots).
- "Topic explainer fact-checks every claim against primaries / nothing hallucinated" → the deterministic validator only checks sourceId *presence*, not truth. Verify the skill actually mandates primary-source verification.
