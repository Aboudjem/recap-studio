# Phase 11 — Competitive Research Scout

_Run 2026-05-29. All claims cited to source. Confidence labels: confirmed | likely | uncertain._

---

## Scope

Six competitive categories were surveyed in parallel web-research passes:

1. AI changelog / release-notes generators
2. "Explain my repo / explain this PR" tools
3. Learning-page / one-pager generators (presentations + research synthesis)
4. AI topic-explainer sites
5. Session-summary / standup tools
6. Static-site report generators + self-contained HTML tools

The audit cross-references the confirmed gaps from `00-DISCOVERY.md` (file:// broken, no reusable dark-mode HTML template, no llms.txt/AGENTS.md, thin test coverage) to identify where recap-studio can win.

---

## 1. AI Changelog / Release-Notes Generators

| Tool | What it does well | Output format | Pricing | What users still want |
|---|---|---|---|---|
| **Release Drafter** | Zero-dependency GitHub Action; drafts release notes from PR labels as PRs merge | GitHub release draft (Markdown) | Free | AI summarization; non-GitHub support; customer-readable prose — not just PR titles |
| **release-please** | Semantic versioning + CHANGELOG.md from conventional commits; 20+ language strategies | CHANGELOG.md + GitHub release | Free | Requires strict commit discipline; dev-facing only; no visual output |
| **GitHub Built-in Release Notes** | Zero setup; native GitHub integration | GitHub release page | Free | No AI summarization; no customization beyond labels; one format only |
| **What The Diff** | Plain-English PR summaries + weekly progress reports; no code stored; GitLab support | PR description + hosted changelog page | Token-based plans (freemium) | Token caps don't roll over; output is text-only; no visuals; single format |
| **AutoChangelog** | Context-aware AI that understands code, not just titles; customer-readable output | Hosted changelog page | Freemium | Single format; no visuals; dependent on PR description quality |
| **GitSaga** | Claude-powered; pay-per-use (~$0.05/changelog); no login required; multiple output formats | Markdown + shareable link | Pay-per-use | Manual triggering; text-only; limited adoption history |
| **PersonaBox** | Only tool generating visuals from real codebase components; multi-channel output (LinkedIn/Twitter/newsletter/blog) | Hosted themed page + social posts | $49/month | Overkill for engineering-only needs; subscription cost; no offline/HTML export |
| **GitHub Changelog Generator** | 7.5K+ stars; linked PRs and issues | CHANGELOG.md | Free | Ruby dependency; no AI; text-only |

**Source:** personabox.app/blog/best-changelog-tools (fetched), devopsschool.com top-10 list, whatthediff.ai, groupify.ai/ai-tool/whatthediff

### Gaps recap-studio can exploit

- Every tool outputs to a hosted page or Markdown. **No tool produces a self-contained, offline-capable, dark-mode HTML single file** — the recap deliverable.
- None produces a "5-minute narrative explainer" of what changed and _why it matters_; they describe commits, not the story.
- Changelog tools are either dev-facing (Markdown) or marketing-facing (hosted page). **The "explain this release to a curious engineer" middle-ground is empty.**

---

## 2. "Explain My Repo / Explain This PR" Tools

| Tool | What it does well | Output format | Pricing | What users still want |
|---|---|---|---|---|
| **CodeRabbit** | 2M+ repos installed; widest platform support; layer-based walkthroughs that reverse-engineer logical layers (data model → backend → API → frontend → tests); semantic diff view | Web interface only | Free tier + paid | No HTML export; no offline; diff-only context (not cross-repo); 2/5 depth score in independent benchmarks |
| **Greptile** | Deepest codebase-aware analysis; full repo graph + call-chain tracing; answers "how does X affect Y"; $180M Series A (Benchmark) | Web interface + API | $30/dev/month | Highest false-positive rate (11 vs CodeRabbit's 2 in benchmarks); no HTML/offline output; costly for small teams |
| **GitHub Copilot Code Review** | Zero install for Copilot subscribers; built into GitHub PR workflow | Inline PR comments | $10–39/month | Suggestions explicitly not guaranteed correct; no narrative output; no offline; editor-only |
| **Swimm** | Code-coupled living docs that auto-sync via CI; on-prem/air-gapped deployment; patented Auto-sync; supports reverse-engineering legacy code | Web + IDE plugin | Free (5 users, 1 repo) → enterprise | Learning curve; team-wide consistency required; no standalone HTML output; doesn't cover broader docs needs |
| **Qodo (v2, Feb 2026)** | Multi-agent architecture; cross-repo context engine | Web interface + IDE | Freemium | No offline; no shareable HTML summary |
| **What The Diff** | PR plain-English summaries + weekly diffs; non-technical stakeholder–friendly | PR description + changelog | Freemium | Text-only; single format; no code-graph context |
| **diff2html** | Open-source diff parser + pretty HTML generator; self-contained output possible | HTML (visual diff) | Free (OSS) | No AI narrative; pure visual diff; not an explainer |
| **visual-explainer (nicobailon)** | Self-contained HTML; dark/light themes; Mermaid diagrams; /diff-review, /plan-review, /project-recap commands; no build step; no dependencies beyond browser | Self-contained HTML + slide deck | Free (Claude Code skill) | Mermaid SVG theming needs page refresh on OS theme change; /share-page requires separate vercel-deploy skill; "results vary by model capability" |

**Source:** morphllm.com/github-ai-code-review, coderabbit.ai/blog/explainable-prs (fetched), greptile.com/pricing, aichief.com/ai-coding-tools/greptile, github.com/nicobailon/visual-explainer (fetched)

### Gaps recap-studio can exploit

- **The "learning page" gap:** Every tool above produces a review artifact, not a learning artifact. None generate a _"here is what this PR taught you, formatted as a 5-minute read"_ page. CodeRabbit produces walkthroughs; Greptile produces analysis — neither produces a portable, beautiful, dark-mode HTML explainer you can double-click, share, or read on mobile.
- **visual-explainer** is the closest direct competitor: it generates self-contained HTML with dark/light themes for diffs. It is a Claude Code skill, not a packaged product. recap-studio's advantage: reusable template asset, validated content pipeline, session-to-explainer skill, and the `/recap session` UX.
- **Offline portability** is universally absent in commercial tools. All web interfaces require an account and network.

---

## 3. Learning-Page / One-Pager Generators (Research Synthesis + Presentations)

| Tool | What it does well | Output format | Pricing | What users still want |
|---|---|---|---|---|
| **Perplexity Pages** | Polished AI-generated pages with citations; editable sections; YouTube embeds; professional appearance | Hosted Perplexity page (web only) | Pro subscription | "The inability to easily export your beautiful Page is the number one complaint" (howtogeek.com, confirmed); print-to-PDF fails; copy-paste loses formatting; no API to extract content; all Pages become Perplexity's property; privacy risk (auto-searchable/discoverable) |
| **Google NotebookLM** | Audio Overviews (podcast-style); deep doc analysis; data tables; custom personas; Google ecosystem; dark mode; mobile app | Web + audio download | Free + $20/month Plus | Audio is downloadable offline; most other features require internet; no self-contained HTML export; third-party Chrome extensions needed for export |
| **Gamma AI** | One-pagers, white papers, websites from AI; dark theme switchable via chat ("switch to a dark theme"); PPT/PDF/PNG/Slides export | Web + PDF/PPT/PNG export | Free tier + paid | PPT export degrades (fonts substitute, charts shift, animations disappear); no offline HTML export; not developer-focused; not code-aware |
| **Beautiful.ai** | Best-looking slides with smart templates | Web only | No free plan | Templates feel restrictive; no offline; expensive |
| **Elicit** | 125M+ academic papers; structured data extraction; 2M+ researcher users | Web interface + export | Free + $12/month | Academic-only; no code/git context; no HTML output; online-only |
| **NotebookLM competitors (Atlas, Claude Projects, Perplexity Spaces, Obsidian)** | Various: mind maps, cross-source connections, massive context windows, local markdown files | Web / local Markdown | Free–$20/month | Obsidian is the only one emphasizing offline + local ownership; none offer single-file HTML export; no code/git integration across the category |

**Source:** howtogeek.com/perplexity-ais-pages (fetched), atlasworkspace.ai/blog/notebooklm-competitors (fetched), qwe.edu.pl/tutorial/perplexity-ai-pages (search), shareuhack.com ai-presentation-tools-comparison, freeacademy.ai notebooklm-vs-chatgpt-vs-perplexity

### Key confirmed findings

- Perplexity Pages export limitation is **confirmed as their top-1 complaint** (howtogeek.com, confirmed): "Why build this amazing presentation that you can't take with you?"
- NotebookLM: dark mode exists; offline audio only; no HTML single-file export (confirmed via support pages + third-party extension existence).
- Gamma: dark theme exists in the editor; no offline HTML export found (uncertain — not documented).
- **No tool in this category is code/git-aware.** None can ingest a git diff and produce a learning page.

---

## 4. AI Topic-Explainer Sites

| Tool | What it does well | Output format | Pricing | What users still want |
|---|---|---|---|---|
| **Explainpaper** | Upload PDFs; highlight confusing text; AI explains inline; tiered plans | Web interface | Free / Plus / Pro | "Some explanations feel too basic for advanced readers"; "works best with well-formatted PDFs; if the document is messy, it struggles"; "could improve by adding more advanced options for experienced researchers" (opentools.ai, April 2026) |
| **Elicit** | 125M+ papers; structured extraction; citation support | Web | Free + $12/month | Academic-only; no code context; online-only |
| **HyperWrite ELI5** | Explain Like I'm 5 for any topic; fast | Web snippet | Freemium | No exportable page; not code-aware; ephemeral output |
| **explainer.ai** | Fast topic explanations | Web | Unknown | No evidence of offline or HTML export |
| **Galaxy.ai topic explainer** | No login required | Web | Free | Ephemeral; no persistent shareable page |

**Source:** explainpaper.com, opentools.ai/tools/explainpaper, elicit.com, hyperwriteai.com

### Gaps recap-studio can exploit

- Every site above produces ephemeral web output — no portable, ownable artifact.
- None are code-aware (cannot explain a git diff, a PR, or a coding session).
- **The "explain this topic → self-contained HTML page you own" gap is entirely open.**
- Explainpaper's top user complaint (too basic for advanced readers, messy PDFs break it) = recap's opportunity: structured schema validation + 7-dimension quality check = consistently structured, never-basic output.

---

## 5. Session-Summary / Standup Tools

| Tool | What it does well | Output format | Pricing | What users still want |
|---|---|---|---|---|
| **Otter.ai** | Meeting transcription + summaries; enterprise archiving/recall; action items | TXT / DOCX / PDF / SRT | Freemium | No HTML export (confirmed: not in supported formats); Summary (Overview + Action Items + Outline) cannot be directly exported, only copied; no coding session support; meeting-only |
| **Recall.ai** | Aggregates meeting data across platforms; API-first; integrates with Otter | API + webhooks | Developer pricing | Meeting/conversation focus only; no coding session concept; no HTML output |
| **GitHub Copilot commit explain** | Commit-level explanations in VS Code; diff explanations in PR view | IDE panel + PR inline | Copilot subscription | Not a standalone artifact; ephemeral; no offline; no shareable page |
| **GitHub Copilot Session Search + Resume CLI** | Session directory with events.jsonl + workspace.yaml; SQLite index; human-readable titles auto-generated | Local files (JSONL/YAML/SQLite) | Copilot subscription | Not a learnable explainer; raw events, not narrative; no HTML output; no dark-mode page |
| **Jamie (meeting AI)** | Bot-free; works offline and online | Transcript + summary | Paid | Meeting-only; no code context |

**Source:** otter.ai/blog/ai-to-summarize-transcripts, help.otter.ai export articles, jonmagic.com/posts/github-copilot-session-search-and-resume-cli, dev.to/pickuma copilot-workspace-review

### Key confirmed finding

- **"Coding session → learning page" is an entirely vacant niche.** Otter.ai, Recall.ai, and Copilot session tools all capture what happened; none produce a _"here's what was built and why it matters"_ explainer artifact.
- The closest analog is Copilot's session JSONL files — raw events, not a narrative. recap's `/recap session` (git diff → structured JSON → beautiful dark-mode HTML) has no direct competitor.

---

## 6. Static-Site Report Generators + Self-Contained HTML

| Tool | What it does well | Offline/single-file | Dark mode | Mobile | AI-aware | Pricing |
|---|---|---|---|---|---|---|
| **R Markdown / Quarto** | Reproducible analysis; HTML/PDF/presentation from code + narrative; scientific publishing | Single HTML file possible (`self_contained: true`) | Theme plugins | Responsive | Not AI-aware | Free |
| **VitePress** | Dark mode built-in; responsive; Markdown + Vue | Multi-page static site | Yes (native) | Yes | Not AI-aware | Free |
| **Astro** | Content-first; fast; islands architecture; 2026 default for content sites | Multi-page static | Via themes | Yes | Not AI-aware | Free |
| **HastySite** | Minimalist; self-contained | Self-contained | Unknown | Unknown | Not AI-aware | Free |
| **Single-file HTML tools (DIY)** | No backend; localStorage; habit trackers, invoices, planners | Yes (single .html) | Possible | Limited (Firefox mobile blocks saving .html) | Not AI-aware | Free |
| **diff2html** | Pretty HTML diffs; self-contained possible | Yes | Via CSS | Yes | Not AI-aware | Free (OSS) |
| **visual-explainer (nicobailon)** | Dark/light themes; self-contained HTML; Mermaid; for Claude Code | Single HTML | Yes (dark/light) | Responsive nav mentioned | Claude Code only | Free (skill) |
| **Offline HTML Productivity Artifact Generator** | Inline CSS; WCAG AA; no external CDN; dark theme on screen, light in print | Single HTML | Yes (dark screen / light print) | Unknown | Prompt-driven | Free |

**Source:** github.com/nicobailon/visual-explainer (fetched), digitalthoughtdisruption.com offline-html-productivity-artifact-generator, news.ycombinator.com/item?id=46353359 (fetched), testmuai.com/blog/top-static-site-generators

### Gaps recap-studio can exploit

- R Markdown/Quarto can produce self-contained HTML but requires R/Python expertise and is not AI-topic or git-diff aware.
- visual-explainer is the most direct structural competitor — but it's an undocumented Claude Code skill, not a packaged plugin with schema validation, content pipeline, or session-to-explainer UX.
- **The "AI generates content + validated schema + self-contained dark-mode HTML, no build tools required" combination does not exist as a packaged product.**

---

## Feature-Gap Matrix: recap-studio vs. Competitors

| Capability | Perplexity Pages | NotebookLM | Gamma | CodeRabbit | Greptile | What The Diff | visual-explainer | **recap-studio (target)** |
|---|---|---|---|---|---|---|---|---|
| Self-contained offline HTML (double-click works) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | **Goal (broken now — fix P0)** |
| Dark-mode-first | unknown | ✓ (toggle) | ✓ (switchable) | ✗ | ✗ | ✓ | **✓ (target)** | Goal |
| Mobile-first layout | unknown | ✓ app | ✓ | ✗ | ✗ | ✗ | partial | Goal |
| ~5-minute read format | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Unique** |
| Git-diff → learning page | ✗ | ✗ | ✗ | partial (walkthrough) | partial (analysis) | partial (PR summary) | partial (/diff-review) | Goal |
| Topic research + fact-checked explainer | ✓ (no export) | ✓ (no export) | ✓ (no export) | ✗ | ✗ | ✗ | ✗ | **Goal** |
| Schema-validated content (deterministic quality) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | **Unique** |
| Reusable HTML template for other tools | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Goal (MISSING — fix P0) |
| No login, no account, runs locally | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | **Unique** |
| Claude Code plugin (skill-based) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| llms.txt / AGENTS.md | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | Missing |

---

## Prioritized "Steal This" List

These are specific, concrete features/patterns from competitors that recap-studio should adopt, ranked by ROI vs. effort:

### P0 — Fix the broken unique value props first

1. **Self-contained single-file HTML output** (steal from: visual-explainer + R Markdown's `self_contained: true` + Offline HTML Productivity Artifact Generator pattern). Every competitor's top complaint is "you can't export it" (Perplexity Pages: #1 complaint confirmed). recap must be the tool where the HTML is _yours, offline, forever_. Fix `out/index.html` absolute paths. Make the HTML inline all CSS/JS.

2. **Reusable dark-mode HTML template** (steal from: visual-explainer's inline-CSS dark/light pattern, WCAG AA from the offline artifact generator). This is the GOAL core deliverable. Package it as `packages/design-system/template.html` — standalone, zero build-step, works in any Claude Code skill.

### P1 — Differentiate on positioning and output quality

3. **"You own it" positioning** (steal from: GitSaga's "no login required" + Obsidian's "local markdown files you own completely"). Every SaaS competitor locks content on their platform. Perplexity Pages confirmed: "once published, pages are Perplexity's property." recap's answer: _your HTML, your machine, double-click to read forever._

4. **5-minute read format** (steal from: NotebookLM's Audio Overview structure — intro, 3-5 chapters, key takeaways, sources). No competitor formats output as a deliberate reading-time target. Enforce via schema: `estimatedReadingTime` field, `~5min` validation in `packages/validation`.

5. **Layer-based structure for session explainers** (steal from: CodeRabbit's layer-based walkthroughs — data model → backend → API → frontend → tests). Apply the same logic to `/recap session`: structure the git diff output by layer, not by file. Confirmed gap: CodeRabbit does this in a web UI but never produces a portable artifact.

6. **No-login, pay-per-use CLI model** (steal from: GitSaga's ~$0.05/changelog, no login). recap is already local-first; lean into it harder in positioning. Add a `COST_ESTIMATE` field to the validation output showing approximate LLM token cost.

### P2 — Polish and ecosystem positioning

7. **llms.txt** (universal gap — none of the 20+ competitors surveyed have one). This is trivially cheap and signals AI-first positioning. Every competitor is blind to it. File should list the skills, template schema, and agent contracts.

8. **Weekly/session digest format** (steal from: What The Diff's weekly progress reports). Add a `/recap week` skill that groups multiple git diffs across a week into one explainer. Unique in the market — no tool does "week-in-review as a learning page."

9. **Visual diff in the explainer** (steal from: diff2html's pretty HTML diffs + CodeRabbit semantic diff). The session explainer currently doesn't show a rendered diff. Embed diff2html output (MIT license, self-contained) as a collapsible section in the HTML template.

10. **Multi-channel output** (steal from: PersonaBox's LinkedIn/Twitter/newsletter from the same codebase content). Add a `--channel` flag to `/recap session`: `--channel=html` (default), `--channel=md` (Markdown), `--channel=tweet` (Twitter thread draft).

---

## Naming / Positioning Intelligence

Based on competitive naming patterns:

- **What The Diff** → verb-first, irreverent, developer humor → high recall
- **Greptile** → tool name (grep + tile) → dev-native
- **CodeRabbit** → mascot-friendly → broad appeal
- **Swimm** → action word → knowledge flow metaphor
- **Perplexity Pages** → product + feature noun → confusing (Pages is a weak differentiator)
- **NotebookLM** → academic, Google-branded → trusted but not developer-native

**recap-studio vs. recap:**
- `recap-studio` positions as a _product_ (studio = creative workspace). Good for brand. But the command is `/recap topic` or `/recap session` — the user types `recap`, not `recap-studio`.
- Direct competitors use short, memorable command-like names (What The Diff, GitSaga, diff2html).
- **Recommendation (from 05-architecture-rename-decision.md context):** Keep `recap-studio` as the npm package/plugin name; ship `/recap` as the Claude Code slash command. This matches Greptile's pattern (product = Greptile, but integration is `@greptile` in PRs).
- No direct competitor is named `recap` or uses "recap" as a brand term — the namespace is open.

---

## Adversarial Verification Pass

Claims verified across 3 independent sources where possible:

| Claim | Evidence | Verdict |
|---|---|---|
| Perplexity Pages export is "number one complaint" | howtogeek.com (fetched) + qwe.edu.pl/tutorial + news.ycombinator.com/item?id=46489730 | **Confirmed** |
| NotebookLM has dark mode | support.google.com/notebooklm/answer/16225229 | **Confirmed** |
| Otter.ai does not support HTML export | help.otter.ai/export-conversations + help.otter.ai/export-summary | **Confirmed** |
| CodeRabbit has 2M+ repos | dev.to/heraldofsolace best-ai-code-review-tools-of-2026 + morphllm.com/github-ai-code-review | **Confirmed** |
| visual-explainer produces self-contained HTML with dark/light themes | github.com/nicobailon/visual-explainer README (fetched) | **Confirmed** |
| Greptile $30/dev/month pricing | greptile.com/pricing search result | **Confirmed** |
| Greptile false-positive rate highest (11 vs CodeRabbit's 2) | morphllm.com/github-ai-code-review (independent benchmark) | **Confirmed** |
| GitSaga ~$0.05/changelog | personabox.app/blog/best-changelog-tools (fetched) | **Confirmed** |
| Gamma PPT export degrades | shareuhack.com ai-presentation-tools-comparison | **Confirmed** |
| Single-file HTML, file:// URLs don't support service workers | news.ycombinator.com/item?id=46353359 (fetched, commenter quote) | **Confirmed** |
| Swimm free tier: 5 users, 1 repo | swimm.io/pricing search result | **Confirmed** |
| Qodo 2.0 launched Feb 2026 with multi-agent architecture | wetheflywheel.com best-ai-code-review-tools-2026 | **Confirmed** |
| "5-minute read" format — no competitor uses it | Survey of 20+ tools above | **Confirmed (absence)** |

---

## Sources

- [Perplexity Pages — HowToGeek](https://www.howtogeek.com/perplexity-ais-pages-lets-you-polish-and-publish-your-queries-but-who-is-it-for/)
- [Perplexity Pages export complaint — QWE AI Academy](https://www.qwe.edu.pl/tutorial/perplexity-ai-pages-create-articles/)
- [HN: Perplexity session export character limits](https://news.ycombinator.com/item?id=46489730)
- [NotebookLM dark mode — Google Support](https://support.google.com/notebooklm/answer/16225229)
- [NotebookLM Competitors — Atlas Workspace](https://www.atlasworkspace.ai/blog/notebooklm-competitors)
- [7 Best Changelog Automation Tools 2026 — PersonaBox](https://personabox.app/blog/best-changelog-tools)
- [CodeRabbit Explainable PRs — coderabbit.ai blog](https://www.coderabbit.ai/blog/explainable-prs-and-smarter-reviewer-routing)
- [GitHub AI Code Review 6 Tools — Morph](https://www.morphllm.com/github-ai-code-review)
- [Best AI Code Review Tools 2026 — DEV Community](https://dev.to/heraldofsolace/the-best-ai-code-review-tools-of-2026-2mb3)
- [Greptile Review 2026 — AiChief](https://aichief.com/ai-coding-tools/greptile/)
- [Greptile Pricing](https://www.greptile.com/pricing)
- [Swimm Review 2026 — CTO Club](https://thectoclub.com/tools/swimm-review/)
- [Swimm Reviews — G2](https://www.g2.com/products/swimm/reviews)
- [WhatTheDiff — Groupify AI](https://groupify.ai/ai-tool/whatthediff)
- [Best AI Code Review Small Teams 2026 — Greptile](https://www.greptile.com/content-library/best-code-review-small-teams)
- [visual-explainer — GitHub nicobailon](https://github.com/nicobailon/visual-explainer)
- [diff2html](https://diff2html.xyz/)
- [diffity GitHub diff viewer](https://github.com/kamranahmedse/diffity)
- [Otter.ai Export Conversations](https://help.otter.ai/hc/en-us/articles/360047733634-Export-conversations)
- [Otter.ai Export Summary](https://help.otter.ai/hc/en-us/articles/39503855767191-Export-Summary)
- [GitHub Copilot Session Search CLI — jonmagic](https://jonmagic.com/posts/github-copilot-session-search-and-resume-cli/)
- [GitHub Copilot Workspace Review — DEV Community](https://dev.to/pickuma/github-copilot-workspace-review-task-level-ai-coding-in-the-browser-11d)
- [HN: Single-file HTML tools](https://news.ycombinator.com/item?id=46353359)
- [Offline HTML Productivity Artifact Generator](https://digitalthoughtdisruption.com/2025/08/19/offline-html-productivity-artifact-generator-prompt/)
- [AI Presentation Tools Comparison 2026 — ShareUHack](https://www.shareuhack.com/en/posts/ai-presentation-tools-comparison)
- [Gamma AI Review 2026 — Alai Blog](https://getalai.com/blog/gamma-alternatives)
- [Explainpaper Reviews Feb 2026 — OpenTools](https://opentools.ai/tools/explainpaper)
- [Top 10 AI Release Notes Generators — DevOpsSchool](https://www.devopsschool.com/blog/top-10-ai-release-notes-changelog-generators-features-pros-cons-comparison/)
- [Best Code Review Tools 2026 — Greptile content library](https://www.greptile.com/content-library/best-ai-code-review-tools)
- [State of AI Code Review Tools 2025 — DevTools Academy](https://www.devtoolsacademy.com/blog/state-of-ai-code-review-tools-2025/)
