// ── Logo glyphs for every ToolsRift network brand ───────────────────────────
// Each glyph is an SVG fragment drawn in a 100×100 box (centre 50,50) using
// only `currentColor`, so the same glyph works on the gradient mark, in the
// wordmark, on the OG image and as a monochrome favicon. Keep shapes simple:
// they have to survive 16px.
//
// Consumed by scripts/generate-brand-assets.js. Keys match `logo.glyph` in
// lib/sites/brands.js.

const S = 'fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"';

const GLYPHS = {
  // "Aa" — manuscript
  text: `<text x="50" y="68" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="58" fill="currentColor">Aa</text>`,

  // mountain + sun in a viewfinder
  image: `<rect x="18" y="20" width="64" height="60" rx="10" ${S}/><circle cx="64" cy="38" r="6" fill="currentColor"/><path d="M24 70l17-20 11 12 8-8 16 16" ${S}/>`,

  // page with folded corner + text lines
  pdf: `<path d="M30 16h26l18 18v50H30z" ${S}/><path d="M56 16v18h18" ${S}/><path d="M40 50h20M40 62h20" ${S}/>`,

  // curly braces
  json: `<path d="M40 18c-8 0-10 4-10 10v12c0 6-4 8-8 10 4 2 8 4 8 10v12c0 6 2 10 10 10M60 18c8 0 10 4 10 10v12c0 6 4 8 8 10-4 2-8 4-8 10v12c0 6-2 10-10 10" ${S}/>`,

  // two opposing arrows
  encoders: `<path d="M22 38h50M60 26l12 12-12 12M78 62H28M40 50L28 62l12 12" ${S}/>`,

  // three overlapping circles (colour wheel)
  colors: `<circle cx="50" cy="36" r="18" fill="currentColor" opacity=".55"/><circle cx="36" cy="60" r="18" fill="currentColor" opacity=".75"/><circle cx="64" cy="60" r="18" fill="currentColor" opacity=".95"/>`,

  // stacked layers (diamonds)
  css: `<path d="M50 20l30 16-30 16-30-16z" ${S}/><path d="M20 52l30 16 30-16M20 66l30 16 30-16" ${S}/>`,

  // </>
  html: `<path d="M34 30L16 50l18 20M66 30l18 20-18 20M58 22L42 78" ${S}/>`,

  // JS lettering
  js: `<text x="50" y="70" text-anchor="middle" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="54" fill="currentColor">JS</text>`,

  // indented lines
  formatters: `<path d="M20 26h60M32 42h48M32 58h36M20 74h60" ${S}/>`,

  // hash
  hash: `<path d="M38 18l-8 64M70 18l-8 64M20 40h64M16 62h64" ${S}/>`,

  // ornamental F
  fancy: `<text x="50" y="72" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="700" font-size="66" fill="currentColor">F</text>`,

  // dot-dash (morse) + binary
  encoding: `<circle cx="24" cy="36" r="6" fill="currentColor"/><rect x="38" y="30" width="40" height="12" rx="6" fill="currentColor"/><rect x="22" y="58" width="28" height="12" rx="6" fill="currentColor"/><circle cx="64" cy="64" r="6" fill="currentColor"/><circle cx="80" cy="64" r="6" fill="currentColor"/>`,

  // toolbox
  everyday: `<rect x="16" y="40" width="68" height="40" rx="8" ${S}/><path d="M38 40v-8a12 12 0 0 1 24 0v8M16 58h68" ${S}/>`,

  // key
  generators: `<circle cx="36" cy="40" r="16" ${S}/><path d="M48 50l30 30M70 72l8-8M62 64l8-8" ${S}/>`,

  // pilcrow
  content: `<path d="M64 18v64M48 18v64M48 18H40a16 16 0 0 0 0 32h8M48 18h30" ${S}/>`,

  // $_ prompt
  devgen: `<text x="50" y="68" text-anchor="middle" font-family="Menlo, Consolas, monospace" font-weight="700" font-size="54" fill="currentColor">$_</text>`,

  // >_ prompt
  devtools: `<path d="M22 30l22 20-22 20" ${S}/><path d="M52 70h28" ${S}/>`,

  // sigma
  math: `<path d="M74 24H30l24 26-24 26h44" ${S}/>`,

  // rising bar chart + arrow
  finance: `<path d="M20 78V56M40 78V44M60 78V34M80 78V22" ${S}/><path d="M22 40l22-14 18 8 18-14M70 20h10v10" ${S}/>`,

  // ruler
  units: `<rect x="14" y="36" width="72" height="28" rx="6" ${S}/><path d="M28 36v10M42 36v16M56 36v10M70 36v16" ${S}/>`,

  // omega
  converters: `<path d="M26 78h14l-8-8a24 24 0 1 1 36 0l-8 8h14" ${S}/>`,

  // briefcase
  business: `<rect x="16" y="34" width="68" height="46" rx="8" ${S}/><path d="M36 34v-8a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v8M16 54h68" ${S}/>`,

  // die
  random: `<rect x="20" y="20" width="60" height="60" rx="14" ${S}/><circle cx="36" cy="36" r="5" fill="currentColor"/><circle cx="64" cy="36" r="5" fill="currentColor"/><circle cx="50" cy="50" r="5" fill="currentColor"/><circle cx="36" cy="64" r="5" fill="currentColor"/><circle cx="64" cy="64" r="5" fill="currentColor"/>`,

  // waveform bars
  audio: `<path d="M18 42v16M30 30v40M42 22v56M54 34v32M66 26v48M78 40v20" ${S}/>`,

  // index card / desk tray
  office: `<rect x="16" y="24" width="68" height="52" rx="8" ${S}/><path d="M16 42h68M30 56h26" ${S}/>`,

  // bars
  data: `<path d="M22 78V54M42 78V38M62 78V46M82 78V24" stroke="currentColor" stroke-width="12" stroke-linecap="round" fill="none"/>`,

  // graduation cap
  study: `<path d="M50 24L14 42l36 18 36-18z" ${S}/><path d="M28 50v16c0 6 10 12 22 12s22-6 22-12V50M86 42v22" ${S}/>`,

  // play button in a frame
  video: `<rect x="16" y="24" width="68" height="52" rx="8" ${S}/><path d="M42 38l20 12-20 12z" fill="currentColor"/>`,
};

module.exports = GLYPHS;
