# Phase 3 — UX/UI & Visual Design Audit

_Run 2026-05-29. Every finding cites file:line or command output. Confidence labels: confirmed | likely | uncertain._

---

## Scope

This audit judges whether the **generated page** is actually beautiful, calm-premium (Linear/Vercel/Stripe-grade), dark-mode-first, mobile-first, visuals-over-text, scannable, and ~5-min — or whether it is generic "AI slop". Evidence is drawn from:

- `apps/recap-web/src/styles/globals.css`
- `packages/design-system/src/tokens.ts` + `tailwind-preset.cjs`
- All 16 components in `apps/recap-web/src/components/**`
- `apps/recap-web/src/app/layout.tsx` + `page.tsx`
- `apps/recap-web/out/index.html` (76 410 bytes, built fresh)
- Generated CSS `out/_next/static/css/3ccb9f7f1adb6fcb.css`
- WCAG contrast ratios computed via Python (sRGB linearisation, WCAG 2.1 formula)

---

## 1. Dark-Mode Architecture

### 1.1 Default enforcement

**Confirmed. Dark is the hard default.**

`layout.tsx:43` hardcodes `className="dark" data-theme="dark"` on `<html>`. The Tailwind preset (`tailwind-preset.cjs:7`) uses `darkMode: ["class", '[data-theme="dark"]']`. Generated CSS selectors are `:is([data-theme=dark] *)` — not `@media (prefers-color-scheme)`. This means dark mode is always active regardless of system preference, which matches the GOAL.

One tension: `globals.css:6` declares `color-scheme: light dark` (both) on `:root`, which lets the browser use system scrollbar colour. Since the page is always dark, this should be `color-scheme: dark` only. Minor but worth fixing for scrollbar/select-box colour consistency.

**Severity: low. Fix: change `color-scheme: light dark` → `color-scheme: dark` in `globals.css:6`.**

### 1.2 Palette quality

Tokens (`tokens.ts:7–23`):

| Token | Value | Role |
|---|---|---|
| `bgDark` / `canvasDark` | `#0B0B0F` | Page background |
| `surfaceDark` | `#15151B` | Cards, tables |
| `borderDark` / `lineDark` | `#23232B` | Dividers |
| `textDark` / `inkDark` | `#F2F1EE` | Body copy |
| `mutedDark` | `#A4A4B0` | Secondary text |
| `accent` | `#7C5CFF` | CTA, labels, timeline |

The palette is **editorially sound and distinctly non-generic**. The near-black canvas (#0B0B0F) is perceptually neutral-cool — closer to Vercel's page surface than the blue-tinged blacks many tools use. The single violet accent (#7C5CFF) keeps the palette disciplined; there is no rainbow-badge syndrome. The surface/canvas two-step (15151B vs 0B0B0F) creates a subtle but effective layer differentiation on cards.

**Quality verdict: premium. Confirmed not AI slop.**

### 1.3 Contrast ratios (WCAG 2.1, computed)

| Pair | Ratio | Pass |
|---|---|---|
| mutedDark #A4A4B0 on canvasDark #0B0B0F | 7.97:1 | AA ✓ |
| mutedDark #A4A4B0 on surfaceDark #15151B | 7.37:1 | AA ✓ |
| inkDark #F2F1EE on canvasDark #0B0B0F | 17.39:1 | AA ✓ |
| accent #7C5CFF on canvasDark #0B0B0F | 4.52:1 | AA ✓ |
| accent #7C5CFF on surfaceDark #15151B | **4.18:1** | AA-large only ⚠ |
| accentInk #1F1647 on accentSoft #E6E0FF | 13.03:1 | AA ✓ |
| err #D7424B on canvasDark #0B0B0F | **4.46:1** | AA-large only ⚠ |
| ok #3FA672 on canvasDark #0B0B0F | 6.46:1 | AA ✓ |
| warn #E6A23C on surfaceDark #15151B | 8.31:1 | AA ✓ |

**Two failures at body-text sizes:**

1. **Accent on surface-dark (4.18:1)** — `Misconceptions.tsx:27` and `ProgressRail.tsx:67` render `text-accent` on `dark:bg-surface-dark`. At 12px (the xs label size), this fails AA normal-text (needs 4.5:1). At 14px+ it is borderline acceptable as large text only.
2. **Err on canvas-dark (4.46:1)** — `Misconceptions.tsx:19` renders `text-xs … text-err` ("Myth" label) on `dark:bg-canvas-dark`. xs = 12px, fails AA for normal text.

**Fix: bump `err` to #E04E55 (ratio ≈ 5.1:1 on #0B0B0F) and add 1px font-weight boost or use 14px minimum for error labels.**

---

## 2. Typography

### 2.1 Scale

Defined in `tokens.ts:65–72`:

```
hero:  clamp(2.25rem, 6vw, 4rem)   weight 650  lh 1.05
h1:    clamp(1.75rem, 4vw, 2.5rem) weight 600  lh 1.1
h2:    clamp(1.5rem, 3vw, 2rem)    weight 600  lh 1.15
h3:    1.25rem                     weight 600  lh 1.25
body:  1rem                        weight 400  lh 1.7
small: 0.875rem                    weight 400  lh 1.55
```

The clamp-based hero/h1 is good: fluid, readable at 360px, impactful at 1440px. The `lh 1.7` body is generous and appropriate for reading-focused content.

### 2.2 Critical gap: Hero h1 uses `font-sans`, not the serif display font

**Confirmed. `Hero.tsx:17`: `className="font-sans text-4xl leading-[1.05] md:text-6xl"`**

The design system defines a premium serif stack (`tokens.ts:57`: `ui-serif, "Iowan Old Style", "Apple Garamond", "Source Serif Pro", Georgia`) and a `typeScale.hero` with `weight: 650`, but this font is **never used anywhere in the codebase**. A grep for `font-display` across `src/` returns zero results.

Using Inter at 6xl for the hero is functionally fine but aesthetically generic. Premium editorial tools (Linear's blog, Vercel's docs, Stripe's homepage) all use a serif or heavy display face at the hero level to signal "this was crafted." Using Inter everywhere makes the page look like a Tailwind UI template.

**Severity: medium. Fix: Apply `font-display` to `Hero.tsx` h1. The token already exists; it just needs wiring.**

### 2.3 Font loading: Inter is system fallback only, not loaded

**Confirmed.** `globals.css` has no `@font-face`, no Google Fonts link, no `next/font`. `layout.tsx` has no font import. The `font-sans` stack starts with `"Inter"` — if the reader has Inter installed (common on macOS, less so on Windows/Android), they get it. Otherwise they fall back to `system-ui`.

This is the **correct engineering tradeoff for an offline-first tool** — no external dependency, fast load. However, the README and design intent position this as a premium reading experience. A `next/font/google` Inter load (self-hosted, preloaded) would guarantee the intended rendering everywhere. Without it, the visual experience is undefined on non-Inter systems.

**Severity: low/medium (depends on target audience). Fix: Add `import { Inter } from "next/font/google"` with `subsets: ["latin"]`, `display: "swap"` in `layout.tsx` — or accept the system font tradeoff and document it.**

### 2.4 Font-weight 650 defined in tokens but not usable

`tokens.ts:66` specifies `weight: 650` for the hero size. Tailwind's default font-weight scale has `font-semibold` (600) and `font-bold` (700); there is no 650. The tailwind preset does not add a custom `fontWeight.650`. So even if `font-display` were applied, the exact intended weight cannot be expressed in the current config.

**Fix: Add `fontWeight: { "650": "650" }` to the Tailwind preset's `theme.extend`.**

### 2.5 Section.tsx h2 misses `font-weight`

`Section.tsx:30`: `className="font-sans text-2xl leading-tight md:text-3xl"` — no weight class. Tailwind's default `font-weight` for bare headings is `inherit` (which cascades to 400 from body). All 10 section headings render at regular weight, making them look like body text that's slightly larger rather than genuine h2s.

**Severity: high. Fix: Add `font-semibold` to `Section.tsx:30`.**

---

## 3. Color Token Naming Anti-Pattern

`tailwind-preset.cjs` defines `ink.dark`, `canvas.dark`, `surface.dark`, `muted.dark`, `line.dark` as explicit child values, not CSS custom properties. This means in dark mode every element needs an explicit `dark:bg-canvas-dark dark:text-ink-dark` class pair — there is no automatic inversion via CSS variables. A review of the generated HTML confirms this: every dark-mode variant is manually duplicated.

This is workable but creates two specific bugs:

1. **`body` in `layout.tsx:44`**: `bg-canvas text-ink antialiased dark:bg-canvas-dark dark:text-ink-dark`. The `dark:` classes only fire when a `.dark` ancestor exists. Since the `<html>` element has `class="dark"`, the selector `:is([data-theme=dark] *) body` works. But `body` itself is not a descendant of `html[data-theme=dark]` in the `:is()` sense — it IS the html's direct child, so this should work. **Confirmed working** from CSS output. No bug here.

2. **`FixtureBanner.tsx:14`**: `bg-white/60` for the `<code>` background — this is a light-mode colour with no `dark:` counterpart. On the dark canvas the code chip will render as `rgba(255,255,255,0.6)` — translucent white — which looks noisy against the dark accent-soft background. **Severity: low. Fix: replace with `dark:bg-accent-ink/40`.**

---

## 4. Spacing Rhythm

The spacing scale in `tokens.ts:34–49` is a standard 4px-base system (1=4px, 2=8px, 4=16px, 6=24px, 8=32px…). The components use it consistently:

- Section gaps: `mt-16` (64px) mobile, `md:mt-24` (96px) — generous, breathable. ✓
- Card padding: `p-5` (20px) — appropriate for content density. ✓
- Content within cards: `mt-2` (8px) between title and body — slightly tight for comfort on a reading-focused product. **Consider `mt-3` (12px).** 
- Timeline `pl-5` (20px) with `border-l-2` — the dot marker at `-left-[27px]` is hand-calculated. On very narrow screens (360px) the `pl-5` may clip the dot when combined with `px-5` outer padding. **Not confirmed to break** but worth a 360px device test.
- Section `scroll-mt-24` (96px): appropriate for the fixed ProgressRail, which is only visible on md+. On mobile there's no fixed nav, so `scroll-mt-24` adds dead space when following anchor links. **Severity: low.**

---

## 5. Component-by-Component Assessment

### 5.1 Hero (`Hero.tsx`)

**Verdict: functional but not premium.**

- `pt-4 md:pt-10` — tight top padding. At 360px the page starts 16px from the viewport top, immediately jumping into content. Premium tools give the hero room to breathe (`pt-16` minimum). `pb-2` is especially cramped.
- The eyebrow `text-xs uppercase tracking-[0.14em] text-accent` pattern is sharp and editorial. ✓
- No visual — no illustration, gradient, or featured stat. The hero is 100% text. For a "visuals-over-text" goal, the hero is the weakest section. Stripe puts a animated gradient; Linear puts a product screenshot; Vercel puts an animated globe. This hero is just a headline and a subtitle.
- `font-sans` h1 misses the display serif discussed above.

### 5.2 WhatMatters (`WhatMatters.tsx`)

**Verdict: clean and scannable. Minor improvements possible.**

- Three-column grid at `md:` works. On mobile, stacks cleanly to full-width cards. ✓
- The numbered badge (`h-6 w-6 rounded-full bg-accent-soft text-accent-ink`) is a nice detail. ✓
- Five-minute path renders as a long inline string (`→` separated) — hard to scan at `text-sm`. Consider an ordered list with flex-wrap or a horizontal scroll strip. **Severity: medium.**
- `text-base leading-relaxed` on card text — good. ✓

### 5.3 ConceptMap / Mermaid (`ConceptMap.tsx`, `Mermaid.tsx`)

**Verdict: architecturally sound, visually incomplete in SSR.**

- Mermaid renders client-side only. SSR output (`out/index.html`) shows "Rendering diagram…" placeholder for both diagrams. The page has zero visual hierarchy benefit from the diagrams in SSR. **Confirmed from HTML: `<div class="flex min-h-[140px] items-center justify-center … text-muted …">Rendering diagram…</div>`**
- Mermaid theme is correctly set to `dark` with custom variables matching the design palette (`Mermaid.tsx:29–49`). ✓
- The `classDef tier fill:#E6E0FF,stroke:#7C5CFF` in the diagram code is **light-mode colours** (accent-soft background) — they will clash with the dark theme. The mermaid `themeVariables` override the global palette but `classDef` is baked into the diagram code itself. **Severity: medium.**
- `overflow-x-auto` on the diagram container (`Mermaid.tsx:71`) handles wide diagrams on mobile. ✓
- No reduced-motion handling in Mermaid component — mermaid.js animations will still play. The `globals.css` blanket `animation-duration: 0.001ms` covers this at the CSS level. ✓

### 5.4 KeyIdeas (`KeyIdeas.tsx`)

**Verdict: good pattern, low visual density.**

- `sm:grid-cols-2` two-column grid — well-structured. ✓
- The `Card` component (`Card.tsx:7–19`) uses `shadow-soft` + `hover:shadow-card`. Good interactive affordance. ✓
- **No icon rendering.** The `RecapPageContent` schema includes an `icon` field on each key idea (`keyIdeas[].icon = "layers"`, `"brain"`, etc.) but `KeyIdeas.tsx` does not render it. This is a significant visual gap — icons would dramatically improve scannability and the "visuals-over-text" goal. **Severity: high.**
- Card font weights: h3 has no explicit weight (inherits 400 from body). Should be `font-semibold`.
- The odd 5th card (when keyIdeas has 5 items) breaks the 2-column grid and renders full-width on sm+. Not broken but aesthetically unresolved. **Fix: use `sm:grid-cols-2 last:col-span-2` or limit to even counts in schema.**

### 5.5 Timeline (`Timeline.tsx`)

**Verdict: the best-designed section.**

- Vertical line + dot connector (`border-l-2 border-accent/30`, dot at `border-2 border-accent`) is clean. ✓
- Date → title → body information hierarchy is clear. ✓
- Dot position `-left-[27px]` is hand-calculated. If padding or border changes, this breaks. **Fix: use a proper `ml-[-27px]` relative to the padding, or switch to `flex` layout for the connector.**
- `space-y-4` between items — adequate. ✓

### 5.6 Comparison (`Comparison.tsx`)

**Verdict: excellent mobile-first pattern.**

- Cards-on-mobile / table-on-md is the correct approach. ✓
- Table zebra striping uses `odd:bg-surface even:bg-canvas dark:odd:bg-surface-dark dark:even:bg-canvas-dark` — subtle and appropriate. ✓
- No `overflow-x-auto` on the table container — if column count grows, the table could overflow horizontally on narrow desktops (768–900px). The `hidden overflow-hidden rounded-md … md:block` wrapper does have `overflow-hidden`, which clips rather than scrolls. **Severity: medium. Fix: change `overflow-hidden` to `overflow-x-auto` on the table wrapper.**
- `h3` heading above comparison block has no `font-semibold` (same Section h2 problem). ✓

### 5.7 ExamplesAndAnalogies (`ExamplesAndAnalogies.tsx`)

**Verdict: functional, repetitive layout.**

- Examples and analogies use the same `Card` component with only an eyebrow label change. There's no visual differentiation between an "Example" card and an "Analogy" card — just the text label. A Stripe or Linear approach would use a distinct border colour, icon, or left-accent stripe to create visual hierarchy. **Severity: medium.**
- The `text-xs font-semibold uppercase tracking-wider text-accent` eyebrow pattern is used in 8 different places with no abstraction — it is a de-facto component that should be a reusable `<Eyebrow>` primitive. No visual bug, but a maintenance smell.

### 5.8 Misconceptions (`Misconceptions.tsx`)

**Verdict: the most visually distinctive section.**

- Two-panel card (myth top / truth bottom) with colour-coded labels (`text-err` / `text-ok`) is clever and scannable. ✓
- `text-err` label fails AA contrast at xs as noted in §1.3. **Fix already cited.**
- No icon for the myth/truth state — a ✗/✓ icon would reinforce the semantic. ✓

### 5.9 Glossary (`Glossary.tsx`)

**Verdict: functional, interaction is unpolished.**

- `<details>/<summary>` expand pattern is accessible and lightweight. ✓
- Chevron indicator is a literal `⌄` character (`Glossary.tsx:19`) — this is fragile across system fonts and OS rendering engines. On some platforms it renders as a question mark or missing glyph. **Fix: replace with an SVG chevron or a Tailwind-border-based triangle.**
- The `transition-transform group-open:rotate-180` animation on the chevron does not respect `prefers-reduced-motion`. The CSS blanket rule in `globals.css:13–19` catches it (`transition-duration: 0.001ms !important`), so no a11y bug, but the UX is: the chevron snaps (no visual feedback) for reduced-motion users. **Severity: low.**
- `cursor-pointer list-none` on `<summary>` is correct; `list-none` removes the default marker arrow in Chrome. ✓

### 5.10 Takeaways (`Takeaways.tsx`)

**Verdict: clean but minimal.**

- Checkmark-badge (`bg-accent text-white rounded-md`) + text list is readable. ✓
- The checkmark is a literal `✓` character in markup (`Takeaways.tsx:18`) — same glyph fragility as Glossary. **Fix: SVG.**
- No visual hierarchy between items; all look equal. Premium tools weight the first takeaway differently (bolder, larger). **Severity: low.**

### 5.11 Sources (`Sources.tsx`)

**Verdict: excellent information design.**

- Source card with title link + metadata string + optional summary is the right pattern. ✓
- `underline-offset-4 hover:underline` link — clean. ✓
- Uncertainty notes box with `border-warn/40 bg-warn/10` — good editorial signal. ✓
- No external link icon on the source links — a `↗` or SVG external icon would signal the link goes out of the page. **Severity: low.**

### 5.12 ProgressRail (`ProgressRail.tsx`)

**Verdict: good nav pattern, mobile hidden (correct).**

- Hidden on mobile (`hidden … md:block`) — correct. ✓
- Fixed left rail at `left-4` on md+ — works, but at exactly 768px viewport width this rail overlaps the left edge of the `max-w-3xl` content column (`mx-auto max-w-3xl px-5`). At 768px, `px-5` = 20px padding, but the rail is `fixed left-4` = 16px — it is literally inside the content area. The dot + label take ~80px of width. **Severity: medium.** The rail labels will visually overlap the first few characters of the left edge of content on exactly-768px viewports. Fix: increase `left` or only show at `lg:`.
- Dot active state: `bg-accent` active, `bg-line dark:bg-line-dark` inactive. The inactive dot colour on dark canvas (`#23232B` on `#0B0B0F`) has a contrast ratio of ~1.5:1 — functionally invisible. Only the text label next to it is readable. **Severity: medium.** Fix: use `bg-muted-dark` (contrast ~5.0:1) for inactive dots.

### 5.13 Card UI primitive (`Card.tsx`)

**Verdict: correct but light.**

- `rounded-lg` maps to `border-radius: 20px` (from the preset) — this is the `lg` radius value. Appropriate for cards. ✓
- `shadow-soft` = `0 1px 1px rgba(20,18,40,0.04), 0 12px 24px -12px rgba(20,18,40,0.08)` — designed for light mode. On dark surfaces, light-coloured shadows (neutral dark base) don't read. The shadow adds essentially nothing on a `#15151B` surface. **Severity: medium.** Premium dark-mode products (Vercel's dashboard, Linear's UI) replace light-mode shadows with subtle inner borders or glow effects. Fix: add `dark:shadow-none dark:ring-1 dark:ring-line-dark/60` for a crisp inner border that actually reads on dark.

### 5.14 FixtureBanner (`FixtureBanner.tsx`)

**Verdict: functional, one dark-mode bug.**

- `bg-accent-soft` (`#E6E0FF`) with `text-accent-ink` (`#1F1647`) in dark mode — the banner does not have a `dark:` background override. It will render light purple (#E6E0FF) on the otherwise near-black page, which is jarring but readable. It's intentional (it's a banner), but it breaks the calm dark aesthetic. **Severity: low.** Fix: `dark:bg-accent-ink dark:text-accent-soft`.
- `bg-white/60` on `<code>` in the banner — renders as translucent white on the accent-soft background. Contrast is acceptable (accentInk is 13:1 vs accentSoft) but visual texture is messy.

---

## 6. Motion & Animation

**Verdict: correctly minimal, but essentially zero motion.**

- `globals.css:13–20` implements the reduced-motion blanket correctly — animations kill to 0.001ms, transitions to 0.001ms. ✓
- `motion` tokens (`tokens.ts:74–80`) define `ease`, `reveal: 320ms`, `hover: 180ms` — but these values are **not used anywhere in the component code**. None of the components use `transition-[320ms]`, `animate-`, or CSS custom property vars wired to these tokens. The tokens are documentation with no implementation.
- The only actual transitions in the codebase: `transition-shadow` on Card (hover shadow), `transition-colors` on ProgressRail links, `transition-transform` on Glossary chevron. All use Tailwind defaults, not the custom timing values.
- There are no scroll-driven animations, no entrance animations, no stagger patterns. For a tool that claims to produce "beautiful" explainers, this is the largest differentiator from premium products. Linear's changelog, Vercel's homepage, and Stripe's pricing page all use reveal-on-scroll as a core part of their visual identity.
- **Severity: medium.** Recommend at minimum: `@keyframes fadeInUp` with `animation-fill-mode: both`, applied to section content, respecting `prefers-reduced-motion`. Wire to the `motion.reveal` / `motion.ease` tokens.

---

## 7. Mobile-First Assessment (360px)

**Verdict: structurally correct, three edge cases.**

- Content column: `max-w-3xl px-5` = 20px horizontal padding. At 360px, usable content width = 320px. ✓
- All grids collapse correctly to single column on mobile. ✓
- Comparison table is mobile-hidden; card version shown — correct approach. ✓
- ProgressRail is hidden on mobile. ✓
- No horizontal scroll on main content detected. ✓

**Issues at 360px:**
1. Timeline dot at `-left-[27px]` relative to `pl-5` container — total left offset from content is 5px + 27px = 32px out of the card's left edge. With `border-l-2` inside the `pl-5` container: the dot is at left margin minus 27px from the list's left edge. Inside the outer `px-5`, at 360px this should still be within the viewport. **Likely OK but needs device test.**
2. `WhatMatters.tsx` five-minute path: `mt-6 text-sm text-muted` renders as one unbroken paragraph with `→` separators. At 360px with `max-w: 60ch` from `.recap-prose`, this wraps to ~5 lines. Readable but not scannable. **Fix: render as flex-wrap chips.**
3. No `overflow-x-auto` on Section wrappers — if any future section adds a wide table without the Comparison-style mobile/desktop split, it could break at 360px. Risk is low with current content but architectural. **Preemptive fix: add `overflow-x-hidden` on `<main>`.**

---

## 8. Visual Identity: Premium or Templated?

### What reads as premium:
- The near-black palette with the single violet accent is calm and distinctive. Not a Bootstrap purple; not a CSS gradient. ✓
- The eyebrow label pattern (xs uppercase tracking-wide accent) is consistent, editorial, and branded. ✓
- The two-panel Misconceptions card is genuinely clever — this looks custom, not templated. ✓
- The Timeline with the vertical accent rail is clean and well-executed. ✓
- The overall information hierarchy (eyebrow → h2 → content) is consistent across 10 sections. ✓

### What reads as generic/sloped:
1. **All text, no illustration.** The hero is a headline and subtitle. Premium explainer tools (Linear, Vercel, Stripe) use a visual at the top — even an abstract SVG gradient or a custom illustration. The "visuals-over-text" claim in the README is not supported by the current hero implementation.
2. **Icon fields are defined but never rendered.** `keyIdeas[].icon` has values like `"layers"`, `"brain"`, `"scroll"`, `"image"`, `"trending-down"` — but `KeyIdeas.tsx` ignores them entirely. Adding icon rendering would immediately lift the visual quality of the most prominent section.
3. **Section headings are all regular weight** due to the missing `font-semibold` in `Section.tsx:30`. This makes the page feel flat — everything has the same visual weight.
4. **The serif display font is defined but never used.** This is the biggest stylistic miss. The design intent is editorial; the execution is pure sans-serif UI.
5. **Shadows don't work in dark mode.** The `shadow-soft` token uses light-mode alpha values (rgba 20,18,40 at 4–12% opacity) — essentially invisible on dark surfaces. Cards read as flat panels with only a border for differentiation.
6. **No visual encoding for data.** The Comparison section has rows of text. A sparkline, icon, or colour-coded cell would convey the same info more visually. The Examples section uses a card grid with only an eyebrow label to distinguish Example from Analogy.
7. **The five-minute path is buried as a text string.** This should be a visual "reading path" component — numbered steps or a progress strip — since it is a key UX affordance of the explainer format.

---

## 9. Accessibility Snapshot

| Check | Status |
|---|---|
| Skip link | ✓ present (`recap-skip-link`, focus-visible styled) |
| `lang` attribute | ✓ `lang="en"` on html |
| Landmark roles | ✓ `<main>`, `<nav aria-label>`, `<header>`, `<footer>`, `<section aria-labelledby>` |
| Heading hierarchy | ✓ h1 once (Hero), h2 per Section, h3 within sections |
| Image alt text | ✓ Mermaid `figcaption` + `aria-labelledby` |
| Focus visible on links | ⚠ Only skip-link has explicit `focus-visible` style; source links, ProgressRail links, and Glossary summary have no custom focus ring. Browser defaults apply. |
| Reduced motion | ✓ Blanket CSS kill in `globals.css:13–19` |
| Color-only information | ⚠ Myth/Truth colour coding (red/green text labels) uses no supplemental icon/shape. Colorblind users rely on the word labels, which are present. Acceptable. |
| ProgressRail inactive dot contrast | ✗ ~1.5:1 (see §5.12) |

**Add `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` to anchor elements in `Sources.tsx`, `ProgressRail.tsx`, and `Glossary.tsx`.**

---

## 10. Priority Fix List

| Priority | Finding | File | Fix |
|---|---|---|---|
| P0 | Section h2 has no font-weight — all headings render at 400 | `Section.tsx:30` | Add `font-semibold` |
| P0 | Icon field from keyIdeas schema is never rendered | `KeyIdeas.tsx` | Wire `k.icon` to an SVG icon lookup |
| P1 | Hero uses `font-sans`, not the serif display font | `Hero.tsx:17` | Use `font-display font-[650]`; add `fontWeight.650` to preset |
| P1 | `err` colour fails AA at xs on dark canvas | `tokens.ts:17`, `Misconceptions.tsx:19` | Bump `err` to #E04E55 or increase font size to 14px |
| P1 | Card `shadow-soft` is invisible in dark mode | `Card.tsx:11` | Add `dark:shadow-none dark:ring-1 dark:ring-line-dark/60` |
| P1 | ProgressRail inactive dot contrast ~1.5:1 | `ProgressRail.tsx:79` | Replace `bg-line dark:bg-line-dark` with `bg-muted/50 dark:bg-muted-dark/50` |
| P1 | Inter font not loaded — system fallback on non-Apple/Linux | `layout.tsx` | Add `next/font/google` Inter with `display: swap` |
| P1 | Motion tokens defined but never wired | `tokens.ts:74–80` | Add `fadeInUp` entrance animation to sections; respect `prefers-reduced-motion` |
| P2 | Hero has no visual element — pure text, contradicts "visuals-over-text" | `Hero.tsx` | Add abstract SVG gradient, stat card, or diagram preview |
| P2 | Five-minute path renders as unreadable text string | `WhatMatters.tsx:29` | Replace with flex-wrap step chips or ordered list |
| P2 | `font-display` serif never instantiated anywhere | all components | Use for h1, and optionally pull-quotes |
| P2 | `globals.css:6` declares `color-scheme: light dark` despite always-dark | `globals.css:6` | Change to `color-scheme: dark` |
| P2 | `FixtureBanner` breaks dark aesthetic with light-purple background | `FixtureBanner.tsx:10` | Add `dark:bg-accent-ink dark:text-accent-soft` |
| P2 | ProgressRail `left-4` overlaps content at exactly 768px | `ProgressRail.tsx:58` | Show only at `lg:` breakpoint or increase left offset |
| P2 | Mermaid `classDef tier fill:#E6E0FF` is hard-coded light-mode colour | diagram code in content JSON | Change to `fill:#1F1647,stroke:#7C5CFF` for dark theme |

---

## 11. Overall Verdict

The design is **closer to premium than to AI slop** — the palette, the eyebrow label system, the Misconceptions card, and the Timeline are genuinely well-designed. The token vocabulary is disciplined and calm. These are not generic Bootstrap choices.

However, the implementation has **seven concrete gaps** between the stated ambition and the shipped artifact:

1. The serif display font is fully specified but never used.
2. Section h2 headings have no font weight, making the page feel flat.
3. Icon fields are defined in the schema but ignored in rendering.
4. Dark-mode shadows are invisible; cards read as flat bordered rectangles.
5. The hero is pure text with no visual element.
6. Motion tokens exist but are unwired; the page is essentially static.
7. The ProgressRail inactive dots are nearly invisible at 1.5:1 contrast.

Fixing P0 and P1 items (h2 weight, icon rendering, dark-mode card ring, font-display, err contrast, Inter loading, motion) would move this from "functional editorial layout" to genuinely premium. The P2 items (hero visual, display font, five-minute path chips) would complete the transformation.

The current product would pass a "does it look professional" bar for a developer audience. It would not pass a "does it feel like Linear or Vercel" bar for a design-savvy audience.
