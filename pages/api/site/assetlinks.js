// Digital Asset Links for a standalone network site's Android app (TWA).
// Served at /.well-known/assetlinks.json via the middleware rewrite.
//
// The SHA-256 fingerprint(s) of the app's signing key come from the
// ANDROID_SHA256_FINGERPRINTS env var of that site's Vercel project
// (comma-separated; include BOTH the upload key and Play App Signing key), or
// from `android.fingerprints` in lib/sites/brands.js. See android/README.md.
import { SITE } from '../../../lib/sites'

export function buildAssetLinks() {
  const b = SITE.brand
  const fromEnv = (process.env.ANDROID_SHA256_FINGERPRINTS || '')
    .split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
  const fingerprints = fromEnv.length ? fromEnv : (b.android.fingerprints || [])
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
