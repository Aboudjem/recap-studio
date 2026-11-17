#!/usr/bin/env node
/**
 * Recap Studio hook: format-after-edit
 *
 * Best-effort Prettier formatting of the file Claude Code just wrote.
 * Never fails the run: failures log to stderr and exit 0.
 *
 * Scope: acts only inside a recap-studio project (see lib/scope.mjs), and only
 * on a file that sits inside that project. It never formats a file of another
 * project, and never downloads Prettier (`npx --no-install`).
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { extname } from "node:path";
import { hookProjectRoot, isInside } from "./lib/scope.mjs";

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

const root = hookProjectRoot(payload);
if (!root) process.exit(0);
if (!file || !existsSync(file)) process.exit(0);
if (!isInside(root, file, payload.cwd || process.cwd())) process.exit(0);
if (!FORMATTABLE.has(extname(file))) process.exit(0);

const result = spawnSync("npx", ["--no-install", "prettier", "--write", file], {
  cwd: root,
  stdio: ["ignore", "ignore", "pipe"],
  timeout: 10_000,
});

if (result.error || (result.status !== 0 && result.status !== null)) {
  process.stderr.write(
    `recap-studio: prettier formatting skipped for ${file} (best-effort hook).\n`,
  );
}

process.exit(0);
