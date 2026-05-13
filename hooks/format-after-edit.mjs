#!/usr/bin/env node
/**
 * Recap Studio hook: format-after-edit
 *
 * Best-effort Prettier formatting of the file Claude Code just wrote.
 * Never fails the run — failures log to stderr and exit 0.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { extname } from "node:path";

const FORMATTABLE = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
  ".json", ".md", ".mdx", ".css", ".scss", ".yaml", ".yml",
]);

function readPayload() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const payload = readPayload();
const file =
  payload?.tool_input?.file_path ??
  payload?.tool_response?.file_path ??
  "";

if (!file || !existsSync(file)) process.exit(0);
if (!FORMATTABLE.has(extname(file))) process.exit(0);

const result = spawnSync("npx", ["--no-install", "prettier", "--write", file], {
  stdio: ["ignore", "ignore", "pipe"],
  timeout: 10_000,
});

if (result.error || (result.status !== 0 && result.status !== null)) {
  process.stderr.write(
    `recap-studio: prettier formatting skipped for ${file} (best-effort hook).\n`,
  );
}

process.exit(0);
