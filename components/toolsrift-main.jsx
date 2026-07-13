// PHASE 1: All tools free. Pro gating disabled. Re-enable in Phase 2.
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import CATEGORY_THEMES from '../lib/categoryThemes';
import { COLORS, RADIUS, FS, MQ, SPRING, EASE } from '../lib/designTokens';
import {
  FadeUp, BlurUp, Stagger, StaggerItem, ScaleIn, MagneticBtn, HoverLift, Tilt3D,
  GradientBlob, Marquee, Typewriter, CountUp, ParallaxY, ParticlesField,
} from './shared/motion';
import { ThemedButton, Pill, SectionHeading } from './shared/ui';
// PHASE 2: import { trackUse, isLimitReached, isPro, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

// �"����� BRAND ���������������������������������������������������������������������������������������������������������"�
const BRAND = { name: "ToolsRift", domain: "toolsrift.com" };


const FEATURED = [
  { name: 'Word Counter',       icon: '📝', color: '#3B82F6', href: '/text' },
  { name: 'Base64 Decoder',     icon: '🔐', color: '#F59E0B', href: '/encoders' },
  { name: 'JSON Formatter',     icon: '{}', color: '#10B981', href: '/json' },
  { name: 'BMI Calculator',     icon: '⚖️', color: '#22C55E', href: '/financecalc' },
  { name: 'Password Generator', icon: '🔑', color: '#84CC16', href: '/generators' },
  { name: 'Color Converter',    icon: '🎨', color: '#A855F7', href: '/colors' },
  { name: 'PDF Merger',         icon: '📄', color: '#EF4444', href: '/pdf' },
  { name: 'Meta Tag Generator', icon: '🏷️', color: '#3B82F6', href: '/devtools' },
];

// ───── Premium landing primitives ─────────────────────────────────────────
const CYCLE_WORDS = [
  'text tools', 'PDF tools', 'image tools', 'JSON tools',
  'CSS generators', 'calculators', 'color tools', 'developer tools',
  'encoders', 'unit converters',
];

const TICKER_TOOLS = [
  '📝 Word Counter', '🔐 Base64', '{} JSON Format', '⚖️ BMI Calc', '🔑 Password Gen',
  '🎨 Color Picker', '📄 PDF Merge', '🏷️ Meta Tags', '🧮 EMI Calc', '📐 Geometry',
  '✨ Lorem Ipsum', '🌐 HTML Format', '🪄 Fancy Text', '🔡 Morse Code', '#️⃣ MD5 Hash',
  '🖼️ Image Resize', '📏 Length Convert', '💼 Invoice Gen', '📊 Std Dev', '⏰ Timezone',
];

const WHY_CARDS = [
  { icon: '⚡', title: 'Instant Results',     desc: 'Every tool runs the moment you type — no submit, no wait.' },
  { icon: '🔒', title: '100% Private',         desc: 'All processing happens in your browser. Files never touch a server.' },
  { icon: '🆓', title: 'Always 100% Free',     desc: 'No daily limits, no paywalls, no sign-up. Powered by ads.' },
  { icon: '📱', title: 'Works Everywhere',     desc: 'Mobile, tablet, desktop — every tool is touch-friendly.' },
  { icon: '✨', title: 'No Signup Ever',       desc: 'Open the page, use the tool. That\'s the whole flow.' },
  { icon: '🔍', title: 'SEO-Optimized',        desc: 'Every tool has its own page, schema markup, and FAQ.' },
];

const STEPS = [
  { n: '01', icon: '🔍', title: 'Pick a tool',     desc: 'Browse 23 categories or search by name.' },
  { n: '02', icon: '⚡', title: 'Use instantly',   desc: 'No download. No account. Works in your browser.' },
  { n: '03', icon: '✅', title: 'Done in seconds', desc: 'Copy, download, or share your results.' },
];

const FREE_PILLARS = [
  { icon: '🛠️', tint: '#3B82F6', title: '685+ Free Tools', desc: 'Every tool is free. No daily limits, no paywalls, no sign-up required.' },
  { icon: '📢', tint: '#F59E0B', title: 'Ad-Supported',       desc: 'ToolsRift is funded by non-intrusive display ads. Fair deal.' },
  { icon: '🔐', tint: '#10B981', title: 'Local Data',         desc: 'All processing happens in your browser. Zero server uploads.' },
];

function LandingPage() {
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const q = query.trim().toLowerCase();
  const filteredThemes = useMemo(() => {
    if (!q) return CATEGORY_THEMES;
    return CATEGORY_THEMES.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, color: COLORS.text, fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}>
      <LandingNav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <HeroSection query={query} setQuery={setQuery} filteredCount={filteredThemes.length} />
      <TickerSection />
      <CategoryMosaic id="categories" themes={filteredThemes} query={query} />
      <WhySection />
      <SpotlightSection />
      <HowItWorks />
      <FreeForeverSection />
      <FinalCTA />
      {/* Footer is rendered once at the bottom of HomepageContent (server-side),
          appended after this component in pages/index.js — so it is never
          stranded above the "About the platform" SEO section. */}
    </div>
  );
}

// ───── CATEGORIES DROPDOWN ────────────────────────────────────────────────
function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <span style={{ ...navLinkStyle, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        Categories <span style={{ fontSize: 10, opacity: 0.7 }}>▾</span>
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 'min(720px, 90vw)',
              background: 'rgba(10,15,26,0.96)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
              padding: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              display: 'grid', gap: 4,
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              zIndex: 200,
            }}
          >
            {CATEGORY_THEMES.map(t => (
              <a key={t.id} href={t.pageRoute} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
                color: '#E2E8F0', fontSize: 13, transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.tint12}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontWeight: 500 }}>{t.name}</span>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ───── NAV ─────────────────────────────────────────────────────────────────
export function LandingNav({ mobileOpen, setMobileOpen }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{`
        .tr-nav-links { display:none; }
        @media ${MQ.md} { .tr-nav-links { display:flex !important; } .tr-nav-burger { display:none !important; } }
      `}</style>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING.smooth, delay: 0.1 }}
        style={{
          position: 'sticky', top: 0, zIndex: 100, height: 64,
          background: `rgba(6,9,15,${scrolled ? 0.92 : 0.65})`,
          backdropFilter: `blur(${scrolled ? 18 : 12}px) saturate(140%)`,
          WebkitBackdropFilter: `blur(${scrolled ? 18 : 12}px) saturate(140%)`,
          borderBottom: `1px solid rgba(255,255,255,${scrolled ? 0.08 : 0.04})`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 clamp(16px,4vw,32px)',
          transition: 'all .25s ease',
        }}
      >
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }} aria-label="ToolsRift home">
          <img src="/logo.svg" alt="ToolsRift" style={{ height: 30, display: 'block' }} />
        </a>

        <div className="tr-nav-links" style={{ alignItems: 'center', gap: 28 }}>
          <a href="/tools" style={navLinkStyle}>All Tools</a>
          <CategoriesDropdown />
          <a href="/#why"       style={navLinkStyle}>Why</a>
          <a href="/about"      style={navLinkStyle}>About</a>
          <a href="/contact"    style={navLinkStyle}>Contact</a>
        </div>

        <button
          className="tr-nav-burger"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#F1F5F9', width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}
        >☰</button>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.snap }}
            style={{ overflow: 'hidden', background: '#0A0F1A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['All Tools', '/tools'], ['Why ToolsRift', '/#why'], ['About', '/about'], ['Contact', '/contact']].map(([l, h]) => (
                <a key={h} href={h} onClick={() => setMobileOpen(false)} style={{ color: '#94A3B8', fontSize: 15, textDecoration: 'none', minHeight: 44, display: 'flex', alignItems: 'center' }}>{l}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
const navLinkStyle = { color: '#94A3B8', fontSize: 14, textDecoration: 'none', fontWeight: 500, transition: 'color .2s' };

// ───── HERO ────────────────────────────────────────────────────────────────
function HeroSection({ query, setQuery, filteredCount }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        padding: 'clamp(64px,9vw,128px) clamp(20px,4vw,32px) clamp(72px,8vw,112px)',
        textAlign: 'center', overflow: 'hidden', isolation: 'isolate',
      }}
    >
      {/* Background fx */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <GradientBlob color="rgba(34,211,238,0.4)"  color2="rgba(34,211,238,0.05)"  size={620} x="-15%" y="-20%" delay={0.2} opacity={0.6} />
        <GradientBlob color="rgba(167,139,250,0.4)" color2="rgba(167,139,250,0.05)" size={520} x="55%"  y="0%"   delay={0.4} opacity={0.55} />
        <GradientBlob color="rgba(244,114,182,0.3)" color2="rgba(244,114,182,0.05)" size={460} x="20%"  y="50%"  delay={0.6} opacity={0.45} />
        <ParticlesField color="rgba(255,255,255,0.35)" count={26} />
      </div>

      <motion.div style={{ y, opacity, position: 'relative', zIndex: 2, maxWidth: 880, margin: '0 auto' }}>
        <BlurUp delay={0.05}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#A5B4FC', borderRadius: 999, padding: '7px 18px',
              fontSize: 13, fontWeight: 600, letterSpacing: '0.01em',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span>
            <CountUp to={685} suffix="+" /> Free Tools · 23 Categories · No signup
          </motion.div>
        </BlurUp>

        <BlurUp delay={0.18}>
          <h1 style={{
            margin: '28px 0 0', fontFamily: "'Sora','Inter',sans-serif",
            fontSize: FS.hero, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em',
            color: '#F8FAFC',
          }}>
            Every{' '}
            <span style={{
              backgroundImage: 'linear-gradient(135deg,#22D3EE,#A78BFA,#F472B6)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              animation: 'tr-gradientShift 6s ease infinite',
            }}>
              <Typewriter words={CYCLE_WORDS} speed={70} pause={1500} />
            </span>
            <br />you'll ever need.
          </h1>
        </BlurUp>

        <FadeUp delay={0.4}>
          <p style={{
            margin: '20px auto 0', color: '#94A3B8',
            fontSize: FS.lg, maxWidth: 640, lineHeight: 1.55,
          }}>
            685+ free online tools — calculators, PDF, image, code, design, dev. Instant results, fully in your browser.
          </p>
        </FadeUp>

        {/* Search */}
        <FadeUp delay={0.55}>
          <motion.div
            whileHover={{ borderColor: '#6366F1' }}
            style={{
              marginTop: 36, width: 'min(640px,100%)', height: 56,
              background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
              display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12,
              marginLeft: 'auto', marginRight: 'auto',
              transition: 'border-color .2s, box-shadow .2s',
              boxShadow: query ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search tools, categories, or what you want to do…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#F1F5F9', fontSize: 15, fontFamily: 'inherit', minWidth: 0,
              }}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setQuery('')}
                  style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}
                  aria-label="Clear"
                >×</motion.button>
              )}
            </AnimatePresence>
          </motion.div>
          {query && (
            <p style={{ marginTop: 10, fontSize: 13, color: '#64748B' }}>
              {filteredCount} {filteredCount === 1 ? 'category matches' : 'categories match'}
            </p>
          )}
        </FadeUp>

        {/* CTA Row */}
        <FadeUp delay={0.7}>
          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tools" legacyBehavior>
              <a style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
                color: '#fff', border: 'none',
                padding: '14px 28px', borderRadius: 999,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                fontFamily: 'inherit', textDecoration: 'none',
              }}>
                ⚡ Explore 685+ tools →
              </a>
            </Link>
            <a href="/#why" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)', color: '#E2E8F0',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '14px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600,
              textDecoration: 'none',
            }}>Why ToolsRift?</a>
          </div>
        </FadeUp>

        {/* Stats */}
        <FadeUp delay={0.85}>
          <div style={{
            marginTop: 56, display: 'flex', flexWrap: 'wrap',
            justifyContent: 'center', gap: 'clamp(16px,5vw,48px)',
          }}>
            {[
              { v: 685, suffix: '+', label: 'Tools' },
              { v: 23,   suffix: '',  label: 'Categories' },
              { v: 100,  suffix: '%', label: 'Free' },
              { v: 0,    suffix: '',  label: 'Sign-ups' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{
                  color: '#F8FAFC', fontSize: FS['2xl'], fontWeight: 800,
                  fontFamily: "'Sora',sans-serif", letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg,#fff,#94A3B8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  <CountUp to={s.v} suffix={s.suffix} />
                </div>
                <div style={{ color: '#64748B', fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </FadeUp>
      </motion.div>
    </section>
  );
}

// ───── TICKER ──────────────────────────────────────────────────────────────
function TickerSection() {
  return (
    <section style={{ padding: '32px 0 12px', position: 'relative' }}>
      <Marquee speed={45} gap={16}>
        {TICKER_TOOLS.map((t, i) => (
          <span key={i} style={{
            flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 999, padding: '10px 18px',
            color: '#94A3B8', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            {t}
          </span>
        ))}
      </Marquee>
      <div style={{ height: 12 }} />
      <Marquee speed={55} gap={16} reverse>
        {[...TICKER_TOOLS].reverse().map((t, i) => (
          <span key={i} style={{
            flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 999, padding: '10px 18px',
            color: '#94A3B8', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
          }}>
            {t}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

// ───── CATEGORY MOSAIC ────────────────────────────────────────────────────
export function CategoryMosaic({ id, themes, query }) {
  return (
    <section id={id} style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,4vw,32px)', maxWidth: 1280, margin: '0 auto' }}>
      <FadeUp>
        <SectionHeading
          eyebrow="23 Micro-brands"
          title="Browse by category"
          sub="Each category is its own world — themed, animated, and crafted for speed."
        />
      </FadeUp>

      <Stagger
        gap={0.04}
        style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,260px), 1fr))',
        }}
      >
        {themes.map((t) => (
          <StaggerItem key={t.id}>
            <CategoryTile theme={t} />
          </StaggerItem>
        ))}
      </Stagger>

      {themes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 16px', color: '#64748B' }}>
          No categories match "{query}". Try a different search.
        </div>
      )}
    </section>
  );
}

function CategoryTile({ theme }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={theme.pageRoute}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <Tilt3D max={5} style={{ height: '100%' }}>
        <motion.div
          whileHover={{ y: -6 }}
          transition={SPRING.smooth}
          style={{
            position: 'relative',
            height: '100%',
            background: hov ? theme.tint06 : 'rgba(15,23,42,0.6)',
            border: `1px solid ${hov ? theme.tint25 : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 18, padding: 22,
            overflow: 'hidden',
            transition: 'background .25s, border-color .25s',
            boxShadow: hov ? `0 16px 40px ${theme.tint25}` : '0 1px 0 rgba(255,255,255,0.03) inset',
          }}
        >
          {/* Themed gradient accent (top-left) */}
          <div aria-hidden style={{
            position: 'absolute', top: -40, left: -40, width: 140, height: 140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.tint25} 0%, transparent 70%)`,
            opacity: hov ? 1 : 0.5, transition: 'opacity .3s',
          }} />

          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: theme.gradient,
            boxShadow: `0 8px 24px ${theme.tint25}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, lineHeight: 1, position: 'relative', zIndex: 1,
          }}>
            {theme.icon}
          </div>

          <div style={{
            marginTop: 16, fontSize: 16, fontWeight: 700, color: '#F8FAFC',
            fontFamily: theme.fonts.head, letterSpacing: '-0.01em',
            position: 'relative', zIndex: 1,
          }}>
            {theme.name}
          </div>
          <div style={{
            marginTop: 6, fontSize: 13, color: '#94A3B8', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            minHeight: 38,
          }}>
            {theme.tagline}
          </div>

          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', zIndex: 1,
          }}>
            <span style={{
              background: theme.tint12, color: theme.color,
              padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              border: `1px solid ${theme.tint25}`,
            }}>
              {theme.toolCount} tools
            </span>
            <motion.span
              animate={{ x: hov ? 4 : 0 }}
              transition={SPRING.snappy}
              style={{ color: theme.color, fontSize: 18 }}
            >→</motion.span>
          </div>
        </motion.div>
      </Tilt3D>
    </a>
  );
}

// ───── WHY SECTION ─────────────────────────────────────────────────────────
function WhySection() {
  return (
    <section id="why" style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,4vw,32px)', maxWidth: 1280, margin: '0 auto' }}>
      <FadeUp>
        <SectionHeading
          eyebrow="Why ToolsRift"
          title="Built for speed. Designed for everyone."
          sub="No tracking. No paywalls. No fluff. Just tools that work."
        />
      </FadeUp>
      <Stagger
        gap={0.07}
        style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,280px), 1fr))',
        }}
      >
        {WHY_CARDS.map((c, i) => (
          <StaggerItem key={i}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={SPRING.smooth}
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18, padding: 24, height: '100%',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.55 }}>{c.desc}</div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ───── SPOTLIGHT ───────────────────────────────────────────────────────────
function SpotlightSection() {
  const items = FEATURED.map((f, i) => {
    const theme = CATEGORY_THEMES.find(t => t.pageRoute === f.href) || CATEGORY_THEMES[i % CATEGORY_THEMES.length];
    return { ...f, theme };
  });

  return (
    <section style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,4vw,32px)', maxWidth: 1280, margin: '0 auto' }}>
      <FadeUp>
        <SectionHeading
          eyebrow="Popular"
          title="Most-used tools, right now"
          sub="The tools people open every day."
        />
      </FadeUp>
      <Stagger
        gap={0.05}
        style={{
          display: 'grid', gap: 14,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,220px), 1fr))',
        }}
      >
        {items.map((it, i) => (
          <StaggerItem key={i}>
            <motion.a
              href={it.href}
              whileHover={{ y: -5, boxShadow: `0 14px 32px ${it.theme.tint25}` }}
              transition={SPRING.smooth}
              style={{
                display: 'block', textDecoration: 'none',
                background: it.theme.tint06,
                border: `1px solid ${it.theme.tint25}`,
                borderRadius: 14, padding: 18,
                position: 'relative', overflow: 'hidden',
                height: '100%',
              }}
            >
              <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: it.theme.gradient,
              }} />
              <div style={{ fontSize: 24, marginBottom: 10 }}>{it.icon}</div>
              <div style={{ fontWeight: 700, color: '#F8FAFC', fontSize: 15, fontFamily: it.theme.fonts.head }}>
                {it.name}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: it.theme.color, fontWeight: 600 }}>
                Free → {it.theme.name}
              </div>
            </motion.a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ───── HOW IT WORKS ────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,4vw,32px)', maxWidth: 1100, margin: '0 auto' }}>
      <FadeUp>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps. Zero friction."
          sub="From homepage to result in under 10 seconds."
        />
      </FadeUp>
      <Stagger
        gap={0.12}
        style={{
          display: 'grid', gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,260px), 1fr))',
          position: 'relative',
        }}
      >
        {STEPS.map((s, i) => (
          <StaggerItem key={s.n}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={SPRING.smooth}
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18, padding: '28px 24px',
                textAlign: 'center', position: 'relative', height: '100%',
              }}
            >
              <div style={{
                fontFamily: "'JetBrains Mono',monospace",
                color: '#22D3EE', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.12em', marginBottom: 10,
              }}>{s.n}</div>
              <div style={{
                fontSize: 40, marginBottom: 10,
                animation: `tr-float ${4 + i}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}>{s.icon}</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: '#F8FAFC', marginBottom: 6 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.55 }}>{s.desc}</div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ───── FREE FOREVER ───────────────────────────────────────────────────────
function FreeForeverSection() {
  return (
    <section style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,4vw,32px)', maxWidth: 1280, margin: '0 auto' }}>
      <FadeUp>
        <SectionHeading
          eyebrow="Free, Forever"
          title="How do we keep it free?"
          sub="No tricks, no upsells. Here's the honest answer."
        />
      </FadeUp>
      <Stagger
        gap={0.08}
        style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,280px), 1fr))',
        }}
      >
        {FREE_PILLARS.map((p, i) => (
          <StaggerItem key={i}>
            <motion.div
              whileHover={{ y: -5 }}
              transition={SPRING.smooth}
              style={{
                background: `linear-gradient(180deg, ${p.tint}1a 0%, transparent 100%)`,
                border: `1px solid ${p.tint}33`,
                borderRadius: 18, padding: 28, height: '100%',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div aria-hidden style={{
                position: 'absolute', top: -50, right: -50, width: 160, height: 160,
                borderRadius: '50%', filter: 'blur(40px)',
                background: `radial-gradient(circle, ${p.tint}66 0%, transparent 70%)`,
                opacity: 0.5,
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>
                  {p.title}
                </div>
                <div style={{ fontSize: 14.5, color: '#94A3B8', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ───── FINAL CTA ──────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ padding: 'clamp(64px,9vw,120px) clamp(20px,4vw,32px)', maxWidth: 980, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', borderRadius: 32 }}>
        <GradientBlob color="rgba(99,102,241,0.5)" size={520} x="20%" y="-20%" delay={0.1} opacity={0.6} />
        <GradientBlob color="rgba(244,114,182,0.4)" size={420} x="60%" y="40%" delay={0.3} opacity={0.5} />
      </div>
      <FadeUp>
        <h2 style={{
          fontFamily: "'Sora',sans-serif", fontWeight: 800,
          fontSize: FS['4xl'], letterSpacing: '-0.03em',
          color: '#F8FAFC', margin: 0, lineHeight: 1.1,
          position: 'relative', zIndex: 1,
        }}>
          Start using <span style={{
            backgroundImage: 'linear-gradient(135deg,#22D3EE,#A78BFA,#F472B6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>685 free tools</span> right now.
        </h2>
        <p style={{ marginTop: 18, fontSize: FS.lg, color: '#94A3B8', position: 'relative', zIndex: 1 }}>
          No account. No install. No limits. Just open and use.
        </p>
        <div style={{ marginTop: 32, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/tools" legacyBehavior>
            <a style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              color: '#fff', border: 'none', cursor: 'pointer',
              padding: '16px 32px', borderRadius: 999,
              fontSize: 16, fontWeight: 700,
              boxShadow: '0 12px 40px rgba(99,102,241,0.5)',
              fontFamily: 'inherit', textDecoration: 'none',
            }}>
              🛠️ Browse all free tools →
            </a>
          </Link>
        </div>
      </FadeUp>
    </section>
  );
}

// ───── FOOTER ──────────────────────────────────────────────────────────────
export function LandingFooter() {
  const cols = [
    { title: 'Top Categories', links: CATEGORY_THEMES.slice(0, 8).map(t => [t.name, t.pageRoute]) },
    { title: 'More Categories', links: CATEGORY_THEMES.slice(8, 16).map(t => [t.name, t.pageRoute]) },
    { title: 'Company', links: [['About', '/about'], ['Contact', '/contact']] },
    { title: 'Legal', links: [['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms'], ['Cookie Policy', '/cookies'], ['Disclaimer', '/disclaimer']] },
  ];
  return (
    <footer style={{
      background: 'linear-gradient(180deg, transparent, rgba(34,211,238,0.04))',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px clamp(20px,4vw,32px) 36px',
      marginTop: 32,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gap: 32,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%,200px), 1fr))',
          marginBottom: 36,
        }}>
          <div>
            <a href="/" style={{ display: 'inline-block', marginBottom: 12 }} aria-label="ToolsRift home">
              <img src="/logo.svg" alt="ToolsRift" style={{ height: 30, display: 'block' }} />
            </a>
            <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
              685+ free online tools. No signup. No limits. Built with ♥ in India.
            </p>
          </div>
          {cols.map((c, ci) => (
            <div key={ci}>
              <div style={{
                color: '#E2E8F0', fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
              }}>{c.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {c.links.map(([l, h]) => (
                  <a key={h} href={h} style={{
                    color: '#94A3B8', fontSize: 13.5, textDecoration: 'none',
                    transition: 'color .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#22D3EE'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          color: '#64748B', fontSize: 12,
        }}>
          <span>© 2026 ToolsRift · All tools free, powered by ads.</span>
          <span>Made with framer-motion · Next.js · Vercel</span>
        </div>
      </div>
    </footer>
  );
}

// ───── ROOT EXPORT ─────────────────────────────────────────────────────────
function ToolsRiftMain() {
  return <LandingPage />;
}

export default ToolsRiftMain;
