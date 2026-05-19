// ── ToolsRift CategoryLogo ───────────────────────────────────────────────────
// Procedural SVG mark, one per category. Composes theme color/gradient +
// motif/monogram into a unique shape that varies by theme.animStyleId.
//
// Used as the "top-right" badge in the category header AND as a hero glyph.
// Every category renders a visually distinct logo by combining:
//   - theme.color + theme.accent2 (gradient stops)
//   - theme.motif (small glyph, 2-3 chars max)
//   - theme.animStyleId → frame shape & accent pattern
//
// Props:
//   theme     : theme object from lib/categoryThemes
//   size      : px (default 36)
//   variant   : 'mark' (badge only) | 'lockup' (badge + name) | 'hero' (XL animated)
//   showName  : boolean (auto-true for lockup, false for mark)
//   showWordmark : add "by ToolsRift" sub-label (lockup only)
//   animated  : enable subtle motion (default true; false for static favicon use)

import { motion } from 'framer-motion';

// Pick a frame shape based on animation style. Each shape is hand-drawn for
// recognisability — square corners for precise, rounded for smooth, hex for
// cinematic, blob for liquid, glitch-cut for glitch, circle for bouncy.
function frameSpec(animStyleId) {
  switch (animStyleId) {
    case 'precise':   return { rx: 4,  rotate: 0,    cutCorners: false, hex: false, blob: false };
    case 'glitch':    return { rx: 6,  rotate: 0,    cutCorners: true,  hex: false, blob: false };
    case 'liquid':    return { rx: 22, rotate: 0,    cutCorners: false, hex: false, blob: true  };
    case 'cinematic': return { rx: 12, rotate: 0,    cutCorners: false, hex: true,  blob: false };
    case 'bouncy':    return { rx: 28, rotate: -6,   cutCorners: false, hex: false, blob: false };
    case 'smooth':
    default:          return { rx: 12, rotate: 0,    cutCorners: false, hex: false, blob: false };
  }
}

// Decoration pattern inside the frame — also varies per anim style.
// Drawn as a single <g> overlay so each logo feels different even if motif is similar.
function PatternOverlay({ animStyleId, color, accent2 }) {
  if (animStyleId === 'glitch' || animStyleId === 'precise') {
    // grid dots (dev/code/encoders)
    return (
      <g opacity="0.45">
        {[8, 24, 40, 56].map((x) =>
          [8, 24, 40, 56].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill={accent2} />
          ))
        )}
      </g>
    );
  }
  if (animStyleId === 'liquid') {
    // soft gradient swoosh
    return (
      <g opacity="0.5">
        <path d="M0 44 Q 16 28, 32 38 T 64 32 L 64 64 L 0 64 Z" fill={`${color}66`} />
      </g>
    );
  }
  if (animStyleId === 'cinematic') {
    // diagonal sheen
    return (
      <g opacity="0.4">
        <rect x="-4" y="-4" width="20" height="80" transform="rotate(-22 32 32)" fill={`${accent2}44`} />
      </g>
    );
  }
  if (animStyleId === 'bouncy') {
    // floating dots
    return (
      <g opacity="0.55">
        <circle cx="14" cy="14" r={2.2} fill={accent2} />
        <circle cx="52" cy="18" r={1.6} fill={accent2} />
        <circle cx="48" cy="52" r={1.9} fill={accent2} />
      </g>
    );
  }
  // smooth: subtle ring
  return (
    <g opacity="0.45">
      <circle cx="32" cy="32" r="22" fill="none" stroke={accent2} strokeWidth="0.9" strokeDasharray="2 4" />
    </g>
  );
}

// Build the badge shape <path> for the special non-rect frames (hex, blob).
function FrameBackground({ spec, gradId, strokeId }) {
  const fill = `url(#${gradId})`;
  if (spec.hex) {
    // hexagon framed
    const pts = [
      [32, 2], [60, 16], [60, 48], [32, 62], [4, 48], [4, 16],
    ].map((p) => p.join(',')).join(' ');
    return <polygon points={pts} fill={fill} stroke={`url(#${strokeId})`} strokeWidth="0.6" />;
  }
  if (spec.blob) {
    // organic blob
    return (
      <path
        d="M32 3 C 50 3, 61 12, 61 28 C 61 46, 52 61, 33 61 C 14 61, 3 49, 3 32 C 3 14, 14 3, 32 3 Z"
        fill={fill}
        stroke={`url(#${strokeId})`}
        strokeWidth="0.6"
      />
    );
  }
  if (spec.cutCorners) {
    // glitch-cut rectangle (top-right + bottom-left corners chamfered)
    return (
      <path
        d="M10 2 L 56 2 L 62 8 L 62 56 L 54 62 L 8 62 L 2 56 L 2 8 Z"
        fill={fill}
        stroke={`url(#${strokeId})`}
        strokeWidth="0.6"
      />
    );
  }
  return (
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx={spec.rx}
      fill={fill}
      stroke={`url(#${strokeId})`}
      strokeWidth="0.6"
    />
  );
}

// Format the monogram. theme.motif when ≤2 chars, else uppercase letters from id.
function monogramFor(theme) {
  if (theme.motif && theme.motif.length <= 3) return theme.motif;
  const id = theme.id || theme.slug || '';
  if (id.startsWith('gen-content')) return 'Cn';
  if (id.startsWith('financecalc')) return '₹';
  if (id.startsWith('mathcalc'))    return '∑';
  if (id.startsWith('converters2')) return 'Ω';
  if (id.includes('-')) {
    return id.split('-').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }
  return id.slice(0, 2).toUpperCase();
}

// Pick text size based on monogram length so it fits the badge cleanly.
function monoFontSize(mono) {
  const n = (mono || '').length;
  if (n <= 1) return 30;
  if (n === 2) return 22;
  if (n === 3) return 17;
  return 14;
}

export default function CategoryLogo({
  theme,
  size = 36,
  variant = 'mark',
  showName,
  showWordmark = false,
  animated = true,
  style,
  className,
}) {
  if (!theme) return null;
  const spec = frameSpec(theme.animStyleId);
  const mono = monogramFor(theme);
  const fontSize = monoFontSize(mono);
  const isLockup = variant === 'lockup' || variant === 'hero';
  const isHero   = variant === 'hero';
  const displayName = showName ?? isLockup;
  const uid = `${theme.id}-${size}`;
  const gradId = `tr-cl-bg-${uid}`;
  const strokeId = `tr-cl-st-${uid}`;
  const textGradId = `tr-cl-txt-${uid}`;

  const badge = (
    <motion.span
      aria-hidden={displayName ? 'true' : undefined}
      role={displayName ? undefined : 'img'}
      aria-label={displayName ? undefined : `${theme.name} logo`}
      animate={
        animated
          ? { boxShadow: [`0 0 0 ${theme.color}00`, `0 0 18px ${theme.color}66`, `0 0 0 ${theme.color}00`] }
          : undefined
      }
      transition={animated ? { duration: 3.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: spec.blob ? 14 : spec.hex ? 8 : Math.min(12, spec.rx + 2),
        flexShrink: 0,
        transform: `rotate(${spec.rotate}deg)`,
        position: 'relative',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={theme.color} />
            <stop offset="100%" stopColor={theme.colorDark || theme.accent2} />
          </linearGradient>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={textGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.78" />
          </linearGradient>
        </defs>

        <FrameBackground spec={spec} gradId={gradId} strokeId={strokeId} />

        <PatternOverlay
          animStyleId={theme.animStyleId}
          color={theme.color}
          accent2={theme.accent2 || theme.color}
        />

        {/* Soft glow ring */}
        <circle cx="32" cy="32" r="29" fill="none" stroke={`${theme.color}33`} strokeWidth="0.4" />

        {/* Monogram */}
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="central"
          fill={`url(#${textGradId})`}
          fontFamily={
            theme.fontStackId === 'monoFirst'
              ? "'JetBrains Mono', monospace"
              : "'Sora', 'Inter', sans-serif"
          }
          fontWeight="800"
          fontSize={fontSize}
          letterSpacing={mono.length > 1 ? '-0.04em' : '0'}
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}
        >
          {mono}
        </text>

        {/* Top sheen */}
        <rect
          x={spec.blob || spec.hex ? 10 : 8}
          y="3.2"
          width="22"
          height="1.2"
          rx="0.6"
          fill="#ffffff"
          opacity="0.18"
        />
      </svg>
    </motion.span>
  );

  if (!displayName) {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
        {badge}
      </span>
    );
  }

  // Lockup: badge + name (gradient text) + optional sub-wordmark
  const nameSize = isHero ? 24 : 14;
  const subSize  = isHero ? 12 : 10;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isHero ? 14 : 10,
        textDecoration: 'none',
        ...style,
      }}
    >
      {badge}
      <span style={{ display: 'inline-flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: theme.fonts?.head || "'Sora', sans-serif",
            fontWeight: 800,
            fontSize: nameSize,
            letterSpacing: '-0.015em',
            backgroundImage: theme.gradientText || `linear-gradient(135deg, ${theme.color}, ${theme.accent2 || theme.color})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            whiteSpace: 'nowrap',
          }}
        >
          {theme.name}
        </span>
        {showWordmark && (
          <span
            style={{
              fontFamily: theme.fonts?.body || "'Plus Jakarta Sans', sans-serif",
              fontSize: subSize,
              fontWeight: 600,
              color: 'rgba(148,163,184,0.78)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: 2,
            }}
          >
            by ToolsRift
          </span>
        )}
      </span>
    </span>
  );
}
