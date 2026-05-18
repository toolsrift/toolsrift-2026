import { Html, Head, Main, NextScript } from 'next/document'
import Document from 'next/document'

export default function MyDocument({ manifest }) {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href={manifest} />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#06090F" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#06090F" />
        <meta name="color-scheme" content="dark light" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Global SEO defaults (per-page Head tags override these) */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="ToolsRift" />
        <meta name="publisher" content="ToolsRift" />

        {/* OpenGraph defaults */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="ToolsRift — 1,600+ Free Online Tools" />

        {/* Twitter defaults */}
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <meta name="twitter:image:alt" content="ToolsRift — 1,600+ Free Online Tools" />
        <meta name="twitter:site" content="@toolsrift" />

        {/* Performance: preconnect to font CDN */}
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
