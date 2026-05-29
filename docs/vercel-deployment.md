# Vercel deployment

Deploy is **off by default**. You must:

1. Run `/recap setup` to create `recap-studio.config.ts`.
2. Set `deploymentMode` to `"preview"` or `"production-with-confirmation"`.
3. Install the Vercel CLI (`npm i -g vercel`) and run `vercel login`.
4. Confirm the deploy via env:
   - Preview: `RECAP_USER_CONFIRMED_PREVIEW=1`
   - Production: `RECAP_USER_CONFIRMED_PROD_DEPLOY=1`

The `validate-before-deploy` hook will block `vercel --prod` invocations
that do not satisfy all three rules above.

## Why `--prebuilt` instead of pure remote build

The deploy scripts run `vercel build` **locally** then upload the result
with `vercel deploy --prebuilt`. They do **not** ask Vercel to build the
repo on its own servers. Why:

- This repo is a **pnpm workspace** (`apps/recap-web/package.json` declares
  `workspace:*` deps on `@recap-studio/content-pipeline` and friends).
- Vercel's remote builder does not auto-detect that. With
  `vercel.json -> installCommand: null` it defaults to `npm install`, which
  fails on `workspace:*` URIs.
- Running `vercel build` locally reuses your already-installed pnpm
  workspace, then `--prebuilt` uploads `.vercel/output/` as a finished
  artifact. The remote skips install entirely.

If you ever switch this app off the workspace, you can revert to a plain
remote build by removing the `vercel build` step from the scripts.

See `docs/known-issues.md#vercel-monorepo-pnpm` for the full debug
history.

## Preview

```bash
pnpm demo:latest-ai-models
pnpm validate:demo
RECAP_USER_CONFIRMED_PREVIEW=1 pnpm deploy:preview
```

This calls `scripts/deploy-preview.sh`, which:

1. Checks the config + confirmation env vars.
2. Runs `vercel build --yes` inside `apps/recap-web` (first build is slow,
   ~10 min cold; subsequent builds reuse the cache).
3. Runs `vercel deploy --prebuilt --yes` to upload the finished output.
4. Prints the preview URL and a hint about SSO protection (see below).

## Production

Reserved for after a manual visual + content review. The script asks for
an explicit confirmation env var and a config flag in the same commit so
the intent is auditable.

```bash
RECAP_USER_CONFIRMED_PROD_DEPLOY=1 pnpm deploy:prod
```

Same prebuilt flow as preview, with `--prod`.

## Deployment Protection (SSO gate)

By default Vercel projects ship with `ssoProtection.deploymentType =
"all_except_custom_domains"`. That means **every preview and production
URL on the `*.vercel.app` host returns HTTP 401 to anyone not logged
into your Vercel team**. Only deployments aliased to a custom domain are
public.

If you want preview URLs you can share with anyone, run:

```bash
RECAP_USER_CONFIRMED_PUBLIC=1 scripts/vercel-set-public.sh
# or keep prod gated, expose only previews:
RECAP_USER_CONFIRMED_PUBLIC=1 SSO_MODE=preview_only scripts/vercel-set-public.sh
# revert to fully gated:
RECAP_USER_CONFIRMED_PUBLIC=1 SSO_MODE=all scripts/vercel-set-public.sh
```

The script PATCHes `https://api.vercel.com/v9/projects/{id}` with the
Vercel CLI's stored token. It never echoes the token.

This is a **project-level** change — it affects every deployment of the
project, past and future. Treat it as a deliberate setting, not a deploy
flag.

## Env vars

Recap Studio never writes env files. Set these in Vercel project settings
(or your local shell when running the CLI):

| Var                                | When needed                                    |
| ---------------------------------- | ---------------------------------------------- |
| `VERCEL_TOKEN`                     | Headless deploy from CI                        |
| `VERCEL_ORG_ID`                    | Headless deploy from CI                        |
| `VERCEL_PROJECT_ID`                | Headless deploy from CI                        |
| `RECAP_USER_CONFIRMED_PREVIEW=1`   | Confirm a preview deploy                       |
| `RECAP_USER_CONFIRMED_PROD_DEPLOY=1` | Confirm a production deploy                  |
| `RECAP_USER_CONFIRMED_PUBLIC=1`    | Confirm a project-level SSO toggle             |
| `SSO_MODE=off\|preview_only\|all`  | Used by `scripts/vercel-set-public.sh`         |

The site itself reads no Vercel env vars at runtime.

## Build output

`apps/recap-web/next.config.mjs` sets `output: "export"`, so the build
produces a static site in `apps/recap-web/out/`. `apps/recap-web/vercel.json`
points `outputDirectory` at `out`. Vercel serves it as static assets, no
Node runtime needed.

If you change `next.config.mjs -> output` to `"standalone"` or remove the
field, update `vercel.json -> outputDirectory` to match and switch the
deploy scripts to a normal remote build (no `--prebuilt`).

## CSP and security headers

Recap Studio ships no inline `<script>` with user data. Recommended headers:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; frame-ancestors 'none'
```
