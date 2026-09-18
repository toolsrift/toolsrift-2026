import { Html, Head, Main, NextScript } from 'next/document'
import Document from 'next/document'
import { SITE, HUB_BASE } from '../lib/sites'

// ── Network-site identity (NEXT_PUBLIC_SITE_ID=pdf …) ───────────────────────
// A standalone site swaps in its own manifest, icons, theme colour, OG image,
// fonts and Organization schema. The hub keeps everything exactly as it was.
const B = SITE.brand
const OG_IMAGE = B ? `${SITE.baseUrl}${SITE.ogImage}` : 'https://toolsrift.com/og-image.png'
const OG_ALT = B ? `${SITE.siteName} — ${B.tagline}` : 'ToolsRift — 1,136+ Free Online Tools'

export default function MyDocument({ manifest }) {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest — switches based on subdomain */}
        <link rel="manifest" href={B ? '/manifest.json' : manifest} />

        {/* ============================================
            Google AdSense — site ownership verification
            ============================================ */}
        <meta name="google-adsense-account" content="ca-pub-4864313539537760" />

        {/* ============================================
            FAVICONS — Full set for all browsers
            Google Search requires PNG or ICO (not SVG)
            ============================================ */}
        {B ? (
          <>
            <link rel="icon" href={SITE.icon} type="image/svg+xml" />
            <link rel="icon" href={SITE.icon192} type="image/png" sizes="192x192" />
            <link rel="shortcut icon" href={SITE.icon192} type="image/png" />
            <link rel="apple-touch-icon" href={SITE.icon192} />
          </>
        ) : (
          <>
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="icon" href="/icon.svg" type="image/svg+xml" />
            <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/icon-192.png" />
          </>
        )}

        {/* ============================================
            PWA / Theme
            ============================================ */}
        <meta name="theme-color" content={SITE.bgColor} media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content={SITE.bgColor} />
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="application-name" content={SITE.siteName} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={B ? B.android.shortName : 'ToolsRift'} />
        {/* Site base colour for the brand (body background before any component paints) */}
        {B && <style dangerouslySetInnerHTML={{ __html: `html,body{background:${B.palette.bg}} ::selection{background:${B.palette.primary}55;color:#fff} input[type=range]{accent-color:${B.palette.primary}}` }} />}

        {/* ============================================
            Global SEO Defaults
            (per-page <Head> tags in pages/*.js override these)
            ============================================ */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content={SITE.siteName} />
        <meta name="publisher" content={SITE.siteName} />
        <meta name="copyright" content={SITE.siteName} />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />

        {/* ============================================
            OpenGraph Defaults
            (PNG image — SVG not supported by Facebook/WhatsApp)
            ============================================ */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={SITE.siteName} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content={B ? '1200' : '1500'} />
        <meta property="og:image:height" content={B ? '630' : '782'} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content={OG_ALT} />

        {/* ============================================
            Twitter Card Defaults
            ============================================ */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@toolsrift" />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:image:alt" content={OG_ALT} />

        {/* ============================================
            Global Schema — WebSite with SearchAction
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE.siteName,
              url: SITE.baseUrl,
              description: B ? `${B.tagline} Free ${B.siteName.replace('ToolsRift ', '').toLowerCase()} tools — part of the ToolsRift network.` : '1,136+ free online tools for everyone',
              inLanguage: 'en-US',
              ...(B ? { isPartOf: { '@type': 'WebSite', name: 'ToolsRift', url: HUB_BASE } } : null),
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE.baseUrl}/?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* ============================================
            Organization Schema
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE.siteName,
              // Google currently autocorrects a "toolsrift" search to "toolswift"
              // and serves toolswift.ca — it does not yet recognise the brand as a
              // distinct entity. alternateName spells out the real variants so the
              // knowledge graph has something to bind the name to; the only other
              // lever is genuine off-site mentions (see docs/SEO-ACTION-PLAN).
              alternateName: B ? [SITE.domain, `ToolsRift ${B.wordmark[1]} Tools`, 'ToolsRift'] : ['ToolsRift.com', 'Tools Rift', 'toolsrift'],
              url: SITE.baseUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${SITE.baseUrl}${SITE.logo}`,
              },
              ...(B ? { parentOrganization: { '@type': 'Organization', name: 'ToolsRift', url: HUB_BASE } } : null),
              description: B
                ? `${SITE.siteName} is a free ${B.wordmark[1].toLowerCase()} tools website from the ToolsRift network. Every tool runs entirely in the browser — no sign-up, no uploads, no limits.`
                : 'ToolsRift is a free online tools platform. Every tool runs entirely in the browser — no sign-up, no uploads, no limits.',
              foundingDate: '2026',
              email: 'contact@toolsrift.com',
              sameAs: [
                'https://twitter.com/toolsrift',
              ],
            }),
          }}
        />

        {/* ============================================
            Performance — Preconnect to font CDN
            ============================================ */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Brand typography for this network site (lib/sites/brands.js → fonts.google) */}
        {B && (
          <link
            href={`https://fonts.googleapis.com/css2?family=${B.fonts.google}&display=swap`}
            rel="stylesheet"
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

MyDocument.getInitialProps = async (ctx) => {
  const initialProps = await Document.getInitialProps(ctx)
  const host = ctx.req?.headers?.host || ''

  let manifest = '/manifest.json'
  if (host.startsWith('text.'))  manifest = '/manifest-text.json'
  if (host.startsWith('image.')) manifest = '/manifest-image.json'
  if (host.startsWith('pdf.'))   manifest = '/manifest-pdf.json'
  if (host.startsWith('dev.'))   manifest = '/manifest-dev.json'
  if (host.startsWith('calc.'))  manifest = '/manifest-calc.json'

  return { ...initialProps, manifest }
}
