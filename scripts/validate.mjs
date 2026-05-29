#!/usr/bin/env node
/**
 * Recap Studio validation runner.
 *
 * Usage:
 *   node scripts/validate.mjs                                 # validates the active content
 *   node scripts/validate.mjs apps/recap-web/src/content/X.json
 *
 * Writes artifacts/<slug>/validation.json and prints a Markdown report.
 *
 * Designed to run BEFORE the workspace is installed by using a standalone
 * embedded copy of the deterministic checks. Once `pnpm install` succeeds,
 * the same checks live in @recap-studio/validation and the agents call them.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..");

function defaultContentPath() {
  const active = resolve(
    repoRoot,
    "apps",
    "recap-web",
    "src",
    "lib",
    "active-content.json",
  );
  let slug = "latest-ai-models";
  if (existsSync(active)) {
    try {
      slug = JSON.parse(readFileSync(active, "utf8")).slug ?? slug;
    } catch {
      /* keep default */
    }
  }
  const live = resolve(repoRoot, "apps", "recap-web", "src", "content", `${slug}.json`);
  if (existsSync(live)) return live;
  // Active slug has no content file. The renderer silently falls back to
  // the fixture, which masks the drift. Warn loudly so the user knows.
  // See docs/known-issues.md#active-slug-silent-fallback.
  const fixture = resolve(repoRoot, "fixtures", "topics", `${slug}.json`);
  console.warn(
    `recap-studio: active slug "${slug}" has no content file at ` +
      `apps/recap-web/src/content/${slug}.json — falling back to ` +
      `${existsSync(fixture) ? "fixture " + fixture : "(no fixture either)"}.`,
  );
  return fixture;
}

const argPath = process.argv[2];
const inputPath = argPath ? resolve(argPath) : defaultContentPath();

if (!existsSync(inputPath)) {
  console.error(`recap-studio: content not found at ${inputPath}`);
  process.exit(2);
}

let content;
try {
  content = JSON.parse(readFileSync(inputPath, "utf8"));
} catch (e) {
  console.error(`recap-studio: ${inputPath} is not valid JSON — ${e.message}`);
  process.exit(2);
}

// Guard required fields before running checks, so bad/partial input fails with a
// helpful message instead of an unhandled TypeError ("Cannot read ... 'map'").
const REQUIRED = ["slug", "topic", "sourceMap", "keyIdeas", "examples", "misconceptions", "visualSections", "diagrams", "glossary", "practicalTakeaways"];
const missing = REQUIRED.filter((k) =>
  k === "sourceMap" || k === "keyIdeas" || k === "examples" || k === "misconceptions" || k === "visualSections" || k === "diagrams" || k === "glossary" || k === "practicalTakeaways"
    ? !Array.isArray(content?.[k])
    : !content?.[k],
);
if (!content || typeof content !== "object" || missing.length) {
  console.error(
    `recap-studio: ${inputPath} is not a valid RecapPageContent — missing/invalid: ${missing.join(", ") || "(not an object)"}.\n` +
      `Generate one with /recap "<topic>" (or pnpm demo:latest-ai-models), then validate.`,
  );
  process.exit(2);
}

// --- Embedded deterministic checks (subset of @recap-studio/validation). ----
// Keeps `pnpm validate:demo` runnable before `pnpm install`.

const TARGETS = {
  facts: 9,
  beginner: 9,
  "accessibility": 9,
  ux: 8,
  performance: 8,
  "security-privacy": 9,
  simplicity: 9,
};
const SECRET_PATTERNS = [
  [/sk-[A-Za-z0-9]{20,}/g, "OpenAI-like key"],
  [/sk-ant-[A-Za-z0-9-_]{20,}/g, "Anthropic key"],
  [/AKIA[0-9A-Z]{16}/g, "AWS access key"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, "PEM private key"],
  [/ghp_[A-Za-z0-9]{20,}/g, "GitHub PAT"],
  [/xox[bpars]-[A-Za-z0-9-]{10,}/g, "Slack token"],
];
const INJECTION = [
  /ignore (all|previous) (instructions|prompts)/i,
  /<\s*\/?\s*script\b/i,
  /system\s*:\s*you are/i,
];
const FLUFF = [
  /\brevolution(ary|ize)\b/i,
  /\bbreakthrough\b/i,
  /\bgame[- ]?changer\b/i,
  /\bcutting[- ]?edge\b/i,
  /\bworld[- ]?class\b/i,
  /\bunparalleled\b/i,
  /\bseamless\b/i,
];

function wc(s) {
  return String(s).trim().split(/\s+/).filter(Boolean).length;
}

function checkFacts() {
  const ids = new Set(content.sourceMap.map((s) => s.id));
  const strong = new Set(content.sourceMap.filter((s) => s.composite >= 7).map((s) => s.id));
  const cited = [];
  for (const k of content.keyIdeas) cited.push({ path: `keyIdeas.${k.id}`, ids: k.sourceIds ?? [] });
  for (const e of content.examples) cited.push({ path: `examples.${e.id}`, ids: e.sourceIds ?? [] });
  for (const m of content.misconceptions) cited.push({ path: `misconceptions.${m.id}`, ids: m.sourceIds ?? [] });
  for (const t of content.timeline ?? []) cited.push({ path: `timeline.${t.date}`, ids: t.sourceIds ?? [] });
  for (const c of content.comparisons ?? [])
    for (const r of c.rows) cited.push({ path: `comparisons.${c.id}.${r.name}`, ids: r.sourceIds ?? [] });

  const findings = [];
  let supported = 0;
  for (const item of cited) {
    if (item.ids.length === 0) {
      findings.push({ severity: "high", msg: `no sourceIds on ${item.path}` });
      continue;
    }
    const missing = item.ids.filter((id) => !ids.has(id));
    if (missing.length > 0) {
      findings.push({ severity: "blocker", msg: `broken sourceIds on ${item.path}: ${missing.join(", ")}` });
      continue;
    }
    if (!item.ids.some((id) => strong.has(id))) {
      findings.push({ severity: "medium", msg: `weak support on ${item.path}` });
      continue;
    }
    supported++;
  }
  const blockers = findings.filter((f) => f.severity === "blocker").length;
  const score = Math.max(1, Math.min(10, Math.round((supported / (cited.length || 1)) * 10) - blockers));
  return { name: "facts", score, findings };
}

function checkBeginner() {
  const findings = [];
  if (wc(content.oneSentenceAnswer) > 30)
    findings.push({ severity: "medium", msg: "oneSentenceAnswer > 30 words" });
  for (const k of content.keyIdeas) {
    if (wc(k.body) > 60) findings.push({ severity: "low", msg: `keyIdea ${k.id} > 60 words` });
  }
  const totalWords =
    wc(content.oneSentenceAnswer) +
    content.fiveMinutePath.reduce((s, t) => s + wc(t), 0) +
    content.whyItMatters.reduce((s, t) => s + wc(t), 0) +
    content.keyIdeas.reduce((s, k) => s + wc(k.title) + wc(k.body), 0) +
    content.examples.reduce((s, e) => s + wc(e.title) + wc(e.body), 0) +
    content.analogies.reduce((s, a) => s + wc(a.setup) + wc(a.takeaway), 0) +
    content.misconceptions.reduce((s, m) => s + wc(m.myth) + wc(m.truth), 0) +
    (content.timeline ?? []).reduce((s, t) => s + wc(t.title) + wc(t.body), 0) +
    content.glossary.reduce((s, g) => s + wc(g.term) + wc(g.definition), 0) +
    content.practicalTakeaways.reduce((s, p) => s + wc(p), 0);
  const minutes = totalWords / 220;
  if (minutes > 5.5)
    findings.push({ severity: "medium", msg: `~${minutes.toFixed(1)} min read > 5 min target` });
  const score = Math.max(1, Math.min(10, 10 - findings.length));
  return { name: "beginner", score, findings };
}

function checkA11y() {
  const findings = [];
  if (content.keyIdeas.length > 7) findings.push({ severity: "medium", msg: "> 7 key ideas" });
  if (!content.visualSections.find((s) => s.kind === "matters" && s.enabled))
    findings.push({ severity: "high", msg: "missing 'what matters' section" });
  if (!content.visualSections.find((s) => s.kind === "takeaways" && s.enabled))
    findings.push({ severity: "medium", msg: "missing 'takeaways' end-state" });
  const score = Math.max(1, Math.min(10, 10 - findings.length));
  return { name: "accessibility", score, findings };
}

function checkUx() {
  const findings = [];
  if (content.diagrams.length === 0) findings.push({ severity: "low", msg: "no diagrams" });
  for (const d of content.diagrams) {
    if (!d.alt || d.alt.length < 8) findings.push({ severity: "medium", msg: `diagram ${d.id} weak alt` });
  }
  const score = Math.max(1, Math.min(10, 10 - findings.length));
  return { name: "ux", score, findings };
}

function checkPerf() {
  const findings = [];
  if (content.diagrams.length > 4)
    findings.push({ severity: "low", msg: "> 4 diagrams may bloat bundle" });
  // No build dir means static-only confidence; baseline 8.
  const score = Math.max(1, Math.min(10, 8 - findings.length));
  return { name: "performance", score, findings };
}

function checkSec() {
  const findings = [];
  const hay = JSON.stringify(content);
  for (const [re, name] of SECRET_PATTERNS) {
    if (re.test(hay)) findings.push({ severity: "blocker", msg: `secret leak: ${name}` });
  }
  for (const re of INJECTION) {
    if (re.test(hay)) findings.push({ severity: "high", msg: `injection cue: ${re}` });
  }
  const blockers = findings.filter((f) => f.severity === "blocker").length;
  const high = findings.filter((f) => f.severity === "high").length;
  const score = Math.max(1, Math.min(10, 10 - blockers * 5 - high * 2 - (findings.length - blockers - high)));
  return { name: "security-privacy", score, findings };
}

function checkSimp() {
  const findings = [];
  const hay = JSON.stringify(content);
  for (const re of FLUFF) {
    if (re.test(hay)) findings.push({ severity: "low", msg: `marketing fluff: ${re}` });
  }
  const score = Math.max(1, Math.min(10, 10 - findings.length));
  return { name: "simplicity", score, findings };
}

const dims = [checkFacts(), checkBeginner(), checkA11y(), checkUx(), checkPerf(), checkSec(), checkSimp()].map(
  (d) => ({
    ...d,
    target: TARGETS[d.name],
    status:
      d.findings.some((f) => f.severity === "blocker")
        ? "blocker"
        : d.score >= TARGETS[d.name]
          ? "pass"
          : d.score >= TARGETS[d.name] - 1
            ? "warn"
            : "fail",
  }),
);

const blockers = dims
  .flatMap((d) => d.findings.filter((f) => f.severity === "blocker"))
  .map((f) => f.msg);
const overall = Math.round((dims.reduce((s, d) => s + d.score, 0) / dims.length) * 10) / 10;
const passedThresholds = dims.every((d) => d.status === "pass");

const report = {
  slug: content.slug,
  topic: content.topic,
  generatedAt: new Date().toISOString(),
  dimensions: dims,
  blockers,
  overall,
  passedThresholds,
};

const outDir = resolve(repoRoot, "artifacts", content.slug);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "validation.json"), JSON.stringify(report, null, 2) + "\n", "utf8");

const rows = dims
  .map(
    (d) =>
      `| ${d.name.padEnd(18)} | ${String(d.score).padStart(2)}/10 | ${String(d.target).padStart(2)} | ${d.status.toUpperCase().padEnd(7)} | ${d.findings[0]?.msg ?? "—"} |`,
  )
  .join("\n");

const md = [
  `## Validation report — ${content.slug}`,
  "",
  "| Dimension          | Score  | Target | Status   | Top finding |",
  "| ------------------ | ------ | ------ | -------- | ----------- |",
  rows,
  "",
  `Overall: **${overall}/10** — thresholds ${passedThresholds ? "PASSED ✅" : "NOT PASSED ⚠️"}`,
  "",
  "**Blockers**",
  blockers.length === 0 ? "_none_" : blockers.map((b) => `- ${b}`).join("\n"),
  "",
  `Report saved to artifacts/${content.slug}/validation.json`,
].join("\n");

writeFileSync(join(outDir, "validation.md"), md + "\n", "utf8");
console.log(md);

process.exit(passedThresholds ? 0 : 1);
