#!/usr/bin/env node
/**
 * Recap Studio demo: regenerate the "Latest AI models" page from the
 * offline-safe fixture. No network calls. No paid APIs.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");

const fixturePath = resolve(repoRoot, "fixtures", "topics", "latest-ai-models.json");
const contentPath = resolve(
  repoRoot,
  "apps",
  "recap-web",
  "src",
  "content",
  "latest-ai-models.json",
);
const activePath = resolve(
  repoRoot,
  "apps",
  "recap-web",
  "src",
  "lib",
  "active-content.json",
);

if (!existsSync(fixturePath)) {
  console.error("recap-studio: fixture not found at", fixturePath);
  process.exit(1);
}

const raw = readFileSync(fixturePath, "utf8");
const data = JSON.parse(raw);
data.generatedAt = new Date().toISOString();
data.fixture = true;

mkdirSync(dirname(contentPath), { recursive: true });
writeFileSync(contentPath, JSON.stringify(data, null, 2) + "\n", "utf8");

mkdirSync(dirname(activePath), { recursive: true });
writeFileSync(
  activePath,
  JSON.stringify({ slug: "latest-ai-models" }, null, 2) + "\n",
  "utf8",
);

console.log(`recap-studio: wrote ${contentPath.replace(repoRoot + "/", "")}`);
console.log(`recap-studio: active slug -> latest-ai-models`);
console.log("");
console.log("Next steps:");
console.log("  pnpm validate:demo          # deterministic quality report");
console.log("  pnpm --filter recap-web dev # preview locally on http://localhost:3000");
