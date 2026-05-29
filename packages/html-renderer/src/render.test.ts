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

test("output is truly self-contained — no external refs, no JS, no /_next/", () => {
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
