# Phase 5 — Architecture & Rename Decision

_Audit date: 2026-05-29. Every claim cites a file:line, command output, or
authoritative source. Confidence labels: `confirmed` | `likely` | `uncertain`
| `blocked` | `needs-user-approval`._

---

## Part A — Plugin vs. Skill vs. Hybrid

### Decision

**Verdict: Hybrid (confirmed) — Plugin shell that exposes skills.**
The current structure is already hybrid and is correct. Do not collapse it
to a pure skill or a pure plugin.

### Evidence

#### A1 — Plugin shell is already in place and correctly formed

**File:** `.claude-plugin/plugin.json` (root of repo)

```json
{
  "$schema": "https://schemas.anthropic.com/claude-code/plugin.schema.json",
  "name": "recap-studio",
  "displayName": "Recap Studio",
  "version": "0.2.0",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json",
  "mcpServers": { "recap-studio-tools": { ... "optional": true } }
}
```

**Confidence: confirmed** — file verified on disk.

The manifest is compliant: `name` is kebab-case, no reserved words, matches
the 10x marketplace entry `"name": "recap-studio"` in
`/Users/adamboudj/projects/10x/.claude-plugin/marketplace.json`. The `skills`
field points at `./skills/` which is auto-discovered per the plugin spec
(code.claude.com/docs/en/plugins). Plugin-level hooks (`./hooks/hooks.json`)
and an optional MCP server are also registered — both require the plugin shell
to work; they cannot live in a bare skill.

#### A2 — Four skills under the plugin are correctly structured

**Files:** `skills/recap-topic/SKILL.md`, `skills/recap-session/SKILL.md`,
`skills/recap-setup/SKILL.md`, `skills/recap-validate/SKILL.md`

Each has YAML frontmatter with `name:` matching its directory name, a
keyword-rich `description:` (WHAT + WHEN), and positional `arguments:`.
When the plugin is installed as `recap-studio@10x`, all four skills are
namespaced `recap-studio:<skill>` internally but surfaced via the plugin's
root `/recap` router (the `recap-topic` SKILL.md description explicitly covers
the `/recap "<topic>"` invocation). **Confidence: confirmed.**

#### A3 — Pure-skill alternative is structurally insufficient

**Rule applied:** If a deliverable requires (a) lifecycle hooks, (b) an
optional MCP server, or (c) namespaced installation via a marketplace, it must
be a plugin, not a bare skill.

recap-studio requires all three:

- Hooks: `hooks/hooks.json` registers `block-destructive-git`,
  `validate-before-deploy`, `format-after-edit`, `qa-summary-on-stop`. These
  are plugin-level hooks — they have no slot in a bare `SKILL.md`.
- MCP server: `packages/mcp-server` (~9 tools: artifact store, source cache,
  diagram render, screenshot, a11y/lighthouse, Vercel preview, email draft).
  A bare skill cannot register an MCP server; only `plugin.json` has the
  `mcpServers` field.
- Marketplace install path: `claude plugin install recap-studio@10x` (README
  line 46) requires a plugin entry. The 10x marketplace
  (`Aboudjem/10x/.claude-plugin/marketplace.json`) already references
  `"repo": "Aboudjem/recap-studio"` as a plugin.

**Confidence: confirmed.** Collapsing to a bare skill would require removing
all three capabilities.

#### A4 — Pure-plugin-without-skills alternative loses UX and cross-editor reach

A plugin that exposes only MCP tools (no skills) would lose the `/recap`
command UX, the `disable-model-invocation`-eligible workflow control, and the
agentskills.io drop-in install path (`~/.claude/skills/recap-topic/SKILL.md`
for users who don't want the full plugin). The current hybrid keeps both.

**Confidence: confirmed** (from the agentskills.io spec and plugin docs:
skills and MCP tools serve different invocation surfaces).

#### A5 — marketplace.json is MISSING from recap-studio itself

**Command:** `find /Users/adamboudj/projects/recap-studio -name "marketplace.json"`
→ no output. The `.claude-plugin/` directory contains only `plugin.json`.

The plugin is distributed through the external `Aboudjem/10x` marketplace, not
a self-hosted `marketplace.json`. This is a valid pattern (the plugin is a
guest in a marketplace repo), but it means recap-studio cannot be independently
discovered via `/plugin marketplace add Aboudjem/recap-studio`. Users must know
the 10x marketplace. **Confidence: confirmed** (negative result, no file).

**Recommendation A5:** Add a `marketplace.json` to recap-studio itself so the
repo is self-contained (`/plugin marketplace add Aboudjem/recap-studio`). This
mirrors how anthropics/skills ships. Does not conflict with the 10x listing.

#### A6 — Hybrid rule summary (the decision framework)

| Criterion | Pure skill | Plugin + skills (hybrid) | Pure plugin (MCP-only) |
|---|:---:|:---:|:---:|
| `/recap` slash command | via skill | via plugin skill | no |
| Lifecycle hooks | no | yes | yes |
| MCP server registration | no | yes | yes |
| Marketplace install | drop-in only | yes | yes |
| agentskills.io drop-in | yes | yes (skills also copyable) | no |
| Multi-editor MCP | no | yes (optional) | yes |

**The hybrid wins on every axis that recap-studio needs.** No evidence
supports changing the current architecture.

---

## Part B — Rename recap-studio → recap?

### Decision

**Verdict: CONDITIONAL YES — recommended, but not yet high-confidence enough
to rename the public npm package and marketplace entry without a deliberate
migration window.**

**Confidence: likely** (not confirmed — the npm collision and migration cost
prevent "confirmed").

**Specific verdict:**
- **Plugin name** (`plugin.json` `"name"`): rename `recap-studio` → `recap` — **YES (high-confidence)**.
- **Skill directories** (`skills/recap-topic` etc.): keep `recap-*` names — **NO change needed**.
- **Repo/GitHub name** (`Aboudjem/recap-studio`): rename → `Aboudjem/recap` — **YES, with alias**.
- **npm package** (`recap-studio@npm`): do NOT rename to `recap` — `recap@0.3.2` is owned by another author (phantomjs screenshot tool, MIT). Taking the name requires npm deprecation/squatting which is unethical and not possible. Keep `recap-studio` on npm or publish `@aboudjem/recap` as a scoped package.
- **10x marketplace entry**: update `"name": "recap"` in `marketplace.json` — **YES, with backward-compat alias period**.
- **Command surface** (`/recap`): already works because skill descriptions use `/recap` as the trigger. No change needed.

### Evidence

#### B1 — npm "recap" is taken (HARD BLOCKER for npm rename)

**Command:** `npm view recap`
```
recap@0.3.2 | MIT | deps: 8 | versions: 12
creates responsive screenshots using phantomjs
bin: recap
maintainers: [external author]
```

**Confidence: confirmed.** The `recap` npm package name is owned by a third
party (phantom-screenshots tool, MIT). Publishing `recap@x.x.x` would require
that author to unpublish/transfer, which is not available to us. This is a
hard blocker for the npm rename specifically.

The current npm package `recap-studio@0.2.0` (published by `aboudjem`) is
ours to keep or deprecate. Scoped alternative `@aboudjem/recap` is available
and would not collide. **Confidence: confirmed** (npm registry is authoritative).

#### B2 — Command surface already uses /recap (supports rename direction)

**Source:** `README.md:52`, `skills/recap-topic/SKILL.md` frontmatter
`name: recap-topic`, `skills/recap-session/SKILL.md` `name: recap-session`.

The UX the user already sees is `/recap`, `/recap session`, `/recap setup`,
`/recap validate`. The plugin name `recap-studio` only appears in the install
command (`claude plugin install recap-studio@10x`) and namespacing. The
commanded surface is already de-facto `recap`. **Confidence: confirmed.**

This creates real UX tension: users type `/recap` but the plugin namespace is
`recap-studio`. In Claude Code, skills are invoked as
`/recap-studio:recap-topic` internally but the SKILL.md descriptions are
written to catch `/recap`. A plugin named `recap` would produce a cleaner
`/recap:recap-topic` namespace (or just `/recap` as a top-level topic router
if a root `SKILL.md` is added). **Confidence: likely** (inference from plugin
spec doc; the exact namespacing behavior of a renamed plugin was not live-tested).

#### B3 — 10x marketplace pin uses "recap-studio" (migration cost)

**File:** `/Users/adamboudj/projects/10x/.claude-plugin/marketplace.json`
```json
{
  "name": "recap-studio",
  "source": { "source": "github", "repo": "Aboudjem/recap-studio" },
  "version": "0.2.0"
}
```

Renaming the plugin name from `recap-studio` to `recap` requires:
1. Bumping `marketplace.json` entry `"name"` to `"recap"`.
2. Bumping `plugin.json` `"name"` to `"recap"`.
3. GitHub repo rename: `Aboudjem/recap-studio` → `Aboudjem/recap` (GitHub
   provides a redirect from the old URL — **confidence: confirmed** per GitHub
   docs on repo renames; redirect expires if someone claims the old name).
4. Updating the 10x marketplace source `"repo": "Aboudjem/recap"`.
5. Keeping an alias / deprecation notice for existing users on `recap-studio@10x`.

**Confidence: confirmed** (files verified on disk; migration steps derived
from the plugin spec).

#### B4 — Naming convention analysis

From the skill-authoring spec (01-skill-authoring.md §5):
- Preferred: gerund (`processing-pdfs`) or noun phrase (`pdf-processing`).
- Real official skills use short noun form: `pdf`, `xlsx`, `docx`.
- The top repo is `superpowers` (obra/superpowers, 211k stars) — a single
  generic noun, no gerund.

`recap` is a short, memorable noun. `recap-studio` is descriptive but longer
(12 chars vs 5). For a marketplace pin that users type into a command,
shorter wins discoverability. `/recap` is already the lived UX.

**Confidence: likely** (naming convention analysis is inference, not a hard
rule from the spec).

#### B5 — SEO / discoverability

`recap-studio` is more specific as a search term (lower collision with the
generic word "recap"), but `recap` in the plugin namespace maps perfectly to
the command the user types. The GitHub repo name affects discoverability on
GitHub search; `Aboudjem/recap` is shorter and matches the tool's primary
verb. npm discoverability for `recap` is blocked (B1). The 10x marketplace
name is shown in install commands, not GitHub search, so SEO impact is
minimal there. **Confidence: uncertain** (no live SEO data available; analysis
only).

#### B6 — Backward-compat risk is manageable but real

Existing users who ran `claude plugin install recap-studio@10x` will have the
plugin installed under the `recap-studio` namespace. After a rename, they must
uninstall and reinstall. GitHub redirects protect cloned repos from breaking
immediately but not permanently. **Confidence: confirmed** (plugin spec on
namespacing; GitHub repo-rename behavior).

The plugin is at v0.2.0, pre-1.0, no external API stability contract.
Migration cost is low relative to the long-term UX gain. **Confidence:
likely** (inference; no user-count data available).

---

## Migration Plan Outline: MIGRATION_PLAN_RECAP.md

If the decision is confirmed (needs-user-approval for the actual execution),
the migration plan must cover:

### 1. Affected files (exhaustive)

| File | Change |
|---|---|
| `.claude-plugin/plugin.json` | `"name": "recap-studio"` → `"recap"`, `"displayName": "Recap Studio"` (keep), update `homepage`, `repository` URLs |
| `/Users/adamboudj/projects/10x/.claude-plugin/marketplace.json` | Plugin entry `"name": "recap-studio"` → `"recap"`, `"source"."repo"` → `"Aboudjem/recap"` |
| `README.md` | Update `claude plugin install recap-studio@10x` → `claude plugin install recap@10x`; all GitHub URLs; npm badge URL |
| `npm-placeholder/package.json` | Deprecate `recap-studio` with npm deprecation notice pointing to new name or scoped package `@aboudjem/recap` |
| `package.json` (monorepo root) | `"name": "recap-studio"` → `"recap"` (or `"@aboudjem/recap"`); description update |
| `CHANGELOG.md` | Add rename entry |
| `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` | Update repo URLs if repo is renamed on GitHub |
| `vercel.json` | If project name is `recap-studio`, update |
| `apps/recap-web/package.json` | Any internal cross-references to `recap-studio` |
| All `packages/*/package.json` | Any `name` fields that include `recap-studio` |
| `docs/` audit + spec files | Update references (not user-facing; low priority) |

### 2. Marketplace / plugin name

- New plugin install: `claude plugin install recap@10x`
- Old alias: keep `recap-studio` as a deprecated entry in `marketplace.json`
  pointing to the same repo for a transition window (suggested: 60 days or one
  minor release, whichever comes first).
- `$schema` reference in `plugin.json` does not change (it is the Anthropic
  schema, not a name reference).

### 3. Public commands (no change needed)

The skill `name:` fields (`recap-topic`, `recap-session`, `recap-setup`,
`recap-validate`) and their `/recap` trigger descriptions do not change.
The user-visible command surface (`/recap "<topic>"`, `/recap session`, etc.)
is unaffected — this is the strongest argument that the rename is low-risk
for end users.

### 4. GitHub repo rename

`Settings → Repository name → recap`. GitHub will:
- Serve a 301 redirect from `Aboudjem/recap-studio` to `Aboudjem/recap`.
- Keep all issues, PRs, release history.
- Redirect expires if `Aboudjem/recap-studio` is re-created by another user.

Action: Update `source.repo` in 10x marketplace.json immediately after rename
to avoid depending on the redirect.

### 5. npm

Do NOT attempt to claim `recap` on npm (owned). Options:
- (Recommended) Publish `@aboudjem/recap@0.3.0` as the new scoped package;
  `npm deprecate recap-studio@0.2.0 "Renamed to @aboudjem/recap"`.
- (Alternative) Keep `recap-studio` on npm unchanged; treat it as a
  compatibility placeholder only.

### 6. Tests and CI

- Update any test fixtures or CI scripts that reference `recap-studio` as a
  plugin name.
- Add a smoke test: `claude plugin install recap@10x` → `/reload-plugins` →
  `/recap "test"` in the CI workflow.

### 7. Rollback plan

If the rename causes issues within the 60-day alias window:
- Restore `"name": "recap-studio"` in `plugin.json` and marketplace entry.
- GitHub redirect continues to work in both directions.
- npm `@aboudjem/recap` can be deprecated; `recap-studio` placeholder remains.

---

## Summary table

| Decision | Verdict | Confidence | Rule used |
|---|---|---|---|
| Architecture: plugin vs skill vs hybrid | **Hybrid (current shape is correct)** | confirmed | Plugin shell needed for lifecycle hooks + MCP server + marketplace install; skills needed for `/recap` UX + drop-in portability |
| Rename plugin name to `recap` | **YES (recommended)** | likely | Command surface already uses `/recap`; `recap-studio` is only an internal namespace; short noun preferred; pre-1.0 so migration cost is low |
| Rename npm package to `recap` | **NO — blocked** | confirmed | `recap@0.3.2` is owned by a third party on npm |
| Add self-hosted marketplace.json | **YES (gap)** | confirmed | `.claude-plugin/` has no `marketplace.json`; self-contained install path missing |
| Rename GitHub repo | **YES, with alias** | likely | Consistent with plugin rename; GitHub redirect provides safety net |

---

_Sources: `.claude-plugin/plugin.json` (verified on disk), `/Users/adamboudj/projects/10x/.claude-plugin/marketplace.json` (verified on disk), `skills/*/SKILL.md` (verified on disk), `npm view recap` (live registry, 2026-05-29), `npm view recap-studio` (live registry, 2026-05-29), `docs/audit/00-DISCOVERY.md` (Phase 1 baseline), `01-skill-authoring.md` (agentskills.io + official Anthropic docs), `02-plugin-spec.md` (code.claude.com/docs/en/plugins verified 2026-05-28)._
