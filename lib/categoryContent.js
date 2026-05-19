// ── ToolsRift Per-Category Content Registry ─────────────────────────────────
// Long-form copy used by PremiumCategoryLanding. Each category has:
//   hero.{eyebrow,headline,sub,cycle}   → themed hero
//   ticker[]                            → scrolling marquee labels
//   why[]                               → 4-6 cards (icon, title, desc)
//   steps[]                             → 3 themed how-it-works steps
//   popular[]                           → 6-8 popular tool IDs
//   faq[]                               → 5-8 FAQ entries (used in FAQPage JSON-LD)
//
// Tool IDs in `popular` correspond to entries in each category's TOOLS array.
// If an ID isn't found at render time the entry is silently skipped.

const CONTENT = {
  text: {
    hero: {
      eyebrow: '45 free text tools',
      cycle: ['count words', 'change case', 'analyse readability', 'remove duplicates', 'generate lorem'],
      headline: 'Type, transform, refine.',
      sub: 'Word counters, case converters, readability scorers and 40+ more — all instant, all in your browser.',
    },
    ticker: ['📝 Word Counter', '🔠 Case Converter', '📖 Readability', '✨ Lorem Ipsum', '🔁 Text Reverser', '🪞 Palindrome', '📊 Frequency', '✂️ Duplicates'],
    why: [
      { icon: '⚡', title: 'Live as you type',   desc: 'Counts update instantly while you paste, type or edit.' },
      { icon: '🔒', title: 'Nothing uploaded',   desc: 'Your text never leaves your browser. Safe for drafts and confidential copy.' },
      { icon: '🧠', title: 'Beyond counting',    desc: 'Readability, sentiment, word frequency, palindrome — analysis tools too.' },
      { icon: '🔡', title: 'All transforms',     desc: 'Case, slugs, reversal, deduplication, anagrams — every text op you need.' },
    ],
    steps: [
      { n: '01', icon: '📝', title: 'Paste your text',     desc: 'Drop in a paragraph, an essay, or an entire book.' },
      { n: '02', icon: '⚡', title: 'Pick your tool',       desc: 'Counter, case, lorem, frequency — 45 to choose from.' },
      { n: '03', icon: '📋', title: 'Copy the result',     desc: 'One click to clipboard. Or download as a .txt file.' },
    ],
    popular: ['word-counter-pro', 'character-counter', 'reading-time', 'text-reverser', 'palindrome-checker', 'word-frequency', 'unique-words', 'text-statistics'],
    faq: [
      ['Is the word counter accurate for long documents?', 'Yes — counters handle multi-megabyte text in your browser without a server round-trip.'],
      ['Do these tools work offline?',                      'After the first load, most text tools work without an internet connection.'],
      ['Can I count words in any language?',                'Yes. Counters use Unicode word segmentation and handle CJK, Arabic, Hindi and emoji correctly.'],
      ['Is my pasted text saved anywhere?',                  'No. Everything stays in your browser tab — nothing is uploaded or logged.'],
      ['What is the difference between characters and graphemes?', 'Characters count code points; graphemes count user-visible symbols (an emoji = 1 grapheme but may be 4+ code points). Our tools show both.'],
      ['Can I use these tools commercially?',               'Yes — every ToolsRift tool is free for personal and commercial use.'],
    ],
  },

  image: {
    hero: {
      eyebrow: '50 free image tools',
      cycle: ['resize images', 'compress files', 'convert formats', 'apply filters', 'crop & rotate'],
      headline: 'Pixel-perfect, instantly.',
      sub: 'Resize, compress, convert and edit images — fully in-browser. No upload, no watermark, no limits.',
    },
    ticker: ['🖼 Resize', '🗜 Compress', '✂️ Crop', '🔄 Rotate', '🎨 Filter', '🔁 Convert', '🌫 Blur', '🌗 Grayscale'],
    why: [
      { icon: '🔒', title: 'Zero uploads',       desc: 'Images never touch a server. Process private photos with confidence.' },
      { icon: '⚡', title: 'Native speed',        desc: 'Uses Canvas + WebGL on your device for fast, full-resolution edits.' },
      { icon: '🎨', title: 'Pro-grade filters',  desc: 'Brightness, blur, sharpen, sepia, vintage and 20+ other adjustments.' },
      { icon: '📦', title: 'Batch capable',      desc: 'Many tools accept multiple files at once for bulk operations.' },
    ],
    steps: [
      { n: '01', icon: '📤', title: 'Drop your image',     desc: 'Drag-and-drop or click to choose any PNG, JPG, WebP or HEIC.' },
      { n: '02', icon: '🛠', title: 'Adjust and preview',   desc: 'Live preview shows your changes the moment you tweak a slider.' },
      { n: '03', icon: '⬇️', title: 'Download the result', desc: 'One-click export in your chosen format and quality.' },
    ],
    popular: ['image-resizer', 'image-compressor', 'image-converter', 'image-cropper', 'image-rotator', 'image-grayscale', 'image-blur', 'image-flip'],
    faq: [
      ['Are my photos uploaded to a server?',            'No. All processing happens inside your browser tab — your files never leave your device.'],
      ['What formats are supported?',                    'PNG, JPG/JPEG, WebP, GIF, BMP, HEIC and more. Convert freely between them.'],
      ['Is there a file-size limit?',                    'Limited only by your device memory. Most browsers handle 50-100 MB images without issue.'],
      ['Will the tool degrade my image quality?',        'Only if you choose lossy compression. Resize/crop/rotate keep full quality.'],
      ['Can I edit multiple images at once?',            'Batch upload is supported by the compressor, converter and resizer.'],
      ['Does it work on mobile?',                        'Yes — every image tool is touch-friendly and works on iOS and Android browsers.'],
    ],
  },

  pdf: {
    hero: {
      eyebrow: '28 free PDF tools',
      cycle: ['merge PDFs', 'split files', 'compress PDFs', 'extract text', 'rotate pages'],
      headline: 'Documents, done in-browser.',
      sub: 'Merge, split, compress, sign and convert PDF files — without uploading a single byte to the cloud.',
    },
    ticker: ['📄 Merge PDF', '✂️ Split PDF', '🗜 Compress', '🔄 Rotate', '🔓 Unlock', '🔐 Protect', '📝 Edit', '📤 Extract Text'],
    why: [
      { icon: '🔒', title: 'Stay private',      desc: 'Sensitive contracts and invoices never leave your machine.' },
      { icon: '⚡', title: 'No queues',         desc: 'Process locally — no server queues, no daily upload limits.' },
      { icon: '🧰', title: '28 PDF actions',    desc: 'Merge, split, compress, rotate, encrypt, OCR, watermark and more.' },
      { icon: '🆓', title: 'Always free',       desc: 'No sign-up, no premium tier, no watermark on output.' },
    ],
    steps: [
      { n: '01', icon: '📤', title: 'Drop your PDF',         desc: 'Drag any PDF into the tool — even files locked from email.' },
      { n: '02', icon: '⚙️', title: 'Pick the operation',     desc: 'Merge, split, compress, sign, watermark, OCR…' },
      { n: '03', icon: '⬇️', title: 'Save the new PDF',      desc: 'Download instantly. No watermarks, no tracking pixels.' },
    ],
    popular: ['pdf-merge', 'pdf-split', 'pdf-compress', 'pdf-to-image', 'pdf-rotate', 'pdf-unlock', 'pdf-protect', 'pdf-watermark'],
    faq: [
      ['Are PDFs uploaded anywhere?',                       'No — every PDF tool runs inside your browser. Files stay on your device.'],
      ['How large a PDF can I merge or split?',             'Bounded by your device RAM. Hundreds of MB usually work fine on a modern laptop.'],
      ['Can I unlock password-protected PDFs?',             'Only if you know the password. We do not crack PDFs.'],
      ['Will the output PDF have a watermark?',             'Never. ToolsRift output is always clean.'],
      ['Does the OCR support handwriting?',                 'OCR works best on printed text; handwriting recognition is experimental.'],
      ['Can I merge PDFs in a specific page order?',        'Yes — drag pages to reorder before generating the final PDF.'],
    ],
  },

  code: {
    hero: {
      eyebrow: '25 free JSON tools',
      cycle: ['format JSON', 'validate JSON', 'minify JSON', 'convert JSON', 'diff JSON'],
      headline: 'Structured data, simplified.',
      sub: 'Format, validate, minify, transform and compare JSON in a single click. Built for APIs, configs and logs.',
    },
    ticker: ['{} Format', '✓ Validate', '↯ Minify', '⇄ JSON→CSV', '⇄ JSON→YAML', '◇ Diff', '🪜 Path', '🧪 Mock'],
    why: [
      { icon: '⚡', title: 'Instant parse',       desc: 'Format and validate megabytes of JSON without lag.' },
      { icon: '🔎', title: 'Clear errors',         desc: 'Pinpoint syntax errors with line numbers and helpful messages.' },
      { icon: '⇄',  title: 'Inter-format magic',   desc: 'Convert between JSON, CSV, YAML, XML and TOML.' },
      { icon: '🔒', title: 'Local-only',           desc: 'Paste sensitive API responses safely — nothing is uploaded.' },
    ],
    steps: [
      { n: '01', icon: '📋', title: 'Paste your JSON',         desc: 'From an API response, a config file, or a log line.' },
      { n: '02', icon: '✨', title: 'Format or transform',      desc: 'Pretty-print, minify, convert, diff, query with JSONPath.' },
      { n: '03', icon: '📤', title: 'Copy or download',         desc: 'Clipboard or .json file in one click.' },
    ],
    popular: ['json-formatter', 'json-validator', 'json-minifier', 'json-to-csv', 'json-to-yaml', 'json-diff', 'jsonpath-tester', 'json-to-xml'],
    faq: [
      ['Is my JSON sent to your server?',                   'No. Parsing, formatting and validation all happen in your browser.'],
      ['Why does my JSON fail validation?',                 'Common causes: trailing commas, unquoted keys, single quotes, or comments. The validator points to the exact line.'],
      ['Can I format a JSON object that is hundreds of MB?', 'Yes — though browser memory will be the limit.'],
      ['What is JSONPath?',                                 'JSONPath is a query language for JSON, similar to XPath for XML. Our tool lets you test queries against pasted data.'],
      ['Can I convert JSON to CSV?',                        'Yes. Nested objects are flattened with dot-notation column names.'],
    ],
  },

  encoders: {
    hero: {
      eyebrow: '25 encode & decode tools',
      cycle: ['Base64', 'URL encoding', 'HTML entities', 'JWT decode', 'Hex / Binary'],
      headline: 'Translate any format.',
      sub: 'Base64, URL, HTML, JWT, hex, octal, ASCII — every encoder & decoder you might ever need.',
    },
    ticker: ['🔢 Base64', '🌐 URL', '&amp; HTML', '🪪 JWT', '0x Hex', '01 Binary', '∴ ASCII', '#️⃣ Unicode'],
    why: [
      { icon: '⇄',  title: 'Bi-directional',   desc: 'Every tool encodes AND decodes — no second tab needed.' },
      { icon: '⚡', title: 'Instant',          desc: 'Real-time as you type. No "Convert" button needed.' },
      { icon: '🪪', title: 'JWT introspection', desc: 'Decode JWT headers, payloads and verify expiry locally.' },
      { icon: '🔒', title: 'Tokens stay local', desc: 'Sensitive tokens are decoded entirely in-browser.' },
    ],
    steps: [
      { n: '01', icon: '📋', title: 'Paste your input',     desc: 'A token, a URL parameter, an HTML snippet — anything.' },
      { n: '02', icon: '⇄',  title: 'Encode or decode',     desc: 'Click the direction; the result appears instantly.' },
      { n: '03', icon: '📤', title: 'Copy the output',      desc: 'One click to clipboard. Or share via deep link.' },
    ],
    popular: ['base64-encoder', 'base64-decoder', 'url-encoder', 'url-decoder', 'jwt-decoder', 'html-encoder', 'hex-encoder', 'binary-text'],
    faq: [
      ['Is my JWT or API token uploaded anywhere?',          'No — decoding happens locally. Tokens never leave your browser.'],
      ['What is the difference between encodeURI and encodeURIComponent?', 'encodeURI keeps reserved URL characters (`/`, `:`); encodeURIComponent escapes them. The tool shows both.'],
      ['Can I decode JWTs without the secret?',              'Decoding the header/payload requires no secret. Signature verification needs the secret key.'],
      ['Why does my Base64 string fail to decode?',          'Common causes: missing padding (`=`), URL-safe variants, or whitespace. The tool handles all three.'],
      ['Are these tools standards-compliant?',                'Yes — Base64 (RFC 4648), URL (RFC 3986), JWT (RFC 7519), HTML entities (HTML5).'],
    ],
  },

  colors: {
    hero: {
      eyebrow: '20 free colour tools',
      cycle: ['HEX ↔ RGB', 'HSL converter', 'palette generator', 'contrast checker', 'gradient maker'],
      headline: 'Every shade, every space.',
      sub: 'Convert between HEX, RGB, HSL, CMYK and OKLCH. Build palettes, gradients and accessible colour schemes.',
    },
    ticker: ['🎨 HEX', '◼ RGB', '◓ HSL', '◐ HSV', '◯ CMYK', '◇ OKLCH', '🌈 Gradient', '⚖ Contrast'],
    why: [
      { icon: '🎨', title: 'Every colour space',  desc: 'HEX, RGB, HSL, HSV, CMYK, LAB, OKLCH and named CSS colours.' },
      { icon: '♿', title: 'WCAG built-in',        desc: 'Contrast ratios shown live, with AA/AAA pass-fail badges.' },
      { icon: '🌈', title: 'Gradient builder',    desc: 'Multi-stop, radial, conic — copy CSS instantly.' },
      { icon: '💾', title: 'Palette presets',     desc: 'Material, Tailwind, Bootstrap, brand kits — all loadable.' },
    ],
    steps: [
      { n: '01', icon: '🎨', title: 'Pick a colour',         desc: 'Wheel, eyedropper, paste a HEX or name a colour.' },
      { n: '02', icon: '⇄',  title: 'Convert or extend',     desc: 'Every space, palette generators, gradient builders.' },
      { n: '03', icon: '📋', title: 'Copy the code',         desc: 'CSS, Tailwind, Swift or Android-ready output.' },
    ],
    popular: ['hex-to-rgb', 'rgb-to-hex', 'hex-to-hsl', 'color-picker', 'palette-generator', 'gradient-generator', 'contrast-checker', 'color-mixer'],
    faq: [
      ['Why do HEX values sometimes have 8 characters?',     '8-digit HEX includes alpha (transparency) — `#RRGGBBAA`.'],
      ['What is the difference between HSL and HSV?',         'Both rotate hue 0-360°; HSL uses Lightness, HSV uses Value. Tools let you toggle between them.'],
      ['Is OKLCH supported?',                                'Yes — OKLCH is supported, including conversions and CSS color() output.'],
      ['How is contrast ratio calculated?',                  'We use the WCAG 2.2 formula on relative luminance; AA needs ≥4.5:1 (normal) or ≥3:1 (large).'],
      ['Can I export a palette to CSS variables?',            'Yes — palette tools include "Copy as CSS vars" and Tailwind config output.'],
    ],
  },

  css: {
    hero: {
      eyebrow: '20 CSS generators',
      cycle: ['gradients', 'box shadows', 'border radius', 'flex layouts', 'animations'],
      headline: 'Style, generated.',
      sub: 'Live-preview generators for gradients, shadows, radii, animations, flexbox and grid. Copy code, ship UI.',
    },
    ticker: ['🌈 Gradient', '🌫 Box Shadow', '◯ Radius', '🪄 Animation', '⏤ Flexbox', '⊞ Grid', '✂ Clip Path', '🎯 Filter'],
    why: [
      { icon: '👁', title: 'Live preview',        desc: 'See every tweak the instant you make it.' },
      { icon: '📋', title: 'Copy-ready CSS',     desc: 'Plain CSS, Tailwind utilities, or styled-components.' },
      { icon: '🧪', title: '20 generators',       desc: 'Gradient, shadow, animation, glass, neumorphism, clip-path…' },
      { icon: '🆓', title: 'Free & open',         desc: 'No upsell, no signup, no tracking.' },
    ],
    steps: [
      { n: '01', icon: '🎨', title: 'Open a generator',      desc: 'Pick gradient, shadow, animation, grid — whatever you need.' },
      { n: '02', icon: '🎚', title: 'Tweak the controls',     desc: 'Sliders, color pickers and live preview together.' },
      { n: '03', icon: '📋', title: 'Copy the CSS',          desc: 'Paste into your stylesheet or styled-components block.' },
    ],
    popular: ['gradient-generator', 'box-shadow-generator', 'border-radius-generator', 'animation-generator', 'flexbox-generator', 'grid-generator', 'glassmorphism-generator', 'clip-path-generator'],
    faq: [
      ['Does the output include vendor prefixes?',            'You can toggle them per generator. Modern browsers usually don\'t need them.'],
      ['Is the gradient tool limited to two stops?',          'No — add as many stops as you like, with positions and angles.'],
      ['Can I export to Tailwind config?',                    'Yes — shadow, gradient and radius generators include a Tailwind output mode.'],
      ['Is animation output performant?',                     'We use transform/opacity for GPU acceleration where possible.'],
      ['Will it render the same in Safari?',                  'Modern Safari supports all output. Older versions may need the prefix toggle.'],
    ],
  },

  html: {
    hero: {
      eyebrow: '25 HTML utilities',
      cycle: ['format HTML', 'minify markup', 'generate tables', 'meta tags', 'sitemap entries'],
      headline: 'Markup, mastered.',
      sub: 'Format, minify, validate, encode and generate HTML — from `<head>` tags to full page templates.',
    },
    ticker: ['🌐 Format', '↯ Minify', '✓ Validate', '🧮 Tables', '🏷 Meta', '🗺 Sitemap', '📝 Templates', '⇄ Encode'],
    why: [
      { icon: '⚡', title: 'Fast format/minify', desc: 'Multi-thousand-line HTML processed in milliseconds.' },
      { icon: '✓', title: 'W3C-style validation', desc: 'Catches mismatched tags, missing alts and bad attributes.' },
      { icon: '🏷', title: 'SEO generators',      desc: 'Meta, Open Graph, Twitter card, sitemap, robots.txt builders.' },
      { icon: '🧰', title: '25 utilities',         desc: 'Tables, lists, forms, emails — boilerplate at your fingertips.' },
    ],
    steps: [
      { n: '01', icon: '📝', title: 'Paste or write HTML',   desc: 'Any snippet, page, template or fragment.' },
      { n: '02', icon: '✨', title: 'Format or generate',     desc: 'Beautify, minify, validate, or build meta tags.' },
      { n: '03', icon: '📤', title: 'Copy the output',        desc: 'Drop straight into your codebase or CMS.' },
    ],
    popular: ['html-formatter', 'html-minifier', 'html-encoder', 'meta-tag-generator', 'html-table-generator', 'sitemap-generator', 'og-tag-generator', 'favicon-generator'],
    faq: [
      ['Is my HTML uploaded to format or minify?',            'No — formatting, minifying and validation all run locally.'],
      ['Does the minifier remove safe whitespace only?',      'Yes — safe by default. There is a toggle for aggressive minification.'],
      ['Can I generate Open Graph + Twitter card tags?',      'Yes — paste a URL or fill the form; both sets are produced.'],
      ['Does the validator follow HTML5?',                    'Yes — HTML5 + ARIA rules are checked.'],
      ['How big a file can I format?',                        'Limited by browser memory; multi-MB HTML files work fine on most machines.'],
    ],
  },

  js: {
    hero: {
      eyebrow: '10 JS tools',
      cycle: ['format JS', 'minify JS', 'obfuscate', 'JS → JSON', 'beautify'],
      headline: 'Tame your scripts.',
      sub: 'Format, minify, validate and obfuscate JavaScript. Quick conversions between JS objects and JSON.',
    },
    ticker: ['⚙️ Format', '↯ Minify', '🌀 Obfuscate', '⇄ JS→JSON', '✓ Validate', '📦 Bundle', '🧹 Beautify', '🪞 Mirror'],
    why: [
      { icon: '⚡', title: 'Snappy format/minify', desc: 'Built on industry-standard parsers.' },
      { icon: '🌀', title: 'Obfuscation modes',   desc: 'Multiple strength levels with self-defending output.' },
      { icon: '⇄', title: 'JS ↔ JSON',            desc: 'Convert JS object literals to valid JSON in one click.' },
      { icon: '🔒', title: 'Code stays local',    desc: 'Proprietary code never leaves the browser.' },
    ],
    steps: [
      { n: '01', icon: '📋', title: 'Paste your JS',          desc: 'Module, function, or full bundle.' },
      { n: '02', icon: '✨', title: 'Choose an operation',     desc: 'Format, minify, obfuscate, validate or convert.' },
      { n: '03', icon: '📤', title: 'Copy or download',        desc: 'Drop the output into your build or repo.' },
    ],
    popular: ['js-formatter', 'js-minifier', 'js-obfuscator', 'js-to-json', 'json-to-js', 'js-validator'],
    faq: [
      ['Will the minifier rename variables aggressively?',    'Only with the "aggressive" toggle on. Default mode preserves names.'],
      ['Is the obfuscator reversible?',                       'No — it is one-way. Use it for legitimate IP protection only.'],
      ['Can I format TypeScript?',                            'Yes — TS is detected and parsed correctly.'],
      ['Does the formatter follow Prettier conventions?',     'Yes — defaults match Prettier with tab-width 2, semicolons on.'],
      ['Is ES2023 syntax supported?',                         'Yes — including top-level await, decorators, and pipeline.'],
    ],
  },

  formatters: {
    hero: {
      eyebrow: '25 code beautifiers',
      cycle: ['CSS', 'SQL', 'XML', 'YAML', 'Markdown', 'TOML'],
      headline: 'Clean code, one click.',
      sub: 'One-click formatters for CSS, SQL, XML, YAML, Markdown, TOML and 19 more languages.',
    },
    ticker: ['📐 CSS', '🗄 SQL', '📑 XML', '📜 YAML', '📝 Markdown', '🧱 TOML', '🐍 Python', '🦀 Rust'],
    why: [
      { icon: '⚡', title: 'Instant format',     desc: 'Hundreds of lines beautified in milliseconds.' },
      { icon: '🗣', title: 'Multi-language',     desc: '25+ formatters: CSS, SQL, XML, YAML, MD, TOML, Python, Go, Rust…' },
      { icon: '🎨', title: 'Tunable style',       desc: 'Indent width, semicolons, quote style — all configurable.' },
      { icon: '🔒', title: 'Local-only',         desc: 'Your code never reaches a server.' },
    ],
    steps: [
      { n: '01', icon: '🌐', title: 'Pick a language',        desc: 'CSS, SQL, XML, YAML, MD — 25 languages.' },
      { n: '02', icon: '📋', title: 'Paste your code',         desc: 'Messy, minified, or legacy — drop it in.' },
      { n: '03', icon: '✨', title: 'Copy the clean output',   desc: 'One click. Looks like a senior engineer wrote it.' },
    ],
    popular: ['css-formatter', 'sql-formatter', 'xml-formatter', 'yaml-formatter', 'markdown-formatter', 'toml-formatter', 'python-formatter', 'go-formatter'],
    faq: [
      ['Which SQL dialects are supported?',                   'PostgreSQL, MySQL, SQLite, MS SQL Server and BigQuery.'],
      ['Will Markdown formatting change my content?',         'Only whitespace and list markers — heading levels and links are preserved.'],
      ['Do formatters add semicolons or quotes?',             'Configurable per language. Defaults match each ecosystem\'s style guide.'],
      ['Can I format minified code?',                         'Yes — formatters detect minified input and beautify accordingly.'],
      ['Are formatters opinionated or configurable?',         'Reasonable defaults, with full controls revealed via the "Settings" toggle.'],
    ],
  },

  hash: {
    hero: {
      eyebrow: '25 hash & crypto tools',
      cycle: ['MD5', 'SHA-256', 'HMAC', 'bcrypt', 'UUID v4'],
      headline: 'Cryptographically secure.',
      sub: 'Hash, sign and generate IDs with industry-standard algorithms — all computed in your browser.',
    },
    ticker: ['# MD5', '# SHA-1', '# SHA-256', '# SHA-512', '🔐 HMAC', '🪪 bcrypt', '🆔 UUID', '🪙 Argon2'],
    why: [
      { icon: '🔐', title: 'Standards-grade',     desc: 'MD5, SHA-1/256/512, HMAC, bcrypt, scrypt, Argon2.' },
      { icon: '⚡', title: 'In-browser crypto',   desc: 'Powered by SubtleCrypto where available — fast and secure.' },
      { icon: '🪪', title: 'IDs & secrets',       desc: 'UUID v1/v4/v5, ULID, NanoID, secure random tokens.' },
      { icon: '🔒', title: 'Inputs never leave',  desc: 'Hash sensitive strings without trusting a third-party server.' },
    ],
    steps: [
      { n: '01', icon: '📋', title: 'Paste your input',        desc: 'A password, a payload, a file — whatever needs hashing.' },
      { n: '02', icon: '🔐', title: 'Pick the algorithm',      desc: 'MD5, SHA-256, HMAC, bcrypt, Argon2 — 25 options.' },
      { n: '03', icon: '📤', title: 'Copy the digest',         desc: 'Hex, Base64 or raw bytes — your choice.' },
    ],
    popular: ['md5-hash', 'sha1-hash', 'sha256-hash', 'sha512-hash', 'hmac-generator', 'bcrypt-generator', 'uuid-generator', 'argon2-hash'],
    faq: [
      ['Is MD5 still safe to use?',                            'MD5 is fine for checksums and non-security uses. For passwords, use bcrypt or Argon2.'],
      ['Why does bcrypt produce different output each time?',  'bcrypt salts each hash. Verifying a password is what matches the original.'],
      ['Are UUIDs cryptographically random?',                  'UUID v4 uses crypto-grade randomness in modern browsers.'],
      ['Can I hash a file?',                                   'Yes — SHA-256 and MD5 file hashing tools accept any file via drag-and-drop.'],
      ['Is Argon2 supported in browsers?',                     'Yes — via WebAssembly. The first call may take a moment to load the module.'],
    ],
  },

  fancy: {
    hero: {
      eyebrow: '20 Unicode style packs',
      cycle: ['𝐛𝐨𝐥𝐝', '𝑖𝑡𝑎𝑙𝑖𝑐', '𝒸𝓊𝓇𝓈𝒾𝓋ℯ', 'ＦＵＬＬＷＩＤＴＨ', 'ʇǝxʇ uʍop ǝpᴉsdn'],
      headline: 'Style your words.',
      sub: 'Bold, italic, cursive, gothic, bubbles, full-width and 15+ more Unicode text styles for any platform.',
    },
    ticker: ['𝐁𝐨𝐥𝐝', '𝓒𝓾𝓻𝓼𝓲𝓿𝓮', '𝔊𝔬𝔱𝔥𝔦𝔠', 'Ⓑⓤⓑⓑⓛⓔⓢ', 'ＦＵＬＬ', 'ʇdᴉɹɔS', '𝕊𝕒𝕟𝕤', '𝖒𝖔𝖓𝖔'],
    why: [
      { icon: '✨', title: '20+ styles',         desc: 'Bold, italic, cursive, gothic, fullwidth, bubble, sans, mono and more.' },
      { icon: '📱', title: 'Works everywhere',   desc: 'Instagram, Twitter, Discord, TikTok — Unicode renders natively.' },
      { icon: '⚡', title: 'Live preview',       desc: 'See every style as you type — no "Generate" button.' },
      { icon: '🆓', title: 'No watermark',       desc: 'Copy the styled text and use it however you like.' },
    ],
    steps: [
      { n: '01', icon: '🪄', title: 'Type your text',          desc: 'Or paste a phrase you want to glam up.' },
      { n: '02', icon: '🎨', title: 'Browse 20+ styles',        desc: 'Live preview for each Unicode style.' },
      { n: '03', icon: '📤', title: 'Copy to clipboard',         desc: 'Paste into Instagram bio, Twitter, Discord, anywhere.' },
    ],
    popular: ['fancy-bold', 'fancy-italic', 'fancy-cursive', 'fancy-gothic', 'fancy-bubble', 'fancy-fullwidth', 'fancy-upside-down', 'fancy-sans'],
    faq: [
      ['Are fancy fonts actually fonts?',                       'No — they are Unicode characters that look like styled letters. Works without installing fonts.'],
      ['Will it work on Instagram bios?',                       'Yes — Instagram, Twitter, TikTok, Discord, Facebook, Tumblr all support Unicode.'],
      ['Why do some letters look plain?',                       'Some Unicode style ranges are incomplete (notably digits and special characters). The tool falls back gracefully.'],
      ['Is fancy text searchable on Google?',                   'Search engines may index it differently. Keep your main content in plain text.'],
      ['Can I make my Discord nickname fancy?',                 'Yes — Discord supports most Unicode styles in usernames and messages.'],
    ],
  },

  encoding: {
    hero: {
      eyebrow: '11 classic encodings',
      cycle: ['Morse', 'Binary', 'NATO', 'Caesar', 'ROT13'],
      headline: 'Encode anything.',
      sub: 'Morse, binary, NATO phonetic, Caesar cipher, ROT13 and other classic encodings — instant translation.',
    },
    ticker: ['· — Morse', '01 Binary', 'Bravo NATO', '🅒 Caesar', 'ROT13', '✋ Pig Latin', '⊕ XOR', '⨪ Atbash'],
    why: [
      { icon: '📡', title: 'Classic encodings',  desc: 'Morse, NATO phonetic, binary, octal, Pig Latin and more.' },
      { icon: '🕵️', title: 'Cipher fun',         desc: 'Caesar, ROT13, Atbash, XOR — for puzzles and learning.' },
      { icon: '⇄',  title: 'Two-way',             desc: 'Every tool encodes AND decodes — no toggling needed.' },
      { icon: '🆓', title: 'Free & instant',      desc: 'Live as you type. No signup, no limits.' },
    ],
    steps: [
      { n: '01', icon: '✏️', title: 'Type your message',       desc: 'Any text — a word, a sentence, a paragraph.' },
      { n: '02', icon: '📡', title: 'Pick an encoding',        desc: 'Morse, binary, NATO, Caesar, ROT13 — 11 options.' },
      { n: '03', icon: '📤', title: 'Share the encoded text',  desc: 'Send it as a puzzle, a learning aid or a fun message.' },
    ],
    popular: ['morse-code', 'binary-text', 'nato-phonetic', 'caesar-cipher', 'rot13', 'atbash-cipher', 'pig-latin', 'octal-text'],
    faq: [
      ['Is Morse code accurate?',                               'Yes — uses the international standard with proper letter and word gaps.'],
      ['Can the Caesar cipher use any shift value?',            'Yes — shift 1-25, plus brute-force decode that shows all 25.'],
      ['What is the difference between Caesar and ROT13?',      'ROT13 is Caesar with shift 13. ROT13 of ROT13 returns the original — it is its own inverse.'],
      ['Can I encode binary back to text?',                     'Yes — paste 8-bit grouped binary; the tool decodes it.'],
      ['Are these ciphers secure?',                             'No — they are educational only. Use real cryptography for security.'],
    ],
  },

  generators: {
    hero: {
      eyebrow: '35 security generators',
      cycle: ['passwords', 'UUIDs', 'QR codes', 'API keys', 'secure tokens'],
      headline: 'Secrets, generated safely.',
      sub: 'Strong passwords, UUIDs, API keys, QR codes, OTP secrets — all generated locally with secure randomness.',
    },
    ticker: ['🔑 Password', '🆔 UUID', '📱 QR Code', '📊 Barcode', '🔢 API Key', '🪙 OTP', '🎲 Random', '🪪 PIN'],
    why: [
      { icon: '🔐', title: 'Cryptographic RNG',  desc: 'Uses Web Crypto for unguessable secrets.' },
      { icon: '⚙️', title: 'Tunable strength',   desc: 'Length, character sets, entropy bits — all configurable.' },
      { icon: '📱', title: 'QR & barcodes',       desc: 'Real PNG/SVG output for printing or sharing.' },
      { icon: '🔒', title: 'Local only',          desc: 'Generated secrets never touch a server.' },
    ],
    steps: [
      { n: '01', icon: '🎲', title: 'Pick a generator',       desc: 'Password, UUID, API key, QR — 35 options.' },
      { n: '02', icon: '🎚', title: 'Tune the strength',       desc: 'Length, charset, entropy — all configurable.' },
      { n: '03', icon: '📋', title: 'Copy or download',        desc: 'Clipboard, PNG, SVG, .txt — whatever you need.' },
    ],
    popular: ['password-generator', 'uuid-generator', 'qr-code-generator', 'api-key-generator', 'barcode-generator', 'otp-secret', 'pin-generator', 'token-generator'],
    faq: [
      ['Are generated passwords really random?',                'Yes — we use the browser\'s crypto.getRandomValues, which is suitable for security use.'],
      ['Is the output ever logged?',                            'No. Nothing is logged, stored, or sent anywhere.'],
      ['How strong should a password be?',                      '16+ characters mixed with symbols gives ~100 bits of entropy — strong enough for most uses.'],
      ['Can QR codes hold images?',                             'They can hold up to ~4 KB of text. For images, encode a URL pointing to the image instead.'],
      ['Why does my UUID look different from others?',          'We support v1 (time-based), v4 (random) and v5 (namespaced). Default is v4.'],
    ],
  },

  'gen-content': {
    hero: {
      eyebrow: '35 content generators',
      cycle: ['privacy policies', 'terms of service', 'cookie banners', 'SVG patterns', 'ad copy'],
      headline: 'Boilerplate, beautifully.',
      sub: 'Generate privacy policies, terms, refund pages, ad copy and SVG art — saving hours of boilerplate work.',
    },
    ticker: ['📜 Privacy Policy', '⚖ Terms', '🍪 Cookies', '🎨 SVG Art', '📰 Ad Copy', '✉️ Emails', '📦 Mock Data', '🏷 Slogans'],
    why: [
      { icon: '⚖', title: 'Legal templates',    desc: 'Privacy, terms, refunds, cookies — fillable & ready.' },
      { icon: '🎨', title: 'SVG art on tap',     desc: 'Patterns, blobs, waves, mesh — instant background SVGs.' },
      { icon: '📰', title: 'Marketing copy',     desc: 'Slogans, headlines, ad variants — kickstart your campaign.' },
      { icon: '🧪', title: 'Mock data',          desc: 'Realistic JSON, CSV and sample data for prototypes.' },
    ],
    steps: [
      { n: '01', icon: '🛠', title: 'Pick a template',         desc: 'Legal, marketing, SVG art or mock data.' },
      { n: '02', icon: '✍️', title: 'Fill the prompts',         desc: 'Brand name, jurisdiction, products — minimal fields.' },
      { n: '03', icon: '📋', title: 'Copy the output',          desc: 'Drop into your site or marketing tool.' },
    ],
    popular: ['privacy-policy-generator', 'terms-generator', 'cookie-banner', 'svg-pattern-art', 'svg-blob-generator', 'slogan-generator', 'mock-data-generator', 'ad-copy-generator'],
    faq: [
      ['Are these legal templates a substitute for a lawyer?',  'No — they are starting points. Always have a lawyer review for production use.'],
      ['Are policies GDPR/CCPA-aware?',                         'Yes — toggle jurisdictions to include the relevant clauses.'],
      ['Can I customise the SVG patterns?',                     'Yes — colour, density, scale and rotation are tunable.'],
      ['Is the ad copy generator AI-powered?',                  'It uses templated phrasing with smart substitution; no external AI calls.'],
      ['Can I export mock data as CSV?',                        'Yes — JSON, CSV, SQL inserts and TSV are all supported.'],
    ],
  },

  devgen: {
    hero: {
      eyebrow: '30 dev config generators',
      cycle: ['.gitignore', 'Dockerfile', 'nginx.conf', 'package.json', '.env'],
      headline: 'Configs, on demand.',
      sub: 'Generate .gitignore, Dockerfile, nginx config, package.json, .env, CI workflows and 25 more in seconds.',
    },
    ticker: ['📂 .gitignore', '🐳 Dockerfile', '🌐 nginx', '📦 package.json', '🔐 .env', '⚙️ CI/CD', '🔧 Webpack', '🦊 GitLab'],
    why: [
      { icon: '⚙️', title: '30 templates',       desc: 'Every config file the average backend repo needs.' },
      { icon: '🛠', title: 'Smart defaults',     desc: 'Best practices baked in — pinned versions, sane caching.' },
      { icon: '📋', title: 'Copy & paste',       desc: 'Drop straight into your repo. No edits required.' },
      { icon: '🔒', title: 'Offline-friendly',   desc: 'Once loaded, works in your browser without a server.' },
    ],
    steps: [
      { n: '01', icon: '🗂', title: 'Pick a config',            desc: '.gitignore, Dockerfile, nginx, CI — 30 generators.' },
      { n: '02', icon: '🎛', title: 'Customise the options',    desc: 'Language, framework, environment — flexible toggles.' },
      { n: '03', icon: '📤', title: 'Drop into your repo',       desc: 'Paste the generated config and ship.' },
    ],
    popular: ['gitignore-generator', 'dockerfile-generator', 'nginx-generator', 'package-json-generator', 'env-generator', 'github-actions-generator', 'editorconfig-generator', 'prettier-config'],
    faq: [
      ['Are these configs production-ready?',                   'Reasonable defaults; review and adjust for your environment.'],
      ['Will the .gitignore cover every language?',             'It covers 50+ languages and frameworks. You can pick multiple at once.'],
      ['Is the Dockerfile multi-stage?',                        'Yes for languages that benefit (Node, Go, Rust). Smaller stacks use a single stage.'],
      ['Does the nginx config include HTTPS?',                  'Yes — when you tick the "TLS" box, redirects and headers are added.'],
      ['Can I export CI workflows?',                            'Yes — GitHub Actions, GitLab CI, CircleCI and Bitbucket Pipelines.'],
    ],
  },

  devtools: {
    hero: {
      eyebrow: '40 daily-driver dev tools',
      cycle: ['regex tester', 'JSON diff', 'JWT debugger', 'cron builder', 'chmod calc'],
      headline: 'Your daily dev arsenal.',
      sub: 'Regex tester, JSON diff, JWT debugger, cron parser, chmod calculator, mocks and 35+ more.',
    },
    ticker: ['/ Regex /', '◇ JSON Diff', '🪪 JWT', '⏰ Cron', '🗂 Chmod', '🧪 HTTP', '🕸 IP/CIDR', '🧰 More'],
    why: [
      { icon: '🧰', title: '40 dev utilities',   desc: 'The full pocket knife for backend, frontend and devops.' },
      { icon: '⚡', title: 'Instant feedback',   desc: 'Regex matches highlight live, diffs update on every keystroke.' },
      { icon: '🪪', title: 'JWT & crypto',       desc: 'Decode tokens, verify signatures, inspect claims.' },
      { icon: '🔒', title: 'Local processing',   desc: 'Production secrets never leave your machine.' },
    ],
    steps: [
      { n: '01', icon: '🔍', title: 'Pick a utility',           desc: 'Regex, JSON, JWT, cron, chmod — 40 options.' },
      { n: '02', icon: '⚡', title: 'Try it live',                desc: 'Edit inputs and see results update instantly.' },
      { n: '03', icon: '📋', title: 'Share or copy',            desc: 'Output to clipboard or deep-link the result.' },
    ],
    popular: ['regex-tester', 'json-diff', 'jwt-debugger', 'cron-builder', 'chmod-calculator', 'http-status-codes', 'ip-info', 'unix-timestamp'],
    faq: [
      ['Does the regex tester support all flavours?',           'PCRE, JS, Python and Go syntaxes are toggleable. Flags work as in each language.'],
      ['Is the JWT debugger safe with production tokens?',      'Yes — decoding is local. Signature verification is local too if you supply the secret.'],
      ['Can I save regex patterns?',                            'Yes — patterns live in URL hash, so a saved link restores your work.'],
      ['Is the cron builder Unix or Quartz?',                    'Both. Toggle between standard 5-field Unix cron and 6/7-field Quartz syntax.'],
      ['Does the HTTP code reference include cats?',             'Yes, of course.'],
    ],
  },

  mathcalc: {
    hero: {
      eyebrow: '35 math calculators',
      cycle: ['geometry', 'algebra', 'trigonometry', 'matrices', 'statistics'],
      headline: 'Solve, instantly.',
      sub: 'Geometry, algebra, trig, matrices, calculus and stats — step-by-step solutions in your browser.',
    },
    ticker: ['📐 Geometry', '🧮 Algebra', '∠ Trig', '🧱 Matrix', '∫ Calculus', '📊 Stats', '➗ Fractions', '∑ Series'],
    why: [
      { icon: '🧮', title: 'Step-by-step',        desc: 'See every step, not just the final answer.' },
      { icon: '📐', title: 'Visual diagrams',    desc: 'Triangles, circles, graphs rendered to clarify problems.' },
      { icon: '📊', title: 'Stats & probability', desc: 'Mean, median, regression, distributions, hypothesis tests.' },
      { icon: '🧠', title: 'Learn while solving', desc: 'Brief explanations of formulas accompany every result.' },
    ],
    steps: [
      { n: '01', icon: '🧮', title: 'Pick a calculator',       desc: 'Geometry, algebra, trig, stats — 35 options.' },
      { n: '02', icon: '🔢', title: 'Enter your values',        desc: 'Type or paste numbers, formulas, matrices.' },
      { n: '03', icon: '🎯', title: 'See the solution',         desc: 'Result + step-by-step explanation.' },
    ],
    popular: ['quadratic-solver', 'triangle-calculator', 'matrix-calculator', 'percentage-calculator', 'standard-deviation', 'linear-equation-solver', 'circle-calculator', 'right-triangle'],
    faq: [
      ['Are these calculators accurate for homework?',          'Yes — they show steps so you can learn the method, not just copy answers.'],
      ['Does the matrix tool handle complex numbers?',          'Yes — entries can be complex, and operations preserve the form.'],
      ['What size matrices are supported?',                      'Up to 10×10 for most operations; some (determinants) go higher.'],
      ['Can I solve simultaneous equations?',                    'Yes — up to 10 variables, with step-by-step elimination.'],
      ['Is symbolic math supported?',                            'Some tools (derivative, simplify) handle symbolic input via a parser.'],
    ],
  },

  financecalc: {
    hero: {
      eyebrow: '35 finance & health',
      cycle: ['EMI', 'TDEE', 'tax estimator', 'SIP returns', 'BMI'],
      headline: 'Numbers that matter.',
      sub: 'EMI, SIP, tax, BMI, TDEE, calorie and 30 more calculators for the numbers that shape your day.',
    },
    ticker: ['🏠 EMI', '💰 SIP', '📈 Returns', '🧾 Tax', '⚖ BMI', '🔥 TDEE', '🍎 Calories', '📅 Retirement'],
    why: [
      { icon: '🏠', title: 'Loans & SIPs',       desc: 'EMI, SIP, lumpsum, FD, RD, retirement corpus.' },
      { icon: '🧾', title: 'Taxes (IN + US)',    desc: 'Indian income tax (old + new), US federal/state estimators.' },
      { icon: '⚖', title: 'Health metrics',     desc: 'BMI, BMR, TDEE, body fat, ideal weight, water intake.' },
      { icon: '🔒', title: 'Local & private',    desc: 'Your salary, health and savings stay in the browser.' },
    ],
    steps: [
      { n: '01', icon: '🧮', title: 'Pick a calculator',       desc: 'Loans, tax, health, SIPs — 35 calculators.' },
      { n: '02', icon: '🔢', title: 'Enter your numbers',       desc: 'Salary, principal, weight, target — minimal fields.' },
      { n: '03', icon: '📊', title: 'See breakdown + chart',   desc: 'Detailed schedule plus a visual chart.' },
    ],
    popular: ['emi-calculator', 'sip-calculator', 'income-tax-calculator', 'bmi-calculator', 'tdee-calculator', 'compound-interest', 'lumpsum-calculator', 'retirement-calculator'],
    faq: [
      ['Are tax slabs up to date?',                              'Yes — Indian + US slabs are updated each financial year.'],
      ['Why do BMI and BMR give different numbers?',             'BMI uses weight + height; BMR estimates calories burned at rest using age + sex.'],
      ['Can I switch between old and new tax regimes?',           'Yes — a toggle compares both and shows the better choice.'],
      ['Are loans amortised correctly?',                          'Yes — full amortisation schedules with interest and principal split per month.'],
      ['Are SIP returns guaranteed?',                             'No — SIP returns depend on the underlying fund. Calculators show projections, not promises.'],
    ],
  },

  units: {
    hero: {
      eyebrow: '25 unit converters',
      cycle: ['length', 'weight', 'temperature', 'volume', 'speed'],
      headline: 'Any unit, any system.',
      sub: 'Convert length, weight, temperature, volume, area, speed, time, energy and 18 more unit types.',
    },
    ticker: ['📏 Length', '⚖ Weight', '🌡 Temp', '🥤 Volume', '📐 Area', '🏃 Speed', '⏱ Time', '⚡ Energy'],
    why: [
      { icon: '🔁', title: 'Every common unit',  desc: 'SI, imperial, US, archaic — everything you might need.' },
      { icon: '⚡', title: 'Instant conversion',  desc: 'Live as you type — no Convert button needed.' },
      { icon: '🎯', title: 'High precision',     desc: 'Floating-point precision controlled by you (2-15 dp).' },
      { icon: '🆓', title: 'Always free',        desc: 'Zero ads in the workspace, zero limits.' },
    ],
    steps: [
      { n: '01', icon: '📏', title: 'Pick a unit type',         desc: 'Length, weight, volume — 25 categories.' },
      { n: '02', icon: '🔢', title: 'Type a value',              desc: 'Live conversion to every other unit in the category.' },
      { n: '03', icon: '📋', title: 'Copy the result',           desc: 'Or share via a deep link with the value pre-filled.' },
    ],
    popular: ['length-converter', 'weight-converter', 'temperature-converter', 'volume-converter', 'area-converter', 'speed-converter', 'time-converter', 'energy-converter'],
    faq: [
      ['How many decimal places does the converter show?',       'Adjustable — 2 to 15 places. Default is 6.'],
      ['Is Kelvin supported for temperature?',                   'Yes — Celsius, Fahrenheit, Kelvin and Rankine.'],
      ['Are old/archaic units (cubits, fathoms) included?',      'Yes — historical units are toggleable.'],
      ['Can I bookmark a specific conversion?',                  'Yes — the URL hash captures the value and units.'],
      ['Are unit conversions exact?',                            'Where defined by SI they are exact; rounding is shown when applicable.'],
    ],
  },

  converters2: {
    hero: {
      eyebrow: '20 specialty converters',
      cycle: ['electrical units', 'clothing sizes', 'paper sizes', 'shoe sizes', 'physical constants'],
      headline: 'Niche conversions, covered.',
      sub: 'Electrical, clothing, paper, shoe, fuel economy and physical-constant converters in one place.',
    },
    ticker: ['⚡ Electrical', '👕 Clothing', '📄 Paper', '👟 Shoes', '⛽ Fuel', '🔬 Constants', '💎 Karat', '🍳 Cooking'],
    why: [
      { icon: '⚡', title: 'Electrical units',    desc: 'Ohms law, capacitor, resistor, dBm/Watt — engineering grade.' },
      { icon: '👕', title: 'Clothing & shoes',   desc: 'US, UK, EU, JP sizing — men, women, kids.' },
      { icon: '📄', title: 'Paper formats',       desc: 'A/B/C series, US Letter, Legal, photo prints.' },
      { icon: '🍳', title: 'Cooking & home',      desc: 'Cups, tablespoons, oven temps, density-aware conversion.' },
    ],
    steps: [
      { n: '01', icon: '⚡', title: 'Pick a converter',        desc: 'Electrical, clothing, paper, fuel — 20 options.' },
      { n: '02', icon: '🔢', title: 'Type your value',          desc: 'Live conversion to every alternative format.' },
      { n: '03', icon: '📋', title: 'Copy the answer',          desc: 'Clipboard or share link in one click.' },
    ],
    popular: ['ohms-law', 'clothing-size', 'paper-size', 'shoe-size', 'fuel-economy', 'physical-constants', 'cooking-converter', 'temperature-rate'],
    faq: [
      ['Are clothing sizes brand-specific?',                     'No — generic reference tables. Brands may vary by ±1 size.'],
      ['Is Ohms Law accurate for AC circuits?',                  'It works for resistive AC loads. Reactive components need impedance, which we have a separate tool for.'],
      ['Are physical constants up to date?',                     'Yes — CODATA 2018 values are used.'],
      ['Are paper sizes in mm or inches?',                       'Both — A/B/C in mm + inches, US in inches + mm.'],
      ['Can I convert mpg to L/100km?',                          'Yes — and km/L, mi/gallon (US/UK).'],
    ],
  },

  business: {
    hero: {
      eyebrow: '15 business tools',
      cycle: ['invoices', 'resumes', 'cover letters', 'SWOT', 'UTM links'],
      headline: 'Professional documents in minutes.',
      sub: 'Invoices, resumes, cover letters, SWOT analyses, UTM builders — generate, edit and export instantly.',
    },
    ticker: ['💼 Invoice', '📄 Resume', '✉️ Cover Letter', '🎯 SWOT', '🔗 UTM', '🧾 Receipt', '📑 Quote', '🪪 Letterhead'],
    why: [
      { icon: '🧾', title: 'Print-ready output', desc: 'Clean PDF or print preview, no clutter.' },
      { icon: '🆓', title: 'No watermarks',      desc: 'Your business identity, your output — nothing else.' },
      { icon: '📱', title: 'Mobile-friendly',    desc: 'Fill forms on the go, export from your phone.' },
      { icon: '🔒', title: 'Private',            desc: 'Customer data and salary numbers never leave your device.' },
    ],
    steps: [
      { n: '01', icon: '🧾', title: 'Pick a template',           desc: 'Invoice, resume, cover letter, SWOT, UTM.' },
      { n: '02', icon: '✍️', title: 'Fill in the form',           desc: 'Branding, contact, line items — fast input.' },
      { n: '03', icon: '📤', title: 'Export as PDF',             desc: 'Print-ready, watermark-free, branded output.' },
    ],
    popular: ['invoice-generator', 'resume-builder', 'cover-letter-generator', 'swot-analysis', 'utm-builder', 'receipt-maker', 'quote-generator', 'business-card-generator'],
    faq: [
      ['Can I save my invoice as a template?',                   'Yes — invoice templates are saved in your browser for reuse.'],
      ['Are resumes ATS-friendly?',                              'Yes — exported PDFs use selectable text and standard fonts.'],
      ['Can I add my logo to invoices?',                         'Yes — drop a PNG/SVG into the header.'],
      ['Do I need to sign up to download a PDF?',                'No — every export is free and unwatermarked.'],
      ['Can the invoice generator handle multiple currencies?',  'Yes — 50+ currencies with proper formatting and exchange notes.'],
    ],
  },

  checker: {
    hero: {
      eyebrow: '10 checkers & analysers',
      cycle: ['SEO check', 'plagiarism', 'grammar', 'broken links', 'speed test'],
      headline: 'Audit before you ship.',
      sub: 'SEO, plagiarism, grammar, link, schema and accessibility checkers — find issues before users do.',
    },
    ticker: ['🔍 SEO', '🪞 Plagiarism', '✓ Grammar', '🔗 Links', '⚡ Speed', '🏷 Schema', '♿ A11y', '🪪 SSL'],
    why: [
      { icon: '🔎', title: 'Detailed reports',   desc: 'Issues ranked by severity with one-click fixes.' },
      { icon: '⚡', title: 'Fast scans',          desc: 'Most checks finish in seconds, not minutes.' },
      { icon: '♿', title: 'A11y included',       desc: 'Contrast, ARIA, semantic checks across the whole page.' },
      { icon: '🆓', title: 'Unlimited runs',      desc: 'No "5 scans/day" limits — audit as often as you need.' },
    ],
    steps: [
      { n: '01', icon: '🌐', title: 'Paste a URL or text',      desc: 'A web page, a paragraph, a document.' },
      { n: '02', icon: '🧪', title: 'Run the audit',             desc: 'SEO, grammar, plagiarism, links, schema, a11y.' },
      { n: '03', icon: '📊', title: 'See ranked issues',         desc: 'High/medium/low priority with one-click fixes.' },
    ],
    popular: ['seo-checker', 'plagiarism-checker', 'grammar-checker', 'broken-link-checker', 'schema-validator', 'accessibility-checker', 'ssl-checker', 'page-speed-checker'],
    faq: [
      ['Is the plagiarism checker exhaustive?',                  'It compares against public web pages and common databases. No system is 100% complete.'],
      ['Does the SEO check follow Google guidelines?',           'Yes — based on documented Google + Bing best practices.'],
      ['Will checkers store the pages I scan?',                  'No — page content is fetched, analysed in memory and discarded.'],
      ['Is grammar AI-powered?',                                 'It blends rule-based + statistical checks. Highly accurate for common mistakes.'],
      ['Can it audit JavaScript-heavy sites?',                   'Yes — pages are rendered headlessly before analysis.'],
    ],
  },
};

// Fallback used when a category has no explicit entry.
const FALLBACK = {
  hero: {
    eyebrow: 'Free tools',
    cycle: ['fast', 'free', 'in-browser', 'private', 'no signup'],
    headline: 'Tools that just work.',
    sub: 'Instant, free, in-browser tools — no sign-up, no upload, no limits.',
  },
  ticker: ['⚡ Free', '🔒 Private', '✨ Instant', '🛠 In-Browser', '🆓 No Signup'],
  why: [
    { icon: '⚡', title: 'Instant',         desc: 'Tools work the moment you open the page.' },
    { icon: '🔒', title: 'Private',         desc: 'Your data never leaves your browser.' },
    { icon: '🆓', title: 'Free forever',    desc: 'No paywalls, no daily limits, no signup.' },
    { icon: '📱', title: 'Mobile-friendly', desc: 'Touch-friendly on phones and tablets.' },
  ],
  steps: [
    { n: '01', icon: '🔍', title: 'Pick a tool',     desc: 'Choose from the grid below.' },
    { n: '02', icon: '⚡', title: 'Use instantly',    desc: 'No downloads, no sign-up.' },
    { n: '03', icon: '✅', title: 'Done in seconds', desc: 'Copy, download, share.' },
  ],
  popular: [],
  faq: [
    ['Are these tools really free?',          'Yes — every tool is completely free, ad-supported, with no sign-up required.'],
    ['Is my data uploaded anywhere?',          'No — every tool runs in your browser. Nothing is uploaded.'],
    ['Do I need an account?',                  'No account is required — tools are usable instantly.'],
    ['Can I use these tools commercially?',    'Yes, free for personal and commercial use.'],
  ],
};

const CATEGORY_CONTENT = CONTENT;

export function getCategoryContent(id) {
  return CATEGORY_CONTENT[id] || FALLBACK;
}

export default CATEGORY_CONTENT;
