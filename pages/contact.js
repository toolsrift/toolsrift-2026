import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6', navBg: 'rgba(6,9,15,0.92)',
}

const CONTACT_METHODS = [
  {
    icon: '📧',
    label: 'General Enquiries',
    value: 'contact@toolsrift.com',
    href: 'mailto:contact@toolsrift.com',
    note: 'Questions about our tools, partnerships or anything else.'
  },
  {
    icon: '🐛',
    label: 'Bug Reports',
    value: 'contact@toolsrift.com',
    href: 'mailto:contact@toolsrift.com?subject=Bug%20Report',
    note: 'Please include the tool name, your browser and a short description of the issue.'
  },
  {
    icon: '💡',
    label: 'Feature Requests',
    value: 'contact@toolsrift.com',
    href: 'mailto:contact@toolsrift.com?subject=Feature%20Request',
    note: 'Tell us what tool you wish existed — we genuinely take requests seriously.'
  },
  {
    icon: '🤝',
    label: 'Advertising & Partnerships',
    value: 'contact@toolsrift.com',
    href: 'mailto:contact@toolsrift.com?subject=Advertising%20Enquiry',
    note: 'Direct ad placements, sponsorships and tool integrations.'
  },
  {
    icon: '🔒',
    label: 'Privacy & Legal',
    value: 'contact@toolsrift.com',
    href: 'mailto:contact@toolsrift.com?subject=Privacy%20Enquiry',
    note: 'Data deletion requests, DMCA notices and other legal matters.'
  },
]

const FAQS = [
  ['How quickly do you respond?', 'We aim to reply to every email within 2-3 business days. Bug reports affecting a live tool usually get a same-day acknowledgement, with a fix or workaround within 48 hours.'],
  ['Can I suggest a new tool?', 'Yes — please. A large share of our roadmap comes from user requests. Email us the tool you wish existed with a short description of what it should do, and we will reply with whether (and when) we can build it.'],
  ['Do you offer paid support?', 'Not at this stage. All ToolsRift tools are free and we provide community-style support via email for everyone equally. If you need integration help for a custom enterprise use case, mention that in your email and we will discuss options.'],
  ['Where are you based?', 'ToolsRift is built and operated from Hyderabad, India. Our team works remotely across India and we serve users worldwide.'],
  ['How do I report a bug or security issue?', 'For functional bugs, email contact@toolsrift.com with the tool name and steps to reproduce. For security issues — please use the same email with subject prefix "[SECURITY]" so we can prioritize it. We acknowledge security reports within 24 hours.'],
]

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us | ToolsRift</title>
        <meta name="description" content="Get in touch with ToolsRift. Bug reports, feature requests, partnerships and general enquiries — we reply within 2-3 business days." />
        <meta property="og:title" content="Contact ToolsRift" />
        <meta property="og:description" content="Reach the ToolsRift team for support, feedback, partnerships and feature requests." />
        <meta property="og:url" content="https://toolsrift.com/contact" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/contact" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "url": "https://toolsrift.com/contact",
          "name": "Contact ToolsRift",
          "description": "Contact information for ToolsRift — support, partnerships, feedback and feature requests."
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ToolsRift",
          "url": "https://toolsrift.com",
          "email": "contact@toolsrift.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "contact@toolsrift.com",
            "contactType": "customer support",
            "availableLanguage": ["English"]
          }
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "Contact" }
          ]
        })}} />
      </Head>

      <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: C.text }}>

        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: `1px solid ${C.borderLight}`, background: C.navBg, backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/logo.svg" alt="ToolsRift" style={{ height: 38 }} />
          </a>
          <a href="/" style={{ color: C.muted, textDecoration: 'none', fontSize: 14, fontWeight: 600, padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.border}` }}>
            ← Back to Tools
          </a>
        </nav>

        <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>

          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.dim, marginBottom: 36 }}>
            <a href="/" style={{ color: C.dim, textDecoration: 'none' }}>Home</a>
            <span>›</span>
            <span style={{ color: C.muted }}>Contact</span>
          </nav>

          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#A5B4FC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Get in Touch
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.2 }}>
              Contact ToolsRift
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: 0 }}>
              We read every email. Whether you have spotted a bug, want to suggest a tool, need help with an integration, or just want to say hello — we would genuinely love to hear from you.
            </p>
          </div>

          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 20px' }}>
              How to reach us
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {CONTACT_METHODS.map(m => (
                <a key={m.label} href={m.href} style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr', gap: 18,
                  padding: '20px 22px', background: C.surface,
                  border: `1px solid ${C.borderLight}`, borderRadius: 14,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderLight; e.currentTarget.style.background = C.surface }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(99,102,241,0.12)', fontSize: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{m.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 14, color: '#A5B4FC', fontWeight: 600, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
                    <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6 }}>{m.note}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 48, padding: '24px 28px', background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", marginBottom: 12 }}>
              📍 Our Location
            </div>
            <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
              ToolsRift is built and operated from <strong style={{ color: C.text }}>Hyderabad, India</strong>. We are a small team serving users worldwide. Email is the fastest way to reach us — we do not currently offer phone support.
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {FAQS.map(([q, a], i) => (
                <details key={i} style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 12, overflow: 'hidden' }}>
                  <summary style={{
                    padding: '16px 20px', fontSize: 14, fontWeight: 700, color: C.text,
                    fontFamily: "'Sora', sans-serif", cursor: 'pointer', listStyle: 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                  }}>
                    <span>{q}</span>
                    <span style={{ color: '#06B6D4', fontSize: 18 }}>+</span>
                  </summary>
                  <div style={{ padding: '0 20px 18px', fontSize: 14, color: C.muted, lineHeight: 1.8 }}>
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </div>

        </div>

        <footer style={{ borderTop: `1px solid ${C.borderLight}`, padding: '28px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {[['Home','/'],['About','/about'],['Contact','/contact'],['Privacy Policy','/privacy-policy'],['Terms','/terms'],['Disclaimer','/disclaimer'],['Cookies','/cookies']].map(([n,h]) => (
              <a key={h} href={h} style={{ color: C.dim, textDecoration: 'none' }}>{n}</a>
            ))}
          </div>
          <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
        </footer>
      </div>
    </>
  )
}
