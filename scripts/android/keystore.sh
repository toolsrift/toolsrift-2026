#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/android/keystore.sh — create the upload signing key for one app.
#
#   npm run android:keystore -- pdf
#
# Writes android/keys/<id>.keystore (git-ignored) and prints the SHA-256
# fingerprint you must put in that site's ANDROID_SHA256_FINGERPRINTS env var
# on Vercel (so /.well-known/assetlinks.json verifies the app). Keep the
# keystore + password in a password manager: losing it means you can never
# update that app again (unless you enrol in Play App Signing — recommended,
# see android/README.md).
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."
id="${1:?usage: keystore.sh <site-id>}"
ks="android/keys/$id.keystore"
pass="${KEYSTORE_PASSWORD:-}"
if [[ -z "$pass" ]]; then read -rsp "Keystore password for $id: " pass; echo; fi

if [[ -f "$ks" ]]; then
  echo "keystore exists: $ks"
else
  keytool -genkeypair -v \
    -keystore "$ks" -alias "$id" -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$pass" -keypass "$pass" \
    -dname "CN=ToolsRift $id, OU=Apps, O=ToolsRift, L=Hyderabad, ST=Telangana, C=IN"
fi

echo
echo "SHA-256 fingerprint (add to ANDROID_SHA256_FINGERPRINTS for site '$id'):"
keytool -list -v -keystore "$ks" -alias "$id" -storepass "$pass" | grep -E 'SHA256:' | sed 's/^[[:space:]]*SHA256: //'
