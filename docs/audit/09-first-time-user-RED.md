# 09 — First-Time User RED Baseline

**Auditor role:** Smart non-expert developer. Has never seen Recap Studio. Reading only `README.md`. Simulating literally following the README to get a first useful result. Time budget: 5 minutes.

**Date:** 2026-05-29  
**README version audited:** HEAD (after v0.2 merge)

---

## The Simulation, Step by Step

### Step 0 — One-glance impression (3 seconds)

I land on the repo. My eye goes to the tagline:

> **"Turn any topic or git diff into a cited, mobile-first one-page explainer in 5 minutes."**

OK. Clear enough. I understand what the output is (a one-page website), and I understand one of the two inputs (a topic). "git diff" is already a bit more insider — I'd need to re-read.

The sub-headline is immediately confusing:

> _"13 specialist agents · 7-dimension validation · static Next.js output · 103 KB First Load JS · scored 9.7/10 on the demo"_

That's five numbers and four nouns aimed at a builder audience. As a first-timer, I don't know if "103 KB First Load JS" is good or bad. "13 specialist agents" sounds like marketing, not a reason to install. **I do not yet know what this tool does for ME.**

**Friction point 1 — the sub-headline front-loads implementation details nobody asked for.**

---

### Step 1 — I scroll to Install

I see two install paths. README says:

> "The fastest path is the marketplace install."

I copy the commands:

```
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

**Friction point 2 — `Aboudjem/10x` is not explained.** What is "10x"? A GitHub repo? A paid service? A registry? I have no idea if `Aboudjem/10x` is a public repo I can inspect, a private server I need credentials for, or a namespace that might disappear. The `marketplace add` command takes a GitHub repo as source, so this presumably points to `github.com/Aboudjem/10x` — but the README never says this. There is no link to that repo and no description of what it contains.

I check whether the `10x` marketplace even exists: the README links to `https://github.com/Aboudjem/10x` only in the badge (labelled "10x marketplace"), but there is no explanatory sentence like "10x is our public plugin registry at github.com/Aboudjem/10x". A new user will not notice the badge href.

**Friction point 3 — no validation that the marketplace install actually works.** The README gives me two commands and then immediately jumps to:

```
/recap "Latest AI models"
```

There is no "you should see X" confirmation step. If the marketplace is unavailable, if the plugin is not yet published, or if I mistype the command, I have no diagnostic path.

---

### Step 2 — After install, I type `/recap "Latest AI models"`

The README implies this command just works. But:

- The skill that powers `/recap` is named **`recap-topic`** (confirmed in `skills/recap-topic/SKILL.md`). The user-facing command surface in the Claude Code session is `/recap`, but the README table at the bottom lists `/recap "<topic>"` and `/recap session` as separate sub-commands.
- The README never explains that `/recap` and `/recap-topic` are two names for the same thing, or that internally the plugin registers a skill called `recap-topic`. A curious user who types `/recap-topic` in Claude Code and gets nothing would be lost.

**Friction point 4 — command name mismatch between install instruction (`/recap`) and the actual skill directory name (`recap-topic`) is invisible to the user but creates support confusion.** The README shows `/recap session` as a valid form, but never says whether to type `/recap session` or `/recap-session`. The `skills/` directory has a file named `recap-session`, not `session`. So `/recap session` and `/recap-session` are different token sequences — it is not obvious which one Claude Code resolves.

---

### Step 3 — I try the source path instead (because marketplace might be broken)

I copy:

```bash
git clone https://github.com/Aboudjem/recap-studio
cd recap-studio
pnpm install
pnpm -w demo:latest-ai-models    # generate the offline demo page
pnpm -w validate:demo            # 7-dimension quality report
pnpm --filter recap-web dev      # http://localhost:3000
```

**Friction point 5 — `pnpm -w` is not explained.** `-w` is the pnpm "workspace root" flag. A developer who has never used a pnpm monorepo will not know this, and `npm run demo:latest-ai-models` (the instinct for most Node developers) will fail because scripts live only in the workspace root `package.json`. The README never says "this is a pnpm monorepo" or "you must use pnpm, not npm or yarn".

The badge shows `node ≥ 20` but there is no pnpm version requirement stated anywhere. Developers who only have pnpm 7 or 8 installed may hit workspace-protocol errors silently.

**Friction point 6 — pnpm prerequisite is implicit, not called out.**

---

### Step 4 — I run `pnpm -w demo:latest-ai-models`

The README says:

> "Recap Studio runs fully offline by default. The demo never makes a network call. No paid API key is required to try it."

The script source (`scripts/demo-latest-ai-models.mjs`) confirms there are no network calls — it reads a fixture file and copies it into `apps/recap-web/src/content/`. Good. **Offline claim is accurate.**

But then I must also run `pnpm --filter recap-web dev`. This starts a Next.js dev server. The README says "http://localhost:3000". Next.js dev servers take 5–15 seconds to compile. During that time the terminal prints Webpack/Turbopack output that looks alarming to a new user (hundreds of lines of module resolution).

**Friction point 7 — "open in 30 seconds" (line 73 of README) is plausible only if Node modules are already cached.** A fresh `pnpm install` on a slow connection can take 2–5 minutes on its own. The 30-second promise is measured from a warm cache, not from zero.

---

### Step 5 — I look at the "See it in action" section

> "The repo ships with a real, validated demo page for "Latest AI models" that you can open in 30 seconds"

Then immediately:

> [!IMPORTANT]  
> The demo page is generated from a fixture and is clearly labeled as such. Replace the fixture with a live research run by setting an API key and unsetting `RECAP_STUDIO_FIXTURE_ONLY`.

**Friction point 8 — "Replace the fixture" is a dead end.** Which API key? Claude API? OpenAI? Anthropic? Where do I set it? In `.env`? In `recap-studio.config.ts`? The README links to `docs/configuration.md` at the bottom, but this critical unlocking instruction (how to go from demo to real output) is buried in a callout box that warns me the demo is fake, then tells me to "set an API key" without saying which one or where. A first-time user who wants a real result from their own topic has no clear next step.

---

### Step 6 — I try to understand the Commands table

The README has two commands tables:

**Table 1 — pnpm scripts:**

| Command | What it does |
|---|---|
| `pnpm -w demo:latest-ai-models` | Generate the offline demo page |
| `pnpm -w validate:demo` | Score the active page across 7 dimensions |
| `pnpm -w history` | List every recap in `artifacts/` with scores |
| `pnpm -w auto-refresh -- <slug>` | Re-validate a stored recap (cron-friendly) |
| `pnpm --filter recap-web dev` | Preview the page on localhost:3000 |
| `pnpm --filter recap-web build` | Build the static site |
| `pnpm deploy:preview` | Vercel preview deploy (gated by config + env) |
| `pnpm deploy:prod` | Vercel production deploy (double-gated) |

**Table 2 — Claude Code slash commands:**

| Command | What it does |
|---|---|
| `/recap "<topic>"` | Build a full explainer page from a topic |
| `/recap session` | Explain a coding session from `git diff` and commits |
| `/recap session --deep` | Same, with a per-file deep-dive accordion |
| `/recap setup` | Create `recap-studio.config.ts` with safe defaults |
| `/recap validate` | Re-score the active page |

**Friction point 9 — two completely separate command surfaces with no explanation of when to use which.** The pnpm commands are for people who cloned the repo. The `/recap` commands are for people who did the plugin install. But both tables appear in the same "Commands" section with no header distinguishing them. A user who installed via marketplace will try to run `pnpm -w demo:latest-ai-models` in their own project directory and get "workspace not found". A user who cloned the repo will wonder how to use `/recap validate` from the terminal.

**Friction point 10 — `/recap validate` and `pnpm -w validate:demo` appear to be different things** (one re-scores via Claude agents, one runs `scripts/validate.mjs` directly) but the README does not clarify this. A user who runs both and gets different scores will be confused about which one to trust.

---

### Step 7 — "opens with a double-click / works offline" claim

The README does not actually say "double-click". It says:

> "Recap Studio runs fully offline by default."
> "The demo never makes a network call."

The implicit promise is: clone → install → one command → browser page. That chain is accurate but requires pnpm, Node 20, and a working build toolchain. **It is not a "just works" experience for a developer on a locked-down corporate machine or a Windows machine without a Unix shell.**

---

### Step 8 — Safety defaults section

> "Every side effect is off by default."

This is good and confidence-inspiring. But then:

> "Hooks refuse `push`, `reset --hard`, `rebase`, `clean -fdx`."

A first-timer will not know what "Hooks" means in this context (Claude Code hooks, not git hooks). The README links to `hooks/README.md` for details, but does not explain how the hooks are activated or whether they require any setup.

**Friction point 11 — "hooks" are referenced as if self-explanatory, but for a developer not already using Claude Code hooks, there is no setup instruction for activating them.**

---

## Verdict: Can you get a result in < 5 minutes?

| Path | Verdict |
|---|---|
| Marketplace install → `/recap "..."` | **Unverifiable from README alone.** The `Aboudjem/10x` registry existence and plugin publication status are opaque. |
| Clone → demo → localhost | **Technically yes, but ≥5 min on a cold cache.** The "30 seconds" promise requires warm Node modules. The next step after the demo (real output) is a dead end without docs. |

---

## Friction Log — Ranked by Severity

| # | Severity | Quoted README text that caused confusion | What a first-timer thinks |
|---|---|---|---|
| 1 | HIGH | `"claude plugin marketplace add Aboudjem/10x"` | What is `Aboudjem/10x`? Is this a real public registry? Where do I verify it exists? |
| 2 | HIGH | `"Replace the fixture with a live research run by setting an API key and unsetting RECAP_STUDIO_FIXTURE_ONLY."` | Which API key? Set it where? This is the most important unlock and it has no link. |
| 3 | HIGH | `/recap session` vs `/recap-session` | Are these the same? The skill directory is named `recap-session` but the command is `/recap session`. |
| 4 | MEDIUM | `pnpm -w demo:latest-ai-models` | What is `-w`? Why not `npm run`? No mention of pnpm monorepo. |
| 5 | MEDIUM | Two separate command tables with no audience label | Do I use pnpm commands or slash commands? Under what circumstances? |
| 6 | MEDIUM | `"The demo page is generated from a fixture and is clearly labeled as such."` | If it's fake data, why would I show it to anyone? Is this tool actually useful for me? |
| 7 | MEDIUM | `"you can open in 30 seconds"` | Requires warm cache. Cold clone takes much longer. |
| 8 | LOW | `"13 specialist agents · 7-dimension validation · 103 KB First Load JS"` | None of this tells me what I get or why I should care. |
| 9 | LOW | Hooks referenced without activation instructions | Do hooks auto-activate? Do I need to configure `.claude/settings.json`? |
| 10 | LOW | `/recap validate` vs `pnpm -w validate:demo` | Are these the same? Different? Which score should I trust? |
| 11 | INFO | `recap-topic` vs `/recap` naming mismatch | Invisible to users but creates support confusion when debugging. |

---

## What the Docs/UX Must Beat (the bar)

To beat this RED baseline, the README must:

1. Name the `Aboudjem/10x` marketplace explicitly and link to its GitHub URL in the install step.
2. Add a "what you get after install" confirmation step (e.g., "you should see `/recap` available as a command").
3. Separate the two command tables under clear audience headers: **"If you installed via marketplace"** and **"If you cloned the repo"**.
4. Provide the API key setup instruction (which key, which env var, which file) in the same callout box that mentions `RECAP_STUDIO_FIXTURE_ONLY`.
5. State pnpm and its version as an explicit prerequisite.
6. Clarify `/recap session` vs `/recap-session` (or unify the surface to one canonical form).
7. Replace the sub-headline implementation metrics with a one-line user benefit.
