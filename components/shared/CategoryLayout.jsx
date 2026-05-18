// ── ToolsRift CategoryLayout (v2) ────────────────────────────────────────────
// Uses the upgraded theme registry (tint25, bgRadial, fonts, anim)
// and shared motion + ui primitives. Each category renders as its own
// micro-brand with a unique themed hero, sticky nav, and footer.

import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COLORS, RADIUS, FS, MQ } from '../../lib/designTokens';
import { BlurUp, FadeUp, GradientBlob, ParticlesField, ScanlineOverlay } from './motion';
import { Pill, ThemedButton } from './ui';

// ── Sticky themed header ────────────────────────────────────────────────────
function CategoryHeader({ theme }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 80], [10, 18]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 28px)',
        background: `rgba(6,9,15,${scrolled ? 0.95 : 0.7})`,
        backdropFilter: `blur(${scrolled ? 18 : 12}px) saturate(140%)`,
        WebkitBackdropFilter: `blur(${scrolled ? 18 : 12}px) saturate(140%)`,
        borderBottom: `1px solid ${scrolled ? theme.tint25 : 'rgba(255,255,255,0.04)'}`,
        transition: 'background 0.25s, border-color 0.25s',
        fontFamily: theme.fonts.body,
      }}
    >
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <motion.span
          animate={{ boxShadow: [`0 0 0 ${theme.color}66`, `0 0 14px ${theme.color}aa`, `0 0 0 ${theme.color}66`] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ width: 10, height: 10, borderRadius: '50%', background: theme.color, flexShrink: 0 }}
        />
        <span style={{ fontFamily: theme.fonts.head, fontWeight: 700, fontSize: 15, color: COLORS.text, letterSpacing: '-0.01em' }}>
          ToolsRift
        </span>
        <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 14 }}>›</span>
        <span style={{
          fontSize: 14, fontWeight: 600,
          background: theme.gradientText,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          {theme.name}
        </span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a
          href="/"
          style={{
            fontSize: 13, color: COLORS.muted, textDecoration: 'none', fontWeight: 500,
            display: 'none',
          }}
          className="tr-hide-on-mobile"
        >
          All Tools
        </a>
        <Pill theme={theme} variant="tint">{theme.toolCount} tools</Pill>
        <style>{`@media ${MQ.sm}{.tr-hide-on-mobile{display:inline!important}}`}</style>
      </div>
    </motion.header>
  );
}

// ── Themed hero (only on category landing) ──────────────────────────────────
function CategoryHero({ theme }) {
  const showParticles = theme.anim.particles;
  const showScanline = theme.anim.scanline;
  const showBlobs = theme.anim.blob;

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(56px, 9vw, 120px) clamp(16px, 4vw, 32px) clamp(40px, 6vw, 72px)',
      textAlign: 'center',
      isolation: 'isolate',
    }}>
      {/* 25% themed background wash */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: theme.bgRadial,
      }} />

      {/* Decorative blobs */}
      {showBlobs && (
        <>
          <GradientBlob color={theme.tint25} color2={theme.tint12} size={520} x="-10%" y="-10%" delay={0.1} />
          <GradientBlob color={`${theme.accent2}55`} size={420} x="60%" y="20%" delay={0.4} opacity={0.45} />
        </>
      )}
      {showParticles && <ParticlesField color={`${theme.color}55`} count={18} />}
      {showScanline && <ScanlineOverlay color={`${theme.color}33`} />}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 720, margin: '0 auto' }}>
        <BlurUp delay={0.05}>
          <div style={{
            fontSize: 64, lineHeight: 1, marginBottom: 18,
            filter: `drop-shadow(0 8px 24px ${theme.color}40)`,
            display: 'inline-block',
            animation: showBlobs ? 'tr-float 5s ease-in-out infinite' : 'none',
          }}>
            {theme.icon}
          </div>
        </BlurUp>

        <BlurUp delay={0.15}>
          <h1 style={{
            fontFamily: theme.fonts.head,
            fontWeight: 700,
            fontSize: FS['4xl'],
            color: COLORS.textBright,
            margin: '0 0 14px',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}>
            <span style={{
              backgroundImage: theme.gradientText,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {theme.name}
            </span>
          </h1>
        </BlurUp>

        <FadeUp delay={0.3}>
          <p style={{
            fontFamily: theme.fonts.body,
            fontSize: FS.lg,
            color: COLORS.muted,
            margin: '0 auto 24px',
            lineHeight: 1.55,
            maxWidth: 520,
          }}>
            {theme.tagline}
          </p>
        </FadeUp>

        <FadeUp delay={0.42}>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <Pill theme={theme} variant="solid">{theme.toolCount} tools</Pill>
            <Pill theme={theme} variant="outline">100% free</Pill>
            <Pill theme={theme} variant="tint">In-browser</Pill>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
function CategoryFooter({ theme }) {
  const links = [
    { label: 'All Categories', href: '/' },
    { label: 'About',          href: '/about' },
    { label: 'Privacy',        href: '/privacy-policy' },
    { label: 'Roadmap',        href: '/roadmap' },
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

      {!currentTool && <CategoryHero theme={theme} />}

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
