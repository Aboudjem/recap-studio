/**
 * Recap Studio config TEMPLATE — copy to `recap-studio.config.ts` (or run
 * `/recap setup`) and edit. The real file is gitignored so your local choices
 * (and any deploy/email opt-ins) never ship to the repo.
 *
 * Every side effect is OFF by default. Turn things on deliberately:
 *   deploymentMode: "preview" | "production-with-confirmation"  (needs VERCEL_TOKEN)
 *   emailMode:      "draft" | "send-with-confirmation"          (needs RESEND_API_KEY)
 */
import type { RecapStudioConfig } from "@recap-studio/content-pipeline";

const config: RecapStudioConfig = {
  contentLength: "medium",
  explanationDepth: "beginner",
  researchIntensity: "balanced",
  theme: "dark",
  animationIntensity: "low",
  visualDensity: "medium",
  deploymentMode: "disabled",
  emailMode: "disabled",
  citationStrictness: "strict",
  costMode: "balanced",
  modelRouting: "auto",
  sourceFreshnessRequired: true,
};

export default config;
