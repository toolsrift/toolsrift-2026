// ── ToolsRift CategoryLayout (v3 — pro redesign May 2026) ───────────────────
// Compact header + compact category banner + clean footer.
// Replaces the previous oversized hero with a SmallSEOTools / Linear-style
// professional layout that gets users to the tools fast.
//
// Editing this single file updates every tool category page in the project.

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COLORS, FS, MQ } from '../../lib/designTokens';

// ── Sticky top nav (single line, no decorative animations) ──────────────────
function CategoryHeader({ theme }) {
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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

// ── Compact category banner (replaces the giant hero) ───────────────────────
function CategoryBanner({ theme }) {
  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(28px, 4vw, 44px) clamp(16px, 4vw, 32px)',
        borderBottom: `1px solid rgba(255,255,255,0.05)`,
        background: `linear-gradient(180deg, ${theme.color}0A 0%, transparent 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* subtle accent line at bottom */}
      <div
        aria-hidden
        style={{
          position: 'absolute', left: 0, right: 0, bottom: -1, height: 1,
          background: `linear-gradient(90deg, transparent, ${theme.color}88, transparent)`,
        }}
      />

      <div
        style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2vw, 22px)',
          flexWrap: 'wrap',
        }}
      >
        {/* Icon tile */}
        <div
          style={{
            width: 56, height: 56, borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: theme.gradient || `linear-gradient(135deg, ${theme.color}, ${theme.colorDark || theme.color})`,
            fontSize: 28,
            boxShadow: `0 8px 24px ${theme.color}30`,
            flexShrink: 0,
          }}
          aria-hidden
        >
          {theme.icon}
        </div>

        {/* Title + tagline */}
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1
            style={{
              fontFamily: theme.fonts.head,
              fontWeight: 700,
              fontSize: 'clamp(22px, 2.2vw + 14px, 32px)',
              color: COLORS.textBright,
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            {theme.name}
          </h1>
          <p
            style={{
              fontFamily: theme.fonts.body,
              fontSize: 'clamp(13px, 0.8vw + 11px, 15px)',
              color: COLORS.muted,
              margin: 0,
              lineHeight: 1.5,
              maxWidth: 620,
            }}
          >
            {theme.tagline || theme.description}
          </p>
        </div>

        {/* Meta pills (right side on desktop) */}
        <div
          style={{
            display: 'flex', gap: 6, flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Stat label="Tools" value={theme.toolCount} accent={theme.color} />
          <Stat label="Free" value="100%" />
          <Stat label="Mode" value="In-browser" />
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'baseline', gap: 6,
        padding: '7px 12px',
        background: COLORS.surface,
        border: `1px solid ${COLORS.borderLight}`,
        borderRadius: 10,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: accent || COLORS.textBright,
        lineHeight: 1,
      }}>{value}</span>
      <span style={{
        fontSize: 10, fontWeight: 600,
        color: COLORS.dim, textTransform: 'uppercase',
        letterSpacing: '0.08em',
        lineHeight: 1,
      }}>{label}</span>
    </div>
  );
}

// ── Footer (with full legal page links for AdSense compliance) ──────────────
function CategoryFooter({ theme }) {
  const linkGroups = [
    {
      title: 'Tools',
      links: [
        { label: 'All categories', href: '/' },
        { label: 'PDF Tools',     href: '/pdf' },
        { label: 'Image Tools',   href: '/images' },
        { label: 'Text Tools',    href: '/text' },
        { label: 'Developer Tools', href: '/devtools' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About',    href: '/about' },
        { label: 'Contact',  href: '/contact' },
        { label: 'Roadmap',  href: '/roadmap' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy',     href: '/privacy-policy' },
        { label: 'Terms of Service',   href: '/terms' },
        { label: 'Cookie Policy',      href: '/cookies' },
        { label: 'Disclaimer',         href: '/disclaimer' },
      ],
    },
  ];

  return (
    <footer
      style={{
        borderTop: `1px solid ${COLORS.borderLight}`,
        background: `linear-gradient(180deg, transparent, ${theme.color}05)`,
        padding: '48px clamp(16px, 4vw, 32px) 28px',
        marginTop: 64,
        fontFamily: theme.fonts.body,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gap: 32,
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            marginBottom: 36,
          }}
        >
          <div>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
              <img src="/logo.svg" alt="ToolsRift" style={{ height: 28 }} />
            </a>
            <p style={{ color: COLORS.muted, fontSize: 13, lineHeight: 1.65, margin: 0, maxWidth: 280 }}>
              544+ free online tools across 34 categories. Runs in your browser. No sign-up.
            </p>
          </div>

          {linkGroups.map((g) => (
            <div key={g.title}>
              <div
                style={{
                  color: COLORS.text, fontSize: 12, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14,
                  fontFamily: theme.fonts.head,
                }}
              >
                {g.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.links.map(({ label, href }) => (
                  <a
                    key={href}
                    href={href}
                    style={{ color: COLORS.muted, fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = theme.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.muted)}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            paddingTop: 22,
            borderTop: `1px solid ${COLORS.borderLight}`,
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
            color: COLORS.dim, fontSize: 12,
          }}
        >
          <span>© 2026 ToolsRift · Free online tools, powered by ads.</span>
          <span>Made with ♥ in Hyderabad, India</span>
        </div>
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function CategoryLayout({ theme, currentTool, children }) {
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', flexDirection: 'column' }}>
      <CategoryHeader theme={theme} />

      {!currentTool && <CategoryBanner theme={theme} />}

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

      <CategoryFooter theme={theme} />
    </div>
  );
}
