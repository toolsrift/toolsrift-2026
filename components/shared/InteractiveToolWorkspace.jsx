// ── ToolsRift InteractiveToolWorkspace ───────────────────────────────────────
// The smart frame around a tool. Provides everything a tool page needs except
// the actual logic:
//   • sticky toolbar  : title · status chip · Load Sample · Clear · Copy · Share · Download
//   • resizable split : input | output (desktop) — tab-swap on mobile
//   • drag-drop file overlay (page-wide while dragging if `accept` is set)
//   • keyboard shortcuts: Ctrl+Enter run · Ctrl+L clear · Ctrl+Shift+C copy · ? help
//   • shareable URL state (encoded into location.hash after the tool route)
//   • status bar     : char/line counts + processing time
//   • floating action button on mobile
//
// Slots (children):
//   <InteractiveToolWorkspace.Input>...</InteractiveToolWorkspace.Input>
//   <InteractiveToolWorkspace.Output>...</InteractiveToolWorkspace.Output>
//   <InteractiveToolWorkspace.Controls>...</InteractiveToolWorkspace.Controls>  ← optional, renders above input
//
// Or pass `input` / `output` / `controls` as props.
//
// Props (most are optional):
//   theme          theme
//   tool           { id, name, icon, ... } from a tool registry
//   inputLabel     (default 'Input')
//   outputLabel    (default 'Output')
//   status         { state: 'live'|'idle'|'error'|'ok', label, detail } — toolbar chip
//   stats          { lines, chars, ms }                    — status bar
//   onLoadSample   () => void
//   onClear        () => void
//   onCopy         () => string|Promise<string> — what to copy
//   onDownload     () => { content, filename } | string
//   onShare        () => string — share URL (defaults to current location)
//   shareState     object — auto-encoded into URL hash (overrides onShare)
//   onRestoreState (state) => void — called once on mount with decoded share state
//   primaryAction  { label, onClick, icon }  — floating mobile FAB
//   acceptFiles    MIME/extension filter; enables page-wide drop overlay
//   onFiles        (FileList) => void
//   inputPaneStyle / outputPaneStyle — overrides
//   defaultPane    'input' | 'output' — mobile pane shown first
//   noStatusBar    boolean — hide the status bar

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, RADIUS, MQ, SPRING } from '../../lib/designTokens';

const SHARE_PREFIX = 's=';   // hash search param prefix
const MIN_PANE_PCT = 24;
const MAX_PANE_PCT = 76;

// ── Streak helpers (localStorage) ──────────────────────────────────────────
const STREAK_KEY = 'tr_streak_v1';
function readStreak() {
  if (typeof window === 'undefined') return { count: 0, lastDay: '', tools: [] };
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDay: '', tools: [] };
    const v = JSON.parse(raw);
    return { count: v.count || 0, lastDay: v.lastDay || '', tools: v.tools || [] };
  } catch (e) { return { count: 0, lastDay: '', tools: [] }; }
}
function bumpStreak(toolId) {
  if (typeof window === 'undefined' || !toolId) return readStreak();
  const today = new Date().toISOString().slice(0, 10);
  const prev = readStreak();
  // Same tool already counted today? do nothing.
  if (prev.lastDay === today && prev.tools.includes(toolId)) return prev;
  // New day? reset roster.
  const nextTools = prev.lastDay === today ? [...prev.tools, toolId] : [toolId];
  const nextState = { count: nextTools.length, lastDay: today, tools: nextTools };
  try { window.localStorage.setItem(STREAK_KEY, JSON.stringify(nextState)); } catch (e) {}
  return nextState;
}

// ── Confetti emoji palette — one tiny celebration burst per action ─────────
const CONFETTI_EMOJIS = ['✨', '🎉', '⭐', '💫', '🌟'];

// ── Helpers ─────────────────────────────────────────────────────────────────
function encodeState(obj) {
  try {
    const json = JSON.stringify(obj);
    return typeof btoa !== 'undefined'
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, 'utf8').toString('base64');
  } catch (e) { return ''; }
}
function decodeState(str) {
  try {
    const json = typeof atob !== 'undefined'
      ? decodeURIComponent(escape(atob(str)))
      : Buffer.from(str, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (e) { return null; }
}

function readShareFromLocation() {
  if (typeof window === 'undefined') return null;
  const h = window.location.hash || '';
  const ix = h.indexOf('?');
  if (ix === -1) return null;
  const qs = h.slice(ix + 1);
  const parts = qs.split('&');
  for (const p of parts) {
    if (p.startsWith(SHARE_PREFIX)) {
      return decodeState(decodeURIComponent(p.slice(SHARE_PREFIX.length)));
    }
  }
  return null;
}
function writeShareToLocation(state) {
  if (typeof window === 'undefined') return '';
  const encoded = encodeState(state);
  const enc = encodeURIComponent(encoded);
  let h = window.location.hash || '#/';
  const qIx = h.indexOf('?');
  const route = qIx === -1 ? h : h.slice(0, qIx);
  const newHash = `${route}?${SHARE_PREFIX}${enc}`;
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}${newHash}`);
  return `${window.location.origin}${window.location.pathname}${window.location.search}${newHash}`;
}
function clearShareFromLocation() {
  if (typeof window === 'undefined') return;
  let h = window.location.hash || '#/';
  const qIx = h.indexOf('?');
  if (qIx === -1) return;
  const route = h.slice(0, qIx);
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}${route}`);
}

// ── Status chip ─────────────────────────────────────────────────────────────
function StatusChip({ theme, status }) {
  if (!status) return null;
  const map = {
    live:  { dot: '#22D3EE', label: status.label || 'Live' },
    ok:    { dot: '#10B981', label: status.label || 'Valid' },
    idle:  { dot: COLORS.faint, label: status.label || 'Idle' },
    error: { dot: '#F87171', label: status.label || 'Error' },
  };
  const cfg = map[status.state || 'idle'];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '5px 12px',
        background: 'rgba(15,23,42,0.6)',
        border: `1px solid ${theme?.tint12 || COLORS.border}`,
        borderRadius: 999,
        fontSize: 12, fontWeight: 600,
        color: COLORS.text,
        fontFamily: theme?.fonts?.body,
        whiteSpace: 'nowrap',
      }}
    >
      <motion.span
        animate={{
          boxShadow: [`0 0 0 ${cfg.dot}00`, `0 0 8px ${cfg.dot}cc`, `0 0 0 ${cfg.dot}00`],
        }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}
      />
      <span>{cfg.label}</span>
      {status.detail && (
        <span style={{ color: COLORS.muted, fontWeight: 500 }}>· {status.detail}</span>
      )}
    </span>
  );
}

// ── Toolbar button ──────────────────────────────────────────────────────────
function TBtn({ theme, onClick, disabled, children, primary, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        border: primary
          ? 'none'
          : `1px solid ${theme?.tint12 || COLORS.border}`,
        background: primary
          ? theme?.gradient
          : 'rgba(255,255,255,0.04)',
        color: primary ? (theme?.textOnColor || '#fff') : COLORS.text,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        fontFamily: theme?.fonts?.body || 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'background .15s, transform .1s',
        whiteSpace: 'nowrap',
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

// ── Slot components ─────────────────────────────────────────────────────────
function Input({ children })    { return <>{children}</>; }
function Output({ children })   { return <>{children}</>; }
function Controls({ children }) { return <>{children}</>; }

// ── Root ────────────────────────────────────────────────────────────────────
function InteractiveToolWorkspace({
  theme,
  tool,
  inputLabel  = 'Input',
  outputLabel = 'Output',
  status,
  stats,
  onLoadSample,
  onClear,
  onCopy,
  onDownload,
  onShare,
  shareState,
  onRestoreState,
  primaryAction,
  acceptFiles,
  onFiles,
  defaultPane = 'input',
  noStatusBar = false,
  input,
  output,
  controls,
  children,
  style,
}) {
  // Slot extraction — accept either props or children components.
  const childArr = Array.isArray(children) ? children : children ? [children] : [];
  const childInput    = childArr.find((c) => c?.type === Input)?.props?.children    ?? input;
  const childOutput   = childArr.find((c) => c?.type === Output)?.props?.children   ?? output;
  const childControls = childArr.find((c) => c?.type === Controls)?.props?.children ?? controls;

  // Mobile pane state
  const [pane, setPane] = useState(defaultPane);
  // Resizable split state (percentage of left/input pane width)
  const [splitPct, setSplitPct] = useState(50);
  const splitRef = useRef(null);
  const draggingRef = useRef(false);

  // Drag-drop overlay state
  const [dragOver, setDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  // Copy/share feedback
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  // Gamification — streak, confetti burst, done badge
  const [streak, setStreak] = useState({ count: 0, lastDay: '', tools: [] });
  const [confetti, setConfetti] = useState([]);
  const [showDoneBadge, setShowDoneBadge] = useState(false);

  // Help dialog
  const [helpOpen, setHelpOpen] = useState(false);

  // ── Restore share state on mount ────────────────────────────────────────
  useEffect(() => {
    if (!onRestoreState) return;
    const s = readShareFromLocation();
    if (s) onRestoreState(s);
    // We deliberately do NOT clear it here; let the user keep the deep-link.
  }, [onRestoreState]);

  // ── Hydrate today's streak ──────────────────────────────────────────────
  useEffect(() => {
    setStreak(readStreak());
  }, []);

  // ── Bump streak the first time the tool reaches an OK/Live state ───────
  const bumpedRef = useRef(false);
  useEffect(() => {
    if (bumpedRef.current) return;
    if (!tool?.id) return;
    if (status?.state === 'ok' || status?.state === 'live') {
      bumpedRef.current = true;
      setStreak(bumpStreak(tool.id));
    }
  }, [status, tool]);

  // ── Confetti burst helper ──────────────────────────────────────────────
  const burstConfetti = useCallback(() => {
    const burst = Array.from({ length: 9 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
      dx: (Math.random() - 0.5) * 220,
      dy: -60 - Math.random() * 80,
      rot: (Math.random() - 0.5) * 60,
    }));
    setConfetti(burst);
    setTimeout(() => setConfetti([]), 1100);
  }, []);

  // ── Floating "Done!" badge helper ──────────────────────────────────────
  const flashDoneBadge = useCallback(() => {
    setShowDoneBadge(true);
    setTimeout(() => setShowDoneBadge(false), 1600);
  }, []);

  // ── Keep URL state in sync with shareState (auto-encode) ────────────────
  useEffect(() => {
    if (shareState == null) return;
    writeShareToLocation(shareState);
  }, [shareState]);

  // ── Drag-drop file overlay ──────────────────────────────────────────────
  useEffect(() => {
    if (!acceptFiles && !onFiles) return;
    const onDragEnter = (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      setDragOver(true);
    };
    const onDragOver = (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return;
      e.preventDefault();
    };
    const onDragLeave = () => {
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setDragOver(false);
    };
    const onDrop = (e) => {
      if (!e.dataTransfer?.types?.includes('Files')) return;
      e.preventDefault();
      dragCounterRef.current = 0;
      setDragOver(false);
      if (e.dataTransfer.files?.length) onFiles?.(e.dataTransfer.files);
    };
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover',  onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop',      onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover',  onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop',      onDrop);
    };
  }, [acceptFiles, onFiles]);

  // ── Resizable split (desktop only — JS pointer handlers) ───────────────
  const onSplitDown = (e) => {
    draggingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };
  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current || !splitRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.min(MAX_PANE_PCT, Math.max(MIN_PANE_PCT, (x / rect.width) * 100));
      setSplitPct(pct);
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────
  const doCopy = useCallback(async () => {
    let text = '';
    if (onCopy) {
      const r = onCopy();
      text = typeof r === 'string' ? r : await Promise.resolve(r);
    }
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      burstConfetti();
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  }, [onCopy, burstConfetti]);

  const doDownload = useCallback(() => {
    if (!onDownload) return;
    const r = onDownload();
    const content = typeof r === 'string' ? r : r?.content;
    const filename = (typeof r === 'object' && r?.filename) || `${tool?.id || 'output'}.txt`;
    if (!content) return;
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      flashDoneBadge();
    } catch (e) {}
  }, [onDownload, tool, flashDoneBadge]);

  const doShare = useCallback(async () => {
    let url = '';
    if (onShare) {
      url = onShare();
    } else if (shareState != null) {
      url = writeShareToLocation(shareState);
    } else if (typeof window !== 'undefined') {
      url = window.location.href;
    }
    if (!url) return;
    try { await navigator.clipboard.writeText(url); } catch (e) {}
    setShareUrl(url);
    setTimeout(() => setShareUrl(null), 2200);
  }, [onShare, shareState]);

  const doClear = useCallback(() => {
    onClear?.();
    clearShareFromLocation();
  }, [onClear]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      // ? key — toggle help (when no input focused)
      if (e.key === '?' && !(e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA')) {
        setHelpOpen((o) => !o);
        e.preventDefault();
        return;
      }
      if (!isMod) return;
      if (e.key === 'Enter' && primaryAction?.onClick) {
        e.preventDefault(); primaryAction.onClick();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault(); doClear();
      } else if (e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault(); doCopy();
      } else if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault(); doShare();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [primaryAction, doClear, doCopy, doShare]);

  const hasActions = !!(onCopy || onDownload || onLoadSample || onClear || (onShare || shareState != null));
  const showOutput = !!childOutput;

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'relative',
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        marginBottom: 36,
        ...style,
      }}
    >
      {/* Theme gradient accent ribbon */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: theme?.gradient,
          opacity: 0.85,
          zIndex: 1,
        }}
      />

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          padding: '12px 14px',
          background: 'rgba(13,17,23,0.92)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          borderBottom: `1px solid ${theme?.tint12 || COLORS.border}`,
          fontFamily: theme?.fonts?.body,
        }}
      >
        <span
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            paddingRight: 10, borderRight: `1px solid ${theme?.tint12 || COLORS.border}`,
          }}
        >
          <span
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: theme?.gradient,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: theme?.textOnColor || '#fff', fontSize: 14,
              boxShadow: `0 4px 12px ${theme?.tint25}`,
            }}
            aria-hidden
          >
            {tool?.icon || theme?.motif || '⚡'}
          </span>
          <span
            style={{
              fontFamily: theme?.fonts?.head,
              fontSize: 14.5,
              fontWeight: 700,
              color: COLORS.textBright,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 240,
            }}
          >
            {tool?.name || 'Workspace'}
          </span>
        </span>

        <StatusChip theme={theme} status={status} />

        {streak.count > 0 && (
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={SPRING.smooth}
            title={`You've used ${streak.count} different tool${streak.count===1?'':'s'} today.`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              borderRadius: 999,
              background: theme?.tint12,
              border: `1px solid ${theme?.tint25}`,
              color: theme?.color,
              fontSize: 12, fontWeight: 700,
              fontFamily: theme?.fonts?.body,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
          >
            <span aria-hidden style={{ fontSize: 13 }}>🔥</span>
            <span>{streak.count} today</span>
          </motion.span>
        )}

        <div style={{ flex: 1 }} />

        {hasActions && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {onLoadSample && (
              <TBtn theme={theme} onClick={() => { onLoadSample(); flashDoneBadge(); }} title="Load sample data">
                ✨ Sample
              </TBtn>
            )}
            {onClear && (
              <TBtn theme={theme} onClick={doClear} title="Clear input (Ctrl+L)">
                ✕ Clear
              </TBtn>
            )}
            {onCopy && (
              <TBtn theme={theme} onClick={doCopy} title="Copy output (Ctrl+Shift+C)">
                {copied ? '✓ Copied' : '⧉ Copy'}
              </TBtn>
            )}
            {(onShare || shareState != null) && (
              <TBtn theme={theme} onClick={doShare} title="Share link (Ctrl+Shift+S)">
                {shareUrl ? '✓ Link copied' : '🔗 Share'}
              </TBtn>
            )}
            {onDownload && (
              <TBtn theme={theme} onClick={doDownload} title="Download result">
                ⬇ Download
              </TBtn>
            )}
            <button
              type="button"
              onClick={() => setHelpOpen((o) => !o)}
              title="Show keyboard shortcuts (?)"
              aria-label="Show keyboard shortcuts"
              style={{
                width: 30, height: 30,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${theme?.tint12 || COLORS.border}`,
                color: COLORS.muted, cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
              }}
            >?</button>
          </div>
        )}

        {/* Confetti micro-burst — fires from the toolbar on Copy success */}
        <AnimatePresence>
          {confetti.length > 0 && (
            <span
              aria-hidden
              style={{
                position: 'absolute', top: '50%', right: 80,
                pointerEvents: 'none', zIndex: 20,
              }}
            >
              {confetti.map((c) => (
                <motion.span
                  key={c.id}
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0, rotate: 0 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: 1, x: c.dx, y: c.dy, rotate: c.rot }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute', top: 0, right: 0,
                    fontSize: 16, lineHeight: 1,
                  }}
                >{c.emoji}</motion.span>
              ))}
            </span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Optional controls strip (above the split) ─────────────────── */}
      {childControls && (
        <div style={{ padding: 14, borderBottom: `1px solid ${theme?.tint12 || COLORS.border}` }}>
          {childControls}
        </div>
      )}

      {/* ── Split / Tabbed body ───────────────────────────────────────── */}
      <style>{`
        .tr-itw-mobile-tabs { display: flex; }
        .tr-itw-grid { display: grid; grid-template-columns: 1fr; gap: 0; }
        .tr-itw-pane { padding: 14px; }
        .tr-itw-divider { display: none; }
        @media ${MQ.md} {
          .tr-itw-mobile-tabs { display: none; }
          .tr-itw-grid {
            grid-template-columns: var(--tr-itw-left,50%) 8px var(--tr-itw-right,50%);
          }
          .tr-itw-divider {
            display: block;
            cursor: col-resize;
            background: linear-gradient(90deg, transparent, var(--tr-itw-divider, rgba(255,255,255,0.08)), transparent);
            position: relative;
          }
          .tr-itw-divider::after {
            content:''; position:absolute; left:50%; top:50%;
            width:2px; height:32px; transform:translate(-50%,-50%);
            background: var(--tr-itw-handle, rgba(255,255,255,0.2));
            border-radius:1px;
          }
          .tr-itw-pane-input  { grid-column: 1 / 2; padding: 18px; }
          .tr-itw-pane-divide { grid-column: 2 / 3; }
          .tr-itw-pane-output { grid-column: 3 / 4; padding: 18px; border-left: none; }
        }
      `}</style>

      {/* Mobile tabs */}
      {showOutput && (
        <div className="tr-itw-mobile-tabs" style={{ padding: '10px 14px 0' }}>
          <div
            role="tablist"
            style={{
              display: 'flex',
              gap: 4,
              padding: 3,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${theme?.tint12 || COLORS.border}`,
              borderRadius: 999,
              width: '100%',
            }}
          >
            {[
              { id: 'input',  label: inputLabel },
              { id: 'output', label: outputLabel },
            ].map((t) => {
              const active = t.id === pane;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPane(t.id)}
                  style={{
                    flex: 1,
                    minHeight: 36,
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: 999,
                    background: active ? theme?.color : 'transparent',
                    color: active ? (theme?.textOnColor || '#fff') : COLORS.muted,
                    fontWeight: 600, fontSize: 13,
                    fontFamily: theme?.fonts?.body || 'inherit',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div
        ref={splitRef}
        className="tr-itw-grid"
        style={{
          '--tr-itw-left':  `${splitPct}%`,
          '--tr-itw-right': `${100 - splitPct}%`,
          '--tr-itw-divider': theme?.tint25,
          '--tr-itw-handle':  theme?.color,
        }}
      >
        {/* INPUT pane */}
        <div
          className={`tr-itw-pane ${showOutput ? 'tr-itw-pane-input' : ''}`}
          style={{
            display: pane === 'input' || !showOutput ? 'block' : 'none',
          }}
        >
          {showOutput && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10, fontFamily: theme?.fonts?.body,
              }}
              className="tr-itw-pane-label"
            >
              <span
                style={{
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: theme?.color,
                }}
              >
                {inputLabel}
              </span>
            </div>
          )}
          {childInput}
        </div>

        {/* Divider (desktop only) */}
        {showOutput && (
          <div
            className="tr-itw-divider tr-itw-pane-divide"
            onMouseDown={onSplitDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize panes"
          />
        )}

        {/* OUTPUT pane */}
        {showOutput && (
          <div
            className="tr-itw-pane tr-itw-pane-output"
            style={{
              display: pane === 'output' || pane === 'input' /* desktop ignores */ ? 'block' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10, fontFamily: theme?.fonts?.body,
              }}
            >
              <span
                style={{
                  fontSize: 10.5, fontWeight: 800, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: theme?.color,
                }}
              >
                {outputLabel}
              </span>
            </div>
            {childOutput}
          </div>
        )}
      </div>

      {/* ── Status bar ─────────────────────────────────────────────────── */}
      {!noStatusBar && stats && (
        <div
          style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap',
            gap: 14, padding: '10px 16px',
            background: 'rgba(0,0,0,0.25)',
            borderTop: `1px solid ${theme?.tint12 || COLORS.border}`,
            color: COLORS.muted,
            fontFamily: theme?.fonts?.mono,
            fontSize: 11.5,
          }}
        >
          {typeof stats.lines === 'number' && <span>Lines: <b style={{ color: COLORS.text }}>{stats.lines.toLocaleString()}</b></span>}
          {typeof stats.chars === 'number' && <span>Chars: <b style={{ color: COLORS.text }}>{stats.chars.toLocaleString()}</b></span>}
          {typeof stats.words === 'number' && <span>Words: <b style={{ color: COLORS.text }}>{stats.words.toLocaleString()}</b></span>}
          {typeof stats.ms    === 'number' && <span>⏱ <b style={{ color: theme?.color }}>{stats.ms}ms</b></span>}
          {stats.detail && <span style={{ color: COLORS.dim }}>{stats.detail}</span>}
          <span style={{ marginLeft: 'auto', color: COLORS.dim }}>
            All processing happens in your browser.
          </span>
        </div>
      )}

      {/* ── Floating "✓ Done" badge — celebrates sample/download success ── */}
      <AnimatePresence>
        {showDoneBadge && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ ...SPRING.smooth, duration: 0.35 }}
            style={{
              position: 'absolute',
              right: 18,
              bottom: 18,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 999,
              background: theme?.gradient,
              color: theme?.textOnColor || '#fff',
              fontFamily: theme?.fonts?.body,
              fontSize: 13, fontWeight: 700,
              boxShadow: `0 10px 30px ${theme?.tint25 || 'rgba(0,0,0,0.25)'}`,
              zIndex: 30,
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: 15 }}>✓</span>
            <span>Done!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile floating action button ─────────────────────────────── */}
      {primaryAction && (
        <>
          <style>{`
            .tr-itw-fab { display: flex; }
            @media ${MQ.md} { .tr-itw-fab { display: none !important; } }
          `}</style>
          <motion.button
            className="tr-itw-fab"
            type="button"
            onClick={() => { primaryAction.onClick(); flashDoneBadge(); }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'fixed',
              left: 16, right: 16,
              bottom: 'calc(env(safe-area-inset-bottom, 0) + 18px)',
              zIndex: 80,
              alignItems: 'center', justifyContent: 'center',
              gap: 8,
              minHeight: 52,
              padding: '0 22px',
              borderRadius: 999,
              border: 'none',
              background: theme?.gradient,
              color: theme?.textOnColor || '#fff',
              fontFamily: theme?.fonts?.body, fontSize: 15, fontWeight: 700,
              boxShadow: `0 12px 30px ${theme?.tint25 || 'rgba(0,0,0,0.3)'}`,
              cursor: 'pointer',
            }}
          >
            {primaryAction.icon && <span>{primaryAction.icon}</span>}
            {primaryAction.label}
          </motion.button>
        </>
      )}

      {/* ── Drag-drop page overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(6,9,15,0.78)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={SPRING.smooth}
              style={{
                padding: 'clamp(28px,5vw,56px) clamp(28px,5vw,72px)',
                background: theme?.bgRadial,
                border: `2px dashed ${theme?.color}`,
                borderRadius: 28,
                textAlign: 'center',
                color: COLORS.textBright,
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 12 }}>📥</div>
              <div
                style={{
                  fontFamily: theme?.fonts?.head, fontSize: 22, fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                Drop your file{acceptFiles?.includes(',') ? 's' : ''} here
              </div>
              <div style={{ color: COLORS.muted, marginTop: 8, fontSize: 14 }}>
                {tool?.name ? `${tool.name} runs locally — your file never leaves your browser.` : 'Files stay in your browser.'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Help / shortcut sheet ─────────────────────────────────────── */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHelpOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(6,9,15,0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={SPRING.smooth}
              style={{
                maxWidth: 460, width: '100%',
                background: COLORS.surface,
                border: `1px solid ${theme?.tint25}`,
                borderRadius: 16, padding: 22,
                fontFamily: theme?.fonts?.body,
              }}
            >
              <div
                style={{
                  fontFamily: theme?.fonts?.head, fontSize: 16, fontWeight: 800,
                  color: COLORS.textBright, marginBottom: 14,
                }}
              >Keyboard shortcuts</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                {[
                  ['Ctrl / Cmd + Enter', 'Run primary action'],
                  ['Ctrl / Cmd + L',     'Clear input'],
                  ['Ctrl / Cmd + Shift + C', 'Copy output'],
                  ['Ctrl / Cmd + Shift + S', 'Copy share link'],
                  ['?', 'Toggle this help'],
                ].map(([k, v]) => (
                  <li key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: 13.5, color: COLORS.text }}>
                    <kbd
                      style={{
                        fontFamily: theme?.fonts?.mono, fontSize: 12,
                        padding: '2px 10px',
                        background: theme?.tint12, color: theme?.color,
                        border: `1px solid ${theme?.tint25}`, borderRadius: 6,
                      }}
                    >{k}</kbd>
                    <span style={{ color: COLORS.muted }}>{v}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setHelpOpen(false)}
                style={{
                  marginTop: 18, width: '100%', minHeight: 40,
                  background: theme?.gradient, color: theme?.textOnColor || '#fff',
                  border: 'none', borderRadius: 10,
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer',
                }}
              >Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

InteractiveToolWorkspace.Input    = Input;
InteractiveToolWorkspace.Output   = Output;
InteractiveToolWorkspace.Controls = Controls;

export default InteractiveToolWorkspace;
