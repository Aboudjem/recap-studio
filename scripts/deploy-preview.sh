#!/usr/bin/env bash
# Recap Studio — Vercel preview deploy.
# Off by default. Requires recap-studio.config.ts (deploymentMode at least "preview")
# AND the user to opt in via RECAP_USER_CONFIRMED_PREVIEW=1.

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

echo "recap-studio: deploying recap-web preview..."
exec vercel deploy apps/recap-web --yes
