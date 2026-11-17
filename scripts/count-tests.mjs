#!/usr/bin/env node
/**
 * count-tests: run `npm test` and print one total, so the README test count
 * can be re-printed with one command.
 *
 *   npm run test:count
 *
 * It sums the "# tests N" lines of every node:test suite and the
 * "Tests ... (N)" line of the vitest suite (apps/recap-web). The full log
 * goes to a temp file; the exit code is the one `npm test` returned.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const r = spawnSync("npm", ["test"], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const log = (r.stdout ?? "") + (r.stderr ?? "");
const logFile = join(mkdtempSync(join(tmpdir(), "recap-test-count-")), "npm-test.log");
writeFileSync(logFile, log, "utf8");

/** Parse the log into one row per suite: the npm script that ran it and its counts. */
function countSuites(text) {
  const suites = [];
  let current = "?";
  for (const line of text.split("\n")) {
    const script = line.match(/^> (\S+) (test(:\w+)?)$/);
    if (script) current = script[1].replace(/@[^@]*$/, "") + (script[3] ?? "");
    const tap = line.match(/^# tests (\d+)$/);
    if (tap) suites.push({ suite: current, tests: Number(tap[1]), failed: 0 });
    const tapFail = line.match(/^# fail (\d+)$/);
    if (tapFail && suites.length) suites[suites.length - 1].failed = Number(tapFail[1]);
    const vitest = line.match(/^\s*Tests\s+(.*)\((\d+)\)\s*$/);
    if (vitest) {
      const failed = vitest[1].match(/(\d+) failed/);
      suites.push({ suite: current, tests: Number(vitest[2]), failed: failed ? Number(failed[1]) : 0 });
    }
  }
  return suites;
}

const suites = countSuites(log);
for (const s of suites) console.log(`${String(s.tests).padStart(4)}  ${s.suite}${s.failed ? ` (${s.failed} failed)` : ""}`);
const total = suites.reduce((n, s) => n + s.tests, 0);
const failed = suites.reduce((n, s) => n + s.failed, 0);
console.log(`Total: ${total} tests in ${suites.length} suites, ${failed} failed. npm test exit code ${r.status}.`);
console.log(`Full log: ${logFile}`);
process.exit(r.status ?? 1);
