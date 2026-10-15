// Run: node --test hooks/
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { evaluate } from "./block-destructive-git.mjs";

const NONE = {};
const PUSH_OK = { RECAP_ALLOW_GIT_PUSH: "1" };
const ALL_OK = { RECAP_ALLOW_DESTRUCTIVE_GIT: "1" };

const blocked = (cmd, env) => evaluate(cmd, env).block;

const PLAIN_PUSHES = [
  "git push",
  "git push origin main",
  "git push -u origin fix/granular-push-guard",
  "git push --set-upstream origin feature-d",
  "git push --tags",
  "git push origin v1.2.3",
  "git push origin HEAD:main",
  "git -C ../other push origin main",
  "git -c core.sshCommand=ssh push",
  "git --no-pager push origin main",
  "cd repo && git add . && git commit -m 'msg' && git push",
];

const FORCE_PUSHES = [
  "git push --force",
  "git push -f origin main",
  "git push origin main -f",
  "git push -uf origin main",
  "git push --force-with-lease",
  "git push --force-with-lease=main:abc123 origin main",
  "git push --force-if-includes --force-with-lease",
  "git push origin +main",
  "git push origin '+main'",
  'git push origin "-f"',
  "git push origin :old-branch",
  "git push origin --delete old-branch",
  "git push -d origin old-branch",
  "git push --mirror",
  "git push --prune origin",
  "git -C /tmp/x push --force",
  "git add . && git commit -m wip; git push --force",
  "echo ok | git push -f",
];

const DESTRUCTIVE = [
  "git reset --hard HEAD~1",
  "git rebase main",
  "git rebase -i HEAD~3",
  "git clean -fdx",
  "git branch -D feature",
  "git filter-branch --tree-filter x",
  "git gc --prune=now",
  "git worktree remove --force ../wt",
  "git -C ../repo reset --hard",
  "git status && git reset --hard",
];

test("default: every push is refused (unchanged behaviour)", () => {
  for (const c of [...PLAIN_PUSHES, ...FORCE_PUSHES])
    assert.ok(blocked(c, NONE), c);
});

test("RECAP_ALLOW_GIT_PUSH=1 allows plain pushes", () => {
  for (const c of PLAIN_PUSHES) assert.equal(blocked(c, PUSH_OK), false, c);
});

test("RECAP_ALLOW_GIT_PUSH=1 still refuses force-like pushes", () => {
  for (const c of FORCE_PUSHES) assert.ok(blocked(c, PUSH_OK), c);
});

test("RECAP_ALLOW_GIT_PUSH=1 still refuses history-destroying commands", () => {
  for (const c of DESTRUCTIVE) {
    assert.ok(blocked(c, NONE), c);
    assert.ok(blocked(c, PUSH_OK), c);
  }
});

test("RECAP_ALLOW_DESTRUCTIVE_GIT=1 allows everything (unchanged escape hatch)", () => {
  for (const c of [...PLAIN_PUSHES, ...FORCE_PUSHES, ...DESTRUCTIVE]) {
    assert.equal(blocked(c, ALL_OK), false, c);
  }
});

test("safe commands pass", () => {
  for (const c of [
    "ls -la",
    "git status",
    "git log --oneline",
    "git commit -m fix",
    "git fetch",
    "git pull",
  ]) {
    assert.equal(blocked(c, NONE), false, c);
  }
});

test("quoted text is not treated as a command", () => {
  assert.equal(blocked('git commit -m "then git push --force"', NONE), false);
  assert.equal(blocked("git commit -m 'document git rebase'", NONE), false);
  assert.equal(
    blocked('git commit -m "push later" && git push', PUSH_OK),
    false,
  );
});

test("quotes are scanned when the command re-evaluates strings", () => {
  assert.ok(blocked('bash -c "git push --force"', PUSH_OK));
  assert.ok(blocked('sh -c "git push"', NONE));
  assert.ok(blocked("eval 'git reset --hard'", PUSH_OK));
  assert.ok(blocked('echo "$(git push -f)"', PUSH_OK));
});

test("refusal messages name the right variable", () => {
  assert.match(evaluate("git push", NONE).reason, /RECAP_ALLOW_GIT_PUSH=1/);
  assert.match(
    evaluate("git push -f", PUSH_OK).reason,
    /RECAP_ALLOW_DESTRUCTIVE_GIT=1/,
  );
  assert.match(
    evaluate("git rebase main", PUSH_OK).reason,
    /RECAP_ALLOW_DESTRUCTIVE_GIT=1/,
  );
});

test("hook contract: stdin payload, exit 2 on block, exit 0 on allow", () => {
  const hook = fileURLToPath(
    new URL("./block-destructive-git.mjs", import.meta.url),
  );
  const run = (command, extraEnv) => {
    const env = { ...process.env, ...extraEnv };
    delete env.RECAP_ALLOW_GIT_PUSH;
    delete env.RECAP_ALLOW_DESTRUCTIVE_GIT;
    Object.assign(env, extraEnv);
    return spawnSync(process.execPath, [hook], {
      input: JSON.stringify({ tool_input: { command } }),
      env,
      encoding: "utf8",
    });
  };
  const refused = run("git push origin main", {});
  assert.equal(refused.status, 2);
  assert.match(refused.stderr, /RECAP_ALLOW_GIT_PUSH=1/);
  assert.equal(run("git push origin main", PUSH_OK).status, 0);
  assert.equal(run("git push --force", PUSH_OK).status, 2);
  assert.equal(run("ls", {}).status, 0);
  assert.equal(
    spawnSync(process.execPath, [hook], { input: "", encoding: "utf8" }).status,
    0,
  );
});
