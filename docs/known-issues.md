# Known issues & guardrails

Living list of bugs and surprises that have actually bitten us, plus the
guardrail (script, hook, doc, or code change) that should prevent the same
thing from happening twice. Append; never rewrite history.

If a future session hits something new, add it here before moving on.

---

## vercel-monorepo-pnpm

**Symptom (2026-05-13).** `pnpm deploy:preview` failed remote build with
`Error: Command "npm install" exited with 1`. Vercel had already uploaded
215 KB before the failure showed up.

**Root cause.** Vercel's remote builder defaults to `npm install` when
`vercel.json -> installCommand` is `null`. The `apps/recap-web/package.json`
declares `workspace:*` deps (`@recap-studio/content-pipeline`,
`design-system`, `validation`) that npm can't resolve. Vercel's pnpm
auto-detection sees the root, not the workspace, and never engages.

**Guardrail.** `scripts/deploy-preview.sh` and `scripts/deploy-prod.sh`
now run `vercel build` locally then `vercel deploy --prebuilt`. The remote
side never installs. See `docs/vercel-deployment.md#why-prebuilt-instead-of-pure-remote-build`.

**Trigger for re-testing this.** Anyone who removes the workspace
indirection or switches `apps/recap-web` to a standalone package can drop
the `--prebuilt` step and let Vercel build remotely.

---

## vercel-sso-protection

**Symptom (2026-05-13).** Preview URL `https://recap-...-aboudjems-projects.vercel.app`
returned HTTP 401 from any browser not logged into our Vercel team. "Read
from anywhere" was broken silently.

**Root cause.** Vercel projects default to
`ssoProtection.deploymentType = "all_except_custom_domains"`. Every
`*.vercel.app` URL is SSO-gated unless you alias a custom domain or toggle
the setting.

**Guardrail.** Documented in `docs/vercel-deployment.md#deployment-protection-sso-gate`.
Added `scripts/vercel-set-public.sh` that takes `SSO_MODE=off|preview_only|all`
and requires `RECAP_USER_CONFIRMED_PUBLIC=1`. The deploy preview script
prints a hint about it whenever it runs.

---

## resend-restricted-key-fallback

**Symptom (2026-05-13).** `GET /domains` returned
`{"statusCode":401,"message":"This API key is restricted to only send emails"}`.
We needed a verified FROM address but couldn't list the verified domains
because the key is send-only.

**Root cause.** Resend's UI lets you mint a key with the "Sending access"
scope only. Such keys can `POST /emails` but can't enumerate domains, so
the agent can't know which `from:` is valid.

**Guardrail.** `docs/configuration.md#email` documents the
`onboarding@resend.dev` sandbox fallback (works for any restricted key but
can only deliver to the email of the Resend account owner). For a real
custom FROM, mint a full-access key or pre-set `DEFAULT_EMAIL_FROM` in env.

---

## active-slug-silent-fallback

**Symptom (2026-05-13).** `apps/recap-web/src/lib/active-content.json`
pointed at slug `latest-ai-may-2026` but no `apps/recap-web/src/content/latest-ai-may-2026.json`
file existed. `loadContent()` quietly fell back to the fixtures directory
and rendered the latest-ai-models page instead. Bug took a build cycle to
notice.

**Root cause.** The fallback chain in `apps/recap-web/src/lib/content.ts`
was designed to "always render something". It did, but silently.

**Guardrail.** `apps/recap-web/src/lib/content.ts` now `console.warn`s
when the active slug falls through to the fixture path. The warning shows
up in `pnpm --filter recap-web build` and in `vercel build` logs, which is
where future drift will be caught.

**Trigger for re-testing this.** If we ever switch the active-content
pointer to a hard error, audit demo scripts (`scripts/demo-*.mjs`) to make
sure they write both the content file AND the pointer atomically.

---

## vercel-build-cold-cost

**Symptom (2026-05-13).** `vercel build` first run took ~10 minutes wall
clock for a static-export Next.js app.

**Root cause.** Vercel CLI re-installs deps inside its own ephemeral
context (independent of the host `node_modules/`), then runs `next build`.
Subsequent runs reuse a cache and are much faster.

**Guardrail.** Doc note in `docs/vercel-deployment.md#preview` so the
agent and the user expect the cold cost, and the deploy script prints a
"first run can take ~10 min" hint before kicking off. Not worth optimising
further until someone needs to deploy many times per day.

---

## plugin-cache-write-target

**Symptom (2026-05-13/14).** The `/recap topic` skill ran from a fresh
shell wrote `apps/recap-web/src/content/<slug>.json` and updated
`apps/recap-web/src/lib/active-content.json` inside the **plugin cache**
at `~/.claude/plugins/cache/10x/recap-studio/<version>/...`. The build
worked, the validator passed, but every artifact silently lives in a
directory that Claude Code overwrites on the next plugin update. The
generated recap is effectively ephemeral.

**Root cause.** Claude Code skills resolve relative paths against
`process.cwd()`, which in plugin-cache invocations resolves to the
cached plugin directory rather than any editable fork. The SKILL.md
workflow step 7 ("emit `apps/recap-web/src/content/<slug>.json`") never
qualifies the path or names the target repo.

**Guardrail.** `skills/recap-topic/SKILL.md` now has an explicit
**Target repo resolution** rule before step 7: prefer
`~/projects/recap-studio` (or any user-passed `RECAP_STUDIO_ROOT`) if it
exists and is a git checkout; only fall back to the plugin cache with a
loud warning. The skill must echo the resolved root in the final
report so future drift is obvious in the transcript.

**Trigger for re-testing this.** Anyone who deletes `~/projects/recap-studio`
or changes the plugin install layout should re-check this routing.
Cached-dir writes still work for one-shot demo runs but are not durable.

---

## resend-200-ok-not-delivery

**Symptom (2026-05-13/14).** `POST /emails` returned `200 OK` with a
proper `id` field (`50eefcd7-…`, `af6912ba-…`), so the agent reported
the email as sent. The user reported they never received it. No bounce,
no DSN, no Resend dashboard access (restricted key).

**Root cause.** Two independent issues, both producing the same surface:

1. `onboarding@resend.dev` is Resend's sandbox sender. It is accepted
   from any account, but Resend only delivers it to the email address of
   the Resend account **owner**. Sends to any other recipient return
   `200` with an id and are then silently dropped (or, on newer keys,
   `403 You can only send testing emails to your own email address`).
2. Even when the recipient IS the owner, Microsoft 365 / Outlook
   aggressively spam-quarantines or junk-folders mail from
   `onboarding@resend.dev` because the sandbox sender has weak SPF/DKIM
   alignment against the recipient's corporate inbound rules. The mail
   arrives but is invisible to the user.

**Guardrail.** Three changes:

- `docs/configuration.md#email-deliverability-gotchas` documents both
  failure modes so the skill can warn before sending.
- The `/recap topic` workflow now treats a successful `POST /emails`
  with `from: onboarding@resend.dev` as **"queued, not confirmed"** and
  always tells the user to check Junk/Spam/Quarantine, with a one-line
  reminder to verify the domain on resend.com/domains for reliable
  delivery.
- For corporate inboxes on Microsoft 365 / Google Workspace, the report
  recommends a verified domain (`recap@<your-domain>`) or a
  consumer-grade fallback recipient (e.g. a Gmail) for testing.

**Trigger for re-testing this.** If Resend ships a feature that exposes
domain status to restricted send-only keys, or if MS365 changes its
default quarantine for `resend.dev`, revisit this entry.

---

## How to add a new entry

Use this template. Keep entries short, evidence-first, with a real date.

```markdown
## <kebab-case-handle>

**Symptom (YYYY-MM-DD).** What broke from the user's POV.

**Root cause.** Why it broke. One paragraph, no speculation.

**Guardrail.** What we changed (file path) so it does not recur.

**Trigger for re-testing this.** What invalidates the guardrail.
```
