import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6', navBg: 'rgba(6,9,15,0.92)',
}

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using ToolsRift ("the Service", "we", "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.

These Terms apply to all visitors and users of ToolsRift. They are effective from the date you first access the Service.

ToolsRift is operated from Hyderabad, India. By using the Service, you acknowledge that you are at least 13 years old (or the minimum digital consent age in your country) and able to enter into a binding agreement.`
  },
  {
    title: '2. Description of Service',
    content: `ToolsRift provides 1,600+ free online utility tools across 23 categories — calculators, converters, generators, formatters, and creative tools. All tools are accessible without registration and run entirely inside your web browser.

The Service is provided "as-is" and "as available". We may add, modify, suspend, or remove tools at any time without notice.`
  },
  {
    title: '3. Acceptable Use',
    content: `You agree to use ToolsRift only for lawful purposes. You agree NOT to:

- Use the Service to process or generate content that is illegal, defamatory, harassing, or infringes any third party's rights.
- Attempt to gain unauthorized access to the Service, its systems, or other users' devices.
- Use automated scripts, bots, or scrapers that place a disproportionate load on the Service.
- Reverse engineer, decompile, or attempt to extract source code beyond what is publicly served to your browser.
- Reuse, mirror, or redistribute the Service or its components without our written permission.
- Use the Service to bypass paywalls or violate the terms of any other party.

We reserve the right to block or rate-limit users who violate these terms.`
  },
  {
    title: '4. Your Content',
    content: `ToolsRift processes input you provide (text, files, numbers, options) entirely in your browser. We do not see, store, or transmit your content. You retain all rights to the content you input and to the output the tools produce.

Because processing is local, you are responsible for the content you choose to process and for ensuring you have the right to do so. We accept no responsibility for the legality or accuracy of the data you input or for any consequences of relying on the output.`
  },
  {
    title: '5. Intellectual Property',
    content: `The ToolsRift name, logo, branding, design, code, and content (other than user-input data and tool output) are the intellectual property of ToolsRift and its licensors.

You may not copy, reproduce, or create derivative works of ToolsRift's branding or proprietary code without prior written consent. The free use of tools does not grant any license to our brand or codebase.

Open-source dependencies used by ToolsRift remain governed by their respective licenses.`
  },
  {
    title: '6. Advertisements',
    content: `ToolsRift is supported by display advertising, including but not limited to Google AdSense. Ads may be served on tool pages, category pages, and the homepage.

We do not endorse the content of any third-party advertisement. Clicking an ad takes you to a third-party site governed by that site's own terms and policies. We are not responsible for any goods, services, or content provided by advertisers.`
  },
  {
    title: '7. Disclaimer of Warranties',
    content: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- Merchantability, fitness for a particular purpose, or non-infringement
- Accuracy, completeness, or reliability of any tool output
- Uninterrupted availability or freedom from errors, viruses, or bugs

In particular, financial calculators (EMI, SIP, tax, retirement) and health calculators (BMI, BMR, TDEE, calorie) are provided for educational use only. They are NOT financial, medical, or professional advice. See our Disclaimer page for details.`
  },
  {
    title: '8. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL TOOLSRIFT, ITS OPERATORS, OR ITS CONTRIBUTORS BE LIABLE FOR:

- Any indirect, incidental, special, consequential, punitive, or exemplary damages
- Loss of profits, revenue, data, goodwill, or other intangible losses
- Damages arising from your use of, or inability to use, the Service
- Damages arising from any third-party content, including advertisements

Our total cumulative liability, regardless of the cause, shall not exceed the greater of (a) the amount you paid to use the Service in the past 12 months (which is zero for free users) or (b) ₹500 INR.`
  },
  {
    title: '9. Indemnification',
    content: `You agree to indemnify and hold harmless ToolsRift, its operators, and contributors from any claims, damages, losses, liabilities, and expenses (including reasonable legal fees) arising from:

- Your violation of these Terms
- Your misuse of the Service
- Your violation of any third-party rights through your use of the Service`
  },
  {
    title: '10. Termination',
    content: `You may stop using ToolsRift at any time. No account exists to terminate.

We reserve the right to suspend or terminate access to the Service for any user who violates these Terms, at our sole discretion and without notice.

Provisions that by their nature should survive termination (intellectual property, disclaimers, limitation of liability, indemnification, and governing law) will continue in effect after termination.`
  },
  {
    title: '11. Changes to These Terms',
    content: `We may update these Terms from time to time to reflect changes in our service, legal requirements, or business practices. Material changes will be reflected by updating the "Last Updated" date at the top of this page.

By continuing to use ToolsRift after changes are posted, you accept the updated Terms. If you do not agree with the changes, you must stop using the Service.`
  },
  {
    title: '12. Governing Law & Jurisdiction',
    content: `These Terms are governed by the laws of India, without regard to its conflict of law provisions. Any dispute arising from or relating to your use of ToolsRift will be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana, India.

If you reside outside India, you may also have rights under your local consumer protection laws that cannot be limited by contract — those rights are not affected by these Terms.`
  },
  {
    title: '13. Contact',
    content: `Questions about these Terms? Reach us at:

- Email: hello@toolsrift.com
- Location: Hyderabad, India
- Web: https://toolsrift.com

We aim to respond to all good-faith enquiries within five business days.`
  },
]

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service | ToolsRift</title>
        <meta name="description" content="ToolsRift Terms of Service — acceptable use, intellectual property, limitation of liability, and governing law for our free online tools platform." />
        <meta property="og:title" content="Terms of Service | ToolsRift" />
        <meta property="og:description" content="Terms of Service for ToolsRift — the rules of the road for using our 1,600+ free online tools." />
        <meta property="og:url" content="https://toolsrift.com/terms" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <link rel="canonical" href="https://toolsrift.com/terms" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "Terms of Service" }
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
            <span style={{ color: C.muted }}>Terms of Service</span>
          </nav>

          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Legal Document
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.2 }}>
              Terms of Service
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 12px' }}>
              These Terms govern your use of ToolsRift — what you can do with the Service, what we promise (and don't promise), and what happens if things go wrong. Please read them carefully.
            </p>
            <p style={{ fontSize: 13, color: C.dim }}>
              Last Updated: May 2026 &nbsp;·&nbsp; Effective Date: May 2026 &nbsp;·&nbsp; Jurisdiction: Hyderabad, India
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

          <div style={{ marginTop: 12, padding: '20px 22px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.18)', borderRadius: 12 }}>
            <div style={{ fontSize: 13.5, color: '#A5B4FC', lineHeight: 1.7 }}>
              <strong style={{ color: C.text }}>Related:</strong>{' '}
              <a href="/privacy-policy" style={{ color: '#A5B4FC' }}>Privacy Policy</a> ·{' '}
              <a href="/cookie-policy" style={{ color: '#A5B4FC' }}>Cookie Policy</a> ·{' '}
              <a href="/disclaimer" style={{ color: '#A5B4FC' }}>Disclaimer</a>
            </div>
          </div>
        </div>

        <footer style={{ borderTop: `1px solid ${C.borderLight}`, padding: '28px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {[['Home','/'],['Privacy Policy','/privacy-policy'],['Cookie Policy','/cookie-policy'],['Disclaimer','/disclaimer'],['About','/about']].map(([n,h]) => (
              <a key={h} href={h} style={{ color: C.dim, textDecoration: 'none' }}>{n}</a>
            ))}
          </div>
          <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
        </footer>

      </div>
    </>
  )
}
