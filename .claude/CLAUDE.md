## Project

**Recap Studio**

A Claude Code plugin (also a CLI and an optional MCP server) that turns any topic query or a coding session (git diff plus commits) into a cited, dark-mode, mobile-first one-page explainer. The output is ONE self-contained HTML file: all CSS inlined, zero JavaScript, zero external requests. Double-click it and it opens offline, with no server and no `npm install`.

**Core value:** one command produces a polished, double-clickable explainer with cited sources, and the rendered page never phones home.

### Constraints

- **Tech stack**: TypeScript, Node.js 20+, npm workspaces monorepo (`apps/` + `packages/`).
- **Hosted track**: Next.js 15 App Router in `apps/recap-web` (deployed to Vercel).
- **Offline track**: `@recap-studio/html-renderer` emits a single self-contained HTML string.
- **Safe by default**: no network, no deploys, no emails, no secret writes, no destructive git, all off until explicit opt-in.
- **Distribution**: Claude Code plugin via the [Aboudjem/10x](https://github.com/Aboudjem/10x) marketplace; CLI and MCP server for every other editor.
- **Honest figures**: re-derive test counts from a fresh `npm test`, never carry one forward. 13 specialist agents, self-contained offline HTML output. Never inflate a count.

## Build, test, validate

Run from the repo root. All commands need npm (it ships with Node) and Node 20+.

```bash
npm install            # install workspace deps (node_modules is usually present)
npm run build           # build all packages
npm test               # builds the packages, then every workspace suite, hooks, plugin and bundle tests
npm run typecheck          # TypeScript strict across packages
npm run lint               # lint across packages
npm run render:demo        # render the demo topic to artifacts/latest-ai-models/
npm run validate:demo      # deterministic heuristic score (NOT an LLM)
```

Before any release, all of `npm run lint`, `npm run typecheck`, `npm run build`, and the test command above must be green.

## Honesty rule: the validation score

The composite score from `npm run validate:demo` / `recap validate` is produced by **deterministic heuristics** (structure, citation presence, word counts, secret and fluff scans). It does NOT fetch sources and does NOT call an LLM. The 13 specialist agents run only at skill runtime inside Claude Code via `/recap`. Every surface that shows a score must repeat this caveat.

## Contributor notes (portability and discoverability layer)

These notes record the gotchas introduced by the multi-CLI install and discoverability layer. Keep them current when you touch the related files.

### Host-agnostic agents (issue #167 rationale)

The 13 agent prompt files in `agents/` carry only `name`, `description`, and `tools` in their frontmatter. They intentionally carry **no `model:` pin**. A pinned `model:` (or even the literal `model: inherit`, which is a Claude-Code-only keyword) is rejected by some host CLIs, for example OpenCode, as an unknown model id. Dropping the pin lets every host (Claude Code, Cursor, Codex, Gemini, OpenCode, and the rest) fall back to its own default model, so the same plugin works everywhere. The cost/quality split that worked well in practice (haiku for lookups, sonnet for synthesis and review) is documented in `AGENTS.md` as a suggestion, not enforced in frontmatter.

### Multi-CLI installer target directories

`install.sh` and `install.ps1` symlink the five skills (`recap`, `recap-topic`, `recap-session`, `recap-setup`, `recap-validate`) into a CLI's skills directory. Current map:

| Platform | Directory | Style |
|:--|:--|:--|
| gemini, codex, opencode, pi | `~/.agents/skills` | per-skill |
| vscode, copilot | `~/.copilot/skills` | per-skill |
| trae | `~/.trae/skills` | per-skill |
| vibe | `~/.vibe/skills` | per-skill |
| openclaw | `~/.openclaw/skills` | folder |
| antigravity | `~/.gemini/antigravity/skills` | folder |
| hermes, cline, kimi | `~/.<cli>/skills` | folder |

That table is now the **`--legacy`** path only. `install.sh`'s default path delegates to
`npx --yes skills@1.9.0 add Aboudjem/recap-studio -a <agent> -g -y`, mapping the 13 platform ids
to the skills-CLI agent codes in `agent_code()`: gemini to `gemini-cli`, vibe to `mistral-vibe`,
vscode and copilot to `github-copilot`, hermes to `hermes-agent`, kimi to `kimi-code-cli`, and the
rest to themselves. Every code was checked against
`https://github.com/vercel-labs/skills#supported-agents`. Delegating means the install directory
stays current without this table: the CLI already puts codex skills in `~/.codex/skills/` and
gemini's in `~/.gemini/skills/`, where the legacy table still writes both to `~/.agents/skills`.

Keep `platform_target()` (and `install.ps1`'s `Get-PlatformTarget`) working anyway, because
`--legacy` is the offline and no-npx path. The MCP server
(`node bin/recap.mjs mcp`) is the universal fallback and is unaffected by either
path. Per-editor snippets live in `docs/editors.md`; `docs/multi-editor.md` is a stub pointing
there.

### Manifests to keep in sync

Three plugin manifests must stay aligned on `name`, `version`, and `description`, plus the `skills` list and the `mcp` block (Recap Studio is dual-mode, so the MCP block ships in all three): `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.copilot-plugin/plugin.json`. The `.claude-plugin/plugin.json` uses the Claude-Code-native `mcpServers` shape; the cursor and copilot manifests carry the same server under a flat `mcp` key.

### Version-bump checklist

When cutting a release, bump the version in every file below. `tests/plugin.test.mjs` fails when one drifts.

- `package.json` (root), `packages/cli/package.json`, `packages/mcp-server/package.json`
- `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.copilot-plugin/plugin.json`
- `VERSION` in `packages/cli/src/index.ts` and `SERVER_VERSION` in `packages/mcp-server/src/index.ts`, then `npm run build:packages && npm run bundle`
- `server.json`: run `npm run pack:mcpb -- --write` (version, release URL and sha256 of the `.mcpb`)
- `CHANGELOG.md`

`bin/recap.mjs` is generated by `scripts/build-bundle.mjs` and committed. Rebuild it after any change
under `packages/`; `npm test` fails on drift. The release workflow rebuilds the `.mcpb`, checks its
sha256 against `server.json`, and attaches it to the GitHub release.

### GitHub Pages vs Vercel (why both)

Recap Studio uses two distinct hosting surfaces, on purpose:

- **Vercel** runs the full hosted Next.js app (`apps/recap-web`). It is the dynamic, server-rendered track. The deploy is gated behind config plus explicit consent, defined in `vercel.json` and the `scripts/deploy-*.sh` helpers. This is untouched by the Pages work.
- **GitHub Pages** serves a small static landing page (`site/index.html`) plus one real recap HTML sample, deployed by `.github/workflows/deploy-pages.yml`. It is a zero-cost shop window that demonstrates the self-contained offline output without spinning up the Next.js app. It rebuilds nothing: it reuses the already-shipped `.github/assets/demo.gif` and a pre-rendered `artifacts/latest-ai-models/recap-latest-ai-models.html` sample.

The decision: keep Vercel for the live app, add Pages only as a static demo. The two never share state and never deploy each other. Pages must be set to deploy from GitHub Actions in the repo settings.

### Distribution without npm

Nothing is published to npm from this repo (the `recap-studio` name on npm is an old placeholder).
The CLI and the MCP server ship as `bin/recap.mjs`: in the plugin, through
`npx -y github:Aboudjem/recap-studio`, and as `recap-studio.mcpb` on each GitHub release, which
`server.json` lists for the official MCP registry.
