#!/usr/bin/env node
/**
 * Recap Studio hook: block-secret-writes
 *
 * Refuses writes to secret-like paths. Exits 0 (allow) or 2 (block) per the
 * Claude Code hook contract. The hook payload arrives on stdin as JSON; we
 * only inspect `tool_input.file_path` / `tool_input.target_path`.
 *
 * Scope: acts only inside a recap-studio project (see lib/scope.mjs). In any
 * other project it allows the write without looking at it.
 */
import { readFileSync } from "node:fs";
import { hookProjectRoot } from "./lib/scope.mjs";

const SECRET_GLOBS = [
  /(^|\/)\.env(\..*)?$/i,
  /(^|\/)secrets(\/|$)/i,
  /(^|\/)private(\/|$)/i,
  /(^|\/)id_(rsa|ed25519|ecdsa|dsa)(\.pub)?$/,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.keystore$/i,
  /\.key$/i,
];

/**
 * macOS keeps temp folders under /private (/private/tmp, /private/var/folders).
 * That "private" belongs to the system, not to a secret folder, so drop it and
 * check the rest of the path. A .env or a key file in a temp folder still blocks.
 */
function secretPathToCheck(target) {
  return target.replace(/^\/private(?=\/(tmp|var)\/)/, "");
}

function isSecretPath(target) {
  const rest = secretPathToCheck(target);
  return SECRET_GLOBS.some((re) => re.test(rest));
}

function readPayload() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const payload = readPayload();
if (!hookProjectRoot(payload)) process.exit(0);
const input = payload.tool_input ?? {};
const target = input.file_path ?? input.target_path ?? input.path ?? "";

if (!target) process.exit(0);

const allow = process.env.RECAP_ALLOW_SECRET_WRITE === "1";
const blocked = isSecretPath(target);

if (blocked && !allow) {
  process.stderr.write(
    `recap-studio: blocked write to potentially-secret path: ${target}\n` +
      `set RECAP_ALLOW_SECRET_WRITE=1 only after a human has reviewed the intent.\n`,
  );
  process.exit(2);
}

process.exit(0);
