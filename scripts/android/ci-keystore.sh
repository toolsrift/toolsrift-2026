#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# scripts/android/ci-keystore.sh — put the shared upload keystore in place for
# a CI build (.github/workflows/android-build.yml) and print its fingerprint.
#
# Writes android/keys/upload.keystore + android/keys/upload.password from, in
# order of preference:
#   1. the ANDROID_KEYSTORE_BASE64 + ANDROID_KEYSTORE_PASSWORD secrets;
#   2. --from-artifact: files already downloaded into android/keys/ (matrix jobs);
#   3. the newest "android-upload-keystore" artifact of an earlier run (GH_TOKEN);
#   4. a freshly generated key (first run without secrets).
# Outputs (GITHUB_OUTPUT): source=secret|artifact|previous-artifact|generated,
# fingerprint=<SHA-256>. The password is masked in the log.
# ----------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")/../.."
KS=android/keys/upload.keystore
PW=android/keys/upload.password
mkdir -p android/keys
source=""

if [[ -n "${ANDROID_KEYSTORE_BASE64:-}" && -n "${ANDROID_KEYSTORE_PASSWORD:-}" ]]; then
  printf '%s' "$ANDROID_KEYSTORE_BASE64" | base64 -d > "$KS"
  printf '%s' "$ANDROID_KEYSTORE_PASSWORD" > "$PW"
  source=secret
elif [[ "${1:-}" == "--from-artifact" ]]; then
  [[ -f "$KS" && -f "$PW" ]] || { echo "::error::keystore artifact not found in android/keys/"; exit 1; }
  source=artifact
else
  if [[ -n "${GH_TOKEN:-}" && -n "${GITHUB_REPOSITORY:-}" ]]; then
    id="$(gh api "repos/$GITHUB_REPOSITORY/actions/artifacts?name=android-upload-keystore&per_page=30" \
          --jq '[.artifacts[] | select(.expired == false)] | sort_by(.created_at) | reverse | .[0].id // empty' 2>/dev/null || true)"
    if [[ -n "$id" ]]; then
      if gh api "repos/$GITHUB_REPOSITORY/actions/artifacts/$id/zip" > /tmp/upload-keystore.zip 2>/dev/null \
         && unzip -o -q /tmp/upload-keystore.zip -d android/keys && [[ -f "$KS" && -f "$PW" ]]; then
        source=previous-artifact
        echo "reusing the upload keystore from artifact $id"
      fi
      rm -f /tmp/upload-keystore.zip
    fi
  fi
  if [[ -z "$source" ]]; then
    pass="$(openssl rand -base64 30 | tr -dc 'A-Za-z0-9' | cut -c1-24)"
    KEYSTORE_PASSWORD="$pass" bash scripts/android/keystore.sh >/dev/null
    printf '%s' "$pass" > "$PW"
    source=generated
    echo "::warning::No ANDROID_KEYSTORE_BASE64 secret — generated a new upload keystore. Download the 'android-upload-keystore' artifact of this run and store it as the ANDROID_KEYSTORE_BASE64 / ANDROID_KEYSTORE_PASSWORD secrets (see android/README.md)."
  fi
fi

chmod 600 "$KS" "$PW"
pass="$(cat "$PW")"
echo "::add-mask::$pass"
fp="$(keytool -list -v -keystore "$KS" -alias upload -storepass "$pass" | grep -E 'SHA256:' | sed 's/^[[:space:]]*SHA256: //')"
[[ -n "$fp" ]] || { echo "::error::could not read the keystore fingerprint (alias 'upload')"; exit 1; }
echo "keystore source: $source"
echo "upload key SHA-256: $fp"
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  { echo "source=$source"; echo "fingerprint=$fp"; } >> "$GITHUB_OUTPUT"
fi
