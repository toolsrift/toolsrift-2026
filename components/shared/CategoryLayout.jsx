// ── ToolsRift CategoryLayout (v3 — pro redesign May 2026) ───────────────────
// Compact header + compact category banner + clean footer.
// Replaces the previous oversized hero with a SmallSEOTools / Linear-style
// professional layout that gets users to the tools fast.
//
// Editing this single file updates every tool category page in the project.

import { useState, useEffect, useRef, useCallback } from 'react';
import { toolHref } from './toolLink';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { COLORS, FS, MQ, RADIUS, SPRING, EASE } from '../../lib/designTokens';
import { FadeUp, BlurUp, Stagger, StaggerItem, CountUp, GradientBlob, ParticlesField, WordReveal } from './motion';
import { SITE_FEATURES } from '../../lib/siteFeatures';
import SiteFooter from '../SiteFooter';
import { groupTools } from './ToolNavSidebar';
import { resolveIcon } from '../../lib/toolIcons';
import { isArticleOwnedByPage } from '../../lib/appRoute';
import { SITE, HUB_BASE } from '../../lib/sites';
import BrandBackdrop from '../site/BrandBackdrop';
import BrandLogo from '../site/BrandLogo';
import PrivacyFigure from './PrivacyFigure';

// ── "All <category> tools" panel ────────────────────────────────────────────
// Every tool in the category, grouped by subcategory, with a search box.
// One panel, two triggers in the header: the "All <category>" text (desktop,
// opens on hover) and the "<n> tools" chip (every screen size, opens on tap).
// On phones it is a full-height sheet under the header; from the `lg`
// breakpoint it becomes the familiar dropdown.
const PANEL_CSS = `
.tr-toolspanel{position:fixed;left:0;right:0;top:60px;bottom:0;z-index:200;display:flex;flex-direction:column;overflow:hidden;border-top:1px solid rgba(255,255,255,0.08)}
.tr-toolspanel-body{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 32px;display:grid;grid-template-columns:1fr;gap:18px 24px;align-content:start}
.tr-toolspanel-head{display:flex;align-items:center;gap:10px;padding:12px 16px 10px}
.tr-toolspanel-close{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#F1F5F9;font-size:18px;cursor:pointer}
.tr-toolspanel-search{flex:1;display:flex;align-items:center;gap:10px;height:42px;padding:0 14px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04)}
.tr-toolspanel-search input{flex:1;min-width:0;background:transparent;border:none;outline:none;color:#F8FAFC;font-size:15px;font-family:inherit}
.tr-megatrigger{display:none}
@media ${MQ.md}{.tr-toolspanel-body{grid-template-columns:repeat(2,1fr)}}
@media ${MQ.lg}{
  .tr-megatrigger{display:inline-flex}
  .tr-toolspanel{position:absolute;top:100%;left:auto;right:clamp(16px,4vw,28px);bottom:auto;margin-top:8px;width:min(860px,92vw);max-height:72vh;border-radius:${RADIUS.lg}px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 24px 60px rgba(0,0,0,0.5)}
  .tr-toolspanel-body{grid-template-columns:repeat(auto-fit,minmax(180px,1fr));padding:8px 20px 20px}
  .tr-toolspanel-close{display:none}
}
`;

function ToolsPanel({ theme, tools, subcats, open, onClose, onMouseEnter, onMouseLeave }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  // Escape closes; the phone sheet also locks page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const mobile = !window.matchMedia(MQ.lg).matches;
    const prev = document.body.style.overflow;
    if (mobile) document.body.style.overflow = 'hidden';
    if (mobile) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 220);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  useEffect(() => { if (!open) setQ(''); }, [open]);

  if (!tools?.length) return null;
  const needle = q.trim().toLowerCase();
  const groups = groupTools(
    needle ? tools.filter(t => (t.name || '').toLowerCase().includes(needle) || (t.desc || t.description || '').toLowerCase().includes(needle)) : tools,
    subcats,
  ).filter(g => g.tools.length);

  const go = (e, id) => {
    if (typeof window === 'undefined') return;
    onClose();
    if (window.location.pathname !== theme.pageRoute) return; // let the browser navigate
    e.preventDefault();
    window.scrollTo(0, 0);
    window.location.hash = `#/tool/${id}`;
    window.dispatchEvent(new Event('hashchange'));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="panel"
          className="tr-toolspanel"
          role="dialog"
          aria-label={`All ${theme.name}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: EASE.snap }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{ background: COLORS.navBgSolid, backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)', fontFamily: theme.fonts.body }}
        >
          <div className="tr-toolspanel-head">
            <div className="tr-toolspanel-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={q ? theme.color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} placeholder={`Search ${tools.length} ${theme.name.toLowerCase()}…`} aria-label="Search tools" />
              {q && <button onClick={() => setQ('')} aria-label="Clear" style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: COLORS.muted, width: 24, height: 24, borderRadius: '50%', cursor: 'pointer' }}>×</button>}
            </div>
            <button className="tr-toolspanel-close" onClick={onClose} aria-label="Close">×</button>
          </div>

          <div className="tr-toolspanel-body">
            {groups.length === 0 && (
              <div style={{ color: COLORS.muted, fontSize: 14, padding: '24px 4px' }}>No tools match “{q}”.</div>
            )}
            {groups.map((g, gi) => (
              <motion.div
                key={g.id || 'flat'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(gi * 0.04, 0.3), ease: EASE.snap }}
              >
                {g.name && (
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: theme.color,
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {g.name}
                    <span style={{ color: COLORS.faint, fontWeight: 600, letterSpacing: 0 }}>{g.tools.length}</span>
                  </div>
                )}
                {g.tools.map(t => (
                  <a
                    key={t.id}
                    href={toolHref(theme, t.id)}
                    onClick={e => go(e, t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: RADIUS.sm, minHeight: 42,
                      textDecoration: 'none', color: COLORS.text,
                      fontSize: 14, fontFamily: theme.fonts.body,
                      transition: 'background .12s, color .12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme.tint12; e.currentTarget.style.color = COLORS.textBright; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.text; }}
                  >
                    <span aria-hidden style={{ fontSize: 14, width: 26, height: 26, borderRadius: 7, background: theme.tint12, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {resolveIcon(t, theme)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  </a>
                ))}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Scroll progress — hairline under the header that fills as you read ──────
function ScrollProgress({ color }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
        transformOrigin: '0 50%', scaleX,
        background: `linear-gradient(90deg, ${color}, ${color}66)`,
        boxShadow: `0 0 12px ${color}88`,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Sticky top nav ──────────────────────────────────────────────────────────
function CategoryHeader({ theme, tools, subcats }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const hoverOpenedAt = useRef(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside closes the desktop dropdown.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const hoverOpen  = () => {
    if (typeof window !== 'undefined' && !window.matchMedia(MQ.hover).matches) return; // touch: tap only
    clearTimeout(closeTimer.current); hoverOpenedAt.current = Date.now(); setOpen(true);
  };
  const hoverClose = () => {
    if (typeof window !== 'undefined' && !window.matchMedia(MQ.lg).matches) return;   // phone sheet: explicit close only
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };
  const toggle = () => {
    if (Date.now() - hoverOpenedAt.current < 350) return; // the hover just opened it; don't bounce shut
    clearTimeout(closeTimer.current);
    setOpen(o => !o);
  };
  const close = useCallback(() => setOpen(false), []);

  const hasTools = !!tools?.length;

  // The panel lives OUTSIDE <header>: its backdrop-filter would otherwise make
  // the 60px header the containing block of the phone sheet's position:fixed.
  return (
    <div ref={wrapRef} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
    <header
      style={{
        position: 'relative',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 28px)',
        background: scrolled ? COLORS.navBgSolid : COLORS.navBgSoft,
        backdropFilter: 'blur(14px) saturate(140%)',
        WebkitBackdropFilter: 'blur(14px) saturate(140%)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)'}`,
        transition: 'background 0.25s, border-color 0.25s',
        fontFamily: theme.fonts.body,
      }}
    >
      <style>{PANEL_CSS}</style>
      <style>{`@media ${MQ.sm}{.tr-hide-on-mobile{display:inline!important}}`}</style>

      {theme.isSiteRoot ? (
        // Standalone network site: the ToolsRift badge in the site's colour + "ToolsRift <Category>".
        <BrandLogo size={32} />
      ) : (
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
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }} onMouseLeave={hoverClose}>
        {hasTools && (
          <button
            className="tr-megatrigger"
            onMouseEnter={hoverOpen}
            onClick={toggle}
            aria-expanded={open}
            aria-haspopup="dialog"
            style={{
              alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, fontFamily: theme.fonts.body,
              color: open ? theme.color : COLORS.muted,
              padding: '8px 0', minHeight: 40, transition: 'color .15s',
            }}
          >
            All {theme.name}
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} style={{ fontSize: 9 }}>▼</motion.span>
          </button>
        )}
        <a
          href={theme.isSiteRoot ? `${HUB_BASE}/` : '/'}
          className="tr-hide-on-mobile"
          rel={theme.isSiteRoot ? 'noopener' : undefined}
          style={{
            fontSize: 13, color: COLORS.muted, textDecoration: 'none', fontWeight: 500,
            display: 'none',
          }}
        >
          {theme.isSiteRoot ? 'ToolsRift network' : 'All categories'}
        </a>
        <motion.button
          onClick={hasTools ? toggle : undefined}
          aria-expanded={hasTools ? open : undefined}
          aria-haspopup={hasTools ? 'dialog' : undefined}
          aria-label={`Browse all ${theme.toolCount} ${theme.name.toLowerCase()}`}
          whileTap={{ scale: 0.94 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
            padding: '7px 12px', minHeight: 34,
            borderRadius: 999,
            background: open ? theme.color : `${theme.color}15`,
            color: open ? (theme.textOnColor || '#fff') : theme.color,
            border: `1px solid ${open ? theme.color : `${theme.color}33`}`,
            letterSpacing: '0.04em',
            fontFamily: theme.fonts.body,
            cursor: hasTools ? 'pointer' : 'default',
            transition: 'background .2s, color .2s, border-color .2s',
            '--tr-chip-glow': `${theme.color}55`,
            animation: hasTools && !open ? 'tr-chipPulse 2.4s ease-out 1.2s 2' : 'none',
          }}
        >
          {theme.toolCount} tools
          {hasTools && (
            <motion.svg animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} width="10" height="10" viewBox="0 0 10 10" aria-hidden><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></motion.svg>
          )}
        </motion.button>
      </div>

      <ScrollProgress color={theme.color} />
    </header>
    {hasTools && (
      <ToolsPanel theme={theme} tools={tools} subcats={subcats} open={open} onClose={close} onMouseEnter={() => clearTimeout(closeTimer.current)} onMouseLeave={hoverClose} />
    )}
    </div>
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
.trb-fig{position:relative;display:flex;align-items:center;justify-content:center}
.trb-proof{display:grid;grid-template-columns:1fr 1fr}
.trb-stats{display:flex;flex-wrap:wrap;gap:clamp(18px,4vw,36px);margin-top:28px}
@media (max-width:820px){
  .trb-grid{grid-template-columns:1fr}
  .trb-fig{max-width:400px;margin:12px auto 0}
  .trb-proof{grid-template-columns:1fr}
  .trb-devtools{border-left:none!important;border-top:1px solid rgba(255,255,255,0.08)}
}
`;

function CategoryBanner({ theme }) {
  const accent = theme.accent2 || theme.colorDark || theme.color;
  // A standalone network site leads with its own design-concept headline
  // (lib/sites/brands.js → concept.headline / concept.sub).
  const concept = theme.brand && theme.brand.concept;
  const headline = (concept && concept.headline) || 'Your data never leaves this tab.';
  const sub = (concept && concept.sub)
    ? concept.sub
    : `${theme.tagline || theme.description} Every tool in this category runs entirely in your browser — no account, no uploads, no exceptions.`;
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

            {/* h2, not h1 — CategoryContent renders the page's one canonical SEO <h1> further down */}
            <WordReveal
              as="h2"
              text={headline}
              delay={0.1}
              style={{
                fontFamily: theme.fonts.head, fontWeight: 800,
                fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.12, letterSpacing: '-0.02em',
                color: COLORS.textBright, margin: '0 0 16px',
              }}
            />

            <FadeUp delay={0.2}>
              <p
                style={{
                  fontFamily: theme.fonts.body, fontSize: 15, color: COLORS.muted,
                  lineHeight: 1.7, maxWidth: '40ch', margin: 0,
                }}
              >
                {sub}
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

          {/* Privacy figure — device + cloud + severed upload line, theme-tinted, scales to any width */}
          <FadeUp delay={0.25} className="trb-fig" aria-hidden="true">
            <PrivacyFigure color={theme.color} accent={accent} bg={COLORS.bg} icon={theme.icon} label={theme.name} />
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
              <div style={{ padding: '10px 16px', borderTop: `1px solid ${COLORS.borderLight}`, color: '#34D399', display: 'flex', alignItems: 'center', gap: 10 }}><span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399', animation: 'tr-dotPulse 2s ease-out infinite', flexShrink: 0 }} />Your data never leaves the device &mdash; nothing you enter is ever uploaded</div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Tool ticker — every tool in the category glides past under the hero ─────
// Pauses on hover; each chip is a real link. The list is split in two rows
// running opposite ways so it reads as motion, not a marquee ad.
const TICKER_CSS = `
.tr-ticker{overflow:hidden;width:100%;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.tr-ticker-row{display:flex;gap:10px;width:max-content;padding:5px 0}
.tr-ticker-row.a{animation:tr-marquee var(--tr-ticker-dur,60s) linear infinite}
.tr-ticker-row.b{animation:tr-marqueeRev var(--tr-ticker-dur,60s) linear infinite}
.tr-ticker:hover .tr-ticker-row,.tr-ticker:focus-within .tr-ticker-row{animation-play-state:paused}
.tr-ticker-chip{display:inline-flex;align-items:center;gap:8px;padding:8px 14px 8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);color:#CBD5E1;font-size:13px;font-weight:600;text-decoration:none;white-space:nowrap;transition:background .15s,border-color .15s,color .15s,transform .15s}
.tr-ticker-chip:hover{color:#F8FAFC;transform:translateY(-2px)}
@media (prefers-reduced-motion:reduce){.tr-ticker-row{animation:none!important;flex-wrap:wrap;width:auto}}
`;

function ToolTicker({ theme, tools }) {
  if (!tools || tools.length < 6) return null;
  const half = Math.ceil(tools.length / 2);
  const rows = [tools.slice(0, half), tools.slice(half)];
  const go = (e, id) => {
    if (typeof window === 'undefined' || window.location.pathname !== theme.pageRoute) return;
    e.preventDefault();
    window.scrollTo(0, 0);
    window.location.hash = `#/tool/${id}`;
    window.dispatchEvent(new Event('hashchange'));
  };
  const chip = (t, k, dup = false) => (
    <a
      key={k}
      aria-hidden={dup || undefined}
      tabIndex={dup ? -1 : undefined}
      href={toolHref(theme, t.id)}
      onClick={e => go(e, t.id)}
      className="tr-ticker-chip"
      style={{ fontFamily: theme.fonts.body }}
      onMouseEnter={e => { e.currentTarget.style.background = theme.tint12; e.currentTarget.style.borderColor = theme.color; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <span aria-hidden style={{ width: 24, height: 24, borderRadius: 7, background: theme.tint12, display: 'grid', placeItems: 'center', fontSize: 12 }}>{resolveIcon(t, theme)}</span>
      {t.name}
    </a>
  );
  return (
    <div aria-label={`All ${theme.name}`} style={{ position: 'relative', zIndex: 1, padding: '14px 0 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <style>{TICKER_CSS}</style>
      <div className="tr-ticker" style={{ '--tr-ticker-dur': `${Math.max(40, half * 4.5)}s` }}>
        {rows.map((row, r) => (
          <div key={r} className={`tr-ticker-row ${r === 0 ? 'a' : 'b'}`}>
            {row.map((t, i) => chip(t, `${t.id}-${i}`))}
            {row.map((t, i) => chip(t, `${t.id}-dup-${i}`, true))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function CategoryLayout({ theme, currentTool, tools, subcats, children, banner }) {
  const [pageOwnsArticle, setPageOwnsArticle] = useState(false);
  useEffect(() => { setPageOwnsArticle(isArticleOwnedByPage()); }, [currentTool]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <BrandBackdrop />
      <CategoryHeader theme={theme} tools={tools} subcats={subcats} />

      {/* `banner` lets a specific category (e.g. PDF) swap in a bespoke hero in
          place of the default compact banner. Omit the prop and every other
          category keeps the standard CategoryBanner — unaffected. */}
      {!currentTool && (banner || <CategoryBanner theme={theme} />)}
      {!currentTool && <ToolTicker theme={theme} tools={tools} />}

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
        {/* Soft enter whenever the view switches (dashboard ↔ tool). */}
        <motion.div
          key={currentTool || '__dashboard'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: EASE.snap }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer renders here ONLY on tool detail pages reached by in-app hash
          navigation. On a /[slug]/[tool] URL the page server-renders both
          the article and the footer below this widget, so rendering one here too
          would show two. On category LANDING pages the footer comes from the end
          of the server-side SEO block (CategoryContent) so it is never stranded
          above that content. */}
      {currentTool && !pageOwnsArticle && <SiteFooter accent={theme.color} fonts={theme.fonts} />}
    </div>
  );
}
