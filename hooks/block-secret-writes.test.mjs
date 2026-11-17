// Run: node --test hooks/
// block-secret-writes must guard every tool that changes a file, not only Write,
// and must stay silent outside a recap-studio project.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const HOOK = join(here, "block-secret-writes.mjs");
const FILE_TOOLS = ["Write", "Edit", "MultiEdit", "NotebookEdit"];

function scratch(inProject) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "recap-secret-")));
  if (inProject)
    writeFileSync(join(dir, "recap-studio.config.ts"), "export default {};\n");
  else writeFileSync(join(dir, "package.json"), '{"name":"some-other-app"}\n');
  return dir;
}

/** Run the hook the way Claude Code does: JSON payload on stdin. */
function run(cwd, toolName, toolInput) {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith("RECAP_")) delete env[k];
  const r = spawnSync("node", [HOOK], {
    cwd,
    input: JSON.stringify({ cwd, tool_name: toolName, tool_input: toolInput }),
    encoding: "utf8",
    env,
  });
  return { status: r.status, stderr: r.stderr };
}

test("hooks.json wires block-secret-writes to every file-changing tool", () => {
  const cfg = JSON.parse(readFileSync(join(here, "hooks.json"), "utf8"));
  const entry = cfg.hooks.PreToolUse.find((e) =>
    e.hooks.some((h) => h.command.includes("block-secret-writes.mjs")),
  );
  assert.ok(entry, "block-secret-writes is wired as a PreToolUse hook");
  const matcher = new RegExp(`^(?:${entry.matcher})$`);
  for (const tool of FILE_TOOLS)
    assert.ok(matcher.test(tool), `matcher "${entry.matcher}" covers ${tool}`);
  assert.ok(!matcher.test("Bash"), "the matcher does not catch Bash");
  assert.ok(!matcher.test("Read"), "the matcher does not catch Read");
});

test("in a recap project, an Edit of an existing .env is blocked", () => {
  const dir = scratch(true);
  try {
    const edit = {
      file_path: join(dir, ".env"),
      old_string: "A=1",
      new_string: "A=2",
    };
    const r = run(dir, "Edit", edit);
    assert.equal(r.status, 2);
    assert.match(r.stderr, /blocked write to potentially-secret path/);
    assert.equal(
      run(dir, "MultiEdit", {
        file_path: join(dir, "keys", "server.pem"),
        edits: [],
      }).status,
      2,
    );
    assert.equal(
      run(dir, "NotebookEdit", {
        notebook_path: join(dir, "secrets", "scratch.ipynb"),
        new_source: "x = 1",
      }).status,
      2,
      "NotebookEdit sends notebook_path, and that path is checked too",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("in a recap project, an Edit of an ordinary file is allowed", () => {
  const dir = scratch(true);
  try {
    const r = run(dir, "Edit", {
      file_path: join(dir, "src", "index.ts"),
      old_string: "a",
      new_string: "b",
    });
    assert.equal(r.status, 0);
    assert.equal(r.stderr, "");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("outside a recap project, an Edit of .env is allowed and silent", () => {
  const dir = scratch(false);
  try {
    for (const tool of FILE_TOOLS) {
      const key = tool === "NotebookEdit" ? "notebook_path" : "file_path";
      const r = run(dir, tool, { [key]: join(dir, ".env") });
      assert.equal(r.status, 0, `${tool} is not ours to judge here`);
      assert.equal(r.stderr, "", `${tool} prints nothing here`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
