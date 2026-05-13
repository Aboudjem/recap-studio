import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";

const FLUFF = [
  /\brevolution(ary|ize)\b/i,
  /\bbreakthrough\b/i,
  /\bgame[- ]?changer\b/i,
  /\bcutting[- ]?edge\b/i,
  /\bworld[- ]?class\b/i,
  /\bnext[- ]?gen(eration)?\b/i,
  /\bunparalleled\b/i,
  /\bseamless\b/i,
  /\bturnkey\b/i,
  /\bbest[- ]in[- ]class\b/i,
];

const HEDGE = [/\bpowerful\b/i, /\benterprise[- ]grade\b/i];

export function checkSimplicity(content: RecapPageContent): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];
  const haystack = JSON.stringify(content);

  for (const re of FLUFF) {
    if (re.test(haystack)) {
      findings.push({
        severity: "low",
        message: `marketing fluff word matches: ${re}`,
        path: "content",
        hint: "replace with a concrete claim, number, or example",
      });
    }
  }
  for (const re of HEDGE) {
    if (re.test(haystack)) {
      findings.push({
        severity: "info",
        message: `weak adjective: ${re}`,
        path: "content",
      });
    }
  }

  // Long-paragraph detector across cards.
  for (const k of content.keyIdeas) {
    const wc = k.body.trim().split(/\s+/).filter(Boolean).length;
    if (wc > 80) {
      findings.push({
        severity: "medium",
        message: `key idea "${k.id}" body has ${wc} words (>80)`,
        path: `keyIdeas.${k.id}`,
        hint: "split into two ideas or trim",
      });
    }
  }

  // Glossary noise — too many terms loses meaning.
  if (content.glossary.length > 18) {
    findings.push({
      severity: "low",
      message: `glossary has ${content.glossary.length} terms (>18)`,
      path: "glossary",
    });
  }

  const issues = findings.filter((f) => f.severity !== "info").length;
  const score = Math.max(1, Math.min(10, 10 - issues));
  return { name: "simplicity", score, confidence: "high", findings };
}
