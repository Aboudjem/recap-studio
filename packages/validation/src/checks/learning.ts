import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";

/**
 * Learning-mode checks. Only meaningful when `content.learn.enabled` is true;
 * `runValidation` leaves the dimension out entirely otherwise, so a page
 * without learning mode scores exactly as it did before this dimension existed.
 *
 * Each rule below traces to a primary source, cited in
 * docs/proposals/learning-mode.md:
 *
 * - feedback belongs AFTER the answer, and every item needs it
 *   (Roediger & Butler 2011; Hattie & Timperley 2007)
 * - an item whose answer is printed inside its own prompt tests nothing and
 *   manufactures fluency (Koriat & Bjork 2005)
 * - too few retrieval items means the page is still something you only read
 *   (Adesope, Trevisan & Sundararajan 2017)
 * - prequestions only help the material they actually ask about, so one is
 *   not enough to cover a page (Pan & Carpenter 2023)
 *
 * Deterministic: no network, no LLM, no clock. Same content, same score.
 */

/** Minimum retrieval items on a learning-mode page. */
const MIN_CHECKS = 3;
/** Minimum prequestions on a learning-mode page. */
const MIN_PREQUESTIONS = 2;

/** True when `needle` appears inside `haystack`, ignoring case and edge whitespace. */
function containsInsensitive(haystack: string, needle: string): boolean {
  const n = needle.trim().toLowerCase();
  if (n.length === 0) return false;
  return haystack.toLowerCase().includes(n);
}

export function checkLearning(
  content: RecapPageContent,
): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];
  const learn = content.learn;
  const checks = learn?.checks ?? [];
  const prequestions = learn?.prequestions ?? [];

  if (checks.length < MIN_CHECKS) {
    findings.push({
      severity: "medium",
      message: `learning mode has ${checks.length} check${checks.length === 1 ? "" : "s"} (minimum ${MIN_CHECKS})`,
      path: "learn.checks",
      hint: "add one retrieval item per key idea — retrieval is the point of the mode",
    });
  }

  if (prequestions.length < MIN_PREQUESTIONS) {
    findings.push({
      severity: "medium",
      message: `learning mode has ${prequestions.length} prequestion${prequestions.length === 1 ? "" : "s"} (minimum ${MIN_PREQUESTIONS})`,
      path: "learn.prequestions",
      hint: "ask about what the reader must remember; prequestions only help the material they name",
    });
  }

  for (const c of checks) {
    if (c.why.trim().length === 0) {
      findings.push({
        severity: "high",
        message: "check has no feedback text",
        path: `learn.checks.${c.id}.why`,
        hint: "say why the right option is right — an unexplained answer leaves the error in place",
      });
    }

    const right = c.options[c.answer];
    if (right === undefined) {
      findings.push({
        severity: "blocker",
        message: `answer index ${c.answer} is outside options (0..${c.options.length - 1})`,
        path: `learn.checks.${c.id}.answer`,
        hint: "the page would print an empty right answer; fix the index",
      });
      continue;
    }

    if (containsInsensitive(c.prompt, right)) {
      findings.push({
        severity: "medium",
        message: "check is trivial: the right option appears in its own prompt",
        path: `learn.checks.${c.id}`,
        hint: "rewrite the prompt, or pick distractors the reader must actually choose between",
      });
    }
  }

  const issues = findings.filter((f) => f.severity !== "info").length;
  const score = Math.max(1, Math.min(10, 10 - issues));

  return { name: "learning", score, confidence: "high", findings };
}
