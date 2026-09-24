// sitemap.xml for a standalone network site — generated from the tool registry
// at request time so it can never drift from what the site actually serves.
// Reached via the middleware rewrite of /sitemap.xml. The hub keeps its
// committed public/sitemap.xml (scripts/generate-sitemap.js).
import { SITE, STANDALONE_SHARED_PAGES } from '../../../lib/sites'
import TOOL_REGISTRY from '../../../lib/toolRegistry'
import CORE_TOOLS from '../../../lib/coreTools'
import { isCanonicalCat } from '../../../lib/canonicalCat'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function buildSitemapXml(today = new Date().toISOString().slice(0, 10)) {
  const cat = TOOL_REGISTRY[SITE.slug]
  const rows = []
  const add = (p, cf, pr) =>
    rows.push(`  <url><loc>${esc(SITE.baseUrl + (p || '/'))}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`)

  add('', 'daily', '1.0')
  // Same indexation allowlist as the hub (lib/coreTools.js): only core tools
  // are advertised; the rest are served with noindex (pages/[slug].js) so the
  // network never repeats the scaled-thin-content pattern that got the hub
  // deindexed in Aug 2026. Promote a tool by adding its id to coreTools.js.
  // ...and only from the tool's canonical category (lib/canonicalCat.js), so the
  // eleven ids that live in two categories are advertised by ONE site, not two.
  for (const t of (cat ? cat.tools : []))
    if (CORE_TOOLS.has(t.id) && isCanonicalCat(t.id, SITE.slug)) add(`/${t.id}`, 'monthly', '0.8')
  for (const p of STANDALONE_SHARED_PAGES) if (p !== '/404') add(p, 'monthly', '0.4')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`
}

export default function handler(req, res) {
  if (!SITE.isStandalone) return res.status(404).end()
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  // Short CDN TTL on purpose. This sitemap is regenerated from the registry on
  // every request, so it changes with every deploy that adds or drops a tool —
  // a 24h s-maxage pinned a stale copy at the edge for a full day afterwards.
  // It also meant a single bad response (a cold function during a rolling
  // redeploy, say) stayed cached at whichever PoP served it for 24h, which is
  // the leading explanation for pdf/json/colors/content reading fine from a
  // browser while Search Console kept reporting "Sitemap could not be read".
  // stale-while-revalidate keeps the route cheap without pinning failures.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(buildSitemapXml())
}
