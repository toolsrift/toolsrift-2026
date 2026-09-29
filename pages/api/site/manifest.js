// Web App Manifest of a category section — /<slug>/manifest.webmanifest
// (middleware rewrite to /api/site/manifest?site=<slug>). Scoped to /<slug>/,
// so installing "ToolsRift PDF" from toolsrift.com/pdf gives an app that opens
// the PDF section; it is also what that category's Android app (TWA) wraps —
// see android/README.md. The site-wide manifest stays public/manifest.json.
import { findBrand } from '../../../lib/sites'
import TOOL_REGISTRY from '../../../lib/toolRegistry'

export function buildManifest(b) {
  const cat = TOOL_REGISTRY[b.slug]
  const tools = cat ? cat.tools : []
  const base = `${b.path}/`
  const icon192 = `/brands/${b.id}/icon-192.png`
  return {
    id: base,
    name: b.android.appName,
    short_name: b.android.shortName,
    description: b.android.shortDesc,
    lang: 'en',
    start_url: `${base}?source=pwa`,
    scope: base,
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'portrait',
    background_color: b.palette.bg,
    theme_color: b.palette.bg,
    categories: ['utilities', 'productivity'],
    // The category's Android app (Trusted Web Activity, android/README.md).
    // prefer_related_applications stays false until the app is published on
    // Play (brands.js android.published), so Chrome offers the PWA meanwhile.
    related_applications: [{
      platform: 'play',
      id: b.android.packageId,
      url: `https://play.google.com/store/apps/details?id=${b.android.packageId}`,
    }],
    prefer_related_applications: !!b.android.published,
    icons: [
      { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `/brands/${b.id}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `/brands/${b.id}/icon-maskable-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: `/brands/${b.id}/icon.svg`, sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    // First four tools as app shortcuts (long-press the launcher icon).
    shortcuts: tools.slice(0, 4).map(t => ({
      name: t.name,
      short_name: t.name.length > 12 ? t.name.slice(0, 11) + '…' : t.name,
      description: t.desc,
      url: `${base}${t.id}?source=shortcut`,
      icons: [{ src: icon192, sizes: '192x192', type: 'image/png' }],
    })),
  }
}

export default function handler(req, res) {
  const brand = req.query && typeof req.query.site === 'string' ? findBrand(req.query.site) : null
  if (!brand) return res.status(404).end()
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.status(200).send(JSON.stringify(buildManifest(brand), null, 2))
}
