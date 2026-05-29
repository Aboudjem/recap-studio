/**
 * Server-only helpers used by the page renderer to load the active content
 * artifact at build time. Centralizes the fallback chain (active content →
 * fixture) so the app always renders something.
 */
import "server-only";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseRecapPageContent, type RecapPageContent } from "@recap-studio/content-pipeline";

const APP_ROOT = resolve(process.cwd());
const REPO_ROOT = resolve(APP_ROOT, "..", "..");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadActiveSlug(): string {
  const file = join(APP_ROOT, "src", "lib", "active-content.json");
  try {
    const data = readJson(file) as { slug?: string };
    return data.slug ?? "latest-ai-models";
  } catch {
    return "latest-ai-models";
  }
}

export function loadContent(slug: string = loadActiveSlug()): RecapPageContent {
  const candidates = [
    join(APP_ROOT, "src", "content", `${slug}.json`),
    join(REPO_ROOT, "fixtures", "topics", `${slug}.json`),
  ];
  for (let i = 0; i < candidates.length; i++) {
    const path = candidates[i];
    if (path && existsSync(path)) {
      // If we fell through to the fixture fallback (i > 0), the active slug
      // pointed at a file that does not exist. That's almost always a bug
      // (renamed content file, stale active-content.json, typo). Surface it
      // loudly in build logs instead of silently rendering the wrong page.
      // History: bit us during the 2026-05-13 hermes/openclaw recap session.
      if (i > 0) {
        // eslint-disable-next-line no-console
        console.warn(
          `recap-web: active slug "${slug}" has no content file at ` +
            `apps/recap-web/src/content/${slug}.json — falling back to fixture ` +
            `at ${path}. Update apps/recap-web/src/lib/active-content.json or ` +
            `write the missing content file.`,
        );
      }
      return parseRecapPageContent(readJson(path));
    }
  }
  throw new Error(`recap-web: content not found for slug "${slug}"`);
}
