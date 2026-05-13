# Agent system

Recap Studio runs a 13-agent pipeline. Agents are isolated, typed contracts;
they pass JSON, never raw context dumps.

## Pipeline (topic mode)

| # | Agent                          | Model  | Role                              | Output            |
| - | ------------------------------ | ------ | --------------------------------- | ----------------- |
| 1 | research-scout                 | haiku  | Find sources                      | `ResearchScoutOutput` |
| 2 | source-librarian               | haiku  | Score + map sources               | `SourceMap` + thin claims |
| 3 | learning-architect             | sonnet | 5-minute path                     | `RecapPageContent` (draft) |
| 4 | visual-story-designer          | sonnet | Diagrams, rhythm, animation       | `VisualPlan` |
| 5 | frontend-builder               | sonnet | Implement page                    | content file + components |
| 6a | fact-checker                  | sonnet | Claim ↔ source audit              | `DimensionResult` |
| 6b | beginner-reviewer             | haiku  | Smart-18yo POV                    | `DimensionResult` |
| 6c | adhd-accessibility-reviewer   | haiku  | Chunking, motion, landmarks       | `DimensionResult` |
| 6d | ux-design-reviewer            | sonnet | Hierarchy, polish, storytelling   | `DimensionResult` |
| 6e | performance-reviewer          | haiku  | Bundle, lazy-load, CWV risk       | `DimensionResult` |
| 6f | security-privacy-reviewer     | sonnet | Secrets, injection, side effects  | `DimensionResult` |
| 6g | skeptical-reviewer            | sonnet | Overclaim, fluff, hidden cost     | `DimensionResult` |

The reviewers (6a–6g) run **in parallel**, isolated. Their findings are
aggregated, the architect applies patches, and only failing dimensions are
re-checked. Cap = 3 iterations.

## Pipeline (session mode)

Replaces step 1–2 with `repo-session-analyst` building a `SessionDelta`
from bounded read-only `git` commands; the rest is identical.

## Hard rules (every agent inherits)

- Never fabricate citations.
- Never write outside the declared file scope.
- Never call paid APIs unless config + env permit.
- Honor `RECAP_STUDIO_FIXTURE_ONLY=1` — force fixture pathways.
- Mark uncertainty.

## Model routing

- **haiku**: source collection, lint-style reviews, simple checks.
- **sonnet**: architecture, content synthesis, design, judgment.
- **opus** (optional, manual): final design pass on premium runs.

Routing is decided by `config.costMode` × `config.modelRouting`. The agents
themselves declare a default in front matter (`model: haiku|sonnet`).

## Tool minimization

Each agent declares the smallest tool set it needs:

| Agent                    | Tools                                |
| ------------------------ | ------------------------------------ |
| research-scout           | WebSearch, WebFetch, Read, Grep      |
| source-librarian         | Read                                 |
| learning-architect       | Read, Write                          |
| visual-story-designer    | Read, Write                          |
| frontend-builder         | Read, Write, Edit, Bash              |
| repo-session-analyst     | Read, Grep, Glob, Bash               |
| fact-checker             | Read, WebFetch                       |
| beginner-reviewer        | Read                                 |
| adhd-accessibility       | Read, Grep                           |
| ux-design-reviewer       | Read                                 |
| performance-reviewer     | Read, Bash, Grep                     |
| security-privacy         | Read, Grep                           |
| skeptical-reviewer       | Read                                 |
