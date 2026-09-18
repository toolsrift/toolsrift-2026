// Digital Asset Links for a standalone network site's Android app (TWA).
// Served at /.well-known/assetlinks.json via the middleware rewrite.
//
// The SHA-256 fingerprints of the app's signing keys are the union of:
//   • android/fingerprints.json  — "all": the shared upload key every app is
//     built with (scripts/android/build.sh, .github/workflows/android-build.yml);
//     "<site id>": extra keys for one app (e.g. its Play App Signing key);
//   • ANDROID_SHA256_FINGERPRINTS — comma-separated env var on that site's
//     Vercel project (no commit needed);
//   • android.fingerprints in lib/sites/brands.js.
// Include BOTH the upload key and the Play App Signing key. See android/README.md.
import { SITE } from '../../../lib/sites'
import FINGERPRINTS from '../../../android/fingerprints.json'

const norm = s => String(s || '').trim().toUpperCase()

export function buildAssetLinks() {
  const b = SITE.brand
  const fromEnv = (process.env.ANDROID_SHA256_FINGERPRINTS || '').split(',')
  const fromFile = [...(FINGERPRINTS.all || []), ...(FINGERPRINTS[b.id] || [])]
  const fromBrand = b.android.fingerprints || []
  const fingerprints = [...new Set([...fromEnv, ...fromFile, ...fromBrand].map(norm).filter(Boolean))]
  return [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: b.android.packageId,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ]
}

export default function handler(req, res) {
  if (!SITE.isStandalone) return res.status(404).end()
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.status(200).send(JSON.stringify(buildAssetLinks(), null, 2))
}
