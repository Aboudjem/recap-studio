import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRecapPageContent } from "@recap-studio/content-pipeline";
import { runValidation, reportMarkdown, reportJson, reportPasses } from "./run.js";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..", "..", "..");
const fixturePath = resolve(repoRoot, "fixtures", "topics", "latest-ai-models.json");

describe("runValidation", () => {
  it("scores the fixture above 7/10 overall and surfaces no blockers", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    const content = parseRecapPageContent(raw);
    const report = runValidation(content, {});
    assert.ok(report.overall >= 7, `overall=${report.overall}`);
    assert.equal(report.blockers.length, 0, `blockers=${JSON.stringify(report.blockers)}`);
  });

  it("renders a markdown report", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    const content = parseRecapPageContent(raw);
    const md = reportMarkdown(runValidation(content));
    assert.match(md, /Validation report/);
    assert.match(md, /facts\s*\|/);
  });
});

describe("reportJson", () => {
  it("is pure over (report, opts) and keeps a stable key order", () => {
    const content = parseRecapPageContent(JSON.parse(readFileSync(fixturePath, "utf8")));
    const report = runValidation(content, {});
    const before = JSON.stringify(report);

    const a = reportJson(report, { version: "9.9.9" });
    const b = reportJson(report, { version: "9.9.9" });
    assert.deepEqual(a, b, "same inputs, same object");
    assert.equal(JSON.stringify(report), before, "the input report is not mutated");
    assert.deepEqual(Object.keys(a), [
      "tool",
      "version",
      "slug",
      "topic",
      "generatedAt",
      "overall",
      "passedThresholds",
      "failUnder",
      "ok",
      "checks",
      "blockers",
    ]);
    assert.deepEqual(Object.keys(a.checks[0]!), ["name", "score", "target", "status", "confidence", "findings"]);
    assert.equal(a.checks.length, report.dimensions.length, "one check per dimension, whatever the count");
    assert.equal(a.version, "9.9.9", "the version comes from opts, not from the report");
  });

  it("lets --fail-under replace the threshold rule but never the blocker rule", () => {
    const content = parseRecapPageContent(JSON.parse(readFileSync(fixturePath, "utf8")));
    const report = runValidation(content, {});

    assert.equal(reportPasses(report, null), report.passedThresholds, "no gate means the threshold rule");
    assert.equal(reportPasses(report, 0), true, "a bar of 0 passes on score alone");
    assert.equal(reportPasses(report, 10.1 > 10 ? 10 : 10), report.overall >= 10, "a bar of 10 gates on score");

    // A blocker must fail the run no matter how high the average is.
    const withBlocker = { ...report, overall: 10, blockers: ["[content] possible AWS access key id found"] };
    assert.equal(reportPasses(withBlocker, 0), false, "a blocker is never averaged away");
    assert.equal(reportJson(withBlocker, { version: "0.0.0", failUnder: 0 }).ok, false);
  });
});

describe("deterministic scoring", () => {
  it("scores identical content identically on repeated runs", () => {
    // The secret patterns are module-level regexes reused with .test(). With a
    // /g flag they carried lastIndex between calls, so the same page alternated
    // between blocker and clean. This pins that shut.
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    // Built at runtime, never written as one literal: a whole-string constant here
    // trips this repo's own CI secrets scan and gitleaks, which is the point of the
    // scanner. The value the check sees is identical either way.
    const plantedKeyId = "AKIA" + "1234567890ABCDEF";
    raw.keyIdeas[0].body += ` Illustrative only: ${plantedKeyId} looks like an access key id.`;
    const content = parseRecapPageContent(raw);

    const runs = Array.from({ length: 6 }, () => {
      const r = runValidation(content, {});
      const sec = r.dimensions.find((d) => d.name === "security-privacy")!;
      return { score: sec.score, blockers: r.blockers.length, overall: r.overall };
    });
    for (const r of runs) {
      assert.deepEqual(r, runs[0], `run drifted: ${JSON.stringify(runs)}`);
    }
    assert.ok(runs[0]!.blockers > 0, "the planted key is detected at all");
  });
});
