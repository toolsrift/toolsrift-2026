import { useState, useMemo } from 'react';
import CATEGORY_THEMES from '../lib/categoryThemes';
import { COLORS, FS } from '../lib/designTokens';
import { FadeUp, BlurUp } from './shared/motion';
import { LandingNav, CategoryMosaic, LandingFooter } from './toolsrift-main';

export default function ToolsRiftAllTools() {
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

      {/* Hero */}
      <section style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,4vw,32px) 24px', textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
        <BlurUp delay={0.05}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#A5B4FC', borderRadius: 999, padding: '7px 18px',
            fontSize: 13, fontWeight: 600,
          }}>
            <span style={{ fontSize: 14 }}>🛠️</span>
            All Free Tools · 24 Categories · No signup
          </div>
        </BlurUp>

        <BlurUp delay={0.18}>
          <h1 style={{
            margin: '24px 0 0', fontFamily: "'Sora','Inter',sans-serif",
            fontSize: FS['4xl'], fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em',
            color: '#F8FAFC',
          }}>
            Every tool. <span style={{
              backgroundImage: 'linear-gradient(135deg,#22D3EE,#A78BFA,#F472B6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>One place.</span>
          </h1>
        </BlurUp>

        <FadeUp delay={0.3}>
          <p style={{ margin: '16px auto 0', color: '#94A3B8', fontSize: FS.lg, maxWidth: 620, lineHeight: 1.55 }}>
            Browse all 24 categories of free online tools. Click any category to dive in.
          </p>
        </FadeUp>

        <FadeUp delay={0.45}>
          <div style={{
            marginTop: 28, width: 'min(560px,100%)', height: 52,
            background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
            marginLeft: 'auto', marginRight: 'auto',
            boxShadow: query ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search categories…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#F1F5F9', fontSize: 15, fontFamily: 'inherit', minWidth: 0,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}
                aria-label="Clear"
              >×</button>
            )}
          </div>
          {query && (
            <p style={{ marginTop: 10, fontSize: 13, color: '#64748B' }}>
              {filteredThemes.length} {filteredThemes.length === 1 ? 'category matches' : 'categories match'}
            </p>
          )}
        </FadeUp>
      </section>

      <CategoryMosaic id="categories" themes={filteredThemes} query={query} />
      <LandingFooter />
    </div>
  );
}
