import type { RecapPageContent } from "@recap-studio/content-pipeline";
import { TARGETS, type DimensionResult, type ValidationReport } from "./types.js";
import { checkFacts } from "./checks/facts.js";
import { checkBeginner } from "./checks/beginner.js";
import { checkAccessibility } from "./checks/accessibility.js";
import { checkUx } from "./checks/ux.js";
import { checkPerformance } from "./checks/performance.js";
import { checkSecurityPrivacy } from "./checks/security-privacy.js";
import { checkSimplicity } from "./checks/simplicity.js";

export interface RunOpts {
  /** Path to .next build dir; if absent, perf confidence drops to low. */
  buildDir?: string;
  /** Pre-rendered HTML snapshot; if absent, a11y checks degrade gracefully. */
  htmlSnapshot?: string;
}

function statusFor(score: number, target: number, blockers: number): DimensionResult["status"] {
  if (blockers > 0) return "blocker";
  if (score >= target) return "pass";
  if (score >= target - 1) return "warn";
  return "fail";
}

export function runValidation(
  content: RecapPageContent,
  opts: RunOpts = {},
): ValidationReport {
  const results: DimensionResult[] = [
    checkFacts(content),
    checkBeginner(content),
    checkAccessibility(content, opts),
    checkUx(content),
    checkPerformance(content, opts),
    checkSecurityPrivacy(content),
    checkSimplicity(content),
  ].map((d) => {
    const blockers = d.findings.filter((f) => f.severity === "blocker").length;
    return {
      ...d,
      target: TARGETS[d.name],
      status: statusFor(d.score, TARGETS[d.name], blockers),
    };
  });

  const blockers = results
    .flatMap((d) => d.findings.filter((f) => f.severity === "blocker"))
    .map((f) => `[${f.path ?? "general"}] ${f.message}`);

  const passedThresholds = results.every((d) => d.status === "pass");

  const overall =
    Math.round(
      (results.reduce((sum, d) => sum + d.score, 0) / results.length) * 10,
    ) / 10;

  return {
    slug: content.slug,
    topic: content.topic,
    generatedAt: new Date().toISOString(),
    dimensions: results,
    blockers,
    overall,
    passedThresholds,
  };
}

export function reportMarkdown(report: ValidationReport): string {
  const rows = report.dimensions
    .map(
      (d) =>
        `| ${d.name.padEnd(18)} | ${String(d.score).padStart(2)}/10 | ${String(d.target).padStart(2)} | ${d.status.toUpperCase().padEnd(7)} | ${d.findings[0]?.message ?? "—"} |`,
    )
    .join("\n");
  const blockers =
    report.blockers.length > 0
      ? report.blockers.map((b) => `- ${b}`).join("\n")
      : "_none_";

  return [
    `## Validation report — ${report.slug}`,
    "",
    "| Dimension          | Score  | Target | Status   | Top finding |",
    "| ------------------ | ------ | ------ | -------- | ----------- |",
    rows,
    "",
    `Overall: **${report.overall}/10** — thresholds ${
      report.passedThresholds ? "PASSED ✅" : "NOT PASSED ⚠️"
    }`,
    "",
    "**Blockers**",
    blockers,
    "",
  ].join("\n");
}
