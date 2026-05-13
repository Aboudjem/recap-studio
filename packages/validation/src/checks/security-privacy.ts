import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";

/**
 * Deterministic secret-pattern scan and side-effect surface review.
 */
const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/sk-[A-Za-z0-9]{20,}/g, "OpenAI-like secret key"],
  [/sk-ant-[A-Za-z0-9-_]{20,}/g, "Anthropic API key"],
  [/xox[bpars]-[A-Za-z0-9-]{10,}/g, "Slack token"],
  [/AKIA[0-9A-Z]{16}/g, "AWS access key id"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, "PEM private key"],
  [/ghp_[A-Za-z0-9]{20,}/g, "GitHub personal access token"],
  [/Bearer\s+[A-Za-z0-9._-]{20,}/g, "Bearer token in plain text"],
];

const INJECTION_HINTS = [
  /ignore (all|previous) (instructions|prompts)/i,
  /<\s*\/?\s*(script|iframe)\b/i,
  /system\s*:\s*you are/i,
];

export function checkSecurityPrivacy(content: RecapPageContent): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];
  const haystack = JSON.stringify(content);

  for (const [re, name] of SECRET_PATTERNS) {
    if (re.test(haystack)) {
      findings.push({
        severity: "blocker",
        message: `possible ${name} found in content`,
        path: "content",
        hint: "rotate the key and remove the literal value",
      });
    }
  }

  for (const re of INJECTION_HINTS) {
    if (re.test(haystack)) {
      findings.push({
        severity: "high",
        message: `possible prompt-injection or unsafe HTML pattern: ${re}`,
        path: "content",
        hint: "sanitize source text before rendering",
      });
    }
  }

  // Source provenance — every entry must be labeled.
  for (const s of content.sourceMap) {
    if (!s.provenance) {
      findings.push({
        severity: "low",
        message: `source ${s.id} missing provenance label`,
        path: `sourceMap.${s.id}`,
      });
    }
  }

  // Privacy: fixture flag must be reflected in the page.
  if (content.fixture === false && content.sourceMap.every((s) => s.provenance === "fixture")) {
    findings.push({
      severity: "medium",
      message: "all sources are fixtures but fixture flag is false",
      path: "fixture",
      hint: "set fixture: true so the page renders a fixture banner",
    });
  }

  const blockers = findings.filter((f) => f.severity === "blocker").length;
  const high = findings.filter((f) => f.severity === "high").length;
  const score = Math.max(1, Math.min(10, 10 - blockers * 5 - high * 2 - (findings.length - blockers - high)));

  return { name: "security-privacy", score, confidence: "high", findings };
}
