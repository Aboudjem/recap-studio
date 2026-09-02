import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const entry = resolve(here, "index.ts");
const fixture = resolve(repoRoot, "fixtures/topics/latest-ai-models.json");
const outFile = resolve(here, "../.cli-test-out.html");

/**
 * Run the CLI and keep stdout and stderr apart. They used to be concatenated on
 * a non-zero exit, which is fine for message matching but makes it impossible
 * to JSON.parse stdout from a run that exits 1, and `validate --json
 * --fail-under` is exactly that run. `output` preserves the old combined view
 * for the assertions that want it.
 */
function run(args: string[]): { stdout: string; stderr: string; output: string; status: number } {
  // spawnSync, not execFileSync: execFileSync returns stdout only, so a stream
  // assertion on a run that exits 0 would always see an empty stderr.
  const r = spawnSync("node", ["--import", "tsx", entry, ...args], { encoding: "utf8" });
  const stdout = r.stdout ?? "";
  const stderr = r.stderr ?? "";
  return { stdout, stderr, output: stdout + stderr, status: r.status ?? 1 };
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
    const { output, status } = run(["render", bad]);
    assert.equal(status, 2);
    assert.match(output, /schema validation/);
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

test("validate --json writes one parseable document on stdout", () => {
  const { stdout, stderr, status } = run(["validate", fixture, "--json"]);
  assert.equal(status, 0, stdout + stderr);
  const report = JSON.parse(stdout);
  assert.equal(report.tool, "recap");
  assert.match(report.version, /^\d+\.\d+\.\d+$/);
  assert.equal(typeof report.overall, "number");
  assert.equal(report.ok, true);
  assert.equal(report.failUnder, null);
  assert.ok(Array.isArray(report.checks) && report.checks.length > 0, "checks are listed");
  for (const c of report.checks) {
    assert.ok(typeof c.name === "string" && typeof c.score === "number" && typeof c.status === "string");
  }
  assert.ok(Array.isArray(report.blockers));
  // The honesty note must not be on stdout, or `| jq` breaks.
  assert.ok(!stdout.includes("deterministic heuristic checks"), "note is not on stdout");
  assert.match(stderr, /deterministic heuristic checks/, "note is on stderr");
});

test("validate --fail-under gates on the overall score and still parses at exit 1", () => {
  const { stdout, status } = run(["validate", fixture, "--json", "--fail-under", "10"]);
  assert.equal(status, 1, "10 is above the fixture score, so this must fail");
  const report = JSON.parse(stdout);
  assert.equal(report.ok, false);
  assert.equal(report.failUnder, 10);
  assert.ok(report.overall < 10);
});

test("validate --fail-under replaces the per-dimension rule, it does not add to it", () => {
  // The fixture passes both rules, so prove the replacement with a low bar and
  // by reading the two fields the envelope keeps side by side.
  const { stdout, status } = run(["validate", fixture, "--json", "--fail-under=1"]);
  assert.equal(status, 0);
  const report = JSON.parse(stdout);
  assert.equal(report.failUnder, 1, "--fail-under=1 form is accepted");
  assert.equal(report.ok, true);
  assert.equal(typeof report.passedThresholds, "boolean", "the threshold verdict is still reported");
});

test("validate --fail-under rejects values that are not a score", () => {
  for (const bad of ["abc", "", "11", "-1", "NaN"]) {
    const { status, output } = run(["validate", fixture, "--fail-under", bad]);
    assert.equal(status, 2, `--fail-under "${bad}" must exit 2, got ${status}`);
    assert.match(output, /--fail-under/);
  }
  // 0 is a legitimate score and must not be swept up with the empty string.
  assert.equal(run(["validate", fixture, "--fail-under", "0"]).status, 0);
});

test("validate without --json names the rule that decided the exit code", () => {
  const { stdout } = run(["validate", fixture, "--fail-under", "10"]);
  assert.match(stdout, /Validation report/, "the Markdown table is unchanged");
  assert.match(stdout, /Gate: --fail-under 10/, "and the active gate is stated");
  assert.match(stdout, /Result: FAIL/);
});

test("recap render --format md and txt write plain files", () => {
  for (const [format, ext, first] of [
    ["md", ".md", "# "],
    ["txt", ".txt", undefined],
  ] as Array<[string, string, string | undefined]>) {
    const out = resolve(here, `../.cli-format-out${ext}`);
    try {
      const { stdout, status } = run(["render", fixture, "--format", format, "-o", out]);
      assert.equal(status, 0, stdout);
      const body = readFileSync(out, "utf8");
      assert.ok(body.length > 0, `${format} output is not empty`);
      if (first) assert.ok(body.startsWith(first), `${format} starts with "${first}"`);
      assert.ok(!body.startsWith("<!doctype"), `${format} is not html`);
      // "self-contained" is a claim about the HTML and must not follow md or txt.
      assert.ok(!stdout.includes("self-contained"), `${format} does not claim self-contained`);
    } finally {
      if (existsSync(out)) rmSync(out);
    }
  }
});

test("recap render picks the extension from the format when -o is absent", () => {
  const { stdout, status } = run(["render", fixture, "--format", "md", "-o", resolve(here, "../.cli-ext.md")]);
  assert.equal(status, 0, stdout);
  assert.match(stdout, /\.md \(/, "reports the .md path it wrote");
  rmSync(resolve(here, "../.cli-ext.md"), { force: true });
});

test("recap render rejects an unknown format and html-only flags on md or txt", () => {
  assert.equal(run(["render", fixture, "--format", "pdf"]).status, 2, "unknown format");
  assert.match(run(["render", fixture, "--format", "pdf"]).output, /--format must be html\|md\|txt/);
  // Silently ignoring a flag the user typed is how someone ends up believing a
  // --print PDF came out of a .txt file.
  assert.equal(run(["render", fixture, "--format", "md", "--print"]).status, 2, "--print on md");
  assert.equal(run(["render", fixture, "--format", "txt", "--theme", "light"]).status, 2, "--theme on txt");
  assert.equal(run(["render", fixture, "--format", "html", "--theme", "light", "-o", "/dev/null"]).status, 0);
});
