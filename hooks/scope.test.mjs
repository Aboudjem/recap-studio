// Run: node --test hooks/
// The hooks must act inside a recap-studio project and stay silent everywhere else.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findProjectRoot, hookProjectRoot, isInside } from "./lib/scope.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const hook = (name) => join(here, `${name}.mjs`);

/** A scratch folder. `kind` decides whether it is a recap-studio project. */
function scratch(kind) {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), `recap-hooks-${kind}-`)));
  if (kind === "config")
    writeFileSync(join(dir, "recap-studio.config.ts"), "export default {};\n");
  if (kind === "dotdir") mkdirSync(join(dir, ".recap-studio"));
  if (kind === "checkout")
    writeFileSync(join(dir, "package.json"), '{"name":"recap-studio"}\n');
  if (kind === "other")
    writeFileSync(join(dir, "package.json"), '{"name":"some-other-app"}\n');
  return dir;
}

/** Run a hook the way Claude Code does: JSON payload on stdin, cwd of the session. */
function run(name, cwd, toolInput, env = {}) {
  const clean = { ...process.env };
  for (const k of Object.keys(clean))
    if (k.startsWith("RECAP_")) delete clean[k];
  const r = spawnSync("node", [hook(name)], {
    cwd,
    input: JSON.stringify({ cwd, tool_input: toolInput }),
    encoding: "utf8",
    env: { ...clean, ...env },
  });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

const PUSH = { command: "git push origin main" };
const ENV_WRITE = { file_path: ".env.local" };
const PROD = { command: ["vercel", "--prod"].join(" ") };

test("outside a recap-studio project, no hook blocks anything", () => {
  const dir = scratch("other");
  try {
    assert.equal(
      run("block-destructive-git", dir, PUSH).status,
      0,
      "git push is allowed",
    );
    assert.equal(
      run("block-destructive-git", dir, { command: "git reset --hard" }).status,
      0,
    );
    assert.equal(
      run("block-secret-writes", dir, ENV_WRITE).status,
      0,
      ".env write is allowed",
    );
    assert.equal(
      run("validate-before-deploy", dir, PROD).status,
      0,
      "prod deploy is not ours to judge",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

for (const kind of ["config", "dotdir", "checkout"]) {
  test(`inside a recap-studio project (${kind}), the guards block`, () => {
    const dir = scratch(kind);
    try {
      const push = run("block-destructive-git", dir, PUSH);
      assert.equal(push.status, 2);
      assert.match(push.stderr, /refused git push/);
      assert.equal(run("block-secret-writes", dir, ENV_WRITE).status, 2);
      assert.equal(run("validate-before-deploy", dir, PROD).status, 2);
      assert.equal(
        run("validate-before-deploy", dir, { command: "ls -la" }).status,
        0,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

test("a subfolder of a recap-studio project is in scope", () => {
  const dir = scratch("config");
  try {
    const sub = join(dir, "a", "b");
    mkdirSync(sub, { recursive: true });
    assert.equal(run("block-destructive-git", sub, PUSH).status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the payload cwd decides the scope, not the process cwd", () => {
  const project = scratch("config");
  const other = scratch("other");
  try {
    const r = spawnSync("node", [hook("block-destructive-git")], {
      cwd: project,
      input: JSON.stringify({ cwd: other, tool_input: PUSH }),
      encoding: "utf8",
    });
    assert.equal(
      r.status,
      0,
      "session is in the other project, so the push is allowed",
    );
  } finally {
    rmSync(project, { recursive: true, force: true });
    rmSync(other, { recursive: true, force: true });
  }
});

test("RECAP_HOOKS_EVERYWHERE=1 opts back in to hooks in every project", () => {
  const dir = scratch("other");
  try {
    assert.equal(
      run("block-destructive-git", dir, PUSH, { RECAP_HOOKS_EVERYWHERE: "1" })
        .status,
      2,
    );
    assert.equal(
      run("block-secret-writes", dir, ENV_WRITE, {
        RECAP_HOOKS_EVERYWHERE: "1",
      }).status,
      2,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("format-after-edit leaves files of other projects untouched", () => {
  const dir = scratch("other");
  const project = scratch("config");
  try {
    const ugly = "const   a   =   {b:1}\n";
    const file = join(dir, "x.js");
    writeFileSync(file, ugly);
    assert.equal(run("format-after-edit", dir, { file_path: file }).status, 0);
    assert.equal(
      readFileSync(file, "utf8"),
      ugly,
      "file in an unrelated project is not reformatted",
    );
    // A session inside a recap project that edits a file elsewhere: still untouched.
    assert.equal(
      run("format-after-edit", project, { file_path: file }).status,
      0,
    );
    assert.equal(
      readFileSync(file, "utf8"),
      ugly,
      "file outside the project root is not reformatted",
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(project, { recursive: true, force: true });
  }
});

test("qa-summary-on-stop prints only inside a recap-studio project", () => {
  const report = JSON.stringify({
    dimensions: [{ name: "facts", score: 10, target: 9, status: "pass" }],
    blockers: [],
  });
  for (const [kind, expected] of [
    ["other", false],
    ["config", true],
  ]) {
    const dir = scratch(kind);
    try {
      mkdirSync(join(dir, "artifacts", "demo"), { recursive: true });
      writeFileSync(join(dir, "artifacts", "demo", "validation.json"), report);
      const r = run("qa-summary-on-stop", dir, {});
      assert.equal(r.status, 0);
      assert.equal(
        /recap-studio QA summary/.test(r.stdout),
        expected,
        `${kind}: ${r.stdout}`,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

test("findProjectRoot stops below the home folder", () => {
  const home = scratch("dotdir"); // a home folder that happens to hold .recap-studio/
  try {
    const project = join(home, "code", "app");
    mkdirSync(project, { recursive: true });
    assert.equal(
      findProjectRoot(project, home),
      null,
      "a marker in the home folder does not count",
    );
    writeFileSync(join(home, "code", "recap-studio.config.json"), "{}\n");
    assert.equal(findProjectRoot(project, home), join(home, "code"));
    assert.equal(
      hookProjectRoot({ cwd: project }, { HOME: home }),
      join(home, "code"),
    );
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test("isInside refuses the root itself, parents and siblings", () => {
  assert.equal(isInside("/p/app", "/p/app/src/a.ts"), true);
  assert.equal(isInside("/p/app", "src/a.ts", "/p/app"), true);
  assert.equal(isInside("/p/app", "/p/app"), false);
  assert.equal(isInside("/p/app", "/p/other/a.ts"), false);
  assert.equal(isInside("/p/app", "../other/a.ts", "/p/app"), false);
});

test("block-secret-writes allows macOS temp paths but still blocks secret files in them", () => {
  const dir = scratch("config");
  try {
    const write = (file_path) => run("block-secret-writes", dir, { file_path }).status;
    // Ordinary temp paths: the system's /private prefix is not a secret folder.
    for (const p of [
      "/private/tmp/recap/out.html",
      "/private/var/folders/xy/T/recap/content.json",
      "/tmp/recap/out.html",
    ])
      assert.equal(write(p), 0, `${p} is allowed`);
    // Real secret files stay blocked, in a temp folder or not.
    for (const p of [
      "/private/tmp/recap/.env",
      "/private/tmp/recap/.env.local",
      "/private/tmp/recap/server.pem",
      "/private/tmp/recap/tls.key",
      "/private/tmp/recap/id_ed25519",
      "/private/var/folders/xy/T/cert.p12",
      "/private/tmp/recap/secrets/token.txt",
      "/private/tmp/recap/private/notes.md",
      "/private/etc/app.conf",
      "/Users/me/app/.env",
    ])
      assert.equal(write(p), 2, `${p} is blocked`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
