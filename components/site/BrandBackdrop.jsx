// ── BrandBackdrop — the texture that makes each network site recognisable ────
// Pure CSS/SVG-data-URI patterns, fixed behind the page, pointer-events none.
// The pattern id comes from lib/sites/brands.js (`pattern`). Renders nothing on
// the hub or for `pattern: 'none'`.
//
// Patterns are deliberately quiet (2–6% white or a low-alpha tint of the brand
// primary) — they should read as paper stock, not wallpaper.

import { SITE } from '../../lib/sites';

function rgba(hex, a) {
  const h = hex.replace('#', '');
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

const svg = (s) => `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;

function patternStyle(pattern, primary, accent2) {
  const p = (a) => rgba(primary, a);
  const a2 = (a) => rgba(accent2 || primary, a);
  const W = (a) => `rgba(255,255,255,${a})`;

  switch (pattern) {
    case 'ruled':
      return {
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0 31px, ${W(0.035)} 31px 32px)`,
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${W(0.035)} 1px, transparent 1px), linear-gradient(90deg, ${W(0.035)} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      };
    case 'graph':
      return {
        backgroundImage: `linear-gradient(${W(0.05)} 1px, transparent 1px), linear-gradient(90deg, ${W(0.05)} 1px, transparent 1px), linear-gradient(${W(0.02)} 1px, transparent 1px), linear-gradient(90deg, ${W(0.02)} 1px, transparent 1px)`,
        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
      };
    case 'blueprint':
      return {
        backgroundImage: `linear-gradient(${p(0.10)} 1px, transparent 1px), linear-gradient(90deg, ${p(0.10)} 1px, transparent 1px), linear-gradient(${p(0.04)} 1px, transparent 1px), linear-gradient(90deg, ${p(0.04)} 1px, transparent 1px)`,
        backgroundSize: '96px 96px, 96px 96px, 24px 24px, 24px 24px',
      };
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${W(0.07)} 1px, transparent 1.5px)`,
        backgroundSize: '22px 22px',
      };
    case 'paper':
      return {
        backgroundImage: `radial-gradient(${W(0.045)} 0.8px, transparent 1.2px), radial-gradient(ellipse 70% 40% at 50% 0%, ${p(0.10)} 0%, transparent 70%)`,
        backgroundSize: '14px 14px, 100% 100%',
      };
    case 'diagonal':
      return {
        backgroundImage: `repeating-linear-gradient(135deg, transparent 0 14px, ${W(0.028)} 14px 15px)`,
      };
    case 'dashes':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${p(0.16)} 0 18px, transparent 18px 26px, ${p(0.16)} 26px 32px, transparent 32px 56px)`,
        backgroundSize: '56px 48px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: '0 0',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0) 70%)',
        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1), rgba(0,0,0,0) 70%)',
        height: 48,
      };
    case 'scanlines':
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${W(0.028)} 0 1px, transparent 1px 3px)`,
      };
    case 'grain':
      return {
        backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.09 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`),
        backgroundSize: '200px 200px',
      };
    case 'aurora':
      return {
        backgroundImage: `radial-gradient(ellipse 50% 40% at 15% 10%, ${p(0.22)} 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 85% 25%, ${a2(0.16)} 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 100%, ${p(0.10)} 0%, transparent 60%)`,
      };
    case 'confetti':
      return {
        backgroundImage: `radial-gradient(${p(0.35)} 2px, transparent 2.5px), radial-gradient(${a2(0.35)} 1.5px, transparent 2px), radial-gradient(${W(0.12)} 1px, transparent 1.5px)`,
        backgroundSize: '140px 140px, 90px 90px, 60px 60px',
        backgroundPosition: '0 0, 40px 60px, 20px 10px',
        maskImage: 'linear-gradient(180deg, rgba(0,0,0,.9), rgba(0,0,0,.15) 40%, rgba(0,0,0,.05))',
        WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,.9), rgba(0,0,0,.15) 40%, rgba(0,0,0,.05))',
      };
    case 'hex':
      return {
        backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='56' height='100' viewBox='0 0 56 100'><path d='M28 0 56 16v34L28 66 0 50V16z M28 34 56 50v34L28 100 0 84V50z' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'/></svg>`),
        backgroundSize: '56px 100px',
      };
    case 'circuit':
      return {
        backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'><g fill='none' stroke='${W(0.06)}' stroke-width='1'><path d='M10 10h40v30h30v40M60 110V80H20V50M110 20v40h-30'/></g><g fill='${p(0.45)}'><circle cx='10' cy='10' r='2'/><circle cx='80' cy='80' r='2'/><circle cx='60' cy='110' r='2'/><circle cx='20' cy='50' r='2'/><circle cx='110' cy='20' r='2'/></g></svg>`),
        backgroundSize: '120px 120px',
      };
    case 'waves':
      return {
        backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='160' height='40' viewBox='0 0 160 40'><path d='M0 20c20-16 40-16 60 0s40 16 60 0 40-16 40 0' fill='none' stroke='${W(0.06)}' stroke-width='1.2'/></svg>`),
        backgroundSize: '160px 40px',
      };
    case 'film':
      return {
        backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='28' height='32' viewBox='0 0 28 32'><rect x='7' y='8' width='14' height='16' rx='3' fill='${W(0.06)}'/></svg>`),
        backgroundSize: '28px 32px',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'left top, right top',
      };
    case 'ticks':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${W(0.16)} 0 1px, transparent 1px 10px), repeating-linear-gradient(90deg, ${W(0.28)} 0 1px, transparent 1px 50px)`,
        backgroundSize: '10px 8px, 50px 16px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: '0 0, 0 0',
        height: 16,
      };
    default:
      return null;
  }
}

export default function BrandBackdrop() {
  const b = SITE.brand;
  if (!b || !b.pattern || b.pattern === 'none') return null;
  const style = patternStyle(b.pattern, b.palette.primary, b.palette.accent2);
  if (!style) return null;

  const base = {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
  };

  if (b.pattern === 'film') {
    // Sprocket holes down both edges of the viewport.
    const img = style.backgroundImage;
    return (
      <div aria-hidden style={base}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 28, backgroundImage: img, backgroundSize: '28px 32px', backgroundRepeat: 'repeat-y' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 28, backgroundImage: img, backgroundSize: '28px 32px', backgroundRepeat: 'repeat-y' }} />
      </div>
    );
  }

  const { height, ...rest } = style;
  return (
    <div
      aria-hidden
      style={{
        ...base,
        ...(height ? { bottom: 'auto', height } : null),
        ...rest,
      }}
    />
  );
}
