#!/usr/bin/env node
/**
 * Recap Studio hook: block-destructive-git
 *
 * Refuses dangerous git commands. Exit 2 to block.
 *
 * Two opt-ins, from narrow to wide:
 *
 *   RECAP_ALLOW_GIT_PUSH=1         allows a plain `git push` (new branch, fast-forward,
 *                                  tags). Force, delete, mirror and prune pushes, and
 *                                  every history-rewriting command, stay blocked.
 *   RECAP_ALLOW_DESTRUCTIVE_GIT=1  allows everything this hook guards, force pushes
 *                                  included. Use only after human review.
 *
 * With neither set, every `git push` is refused, as in 0.5.1 and earlier.
 *
 * Matching is per shell segment (split on ;, &&, ||, |, newlines), and git's
 * global options are skipped, so `cd x && git -C dir push --force` is caught.
 * Text inside quotes is ignored, so `git commit -m "then git push"` is not a push,
 * unless the command re-evaluates strings (bash -c, sh -c, eval, xargs, ssh,
 * $(...), backticks), in which case quotes are scanned too. Known limit: a
 * heredoc body is scanned as plain text, which can only over-block.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// git global options that may sit between `git` and the subcommand.
const GIT = String.raw`\bgit(?:\s+(?:-C\s+\S+|-c\s+\S+|--(?:git-dir|work-tree|namespace|exec-path|config-env)(?:=\S+|\s+\S+)|--no-pager|--paginate|-p|-P|--bare|--no-replace-objects|--literal-pathspecs|--no-optional-locks))*\s+`;

// Commands that rewrite or discard history or work. Never covered by RECAP_ALLOW_GIT_PUSH.
const DESTRUCTIVE = [
  /reset\s+--hard\b/i,
  /rebase\b/i,
  /clean\s+-fd?x?\b/i,
  /branch\s+-D\b/i,
  /commit\s+--amend\s+--force\b/i,
  /filter-branch\b/i,
  /gc\s+--prune\b/i,
  /worktree\s+remove\s+--force\b/i,
].map((re) => ({
  re: new RegExp(GIT + re.source, re.flags),
  label: re.source,
}));

const PUSH = new RegExp(GIT + String.raw`push\b`, "i");
const PUSH_ARGS = new RegExp(GIT + String.raw`push\b([^\n]*)`, "i");

const REEVAL = /\b(?:bash|sh|zsh|dash|eval|xargs|ssh|exec)\b|\$\(|`/;

/** Replace the inside of '...' and "..." with x so quoted text cannot match. */
export function maskQuotes(cmd) {
  let out = "";
  let quote = null;
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (quote) {
      if (ch === "\\" && quote === '"' && i + 1 < cmd.length) {
        out += "xx";
        i++;
      } else if (ch === quote) {
        out += ch;
        quote = null;
      } else {
        out += ch === "\n" ? "\n" : "x";
      }
    } else {
      if (ch === "'" || ch === '"') quote = ch;
      out += ch;
    }
  }
  return out;
}

function segments(cmd) {
  return cmd
    .split(/&&|\|\||[;|\n&()]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** True when a push argument list asks for anything beyond a plain push. */
export function isForceLikePush(args) {
  return args
    .split(/\s+/)
    .filter(Boolean)
    .some(
      (t) =>
        /^--(?:force|force-with-lease|force-if-includes|delete|mirror|prune)(?:=|$)/i.test(
          t,
        ) ||
        /^-[a-zA-Z]*[fd][a-zA-Z]*$/.test(t) || // -f, -d, -fu, -uf ...
        /^\+\S/.test(t) || // +refspec (forced update)
        /^:\S/.test(t), // :refspec (delete remote ref)
    );
}

// Force-likeness is judged on the raw command with quote characters removed, so a
// quoted flag or refspec (git push origin '+main') cannot slip past the mask.
function anyForceLikePush(cmd) {
  return segments(cmd.replace(/['"]/g, "")).some((seg) => {
    const m = PUSH_ARGS.exec(seg);
    return m ? isForceLikePush(m[1]) : false;
  });
}

/**
 * Decide whether `cmd` may run.
 * @returns {{ block: false } | { block: true, reason: string }}
 */
export function evaluate(cmd, env = process.env) {
  if (!cmd) return { block: false };
  if (env.RECAP_ALLOW_DESTRUCTIVE_GIT === "1") return { block: false };
  const allowPush = env.RECAP_ALLOW_GIT_PUSH === "1";

  const scanned = REEVAL.test(cmd) ? cmd : maskQuotes(cmd);

  for (const seg of segments(scanned)) {
    const hit = DESTRUCTIVE.find(({ re }) => re.test(seg));
    if (hit) {
      return {
        block: true,
        reason:
          `recap-studio: refused destructive git command (git ${hit.label}).\n` +
          `set RECAP_ALLOW_DESTRUCTIVE_GIT=1 only after human review.\n`,
      };
    }
    if (PUSH.test(seg)) {
      if (anyForceLikePush(cmd)) {
        return {
          block: true,
          reason:
            `recap-studio: refused force/delete/mirror/prune git push.\n` +
            `RECAP_ALLOW_GIT_PUSH=1 covers plain pushes only; this one needs\n` +
            `RECAP_ALLOW_DESTRUCTIVE_GIT=1, set only after human review.\n`,
        };
      }
      if (!allowPush) {
        return {
          block: true,
          reason:
            `recap-studio: refused git push.\n` +
            `set RECAP_ALLOW_GIT_PUSH=1 to allow plain pushes (force, delete,\n` +
            `mirror and prune pushes stay blocked), or RECAP_ALLOW_DESTRUCTIVE_GIT=1\n` +
            `to allow everything, only after human review.\n`,
        };
      }
    }
  }
  return { block: false };
}

function readPayload() {
  try {
    const raw = readFileSync(0, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const cmd = readPayload()?.tool_input?.command ?? "";
  const result = evaluate(cmd);
  if (result.block) {
    process.stderr.write(result.reason);
    process.exit(2);
  }
  process.exit(0);
}
