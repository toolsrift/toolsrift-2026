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
    if (parts[0]==="category" && parts[1]) return { page:"category", catId:parts[1] };
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

  // Tools & Utilities
  { id:"html-tag-counter", cat:"tools", name:"HTML Tag Counter", desc:"Count how many of each HTML tag exists in your code with detailed statistics breakdown", icon:"🔢", free:true },
  { id:"html-attribute-extractor", cat:"tools", name:"HTML Attribute Extractor", desc:"Extract all attributes from specific HTML elements and list their names and values", icon:"🔍", free:true },
  { id:"html-comment-remover", cat:"tools", name:"HTML Comment Remover", desc:"Remove all HTML comments from code including multi-line and conditional comments", icon:"💬", free:true },
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
      
      const h = Math.round(Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180 / Math.PI);
      const l = (r + g + b) / 3 / 255 * 100;
      const s = l > 0 ? ((Math.max(r, g, b) - Math.min(r, g, b)) / 255 / (1 - Math.abs(2 * l / 100 - 1)) * 100) : 0;
      setHsl(`hsl(${h}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`);
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
      <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
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
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <ToolPageLayout theme={PAGE_THEME} tool={toolData} related={related}>
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
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
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
        <span style={{ width:8, height:8, borderRadius:"50%", background:C.orange, boxShadow:`0 0 6px ${C.orange}80`, flexShrink:0 }}/>
        <a href="https://toolsrift.com" style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:C.text, textDecoration:"none", letterSpacing:"-0.01em" }}>ToolsRift</a>
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