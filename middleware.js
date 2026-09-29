import { NextResponse } from 'next/server'
import { BRANDS, HUB_BASE, HUB_DOMAIN, LEGACY_BRAND, findBrandByLegacyHost, legacyPath } from './lib/sites'

// Section manifests: /pdf/manifest.webmanifest → the pdf brand's manifest
// (scope /pdf/ — what the PDF Android app wraps). See pages/api/site/manifest.js.
const MANIFEST_BY_PATH = Object.fromEntries(BRANDS.map(b => [`${b.path}/manifest.webmanifest`, b.slug]))
const ASSETLINKS = '/.well-known/assetlinks.json'

function redirect(pathname, search) {
  return NextResponse.redirect(`${HUB_BASE}${pathname}${search || ''}`, 301)
}

export function middleware(request) {
  const host = (request.headers.get('host') || '').toLowerCase().split(':')[0]
  const url = request.nextUrl.clone()
  const { pathname, search } = url

  // ── Digital Asset Links ───────────────────────────────────────────────────
  // Served on EVERY host, never redirected: Android verifies a TWA by fetching
  // this file from the exact origin the app was built for, and the verifier
  // does not follow redirects. Old app builds point at pdf.toolsrift.com etc.
  if (pathname === ASSETLINKS) {
    url.pathname = '/api/site/assetlinks'
    return NextResponse.rewrite(url)
  }

  // ── Former category subdomains → the same page under toolsrift.com/<slug> ─
  // pdf.toolsrift.com/merge-pdf → toolsrift.com/pdf/merge-pdf, and so on
  // (lib/sites/index.js → legacyPath). Works whichever Vercel project the
  // subdomain is attached to: the hub (host match) or one of the old
  // per-category projects still built from this repo (LEGACY_BRAND — those
  // builds redirect every request, including their *.vercel.app URLs).
  const legacy = findBrandByLegacyHost(host) || LEGACY_BRAND
  if (legacy) {
    return redirect(legacyPath(legacy, pathname), search)
  }

  // www and any other stray subdomain (old dev./calc. mirrors, the DNS
  // wildcard) are duplicates of the apex: one 301, same path.
  if (host !== HUB_DOMAIN && host.endsWith(`.${HUB_DOMAIN}`)) {
    return redirect(pathname, search)
  }

  // ── toolsrift.com ─────────────────────────────────────────────────────────
  const manifestSlug = MANIFEST_BY_PATH[pathname]
  if (manifestSlug) {
    url.pathname = '/api/site/manifest'
    url.searchParams.set('site', manifestSlug)
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // Everything except Next internals and API routes. Static files are matched
  // too, so a former subdomain's /robots.txt, /sitemap.xml, /manifest.json and
  // /brands/… requests are redirected like any other URL.
  matcher: ['/((?!_next|api/).*)'],
}
