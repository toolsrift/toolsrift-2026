// ── ToolsRift Category Theme Registry ────────────────────────────────────────
// Single source of truth for all 23 categories. Each entry = a micro-brand.
// Used by: shared layouts, motion primitives, category pages, app builds.

const FONT_STACKS = {
  default:    { head: "'Sora', sans-serif",          body: "'Plus Jakarta Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
  business:   { head: "'Outfit', sans-serif",        body: "'DM Sans', sans-serif",           mono: "'JetBrains Mono', monospace" },
  editorial:  { head: "'Sora', sans-serif",          body: "'Inter', sans-serif",             mono: "'JetBrains Mono', monospace" },
  monoFirst:  { head: "'JetBrains Mono', monospace", body: "'Plus Jakarta Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
  expressive: { head: "'Sora', sans-serif",          body: "'Plus Jakarta Sans', sans-serif", mono: "'JetBrains Mono', monospace" },
};

// ── Animation style presets — each category gets a signature feel ───────────
// Used by motion primitives to choose entry / hover / accent animations.
const ANIM = {
  smooth:    { feel: 'smooth',    intensity: 0.5, blob: true,  particles: false, scanline: false }, // default
  bouncy:    { feel: 'bouncy',    intensity: 0.8, blob: true,  particles: true,  scanline: false }, // playful
  precise:   { feel: 'precise',   intensity: 0.4, blob: false, particles: false, scanline: false }, // calc/finance
  glitch:    { feel: 'glitch',    intensity: 0.7, blob: false, particles: false, scanline: true  }, // dev/hash
  liquid:    { feel: 'liquid',    intensity: 0.9, blob: true,  particles: true,  scanline: false }, // colors/css
  cinematic: { feel: 'cinematic', intensity: 0.6, blob: true,  particles: false, scanline: false }, // images/pdf
};

function tintRGBA(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Helper to build a complete theme object from minimal input ──────────────
function buildTheme(t) {
  const tint25 = tintRGBA(t.color, 0.25);
  const tint12 = tintRGBA(t.color, 0.12);
  const tint06 = tintRGBA(t.color, 0.06);
  const tint03 = tintRGBA(t.color, 0.03);
  const accent2 = t.accent2 || t.colorDark;

  return {
    // Identity
    id:          t.id,
    name:        t.name,
    slug:        t.slug,
    icon:        t.icon,
    motif:       t.motif || t.icon,           // visual motif (emoji/symbol)
    description: t.description,
    tagline:     t.tagline || t.description,  // short, punchy
    toolCount:   t.toolCount,

    // Colors (primary)
    color:       t.color,
    colorDark:   t.colorDark,
    colorLight:  tint12,
    accent2,                                   // secondary accent
    textOnColor: t.textOnColor || '#fff',

    // Tints (NEW — for 25% color-on-dark backgrounds)
    tint25,                                    // 25% — used for big bg washes
    tint12,                                    // 12% — used for chips/pills
    tint06,                                    // 6%  — used for card hover
    tint03,                                    // 3%  — used for subtle bg

    // Backgrounds (NEW — pre-built layered backgrounds)
    bgBase:      '#06090F',
    bgTint:      `linear-gradient(180deg, ${tint25} 0%, ${tint06} 30%, #06090F 70%)`,
    bgRadial:    `radial-gradient(ellipse 80% 60% at 50% 0%, ${tint25} 0%, transparent 60%)`,
    bgMesh:      `radial-gradient(ellipse 50% 40% at 20% 10%, ${tint25} 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 80% 30%, ${tintRGBA(accent2, 0.18)} 0%, transparent 50%)`,

    // Gradients
    gradient:    t.gradient || `linear-gradient(135deg, ${t.color}, ${t.colorDark})`,
    gradientSoft:`linear-gradient(135deg, ${tintRGBA(t.color, 0.18)}, ${tintRGBA(accent2, 0.12)})`,
    gradientText:`linear-gradient(135deg, ${t.color}, ${accent2})`,

    // Glow / shadow
    glow:        `0 0 40px ${tintRGBA(t.color, 0.35)}`,
    glowSoft:    `0 0 24px ${tintRGBA(t.color, 0.2)}`,
    shadowCard:  `0 8px 32px ${tintRGBA(t.color, 0.08)}, 0 1px 0 ${tintRGBA('#ffffff', 0.04)} inset`,

    // Typography & motion
    fonts:       FONT_STACKS[t.fontStack || 'default'],
    fontStackId: t.fontStack || 'default',
    anim:        ANIM[t.animStyle || 'smooth'],
    animStyleId: t.animStyle || 'smooth',

    // Routing & app shell
    pageRoute:   t.pageRoute,
    appPackage:  t.appPackage,
  };
}

// ── Category definitions ────────────────────────────────────────────────────
const RAW = [
  { id:'text',        name:'Text Tools',                  slug:'text',        icon:'✍️', motif:'Aa', description:'Word counter, case converter, lorem ipsum, readability and more', tagline:'Type, transform, refine.',           toolCount:45, color:'#3B82F6', colorDark:'#2563EB', accent2:'#60A5FA', pageRoute:'/text',        appPackage:'com.toolsrift.text',        fontStack:'editorial',  animStyle:'smooth' },
  { id:'image',       name:'Image Tools',                 slug:'images',      icon:'🖼️', motif:'◐',  description:'Resize, compress, crop, convert and filter images in-browser',     tagline:'Pixel-perfect, instantly.',         toolCount:50, color:'#EC4899', colorDark:'#DB2777', accent2:'#F472B6', pageRoute:'/images',      appPackage:'com.toolsrift.image',       fontStack:'expressive', animStyle:'cinematic' },
  { id:'pdf',         name:'PDF Tools',                   slug:'pdf',         icon:'📄', motif:'▦',  description:'Merge, split, compress and convert PDF files — no uploads needed', tagline:'Documents, done in-browser.',       toolCount:28, color:'#EF4444', colorDark:'#DC2626', accent2:'#F87171', pageRoute:'/pdf',         appPackage:'com.toolsrift.pdf',         fontStack:'editorial',  animStyle:'cinematic' },
  { id:'code',        name:'JSON Tools',                  slug:'json',        icon:'{}', motif:'{ }', description:'Format, validate, minify and convert JSON in one click',           tagline:'Structured data, simplified.',      toolCount:25, color:'#10B981', colorDark:'#059669', accent2:'#34D399', pageRoute:'/json',        appPackage:'com.toolsrift.code',        fontStack:'monoFirst',  animStyle:'precise' },
  { id:'encoders',    name:'Encoders & Decoders',         slug:'encoders',    icon:'🔄', motif:'⇄',  description:'Base64, URL, HTML entities, JWT, hex and more encoding tools',     tagline:'Translate any format.',             toolCount:25, color:'#F59E0B', colorDark:'#D97706', accent2:'#FBBF24', pageRoute:'/encoders',    appPackage:'com.toolsrift.encoders',    fontStack:'monoFirst',  animStyle:'precise', textOnColor:'#0a0a0a' },
  { id:'colors',      name:'Color Tools',                 slug:'colors',      icon:'🎨', motif:'◉',  description:'HEX/RGB/HSL converter, palette generator, contrast checker',       tagline:'Every shade, every space.',         toolCount:20, color:'#A855F7', colorDark:'#9333EA', accent2:'#C084FC', pageRoute:'/colors',      appPackage:'com.toolsrift.colors',      fontStack:'expressive', animStyle:'liquid' },
  { id:'css',         name:'CSS Generators',              slug:'css',         icon:'🎭', motif:'◇',  description:'Gradient, box-shadow, border-radius, animation and grid generators',tagline:'Style, generated.',                 toolCount:20, color:'#06B6D4', colorDark:'#0891B2', accent2:'#22D3EE', pageRoute:'/css',         appPackage:'com.toolsrift.css',         fontStack:'expressive', animStyle:'liquid' },
  { id:'html',        name:'HTML Tools',                  slug:'html',        icon:'🌐', motif:'</>',description:'Format, minify, validate, encode and generate HTML markup',       tagline:'Markup, mastered.',                 toolCount:25, color:'#F97316', colorDark:'#EA580C', accent2:'#FB923C', pageRoute:'/html',        appPackage:'com.toolsrift.html',        fontStack:'monoFirst',  animStyle:'precise' },
  { id:'js',          name:'JavaScript Tools',            slug:'js',          icon:'⚙️', motif:'JS', description:'Format, minify, validate and obfuscate JavaScript code',           tagline:'Tame your scripts.',                toolCount:10, color:'#EAB308', colorDark:'#CA8A04', accent2:'#FACC15', pageRoute:'/js',          appPackage:'com.toolsrift.js',          fontStack:'monoFirst',  animStyle:'precise', textOnColor:'#0a0a0a' },
  { id:'formatters',  name:'Code Formatters',             slug:'formatters',  icon:'✨', motif:'≡',  description:'One-click beautifiers for CSS, SQL, XML, YAML, Markdown and more',  tagline:'Clean code, one click.',            toolCount:25, color:'#14B8A6', colorDark:'#0D9488', accent2:'#2DD4BF', pageRoute:'/formatters',  appPackage:'com.toolsrift.formatters',  fontStack:'monoFirst',  animStyle:'precise' },
  { id:'hash',        name:'Hash & Crypto',               slug:'hash',        icon:'🔐', motif:'#',  description:'MD5, SHA-1, SHA-256, HMAC, bcrypt and UUID generators',             tagline:'Cryptographically secure.',         toolCount:25, color:'#7C3AED', colorDark:'#6D28D9', accent2:'#A78BFA', pageRoute:'/hash',        appPackage:'com.toolsrift.hash',        fontStack:'monoFirst',  animStyle:'glitch' },
  { id:'fancy',       name:'Fancy Text',                  slug:'fancy',       icon:'🪄', motif:'𝓕',  description:'Bold, italic, cursive, gothic and 15+ Unicode text styles',         tagline:'Style your words.',                 toolCount:20, color:'#D946EF', colorDark:'#C026D3', accent2:'#E879F9', pageRoute:'/fancy',       appPackage:'com.toolsrift.fancy',       fontStack:'expressive', animStyle:'bouncy' },
  { id:'encoding',    name:'Text Encoding',               slug:'encoding',    icon:'🔡', motif:'01', description:'Morse code, binary, NATO alphabet, Caesar cipher, ROT13 and more', tagline:'Encode anything.',                  toolCount:11, color:'#6366F1', colorDark:'#4F46E5', accent2:'#818CF8', pageRoute:'/encoding',    appPackage:'com.toolsrift.encoding',    fontStack:'monoFirst',  animStyle:'glitch' },
  { id:'everyday',    name:'Everyday Tools',              slug:'everyday',    icon:'🧰', motif:'✦',  description:'Age calculator, timers, stopwatch, typing test, dice and daily utilities', tagline:'Daily essentials.',                 toolCount:12, color:'#F97316', colorDark:'#EA580C', accent2:'#FB923C', pageRoute:'/everyday',    appPackage:'com.toolsrift.everyday',    fontStack:'default',    animStyle:'bouncy' },
  { id:'generators',  name:'Security Generators',         slug:'generators',  icon:'🛡️', motif:'◆',  description:'Password, UUID, QR code, barcode and secure ID generators',        tagline:'Secrets, generated safely.',        toolCount:25, color:'#84CC16', colorDark:'#65A30D', accent2:'#A3E635', pageRoute:'/generators',  appPackage:'com.toolsrift.generators',  fontStack:'monoFirst',  animStyle:'precise', textOnColor:'#0a0a0a' },
  { id:'gen-content', name:'Content Generators',          slug:'generators2', icon:'📢', motif:'¶',  description:'Privacy policy, terms of service, SVG art and ad copy generators', tagline:'Boilerplate, beautifully.',         toolCount:34, color:'#0EA5E9', colorDark:'#0284C7', accent2:'#38BDF8', pageRoute:'/generators2', appPackage:'com.toolsrift.gen-content', fontStack:'editorial',  animStyle:'smooth' },
  { id:'devgen',      name:'Dev Config Generators',       slug:'devgen',      icon:'🗂️', motif:'$_', description:'.gitignore, Dockerfile, nginx, package.json and .env generators',  tagline:'Configs, on demand.',               toolCount:29, color:'#8B5CF6', colorDark:'#7C3AED', accent2:'#A78BFA', pageRoute:'/devgen',      appPackage:'com.toolsrift.devgen',      fontStack:'monoFirst',  animStyle:'glitch' },
  { id:'devtools',    name:'Developer Tools',             slug:'devtools',    icon:'🔧', motif:'>_', description:'Regex tester, JSON diff, JWT debugger, cron builder, chmod calc',  tagline:'Your daily dev arsenal.',           toolCount:37, color:'#22D3EE', colorDark:'#06B6D4', accent2:'#67E8F9', pageRoute:'/devtools',    appPackage:'com.toolsrift.devtools',    fontStack:'monoFirst',  animStyle:'glitch' },
  { id:'mathcalc',    name:'Math Calculators',            slug:'mathcalc',    icon:'📐', motif:'∑',  description:'Geometry, algebra, trigonometry, matrices and statistics solvers', tagline:'Solve, instantly.',                 toolCount:36, color:'#6366F1', colorDark:'#4F46E5', accent2:'#818CF8', pageRoute:'/mathcalc',    appPackage:'com.toolsrift.mathcalc',    fontStack:'editorial',  animStyle:'precise' },
  { id:'financecalc', name:'Finance & Health Calculators',slug:'financecalc', icon:'💰', motif:'₹',  description:'EMI, TDEE, tax estimator, investment returns and calorie calculators', tagline:'Numbers that matter.',           toolCount:50, color:'#22C55E', colorDark:'#16A34A', accent2:'#4ADE80', pageRoute:'/financecalc', appPackage:'com.toolsrift.financecalc', fontStack:'editorial',  animStyle:'precise' },
  { id:'units',       name:'Unit Converters',             slug:'units',       icon:'📏', motif:'⇌',  description:'Length, weight, temperature, speed, area and volume converters',   tagline:'Any unit, any system.',             toolCount:25, color:'#06B6D4', colorDark:'#0891B2', accent2:'#22D3EE', pageRoute:'/units',       appPackage:'com.toolsrift.units',       fontStack:'editorial',  animStyle:'precise' },
  { id:'converters2', name:'Specialty Converters',        slug:'converters2', icon:'⚡', motif:'Ω',  description:'Electrical units, clothing sizes, paper sizes and physical constants', tagline:'Niche conversions, covered.',    toolCount:20, color:'#0EA5E9', colorDark:'#0284C7', accent2:'#38BDF8', pageRoute:'/converters2', appPackage:'com.toolsrift.converters2', fontStack:'editorial',  animStyle:'precise' },
  { id:'business',    name:'Business Tools',              slug:'business',    icon:'💼', motif:'§',  description:'Invoice generator, resume builder, cover letter and SWOT tools',   tagline:'Professional documents in minutes.',toolCount:15, color:'#059669', colorDark:'#047857', accent2:'#10B981', pageRoute:'/business',    appPackage:'com.toolsrift.business',    fontStack:'business',   animStyle:'smooth' },
];

const CATEGORY_THEMES = RAW.map(buildTheme);

export default CATEGORY_THEMES;
export { FONT_STACKS, ANIM, tintRGBA };

export function getCategoryById(id) {
  return CATEGORY_THEMES.find(c => c.id === id) || null;
}

export function getCategoryByRoute(route) {
  return CATEGORY_THEMES.find(c => c.pageRoute === route) || null;
}

export function getCategoryBySlug(slug) {
  return CATEGORY_THEMES.find(c => c.slug === slug) || null;
}
