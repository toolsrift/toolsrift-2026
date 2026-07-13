// ── ToolsRift ToolNavSidebar ─────────────────────────────────────────────────
// The complete tool index for a category, grouped by subcategory, shown on every
// tool detail page. Replaces the seven hand-rolled sidebars that filtered down to
// the current tool's subcategory and hid the rest of the category.
//
// Desktop: sticky, scrollable, all groups expanded, current tool highlighted.
// Mobile:  a floating "All Tools" bar that opens a drawer with the same content.

import { useState, useMemo, useEffect, useRef } from 'react';
import { COLORS, RADIUS } from '../../lib/designTokens';
import { resolveIcon } from '../../lib/toolIcons';

// Categories above this size get a filter box — Images/Finance (50), Text (45).
const FILTER_THRESHOLD = 20;

// Group tools under their subcategory, ordered by the subcats array. Tools whose
// `cat` matches no subcat are collected into a trailing "More" group so they can
// never be dropped silently. A category with 0 or 1 subcats renders flat.
export function groupTools(tools, subcats) {
  if (!subcats || subcats.length < 2) return [{ id: null, name: null, tools }];

  const byCat = new Map(subcats.map(s => [s.id, []]));
  const orphans = [];
  for (const t of tools) {
    const bucket = byCat.get(t.cat);
    if (bucket) bucket.push(t);
    else orphans.push(t);
  }

  const groups = subcats
    .map(s => ({ id: s.id, name: s.name, tools: byCat.get(s.id) }))
    .filter(g => g.tools.length > 0);

  if (orphans.length) groups.push({ id: '_more', name: 'More', tools: orphans });
  return groups;
}

// ── One tool link ───────────────────────────────────────────────────────────
function ToolLink({ tool, theme, isActive, onNavigate, innerRef }) {
  const [hover, setHover] = useState(false);
  const active = isActive || hover;

  return (
    <a
      ref={innerRef}
      href={`${theme.pageRoute}#/tool/${tool.id}`}
      onClick={e => onNavigate(e, tool.id)}
      aria-current={isActive ? 'page' : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, minHeight: 40,
        padding: '9px 16px', textDecoration: 'none',
        background: isActive ? theme.tint12 : hover ? 'rgba(255,255,255,0.03)' : 'transparent',
        borderLeft: `2px solid ${active ? theme.color : 'transparent'}`,
        transition: 'background .15s, border-color .15s',
        fontFamily: theme.fonts.body,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1, flexShrink: 0, width: 18, textAlign: 'center' }}>
        {resolveIcon(tool, theme)}
      </span>
      <span style={{
        fontSize: 13, fontWeight: isActive ? 600 : 500,
        color: isActive ? COLORS.text : COLORS.muted,
        lineHeight: 1.3, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {tool.name}
      </span>
    </a>
  );
}

// ── The grouped list, shared by the desktop aside and the mobile drawer ─────
function ToolGroups({ groups, theme, currentToolId, onNavigate, activeRef }) {
  return (
    <>
      {groups.map(group => (
        <div key={group.id || 'flat'}>
          {group.name && (
            <div style={{
              padding: '12px 16px 6px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: COLORS.faint,
              fontFamily: theme.fonts.body,
            }}>
              {group.name}
            </div>
          )}
          {group.tools.map(t => (
            <ToolLink
              key={t.id}
              tool={t}
              theme={theme}
              isActive={t.id === currentToolId}
              onNavigate={onNavigate}
              innerRef={t.id === currentToolId ? activeRef : undefined}
            />
          ))}
        </div>
      ))}
    </>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function ToolNavSidebar({ theme, tools = [], subcats, currentToolId, onNavigate }) {
  const [query, setQuery]   = useState('');
  const [drawer, setDrawer] = useState(false);
  const activeRef = useRef(null);
  const scrollRef = useRef(null);

  const showFilter = tools.length > FILTER_THRESHOLD;

  // Searching collapses the grouping into one flat result list.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groupTools(tools, subcats);
    const hits = tools.filter(t => t.name.toLowerCase().includes(q));
    return [{ id: '_results', name: `${hits.length} match${hits.length === 1 ? '' : 'es'}`, tools: hits }];
  }, [tools, subcats, query]);

  // Long categories can scroll the current tool out of view on load.
  useEffect(() => {
    if (!query && activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [currentToolId]);

  // Close the drawer whenever the tool changes.
  useEffect(() => { setDrawer(false); }, [currentToolId]);

  if (!tools.length) return null;

  const currentTool = tools.find(t => t.id === currentToolId);

  const filterBox = showFilter && (
    <div style={{ padding: '10px 12px', borderBottom: `1px solid ${COLORS.borderLight}` }}>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={`Filter ${tools.length} tools…`}
        aria-label={`Filter ${theme.name}`}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: COLORS.bg, color: COLORS.text,
          border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.sm,
          padding: '8px 10px', fontSize: 13, minHeight: 36,
          fontFamily: theme.fonts.body, outline: 'none',
        }}
        onFocus={e => { e.target.style.borderColor = theme.color; }}
        onBlur={e => { e.target.style.borderColor = COLORS.border; }}
      />
    </div>
  );

  const list = (
    <ToolGroups
      groups={groups}
      theme={theme}
      currentToolId={currentToolId}
      onNavigate={onNavigate}
      activeRef={activeRef}
    />
  );

  return (
    <>
      <style>{`
        .tns-aside  { display: none; }
        .tns-mobile { display: flex; }
        @media (min-width: 1024px) {
          .tns-aside  { display: block; }
          .tns-mobile { display: none !important; }
        }
      `}</style>

      {/* Desktop */}
      <aside className="tns-aside" style={{ alignSelf: 'start' }}>
        <div style={{
          position: 'sticky', top: 72,
          background: COLORS.surface,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: RADIUS.lg,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${COLORS.borderLight}` }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: COLORS.dim,
              fontFamily: theme.fonts.body,
            }}>
              All {tools.length} {theme.name}
            </div>
          </div>

          {filterBox}

          <nav
            ref={scrollRef}
            aria-label={`${theme.name} index`}
            style={{ padding: '2px 0 8px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
          >
            {list}
          </nav>
        </div>
      </aside>

      {/* Mobile: bottom bar */}
      <div className="tns-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(6,9,15,0.96)', backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${COLORS.border}`,
        padding: '12px 16px', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: theme.fonts.body,
      }}>
        <span style={{
          fontSize: 13, color: COLORS.muted, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '58%',
        }}>
          {currentTool ? `${resolveIcon(currentTool, theme)} ${currentTool.name}` : theme.name}
        </span>
        <button
          onClick={() => setDrawer(d => !d)}
          aria-expanded={drawer}
          style={{
            background: theme.color, color: theme.textOnColor || '#fff',
            border: 'none', borderRadius: RADIUS.sm, padding: '8px 16px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: theme.fonts.body, minHeight: 44, flexShrink: 0,
          }}
        >
          {drawer ? '✕ Close' : `☰ All ${tools.length}`}
        </button>
      </div>

      {/* Mobile: drawer */}
      {drawer && (
        <div className="tns-mobile" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 199,
          background: COLORS.surface, borderTop: `2px solid ${theme.color}`,
          maxHeight: '64vh', overflowY: 'auto', padding: '0 0 84px',
          flexDirection: 'column',
        }}>
          {filterBox}
          {list}
        </div>
      )}
    </>
  );
}
