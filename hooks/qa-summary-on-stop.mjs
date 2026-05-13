#!/usr/bin/env node
/**
 * Recap Studio hook: qa-summary-on-stop
 *
 * When Claude Code stops, look for the last artifacts/<slug>/validation.json
 * and print a compact summary. Never fails the run.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const artifactsDir = join(repoRoot, "artifacts");
if (!existsSync(artifactsDir)) process.exit(0);

function findLatestValidation() {
  let latest = null;
  let latestTime = 0;
  for (const slug of readdirSync(artifactsDir)) {
    const file = join(artifactsDir, slug, "validation.json");
    if (!existsSync(file)) continue;
    const mtime = statSync(file).mtimeMs;
    if (mtime > latestTime) {
      latest = file;
      latestTime = mtime;
    }
  }
  return latest;
}

const file = findLatestValidation();
if (!file) process.exit(0);

try {
  const data = JSON.parse(readFileSync(file, "utf8"));
  const rows = (data.dimensions ?? [])
    .map(
      (d) =>
        `  - ${d.name.padEnd(18)} ${String(d.score).padStart(2)}/10  (target ${d.target})  ${d.status ?? ""}`,
    )
    .join("\n");
  const blockers = (data.blockers ?? []).join("\n  - ") || "none";
  process.stdout.write(
    `\nrecap-studio QA summary (${file.replace(repoRoot + "/", "")}):\n${rows}\nblockers:\n  - ${blockers}\n`,
  );
} catch {
  /* best-effort */
}

process.exit(0);
