/**
 * RAG-ready source vault.
 *
 * Wraps the JSONL source cache with content hashing, dedup, and a small
 * keyword query API. Designed as a stepping stone toward retrieval over a
 * corpus of past research without dragging in an embedding store.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { dirname } from "node:path";
import { cacheRoot, hashUrl, readSources, sourcesPath, type CachedSource } from "./source-cache.js";

export interface VaultEntry extends CachedSource {
  /** Stable id reused across re-fetches of the same URL. */
  vaultId: string;
  /** Lowercased keywords extracted from the summary, capped at 32. */
  keywords: string[];
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && w.length <= 24)
    .slice(0, 64);
}

function contentHash(s: CachedSource): string {
  return createHash("sha256").update(`${s.url}::${s.summary}`).digest("hex").slice(0, 24);
}

function vaultFile(): string {
  return `${cacheRoot()}/vault.jsonl`;
}

export function indexCache(): VaultEntry[] {
  const entries = readSources().map<VaultEntry>((s) => ({
    ...s,
    vaultId: `vlt-${hashUrl(s.url)}`,
    keywords: Array.from(new Set(tokenize(s.summary))).slice(0, 32),
  }));
  // Dedup by content hash; later entries win (they are usually fresher fetches).
  const byHash = new Map<string, VaultEntry>();
  for (const e of entries) byHash.set(contentHash(e), e);
  const out = Array.from(byHash.values());
  const file = vaultFile();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out.map((e) => JSON.stringify(e)).join("\n") + "\n", "utf8");
  return out;
}

export function readVault(): VaultEntry[] {
  const file = vaultFile();
  if (!existsSync(file)) return indexCache();
  return readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as VaultEntry);
}

/**
 * Tiny keyword search. Returns entries scored by overlap with the query.
 * Cheap, deterministic, and no embedding store required.
 */
export function searchVault(query: string, limit = 5): VaultEntry[] {
  const q = new Set(tokenize(query));
  if (q.size === 0) return [];
  const scored = readVault()
    .map((e) => {
      let hit = 0;
      for (const k of e.keywords) if (q.has(k)) hit++;
      return { entry: e, score: hit };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((s) => s.entry);
}

export function appendSourceToVault(entry: CachedSource): VaultEntry {
  // Persist to the underlying cache file first.
  mkdirSync(dirname(sourcesPath()), { recursive: true });
  appendFileSync(sourcesPath(), JSON.stringify(entry) + "\n", "utf8");
  // Reindex incrementally.
  const vaultEntry: VaultEntry = {
    ...entry,
    vaultId: `vlt-${hashUrl(entry.url)}`,
    keywords: Array.from(new Set(tokenize(entry.summary))).slice(0, 32),
  };
  appendFileSync(vaultFile(), JSON.stringify(vaultEntry) + "\n", "utf8");
  return vaultEntry;
}
