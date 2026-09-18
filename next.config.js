/** @type {import('next').NextConfig} */

// ── ToolsRift network: which site is this build? ─────────────────────────────
// Explicit:  NEXT_PUBLIC_SITE_ID=pdf  (set per Vercel project, or via
//            `npm run build:site -- pdf`).
// Implicit:  on Vercel, derived from the project's production URL. Projects are
//            named "toolsrift-<site id>" (scripts/vercel/bootstrap.sh and the
//            Vercel connector both follow this), so "toolsrift-pdf.vercel.app",
//            "toolsrift-pdf-xxxx.vercel.app" or a brand's own domain
//            ("toolsriftpdf.com") all resolve to the pdf site. Anything else —
//            including toolsrift.com / toolsrift.vercel.app — is the hub.
// The resolved value is inlined as NEXT_PUBLIC_SITE_ID into every bundle
// (client, server and edge middleware), so lib/sites/index.js only ever reads
// that one variable.
const { BRANDS } = require('./lib/sites/brands')

function deriveSiteId() {
  const explicit = (process.env.NEXT_PUBLIC_SITE_ID || '').trim()
  if (explicit) return explicit
  const hosts = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]
    .filter(Boolean).map(h => String(h).toLowerCase().replace(/^https?:\/\//, ''))
  for (const host of hosts) {
    for (const b of BRANDS) {
      if (host === b.domain || host === `www.${b.domain}`) return b.id
      if (host.startsWith(`toolsrift-${b.id}.`) || host.startsWith(`toolsrift-${b.id}-`)) return b.id
    }
  }
  return 'hub'
}

const SITE_ID = deriveSiteId()
if (SITE_ID !== 'hub') console.log(`▲ ToolsRift network build: site "${SITE_ID}"`)

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SITE_ID: SITE_ID,
  },
}

module.exports = nextConfig
