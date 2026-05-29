/**
 * loadConfig — resolves RecapStudioConfig from disk with a 3-tier search:
 *
 *   1. Project-local file in `cwd` (recap-studio.config.{ts,mts,mjs,js,json})
 *   2. Global file in `~/.config/recap-studio/recap-studio.config.{mjs,js,json,ts}`
 *   3. DEFAULT_CONFIG
 *
 * Kept out of `config.ts` so that file stays browser-/edge-safe (no fs / os).
 * Side effects (deploy, email, paid APIs) remain opt-in at every tier.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  DEFAULT_CONFIG,
  RecapStudioConfig,
  resolveConfig,
} from "./config.js";

export interface LoadConfigOpts {
  /** Working directory for the project-level search. Defaults to process.cwd(). */
  cwd?: string;
  /** Per-call overrides applied last (highest precedence). */
  overrides?: Partial<RecapStudioConfig>;
  /** Override the env snapshot used by RECAP_STUDIO_FIXTURE_ONLY. */
  env?: Record<string, string | undefined>;
  /** Override the global config dir. Defaults to ~/.config/recap-studio. */
  globalDir?: string;
}

export interface LoadedConfig {
  config: RecapStudioConfig;
  /** Where the base config came from. */
  source: "project" | "global" | "defaults";
  /** Absolute path of the loaded file, when source !== "defaults". */
  path?: string;
}

const PROJECT_CANDIDATES = [
  "recap-studio.config.ts",
  "recap-studio.config.mts",
  "recap-studio.config.mjs",
  "recap-studio.config.js",
  "recap-studio.config.json",
];

// Plain JS / JSON first — works in any runtime (node, Next, tsx, Bun).
// `.ts` last as a courtesy for TS-runtime callers.
const GLOBAL_CANDIDATES = [
  "recap-studio.config.mjs",
  "recap-studio.config.js",
  "recap-studio.config.json",
  "recap-studio.config.ts",
];

function defaultGlobalDir(): string {
  return join(homedir(), ".config", "recap-studio");
}

async function readConfigFile(
  path: string,
): Promise<Partial<RecapStudioConfig> | null> {
  if (path.endsWith(".json")) {
    try {
      return JSON.parse(readFileSync(path, "utf8")) as Partial<RecapStudioConfig>;
    } catch {
      return null;
    }
  }
  try {
    const mod = await import(pathToFileURL(path).href);
    const cfg = (mod.default ?? mod.config) as Partial<RecapStudioConfig> | undefined;
    return cfg && typeof cfg === "object" ? cfg : null;
  } catch {
    // TS file imported from a non-TS runtime, syntax error, etc. — fall through.
    return null;
  }
}

async function tryLoad(
  dir: string,
  candidates: readonly string[],
): Promise<{ value: Partial<RecapStudioConfig>; path: string } | null> {
  for (const name of candidates) {
    const path = resolve(dir, name);
    if (!existsSync(path)) continue;
    const value = await readConfigFile(path);
    if (value) return { value, path };
  }
  return null;
}

/**
 * Resolve config with project → global → defaults precedence.
 *
 * Async because the loader uses dynamic `import()` for .ts / .mjs / .js files.
 */
export async function loadConfig(
  opts: LoadConfigOpts = {},
): Promise<LoadedConfig> {
  const cwd = opts.cwd ?? process.cwd();
  const globalDir = opts.globalDir ?? defaultGlobalDir();
  const env = opts.env ?? process.env;

  const project = await tryLoad(cwd, PROJECT_CANDIDATES);
  if (project) {
    return {
      config: resolveConfig({ ...project.value, ...opts.overrides }, env),
      source: "project",
      path: project.path,
    };
  }

  const global = await tryLoad(globalDir, GLOBAL_CANDIDATES);
  if (global) {
    return {
      config: resolveConfig({ ...global.value, ...opts.overrides }, env),
      source: "global",
      path: global.path,
    };
  }

  return {
    config: resolveConfig({ ...opts.overrides }, env),
    source: "defaults",
  };
}

/** Convenience for callers that only want the resolved config object. */
export async function loadConfigValue(
  opts: LoadConfigOpts = {},
): Promise<RecapStudioConfig> {
  return (await loadConfig(opts)).config;
}

export { DEFAULT_CONFIG };
