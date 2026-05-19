// ── ToolsRift CategoryLayout (v2) ────────────────────────────────────────────
// Uses the upgraded theme registry (tint25, bgRadial, fonts, anim)
// and shared motion + ui primitives. Each category renders as its own
// micro-brand with a unique themed hero, sticky nav, and footer.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COLORS, MQ } from '../../lib/designTokens';
import { Pill } from './ui';
import CategoryLogo from './CategoryLogo';

// ── Sticky themed header ────────────────────────────────────────────────────
// Layout: [ToolsRift logo • brand] ······· [CategoryLogo lockup • tool-count pill]
function CategoryHeader({ theme }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        minHeight: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12,
        padding: '10px clamp(14px, 4vw, 28px)',
        background: `rgba(6,9,15,${scrolled ? 0.95 : 0.7})`,
        backdropFilter: `blur(${scrolled ? 18 : 12}px) saturate(140%)`,
        WebkitBackdropFilter: `blur(${scrolled ? 18 : 12}px) saturate(140%)`,
        borderBottom: `1px solid ${scrolled ? theme.tint25 : 'rgba(255,255,255,0.04)'}`,
        transition: 'background 0.25s, border-color 0.25s',
        fontFamily: theme.fonts.body,
      }}
    >
      {/* LEFT: ToolsRift master brand (logo image + wordmark) */}
      <a
        href="/"
        aria-label="ToolsRift — home"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', minWidth: 0,
        }}
      >
        <motion.img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          width={120}
          height={32}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: 32, width: 'auto', display: 'block',
            filter: `drop-shadow(0 2px 8px ${theme.tint25})`,
          }}
        />
        <span
          className="tr-hide-on-mobile"
          style={{
            display: 'none',
            color: 'rgba(255,255,255,0.16)', fontSize: 16, lineHeight: 1,
          }}
        >›</span>
        <span
          className="tr-hide-on-mobile"
          style={{
            display: 'none',
            fontFamily: theme.fonts.head,
            fontSize: 13, fontWeight: 700,
            color: COLORS.muted, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          {theme.name}
        </span>
      </a>

      {/* RIGHT: per-category logo lockup + tool count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
        <a
          href={theme.pageRoute || '#/'}
          aria-label={`${theme.name} — category home`}
          style={{
            display: 'inline-flex', alignItems: 'center', textDecoration: 'none',
            minWidth: 0,
          }}
        >
          <CategoryLogo theme={theme} size={38} variant="lockup" />
        </a>
        <span className="tr-hide-on-mobile" style={{ display: 'none' }}>
          <Pill theme={theme} variant="tint">{theme.toolCount} tools</Pill>
        </span>
      </div>

      <style>{`@media ${MQ.md}{.tr-hide-on-mobile{display:inline-flex!important}}`}</style>
    </motion.header>
  );
}

// (CategoryHero removed — PremiumCategoryLanding now owns the hero so categories
//  only render ONE hero. The old big-emoji + 3-pill triplet design has been
//  merged into PremiumHero in components/shared/PremiumCategoryLanding.jsx.)

// ── Footer ──────────────────────────────────────────────────────────────────
function CategoryFooter({ theme }) {
  const links = [
    { label: 'All Categories', href: '/' },
    { label: 'About',          href: '/about' },
    { label: 'Roadmap',        href: '/roadmap' },
    { label: 'Privacy',        href: '/privacy-policy' },
    { label: 'Terms',          href: '/terms' },
    { label: 'Cookies',        href: '/cookie-policy' },
    { label: 'Disclaimer',     href: '/disclaimer' },
  ];

  return (
    <footer style={{
      borderTop: `1px solid ${theme.tint12}`,
      background: `linear-gradient(180deg, transparent, ${theme.tint06})`,
      padding: '40px 16px 32px',
      textAlign: 'center',
      marginTop: 64,
      fontFamily: theme.fonts.body,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        marginBottom: 14, fontSize: 13, color: COLORS.muted,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color }} />
        <span>{theme.toolCount} free {theme.name.toLowerCase()} on ToolsRift</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 14 }}>
        {links.map(({ label, href }) => (
          <a key={href} href={href} style={{ fontSize: 12, color: COLORS.dim, textDecoration: 'none' }}>
            {label}
          </a>
        ))}
      </div>
      <div style={{ fontSize: 11, color: COLORS.faint }}>
        © 2026 ToolsRift · Free online tools, powered by ads.
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function CategoryLayout({ theme, currentTool, children }) {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader theme={theme} />

      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 32px)',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}>
        {children}
      </main>

      <CategoryFooter theme={theme} />
    </div>
  );
}
