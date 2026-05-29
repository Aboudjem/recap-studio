/**
 * @recap-studio/content-pipeline
 *
 * Typed schemas, config, and helpers that the plugin (skills + agents) and
 * the Next.js app share. Zero runtime dependencies beyond `zod`.
 */
export * from "./schema.js";
export * from "./schema-session.js";
export * from "./config.js";
// NOTE: load-config.js uses a dynamic import() that webpack/Next cannot statically
// analyze ("Critical dependency" warning) and pulls node:fs/os into client bundles.
// It is intentionally NOT re-exported here. Import it from the dedicated subpath:
//   import { loadConfig } from "@recap-studio/content-pipeline/load-config";
export * from "./load.js";
export * from "./source-cache.js";
export * from "./source-vault.js";
export * from "./slugify.js";
export * from "./locales.js";
export * from "./analytics.js";
