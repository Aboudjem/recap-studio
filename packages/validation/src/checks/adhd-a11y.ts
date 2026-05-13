import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";
import type { RunOpts } from "../run.js";

const REQUIRED_LANDMARKS = ["<header", "<main", "<footer"] as const;

export function checkAdhdA11y(
  content: RecapPageContent,
  opts: RunOpts,
): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];

  if (content.keyIdeas.length > 7) {
    findings.push({
      severity: "medium",
      message: "more than 7 key ideas — chunk into sub-groups",
      path: "keyIdeas",
    });
  }
  if (content.fiveMinutePath.length > 7) {
    findings.push({
      severity: "low",
      message: "five-minute path > 7 steps",
      path: "fiveMinutePath",
    });
  }

  if (!content.visualSections.find((s) => s.kind === "matters" && s.enabled)) {
    findings.push({
      severity: "high",
      message: "missing 'What actually matters' summary section",
      path: "visualSections",
      hint: "ADHD-friendly pages need a skip-to-summary anchor",
    });
  }

  if (!content.visualSections.find((s) => s.kind === "takeaways" && s.enabled)) {
    findings.push({
      severity: "medium",
      message: "missing 'Practical takeaways' clear end-state",
      path: "visualSections",
    });
  }

  if (opts.htmlSnapshot) {
    for (const tag of REQUIRED_LANDMARKS) {
      if (!opts.htmlSnapshot.includes(tag)) {
        findings.push({
          severity: "medium",
          message: `missing landmark element: ${tag}>`,
          path: "html",
        });
      }
    }
    if (!opts.htmlSnapshot.toLowerCase().includes('aria-label="skip')
      && !opts.htmlSnapshot.toLowerCase().includes("skip to summary")) {
      findings.push({
        severity: "medium",
        message: "no Skip-to-summary link detected",
        path: "html",
      });
    }
  }

  const confidence = opts.htmlSnapshot ? "high" : "medium";
  const issues = findings.length;
  const score = Math.max(1, Math.min(10, 10 - issues));
  return { name: "adhd-a11y", score, confidence, findings };
}
