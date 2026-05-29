# DECISIONS.md — Rebuild Decisions & Evidence Log

_Recorded 2026-05-29. Every decision uses the six-part Evidence block format.
Confidence labels follow the audit convention:
`confirmed` | `likely` | `uncertain` | `blocked` | `needs-user-approval`._

---

## Decision 1 — Add `packages/html-renderer` for self-contained output instead of post-processing the Next.js export

### Summary
Introduce a new pure-TypeScript package `@recap-studio/html-renderer` that renders a single self-contained dark-mode HTML string from a content JSON, with all CSS inlined, zero JavaScript, and zero `/_next/` references — instead of attempting to post-process the output of `next export`.

### Evidence
The baseline build produced HTML that referenced `/_next/static/…` asset paths. Opening the exported file from the filesystem via `file://` produced a blank page because the browser resolved those paths relative to the root filesystem, not the Next.js dev server. This was the single largest gap identified in the audit.

Post-processing a Next.js export to inline assets is fragile: asset fingerprints change on every build, the HTML entrypoint changes shape across Next.js versions, and the approach adds a mandatory `next build` + `next export` dependency just to view a recap offline. A standalone renderer — taking content JSON as input and emitting a complete self-contained HTML string — is self-sufficient, version-stable, testable in isolation, and reusable by any other 10x tool without pulling in the full Next.js dependency tree.

The renderer inlines all CSS as custom properties and component classes, uses `<details>` for accordions, renders SVG diagrams inline, and is safe under `prefers-reduced-motion`. It is documented in `packages/html-renderer/TEMPLATE.md` and `README.md` for reuse.

**Confidence: confirmed** — the `/_next/` path problem was verified on disk (`docs/audit/PLAN.md` §P0 item 1; confirmed-from-primary facts). The self-contained file was independently verified: 0 `/_next/` refs, 0 `<script>` tags, opens via `file://` (screenshots in `docs/audit/screens/`). 9 tests pass.

### Risk
The renderer is a new code path maintained separately from the Next.js UI. Styling drift between the hosted (`apps/recap-web`) and self-contained track is possible. Mitigated by sharing CSS token definitions and running snapshot regression tests.

### Expected impact
Any user can double-click the HTML output and see the full recap — no server, no Node.js, no internet required. The file is email-safe and archivable. Other 10x tools can import `renderToHtml()` without a Next.js dependency.

### Test plan
- 9 unit tests in `packages/html-renderer` covering `renderToHtml`, `renderFromJson`, `getBaseStyles`, error paths, and theme variants.
- Integration: `pnpm render:demo` writes `artifacts/…/recap-*.html`; verify 0 `/_next/` refs and 0 `<script>` tags with `grep -c '/_next/' output.html`.
- Snapshot test: rendered output is committed to `packages/html-renderer/__snapshots__/` and diff-reviewed on every PR.

### Rollback
Delete `packages/html-renderer`; revert the `scripts/render-html.mjs` call. The Next.js hosted track is unaffected.

---

## Decision 2 — Keep Next.js for the hosted/Vercel track (dual-track architecture)

### Summary
Maintain `apps/recap-web` as a Next.js application for the hosted deployment track while adding the standalone HTML renderer for the offline/email/double-click track. Do not collapse to one track.

### Evidence
The hosted track provides features the self-contained file cannot: live syntax highlighting via Prism/Shiki, animated transitions, Mermaid diagram rendering via the hosted CDN, Vercel Preview URLs for sharing, and OpenGraph metadata for link unfurling. These depend on JavaScript execution and a CDN. Removing Next.js would drop all of them.

The self-contained track provides features the hosted track cannot: zero-dependency offline viewing, email attachment safety, archival durability, and cross-editor CLI use (`recap render content.json`). Removing the standalone renderer would drop those.

Both tracks are served from the same content JSON; the renderer and the Next.js pages share the same data shape. The dual-track architecture adds approximately one package and one script, which is low overhead relative to the functionality it preserves.

**Confidence: confirmed** — `apps/recap-web` build is green, First Load JS 103 KB, `next export` confirmed working for the hosted track. The self-contained track was independently verified.

### Risk
Two rendering surfaces can diverge visually or in data handling. Mitigated by a shared `@recap-studio/content-pipeline` package that owns schema validation and is used by both tracks.

### Expected impact
Users on the hosted track get a full interactive experience with live Mermaid and sharing URLs. Users offline, in CI, or embedding in emails get the self-contained file. Neither group is degraded.

### Test plan
- CI: `pnpm build` (Next.js) + `pnpm test` (renderer) both pass in the same workflow step.
- Smoke test: `pnpm render:demo` produces the self-contained file; `pnpm dev` serves the hosted page.

### Rollback
Remove `packages/html-renderer` and `scripts/render-html.mjs`. No change to `apps/recap-web`.

---

## Decision 3 — All-sans-serif typography + tasteful violet-blue-teal gradients

### Summary
Replace the previous mixed serif/sans-serif display treatment with all-sans-serif (Inter) throughout, and add a calm gradient accent track (violet → blue → teal) applied to hero glow, headline text, eyebrows, icon chips, number badges, card edges, and timeline markers. Serif display face dropped entirely.

### Evidence
This was a direct user directive recorded in the session facts. The serif display face introduced a mismatch between the premium visual intent and the technical-tool context; Inter is the established sans-serif for developer tooling UIs. The gradient accent was scoped to decorative elements only — it does not appear on body text or interactive controls — which keeps it calm rather than garish.

The specific gradient `violet → blue → teal` was chosen for coherence with the dark-first color scheme (`#0A0B0E` background) and the existing error color (`#E04E55`). It maps directly to `--gradient-brand` in the CSS token layer.

**Confidence: confirmed** — the rendered output was visually reviewed. All fonts resolve to Inter (font-stack audit via computed styles on the screenshot). No serif faces present.

### Risk
Inter is loaded from Google Fonts in the hosted track; offline / self-contained track falls back to the system sans-serif stack. Gradient rendering may vary across color profiles (P3 vs sRGB). Both are cosmetic risks with no functional impact.

### Expected impact
Consistent, premium, calm-dark visual identity. Elimination of the serif/sans mismatch that made headings feel disconnected from the body.

### Test plan
- Visual regression snapshot in `packages/html-renderer/__snapshots__/`.
- Manual review: render the demo, confirm no serif glyphs in headline, confirm gradient appears on hero and eyebrows, confirm gradient is absent from body copy.

### Rollback
Revert the `--font-display` and `--gradient-brand` token values in `packages/html-renderer/src/styles.ts`. Two-line change.

---

## Decision 4 — Reframe the validation score as deterministic heuristic checks (honesty fix)

### Summary
Remove all language claiming that `recap validate` fetches sources, runs LLM review, or produces a score comparable to a human fact-check. Replace with explicit language: "deterministic heuristic checks (structure, citation presence, word counts, secret/fluff regex)." State that LLM agent review only runs when `/recap` is invoked inside Claude Code.

### Evidence
The audit confirmed (from `validate.mjs` source) that the validation pipeline performs: schema validation, section count, word-count range checks, citation-field presence, secret-pattern regex, and fluff-phrase regex. It does not fetch any URL, invoke any LLM, or compare claims against external sources. The previous documentation ("9.7/10 / 7 reviewers in parallel") presented these heuristics as if they were LLM-reviewed quality assessments, which is false.

The fix: (a) `validate.mjs` now guards malformed input with a zod check and exits 2 on failure (no TypeError crash); (b) README and skill descriptions now explicitly label the score as heuristic; (c) the "7 reviewers" framing is removed; (d) the honesty note is added wherever the score surface appears.

**Confidence: confirmed** — `validate.mjs` source read directly. The fix was applied and re-tested. `validate.mjs` exits cleanly on bad input.

### Risk
Users who relied on the previous framing may feel the tool is less impressive. The actual check quality is unchanged — only the description changes. The risk of continuing to overclaim is higher (trust erosion, potential misuse in high-stakes contexts).

### Expected impact
Users have an accurate model of what the score means. They can decide whether to pair it with a manual review for high-stakes recaps. Trust in the tool increases because it does not oversell itself.

### Test plan
- 6 tests in the CLI package covering `validate` on valid JSON, invalid JSON, missing fields, and non-JSON input.
- README review: search for "LLM" near "validate" — must not claim LLM runs during `recap validate`.

### Rollback
Not applicable — this is a documentation and UX fix, not a functional change. If needed, revert the README wording; `validate.mjs` crash fix should not be reverted.

---

## Decision 5 — Add a real CLI (`@recap-studio/cli`) and a `render_recap_html` MCP tool

### Summary
Ship a `recap` CLI command (`recap render <content.json>` and `recap validate <content.json>`) as a standalone npm package `@recap-studio/cli`, and add a `render_recap_html` tool to the MCP server. Both work without Claude Code, enabling multi-editor use (Cursor, VS Code, Codex, Continue, Gemini, Windsurf).

### Evidence
The audit found that the pre-existing MCP "CLI" was a script path reference with no actual binary, and that the MCP transport had errors that prevented tools from registering correctly in non-Claude editors. Without a real CLI, users of any editor other than Claude Code had no path to produce a recap outside of the browser.

`@recap-studio/cli` is built on top of `@recap-studio/html-renderer` (Decision 1) and `@recap-studio/content-pipeline`. It ships a `bin/recap` entry and is installable globally via `npm install -g @recap-studio/cli` or locally via `pnpm add -D @recap-studio/cli`.

The `render_recap_html` MCP tool accepts a content slug, reads the corresponding JSON, calls `renderToHtml`, and returns the file path to the written HTML. It is available to any editor that supports the MCP protocol.

**Confidence: confirmed** — 6 CLI tests pass. `recap render` and `recap validate` were exercised on both fixture files (topic + session). MCP `render_recap_html` tested via the MCP test harness.

### Risk
The CLI adds a second package to maintain. Semver discipline required: the CLI's `renderToHtml` dependency must be pinned to a compatible `html-renderer` version. Mitigated by workspace-level pinning in the monorepo.

### Expected impact
Any developer with Node.js can produce a recap HTML from a content JSON without opening Claude Code. CI pipelines can call `recap render` to produce HTML artifacts. Multi-editor MCP users get a dedicated render tool alongside the existing content-pipeline tools.

### Test plan
- 6 unit tests in `packages/cli`.
- Integration: `npx recap render fixtures/topics/latest-ai-models.json` produces a valid self-contained HTML.
- MCP smoke test: call `render_recap_html` tool via the MCP test harness, verify output file exists and passes `recap validate`.

### Rollback
Remove `packages/cli`. The `render_recap_html` MCP tool can be removed from `packages/mcp-server/src/tools/`. No other packages are affected.

---

## Decision 6 — Fix MCP response format to `type: "text"` (transport spec compliance)

### Summary
Change all MCP tool result payloads from `{ type: "json", ... }` to `{ type: "text", text: "..." }` to match the MCP specification. Also handle `notifications/initialized` as a notification (no response) and respond to `ping` requests.

### Evidence
The MCP specification (JSON-RPC 2.0 extension) requires tool results to be an array of content items with `type: "text" | "image" | "resource"`. The pre-existing server returned `type: "json"`, which is not a valid content type in the spec. Cursor, VS Code Copilot, Codex, Continue, and Windsurf all enforce the spec strictly and silently dropped or errored on tool results from the server, making the MCP integration non-functional in every editor except Claude Code (which was more lenient).

Additionally, the server was sending a response to `notifications/initialized`, which is a one-way notification and must not receive a response. This caused some clients to close the connection immediately.

**Confidence: confirmed** — MCP spec verified at `modelcontextprotocol.io/docs`. The transport fix was tested against the Claude Code MCP client and a local test harness. 9 transport tests pass (including `notifications/initialized` no-response and `ping` response).

### Risk
None for conformant clients. Any client that was incorrectly parsing the old `type: "json"` format would have already been broken. The fix only improves compatibility.

### Expected impact
MCP tools are now accessible from Cursor, VS Code Copilot, Continue, Codex, and any other spec-compliant editor. This is a prerequisite for the multi-editor story (Decision 5).

### Test plan
- 9 tests in `packages/mcp-server` covering tool registration, `notifications/initialized` (no response), `ping` (response), and each tool's return shape (`type === "text"`).
- Manual: load the MCP server in Cursor; verify `render_recap_html` appears in the tool list and returns output.

### Rollback
Revert `packages/mcp-server/src/transport.ts` to the previous `type: "json"` shape. One-file change.

---

## Decision 7 — Reset `recap-studio.config.ts` to safe defaults and gitignore it

### Summary
Ship a safe default configuration (`deploymentMode: "disabled"`, `email: { enabled: false }`) as the committed baseline, gitignore the live config file, and add `recap-studio.config.example.ts` as the template. Remove any active Vercel deploy or email send calls from skill execution paths that do not first check for explicit user consent.

### Evidence
The audit confirmed (from direct file read) that the live `recap-studio.config.ts` had `deploy: "preview"` and `email: { mode: "send-with-confirmation" }` set as defaults. This meant any user who cloned the repo and ran `/recap session` could trigger a Vercel deployment or send an email without having consciously configured those integrations. Both actions are outward-facing and irreversible.

Additionally, the `recap-setup` skill referenced a non-existent `config-template.ts` file, causing it to fail on first run.

The fix: (a) safe defaults committed; (b) `recap-studio.config.ts` added to `.gitignore`; (c) `recap-studio.config.example.ts` is the new template; (d) skills check for Vercel configuration (`vercel`/`.vercel`/`VERCEL_TOKEN`) before offering the deploy option, and only offer it — never execute it — without explicit in-session consent; (e) `recap-setup` skill updated to reference the example file correctly.

**Confidence: confirmed** — config file read directly, deploy/email modes confirmed. The fix was applied; `recap-studio.config.ts` is now in `.gitignore`.

### Risk
Users who had `recap-studio.config.ts` tracked in their fork may have it removed from git tracking. Mitigated by: the change only removes tracking, not the file on disk; the example template documents all options.

### Expected impact
New clones are safe by default. No outward-facing action (deploy, email) can occur without the user having intentionally configured and consented to it. Trust and safety bar raised.

### Test plan
- `git ls-files recap-studio.config.ts` returns empty.
- `cat .gitignore | grep recap-studio.config.ts` returns a match.
- Running `/recap session` on a fresh clone with no Vercel config does not offer the deploy option.
- `recap-studio.config.example.ts` contains commented-out examples for all options.

### Rollback
Remove `recap-studio.config.ts` from `.gitignore`. Update the committed defaults back to the previous values. Not recommended — the safe-defaults direction is correct.

---

## Decision 8 — Architecture: retain the Hybrid model (Plugin + Skills + optional MCP)

### Summary
The current plugin-shell-plus-skills-plus-optional-MCP architecture is correct. Do not collapse it to a pure skill, a pure plugin, or a pure MCP server.

### Evidence
The audit in `docs/audit/05-architecture-rename-decision.md` evaluated three alternatives against the full set of recap-studio requirements:

| Criterion | Pure skill | Hybrid (current) | Pure plugin (MCP-only) |
|---|:---:|:---:|:---:|
| `/recap` slash command | via skill | via plugin skill | no |
| Lifecycle hooks | no | yes | yes |
| MCP server registration | no | yes | yes |
| Marketplace install | drop-in only | yes | yes |
| agentskills.io drop-in | yes | yes | no |
| Multi-editor MCP | no | yes (optional) | yes |

recap-studio requires lifecycle hooks (`block-destructive-git`, `validate-before-deploy`, `format-after-edit`, `qa-summary-on-stop` — all confirmed in `hooks/hooks.json`), an optional MCP server (confirmed in `packages/mcp-server`), and marketplace installation via `claude plugin install recap-studio@10x` (confirmed in `Aboudjem/10x` marketplace). None of these are available in a pure skill. Collapsing to a pure plugin without skills would drop the `/recap` UX and the agentskills.io drop-in path.

**Confidence: confirmed** — all three files verified on disk. The hybrid wins on every axis that recap-studio actually uses.

### Risk
The hybrid adds complexity: three things to understand (plugin manifest, skills, MCP server). Mitigated by clear documentation in README and `AGENTS.md` explaining each layer's role.

### Expected impact
No change to current behavior. The architecture remains as-is. This decision closes the architecture review question without triggering a disruptive refactor.

### Test plan
- `pnpm test` passes across all packages (44 tests).
- `pnpm build` succeeds.
- Plugin manifest validates against the Anthropic schema.
- All four skills are resolvable from the plugin.

### Rollback
Not applicable — this decision chooses to keep the current architecture. The rollback would be the alternative architectures evaluated above.

---

## Decision 9 — Rename verdict: recommend `plugin → recap`, but DO NOT execute

### Summary
The rename of the plugin name from `recap-studio` to `recap` is **recommended** but is **not executed in this rebuild**. Confidence is `likely`, not `confirmed`. The npm rename is `blocked`. The GitHub repo rename and marketplace entry update are outward-facing and semi-irreversible. A migration plan has been documented in `docs/audit/05-architecture-rename-decision.md` and is ready to run when the user explicitly approves.

### Evidence
Five evidence items from `docs/audit/05-architecture-rename-decision.md`:

**B1 — npm `recap` is blocked (hard blocker for npm rename, confidence: confirmed).**
`npm view recap` returns `recap@0.3.2 | MIT | creates responsive screenshots using phantomjs`. The name is owned by a third party. We cannot publish `recap@x.x.x` on npm. The scoped alternative `@aboudjem/recap` is available and would not collide.

**B2 — Command surface already uses `/recap` (supports rename, confidence: confirmed).**
Users type `/recap "<topic>"`, `/recap session`, `/recap setup`, `/recap validate`. The plugin name `recap-studio` appears only in the install command and internal namespace. The command surface is already de-facto `recap`.

**B3 — 10x marketplace pin uses `"name": "recap-studio"` (migration cost, confidence: confirmed).**
Renaming requires updating `plugin.json`, the 10x `marketplace.json`, the GitHub repo name, and all README install commands. A backward-compat alias period is needed for existing users. Total: ~12 files affected (enumerated in `05-architecture-rename-decision.md § Migration Plan`).

**B4 — Naming convention favors short nouns (confidence: likely).**
The agentskills.io spec prefers short noun forms (`pdf`, `xlsx`, `docx`). `recap` is 5 characters vs `recap-studio` at 12. Inference from spec guidance, not a hard rule.

**B5 — SEO / discoverability is uncertain (confidence: uncertain).**
`recap-studio` is more specific as a search term. `recap` matches the command surface. No live SEO data available.

**Why not execute now:**
1. Confidence is `likely`, not `confirmed` — the exact namespacing behavior of a renamed plugin was not live-tested.
2. npm rename is confirmed-blocked; the scoped package path (`@aboudjem/recap`) requires a deliberate publish decision.
3. GitHub repo rename is outward-facing: all external links, forks, CI badge URLs, and the 10x marketplace entry must be updated atomically. An incomplete rename leaves broken links.
4. This rebuild has high-priority deliverables (self-contained HTML, CLI, MCP transport fix, safe config defaults). Executing the rename in the same session increases surface area and risk without being required for any of those deliverables.
5. The `needs-user-approval` gate applies: the GitHub rename and marketplace entry update affect the public-facing identity of the tool and should not be auto-executed.

**Confidence: likely** — rename is recommended and the migration plan is fully documented and ready to run. Execution requires explicit user approval.

### Risk
- If not executed: UX tension between the `/recap` command surface and the `recap-studio` install name persists. Users who read the README see `claude plugin install recap-studio@10x` but type `/recap`. This is a discoverability friction, not a functional bug.
- If executed without the alias period: existing users' `recap-studio@10x` installs break silently until they reinstall.
- npm collision: attempting to publish `recap` on npm would fail (owned) and is blocked.

### Expected impact
- Not executing: status quo preserved, zero regression.
- Executing (future): cleaner install-to-command correspondence (`recap@10x` → `/recap`). Scoped npm package `@aboudjem/recap` available for programmatic use.

### Test plan (for future execution)
1. Update `plugin.json` `"name"` to `"recap"`.
2. Update `10x/.claude-plugin/marketplace.json` entry.
3. GitHub repo rename (Settings → Repository name).
4. Update `README.md` install commands and all GitHub URLs.
5. Publish `@aboudjem/recap` on npm; deprecate `recap-studio` with a pointer.
6. Add `recap-studio` alias entry in marketplace with 60-day deprecation notice.
7. Smoke test: `claude plugin install recap@10x` → `/reload-plugins` → `/recap "test"`.

### Rollback (if executed and issues arise within alias window)
Restore `"name": "recap-studio"` in `plugin.json` and marketplace entry. GitHub redirect continues to work. `@aboudjem/recap` can be deprecated; `recap-studio` placeholder remains.

---

## Decisions summary table

| # | Decision | Verdict | Confidence |
|---|---|---|---|
| 1 | Add `packages/html-renderer` for self-contained output | Execute — done | confirmed |
| 2 | Keep Next.js for hosted/Vercel track (dual-track) | Keep — done | confirmed |
| 3 | All-sans-serif (Inter) + violet-blue-teal gradients | Execute — done | confirmed |
| 4 | Reframe validation score as deterministic heuristics | Execute — done | confirmed |
| 5 | Add real CLI + `render_recap_html` MCP tool | Execute — done | confirmed |
| 6 | Fix MCP response to `type: "text"` | Execute — done | confirmed |
| 7 | Reset config to safe defaults + gitignore | Execute — done | confirmed |
| 8 | Architecture = Hybrid (plugin + skills + optional MCP) | Keep — confirmed correct | confirmed |
| 9 | Rename plugin `recap-studio` → `recap` | Recommend but DO NOT execute | likely (npm blocked) |

---

_Sources: `docs/audit/PLAN.md`, `docs/audit/05-architecture-rename-decision.md`, session facts (verified build output), `packages/html-renderer` source, `packages/cli` source, `packages/mcp-server` source, `validate.mjs`, `.gitignore`, `recap-studio.config.example.ts`, `hooks/hooks.json`, `.claude-plugin/plugin.json`, `npm view recap` (live registry 2026-05-29)._
