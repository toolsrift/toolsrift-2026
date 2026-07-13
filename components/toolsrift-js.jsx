import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 1: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("js");
const PAGE_THEME = getCategoryById('js');
const BRAND = { name: "ToolsRift", tagline: "JS Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  yellow: "#EAB308", yellowD: "#CA8A04",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(234,179,8,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "yellow" }) {
  const map = { yellow:"rgba(234,179,8,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { yellow:"#FDE047", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.yellow, color:textMap[color]||textMap.yellow, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.yellow; const ACCENTD = C.yellowD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#000", boxShadow:`0 2px 8px rgba(234,179,8,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.yellow} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.yellow} onBlur={e => e.target.style.borderColor=C.border} />
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(234,179,8,0.08)", border:`1px solid rgba(234,179,8,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.yellow }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.yellow }}>{value}</div>
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
  // Formatter & Validator
  { id:"js-formatter", cat:"formatter", name:"JavaScript Formatter", desc:"Beautify and format JavaScript code with proper indentation and structure for better readability", icon:"✨", free:true },
  { id:"js-minifier", cat:"formatter", name:"JavaScript Minifier", desc:"Minify JavaScript by removing whitespace, comments, and shortening variable names to reduce file size", icon:"🗜️", free:true },
  { id:"js-validator", cat:"formatter", name:"JavaScript Validator", desc:"Validate JavaScript syntax and find errors with detailed line numbers and error messages", icon:"✅", free:true },
  { id:"json-to-js", cat:"formatter", name:"JSON to JS Object", desc:"Convert JSON data to JavaScript object literal syntax with proper formatting and structure", icon:"📦", free:true },
  { id:"js-to-json", cat:"formatter", name:"JS Object to JSON", desc:"Convert JavaScript object literals to valid JSON format with proper escaping and structure", icon:"📋", free:true },
  { id:"js-console-remover", cat:"formatter", name:"Console.log Remover", desc:"Strip console.log, warn, error, info and debug statements from JavaScript without touching strings, comments or regex", icon:"🧹", free:true },
  { id:"js-comment-remover", cat:"formatter", name:"JS Comment Remover", desc:"Remove line and block comments from JavaScript while preserving URLs and comment syntax inside strings, with optional JSDoc keep", icon:"💬", free:true },
  { id:"js-import-sorter", cat:"formatter", name:"JS Import Sorter", desc:"Sort and group ES module import statements alphabetically, separating external packages from internal relative imports", icon:"🔤", free:true },

  // Converters
  { id:"js-obfuscator", cat:"converter", name:"JavaScript Obfuscator", desc:"Basic JavaScript obfuscation with variable renaming and string encoding to protect code", icon:"🔒", free:true },
  { id:"es6-to-es5", cat:"converter", name:"ES6 to ES5 Converter", desc:"Convert modern ES6+ arrow functions and syntax to ES5-compatible JavaScript for legacy browsers", icon:"🔄", free:true },
  { id:"js-to-typescript", cat:"converter", name:"JS to TypeScript", desc:"Add TypeScript type annotations to JavaScript functions for better type safety and IDE support", icon:"📘", free:true },
  { id:"regex-tester", cat:"converter", name:"Regex Tester", desc:"Real-time regular expression tester with match highlighting, groups, and detailed match information", icon:"🔍", free:true },
  { id:"js-console-simulator", cat:"converter", name:"JS Console Simulator", desc:"Simulate JavaScript console.log output for code snippets and preview execution results", icon:"💻", free:true },
  { id:"cjs-esm-converter", cat:"converter", name:"CommonJS ⇄ ESM Converter", desc:"Convert CommonJS require and module.exports to ES module import/export syntax and back for the common static patterns", icon:"🔀", free:true },
  { id:"js-string-escaper", cat:"converter", name:"JS String Escaper", desc:"Escape raw text into a valid JavaScript string literal (\\n, \\t, quotes, control chars) or unescape a literal back to plain text", icon:"⤵️", free:true },
  { id:"js-unicode-escaper", cat:"converter", name:"JS Unicode Escaper", desc:"Escape non-ASCII characters to \\uXXXX sequences so source stays ASCII-safe, or decode \\uXXXX, \\u{...} and \\xXX back to text", icon:"🔡", free:true },
  { id:"js-regex-escape", cat:"converter", name:"JS Regex Escaper", desc:"Escape a literal string so its special characters are matched literally inside a RegExp, with optional forward-slash escaping", icon:"🛡️", free:true },
  { id:"js-template-to-concat", cat:"converter", name:"Template Literal → Concat", desc:"Convert ES6 template literals with ${expr} interpolation into equivalent string concatenation, string and regex aware", icon:"➕", free:true },
  { id:"js-ternary-to-if", cat:"converter", name:"Ternary to If/Else", desc:"Expand ternary assignments, declarations and returns into readable if/else blocks, safely skipping ?? and ?. operators", icon:"🔀", free:true },
  { id:"js-array-from-list", cat:"converter", name:"List to JS Array", desc:"Turn a list of lines, comma or space separated values into a JavaScript array literal with quoting, trimming and de-duplication", icon:"📚", free:true },

  // Formatter & Validator
  { id:"js-variable-name-validator", cat:"formatter", name:"JS Variable Name Validator", desc:"Check whether a name is a valid JavaScript identifier and explain each problem — digits, symbols, spaces or reserved keywords", icon:"🏷️", free:true },
  { id:"js-quote-normalizer", cat:"formatter", name:"JS Quote Normalizer", desc:"Convert JavaScript string quotes between single and double, string, comment and regex aware, re-escaping quotes as needed", icon:"❝", free:true },
  { id:"js-object-key-sorter", cat:"formatter", name:"JSON Key Sorter", desc:"Recursively sort the keys of a JSON object alphabetically (ascending or descending) with configurable indentation", icon:"🔤", free:true },
  { id:"js-var-to-let", cat:"formatter", name:"var to let / const", desc:"Replace the var keyword with let or const across your code, string, comment and regex aware so text like \"var\" in a string is safe", icon:"🔧", free:true },
];

const CATEGORIES = [
  { id:"formatter", name:"Formatter & Validator", icon:"✨", desc:"Format, validate, minify and convert JavaScript code" },
  { id:"converter", name:"Converters & Tools", icon:"🔧", desc:"Obfuscate, transpile, test regex, and run JS code" },
];

const TOOL_META = {
  "js-formatter": {
    title: "Free JavaScript Formatter – Beautify JS Code Online | ToolsRift",
    desc: "Format and beautify JavaScript with proper indentation. Clean up messy JS code with our free online formatter. Supports ES6+, customizable spacing.",
    faq: [
      ["How does the JavaScript formatter work?", "The formatter parses your JavaScript and rebuilds it with proper indentation, line breaks, and consistent spacing. You can choose between 2-space or 4-space indentation."],
      ["Does it support ES6+ syntax?", "Yes, the formatter handles modern JavaScript including arrow functions, template literals, destructuring, async/await, and other ES6+ features."],
      ["Will formatting change code behavior?", "No, formatting only affects whitespace and code structure. The functionality and output of your code remain identical after formatting."]
    ]
  },
  "js-minifier": {
    title: "Free JavaScript Minifier – Minify JS Code Online | ToolsRift",
    desc: "Minify JavaScript by removing whitespace and comments. Reduce JS file size for faster page load. Free minification with before/after stats.",
    faq: [
      ["What does JavaScript minification remove?", "Minification removes unnecessary whitespace, line breaks, comments, and can shorten variable names. It creates the smallest valid JavaScript output."],
      ["How much size reduction can I expect?", "Typical reduction is 20-40% depending on code style. Code with lots of comments and whitespace compresses more. The tool shows exact byte savings."],
      ["Is minified code still valid JavaScript?", "Yes, minified code is fully valid and executes identically to formatted code. Only readability is affected—minified code is harder for humans to read."]
    ]
  },
  "js-validator": {
    title: "Free JavaScript Validator – Check JS Syntax Errors | ToolsRift",
    desc: "Validate JavaScript syntax and find errors instantly. Check for syntax issues, missing brackets, and common mistakes with line number details.",
    faq: [
      ["What errors does the validator catch?", "The validator catches syntax errors like missing brackets, unclosed strings, invalid operators, unexpected tokens, and other parsing errors."],
      ["Does it validate ES6+ syntax?", "Yes, the validator supports modern JavaScript syntax including arrow functions, template literals, destructuring, and other ES6+ features."],
      ["Can it detect runtime errors?", "No, this validator only checks syntax errors. Runtime errors like undefined variables or type errors require actually running the code."]
    ]
  },
  "json-to-js": {
    title: "Free JSON to JavaScript Converter – Convert JSON to JS | ToolsRift",
    desc: "Convert JSON to JavaScript object literal syntax. Transform JSON data to JS objects with proper formatting for use in code.",
    faq: [
      ["What's the difference between JSON and JS objects?", "JSON requires double quotes for keys and strings. JavaScript objects can use unquoted keys and single quotes. JSON is a data format; JS objects are code."],
      ["Why convert JSON to JavaScript?", "Converting makes JSON easier to use in JavaScript code. You can remove quotes from keys, use single quotes, and add comments for readability."],
      ["Is the output valid JavaScript?", "Yes, the output is valid JavaScript object literal syntax that can be used directly in your code or assigned to variables."]
    ]
  },
  "js-to-json": {
    title: "Free JS to JSON Converter – Convert JavaScript to JSON | ToolsRift",
    desc: "Convert JavaScript objects to valid JSON format. Transform JS literals to JSON with proper escaping and double quotes for API use.",
    faq: [
      ["Why convert JavaScript to JSON?", "JSON is required for APIs, data storage, and data interchange. Converting ensures your data is in the correct format with proper escaping."],
      ["What changes are made during conversion?", "Single quotes become double quotes, unquoted keys get quotes, comments are removed, and trailing commas are removed to create valid JSON."],
      ["Can it handle functions in objects?", "No, JSON doesn't support functions. Only data types (strings, numbers, booleans, arrays, objects, null) are converted. Functions are stripped."]
    ]
  },
  "js-obfuscator": {
    title: "Free JavaScript Obfuscator – Protect JS Code Online | ToolsRift",
    desc: "Obfuscate JavaScript with variable renaming and string encoding. Basic code protection to make JS harder to read and reverse engineer.",
    faq: [
      ["How does JavaScript obfuscation work?", "Obfuscation renames variables to short cryptic names, encodes strings, and restructures code to make it harder to read while preserving functionality."],
      ["Is obfuscated code completely secure?", "No, obfuscation makes code harder to read but not impossible. Determined attackers can still reverse engineer it. Use it alongside other security measures."],
      ["Does obfuscation affect performance?", "Slightly. String encoding and renamed variables add minimal overhead. The impact is usually negligible for most applications."]
    ]
  },
  "es6-to-es5": {
    title: "Free ES6 to ES5 Converter – Transpile JavaScript Online | ToolsRift",
    desc: "Convert ES6+ arrow functions and syntax to ES5 JavaScript for legacy browser support. Transpile modern JS to compatible code.",
    faq: [
      ["Why convert ES6 to ES5?", "ES5 runs on older browsers like IE11. Converting ES6 features to ES5 ensures your code works on legacy browsers that don't support modern syntax."],
      ["What ES6 features are converted?", "Arrow functions, template literals, const/let to var, destructuring, and spread operators are converted to ES5-compatible equivalents."],
      ["Should I use this instead of Babel?", "This is a simple converter for small snippets. For production, use Babel or TypeScript which handle more features and edge cases."]
    ]
  },
  "js-to-typescript": {
    title: "Free JS to TypeScript Converter – Add Type Annotations | ToolsRift",
    desc: "Add TypeScript type annotations to JavaScript functions. Convert JS to TypeScript with type hints for better IDE support and type safety.",
    faq: [
      ["What TypeScript features are added?", "The tool adds basic type annotations to function parameters and return types, converts var to let/const, and adds interface suggestions."],
      ["Is the output production-ready TypeScript?", "The output is a starting point. You'll need to refine types, add generics, and handle edge cases for production TypeScript code."],
      ["Do I need to know TypeScript to use this?", "Basic TypeScript knowledge helps. The tool generates simple type annotations that you can then customize and improve."]
    ]
  },
  "regex-tester": {
    title: "Free Regex Tester – Test Regular Expressions Online | ToolsRift",
    desc: "Test regular expressions in real-time with match highlighting and capture groups. Debug regex patterns with live preview and match details.",
    faq: [
      ["How does the regex tester work?", "Enter your regex pattern and test string. Matches are highlighted in real-time, and you can see all matches, groups, and indices."],
      ["What regex flags are supported?", "Common flags like g (global), i (case-insensitive), m (multiline), s (dotall), and u (unicode) are supported."],
      ["Can I test JavaScript-specific regex?", "Yes, the tester uses JavaScript's regex engine, so all JavaScript regex features including lookbehinds and named groups work correctly."]
    ]
  },
  "js-console-simulator": {
    title: "Free JavaScript Console Simulator – Run JS Code Online | ToolsRift",
    desc: "Simulate JavaScript console output for code snippets. Preview console.log results and test small JS code without opening browser devtools.",
    faq: [
      ["What JavaScript features are supported?", "Most basic JavaScript features including console.log, variables, functions, loops, and conditionals. Complex features like async/await may not work."],
      ["Is this a full JavaScript runtime?", "No, it's a simple simulator for testing console output. For full JavaScript execution, use browser devtools or online IDEs like CodePen."],
      ["Can I use external libraries?", "No, the simulator runs in isolation without external libraries. It's designed for testing simple code snippets and logic."]
    ]
  },
  "js-console-remover": {
    title: "Free Console.log Remover – Strip JS Console Statements | ToolsRift",
    desc: "Remove console.log, warn, error, info and debug calls from JavaScript. String and comment safe so URLs and code inside strings stay intact.",
    howTo: "Paste your JavaScript, choose which console methods to strip (or select all console.* methods), then click Remove Console Statements and copy the cleaned code.",
    faq: [
      ["Will it break strings that contain 'console.log'?", "No. The remover scans character by character and tracks string, comment and regex literals, so a string like \"console.log(1)\" or a URL like \"http://x.com\" is never altered."],
      ["Can I keep some console methods?", "Yes. Use the checkboxes to strip only specific methods such as console.log while keeping console.error, or choose 'All console.* methods' to remove every one."],
      ["Does it remove the whole statement?", "Yes. It removes the entire console call including nested parentheses and arguments, plus a trailing semicolon and the now-empty line if the call stood alone."]
    ]
  },
  "js-comment-remover": {
    title: "Free JavaScript Comment Remover – Strip JS Comments | ToolsRift",
    desc: "Remove // line comments and /* */ block comments from JavaScript. String and regex aware so http:// URLs inside strings are preserved.",
    howTo: "Paste your code, optionally enable Preserve JSDoc or Collapse blank lines, then click Remove Comments and copy the result.",
    faq: [
      ["Does it strip // inside a URL string?", "No. The scanner tracks string and regex literals, so // inside \"http://example.com\" or inside a regex is kept — only real comments outside strings are removed."],
      ["Can I keep JSDoc blocks?", "Yes. Enable 'Preserve JSDoc' to keep /** ... */ documentation blocks while still removing ordinary /* */ and // comments."],
      ["What does Collapse blank lines do?", "After comments are removed, empty leftover lines can remain. Enabling the option collapses those blank lines so the output stays compact."]
    ]
  },
  "js-import-sorter": {
    title: "Free JS Import Sorter – Sort & Group ES Imports | ToolsRift",
    desc: "Sort and group ES module imports alphabetically. Separates external packages from internal relative imports with a blank line between groups.",
    howTo: "Paste a file that begins with import statements, then click Sort & Group Imports. External packages are grouped first, then internal/relative imports, each sorted A–Z.",
    faq: [
      ["How are imports grouped?", "Imports are split into two groups: node builtins and external packages first, then internal/relative imports (./, ../, @/), with a blank line separating the groups."],
      ["Are side-effect imports reordered?", "Side-effect imports like import './styles.css' are preserved in their original order and kept together, since their execution order can matter."],
      ["Is the rest of my file changed?", "No. Only the leading block of import statements is reordered. Everything below the imports is preserved exactly as written."]
    ]
  },
  "cjs-esm-converter": {
    title: "Free CommonJS to ESM Converter – require ⇄ import | ToolsRift",
    desc: "Convert CommonJS require and module.exports to ES module import/export and back. Handles default, named and side-effect forms for static code.",
    howTo: "Choose the conversion direction, paste your module code, then click Convert. Review the output — static require/import patterns are converted automatically.",
    faq: [
      ["Which patterns are converted?", "Default (const x = require('y')), named (const { a } = require('y')), side-effect (require('y')), module.exports and exports.foo — and the reverse import/export forms for ESM to CommonJS."],
      ["Does it convert dynamic require()?", "No. Only static, top-level patterns are converted. Dynamic or conditional require() calls, re-exports (export ... from) and mixed default+named imports are left unchanged."],
      ["Is the output ready to run?", "It handles the common cases but is a static text transform, not a bundler. Review edge cases such as interop defaults and mixed imports before shipping."]
    ]
  },
  "js-string-escaper": {
    title: "Free JS String Escaper – Escape & Unescape JS Strings | ToolsRift",
    desc: "Escape text into a JavaScript string literal or unescape one back to plain text. Handles \\n, \\t, quotes, \\xXX and \\uXXXX. Round-trip safe.",
    howTo: "Choose Escape or Unescape, paste your text, pick the quote character, then click Convert and copy the result.",
    faq: [
      ["What does escaping do?", "Escaping turns special characters — newlines, tabs, quotes, backslashes and control characters — into their JavaScript escape sequences so the text can be safely pasted inside a string literal."],
      ["Is the conversion reversible?", "Yes. Unescaping decodes \\n, \\t, \\r, \\b, \\f, \\v, \\0, \\xXX, \\uXXXX and \\u{...} back to the original characters, so escape then unescape returns your exact input."],
      ["Which quote should I pick?", "Pick the quote you will wrap the string in. The escaper escapes only that quote character, leaving the other quote untouched for cleaner output."]
    ]
  },
  "js-unicode-escaper": {
    title: "Free JS Unicode Escaper – \\uXXXX Encode & Decode | ToolsRift",
    desc: "Escape non-ASCII characters to \\uXXXX so JavaScript source stays ASCII-safe, or decode \\uXXXX, \\u{...} and \\xXX back to readable text.",
    howTo: "Choose Escape or Unescape, paste your text, then click Convert. Escape turns accented letters, CJK and emoji into \\uXXXX sequences; Unescape reverses them.",
    faq: [
      ["Why escape to \\uXXXX?", "ASCII-only source avoids encoding problems in older toolchains, minifiers or systems that mangle UTF-8. Escaping keeps the exact characters while making the file pure ASCII."],
      ["Does it handle emoji and astral characters?", "Yes. Characters above U+FFFF are emitted as UTF-16 surrogate pairs (two \\uXXXX units) on escape, and decoding also understands the \\u{...} code-point form."],
      ["Are normal letters changed?", "No. Printable ASCII (space through ~) is left as-is. Only non-ASCII and control characters are converted, so your code stays readable."]
    ]
  },
  "js-regex-escape": {
    title: "Free JS Regex Escaper – Escape String for RegExp | ToolsRift",
    desc: "Escape a literal string so its special characters match literally inside a JavaScript RegExp. Optional forward-slash escaping for /regex/ literals.",
    howTo: "Paste the literal text you want to match, optionally enable slash escaping for regex literals, then copy the escaped output to drop into new RegExp().",
    faq: [
      ["Which characters are escaped?", "The regex metacharacters . * + ? ^ $ { } ( ) | [ ] and backslash are prefixed with a backslash so they are treated as literal text rather than pattern operators."],
      ["When do I need slash escaping?", "Only when building an inline /pattern/ literal. Enable it to also escape forward slashes. For new RegExp('...') you usually do not need it."],
      ["Is this the same as MDN's escape function?", "Yes. It uses the well-known pattern str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') recommended in the MDN RegExp guide."]
    ]
  },
  "js-template-to-concat": {
    title: "Free Template Literal to Concat Converter | ToolsRift",
    desc: "Convert ES6 template literals with ${expr} interpolation into equivalent string concatenation. String, comment and regex aware; skips tagged templates.",
    howTo: "Paste JavaScript containing backtick template literals, then click Convert. Each `...${x}...` becomes \"...\" + (x) + \"...\".",
    faq: [
      ["Why convert templates to concatenation?", "Concatenation runs on very old engines that lack template literal support, and some code styles or linters prefer explicit + concatenation."],
      ["Are interpolated expressions preserved?", "Yes. Each ${expression} becomes the same expression wrapped in parentheses, so operator precedence around the concatenation stays correct."],
      ["What is not converted?", "Tagged templates like tag`...` are left untouched because their semantics differ, and template literals inside strings, comments or regex are ignored."]
    ]
  },
  "js-ternary-to-if": {
    title: "Free Ternary to If/Else Converter – Expand JS Ternary | ToolsRift",
    desc: "Expand JavaScript ternary assignments, declarations and returns into readable if/else blocks. Safely ignores ?? nullish and ?. optional chaining.",
    howTo: "Paste statements that use the ? : ternary operator, one per line, then click Convert to expand each recognised statement into an if/else block.",
    faq: [
      ["Which statements are converted?", "Three forms per line: a declaration (const/let/var x = c ? a : b), a plain assignment (x = c ? a : b) and a return (return c ? a : b). Other lines are left unchanged."],
      ["Does it touch ?? or ?.?", "No. The nullish coalescing operator ?? and optional chaining ?. are detected and skipped so they are never mistaken for a ternary."],
      ["How are nested ternaries handled?", "The outer ternary is expanded and any nested ternary is kept intact inside the branch, so the code stays valid — run it again to expand deeper levels."]
    ]
  },
  "js-array-from-list": {
    title: "Free List to JS Array Converter – Lines to Array | ToolsRift",
    desc: "Turn a list of lines, comma or space separated values into a JavaScript array literal. Choose quotes, trim whitespace, skip blanks and de-duplicate.",
    howTo: "Paste your list, choose the delimiter and quote style, toggle trim / skip-empty / dedupe / multiline, then click Generate Array and copy the literal.",
    faq: [
      ["What delimiters are supported?", "Split by newline, by comma, or by any whitespace. Each resulting item becomes one element of the generated array."],
      ["How are values quoted?", "Pick single or double quotes and each item is safely escaped for that quote. Choose None to keep raw values such as numbers or booleans unquoted."],
      ["Can it remove duplicates?", "Yes. Enable De-duplicate to keep only the first occurrence of each item, and Skip empty to drop blank lines before building the array."]
    ]
  },
  "js-variable-name-validator": {
    title: "Free JS Variable Name Validator – Check Identifiers | ToolsRift",
    desc: "Check whether a name is a valid JavaScript identifier and get a clear reason for each problem: leading digits, symbols, spaces or reserved keywords.",
    howTo: "Type or paste a variable name, then click Validate. You get a valid / invalid verdict plus a list of exactly what is wrong.",
    faq: [
      ["What makes a name valid?", "It must start with a letter, $ or _, contain only letters, digits, $ or _, be non-empty, and must not be a reserved JavaScript keyword."],
      ["Which words are reserved?", "Keywords like class, return, let, function, new and future-reserved words such as enum and implements cannot be used as identifiers."],
      ["Does it allow Unicode names?", "JavaScript permits some Unicode identifiers, but this validator checks the standard ASCII rules and will flag non-ASCII characters as invalid for portability."]
    ]
  },
  "js-quote-normalizer": {
    title: "Free JS Quote Normalizer – Single ⇄ Double Quotes | ToolsRift",
    desc: "Convert JavaScript string quotes between single and double. String, comment and regex aware, re-escaping the target quote and unescaping the old one.",
    howTo: "Choose the target quote (single or double), paste your code, then click Normalize. Only real string literals are re-quoted; comments and regex are untouched.",
    faq: [
      ["Is it safe on tricky strings?", "Yes. It walks the source character by character, tracking strings, comments and regex literals, so quotes inside comments or regex are never changed."],
      ["What happens to escaped quotes?", "An escaped source quote (like \\' in a single-quoted string) is unescaped, and any target quote inside the string is escaped, keeping the value identical."],
      ["Are template literals affected?", "No. Backtick template literals are left completely untouched, including any strings inside their ${...} expressions."]
    ]
  },
  "js-object-key-sorter": {
    title: "Free JSON Key Sorter – Sort Object Keys Alphabetically | ToolsRift",
    desc: "Recursively sort the keys of a JSON object alphabetically, ascending or descending, with configurable indentation or minified output.",
    howTo: "Paste valid JSON, choose sort direction and indentation, then click Sort Keys. Nested objects and objects inside arrays are sorted too.",
    faq: [
      ["Does it sort nested objects?", "Yes. Sorting is recursive, so objects nested inside other objects or inside arrays all have their keys ordered consistently."],
      ["Is array order preserved?", "Yes. Only object keys are reordered. The order of array elements is never changed, keeping the data semantically identical."],
      ["What input does it accept?", "It expects strict JSON with double-quoted keys. Invalid JSON produces a clear error message so you can fix it before sorting."]
    ]
  },
  "js-var-to-let": {
    title: "Free var to let/const Converter – Modernize JS | ToolsRift",
    desc: "Replace the var keyword with let or const across your JavaScript. String, comment and regex aware so the text \"var\" inside a string is never touched.",
    howTo: "Paste your code, choose let or const as the replacement, then click Convert. Every var declaration keyword is replaced and the count is reported.",
    faq: [
      ["Will it break strings containing 'var'?", "No. The converter tracks string, comment and regex literals, so only the actual var keyword is replaced — text like \"var\" inside a string stays intact."],
      ["Should I choose let or const?", "let is the safe default for variables that are reassigned. const is stricter; only pick it if you know none of the declarations are reassigned later."],
      ["Does it rename identifiers like 'variable'?", "No. Replacement is whole-word only, so identifiers that merely contain the letters var, such as variable or avar, are left unchanged."]
    ]
  }
};

// JS Formatter Component
function JsFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState('2');

  const formatJs = () => {
    if (!input.trim()) return;
    try {
      const indentSize = parseInt(indent);
      const indentStr = ' '.repeat(indentSize);
      
      let formatted = input;
      let level = 0;
      let inString = false;
      let stringChar = '';
      let result = '';
      
      for (let i = 0; i < formatted.length; i++) {
        const char = formatted[i];
        const prev = formatted[i - 1];
        const next = formatted[i + 1];
        
        // Track string state
        if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar) {
            inString = false;
          }
        }
        
        if (!inString) {
          // Opening braces
          if (char === '{' || char === '[') {
            result += char;
            level++;
            if (next && next !== '}' && next !== ']') {
              result += '\n' + indentStr.repeat(level);
            }
            continue;
          }
          
          // Closing braces
          if (char === '}' || char === ']') {
            level = Math.max(0, level - 1);
            if (prev !== '{' && prev !== '[') {
              result += '\n' + indentStr.repeat(level);
            }
            result += char;
            continue;
          }
          
          // Semicolons and commas
          if (char === ';' || char === ',') {
            result += char;
            if (next && next !== '\n' && next !== ' ') {
              result += '\n' + indentStr.repeat(level);
            }
            continue;
          }
          
          // Skip extra whitespace
          if (char === ' ' && prev === ' ') continue;
          if (char === '\n') {
            if (prev !== '\n') result += '\n' + indentStr.repeat(level);
            continue;
          }
        }
        
        result += char;
      }
      
      // Clean up multiple blank lines
      result = result.replace(/\n{3,}/g, '\n\n');
      
      setOutput(result.trim());
    } catch (err) {
      setOutput('Error formatting JavaScript: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="const greet=(name)=>{console.log('Hello '+name);};greet('World');" />
      </div>
      <div>
        <Label>Indentation</Label>
        <SelectInput value={indent} onChange={setIndent} options={[
          { value:'2', label:'2 spaces' },
          { value:'4', label:'4 spaces' }
        ]} />
      </div>
      <Btn onClick={formatJs} disabled={!input.trim()}>Format JavaScript</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Formatted JavaScript</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={14} mono />
        </div>
      )}
    </VStack>
  );
}

// JS Minifier Component
function JsMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);

  const minifyJs = () => {
    if (!input.trim()) return;
    try {
      let minified = input;

      // Remove comments (string/regex-aware so // inside strings/URLs survives)
      minified = trStripComments(minified, {});
      // Remove extra whitespace
      minified = minified.replace(/\s+/g, ' ');
      // Remove spaces around operators
      minified = minified.replace(/\s*([=+\-*/<>!&|,;:{}()\[\]])\s*/g, '$1');
      // Trim
      minified = minified.trim();
      
      const originalSize = new Blob([input]).size;
      const minifiedSize = new Blob([minified]).size;
      const saved = originalSize - minifiedSize;
      const percentage = ((saved / originalSize) * 100).toFixed(1);
      
      setOutput(minified);
      setStats({ originalSize, minifiedSize, saved, percentage });
    } catch (err) {
      setOutput('Error minifying JavaScript: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="function greet(name) {&#10;  // Say hello&#10;  console.log('Hello ' + name);&#10;}" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>{new Blob([input]).size} bytes</div>
      </div>
      <Btn onClick={minifyJs} disabled={!input.trim()}>Minify JavaScript</Btn>
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
            <Label>Minified JavaScript</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={6} mono />
        </div>
      )}
    </VStack>
  );
}

// JS Validator Component
function JsValidator() {
  const [input, setInput] = useState('');
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(null);

  const validateJs = () => {
    if (!input.trim()) return;
    try {
      // Try to parse as function body
      new Function(input);
      setIsValid(true);
      setErrors([]);
    } catch (err) {
      setIsValid(false);
      const errorMsg = err.message;
      const match = errorMsg.match(/line (\d+)/i);
      const lineNum = match ? match[1] : 'unknown';
      setErrors([{
        message: errorMsg,
        line: lineNum
      }]);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={12} mono placeholder="const x = 5;&#10;console.log(x);" />
      </div>
      <Btn onClick={validateJs} disabled={!input.trim()}>Validate JavaScript</Btn>
      {isValid !== null && (
        <div>
          {isValid ? (
            <div style={{ padding:16, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, color:C.success }}>
              ✓ JavaScript is valid! No syntax errors found.
            </div>
          ) : (
            <div>
              <Label>Syntax Error(s) Found</Label>
              <Result mono={false}>
                {errors.map((err, i) => (
                  <div key={i} style={{ color:C.danger }}>
                    <div style={{ fontWeight:600, marginBottom:4 }}>Line {err.line}</div>
                    <div>{err.message}</div>
                  </div>
                ))}
              </Result>
            </div>
          )}
        </div>
      )}
    </VStack>
  );
}

// JSON to JS Component
function JsonToJs() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToJs = () => {
    if (!input.trim()) return;
    try {
      // Parse JSON to validate it
      const obj = JSON.parse(input);

      // Convert to JS object literal syntax with proper single-quote escaping.
      const escStr = (s) => "'" + s
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t') + "'";
      const isValidId = (k) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k);
      const toJs = (val, ind) => {
        if (val === null) return 'null';
        const t = typeof val;
        if (t === 'number' || t === 'boolean') return String(val);
        if (t === 'string') return escStr(val);
        const pad = '  '.repeat(ind + 1);
        const padEnd = '  '.repeat(ind);
        if (Array.isArray(val)) {
          if (val.length === 0) return '[]';
          return '[\n' + val.map((v) => pad + toJs(v, ind + 1)).join(',\n') + '\n' + padEnd + ']';
        }
        const keys = Object.keys(val);
        if (keys.length === 0) return '{}';
        return '{\n' + keys.map((k) => {
          const key = isValidId(k) ? k : escStr(k);
          return pad + key + ': ' + toJs(val[k], ind + 1);
        }).join(',\n') + '\n' + padEnd + '}';
      };
      const jsString = toJs(obj, 0);

      setOutput(jsString);
    } catch (err) {
      setOutput('Error: Invalid JSON - ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JSON Data</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder='{"name": "John", "age": 30, "city": "New York"}' />
      </div>
      <Btn onClick={convertToJs} disabled={!input.trim()}>Convert to JavaScript</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JavaScript Object</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
    </VStack>
  );
}

// JS to JSON Component
function JsToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToJson = () => {
    if (!input.trim()) return;
    try {
      // Try to evaluate the JS object
      const obj = eval('(' + input + ')');
      
      // Convert to JSON
      const jsonString = JSON.stringify(obj, null, 2);
      setOutput(jsonString);
    } catch (err) {
      setOutput('Error: Invalid JavaScript object - ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Object</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="{name: 'John', age: 30, city: 'New York'}" />
      </div>
      <Btn onClick={convertToJson} disabled={!input.trim()}>Convert to JSON</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JSON Data</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚠️ This tool uses eval() for demonstration. In production, use proper parsers.
      </div>
    </VStack>
  );
}

// JS Obfuscator Component
function JsObfuscator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const obfuscate = () => {
    if (!input.trim()) return;
    try {
      let obfuscated = input;
      const varMap = new Map();
      let varCounter = 0;
      
      // Find variable declarations
      const varRegex = /\b(var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      const variables = [];
      let match;
      
      while ((match = varRegex.exec(input)) !== null) {
        const varName = match[2];
        if (!varMap.has(varName) && varName.length > 1) {
          const obfName = '_0x' + varCounter.toString(16);
          varMap.set(varName, obfName);
          varCounter++;
        }
      }
      
      // Replace variable names
      varMap.forEach((obfName, varName) => {
        const regex = new RegExp(`\\b${varName}\\b`, 'g');
        obfuscated = obfuscated.replace(regex, obfName);
      });
      
      // Encode strings
      obfuscated = obfuscated.replace(/'([^']*)'/g, (match, str) => {
        const encoded = Array.from(str).map(c => '\\x' + c.charCodeAt(0).toString(16)).join('');
        return `'${encoded}'`;
      });
      
      obfuscated = obfuscated.replace(/"([^"]*)"/g, (match, str) => {
        const encoded = Array.from(str).map(c => '\\x' + c.charCodeAt(0).toString(16)).join('');
        return `"${encoded}"`;
      });
      
      setOutput(obfuscated);
    } catch (err) {
      setOutput('Error obfuscating code: ' + err.message);
    }
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="const greeting = 'Hello';&#10;function sayHello(name) {&#10;  console.log(greeting + ' ' + name);&#10;}" />
      </div>
      <Btn onClick={obfuscate} disabled={!input.trim()}>Obfuscate Code</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Obfuscated Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚠️ Basic obfuscation only. For production, use dedicated tools like JavaScript Obfuscator or UglifyJS.
      </div>
    </VStack>
  );
}

// ES6 to ES5 Component
function Es6ToEs5() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToEs5 = () => {
    if (!input.trim()) return;
    let converted = input;
    
    // Arrow functions to regular functions
    converted = converted.replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{/g, 'function $1($2) {');
    converted = converted.replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^;{]+);?/g, 'function $1($2) { return $3; }');
    converted = converted.replace(/\(([^)]*)\)\s*=>\s*{/g, 'function($1) {');
    converted = converted.replace(/\(([^)]*)\)\s*=>\s*([^;{]+)/g, 'function($1) { return $2; }');
    
    // Template literals to string concatenation
    converted = converted.replace(/`([^`]*\${[^}]+}[^`]*)`/g, (match, content) => {
      return '"' + content.replace(/\${([^}]+)}/g, '" + $1 + "') + '"';
    });
    
    // const/let to var
    converted = converted.replace(/\b(const|let)\b/g, 'var');
    
    // Destructuring (simple cases)
    converted = converted.replace(/var\s+{\s*(\w+)\s*}\s*=/g, 'var $1 = (');
    converted = converted.replace(/var\s+\[\s*(\w+)\s*\]\s*=/g, 'var $1 = (');
    
    setOutput(converted);
  };

  return (
    <VStack>
      <div>
        <Label>ES6+ JavaScript</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="const greet = (name) => {&#10;  console.log(`Hello ${name}`);&#10;};&#10;&#10;const add = (a, b) => a + b;" />
      </div>
      <Btn onClick={convertToEs5} disabled={!input.trim()}>Convert to ES5</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>ES5 JavaScript</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 Basic conversion only. For production, use Babel for complete ES6+ to ES5 transpilation.
      </div>
    </VStack>
  );
}

// JS to TypeScript Component
function JsToTypescript() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const convertToTs = () => {
    if (!input.trim()) return;
    let typescript = input;
    
    // Add type annotations to function parameters
    typescript = typescript.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (match, name, params) => {
      if (!params.trim()) return `function ${name}()`;
      const typedParams = params.split(',').map(p => {
        const trimmed = p.trim();
        if (trimmed.includes(':')) return trimmed; // Already typed
        return `${trimmed}: any`;
      }).join(', ');
      return `function ${name}(${typedParams})`;
    });
    
    // Add return type annotations — only annotate `: void` when the function body
    // has NO value-returning `return`. If the body returns a value (or detection is
    // uncertain), omit the annotation rather than emit a wrong `: void`.
    typescript = typescript.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, (match, name, params, offset, str) => {
      // Locate the function body by brace-matching from the opening `{` of this match.
      const braceStart = offset + match.length - 1; // index of the `{`
      let depth = 0, bodyEnd = -1;
      for (let i = braceStart; i < str.length; i++) {
        const ch = str[i];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { bodyEnd = i; break; } }
      }
      const body = bodyEnd > braceStart ? str.slice(braceStart + 1, bodyEnd) : str.slice(braceStart + 1);
      // A value-returning return is `return` followed by whitespace then a real value
      // char (excludes `return;`, `return ;`, bare `return}`).
      const returnsValue = /return\s+[^;\s}]/.test(body);
      return returnsValue ? match : match.replace(/\)\s*{$/, '): void {');
    });
    
    // Convert var to let/const
    typescript = typescript.replace(/\bvar\b/g, 'let');
    
    // Add type to variable declarations
    typescript = typescript.replace(/let\s+(\w+)\s*=\s*(\d+)/g, 'let $1: number = $2');
    typescript = typescript.replace(/let\s+(\w+)\s*=\s*"([^"]*)"/g, 'let $1: string = "$2"');
    typescript = typescript.replace(/let\s+(\w+)\s*=\s*'([^']*)'/g, "let $1: string = '$2'");
    typescript = typescript.replace(/let\s+(\w+)\s*=\s*(true|false)/g, 'let $1: boolean = $2');
    
    setOutput(typescript);
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="function greet(name) {&#10;  var message = 'Hello ' + name;&#10;  console.log(message);&#10;  return message;&#10;}" />
      </div>
      <Btn onClick={convertToTs} disabled={!input.trim()}>Add TypeScript Types</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>TypeScript Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 Basic type annotations. Refine types and add interfaces for production TypeScript code.
      </div>
    </VStack>
  );
}

// Regex Tester Component
function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pattern || !testString) {
      setMatches([]);
      setError('');
      return;
    }
    
    try {
      const regex = new RegExp(pattern, flags);
      const found = [];
      let match;
      
      if (flags.includes('g')) {
        while ((match = regex.exec(testString)) !== null) {
          found.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (match.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          found.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      setMatches(found);
      setError('');
    } catch (err) {
      setError(err.message);
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  const highlightMatches = () => {
    if (!matches.length) return testString;
    
    let result = '';
    let lastIndex = 0;
    
    matches.forEach((m, i) => {
      result += testString.substring(lastIndex, m.index);
      result += `<mark style="background: rgba(234,179,8,0.3); color: ${C.yellow}; padding: 2px 4px; border-radius: 3px;">${m.match}</mark>`;
      lastIndex = m.index + m.match.length;
    });
    result += testString.substring(lastIndex);
    
    return result;
  };

  return (
    <VStack>
      <div>
        <Label>Regex Pattern</Label>
        <Input value={pattern} onChange={setPattern} placeholder="\b\w+@\w+\.\w+\b" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
      </div>
      <div>
        <Label>Flags</Label>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {['g', 'i', 'm', 's', 'u'].map(flag => (
            <label key={flag} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
              <input 
                type="checkbox" 
                checked={flags.includes(flag)} 
                onChange={e => {
                  if (e.target.checked) {
                    setFlags(flags + flag);
                  } else {
                    setFlags(flags.replace(flag, ''));
                  }
                }}
              />
              <span>{flag}</span>
              <span style={{ color:C.muted, fontSize:11 }}>
                ({flag === 'g' ? 'global' : flag === 'i' ? 'case-insensitive' : flag === 'm' ? 'multiline' : flag === 's' ? 'dotall' : 'unicode'})
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Test String</Label>
        <Textarea value={testString} onChange={setTestString} rows={6} placeholder="Enter text to test against the regex pattern..." />
      </div>
      {error && (
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, color:C.danger, fontSize:13 }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {matches.length > 0 && (
        <div>
          <BigResult value={matches.length} label={`Match${matches.length > 1 ? 'es' : ''} Found`} />
          <div style={{ marginTop:16 }}>
            <Label>Highlighted Matches</Label>
            <div 
              style={{ 
                background:"rgba(0,0,0,0.3)", 
                border:`1px solid ${C.border}`, 
                borderRadius:8, 
                padding:"12px 14px", 
                fontSize:13, 
                lineHeight:1.8,
                fontFamily:"'JetBrains Mono',monospace",
                wordBreak:"break-word"
              }}
              dangerouslySetInnerHTML={{ __html: highlightMatches() }}
            />
          </div>
          <div style={{ marginTop:16 }}>
            <Label>Match Details</Label>
            <Result mono={false}>
              {matches.map((m, i) => (
                <div key={i} style={{ marginBottom:12, paddingBottom:12, borderBottom: i < matches.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontWeight:600, color:C.yellow, marginBottom:4 }}>Match #{i + 1}</div>
                  <div style={{ fontSize:12, marginLeft:8 }}>
                    <div><span style={{ color:C.muted }}>Text:</span> {m.match}</div>
                    <div><span style={{ color:C.muted }}>Index:</span> {m.index}</div>
                    {m.groups.length > 0 && (
                      <div><span style={{ color:C.muted }}>Groups:</span> {m.groups.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </Result>
          </div>
        </div>
      )}
      {!error && matches.length === 0 && testString && pattern && (
        <div style={{ padding:12, background:"rgba(100,116,139,0.1)", border:`1px solid rgba(100,116,139,0.3)`, borderRadius:8, color:C.muted, fontSize:13 }}>
          No matches found for this pattern.
        </div>
      )}
    </VStack>
  );
}

// JS Console Simulator Component
function JsConsoleSimulator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);

  const runCode = () => {
    if (!input.trim()) return;
    const logs = [];
    
    // Override console.log
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' '));
    };
    
    try {
      // Execute code
      eval(input);
      setOutput(logs.length > 0 ? logs : ['(no output)']);
    } catch (err) {
      setOutput([`Error: ${err.message}`]);
    } finally {
      // Restore console.log
      console.log = originalLog;
    }
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder="console.log('Hello World');&#10;const x = 5;&#10;const y = 10;&#10;console.log('Sum:', x + y);" />
      </div>
      <Btn onClick={runCode} disabled={!input.trim()}>Run Code</Btn>
      {output.length > 0 && (
        <div>
          <Label>Console Output</Label>
          <div style={{ background:"#000", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>
            {output.map((line, i) => (
              <div key={i} style={{ color: line.startsWith('Error:') ? C.danger : '#4ADE80', marginBottom:4 }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚠️ This uses eval() for demonstration. Only run trusted code. For production, use proper sandboxing.
      </div>
    </VStack>
  );
}

// ===== String / comment / regex-aware JS scanner helpers (shared) =====
// The console + comment removers walk the source one character at a time and
// track whether they are inside a string ('  "  `), a line comment, a block
// comment, or a regex literal. Comment/console syntax that appears INSIDE a
// string or regex (e.g. the "//" in "http://x.com") is therefore never mistaken
// for a real comment or call. A naive regex like /\/\/.*$/ would corrupt those.
const TR_VALUE_CHAR = /[A-Za-z0-9_$)\]]/;
// After a "value" (identifier, number, ), ]) a `/` is division; otherwise it can
// start a regex literal. We track that with a rolling boolean.
function trNextValueState(ch, cur) {
  if (/\s/.test(ch)) return cur;      // whitespace does not change value state
  return TR_VALUE_CHAR.test(ch);
}
// Returns index just past the closing quote of the string starting at i (handles \ escapes).
function trScanStringEnd(src, i) {
  const q = src[i]; let j = i + 1; const n = src.length;
  while (j < n) {
    const c = src[j];
    if (c === '\\') { j += 2; continue; }  // skip escaped char
    if (c === q) return j + 1;
    j++;
  }
  return n; // unterminated string: consume to end
}
// Returns index just past a regex literal (incl. flags) starting at i, or -1 if
// the `/` does not open a valid single-line regex.
function trScanRegexEnd(src, i) {
  let j = i + 1; const n = src.length; let inClass = false, closed = false;
  while (j < n) {
    const c = src[j];
    if (c === '\\') { j += 2; continue; }     // escaped char (e.g. \/ )
    if (c === '\n') return -1;                // newline before close -> not a regex
    if (c === '[') { inClass = true; j++; continue; }
    if (c === ']') { inClass = false; j++; continue; }
    if (c === '/' && !inClass) { j++; closed = true; break; }
    j++;
  }
  if (!closed) return -1;
  while (j < n && /[A-Za-z]/.test(src[j])) j++; // consume flags
  return j;
}

// Remove // line and /* */ block comments, string/regex-aware.
function trStripComments(src, opts) {
  const preserveJsDoc = !!(opts && opts.preserveJsDoc);
  const collapseBlank = !!(opts && opts.collapseBlank);
  let out = ''; let i = 0; const n = src.length; let val = false;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    // String literal -> copy verbatim (comment syntax inside is data, not a comment)
    if (ch === '"' || ch === "'" || ch === '`') {
      const end = trScanStringEnd(src, i); out += src.slice(i, end); i = end; val = true; continue;
    }
    // Line comment -> drop, and trim whitespace left before it on this line
    if (ch === '/' && nx === '/') {
      out = out.replace(/[ \t]+$/, '');
      let j = i + 2; while (j < n && src[j] !== '\n') j++;
      i = j; continue; // leave the newline for the next iteration
    }
    // Block comment -> drop (optionally keep JSDoc /** */)
    if (ch === '/' && nx === '*') {
      const jsdoc = src[i + 2] === '*';
      let j = i + 2; while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++;
      const end = Math.min(j + 2, n);
      if (preserveJsDoc && jsdoc) out += src.slice(i, end);
      else out = out.replace(/[ \t]+$/, '');
      i = end; continue;
    }
    // Regex literal -> copy verbatim so any // or /* inside it survives
    if (ch === '/' && !val) {
      const end = trScanRegexEnd(src, i);
      if (end !== -1) { out += src.slice(i, end); i = end; val = true; continue; }
    }
    out += ch; val = trNextValueState(ch, val); i++;
  }
  if (collapseBlank) out = out.replace(/(?:[ \t]*\r?\n){2,}/g, '\n');
  else out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

// Given `open` = index of '(', return index just past its matching ')',
// skipping strings/comments/regex inside. -1 if unbalanced.
function trMatchParenEnd(src, open) {
  let depth = 0; let i = open; const n = src.length; let val = false;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '"' || ch === "'" || ch === '`') { i = trScanStringEnd(src, i); val = true; continue; }
    if (ch === '/' && nx === '/') { let j = i + 2; while (j < n && src[j] !== '\n') j++; i = j; continue; }
    if (ch === '/' && nx === '*') { let j = i + 2; while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++; i = Math.min(j + 2, n); continue; }
    if (ch === '/' && !val) { const e = trScanRegexEnd(src, i); if (e !== -1) { i = e; val = true; continue; } }
    if (ch === '(') { depth++; i++; val = false; continue; }
    if (ch === ')') { depth--; i++; if (depth === 0) return i; val = true; continue; }
    val = trNextValueState(ch, val); i++;
  }
  return -1;
}
// At index i (which must be the start of the word "console"), match `console.<method>(`.
function trMatchConsoleAt(src, i) {
  let j = i + 7; const n = src.length;
  if (j < n && /[A-Za-z0-9_$]/.test(src[j])) return null; // e.g. "consoleLog"
  while (j < n && /\s/.test(src[j])) j++;
  if (src[j] !== '.') return null;
  j++;
  while (j < n && /\s/.test(src[j])) j++;
  let method = '';
  while (j < n && /[A-Za-z]/.test(src[j])) { method += src[j]; j++; }
  if (!method) return null;
  while (j < n && /\s/.test(src[j])) j++;
  if (src[j] !== '(') return null;
  return { method, paren: j };
}
// Remove console.<method>(...) calls, string/comment/regex-aware.
// `methods` is either the string 'all' or a Set of method names to strip.
function trRemoveConsole(src, methods) {
  let out = ''; let i = 0; const n = src.length; let val = false; let removed = 0;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '"' || ch === "'" || ch === '`') { const end = trScanStringEnd(src, i); out += src.slice(i, end); i = end; val = true; continue; }
    if (ch === '/' && nx === '/') { let j = i + 2; while (j < n && src[j] !== '\n') j++; out += src.slice(i, j); i = j; continue; }
    if (ch === '/' && nx === '*') { let j = i + 2; while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++; const end = Math.min(j + 2, n); out += src.slice(i, end); i = end; continue; }
    if (ch === '/' && !val) { const end = trScanRegexEnd(src, i); if (end !== -1) { out += src.slice(i, end); i = end; val = true; continue; } }
    if (ch === 'c' && src.startsWith('console', i)) {
      const pc = i > 0 ? src[i - 1] : '';
      // Skip member access (a.console.log) and larger identifiers (myconsole) to
      // avoid leaving dangling code like "a." behind.
      if (!/[A-Za-z0-9_$.]/.test(pc)) {
        const m = trMatchConsoleAt(src, i);
        if (m && (methods === 'all' || methods.has(m.method))) {
          const closeEnd = trMatchParenEnd(src, m.paren);
          if (closeEnd !== -1) {
            let k = closeEnd;
            while (k < n && (src[k] === ' ' || src[k] === '\t')) k++;
            if (src[k] === ';') k++;                 // drop dangling semicolon
            const ls = out.lastIndexOf('\n') + 1;
            const before = out.slice(ls);
            if (/^\s*$/.test(before)) {              // statement stood alone on its line
              out = out.slice(0, ls);                // remove its indentation
              if (src[k] === '\r') k++;
              if (src[k] === '\n') k++;              // and the now-empty line
            }
            removed++; i = k; val = false; continue;
          }
        }
      }
    }
    out += ch; val = trNextValueState(ch, val); i++;
  }
  return { code: out, removed };
}

// Regex-based CommonJS <-> ESM converter (static top-level patterns only).
function trConvertModules(src, mode) {
  let out = src;
  if (mode === 'cjs2esm') {
    // const { a, b } = require('mod')
    out = out.replace(/(?:const|let|var)\s*\{\s*([^}]+?)\s*\}\s*=\s*require\(\s*(['"])([^'"]+)\2\s*\)\s*;?/g,
      (m, names, q, mod) => `import { ${names.split(',').map(s => s.trim()).filter(Boolean).join(', ')} } from '${mod}';`);
    // const x = require('mod')
    out = out.replace(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\(\s*(['"])([^'"]+)\2\s*\)\s*;?/g,
      (m, name, q, mod) => `import ${name} from '${mod}';`);
    // require('mod');  (side-effect only)
    out = out.replace(/^\s*require\(\s*(['"])([^'"]+)\1\s*\)\s*;?\s*$/gm,
      (m, q, mod) => `import '${mod}';`);
    // module.exports.foo = / exports.foo =
    out = out.replace(/\bmodule\.exports\.([A-Za-z_$][\w$]*)\s*=\s*/g, 'export const $1 = ');
    out = out.replace(/\bexports\.([A-Za-z_$][\w$]*)\s*=\s*/g, 'export const $1 = ');
    // module.exports = x
    out = out.replace(/\bmodule\.exports\s*=\s*/g, 'export default ');
    return out;
  }
  // esm2cjs
  // import * as x from 'mod'
  out = out.replace(/import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*(['"])([^'"]+)\2\s*;?/g,
    (m, name, q, mod) => `const ${name} = require('${mod}');`);
  // import { a, b } from 'mod'
  out = out.replace(/import\s*\{\s*([^}]+?)\s*\}\s*from\s*(['"])([^'"]+)\2\s*;?/g,
    (m, names, q, mod) => `const { ${names.split(',').map(s => s.trim()).filter(Boolean).join(', ')} } = require('${mod}');`);
  // import x from 'mod'
  out = out.replace(/import\s+([A-Za-z_$][\w$]*)\s+from\s*(['"])([^'"]+)\2\s*;?/g,
    (m, name, q, mod) => `const ${name} = require('${mod}');`);
  // import 'mod'  (side-effect only)
  out = out.replace(/import\s*(['"])([^'"]+)\1\s*;?/g,
    (m, q, mod) => `require('${mod}');`);
  // export default x
  out = out.replace(/export\s+default\s+/g, 'module.exports = ');
  // export const/let/var foo =
  out = out.replace(/export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*/g, 'exports.$1 = ');
  return out;
}

// Sort & group leading ES import statements.
function trSortImports(src) {
  const lines = src.split('\n');
  const n = lines.length;
  const isBlank = s => s.trim() === '';
  const isLineComment = s => /^\s*\/\//.test(s);
  const isOneLineBlock = s => /^\s*\/\*.*\*\/\s*$/.test(s);
  // Preserve a leading header of blank lines / single-line comments above imports.
  let p = 0;
  while (p < n && (isBlank(lines[p]) || isLineComment(lines[p]) || isOneLineBlock(lines[p]))) p++;
  if (p >= n || !/^\s*import\b/.test(lines[p])) return src; // no leading import block
  const preamble = lines.slice(0, p);
  const items = [];
  let idx = p;
  const hasFrom = s => /from\s*['"][^'"]+['"]/.test(s);
  const isSideEffect = s => /^\s*import\s*['"][^'"]+['"]\s*;?\s*$/.test(s);
  while (idx < n) {
    if (isBlank(lines[idx])) { idx++; continue; }   // skip blank lines between imports
    if (!/^\s*import\b/.test(lines[idx])) break;     // first non-import code -> stop
    let stmt = lines[idx]; let j = idx;
    if (!isSideEffect(lines[idx]) && !hasFrom(lines[idx])) {
      // multi-line import: keep consuming until the line containing `from '...'`
      while (j + 1 < n && !hasFrom(lines[j])) { j++; stmt += '\n' + lines[j]; }
    }
    const source = (stmt.match(/from\s*['"]([^'"]+)['"]/) || stmt.match(/import\s*['"]([^'"]+)['"]/) || [, ''])[1];
    items.push({ text: stmt, source, sideEffect: isSideEffect(lines[idx]) });
    idx = j + 1;
  }
  const rest = lines.slice(idx);
  const rel = s => /^(\.\.?\/|@\/|~\/|\/)/.test(s); // internal / relative
  const side = items.filter(i => i.sideEffect); // preserve order
  const ext = items.filter(i => !i.sideEffect && !rel(i.source)).sort((a, b) => a.source.localeCompare(b.source));
  const int = items.filter(i => !i.sideEffect && rel(i.source)).sort((a, b) => a.source.localeCompare(b.source));
  const groups = [];
  if (side.length) groups.push(side.map(i => i.text).join('\n'));
  if (ext.length) groups.push(ext.map(i => i.text).join('\n'));
  if (int.length) groups.push(int.map(i => i.text).join('\n'));
  let result = preamble.length ? preamble.join('\n') + '\n' : '';
  result += groups.join('\n\n');
  const restStr = rest.join('\n');
  if (restStr.trim()) result += '\n\n' + restStr.replace(/^\n+/, '');
  else result += '\n';
  return result;
}

// Console.log Remover Component
function JsConsoleRemover() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [removed, setRemoved] = useState(null);
  const [ran, setRan] = useState(false);
  const [all, setAll] = useState(false);
  const [methods, setMethods] = useState({ log:true, warn:true, error:true, info:true, debug:true });

  const toggle = k => setMethods(m => ({ ...m, [k]: !m[k] }));

  const run = () => {
    if (!input.trim()) return;
    const arg = all ? 'all' : new Set(Object.keys(methods).filter(k => methods[k]));
    const res = trRemoveConsole(input, arg);
    setOutput(res.code);
    setRemoved(res.removed);
    setRan(true);
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={"function load(url) {\n  console.log('fetching', url); // debug\n  const u = \"http://api.example.com\";\n  return fetch(u);\n}"} />
      </div>
      <div>
        <Label>Methods to Remove</Label>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, marginBottom:10 }}>
          <input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} />
          <span>All <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>console.*</code> methods</span>
        </label>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", opacity: all ? 0.4 : 1, pointerEvents: all ? "none" : "auto" }}>
          {['log','warn','error','info','debug'].map(k => (
            <label key={k} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
              <input type="checkbox" checked={methods[k]} onChange={() => toggle(k)} />
              <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>console.{k}</span>
            </label>
          ))}
        </div>
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Remove Console Statements</Btn>
      {ran && (
        <>
          {removed !== null && (
            <div style={{ fontSize:12, color: removed > 0 ? C.success : C.muted }}>
              {removed > 0 ? `✓ Removed ${removed} console statement${removed > 1 ? 's' : ''}` : 'No matching console statements found'}
            </div>
          )}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <Label>Cleaned JavaScript</Label>
              <CopyBtn text={output} />
            </div>
            <Textarea value={output} onChange={() => {}} rows={10} mono />
          </div>
        </>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 String, comment and regex safe — a URL like <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>"http://x.com"</code> or the text <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>"console.log"</code> inside a string is never touched.
      </div>
    </VStack>
  );
}

// JS Comment Remover Component
function JsCommentRemover() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [ran, setRan] = useState(false);
  const [jsdoc, setJsdoc] = useState(false);
  const [collapse, setCollapse] = useState(false);

  const run = () => {
    if (!input.trim()) return;
    setOutput(trStripComments(input, { preserveJsDoc: jsdoc, collapseBlank: collapse }));
    setRan(true);
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={"// config\nconst url = \"http://example.com\"; // keep this URL\n/* block\n   comment */\nfunction go() { return url; }"} />
      </div>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={jsdoc} onChange={e => setJsdoc(e.target.checked)} />
          <span>Preserve JSDoc <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>/** */</code></span>
        </label>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
          <input type="checkbox" checked={collapse} onChange={e => setCollapse(e.target.checked)} />
          <span>Collapse blank lines</span>
        </label>
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Remove Comments</Btn>
      {ran && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Cleaned JavaScript</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 String and regex aware — the <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>//</code> inside <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>"http://..."</code> or a regex literal is preserved; only real comments are removed.
      </div>
    </VStack>
  );
}

// CommonJS <-> ESM Converter Component
function CjsEsmConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('cjs2esm');

  const run = () => {
    if (!input.trim()) return;
    setOutput(trConvertModules(input, mode));
  };

  return (
    <VStack>
      <div>
        <Label>Conversion Direction</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'cjs2esm', label:'CommonJS → ES Modules' },
          { value:'esm2cjs', label:'ES Modules → CommonJS' },
        ]} />
      </div>
      <div>
        <Label>{mode === 'cjs2esm' ? 'CommonJS Code' : 'ES Modules Code'}</Label>
        <Textarea value={input} onChange={setInput} rows={10} mono placeholder={mode === 'cjs2esm'
          ? "const fs = require('fs');\nconst { join } = require('path');\nrequire('dotenv/config');\nmodule.exports = main;\nexports.helper = helper;"
          : "import fs from 'fs';\nimport { join } from 'path';\nimport './setup';\nexport default main;\nexport const helper = helper;"} />
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Convert</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'cjs2esm' ? 'ES Modules Output' : 'CommonJS Output'}</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={10} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚠️ Static conversion of common patterns only. Dynamic <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>require()</code> calls, conditional imports, re-exports (<code style={{ fontFamily:"'JetBrains Mono',monospace" }}>export ... from</code>) and mixed default+named imports are not converted.
      </div>
    </VStack>
  );
}

// JS Import Sorter Component
function JsImportSorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const run = () => {
    if (!input.trim()) return;
    setOutput(trSortImports(input));
  };

  return (
    <VStack>
      <div>
        <Label>JavaScript / TypeScript Source</Label>
        <Textarea value={input} onChange={setInput} rows={12} mono placeholder={"import { useState } from 'react';\nimport Button from './Button';\nimport axios from 'axios';\nimport '../styles.css';\nimport { fmt } from '@/utils';\n\nexport default function App() {}"} />
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Sort &amp; Group Imports</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Sorted Imports</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 External packages are grouped first, then internal/relative imports (<code style={{ fontFamily:"'JetBrains Mono',monospace" }}>./</code>, <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>../</code>, <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>@/</code>), sorted A–Z within each group. Side-effect imports and code below the import block are preserved.
      </div>
    </VStack>
  );
}

// ===== Batch 3 helpers (verified in scratch script — all pure, deterministic) =====
const TR_ESC_MAP = { '\\':'\\\\', '\n':'\\n', '\r':'\\r', '\t':'\\t', '\b':'\\b', '\f':'\\f', '\v':'\\v', '\0':'\\0' };
function trEscBody(text, quote) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], code = text.charCodeAt(i);
    if (ch === quote) { out += '\\' + quote; continue; }
    if (TR_ESC_MAP[ch] !== undefined) {
      if (ch === '\0' && /[0-9]/.test(text[i + 1] || '')) { out += '\\x00'; continue; }
      out += TR_ESC_MAP[ch]; continue;
    }
    if (code < 0x20) { out += '\\x' + code.toString(16).padStart(2, '0'); continue; }
    out += ch;
  }
  return out;
}
function trEscapeJsString(text, quote) { quote = quote || '"'; return quote + trEscBody(text, quote) + quote; }
function trUnescapeJsString(text) {
  let s = text.trim();
  if (s.length >= 2 && (s[0] === '"' || s[0] === "'" || s[0] === '`') && s[s.length - 1] === s[0]) s = s.slice(1, -1);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch !== '\\') { out += ch; continue; }
    const nx = s[i + 1];
    if (nx === undefined) { out += '\\'; break; }
    switch (nx) {
      case 'n': out += '\n'; i++; break;
      case 'r': out += '\r'; i++; break;
      case 't': out += '\t'; i++; break;
      case 'b': out += '\b'; i++; break;
      case 'f': out += '\f'; i++; break;
      case 'v': out += '\v'; i++; break;
      case '0': out += '\0'; i++; break;
      case 'x': { const h = s.substr(i + 2, 2); if (/^[0-9a-fA-F]{2}$/.test(h)) { out += String.fromCharCode(parseInt(h, 16)); i += 3; } else { out += 'x'; i++; } break; }
      case 'u': {
        if (s[i + 2] === '{') { const m = /^\\u\{([0-9a-fA-F]+)\}/.exec(s.slice(i)); if (m) { out += String.fromCodePoint(parseInt(m[1], 16)); i += m[0].length - 1; break; } out += 'u'; i++; break; }
        const h = s.substr(i + 2, 4); if (/^[0-9a-fA-F]{4}$/.test(h)) { out += String.fromCharCode(parseInt(h, 16)); i += 5; } else { out += 'u'; i++; } break;
      }
      default: out += nx; i++; break;
    }
  }
  return out;
}

const TR_RESERVED = new Set(['break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','false','finally','for','function','if','import','in','instanceof','new','null','return','super','switch','this','throw','true','try','typeof','var','void','while','with','yield','let','static','enum','await','implements','package','protected','interface','private','public','abstract','boolean','byte','char','double','final','float','goto','int','long','native','short','synchronized','throws','transient','volatile']);
function trValidateIdent(name) {
  const issues = [];
  if (name === '') { issues.push('Name is empty.'); return { valid: false, issues }; }
  if (/\s/.test(name)) issues.push('Contains whitespace — identifiers cannot contain spaces.');
  if (/^[0-9]/.test(name)) issues.push('Starts with a digit — identifiers must start with a letter, $ or _.');
  else if (!/^[A-Za-z_$]/.test(name)) issues.push('First character "' + name[0] + '" is not a letter, $ or _.');
  const bad = [...name].filter(c => !/[A-Za-z0-9_$]/.test(c));
  if (bad.length) issues.push('Invalid character' + (bad.length > 1 ? 's' : '') + ': ' + [...new Set(bad)].map(c => JSON.stringify(c)).join(', '));
  if (TR_RESERVED.has(name)) issues.push('"' + name + '" is a reserved word / keyword.');
  return { valid: issues.length === 0, issues };
}

function trNormalizeQuotes(src, target) {
  const qt = target === 'single' ? "'" : '"';
  const qs = qt === '"' ? "'" : '"';
  let out = '', i = 0, val = false; const n = src.length;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '`') { const end = trScanStringEnd(src, i); out += src.slice(i, end); i = end; val = true; continue; }
    if (ch === '/' && nx === '/') { let j = i + 2; while (j < n && src[j] !== '\n') j++; out += src.slice(i, j); i = j; continue; }
    if (ch === '/' && nx === '*') { let j = i + 2; while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++; const e = Math.min(j + 2, n); out += src.slice(i, e); i = e; continue; }
    if (ch === '/' && !val) { const e = trScanRegexEnd(src, i); if (e !== -1) { out += src.slice(i, e); i = e; val = true; continue; } }
    if (ch === qs || ch === qt) {
      const end = trScanStringEnd(src, i);
      if (ch === qt) { out += src.slice(i, end); }
      else {
        const inner = src.slice(i + 1, end - 1); let res = '';
        for (let k = 0; k < inner.length; k++) {
          const c = inner[k];
          if (c === '\\') { const c2 = inner[k + 1]; if (c2 === qs) { res += qs; k++; } else { res += c + (c2 === undefined ? '' : c2); k++; } continue; }
          if (c === qt) { res += '\\' + qt; continue; }
          res += c;
        }
        out += qt + res + qt;
      }
      i = end; val = true; continue;
    }
    out += ch; val = trNextValueState(ch, val); i++;
  }
  return out;
}

function trEscapeUnicode(text) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x7E || code < 0x20) out += '\\u' + code.toString(16).padStart(4, '0');
    else out += text[i];
  }
  return out;
}
function trUnescapeUnicode(text) {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));
}

function trDecodeTemplateQuasi(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c !== '\\') { out += c; continue; }
    const nx = raw[i + 1];
    switch (nx) {
      case 'n': out += '\n'; i++; break;
      case 't': out += '\t'; i++; break;
      case 'r': out += '\r'; i++; break;
      case 'b': out += '\b'; i++; break;
      case 'f': out += '\f'; i++; break;
      case 'v': out += '\v'; i++; break;
      case '`': out += '`'; i++; break;
      case '$': out += '$'; i++; break;
      case '\\': out += '\\'; i++; break;
      case 'u': { if (raw[i + 2] === '{') { const m = /^\\u\{([0-9a-fA-F]+)\}/.exec(raw.slice(i)); if (m) { out += String.fromCodePoint(parseInt(m[1], 16)); i += m[0].length - 1; break; } } const h = raw.substr(i + 2, 4); if (/^[0-9a-fA-F]{4}$/.test(h)) { out += String.fromCharCode(parseInt(h, 16)); i += 5; } else { out += nx; i++; } break; }
      case 'x': { const h = raw.substr(i + 2, 2); if (/^[0-9a-fA-F]{2}$/.test(h)) { out += String.fromCharCode(parseInt(h, 16)); i += 3; } else { out += nx; i++; } break; }
      default: out += (nx === undefined ? '' : nx); i++; break;
    }
  }
  return out;
}
function trScanExprEnd(src, p) {
  let i = p, depth = 0; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '"' || c === "'") { i = trScanStringEnd(src, i); continue; }
    if (c === '`') { i = trScanTemplateEnd(src, i); continue; }
    if (c === '{') { depth++; i++; continue; }
    if (c === '}') { if (depth === 0) return i; depth--; i++; continue; }
    i++;
  }
  return -1;
}
function trScanTemplateEnd(src, start) {
  let i = start + 1; const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '\\') { i += 2; continue; }
    if (c === '`') return i + 1;
    if (c === '$' && src[i + 1] === '{') { const e = trScanExprEnd(src, i + 2); if (e === -1) return n; i = e + 1; continue; }
    i++;
  }
  return n;
}
function trParseTemplate(src, start) {
  let i = start + 1; const n = src.length; let quasi = ''; const quasis = [], exprs = [];
  while (i < n) {
    const c = src[i];
    if (c === '\\') { quasi += c + (src[i + 1] || ''); i += 2; continue; }
    if (c === '`') { quasis.push(quasi); i++; break; }
    if (c === '$' && src[i + 1] === '{') { quasis.push(quasi); quasi = ''; const e = trScanExprEnd(src, i + 2); const expr = src.slice(i + 2, e === -1 ? n : e); exprs.push(expr); i = (e === -1 ? n : e + 1); continue; }
    quasi += c; i++;
  }
  return { end: i, quasis, exprs };
}
function trTemplateToConcat(src) {
  let out = '', i = 0, val = false; const n = src.length;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '"' || ch === "'") { const end = trScanStringEnd(src, i); out += src.slice(i, end); i = end; val = true; continue; }
    if (ch === '/' && nx === '/') { let j = i + 2; while (j < n && src[j] !== '\n') j++; out += src.slice(i, j); i = j; continue; }
    if (ch === '/' && nx === '*') { let j = i + 2; while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++; const e = Math.min(j + 2, n); out += src.slice(i, e); i = e; continue; }
    if (ch === '/' && !val) { const e = trScanRegexEnd(src, i); if (e !== -1) { out += src.slice(i, e); i = e; val = true; continue; } }
    if (ch === '`') {
      const prev = out.replace(/\s+$/, '').slice(-1);
      if (/[A-Za-z0-9_$)\]]/.test(prev)) { const end = trScanTemplateEnd(src, i); out += src.slice(i, end); i = end; val = true; continue; }
      const t = trParseTemplate(src, i);
      const parts = [];
      for (let k = 0; k < t.quasis.length; k++) {
        const q = trDecodeTemplateQuasi(t.quasis[k]);
        if (q !== '') parts.push(trEscapeJsString(q, '"'));
        if (k < t.exprs.length) parts.push('(' + t.exprs[k].trim() + ')');
      }
      out += parts.length ? parts.join(' + ') : '""';
      i = t.end; val = true; continue;
    }
    out += ch; val = trNextValueState(ch, val); i++;
  }
  return out;
}

function trSplitTernary(expr) {
  let depth = 0, i = 0, qpos = -1; const n = expr.length;
  while (i < n) {
    const c = expr[i];
    if (c === '"' || c === "'" || c === '`') { i = trScanStringEnd(expr, i); continue; }
    if (c === '(' || c === '[' || c === '{') { depth++; i++; continue; }
    if (c === ')' || c === ']' || c === '}') { depth--; i++; continue; }
    if (depth === 0 && c === '?') {
      if (expr[i + 1] === '?') { i += 2; continue; }
      if (expr[i + 1] === '.') { i += 2; continue; }
      qpos = i; break;
    }
    i++;
  }
  if (qpos === -1) return null;
  let j = qpos + 1, td = 0, cd = 0, colon = -1;
  while (j < n) {
    const c = expr[j];
    if (c === '"' || c === "'" || c === '`') { j = trScanStringEnd(expr, j); continue; }
    if (c === '(' || c === '[' || c === '{') { cd++; j++; continue; }
    if (c === ')' || c === ']' || c === '}') { cd--; j++; continue; }
    if (cd === 0 && c === '?') { if (expr[j + 1] === '?' || expr[j + 1] === '.') { j += 2; continue; } td++; j++; continue; }
    if (cd === 0 && c === ':') { if (td === 0) { colon = j; break; } td--; j++; continue; }
    j++;
  }
  if (colon === -1) return null;
  return { cond: expr.slice(0, qpos).trim(), cons: expr.slice(qpos + 1, colon).trim(), alt: expr.slice(colon + 1).trim() };
}
function trTernaryLine(line) {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(line);
  const indent = m[1]; let body = m[2];
  if (!body) return line;
  let semi = ''; if (body.endsWith(';')) { semi = ';'; body = body.slice(0, -1); }
  let mm;
  if ((mm = /^return\s+([\s\S]+)$/.exec(body))) {
    const t = trSplitTernary(mm[1]); if (!t) return line;
    return indent + 'if (' + t.cond + ') {\n' + indent + '  return ' + t.cons + semi + '\n' + indent + '} else {\n' + indent + '  return ' + t.alt + semi + '\n' + indent + '}';
  }
  if ((mm = /^(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]+)$/.exec(body))) {
    const t = trSplitTernary(mm[3]); if (!t) return line;
    const kw = mm[1] === 'const' ? 'let' : mm[1];
    return indent + kw + ' ' + mm[2] + ';\n' + indent + 'if (' + t.cond + ') {\n' + indent + '  ' + mm[2] + ' = ' + t.cons + semi + '\n' + indent + '} else {\n' + indent + '  ' + mm[2] + ' = ' + t.alt + semi + '\n' + indent + '}';
  }
  if ((mm = /^([A-Za-z_$][\w$.\[\]'"]*)\s*=\s*([\s\S]+)$/.exec(body))) {
    const t = trSplitTernary(mm[2]); if (!t) return line;
    return indent + 'if (' + t.cond + ') {\n' + indent + '  ' + mm[1] + ' = ' + t.cons + semi + '\n' + indent + '} else {\n' + indent + '  ' + mm[1] + ' = ' + t.alt + semi + '\n' + indent + '}';
  }
  return line;
}
function trTernaryToIf(src) { return src.split('\n').map(trTernaryLine).join('\n'); }

function trSortKeysDeep(val, dir) {
  if (Array.isArray(val)) return val.map(v => trSortKeysDeep(v, dir));
  if (val && typeof val === 'object') {
    const keys = Object.keys(val).sort((a, b) => a.localeCompare(b));
    if (dir === 'desc') keys.reverse();
    const o = {};
    keys.forEach(k => { o[k] = trSortKeysDeep(val[k], dir); });
    return o;
  }
  return val;
}
function trSortObjectKeys(text, dir, indent) {
  const parsed = JSON.parse(text);
  const sorted = trSortKeysDeep(parsed, dir);
  if (indent === 'min') return JSON.stringify(sorted);
  const ind = indent === 'tab' ? '\t' : parseInt(indent);
  return JSON.stringify(sorted, null, ind);
}

function trArrayFromList(text, opts) {
  const { delim, quote, trim, skipEmpty, dedupe, multiline } = opts;
  let items;
  if (delim === 'newline') items = text.split(/\r?\n/);
  else if (delim === 'comma') items = text.split(',');
  else items = text.split(/\s+/);
  if (trim) items = items.map(s => s.trim());
  if (skipEmpty) items = items.filter(s => s !== '');
  if (dedupe) items = [...new Set(items)];
  const q = quote === 'single' ? "'" : quote === 'double' ? '"' : null;
  const encoded = items.map(s => q === null ? s : trEscapeJsString(s, q));
  if (multiline) return '[\n' + encoded.map(s => '  ' + s).join(',\n') + '\n]';
  return '[' + encoded.join(', ') + ']';
}

function trVarToLet(src, target) {
  let out = '', i = 0, val = false; const n = src.length; let count = 0;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '"' || ch === "'" || ch === '`') { const end = trScanStringEnd(src, i); out += src.slice(i, end); i = end; val = true; continue; }
    if (ch === '/' && nx === '/') { let j = i + 2; while (j < n && src[j] !== '\n') j++; out += src.slice(i, j); i = j; continue; }
    if (ch === '/' && nx === '*') { let j = i + 2; while (j < n && !(src[j] === '*' && src[j + 1] === '/')) j++; const e = Math.min(j + 2, n); out += src.slice(i, e); i = e; continue; }
    if (ch === '/' && !val) { const e = trScanRegexEnd(src, i); if (e !== -1) { out += src.slice(i, e); i = e; val = true; continue; } }
    if (ch === 'v' && src.startsWith('var', i)) {
      const pc = i > 0 ? src[i - 1] : '', ac = src[i + 3] || '';
      if (!/[A-Za-z0-9_$]/.test(pc) && !/[A-Za-z0-9_$]/.test(ac)) { out += target; count++; i += 3; val = true; continue; }
    }
    out += ch; val = trNextValueState(ch, val); i++;
  }
  return { code: out, count };
}

// JS String Escaper Component
function JsStringEscaper() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('escape');
  const [quote, setQuote] = useState('"');
  const run = () => {
    if (!input) { setOutput(''); return; }
    try {
      setOutput(mode === 'escape' ? trEscapeJsString(input, quote) : trUnescapeJsString(input));
    } catch (err) { setOutput('Error: ' + err.message); }
  };
  return (
    <VStack>
      <Grid2>
        <div>
          <Label>Mode</Label>
          <SelectInput value={mode} onChange={setMode} options={[
            { value:'escape', label:'Escape → JS string literal' },
            { value:'unescape', label:'Unescape → plain text' },
          ]} style={{ width:'100%' }} />
        </div>
        <div>
          <Label>Quote Character</Label>
          <SelectInput value={quote} onChange={setQuote} options={[
            { value:'"', label:'Double quote "' },
            { value:"'", label:"Single quote '" },
          ]} style={{ width:'100%' }} />
        </div>
      </Grid2>
      <div>
        <Label>{mode === 'escape' ? 'Plain Text' : 'JS String Literal'}</Label>
        <Textarea value={input} onChange={setInput} rows={8} mono placeholder={mode === 'escape' ? 'Line 1\nLine 2 with "quotes" and a tab\there' : '"Line 1\\nLine 2 with \\"quotes\\""'} />
      </div>
      <Btn onClick={run} disabled={!input}>{mode === 'escape' ? 'Escape String' : 'Unescape String'}</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'escape' ? 'Escaped Literal' : 'Decoded Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
    </VStack>
  );
}

// JS Unicode Escaper Component
function JsUnicodeEscaper() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('escape');
  const run = () => {
    if (!input) { setOutput(''); return; }
    setOutput(mode === 'escape' ? trEscapeUnicode(input) : trUnescapeUnicode(input));
  };
  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'escape', label:'Escape non-ASCII → \\uXXXX' },
          { value:'unescape', label:'Unescape \\uXXXX → text' },
        ]} />
      </div>
      <div>
        <Label>{mode === 'escape' ? 'Text' : '\\uXXXX Escaped Text'}</Label>
        <Textarea value={input} onChange={setInput} rows={8} mono placeholder={mode === 'escape' ? 'café ☕ 汉字 😀' : 'caf\\u00e9 \\u2615'} />
      </div>
      <Btn onClick={run} disabled={!input}>{mode === 'escape' ? 'Escape Unicode' : 'Unescape Unicode'}</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Output</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={8} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 Printable ASCII is left as-is; only non-ASCII and control characters are converted. Astral chars (emoji) become surrogate pairs.
      </div>
    </VStack>
  );
}

// JS Regex Escaper Component
function JsRegexEscape() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [slash, setSlash] = useState(false);
  const run = () => {
    if (!input) { setOutput(''); return; }
    let out = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (slash) out = out.replace(/\//g, '\\/');
    setOutput(out);
  };
  return (
    <VStack>
      <div>
        <Label>Literal Text to Match</Label>
        <Textarea value={input} onChange={setInput} rows={6} mono placeholder="price: $5.00 (per item)" />
      </div>
      <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
        <input type="checkbox" checked={slash} onChange={e => setSlash(e.target.checked)} />
        <span>Also escape forward slashes (for <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>/regex/</code> literals)</span>
      </label>
      <Btn onClick={run} disabled={!input}>Escape for RegExp</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Escaped Pattern</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={6} mono />
          <div style={{ marginTop:8 }}>
            <Label>Usage</Label>
            <Result>{`new RegExp("${output.replace(/"/g, '\\"')}")`}</Result>
          </div>
        </div>
      )}
    </VStack>
  );
}

// Template Literal to Concat Component
function JsTemplateToConcat() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const run = () => { if (!input.trim()) return; setOutput(trTemplateToConcat(input)); };
  return (
    <VStack>
      <div>
        <Label>JavaScript (with template literals)</Label>
        <Textarea value={input} onChange={setInput} rows={9} mono placeholder={"const msg = `Hello ${name}, you have ${count} messages`;"} />
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Convert to Concatenation</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>String Concatenation</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 Each <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>{'${expr}'}</code> becomes <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>+ (expr) +</code>. Tagged templates and templates inside strings, comments or regex are left untouched.
      </div>
    </VStack>
  );
}

// Ternary to If/Else Component
function JsTernaryToIf() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const run = () => { if (!input.trim()) return; setOutput(trTernaryToIf(input)); };
  return (
    <VStack>
      <div>
        <Label>Ternary Statements (one per line)</Label>
        <Textarea value={input} onChange={setInput} rows={8} mono placeholder={"const max = a > b ? a : b;\nreturn ok ? 200 : 500;\nlabel = active ? 'On' : 'Off';"} />
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Convert to If / Else</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>If / Else Blocks</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={12} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 Handles declaration, assignment and return forms. The <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>??</code> and <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>?.</code> operators are never touched. Nested ternaries expand one level per run.
      </div>
    </VStack>
  );
}

// List to JS Array Component
function JsArrayFromList() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delim, setDelim] = useState('newline');
  const [quote, setQuote] = useState('double');
  const [trim, setTrim] = useState(true);
  const [skipEmpty, setSkipEmpty] = useState(true);
  const [dedupe, setDedupe] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const run = () => {
    if (!input.trim()) return;
    setOutput(trArrayFromList(input, { delim, quote, trim, skipEmpty, dedupe, multiline }));
  };
  const chk = (label, val, set) => (
    <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13 }}>
      <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
  return (
    <VStack>
      <div>
        <Label>List</Label>
        <Textarea value={input} onChange={setInput} rows={7} mono placeholder={"apple\nbanana\ncherry"} />
      </div>
      <Grid2>
        <div>
          <Label>Split By</Label>
          <SelectInput value={delim} onChange={setDelim} options={[
            { value:'newline', label:'New line' },
            { value:'comma', label:'Comma' },
            { value:'whitespace', label:'Whitespace' },
          ]} style={{ width:'100%' }} />
        </div>
        <div>
          <Label>Quotes</Label>
          <SelectInput value={quote} onChange={setQuote} options={[
            { value:'double', label:'Double "..."' },
            { value:'single', label:"Single '...'" },
            { value:'none', label:'None (raw)' },
          ]} style={{ width:'100%' }} />
        </div>
      </Grid2>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        {chk('Trim', trim, setTrim)}
        {chk('Skip empty', skipEmpty, setSkipEmpty)}
        {chk('De-duplicate', dedupe, setDedupe)}
        {chk('Multiline output', multiline, setMultiline)}
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Generate Array</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>JS Array Literal</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={multiline ? 10 : 4} mono />
        </div>
      )}
    </VStack>
  );
}

// JS Variable Name Validator Component
function JsVariableNameValidator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const run = () => {
    if (input === '') { setResult(null); return; }
    setResult(trValidateIdent(input));
  };
  return (
    <VStack>
      <div>
        <Label>Variable Name</Label>
        <Input value={input} onChange={setInput} placeholder="myVariable$1" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
      </div>
      <Btn onClick={run} disabled={input === ''}>Validate Name</Btn>
      {result && (
        result.valid ? (
          <div style={{ padding:16, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, color:C.success }}>
            ✓ <strong>{input}</strong> is a valid JavaScript identifier.
          </div>
        ) : (
          <div>
            <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, color:C.danger, marginBottom:10 }}>
              ✗ <strong>{input || '(empty)'}</strong> is not a valid identifier.
            </div>
            <Label>Issues</Label>
            <Result mono={false}>
              {result.issues.map((iss, i) => (
                <div key={i} style={{ marginBottom:4 }}>• {iss}</div>
              ))}
            </Result>
          </div>
        )
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 A valid name starts with a letter, <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>$</code> or <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>_</code>, uses only letters/digits/<code style={{ fontFamily:"'JetBrains Mono',monospace" }}>$</code>/<code style={{ fontFamily:"'JetBrains Mono',monospace" }}>_</code>, and is not a reserved keyword.
      </div>
    </VStack>
  );
}

// JS Quote Normalizer Component
function JsQuoteNormalizer() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [target, setTarget] = useState('single');
  const run = () => { if (!input.trim()) return; setOutput(trNormalizeQuotes(input, target)); };
  return (
    <VStack>
      <div>
        <Label>Target Quote Style</Label>
        <SelectInput value={target} onChange={setTarget} options={[
          { value:'single', label:"Single quotes '...'" },
          { value:'double', label:'Double quotes "..."' },
        ]} />
      </div>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={9} mono placeholder={'const a = "hello";\nconst b = "say \\"hi\\"";'} />
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Normalize Quotes</Btn>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Normalized Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.1)", border:`1px solid rgba(59,130,246,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        💡 String, comment and regex aware. Backtick template literals are left untouched. The target quote inside a string is escaped automatically.
      </div>
    </VStack>
  );
}

// JSON Key Sorter Component
function JsObjectKeySorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [dir, setDir] = useState('asc');
  const [indent, setIndent] = useState('2');
  const [error, setError] = useState('');
  const run = () => {
    if (!input.trim()) return;
    try { setOutput(trSortObjectKeys(input, dir, indent)); setError(''); }
    catch (err) { setOutput(''); setError('Invalid JSON: ' + err.message); }
  };
  return (
    <VStack>
      <div>
        <Label>JSON</Label>
        <Textarea value={input} onChange={setInput} rows={9} mono placeholder={'{"name":"Ada","age":36,"city":"London"}'} />
      </div>
      <Grid2>
        <div>
          <Label>Direction</Label>
          <SelectInput value={dir} onChange={setDir} options={[
            { value:'asc', label:'Ascending A → Z' },
            { value:'desc', label:'Descending Z → A' },
          ]} style={{ width:'100%' }} />
        </div>
        <div>
          <Label>Indent</Label>
          <SelectInput value={indent} onChange={setIndent} options={[
            { value:'2', label:'2 spaces' },
            { value:'4', label:'4 spaces' },
            { value:'tab', label:'Tab' },
            { value:'min', label:'Minified' },
          ]} style={{ width:'100%' }} />
        </div>
      </Grid2>
      <Btn onClick={run} disabled={!input.trim()}>Sort Keys</Btn>
      {error && (
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, color:C.danger, fontSize:13 }}>{error}</div>
      )}
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Sorted JSON</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
    </VStack>
  );
}

// var to let/const Component
function JsVarToLet() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [count, setCount] = useState(null);
  const [target, setTarget] = useState('let');
  const run = () => {
    if (!input.trim()) return;
    const res = trVarToLet(input, target);
    setOutput(res.code); setCount(res.count);
  };
  return (
    <VStack>
      <div>
        <Label>Replace var with</Label>
        <SelectInput value={target} onChange={setTarget} options={[
          { value:'let', label:'let (safe default)' },
          { value:'const', label:'const' },
        ]} />
      </div>
      <div>
        <Label>JavaScript Code</Label>
        <Textarea value={input} onChange={setInput} rows={9} mono placeholder={'var count = 0;\nvar name = "var in a string is safe";'} />
      </div>
      <Btn onClick={run} disabled={!input.trim()}>Convert var → {target}</Btn>
      {count !== null && (
        <div style={{ fontSize:12, color: count > 0 ? C.success : C.muted }}>
          {count > 0 ? `✓ Replaced ${count} var keyword${count > 1 ? 's' : ''}` : 'No var keywords found'}
        </div>
      )}
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Converted Code</Label>
            <CopyBtn text={output} />
          </div>
          <Textarea value={output} onChange={() => {}} rows={9} mono />
        </div>
      )}
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚠️ Whole-word, string/comment/regex safe. Choosing <code style={{ fontFamily:"'JetBrains Mono',monospace" }}>const</code> may break code that reassigns a variable — review the result.
      </div>
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "js-formatter": JsFormatter,
  "js-minifier": JsMinifier,
  "js-validator": JsValidator,
  "json-to-js": JsonToJs,
  "js-to-json": JsToJson,
  "js-obfuscator": JsObfuscator,
  "es6-to-es5": Es6ToEs5,
  "js-to-typescript": JsToTypescript,
  "regex-tester": RegexTester,
  "js-console-simulator": JsConsoleSimulator,
  "js-console-remover": JsConsoleRemover,
  "js-comment-remover": JsCommentRemover,
  "js-import-sorter": JsImportSorter,
  "cjs-esm-converter": CjsEsmConverter,
  "js-string-escaper": JsStringEscaper,
  "js-unicode-escaper": JsUnicodeEscaper,
  "js-regex-escape": JsRegexEscape,
  "js-template-to-concat": JsTemplateToConcat,
  "js-ternary-to-if": JsTernaryToIf,
  "js-array-from-list": JsArrayFromList,
  "js-variable-name-validator": JsVariableNameValidator,
  "js-quote-normalizer": JsQuoteNormalizer,
  "js-object-key-sorter": JsObjectKeySorter,
  "js-var-to-let": JsVarToLet,
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
          { "@type": "ListItem", "position": 2, "name": "JavaScript Tools", "item": "https://toolsrift.com/js" },
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
    document.title = meta?.title || `${tool?.name} – Free JS Tool | ToolsRift`;
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
    document.title = `${cat?.name || 'Category'} – JS Tools | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.yellow }}>← Back to home</a>
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.yellow; e.currentTarget.style.transform = "translateY(-2px)"; }}
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
    document.title = "Free JavaScript Tools – Format, Minify, Validate JS Online | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search JavaScript tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(234,179,8,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.yellow, textDecoration:"none" }}>{THEME?.name||"JavaScript Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(234,179,8,0.12)", color:C.yellow, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(234,179,8,0.25)" }}>{TOOLS.length} tools</span>
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
        <a href="/" style={{fontSize:12,color:"#EAB308",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftJS() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="js"/>}
    </div>
  );
}

export default ToolsRiftJS;