import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', navBg: 'rgba(6,9,15,0.92)',
}

const COOKIE_TABLE = [
  { name: '_ga, _gid, _ga_*', provider: 'Google Analytics', purpose: 'Anonymized traffic measurement — page views, sessions, country, device type. No personally identifiable information is collected.', duration: 'Up to 2 years', type: 'Analytics' },
  { name: '__gads, __gpi, IDE, NID', provider: 'Google AdSense / DoubleClick', purpose: 'Ad serving and frequency capping. Personalized ads may use this cookie if you have not opted out via Google\'s ad personalization controls.', duration: 'Up to 2 years', type: 'Advertising' },
  { name: '_cmp_consent', provider: 'ToolsRift', purpose: 'Stores your cookie consent choices (which categories you have accepted) so we do not re-prompt you.', duration: '6 months', type: 'Strictly Necessary' },
  { name: 'theme', provider: 'ToolsRift', purpose: 'Remembers your dark / light theme preference. Stored in localStorage; never sent to any server.', duration: 'Until cleared', type: 'Functional' },
  { name: '_draft_*', provider: 'ToolsRift', purpose: 'Saves drafts in the invoice, resume and similar generator tools to your browser only. Cleared when you clear browser data.', duration: 'Until cleared', type: 'Functional' },
]

const SECTIONS = [
  {
    title: 'What are cookies?',
    content: `Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, work more efficiently, and to provide information to site owners and advertisers.

Some cookies are essential (the site cannot function properly without them), while others are used for analytics, personalization or advertising. You are always in control — you can accept, reject or delete cookies through your browser settings.`
  },
  {
    title: 'How ToolsRift uses cookies',
    content: `ToolsRift uses a minimal set of cookies grouped into four categories:

1. Strictly Necessary — Required for the site to function. These cannot be disabled. We use only one: a small cookie that remembers your cookie-consent choices.

2. Functional — Remember your preferences such as theme (dark / light) and tool drafts. These are stored in your browser only and never transmitted to our servers.

3. Analytics — Anonymized traffic measurement via Google Analytics. We see aggregate page-view counts, country, device type and similar — never your individual identity.

4. Advertising — Ads on ToolsRift are served by Google AdSense. AdSense uses cookies to serve relevant ads and limit how often you see the same ad. If you do not consent to advertising cookies, you will still see ads, but they will not be personalized.`
  },
  {
    title: 'Third-party cookies',
    content: `Some cookies on ToolsRift are placed by third-party services we integrate with:

- Google Analytics (google-analytics.com) — anonymized analytics
- Google AdSense (googlesyndication.com, doubleclick.net) — ad serving
- Google Fonts (fonts.googleapis.com) — typography delivery (does not set cookies, but may log your IP for caching)
- Vercel (vercel.com) — site hosting and CDN

Each of these services has its own cookie and privacy policy. We do not control the specific cookies set by these third parties — please refer to their policies for full details.`
  },
  {
    title: 'How to manage cookies',
    content: `You have several ways to control cookies:

Browser settings — All modern browsers (Chrome, Firefox, Safari, Edge) let you view, accept, reject and delete cookies. Look under Settings → Privacy or Settings → Cookies.

Ad personalization controls — You can opt out of personalized advertising across all Google services via Google\'s ad settings page (adssettings.google.com).

Aggregate opt-outs — Visit aboutads.info/choices (US) or youronlinechoices.eu (EU) to opt out of personalized advertising across many ad networks at once.

Do Not Track — Some browsers send a Do Not Track signal. Google Analytics on ToolsRift respects this signal where the browser sends it.

Clearing cookies — You can delete all cookies set by ToolsRift via your browser\'s cookie manager. After clearing, you may be asked again for your cookie consent on your next visit.`
  },
  {
    title: 'What happens if you block cookies',
    content: `If you disable or block cookies:

- The site will still work — all tools function correctly without cookies
- Your theme preference will reset on each visit
- Tool drafts (invoice, resume) will not persist across sessions
- You will still see ads, but they will not be personalized
- Aggregate analytics may slightly under-count your visits

We do not block access to any tool based on your cookie choices.`
  },
  {
    title: 'Cookies and your privacy',
    content: `Cookies set by ToolsRift directly contain no personally identifiable information — only preference flags (theme, consent) and anonymized analytics identifiers.

Importantly: the files you upload to our tools (images, PDFs, text) are never stored in cookies or sent to any server. All file processing happens in your browser. See our Privacy Policy for full details.`
  },
  {
    title: 'Updates to this policy',
    content: `We may update this Cookie Policy as our use of cookies evolves, when we add new third-party services, or when regulations change. The "Last Updated" date at the top of this page reflects the most recent revision.

For significant changes (such as adding a new cookie category), we will re-prompt you for consent on your next visit.`
  },
  {
    title: 'Contact',
    content: `For questions about cookies or this Cookie Policy, please contact:

Email: contact@toolsrift.com
Website: https://toolsrift.com
Location: Hyderabad, India`
  },
]

export default function Cookies() {
  return (
    <>
      <Head>
        <title>Cookie Policy | ToolsRift</title>
        <meta name="description" content="ToolsRift Cookie Policy. Learn what cookies we use, why and how you can control them. Minimal cookies, transparent disclosure." />
        <meta property="og:title" content="Cookie Policy | ToolsRift" />
        <meta property="og:description" content="What cookies ToolsRift uses, how they support the site and ads, and how you can manage them." />
        <meta property="og:url" content="https://toolsrift.com/cookies" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://toolsrift.com/cookies" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "Cookie Policy" }
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

        <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>

          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.dim, marginBottom: 36 }}>
            <a href="/" style={{ color: C.dim, textDecoration: 'none' }}>Home</a>
            <span>›</span>
            <span style={{ color: C.muted }}>Cookie Policy</span>
          </nav>

          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#6EE7B7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Transparency
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.2 }}>
              Cookie Policy
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 12px' }}>
              We use a small number of cookies to keep ToolsRift working, measure aggregate traffic and support our free ad-supported model. The full list and your control options are below.
            </p>
            <p style={{ fontSize: 13, color: C.dim }}>
              Last Updated: May 2026
            </p>
          </div>

          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 20px' }}>
              Cookies we use
            </h2>
            <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${C.borderLight}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: C.surface }}>
                    {['Cookie', 'Provider', 'Purpose', 'Duration', 'Type'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: C.text, fontWeight: 700, fontFamily: "'Sora', sans-serif", borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((c, i) => (
                    <tr key={c.name} style={{ borderBottom: i < COOKIE_TABLE.length - 1 ? `1px solid ${C.borderLight}` : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '14px 16px', color: '#A5B4FC', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{c.name}</td>
                      <td style={{ padding: '14px 16px', color: C.muted }}>{c.provider}</td>
                      <td style={{ padding: '14px 16px', color: C.muted, lineHeight: 1.6 }}>{c.purpose}</td>
                      <td style={{ padding: '14px 16px', color: C.dim, whiteSpace: 'nowrap' }}>{c.duration}</td>
                      <td style={{ padding: '14px 16px', color: c.type === 'Strictly Necessary' ? '#FCA5A5' : c.type === 'Advertising' ? '#FCD34D' : c.type === 'Analytics' ? '#6EE7B7' : '#93C5FD', fontWeight: 600, fontSize: 12 }}>{c.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
