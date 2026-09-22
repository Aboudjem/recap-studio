import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRecapPageContent } from "./schema.js";
import { resolveConfig, renderConfigSource } from "./config.js";
import { slugify } from "./slugify.js";

// Resolve fixture relative to this test file so the test is CWD-independent
// (pnpm runs scripts in the package directory, not the repo root).
const __filename = fileURLToPath(import.meta.url);
const repoRoot = resolve(dirname(__filename), "..", "..", "..");
const fixturePath = resolve(repoRoot, "fixtures", "topics", "latest-ai-models.json");
const learnFixturePath = resolve(repoRoot, "fixtures", "topics", "learning-mode-demo.json");

describe("RecapPageContent schema", () => {
  it("accepts the latest-ai-models fixture", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    const parsed = parseRecapPageContent(raw);
    assert.equal(parsed.slug, "latest-ai-models");
    assert.ok(parsed.sourceMap.length >= 1);
  });

  it("rejects a missing oneSentenceAnswer", () => {
    const raw = JSON.parse(readFileSync(fixturePath, "utf8"));
    delete raw.oneSentenceAnswer;
    assert.throws(() => parseRecapPageContent(raw), /Invalid RecapPageContent/);
  });
});

describe("learn block", () => {
  it("is optional: the demo fixture parses without one", () => {
    const parsed = parseRecapPageContent(JSON.parse(readFileSync(fixturePath, "utf8")));
    assert.equal(parsed.learn, undefined);
  });

  it("parses the learning-mode fixture with every sub-block typed", () => {
    const parsed = parseRecapPageContent(JSON.parse(readFileSync(learnFixturePath, "utf8")));
    const learn = parsed.learn;
    assert.ok(learn, "learn block is present");
    assert.equal(learn.enabled, true);
    assert.ok((learn.prequestions ?? []).length >= 2);
    assert.ok((learn.checks ?? []).length >= 3);
    assert.equal(typeof learn.checks?.[0]?.why, "string");
    assert.ok(Array.isArray(learn.cloze?.[0]?.blanks));
    assert.equal(typeof learn.revision?.d1, "string");
  });

  it("points every answer index at a real option", () => {
    const parsed = parseRecapPageContent(JSON.parse(readFileSync(learnFixturePath, "utf8")));
    for (const c of parsed.learn?.checks ?? []) {
      assert.ok(c.options[c.answer] !== undefined, `${c.id} answer index is in range`);
    }
  });

  it("requires enabled, and requires feedback on every check", () => {
    const raw = JSON.parse(readFileSync(learnFixturePath, "utf8"));
    const noEnabled = structuredClone(raw);
    delete noEnabled.learn.enabled;
    assert.throws(() => parseRecapPageContent(noEnabled), /Invalid RecapPageContent/);

    const noWhy = structuredClone(raw);
    delete noWhy.learn.checks[0].why;
    assert.throws(() => parseRecapPageContent(noWhy), /Invalid RecapPageContent/);
  });

  it("rejects a check with a single option or a negative answer", () => {
    const raw = JSON.parse(readFileSync(learnFixturePath, "utf8"));
    const oneOption = structuredClone(raw);
    oneOption.learn.checks[0].options = ["only one"];
    assert.throws(() => parseRecapPageContent(oneOption), /Invalid RecapPageContent/);

    const negative = structuredClone(raw);
    negative.learn.checks[0].answer = -1;
    assert.throws(() => parseRecapPageContent(negative), /Invalid RecapPageContent/);
  });
});

describe("config", () => {
  it("forces side-effects off under fixture-only mode", () => {
    const cfg = resolveConfig({}, { RECAP_STUDIO_FIXTURE_ONLY: "1" });
    assert.equal(cfg.deploymentMode, "disabled");
    assert.equal(cfg.emailMode, "disabled");
    assert.equal(cfg.researchIntensity, "fast");
  });

  it("renders a config source file with a runnable export", () => {
    const src = renderConfigSource(resolveConfig({}));
    assert.match(src, /export const config:/);
    assert.match(src, /export default config;/);
  });
});

describe("slugify", () => {
  it("normalizes punctuation and case", () => {
    assert.equal(slugify("Latest AI Models!"), "latest-ai-models");
    assert.equal(slugify("Why Quantum?"), "why-quantum");
  });
});
