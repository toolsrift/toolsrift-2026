// ── ToolsRift Network — Brand Registry ───────────────────────────────────────
// One entry per standalone category website. This is the single source of
// truth for everything that makes a network site *its own product*:
//
//   • domain, site name, wordmark and tagline
//   • design concept (the idea behind the look) and the palette that expresses it
//   • typography pairing (Google Fonts) and shape language (radius scale)
//   • background pattern used by <BrandBackdrop /> to give every site a
//     recognisable texture (paper, blueprint, waveform, film strip, …)
//   • logo spec consumed by scripts/generate-brand-assets.js
//   • Android (Trusted Web Activity) app identity consumed by
//     scripts/android/generate.js
//
// Rules
//   - `id` MUST equal the category id in lib/categoryThemes.js.
//   - `slug` MUST equal the registry key in lib/toolRegistry.js (the hub route).
//   - Keep this file data-only (no React, no imports) — it is read by Node
//     scripts, the Next.js middleware (edge) and the browser bundle alike.
//   - `domain` is a subdomain of toolsrift.com (pdf.toolsrift.com, …). The apex
//     is on Vercel DNS with a wildcard, so every subdomain already resolves;
//     "going live" = attaching it to the toolsrift-<id> Vercel project. A site
//     can later move to its own apex domain by changing this one field.
//   - `live` controls whether the rest of the network links to the standalone
//     domain (true) or to the hub path on toolsrift.com (false). Flip it to
//     true only once that domain actually serves the site.
//
// Every palette is a *dark* family (the 1,100+ tool bodies are built on dark
// surfaces), but each site gets its own base hue, accent, fonts and texture so
// no two feel alike.

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const JBM = 'JetBrains+Mono:wght@400;500;600';

// Small helper so each entry stays readable.
function brand(b) {
  return {
    live: false,
    ...b,
    fonts: {
      mono: MONO,
      ...b.fonts,
      google: `${b.fonts.google}&family=${JBM}`,
    },
  };
}

const BRANDS = [
  brand({
    id: 'text', slug: 'text', domain: 'text.toolsrift.com', live: true,
    siteName: 'ToolsRift Text', wordmark: ['ToolsRift', 'Text'],
    tagline: 'Type, transform, refine.',
    concept: {
      name: 'Manuscript',
      headline: 'Every word, exactly where you want it.',
      sub: 'Counters, converters, cleaners and generators for anyone who works with words — writers, students, editors and developers.',
      vibe: 'Editorial. Serif display type on ink-black paper with faint ruled lines.',
    },
    palette: { bg: '#08090E', bgRaised: '#0C0E15', surface: '#0F1219', surface2: '#141824', surface3: '#1A1F2E', primary: '#3B82F6', primaryDark: '#2563EB', accent2: '#93C5FD', textOnPrimary: '#ffffff' },
    fonts: { head: "'Fraunces', Georgia, serif", body: "'Inter', system-ui, sans-serif", google: 'Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 10, radiusLg: 16, button: 'soft' },
    pattern: 'ruled',
    logo: { glyph: 'text', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.text.twa', appName: 'ToolsRift Text Tools', shortName: 'Text Tools', playCategory: 'PRODUCTIVITY', shortDesc: 'Word counter, case converter, lorem ipsum & 60+ text tools. Private.' },
    seo: { keywords: 'text tools, word counter, character counter, case converter, lorem ipsum generator, remove line breaks, text cleaner' },
  }),

  brand({
    id: 'image', slug: 'images', domain: 'image.toolsrift.com', live: true,
    siteName: 'ToolsRift Image', wordmark: ['ToolsRift', 'Image'],
    tagline: 'Pixel-perfect, instantly.',
    concept: {
      name: 'Darkroom',
      headline: 'Edit like a pro. Upload nothing.',
      sub: 'Resize, compress, crop, convert and filter photos right in your browser. Your images never leave your device.',
      vibe: 'Photographic. Deep magenta-black, film grain, rounded viewfinder shapes.',
    },
    palette: { bg: '#0B0709', bgRaised: '#100A0D', surface: '#140D11', surface2: '#1A1116', surface3: '#22161C', primary: '#EC4899', primaryDark: '#DB2777', accent2: '#F9A8D4', textOnPrimary: '#ffffff' },
    fonts: { head: "'Syne', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif", google: 'Syne:wght@600;700;800&family=Manrope:wght@400;500;600;700' },
    shape: { radius: 16, radiusLg: 24, button: 'pill' },
    pattern: 'grain',
    logo: { glyph: 'image', mark: 'circle' },
    android: { packageId: 'com.toolsrift.image', appName: 'ToolsRift Image Tools', shortName: 'Image Tools', playCategory: 'PHOTOGRAPHY', shortDesc: 'Resize, compress, crop & convert images offline. 60+ tools, no uploads.' },
    seo: { keywords: 'image resizer, image compressor, crop image, convert image, png to jpg, webp converter, photo editor online' },
  }),

  brand({
    id: 'pdf', slug: 'pdf', domain: 'pdf.toolsrift.com', live: true,
    siteName: 'ToolsRift PDF', wordmark: ['ToolsRift', 'PDF'],
    tagline: 'Documents, done in-browser.',
    concept: {
      name: 'Paper & Ink',
      headline: 'Merge, split, sign. Never upload.',
      sub: 'Every PDF tool runs locally in your browser. Contracts, statements and IDs stay on your machine — always.',
      vibe: 'Stationery. Warm charcoal paper, crimson ink, classic serif headlines, crisp corners.',
    },
    palette: { bg: '#0E0A09', bgRaised: '#130E0C', surface: '#17110F', surface2: '#1E1613', surface3: '#261C18', primary: '#EF4444', primaryDark: '#DC2626', accent2: '#FCA5A5', textOnPrimary: '#ffffff' },
    fonts: { head: "'Playfair Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif", google: 'Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700' },
    shape: { radius: 6, radiusLg: 12, button: 'square' },
    pattern: 'paper',
    logo: { glyph: 'pdf', mark: 'tile' },
    android: { packageId: 'com.toolsrift.pdf', appName: 'ToolsRift PDF Tools', shortName: 'PDF Tools', playCategory: 'PRODUCTIVITY', shortDesc: 'Merge, split, compress, sign & convert PDFs offline. 40 tools, no uploads.' },
    seo: { keywords: 'pdf tools, merge pdf, split pdf, compress pdf, pdf to image, sign pdf, pdf converter online free' },
  }),

  brand({
    id: 'code', slug: 'json', domain: 'json.toolsrift.com', live: true,
    siteName: 'ToolsRift JSON', wordmark: ['ToolsRift', 'JSON'],
    tagline: 'Structured data, simplified.',
    concept: {
      name: 'Bracket',
      headline: 'Format it. Validate it. Ship it.',
      sub: 'Formatter, validator, diff, JSONPath and converters to CSV, YAML and XML — built for developers who live in curly braces.',
      vibe: 'Engineering. Green-on-black, IBM Plex type, hairline grid, square corners.',
    },
    palette: { bg: '#060A08', bgRaised: '#0A0F0C', surface: '#0D1410', surface2: '#121A15', surface3: '#18221C', primary: '#10B981', primaryDark: '#059669', accent2: '#6EE7B7', textOnPrimary: '#06110C' },
    fonts: { head: "'IBM Plex Sans', system-ui, sans-serif", body: "'IBM Plex Sans', system-ui, sans-serif", mono: "'IBM Plex Mono', ui-monospace, monospace", google: 'IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600' },
    shape: { radius: 4, radiusLg: 8, button: 'square' },
    pattern: 'grid',
    logo: { glyph: 'json', mark: 'tile' },
    android: { packageId: 'com.toolsrift.json', appName: 'ToolsRift JSON Tools', shortName: 'JSON Tools', playCategory: 'TOOLS', shortDesc: 'JSON formatter, validator, minifier, diff & converters. 30 tools, offline.' },
    seo: { keywords: 'json formatter, json validator, json minifier, json to csv, json to yaml, json diff, jsonpath tester' },
  }),

  brand({
    id: 'encoders', slug: 'encoders', domain: 'encoders.toolsrift.com', live: true,
    siteName: 'ToolsRift Encoders', wordmark: ['ToolsRift', 'Encoders'],
    tagline: 'Translate any format.',
    concept: {
      name: 'Cipher',
      headline: 'From any format to any other.',
      sub: 'Base64, URL, HTML entities, JWT, hex, punycode and 35 more encoders and decoders — instant, offline, exact.',
      vibe: 'Amber phosphor. Diagonal hatching, grotesk headlines, warm black.',
    },
    palette: { bg: '#0B0904', bgRaised: '#100D07', surface: '#15110A', surface2: '#1B160E', surface3: '#231D13', primary: '#F59E0B', primaryDark: '#D97706', accent2: '#FDE68A', textOnPrimary: '#140D02' },
    fonts: { head: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700' },
    shape: { radius: 8, radiusLg: 14, button: 'soft' },
    pattern: 'diagonal',
    logo: { glyph: 'encoders', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.encoders', appName: 'ToolsRift Encoders', shortName: 'Encoders', playCategory: 'TOOLS', shortDesc: 'Base64, URL, HTML, JWT & hex encoders and decoders. 40+ tools, offline.' },
    seo: { keywords: 'base64 encode, base64 decode, url encoder, url decoder, html entity encoder, jwt decoder, hex converter' },
  }),

  brand({
    id: 'colors', slug: 'colors', domain: 'colors.toolsrift.com', live: true,
    siteName: 'ToolsRift Colors', wordmark: ['ToolsRift', 'Colors'],
    tagline: 'Every shade, every space.',
    concept: {
      name: 'Spectrum',
      headline: 'Find the colour. Then find its friends.',
      sub: 'Pickers, palettes, converters and contrast checkers for designers who care about every hue.',
      vibe: 'Chromatic. Violet-black base, aurora gradients, big friendly radii.',
    },
    palette: { bg: '#0A0710', bgRaised: '#0F0B16', surface: '#130E1C', surface2: '#191324', surface3: '#21192E', primary: '#A855F7', primaryDark: '#9333EA', accent2: '#F0ABFC', textOnPrimary: '#ffffff' },
    fonts: { head: "'Bricolage Grotesque', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif", google: 'Bricolage+Grotesque:wght@600;700;800&family=Manrope:wght@400;500;600;700' },
    shape: { radius: 18, radiusLg: 26, button: 'pill' },
    pattern: 'aurora',
    logo: { glyph: 'colors', mark: 'circle' },
    android: { packageId: 'com.toolsrift.colors', appName: 'ToolsRift Color Tools', shortName: 'Color Tools', playCategory: 'ART_AND_DESIGN', shortDesc: 'Color picker, palette generator, HEX/RGB/HSL converter & contrast checker.' },
    seo: { keywords: 'color picker, color palette generator, hex to rgb, rgb to hsl, contrast checker, color converter, gradient generator' },
  }),

  brand({
    id: 'css', slug: 'css', domain: 'css.toolsrift.com', live: true,
    siteName: 'ToolsRift CSS', wordmark: ['ToolsRift', 'CSS'],
    tagline: 'Style, generated.',
    concept: {
      name: 'Blueprint',
      headline: 'Design it visually. Copy the CSS.',
      sub: 'Gradients, shadows, radii, animations, flexbox and grid — tweak the sliders, watch the preview, paste the code.',
      vibe: 'Drafting table. Cyan on deep teal-black, blueprint grid, geometric type.',
    },
    palette: { bg: '#04090C', bgRaised: '#070E12', surface: '#0A1318', surface2: '#0F1A20', surface3: '#15232A', primary: '#06B6D4', primaryDark: '#0891B2', accent2: '#67E8F9', textOnPrimary: '#03161B' },
    fonts: { head: "'Outfit', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 12, radiusLg: 18, button: 'soft' },
    pattern: 'blueprint',
    logo: { glyph: 'css', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.css', appName: 'ToolsRift CSS Generators', shortName: 'CSS Gen', playCategory: 'TOOLS', shortDesc: 'CSS gradient, shadow, border-radius, animation & grid generators. 38 tools.' },
    seo: { keywords: 'css generator, css gradient generator, box shadow generator, border radius generator, flexbox generator, css grid generator' },
  }),

  brand({
    id: 'html', slug: 'html', domain: 'html.toolsrift.com', live: true,
    siteName: 'ToolsRift HTML', wordmark: ['ToolsRift', 'HTML'],
    tagline: 'Markup, mastered.',
    concept: {
      name: 'Markup',
      headline: 'Clean markup, one paste away.',
      sub: 'Format, minify, validate, encode and generate HTML — tables, meta tags, forms and more.',
      vibe: 'Tag orange on warm black. Angular type, tight corners, subtle grid.',
    },
    palette: { bg: '#0C0805', bgRaised: '#110C08', surface: '#16100B', surface2: '#1C150F', surface3: '#241C14', primary: '#F97316', primaryDark: '#EA580C', accent2: '#FDBA74', textOnPrimary: '#180A02' },
    fonts: { head: "'Archivo', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 6, radiusLg: 10, button: 'square' },
    pattern: 'grid',
    logo: { glyph: 'html', mark: 'tile' },
    android: { packageId: 'com.toolsrift.html', appName: 'ToolsRift HTML Tools', shortName: 'HTML Tools', playCategory: 'TOOLS', shortDesc: 'HTML formatter, minifier, validator, encoder & generators. 43 tools.' },
    seo: { keywords: 'html formatter, html minifier, html validator, html encoder, html table generator, meta tag generator' },
  }),

  brand({
    id: 'js', slug: 'js', domain: 'js.toolsrift.com', live: true,
    siteName: 'ToolsRift JS', wordmark: ['ToolsRift', 'JS'],
    tagline: 'Tame your scripts.',
    concept: {
      name: 'Yellow Card',
      headline: 'JavaScript, formatted and minified in a click.',
      sub: 'Beautify, minify, validate and obfuscate JavaScript — plus converters, regex helpers and snippet generators.',
      vibe: 'The JS yellow. Near-black with dot matrix, rounded grotesk.',
    },
    palette: { bg: '#0A0A06', bgRaised: '#0F0F09', surface: '#14140C', surface2: '#1A1A11', surface3: '#222216', primary: '#EAB308', primaryDark: '#CA8A04', accent2: '#FDE047', textOnPrimary: '#141000' },
    fonts: { head: "'Rubik', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Rubik:wght@500;600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 4, radiusLg: 8, button: 'square' },
    pattern: 'dots',
    logo: { glyph: 'js', mark: 'tile' },
    android: { packageId: 'com.toolsrift.js', appName: 'ToolsRift JavaScript Tools', shortName: 'JS Tools', playCategory: 'TOOLS', shortDesc: 'JavaScript formatter, minifier, validator & obfuscator. 24 tools, offline.' },
    seo: { keywords: 'javascript formatter, js minifier, javascript beautifier, js validator, javascript obfuscator, json to js' },
  }),

  brand({
    id: 'formatters', slug: 'formatters', domain: 'formatters.toolsrift.com', live: true,
    siteName: 'ToolsRift Formatters', wordmark: ['ToolsRift', 'Formatters'],
    tagline: 'Clean code, one click.',
    concept: {
      name: 'Prettier Lines',
      headline: 'Any language. Perfectly indented.',
      sub: 'One-click beautifiers and minifiers for CSS, SQL, XML, YAML, Markdown, GraphQL and 20 more.',
      vibe: 'Teal on green-black, ruled lines like a lined notebook, condensed headlines.',
    },
    palette: { bg: '#050B0A', bgRaised: '#08100F', surface: '#0B1513', surface2: '#101B19', surface3: '#162321', primary: '#14B8A6', primaryDark: '#0D9488', accent2: '#5EEAD4', textOnPrimary: '#03130F' },
    fonts: { head: "'Chivo', system-ui, sans-serif", body: "'IBM Plex Sans', system-ui, sans-serif", google: 'Chivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600' },
    shape: { radius: 8, radiusLg: 12, button: 'soft' },
    pattern: 'ruled',
    logo: { glyph: 'formatters', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.formatters', appName: 'ToolsRift Code Formatters', shortName: 'Formatters', playCategory: 'TOOLS', shortDesc: 'Format & minify CSS, SQL, XML, YAML, Markdown and 20+ languages. Works offline.' },
    seo: { keywords: 'code formatter, sql formatter, xml formatter, yaml formatter, css beautifier, markdown formatter, code beautifier' },
  }),

  brand({
    id: 'hash', slug: 'hash', domain: 'hash.toolsrift.com', live: true,
    siteName: 'ToolsRift Hash', wordmark: ['ToolsRift', 'Hash'],
    tagline: 'Cryptographically secure.',
    concept: {
      name: 'Vault',
      headline: 'Hash it here. It never leaves.',
      sub: 'MD5, SHA-1, SHA-256, SHA-512, HMAC, bcrypt, checksums and UUIDs — computed locally with the Web Crypto API.',
      vibe: 'Security console. Violet on midnight, circuit traces, monospaced headings.',
    },
    palette: { bg: '#08060F', bgRaised: '#0C0A15', surface: '#100D1B', surface2: '#151222', surface3: '#1C182C', primary: '#7C3AED', primaryDark: '#6D28D9', accent2: '#C4B5FD', textOnPrimary: '#ffffff' },
    fonts: { head: "'JetBrains Mono', ui-monospace, monospace", body: "'Inter', system-ui, sans-serif", google: 'Inter:wght@400;500;600;700' },
    shape: { radius: 4, radiusLg: 8, button: 'square' },
    pattern: 'circuit',
    logo: { glyph: 'hash', mark: 'tile' },
    android: { packageId: 'com.toolsrift.hash', appName: 'ToolsRift Hash & Crypto', shortName: 'Hash Tools', playCategory: 'TOOLS', shortDesc: 'MD5, SHA-256, SHA-512, HMAC, bcrypt & UUID generators. 31 tools, offline.' },
    seo: { keywords: 'sha256 generator, md5 hash, sha512, hmac generator, bcrypt generator, uuid generator, checksum calculator' },
  }),

  brand({
    id: 'fancy', slug: 'fancy', domain: 'fancy.toolsrift.com', live: true,
    siteName: 'ToolsRift Fancy', wordmark: ['ToolsRift', 'Fancy'],
    tagline: 'Style your words.',
    concept: {
      name: 'Carnival',
      headline: '𝓜𝓪𝓴𝓮 𝓲𝓽 𝓯𝓪𝓷𝓬𝔂.',
      sub: 'Bold, italic, cursive, gothic, bubble and 30+ Unicode text styles for Instagram, TikTok, Twitter and Discord bios.',
      vibe: 'Playful. Fuchsia on plum-black, confetti dots, chunky display type, pill buttons.',
    },
    palette: { bg: '#0D0612', bgRaised: '#120918', surface: '#170D1E', surface2: '#1E1226', surface3: '#271830', primary: '#D946EF', primaryDark: '#C026D3', accent2: '#F5D0FE', textOnPrimary: '#ffffff' },
    fonts: { head: "'Unbounded', system-ui, sans-serif", body: "'Plus Jakarta Sans', system-ui, sans-serif", google: 'Unbounded:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700' },
    shape: { radius: 20, radiusLg: 28, button: 'pill' },
    pattern: 'confetti',
    logo: { glyph: 'fancy', mark: 'circle' },
    android: { packageId: 'com.toolsrift.fancy', appName: 'ToolsRift Fancy Text', shortName: 'Fancy Text', playCategory: 'ART_AND_DESIGN', shortDesc: 'Fancy fonts for bios & posts: bold, cursive, gothic, bubble & 30 Unicode styles.' },
    seo: { keywords: 'fancy text generator, cursive text, bold text generator, unicode fonts, instagram fonts, cool text generator' },
  }),

  brand({
    id: 'encoding', slug: 'encoding', domain: 'encoding.toolsrift.com', live: true,
    siteName: 'ToolsRift Encoding', wordmark: ['ToolsRift', 'Encoding'],
    tagline: 'Encode anything.',
    concept: {
      name: 'Morse',
      headline: '· − − ·   Say it in another code.',
      sub: 'Morse, binary, octal, NATO alphabet, Caesar, ROT13, Vigenère and more — for puzzles, classrooms and CTFs.',
      vibe: 'Telegraph. Indigo on ink, dash-dot texture, monospaced display.',
    },
    palette: { bg: '#06070F', bgRaised: '#0A0B15', surface: '#0E0F1B', surface2: '#131522', surface3: '#1A1C2C', primary: '#6366F1', primaryDark: '#4F46E5', accent2: '#A5B4FC', textOnPrimary: '#ffffff' },
    fonts: { head: "'IBM Plex Mono', ui-monospace, monospace", body: "'IBM Plex Sans', system-ui, sans-serif", mono: "'IBM Plex Mono', ui-monospace, monospace", google: 'IBM+Plex+Mono:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600' },
    shape: { radius: 4, radiusLg: 8, button: 'square' },
    pattern: 'dashes',
    logo: { glyph: 'encoding', mark: 'tile' },
    android: { packageId: 'com.toolsrift.encoding', appName: 'ToolsRift Text Encoding', shortName: 'Encoding', playCategory: 'EDUCATION', shortDesc: 'Morse code, binary, NATO alphabet, Caesar & ROT13 translators. 28 tools.' },
    seo: { keywords: 'morse code translator, binary translator, caesar cipher, rot13, nato phonetic alphabet, text to binary' },
  }),

  brand({
    id: 'everyday', slug: 'everyday', domain: 'everyday.toolsrift.com', live: true,
    siteName: 'ToolsRift Everyday', wordmark: ['ToolsRift', 'Everyday'],
    tagline: 'Daily essentials.',
    concept: {
      name: 'Toolbox',
      headline: 'The little tools you reach for every day.',
      sub: 'Age calculator, timers, stopwatch, typing test, dice, unit quickies and dozens of daily utilities — no app store required.',
      vibe: 'Friendly. Tangerine on warm brown-black, soft dots, rounded humanist type.',
    },
    palette: { bg: '#0C0906', bgRaised: '#110D09', surface: '#16110C', surface2: '#1C1611', surface3: '#241D17', primary: '#F97316', primaryDark: '#EA580C', accent2: '#FED7AA', textOnPrimary: '#180A02' },
    fonts: { head: "'Lexend', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif", google: 'Lexend:wght@500;600;700;800&family=Nunito:wght@400;500;600;700' },
    shape: { radius: 16, radiusLg: 22, button: 'pill' },
    pattern: 'dots',
    logo: { glyph: 'everyday', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.everyday', appName: 'ToolsRift Everyday Tools', shortName: 'Everyday', playCategory: 'TOOLS', shortDesc: 'Age calculator, timers, stopwatch, typing test, dice & 25+ daily tools. Offline.' },
    seo: { keywords: 'age calculator, online timer, stopwatch, typing test, dice roller, countdown timer, everyday tools' },
  }),

  brand({
    id: 'generators', slug: 'generators', domain: 'generators.toolsrift.com', live: true,
    siteName: 'ToolsRift Generators', wordmark: ['ToolsRift', 'Generators'],
    tagline: 'Secrets, generated safely.',
    concept: {
      name: 'Keymaker',
      headline: 'Strong secrets, made on your device.',
      sub: 'Passwords, passphrases, UUIDs, API keys, QR codes, barcodes and test data — generated locally with real entropy.',
      vibe: 'Lime on olive-black, hexagonal mesh, grotesk headings.',
    },
    palette: { bg: '#070A05', bgRaised: '#0B0F08', surface: '#0F140B', surface2: '#141A10', surface3: '#1B2216', primary: '#84CC16', primaryDark: '#65A30D', accent2: '#D9F99D', textOnPrimary: '#0B1202' },
    fonts: { head: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700' },
    shape: { radius: 8, radiusLg: 14, button: 'soft' },
    pattern: 'hex',
    logo: { glyph: 'generators', mark: 'hex' },
    android: { packageId: 'com.toolsrift.generators', appName: 'ToolsRift Generators', shortName: 'Generators', playCategory: 'TOOLS', shortDesc: 'Password, UUID, QR code, barcode & fake data generators. 43 tools, offline.' },
    seo: { keywords: 'password generator, uuid generator, qr code generator, barcode generator, random data generator, api key generator' },
  }),

  brand({
    id: 'gen-content', slug: 'generators2', domain: 'content.toolsrift.com', live: true,
    siteName: 'ToolsRift Content', wordmark: ['ToolsRift', 'Content'],
    tagline: 'Boilerplate, beautifully.',
    concept: {
      name: 'Press',
      headline: 'Words and assets you would rather not write from scratch.',
      sub: 'Privacy policies, terms of service, SVG patterns, ad copy, bios and outlines — generated, editable, yours.',
      vibe: 'Newsprint. Sky blue on navy-black, serif display, ruled columns.',
    },
    palette: { bg: '#04080D', bgRaised: '#070C13', surface: '#0A1119', surface2: '#0F1720', surface3: '#151F2A', primary: '#0EA5E9', primaryDark: '#0284C7', accent2: '#7DD3FC', textOnPrimary: '#03131C' },
    fonts: { head: "'Playfair Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif", google: 'Playfair+Display:wght@600;700;800&family=DM+Sans:wght@400;500;600;700' },
    shape: { radius: 10, radiusLg: 16, button: 'soft' },
    pattern: 'ruled',
    logo: { glyph: 'content', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.content', appName: 'ToolsRift Content Generators', shortName: 'Content Gen', playCategory: 'BUSINESS', shortDesc: 'Privacy policy, terms, SVG art, ad copy & bio generators. 48 content tools.' },
    seo: { keywords: 'privacy policy generator, terms of service generator, svg pattern generator, ad copy generator, bio generator' },
  }),

  brand({
    id: 'devgen', slug: 'devgen', domain: 'devgen.toolsrift.com', live: true,
    siteName: 'ToolsRift DevGen', wordmark: ['ToolsRift', 'DevGen'],
    tagline: 'Configs, on demand.',
    concept: {
      name: 'Terminal Config',
      headline: '$ generate the config, skip the docs.',
      sub: '.gitignore, Dockerfile, nginx, package.json, GitHub Actions, .env and 35 more config generators for every stack.',
      vibe: 'Terminal. Violet prompt on black, hairline grid, monospaced display.',
    },
    palette: { bg: '#07060C', bgRaised: '#0B0A12', surface: '#0F0E18', surface2: '#14131F', surface3: '#1B1A29', primary: '#8B5CF6', primaryDark: '#7C3AED', accent2: '#C4B5FD', textOnPrimary: '#ffffff' },
    fonts: { head: "'JetBrains Mono', ui-monospace, monospace", body: "'Inter', system-ui, sans-serif", google: 'Inter:wght@400;500;600;700' },
    shape: { radius: 4, radiusLg: 8, button: 'square' },
    pattern: 'grid',
    logo: { glyph: 'devgen', mark: 'tile' },
    android: { packageId: 'com.toolsrift.devgen', appName: 'ToolsRift Dev Config Gen', shortName: 'DevGen', playCategory: 'TOOLS', shortDesc: '.gitignore, Dockerfile, nginx, package.json & .env generators. 43 tools.' },
    seo: { keywords: 'gitignore generator, dockerfile generator, nginx config generator, package.json generator, env file generator' },
  }),

  brand({
    id: 'devtools', slug: 'devtools', domain: 'devtools.toolsrift.com', live: true,
    siteName: 'ToolsRift DevTools', wordmark: ['ToolsRift', 'DevTools'],
    tagline: 'Your daily dev arsenal.',
    concept: {
      name: 'Console',
      headline: '> the utilities you keep re-googling',
      sub: 'Regex tester, JSON diff, JWT debugger, cron builder, chmod calculator, CIDR, timestamps and 50 more — all offline.',
      vibe: 'CRT console. Cyan on pure black, scanlines, sharp rectangles.',
    },
    palette: { bg: '#000000', bgRaised: '#050708', surface: '#090C0E', surface2: '#0E1215', surface3: '#151A1E', primary: '#22D3EE', primaryDark: '#06B6D4', accent2: '#A5F3FC', textOnPrimary: '#03171B' },
    fonts: { head: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700' },
    shape: { radius: 4, radiusLg: 6, button: 'square' },
    pattern: 'scanlines',
    logo: { glyph: 'devtools', mark: 'tile' },
    android: { packageId: 'com.toolsrift.devtools', appName: 'ToolsRift Developer Tools', shortName: 'DevTools', playCategory: 'TOOLS', shortDesc: 'Regex tester, JSON diff, JWT debugger, cron builder & 50+ dev tools. Offline.' },
    seo: { keywords: 'regex tester, json diff, jwt debugger, cron expression generator, chmod calculator, cidr calculator, developer tools' },
  }),

  brand({
    id: 'mathcalc', slug: 'mathcalc', domain: 'math.toolsrift.com', live: true,
    siteName: 'ToolsRift Math', wordmark: ['ToolsRift', 'Math'],
    tagline: 'Solve, instantly.',
    concept: {
      name: 'Graph Paper',
      headline: 'Show your work. Or let us.',
      sub: 'Geometry, algebra, trigonometry, matrices, statistics and number theory — step-by-step solvers for students and engineers.',
      vibe: 'Graph paper. Indigo on ink, fine grid, clean geometric sans.',
    },
    palette: { bg: '#06070F', bgRaised: '#0A0B15', surface: '#0E0F1B', surface2: '#131522', surface3: '#1A1C2C', primary: '#6366F1', primaryDark: '#4F46E5', accent2: '#A5B4FC', textOnPrimary: '#ffffff' },
    fonts: { head: "'Manrope', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 8, radiusLg: 12, button: 'soft' },
    pattern: 'graph',
    logo: { glyph: 'math', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.math', appName: 'ToolsRift Math Calculators', shortName: 'Math Calc', playCategory: 'EDUCATION', shortDesc: 'Geometry, algebra, trig, matrix & statistics calculators. 56 solvers.' },
    seo: { keywords: 'math calculator, geometry calculator, algebra solver, matrix calculator, statistics calculator, trigonometry calculator' },
  }),

  brand({
    id: 'financecalc', slug: 'financecalc', domain: 'finance.toolsrift.com', live: true,
    siteName: 'ToolsRift Finance', wordmark: ['ToolsRift', 'Finance'],
    tagline: 'Numbers that matter.',
    concept: {
      name: 'Ledger',
      headline: 'Know the number before you sign.',
      sub: 'EMI, SIP, loan, tax, retirement, BMI, TDEE and calorie calculators — private and precise.',
      vibe: 'Bank ledger. Green on forest-black, ruled rows, serif numerals.',
    },
    palette: { bg: '#050A07', bgRaised: '#080E0B', surface: '#0B130E', surface2: '#101913', surface3: '#16211A', primary: '#22C55E', primaryDark: '#16A34A', accent2: '#86EFAC', textOnPrimary: '#03150A' },
    fonts: { head: "'DM Serif Display', Georgia, serif", body: "'DM Sans', system-ui, sans-serif", google: 'DM+Serif+Display&family=DM+Sans:wght@400;500;600;700' },
    shape: { radius: 10, radiusLg: 16, button: 'soft' },
    pattern: 'ruled',
    logo: { glyph: 'finance', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.finance', appName: 'ToolsRift Finance & Health', shortName: 'Finance', playCategory: 'FINANCE', shortDesc: 'EMI, SIP, loan, tax, BMI, TDEE & calorie calculators. 64 tools, offline.' },
    seo: { keywords: 'emi calculator, sip calculator, loan calculator, income tax calculator, bmi calculator, tdee calculator, calorie calculator' },
  }),

  brand({
    id: 'units', slug: 'units', domain: 'units.toolsrift.com', live: true,
    siteName: 'ToolsRift Units', wordmark: ['ToolsRift', 'Units'],
    tagline: 'Any unit, any system.',
    concept: {
      name: 'Measure',
      headline: 'Metric, imperial, and everything between.',
      sub: 'Length, weight, temperature, speed, area, volume, time, data and pressure — precise conversions with live results.',
      vibe: 'Ruler ticks. Cyan on slate-black, tick-mark texture, geometric sans.',
    },
    palette: { bg: '#05090C', bgRaised: '#080D11', surface: '#0B1116', surface2: '#10171D', surface3: '#161F26', primary: '#06B6D4', primaryDark: '#0891B2', accent2: '#A5F3FC', textOnPrimary: '#03161B' },
    fonts: { head: "'Outfit', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 8, radiusLg: 14, button: 'soft' },
    pattern: 'ticks',
    logo: { glyph: 'units', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.units', appName: 'ToolsRift Unit Converter', shortName: 'Units', playCategory: 'TOOLS', shortDesc: 'Length, weight, temperature, speed, area & volume converter. 37 tools.' },
    seo: { keywords: 'unit converter, length converter, weight converter, temperature converter, speed converter, area converter, volume converter' },
  }),

  brand({
    id: 'converters2', slug: 'converters2', domain: 'converters.toolsrift.com', live: true,
    siteName: 'ToolsRift Converters', wordmark: ['ToolsRift', 'Converters'],
    tagline: 'Niche conversions, covered.',
    concept: {
      name: 'Circuit',
      headline: 'The conversions nobody else bothered to build.',
      sub: 'Electrical units, clothing and shoe sizes, paper sizes, fuel economy, physical constants and more specialty converters.',
      vibe: 'PCB. Sky blue on navy-black, circuit traces, angular sans.',
    },
    palette: { bg: '#04080D', bgRaised: '#070C13', surface: '#0A1119', surface2: '#0F1720', surface3: '#151F2A', primary: '#0EA5E9', primaryDark: '#0284C7', accent2: '#BAE6FD', textOnPrimary: '#03131C' },
    fonts: { head: "'Archivo', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 6, radiusLg: 10, button: 'square' },
    pattern: 'circuit',
    logo: { glyph: 'converters', mark: 'tile' },
    android: { packageId: 'com.toolsrift.converters', appName: 'ToolsRift Specialty Converters', shortName: 'Converters', playCategory: 'TOOLS', shortDesc: 'Electrical, clothing size, paper size & physics converters. 31 tools.' },
    seo: { keywords: 'specialty converters, voltage converter, clothing size converter, shoe size converter, paper size converter, fuel economy converter' },
  }),

  brand({
    id: 'business', slug: 'business', domain: 'business.toolsrift.com', live: true,
    siteName: 'ToolsRift Business', wordmark: ['ToolsRift', 'Business'],
    tagline: 'Professional documents in minutes.',
    concept: {
      name: 'Boardroom',
      headline: 'Look established from day one.',
      sub: 'Invoices, quotations, receipts, resumes, cover letters, SWOT and business plans — polished templates, no subscription.',
      vibe: 'Executive. Emerald on deep green-black, no texture, generous whitespace.',
    },
    palette: { bg: '#060A08', bgRaised: '#0A0F0C', surface: '#0D1410', surface2: '#121A15', surface3: '#18221C', primary: '#059669', primaryDark: '#047857', accent2: '#6EE7B7', textOnPrimary: '#ffffff' },
    fonts: { head: "'Outfit', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif", google: 'Outfit:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700' },
    shape: { radius: 10, radiusLg: 16, button: 'soft' },
    pattern: 'none',
    logo: { glyph: 'business', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.business', appName: 'ToolsRift Business Tools', shortName: 'Business', playCategory: 'BUSINESS', shortDesc: 'Invoice, quotation, receipt, resume & cover letter generators. 41 tools.' },
    seo: { keywords: 'invoice generator, quotation generator, receipt maker, resume builder, cover letter generator, swot analysis template' },
  }),

  brand({
    id: 'random', slug: 'random', domain: 'random.toolsrift.com', live: true,
    siteName: 'ToolsRift Random', wordmark: ['ToolsRift', 'Random'],
    tagline: 'Let chance decide.',
    concept: {
      name: 'Arcade',
      headline: 'Spin. Roll. Pick. Play.',
      sub: 'Spinner wheels, dice, coin flips, name pickers, team generators, magic 8 ball and 30 more randomizers and party games.',
      vibe: 'Neon arcade. Rose on wine-black, confetti, chunky rounded display.',
    },
    palette: { bg: '#0D0508', bgRaised: '#12080C', surface: '#170C10', surface2: '#1E1116', surface3: '#27171D', primary: '#F43F5E', primaryDark: '#E11D48', accent2: '#FDA4AF', textOnPrimary: '#ffffff' },
    fonts: { head: "'Unbounded', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif", google: 'Unbounded:wght@500;600;700;800&family=Nunito:wght@400;500;600;700' },
    shape: { radius: 20, radiusLg: 28, button: 'pill' },
    pattern: 'confetti',
    logo: { glyph: 'random', mark: 'circle' },
    android: { packageId: 'com.toolsrift.random', appName: 'ToolsRift Random & Games', shortName: 'Random', playCategory: 'ENTERTAINMENT', shortDesc: 'Spinner wheel, dice, coin flip, name picker & party games. 40 randomizers.' },
    seo: { keywords: 'spinner wheel, random name picker, dice roller, coin flip, random number generator, team generator, magic 8 ball' },
  }),

  brand({
    id: 'audio', slug: 'audio', domain: 'audio.toolsrift.com', live: true,
    siteName: 'ToolsRift Audio', wordmark: ['ToolsRift', 'Audio'],
    tagline: 'Sound, shaped locally.',
    concept: {
      name: 'Waveform',
      headline: 'Trim it, convert it, hear it. Right here.',
      sub: 'Trim, convert, record, normalize and visualise audio, plus text-to-speech — powered by the Web Audio API, no uploads.',
      vibe: 'Studio. Purple on violet-black, waveform texture, rounded display.',
    },
    palette: { bg: '#09060F', bgRaised: '#0D0A15', surface: '#110D1B', surface2: '#171222', surface3: '#1E182C', primary: '#9333EA', primaryDark: '#7E22CE', accent2: '#D8B4FE', textOnPrimary: '#ffffff' },
    fonts: { head: "'Syne', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif", google: 'Syne:wght@600;700;800&family=Manrope:wght@400;500;600;700' },
    shape: { radius: 16, radiusLg: 24, button: 'pill' },
    pattern: 'waves',
    logo: { glyph: 'audio', mark: 'circle' },
    android: { packageId: 'com.toolsrift.audio', appName: 'ToolsRift Audio Tools', shortName: 'Audio', playCategory: 'MUSIC_AND_AUDIO', shortDesc: 'Trim, convert, record & normalize audio plus text-to-speech. 30 tools.' },
    seo: { keywords: 'audio trimmer, audio converter, mp3 cutter, voice recorder, text to speech, audio normalizer, wav to mp3' },
  }),

  brand({
    id: 'office', slug: 'office', domain: 'office.toolsrift.com', live: true,
    siteName: 'ToolsRift Office', wordmark: ['ToolsRift', 'Office'],
    tagline: 'Get it done, offline.',
    concept: {
      name: 'Desk',
      headline: 'A tidy desk, in a browser tab.',
      sub: 'vCards, calendar invites, QR codes, sticky notes, labels, signatures and checklists — the small office jobs, done fast.',
      vibe: 'Clean desk. Teal on slate-black, soft dot grid, rounded geometric sans.',
    },
    palette: { bg: '#05090B', bgRaised: '#080D10', surface: '#0B1215', surface2: '#10181C', surface3: '#162025', primary: '#0891B2', primaryDark: '#0E7490', accent2: '#A5F3FC', textOnPrimary: '#ffffff' },
    fonts: { head: "'Outfit', system-ui, sans-serif", body: "'DM Sans', system-ui, sans-serif", google: 'Outfit:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700' },
    shape: { radius: 10, radiusLg: 16, button: 'soft' },
    pattern: 'dots',
    logo: { glyph: 'office', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.office', appName: 'ToolsRift Office Tools', shortName: 'Office', playCategory: 'PRODUCTIVITY', shortDesc: 'vCard, calendar invite, QR, notes, labels & signature tools. 25 tools.' },
    seo: { keywords: 'vcard generator, calendar invite generator, ics file generator, email signature generator, label maker, sticky notes online' },
  }),

  brand({
    id: 'data', slug: 'data', domain: 'data.toolsrift.com', live: true,
    siteName: 'ToolsRift Data', wordmark: ['ToolsRift', 'Data'],
    tagline: 'See your numbers.',
    concept: {
      name: 'Dashboard',
      headline: 'Paste a spreadsheet. Get a chart.',
      sub: 'Bar, line, pie and scatter chart makers, CSV cleaning, pivot tables and quick statistics — your data never leaves the tab.',
      vibe: 'Analytics. Teal on charcoal, fine graph grid, clean geometric sans.',
    },
    palette: { bg: '#050A0A', bgRaised: '#080F0F', surface: '#0B1414', surface2: '#101A1A', surface3: '#162222', primary: '#2DD4BF', primaryDark: '#0D9488', accent2: '#99F6E4', textOnPrimary: '#031614' },
    fonts: { head: "'Manrope', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", google: 'Manrope:wght@600;700;800&family=Inter:wght@400;500;600;700' },
    shape: { radius: 8, radiusLg: 12, button: 'soft' },
    pattern: 'graph',
    logo: { glyph: 'data', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.data', appName: 'ToolsRift Charts & Data', shortName: 'Charts', playCategory: 'PRODUCTIVITY', shortDesc: 'Chart maker, CSV cleaner, pivot table & statistics tools. 25 tools.' },
    seo: { keywords: 'chart maker, bar chart generator, pie chart maker, csv cleaner, pivot table online, statistics calculator' },
  }),

  brand({
    id: 'study', slug: 'study', domain: 'study.toolsrift.com', live: true,
    siteName: 'ToolsRift Study', wordmark: ['ToolsRift', 'Study'],
    tagline: 'Learn faster, free.',
    concept: {
      name: 'Notebook',
      headline: 'Study smarter with tools that stay out of the way.',
      sub: 'Flashcards, quizzes, citation generators, periodic table, Pomodoro timers and revision planners — built for students.',
      vibe: 'Notebook. Indigo on ink, ruled lines, friendly rounded sans.',
    },
    palette: { bg: '#07060F', bgRaised: '#0B0A15', surface: '#0F0E1B', surface2: '#141322', surface3: '#1B1A2C', primary: '#4F46E5', primaryDark: '#4338CA', accent2: '#A5B4FC', textOnPrimary: '#ffffff' },
    fonts: { head: "'Lexend', system-ui, sans-serif", body: "'Nunito', system-ui, sans-serif", google: 'Lexend:wght@500;600;700;800&family=Nunito:wght@400;500;600;700' },
    shape: { radius: 14, radiusLg: 20, button: 'pill' },
    pattern: 'ruled',
    logo: { glyph: 'study', mark: 'squircle' },
    android: { packageId: 'com.toolsrift.study', appName: 'ToolsRift Study Tools', shortName: 'Study', playCategory: 'EDUCATION', shortDesc: 'Flashcards, quizzes, citations, periodic table & study timers. 30 tools.' },
    seo: { keywords: 'flashcard maker, quiz generator, citation generator, apa citation, periodic table, pomodoro timer, study planner' },
  }),

  brand({
    id: 'video', slug: 'video', domain: 'video.toolsrift.com', live: true,
    siteName: 'ToolsRift Video', wordmark: ['ToolsRift', 'Video'],
    tagline: 'Cut. Convert. Never upload.',
    concept: {
      name: 'Cinema',
      headline: 'Trim and convert video without the upload bar.',
      sub: 'Trim, compress, convert, make GIFs and record your screen — processed on your device, so your footage stays yours.',
      vibe: 'Film strip. Burnt orange on warm black, sprocket-hole texture, wide display type.',
    },
    palette: { bg: '#0B0604', bgRaised: '#100907', surface: '#150D0A', surface2: '#1B120E', surface3: '#241914', primary: '#C2410C', primaryDark: '#9A3412', accent2: '#FDBA74', textOnPrimary: '#ffffff' },
    fonts: { head: "'Syne', system-ui, sans-serif", body: "'Manrope', system-ui, sans-serif", google: 'Syne:wght@600;700;800&family=Manrope:wght@400;500;600;700' },
    shape: { radius: 6, radiusLg: 12, button: 'square' },
    pattern: 'film',
    logo: { glyph: 'video', mark: 'tile' },
    android: { packageId: 'com.toolsrift.video', appName: 'ToolsRift Video Tools', shortName: 'Video', playCategory: 'VIDEO_PLAYERS', shortDesc: 'Trim, compress, convert video & make GIFs on-device. 25 tools, no uploads.' },
    seo: { keywords: 'video trimmer, video compressor, video converter, video to gif, screen recorder, mp4 converter online' },
  }),
];

const BY_ID = Object.fromEntries(BRANDS.map(b => [b.id, b]));
const BY_SLUG = Object.fromEntries(BRANDS.map(b => [b.slug, b]));

/** Accepts a category id ("pdf", "gen-content") OR a registry slug ("json"). */
function findBrand(key) {
  if (!key) return null;
  const k = String(key).trim().toLowerCase();
  return BY_ID[k] || BY_SLUG[k] || null;
}

module.exports = { BRANDS, BY_ID, BY_SLUG, findBrand };
