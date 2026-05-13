import { existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";
import type { RunOpts } from "../run.js";

const MAX_BUNDLE_KB_GZ = 250;
const WARN_BUNDLE_KB_GZ = 150;

function recursiveSize(dir: string, ext: string): number {
  if (!existsSync(dir)) return 0;
  let bytes = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) bytes += recursiveSize(path, ext);
    else if (name.endsWith(ext)) bytes += stat.size;
  }
  return bytes;
}

export function checkPerformance(
  content: RecapPageContent,
  opts: RunOpts,
): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];

  if (content.diagrams.length > 4) {
    findings.push({
      severity: "low",
      message: "more than 4 diagrams may bloat the bundle",
      path: "diagrams",
    });
  }

  let confidence: "low" | "medium" | "high" = "low";
  let bundleScore = 8; // baseline when we cannot measure

  if (opts.buildDir && existsSync(opts.buildDir)) {
    confidence = "high";
    const jsBytes = recursiveSize(join(opts.buildDir, "static", "chunks"), ".js");
    const kbGz = Math.round(jsBytes / 1024 / 3); // rough gz heuristic ~3x
    if (kbGz > MAX_BUNDLE_KB_GZ) {
      findings.push({
        severity: "high",
        message: `bundle ~${kbGz}KB gz exceeds ${MAX_BUNDLE_KB_GZ}KB budget`,
        path: "build",
      });
      bundleScore -= 3;
    } else if (kbGz > WARN_BUNDLE_KB_GZ) {
      findings.push({
        severity: "medium",
        message: `bundle ~${kbGz}KB gz exceeds ${WARN_BUNDLE_KB_GZ}KB soft budget`,
        path: "build",
      });
      bundleScore -= 1;
    }
  } else {
    findings.push({
      severity: "info",
      message: "no .next build found — performance score is static-only",
      path: "build",
      hint: "run `pnpm --filter recap-web build` to get bundle data",
    });
  }

  const issues = findings.filter((f) => f.severity !== "info").length;
  const score = Math.max(1, Math.min(10, bundleScore - Math.max(0, issues - 1)));
  return { name: "performance", score, confidence, findings };
}
