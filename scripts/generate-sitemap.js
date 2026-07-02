/**
 * generate-sitemap.js
 * Regenerates public/sitemap.xml from lib/toolRegistry.js.
 * Run whenever tools are added: node scripts/generate-sitemap.js
 */
const fs = require('fs')
const path = require('path')

// Load registry (it's an ES module — read + eval the JSON portion)
const src = fs.readFileSync(path.join(__dirname, '../lib/toolRegistry.js'), 'utf8')
const jsonStr = src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1)
const REGISTRY = JSON.parse(jsonStr)

const BASE = 'https://toolsrift.com'
const today = new Date().toISOString().slice(0, 10)

const staticPages = [
  ['/', 'daily', '1.0'],
  ['/tools', 'weekly', '0.9'],
  ['/about', 'monthly', '0.8'],
  ['/contact', 'monthly', '0.7'],
  ['/privacy-policy', 'monthly', '0.6'],
  ['/terms', 'monthly', '0.6'],
  ['/disclaimer', 'monthly', '0.6'],
  ['/cookies', 'monthly', '0.6'],
  ['/pricing', 'monthly', '0.5'],
  ['/roadmap', 'monthly', '0.5'],
]

let urls = staticPages.map(([p, cf, pr]) =>
  `  <url><loc>${BASE}${p}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`
)

for (const [slug, data] of Object.entries(REGISTRY)) {
  // Category page
  urls.push(`  <url><loc>${BASE}/${slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`)
  // Every tool page
  for (const t of data.tools) {
    urls.push(`  <url><loc>${BASE}/${slug}/${t.id}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml)
console.log(`sitemap.xml written: ${urls.length} URLs`)
