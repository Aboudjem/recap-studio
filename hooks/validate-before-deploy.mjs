#!/usr/bin/env node
/**
 * Recap Studio hook: validate-before-deploy
 *
 * Blocks `vercel --prod` (and similar) unless recap-studio.config.ts exists
 * AND its deploymentMode is "production-with-confirmation" AND the env var
 * RECAP_USER_CONFIRMED_PROD_DEPLOY=1 is set.
 *
 * Registered on the Bash tool. Claude Code matchers select by tool name only,
 * so this hook reads the hook payload from stdin and self-filters: it acts
 * only on production-deploy commands and allows every other Bash command.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function readPayload() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const cmd = readPayload()?.tool_input?.command ?? "";

// Only guard real production deploys; allow every other Bash command.
if (!/(vercel|now)\s+(--prod|--production)\b/.test(cmd)) {
  process.exit(0);
}

const repoRoot = process.cwd();
const configPath = join(repoRoot, "recap-studio.config.ts");

if (!existsSync(configPath)) {
  process.stderr.write(
    "recap-studio: deploy blocked — recap-studio.config.ts is missing.\n" +
      "Run `/recap setup` first.\n",
  );
  process.exit(2);
}

const src = readFileSync(configPath, "utf8");
const productionEnabled =
  /deploymentMode\s*:\s*["']production-with-confirmation["']/.test(src);

if (!productionEnabled) {
  process.stderr.write(
    "recap-studio: deploy blocked — config.deploymentMode is not 'production-with-confirmation'.\n",
  );
  process.exit(2);
}

if (process.env.RECAP_USER_CONFIRMED_PROD_DEPLOY !== "1") {
  process.stderr.write(
    "recap-studio: deploy blocked — set RECAP_USER_CONFIRMED_PROD_DEPLOY=1 after explicit confirmation.\n",
  );
  process.exit(2);
}

process.exit(0);
