import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRecapPageContent, type RecapPageContent } from "@recap-studio/content-pipeline";
import { checkLearning } from "./checks/learning.js";
import { runValidation } from "./run.js";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..", "..", "..");
const learnFixture = resolve(repoRoot, "fixtures", "topics", "learning-mode-demo.json");
const plainFixture = resolve(repoRoot, "fixtures", "topics", "latest-ai-models.json");

function load(path: string): RecapPageContent {
  return parseRecapPageContent(JSON.parse(readFileSync(path, "utf8")));
}

/** A deep-enough clone to mutate `learn` without touching the cached fixture. */
function withLearn(
  base: RecapPageContent,
  mutate: (learn: NonNullable<RecapPageContent["learn"]>) => void,
): RecapPageContent {
  const clone = JSON.parse(JSON.stringify(base)) as RecapPageContent;
  mutate(clone.learn!);
  return clone;
}

describe("checkLearning — the passing shape", () => {
  it("gives the learning fixture a clean 10 with no findings", () => {
    const result = checkLearning(load(learnFixture));
    assert.equal(result.name, "learning");
    assert.deepEqual(result.findings, []);
    assert.equal(result.score, 10);
  });
});

describe("checkLearning — one failure at a time", () => {
  const base = load(learnFixture);

  it("flags fewer than three checks", () => {
    const result = checkLearning(withLearn(base, (l) => { l.checks = l.checks!.slice(0, 2); }));
    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0]!.path, "learn.checks");
    assert.match(result.findings[0]!.message, /2 checks \(minimum 3\)/);
    assert.equal(result.score, 9);
  });

  it("flags fewer than two prequestions", () => {
    const result = checkLearning(withLearn(base, (l) => { l.prequestions = l.prequestions!.slice(0, 1); }));
    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0]!.path, "learn.prequestions");
    assert.match(result.findings[0]!.message, /1 prequestion \(minimum 2\)/);
  });

  it("flags a check with no feedback text", () => {
    // " " survives the schema's min(1); the reader still gets nothing.
    const result = checkLearning(withLearn(base, (l) => { l.checks![0]!.why = "   "; }));
    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0]!.severity, "high");
    assert.equal(result.findings[0]!.path, "learn.checks.ck-delay.why");
  });

  it("flags a trivial item whose right option sits in its own prompt", () => {
    const result = checkLearning(
      withLearn(base, (l) => {
        const c = l.checks![0]!;
        // Case differs on purpose: the match is case-insensitive.
        c.prompt = `Which is it? ${c.options[c.answer]!.toUpperCase()}`;
      }),
    );
    assert.equal(result.findings.length, 1);
    assert.match(result.findings[0]!.message, /trivial/);
    assert.equal(result.findings[0]!.path, "learn.checks.ck-delay");
  });

  it("blocks an answer index that is outside the options", () => {
    const result = checkLearning(withLearn(base, (l) => { l.checks![0]!.answer = 7; }));
    assert.equal(result.findings.length, 1);
    assert.equal(result.findings[0]!.severity, "blocker");
    assert.match(result.findings[0]!.message, /outside options \(0\.\.2\)/);
  });

  it("subtracts one point per issue and never drops below 1", () => {
    const wrecked = withLearn(base, (l) => {
      l.prequestions = [];
      l.checks = l.checks!.slice(0, 1);
      l.checks[0]!.why = " ";
      l.checks[0]!.prompt = `Pick: ${l.checks[0]!.options[l.checks[0]!.answer]}`;
    });
    const result = checkLearning(wrecked);
    assert.equal(result.findings.length, 4);
    assert.equal(result.score, 6);
  });
});

describe("runValidation — the dimension is opt-in", () => {
  it("scores the learning dimension when learn.enabled is true", () => {
    const report = runValidation(load(learnFixture), {});
    const learning = report.dimensions.find((d) => d.name === "learning");
    assert.ok(learning, "learning dimension is present");
    assert.equal(learning.status, "pass");
    assert.equal(learning.target, 9);
    assert.equal(report.blockers.length, 0);
  });

  it("leaves the dimension out entirely on a page without learning mode", () => {
    const report = runValidation(load(plainFixture), {});
    assert.equal(report.dimensions.find((d) => d.name === "learning"), undefined);
    assert.equal(report.dimensions.length, 7, "the seven original dimensions, unchanged");
  });

  it("leaves it out when the block is present but disabled", () => {
    const off = withLearn(load(learnFixture), (l) => { l.enabled = false; });
    const report = runValidation(off, {});
    assert.equal(report.dimensions.find((d) => d.name === "learning"), undefined);
  });

  it("does not move the overall score of a page that has no learning mode", () => {
    const content = load(plainFixture);
    const overallNow = runValidation(content, {}).overall;
    const sevenDimMean =
      Math.round(
        (runValidation(content, {}).dimensions.reduce((s, d) => s + d.score, 0) / 7) * 10,
      ) / 10;
    assert.equal(overallNow, sevenDimMean);
  });
});
