// ── ToolsRift SmartInput ─────────────────────────────────────────────────────
// Themed multiline input with optional line numbers gutter, autoresize, and
// in-line character counter pip. Plays nicely with InteractiveToolWorkspace
// (its drag-drop overlay covers SmartInput automatically).
//
// Props:
//   theme         theme object
//   value         string
//   onChange      (string) => void
//   placeholder   string
//   rows          initial rows (default 8)
//   maxRows       cap autoresize (default 22)
//   mono          force monospace
//   lineNumbers   show gutter
//   showCount     show char counter chip in bottom-right (default true)
//   minHeight     px (default 220)
//   ariaLabel     accessibility label

import { useEffect, useRef } from 'react';
import { COLORS, RADIUS } from '../../lib/designTokens';

const LINE_HEIGHT = 21; // px — kept in sync with the textarea's line-height

export default function SmartInput({
  theme,
  value = '',
  onChange,
  placeholder = '',
  rows = 8,
  maxRows = 22,
  mono = false,
  lineNumbers = false,
  showCount = true,
  minHeight = 220,
  ariaLabel,
  style,
}) {
  const taRef = useRef(null);
  const gutterRef = useRef(null);

  // Autoresize logic — grow with content up to maxRows lines.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const max = maxRows * LINE_HEIGHT + 28;
    ta.style.height = Math.min(Math.max(minHeight, ta.scrollHeight), max) + 'px';
  }, [value, maxRows, minHeight]);

  // Sync gutter scroll with textarea scroll
  const onScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  const lineCount = value ? value.split('\n').length : 1;
  const charCount = value ? value.length : 0;

  const fontFamily = mono
    ? (theme?.fonts?.mono || "'JetBrains Mono', monospace")
    : (theme?.fonts?.body || "'Plus Jakarta Sans', sans-serif");

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        background: 'rgba(15,23,42,0.5)',
        border: `1px solid ${theme?.tint12 || COLORS.border}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        transition: 'border-color .2s, box-shadow .2s',
        ...style,
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = theme?.color || '#3B82F6';
        e.currentTarget.style.boxShadow = `0 0 0 3px ${theme?.tint12 || 'rgba(59,130,246,0.18)'}`;
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = theme?.tint12 || COLORS.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {lineNumbers && (
        <div
          ref={gutterRef}
          aria-hidden="true"
          style={{
            flexShrink: 0,
            padding: '14px 8px 14px 14px',
            background: 'rgba(0,0,0,0.18)',
            borderRight: `1px solid ${theme?.tint12 || COLORS.border}`,
            color: COLORS.faint,
            fontFamily: theme?.fonts?.mono || "'JetBrains Mono', monospace",
            fontSize: 12.5,
            lineHeight: `${LINE_HEIGHT}px`,
            textAlign: 'right',
            userSelect: 'none',
            minWidth: 40,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      )}

      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onScroll={onScroll}
        placeholder={placeholder}
        rows={rows}
        aria-label={ariaLabel || placeholder}
        spellCheck={!mono}
        style={{
          flex: 1,
          minHeight,
          width: '100%',
          padding: '14px 16px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: COLORS.textBright,
          fontFamily,
          fontSize: 14,
          lineHeight: `${LINE_HEIGHT}px`,
          resize: 'none',
        }}
      />

      {showCount && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
            background: 'rgba(6,9,15,0.7)',
            border: `1px solid ${theme?.tint12 || COLORS.border}`,
            borderRadius: 999,
            color: charCount > 0 ? theme?.color : COLORS.dim,
            fontFamily: theme?.fonts?.mono || "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.04em',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            pointerEvents: 'none',
          }}
        >
          {charCount.toLocaleString()} chars
          {lineCount > 1 && <span style={{ color: COLORS.faint }}>· {lineCount} lines</span>}
        </div>
      )}
    </div>
  );
}
