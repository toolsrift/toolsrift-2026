// ── ToolsRift Themed UI Primitives ───────────────────────────────────────────
// Theme-aware atomic components. Every primitive accepts a `theme` prop
// (from lib/categoryThemes.js) and renders with that micro-brand's identity.
// Mobile-first: 44px tap targets, fluid typography, sticky bottom action bars.

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, RADIUS, SPACE, FS, SHADOW, SPRING, EASE, TAP_TARGET_MIN, MQ } from '../../lib/designTokens';

// ── ThemedButton ────────────────────────────────────────────────────────────
export function ThemedButton({
  theme,
  variant = 'solid',     // solid | outline | ghost | gradient
  size    = 'md',        // sm | md | lg
  href,
  onClick,
  children,
  iconLeft,
  iconRight,
  fullWidth,
  style,
  ...rest
}) {
  const sizes = {
    sm: { h: 36, px: 14, fs: 13 },
    md: { h: 44, px: 18, fs: 14 },
    lg: { h: 54, px: 26, fs: 16 },
  }[size];

  const variants = {
    solid: {
      background: theme?.color || '#3B82F6',
      color: theme?.textOnColor || '#fff',
      border: '1px solid transparent',
    },
    gradient: {
      background: theme?.gradient || 'linear-gradient(135deg,#3B82F6,#2563EB)',
      color: theme?.textOnColor || '#fff',
      border: '1px solid transparent',
      boxShadow: theme?.glowSoft,
    },
    outline: {
      background: 'transparent',
      color: theme?.color || COLORS.text,
      border: `1px solid ${theme?.color || COLORS.borderStrong}`,
    },
    ghost: {
      background: theme?.tint06 || 'rgba(255,255,255,0.04)',
      color: COLORS.text,
      border: '1px solid ' + (theme?.tint12 || COLORS.border),
    },
  }[variant];

  const Comp = href ? motion.a : motion.button;
  return (
    <Comp
      href={href}
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: theme?.glowSoft || SHADOW.md }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING.snappy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: sizes.h,
        minHeight: TAP_TARGET_MIN,
        padding: `0 ${sizes.px}px`,
        borderRadius: RADIUS.full,
        fontSize: sizes.fs,
        fontWeight: 600,
        fontFamily: theme?.fonts?.body || "'Plus Jakarta Sans',sans-serif",
        letterSpacing: '-0.01em',
        cursor: 'pointer',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : 'auto',
        ...variants,
        ...style,
      }}
      {...rest}
    >
      {iconLeft && <span style={{ display: 'inline-flex' }}>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span style={{ display: 'inline-flex' }}>{iconRight}</span>}
    </Comp>
  );
}

// ── ThemedInput ─────────────────────────────────────────────────────────────
export function ThemedInput({ theme, type = 'text', label, hint, error, style, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: theme?.fonts?.body || "'Plus Jakarta Sans',sans-serif" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>{label}</span>}
      <input
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          minHeight: TAP_TARGET_MIN,
          height: 46,
          padding: '0 14px',
          background: COLORS.surface,
          border: `1px solid ${error ? '#EF4444' : focused ? (theme?.color || '#3B82F6') : COLORS.border}`,
          borderRadius: RADIUS.md,
          color: COLORS.textBright,
          fontSize: 15,
          outline: 'none',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          boxShadow: focused ? `0 0 0 3px ${theme?.tint12 || 'rgba(59,130,246,0.18)'}` : 'none',
          fontFamily: 'inherit',
          ...style,
        }}
        {...rest}
      />
      {hint && !error && <span style={{ fontSize: 12, color: COLORS.dim }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: '#F87171' }}>{error}</span>}
    </label>
  );
}

// ── ThemedTextarea ──────────────────────────────────────────────────────────
export function ThemedTextarea({ theme, label, rows = 6, style, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: theme?.fonts?.body || "'Plus Jakarta Sans',sans-serif" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>{label}</span>}
      <textarea
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '12px 14px',
          background: COLORS.surface,
          border: `1px solid ${focused ? (theme?.color || '#3B82F6') : COLORS.border}`,
          borderRadius: RADIUS.md,
          color: COLORS.textBright,
          fontSize: 14,
          fontFamily: theme?.fonts?.mono || "'JetBrains Mono',monospace",
          outline: 'none',
          resize: 'vertical',
          minHeight: 120,
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          boxShadow: focused ? `0 0 0 3px ${theme?.tint12 || 'rgba(59,130,246,0.18)'}` : 'none',
          ...style,
        }}
        {...rest}
      />
    </label>
  );
}

// ── ThemedCard ──────────────────────────────────────────────────────────────
export function ThemedCard({ theme, children, hoverable = true, padding = 'clamp(16px,3vw,24px)', style, ...rest }) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, borderColor: theme?.tint25 || COLORS.borderStrong } : undefined}
      transition={SPRING.smooth}
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.xl,
        padding,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// ── Pill / Badge ────────────────────────────────────────────────────────────
export function Pill({ theme, children, variant = 'tint', icon, style }) {
  const styles = variant === 'solid'
    ? { background: theme?.color, color: theme?.textOnColor || '#fff' }
    : variant === 'outline'
    ? { background: 'transparent', color: theme?.color, border: `1px solid ${theme?.color}` }
    : { background: theme?.tint12, color: theme?.color, border: `1px solid ${theme?.tint25}` };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      borderRadius: RADIUS.full,
      fontSize: 11, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      fontFamily: "'Plus Jakarta Sans',sans-serif",
      ...styles, ...style,
    }}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

// ── SectionHeading ──────────────────────────────────────────────────────────
export function SectionHeading({ theme, eyebrow, title, sub, align = 'center', style }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === 'center' ? 720 : 'none', margin: align === 'center' ? '0 auto 32px' : '0 0 32px', ...style }}>
      {eyebrow && (
        <div style={{
          display: 'inline-block',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: theme?.color || COLORS.muted,
          marginBottom: 12,
        }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontFamily: theme?.fonts?.head || "'Sora',sans-serif",
        fontWeight: 700,
        fontSize: FS['3xl'],
        color: COLORS.textBright,
        margin: 0,
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
      }}>
        {title}
      </h2>
      {sub && (
        <p style={{
          fontFamily: theme?.fonts?.body || "'Plus Jakarta Sans',sans-serif",
          fontSize: FS.lg,
          color: COLORS.muted,
          margin: '12px 0 0',
          lineHeight: 1.6,
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ── ToolShell — universal tool page wrapper ─────────────────────────────────
export function ToolShell({ theme, children, sidebar, style }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0,1fr)',
      gap: 24,
      alignItems: 'start',
      ...style,
    }}>
      <style>{`
        @media ${MQ.lg} {
          .tr-toolshell { grid-template-columns: ${sidebar ? '1fr 320px' : '1fr'} !important; }
        }
      `}</style>
      <div className="tr-toolshell" style={{ display: 'contents' }}>
        <div style={{ minWidth: 0 }}>{children}</div>
        {sidebar && <aside style={{ minWidth: 0 }}>{sidebar}</aside>}
      </div>
    </div>
  );
}

// ── ToolWorkspace — responsive input/output split ───────────────────────────
// Desktop: 2 columns (input | output). Mobile: tabs (input <-> output).
// Pass `inputLabel` / `outputLabel` (default "Input" / "Output") and the two
// children via `input` and `output` props.

export function ToolWorkspace({
  theme,
  input,
  output,
  inputLabel  = 'Input',
  outputLabel = 'Output',
  layout      = 'split',     // 'split' | 'stacked' (always single column)
  defaultPane = 'input',     // mobile: which pane shows first
  style,
}) {
  const [pane, setPane] = useState(defaultPane);

  if (layout === 'stacked') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, ...style }}>
        <div>{input}</div>
        {output && <div>{output}</div>}
      </div>
    );
  }

  return (
    <div style={style}>
      {/* Mobile pane tabs (hidden on lg+) */}
      <div data-tr-mobile-tabs>
        <style>{`
          [data-tr-mobile-tabs]{ display:block; margin-bottom:14px; }
          @media ${MQ.lg}{ [data-tr-mobile-tabs]{ display:none; } }
          [data-tr-mobile-grid]{ display:grid; grid-template-columns:1fr; gap:18px; }
          @media ${MQ.lg}{ [data-tr-mobile-grid]{ grid-template-columns:1fr 1fr; gap:24px; } }
          [data-tr-pane="input"]  [data-tr-out]{ display:none; }
          [data-tr-pane="output"] [data-tr-in]{ display:none; }
          @media ${MQ.lg}{
            [data-tr-pane] [data-tr-in], [data-tr-pane] [data-tr-out]{ display:block !important; }
          }
        `}</style>
        <MobileTabs
          theme={theme}
          tabs={[
            { id: 'input',  label: inputLabel  },
            { id: 'output', label: outputLabel },
          ]}
          active={pane}
          onChange={setPane}
        />
      </div>

      <div data-tr-pane={pane} data-tr-mobile-grid>
        <div data-tr-in>{input}</div>
        {output && <div data-tr-out>{output}</div>}
      </div>
    </div>
  );
}

// ── StickyActionBar — mobile bottom bar for primary tool actions ────────────
export function StickyActionBar({ theme, children, visible = true }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        zIndex: 90,
        padding: 'max(12px, env(safe-area-inset-bottom)) 16px 12px',
        background: 'rgba(6,9,15,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${theme?.tint25 || COLORS.border}`,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.3s ease',
        display: 'flex',
        gap: 8,
      }}
      data-mobile-only
    >
      <style>{`@media ${MQ.lg}{[data-mobile-only]{display:none!important}}`}</style>
      {children}
    </div>
  );
}

// ── MobileTabs — segmented control for switching panes on mobile ────────────
export function MobileTabs({ theme, tabs = [], active, onChange, style }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.full,
        ...style,
      }}
    >
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange?.(t.id)}
            style={{
              flex: 1,
              minHeight: TAP_TARGET_MIN,
              padding: '8px 14px',
              border: 'none',
              borderRadius: RADIUS.full,
              background: isActive ? (theme?.color || '#3B82F6') : 'transparent',
              color: isActive ? (theme?.textOnColor || '#fff') : COLORS.muted,
              fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ── CopyButton ──────────────────────────────────────────────────────────────
export function CopyButton({ theme, text, label = 'Copy', size = 'sm', style, ...rest }) {
  const [done, setDone] = useState(false);
  const onClick = async () => {
    try { await navigator.clipboard.writeText(text || ''); setDone(true); setTimeout(() => setDone(false), 1600); } catch {}
  };
  return (
    <ThemedButton
      theme={theme}
      variant={done ? 'solid' : 'ghost'}
      size={size}
      onClick={onClick}
      style={style}
      {...rest}
    >
      {done ? '✓ Copied' : label}
    </ThemedButton>
  );
}

// ── ThemedSelect ────────────────────────────────────────────────────────────
export function ThemedSelect({ theme, label, options = [], style, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontFamily: theme?.fonts?.body || "'Plus Jakarta Sans',sans-serif" }}>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted }}>{label}</span>}
      <select
        style={{
          minHeight: TAP_TARGET_MIN,
          height: 46,
          padding: '0 14px',
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: RADIUS.md,
          color: COLORS.textBright,
          fontSize: 14,
          outline: 'none',
          fontFamily: 'inherit',
          ...style,
        }}
        {...rest}
      >
        {options.map(o =>
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </label>
  );
}

// ── Divider ─────────────────────────────────────────────────────────────────
export function Divider({ theme, label, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', ...style }}>
      <span style={{ flex: 1, height: 1, background: COLORS.border }} />
      {label && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme?.color || COLORS.dim }}>{label}</span>}
      <span style={{ flex: 1, height: 1, background: COLORS.border }} />
    </div>
  );
}

// ── BackgroundFX — themed mesh + blobs (decorative) ─────────────────────────
export function BackgroundFX({ theme, intensity = 1, style }) {
  return (
    <div aria-hidden style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: theme?.bgMesh,
        opacity: intensity,
      }} />
    </div>
  );
}
