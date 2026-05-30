# Architecture

Recap Studio is a Claude Code plugin orchestrating four typed packages plus a
Next.js renderer. The plugin is the orchestration package; the MCP server is
optional tooling, not the product.

## Layers

```
┌──────────────────────────────────────────────────────────────┐
│  Claude Code (skills + agents + hooks)                       │
│  ────────────────────────────────────────────────────────    │
│    /recap topic    /recap session    /recap setup            │
│        │                │                  │                 │
│        ▼                ▼                  ▼                 │
│  Subagents (research-scout, librarian, learning-architect,   │
│  visual-story-designer, frontend-builder, repo-session-      │
│  analyst, fact-checker, beginner-reviewer, accessibility,        │
│  ux, performance, security-privacy, skeptical)               │
└──────────────────────────────────────────────────────────────┘
                       │
                       ▼ (typed artifacts)
┌──────────────────────────────────────────────────────────────┐
│ packages/                                                    │
│ ├─ content-pipeline   schema, config, source cache, loader   │
│ ├─ design-system      tokens, Tailwind preset                │
│ ├─ validation         deterministic 7-dimension checks       │
│ └─ mcp-server         optional local MCP tools (off-default) │
└──────────────────────────────────────────────────────────────┘
                       │
                       ▼ (RecapPageContent JSON)
┌──────────────────────────────────────────────────────────────┐
│ apps/recap-web (Next.js 15 App Router, RSC + Tailwind)       │
│ ├─ src/content/<slug>.json      active artifact              │
│ ├─ src/app/page.tsx             reads loadContent()          │
│ ├─ src/components/sections/*    12 section components        │
│ └─ src/components/ui/*          shared primitives            │
└──────────────────────────────────────────────────────────────┘
```

## Data contract

`RecapPageContent` (zod-typed in `packages/content-pipeline/src/schema.ts`).
Every important claim references a `SourceMapItem.id`. Renderer never
guesses; if a section is missing the schema, the page omits it.

## Modes

- **Topic mode**: research → librarian → learning architect → visual story
  designer → frontend builder → validation board → refine.
- **Session mode**: git-read → repo-session-analyst → learning architect →
  visual story → frontend builder → validation board, with a privacy pass
  for redacted paths.

## Why a plugin, not just a skill or MCP

- A skill alone cannot ship validation, agents, hooks, and a Next.js page.
- A pure MCP server provides tools, not workflows.
- A plugin packages skills + agents + hooks + (optional) MCP + generated app
  in one shareable surface.

## Renderer choices

- Next.js 15 App Router, RSC, `force-static`, `output: "standalone"`.
- Tailwind 3.4 driven from the design-system preset.
- No client diagram renderer in v0.1 (SSR-safe pre-block + caption); upgrade
  path is a single client component swap.
- Server Components everywhere except `ProgressRail` (needs scroll cues).

## Cost discipline

- Cheap model for source-collection and lint-style reviews.
- Strong model for content synthesis and design decisions.
- Agents pass summaries, not raw page dumps.
- Source cache lives at `.recap-studio/cache/sources.jsonl`.
- Fixture mode (`RECAP_STUDIO_FIXTURE_ONLY=1`) guarantees zero network use.

## Failure modes the validator catches

- Citation drift (claims without strong sources).
- Wall-of-text density (> 60 words per card).
- Missing landmarks / skip-to-summary.
- Secret leakage in fixture/content JSON.
- Marketing fluff that survives rewrites.
- Bundle bloat (when a build exists to measure).
