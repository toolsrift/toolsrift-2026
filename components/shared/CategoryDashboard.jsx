// ── ToolsRift CategoryDashboard ──────────────────────────────────────────────
// Drop-in dashboard rendered as children of CategoryLayout for category landing.
// Sections (top→bottom): trending strip → search → subcat pills → themed
// tool grid → cross-category CTA.
// The visual "feel" of the grid varies by `theme.animStyleId`
// (smooth | glitch | liquid | precise | bouncy | cinematic).

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CATEGORY_THEMES from '../../lib/categoryThemes';
import { COLORS, RADIUS, FS, MQ, SPRING, EASE } from '../../lib/designTokens';
import { FadeUp, Stagger, StaggerItem, ScanlineOverlay } from './motion';
import { Pill, ThemedButton } from './ui';

// ── Themed tool tile (style varies per anim feel) ───────────────────────────
function ThemedToolTile({ theme, tool, onClick, index = 0 }) {
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
      {/* Glitch scanline accent on hover */}
      {feel === 'glitch' && hov && <ScanlineOverlay color={`${theme.color}44`} />}

      {/* Liquid gradient blob accent */}
      {feel === 'liquid' && (
        <div aria-hidden style={{
          position: 'absolute', inset: -20, opacity: hov ? 0.6 : 0.25,
          background: `radial-gradient(circle at 30% 20%, ${theme.tint25} 0%, transparent 60%)`,
          transition: 'opacity 0.3s', pointerEvents: 'none',
        }} />
      )}

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12, position: 'relative', zIndex: 1,
      }}>
        <span style={{
          width: 36, height: 36, borderRadius: feel === 'precise' ? 6 : 10,
          background: hov ? theme.gradient : theme.tint12,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, transition: 'background 0.25s',
          boxShadow: hov ? `0 4px 14px ${theme.tint25}` : 'none',
        }}>
          {tool.icon || theme.motif || '•'}
        </span>
        <motion.span
          animate={{ x: hov ? 3 : 0, opacity: hov ? 1 : 0.4 }}
          transition={SPRING.snappy}
          style={{ color: theme.color, fontSize: 15 }}
        >→</motion.span>
      </div>

      <div style={{
        fontFamily: isMono ? theme.fonts.mono : theme.fonts.head,
        fontSize: 14.5,
        fontWeight: 700,
        color: hov ? '#F8FAFC' : COLORS.text,
        letterSpacing: feel === 'precise' ? '0.005em' : '-0.01em',
        lineHeight: 1.3,
        marginBottom: 4,
        position: 'relative', zIndex: 1,
      }}>
        {tool.name}
      </div>
      <div style={{
        fontFamily: theme.fonts.body,
        fontSize: 12.5,
        color: COLORS.muted,
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        position: 'relative', zIndex: 1,
        minHeight: 36,
      }}>
        {tool.desc || tool.description || ''}
      </div>
    </motion.div>
  );
}

// ── Sub-category filter pills ───────────────────────────────────────────────
function SubcatPills({ theme, subcats, active, onChange }) {
  if (!subcats || subcats.length === 0) return null;
  const items = [{ id: 'all', name: 'All', icon: '✨' }, ...subcats];
  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap',
      marginBottom: 24,
    }}>
      {items.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
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
  );
}

// ── Trending strip ──────────────────────────────────────────────────────────
function TrendingStrip({ theme, tools, onToolClick }) {
  if (!tools.length) return null;
  return (
    <FadeUp>
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 14, fontFamily: theme.fonts.body,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 8,
            background: theme.tint12, color: theme.color, fontSize: 14,
          }}>🔥</span>
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: theme.color,
          }}>Trending in {theme.name.toLowerCase()}</span>
        </div>
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          paddingBottom: 6, scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
        }}>
          {tools.slice(0, 8).map((t) => (
            <button
              key={t.id}
              onClick={() => onToolClick?.(t.id)}
              style={{
                flex: '0 0 auto',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                minHeight: 40, padding: '8px 16px',
                background: theme.tint06,
                border: `1px solid ${theme.tint25}`,
                borderRadius: 999,
                color: COLORS.text, fontSize: 13.5, fontWeight: 600,
                fontFamily: theme.fonts.body,
                whiteSpace: 'nowrap', cursor: 'pointer',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.tint12; e.currentTarget.style.borderColor = theme.color; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme.tint06; e.currentTarget.style.borderColor = theme.tint25; }}
            >
              <span>{t.icon || theme.motif}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

// ── Cross-category CTA ──────────────────────────────────────────────────────
function ExploreOthers({ theme }) {
  const others = CATEGORY_THEMES.filter(t => t.id !== theme.id).slice(0, 6);
  return (
    <FadeUp>
      <div style={{ padding: '32px 0 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: COLORS.muted, marginBottom: 8,
          }}>Explore other categories</div>
          <div style={{
            fontFamily: theme.fonts.head, fontSize: FS.xl, fontWeight: 700,
            color: COLORS.textBright, letterSpacing: '-0.015em',
          }}>1,600+ free tools across 23 categories</div>
        </div>
        <div style={{
          display: 'grid', gap: 10,
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
        }}>
          {others.map((o) => (
            <motion.a
              key={o.id}
              href={o.pageRoute}
              whileHover={{ y: -3 }}
              transition={SPRING.smooth}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(15,23,42,0.5)',
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 12, padding: '12px 14px',
                color: COLORS.text, textDecoration: 'none',
                transition: 'border-color .2s, background .2s',
                fontFamily: o.fonts.body,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = o.tint25; e.currentTarget.style.background = o.tint06; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(15,23,42,0.5)'; }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: o.gradient, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>{o.icon}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{
                  display: 'block', fontSize: 13.5, fontWeight: 700,
                  color: COLORS.textBright, lineHeight: 1.2, fontFamily: o.fonts.head,
                }}>{o.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: o.color, marginTop: 2, fontWeight: 600 }}>
                  {o.toolCount} tools →
                </span>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function CategoryDashboard({
  theme,
  tools = [],
  subcats,                  // [{ id, name, icon }] — optional
  trendingIds,              // explicit list, else first 6 of tools
  onToolClick,              // (id) => void; default = location.hash = #/tool/<id>
  searchPlaceholder,
  showTrending = true,
  showExploreOthers = true,
}) {
  const [search, setSearch]   = useState('');
  const [activeSub, setActiveSub] = useState('all');

  const handleClick = (id) => {
    if (onToolClick) onToolClick(id);
    else window.location.hash = `#/tool/${id}`;
  };

  const trending = useMemo(() => {
    if (trendingIds?.length) return trendingIds.map(id => tools.find(t => t.id === id)).filter(Boolean);
    return tools.slice(0, 8);
  }, [tools, trendingIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tools.filter(t => {
      if (activeSub !== 'all' && t.cat !== activeSub && t.subCat !== activeSub) return false;
      if (!q) return true;
      const name = (t.name || '').toLowerCase();
      const desc = (t.desc || t.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [tools, search, activeSub]);

  return (
    <div style={{ padding: '24px 0 60px' }}>
      {/* Search */}
      <FadeUp>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 24, padding: '0 4px',
        }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 12,
            height: 52, padding: '0 16px',
            background: COLORS.surface,
            border: `1px solid ${search ? theme.color : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 14,
            transition: 'all .2s',
            boxShadow: search ? `0 0 0 3px ${theme.tint25}` : 'none',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={search ? theme.color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder || `Search ${theme.name.toLowerCase()}...`}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: COLORS.textBright, fontSize: 15, fontFamily: 'inherit', minWidth: 0,
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
                color: COLORS.muted, width: 26, height: 26, borderRadius: '50%', fontSize: 14,
              }} aria-label="Clear">×</button>
            )}
          </div>
        </div>
      </FadeUp>

      {/* Trending strip — hidden when searching */}
      {showTrending && !search && activeSub === 'all' && (
        <TrendingStrip theme={theme} tools={trending} onToolClick={handleClick} />
      )}

      {/* Subcategory pills */}
      {subcats?.length > 0 && (
        <SubcatPills theme={theme} subcats={subcats} active={activeSub} onChange={setActiveSub} />
      )}

      {/* Tool grid */}
      {filtered.length > 0 ? (
        <Stagger
          gap={0.03}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gap: 14,
          }}
        >
          {filtered.map((t, i) => (
            <StaggerItem key={t.id}>
              <ThemedToolTile theme={theme} tool={t} index={i} onClick={() => handleClick(t.id)} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div style={{
          textAlign: 'center', padding: '64px 16px',
          color: COLORS.muted, fontFamily: theme.fonts.body, fontSize: 14,
        }}>
          {search
            ? <>No tools match "<strong style={{ color: COLORS.text }}>{search}</strong>" in this category.</>
            : 'No tools to show.'}
        </div>
      )}

      {/* Cross-category exploration */}
      {showExploreOthers && (
        <div style={{ marginTop: 64 }}>
          <ExploreOthers theme={theme} />
        </div>
      )}
    </div>
  );
}
