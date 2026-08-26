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

// Load the indexation allowlist the same way (also an ES module, also not
// require()-able from plain node) — see lib/coreTools.js for why it exists:
// Google deindexed the site over scaled thin content, and the sitemap must
// only advertise the pruned core it still asked to be indexed.
const coreSrc = fs.readFileSync(path.join(__dirname, '../lib/coreTools.js'), 'utf8')
const coreStart = coreSrc.indexOf('CORE_TOOL_IDS = [') + 'CORE_TOOL_IDS = '.length
const coreEnd = coreSrc.indexOf('];', coreStart) + 1
const CORE_TOOLS = new Set(JSON.parse(coreSrc.slice(coreStart, coreEnd).replace(/\/\/[^\n]*/g, '')))

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

// A tool listed in two categories (e.g. voltage-converter in both `converters2`
// and `units`) gets a page at BOTH URLs, but pages/[category]/[tool].js
// canonicalises them to whichever category the registry lists first. Advertising
// the non-canonical twin in the sitemap asks Google to index a URL the page
// itself disavows — a self-inflicted duplicate signal on a site that can least
// afford one. Emit only the canonical URL.
const CANONICAL_CAT = {}
for (const [slug, data] of Object.entries(REGISTRY)) {
  for (const t of data.tools) {
    if (!(t.id in CANONICAL_CAT)) CANONICAL_CAT[t.id] = slug
  }
}

let skippedDupe = 0
let skippedNonCore = 0
for (const [slug, data] of Object.entries(REGISTRY)) {
  // Category page — real, hand-written content per lib/categoryContent.js,
  // not part of the thin-content pattern, so these stay indexed.
  urls.push(`  <url><loc>${BASE}/${slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`)
  // Tool pages: canonical URL only, and only for tools in the core allowlist.
  for (const t of data.tools) {
    if (CANONICAL_CAT[t.id] !== slug) { skippedDupe++; continue }
    if (!CORE_TOOLS.has(t.id)) { skippedNonCore++; continue }
    urls.push(`  <url><loc>${BASE}/${slug}/${t.id}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), xml)
console.log(`sitemap.xml written: ${urls.length} URLs (${skippedDupe} non-canonical duplicates skipped, ${skippedNonCore} non-core tool pages excluded)`)
