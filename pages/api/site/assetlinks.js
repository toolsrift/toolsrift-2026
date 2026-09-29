// Digital Asset Links — /.well-known/assetlinks.json (middleware rewrite).
// One file declares every ToolsRift Android app (Trusted Web Activity), since
// every app now opens toolsrift.com (the main app at /, category apps at
// /<slug>/). The same file is served, un-redirected, on the former category
// subdomains, so app builds made for pdf.toolsrift.com etc. still verify.
//
// The SHA-256 fingerprints for each app are the union of:
//   • android/fingerprints.json  — "all": the shared upload key every app is
//     built with (scripts/android/build.sh, .github/workflows/android-build.yml);
//     "<app id>": extra keys for one app (its Play App Signing keys);
//   • ANDROID_SHA256_FINGERPRINTS — comma-separated env var on the Vercel
//     project, applied to every app (no commit needed);
//   • android.fingerprints in lib/sites/brands.js.
// Every brand's package is declared, not only the ones in ANDROID_APPS: a
// declaration costs nothing, and dropping one would break that app's existing
// testers' installs. See android/README.md.
import { BRANDS, HUB_APP } from '../../../lib/sites'
import FINGERPRINTS from '../../../android/fingerprints.json'

const norm = s => String(s || '').trim().toUpperCase()

function statement(packageId, id, extra = []) {
  const fromEnv = (process.env.ANDROID_SHA256_FINGERPRINTS || '').split(',')
  const fromFile = [...(FINGERPRINTS.all || []), ...(FINGERPRINTS[id] || [])]
  const fingerprints = [...new Set([...fromEnv, ...fromFile, ...extra].map(norm).filter(Boolean))]
  if (!fingerprints.length) return null
  return {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: { namespace: 'android_app', package_name: packageId, sha256_cert_fingerprints: fingerprints },
  }
}

export function buildAssetLinks() {
  // The text brand's com.toolsrift.text.twa keeps its extra certificate under
  // "text" — declared by toolsrift.com since July 2026, see android/README.md,
  // "The text app: package id and certificate of unverified origin".
  const apps = [
    { packageId: HUB_APP.android.packageId, id: HUB_APP.id, extra: HUB_APP.android.fingerprints },
    ...BRANDS.map(b => ({ packageId: b.android.packageId, id: b.id, extra: b.android.fingerprints })),
  ]
  return apps.map(a => statement(a.packageId, a.id, a.extra || [])).filter(Boolean)
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.status(200).send(JSON.stringify(buildAssetLinks(), null, 2))
}
