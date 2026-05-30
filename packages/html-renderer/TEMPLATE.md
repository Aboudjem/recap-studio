# The Recap Template: reuse & white-label guide

`@recap-studio/html-renderer` is a **shared visual asset for the 10x toolset**. Any tool that can shape its output into a `RecapPageContent` gets the same calm-premium dark page, self-contained and offline-safe, for free. This guide shows how to reuse and re-skin it.

## 1. The contract

The renderer consumes one object: `RecapPageContent` (defined and validated in `@recap-studio/content-pipeline`). The important fields:

| Field | Purpose |
|---|---|
| `topic`, `oneSentenceAnswer` | Hero headline + one-line answer |
| `fiveMinutePath[]` | Numbered "reading path" chips |
| `whyItMatters[]` | "The short version" cards |
| `keyIdeas[] {title, body, icon}` | Icon cards, `icon` maps to the inline SVG set (see §4) |
| `diagrams[] {kind, code, alt}` | `kind:"svg"` is inlined; `kind:"mermaid"` gets a static fallback |
| `timeline[]`, `comparisons[]` | Timeline rail + responsive comparison table/cards |
| `examples[]`, `analogies[]`, `misconceptions[]` | Concrete + myth/truth sections |
| `glossary[]`, `practicalTakeaways[]` | `<details>` accordion + checklist |
| `sourceMap[]`, `uncertaintyNotes[]` | Cited sources + an honest "what we're unsure about" box |
| `visualSections[] {kind, enabled}` | Controls section **order and visibility** |

`visualSections` is the layout director: list the section `kind`s you want, in order, with `enabled: true`. Omit or disable what you don't need.

## 2. Minimal call

```ts
import { renderToHtml } from "@recap-studio/html-renderer";
const html = renderToHtml(myContent, { theme: "dark" });
```

That's the whole integration. Write `html` to a `.html` file and it opens with a double-click.

## 3. White-labelling (override the look)

Two ways to re-skin without forking:

**a) CSS variable override.** Every colour, radius, and font is a CSS custom property on `:root`. Append an override block:

```ts
import { getBaseStyles } from "@recap-studio/html-renderer";
const css = getBaseStyles({ theme: "dark" }) +
  `:root { --accent: #22D3EE; --accent-strong: #06B6D4; --font-display: "Fraunces", serif; }`;
```

Then embed `css` in your own shell, or post-process the `<style>` block.

**b) Token reference.** The full token list lives in `src/css.ts` (`TOKENS`). The knobs most tools touch:

| Variable | Default (dark) | Role |
|---|---|---|
| `--canvas` | `#0B0B0F` | Page background |
| `--surface` | `#15151B` | Cards, tables |
| `--ink` | `#F2F1EE` | Body text (off-white, never pure white) |
| `--muted` | `#A8A8B4` | Secondary text |
| `--accent` | `#8B6DFF` | Links, labels, accents (AA on surface) |
| `--font-display` | serif stack | Hero headline |
| `--font-sans` | Inter stack | Everything else |

## 4. Icons

`keyIdeas[].icon` accepts a name from the built-in inline SVG set (Lucide-style, stroke = `currentColor`): `layers`, `brain`, `scroll`, `image`, `trending-up`, `trending-down`, `zap`, `cpu`, `database`, `globe`, `shield`, `rocket`, `lock`, `eye`, `compass`, `target`, `gauge`, `puzzle`, `book`, `message`, `clock`, `star`. Unknown names fall back to a neutral dot, the renderer never throws on a new name.

## 5. Diagrams (self-contained)

- **Preferred:** hand-author an inline SVG and pass it as `{ kind: "svg", code: "<svg …>…</svg>", alt: "…" }`. The renderer sanitizes it (strips `<script>`, `on*` handlers, external `href`s) and inlines it. This keeps the file double-click-able with no JS.
- **Mermaid:** `{ kind: "mermaid", code: "flowchart LR; A-->B", alt: "…" }` renders as a captioned figure with the source in a collapsible `<details>`. Use this only for the hosted (Next.js) track where Mermaid renders client-side; for the portable file, prefer `svg`.

## 6. Who reuses this

- **Recap Studio**: `/recap "<topic>"` and `/recap session` write `artifacts/<slug>/recap-<slug>.html`.
- **Other 10x tools**: any tool with a report can shape it into a `RecapPageContent` (or a subset, using `visualSections` to hide what doesn't apply) and ship the same polished page. No design work, no build step.

## 7. Guarantees

Self-contained, offline, zero JS, dark-first, reduced-motion safe, WCAG-AA contrast on the default palette, responsive from 360px. Enforced by `src/render.test.ts`.
