// Web App Manifest for a standalone network site (also what the Android TWA
// wraps — see android/README.md). Reached via the middleware rewrite of
// /manifest.json. The hub keeps its committed public/manifest*.json files, but
// serves any brand's manifest at /api/site/manifest?site=<id> so the Android
// build (scripts/android/build.sh) can fetch it before that site is live.
import { SITE, findBrand } from '../../../lib/sites'
import TOOL_REGISTRY from '../../../lib/toolRegistry'

export function buildManifest(brand = SITE.brand) {
  const b = brand
  const cat = TOOL_REGISTRY[b.slug]
  const tools = cat ? cat.tools : []
  const icon192 = `/brands/${b.id}/icon-192.png`
  return {
    id: '/',
    name: b.android.appName,
    short_name: b.android.shortName,
    description: b.android.shortDesc,
    lang: 'en',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    orientation: 'portrait',
    background_color: b.palette.bg,
    theme_color: b.palette.bg,
    categories: ['utilities', 'productivity'],
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
      url: `/${t.id}?source=shortcut`,
      icons: [{ src: icon192, sizes: '192x192', type: 'image/png' }],
    })),
  }
}

export default function handler(req, res) {
  let brand = SITE.isStandalone ? SITE.brand : null
  if (!brand && req.query && typeof req.query.site === 'string') brand = findBrand(req.query.site) || null
  if (!brand) return res.status(404).end()
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.status(200).send(JSON.stringify(buildManifest(brand), null, 2))
}
