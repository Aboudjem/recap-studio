# Phase 6 — Multi-Editor / MCP + CLI Integration Audit

_Run 2026-05-29. Every finding is evidence-backed with file:line or command output._  
_Auditor: Multi-editor / MCP+CLI Integration Auditor. Branch: `rebuild/recap-studio`._  
_Confidence labels: `confirmed | likely | uncertain | blocked | needs-user-approval`_

---

## Scope

STANDARDS require recap-studio to work **first-class** as a standalone MCP server AND CLI in:
Claude Code, Cursor, VS Code (Copilot), OpenAI Codex CLI, Google Gemini CLI, Windsurf, Continue.dev —
with copy-paste setup per editor and a smoke test per editor path.

This audit assesses the current gap and delivers a concrete plan: minimal MCP tool surface,
a real CLI entrypoint (`npx recap "<topic>"`), per-editor config blocks, and a per-editor smoke test.

---

## 1. Current State — What Exists

### 1.1 MCP Server

**File:** `packages/mcp-server/src/index.ts`  
**Confidence:** confirmed

A hand-rolled JSON-RPC 2.0 stdio server exists. It:
- Handles `initialize`, `tools/list`, `tools/call` methods.
- Declares `protocolVersion: "2025-06-18"` — this matches the MCP spec version string.
- Is compiled to `packages/mcp-server/dist/index.js` (verified: dist/ exists post-build).
- Is registered in `.claude-plugin/plugin.json` as:

```json
"mcpServers": {
  "recap-studio-tools": {
    "command": "node",
    "args": ["packages/mcp-server/dist/index.js"],
    "optional": true
  }
}
```

**Critical observation:** the `args` path is relative (`packages/mcp-server/dist/index.js`).
When Claude Code (or any editor) spawns this process, the working directory may not be the repo
root (MCP spec debugging guide: "the working directory may be undefined, like `/` on macOS").
This means the server will fail silently for any user who has not `cd`-ed into the repo root first.
**All editors require absolute paths in MCP config.** (`confirmed`: modelcontextprotocol.io/docs/tools/debugging, "Working directory" section)

### 1.2 The 10 Registered MCP Tools (confirmed: `packages/mcp-server/src/tools.ts`)

| Tool name | What it does | Status |
|---|---|---|
| `create_run_artifact` | Write artifact file to `artifacts/<slug>/` | Functional |
| `read_run_artifact` | Read artifact file | Functional |
| `cache_source` | Append research source to `.recap-studio/cache/sources.jsonl` | Functional |
| `generate_mermaid_diagram` | Validate Mermaid code prefix | Functional |
| `render_page_screenshot` | Playwright screenshot | **Scaffold — always returns `skipped: true`** |
| `run_accessibility_scan` | axe-core scan | **Scaffold — always returns `skipped: true`** |
| `run_lighthouse_summary` | Lighthouse summary | **Scaffold — always returns `skipped: true`** |
| `deploy_vercel_preview` | Trigger Vercel deploy | Functional (gated) |
| `send_email_draft` | Compose email draft | Functional (gated) |
| `validate_content` | Run deterministic validation suite | Functional |

**Key gap:** NONE of the 10 tools does what a non-Claude-Code editor user would actually want:
**generate a recap page**. The core workflow — research a topic, produce `RecapPageContent` JSON,
write `apps/recap-web/src/content/<slug>.json`, build the page — is implemented entirely in
`skills/recap-topic/SKILL.md` (the Claude Code skill orchestrator), NOT in any MCP tool.

An editor that only has the MCP server connected (Cursor, VS Code, Codex, Gemini, Windsurf,
Continue.dev) gets 10 helper/persistence tools but **zero capability to actually generate a recap**.
This is the central gap. (`confirmed`: `packages/mcp-server/src/tools.ts` lines 86–319 — no
`generate_recap`, no `run_pipeline`, no equivalent)

### 1.3 CLI Entrypoint

**File:** `npm-placeholder/bin/recap-studio.mjs`  
**Confidence:** confirmed

The published `recap-studio` npm package (v0.2.0) ships a single binary: `recap-studio`.
When invoked, it prints a redirect message pointing users to the Claude Code marketplace and
`git clone` path. It does **not**:
- Accept a topic argument and generate a recap.
- Start the MCP server.
- Run any part of the pipeline.

```js
// npm-placeholder/bin/recap-studio.mjs lines 14-53 (verbatim)
const arg = process.argv[2];
// ... prints help text and exits 0
// No topic generation, no MCP server start, no pipeline invocation.
```

**There is no functional `npx recap "<topic>"` command.** `npx recap-studio "React hooks"` prints
a help page and exits. (`confirmed`)

### 1.4 Plugin Registration (Claude Code Only)

**File:** `.claude-plugin/plugin.json`  
**Confidence:** confirmed

The plugin correctly registers the MCP server for Claude Code. However:
1. The server path is **relative** (see §1.1 — breaks when CWD is not repo root).
2. The plugin is marked `optional: true`, so failures are silent.
3. No `llms.txt` or `AGENTS.md` exists to help non-Claude editors discover the plugin structure.
   (`confirmed`: `ls /Users/adamboudj/projects/recap-studio/` — neither file present)

### 1.5 Transport Protocol Compliance

The hand-rolled server (`packages/mcp-server/src/index.ts`) implements:
- `initialize` → returns `protocolVersion: "2025-06-18"`, `capabilities: { tools: {} }`
- `tools/list` → returns tool definitions with `inputSchema`
- `tools/call` → dispatches to handler, returns `content: [{ type: "json", json: ... }]`

**Gap:** The MCP spec requires content items to use `type: "text"` for text responses, not
`type: "json"`. The `json` content type is non-standard and may be rejected by strict MCP clients
(Cursor, VS Code Copilot). (`likely` — MCP spec `specification/latest/server/tools` content
types are `text`, `image`, `resource`; `json` is not listed)

**Gap:** No `notifications/initialized` sent after `initialize`. Some clients (Continue.dev) wait
for it. (`uncertain` — depends on client implementation)

**Gap:** The server does not implement `ping` / keepalive. Long-running sessions in VS Code and
Windsurf send periodic pings; a non-response causes the server to be marked disconnected.
(`likely` — confirmed behavior in Windsurf docs: `docs.windsurf.com/windsurf/cascade/mcp`)

---

## 2. Per-Editor Config Format Reference (2026, sourced)

All configs below use a hypothetical absolute install path. In practice, users should substitute
their actual repo path or use an `npx`-invocable published package.

### 2.1 Claude Code

**Config mechanism:** `claude mcp add` CLI command or `.mcp.json` in project root.  
**Source:** `code.claude.com/docs/en/mcp` (verified 2026-05-29)

**Project-scoped `.mcp.json`** (checked into repo, shared with team):
```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/absolute/path/to/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

**Or via CLI (local scope, private to current user):**
```bash
claude mcp add --transport stdio recap-studio-tools \
  -- node /absolute/path/to/recap-studio/packages/mcp-server/dist/index.js
```

**Or via CLI (project scope, shared):**
```bash
claude mcp add --transport stdio --scope project recap-studio-tools \
  -- node /absolute/path/to/recap-studio/packages/mcp-server/dist/index.js
```

**Smoke test:**
```bash
claude mcp list          # recap-studio-tools should appear
# In Claude Code session:
/mcp                     # server should show tool count = 10
```

**Current blocker:** The plugin.json `args` path is relative. For the plugin path to work,
Claude Code must be launched from the repo root, or the path must be made absolute using
`${CLAUDE_PLUGIN_ROOT}` (which is supported in plugin MCP configs).

**Fix:**
```json
"args": ["${CLAUDE_PLUGIN_ROOT}/packages/mcp-server/dist/index.js"]
```

### 2.2 Cursor IDE

**Config file:** `.cursor/mcp.json` (project-scoped) or `~/.cursor/mcp.json` (global).  
**Source:** `cursor.com/docs/mcp` (verified 2026-05-29 via web search)

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/absolute/path/to/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

**Or with npx (once published as `@recap-studio/mcp-server`):**
```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "npx",
      "args": ["-y", "@recap-studio/mcp-server"]
    }
  }
}
```

**Smoke test:**
1. Add `.cursor/mcp.json` to repo root.
2. Reload Cursor window (`Cmd+Shift+P` → "Reload Window").
3. Open Cursor Settings → MCP — server should show as "Connected" with 10 tools listed.
4. In chat: `@recap-studio-tools validate_content with slug "latest-ai-models"` → should return
   a validation JSON with a score.

**Blocker:** `content: [{ type: "json", json: ... }]` response format — Cursor uses the standard
MCP SDK and may reject non-`text` content type. Needs fix before smoke test passes (see §3.3).

### 2.3 VS Code (GitHub Copilot / MCP extension)

**Config file:** `.vscode/mcp.json` (workspace-scoped, checked in) or user-scope via
"MCP: Open User Configuration" command.  
**Source:** `code.visualstudio.com/docs/copilot/chat/mcp-servers` (verified 2026-05-29)

```json
{
  "servers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/absolute/path/to/recap-studio/packages/mcp-server/dist/index.js"]
    }
  }
}
```

**Note:** VS Code uses `"servers"` as the top-level key (not `"mcpServers"`). This is
VS Code-specific and differs from Claude Code / Cursor / Windsurf format.

**Smoke test:**
1. Add `.vscode/mcp.json` to repo root.
2. Reload VS Code window.
3. Open GitHub Copilot Chat. MCP tools should appear in the tool picker.
4. In Copilot Chat (agent mode): `Use recap-studio-tools to validate the content at slug latest-ai-models` → should return validation report.

**Blocker:** Same `type: "json"` response format issue as Cursor (§3.3).

### 2.4 OpenAI Codex CLI

**Config file:** `~/.codex/config.toml` (user-scoped) or `.codex/config.toml` (project-scoped,
trusted projects only).  
**Source:** `developers.openai.com/codex/mcp` (verified 2026-05-29)

```toml
[mcp_servers.recap-studio-tools]
command = "node"
args = ["/absolute/path/to/recap-studio/packages/mcp-server/dist/index.js"]
startup_timeout_sec = 15
```

**Or via CLI:**
```bash
codex mcp add recap-studio-tools -- node /absolute/path/to/recap-studio/packages/mcp-server/dist/index.js
```

**Smoke test:**
```bash
codex --tools recap-studio-tools \
  "Call validate_content with slug latest-ai-models and show the score."
```

**Blocker:** Codex uses a strict MCP client. The `type: "json"` content issue applies here too.
Additionally, Codex config is TOML while all other editors use JSON — a separate config file
and documentation path is required.

### 2.5 Google Gemini CLI

**Config file:** `~/.gemini/settings.json` (user-scoped) or `.gemini/settings.json`
(project-scoped).  
**Source:** `geminicli.com/docs/tools/mcp-server/` (verified 2026-05-29)

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/absolute/path/to/recap-studio/packages/mcp-server/dist/index.js"],
      "cwd": "/absolute/path/to/recap-studio",
      "trust": false
    }
  }
}
```

**Note:** Gemini CLI performs environment sanitization — env vars are NOT automatically forwarded.
Any env vars the MCP server needs (e.g. `RESEND_API_KEY`, `VERCEL_TOKEN`) must be listed
explicitly in the `env` key.

**Smoke test:**
```bash
gemini
# In Gemini CLI session:
# "Use recap-studio-tools to validate the latest-ai-models content."
```

**Blocker:** Same `type: "json"` content issue. Gemini CLI also expects `notifications/initialized`
after `initialize` (`uncertain` — Gemini CLI MCP client behavior not fully documented).

### 2.6 Windsurf IDE

**Config file:** `~/.codeium/windsurf/mcp_config.json`  
**Source:** `docs.windsurf.com/windsurf/cascade/mcp` (verified 2026-05-29)

```json
{
  "mcpServers": {
    "recap-studio-tools": {
      "command": "node",
      "args": ["/absolute/path/to/recap-studio/packages/mcp-server/dist/index.js"],
      "env": {
        "RECAP_STUDIO_ROOT": "/absolute/path/to/recap-studio"
      }
    }
  }
}
```

**Variable interpolation** (Windsurf-specific):
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

**Smoke test:**
1. Edit `~/.codeium/windsurf/mcp_config.json` with the above block.
2. Reload Windsurf (Cascade panel → MCP settings → refresh).
3. In Cascade: `@recap-studio-tools validate_content slug: "latest-ai-models"` → should return
   a validation report.

**Blocker:** Windsurf sends periodic keepalive pings. The current server only handles
`initialize`, `tools/list`, `tools/call`. An unhandled ping will likely cause the server to return
a `-32601 method not found` error, which Windsurf may interpret as a disconnect (`likely`).

### 2.7 Continue.dev

**Config file:** `~/.continue/config.yaml` (global) or `.continue/config.yaml` (workspace).  
**Source:** `docs.continue.dev/customize/deep-dives/mcp` (verified 2026-05-29)

```yaml
mcpServers:
  - name: recap-studio-tools
    command: node
    args:
      - /absolute/path/to/recap-studio/packages/mcp-server/dist/index.js
    cwd: /absolute/path/to/recap-studio
```

**Alternative — drop a JSON config file** (Continue.dev auto-discovers these):
```bash
cp /path/to/.cursor/mcp.json ~/.continue/mcpServers/recap-studio-tools.json
```

**Note:** MCP tools in Continue.dev only work in **agent mode**. Users must switch to agent mode
before testing.

**Smoke test:**
1. Add the `mcpServers` block to `~/.continue/config.yaml`.
2. Reload VS Code / Continue extension.
3. Switch to agent mode in Continue.
4. In chat: `Use recap-studio-tools to validate latest-ai-models` → validation report expected.

**Blockers:** Same `type: "json"` issue. Continue.dev may require `notifications/initialized`
(`uncertain` — Continue MCP client behavior source: `docs.continue.dev/customize/deep-dives/mcp`).

---

## 3. Concrete Gap Analysis

### 3.1 GAP-01 — No `generate_recap` MCP Tool (BLOCKER for all non-Claude-Code editors)

**Severity:** blocker  
**Confidence:** confirmed  
**Evidence:** `packages/mcp-server/src/tools.ts` lines 86–319 — no tool generates page content.

The core workflow (research + generate `RecapPageContent` + write JSON + build) lives in
`skills/recap-topic/SKILL.md`. Skills are Claude Code-only constructs — they are CLAUDE.md-style
agent orchestration prompts interpreted by Claude Code. No other editor can invoke a "skill."

**Impact:** A Cursor, VS Code, Codex, Gemini, Windsurf, or Continue.dev user who connects the
MCP server gets only persistence helpers (artifact read/write, source cache) and stub tools
(screenshot, a11y, lighthouse all return `skipped: true`). There is zero functional path to
actually generating a recap page from these editors.

**Fix:** Add a `generate_recap` tool to `packages/mcp-server/src/tools.ts` that:
1. Accepts `{ topic: string, depth?: string, style?: string }` (for topic mode) or
   `{ mode: "session", ref?: string }` (for session mode).
2. Executes the pipeline steps inline OR delegates to a Node.js script that replicates the
   skill orchestration without Claude Code.
3. Writes `apps/recap-web/src/content/<slug>.json` and updates `active-content.json`.
4. Returns `{ ok: true, slug, contentPath, validationScore }`.

Minimum viable version: accept a pre-authored `RecapPageContent` JSON and just write + validate it
(1-2 hours). Full research pipeline version requires more design (see §4).

### 3.2 GAP-02 — No Functional CLI (BLOCKER for `npx recap` UX)

**Severity:** blocker  
**Confidence:** confirmed  
**Evidence:** `npm-placeholder/bin/recap-studio.mjs` lines 1–53 — prints help, exits 0.

`npx recap-studio "React hooks"` or `npx recap-studio --mcp-server` does nothing useful.
There is no real CLI entrypoint that:
- Starts the MCP server in stdio mode (needed for `npx`-based MCP config).
- Accepts a topic and runs the pipeline.
- Provides a `--help` that describes actual capabilities.

**Fix:** Replace `npm-placeholder/bin/recap-studio.mjs` with a real entrypoint:
```
recap-studio --mcp            → start MCP server (stdio, for npx-based editor config)
recap-studio "<topic>"        → run topic pipeline (requires Claude API key)
recap-studio session          → run session pipeline
recap-studio validate [slug]  → run validation
recap-studio --version        → print version
```

This is what enables all editors to use `npx -y recap-studio --mcp` as the server command,
without requiring a local clone.

### 3.3 GAP-03 — Non-Standard `type: "json"` Content in Tool Responses

**Severity:** high  
**Confidence:** likely  
**Evidence:** `packages/mcp-server/src/index.ts` line 75:
```ts
result: { content: [{ type: "json", json: await callTool(req.params as ToolCall) }] }
```
MCP spec (`specification/latest/server/tools`) defines content types as `text`, `image`,
`resource`. The `json` type is not listed. Standard MCP SDK clients (used by Cursor, VS Code,
Continue.dev) will likely reject or ignore `type: "json"` content, causing tool calls to silently
return empty results.

**Fix:** Change to standard `type: "text"` with JSON-serialized content:
```ts
result: {
  content: [{
    type: "text",
    text: JSON.stringify(await callTool(req.params as ToolCall), null, 2)
  }]
}
```

### 3.4 GAP-04 — Relative Path in `plugin.json` MCP Args

**Severity:** high  
**Confidence:** confirmed  
**Evidence:** `.claude-plugin/plugin.json` line 27: `"args": ["packages/mcp-server/dist/index.js"]`

MCP debugging docs (modelcontextprotocol.io/docs/tools/debugging): "Always use absolute paths."
The current relative path works only when CWD is repo root.

**Fix:** Use `${CLAUDE_PLUGIN_ROOT}` (supported in Claude Code plugin MCP configs per
`code.claude.com/docs/en/mcp`, "Plugin-provided MCP servers" section):
```json
"args": ["${CLAUDE_PLUGIN_ROOT}/packages/mcp-server/dist/index.js"]
```

### 3.5 GAP-05 — Unhandled MCP Methods (ping, notifications/initialized)

**Severity:** medium  
**Confidence:** likely  
**Evidence:** `packages/mcp-server/src/index.ts` lines 55–93 — only `initialize`, `tools/list`,
`tools/call` handled; all others return `-32601 method not found`.

Windsurf sends keepalive pings. Some clients send `notifications/initialized`. These will get
error responses, potentially causing disconnects or silent failures.

**Fix:** Add a catch-all that returns a graceful no-op for notification methods and a proper
response for `ping`:
```ts
case "ping":
  return { jsonrpc: "2.0", id, result: {} };
// For notifications (no id), don't respond at all.
```

### 3.6 GAP-06 — No `dist/` Pre-Built in Repo; No Build Step in Install Docs

**Severity:** medium  
**Confidence:** confirmed  
**Evidence:** `packages/mcp-server/dist/` exists locally (post-build) but is in `.gitignore`
(confirmed: `.claude-plugin/plugin.json` references `dist/index.js` which requires `pnpm build`).
Prior audit `04-dx-audit.md` item F-15 confirms this: "mcp-server/dist/index.js missing pre-build."

For a user who clones the repo and adds the MCP config to their editor without running `pnpm build`,
the server binary does not exist. The connection attempt silently fails (Claude Code: `optional:
true`; other editors: may show error).

**Fix:** Either (a) add a `postinstall` script that builds the MCP server, or (b) publish
`@recap-studio/mcp-server` to npm so editors can use `npx -y @recap-studio/mcp-server` without
requiring a local build.

### 3.7 GAP-07 — No Per-Editor Setup Documentation

**Severity:** medium  
**Confidence:** confirmed  
**Evidence:** `docs/` directory listing — no `docs/editors/` folder, no per-editor setup guide.
`README.md` — only mentions Claude Code; no mention of Cursor, VS Code, Codex, Gemini, Windsurf,
or Continue.dev.

**Fix:** Add `docs/editors/` with one file per editor (or a single `docs/editors/README.md`)
containing the copy-paste config block and smoke test from §2 of this audit.

### 3.8 GAP-08 — `validate_content` Tool Requires Repo-Relative File Paths

**Severity:** medium  
**Confidence:** confirmed  
**Evidence:** `packages/mcp-server/src/tools.ts` lines 307–314:
```ts
const file = join(
  resolve(process.cwd(), "apps", "recap-web", "src", "content"),
  `${slug}.json`,
);
const fallback = join(resolve(process.cwd(), "fixtures", "topics"), `${slug}.json`);
```
Both paths use `process.cwd()`. If the server is started by an editor from a different CWD,
both paths will be wrong. `validate_content` is the one functional tool an external editor would
actually want to use — and it will fail for any editor that doesn't set CWD to repo root.

**Fix:** Accept an absolute `contentPath` parameter as an alternative to `slug`, or read
`CLAUDE_PROJECT_DIR` (set by Claude Code) / `RECAP_STUDIO_ROOT` (custom env var) as the base.

---

## 4. Minimal MCP Tool Surface (Recommended Addition)

The current 10 tools serve the Claude Code skill pipeline as a persistence layer. For first-class
multi-editor support, add these **3 tools** to `packages/mcp-server/src/tools.ts`:

### Tool 1: `generate_recap` (CORE)

```ts
// Input
const GenerateRecap = z.object({
  topic: z.string().min(1).optional(),
  mode: z.enum(["topic", "session"]).default("topic"),
  contentJson: z.string().optional(), // pre-authored RecapPageContent JSON string
  ref: z.string().optional(),         // git ref for session mode
  slug: z.string().optional(),        // output slug (default: slugified topic)
});

// Handler: if contentJson is provided, parse + validate + write it (fast path).
// If only topic is provided, return an error explaining that full pipeline
// requires Claude Code skills, and suggest the contentJson path.
// This gives external editors a usable "write + validate" path without the
// full research pipeline.
```

### Tool 2: `get_recap_status`

Returns the current active content slug, validation score, and build status.
Lets any editor widget show a "current recap" summary without needing file access.

### Tool 3: `list_recap_slugs`

Lists all available content slugs in `apps/recap-web/src/content/` and `fixtures/topics/`.
Lets editors autocomplete the `slug` parameter for `validate_content` and `read_run_artifact`.

---

## 5. CLI Design (`npx recap-studio`)

Replace `npm-placeholder/bin/recap-studio.mjs` with a real CLI in `packages/mcp-server/src/cli.ts`
(or a dedicated `packages/cli/` package). Export the binary as `recap-studio` in the published
npm package.

### Command Surface

```
recap-studio [options] [topic]

Commands:
  recap-studio "<topic>"          Generate a topic recap (requires ANTHROPIC_API_KEY)
  recap-studio session [ref]      Recap a coding session (requires git repo)
  recap-studio validate [slug]    Run deterministic validation on a content slug
  recap-studio --mcp              Start MCP server in stdio mode (for editor config)
  recap-studio --version          Print version

Options:
  --depth    beginner|intermediate|expert  (default: beginner)
  --style    dark|light|auto               (default: dark)
  --out      Output path for standalone HTML (default: ./recap-out/)
  --fixture  Use fixture mode, no network
```

### Editor config using npx (no clone required)

Once `@recap-studio/mcp-server` is published (or `recap-studio --mcp` is wired up in the npm
placeholder), all editors can use:

```json
{
  "command": "npx",
  "args": ["-y", "recap-studio", "--mcp"]
}
```

This is the zero-install path that makes multi-editor setup a copy-paste one-liner.

---

## 6. Per-Editor Smoke Tests

| Editor | Config file | Smoke test command | Expected result |
|---|---|---|---|
| Claude Code | `.mcp.json` or `claude mcp add` | `/mcp` in session | 10 tools shown; `validate_content` returns score |
| Cursor | `.cursor/mcp.json` | Cursor Settings → MCP → Connected (10 tools) | `validate_content` returns JSON score |
| VS Code Copilot | `.vscode/mcp.json` | Copilot Chat (agent mode) → tool picker shows recap-studio-tools | `validate_content` in chat returns report |
| Codex CLI | `~/.codex/config.toml` | `codex --tools recap-studio-tools "validate latest-ai-models"` | Returns validation JSON |
| Gemini CLI | `~/.gemini/settings.json` | In Gemini session: "Use recap-studio-tools to validate latest-ai-models" | Returns validation report |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | Cascade MCP settings → Connected; in chat: `@recap-studio-tools` | Responds with 10 tools |
| Continue.dev | `~/.continue/config.yaml` | Agent mode → tool `validate_content` call | Returns validation JSON |

**Prerequisite for all smoke tests:** `pnpm build` must have been run in the repo root to produce
`packages/mcp-server/dist/index.js`. Add this to install docs.

---

## 7. Priority-Ordered Action Plan

### P0 — Fix before any multi-editor claim is valid

1. **Fix `type: "json"` → `type: "text"` in `index.ts:75`** (5 min, 1-line change).
   File: `packages/mcp-server/src/index.ts` line 75.
   Unblocks Cursor, VS Code, Codex, Gemini, Continue.dev.

2. **Fix relative path in `plugin.json`** (5 min).
   File: `.claude-plugin/plugin.json` line 27.
   Change `"args": ["packages/mcp-server/dist/index.js"]` to
   `"args": ["${CLAUDE_PLUGIN_ROOT}/packages/mcp-server/dist/index.js"]`.

3. **Fix `validate_content` CWD-dependency** (30 min).
   File: `packages/mcp-server/src/tools.ts` lines 307–314.
   Read `process.env.RECAP_STUDIO_ROOT ?? process.env.CLAUDE_PROJECT_DIR ?? process.cwd()` as
   the base path.

4. **Handle `ping` and unknown notification methods** (15 min).
   File: `packages/mcp-server/src/index.ts` lines 55–93.
   Add `case "ping": return { jsonrpc: "2.0", id, result: {} };` and a no-op for methods without
   an `id` (notifications).

### P1 — Required for multi-editor "first-class" claim

5. **Add `generate_recap` tool (fast path: write pre-authored JSON + validate)** (2-4 hours).
   This is the minimum for external editors to do anything useful beyond validation.

6. **Replace npm placeholder with real `--mcp` CLI entrypoint** (4-8 hours).
   Enables `npx -y recap-studio --mcp` as the universal editor config command.

7. **Add `docs/editors/README.md`** with copy-paste config blocks for all 7 editors (2 hours).
   Include the smoke test for each. Link from main README.

8. **Add `pnpm build` to install quickstart** (5 min).
   Fixes the silent "dist/ missing" failure for all source-clone users.

### P2 — Polish and completeness

9. **Add `list_recap_slugs` and `get_recap_status` tools** (1 hour).
   Quality-of-life tools for editor autocomplete and status display.

10. **Add `.mcp.json` (project-scoped) to repo root** pre-configured for source-clone users.
    Cursor, VS Code, and Claude Code all auto-discover this file.

11. **Publish `@recap-studio/mcp-server` to npm** so editors can use `npx -y @recap-studio/mcp-server`.
    Decouples MCP server availability from having a local clone.

12. **Add `llms.txt` and `AGENTS.md`** (5 min each).
    Machine-readable discovery for AI-powered editors.

---

## 8. Summary of Findings

| ID | Finding | Severity | Confidence | P-level |
|---|---|---|---|---|
| G-01 | No `generate_recap` tool — MCP server cannot generate a recap page | blocker | confirmed | P0→P1 |
| G-02 | npm CLI is a redirect stub — `npx recap-studio` does nothing useful | blocker | confirmed | P1 |
| G-03 | `type: "json"` content type non-standard — breaks Cursor/VS Code/Codex/Gemini/Continue | high | likely | P0 |
| G-04 | Relative path in plugin.json MCP args — fails when CWD ≠ repo root | high | confirmed | P0 |
| G-05 | `validate_content` uses `process.cwd()` — fails for all non-CWD-root editors | medium | confirmed | P0 |
| G-06 | No `ping` / unknown method handling — Windsurf keepalives cause disconnects | medium | likely | P0 |
| G-07 | `dist/` not pre-built; no build step in install docs — silent MCP failure | medium | confirmed | P1 |
| G-08 | No per-editor setup docs (Cursor, VS Code, Codex, Gemini, Windsurf, Continue.dev) | medium | confirmed | P1 |
| G-09 | No `notifications/initialized` sent — may break Continue.dev and Gemini CLI | low | uncertain | P2 |
| G-10 | No `list_recap_slugs` / `get_recap_status` tools — poor DX for external editors | low | likely | P2 |
| G-11 | `@recap-studio/mcp-server` not published to npm — requires local clone for all | low | confirmed | P2 |
| G-12 | `llms.txt` and `AGENTS.md` absent — no machine-readable discovery for AI editors | low | confirmed | P2 |

---

## Sources

- MCP debugging guide (working directory, absolute paths): https://modelcontextprotocol.io/docs/tools/debugging
- Claude Code MCP docs (scopes, plugin MCP, `CLAUDE_PROJECT_DIR`, `.mcp.json`): https://code.claude.com/docs/en/mcp
- Cursor MCP config (`.cursor/mcp.json`, `~/.cursor/mcp.json`): https://cursor.com/docs/mcp
- VS Code Copilot MCP (`.vscode/mcp.json`, `"servers"` key): https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- OpenAI Codex CLI MCP (TOML format, `~/.codex/config.toml`): https://developers.openai.com/codex/mcp
- Gemini CLI MCP (`~/.gemini/settings.json`, env sanitization): https://geminicli.com/docs/tools/mcp-server/
- Windsurf MCP (`~/.codeium/windsurf/mcp_config.json`, keepalive): https://docs.windsurf.com/windsurf/cascade/mcp
- Continue.dev MCP (config.yaml `mcpServers`, agent mode only): https://docs.continue.dev/customize/deep-dives/mcp
