# @recap-studio/cli — the `recap` command

Turn a `RecapPageContent` JSON into a **self-contained dark-mode HTML page**, or score it — from any terminal or editor. No Claude Code required.

```bash
npx @recap-studio/cli render recap.json -o recap.html   # one self-contained HTML file
npx @recap-studio/cli validate recap.json               # deterministic 7-check score
```

## Why a CLI?

Recap Studio's `/recap` slash command lives in Claude Code. The CLI is the **cross-editor** half: your editor's own AI (Cursor, Copilot, Codex, Gemini, Continue, …) produces the content JSON; `recap` renders and checks it. Same self-contained, double-click-able output everywhere.

## Commands

| Command | What it does |
|---|---|
| `recap render <content.json> [-o out.html] [--theme dark\|light\|auto]` | Render to ONE self-contained HTML file (inlined CSS, zero JS, opens offline). Default theme: `dark`. |
| `recap validate <content.json>` | Score content with the deterministic checks (structure, citations, word counts, secret/fluff scans). Exit 0 = passes thresholds. |
| `recap --help` / `--version` | Help / version. |

## Honesty

`validate` runs **deterministic heuristics** — it does not fetch sources or run an LLM. For the full multi-agent review (fact-check against primaries, beginner/a11y/UX/etc.), run `/recap` inside Claude Code.

## Install

```bash
npm i -g @recap-studio/cli   # then: recap render content.json
# or zero-install:
npx @recap-studio/cli render content.json
```

## License

MIT © Adam Boudjemaa
