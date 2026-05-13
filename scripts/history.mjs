#!/usr/bin/env node
/**
 * Recap Studio — run history dashboard.
 *
 * Walks artifacts/<slug>/validation.json and prints a one-line summary per
 * recap. Also emits apps/recap-web/src/content/history.json so the app's
 * future /history route can render the same data.
 *
 * Offline. No network. No paid API.
 */
import { existsSync, readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");
const artifactsDir = join(repoRoot, "artifacts");
const outFile = join(repoRoot, "apps", "recap-web", "src", "content", "history.json");

function collect() {
  if (!existsSync(artifactsDir)) return [];
  const rows = [];
  for (const slug of readdirSync(artifactsDir).sort()) {
    const file = join(artifactsDir, slug, "validation.json");
    if (!existsSync(file)) continue;
    try {
      const data = JSON.parse(readFileSync(file, "utf8"));
      const stat = statSync(file);
      rows.push({
        slug,
        topic: data.topic ?? slug,
        overall: data.overall ?? 0,
        passedThresholds: data.passedThresholds ?? false,
        generatedAt: data.generatedAt ?? new Date(stat.mtimeMs).toISOString(),
        blockers: (data.blockers ?? []).length,
        dimensions: (data.dimensions ?? []).map((d) => ({
          name: d.name,
          score: d.score,
          status: d.status,
        })),
      });
    } catch {
      // skip malformed
    }
  }
  return rows.sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1));
}

const rows = collect();

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2) + "\n", "utf8");

if (rows.length === 0) {
  console.log("recap-studio history: no recaps yet. Run `pnpm -w demo:latest-ai-models` first.");
  process.exit(0);
}

const header = "| slug                | topic                                  |  score | blockers | when                 |";
const divider = "| ------------------- | -------------------------------------- | ------ | -------- | -------------------- |";
const lines = rows.map((r) => {
  const slug = r.slug.padEnd(19).slice(0, 19);
  const topic = r.topic.padEnd(38).slice(0, 38);
  const score = `${r.overall.toFixed(1)}/10`.padStart(6);
  const blockers = String(r.blockers).padStart(8);
  const when = r.generatedAt.slice(0, 19).replace("T", " ");
  return `| ${slug} | ${topic} | ${score} | ${blockers} | ${when} |`;
});

console.log(`recap-studio history (${rows.length} recap${rows.length === 1 ? "" : "s"}):`);
console.log("");
console.log(header);
console.log(divider);
for (const line of lines) console.log(line);
console.log("");
console.log(`Wrote ${outFile.replace(repoRoot + "/", "")}`);
