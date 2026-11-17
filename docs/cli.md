# CLI reference

Recap Studio ships a command-line tool for use outside Claude Code: in any terminal, any editor,
CI, or a cron job.

## Getting the binary

The CLI is one committed file, `bin/recap.mjs`, with no dependency and no build step. It is not
on npm. Run it straight from GitHub:

```bash
npx -y github:Aboudjem/recap-studio --help
```

Or from a clone, with no install:

```bash
git clone https://github.com/Aboudjem/recap-studio && cd recap-studio
node bin/recap.mjs --help
```

Every example below writes `recap`. Replace it with `npx -y github:Aboudjem/recap-studio` or
`node bin/recap.mjs`.

## `recap demo` and `recap example`

`recap demo` renders the built-in example page and scores it. It needs no input and no network.
`recap example -o content.json` writes the same content as a starting file to edit. It refuses to
overwrite a file unless you pass `--force`.

## `recap mcp`

Serves the MCP tools over stdio. The tool list is in [mcp-tools.md](mcp-tools.md).

## `recap render`

Turn a content JSON file into a page.

| Command | What it does |
|:--|:--|
| `recap render <content.json>` | Render a self-contained HTML file next to the input |
| `recap render <content.json> -o out.html` | Write to a specific output path |
| `recap render <content.json> --theme dark\|light\|auto` | Choose the colour theme. Default `dark`, HTML only |
| `recap render <content.json> --print` | Render for paper: white ground, black text, page breaks kept sane, source URLs spelled out. HTML only |
| `recap render <content.json> --format html\|md\|txt` | The same page as Markdown or plain text. Default `html` |

`--theme` and `--print` are rejected on `md` and `txt` rather than silently ignored, because
neither format carries styling.

A real run:

```
$ recap render fixtures/topics/latest-ai-models.json
recap: wrote latest-ai-models.html (49.8 KB, self-contained, double-click to open)
```

## `recap validate`

Score a content file against the seven deterministic checks in `packages/validation/src/checks/`:
`facts`, `beginner`, `accessibility`, `ux`, `performance`, `security-privacy`, `simplicity`.

| Command | What it does |
|:--|:--|
| `recap validate <content.json>` | Print a Markdown report. Exit 0 when every check passes, 1 when one does not, 2 on an unreadable or invalid file |
| `recap validate <content.json> --json` | The same run as one JSON document on stdout. The honesty note goes to stderr, so a pipe to `jq` still parses |
| `recap validate <content.json> --fail-under <score>` | Gate on the overall score instead of the per-check targets. A blocker still fails the run whatever the score |

`--fail-under` **replaces** the per-dimension rule, it does not add to it. The default rule is
strict: it needs every dimension at `pass`, so one dimension a point under target fails the run.
`--fail-under 8` says "the average is what I care about", and a leaked-secret blocker still fails.

Values outside 0 to 10, empty values, and non-numbers exit 2. `0` is valid.

A gate in CI:

```bash
recap validate content.json --json --fail-under 8 > report.json
jq -r '.overall, .ok' report.json
```

## Workspace scripts

These run from the repo root and only exist if you cloned the repo. `pnpm -w` means "run from the
workspace root".

| Command | What it does |
|:--|:--|
| `npm run render` | Render the demo content |
| `npm run render:demo` | Write `artifacts/<slug>/recap-<slug>.html` |
| `npm run validate:demo` | Score the active page with the same heuristic checks |
| `npm run history` | List every recap in `artifacts/` with its score |
| `npm run auto-refresh -- <slug>` | Re-validate a stored recap on demand |
| `npm run dev --workspace=apps/recap-web` | Preview the hosted Next.js track on localhost:3000 |
| `npm run build --workspace=apps/recap-web` | Build the hosted static site |
| `npm run deploy:preview` | Vercel preview deploy, gated by config and env |
| `npm run deploy:prod` | Vercel production deploy, double-gated |

## Content JSON

`render` and `validate` both read the `RecapPageContent` schema defined in
`packages/content-pipeline/src/schema.ts`. `fixtures/topics/latest-ai-models.json` is a complete,
checked-in example. Inside Claude Code the skills produce this object for you; outside it, most
agents can write it from the schema.
