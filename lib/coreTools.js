// ── ToolsRift indexation allowlist ───────────────────────────────────────────
// Google applied a site-wide deindexing action after `site:toolsrift.com`
// impressions collapsed from ~500/day to single digits on 2026-08-16 (see the
// GSC "Performance on Search" exports from that week). The trigger pattern is
// scaled/thin content: 1,136 tool pages, 96.6% of them with a how-to under 200
// characters, sibling pages 55-79% textually identical, and the interactive
// tool itself client-rendered (ssr:false) behind a "Loading…" spinner in the
// HTML Google fetches first.
//
// Google's own documented remedy for a scaled-content action is to prune the
// site down to a core the operator can genuinely stand behind, and keep the
// rest out of the index (not delete it — noindex) until it can be built out
// with real depth. This file is that core: ~244 tools, picked for having
// standalone search demand, spread across all 29 categories.
//
// HOW IT'S USED
//   pages/[category]/[tool].js checks `CORE_TOOLS.has(tool.id)`:
//     - core tool       -> indexed normally, included in the sitemap
//     - everything else -> <meta name="robots" content="noindex, follow">,
//                           left OUT of sitemap.xml, but the tool itself still
//                           works and stays reachable from its category page.
//   scripts/generate-sitemap.js filters tool URLs through the same array —
//   as plain text + JSON.parse, the same way it already reads toolRegistry.js,
//   because that script runs under plain `node`, not webpack/babel, and can't
//   `require()` an ES module.
//
// Keyed by tool id (not category) to match the existing CANONICAL_CAT dedup —
// a handful of ids are intentionally listed in two categories (e.g.
// `hmac-generator` in both devtools and hash); adding the id once here makes
// it core wherever CANONICAL_CAT resolves it to.
//
// This is a first pass based on category-level search-demand judgment, not
// keyword-volume data (the site had almost no ranking history to draw on).
// Revisit with real Search Console data once the core re-indexes and starts
// collecting impressions again — promote tools that show demand, and only
// then consider growing the allowlist back out.

export const CORE_TOOL_IDS = [
  // business (6)
  "invoice-gen", "receipt-gen", "resume-builder", "cover-letter-gen", "quotation-gen", "business-card-gen",
  // colors (8)
  "color-picker", "color-converter", "color-contrast", "color-palette", "hex-rgba", "color-gradient", "image-colors", "cmyk-rgb-converter",
  // converters2 (6)
  "clothing-size-converter", "shoe-size-converter", "paper-size-converter", "roman-numeral-converter", "ring-size-converter", "wire-gauge-converter",
  // css (8)
  "css-gradient", "css-box-shadow", "css-border-radius", "css-flexbox", "css-grid", "css-animation", "cubic-bezier-editor", "px-to-rem-converter",
  // devgen (6)
  "gitignore-gen", "readme-gen", "dockerfile-gen", "env-gen", "robots-txt-gen", "json-schema-gen",
  // devtools (8)
  "unix-timestamp", "cron-parser", "regex-tester-adv", "jwt-debugger", "diff-checker", "uuid-inspector", "ip-info", "curl-builder",
  // encoders (10)
  "base64-encode", "base64-decode", "base64-image", "url-encode", "url-decode", "html-encode", "html-decode", "jwt-decoder", "hex-encode", "binary-encode",
  // encoding (6)
  "morse-code", "caesar-cipher", "rot13", "nato-alphabet", "binary-text", "braille-translator",
  // everyday (8)
  "age-calculator", "date-difference", "world-clock", "countdown-timer", "stopwatch", "dice-roller", "coin-flip", "random-name-picker",
  // fancy (6)
  "bold-text-generator", "italic-text-generator", "bubble-text", "cursive-text", "upside-down-text", "small-caps",
  // financecalc (14)
  "emi-calc", "home-loan-emi-calc", "sip-calc", "gst-calc", "income-tax-calc", "bmi-calculator", "tdee-calc", "tip-calc",
  "discount-calculator", "inflation-calc", "rule-of-72-calc", "fd-calc", "budget-calc", "net-worth-calc",
  // formatters (8)
  "sql-formatter", "xml-formatter", "yaml-formatter", "json-to-csv", "csv-to-json", "code-beautifier", "json-to-yaml", "php-formatter",
  // generators (8)
  "strong-password-gen", "uuid-gen", "random-number-gen", "fake-name-gen", "fake-email-gen", "pin-gen", "passphrase-gen", "api-key-gen",
  // generators2 (8)
  "privacy-policy-gen", "terms-conditions-gen", "nda-gen", "svg-wave-gen", "gradient-gen", "business-name-gen", "blog-title-gen", "instagram-caption-gen",
  // hash (10)
  "md5-hash", "sha256-hash", "sha1-hash", "password-generator", "uuid-generator", "hash-all", "bcrypt-hash", "otp-generator", "password-strength", "hmac-generator",
  // html (8)
  "html-formatter", "html-minifier", "html-to-markdown", "markdown-to-html", "meta-tag-generator", "og-tag-generator", "html-table-generator", "html-boilerplate-generator",
  // images (14)
  "image-resizer", "image-cropper", "image-compressor", "image-converter", "favicon-generator", "qr-code-generator", "barcode-generator",
  "avatar-generator", "image-to-pdf", "pdf-to-image", "image-base64", "exif-remover", "image-watermark", "placeholder-image",
  // js (6)
  "js-formatter", "js-minifier", "regex-tester", "json-to-js", "js-obfuscator", "js-to-typescript",
  // json (10) — json-to-csv / csv-to-json already listed under formatters, same shared ids
  "json-formatter", "json-minifier", "json-validator", "json-diff", "json-to-xml", "xml-to-json", "json-to-typescript",
  // mathcalc (8)
  "percentage-advanced", "quadratic-solver", "area-calc", "volume-calc", "gcd-lcm-calc", "factorial-calc", "prime-checker", "matrix-calc",
  // pdf (12)
  "pdf-merger", "pdf-splitter", "pdf-compressor", "pdf-to-jpg", "jpg-to-pdf", "pdf-to-text", "word-to-pdf",
  "pdf-password-protect", "pdf-unlock", "pdf-watermark", "pdf-rotator", "pdf-page-numbering",
  // text (16)
  "word-counter-pro", "character-counter", "case-converter", "text-reverser", "remove-duplicates", "remove-extra-spaces",
  "find-replace", "palindrome-checker", "text-diff", "url-slug", "email-extractor", "url-extractor", "text-sorter",
  "number-to-words", "strip-html-tags", "reading-time",
  // units (10)
  "length-converter", "weight-converter", "temperature-converter", "area-converter", "volume-converter",
  "speed-converter", "time-converter", "digital-converter", "pressure-converter", "energy-converter",
  // random (8)
  "spinner-wheel", "random-picker", "random-number-generator", "dice-roller-3d", "coin-flip-batch", "bingo-card-generator", "magic-8-ball", "list-shuffler",
  // audio (6)
  "audio-trimmer", "audio-merger", "audio-converter", "video-audio-extractor", "voice-recorder", "text-to-speech",
  // office (6)
  "qr-code-studio", "wifi-qr-generator", "vcard-generator", "todo-list-maker", "signature-pad", "certificate-maker",
  // data (6)
  "bar-chart-maker", "pie-chart-maker", "line-chart-maker", "csv-viewer", "csv-to-json-table", "csv-merger",
  // study (6)
  "flashcard-maker", "quiz-generator", "gpa-planner", "citation-generator", "grade-calculator", "periodic-table",
  // video (8)
  "video-trimmer", "video-merger", "video-converter", "video-compressor", "video-to-audio", "video-to-gif", "gif-to-video", "video-speed"
];

const CORE_TOOLS = new Set(CORE_TOOL_IDS);

export default CORE_TOOLS;
