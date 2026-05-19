// ── ToolsRift SmartOutput ────────────────────────────────────────────────────
// Themed read-only display with format switcher, copy/download baked in.
// Used as the right-pane "result" in InteractiveToolWorkspace, but works
// standalone too.
//
// Props:
//   theme      theme
//   value      string OR React node OR { value: string, html: ReactNode }
//   format     active format id (controlled by parent)
//   formats    [{ id, label, transform: (raw) => string }] — optional
//   filename   used for "Download" (default "output.txt")
//   mono       force monospace (default true)
//   empty      placeholder shown when value is empty
//   showActions show internal copy/download (default false — workspace's
//               toolbar usually owns these). Useful when SmartOutput is used
//               outside the workspace.

import { useMemo, useState } from 'react';
import { COLORS, RADIUS } from '../../lib/designTokens';
import { motion, AnimatePresence } from 'framer-motion';

function downloadString(content, filename) {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {}
}

export default function SmartOutput({
  theme,
  value = '',
  format,
  formats,
  filename = 'output.txt',
  mono = true,
  empty = 'Output will appear here.',
  showActions = false,
  style,
  customRender,
}) {
  const [copied, setCopied] = useState(false);

  const activeFormat = useMemo(() => {
    if (!formats?.length) return null;
    return formats.find((f) => f.id === format) || formats[0];
  }, [format, formats]);

  const display = useMemo(() => {
    if (customRender) return null;
    if (!value) return '';
    if (typeof value === 'string') {
      return activeFormat?.transform ? activeFormat.transform(value) : value;
    }
    if (value && typeof value === 'object' && 'value' in value) {
      const raw = value.value;
      return activeFormat?.transform ? activeFormat.transform(raw) : raw;
    }
    return value; // node
  }, [value, activeFormat, customRender]);

  const plainString = useMemo(() => {
    if (typeof display === 'string') return display;
    if (typeof value === 'string') return value;
    if (value?.value) return value.value;
    return '';
  }, [display, value]);

  const isEmpty =
    (typeof display === 'string' && display.length === 0) ||
    (display == null && !customRender);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };

  const onDownload = () => downloadString(plainString, filename);

  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(15,23,42,0.5)',
        border: `1px solid ${theme?.tint12 || COLORS.border}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 220,
        ...style,
      }}
    >
      {(formats?.length || showActions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderBottom: `1px solid ${theme?.tint12 || COLORS.border}`,
            background: 'rgba(6,9,15,0.4)',
          }}
        >
          {formats?.length > 0 && (
            <div
              style={{
                display: 'inline-flex',
                gap: 2,
                padding: 3,
                background: 'rgba(0,0,0,0.25)',
                border: `1px solid ${theme?.tint12 || COLORS.border}`,
                borderRadius: 999,
              }}
            >
              {formats.map((f) => {
                const active = f.id === (activeFormat?.id || formats[0].id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => f.onSelect?.(f.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontFamily: theme?.fonts?.body || 'inherit',
                      cursor: 'pointer',
                      border: 'none',
                      background: active ? theme?.color : 'transparent',
                      color: active ? theme?.textOnColor || '#fff' : COLORS.muted,
                      transition: 'all .15s',
                      minHeight: 28,
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ flex: 1 }} />

          {showActions && (
            <>
              <button
                type="button"
                onClick={onCopy}
                disabled={isEmpty}
                style={{
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 999,
                  background: copied ? theme?.color : 'rgba(255,255,255,0.04)',
                  color: copied ? theme?.textOnColor || '#fff' : COLORS.text,
                  border: `1px solid ${theme?.tint12 || COLORS.border}`,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isEmpty ? 'not-allowed' : 'pointer',
                  opacity: isEmpty ? 0.4 : 1,
                  fontFamily: theme?.fonts?.body || 'inherit',
                  transition: 'all .15s',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={onDownload}
                disabled={isEmpty}
                style={{
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.04)',
                  color: COLORS.text,
                  border: `1px solid ${theme?.tint12 || COLORS.border}`,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isEmpty ? 'not-allowed' : 'pointer',
                  opacity: isEmpty ? 0.4 : 1,
                  fontFamily: theme?.fonts?.body || 'inherit',
                }}
              >
                ⬇ Download
              </button>
            </>
          )}
        </div>
      )}

      <div
        style={{
          position: 'relative',
          flex: 1,
          padding: '14px 16px',
          fontFamily: mono ? (theme?.fonts?.mono || "'JetBrains Mono', monospace") : (theme?.fonts?.body || 'inherit'),
          fontSize: 13.5,
          lineHeight: 1.55,
          color: COLORS.text,
          overflowY: 'auto',
          overflowX: 'auto',
          whiteSpace: mono ? 'pre' : 'pre-wrap',
          wordBreak: mono ? 'normal' : 'break-word',
          minHeight: 180,
        }}
      >
        {customRender ? (
          customRender(plainString)
        ) : isEmpty ? (
          <span style={{ color: COLORS.faint, fontStyle: 'italic' }}>{empty}</span>
        ) : (
          display
        )}
      </div>

      <AnimatePresence>
        {copied && !showActions && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            style={{
              position: 'absolute',
              bottom: 10,
              right: 12,
              padding: '4px 10px',
              borderRadius: 999,
              background: theme?.color,
              color: theme?.textOnColor || '#fff',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              fontFamily: theme?.fonts?.body || 'inherit',
            }}
          >
            ✓ Copied
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
