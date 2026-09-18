#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/android/build.sh — build the Android app (TWA) for one site or all.
#
#   npm run android:build -- pdf        # android/build/pdf/app-release-bundle.aab
#   npm run android:build -- --all
#
# Prerequisites (one-time, see android/README.md):
#   npm i -g @bubblewrap/cli    and    bubblewrap doctor   (installs JDK + SDK)
#   npm run android:generate    (twa-manifest.json per app, from brands.js)
#   npm run android:keystore -- <id>
#   The site must be LIVE on its domain (Bubblewrap fetches the icons and the
#   web manifest from https://<domain>/ at build time).
#
# Set KEYSTORE_PASSWORD to build non-interactively.
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."

build_one() {
  local id="$1"
  local src="android/apps/$id"
  local out="android/build/$id"
  [[ -f "$src/twa-manifest.json" ]] || { echo "missing $src/twa-manifest.json — run npm run android:generate"; exit 1; }
  [[ -f "android/keys/$id.keystore" ]] || { echo "missing android/keys/$id.keystore — run npm run android:keystore -- $id"; exit 1; }
  mkdir -p "$out"
  cp "$src/twa-manifest.json" "$out/twa-manifest.json"
  echo "══ building $id"
  ( cd "$out" && \
    # Bubblewrap regenerates the Android project from twa-manifest.json, then
    # produces app-release-signed.apk + app-release-bundle.aab (upload the AAB).
    npx @bubblewrap/cli update --skipVersionUpgrade >/dev/null 2>&1 || npx @bubblewrap/cli init --manifest="https://$(node -e 'console.log(require("./twa-manifest.json").host)')/manifest.json" --directory=. --skipPwaValidation <<< $'\n\n\n\n\n\n\n\n\n\n\n\n' && \
    if [[ -n "${KEYSTORE_PASSWORD:-}" ]]; then
      BUBBLEWRAP_KEYSTORE_PASSWORD="$KEYSTORE_PASSWORD" BUBBLEWRAP_KEY_PASSWORD="$KEYSTORE_PASSWORD" npx @bubblewrap/cli build --skipPwaValidation
    else
      npx @bubblewrap/cli build --skipPwaValidation
    fi )
  echo "   ✓ $out/app-release-bundle.aab"
}

if [[ "${1:-}" == "--all" ]]; then
  for id in $(node scripts/sites/list.js --json | node -e 'JSON.parse(require("fs").readFileSync(0,"utf8")).forEach(r=>console.log(r.id))'); do
    build_one "$id"
  done
elif [[ -n "${1:-}" ]]; then
  build_one "$1"
else
  echo "usage: $0 <site-id> | --all"; exit 2
fi
