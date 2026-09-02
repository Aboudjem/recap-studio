# Recap Studio in your editor

Two ways in, and they are independent.

1. **The skills.** Four skills (`recap-topic`, `recap-session`, `recap-setup`, `recap-validate`)
   that your agent reads and follows. One command installs them into any of 70+ agents.
2. **The MCP server.** An optional local server that gives an MCP-capable client the artifact store,
   source cache, diagram render, screenshot and preview helpers. It runs from a built clone, so it
   needs two commands first.

The `recap` CLI works on its own with neither of those. See [cli.md](cli.md) if that is all you want.

---

## 1. Install the skills

```bash
npx skills add Aboudjem/recap-studio
```

That is the whole thing. The [`skills` CLI](https://github.com/vercel-labs/skills) detects the
agents on your machine and installs into each. To target one agent, pass `-a`:

```bash
npx skills add Aboudjem/recap-studio -a codex
npx skills add Aboudjem/recap-studio -a cursor -g     # -g installs for your user, not this project
npx skills add Aboudjem/recap-studio -a gemini-cli -y # -y skips the confirmation prompt
```

Agent codes, verified against the
[supported-agents table](https://github.com/vercel-labs/skills#supported-agents):

| Agent | `-a` code | Where the skills land (user scope) |
| --- | --- | --- |
| Claude Code | `claude-code` | `~/.claude/skills/` |
| Cursor | `cursor` | `~/.cursor/skills/` |
| Codex | `codex` | `~/.codex/skills/` |
| GitHub Copilot (and VS Code) | `github-copilot` | `~/.copilot/skills/` |
| Gemini CLI | `gemini-cli` | `~/.gemini/skills/` |
| OpenCode | `opencode` | `~/.config/opencode/skills/` |
| Windsurf | `windsurf` | `~/.codeium/windsurf/skills/` |
| Zed | `zed` | `~/.agents/skills/` |
| Kimi Code CLI | `kimi-code-cli` | `~/.agents/skills/` |
| Cline | `cline` | `~/.agents/skills/` |
| Mistral Vibe | `mistral-vibe` | `~/.vibe/skills/` |
| Pi | `pi` | `~/.pi/agent/skills/` |
| Trae | `trae` | `~/.trae/skills/` |
| Antigravity | `antigravity` | `~/.gemini/antigravity/skills/` |
| Hermes Agent | `hermes-agent` | `~/.hermes/skills/` |
| OpenClaw | `openclaw` | `~/.openclaw/skills/` |

Any other agent in that table works too; the list above is the set Recap Studio's own installer
knows about. `npx skills list` shows what you have, `npx skills remove` takes it back out.

### Claude Code

Claude Code can also take the whole plugin, hooks and MCP declaration included, from the 10x
marketplace:

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

### `install.sh`

The repo also carries an installer. Its default path now delegates to the same `skills` CLI, which
keeps the install directories current without a hand-maintained table:

```bash
./install.sh codex          # runs: npx skills add Aboudjem/recap-studio -a codex -g -y
./install.sh all            # every platform it knows
./install.sh codex --legacy # the old behavior: symlink skills/ directly, no npx, works offline
./install.sh codex --uninstall
./install.sh --help
```

Use `--legacy` when you have no network, no npx, or you want the skills symlinked to a checkout you
edit. `--project` installs into the current directory instead of your user directory.

---

## 2. Add the MCP server

The MCP server is **local**. Unlike a published package you can reach with `npx`, it runs from a
built clone, so do this once:

```bash
git clone https://github.com/Aboudjem/recap-studio.git
cd recap-studio
pnpm install && pnpm -w build
```

That produces `packages/mcp-server/dist/index.js`. `dist/` is gitignored, so a fresh clone has no
binary until you run the build. Every snippet below uses that path.

Replace `/ABSOLUTE/PATH/TO/recap-studio` with the output of `pwd` from the repo root. MCP clients
spawn the server with an undefined working directory, so a relative path will fail with
"Cannot find module".

### Claude Code

```bash
claude mcp add recap-studio-tools \
  -- node /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js
```

Add `--scope project` to write it to a shared `.mcp.json` instead of your user config. Recap Studio
does not ship a `.mcp.json`; the server is declared as an optional entry in
`.claude-plugin/plugin.json`, so a marketplace install offers it and never requires it.

### Cursor

`.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### VS Code and GitHub Copilot

`.vscode/mcp.json`. The top-level key is `servers`, not `mcpServers`. VS Code is the only client
here that spells it that way.

```json
{
  "servers": {
    "recap-studio-tools": {
      "type": "stdio",
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Codex

`~/.codex/config.toml`. TOML, not JSON.

```toml
[mcp_servers.recap-studio-tools]
command = "node"
args = ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
startup_timeout_sec = 15
```

Or `codex mcp add recap-studio-tools -- node /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js`.

### Gemini CLI

`~/.gemini/settings.json` (global) or `.gemini/settings.json` (project):

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"],
      "cwd": "/ABSOLUTE/PATH/TO/recap-studio"
    }
  }
}
```

Gemini CLI sanitises the child environment. If you use the optional email or deploy helpers, list
their variables explicitly in an `env` map; otherwise omit `env` entirely.

### Windsurf

`~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Continue

`~/.continue/config.yaml` (global) or `.continue/config.yaml` (workspace):

```yaml
mcpServers:
  - name: recap-studio-tools
    command: node
    args:
      - /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js
    cwd: /ABSOLUTE/PATH/TO/recap-studio
```

Continue only fires MCP tools in agent mode.

### OpenCode

`opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "recap-studio-tools": {
      "type": "local",
      "command": ["node", "/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"],
      "enabled": true
    }
  }
}
```

### Zed

`settings.json`. The key is `context_servers`, and `command` and `args` sit flat on the entry.

```json
{
  "context_servers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

---

## Which key does my client use

| Client | Config file | Top-level key | Format |
| --- | --- | --- | --- |
| Claude Code | `.mcp.json` or `claude mcp add` | `mcpServers` | JSON |
| Cursor | `.cursor/mcp.json` | `mcpServers` | JSON |
| VS Code, Copilot | `.vscode/mcp.json` | `servers` | JSON |
| Codex | `~/.codex/config.toml` | `mcp_servers.*` | TOML |
| Gemini CLI | `~/.gemini/settings.json` | `mcpServers` | JSON |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `mcpServers` | JSON |
| Continue | `~/.continue/config.yaml` | `mcpServers` | YAML |
| OpenCode | `opencode.json` | `mcp` | JSON |
| Zed | `settings.json` | `context_servers` | JSON |

---

## Check it worked

```bash
# Skills
npx skills list

# CLI, no editor involved
node packages/cli/dist/index.js validate fixtures/topics/latest-ai-models.json

# MCP, Claude Code
claude mcp list      # recap-studio-tools should appear
```

In any MCP client, ask it to validate the `latest-ai-models` content. A report with a numeric score
comes back.

## When it does not

**The server never starts.** Run `pnpm install && pnpm -w build`. `dist/` is not committed.

**"Cannot find module".** The path in `args` is relative. Use the absolute one.

**Tools return nothing in Cursor, VS Code, Codex or Continue.** Rebuild. Server builds before 0.3
returned a non-standard `type: "json"` content block.

**Continue does nothing at all.** Switch it to agent mode. Ask and chat modes never call MCP tools.

**The skills do not show up.** `npx skills list` tells you what installed where. If your agent is
not in the table above, check whether it appears in the
[full supported-agents list](https://github.com/vercel-labs/skills#supported-agents), and use that
code.
