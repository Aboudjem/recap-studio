import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const entry = resolve(here, "index.ts");
const fixture = resolve(repoRoot, "fixtures/topics/latest-ai-models.json");
const outFile = resolve(here, "../.cli-test-out.html");

function run(args: string[]): { stdout: string; status: number } {
  try {
    const stdout = execFileSync("node", ["--import", "tsx", entry, ...args], { encoding: "utf8" });
    return { stdout, status: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { stdout: (err.stdout ?? "") + (err.stderr ?? ""), status: err.status ?? 1 };
  }
}

test("recap --version prints a version", () => {
  const { stdout, status } = run(["--version"]);
  assert.equal(status, 0);
  assert.match(stdout, /\d+\.\d+\.\d+/);
});

test("recap --help shows usage", () => {
  const { stdout } = run(["--help"]);
  assert.match(stdout, /USAGE/);
  assert.match(stdout, /recap render/);
});

test("recap render produces a self-contained HTML file", () => {
  try {
    const { stdout, status } = run(["render", fixture, "-o", outFile]);
    assert.equal(status, 0, stdout);
    assert.ok(existsSync(outFile), "wrote the output file");
    const html = readFileSync(outFile, "utf8");
    assert.match(html, /^<!doctype html>/i);
    assert.ok(!html.includes("/_next/"), "no absolute Next paths");
    assert.ok(!/<script/i.test(html), "no script tags");
  } finally {
    if (existsSync(outFile)) rmSync(outFile);
  }
});

test("recap validate scores the fixture and exits 0 on pass", () => {
  const { stdout, status } = run(["validate", fixture]);
  assert.match(stdout, /Validation report/);
  assert.match(stdout, /deterministic heuristic checks/);
  assert.equal(status, 0);
});

test("recap render on bad input exits 2 with a helpful message", () => {
  const bad = resolve(here, "../.cli-bad.json");
  execFileSync("node", ["-e", `require('fs').writeFileSync(${JSON.stringify(bad)}, '{}')`]);
  try {
    const { stdout, status } = run(["render", bad]);
    assert.equal(status, 2);
    assert.match(stdout, /schema validation/);
  } finally {
    if (existsSync(bad)) rmSync(bad);
  }
});

test("recap with unknown command exits 2", () => {
  const { status } = run(["frobnicate"]);
  assert.equal(status, 2);
});

test("recap render --print produces a light, print-first page", () => {
  const printOut = resolve(here, "../.cli-print-out.html");
  try {
    const { stdout, status } = run(["render", fixture, "--print", "-o", printOut]);
    assert.equal(status, 0, stdout);
    const html = readFileSync(printOut, "utf8");
    // Proves cmdRender actually forwards the flag; a renderer-only test cannot.
    assert.match(html, /data-theme="light"/, "print mode paints the document light");
    assert.ok(!html.includes("@media print {"), "print rules apply unconditionally");
    assert.ok(html.includes("@page { margin: 18mm 14mm; }"), "the print rules are there");
    assert.ok(html.includes('<details class="recap-gitem" open>'), "glossary is open on paper");
    // The zero-JS guarantee has to hold on the new path too.
    assert.ok(!/<script/i.test(html), "no script tags");
    assert.ok(!html.includes("/_next/"), "no absolute Next paths");
  } finally {
    if (existsSync(printOut)) rmSync(printOut);
  }
});
