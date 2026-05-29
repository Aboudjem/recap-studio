# Phase 8 — Consolidated Improvement Plan (Final Integrator)

_Synthesized 2026-05-29 from the 11-agent audit. Every item maps to a GOAL success criterion. Ordered P0 → P2. Load-bearing claims re-derived from primaries (npm registry, live files) before action._

## The headline (what the rebuild must make true)
The GOAL's heart: a `/recap` that produces a **beautiful, dark-mode, mobile-first, ~5-minute, self-contained HTML page that opens with a double-click**, for two use cases (topic explainer + session recap), with **nothing hallucinated** (fan-out fact-check), a **reusable generic template**, an **open-then-ask-to-deploy** flow, **multi-editor MCP/CLI**, and an evidence-based **rename verdict**. The audit confirms the design foundation is good but the headline promises are undelivered: the output is not self-contained (the single biggest gap), there's no reusable template, validation is overclaimed, and the cross-editor path is illusory.

## P0 — Core deliverables
1. **`packages/html-renderer`** — pure TS `renderToHtml(content, opts)` → ONE self-contained dark HTML string. Inline all CSS (tokens→CSS custom props + the ~50 component classes mapped in `03-ux-audit.md`/`07-template-reuse-audit.md`), server-rendered HTML (works with zero JS), `<details>` accordions, inline SVG diagrams, reduced-motion-safe, theme default `dark`. Bake in the UX-audit premium fixes (serif display hero, semibold headings, rendered keyIdea icons, dark-mode card ring not invisible shadow, `err`→#E04E55, off-white not pure-white text, fadeInUp reveal, hero visual, 5-min-path chips, SVG chevrons/checks, external-link icons, focus-visible rings). Document `TEMPLATE.md` + README for reuse by other 10x tools. → SC: self-contained double-click page; reusable documented template.
2. **Wire renderer → pipeline + skills.** `scripts/render-html.mjs` reads active content JSON → writes `artifacts/<slug>/recap-<slug>.html` (self-contained) and `out/index-standalone.html`. Update `recap-topic`/`recap-session` skills: generate → render self-contained HTML → **open it** → **ask "Deploy to Vercel?" only if configured** (detect `vercel`/`.vercel`/`VERCEL_TOKEN`); never deploy without consent. → SC: open-then-ask-deploy; never deploy without consent.
3. **Both use cases E2E + tested.** Topic explainer fact-checked via fan-out against primaries (cite, label uncertainty). Session recap: dogfood — generate a real `session.json` from THIS rebuild's git diff. Test on a real session + real topic; first-time-user sim must go GREEN. → SC #1, #2.

## P1 — Honesty, multi-editor, safety, polish
4. **Validation honesty.** Reframe README/docs to "deterministic heuristic checks (LLM review runs only at `/recap` time); sources not fetched during `validate`". Fix `validate.mjs` crash on bad input (zod guard + exit 2). Fix perf baseline to emit low-confidence info when no build dir. Merge the confusing missing-fixture messages.
5. **Multi-editor MCP + CLI.** (a) MCP `args` absolute/resolvable; (b) response `type:"text"` not `type:"json"`; (c) send `notifications/initialized`; (d) **real CLI** `bin/recap` — render content JSON → self-contained HTML + validate, works WITHOUT Claude; (e) MCP `render_recap_html` + `validate_content` using html-renderer; (f) per-editor setup blocks (Claude/Cursor/VS Code/Codex/Gemini/Windsurf/Continue) + smoke test per path. → SC: multi-editor tested.
6. **Safety fixes.** Reset `recap-studio.config.ts` to safe defaults + gitignore it + ship `.example`. Fix `recap-setup` SKILL `config-template.ts` ref → use `renderConfigSource()`. Fix build warning: drop `load-config` from the content-pipeline barrel.
7. **Polish bar.** Add `llms.txt`, `AGENTS.md`. Rewrite README (dead-simple, fix overclaim, add "dark-mode" keyword, separate the two command surfaces, explain pnpm `-w`/`10x`, fix `/recap` vs `recap-topic`). CI: add link-check + secret-scan + `--frozen-lockfile`. About description (~150 chars) + topics. CONTRIBUTING cross-links CoC. Demo video.
8. **Dark-first.** `config.ts` theme default `auto`→`dark`; `color-scheme: dark`.

## P2 — Decisions, reports, release
9. **Rename verdict (05).** Architecture = hybrid (keep). Rename plugin→`recap`: recommended but confidence **likely** (not high) + npm `recap` **blocked** (owned: `recap@0.3.2`) + public repo rename is outward-facing/semi-irreversible → **document + recommend + write `MIGRATION_PLAN_RECAP.md` (ready-to-run), do NOT auto-execute.** Add self-hosted `marketplace.json`.
10. **Deliverables.** `TOOLS_AUDIT_AND_REBUILD_REPORT.md`, `DECISIONS.md`, `TEST_REPORT.md`, updated README/examples, `MIGRATION_PLAN_RECAP.md`.
11. **Tests (full suite).** smoke / CLI / docs-example / bad-input / output-quality / regression / first-time-user GREEN / multi-editor smoke / independent verification. Skeptical Reviewer pass (CONFIRMED/CORRECTED/UNVERIFIED).
12. **Release.** version bump + tag + CHANGELOG + push.

## Confirmed-from-primary load-bearing facts
- file:// double-click broken (absolute `/_next/` paths) — CONFIRMED.
- validation = deterministic heuristics, trivially gameable, sources never fetched — CONFIRMED.
- npm `recap@0.3.2` owned by third party — CONFIRMED (`npm view recap`).
- live config ships deploy=preview, email=send-with-confirmation — CONFIRMED (file read).
- `recap-setup` references non-existent `config-template.ts` — CONFIRMED.
- 103 KB First Load JS; build/test green; 7 tests total — CONFIRMED.
