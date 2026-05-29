#!/usr/bin/env node
/**
 * render-html — turn the active (or a named) RecapPageContent JSON into ONE
 * self-contained, double-click-able HTML file using @recap-studio/html-renderer.
 *
 * Usage:
 *   node scripts/render-html.mjs                       # active slug
 *   node scripts/render-html.mjs <slug-or-path.json>   # explicit content
 *   node scripts/render-html.mjs --theme light <slug>  # override theme
 *
 * Writes artifacts/<slug>/recap-<slug>.html and prints the path + the
 * open/deploy next steps. Never deploys; never touches the network.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { renderFromJson } from "@recap-studio/html-renderer";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
let theme = "dark";
const ti = args.indexOf("--theme");
if (ti !== -1) {
  theme = args[ti + 1] ?? "dark";
  args.splice(ti, 2);
}
const target = args[0];

function activeSlug() {
  const f = resolve(repoRoot, "apps/recap-web/src/lib/active-content.json");
  if (existsSync(f)) {
    try {
      return JSON.parse(readFileSync(f, "utf8")).slug ?? "latest-ai-models";
    } catch {
      /* fall through */
    }
  }
  return "latest-ai-models";
}

function resolveContentPath(arg) {
  if (arg && (arg.endsWith(".json") || isAbsolute(arg))) {
    const p = isAbsolute(arg) ? arg : resolve(process.cwd(), arg);
    if (existsSync(p)) return { path: p, slug: undefined };
  }
  const slug = arg || activeSlug();
  const live = resolve(repoRoot, "apps/recap-web/src/content", `${slug}.json`);
  if (existsSync(live)) return { path: live, slug };
  const fixture = resolve(repoRoot, "fixtures/topics", `${slug}.json`);
  if (existsSync(fixture)) return { path: fixture, slug };
  console.error(
    `recap-studio: no content found for "${slug}". Looked in apps/recap-web/src/content/ and fixtures/topics/.`,
  );
  process.exit(2);
}

const { path: contentPath } = resolveContentPath(target);
let json;
try {
  json = JSON.parse(readFileSync(contentPath, "utf8"));
} catch (e) {
  console.error(`recap-studio: could not read/parse ${contentPath}: ${e.message}`);
  process.exit(2);
}

let html;
try {
  html = renderFromJson(json, { theme });
} catch (e) {
  console.error(`recap-studio: content failed schema validation:\n${e.message}`);
  process.exit(2);
}

const slug = json.slug ?? "recap";
const outDir = resolve(repoRoot, "artifacts", slug);
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `recap-${slug}.html`);
writeFileSync(outFile, html, "utf8");

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
console.log(`recap-studio: wrote ${outFile} (${kb} KB, self-contained, opens with a double-click)`);
console.log("");
console.log("Next:");
console.log(`  • Open it:   open "${outFile}"   (macOS) — or double-click the file`);
console.log("  • Deploy?    only if Vercel is configured (vercel / .vercel / VERCEL_TOKEN): pnpm deploy:preview");
