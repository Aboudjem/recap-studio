# Developer Experience Audit — Recap Studio v0.2.0

_Phase 4 · DX / First-run friction log_  
_Auditor: Developer Experience Auditor · Date: 2026-05-29_  
_Branch: `rebuild/recap-studio` · Ground truth from: `docs/audit/00-DISCOVERY.md`_

---

## Scope and method

This audit traces the **first-run experience from zero** for two distinct user profiles:

- **Profile A — marketplace installer**: discovers the plugin via the README, runs `claude plugin marketplace add Aboudjem/10x && claude plugin install recap-studio@10x`, then types `/recap "..."`.
- **Profile B — source cloner**: follows the "From source" path, runs the four clone-install-demo-dev commands, and previews the page locally.

Every finding cites the file and line (or command) that produced the evidence. Confidence labels follow the scheme from `00-DISCOVERY.md`: `confirmed | likely | uncertain | blocked | needs-user-approval`.

---

## Friction log (ordered by where a user hits it)

### F-01 · Marketplace command syntax mismatch  
**Where:** README.md line 44-47 (first code block under "Install")  
**Confidence:** confirmed  
**Severity:** blocker for Profile A

The README instructs:
```bash
claude plugin marketplace add Aboudjem/10x
claude plugin install recap-studio@10x
```

`claude plugin marketplace --help` confirms that `marketplace add` accepts a GitHub repo slug — that command is syntactically valid. However:

1. The `Aboudjem/10x` marketplace repo exists on GitHub (`curl` to GitHub API returns `EXISTS - Aboudjem/10x`), but it is **not listed in any configured marketplace** on the auditor's machine and its contents were not verified to include a `recap-studio` plugin entry. A user who runs `claude plugin marketplace add Aboudjem/10x` will succeed or fail silently depending on whether the marketplace index file in that repo actually registers the plugin.
2. There is **no `/recap` slash command** registered in any skill. The four skills are named `recap-topic`, `recap-session`, `recap-setup`, and `recap-validate` (verified: `grep name: skills/*/SKILL.md`). The skill descriptions do match `/recap "<subject>"` as a trigger phrase for `recap-topic`, but this routing is implicit LLM intent-detection — not a guaranteed command alias. A user who types `/recap "..."` may or may not land in the right skill depending on the Claude Code version and prompt matching.
3. The README "Commands" section (line 168-175) documents five Claude Code commands all starting with `/recap`, but none of the skills are named `recap` — they're `recap-topic`, `recap-session`, etc. This creates a name-vs-command gap that confuses anyone reading the source.

**Impact:** A Profile A user who gets past installation and types `/recap "Latest AI models"` has no guarantee the right skill fires. The gap is undocumented.

---

### F-02 · Live config has non-default dangerous values  
**Where:** `recap-studio.config.ts` lines 17-18  
**Confidence:** confirmed  
**Severity:** high

The repo-root config ships with:
```ts
deploymentMode: "preview",
emailMode: "send-with-confirmation",
```

The `recap-setup` skill's documented safe defaults (`skills/recap-setup/SKILL.md` lines 41-50) and `docs/configuration.md` both state the defaults should be `"disabled"` for both. The actual committed config was set to production-like values during a specific session ("Created 2026-05-13 to enable explicit-confirmation deploy + email for the Hermes / OpenClaw recap" — `recap-studio.config.ts` header comment, line 7-9).

A source cloner who runs `pnpm demo:latest-ai-models` gets the demo working, then later triggers a deploy or email accidentally because the config is already permissive. The README `> [!NOTE]` block (line 66) says "Fully offline by default" — that is true at the script level, but the committed config contradicts the intent.

**Error message experience:** None. There is no warning printed at demo time that the active config has non-default deploy/email modes.

---

### F-03 · recap-setup SKILL.md references a file that does not exist  
**Where:** `skills/recap-setup/SKILL.md` line 18  
**Confidence:** confirmed  
**Severity:** high

The setup skill instructs the agent:
> "create it from the template in `packages/content-pipeline/src/config-template.ts`"

That file does not exist. `find packages/content-pipeline/src -name "config-template*"` returns nothing. The actual template generation code is `renderConfigSource()` in `packages/content-pipeline/src/config.ts` (lines 67-80). An agent following the skill literally will try to read a non-existent file and either halt or hallucinate a path.

The skill body also inlines a hardcoded template (lines 33-50) as a fallback, so the agent *might* recover, but only if it ignores the bad file reference. The inconsistency also erodes trust in other file references in the skill.

---

### F-04 · No quickstart doc; README "See it in action" mixes two steps  
**Where:** `README.md` lines 71-82; `docs/` directory listing  
**Confidence:** confirmed  
**Severity:** medium

There is no `docs/quickstart.md` or equivalent. The README's "See it in action" section presents a single compound command:
```bash
pnpm -w demo:latest-ai-models && pnpm --filter recap-web dev
```
But the "Install → From source" section (lines 56-63) shows four separate steps. A new user cannot tell which form is canonical.

The `pnpm -w` flag is the correct short form of `--workspace-root` (confirmed: `pnpm -w demo:latest-ai-models` runs successfully). However this flag is not explained anywhere in the README, and the `pnpm --filter recap-web dev` step uses a completely different flag syntax. A user who tries `pnpm demo:latest-ai-models` (without `-w`) from inside a workspace sub-directory will get `ERR_PNPM_NO_SCRIPT`.

The "CONTRIBUTING.md" quick start (lines 8-11) uses `pnpm -w` correctly for the two top-level scripts, but drops it for the dev server (`pnpm --filter recap-web dev`) without explanation. This inconsistency across three documents (README, CONTRIBUTING, CONTRIBUTING quickstart) forces a user to reconcile three slightly different invocations.

---

### F-05 · Time-to-value measurement: demo only works after pnpm install (not documented clearly)  
**Where:** `README.md` lines 56-64; `scripts/demo-latest-ai-models.mjs`  
**Confidence:** confirmed  
**Severity:** medium

The "From source" path lists `pnpm install` as step 1, which is correct. However:

1. The `> [!NOTE]` callout at line 66 says "The demo never makes a network call" but does not mention the install step at all, implying the demo runs immediately after clone. A user who reads that callout before reading the install steps may try `node scripts/demo-latest-ai-models.mjs` directly — that script uses only Node built-ins and actually would run without install, so this is not a hard error, but the `pnpm --filter recap-web dev` step requires the full workspace to be installed.

2. `pnpm install` in a monorepo with a `"Critical dependency"` build warning (`packages/content-pipeline/dist/load-config.js`, confirmed in `00-DISCOVERY.md`) will print a warning that a new user may interpret as an error. No README note exists to pre-empt this.

3. `pnpm --filter recap-web dev` is never timed or estimated. On a cold machine the first `next dev` compile takes 15-30 seconds with no progress indicator beyond Next.js's own spinner. No "this takes a moment" callout exists.

---

### F-06 · The generated HTML (out/) fails to open with a double-click  
**Where:** `apps/recap-web/out/index.html` lines 1-10 (confirmed live)  
**Confidence:** confirmed  
**Severity:** blocker (GOAL requirement)

`out/index.html` references absolute `/_next/static/...` paths:
```html
src="/_next/static/chunks/bb811a4c-43a8980e2894d808.js"
```

Opening `file:///.../out/index.html` in any browser loads an unstyled, broken page — all JS and CSS return 404 because the browser treats `/_next/...` as relative to the filesystem root. The GOAL_SPEC (`GOAL_SPEC.md` — implicit in the "works offline, opens with a double-click" requirement from `00-DISCOVERY.md`) is unmet. There is no README note explaining that `pnpm --filter recap-web dev` (or a static server) is required to view the page. A user who builds and tries to share `out/index.html` as a file attachment gets a broken page with no explanation.

**No error message is shown** — the page simply renders unstyled with missing JS.

---

### F-07 · Script output vs README "Commands" table mismatch  
**Where:** `scripts/demo-latest-ai-models.mjs` lines 54-57; `README.md` lines 159-164  
**Confidence:** confirmed  
**Severity:** low

After `pnpm -w demo:latest-ai-models`, the script prints:
```
Next steps:
  pnpm validate:demo          # deterministic quality report
  pnpm --filter recap-web dev # preview locally on http://localhost:3000
```

But the README "Commands" table uses `pnpm -w validate:demo` (with the `-w` flag). The script omits `-w`, which works only from the repo root but fails from a sub-directory. Minor, but adds cognitive load.

---

### F-08 · Theme default is "auto", not dark-mode-first  
**Where:** `packages/content-pipeline/src/config.ts` line 16; `recap-studio.config.ts` line 17  
**Confidence:** confirmed  
**Severity:** low (GOAL drift)

The zod schema default for `theme` is `"auto"` (`config.ts:16`). The committed config also uses `"auto"` (`recap-studio.config.ts:17`). The GOAL requires dark-mode-first. This is a single-field change but is undocumented as a known deviation.

---

### F-09 · AGENTS.md and llms.txt are absent  
**Where:** repo root  
**Confidence:** confirmed  
**Severity:** low

`AGENTS.md` is absent (verified: `ls AGENTS.md → NOT FOUND`). `llms.txt` is absent. Both are standard polish-bar files for agentic tools. Their absence means other agents exploring this repo via standard protocols get no machine-readable context. This is a one-time 5-minute fix.

---

### F-10 · "config-template.ts" ghost reference confuses config onboarding  
**Where:** `skills/recap-setup/SKILL.md` line 18; `docs/configuration.md` lines 30-35  
**Confidence:** confirmed  
**Severity:** medium (same root cause as F-03, different surface)

`docs/configuration.md` says:  
> "Create or update via `/recap setup`. The skill refuses to enable ... automatically — you must change those yourself."

But it does not mention that `renderConfigSource()` in `packages/content-pipeline/src/config.ts` is the actual template function. A contributor who wants to change the default config file shape must discover `renderConfigSource()` by reading source — it is not linked from the configuration doc or the setup skill.

---

### F-11 · Hooks are not automatically active for source-cloners  
**Where:** `hooks/hooks.json`; `README.md` no mention of Claude Code settings  
**Confidence:** confirmed  
**Severity:** medium

`hooks/hooks.json` defines 5 hooks (block-secret-writes, block-destructive-git, validate-before-deploy, format-after-edit, qa-summary-on-stop). The plugin.json references `"hooks": "./hooks/hooks.json"`. However, for **source cloners** (Profile B) who are not installing via `claude plugin install`, these hooks are **not automatically activated** — they require the user to manually register the hooks.json with their Claude Code settings, or use the plugin install path. The README has no mention of how to activate hooks for source cloners. A user who clones the repo and runs `/recap "..."` directly (e.g., by opening the folder in Claude Code) will get no hook protection.

---

### F-12 · pnpm-w flag undocumented; error for users running from sub-directory  
**Where:** `README.md` lines 61-62  
**Confidence:** confirmed  
**Severity:** low

`pnpm -w` (shorthand for `--workspace-root`) runs the named script on the monorepo root's `package.json`. Without it, `pnpm demo:latest-ai-models` inside `apps/recap-web/` would fail with `ERR_PNPM_NO_SCRIPT`. This is only a friction point for users who `cd` into a sub-directory, but the README does not explain why `-w` is needed or what it does.

---

### F-13 · validate:demo path is hardcoded, unlike validate  
**Where:** `package.json` line 23; `scripts/validate.mjs`  
**Confidence:** confirmed  
**Severity:** low

`pnpm validate:demo` calls `node scripts/validate.mjs apps/recap-web/src/content/latest-ai-models.json` (hardcoded path). `pnpm validate` calls `node scripts/validate.mjs` (no args, auto-detects active slug). If a user has run a live recap (non-fixture) and wants to score it, they must know to use `pnpm validate` not `pnpm validate:demo`. The distinction is not explained in the README Commands table — both rows just say "score the active page across 7 dimensions" vs the actual behavior.

---

### F-14 · No "what a new user produces in 5 minutes" end-state description  
**Where:** README.md overall  
**Confidence:** confirmed  
**Severity:** medium

The README is well-written but describes *what the system is*, not *what a new user will see in 5 minutes*. There is no "After these four commands, here is what you get" walkthrough — no screenshot of the terminal output, no link to a hosted demo page, no iframe preview. The one preview image is an SVG wireframe mock, not a real screenshot of the generated page. The "< 5 min to value" claim is marketing; the path to that value is not made viscerally clear.

---

### F-15 · MCP server path (packages/mcp-server/dist/index.js) does not exist pre-build  
**Where:** `.claude-plugin/plugin.json` line 26  
**Confidence:** confirmed  
**Severity:** medium

`plugin.json` references `packages/mcp-server/dist/index.js` as the MCP server command. That `dist/` directory is generated by `pnpm build` and does not exist in the repo. If Claude Code tries to start the optional MCP server before build, it will fail silently (because `optional: true`). However, there is no note in the README or plugin docs telling a new installer to run `pnpm build` first. For a source cloner who has not run build yet, the MCP tools show as available in the plugin but produce errors when called.

---

## Summary table

| ID    | Where user hits it | Severity | Confidence | One-line summary |
|-------|--------------------|----------|------------|------------------|
| F-01  | After install, first /recap command | blocker | confirmed | No /recap skill exists; routing is implicit; marketplace not pre-configured |
| F-06  | After pnpm build, open out/ | blocker | confirmed | Absolute /_next/ paths break file:// double-click |
| F-02  | Any deploy/email trigger | high | confirmed | Committed config has permissive deploy/email modes that contradict "offline by default" |
| F-03  | /recap setup | high | confirmed | recap-setup skill references config-template.ts which does not exist |
| F-04  | First npm run attempt | medium | confirmed | README mixes two flag styles; no quickstart doc; pnpm -w unexplained |
| F-05  | After clone, before install | medium | confirmed | install step and build warning not pre-empted; no time estimate for dev server |
| F-10  | Contributing / customizing config | medium | confirmed | renderConfigSource() is undiscoverable; config-template reference is dead |
| F-11  | Source cloner DX | medium | confirmed | Hooks not auto-active for Profile B (clone path); no activation instructions |
| F-14  | README first impression | medium | confirmed | No "here is what you produce in 5 min" end-state; mock preview not real screenshot |
| F-15  | MCP tools after install | medium | confirmed | mcp-server/dist/index.js missing pre-build; no build-first note |
| F-07  | After running demo script | low | confirmed | Script next-steps omit -w flag vs README table |
| F-08  | Theme default | low | confirmed | theme: "auto" not dark-mode-first (GOAL drift) |
| F-09  | Agent ecosystem integration | low | confirmed | AGENTS.md and llms.txt absent |
| F-12  | pnpm flag onboarding | low | confirmed | pnpm -w undocumented |
| F-13  | validate vs validate:demo | low | confirmed | Distinction between two validate commands unexplained |

---

## Time-to-value estimate

| Profile | Actual time (no prior knowledge) | Blockers before first page |
|---------|----------------------------------|---------------------------|
| A (marketplace) | Unknown — F-01 blocks at first command | 1 confirmed blocker, routing may never fire |
| B (source clone) | ~8–12 min (install + demo + build warning confusion + dev server wait) | F-05, F-06; first page visible at localhost:3000 in ~10 min |
| B (double-click output) | Never works | F-06 is a hard blocker |

Target is < 5 minutes. Profile B reaches a working page at ~8-12 min due to install time and unexplained steps. Profile A's first-value time is indeterminate pending F-01 resolution.

---

## Recommended fixes (ordered by priority)

1. **F-01 (blocker):** Add a `recap` skill (or alias skill) named exactly `recap` that routes to `recap-topic` or `recap-session`. Document the exact marketplace index URL structure in `docs/`.
2. **F-06 (blocker):** Add a `basePath` + `assetPrefix` option to `next.config.mjs` for a self-contained single-file build, or document that `pnpm dlx serve out/` (or `python3 -m http.server -d out/`) is required and add it to the README as the "open the page" step.
3. **F-02 (high):** Reset `recap-studio.config.ts` to the safe defaults (`deploymentMode: "disabled"`, `emailMode: "disabled"`). Add a `> [!WARNING]` callout to the README that the committed config is the *developer's personal config* and may differ from defaults.
4. **F-03 / F-10 (high):** Delete the `config-template.ts` reference from `recap-setup/SKILL.md`. Replace with: "call `renderConfigSource()` from `packages/content-pipeline/src/config.ts`". Link from `docs/configuration.md`.
5. **F-04 (medium):** Add a `docs/quickstart.md` with a single linear path, explaining `pnpm -w` once, and unifying the README + CONTRIBUTING command styles.
6. **F-05 (medium):** Add a `> [!NOTE]` in README about the `"Critical dependency"` warning being benign. Add a "first compile takes ~20s" note before the `dev` command.
7. **F-11 (medium):** Add a "Activating hooks (source clone)" section to `hooks/README.md` and link from the main README, explaining how to add `hooks/hooks.json` to Claude Code project settings.
8. **F-14 (medium):** Replace the SVG mock with a real terminal-gif or hosted screenshot. Add a "30-second demo path" callout at the top of the README showing the exact terminal output and a thumbnail of the generated page.
9. **F-15 (medium):** Add `pnpm build` to the install quickstart, or note that MCP tools require a build step. Add a `postinstall` script that prints a hint.
10. **F-09 (low):** Create `AGENTS.md` (one paragraph, links to docs/architecture.md and agents/) and `llms.txt` (one-paragraph summary + links). 5-minute task.
11. **F-08 (low):** Change `theme` default in `config.ts` and `recap-studio.config.ts` to `"dark"`.
12. **F-07 / F-12 / F-13 (low):** Normalize all example commands to use `pnpm -w` for workspace-root scripts. Add a one-liner footnote in the README: "`pnpm -w` = run at the monorepo root."
