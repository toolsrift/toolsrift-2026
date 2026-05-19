import Head from 'next/head'

const C = {
  bg: '#06090F', surface: '#0D1117', border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)', text: '#F1F5F9', muted: '#94A3B8',
  dim: '#64748B', blue: '#3B82F6', navBg: 'rgba(6,9,15,0.92)',
}

const SECTIONS = [
  {
    title: '1. Educational Use Only',
    content: `ToolsRift's calculators, generators, and converters are provided for general informational, educational, and entertainment purposes. They are NOT intended as a substitute for professional advice from a qualified expert in any field.

The output of any tool on ToolsRift should not be relied upon for legal, financial, medical, tax, investment, engineering, or any other decision that materially affects your life, health, or finances. Always consult an appropriately qualified professional before acting on tool output.`
  },
  {
    title: '2. Financial Calculator Disclaimer',
    content: `Financial calculators on ToolsRift — including but not limited to EMI Calculator, SIP Calculator, Investment Return Calculator, Income Tax Calculator, Car Loan Calculator, Retirement Calculator, Future Value, Present Value, Savings Goal, Debt Payoff, and Credit Card Payoff calculators — are provided AS IS for educational purposes.

Important notes:

- Tax slabs and rates may change. We make reasonable efforts to keep slabs current, but you must verify rates with the relevant tax authority before filing.
- Loan calculations use standard reducing-balance formulas. Actual loan terms from a bank may differ due to processing fees, prepayment penalties, insurance requirements, or other charges not modeled here.
- Investment projections (SIP, lumpsum, compound interest) use the assumed rate you input. Real investment returns vary; past performance does not guarantee future results.
- Currency conversions, where applicable, use indicative rates and should not be used for actual remittance pricing.
- These calculators do NOT constitute financial advice, investment advice, or solicitation of any product. Consult a SEBI-registered investment adviser, chartered accountant, or qualified financial planner for personalized guidance.`
  },
  {
    title: '3. Health & Fitness Calculator Disclaimer',
    content: `Health and fitness calculators on ToolsRift — including but not limited to BMI Calculator, BMR Calculator, TDEE Calculator, Calorie Calculator, Body Fat Calculator, Ideal Weight Calculator, Macro Calculator, Protein Intake Calculator, Heart Rate Zones, VO2 Max, Pace Calculator, and Blood Pressure Classifier — are provided for educational purposes only.

Important notes:

- These calculators use published formulas (Mifflin-St Jeor, Harris-Benedict, US Navy method, etc.) that are population averages. Individual results vary based on body composition, genetics, medical conditions, medications, and life circumstances.
- The output is NOT a diagnosis. It is not a substitute for advice from a qualified healthcare provider, registered dietitian, certified personal trainer, or medical specialist.
- Do NOT use these calculators to self-diagnose, self-medicate, or replace prescribed treatment. If you have any health condition or are pregnant, breastfeeding, recovering from illness, or under medical supervision, consult your doctor before changing your diet, exercise, or lifestyle.
- The Blood Alcohol Calculator is a rough estimate based on averages. It does NOT determine whether you are legally fit to drive. Never drive after drinking. Real-world BAC varies widely based on individual factors.`
  },
  {
    title: '4. Accuracy of Tool Output',
    content: `We strive for accuracy in every tool, and most tools use well-known, standards-based algorithms. However, we make no warranty that the output is free of bugs, rounding errors, edge cases, or implementation flaws.

- Calculations may have floating-point precision limits inherent to JavaScript number representation.
- Conversion factors may be rounded to a finite number of decimal places.
- Some tools rely on heuristic detection (text language, MIME types, etc.) which may be incorrect for unusual inputs.

If you notice an error in a tool, please report it via hello@toolsrift.com and we will investigate and fix it. Until a fix is published, you must independently verify any output you rely on.`
  },
  {
    title: '5. No Professional Relationship',
    content: `Using ToolsRift does NOT create any professional relationship — attorney-client, doctor-patient, financial-adviser-client, or otherwise — between you and ToolsRift, its operators, or its contributors.

Any educational content, FAQ entries, or how-to descriptions on ToolsRift are general in nature and do not address your specific circumstances.`
  },
  {
    title: '6. Third-Party Content',
    content: `ToolsRift may display advertisements served by Google AdSense or other ad networks. We do not endorse, verify, or take responsibility for any advertised product, service, or claim.

Links to external websites are provided for convenience. We do not control the content, accuracy, privacy practices, or terms of use of any third-party site. Use them at your own discretion.

Boilerplate content generators (privacy policies, terms of service, cookie banners, etc.) on ToolsRift produce STARTING POINTS based on common templates. They are NOT a substitute for review by a qualified lawyer in your jurisdiction.`
  },
  {
    title: '7. Limitation of Liability',
    content: `To the maximum extent permitted by law, ToolsRift and its operators are NOT liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of any tool, including but not limited to:

- Financial loss based on calculator output
- Health consequences from following calculator results
- Tax penalties or audit findings based on tax estimates
- Damages from third-party advertised products
- Time lost or work redone due to tool errors

You use ToolsRift's tools at your own risk and discretion. By using the Service, you agree to these limits.

See also our Terms of Service for the full limitation of liability clause.`
  },
  {
    title: '8. Contact',
    content: `Spotted an error? Have a question about a specific calculation? We want to know.

- Email: hello@toolsrift.com
- Subject line tip: include the tool name (e.g., "Bug — TDEE Calculator")
- We aim to respond within five business days.`
  },
]

export default function Disclaimer() {
  return (
    <>
      <Head>
        <title>Disclaimer | ToolsRift</title>
        <meta name="description" content="ToolsRift Disclaimer — finance and health calculators are educational only and not professional advice. Always consult a qualified professional." />
        <meta property="og:title" content="Disclaimer | ToolsRift" />
        <meta property="og:description" content="Educational-use disclaimer for ToolsRift's finance, health, and other calculators — not a substitute for professional advice." />
        <meta property="og:url" content="https://toolsrift.com/disclaimer" />
        <meta property="og:site_name" content="ToolsRift" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:image" content="https://toolsrift.com/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://toolsrift.com/og-image.svg" />
        <link rel="canonical" href="https://toolsrift.com/disclaimer" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
            { "@type": "ListItem", "position": 2, "name": "Disclaimer" }
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
            <span style={{ color: C.muted }}>Disclaimer</span>
          </nav>

          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#F472B6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Legal Document
            </div>
            <h1 style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 16px', lineHeight: 1.2 }}>
              Disclaimer
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: '0 0 12px' }}>
              ToolsRift's tools — especially finance and health calculators — are for educational use only. They are not professional advice. Always consult a qualified professional before making important decisions based on tool output.
            </p>
            <p style={{ fontSize: 13, color: C.dim }}>
              Last Updated: May 2026 &nbsp;·&nbsp; Effective Date: May 2026
            </p>
          </div>

          <div style={{ marginBottom: 36, padding: '18px 22px', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.25)', borderRadius: 12 }}>
            <div style={{ fontSize: 14, color: '#F472B6', fontWeight: 700, marginBottom: 6 }}>⚠ At a glance</div>
            <div style={{ fontSize: 13.5, color: C.text, lineHeight: 1.7 }}>
              ToolsRift is a free, ad-supported toolkit. Our calculators, generators, and converters give you a quick answer — but a quick answer is not the same as a correct answer for YOUR specific situation. Verify before you act.
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

          <div style={{ marginTop: 12, padding: '20px 22px', background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.18)', borderRadius: 12 }}>
            <div style={{ fontSize: 13.5, color: '#F472B6', lineHeight: 1.7 }}>
              <strong style={{ color: C.text }}>Related:</strong>{' '}
              <a href="/terms" style={{ color: '#F472B6' }}>Terms of Service</a> ·{' '}
              <a href="/privacy-policy" style={{ color: '#F472B6' }}>Privacy Policy</a> ·{' '}
              <a href="/cookie-policy" style={{ color: '#F472B6' }}>Cookie Policy</a>
            </div>
          </div>
        </div>

        <footer style={{ borderTop: `1px solid ${C.borderLight}`, padding: '28px 24px', textAlign: 'center', color: C.dim, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
            {[['Home','/'],['Terms','/terms'],['Privacy Policy','/privacy-policy'],['Cookie Policy','/cookie-policy'],['About','/about']].map(([n,h]) => (
              <a key={h} href={h} style={{ color: C.dim, textDecoration: 'none' }}>{n}</a>
            ))}
          </div>
          <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
        </footer>
      </div>
    </>
  )
}
