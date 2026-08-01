import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import TOOL_REGISTRY from '../lib/toolRegistry'
import CATEGORY_THEMES from '../lib/categoryThemes'

/* ============================================================
   /tools — THE SITE'S CRAWL HUB
   ============================================================
   This page used to render only a client-only widget (ssr:false), so the HTML
   Google received was 46 words with zero links. Combined with the category
   pages — whose tool tiles were <div role="button"> rather than anchors — that
   left all 1,100+ tool URLs orphaned: present in sitemap.xml and linked from
   nowhere. Sitemap-only URLs are the lowest-priority crawl class Google has,
   which is why ~300 of them sat in "Discovered – currently not indexed".

   The interactive browser still loads on top. Underneath it, this page now
   server-renders a plain <a> to every single tool, grouped by category, so
   there is one page from which the entire site is reachable in two hops.
   ============================================================ */

const ToolsRiftAllTools = dynamic(
  () => import('../components/toolsrift-tools').catch(err => {
    console.error('Dynamic import failed:', err)
    return { default: () => <div style={{ color: 'red', padding: 40 }}>Error: {String(err)}</div> }
  }),
  {
    ssr: false,
    loading: () => <div style={{ background: '#06090F', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>Loading…</div>
  }
)

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6',
}

export async function getStaticProps() {
  const routeOf = {}
  for (const t of CATEGORY_THEMES) routeOf[t.pageRoute.replace(/^\//, '')] = t.color

  const categories = Object.entries(TOOL_REGISTRY).map(([slug, data]) => ({
    slug,
    name: data.name,
    color: routeOf[slug] || C.blue,
    tools: data.tools.map(t => ({ id: t.id, name: t.name })),
  })).sort((a, b) => a.name.localeCompare(b.name))

  const total = categories.reduce((n, c) => n + c.tools.length, 0)
  return { props: { categories, total } }
}

export default function Tools({ categories, total }) {
  const title = `All ${total} Free Online Tools — Full Index | ToolsRift`
  const description = `Complete index of all ${total} free ToolsRift tools across ${categories.length} categories — calculators, PDF, image, text, code, design and developer tools. No signup, everything runs in your browser.`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content="https://toolsrift.com/tools" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.png" />
        <meta property="og:image:width" content="1500" />
        <meta property="og:image:height" content="782" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.png" />
        <link rel="canonical" href="https://toolsrift.com/tools" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `All ${total} Free ToolsRift Tools`,
          description,
          url: 'https://toolsrift.com/tools',
          isPartOf: { '@type': 'WebSite', name: 'ToolsRift', url: 'https://toolsrift.com' },
        }) }} />
      </Head>

      {/* Interactive browser (client-only) */}
      <ToolsRiftAllTools />

      {/* Server-rendered index — every tool, one anchor each */}
      <div style={{
        background: C.bg, color: C.text, borderTop: `1px solid ${C.borderLight}`,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '48px 24px 56px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: C.dim, marginBottom: 18 }}>
            <Link href="/" style={{ color: C.dim, textDecoration: 'none' }}>Home</Link>
            <span style={{ margin: '0 8px' }}>›</span>
            <span style={{ color: C.muted }}>All Tools</span>
          </nav>

          <h2 style={{
            fontSize: 'clamp(22px,3.4vw,30px)', fontWeight: 800,
            fontFamily: "'Sora', sans-serif", margin: '0 0 10px', lineHeight: 1.2,
          }}>
            Complete tool index — all {total} tools
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.muted, margin: '0 0 36px', maxWidth: 760 }}>
            Every ToolsRift tool, grouped by category. All {total} tools are free, need no account,
            and run entirely in your browser — your files and text never leave your device.
          </p>

          {categories.map(cat => (
            <section key={cat.slug} style={{ marginBottom: 40 }}>
              <h3 style={{
                fontSize: 17, fontWeight: 700, fontFamily: "'Sora', sans-serif",
                margin: '0 0 4px', display: 'flex', alignItems: 'baseline', gap: 10,
              }}>
                <Link href={`/${cat.slug}`} style={{ color: cat.color, textDecoration: 'none' }}>
                  {cat.name}
                </Link>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.dim }}>
                  {cat.tools.length} tools
                </span>
              </h3>
              <ul style={{
                listStyle: 'none', margin: '14px 0 0', padding: 0,
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '8px 18px',
              }}>
                {cat.tools.map(t => (
                  <li key={t.id}>
                    <Link href={`/${cat.slug}/${t.id}`} style={{
                      color: C.muted, textDecoration: 'none', fontSize: 13.5, lineHeight: 1.6,
                    }}>
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
