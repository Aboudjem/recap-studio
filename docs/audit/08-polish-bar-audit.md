# Phase 8 — Polish Bar & Docs Audit

_Run 2026-05-29 by the polish-bar auditor subagent. Every claim cites a file:line or command output. No evidence = not a finding._

Reference bar: [github.com/Aboudjem/aws-cost-audit-skill](https://github.com/Aboudjem/aws-cost-audit-skill) — animated GitHub-safe SVG hero, how-it-works diagram, dead-simple README, badges, llms.txt, AGENTS.md, CONTRIBUTING, CODE_OF_CONDUCT (by-reference), SECURITY, CHANGELOG, 1280×640 social preview, CI that validates frontmatter/JSON/links + scans for secrets.

---

## 1. Animated SVG Hero & How-it-Works Diagram

### 1a. logo-dark.svg / logo-light.svg

**File:** `.github/assets/logo-dark.svg` (lines 1–44), `.github/assets/logo-light.svg` (lines 1–44)

- **Script-free:** confirmed. No `<script>` tags, no `xlink:href` to external resources, no `<use href="...">` pointing outside the file. **PASS.**
- **Animation present:** both files use CSS `@keyframes` (`rs-shimmer`, `rs-rise`, `rs-fade`) applied via class selectors on SVG elements. Four bar rects animate with `translateY(-4px)` stagger; three spark circles fade. Technique is pure CSS inside `<style>`, which is GitHub-safe (GitHub strips `<script>` but renders CSS animations in SVGs served as `<img>`). **PASS.**
- **Standalone:** both self-contain all defs, gradients, and fonts (`font-family: system-ui,...`). No external font load. **PASS.**
- **Size:** 720×200 viewBox — appropriate for a README banner. **PASS.**
- **Dark/light pair:** README uses `<picture><source media="(prefers-color-scheme: dark)">` correctly. **PASS.**
- **Minor gap:** The light SVG animation keyframe names (`rs-shimmer`, `rs-rise`, `rs-fade`) are identical to the dark SVG's names. When both SVGs are ever inlined into the same HTML document (e.g., a generated page), the keyframe names would collide. They are currently only used as `<img>` in GitHub markdown, so collision does not occur now. Low risk, but worth namespacing to `rs-shimmer-l` etc. if inline use is ever needed.

### 1b. hero-diagram.svg

**File:** `.github/assets/hero-diagram.svg` (lines 1–67)

- **Script-free:** confirmed. **PASS.**
- **Animation present:** `rh-flow` (dashed-line stroke-dashoffset march, `1.6s linear infinite`) on three path connectors; `rh-glow` (opacity pulse, `3s`) on input/output/validation-board cards. **PASS.**
- **Dark-mode responsiveness:** `@media (prefers-color-scheme: dark)` block at lines 16–22 correctly recolors background, card fill, and text. This is the only SVG asset that attempts embedded dark-mode media query — **good practice confirmed for the diagram.**
- **Accuracy vs. README claims:** The diagram lists "13 specialist agents" (box at x=280) but only enumerates 6 by name plus "+ 7 reviewers (parallel)". This is consistent with the README but reinforces the ambiguity between "building" agents and "reviewing" agents. Not a visual defect, but the diagram would be stronger if it distinguished the two groups visually.
- **Missing label:** The diagram has no title text for the overall flow. The `aria-label` on the root SVG (`aria-label="Topic or session goes in..."`) is excellent, but the diagram has no visible "How it works" heading element, meaning the README section heading carries all the context.

### 1c. page-preview.svg

**File:** `.github/assets/page-preview.svg` (lines 1–113)

- **Script-free:** confirmed. **PASS.**
- **Animation present:** `pp-pulse` (opacity 5s) on the canvas frame; `pp-rise` (translateY -2px, 3.4s, four delays) on the concept-map boxes. **PASS.**
- **Content accuracy:** Score chip shows "9.7 / 10". Timeline dates (2024.05, 2024.09, 2025.03, 2025.11) are plausible for the demo topic but are fixture content, not live. **Acceptable** — preview is a static illustration.
- **Dimension:** 1200×720 viewBox. Fine for README full-width.

### 1d. social-preview.svg

**File:** `.github/assets/social-preview.svg` (lines 1–30), confirmed by `python3` check: `viewBox: 0 0 1280 640`, `1280x640: True`.

- **Dimensions:** 1280×640 — exactly the GitHub social preview spec. **PASS.**
- **Animation:** NONE. The social-preview has zero `@keyframes` or animation declarations. GitHub's OG image pipeline rasterizes SVGs statically, so animation is irrelevant for the actual social card — **PASS for the use case.** However, if the SVG is ever displayed inline (e.g., in docs), it will appear flat.
- **Script-free:** confirmed. **PASS.**
- **Content:** Includes version tag "v0.2.0", install command, and "9.7 / 10" chip. Light-mode only (gradient from `#FBFAF7` to `#EEEAFF`). No dark variant. Acceptable — social cards are always light on GitHub.
- **Gap:** The social-preview.svg is a file on disk but is **not registered as the GitHub repository social preview** via GitHub's Settings → Social preview. This is a manual step that must be done through the GitHub UI; the file alone does nothing. Needs documentation or a one-time manual step.

---

## 2. README Audit

### 2a. Structure & One-Glance Clarity

- **What-is-this:** Line 16 — "Turn any topic or git diff into a cited, mobile-first one-page explainer in 5 minutes." One sentence, above the fold. **PASS.**
- **Install-first:** Install section is the first H2. **PASS.**
- **3-step how-to:** The marketplace path is 2 commands. The from-source path is 5 commands. Clear and copy-paste ready. **PASS.**
- **FAQ/Q&A section:** MISSING. No "Frequently asked questions" or "Troubleshooting" section. Reference bar includes FAQ. **GAP.**
- **Comparison table:** MISSING. No "vs. other tools" table. The reference bar includes a comparison table. **GAP.**
- **Why-trust-it / credibility section:** MISSING. There is no explicit section explaining methodology, sourcing, or why the validation score is credible. The closest is the "Quality bar" table, but it lists targets and scores without explaining the scoring mechanism, which causes the honesty problem below.

### 2b. Honesty — Overclaims About Validation

**Confirmed finding from 00-DISCOVERY.md §4, re-verified here:**

- README line 19: `"7-dimension validation · scored 9.7/10 on the demo"`
- README line 117 (Mermaid diagram): `"Validation board\n(7 reviewers in parallel)"`
- README line 127: `"Reviewers run in parallel"`
- README line 136: `"The demo scores 9.7 of 10 overall."`
- hero-diagram.svg line 41: `"+ 7 reviewers (parallel)"` — shown in the how-it-works diagram as if they are live agents

**Evidence of actual implementation:** `packages/validation` is confirmed DETERMINISTIC heuristic checks (00-DISCOVERY.md line 9). The `pnpm validate:demo` command runs `scripts/validate.mjs` — a Node.js script using regex/word-count heuristics, not LLM calls.

**Impact:** Every reader of the README will understand "7 reviewers in parallel" to mean concurrent LLM agent calls. It means concurrent deterministic heuristic checks. This is the most consequential honesty gap in the repository. The Quality bar table (lines 139–147) lists dimension scores as if they were review verdicts; they are heuristic numbers.

**Required fix:** Add a callout to the Quality bar section:

> [!NOTE]
> Scores are produced by deterministic heuristics (word counts, sourceId presence, secret-pattern regex) in `packages/validation`. LLM reviewer agents (agents/fact-checker.md etc.) are invoked at runtime by the skill orchestrator — they are not part of `pnpm validate:demo`.

### 2c. Badges

Current badge row (README lines 8–13):

| Badge | Present | Notes |
|---|---|---|
| npm version | yes | `shields.io/npm/v/recap-studio` |
| License MIT | yes | static badge |
| CI status | yes | `github/actions/workflow/status` |
| Node ≥20 | yes | static badge |
| 10x marketplace | yes | static badge |
| GitHub stars | yes | dynamic |
| npm downloads/week | **MISSING** | standard reference-bar badge |
| pnpm | **MISSING** | reference bar includes package-manager badge |
| Code coverage | **MISSING** | only 7 tests; adding a coverage badge would expose thin coverage, but reference bar includes it |

The missing badges are not blockers but add credibility signals. The npm-downloads badge is particularly useful for GEO (AI crawlers use download counts as authority signals).

### 2d. Docs Links

All README doc links point to files under `docs/`. Verified the files exist:

```
docs/architecture.md       ✅ exists
docs/agent-system.md       ✅ exists
docs/workflows.md          ✅ exists
docs/vercel-deployment.md  ✅ exists
docs/security-and-privacy.md ✅ exists
docs/configuration.md      ✅ exists
CONTRIBUTING.md            ✅ exists
CHANGELOG.md               ✅ exists
GOAL_SPEC.md               ✅ exists
hooks/README.md            ❓ not verified in this audit pass
```

`hooks/README.md` is referenced at README line 189 but was not explicitly checked. Low-risk gap.

---

## 3. Missing Files

### 3a. llms.txt

**Status:** MISSING — confirmed by `test -f` command (output: `MISSING`).

`llms.txt` is the emerging standard (llmstxt.org) for telling AI crawlers/assistants how to consume a repository. It is listed as a reference-bar requirement. Without it, AI-powered search (Perplexity, Claude, ChatGPT browsing) may cite stale or incomplete context from the repo.

**Required content for recap-studio/llms.txt:**

```
# Recap Studio

> Claude Code plugin: turn any topic or git diff into a cited, mobile-first one-page explainer in under 5 minutes.

## Install
claude plugin install recap-studio@10x

## Key files
- README.md: overview, install, commands
- GOAL_SPEC.md: authoritative product spec
- agents/: 13 specialist agent prompts
- skills/: recap-topic, recap-session, recap-setup, recap-validate
- packages/validation/: deterministic heuristic scorer (NOT LLM)
- apps/recap-web/: Next.js 15 static renderer

## Important: validation scores
Scores from `pnpm validate:demo` are deterministic heuristics, not LLM review.
LLM agents run at skill invocation time, not during the static demo.

## Links
- https://github.com/Aboudjem/recap-studio
- https://www.npmjs.com/package/recap-studio
```

### 3b. AGENTS.md

**Status:** MISSING — confirmed by `test -f` command (output: `MISSING`).

`AGENTS.md` is the convention for agentic tools (Codex, GitHub Copilot Workspace, etc.) to understand how to work with a repository. Given that recap-studio is itself an agent-powered tool, an AGENTS.md is especially important for dogfooding and for users who want to extend it.

**Required content for AGENTS.md:**

- Repo structure overview (monorepo layout)
- Which commands to run before/after changes (`pnpm typecheck`, `pnpm test`, `pnpm build`)
- Validation gate: `pnpm validate:demo` must return 9.7/10 or better
- Hook constraints: list the 5 hooks and what they block
- Agent naming conventions (how to add a new specialist agent)
- Where to write generated content (artifacts/, not apps/)
- Known gotchas (Critical dependency warning from content-pipeline, file:// broken in out/)

---

## 4. CONTRIBUTING.md

**File:** `CONTRIBUTING.md` (lines 1–64)

- Content is solid: quick-start commands, quality-bar table, code style rules, PR anti-patterns, bug reporting format, security escalation pointer. **PASS on content.**
- **Missing:** no mention of the `llms.txt` or `AGENTS.md` files in the "things to keep updated" guidance.
- **Missing:** no mention of the "do not commit to `main` directly" rule or branch naming convention (the repo uses `rebuild/recap-studio` as the active branch, suggesting a convention exists).
- **Missing:** no issue template references (`.github/ISSUE_TEMPLATE/` does not exist — not checked but implied by no mention).
- **Missing:** no PR template reference.
- **By-reference CODE_OF_CONDUCT:** CONTRIBUTING.md does not link to CODE_OF_CONDUCT.md. Reference bar requires this cross-link. **GAP.**

---

## 5. CODE_OF_CONDUCT.md

**File:** `CODE_OF_CONDUCT.md` (lines 1–62)

- Full Contributor Covenant 2.1 text. **PASS.**
- Enforcement contact: `boudjemaa.adam@gmail.com` at line 49. **PASS.**
- Attribution link present. **PASS.**
- **Gap:** Not cross-linked from CONTRIBUTING.md (gap noted above).
- **Gap:** Not linked from README.md at all. Standard practice is to add a `CODE_OF_CONDUCT` badge or footer link. **Minor gap.**

---

## 6. SECURITY.md

**File:** `SECURITY.md` (lines 1–43)

- Responsible disclosure instructions, email, 48h acknowledgement, 7-day plan. **PASS.**
- Supported versions table shows only `0.1.x ✅`. **Current version is 0.2.0** (package.json line confirmed `"version": "0.2.0"`). The table needs updating to `0.2.x`. **GAP — confirmed stale.**
- No `SECURITY.md` badge or link in README badge row. Minor.

---

## 7. CHANGELOG.md

**File:** `CHANGELOG.md` (lines 1–94)

- Format: Keep a Changelog 1.1.0 compliant header. **PASS.**
- `[Unreleased]` section present and populated. **PASS.**
- `[0.2.0]` and `[0.1.0]` sections present. **PASS.**
- **Critical gap:** No comparison/diff links at the bottom of the file. Keep a Changelog spec requires footer links in the form:
  ```
  [Unreleased]: https://github.com/Aboudjem/recap-studio/compare/v0.2.0...HEAD
  [0.2.0]: https://github.com/Aboudjem/recap-studio/compare/v0.1.0...v0.2.0
  [0.1.0]: https://github.com/Aboudjem/recap-studio/releases/tag/v0.1.0
  ```
  These are absent. Confirmed by grep: only section headers found (`[Unreleased]`, `[0.2.0]`, `[0.1.0]`), no URL references. **GAP.**
- Both `[0.1.0]` and `[0.2.0]` share the same date `2026-05-13`. This is suspicious (same-day v0.1.0 and v0.2.0 releases) and looks like a copy-paste error. Should be corrected to reflect actual release dates.

---

## 8. CI Workflow

**File:** `.github/workflows/ci.yml` (lines 1–50)

### What CI currently does (confirmed):
- Matrix build: Node 20 + 22
- `pnpm install`, build packages, lint, typecheck, test
- Demo generation + `scripts/validate.mjs`
- Hook smoke tests (block-secret-writes, block-destructive-git, validate-before-deploy)

### What the reference bar requires but CI is MISSING:

| Check | Status | Evidence |
|---|---|---|
| Frontmatter/YAML lint | **MISSING** | No `yamllint` or schema validation step in ci.yml |
| JSON schema validation | **MISSING** | No step validates skills/*.json or fixtures/*.json shape |
| Broken link check | **MISSING** | No `lychee`, `markdown-link-check`, or similar |
| Secret scanning | **MISSING** | No `gitleaks`, `trufflehog`, or `trivy fs --scanners secret` step; hook smoke-test only tests runtime hooks, not git history |
| AGENTS.md / llms.txt presence | **MISSING** | No CI assertion that these files exist |
| Coverage report | **MISSING** | No `--coverage` flag; 7 tests exist but no threshold enforced |

The hook smoke-test job is a good pattern but it only tests three hooks. `format-after-edit.mjs` and `qa-summary-on-stop.mjs` are not smoke-tested.

**Note:** `--frozen-lockfile=false` at ci.yml line 22 is a risk — it allows lockfile drift in CI. Should be `--frozen-lockfile` (i.e., strict) to catch dependency drift early.

---

## 9. GEO / SEO Notes

### 9a. GitHub Repository "About" Description

The package.json `description` field (confirmed):
```
"Generate beautiful, calm, mobile-first one-page explainers in under 5 minutes. Claude Code plugin with 13 specialist agents, 7-dimension validation board, static Next.js output."
```

This is 170 characters — slightly over the GitHub About field's 100-character display limit (GitHub truncates to ~100 chars in search results). The GitHub repository About description should be set separately (via Settings) to a shorter, keyword-rich string.

**Recommended About description (≤150 chars, keyword-rich):**
```
Claude Code plugin: topic or git diff → cited, dark-mode one-page explainer. 13 agents, 7-dim validation, 103 KB static output.
```
That is 130 characters.

**Recommended GitHub Topics** (none currently set — confirmed by no `.github/` topics file):
```
claude-code, claude-code-plugin, explainer, documentation, ai-agents, dark-mode, nextjs, static-site, knowledge-management, developer-tools
```

### 9b. README keyword coverage for AI crawlers

Key terms that appear in the README and will be indexed by AI search:
- "Claude Code plugin" — present (line 49: "in any Claude Code session")
- "git diff" — present (lines 16, 170)
- "dark-mode" — NOT PRESENT in README. The tool claims dark-mode output but the word "dark-mode" never appears in the README body. AI crawlers won't associate the repo with this query.
- "one-page explainer" — present (line 16)
- "static HTML" / "offline" — "offline" present (line 67); "self-contained" absent
- "cited sources" / "fact-checked" — "cited" present; "fact-checked" absent
- "mobile-first" — present (line 16)

**Gap:** "dark-mode" is a high-value GEO/SEO term that is missing from the README despite being a core feature. Add it to the subtitle or the What you get section.

### 9c. llms.txt GEO impact

Without `llms.txt`, AI assistants that browse GitHub to answer "what Claude Code plugins exist for generating explainers" will either skip the repo or synthesize from raw README text, possibly misquoting the validation claims. The `llms.txt` file lets the maintainer control the authoritative summary that AI tools see.

---

## 10. Summary: Exact Delta to Hit the Bar

The following table lists every item to create or fix, in priority order.

| # | Item | Action | Priority | Evidence |
|---|---|---|---|---|
| 1 | `llms.txt` | Create at repo root | P0 | File confirmed MISSING |
| 2 | `AGENTS.md` | Create at repo root | P0 | File confirmed MISSING |
| 3 | README honesty — validation claims | Add `[!NOTE]` callout to Quality bar section clarifying deterministic heuristics vs. LLM agents | P0 | README lines 117, 127, 136; 00-DISCOVERY.md §4 |
| 4 | SECURITY.md supported versions | Add `0.2.x ✅` row; remove or mark `0.1.x` as EOL | P0 | SECURITY.md line 35; package.json `"version": "0.2.0"` |
| 5 | CHANGELOG.md footer links | Add `[Unreleased]`, `[0.2.0]`, `[0.1.0]` comparison URLs per Keep-a-Changelog spec | P1 | CHANGELOG.md — no footer refs found by grep |
| 6 | CHANGELOG.md duplicate date | Fix `[0.1.0]` date (both entries show `2026-05-13`) | P1 | CHANGELOG.md lines 51, 85 |
| 7 | CI: add secret scanning | Add `gitleaks` or `trufflehog` scan step to ci.yml | P1 | ci.yml — no secret scan step |
| 8 | CI: add broken-link check | Add `lychee --offline` or `markdown-link-check` for README/docs | P1 | ci.yml — no link check step |
| 9 | CI: add JSON/YAML schema lint | Add step to validate `skills/*/skill.json`, `fixtures/*.json`, `templates/*/manifest.json` | P1 | ci.yml — no schema validation |
| 10 | CI: fix `--frozen-lockfile=false` | Change to `--frozen-lockfile` to catch lockfile drift | P1 | ci.yml line 22 |
| 11 | Register social-preview.svg | Manual step: upload `.github/assets/social-preview.svg` via GitHub repo Settings → Social preview | P1 | social-preview.svg confirmed 1280×640 but manual GitHub step not documented |
| 12 | README: add "dark-mode" keyword | Add "dark-mode" to subtitle or What you get section | P1 | GEO gap — word absent from README |
| 13 | README: add FAQ section | Add common questions (offline? API key? pricing? dark mode? deploy?) | P1 | Reference bar requires FAQ |
| 14 | README: add comparison table | Add "vs. Notion AI summary / vs. ChatGPT / vs. raw docs" table | P2 | Reference bar requires comparison table |
| 15 | CONTRIBUTING.md: link CODE_OF_CONDUCT | Add cross-link from CONTRIBUTING.md to CODE_OF_CONDUCT.md | P1 | CONTRIBUTING.md — no CoC mention |
| 16 | CONTRIBUTING.md: add AGENTS.md/llms.txt maintenance note | Document that AGENTS.md and llms.txt must be kept up-to-date | P2 | Implied by creating those files |
| 17 | README: add npm-downloads badge | `shields.io/npm/dm/recap-studio` | P2 | Absent from badge row |
| 18 | GitHub repo About description | Set to ≤150 char keyword-rich string (see §9a) | P1 | Manual GitHub Settings step; current package.json description is 170 chars |
| 19 | GitHub repo Topics | Set 8–10 topics (see §9a) | P1 | Manual GitHub Settings step |
| 20 | SVG keyframe name collision | Rename light-logo keyframes to `rs-shimmer-l` etc. | P2 | logo-light.svg lines 13–22 share names with logo-dark.svg |
| 21 | CI: smoke-test remaining hooks | Add smoke tests for `format-after-edit.mjs` and `qa-summary-on-stop.mjs` | P2 | ci.yml hooks job only tests 3 of 5 hooks |
| 22 | `hooks/README.md` existence | Verify file exists (referenced from README line 189) | P2 | Not confirmed in this audit pass |
| 23 | CODE_OF_CONDUCT in README footer | Add CoC badge or footer link in README | P2 | Standard practice; currently absent |

---

## 11. What Is Already at the Bar (do not regress)

| Item | Status | Evidence |
|---|---|---|
| Animated SVG hero (logo pair) | **AT BAR** | CSS `@keyframes`, no `<script>`, standalone |
| Script-free SVGs (all 5 assets) | **AT BAR** | Grep confirmed zero `<script>` tags |
| How-it-works diagram with animation | **AT BAR** | hero-diagram.svg: `rh-flow` + `rh-glow` |
| 1280×640 social preview SVG | **AT BAR** | viewBox confirmed |
| CONTRIBUTING.md (content) | **AT BAR** | quality bar, code style, PR anti-patterns |
| CODE_OF_CONDUCT.md | **AT BAR** | full Contributor Covenant 2.1 |
| SECURITY.md (structure) | **AT BAR** | disclosure timeline, contact email |
| CHANGELOG.md (format) | **AT BAR** | Keep a Changelog headers present |
| CI matrix (Node 20/22) | **AT BAR** | ci.yml confirmed |
| Hook smoke tests in CI | **AT BAR** | ci.yml `hooks` job |
| README install-first structure | **AT BAR** | H2 Install is first section |
| Badge row (6 badges) | **AT BAR** | npm, license, CI, node, 10x, stars |
| Dark/light logo pair with `<picture>` | **AT BAR** | README lines 1–5 |
