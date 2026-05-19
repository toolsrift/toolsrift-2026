// ── ToolsRift SmartControls ──────────────────────────────────────────────────
// Collapsible themed options panel — sliders, toggles, selects, color pickers,
// number steppers with units. Lives above or beside an input pane.
//
// Usage:
//   <SmartControls
//     theme={theme}
//     title="Options"
//     fields={[
//       { type:'slider', label:'Length', value:16, min:4, max:64, onChange },
//       { type:'toggle', label:'Symbols', value:true, onChange },
//       { type:'select', label:'Case',    value:'mixed', options:[...], onChange },
//       { type:'number', label:'Weight',  unit:'kg', value:70, onChange },
//       { type:'color',  label:'Accent',  value:'#3B82F6', onChange },
//     ]}
//   />

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS, RADIUS } from '../../lib/designTokens';

function Slider({ theme, label, value, min = 0, max = 100, step = 1, onChange, hint, unit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, fontFamily: theme?.fonts?.body }}>
          {label}
        </span>
        <span
          style={{
            fontFamily: theme?.fonts?.mono,
            fontSize: 13,
            fontWeight: 700,
            color: theme?.color || COLORS.textBright,
            padding: '2px 10px',
            borderRadius: 6,
            background: theme?.tint12 || 'rgba(255,255,255,0.05)',
          }}
        >
          {value}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: theme?.color || '#3B82F6',
          minHeight: 32,
        }}
      />
      {hint && <span style={{ fontSize: 11, color: COLORS.dim }}>{hint}</span>}
    </div>
  );
}

function Toggle({ theme, label, value, onChange, hint }) {
  return (
    <label
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, cursor: 'pointer', minHeight: 36,
      }}
    >
      <span style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text, fontFamily: theme?.fonts?.body }}>{label}</span>
        {hint && <span style={{ fontSize: 11.5, color: COLORS.dim, marginTop: 2 }}>{hint}</span>}
      </span>
      <span
        onClick={() => onChange?.(!value)}
        style={{
          flexShrink: 0,
          position: 'relative',
          width: 42, height: 24,
          borderRadius: 999,
          background: value ? theme?.color : 'rgba(255,255,255,0.12)',
          transition: 'background .2s',
          cursor: 'pointer',
        }}
      >
        <motion.span
          animate={{ x: value ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            position: 'absolute', top: 2, left: 0,
            width: 20, height: 20, borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </span>
    </label>
  );
}

function Select({ theme, label, value, options = [], onChange, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, fontFamily: theme?.fonts?.body }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          height: 38,
          padding: '0 10px',
          background: 'rgba(15,23,42,0.6)',
          border: `1px solid ${theme?.tint12 || COLORS.border}`,
          borderRadius: RADIUS.md,
          color: COLORS.text,
          fontSize: 13.5,
          outline: 'none',
          fontFamily: theme?.fonts?.body,
          cursor: 'pointer',
        }}
      >
        {options.map((o) =>
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
      {hint && <span style={{ fontSize: 11, color: COLORS.dim }}>{hint}</span>}
    </div>
  );
}

function NumberField({ theme, label, value, onChange, min, max, step = 1, unit, hint }) {
  const dec = () => onChange?.(Math.max(min ?? -Infinity, Number(value) - step));
  const inc = () => onChange?.(Math.min(max ??  Infinity, Number(value) + step));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, fontFamily: theme?.fonts?.body }}>
        {label}{unit ? <span style={{ color: COLORS.dim, fontWeight: 500 }}> ({unit})</span> : null}
      </span>
      <div
        style={{
          display: 'flex', alignItems: 'stretch',
          background: 'rgba(15,23,42,0.6)',
          border: `1px solid ${theme?.tint12 || COLORS.border}`,
          borderRadius: RADIUS.md,
          overflow: 'hidden',
          height: 38,
        }}
      >
        <button
          type="button" onClick={dec}
          style={{ width: 36, border: 'none', background: 'transparent', color: COLORS.muted, fontSize: 18, cursor: 'pointer' }}
          aria-label={`Decrease ${label}`}
        >−</button>
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={(e) => onChange?.(e.target.value === '' ? '' : Number(e.target.value))}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent', border: 'none', outline: 'none',
            color: COLORS.textBright,
            fontFamily: theme?.fonts?.mono, fontSize: 14, fontWeight: 600,
            textAlign: 'center',
          }}
        />
        <button
          type="button" onClick={inc}
          style={{ width: 36, border: 'none', background: 'transparent', color: COLORS.muted, fontSize: 18, cursor: 'pointer' }}
          aria-label={`Increase ${label}`}
        >+</button>
      </div>
      {hint && <span style={{ fontSize: 11, color: COLORS.dim }}>{hint}</span>}
    </div>
  );
}

function ColorField({ theme, label, value, onChange, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, fontFamily: theme?.fonts?.body }}>
        {label}
      </span>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(15,23,42,0.6)',
          border: `1px solid ${theme?.tint12 || COLORS.border}`,
          borderRadius: RADIUS.md,
          padding: '4px 6px 4px 4px',
          height: 38,
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ width: 32, height: 30, border: 'none', borderRadius: 6, background: 'transparent', padding: 0, cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 'none', outline: 'none',
            color: COLORS.textBright,
            fontFamily: theme?.fonts?.mono, fontSize: 13, fontWeight: 600,
          }}
        />
      </div>
      {hint && <span style={{ fontSize: 11, color: COLORS.dim }}>{hint}</span>}
    </div>
  );
}

function Segmented({ theme, label, value, options = [], onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.muted, fontFamily: theme?.fonts?.body }}>
        {label}
      </span>
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
        {options.map((o) => {
          const id = typeof o === 'string' ? o : o.value;
          const label = typeof o === 'string' ? o : o.label;
          const active = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange?.(id)}
              style={{
                flex: 1,
                minHeight: 32,
                padding: '6px 14px',
                borderRadius: 999,
                background: active ? theme?.color : 'transparent',
                color: active ? theme?.textOnColor || '#fff' : COLORS.muted,
                border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: 12,
                fontFamily: theme?.fonts?.body,
              }}
            >{label}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function SmartControls({
  theme,
  title = 'Options',
  fields = [],
  collapsible = false,
  defaultOpen = true,
  style,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const showFields = !collapsible || open;

  return (
    <div
      style={{
        background: 'rgba(15,23,42,0.5)',
        border: `1px solid ${theme?.tint12 || COLORS.border}`,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        ...style,
      }}
    >
      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', background: 'transparent', border: 'none',
            color: COLORS.textBright,
            fontFamily: theme?.fonts?.head, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span>{title}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ fontSize: 14, color: theme?.color }}>▾</motion.span>
        </button>
      )}
      {!collapsible && (
        <div
          style={{
            padding: '12px 18px',
            borderBottom: `1px solid ${theme?.tint12 || COLORS.border}`,
            fontFamily: theme?.fonts?.head,
            fontSize: 12.5, fontWeight: 700,
            color: theme?.color, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}
        >
          {title}
        </div>
      )}

      <AnimatePresence initial={false}>
        {showFields && (
          <motion.div
            initial={collapsible ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={collapsible ? { height: 0, opacity: 0 } : undefined}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'grid',
                gap: 16,
                padding: '16px 18px 18px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
              }}
            >
              {fields.map((f, i) => {
                const key = f.key || f.label || i;
                if (f.type === 'slider')   return <Slider     key={key} theme={theme} {...f} />;
                if (f.type === 'toggle')   return <Toggle     key={key} theme={theme} {...f} />;
                if (f.type === 'select')   return <Select     key={key} theme={theme} {...f} />;
                if (f.type === 'number')   return <NumberField key={key} theme={theme} {...f} />;
                if (f.type === 'color')    return <ColorField  key={key} theme={theme} {...f} />;
                if (f.type === 'segmented') return <Segmented  key={key} theme={theme} {...f} />;
                return null;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
