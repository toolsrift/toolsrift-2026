import { Html, Head, Main, NextScript } from 'next/document'
import Document from 'next/document'

// The manifest, theme-color, apple-mobile-web-app-title and OG/Twitter image
// tags live in pages/_app.js (with `key`s) rather than here, so a category
// section (components/site/SectionHead.jsx) can replace them with its own.
const ADSENSE_CLIENT = 'ca-pub-4864313539537760'

export default function MyDocument() {
  return (
    <Html lang="en">
      <Head>
        {/* ============================================
            Google AdSense — verification + Auto ads
            Placement is left to Auto ads (switched on per site in the
            AdSense dashboard), so there are no hardcoded ad units here.
            ============================================ */}
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />

        {/* ============================================
            FAVICONS — Full set for all browsers
            Google Search requires PNG or ICO (not SVG)
            ============================================ */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* ============================================
            PWA / Theme
            ============================================ */}
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="application-name" content="ToolsRift" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* ============================================
            Global SEO Defaults
            (per-page <Head> tags in pages/*.js override these)
            ============================================ */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="ToolsRift" />
        <meta name="publisher" content="ToolsRift" />
        <meta name="copyright" content="ToolsRift" />
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
        <meta property="og:site_name" content="ToolsRift" />
        <meta property="og:image:type" content="image/png" />

        {/* ============================================
            Twitter Card Defaults
            ============================================ */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@toolsrift" />

        {/* ============================================
            Global Schema — WebSite with SearchAction
            ============================================ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ToolsRift',
              url: 'https://toolsrift.com',
              description: '1,136+ free online tools for everyone',
              inLanguage: 'en-US',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://toolsrift.com/?q={search_term_string}',
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
              name: 'ToolsRift',
              // Google currently autocorrects a "toolsrift" search to "toolswift"
              // and serves toolswift.ca — it does not yet recognise the brand as a
              // distinct entity. alternateName spells out the real variants so the
              // knowledge graph has something to bind the name to; the only other
              // lever is genuine off-site mentions (see docs/SEO-ACTION-PLAN).
              alternateName: ['ToolsRift.com', 'Tools Rift', 'toolsrift'],
              url: 'https://toolsrift.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://toolsrift.com/logo.svg',
              },
              description: 'ToolsRift is a free online tools platform. Every tool runs entirely in the browser — no sign-up, no uploads, no limits.',
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
        {/* A category section adds its own brand fonts (components/site/SectionHead.jsx). */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
