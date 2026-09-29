/** @type {import('next').NextConfig} */

// ── Legacy per-category Vercel projects ──────────────────────────────────────
// Every category is served by the hub at toolsrift.com/<slug>. From 2026-09-18
// each one was briefly its own subdomain, deployed as a separate Vercel
// project "toolsrift-<id>" built from this repo. Until those projects are
// deleted (docs/NETWORK-SITES.md), their builds must do nothing but 301 to the
// hub, so they still resolve a site id:
// Explicit:  NEXT_PUBLIC_SITE_ID=pdf  (set per project by the old bootstrap).
// Implicit:  on Vercel, derived from the project's production URL
//            ("toolsrift-pdf.vercel.app", "toolsrift-pdf-xxxx.vercel.app" or
//            the old subdomain "pdf.toolsrift.com").
// Anything else — toolsrift.com, toolsrift.vercel.app, local builds — is the
// hub. The value is inlined as NEXT_PUBLIC_SITE_ID; lib/sites/index.js turns it
// into LEGACY_BRAND and middleware.js redirects every request on such a build.
const { BRANDS } = require('./lib/sites/brands')

function deriveSiteId() {
  const explicit = (process.env.NEXT_PUBLIC_SITE_ID || '').trim()
  if (explicit) return explicit
  const hosts = [process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL]
    .filter(Boolean).map(h => String(h).toLowerCase().replace(/^https?:\/\//, ''))
  for (const host of hosts) {
    for (const b of BRANDS) {
      if (host === b.legacyDomain || host === `www.${b.legacyDomain}`) return b.id
      if (host.startsWith(`toolsrift-${b.id}.`) || host.startsWith(`toolsrift-${b.id}-`)) return b.id
    }
  }
  return 'hub'
}

const SITE_ID = deriveSiteId()
if (SITE_ID !== 'hub') console.log(`▲ ToolsRift legacy project "${SITE_ID}": every request 301s to toolsrift.com`)

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SITE_ID: SITE_ID,
  },
}

module.exports = nextConfig
