import Head from 'next/head'

const S = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  text: '#F1F5F9', muted: '#94A3B8', dim: '#64748B',
}

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pro Plans Coming Soon — ToolsRift</title>
        <meta name="description" content="All 544+ ToolsRift tools are completely free during our launch. Pro plans with advanced features will be available soon." />
        <meta property="og:title" content="Pro Plans Coming Soon — ToolsRift" />
        <meta property="og:description" content="All 544+ tools are completely free during our launch. Pro plans coming soon." />
        <meta property="og:url" content="https://toolsrift.com/pricing" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/pricing" />
      </Head>

      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#06090F}`}</style>

        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: `1px solid ${S.border}` }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ToolsRift" style={{ height: 36 }} />
          </a>
          <a href="/" style={{ fontSize: 13, color: S.dim, textDecoration: 'none', fontWeight: 500 }}>← Back to Tools</a>
        </nav>

        {/* Main */}
        <div style={{ textAlign: 'center', padding: '100px 20px 80px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(59,130,246,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 20, padding: '5px 16px', fontSize: 12, color: '#93C5FD', fontWeight: 600, marginBottom: 28 }}>
              🚀 Coming Soon
            </div>
            <h1 style={{ fontSize: 'clamp(30px,5vw,48px)', fontWeight: 800, margin: '0 0 20px', fontFamily: "'Sora',sans-serif", lineHeight: 1.15 }}>
              Pro Plans —<br />Coming Soon
            </h1>
            <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.8, marginBottom: 40 }}>
              All 544+ tools are completely free during our launch. Pro plans with advanced features will be available soon.
            </p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', borderRadius: 12, boxShadow: '0 8px 28px rgba(59,130,246,0.3)' }}>
              Browse Free Tools →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 20px 40px', borderTop: `1px solid ${S.border}`, fontSize: 12, color: S.dim }}>
          © 2026 ToolsRift · <a href="/" style={{ color: S.dim, textDecoration: 'none' }}>All Tools</a>
        </div>
      </div>
    </>
  )
}
