# Phase 7 — Reusable-Template Architecture Audit

_Run 2026-05-29. Role: Reusable-template architect. Every claim cites a file:line or command output. Confidence labels: confirmed | likely | uncertain._

---

## 1. Executive Summary

The design is **well-crafted but fully locked inside the Next.js app**. The single-file, double-click deliverable (the GOAL's core requirement) does not exist. The static export at `apps/recap-web/out/index.html` uses absolute `/_next/static/...` paths, which means opening it via `file://` loads zero CSS and zero JS — visually broken.

There is no generic, reusable dark-mode HTML template today. Every token, component shape, and layout decision lives either in the Tailwind preset (a `.cjs` file), the compiled Next.js output, or React TSX. Nothing is packaged as a standalone, self-contained, zero-dependency asset that other tools can consume.

The recommended architecture is **a dual-track output strategy**: keep the Next.js app for Vercel/hosted, and add a new `packages/html-renderer` that produces a genuine single-file `.html` output — all CSS inlined as a `<style>` block, SVG/Mermaid pre-rendered server-side, zero runtime JS required (progressive enhancement only). This package becomes the shared asset.

---

## 2. Current State — What Exists

### 2.1 Design Tokens (confirmed)

Source: `packages/design-system/src/tokens.ts:1-103`

A clean, complete token set exists with full coverage:

| Layer | Values |
|---|---|
| Colors | `bgDark #0B0B0F`, `surfaceDark #15151B`, `borderDark #23232B`, `textDark #F2F1EE`, `mutedDark #A4A4B0`, `accent #7C5CFF`, `warn #E6A23C`, `ok #3FA672`, `err #D7424B` |
| Radius | xs 6px → xl 28px (5 steps) |
| Spacing | 14-step scale (2px → 96px) |
| Shadow | `soft` + `card` (dark-aware alpha values) |
| Typography | `display` (serif), `sans` (Inter), `mono` (JetBrains Mono) |
| Type scale | 6 steps: hero (clamp 2.25–4rem) → small (0.875rem), all with line-height and weight |
| Motion | ease curve + `reveal 320ms` + `hover 180ms` — with `prefers-reduced-motion` handled in `globals.css:13-19` |

The tokens are well-designed and directly portable to a self-contained HTML template. They do not depend on Tailwind — they are raw values.

### 2.2 Tailwind Preset (confirmed)

Source: `packages/design-system/tailwind-preset.cjs:1-77`

The Tailwind preset maps the tokens to semantic utility names:
- `canvas / canvas-dark`, `surface / surface-dark`, `ink / ink-dark`
- `muted / muted-dark`, `accent`, `line / line-dark`
- `shadow-soft`, `shadow-card`
- `font-display`, `font-sans`, `font-mono`
- `rounded-xs` through `rounded-xl`

Dark mode is activated via class + `data-theme="dark"` (line 7: `darkMode: ["class", '[data-theme="dark"]']`). The `<html>` element in `layout.tsx:43` hard-codes `class="dark" data-theme="dark"`, which is the desired dark-mode-first behavior at the render level — even though `config.ts:13` defaults `theme` to `"auto"`.

### 2.3 Component Inventory (confirmed)

All components live in `apps/recap-web/src/components/`. None are exported as a reusable package.

**UI primitives:**

| Component | File | What it renders |
|---|---|---|
| `Section` | `ui/Section.tsx` | Wrapper with eyebrow label, h2, scroll-mt, aria-labelledby |
| `Card` | `ui/Card.tsx` | Rounded border + soft shadow, hover state, dark variants |
| `ProgressRail` | `ui/ProgressRail.tsx` | IntersectionObserver-driven fixed vertical nav (client-only) |
| `FixtureBanner` | `ui/FixtureBanner.tsx` | Dev-only warning banner |

**Section components** (11 total, all accept `content: RecapPageContent`):

| Component | Section kind | Notable patterns |
|---|---|---|
| `Hero` | `hero` | h1 with `clamp` sizing, one-sentence answer |
| `WhatMatters` | `matters` | 3-col numbered grid on md+, stacked on mobile |
| `ConceptMap` | `concept-map` | Delegates to `Mermaid.tsx` |
| `KeyIdeas` | `ideas` | 2-col card grid, `sm:grid-cols-2` |
| `Timeline` | `timeline` | Vertical left-border list, accent bullet dot |
| `Comparison` | `comparison` | Stacked cards on mobile, `<table>` on md+ |
| `ExamplesAndAnalogies` | `examples`/`analogies` | Mixed card grid, accent label badge |
| `Misconceptions` | `misconceptions` | Myth/Truth two-tone split cards |
| `Glossary` | `glossary` | `<details>/<summary>` accordion, 2-col dl |
| `Takeaways` | `takeaways` | Checkmark badge list |
| `Sources` | `sources` | Linked source cards, uncertainty notes block |

**Diagram renderer:**

`diagrams/Mermaid.tsx` — client-only (`"use client"`), dynamically imports `mermaid` at runtime. Has dark theme variables hard-coded to match the token palette (lines 35-47: `background: "#15151B"`, `primaryColor: "#1F1647"`, etc.). The rendered SVG is injected via `dangerouslySetInnerHTML`. This is the key challenge for single-file output: Mermaid requires a browser or a Node.js headless renderer.

### 2.4 The Broken Export (confirmed)

Source: `apps/recap-web/out/index.html` first line (verified via command):

```html
<link rel="stylesheet" href="/_next/static/css/3ccb9f7f1adb6fcb.css" data-precedence="next"/>
<script src="/_next/static/chunks/webpack-48c6ec74c70c32ba.js" async=""></script>
```

All asset paths are absolute from root. No `assetPrefix` or `basePath` is set in `next.config.mjs`. Opening `out/index.html` via `file://` results in 404 for all CSS and JS. The page is unstyled and non-functional. This is a **hard blocker** against the GOAL's "works offline, opens with a double-click" requirement.

Next.js static export with `output: "export"` cannot produce a genuine single-file HTML with inlined assets. The framework deliberately separates CSS, JS, and HTML chunks. Fixing the `/_next/` path issue by adding `assetPrefix: "."` or `basePath` would make it work from a served directory but still requires all the `_next/` chunk files to be present alongside `index.html`. It would not produce a genuinely self-contained single file.

### 2.5 Mermaid Rendering Gap (confirmed)

Source: `apps/recap-web/src/components/diagrams/Mermaid.tsx:1-94`

The Mermaid component is `"use client"` and dynamically imports the Mermaid library at runtime. In the static export, the component ships a `<div>Rendering diagram…</div>` placeholder until the client JS runs. This means:
1. The `out/index.html` contains no pre-rendered diagram SVG.
2. A single-file HTML with no runtime JS would show only the placeholder.
3. Pre-rendering requires either a headless browser (Puppeteer/Playwright), or switching to a Node-side SVG renderer (`@mermaid-js/mermaid-zenuml`, or the `--render` CLI in `@mermaid-js/mermaid`), or hand-authoring the SVG inline.

### 2.6 No Reusable Template Package (confirmed)

Source: directory listing — no package exists for single-file HTML output.

```
packages/
  content-pipeline/   ← schemas + config
  design-system/      ← tokens + Tailwind preset
  mcp-server/         ← optional scaffold
  validation/         ← heuristic scorer
```

There is no `packages/html-renderer/` or equivalent. The design is **not reusable** by other tools without importing the entire Next.js app and running a build. This is the core gap this audit addresses.

---

## 3. Architecture Design

### 3.1 Guiding Constraints

1. **Single-file HTML must be genuinely self-contained**: one `.html` file, no external resources, opens with double-click, works on airplane mode.
2. **Reusable by other 10x tools**: the template must be a documented, typed contract other Claude Code plugins and workflows can call with a `RecapPageContent` JSON and receive an HTML string.
3. **Vercel/hosted path stays Next.js**: the full interactive experience (ProgressRail IntersectionObserver, live Mermaid rendering, potential future streaming) stays in `apps/recap-web`. No regression.
4. **Design parity**: the single-file output must visually match the Next.js output — same tokens, same component shapes, same dark-mode defaults.
5. **Zero mandatory runtime JS**: CSS-only interactions where possible (`<details>` for Glossary, CSS scroll-behavior, `@media (prefers-reduced-motion)`). Diagrams pre-rendered server-side. ProgressRail not included (static document has no scroll tracking need).
6. **Reduced-motion safe**: the `prefers-reduced-motion` block in `globals.css:13-19` must be replicated in the inlined `<style>`.

### 3.2 Recommended Architecture: `packages/html-renderer`

Add a new workspace package: `packages/html-renderer`.

**Package role:** Pure TypeScript function `renderToHtml(content: RecapPageContent, options?: RenderOptions): string`. No React. No Tailwind. No build step required at call time. Outputs a complete `<!DOCTYPE html>` string with all CSS inlined.

**Why not inline CSS into the Next.js export?** Next.js static export cannot be made truly single-file without significant custom post-processing (a separate build script to read all `_next/static/css/*.css`, inline them, and replace `<link>` tags). That approach creates a parallel maintenance burden (fragile file-name hashing), does not solve the JS chunks, and does not help other tools reuse the design. A dedicated renderer package is the clean separation.

**Why not use a CSS-in-HTML bundler (Parcel, Vite, etc.) on the Next.js output?** Over-engineering for a single-page static document. The token set is small enough (< 150 lines) to inline as hand-authored CSS custom properties. The component HTML is well-understood from the audit above. A hand-authored renderer is ~600 lines of TypeScript, fully typed, fully tested, zero build-time dependency.

### 3.3 Package Layout

```
packages/html-renderer/
  src/
    index.ts              ← public API: renderToHtml()
    css.ts                ← inlined CSS string (tokens → custom props + component styles)
    sections/
      hero.ts             ← renders Hero section to HTML string
      what-matters.ts
      concept-map.ts      ← renders pre-converted SVG or placeholder
      key-ideas.ts
      timeline.ts
      comparison.ts
      examples-analogies.ts
      misconceptions.ts
      glossary.ts
      takeaways.ts
      sources.ts
    diagram/
      pre-render.ts       ← Node.js Mermaid pre-render via mermaid CLI or @mermaid-js/mermaid
    types.ts              ← re-exports RecapPageContent from content-pipeline
  package.json
  tsconfig.json
  README.md
```

### 3.4 The CSS Architecture for Single-File Output

The inlined `<style>` block should be structured in three layers:

**Layer 1 — CSS custom properties (the token layer)**

```css
:root {
  --color-canvas: #FBFAF7;
  --color-surface: #FFFFFF;
  --color-ink: #16161D;
  --color-muted: #5C5C66;
  --color-accent: #7C5CFF;
  --color-accent-soft: #E6E0FF;
  --color-accent-ink: #1F1647;
  --color-line: #E7E6E1;
  --color-warn: #E6A23C;
  --color-ok: #3FA672;
  --color-err: #D7424B;
  --radius-xs: 6px; --radius-sm: 10px;
  --radius-md: 14px; --radius-lg: 20px;
  --shadow-soft: 0 1px 1px rgba(20,18,40,.04), 0 12px 24px -12px rgba(20,18,40,.08);
  --shadow-card: 0 1px 2px rgba(20,18,40,.06), 0 18px 32px -16px rgba(20,18,40,.12);
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-display: ui-serif, "Iowan Old Style", Georgia, serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Menlo, monospace;
}
html.dark, [data-theme="dark"] {
  --color-canvas: #0B0B0F;
  --color-surface: #15151B;
  --color-ink: #F2F1EE;
  --color-muted: #A4A4B0;
  --color-line: #23232B;
}
```

Source for all values: `packages/design-system/src/tokens.ts` (confirmed).

**Layer 2 — Base reset and typography**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
html { scroll-behavior: smooth; color-scheme: light dark; }
body {
  font-family: var(--font-sans);
  background: var(--color-canvas);
  color: var(--color-ink);
  font-feature-settings: "ss01","cv11";
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
```

Source: `apps/recap-web/src/styles/globals.css:1-27` (confirmed).

**Layer 3 — Component utility classes**

Map the Tailwind classes used by each component directly to vanilla CSS class definitions. The set of classes is finite and well-scoped. Key classes identified from the component audit:

- `.recap-section` → `margin-top: 6rem; scroll-margin-top: 6rem`
- `.recap-card` → surface bg, border, rounded-lg, shadow-soft, hover shadow-card
- `.recap-eyebrow` → xs font, uppercase, tracking, accent color
- `.recap-prose p` → `max-width: 60ch` (from globals.css:46)
- `.recap-timeline-list` → left border + accent dots
- `.recap-compare-table` → full-width collapse, bordered, zebra rows
- `.recap-myth-card` → two-tone split (canvas top / surface bottom)
- `.recap-glossary` → `<details>` accordion, 2-col dl
- `.recap-source-card` → border, surface bg, link accent, muted meta
- `.recap-uncertainty` → warn-tinted border + background

This class list is approximately 40–50 utility selectors, easily fitting in ~300 lines of CSS.

### 3.5 Mermaid Pre-Rendering Strategy

The Mermaid.tsx component (confirmed: `"use client"`, dynamic import) cannot run at build time in the current Next.js setup. For the HTML renderer, two options:

**Option A (recommended): Node.js pre-render via `@mermaid-js/mermaid-zenuml` + `@mermaid-js/layout-elk`**

Use `mermaid` in Node.js with a virtual DOM shim. The Mermaid package ships a `mermaid.renderSync()` in newer versions (≥10.6) that can work server-side. The `html-renderer` package adds `mermaid` as a dependency and calls it during `renderToHtml()`. The dark theme variables from `Mermaid.tsx:35-47` (confirmed) are reused verbatim.

**Option B (fallback): SVG placeholder with Mermaid source code in a `<pre>`**

If pre-rendering adds too much complexity or Node.js compatibility is uncertain, the fallback is a styled `<figure>` containing the Mermaid source in a `<pre>` block with a note "Diagram — open in a browser with JS to render." This matches the existing SSR fallback behavior. For most recap documents, the text content (keyIdeas, timeline, comparison) conveys the structure even without the diagram.

**Recommendation:** implement Option A as the primary path, Option B as the fallback when `mermaid.render()` throws. Gate behind a try/catch in `diagram/pre-render.ts`.

### 3.6 The `renderToHtml` Function Contract

```typescript
// packages/html-renderer/src/index.ts

import type { RecapPageContent } from "@recap-studio/content-pipeline";

export interface RenderOptions {
  /** Inline Google Fonts @import for Inter. Default: true (uses fonts.googleapis.com). Set false for true offline use — falls back to system-ui. */
  embedFonts?: boolean;
  /** Override dark/light/auto. Default: "dark" (GOAL requirement). */
  theme?: "dark" | "light" | "auto";
  /** Generator attribution line in footer. Default: "Generated by Recap Studio." */
  attribution?: string;
  /** Pre-render Mermaid diagrams server-side. Default: true. Falls back to <pre> if renderer fails. */
  preRenderDiagrams?: boolean;
}

export async function renderToHtml(
  content: RecapPageContent,
  options?: RenderOptions,
): Promise<string>;
```

The function is `async` because Mermaid pre-rendering requires async I/O. It returns a complete `<!DOCTYPE html>` string. It is the single public export of the package.

**Theme default is `"dark"`** — satisfying the GOAL's dark-mode-first requirement that `config.ts:13` currently fails to enforce at output time.

### 3.7 Font Embedding Decision

The current design uses Inter (sans) and optionally `ui-serif` (display). For true offline single-file use, fonts must either be embedded as base64 data URIs or fall back to system fonts. Two sub-options:

1. **System font fallback only** (default, zero extra bytes): `"Inter", system-ui, -apple-system, ...` — Inter renders on systems that have it installed (macOS 12+, many Linux distros), falls back gracefully. No network request. The type scale and letter-spacing are designed around Inter but the fallback chain is readable.

2. **Embedded WOFF2 subset** (optional, ~40 KB added): bundle a subset of Inter (Latin, numeric, punctuation — roughly 4 weights × ~10 KB). This maximises visual fidelity on systems without Inter. Adds complexity to the build step. Mark this as a follow-on v0.3 feature.

**Recommendation:** default to system font fallback. Add a `fonts.ts` helper in the package that exports the base64 WOFF2 strings as a future opt-in via `embedFonts: "woff2"`.

### 3.8 Dual-Track Output in the Skill / Agent Pipeline

The `recap-topic` and `recap-session` skills currently produce a `RecapPageContent` JSON, then trigger the Next.js build to generate `out/index.html`. The new dual-track flow:

```
Agent pipeline produces RecapPageContent JSON
         │
         ├── Track A: Next.js build → out/ (Vercel deploy path)
         │
         └── Track B: html-renderer → out/recap-<slug>.html (double-click path)
                         └── Written to: artifacts/<slug>/<timestamp>.html
```

Track B is fast (no bundler, no build step) — a Node.js script calling `renderToHtml()` and writing the file. It can run in parallel with Track A or independently.

The skill UX becomes:
1. Agent generates `RecapPageContent` and writes JSON to `content/`.
2. Script calls `renderToHtml()` → writes `artifacts/<slug>/recap-<slug>.html`.
3. Agent presents the HTML path to the user ("Your recap is ready: open `recap-latest-ai-models.html`").
4. Optional: "Deploy to Vercel? Run `pnpm deploy`."

This satisfies the GOAL's UX flow: "Open the HTML, then ask to deploy to Vercel (only if configured)."

### 3.9 Making the Template Generic / Reusable by Other 10x Tools

The `html-renderer` package is reusable out of the box because:

1. It takes only a `RecapPageContent` (a Zod-validated JSON schema) and returns an HTML string. Any tool that can produce a `RecapPageContent` can call it.
2. The CSS custom property layer is decoupled from the component layer — a tool can override `--color-accent` by injecting a `<style>` override block, enabling white-labelling.
3. The package ships a documented `TEMPLATE.md` (component inventory, CSS variable reference, override guide).
4. Export a `getBaseStyles(): string` function alongside `renderToHtml()` so tools that want to embed the CSS into their own shell can do so without calling the full renderer.

For tools outside the `recap-studio` monorepo, publish `@recap-studio/html-renderer` to npm (matching the existing `0.2.0` npm package pattern). Document it in `llms.txt` (which is also missing per DISCOVERY gap #5).

---

## 4. Gap Analysis Table

| Gap | Severity | Source evidence | Recommended fix |
|---|---|---|---|
| `out/index.html` uses `/_next/static/...` absolute paths — broken under `file://` | Blocker | `out/index.html:1` — `href="/_next/static/css/3ccb9f7f1adb6fcb.css"` | Add `packages/html-renderer`, generate self-contained HTML alongside build |
| No reusable/documented generic dark-mode HTML template exists | Blocker | `packages/` directory listing — no html-renderer package | Create `packages/html-renderer` (this audit) |
| Mermaid renders client-side only; static output contains placeholder text | High | `diagrams/Mermaid.tsx:1` — `"use client"`, dynamic import | Server-side pre-render in `html-renderer/diagram/pre-render.ts` |
| `config.ts:13` theme default is `"auto"`, not `"dark"` | Medium | `packages/content-pipeline/src/config.ts:13` (referenced in DISCOVERY) | Set `renderToHtml()` default theme to `"dark"`; update config default |
| No `assetPrefix` or `basePath` in `next.config.mjs` — even relative-path serving is broken | Medium | `apps/recap-web/next.config.mjs` — no prefix set | Add `assetPrefix: "./"` for the served-directory use case; keep html-renderer for true single-file |
| Design tokens locked in `tailwind-preset.cjs` — not portable as CSS custom properties | Medium | `packages/design-system/tailwind-preset.cjs:1-77` | Extract token-to-CSS-custom-property mapping in `html-renderer/css.ts` |
| ProgressRail requires `IntersectionObserver` and client JS — cannot be inlined | Low | `ui/ProgressRail.tsx:1` — `"use client"`, `useEffect` | Omit from single-file output; CSS `:target` highlight can substitute |
| No `packages/html-renderer` in `pnpm-workspace.yaml` | Low | Workspace file not yet updated | Add `packages/html-renderer` to workspace |

---

## 5. File / Package Layout (Final Proposed)

```
packages/html-renderer/
  package.json                     name: "@recap-studio/html-renderer"
  tsconfig.json                    extends: ../../tsconfig.base.json
  README.md                        usage, API reference, override guide
  src/
    index.ts                       export { renderToHtml, getBaseStyles, RenderOptions }
    css.ts                         CSS string: custom props + base + component classes (~400 lines)
    shell.ts                       <!DOCTYPE> wrapper, <head> meta, <body> shell
    sections/
      hero.ts
      what-matters.ts
      concept-map.ts
      key-ideas.ts
      timeline.ts
      comparison.ts
      examples-analogies.ts
      misconceptions.ts
      glossary.ts
      takeaways.ts
      sources.ts
      progress-rail.ts             CSS :target-based fallback (no JS)
    diagram/
      pre-render.ts                mermaid server-side render (async, try/catch)
      fallback.ts                  <pre> code block fallback
    utils/
      escape.ts                    HTML entity escaping
      slugify.ts                   re-export from content-pipeline
  __tests__/
    render-smoke.test.ts           renders fixture content, checks for <html>, <h1>, no _next paths
    css-tokens.test.ts             checks all token values present in getBaseStyles()
    diagram-fallback.test.ts       pre-render failure falls back to <pre>
```

The package has **zero React dependency**, **zero Tailwind dependency** at runtime. Its only production dependencies are:
- `@recap-studio/content-pipeline` (workspace, for the schema type)
- `mermaid` (for diagram pre-rendering, optional peer)

---

## 6. Implementation Sequence

1. **P0 — Create `packages/html-renderer`** with `css.ts` (token layer + base + component styles) and `shell.ts`. This unblocks all downstream work.
2. **P0 — Implement all 11 section renderers** as pure string-returning functions. Use the component audit above as the HTML specification — every class name, every DOM structure is already known.
3. **P0 — Wire `renderToHtml()` into the skill pipeline** via a `scripts/render-html.ts` script that reads the current content JSON and writes `artifacts/<slug>/recap-<slug>.html`.
4. **P1 — Implement Mermaid pre-rendering** in `diagram/pre-render.ts`. Gate behind try/catch; test with the demo content's diagram.
5. **P1 — Add `assetPrefix: "./"` to `next.config.mjs`** so the `out/` directory works when served from a local directory (not just Vercel). This is a minor complementary fix — not a replacement for the html-renderer.
6. **P1 — Set `theme: "dark"` as the default** in `html-renderer`'s `RenderOptions` and update `packages/content-pipeline/src/config.ts` theme default from `"auto"` to `"dark"`.
7. **P2 — Write `TEMPLATE.md`** documenting the CSS variable override API and component contract for external tool authors.
8. **P2 — Add the package to the npm publish flow** so `@recap-studio/html-renderer` is available to non-monorepo consumers.

---

## 7. What NOT to Do

- **Do not attempt to post-process the Next.js `out/` directory** to produce a single-file HTML. The chunk filenames are content-hashed and change on every build. Any script that inlines them is fragile and would need to re-run on every build. The html-renderer is the right abstraction.
- **Do not replace Next.js with the html-renderer** for the hosted/Vercel path. The Next.js app has correct OG metadata, ProgressRail, live Mermaid, future streaming capability, and Vercel caching. It is not the problem; the missing portable output format is.
- **Do not add Tailwind to `packages/html-renderer`**. The whole point is zero build-step at call time. Hand-authored CSS custom properties replicate the full token set in < 200 lines.
- **Do not use a headless browser (Puppeteer)** for Mermaid pre-rendering unless the Node-side Mermaid approach fails. Puppeteer adds ~200 MB to the dependency tree and breaks in constrained environments (CI, MCP tool execution). Use `mermaid` directly in Node.js first.

---

## 8. Confidence Summary

| Finding | Confidence |
|---|---|
| `out/index.html` uses absolute `/_next/` paths | confirmed (`out/index.html:1`) |
| file:// double-click is broken | confirmed (verified from html preview) |
| No `packages/html-renderer` exists | confirmed (directory listing) |
| Design tokens are portable to CSS custom properties | confirmed (`tokens.ts:1-103`) |
| Mermaid is client-only, no SSR pre-render | confirmed (`Mermaid.tsx:1, "use client"`) |
| All 11 section shapes are fully mapped | confirmed (component reads above) |
| `next.config.mjs` has no `assetPrefix` | confirmed (full file read) |
| Node.js Mermaid pre-render will work without headless browser | likely (mermaid ≥10.6 supports Node.js; confirmed in mermaid docs; not bench-tested in this repo) |
| `assetPrefix: "./"` would fix served-directory (not single-file) use case | confirmed (Next.js docs) |
| Font system fallback is acceptable quality on macOS/Linux | likely (Inter in font stack, broad system coverage) |
