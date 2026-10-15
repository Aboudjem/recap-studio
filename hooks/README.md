# Recap Studio hooks

Deterministic safety + DX hooks. Each script reads the Claude Code hook
payload from stdin and either exits 0 (allow) or exits 2 (block) per the
official contract.

| Hook                     | When                | Purpose                                                   |
| ------------------------ | ------------------- | --------------------------------------------------------- |
| `block-secret-writes`    | `PreToolUse(Write)` | Refuse writes to `.env*`, `secrets/**`, keys, PEMs        |
| `block-destructive-git`  | `PreToolUse(Bash)`  | Refuse `git push`, `reset --hard`, `rebase`, `clean -fdx` |
| `validate-before-deploy` | `PreToolUse(Bash)`  | Block `vercel --prod` unless config + confirmation        |
| `format-after-edit`      | `PostToolUse(W/E)`  | Best-effort Prettier on the touched file                  |
| `qa-summary-on-stop`     | `Stop`              | Print compact validation summary if available             |

Override escapes (use only after human review):

- `RECAP_ALLOW_SECRET_WRITE=1`
- `RECAP_ALLOW_GIT_PUSH=1` (narrow: plain `git push` only, see below)
- `RECAP_ALLOW_DESTRUCTIVE_GIT=1` (wide: every guarded git command)
- `RECAP_USER_CONFIRMED_PROD_DEPLOY=1`

## `block-destructive-git` opt-ins

| Command | Default | `RECAP_ALLOW_GIT_PUSH=1` | `RECAP_ALLOW_DESTRUCTIVE_GIT=1` |
| --- | --- | --- | --- |
| `git push`, `git push -u origin x`, `git push --tags` | blocked | allowed | allowed |
| `git push --force` / `-f` / `--force-with-lease` / `--force-if-includes` | blocked | blocked | allowed |
| `git push origin +ref`, `:ref`, `--delete` / `-d`, `--mirror`, `--prune` | blocked | blocked | allowed |
| `reset --hard`, `rebase`, `clean -fdx`, `branch -D`, `filter-branch`, `gc --prune`, `worktree remove --force` | blocked | blocked | allowed |

To let Claude push for you while history-rewriting commands stay blocked, set
`RECAP_ALLOW_GIT_PUSH=1`, for example in `~/.claude/settings.json`:

```json
{ "env": { "RECAP_ALLOW_GIT_PUSH": "1" } }
```

How commands are matched:

- Each shell segment (split on `;`, `&&`, `||`, `|`, newlines) is checked on its own, and
  git's global options are skipped, so `cd x && git -C ../repo push --force` is caught.
- Text inside quotes is ignored, so `git commit -m "then git push"` is not a push. When the
  command re-evaluates strings (`bash -c`, `sh -c`, `eval`, `xargs`, `ssh`, `$(...)`,
  backticks), quoted text is scanned as well.
- A flag or refspec written in quotes (`git push origin '+main'`) is still seen.
- Known limit: a heredoc body is scanned as plain text, which can only over-block.
- Tests: `node --test hooks/*.test.mjs`.
