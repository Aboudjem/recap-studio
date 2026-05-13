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
  for (const path of candidates) {
    if (existsSync(path)) {
      return parseRecapPageContent(readJson(path));
    }
  }
  throw new Error(`recap-web: content not found for slug "${slug}"`);
}
