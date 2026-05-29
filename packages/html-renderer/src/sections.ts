/**
 * Section renderers: each takes the typed content and returns an HTML string
 * built from the classes in css.ts. Order + enablement follow the content's
 * `visualSections` list (mirrors apps/recap-web/src/app/page.tsx).
 */
import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { esc, escRich } from "./escape.js";
import { icon, util } from "./icons.js";
import { renderDiagram } from "./diagram.js";

type C = RecapPageContent;

function words(s: unknown): number {
  return String(s ?? "").trim().split(/\s+/).filter(Boolean).length;
}

/** Rough whole-page reading time in minutes (220 wpm), min 1. */
export function readingMinutes(c: C): number {
  let total = words(c.oneSentenceAnswer);
  for (const t of c.fiveMinutePath) total += words(t);
  for (const t of c.whyItMatters) total += words(t);
  for (const k of c.keyIdeas) total += words(k.title) + words(k.body);
  for (const e of c.examples) total += words(e.title) + words(e.body);
  for (const a of c.analogies) total += words(a.setup) + words(a.takeaway);
  for (const m of c.misconceptions) total += words(m.myth) + words(m.truth);
  for (const t of c.timeline ?? []) total += words(t.title) + words(t.body);
  for (const g of c.glossary) total += words(g.term) + words(g.definition);
  for (const p of c.practicalTakeaways) total += words(p);
  return Math.max(1, Math.round(total / 220));
}

function fmtDate(iso: string): string {
  // Avoid Date parsing surprises: accept ISO and show YYYY-MM-DD.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : esc(iso);
}

function head(eyebrow: string, title: string, iconName?: string): string {
  const ico = iconName ? icon(iconName) : "";
  return `<p class="recap-eyebrow">${ico}${esc(eyebrow)}</p><h2 class="recap-h2">${esc(title)}</h2>`;
}

export function hero(c: C): string {
  const mins = readingMinutes(c);
  const audience = esc(c.audienceLevel);
  const path = c.fiveMinutePath
    .map((step, i) => `<span class="recap-step"><b>${i + 1}</b>${esc(step)}</span>`)
    .join("");
  const meta = [
    `<span>${fmtDate(c.generatedAt)}</span>`,
    `<span class="recap-dot"></span><span>${c.sourceMap.length} source${c.sourceMap.length === 1 ? "" : "s"}</span>`,
    `<span class="recap-dot"></span><span>${audience}</span>`,
  ].join("");
  return `<header class="recap-section recap-hero recap-reveal" id="hero">
  <span class="recap-hero-kicker">${util("sparkle")}~${mins} min read</span>
  <h1 class="recap-h1">${esc(c.topic)}</h1>
  <p class="recap-answer">${escRich(c.oneSentenceAnswer)}</p>
  <div class="recap-meta">${meta}</div>
  ${path ? `<div class="recap-path" aria-label="Reading path">${path}</div>` : ""}
</header>`;
}

export function whatMatters(c: C): string {
  if (!c.whyItMatters.length) return "";
  const cards = c.whyItMatters
    .map(
      (w, i) =>
        `<div class="recap-card"><span class="recap-num">${i + 1}</span><p>${escRich(w)}</p></div>`,
    )
    .join("");
  const cols = c.whyItMatters.length >= 3 ? "recap-grid-3" : "recap-grid-2";
  return `<section class="recap-section recap-reveal" id="matters" aria-labelledby="matters-h">
  ${head("Why it matters", "The short version").replace('class="recap-h2"', 'class="recap-h2" id="matters-h"')}
  <div class="recap-grid ${cols}">${cards}</div>
</section>`;
}

export function conceptMap(c: C): string {
  if (!c.diagrams.length) return "";
  const figs = c.diagrams.map(renderDiagram).join("\n");
  return `<section class="recap-section recap-reveal" id="concept-map" aria-labelledby="cm-h">
  ${head("Concept map", "How it fits together").replace('class="recap-h2"', 'class="recap-h2" id="cm-h"')}
  ${figs}
</section>`;
}

export function keyIdeas(c: C): string {
  if (!c.keyIdeas.length) return "";
  const cards = c.keyIdeas
    .map(
      (k) =>
        `<div class="recap-card"><span class="recap-ico">${icon(k.icon)}</span><h3 class="recap-h3">${esc(k.title)}</h3><p>${escRich(k.body)}</p></div>`,
    )
    .join("");
  return `<section class="recap-section recap-reveal" id="ideas" aria-labelledby="ideas-h">
  ${head("Key ideas", "The core concepts").replace('class="recap-h2"', 'class="recap-h2" id="ideas-h"')}
  <div class="recap-grid recap-grid-2">${cards}</div>
</section>`;
}

export function timeline(c: C): string {
  if (!c.timeline?.length) return "";
  const items = c.timeline
    .map(
      (t) =>
        `<div class="recap-tl-item"><p class="recap-tl-date">${esc(t.date)}</p><h3 class="recap-h3">${esc(t.title)}</h3><p>${escRich(t.body)}</p></div>`,
    )
    .join("");
  return `<section class="recap-section recap-reveal" id="timeline" aria-labelledby="tl-h">
  ${head("Timeline", "How we got here").replace('class="recap-h2"', 'class="recap-h2" id="tl-h"')}
  <div class="recap-timeline">${items}</div>
</section>`;
}

export function comparison(c: C): string {
  if (!c.comparisons?.length) return "";
  const blocks = c.comparisons
    .map((b) => {
      const cols = b.columns;
      const thead = `<tr><th>${esc(b.rows.length ? "" : "")}</th>${cols.map((col) => `<th>${esc(col)}</th>`).join("")}</tr>`;
      const tbody = b.rows
        .map(
          (r) =>
            `<tr><td>${esc(r.name)}</td>${cols.map((col) => `<td>${escRich(r.cells[col] ?? "—")}</td>`).join("")}</tr>`,
        )
        .join("");
      const cards = b.rows
        .map(
          (r) =>
            `<div class="recap-card"><h3 class="recap-h3">${esc(r.name)}</h3><dl>${cols
              .map((col) => `<div class="recap-kv"><dt>${esc(col)}</dt><dd>${escRich(r.cells[col] ?? "—")}</dd></div>`)
              .join("")}</dl></div>`,
        )
        .join("");
      return `<h3 class="recap-h3" style="margin-top:1.5rem">${esc(b.title)}</h3>
  <div class="recap-compare-cards">${cards}</div>
  <div class="recap-table-wrap"><table class="recap-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
    })
    .join("\n");
  return `<section class="recap-section recap-reveal" id="comparison" aria-labelledby="cmp-h">
  ${head("Comparison", "Side by side").replace('class="recap-h2"', 'class="recap-h2" id="cmp-h"')}
  ${blocks}
</section>`;
}

export function examplesAndAnalogies(c: C): string {
  if (!c.examples.length && !c.analogies.length) return "";
  const ex = c.examples
    .map(
      (e) =>
        `<div class="recap-card"><p class="recap-eyebrow">${util("target")}Example</p><h3 class="recap-h3" style="margin-top:.5rem">${esc(e.title)}</h3><p>${escRich(e.body)}</p></div>`,
    )
    .join("");
  const an = c.analogies
    .map(
      (a) =>
        `<div class="recap-card"><p class="recap-eyebrow">${util("sparkle")}Analogy</p><p style="margin-top:.5rem;color:var(--ink)">${escRich(a.setup)}</p><p style="margin-top:.4rem">${escRich(a.takeaway)}</p></div>`,
    )
    .join("");
  return `<section class="recap-section recap-reveal" id="examples" aria-labelledby="ex-h">
  ${head("Make it concrete", "Examples & analogies").replace('class="recap-h2"', 'class="recap-h2" id="ex-h"')}
  <div class="recap-grid recap-grid-2">${ex}${an}</div>
</section>`;
}

export function misconceptions(c: C): string {
  if (!c.misconceptions.length) return "";
  const cards = c.misconceptions
    .map(
      (m) =>
        `<div class="recap-myth"><div class="recap-myth-top"><span class="recap-tag recap-tag-myth">${util("x")}Myth</span><p>${escRich(m.myth)}</p></div><div class="recap-myth-bot"><span class="recap-tag recap-tag-truth">${util("check")}Truth</span><p>${escRich(m.truth)}</p></div></div>`,
    )
    .join("");
  return `<section class="recap-section recap-reveal" id="misconceptions" aria-labelledby="mc-h">
  ${head("Myth vs truth", "Clear up the confusion").replace('class="recap-h2"', 'class="recap-h2" id="mc-h"')}
  <div class="recap-grid recap-grid-2">${cards}</div>
</section>`;
}

export function glossary(c: C): string {
  if (!c.glossary.length) return "";
  const items = c.glossary
    .map(
      (g) =>
        `<details class="recap-gitem"><summary>${esc(g.term)}${util("chevron")}</summary><p>${escRich(g.definition)}</p></details>`,
    )
    .join("");
  return `<section class="recap-section recap-reveal" id="glossary" aria-labelledby="gl-h">
  ${head("Glossary", "Plain-English definitions").replace('class="recap-h2"', 'class="recap-h2" id="gl-h"')}
  <div class="recap-glossary">${items}</div>
</section>`;
}

export function takeaways(c: C): string {
  if (!c.practicalTakeaways.length) return "";
  const items = c.practicalTakeaways
    .map((t) => `<div class="recap-take"><span class="recap-check">${util("check")}</span><p>${escRich(t)}</p></div>`)
    .join("");
  return `<section class="recap-section recap-reveal" id="takeaways" aria-labelledby="tk-h">
  ${head("Takeaways", "What to do with this").replace('class="recap-h2"', 'class="recap-h2" id="tk-h"')}
  <div class="recap-takeaways">${items}</div>
</section>`;
}

export function sources(c: C): string {
  if (!c.sourceMap.length) return "";
  const cards = c.sourceMap
    .map((s) => {
      const badge = s.primary
        ? `<span class="recap-badge recap-badge-primary">primary</span>`
        : `<span class="recap-badge">secondary</span>`;
      const prov = s.provenance === "fixture" ? `<span class="recap-badge recap-badge-fixture">fixture</span>` : "";
      const pub = s.publisher ? `<span>${esc(s.publisher)}</span>` : "";
      const when = s.publishedAt ? `<span class="recap-dot"></span><span>${esc(s.publishedAt)}</span>` : "";
      return `<a class="recap-source" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
    <span class="recap-source-title">${esc(s.title)}${util("external")}</span>
    <span class="recap-source-meta">${badge}${prov}${pub}${when}</span>
    ${s.summary ? `<p class="recap-muted" style="margin-top:.4rem;font-size:.88rem">${escRich(s.summary)}</p>` : ""}
  </a>`;
    })
    .join("");
  const notes = c.uncertaintyNotes.length
    ? `<div class="recap-note"><p class="recap-eyebrow">${util("dot")}What we're unsure about</p>${c.uncertaintyNotes
        .map((n) => `<p>${escRich(n)}</p>`)
        .join("")}</div>`
    : "";
  return `<section class="recap-section recap-reveal" id="sources" aria-labelledby="src-h">
  ${head("Sources", "Where this comes from").replace('class="recap-h2"', 'class="recap-h2" id="src-h"')}
  <div class="recap-sources">${cards}</div>
  ${notes}
</section>`;
}

const RENDERERS: Record<string, (c: C) => string> = {
  hero,
  matters: whatMatters,
  "concept-map": conceptMap,
  ideas: keyIdeas,
  timeline,
  comparison,
  examples: examplesAndAnalogies,
  analogies: examplesAndAnalogies,
  misconceptions,
  glossary,
  takeaways,
  sources,
};

/** Compose the page body in the order given by visualSections (enabled only). */
export function composeBody(c: C): string {
  const out: string[] = [];
  const seen = new Set<string>();
  const enabled = c.visualSections.filter((s) => s.enabled);
  // analogies share a renderer with examples; render once.
  for (const s of enabled) {
    const key = s.kind === "analogies" ? "examples" : s.kind;
    if (seen.has(key)) continue;
    const fn = RENDERERS[key];
    if (!fn) continue;
    const html = fn(c);
    if (html) {
      out.push(html);
      seen.add(key);
    }
  }
  // Always ensure hero is first even if visualSections omitted it.
  if (!seen.has("hero")) out.unshift(hero(c));
  return out.join("\n");
}
