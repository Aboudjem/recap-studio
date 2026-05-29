#!/usr/bin/env bash
# Recap Studio — Vercel preview deploy.
#
# Off by default. Requires:
#   1. recap-studio.config.ts with deploymentMode at least "preview"
#   2. RECAP_USER_CONFIRMED_PREVIEW=1
#   3. Vercel CLI installed and logged in (`vercel login`)
#
# Strategy: build LOCALLY then `vercel deploy --prebuilt`.
# Why: Vercel's remote builder defaults to `npm install`, which fails on this
# repo's pnpm workspace (`workspace:*` deps in apps/recap-web/package.json).
# Local `vercel build` runs the existing pnpm setup, then `--prebuilt`
# uploads the finished .vercel/output/ without touching install on the remote.
# See docs/known-issues.md#vercel-monorepo-pnpm.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f recap-studio.config.ts ]]; then
  echo "recap-studio: recap-studio.config.ts not found — run /recap setup first." >&2
  exit 2
fi

if ! grep -Eq 'deploymentMode\s*:\s*"(preview|production-with-confirmation)"' recap-studio.config.ts; then
  echo "recap-studio: deploymentMode must be 'preview' or 'production-with-confirmation'." >&2
  exit 2
fi

if [[ "${RECAP_USER_CONFIRMED_PREVIEW:-0}" != "1" ]]; then
  echo "recap-studio: set RECAP_USER_CONFIRMED_PREVIEW=1 to confirm a preview deploy." >&2
  exit 2
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "recap-studio: vercel CLI not installed. See docs/vercel-deployment.md." >&2
  exit 2
fi

APP_DIR="$ROOT/apps/recap-web"
if [[ ! -d "$APP_DIR" ]]; then
  echo "recap-studio: apps/recap-web not found." >&2
  exit 2
fi

echo "recap-studio: building locally (vercel build) — first run can take ~10 min..."
( cd "$APP_DIR" && vercel build --yes )

echo "recap-studio: uploading prebuilt output to Vercel..."
DEPLOY_OUT="$(cd "$APP_DIR" && vercel deploy --prebuilt --yes)"
echo "$DEPLOY_OUT"

DEPLOY_URL="$(printf '%s\n' "$DEPLOY_OUT" | grep -Eo 'https://[a-z0-9.-]+\.vercel\.app' | tail -1 || true)"

if [[ -n "${DEPLOY_URL:-}" ]]; then
  echo ""
  echo "recap-studio: preview URL → $DEPLOY_URL"
  if [[ "${RECAP_PUBLIC_PREVIEW:-0}" == "1" ]]; then
    echo "recap-studio: RECAP_PUBLIC_PREVIEW=1 set — see scripts/vercel-set-public.sh to disable SSO project-wide."
  else
    echo "recap-studio: NOTE — Vercel projects default to SSO-gated previews (HTTP 401 without login)."
    echo "             Run scripts/vercel-set-public.sh to disable, or share the URL with Vercel-logged-in viewers."
  fi
fi
