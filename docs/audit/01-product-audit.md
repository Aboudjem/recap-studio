# Phase 2 — Product Audit

_Auditor: Product Auditor subagent · Date: 2026-05-29 · Branch: rebuild/recap-studio_
_Confidence labels: confirmed | likely | uncertain_

---

## 1. What is this product, really?

Recap Studio is a **Claude Code plugin** that automates the production of a static, dark-mode, mobile-first one-page educational website from either (a) a research topic or (b) a git diff / coding session. The output is a Next.js static export rendered from a typed `RecapPageContent` JSON object.

It is not a SaaS. It is not a website builder. It is a developer tool that lives inside Claude Code and produces a single HTML artifact, which today requires a local Next.js dev server or Vercel to be readable.

---

## 2. Who is it for? Job-to-be-done by use case.

### Use Case A — Topic Explainer (`/recap "<topic>"`)

**Who:** A developer or technical writer who wants to quickly produce a polished "learn this in 5 minutes" page to share with a non-technical teammate, a stakeholder, or their own future self. Secondary: a solo developer who wants a personal reference page they understand without re-googling.

**Job-to-be-done:** "When I discover a topic I need to explain or learn fast, I want a beautiful, fact-checked one-pager I can share immediately, so I don't spend 3 hours writing docs or linking to confusing Wikipedia pages."

**Current fit:** The pipeline design (research-scout → source-librarian → learning-architect → visual-story-designer → frontend-builder → validation board) is architecturally correct for this JTBD. The fixture (`latest-ai-models`) demonstrates a plausible output. The real-world artifacts in `artifacts/` (5 different topics, including French-language AI model recaps dated 2026-05-13) confirm the tool has seen actual use and produces structurally coherent content. Evidence: `artifacts/latest-ai-may-2026/validation.json` topic: "Les IA et modèles à connaître au 13 mai 2026".

**Gap:** The "share immediately" part fails hard. The static export at `out/index.html` uses absolute `/_next/static/...` paths. You cannot double-click it. You cannot email it. You cannot drop it in Slack. You must either run a local server or deploy to Vercel. This directly breaks the core JTBD for non-developer recipients.

---

### Use Case B — Session Recap (`/recap session`)

**Who:** A developer who just finished a large refactor or feature branch and wants to explain what they built — to a PR reviewer, a non-technical PM, or their future self.

**Job-to-be-done:** "When I finish a coding session, I want a visual summary of what changed and why, so my team understands it without reading the diff."

**Current fit:** The `recap-session` skill is architecturally sound: it runs read-only git commands, delegates to `repo-session-analyst` → `learning-architect` → `visual-story-designer` → `frontend-builder`, with a privacy pass that flags private path leakage. The schema (`schema-session.ts`) exists. The `--deep` accordion flag is designed.

**Gap:** There is no artifact or fixture demonstrating session mode has ever produced output. All 5 real artifacts in `artifacts/` are topic-mode recaps. Session mode is unproven in production. Evidence: `artifacts/` contains only `hermes-openclaw-nouveaux-players`, `latest-ai-may-2026`, `latest-ai-models`, `models-locaux-uncensored-mai-2026`, `studio-ia-local-m5-mai-2026` — all French or English topic recaps, zero session recaps.

---

## 3. Promise vs. Reality — Dimension-by-Dimension

### 3.1 "Beautiful, dark-mode" — PARTIALLY CONFIRMED with a caveat

**Evidence:** `apps/recap-web/src/app/layout.tsx:43` hardcodes `className="dark" data-theme="dark"`. The page renders in dark mode on a dev server. The Hero component uses semantic `<header>`, accent color classes, and clean type scale. The design vocabulary (Apple-simple, Linear-polished) is reflected in the Visual Story Designer agent prompt.

**Caveat:** The config default is `theme: "auto"` (`recap-studio.config.ts:17`). The layout hardcodes dark. These are inconsistent — if someone sets `theme: "light"` in config, the layout still hardcodes dark class. The config key has no actual effect on rendering. **Confidence: confirmed mismatch.**

**Deeper caveat:** "Beautiful" cannot be confirmed without a browser screenshot. The fixture content looks well-structured, but no visual screenshot of the actual rendered page at 360px or 1280px is in the audit docs. The SVG preview in README is a marketing asset, not an actual screenshot. **Confidence: likely OK, uncertain for the file:// case.**

---

### 3.2 "Mobile-first, works at 360px" — LIKELY, NOT CONFIRMED

**Evidence:** `page.tsx:41` max-w-3xl with px-5 at mobile. `Hero.tsx` uses responsive Tailwind classes (`text-4xl md:text-6xl`). The Comparison section is documented to convert tables to stacked cards on mobile.

**Gap:** There is no automated mobile viewport test. The 7-test suite (`pnpm test`) has only 1 recap-web test (likely a smoke render test). No Playwright or Cypress tests for 360px. **Confidence: likely, not confirmed.**

---

### 3.3 "~5-minute read" — STRUCTURALLY ENFORCED BUT VIOLATED IN PRACTICE

**Evidence:** The `checkBeginner` validator (`packages/validation/src/checks/beginner.ts:54`) fires a medium-severity finding when estimated read time exceeds 5.5 minutes at 220 wpm. This is a real heuristic. However:

- The French artifact `latest-ai-may-2026/validation.json` shows beginner score of 9/10 with finding "~7.5 min read > 5 min target" — and it **still passes** (score 9 meets target 9) despite being 50% over budget.
- The `hermes-openclaw-nouveaux-players/validation.md` shows "~5.9 min read > 5 min target" — also passes.
- The scoring formula in `checkBeginner` is `score = max(1, min(10, 10 - issues))`, so one medium finding drops score to 9, which still clears the ≥9 threshold.

**Finding:** The 5-minute promise is systematically violated at production scale. Real pages run 5.9–7.5 minutes. The validator lets them through because a single medium finding only costs 1 point and the target is 9. **Confidence: confirmed.**

---

### 3.4 "Visuals-over-text" — UNDERDELIVERED

**Evidence:** The visual sections include a Mermaid concept map (`ConceptMap.tsx`), key ideas grid, timeline, comparison table. These are real, data-driven sections, not decorative images.

**Gap:** There are no actual images, illustrations, or SVG diagrams beyond Mermaid flowcharts. The `visual-story-designer` agent prompt mentions "hand-crafted SVG" but defaults to Mermaid. The fixture `latest-ai-models.json` concept map is a Mermaid flowchart — competent but not visually striking. "Visuals-over-text" implies a visual-first experience; what's delivered is a well-structured text page with a diagram. **Confidence: confirmed underdelivery vs. the promise.**

---

### 3.5 "Non-technical-friendly" — BLOCKED BY DELIVERY

**Evidence:** The content architecture (plain-English definitions, 220 wpm read time, glossary, analogies) is designed for non-technical readers. The `learning-architect` enforces "smart 18-year-old must understand every sentence."

**Gap:** Non-technical users cannot open the output. They'd need to run `pnpm --filter recap-web dev` or have a Vercel URL. Neither is "non-technical-friendly." This is the single largest product gap. **Confidence: confirmed blocker.**

---

### 3.6 "Nothing hallucinated, every claim cited" — STRUCTURALLY ENFORCED BUT UNVERIFIABLE IN FIXTURE MODE

**Evidence:** The `checkFacts` validator (`packages/validation/src/checks/facts.ts`) checks that every `keyIdea`, `example`, `misconception`, `timeline.item`, and `comparison.row` references at least one `sourceMap` entry with `composite >= 7`. This is a real, deterministic check. The fixture scores 10/10 on facts.

**Critical finding:** In fixture mode (`RECAP_STUDIO_FIXTURE_ONLY=1`, the default), source freshness and actual URL verification are skipped. The `fact-checker` agent sets `confidence: "low"` in fixture mode and proceeds with fixture-only checks. The `research-scout` returns hardcoded fixture data tagged `provenance: "fixture"`. The 10/10 facts score on the demo means "all sourceIds in the fixture JSON point to sourceMap entries with composite >= 7" — it does NOT mean the underlying claims are true or that sources were actually fetched. **Confidence: confirmed.**

**This is not a bug — it's the documented offline-first design. But the README claim "every important claim links to a sourceMap entry" is technically correct while being misleading to a non-developer reader who assumes live verification.**

---

### 3.7 "9.7/10 scored by 7 reviewers in parallel" — MARKETING OVERCLAIM

**Evidence confirmed from 00-DISCOVERY.md:** The 9.7/10 score is produced by `scripts/validate.mjs` which runs `packages/validation` — fully deterministic heuristics. The validation checks are:
- Facts: sourceId presence and composite score thresholds
- Beginner: word count, sentence length, read time estimate
- Accessibility: section presence, landmark count (only with HTML snapshot)
- UX: section order checks
- Performance: build output size
- Security: regex for secret patterns
- Simplicity: vocabulary checks

These are sound heuristics, but they are not "7 specialist LLM reviewers." The `agents/*.md` files define agent prompts that can be dispatched by Claude at runtime — but the automated `validate:demo` script uses none of them. The score reflects compliance with structural rules, not expert judgment.

**The README states** "scored 9.7 of 10 on the demo" with the subheading "7-dimension validation · 7 reviewers in parallel" — this is confirmed misleading. A first-time reader will assume LLM review happened. **Confidence: confirmed overclaim.**

---

## 4. Product Gaps Ranked by User Impact

### Gap 1 — BLOCKER: Output is not self-contained or shareable [Impact: Critical]

**Evidence:** Next.js static export with `output: "export"` (`next.config.mjs`) generates `out/index.html` with absolute `/_next/static/...` paths. File:// protocol cannot resolve these paths. The page is a blank screen if opened directly.

**User impact:** The #1 use case — "generate a page and share it" — cannot be completed without a web server. A developer sharing with a non-technical stakeholder has no simple path. Email as HTML is broken. Slack/Notion paste is broken.

**What's needed:** Either (a) a truly self-contained single-file HTML output (CSS/JS inlined or data-URI'd), or (b) a dead-simple one-command deploy (Vercel or otherwise) that produces a shareable URL with zero configuration. The GOAL_SPEC calls for this as a core deliverable but it isn't implemented.

---

### Gap 2 — HIGH: The 5-minute promise is not enforced [Impact: High]

**Evidence:** Real artifacts run 5.9–7.5 minutes. The validator allows this. Users who share a "5-minute explainer" that takes 7.5 minutes to read lose credibility with stakeholders.

**What's needed:** The beginner checker should treat >5.5 minutes as a score 7 cap (blocker at 6+ minutes), forcing the pipeline to actually cut content. Currently one medium finding only costs 1 point.

---

### Gap 3 — HIGH: Session mode is unproven and undifferentiated [Impact: High]

**Evidence:** Zero session-mode artifacts. The session schema exists but there is no demo, no fixture, no example output for the "explain my coding session" use case. The `/recap session` skill and `repo-session-analyst` agent are designed but untested end-to-end.

**User impact:** This is a genuinely differentiated use case (no direct competitor does "explain a git diff as a beautiful one-pager"). But if it doesn't work reliably, it's a liability. A developer who runs `/recap session` and gets a broken output loses trust in the whole product.

---

### Gap 4 — HIGH: The "9.7/10 · 7 reviewers" claim is misleading [Impact: High — trust/credibility]

**Evidence:** Deterministic heuristics produce the score, not LLM agents. The README implies LLM review.

**User impact:** When a developer discovers the truth (and they will — they'll look at `validate.mjs`), the credibility of the entire product collapses. This single overclaim poisons the "nothing hallucinated" positioning. The product is telling users to "be skeptical" while itself being non-skeptical about its own claims.

---

### Gap 5 — MEDIUM: Dark-mode config is non-functional [Impact: Medium]

**Evidence:** `recap-studio.config.ts` has `theme: "auto"` but `layout.tsx:43` hardcodes `className="dark"`. The config key has no runtime effect on the rendered output. If a user wants a light-mode page (e.g., for a corporate stakeholder who prefers light themes), they cannot get it through the documented interface.

---

### Gap 6 — MEDIUM: Fact-checking is structural, not semantic [Impact: Medium — trust]

**Evidence:** The fact-checker validates sourceId presence and composite scores. It does not verify that the claim text is actually supported by the source content. A claim like "GPT-5 has 10 trillion parameters" would pass if it references a source with composite >= 7, even if that source says nothing of the sort.

**User impact:** Users who trust "every claim is cited" may be surprised when a cited claim turns out to be an unsupported inference. This is a hard problem, but the gap between the promise and the implementation should be documented honestly.

---

### Gap 7 — MEDIUM: Multi-language artifacts reveal an undocumented behavior [Impact: Medium]

**Evidence:** Five of the real artifacts are in French ("Les IA et modèles à connaître au 13 mai 2026"). The skill, schema, and config have no documented French/multi-language workflow. The `packages/content-pipeline/src/locales` directory exists but is undocumented. UI chrome has 6 locale stubs but the content itself is generated in whatever language the research returns.

**User impact:** This works, but it's accidental. A French user who gets French content might get mixed-language output (French content, English UI chrome). No documentation tells them this is supported or how to control it.

---

### Gap 8 — LOW: No reusable standalone HTML template [Impact: Low-Medium for ecosystem]

**Evidence:** GOAL_SPEC requires "a reusable Claude Code plugin with... a generated Next.js website template" that can be reused by other 10x tools. The design is locked inside `apps/recap-web`. There is no exported standalone HTML template, no `packages/template-html`, no documented way for another tool to use the visual design without cloning the full Next.js app.

---

### Gap 9 — LOW: Test coverage is minimal (7 tests) [Impact: Low for users, Medium for maintainers]

**Evidence:** `pnpm test` runs 7 tests total: 2 in validation, 4 in mcp-server, 1 in recap-web. There are no tests for the content pipeline schema validation, the loadContent path, the slug resolution logic, or any section component rendering. A refactor could silently break the renderer.

---

### Gap 10 — LOW: Config written with elevated permissions [Impact: Low — security posture]

**Evidence:** `recap-studio.config.ts` (the live config in the repo root) has `deploymentMode: "preview"` and `emailMode: "send-with-confirmation"` — elevated from the documented safe defaults. The comment says "User confirmed in-session" (2026-05-13). This is the correct behavior, but it means the repo ships with non-safe-default config, which could surprise a new contributor who clones the repo.

---

## 5. Would a stranger say "OMG I need this"?

**Honest answer: Not yet — but the bones are right.**

The product correctly identifies a real pain point: explaining complex topics or code changes to non-technical people is genuinely hard, and a beautiful one-pager is genuinely valuable. The architecture is thoughtful. The content pipeline produces structurally sound, well-cited output. The fixture demonstrates a real use case.

But the gap between "I typed `/recap "Latest AI models"`" and "I have something I can share with my non-technical boss" is still too large. The user must:

1. Have a local checkout of `recap-studio`.
2. Know to run `pnpm --filter recap-web dev`.
3. Share a localhost URL (which doesn't work for the recipient) or deploy to Vercel.

A stranger who tries the marketplace install path (`claude plugin install recap-studio@10x`) and types `/recap "what is RAG"` will end up with a `content/rag.json` file and no visible page — unless they already know Next.js and can run the dev server.

The session mode (`/recap session`) is the most differentiated and interesting use case, but it has zero demonstrated output. If it worked reliably, that alone could generate genuine word-of-mouth from developers.

**The two changes that would unlock "OMG I need this":**
1. Single-file self-contained HTML output that opens with a double-click and can be emailed.
2. A proven, artifact-backed session mode with a demo that a developer can run in < 2 minutes.

---

## 6. Scoring overclaim — recommended fix

The README subheading reads: "13 specialist agents · 7-dimension validation · static Next.js output · 103 KB First Load JS · scored 9.7/10 on the demo"

**Accurate version:** "13 specialist agents · 7-dimension heuristic validation · static Next.js output · 103 KB First Load JS · heuristic baseline 9.7/10 (LLM review runs at generation time)"

The distinction matters: heuristic baseline is a floor guarantee. LLM review at generation time is a ceiling aspiration. These should be presented separately.

---

## 7. Summary table

| Gap | Severity | User Impact | Evidence |
|-----|----------|-------------|----------|
| Output not self-contained / double-click broken | Blocker | Sharing fails entirely | `out/index.html` uses `/_next/static/` absolute paths |
| 5-minute promise violated in practice | High | Stakeholder trust | `artifacts/latest-ai-may-2026/validation.json`: 7.5 min read, score 9, passes |
| Session mode unproven | High | Core use case undelivered | Zero session artifacts in `artifacts/` |
| 9.7/10 LLM reviewer claim is misleading | High | Credibility | `packages/validation/src/` = deterministic heuristics only |
| Dark-mode config non-functional | Medium | User customization | `layout.tsx:43` hardcodes `dark`; config has no effect |
| Fact-checking is structural not semantic | Medium | Trust in citations | `checkFacts` checks sourceId presence, not claim truth |
| Multi-language is accidental | Medium | UX for non-English users | 5 French artifacts, no documented multi-lang workflow |
| No standalone HTML template for ecosystem | Low-Med | Ecosystem reuse | No exported template package |
| 7 tests total | Low | Maintainability | `pnpm test` exit 0 with 7 tests |
| Config ships with elevated permissions | Low | Security posture for new contributors | `recap-studio.config.ts` has `deploymentMode: "preview"` |
