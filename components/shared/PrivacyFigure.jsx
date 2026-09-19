// ── PrivacyFigure — "your file never reaches the server" hero illustration ──
// One responsive SVG (viewBox-scaled, so it never clips on a phone) shared by
// the default CategoryBanner and PdfPrivacyHero. Theme-tinted.
//
// Motion: the document drifts, the upload line "draws" itself towards the
// cloud on mount and then keeps marching, the ✕ badge pulses where the line
// is cut, and the cloud breathes. Everything is CSS/SVG, so it costs nothing
// on the main thread; reduced-motion users get the static picture.

import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../../lib/designTokens';

const CSS = `
.tr-pf{display:block;width:100%;max-width:520px;height:auto;margin:0 auto;overflow:visible}
.tr-pf-doc{animation:trPfFloat 6s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.tr-pf-cloud{animation:trPfBreathe 5s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
.tr-pf-pkts{animation:trPfDash 1.4s linear infinite}
.tr-pf-ring{animation:trPfRing 2.4s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes trPfFloat{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(-4deg) translateY(-8px)}}
@keyframes trPfBreathe{0%,100%{opacity:.45}50%{opacity:.75}}
@keyframes trPfDash{to{stroke-dashoffset:-24}}
@keyframes trPfRing{0%{transform:scale(.7);opacity:.8}100%{transform:scale(2.1);opacity:0}}
@media (prefers-reduced-motion:reduce){.tr-pf-doc,.tr-pf-cloud,.tr-pf-pkts,.tr-pf-ring{animation:none}}
`;

export default function PrivacyFigure({
  color = '#3B82F6',
  accent = '#60A5FA',
  bg = '#06090F',
  label = 'document.pdf',
  icon,                  // emoji/glyph shown on the doc instead of text lines (optional)
  caption = 'server · unreached',
  style,
}) {
  const reduce = useReducedMotion();
  const draw = reduce
    ? {}
    : { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: 1.1, ease: EASE.snap, delay: 0.5 } };

  return (
    <svg className="tr-pf" viewBox="0 0 520 320" role="img" aria-label="Your file stays on this device" style={style}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <defs>
        <linearGradient id="trpf-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0F1626" /><stop offset="1" stopColor="#0A0F1A" />
        </linearGradient>
        <linearGradient id="trpf-doc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} /><stop offset="1" stopColor={color} />
        </linearGradient>
        <filter id="trpf-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Cloud (server) */}
      <g className="tr-pf-cloud">
        <path d="M400 96h74a26 26 0 0 0 3-52 34 34 0 0 0-65-6 23 23 0 0 0-22 58z" fill="none" stroke={accent} strokeWidth="2.5" strokeDasharray="6 6" />
        <text x="440" y="122" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="11" fontWeight="600" fill={accent} letterSpacing="0.06em">{caption}</text>
      </g>

      {/* Upload line: window → cut → cloud */}
      <motion.path d="M262 150 C 300 150, 320 100, 372 76" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 8" className="tr-pf-pkts" {...draw} />
      <path d="M316 116 C 332 100, 350 84, 372 76" fill="none" stroke={bg} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      <path d="M316 116 C 332 100, 350 84, 372 76" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 7" opacity="0.35" />
      <g>
        <circle className="tr-pf-ring" cx="312" cy="118" r="14" fill="none" stroke={color} strokeWidth="1.5" />
        <circle cx="312" cy="118" r="16" fill={bg} stroke={color} strokeWidth="2.5" />
        <path d="M306 112l12 12M318 112l-12 12" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Browser window (this device) */}
      <g filter="url(#trpf-shadow)">
        <rect x="24" y="60" width="238" height="240" rx="20" fill="url(#trpf-win)" stroke="rgba(255,255,255,0.08)" />
        <line x1="24" y1="94" x2="262" y2="94" stroke="rgba(255,255,255,0.06)" />
        <circle cx="44" cy="77" r="4.5" fill="#2a3550" /><circle cx="60" cy="77" r="4.5" fill="#2a3550" /><circle cx="76" cy="77" r="4.5" fill="#2a3550" />
        <text x="246" y="81" textAnchor="end" fontFamily="'JetBrains Mono',monospace" fontSize="9.5" fill="rgba(255,255,255,0.35)" letterSpacing="0.14em">THIS DEVICE</text>
      </g>

      {/* Document */}
      <g className="tr-pf-doc">
        {icon ? (
          <g>
            <rect x="72" y="112" width="140" height="150" rx="14" fill="url(#trpf-doc)" filter="url(#trpf-shadow)" />
            <text x="142" y="196" textAnchor="middle" fontSize="52">{icon}</text>
            <text x="142" y="244" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9.5" fill="rgba(255,255,255,0.85)" letterSpacing="0.1em">{label.toUpperCase()}</text>
          </g>
        ) : (
          <g filter="url(#trpf-shadow)">
            <rect x="70" y="110" width="146" height="178" rx="8" fill="#F8FAFC" />
            <path d="M192 110h24v24z" fill={color} />
            <rect x="86" y="132" width="70" height="7" rx="3.5" fill="#E2E8F0" />
            <rect x="86" y="150" width="112" height="7" rx="3.5" fill="#E2E8F0" />
            <rect x="86" y="168" width="112" height="7" rx="3.5" fill="#E2E8F0" />
            <rect x="86" y="186" width="80" height="9" rx="2" fill="#111" />
            <rect x="86" y="206" width="112" height="7" rx="3.5" fill="#E2E8F0" />
            <rect x="86" y="224" width="64" height="7" rx="3.5" fill="#E2E8F0" />
            <rect x="86" y="243" width="52" height="9" rx="2" fill="#111" />
            <text x="86" y="276" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#94A3B8" letterSpacing="0.1em">{label}</text>
          </g>
        )}
      </g>

      {/* Lock badge on the window */}
      <g>
        <circle cx="236" cy="272" r="17" fill={bg} stroke={color} strokeWidth="2" />
        <rect x="229" y="270" width="14" height="11" rx="2.5" fill={accent} />
        <path d="M232 270v-4a4 4 0 0 1 8 0v4" fill="none" stroke={accent} strokeWidth="2" />
      </g>
    </svg>
  );
}
