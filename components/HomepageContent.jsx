import Head from 'next/head'
import SiteFooter from './SiteFooter'

const C = {
  bg: '#06090F',
  surface: '#0D1117',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  text: '#F1F5F9',
  muted: '#94A3B8',
  dim: '#64748B',
}

const PRINCIPLES = [
  { icon: '🔒', title: 'Privacy by default', body: 'Every tool runs in your browser. Files, text and data you process never leave your device — we have nothing to upload because there is no server to upload to.' },
  { icon: '⚡', title: 'Instant by design', body: 'No server round-trips means results appear the moment you stop typing. Calculations that take 200ms on a remote API take 2ms in your browser.' },
  { icon: '🆓', title: 'Free, forever', body: 'No daily limits, no paywalls, no Pro tier. The platform is supported by non-intrusive display ads. You get the tools; we keep the lights on. Fair trade.' },
  { icon: '🌐', title: 'Works everywhere', body: 'Mobile, tablet, desktop. Chrome, Safari, Firefox, Edge. Online or offline (once a tool is loaded). No installs, no extensions, no account.' },
  { icon: '🚀', title: 'Always growing', body: '947 tools today, 1,600+ planned. New tools added weekly based on user requests — email us what you wish existed and we will probably build it.' },
  { icon: '🛠️', title: 'Built by engineers', body: 'Every tool exists because we needed it ourselves. We use the same tools you do, which is why they actually solve real problems instead of demoing nicely.' },
]

const FAQS = [
  ['Is ToolsRift really completely free?', 'Yes. Every one of the 947+ tools is free with no daily limit, no sign-up, no paywall and no premium tier. ToolsRift is supported by non-intrusive display advertising — that is what funds the platform and lets us keep everything free for everyone, forever.'],
  ['Do I need to create an account?', 'No. ToolsRift has no accounts and no sign-up flow. Just open any tool and start using it. We deliberately collect zero personal information — no name, no email, no profile. The tools work the same whether it is your first visit or your thousandth.'],
  ['Are my files and data uploaded anywhere?', 'No. All ToolsRift tools run entirely in your browser using JavaScript and WebAssembly. Files you process — PDFs, images, text, JSON, code — never leave your device. You can verify this by opening DevTools → Network and watching that no upload requests are made when you use any tool.'],
  ['How does ToolsRift make money?', 'Display advertising, primarily through Google AdSense. Ads appear on category pages and tool pages but are kept non-intrusive (no auto-play video, no pop-ups, no interstitials). That advertising revenue is what funds development of new tools and keeps everything free.'],
  ['Can I use ToolsRift outputs commercially?', 'Yes. There is no usage license on anything you produce with our tools. Generated passwords, converted files, formatted code, designed palettes, drafted documents — all of it is yours to use however you like, including in commercial work, client deliverables and paid products.'],
  ['Will the tools work offline?', 'Once a tool has loaded, most will keep working even if you lose your connection — because all the processing logic runs in your browser. You can save a tool page (Ctrl+S) for full offline use, since there is no server dependency.'],
  ['How often are new tools added?', 'New tools are added every week. The roadmap is largely driven by user requests, so the fastest way to influence what we build next is to email us what you wish existed: contact@toolsrift.com'],
  ['Where is ToolsRift based?', 'ToolsRift is built and operated from Hyderabad, India. We are a small team serving users worldwide. The platform is hosted on Vercel\'s global CDN for fast loading from anywhere.'],
]

export default function HomepageContent() {
  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(([q, a]) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
          }))
        })}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ToolsRift",
          "url": "https://toolsrift.com",
          "description": "ToolsRift offers 947+ free online tools across 23 categories — text, PDF, image, code, calculators, generators and more. Every tool runs in your browser. No sign-up.",
          "publisher": {
            "@type": "Organization",
            "name": "ToolsRift",
            "url": "https://toolsrift.com",
            "logo": "https://toolsrift.com/logo.svg"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://toolsrift.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}} />
      </Head>

      <section style={{
        background: C.bg,
        color: C.text,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        padding: '80px 0 24px',
        borderTop: `1px solid ${C.borderLight}`,
      }}>

        {/* WHAT IS TOOLSRIFT */}
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 64px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            About the platform
          </div>
          <h2 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 20px', lineHeight: 1.25 }}>
            What is ToolsRift?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.85, margin: '0 0 16px' }}>
            ToolsRift is a free online platform offering 947+ web-based tools across 23 categories — text processing, PDF manipulation, image editing, code formatting, color and design utilities, calculators for math, finance and health, unit converters, generators for passwords, QR codes and UUIDs, developer utilities like regex testers and JWT debuggers, and many more.
          </p>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.85, margin: '0 0 16px' }}>
            Every tool is designed to do exactly one job well — open the page, paste your input, get your result, copy or download it, close the tab. No sign-up. No upload. No tracking beyond aggregate anonymized analytics. Most tools update results live as you type, so there is no submit button to click for simple operations.
          </p>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.85, margin: 0 }}>
            We built ToolsRift because the simple online utilities we needed every day were spread across dozens of cluttered, ad-heavy, sign-up-required sites. ToolsRift consolidates them into a single fast, clean, privacy-respecting platform. It is free because display ads pay for it — a deliberate trade we make to keep the tools accessible to everyone.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px 64px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            How it works
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 32px', lineHeight: 1.25 }}>
            Three steps. Zero friction.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
            {[
              { num: '01', icon: '🔍', title: 'Find the tool', body: 'Browse 23 categories or use the search to find one of 947+ free tools. Each category page has rich descriptions, FAQs and use-case examples to help you pick the right one.' },
              { num: '02', icon: '⚡', title: 'Use it instantly', body: 'Click any tool to open it. No login, no install, no captcha. Most tools work the moment the page loads — type or paste input, see output update live.' },
              { num: '03', icon: '✅', title: 'Copy and go', body: 'Click the copy button or download the result. Your input stays in the tool for further iteration. Close the tab and nothing about your session remains on our side.' },
            ].map(s => (
              <div key={s.num} style={{ padding: '28px 24px', background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>{s.num}</div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* PRINCIPLES */}
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 64px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            What we stand for
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 32px', lineHeight: 1.25 }}>
            Six principles we won't compromise on
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {PRINCIPLES.map(p => (
              <div key={p.title} style={{ padding: '24px 22px', background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 14 }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: "'Sora', sans-serif", marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{p.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* WHY WE BUILT IT */}
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 64px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#EC4899', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            Our story
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 24px', lineHeight: 1.25 }}>
            Why we built ToolsRift
          </h2>
          <div style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 16, padding: 'clamp(28px,4vw,40px)' }}>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, margin: '0 0 18px' }}>
              Every day, millions of people search for simple online tools — a quick PDF merger, a word counter, a color converter, an EMI calculator. They land on sites that are slow, cluttered with auto-play video ads, require sign-ups for basic functionality, hide common features behind premium plans, or upload their files to a server with no clear retention policy.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, margin: '0 0 18px' }}>
              We were tired of it. So we started building the version of those tools we wanted — fast, clean, no sign-up, no upload, free forever. One tool became ten. Ten became a hundred. Today there are 947+ tools across 23 categories, and we are still adding more every week based on what people email us asking for.
            </p>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.85, margin: 0 }}>
              The model is simple: tools are free, processing is local, support is by email, and revenue comes from display ads that we work hard to keep unobtrusive. We are a small team based in Hyderabad, India, building tools we use ourselves every day. If you find something missing or broken, contact@toolsrift.com — we read every email.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px 64px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
            FAQ
          </div>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: C.text, fontFamily: "'Sora', sans-serif", margin: '0 0 24px', lineHeight: 1.25 }}>
            Frequently asked questions
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {FAQS.map(([q, a], i) => (
              <details key={i} style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: 12, overflow: 'hidden' }}>
                <summary style={{
                  padding: '18px 22px', fontSize: 15, fontWeight: 700, color: C.text,
                  fontFamily: "'Sora', sans-serif", cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                }}>
                  <span>{q}</span>
                  <span style={{ color: '#06B6D4', fontSize: 18 }}>+</span>
                </summary>
                <div style={{ padding: '0 22px 20px', fontSize: 14, color: C.muted, lineHeight: 1.85 }}>
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>

      </section>

      {/* Single site footer at the very bottom of the homepage (server-rendered). */}
      <SiteFooter />
    </>
  )
}
