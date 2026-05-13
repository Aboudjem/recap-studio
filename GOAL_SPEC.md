# Recap Studio — Build Specification (GOAL_SPEC)

> Canonical spec for the `/goal` runner. Mirrors the original brief and
> evolves only when the team agrees in writing.

## Mission

Build a production-grade Claude Code plugin/system named **Recap Studio** that
autonomously generates beautiful, mobile-first, ADHD-friendly educational
one-page websites that help users understand a topic in under 5 minutes.

It supports two core modes:

1. **Learn a Topic** — `/recap topic "<subject>"`
2. **Understand a Large Coding Session** — `/recap session [--deep]`

It must be a reusable Claude Code plugin with skills, agents, hooks, optional
MCP tools, validation workflow, and a generated Next.js website template.

## Acceptance criteria

- `.claude-plugin/plugin.json` is valid and discovered by Claude Code.
- Skills exist for `/recap topic`, `/recap session`, `/recap setup`,
  `/recap validate` (and a default `/recap` router).
- Specialized subagents exist for research, librarian, learning, visual story,
  frontend, repo/session analysis, and the validation review board.
- Deterministic hooks exist for: format-after-edit, block-secret-writes,
  validate-before-deploy, qa-summary-on-stop.
- Optional local MCP server scaffold lives under `packages/mcp-server` and
  works without being mandatory.
- A Next.js App Router project lives under `apps/recap-web` and renders a
  one-page educational site from a typed `RecapPageContent` object.
- A typed config system (`recap-studio.config.ts` schema) loads with
  documented safe defaults; `recap setup` writes the config.
- A source/citation pipeline maps every claim to one or more sources.
- A multi-agent validation loop scores fact, beginner-clarity, ADHD-a11y,
  UX, performance, security, and simplicity from 1–10 and refines until
  the threshold passes or blockers are documented.
- A demo command, `pnpm demo:latest-ai-models`, produces the page from an
  offline-safe fixture marked as fixture data.
- Vercel deployment docs and scripts exist; deploy is **off by default**.
- All side effects (deploy, email, network) are off unless config and
  explicit confirmation exist.

## Non-goals and safety (hard rules)

- No real deploy without `recap-studio.config.ts` + explicit confirmation.
- No real email send without `RESEND_API_KEY` + explicit confirmation.
- No secrets in files; use environment variables and `.env.example`.
- No destructive git commands.
- No fabricated citations; uncertainty must be marked.
- No hidden failed checks.
- Preserve unrelated existing files.

## Repository layout (target)

```
.claude-plugin/plugin.json
skills/{recap-topic,recap-session,recap-setup,recap-validate}/SKILL.md
agents/*.md
hooks/*.{sh,mjs} + hooks.json
packages/{content-pipeline,design-system,validation,mcp-server}/
apps/recap-web/
docs/{architecture,agent-system,workflows,vercel-deployment,security-and-privacy,configuration}.md
scripts/{demo-latest-ai-models.mjs,validate.mjs,deploy-preview.sh}
fixtures/topics/latest-ai-models.json
.env.example
README.md
pnpm-workspace.yaml
```

## Quality thresholds (validation loop)

| Dimension              | Target |
| ---------------------- | ------ |
| Facts                  | ≥ 9    |
| Beginner clarity       | ≥ 9    |
| ADHD accessibility     | ≥ 9    |
| UX / design            | ≥ 8    |
| Performance            | ≥ 8    |
| Security / privacy     | ≥ 9    |
| Simplicity             | ≥ 9    |

## Cost & token efficiency

- Cheap/fast model for source collection and lint-like reviews.
- Strong model for architecture, content synthesis, final design.
- Pass structured summaries; never raw page dumps.
- Cache sources via the content pipeline's source cache.
- Cap deep research; prefer balanced by default.

## Definition of done (this build)

All files under "Repository layout" exist, `pnpm install` resolves, lint and
typecheck commands are defined, the demo command runs offline and emits a
`RecapPageContent` JSON plus a built page, and the final report below is
printed in the conversation with honest blockers (if any).
