<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio: one page you can email, attach to a PR, or read on a plane. The image shows 40 commits that become one page, with the real line Verdict: PASS, 49.8 KB, 0 script tags, 9.7/10." src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
</p>

<p align="center">
  <b>English</b> ·
  <a href="READMEs/zh-CN.md">简体中文</a> ·
  <a href="READMEs/ja.md">日本語</a> ·
  <a href="READMEs/es.md">Español</a> ·
  <a href="READMEs/fr.md">Français</a>
</p>

**Understand what changed, in one page you can send.**

Recap Studio makes one HTML page from your coding session or a topic.

| Understand what was done | One page to send | Checked before you send |
|:--|:--|:--|
| `/recap session` reads your git diff and commits, then writes one page. | One HTML file, 0 script tags, all CSS inside. The demo below prints both. | Seven checks score the page with no model; `--fail-under 8` refuses a weak page. |

**Works with:** any agent that reads skills, and any MCP client (tested: Claude Code, Codex CLI). The page builder needs no model; the writing uses your agent's model.

Try it now. You only need Node 20 or later.

```bash
npx -y github:Aboudjem/recap-studio demo
```

Real output from 2026-11-17, path shortened:

```text
Verdict: PASS. Wrote /tmp/try/recap-latest-ai-models.html
Page: 49.8 KB, 0 script tags, all CSS inlined. Score: 9.7/10, 0 blocker(s).

Next:
- Open the file with a double-click. It works offline.
- Make your own: `npx -y github:Aboudjem/recap-studio example -o content.json`, edit it, then `npx -y github:Aboudjem/recap-studio render content.json`.
- Score it before you send it: `npx -y github:Aboudjem/recap-studio validate content.json --fail-under 8`.
```

<img alt="A page made by Recap Studio: dark top banner, a one-sentence answer, and a numbered five-step reading path" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

**What it is:** a tool that turns your coding session or a topic into one HTML page.

**When to use it:** someone asks what changed this week, or what a topic means.

**What you get:** one file to email or attach to a pull request. It opens offline, with no JavaScript and no network request.

The score checks shape, not truth, so read the sources before you share.

## Install

**Pick your agent.** Each command installs for all your projects.

[![Claude Code](https://img.shields.io/badge/Claude_Code-D97757?style=for-the-badge&logo=claude&logoColor=white)](#claude-code) [![Codex](https://img.shields.io/badge/Codex-000000?style=for-the-badge&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyBmaWxsPSJ3aGl0ZSIgcm9sZT0iaW1nIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI%2BPHRpdGxlPk9wZW5BSTwvdGl0bGU%2BPHBhdGggZD0iTTIyLjI4MTkgOS44MjExYTUuOTg0NyA1Ljk4NDcgMCAwIDAtLjUxNTctNC45MTA4IDYuMDQ2MiA2LjA0NjIgMCAwIDAtNi41MDk4LTIuOUE2LjA2NTEgNi4wNjUxIDAgMCAwIDQuOTgwNyA0LjE4MThhNS45ODQ3IDUuOTg0NyAwIDAgMC0zLjk5NzcgMi45IDYuMDQ2MiA2LjA0NjIgMCAwIDAgLjc0MjcgNy4wOTY2IDUuOTggNS45OCAwIDAgMCAuNTExIDQuOTEwNyA2LjA1MSA2LjA1MSAwIDAgMCA2LjUxNDYgMi45MDAxQTUuOTg0NyA1Ljk4NDcgMCAwIDAgMTMuMjU5OSAyNGE2LjA1NTcgNi4wNTU3IDAgMCAwIDUuNzcxOC00LjIwNTggNS45ODk0IDUuOTg5NCAwIDAgMCAzLjk5NzctMi45MDAxIDYuMDU1NyA2LjA1NTcgMCAwIDAtLjc0NzUtNy4wNzI5em0tOS4wMjIgMTIuNjA4MWE0LjQ3NTUgNC40NzU1IDAgMCAxLTIuODc2NC0xLjA0MDhsLjE0MTktLjA4MDQgNC43NzgzLTIuNzU4MmEuNzk0OC43OTQ4IDAgMCAwIC4zOTI3LS42ODEzdi02LjczNjlsMi4wMiAxLjE2ODZhLjA3MS4wNzEgMCAwIDEgLjAzOC4wNTJ2NS41ODI2YTQuNTA0IDQuNTA0IDAgMCAxLTQuNDk0NSA0LjQ5NDR6bS05LjY2MDctNC4xMjU0YTQuNDcwOCA0LjQ3MDggMCAwIDEtLjUzNDYtMy4wMTM3bC4xNDIuMDg1MiA0Ljc4MyAyLjc1ODJhLjc3MTIuNzcxMiAwIDAgMCAuNzgwNiAwbDUuODQyOC0zLjM2ODV2Mi4zMzI0YS4wODA0LjA4MDQgMCAwIDEtLjAzMzIuMDYxNUw5Ljc0IDE5Ljk1MDJhNC40OTkyIDQuNDk5MiAwIDAgMS02LjE0MDgtMS42NDY0ek0yLjM0MDggNy44OTU2YTQuNDg1IDQuNDg1IDAgMCAxIDIuMzY1NS0xLjk3MjhWMTEuNmEuNzY2NC43NjY0IDAgMCAwIC4zODc5LjY3NjVsNS44MTQ0IDMuMzU0My0yLjAyMDEgMS4xNjg1YS4wNzU3LjA3NTcgMCAwIDEtLjA3MSAwbC00LjgzMDMtMi43ODY1QTQuNTA0IDQuNTA0IDAgMCAxIDIuMzQwOCA3Ljg3MnptMTYuNTk2MyAzLjg1NThMMTMuMTAzOCA4LjM2NCAxNS4xMTkyIDcuMmEuMDc1Ny4wNzU3IDAgMCAxIC4wNzEgMGw0LjgzMDMgMi43OTEzYTQuNDk0NCA0LjQ5NDQgMCAwIDEtLjY3NjUgOC4xMDQydi01LjY3NzJhLjc5Ljc5IDAgMCAwLS40MDctLjY2N3ptMi4wMTA3LTMuMDIzMWwtLjE0Mi0uMDg1Mi00Ljc3MzUtMi43ODE4YS43NzU5Ljc3NTkgMCAwIDAtLjc4NTQgMEw5LjQwOSA5LjIyOTdWNi44OTc0YS4wNjYyLjA2NjIgMCAwIDEgLjAyODQtLjA2MTVsNC44MzAzLTIuNzg2NmE0LjQ5OTIgNC40OTkyIDAgMCAxIDYuNjgwMiA0LjY2ek04LjMwNjUgMTIuODYzbC0yLjAyLTEuMTYzOGEuMDgwNC4wODA0IDAgMCAxLS4wMzgtLjA1NjdWNi4wNzQyYTQuNDk5MiA0LjQ5OTIgMCAwIDEgNy4zNzU3LTMuNDUzN2wtLjE0Mi4wODA1TDguNzA0IDUuNDU5YS43OTQ4Ljc5NDggMCAwIDAtLjM5MjcuNjgxM3ptMS4wOTc2LTIuMzY1NGwyLjYwMi0xLjQ5OTggMi42MDY5IDEuNDk5OHYyLjk5OTRsLTIuNTk3NCAxLjQ5OTctMi42MDY3LTEuNDk5N1oiLz48L3N2Zz4%3D)](#codex) [![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](#cursor) [![Gemini CLI](https://img.shields.io/badge/Gemini_CLI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](#gemini-cli) [![GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-24292F?style=for-the-badge&logo=githubcopilot&logoColor=white)](#github-copilot) [![OpenCode](https://img.shields.io/badge/OpenCode-333333?style=for-the-badge&logo=opencode&logoColor=white)](#opencode)

### Claude Code

Tested. Plugin, skills and MCP server.

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

Then type `/recap "What is React Server Components"` in any project.
`claude plugin list` may say "The packages it lists were not installed". You can ignore it: the plugin needs no packages.

### Codex

Tested: MCP call. Skills: install tested.

```bash
npx skills add Aboudjem/recap-studio -g -a codex -y
```

### Cursor

Install tested.

```bash
npx skills add Aboudjem/recap-studio -g -a cursor -y
```

### Gemini CLI

Install tested.

```bash
npx skills add Aboudjem/recap-studio -g -a gemini-cli -y
```

### GitHub Copilot

Install tested.

```bash
npx skills add Aboudjem/recap-studio -g -a github-copilot -y
```

### OpenCode

Install tested.

```bash
npx skills add Aboudjem/recap-studio -g -a opencode -y
```

Only this project: drop `-g`. Another agent: put its name after `-a`.

**The CLI alone.** No agent needed. It runs from GitHub, not npm:

```bash
npx -y github:Aboudjem/recap-studio render content.json
```

In this README and the docs, `recap` is short for `npx -y github:Aboudjem/recap-studio`. The CLI prints its hints in the form you used to start it.

**An MCP client** (an app that calls tools over the Model Context Protocol). Paste this into its MCP config:

```json
{
  "mcpServers": {
    "recap-studio": {
      "command": "npx",
      "args": ["-y", "github:Aboudjem/recap-studio", "mcp"]
    }
  }
}
```

The Claude Code plugin starts this server for you. Setup for each editor is in [docs/editors.md](docs/editors.md).

<details>
<summary>Other ways in</summary>

```bash
# This project only, for the agents the skills CLI finds
npx skills add Aboudjem/recap-studio

# The repo's own installer, which calls the same skills CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# From a clone, with no network after the clone
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
node bin/recap.mjs demo
```

Each release also ships `recap-studio.mcpb`, a one-file bundle for MCP clients that install bundles.
</details>

## How it works

1. You ask. `/recap "<topic>"` researches a topic. `/recap session` reads your git diff and commits.
2. Agents write the content. 13 specialist agents find sources, write a five-minute reading path, and check each claim.
3. The agent saves the content as JSON in `artifacts/<slug>/content.json`, in your project.
4. A checker scores it. Seven fixed checks give the same score each time: structure, citations, word counts, secret scan. No model, no network.
5. The renderer writes one file, `artifacts/<slug>/recap-<slug>.html`. All CSS is inside the file.

The CLI and the MCP server are one committed file, `bin/recap.mjs`, with no dependency.

| What runs          | Side effect                                                                                                  |
| :----------------- | :----------------------------------------------------------------------------------------------------------- |
| Skills and agents  | Write files under `artifacts/` in your project. Research uses your agent's own web search, when it has one.                    |
| CLI and MCP server | Write the page you ask for. No network call. 11 MCP tools, listed in [docs/mcp-tools.md](docs/mcp-tools.md). |
| Plugin hooks       | Act only when the session runs inside a recap-studio project (see the FAQ). There they block destructive git and unchecked deploys. They also block writes and edits to secret files. That means `.env` and `.env.*` and anything under `secrets/` or `private/`. It also means SSH key files (`id_rsa`, `id_ed25519`, `id_ecdsa`, `id_dsa`, with or without `.pub`) and `.pem`, `.p12`, `.pfx`, `.keystore` and `.key` files. |
| Deploy and email   | Never run by the plugin. The MCP deploy tool returns a command to run yourself. The email tool returns a draft.  |

## What you get

| Output                 | What it is                                                                                  |
| :--------------------- | :------------------------------------------------------------------------------------------ |
| `recap-<slug>.html`    | One page in one file. All CSS inside, zero JavaScript, zero outside requests.          |
| `--format md` or `txt` | The same page as Markdown or plain text, for a pull request or a note.                      |
| `--print`              | A paper version: white ground, black text, source URLs spelled out.                         |
| `recap validate`       | A report that opens with the verdict, then up to three fixes, then seven scored dimensions. |
| `--fail-under <score>` | Exit 1 below your gate. A blocker fails the run whatever the score.                         |

## Works with

| Agent                               | What was checked                                                                                | Tested     |
| :---------------------------------- | :---------------------------------------------------------------------------------------------- | :--------- |
| Claude Code 2.1.326                 | Plugin loaded with `--plugin-dir`; its MCP server reported `Connected` from an unrelated folder | 2026-11-17 |
| Codex CLI 0.169.0                   | `codex exec` called the `validate_content` MCP tool and returned the verdict                    | 2026-11-17 |
| Codex, Gemini CLI, OpenCode, Cursor, GitHub Copilot | `npx skills@1.9.0 add -g` copied all five skills into `~/.agents/skills/`, for all projects | 2026-11-17 |

Documented, not tested: Windsurf, Continue, Zed and the other agents the skills CLI supports. Setup steps are in [docs/editors.md](docs/editors.md).

## Proof

Each number below comes from a command you can run in a clone.

| Claim                               | Number  | Command                                                                           |
| :---------------------------------- | :------ | :-------------------------------------------------------------------------------- |
| Tests pass                          | 115     | `npm run test:count` (runs `npm test`, prints the total)                          |
| Script tags in a rendered page      | 0       | `node bin/recap.mjs demo`                                                         |
| Demo page size                      | 49.8 KB | `node bin/recap.mjs demo`                                                         |
| Score of the demo content           | 9.7/10  | `node bin/recap.mjs validate fixtures/topics/latest-ai-models.json`               |
| MCP tools                           | 11      | `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \| node bin/recap.mjs mcp` |

CI runs the suite on Node 20 and 22 on every push and pull request. It also fails if a rendered page holds a `<script>` tag.

## FAQ

**Do I need Claude Code to use it?**
No. The CLI and the MCP server run anywhere Node 20 runs. Claude Code adds the research agents behind `/recap`.

**Does the page call home when I open it?**
No. It has no JavaScript and no external link to load. CI checks every render for a `<script>` tag.

**Is the 9.7/10 score a review by a model?**
No. It is a set of fixed checks over structure, citations and word counts. They give the same score each time. They do not read the sources.

**Will the hooks change my other projects?**
No. They check the session's working folder, not the folder of the file being edited. They act only when that folder or a parent has a `recap-studio.config.*` file, a `.recap-studio/` folder, or is this repo. `RECAP_HOOKS_EVERYWHERE=1` turns them on everywhere.

**Why not publish the CLI to npm?**
It does not need it. The CLI is one file with no dependency, so `npx -y github:Aboudjem/recap-studio` runs it directly.

## Limits

- The score is a rough check (a heuristic). It checks shape, not truth. Read the sources before you share a page.
- Research quality depends on your agent. The CLI renders the content you give it; it does not research.
- Offline, Mermaid diagrams (text-based charts) show as text. Use SVG diagrams instead: `kind: "svg"`.
- Five MCP tools do not do the full job (they are stubs). `render_page_screenshot`, `run_accessibility_scan` and `run_lighthouse_summary` answer `skipped`: no browser ships with the server.
- The deploy and email tools never deploy or send. `deploy_vercel_preview` returns a shell command to run yourself. `send_email_draft` returns a draft to paste into your mail client.
- Codex may block the write tools. In a `codex exec` run, its approval review blocked `render_recap_html`. Read tools worked.

## Learn more

- [Editor setup](docs/editors.md), [CLI reference](docs/cli.md), [MCP tools](docs/mcp-tools.md)
- [FAQ](docs/faq.md) and [how it compares](docs/comparison.md)
- [Architecture](docs/architecture.md), [agent system](docs/agent-system.md), [security and privacy](docs/security-and-privacy.md)
- [Changelog](CHANGELOG.md) and [contributing](CONTRIBUTING.md)

---

<p align="center">
  <sub>Built by <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT License · No telemetry</sub>
</p>
