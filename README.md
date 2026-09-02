<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-light.svg">
  <img alt="Recap Studio: any topic, one file you can double-click" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/hero-dark.svg" width="100%">
</picture>

<p align="center">
  <a href="https://github.com/Aboudjem/recap-studio/releases"><img src="https://img.shields.io/github/v/tag/Aboudjem/recap-studio?color=5B9DFF&label=version&style=flat-square" alt="version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-5B9DFF?style=flat-square" alt="License"></a>
  <a href="https://github.com/Aboudjem/recap-studio/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Aboudjem/recap-studio/ci.yml?style=flat-square&label=CI" alt="CI"></a>
  <a href="https://github.com/Aboudjem/recap-studio/stargazers"><img src="https://img.shields.io/github/stars/Aboudjem/recap-studio?style=flat-square&color=5B9DFF" alt="Stars"></a>
</p>

<p align="center">
  <b>English</b> ·
  <a href="READMEs/zh-CN.md">简体中文</a> ·
  <a href="READMEs/ja.md">日本語</a> ·
  <a href="READMEs/es.md">Español</a> ·
  <a href="READMEs/fr.md">Français</a>
</p>

<p align="center"><b>Turn any topic or coding session into a dark-mode, mobile-first explainer you can double-click to open.</b><br><sub>No server, no internet, no dependencies.</sub></p>

<p align="center">
  <a href="#what-it-does">What it does</a> ·
  <a href="#install">Install</a> ·
  <a href="#use-it">Use it</a> ·
  <a href="#works-in-your-editor">Works in your editor</a> ·
  <a href="#learn-more">Learn more</a>
</p>

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

## What it does

You ask a question, or you finish a messy afternoon of commits. You want one thing you can read later, or send to a colleague, without a login, a hosted doc, or a build step.

Recap Studio takes a topic (`"Latest AI models"`) or a coding session (`git diff` plus commits) and writes **one HTML file**. Every style is inlined, there is no JavaScript, and the page makes no external request. Double-click it in Finder or Explorer and it opens, offline.

- **A page you can read in about five minutes**: a one-sentence answer, the points that actually matter, an inline SVG concept map, key ideas, misconceptions, a glossary, and cited sources.
- **A score you can put in CI**: seven deterministic checks over structure, citations, word counts, and secret scans.
- **A file you can email**: no server to keep alive, no link that rots.

<img alt="A rendered Recap Studio page: dark hero, a one-sentence answer, and a numbered five-step reading path" src="https://raw.githubusercontent.com/Aboudjem/recap-studio/main/.github/assets/page-preview.png" width="100%">

## Install

```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

`10x` is a plugin marketplace, a list Claude Code can install from. Adding it once makes `recap-studio` and its sibling tools available.

For any other agent, the four skills install through the skills CLI:

```bash
npx skills add Aboudjem/recap-studio
```

<details>
<summary>Other ways in</summary>

```bash
# Pick the agent explicitly
npx skills add Aboudjem/recap-studio -a codex

# Or use the repo's own installer, which delegates to the same CLI
curl -fsSL https://raw.githubusercontent.com/Aboudjem/recap-studio/main/install.sh | bash -s codex

# --legacy copies the skills by hand, for machines without npx
bash install.sh codex --legacy
```

`install.sh --update` refreshes an install, `install.sh --uninstall` removes it. Windows uses `install.ps1 <platform>` from a checkout.
</details>

## Use it

**1. Ask for a page.** In any Claude Code session:

```
/recap "What is React Server Components"
```

Recap Studio researches the topic, checks every claim against the sources it found, renders the page, and opens it. `/recap session` does the same for your last stretch of commits.

**2. Or render content you already have.** From a clone, with the CLI:

```bash
pnpm install && pnpm -w build
node packages/cli/dist/index.js render fixtures/topics/latest-ai-models.json
```

```
recap: wrote latest-ai-models.html (49.8 KB, self-contained, double-click to open)
```

**3. Score it before you send it.**

```bash
node packages/cli/dist/index.js validate fixtures/topics/latest-ai-models.json --fail-under 8
```

```
| Dimension          | Score  | Target | Status   | Top finding |
| facts              | 10/10 |  9 | PASS    | none |
| beginner           | 10/10 |  9 | PASS    | none |
| accessibility      | 10/10 |  9 | PASS    | none |

Overall: 9.7/10, thresholds PASSED
```

Add `--json` and the same run prints one JSON document on stdout, so a CI job can read it with `jq`.

## What you get

| Artifact | What it is |
|:--|:--|
| `recap-<slug>.html` | One self-contained page. All CSS inlined, zero JavaScript, zero external requests. |
| `--format md` or `txt` | The same page as a Markdown or plain-text file, for a pull request body or a commit note. |
| `--print` | A paper render: white ground, black text, page breaks kept sane, source URLs spelled out. |
| A validation report | Seven scored dimensions, a list of blockers, and an exit code. |
| `--fail-under <score>` | Exit 1 when the overall score is below your gate. A blocker fails the run whatever the score. |

## Works in your editor

Works in Claude Code, Cursor, Codex, Copilot, Gemini CLI, and 70+ other agents through `npx skills add`.

| Agent | One-line install |
|:--|:--|
| Claude Code | `claude plugin install recap-studio@10x` |
| Any of 70+ agents | `npx skills add Aboudjem/recap-studio` |
| Codex, Gemini, OpenCode, Pi | `bash install.sh <agent>` |
| VS Code (Copilot) | `bash install.sh copilot` |
| Everything else | see [docs/editors.md](docs/editors.md) |

<details>
<summary>Add it as an MCP server instead</summary>

The MCP server is local, so it needs a built clone first:

```bash
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
pnpm install && pnpm -w build
claude mcp add recap-studio node -- packages/mcp-server/dist/index.js
```

There is no `.mcp.json` in this repo. Cursor, VS Code, Codex, Gemini CLI, Windsurf, Continue, OpenCode and Zed each want the same command in their own shape; every snippet is in [docs/editors.md](docs/editors.md).
</details>

## Good to know

> [!IMPORTANT]
> Every side effect is off by default. No network calls, no deploys, no emails, no secret writes, no destructive git. `RECAP_STUDIO_FIXTURE_ONLY=1` is the starting state, so the demo runs from fixtures and nothing phones home.

- **The rendered page carries no JavaScript.** CI asserts it on every push: the rendered HTML has no `<script>` tag and no `/_next/` reference.
- **The score is a heuristic, not a review.** `validate` runs seven deterministic checks. It does not fetch sources and does not call a model. The 13 specialist agents run only inside Claude Code, through `/recap`.
- **73 tests pass** across six workspace projects, on Node 20 and 22. Only a placeholder redirect package sits on npm, so the CLI runs from a clone.

> [!CAUTION]
> A "9.7 out of 10" you may see in older docs came from that heuristic checker, not from reviewers. Read it as a structural signal, not a peer review.

## Learn more

- [Editor setup](docs/editors.md), every agent and every MCP snippet
- [CLI reference](docs/cli.md), every command and flag
- [FAQ](docs/faq.md) and [how it compares](docs/comparison.md)
- [Architecture](docs/architecture.md), [agent system](docs/agent-system.md), [security and privacy](docs/security-and-privacy.md)
- [Changelog](CHANGELOG.md) and [contributing](CONTRIBUTING.md)

---

<p align="center">
  <sub>Built by <a href="https://github.com/Aboudjem">Adam Boudjemaa</a> · MIT License · No telemetry</sub>
</p>
