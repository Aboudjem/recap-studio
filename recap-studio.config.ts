/**
 * Recap Studio runtime config.
 *
 * Contains only typed knobs. No secrets. Secrets live in env (set in your
 * shell or Vercel project settings) and are never written to disk by the
 * skill.
 *
 * Created 2026-05-13 to enable explicit-confirmation deploy + email for the
 * Hermes / OpenClaw recap. User confirmed in-session.
 */
import type { RecapStudioConfig } from "@recap-studio/content-pipeline";

const config: RecapStudioConfig = {
  contentLength: "medium",
  explanationDepth: "intermediate",
  researchIntensity: "balanced",
  theme: "auto",
  animationIntensity: "low",
  visualDensity: "medium",
  deploymentMode: "preview",
  emailMode: "send-with-confirmation",
  citationStrictness: "strict",
  costMode: "balanced",
  modelRouting: "auto",
  sourceFreshnessRequired: true,
};

export default config;
