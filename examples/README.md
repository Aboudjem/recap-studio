# Examples

Real, runnable examples of Recap Studio. Each sub-folder contains:

- **`input/`** — the content JSON you feed to the renderer (topic or session)
- **`output/`** — the self-contained HTML that the renderer produces from that input

## 01 — topic explainer: "React Server Components"

Shows the most common use-case: a beginner-friendly topic explainer with cited sources,
an inline SVG concept map, a comparison table, and a misconceptions section.

**Run it yourself (from the repo root, after `pnpm install && pnpm -w build`):**

```bash
# Render to artifacts/
node packages/cli/dist/index.js render examples/01-topic-react-server-components/input/content.json \
  -o examples/01-topic-react-server-components/output/recap-react-server-components.html

# Validate structure
node packages/cli/dist/index.js validate examples/01-topic-react-server-components/input/content.json
```

Or inside Claude Code, just run:

```
/recap "What are React Server Components"
```

## 02 — session recap: a small refactor

Shows `/recap session`: takes a simulated `git diff` of a three-file TypeScript refactor
and produces a session changelog with a per-change summary, impact ratings, and links to the
changed files.

**Run it yourself:**

```bash
node packages/cli/dist/index.js render examples/02-session-recap-refactor/input/content.json \
  -o examples/02-session-recap-refactor/output/recap-session-refactor.html
```

Or inside Claude Code:

```
/recap session
```

## Notes

- Output HTML files are **not committed** (`.gitignore` covers `examples/*/output/*.html`).
  Run the commands above to regenerate them locally.
- These examples use `"fixture": true` in the JSON, so they render entirely offline
  with no LLM calls and no network traffic.
- The schema for the content JSON is defined in
  `packages/content-pipeline/src/types.ts`.
