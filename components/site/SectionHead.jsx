// ── SectionHead — turns a page into a branded category section ───────────────
// Rendered by every page under toolsrift.com/<slug> (the section home and each
// tool page). Everything here goes into the server-rendered <head>, so the
// section's palette, radius scale and fonts are in place before first paint:
//   • the --tr-* CSS variables the shared layouts read (lib/designTokens.js)
//   • the brand's Google Fonts pairing
//   • the section's own web manifest (scope /<slug>/ — what its Android app wraps)
//   • the section's OG image
// The `key`s replace the site-wide defaults set in pages/_app.js.

import Head from 'next/head'
import { sectionCss } from '../../lib/designTokens'
import { section } from '../../lib/sites'

export default function SectionHead({ slug }) {
  const s = section(slug)
  if (!s) return null
  const b = s.brand
  return (
    <Head>
      <style key="tr-section-css" dangerouslySetInnerHTML={{ __html: sectionCss(b) }} />
      <link key="tr-section-fonts" rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${b.fonts.google}&display=swap`} />
      <link key="manifest" rel="manifest" href={s.manifest} />
      <meta key="theme-color" name="theme-color" content={b.palette.bg} />
      <meta key="apple-mobile-web-app-title" name="apple-mobile-web-app-title" content={b.android.shortName} />
      <meta key="og:image" property="og:image" content={s.ogImage} />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta key="og:image:alt" property="og:image:alt" content={`${b.siteName} — ${b.tagline}`} />
      <meta key="twitter:image" name="twitter:image" content={s.ogImage} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={`${b.siteName} — ${b.tagline}`} />
    </Head>
  )
}
