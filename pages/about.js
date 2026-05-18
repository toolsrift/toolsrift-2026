import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', surface2: '#111827',
  border: 'rgba(255,255,255,0.08)', borderLight: 'rgba(255,255,255,0.05)',
  text: '#F1F5F9', muted: '#94A3B8', dim: '#64748B',
  blue: '#3B82F6', navBg: 'rgba(6,9,15,0.92)',
}

const STATS = [
  { num: '544+', label: 'Free Tools', icon: '🛠️', color: '#6366F1' },
  { num: '34',   label: 'Categories', icon: '📂', color: '#10B981' },
  { num: '100%', label: 'In-Browser', icon: '⚡', color: '#F59E0B' },
  { num: '0',    label: 'Sign-up Required', icon: '✅', color: '#3B82F6' },
]

const VALUES = [
  { icon: '⚡', title: 'Speed First', color: '#6366F1', desc: 'Every tool runs instantly in your browser. No loading spinners, no server round-trips. Results in milliseconds.' },
  { icon: '🔒', title: 'Privacy by Default', color: '#10B981', desc: 'Your files, text, and data never leave your device. We process everything locally — always.' },
  { icon: '🆓', title: 'Free Forever', color: '#F59E0B', desc: 'Core tools are free with no daily limits, no sign-up, and no paywalls. Funded by non-intrusive ads.' },
  { icon: '📱', title: 'Works Everywhere', color: '#EC4899', desc: 'Fully responsive on mobile, tablet, and desktop. Use any tool on any device, any browser.' },
  { icon: '🔍', title: 'SEO & Accessibility', color: '#06B6D4', desc: 'Built with semantic HTML, proper meta tags, and fast load times for the best experience.' },
  { icon: '🚀', title: 'Always Growing', color: '#84CC16', desc: 'New tools added regularly based on user requests. We are just getting started — 1600+ tools planned.' },
]

const CATEGORIES_PREVIEW = [
  { icon: '✍️', name: 'Text Tools', count: 45 },
  { icon: '📄', name: 'PDF Tools', count: 28 },
  { icon: '🖼️', name: 'Image Tools', count: 50 },
  { icon: '💻', name: 'Dev Tools', count: 40 },
  { icon: '🧮', name: 'Calculators', count: 52 },
  { icon: '🎨', name: 'CSS Generators', count: 20 },
  { icon: '🔐', name: 'Encoders', count: 25 },
  { icon: '💼', name: 'Business Tools', count: 15 },
]

export default function About() {
  return (
    <>
      <Head>
        <title>About ToolsRift — Free Online Tools Platform | ToolsRift</title>
        <meta name="description" content="ToolsRift is a free online tools platform with 544+ tools across 34 categories. Built for speed, privacy and accessibility. No signup, no limits." />
        <meta property="og:title" content="About ToolsRift — Free Online Tools Platform" />
        <meta property="og:description" content="544+ free online tools built for speed, privacy and everyone. No signup required." />
        <meta property="og:url" content="https://toolsrift.com/about" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <link rel="canonical" href="https://toolsrift.com/about" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ToolsRift",
          "url": "https://toolsrift.com",
          "description": "Free online tools platform with 544+ tools across 34 categories.",
          "foundingLocation": { "@type": "Place", "name": "Hyderabad, India" },
          "sameAs": ["https://toolsrift.com"]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "About" }
          ]
        })}</script>
      </Head>

      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: C.text }}>

        {/* NAV */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: `1px solid ${C.borderLight}`, background: C.navBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ToolsRift" style={{ height: 38 }} />
          </a>
          <a href="/" style={{ color: C.muted, textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}`, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}>
            ← Back to Tools
          </a>
        </nav>

        {/* HERO */}
        <section style={{ padding: 'clamp(48px,8vw,96px) 24px 72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(99,102,241,0.08) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
            <nav aria-label="Breadcrumb" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: 13, color: C.dim, marginBottom: 28 }}>
              <a href="/" style={{ color: C.dim, textDecoration: 'none' }}>Home</a>
              <span>›</span>
              <span style={{ color: C.muted }}>About</span>
            </nav>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '5px 16px', fontSize: 12, color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>
              Our Mission
            </div>
            <h1 style={{ fontSize: 'clamp(30px,5vw,52px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 20px', lineHeight: 1.15 }}>
              Powerful Tools.<br />Free for Everyone.
            </h1>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, margin: '0 0 48px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
              ToolsRift was built on a simple belief — the best online tools should be free, fast, and accessible to everyone. No accounts, no paywalls, no data collection. Just open and use.
            </p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', padding: '14px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 28px rgba(99,102,241,0.35)' }}>
              ⚡ Explore 544+ Free Tools →
            </a>
          </div>
        </section>

        {/* STATS */}
        <section style={{ padding: '0 24px 72px', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ padding: '28px 20px', borderRadius: 16, background: C.surface, border: `1px solid ${C.borderLight}`, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: C.borderLight, maxWidth: 1100, margin: '0 auto 72px' }} />

        {/* STORY */}
        <section style={{ padding: '0 24px 72px', maxWidth: 780, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Our Story</div>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: 0 }}>Why We Built ToolsRift</h2>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 20, padding: 'clamp(28px,4vw,48px)' }}>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, margin: '0 0 20px' }}>
              Every day, millions of people search for simple online tools — a quick PDF merger, a color converter, a word counter. They land on sites that are slow, cluttered with ads, require sign-ups, or hide basic features behind paywalls.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, margin: '0 0 20px' }}>
              We built ToolsRift to fix that. Starting with 544 tools across 34 categories — and growing toward 1,600+ — every tool on ToolsRift runs entirely in your browser. Your files never leave your device. Your data is never sold.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, margin: 0 }}>
              We are a small team based in Hyderabad, India, building tools we use ourselves every day. ToolsRift is ad-supported so we can keep everything free — a fair trade we are proud of.
            </p>
          </div>
        </section>

        <div style={{ height: 1, background: C.borderLight, maxWidth: 1100, margin: '0 auto 72px' }} />

        {/* VALUES */}
        <section style={{ padding: '0 24px 72px', maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>What We Stand For</div>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: 0 }}>Our Core Values</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {VALUES.map((v, i) => (
              <div key={v.title} style={{ padding: '28px 24px', borderRadius: 16, background: C.surface, border: `1px solid ${C.borderLight}`, transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = v.color + '44'; e.currentTarget.style.boxShadow = `0 16px 40px ${v.color}12`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: v.color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{v.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>{v.title}</div>
                <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.7 }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: C.borderLight, maxWidth: 1100, margin: '0 auto 72px' }} />

        {/* CATEGORIES PREVIEW */}
        <section style={{ padding: '0 24px 72px', maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>What's Inside</div>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 12px' }}>34 Categories. 544 Tools.</h2>
            <p style={{ fontSize: 15, color: C.dim, margin: 0 }}>A small preview of what's available — with more added every week.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12, marginBottom: 32 }}>
            {CATEGORIES_PREVIEW.map(cat => (
              <div key={cat.name} style={{ padding: '18px 16px', borderRadius: 14, background: C.surface, border: `1px solid ${C.borderLight}`, textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: C.dim }}>{cat.count} tools</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.text; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
              Browse All 34 Categories →
            </a>
          </div>
        </section>

        <div style={{ height: 1, background: C.borderLight, maxWidth: 1100, margin: '0 auto 72px' }} />

        {/* CONTACT */}
        <section style={{ padding: '0 24px 80px', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Get in Touch</div>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px' }}>Contact Us</h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: '0 0 32px' }}>
            Have a tool suggestion? Found a bug? Want to collaborate? We would love to hear from you.
          </p>
          <div style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 16, padding: '28px 32px' }}>
            {[
              { icon: '📧', label: 'Email', value: 'hello@toolsrift.com', href: 'mailto:hello@toolsrift.com' },
              { icon: '🌐', label: 'Website', value: 'toolsrift.com', href: 'https://toolsrift.com' },
              { icon: '📍', label: 'Location', value: 'Hyderabad, India', href: null },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.borderLight}` }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, color: C.dim, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{item.label}</div>
                  {item.href
                    ? <a href={item.href} style={{ fontSize: 14, color: '#60A5FA', textDecoration: 'none', fontWeight: 600 }}>{item.value}</a>
                    : <span style={{ fontSize: 14, color: C.muted }}>{item.value}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${C.borderLight}`, padding: '28px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {[['Home','/'],['About','/about'],['Privacy Policy','/privacy-policy'],['Text Tools','/text'],['PDF Tools','/pdf'],['Image Tools','/images'],['Dev Tools','/devtools']].map(([n,h]) => (
              <a key={h} href={h} style={{ color: C.dim, textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A5B4FC'}
                onMouseLeave={e => e.currentTarget.style.color = C.dim}>{n}</a>
            ))}
          </div>
          <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
        </footer>

      </div>
    </>
  )
}
