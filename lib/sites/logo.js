// ── ToolsRift network logo lockup ────────────────────────────────────────────
// One drawing, two consumers:
//   • scripts/generate-brand-assets.js writes it to public/brands/<id>/logo.svg
//     (footer, OG fallbacks, anything that wants a plain <img>)
//   • components/site/BrandLogo.jsx renders it inline in the header so the
//     rift can glow on hover.
//
// The mark is the MAIN ToolsRift badge (3×3 tile grid split by the "rift"
// slash — see public/logo.svg) recoloured with the brand's palette, with the
// category glyph sitting in a small gradient chip on the badge's corner. So
// every network site reads as "ToolsRift" first and "<category>" second,
// instead of 29 unrelated logos.
//
// Data-only (no React) so Node scripts and the browser bundle can share it.

const GLYPHS = require('../../scripts/brand-glyphs');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function mix(hex, withHex, t) {
  const a = hexToRgb(hex), b = hexToRgb(withHex);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

/**
 * The badge mark only (square, `size` px). `id` namespaces gradient ids so
 * several marks can live in one document.
 */
function networkMarkSvg(b, size = 72, { id = 'nm', chip = true } = {}) {
  const { primary, primaryDark, accent2, textOnPrimary } = b.palette;
  const glyph = GLYPHS[b.logo.glyph];
  if (!glyph) throw new Error(`No glyph "${b.logo.glyph}" for brand ${b.id}`);
  const s = size / 72; // everything below is drawn in the 72-box of public/logo.svg
  const f = (n) => (n * s).toFixed(2);

  // Badge: brand-tinted near-black, like the hub's navy badge but in this hue.
  const badgeTop = mix(primaryDark, '#05070C', 0.72);
  const badgeBot = mix(primaryDark, '#05070C', 0.90);
  const dim      = mix(primaryDark, '#05070C', 0.60); // unlit tiles
  const lit      = mix(primary, '#05070C', 0.45);     // lit tiles
  const stroke   = mix(primary, '#05070C', 0.55);     // badge border

  const tile = (x, y, on) =>
    `<rect x="${f(x)}" y="${f(y)}" width="${f(14)}" height="${f(14)}" rx="${f(3.5)}" fill="${on ? lit : dim}"${on ? ` stroke="${accent2}" stroke-width="${f(0.8)}"` : ''}/>`;
  const tiles = [];
  for (const y of [10, 29, 48]) for (const x of [10, 29, 48]) tiles.push(tile(x, y, false));
  tiles.push(tile(48, 10, true), tile(29, 29, true), tile(10, 48, true));

  const rift = [
    [primaryDark, 16, 0.10], [primary, 9, 0.18], [primary, 4, 0.75], [accent2, 1.6, 0.9], ['#FFFFFF', 0.6, 0.65],
  ].map(([c, w, o]) => `<line x1="${f(66)}" y1="${f(8)}" x2="${f(6)}" y2="${f(66)}" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" opacity="${o}"/>`).join('');

  // Category chip: gradient circle on the bottom-right corner with the glyph.
  const chipR = 15, cx = 60, cy = 60;
  const gScale = (chipR * 1.3) / 100; // glyph box 100 → ~20px inside a 30px chip
  const gOff = 100 * gScale / 2;
  const chipSvg = chip ? `
  <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(chipR + 2.5)}" fill="${badgeBot}"/>
  <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(chipR)}" fill="url(#${id}-cg)"/>
  <circle cx="${f(cx)}" cy="${f(cy)}" r="${f(chipR)}" fill="url(#${id}-hl)"/>
  <g transform="translate(${f(cx - gOff)} ${f(cy - gOff)}) scale(${(gScale * s).toFixed(4)})" color="${textOnPrimary}">${glyph}</g>` : '';

  return `
  <defs>
    <linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${badgeTop}"/>
      <stop offset="1" stop-color="${badgeBot}"/>
    </linearGradient>
    <linearGradient id="${id}-cg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent2}"/>
      <stop offset="0.55" stop-color="${primary}"/>
      <stop offset="1" stop-color="${primaryDark}"/>
    </linearGradient>
    <radialGradient id="${id}-hl" cx="0.3" cy="0.25" r="0.8">
      <stop offset="0" stop-color="#fff" stop-opacity="0.3"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${id}-c"><rect width="${f(72)}" height="${f(72)}" rx="${f(16)}"/></clipPath>
  </defs>
  <rect width="${f(72)}" height="${f(72)}" rx="${f(16)}" fill="url(#${id}-bg)"/>
  <g clip-path="url(#${id}-c)">
    ${tiles.join('')}
    <g class="tr-rift">${rift}</g>
    <circle cx="${f(66)}" cy="${f(8)}" r="${f(2.8)}" fill="${accent2}" opacity="0.75"/>
    <circle cx="${f(66)}" cy="${f(8)}" r="${f(1.1)}" fill="#fff" opacity="0.9"/>
    <circle cx="${f(6)}" cy="${f(66)}" r="${f(2.2)}" fill="${accent2}" opacity="0.5"/>
  </g>
  <rect x="${f(0.5)}" y="${f(0.5)}" width="${f(71)}" height="${f(71)}" rx="${f(15.5)}" fill="none" stroke="${stroke}" stroke-width="${f(0.8)}" opacity="0.8"/>
  <rect x="${f(10)}" y="${f(0.8)}" width="${f(26)}" height="${f(1.2)}" rx="${f(0.6)}" fill="#fff" opacity="0.06"/>${chipSvg}`;
}

/** Wordmark geometry shared by the file and the inline component. */
function wordmarkLayout(b, fs = 30) {
  const [w1, w2] = b.wordmark;
  const approx = (t, size) => t.length * size * 0.66;
  const x1 = 88;
  const x2 = x1 + approx(w1, fs) + 9;
  const width = Math.ceil(x2 + approx(w2, fs) + 12);
  return { w1, w2, x1, x2, width, fs };
}

/** Full lockup as a standalone SVG document (public/brands/<id>/logo.svg). */
function networkLogoSvg(b) {
  const fontHead = "Sora, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";
  const { w1, w2, x1, x2, width, fs } = wordmarkLayout(b);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 72" width="${width}" height="72" role="img" aria-label="${esc(b.siteName)}">
  <title>${esc(b.siteName)}</title>
  <g>${networkMarkSvg(b, 72, { id: 'l' })}
  </g>
  <text x="${x1}" y="46" font-family="${fontHead}" font-weight="800" font-size="${fs}" letter-spacing="-0.6" fill="#F8FAFC">${esc(w1)}</text>
  <text x="${x2}" y="46" font-family="${fontHead}" font-weight="800" font-size="${fs}" letter-spacing="-0.6" fill="${b.palette.primary}">${esc(w2)}</text>
</svg>
`;
}

module.exports = { networkMarkSvg, networkLogoSvg, wordmarkLayout };
