---
name: recap-topic
description: Use when the user types /recap, /recap topic, /recap "<subject>", or asks Recap Studio to "make a one-page explainer", "summarize a topic", or "build a visual page about X". Routes to /recap session when the input is "session", "repo", or empty inside a git repo with uncommitted changes.
arguments:
  - name: topic
    description: Free-text topic to recap. Wrap in quotes for multi-word topics.
    required: true
  - name: depth
    description: beginner | intermediate | expert (default config.explanationDepth)
    required: false
  - name: research
    description: fast | balanced | deep (default config.researchIntensity)
    required: false
  - name: style
    description: light | dark | auto (default config.theme)
    required: false
  - name: animation
    description: none | low | medium | high (default config.animationIntensity)
    required: false
---

# /recap topic

You are the orchestrator for Recap Studio's **topic mode**. Your output is a
production one-page educational website backed by a typed
`RecapPageContent` JSON object and a validation report.

## Hard rules

- Never fabricate citations. Mark uncertainty.
- Never call the network unless `recap-studio.config.ts` exists, the user
  has confirmed, and the relevant API key is in env.
- Never write `.env`, secrets, or any path matching `**/secrets/**`.
- Honor `RECAP_STUDIO_FIXTURE_ONLY=1` — force fixture mode even if keys exist.
- Mobile-first, ADHD-friendly, reduced-motion safe.

## Routing

If the user types `/recap` alone or `/recap session`/`/recap repo`, hand off
to the `recap-session` skill. If they pass a topic, continue here.

## Workflow

Run this pipeline. Each step is delegated to a subagent; pass **summaries**
between steps, not raw dumps.

1. **Parse intent.** Topic, audience, depth, style, animation. Defaults come
   from `recap-studio.config.ts` via `loadConfig()` in
   `packages/content-pipeline`.
2. **Plan research.** Decide intensity (`fast | balanced | deep`). In
   `economy` cost mode, prefer fixtures if they exist.
3. **research-scout** — collect 5–12 reliable primary sources. Read-only.
4. **source-librarian** — score sources, build a `sourceMap[]`, flag claims
   needing more support.
5. **learning-architect** — produce a 5-minute path: one-sentence answer,
   why-it-matters, key ideas, examples, analogies, misconceptions, glossary,
   takeaways. Every important claim must reference at least one source id.
6. **visual-story-designer** — define visual concept, section rhythm,
   diagrams (Mermaid or SVG), comparisons, timeline.
7. **frontend-builder** — emit `apps/recap-web/src/content/<slug>.json` and
   make sure `apps/recap-web/src/app/page.tsx` reads it via `loadContent()`.
8. **Validation board (parallel):** fact-checker, beginner-reviewer,
   adhd-accessibility-reviewer, ux-design-reviewer, performance-reviewer,
   security-privacy-reviewer, skeptical-reviewer.
9. **Aggregate scores.** If any dimension is under target (see below),
   patch and re-run only the failing reviewers. Cap at 3 iterations and
   document any blocker honestly.
10. **Build & report.** Run `pnpm --filter recap-web build` if available.
    If not, mark the build step as "blocked: environment lacks dependencies"
    and surface the JSON content + page source as proof.

## Targets

| Facts | Beginner | ADHD | UX | Perf | Sec | Simplicity |
| ----- | -------- | ---- | -- | ---- | --- | ---------- |
| 9     | 9        | 9    | 8  | 8    | 9   | 9          |

## Output to the user

Always finish with the **Final report** block from
`docs/workflows.md#final-report-format` — file summary, architecture
summary, commands run, lint/typecheck/test/build results or blockers,
demo command, scores, deploy/email instructions, env vars, known limits.

## Demo

`pnpm demo:latest-ai-models` regenerates the offline fixture for
"Latest AI models" and revalidates it without any network call.
