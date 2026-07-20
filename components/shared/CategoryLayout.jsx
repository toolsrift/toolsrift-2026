// ── ToolsRift CategoryLayout (v3 — pro redesign May 2026) ───────────────────
// Compact header + compact category banner + clean footer.
// Replaces the previous oversized hero with a SmallSEOTools / Linear-style
// professional layout that gets users to the tools fast.
//
// Editing this single file updates every tool category page in the project.

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, FS, MQ, RADIUS, SPRING } from '../../lib/designTokens';
import { FadeUp, BlurUp, Stagger, StaggerItem, CountUp, GradientBlob, ParticlesField } from './motion';
import { SITE_FEATURES } from '../../lib/siteFeatures';
import SiteFooter from '../SiteFooter';
import { groupTools } from './ToolNavSidebar';
import { resolveIcon } from '../../lib/toolIcons';

// ── "All <category> tools" mega-menu ────────────────────────────────────────
// Every tool in the category, grouped by subcategory — reachable from the header
// of any page in the category. Opens on hover (desktop) and on click/keyboard.
function ToolsMegaMenu({ theme, tools, subcats }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  if (!tools?.length) return null;
  const groups = groupTools(tools, subcats);

  const openNow  = () => { clearTimeout(closeTimer.current); setOpen(true); };
  const closeSoon = () => { closeTimer.current = setTimeout(() => setOpen(false), 120); };

  const go = (e, id) => {
    if (typeof window === 'undefined') return;
    setOpen(false);
    if (window.location.pathname !== theme.pageRoute) return; // let the browser navigate
    e.preventDefault();
    window.scrollTo(0, 0);
    window.location.hash = `#/tool/${id}`;
    window.dispatchEvent(new Event('hashchange'));
  };

  return (
    <div
      className="tr-megamenu"
      style={{ position: 'relative', display: 'none' }}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, fontFamily: theme.fonts.body,
          color: open ? theme.color : COLORS.muted,
          padding: '8px 0', minHeight: 40, transition: 'color .15s',
        }}
      >
        All {theme.name}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} style={{ fontSize: 9 }}>▼</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 'min(860px, 92vw)',
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: RADIUS.lg,
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              padding: 20, zIndex: 200,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px 24px',
              maxHeight: '72vh', overflowY: 'auto',
            }}
          >
            {groups.map(g => (
              <div key={g.id || 'flat'}>
                {g.name && (
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: COLORS.faint,
                    fontFamily: theme.fonts.body, marginBottom: 8,
                  }}>
                    {g.name}
                  </div>
                )}
                {g.tools.map(t => (
                  <a
                    key={t.id}
                    href={`${theme.pageRoute}#/tool/${t.id}`}
                    onClick={e => go(e, t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: RADIUS.sm,
                      textDecoration: 'none', color: COLORS.muted,
                      fontSize: 13, fontFamily: theme.fonts.body,
                      transition: 'background .12s, color .12s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = theme.tint12;
                      e.currentTarget.style.color = COLORS.textBright;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = COLORS.muted;
                    }}
                  >
                    <span aria-hidden style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0 }}>
                      {resolveIcon(t, theme)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  </a>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media ${MQ.lg}{.tr-megamenu{display:block!important}}`}</style>
    </div>
  );
}

// ── Sticky top nav (single line, no decorative animations) ──────────────────
function CategoryHeader({ theme, tools, subcats }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 28px)',
        background: scrolled ? 'rgba(6,9,15,0.92)' : 'rgba(6,9,15,0.75)',
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
        transition: 'background 0.25s, border-color 0.25s',
        fontFamily: theme.fonts.body,
      }}
    >
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img src="/logo.svg" alt="ToolsRift" style={{ height: 28, display: 'block' }} />
        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 16, fontWeight: 300 }}>/</span>
        <span style={{
          fontSize: 14, fontWeight: 600,
          color: COLORS.text,
          fontFamily: theme.fonts.head,
          letterSpacing: '-0.01em',
        }}>
          {theme.name}
        </span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <ToolsMegaMenu theme={theme} tools={tools} subcats={subcats} />
        <a
          href="/"
          className="tr-hide-on-mobile"
          style={{
            fontSize: 13, color: COLORS.muted, textDecoration: 'none', fontWeight: 500,
            display: 'none',
          }}
        >
          All categories
        </a>
        <span style={{
          fontSize: 12, fontWeight: 700,
          padding: '5px 10px',
          borderRadius: 999,
          background: `${theme.color}15`,
          color: theme.color,
          letterSpacing: '0.04em',
          fontFamily: theme.fonts.body,
        }}>
          {theme.toolCount} tools
        </span>
        <style>{`@media ${MQ.sm}{.tr-hide-on-mobile{display:inline!important}}`}</style>
      </div>
    </header>
  );
}

// ── Animated category banner (PDF-type hero) ─────────────────────────────────
// Theme-driven: every category gets the same structure PdfPrivacyHero pioneered
// — badge, big headline, privacy figure, animated stats, site feature chips and
// a proof panel — generated from lib/categoryThemes.js. Honest for every
// category because every ToolsRift tool genuinely runs client-side (the same
// "100% Private" claim already made on the homepage's Why section). The proof
// panel deliberately scopes its claim to "your data is never uploaded" rather
// than "zero network requests", since a few utility tools (e.g. DNS lookup,
// currency conversion) legitimately fetch external reference data — that is
// not a privacy issue, so the wording stays true without needing a per-tool
// audit. A category can still swap this out for something fully bespoke via
// CategoryLayout's `banner` prop (PDF uses its own PdfPrivacyHero) — this is
// the shared, theme-driven default for the other 23.
const BANNER_CSS = `
.trb-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center}
.trb-fig{position:relative;height:300px}
.trb-card{animation:trbFloat 6s ease-in-out infinite}
@keyframes trbFloat{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(-4deg) translateY(-10px)}}
.trb-proof{display:grid;grid-template-columns:1fr 1fr}
.trb-stats{display:flex;flex-wrap:wrap;gap:clamp(18px,4vw,36px);margin-top:28px}
@media (max-width:820px){
  .trb-grid{grid-template-columns:1fr}
  .trb-fig{height:260px;margin-top:8px}
  .trb-proof{grid-template-columns:1fr}
  .trb-devtools{border-left:none!important;border-top:1px solid rgba(255,255,255,0.08)}
}
@media (prefers-reduced-motion:reduce){.trb-card{animation:none}}
`;

function CategoryBanner({ theme }) {
  const accent = theme.accent2 || theme.colorDark || theme.color;
  const stats = [
    { v: theme.toolCount, suffix: '', label: 'Tools' },
    { v: 100, suffix: '%', label: 'Free' },
    { v: 0, suffix: '', label: 'Signups' },
  ];

  return (
    <section
      style={{
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(56px, 8vw, 96px) clamp(20px, 4vw, 32px)',
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: BANNER_CSS }} />

      {/* Ambient background, tinted per category */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GradientBlob color={theme.tint25} color2={theme.tint03} size={520} x="68%" y="-18%" delay={0.1} opacity={0.5} />
        <GradientBlob color={theme.tint12} color2={theme.tint03} size={380} x="-6%" y="45%" delay={0.3} opacity={0.35} />
        <ParticlesField color="rgba(255,255,255,0.28)" count={16} />
      </div>

      {/* subtle accent line at bottom */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: 0, right: 0, bottom: -1, height: 1, zIndex: 1,
          background: `linear-gradient(90deg, transparent, ${theme.color}88, transparent)`,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' }}>
        <div className="trb-grid">
          <div>
            <BlurUp>
              <motion.div
                whileHover={{ scale: 1.04 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: theme.tint12, border: `1px solid ${theme.tint25}`,
                  color: accent, borderRadius: 999, padding: '7px 16px',
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                  fontFamily: theme.fonts.body, marginBottom: 18,
                }}
              >
                <span aria-hidden style={{ fontSize: 13 }}>{theme.icon}</span>
                <CountUp to={theme.toolCount} suffix="+" /> {theme.name} · 100% In-Browser
              </motion.div>
            </BlurUp>

            <FadeUp delay={0.1}>
              {/* h2, not h1 — CategoryContent renders the page's one canonical SEO <h1> further down */}
              <h2
                style={{
                  fontFamily: theme.fonts.head, fontWeight: 800,
                  fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.12, letterSpacing: '-0.02em',
                  color: COLORS.textBright, margin: '0 0 16px',
                }}
              >
                Your data never leaves this tab.
              </h2>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p
                style={{
                  fontFamily: theme.fonts.body, fontSize: 15, color: COLORS.muted,
                  lineHeight: 1.7, maxWidth: '40ch', margin: 0,
                }}
              >
                {theme.tagline || theme.description} Every tool in this category runs entirely in your browser — no account, no uploads, no exceptions.
              </p>
            </FadeUp>

            {/* Animated stat row */}
            <FadeUp delay={0.3}>
              <div className="trb-stats">
                {stats.map((s, i) => (
                  <div key={i} style={{ textAlign: 'left', minWidth: 60 }}>
                    <div
                      style={{
                        fontSize: 24, fontWeight: 800, fontFamily: theme.fonts.head, letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg,#fff,#94A3B8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}
                    >
                      <CountUp to={s.v} suffix={s.suffix} />
                    </div>
                    <div style={{ color: COLORS.dim, fontSize: 10.5, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Site-wide feature chips */}
            <Stagger gap={0.05} delay={0.4} style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              {SITE_FEATURES.map((f, i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={SPRING.smooth}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px 8px 8px', background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${COLORS.borderLight}`, borderRadius: 999,
                    }}
                  >
                    <span aria-hidden style={{ width: 26, height: 26, borderRadius: '50%', background: theme.tint12, display: 'grid', placeItems: 'center', fontSize: 13 }}>
                      {f.icon}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text, fontFamily: theme.fonts.body }}>{f.title}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {/* Privacy figure — generic device + cloud + severed-network visual, theme-tinted */}
          <FadeUp delay={0.25} className="trb-fig" aria-hidden="true">
            <div style={{ position: 'absolute', right: 6, top: 0, width: 110, textAlign: 'center', opacity: 0.5 }}>
              <svg viewBox="0 0 120 70" style={{ width: 110 }}><path d="M30 50h60a18 18 0 0 0 2-36 24 24 0 0 0-46-4 16 16 0 0 0-16 40z" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="5 5" /></svg>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: accent, marginTop: 2, fontWeight: 600 }}>server · unreached</div>
            </div>
            <div style={{ position: 'absolute', right: 80, top: 96, width: 140, height: 2, background: `repeating-linear-gradient(90deg,${theme.color} 0 8px,transparent 8px 16px)`, opacity: 0.7 }}>
              <span style={{ position: 'absolute', left: '50%', top: -14, transform: 'translateX(-50%)', width: 30, height: 30, borderRadius: '50%', background: COLORS.bg, border: `2px solid ${theme.color}`, display: 'grid', placeItems: 'center', color: accent, fontSize: 14, fontWeight: 700 }}>✕</span>
            </div>
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: 220, height: 230, borderRadius: 20, background: 'linear-gradient(180deg,#0F1626,#0A0F1A)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px -30px rgba(0,0,0,.8)' }}>
              <div style={{ height: 32, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px' }}>
                {[0, 1, 2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#2a3550' }} />)}
              </div>
            </div>
            <div
              className="trb-card"
              style={{
                position: 'absolute', left: 28, top: 56, width: 130, height: 150, borderRadius: 12,
                background: theme.gradient || `linear-gradient(135deg, ${theme.color}, ${theme.colorDark || theme.color})`,
                boxShadow: '0 20px 40px -14px rgba(0,0,0,.6)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 44 }}>{theme.icon}</span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {theme.name}
              </span>
            </div>
          </FadeUp>
        </div>

        {/* Proof panel */}
        <FadeUp delay={0.2}>
          <div className="trb-proof" style={{ marginTop: 40, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontFamily: theme.fonts.body }}>
                <span aria-hidden>🔒</span>Don&rsquo;t take our word for it
              </div>
              <h3 style={{ fontFamily: theme.fonts.head, fontWeight: 800, fontSize: 'clamp(20px,2.6vw,26px)', lineHeight: 1.2, margin: '0 0 12px', color: COLORS.textBright }}>
                Drop in and watch the network.
              </h3>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: COLORS.muted, lineHeight: 1.7, margin: 0 }}>
                Open DevTools &rarr; Network, then use any tool on this page. You&rsquo;ll see exactly how much of your data is uploaded: nothing. Every tool processes your input locally, right in this tab.
              </p>
            </div>
            <div className="trb-devtools" style={{ background: '#0A0D14', borderLeft: `1px solid ${COLORS.border}`, fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>
              <div style={{ display: 'flex', gap: 14, padding: '9px 16px', borderBottom: `1px solid ${COLORS.borderLight}`, color: COLORS.muted }}>
                <span style={{ color: COLORS.text, borderBottom: `2px solid ${theme.color}`, paddingBottom: 8, marginBottom: -10 }}>Network</span><span>Fetch/XHR</span><span>Uploads</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr .8fr .7fr .9fr', gap: 8, padding: '8px 16px', color: COLORS.muted, borderBottom: `1px solid ${COLORS.borderLight}`, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <span>Name</span><span>Method</span><span>Type</span><span>Size</span>
              </div>
              <div style={{ padding: '30px 16px', textAlign: 'center', color: COLORS.muted }}>
                <span style={{ fontSize: 34, color: '#34D399', fontFamily: theme.fonts.head, fontWeight: 800, display: 'block', marginBottom: 6 }}>0</span>
                bytes of your data uploaded while using {theme.name}
              </div>
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${COLORS.borderLight}`, color: '#34D399' }}>&#9679; Your data never leaves the device &mdash; nothing you enter is ever uploaded</div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function CategoryLayout({ theme, currentTool, tools, subcats, children, banner }) {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader theme={theme} tools={tools} subcats={subcats} />

      {/* `banner` lets a specific category (e.g. PDF) swap in a bespoke hero in
          place of the default compact banner. Omit the prop and every other
          category keeps the standard CategoryBanner — unaffected. */}
      {!currentTool && (banner || <CategoryBanner theme={theme} />)}

      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 32px)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </main>

      {/* Footer renders here ONLY on tool detail pages. On category LANDING
          pages the footer is rendered at the END of the server-side SEO block
          (CategoryContent) so it is never stranded above that content. */}
      {currentTool && <SiteFooter accent={theme.color} fonts={theme.fonts} />}
    </div>
  );
}
