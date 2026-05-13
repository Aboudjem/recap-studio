#!/usr/bin/env node
/**
 * Recap Studio hook: block-destructive-git
 *
 * Refuses dangerous git commands. Exit 2 to block.
 */
import { readFileSync } from "node:fs";

const FORBIDDEN = [
  /\bgit\s+push\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bgit\s+rebase\b/i,
  /\bgit\s+clean\s+-fd?x?\b/i,
  /\bgit\s+branch\s+-D\b/i,
  /\bgit\s+commit\s+--amend\s+--force\b/i,
  /\bgit\s+filter-branch\b/i,
  /\bgit\s+gc\s+--prune\b/i,
  /\bgit\s+worktree\s+remove\s+--force\b/i,
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
const cmd = payload?.tool_input?.command ?? "";

if (!cmd) process.exit(0);

const allow = process.env.RECAP_ALLOW_DESTRUCTIVE_GIT === "1";
const match = FORBIDDEN.find((re) => re.test(cmd));
if (match && !allow) {
  process.stderr.write(
    `recap-studio: refused destructive git command (pattern ${match}).\n` +
      `set RECAP_ALLOW_DESTRUCTIVE_GIT=1 only after human review.\n`,
  );
  process.exit(2);
}

process.exit(0);
