# Migration Plan: `recap-studio` → `recap`

> **STATUS: RECOMMENDED — NOT YET EXECUTED**
> **Confidence: likely** (not confirmed — npm name collision and GitHub repo rename are irreversible; needs explicit user approval before any step is run)
> **Prerequisite: user approval required. Do not execute any step in this document without confirmation.**
>
> Source of truth for the decision rationale: `docs/audit/05-architecture-rename-decision.md`

---

## Executive Summary

The user-visible command surface is already `/recap`. The plugin namespace (`recap-studio`) is an internal implementation detail that surfaces only in the install command. Renaming closes the gap between what users type and what the package is called. The migration is low-risk at v0.2.0 (pre-1.0, no external API stability contract) and GitHub provides automatic 301 redirects after a repo rename.

**Hard constraint:** The `recap` npm name is owned by a third party (`recap@0.3.2`, phantomjs screenshot tool, MIT). The npm rename path is blocked. Options are: keep `recap-studio` on npm as a compatibility placeholder, or publish the scoped `@aboudjem/recap` alongside it.

---

## Part 1 — What Changes vs. What Stays the Same

### Unchanged (zero end-user impact)

| Item | Value | Why unchanged |
|---|---|---|
| Skill directory names | `skills/recap-topic/`, `skills/recap-session/`, `skills/recap-setup/`, `skills/recap-validate/` | Already prefixed `recap-*`; no reason to change |
| Skill `name:` fields in SKILL.md | `recap-topic`, `recap-session`, `recap-setup`, `recap-validate` | Remain correct under either plugin name |
| User-visible commands | `/recap "<topic>"`, `/recap session`, `/recap setup`, `/recap validate` | These are driven by SKILL.md descriptions, not the plugin name |
| Internal package scope | `@recap-studio/*` | Scoped package names on npm are independent of the plugin name; rename only if explicitly desired (out of scope here) |
| Content JSON schema | `RecapPageContent`, `RecapSessionContent` | TypeScript types are internal; not tied to the plugin name |
| `config` type | `RecapStudioConfig` | Renaming this type is a TS breaking change; defer unless user explicitly requests it |
| Vercel project / deployment URL | configured separately in Vercel dashboard | No change needed unless user renames the Vercel project |
| `apps/recap-web` | Next.js app name `recap-web` | Internal; no change needed |

### Changes required

See Part 2 for the exhaustive file-by-file table.

---

## Part 2 — Exhaustive File-by-File Change List

### Tier 1 — Plugin identity (must change atomically)

These three changes must land in the same commit; they define the new plugin identity.

#### 2.1 `.claude-plugin/plugin.json`

```diff
-  "name": "recap-studio",
+  "name": "recap",
   "displayName": "Recap Studio",
   "version": "0.3.0",
-  "homepage": "https://github.com/Aboudjem/recap-studio",
+  "homepage": "https://github.com/Aboudjem/recap",
   ...
   "mcpServers": {
-    "recap-studio-tools": {
+    "recap-tools": {
       "command": "node",
       "args": ["packages/mcp-server/dist/index.js"],
       ...
     }
   }
```

Notes:
- `"displayName": "Recap Studio"` — keep unchanged (human-readable label, not a key).
- Bump `"version"` to `"0.3.0"` in the same commit (the version bump is already pending from the rebuild session).
- The `$schema` URL does not change (points to Anthropic's schema registry, not a name-dependent path).

#### 2.2 `.claude-plugin/marketplace.json`

```diff
-  "name": "recap-studio",
+  "name": "recap",
   "metadata": { ... },
   "plugins": [
     {
-      "name": "recap-studio",
+      "name": "recap",
       "source": {
         "source": "github",
-        "repo": "Aboudjem/recap-studio"
+        "repo": "Aboudjem/recap"
       },
       "version": "0.3.0",
-      "homepage": "https://github.com/Aboudjem/recap-studio",
+      "homepage": "https://github.com/Aboudjem/recap",
       ...
     }
   ]
```

#### 2.3 `10x marketplace` — `/Users/adamboudj/projects/10x/.claude-plugin/marketplace.json`

This file lives in a separate repo (`Aboudjem/10x`). It must be updated in a separate commit/PR to that repo:

```diff
   {
-    "name": "recap-studio",
+    "name": "recap",
     "source": {
       "source": "github",
-      "repo": "Aboudjem/recap-studio"
+      "repo": "Aboudjem/recap"
     },
-    "version": "0.2.0"
+    "version": "0.3.0"
   }
```

Add a backward-compat alias entry in the same file (keep for 60 days):

```json
{
  "name": "recap-studio",
  "_deprecated": true,
  "_deprecationMessage": "Renamed to 'recap'. Run: claude plugin install recap@10x",
  "source": {
    "source": "github",
    "repo": "Aboudjem/recap"
  },
  "version": "0.3.0"
}
```

---

### Tier 2 — GitHub repo rename

#### 2.4 GitHub repository rename

Action (in GitHub web UI): `Settings → Repository name → recap` → Rename.

GitHub behaviour (confirmed per GitHub docs):
- Issues, PRs, releases, stars, forks: fully preserved.
- All `github.com/Aboudjem/recap-studio/*` URLs serve HTTP 301 → `github.com/Aboudjem/recap/*` automatically.
- The redirect is permanent until someone else creates `Aboudjem/recap-studio`; once a repo with the old name is created by another user, the redirect breaks. The window is unpredictable.

**Immediate action after rename:** update every hardcoded `Aboudjem/recap-studio` URL in the repo (see 2.5–2.7) so the redirect is not relied on as a long-term solution.

#### 2.5 `README.md`

All occurrences of `Aboudjem/recap-studio` → `Aboudjem/recap`. Specific lines (current):

| Pattern | Old value | New value |
|---|---|---|
| Install command | `claude plugin install recap-studio@10x` | `claude plugin install recap@10x` |
| GitHub clone URL | `git clone https://github.com/Aboudjem/recap-studio` | `git clone https://github.com/Aboudjem/recap` |
| npm badge URL | `https://img.shields.io/npm/v/recap-studio` | keep `recap-studio` badge OR update to `@aboudjem/recap` (see npm section) |
| GitHub repo badge | `https://github.com/Aboudjem/recap-studio` | `https://github.com/Aboudjem/recap` |
| Any `cd recap-studio` instruction | `cd recap-studio` | `cd recap` |

#### 2.6 `CHANGELOG.md`

Add a new entry at the top (do not edit historical entries):

```markdown
## [0.3.0] — YYYY-MM-DD

### Changed
- Plugin renamed from `recap-studio` to `recap`. Install: `claude plugin install recap@10x`.
  Command surface (`/recap`, `/recap session`, `/recap setup`, `/recap validate`) is unchanged.
- GitHub repository renamed: `Aboudjem/recap-studio` → `Aboudjem/recap`.
- npm placeholder `recap-studio@0.2.0` deprecated; scoped package `@aboudjem/recap@0.3.0` published.
```

#### 2.7 `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`

Each file contains one or more references to `github.com/Aboudjem/recap-studio`. Update all to `github.com/Aboudjem/recap`.

Specific patterns:
- `https://github.com/Aboudjem/recap-studio/issues` → `https://github.com/Aboudjem/recap/issues`
- `https://github.com/Aboudjem/recap-studio/blob/main/` → `https://github.com/Aboudjem/recap/blob/main/`

---

### Tier 3 — npm packages

#### 2.8 `npm-placeholder/package.json`

```diff
-  "name": "recap-studio",
+  "name": "recap-studio",         ← keep as-is (npm name cannot be changed; this is the placeholder)
   "version": "0.3.0",             ← bump from 0.2.0
   "description": "...",
-  "homepage": "https://github.com/Aboudjem/recap-studio",
+  "homepage": "https://github.com/Aboudjem/recap",
-  "repository": { "url": "git+https://github.com/Aboudjem/recap-studio.git" },
+  "repository": { "url": "git+https://github.com/Aboudjem/recap.git" },
-  "bugs": { "url": "https://github.com/Aboudjem/recap-studio/issues" },
+  "bugs": { "url": "https://github.com/Aboudjem/recap/issues" },
   "bin": {
-    "recap-studio": "./bin/recap-studio.mjs"
+    "recap-studio": "./bin/recap-studio.mjs"    ← keep bin name (backward compat; npx recap-studio still works)
   }
```

**npm deprecation notice** — run after publishing `recap-studio@0.3.0`:
```
npm deprecate recap-studio@"<0.3.0" "Upgrade to recap-studio@0.3.0 or install @aboudjem/recap instead"
npm deprecate recap-studio "This package is a redirect. Install the plugin: claude plugin install recap@10x — or: npm install @aboudjem/recap"
```

#### 2.9 New package: `@aboudjem/recap` (recommended scoped alternative)

Create `npm-placeholder/package-scoped.json` as the source for a new `@aboudjem/recap` publish. This is a thin wrapper identical to `recap-studio` except for the name and bin key:

```json
{
  "name": "@aboudjem/recap",
  "version": "0.3.0",
  "description": "Generate beautiful, calm, mobile-first one-page explainers in under 5 minutes. Claude Code plugin. This package is a redirect — see homepage.",
  "homepage": "https://github.com/Aboudjem/recap",
  "repository": { "type": "git", "url": "git+https://github.com/Aboudjem/recap.git" },
  "bugs": { "url": "https://github.com/Aboudjem/recap/issues" },
  "author": { "name": "Adam Boudjemaa", "email": "boudjemaa.adam@gmail.com", "url": "https://github.com/Aboudjem" },
  "license": "MIT",
  "type": "module",
  "main": "./bin/recap-studio.mjs",
  "bin": { "recap": "./bin/recap-studio.mjs" },
  "files": ["bin", "README.md"],
  "engines": { "node": ">=18.0.0" },
  "keywords": ["claude-code", "claude-code-plugin", "mcp", "recap", "explainer", "education"]
}
```

Publish with: `cd npm-placeholder && cp package-scoped.json package.json && npm publish --access public`

#### 2.10 Monorepo root `package.json`

```diff
-  "name": "recap-studio",
+  "name": "recap",
   "version": "0.2.0",             ← bump to "0.3.0"
   "private": true,
```

Note: the monorepo root `package.json` is `"private": true` and is never published to npm. The rename here is cosmetic/consistency only; it affects `pnpm -w` display and workspace introspection.

#### 2.11 Internal `@recap-studio/*` package scope (optional — deferred)

The six workspace packages (`@recap-studio/content-pipeline`, `@recap-studio/html-renderer`, `@recap-studio/validation`, `@recap-studio/mcp-server`, `@recap-studio/cli`, `@recap-studio/design-system`) use a scoped name. Renaming them to `@aboudjem/*` or `@recap/*` is a larger change that would require updating all cross-package import statements, the workspace `package.json` devDependencies, and any documentation referencing the scope.

**Recommendation:** defer this to a separate PR. The `@recap-studio/` scope still works after the plugin and repo rename — the scope is independent of the plugin name.

If the user later decides to rename the scope, the pattern is:

```diff
# in each packages/*/package.json:
-  "name": "@recap-studio/<name>",
+  "name": "@aboudjem/<name>",

# in all consuming package.json files (root, apps/recap-web, packages that depend on others):
-  "@recap-studio/<name>": "workspace:*",
+  "@aboudjem/<name>": "workspace:*",

# in all TypeScript source files:
-  from "@recap-studio/<name>"
+  from "@aboudjem/<name>"
```

Files that would need source-level import changes (non-exhaustive, confirmed by grep):
- `apps/recap-web/src/lib/content.ts`
- `apps/recap-web/tailwind.config.ts`
- `packages/html-renderer/src/index.ts`, `sections.ts`, `shell.ts`, `render.test.ts`
- `packages/mcp-server/src/index.ts`, `tools.ts`
- `packages/cli/src/index.ts`
- `packages/validation/src/run.ts`, `run.test.ts`, `checks/*.ts`
- `packages/content-pipeline/src/load-config.ts`, `load.ts`, `source-cache.ts`, `config.ts`, `index.ts`
- `scripts/render-html.mjs`, `validate.mjs`, `history.mjs`, `auto-refresh.mjs`, `demo-latest-ai-models.mjs`

---

### Tier 4 — Source code references

#### 2.12 `npm-placeholder/bin/recap-studio.mjs`

```diff
-const VERSION = "0.2.0";
+const VERSION = "0.3.0";
-const REPO = "https://github.com/Aboudjem/recap-studio";
+const REPO = "https://github.com/Aboudjem/recap";

-  claude plugin install recap-studio@10x
+  claude plugin install recap@10x

-  git clone ${REPO}
-  cd recap-studio && pnpm install
+  git clone ${REPO}
+  cd recap && pnpm install

-Repo:         ${REPO}
+Repo:         ${REPO}
-Docs:         ${REPO}/blob/main/docs/architecture.md
+Docs:         ${REPO}/blob/main/docs/architecture.md
```

Rename the bin file itself: `npm-placeholder/bin/recap-studio.mjs` → `npm-placeholder/bin/recap.mjs`. Update `package.json` `"main"` and `"bin"` fields accordingly. Keep the old filename as a symlink or empty shim for the 60-day alias window if needed.

#### 2.13 `recap-studio.config.example.ts`

Rename file: `recap-studio.config.example.ts` → `recap.config.example.ts`

Update content:
```diff
-import type { RecapStudioConfig } from "@recap-studio/content-pipeline";
+import type { RecapStudioConfig } from "@recap-studio/content-pipeline";   ← no change until scope rename

-const config: RecapStudioConfig = {
+const config: RecapStudioConfig = {   ← no change to type name (deferred)
```

The type name `RecapStudioConfig` stays unchanged unless the TypeScript type rename is also approved (separate decision).

Also update `.gitignore` to match the new config filename:
```diff
-recap-studio.config.ts
+recap.config.ts
+recap-studio.config.ts   ← keep old pattern for existing clones
```

#### 2.14 `skills/recap-topic/SKILL.md`

Line 68 references `package.json` named `"recap-studio"`:
```diff
-1. `$RECAP_STUDIO_ROOT` if set and contains a `package.json` named
-   `"recap-studio"`.
-2. `~/projects/recap-studio` if it is a git checkout of the recap-studio
-   repo.
+1. `$RECAP_STUDIO_ROOT` if set and contains a `package.json` named
+   `"recap"` (or legacy `"recap-studio"`).
+2. `~/projects/recap` (or legacy `~/projects/recap-studio`) if it is a git
+   checkout of the recap repo.
```

Also update the env var name from `RECAP_STUDIO_ROOT` to `RECAP_ROOT` (with backward-compat note). See env var table in Part 5.

#### 2.15 `skills/recap-session/SKILL.md`

Similar target-repo-resolution block as `recap-topic`. Apply the same diff pattern as 2.14.

#### 2.16 `skills/recap-setup/SKILL.md`

References to the config filename and install command:
```diff
-  claude plugin install recap-studio@10x
+  claude plugin install recap@10x

-recap-studio.config.ts
+recap.config.ts
```

#### 2.17 `hooks/hooks.json`

Line 18: `deploymentMode` description references `recap-studio.config.ts`:
```diff
-  "description": "Block production deploys unless recap-studio.config.ts deploymentMode is production-with-confirmation AND user confirmed."
+  "description": "Block production deploys unless recap.config.ts (or recap-studio.config.ts) deploymentMode is production-with-confirmation AND user confirmed."
```

#### 2.18 `hooks/validate-before-deploy.mjs`

File likely references `recap-studio.config.ts` by name. Update the config load path to try `recap.config.ts` first, then fall back to `recap-studio.config.ts` (backward compat):

```javascript
// Before:
const configPath = path.join(repoRoot, "recap-studio.config.ts");

// After:
const configPath =
  fs.existsSync(path.join(repoRoot, "recap.config.ts"))
    ? path.join(repoRoot, "recap.config.ts")
    : path.join(repoRoot, "recap-studio.config.ts");
```

Apply the same pattern to any other hook that references the config file by name (`block-secret-writes.mjs`, `format-after-edit.mjs`, `qa-summary-on-stop.mjs`).

#### 2.19 `packages/content-pipeline/src/load-config.ts`

Update the config file resolution logic to look for `recap.config.ts` first, then `recap-studio.config.ts` as a fallback:

```typescript
const CONFIG_NAMES = ["recap.config.ts", "recap-studio.config.ts"];
```

#### 2.20 `packages/content-pipeline/src/load-config.test.ts`

Update test fixtures that create `recap-studio.config.ts` test files to also cover `recap.config.ts`.

#### 2.21 `packages/mcp-server/src/index.ts`, `tools.ts`

MCP server name registered in the transport handshake currently uses `recap-studio-tools` (matches `plugin.json` `mcpServers` key). Update to `recap-tools` to match the new key in `plugin.json`:

```diff
-serverInfo: { name: "recap-studio-tools", version: "0.3.0" }
+serverInfo: { name: "recap-tools", version: "0.3.0" }
```

#### 2.22 `packages/mcp-server/package.json`

```diff
   "bin": {
-    "recap-studio-mcp": "./dist/index.js"
+    "recap-mcp": "./dist/index.js"
   }
```

#### 2.23 `apps/recap-web/src/components/sections/*.tsx` (12 files)

These files contain references to `recap-studio` in comments, `data-component` attributes, or aria labels (confirmed by grep). Grep pattern: `recap-studio`. Update any user-visible string or comment to `recap`. Aria labels and `data-*` attributes are user-facing; comments are low-priority.

Files confirmed by grep:
- `Comparison.tsx`, `ConceptMap.tsx`, `ExamplesAndAnalogies.tsx`, `Glossary.tsx`, `Hero.tsx`, `KeyIdeas.tsx`, `Misconceptions.tsx`, `Sources.tsx`, `Takeaways.tsx`, `Timeline.tsx`, `WhatMatters.tsx`

Run after rename: `grep -rn "recap-studio" apps/recap-web/src/components/` to confirm zero remaining occurrences.

#### 2.24 `apps/recap-web/src/lib/content.ts`

References to `@recap-studio/*` imports stay unchanged until the scope rename is approved (see 2.11). Any string literals containing `"recap-studio"` → `"recap"`.

#### 2.25 `apps/recap-web/tailwind.config.ts`

Similar scope import (`@recap-studio/design-system`) — unchanged until scope rename. String literal cleanup only.

#### 2.26 `apps/recap-web/src/content/session.json`

The session recap content references the rebuild session and mentions `recap-studio` as the plugin name. This is historical content — do NOT edit it retroactively. New sessions generated after the rename will naturally use the new name.

#### 2.27 `GOAL_SPEC.md`, `AGENTS.md`

Both files reference `recap-studio` as the project name. Update to `recap` in the header/title; preserve historical context in the body.

#### 2.28 Agent spec files (`agents/*.md`)

Nine agent files (`agents/frontend-builder.md`, `agents/repo-session-analyst.md`, `agents/security-privacy-reviewer.md`, and others confirmed by grep) reference `recap-studio`. Update the plugin name in each. Path references like `apps/recap-web` stay unchanged (the app name is independent).

#### 2.29 `docs/` directory (11 audit files + 4 guide files)

Audit files are historical records; prefer adding a top-of-file note rather than editing in-place:

```markdown
> **Note (post-rename):** This document was written when the plugin was named
> `recap-studio`. The new name is `recap`. All other content is unchanged.
```

Guide files (`docs/architecture.md`, `docs/workflows.md`, `docs/configuration.md`, `docs/vercel-deployment.md`, `docs/security-and-privacy.md`, `docs/known-issues.md`) — update in-line: replace all `recap-studio` install commands, config file names, and URL references.

#### 2.30 `scripts/` directory

All 7 scripts (`render-html.mjs`, `validate.mjs`, `history.mjs`, `auto-refresh.mjs`, `demo-latest-ai-models.mjs`, `deploy-preview.sh`, `deploy-prod.sh`, `vercel-set-public.sh`) reference `recap-studio` in shebang comments or string outputs. Update output strings; functional config-path references use the dual-name lookup from 2.18.

#### 2.31 `templates/README.md`, `templates/manifest.json`

References to `recap-studio` in template metadata → `recap`.

---

### Tier 5 — Environment variables (backward-compat aliases)

| Old name | New name | Notes |
|---|---|---|
| `RECAP_STUDIO_ROOT` | `RECAP_ROOT` | Keep reading old name as fallback for 60 days |
| `RECAP_STUDIO_FIXTURE_ONLY` | `RECAP_FIXTURE_ONLY` | Keep reading old name as fallback |
| `RECAP_ALLOW_SECRET_WRITE` | `RECAP_ALLOW_SECRET_WRITE` | No change needed (already generic) |

In all skill SKILL.md files and hook scripts, document both names and log a deprecation warning at runtime when the old name is used:

```javascript
const root = process.env.RECAP_ROOT ?? process.env.RECAP_STUDIO_ROOT;
if (!process.env.RECAP_ROOT && process.env.RECAP_STUDIO_ROOT) {
  console.warn("[recap] RECAP_STUDIO_ROOT is deprecated. Use RECAP_ROOT.");
}
```

---

## Part 3 — 60-Day Alias Window

The alias window begins on the day the plugin rename commit is merged and the new version is published to the 10x marketplace.

### During the alias window (days 0–60)

| Mechanism | Action |
|---|---|
| 10x `marketplace.json` | Keep `recap-studio` entry with `"_deprecated": true` pointing to the renamed repo |
| GitHub redirect | Active automatically after repo rename; no action needed |
| npm `recap-studio` | Keep published with deprecation notice pointing to `@aboudjem/recap` |
| Config file | `load-config.ts` reads `recap.config.ts` first, falls back to `recap-studio.config.ts` |
| Env vars | Hook scripts read new names first, fall back to old with deprecation warning |
| Plugin cache | Users with `recap-studio@10x` installed see a deprecation notice on next `/reload-plugins` |

### Alias window end (day 60)

- Remove the deprecated `recap-studio` entry from the 10x `marketplace.json`.
- Remove the `load-config.ts` fallback for `recap-studio.config.ts`.
- Remove the `RECAP_STUDIO_ROOT` / `RECAP_STUDIO_FIXTURE_ONLY` fallback env var handling.
- Publish a final `recap-studio@0.3.1` to npm with `deprecated: true` and no bin content (redirect notice only).

---

## Part 4 — Step-by-Step Execution Sequence

Run these steps in order. Do not skip steps. Steps marked **[ATOMIC]** must be committed together.

### Phase A — Prepare (no visible changes to users)

1. **Create a feature branch:** `git checkout -b rename/recap-studio-to-recap`
2. **Audit current test baseline:** `pnpm test` — confirm 44 tests passing before any change.
3. **Verify the 10x repo is accessible** and a branch can be opened in `Aboudjem/10x`.

### Phase B — Core rename [ATOMIC] (one commit, one PR)

4. Edit `.claude-plugin/plugin.json` per 2.1.
5. Edit `.claude-plugin/marketplace.json` per 2.2.
6. Edit monorepo root `package.json` per 2.10 (name + version bump to 0.3.0).
7. Edit `CHANGELOG.md` per 2.6.
8. Run `pnpm test` — confirm still 44 passing.
9. Commit: `git commit -m "rename: recap-studio → recap (plugin identity, v0.3.0)"`

### Phase C — Source references (one or more commits)

10. Apply all Tier 4 changes (2.12–2.31) systematically.
11. Rename `recap-studio.config.example.ts` → `recap.config.example.ts`.
12. Update `.gitignore` per 2.13.
13. Update `load-config.ts` dual-name lookup per 2.19.
14. Update `validate-before-deploy.mjs` and other hooks per 2.18.
15. Update skill SKILL.md files per 2.14–2.16.
16. Run `pnpm test` after each logical group of changes.
17. Run `grep -rn "recap-studio" . --include="*.ts" --include="*.tsx" --include="*.mjs" --include="*.json" --include="*.md" | grep -v node_modules | grep -v dist | grep -v ".git" | grep -v "CHANGELOG" | grep -v "docs/audit" | grep -v "MIGRATION_PLAN_RECAP"` to verify cleanup completeness.

### Phase D — npm placeholder

18. Edit `npm-placeholder/package.json` per 2.8 (version bump + URL updates).
19. Rename `npm-placeholder/bin/recap-studio.mjs` → `npm-placeholder/bin/recap.mjs` per 2.12.
20. Publish: `cd npm-placeholder && npm publish` (publishes updated `recap-studio@0.3.0`).
21. Run deprecation command per 2.8.
22. Publish scoped package: create `npm-placeholder/package-scoped.json` per 2.9; publish `@aboudjem/recap@0.3.0`.

### Phase E — GitHub repo rename

23. In GitHub web UI: `Settings → Repository name → recap → Rename`.
24. Update local remote: `git remote set-url origin https://github.com/Aboudjem/recap.git`
25. Push the feature branch: `git push -u origin rename/recap-studio-to-recap`
26. Open PR in the newly renamed repo.

### Phase F — 10x marketplace update

27. Open a PR in `Aboudjem/10x` with changes from 2.3.
28. Merge after the main repo PR is merged.

### Phase G — Smoke test

29. In a clean Claude Code session (not in the repo): `claude plugin marketplace add Aboudjem/10x`
30. `claude plugin install recap@10x`
31. `/reload-plugins`
32. `/recap "test migration"` — confirm the skill runs and produces output.
33. Confirm old install `claude plugin install recap-studio@10x` still resolves (via alias) and shows the deprecation message.

### Phase H — Documentation + CI

34. Update `docs/` guide files per 2.29.
35. Add the smoke test from Phase G to the CI workflow.
36. Tag the release: `git tag v0.3.0 && git push origin v0.3.0`.

---

## Part 5 — Tests and CI Changes

### Test changes required

| File | Change |
|---|---|
| `packages/content-pipeline/src/load-config.test.ts` | Add tests: `recap.config.ts` found → loaded; `recap-studio.config.ts` found (no `recap.config.ts`) → loaded with deprecation warning; neither found → returns defaults |
| `packages/mcp-server/src/tools.test.ts` | Update `serverInfo.name` assertion from `recap-studio-tools` to `recap-tools` |
| `packages/html-renderer/src/render.test.ts` | Update any snapshot strings containing `recap-studio` |
| `packages/validation/src/run.test.ts` | Same — snapshot/string cleanup |
| New CI smoke test | `claude plugin install recap@10x` → `/recap "test"` → exit 0 |
| New CI backward-compat test | `claude plugin install recap-studio@10x` → resolve via deprecated alias → exit 0 |

### CI workflow changes

Add a step to the CI YAML (whichever CI provider is configured):

```yaml
- name: Verify no unintended recap-studio references remain
  run: |
    LEAKS=$(grep -rn "recap-studio" . \
      --include="*.ts" --include="*.tsx" --include="*.mjs" \
      --include="*.json" --include="*.md" \
      | grep -v node_modules | grep -v dist | grep -v ".git" \
      | grep -v CHANGELOG | grep -v "docs/audit" \
      | grep -v MIGRATION_PLAN_RECAP | grep -v "npm-placeholder" \
      | grep -v "@recap-studio/" \
      | wc -l)
    if [ "$LEAKS" -gt "0" ]; then
      echo "ERROR: $LEAKS unintended recap-studio references found"
      grep -rn "recap-studio" . ... # same flags
      exit 1
    fi
```

The grep excludes:
- `@recap-studio/` scope references (kept intentionally until scope rename)
- `npm-placeholder/` (the npm backward-compat package must keep the old name)
- `CHANGELOG.md` and `docs/audit/` (historical records)
- `MIGRATION_PLAN_RECAP.md` (this file)

---

## Part 6 — Rollback Plan

The rollback window is the same as the alias window: 60 days.

### Rollback trigger conditions

- Plugin install `recap@10x` fails for users and cannot be fixed in < 24h.
- A breaking change in the GitHub redirect causes cloned repos to break.
- The npm `@aboudjem/recap` publish is rejected or causes confusion.

### Rollback procedure

1. **Revert the core plugin identity commit:**
   ```
   git revert <commit-hash-of-phase-B-commit>
   git push origin main
   ```
2. **Re-publish to 10x marketplace:** restore `"name": "recap-studio"` in `Aboudjem/10x/.claude-plugin/marketplace.json`.
3. **GitHub redirect:** the `Aboudjem/recap-studio` → `Aboudjem/recap` redirect remains active automatically (GitHub does not undo it on code revert). Users with cloned repos using the old remote URL continue to work via redirect. If the redirect must be removed: rename the repo back via `Settings → Repository name → recap-studio`.
4. **npm:** `npm deprecate @aboudjem/recap "Deprecated — use recap-studio instead"`.
5. **Load-config fallback:** the dual-name lookup (`recap.config.ts` first, `recap-studio.config.ts` fallback) means users with existing `recap-studio.config.ts` files are never broken in either direction. No rollback needed for config files.

### Post-rollback assessment

Document the failure mode in `docs/audit/05-architecture-rename-decision.md` under a new `## Rollback — YYYY-MM-DD` section before retrying.

---

## Part 7 — Decision Summary Table

| Item | Decision | Confidence | Blocked by | Needs user approval |
|---|---|---|---|---|
| Plugin `name` in `plugin.json` | rename to `recap` | likely | nothing | YES |
| Plugin `name` in `marketplace.json` | rename to `recap` | likely | nothing | YES |
| 10x marketplace entry | rename + backward alias | likely | nothing | YES |
| GitHub repo name | rename to `Aboudjem/recap` | likely | nothing (redirect automatic) | YES |
| npm `recap` package | DO NOT claim | confirmed-blocked | owned by third party | N/A |
| npm `recap-studio` placeholder | deprecate, keep | confirmed | nothing | YES |
| `@aboudjem/recap` scoped package | publish new | likely | nothing | YES |
| `@recap-studio/*` internal scope | deferred | likely | scope rename complexity | YES (separate decision) |
| Config filename | `recap.config.ts` with fallback | likely | nothing | YES |
| TypeScript type names | unchanged (deferred) | likely | breaking change risk | YES (separate decision) |
| User-visible commands `/recap` etc. | no change needed | confirmed | nothing | N/A |
| Env vars | new names + 60-day fallback | likely | nothing | YES |

---

## Part 8 — Open Questions for User

Before executing, confirm answers to these questions:

1. **Scope rename:** Do you want to rename `@recap-studio/*` → `@aboudjem/recap-*` (or another scope) at the same time, or defer it to a separate PR?
2. **TypeScript type rename:** Do you want `RecapStudioConfig` → `RecapConfig` (breaking change to any local config files)? Or keep the type name unchanged?
3. **Vercel project name:** Is the Vercel project currently named `recap-studio`? If so, do you want to rename it in the Vercel dashboard to `recap`? (This changes the default Vercel URL if no custom domain is set.)
4. **Config filename:** Do you want to rename `recap-studio.config.ts` → `recap.config.ts` on the first run after merge, or keep the old name active indefinitely via the fallback?
5. **Timeline:** Is there a preferred date for the rename to land (to coordinate with any announcements or blog posts)?

---

_Last updated: 2026-05-29. Author: Adam Boudjemaa (Aboudjem). Status: RECOMMENDED / NOT YET EXECUTED / needs-user-approval._
_Sources: `.claude-plugin/plugin.json` (verified), `.claude-plugin/marketplace.json` (verified), `npm-placeholder/package.json` (verified), `packages/*/package.json` (verified), `scripts/` (verified), `hooks/` (verified), `skills/` (verified), grep output across full repo tree, `docs/audit/05-architecture-rename-decision.md` (decision rationale)._
