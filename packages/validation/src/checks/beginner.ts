import type { RecapPageContent } from "@recap-studio/content-pipeline";
import type { DimensionResult, Finding } from "../types.js";

const wpm = 220; // smart-but-uninformed reader, mobile

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function totalWords(content: RecapPageContent): number {
  let n = 0;
  n += wordCount(content.oneSentenceAnswer);
  for (const s of content.fiveMinutePath) n += wordCount(s);
  for (const s of content.whyItMatters) n += wordCount(s);
  for (const k of content.keyIdeas) n += wordCount(k.title) + wordCount(k.body);
  for (const e of content.examples) n += wordCount(e.title) + wordCount(e.body);
  for (const a of content.analogies) n += wordCount(a.setup) + wordCount(a.takeaway);
  for (const m of content.misconceptions) n += wordCount(m.myth) + wordCount(m.truth);
  for (const t of content.timeline ?? []) n += wordCount(t.title) + wordCount(t.body);
  for (const c of content.comparisons ?? []) {
    n += wordCount(c.title);
    for (const r of c.rows) n += Object.values(r.cells).reduce((s, v) => s + wordCount(v), 0);
  }
  for (const g of content.glossary) n += wordCount(g.term) + wordCount(g.definition);
  for (const s of content.practicalTakeaways) n += wordCount(s);
  return n;
}

export function checkBeginner(content: RecapPageContent): Omit<DimensionResult, "target" | "status"> {
  const findings: Finding[] = [];

  if (wordCount(content.oneSentenceAnswer) > 30) {
    findings.push({
      severity: "medium",
      message: "oneSentenceAnswer is over 30 words",
      path: "oneSentenceAnswer",
      hint: "compress to a single, simple sentence",
    });
  }

  for (const k of content.keyIdeas) {
    if (wordCount(k.body) > 60) {
      findings.push({
        severity: "low",
        message: "key idea body exceeds 60 words",
        path: `keyIdeas.${k.id}`,
        hint: "split or trim — mobile-first chunking",
      });
    }
  }

  const words = totalWords(content);
  const minutes = words / wpm;
  if (minutes > 5.5) {
    findings.push({
      severity: "medium",
      message: `estimated read time ${minutes.toFixed(1)} min exceeds 5 min target`,
      path: "global",
      hint: "drop or collapse weakest section",
    });
  }

  // Glossary coverage: every glossary term must appear at least once in the body.
  const haystack = JSON.stringify(content).toLowerCase();
  for (const g of content.glossary) {
    if (!haystack.includes(g.term.toLowerCase())) {
      findings.push({
        severity: "low",
        message: `glossary term "${g.term}" is never used in the body`,
        path: `glossary.${g.term}`,
        hint: "remove unused terms or reference them in copy",
      });
    }
  }

  const issues = findings.length;
  const score = Math.max(1, Math.min(10, 10 - issues));
  return { name: "beginner", score, confidence: "high", findings };
}
