import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 1: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("formatters");
const PAGE_THEME = getCategoryById('formatters');
const BRAND = { name: "ToolsRift", tagline: "Code Formatters" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  teal: "#14B8A6", tealD: "#0D9488",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(20,184,166,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "teal" }) {
  const map = { teal:"rgba(20,184,166,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { teal:"#2DD4BF", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.teal, color:textMap[color]||textMap.teal, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.teal; const ACCENTD = C.tealD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(20,184,166,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.teal} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.teal} onBlur={e => e.target.style.borderColor=C.border} />
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(20,184,166,0.08)", border:`1px solid rgba(20,184,166,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.teal }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.teal }}>{value}</div>
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
  // Language Formatters
  { id:"css-formatter", cat:"formatters", name:"CSS Formatter", desc:"Beautify and format CSS code with proper indentation and structure for better readability", icon:"🎨", free:true },
  { id:"css-minifier", cat:"formatters", name:"CSS Minifier", desc:"Minify CSS by removing whitespace, comments, and unnecessary characters to reduce file size", icon:"🗜️", free:true },
  { id:"sql-formatter", cat:"formatters", name:"SQL Formatter", desc:"Format SQL queries with proper keywords capitalization, indentation, and line breaks", icon:"🗄️", free:true },
  { id:"xml-formatter", cat:"formatters", name:"XML Formatter", desc:"Beautify XML with proper indentation and structure for better readability and debugging", icon:"📄", free:true },
  { id:"xml-minifier", cat:"formatters", name:"XML Minifier", desc:"Minify XML by removing whitespace and line breaks to create compact output", icon:"📦", free:true },
  { id:"yaml-formatter", cat:"formatters", name:"YAML Formatter", desc:"Format and validate YAML configuration files with proper indentation and structure", icon:"⚙️", free:true },
  { id:"toml-formatter", cat:"formatters", name:"TOML Formatter", desc:"Format TOML configuration files with proper structure and indentation", icon:"📋", free:true },
  { id:"graphql-formatter", cat:"formatters", name:"GraphQL Formatter", desc:"Format GraphQL queries and schemas with proper indentation and structure", icon:"📊", free:true },
  { id:"php-formatter", cat:"formatters", name:"PHP Formatter", desc:"Format PHP code with proper indentation, brackets, and PSR standards", icon:"🐘", free:true },
  { id:"python-formatter", cat:"formatters", name:"Python Code Cleaner", desc:"Convert tabs to spaces, trim trailing whitespace and tidy blank lines in Python", icon:"🐍", free:true },
  { id:"java-formatter", cat:"formatters", name:"Java Formatter", desc:"Format Java code with proper indentation, brackets, and Java conventions", icon:"☕", free:true },
  { id:"cpp-formatter", cat:"formatters", name:"C/C++ Formatter", desc:"Format C and C++ code with proper indentation and bracket placement", icon:"⚡", free:true },
  { id:"csharp-formatter", cat:"formatters", name:"C# Formatter", desc:"Format C# code with proper indentation and Microsoft coding conventions", icon:"🔷", free:true },
  { id:"scss-formatter", cat:"formatters", name:"SCSS/LESS Formatter", desc:"Beautify SCSS, LESS and CSS with brace-based indentation and one declaration per line", icon:"💅", free:true },
  { id:"ini-formatter", cat:"formatters", name:"INI Formatter", desc:"Clean up INI config files with normalized sections, spacing around equals and tidy blank lines", icon:"🧾", free:true },
  { id:"properties-formatter", cat:"formatters", name:"Java Properties Formatter", desc:"Normalize Java .properties files to key=value form, group comments and optionally sort keys", icon:"🔑", free:true },
  { id:"sql-minifier", cat:"formatters", name:"SQL Minifier", desc:"Minify SQL by stripping comments and collapsing whitespace while preserving string literals", icon:"🗜️", free:true },

  // Code Converters
  { id:"json-to-xml", cat:"converters", name:"JSON to XML", desc:"Convert JSON data to XML format with proper tags and structure", icon:"📝", free:true },
  { id:"xml-to-json", cat:"converters", name:"XML to JSON", desc:"Convert XML to JSON format preserving data structure and hierarchy", icon:"🔄", free:true },
  { id:"json-to-yaml", cat:"converters", name:"JSON to YAML", desc:"Convert JSON to YAML format with proper indentation and structure", icon:"📋", free:true },
  { id:"yaml-to-json", cat:"converters", name:"YAML to JSON", desc:"Convert YAML to JSON format with proper parsing and validation", icon:"🔃", free:true },
  { id:"json-to-csv", cat:"converters", name:"JSON to CSV", desc:"Convert JSON array to CSV table format for spreadsheet import", icon:"📊", free:true },
  { id:"csv-to-json", cat:"converters", name:"CSV to JSON", desc:"Convert CSV table to JSON array format with proper parsing", icon:"📈", free:true },
  { id:"json-to-toml", cat:"converters", name:"JSON to TOML", desc:"Convert JSON to TOML configuration format with proper syntax", icon:"⚙️", free:true },
  { id:"toml-to-json", cat:"converters", name:"TOML to JSON", desc:"Convert TOML configuration to JSON format with validation", icon:"🔧", free:true },
  { id:"tsv-to-csv", cat:"converters", name:"TSV to CSV", desc:"Convert tab-separated values to CSV with proper quoting for fields containing commas or quotes", icon:"📑", free:true },
  { id:"csv-to-markdown", cat:"converters", name:"CSV to Markdown Table", desc:"Convert CSV data into a clean, aligned GitHub-flavored Markdown table with a header row", icon:"📋", free:true },
  { id:"jsonc-to-json", cat:"converters", name:"JSONC to JSON", desc:"Strip comments and trailing commas from JSONC, then validate and reformat as clean JSON", icon:"🧹", free:true },
  { id:"json-to-query-string", cat:"converters", name:"JSON to Query String", desc:"Convert a flat JSON object into a URL-encoded query string with repeated keys for arrays", icon:"🔗", free:true },

  // Code Utilities
  { id:"line-counter", cat:"tools", name:"Line Counter", desc:"Count lines of code, blank lines, comment lines, and character statistics", icon:"🔢", free:true },
  { id:"code-diff", cat:"tools", name:"Code Diff Viewer", desc:"Compare two code snippets and highlight differences with additions and deletions", icon:"🔍", free:true },
  { id:"indentation-converter", cat:"tools", name:"Indentation Converter", desc:"Convert between tabs and spaces with customizable tab size for code formatting", icon:"↹", free:true },
  { id:"code-beautifier", cat:"tools", name:"Universal Code Beautifier", desc:"Generic code beautifier that works with any programming language syntax", icon:"✨", free:true },
  { id:"csv-column-aligner", cat:"tools", name:"CSV Column Aligner", desc:"Align CSV columns into an even monospace table so data is easy to read and scan", icon:"📐", free:true },
  { id:"env-file-sorter", cat:"tools", name:"Env File Sorter", desc:"Sort .env files alphabetically by key, keep comments grouped and drop empty lines", icon:"🔀", free:true },
  { id:"whitespace-normalizer", cat:"tools", name:"Whitespace Normalizer", desc:"Normalize line endings to LF, strip trailing whitespace and collapse trailing blank lines", icon:"🧽", free:true },
  { id:"blank-line-collapser", cat:"tools", name:"Blank Line Collapser", desc:"Collapse runs of consecutive blank lines into a single blank line for tidy documents", icon:"➖", free:true },
];

const CATEGORIES = [
  { id:"formatters", name:"Language Formatters", icon:"✨", desc:"Format and beautify code in various programming languages" },
  { id:"converters", name:"Code Converters", icon:"🔄", desc:"Convert between different code and data formats" },
  { id:"tools", name:"Code Utilities", icon:"🔧", desc:"Analyze, compare, and transform code structure" },
];

const TOOL_META = {
  "css-formatter": {
    title: "Free CSS Formatter – Beautify CSS Code Online | ToolsRift",
    desc: "Format and beautify CSS with proper indentation. Clean up messy CSS code with our free online formatter. Supports nested selectors and media queries.",
    faq: [
      ["How does CSS formatting work?", "The formatter parses your CSS and rebuilds it with proper indentation, line breaks between rules, and consistent spacing around selectors and properties."],
      ["Can it format SCSS or SASS?", "This tool formats standard CSS. For SCSS/SASS, use a dedicated preprocessor formatter, though basic CSS formatting will still improve readability."],
      ["Does formatting affect CSS output?", "No, formatting only affects whitespace and structure. The CSS rules and their effects on your webpage remain completely unchanged."]
    ]
  },
  "css-minifier": {
    title: "Free CSS Minifier – Minify CSS Code Online | ToolsRift",
    desc: "Minify CSS by removing whitespace and comments. Reduce CSS file size for faster page load. Free minification with compression statistics.",
    faq: [
      ["What does CSS minification remove?", "Minification removes whitespace, line breaks, comments, and can shorten color codes (like #ffffff to #fff) to create the smallest valid CSS."],
      ["How much can I reduce file size?", "Typical reduction is 20-40% depending on formatting style. CSS with lots of comments and indentation compresses more significantly."],
      ["Should I minify CSS for production?", "Yes, minified CSS loads faster. Most build tools automatically minify CSS. This tool is useful for manual optimization or testing."]
    ]
  },
  "sql-formatter": {
    title: "Free SQL Formatter – Format SQL Queries Online | ToolsRift",
    desc: "Format SQL queries with proper indentation and keyword capitalization. Beautify SQL for better readability and debugging.",
    faq: [
      ["What SQL dialects are supported?", "The formatter works with standard SQL syntax including SELECT, INSERT, UPDATE, DELETE, JOIN, and common keywords. It handles MySQL, PostgreSQL, and SQL Server syntax."],
      ["Does it validate SQL syntax?", "This tool formats SQL but doesn't fully validate it. It improves readability but won't catch all syntax errors. Test queries in your database."],
      ["Can it format complex queries?", "Yes, it handles nested queries, multiple JOINs, CASE statements, and complex WHERE clauses with proper indentation for each level."]
    ]
  },
  "xml-formatter": {
    title: "Free XML Formatter – Beautify XML Code Online | ToolsRift",
    desc: "Format XML with proper indentation and structure. Beautify messy XML for better readability and validation.",
    faq: [
      ["How does XML formatting work?", "The formatter parses your XML and rebuilds it with proper indentation for nested elements, making the structure clear and easy to read."],
      ["Can it handle large XML files?", "The tool works best with XML up to a few hundred KB. Very large files may be slow. For production, use dedicated XML processors."],
      ["Does it validate XML syntax?", "The formatter attempts to parse XML and will show errors if the XML is malformed. It checks basic structure but not against schemas."]
    ]
  },
  "xml-minifier": {
    title: "Free XML Minifier – Minify XML Code Online | ToolsRift",
    desc: "Minify XML by removing whitespace and line breaks. Compress XML files for faster transmission and storage.",
    faq: [
      ["What does XML minification remove?", "Minification removes whitespace between tags, line breaks, and unnecessary spacing while preserving all element content and attributes."],
      ["Will minification affect XML parsing?", "No, minified XML is fully valid and parses identically to formatted XML. Only whitespace is removed, not content."],
      ["When should I minify XML?", "Minify XML for network transmission (APIs, web services) or storage. Keep XML formatted in source code for readability."]
    ]
  },
  "yaml-formatter": {
    title: "Free YAML Formatter – Format YAML Files Online | ToolsRift",
    desc: "Format and validate YAML configuration files. Fix indentation and structure for valid YAML syntax.",
    faq: [
      ["Why is YAML indentation important?", "YAML uses indentation to define structure, like Python. Incorrect indentation changes meaning or makes YAML invalid. Proper formatting ensures correct parsing."],
      ["Can it convert between YAML styles?", "The formatter uses standard YAML style with 2-space indentation. It normalizes different styles to consistent formatting."],
      ["Does it validate YAML syntax?", "Yes, the formatter attempts to parse YAML and will show errors if the syntax is invalid, helping you debug configuration files."]
    ]
  },
  "toml-formatter": {
    title: "Free TOML Formatter – Format TOML Files Online | ToolsRift",
    desc: "Format TOML configuration files with proper structure. Beautify TOML for better readability and validation.",
    faq: [
      ["What is TOML used for?", "TOML (Tom's Obvious, Minimal Language) is used for configuration files, especially in Rust projects (Cargo.toml), Python (pyproject.toml), and other tools."],
      ["How does TOML differ from YAML?", "TOML is more explicit and less ambiguous than YAML. It uses clear key-value pairs and tables, making it easier to read and less error-prone."],
      ["Can it validate TOML syntax?", "Yes, the formatter parses TOML and reports syntax errors, helping you debug configuration files before deployment."]
    ]
  },
  "graphql-formatter": {
    title: "Free GraphQL Formatter – Format GraphQL Queries Online | ToolsRift",
    desc: "Format GraphQL queries and schemas with proper indentation. Beautify GraphQL for better readability.",
    faq: [
      ["What GraphQL syntax is supported?", "The formatter handles queries, mutations, subscriptions, fragments, and schema definitions with proper indentation and structure."],
      ["Does it validate GraphQL?", "Basic syntax formatting is provided. For full validation against a schema, use GraphQL server validation or schema-aware tools."],
      ["Can it format schema definitions?", "Yes, the formatter works with both GraphQL queries and schema definition language (SDL) for types, inputs, and directives."]
    ]
  },
  "php-formatter": {
    title: "Free PHP Formatter – Format PHP Code Online | ToolsRift",
    desc: "Format PHP code with proper indentation and PSR standards. Beautify PHP for better readability and consistency.",
    faq: [
      ["What PHP standards are used?", "The formatter follows PSR-2 style guidelines including 4-space indentation, opening braces on new lines for classes, and consistent spacing."],
      ["Can it format PHP mixed with HTML?", "The tool works best with pure PHP code. For mixed PHP/HTML, it will format PHP blocks but may not perfectly handle HTML context."],
      ["Does it check PHP syntax?", "This is a formatter, not a validator. It improves code structure but doesn't check for syntax errors. Use PHP's built-in syntax checker for validation."]
    ]
  },
  "python-formatter": {
    title: "Free Python Code Cleaner – Tabs to Spaces, Trim Whitespace | ToolsRift",
    desc: "Clean up Python code online: convert tabs to 4 spaces, strip trailing whitespace and cap blank lines. Safe, in-browser, never re-indents your code.",
    faq: [
      ["What does this tool do?", "It normalises Python whitespace — converts tabs to 4 spaces, removes trailing whitespace on each line, and collapses runs of blank lines to at most two (PEP8's maximum)."],
      ["Does it re-indent or reformat my code?", "No. Python's indentation is meaningful, so re-deriving it could change what your code does. This tool only normalises whitespace it can safely touch. For full auto-formatting, run Black or autopep8 locally."],
      ["Why convert tabs to spaces?", "Mixing tabs and spaces is a common cause of Python IndentationErrors. PEP8 recommends 4 spaces per indent level, so this tool standardises on that."]
    ]
  },
  "java-formatter": {
    title: "Free Java Formatter – Format Java Code Online | ToolsRift",
    desc: "Format Java code with proper indentation and brackets. Beautify Java following Oracle conventions.",
    faq: [
      ["What Java style is used?", "The formatter follows Oracle Java conventions including 4-space indentation, opening braces on same line for methods, and consistent spacing."],
      ["Can it format all Java versions?", "Yes, the formatter works with Java syntax from all versions including modern features like lambda expressions and records."],
      ["Does it handle annotations?", "Yes, the formatter properly indents and spaces Java annotations, keeping them readable and following conventions."]
    ]
  },
  "cpp-formatter": {
    title: "Free C/C++ Formatter – Format C++ Code Online | ToolsRift",
    desc: "Format C and C++ code with proper indentation. Beautify C++ with consistent bracket placement and spacing.",
    faq: [
      ["What bracket style is used?", "The formatter uses Allman style (braces on new lines) by default, which is common in C/C++. This can be customized."],
      ["Does it work with modern C++?", "Yes, the formatter handles modern C++ syntax including templates, lambda expressions, and C++11/14/17/20 features."],
      ["Can it format C and C++ equally?", "Yes, the formatter works with both C and C++ syntax, handling preprocessor directives, pointers, and language-specific features."]
    ]
  },
  "csharp-formatter": {
    title: "Free C# Formatter – Format C# Code Online | ToolsRift",
    desc: "Format C# code with proper indentation and Microsoft conventions. Beautify C# for better readability.",
    faq: [
      ["What C# conventions are followed?", "The formatter follows Microsoft C# conventions including 4-space indentation, opening braces on new lines, and consistent spacing."],
      ["Does it support modern C# features?", "Yes, the formatter handles modern C# including LINQ, async/await, records, pattern matching, and nullable reference types."],
      ["Can it format Unity C# scripts?", "Yes, the formatter works with Unity C# scripts. Unity uses standard C# syntax with Unity-specific APIs."]
    ]
  },
  "json-to-xml": {
    title: "Free JSON to XML Converter – Convert JSON to XML Online | ToolsRift",
    desc: "Convert JSON data to XML format with proper tags. Transform JSON objects to XML structure instantly.",
    faq: [
      ["How are JSON keys converted to XML?", "JSON keys become XML element names. Arrays create repeated elements. The root is wrapped in a container element."],
      ["What happens to JSON arrays?", "Arrays are converted to repeated XML elements with the same tag name, or wrapped in a container element for clarity."],
      ["Can I customize the XML output?", "Basic conversion is provided. For custom XML structure, attributes, or namespaces, use specialized conversion libraries."]
    ]
  },
  "xml-to-json": {
    title: "Free XML to JSON Converter – Convert XML to JSON Online | ToolsRift",
    desc: "Convert XML to JSON format preserving structure. Transform XML data to JSON for API use and JavaScript.",
    faq: [
      ["How are XML elements converted?", "XML elements become JSON objects. Repeated elements become arrays. Text content and attributes are preserved in the structure."],
      ["What happens to XML attributes?", "Attributes are typically converted to properties with an @ prefix (like @id) to distinguish them from child elements."],
      ["Can it handle complex XML?", "Yes, the converter handles nested elements, mixed content, and attributes, but very complex XML may need specialized processing."]
    ]
  },
  "json-to-yaml": {
    title: "Free JSON to YAML Converter – Convert JSON to YAML Online | ToolsRift",
    desc: "Convert JSON to YAML format with proper indentation. Transform JSON data to YAML configuration files.",
    faq: [
      ["Why convert JSON to YAML?", "YAML is more human-readable than JSON, making it better for configuration files. It's used in Docker, Kubernetes, CI/CD, and many tools."],
      ["Is the YAML output valid?", "Yes, the converter produces valid YAML that can be parsed by YAML libraries and tools."],
      ["Can I convert back to JSON?", "Yes, use our YAML to JSON converter to convert back. YAML is a superset of JSON, so conversion is reliable."]
    ]
  },
  "yaml-to-json": {
    title: "Free YAML to JSON Converter – Convert YAML to JSON Online | ToolsRift",
    desc: "Convert YAML to JSON format with validation. Transform YAML configuration files to JSON for APIs.",
    faq: [
      ["Is YAML compatible with JSON?", "YAML is a superset of JSON—all valid JSON is valid YAML. Converting YAML to JSON is straightforward and reliable."],
      ["What YAML features don't convert?", "YAML-specific features like anchors (&) and aliases (*) are resolved during conversion. Comments are removed as JSON doesn't support them."],
      ["Does it validate YAML syntax?", "Yes, the converter validates YAML syntax and reports errors if the YAML is malformed."]
    ]
  },
  "json-to-csv": {
    title: "Free JSON to CSV Converter – Convert JSON Array to CSV | ToolsRift",
    desc: "Convert JSON array to CSV table format. Transform JSON data to CSV for Excel and spreadsheet import.",
    faq: [
      ["What JSON structure is required?", "The JSON should be an array of objects with consistent keys. Each object becomes a row, and keys become column headers."],
      ["How are nested objects handled?", "Nested objects are flattened one level with dot notation (like user.name). For complex nesting, consider flattening JSON first."],
      ["Can I import the CSV to Excel?", "Yes, the output is standard CSV that can be opened in Excel, Google Sheets, or any spreadsheet application."]
    ]
  },
  "csv-to-json": {
    title: "Free CSV to JSON Converter – Convert CSV to JSON Array | ToolsRift",
    desc: "Convert CSV table to JSON array format. Transform spreadsheet data to JSON for APIs and JavaScript.",
    faq: [
      ["How are CSV headers handled?", "The first row is used as JSON object keys. Each subsequent row becomes an object in the JSON array."],
      ["What if CSV has no headers?", "The converter requires headers for proper JSON conversion. If your CSV has no headers, add a header row first."],
      ["Can it handle quoted values?", "Yes, the parser handles quoted CSV values, escaped quotes, and commas within quoted fields according to CSV standards."]
    ]
  },
  "json-to-toml": {
    title: "Free JSON to TOML Converter – Convert JSON to TOML Config | ToolsRift",
    desc: "Convert JSON to TOML configuration format. Transform JSON data to TOML for Rust, Python, and config files.",
    faq: [
      ["What is TOML good for?", "TOML is excellent for configuration files. It's more readable than JSON and less ambiguous than YAML, used in Cargo, pyproject.toml, and more."],
      ["How are JSON structures converted?", "Objects become TOML tables, nested objects become table sections, and arrays are preserved with TOML array syntax."],
      ["Can all JSON convert to TOML?", "Most JSON converts cleanly. Very deep nesting or special structures may need adjustment. TOML prefers flat, clear structure."]
    ]
  },
  "toml-to-json": {
    title: "Free TOML to JSON Converter – Convert TOML to JSON Online | ToolsRift",
    desc: "Convert TOML configuration to JSON format. Transform TOML files to JSON for APIs and JavaScript.",
    faq: [
      ["Why convert TOML to JSON?", "JSON is universal for APIs and JavaScript. Converting TOML config to JSON enables processing with standard JSON tools and libraries."],
      ["Are TOML tables preserved?", "Yes, TOML tables become JSON objects, preserving the structure and hierarchy of your configuration."],
      ["Does it validate TOML?", "Yes, the converter validates TOML syntax and reports parsing errors if the TOML is malformed."]
    ]
  },
  "line-counter": {
    title: "Free Line Counter – Count Lines of Code Online | ToolsRift",
    desc: "Count lines of code, blank lines, and comment lines. Analyze code statistics with detailed breakdown.",
    faq: [
      ["What metrics does it count?", "The tool counts total lines, code lines (non-blank, non-comment), blank lines, comment lines, and character count."],
      ["How are comments detected?", "The tool detects common comment patterns including //, /* */, #, and <!-- --> for different languages."],
      ["Can I use it for code analysis?", "Yes, line counts help measure code size, complexity, and maintenance burden. It's useful for project metrics and documentation."]
    ]
  },
  "code-diff": {
    title: "Free Code Diff Viewer – Compare Code Side by Side | ToolsRift",
    desc: "Compare two code snippets and highlight differences. See additions in green and deletions in red with side-by-side comparison.",
    faq: [
      ["How does the diff algorithm work?", "The tool compares code line-by-line, highlighting added lines in green and removed lines in red, similar to git diff."],
      ["Can I compare any language?", "Yes, the diff tool is language-agnostic. It compares text line-by-line, working with any programming language or text format."],
      ["Is this suitable for code reviews?", "Yes, it's useful for quick comparisons and reviews. For production code reviews, use dedicated tools like GitHub or GitLab."]
    ]
  },
  "indentation-converter": {
    title: "Free Indentation Converter – Convert Tabs to Spaces | ToolsRift",
    desc: "Convert between tabs and spaces with customizable tab size. Fix code indentation for consistent formatting.",
    faq: [
      ["Tabs or spaces—which is better?", "It's a matter of preference and project standards. Spaces ensure consistent appearance across editors. Tabs let developers choose their preferred width."],
      ["What tab size should I use?", "Common sizes are 2 spaces (JavaScript, JSON), 4 spaces (Python, Java, C#), or 8 spaces (old C code). Follow your project's conventions."],
      ["Can it detect mixed indentation?", "The tool converts all indentation uniformly. If your code has mixed tabs/spaces, run the conversion to standardize it."]
    ]
  },
  "code-beautifier": {
    title: "Free Code Beautifier – Format Any Code Online | ToolsRift",
    desc: "Universal code beautifier for any programming language. Auto-detect language and format with proper indentation.",
    faq: [
      ["What languages are supported?", "The beautifier works with most common languages by applying universal formatting rules: proper indentation, consistent spacing, and line breaks."],
      ["How does it differ from language-specific formatters?", "Language-specific formatters understand syntax deeply. This universal tool applies general formatting principles that improve readability across languages."],
      ["Is the output production-ready?", "The output is more readable but may not match all style guides. For production, use language-specific formatters and linters."]
    ]
  },
  "scss-formatter": {
    title: "Free SCSS & LESS Formatter – Beautify Online | ToolsRift",
    desc: "Beautify SCSS, LESS and CSS code with brace-based indentation and one declaration per line. Free online formatter that keeps comments and nested rules intact.",
    faq: [
      ["Does it work for SCSS, LESS and CSS?", "Yes. All three share the same brace-and-semicolon block syntax, so the formatter re-indents nested rules and declarations consistently for any of them."],
      ["Will it break my URLs or comments?", "No. Values inside url() and strings are preserved, and both /* block */ and // line comments are kept on their own lines."],
      ["Does formatting change how my styles render?", "No. Only whitespace, indentation and line breaks change. The selectors, properties and values stay exactly the same."]
    ]
  },
  "ini-formatter": {
    title: "Free INI Formatter – Clean INI Config Files | ToolsRift",
    desc: "Format and clean up INI configuration files online. Normalize sections, add consistent spacing around equals signs, trim keys and values and tidy blank lines.",
    faq: [
      ["What does the INI formatter change?", "It trims each line, puts one blank line before every [section] header, and rewrites entries as 'key = value' with a single space on each side of the equals sign."],
      ["Are comments preserved?", "Yes. Lines starting with ; or # are kept as-is so your documentation and disabled settings stay in place."],
      ["Does it validate the INI file?", "It normalizes structure rather than strictly validating. Entries without an equals sign are passed through unchanged so nothing is lost."]
    ]
  },
  "properties-formatter": {
    title: "Free Java Properties Formatter Online | ToolsRift",
    desc: "Clean up Java .properties files online. Normalize entries to key=value form, group comment lines together and optionally sort keys alphabetically for tidy configs.",
    faq: [
      ["What separators are supported?", "Both '=' and ':' are recognized as key-value separators. The output normalizes every entry to the conventional key=value form."],
      ["Can it sort the keys?", "Yes. Enable the sort option to reorder entries alphabetically by key, which makes large property files far easier to scan and diff."],
      ["Are comments kept?", "Comment lines starting with # or ! are collected and placed at the top so they aren't lost during formatting."]
    ]
  },
  "sql-minifier": {
    title: "Free SQL Minifier – Compress SQL Queries Online | ToolsRift",
    desc: "Minify SQL queries by removing comments and collapsing whitespace into a single line. String literals are preserved exactly, so the compact query still runs the same.",
    faq: [
      ["What does the SQL minifier remove?", "It strips -- line comments and /* block */ comments, then collapses all runs of whitespace and removes extra spaces around commas and semicolons."],
      ["Will it damage my string values?", "No. Text inside single-quoted string literals, including commas, spaces and escaped quotes, is preserved character-for-character."],
      ["Why minify SQL?", "Single-line SQL is easier to embed in code, logs or config, and smaller queries transmit slightly faster. The logic is unchanged."]
    ]
  },
  "tsv-to-csv": {
    title: "Free TSV to CSV Converter Online | ToolsRift",
    desc: "Convert tab-separated values (TSV) to CSV online. Fields containing commas, quotes or newlines are automatically quoted and escaped so the CSV stays valid.",
    faq: [
      ["How are special characters handled?", "Any field containing a comma, double quote or line break is wrapped in double quotes, and inner quotes are doubled, following the standard CSV escaping rules."],
      ["Does it change my data?", "No. Only the delimiter and escaping change. Every value from the TSV appears unchanged in the corresponding CSV cell."],
      ["Where does TSV data come from?", "Spreadsheets and databases often export or copy as tab-separated text. This tool turns that into comma-separated CSV for wider compatibility."]
    ]
  },
  "csv-to-markdown": {
    title: "Free CSV to Markdown Table Converter | ToolsRift",
    desc: "Convert CSV data into a clean, aligned GitHub-flavored Markdown table. The first row becomes the header, pipe characters are escaped and columns are padded evenly.",
    faq: [
      ["How is the table structured?", "The first CSV row becomes the table header, followed by a separator row of dashes, then one Markdown row per remaining line, with columns padded for readability."],
      ["Does it handle quoted CSV fields?", "Yes. Quoted fields containing commas or newlines are parsed correctly, and any pipe characters inside cells are escaped so the table doesn't break."],
      ["Where can I use the output?", "The Markdown works in GitHub, GitLab, README files, wikis, and most Markdown editors that support pipe tables."]
    ]
  },
  "jsonc-to-json": {
    title: "Free JSONC to JSON Converter – Strip Comments | ToolsRift",
    desc: "Convert JSONC to standard JSON online. Remove // and /* */ comments and trailing commas, then validate and pretty-print the result as clean, parseable JSON.",
    faq: [
      ["What is JSONC?", "JSONC is JSON with comments, used by config files like tsconfig.json and VS Code settings. Standard JSON parsers reject its comments and trailing commas."],
      ["Does it protect strings?", "Yes. Comment markers and commas inside string values are ignored, so URLs like http://example.com and comment-like text inside strings are preserved."],
      ["Is the output validated?", "Yes. After stripping comments and trailing commas the tool parses the JSON, so invalid input produces a clear error instead of broken output."]
    ]
  },
  "json-to-query-string": {
    title: "Free JSON to Query String Converter | ToolsRift",
    desc: "Convert a flat JSON object into a URL-encoded query string. Array values become repeated keys and every key and value is percent-encoded for safe use in URLs.",
    faq: [
      ["How are arrays handled?", "An array value is expanded into repeated key=value pairs, for example {\"t\":[\"a\",\"b\"]} becomes t=a&t=b, which most servers parse back into a list."],
      ["Is everything URL-encoded?", "Yes. Keys and values are passed through encodeURIComponent, so spaces, ampersands and other reserved characters are safely percent-encoded."],
      ["What about nested objects?", "Nested object values are serialized to JSON and encoded as a single value. For best results provide a flat object of simple key-value pairs."]
    ]
  },
  "csv-column-aligner": {
    title: "Free CSV Column Aligner – Format CSV Table | ToolsRift",
    desc: "Align CSV columns into an even monospace table. Each column is padded to its widest value so comma-separated data becomes a clean, readable, scannable grid.",
    faq: [
      ["What does the aligner do?", "It parses your CSV, measures the widest value in each column, and pads every cell so the columns line up perfectly when viewed in a monospace font."],
      ["Is it still valid CSV?", "The aligned output is a readable text table for viewing, not strict CSV. Use it to inspect data; keep the original CSV for machine processing."],
      ["Does it handle quoted fields?", "Yes. Fields wrapped in quotes with embedded commas are parsed correctly so the alignment reflects the real column values."]
    ]
  },
  "env-file-sorter": {
    title: "Free .env File Sorter – Sort Env Variables | ToolsRift",
    desc: "Sort .env files alphabetically by variable name. Comment lines are grouped at the top and blank lines removed, giving you a tidy, easy-to-diff environment file.",
    faq: [
      ["How are the variables sorted?", "Every KEY=VALUE line is sorted alphabetically by the key name using a case-aware comparison, making variables easy to find and diffs smaller."],
      ["What happens to comments?", "Comment lines starting with # are collected and placed at the top of the output so notes and section headers aren't lost."],
      ["Does it change my values?", "No. Only the order of lines changes. Each key and its exact value are preserved; empty lines are simply removed."]
    ]
  },
  "whitespace-normalizer": {
    title: "Free Whitespace Normalizer – Clean Text Online | ToolsRift",
    desc: "Normalize whitespace in any text. Convert CRLF and CR line endings to LF, strip trailing spaces and tabs from every line and collapse trailing blank lines to one.",
    faq: [
      ["What exactly gets normalized?", "Windows (CRLF) and old Mac (CR) line endings are converted to Unix LF, trailing spaces and tabs are removed from each line, and blank lines at the end collapse to a single newline."],
      ["Does it touch leading indentation?", "No. Only trailing whitespace is stripped, so your code indentation and intentional leading spaces stay intact."],
      ["Why normalize whitespace?", "Consistent line endings and no trailing spaces prevent noisy diffs, satisfy linters and avoid cross-platform text glitches."]
    ]
  },
  "blank-line-collapser": {
    title: "Free Blank Line Collapser – Remove Extra Lines | ToolsRift",
    desc: "Collapse runs of consecutive blank lines into a single blank line. Tidy up documents, code and notes by removing excessive vertical gaps while keeping paragraph breaks.",
    faq: [
      ["What does it do to blank lines?", "Any run of two or more consecutive blank lines is reduced to exactly one blank line, so single spacing between blocks is preserved."],
      ["Does it remove all blank lines?", "No. It keeps a single blank line between blocks so structure and readability are maintained; it only removes the excess."],
      ["Does it change line endings?", "It normalizes line endings to LF while collapsing blanks, so the output is consistent across editors and platforms."]
    ]
  }
};

// Basic brace-and-statement indenter for C-family languages (C/C++/C#/Java/PHP).
// Breaks lines on block braces and on statement-terminating `;`, but keeps `;`
// inside parentheses (so `for (i=0; i<n; i++)` stays on one line) and never
// breaks commas (so argument and parameter lists stay intact). It is a formatter,
// not a full parser — it re-indents readably without mangling code.
const formatCode = (code, indentSize = 2) => {
  const indent = ' '.repeat(indentSize);
  let level = 0;
  let paren = 0;          // depth of () — suppresses statement breaks inside for-headers, calls
  let result = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prev = code[i - 1];

    if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
      if (!inString) { inString = true; stringChar = char; }
      else if (char === stringChar) { inString = false; }
    }

    if (!inString) {
      if (char === '(') { paren++; result += char; continue; }
      if (char === ')') { paren = Math.max(0, paren - 1); result += char; continue; }
      // Only `{`/`}` open and close indented blocks. `[`/`]` (array types,
      // subscripts, literals) are appended literally so `String[]args`,
      // `int a[3]`, and `a[0]` are never split across lines.
      if (char === '{') {
        result += char + '\n';
        level++;
        result += indent.repeat(level);
        continue;
      }
      if (char === '}') {
        level = Math.max(0, level - 1);
        result = result.trimEnd() + '\n' + indent.repeat(level) + char;
        continue;
      }
      // Only break on `;` that actually ends a statement — not the ones inside a
      // for-loop header or any parenthesised expression.
      if (char === ';' && paren === 0) {
        result += char + '\n' + indent.repeat(level);
        continue;
      }
      if (char === '\n') {
        result += '\n' + indent.repeat(level);
        continue;
      }
    }

    result += char;
  }

  return result.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/\n\s*\n/g, '\n').trim();
};

// CSS Formatter Component
function CssFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');

  const format = () => {
    if (!input.trim()) return;
    const indentStr = ' '.repeat(parseInt(indent));
    let formatted = input.replace(/\s+/g, ' ').trim();
    formatted = formatted.replace(/\s*{\s*/g, ' {\n' + indentStr);
    formatted = formatted.replace(/\s*}\s*/g, '\n}\n');
    formatted = formatted.replace(/\s*;\s*/g, ';\n' + indentStr);
    formatted = formatted.replace(/,\s*/g, ', ');
    const lines = formatted.split('\n').filter(l => l.trim());
    setOutput(lines.join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>CSS Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder=".btn{color:red;padding:10px;}.btn:hover{background:#000;}" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{input.length} characters · {input.split('\n').length} lines</div>
      </div>
      <div>
        <Label>Indentation</Label>
        <SelectInput value={indent} onChange={setIndent} options={[
          { value:'2', label:'2 spaces' },
          { value:'4', label:'4 spaces' }
        ]} />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format CSS</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted CSS</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{output.length} characters · {output.split('\n').length} lines</div>
        </div>
      )}
    </VStack>
  );
}

// CSS Minifier Component
function CssMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);

  const minify = () => {
    if (!input.trim()) return;
    let minified = input;
    minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    minified = minified.replace(/\s+/g, ' ');
    minified = minified.replace(/\s*([{}:;,])\s*/g, '$1');
    minified = minified.trim();
    
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([minified]).size;
    const saved = originalSize - minifiedSize;
    const percentage = ((saved / originalSize) * 100).toFixed(1);
    
    setOutput(minified);
    setStats({ originalSize, minifiedSize, saved, percentage });
  };

  return (
    <VStack>
      <div>
        <Label>CSS Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder=".container {\n  width: 100%;\n  padding: 20px;\n}" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{new Blob([input]).size} bytes</div>
      </div>
      <Btn onClick={minify} disabled={!input.trim()}>Minify CSS</Btn>
      {stats && (
        <Grid3>
          <StatBox value={`${stats.originalSize}B`} label="Original" />
          <StatBox value={`${stats.minifiedSize}B`} label="Minified" />
          <StatBox value={`${stats.percentage}%`} label="Saved" />
        </Grid3>
      )}
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Minified CSS</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={6} mono />
        </div>
      )}
    </VStack>
  );
}

// SQL Formatter Component
function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'ALTER', 'DROP'];
    let formatted = input;
    
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, '\n' + kw);
    });
    
    formatted = formatted.replace(/,/g, ',\n  ');
    formatted = formatted.trim();
    formatted = formatted.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('AND') || trimmed.startsWith('OR')) {
        return '  ' + trimmed;
      }
      return trimmed;
    }).join('\n');
    
    setOutput(formatted);
  };

  return (
    <VStack>
      <div>
        <Label>SQL Query</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="select name,email from users where age>18 and status='active' order by created_at desc;" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format SQL</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted SQL</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// XML Formatter Component
function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');

  const format = () => {
    if (!input.trim()) return;
    try {
      const indentStr = ' '.repeat(parseInt(indent));
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, 'text/xml');
      
      const formatNode = (node, level = 0) => {
        let result = '';
        const ind = indentStr.repeat(level);
        
        if (node.nodeType === 1) {
          result += ind + '<' + node.nodeName;
          for (let attr of node.attributes || []) {
            result += ` ${attr.name}="${attr.value}"`;
          }
          
          if (node.childNodes.length === 0) {
            result += ' />\n';
          } else if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
            result += '>' + node.textContent + '</' + node.nodeName + '>\n';
          } else {
            result += '>\n';
            for (let child of node.childNodes) {
              if (child.nodeType === 1) {
                result += formatNode(child, level + 1);
              }
            }
            result += ind + '</' + node.nodeName + '>\n';
          }
        }
        return result;
      };
      
      setOutput(formatNode(xmlDoc.documentElement).trim());
    } catch (err) {
      setOutput('Error: Invalid XML - ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>XML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='<root><item id="1"><name>Test</name></item></root>' />
      </div>
      <div>
        <Label>Indentation</Label>
        <SelectInput value={indent} onChange={setIndent} options={[
          { value:'2', label:'2 spaces' },
          { value:'4', label:'4 spaces' }
        ]} />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format XML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted XML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// XML Minifier Component
function XmlMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const minify = () => {
    if (!input.trim()) return;
    const minified = input.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
    setOutput(minified);
  };

  return (
    <VStack>
      <div>
        <Label>XML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='<root>\n  <item>Content</item>\n</root>' />
      </div>
      <Btn onClick={minify} disabled={!input.trim()}>Minify XML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Minified XML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={6} mono />
        </div>
      )}
    </VStack>
  );
}

// YAML Formatter Component
function YamlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    try {
      const lines = input.split('\n');
      let formatted = [];
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          formatted.push(trimmed);
          return;
        }
        const level = (line.match(/^\s*/)[0].length / 2) || 0;
        formatted.push('  '.repeat(level) + trimmed);
      });
      setOutput(formatted.join('\n'));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>YAML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="name: John\nage: 30\naddress:\n  city: NYC" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format YAML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted YAML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// TOML Formatter Component
function TomlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const lines = input.split('\n').map(l => l.trim()).filter(l => l);
    setOutput(lines.join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>TOML Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='[package]\nname = "example"\nversion = "1.0.0"' />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format TOML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted TOML</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// GraphQL Formatter Component
function GraphqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    let formatted = input;
    formatted = formatted.replace(/{/g, ' {\n  ');
    formatted = formatted.replace(/}/g, '\n}');
    formatted = formatted.replace(/,/g, '\n  ');
    formatted = formatted.replace(/\n\s*\n/g, '\n');
    setOutput(formatted.trim());
  };

  return (
    <VStack>
      <div>
        <Label>GraphQL Query/Schema</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="query{user(id:1){name email}}" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format GraphQL</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted GraphQL</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// PHP Formatter Component
function PhpFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const formatted = formatCode(input, 4);
    setOutput(formatted);
  };

  return (
    <VStack>
      <div>
        <Label>PHP Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="<?php function test($a){return $a*2;} ?>" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format PHP</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted PHP</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Python Formatter Component
function PythonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    // Python indentation is significant, so we normalise rather than re-derive it:
    // tabs → 4 spaces, strip trailing whitespace, and cap consecutive blank lines
    // at two (PEP8's maximum). We never re-indent — that would risk changing meaning.
    const cleaned = input
      .replace(/\t/g, '    ')
      .split('\n')
      .map(line => line.replace(/[ \t]+$/, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n\n')   // allow at most two blank lines
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\s+$/, '') + '\n';
    setOutput(cleaned);
  };

  return (
    <VStack>
      <div>
        <Label>Python Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={"def greet(name):\n\tprint(f'Hello {name}')"} />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Clean Up Python</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted Python</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Java Formatter Component
function JavaFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const formatted = formatCode(input, 4);
    setOutput(formatted);
  };

  return (
    <VStack>
      <div>
        <Label>Java Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="public class Test{public static void main(String[]args){System.out.println('Hello');}}" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format Java</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted Java</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// C++ Formatter Component
function CppFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const formatted = formatCode(input, 4);
    setOutput(formatted);
  };

  return (
    <VStack>
      <div>
        <Label>C/C++ Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="int main(){int x=5;printf('%d',x);return 0;}" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format C/C++</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted C/C++</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// C# Formatter Component
function CsharpFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const formatted = formatCode(input, 4);
    setOutput(formatted);
  };

  return (
    <VStack>
      <div>
        <Label>C# Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="public class Program{static void Main(){Console.WriteLine('Hello');}}" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format C#</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted C#</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JSON to XML Component
function JsonToXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      const toXml = (obj, name = 'root') => {
        if (typeof obj !== 'object' || obj === null) return `<${name}>${obj}</${name}>`;
        if (Array.isArray(obj)) {
          return obj.map(item => toXml(item, 'item')).join('\n');
        }
        let xml = `<${name}>\n`;
        for (let key in obj) {
          xml += '  ' + toXml(obj[key], key) + '\n';
        }
        xml += `</${name}>`;
        return xml;
      };
      setOutput(toXml(obj));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSON Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='{"name":"John","age":30}' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to XML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>XML Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// XML to JSON Component
function XmlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(input, 'text/xml');
      
      const xmlToJson = (node) => {
        if (node.nodeType === 3) return node.textContent;
        let obj = {};
        if (node.attributes) {
          for (let attr of node.attributes) {
            obj['@' + attr.name] = attr.value;
          }
        }
        for (let child of node.childNodes) {
          if (child.nodeType === 1) {
            const childJson = xmlToJson(child);
            if (obj[child.nodeName]) {
              if (!Array.isArray(obj[child.nodeName])) {
                obj[child.nodeName] = [obj[child.nodeName]];
              }
              obj[child.nodeName].push(childJson);
            } else {
              obj[child.nodeName] = childJson;
            }
          } else if (child.nodeType === 3 && child.textContent.trim()) {
            return child.textContent;
          }
        }
        return obj;
      };
      
      const result = xmlToJson(xml.documentElement);
      setOutput(JSON.stringify({ [xml.documentElement.nodeName]: result }, null, 2));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>XML Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='<person><name>John</name><age>30</age></person>' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to JSON</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JSON to YAML Component
function JsonToYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      const toYaml = (obj, indent = 0) => {
        const ind = '  '.repeat(indent);
        if (typeof obj !== 'object' || obj === null) return String(obj);
        if (Array.isArray(obj)) {
          return obj.map(item => `\n${ind}- ${toYaml(item, indent + 1)}`).join('');
        }
        let yaml = '';
        for (let key in obj) {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            yaml += `\n${ind}${key}:${toYaml(value, indent + 1)}`;
          } else {
            yaml += `\n${ind}${key}: ${value}`;
          }
        }
        return yaml;
      };
      setOutput(toYaml(obj).trim());
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSON Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='{"name":"John","age":30}' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to YAML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>YAML Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// YAML to JSON Component
function YamlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      // Simple YAML parser
      const lines = input.split('\n');
      const obj = {};
      let currentKey = null;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        if (trimmed.includes(':')) {
          const [key, value] = trimmed.split(':').map(s => s.trim());
          if (value) {
            obj[key] = isNaN(value) ? value : Number(value);
          } else {
            currentKey = key;
            obj[key] = {};
          }
        }
      });
      
      setOutput(JSON.stringify(obj, null, 2));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>YAML Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="name: John\nage: 30" />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to JSON</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JSON to CSV Component
function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const arr = JSON.parse(input);
      if (!Array.isArray(arr)) {
        setOutput('Error: JSON must be an array of objects');
        return;
      }
      
      const headers = Object.keys(arr[0] || {});
      let csv = headers.join(',') + '\n';
      
      arr.forEach(row => {
        const values = headers.map(h => {
          const val = row[h];
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val || '');
        });
        csv += values.join(',') + '\n';
      });
      
      setOutput(csv);
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSON Array</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='[{"name":"John","age":30},{"name":"Jane","age":25}]' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to CSV</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>CSV Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// CSV to JSON Component
function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const lines = input.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const arr = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] || '';
        });
        arr.push(obj);
      }
      
      setOutput(JSON.stringify(arr, null, 2));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>CSV Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="name,age\nJohn,30\nJane,25" />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to JSON</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JSON to TOML Component
function JsonToToml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      let toml = '';
      
      for (let key in obj) {
        const value = obj[key];
        if (typeof value === 'object' && !Array.isArray(value)) {
          toml += `\n[${key}]\n`;
          for (let subKey in value) {
            toml += `${subKey} = ${JSON.stringify(value[subKey])}\n`;
          }
        } else {
          toml += `${key} = ${JSON.stringify(value)}\n`;
        }
      }
      
      setOutput(toml.trim());
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSON Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='{"name":"example","version":"1.0.0"}' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to TOML</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>TOML Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// TOML to JSON Component
function TomlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const lines = input.split('\n');
      const obj = {};
      let currentSection = obj;
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          const section = trimmed.slice(1, -1);
          obj[section] = {};
          currentSection = obj[section];
        } else if (trimmed.includes('=')) {
          const [key, value] = trimmed.split('=').map(s => s.trim());
          try {
            currentSection[key] = JSON.parse(value);
          } catch {
            currentSection[key] = value;
          }
        }
      });
      
      setOutput(JSON.stringify(obj, null, 2));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>TOML Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='name = "example"\nversion = "1.0.0"' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to JSON</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Line Counter Component
function LineCounter() {
  const [input, setInput] = useState('');
  const [stats, setStats] = useState(null);

  const count = () => {
    if (!input) {
      setStats(null);
      return;
    }
    
    const lines = input.split('\n');
    const totalLines = lines.length;
    let codeLines = 0;
    let blankLines = 0;
    let commentLines = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        blankLines++;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
        commentLines++;
      } else {
        codeLines++;
      }
    });
    
    setStats({
      totalLines,
      codeLines,
      blankLines,
      commentLines,
      chars: input.length
    });
  };

  useEffect(() => {
    count();
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Code</Label>
        <Textarea value={input} onChange={setInput} rows={14} mono placeholder="// Comment\nconst x = 5;\n\nconsole.log(x);" />
      </div>
      {stats && (
        <div>
          <Label>Statistics</Label>
          <Grid3>
            <StatBox value={stats.totalLines} label="Total Lines" />
            <StatBox value={stats.codeLines} label="Code Lines" />
            <StatBox value={stats.blankLines} label="Blank Lines" />
          </Grid3>
          <Grid2 style={{ marginTop:12 }}>
            <StatBox value={stats.commentLines} label="Comment Lines" />
            <StatBox value={stats.chars} label="Characters" />
          </Grid2>
        </div>
      )}
    </VStack>
  );
}

// Code Diff Component
function CodeDiff() {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [diff, setDiff] = useState([]);

  const compare = () => {
    const origLines = original.split('\n');
    const modLines = modified.split('\n');
    const result = [];
    
    const maxLen = Math.max(origLines.length, modLines.length);
    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i];
      const mod = modLines[i];
      
      if (orig === mod) {
        result.push({ type: 'same', line: orig });
      } else if (orig && !mod) {
        result.push({ type: 'removed', line: orig });
      } else if (!orig && mod) {
        result.push({ type: 'added', line: mod });
      } else {
        result.push({ type: 'removed', line: orig });
        result.push({ type: 'added', line: mod });
      }
    }
    
    setDiff(result);
  };

  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Original Code</Label>
          <Textarea value={original} onChange={setOriginal} rows={10} mono placeholder="const x = 5;\nconsole.log(x);" />
        </div>
        <div>
          <Label>Modified Code</Label>
          <Textarea value={modified} onChange={setModified} rows={10} mono placeholder="const x = 10;\nconsole.log(x);\nconsole.log('Done');" />
        </div>
      </Grid2>
      <Btn onClick={compare} disabled={!original && !modified}>Compare Code</Btn>
      {diff.length > 0 && (
        <div>
          <Label>Differences</Label>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:12, fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>
            {diff.map((d, i) => (
              <div key={i} style={{ 
                padding: '2px 8px',
                background: d.type === 'added' ? 'rgba(16,185,129,0.15)' : d.type === 'removed' ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: d.type === 'added' ? C.success : d.type === 'removed' ? C.danger : C.text,
                borderLeft: d.type !== 'same' ? `3px solid ${d.type === 'added' ? C.success : C.danger}` : 'none',
                paddingLeft: d.type !== 'same' ? 10 : 8
              }}>
                <span style={{ color:C.muted, marginRight:8, fontSize:11 }}>
                  {d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' '}
                </span>
                {d.line || ' '}
              </div>
            ))}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Indentation Converter Component
function IndentationConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fromType, setFromType] = useState('tabs');
  const [toType, setToType] = useState('spaces');
  const [spaceCount, setSpaceCount] = useState('2');

  const convert = () => {
    if (!input) return;
    let result = input;
    const spaces = ' '.repeat(parseInt(spaceCount));
    
    if (fromType === 'tabs' && toType === 'spaces') {
      result = input.replace(/\t/g, spaces);
    } else if (fromType === 'spaces' && toType === 'tabs') {
      const regex = new RegExp(' '.repeat(parseInt(spaceCount)), 'g');
      result = input.replace(regex, '\t');
    }
    
    setOutput(result);
  };

  return (
    <VStack>
      <div>
        <Label>Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="Enter code with tabs or spaces..." />
      </div>
      <Grid2>
        <div>
          <Label>From</Label>
          <SelectInput value={fromType} onChange={setFromType} options={[
            { value:'tabs', label:'Tabs' },
            { value:'spaces', label:'Spaces' }
          ]} />
        </div>
        <div>
          <Label>To</Label>
          <SelectInput value={toType} onChange={setToType} options={[
            { value:'spaces', label:'Spaces' },
            { value:'tabs', label:'Tabs' }
          ]} />
        </div>
      </Grid2>
      {toType === 'spaces' && (
        <div>
          <Label>Spaces per Tab</Label>
          <SelectInput value={spaceCount} onChange={setSpaceCount} options={[
            { value:'2', label:'2 spaces' },
            { value:'4', label:'4 spaces' },
            { value:'8', label:'8 spaces' }
          ]} />
        </div>
      )}
      <Btn onClick={convert} disabled={!input}>Convert Indentation</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Converted Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Code Beautifier Component
function CodeBeautifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');

  const beautify = () => {
    if (!input.trim()) return;
    const formatted = formatCode(input, parseInt(indent));
    setOutput(formatted);
  };

  return (
    <VStack>
      <div>
        <Label>Code (Any Language)</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="function test(){const x=5;return x*2;}" />
      </div>
      <div>
        <Label>Indentation</Label>
        <SelectInput value={indent} onChange={setIndent} options={[
          { value:'2', label:'2 spaces' },
          { value:'4', label:'4 spaces' }
        ]} />
      </div>
      <Btn onClick={beautify} disabled={!input.trim()}>Beautify Code</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Beautified Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// ---- Shared CSV parser for new tools ----
function parseCsvRows(text) {
  const rows = []; let row = []; let field = ""; let i = 0; const n = text.length; let inQ = false;
  while (i < n) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 2; continue; } inQ = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"') { inQ = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += c; i++;
  }
  row.push(field); rows.push(row);
  if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") rows.pop();
  return rows;
}

// SCSS/LESS Formatter Component
function ScssFormatter() {
  const [input, setInput] = useState('');
  const [indent, setIndent] = useState('2');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const IND = ' '.repeat(parseInt(indent, 10) || 2);
    const src = input; let depth = 0; const out = []; let line = '';
    const emit = (s) => out.push(IND.repeat(Math.max(0, depth)) + s);
    const clean = (s) => s.trim().replace(/\s+/g, ' ');
    const flushLine = () => { const t = clean(line); if (t) emit(t); line = ''; };
    let i = 0; const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '"' || c === "'") {
        let j = i + 1, str = c;
        while (j < n) { str += src[j]; if (src[j] === c && src[j - 1] !== '\\') break; j++; }
        line += str; i = j + 1; continue;
      }
      if (c === '/' && src[i + 1] === '*') {
        let j = i + 2, cm = '/*';
        while (j < n && !(src[j] === '*' && src[j + 1] === '/')) { cm += src[j]; j++; }
        cm += '*/'; flushLine(); emit(cm); i = j + 2; continue;
      }
      if (c === '/' && src[i + 1] === '/' && !line.replace(/\s+$/, '').endsWith(':')) {
        let j = i + 2, cm = '//';
        while (j < n && src[j] !== '\n') { cm += src[j]; j++; }
        flushLine(); emit(cm.replace(/\s+$/, '')); i = j; continue;
      }
      if (c === '{') { const t = clean(line); line = ''; emit((t ? t + ' ' : '') + '{'); depth++; i++; continue; }
      if (c === '}') { const t = clean(line); line = ''; if (t) emit(t.replace(/\s*:\s*/, ': ') + ';'); depth = Math.max(0, depth - 1); emit('}'); i++; continue; }
      if (c === ';') { let t = clean(line); line = ''; t = t.replace(/\s*:\s*/, ': '); emit(t + ';'); i++; continue; }
      if (c === '\n') { line += ' '; i++; continue; }
      line += c; i++;
    }
    flushLine();
    setOutput(out.join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>SCSS / LESS / CSS Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder=".card{color:red;.title{font-size:14px}}" />
      </div>
      <div>
        <Label>Indentation</Label>
        <SelectInput value={indent} onChange={setIndent} options={[
          { value:'2', label:'2 spaces' },
          { value:'4', label:'4 spaces' }
        ]} />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format Code</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
    </VStack>
  );
}

// INI Formatter Component
function IniFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const lines = input.split(/\r?\n/); const out = [];
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith(';') || line.startsWith('#')) { out.push(line); continue; }
      if (line.startsWith('[') && line.endsWith(']')) { if (out.length) out.push(''); out.push(line); continue; }
      const eqi = line.indexOf('=');
      if (eqi > -1) out.push(line.slice(0, eqi).trim() + ' = ' + line.slice(eqi + 1).trim());
      else out.push(line);
    }
    setOutput(out.join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>INI Config</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="[database]\nhost=localhost\nport = 5432" />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format INI</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted INI</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Java Properties Formatter Component
function PropertiesFormatter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('keep');
  const [output, setOutput] = useState('');

  const format = () => {
    if (!input.trim()) return;
    const lines = input.split(/\r?\n/);
    const comments = []; const kv = [];
    for (let raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('#') || line.startsWith('!')) { comments.push(line); continue; }
      let sep = -1;
      for (let i = 0; i < line.length; i++) { const c = line[i]; if ((c === '=' || c === ':') && line[i - 1] !== '\\') { sep = i; break; } }
      if (sep > -1) kv.push(line.slice(0, sep).trim() + '=' + line.slice(sep + 1).trim());
      else kv.push(line);
    }
    const body = mode === 'sort' ? kv.slice().sort((a, b) => a.split('=')[0].localeCompare(b.split('=')[0])) : kv;
    setOutput([...comments, ...(comments.length && body.length ? [''] : []), ...body].join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>Java .properties</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="app.name = Demo\napp.port : 8080" />
      </div>
      <div>
        <Label>Key Order</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'keep', label:'Keep original order' },
          { value:'sort', label:'Sort keys A→Z' }
        ]} />
      </div>
      <Btn onClick={format} disabled={!input.trim()}>Format Properties</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted Properties</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// SQL Minifier Component
function SqlMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);

  const minify = () => {
    if (!input.trim()) return;
    const SEN = String.fromCharCode(1);
    const strings = []; let out = ''; let i = 0; const n = input.length;
    while (i < n) {
      const c = input[i];
      if (c === "'") {
        let j = i + 1, s = "'";
        while (j < n) { s += input[j]; if (input[j] === "'" && input[j + 1] === "'") { s += input[j + 1]; j += 2; continue; } if (input[j] === "'") { j++; break; } j++; }
        strings.push(s); out += SEN + (strings.length - 1) + SEN; i = j; continue;
      }
      if (c === '-' && input[i + 1] === '-') { let j = i + 2; while (j < n && input[j] !== '\n') j++; i = j; out += ' '; continue; }
      if (c === '/' && input[i + 1] === '*') { let j = i + 2; while (j < n && !(input[j] === '*' && input[j + 1] === '/')) j++; i = j + 2; out += ' '; continue; }
      out += c; i++;
    }
    out = out.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',').replace(/\s*;\s*/g, ';').trim();
    out = out.replace(new RegExp(SEN + '(\\d+)' + SEN, 'g'), (_, k) => strings[+k]);
    const orig = new Blob([input]).size, min = new Blob([out]).size;
    setStats({ orig, min, pct: orig ? Math.round((1 - min / orig) * 100) : 0 });
    setOutput(out);
  };

  return (
    <VStack>
      <div>
        <Label>SQL Query</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="SELECT id, name -- users\nFROM users\nWHERE active = 1;" />
      </div>
      <Btn onClick={minify} disabled={!input.trim()}>Minify SQL</Btn>
      {stats && (
        <Grid3>
          <StatBox value={`${stats.orig}B`} label="Original" />
          <StatBox value={`${stats.min}B`} label="Minified" />
          <StatBox value={`${stats.pct}%`} label="Saved" />
        </Grid3>
      )}
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Minified SQL</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={6} mono />
        </div>
      )}
    </VStack>
  );
}

// TSV to CSV Component
function TsvToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    const esc = (f) => /[",\n\r]/.test(f) ? '"' + f.replace(/"/g, '""') + '"' : f;
    const csv = input.replace(/\n$/, '').split(/\r?\n/).map(line => line.split('\t').map(esc).join(',')).join('\n');
    setOutput(csv);
  };

  return (
    <VStack>
      <div>
        <Label>TSV Data (tab-separated)</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={"name\tcity\nJohn\tNew York"} />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to CSV</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>CSV Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// CSV to Markdown Table Component
function CsvToMarkdown() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    const rows = parseCsvRows(input);
    if (!rows.length) { setOutput(''); return; }
    const cols = Math.max(...rows.map(r => r.length));
    const norm = rows.map(r => { const a = r.slice(); while (a.length < cols) a.push(''); return a.map(c => c.replace(/\|/g, '\\|')); });
    const w = []; for (let c = 0; c < cols; c++) w[c] = Math.max(3, ...norm.map(r => r[c].length));
    const line = (cells) => '| ' + cells.map((c, i) => c.padEnd(w[i])).join(' | ') + ' |';
    const sep = '| ' + w.map(x => '-'.repeat(x)).join(' | ') + ' |';
    setOutput([line(norm[0]), sep, ...norm.slice(1).map(line)].join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>CSV Data (first row = header)</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="name,age,city\nJohn,30,NYC\nJane,25,LA" />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to Markdown</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Markdown Table</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JSONC to JSON Component
function JsoncToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    const src = input; let stripped = ''; let i = 0; const n = src.length;
    while (i < n) {
      const c = src[i];
      if (c === '"') { stripped += c; i++; while (i < n) { stripped += src[i]; if (src[i] === '\\') { stripped += src[i + 1]; i += 2; continue; } if (src[i] === '"') { i++; break; } i++; } continue; }
      if (c === '/' && src[i + 1] === '/') { i += 2; while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
      stripped += c; i++;
    }
    stripped = stripped.replace(/,(\s*[}\]])/g, '$1');
    try {
      setOutput(JSON.stringify(JSON.parse(stripped), null, 2));
    } catch (err) {
      setOutput('Error: Invalid JSON after stripping comments - ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSONC (JSON with comments)</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={'{\n  // config\n  "port": 8080,\n  "hosts": ["a", "b",],\n}'} />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to JSON</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Clean JSON</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JSON to Query String Component
function JsonToQueryString() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) return;
    try {
      const obj = JSON.parse(input);
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        setOutput('Error: Please provide a JSON object of key-value pairs');
        return;
      }
      const parts = [];
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (Array.isArray(v)) v.forEach(item => parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(item))));
        else if (v === null) parts.push(encodeURIComponent(k) + '=');
        else if (typeof v === 'object') parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(JSON.stringify(v)));
        else parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
      }
      setOutput(parts.join('&'));
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSON Object</Label>
        <Textarea value={input} onChange={setInput} rows={8} mono placeholder='{"q":"hello world","tags":["a","b"],"page":2}' />
      </div>
      <Btn onClick={convert} disabled={!input.trim()}>Convert to Query String</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Query String</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={4} mono />
        </div>
      )}
    </VStack>
  );
}

// CSV Column Aligner Component
function CsvColumnAligner() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const align = () => {
    if (!input.trim()) return;
    const rows = parseCsvRows(input);
    if (!rows.length) { setOutput(''); return; }
    const cols = Math.max(...rows.map(r => r.length));
    const w = []; for (let c = 0; c < cols; c++) w[c] = Math.max(...rows.map(r => (r[c] || '').length));
    const out = rows.map(r => {
      const a = []; for (let c = 0; c < cols; c++) a.push(r[c] || '');
      return a.map((cell, c) => c === cols - 1 ? cell : cell.padEnd(w[c])).join('  ').replace(/\s+$/, '');
    }).join('\n');
    setOutput(out);
  };

  return (
    <VStack>
      <div>
        <Label>CSV Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="name,age,city\nJohn,30,NYC\nAlexander,5,LA" />
      </div>
      <Btn onClick={align} disabled={!input.trim()}>Align Columns</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Aligned Table</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Env File Sorter Component
function EnvFileSorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const sort = () => {
    if (!input.trim()) return;
    const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const comments = lines.filter(l => l.startsWith('#'));
    const kv = lines.filter(l => !l.startsWith('#') && l.includes('='));
    kv.sort((a, b) => a.split('=')[0].localeCompare(b.split('=')[0]));
    setOutput([...comments, ...(comments.length && kv.length ? [''] : []), ...kv].join('\n'));
  };

  return (
    <VStack>
      <div>
        <Label>.env File</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="# database\nDB_PORT=5432\nAPI_KEY=abc123\nDB_HOST=localhost" />
      </div>
      <Btn onClick={sort} disabled={!input.trim()}>Sort Variables</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Sorted .env</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Whitespace Normalizer Component
function WhitespaceNormalizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const normalize = () => {
    if (!input) return;
    let s = input.replace(/\r\n?/g, '\n');
    s = s.split('\n').map(l => l.replace(/[ \t]+$/, '')).join('\n');
    s = s.replace(/\n+$/, '\n');
    setOutput(s);
  };

  return (
    <VStack>
      <div>
        <Label>Text / Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="Paste text with trailing spaces or mixed line endings..." />
      </div>
      <Btn onClick={normalize} disabled={!input.trim()}>Normalize Whitespace</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Normalized Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// Blank Line Collapser Component
function BlankLineCollapser() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const collapse = () => {
    if (!input) return;
    setOutput(input.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n'));
  };

  return (
    <VStack>
      <div>
        <Label>Text with Extra Blank Lines</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={"Paragraph one.\n\n\n\nParagraph two."} />
      </div>
      <Btn onClick={collapse} disabled={!input.trim()}>Collapse Blank Lines</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Collapsed Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "css-formatter": CssFormatter,
  "css-minifier": CssMinifier,
  "sql-formatter": SqlFormatter,
  "xml-formatter": XmlFormatter,
  "xml-minifier": XmlMinifier,
  "yaml-formatter": YamlFormatter,
  "toml-formatter": TomlFormatter,
  "graphql-formatter": GraphqlFormatter,
  "php-formatter": PhpFormatter,
  "python-formatter": PythonFormatter,
  "java-formatter": JavaFormatter,
  "cpp-formatter": CppFormatter,
  "csharp-formatter": CsharpFormatter,
  "json-to-xml": JsonToXml,
  "xml-to-json": XmlToJson,
  "json-to-yaml": JsonToYaml,
  "yaml-to-json": YamlToJson,
  "json-to-csv": JsonToCsv,
  "csv-to-json": CsvToJson,
  "json-to-toml": JsonToToml,
  "toml-to-json": TomlToJson,
  "line-counter": LineCounter,
  "code-diff": CodeDiff,
  "indentation-converter": IndentationConverter,
  "code-beautifier": CodeBeautifier,
  "scss-formatter": ScssFormatter,
  "ini-formatter": IniFormatter,
  "properties-formatter": PropertiesFormatter,
  "sql-minifier": SqlMinifier,
  "tsv-to-csv": TsvToCsv,
  "csv-to-markdown": CsvToMarkdown,
  "jsonc-to-json": JsoncToJson,
  "json-to-query-string": JsonToQueryString,
  "csv-column-aligner": CsvColumnAligner,
  "env-file-sorter": EnvFileSorter,
  "whitespace-normalizer": WhitespaceNormalizer,
  "blank-line-collapser": BlankLineCollapser,
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
          { "@type": "ListItem", "position": 2, "name": "Code Formatters", "item": "https://toolsrift.com/formatters" },
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
    document.title = meta?.title || `${tool?.name} – Free Code Formatter | ToolsRift`;
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
    document.title = `${cat?.name || 'Category'} – Code Formatters | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.teal }}>← Back to home</a>
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.teal; e.currentTarget.style.transform = "translateY(-2px)"; }}
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
    document.title = "Free Code Formatters – Format, Convert & Beautify Code Online | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search code formatter tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(20,184,166,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.teal, textDecoration:"none" }}>{THEME?.name||"Code Formatters"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(20,184,166,0.12)", color:C.teal, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(20,184,166,0.25)" }}>{TOOLS.length} tools</span>
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
    {href:"/html",icon:"🌐",label:"HTML Tools"},
    {href:"/js",icon:"⚡",label:"JS Tools"},
    {href:"/generators",icon:"⚡",label:"Generators"},
    {href:"/generators2",icon:"✍️",label:"Content Gen"},
    {href:"/devgen",icon:"⚙️",label:"Dev Config"},
    {href:"/mathcalc",icon:"📐",label:"Math Calc"},
    {href:"/financecalc",icon:"💰",label:"Finance Calc"},
    {href:"/devtools",icon:"🛠️",label:"Dev Tools"},
    {href:"/converters2",icon:"🔄",label:"More Converters"},
    { href: "/about", icon: "ℹ️", label: "About" },
    { href: "/privacy-policy", icon: "🔏", label: "Privacy Policy" },
  ].filter(p => !p.href.endsWith("/"+currentPage));

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
        <a href="/" style={{fontSize:12,color:"#14B8A6",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftFormatters() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="formatters"/>}
    </div>
  );
}

export default ToolsRiftFormatters;