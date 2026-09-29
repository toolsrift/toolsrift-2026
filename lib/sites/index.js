// ── ToolsRift — one site, 29 branded category sections ───────────────────────
// Everything is served from toolsrift.com. Each category is a SECTION of the
// site at /<slug> (tools at /<slug>/<tool-id>) with its own brand from
// lib/sites/brands.js: logo lockup, palette, typography, texture, manifest and
// (for a few categories) an Android app. One domain means every link, every
// ranking signal and every Search Console report accrues to one site.
//
// History: from 2026-09-18 each category was briefly its own subdomain
// (pdf.toolsrift.com, …), built as a separate Vercel project with
// NEXT_PUBLIC_SITE_ID=<id>. Those hosts now only 301 to the matching page here
// (middleware.js). A build that still carries NEXT_PUBLIC_SITE_ID — one of the
// old per-category Vercel projects — is a pure redirector: LEGACY_BRAND below.
//
// Import from here anywhere — server, client, middleware, API routes, scripts.

const { BRANDS, ANDROID_APPS, HUB_APP, findBrand, findBrandByLegacyHost, androidBrands } = require('./brands');

const HUB_DOMAIN = 'toolsrift.com';
const HUB_BASE = `https://${HUB_DOMAIN}`;

const SITE = {
  kind: 'hub',
  domain: HUB_DOMAIN,
  baseUrl: HUB_BASE,
  siteName: 'ToolsRift',
  tagline: 'Free online tools, no signup',
  logo: '/logo.svg',
  icon: '/icon.svg',
  icon192: '/icon-192.png',
  icon512: '/icon-512.png',
  ogImage: '/og-image.png',
  themeColor: '#3B82F6',
  bgColor: '#06090F',
};

// Old per-category Vercel projects are still built from this repo until they
// are deleted (docs/NETWORK-SITES.md). On such a build every request 301s to
// the hub, whatever host it arrives on.
const RAW_ID = (process.env.NEXT_PUBLIC_SITE_ID || '').trim();
const LEGACY_BRAND = RAW_ID && RAW_ID !== 'hub' ? findBrand(RAW_ID) : null;

/** Everything a category section needs to brand its pages. */
function section(idOrSlug) {
  const b = findBrand(idOrSlug);
  if (!b) return null;
  return {
    brand: b,
    id: b.id,
    slug: b.slug,
    path: b.path,
    baseUrl: `${HUB_BASE}${b.path}`,
    siteName: b.siteName,
    logo: `/brands/${b.id}/logo.svg`,
    icon: `/brands/${b.id}/icon.svg`,
    icon192: `/brands/${b.id}/icon-192.png`,
    ogImage: `${HUB_BASE}/brands/${b.id}/og.png`,
    manifest: `${b.path}/manifest.webmanifest`,
  };
}

/** Home URL of a category: "/pdf". */
function categoryHome(idOrSlug) {
  const b = findBrand(idOrSlug);
  return b ? b.path : '/';
}

/** Join a base route and a tool id without producing "//" or "/pdf//x". */
function joinRoute(base, toolId) {
  if (!toolId) return base;
  if (!base || base === '/') return `/${toolId}`;
  return base.endsWith('/') ? `${base}${toolId}` : `${base}/${toolId}`;
}

/** URL of a tool page: "/pdf/merge-pdf". */
function toolPath(idOrSlug, toolId) {
  return joinRoute(categoryHome(idOrSlug), toolId);
}

/** Absolute URL on toolsrift.com. */
function absoluteUrl(path = '/') {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p === '/' ? HUB_BASE : `${HUB_BASE}${p}`;
}

/** Pages that live at the site root (legal etc.). A former subdomain's copy 301s to these. */
const ROOT_PAGES = [
  '/about', '/contact', '/privacy-policy', '/terms', '/cookies', '/disclaimer',
  '/tools', '/pricing', '/roadmap', '/checker',
];

/**
 * Where a URL on a former category subdomain lives now.
 *   pdf.toolsrift.com/                → /pdf
 *   pdf.toolsrift.com/merge-pdf       → /pdf/merge-pdf
 *   pdf.toolsrift.com/pdf/merge-pdf   → /pdf/merge-pdf   (old in-site redirect target)
 *   pdf.toolsrift.com/images/x        → /images/x        (sibling category)
 *   pdf.toolsrift.com/privacy-policy  → /privacy-policy
 *   pdf.toolsrift.com/manifest.json   → /pdf/manifest.webmanifest
 *   pdf.toolsrift.com/robots.txt, /sitemap.xml, /brands/…, any file → same path
 */
function legacyPath(brand, pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (p === '/') return brand.path;
  if (['/manifest.json', '/manifest.webmanifest', '/site.webmanifest'].includes(p)) {
    return `${brand.path}/manifest.webmanifest`;
  }
  if (ROOT_PAGES.includes(p)) return p;
  const first = p.split('/')[1];
  if (findBrand(first) && findBrand(first).slug === first) return p;
  if (/\.[a-z0-9]+$/i.test(p)) return p;
  return `${brand.path}${p}`;
}

module.exports = {
  SITE,
  BRANDS,
  HUB_APP,
  ANDROID_APPS,
  HUB_DOMAIN,
  HUB_BASE,
  LEGACY_BRAND,
  ROOT_PAGES,
  findBrand,
  findBrandByLegacyHost,
  androidBrands,
  section,
  categoryHome,
  toolPath,
  joinRoute,
  absoluteUrl,
  legacyPath,
};
