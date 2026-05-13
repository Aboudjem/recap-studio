#!/usr/bin/env node
/**
 * Recap Studio hook: validate-before-deploy
 *
 * Blocks `vercel --prod` (and similar) unless recap-studio.config.ts exists
 * AND its deploymentMode is "production-with-confirmation" AND the env var
 * RECAP_USER_CONFIRMED_PROD_DEPLOY=1 is set.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
