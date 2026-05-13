#!/usr/bin/env node
/**
 * Recap Studio hook: block-secret-writes
 *
 * Refuses writes to secret-like paths. Exits 0 (allow) or 2 (block) per the
 * Claude Code hook contract. The hook payload arrives on stdin as JSON; we
 * only inspect `tool_input.file_path` / `tool_input.target_path`.
 */
import { readFileSync } from "node:fs";

const SECRET_GLOBS = [
  /(^|\/)\.env(\..*)?$/i,
  /(^|\/)secrets(\/|$)/i,
  /(^|\/)private(\/|$)/i,
  /(^|\/)id_(rsa|ed25519|ecdsa|dsa)(\.pub)?$/,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
  /\.keystore$/i,
];

function readPayload() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const payload = readPayload();
const input = payload.tool_input ?? {};
const target = input.file_path ?? input.target_path ?? input.path ?? "";

if (!target) process.exit(0);

const allow = process.env.RECAP_ALLOW_SECRET_WRITE === "1";
const blocked = SECRET_GLOBS.some((re) => re.test(target));

if (blocked && !allow) {
  process.stderr.write(
    `recap-studio: blocked write to potentially-secret path: ${target}\n` +
      `set RECAP_ALLOW_SECRET_WRITE=1 only after a human has reviewed the intent.\n`,
  );
  process.exit(2);
}

process.exit(0);
