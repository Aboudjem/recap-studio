import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadConfig } from "./load-config.js";
import { DEFAULT_CONFIG } from "./config.js";

function makeTmp(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

test("loadConfig falls back to defaults when no file is present", async () => {
  const cwd = makeTmp("rs-cfg-default-");
  const globalDir = makeTmp("rs-cfg-globalmiss-");
  const res = await loadConfig({ cwd, globalDir, env: {} });
  assert.equal(res.source, "defaults");
  assert.deepEqual(res.config, DEFAULT_CONFIG);
});

test("loadConfig prefers a project-local JSON file over global", async () => {
  const cwd = makeTmp("rs-cfg-project-");
  const globalDir = makeTmp("rs-cfg-global-");

  writeFileSync(
    join(cwd, "recap-studio.config.json"),
    JSON.stringify({ contentLength: "long", theme: "dark" }),
  );
  writeFileSync(
    join(globalDir, "recap-studio.config.json"),
    JSON.stringify({ contentLength: "short", theme: "light" }),
  );

  const res = await loadConfig({ cwd, globalDir, env: {} });
  assert.equal(res.source, "project");
  assert.equal(res.config.contentLength, "long");
  assert.equal(res.config.theme, "dark");
});

test("loadConfig falls back to the global file when no project file exists", async () => {
  const cwd = makeTmp("rs-cfg-noprojext-");
  const globalDir = makeTmp("rs-cfg-globalonly-");

  writeFileSync(
    join(globalDir, "recap-studio.config.json"),
    JSON.stringify({ explanationDepth: "expert", costMode: "premium" }),
  );

  const res = await loadConfig({ cwd, globalDir, env: {} });
  assert.equal(res.source, "global");
  assert.equal(res.config.explanationDepth, "expert");
  assert.equal(res.config.costMode, "premium");
});

test("loadConfig honors RECAP_STUDIO_FIXTURE_ONLY by forcing side-effects off", async () => {
  const cwd = makeTmp("rs-cfg-fixture-");
  const globalDir = makeTmp("rs-cfg-fixture-global-");

  writeFileSync(
    join(globalDir, "recap-studio.config.json"),
    JSON.stringify({
      deploymentMode: "production-with-confirmation",
      emailMode: "send-with-confirmation",
      costMode: "premium",
      researchIntensity: "deep",
    }),
  );

  const res = await loadConfig({
    cwd,
    globalDir,
    env: { RECAP_STUDIO_FIXTURE_ONLY: "1" },
  });
  assert.equal(res.config.deploymentMode, "disabled");
  assert.equal(res.config.emailMode, "disabled");
  assert.equal(res.config.costMode, "economy");
  assert.equal(res.config.researchIntensity, "fast");
});

test("loadConfig loads an ESM (.mjs) global config with default export", async () => {
  const cwd = makeTmp("rs-cfg-esm-cwd-");
  const globalDir = makeTmp("rs-cfg-esm-global-");
  mkdirSync(globalDir, { recursive: true });
  writeFileSync(
    join(globalDir, "recap-studio.config.mjs"),
    'export default { theme: "dark", visualDensity: "high" };\n',
  );

  const res = await loadConfig({ cwd, globalDir, env: {} });
  assert.equal(res.source, "global");
  assert.equal(res.config.theme, "dark");
  assert.equal(res.config.visualDensity, "high");
});

test("overrides win over both project and global", async () => {
  const cwd = makeTmp("rs-cfg-override-");
  const globalDir = makeTmp("rs-cfg-override-global-");
  writeFileSync(
    join(globalDir, "recap-studio.config.json"),
    JSON.stringify({ theme: "light" }),
  );

  const res = await loadConfig({
    cwd,
    globalDir,
    env: {},
    overrides: { theme: "dark" },
  });
  assert.equal(res.config.theme, "dark");
});
