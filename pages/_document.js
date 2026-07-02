import { Html, Head, Main, NextScript } from 'next/document'
import Document from 'next/document'

export default function MyDocument({ manifest }) {
  return (
    <Html lang="en">
      <Head>
        {/* PWA Manifest — switches based on subdomain */}
        <link rel="manifest" href={manifest} />

        {/* ============================================
            Google AdSense — site ownership verification
            ============================================ */}
        <meta name="google-adsense-account" content="ca-pub-4864313539537760" />

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
        <meta name="theme-color" content="#06090F" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#06090F" />
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="application-name" content="ToolsRift" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ToolsRift" />

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
        <meta property="og:image" content="https://toolsrift.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="ToolsRift — 1,600+ Free Online Tools" />

        {/* ============================================
            Twitter Card Defaults
            ============================================ */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@toolsrift" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.png" />
        <meta name="twitter:image:alt" content="ToolsRift — 1,600+ Free Online Tools" />

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
              description: '1600+ free online tools for everyone',
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
              url: 'https://toolsrift.com',
              logo: 'https://toolsrift.com/logo.svg',
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
