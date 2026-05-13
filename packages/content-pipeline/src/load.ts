/**
 * Filesystem helpers — used by the Next.js app, scripts, and validator.
 * Pure functions that take a base path and a slug; no global state.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import {
  RecapPageContent,
  parseRecapPageContent,
  type RecapPageContent as RecapPageContentType,
} from "./schema.js";

export interface LoadOpts {
  /** repo root (defaults to process.cwd()) */
  root?: string;
}

export function contentDir({ root = process.cwd() }: LoadOpts = {}): string {
  return resolve(root, "apps", "recap-web", "src", "content");
}

export function contentPath(slug: string, opts: LoadOpts = {}): string {
  return join(contentDir(opts), `${slug}.json`);
}

export function readContent(
  slug: string,
  opts: LoadOpts = {},
): RecapPageContentType {
  const file = contentPath(slug, opts);
  if (!existsSync(file)) {
    throw new Error(`recap-studio: content not found: ${file}`);
  }
  const raw = JSON.parse(readFileSync(file, "utf8"));
  return parseRecapPageContent(raw);
}

export function writeContent(
  content: RecapPageContentType,
  opts: LoadOpts = {},
): string {
  const parsed = RecapPageContent.parse(content);
  const file = contentPath(parsed.slug, opts);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(parsed, null, 2) + "\n", "utf8");
  return file;
}

/**
 * Read the active slug (defaults to "latest-ai-models" if not set).
 * Used by the Next.js page to decide what to render.
 */
export function readActiveSlug(opts: LoadOpts = {}): string {
  const file = resolve(
    opts.root ?? process.cwd(),
    "apps",
    "recap-web",
    "src",
    "lib",
    "active-content.json",
  );
  if (!existsSync(file)) return "latest-ai-models";
  try {
    const data = JSON.parse(readFileSync(file, "utf8")) as { slug?: string };
    return data.slug ?? "latest-ai-models";
  } catch {
    return "latest-ai-models";
  }
}

export function writeActiveSlug(slug: string, opts: LoadOpts = {}): string {
  const file = resolve(
    opts.root ?? process.cwd(),
    "apps",
    "recap-web",
    "src",
    "lib",
    "active-content.json",
  );
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ slug }, null, 2) + "\n", "utf8");
  return file;
}
