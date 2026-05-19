// ── ToolsRift SmartFileDrop ──────────────────────────────────────────────────
// Themed drag-and-drop file zone with click-to-select fallback. Use directly
// as an input replacement, OR let InteractiveToolWorkspace own a page-wide
// drop overlay.
//
// Props:
//   theme       theme
//   accept      MIME or extension filter (default '*')
//   multiple    allow multiple files
//   onFiles     (FileList) => void
//   files       optional controlled state — array of File objects (for chips)
//   onRemove    (index) => void — remove a chip
//   hint        sub-label (e.g. "Up to 50 MB · stays local")
//   variant     'block' (default) | 'compact'
//   icon        override icon (default 📥)

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS, RADIUS } from '../../lib/designTokens';

function humanSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function SmartFileDrop({
  theme,
  accept = '*',
  multiple = false,
  onFiles,
  files,
  onRemove,
  hint = 'Files stay in your browser — never uploaded.',
  variant = 'block',
  icon = '📥',
  style,
}) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const compact = variant === 'compact';

  const handle = (list) => {
    if (!list || !list.length) return;
    onFiles?.(list);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      <motion.label
        htmlFor={`tr-filedrop-${theme?.id || 'x'}`}
        onDragEnter={(e) => { e.preventDefault(); setOver(true); }}
        onDragOver={(e)  => { e.preventDefault(); setOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setOver(false); }}
        onDrop={(e)      => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}
        animate={over ? { scale: 1.005 } : { scale: 1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 12 : 16,
          padding: compact ? '14px 18px' : '24px 22px',
          background: over
            ? `linear-gradient(135deg, ${theme?.tint25 || 'rgba(59,130,246,0.18)'}, ${theme?.tint06 || 'rgba(59,130,246,0.04)'})`
            : 'rgba(15,23,42,0.5)',
          border: over
            ? `2px dashed ${theme?.color || '#3B82F6'}`
            : `2px dashed ${theme?.tint25 || 'rgba(255,255,255,0.12)'}`,
          borderRadius: RADIUS.lg,
          cursor: 'pointer',
          transition: 'background .2s, border-color .2s',
          minHeight: compact ? 60 : 130,
          fontFamily: theme?.fonts?.body || "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: compact ? 40 : 56,
            height: compact ? 40 : 56,
            borderRadius: 14,
            background: over ? theme?.gradient : (theme?.tint12 || 'rgba(255,255,255,0.04)'),
            color: over ? (theme?.textOnColor || '#fff') : theme?.color || COLORS.muted,
            fontSize: compact ? 20 : 26,
            boxShadow: over ? `0 8px 24px ${theme?.tint25}` : 'none',
            transition: 'all .2s',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: compact ? 14 : 15.5,
              fontWeight: 700,
              color: COLORS.textBright,
              fontFamily: theme?.fonts?.head || 'inherit',
              letterSpacing: '-0.01em',
            }}
          >
            {over ? 'Drop to load' : compact ? 'Drag a file here, or click to choose' : 'Drop a file here'}
          </div>
          {!compact && (
            <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4, lineHeight: 1.5 }}>
              or <span style={{ color: theme?.color, fontWeight: 600 }}>click to choose</span> · {hint}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          id={`tr-filedrop-${theme?.id || 'x'}`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handle(e.target.files)}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />
      </motion.label>

      {files?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Array.from(files).map((f, i) => (
            <span
              key={`${f.name}-${i}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px 6px 12px',
                background: theme?.tint06 || 'rgba(255,255,255,0.04)',
                border: `1px solid ${theme?.tint25 || 'rgba(255,255,255,0.1)'}`,
                borderRadius: 999,
                color: COLORS.text,
                fontSize: 12.5,
                fontFamily: theme?.fonts?.body || 'inherit',
                maxWidth: 280,
              }}
            >
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                📄 {f.name}
              </span>
              <span style={{ color: COLORS.dim, fontSize: 11 }}>{humanSize(f.size)}</span>
              {onRemove && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); onRemove(i); }}
                  aria-label="Remove file"
                  style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: 'none', background: 'rgba(255,255,255,0.06)',
                    color: COLORS.muted, cursor: 'pointer', fontSize: 12,
                    lineHeight: 1, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >×</button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
