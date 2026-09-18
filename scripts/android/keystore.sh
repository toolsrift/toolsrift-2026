#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/android/keystore.sh — create the shared UPLOAD signing key that every
# ToolsRift Android app is built with.
#
#   npm run android:keystore
#
# Writes android/keys/upload.keystore (git-ignored, alias "upload") and prints:
#   • the SHA-256 fingerprint → put it in android/fingerprints.json "all"
#     (served by every site at /.well-known/assetlinks.json);
#   • the base64 of the keystore → GitHub secret ANDROID_KEYSTORE_BASE64, with
#     the password in ANDROID_KEYSTORE_PASSWORD, so the android-build workflow
#     signs with the same key.
# Keep the keystore + password in a password manager. With Play App Signing
# (recommended) a lost upload key can be reset from the Play Console.
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."
ks="${KEYSTORE_PATH:-android/keys/upload.keystore}"
alias="${KEYSTORE_ALIAS:-upload}"
pass="${KEYSTORE_PASSWORD:-}"
if [[ -z "$pass" ]]; then read -rsp "Keystore password: " pass; echo; fi
mkdir -p "$(dirname "$ks")"

if [[ -f "$ks" ]]; then
  echo "keystore exists: $ks"
else
  keytool -genkeypair -v \
    -keystore "$ks" -alias "$alias" -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$pass" -keypass "$pass" \
    -dname "CN=ToolsRift Apps, OU=Apps, O=ToolsRift, L=Hyderabad, ST=Telangana, C=IN"
fi

echo
echo "SHA-256 fingerprint (android/fingerprints.json → \"all\"):"
keytool -list -v -keystore "$ks" -alias "$alias" -storepass "$pass" | grep -E 'SHA256:' | sed 's/^[[:space:]]*SHA256: //'
echo
echo "GitHub secret ANDROID_KEYSTORE_BASE64 (ANDROID_KEYSTORE_PASSWORD = the password you typed):"
base64 -w0 "$ks" 2>/dev/null || base64 "$ks" | tr -d '\n'
echo
