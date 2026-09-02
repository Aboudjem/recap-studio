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
        `| ${d.name.padEnd(18)} | ${String(d.score).padStart(2)}/10 | ${String(d.target).padStart(2)} | ${d.status.toUpperCase().padEnd(7)} | ${d.findings[0]?.message ?? "none"} |`,
    )
    .join("\n");
  const blockers =
    report.blockers.length > 0
      ? report.blockers.map((b) => `- ${b}`).join("\n")
      : "_none_";

  return [
    `## Validation report: ${report.slug}`,
    "",
    "| Dimension          | Score  | Target | Status   | Top finding |",
    "| ------------------ | ------ | ------ | -------- | ----------- |",
    rows,
    "",
    `Overall: **${report.overall}/10**, thresholds ${
      report.passedThresholds ? "PASSED ✅" : "NOT PASSED ⚠️"
    }`,
    "",
    "**Blockers**",
    blockers,
    "",
  ].join("\n");
}

/** Options `reportJson` cannot derive from the report itself. */
export interface ReportJsonOptions {
  /** The version string of the tool that produced this report (the CLI's). */
  version: string;
  /** The active `--fail-under` gate, or null when the threshold rule applies. */
  failUnder?: number | null;
}

/** One check as it appears in the JSON envelope. */
export interface JsonCheck {
  name: string;
  score: number;
  target: number;
  status: string;
  confidence: string;
  findings: Array<{ severity: string; message: string; hint?: string; path?: string }>;
}

/** The machine-readable validation envelope. */
export interface JsonReport {
  tool: "recap";
  version: string;
  slug: string;
  topic: string;
  generatedAt: string;
  overall: number;
  passedThresholds: boolean;
  failUnder: number | null;
  ok: boolean;
  checks: JsonCheck[];
  blockers: string[];
}

/**
 * Decide whether a report passes.
 *
 * Without a numeric gate this is `passedThresholds`, which requires EVERY
 * dimension to sit at status "pass" (a "warn" one point under target fails).
 *
 * With `--fail-under n` the numeric gate replaces that per-dimension rule, but
 * it does NOT replace the blocker rule: a blocker is a leaked key or an
 * equivalent hard failure, and averaging it away would let one through CI.
 */
export function reportPasses(report: ValidationReport, failUnder?: number | null): boolean {
  if (failUnder === undefined || failUnder === null) return report.passedThresholds;
  return report.overall >= failUnder && report.blockers.length === 0;
}

/**
 * Reshape a ValidationReport into the JSON envelope. Pure: it reads the report
 * and the options and returns a fresh object, mutating neither. Every object is
 * rebuilt field by field so key order is stable across runs; reusing the report's
 * own dimension objects would not be, because `target` and `status` are attached
 * to them after the fact in runValidation.
 */
export function reportJson(report: ValidationReport, opts: ReportJsonOptions): JsonReport {
  const failUnder = opts.failUnder ?? null;
  return {
    tool: "recap",
    version: opts.version,
    slug: report.slug,
    topic: report.topic,
    generatedAt: report.generatedAt,
    overall: report.overall,
    passedThresholds: report.passedThresholds,
    failUnder,
    ok: reportPasses(report, failUnder),
    checks: report.dimensions.map((d) => ({
      name: d.name,
      score: d.score,
      target: d.target,
      status: d.status,
      confidence: d.confidence,
      findings: d.findings.map((f) => {
        const out: JsonCheck["findings"][number] = { severity: f.severity, message: f.message };
        if (f.hint !== undefined) out.hint = f.hint;
        if (f.path !== undefined) out.path = f.path;
        return out;
      }),
    })),
    blockers: [...report.blockers],
  };
}
