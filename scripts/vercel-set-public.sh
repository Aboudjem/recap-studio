#!/usr/bin/env bash
# Recap Studio — toggle Vercel project SSO (Deployment Protection).
#
# Vercel projects default ssoProtection.deploymentType to
# "all_except_custom_domains", which makes preview URLs return HTTP 401
# unless the viewer is logged into Vercel. This script disables that so
# preview links are publicly readable.
#
# This is a PROJECT-level change. It affects ALL future deployments. Requires
# explicit confirmation via RECAP_USER_CONFIRMED_PUBLIC=1.
#
# Usage:
#   RECAP_USER_CONFIRMED_PUBLIC=1 scripts/vercel-set-public.sh
#   RECAP_USER_CONFIRMED_PUBLIC=1 SSO_MODE=preview_only scripts/vercel-set-public.sh
#
# SSO_MODE values:
#   off          → disable SSO protection entirely (default)
#   preview_only → keep SSO on production deploys, public previews
#   all          → re-enable SSO for everything (revert)
#
# Reads the Vercel CLI token from the local keychain (~/Library/Application
# Support/com.vercel.cli/auth.json on macOS). Never echoes the token.

set -euo pipefail

if [[ "${RECAP_USER_CONFIRMED_PUBLIC:-0}" != "1" ]]; then
  echo "recap-studio: set RECAP_USER_CONFIRMED_PUBLIC=1 to confirm a project-wide SSO change." >&2
  exit 2
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_JSON="$ROOT/apps/recap-web/.vercel/project.json"
if [[ ! -f "$PROJECT_JSON" ]]; then
  echo "recap-studio: $PROJECT_JSON not found — run 'vercel link' inside apps/recap-web first." >&2
  exit 2
fi

PROJECT_ID="$(jq -r '.projectId' "$PROJECT_JSON")"
TEAM_ID="$(jq -r '.orgId' "$PROJECT_JSON")"

# Token resolution: env wins, then local CLI keychain.
TOKEN="${VERCEL_TOKEN:-}"
if [[ -z "$TOKEN" ]]; then
  AUTH_FILE="${HOME}/Library/Application Support/com.vercel.cli/auth.json"
  if [[ -f "$AUTH_FILE" ]]; then
    TOKEN="$(jq -r '.token' "$AUTH_FILE" 2>/dev/null || true)"
  fi
fi
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "recap-studio: no Vercel token found. Set VERCEL_TOKEN or run 'vercel login'." >&2
  exit 2
fi

case "${SSO_MODE:-off}" in
  off)          PAYLOAD='{"ssoProtection": null}' ;;
  preview_only) PAYLOAD='{"ssoProtection": {"deploymentType": "only_production_deployments"}}' ;;
  all)          PAYLOAD='{"ssoProtection": {"deploymentType": "all"}}' ;;
  *)
    echo "recap-studio: unknown SSO_MODE '${SSO_MODE}' (expected off|preview_only|all)." >&2
    exit 2
    ;;
esac

echo "recap-studio: applying SSO_MODE='${SSO_MODE:-off}' to project $PROJECT_ID..."
RESPONSE="$(curl -s -X PATCH "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")"

if printf '%s' "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
  echo "recap-studio: API error:" >&2
  printf '%s\n' "$RESPONSE" | jq '.error' >&2
  exit 1
fi

printf '%s\n' "$RESPONSE" | jq '{ssoProtection, passwordProtection}'
echo "recap-studio: done. Existing deployment URLs should now reflect the new protection."
