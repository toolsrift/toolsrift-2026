import { FadeUp, BlurUp, Stagger, StaggerItem, CountUp, GradientBlob, ParticlesField, WordReveal, motion } from './shared/motion'
import PrivacyFigure from './shared/PrivacyFigure'
import { SITE } from '../lib/sites';
import { SPRING } from '../lib/designTokens'
import { SITE_FEATURES } from '../lib/siteFeatures'

const C = {
  // Site-aware: on pdf.toolsrift.com these are the brand's warm charcoal.
  bg: SITE.brand ? SITE.brand.palette.bg : '#06090F',
  surface: SITE.brand ? SITE.brand.palette.surface : '#0D1117',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  text: '#F1F5F9',
  muted: '#94A3B8',
  red: '#EF4444',
  redLight: '#F87171',
  emerald: '#34D399',
}

const STATS = [
  { v: 40, suffix: '', label: 'PDF Tools' },
  { v: 100, suffix: '%', label: 'Free' },
  { v: 0, suffix: '', label: 'Signups' },
  { v: 0, suffix: '%', label: 'Uploaded' },
]

// Static string — never changes, so injecting via <style> is hydration-safe.
const CSS = `
.pph-fig{position:relative;display:flex;align-items:center;justify-content:center}
.pph-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}
.pph-proof{display:grid;grid-template-columns:1fr 1fr}
.pph-stats{display:flex;flex-wrap:wrap;gap:clamp(18px,4vw,36px);margin-top:28px}
@media (max-width:820px){
  .pph-grid{grid-template-columns:1fr}
  .pph-fig{max-width:400px;margin:12px auto 0}
  .pph-proof{grid-template-columns:1fr}
  .pph-devtools{border-left:none!important;border-top:1px solid rgba(255,255,255,0.08)}
}
`

/**
 * PdfPrivacyHero — replaces the default CategoryBanner for the PDF category
 * only, via CategoryLayout's `banner` override prop (see shared/CategoryLayout.jsx).
 * The parent already gates rendering to non-tool-detail views (`!currentTool`),
 * so this component needs no visibility logic of its own. Uses the site's shared
 * motion primitives (components/shared/motion.jsx) for the same scroll-reveal /
 * count-up feel as the homepage, since the PDF category's animStyleId is 'cinematic'
 * (lib/categoryThemes.js) — the ambient blob + particle treatment homepage hero uses.
 */
export default function PdfPrivacyHero() {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: C.bg, color: C.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      borderBottom: `1px solid ${C.borderLight}`,
      padding: 'clamp(56px, 8vw, 96px) clamp(20px, 4vw, 32px)',
    }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Ambient cinematic background — matches the homepage hero's blob+particle treatment */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GradientBlob color="rgba(239,68,68,0.35)" color2="rgba(239,68,68,0.04)" size={520} x="65%" y="-15%" delay={0.1} opacity={0.5} />
        <GradientBlob color="rgba(248,113,113,0.25)" color2="rgba(248,113,113,0.03)" size={420} x="-8%" y="40%" delay={0.3} opacity={0.4} />
        <ParticlesField color="rgba(255,255,255,0.3)" count={18} />
      </div>

      {/* Headline + "document that stays" figure */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        <div className="pph-grid">
          <div>
            <BlurUp>
              <motion.div
                whileHover={{ scale: 1.04 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                  color: C.redLight, borderRadius: 999, padding: '7px 16px',
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  marginBottom: 18,
                }}
              >
                <span aria-hidden="true" style={{ fontSize: 13 }}>📄</span>
                <CountUp to={40} suffix="+" /> PDF Tools · 100% In-Browser
              </motion.div>
            </BlurUp>

            {/* h2, not h1 — CategoryContent renders the page's one canonical SEO <h1> further down */}
            <WordReveal as="h2" text="Your PDF never leaves this tab." delay={0.1} style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 'clamp(30px,4.5vw,44px)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 16px' }} />

            <FadeUp delay={0.2}>
              <p style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.75, maxWidth: '38ch', margin: 0 }}>
                Every tool below runs entirely on your device — no account, no upload, no exceptions. Your passport scans, tax returns and contracts are processed in the page you&rsquo;re already looking at.
              </p>
            </FadeUp>

            {/* Animated tool-count / trust stats */}
            <FadeUp delay={0.3}>
              <div className="pph-stats">
                {STATS.map((s, i) => (
                  <div key={i} style={{ textAlign: 'left', minWidth: 64 }}>
                    <div style={{
                      fontSize: 26, fontWeight: 800, fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em',
                      background: 'linear-gradient(135deg,#fff,#94A3B8)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                      <CountUp to={s.v} suffix={s.suffix} />
                    </div>
                    <div style={{ color: C.muted, fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Site-wide feature chips — same value props as the homepage's "Why ToolsRift" cards */}
            <Stagger gap={0.05} delay={0.4} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              {SITE_FEATURES.map((f, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={SPRING.smooth}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px 8px 8px', background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${C.borderLight}`, borderRadius: 999,
                    }}
                  >
                    <span aria-hidden="true" style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'rgba(239,68,68,0.12)', display: 'grid', placeItems: 'center', fontSize: 13,
                    }}>{f.icon}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{f.title}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <FadeUp delay={0.25} className="pph-fig" aria-hidden="true">
            <PrivacyFigure color={C.red} accent={C.redLight} bg={C.bg} label="tax-return.pdf" />
          </FadeUp>
        </div>
      </div>

      {/* Proof panel */}
      <FadeUp delay={0.15}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '40px auto 0' }}>
          <div className="pph-proof" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.redLight, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden="true">🔒</span>Don&rsquo;t take our word for it
              </div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 'clamp(24px,3vw,32px)', lineHeight: 1.15, margin: '0 0 16px' }}>
                Drop a file. Watch the network.
              </h2>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: 0 }}>
                Open DevTools &rarr; Network and filter for uploads, then drop your PDF onto any tool. You&rsquo;ll see exactly how much of your file is sent to a server to process it: nothing. Every operation runs as WebAssembly, locally.
              </p>
            </div>
            <div className="pph-devtools" style={{ background: '#0A0D14', borderLeft: `1px solid ${C.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 }}>
              <div style={{ display: 'flex', gap: 16, padding: '10px 16px', borderBottom: `1px solid ${C.borderLight}`, color: C.muted }}>
                <span style={{ color: C.text, borderBottom: `2px solid ${C.red}`, paddingBottom: 9, marginBottom: -11 }}>Network</span><span>Fetch/XHR</span><span>Uploads</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr .8fr .7fr .9fr', gap: 8, padding: '9px 16px', color: C.muted, borderBottom: `1px solid ${C.borderLight}`, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span>Name</span><span>Method</span><span>Type</span><span>Size</span>
              </div>
              <div style={{ padding: '30px 16px', textAlign: 'center', color: C.muted }}>
                <span style={{ fontSize: 38, color: C.emerald, fontFamily: "'Sora',sans-serif", fontWeight: 800, display: 'block', marginBottom: 6 }}>0</span>
                bytes of your PDF sent to any server while merging 40 pages
              </div>
              <div style={{ padding: '11px 16px', borderTop: `1px solid ${C.borderLight}`, color: C.emerald, display: 'flex', alignItems: 'center', gap: 10 }}><span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: C.emerald, animation: 'tr-dotPulse 2s ease-out infinite', flexShrink: 0 }} />Your file never leaves the device &mdash; no upload, no server round-trip</div>
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  )
}
