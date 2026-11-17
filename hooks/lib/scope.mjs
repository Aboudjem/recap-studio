/**
 * Recap Studio hooks: project scope.
 *
 * A plugin's hooks fire in every project once the plugin is installed. These
 * hooks guard recap work only, so each one asks this module first and does
 * nothing outside a recap-studio project.
 *
 * A folder is a recap-studio project when it, or a parent, holds one of:
 *   - recap-studio.config.ts (or .mts, .js, .mjs, .json), written by /recap setup
 *   - a .recap-studio/ folder
 *   - a package.json whose name is "recap-studio" (a checkout of this repo)
 *
 * The home folder and the filesystem root never count, so a stray
 * ~/.recap-studio cannot turn every project into a recap project.
 *
 * RECAP_HOOKS_EVERYWHERE=1 opts back in to the old behavior (hooks in every
 * project). The working directory is then treated as the project root.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

const CONFIG_FILES = [
  "recap-studio.config.ts",
  "recap-studio.config.mts",
  "recap-studio.config.js",
  "recap-studio.config.mjs",
  "recap-studio.config.json",
];

function isDir(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function hasMarker(dir) {
  if (CONFIG_FILES.some((f) => existsSync(join(dir, f)))) return true;
  if (isDir(join(dir, ".recap-studio"))) return true;
  try {
    return JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name === "recap-studio";
  } catch {
    return false;
  }
}

/** The recap-studio project root at or above `startDir`, or null. */
export function findProjectRoot(startDir, home = homedir()) {
  let dir = resolve(startDir);
  const stop = resolve(home);
  for (;;) {
    const parent = dirname(dir);
    if (dir === stop || parent === dir) return null;
    if (hasMarker(dir)) return dir;
    dir = parent;
  }
}

/**
 * The project root this hook run belongs to, or null when the hook must stay
 * silent. `payload.cwd` is the session's working directory as Claude Code
 * reports it; the process working directory is the fallback.
 */
export function hookProjectRoot(payload = {}, env = process.env) {
  const cwd = typeof payload.cwd === "string" && payload.cwd ? payload.cwd : process.cwd();
  if (env.RECAP_HOOKS_EVERYWHERE === "1") return resolve(cwd);
  return findProjectRoot(cwd, env.HOME || homedir());
}

/** True when `file` sits inside `root` (a relative `file` is taken from `cwd`). */
export function isInside(root, file, cwd = process.cwd()) {
  const rel = relative(resolve(root), resolve(cwd, file));
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
}
