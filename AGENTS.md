# AGENTS.md: Recap Studio

Guidance for AI coding agents (Codex, GitHub Copilot Workspace, Claude Code, and similar) working in this repository.

---

## What This Project Is

**Recap Studio** is a Claude Code plugin (distributed via the Aboudjem/10x marketplace) that helps you understand what changed: it makes one cited, dark-mode HTML page from your coding session or a topic. The page opens with a double-click, works offline, and has no JavaScript. It ships as a hybrid architecture:

- **Skills**: the user-facing slash commands (`/recap`, `/recap session`, `/recap setup`, `/recap validate`)
- **Specialist agents**: 13 Markdown-defined agent prompts that the skill orchestrator dispatches
- **Optional MCP server**: exposes a `render_recap_html` tool for editors that speak MCP (Cursor, VS Code, Codex, Continue)
- **Packages**: shared TypeScript libraries used by all tracks
- **Hosted Next.js track**: `apps/recap-web` renders the full page for browser/Vercel deployment

---

## Monorepo Layout

```
recap-studio/
├── apps/
│   └── recap-web/          # Next.js 15 App Router, the hosted rendering track
│       └── src/
│           ├── app/         # Next.js pages and API routes
│           ├── components/  # React components (Tailwind, shadcn-style)
│           └── content/     # Generated JSON content (git-tracked demo; .gitignored for user content)
├── packages/
│   ├── content-pipeline/   # RecapPageContent schema, loaders, transformers
│   ├── design-system/      # Shared tokens (colors, spacing, typography, all sans-serif)
│   ├── validation/         # Deterministic heuristic scorer (NOT LLM; see Honesty Rule below)
│   ├── html-renderer/      # renderToHtml(content, {theme}) → self-contained dark-mode HTML string
│   ├── cli/                # `recap` CLI: demo, example, render, validate, mcp
│   └── mcp-server/         # MCP server: 11 tools (docs/mcp-tools.md)
├── bin/recap.mjs           # Generated: CLI + MCP server in one file (scripts/build-bundle.mjs)
├── skills/
│   ├── recap/              # SKILL.md: /recap router (topic, session or demo)
│   ├── recap-topic/        # SKILL.md: /recap <topic>
│   ├── recap-session/      # SKILL.md: /recap session (git diff -> session recap)
│   ├── recap-setup/        # SKILL.md: one-time config wizard
│   └── recap-validate/     # SKILL.md: validate a content JSON file
├── agents/                 # 13 specialist agent prompt files (Markdown frontmatter)
├── hooks/                  # Claude Code hooks (MJS) + hooks.json; act only in a recap-studio project
├── scripts/                # Dev scripts (render-html.mjs, validate.mjs, demo-*.mjs, etc.)
├── fixtures/               # Sample content JSON files for testing and demos
├── templates/              # Scaffold templates for new content types
├── artifacts/              # Build output: generated HTML files (gitignored)
├── docs/                   # Architecture docs, audit reports, design decisions
└── .github/
    ├── assets/             # SVG logos, hero diagram, social preview
    └── workflows/          # CI (ci.yml)
```

---

## Build, Test, and Validate

Run these commands from the repo root. All require `pnpm` (v10) and Node ≥ 20.

```bash
# Install all workspace dependencies
npm install

# Build all packages (run after any package change)
npm run build

# Run every suite: builds the packages, then each workspace, the hooks,
# the plugin and the bundle checks (105 tests on 2026-11-17)
npm test

# TypeScript strict check across all packages
npm run typecheck

# Lint
npm run lint

# Render the demo topic to a self-contained HTML file
npm run render:demo
# Output: artifacts/latest-ai-models/recap-latest-ai-models.html

# Render an arbitrary content JSON
npm run render -- <path/to/content.json>

# Run the deterministic validation suite against the demo
npm run validate:demo

# Validate an arbitrary content JSON
npm run validate -- <path/to/content.json>
```

**Before opening a PR, all of the following must be green:**

```bash
npm run typecheck && npm test && npm run build && npm run validate:demo
```

The validation gate must return a composite score of **9.7/10 or better** on the demo fixture. See the Honesty Rule section for what that score actually means.

---

## The 13 Specialist Agents

Agents live in `agents/` as Markdown files with YAML frontmatter. Each declares its `name`, `description`, and `tools`. They carry no `model:` pin (see CLAUDE.md, host-agnostic agents), so each host CLI falls back to its own default model. The skill orchestrator (inside `skills/recap-topic/SKILL.md` and `skills/recap-session/SKILL.md`) dispatches them in the order below. The directory names stay hyphenated (`recap-session`); the user-facing invocation is the space form `/recap session`.

The "Suggested model" column is guidance for the cost/quality split that worked well in practice; it is not pinned in the agent frontmatter, so any host CLI runs these with its own default model.

| Agent file | Role | Suggested model |
|---|---|---|
| `research-scout.md` | Finds current, reliable sources on the topic | haiku |
| `source-librarian.md` | Scores sources; builds the citation map | haiku |
| `learning-architect.md` | Structures the 5-minute learning path from scored research | sonnet |
| `visual-story-designer.md` | Designs visual concept, diagrams (Mermaid or SVG), section rhythm | sonnet |
| `frontend-builder.md` | Builds/updates the Next.js page and reusable components | sonnet |
| `repo-session-analyst.md` | Analyzes git diffs for /recap session; produces SessionDelta | sonnet |
| `fact-checker.md` | Validates claims against the source map | sonnet |
| `source-librarian.md` | (second pass) confirms citation completeness | haiku |
| `skeptical-reviewer.md` | Adversarial pass: hunts overclaiming, missing caveats, fluff | sonnet |
| `ux-design-reviewer.md` | Reviews hierarchy, layout, readability, polish | sonnet |
| `accessibility-reviewer.md` | WCAG checks, contrast, keyboard nav, motion safety | haiku |
| `performance-reviewer.md` | Bundle size, Core Web Vitals risk, static-first audit | haiku |
| `security-privacy-reviewer.md` | Secrets, prompt-injection vectors, unsafe commands, privacy | sonnet |
| `beginner-reviewer.md` | "Can a smart newcomer understand this in 5 minutes?" check | haiku |

**How the pipeline dispatches them:**

The skill SKILL.md instructs the orchestrator to invoke these agents sequentially or in parallel where possible. `research-scout` and `source-librarian` always run before `learning-architect`. The six reviewer agents (`skeptical`, `ux-design`, `accessibility`, `performance`, `security-privacy`, `beginner`) run in parallel after the content is built. The orchestrator collects their findings, patches the content JSON, and triggers a final render.

**Adding a new agent:**

1. Create `agents/<name>.md` with valid YAML frontmatter (`name`, `description`, `model`, `tools`).
2. Reference it in the relevant skill SKILL.md pipeline section.
3. Add a fixture test in `packages/validation/` if the agent produces scored output.

---

## The 5 Hooks

Hooks run automatically inside Claude Code sessions. They are listed in `hooks/hooks.json` and implemented as `.mjs` files.

| Hook file | When it fires | What it blocks |
|---|---|---|
| `block-secret-writes.mjs` | Before any file write | Writes containing API keys, tokens, or secret patterns |
| `block-destructive-git.mjs` | Before any shell command | Any `git push` (plain pushes allowed with `RECAP_ALLOW_GIT_PUSH=1`), force/delete pushes, `git reset --hard`, `rebase`, branch deletion |
| `validate-before-deploy.mjs` | Before deploy scripts execute | Deployment if `npm run validate:demo` returns below threshold |
| `format-after-edit.mjs` | After any TypeScript/JS/JSON file edit | (runs `prettier`; does not block, reformats) |
| `qa-summary-on-stop.mjs` | When the Claude Code session stops | (prints QA summary; does not block) |

Do not remove or disable hooks without a documented reason. CI smoke-tests the first three.

---

## Honesty Rule: The Validation Score

**The 9.7/10 composite score is produced by deterministic heuristics, not LLM agents.**

`packages/validation/` contains word-count checks, `sourceId` presence checks, secret-pattern regex, and structure validators. `npm run validate:demo` runs these checks; it does NOT call any LLM and does NOT fetch sources.

The 13 specialist agents listed above are invoked at **skill runtime** (when a user runs `/recap` or `/recap session` in Claude Code). They are not part of the static validation suite.

Every place that surfaces a score (README, generated HTML, skill output, any agent prompt) must include this clarification. Do not add new score displays without this caveat.

---

## Conventions Agents Must Follow

### TypeScript
- All packages use `TypeScript strict` mode (`"strict": true` in tsconfig).
- Use `@recap-studio/*` workspace imports, not relative cross-package paths.
- `content-pipeline` has a subpath `@recap-studio/content-pipeline/load-config`; use it instead of the barrel to avoid Next.js "Critical dependency" warnings.

### Styling
- **All fonts are sans-serif.** `Inter` is the primary face; system-ui stack as fallback. No serif or display faces anywhere.
- The design system is dark-first. Light-mode variants are supported but dark is the baseline.
- Gradients follow the violet→blue→teal palette defined in `packages/design-system/`.
- Animation is tasteful and reduced-motion-safe. No full-page transitions; no auto-play video.

### Self-Contained Output
- `renderToHtml()` from `@recap-studio/html-renderer` must produce output with zero `/_next/` references, zero `<script>` tags, and zero external font loads. The file must open via `file://` with no network required.
- Generated HTML goes to `artifacts/<slug>/recap-<slug>.html`. Never write generated content into `apps/recap-web/src/`.

### Deployment
- **Never deploy without explicit user consent.** Skills ask "Deploy to Vercel?" only when Vercel is configured (`.vercel/` directory present or `VERCEL_TOKEN` set and `deploymentMode != disabled` in `recap-studio.config.ts`).
- `recap-studio.config.ts` is gitignored. The template is `recap-studio.config.example.ts`. Never commit a config with `deploymentMode: "auto"` or any real token.

### No Secrets
- Never write API keys, tokens, or credentials to any file.
- `block-secret-writes.mjs` will reject writes; respect it rather than working around it.
- `recap-studio.config.ts` holds `VERCEL_TOKEN` by reference to env; keep it that way.

### Git Identity
- All commits must be attributed to **Adam Boudjemaa** (GitHub: Aboudjem), through the global git config.
- If the local repo's `.git/config` has overridden `user.name` or `user.email`, unset the local override so the global identity is used: `git config --unset user.name && git config --unset user.email`.
- Never use `-c user.name=...` flags on `git commit`. Never commit as `autoresearch`, `Claude`, or any other handle.

### Commit Protocol
- Commits go to feature branches; never push directly to `main` (or the active rebuild branch).
- Commit messages describe the *why*, not the *what*. Keep subject line under 72 characters.
- Run `npm run typecheck && npm test` before committing.

---

## Known Gotchas

| Issue | Cause | Fix |
|---|---|---|
| Next.js "Critical dependency" warning | `load-config` imported from the content-pipeline barrel | Use `@recap-studio/content-pipeline/load-config` subpath |
| `file://` broken when opening `apps/recap-web/out/` | Next.js static export uses absolute paths | Use `artifacts/` output from `npm run render:demo` instead |
| MCP tool results rejected by some editors | Old transport returned `"json"` content type | Fixed in v0.3; content type is now `"text"` per MCP spec |
| `validate.mjs` exits with TypeError on malformed input | Guard was missing | Fixed; script now exits cleanly with code 2 |
| Theme defaults to `"auto"` | Was `"auto"` in older config | Default is now `"dark"`; change in `recap-studio.config.ts` |
| `recap` on npm is blocked (owned by a third party) | npm package `recap@0.3.2` is owned by another maintainer | The plugin is distributed as `recap-studio` via the 10x marketplace |

---

## Where to Write Things

| Content type | Write to |
|---|---|
| Generated HTML recaps | `artifacts/<slug>/recap-<slug>.html` |
| Demo/fixture content JSON | `fixtures/topics/<slug>.json` or `fixtures/sessions/<slug>.json` |
| Shared TypeScript types | `packages/content-pipeline/src/types.ts` |
| New agent prompts | `agents/<name>.md` |
| New skill | `skills/<name>/SKILL.md` |
| Architecture docs | `docs/` |
| CI workflows | `.github/workflows/` |
| SVG assets (logos, diagrams) | `.github/assets/` |

---

## Package Summary

| Package | Exports | Tests |
|---|---|---|
| `@recap-studio/content-pipeline` | `RecapPageContent` schema, loaders, `loadConfig` (subpath) | 17 tests |
| `@recap-studio/design-system` | Design tokens, Tailwind config | none |
| `@recap-studio/validation` | `runValidation()`, `reportMarkdown()`, dimension scores (deterministic heuristics) | 5 tests |
| `@recap-studio/html-renderer` | `renderToHtml()`, `renderFromJson()`, `getBaseStyles()` | 26 tests |
| `@recap-studio/mcp-server` | MCP server, 11 tools (see `docs/mcp-tools.md`) | 9 tests |
| `@recap-studio/cli` | `recap demo`, `example`, `render`, `validate`, `mcp` | 15 tests |
| `apps/recap-web` | Hosted Next.js track | 1 test |
| repo (`hooks/*.test.mjs`, `tests/*.test.mjs`) | Hooks, installed-plugin, bundle and manifest checks | 32 tests |

Total: 105 tests on 2026-11-17. Re-print the counts with
`npm test 2>&1 | grep -E "^# tests|Tests "`.

---

## Links

- Repository: https://github.com/Aboudjem/recap-studio
- Marketplace: distributed via Aboudjem/10x
- License: MIT
- Author: Adam Boudjemaa ([@Aboudjem](https://github.com/Aboudjem))
