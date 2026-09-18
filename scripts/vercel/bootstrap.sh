#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/vercel/bootstrap.sh — create the Vercel project for one network site
# (or all of them) from this single repository.
#
#   npm run vercel:bootstrap -- pdf          # one site
#   npm run vercel:bootstrap -- --all        # every site in lib/sites/brands.js
#
# Each site becomes its own Vercel project named "toolsrift-<id>", connected to
# this same Git repo, with NEXT_PUBLIC_SITE_ID=<id> set for every environment
# and its custom domain attached. (The env var is belt-and-braces: next.config.js
# also derives the site from the "toolsrift-<id>" project name.)
#
# Run it from a machine where `npx vercel login` works (the Claude Code cloud
# environment's default network policy blocks api.vercel.com). Requires the Vercel CLI to be logged in
# (`npx vercel login`) and VERCEL_ORG_ID / VERCEL_TEAM (optional) in the env.
#
# Idempotent: re-running updates the env var and re-adds the domain.
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."

VERCEL="${VERCEL_BIN:-npx vercel}"
SCOPE_ARGS=()
if [[ -n "${VERCEL_TEAM:-}" ]]; then SCOPE_ARGS=(--scope "$VERCEL_TEAM"); fi

bootstrap_one() {
  local id="$1"
  local row
  row="$(node scripts/sites/list.js --json | node -e '
    const rows = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const r = rows.find(r => r.id === process.argv[1] || r.slug === process.argv[1]);
    if (!r) { console.error("unknown site: " + process.argv[1]); process.exit(1); }
    console.log([r.id, r.domain, r.vercelProject].join(" "));
  ' "$id")"
  set -- $row
  local site="$1" domain="$2" project="$3"

  echo "══ $project  ($domain)"
  # 1. Project (linked to this repo's remote if `vercel git connect` is available)
  $VERCEL projects add "$project" "${SCOPE_ARGS[@]}" >/dev/null 2>&1 || true
  # 2. Link the local checkout to the project for the env/domain commands below
  $VERCEL link --yes --project "$project" "${SCOPE_ARGS[@]}" >/dev/null
  # 2b. Connect the project to this repository's git remote so every push to
  #     main deploys it (same as the hub project). Safe to re-run.
  $VERCEL git connect --yes "${SCOPE_ARGS[@]}" >/dev/null 2>&1 || echo "   (git connect skipped — connect in the dashboard: Settings → Git)"
  # 3. Build-time site selector, for every environment
  for env in production preview development; do
    $VERCEL env rm NEXT_PUBLIC_SITE_ID "$env" --yes "${SCOPE_ARGS[@]}" >/dev/null 2>&1 || true
    printf '%s' "$site" | $VERCEL env add NEXT_PUBLIC_SITE_ID "$env" "${SCOPE_ARGS[@]}" >/dev/null
  done
  # 4. Domain (DNS: A 76.76.21.21 or CNAME cname.vercel-dns.com — see docs/NETWORK-SITES.md)
  $VERCEL domains add "$domain" "$project" "${SCOPE_ARGS[@]}" || true
  $VERCEL domains add "www.$domain" "$project" "${SCOPE_ARGS[@]}" || true
  echo "   ✓ project=$project  NEXT_PUBLIC_SITE_ID=$site  domain=$domain"
  rm -rf .vercel
}

if [[ "${1:-}" == "--all" ]]; then
  for id in $(node scripts/sites/list.js --json | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8")).forEach(r=>console.log(r.id))'); do
    bootstrap_one "$id"
  done
elif [[ -n "${1:-}" ]]; then
  bootstrap_one "$1"
else
  echo "usage: $0 <site-id> | --all"; exit 2
fi
