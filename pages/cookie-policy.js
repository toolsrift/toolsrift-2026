import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6', navBg: 'rgba(6,9,15,0.92)',
}

const SECTIONS = [
  {
    title: '1. What Are Cookies?',
    content: `Cookies are small text files stored on your device by your web browser when you visit a website. They are widely used to make websites work efficiently, to remember preferences, and to provide information to the website owners.

ToolsRift uses cookies and similar storage technologies (localStorage) to operate our service and understand how it is used. This page explains what we use, why, and how you can opt out.`
  },
  {
    title: '2. Categories of Cookies We Use',
    content: `STRICTLY NECESSARY (always on, no opt-out)
- Theme preference: stored in localStorage so the site remembers your dark/light mode choice. Never leaves your device.
- Streak counter: a localStorage entry that counts how many tools you've used today (for the "🔥 N today" chip in the toolbar). Resets daily. Never leaves your device.
- Workspace state: temporary localStorage cache of tool input you're actively editing, so reloading the page doesn't lose your work.

ANALYTICS (Google Analytics — anonymous)
- _ga, _ga_*: identify a unique browser for aggregated traffic analysis. We use this to understand which tools are popular, where users come from, and how the site performs.

ADVERTISING (Google AdSense — when enabled)
- ToolsRift may serve ads via Google AdSense in the future. AdSense uses its own cookies (NID, IDE, ANID, etc.) to serve and personalize ads. These cookies are governed by Google's policies.

THIRD-PARTY
- Google Fonts may set short-lived cookies when serving font files. These are unavoidable for any site that uses Google Fonts.
- Vercel (our hosting provider) may set a session cookie for routing and security purposes.`
  },
  {
    title: '3. Why We Use Cookies',
    content: `We use cookies to:

- Remember your theme and preferences
- Understand aggregate usage so we can improve the tools you love most
- Display advertisements that fund the free service (when AdSense is enabled)
- Keep the service secure and prevent abuse

We do NOT use cookies to:

- Build a personal profile of you
- Track you across unrelated sites
- Sell or share data with third-party advertisers beyond what AdSense does within Google's policies`
  },
  {
    title: '4. How to Opt Out',
    content: `Opt out of Google Analytics
- Install the official Google Analytics Opt-out Browser Add-on: https://tools.google.com/dlpage/gaoptout
- Or disable cookies for toolsrift.com in your browser settings.

Opt out of Personalized Ads (Google AdSense)
- Visit Google's ad personalization page: https://adssettings.google.com
- Or opt out of Network Advertising Initiative members: https://optout.networkadvertising.org
- For EU users, the Your Online Choices opt-out: https://www.youronlinechoices.eu

Block all cookies
- Most browsers let you block cookies entirely. ToolsRift will continue to work, but some preferences (theme, streak) will not persist between visits.
- Chrome: Settings → Privacy and Security → Cookies and other site data
- Firefox: Settings → Privacy & Security → Cookies and Site Data
- Safari: Preferences → Privacy → Manage Website Data
- Edge: Settings → Cookies and site permissions → Cookies and site data`
  },
  {
    title: '5. Do Not Track',
    content: `Most browsers offer a "Do Not Track" (DNT) signal. Because there is no consensus on how DNT signals should be honored, ToolsRift does not currently respond to DNT signals. You can still control cookies via the methods in Section 4.

We will update this policy if industry standards on DNT settle in a meaningful direction.`
  },
  {
    title: '6. Cookies and Children',
    content: `ToolsRift is not directed to children under 13 (or the minimum digital consent age in your country). We do not knowingly collect personal information from children. If you believe a child has provided us with such information, please contact us so we can take appropriate action.`
  },
  {
    title: '7. Changes to This Cookie Policy',
    content: `We may update this Cookie Policy as our practices or applicable laws change. When we do, we will update the "Last Updated" date at the top of this page. We recommend reviewing this page periodically.

If we make a material change (for example, adding a new advertising partner), we will provide a more prominent notice on the homepage for a short period.`
  },
  {
    title: '8. Your Rights',
    content: `Depending on your jurisdiction, you may have rights regarding cookies and personal data:

- EU / UK (GDPR): right to access, rectify, erase, restrict, port, or object to processing.
- India (DPDP Act 2023): right to information, correction, erasure, grievance redressal, and nomination.
- California (CCPA / CPRA): right to know, delete, correct, opt out of "sale" of personal information.

To exercise any of these rights, email hello@toolsrift.com with a clear description of your request. We will respond within the timeframe required by applicable law.`
  },
  {
    title: '9. Contact',
    content: `Questions about cookies or your data?

- Email: hello@toolsrift.com
- Privacy enquiries: privacy@toolsrift.com
- Location: Hyderabad, India`
  },
]

export default function CookiePolicy() {
  return (
    <>
      <Head>
        <title>Cookie Policy | ToolsRift</title>
        <meta name="description" content="ToolsRift Cookie Policy — what cookies we use, why, how to opt out of Google Analytics and AdSense, and your rights under GDPR, India DPDP, and CCPA." />
        <meta property="og:title" content="Cookie Policy | ToolsRift" />
        <meta property="og:description" content="Cookie Policy for ToolsRift — necessary, analytics and advertising cookies explained, with full opt-out instructions." />
        <meta property="og:url" content="https://toolsrift.com/cookie-policy" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <link rel="canonical" href="https://toolsrift.com/cookie-policy" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "Cookie Policy" }
          ]
        })}</script>
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
            <span style={{ color: C.muted }}>Cookie Policy</span>
          </nav>

          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#FBBF24', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Legal Document
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.2 }}>
              Cookie Policy
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 12px' }}>
              ToolsRift uses a minimal set of cookies to remember your preferences, understand aggregate usage, and serve ads that fund the free platform. This page lists every cookie category we use and how you can opt out.
            </p>
            <p style={{ fontSize: 13, color: C.dim }}>
              Last Updated: May 2026 &nbsp;·&nbsp; Effective Date: May 2026
            </p>
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

          <div style={{ marginTop: 12, padding: '20px 22px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 12 }}>
            <div style={{ fontSize: 13.5, color: '#FBBF24', lineHeight: 1.7 }}>
              <strong style={{ color: C.text }}>Related:</strong>{' '}
              <a href="/privacy-policy" style={{ color: '#FBBF24' }}>Privacy Policy</a> ·{' '}
              <a href="/terms" style={{ color: '#FBBF24' }}>Terms of Service</a> ·{' '}
              <a href="/disclaimer" style={{ color: '#FBBF24' }}>Disclaimer</a>
            </div>
          </div>
        </div>

        <footer style={{ borderTop: `1px solid ${C.borderLight}`, padding: '28px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {[['Home','/'],['Privacy Policy','/privacy-policy'],['Terms','/terms'],['Disclaimer','/disclaimer'],['About','/about']].map(([n,h]) => (
              <a key={h} href={h} style={{ color: C.dim, textDecoration: 'none' }}>{n}</a>
            ))}
          </div>
          <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
        </footer>
      </div>
    </>
  )
}
