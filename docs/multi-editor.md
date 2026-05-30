# Recap Studio: Multi-Editor Setup (MCP + CLI)

Copy-paste config blocks for the MCP server and the `recap` CLI in every major editor.
One smoke test per editor confirms it is wired up correctly.

---

## Prerequisites

> **Heads-up on `npx`/`npm`:** the `@recap-studio/*` packages publish to npm **with the 0.3.0
> release**. Until then, every `npx @recap-studio/...` command below works only from a built
> clone, use the `node packages/<pkg>/dist/index.js` form, or build first (below). The
> Claude Code marketplace install (`recap-studio@10x`) works today.

**All editors:** You need a local build of the MCP server before the `node` form of any config
will work. The `npx` form additionally requires the published package (see heads-up above).

```bash
# Clone the repo (if you haven't already)
git clone https://github.com/Aboudjem/recap-studio.git
cd recap-studio

# Install dependencies and build all packages (including the MCP server)
pnpm install
pnpm build
```

After the build, `packages/mcp-server/dist/index.js` exists and is ready to use.

Replace `/ABSOLUTE/PATH/TO/recap-studio` throughout this document with the output of
`pwd` run from your repo root (e.g. `/Users/yourname/projects/recap-studio`).

---

## The `recap` CLI: quick reference

The `recap` CLI is in `packages/cli`. It renders a `RecapPageContent` JSON to a self-contained
HTML file and validates content. No Claude, no API key, no server required.

```bash
# Works today (from a built clone):
node packages/cli/dist/index.js render content.json -o out.html --theme dark
node packages/cli/dist/index.js validate content.json

# After the 0.3.0 npm publish, the same commands become:
npx @recap-studio/cli render content.json -o out.html --theme dark
npx @recap-studio/cli validate content.json
```

> **Note on the validation score:** `recap validate` runs 7 deterministic heuristic checks
> (structure, citation presence, word counts, secret/fluff regex). It does NOT fetch sources or
> run an LLM. For the full agent review run `/recap` inside Claude Code.

Both commands also work via `pnpm exec recap` inside the repo.

---

## 1. Claude Code

**Config mechanism:** `.mcp.json` at the repo root (project-scoped, shared with the team)
or `claude mcp add` for a user-local entry.

### Option A: `.mcp.json` (recommended, checked in)

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

### Option B: `claude mcp add` (user-local, not committed)

```bash
# Local scope (private to you)
claude mcp add --transport stdio recap-studio-tools \
  -- node /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js

# Project scope (written to .mcp.json, shared)
claude mcp add --transport stdio --scope project recap-studio-tools \
  -- node /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js
```

### Smoke test

```bash
claude mcp list
# recap-studio-tools should appear in the list

# Inside a Claude Code session:
/mcp
# Server should show as connected with tools listed (render_recap_html, validate_content, …)
```

### CLI alternative

```bash
recap render apps/recap-web/src/content/latest-ai-models.json -o /tmp/test.html
# recap: wrote /tmp/test.html (… KB, self-contained: double-click to open)
```

---

## 2. Cursor

**Config file:** `.cursor/mcp.json` at the project root (project-scoped) or
`~/.cursor/mcp.json` (global). Create the file if it does not exist.

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

### Smoke test

1. Add `.cursor/mcp.json` to the repo root with the block above.
2. Reload the Cursor window: `Cmd+Shift+P` → **Reload Window**.
3. Open **Cursor Settings → MCP**, `recap-studio-tools` should show as **Connected**.
4. In Cursor chat, type:

   ```
   Use recap-studio-tools to validate the content at slug latest-ai-models
   ```

   You should get a validation report with a numeric score.

### CLI alternative

```bash
npx @recap-studio/cli validate fixtures/topics/latest-ai-models.json
```

---

## 3. VS Code (GitHub Copilot / MCP extension)

**Config file:** `.vscode/mcp.json` at the workspace root (checked in) or the user-scope
config opened via **MCP: Open User Configuration** from the Command Palette.

> **VS Code-specific:** the top-level key is `"servers"`, not `"mcpServers"`. This differs from
> every other editor.

```json
{
  "servers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Smoke test

1. Add `.vscode/mcp.json` to the workspace root.
2. Reload VS Code window.
3. Open GitHub Copilot Chat. Switch to **agent mode**. The MCP tool picker should list
   `recap-studio-tools`.
4. In Copilot Chat (agent mode):

   ```
   Use recap-studio-tools to validate the content at slug latest-ai-models
   ```

   A validation report should appear.

### CLI alternative

```bash
npx @recap-studio/cli validate fixtures/topics/latest-ai-models.json
```

---

## 4. OpenAI Codex CLI

**Config file:** `~/.codex/config.toml` (user-scoped) or `.codex/config.toml` at the project
root (trusted projects only). Codex uses TOML; this is different from every other editor.

```toml
[mcp_servers.recap-studio-tools]
command = "node"
args = ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"]
startup_timeout_sec = 15
```

### Or via `codex mcp add`

```bash
codex mcp add recap-studio-tools \
  -- node /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js
```

### Smoke test

```bash
codex --tools recap-studio-tools \
  "Call validate_content with slug latest-ai-models and show the score."
```

A validation JSON should be returned in the output.

### CLI alternative

```bash
npx @recap-studio/cli validate fixtures/topics/latest-ai-models.json
```

---

## 5. Google Gemini CLI

**Config file:** `~/.gemini/settings.json` (user-scoped) or `.gemini/settings.json` at the
project root.

> **Important, env vars are NOT auto-forwarded in Gemini CLI.** If the MCP server needs
> environment variables (e.g. `RESEND_API_KEY`, `VERCEL_TOKEN`), list them explicitly in the
> `env` key as shown below. Without the `env` key those values will be absent inside the server
> process even if they are set in your shell.

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"],
      "cwd": "/ABSOLUTE/PATH/TO/recap-studio",
      "trust": false,
      "env": {
        "RESEND_API_KEY": "YOUR_KEY_HERE",
        "VERCEL_TOKEN": "YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Omit the `env` key entirely if you only need read/render/validate tools (no email or deploy).

### Smoke test

```bash
gemini
# Inside the Gemini CLI session:
# "Use recap-studio-tools to validate the latest-ai-models content."
```

A validation report should appear in the Gemini session output.

### CLI alternative

```bash
npx @recap-studio/cli validate fixtures/topics/latest-ai-models.json
```

---

## 6. Windsurf

**Config file:** `~/.codeium/windsurf/mcp_config.json`. This is a global file; Windsurf does
not support project-scoped MCP config at the time of writing.

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js"],
      "env": {
        "RECAP_STUDIO_ROOT": "/ABSOLUTE/PATH/TO/recap-studio"
      }
    }
  }
}
```

Windsurf also supports its own `${env:VAR}` interpolation in `args` if you prefer not to
hardcode the path:

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["${env:RECAP_STUDIO_ROOT}/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Smoke test

1. Edit `~/.codeium/windsurf/mcp_config.json` with the block above.
2. In Windsurf: open the **Cascade** panel → MCP settings → click **Refresh**.
3. `recap-studio-tools` should appear as **Connected**.
4. In Cascade:

   ```
   @recap-studio-tools validate_content slug: "latest-ai-models"
   ```

   A validation report should appear.

### CLI alternative

```bash
npx @recap-studio/cli validate fixtures/topics/latest-ai-models.json
```

---

## 7. Continue.dev

**Config file:** `~/.continue/config.yaml` (global) or `.continue/config.yaml` at the
workspace root.

> **Continue.dev agent mode required.** MCP tools only fire when Continue is in **agent mode**.
> Switch before running the smoke test.

```yaml
mcpServers:
  - name: recap-studio-tools
    command: node
    args:
      - /ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js
    cwd: /ABSOLUTE/PATH/TO/recap-studio
```

### Smoke test

1. Add the `mcpServers` block to `~/.continue/config.yaml`.
2. Reload VS Code / the Continue extension.
3. Switch Continue to **agent mode**.
4. In the Continue chat:

   ```
   Use recap-studio-tools to validate latest-ai-models
   ```

   A validation report should appear.

### CLI alternative

```bash
npx @recap-studio/cli validate fixtures/topics/latest-ai-models.json
```

---

## Summary table

| Editor | Config file | Top-level key | Format | Smoke test |
|---|---|---|---|---|
| Claude Code | `.mcp.json` | `mcpServers` | JSON | `claude mcp list` then `/mcp` |
| Cursor | `.cursor/mcp.json` | `mcpServers` | JSON | Settings → MCP → Connected |
| VS Code Copilot | `.vscode/mcp.json` | **`servers`** | JSON | Copilot agent mode → tool picker |
| Codex CLI | `~/.codex/config.toml` | `mcp_servers.*` | **TOML** | `codex --tools recap-studio-tools "..."` |
| Gemini CLI | `~/.gemini/settings.json` | `mcpServers` | JSON | Gemini session: "validate …" |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `mcpServers` | JSON | Cascade → Refresh → Connected |
| Continue.dev | `~/.continue/config.yaml` | `mcpServers` | **YAML** | Agent mode → "validate …" |

---

## Troubleshooting

**MCP server not connecting / silent failure**
Run `pnpm build` in the repo root, the `dist/` directory is not committed and must be built
locally before any `node packages/mcp-server/dist/index.js` config will work.

**"Cannot find module" error in MCP server logs**
You used a relative path in `args`. Replace it with the absolute path to
`/ABSOLUTE/PATH/TO/recap-studio/packages/mcp-server/dist/index.js`. The MCP spec requires
absolute paths because the working directory is undefined when editors spawn child processes.

**Tool calls return empty results in Cursor / VS Code / Codex / Continue.dev**
This can happen with older builds of the MCP server that returned `type: "json"` content
(non-standard). Ensure you are on v0.3 of `@recap-studio/mcp-server` (built from the current
`rebuild/recap-studio` branch) which returns standard `type: "text"` content.

**Windsurf shows "Disconnected" after a few minutes**
Windsurf sends keepalive pings. The v0.3 MCP server handles `ping` with an empty `{}` result
so this should no longer occur. If you see it, rebuild the MCP server and refresh Cascade.

**Gemini CLI, tools receive no env vars**
Gemini sanitises the child process environment. Add every required env var to the `env` map in
`.gemini/settings.json` explicitly (see §5 above).

**Continue.dev, tools do nothing**
Ensure you are in **agent mode**, not ask or chat mode. MCP tools are only invoked in agent mode.
