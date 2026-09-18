#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/vercel/deploy.sh — deploy one network site (or all) to production.
#
#   npm run vercel:deploy -- pdf       # build + deploy pdf.toolsrift.com
#   npm run vercel:deploy -- --all     # every site, sequentially
#
# Uses the project created by scripts/vercel/bootstrap.sh. The build happens on
# Vercel with that project's NEXT_PUBLIC_SITE_ID, so the deploy command is the
# same for every site. Normally you will not need this at all: once the Vercel
# projects are connected to the Git repo, every push to main deploys all 30
# sites automatically (hub + 29). This is for manual / CI-driven deploys.
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."

VERCEL="${VERCEL_BIN:-npx vercel}"
SCOPE_ARGS=()
if [[ -n "${VERCEL_TEAM:-}" ]]; then SCOPE_ARGS=(--scope "$VERCEL_TEAM"); fi

deploy_one() {
  local id="$1"
  local project="toolsrift-$id"
  echo "══ deploying $project"
  $VERCEL link --yes --project "$project" "${SCOPE_ARGS[@]}" >/dev/null
  $VERCEL deploy --prod --yes "${SCOPE_ARGS[@]}"
  rm -rf .vercel
}

if [[ "${1:-}" == "--all" ]]; then
  for id in $(node scripts/sites/list.js --json | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8")).forEach(r=>console.log(r.id))'); do
    deploy_one "$id"
  done
elif [[ -n "${1:-}" ]]; then
  deploy_one "$1"
else
  echo "usage: $0 <site-id> | --all"; exit 2
fi
