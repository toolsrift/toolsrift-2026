#!/usr/bin/env node
/**
 * generate-brand-assets.js
 * ----------------------------------------------------------------------------
 * Generates the visual identity of every ToolsRift network site from
 * lib/sites/brands.js + scripts/brand-glyphs.js into public/brands/<id>/:
 *
 *   logo.svg               mark + wordmark  (header, footer)
 *   icon.svg               mark only         (favicon, manifest "any")
 *   icon-192.png           PNG favicon / PWA icon
 *   icon-512.png           PNG PWA / Play Store icon
 *   icon-maskable-512.png  Android adaptive icon (glyph inside the safe zone)
 *   og.svg / og.png        1200×630 social share image
 *
 * PNGs are rasterised with headless Chromium (no npm deps): the Playwright
 * browser pre-installed at $PLAYWRIGHT_BROWSERS_PATH, or any `chromium` /
 * (also writes the Play feature graphic to android/apps/<id>/feature-graphic.png)
 * `google-chrome` on PATH. Without a browser the SVGs are still written and
 * the PNG step is skipped with a warning.
 *
 * Usage:  node scripts/generate-brand-assets.js            # all brands
 *         node scripts/generate-brand-assets.js pdf image  # some brands
 *         SKIP_PNG=1 node scripts/generate-brand-assets.js # SVG only
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { BRANDS } = require('../lib/sites/brands');
const GLYPHS = require('./brand-glyphs');

const ROOT = path.join(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'public', 'brands');

// ── Chromium discovery ─────────────────────────────────────────────────────
function findChromium() {
  const candidates = [];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (pw && fs.existsSync(pw)) {
    // Prefer the headless shell: its window-size IS the viewport (the full
    // browser's "new headless" mode subtracts ~90px of toolbar and pads the
    // screenshot, which clipped the bottom of every image).
    for (const d of fs.readdirSync(pw)) {
      if (d.startsWith('chromium_headless_shell-')) {
        candidates.push(path.join(pw, d, 'chrome-linux', 'headless_shell'));
        candidates.push(path.join(pw, d, 'chrome-mac', 'headless_shell'));
      }
    }
    for (const d of fs.readdirSync(pw)) {
      if (d.startsWith('chromium-')) {
        candidates.push(path.join(pw, d, 'chrome-linux', 'chrome'));
        candidates.push(path.join(pw, d, 'chrome-linux', 'headless_shell'));
        candidates.push(path.join(pw, d, 'chrome-mac', 'Chromium.app', 'Contents', 'MacOS', 'Chromium'));
      }
    }
  }
  candidates.push('chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  for (const c of candidates) {
    try {
      if (c.includes(path.sep) ? fs.existsSync(c) : execFileSync('which', [c]).toString().trim()) return c;
    } catch (_) { /* keep looking */ }
  }
  return null;
}

// ── SVG builders ───────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function markShapePath(mark, size) {
  // Returns { clip: <element>, outline: <element> } for the mark silhouette.
  const s = size;
  switch (mark) {
    case 'circle':
      return `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/>`;
    case 'hex': {
      const r = s / 2, cx = s / 2, cy = s / 2;
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const a = Math.PI / 6 + i * Math.PI / 3;
        pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
      }
      return `<polygon points="${pts.join(' ')}"/>`;
    }
    case 'squircle':
      return `<rect width="${s}" height="${s}" rx="${(s * 0.30).toFixed(1)}"/>`;
    case 'tile':
    default:
      return `<rect width="${s}" height="${s}" rx="${(s * 0.18).toFixed(1)}"/>`;
  }
}

function markSvg(b, size, { maskable = false, id = 'm' } = {}) {
  const { primary, primaryDark, accent2, textOnPrimary, bg } = b.palette;
  const glyph = GLYPHS[b.logo.glyph];
  if (!glyph) throw new Error(`No glyph "${b.logo.glyph}" for brand ${b.id}`);
  // Glyph occupies 64% of the mark; 52% inside the maskable safe zone.
  const gScale = (maskable ? 0.52 : 0.64) * size / 100;
  const gOff = (size - 100 * gScale) / 2;
  const shape = maskable ? `<rect width="${size}" height="${size}"/>` : markShapePath(b.logo.mark, size);
  return `
  <defs>
    <linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent2}"/>
      <stop offset="0.55" stop-color="${primary}"/>
      <stop offset="1" stop-color="${primaryDark}"/>
    </linearGradient>
    <radialGradient id="${id}-hl" cx="0.3" cy="0.2" r="0.8">
      <stop offset="0" stop-color="#fff" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="${id}-c">${shape}</clipPath>
  </defs>
  <g clip-path="url(#${id}-c)">
    <rect width="${size}" height="${size}" fill="url(#${id}-g)"/>
    <rect width="${size}" height="${size}" fill="url(#${id}-hl)"/>
    <rect x="${size * 0.06}" y="${size * 0.06}" width="${size * 0.88}" height="${size * 0.88}" rx="${size * 0.16}" fill="none" stroke="${bg}" stroke-opacity="0.18" stroke-width="${Math.max(1, size * 0.012)}"/>
  </g>
  <g transform="translate(${gOff.toFixed(2)} ${gOff.toFixed(2)}) scale(${gScale.toFixed(4)})" color="${textOnPrimary}">
    ${glyph}
  </g>`;
}

function iconSvg(b, size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${markSvg(b, size)}\n</svg>\n`;
}

function maskableSvg(b, size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${markSvg(b, size, { maskable: true, id: 'mk' })}\n</svg>\n`;
}

function logoSvg(b) {
  // 72px mark + wordmark. Width grows with the second word.
  const [w1, w2] = b.wordmark;
  const fontHead = "Sora, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";
  // Bold sans averages ~0.66em per glyph; over-estimate slightly so nothing
  // is ever clipped in browsers whose fallback font is wider.
  const approx = (t, fs) => t.length * fs * 0.7;
  const fs = 30;
  const x1 = 88;
  const x2 = x1 + approx(w1, fs) + 8;
  const width = Math.ceil(x2 + approx(w2, fs) + 14);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 72" width="${width}" height="72" role="img" aria-label="${esc(b.siteName)}">
  <title>${esc(b.siteName)}</title>
  <g>${markSvg(b, 72, { id: 'l' })}</g>
  <text x="${x1}" y="46" font-family="${fontHead}" font-weight="800" font-size="${fs}" letter-spacing="-0.6" fill="#F8FAFC">${esc(w1)}</text>
  <text x="${x2}" y="46" font-family="${fontHead}" font-weight="800" font-size="${fs}" letter-spacing="-0.6" fill="${b.palette.primary}">${esc(w2)}</text>
</svg>
`;
}

function ogSvg(b, toolCount) {
  const { bg, surface, primary, accent2 } = b.palette;
  const fontHead = "Sora, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";
  const [w1, w2] = b.wordmark;
  const headline = b.concept.headline.length > 44 ? b.concept.headline.slice(0, 42).replace(/\s+\S*$/, '') + '…' : b.concept.headline;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${surface}"/></linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.7"><stop offset="0" stop-color="${primary}" stop-opacity="0.35"/><stop offset="1" stop-color="${primary}" stop-opacity="0"/></radialGradient>
    <radialGradient id="glow2" cx="0.1" cy="0.9" r="0.6"><stop offset="0" stop-color="${accent2}" stop-opacity="0.18"/><stop offset="1" stop-color="${accent2}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0v48" fill="none" stroke="#fff" stroke-opacity="0.045"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <g transform="translate(96 96)">${markSvg(b, 120, { id: 'og' })}</g>
  <text x="240" y="152" font-family="${fontHead}" font-weight="800" font-size="52" letter-spacing="-1.2" fill="#F8FAFC">${esc(w1)}<tspan fill="${primary}"> ${esc(w2)}</tspan></text>
  <text x="240" y="196" font-family="${fontHead}" font-weight="500" font-size="22" fill="#94A3B8">${esc(b.domain)}</text>
  <text x="96" y="352" font-family="${fontHead}" font-weight="800" font-size="60" letter-spacing="-1.5" fill="#F8FAFC">${esc(headline)}</text>
  <text x="96" y="410" font-family="${fontHead}" font-weight="500" font-size="26" fill="#CBD5E1">${esc(`${toolCount} free ${w2.toLowerCase()} tools · 100% in your browser · no sign-up`)}</text>
  <g transform="translate(96 476)">
    ${['Free forever', 'No uploads', 'Works offline', 'Android app'].map((t, i) => {
      const x = i * 210;
      return `<rect x="${x}" y="0" width="190" height="52" rx="26" fill="${primary}" fill-opacity="0.14" stroke="${primary}" stroke-opacity="0.45"/><text x="${x + 95}" y="34" text-anchor="middle" font-family="${fontHead}" font-weight="700" font-size="20" fill="${accent2}">${esc(t)}</text>`;
    }).join('')}
  </g>
  <rect x="0" y="622" width="1200" height="8" fill="${primary}"/>
</svg>
`;
}

// Google Play feature graphic (1024×500, shown at the top of the listing).
function featureSvg(b, toolCount) {
  const { bg, surface, primary, accent2 } = b.palette;
  const fontHead = "Sora, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif";
  const [w1, w2] = b.wordmark;
  // Headline wrapped onto two balanced lines (≤ 26 chars each) so it never
  // runs under the app mark on the right.
  // Prefer a sentence boundary near the middle; else balance by length.
  const words = b.concept.headline.split(/\s+/);
  const half = b.concept.headline.length / 2;
  let cut = -1, best = Infinity, len = 0;
  words.forEach((w, i) => { len += w.length + 1; if (/[.!?:]$/.test(w) && i < words.length - 1 && Math.abs(len - half) < best) { best = Math.abs(len - half); cut = i + 1; } });
  if (cut < 0 || best > 10) { len = 0; cut = words.findIndex(w => (len += w.length + 1) >= half) + 1; if (cut <= 0 || cut >= words.length) cut = Math.ceil(words.length / 2); }
  const lines = [words.slice(0, cut).join(' '), words.slice(cut).join(' ')];
  // Long lines drop to a smaller size instead of being cut off.
  const longest = Math.max(...lines.map(t => t.length));
  const hfs = longest > 26 ? 36 : 46;
  const cap = longest > 26 ? 34 : 26;
  const line = (t) => (t.length > cap ? t.slice(0, cap - 1).replace(/\s+\S*$/, '') + '…' : t);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <defs>
    <linearGradient id="fbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="${surface}"/></linearGradient>
    <radialGradient id="fglow" cx="0.9" cy="0.1" r="0.8"><stop offset="0" stop-color="${primary}" stop-opacity="0.38"/><stop offset="1" stop-color="${primary}" stop-opacity="0"/></radialGradient>
    <radialGradient id="fglow2" cx="0.05" cy="0.95" r="0.6"><stop offset="0" stop-color="${accent2}" stop-opacity="0.2"/><stop offset="1" stop-color="${accent2}" stop-opacity="0"/></radialGradient>
    <pattern id="fgrid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0v44" fill="none" stroke="#fff" stroke-opacity="0.045"/></pattern>
  </defs>
  <rect width="1024" height="500" fill="url(#fbg)"/>
  <rect width="1024" height="500" fill="url(#fgrid)"/>
  <rect width="1024" height="500" fill="url(#fglow)"/>
  <rect width="1024" height="500" fill="url(#fglow2)"/>
  <g transform="translate(748 110)">${markSvg(b, 220, { id: 'fg' })}</g>
  <text x="72" y="104" font-family="${fontHead}" font-weight="800" font-size="42" letter-spacing="-1" fill="#F8FAFC">${esc(w1)}<tspan fill="${primary}"> ${esc(w2)}</tspan></text>
  <text x="72" y="196" font-family="${fontHead}" font-weight="800" font-size="${hfs}" letter-spacing="-1.2" fill="#F8FAFC">${esc(line(lines[0]))}</text>
  <text x="72" y="248" font-family="${fontHead}" font-weight="800" font-size="${hfs}" letter-spacing="-1.2" fill="#F8FAFC">${esc(line(lines[1]))}</text>
  <text x="72" y="302" font-family="${fontHead}" font-weight="500" font-size="22" fill="#CBD5E1">${esc(`${toolCount} ${w2.toLowerCase()} tools · 100% on your device`)}</text>
  <g transform="translate(72 348)">
    ${['No sign-up', 'No uploads', 'Works offline'].map((t, i) => {
      const x = i * 186;
      return `<rect x="${x}" y="0" width="172" height="46" rx="23" fill="${primary}" fill-opacity="0.14" stroke="${primary}" stroke-opacity="0.45"/><text x="${x + 86}" y="30" text-anchor="middle" font-family="${fontHead}" font-weight="700" font-size="17" fill="${accent2}">${esc(t)}</text>`;
    }).join('')}
  </g>
  <text x="72" y="446" font-family="${fontHead}" font-weight="500" font-size="19" fill="#94A3B8">${esc(b.domain)}</text>
  <rect x="0" y="492" width="1024" height="8" fill="${primary}"/>
</svg>
`;
}

// ── Rasteriser ─────────────────────────────────────────────────────────────
function rasterise(chrome, svgPath, pngPath, w, h) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}img{display:block;width:${w}px;height:${h}px}</style></head><body><img src="file://${svgPath}"></body></html>`;
  const tmp = path.join(os.tmpdir(), `tr-brand-${process.pid}-${path.basename(pngPath)}.html`);
  fs.writeFileSync(tmp, html);
  try {
    const isShell = /headless_shell/.test(chrome);
    execFileSync(chrome, [
      ...(isShell ? [] : ['--headless=new']),
      '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
      '--default-background-color=00000000', '--force-device-scale-factor=1',
      `--window-size=${w},${h}`, `--screenshot=${pngPath}`, `file://${tmp}`,
    ], { stdio: ['ignore', 'ignore', 'ignore'], timeout: 60000 });
  } finally {
    try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ }
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
function toolCountFor(slug) {
  try {
    const src = fs.readFileSync(path.join(ROOT, 'lib', 'toolRegistry.js'), 'utf8');
    const reg = JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('};') + 1));
    return reg[slug] ? reg[slug].tools.length : 0;
  } catch (_) { return 0; }
}

function main() {
  const only = process.argv.slice(2).map(s => s.toLowerCase());
  const brands = only.length ? BRANDS.filter(b => only.includes(b.id) || only.includes(b.slug)) : BRANDS;
  const chrome = process.env.SKIP_PNG ? null : findChromium();
  if (!chrome && !process.env.SKIP_PNG) console.warn('⚠  No Chromium found — writing SVGs only (set PLAYWRIGHT_BROWSERS_PATH or install chromium for PNGs).');

  for (const b of brands) {
    const dir = path.join(OUT_ROOT, b.id);
    fs.mkdirSync(dir, { recursive: true });
    const count = toolCountFor(b.slug);

    const files = {
      'logo.svg': logoSvg(b),
      'icon.svg': iconSvg(b, 512),
      'icon-maskable.svg': maskableSvg(b, 512),
      'og.svg': ogSvg(b, count),
    };
    for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content);

    if (chrome) {
      rasterise(chrome, path.join(dir, 'icon.svg'), path.join(dir, 'icon-192.png'), 192, 192);
      rasterise(chrome, path.join(dir, 'icon.svg'), path.join(dir, 'icon-512.png'), 512, 512);
      rasterise(chrome, path.join(dir, 'icon-maskable.svg'), path.join(dir, 'icon-maskable-512.png'), 512, 512);
      rasterise(chrome, path.join(dir, 'og.svg'), path.join(dir, 'og.png'), 1200, 630);
      // Play Store feature graphic → android/apps/<id>/ (listing asset, not served).
      const appDir = path.join(ROOT, 'android', 'apps', b.id);
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(appDir, 'feature-graphic.svg'), featureSvg(b, count));
      rasterise(chrome, path.join(appDir, 'feature-graphic.svg'), path.join(appDir, 'feature-graphic.png'), 1024, 500);
    }
    console.log(`✓ ${b.id.padEnd(12)} → public/brands/${b.id}/  (${count} tools, ${chrome ? 'svg+png' : 'svg only'})`);
  }
  console.log(`\nDone: ${brands.length} brand(s).`);
}

main();
