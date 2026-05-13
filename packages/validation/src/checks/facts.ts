import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";

/**
 * Deterministic fact check: every cited element must reference at least one
 * sourceMap id, and every referenced id must exist.
 */
export function checkFacts(content: RecapPageContent): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];
  const ids = new Set(content.sourceMap.map((s) => s.id));
  const strong = new Set(
    content.sourceMap.filter((s) => s.composite >= 7).map((s) => s.id),
  );

  const cited: Array<{ path: string; sourceIds: string[] }> = [];

  for (const k of content.keyIdeas) cited.push({ path: `keyIdeas.${k.id}`, sourceIds: k.sourceIds });
  for (const e of content.examples) cited.push({ path: `examples.${e.id}`, sourceIds: e.sourceIds });
  for (const m of content.misconceptions) cited.push({ path: `misconceptions.${m.id}`, sourceIds: m.sourceIds });
  for (const t of content.timeline ?? []) cited.push({ path: `timeline.${t.date}`, sourceIds: t.sourceIds });
  for (const c of content.comparisons ?? []) {
    for (const row of c.rows) {
      cited.push({ path: `comparisons.${c.id}.${row.name}`, sourceIds: row.sourceIds });
    }
  }

  let supported = 0;
  for (const item of cited) {
    if (item.sourceIds.length === 0) {
      findings.push({
        severity: "high",
        message: "claim has no sourceIds",
        path: item.path,
        hint: "add at least one sourceMap id, or drop the claim",
      });
      continue;
    }
    const missing = item.sourceIds.filter((id) => !ids.has(id));
    if (missing.length > 0) {
      findings.push({
        severity: "blocker",
        message: `sourceIds reference unknown ids: ${missing.join(", ")}`,
        path: item.path,
        hint: "fix the id, or remove the broken citation",
      });
      continue;
    }
    const hasStrong = item.sourceIds.some((id) => strong.has(id));
    if (!hasStrong) {
      findings.push({
        severity: "medium",
        message: "claim only supported by sources scored < 7",
        path: item.path,
        hint: "find a stronger primary source, or downgrade to uncertaintyNotes",
      });
      continue;
    }
    supported += 1;
  }

  const total = cited.length || 1;
  const blockers = findings.filter((f) => f.severity === "blocker").length;
  const score = Math.max(
    1,
    Math.min(10, Math.round((supported / total) * 10) - blockers),
  );

  return {
    name: "facts",
    score,
    confidence: "high",
    findings,
  };
}
