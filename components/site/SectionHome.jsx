// ── SectionHome — the home page of a category section (toolsrift.com/pdf, …) ──
// The category app (branded header, concept banner, tool dashboard) on top,
// the category's server-rendered article + footer underneath, all dressed in
// the section's brand (SectionHead). Each pages/<slug>.js passes its own
// hand-written title and description.

import Head from 'next/head'
import CategoryContent from '../CategoryContent'
import SectionHead from './SectionHead'
import categoryContent from '../../lib/categoryContent'
import TOOL_REGISTRY from '../../lib/toolRegistry'
import CATEGORY_COMPONENTS from '../../lib/sites/categoryComponents'
import { section, HUB_BASE } from '../../lib/sites'

export default function SectionHome({ slug, title, description, ogDescription }) {
  const s = section(slug)
  const b = s.brand
  const Widget = CATEGORY_COMPONENTS[slug]
  const cat = TOOL_REGISTRY[slug]
  const url = s.baseUrl

  return (
    <>
      <SectionHead slug={slug} />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={b.seo.keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={ogDescription || description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={url} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          url,
          description,
          isPartOf: { '@type': 'WebSite', name: 'ToolsRift', url: HUB_BASE },
          hasPart: (cat ? cat.tools : []).slice(0, 50).map(t => ({
            '@type': 'SoftwareApplication',
            name: t.name,
            url: `${url}/${t.id}`,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          })),
        }) }} />
      </Head>
      <Widget />
      <CategoryContent data={categoryContent[slug]} />
    </>
  )
}
