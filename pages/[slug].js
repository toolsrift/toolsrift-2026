import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import TOOL_REGISTRY from '../lib/toolRegistry'
import TOOL_SEO from '../lib/toolSeo'
import { publishToolHint } from '../lib/appRoute'
import { SITE, HUB_BASE } from '../lib/sites'
import CATEGORY_COMPONENTS from '../lib/sites/categoryComponents'
import SiteFooter from '../components/SiteFooter'

/* ============================================================
   STANDALONE NETWORK SITE — TOOL PAGE  /<tool-id>   (file: pages/[slug].js)
   ============================================================
   On toolsriftpdf.com every PDF tool lives at the root:
     https://toolsriftpdf.com/merge-pdf
   This is the standalone counterpart of pages/[slug]/[tool].js — same
   route-hint mechanism, same server-rendered article — but branded for the
   site, canonical to the site's own domain, and with a two-level breadcrumb
   (the category IS the site).

   On the hub (NEXT_PUBLIC_SITE_ID unset) this page builds ZERO paths, so it
   can never shadow anything on toolsrift.com.

   Why "[slug]" and not "[tool]": Next.js requires the first dynamic segment
   to share ONE name across pages/[slug].js and pages/[slug]/[tool].js. Here
   the slug IS the tool id; on the hub route it is the category slug.
   ============================================================ */

export async function getStaticPaths() {
  if (!SITE.isStandalone) return { paths: [], fallback: false }
  const cat = TOOL_REGISTRY[SITE.slug]
  return {
    paths: (cat ? cat.tools : []).map(t => ({ params: { slug: t.id } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const cat = TOOL_REGISTRY[SITE.slug]
  const tool = cat.tools.find(t => t.id === params.slug)
  const idx = cat.tools.indexOf(tool)
  const related = []
  for (let i = 1; related.length < 12 && i < cat.tools.length; i++) {
    related.push(cat.tools[(idx + i) % cat.tools.length])
  }
  const seo = (TOOL_SEO[SITE.slug] && TOOL_SEO[SITE.slug][params.slug]) || null
  return { props: { tool, related, seo, categoryName: cat.name } }
}

export default function StandaloneToolPage({ tool, related, seo, categoryName }) {
  const Widget = CATEGORY_COMPONENTS[SITE.slug]
  const b = SITE.brand
  const P = b.palette
  const url = `${SITE.baseUrl}/${tool.id}`

  // Per-tool title from the component's TOOL_META (lifted into lib/toolSeo.js
  // at build time), re-branded for this site; generic template otherwise.
  const rawTitle = (seo && seo.title) || `${tool.name} — Free Online Tool`
  const title = `${rawTitle.replace(/\s*[|—-]\s*ToolsRift\s*$/i, '')} | ${SITE.siteName}`
  const description = (seo && seo.desc)
    || (tool.desc
      ? `${tool.desc}. Free, instant, no signup required. Works in your browser — your data never leaves your device.`
      : `Use ${tool.name} free online. Instant results, no signup required. Works entirely in your browser.`)

  // Route hint — see lib/appRoute.js. Published during render, before the
  // ssr:false widget can mount, so the widget always opens on this tool.
  if (typeof window !== 'undefined') publishToolHint(`/${tool.id}`, tool.id)
  useEffect(() => { publishToolHint(`/${tool.id}`, tool.id) }, [tool.id])

  const faqs = (seo && seo.faq && seo.faq.length) ? seo.faq : [
    [`Is ${tool.name} free to use?`,
     `Yes. ${tool.name} on ${SITE.siteName} is completely free with no signup, no installation and no usage limits.`],
    [`Is my data safe when using ${tool.name}?`,
     `Yes. ${tool.name} runs entirely in your browser using JavaScript. Your data is processed on your own device and is never uploaded to any server.`],
    [`Does ${tool.name} work on mobile?`,
     `Yes. ${tool.name} works on any modern device — Android, iPhone, tablet or desktop — directly in your browser, and in the ${SITE.siteName} Android app.`],
  ]

  const head = b.fonts.head
  const body = b.fonts.body

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {seo && seo.keywords && <meta name="keywords" content={seo.keywords} />}
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={SITE.siteName} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: SITE.siteName, item: `${SITE.baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: tool.name, item: url },
          ],
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: tool.name,
          description,
          url,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          publisher: { '@type': 'Organization', name: SITE.siteName, url: SITE.baseUrl },
          isPartOf: { '@type': 'WebSite', name: SITE.siteName, url: SITE.baseUrl },
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(([q, a]) => ({
            '@type': 'Question', name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }) }} />
      </Head>

      {/* The category app, opened on this tool (breadcrumb, H1, interactive tool). */}
      <Widget />

      {/* Server-rendered article: how-to, FAQ, related tools. Always visible —
          ToolPageLayout skips its own copies on this route. */}
      <div style={{
        background: P.bg, color: '#F1F5F9', borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: body, padding: '8px 24px 40px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 12px' }}>
            How to use {tool.name}
          </h2>
          {seo && seo.howTo ? (
            <p style={{ fontSize: 15, lineHeight: 1.85, color: '#94A3B8', margin: 0 }}>{seo.howTo}</p>
          ) : (
            <ol style={{ fontSize: 15, lineHeight: 1.9, color: '#94A3B8', margin: 0, paddingLeft: 22 }}>
              <li>Open the {tool.name} above — it loads instantly, no account needed.</li>
              <li>Enter or upload your input. Everything is processed locally on your device.</li>
              <li>Get your result immediately and copy or download it with one click.</li>
            </ol>
          )}

          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 12px' }}>
            Frequently asked questions
          </h2>
          {faqs.map(([q, a], i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', margin: '0 0 6px' }}>{q}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', margin: 0 }}>{a}</p>
            </div>
          ))}

          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 14px' }}>
            More {categoryName}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {related.map(r => (
              <Link key={r.id} href={`/${r.id}`} style={{
                display: 'block', padding: '12px 16px', background: P.surface,
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: b.shape.radius, textDecoration: 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>{r.desc}</div>
              </Link>
            ))}
          </div>

          <p style={{ marginTop: 28, fontSize: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: P.primary, textDecoration: 'none' }}>
              ← All {categoryName}
            </Link>
            <a href={`${HUB_BASE}/tools`} style={{ color: P.primary, textDecoration: 'none' }}>
              Every ToolsRift tool →
            </a>
          </p>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
