// ── ToolsRift CategoryDashboard ──────────────────────────────────────────────
// Drop-in dashboard rendered as children of CategoryLayout for category landing.
// Sections (top→bottom): trending strip → search → subcat pills → themed
// tool grid → cross-category CTA.
// The visual "feel" of the grid varies by `theme.animStyleId`
// (smooth | glitch | liquid | precise | bouncy | cinematic).

import { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import CATEGORY_THEMES from '../../lib/categoryThemes';
import { COLORS, RADIUS, FS, MQ, SPRING, EASE } from '../../lib/designTokens';
import { FadeUp, Stagger, StaggerItem, ScanlineOverlay } from './motion';
import { Pill, ThemedButton } from './ui';
import { groupTools } from './ToolNavSidebar';
import { resolveIcon } from '../../lib/toolIcons';

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
        background: hov ? theme.tint12 : COLORS.surface,
        border: `1px solid ${hov ? theme.color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: feel === 'liquid' ? 16 : feel === 'precise' ? 8 : 12,
        padding: 18,
        cursor: 'pointer',
        transform: tileTransform,
        transition: 'background 0.2s, border-color 0.2s, transform 0.25s ease, box-shadow 0.25s',
        boxShadow: hov ? `0 12px 28px ${theme.color}26, 0 0 0 1px ${theme.color}33 inset` : '0 1px 2px rgba(0,0,0,0.3)',
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
          {resolveIcon(tool, theme)}
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
        color: hov ? '#CBD5E1' : COLORS.muted,
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        position: 'relative', zIndex: 1,
        minHeight: 36,
        transition: 'color 0.2s',
      }}>
        {tool.desc || tool.description || ''}
      </div>
    </motion.div>
  );
}

// ── Sub-category jump links ─────────────────────────────────────────────────
// Every tool is on the page (grouped into sections below), so these scroll to a
// section rather than filtering the grid down to it.
function SubcatPills({ theme, subcats, counts, onJump }) {
  if (!subcats || subcats.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
      {subcats.map((s) => {
        const n = counts[s.id] || 0;
        if (!n) return null;
        return (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              minHeight: 38,
              padding: '8px 14px', borderRadius: 999,
              fontSize: 13, fontWeight: 600,
              fontFamily: theme.fonts.body,
              cursor: 'pointer', whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.04)',
              color: COLORS.muted,
              border: `1px solid rgba(255,255,255,0.08)`,
              transition: 'all .2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = theme.tint12;
              e.currentTarget.style.borderColor = theme.color;
              e.currentTarget.style.color = COLORS.textBright;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = COLORS.muted;
            }}
          >
            {s.icon && <span>{s.icon}</span>}
            <span>{s.name}</span>
            <span style={{ color: theme.color, fontWeight: 700 }}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── One subcategory section: heading + its tool grid ───────────────────────
// The section is position:relative because framer-motion measures scroll offset
// against the nearest positioned ancestor and warns on a static one.
function SubcatSection({ theme, group, onToolClick, sectionRef }) {
  return (
    <section ref={sectionRef} style={{ position: 'relative', scrollMarginTop: 76, marginBottom: 40 }}>
      {group.name && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <h2 style={{
            fontFamily: theme.fonts.head, fontSize: FS.lg, fontWeight: 700,
            color: COLORS.textBright, margin: 0, letterSpacing: '-0.01em',
          }}>
            {group.name}
          </h2>
          <span style={{
            fontFamily: theme.fonts.body, fontSize: 12, fontWeight: 600,
            color: COLORS.dim,
          }}>
            {group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'}
          </span>
        </div>
      )}
      <Stagger
        gap={0.03}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
          gap: 14,
        }}
      >
        {group.tools.map((t, i) => (
          <StaggerItem key={t.id}>
            <ThemedToolTile theme={theme} tool={t} index={i} onClick={() => onToolClick(t.id)} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

// ── Trending strip — wraps cleanly, no horizontal scroll ───────────────────
function TrendingStrip({ theme, tools, onToolClick }) {
  if (!tools.length) return null;
  return (
    <FadeUp>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginBottom: 12, fontFamily: theme.fonts.body,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 7,
            background: theme.tint12, color: theme.color, fontSize: 12,
          }}>★</span>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: COLORS.muted,
          }}>Popular {theme.name.toLowerCase()}</span>
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8,
        }}>
          {tools.slice(0, 6).map((t) => (
            <button
              key={t.id}
              onClick={() => onToolClick?.(t.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                minHeight: 36, padding: '7px 14px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 8,
                color: COLORS.text, fontSize: 13, fontWeight: 500,
                fontFamily: theme.fonts.body,
                whiteSpace: 'nowrap', cursor: 'pointer',
                transition: 'all .15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = theme.tint12;
                e.currentTarget.style.borderColor = theme.color + '66';
                e.currentTarget.style.color = COLORS.textBright;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = COLORS.text;
              }}
            >
              <span style={{ fontSize: 13, opacity: 0.85 }}>{resolveIcon(t, theme)}</span>
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
          }}>669+ free tools across 23 categories</div>
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
  const [search, setSearch] = useState('');
  const sectionRefs = useRef({});

  const handleClick = (id) => {
    if (onToolClick) { onToolClick(id); return; }
    // Set the hash AND fire hashchange synchronously. The browser otherwise
    // delays the hashchange event by ~60ms while the main thread is busy, and
    // during that gap useAppRouter still shows this dashboard — the "category
    // screen flashes before the tool" bug. Dispatching it now swaps to the tool
    // in the same tick. The browser's own (duplicate) event later is a no-op.
    window.scrollTo(0, 0);
    window.location.hash = `#/tool/${id}`;
    window.dispatchEvent(new Event('hashchange'));
  };

  const trending = useMemo(() => {
    if (trendingIds?.length) return trendingIds.map(id => tools.find(t => t.id === id)).filter(Boolean);
    return tools.slice(0, 8);
  }, [tools, trendingIds]);

  const q = search.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return tools;
    return tools.filter(t => {
      const name = (t.name || '').toLowerCase();
      const desc = (t.desc || t.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [tools, q]);

  // Grouped sections when browsing; one flat result grid when searching.
  const groups  = useMemo(() => groupTools(tools, subcats), [tools, subcats]);
  const grouped = !q && groups.length > 1;

  const counts = useMemo(
    () => Object.fromEntries(groups.map(g => [g.id, g.tools.length])),
    [groups],
  );

  const jumpTo = (id) => sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

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
      {showTrending && !q && (
        <TrendingStrip theme={theme} tools={trending} onToolClick={handleClick} />
      )}

      {/* Subcategory jump links */}
      {grouped && (
        <SubcatPills theme={theme} subcats={subcats} counts={counts} onJump={jumpTo} />
      )}

      {/* Tools: grouped sections when browsing, flat results when searching */}
      {matches.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 16px',
          color: COLORS.muted, fontFamily: theme.fonts.body, fontSize: 14,
        }}>
          {search
            ? <>No tools match "<strong style={{ color: COLORS.text }}>{search}</strong>" in this category.</>
            : 'No tools to show.'}
        </div>
      ) : grouped ? (
        groups.map(g => (
          <SubcatSection
            key={g.id}
            theme={theme}
            group={g}
            onToolClick={handleClick}
            sectionRef={el => { sectionRefs.current[g.id] = el; }}
          />
        ))
      ) : (
        <Stagger
          gap={0.03}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gap: 14,
          }}
        >
          {matches.map((t, i) => (
            <StaggerItem key={t.id}>
              <ThemedToolTile theme={theme} tool={t} index={i} onClick={() => handleClick(t.id)} />
            </StaggerItem>
          ))}
        </Stagger>
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
