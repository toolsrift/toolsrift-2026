import { NextResponse } from 'next/server'
import { SITE, STANDALONE_SHARED_PAGES, HUB_BASE, BRANDS } from './lib/sites'

// Slugs of every category (hub routes) — used by standalone sites to bounce
// other categories' URLs back to the hub instead of serving duplicates.
const CATEGORY_SLUGS = new Set(BRANDS.map(b => b.slug))
const HUB_ONLY_PAGES = new Set(['/tools', '/pricing', '/roadmap', '/checker'])
const SHARED_PAGES = new Set(STANDALONE_SHARED_PAGES)

// Per-site files a standalone site generates at request time (see pages/api/site/*).
const SITE_FILE_REWRITES = {
  '/robots.txt': '/api/site/robots',
  '/sitemap.xml': '/api/site/sitemap',
  '/manifest.json': '/api/site/manifest',
  '/manifest.webmanifest': '/api/site/manifest',
  '/site.webmanifest': '/api/site/manifest',
  '/.well-known/assetlinks.json': '/api/site/assetlinks',
}

export function middleware(request) {
  const host = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  const { pathname } = url

  // www served a full 200 mirror of the site. The canonical tags pointed at the
  // apex so nothing was double-indexed, but Googlebot still spent 492 of ~2,900
  // crawl requests (17%) re-crawling the duplicate host — budget that belongs to
  // the tool pages still waiting in "Discovered – currently not indexed".
  if (host.startsWith('www.')) {
    url.host = host.slice(4)
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  // ── Standalone network site (NEXT_PUBLIC_SITE_ID=pdf …) ──────────────────
  // Inlined at build time, so each Vercel project ships only its own branch.
  if (SITE.isStandalone) {
    if (SITE_FILE_REWRITES[pathname]) {
      url.pathname = SITE_FILE_REWRITES[pathname]
      return NextResponse.rewrite(url)
    }

    // Static assets / Next internals / API: pass through.
    if (pathname.startsWith('/_next') || pathname.startsWith('/api/') || /\.[a-z0-9]+$/i.test(pathname)) {
      return NextResponse.next()
    }

    // /pdf and /pdf/<tool> → this site's own root URLs.
    const own = `/${SITE.slug}`
    if (pathname === own || pathname === `${own}/`) {
      url.pathname = '/'
      return NextResponse.redirect(url, 301)
    }
    if (pathname.startsWith(`${own}/`)) {
      url.pathname = pathname.slice(own.length)
      return NextResponse.redirect(url, 301)
    }

    // Another category (or a hub-only page) → the hub, never a duplicate here.
    const first = pathname.split('/')[1] || ''
    if ((first && CATEGORY_SLUGS.has(first)) || HUB_ONLY_PAGES.has(pathname)) {
      return NextResponse.redirect(`${HUB_BASE}${pathname}${url.search}`, 301)
    }

    // Everything else ("/", "/<tool>", shared legal pages) is served here.
    return NextResponse.next()
  }

  // ── Hub (toolsrift.com) ──────────────────────────────────────────────────
  // Legacy subdomain mirrors, kept until the standalone domains go live.
  if (host.startsWith('text.')) {
    url.pathname = '/text'
    return NextResponse.rewrite(url)
  }
  if (host.startsWith('image.')) {
    url.pathname = '/images'
    return NextResponse.rewrite(url)
  }
  if (host.startsWith('pdf.')) {
    url.pathname = '/pdf'
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // Everything except Next internals and API routes. Static files fall through
  // in code above (cheaper than a giant negative lookahead, and the standalone
  // branch needs to see robots.txt / sitemap.xml / manifest / .well-known).
  matcher: ['/((?!_next|api/).*)'],
}
