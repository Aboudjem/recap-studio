## Project

**Recap Studio**

A Claude Code plugin (also a CLI and an optional MCP server) that turns any topic query or a coding session (git diff plus commits) into a cited, dark-mode, mobile-first one-page explainer. The output is ONE self-contained HTML file: all CSS inlined, zero JavaScript, zero external requests. Double-click it and it opens offline, with no server and no `npm install`.

**Core value:** one command produces a polished, double-clickable explainer with cited sources, and the rendered page never phones home.

### Constraints

- **Tech stack**: TypeScript, Node.js 20+, pnpm 10 monorepo (`apps/` + `packages/`).
- **Hosted track**: Next.js 15 App Router in `apps/recap-web` (deployed to Vercel).
- **Offline track**: `@recap-studio/html-renderer` emits a single self-contained HTML string.
- **Safe by default**: no network, no deploys, no emails, no secret writes, no destructive git, all off until explicit opt-in.
- **Distribution**: Claude Code plugin via the [Aboudjem/10x](https://github.com/Aboudjem/10x) marketplace; CLI and MCP server for every other editor.
- **Honest figures**: 43 tests across 5 test-bearing packages (`design-system` ships none), 13 specialist agents, self-contained offline HTML output. Never inflate a count.

## Build, test, validate

Run from the repo root. All commands need pnpm 10 and Node 20+.

```bash
pnpm install            # install workspace deps (node_modules is usually present)
pnpm -w build           # build all packages
pnpm -r --if-present run test   # 43 tests, 0 fail, 5 test-bearing packages
pnpm typecheck          # TypeScript strict across packages
pnpm lint               # lint across packages
pnpm render:demo        # render the demo topic to artifacts/latest-ai-models/
pnpm validate:demo      # deterministic heuristic score (NOT an LLM)
```

Before any release, all of `pnpm lint`, `pnpm typecheck`, `pnpm -w build`, and the test command above must be green.

## Honesty rule: the validation score

The composite score from `pnpm validate:demo` / `recap validate` is produced by **deterministic heuristics** (structure, citation presence, word counts, secret and fluff scans). It does NOT fetch sources and does NOT call an LLM. The 13 specialist agents run only at skill runtime inside Claude Code via `/recap`. Every surface that shows a score must repeat this caveat.

## Contributor notes (portability and discoverability layer)

These notes record the gotchas introduced by the multi-CLI install and discoverability layer. Keep them current when you touch the related files.

### Host-agnostic agents (issue #167 rationale)

The 13 agent prompt files in `agents/` carry only `name`, `description`, and `tools` in their frontmatter. They intentionally carry **no `model:` pin**. A pinned `model:` (or even the literal `model: inherit`, which is a Claude-Code-only keyword) is rejected by some host CLIs, for example OpenCode, as an unknown model id. Dropping the pin lets every host (Claude Code, Cursor, Codex, Gemini, OpenCode, and the rest) fall back to its own default model, so the same plugin works everywhere. The cost/quality split that worked well in practice (haiku for lookups, sonnet for synthesis and review) is documented in `AGENTS.md` as a suggestion, not enforced in frontmatter.

### Multi-CLI installer target directories

`install.sh` and `install.ps1` symlink the four skills (`recap-topic`, `recap-session`, `recap-setup`, `recap-validate`) into a CLI's skills directory. Current map:

| Platform | Directory | Style |
|:--|:--|:--|
| gemini, codex, opencode, pi | `~/.agents/skills` | per-skill |
| vscode, copilot | `~/.copilot/skills` | per-skill |
| trae | `~/.trae/skills` | per-skill |
| vibe | `~/.vibe/skills` | per-skill |
| openclaw | `~/.openclaw/skills` | folder |
| antigravity | `~/.gemini/antigravity/skills` | folder |
| hermes, cline, kimi | `~/.<cli>/skills` | folder |

These conventions change between CLI releases. When one drifts, update `install.sh` (`platform_target`), `install.ps1` (`Get-PlatformTarget`), and the install matrix in the README together. The MCP server (`node packages/mcp-server/dist/index.js`) is the universal fallback and is unaffected by this table.

### Manifests to keep in sync

Three plugin manifests must stay aligned on `name`, `version`, and `description`, plus the `skills` list and the `mcp` block (Recap Studio is dual-mode, so the MCP block ships in all three): `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.copilot-plugin/plugin.json`. The `.claude-plugin/plugin.json` uses the Claude-Code-native `mcpServers` shape; the cursor and copilot manifests carry the same server under a flat `mcp` key.

### Version-bump checklist

When cutting a release, bump the version in exactly these files, then add a `CHANGELOG.md` entry:

- `package.json` (ROOT only; never bump sub-package versions in `packages/*` or `apps/*`)
- `.claude-plugin/plugin.json`
- `.cursor-plugin/plugin.json`
- `.copilot-plugin/plugin.json`
- `CHANGELOG.md`

Do NOT bump versions inside `packages/*/package.json` or `apps/*/package.json`. They are workspace-internal and use `workspace:*` references.

### GitHub Pages vs Vercel (why both)

Recap Studio uses two distinct hosting surfaces, on purpose:

- **Vercel** runs the full hosted Next.js app (`apps/recap-web`). It is the dynamic, server-rendered track. The deploy is gated behind config plus explicit consent, defined in `vercel.json` and the `scripts/deploy-*.sh` helpers. This is untouched by the Pages work.
- **GitHub Pages** serves a small static landing page (`site/index.html`) plus one real recap HTML sample, deployed by `.github/workflows/deploy-pages.yml`. It is a zero-cost shop window that demonstrates the self-contained offline output without spinning up the Next.js app. It rebuilds nothing: it reuses the already-shipped `.github/assets/demo.gif` and a pre-rendered `artifacts/latest-ai-models/recap-latest-ai-models.html` sample.

The decision: keep Vercel for the live app, add Pages only as a static demo. The two never share state and never deploy each other. Pages must be set to deploy from GitHub Actions in the repo settings.

### npm gap (known, intentional for now)

There is no `release.yml`, and the npm package is stuck at 0.2.0. Monorepo npm publishing is deliberately NOT wired up in this release. Releases are cut as GitHub Releases only. `@recap-studio/cli` and `@recap-studio/html-renderer` are not yet published; the README clone path is the way to run the CLI today.

## Git identity

- All commits are attributed to **Adam Boudjemaa** (`boudjemaa.adam@gmail.com`, GitHub: Aboudjem).
- If the local `.git/config` has overridden `user.name` or `user.email`, unset the override: `git config --unset user.name && git config --unset user.email`.
- Never use `-c user.name=...` or `-c user.email=...` on `git commit`. Never commit as `autoresearch`, `Claude`, or any other handle.
