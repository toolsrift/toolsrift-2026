import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import TOOL_REGISTRY from '../../lib/toolRegistry'
import TOOL_SEO from '../../lib/toolSeo'
import { publishToolHint } from '../../lib/appRoute'
import SiteFooter from '../../components/SiteFooter'

// Map each tool id -> its canonical category (first category in registry order
// that contains the id). Cross-category duplicate tools (same id in two
// categories, kept intentionally) then share ONE canonical URL instead of
// competing as duplicate content.
const CANONICAL_CAT = (() => {
  const m = {}
  for (const [cat, data] of Object.entries(TOOL_REGISTRY)) {
    for (const t of data.tools) {
      if (!(t.id in m)) m[t.id] = cat
    }
  }
  return m
})()

/* ============================================================
   DYNAMIC TOOL PAGE — /[category]/[tool]
   ============================================================
   This single file gives every tool its own real URL, e.g.
     /text/word-counter-pro
     /json/json-formatter
   WITHOUT changing any of the 22 category component files.

   HOW IT WORKS (the "hash bridge"):
   Your category components use useAppRouter(), which reads
   window.location.hash (#/tool/<id>) to decide which tool to
   show. This page sets that hash via history.replaceState()
   BEFORE mounting the category component — so the component
   opens directly on the right tool, thinking a user navigated
   to it. Zero changes needed inside the components.

   WHAT GOOGLE SEES (server-rendered, before any JS):
   - Unique <title>, meta description, canonical per tool
   - Breadcrumbs + H1 + description + how-to + FAQ content
   - SoftwareApplication / BreadcrumbList / FAQPage schema
   - Internal links to related tools (crawl paths)
   ============================================================ */

// Map category slug -> its component (static imports so webpack can bundle)
const COMPONENTS = {
  business:    dynamic(() => import('../../components/toolsrift-business'),      { ssr: false, loading: WidgetLoading }),
  colors:      dynamic(() => import('../../components/toolsrift-colors'),        { ssr: false, loading: WidgetLoading }),
  converters2: dynamic(() => import('../../components/toolsrift-converters2'),   { ssr: false, loading: WidgetLoading }),
  css:         dynamic(() => import('../../components/toolsrift-css'),           { ssr: false, loading: WidgetLoading }),
  devgen:      dynamic(() => import('../../components/toolsrift-gen-devconfig'), { ssr: false, loading: WidgetLoading }),
  devtools:    dynamic(() => import('../../components/toolsrift-devtools'),      { ssr: false, loading: WidgetLoading }),
  encoders:    dynamic(() => import('../../components/toolsrift-encoders'),      { ssr: false, loading: WidgetLoading }),
  encoding:    dynamic(() => import('../../components/toolsrift-encoding'),      { ssr: false, loading: WidgetLoading }),
  everyday:    dynamic(() => import('../../components/toolsrift-everyday'),      { ssr: false, loading: WidgetLoading }),
  fancy:       dynamic(() => import('../../components/toolsrift-fancy'),         { ssr: false, loading: WidgetLoading }),
  financecalc: dynamic(() => import('../../components/toolsrift-calc-finance'),  { ssr: false, loading: WidgetLoading }),
  formatters:  dynamic(() => import('../../components/toolsrift-formatters'),    { ssr: false, loading: WidgetLoading }),
  generators:  dynamic(() => import('../../components/toolsrift-gen-security'),  { ssr: false, loading: WidgetLoading }),
  generators2: dynamic(() => import('../../components/toolsrift-gen-content'),   { ssr: false, loading: WidgetLoading }),
  hash:        dynamic(() => import('../../components/toolsrift-hash'),          { ssr: false, loading: WidgetLoading }),
  html:        dynamic(() => import('../../components/toolsrift-html'),          { ssr: false, loading: WidgetLoading }),
  images:      dynamic(() => import('../../components/toolsrift-images'),        { ssr: false, loading: WidgetLoading }),
  js:          dynamic(() => import('../../components/toolsrift-js'),            { ssr: false, loading: WidgetLoading }),
  json:        dynamic(() => import('../../components/toolsrift-json'),          { ssr: false, loading: WidgetLoading }),
  mathcalc:    dynamic(() => import('../../components/toolsrift-calc-math'),     { ssr: false, loading: WidgetLoading }),
  pdf:         dynamic(() => import('../../components/toolsrift-pdf'),           { ssr: false, loading: WidgetLoading }),
  random:      dynamic(() => import('../../components/toolsrift-random'),        { ssr: false, loading: WidgetLoading }),
  text:        dynamic(() => import('../../components/toolsrift-text'),          { ssr: false, loading: WidgetLoading }),
  units:       dynamic(() => import('../../components/toolsrift-units'),         { ssr: false, loading: WidgetLoading }),
  audio:       dynamic(() => import('../../components/toolsrift-audio'),         { ssr: false, loading: WidgetLoading }),
  office:      dynamic(() => import('../../components/toolsrift-office'),        { ssr: false, loading: WidgetLoading }),
  data:        dynamic(() => import('../../components/toolsrift-data'),          { ssr: false, loading: WidgetLoading }),
  study:       dynamic(() => import('../../components/toolsrift-study'),         { ssr: false, loading: WidgetLoading }),
  video:       dynamic(() => import('../../components/toolsrift-video'),         { ssr: false, loading: WidgetLoading }),
}

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6', indigo: '#6366F1',
}

// Branded loading state shown while a category widget chunk downloads/mounts,
// so there is never a blank flash between the SEO fallback and the live tool.
// (function declaration → hoisted, so the COMPONENTS map above can reference it)
function WidgetLoading() {
  return (
    <div style={{
      background: C.bg, minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <style>{`@keyframes trspin{to{transform:rotate(360deg)}}`}</style>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        border: `3px solid ${C.border}`, borderTopColor: C.blue,
        animation: 'trspin 0.7s linear infinite',
      }} />
      <div style={{ color: C.dim, fontSize: 13, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
        Loading…
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const paths = []
  for (const [category, data] of Object.entries(TOOL_REGISTRY)) {
    for (const t of data.tools) {
      paths.push({ params: { category, tool: t.id } })
    }
  }
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const catData = TOOL_REGISTRY[params.category]
  const tool = catData.tools.find(t => t.id === params.tool)
  const idx = catData.tools.indexOf(tool)
  // 12 related tools from the same category (wrap around the list). Each tool
  // page is a crawl hub for its neighbours, so a wider fan-out means every tool
  // in a category is reachable in fewer hops from any other.
  const related = []
  for (let i = 1; related.length < 12 && i < catData.tools.length; i++) {
    related.push(catData.tools[(idx + i) % catData.tools.length])
  }
  const seo = (TOOL_SEO[params.category] && TOOL_SEO[params.category][params.tool]) || null
  const canonicalCategory = CANONICAL_CAT[params.tool] || params.category
  return {
    props: {
      category: params.category,
      categoryName: catData.name,
      tool,
      related,
      seo,
      canonicalCategory,
    },
  }
}

export default function ToolPage({ category, categoryName, tool, related, seo, canonicalCategory }) {
  const Widget = COMPONENTS[category]
  const url = `https://toolsrift.com/${category}/${tool.id}`
  // Canonical points to the tool's primary category so duplicate cross-listings
  // consolidate their ranking signal onto one URL.
  const canonicalUrl = `https://toolsrift.com/${canonicalCategory || category}/${tool.id}`
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

  // Prefer the tool's own unique FAQ (from TOOL_META); otherwise a generic set.
  // Using the real per-tool FAQ avoids identical FAQPage schema on every page.
  const faqs = (seo && seo.faq && seo.faq.length) ? seo.faq : [
    [`Is ${tool.name} free to use?`,
     `Yes. ${tool.name} on ToolsRift is completely free with no signup, no installation and no usage limits.`],
    [`Is my data safe when using ${tool.name}?`,
     `Yes. ${tool.name} runs entirely in your browser using JavaScript. Your data is processed on your own device and is never uploaded to any server.`],
    [`Does ${tool.name} work on mobile?`,
     `Yes. ${tool.name} works on any modern device — Android, iPhone, tablet or desktop — directly in your browser with no app required.`],
  ]

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {seo && seo.keywords && <meta name="keywords" content={seo.keywords} />}
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
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolsrift.com/' },
            { '@type': 'ListItem', position: 2, name: categoryName, item: `https://toolsrift.com/${category}` },
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
          publisher: { '@type': 'Organization', name: 'ToolsRift', url: 'https://toolsrift.com' },
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
          the HTML Google first receives. This block carries the how-to, the FAQ
          and the related-tool links server-side, in plain HTML, on every render.

          It used to be display:none the instant the widget mounted. Google
          indexes the RENDERED DOM, so hiding it meant Google saw a page whose
          article and internal links had all vanished — and heavily discounts
          display:none content. It is now always visible; ToolPageLayout skips
          its own duplicate copies of these sections instead.
          ============================================================ */}
      <div style={{
        background: C.bg, color: C.text, borderTop: `1px solid ${C.borderLight}`,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '8px 24px 40px',
      }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>

          {/* How to use. The page's single <h1> is the widget's tool header —
              this article leads with an h2 so the heading outline stays valid. */}
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", margin: '32px 0 12px' }}>
            How to use {tool.name}
          </h2>
          {seo && seo.howTo ? (
            <p style={{ fontSize: 15, lineHeight: 1.85, color: C.muted, margin: 0 }}>{seo.howTo}</p>
          ) : (
            <ol style={{ fontSize: 15, lineHeight: 1.9, color: C.muted, margin: 0, paddingLeft: 22 }}>
              <li>Open the {tool.name} above — it loads instantly, no account needed.</li>
              <li>Enter or upload your input. Everything is processed locally on your device.</li>
              <li>Get your result immediately and copy or download it with one click.</li>
            </ol>
          )}

          {/* FAQ (matches the FAQPage schema above) */}
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", margin: '32px 0 12px' }}>
            Frequently asked questions
          </h2>
          {faqs.map(([q, a], i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>{q}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: C.muted, margin: 0 }}>{a}</p>
            </div>
          ))}

          {/* Related tools — crawlable internal links */}
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", margin: '32px 0 14px' }}>
            More {categoryName}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {related.map(r => (
              <Link key={r.id} href={`/${category}/${r.id}`} style={{
                display: 'block', padding: '12px 16px', background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: 'none',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{r.name}</div>
                <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.5 }}>{r.desc}</div>
              </Link>
            ))}
          </div>

          <p style={{ marginTop: 28, fontSize: 14, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link href={`/${category}`} style={{ color: C.blue, textDecoration: 'none' }}>
              ← View all {categoryName}
            </Link>
            <Link href="/tools" style={{ color: C.blue, textDecoration: 'none' }}>
              Browse all 1,100+ tools →
            </Link>
          </p>
        </div>
      </div>

      {/* Server-rendered footer. CategoryLayout skips its own copy on this route
          (see isArticleOwnedByPage), so there is exactly one — and it puts all 29
          category pages one hop from every tool page, in raw HTML. */}
      <SiteFooter accent={C.blue} />
    </>
  )
}
