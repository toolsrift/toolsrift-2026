# ToolsRift — Claude Code Master Guide

> **Last updated:** April 2026  
> **Phase:** 1 (Free launch — ads-monetized, no subscription)  
> **Stack:** Next.js 14 · React · Inline styles · Vercel · Hyderabad, India

---

## 1. Project Overview

ToolsRift (`toolsrift.com`) is a large-scale free online tools platform with **544+ tools** across **34 categories**. The project is built in Next.js 14 with a custom inline-style design system. Each batch of tools lives in a self-contained JSX component file.

### Directory Structure
```
toolsrift/
├── components/
│   ├── toolsrift-main.jsx          ← Home + 70+ calculator tools
│   ├── toolsrift-business.jsx      ← Business docs (invoices, resumes)
│   ├── toolsrift-text.jsx          ← Text tools (45 tools)
│   ├── toolsrift-encoders.jsx      ← Encoders/decoders (25 tools)
│   ├── toolsrift-hash.jsx          ← Hash/crypto tools (25 tools)
│   ├── toolsrift-json.jsx          ← JSON tools (25 tools)
│   ├── toolsrift-css.jsx           ← CSS generators (20 tools)
│   ├── toolsrift-colors.jsx        ← Color tools (20 tools)
│   ├── toolsrift-units.jsx         ← Unit converters (25 tools)
│   ├── toolsrift-images.jsx        ← Image tools (50 tools)
│   ├── toolsrift-pdf.jsx           ← PDF tools (28 tools)
│   ├── toolsrift-html.jsx          ← HTML tools (25 tools)
│   ├── toolsrift-js.jsx            ← JS tools (10 tools)
│   ├── toolsrift-formatters.jsx    ← Code formatters (25 tools)
│   ├── toolsrift-fancy.jsx         ← Fancy text (20 tools)
│   ├── toolsrift-encoding.jsx      ← Text encoding (11 tools)
│   ├── toolsrift-gen-security.jsx  ← Security/ID generators (35 tools)
│   ├── toolsrift-gen-content.jsx   ← Content generators (35 tools)
│   ├── toolsrift-gen-devconfig.jsx ← Dev config generators (30 tools)
│   ├── toolsrift-calc-math.jsx     ← Math calculators (35 tools)
│   ├── toolsrift-calc-finance.jsx  ← Finance/health calculators (35 tools)
│   ├── toolsrift-converters2.jsx   ← Additional unit converters (20 tools)
│   ├── toolsrift-devtools.jsx      ← Developer tools (40 tools)
│   ├── UpgradeModal.jsx            ← Pro upgrade modal (PHASE 2 only)
│   └── UsageCounter.jsx            ← Daily usage counter (PHASE 2 only)
├── pages/
│   ├── index.js                    ← Home (toolsrift-main.jsx)
│   ├── text.js, encoders.js, hash.js, json.js, css.js, colors.js
│   ├── units.js, images.js, pdf.js, html.js, js.js, formatters.js
│   ├── fancy.js, encoding.js, generators.js, generators2.js
│   ├── devgen.js, mathcalc.js, financecalc.js, converters2.js
│   ├── devtools.js, business.js, pricing.js
│   └── _app.js, _document.js
├── lib/
│   └── usage.js                    ← Usage tracking (PHASE 2 only)
├── public/
│   ├── logo.svg                    ← Main brand logo
│   ├── icon.svg                    ← Favicon
│   ├── robots.txt
│   └── site.webmanifest
└── styles/
    └── globals.css
```

---

## 2. Design System & Tokens

### Colors
```js
// Dark theme (default)
bg:          '#06090F'   // page background
surface:     '#0D1117'   // card background
surface2:    '#111827'   // secondary surface
border:      'rgba(255,255,255,0.08)'
borderLight: 'rgba(255,255,255,0.05)'
text:        '#F1F5F9'
muted:       '#94A3B8'
dim:         '#64748B'
navBg:       'rgba(6,9,15,0.85)'

// Accents
blue:        '#3B82F6'   // primary accent (all files except business)
emerald:     '#059669'   // business file accent
indigo:      '#6366F1'   // hero/CTA accent
```

### Typography
```
Main files:    Sora + Plus Jakarta Sans + JetBrains Mono
Business file: Outfit + DM Sans + JetBrains Mono
```

### Shared Components (defined per-file)
```
Badge, Btn, Input, NumInput, SelectInput, Card, Label,
Result, BigResult, CopyBtn, Grid2, Grid3, VStack
```

### Routing Pattern
```js
// State-based routing — useAppRouter() hook
// Global click interceptor for <a href="#/..."> links
// NEVER use hash routing directly (breaks in sandboxed environments)
function useAppRouter() {
  const [page, setPage] = useState("landing");
  const [toolId, setToolId] = useState(null);
  // navigate("#/tool/word-counter") → sets page="tool", toolId="word-counter"
  // navigate("#/category/calculator") → sets page="dashboard", catId="calculator"
  // navigate("#/") → sets page="landing"
}
```

---

## 3. Phase 1 Strategy — Free for All, Ads Monetization

**Phase 1 is a free-only launch.** There is NO subscription, NO pro gating, NO daily limits. All tools are free. Revenue comes from display ads only.

### What is commented out in Phase 1:
- `lib/usage.js` daily limit tracking
- `UpgradeModal.jsx` — not rendered
- `UsageCounter.jsx` — not rendered in navbar
- All `pro: true` tool flags → changed to `pro: false`
- All `isLimitReached()` / `isPro()` / `trackUse()` gate checks
- Pricing section on homepage (replaced with "All Free" messaging)
- `/pricing` page (redirect to home or show "coming soon")
- "Upgrade to PRO" buttons and nav links
- The `DAILY_LIMIT` enforcement in `usage.js`

### What stays for Phase 2:
- Files `UpgradeModal.jsx`, `UsageCounter.jsx`, `lib/usage.js` remain in codebase
- Just commented out / not imported in Phase 1
- Pro tool metadata (`pro: true`) preserved as comments for Phase 2 re-enable

### Ad Placement Strategy (Phase 1):
- Top of tool pages: 728×90 leaderboard (desktop) / 320×50 (mobile)
- Bottom of results: 300×250 medium rectangle
- Sidebar if layout allows: 160×600 wide skyscraper
- Use Google AdSense `<ins>` tags or placeholder divs during development

---

## 4. SEO Requirements (Every Tool)

Every tool MUST have:

### In TOOL_META / TOOL_SEO object:
```js
"tool-id": {
  title: "Free [Tool Name] - [Primary Action] Online",      // 50-60 chars
  desc:  "[What it does]. [Key benefit]. [Secondary use].", // 150-160 chars
  keywords: "primary keyword, secondary keyword, long-tail keyword",
  faq: [
    ["Question 1?", "Answer 1."],
    ["Question 2?", "Answer 2."],
  ],
  howTo: "Step-by-step instructions for using the tool."
}
```

### In every page file (e.g. pages/text.js):
```jsx
<Head>
  <title>Free Text Tools — Word Counter, Case Converter & More | ToolsRift</title>
  <meta name="description" content="45+ free text tools..." />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:url" content="https://toolsrift.com/text" />
  <meta property="og:site_name" content="ToolsRift" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="canonical" href="https://toolsrift.com/text" />
</Head>
```

### Breadcrumb (every tool page):
```jsx
<Breadcrumbs items={[
  { label: "Home", href: "#/" },
  { label: "Category Name", href: "#/category/catId" },
  { label: "Tool Name" }
]} navigate={navigate} />
```

### Structured Data (JSON-LD) in every tool:
```html
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Tool Name",
  "url": "https://toolsrift.com/page#/tool/tool-id",
  "description": "...",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
})}</script>
```

### FAQ Schema (every tool with FAQ):
```html
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(([q, a]) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a }
  }))
})}</script>
```

---

## 5. Homepage Design Requirements

The homepage (`toolsrift-main.jsx` → `LandingPage` component) must be a **world-class, professional** landing page. Target quality: SmallSEOTools × Linear.app aesthetics.

### Phase 1 Homepage Sections (in order):

1. **Sticky Nav** — Logo + Theme Toggle + "All Tools" link (NO UsageCounter, NO Upgrade button)
2. **Hero** — Animated headline, typewriter tool cycling, terminal demo window, single CTA "Explore 544+ Free Tools →"
3. **Trust Bar** — Stats: 544+ Tools · 34 Categories · 100% Free · 0 Signup Required
4. **Tool Ticker** — Infinite scroll marquee rows (2 rows, opposite directions)
5. **Category Grid** — All 34 categories with icons, tool counts, hover animations
6. **Why ToolsRift** — 6 feature cards: Instant Results, 100% Private, Always Free, Works Everywhere, No Signup, SEO Optimized
7. **Popular Tools** — Spotlight grid of 9 most-used tools (all marked FREE, no PRO badges)
8. **How It Works** — 3 steps: Pick a Tool → Use Instantly → Done (no account needed)
9. **Final CTA** — "Start Using 544 Free Tools Right Now"
10. **Footer** — Category links + copyright

### Homepage Content Updates for Phase 1:
- Remove ALL references to "PRO", "Upgrade", "10 uses/day", "daily limit"
- Replace pricing section with "100% Free — Powered by Ads" section
- Stats box: change "0 Ads Ever" → show tool count stats instead
- Hero badge: "544+ Tools · Free Forever · No Signup"
- WHY card: update "Free Core Tools" → "Completely Free — All 544 tools, no limits, no sign-up ever"
- Add AdSense placeholder slots in the layout

---

## 6. Per-Page Requirements

Every page file (`pages/*.js`) MUST have:

1. ✅ Unique `<Head>` with title, description, OG tags, canonical URL
2. ✅ Dynamic import with `ssr: false` and loading fallback
3. ✅ Logo visible (rendered by component's SiteHeader or nav)
4. ✅ Breadcrumb showing path: Home → Category → Tool
5. ✅ Consistent dark theme (`#06090F` bg)
6. ✅ Blue accent `#3B82F6` (except business page: `#059669`)
7. ✅ Sora + Plus Jakarta Sans fonts
8. ✅ Footer with ToolsRift branding

---

## 7. Claude Code Prompts

Use these prompts in Claude Code (in this order) for the Phase 1 launch.

---

### PROMPT 1 — Remove All Pro/Subscription Gating (Free Everything)

```
You are working on the ToolsRift Next.js project. This is Phase 1: everything is free, 
no subscriptions. Complete all of the following tasks:

TASK 1 — lib/usage.js
Replace the entire file with a no-op version that never blocks:
- isLimitReached() → always returns false
- isPro() → always returns true (everyone is "pro" in phase 1)
- trackUse() → no-op
- getRemaining() → returns 999
- DAILY_LIMIT → set to 9999
- Keep the same exports so no import changes are needed elsewhere

TASK 2 — components/toolsrift-main.jsx
- Find every tool object with `pro: true` and change it to `pro: false`
- In ToolPage component, remove/comment the pro gate check:
  // PHASE 2: if (tool.pro && !isPro()) { setUpgradeReason('pro_tool'); ... }
  // PHASE 2: if (isLimitReached()) { setUpgradeReason('daily_limit'); ... }
- Remove <UsageCounter /> from the navbar (comment it out with // PHASE 2)
- Remove the "Upgrade to PRO" / pricing nav button, replace with:
  <Btn size="sm" variant="ghost" href="#/tools">All Tools</Btn>
- Remove <UpgradeModal> render (comment out with // PHASE 2)
- Remove all imports of trackUse, isLimitReached, isPro, getRemaining, DAILY_LIMIT 
  (comment them out with // PHASE 2)
- Add at the top: // PHASE 1: All tools free. Pro gating disabled. Re-enable in Phase 2.

TASK 3 — All other component files (toolsrift-*.jsx except main)
- Search for any pro gate patterns: isPro(), isLimitReached(), trackUse(), 
  <UpgradeModal>, <UsageCounter>
- Comment them out with // PHASE 2 comment
- If any tool has a "PRO" badge UI element, change badge text to "FREE"

TASK 4 — pages/pricing.js
- Replace the pricing page content with a simple "Coming Soon" page:
  - Keep same dark theme (#06090F background)
  - Show ToolsRift logo
  - Heading: "Pro Plans — Coming Soon"
  - Subtext: "All 544+ tools are completely free during our launch. Pro plans with advanced features will be available soon."
  - CTA button: "Browse Free Tools →" linking to /
  - Keep the <Head> with proper SEO meta tags

TASK 5 — Verify
After changes, grep for any remaining `isPro()` or `isLimitReached()` calls that are 
NOT commented out. Report all remaining instances.
```

---

### PROMPT 2 — Homepage Premium Redesign (Phase 1)

```
Redesign the LandingPage component in components/toolsrift-main.jsx for Phase 1 
(all free, ads-monetized). Keep the existing design system tokens (C/T objects, 
font families, animations). Make these specific changes:

NAVBAR (Phase 1):
- Remove <UsageCounter /> 
- Remove "Upgrade" button
- Add links: Tools | About (placeholder) | [ThemeBtn]
- Style: same sticky nav, logo on left

HERO SECTION:
- Badge text: "✨ 544+ Free Tools · No Signup · 100% In-Browser"
- H1 line 1: "Every Tool You Need."
- H1 line 2: "Completely Free."  (was "One Platform")
- Subtext: "544+ free online tools — calculators, PDF tools, image editors, code 
  formatters, SEO analyzers and more. Instant results, no account required."
- CTA button 1: "⚡ Explore 544+ Free Tools →" (keep existing indigo gradient style)
- CTA button 2: REMOVE "View PRO Plans" — replace with ghost button: 
  "📂 Browse by Category →" linking to #/category
- Terminal window: keep as-is (it's great)

STATS BAR (4 stats):
- 544+  |  Free Tools
- 34    |  Categories  
- 0     |  Sign-up Required
- 100%  |  In-Browser Processing
(Change icons: 🛠️ · 📂 · ✅ · ⚡)

WHY TOOLSRIFT SECTION — update card 3:
- Old: "🆓 Free Core Tools — 544+ tools free with no sign-up. PRO unlocks advanced..."
- New: "🆓 Always 100% Free — All 544+ tools completely free. No hidden limits, no 
  paywalls, no daily quotas. Powered by ads so you never pay."

POPULAR TOOLS / SPOTLIGHT:
- Remove all "PRO" badges from SPOTLIGHT array. All badges → "FREE"
- pdf-merger badge: change from "PRO" to "FREE"
- ai-writer: remove from spotlight, replace with "qr-code-gen" badge "FREE"

PRICING SECTION:
- REMOVE the two-column pricing cards entirely
- REPLACE with an "Ad-Supported & Always Free" section:

  Section heading: "Free, Forever"
  Subheading: "How do we keep it free?"
  
  Three cards side by side:
  Card 1: 🛠️ "544+ Free Tools" — "Every tool is free. No daily limits, 
           no paywalls, no sign-up required. Use as much as you need."
  Card 2: 📢 "Ad-Supported" — "ToolsRift is funded by non-intrusive display ads. 
           You get powerful tools; we keep the lights on. Fair deal."
  Card 3: 🔒 "Your Data Stays Local" — "All processing happens in your browser. 
           We never see your files, text, or data. Zero server uploads."
  
  Style: same card design as WHY section (T.surface background, border, hover lift)
  Colors: blue for card 1, yellow for card 2, green for card 3

HOW IT WORKS (new section — add after SPOTLIGHT):
  Heading: "How ToolsRift Works"
  Subheading: "Three steps. Zero friction."
  
  Step 1: 🔍 "Pick Your Tool" — Browse 34 categories or search for any tool
  Step 2: ⚡ "Use Instantly" — No download, no account. Works right in your browser
  Step 3: ✅ "Done in Seconds" — Copy, download, or share your results
  
  Style: horizontal 3-step layout with numbered badges, connector line on desktop

FINAL CTA:
- Update text: "Start Using 544 Free Tools — Right Now."
- Subtext: "No account. No install. No limits. Just open and use."
- Button: "🛠️ Browse All Free Tools →"

FOOTER:
- Update copyright: "© 2026 ToolsRift · Free online tools, powered by community & ads."
- Add footer links row: Text Tools · PDF Tools · Image Tools · JSON Tools · CSS Tools · 
  Calculators · Business · Dev Tools · More ↓
```

---

### PROMPT 3 — SEO Audit & Fix (Every Page)

```
Audit and fix SEO for all page files in the pages/ directory. 
For each page that is missing proper SEO, add it.

REQUIRED HEAD TAGS (add to every page file that's missing them):

pages/text.js:
<title>Free Text Tools — Word Counter, Case Converter, Lorem Ipsum & 40+ More | ToolsRift</title>
<meta name="description" content="45+ free online text tools. Word counter, character counter, case converter, lorem ipsum generator, readability checker, and more. Instant results, no signup." />

pages/encoders.js:
<title>Free Encoder & Decoder Tools — Base64, URL, HTML, JWT & More | ToolsRift</title>
<meta name="description" content="25+ free encoding and decoding tools. Base64, URL encode/decode, HTML entities, JWT decoder, hex converter and more. Works entirely in your browser." />

pages/hash.js:
<title>Free Hash Generator — MD5, SHA1, SHA256, SHA512 & More | ToolsRift</title>
<meta name="description" content="25+ free cryptographic hash and security tools. Generate MD5, SHA-1, SHA-256, HMAC hashes. Bcrypt generator, UUID generator and more." />

pages/json.js:
<title>Free JSON Tools — Formatter, Validator, Minifier, Converter | ToolsRift</title>
<meta name="description" content="25+ free JSON tools. Format, validate, minify, compare and convert JSON. JSON to CSV, YAML, XML converter. JSONPath tester and more." />

pages/css.js:
<title>Free CSS Generators — Gradient, Box Shadow, Border Radius & More | ToolsRift</title>
<meta name="description" content="20+ free CSS generator tools. Create CSS gradients, box shadows, border radius, animations, flexbox and grid layouts with live preview." />

pages/colors.js:
<title>Free Color Tools — Picker, Converter, Palette Generator | ToolsRift</title>
<meta name="description" content="20+ free color tools. HEX to RGB, HSL, CMYK converter. Color palette generator, gradient maker, contrast checker and accessibility tools." />

pages/units.js:
<title>Free Unit Converter — Length, Weight, Temperature & More | ToolsRift</title>
<meta name="description" content="25+ free unit conversion tools. Convert length, weight, temperature, speed, area, volume, time and more. Instant conversions with precision." />

pages/images.js:
<title>Free Image Tools — Resize, Compress, Convert & Edit Online | ToolsRift</title>
<meta name="description" content="50+ free online image tools. Resize, compress, crop, convert, flip and filter images. Works in your browser — no uploads to any server." />

pages/pdf.js:
<title>Free PDF Tools — Merge, Split, Compress & Convert PDFs | ToolsRift</title>
<meta name="description" content="28+ free online PDF tools. Merge PDFs, split pages, compress PDF files, convert PDF to text and more. 100% browser-based, no file uploads." />

pages/html.js:
<title>Free HTML Tools — Formatter, Minifier, Validator & Generator | ToolsRift</title>
<meta name="description" content="25+ free HTML tools. Format, minify, validate and convert HTML. HTML encoder/decoder, table generator, meta tag generator and more." />

pages/js.js:
<title>Free JavaScript Tools — Formatter, Minifier, Validator | ToolsRift</title>
<meta name="description" content="10+ free JavaScript tools. Format, minify, validate and obfuscate JavaScript code. JSON to JS object converter and more." />

pages/formatters.js:
<title>Free Code Formatters — CSS, SQL, XML, YAML, JSON & More | ToolsRift</title>
<meta name="description" content="25+ free code formatter tools. Format CSS, SQL, XML, YAML, Markdown and more. One-click code beautifiers for every language." />

pages/fancy.js:
<title>Free Fancy Text Generator — Bold, Italic, Cursive & Unicode Fonts | ToolsRift</title>
<meta name="description" content="20+ free fancy text generators. Create bold, italic, cursive, gothic, bubbles and 15+ Unicode text styles for Instagram, Twitter and more." />

pages/encoding.js:
<title>Free Text Encoding Tools — Morse Code, Binary, Caesar Cipher | ToolsRift</title>
<meta name="description" content="11+ free text encoding tools. Convert to/from Morse code, binary, octal, NATO alphabet, Caesar cipher, ROT13 and more." />

pages/generators.js:
<title>Free Generator Tools — Password, UUID, QR Code & More | ToolsRift</title>
<meta name="description" content="35+ free generator tools. Password generator, UUID generator, QR code generator, barcode generator, fake data generator and more." />

pages/generators2.js:
<title>Free Content Generators — Legal Docs, SVG Art, Ad Copy | ToolsRift</title>
<meta name="description" content="35+ free content generator tools. Privacy policy generator, terms of service, SVG pattern art, marketing copy generators and more." />

pages/devgen.js:
<title>Free Dev Config Generators — .gitignore, Dockerfile, nginx & More | ToolsRift</title>
<meta name="description" content="30+ free developer config generators. Create .gitignore, Dockerfile, nginx config, package.json, .env templates and more in seconds." />

pages/mathcalc.js:
<title>Free Math Calculators — Geometry, Algebra, Trigonometry & More | ToolsRift</title>
<meta name="description" content="35+ free math calculators. Solve geometry, algebra, trigonometry, matrix operations, number theory and statistics problems instantly." />

pages/financecalc.js:
<title>Free Finance & Health Calculators — EMI, TDEE, Tax & More | ToolsRift</title>
<meta name="description" content="35+ free finance and health calculators. EMI calculator, TDEE calculator, tax estimator, investment returns, calorie calculator and more." />

pages/converters2.js:
<title>Free Unit Converters — Electrical, Clothing Size, Paper & More | ToolsRift</title>
<meta name="description" content="20+ free specialty unit converters. Electrical units, clothing sizes, paper sizes, physical constants and more conversion tools." />

pages/devtools.js:
<title>Free Developer Tools — Regex Tester, Diff, JWT, Cron & More | ToolsRift</title>
<meta name="description" content="40+ free developer tools. Regex tester, JSON diff, JWT debugger, cron expression builder, chmod calculator, color scheme generator and more." />

pages/business.js:
<title>Free Business Tools — Invoice Generator, Resume Builder & More | ToolsRift</title>
<meta name="description" content="15+ free business tools. Invoice generator, receipt maker, resume builder, cover letter generator, SWOT analysis, UTM builder and more." />

RULES for every <Head> block:
1. Always include: title, description, og:title, og:description, og:url, og:site_name, twitter:card, canonical
2. og:url and canonical must use https://toolsrift.com/{page-slug}
3. og:site_name = "ToolsRift"
4. twitter:card = "summary_large_image"
5. Title format: "Free [Tool Category] — [Top Tools] | ToolsRift"
6. Description: 150-160 chars, includes tool count, key tools, and a privacy/speed hook
```

---

### PROMPT 4 — Breadcrumb & Logo on Every Tool Page

```
Ensure every tool page component in every toolsrift-*.jsx file has:

1. LOGO in the page header/nav
   Every component file must render a SiteHeader or inline nav at the top with:
   - ToolsRift logo: <img src="/logo.svg" alt="ToolsRift" style={{ height: 36 }} />
   - Wrapped in <a href="https://toolsrift.com"> for SEO
   - Same sticky nav style as toolsrift-main.jsx:
     background: 'rgba(6,9,15,0.85)', backdropFilter: 'blur(12px)',
     borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px',
     position: 'sticky', top: 0, zIndex: 100
   - Include: Home link, current section name, ThemeBtn toggle

2. BREADCRUMB on every tool page
   Every ToolPage render (or equivalent) must show a Breadcrumb above the tool:
   
   Pattern: Home > [Category Name] > [Tool Name]
   
   Example for a text tool:
   <nav aria-label="Breadcrumb" style={{ 
     display: 'flex', alignItems: 'center', gap: 6, 
     fontSize: 13, color: '#64748B', marginBottom: 16, flexWrap: 'wrap' 
   }}>
     <a href="https://toolsrift.com" style={{ color: '#64748B', textDecoration: 'none' }}>Home</a>
     <span>›</span>
     <a href="/text" style={{ color: '#64748B', textDecoration: 'none' }}>Text Tools</a>
     <span>›</span>
     <span style={{ color: '#94A3B8' }}>{currentToolName}</span>
   </nav>
   
   Also add BreadcrumbList JSON-LD schema for each tool:
   <script type="application/ld+json">{JSON.stringify({
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [
       { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
       { "@type": "ListItem", "position": 2, "name": "[Category]", "item": "https://toolsrift.com/[page]" },
       { "@type": "ListItem", "position": 3, "name": "[Tool Name]" }
     ]
   })}</script>

3. FOOTER on every component page
   Every toolsrift-*.jsx must have a SiteFooter component at the bottom:
   
   const SiteFooter = () => (
     <footer style={{ 
       borderTop: '1px solid rgba(255,255,255,0.05)', 
       padding: '28px 24px', textAlign: 'center',
       color: '#64748B', fontSize: 13 
     }}>
       <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 12 }}>
         {[['Home','/'],['Text Tools','/text'],['PDF Tools','/pdf'],['Image Tools','/images'],
           ['JSON Tools','/json'],['CSS Tools','/css'],['Dev Tools','/devtools'],
           ['Calculators','/#/category/calculator'],['Business','/business']].map(([n,h]) => (
           <a key={h} href={h} style={{ color: '#64748B', textDecoration: 'none' }}>{n}</a>
         ))}
       </div>
       <div>© 2026 ToolsRift · Free online tools, powered by ads.</div>
     </footer>
   );

4. CHECK LIST — verify every file has:
   [ ] Logo/nav at top
   [ ] Breadcrumb on tool pages
   [ ] Footer at bottom
   [ ] Consistent bg: #06090F
   [ ] Blue accent #3B82F6 (except business: #059669)
```

---

### PROMPT 5 — Functionality Audit (All Tools)

```
Audit all tool components in the ToolsRift project for functional correctness.
For each toolsrift-*.jsx file, check and fix the following:

CHECK 1 — Input/Output works
- Every tool must have at least one input and produce visible output
- Buttons must have onClick handlers that update state
- Results must render when state is set (not just console.log)
- No tool should show a blank output area after clicking calculate/generate

CHECK 2 — Copy buttons work
- Every CopyBtn component must call navigator.clipboard.writeText()
- Show a success state (✓ Copied) for 2 seconds after copying
- Handle clipboard permission errors gracefully (show error message)

CHECK 3 — File processing tools
- Image tools: must accept image input via <input type="file"> or drag-drop
- PDF tools: must accept PDF input and provide download
- File inputs must show file name after selection
- Download buttons must create blob URLs and trigger download

CHECK 4 — Calculators
- All numeric inputs must use type="number" or NumInput component
- Results must show immediately on input change (no submit button needed for simple calcs)
- Division by zero and edge cases must be handled (show "—" or error message)
- Currency/financial calculations must use toFixed(2) for display

CHECK 5 — Generators
- Password generator: must respect length, character set options
- UUID generator: must produce valid v4 UUIDs
- QR code: must generate actual QR image (use qrcode library or canvas API)
- Color palette: must show actual color swatches with hex values

CHECK 6 — Text processing tools
- All text tools must work on paste/type without needing a submit button
- Word counter: live update on input change
- Case converter: instant conversion on button click
- Results must be selectable/copyable

CHECK 7 — Pro tool checks
- Search for any UI element that says "PRO", "Upgrade", or shows a lock icon
- Remove all pro locks from Phase 1 — every tool must be fully functional

CHECK 8 — Error handling
- No tool should throw an unhandled JS error on empty input
- Invalid inputs should show friendly error messages (not crash the component)
- Network-dependent tools (currency converter, DNS lookup) must show offline fallback

For each issue found, fix it in-place. After fixing, list all changes made.
```

---

### PROMPT 6 — Ad Slots Integration

```
Add Google AdSense-compatible ad slot placeholders to the ToolsRift project.
These are placeholder divs that will be replaced with real AdSense code before launch.

ADD to components/toolsrift-main.jsx — above the tool grid in DashboardPage:
// AD SLOT: Top of category page
<div data-ad-slot="top-banner" style={{ 
  width: '100%', minHeight: 90, background: 'rgba(255,255,255,0.02)',
  border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#374151', fontSize: 11, marginBottom: 20, padding: '8px'
}}>
  {/* AdSense: data-ad-client="ca-pub-XXXX" data-ad-slot="XXXX" */}
</div>

ADD to every ToolPage render (below the tool result, above FAQ):
// AD SLOT: Mid-content (300x250)
<div data-ad-slot="mid-rectangle" style={{
  width: 300, minHeight: 250, margin: '24px auto',
  background: 'rgba(255,255,255,0.02)',
  border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#374151', fontSize: 11
}}>
  {/* AdSense: 300x250 Medium Rectangle */}
</div>

ADD to LandingPage — between Why section and Popular Tools:
// AD SLOT: Homepage leaderboard
<div data-ad-slot="homepage-leaderboard" style={{
  width: '100%', maxWidth: 728, minHeight: 90, margin: '0 auto 48px',
  background: 'rgba(255,255,255,0.02)',
  border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 8,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#374151', fontSize: 11
}}>
  {/* AdSense: 728x90 Leaderboard */}
</div>

IMPORTANT: These are placeholder divs. Do NOT add actual AdSense script tags yet.
AdSense will be enabled via _document.js after domain verification.
```

---

### PROMPT 7 — Pre-Launch Final Check

```
Run a complete pre-launch audit on the ToolsRift project. Check all of the following:

1. PRO GATING REMOVED
   grep -r "isLimitReached\|isPro\|pro: true\|UpgradeModal\|UsageCounter" --include="*.jsx" --include="*.js" .
   Any result NOT in a comment (// or /* */) is a bug. Fix all un-commented instances.

2. SEO HEAD TAGS
   For each file in pages/ (excluding _app.js, _document.js):
   - Check it has a <Head> block with title, description, canonical
   - List any missing. Add them if missing.

3. BREADCRUMBS
   grep -r "Breadcrumb\|breadcrumb" --include="*.jsx" .
   Every toolsrift-*.jsx should have a Breadcrumb component call.
   List files that don't have it.

4. LOGO/NAV
   grep -r "logo.svg" --include="*.jsx" .
   Every toolsrift-*.jsx should reference /logo.svg.
   List files that don't have it.

5. FOOTER
   grep -r "SiteFooter\|© 2026\|footer" --include="*.jsx" .
   Every toolsrift-*.jsx should have a footer.

6. NO CONSOLE ERRORS
   Check for obvious JS issues:
   - Missing closing tags
   - Undefined variables used in JSX
   - Missing key props on mapped arrays
   
7. BRAND CONSISTENCY
   grep -r "toolsrift.io\|NexTools\|CalsAndTools" --include="*.jsx" --include="*.js" .
   All brand references should be "ToolsRift" and domain "toolsrift.com". Fix any stale refs.

8. PRICING PAGE
   Confirm pages/pricing.js shows Phase 1 "Coming Soon" content, not the old Pro pricing.

9. ROBOTS.TXT
   Verify public/robots.txt allows all crawlers and references sitemap:
   User-agent: *
   Allow: /
   Sitemap: https://toolsrift.com/sitemap.xml

10. MANIFEST
    Verify public/site.webmanifest has correct name, short_name, and icon paths.

Output a checklist with PASS/FAIL for each item and list all files that need fixes.
```

---

## 8. Known Issues (from Audit Report)

These must be fixed before launch:

| Issue | Files | Fix |
|-------|-------|-----|
| Missing `<Head>` SEO tags | 14 page files | Use Prompt 3 above |
| Accent color mismatch | 4 component files | Change to `#3B82F6` (blue) |
| Missing typography tokens | `toolsrift-business.jsx` | Add Outfit/DM Sans font vars |
| Stale domain reference | `toolsrift-main.jsx` (BRAND) | Change `toolsrift.io` → `toolsrift.com` |
| Pro gating active | All files | Use Prompt 1 above |

---

## 9. Environment & Deployment

```bash
# Install
npm install

# Dev server
npm run dev

# Build (check for errors)
npm run build

# Deploy to Vercel
vercel --prod
```

### Vercel Config (vercel.json)
```json
{
  "regions": ["bom1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/(.*)\\.(svg|png|ico|woff2)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## 10. Phase 2 Checklist (Future — DO NOT implement now)

When ready for Phase 2 (Pro subscriptions):

- [ ] Re-enable `lib/usage.js` daily limit (DAILY_LIMIT = 10)
- [ ] Uncomment `isLimitReached()` / `isPro()` / `trackUse()` in all files
- [ ] Uncomment `<UpgradeModal>` and `<UsageCounter>`
- [ ] Add payment integration (Stripe / Razorpay for India)
- [ ] Add Pro features: AI Writer, advanced PDF tools, no ads
- [ ] Update homepage pricing section to show Free vs Pro plans ($12/month)
- [ ] Update `ALL_TOOLS` to re-mark `pdf-merger`, `dns-lookup`, `ai-writer` as `pro: true`
- [ ] Add Pro badge UI to locked tools

---

## 11. Key Patterns Cheat Sheet

### Adding a New Tool
```jsx
// 1. Add to ALL_TOOLS array:
{ id: "new-tool", name: "New Tool", catId: "text", pro: false }

// 2. Add to TOOL_META / TOOL_SEO:
"new-tool": { title: "...", desc: "...", faq: [...], howTo: "..." }

// 3. Add to TOOL_COMPONENTS:
"new-tool": () => <NewToolComponent />

// 4. Add to CATEGORIES toolCount++
```

### Navigation
```jsx
// Go to tool:       navigate("#/tool/word-counter")
// Go to category:   navigate("#/category/text")
// Go to home:       navigate("#/")
// External page:    <a href="/pdf"> (Next.js page)
```

### Component File Pattern
```jsx
// Every toolsrift-*.jsx file structure:
// 1. Imports (useState, useEffect, etc.)
// 2. const C = {} (color tokens)
// 3. const GLOBAL_CSS = `...` (animation CSS)
// 4. const T = {} (theme object)
// 5. Shared components (Btn, Card, Input, etc.)
// 6. function useAppRouter() {}
// 7. TOOL_META / TOOL_SEO object
// 8. Tool components
// 9. Page components (DashboardPage, ToolPage, etc.)
// 10. export default MainApp
```

---

*This document is the single source of truth for all Claude Code operations on ToolsRift Phase 1.*
