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
