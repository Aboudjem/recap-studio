/**
 * Diagram rendering for self-contained output.
 *
 * - kind "svg": the content already carries hand-authored inline SVG — we
 *   sanitize it (strip <script>, on* handlers, external/js refs) and inline it.
 *   This is the preferred path for a double-click-able file (no JS needed).
 * - kind "mermaid": we cannot run Mermaid without a browser + ~3MB of JS, which
 *   would break "lightweight, opens offline". We render an honest static
 *   <figure>: the alt text as a visible caption plus the Mermaid source in a
 *   collapsed <details>. The skill/visual-story-designer is steered to emit
 *   kind "svg" for the self-contained track (see TEMPLATE.md).
 */
import { esc } from "./escape.js";

interface DiagramLike {
  id: string;
  kind: "mermaid" | "svg";
  code: string;
  alt: string;
}

/** Remove anything that would make an inline SVG unsafe or non-self-contained. */
export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/(href|xlink:href)\s*=\s*"(?!#)[^"]*"/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function looksLikeSvg(code: string): boolean {
  return /<svg[\s>]/i.test(code);
}

export function renderDiagram(d: DiagramLike): string {
  const cap = esc(d.alt);
  if (d.kind === "svg" || looksLikeSvg(d.code)) {
    const safe = sanitizeSvg(d.code);
    if (looksLikeSvg(safe)) {
      return `<figure class="recap-figure" role="group" aria-label="${cap}">${safe}<figcaption class="recap-figcap">${cap}</figcaption></figure>`;
    }
  }
  // Mermaid (or unrenderable) fallback — honest, static, self-contained.
  return `<figure class="recap-figure" role="group" aria-label="${cap}">
  <div class="recap-figfallback">
    <p class="recap-muted">${cap}</p>
    <details><summary class="recap-eyebrow">Diagram source</summary><pre>${esc(d.code)}</pre></details>
  </div>
  <figcaption class="recap-figcap">Diagram — open the source above, or view the hosted version for the rendered graphic.</figcaption>
</figure>`;
}
