// sitemap.xml for a standalone network site — generated from the tool registry
// at request time so it can never drift from what the site actually serves.
// Reached via the middleware rewrite of /sitemap.xml. The hub keeps its
// committed public/sitemap.xml (scripts/generate-sitemap.js).
import { SITE, STANDALONE_SHARED_PAGES } from '../../../lib/sites'
import TOOL_REGISTRY from '../../../lib/toolRegistry'

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function buildSitemapXml(today = new Date().toISOString().slice(0, 10)) {
  const cat = TOOL_REGISTRY[SITE.slug]
  const rows = []
  const add = (p, cf, pr) =>
    rows.push(`  <url><loc>${esc(SITE.baseUrl + (p || '/'))}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`)

  add('', 'daily', '1.0')
  for (const t of (cat ? cat.tools : [])) add(`/${t.id}`, 'monthly', '0.8')
  for (const p of STANDALONE_SHARED_PAGES) if (p !== '/404') add(p, 'monthly', '0.4')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`
}

export default function handler(req, res) {
  if (!SITE.isStandalone) return res.status(404).end()
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.status(200).send(buildSitemapXml())
}
