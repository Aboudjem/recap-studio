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

## Preview

```bash
pnpm demo:latest-ai-models
pnpm validate:demo
RECAP_USER_CONFIRMED_PREVIEW=1 pnpm deploy:preview
```

This calls `scripts/deploy-preview.sh`, which delegates to:

```bash
vercel deploy apps/recap-web --yes
```

## Production

Reserved for after a manual visual + content review. The script asks for an
explicit confirmation env var and a config flag in the same commit so the
intent is auditable.

```bash
RECAP_USER_CONFIRMED_PROD_DEPLOY=1 pnpm deploy:prod
```

## Env vars

Recap Studio never writes env files. Set these in Vercel project settings
(or your local shell when running the CLI):

| Var                     | When needed                         |
| ----------------------- | ----------------------------------- |
| `VERCEL_TOKEN`          | Headless deploy from CI             |
| `VERCEL_ORG_ID`         | Headless deploy from CI             |
| `VERCEL_PROJECT_ID`     | Headless deploy from CI             |

The site itself reads no Vercel env vars at runtime.

## Build output

`next.config.mjs` sets `output: "standalone"`. After `pnpm --filter recap-web build`
you get a self-contained server in `apps/recap-web/.next/standalone/`. Vercel
can also build via `pnpm install && pnpm --filter recap-web build`.

## CSP and security headers

Recap Studio ships no inline `<script>` with user data. Recommended headers:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; frame-ancestors 'none'
```
