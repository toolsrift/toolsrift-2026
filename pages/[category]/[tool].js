import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import TOOL_REGISTRY from '../../lib/toolRegistry'
import TOOL_SEO from '../../lib/toolSeo'

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
  // 6 related tools from the same category (wrap around the list)
  const related = []
  for (let i = 1; related.length < 6 && i < catData.tools.length; i++) {
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

  // HASH BRIDGE: set #/tool/<id> before the widget mounts, so the
  // category component's internal router opens this exact tool.
  //
  // WHY THIS IS NOT A ONE-LINER: Next.js's pages router reconciles the
  // browser URL with a history.replaceState() of its own shortly AFTER
  // hydration. That resolved URL has no client-only hash, so it strips the
  // `#/tool/<id>` we just set. Because the category widget is loaded with
  // ssr:false it mounts asynchronously — often AFTER that reconciliation —
  // and its internal useAppRouter() then reads an empty hash and shows the
  // category home page instead of the tool. To win the race we keep the hash
  // asserted across the reconciliation passes until the widget has mounted
  // and read it, then stop guarding so in-app navigation is never fought.
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const targetHash = `#/tool/${tool.id}`
    const apply = () => {
      // Only restore when the hash has been stripped entirely — that is the
      // signature of Next.js's URL reconciliation. A non-empty hash means the
      // widget or the user has navigated in-app, so we must never override it.
      if (!window.location.hash) {
        window.history.replaceState(
          null, '',
          window.location.pathname + window.location.search + targetHash
        )
      }
    }
    apply()
    // Re-assert the hash on every frame to survive Next.js's post-hydration
    // URL reconciliation, which fires a tick or two after this effect.
    let stopped = false
    const tick = () => {
      if (stopped) return
      apply()
      raf = window.requestAnimationFrame(tick)
    }
    let raf = window.requestAnimationFrame(tick)
    // Mount the widget on the next tick (after the first reconciliation pass),
    // then give the ssr:false chunk a short window to mount and read the hash
    // before we stop guarding.
    const mountTimer = window.setTimeout(() => setReady(true), 0)
    const stopTimer = window.setTimeout(() => {
      stopped = true
      window.cancelAnimationFrame(raf)
    }, 1200)
    return () => {
      stopped = true
      window.cancelAnimationFrame(raf)
      window.clearTimeout(mountTimer)
      window.clearTimeout(stopTimer)
    }
  }, [tool.id])

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

      {/* THE TOOL WIDGET — your existing category app, opened on this tool.
          It renders the full interactive page via ToolPageLayout: the tool
          itself PLUS breadcrumb, H1, how-to, FAQ and related tools. */}
      {ready && <Widget />}

      {/* ============================================================
          SERVER-RENDERED SEO FALLBACK
          The Widget above is client-only (ssr:false), so its content is
          NOT in the HTML Google first receives. This block provides that
          same content server-side so the page is indexable and AdSense-
          eligible. Once the interactive Widget mounts (ready === true) we
          HIDE this block, otherwise the page would show the content twice
          — a stranded footer and a duplicate H1/FAQ below the live tool.
          Crawlers see it (they read the initial HTML); users never see a
          duplicate because it disappears the instant the tool loads.
          ============================================================ */}
      <div style={{
        display: ready ? 'none' : 'block',
        background: C.bg, color: C.text, borderTop: `1px solid ${C.borderLight}`,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '48px 24px 40px',
      }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>

          {/* Breadcrumbs (crawlable links up the hierarchy) */}
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: C.dim, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.dim, textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <Link href={`/${category}`} style={{ color: C.dim, textDecoration: 'none' }}>{categoryName}</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: C.muted }}>{tool.name}</span>
          </nav>

          {/* H1 — the page's primary heading, server-rendered */}
          <h1 style={{
            fontSize: 'clamp(24px,4vw,34px)', fontWeight: 800,
            fontFamily: "'Sora', sans-serif", margin: '0 0 14px', lineHeight: 1.2,
          }}>
            {tool.name} — Free Online Tool
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.75, color: C.muted, margin: '0 0 12px' }}>
            {tool.desc ? `${tool.desc}.` : ''} {tool.name} is a free online tool from the ToolsRift{' '}
            <Link href={`/${category}`} style={{ color: C.blue, textDecoration: 'none' }}>{categoryName}</Link>{' '}
            collection. It runs entirely in your browser — nothing to install, no signup, and your data
            never leaves your device.
          </p>

          {/* Loading indicator — this fallback is visible only for the brief moment
              before the interactive tool mounts. Showing a spinner here (instead of
              only the article) makes that moment read as a clean "loading" state.
              The surrounding prose stays in the DOM for crawlers. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '56px 0 8px' }}>
            <style>{`@keyframes trspin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 34, height: 34, borderRadius: '50%', border: `3px solid ${C.border}`, borderTopColor: C.blue, animation: 'trspin 0.7s linear infinite' }} />
            <div style={{ color: C.dim, fontSize: 13 }}>Loading {tool.name}…</div>
          </div>

          {/* How to use */}
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

          <p style={{ marginTop: 28, fontSize: 14 }}>
            <Link href={`/${category}`} style={{ color: C.blue, textDecoration: 'none' }}>
              ← View all {categoryName}
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
