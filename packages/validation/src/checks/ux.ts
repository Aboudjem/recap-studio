import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";

const ORDER_PREFIX: string[] = [
  "hero",
  "matters",
  "concept-map",
  "ideas",
];

export function checkUx(content: RecapPageContent): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];

  const enabled = content.visualSections.filter((s) => s.enabled);
  const actualPrefix = enabled.slice(0, ORDER_PREFIX.length).map((s) => s.kind);
  for (let i = 0; i < ORDER_PREFIX.length; i++) {
    if (actualPrefix[i] !== ORDER_PREFIX[i]) {
      findings.push({
        severity: "low",
        message: `section order deviates at index ${i}: expected ${ORDER_PREFIX[i]}, got ${actualPrefix[i] ?? "—"}`,
        path: "visualSections",
      });
      break;
    }
  }

  if (content.diagrams.length === 0) {
    findings.push({
      severity: "low",
      message: "no diagrams — page risks being a wall of text",
      path: "diagrams",
    });
  }
  for (const d of content.diagrams) {
    if (!d.alt || d.alt.length < 8) {
      findings.push({
        severity: "medium",
        message: `diagram "${d.id}" has weak or missing alt text`,
        path: `diagrams.${d.id}`,
      });
    }
  }

  // Comparison must have ≥ 2 columns of substance.
  for (const c of content.comparisons ?? []) {
    if (c.columns.length < 2) {
      findings.push({
        severity: "medium",
        message: `comparison "${c.id}" has fewer than 2 columns`,
        path: `comparisons.${c.id}`,
      });
    }
  }

  const issues = findings.length;
  const score = Math.max(1, Math.min(10, 10 - issues));
  return { name: "ux", score, confidence: "high", findings };
}
