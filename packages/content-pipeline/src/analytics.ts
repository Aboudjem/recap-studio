/**
 * Reader analytics — privacy-friendly local-only counter.
 *
 * No cookies. No third-party. The Next.js page can opt in by hitting a
 * server-only route handler that calls `recordEvent()`. Disabled by default
 * (the page does not call it unless the developer wires the handler).
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { cacheRoot } from "./source-cache.js";

export type ReaderEvent =
  | { type: "view"; slug: string; locale?: string }
  | { type: "section-read"; slug: string; sectionId: string }
  | { type: "source-click"; slug: string; sourceId: string };

interface Counters {
  views: Record<string, number>;
  sections: Record<string, Record<string, number>>;
  sources: Record<string, Record<string, number>>;
  updatedAt: string;
}

function counterFile(): string {
  return join(cacheRoot(), "analytics.json");
}

export function readCounters(): Counters {
  const file = counterFile();
  if (!existsSync(file)) {
    return { views: {}, sections: {}, sources: {}, updatedAt: new Date(0).toISOString() };
  }
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Counters;
  } catch {
    return { views: {}, sections: {}, sources: {}, updatedAt: new Date(0).toISOString() };
  }
}

export function recordEvent(event: ReaderEvent): Counters {
  const file = counterFile();
  const data = readCounters();
  if (event.type === "view") {
    data.views[event.slug] = (data.views[event.slug] ?? 0) + 1;
  } else if (event.type === "section-read") {
    const bySlug = (data.sections[event.slug] ??= {});
    bySlug[event.sectionId] = (bySlug[event.sectionId] ?? 0) + 1;
  } else if (event.type === "source-click") {
    const bySlug = (data.sources[event.slug] ??= {});
    bySlug[event.sourceId] = (bySlug[event.sourceId] ?? 0) + 1;
  }
  data.updatedAt = new Date().toISOString();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  return data;
}
