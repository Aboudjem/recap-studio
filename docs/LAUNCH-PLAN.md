# Launch Plan — Recap Studio

Dated: June 2026 · Standard: Supernova Pillar 1 (borrowed-reach-first)

---

## Why borrowed reach first

Recap Studio has a visceral hook: **one command → double-clickable, offline, dark-mode explainer with cited sources**. That hook lands hardest when people *see* it — the demo GIF does most of the selling. The strategy is therefore demo-first, community-first, not a cold Show HN post into a crowded feed.

---

## Phase 1 — Warm-up (Week 1, first two days)

**Goal:** seed social proof before the dev.to post lands.

1. **Demo GIF tweet thread** — post the `.github/assets/demo.gif` (the creatine explainer) on X/Twitter `@AdamBoudj`. Caption: *"One Claude Code command. One double-clickable, offline, dark-mode explainer with cited NIH sources. No server. No npm install. No Wi-Fi needed."* Pin to profile.

2. **LinkedIn short post** — same GIF, same hook line. Tag 2–3 people who would care (Claude Code power users, educators building with AI).

3. **r/ClaudeAI** — post the GIF with title: *"Built a plugin that turns any topic into a self-contained offline explainer — one command, zero JS, works on a plane"*. Lead with the visceral fact (offline + zero deps), not the feature list.

---

## Phase 2 — Content anchor (Week 1, days 3–5)

**Goal:** a piece of content that ranks and can be linked everywhere.

4. **dev.to writeup** — *"How I built a Claude Code plugin that generates offline, self-contained HTML explainers"*. Structure:
   - Hook: the problem (AI summaries are ephemeral, ugly, and need Wi-Fi)
   - Demo GIF in the first scroll
   - Architecture diagram (the 13-agent pipeline)
   - Code snippet: `renderToHtml()` producing a zero-JS HTML string
   - Call to action: `claude plugin install recap-studio@10x` + star

5. **GitHub README hero** — confirm the demo GIF is above the fold (it is; validate it still renders on mobile dark mode in the GitHub preview).

---

## Phase 3 — Distribution (Week 2)

**Goal:** reach audiences who are not already on X or dev.to.

6. **Hacker News — ask for feedback, not votes** — *"Ask HN: I built a Claude Code plugin that makes offline HTML explainers — feedback welcome"*. Avoid a cold Show HN. An Ask HN with a working demo link (GitHub Pages sample at `aboudjem.github.io/recap-studio`) performs better for niche dev tools because it invites conversation rather than a single up/down signal.

7. **Claude Code Discord / community threads** — share in `#show-and-tell` with the GIF and a one-liner install command.

8. **Product Hunt** — schedule for 12:01 AM PST on a Tuesday or Wednesday. Tagline: *"Turn any topic into a beautiful offline explainer — one Claude Code command."* Use the demo GIF as the main media. Avoid launching the same week as a major Claude release (high noise).

---

## Visceral-hook advantage

The differentiator other tools cannot copy quickly is the **offline, double-clickable, zero-JS output**. Every marketing touchpoint should open with this fact. The comparison table in the README (self-contained offline HTML: **YES** vs No for every competitor) is the visual proof — screenshot it and add it to the dev.to post.

---

## Success metrics (30-day)

| Metric | Target |
|---|---|
| GitHub stars | +50 |
| dev.to reactions | ≥ 100 |
| r/ClaudeAI upvotes | ≥ 200 |
| Plugin installs (10x marketplace) | ≥ 30 |
| GitHub Pages demo unique visitors | ≥ 500 |

---

## What NOT to do

- Do not cold-post a Show HN with no existing community signal.
- Do not launch on a Monday or Friday (lower HN traction).
- Do not lead with the agent count (13 agents) — lead with the output (offline HTML).
- Do not post the same content on X, LinkedIn, and dev.to simultaneously — stagger by 24 hours so each platform's algorithm picks it up independently.
