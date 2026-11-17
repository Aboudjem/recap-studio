// Run: node --test tests/
// What a user gets after `claude plugin install`: no node_modules, no build step.
// These tests copy the shipped files to an empty folder and use them from there.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const json = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const node = (args, opts = {}) => spawnSync("node", args, { encoding: "utf8", ...opts });

/** An installed copy of the plugin: the manifest and the bundle, nothing else. */
function installedPlugin() {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "recap-plugin-")));
  mkdirSync(join(dir, ".claude-plugin"));
  cpSync(join(root, ".claude-plugin/plugin.json"), join(dir, ".claude-plugin/plugin.json"));
  cpSync(join(root, "bin"), join(dir, "bin"), { recursive: true });
  return dir;
}

/** The MCP command of plugin.json, with ${CLAUDE_PLUGIN_ROOT} filled in as Claude Code does. */
function mcpCommand(pluginRoot) {
  const entry = Object.values(json(".claude-plugin/plugin.json").mcpServers)[0];
  const fill = (s) => s.replaceAll("${CLAUDE_PLUGIN_ROOT}", pluginRoot);
  return { command: fill(entry.command), args: entry.args.map(fill) };
}

/** Send JSON-RPC requests to the server over stdio and return the responses by id. */
function rpc(pluginRoot, cwd, requests) {
  const { command, args } = mcpCommand(pluginRoot);
  const r = spawnSync(command, args, {
    cwd,
    input: requests.map((q) => JSON.stringify({ jsonrpc: "2.0", ...q })).join("\n") + "\n",
    encoding: "utf8",
    timeout: 20000,
  });
  assert.equal(r.status, 0, `server exited ${r.status}: ${r.stderr}`);
  const byId = {};
  for (const line of r.stdout.trim().split("\n")) {
    const res = JSON.parse(line);
    byId[res.id] = res;
  }
  return byId;
}

const call = (id, name, args) => ({ id, method: "tools/call", params: { name, arguments: args } });
const payload = (res) => JSON.parse(res.result.content[0].text);

test("the committed bundle matches the sources", () => {
  const r = node([join(root, "scripts/build-bundle.mjs"), "--check"]);
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

test("plugin.json points the MCP server at a file the plugin ships", () => {
  const { command, args } = mcpCommand(root);
  assert.equal(command, "node");
  assert.ok(args[0].endsWith("bin/recap.mjs"), args[0]);
  assert.ok(existsSync(args[0]), `${args[0]} is committed`);
  const raw = Object.values(json(".claude-plugin/plugin.json").mcpServers)[0].args[0];
  assert.ok(raw.startsWith("${CLAUDE_PLUGIN_ROOT}/"), "the path does not depend on the working directory");
});

test("the MCP server starts from an installed plugin, in any project", () => {
  const plugin = installedPlugin();
  const project = realpathSync(mkdtempSync(join(tmpdir(), "recap-project-")));
  try {
    const res = rpc(plugin, project, [
      { id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {} } },
      { method: "notifications/initialized" },
      { id: 2, method: "tools/list" },
      { id: 3, method: "ping" },
    ]);
    assert.equal(res[1].result.serverInfo.name, "recap-studio-mcp");
    assert.equal(res[1].result.serverInfo.version, json("package.json").version);
    assert.equal(res[1].result.protocolVersion, "2025-06-18");
    assert.equal(res[2].result.tools.length, 11);
    assert.ok(res[2].result.tools.every((t) => t.name && t.description && t.inputSchema?.type === "object"));
    assert.deepEqual(res[3].result, {});
    assert.equal(Object.keys(res).length, 3, "the notification gets no response");
  } finally {
    rmSync(plugin, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  }
});

test("save, validate and render a page through MCP in a project that is not this repo", () => {
  const plugin = installedPlugin();
  const project = realpathSync(mkdtempSync(join(tmpdir(), "recap-project-")));
  try {
    const example = node([join(plugin, "bin/recap.mjs"), "example"], { cwd: project }).stdout;
    const content = { ...JSON.parse(example), slug: "my-topic" };
    const res = rpc(plugin, project, [
      call(1, "create_run_artifact", { slug: "my-topic", filename: "content.json", content: JSON.stringify(content) }),
      call(2, "validate_content", { slug: "my-topic" }),
      call(3, "render_recap_html", { slug: "my-topic" }),
      call(4, "render_recap_html", { slug: "does-not-exist" }),
    ]);
    assert.equal(payload(res[1]).path, join(project, "artifacts/my-topic/content.json"));
    const report = payload(res[2]);
    assert.equal(report.report.slug, "my-topic");
    assert.match(report.markdown.split("\n").slice(0, 3).join("\n"), /Verdict: (PASS|FAIL)/);
    const rendered = payload(res[3]);
    assert.equal(rendered.path, join(project, "artifacts/my-topic/recap-my-topic.html"));
    const html = readFileSync(rendered.path, "utf8");
    assert.match(html, /^<!doctype html>/i);
    assert.ok(!/<script/i.test(html), "no script tag in the page");
    assert.match(res[4].error.message, /no content for slug "does-not-exist"/);
  } finally {
    rmSync(plugin, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  }
});

test("artifact tools refuse a path that leaves artifacts/", () => {
  const plugin = installedPlugin();
  const project = realpathSync(mkdtempSync(join(tmpdir(), "recap-project-")));
  try {
    writeFileSync(join(project, "private.txt"), "keep out\n");
    const res = rpc(plugin, project, [
      call(1, "create_run_artifact", { slug: "..", filename: "escaped.txt", content: "x" }),
      call(2, "create_run_artifact", { slug: "a", filename: "../../escaped.txt", content: "x" }),
      call(3, "read_run_artifact", { slug: "..", filename: "private.txt" }),
      call(4, "create_run_artifact", { slug: "a", filename: "/tmp/recap-escaped.txt", content: "x" }),
    ]);
    for (const id of [1, 2, 3, 4]) assert.match(res[id].error.message, /outside artifacts/, `call ${id}`);
    assert.ok(!existsSync(join(project, "escaped.txt")), "nothing was written outside artifacts/");
  } finally {
    rmSync(plugin, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  }
});

test("recap demo gives a first page with no input, verdict first", () => {
  const plugin = installedPlugin();
  const project = realpathSync(mkdtempSync(join(tmpdir(), "recap-project-")));
  try {
    const r = node([join(plugin, "bin/recap.mjs"), "demo"], { cwd: project });
    assert.equal(r.status, 0, r.stderr);
    const lines = r.stdout.split("\n");
    assert.match(lines[0], /^Verdict: PASS\. Wrote .*recap-latest-ai-models\.html$/);
    assert.match(lines[1], /0 script tags/);
    assert.ok(lines.filter((l) => l.startsWith("- ")).length >= 3, "three next steps");
    assert.ok(existsSync(join(project, "recap-latest-ai-models.html")));
  } finally {
    rmSync(plugin, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  }
});

test("recap example writes a starter file and refuses to overwrite it", () => {
  const project = realpathSync(mkdtempSync(join(tmpdir(), "recap-project-")));
  try {
    const bin = join(root, "bin/recap.mjs");
    assert.equal(node([bin, "example", "-o", "content.json"], { cwd: project }).status, 0);
    assert.equal(node([bin, "validate", "content.json", "--fail-under", "8"], { cwd: project }).status, 0);
    const again = node([bin, "example", "-o", "content.json"], { cwd: project });
    assert.equal(again.status, 2);
    assert.match(again.stderr, /already exists/);
  } finally {
    rmSync(project, { recursive: true, force: true });
  }
});

test("every manifest carries the same version", () => {
  const v = json("package.json").version;
  for (const p of [
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    ".copilot-plugin/plugin.json",
    "server.json",
    "packages/cli/package.json",
    "packages/mcp-server/package.json",
  ]) {
    assert.equal(json(p).version, v, p);
  }
  assert.equal(node([join(root, "bin/recap.mjs"), "--version"]).stdout.trim(), v, "recap --version");
  assert.match(readFileSync(join(root, "CHANGELOG.md"), "utf8"), new RegExp(`^## \\[?${v.replaceAll(".", "\\.")}`, "m"));
});

test("server.json matches the .mcpb bundle built from the sources", () => {
  const r = node([join(root, "scripts/pack-mcpb.mjs"), "--check"]);
  assert.equal(r.status, 0, r.stderr || r.stdout);
  const s = json("server.json");
  assert.ok(s.name.startsWith("io.github.Aboudjem/"));
  assert.ok(s.description.length <= 100, "registry limit");
  assert.match(s.packages[0].fileSha256, /^[0-9a-f]{64}$/);
});

test("docs/mcp-tools.md matches the tool list of the server", () => {
  const r = node([join(root, "scripts/gen-mcp-docs.mjs"), "--check"]);
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

test("every skill a manifest names exists, and every skill has a matching name", () => {
  for (const p of [".cursor-plugin/plugin.json", ".copilot-plugin/plugin.json"]) {
    for (const s of json(p).skills) assert.ok(existsSync(join(root, "skills", s, "SKILL.md")), `${p}: ${s}`);
  }
  for (const s of json(".cursor-plugin/plugin.json").skills) {
    const text = readFileSync(join(root, "skills", s, "SKILL.md"), "utf8");
    assert.match(text, new RegExp(`^name: ${s}$`, "m"));
  }
});
