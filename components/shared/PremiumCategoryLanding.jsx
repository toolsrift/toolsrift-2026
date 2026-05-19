// ── ToolsRift PremiumCategoryLanding ─────────────────────────────────────────
// Drop-in replacement for CategoryDashboard. Rendered as the children of
// CategoryLayout on a category's landing page (route: `#/` inside the app).
//
// Sections (top→bottom):
//   ┌─ Themed hero        (cycle headline, blobs/particles/scanline per anim)
//   ├─ Ticker marquee     (two rows, opposite directions, themed pills)
//   ├─ Stats bar          (CountUp: tool count, 100% free, no signup, browser)
//   ├─ Search + sub-cat   (filters the grouped grid below)
//   ├─ Trending strip     (popular tool IDs from categoryContent)
//   ├─ Grouped tool grid  (sections per sub-cat, with sub-cat heading)
//   ├─ Why this category  (4-6 cards from categoryContent)
//   ├─ Popular spotlight  (large cards for the popular IDs)
//   ├─ How it works       (3 themed steps with category-specific verbs)
//   ├─ FAQ accordion      (FAQPage JSON-LD injected)
//   └─ Final CTA          (gradient blob, themed)
//
// JSON-LD emitted:
//   - BreadcrumbList
//   - ItemList of category tools (top 20)
//   - FAQPage (5-8 entries)

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CATEGORY_THEMES from '../../lib/categoryThemes';
import { getCategoryContent } from '../../lib/categoryContent';
import { COLORS, RADIUS, FS, MQ, SPRING, EASE } from '../../lib/designTokens';
import {
  FadeUp, BlurUp, Stagger, StaggerItem, GradientBlob, Marquee,
  Typewriter, CountUp, ParticlesField, ScanlineOverlay,
} from './motion';
import { Pill, ThemedButton, SectionHeading } from './ui';
import CategoryLogo from './CategoryLogo';

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
function safeArray(v) { return Array.isArray(v) ? v : []; }

function buildToolHref(toolId, base) {
  return base ? `${base}#/tool/${toolId}` : `#/tool/${toolId}`;
}

// JSON-LD <script type="application/ld+json"> injector
function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hero
// ────────────────────────────────────────────────────────────────────────────
function PremiumHero({ theme, content, toolCount, onSearchClick }) {
  const showParticles = theme.anim.particles;
  const showScanline  = theme.anim.scanline;
  const showBlobs     = theme.anim.blob;

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(72px,10vw,140px) clamp(20px,4vw,32px) clamp(56px,7vw,96px)',
        textAlign: 'center',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
    >
      {/* Themed background wash */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, background: theme.bgRadial }} />

      {showBlobs && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
          <GradientBlob color={theme.tint25} color2={theme.tint06} size={620} x="-15%" y="-25%" delay={0.1} />
          <GradientBlob color={`${theme.accent2}55`} size={520} x="60%" y="-10%" delay={0.3} opacity={0.5} />
          <GradientBlob color={`${theme.color}33`} size={420} x="20%" y="50%" delay={0.5} opacity={0.4} />
        </div>
      )}
      {showParticles && <ParticlesField color={`${theme.color}66`} count={22} />}
      {showScanline  && <ScanlineOverlay color={`${theme.color}55`} />}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 880, margin: '0 auto' }}>
        {/* Big animated category icon (moved up from the old CategoryHero) */}
        <BlurUp delay={0.03}>
          <div
            style={{
              fontSize: 'clamp(56px, 9vw, 88px)',
              lineHeight: 1,
              marginBottom: 18,
              filter: `drop-shadow(0 10px 28px ${theme.color}55)`,
              display: 'inline-block',
              animation: showBlobs ? 'tr-float 5s ease-in-out infinite' : 'none',
            }}
          >
            {theme.icon}
          </div>
        </BlurUp>

        <BlurUp delay={0.1}>
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: theme.tint12, border: `1px solid ${theme.tint25}`,
              color: theme.color, borderRadius: 999, padding: '8px 18px',
              fontSize: 13, fontWeight: 700, letterSpacing: '0.01em',
              backdropFilter: 'blur(10px)', fontFamily: theme.fonts.body,
            }}
          >
            <span style={{ fontSize: 15 }}>{theme.motif || '✨'}</span>
            <span>{content.hero.eyebrow}</span>
          </motion.div>
        </BlurUp>

        <BlurUp delay={0.2}>
          <h1
            style={{
              margin: '20px 0 0',
              fontFamily: theme.fonts.head,
              fontSize: FS.hero,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              color: COLORS.textBright,
            }}
          >
            <span style={{ display: 'block' }}>
              {theme.name.split(' ')[0]}{' '}
              <span
                style={{
                  backgroundImage: theme.gradientText,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                <Typewriter words={content.hero.cycle} speed={70} pause={1500} />
              </span>
            </span>
            <span style={{ display: 'block', marginTop: 6 }}>{content.hero.headline}</span>
          </h1>
        </BlurUp>

        <FadeUp delay={0.4}>
          <p
            style={{
              margin: '20px auto 0',
              color: COLORS.muted,
              fontSize: FS.lg,
              maxWidth: 620,
              lineHeight: 1.55,
              fontFamily: theme.fonts.body,
            }}
          >
            {content.hero.sub}
          </p>
        </FadeUp>

        {/* Pill triplet from the old hero — kept the design the user liked */}
        <FadeUp delay={0.55}>
          <div
            style={{
              marginTop: 22,
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'center',
            }}
          >
            <Pill theme={theme} variant="solid">{toolCount} tools</Pill>
            <Pill theme={theme} variant="outline">100% free</Pill>
            <Pill theme={theme} variant="tint">In-browser</Pill>
          </div>
        </FadeUp>

        <FadeUp delay={0.7}>
          <div
            style={{
              marginTop: 26,
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <ThemedButton
              theme={theme}
              variant="gradient"
              size="lg"
              onClick={onSearchClick}
              iconLeft={<span>{theme.icon}</span>}
            >
              Browse {toolCount} tools
            </ThemedButton>
            <ThemedButton theme={theme} variant="ghost" size="lg" href="/">
              ← All categories
            </ThemedButton>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Ticker
// ────────────────────────────────────────────────────────────────────────────
function PremiumTicker({ theme, items }) {
  if (!items?.length) return null;
  const pillStyle = {
    flex: '0 0 auto',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: theme.tint06,
    border: `1px solid ${theme.tint25}`,
    borderRadius: 999, padding: '10px 18px',
    color: COLORS.text,
    fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap',
    fontFamily: theme.fonts.body,
  };
  return (
    <section style={{ padding: '32px 0 12px' }}>
      <Marquee speed={45} gap={14}>
        {items.map((t, i) => <span key={i} style={pillStyle}>{t}</span>)}
      </Marquee>
      <div style={{ height: 10 }} />
      <Marquee speed={55} gap={14} reverse>
        {[...items].reverse().map((t, i) => <span key={i} style={pillStyle}>{t}</span>)}
      </Marquee>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Stats bar
// ────────────────────────────────────────────────────────────────────────────
function PremiumStats({ theme, toolCount }) {
  const stats = [
    { v: toolCount, suffix: '+', label: 'Free Tools' },
    { v: 100,       suffix: '%', label: 'In-Browser' },
    { v: 0,         suffix: '',  label: 'Signups' },
    { v: 0,         suffix: '',  label: 'Uploads' },
  ];
  return (
    <FadeUp>
      <section
        style={{
          margin: '36px clamp(16px,4vw,32px) 8px',
          padding: '24px clamp(16px,3vw,28px)',
          background: theme.tint06,
          border: `1px solid ${theme.tint25}`,
          borderRadius: 18,
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'space-around', gap: 24,
          maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto',
        }}
      >
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', minWidth: 92 }}>
            <div
              style={{
                fontFamily: theme.fonts.head,
                fontSize: FS['2xl'],
                fontWeight: 800,
                color: theme.color,
                letterSpacing: '-0.02em',
                background: theme.gradientText,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <CountUp to={s.v} suffix={s.suffix} />
            </div>
            <div
              style={{
                color: COLORS.muted,
                fontSize: 11.5,
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 700,
                fontFamily: theme.fonts.body,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </section>
    </FadeUp>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Search + sub-cat filter (controlled by parent)
// ────────────────────────────────────────────────────────────────────────────
function SearchAndFilters({ theme, search, setSearch, subcats, activeSub, setActiveSub, anchorRef }) {
  return (
    <section ref={anchorRef} style={{ maxWidth: 1100, margin: '40px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            height: 56, padding: '0 18px',
            background: COLORS.surface,
            border: `1px solid ${search ? theme.color : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 16,
            transition: 'all .2s',
            boxShadow: search ? `0 0 0 3px ${theme.tint25}` : 'none',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={search ? theme.color : COLORS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${theme.name.toLowerCase()}…`}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: COLORS.textBright, fontSize: 15, fontFamily: theme.fonts.body, minWidth: 0,
            }}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearch('')}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: COLORS.muted, width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}
                aria-label="Clear search"
              >
                ×
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </FadeUp>

      {subcats?.length > 0 && (
        <FadeUp delay={0.1}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
            {[{ id: 'all', name: 'All', icon: '✨' }, ...subcats].map((s) => {
              const isActive = activeSub === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSub(s.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    minHeight: 38,
                    padding: '8px 14px', borderRadius: 999,
                    fontSize: 13, fontWeight: 600,
                    fontFamily: theme.fonts.body,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    background: isActive ? theme.color : 'rgba(255,255,255,0.04)',
                    color: isActive ? (theme.textOnColor || '#fff') : COLORS.muted,
                    border: `1px solid ${isActive ? theme.color : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all .2s',
                  }}
                >
                  {s.icon && <span>{s.icon}</span>}
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </FadeUp>
      )}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Trending — podium-style ranked grid (no horizontal scroll)
//   row 1: #1 (large featured card spanning 2 cols on desktop) + #2 + #3
//   row 2: #4 #5 #6 (smaller cards, equal width)
// On mobile collapses to a clean single column.
// ────────────────────────────────────────────────────────────────────────────
function TrendingCard({ theme, tool, rank, featured, onClick }) {
  const [hov, setHov] = useState(false);
  const rankColor =
    rank === 1 ? '#FBBF24'           // gold
    : rank === 2 ? '#E5E7EB'         // silver
    : rank === 3 ? '#F59E0B'         // bronze
    : theme.color;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING.smooth}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: featured ? 18 : 14,
        textAlign: 'left',
        width: '100%', height: '100%',
        padding: featured ? '20px 22px' : '16px 18px',
        background: hov
          ? `linear-gradient(135deg, ${theme.tint12}, ${theme.tint06})`
          : `linear-gradient(135deg, ${theme.tint06}, rgba(15,23,42,0.55))`,
        border: `1px solid ${hov ? theme.tint25 : theme.tint12}`,
        borderRadius: 16,
        cursor: 'pointer',
        color: COLORS.text,
        fontFamily: theme.fonts.body,
        transition: 'all .2s ease',
        boxShadow: hov ? `0 12px 28px ${theme.tint25}` : '0 1px 0 rgba(255,255,255,0.03) inset',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Rank ribbon (top-left) */}
      <span
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: 0,
          padding: featured ? '5px 12px 5px 10px' : '3px 9px 3px 8px',
          background: rankColor,
          color: '#0B0F18',
          fontFamily: theme.fonts.mono,
          fontSize: featured ? 12 : 11,
          fontWeight: 800,
          letterSpacing: '0.06em',
          borderBottomRightRadius: 10,
          lineHeight: 1,
        }}
      >
        #{rank}
      </span>

      {/* Themed gradient accent in the corner */}
      <span
        aria-hidden
        style={{
          position: 'absolute', top: -40, right: -40,
          width: featured ? 160 : 110,
          height: featured ? 160 : 110,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.tint25} 0%, transparent 70%)`,
          opacity: hov ? 0.95 : 0.55,
          transition: 'opacity .25s',
          pointerEvents: 'none',
        }}
      />

      {/* Tool icon — chunky badge */}
      <span
        style={{
          flexShrink: 0,
          width: featured ? 56 : 44,
          height: featured ? 56 : 44,
          marginTop: featured ? 14 : 10, // breathing room under rank ribbon
          borderRadius: featured ? 14 : 12,
          background: hov ? theme.gradient : theme.tint12,
          color: hov ? (theme.textOnColor || '#fff') : theme.color,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: featured ? 26 : 22,
          boxShadow: hov ? `0 6px 16px ${theme.tint25}` : 'none',
          transition: 'all .2s ease',
          position: 'relative', zIndex: 1,
        }}
      >
        {tool.icon || theme.motif || '•'}
      </span>

      {/* Title + desc */}
      <span style={{ minWidth: 0, flex: 1, marginTop: featured ? 14 : 10, position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'block',
            fontFamily: theme.fonts.head,
            fontSize: featured ? 18 : 15,
            fontWeight: 700,
            color: COLORS.textBright,
            letterSpacing: '-0.01em',
            lineHeight: 1.25,
            marginBottom: 4,
          }}
        >
          {tool.name}
        </span>
        {featured && (tool.desc || tool.description) && (
          <span
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: 13,
              color: COLORS.muted,
              lineHeight: 1.5,
            }}
          >
            {tool.desc || tool.description}
          </span>
        )}
        {!featured && (tool.desc || tool.description) && (
          <span
            style={{
              display: 'block',
              fontSize: 12,
              color: COLORS.muted,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {tool.desc || tool.description}
          </span>
        )}
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: featured ? 10 : 6,
            fontSize: 11.5, fontWeight: 700,
            color: theme.color,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Open
          <motion.span
            animate={{ x: hov ? 3 : 0 }}
            transition={SPRING.snappy}
            style={{ fontSize: 13 }}
          >→</motion.span>
        </span>
      </span>
    </motion.button>
  );
}

function PremiumTrending({ theme, tools, onToolClick }) {
  if (!tools?.length) return null;
  const top = tools.slice(0, 6);
  // Featured #1 takes 2 columns on desktop.
  return (
    <section style={{ maxWidth: 1100, margin: '36px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 16, fontFamily: theme.fonts.body,
          }}
        >
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10,
              background: theme.gradient, color: theme.textOnColor || '#fff',
              fontSize: 16,
              boxShadow: `0 6px 18px ${theme.tint25}`,
            }}
          >🔥</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: theme.color,
                lineHeight: 1.1,
              }}
            >
              Top picks
            </span>
            <span
              style={{
                fontSize: 15, fontWeight: 600,
                color: COLORS.textBright, lineHeight: 1.2,
                fontFamily: theme.fonts.head,
                marginTop: 2,
              }}
            >
              Most-used {theme.name.toLowerCase()} right now
            </span>
          </div>
        </div>
      </FadeUp>

      <style>{`
        .tr-trend-grid {
          display: grid;
          grid-template-columns: 1fr;
          grid-auto-rows: 1fr;
          gap: 12px;
        }
        @media ${MQ.sm} {
          .tr-trend-grid { grid-template-columns: 1fr 1fr; }
        }
        @media ${MQ.md} {
          .tr-trend-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
          .tr-trend-featured { grid-column: span 2; grid-row: span 1; }
        }
      `}</style>

      <Stagger gap={0.05} className="tr-trend-grid">
        {top.map((t, i) => (
          <StaggerItem
            key={t.id}
            className={i === 0 ? 'tr-trend-featured' : ''}
            style={{ height: '100%' }}
          >
            <TrendingCard
              theme={theme}
              tool={t}
              rank={i + 1}
              featured={i === 0}
              onClick={() => onToolClick?.(t.id)}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Themed tool tile (style varies per anim feel)
// ────────────────────────────────────────────────────────────────────────────
function ToolTile({ theme, tool, onClick }) {
  const [hov, setHov] = useState(false);
  const feel = theme.animStyleId;
  const isMono = feel === 'glitch' || feel === 'precise';

  const tileTransform = hov
    ? feel === 'bouncy'    ? 'translateY(-6px) rotate(-1.5deg)'
    : feel === 'liquid'    ? 'translateY(-5px) scale(1.02)'
    : feel === 'cinematic' ? 'translateY(-4px) scale(1.01)'
    :                        'translateY(-4px)'
    : 'none';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      whileTap={{ scale: 0.97 }}
      transition={SPRING.smooth}
      style={{
        position: 'relative',
        background: hov ? theme.tint06 : 'rgba(15,23,42,0.6)',
        border: `1px solid ${hov ? theme.tint25 : 'rgba(255,255,255,0.06)'}`,
        borderRadius: feel === 'liquid' ? 22 : feel === 'precise' ? 8 : 14,
        padding: 18,
        cursor: 'pointer',
        transform: tileTransform,
        transition: 'background 0.25s, border-color 0.25s, transform 0.3s ease, box-shadow 0.3s',
        boxShadow: hov ? `0 12px 32px ${theme.tint25}` : 'none',
        overflow: 'hidden',
        userSelect: 'none',
        height: '100%',
      }}
    >
      {feel === 'glitch' && hov && <ScanlineOverlay color={`${theme.color}44`} />}
      {feel === 'liquid' && (
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: -20, opacity: hov ? 0.6 : 0.25,
            background: `radial-gradient(circle at 30% 20%, ${theme.tint25} 0%, transparent 60%)`,
            transition: 'opacity 0.3s', pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <span
          style={{
            width: 36, height: 36, borderRadius: feel === 'precise' ? 6 : 10,
            background: hov ? theme.gradient : theme.tint12,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, transition: 'background 0.25s',
            boxShadow: hov ? `0 4px 14px ${theme.tint25}` : 'none',
          }}
        >
          {tool.icon || theme.motif || '•'}
        </span>
        <motion.span
          animate={{ x: hov ? 3 : 0, opacity: hov ? 1 : 0.4 }}
          transition={SPRING.snappy}
          style={{ color: theme.color, fontSize: 15 }}
        >→</motion.span>
      </div>

      <div
        style={{
          fontFamily: isMono ? theme.fonts.mono : theme.fonts.head,
          fontSize: 14.5, fontWeight: 700,
          color: hov ? '#F8FAFC' : COLORS.text,
          letterSpacing: feel === 'precise' ? '0.005em' : '-0.01em',
          lineHeight: 1.3, marginBottom: 4,
          position: 'relative', zIndex: 1,
        }}
      >
        {tool.name}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.body, fontSize: 12.5, color: COLORS.muted,
          lineHeight: 1.5, display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          position: 'relative', zIndex: 1, minHeight: 36,
        }}
      >
        {tool.desc || tool.description || ''}
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Grouped tool grid (by sub-cat heading)
// ────────────────────────────────────────────────────────────────────────────
function GroupedToolGrid({ theme, tools, subcats, activeSub, search, onToolClick }) {
  const q = (search || '').trim().toLowerCase();

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (activeSub !== 'all' && t.cat !== activeSub && t.subCat !== activeSub) return false;
      if (!q) return true;
      const name = (t.name || '').toLowerCase();
      const desc = (t.desc || t.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [tools, q, activeSub]);

  // When searching or a sub-cat is active, render a flat grid (no headings).
  if (q || activeSub !== 'all' || !subcats?.length) {
    if (filtered.length === 0) {
      return (
        <section style={{ padding: '64px 16px', textAlign: 'center', color: COLORS.muted, fontFamily: theme.fonts.body, fontSize: 14, maxWidth: 1100, margin: '40px auto 0' }}>
          {q ? <>No tools match "<strong style={{ color: COLORS.text }}>{q}</strong>" in this category.</> : 'No tools to show.'}
        </section>
      );
    }
    return (
      <section style={{ maxWidth: 1100, margin: '36px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
        <Stagger
          gap={0.03}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gap: 14,
          }}
        >
          {filtered.map((t) => (
            <StaggerItem key={t.id}>
              <ToolTile theme={theme} tool={t} onClick={() => onToolClick(t.id)} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    );
  }

  // Default: grouped by subcat.
  return (
    <section style={{ maxWidth: 1100, margin: '40px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      {subcats.map((sc) => {
        const items = tools.filter((t) => t.cat === sc.id || t.subCat === sc.id);
        if (!items.length) return null;
        return (
          <div key={sc.id} style={{ marginBottom: 48 }}>
            <FadeUp>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  marginBottom: 18, paddingBottom: 12,
                  borderBottom: `1px solid ${theme.tint12}`,
                }}
              >
                <span
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: theme.tint12, color: theme.color,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}
                >{sc.icon || theme.motif}</span>
                <h3
                  style={{
                    fontFamily: theme.fonts.head, fontSize: FS.xl,
                    fontWeight: 700, color: COLORS.textBright, margin: 0,
                    letterSpacing: '-0.015em',
                  }}
                >
                  {sc.name}
                </h3>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11.5, fontWeight: 700, color: COLORS.dim,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: theme.fonts.body,
                  }}
                >
                  {items.length} tool{items.length === 1 ? '' : 's'}
                </span>
              </div>
            </FadeUp>
            <Stagger
              gap={0.03}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
                gap: 14,
              }}
            >
              {items.map((t) => (
                <StaggerItem key={t.id}>
                  <ToolTile theme={theme} tool={t} onClick={() => onToolClick(t.id)} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        );
      })}
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Why this category
// ────────────────────────────────────────────────────────────────────────────
function PremiumWhy({ theme, cards }) {
  if (!cards?.length) return null;
  return (
    <section style={{ maxWidth: 1100, margin: '80px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <SectionHeading
          theme={theme}
          eyebrow={`Why ${theme.name}`}
          title="Built for the work, not the demo."
          sub="Speed, privacy and polish — everything you expect from a tool you reach for every day."
        />
      </FadeUp>
      <Stagger
        gap={0.07}
        style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
        }}
      >
        {cards.map((c, i) => (
          <StaggerItem key={i}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={SPRING.smooth}
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: `1px solid ${theme.tint12}`,
                borderRadius: 18, padding: 24, height: '100%',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 140, height: 140, borderRadius: '50%',
                  background: `radial-gradient(circle, ${theme.tint25} 0%, transparent 70%)`,
                  opacity: 0.6, filter: 'blur(20px)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{c.icon}</div>
                <div
                  style={{
                    fontFamily: theme.fonts.head, fontSize: 17, fontWeight: 700,
                    color: COLORS.textBright, marginBottom: 6,
                  }}
                >{c.title}</div>
                <div
                  style={{
                    fontSize: 14, color: COLORS.muted, lineHeight: 1.55,
                    fontFamily: theme.fonts.body,
                  }}
                >{c.desc}</div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Popular spotlight
// ────────────────────────────────────────────────────────────────────────────
function PremiumSpotlight({ theme, tools, onToolClick }) {
  if (!tools?.length) return null;
  return (
    <section style={{ maxWidth: 1100, margin: '80px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <SectionHeading
          theme={theme}
          eyebrow="Popular"
          title="Most-loved in this category"
          sub="The tools people open every day."
        />
      </FadeUp>
      <Stagger
        gap={0.05}
        style={{
          display: 'grid', gap: 14,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
        }}
      >
        {tools.map((t) => (
          <StaggerItem key={t.id}>
            <motion.button
              onClick={() => onToolClick(t.id)}
              whileHover={{ y: -5, boxShadow: `0 14px 32px ${theme.tint25}` }}
              transition={SPRING.smooth}
              style={{
                display: 'block', textAlign: 'left',
                background: theme.tint06,
                border: `1px solid ${theme.tint25}`,
                borderRadius: 14, padding: 18, width: '100%',
                position: 'relative', overflow: 'hidden',
                height: '100%', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: theme.gradient,
                }}
              />
              <div style={{ fontSize: 24, marginBottom: 10 }}>{t.icon || theme.motif}</div>
              <div
                style={{
                  fontWeight: 700, color: COLORS.textBright, fontSize: 15,
                  fontFamily: theme.fonts.head, marginBottom: 4,
                }}
              >{t.name}</div>
              <div
                style={{
                  marginTop: 2, fontSize: 12, color: theme.color, fontWeight: 600,
                  fontFamily: theme.fonts.body,
                }}
              >Free → Open tool</div>
            </motion.button>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// How it works
// ────────────────────────────────────────────────────────────────────────────
function PremiumHowItWorks({ theme, steps }) {
  if (!steps?.length) return null;
  return (
    <section style={{ maxWidth: 1100, margin: '80px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <SectionHeading
          theme={theme}
          eyebrow="How it works"
          title="Three steps. Zero friction."
          sub="From this page to your result in under 10 seconds."
        />
      </FadeUp>
      <Stagger
        gap={0.12}
        style={{
          display: 'grid', gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          position: 'relative',
        }}
      >
        {steps.map((s, i) => (
          <StaggerItem key={s.n || i}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={SPRING.smooth}
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: `1px solid ${theme.tint12}`,
                borderRadius: 18, padding: '28px 24px',
                textAlign: 'center', position: 'relative', height: '100%',
              }}
            >
              <div
                style={{
                  fontFamily: theme.fonts.mono,
                  color: theme.color, fontSize: 12, fontWeight: 700,
                  letterSpacing: '0.12em', marginBottom: 10,
                }}
              >{s.n}</div>
              <div
                style={{
                  fontSize: 40, marginBottom: 10,
                  animation: theme.anim.blob ? `tr-float ${4 + i}s ease-in-out infinite` : 'none',
                  animationDelay: `${i * 0.4}s`,
                }}
              >{s.icon}</div>
              <div
                style={{
                  fontFamily: theme.fonts.head, fontWeight: 700, fontSize: 18,
                  color: COLORS.textBright, marginBottom: 6,
                }}
              >{s.title}</div>
              <div
                style={{
                  fontSize: 14, color: COLORS.muted, lineHeight: 1.55,
                  fontFamily: theme.fonts.body,
                }}
              >{s.desc}</div>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FAQ accordion (with FAQPage JSON-LD)
// ────────────────────────────────────────────────────────────────────────────
function FaqRow({ theme, q, a, open, onToggle, last }) {
  return (
    <div
      style={{
        borderBottom: last ? 'none' : `1px solid ${theme.tint12}`,
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 12,
          padding: '20px 4px', background: 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          color: COLORS.textBright,
          fontFamily: theme.fonts.head, fontSize: 16, fontWeight: 700,
          letterSpacing: '-0.01em', minHeight: 56,
        }}
      >
        <span style={{ flex: 1 }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={SPRING.snappy}
          style={{
            width: 32, height: 32, flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: open ? theme.color : theme.tint12,
            color: open ? (theme.textOnColor || '#fff') : theme.color,
            borderRadius: 8, fontSize: 18, fontWeight: 700,
          }}
        >+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.snap }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: '0 4px 22px',
                color: COLORS.muted, fontSize: 14.5, lineHeight: 1.65,
                fontFamily: theme.fonts.body, maxWidth: 760,
              }}
            >
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PremiumFaq({ theme, faq }) {
  const entries = safeArray(faq);
  const [open, setOpen] = useState(0);
  if (!entries.length) return null;

  return (
    <section style={{ maxWidth: 880, margin: '80px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <SectionHeading
          theme={theme}
          eyebrow="FAQ"
          title={`${theme.name} — quick answers`}
          sub="The questions people ask most often about these tools."
        />
      </FadeUp>
      <FadeUp delay={0.1}>
        <div
          style={{
            background: 'rgba(15,23,42,0.5)',
            border: `1px solid ${theme.tint12}`,
            borderRadius: 18, padding: '8px 18px',
          }}
        >
          {entries.map(([q, a], i) => (
            <FaqRow
              key={i}
              theme={theme}
              q={q}
              a={a}
              open={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
              last={i === entries.length - 1}
            />
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Final CTA
// ────────────────────────────────────────────────────────────────────────────
function PremiumFinalCta({ theme, toolCount, onPrimary }) {
  return (
    <section
      style={{
        position: 'relative',
        margin: '96px auto 0',
        padding: 'clamp(60px,9vw,120px) clamp(20px,4vw,32px)',
        maxWidth: 980, textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', borderRadius: 32 }}>
        <GradientBlob color={theme.tint25} size={520} x="20%" y="-20%" delay={0.1} opacity={0.55} />
        <GradientBlob color={`${theme.accent2}55`} size={420} x="60%" y="40%" delay={0.3} opacity={0.45} />
      </div>
      <FadeUp>
        <h2
          style={{
            fontFamily: theme.fonts.head, fontWeight: 800,
            fontSize: FS['4xl'], letterSpacing: '-0.03em',
            color: COLORS.textBright, margin: 0, lineHeight: 1.1,
            position: 'relative', zIndex: 1,
          }}
        >
          Open one of{' '}
          <span
            style={{
              backgroundImage: theme.gradientText,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            {toolCount} free {theme.name.toLowerCase()}
          </span>{' '}
          right now.
        </h2>
        <p
          style={{
            marginTop: 16, fontSize: FS.lg, color: COLORS.muted,
            position: 'relative', zIndex: 1, fontFamily: theme.fonts.body,
          }}
        >
          No account. No install. No limits. Just open and use.
        </p>
        <div style={{ marginTop: 30, position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <ThemedButton theme={theme} variant="gradient" size="lg" onClick={onPrimary}>
            {theme.icon} Browse {theme.name.toLowerCase()}
          </ThemedButton>
          <ThemedButton theme={theme} variant="ghost" size="lg" href="/">
            ← All categories
          </ThemedButton>
        </div>
      </FadeUp>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Explore other categories (kept for cross-linking SEO)
// ────────────────────────────────────────────────────────────────────────────
function PremiumExplore({ theme }) {
  const others = CATEGORY_THEMES.filter((t) => t.id !== theme.id).slice(0, 8);
  return (
    <section style={{ maxWidth: 1100, margin: '80px auto 0', padding: '0 clamp(16px,4vw,32px)' }}>
      <FadeUp>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8,
              fontFamily: theme.fonts.body,
            }}
          >Explore other categories</div>
          <div
            style={{
              fontFamily: theme.fonts.head, fontSize: FS.xl, fontWeight: 700,
              color: COLORS.textBright, letterSpacing: '-0.015em',
            }}
          >1,600+ free tools across 23 categories</div>
        </div>
        <div
          style={{
            display: 'grid', gap: 10,
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
          }}
        >
          {others.map((o) => (
            <motion.a
              key={o.id}
              href={o.pageRoute}
              whileHover={{ y: -3 }}
              transition={SPRING.smooth}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '14px 16px',
                color: COLORS.text, textDecoration: 'none',
                transition: 'border-color .2s, background .2s',
                fontFamily: o.fonts.body,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = o.tint25; e.currentTarget.style.background = o.tint06; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(15,23,42,0.5)'; }}
            >
              <CategoryLogo theme={o} size={36} variant="mark" animated={false} />
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: 'block', fontSize: 13.5, fontWeight: 700,
                    color: COLORS.textBright, lineHeight: 1.2, fontFamily: o.fonts.head,
                  }}
                >{o.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: o.color, marginTop: 2, fontWeight: 600 }}>
                  {o.toolCount} tools →
                </span>
              </span>
            </motion.a>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Root
// ────────────────────────────────────────────────────────────────────────────
export default function PremiumCategoryLanding({
  theme,
  tools = [],
  subcats,
  onToolClick,
  searchPlaceholder, // accepted for backward-compat (unused — we render our own)
}) {
  const [search, setSearch]     = useState('');
  const [activeSub, setActive]  = useState('all');
  const searchAnchorRef         = useState(() => ({ current: null }))[0];

  const content = useMemo(() => getCategoryContent(theme.id), [theme.id]);

  const handleClick = (id) => {
    if (onToolClick) onToolClick(id);
    else if (typeof window !== 'undefined') window.location.hash = `#/tool/${id}`;
  };

  const popularTools = useMemo(() => {
    const TARGET = 6;
    const ids = safeArray(content.popular);
    // 1) Resolve as many curated IDs as possible against the real tool list.
    const seen = new Set();
    const out = [];
    for (const id of ids) {
      const found = tools.find((t) => t.id === id);
      if (found && !seen.has(found.id)) {
        out.push(found);
        seen.add(found.id);
      }
    }
    // 2) Pad up to TARGET with the first N tools (skipping any already chosen).
    if (out.length < TARGET) {
      for (const t of tools) {
        if (out.length >= TARGET) break;
        if (!seen.has(t.id)) {
          out.push(t);
          seen.add(t.id);
        }
      }
    }
    return out;
  }, [content.popular, tools]);

  const toolCount = theme.toolCount || tools.length;

  // JSON-LD payloads
  const baseUrl = `https://toolsrift.com${theme.pageRoute || '/'}`;
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://toolsrift.com/' },
      { '@type': 'ListItem', position: 2, name: theme.name, item: baseUrl },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${theme.name} — ToolsRift`,
    itemListElement: tools.slice(0, 20).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${baseUrl}#/tool/${t.id}`,
    })),
  };

  const faqJsonLd = safeArray(content.faq).length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  const focusSearch = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('tr-cat-search');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
    }
  };

  return (
    <div style={{ padding: '0 0 60px', fontFamily: theme.fonts.body }}>
      <JsonLd data={breadcrumbJsonLd} />
      {tools.length > 0 && <JsonLd data={itemListJsonLd} />}
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      <PremiumHero
        theme={theme}
        content={content}
        toolCount={toolCount}
        onSearchClick={focusSearch}
      />

      <PremiumTicker theme={theme} items={content.ticker} />

      <PremiumStats theme={theme} toolCount={toolCount} />

      <div id="tr-cat-search">
        <SearchAndFilters
          theme={theme}
          search={search}
          setSearch={setSearch}
          subcats={subcats}
          activeSub={activeSub}
          setActiveSub={setActive}
          anchorRef={searchAnchorRef}
        />
      </div>

      {!search && activeSub === 'all' && (
        <PremiumTrending theme={theme} tools={popularTools} onToolClick={handleClick} />
      )}

      <GroupedToolGrid
        theme={theme}
        tools={tools}
        subcats={subcats}
        activeSub={activeSub}
        search={search}
        onToolClick={handleClick}
      />

      <PremiumWhy theme={theme} cards={content.why} />

      <PremiumSpotlight theme={theme} tools={popularTools} onToolClick={handleClick} />

      <PremiumHowItWorks theme={theme} steps={content.steps} />

      <PremiumFaq theme={theme} faq={content.faq} />

      <PremiumExplore theme={theme} />

      <PremiumFinalCta theme={theme} toolCount={toolCount} onPrimary={focusSearch} />
    </div>
  );
}
