import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6', navBg: 'rgba(6,9,15,0.92)',
}

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `ToolsRift is designed with privacy as a core principle. We collect minimal information to operate the platform:

- Usage Analytics: We may collect anonymized, aggregated data about which tools are used and general traffic patterns via Google Analytics. This data contains no personally identifiable information.
- Ad Data: Our advertising partner Google AdSense may collect cookie-based data to serve relevant ads. This is governed by Google's own privacy policy.
- No Account Data: ToolsRift does not require you to create an account. We do not collect names, email addresses, passwords, or any personal profile information.
- No File Uploads: All file processing (images, PDFs, documents) happens entirely in your browser. Your files are never uploaded to our servers.`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the limited data we collect for:

- Improving tool performance and user experience
- Understanding which tools are most useful to our users
- Displaying relevant advertisements to support the free platform
- Ensuring the security and stability of our service

We do not sell, rent, or trade your data to any third parties.`
  },
  {
    title: '3. Cookies',
    content: `ToolsRift uses cookies in the following limited ways:

- Google Analytics Cookies: To understand aggregate traffic patterns. You can opt out via Google Analytics Opt-out Browser Add-on.
- Google AdSense Cookies: To serve relevant ads. These are governed by Google's advertising policies.
- Theme Preference: We store your dark/light theme preference in localStorage. This never leaves your device.
- No tracking cookies of our own are set beyond the above.

You can disable cookies in your browser settings at any time.`
  },
  {
    title: '4. Third-Party Services',
    content: `ToolsRift integrates with the following third-party services:

- Google Analytics (analytics.google.com) — Traffic analysis
- Google AdSense (google.com/adsense) — Advertising
- Google Fonts (fonts.googleapis.com) — Typography (Sora, Plus Jakarta Sans, JetBrains Mono)
- Vercel (vercel.com) — Hosting and CDN

Each of these services has its own privacy policy. We encourage you to review them. We are not responsible for the privacy practices of these third-party services.`
  },
  {
    title: '5. Data Security',
    content: `We take reasonable measures to protect any data associated with ToolsRift:

- All connections to ToolsRift use HTTPS encryption
- We do not store sensitive user data on our servers
- File processing happens locally in your browser — your files never transit our infrastructure
- We regularly review our security practices

No method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.`
  },
  {
    title: '6. Children\'s Privacy',
    content: `ToolsRift is a general-purpose tools platform intended for users of all ages. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, please contact us and we will promptly delete it.`
  },
  {
    title: '7. Your Rights',
    content: `Depending on your location, you may have the following rights:

- Access: Request information about any data we hold about you
- Deletion: Request deletion of your data
- Opt-out: Opt out of analytics and advertising cookies via your browser settings or Google's opt-out tools
- Portability: Request a copy of your data in a portable format

To exercise these rights, contact us at the email below.`
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of ToolsRift after changes constitutes acceptance of the updated policy.`
  },
  {
    title: '9. Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:

Email: privacy@toolsrift.com
Website: https://toolsrift.com
Location: Hyderabad, India

We aim to respond to all privacy-related inquiries within 5 business days.`
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | ToolsRift</title>
        <meta name="description" content="ToolsRift Privacy Policy. Learn how we collect, use and protect your data. We never upload your files and collect minimal information." />
        <meta property="og:title" content="Privacy Policy | ToolsRift" />
        <meta property="og:description" content="ToolsRift Privacy Policy — minimal data collection, no file uploads, browser-based processing." />
        <meta property="og:url" content="https://toolsrift.com/privacy-policy" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <link rel="canonical" href="https://toolsrift.com/privacy-policy" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "Privacy Policy" }
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

        {/* CONTENT */}
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.dim, marginBottom: 36 }}>
            <a href="/" style={{ color: C.dim, textDecoration: 'none' }}>Home</a>
            <span>›</span>
            <span style={{ color: C.muted }}>Privacy Policy</span>
          </nav>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Legal Document
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.2 }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 12px' }}>
              At ToolsRift, your privacy is a top priority. This policy explains what data we collect, why, and how we protect it. The short version: we collect very little, your files never leave your device, and we never sell your data.
            </p>
            <p style={{ fontSize: 13, color: C.dim }}>
              Last Updated: April 2026 &nbsp;·&nbsp; Effective Date: April 2026
            </p>
          </div>

          {/* Sections */}
          {SECTIONS.map((s, i) => (
            <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: `1px solid ${C.borderLight}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 14px' }}>
                {s.title}
              </h2>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.85, whiteSpace: 'pre-line' }}>
                {s.content}
              </div>
            </div>
          ))}

        </div>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${C.borderLight}`, padding: '28px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {[['Home','/'],['Privacy Policy','/privacy-policy'],['About','/about'],['Text Tools','/text'],['PDF Tools','/pdf'],['Image Tools','/images'],['Dev Tools','/devtools']].map(([n,h]) => (
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
