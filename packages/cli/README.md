# @recap-studio/cli: the `recap` command

Turn a `RecapPageContent` JSON into a **self-contained dark-mode HTML page**, or score it, from any terminal or editor. No Claude Code required.

```bash
npx @recap-studio/cli render recap.json -o recap.html   # one self-contained HTML file
npx @recap-studio/cli validate recap.json               # deterministic 7-check score
```

## Why a CLI?

Recap Studio's `/recap` slash command lives in Claude Code. The CLI is the **cross-editor** half: your editor's own AI (Cursor, Copilot, Codex, Gemini, Continue, …) produces the content JSON; `recap` renders and checks it. Same self-contained, double-click-able output everywhere.

## Commands

| Command | What it does |
|---|---|
| `recap render <content.json> [-o out.html] [--theme dark\|light\|auto] [--print]` | Render to ONE self-contained HTML file (inlined CSS, zero JS, opens offline). Default theme: `dark`. |
| `recap validate <content.json> [--json] [--fail-under <score>]` | Score content with the deterministic checks (structure, citations, word counts, secret/fluff scans). Exit 0 = passes, 1 = does not, 2 = unreadable or invalid file. |
| `recap --help` / `--version` | Help / version. |

### Printing

Every page rendered by `recap` carries a print stylesheet, so Cmd-P gives a white ground, black
text, no floating chrome, expanded glossary definitions and each source URL spelled out. Pass
`--print` to apply those rules on screen as well, which is what you want when you are exporting a
PDF and would rather see the result first.

```bash
recap render content.json --print -o paper.html
```

### Validating in CI

```bash
recap validate content.json --json --fail-under 8
```

`--json` writes one JSON document on stdout (the honesty note goes to stderr, so `| jq` works).
The envelope carries `ok`, `overall`, `passedThresholds`, `failUnder`, every `check` with its score
and findings, and `blockers`.

`--fail-under <score>` replaces the default rule rather than adding to it. The default rule is
strict: it needs every check at status `pass`, so a `warn` one point under target fails the run.
A blocker, such as a secret-shaped string in the content, fails the run at any score.

## Honesty

`validate` runs **deterministic heuristics**, it does not fetch sources or run an LLM. For the full multi-agent review (fact-check against primaries, beginner/a11y/UX/etc.), run `/recap` inside Claude Code.

## Install

```bash
# Published (ships with the recap-studio 0.3.0 release):
npm i -g @recap-studio/cli   # then: recap render content.json
npx @recap-studio/cli render content.json

# Until then, from a clone of the monorepo:
pnpm install && pnpm -w build
node packages/cli/dist/index.js render content.json
```

> Note: the `npx`/`npm i -g` paths require `@recap-studio/cli` to be published to npm, which happens as part of the 0.3.0 release. The from-source path works today.

## License

MIT © Adam Boudjemaa
