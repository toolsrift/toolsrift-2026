// ── ToolsRift Global Design Tokens ───────────────────────────────────────────
// Used alongside per-category theme objects. These do NOT vary by category.

export const COLORS = {
  bg:          '#06090F',
  bgRaised:    '#0B0F18',
  surface:     '#0D1117',
  surface2:    '#111827',
  surface3:    '#161E2E',
  border:      'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.05)',
  borderStrong:'rgba(255,255,255,0.14)',
  text:        '#F1F5F9',
  textBright:  '#F8FAFC',
  muted:       '#94A3B8',
  dim:         '#64748B',
  faint:       '#475569',
  navBg:       'rgba(6,9,15,0.85)',
  overlay:     'rgba(2,4,8,0.7)',
};

// ── Spacing scale (4-pt base) ───────────────────────────────────────────────
export const SPACE = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
  '6xl': 96,
  '7xl': 128,
};

// ── Border radius scale ─────────────────────────────────────────────────────
export const RADIUS = {
  xs:   4,
  sm:   6,
  md:   10,
  lg:   14,
  xl:   18,
  '2xl': 22,
  '3xl': 28,
  full: 9999,
};

// ── Typography scale (clamp() for fluid sizes) ──────────────────────────────
export const FS = {
  xs:    'clamp(11px, 0.7vw + 9px, 12px)',
  sm:    'clamp(12px, 0.75vw + 10px, 13px)',
  base:  'clamp(14px, 0.85vw + 12px, 15px)',
  md:    'clamp(15px, 0.9vw + 13px, 16px)',
  lg:    'clamp(16px, 1vw + 14px, 18px)',
  xl:    'clamp(18px, 1.2vw + 14px, 22px)',
  '2xl': 'clamp(22px, 1.6vw + 16px, 28px)',
  '3xl': 'clamp(26px, 2.2vw + 18px, 36px)',
  '4xl': 'clamp(32px, 3.5vw + 18px, 52px)',
  '5xl': 'clamp(40px, 5vw + 20px, 76px)',
  hero:  'clamp(44px, 6vw + 18px, 96px)',
};

// ── Shadows ─────────────────────────────────────────────────────────────────
export const SHADOW = {
  xs:  '0 1px 2px rgba(0,0,0,0.4)',
  sm:  '0 2px 6px rgba(0,0,0,0.4)',
  md:  '0 4px 16px rgba(0,0,0,0.4)',
  lg:  '0 12px 32px rgba(0,0,0,0.45)',
  xl:  '0 24px 60px rgba(0,0,0,0.5)',
  inset: 'inset 0 1px 0 rgba(255,255,255,0.04)',
};

// ── Z-index ─────────────────────────────────────────────────────────────────
export const Z = {
  base: 0, raised: 1, dropdown: 50, sticky: 100,
  overlay: 500, modal: 1000, toast: 2000,
};

// ── Breakpoints (mobile-first) ──────────────────────────────────────────────
export const BP = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 };
export const MQ = {
  sm:  `(min-width: ${BP.sm}px)`,
  md:  `(min-width: ${BP.md}px)`,
  lg:  `(min-width: ${BP.lg}px)`,
  xl:  `(min-width: ${BP.xl}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
  hover:         '(hover: hover)',
  touch:         '(hover: none) and (pointer: coarse)',
};

// ── Motion presets (consumed by framer-motion) ──────────────────────────────
export const EASE = {
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.2, 0, 0, 1],
  bounce:   [0.34, 1.56, 0.64, 1],
  snap:     [0.16, 1, 0.3, 1],
  glide:    [0.25, 0.46, 0.45, 0.94],
  precise:  [0.6, 0, 0.4, 1],
};

export const SPRING = {
  smooth:   { type: 'spring', stiffness: 220, damping: 30, mass: 0.9 },
  bouncy:   { type: 'spring', stiffness: 320, damping: 16, mass: 0.8 },
  precise:  { type: 'spring', stiffness: 450, damping: 38, mass: 0.5 },
  liquid:   { type: 'spring', stiffness: 160, damping: 22, mass: 1.1 },
  snappy:   { type: 'spring', stiffness: 600, damping: 40, mass: 0.4 },
};

export const MOTION = {
  // Common variants reused across the app
  fadeUp: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE.snap } },
  },
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: EASE.standard } },
  },
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.94 },
    visible: { opacity: 1, scale: 1, transition: SPRING.smooth },
  },
  slideRight: {
    hidden:  { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE.snap } },
  },
  blurUp: {
    hidden:  { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: EASE.snap } },
  },
  stagger: {
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  },
  staggerSlow: {
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
  },
};

// ── Layout helpers ──────────────────────────────────────────────────────────
export const CONTAINER = {
  page:    { maxWidth: 1280, margin: '0 auto', paddingLeft: 'clamp(16px, 4vw, 32px)', paddingRight: 'clamp(16px, 4vw, 32px)' },
  prose:   { maxWidth: 720,  margin: '0 auto' },
  narrow:  { maxWidth: 960,  margin: '0 auto' },
  full:    { maxWidth: '100%', margin: '0 auto' },
};

// ── Global keyframes (injected once at app root) ────────────────────────────
export const GLOBAL_KEYFRAMES = `
@keyframes tr-float       { 0%,100% { transform:translateY(0)        } 50% { transform:translateY(-12px)   } }
@keyframes tr-floatSlow   { 0%,100% { transform:translate(0,0)       } 50% { transform:translate(8px,-16px)} }
@keyframes tr-pulse       { 0%,100% { opacity:.5; transform:scale(1) } 50% { opacity:1; transform:scale(1.04) } }
@keyframes tr-spinSlow    { from { transform:rotate(0) } to { transform:rotate(360deg) } }
@keyframes tr-shimmer     { 0% { background-position:-200% 0 } 100% { background-position:200% 0 } }
@keyframes tr-marquee     { from { transform:translateX(0) } to { transform:translateX(-50%) } }
@keyframes tr-marqueeRev  { from { transform:translateX(-50%) } to { transform:translateX(0) } }
@keyframes tr-blink       { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
@keyframes tr-scanline    { 0% { transform:translateY(-100%) } 100% { transform:translateY(100vh) } }
@keyframes tr-glitch      { 0%,100% { transform:translate(0) } 20% { transform:translate(-2px,1px) } 40% { transform:translate(2px,-1px) } 60% { transform:translate(-1px,2px) } 80% { transform:translate(1px,-2px) } }
@keyframes tr-orbBreathe  { 0%,100% { transform:scale(1) translate(0,0); opacity:.45 } 50% { transform:scale(1.15) translate(20px,-12px); opacity:.7 } }
@keyframes tr-gradientShift { 0%,100% { background-position:0% 50% } 50% { background-position:100% 50% } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;

// ── Mobile-friendly tap target floor ────────────────────────────────────────
export const TAP_TARGET_MIN = 44;
