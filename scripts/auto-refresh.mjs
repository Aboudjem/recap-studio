#!/usr/bin/env node
/**
 * Recap Studio — auto-refresh.
 *
 * Re-validates a stored recap. Designed for cron / CI use: it does not
 * regenerate content (that requires the agent pipeline), it only re-runs
 * the deterministic validation board against the current schema and
 * fixture rules.
 *
 * Usage:
 *   node scripts/auto-refresh.mjs <slug>
 *   node scripts/auto-refresh.mjs                # uses active slug
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");

function resolveSlug() {
  if (process.argv[2]) return process.argv[2];
  const file = join(repoRoot, "apps", "recap-web", "src", "lib", "active-content.json");
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, "utf8")).slug ?? "latest-ai-models";
    } catch {
      /* ignore */
    }
  }
  return "latest-ai-models";
}

const slug = resolveSlug();
const candidates = [
  join(repoRoot, "apps", "recap-web", "src", "content", `${slug}.json`),
  join(repoRoot, "fixtures", "topics", `${slug}.json`),
];
const contentPath = candidates.find((p) => existsSync(p));

if (!contentPath) {
  console.error(`recap-studio auto-refresh: no content for "${slug}".`);
  process.exit(2);
}

console.log(`recap-studio auto-refresh: re-validating ${slug}`);
const validate = spawnSync(process.execPath, [join(repoRoot, "scripts", "validate.mjs"), contentPath], {
  stdio: "inherit",
});

if (validate.status !== 0) {
  console.error(`recap-studio auto-refresh: validation failed for ${slug}`);
  process.exit(validate.status ?? 1);
}

const history = spawnSync(process.execPath, [join(repoRoot, "scripts", "history.mjs")], {
  stdio: "inherit",
});

process.exit(history.status ?? 0);
