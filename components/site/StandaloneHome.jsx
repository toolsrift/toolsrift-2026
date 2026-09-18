// ── Home page of a standalone network site (pdf.toolsrift.com/, …) ────────────
// The category app (header, brand banner, dashboard) on top, the category's
// server-rendered article + footer underneath — the same shape as the hub's
// /pdf page, re-branded for the site and canonical to its own domain.

import Head from 'next/head'
import CategoryContent from '../CategoryContent'
import categoryContent from '../../lib/categoryContent'
import TOOL_REGISTRY from '../../lib/toolRegistry'
import CATEGORY_COMPONENTS from '../../lib/sites/categoryComponents'
import { SITE, HUB_BASE } from '../../lib/sites'

export default function StandaloneHome() {
  const b = SITE.brand
  const Widget = CATEGORY_COMPONENTS[SITE.slug]
  const cat = TOOL_REGISTRY[SITE.slug]
  const count = cat ? cat.tools.length : 0
  const top = cat ? cat.tools.slice(0, 4).map(t => t.name) : []

  const title = `${count} Free ${cat ? cat.name : b.wordmark[1] + ' Tools'} — ${top.slice(0, 3).join(', ')} & More | ${SITE.siteName}`
  const description = `${SITE.siteName}: ${count} free ${cat ? cat.name.toLowerCase() : 'tools'} — ${top.join(', ')} and more. ${b.tagline} 100% in your browser, no signup, no uploads.`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={b.seo.keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE.baseUrl}/`} />
        <meta property="og:site_name" content={SITE.siteName} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${SITE.baseUrl}/`} />
        {/* CollectionPage — this whole site is one curated tool collection */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          url: `${SITE.baseUrl}/`,
          description,
          isPartOf: { '@type': 'WebSite', name: 'ToolsRift', url: HUB_BASE },
          hasPart: (cat ? cat.tools : []).slice(0, 50).map(t => ({
            '@type': 'SoftwareApplication',
            name: t.name,
            url: `${SITE.baseUrl}/${t.id}`,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          })),
        }) }} />
      </Head>
      <Widget />
      <CategoryContent data={categoryContent[SITE.slug]} />
    </>
  )
}
