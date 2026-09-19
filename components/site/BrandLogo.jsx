// ── BrandLogo — the network lockup, rendered inline ─────────────────────────
// Same drawing as public/brands/<id>/logo.svg (lib/sites/logo.js) but inline so
// the wordmark uses the real page font and the rift can glow on hover.
// Renders nothing on the hub (which keeps its own /logo.svg).

import { motion, useReducedMotion } from 'framer-motion';
import { SITE } from '../../lib/sites';
import { networkMarkSvg } from '../../lib/sites/logo';

const CSS = `
.tr-logo{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:inherit}
.tr-logo-mark{display:block;flex-shrink:0;transition:filter .35s ease}
.tr-logo-mark .tr-rift{transition:filter .35s ease}
.tr-logo:hover .tr-logo-mark{filter:drop-shadow(0 0 10px var(--tr-logo-glow))}
.tr-logo:hover .tr-logo-mark .tr-rift{filter:brightness(1.35)}
.tr-logo-word{display:inline-flex;align-items:baseline;gap:.28em;font-weight:800;letter-spacing:-0.02em;line-height:1;white-space:nowrap}
.tr-logo-word b{color:#F8FAFC;font-weight:800}
.tr-logo-word i{font-style:normal;font-weight:800;color:var(--tr-logo-accent)}
`;

export default function BrandLogo({ size = 32, wordmark = true, href = '/', style, ...rest }) {
  const reduce = useReducedMotion();
  const b = SITE.brand;
  if (!b) return null;
  const markHtml = networkMarkSvg(b, size, { id: `hl${size}` });
  const [w1, w2] = b.wordmark;

  return (
    <motion.a
      href={href}
      className="tr-logo"
      aria-label={SITE.siteName}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      style={{ '--tr-logo-glow': `${b.palette.primary}88`, '--tr-logo-accent': b.palette.primary, ...style }}
      {...rest}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <svg
        className="tr-logo-mark"
        width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true" focusable="false"
        dangerouslySetInnerHTML={{ __html: markHtml }}
      />
      {wordmark && (
        <span className="tr-logo-word" style={{ fontFamily: "'Sora', system-ui, sans-serif", fontSize: Math.round(size * 0.62) }}>
          <b>{w1}</b><i>{w2}</i>
        </span>
      )}
    </motion.a>
  );
}
