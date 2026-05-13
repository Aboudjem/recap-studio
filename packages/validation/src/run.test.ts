import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRecapPageContent } from "@recap-studio/content-pipeline";
import { runValidation, reportMarkdown } from "./run.js";

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
