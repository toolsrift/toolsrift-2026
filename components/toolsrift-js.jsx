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
  // Formatter & Validator
  { id:"js-formatter", cat:"formatter", name:"JavaScript Formatter", desc:"Beautify and format JavaScript code with proper indentation and structure for better readability", icon:"✨", free:true },
  { id:"js-minifier", cat:"formatter", name:"JavaScript Minifier", desc:"Minify JavaScript by removing whitespace, comments, and shortening variable names to reduce file size", icon:"🗜️", free:true },
  { id:"js-validator", cat:"formatter", name:"JavaScript Validator", desc:"Validate JavaScript syntax and find errors with detailed line numbers and error messages", icon:"✅", free:true },
  { id:"json-to-js", cat:"formatter", name:"JSON to JS Object", desc:"Convert JSON data to JavaScript object literal syntax with proper formatting and structure", icon:"📦", free:true },
  { id:"js-to-json", cat:"formatter", name:"JS Object to JSON", desc:"Convert JavaScript object literals to valid JSON format with proper escaping and structure", icon:"📋", free:true },

  // Converters
  { id:"js-obfuscator", cat:"converter", name:"JavaScript Obfuscator", desc:"Basic JavaScript obfuscation with variable renaming and string encoding to protect code", icon:"🔒", free:true },
  { id:"es6-to-es5", cat:"converter", name:"ES6 to ES5 Converter", desc:"Convert modern ES6+ arrow functions and syntax to ES5-compatible JavaScript for legacy browsers", icon:"🔄", free:true },
  { id:"js-to-typescript", cat:"converter", name:"JS to TypeScript", desc:"Add TypeScript type annotations to JavaScript functions for better type safety and IDE support", icon:"📘", free:true },
  { id:"regex-tester", cat:"converter", name:"Regex Tester", desc:"Real-time regular expression tester with match highlighting, groups, and detailed match information", icon:"🔍", free:true },
  { id:"js-console-simulator", cat:"converter", name:"JS Console Simulator", desc:"Simulate JavaScript console.log output for code snippets and preview execution results", icon:"💻", free:true },
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
      
      // Remove single-line comments
      minified = minified.replace(/\/\/.*$/gm, '');
      // Remove multi-line comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
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
      
      // Convert to JS object literal syntax
      const jsString = JSON.stringify(obj, null, 2)
        .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
        .replace(/"/g, "'"); // Change double quotes to single
      
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
    
    // Add return type annotations
    typescript = typescript.replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, 'function $1($2): void {');
    
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
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
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
        <span style={{ width:8, height:8, borderRadius:"50%", background:C.yellow, boxShadow:`0 0 6px ${C.yellow}80`, flexShrink:0 }}/>
        <a href="https://toolsrift.com" style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:C.text, textDecoration:"none", letterSpacing:"-0.01em" }}>ToolsRift</a>
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