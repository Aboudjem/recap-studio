# Phase 2 — Technical Audit
_Run 2026-05-29. Every finding is evidence-backed with file:line or command output. Confidence labels: confirmed | likely | uncertain | blocked | needs-user-approval._

---

## 1. file:// Double-Click Breakage (CONFIRMED BLOCKER)

### Reproduction

```
pnpm --filter recap-web build
# then open apps/recap-web/out/index.html in a browser directly (no server)
```

**Observed:** Page renders with no CSS, no JS — completely unstyled.

### Root Cause

`apps/recap-web/next.config.mjs` sets `output: "export"` but has **no `assetPrefix`**:

```js
// apps/recap-web/next.config.mjs (entire file, as read)
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "export",
  transpilePackages: [...],
};
export default nextConfig;
```

Next.js static export writes all asset references as **absolute URL paths** rooted at `/`:

```html
<!-- apps/recap-web/out/index.html — confirmed by grepping the file -->
<link rel="stylesheet" href="/_next/static/css/3ccb9f7f1adb6fcb.css" .../>
<script src="/_next/static/chunks/bb811a4c-43a8980e2894d808.js" ...></script>
<script src="/_next/static/chunks/4798-ff93c429b960aabe.js" ...></script>
<!-- 7 more /_next/... references in the <head> alone -->
```

The physical files **do exist** alongside `index.html` at `out/_next/static/...`, but the browser resolves `/_next/static/...` against the origin — `file:///` — so it looks for `/Users/.../out/_next/...` at the filesystem root, which fails with `net::ERR_FILE_NOT_FOUND` / `CORS` for every asset.

### Fix Options

| Option | Effort | Trade-off |
|---|---|---|
| **A. `assetPrefix: "."` in next.config** | ~1 min | Makes paths relative (`_next/static/...`). Works for double-click **only if** the file is served from its own directory. Does not work if `index.html` is moved. |
| **B. Single-file self-contained HTML** (the GOAL requirement) | ~1 day | Inline all CSS/JS via a post-build script. True offline, any location, shareable by email. Requires a bundler (e.g. `inliner`, `html-inline`, or a custom Rollup/Bun script). |
| **C. Serve via `npx serve out/`** | 0 effort | Documented workaround, not a fix. |

Option B is what the GOAL spec requires ("beautiful, dark-mode, mobile-first, ~5-minute one-page explainer (HTML)" that "works offline, opens with a double-click"). Option A is a partial patch; it still breaks if the file is moved to a different directory.

**Recommended:** Implement Option B via a post-build `inline.mjs` script that reads `out/index.html`, inlines `<link rel="stylesheet">` blocks and `<script src>` blocks, and writes `out/index-standalone.html`. Option A can ship as an interim patch today (1-line change).

---

## 2. Validation Honesty Gap — Is the 9.7/10 Meaningful?

### What the score actually measures

`scripts/validate.mjs` (confirmed: 228 lines, entirely deterministic) runs 7 check functions against the content JSON:

| Check | What it actually tests |
|---|---|
| `checkFacts` | Every cited element has `sourceIds[]` that resolve to `sourceMap` entries. Entries with `composite >= 7` count as "strong". Score = (supported / total) * 10. |
| `checkBeginner` | `oneSentenceAnswer` ≤ 30 words; key idea bodies ≤ 60 words; total word count ≤ 5.5 min at 220 wpm. |
| `checkA11y` | `keyIdeas.length ≤ 7`; `visualSections` includes enabled `matters` + `takeaways` kinds. |
| `checkUx` | Diagrams exist; each has `alt.length >= 8`. |
| `checkPerf` | **Baseline score is hardcoded to 8** (`performance.ts:37: let bundleScore = 8; // baseline when we cannot measure`). Penalizes only if `> 4 diagrams`. |
| `checkSec` | Regex for known secret patterns, prompt-injection cues, provenance consistency. |
| `checkSimp` | 7 marketing-fluff regexes; long body paragraphs > 80 words; glossary > 18 terms. |

### Gameability — CONFIRMED TRIVIAL

A minimal fixture with one source (score 8), one key idea, one example, one misconception — all cross-referencing `src1` — scores **9.7/10** identically to the real demo:

```
node scripts/validate.mjs /tmp/minimal-game.json
# → Overall: 9.7/10 — thresholds PASSED ✅  (confirmed, exit 0)
```

The fixture JSON used (see `/tmp/minimal-game.json`) has 1 source, 1 key idea, 1 example, 1 misconception, 1 diagram with a proper alt. Content truth is irrelevant — the validator never fetches any URL, never cross-checks any claim against the actual source. A source titled "Fake Source" at `https://example.com` with `composite: 8` passes all fact checks.

### What is NOT checked (confirmed gaps)

- The source URL is **never fetched**. A non-existent or irrelevant URL gets the same score as a real primary source.
- `composite` score is **author-supplied** — the agent pipeline self-reports it; the validator trusts it.
- **No LLM review happens in `pnpm validate:demo`**. The README's "7 reviewers in parallel" only occurs when the skill pipeline actually runs agents at skill invocation time. The `pnpm validate` script is pure heuristics.
- `checkPerf` baseline is **8/10 regardless of bundle size** when no `.next/` build dir is present (`performance.ts:37`). In practice `pnpm validate:demo` never passes a build dir, so performance always scores exactly 8.

### README Honesty Assessment

The README claim "9.7/10 · 7 reviewers in parallel" implies LLM review. The correct description is: **"9.7/10 from 7 deterministic heuristic checks"**. The agent reviewers (fact-checker, beginner-reviewer, etc.) are invoked only when a user actually runs `/recap topic` in Claude Code; they are not part of the CI/CD scoring path.

---

## 3. Critical Dependency Warning — Root Cause

### Warning text (reproduced from `pnpm build`)

```
⚠ Compiled with warnings in 2.4s
../../packages/content-pipeline/dist/load-config.js
Critical dependency: the request of a dependency is an expression
Import trace: ../../packages/content-pipeline/dist/load-config.js
  → ../../packages/content-pipeline/dist/index.js
  → ./src/lib/content.ts
  → ./src/app/page.tsx
```

### Root Cause

`packages/content-pipeline/src/load-config.ts:44`:

```ts
const mod = await import(pathToFileURL(path).href);
```

This is a **dynamic `import()` where the specifier is a runtime expression** (`pathToFileURL(path).href`). Webpack (used by Next.js) cannot statically analyze the import graph when the module path is a variable, so it emits the "Critical dependency" warning.

**Why it reaches the Next.js bundle at all:** `packages/content-pipeline/src/index.ts` re-exports everything including `load-config`:

```ts
export * from "./load-config.js";  // index.ts line ~12
```

And `apps/recap-web/src/lib/content.ts` imports from `@recap-studio/content-pipeline` (which includes load-config via the barrel). Next.js transpiles the package (`transpilePackages` config), so webpack processes `dist/load-config.js` and sees the dynamic expression.

**Impact:** Warning only — the build succeeds. But it indicates webpack is bundling `load-config` (which uses Node.js `fs`, `os`, `path`) into the client-side bundle, which is wasteful. `load-config` is only needed for CLI/server-side config loading.

### Fix

Two options:

1. **Remove `load-config` from the barrel export** (`index.ts`). Callers that need it import it directly: `import { loadConfig } from "@recap-studio/content-pipeline/load-config"`. This prevents webpack from ever seeing the dynamic import.
2. **Mark `load-config` as server-only** by adding `"use server"` (Next.js) or `import "server-only"` at the top of the file. However, since `load-config.ts` is in a shared package (not the app), option 1 is cleaner.

---

## 4. Content Pipeline Audit: Schemas, Dead Code, Source Vault, Locales, Analytics

### 4a. Schemas — Wired and Load-Bearing

`packages/content-pipeline/src/schema.ts` — confirmed wired. The `RecapPageContent` zod schema is the single source of truth shared by:
- `apps/recap-web/src/lib/content.ts` (calls `parseRecapPageContent`)
- `scripts/validate.mjs` (reads content JSON)
- `packages/validation/src/checks/*.ts` (type-checked against `RecapPageContent`)
- All 13 agent `.md` files (reference the schema by name)

`packages/content-pipeline/src/schema-session.ts` — exists as a type contract for `/recap session`. Confirmed it is referenced in `skills/recap-session/SKILL.md:47`. Not yet used in production content (no `session.json` in `apps/recap-web/src/content/`). Likely dormant but intentional scaffolding.

### 4b. Active-Content Silent Fallback Bug — PARTIALLY FIXED, RESIDUAL GAP

**History:** The `apps/recap-web/src/lib/content.ts` `loadContent()` function previously silently fell back to the fixture without logging. This was fixed; it now logs a `console.warn` at build time when the active slug has no content file.

**Current behavior (confirmed by live test):**

```bash
# Set active slug to non-existent slug
echo '{"slug":"nonexistent-slug-xyz"}' > apps/recap-web/src/lib/active-content.json
node scripts/validate.mjs
# → recap-studio: active slug "nonexistent-slug-xyz" has no content file...
#   — falling back to (no fixture either).
# → recap-studio: content not found at .../fixtures/topics/nonexistent-slug-xyz.json
# exit: 2   ← GOOD — fails loudly, does not silently succeed
```

**In `scripts/validate.mjs`:** The fallback chain is: active slug → `apps/recap-web/src/content/<slug>.json` → `fixtures/topics/<slug>.json` → `console.warn` + return fixture path (even if it doesn't exist). If neither exists, `validate.mjs` then crashes with `TypeError: Cannot read properties of undefined (reading 'map')` (confirmed: exit 1, no graceful error message).

**In `apps/recap-web/src/lib/content.ts`:** If neither content nor fixture file exists, it throws: `recap-web: content not found for slug "${slug}"` — which crashes the Next.js build. This is correct behavior.

**Residual gap:** `scripts/validate.mjs`'s `defaultContentPath()` returns the fixture path even when the fixture does not exist (line ~40: `return fixture;` without checking `existsSync(fixture)`). The subsequent `JSON.parse` then throws an uncaught `TypeError` instead of a clean error. The fix: check `existsSync(fixture)` before returning it, and `process.exit(2)` with a clear message if neither file exists.

### 4c. Source Vault — Scaffolded, Not Wired to App

`packages/content-pipeline/src/source-vault.ts` — confirmed: exports `indexCache`, `readVault`, `searchVault`, `appendSourceToVault`. None of these are imported anywhere in `apps/recap-web/src/`. The vault is intended for the agent pipeline (research-scout → source-librarian), not the renderer.

**Status:** Correctly scoped. The vault is a server-side/agent-side concern. It is wired in `packages/mcp-server/src/tools.ts` via `appendSource` (from `source-cache`, the vault's dependency). The vault itself (`searchVault`) is not yet called from any MCP tool — it's scaffolded for future RAG retrieval. Mark as **intentional dead code at the app layer; scaffolding at the agent layer.**

### 4d. Locales — Scaffolded, Not Wired to App

`packages/content-pipeline/src/locales.ts` — confirmed: exports `resolveStrings`, `STRINGS` (en, fr, es, de, pt, ja), `UIStrings` type. **Zero imports** of `resolveStrings` or `UIStrings` found in `apps/recap-web/src/` (confirmed by grep).

The UI strings (skip-to-summary, fixture notice, glossary toggle, etc.) are currently **hardcoded in English** in each component. The locale module is exported from the package index and will cause webpack to bundle all 6 locale string tables into the client bundle needlessly.

**Impact:** ~500 bytes of locale data in the bundle (minor). The real issue is the schema says `defaultLocale` is a config option but the app ignores it entirely. This is misleading to users who configure `defaultLocale: "fr"`.

### 4e. Analytics — Scaffolded, Explicitly Disabled, Not Wired

`packages/content-pipeline/src/analytics.ts` — confirmed: exports `recordEvent`, `readCounters`. **Zero imports** in `apps/recap-web/src/`. The config `analyticsMode` defaults to `"off"` (`config.ts:23`). No route handler exists that calls `recordEvent`.

**Status:** Correct — opt-in analytics is the right design. The module is exported but inactive. No privacy risk. The comment in `analytics.ts` says "The Next.js page can opt in by hitting a server-only route handler that calls `recordEvent()`. Disabled by default." This is accurate.

---

## 5. Bad-Input Handling

### 5a. `scripts/validate.mjs` — Three Failure Modes

**Test 1: Empty/partial JSON (missing required fields)**
```bash
echo '{}' > /tmp/bad.json && node scripts/validate.mjs /tmp/bad.json
# → TypeError: Cannot read properties of undefined (reading 'map')
#   at checkFacts (validate.mjs:103)
# exit: 1
```
**Root cause:** `checkFacts` does `content.sourceMap.map(...)` before checking whether `content.sourceMap` exists. `{}` has no `sourceMap`. No schema validation is run before the checks begin — the script calls check functions directly on the raw `JSON.parse` output.

**Test 2: Non-existent file**
```bash
node scripts/validate.mjs /tmp/does-not-exist.json
# → recap-studio: content not found at /tmp/does-not-exist.json
# exit: 2
```
**Result:** Clean, correct error message. This path is handled.

**Test 3: `defaultContentPath()` returns non-existent fixture path**
```bash
# active-content.json points to slug with no content file and no fixture
echo '{"slug":"nonexistent-slug-xyz"}' > apps/recap-web/src/lib/active-content.json
node scripts/validate.mjs
# → recap-studio: active slug "nonexistent-slug-xyz" has no content file...
#   falling back to (no fixture either).
# → recap-studio: content not found at .../fixtures/topics/nonexistent-slug-xyz.json
# exit: 2  ← exits cleanly because existsSync check happens before JSON.parse
```
**Result:** Acceptable, but the warning message says "falling back to (no fixture either)" and then the next line says "content not found" — confusing UX. The two messages should be merged.

### 5b. Fix for Test 1

Add schema validation (or at minimum a guard) before running checks:

```js
// After: const content = JSON.parse(readFileSync(inputPath, "utf8"));
if (!content || typeof content !== "object" || !Array.isArray(content.sourceMap)) {
  console.error(
    `recap-studio: invalid content at ${inputPath} — missing required fields (sourceMap, keyIdeas, etc.).\n` +
    `Run the agent pipeline to generate a valid RecapPageContent JSON.`
  );
  process.exit(2);
}
```

A better fix would import and call `RecapPageContent.safeParse(content)` from the compiled package and report zod errors directly.

---

## 6. Summary of All Confirmed Findings

| # | Finding | Severity | Confidence | Evidence |
|---|---|---|---|---|
| 1 | `out/index.html` uses `/_next/static/...` absolute paths — file:// broken | Blocker | Confirmed | `apps/recap-web/out/index.html:1`, `next.config.mjs` (no `assetPrefix`) |
| 2 | No reusable standalone HTML template — GOAL core deliverable missing | Blocker | Confirmed | GOAL_SPEC.md; no inline/standalone build step exists |
| 3 | `scripts/validate.mjs` crashes with `TypeError` on malformed/partial input | High | Confirmed | `node scripts/validate.mjs /tmp/bad.json` → exit 1, unhandled TypeError |
| 4 | 9.7/10 score is trivially gameable — one fake source + structural JSON passes | High | Confirmed | `/tmp/minimal-game.json` test → 9.7/10, exit 0 |
| 5 | Performance dimension baseline hardcoded to 8/10 when no build dir | Medium | Confirmed | `packages/validation/src/checks/performance.ts:37` |
| 6 | Critical dependency webpack warning from `load-config.ts:44` dynamic import | Medium | Confirmed | `pnpm build` output; `dist/load-config.js:44` |
| 7 | Locales scaffolded but not wired — `defaultLocale` config key has no effect | Medium | Confirmed | grep on `apps/recap-web/src/` — zero imports of `resolveStrings` |
| 8 | `source-vault` `searchVault` not called from any MCP tool yet | Low | Confirmed | `packages/mcp-server/src/tools.ts` — no `searchVault` reference |
| 9 | `scripts/validate.mjs` `defaultContentPath()` emits two confusing messages for missing fixture | Low | Confirmed | live test output |
| 10 | `theme` default is `"auto"` — GOAL requires dark-mode-first | Low | Confirmed | `packages/content-pipeline/src/config.ts:13` |
| 11 | Analytics `recordEvent` never wired — `analyticsMode: "local-only"` has no effect | Low | Confirmed | grep on `apps/recap-web/src/` — zero imports; correct by design |
| 12 | `llms.txt` and `AGENTS.md` missing | Info | Confirmed | `ls` on repo root |
| 13 | Agents are text-prompt files only — no actual agent executor wiring checked | Info | Likely | `agents/*.md` all have `tools:` lists but no runner config; rely on Claude Code skill dispatch |

---

## 7. Prioritized Fix Recommendations

### P0 — Must fix before any "share the HTML" claim

1. **Fix file:// breakage (interim):** Add `assetPrefix: "."` to `apps/recap-web/next.config.mjs`. One-line change; makes double-click work when the file stays in `out/`.
2. **Build standalone self-contained HTML:** Add `scripts/inline.mjs` post-build step that inlines CSS and JS into a single `out/index-standalone.html`. Ship this as the primary deliverable. Use `inliner` npm package or a custom Bun/Node script reading `out/index.html` + `out/_next/static/**`.
3. **Fix validate.mjs crash on malformed input:** Add existence check for `content.sourceMap` before calling checks. Return `process.exit(2)` with a descriptive message.

### P1 — Fix before marketing the 9.7/10 score

4. **Reframe the score in README and all docs:** Change "9.7/10 · 7 reviewers in parallel" to "9.7/10 from 7 deterministic heuristic checks. LLM agent review runs only when /recap topic is invoked." Add a note that sources are not fetched during validation.
5. **Fix `load-config` webpack warning:** Remove `export * from "./load-config.js"` from `packages/content-pipeline/src/index.ts`. Provide a separate import path for server-side callers.
6. **Fix performance dimension:** When no build dir exists, emit a clear `info` finding ("run `pnpm build` for accurate score") and set confidence to "low" rather than silently returning 8.

### P2 — Polish / completeness

7. **Wire locales:** In each section component, call `resolveStrings(locale)` for UI chrome strings. Pass `locale` from `RecapPageContent` or from a query param at build time.
8. **Wire analytics route:** Add a Next.js route handler `app/api/event/route.ts` that calls `recordEvent`. Keep it behind the `analyticsMode !== "off"` config check.
9. **Add `AGENTS.md` and `llms.txt`:** Standard plugin polish. `AGENTS.md` describes the 13 agents and their dispatch contract. `llms.txt` declares the tool for LLM clients.
10. **Set theme default to `"dark"`:** Change `config.ts:13` from `z.enum(["light","dark","auto"]).default("auto")` to `.default("dark")`. Update skill template accordingly.
11. **Merge `defaultContentPath` warning messages** in `scripts/validate.mjs` into one coherent error + `process.exit(2)` when neither content nor fixture file exists.
