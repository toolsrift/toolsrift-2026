import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import TOOL_REGISTRY from '../../lib/toolRegistry'
import TOOL_SEO from '../../lib/toolSeo'
import CORE_TOOLS from '../../lib/coreTools'
import CANONICAL_CAT from '../../lib/canonicalCat'
import { TOOL_CONTENT } from '../../lib/toolContent'
import { publishToolHint } from '../../lib/appRoute'
import { section, HUB_BASE } from '../../lib/sites'
import CATEGORY_COMPONENTS from '../../lib/sites/categoryComponents'
import SectionHead from '../../components/site/SectionHead'
import SiteFooter from '../../components/SiteFooter'

/* ============================================================
   TOOL PAGE — /[slug]/[tool]      e.g. /pdf/merge-pdf
   ============================================================
   Every tool has its own real URL inside its category section, WITHOUT
   changing any of the category component files. The page is dressed in the
   section's brand (SectionHead: palette, fonts, manifest, OG image) so
   toolsrift.com/pdf/merge-pdf looks and feels like part of "ToolsRift PDF".

   WHAT GOOGLE SEES (server-rendered, before any JS):
   - Unique <title>, meta description, canonical per tool
   - H2s + how-to + long-form content (lib/toolContent.js) + FAQ
   - SoftwareApplication / BreadcrumbList / FAQPage schema
   - Internal links to related tools (crawl paths)
   ============================================================ */

export async function getStaticPaths() {
  const paths = []
  for (const [category, data] of Object.entries(TOOL_REGISTRY)) {
    for (const t of data.tools) {
      paths.push({ params: { slug: category, tool: t.id } })
    }
  }
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const catData = TOOL_REGISTRY[params.slug]
  const tool = catData.tools.find(t => t.id === params.tool)
  const idx = catData.tools.indexOf(tool)
  // 12 related tools from the same category (wrap around the list). Each tool
  // page is a crawl hub for its neighbours, so a wider fan-out means every tool
  // in a category is reachable in fewer hops from any other.
  const related = []
  for (let i = 1; related.length < 12 && i < catData.tools.length; i++) {
    related.push(catData.tools[(idx + i) % catData.tools.length])
  }
  const seo = (TOOL_SEO[params.slug] && TOOL_SEO[params.slug][params.tool]) || null
  const canonicalCategory = CANONICAL_CAT[params.tool] || params.slug
  return {
    props: {
      category: params.slug,
      categoryName: catData.name,
      tool,
      related,
      seo,
      canonicalCategory,
    },
  }
}

export default function ToolPage({ category, categoryName, tool, related, seo, canonicalCategory }) {
  const Widget = CATEGORY_COMPONENTS[category]
  const s = section(category)
  const b = s.brand
  const P = b.palette
  const url = `${s.baseUrl}/${tool.id}`
  // Canonical points to the tool's primary category so duplicate cross-listings
  // (lib/canonicalCat.js) consolidate their ranking signal onto one URL.
  const canonicalUrl = `${HUB_BASE}/${canonicalCategory || category}/${tool.id}`
  // Aug 2026 site-wide deindexing (see lib/coreTools.js): 1,136 near-duplicate,
  // client-rendered tool pages read as scaled thin content. Only the curated
  // core is asked to be indexed; every other tool page stays fully working for
  // visitors but tells crawlers not to index it, and it's left out of the
  // sitemap. Promote a tool out of this state by adding its id to coreTools.js
  // once it has earned real search demand, not before.
  const isCoreTool = CORE_TOOLS.has(tool.id)
  // Unique per-tool title/description from the component's TOOL_META (lifted
  // into lib/toolSeo.js at build time); fall back to a generic template.
  const rawTitle = (seo && seo.title) || `${tool.name} — Free Online Tool | ToolsRift`
  const title = rawTitle.includes('ToolsRift') ? rawTitle : `${rawTitle} | ToolsRift`
  const description = (seo && seo.desc)
    || (tool.desc
      ? `${tool.desc}. Free, instant, no signup required. Works in your browser — your data never leaves your device.`
      : `Use ${tool.name} free online. Instant results, no signup required. Works entirely in your browser.`)

  // ROUTE HINT (replaces the old "hash bridge")
  //
  // The category widget's useAppRouter() used to read window.location.hash only,
  // so this page wrote `#/tool/<id>` and then re-asserted it on every animation
  // frame for 1200ms to survive Next.js's post-hydration URL reconciliation.
  // That was a race, and Googlebot — cold, throttled, on a render budget — lost
  // it often enough that tool URLs were indexed showing the CATEGORY DASHBOARD,
  // complete with the category's <title>. Dozens of identical pages per category.
  //
  // Now the widget resolves its route from the clean URL via resolveAppRoute(),
  // and this only publishes which tool that URL means. Published during render,
  // before the ssr:false widget chunk can possibly mount, so there is no window
  // in which the answer is unknown.
  if (typeof window !== 'undefined') {
    publishToolHint(`/${category}/${tool.id}`, tool.id)
  }
  useEffect(() => {
    publishToolHint(`/${category}/${tool.id}`, tool.id)
  }, [category, tool.id])

  // Long-form, hand-written content for this tool when it exists (lib/toolContent.js).
  const depth = TOOL_CONTENT[tool.id] || null

  // Prefer the tool's own unique FAQ (from TOOL_META); otherwise a generic set.
  // Using the real per-tool FAQ avoids identical FAQPage schema on every page.
  const baseFaqs = (seo && seo.faq && seo.faq.length) ? seo.faq : [
    [`Is ${tool.name} free to use?`,
     `Yes. ${tool.name} on ToolsRift is completely free with no signup, no installation and no usage limits.`],
    [`Is my data safe when using ${tool.name}?`,
     `Yes. ${tool.name} runs entirely in your browser using JavaScript. Your data is processed on your own device and is never uploaded to any server.`],
    [`Does ${tool.name} work on mobile?`,
     `Yes. ${tool.name} works on any modern device — Android, iPhone, tablet or desktop — directly in your browser with no app required.`],
  ]
  // The tool's own questions go after the generic ones, and feed the FAQ schema too.
  const faqs = depth && depth.faq ? [...baseFaqs, ...depth.faq] : baseFaqs

  const head = b.fonts.head
  const body = b.fonts.body

  return (
    <>
      <SectionHead slug={category} />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {seo && seo.keywords && <meta name="keywords" content={seo.keywords} />}
        {!isCoreTool && <meta name="robots" content="noindex, follow" />}
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* BreadcrumbList schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ToolsRift', item: `${HUB_BASE}/` },
            { '@type': 'ListItem', position: 2, name: categoryName, item: s.baseUrl },
            { '@type': 'ListItem', position: 3, name: tool.name, item: url },
          ],
        }) }} />
        {/* SoftwareApplication schema — tells Google this is a free web tool */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: tool.name,
          description,
          url: canonicalUrl,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          publisher: { '@type': 'Organization', name: 'ToolsRift', url: HUB_BASE },
          isPartOf: { '@type': 'WebSite', name: 'ToolsRift', url: HUB_BASE },
        }) }} />
        {/* FAQPage schema */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map(([q, a]) => ({
            '@type': 'Question', name: q,
            acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }) }} />
      </Head>

      {/* THE TOOL WIDGET — the category app, opened on this tool. It renders the
          breadcrumb, the H1 and the interactive tool; the how-to, FAQ and
          related-tool sections are deferred to the server-rendered article below
          (see isArticleOwnedByPage in lib/appRoute.js) so each appears once. */}
      <Widget />

      {/* ============================================================
          SERVER-RENDERED ARTICLE
          The Widget above is client-only (ssr:false), so its content is not in
          the HTML Google first receives. This block carries the how-to, the
          long-form content, the FAQ and the related-tool links server-side, in
          plain HTML, on every render. Always visible — Google discounts
          display:none content — and ToolPageLayout skips its own copies.
          ============================================================ */}
      <div style={{
        background: P.bg, color: '#F1F5F9', borderTop: '1px solid rgba(255,255,255,0.05)',
        fontFamily: body, padding: '8px 24px 40px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          {/* Long-form, hand-written content (lib/toolContent.js) when this tool
              has it: an intro, real explanation, steps and notes. Tools without
              an entry keep the short how-to below. */}
          {depth && depth.intro && (
            <p style={{ fontSize: 16, lineHeight: 1.85, color: '#CBD5E1', margin: '32px 0 0' }}>{depth.intro}</p>
          )}

          {/* How to use. The page's single <h1> is the widget's tool header —
              this article leads with an h2 so the heading outline stays valid. */}
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 12px' }}>
            How to use {tool.name}
          </h2>
          {depth && depth.steps ? (
            <ol style={{ fontSize: 15, lineHeight: 1.9, color: '#94A3B8', margin: 0, paddingLeft: 22 }}>
              {depth.steps.map((st, i) => <li key={i}>{st}</li>)}
            </ol>
          ) : seo && seo.howTo ? (
            <p style={{ fontSize: 15, lineHeight: 1.85, color: '#94A3B8', margin: 0 }}>{seo.howTo}</p>
          ) : (
            <ol style={{ fontSize: 15, lineHeight: 1.9, color: '#94A3B8', margin: 0, paddingLeft: 22 }}>
              <li>Open the {tool.name} above — it loads instantly, no account needed.</li>
              <li>Enter or upload your input. Everything is processed locally on your device.</li>
              <li>Get your result immediately and copy or download it with one click.</li>
            </ol>
          )}

          {depth && depth.notes && (
            <ul style={{ fontSize: 14.5, lineHeight: 1.8, color: '#94A3B8', margin: '14px 0 0', paddingLeft: 22 }}>
              {depth.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}

          {depth && (depth.sections || []).map((sec, i) => (
            <div key={i}>
              <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 12px' }}>{sec.h}</h2>
              <p style={{ fontSize: 15, lineHeight: 1.85, color: '#94A3B8', margin: 0 }}>{sec.p}</p>
            </div>
          ))}

          {/* FAQ (matches the FAQPage schema above) */}
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 12px' }}>
            Frequently asked questions
          </h2>
          {faqs.map(([q, a], i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', margin: '0 0 6px' }}>{q}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: '#94A3B8', margin: 0 }}>{a}</p>
            </div>
          ))}

          {/* Related tools — crawlable internal links */}
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: head, margin: '32px 0 14px' }}>
            More {categoryName}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {related.map(r => (
              <Link key={r.id} href={`/${category}/${r.id}`} style={{
                display: 'block', padding: '12px 16px', background: P.surface,
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: b.shape.radius, textDecoration: 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>{r.desc}</div>
              </Link>
            ))}
          </div>

          <p style={{ marginTop: 28, fontSize: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link href={`/${category}`} style={{ color: P.primary, textDecoration: 'none' }}>
              ← All {categoryName}
            </Link>
            <Link href="/tools" style={{ color: P.primary, textDecoration: 'none' }}>
              Browse all 1,100+ tools →
            </Link>
          </p>
        </div>
      </div>

      {/* Server-rendered footer. CategoryLayout skips its own copy on this route
          (see isArticleOwnedByPage), so there is exactly one — and it puts all 29
          category pages one hop from every tool page, in raw HTML. */}
      <SiteFooter accent={P.primary} fonts={b.fonts} brand={b} />
    </>
  )
}
