#!/usr/bin/env node
/**
 * `recap` — the cross-editor CLI for Recap Studio.
 *
 * Turns a RecapPageContent JSON into a self-contained dark-mode HTML page, or
 * scores it with the deterministic validator. Works in any terminal/editor —
 * no Claude Code required. The editor's own AI produces the content JSON; this
 * CLI renders and checks it.
 *
 * Usage:
 *   recap render <content.json> [-o out.html] [--theme dark|light|auto]
 *   recap validate <content.json>
 *   recap --help | --version
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { renderFromJson } from "@recap-studio/html-renderer";
import { parseRecapPageContent } from "@recap-studio/content-pipeline";
import { runValidation, reportMarkdown } from "@recap-studio/validation";

const VERSION = "0.3.0";

const HELP = `recap ${VERSION} — self-contained dark-mode explainer pages.

USAGE
  recap render <content.json> [options]   Render to ONE self-contained HTML file
  recap validate <content.json>           Score content (7 deterministic checks)
  recap --help                            Show this help
  recap --version                         Print version

RENDER OPTIONS
  -o, --out <file>      Output path (default: <content-basename>.html)
  --theme <t>           dark | light | auto   (default: dark)

NOTES
  • The output HTML inlines all CSS, has zero JavaScript, and opens with a
    double-click — no server, works offline.
  • Content must match the RecapPageContent schema. Most editors' AIs can
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
    return fail(`${path} is not valid JSON — ${(e as Error).message}`, 2);
  }
}

function parseFlags(args: string[]): { positional: string[]; flags: Record<string, string | true> } {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i]!;
    if (a === "-o" || a === "--out") flags.out = args[++i] ?? "";
    else if (a === "--theme") flags.theme = args[++i] ?? "";
    else if (a.startsWith("--")) flags[a.slice(2)] = true;
    else positional.push(a);
  }
  return { positional, flags };
}

function cmdRender(args: string[]): void {
  const { positional, flags } = parseFlags(args);
  const input = positional[0];
  if (!input) fail("render needs a content JSON path. See `recap --help`.", 2);
  const theme = typeof flags.theme === "string" && flags.theme ? flags.theme : "dark";
  if (!["dark", "light", "auto"].includes(theme)) fail(`--theme must be dark|light|auto (got "${theme}")`, 2);
  let html: string;
  try {
    html = renderFromJson(readJson(input!), { theme: theme as "dark" | "light" | "auto" });
  } catch (e) {
    return fail(`content failed schema validation:\n${(e as Error).message}`, 2);
  }
  const out =
    typeof flags.out === "string" && flags.out
      ? resolve(flags.out)
      : resolve(basename(input!).replace(/\.json$/i, "") + ".html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html, "utf8");
  const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
  process.stdout.write(`recap: wrote ${out} (${kb} KB, self-contained — double-click to open)\n`);
}

function cmdValidate(args: string[]): void {
  const input = args[0];
  if (!input) fail("validate needs a content JSON path. See `recap --help`.", 2);
  let content;
  try {
    content = parseRecapPageContent(readJson(input!));
  } catch (e) {
    return fail(`content failed schema validation:\n${(e as Error).message}`, 2);
  }
  const report = runValidation(content);
  process.stdout.write(reportMarkdown(report) + "\n");
  process.stdout.write(
    `\nNote: these are deterministic heuristic checks (structure, citations, word counts, secret/fluff scans). They do NOT fetch sources or run an LLM. Run /recap in Claude Code for the full agent review.\n`,
  );
  process.exit(report.passedThresholds ? 0 : 1);
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
