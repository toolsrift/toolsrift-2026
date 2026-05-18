import Head from 'next/head'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 — Page Not Found | ToolsRift</title>
        <meta name="description" content="Page not found. Browse 544+ free online tools on ToolsRift." />
        <meta name="robots" content="noindex" />
      </Head>
      <div style={{
        background: '#06090F', minHeight: '100vh', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: 24, textAlign: 'center'
      }}>
        <a href="/" style={{ textDecoration: 'none', marginBottom: 40 }}>
          <img src="/logo.svg" alt="ToolsRift" style={{ height: 44 }} />
        </a>
        <div style={{
          fontSize: 96, fontWeight: 900, fontFamily: "'Sora', sans-serif",
          background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: 16
        }}>404</div>
        <h1 style={{
          fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800,
          color: '#F1F5F9', fontFamily: "'Sora', sans-serif",
          margin: '0 0 12px'
        }}>
          Page Not Found
        </h1>
        <p style={{
          fontSize: 15, color: '#64748B', maxWidth: 400,
          lineHeight: 1.7, margin: '0 0 36px'
        }}>
          The page you are looking for does not exist or has been moved.
          Browse our free tools below.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" style={{
            padding: '13px 28px', borderRadius: 12, textDecoration: 'none',
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            color: '#fff', fontWeight: 700, fontSize: 14,
            boxShadow: '0 8px 24px rgba(99,102,241,0.35)'
          }}>
            ← Back to Home
          </a>
          <a href="/#/tools" style={{
            padding: '13px 28px', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94A3B8', fontWeight: 600, fontSize: 14
          }}>
            Browse All Tools
          </a>
        </div>
        <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '4px 16px' }}>
          {[['Text Tools','/text'],['PDF Tools','/pdf'],['Image Tools','/images'],
            ['Dev Tools','/devtools'],['Calculators','/#/category/calculator']
          ].map(([n,h]) => (
            <a key={h} href={h} style={{
              color: '#475569', textDecoration: 'none', fontSize: 13
            }}>{n}</a>
          ))}
        </div>
        <div style={{ marginTop: 40, fontSize: 12, color: '#374151' }}>
          © 2026 ToolsRift · Free online tools
        </div>
      </div>
    </>
  )
}
