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
- `RECAP_ALLOW_DESTRUCTIVE_GIT=1`
- `RECAP_USER_CONFIRMED_PROD_DEPLOY=1`
