/**
 * The complete, self-contained stylesheet for a Recap page — inlined into a
 * single <style> block so the output works offline via file:// with zero
 * external requests and zero JavaScript.
 *
 * Dark-first (the GOAL requirement). A light override exists under
 * [data-theme="light"] for the rare case a caller asks for it. Every value
 * traces to packages/design-system/src/tokens.ts; deltas below are the fixes
 * the UX audit (docs/audit/03-ux-audit.md) called for:
 *   - err bumped #D7424B -> #E04E55 for AA at small sizes
 *   - dark cards use a 1px ring (real on dark) instead of the invisible light shadow
 *   - off-white ink (never pure #fff), per dark-mode readability research
 *   - fadeInUp reveal wired to the motion tokens, fully reduced-motion safe
 *   - semibold section headings; serif display for the hero
 */

export type Theme = "dark" | "light" | "auto";

export interface CssOptions {
  theme?: Theme;
  /** none | low | medium | high — scales the reveal animation. Default "low". */
  animation?: "none" | "low" | "medium" | "high";
}

const TOKENS = `
:root {
  /* dark is the default surface */
  --canvas: #0B0B0F;
  --surface: #15151B;
  --surface-2: #1B1B23;
  --line: #23232B;
  --line-strong: #2E2E38;
  --ink: #F2F1EE;          /* off-white, not pure white */
  --muted: #A8A8B4;
  --faint: #6E6E7A;
  --accent: #8B6DFF;       /* primary violet — AA on surface (4.5:1+) */
  --accent-strong: #7C5CFF;
  --accent-2: #4FA8FF;     /* secondary: sky blue (gradients) */
  --accent-3: #38E0C8;     /* tertiary: teal (gradients, accents) */
  --accent-warm: #FF8FB1;  /* warm pink pop, used sparingly */
  --accent-soft: #211B3D;  /* dark-mode accent chip bg */
  --accent-ink: #CFC4FF;   /* text on accent-soft */
  --ok: #46B97F;
  --warn: #F0B24A;
  --err: #FF6B72;          /* AA on dark canvas at small sizes */
  /* gradients — calm, premium, "slightly more colorful" */
  --grad-accent: linear-gradient(120deg, #A78BFF 0%, #7C5CFF 42%, #4FA8FF 100%);
  --grad-accent-2: linear-gradient(120deg, #7C5CFF 0%, #4FA8FF 55%, #38E0C8 100%);
  --grad-warm: linear-gradient(120deg, #FF9FC0 0%, #FF7AA8 100%);
  --grad-head: linear-gradient(100deg, #EDE9FF 0%, #FFFFFF 32%, #BFE0FF 70%, #B9F4E8 100%);
  --grad-edge: linear-gradient(120deg, rgba(167,139,255,.55), rgba(79,168,255,.18) 55%, rgba(56,224,200,.0));
  --radius-xs: 6px; --radius-sm: 10px; --radius-md: 14px;
  --radius-lg: 20px; --radius-xl: 28px;
  --shadow: 0 1px 0 rgba(255,255,255,.03) inset, 0 12px 40px -16px rgba(0,0,0,.7);
  --ring: 0 0 0 1px var(--line);
  --ring-strong: 0 0 0 1px var(--line-strong);
  --font-display: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace;
  --maxw: 46rem;
  --ease: cubic-bezier(0.2, 0.65, 0.25, 1);
  color-scheme: dark;
}
[data-theme="light"] {
  --canvas: #FBFAF7; --surface: #FFFFFF; --surface-2: #F6F5F1;
  --line: #E7E6E1; --line-strong: #D9D8D2;
  --ink: #16161D; --muted: #5C5C66; --faint: #8A8A94;
  --accent: #6A45F0; --accent-strong: #7C5CFF;
  --accent-soft: #EDE8FF; --accent-ink: #2A1E63;
  --err: #D7424B;
  --shadow: 0 1px 2px rgba(20,18,40,.06), 0 18px 32px -16px rgba(20,18,40,.12);
  --ring: 0 0 0 1px var(--line);
  color-scheme: light;
}
`;

const BASE = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  font-family: var(--font-sans);
  background: var(--canvas);
  color: var(--ink);
  line-height: 1.7;
  font-size: 17px;
  font-feature-settings: "ss01","cv11";
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }
code { font-family: var(--font-mono); font-size: .9em; background: var(--surface-2); border: 1px solid var(--line); padding: .08em .38em; border-radius: var(--radius-xs); }
strong { font-weight: 650; color: var(--ink); }
:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--canvas), 0 0 0 4px var(--accent); border-radius: var(--radius-xs); }
::selection { background: var(--accent-strong); color: #fff; }
.recap-skip { position: fixed; left: 12px; top: -64px; background: var(--accent-strong); color: #fff; padding: 10px 16px; border-radius: 999px; font-weight: 600; z-index: 60; transition: top .16s var(--ease); }
.recap-skip:focus { top: 12px; text-decoration: none; }
`;

const LAYOUT = `
.recap-main { width: 100%; max-width: var(--maxw); margin: 0 auto; padding: 2.5rem 1.25rem 6rem; }
@media (min-width: 768px) { .recap-main { max-width: 50rem; padding: 4rem 2rem 7rem; } }
.recap-section { margin-top: 4.5rem; scroll-margin-top: 2rem; }
@media (min-width: 768px) { .recap-section { margin-top: 6rem; } }
.recap-eyebrow { display: inline-flex; align-items: center; gap: .5rem; font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); background: var(--grad-accent); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.recap-eyebrow .recap-icon { -webkit-text-fill-color: var(--accent); color: var(--accent); }
.recap-h2 { font-family: var(--font-sans); font-size: clamp(1.5rem, 3.2vw, 2rem); font-weight: 640; line-height: 1.15; letter-spacing: -0.01em; margin-top: .6rem; color: var(--ink); }
.recap-h3 { font-size: 1.1rem; font-weight: 620; line-height: 1.3; letter-spacing: -0.005em; color: var(--ink); }
.recap-lead { color: var(--muted); margin-top: .75rem; max-width: 60ch; }
.recap-prose { max-width: 62ch; }
.recap-prose p { max-width: 62ch; }
.recap-muted { color: var(--muted); }
`;

const HERO = `
.recap-hero { position: relative; padding-top: 1rem; }
.recap-hero::before {
  content: ""; position: absolute; inset: -48% -30% auto -30%; height: 460px; z-index: -1;
  background:
    radial-gradient(42% 80% at 22% 0%, color-mix(in srgb, var(--accent) 34%, transparent), transparent 72%),
    radial-gradient(40% 78% at 70% 6%, color-mix(in srgb, var(--accent-2) 26%, transparent), transparent 70%),
    radial-gradient(36% 70% at 95% 0%, color-mix(in srgb, var(--accent-3) 18%, transparent), transparent 72%);
  filter: blur(10px); pointer-events: none;
}
.recap-hero-kicker { display: inline-flex; align-items: center; gap: .5rem; font-size: .8rem; color: var(--accent-ink); border: 1px solid transparent; border-radius: 999px; padding: .3rem .8rem; background: linear-gradient(var(--surface), var(--surface)) padding-box, var(--grad-accent) border-box; }
.recap-hero-kicker .recap-icon { width: 15px; height: 15px; color: var(--accent-2); }
.recap-h1 { font-family: var(--font-display); font-weight: 720; font-size: clamp(2.3rem, 6.4vw, 3.9rem); line-height: 1.04; letter-spacing: -0.022em; margin-top: 1.1rem; color: var(--ink); background: var(--grad-head); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.recap-answer { font-size: clamp(1.15rem, 2.6vw, 1.4rem); line-height: 1.5; color: var(--muted); margin-top: 1.1rem; max-width: 40ch; }
.recap-answer strong { color: var(--ink); }
.recap-meta { display: flex; flex-wrap: wrap; gap: .5rem .9rem; margin-top: 1.4rem; font-size: .82rem; color: var(--faint); align-items: center; }
.recap-meta .recap-dot { width: 3px; height: 3px; border-radius: 999px; background: var(--faint); }
`;

const PATH = `
.recap-path { margin-top: 1.6rem; display: flex; flex-wrap: wrap; gap: .5rem; }
.recap-step { display: inline-flex; align-items: center; gap: .5rem; font-size: .82rem; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: .35rem .7rem .35rem .4rem; }
.recap-step b { display: grid; place-items: center; width: 1.35rem; height: 1.35rem; border-radius: 999px; background: var(--grad-accent); color: #14101F; font-size: .72rem; font-weight: 800; }
`;

const CARDS = `
.recap-grid { display: grid; gap: 1rem; margin-top: 1.5rem; }
@media (min-width: 640px) { .recap-grid-2 { grid-template-columns: 1fr 1fr; } .recap-grid-3 { grid-template-columns: repeat(3, 1fr); } }
.recap-card { position: relative; background: var(--surface); border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--ring); transition: box-shadow .18s var(--ease), transform .18s var(--ease); }
.recap-card::before { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: var(--grad-edge); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: .6; pointer-events: none; }
.recap-card:hover { box-shadow: var(--ring-strong), 0 10px 40px -18px color-mix(in srgb, var(--accent) 50%, transparent); transform: translateY(-2px); }
.recap-card:hover::before { opacity: 1; }
.recap-card .recap-h3 { margin-top: .65rem; }
.recap-card p { color: var(--muted); margin-top: .4rem; }
.recap-ico { display: grid; place-items: center; width: 2.4rem; height: 2.4rem; border-radius: var(--radius-md); background: var(--grad-accent); color: #14101F; box-shadow: 0 6px 18px -8px color-mix(in srgb, var(--accent) 70%, transparent); }
.recap-ico .recap-icon { width: 20px; height: 20px; }
.recap-icon { width: 20px; height: 20px; flex: none; }
.recap-num { display: grid; place-items: center; width: 1.9rem; height: 1.9rem; border-radius: 999px; background: var(--grad-accent); color: #14101F; font-weight: 800; font-size: .85rem; }
`;

const TIMELINE = `
.recap-timeline { position: relative; margin-top: 1.5rem; padding-left: 1.6rem; border-left: 2px solid transparent; border-image: var(--grad-accent-2) 1; display: grid; gap: 1.4rem; }
.recap-tl-item { position: relative; }
.recap-tl-item::before { content: ""; position: absolute; left: calc(-1.6rem - 6px); top: .35rem; width: 12px; height: 12px; border-radius: 999px; background: var(--grad-accent); box-shadow: 0 0 0 3px var(--canvas), 0 0 12px -2px color-mix(in srgb, var(--accent) 80%, transparent); }
.recap-tl-date { font-size: .76rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--accent-2); }
.recap-tl-item .recap-h3 { margin-top: .15rem; }
.recap-tl-item p { color: var(--muted); margin-top: .3rem; }
`;

const COMPARE = `
.recap-compare-cards { display: grid; gap: 1rem; margin-top: 1.5rem; }
@media (min-width: 768px) { .recap-compare-cards { display: none; } }
.recap-table-wrap { display: none; margin-top: 1.5rem; overflow-x: auto; border-radius: var(--radius-lg); box-shadow: var(--ring); }
@media (min-width: 768px) { .recap-table-wrap { display: block; } }
.recap-table { width: 100%; border-collapse: collapse; font-size: .92rem; }
.recap-table th, .recap-table td { text-align: left; padding: .8rem 1rem; border-bottom: 1px solid var(--line); vertical-align: top; }
.recap-table thead th { background: var(--surface-2); color: var(--muted); font-weight: 600; font-size: .8rem; letter-spacing: .03em; text-transform: uppercase; }
.recap-table tbody tr:nth-child(odd) { background: var(--surface); }
.recap-table tbody tr:nth-child(even) { background: color-mix(in srgb, var(--surface) 55%, var(--canvas)); }
.recap-table td:first-child { font-weight: 600; color: var(--ink); }
.recap-table tr:last-child td { border-bottom: none; }
.recap-kv { display: flex; justify-content: space-between; gap: 1rem; padding: .4rem 0; border-bottom: 1px solid var(--line); }
.recap-kv:last-child { border-bottom: none; }
.recap-kv dt { color: var(--muted); }
.recap-kv dd { color: var(--ink); text-align: right; }
`;

const MISC = `
.recap-myth { background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--ring); overflow: hidden; }
.recap-myth-top, .recap-myth-bot { padding: 1rem 1.25rem; display: flex; gap: .6rem; }
.recap-myth-top { border-bottom: 1px solid var(--line); }
.recap-tag { display: inline-flex; align-items: center; gap: .35rem; font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; flex: none; }
.recap-tag-myth { color: var(--err); }
.recap-tag-truth { color: var(--ok); }
.recap-tag .recap-icon { width: 15px; height: 15px; }
.recap-myth p { color: var(--ink); }
.recap-myth-bot p { color: var(--muted); }
`;

const GLOSSARY = `
.recap-glossary { margin-top: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--ring); overflow: hidden; }
.recap-gitem { border-bottom: 1px solid var(--line); }
.recap-gitem:last-child { border-bottom: none; }
.recap-gitem summary { list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .95rem 1.25rem; font-weight: 600; color: var(--ink); background: var(--surface); }
.recap-gitem summary::-webkit-details-marker { display: none; }
.recap-gitem summary .recap-icon { width: 18px; height: 18px; color: var(--muted); transition: transform .18s var(--ease); }
.recap-gitem[open] summary .recap-icon { transform: rotate(180deg); }
.recap-gitem p { color: var(--muted); padding: 0 1.25rem 1.1rem; }
`;

const TAKEAWAYS = `
.recap-takeaways { margin-top: 1.5rem; display: grid; gap: .75rem; }
.recap-take { display: flex; gap: .8rem; align-items: flex-start; }
.recap-take .recap-check { display: grid; place-items: center; width: 1.6rem; height: 1.6rem; border-radius: var(--radius-sm); background: var(--grad-accent-2); color: #0C1016; flex: none; margin-top: .1rem; box-shadow: 0 6px 16px -8px color-mix(in srgb, var(--accent-2) 70%, transparent); }
.recap-take .recap-icon { width: 16px; height: 16px; }
.recap-take p { color: var(--ink); }
`;

const SOURCES = `
.recap-sources { display: grid; gap: .75rem; margin-top: 1.5rem; }
.recap-source { display: block; background: var(--surface); border-radius: var(--radius-md); padding: .9rem 1.1rem; box-shadow: var(--ring); transition: box-shadow .18s var(--ease); }
.recap-source:hover { box-shadow: var(--ring-strong); text-decoration: none; }
.recap-source-title { display: flex; align-items: center; gap: .4rem; font-weight: 600; color: var(--ink); }
.recap-source-title .recap-icon { width: 14px; height: 14px; color: var(--muted); }
.recap-source-meta { font-size: .8rem; color: var(--faint); margin-top: .2rem; display: flex; flex-wrap: wrap; gap: .35rem .7rem; align-items: center; }
.recap-badge { font-size: .68rem; font-weight: 600; letter-spacing: .03em; text-transform: uppercase; padding: .1rem .45rem; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); }
.recap-badge-primary { color: var(--ok); border-color: color-mix(in srgb, var(--ok) 45%, transparent); }
.recap-badge-fixture { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 45%, transparent); }
.recap-note { margin-top: 1.25rem; background: color-mix(in srgb, var(--warn) 9%, var(--surface)); border: 1px solid color-mix(in srgb, var(--warn) 35%, transparent); border-radius: var(--radius-md); padding: .9rem 1.1rem; }
.recap-note .recap-eyebrow { color: var(--warn); }
.recap-note p { color: var(--muted); margin-top: .35rem; }
`;

const DIAGRAM = `
.recap-figure { margin-top: 1.5rem; background: var(--surface); border-radius: var(--radius-lg); box-shadow: var(--ring); padding: 1.25rem; overflow-x: auto; }
.recap-figure svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
.recap-figcap { font-size: .82rem; color: var(--muted); margin-top: .8rem; text-align: center; }
.recap-figfallback { display: grid; gap: .75rem; }
.recap-figfallback pre { font-family: var(--font-mono); font-size: .78rem; color: var(--muted); background: var(--canvas); border: 1px solid var(--line); border-radius: var(--radius-md); padding: .9rem; overflow-x: auto; white-space: pre; }
`;

const CHROME = `
.recap-fixture { display: flex; align-items: center; gap: .6rem; background: color-mix(in srgb, var(--warn) 12%, var(--surface)); border: 1px solid color-mix(in srgb, var(--warn) 40%, transparent); color: var(--ink); border-radius: var(--radius-md); padding: .7rem 1rem; font-size: .85rem; margin-bottom: 2rem; }
.recap-fixture .recap-icon { width: 17px; height: 17px; color: var(--warn); }
.recap-scorechip { position: fixed; right: 14px; top: 14px; z-index: 40; display: inline-flex; align-items: center; gap: .4rem; font-size: .78rem; font-weight: 600; color: var(--ink); background: color-mix(in srgb, var(--surface) 88%, transparent); backdrop-filter: blur(8px); border-radius: 999px; padding: .35rem .7rem; box-shadow: var(--ring); }
.recap-scorechip .recap-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--ok); }
.recap-footer { max-width: var(--maxw); margin: 4rem auto 0; padding: 2rem 1.25rem; border-top: 1px solid var(--line); text-align: center; color: var(--faint); font-size: .85rem; }
.recap-footer strong { color: var(--muted); }
`;

const MOTION_BY_LEVEL: Record<string, string> = {
  none: "",
  low: "20px,18ms",
  medium: "26px,26ms",
  high: "34px,34ms",
};

function revealCss(level: string): string {
  if (level === "none") return "";
  const cfg = MOTION_BY_LEVEL[level] ?? MOTION_BY_LEVEL.low ?? "20px,18ms";
  const [dist, stagger] = cfg.split(",");
  return `
@media (prefers-reduced-motion: no-preference) {
  .recap-reveal { opacity: 0; transform: translateY(${dist}); animation: recapFadeUp .6s var(--ease) forwards; }
  ${Array.from({ length: 14 }, (_, i) => `.recap-reveal:nth-of-type(${i + 1}) { animation-delay: calc(${i} * ${stagger}); }`).join("\n  ")}
}
@keyframes recapFadeUp { to { opacity: 1; transform: none; } }
`;
}

const REDUCED_MOTION = `
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .recap-reveal { opacity: 1 !important; transform: none !important; }
}
`;

/** Build the full stylesheet string. */
export function getBaseStyles(options: CssOptions = {}): string {
  const theme = options.theme ?? "dark";
  const animation = options.animation ?? "low";
  // For theme "dark" we rely on :root (already dark). For "light"/"auto" we set
  // data-theme on <html> in the shell; "auto" additionally adds a media query.
  const autoLight =
    theme === "auto"
      ? `@media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { --canvas:#FBFAF7;--surface:#FFFFFF;--surface-2:#F6F5F1;--line:#E7E6E1;--line-strong:#D9D8D2;--ink:#16161D;--muted:#5C5C66;--faint:#8A8A94;--accent:#6A45F0;--accent-soft:#EDE8FF;--accent-ink:#2A1E63;--err:#D7424B;color-scheme:light; } }`
      : "";
  return [
    TOKENS,
    autoLight,
    BASE,
    LAYOUT,
    HERO,
    PATH,
    CARDS,
    TIMELINE,
    COMPARE,
    MISC,
    GLOSSARY,
    TAKEAWAYS,
    SOURCES,
    DIAGRAM,
    CHROME,
    revealCss(animation),
    REDUCED_MOTION,
  ]
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
