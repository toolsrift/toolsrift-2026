#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/android/build.sh — build one Android app (TWA) or all of them.
#
#   npm run android:build -- pdf        # android/build/pdf/app-release-bundle.aab
#   npm run android:build -- hub        # the main ToolsRift app
#   npm run android:build -- --all      # every app in android/apps.json
#
# Same script the android-build GitHub workflow runs. Prerequisites:
#   • Bubblewrap (npm i -g @bubblewrap/cli) with JDK 17 + Android SDK
#     configured (bubblewrap doctor), or BUBBLEWRAP="npx @bubblewrap/cli@1.25.0"
#   • npm run android:generate  (android/apps/<id>/twa-manifest.json)
#   • the upload keystore: npm run android:keystore  (android/keys/upload.keystore)
#   • KEYSTORE_PASSWORD (else Bubblewrap prompts)
#
# Env overrides: KEYSTORE_PATH, KEYSTORE_ALIAS (default upload),
#   ANDROID_VERSION_CODE / ANDROID_VERSION_NAME (default: the manifest's),
#   BUILD_DIR (default android/build).
#
# Every app opens toolsrift.com (the main app at /, a category app at
# /<slug>/). Icons and the web manifest are fetched from there; if the
# section manifest (/<slug>/manifest.webmanifest) is not deployed yet, the
# same manifest is taken from /api/site/manifest?site=<slug>. Chrome only opens
# an app full-screen once https://toolsrift.com/.well-known/assetlinks.json
# lists its package with the key's fingerprint (android/fingerprints.json).
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."
ROOT="$PWD"
BUBBLEWRAP="${BUBBLEWRAP:-npx @bubblewrap/cli@1.25.0}"
KEYSTORE_PATH="${KEYSTORE_PATH:-$ROOT/android/keys/upload.keystore}"
KEYSTORE_ALIAS="${KEYSTORE_ALIAS:-upload}"
BUILD_DIR="${BUILD_DIR:-$ROOT/android/build}"

build_one() {
  local id="$1"
  local src="$ROOT/android/apps/$id"
  local out="$BUILD_DIR/$id"
  [[ -f "$src/twa-manifest.json" ]] || { echo "missing $src/twa-manifest.json — run npm run android:generate"; return 1; }
  [[ -f "$KEYSTORE_PATH" ]] || { echo "missing keystore $KEYSTORE_PATH — run npm run android:keystore"; return 1; }
  mkdir -p "$out"
  echo "══ building $id"

  # Prepare the manifest for this build: absolute keystore path, version, and
  # a reachable web-manifest URL.
  local manifest_url; manifest_url="$(node -e 'console.log(require(process.argv[1]).webManifestUrl)' "$src/twa-manifest.json")"
  if ! curl -sfI --max-time 20 "$manifest_url" >/dev/null 2>&1 && [[ "$id" != "hub" ]]; then
    manifest_url="https://toolsrift.com/api/site/manifest?site=$id"
  fi
  echo "   web manifest: $manifest_url"
  MANIFEST_URL="$manifest_url" node -e '
    const fs = require("fs");
    const [src, out, ksPath, ksAlias] = process.argv.slice(1);
    const m = JSON.parse(fs.readFileSync(src, "utf8"));
    m.signingKey = { path: ksPath, alias: ksAlias };
    m.webManifestUrl = process.env.MANIFEST_URL;
    if (process.env.ANDROID_VERSION_CODE) m.appVersionCode = Number(process.env.ANDROID_VERSION_CODE);
    if (process.env.ANDROID_VERSION_NAME) { m.appVersionName = process.env.ANDROID_VERSION_NAME; m.appVersion = process.env.ANDROID_VERSION_NAME; }
    fs.writeFileSync(out, JSON.stringify(m, null, 2) + "\n");
    console.log(`   ${m.packageId}  v${m.appVersionName} (${m.appVersionCode})`);
  ' "$src/twa-manifest.json" "$out/twa-manifest.json" "$KEYSTORE_PATH" "$KEYSTORE_ALIAS"

  ( cd "$out" && \
    # Regenerates the Android project from twa-manifest.json (fetches icons),
    # then produces app-release-signed.apk + app-release-bundle.aab.
    $BUBBLEWRAP update --skipVersionUpgrade --manifest=twa-manifest.json && \
    if [[ -n "${KEYSTORE_PASSWORD:-}" ]]; then
      BUBBLEWRAP_KEYSTORE_PASSWORD="$KEYSTORE_PASSWORD" BUBBLEWRAP_KEY_PASSWORD="$KEYSTORE_PASSWORD" $BUBBLEWRAP build --skipPwaValidation --manifest=twa-manifest.json
    else
      $BUBBLEWRAP build --skipPwaValidation --manifest=twa-manifest.json
    fi )
  [[ -f "$out/app-release-bundle.aab" && -f "$out/app-release-signed.apk" ]] || { echo "   ✗ $id: build produced no bundle"; return 1; }
  echo "   ✓ $out/app-release-bundle.aab"
  echo "   ✓ $out/app-release-signed.apk"
}

if [[ "${1:-}" == "--all" ]]; then
  failed=()
  for id in $(node -e 'require("./android/apps.json").forEach(a => console.log(a.id))'); do
    build_one "$id" || failed+=("$id")
  done
  if (( ${#failed[@]} )); then echo "FAILED: ${failed[*]}"; exit 1; fi
elif [[ -n "${1:-}" ]]; then
  for id in "$@"; do build_one "$id"; done
else
  echo "usage: $0 <app-id>... | --all"; exit 2
fi
