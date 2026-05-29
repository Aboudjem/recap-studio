#!/usr/bin/env bash
# Recap Studio — Vercel PRODUCTION deploy.
#
# Off by default. Requires:
#   1. recap-studio.config.ts -> deploymentMode = "production-with-confirmation"
#   2. RECAP_USER_CONFIRMED_PROD_DEPLOY=1
#   3. The Claude Code hook `validate-before-deploy` will block otherwise.
#
# Strategy: same prebuilt flow as preview. See deploy-preview.sh for why.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f recap-studio.config.ts ]]; then
  echo "recap-studio: recap-studio.config.ts not found — run /recap setup first." >&2
  exit 2
fi

if ! grep -Eq 'deploymentMode\s*:\s*"production-with-confirmation"' recap-studio.config.ts; then
  echo "recap-studio: deploymentMode must be 'production-with-confirmation'." >&2
  exit 2
fi

if [[ "${RECAP_USER_CONFIRMED_PROD_DEPLOY:-0}" != "1" ]]; then
  echo "recap-studio: set RECAP_USER_CONFIRMED_PROD_DEPLOY=1 only after explicit human confirmation." >&2
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

echo "recap-studio: building locally for PRODUCTION (vercel build --prod)..."
( cd "$APP_DIR" && vercel build --prod --yes )

echo "recap-studio: uploading prebuilt output to Vercel (prod)..."
exec sh -c "cd '$APP_DIR' && vercel deploy --prebuilt --prod --yes"
