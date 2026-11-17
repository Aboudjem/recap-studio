---
name: recap-validate
user-invocable: false
description: Use when the user types /recap validate, asks Recap Studio to "score the page", "run validation", "qa the recap", or wants the multi-agent quality report regenerated. Dispatches the validation board and writes a structured report.
arguments:
  - name: content
    description: Path to a RecapPageContent JSON, or a slug. Default = the newest artifacts/<slug>/content.json
    required: false
  - name: only
    description: Comma-separated reviewer ids (skips others). Useful for fast re-runs after a patch.
    required: false
---

# /recap validate

You run the validation board and emit a structured quality report.

## Inputs

- A `RecapPageContent` JSON, usually `artifacts/<slug>/content.json`.
- The rendered page `artifacts/<slug>/recap-<slug>.html` if it exists;
  otherwise reviewers work from the JSON only and downgrade
  performance and a11y confidence accordingly.
- The deterministic score: MCP tool `validate_content` (`slug`), or
  `node "${CLAUDE_PLUGIN_ROOT}/bin/recap.mjs" validate <content.json>`.
  It is a heuristic, not an LLM. Report it next to the reviewer scores, labeled as such.

## Reviewers (parallel, isolated)

1. `fact-checker`: every claim must reference a `sourceMap` id and the
   source must support the claim. Unsupported claims drop the score.
2. `beginner-reviewer`: read time ≤ 5 min for a smart 18-year-old.
3. `accessibility-reviewer`: chunking, motion, focus, density.
4. `ux-design-reviewer`: hierarchy, polish, storytelling, responsiveness.
5. `performance-reviewer`: bundle, lazy-load, static-first, CWV risk.
6. `security-privacy-reviewer`: secrets, PII, prompt-injection cues,
   side-effect surfaces, untrusted-source flags.
7. `skeptical-reviewer`: overclaim, marketing fluff, hidden complexity.

## Scoring

Each reviewer emits `{ score: 1..10, findings: Finding[], blockers: string[] }`.

## Thresholds (must pass)

| Facts | Beginner | A11y | UX | Perf | Sec | Simplicity |
| ----- | -------- | ---- | -- | ---- | --- | ---------- |
| 9     | 9        | 9    | 8  | 8    | 9   | 9          |

## Output

Write `artifacts/<slug>/validation.json` and print a Markdown summary:

```
## Validation report: <slug>
| Dimension | Score | Target | Status | Top finding |
| --------- | ----- | ------ | ------ | ----------- |
...
Blockers:
- ...
Auto-patchable:
- ...
```

## What you must never do

- Never inflate a score to clear a threshold.
- Never hide blockers.
- If a reviewer cannot run (e.g. perf without a build), mark
  `confidence: low` and explain why.
