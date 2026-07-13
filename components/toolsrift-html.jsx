import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 1: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("html");
const PAGE_THEME = getCategoryById('html');
const BRAND = { name: "ToolsRift", tagline: "HTML Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  orange: "#F97316", orangeD: "#EA580C",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(249,115,22,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "orange" }) {
  const map = { orange:"rgba(249,115,22,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { orange:"#FB923C", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.orange, color:textMap[color]||textMap.orange, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.orange; const ACCENTD = C.orangeD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(249,115,22,0.25)` },
    secondary:{ background:"rgba(255,255,255,0.05)", color:C.text, border:`1px solid ${C.border}` },
    ghost:{ background:"transparent", color:C.muted },
    danger:{ background:"rgba(239,68,68,0.15)", color:"#FCA5A5" },
  }[variant];
  const props = { style:{...base,...sz,...v,...style}, onClick, disabled };
  if (href) return <a href={href} {...props}>{children}</a>;
  return <button {...props}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={} }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", ...style }}
      onFocus={e => e.target.style.borderColor=C.orange} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.orange} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", cursor:"pointer", ...style }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, ...style }}>{children}</div>;
}

function Label({ children }) {
  return <div style={{ ...T.label, marginBottom:6 }}>{children}</div>;
}

function Result({ children, mono=true }) {
  return (
    <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, minHeight:40, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
      {children}
    </div>
  );
}

function BigResult({ value, label }) {
  return (
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(249,115,22,0.08)", border:`1px solid rgba(249,115,22,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.orange }}>{value}</div>
      <div style={{ ...T.label, marginTop:4 }}>{label}</div>
    </div>
  );
}

function CopyBtn({ text, style={} }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
  };
  return (
    <Btn variant={copied?"secondary":"ghost"} size="sm" onClick={copy} style={style}>
      {copied ? "✓ Copied" : "Copy"}
    </Btn>
  );
}

function Grid2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>;
}

function Grid3({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>{children}</div>;
}

function VStack({ children, gap=12 }) {
  return <div style={{ display:"flex", flexDirection:"column", gap }}>{children}</div>;
}

function StatBox({ value, label }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 10px", textAlign:"center" }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.orange }}>{value}</div>
      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}

function useAppRouter() {
  const parse = () => {
    const h = window.location.hash || "#/";
    const path = h.replace(/^#/, "") || "/";
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return { page:"home" };
    if (parts[0]==="tool" && parts[1]) return { page:"tool", toolId:parts[1] };
    if (parts[0]==="category" && parts[1]) return { page:"home" };
    return { page:"home" };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => setRoute(parse());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const onClick = e => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      const h = a.getAttribute("href");
      if (h && h.startsWith("#/")) { e.preventDefault(); window.location.hash = h; }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return route;
}

const TOOLS = [
  // Formatter & Cleaner
  { id:"html-formatter", cat:"formatter", name:"HTML Formatter", desc:"Beautify and format messy HTML code with proper indentation and structure for better readability", icon:"✨", free:true },
  { id:"html-minifier", cat:"formatter", name:"HTML Minifier", desc:"Minify HTML by removing whitespace, comments, and unnecessary characters to reduce file size", icon:"🗜️", free:true },
  { id:"html-validator", cat:"formatter", name:"HTML Validator", desc:"Validate HTML structure, find syntax errors, unclosed tags, and invalid attributes instantly", icon:"✅", free:true },
  { id:"html-cleaner", cat:"formatter", name:"HTML Cleaner", desc:"Strip unwanted tags, inline styles, Word HTML junk, and clean up messy code automatically", icon:"🧹", free:true },
  { id:"html-compressor", cat:"formatter", name:"HTML Compressor", desc:"Compress HTML to reduce file size percentage with statistics on space saved", icon:"📦", free:true },

  // Converters
  { id:"html-to-text", cat:"converter", name:"HTML to Text", desc:"Strip all HTML tags and extract plain text content only from HTML markup", icon:"📝", free:true },
  { id:"html-to-markdown", cat:"converter", name:"HTML to Markdown", desc:"Convert HTML markup to clean Markdown syntax for documentation and content editing", icon:"⬇️", free:true },
  { id:"markdown-to-html", cat:"converter", name:"Markdown to HTML", desc:"Convert Markdown syntax to proper semantic HTML markup with formatting preserved", icon:"⬆️", free:true },
  { id:"html-to-jsx", cat:"converter", name:"HTML to JSX", desc:"Convert plain HTML to React JSX syntax with className, camelCase attributes, and proper structure", icon:"⚛️", free:true },
  { id:"html-entities-encode", cat:"converter", name:"HTML Entities Encoder", desc:"Encode special characters to HTML entities like &amp; &lt; &gt; &quot; for safe display", icon:"🔒", free:true },
  { id:"html-entities-decode", cat:"converter", name:"HTML Entities Decoder", desc:"Decode HTML entities back to readable characters and symbols from encoded text", icon:"🔓", free:true },
  { id:"html-to-pdf-preview", cat:"converter", name:"HTML Preview", desc:"Preview how HTML code renders in browser with live sandbox iframe visualization", icon:"👁️", free:true },
  { id:"html-table-to-csv", cat:"converter", name:"HTML Table to CSV", desc:"Convert pasted HTML table markup into CSV and JSON. Parses rows and cells, auto-escaping commas, quotes and newlines", icon:"🧾", free:true },
  { id:"html-nl2br", cat:"converter", name:"Newline to BR Converter", desc:"Convert plain-text line breaks into HTML <br> tags (nl2br), with an optional XHTML self-closing mode and a reverse br-to-newline mode", icon:"↵", free:true },
  { id:"html-data-uri", cat:"converter", name:"Text/SVG to Data URI", desc:"Encode text, SVG or CSS into a base64 or URL-encoded data URI you can embed inline in HTML or CSS with no external file", icon:"🔗", free:true },

  // Generators
  { id:"meta-tag-generator", cat:"generator", name:"Meta Tag Generator", desc:"Generate complete SEO meta tags including title, description, Open Graph, and Twitter Cards", icon:"🏷️", free:true },
  { id:"og-tag-generator", cat:"generator", name:"Open Graph Generator", desc:"Generate Open Graph and Twitter Card meta tags for social media sharing optimization", icon:"📱", free:true },
  { id:"html-table-generator", cat:"generator", name:"HTML Table Generator", desc:"Generate semantic HTML tables from rows and columns input with customizable styling", icon:"📊", free:true },
  { id:"html-list-generator", cat:"generator", name:"HTML List Generator", desc:"Generate ordered or unordered HTML lists from text input with proper markup structure", icon:"📋", free:true },
  { id:"html-color-codes", cat:"generator", name:"HTML Color Code Generator", desc:"Generate HTML color code snippets in hex, RGB, RGBA, and HSL formats with examples", icon:"🎨", free:true },
  { id:"html-link-generator", cat:"generator", name:"HTML Link Generator", desc:"Generate anchor tag with href, target, rel, title and all link attributes configured", icon:"🔗", free:true },
  { id:"html-image-tag", cat:"generator", name:"HTML Image Tag Generator", desc:"Generate img tag with src, alt, width, height, srcset, loading and all image attributes", icon:"🖼️", free:true },
  { id:"html-button-generator", cat:"generator", name:"HTML Button Generator", desc:"Generate styled HTML button code with classes, attributes, and event handlers", icon:"🔘", free:true },
  { id:"iframe-generator", cat:"generator", name:"iFrame Generator", desc:"Generate iframe embed code with src, width, height, sandbox, and all iframe options", icon:"📺", free:true },
  { id:"html-input-generator", cat:"generator", name:"HTML Input Generator", desc:"Generate form input fields with labels, types, validation, and accessibility attributes", icon:"📝", free:true },
  { id:"schema-json-ld-generator", cat:"generator", name:"Schema.org JSON-LD Generator", desc:"Build schema.org structured data JSON-LD for Article, Product, FAQPage, LocalBusiness, Organization and BreadcrumbList", icon:"🧬", free:true },
  { id:"html-boilerplate-generator", cat:"generator", name:"HTML5 Boilerplate Generator", desc:"Generate a complete HTML5 starter document with meta, Open Graph, Twitter cards, favicons and an optional CSS reset", icon:"📄", free:true },
  { id:"srcset-generator", cat:"generator", name:"Responsive Image Srcset Generator", desc:"Generate responsive img srcset and picture markup from a filename pattern, width list, sizes attribute and alt text", icon:"🌅", free:true },
  { id:"html-form-generator", cat:"generator", name:"HTML Form Generator", desc:"Build a complete HTML form with method, action, labelled input fields, textarea, select and a submit button from a simple field list", icon:"📮", free:true },
  { id:"html-select-generator", cat:"generator", name:"HTML Select Dropdown Generator", desc:"Generate a select dropdown with option tags from one line per option, supporting value|label pairs, a name and multiple attribute", icon:"🔽", free:true },
  { id:"html-video-tag", cat:"generator", name:"HTML Video Tag Generator", desc:"Generate an HTML5 video tag with controls, poster, autoplay, loop, muted and multiple source formats plus a caption track", icon:"🎬", free:true },
  { id:"html-audio-tag", cat:"generator", name:"HTML Audio Tag Generator", desc:"Generate an HTML5 audio element with controls, autoplay, loop, muted, preload and multiple MP3/OGG/WAV source fallbacks", icon:"🎵", free:true },
  { id:"html-figure-generator", cat:"generator", name:"HTML Figure & Caption Generator", desc:"Generate a semantic figure element wrapping an image with a figcaption, ideal for accessible captioned images and diagrams", icon:"🖼️", free:true },
  { id:"html-details-accordion", cat:"generator", name:"HTML Details Accordion Generator", desc:"Generate native details/summary accordion markup from title and content blocks, with an optional open-by-default first item", icon:"📂", free:true },
  { id:"html-definition-list", cat:"generator", name:"HTML Definition List Generator", desc:"Turn term: definition lines into a semantic dl with dt and dd elements for glossaries, metadata and FAQ-style content", icon:"📖", free:true },
  { id:"html-semantic5-wrapper", cat:"generator", name:"HTML5 Semantic Layout Generator", desc:"Generate a semantic HTML5 page skeleton with header, nav, main, article, aside, section and footer landmark elements", icon:"🏛️", free:true },
  { id:"html-blockquote-generator", cat:"generator", name:"HTML Blockquote Generator", desc:"Generate a semantic blockquote with an optional cite URL and a figcaption author attribution for quotes and testimonials", icon:"❝", free:true },
  { id:"html-nav-menu-generator", cat:"generator", name:"HTML Nav Menu Generator", desc:"Build an accessible nav menu of anchor links from label|url lines, wrapped in nav and an unordered list for site navigation", icon:"🧭", free:true },

  // Tools & Utilities
  { id:"html-tag-counter", cat:"tools", name:"HTML Tag Counter", desc:"Count how many of each HTML tag exists in your code with detailed statistics breakdown", icon:"🔢", free:true },
  { id:"html-attribute-extractor", cat:"tools", name:"HTML Attribute Extractor", desc:"Extract all attributes from specific HTML elements and list their names and values", icon:"🔍", free:true },
  { id:"html-comment-remover", cat:"tools", name:"HTML Comment Remover", desc:"Remove all HTML comments from code including multi-line and conditional comments", icon:"💬", free:true },
  { id:"html-attribute-remover", cat:"tools", name:"HTML Attribute Remover", desc:"Strip every attribute from all HTML tags at once, leaving only bare element names, or remove only a named attribute like class or style", icon:"🧼", free:true },
  { id:"html-char-entity-finder", cat:"tools", name:"HTML Character Entity Finder", desc:"Scan text for special and non-ASCII characters and list their named, decimal and hexadecimal HTML entity codes for safe encoding", icon:"🔣", free:true },
];

const CATEGORIES = [
  { id:"formatter", name:"Formatter & Cleaner", icon:"✨", desc:"Format, validate, minify and clean HTML code" },
  { id:"converter", name:"Converters", icon:"🔄", desc:"Convert between HTML, text, Markdown, JSX and entities" },
  { id:"generator", name:"Generators", icon:"🛠️", desc:"Generate HTML tags, meta tags, tables, lists and elements" },
  { id:"tools", name:"Tools & Utilities", icon:"🔧", desc:"HTML analysis, extraction and manipulation utilities" },
];

const TOOL_META = {
  "html-formatter": {
    title: "Free HTML Formatter – Beautify HTML Code Online | ToolsRift",
    desc: "Format and beautify messy HTML with proper indentation. Clean up unreadable HTML code with our free online formatter. Instant results, no signup required.",
    faq: [
      ["How does the HTML formatter work?", "The formatter parses your HTML and rebuilds it with proper indentation (2 spaces per level), line breaks between elements, and consistent formatting. It preserves your content while making the structure readable."],
      ["Will formatting change my HTML output?", "No, formatting only affects whitespace and indentation. The rendered output in a browser will be identical. Only the source code readability is improved."],
      ["Can it format inline JavaScript and CSS?", "The tool formats HTML structure. Inline JavaScript and CSS are preserved as-is. For best results, use dedicated JavaScript and CSS formatters for embedded code."]
    ]
  },
  "html-minifier": {
    title: "Free HTML Minifier – Minify HTML Code Online | ToolsRift",
    desc: "Minify HTML by removing whitespace, comments and line breaks. Reduce file size for faster page load. Free HTML compression tool with before/after stats.",
    faq: [
      ["What does HTML minification remove?", "Minification removes unnecessary whitespace, line breaks, comments, and optional closing tags where allowed by HTML5 spec. It creates the smallest valid HTML output."],
      ["How much file size reduction can I expect?", "Typical reduction is 10-30% depending on code style. HTML with lots of comments and indentation compresses more. The tool shows exact before/after byte counts."],
      ["Is minified HTML still valid?", "Yes, minified HTML is fully valid and renders identically to formatted HTML. Minification only removes redundant characters that don't affect parsing or display."]
    ]
  },
  "html-validator": {
    title: "Free HTML Validator – Check HTML Errors Online | ToolsRift",
    desc: "Validate HTML structure and find syntax errors. Check for unclosed tags, invalid attributes, and markup issues. Instant HTML validation with error details.",
    faq: [
      ["What validation errors does it catch?", "The validator checks for unclosed tags, mismatched tags, invalid nesting, missing required attributes, duplicate IDs, and common syntax errors."],
      ["Does it validate HTML5?", "Yes, the validator supports HTML5 elements and attributes. It checks against modern HTML standards while flagging deprecated elements."],
      ["Can it validate partial HTML snippets?", "Yes, you can validate fragments like a single div or component. The validator will note missing document structure but check the fragment syntax."]
    ]
  },
  "html-cleaner": {
    title: "Free HTML Cleaner – Remove Junk from HTML Code | ToolsRift",
    desc: "Clean messy HTML by removing unwanted tags, inline styles, and Word HTML junk. Strip formatting and get clean semantic markup instantly.",
    faq: [
      ["What does the HTML cleaner remove?", "It removes inline styles, class attributes, data attributes, empty tags, Word HTML artifacts (like mso- classes), and other specified junk while preserving content and structure."],
      ["Can I choose what to remove?", "Yes, you can selectively clean inline styles, remove specific tags, strip attributes, or remove all formatting while keeping semantic structure."],
      ["Is the cleaned HTML still formatted?", "The cleaner focuses on removing unwanted attributes and tags. Use the HTML Formatter afterward if you want properly indented output."]
    ]
  },
  "html-compressor": {
    title: "Free HTML Compressor – Reduce HTML File Size | ToolsRift",
    desc: "Compress HTML to reduce file size with statistics. Remove whitespace and comments to optimize web pages for faster loading and better performance.",
    faq: [
      ["What's the difference between minify and compress?", "They're similar—both remove whitespace and comments. Compression typically includes additional optimizations like removing optional quotes and combining inline styles."],
      ["Will compression break my HTML?", "No, compression only removes redundant characters. The HTML remains valid and renders identically. All content, structure, and functionality are preserved."],
      ["Should I compress HTML in production?", "Yes, compressed HTML loads faster and reduces bandwidth. Most build tools and CDNs compress HTML automatically, but this tool is useful for manual optimization or testing."]
    ]
  },
  "html-to-text": {
    title: "Free HTML to Text Converter – Strip HTML Tags Online | ToolsRift",
    desc: "Convert HTML to plain text by removing all tags. Extract clean text content from HTML markup. Perfect for content extraction and text analysis.",
    faq: [
      ["Does it preserve line breaks?", "Yes, block elements like <p>, <div>, and <br> are converted to line breaks. The output is formatted plain text, not a single continuous line."],
      ["What happens to links and images?", "Links are converted to their text content. Images are either removed or represented by their alt text if you choose to preserve it."],
      ["Can it extract text from complex HTML?", "Yes, the tool recursively processes all nested elements and extracts all text content, making it useful for scraping or analyzing HTML documents."]
    ]
  },
  "html-to-markdown": {
    title: "Free HTML to Markdown Converter – Convert HTML to MD | ToolsRift",
    desc: "Convert HTML to Markdown syntax online. Transform HTML markup to clean Markdown for documentation, GitHub, and content management systems.",
    faq: [
      ["What HTML elements are converted?", "Headings, paragraphs, lists, links, images, bold, italic, code blocks, and blockquotes are converted to equivalent Markdown syntax."],
      ["Does it handle complex HTML?", "The converter works best with semantic HTML. Complex layouts, tables, and styling may not translate perfectly to Markdown's simpler syntax."],
      ["Can I convert back to HTML?", "Yes, use our Markdown to HTML tool to convert back. Markdown is designed to be reversible, though some HTML details may be lost in conversion."]
    ]
  },
  "markdown-to-html": {
    title: "Free Markdown to HTML Converter – Convert MD to HTML | ToolsRift",
    desc: "Convert Markdown to HTML markup online. Transform Markdown syntax to semantic HTML with proper tags and structure for web publishing.",
    faq: [
      ["What Markdown syntax is supported?", "Standard Markdown including headings (#), lists (- *), links ([]()), images (![]()), code (`), blockquotes (>), and emphasis (* _) is fully supported."],
      ["Does it support GitHub Flavored Markdown?", "Yes, features like tables, strikethrough (~~), task lists (- [ ]), and fenced code blocks (```) are supported."],
      ["Is the HTML output styled?", "The output is semantic HTML without styling. Add your own CSS or use it with a Markdown CSS framework for styled output."]
    ]
  },
  "html-to-jsx": {
    title: "Free HTML to JSX Converter – Convert HTML to React | ToolsRift",
    desc: "Convert HTML to React JSX syntax online. Transform class to className, style attributes to objects, and HTML to React-compatible JSX code.",
    faq: [
      ["What changes are made for JSX?", "The converter changes 'class' to 'className', 'for' to 'htmlFor', converts style strings to style objects, changes event names to camelCase (onclick → onClick), and self-closes void elements."],
      ["Does it handle inline styles?", "Yes, inline style attributes are converted from CSS strings to JavaScript objects with camelCase properties (background-color → backgroundColor)."],
      ["Can I use the output directly in React?", "Yes, the output is valid JSX that can be used directly in React components. You may need to wrap it in a component function and handle dynamic data separately."]
    ]
  },
  "html-entities-encode": {
    title: "Free HTML Entities Encoder – Encode HTML Special Characters | ToolsRift",
    desc: "Encode special characters to HTML entities. Convert &, <, >, quotes to &amp; &lt; &gt; &quot; for safe HTML display and XSS prevention.",
    faq: [
      ["Why encode HTML entities?", "Encoding prevents special characters from being interpreted as HTML tags. It's essential for displaying user input safely and preventing XSS attacks."],
      ["What characters are encoded?", "Common encodings: & → &amp;, < → &lt;, > → &gt;, \" → &quot;, ' → &#39;. Extended encoding includes accented characters and symbols."],
      ["When should I use entity encoding?", "Always encode user input before displaying it in HTML. Use it when you want to show HTML code as text rather than rendering it."]
    ]
  },
  "html-entities-decode": {
    title: "Free HTML Entities Decoder – Decode HTML Entities Online | ToolsRift",
    desc: "Decode HTML entities to readable characters. Convert &amp; &lt; &gt; &quot; back to &, <, >, quotes. Reverse HTML entity encoding instantly.",
    faq: [
      ["What entities can be decoded?", "All named entities (&amp; &lt; &nbsp; etc.) and numeric entities (&#39; &#8217;) are decoded to their character equivalents."],
      ["Is decoding safe?", "Decoding is safe for display as text. Be cautious inserting decoded content into HTML—it may contain tags or scripts. Always re-encode user content."],
      ["Why is my text showing entities?", "Sometimes HTML is double-encoded or displayed as text. This tool decodes entities so you can read or edit the actual content."]
    ]
  },
  "html-to-pdf-preview": {
    title: "Free HTML Preview Tool – Render HTML Code Online | ToolsRift",
    desc: "Preview how HTML renders in browser with live sandbox. View HTML code output instantly in isolated iframe. Test HTML snippets safely.",
    faq: [
      ["How does the preview work?", "Your HTML is rendered in an iframe with sandbox restrictions. It shows how the markup displays but blocks scripts and external resources for security."],
      ["Can I preview JavaScript and CSS?", "Inline CSS works. JavaScript is blocked by the sandbox for security. For full preview with JS, use a dedicated code playground like CodePen."],
      ["Is the preview accurate?", "The preview uses your browser's rendering engine, so it's accurate for HTML and CSS. Some features may be restricted by iframe sandbox security."]
    ]
  },
  "meta-tag-generator": {
    title: "Free Meta Tag Generator – Create SEO Meta Tags | ToolsRift",
    desc: "Generate complete SEO meta tags for HTML. Create title, description, Open Graph, Twitter Card, and viewport meta tags with optimized templates.",
    faq: [
      ["What meta tags should every page have?", "Essential tags: title, description, viewport, charset, and Open Graph tags for social sharing. These improve SEO, accessibility, and social media previews."],
      ["What's the ideal meta description length?", "150-160 characters is ideal for Google search results. Longer descriptions may be truncated. Include your primary keyword and a clear value proposition."],
      ["Do I need both Open Graph and Twitter Cards?", "Twitter falls back to Open Graph if Twitter Card tags are missing, but providing both ensures optimal previews on all social platforms."]
    ]
  },
  "og-tag-generator": {
    title: "Free Open Graph Tag Generator – Create OG Meta Tags | ToolsRift",
    desc: "Generate Open Graph and Twitter Card meta tags for social media sharing. Create optimized og:image, og:title, og:description tags instantly.",
    faq: [
      ["What are Open Graph tags?", "Open Graph tags control how your page appears when shared on Facebook, LinkedIn, and other social platforms. They define the title, description, and image for social previews."],
      ["What image size should I use for og:image?", "1200×630 pixels is the recommended size for og:image. This works well across all social platforms. Use JPG or PNG format under 5MB."],
      ["How do I test my Open Graph tags?", "Use Facebook's Sharing Debugger, Twitter's Card Validator, or LinkedIn's Post Inspector to see how your tags render and debug issues."]
    ]
  },
  "html-table-generator": {
    title: "Free HTML Table Generator – Create HTML Tables Online | ToolsRift",
    desc: "Generate semantic HTML tables from rows and columns. Create responsive tables with thead, tbody, and customizable attributes. Copy table markup instantly.",
    faq: [
      ["How do I specify table content?", "Enter the number of rows and columns, then fill in cell content. The tool generates proper table structure with <thead>, <tbody>, <th>, and <td> tags."],
      ["Can I add CSS classes to the table?", "Yes, you can add custom classes, IDs, and attributes to the table and cells for styling with your CSS framework."],
      ["How do I make tables responsive?", "Wrap the generated table in a <div class='table-responsive'> (Bootstrap) or use CSS techniques like horizontal scroll on mobile."]
    ]
  },
  "html-list-generator": {
    title: "Free HTML List Generator – Create UL OL Lists Online | ToolsRift",
    desc: "Generate ordered or unordered HTML lists from text. Convert line-separated items to proper <ul> <ol> <li> markup with nesting support.",
    faq: [
      ["How do I create nested lists?", "Indent lines with spaces or tabs to create nested list items. The generator will create proper nested <ul> or <ol> structure based on indentation."],
      ["What's the difference between <ul> and <ol>?", "<ul> creates bulleted (unordered) lists. <ol> creates numbered (ordered) lists. Use <ol> when sequence matters, <ul> for general lists."],
      ["Can I mix ordered and unordered lists?", "Yes, you can nest <ol> inside <ul> and vice versa. Specify the type for each nesting level if your tool supports mixed lists."]
    ]
  },
  "html-color-codes": {
    title: "Free HTML Color Code Generator – Get Color Codes | ToolsRift",
    desc: "Generate HTML color code snippets in hex, RGB, RGBA, and HSL formats. Create color declarations with examples and copy-ready code.",
    faq: [
      ["What color formats are available?", "The tool generates hex (#FF5733), RGB (rgb(255,87,51)), RGBA (with alpha transparency), and HSL (hue, saturation, lightness) formats."],
      ["When should I use RGBA vs hex?", "Use hex for solid colors (most common). Use RGBA when you need transparency/opacity control. HSL is useful for programmatic color manipulation."],
      ["Can I get the color from an image?", "This tool generates code for known colors. Use our Color Picker tool to extract colors from images, then use this tool to get the code in all formats."]
    ]
  },
  "html-link-generator": {
    title: "Free HTML Link Generator – Create Anchor Tags Online | ToolsRift",
    desc: "Generate HTML anchor tags with href, target, rel, title attributes. Create links with proper nofollow, noopener, noreferrer configuration.",
    faq: [
      ["What's the target attribute for?", "target='_blank' opens links in new tab. target='_self' (default) opens in same tab. Always use rel='noopener noreferrer' with _blank for security."],
      ["When should I use rel='nofollow'?", "Use nofollow for untrusted links, ads, or paid links. It tells search engines not to pass SEO value to the linked page."],
      ["What's the title attribute?", "The title attribute provides tooltip text on hover. Use it to give additional context, but don't rely on it for critical information (accessibility)."]
    ]
  },
  "html-image-tag": {
    title: "Free HTML Image Tag Generator – Create IMG Tags | ToolsRift",
    desc: "Generate HTML img tags with src, alt, width, height, srcset, loading attributes. Create responsive images with lazy loading and accessibility.",
    faq: [
      ["Why is the alt attribute important?", "Alt text describes images for screen readers (accessibility) and shows if the image fails to load. It's also important for SEO. Always include descriptive alt text."],
      ["What is lazy loading?", "loading='lazy' defers loading images until they're near the viewport. This improves initial page load speed. Use it for images below the fold."],
      ["How do I make images responsive?", "Add width and height attributes to prevent layout shift. Use CSS like max-width:100%; height:auto; to make images scale. Use srcset for multiple resolutions."]
    ]
  },
  "html-button-generator": {
    title: "Free HTML Button Generator – Create Button Code | ToolsRift",
    desc: "Generate styled HTML button code with classes, type, attributes, and event handlers. Create submit, reset, and button elements instantly.",
    faq: [
      ["What's the difference between <button> and <input type='button'>?", "<button> is more flexible—it can contain HTML (icons, text). <input type='button'> only has a value attribute. Use <button> for modern web development."],
      ["What button type should I use?", "type='submit' for form submission, type='reset' to clear forms, type='button' for JavaScript actions. Always specify type to prevent unexpected form submission."],
      ["How do I style buttons?", "Add class attributes for CSS frameworks (Bootstrap, Tailwind) or custom classes. Use CSS to style background, padding, border, and hover states."]
    ]
  },
  "iframe-generator": {
    title: "Free iFrame Generator – Create HTML Embed Code | ToolsRift",
    desc: "Generate iframe embed code with src, width, height, sandbox, allowfullscreen options. Create secure iframe embeds for videos and external content.",
    faq: [
      ["What is the sandbox attribute?", "sandbox restricts iframe capabilities for security. It can block scripts, forms, popups, etc. Use sandbox='allow-scripts allow-same-origin' for trusted content."],
      ["How do I make iframes responsive?", "Wrap the iframe in a div with padding-bottom percentage (e.g., 56.25% for 16:9). Use position:absolute on iframe and position:relative on wrapper."],
      ["When should I use iframes?", "Use iframes for embedding external content like YouTube videos, maps, or third-party widgets. Avoid for same-site content—use AJAX or includes instead."]
    ]
  },
  "html-input-generator": {
    title: "Free HTML Input Generator – Create Form Fields | ToolsRift",
    desc: "Generate HTML input fields with labels, types, validation, and accessibility attributes. Create text, email, password, checkbox, radio inputs.",
    faq: [
      ["What input types are available?", "HTML5 input types: text, email, password, number, tel, url, date, time, color, file, checkbox, radio, range, and more. Each has built-in validation."],
      ["Why use labels with inputs?", "Labels improve accessibility (screen readers) and UX (click label to focus input). Always use <label for='inputId'> paired with <input id='inputId'>."],
      ["What validation attributes should I use?", "Use required for mandatory fields, pattern for regex validation, min/max for numbers/dates, and maxlength for text. HTML5 validation runs before form submission."]
    ]
  },
  "html-tag-counter": {
    title: "Free HTML Tag Counter – Count HTML Elements | ToolsRift",
    desc: "Count how many of each HTML tag exists in your code. Get detailed statistics breakdown of all elements, attributes, and document structure.",
    faq: [
      ["What does the tag counter show?", "It counts every HTML element (div, p, span, etc.), shows frequency of each tag, total elements, and can identify most common tags in your markup."],
      ["Why count HTML tags?", "Useful for analyzing document structure, finding overused elements (excessive divs), checking semantic markup, and understanding HTML complexity."],
      ["Can it detect invalid tags?", "The counter lists all tags found, including invalid ones. Use the HTML Validator to check for invalid tags and syntax errors."]
    ]
  },
  "html-attribute-extractor": {
    title: "Free HTML Attribute Extractor – Extract Tag Attributes | ToolsRift",
    desc: "Extract all attributes from HTML elements. List attribute names and values from specific tags for analysis and data extraction.",
    faq: [
      ["How do I specify which tag to extract from?", "Enter the tag name (like 'a', 'img', 'div') and the tool will find all instances and extract their attributes like href, src, class, id, etc."],
      ["What can I do with extracted attributes?", "Use it to audit link hrefs, find all image sources, extract data attributes, collect IDs and classes, or analyze attribute usage across your HTML."],
      ["Can it extract from multiple tags at once?", "The tool processes one tag type at a time. Run it multiple times for different tags, or extract all tags and filter the results."]
    ]
  },
  "html-comment-remover": {
    title: "Free HTML Comment Remover – Strip HTML Comments | ToolsRift",
    desc: "Remove all HTML comments from code including multi-line and conditional comments. Clean up HTML by deleting <!-- --> comment blocks.",
    faq: [
      ["Does it remove conditional comments?", "Yes, it removes all comments including IE conditional comments (<!--[if IE]>). Be careful if you rely on conditional comments for legacy browser support."],
      ["Are comments bad for production?", "Comments increase file size and may expose information. Remove them in production builds. Keep them in source code for documentation."],
      ["Will it break my code?", "No, removing comments only deletes text between <!-- and -->. It doesn't affect HTML structure, scripts, or functionality."]
    ]
  },
  "html-table-to-csv": {
    title: "Free HTML Table to CSV Converter – Table to CSV & JSON | ToolsRift",
    desc: "Convert HTML table markup to CSV and JSON online. Paste any <table>, extract rows and cells, and download clean comma-separated or JSON data instantly.",
    howTo: "Paste your HTML table markup (including the <table> tag) into the input box, then click Convert. Copy the generated CSV or JSON array-of-objects. The first row is used as column headers for the JSON output.",
    faq: [
      ["How does it handle commas inside cells?", "Cells containing a comma, double-quote, or line break are automatically wrapped in double quotes, and any inner double-quotes are escaped by doubling them (\" becomes \"\"), following the standard CSV/RFC 4180 rules."],
      ["What is the JSON output format?", "The JSON is an array of objects. The first table row is treated as the header, so each following row becomes an object keyed by those header names. Empty headers fall back to column1, column2, etc."],
      ["Does it support colspan and rowspan?", "The parser walks each <tr> and reads every <th>/<td> in order, so merged cells using colspan or rowspan are not expanded to fill the spanned positions. Each cell maps to a single CSV/JSON field."]
    ]
  },
  "schema-json-ld-generator": {
    title: "Free Schema.org JSON-LD Generator – Structured Data Tool | ToolsRift",
    desc: "Generate schema.org JSON-LD structured data for Article, Product, FAQPage, LocalBusiness, Organization and BreadcrumbList. Copy a ready-to-paste script tag for rich results.",
    howTo: "Choose a schema type, fill in the relevant fields (add multiple rows for FAQ questions or breadcrumb items), then click Generate. Copy the <script type=\"application/ld+json\"> block and paste it into the <head> of your page.",
    faq: [
      ["What is JSON-LD structured data?", "JSON-LD is the format Google recommends for structured data. It describes your page's content (an article, product, FAQ, business, etc.) so search engines can show rich results like star ratings, FAQ dropdowns and breadcrumbs."],
      ["Which schema types are supported?", "Article, Product (with offers/price), FAQPage, LocalBusiness (with postal address), Organization and BreadcrumbList. Each type shows only the fields relevant to it."],
      ["Where do I place the generated code?", "Paste the entire <script type=\"application/ld+json\"> block into the <head> of your HTML page. You can validate it afterward with Google's Rich Results Test or the Schema Markup Validator."]
    ]
  },
  "html-boilerplate-generator": {
    title: "Free HTML5 Boilerplate Generator – Starter Template | ToolsRift",
    desc: "Generate a complete HTML5 boilerplate document with charset, viewport, meta description, Open Graph, Twitter cards, favicons and a modern CSS reset. Copy or download index.html.",
    howTo: "Set your page title, description and language, then toggle the sections you want (Open Graph, Twitter card, favicons, CSS reset) and add any stylesheet or script paths. The full document builds live. Copy it or download it as an .html file.",
    faq: [
      ["What is an HTML boilerplate?", "A boilerplate is the minimal, correct starting structure every HTML5 page needs: the doctype, html/head/body tags, charset, viewport and title. This tool builds that skeleton plus optional SEO and social tags."],
      ["What does the CSS reset do?", "The optional reset applies sensible defaults, box-sizing: border-box, removes default margins, sets a base line-height, and makes images block-level and responsive, so your styling starts from a predictable baseline across browsers."],
      ["Why include Open Graph and Twitter tags?", "Open Graph and Twitter Card meta tags control how your page looks when shared on social media, defining the title, description and preview image. They are optional here and only added when you enable them."]
    ]
  },
  "srcset-generator": {
    title: "Free Responsive Image Srcset Generator – img & picture | ToolsRift",
    desc: "Generate responsive image markup online. Build an img srcset with width descriptors and a picture element with AVIF/WebP sources from a filename pattern and width list.",
    howTo: "Enter a filename pattern using {w} as the width placeholder (e.g. image-{w}.jpg), list your target widths, set the sizes attribute and alt text. The img and picture markup update live for you to copy.",
    faq: [
      ["What does the {w} placeholder do?", "The {w} token in your filename pattern is replaced by each width you list. For example image-{w}.jpg with widths 320 and 640 produces image-320.jpg and image-640.jpg in the srcset."],
      ["What is the difference between the img and picture output?", "The img version uses one srcset with width descriptors so the browser picks a size. The picture version adds <source> elements offering a modern format (AVIF or WebP) with a fallback for browsers that don't support it."],
      ["What should the sizes attribute contain?", "sizes tells the browser how wide the image will render at different breakpoints, e.g. (max-width: 600px) 100vw, 600px. The browser uses it with srcset to choose the most appropriate file before layout."]
    ]
  },
  "html-nl2br": {
    title: "Free Newline to BR Converter – nl2br Online Tool | ToolsRift",
    desc: "Convert plain-text line breaks to HTML <br> tags online. PHP nl2br equivalent with optional XHTML self-closing mode and a reverse br-to-newline direction.",
    faq: [
      ["What does nl2br do?", "It replaces every newline character (\\n, \\r or \\r\\n) in your text with an HTML <br> tag so line breaks survive when the text is rendered inside HTML, mirroring PHP's nl2br() function."],
      ["What is XHTML mode?", "XHTML and self-closing HTML require void elements to be closed, so XHTML mode outputs <br /> with a trailing slash instead of <br>. Standard HTML5 accepts either form."],
      ["Can it convert <br> back to newlines?", "Yes, switch to reverse mode to turn <br>, <br/> and <br /> tags back into plain newline characters, which is handy when cleaning HTML into editable plain text."]
    ]
  },
  "html-data-uri": {
    title: "Free Text/SVG to Data URI Generator – Base64 & URL | ToolsRift",
    desc: "Encode text, SVG or CSS to a data URI online. Generate base64 or URL-encoded data: URIs to embed assets inline in HTML and CSS with no external requests.",
    faq: [
      ["What is a data URI?", "A data URI embeds a file's contents directly in a URL using the data: scheme, so small assets like SVG icons can live inline in HTML or CSS without a separate network request."],
      ["Base64 or URL-encoding — which should I use?", "Base64 works for any content but adds about 33% size. For SVG, URL-encoding is often smaller and stays human-readable, so this tool generates both and you pick whichever is shorter."],
      ["Is the encoding done in my browser?", "Yes. Encoding uses your browser's built-in UTF-8-safe base64 and URL encoding entirely on the client, so your text or SVG is never uploaded to any server."]
    ]
  },
  "html-form-generator": {
    title: "Free HTML Form Generator – Build Form Markup Online | ToolsRift",
    desc: "Generate a complete HTML form online with method, action, labelled inputs, textarea, select and submit button. Copy accessible, ready-to-style form markup instantly.",
    faq: [
      ["What field types can I add?", "Add text, email, password, number, tel, url, date, textarea and select fields. Each field is generated with a matching <label> tied to the input id for accessibility."],
      ["What is the difference between GET and POST?", "GET appends form data to the URL and suits searches and idempotent requests. POST sends data in the request body and is used for logins, sign-ups and anything that changes data."],
      ["Is the generated form accessible?", "Every field is paired with a <label for> matching the input id, which lets screen readers announce the field and lets users click the label to focus the input."]
    ]
  },
  "html-select-generator": {
    title: "Free HTML Select Dropdown Generator – Option Tags | ToolsRift",
    desc: "Generate an HTML select dropdown online from one option per line. Supports value|label pairs, a name attribute, multiple select and a placeholder option. Copy instantly.",
    faq: [
      ["How do I set a different value and label?", "Write each line as value|label, for example us|United States. The text before the pipe becomes the option value and the text after becomes the visible label. A line with no pipe uses the same text for both."],
      ["What does the multiple attribute do?", "Adding multiple lets users select more than one option, and the control renders as a scrolling list box instead of a single-choice dropdown."],
      ["What is a placeholder option?", "An optional disabled, selected first option (like Choose one…) prompts the user without being a valid submittable value, improving form usability."]
    ]
  },
  "html-video-tag": {
    title: "Free HTML5 Video Tag Generator – Embed Video Code | ToolsRift",
    desc: "Generate an HTML5 <video> tag online with controls, poster, autoplay, loop, muted and multiple source formats plus captions. Copy responsive self-hosted video markup.",
    faq: [
      ["Why add multiple source elements?", "Different browsers support different codecs, so offering MP4, WebM and OGG sources lets each browser pick a format it can play, maximising compatibility from one <video> tag."],
      ["Why does autoplay usually need muted?", "Most browsers block autoplay with sound to protect users, so autoplay only works reliably when the video is also muted. The generator adds muted automatically when you enable autoplay."],
      ["What is the poster attribute?", "poster sets an image shown before the video plays or while it loads, giving viewers a meaningful preview frame instead of a blank black rectangle."]
    ]
  },
  "html-audio-tag": {
    title: "Free HTML5 Audio Tag Generator – Embed Audio Code | ToolsRift",
    desc: "Generate an HTML5 <audio> element online with controls, autoplay, loop, muted, preload and multiple MP3, OGG and WAV source fallbacks. Copy self-hosted audio markup.",
    faq: [
      ["Which audio formats should I provide?", "MP3 is the most widely supported, with OGG and WAV as fallbacks. Offering several <source> elements lets each browser choose a format it can decode."],
      ["What does the preload attribute control?", "preload hints how much audio to fetch before playback: none saves bandwidth, metadata loads only duration info, and auto lets the browser buffer the file eagerly."],
      ["Do I need controls?", "Without controls there is no visible player, so unless you build custom JavaScript controls you should keep controls enabled so users can play, pause and adjust volume."]
    ]
  },
  "html-figure-generator": {
    title: "Free HTML Figure & Figcaption Generator – Captioned Image | ToolsRift",
    desc: "Generate a semantic HTML <figure> with <figcaption> online. Wrap an image, its alt text and a caption in accessible markup for photos, diagrams and illustrations.",
    faq: [
      ["When should I use figure instead of a plain image?", "Use <figure> when an image, chart or code block has a caption or is referenced from the main text. It groups the visual with its <figcaption> as a single self-contained unit."],
      ["What is the difference between alt and figcaption?", "alt is a short text alternative read when the image can't be seen, while figcaption is a visible caption for everyone. They serve different audiences, so provide both."],
      ["Can figure wrap things other than images?", "Yes. <figure> can wrap illustrations, diagrams, code listings, quotes or videos. This generator focuses on the common image-with-caption pattern."]
    ]
  },
  "html-details-accordion": {
    title: "Free HTML Details Accordion Generator – FAQ Toggle | ToolsRift",
    desc: "Generate native HTML <details> and <summary> accordion markup online. Create collapsible FAQ toggles with no JavaScript, with an optional open-by-default section.",
    faq: [
      ["Does the accordion need JavaScript?", "No. The <details> and <summary> elements are natively interactive in all modern browsers, so clicking the summary expands and collapses the panel with zero JavaScript."],
      ["How do I make one section open by default?", "Add the open attribute to a <details> element and it renders expanded on page load. The generator adds open to the first item when you enable that option."],
      ["Is a details accordion good for SEO and accessibility?", "Yes. The content stays in the HTML so search engines can index it, and the native elements are keyboard accessible and announced correctly by screen readers."]
    ]
  },
  "html-definition-list": {
    title: "Free HTML Definition List Generator – dl dt dd Markup | ToolsRift",
    desc: "Generate a semantic HTML definition list online from term: definition lines. Build dl, dt and dd markup for glossaries, metadata and key-value content instantly.",
    faq: [
      ["What is a definition list for?", "A <dl> pairs terms (<dt>) with descriptions (<dd>). It suits glossaries, FAQs, metadata and any key-value content where each item has a name and an explanation."],
      ["How do I enter the terms and definitions?", "Write one pair per line as term: definition. The text before the first colon becomes the <dt> and the rest becomes the <dd>. Lines with no colon are treated as a lone term."],
      ["Can one term have multiple definitions?", "The HTML spec allows several <dd> elements after a single <dt>. This generator produces one description per line; add extra <dd> tags manually for multiple definitions."]
    ]
  },
  "html-semantic5-wrapper": {
    title: "Free HTML5 Semantic Layout Generator – Landmark Skeleton | ToolsRift",
    desc: "Generate an HTML5 semantic page skeleton online with header, nav, main, article, aside, section and footer landmarks for accessible, SEO-friendly document structure.",
    faq: [
      ["Why use semantic landmark elements?", "Elements like <header>, <nav>, <main> and <footer> describe the role of each region, helping screen readers offer landmark navigation and giving search engines clearer structure than nested divs."],
      ["What is the difference between article and section?", "An <article> is self-contained and independently distributable, like a blog post. A <section> is a thematic grouping within a document. Use <article> for standalone content and <section> to chunk a page."],
      ["Should there be only one main element?", "Yes. A page should contain exactly one visible <main> holding its primary content, excluding repeated headers, navigation and footers."]
    ]
  },
  "html-blockquote-generator": {
    title: "Free HTML Blockquote Generator – Quote & Cite Markup | ToolsRift",
    desc: "Generate a semantic HTML <blockquote> online with an optional cite URL and figcaption author attribution. Create accessible quote and testimonial markup instantly.",
    faq: [
      ["What is the cite attribute for?", "The cite attribute on <blockquote> holds the source URL of the quotation. It is machine-readable metadata and is not displayed, so add a visible attribution separately."],
      ["How should I credit the author?", "Wrap the quote in a <figure> and place the attribution in a <figcaption> using <cite> for the source name. This generator can build that accessible structure for you."],
      ["Blockquote vs q — which do I use?", "Use <blockquote> for longer, block-level quotations set off from the text, and the inline <q> element for short quotes that flow within a sentence."]
    ]
  },
  "html-nav-menu-generator": {
    title: "Free HTML Nav Menu Generator – Navigation Links | ToolsRift",
    desc: "Generate an accessible HTML navigation menu online from label|url lines. Build a nav element with an unordered list of anchor links for site headers and footers.",
    faq: [
      ["How do I enter the menu items?", "Write one item per line as label|url, for example About|/about. The text before the pipe is the link label and the text after is the href. A line without a pipe links to #."],
      ["Why wrap links in nav and a list?", "A <nav> landmark lets assistive tech jump straight to navigation, and an unordered list conveys that the links are a related set and how many there are, which improves accessibility."],
      ["Can I mark the current page?", "Add aria-current=\"page\" to the active link so screen readers announce the user's location. You can add this attribute to the generated markup for the current page's link."]
    ]
  },
  "html-attribute-remover": {
    title: "Free HTML Attribute Remover – Strip Tag Attributes | ToolsRift",
    desc: "Remove attributes from HTML online. Strip every attribute from all tags at once for bare element names, or delete only a specific attribute like class, style or id.",
    faq: [
      ["What does removing all attributes do?", "It rewrites every tag to just its element name, so <div class=\"x\" id=\"y\"> becomes <div>. Content and tag structure are preserved while all styling hooks and metadata attributes are stripped."],
      ["Can I remove only one attribute?", "Yes. Enter an attribute name such as style, class or data-id and only that attribute is removed from all tags, leaving every other attribute in place."],
      ["Does it keep self-closing tags valid?", "Yes. Void and self-closed tags like <br/> are preserved as self-closing when attributes are removed, so the markup stays valid."]
    ]
  },
  "html-char-entity-finder": {
    title: "Free HTML Character Entity Finder – Entity Code Lookup | ToolsRift",
    desc: "Find HTML entity codes for special characters online. Scan text for symbols and non-ASCII characters and list their named, decimal and hexadecimal HTML entities.",
    faq: [
      ["Which characters are reported?", "The finder lists reserved HTML characters (& < > \" '), and any non-ASCII characters such as ©, €, — or emoji, giving each one its entity codes. Plain printable ASCII letters and digits are skipped."],
      ["What entity formats does it show?", "For every character it shows the named entity when one exists (like &copy;), the decimal numeric entity (&#169;) and the hexadecimal entity (&#xA9;). Numeric entities work even when no name exists."],
      ["Why encode special characters as entities?", "Encoding reserved characters prevents them from breaking your markup or being misread as tags, and numeric entities let unusual symbols display reliably regardless of file encoding."]
    ]
  }
};

// HTML Formatter Component
function HtmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const formatHtml = () => {
    if (!input.trim()) return;
    try {
      let formatted = input;
      let level = 0;
      const lines = [];
      const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
      
      // Simple HTML formatter
      formatted = formatted.replace(/>\s*</g, '><');
      const tags = formatted.match(/<[^>]+>/g) || [];
      let text = formatted;
      
      tags.forEach(tag => {
        const isClosing = tag.startsWith('</');
        const isVoid = voidElements.some(v => new RegExp(`<${v}[\\s/>]`, 'i').test(tag));
        const isSelfClosing = tag.endsWith('/>');
        
        if (isClosing) {
          level = Math.max(0, level - 1);
        }
        
        const indent = '  '.repeat(level);
        text = text.replace(tag, `\n${indent}${tag}`);
        
        if (!isClosing && !isVoid && !isSelfClosing) {
          level++;
        }
      });
      
      setOutput(text.trim());
    } catch (err) {
      setOutput('Error formatting HTML: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<div><h1>Hello</h1><p>World</p></div>" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{input.length} characters</div>
      </div>
      <Btn onClick={formatHtml} disabled={!input.trim()}>Format HTML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted HTML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{output.length} characters</div>
        </div>
      )}
    </VStack>
  );
}

// HTML Minifier Component
function HtmlMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);

  const minifyHtml = () => {
    if (!input.trim()) return;
    try {
      let minified = input;
      // Remove comments
      minified = minified.replace(/<!--[\s\S]*?-->/g, '');
      // Remove whitespace between tags
      minified = minified.replace(/>\s+</g, '><');
      // Remove leading/trailing whitespace
      minified = minified.trim();
      // Collapse multiple spaces
      minified = minified.replace(/\s{2,}/g, ' ');
      
      const originalSize = input.length;
      const minifiedSize = minified.length;
      const saved = originalSize - minifiedSize;
      const percentage = ((saved / originalSize) * 100).toFixed(1);
      
      setOutput(minified);
      setStats({ originalSize, minifiedSize, saved, percentage });
    } catch (err) {
      setOutput('Error minifying HTML: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="Enter HTML to minify..." />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{input.length} characters</div>
      </div>
      <Btn onClick={minifyHtml} disabled={!input.trim()}>Minify HTML</Btn>
      {stats && (
        <Grid3>
          <StatBox value={stats.originalSize} label="Original Size" />
          <StatBox value={stats.minifiedSize} label="Minified Size" />
          <StatBox value={`${stats.percentage}%`} label="Reduction" />
        </Grid3>
      )}
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Minified HTML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Validator Component
function HtmlValidator() {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);

  const validateHtml = () => {
    if (!input.trim()) return;
    const foundErrors = [];
    const openTags = [];
    
    // Check for unclosed tags
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    let match;
    
    while ((match = tagRegex.exec(input)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();
      const isClosing = fullTag.startsWith('</');
      const isSelfClosing = fullTag.endsWith('/>');
      const isVoid = voidElements.includes(tagName);
      
      if (isClosing) {
        if (openTags.length === 0) {
          foundErrors.push(`Closing tag </${tagName}> has no matching opening tag`);
        } else if (openTags[openTags.length - 1] !== tagName) {
          foundErrors.push(`Mismatched tags: expected </${openTags[openTags.length - 1]}> but found </${tagName}>`);
        } else {
          openTags.pop();
        }
      } else if (!isVoid && !isSelfClosing) {
        openTags.push(tagName);
      }
    }
    
    openTags.forEach(tag => {
      foundErrors.push(`Unclosed tag: <${tag}>`);
    });
    
    // Check for duplicate IDs
    const idRegex = /id=["']([^"']+)["']/g;
    const ids = new Map();
    while ((match = idRegex.exec(input)) !== null) {
      const id = match[1];
      ids.set(id, (ids.get(id) || 0) + 1);
    }
    ids.forEach((count, id) => {
      if (count > 1) {
        foundErrors.push(`Duplicate ID: "${id}" appears ${count} times`);
      }
    });
    
    setErrors(foundErrors);
    setIsValid(foundErrors.length === 0);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<div><p>Enter HTML to validate...</div>" />
      </div>
      <Btn onClick={validateHtml} disabled={!input.trim()}>Validate HTML</Btn>
      {(isValid !== false || errors.length > 0) && (
        <div>
          {isValid ? (
            <div style={{ padding:16, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, color:C.success }}>
              ✓ HTML is valid! No errors found.
            </div>
          ) : (
            <div>
              <Label>{errors.length} Error(s) Found</Label>
              <Result mono={false}>
                {errors.map((err, i) => (
                  <div key={i} style={{ marginBottom:8, color:C.danger }}>• {err}</div>
                ))}
              </Result>
            </div>
          )}
        </div>
      )}
    </VStack>
  );
}

// HTML Cleaner Component
function HtmlCleaner() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removeInlineStyles, setRemoveInlineStyles] = useState(true);
  const [removeClasses, setRemoveClasses] = useState(true);
  const [removeIds, setRemoveIds] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);

  const cleanHtml = () => {
    if (!input.trim()) return;
    let cleaned = input;
    
    if (removeComments) {
      cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    if (removeInlineStyles) {
      cleaned = cleaned.replace(/\s+style=["'][^"']*["']/g, '');
    }
    
    if (removeClasses) {
      cleaned = cleaned.replace(/\s+class=["'][^"']*["']/g, '');
    }
    
    if (removeIds) {
      cleaned = cleaned.replace(/\s+id=["'][^"']*["']/g, '');
    }
    
    // Remove Word HTML junk
    cleaned = cleaned.replace(/\s+data-[a-z-]+="[^"]*"/g, '');
    cleaned = cleaned.replace(/<o:p>[\s\S]*?<\/o:p>/g, '');
    cleaned = cleaned.replace(/<\/?[a-z]+:[a-z]+[^>]*>/g, '');
    
    // Remove empty tags
    cleaned = cleaned.replace(/<([a-z]+)[^>]*>\s*<\/\1>/gi, '');
    
    setOutput(cleaned);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<div class='messy' style='color:red'>Content</div>" />
      </div>
      <div>
        <Label>Cleaning Options</Label>
        <div style={{ display:"flex", flexDirection:"column", gap:8, padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={removeInlineStyles} onChange={e => setRemoveInlineStyles(e.target.checked)} />
            Remove inline styles
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={removeClasses} onChange={e => setRemoveClasses(e.target.checked)} />
            Remove class attributes
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={removeIds} onChange={e => setRemoveIds(e.target.checked)} />
            Remove ID attributes
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={removeComments} onChange={e => setRemoveComments(e.target.checked)} />
            Remove HTML comments
          </label>
        </div>
      </div>
      <Btn onClick={cleanHtml} disabled={!input.trim()}>Clean HTML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Cleaned HTML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Compressor Component
function HtmlCompressor() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);

  const compressHtml = () => {
    if (!input.trim()) return;
    let compressed = input;
    
    // Remove comments
    compressed = compressed.replace(/<!--[\s\S]*?-->/g, '');
    // Remove whitespace between tags
    compressed = compressed.replace(/>\s+</g, '><');
    // Collapse whitespace
    compressed = compressed.replace(/\s{2,}/g, ' ');
    // Trim
    compressed = compressed.trim();
    // Remove quotes from attributes where possible
    compressed = compressed.replace(/=["']([a-zA-Z0-9-_]+)["']/g, '=$1');
    
    const originalSize = new Blob([input]).size;
    const compressedSize = new Blob([compressed]).size;
    const saved = originalSize - compressedSize;
    const percentage = ((saved / originalSize) * 100).toFixed(1);
    
    setOutput(compressed);
    setStats({ originalSize, compressedSize, saved, percentage });
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="Enter HTML to compress..." />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{new Blob([input]).size} bytes</div>
      </div>
      <Btn onClick={compressHtml} disabled={!input.trim()}>Compress HTML</Btn>
      {stats && (
        <Grid3>
          <StatBox value={`${stats.originalSize}B`} label="Original" />
          <StatBox value={`${stats.compressedSize}B`} label="Compressed" />
          <StatBox value={`${stats.percentage}%`} label="Saved" />
        </Grid3>
      )}
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Compressed HTML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML to Text Component
function HtmlToText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToText = () => {
    if (!input.trim()) return;
    const div = document.createElement('div');
    div.innerHTML = input;
    
    // Get text content
    let text = div.textContent || div.innerText || '';
    
    // Clean up extra whitespace
    text = text.replace(/\n\s*\n/g, '\n\n');
    text = text.trim();
    
    setOutput(text);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<p>Hello <strong>World</strong></p>" />
      </div>
      <Btn onClick={convertToText} disabled={!input.trim()}>Convert to Text</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Plain Text</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} />
        </div>
      )}
    </VStack>
  );
}

// HTML to Markdown Component
function HtmlToMarkdown() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToMarkdown = () => {
    if (!input.trim()) return;
    let md = input;
    
    // Headers
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');
    
    // Bold and italic
    md = md.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '**$2**');
    md = md.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '*$2*');
    
    // Links
    md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // Images
    md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
    md = md.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, '![$1]($2)');
    
    // Code
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n');
    
    // Lists
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');
    
    // Paragraphs and breaks
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');
    
    // Blockquotes
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
    
    // Remove remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');
    
    // Clean up
    md = md.replace(/\n{3,}/g, '\n\n');
    md = md.trim();
    
    setOutput(md);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<h1>Title</h1><p>Paragraph with <strong>bold</strong> text.</p>" />
      </div>
      <Btn onClick={convertToMarkdown} disabled={!input.trim()}>Convert to Markdown</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Markdown</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Markdown to HTML Component
function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToHtml = () => {
    if (!input.trim()) return;
    let html = input;
    
    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
    
    // Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/```\n?([\s\S]*?)\n?```/g, '<pre><code>$1</code></pre>');
    
    // Lists
    html = html.replace(/^\*\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>\n$&</ul>\n');
    
    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    
    // Paragraphs
    html = html.replace(/^(?!<[hubi]|<\/|<li|<bl)(.+)$/gm, '<p>$1</p>');
    
    // Line breaks
    html = html.replace(/\n/g, '\n');
    
    setOutput(html);
  };

  return (
    <VStack>
      <div>
        <Label>Markdown</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="# Title\n\nParagraph with **bold** text." />
      </div>
      <Btn onClick={convertToHtml} disabled={!input.trim()}>Convert to HTML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML to JSX Component
function HtmlToJsx() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToJsx = () => {
    if (!input.trim()) return;
    let jsx = input;
    
    // class to className
    jsx = jsx.replace(/\sclass=/g, ' className=');
    
    // for to htmlFor
    jsx = jsx.replace(/\sfor=/g, ' htmlFor=');
    
    // Convert inline style strings to objects
    jsx = jsx.replace(/style=["']([^"']+)["']/g, (match, styleString) => {
      const styleObj = styleString.split(';').filter(s => s.trim()).map(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        return `${camelKey}: "${value}"`;
      }).join(', ');
      return `style={{${styleObj}}}`;
    });
    
    // Event handlers to camelCase
    jsx = jsx.replace(/\son([a-z]+)=/g, (match, event) => {
      return ` on${event.charAt(0).toUpperCase() + event.slice(1)}=`;
    });
    
    // Self-close void elements
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
    voidElements.forEach(el => {
      jsx = jsx.replace(new RegExp(`<${el}([^>]*)>`, 'gi'), `<${el}$1 />`);
    });
    
    setOutput(jsx);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='<div class="container" style="color: red;"><label for="name">Name</label></div>' />
      </div>
      <Btn onClick={convertToJsx} disabled={!input.trim()}>Convert to JSX</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSX Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Entities Encode Component
function HtmlEntitiesEncode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encodeEntities = () => {
    if (!input.trim()) return;
    const encoded = input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    setOutput(encoded);
  };

  return (
    <VStack>
      <div>
        <Label>Text to Encode</Label>
        <Textarea value={input} onChange={setInput} rows={8} placeholder='<div class="example">Hello & goodbye</div>' />
      </div>
      <Btn onClick={encodeEntities} disabled={!input.trim()}>Encode Entities</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Encoded Text</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Entities Decode Component
function HtmlEntitiesDecode() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const decodeEntities = () => {
    if (!input.trim()) return;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    setOutput(textarea.value);
  };

  return (
    <VStack>
      <div>
        <Label>Encoded Text</Label>
        <Textarea value={input} onChange={setInput} rows={8} mono placeholder='&lt;div class=&quot;example&quot;&gt;Hello &amp; goodbye&lt;/div&gt;' />
      </div>
      <Btn onClick={decodeEntities} disabled={!input.trim()}>Decode Entities</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Decoded Text</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} />
        </div>
      )}
    </VStack>
  );
}

// HTML Preview Component
function HtmlToPdfPreview() {
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const preview = () => {
    setShowPreview(true);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<h1>Hello World</h1><p>This is a <strong>preview</strong>.</p>" />
      </div>
      <Btn onClick={preview} disabled={!input.trim()}>Preview HTML</Btn>
      {showPreview && input && (
        <div>
          <Label>Live Preview</Label>
          <div style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden", background:"#fff" }}>
            <iframe 
              srcDoc={input}
              sandbox="allow-same-origin"
              style={{ width:"100%", minHeight:300, border:"none", display:"block" }}
              title="HTML Preview"
            />
          </div>
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Preview is sandboxed for security. JavaScript is disabled.</div>
        </div>
      )}
    </VStack>
  );
}

// Meta Tag Generator Component
function MetaTagGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [output, setOutput] = useState('');

  const generateMeta = () => {
    const tags = [];
    
    if (title) {
      tags.push(`<title>${title}</title>`);
      tags.push(`<meta property="og:title" content="${title}">`);
      tags.push(`<meta name="twitter:title" content="${title}">`);
    }
    
    if (description) {
      tags.push(`<meta name="description" content="${description}">`);
      tags.push(`<meta property="og:description" content="${description}">`);
      tags.push(`<meta name="twitter:description" content="${description}">`);
    }
    
    if (keywords) {
      tags.push(`<meta name="keywords" content="${keywords}">`);
    }
    
    if (author) {
      tags.push(`<meta name="author" content="${author}">`);
    }
    
    if (ogImage) {
      tags.push(`<meta property="og:image" content="${ogImage}">`);
      tags.push(`<meta name="twitter:image" content="${ogImage}">`);
    }
    
    tags.push(`<meta charset="UTF-8">`);
    tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    tags.push(`<meta property="og:type" content="website">`);
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    
    setOutput(tags.join('\n'));
  };

  return (
    <VStack>
      <div><Label>Page Title</Label><Input value={title} onChange={setTitle} placeholder="My Awesome Website" /></div>
      <div><Label>Meta Description (150-160 chars)</Label><Textarea value={description} onChange={setDescription} rows={3} placeholder="A compelling description that encourages clicks from search results." /></div>
      <div><Label>Keywords (comma-separated)</Label><Input value={keywords} onChange={setKeywords} placeholder="web, design, development" /></div>
      <div><Label>Author</Label><Input value={author} onChange={setAuthor} placeholder="John Doe" /></div>
      <div><Label>Open Graph Image URL</Label><Input value={ogImage} onChange={setOgImage} placeholder="https://example.com/image.jpg" /></div>
      <Btn onClick={generateMeta} disabled={!title && !description}>Generate Meta Tags</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Meta Tags</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// OG Tag Generator Component
function OgTagGenerator() {
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogUrl, setOgUrl] = useState('');
  const [ogType, setOgType] = useState('website');
  const [output, setOutput] = useState('');

  const generateOg = () => {
    const tags = [];
    
    if (ogTitle) {
      tags.push(`<meta property="og:title" content="${ogTitle}">`);
      tags.push(`<meta name="twitter:title" content="${ogTitle}">`);
    }
    
    if (ogDescription) {
      tags.push(`<meta property="og:description" content="${ogDescription}">`);
      tags.push(`<meta name="twitter:description" content="${ogDescription}">`);
    }
    
    if (ogImage) {
      tags.push(`<meta property="og:image" content="${ogImage}">`);
      tags.push(`<meta name="twitter:image" content="${ogImage}">`);
    }
    
    if (ogUrl) {
      tags.push(`<meta property="og:url" content="${ogUrl}">`);
    }
    
    tags.push(`<meta property="og:type" content="${ogType}">`);
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    
    setOutput(tags.join('\n'));
  };

  return (
    <VStack>
      <div><Label>OG Title</Label><Input value={ogTitle} onChange={setOgTitle} placeholder="Compelling social media title" /></div>
      <div><Label>OG Description</Label><Textarea value={ogDescription} onChange={setOgDescription} rows={3} placeholder="Description that appears in social media shares." /></div>
      <div><Label>OG Image URL (1200×630 recommended)</Label><Input value={ogImage} onChange={setOgImage} placeholder="https://example.com/og-image.jpg" /></div>
      <div><Label>Page URL</Label><Input value={ogUrl} onChange={setOgUrl} placeholder="https://example.com/page" /></div>
      <div>
        <Label>OG Type</Label>
        <SelectInput value={ogType} onChange={setOgType} options={[
          { value:'website', label:'Website' },
          { value:'article', label:'Article' },
          { value:'product', label:'Product' },
          { value:'video', label:'Video' }
        ]} />
      </div>
      <Btn onClick={generateOg} disabled={!ogTitle && !ogDescription}>Generate OG Tags</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Open Graph Tags</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Table Generator Component
function HtmlTableGenerator() {
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');
  const [hasHeader, setHasHeader] = useState(true);
  const [output, setOutput] = useState('');

  const generateTable = () => {
    const r = parseInt(rows) || 1;
    const c = parseInt(cols) || 1;
    
    let html = '<table>\n';
    
    if (hasHeader) {
      html += '  <thead>\n    <tr>\n';
      for (let i = 0; i < c; i++) {
        html += `      <th>Header ${i + 1}</th>\n`;
      }
      html += '    </tr>\n  </thead>\n';
    }
    
    html += '  <tbody>\n';
    for (let i = 0; i < (hasHeader ? r - 1 : r); i++) {
      html += '    <tr>\n';
      for (let j = 0; j < c; j++) {
        html += `      <td>Cell ${i + 1},${j + 1}</td>\n`;
      }
      html += '    </tr>\n';
    }
    html += '  </tbody>\n</table>';
    
    setOutput(html);
  };

  return (
    <VStack>
      <Grid2>
        <div><Label>Rows</Label><Input value={rows} onChange={setRows} placeholder="3" /></div>
        <div><Label>Columns</Label><Input value={cols} onChange={setCols} placeholder="3" /></div>
      </Grid2>
      <div>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} />
          Include table header
        </label>
      </div>
      <Btn onClick={generateTable}>Generate Table</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Table Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML List Generator Component
function HtmlListGenerator() {
  const [items, setItems] = useState('');
  const [listType, setListType] = useState('ul');
  const [output, setOutput] = useState('');

  const generateList = () => {
    if (!items.trim()) return;
    const lines = items.split('\n').filter(l => l.trim());
    const tag = listType === 'ul' ? 'ul' : 'ol';
    
    let html = `<${tag}>\n`;
    lines.forEach(line => {
      html += `  <li>${line.trim()}</li>\n`;
    });
    html += `</${tag}>`;
    
    setOutput(html);
  };

  return (
    <VStack>
      <div>
        <Label>List Type</Label>
        <SelectInput value={listType} onChange={setListType} options={[
          { value:'ul', label:'Unordered List (bullets)' },
          { value:'ol', label:'Ordered List (numbers)' }
        ]} />
      </div>
      <div>
        <Label>List Items (one per line)</Label>
        <Textarea value={items} onChange={setItems} rows={8} placeholder="Item 1&#10;Item 2&#10;Item 3" />
      </div>
      <Btn onClick={generateList} disabled={!items.trim()}>Generate List</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML List Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Color Codes Component
function HtmlColorCodes() {
  const [color, setColor] = useState('#FF5733');
  const [rgb, setRgb] = useState('');
  const [rgba, setRgba] = useState('');
  const [hsl, setHsl] = useState('');

  useEffect(() => {
    if (color.startsWith('#') && color.length === 7) {
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      
      setRgb(`rgb(${r}, ${g}, ${b})`);
      setRgba(`rgba(${r}, ${g}, ${b}, 1)`);
      
      const rn = r / 255, gn = g / 255, bn = b / 255;
      const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
      const l = (max + min) / 2;
      const d = max - min;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      let h = 0;
      if (d !== 0) {
        if (max === rn) h = 60 * (((gn - bn) / d) % 6);
        else if (max === gn) h = 60 * ((bn - rn) / d + 2);
        else h = 60 * ((rn - gn) / d + 4);
      }
      if (h < 0) h += 360;
      setHsl(`hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
    }
  }, [color]);

  return (
    <VStack>
      <div>
        <Label>Color Picker</Label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width:"100%", height:60, cursor:"pointer", border:`1px solid ${C.border}`, borderRadius:8 }} />
      </div>
      <div>
        <Label>Hex Code</Label>
        <div style={{ position:"relative" }}>
          <Result mono>{color}</Result>
          <div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={color} /></div>
        </div>
      </div>
      <div>
        <Label>RGB</Label>
        <div style={{ position:"relative" }}>
          <Result mono>{rgb}</Result>
          <div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={rgb} /></div>
        </div>
      </div>
      <div>
        <Label>RGBA</Label>
        <div style={{ position:"relative" }}>
          <Result mono>{rgba}</Result>
          <div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={rgba} /></div>
        </div>
      </div>
      <div>
        <Label>HSL</Label>
        <div style={{ position:"relative" }}>
          <Result mono>{hsl}</Result>
          <div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={hsl} /></div>
        </div>
      </div>
    </VStack>
  );
}

// HTML Link Generator Component
function HtmlLinkGenerator() {
  const [href, setHref] = useState('');
  const [text, setText] = useState('');
  const [target, setTarget] = useState('_self');
  const [rel, setRel] = useState('');
  const [title, setTitle] = useState('');
  const [output, setOutput] = useState('');

  const generateLink = () => {
    if (!href.trim()) return;
    let link = '<a';
    link += ` href="${href}"`;
    if (target !== '_self') {
      link += ` target="${target}"`;
      if (target === '_blank' && !rel.includes('noopener')) {
        link += ` rel="noopener noreferrer"`;
      } else if (rel) {
        link += ` rel="${rel}"`;
      }
    } else if (rel) {
      link += ` rel="${rel}"`;
    }
    if (title) link += ` title="${title}"`;
    link += `>${text || href}</a>`;
    setOutput(link);
  };

  return (
    <VStack>
      <div><Label>URL (href)</Label><Input value={href} onChange={setHref} placeholder="https://example.com" /></div>
      <div><Label>Link Text</Label><Input value={text} onChange={setText} placeholder="Click here" /></div>
      <div>
        <Label>Target</Label>
        <SelectInput value={target} onChange={setTarget} options={[
          { value:'_self', label:'Same tab (_self)' },
          { value:'_blank', label:'New tab (_blank)' }
        ]} />
      </div>
      <div><Label>Rel Attribute (optional)</Label><Input value={rel} onChange={setRel} placeholder="nofollow" /></div>
      <div><Label>Title (tooltip)</Label><Input value={title} onChange={setTitle} placeholder="Visit our website" /></div>
      <Btn onClick={generateLink} disabled={!href.trim()}>Generate Link</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Link Code</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// HTML Image Tag Component
function HtmlImageTag() {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState('lazy');
  const [output, setOutput] = useState('');

  const generateImg = () => {
    if (!src.trim()) return;
    let img = '<img';
    img += ` src="${src}"`;
    img += ` alt="${alt || ''}"`;
    if (width) img += ` width="${width}"`;
    if (height) img += ` height="${height}"`;
    if (loading !== 'auto') img += ` loading="${loading}"`;
    img += '>';
    setOutput(img);
  };

  return (
    <VStack>
      <div><Label>Image URL (src)</Label><Input value={src} onChange={setSrc} placeholder="https://example.com/image.jpg" /></div>
      <div><Label>Alt Text (required for accessibility)</Label><Input value={alt} onChange={setAlt} placeholder="Description of image" /></div>
      <Grid2>
        <div><Label>Width</Label><Input value={width} onChange={setWidth} placeholder="800" /></div>
        <div><Label>Height</Label><Input value={height} onChange={setHeight} placeholder="600" /></div>
      </Grid2>
      <div>
        <Label>Loading</Label>
        <SelectInput value={loading} onChange={setLoading} options={[
          { value:'auto', label:'Auto (default)' },
          { value:'lazy', label:'Lazy (deferred)' },
          { value:'eager', label:'Eager (immediate)' }
        ]} />
      </div>
      <Btn onClick={generateImg} disabled={!src.trim()}>Generate Image Tag</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Image Code</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// HTML Button Generator Component
function HtmlButtonGenerator() {
  const [text, setText] = useState('');
  const [type, setType] = useState('button');
  const [className, setClassName] = useState('');
  const [id, setId] = useState('');
  const [output, setOutput] = useState('');

  const generateButton = () => {
    if (!text.trim()) return;
    let btn = '<button';
    btn += ` type="${type}"`;
    if (className) btn += ` class="${className}"`;
    if (id) btn += ` id="${id}"`;
    btn += `>${text}</button>`;
    setOutput(btn);
  };

  return (
    <VStack>
      <div><Label>Button Text</Label><Input value={text} onChange={setText} placeholder="Click Me" /></div>
      <div>
        <Label>Type</Label>
        <SelectInput value={type} onChange={setType} options={[
          { value:'button', label:'Button (default)' },
          { value:'submit', label:'Submit (form)' },
          { value:'reset', label:'Reset (form)' }
        ]} />
      </div>
      <div><Label>Class</Label><Input value={className} onChange={setClassName} placeholder="btn btn-primary" /></div>
      <div><Label>ID</Label><Input value={id} onChange={setId} placeholder="submit-btn" /></div>
      <Btn onClick={generateButton} disabled={!text.trim()}>Generate Button</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Button Code</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// iFrame Generator Component
function IframeGenerator() {
  const [src, setSrc] = useState('');
  const [width, setWidth] = useState('560');
  const [height, setHeight] = useState('315');
  const [allowFullscreen, setAllowFullscreen] = useState(true);
  const [output, setOutput] = useState('');

  const generateIframe = () => {
    if (!src.trim()) return;
    let iframe = '<iframe';
    iframe += ` src="${src}"`;
    iframe += ` width="${width}"`;
    iframe += ` height="${height}"`;
    if (allowFullscreen) iframe += ' allowfullscreen';
    iframe += '></iframe>';
    setOutput(iframe);
  };

  return (
    <VStack>
      <div><Label>Source URL</Label><Input value={src} onChange={setSrc} placeholder="https://www.youtube.com/embed/..." /></div>
      <Grid2>
        <div><Label>Width</Label><Input value={width} onChange={setWidth} placeholder="560" /></div>
        <div><Label>Height</Label><Input value={height} onChange={setHeight} placeholder="315" /></div>
      </Grid2>
      <div>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={allowFullscreen} onChange={e => setAllowFullscreen(e.target.checked)} />
          Allow fullscreen
        </label>
      </div>
      <Btn onClick={generateIframe} disabled={!src.trim()}>Generate iFrame</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>iFrame Code</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// HTML Input Generator Component
function HtmlInputGenerator() {
  const [inputType, setInputType] = useState('text');
  const [name, setName] = useState('');
  const [labelText, setLabelText] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [required, setRequired] = useState(false);
  const [output, setOutput] = useState('');

  const generateInput = () => {
    const id = name || 'input-' + Date.now();
    let html = '';
    
    if (labelText) {
      html += `<label for="${id}">${labelText}</label>\n`;
    }
    
    html += `<input type="${inputType}"`;
    html += ` id="${id}"`;
    if (name) html += ` name="${name}"`;
    if (placeholder) html += ` placeholder="${placeholder}"`;
    if (required) html += ' required';
    html += '>';
    
    setOutput(html);
  };

  return (
    <VStack>
      <div>
        <Label>Input Type</Label>
        <SelectInput value={inputType} onChange={setInputType} options={[
          { value:'text', label:'Text' },
          { value:'email', label:'Email' },
          { value:'password', label:'Password' },
          { value:'number', label:'Number' },
          { value:'tel', label:'Telephone' },
          { value:'url', label:'URL' },
          { value:'date', label:'Date' },
          { value:'time', label:'Time' },
          { value:'color', label:'Color' },
          { value:'file', label:'File' },
          { value:'checkbox', label:'Checkbox' },
          { value:'radio', label:'Radio' }
        ]} />
      </div>
      <div><Label>Name Attribute</Label><Input value={name} onChange={setName} placeholder="username" /></div>
      <div><Label>Label Text</Label><Input value={labelText} onChange={setLabelText} placeholder="Username" /></div>
      <div><Label>Placeholder</Label><Input value={placeholder} onChange={setPlaceholder} placeholder="Enter your username" /></div>
      <div>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} />
          Required field
        </label>
      </div>
      <Btn onClick={generateInput}>Generate Input</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Input Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={4} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Tag Counter Component
function HtmlTagCounter() {
  const [input, setInput] = useState('');
  const [counts, setCounts] = useState(null);

  const countTags = () => {
    if (!input.trim()) return;
    const tagMap = new Map();
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    let total = 0;
    
    while ((match = tagRegex.exec(input)) !== null) {
      if (!match[0].startsWith('</')) {
        const tag = match[1].toLowerCase();
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
        total++;
      }
    }
    
    const sorted = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
    setCounts({ tags: sorted, total });
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<div><p>Content</p><span>Text</span></div>" />
      </div>
      <Btn onClick={countTags} disabled={!input.trim()}>Count Tags</Btn>
      {counts && (
        <div>
          <BigResult value={counts.total} label="Total Elements" />
          <div style={{ marginTop:16 }}>
            <Label>Tag Breakdown</Label>
            <Result mono={false}>
              {counts.tags.map(([tag, count]) => (
                <div key={tag} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span>&lt;{tag}&gt;</span>
                  <span style={{ color:C.orange, fontWeight:600 }}>{count}</span>
                </div>
              ))}
            </Result>
          </div>
        </div>
      )}
    </VStack>
  );
}

// HTML Attribute Extractor Component
function HtmlAttributeExtractor() {
  const [input, setInput] = useState('');
  const [tagName, setTagName] = useState('a');
  const [attributes, setAttributes] = useState([]);

  const extractAttributes = () => {
    if (!input.trim() || !tagName.trim()) return;
    const regex = new RegExp(`<${tagName}([^>]*)>`, 'gi');
    const found = [];
    let match;
    
    while ((match = regex.exec(input)) !== null) {
      const attrString = match[1];
      const attrRegex = /([a-zA-Z-]+)=["']([^"']*)["']/g;
      const attrs = {};
      let attrMatch;
      
      while ((attrMatch = attrRegex.exec(attrString)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }
      
      if (Object.keys(attrs).length > 0) {
        found.push(attrs);
      }
    }
    
    setAttributes(found);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='<a href="https://example.com" class="link">Link 1</a>' />
      </div>
      <div>
        <Label>Tag Name to Extract From</Label>
        <Input value={tagName} onChange={setTagName} placeholder="a" />
      </div>
      <Btn onClick={extractAttributes} disabled={!input.trim() || !tagName.trim()}>Extract Attributes</Btn>
      {attributes.length > 0 && (
        <div>
          <Label>Found {attributes.length} {tagName} tag(s)</Label>
          <Result mono={false}>
            {attributes.map((attrs, i) => (
              <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom:i < attributes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ fontWeight:600, marginBottom:4, color:C.orange }}>Tag #{i + 1}</div>
                {Object.entries(attrs).map(([key, value]) => (
                  <div key={key} style={{ fontSize:12, marginLeft:8 }}>
                    <span style={{ color:C.muted }}>{key}:</span> {value}
                  </div>
                ))}
              </div>
            ))}
          </Result>
        </div>
      )}
    </VStack>
  );
}

// HTML Comment Remover Component
function HtmlCommentRemover() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removed, setRemoved] = useState(0);

  const removeComments = () => {
    if (!input.trim()) return;
    const commentRegex = /<!--[\s\S]*?-->/g;
    const matches = input.match(commentRegex);
    const cleaned = input.replace(commentRegex, '');
    setOutput(cleaned);
    setRemoved(matches ? matches.length : 0);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<!-- Comment --><div>Content</div><!-- Another comment -->" />
      </div>
      <Btn onClick={removeComments} disabled={!input.trim()}>Remove Comments</Btn>
      {output && (
        <div>
          {removed > 0 && <BigResult value={removed} label={`Comment${removed > 1 ? 's' : ''} Removed`} />}
          <div style={{ marginTop:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <Label>HTML Without Comments</Label>
              <CopyBtn text={output} />
            </div>
            <Textarea value={output} onChange={() => {}} rows={10} mono />
          </div>
        </div>
      )}
    </VStack>
  );
}

// HTML Table to CSV Component
function HtmlTableToCsv() {
  const [input, setInput] = useState('');
  const [csv, setCsv] = useState('');
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  const escapeCsv = (cell) => {
    if (/[",\n\r]/.test(cell)) return '"' + cell.replace(/"/g, '""') + '"';
    return cell;
  };

  const convert = () => {
    setError(''); setCsv(''); setJson('');
    if (!input.trim()) return;
    try {
      const doc = new DOMParser().parseFromString(input, 'text/html');
      const table = doc.querySelector('table');
      if (!table) { setError('No <table> element found. Paste HTML markup that contains a <table>.'); return; }
      const rows = Array.from(table.querySelectorAll('tr'));
      if (!rows.length) { setError('The <table> has no <tr> rows to convert.'); return; }
      const matrix = rows.map(tr =>
        Array.from(tr.querySelectorAll('th, td')).map(cell => cell.textContent.trim())
      );
      // CSV
      const csvOut = matrix.map(row => row.map(escapeCsv).join(',')).join('\n');
      setCsv(csvOut);
      // JSON array-of-objects (first row = headers)
      const [headers, ...body] = matrix;
      const jsonRows = body.map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h || `column${i + 1}`] = row[i] !== undefined ? row[i] : ''; });
        return obj;
      });
      setJson(JSON.stringify(jsonRows, null, 2));
    } catch (err) {
      setError('Could not parse the HTML: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>HTML Table Markup</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<table><tr><th>Name</th><th>City</th></tr><tr><td>Ann</td><td>Paris</td></tr></table>" />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to CSV &amp; JSON</Btn>
      {error && (
        <div style={{ padding:14, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, color:C.danger, fontSize:13 }}>
          ⚠ {error}
        </div>
      )}
      {csv && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>CSV Output</Label>
            <CopyBtn text={csv} />
          </div>
          <Textarea value={csv} onChange={() => {}} rows={8} mono />
        </div>
      )}
      {json && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON Output (first row as keys)</Label>
            <CopyBtn text={json} />
          </div>
          <Textarea value={json} onChange={() => {}} rows={8} mono />
        </div>
      )}
      {(csv || json) && (
        <div style={{ fontSize:11, color:C.muted }}>Note: colspan / rowspan are not expanded — each cell maps to one CSV/JSON field.</div>
      )}
    </VStack>
  );
}

// Schema.org JSON-LD Generator Component
function SchemaJsonLdGenerator() {
  const [type, setType] = useState('Article');
  const [output, setOutput] = useState('');

  // Article
  const [artHeadline, setArtHeadline] = useState('');
  const [artAuthor, setArtAuthor] = useState('');
  const [artDate, setArtDate] = useState('');
  const [artImage, setArtImage] = useState('');
  const [artPublisher, setArtPublisher] = useState('');
  // Product
  const [prodName, setProdName] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCurrency, setProdCurrency] = useState('USD');
  const [prodAvailability, setProdAvailability] = useState('InStock');
  // FAQPage
  const [faqRows, setFaqRows] = useState([{ q:'', a:'' }]);
  // LocalBusiness
  const [lbName, setLbName] = useState('');
  const [lbPhone, setLbPhone] = useState('');
  const [lbStreet, setLbStreet] = useState('');
  const [lbCity, setLbCity] = useState('');
  const [lbRegion, setLbRegion] = useState('');
  const [lbPostal, setLbPostal] = useState('');
  const [lbCountry, setLbCountry] = useState('');
  // Organization
  const [orgName, setOrgName] = useState('');
  const [orgUrl, setOrgUrl] = useState('');
  const [orgLogo, setOrgLogo] = useState('');
  // BreadcrumbList
  const [crumbs, setCrumbs] = useState([{ name:'', url:'' }]);

  const build = () => {
    const obj = { "@context": "https://schema.org" };
    if (type === 'Article') {
      obj["@type"] = "Article";
      if (artHeadline) obj.headline = artHeadline;
      if (artImage) obj.image = [artImage];
      if (artAuthor) obj.author = { "@type": "Person", "name": artAuthor };
      if (artPublisher) obj.publisher = { "@type": "Organization", "name": artPublisher };
      if (artDate) obj.datePublished = artDate;
    } else if (type === 'Product') {
      obj["@type"] = "Product";
      if (prodName) obj.name = prodName;
      if (prodImage) obj.image = [prodImage];
      if (prodDesc) obj.description = prodDesc;
      if (prodBrand) obj.brand = { "@type": "Brand", "name": prodBrand };
      if (prodPrice) obj.offers = {
        "@type": "Offer",
        "price": prodPrice,
        "priceCurrency": prodCurrency,
        "availability": `https://schema.org/${prodAvailability}`
      };
    } else if (type === 'FAQPage') {
      obj["@type"] = "FAQPage";
      obj.mainEntity = faqRows.filter(f => f.q.trim()).map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }));
    } else if (type === 'LocalBusiness') {
      obj["@type"] = "LocalBusiness";
      if (lbName) obj.name = lbName;
      if (lbPhone) obj.telephone = lbPhone;
      const addr = { "@type": "PostalAddress" };
      if (lbStreet) addr.streetAddress = lbStreet;
      if (lbCity) addr.addressLocality = lbCity;
      if (lbRegion) addr.addressRegion = lbRegion;
      if (lbPostal) addr.postalCode = lbPostal;
      if (lbCountry) addr.addressCountry = lbCountry;
      if (Object.keys(addr).length > 1) obj.address = addr;
    } else if (type === 'Organization') {
      obj["@type"] = "Organization";
      if (orgName) obj.name = orgName;
      if (orgUrl) obj.url = orgUrl;
      if (orgLogo) obj.logo = orgLogo;
    } else if (type === 'BreadcrumbList') {
      obj["@type"] = "BreadcrumbList";
      obj.itemListElement = crumbs.filter(c => c.name.trim()).map((c, i) => {
        const item = { "@type": "ListItem", "position": i + 1, "name": c.name };
        if (c.url) item.item = c.url;
        return item;
      });
    }
    setOutput(`<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</` + `script>`);
  };

  const setFaq = (i, key, v) => setFaqRows(faqRows.map((r, idx) => idx === i ? { ...r, [key]: v } : r));
  const setCrumb = (i, key, v) => setCrumbs(crumbs.map((r, idx) => idx === i ? { ...r, [key]: v } : r));

  return (
    <VStack>
      <div>
        <Label>Schema Type</Label>
        <SelectInput value={type} onChange={setType} options={[
          { value:'Article', label:'Article' },
          { value:'Product', label:'Product' },
          { value:'FAQPage', label:'FAQ Page' },
          { value:'LocalBusiness', label:'Local Business' },
          { value:'Organization', label:'Organization' },
          { value:'BreadcrumbList', label:'Breadcrumb List' }
        ]} />
      </div>

      {type === 'Article' && (
        <>
          <div><Label>Headline</Label><Input value={artHeadline} onChange={setArtHeadline} placeholder="How to bake sourdough bread" /></div>
          <div><Label>Author Name</Label><Input value={artAuthor} onChange={setArtAuthor} placeholder="Jane Doe" /></div>
          <div><Label>Date Published</Label><Input value={artDate} onChange={setArtDate} placeholder="2026-07-13" /></div>
          <div><Label>Image URL</Label><Input value={artImage} onChange={setArtImage} placeholder="https://example.com/cover.jpg" /></div>
          <div><Label>Publisher (Organization)</Label><Input value={artPublisher} onChange={setArtPublisher} placeholder="ToolsRift" /></div>
        </>
      )}

      {type === 'Product' && (
        <>
          <div><Label>Product Name</Label><Input value={prodName} onChange={setProdName} placeholder="Wireless Headphones" /></div>
          <div><Label>Image URL</Label><Input value={prodImage} onChange={setProdImage} placeholder="https://example.com/product.jpg" /></div>
          <div><Label>Description</Label><Textarea value={prodDesc} onChange={setProdDesc} rows={2} placeholder="Noise-cancelling over-ear headphones." /></div>
          <div><Label>Brand</Label><Input value={prodBrand} onChange={setProdBrand} placeholder="Acme Audio" /></div>
          <Grid2>
            <div><Label>Price</Label><Input value={prodPrice} onChange={setProdPrice} placeholder="199.99" /></div>
            <div><Label>Currency</Label><Input value={prodCurrency} onChange={setProdCurrency} placeholder="USD" /></div>
          </Grid2>
          <div>
            <Label>Availability</Label>
            <SelectInput value={prodAvailability} onChange={setProdAvailability} options={[
              { value:'InStock', label:'In Stock' },
              { value:'OutOfStock', label:'Out of Stock' },
              { value:'PreOrder', label:'Pre-Order' },
              { value:'Discontinued', label:'Discontinued' }
            ]} />
          </div>
        </>
      )}

      {type === 'FAQPage' && (
        <div>
          <Label>Questions &amp; Answers</Label>
          <VStack gap={10}>
            {faqRows.map((f, i) => (
              <div key={i} style={{ padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:C.orange }}>Q{i + 1}</span>
                  {faqRows.length > 1 && <Btn size="sm" variant="danger" onClick={() => setFaqRows(faqRows.filter((_, idx) => idx !== i))}>Remove</Btn>}
                </div>
                <Input value={f.q} onChange={v => setFaq(i, 'q', v)} placeholder="Question" />
                <div style={{ height:8 }} />
                <Textarea value={f.a} onChange={v => setFaq(i, 'a', v)} rows={2} placeholder="Answer" />
              </div>
            ))}
          </VStack>
          <div style={{ marginTop:8 }}>
            <Btn size="sm" variant="secondary" onClick={() => setFaqRows([...faqRows, { q:'', a:'' }])}>+ Add Q&amp;A</Btn>
          </div>
        </div>
      )}

      {type === 'LocalBusiness' && (
        <>
          <div><Label>Business Name</Label><Input value={lbName} onChange={setLbName} placeholder="Acme Coffee House" /></div>
          <div><Label>Telephone</Label><Input value={lbPhone} onChange={setLbPhone} placeholder="+1-555-123-4567" /></div>
          <div><Label>Street Address</Label><Input value={lbStreet} onChange={setLbStreet} placeholder="123 Main St" /></div>
          <Grid2>
            <div><Label>City</Label><Input value={lbCity} onChange={setLbCity} placeholder="Springfield" /></div>
            <div><Label>Region / State</Label><Input value={lbRegion} onChange={setLbRegion} placeholder="IL" /></div>
          </Grid2>
          <Grid2>
            <div><Label>Postal Code</Label><Input value={lbPostal} onChange={setLbPostal} placeholder="62704" /></div>
            <div><Label>Country</Label><Input value={lbCountry} onChange={setLbCountry} placeholder="US" /></div>
          </Grid2>
        </>
      )}

      {type === 'Organization' && (
        <>
          <div><Label>Organization Name</Label><Input value={orgName} onChange={setOrgName} placeholder="ToolsRift" /></div>
          <div><Label>Website URL</Label><Input value={orgUrl} onChange={setOrgUrl} placeholder="https://toolsrift.com" /></div>
          <div><Label>Logo URL</Label><Input value={orgLogo} onChange={setOrgLogo} placeholder="https://toolsrift.com/logo.png" /></div>
        </>
      )}

      {type === 'BreadcrumbList' && (
        <div>
          <Label>Breadcrumb Items</Label>
          <VStack gap={10}>
            {crumbs.map((c, i) => (
              <div key={i} style={{ padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8, border:`1px solid ${C.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:C.orange }}>#{i + 1}</span>
                  {crumbs.length > 1 && <Btn size="sm" variant="danger" onClick={() => setCrumbs(crumbs.filter((_, idx) => idx !== i))}>Remove</Btn>}
                </div>
                <Input value={c.name} onChange={v => setCrumb(i, 'name', v)} placeholder="Page name (e.g. Home)" />
                <div style={{ height:8 }} />
                <Input value={c.url} onChange={v => setCrumb(i, 'url', v)} placeholder="https://example.com/page" />
              </div>
            ))}
          </VStack>
          <div style={{ marginTop:8 }}>
            <Btn size="sm" variant="secondary" onClick={() => setCrumbs([...crumbs, { name:'', url:'' }])}>+ Add Item</Btn>
          </div>
        </div>
      )}

      <Btn onClick={build}>Generate JSON-LD</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON-LD Structured Data</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={14} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML5 Boilerplate Generator Component
function HtmlBoilerplateGenerator() {
  const [title, setTitle] = useState('My Page');
  const [description, setDescription] = useState('');
  const [lang, setLang] = useState('en');
  const [charset, setCharset] = useState('UTF-8');
  const [viewport, setViewport] = useState(true);
  const [includeOg, setIncludeOg] = useState(false);
  const [ogImage, setOgImage] = useState('');
  const [ogUrl, setOgUrl] = useState('');
  const [includeTwitter, setIncludeTwitter] = useState(false);
  const [includeFavicon, setIncludeFavicon] = useState(true);
  const [cssReset, setCssReset] = useState(true);
  const [stylesheet, setStylesheet] = useState('');
  const [scriptPath, setScriptPath] = useState('');

  const output = useMemo(() => {
    const L = [];
    L.push('<!DOCTYPE html>');
    L.push(`<html lang="${lang || 'en'}">`);
    L.push('<head>');
    L.push(`  <meta charset="${charset || 'UTF-8'}">`);
    if (viewport) L.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    L.push(`  <title>${title || 'Document'}</title>`);
    if (description) L.push(`  <meta name="description" content="${description}">`);
    if (includeOg) {
      L.push(`  <meta property="og:title" content="${title || 'Document'}">`);
      if (description) L.push(`  <meta property="og:description" content="${description}">`);
      if (ogImage) L.push(`  <meta property="og:image" content="${ogImage}">`);
      if (ogUrl) L.push(`  <meta property="og:url" content="${ogUrl}">`);
      L.push('  <meta property="og:type" content="website">');
    }
    if (includeTwitter) {
      L.push('  <meta name="twitter:card" content="summary_large_image">');
      L.push(`  <meta name="twitter:title" content="${title || 'Document'}">`);
      if (description) L.push(`  <meta name="twitter:description" content="${description}">`);
      if (ogImage) L.push(`  <meta name="twitter:image" content="${ogImage}">`);
    }
    if (includeFavicon) {
      L.push('  <link rel="icon" href="/favicon.ico" sizes="any">');
      L.push('  <link rel="icon" href="/icon.svg" type="image/svg+xml">');
      L.push('  <link rel="apple-touch-icon" href="/apple-touch-icon.png">');
    }
    if (cssReset) {
      L.push('  <style>');
      L.push('    *, *::before, *::after { box-sizing: border-box; }');
      L.push('    * { margin: 0; }');
      L.push('    html { -webkit-text-size-adjust: 100%; }');
      L.push('    body { min-height: 100vh; line-height: 1.5; -webkit-font-smoothing: antialiased; }');
      L.push('    img, picture, video, canvas, svg { display: block; max-width: 100%; }');
      L.push('    input, button, textarea, select { font: inherit; }');
      L.push('  </style>');
    }
    if (stylesheet) L.push(`  <link rel="stylesheet" href="${stylesheet}">`);
    L.push('</head>');
    L.push('<body>');
    L.push('  <h1>Hello, world!</h1>');
    if (scriptPath) L.push(`  <script src="${scriptPath}" defer></` + 'script>');
    L.push('</body>');
    L.push('</html>');
    return L.join('\n');
  }, [title, description, lang, charset, viewport, includeOg, ogImage, ogUrl, includeTwitter, includeFavicon, cssReset, stylesheet, scriptPath]);

  const download = () => {
    const blob = new Blob([output], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'index.html';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const chk = (checked, on, label) => (
    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
      <input type="checkbox" checked={checked} onChange={e => on(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <VStack>
      <div><Label>Page Title</Label><Input value={title} onChange={setTitle} placeholder="My Page" /></div>
      <div><Label>Meta Description</Label><Textarea value={description} onChange={setDescription} rows={2} placeholder="A short description of the page." /></div>
      <Grid2>
        <div><Label>Language</Label><Input value={lang} onChange={setLang} placeholder="en" /></div>
        <div><Label>Charset</Label><Input value={charset} onChange={setCharset} placeholder="UTF-8" /></div>
      </Grid2>
      <div style={{ display:"flex", flexDirection:"column", gap:8, padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
        {chk(viewport, setViewport, 'Include viewport meta tag')}
        {chk(includeFavicon, setIncludeFavicon, 'Include favicon links')}
        {chk(cssReset, setCssReset, 'Include modern CSS reset')}
        {chk(includeOg, setIncludeOg, 'Include Open Graph tags')}
        {chk(includeTwitter, setIncludeTwitter, 'Include Twitter Card tags')}
      </div>
      {(includeOg || includeTwitter) && (
        <Grid2>
          <div><Label>Social Image URL</Label><Input value={ogImage} onChange={setOgImage} placeholder="https://example.com/og.jpg" /></div>
          <div><Label>Canonical / OG URL</Label><Input value={ogUrl} onChange={setOgUrl} placeholder="https://example.com/" /></div>
        </Grid2>
      )}
      <Grid2>
        <div><Label>Linked Stylesheet (optional)</Label><Input value={stylesheet} onChange={setStylesheet} placeholder="/styles.css" /></div>
        <div><Label>Linked Script (optional)</Label><Input value={scriptPath} onChange={setScriptPath} placeholder="/main.js" /></div>
      </Grid2>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <Label>index.html</Label>
          <div style={{ display:"flex", gap:8 }}>
            <CopyBtn text={output} />
            <Btn size="sm" variant="secondary" onClick={download}>Download .html</Btn>
          </div>
        </div>
        <Textarea value={output} onChange={() => {}} rows={16} mono />
      </div>
    </VStack>
  );
}

// Responsive Image Srcset Generator Component
function SrcsetGenerator() {
  const [pattern, setPattern] = useState('image-{w}.jpg');
  const [widths, setWidths] = useState('320, 640, 960, 1280');
  const [sizes, setSizes] = useState('(max-width: 600px) 100vw, 600px');
  const [alt, setAlt] = useState('');
  const [modernFormat, setModernFormat] = useState('webp');

  const { imgTag, pictureTag, valid } = useMemo(() => {
    const widthList = widths.split(/[,\s]+/).map(w => parseInt(w, 10)).filter(w => w > 0);
    if (!pattern.trim() || !widthList.length) return { imgTag:'', pictureTag:'', valid:false };

    const makeSrcset = (pat) => widthList.map(w => `${pat.replace(/\{w\}/g, w)} ${w}w`).join(', ');
    const srcset = makeSrcset(pattern);
    const fallbackSrc = pattern.replace(/\{w\}/g, widthList[widthList.length - 1]);
    const altAttr = alt || '';

    const img = [
      '<img',
      `  src="${fallbackSrc}"`,
      `  srcset="${srcset}"`,
      `  sizes="${sizes}"`,
      `  alt="${altAttr}"`,
      '  loading="lazy"',
      '  decoding="async">'
    ].join('\n');

    const extMatch = pattern.match(/\.(jpe?g|png|gif|webp|avif)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'jpeg';
    const origMime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : `image/${ext}`;
    const modernPattern = pattern.replace(/\.(jpe?g|png|gif|webp|avif)$/i, `.${modernFormat}`);
    const modernSrcset = makeSrcset(modernPattern);
    const modernMime = modernFormat === 'avif' ? 'image/avif' : 'image/webp';

    const picture = [
      '<picture>',
      `  <source type="${modernMime}" srcset="${modernSrcset}" sizes="${sizes}">`,
      `  <source type="${origMime}" srcset="${srcset}" sizes="${sizes}">`,
      `  <img src="${fallbackSrc}" alt="${altAttr}" loading="lazy" decoding="async">`,
      '</picture>'
    ].join('\n');

    return { imgTag: img, pictureTag: picture, valid:true };
  }, [pattern, widths, sizes, alt, modernFormat]);

  return (
    <VStack>
      <div><Label>Filename Pattern (use {'{w}'} for width)</Label><Input value={pattern} onChange={setPattern} placeholder="image-{w}.jpg" /></div>
      <div><Label>Widths (comma or space separated)</Label><Input value={widths} onChange={setWidths} placeholder="320, 640, 960, 1280" /></div>
      <div><Label>Sizes Attribute</Label><Input value={sizes} onChange={setSizes} placeholder="(max-width: 600px) 100vw, 600px" /></div>
      <div><Label>Alt Text</Label><Input value={alt} onChange={setAlt} placeholder="Description of the image" /></div>
      <div>
        <Label>Modern Format (for &lt;picture&gt;)</Label>
        <SelectInput value={modernFormat} onChange={setModernFormat} options={[
          { value:'webp', label:'WebP' },
          { value:'avif', label:'AVIF' }
        ]} />
      </div>
      {!valid && (
        <div style={{ fontSize:12, color:C.muted }}>Enter a filename pattern and at least one width to generate markup.</div>
      )}
      {valid && (
        <>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <Label>&lt;img&gt; with srcset</Label>
              <CopyBtn text={imgTag} />
            </div>
            <Textarea value={imgTag} onChange={() => {}} rows={8} mono />
          </div>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <Label>&lt;picture&gt; with {modernFormat.toUpperCase()} + fallback</Label>
              <CopyBtn text={pictureTag} />
            </div>
            <Textarea value={pictureTag} onChange={() => {}} rows={6} mono />
          </div>
        </>
      )}
    </VStack>
  );
}

// Newline to BR Converter Component
function HtmlNl2br() {
  const [input, setInput] = useState('');
  const [xhtml, setXhtml] = useState(false);
  const [reverse, setReverse] = useState(false);

  const output = useMemo(() => {
    if (!input) return '';
    if (reverse) {
      return input.replace(/<br\s*\/?>(\r\n|\r|\n)?/gi, '\n');
    }
    const tag = xhtml ? '<br />' : '<br>';
    return input.replace(/\r\n|\r|\n/g, tag + '\n');
  }, [input, xhtml, reverse]);

  return (
    <VStack>
      <div>
        <Label>{reverse ? 'HTML with <br> Tags' : 'Plain Text'}</Label>
        <Textarea value={input} onChange={setInput} rows={8} mono placeholder={reverse ? "Line one<br>Line two<br>Line three" : "Line one\nLine two\nLine three"} />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={reverse} onChange={e => setReverse(e.target.checked)} />
          Reverse (convert &lt;br&gt; back to newlines)
        </label>
        {!reverse && (
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={xhtml} onChange={e => setXhtml(e.target.checked)} />
            XHTML mode (use self-closing &lt;br /&gt;)
          </label>
        )}
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{reverse ? 'Plain Text Output' : 'HTML Output'}</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// Text/SVG to Data URI Component
function HtmlDataUri() {
  const [input, setInput] = useState('');
  const [mime, setMime] = useState('image/svg+xml');
  const [encoding, setEncoding] = useState('base64');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const build = () => {
    setError(''); setOutput('');
    if (!input) return;
    try {
      let uri;
      if (encoding === 'base64') {
        const b64 = btoa(unescape(encodeURIComponent(input)));
        uri = `data:${mime};base64,${b64}`;
      } else {
        // URL-encode, keep it readable/compact for SVG
        const enc = encodeURIComponent(input).replace(/%20/g, ' ').replace(/'/g, '%27').replace(/"/g, '%22');
        uri = `data:${mime},${enc}`;
      }
      setOutput(uri);
    } catch (err) {
      setError('Could not encode input: ' + err.message);
    }
  };

  const cssBg = output ? `background-image: url("${output}");` : '';

  return (
    <VStack>
      <div>
        <Label>Text / SVG / CSS Content</Label>
        <Textarea value={input} onChange={setInput} rows={7} mono placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="7" fill="tomato"/></svg>' />
      </div>
      <Grid2>
        <div>
          <Label>MIME Type</Label>
          <SelectInput value={mime} onChange={setMime} options={[
            { value:'image/svg+xml', label:'image/svg+xml' },
            { value:'text/plain', label:'text/plain' },
            { value:'text/html', label:'text/html' },
            { value:'text/css', label:'text/css' },
            { value:'application/json', label:'application/json' }
          ]} />
        </div>
        <div>
          <Label>Encoding</Label>
          <SelectInput value={encoding} onChange={setEncoding} options={[
            { value:'base64', label:'Base64' },
            { value:'url', label:'URL-encoded' }
          ]} />
        </div>
      </Grid2>
      <Btn onClick={build} disabled={!input}>Generate Data URI</Btn>
      {error && (
        <div style={{ padding:14, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, color:C.danger, fontSize:13 }}>⚠ {error}</div>
      )}
      {output && (
        <>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <Label>Data URI ({output.length} chars)</Label>
              <CopyBtn text={output} />
            </div>
            <Textarea value={output} onChange={() => {}} rows={5} mono />
          </div>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <Label>CSS Usage</Label>
              <CopyBtn text={cssBg} />
            </div>
            <Result mono>{cssBg}</Result>
          </div>
        </>
      )}
    </VStack>
  );
}

// HTML Form Generator Component
function HtmlFormGenerator() {
  const [method, setMethod] = useState('post');
  const [action, setAction] = useState('/submit');
  const [fields, setFields] = useState([{ type:'text', name:'name', label:'Name', required:true }]);
  const [submitText, setSubmitText] = useState('Submit');
  const [output, setOutput] = useState('');

  const setField = (i, key, v) => setFields(fields.map((f, idx) => idx === i ? { ...f, [key]: v } : f));

  const build = () => {
    let html = `<form action="${action || '#'}" method="${method}">\n`;
    fields.forEach(f => {
      const name = (f.name || '').trim();
      if (!name) return;
      const id = name;
      const req = f.required ? ' required' : '';
      if (f.label) html += `  <label for="${id}">${f.label}</label>\n`;
      if (f.type === 'textarea') {
        html += `  <textarea id="${id}" name="${name}" rows="4"${req}></textarea>\n`;
      } else if (f.type === 'select') {
        html += `  <select id="${id}" name="${name}"${req}>\n    <option value="">Choose…</option>\n  </select>\n`;
      } else {
        html += `  <input type="${f.type}" id="${id}" name="${name}"${req}>\n`;
      }
    });
    html += `  <button type="submit">${submitText || 'Submit'}</button>\n</form>`;
    setOutput(html);
  };

  const TYPES = [
    { value:'text', label:'Text' }, { value:'email', label:'Email' }, { value:'password', label:'Password' },
    { value:'number', label:'Number' }, { value:'tel', label:'Telephone' }, { value:'url', label:'URL' },
    { value:'date', label:'Date' }, { value:'textarea', label:'Textarea' }, { value:'select', label:'Select' }
  ];

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Method</Label>
          <SelectInput value={method} onChange={setMethod} options={[{ value:'post', label:'POST' }, { value:'get', label:'GET' }]} />
        </div>
        <div><Label>Action URL</Label><Input value={action} onChange={setAction} placeholder="/submit" /></div>
      </Grid2>
      <div>
        <Label>Form Fields</Label>
        <VStack gap={10}>
          {fields.map((f, i) => (
            <div key={i} style={{ padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8, border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.orange }}>Field {i + 1}</span>
                {fields.length > 1 && <Btn size="sm" variant="danger" onClick={() => setFields(fields.filter((_, idx) => idx !== i))}>Remove</Btn>}
              </div>
              <Grid2>
                <div><Label>Name</Label><Input value={f.name} onChange={v => setField(i, 'name', v)} placeholder="email" /></div>
                <div><Label>Label</Label><Input value={f.label} onChange={v => setField(i, 'label', v)} placeholder="Email" /></div>
              </Grid2>
              <div style={{ height:8 }} />
              <SelectInput value={f.type} onChange={v => setField(i, 'type', v)} options={TYPES} style={{ width:"100%" }} />
              <div style={{ height:8 }} />
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
                <input type="checkbox" checked={!!f.required} onChange={e => setField(i, 'required', e.target.checked)} />
                Required
              </label>
            </div>
          ))}
        </VStack>
        <div style={{ marginTop:8 }}>
          <Btn size="sm" variant="secondary" onClick={() => setFields([...fields, { type:'text', name:'', label:'', required:false }])}>+ Add Field</Btn>
        </div>
      </div>
      <div><Label>Submit Button Text</Label><Input value={submitText} onChange={setSubmitText} placeholder="Submit" /></div>
      <Btn onClick={build}>Generate Form</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Form Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Select Dropdown Generator Component
function HtmlSelectGenerator() {
  const [name, setName] = useState('choice');
  const [items, setItems] = useState('us|United States\nca|Canada\nuk|United Kingdom');
  const [multiple, setMultiple] = useState(false);
  const [placeholder, setPlaceholder] = useState(true);
  const [output, setOutput] = useState('');

  const build = () => {
    const lines = items.split('\n').map(l => l.trim()).filter(Boolean);
    let html = `<select name="${name || 'choice'}"${multiple ? ' multiple' : ''}>\n`;
    if (placeholder && !multiple) html += `  <option value="" disabled selected>Choose…</option>\n`;
    lines.forEach(line => {
      const parts = line.includes('|') ? line.split('|') : [line, line];
      const val = parts[0].trim();
      const label = (parts[1] !== undefined ? parts[1] : parts[0]).trim();
      html += `  <option value="${val}">${label}</option>\n`;
    });
    html += '</select>';
    setOutput(html);
  };

  return (
    <VStack>
      <div><Label>Name Attribute</Label><Input value={name} onChange={setName} placeholder="country" /></div>
      <div>
        <Label>Options (one per line, value|label)</Label>
        <Textarea value={items} onChange={setItems} rows={7} mono placeholder="us|United States&#10;ca|Canada" />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={multiple} onChange={e => setMultiple(e.target.checked)} />
          Allow multiple selections
        </label>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={placeholder} onChange={e => setPlaceholder(e.target.checked)} />
          Add placeholder option (single select)
        </label>
      </div>
      <Btn onClick={build} disabled={!items.trim()}>Generate Select</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Select Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Video Tag Generator Component
function HtmlVideoTag() {
  const [src, setSrc] = useState('video.mp4');
  const [width, setWidth] = useState('640');
  const [poster, setPoster] = useState('');
  const [controls, setControls] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState('');
  const [output, setOutput] = useState('');

  const mimeFor = (file) => {
    const ext = (file.split('.').pop() || '').toLowerCase();
    return { mp4:'video/mp4', webm:'video/webm', ogv:'video/ogg', ogg:'video/ogg', mov:'video/quicktime' }[ext] || 'video/mp4';
  };

  const build = () => {
    const sources = src.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    let attrs = '';
    if (width) attrs += ` width="${width}"`;
    if (poster) attrs += ` poster="${poster}"`;
    if (controls) attrs += ' controls';
    if (autoplay) { attrs += ' autoplay'; }
    if (autoplay || muted) attrs += ' muted';
    if (loop) attrs += ' loop';
    let html = `<video${attrs}>\n`;
    sources.forEach(s => { html += `  <source src="${s}" type="${mimeFor(s)}">\n`; });
    if (captions) html += `  <track kind="captions" src="${captions}" srclang="en" label="English" default>\n`;
    html += '  Your browser does not support the video tag.\n</video>';
    setOutput(html);
  };

  return (
    <VStack>
      <div><Label>Video Source(s) — one URL per line for fallbacks</Label><Textarea value={src} onChange={setSrc} rows={3} mono placeholder="video.webm&#10;video.mp4" /></div>
      <Grid2>
        <div><Label>Width</Label><Input value={width} onChange={setWidth} placeholder="640" /></div>
        <div><Label>Poster Image URL</Label><Input value={poster} onChange={setPoster} placeholder="poster.jpg" /></div>
      </Grid2>
      <div><Label>Captions VTT URL (optional)</Label><Input value={captions} onChange={setCaptions} placeholder="captions.vtt" /></div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 16px" }}>
        {[['Controls', controls, setControls], ['Autoplay', autoplay, setAutoplay], ['Loop', loop, setLoop], ['Muted', muted, setMuted]].map(([lbl, val, set]) => (
          <label key={lbl} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />{lbl}
          </label>
        ))}
      </div>
      <Btn onClick={build} disabled={!src.trim()}>Generate Video Tag</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Video Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Audio Tag Generator Component
function HtmlAudioTag() {
  const [src, setSrc] = useState('audio.mp3');
  const [controls, setControls] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [preload, setPreload] = useState('metadata');
  const [output, setOutput] = useState('');

  const mimeFor = (file) => {
    const ext = (file.split('.').pop() || '').toLowerCase();
    return { mp3:'audio/mpeg', ogg:'audio/ogg', oga:'audio/ogg', wav:'audio/wav', m4a:'audio/mp4', aac:'audio/aac', flac:'audio/flac' }[ext] || 'audio/mpeg';
  };

  const build = () => {
    const sources = src.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
    let attrs = '';
    if (controls) attrs += ' controls';
    if (autoplay) attrs += ' autoplay';
    if (loop) attrs += ' loop';
    if (muted) attrs += ' muted';
    if (preload !== 'auto') attrs += ` preload="${preload}"`;
    let html = `<audio${attrs}>\n`;
    sources.forEach(s => { html += `  <source src="${s}" type="${mimeFor(s)}">\n`; });
    html += '  Your browser does not support the audio element.\n</audio>';
    setOutput(html);
  };

  return (
    <VStack>
      <div><Label>Audio Source(s) — one URL per line for fallbacks</Label><Textarea value={src} onChange={setSrc} rows={3} mono placeholder="audio.ogg&#10;audio.mp3" /></div>
      <div>
        <Label>Preload</Label>
        <SelectInput value={preload} onChange={setPreload} options={[
          { value:'metadata', label:'Metadata (duration only)' },
          { value:'auto', label:'Auto (buffer file)' },
          { value:'none', label:'None (save bandwidth)' }
        ]} />
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 16px" }}>
        {[['Controls', controls, setControls], ['Autoplay', autoplay, setAutoplay], ['Loop', loop, setLoop], ['Muted', muted, setMuted]].map(([lbl, val, set]) => (
          <label key={lbl} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
            <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />{lbl}
          </label>
        ))}
      </div>
      <Btn onClick={build} disabled={!src.trim()}>Generate Audio Tag</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Audio Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Figure & Caption Generator Component
function HtmlFigureGenerator() {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [width, setWidth] = useState('');
  const [output, setOutput] = useState('');

  const build = () => {
    if (!src.trim()) return;
    let img = `<img src="${src}" alt="${alt || ''}"`;
    if (width) img += ` width="${width}"`;
    img += '>';
    let html = '<figure>\n  ' + img + '\n';
    if (caption) html += `  <figcaption>${caption}</figcaption>\n`;
    html += '</figure>';
    setOutput(html);
  };

  return (
    <VStack>
      <div><Label>Image URL (src)</Label><Input value={src} onChange={setSrc} placeholder="https://example.com/photo.jpg" /></div>
      <div><Label>Alt Text</Label><Input value={alt} onChange={setAlt} placeholder="A red fox in the snow" /></div>
      <div><Label>Caption</Label><Input value={caption} onChange={setCaption} placeholder="Fig 1. A red fox foraging in winter." /></div>
      <div><Label>Width (optional)</Label><Input value={width} onChange={setWidth} placeholder="600" /></div>
      <Btn onClick={build} disabled={!src.trim()}>Generate Figure</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Figure Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={6} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Details Accordion Generator Component
function HtmlDetailsAccordion() {
  const [rows, setRows] = useState([{ title:'What is your return policy?', body:'You can return items within 30 days.' }, { title:'Do you ship internationally?', body:'Yes, we ship worldwide.' }]);
  const [openFirst, setOpenFirst] = useState(false);
  const [output, setOutput] = useState('');

  const setRow = (i, key, v) => setRows(rows.map((r, idx) => idx === i ? { ...r, [key]: v } : r));

  const build = () => {
    const valid = rows.filter(r => r.title.trim());
    let html = '';
    valid.forEach((r, i) => {
      const open = (openFirst && i === 0) ? ' open' : '';
      html += `<details${open}>\n  <summary>${r.title.trim()}</summary>\n  <p>${r.body.trim()}</p>\n</details>\n`;
    });
    setOutput(html.trim());
  };

  return (
    <VStack>
      <div>
        <Label>Accordion Items</Label>
        <VStack gap={10}>
          {rows.map((r, i) => (
            <div key={i} style={{ padding:12, background:"rgba(255,255,255,0.03)", borderRadius:8, border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.orange }}>Item {i + 1}</span>
                {rows.length > 1 && <Btn size="sm" variant="danger" onClick={() => setRows(rows.filter((_, idx) => idx !== i))}>Remove</Btn>}
              </div>
              <Input value={r.title} onChange={v => setRow(i, 'title', v)} placeholder="Summary / question" />
              <div style={{ height:8 }} />
              <Textarea value={r.body} onChange={v => setRow(i, 'body', v)} rows={2} placeholder="Details / answer" />
            </div>
          ))}
        </VStack>
        <div style={{ marginTop:8 }}>
          <Btn size="sm" variant="secondary" onClick={() => setRows([...rows, { title:'', body:'' }])}>+ Add Item</Btn>
        </div>
      </div>
      <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13 }}>
        <input type="checkbox" checked={openFirst} onChange={e => setOpenFirst(e.target.checked)} />
        Open first item by default
      </label>
      <Btn onClick={build}>Generate Accordion</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Accordion Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Definition List Generator Component
function HtmlDefinitionList() {
  const [items, setItems] = useState('HTML: HyperText Markup Language\nCSS: Cascading Style Sheets\nJS: JavaScript');
  const [output, setOutput] = useState('');

  const build = () => {
    const lines = items.split('\n').map(l => l.trim()).filter(Boolean);
    let html = '<dl>\n';
    lines.forEach(line => {
      const idx = line.indexOf(':');
      if (idx === -1) { html += `  <dt>${line}</dt>\n`; return; }
      const term = line.slice(0, idx).trim();
      const def = line.slice(idx + 1).trim();
      html += `  <dt>${term}</dt>\n  <dd>${def}</dd>\n`;
    });
    html += '</dl>';
    setOutput(html);
  };

  return (
    <VStack>
      <div>
        <Label>Terms &amp; Definitions (one per line, term: definition)</Label>
        <Textarea value={items} onChange={setItems} rows={8} mono placeholder="HTML: HyperText Markup Language" />
      </div>
      <Btn onClick={build} disabled={!items.trim()}>Generate Definition List</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Definition List Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML5 Semantic Layout Generator Component
function HtmlSemantic5Wrapper() {
  const [title, setTitle] = useState('My Page');
  const [nav, setNav] = useState(true);
  const [aside, setAside] = useState(true);
  const [sections, setSections] = useState('2');
  const [output, setOutput] = useState('');

  const build = () => {
    const secCount = Math.max(1, Math.min(6, parseInt(sections) || 1));
    let html = '<body>\n';
    html += `  <header>\n    <h1>${title || 'My Page'}</h1>\n`;
    if (nav) html += '    <nav>\n      <ul>\n        <li><a href="#">Home</a></li>\n        <li><a href="#">About</a></li>\n      </ul>\n    </nav>\n';
    html += '  </header>\n\n';
    html += '  <main>\n    <article>\n';
    for (let i = 1; i <= secCount; i++) {
      html += `      <section>\n        <h2>Section ${i}</h2>\n        <p>Content goes here.</p>\n      </section>\n`;
    }
    html += '    </article>\n';
    if (aside) html += '    <aside>\n      <h2>Related</h2>\n      <p>Sidebar content.</p>\n    </aside>\n';
    html += '  </main>\n\n';
    html += '  <footer>\n    <p>&copy; 2026 Example</p>\n  </footer>\n</body>';
    setOutput(html);
  };

  return (
    <VStack>
      <div><Label>Page Heading (H1)</Label><Input value={title} onChange={setTitle} placeholder="My Page" /></div>
      <div><Label>Number of Sections (1-6)</Label><Input value={sections} onChange={setSections} placeholder="2" /></div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:"8px 16px" }}>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={nav} onChange={e => setNav(e.target.checked)} />Include &lt;nav&gt;
        </label>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={aside} onChange={e => setAside(e.target.checked)} />Include &lt;aside&gt;
        </label>
      </div>
      <Btn onClick={build}>Generate Semantic Layout</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML5 Semantic Skeleton</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={14} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Blockquote Generator Component
function HtmlBlockquoteGenerator() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [cite, setCite] = useState('');
  const [output, setOutput] = useState('');

  const build = () => {
    if (!quote.trim()) return;
    const citeAttr = cite ? ` cite="${cite}"` : '';
    let html;
    if (author) {
      html = `<figure>\n  <blockquote${citeAttr}>\n    <p>${quote.trim()}</p>\n  </blockquote>\n  <figcaption>— <cite>${author}</cite></figcaption>\n</figure>`;
    } else {
      html = `<blockquote${citeAttr}>\n  <p>${quote.trim()}</p>\n</blockquote>`;
    }
    setOutput(html);
  };

  return (
    <VStack>
      <div><Label>Quote Text</Label><Textarea value={quote} onChange={setQuote} rows={3} placeholder="The only way to do great work is to love what you do." /></div>
      <div><Label>Author / Source (optional)</Label><Input value={author} onChange={setAuthor} placeholder="Steve Jobs" /></div>
      <div><Label>Cite URL (optional)</Label><Input value={cite} onChange={setCite} placeholder="https://example.com/source" /></div>
      <Btn onClick={build} disabled={!quote.trim()}>Generate Blockquote</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Blockquote Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Nav Menu Generator Component
function HtmlNavMenuGenerator() {
  const [items, setItems] = useState('Home|/\nAbout|/about\nServices|/services\nContact|/contact');
  const [ariaLabel, setAriaLabel] = useState('Main');
  const [output, setOutput] = useState('');

  const build = () => {
    const lines = items.split('\n').map(l => l.trim()).filter(Boolean);
    const label = ariaLabel ? ` aria-label="${ariaLabel}"` : '';
    let html = `<nav${label}>\n  <ul>\n`;
    lines.forEach(line => {
      const parts = line.includes('|') ? line.split('|') : [line, '#'];
      const text = parts[0].trim();
      const url = (parts[1] !== undefined ? parts[1] : '#').trim() || '#';
      html += `    <li><a href="${url}">${text}</a></li>\n`;
    });
    html += '  </ul>\n</nav>';
    setOutput(html);
  };

  return (
    <VStack>
      <div>
        <Label>Menu Items (one per line, label|url)</Label>
        <Textarea value={items} onChange={setItems} rows={7} mono placeholder="Home|/&#10;About|/about" />
      </div>
      <div><Label>Nav aria-label (optional)</Label><Input value={ariaLabel} onChange={setAriaLabel} placeholder="Main" /></div>
      <Btn onClick={build} disabled={!items.trim()}>Generate Nav Menu</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>HTML Nav Menu Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Attribute Remover Component
function HtmlAttributeRemover() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('all');
  const [attrName, setAttrName] = useState('style');
  const [output, setOutput] = useState('');

  const build = () => {
    if (!input.trim()) return;
    let result;
    if (mode === 'all') {
      result = input.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g,
        (m, close, name, attrs, selfclose) => `<${close}${name}${selfclose ? ' /' : ''}>`);
    } else {
      const n = (attrName || '').trim();
      if (!n) { setOutput('Enter an attribute name to remove.'); return; }
      const re = new RegExp(`\\s+${n.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(=("[^"]*"|'[^']*'|[^\\s>]*))?`, 'gi');
      result = input.replace(/<[^>]+>/g, tag => tag.replace(re, ''));
    }
    setOutput(result);
  };

  return (
    <VStack>
      <div>
        <Label>HTML Code</Label>
        <Textarea value={input} onChange={setInput} rows={9} mono placeholder='<div class="box" id="main" style="color:red">Hello</div>' />
      </div>
      <div>
        <Label>Mode</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'all', label:'Remove ALL attributes' },
          { value:'named', label:'Remove one named attribute' }
        ]} />
      </div>
      {mode === 'named' && (
        <div><Label>Attribute Name</Label><Input value={attrName} onChange={setAttrName} placeholder="style" /></div>
      )}
      <Btn onClick={build} disabled={!input.trim()}>Remove Attributes</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Cleaned HTML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
    </VStack>
  );
}

// HTML Character Entity Finder Component
const ENTITY_NAMES = { '&':'amp','<':'lt','>':'gt','"':'quot',"'":'#39','©':'copy','®':'reg','™':'trade','€':'euro','£':'pound','¥':'yen','¢':'cent','°':'deg','±':'plusmn','×':'times','÷':'divide','—':'mdash','–':'ndash','…':'hellip','“':'ldquo','”':'rdquo','‘':'lsquo','’':'rsquo','«':'laquo','»':'raquo','•':'bull','§':'sect','¶':'para','†':'dagger','‡':'Dagger','‰':'permil','µ':'micro','¼':'frac14','½':'frac12','¾':'frac34','¹':'sup1','²':'sup2','³':'sup3','←':'larr','→':'rarr','↑':'uarr','↓':'darr','↔':'harr','⇐':'lArr','⇒':'rArr','∞':'infin','≈':'asymp','≠':'ne','≤':'le','≥':'ge','∑':'sum','∏':'prod','√':'radic','∂':'part','∫':'int','∆':'#8710','π':'pi','α':'alpha','β':'beta','γ':'gamma','δ':'delta','λ':'lambda','Ω':'Omega','★':'#9733','☆':'#9734','♥':'hearts','♦':'diams','♣':'clubs','♠':'spades','✓':'#10003','✔':'#10004','✗':'#10007','✘':'#10008','☑':'#9745','☒':'#9746','☐':'#9744','¡':'iexcl','¿':'iquest','ª':'ordf','º':'ordm' };

function HtmlCharEntityFinder() {
  const [input, setInput] = useState('');
  const [rows, setRows] = useState(null);

  const scan = () => {
    if (!input) { setRows([]); return; }
    const seen = new Map();
    for (const ch of input) {
      const code = ch.codePointAt(0);
      if (code < 32) continue; // control chars
      if (code >= 32 && code < 127 && !'&<>"\''.includes(ch)) continue; // plain printable ASCII
      if (seen.has(ch)) continue;
      const named = ENTITY_NAMES[ch];
      seen.set(ch, {
        char: ch,
        named: named ? (named.startsWith('#') ? null : `&${named};`) : null,
        numeric: `&#${code};`,
        hex: `&#x${code.toString(16).toUpperCase()};`,
        code
      });
    }
    setRows(Array.from(seen.values()));
  };

  return (
    <VStack>
      <div>
        <Label>Text to Scan</Label>
        <Textarea value={input} onChange={setInput} rows={7} placeholder="Café — €5 © 2026 ★ ☕ résumé" />
      </div>
      <Btn onClick={scan} disabled={!input}>Find Entities</Btn>
      {rows && (
        rows.length === 0 ? (
          <div style={{ padding:14, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, color:C.success, fontSize:13 }}>
            ✓ No special or non-ASCII characters found — this text is plain ASCII.
          </div>
        ) : (
          <div>
            <BigResult value={rows.length} label="Special Characters" />
            <div style={{ marginTop:16 }}>
              <Label>Entity Codes</Label>
              <Result mono>
                {rows.map((r, i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"40px 1fr 1fr 1fr", gap:8, marginBottom:4, alignItems:"center" }}>
                    <span style={{ fontSize:18, color:C.orange, textAlign:"center" }}>{r.char}</span>
                    <span>{r.named || '—'}</span>
                    <span>{r.numeric}</span>
                    <span>{r.hex}</span>
                  </div>
                ))}
              </Result>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                <CopyBtn text={rows.map(r => `${r.char}\t${r.named || ''}\t${r.numeric}\t${r.hex}`).join('\n')} />
              </div>
            </div>
          </div>
        )
      )}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "html-formatter": HtmlFormatter,
  "html-minifier": HtmlMinifier,
  "html-validator": HtmlValidator,
  "html-cleaner": HtmlCleaner,
  "html-compressor": HtmlCompressor,
  "html-to-text": HtmlToText,
  "html-to-markdown": HtmlToMarkdown,
  "markdown-to-html": MarkdownToHtml,
  "html-to-jsx": HtmlToJsx,
  "html-entities-encode": HtmlEntitiesEncode,
  "html-entities-decode": HtmlEntitiesDecode,
  "html-to-pdf-preview": HtmlToPdfPreview,
  "meta-tag-generator": MetaTagGenerator,
  "og-tag-generator": OgTagGenerator,
  "html-table-generator": HtmlTableGenerator,
  "html-list-generator": HtmlListGenerator,
  "html-color-codes": HtmlColorCodes,
  "html-link-generator": HtmlLinkGenerator,
  "html-image-tag": HtmlImageTag,
  "html-button-generator": HtmlButtonGenerator,
  "iframe-generator": IframeGenerator,
  "html-input-generator": HtmlInputGenerator,
  "html-tag-counter": HtmlTagCounter,
  "html-attribute-extractor": HtmlAttributeExtractor,
  "html-comment-remover": HtmlCommentRemover,
  "html-table-to-csv": HtmlTableToCsv,
  "schema-json-ld-generator": SchemaJsonLdGenerator,
  "html-boilerplate-generator": HtmlBoilerplateGenerator,
  "srcset-generator": SrcsetGenerator,
  "html-nl2br": HtmlNl2br,
  "html-data-uri": HtmlDataUri,
  "html-form-generator": HtmlFormGenerator,
  "html-select-generator": HtmlSelectGenerator,
  "html-video-tag": HtmlVideoTag,
  "html-audio-tag": HtmlAudioTag,
  "html-figure-generator": HtmlFigureGenerator,
  "html-details-accordion": HtmlDetailsAccordion,
  "html-definition-list": HtmlDefinitionList,
  "html-semantic5-wrapper": HtmlSemantic5Wrapper,
  "html-blockquote-generator": HtmlBlockquoteGenerator,
  "html-nav-menu-generator": HtmlNavMenuGenerator,
  "html-attribute-remover": HtmlAttributeRemover,
  "html-char-entity-finder": HtmlCharEntityFinder,
};

function Breadcrumb({ tool, cat }) {
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted, marginBottom:20 }}>
        <a href="https://toolsrift.com" style={{ color:C.muted, textDecoration:"none" }}>🏠 ToolsRift</a>
        {cat && <><span>›</span><a href={`#/category/${cat.id}`} style={{ color:C.muted, textDecoration:"none" }}>{cat.name}</a></>}
        {tool && <><span>›</span><span style={{ color:C.text }}>{tool.name}</span></>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "HTML Tools", "item": "https://toolsrift.com/html" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free HTML Tool | ToolsRift`;
  }, [toolId, tool, meta]);

  if (!tool || !ToolComp) {
    return (
      <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'} tools={TOOLS} subcats={CATEGORIES}>
        <div style={{ padding:'48px 20px', textAlign:'center', color:'#94A3B8' }}>
          Tool not found. <a href="#/" style={{ color: PAGE_THEME.color }}>← Back to {PAGE_THEME.name}</a>
        </div>
      </CategoryLayout>
    );
  }

  const toolData = {
    id: tool.id,
    name: tool.name,
    icon: tool.icon,
    description: meta?.desc || tool.desc,
    howTo: meta?.howTo,
    faq: meta?.faq,
  };
  const related = TOOLS.filter(t => t.id !== tool.id && t.cat === tool.cat).slice(0, 8);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId} tools={TOOLS} subcats={CATEGORIES}>
      <ToolPageLayout theme={PAGE_THEME} tool={toolData} tools={TOOLS} subcats={CATEGORIES} related={related}>
        <ToolComp />
      </ToolPageLayout>
    </CategoryLayout>
  );
}

function CategoryPage({ catId }) {
  const cat = CATEGORIES.find(c => c.id === catId);
  const catTools = TOOLS.filter(t => t.cat === catId);

  useEffect(() => {
    document.title = `${cat?.name || 'Category'} – HTML Tools | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.orange }}>← Back to home</a>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <div style={{ marginBottom:32 }}>
        <h1 style={{ ...T.h1, marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:32 }}>{cat.icon}</span> {cat.name}
        </h1>
        <p style={{ fontSize:14, color:C.muted, lineHeight:1.6 }}>{cat.desc}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 }}>
        {catTools.map(tool => (
          <a key={tool.id} href={`#/tool/${tool.id}`} style={{ textDecoration:"none", display:"block" }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, transition:"all .2s", cursor:"pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{tool.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>{tool.name}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:10 }}>{tool.desc}</div>
              <Badge color="green">Free</Badge>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(() => {
    document.title = "Free HTML Tools – Format, Convert, Generate HTML Online | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search HTML tools..."
      />
    </CategoryLayout>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark] = useState(true);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(249,115,22,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.orange, textDecoration:"none" }}>{THEME?.name||"HTML Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(249,115,22,0.12)", color:C.orange, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(249,115,22,0.25)" }}>{TOOLS.length} tools</span>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, color:"#E2E8F0", textDecoration:"none", background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}` }}>🏠 Home</a>
      </div>
    </nav>
  );
}

function SiteFooter({ currentPage }) {
  const pages = [
    {href:"/business",icon:"💼",label:"Business"},
    {href:"/text",icon:"✍️",label:"Text Tools"},
    {href:"/json",icon:"🧑‍💻",label:"Dev Tools"},
    {href:"/encoders",icon:"🔐",label:"Encoders"},
    {href:"/colors",icon:"🎨",label:"Color Tools"},
    {href:"/units",icon:"📏",label:"Unit Converters"},
    {href:"/hash",icon:"🔒",label:"Hash & Crypto"},
    {href:"/css",icon:"✨",label:"CSS Tools"},
    {href:"/images",icon:"🖼️",label:"Image Tools"},
    {href:"/pdf",icon:"📄",label:"PDF Tools"},
    {href:"/generators",icon:"⚡",label:"Generators"},
    {href:"/generators2",icon:"✍️",label:"Content Gen"},
    {href:"/devgen",icon:"⚙️",label:"Dev Config"},
    {href:"/mathcalc",icon:"📐",label:"Math Calc"},
    {href:"/financecalc",icon:"💰",label:"Finance Calc"},
    {href:"/devtools",icon:"🛠️",label:"Dev Tools"},
    {href:"/js",icon:"📜",label:"JS Tools"},
    {href:"/converters2",icon:"🔄",label:"More Converters"},
    { href: "/about", icon: "ℹ️", label: "About" },
    { href: "/privacy-policy", icon: "🔏", label: "Privacy Policy" },
  ].filter(p => !p.href.endsWith("/"+currentPage));

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
        <a href="/" style={{fontSize:12,color:"#F97316",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {pages.map(p => (
          <a key={p.href} href={p.href} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",fontSize:12,fontWeight:500,color:"#64748B",textDecoration:"none"}}
            onMouseEnter={e=>{e.currentTarget.style.color="#E2E8F0";e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.background="rgba(255,255,255,0.06)";}}
            onMouseLeave={e=>{e.currentTarget.style.color="#64748B";e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.background="rgba(255,255,255,0.03)";}}>
            <span>{p.icon}</span>{p.label}
          </a>
        ))}
      </div>
      <div style={{textAlign:"center",fontSize:11,color:"#334155"}}>© 2026 ToolsRift · Free online tools · No signup required</div>
    </div>
  );
}

function ToolsRiftHTML() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="html"/>}
    </div>
  );
}

export default ToolsRiftHTML;