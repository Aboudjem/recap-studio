#!/usr/bin/env node
/**
 * `recap`: the cross-editor CLI for Recap Studio.
 *
 * Turns a RecapPageContent JSON into a self-contained dark-mode HTML page, or
 * scores it with the deterministic validator. Works in any terminal or editor,
 * with no Claude Code required. The editor's own AI produces the content JSON; this
 * CLI renders and checks it.
 *
 * Usage:
 *   recap render <content.json> [-o out.html] [--theme dark|light|auto]
 *   recap validate <content.json>
 *   recap --help | --version
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { renderFromJson, serializeFromJson } from "@recap-studio/html-renderer";
import { parseRecapPageContent } from "@recap-studio/content-pipeline";
import { runValidation, reportMarkdown, reportJson, reportPasses } from "@recap-studio/validation";

const VERSION = "0.3.0";

const HELP = `recap ${VERSION}: self-contained dark-mode explainer pages.

USAGE
  recap render <content.json> [options]   Render to HTML, Markdown or plain text
  recap validate <content.json> [options] Score content with the deterministic checks
  recap --help                            Show this help
  recap --version                         Print version

RENDER OPTIONS
  -o, --out <file>      Output path (default: <content-basename>.<ext>)
  --format <f>          html | md | txt   (default: html)
  --theme <t>           dark | light | auto   (default: dark, html only)
  --print               Render for paper: white ground, black text, page breaks
                        kept sane, source URLs printed. Every page prints
                        cleanly anyway; this makes the screen match the paper.
                        html only.

VALIDATE OPTIONS
  --json                Write the report as one JSON document on stdout. The
                        honesty note goes to stderr so a pipe to jq still parses.
  --fail-under <score>  Exit 1 when the overall score is below <score> (0 to 10).
                        This REPLACES the per-dimension threshold rule, which is
                        strict: it needs every dimension at "pass", so a "warn"
                        one point under target fails. A blocker still fails the
                        run whatever the score.

NOTES
  - The output HTML inlines all CSS, has zero JavaScript, and opens with a
    double-click. No server, works offline.
  - md and txt are the same page as plain files: no dependency, no styling,
    nothing to open them with but a text editor.
  - Content must match the RecapPageContent schema. Most editors' AIs can
    produce it; see the Recap Studio prompt pack.
`;

function fail(msg: string, code = 1): never {
  process.stderr.write(`recap: ${msg}\n`);
  process.exit(code);
}

function readJson(path: string): unknown {
  let raw: string;
  try {
    raw = readFileSync(resolve(path), "utf8");
  } catch {
    return fail(`cannot read ${path}`, 2);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fail(`${path} is not valid JSON: ${(e as Error).message}`, 2);
  }
}

/** Long flags that take the next argument as their value. */
const VALUE_FLAGS: Record<string, string> = {
  "-o": "out",
  "--out": "out",
  "--theme": "theme",
  "--format": "format",
  "--fail-under": "failUnder",
};

function parseFlags(args: string[]): { positional: string[]; flags: Record<string, string | true> } {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    // --key=value is the form CI configs and Makefiles reach for first.
    const eq = a.startsWith("--") ? a.indexOf("=") : -1;
    if (eq > 2) {
      const key = VALUE_FLAGS[a.slice(0, eq)];
      if (key) flags[key] = a.slice(eq + 1);
      else flags[a.slice(2, eq)] = a.slice(eq + 1);
      continue;
    }
    const valueKey = VALUE_FLAGS[a];
    if (valueKey) flags[valueKey] = args[++i] ?? "";
    else if (a.startsWith("--")) flags[a.slice(2)] = true;
    else positional.push(a);
  }
  return { positional, flags };
}

/**
 * Read --fail-under. Anything that is not a finite number in [0, 10] exits 2
 * rather than being coerced: Number("") is 0, which would silently turn the
 * gate into "always pass".
 */
function parseFailUnder(raw: string | true | undefined): number | null {
  if (raw === undefined) return null;
  if (raw === true || String(raw).trim() === "") {
    return fail("--fail-under needs a score between 0 and 10.", 2);
  }
  const n = Number(String(raw).trim());
  if (!Number.isFinite(n) || n < 0 || n > 10) {
    return fail(`--fail-under must be a number between 0 and 10 (got "${String(raw)}")`, 2);
  }
  return n;
}

const EXT: Record<string, string> = { html: ".html", md: ".md", txt: ".txt" };

function cmdRender(args: string[]): void {
  const { positional, flags } = parseFlags(args);
  const input = positional[0];
  if (!input) fail("render needs a content JSON path. See `recap --help`.", 2);

  const format = typeof flags.format === "string" && flags.format ? flags.format : "html";
  if (!EXT[format]) fail(`--format must be html|md|txt (got "${format}")`, 2);

  const theme = typeof flags.theme === "string" && flags.theme ? flags.theme : "dark";
  if (!["dark", "light", "auto"].includes(theme)) fail(`--theme must be dark|light|auto (got "${theme}")`, 2);
  const print = flags.print === true;
  // Refuse rather than ignore: silently dropping a flag the user typed is how
  // people end up believing a --print PDF came out of a .txt file.
  if (format !== "html") {
    if (flags.theme !== undefined) fail(`--theme applies to --format html only (got --format ${format})`, 2);
    if (print) fail(`--print applies to --format html only (got --format ${format})`, 2);
  }

  let body: string;
  try {
    const json = readJson(input!);
    body =
      format === "html"
        ? renderFromJson(json, { theme: theme as "dark" | "light" | "auto", print })
        : serializeFromJson(json, format as "md" | "txt");
  } catch (e) {
    return fail(`content failed schema validation:\n${(e as Error).message}`, 2);
  }

  const out =
    typeof flags.out === "string" && flags.out
      ? resolve(flags.out)
      : resolve(basename(input!).replace(/\.json$/i, "") + EXT[format]);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, body, "utf8");
  const kb = (Buffer.byteLength(body, "utf8") / 1024).toFixed(1);
  // "self-contained" is a claim about the HTML, so only the HTML makes it.
  const note = format === "html" ? ", self-contained, double-click to open" : "";
  process.stdout.write(`recap: wrote ${out} (${kb} KB${note})\n`);
}

const HONESTY_NOTE =
  "\nNote: these are deterministic heuristic checks (structure, citations, word counts, secret/fluff scans). They do NOT fetch sources or run an LLM. Run /recap in Claude Code for the full agent review.\n";

function cmdValidate(args: string[]): void {
  const { positional, flags } = parseFlags(args);
  const input = positional[0];
  if (!input) fail("validate needs a content JSON path. See `recap --help`.", 2);
  const asJson = flags.json === true;
  const failUnder = parseFailUnder(flags.failUnder);
  let content;
  try {
    content = parseRecapPageContent(readJson(input!));
  } catch (e) {
    return fail(`content failed schema validation:\n${(e as Error).message}`, 2);
  }
  const report = runValidation(content);
  const passed = reportPasses(report, failUnder);

  if (asJson) {
    // Exactly one JSON document on stdout. The note goes to stderr so `| jq` works.
    process.stdout.write(JSON.stringify(reportJson(report, { version: VERSION, failUnder }), null, 2) + "\n");
    process.stderr.write(HONESTY_NOTE);
  } else {
    process.stdout.write(reportMarkdown(report) + "\n");
    if (failUnder !== null) {
      // The Markdown table reports the threshold rule. Say which rule actually
      // decided the exit code, or a PASSED table next to exit 1 looks like a bug.
      process.stdout.write(
        `Gate: --fail-under ${failUnder}, overall ${report.overall}/10, blockers ${report.blockers.length}. Result: ${passed ? "PASS" : "FAIL"}\n`,
      );
    }
    process.stdout.write(HONESTY_NOTE);
  }
  process.exit(passed ? 0 : 1);
}

function main(argv: string[]): void {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    process.stdout.write(HELP);
    return;
  }
  if (cmd === "--version" || cmd === "-v") {
    process.stdout.write(VERSION + "\n");
    return;
  }
  if (cmd === "render") return cmdRender(rest);
  if (cmd === "validate") return cmdValidate(rest);
  fail(`unknown command "${cmd}". See \`recap --help\`.`, 2);
}

main(process.argv.slice(2));
