import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { renderToHtml, renderFromJson, getBaseStyles } from "./index.js";
import { sanitizeSvg } from "./diagram.js";
import { parseRecapPageContent } from "@recap-studio/content-pipeline";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = resolve(here, "../../../fixtures/topics/latest-ai-models.json");
const content = parseRecapPageContent(JSON.parse(readFileSync(fixturePath, "utf8")));

test("renders a complete self-contained HTML document", () => {
  const html = renderToHtml(content);
  assert.match(html, /^<!doctype html>/i, "starts with doctype");
  assert.match(html, /<html lang="en" data-theme="dark"/, "dark theme by default");
  assert.match(html, /<h1 class="recap-h1">/, "has an h1");
  assert.ok(html.includes(content.topic), "includes the topic");
  assert.match(html, /<style>/, "inlines a stylesheet");
});

test("output is truly self-contained: no external refs, no JS, no /_next/", () => {
  const html = renderToHtml(content);
  assert.ok(!html.includes("/_next/"), "no Next.js absolute asset paths");
  assert.ok(!/<script/i.test(html), "no <script> tags");
  assert.ok(!/href="https?:\/\/[^"]*\.css/i.test(html), "no external stylesheets");
  assert.ok(!/src="https?:\/\//i.test(html), "no external scripts/images via src");
  // The only http(s) URLs allowed are source citation links (target=_blank).
});

test("renders the key sections from the schema", () => {
  const html = renderToHtml(content);
  for (const id of ["hero", "matters", "ideas", "sources"]) {
    assert.ok(html.includes(`id="${id}"`), `has section #${id}`);
  }
});

test("renders key-idea icons (visuals-over-text)", () => {
  const html = renderToHtml(content);
  assert.match(html, /class="recap-ico"/, "key ideas get an icon chip");
  assert.match(html, /<svg class="recap-icon"/, "inline SVG icons present");
});

test("theme option switches the data-theme attribute", () => {
  assert.match(renderToHtml(content, { theme: "light" }), /data-theme="light"/);
  const auto = renderToHtml(content, { theme: "auto" });
  const htmlTag = /<html[^>]*>/.exec(auto)?.[0] ?? "";
  assert.ok(!/data-theme=/.test(htmlTag), "auto omits data-theme on <html> and uses the media query");
  assert.ok(auto.includes("prefers-color-scheme"), "auto wires a color-scheme media query");
});

test("renderFromJson validates and throws on bad input", () => {
  assert.throws(() => renderFromJson({}), /Invalid RecapPageContent/);
});

test("all fonts are sans-serif (no serif display face) and gradients are present", () => {
  const css = getBaseStyles({ theme: "dark" });
  assert.ok(!/serif(?<!sans-serif)/.test(css.replace(/sans-serif/g, "")), "no standalone serif font family");
  assert.ok(!/Georgia|Times New Roman|ui-serif|Iowan|Garamond/i.test(css), "no named serif fonts");
  assert.ok(css.includes("--font-display"), "display token exists");
  assert.match(getBaseStyles({}), /--font-display: "Inter"/, "display font is Inter (sans)");
  assert.ok((css.match(/linear-gradient/g) ?? []).length >= 4, "uses gradients for color");
});

test("getBaseStyles includes the dark token layer and reduced-motion guard", () => {
  const css = getBaseStyles({ theme: "dark" });
  assert.ok(css.includes("--canvas: #0B0B0F"), "dark canvas token");
  assert.ok(css.includes("prefers-reduced-motion: reduce"), "reduced-motion guard");
});

test("sanitizeSvg strips scripts, event handlers, and external hrefs", () => {
  const dirty =
    '<svg onload="x()"><script>alert(1)</script><a href="https://evil.test">x</a><rect/></svg>';
  const clean = sanitizeSvg(dirty);
  assert.ok(!/<script/i.test(clean), "script removed");
  assert.ok(!/onload/i.test(clean), "event handler removed");
  assert.ok(!/https:\/\/evil/i.test(clean), "external href removed");
  assert.ok(clean.includes("<rect"), "geometry preserved");
});

test("every page carries a print stylesheet and stays zero-JS", () => {
  const html = renderToHtml(content);
  assert.match(html, /@media print \{/, "print rules are wrapped in @media print by default");
  assert.ok(html.includes(".recap-skip, .recap-scorechip { display: none !important; }"), "fixed chrome is hidden on paper");
  assert.ok(html.includes("@page { margin: 18mm 14mm; }"), "page margins are set");
  assert.ok(html.includes("#sources { break-before: page;"), "sources start a fresh page");
  assert.ok(html.includes('.recap-source[href^="http"]::after'), "source URLs are printed");
  assert.ok(html.includes("details.recap-gitem > *:not(summary)"), "glossary entries are forced open on paper");
  assert.ok(
    html.includes("-webkit-text-fill-color: currentColor"),
    "the gradient-clipped h1 and eyebrow are reset, or they print white on white",
  );
  // The whole point of the change is CSS, so the zero-JS guarantee is restated here.
  assert.ok(!/<script/i.test(html), "no <script> tags");
  assert.ok(!html.includes("/_next/"), "no Next.js absolute asset paths");
  assert.ok(!/@import/i.test(html), "no external stylesheet import");
});

test("--print lifts the print rules out of the media query and paints light", () => {
  const html = renderToHtml(content, { print: true });
  assert.ok(!html.includes("@media print {"), "print mode applies the rules unconditionally");
  assert.ok(html.includes("@page { margin: 18mm 14mm; }"), "the same rules are present, just unwrapped");
  assert.match(html, /<html lang="en" data-theme="light"/, "print mode paints the document light");
  assert.ok(html.includes('content="light"'), "color-scheme follows");
  assert.ok(!/<script/i.test(html), "still no <script> tags");
});

test("the print block costs under 3 KB of the stylesheet", () => {
  // printCss() is appended last, so the block runs from "@media print {" to the
  // end of the sheet. A lazy regex would stop at the first nested "}".
  const css = getBaseStyles({ theme: "dark" });
  const start = css.indexOf("@media print {");
  assert.ok(start > 0, "the print block is present and is not the first rule");
  const bytes = Buffer.byteLength(css.slice(start), "utf8");
  assert.ok(bytes < 3072, `print block is ${bytes} bytes, expected under 3072`);
});

test("print mode opens the glossary for real, not only visually", () => {
  assert.ok(renderToHtml(content).includes('<details class="recap-gitem">'), "closed by default");
  assert.ok(
    renderToHtml(content, { print: true }).includes('<details class="recap-gitem" open>'),
    "print mode sets the semantic open state a screen reader can see",
  );
});

test("print tokens outrank the auto-light layer", () => {
  // :root:not([data-theme="dark"]) beats a plain :root, and @media adds no
  // specificity, so the print token block has to be :root:root.
  const css = getBaseStyles({ theme: "auto" });
  assert.ok(css.includes(':root:not([data-theme="dark"])'), "auto emits the light layer");
  const printBlock = css.slice(css.indexOf("@media print {"));
  assert.ok(printBlock.includes(":root:root {"), "print tokens carry equal-or-better specificity");
});
