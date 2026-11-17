---
name: recap-topic
description: Use when the user types /recap topic, /recap "<subject>", or asks Recap Studio to "make a one-page explainer", "summarize a topic", or "build a visual page about X". Writes a cited content JSON, scores it and renders one offline HTML page in the current project.
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
- Honor `RECAP_STUDIO_FIXTURE_ONLY=1`, force fixture mode even if keys exist.
- Mobile-first, reduced-motion safe.

## Routing

The `recap` skill routes bare `/recap`. If the input here is `session` or
`repo`, hand off to the `recap-session` skill. If it is a topic, continue.

## Workflow

Run this pipeline. Each step is delegated to a subagent; pass **summaries**
between steps, not raw dumps.

1. **Parse intent.** Topic, audience, depth, style, animation. Defaults come
   from `recap-studio.config.ts` when it exists, otherwise the safe defaults
   listed in the `recap-setup` skill.
2. **Plan research.** Decide intensity (`fast | balanced | deep`). In
   `economy` cost mode, prefer fixtures if they exist.
3. **research-scout**: collect 5–12 reliable primary sources. Read-only.
4. **source-librarian**: score sources, build a `sourceMap[]`, flag claims
   needing more support.
5. **learning-architect**: produce a 5-minute path: one-sentence answer,
   why-it-matters, key ideas, examples, analogies, misconceptions, glossary,
   takeaways. Every important claim must reference at least one source id.
6. **visual-story-designer**: define visual concept, section rhythm,
   diagrams (Mermaid or SVG), comparisons, timeline.

### Where files go (do this BEFORE step 7)

Work in the user's current project. No clone of recap-studio is needed.

- Content: `artifacts/<slug>/content.json` in the working directory.
- Page: `artifacts/<slug>/recap-<slug>.html` in the working directory.

Use the plugin's MCP tools when they are connected. Otherwise use the bundled CLI:

| Step | MCP tool | CLI fallback |
| --- | --- | --- |
| Save content | `create_run_artifact` (`slug`, `filename: "content.json"`, `content`) | write the file yourself |
| Score | `validate_content` (`slug`) | `node "${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs" validate artifacts/<slug>/content.json` |
| Render | `render_recap_html` (`slug`) | `node "${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs" render artifacts/<slug>/content.json -o artifacts/<slug>/recap-<slug>.html` |

When `${CLAUDE_PLUGIN_ROOT}` does not resolve, replace `node "${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs"`
with `npx -y github:Aboudjem/recap-studio`. Run `... example` to see a valid content file.

Inside a checkout of recap-studio itself, the same paths work. The hosted Next.js
track (`apps/recap-web`) is optional and only for that checkout.

7. **frontend-builder**: emit the `RecapPageContent` JSON and save it as
   `artifacts/<slug>/content.json` (table above).
8. **Validation board (parallel):** fact-checker, beginner-reviewer,
   accessibility-reviewer, ux-design-reviewer, performance-reviewer,
   security-privacy-reviewer, skeptical-reviewer. Also run the deterministic
   score (`validate_content`). It is a heuristic, not an LLM, and does not fetch sources.
9. **Aggregate scores.** If any dimension is under target (see below),
   patch and re-run only the failing reviewers. Cap at 3 iterations and
   document any blocker honestly.
10. **Render the self-contained page** (table above). The page is ONE dark-mode
    HTML file with all CSS inlined and zero JavaScript. It opens with a
    double-click, offline. Prefer diagrams with `kind: "svg"` (hand-authored
    inline SVG) over `kind: "mermaid"` so the standalone file is fully visual.
11. **Open it, then ask about deploy.** Open the file for the user
    (`open` on macOS, `xdg-open` on Linux, `start` on Windows). Only inside a
    recap-studio checkout with Vercel configured (`.vercel`, `VERCEL_TOKEN`, or
    `deploymentMode !== "disabled"` in `recap-studio.config.ts`), ask:
    **"Deploy to Vercel?"** On an explicit yes, run `npm run deploy:preview`.
    **Never deploy without an explicit yes.** Otherwise do not mention deploy.
12. **Report.** Finish with the Final report block (below). State the HTML path,
    the scores, and the deploy decision.

## Targets

| Facts | Beginner | A11y | UX | Perf | Sec | Simplicity |
| ----- | -------- | ---- | -- | ---- | --- | ---------- |
| 9     | 9        | 9    | 8  | 8    | 9   | 9          |

## Output to the user

Always finish with the **Final report** block from
`docs/workflows.md#final-report-format`, file summary, architecture
summary, commands run, lint/typecheck/test/build results or blockers,
demo command, scores, deploy/email instructions, env vars, known limits.

## Demo

`node "${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs" demo` renders the built-in
"Latest AI models" example and scores it, without any network call.
