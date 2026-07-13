// Educational content for every ToolsRift category page.
// Rendered server-side via <CategoryContent /> beneath the tool widget.
// Crawlers (AdSense, Google Search) see this as real article content,
// which is essential for AdSense approval and SEO ranking.
//
// Each entry targets 800-1200 words across intro, why-us, how-to,
// use cases, FAQs and related-tools sections.

const RELATED = {
  text:        { name: 'Text Tools',         href: '/text',         desc: 'Word counter, case converter, lorem ipsum and 40+ more text utilities.' },
  encoders:    { name: 'Encoders & Decoders',href: '/encoders',     desc: 'Base64, URL, HTML entity, JWT and hex encoders and decoders.' },
  hash:        { name: 'Hash & Crypto',      href: '/hash',         desc: 'MD5, SHA-256, HMAC, bcrypt, UUID and other cryptographic tools.' },
  json:        { name: 'JSON Tools',         href: '/json',         desc: 'Format, validate, minify, diff and convert JSON to CSV, YAML, XML.' },
  css:         { name: 'CSS Generators',     href: '/css',          desc: 'Gradients, box shadows, animations, flex and grid generators.' },
  colors:      { name: 'Color Tools',        href: '/colors',       desc: 'HEX/RGB/HSL conversion, palette generator and contrast checker.' },
  units:       { name: 'Unit Converters',    href: '/units',        desc: 'Length, weight, temperature, speed, volume and time conversions.' },
  images:      { name: 'Image Tools',        href: '/images',       desc: 'Resize, compress, crop, convert and filter images in your browser.' },
  pdf:         { name: 'PDF Tools',          href: '/pdf',          desc: 'Merge, split, compress and convert PDF files — fully browser-based.' },
  html:        { name: 'HTML Tools',         href: '/html',         desc: 'Format, minify, validate and generate HTML, meta tags and tables.' },
  js:          { name: 'JavaScript Tools',   href: '/js',           desc: 'Format, minify, validate and obfuscate JavaScript.' },
  formatters:  { name: 'Code Formatters',    href: '/formatters',   desc: 'Beautify CSS, SQL, XML, YAML, Markdown and 20+ more languages.' },
  fancy:       { name: 'Fancy Text',         href: '/fancy',        desc: 'Bold, italic, cursive, gothic and 15+ Unicode text styles.' },
  encoding:    { name: 'Text Encoding',      href: '/encoding',     desc: 'Morse, binary, Caesar cipher, ROT13 and NATO alphabet converters.' },
  everyday:    { name: 'Everyday Tools',     href: '/everyday',     desc: 'Age calculator, timers, stopwatch, typing test and daily utilities.' },
  generators:  { name: 'Security Generators',href: '/generators',   desc: 'Password, UUID, QR code, barcode and fake-data generators.' },
  generators2: { name: 'Content Generators', href: '/generators2',  desc: 'Privacy policy, terms, SVG art and marketing copy generators.' },
  devgen:      { name: 'Dev Config',         href: '/devgen',       desc: '.gitignore, Dockerfile, nginx, package.json and .env templates.' },
  mathcalc:    { name: 'Math Calculators',   href: '/mathcalc',     desc: 'Geometry, algebra, trigonometry, matrix and statistics.' },
  financecalc: { name: 'Finance & Health',   href: '/financecalc',  desc: 'EMI, tax, TDEE, calorie and investment-return calculators.' },
  converters2: { name: 'Special Converters', href: '/converters2',  desc: 'Electrical, clothing size, paper size and physics conversions.' },
  devtools:    { name: 'Developer Tools',    href: '/devtools',     desc: 'Regex tester, JSON diff, JWT debugger, cron and chmod calculator.' },
  business:    { name: 'Business Tools',     href: '/business',     desc: 'Invoice, receipt, resume, cover letter and SWOT generators.' },
}

const pick = (...keys) => keys.map(k => RELATED[k]).filter(Boolean)

const CONTENT = {

  /* ──────────────── TEXT ──────────────── */
  text: {
    categoryName: 'Text Tools',
    categorySlug: 'text',
    heroTagline: 'Free online text utilities for writers, students and professionals',
    intro: [
      "Text tools are the everyday utilities that make working with words faster and more accurate. Whether you are counting words for an essay, converting case for a code variable, generating lorem ipsum for a design mockup, or cleaning up messy copy pasted from a PDF, the right text tool can save minutes of manual work on every task. ToolsRift offers more than 45 free text utilities — each one designed to do exactly one job, and do it instantly in your browser with no sign-up required.",
      "Our text tools are used every day by writers checking readability scores before publishing, students hitting word-count targets on assignments, marketers preparing meta descriptions, developers normalizing strings before storing them in a database, and translators reformatting text between systems. Because everything runs locally in your browser, you can paste in sensitive client emails, confidential drafts or unpublished work without any data ever touching our servers.",
      "Unlike heavyweight word-processors, these tools open in under a second, work offline once loaded, and require zero configuration. Pick a tool, paste your text, and copy the result — that is the entire workflow."
    ],
    whyToolsRift: [
      "Most online text-tool sites bury simple utilities under sign-up walls, ads that auto-play video, or paid feature tiers. ToolsRift takes the opposite approach: every text tool is completely free, every result appears instantly as you type (no clunky submit buttons for simple operations), and every output supports one-click copy. We do not ask for your name, email, or any account information — ever.",
      "All processing happens in your browser using vanilla JavaScript. That means your text never leaves your device, the tools work even on a flaky connection once loaded, and there is no per-request limit to worry about. Whether you process one paragraph or a hundred thousand-word document, the tools behave identically."
    ],
    howToUse: [
      { title: 'Pick the tool you need', body: 'Open the text tools dashboard and select one of the 45+ utilities — word counter, case converter, lorem ipsum, readability score, remove line breaks, find and replace, and many more.' },
      { title: 'Paste or type your text', body: 'Drop your text into the input area. Most tools update results live as you type, so you can see the output change in real time.' },
      { title: 'Adjust options if needed', body: 'Some tools have toggles — case converter offers UPPER, lower, Title Case, Sentence case and camelCase; lorem ipsum lets you pick paragraph or word count. Defaults are sensible so you usually do not need to touch them.' },
      { title: 'Copy or download the result', body: 'Click the copy button to send results to your clipboard, or download longer outputs as a .txt file. The original input stays on the page so you can compare before and after.' }
    ],
    useCases: [
      'Writers checking word and character counts against publishing limits',
      'Students hitting essay or thesis length requirements without manual counting',
      'Developers converting variable names between camelCase, snake_case and kebab-case',
      'Designers generating lorem ipsum placeholder text for mockups and prototypes',
      'Marketers crafting meta titles and descriptions inside Google\'s 60 / 160 character limits',
      'Editors using readability checkers to keep copy at a target grade level',
      'Translators stripping line breaks and reformatting text between systems'
    ],
    faqs: [
      ['Are these text tools really free?', 'Yes. Every text tool on ToolsRift is 100% free with no daily limit, no sign-up, no paywall and no premium tier. The platform is supported by non-intrusive ads, which is what keeps the tools free for everyone.'],
      ['Is my text uploaded anywhere?', 'No. All text tools run entirely in your browser using JavaScript. Nothing you type or paste is ever sent to our servers, stored anywhere, or visible to us. You can verify this in your browser\'s network tab — there are no upload requests.'],
      ['Is there a maximum text length?', 'Practically no. The tools are limited only by your browser\'s memory. Documents of 100,000+ words work fine on a modern laptop. For very large inputs (millions of characters), some tools may take a moment, but nothing will be truncated.'],
      ['Do the tools work offline?', 'Once the page has loaded, most text tools will keep working even if you lose your connection. You can also save the page (Ctrl+S) for fully offline use, since all logic runs client-side.'],
      ['Can I use ToolsRift text tools for commercial work?', 'Yes. There is no usage license attached to the tools or to the text you process. Outputs you generate — lorem ipsum, converted case, cleaned text — are yours to use however you like, including in client work, books, websites and commercial products.']
    ],
    related: pick('formatters', 'encoders', 'fancy', 'encoding', 'html'),
  },

  /* ──────────────── ENCODERS ──────────────── */
  encoders: {
    categoryName: 'Encoders & Decoders',
    categorySlug: 'encoders',
    heroTagline: 'Base64, URL, HTML, JWT and hex encoding — all in one place',
    intro: [
      "Encoding and decoding are everyday tasks in web development, security work and data engineering. Whether you are embedding an image as a Base64 string inside a CSS file, decoding a URL parameter from a server log, inspecting the payload of a JWT to debug an auth flow, or converting a hex dump back into readable text, the right encoder makes a job that would otherwise take minutes a one-second copy and paste.",
      "ToolsRift hosts 25+ encoder and decoder tools covering the formats engineers and security analysts actually use every day: Base64 (string and file), URL-encoding (both percent-encoding and form-encoding flavors), HTML entity encoding, JWT decoding with header and payload inspection, hexadecimal, binary, octal, ASCII, Unicode escape sequences, and more.",
      "Every tool round-trips perfectly — you can encode, copy the output, paste it back into the decoder, and get the exact original input. There is no lossy compression, no normalization, no silent character substitution."
    ],
    whyToolsRift: [
      "Many online encoders are wrappers around server-side scripts, which means your data — sometimes sensitive auth tokens, internal URLs, or PII — is uploaded to a third party every time you click encode. ToolsRift runs everything in your browser. Paste a JWT containing a session token; the decoded payload appears in your browser only and is never logged.",
      "Each tool also explains the format briefly so you know what you are looking at: the JWT decoder labels the header, payload and signature; the Base64 tool clearly shows when padding is added; the URL encoder distinguishes between encodeURI and encodeURIComponent behavior. That extra context saves repeated trips to the docs."
    ],
    howToUse: [
      { title: 'Choose encode or decode', body: 'Most tools have a single toggle or two side-by-side panes. Pick the direction — encode (plaintext → encoded) or decode (encoded → plaintext).' },
      { title: 'Paste your input', body: 'Drop a string, file or token into the input panel. For file-based Base64, drag a file directly onto the dropzone. For JWT decoding, paste the full three-part token (header.payload.signature).' },
      { title: 'See the result instantly', body: 'Output appears live as you type or paste. For JWT, the header and payload are pretty-printed JSON; for hex, output is grouped for readability.' },
      { title: 'Copy or download', body: 'One-click copy to clipboard for short outputs, or download longer results as a file. The encoded and decoded versions are both visible so you can compare them side by side.' }
    ],
    useCases: [
      'Developers debugging URL parameters and percent-encoded form data',
      'Security analysts inspecting JWT payloads during pen-tests and auth audits',
      'Designers embedding small images as Base64 data URIs in CSS or HTML',
      'Engineers decoding application logs that contain escaped or encoded strings',
      'API consumers preparing query parameters that contain reserved characters',
      'Students learning how character encoding, escaping and Unicode work',
      'QA testers crafting edge-case inputs to test how applications handle special characters'
    ],
    faqs: [
      ['Is it safe to paste a real JWT into this tool?', 'JWT decoding happens 100% in your browser using JavaScript. The token is never uploaded or logged. That said, JWTs in production environments should still be treated as secrets — use the tool with test or expired tokens whenever possible, and clear the browser tab when finished.'],
      ['Does the Base64 tool support files?', 'Yes. You can drag and drop any file onto the Base64 encoder to get its Base64 representation — useful for embedding small images, fonts or PDFs as data URIs. The reverse decoder accepts Base64 strings and produces a downloadable file.'],
      ['What\'s the difference between URL encoding and form encoding?', 'URL encoding (percent-encoding) replaces unsafe characters with %XX sequences and is used in query strings. Form encoding additionally replaces spaces with + signs and is used in HTTP form bodies (application/x-www-form-urlencoded). ToolsRift offers both with clear labels.'],
      ['Why does my decoded JWT show "Invalid signature"?', 'The JWT decoder reads the header and payload (which are just Base64-encoded JSON) but cannot verify the signature without the secret or public key. The token might still be perfectly valid — verification requires the issuer\'s key, which we do not collect.'],
      ['Can I encode binary data, not just text?', 'Yes. Base64 and hex encoders both handle binary input via the file uploader. The output is a printable ASCII string you can safely embed in JSON, XML, HTML or source code.']
    ],
    related: pick('hash', 'json', 'devtools', 'formatters', 'encoding'),
  },

  /* ──────────────── HASH ──────────────── */
  hash: {
    categoryName: 'Hash & Crypto Tools',
    categorySlug: 'hash',
    heroTagline: 'MD5, SHA-256, HMAC, bcrypt and other cryptographic utilities',
    intro: [
      "Cryptographic hashes turn any input — a password, a file, a string — into a fixed-length fingerprint that is practically impossible to reverse. They power password storage, file-integrity checks, digital signatures, blockchains and cache busting. ToolsRift hosts 25+ hash and crypto tools so you can generate, compare and verify hashes for almost any common algorithm without leaving your browser.",
      "You can generate MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-3 family hashes, HMAC variants with custom secrets, bcrypt hashes with adjustable cost factors, and UUIDs in v1, v4 and v7 flavors. There are also helper tools — file checksum verifier, hash comparator, salt generator, secure password generator and more.",
      "Every algorithm is implemented using the browser\'s Web Crypto API where available, with audited JavaScript fallbacks for older algorithms. Outputs match exactly what you would get from openssl, sha256sum or Node\'s crypto module."
    ],
    whyToolsRift: [
      "Hashing sensitive inputs on a remote site is a bad habit. If you paste a real password into a server-side MD5 generator, that password is now in someone\'s access logs. ToolsRift runs every hash computation in your browser — even bcrypt, which we run via WASM. Your input never leaves your device, and you can confirm this by disabling network access after loading the page.",
      "Each tool also includes the relevant context: which algorithms are considered cryptographically broken (MD5, SHA-1), which are still safe for non-security uses like content addressing, what salt and cost mean for bcrypt, and when to choose HMAC over a plain hash. That makes the tools useful for learning as well as everyday work."
    ],
    howToUse: [
      { title: 'Pick the algorithm', body: 'Open the hash tools dashboard and choose the algorithm you need. If you are not sure, SHA-256 is the right default for most modern use cases.' },
      { title: 'Paste your input', body: 'Type or paste text into the input box, or drop a file onto the dropzone to hash file contents. For HMAC, enter the secret key as well.' },
      { title: 'Compare to expected value', body: 'For verification tasks, paste an expected hash into the comparator. The tool will highlight character-level differences so you can spot tampering or corruption immediately.' },
      { title: 'Copy the hex digest', body: 'Output is shown as a lowercase hex string by default. Toggle to uppercase or Base64 if needed, then copy with one click.' }
    ],
    useCases: [
      'Developers verifying downloaded file checksums against a published SHA-256',
      'Security engineers generating bcrypt hashes for password seed data',
      'Backend engineers signing payloads with HMAC for webhook authentication',
      'Database admins generating UUIDs for primary keys in distributed systems',
      'Students learning the difference between MD5, SHA-2 and SHA-3',
      'CTF players quickly hashing inputs to compare against known target hashes',
      'DevOps engineers generating salts and secrets for environment configuration'
    ],
    faqs: [
      ['Is it safe to hash passwords here?', 'Yes — all hashing runs locally in your browser, nothing is sent to a server. That said, never store user passwords as plain MD5 or SHA-256 in production. Use bcrypt, scrypt, or Argon2 with a unique per-user salt. This tool supports bcrypt with adjustable cost factors for exactly that reason.'],
      ['Are MD5 and SHA-1 still useful?', 'They are cryptographically broken for security uses like password storage or digital signatures. They are still fine for non-security uses: file content addressing, cache keys, ETag generation, or quick integrity checks where you only care about accidental corruption, not deliberate attacks.'],
      ['What does the bcrypt "cost" parameter do?', 'Cost controls how slow the hash is. Each step up doubles the time. Higher cost = harder to brute-force, but slower for legitimate logins. Cost 10-12 is typical for web apps; cost 14 is appropriate for high-value accounts. ToolsRift defaults to a sensible value.'],
      ['Can I hash a large file?', 'Yes — file hashing streams the file through the hash function in chunks, so even multi-gigabyte files work without loading everything into memory. The hash digest appears once the full file has been read.'],
      ['Why do two tools give different hashes for the same input?', 'Almost always a character-encoding or whitespace issue: a trailing newline, a Windows CRLF vs Unix LF, or a hidden BOM. Hashes are exact — even one byte of difference produces a completely different output. Strip whitespace and re-hash to check.']
    ],
    related: pick('encoders', 'generators', 'devtools', 'json', 'formatters'),
  },

  /* ──────────────── JSON ──────────────── */
  json: {
    categoryName: 'JSON Tools',
    categorySlug: 'json',
    heroTagline: 'Format, validate, compare and convert JSON without ever leaving your browser',
    intro: [
      "JSON is the language of modern APIs, configuration files and data interchange. Almost every web service you call, every config file you edit, every modern database export — they all speak JSON. And almost every developer, at some point in a day, needs to pretty-print a minified blob, validate that a payload is well-formed, diff two responses, or convert JSON to CSV for a spreadsheet.",
      "ToolsRift offers 25+ JSON tools covering every part of that daily workflow: a fast formatter and minifier, a strict validator with error line numbers, a deep diff with side-by-side comparison, JSON ↔ CSV, JSON ↔ YAML, JSON ↔ XML converters, JSONPath tester, JSON Schema validator, JSON to TypeScript types and JSON to Go struct generators, and tools to escape JSON for embedding in strings.",
      "Everything runs entirely in your browser. You can paste API responses containing customer data, internal IDs or auth tokens with full confidence that nothing leaves your machine."
    ],
    whyToolsRift: [
      "Almost every JSON formatter on the open web sends your input to a server. That is a real problem when the input is a production API response, a database export, or anything containing PII. ToolsRift parses, formats, validates and converts JSON entirely on the client side using native JavaScript and battle-tested libraries — there is no upload, no logging, and no third-party analytics that would see your data.",
      "Beyond privacy, our tools are also faster. There is no network round-trip, so a 5 MB JSON file pretty-prints in the same second you paste it. The validator points to the exact line and column of any syntax error, with a short explanation — not just a generic \"invalid JSON\"."
    ],
    howToUse: [
      { title: 'Pick the JSON tool you need', body: 'Open the JSON dashboard and pick formatter, validator, minifier, diff, converter or one of the specialized tools.' },
      { title: 'Paste your JSON', body: 'Drop your JSON into the input box. The formatter accepts both already-formatted and minified input. Validators show errors live as you type.' },
      { title: 'Adjust indentation or options', body: 'Choose 2-space, 4-space or tab indentation. Toggle sorted keys to make diffs easier. For converters, pick the output format and delimiter (CSV) or root element (XML).' },
      { title: 'Copy or download the output', body: 'One click copies to clipboard. For larger outputs, download as .json, .csv, .yaml or .xml. The input stays in place so you can iterate quickly.' }
    ],
    useCases: [
      'Backend developers pretty-printing API responses during debugging',
      'Data analysts converting JSON exports to CSV for spreadsheets',
      'DevOps engineers validating configuration files before deployment',
      'QA engineers diffing two API responses to spot regressions',
      'Frontend developers generating TypeScript types from sample API payloads',
      'Technical writers formatting JSON examples for documentation',
      'Mobile developers validating push-notification payload structure'
    ],
    faqs: [
      ['What\'s the maximum JSON size I can format?', 'Tools handle multi-megabyte JSON without issue. Browser memory is the only real limit — modern laptops can comfortably format 100+ MB. For extremely large files, the formatter automatically uses streaming mode to avoid freezing the page.'],
      ['Why does my JSON show a validation error when it looks fine?', 'JSON is stricter than JavaScript object literals. Common pitfalls: keys must be in double quotes (not single quotes), no trailing commas, and no comments. The validator points to the exact line so you can spot it quickly.'],
      ['Can I convert nested JSON to CSV?', 'Yes. The JSON to CSV converter flattens nested objects using dot notation (user.address.city) and offers options for handling arrays (join with comma, expand to multiple rows, or stringify). For deeply nested or mixed structures, it picks sensible defaults you can override.'],
      ['Is the JSON diff aware of array order?', 'Both modes are available. The default mode is order-sensitive (matches what most APIs care about). Toggle "Ignore array order" to compare sets where order does not matter — useful for tag lists, permission arrays, etc.'],
      ['Does the JSONPath tester support all operators?', 'It supports the full JSONPath spec including filter expressions ($..book[?(@.price < 10)]), wildcards, recursive descent and array slicing. Results are highlighted in the source document.']
    ],
    related: pick('formatters', 'devtools', 'encoders', 'html', 'devgen'),
  },

  /* ──────────────── CSS ──────────────── */
  css: {
    categoryName: 'CSS Generators',
    categorySlug: 'css',
    heroTagline: 'Visual CSS generators with live preview and one-click copy',
    intro: [
      "Writing CSS by hand for complex visual effects — multi-stop gradients, layered box shadows, smooth animations, responsive flex layouts — is slow and error-prone. ToolsRift hosts 20+ CSS generators that let you build effects visually and copy the production-ready CSS in one click. Every change you make to a slider or color picker updates the live preview instantly, so you can iterate faster than typing.",
      "The collection covers gradients (linear, radial, conic), box shadows (including layered and inset), border radius (with independent corner control), text shadows, CSS animations with keyframes, transforms (rotate, scale, skew, perspective), filters (blur, brightness, hue-rotate), flexbox playgrounds, CSS Grid builders, glass-morphism effects, neumorphism generators, clip-path makers, and triangle/shape generators.",
      "Output is clean, minimal CSS with no vendor prefix bloat — exactly what you would write yourself, just much faster."
    ],
    whyToolsRift: [
      "Generators on other sites often emit messy CSS — duplicated rules, unnecessary -webkit prefixes for browsers that have not needed them in years, or proprietary class names. ToolsRift outputs clean, modern CSS that works in all evergreen browsers and matches what you would copy from a senior front-end engineer\'s codebase.",
      "Every generator also has a real-world example: the gradient tool shows a card mockup, the shadow tool a card stack, the animation tool a hover button. That makes it obvious what your CSS will look like in context, not just on an isolated test square."
    ],
    howToUse: [
      { title: 'Pick the CSS effect', body: 'Open the CSS dashboard and choose gradient, shadow, animation, transform, flex, grid or one of the specialty generators.' },
      { title: 'Tweak the visual controls', body: 'Drag sliders, pick colors, set angles. The live preview updates in real time so you can see exactly what your final result will look like.' },
      { title: 'Inspect the generated CSS', body: 'CSS appears below the preview with syntax highlighting. It is minimal, clean, and ready to paste into your stylesheet.' },
      { title: 'Copy and paste', body: 'Click the copy button to grab the CSS. Some tools also offer SCSS or Tailwind-compatible output if you prefer.' }
    ],
    useCases: [
      'Front-end developers building hero gradients without trial and error',
      'Designers prototyping shadows and depth effects matching design specs',
      'Students learning CSS by manipulating visual controls and reading the output',
      'Marketers building landing-page sections in no-code tools that accept CSS',
      'WordPress and Shopify users adding custom CSS to themes',
      'Agencies producing pixel-perfect component libraries quickly',
      'Game developers crafting CSS keyframe animations for HUD elements'
    ],
    faqs: [
      ['Will the CSS work in all browsers?', 'Yes. The output uses standard, well-supported CSS that works in all evergreen browsers (Chrome, Firefox, Safari, Edge) without polyfills. Where a property has limited support — like backdrop-filter on older Safari — the tool notes it.'],
      ['Can I get Tailwind classes instead of raw CSS?', 'Several generators (gradient, shadow, animation) offer a Tailwind output mode that gives you the equivalent utility classes. For one-off effects that do not map cleanly to Tailwind, raw CSS is always available too.'],
      ['Does the gradient generator support conic gradients?', 'Yes. Linear, radial and conic gradients are all supported with multi-stop color editing, custom angles for linear, custom positions for radial, and starting angles for conic. You can also reverse the direction with one click.'],
      ['Why does my pasted CSS look different on my site?', 'Almost always a specificity issue — your existing CSS may have a more specific selector overriding what you pasted. Inspect the element in DevTools to see which rule is winning. The CSS itself is correct.'],
      ['Can I save my generated effects?', 'The tools have a "share" link that encodes all your settings into the URL — bookmark it or paste it into chat and the recipient sees the exact same configuration. We do not require accounts to save work.']
    ],
    related: pick('colors', 'html', 'fancy', 'formatters', 'js'),
  },

  /* ──────────────── COLORS ──────────────── */
  colors: {
    categoryName: 'Color Tools',
    categorySlug: 'colors',
    heroTagline: 'Color picker, converter, palette generator and accessibility checker',
    intro: [
      "Color is one of the highest-impact decisions in any design — the right palette establishes brand, sets mood, and most importantly meets accessibility standards so your interface is usable by everyone. ToolsRift offers 20+ color tools that cover every step of working with color in the browser, from picking a single hue to generating a full accessible palette to verifying that your text contrasts against its background.",
      "Tools include a precise color picker with HEX, RGB, HSL, HSV and CMYK inputs, format converters that round-trip between every common model, palette generators (complementary, analogous, triadic, tetradic, split-complementary), gradient maker with multi-stop support, WCAG AA/AAA contrast checker, color-blindness simulator, named-color reference (all 147 CSS named colors), shades and tints generators, and color-from-image picker.",
      "Every tool is built for designers who want fast iteration and for developers who want copy-paste-ready output in the exact format their code needs."
    ],
    whyToolsRift: [
      "Most color tools on the web stop at \"convert HEX to RGB\". ToolsRift goes further: every palette tells you the WCAG contrast ratio of its colors against white and black, the picker shows you accessible text colors automatically, and the gradient maker warns you when consecutive stops are too similar to be perceptible. That extra rigor saves a round of accessibility feedback from your QA team.",
      "All tools work entirely offline once loaded. The eyedropper that picks colors from images runs locally — your uploaded image is never sent anywhere. Generated palettes can be exported as JSON, CSS variables, SCSS, Tailwind config, or a printable PDF swatch sheet."
    ],
    howToUse: [
      { title: 'Pick or paste your starting color', body: 'Click any color on the picker, type a HEX/RGB/HSL value, or upload an image to extract its dominant colors. All inputs sync — change one and the others update instantly.' },
      { title: 'Generate a palette or variation', body: 'Choose a palette type (complementary, analogous, etc.) or generate tints, shades and tones automatically. Adjust the count and steps to taste.' },
      { title: 'Check accessibility', body: 'Each color shows its contrast ratio against white and black backgrounds. The dedicated contrast checker tests any two colors and reports WCAG AA and AAA pass/fail for normal and large text.' },
      { title: 'Export in your favorite format', body: 'Copy individual values as HEX, RGB or HSL. Export the full palette as CSS custom properties, SCSS variables, Tailwind config, JSON, or a printable swatch.' }
    ],
    useCases: [
      'Designers building brand palettes from a single primary color',
      'Front-end developers exporting palettes as CSS variables',
      'Accessibility specialists testing WCAG contrast for client audits',
      'Marketers matching brand colors across web, print and social',
      'Game and motion designers picking color-blind safe palettes',
      'Photographers extracting dominant colors from product images',
      'Students learning color theory through interactive examples'
    ],
    faqs: [
      ['What\'s the difference between HSL and HSV?', 'Both describe color by hue, saturation and lightness/value, but they differ in how saturation and brightness interact. HSL is more intuitive for designers because pure colors are at 50% lightness; HSV keeps pure colors at 100% value. ToolsRift converts between all models so you can pick whichever feels natural.'],
      ['What WCAG contrast ratios should I aim for?', 'For normal body text, WCAG AA requires 4.5:1 minimum, AAA requires 7:1. Large text (18pt+, or 14pt+ bold) needs 3:1 (AA) or 4.5:1 (AAA). Non-text UI like icons and form borders need 3:1. The checker reports all of these per pair.'],
      ['Can I extract colors from a photo?', 'Yes. Upload an image and the tool extracts the dominant 5-10 colors using k-means clustering, sorted by frequency. The image is processed entirely in your browser — nothing is uploaded.'],
      ['Will the palette work in dark mode?', 'The palette generator can produce light and dark variants of any palette automatically. Each color comes with a "darker" and "lighter" equivalent that maintains hue while flipping perceived brightness — ideal for theming.'],
      ['Are all 147 CSS named colors supported?', 'Yes. The named-color reference shows every CSS-spec color with its HEX value, a swatch and contrast information. Searchable by name or visual similarity.']
    ],
    related: pick('css', 'images', 'html', 'fancy', 'formatters'),
  },

  /* ──────────────── UNITS ──────────────── */
  units: {
    categoryName: 'Unit Converters',
    categorySlug: 'units',
    heroTagline: 'Convert length, weight, temperature, speed and 20+ more unit types',
    intro: [
      "Unit conversion is one of the most-searched calculations on the internet — for a reason. Whether you are reading a US recipe in metric kitchens, configuring a 3D printer with imperial measurements, calculating shipping weights between systems, or just curious how many kilometers you walked today, getting the conversion right matters. ToolsRift offers 25+ unit converters covering every common physical quantity with high-precision math and a clean, instant interface.",
      "Categories include length (from nanometers to light-years), weight and mass (from grams to tonnes), temperature (Celsius, Fahrenheit, Kelvin, Rankine), speed, volume (with both US and imperial gallons clearly separated), area, time, energy, power, pressure, frequency, data storage (binary and decimal), data transfer rate, fuel economy, angle, density, force, and torque.",
      "Each converter shows live results — change the input number or unit and every related field updates instantly. There is no \"convert\" button to click for simple conversions."
    ],
    whyToolsRift: [
      "Many unit converter sites cut corners on precision — rounding internally to two decimal places, which is fine for casual use but catastrophic for engineering or science. ToolsRift carries 12+ significant digits through every conversion using exact rational arithmetic where possible. A round-trip (cm → in → cm) returns exactly the original value, every time.",
      "We also separate units that are commonly confused: US fluid ounces vs imperial fluid ounces, US gallons vs imperial gallons, troy ounces vs avoirdupois ounces, nautical miles vs statute miles, megabytes (10^6) vs mebibytes (2^20). Each unit is clearly labeled with its formal name so you never use the wrong one."
    ],
    howToUse: [
      { title: 'Pick the unit category', body: 'Open the unit converter dashboard and choose what you are converting — length, weight, temperature, etc.' },
      { title: 'Type your value', body: 'Enter the number you want to convert. The tool accepts decimals, scientific notation (1.5e6) and negative values where physically meaningful.' },
      { title: 'Pick from and to units', body: 'Choose source and target units from the dropdown. All other units in the same category also display their equivalent value, so you see the full picture at a glance.' },
      { title: 'Copy or use the result', body: 'Click any output value to copy it to your clipboard with appropriate precision. You can also swap source and target with one click for the inverse conversion.' }
    ],
    useCases: [
      'Cooks converting between metric and US-customary recipes',
      'Travelers calculating distances in km and miles',
      'Engineers translating spec sheets between SI and imperial units',
      'Doctors and patients converting between kg and lb for medication dosing',
      '3D printer hobbyists converting STL files between mm and inches',
      'Network engineers calculating bandwidth in Mbps vs MB/s',
      'Students checking homework answers in physics and chemistry classes'
    ],
    faqs: [
      ['Why are there two different "ounces"?', 'Avoirdupois ounce (28.35 g) is the everyday ounce used for food and shipping. Troy ounce (31.10 g) is used only for precious metals — gold, silver, platinum. They are not interchangeable, which is why ToolsRift labels them clearly.'],
      ['What\'s the difference between MB and MiB?', 'MB (megabyte) is 10^6 = 1,000,000 bytes, used in marketing for drive capacity. MiB (mebibyte) is 2^20 = 1,048,576 bytes, used in operating systems. A "500 GB" drive holds about 465 GiB. The converter handles both correctly.'],
      ['How precise are the conversions?', 'Internal math uses 15+ significant digits. Display precision is configurable per tool (default 6 digits). Conversions defined by exact relations (1 inch = 25.4 mm exactly) produce exact results; conversions involving irrational constants (degrees to radians) round only at display time.'],
      ['Does it handle temperature correctly?', 'Yes — temperature is not a simple multiplication because of zero-point offsets. The converter uses the correct formulas: F = C × 9/5 + 32, K = C + 273.15, R = F + 459.67. Negative temperatures convert correctly without sign errors.'],
      ['Can I convert across categories (e.g. mass to energy)?', 'No — those require a physical context (mass-energy equivalence uses E=mc²). Within each category, all units are interconvertible. For cross-category physics conversions, see the math calculators which include E=mc² and other physics formulas.']
    ],
    related: pick('converters2', 'mathcalc', 'financecalc', 'devtools', 'text'),
  },

  /* ──────────────── IMAGES ──────────────── */
  images: {
    categoryName: 'Image Tools',
    categorySlug: 'images',
    heroTagline: 'Resize, compress, crop, convert and edit images — all in your browser',
    intro: [
      "Photos, screenshots, social-media graphics and product images all need lightweight, on-demand editing — and uploading sensitive images to random websites is a privacy nightmare. ToolsRift hosts 50+ image tools that run entirely in your browser, so your photos never leave your device. Resize a screenshot before pasting it into a doc, compress a hero image before uploading to your CMS, convert a HEIC photo to JPEG, or apply a quick filter — all in a few seconds, with no upload.",
      "The collection covers the most common operations: resize (by pixels, percentage or to fit), compress (JPEG, PNG, WebP, AVIF with quality slider), crop (free, square, 16:9, custom ratio), rotate and flip, convert between formats (JPG, PNG, WebP, AVIF, HEIC, BMP, GIF, SVG raster), filters (brightness, contrast, saturation, sepia, grayscale, blur), watermark, background remover, image-to-Base64, color extractor, EXIF viewer and stripper, and many more.",
      "Every operation uses the browser\'s native Canvas API or WebAssembly libraries — the same quality you would get from a desktop editor, with zero installation."
    ],
    whyToolsRift: [
      "Most online image tools upload your image to a server, process it there, and then let you download the result. That means your image — possibly a screenshot of confidential data, a private photo, or a client deliverable — is sitting on someone else\'s disk, often with no clear retention policy. ToolsRift never uploads your images. Drag a file onto any tool and the editing happens 100% in your browser, with the image data living only in memory.",
      "We also support modern formats that most sites still do not: HEIC from iPhones, AVIF for next-gen compression, raw WebP, and animated GIFs and APNGs. The compressor honors EXIF orientation, preserves color profiles where possible, and gives you a live before/after slider so you can dial in the exact quality you need."
    ],
    howToUse: [
      { title: 'Drop your image onto the tool', body: 'Drag a file from your desktop, paste from clipboard, or click to browse. Multiple files are supported for batch tools.' },
      { title: 'Adjust the settings', body: 'For resize, enter new dimensions or a percentage. For compress, drag the quality slider and watch the file-size estimate update live. For crop, drag the corners or pick a preset ratio.' },
      { title: 'Preview the result', body: 'A live before/after comparison shows you exactly what the output will look like. Most tools update preview in real time as you adjust.' },
      { title: 'Download the processed image', body: 'Click download to save the result. Batch tools offer a single zip download. Original filenames are preserved with a suffix (-resized, -compressed, etc.) so you do not lose track.' }
    ],
    useCases: [
      'Bloggers compressing hero images for faster page loads',
      'Social-media managers resizing images to platform-specific dimensions',
      'iPhone users converting HEIC photos to JPEG for sharing on Windows',
      'Designers extracting color palettes from reference photos',
      'Privacy-conscious users stripping EXIF location data before posting',
      'E-commerce sellers preparing product images at consistent sizes',
      'Students compressing assignment screenshots to fit upload limits'
    ],
    faqs: [
      ['Are my images really not uploaded?', 'Confirmed. All image processing happens in your browser using Canvas, WebAssembly and JavaScript. You can verify by opening DevTools → Network and watching that no requests are made when you process an image. The image data never leaves your device.'],
      ['What\'s the maximum image size I can process?', 'Limited only by your browser\'s memory. Modern laptops handle 50+ megapixel images comfortably. For extremely large images (200MP+), some tools may take a moment but will not crash. Mobile devices have lower limits — about 16-32MP for most operations.'],
      ['Can I convert HEIC photos from my iPhone?', 'Yes. The HEIC converter handles iPhone photos and produces JPEG, PNG or WebP output that works everywhere. Batch conversion is supported — drop multiple HEICs and download a zip of JPEGs.'],
      ['Does the background remover need an account?', 'No. The background remover uses an in-browser machine learning model (loaded once on first use). Subsequent removals are instant and entirely offline. There is no account, no upload, and no per-image fee.'],
      ['Will compression hurt image quality?', 'You control the tradeoff. The compress tool shows a live preview at your chosen quality so you can find the sweet spot. JPEG quality 80-85 usually halves file size with no visible quality loss; WebP and AVIF compress even better at the same visual quality.']
    ],
    related: pick('pdf', 'colors', 'css', 'formatters', 'html'),
  },

  /* ──────────────── PDF ──────────────── */
  pdf: {
    categoryName: 'PDF Tools',
    categorySlug: 'pdf',
    heroTagline: 'Merge, split, compress and convert PDFs without uploading them anywhere',
    intro: [
      "PDFs are how the world shares documents — contracts, invoices, study notes, legal filings, scanned forms. And the workflows around them are some of the most-searched online: merging multiple files into one, splitting a long PDF into chapters, compressing a scan to email, converting to or from images, extracting specific pages. ToolsRift offers 32+ PDF tools that handle every common task, completely in your browser, without ever uploading your sensitive documents to a third-party server.",
      "Tools include merge (drag-to-reorder, with thumbnails), split (by page range or every N pages), compress (with quality presets), rotate pages, delete pages, extract pages, PDF to image (per page or zip), image to PDF (with order and page-size control), PDF to text (OCR fallback for scanned PDFs), PDF metadata viewer and editor, password protect, remove password (if you know it), watermark, sign with a drawn signature, and page numbering.",
      "Every tool uses pdf.js, pdf-lib or similar mature libraries that run as WebAssembly in your browser. Output is byte-identical to what desktop PDF editors produce."
    ],
    whyToolsRift: [
      "PDFs often contain the most sensitive content people handle online — passport scans, tax returns, legal contracts, medical records. Uploading them to a free online tool to merge or compress is a serious privacy risk. ToolsRift processes PDFs entirely on your device. Drop a file onto any tool and you can watch in DevTools that zero network requests are made.",
      "We also preserve quality. The compressor uses smart per-image re-encoding (not a destructive flatten), the merger preserves bookmarks and form fields, and the splitter keeps all original metadata. Even the OCR tool runs as WebAssembly in your browser — your scanned tax return is never sent anywhere."
    ],
    howToUse: [
      { title: 'Drop your PDF(s) onto the tool', body: 'Drag from your desktop or click to browse. Merge tools accept multiple files; single-file tools accept one at a time.' },
      { title: 'Configure the operation', body: 'For merge, drag pages to reorder. For split, enter page ranges (e.g. 1-3, 5, 7-9). For compress, pick a quality preset. For watermark, enter the text and choose position and opacity.' },
      { title: 'Preview the result', body: 'Most tools show page thumbnails so you can confirm the right pages will be processed before generating the output.' },
      { title: 'Download the new PDF', body: 'Click download to save the result. Batch operations (like PDF to images) bundle output as a zip. Files are not stored anywhere after download.' }
    ],
    useCases: [
      'Students merging lecture notes into a single study PDF',
      'Lawyers splitting long case files into per-section documents',
      'Job seekers compressing portfolios to meet email attachment limits',
      'Accountants converting scanned receipts to PDF for archiving',
      'Researchers extracting figures from academic papers as images',
      'Real-estate agents adding watermarks to property brochures',
      'Anyone wanting to strip metadata from a PDF before sharing publicly'
    ],
    faqs: [
      ['Are my PDFs uploaded to a server?', 'No. Every PDF tool runs entirely in your browser using pdf.js and pdf-lib (both open-source, well-audited libraries). You can verify by opening DevTools → Network when you drop a file — there will be no upload requests. Your files never leave your device.'],
      ['What\'s the maximum PDF size?', 'Limited by your browser\'s memory. Modern laptops handle PDFs up to 500MB-1GB. For very large files, processing may take a few seconds, but nothing is truncated. Mobile browsers have lower limits, typically 50-100MB.'],
      ['Can I extract text from a scanned PDF?', 'Yes. The PDF-to-text tool first tries native text extraction (instant for digital PDFs). If the PDF is a scan (just images), it falls back to in-browser OCR using Tesseract WebAssembly — slower but still completely local.'],
      ['Does the compressor lose quality?', 'You control the tradeoff via a quality preset. The "high quality" preset typically halves file size with no visible difference. The "smallest" preset can shrink files 5-10x but you may see compression artifacts in image-heavy PDFs. A live preview shows exactly what you will get.'],
      ['Can I remove a password from a PDF?', 'Yes, but only if you already know the password. The tool will not crack or guess passwords. If you have a PDF you legitimately own but cannot remember the password for, this tool cannot help — that is a deliberate security boundary, not a limitation.']
    ],
    related: pick('images', 'business', 'formatters', 'text', 'generators2'),
  },

  /* ──────────────── HTML ──────────────── */
  html: {
    categoryName: 'HTML Tools',
    categorySlug: 'html',
    heroTagline: 'Format, validate, generate and convert HTML with browser-based tools',
    intro: [
      "HTML is the foundation of every web page — but day-to-day, working with it means dealing with messy formatting, broken nesting, copy-pasted blocks from CMS rich-text editors, and the constant need to generate meta tags, tables, lists and structured data. ToolsRift hosts 25+ HTML tools that handle every common task without leaving your browser: format and minify, validate, encode and decode entities, generate meta tags and OG tags, build tables visually, strip tags from copy, convert between HTML and Markdown, preview HTML safely in a sandbox, and more.",
      "Specific tools include HTML beautifier (with configurable indent), minifier (with safe whitespace and comment removal), validator (highlights unclosed tags and invalid nesting), entity encoder/decoder, meta tag generator (with OG and Twitter card previews), table generator (drag rows and columns), list generator, anchor link generator, HTML to text converter, Markdown to HTML and back, HTML to JSX (for React), and HTML diff.",
      "Output is clean, modern HTML5 — no deprecated tags, no inline styles unless asked, no proprietary attributes."
    ],
    whyToolsRift: [
      "Many HTML beautifiers misbehave on real-world input: they break inside <pre> tags, mangle SVG, choke on script blocks, or introduce semantically meaningful whitespace inside elements where it matters. ToolsRift\'s formatter is aware of all these edge cases. The validator does not just check syntax — it also points out accessibility issues like missing alt attributes, empty buttons, and skipped heading levels.",
      "Privacy is the other big difference. Pasting HTML from a CMS or webmail draft can include embedded API keys, tracking pixels, or private content. ToolsRift processes everything client-side; nothing you paste is sent to a server or logged. You can safely paste partial drafts, internal documents or work-in-progress code."
    ],
    howToUse: [
      { title: 'Open the HTML tool you need', body: 'Pick formatter, minifier, validator, converter or one of the generators from the dashboard.' },
      { title: 'Paste your HTML or fill in the form', body: 'For formatters and validators, paste markup into the input. For generators (meta tags, tables), fill in the visual form — no HTML knowledge required.' },
      { title: 'Adjust output options', body: 'Choose indent (2 spaces, 4 spaces, tabs), self-closing tag style, and attribute quote style. The minifier offers safe and aggressive modes.' },
      { title: 'Copy or preview', body: 'Copy the output with one click, or use the live sandbox preview to see how the HTML renders before pasting into your project.' }
    ],
    useCases: [
      'Front-end developers cleaning up CMS-generated markup',
      'SEO specialists generating meta tags and Open Graph data',
      'Email designers writing HTML emails with table-based layouts',
      'Bloggers converting Markdown drafts to HTML for their CMS',
      'WordPress users sanitizing pasted content before publishing',
      'Students learning HTML through visual generators',
      'Auditors checking accessibility of HTML snippets'
    ],
    faqs: [
      ['Will the formatter break my HTML?', 'No. The formatter preserves all semantic content — only whitespace changes. Content inside <pre>, <textarea>, <script> and <style> is left exactly as-is so your code blocks and scripts continue to work identically.'],
      ['Does the minifier handle inline JS and CSS?', 'Yes, the minifier can be configured to also minify inline <script> and <style> contents. By default it only collapses HTML whitespace, which is safer — JS minification can affect behavior if your code relies on specific formatting.'],
      ['What does the validator check?', 'The validator checks HTML5 conformance: properly nested elements, valid attribute names, required attributes (alt on img, label on form controls), and structural rules (no <div> inside <p>). It also flags common accessibility issues — missing alt, empty buttons, skipped heading levels.'],
      ['Can I generate Open Graph and Twitter card meta tags together?', 'Yes. The meta tag generator produces standard meta, OG, Twitter card and JSON-LD all from one form. A live social-share preview shows how the page will look when shared on Facebook, Twitter and LinkedIn.'],
      ['Is the HTML to JSX converter accurate?', 'It handles the common cases: class → className, for → htmlFor, self-closing tags, inline style strings to objects, and event handler renames. Edge cases (data attributes, custom elements) are preserved as-is. Always review converted JSX before using in production code.']
    ],
    related: pick('css', 'formatters', 'js', 'json', 'text'),
  },

  /* ──────────────── JS ──────────────── */
  js: {
    categoryName: 'JavaScript Tools',
    categorySlug: 'js',
    heroTagline: 'Format, minify, validate and obfuscate JavaScript in your browser',
    intro: [
      "JavaScript is everywhere — in browsers, on servers, in build pipelines, in serverless functions. And the daily work of dealing with JS code means formatting, minifying, validating, sometimes obfuscating, and frequently converting between different code shapes. ToolsRift offers 10+ JavaScript tools that handle these tasks completely in your browser, without ever uploading your code (which often contains API keys, internal logic, or proprietary algorithms) to a remote server.",
      "The tools cover the most common needs: a fast Prettier-compatible formatter with configurable options, a Terser-grade minifier with safe and aggressive modes, an ESLint-lite syntax validator with line-level error reporting, an obfuscator for shipping front-end code, JSON-to-JS-object converter, JS-to-TypeScript (basic conversion), JSON to TypeScript types, and several other utilities.",
      "All tools work on modern ES2024+ syntax including optional chaining, nullish coalescing, top-level await and static class blocks."
    ],
    whyToolsRift: [
      "Most online JS tools are thin wrappers around server-side npm packages. That is a real concern when your code contains anything sensitive: API keys, internal endpoints, proprietary algorithms, or just unreleased product features. ToolsRift runs every JS tool entirely in your browser. The formatter, minifier and obfuscator are the actual npm packages compiled to WebAssembly or bundled for browser use — same output, but your code stays on your machine.",
      "We also keep the tools current. JavaScript syntax evolves quickly; our formatter and validator are updated to support the latest TC39 stage-4 features as soon as browsers ship them. You will never see a confusing \"unexpected token\" error on perfectly valid modern code."
    ],
    howToUse: [
      { title: 'Open the JS tool', body: 'Pick formatter, minifier, validator, obfuscator or converter from the dashboard.' },
      { title: 'Paste your code', body: 'Drop JS into the input editor. Syntax highlighting works on input so you can spot obvious issues before processing.' },
      { title: 'Configure options', body: 'Formatter: indent, semicolons, single/double quotes, line width. Minifier: drop comments, mangle names, preserve license comments. Obfuscator: rename, string-encode, control-flow flatten.' },
      { title: 'Copy or download', body: 'Output appears in the right pane with syntax highlighting. Click copy or download as a .js file. Source map output is available for the minifier.' }
    ],
    useCases: [
      'Developers formatting code before committing to a shared repository',
      'Build engineers minifying JS for production deploys',
      'Front-end developers obfuscating client-side logic to deter casual reverse-engineering',
      'Code reviewers validating syntax of pasted snippets',
      'Students learning JavaScript by seeing how minifiers transform their code',
      'Library authors testing how their code holds up under minification',
      'DevTools tinkerers converting one-liners into readable, indented form'
    ],
    faqs: [
      ['Is the formatter the same as Prettier?', 'The formatter uses the actual Prettier WASM build, so output is byte-identical to what Prettier in your IDE would produce. All Prettier options are exposed: indent width, semicolons, quote style, trailing commas, and more.'],
      ['Can I really minify large bundles in the browser?', 'Yes. Terser runs as WebAssembly and can minify multi-megabyte JS bundles in seconds. For very large bundles (10MB+), processing may take 10-30 seconds. Source map output is available so debugging the minified code remains practical.'],
      ['What does the obfuscator actually do?', 'It renames identifiers to meaningless names, encodes string literals (so secrets are not visible in plain text in the bundle), and optionally flattens control flow to make decompilation harder. It is not unbreakable — a determined attacker can always reverse-engineer client-side code — but it raises the bar significantly.'],
      ['Does the validator catch runtime errors?', 'No — it is a static syntax checker, like the parser inside ESLint. It catches missing semicolons, unbalanced braces, invalid identifiers and similar parse errors. Runtime errors (undefined variables, type mismatches) require actually running the code.'],
      ['Why is my modern JS shown as an error?', 'If you are using bleeding-edge proposals (stage-1/2/3) that have not shipped in browsers yet, the parser may not recognize them. Stage-4 features are fully supported. For experimental syntax, consider using Babel first.']
    ],
    related: pick('formatters', 'json', 'html', 'devtools', 'devgen'),
  },

  /* ──────────────── FORMATTERS ──────────────── */
  formatters: {
    categoryName: 'Code Formatters',
    categorySlug: 'formatters',
    heroTagline: 'Beautify CSS, SQL, XML, YAML, Markdown and 20+ more languages',
    intro: [
      "Well-formatted code is easier to read, easier to review, and easier to debug. But every language has its own formatting rules, and switching between languages all day means juggling multiple tools. ToolsRift offers 25+ formatters covering every major language and config format you are likely to touch: CSS, SCSS, Less, SQL (multiple dialects), XML, YAML, TOML, INI, Markdown, GraphQL, GraphQL schema, Protobuf, Solidity, Java, Kotlin, Swift, Python, Ruby, PHP, Go, Rust, C/C++, Bash, PowerShell and more.",
      "Each formatter follows the standard style for its language — Prettier conventions for web languages, sqlfluff-compatible rules for SQL, gofmt rules for Go, black for Python — so output matches what your linter would expect. All formatters are also configurable: pick indent width, line length, quote style, trailing comma behavior, where applicable.",
      "Everything runs in your browser. You can paste production SQL, internal config files, or unreleased schema designs without any of it ever touching a server."
    ],
    whyToolsRift: [
      "The biggest issue with most online formatters is that they only support one or two languages, and quality varies wildly. ToolsRift unifies 25+ languages under a single interface with the same UX everywhere — paste in, configure, copy out. The underlying formatters are the same battle-tested libraries used in IDE plugins and CI pipelines, just running in your browser.",
      "Privacy is the second concern. SQL queries often contain real table names, schema names, and sometimes inline data. Config files contain hostnames, paths and sometimes secrets. Sending these to a server-side formatter is a needless leak. ToolsRift processes everything client-side, with no logging, no analytics on input content, and no third-party calls."
    ],
    howToUse: [
      { title: 'Pick the language', body: 'Open the formatters dashboard and select your language. The interface adapts to the relevant options for that language.' },
      { title: 'Paste your code', body: 'Drop the code into the input editor. Syntax highlighting reflects the language you selected.' },
      { title: 'Tune the options', body: 'Indent style, line width and language-specific preferences (e.g. SQL keyword case, YAML quote style). Defaults match the most common community style.' },
      { title: 'Copy the formatted output', body: 'One-click copy. The original input stays so you can iterate on options without re-pasting.' }
    ],
    useCases: [
      'Database developers formatting SQL queries before pushing to production',
      'DevOps engineers cleaning up YAML files for Kubernetes and CI/CD configs',
      'Front-end teams enforcing consistent CSS style without setting up Prettier locally',
      'Documentation writers formatting Markdown for consistent rendering',
      'API designers formatting GraphQL schemas and OpenAPI specs',
      'Mobile developers formatting Kotlin and Swift snippets for code reviews',
      'Anyone pasting code into Slack or email and wanting it readable first'
    ],
    faqs: [
      ['Will the formatter change the meaning of my code?', 'No. Formatters only adjust whitespace, line breaks and (where configured) quote style or trailing commas. Semantic content — variable names, logic, comments — is never altered. The output behaves identically to the input when run.'],
      ['Which SQL dialects are supported?', 'PostgreSQL, MySQL, SQLite, SQL Server (T-SQL), Oracle (PL/SQL), BigQuery, Snowflake and Redshift. The formatter recognizes dialect-specific keywords and reformats accordingly. Pick the dialect from the dropdown for the most accurate output.'],
      ['Does the YAML formatter preserve comments?', 'Yes. YAML comments are preserved exactly where they were, including inline comments. The formatter normalizes indentation, alignment and quote style but never strips comments.'],
      ['Can I format Markdown without breaking my embedded code?', 'Yes. Fenced code blocks (triple backticks) are preserved exactly as-is. The formatter normalizes the surrounding Markdown — heading levels, list indent, link reference style — without touching code contents.'],
      ['How is this different from Prettier in my editor?', 'The output is identical to Prettier for the languages Prettier supports, since we use the actual Prettier WASM build. ToolsRift adds support for languages Prettier does not cover (SQL, Java, Kotlin, Rust, C/C++) using dedicated formatters for each.']
    ],
    related: pick('js', 'css', 'html', 'json', 'devtools'),
  },

  /* ──────────────── FANCY ──────────────── */
  fancy: {
    categoryName: 'Fancy Text Generators',
    categorySlug: 'fancy',
    heroTagline: 'Bold, italic, cursive, gothic and 15+ Unicode text styles',
    intro: [
      "Want your Instagram bio to stand out, your Twitter username to look unique, or your Discord nickname to have a stylish twist? Fancy text generators turn plain text into eye-catching Unicode variants — bold, italic, cursive, gothic, double-struck, bubble, square, upside-down, strikethrough, and many more. ToolsRift offers 20+ fancy text generators that work on any platform that supports Unicode, which is essentially every modern app, website and operating system.",
      "Unlike fonts, which require installation, Unicode text variants are real characters that display the same way for everyone. Once you generate \"𝓨𝓸𝓾𝓻 𝓽𝓮𝔁𝓽\" or \"𝕐𝕠𝕦𝕣 𝕥𝕖𝕩𝕥\", anyone reading it on any device sees the same fancy result. Perfect for social-media bios, post headlines, chat messages, comment sections, and email signatures.",
      "All conversions are bidirectional — you can paste fancy text back into the tool to see the original characters."
    ],
    whyToolsRift: [
      "Most fancy text sites are slow and ad-heavy, often loading multiple ad networks before showing a result. ToolsRift\'s fancy text generators are instant — type and the styled output appears live, with no buttons to click and no waiting. All 20+ styles render in a single side-by-side comparison so you can pick the look you want at a glance.",
      "We also explicitly call out which platforms each style works on. Some Unicode blocks (like bold-italic) render correctly on Twitter, Instagram and Discord but appear as squares on older browsers. The tool labels each style with its compatibility profile, so you do not waste time pasting a style that will not render for your audience."
    ],
    howToUse: [
      { title: 'Type or paste your text', body: 'Drop your text into the input box. The fancy variants update live for every keystroke.' },
      { title: 'Browse the styles', body: 'All 20+ Unicode styles appear in a list — bold, italic, monospace, double-struck, fraktur, script, sans-serif, bubble, square, upside-down, strikethrough and more.' },
      { title: 'Copy your favorite', body: 'Each style has its own copy button. One click sends the styled text to your clipboard, ready to paste into Instagram, Twitter, Discord, TikTok or anywhere else.' },
      { title: 'Test rendering on your target platform', body: 'Paste into your destination app before publishing to make sure the style renders. Most styles work everywhere, but a few exotic ones may fall back to plain text on older platforms.' }
    ],
    useCases: [
      'Social-media users styling Instagram and Twitter bios',
      'Discord server admins creating distinctive nicknames and channel names',
      'TikTok creators making captions stand out in comments',
      'YouTubers designing video titles that catch the eye in search results',
      'Email signature designers adding subtle typographic emphasis',
      'Online gamers customizing usernames in chat-friendly ways',
      'Content creators producing visually distinct headings in newsletters'
    ],
    faqs: [
      ['Are these real fonts or just Unicode tricks?', 'They are Unicode characters from blocks like Mathematical Alphanumeric Symbols. They work on any system that supports Unicode (essentially all modern devices) without needing a font installed. They are technically not "fonts" — they are individual code points that happen to look like styled letters.'],
      ['Will the fancy text show up on Instagram?', 'Most styles work on Instagram. The most reliable are bold, italic, monospace, double-struck, and script. Some exotic styles (small-caps, upside-down) may render slightly differently on iOS vs Android. The tool indicates compatibility for each style.'],
      ['Why does some fancy text look like boxes?', 'Boxes mean your device or app does not have a font that includes those Unicode characters. This is rare on modern phones and computers but can happen on older browsers, in some terminals, or with older email clients. Stick to the labeled "universally compatible" styles for safety.'],
      ['Can I use fancy text in my Discord username?', 'Yes. Discord supports Unicode in usernames, server names and channel names. Be aware that some letters in exotic Unicode blocks may not be searchable the same way as ASCII, which can make it harder for friends to @mention you.'],
      ['Is there an SEO penalty for fancy text on my website?', 'Yes — search engines index Unicode characters literally, so "𝓗𝓮𝓵𝓵𝓸" is not the same as "Hello" for ranking purposes. Use fancy text in social bios and display contexts, but keep page titles, headings and body content as plain text for SEO.']
    ],
    related: pick('text', 'encoding', 'css', 'generators', 'html'),
  },

  /* ──────────────── ENCODING ──────────────── */
  everyday: {
    categoryName: 'Everyday Tools',
    categorySlug: 'everyday',
    heroTagline: 'Age calculator, timers, typing test and daily essentials — free in your browser',
    intro: [
      "Everyday tools solve the small, frequent problems of daily life — calculating your exact age, counting days to an event, timing a workout, testing your typing speed, or settling a decision with a coin flip. ToolsRift brings 12 of these daily essentials together in one place, each one loading instantly with no app to install and no account to create.",
      "Every tool runs entirely in your browser using JavaScript. Your dates, names and scores are processed on your own device and never uploaded anywhere. Use them on your phone during a game night, on your laptop while studying with the Pomodoro timer, or in a classroom picking random names — they work the same everywhere.",
    ],
    whyToolsRift: [
      "Most timer and calculator sites bury a tiny tool under banner ads and popups. ToolsRift gives each tool a clean, full-width layout with large readable displays — a stopwatch or scoreboard you can actually read from across the room.",
      "Date math here uses real calendar rules — leap years, varying month lengths, exact year-month-day breakdowns — the same way official documents count age, so results are dependable for forms and paperwork.",
      "Timers keep running when you switch tabs, and the remaining time is shown in the browser tab title, so you never lose track of a countdown while working in another window.",
    ],
    howToUse: [
      { title: 'Pick your tool', body: 'Choose from date calculators, timers or fun random tools using the search box or category tabs on the dashboard.' },
      { title: 'Enter your input', body: 'Type a date, set your minutes, or paste a list of names — each tool needs just one or two inputs to work.' },
      { title: 'Get instant results', body: 'Results appear immediately as you type. Timers show remaining time in the browser tab so you can safely switch away.' },
      { title: 'Retry as often as you like', body: 'Flip the coin again, roll new dice, restart the typing test — there are no limits and nothing is saved or tracked.' },
    ],
    useCases: [
      'Students counting days until an exam, then studying in focused Pomodoro blocks',
      'Teachers picking random students fairly and running timed classroom activities',
      'HR and admin staff calculating exact age or notice-period end dates for documents',
      'Coaches timing laps and intervals, and keeping match scores on a big readable board',
      'Friends settling decisions with a coin flip or picking a giveaway winner from a list',
      'Writers and professionals testing typing speed and building it up with daily practice',
    ],
    faqs: [
      ['Are these tools really free?', 'Yes — all 12 everyday tools are completely free with no signup, no installation and no usage limits. Use them as many times as you want.'],
      ['Do the timers keep running if I switch tabs?', 'Yes. The countdown, stopwatch and Pomodoro timers keep running in the background, and the remaining time appears in the browser tab title so you can always see it at a glance.'],
      ['Is my data private?', 'Completely. Dates of birth, name lists and scores are processed in your browser using JavaScript — nothing is uploaded to any server or stored anywhere.'],
      ['How accurate is the age calculator?', 'It uses real calendar math with leap years and actual month lengths, counting complete years, then months, then days — the same method used on official documents and government forms.'],
      ['Do these tools work on mobile?', 'Yes, every tool is designed mobile-first. Timers, the scoreboard and dice use large displays that stay readable even from a distance.'],
    ],
    related: pick('mathcalc', 'financecalc', 'generators', 'text', 'converters2'),
  },

  encoding: {
    categoryName: 'Text Encoding Tools',
    categorySlug: 'encoding',
    heroTagline: 'Morse code, binary, Caesar cipher, ROT13 and other classic encodings',
    intro: [
      "Text encoding tools convert plain language into and out of classic representations — Morse code, binary, octal, NATO phonetic alphabet, Caesar cipher, ROT13, Atbash, Vigenère cipher, leet speak and more. They are essential for puzzle solving, CTF challenges, ham radio, accessibility scripts, and just for fun. ToolsRift offers 11+ encoding tools that all run instantly in your browser.",
      "Each tool round-trips perfectly — encode any text, then decode the result to get exactly the original input back (within the limits of each scheme). Morse code includes audio playback at adjustable WPM speeds. The Caesar cipher tool offers a brute-force panel that shows all 26 possible shifts at once for quick decryption. The NATO alphabet tool produces both phonetic spelling and audio.",
      "These are educational and entertainment tools — they are not secure encryption. For real security, use the hash and crypto category."
    ],
    whyToolsRift: [
      "Classic encoding tools are often hidden inside ad-heavy puzzle sites that make it hard to focus on the actual encoding. ToolsRift presents them in a clean side-by-side editor: input on one side, output on the other, with options visible but unobtrusive. Live conversion as you type means you can experiment in real time — perfect for learning how Caesar ciphers shift, or how Morse encodes letters.",
      "We also include features the puzzle community asks for: Caesar brute-force showing all shifts at once, Vigenère key-length analyzer (Kasiski-style), Morse audio at 5-40 WPM, frequency analysis for substitution ciphers, and a leet speak generator with adjustable intensity. All in one place, all free."
    ],
    howToUse: [
      { title: 'Pick the encoding', body: 'Open the encoding dashboard and choose Morse, binary, Caesar, ROT13, NATO, Vigenère, leet or one of the others.' },
      { title: 'Type or paste your text', body: 'Put plaintext or encoded text into the input. The tool auto-detects direction based on the format — Morse input gives plaintext output, plaintext input gives Morse.' },
      { title: 'Configure cipher options', body: 'Caesar shift amount, Vigenère key, Morse speed, NATO output style. Defaults are sensible — the classic Caesar shift of 3, for example.' },
      { title: 'Copy, play or decode', body: 'Copy the output, play Morse audio, or run brute-force decoding to see all possible shifts of a Caesar-encrypted message at once.' }
    ],
    useCases: [
      'CTF players quickly trying Caesar shifts on captured strings',
      'Ham radio operators practicing Morse code at variable speeds',
      'Pilots and dispatchers learning the NATO phonetic alphabet',
      'Puzzle book authors generating cipher text for readers',
      'Computer science students learning classical cryptography',
      'Escape room designers creating themed puzzles',
      'Anyone sending fun cryptic messages to friends'
    ],
    faqs: [
      ['Is Morse code playback accurate?', 'Yes. Audio is generated as proper sine-wave tones at standard frequencies (600-750 Hz), with dot, dash, intra-character and inter-character gaps that match International Morse Code timing standards. Speed is adjustable from 5 to 40 words per minute.'],
      ['Can the Caesar cipher tool break a real message?', 'Yes — for ciphertext encrypted with any of the 26 possible Caesar shifts. The brute-force panel shows all 26 decoded versions at once, and you can usually identify the correct shift by scanning for readable English. Modern ciphers cannot be broken this way.'],
      ['Is ROT13 the same as Caesar with shift 13?', 'Exactly the same. ROT13 is just a Caesar cipher with shift 13, which has the nice property that encoding and decoding are the same operation. Applying ROT13 twice returns the original text.'],
      ['Can Vigenère really be cracked here?', 'The Vigenère tool includes a Kasiski-style analyzer that suggests likely key lengths by looking at repeated bigrams in the ciphertext. Once you know the key length, the cipher reduces to a set of Caesar shifts you can solve by frequency analysis. For long enough ciphertexts (200+ chars), this often works.'],
      ['What\'s the difference between Atbash and Caesar?', 'Atbash is a substitution cipher where A↔Z, B↔Y, C↔X, etc. — letters are mirrored within the alphabet. Caesar shifts by a fixed amount (commonly 3). Atbash has no "key" — it is a single fixed substitution.']
    ],
    related: pick('encoders', 'hash', 'text', 'fancy', 'devtools'),
  },

  /* ──────────────── GENERATORS (security/ID) ──────────────── */
  generators: {
    categoryName: 'Security & ID Generators',
    categorySlug: 'generators',
    heroTagline: 'Strong passwords, UUIDs, QR codes, barcodes and fake data — all in one place',
    intro: [
      "Generators are some of the most useful and most-searched online tools — strong passwords for new accounts, UUIDs for database primary keys, QR codes for sharing links, barcodes for inventory, fake names and emails for testing. ToolsRift offers 35+ generator tools covering every common need: secure password generator (with all OWASP-recommended options), UUID v1/v4/v7, QR code generator (with logo, color and error-correction options), barcode generator (12 formats), fake data generator (names, emails, addresses, phone numbers, credit cards), Lorem Ipsum, GUID, ULID, NanoID, secure tokens, API keys, OTP codes, and more.",
      "All generators run entirely in your browser with cryptographically secure randomness (Web Crypto API) where security matters — passwords, tokens and crypto-safe IDs use real entropy, not predictable JavaScript Math.random.",
      "Bulk generation is supported on most tools — generate 100 passwords at once, export 1000 fake users as CSV, or batch 50 QR codes for an event."
    ],
    whyToolsRift: [
      "Online password generators are paradoxically a security risk: most of them generate passwords on the server, which means your new password is visible to that server and may end up in logs. ToolsRift generates everything using the browser\'s built-in crypto API. The randomness is the same quality as Node.js crypto.randomBytes, and the password never crosses the network.",
      "We also pay attention to details other generators skip. The password tool can enforce minimum counts of each character class (not just \"include numbers\" but \"at least 2 numbers\"). The UUID tool exposes the timestamp inside v1 and v7 UUIDs. The QR tool includes logo overlay with automatic error-correction level adjustment so codes still scan reliably."
    ],
    howToUse: [
      { title: 'Pick the generator', body: 'Open the generators dashboard and pick password, UUID, QR code, barcode, fake data or one of the specialty tools.' },
      { title: 'Configure options', body: 'Password: length, character classes, minimum counts. UUID: version. QR: text/URL, color, logo, size, error-correction. Fake data: which fields, how many rows, locale.' },
      { title: 'Generate', body: 'One click produces the output. For random tools, click again for a new result. For bulk generators, enter the count.' },
      { title: 'Copy or download', body: 'Single values copy with one click; bulk outputs download as CSV, JSON or zip. QR codes and barcodes download as PNG or SVG.' }
    ],
    useCases: [
      'New users creating strong, unique passwords for each account',
      'Backend developers generating UUIDs for testing database records',
      'Event organizers creating QR codes for tickets and check-in',
      'Retailers generating product barcodes (EAN, UPC, Code 128)',
      'QA teams populating staging environments with realistic fake data',
      'Designers placing Lorem Ipsum into mockups quickly',
      'Two-factor auth implementers generating sample TOTP codes'
    ],
    faqs: [
      ['Are the passwords cryptographically secure?', 'Yes. The password generator uses crypto.getRandomValues() — the browser\'s Web Crypto API — which is suitable for security-critical use. The same primitive backs WebAuthn, session token generation in serverless platforms, and other security-sensitive code.'],
      ['Are passwords stored or logged anywhere?', 'No. Generation happens entirely in your browser. Passwords are never sent to a server, never stored in cookies or localStorage, and disappear when you close the tab. We have no way to retrieve a generated password after the fact.'],
      ['What\'s the difference between UUID v1, v4 and v7?', 'v1 includes a timestamp and MAC address — sortable but leaks information. v4 is fully random — most common in modern apps. v7 is the new (2024) standard: random but with a timestamp prefix, so they sort chronologically while keeping uniqueness. Pick v7 for new projects.'],
      ['Can the QR code include my logo?', 'Yes. Upload a logo (PNG with transparency works best) and it is overlaid at the center. The tool automatically increases the QR error-correction level to compensate for the obscured pixels, so the code still scans reliably.'],
      ['Is the fake data really random or template-based?', 'A mix. Names are sampled from real common-name distributions per locale (US, UK, India, etc.). Emails are generated from the names. Phone numbers follow the correct format for the chosen country. Credit cards pass the Luhn check but are not valid for actual transactions — they exist only for testing form validation.']
    ],
    related: pick('hash', 'devtools', 'encoders', 'generators2', 'devgen'),
  },

  /* ──────────────── GENERATORS2 (content) ──────────────── */
  generators2: {
    categoryName: 'Content Generators',
    categorySlug: 'generators2',
    heroTagline: 'Privacy policies, legal docs, SVG art and marketing copy — generated in seconds',
    intro: [
      "Content generators turn a few inputs into ready-to-use documents and assets that would otherwise take an hour to write or design. ToolsRift offers 35+ content generators covering legal documents (privacy policy, terms of service, cookie policy, GDPR notice, refund policy, EULA, NDA), visual content (SVG patterns, blob shapes, geometric backgrounds, mesh gradients), marketing copy (taglines, product descriptions, meta descriptions, CTAs, headlines), social media (Instagram captions, Twitter threads, LinkedIn posts), and developer-facing content (README templates, CHANGELOG, GitHub issue templates, commit message generators).",
      "Each generator asks for a small amount of context — your business name, location, what you sell, who your audience is — and produces a complete, professionally-worded document or asset. Legal documents follow current best practices for GDPR, CCPA and standard consumer protection norms.",
      "Outputs are starting points, not legal advice. Always have legal documents reviewed by a qualified attorney before publishing on a real business website."
    ],
    whyToolsRift: [
      "Most content generators are either thin wrappers around AI that produce generic output, or paid services that lock the result behind a sign-up. ToolsRift\'s content generators use templates curated and reviewed by real practitioners — privacy policies based on widely-used open-source templates with explicit GDPR/CCPA sections, SVG patterns generated by hand-written algorithms, marketing copy built from proven copywriting frameworks (AIDA, PAS).",
      "All output is yours to use, modify and publish without attribution. Documents render with proper formatting — headings, sub-clauses, contact placeholders — so you can paste them directly into your CMS. SVGs export with optimized markup that you can embed inline or use as background images."
    ],
    howToUse: [
      { title: 'Pick what you need to generate', body: 'Open the content generators dashboard and pick a legal doc, SVG pattern, marketing copy or developer template.' },
      { title: 'Fill in the form', body: 'Each generator has a small set of fields — business name, jurisdiction, product details. Fields are clearly labeled with examples.' },
      { title: 'Preview the output', body: 'Output renders live with proper formatting. SVGs preview visually; documents render with proper typography.' },
      { title: 'Copy, download or embed', body: 'Copy text output, download documents as Markdown / HTML / PDF, or download SVGs as files or as ready-to-paste code.' }
    ],
    useCases: [
      'Founders launching SaaS apps needing a privacy policy and terms of service',
      'Indie developers shipping side projects with proper legal pages',
      'Designers generating unique SVG backgrounds and decorative patterns',
      'Marketers writing product descriptions and ad copy at scale',
      'Open-source maintainers creating README and CONTRIBUTING templates',
      'Bloggers generating meta descriptions optimized for Google snippet length',
      'Small business owners producing standard legal documents without a lawyer fee'
    ],
    faqs: [
      ['Are the generated legal documents legally binding?', 'They are templates based on common best practices and should be a solid starting point. They are not a substitute for legal advice. For high-stakes use (collecting payments, processing health data, operating in multiple jurisdictions), have an attorney review and customize the template before publishing.'],
      ['Will the privacy policy cover GDPR and CCPA?', 'Yes. The generator includes optional sections for GDPR (lawful basis, data subject rights, DPO contact), CCPA (right to know, right to delete, opt-out of sale), and other major frameworks. Toggle sections on/off based on where your users live.'],
      ['Can I use the generated content commercially?', 'Yes. There is no attribution requirement and no license restrictions on generated content. Use it on commercial websites, paid apps, client deliverables — anywhere.'],
      ['Do the SVG patterns work as backgrounds?', 'Yes. Each SVG includes a transparent or solid background, and you can copy the SVG code as a CSS background-image data URI directly. Colors, density, scale and stroke width are all customizable before export.'],
      ['Does the AI generator use OpenAI or another API?', 'No. The content generators are template-based, not AI-based. That means no API key, no rate limit, no cost, and no risk that your input is used to train a third-party model. Output is deterministic for a given input.']
    ],
    related: pick('generators', 'business', 'devgen', 'text', 'html'),
  },

  /* ──────────────── DEVGEN ──────────────── */
  devgen: {
    categoryName: 'Dev Config Generators',
    categorySlug: 'devgen',
    heroTagline: '.gitignore, Dockerfile, nginx config, package.json and .env templates',
    intro: [
      "Every new project starts with the same config files — .gitignore tuned for your language, Dockerfile for containerization, package.json with sensible defaults, nginx config for production hosting, .env template for environment variables. Writing these from scratch every time is repetitive and error-prone. ToolsRift offers 30+ dev config generators that produce battle-tested config files in seconds based on a small amount of input about your project.",
      "Tools include .gitignore generator (50+ language and framework templates from GitHub\'s official set), Dockerfile generator (multi-stage builds for Node, Python, Go, Rust, Java, .NET), nginx config builder (reverse proxy, SSL, static hosting, with redirect rules), Apache .htaccess builder, package.json scaffolder, .env template generator, GitHub Actions workflow generator, GitLab CI pipeline generator, robots.txt builder, sitemap.xml generator, and several others.",
      "Generated configs follow current best practices: nginx configs include security headers, Dockerfiles use multi-stage builds with non-root users, .gitignore includes editor and OS files in addition to language-specific patterns."
    ],
    whyToolsRift: [
      "Many config generators on the web are years out of date — Dockerfiles still using the wrong base image, nginx configs missing modern security headers, .gitignore files missing .DS_Store or Thumbs.db. ToolsRift\'s configs are reviewed against current best practices for each ecosystem and updated regularly.",
      "Configs are also annotated. The Dockerfile generator explains each instruction with a comment so you can understand and modify it; the nginx generator shows you which directives provide security headers and which are performance optimizations. That makes the tools useful for learning, not just copy-paste."
    ],
    howToUse: [
      { title: 'Pick the config type', body: 'Open the dev config dashboard and pick the file you need — .gitignore, Dockerfile, nginx, etc.' },
      { title: 'Tell us about your project', body: 'Each generator asks a few questions: language, framework, deployment target. Most fields have sensible defaults you can accept.' },
      { title: 'Review the generated config', body: 'Config appears with syntax highlighting and inline comments explaining each section. Edit directly in the output panel if you need to tweak.' },
      { title: 'Copy or download', body: 'One click copies; download saves to disk with the right filename (.gitignore, Dockerfile, nginx.conf, etc.).' }
    ],
    useCases: [
      'Developers scaffolding new repos with a complete .gitignore',
      'Teams standardizing Dockerfiles across services',
      'DevOps engineers deploying static sites with optimized nginx configs',
      'Indie hackers shipping side projects with proper CI/CD pipelines',
      'Open-source maintainers generating GitHub workflow templates',
      'Backend developers creating .env templates that document required vars',
      'Site owners generating robots.txt with the right disallow rules for their CMS'
    ],
    faqs: [
      ['Where do the .gitignore templates come from?', 'They start from GitHub\'s officially-maintained gitignore repository (the canonical source) and are extended with common editor and OS patterns (.vscode, .DS_Store, Thumbs.db). You can combine multiple language templates with one click.'],
      ['Are the Dockerfiles production-ready?', 'Yes. Generated Dockerfiles use multi-stage builds to minimize image size, run as non-root users for security, use specific image tags (not :latest) for reproducibility, and include HEALTHCHECK directives where appropriate. They are a strong starting point for production deployment.'],
      ['Does the nginx generator handle SSL?', 'Yes. The nginx config builder generates Let\'s Encrypt-compatible SSL configuration with modern cipher suites, HSTS headers, and HTTP-to-HTTPS redirects. It assumes you will use certbot to issue and renew certificates.'],
      ['Can I customize the generated GitHub Actions workflow?', 'Yes. The generator asks about your language, test framework and deployment target, then produces a workflow you can paste into .github/workflows. It is fully editable — comments explain each step so you can modify confidently.'],
      ['Will the robots.txt block AI scrapers?', 'Optionally. The robots.txt generator offers a section to disallow common AI training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended) with a single toggle. You can also customize per-bot rules.']
    ],
    related: pick('devtools', 'js', 'json', 'formatters', 'generators'),
  },

  /* ──────────────── MATHCALC ──────────────── */
  mathcalc: {
    categoryName: 'Math Calculators',
    categorySlug: 'mathcalc',
    heroTagline: 'Geometry, algebra, trigonometry, matrix and statistics calculators',
    intro: [
      "Math calculators take the grunt work out of common calculations — solving quadratic equations, computing the area of irregular shapes, multiplying matrices, finding standard deviation, converting between number bases. ToolsRift hosts 35+ math calculators covering every major branch of high-school and early-college mathematics, plus several specialty tools for engineers and data analysts.",
      "Coverage includes geometry (area, perimeter, volume of every common shape), trigonometry (sin/cos/tan, inverse functions, triangle solvers, unit circle), algebra (quadratic, linear systems, factoring, simplification), matrix operations (determinant, inverse, multiplication, eigenvalues), number theory (GCD, LCM, prime factorization, modular arithmetic), statistics (mean, median, mode, variance, standard deviation, percentiles, regression), combinatorics (permutations, combinations, binomial), and base conversion (decimal, binary, octal, hex with arbitrary base).",
      "Every calculator shows the work step-by-step so the tool is useful for learning, not just for getting an answer."
    ],
    whyToolsRift: [
      "Most online math calculators give you just a number — useful if you trust the tool, but useless for learning or homework where you need to show work. ToolsRift\'s calculators include a step-by-step breakdown for every operation: quadratic formula application, matrix row reduction, statistical formula expansion. That makes them genuinely useful for students checking their own work.",
      "Precision is high. Internal arithmetic uses JavaScript\'s BigNumber library where exact answers are possible, falling back to high-precision floating point only when necessary. Results are formatted with appropriate significant figures, not as raw 17-digit floats."
    ],
    howToUse: [
      { title: 'Pick the calculator', body: 'Open the math dashboard and pick the type of problem — geometry, algebra, trigonometry, statistics, etc.' },
      { title: 'Enter your values', body: 'Inputs are clearly labeled (side a, side b, angle θ). For multi-step problems, fields appear progressively as needed.' },
      { title: 'Read the step-by-step solution', body: 'The tool shows the formula, substitutes your values, and walks through the calculation. Helpful diagrams accompany geometry and trig.' },
      { title: 'Copy result or share', body: 'Copy the answer alone or copy the full work with explanations. Shareable URLs preserve your input for collaboration.' }
    ],
    useCases: [
      'Students checking homework answers and seeing the steps',
      'Engineers performing quick geometry and trig calculations on the job',
      'Statisticians computing summary statistics from raw data',
      'Game developers calculating triangle areas and trigonometric values',
      'Data analysts running linear regression on small datasets',
      'Computer science students experimenting with number bases',
      'Teachers building worked-example slides with shareable URLs'
    ],
    faqs: [
      ['Can the algebra solver handle systems of equations?', 'Yes — linear systems up to 5 unknowns are solved with full work shown (substitution or matrix methods). Nonlinear systems are solved numerically with Newton\'s method, with clear notes about which solutions were found.'],
      ['Does the trigonometry calculator use degrees or radians?', 'Both — there is a toggle. The unit-circle visualization always shows both labels (e.g. π/4 / 45°). Inputs and outputs both respect your chosen unit.'],
      ['How accurate are statistical calculations?', 'Mean and median are exact. Variance and standard deviation use the unbiased estimator (n-1 denominator) by default, with a toggle for the population version (n denominator). Internal precision is double-precision floating point, sufficient for thousands of data points.'],
      ['Can I paste a CSV of numbers into the statistics tool?', 'Yes. The statistics calculator accepts CSV, line-separated values, or space-separated values. It auto-detects the delimiter. Up to 100,000 values are supported in browser memory.'],
      ['Does the matrix calculator find eigenvalues?', 'Yes — for matrices up to 6×6. Eigenvalues and eigenvectors are computed numerically using the QR algorithm with shifts. For larger matrices, a desktop tool like NumPy is more appropriate.']
    ],
    related: pick('financecalc', 'units', 'converters2', 'devtools', 'js'),
  },

  /* ──────────────── FINANCECALC ──────────────── */
  financecalc: {
    categoryName: 'Finance & Health Calculators',
    categorySlug: 'financecalc',
    heroTagline: 'EMI, tax, TDEE, calorie and investment-return calculators',
    intro: [
      "Finance and health calculators are some of the most-searched tools on the internet — for good reason. Whether you are planning a home loan, computing the true cost of a credit card balance, estimating your tax liability, working out your daily calorie needs, or projecting investment returns, these calculations matter for decisions that affect your life and your money. ToolsRift offers 35+ free finance and health calculators with the rigor of professional tools and the simplicity of consumer apps.",
      "Finance coverage includes loan EMI calculator (with amortization schedule), mortgage calculator, compound interest, simple interest, SIP (systematic investment plan) returns, lump-sum investment growth, retirement corpus, inflation-adjusted returns, tax calculator (multiple regimes), GST calculator, currency conversion, tip calculator, discount calculator, and credit card interest.",
      "Health coverage includes BMI calculator (with classification), TDEE (total daily energy expenditure) and BMR (basal metabolic rate), calorie intake for weight goals, macronutrient split, body fat percentage estimate, ideal weight, water intake, pregnancy due date, ovulation calculator and several others."
    ],
    whyToolsRift: [
      "Finance and health calculations involve sensitive numbers — your salary, your debts, your weight, your medical info. Many calculator sites send that data to a server, often along with cookies that link it to your identity through ad networks. ToolsRift runs every calculation entirely in your browser. Your inputs never leave your device, never appear in analytics, and never get shared with advertisers.",
      "The calculators also explain their formulas. EMI calculations show the underlying equation, the amortization breakdown for the first and last months, the total interest paid, and the date you finish the loan. TDEE shows the Mifflin-St Jeor formula it uses and lets you pick an alternative if your provider prefers one. That transparency is missing from most consumer calculator apps."
    ],
    howToUse: [
      { title: 'Pick the calculator', body: 'Open the finance & health dashboard and pick EMI, tax, TDEE, calorie, or one of the specialty tools.' },
      { title: 'Enter your inputs', body: 'Use sliders or type values directly. Live results update as you change inputs so you can experiment with scenarios.' },
      { title: 'Review the breakdown', body: 'Most calculators show a chart and a detailed table — amortization schedule for loans, macro split for nutrition, year-by-year growth for investments.' },
      { title: 'Copy or print results', body: 'Copy summary numbers, print the full breakdown for your records, or download the schedule as CSV for spreadsheet analysis.' }
    ],
    useCases: [
      'Homebuyers comparing loan offers using EMI and total-interest analysis',
      'Investors projecting SIP and lump-sum returns over different horizons',
      'Salaried employees estimating tax liability under different regimes',
      'Anyone tracking weight goals by computing TDEE and macro targets',
      'Couples planning families with ovulation and due-date calculators',
      'Travelers calculating tips and splitting bills in foreign currencies',
      'Small business owners computing GST on invoices'
    ],
    faqs: [
      ['Are the EMI calculations accurate?', 'Yes — the EMI calculator uses the standard formula EMI = P × r × (1+r)^n / ((1+r)^n - 1), exactly what banks use. The amortization schedule rounds each monthly payment to two decimal places and adjusts the final payment to clear the balance, mirroring how loan servicers handle rounding.'],
      ['Which TDEE formula is used?', 'Mifflin-St Jeor by default — the formula recommended by the American Dietetic Association as the most accurate for the general population. You can switch to Harris-Benedict (older but still widely cited) or Katch-McArdle (more accurate if you know your body-fat percentage).'],
      ['Is the tax calculator accurate for my country?', 'The tax calculator currently supports India (old and new regimes) and USA (federal, with 2024 brackets). For other countries, the basic income-tax math is correct but local deductions, credits and surcharges may not be modeled. Always cross-check with an official tax filer before relying on the number.'],
      ['Are health calculators a substitute for medical advice?', 'No. BMI, TDEE, body-fat estimates and similar tools are useful for general guidance but cannot account for individual factors that a doctor or registered dietitian would consider. For medical decisions — especially during pregnancy, illness, or significant weight change — consult a qualified professional.'],
      ['Does the SIP calculator account for inflation?', 'Yes — there is a toggle for inflation-adjusted (real) returns versus nominal returns. The real-return mode subtracts your chosen inflation rate from the expected return so you see purchasing power, not just nominal rupees. Default inflation is 6% for India and 3% for USA.']
    ],
    related: pick('mathcalc', 'business', 'units', 'converters2', 'generators2'),
  },

  /* ──────────────── CONVERTERS2 ──────────────── */
  converters2: {
    categoryName: 'Special Unit Converters',
    categorySlug: 'converters2',
    heroTagline: 'Electrical, clothing size, paper size and physics-constant conversions',
    intro: [
      "Beyond the everyday length-weight-volume conversions, there is a long tail of specialty conversions that come up regularly — electrical units (volts, amps, watts, ohms with Ohm\'s law solvers), clothing sizes across US, UK, EU, Japan and India, paper sizes (A, B, C series, plus US Letter/Legal/Tabloid and envelope sizes), physical constants, frequency to wavelength, RPM to angular velocity, torque between metric and imperial, and many more. ToolsRift offers 20+ specialty converters that cover these less-common but still essential conversions.",
      "Tools include electrical Ohm\'s law solver, watts-to-amps and amps-to-watts converters (AC and DC), wire-gauge converter (AWG to mm²), clothing size charts for men/women/children/shoes across major regions, paper-size reference with print-area visualizer, ring size converter, lens focal-length equivalent for different sensor sizes, fuel economy across MPG-US / MPG-UK / km per liter / liters per 100 km, and several physics conversions.",
      "Each tool clarifies which standard or formula it uses — Ohm\'s law variants (DC vs AC with power factor), ANSI vs ISO paper standards, men\'s vs women\'s shoe sizing offsets."
    ],
    whyToolsRift: [
      "Specialty converters are often inaccurate or rounded too aggressively. Clothing size charts on free sites are frequently lifted from a single retailer\'s sizing, which does not match the regional standard. ToolsRift uses official conversion tables published by international standards bodies — ISO for paper, the official US/UK/EU sizing charts for apparel, ANSI for wire gauges.",
      "All electrical calculators show both the formula and the calculation. If you compute amps from watts and volts, you see V × I = P inverted explicitly, with the right form chosen for DC, single-phase AC, or three-phase AC. That makes the tools useful for electricians and electronics hobbyists in addition to general users."
    ],
    howToUse: [
      { title: 'Pick the converter', body: 'Open the specialty converters dashboard and pick electrical, clothing, paper, or one of the others.' },
      { title: 'Enter your value', body: 'Type the source value and pick the source unit / region. The tool computes equivalents in every other system.' },
      { title: 'Review the comparison', body: 'Results appear in a table with all equivalent values labeled clearly — US 10, UK 9, EU 44, JP 28 for a shoe size, for example.' },
      { title: 'Copy or print', body: 'Copy a single value, copy the full conversion table, or print a size reference chart for offline use.' }
    ],
    useCases: [
      'Online shoppers ordering clothes from international retailers',
      'Electricians sizing wire and breakers from load calculations',
      'Print designers picking the right paper size for international clients',
      'Photographers comparing focal-length equivalents across camera systems',
      'Hobbyists building electronic projects with mixed-unit components',
      'Travelers buying shoes overseas without trying them on',
      'Engineers converting torque and power between metric and imperial spec sheets'
    ],
    faqs: [
      ['How accurate are the clothing size conversions?', 'Conversions are based on the official sizing charts published by the major regional standards bodies. Brand variation still exists — a US 8 from one brand may fit slightly differently from another. The tool shows the standard size; check the specific brand\'s chart for the most accurate fit.'],
      ['Does the Ohm\'s law solver handle AC and three-phase?', 'Yes. DC, single-phase AC (with optional power factor) and three-phase AC are all supported. The tool clearly shows which formula it is using for each calculation — P = V × I for DC, P = V × I × cos(φ) for single-phase AC, P = √3 × V × I × cos(φ) for three-phase.'],
      ['What\'s the difference between ISO and ANSI paper sizes?', 'ISO (A4, A3, etc.) is the international standard used in most of the world; sizes are based on a √2 aspect ratio so halving an A3 gives two A4s. ANSI (Letter, Legal, Tabloid) is used primarily in the US and Canada. They are not compatible — A4 (8.27 × 11.69 in) is slightly different from US Letter (8.5 × 11 in).'],
      ['Can I get focal-length equivalent for any camera sensor?', 'Yes. The focal-length equivalent tool lists full-frame (the 35mm standard), APS-C (both Canon and Nikon/Sony crop factors), Micro Four Thirds, 1-inch, and common smartphone sensors. Enter a focal length on any system and see the equivalent on all others.'],
      ['Does the wire gauge converter cover both AWG and metric?', 'Yes. American Wire Gauge (AWG), Standard Wire Gauge (SWG, UK), and metric cross-section (mm²) are all supported, with current-carrying capacity at standard ambient temperatures for reference.']
    ],
    related: pick('units', 'mathcalc', 'devtools', 'financecalc', 'generators'),
  },

  /* ──────────────── DEVTOOLS ──────────────── */
  devtools: {
    categoryName: 'Developer Tools',
    categorySlug: 'devtools',
    heroTagline: 'Regex tester, JSON diff, JWT debugger, cron and chmod calculators',
    intro: [
      "Developer tools are the daily utilities that save engineers minutes (and sometimes hours) on every task. ToolsRift offers 40+ developer tools that cover the most common debugging and reference needs: regex tester with live highlighting, JSON diff and merge, JWT debugger with header/payload inspection, cron expression builder and explainer, chmod calculator (visual permissions builder), URL parser, query-string builder, IP and CIDR calculators, MAC address lookup, timezone converter, Unix timestamp converter, color picker from screenshot, mock data generator and many more.",
      "Each tool is designed for the workflow it supports. The regex tester highlights matches and capture groups live as you type; the cron explainer translates `0 9 * * 1-5` into \"every weekday at 9am\"; the chmod calculator lets you click checkboxes to build a permission octal. The JSON diff shows additions, removals and modifications with line-level coloring.",
      "All tools run in your browser. No data — production tokens, internal IPs, real cron schedules — is ever sent to a server."
    ],
    whyToolsRift: [
      "Developer tools often deal with sensitive inputs: JWT tokens contain session info, JSON diffs may include PII from API responses, IP calculators reveal network topology. Most online dev tools either log or could log these inputs. ToolsRift runs every dev tool entirely client-side and we explicitly do not log any input content — only standard page-view analytics, which see URLs and nothing else.",
      "Beyond privacy, our dev tools are designed for the common cases professional engineers actually hit. The regex tester supports JS, PCRE and POSIX flavors and explains the difference. The cron tool covers Quartz extensions used by Spring and other schedulers, not just the standard Unix syntax. The JWT debugger highlights known claim names (iat, exp, sub) and warns about common mistakes like an expired token."
    ],
    howToUse: [
      { title: 'Pick the tool', body: 'Open the devtools dashboard and pick the utility you need — regex, JSON diff, JWT, cron, chmod, etc.' },
      { title: 'Paste or input your data', body: 'Drop your regex pattern, JSON payloads, cron expression, or other input. Live highlighting and parsing start immediately.' },
      { title: 'Inspect results', body: 'Each tool produces clear, annotated output — match highlights for regex, line-level diff for JSON, plain English for cron expressions.' },
      { title: 'Copy or share', body: 'One-click copy. Most tools also offer share URLs that encode your input — useful for posting in Slack or asking for help from a teammate.' }
    ],
    useCases: [
      'Backend engineers testing regex patterns for validation rules',
      'API engineers diffing two responses to find regression bugs',
      'Auth engineers inspecting JWT structure and claim contents',
      'DevOps engineers building and explaining cron expressions',
      'System admins calculating chmod octal from desired permissions',
      'Network engineers computing subnet ranges from CIDR notation',
      'Anyone converting Unix timestamps to readable dates across time zones'
    ],
    faqs: [
      ['Does the regex tester support PCRE features?', 'Yes — PCRE, JavaScript and POSIX flavors are all supported, with clear notes about which features are flavor-specific (lookbehind, named groups, possessive quantifiers). The tool warns if your pattern uses a feature unavailable in your chosen flavor.'],
      ['Can I diff really large JSON files?', 'Yes. The JSON diff handles files up to several megabytes with line-level comparison and side-by-side display. For multi-megabyte files, the diff may take a second or two — but nothing is truncated.'],
      ['Does the JWT debugger verify signatures?', 'It decodes and displays the header and payload (which are public Base64-encoded JSON), and validates the structure. It does not verify the signature, because verification requires the issuer\'s secret or public key — which we do not collect. For local debugging, this is exactly the right behavior.'],
      ['What cron syntax does the explainer support?', 'Standard 5-field Unix cron (minute, hour, day-of-month, month, day-of-week), with extensions: 6-field (with seconds), 7-field (with year), special strings (@daily, @hourly), Quartz syntax used by Spring schedulers, and step values. The explainer outputs both English and the next 5 firing times.'],
      ['Can I use the chmod calculator for Windows ACLs?', 'No — chmod is a Unix/Linux concept. The calculator builds octal and symbolic chmod representations (rwxr-xr-x = 755) for Linux, macOS and similar systems. Windows uses a separate ACL model that does not map cleanly to chmod.']
    ],
    related: pick('json', 'encoders', 'hash', 'devgen', 'formatters'),
  },

  /* ──────────────── BUSINESS ──────────────── */
  business: {
    categoryName: 'Business Tools',
    categorySlug: 'business',
    heroTagline: 'Invoice generator, resume builder, cover letter and SWOT generators',
    intro: [
      "Small businesses, freelancers and job-seekers need professional documents fast — invoices to send to clients, receipts for cash transactions, resumes for new job applications, cover letters tailored to each opening, business proposals, SWOT analyses for strategy reviews. ToolsRift offers 15+ business document tools that produce print-ready output in minutes, all entirely in your browser with no upload of your sensitive client and personal data.",
      "Tools include invoice generator (with tax, discount, multi-currency, brand colors and logo upload), receipt maker, resume builder (with multiple modern templates), cover letter builder, business letter generator, quote and estimate generator, purchase order, SWOT analysis canvas, business model canvas (Lean Canvas), UTM link builder, and several others.",
      "All documents export to PDF for sending, or HTML for further editing. Templates are professional and modern — appropriate for serious business use without looking generic."
    ],
    whyToolsRift: [
      "Invoice and resume generators on the open web typically require sign-up, watermark the output (\"Generated with X\"), or save your data to their servers for future logins. None of that is needed. ToolsRift\'s business tools work entirely without an account, never watermark output, and never store any data — your client list, your salary history, your business name and address all stay on your device.",
      "Document templates also look genuinely professional. The invoice generator produces output that matches what accounting software like FreshBooks or QuickBooks generates — clean typography, proper alignment, tax breakdowns, payment terms — not the cluttered free-template look common elsewhere. The resume builder offers ATS-friendly templates that pass automated parsers."
    ],
    howToUse: [
      { title: 'Pick the document type', body: 'Open the business tools dashboard and pick invoice, resume, cover letter or one of the others.' },
      { title: 'Fill in your details', body: 'Each tool has a clear form. Invoice asks for your business info, client info, line items, tax. Resume asks for sections in standard order. Saving as a draft works locally (in your browser).' },
      { title: 'Pick a template and color', body: 'Choose from several modern templates and tweak the accent color to match your brand. Logos can be uploaded for invoices.' },
      { title: 'Download as PDF', body: 'One click generates a professional PDF ready to email or print. Output is generated in your browser using PDF libraries, so it is always available and never blocked by network issues.' }
    ],
    useCases: [
      'Freelancers sending invoices to clients with professional branding',
      'Small businesses issuing receipts for cash transactions',
      'Job seekers crafting tailored resumes for each application',
      'Sales teams generating quotes and estimates on the fly',
      'Founders running SWOT analyses for monthly strategy reviews',
      'Marketers building UTM-tracked links for campaign analytics',
      'Contractors creating purchase orders for material suppliers'
    ],
    faqs: [
      ['Will the invoice include tax and discounts correctly?', 'Yes. The invoice generator supports multiple tax rates per line item, percentage and flat-amount discounts, and totals that update live as you edit. Currency is configurable, and tax labels (GST, VAT, Sales Tax) can be customized to match your jurisdiction.'],
      ['Are the resume templates ATS-friendly?', 'Yes. Templates use standard single-column layouts, semantic section headings (Experience, Education, Skills) and avoid graphics inside text. They parse correctly through major ATS systems (Workday, Greenhouse, Lever, Taleo) — verified against publicly-documented ATS parsing rules.'],
      ['Where is my invoice data stored?', 'Nowhere on our servers. Drafts are saved to your browser\'s localStorage so you can come back later, but that data never leaves your device. Clear your browser data to delete drafts. If you use multiple devices, you will need to save the PDF and re-import.'],
      ['Can I add my company logo to invoices?', 'Yes. Drag a logo image onto the invoice generator and it appears in the header. The image is processed entirely in your browser — never uploaded. PNG with transparency works best.'],
      ['Is the SWOT analysis canvas printable?', 'Yes. The SWOT canvas exports as a high-resolution PDF suitable for printing or embedding in slide decks. The Business Model Canvas (Lean Canvas) is also available in the same workflow.']
    ],
    related: pick('generators2', 'pdf', 'financecalc', 'text', 'generators'),
  },

}

export default CONTENT
