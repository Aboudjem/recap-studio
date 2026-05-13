/**
 * On-disk JSONL cache for research summaries. Used by research-scout to
 * avoid re-fetching, and by the MCP server's `cache_source` tool.
 */
import { existsSync, mkdirSync, appendFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";

export interface CachedSource {
  id: string;
  url: string;
  fetchedAt: string;
  contentHash: string;
  summary: string;
  publisher?: string;
  publishedAt?: string | null;
  /** raw extracted text, capped to 8 KB */
  excerpt: string;
}

export function cacheRoot(): string {
  const home = process.env.RECAP_STUDIO_HOME;
  if (home && home.length > 0) return resolve(home);
  return resolve(process.cwd(), ".recap-studio", "cache");
}

export function sourcesPath(): string {
  return join(cacheRoot(), "sources.jsonl");
}

export function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

export function appendSource(entry: CachedSource): string {
  const file = sourcesPath();
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, JSON.stringify(entry) + "\n", "utf8");
  return file;
}

export function readSources(): CachedSource[] {
  const file = sourcesPath();
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as CachedSource);
}

export function findByUrl(url: string): CachedSource | undefined {
  const hash = hashUrl(url);
  return readSources().find((s) => s.contentHash.startsWith(hash));
}
