import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

// �"����� TOKENS �������������������������������������������������������������������������������������������������������������������������������������"�
const C = {
  bg:"#06090F", surface:"#0D1117", border:"rgba(255,255,255,0.06)",
  amber:"#10B981", amberD:"#059669", text:"#E2E8F0", muted:"#64748B",
  blue:"#10B981", blueD:"#059669", green:"#10B981", purple:"#8B5CF6",
  danger:"#EF4444", teal:"#14B8A6", sky:"#0EA5E9",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(16,185,129,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  textarea{resize:vertical}
  .fade-in{animation:fadeIn .22s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .json-key{color:#60A5FA}
  .json-str{color:#34D399}
  .json-num{color:#FCD34D}
  .json-bool{color:#F59E0B}
  .json-null{color:#94A3B8}
  .tr-nav-cats{display:flex;gap:4px;align-items:center}
  .tr-nav-badge{display:inline-flex}
  @media(max-width:640px){
    .tr-nav-cats{display:none!important}
    .tr-nav-badge{display:none!important}
  }
`;

const T = {
  mono:{ fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label:{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1:{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2:{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// �"����� SHARED UI �������������������������������������������������������������������������������������������������������������������������������"�
function Badge({ children, color="amber" }) {
  const bg={amber:"rgba(245,158,11,0.15)",blue:"rgba(59,130,246,0.15)",green:"rgba(16,185,129,0.15)",red:"rgba(239,68,68,0.15)",purple:"rgba(139,92,246,0.15)",teal:"rgba(20,184,166,0.15)"};
  const fg={amber:"#FCD34D",blue:"#60A5FA",green:"#34D399",red:"#FCA5A5",purple:"#A78BFA",teal:"#2DD4BF"};
  return <span style={{background:bg[color]||bg.amber,color:fg[color]||fg.amber,borderRadius:4,padding:"2px 8px",fontSize:11,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style={} }) {
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,border:"none",cursor:disabled?"not-allowed":"pointer",borderRadius:8,fontWeight:600,transition:"all .15s",fontFamily:"'Plus Jakarta Sans',sans-serif",opacity:disabled?0.5:1};
  const sz={sm:{padding:"6px 14px",fontSize:12},md:{padding:"9px 20px",fontSize:13},lg:{padding:"12px 28px",fontSize:14}}[size];
  const v={
    primary:{background:`linear-gradient(135deg,${C.blue},${C.blueD})`,color:"#000",boxShadow:"0 2px 8px rgba(16,185,129,0.3)"},
    secondary:{background:"rgba(255,255,255,0.05)",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted},
    danger:{background:"rgba(239,68,68,0.15)",color:"#FCA5A5"},
    blue:{background:`linear-gradient(135deg,${C.blue},#059669)`,color:"#fff",boxShadow:"0 2px 8px rgba(16,185,129,0.25)"},
    green:{background:`linear-gradient(135deg,${C.green},#059669)`,color:"#fff",boxShadow:"0 2px 8px rgba(16,185,129,0.25)"},
  }[variant];
  return <button style={{...base,...sz,...v,...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, mono=false }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",color:C.text,fontSize:13,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",...style}}
      onFocus={e=>e.target.style.borderColor=C.amber} onBlur={e=>e.target.style.borderColor=C.border}/>
  );
}

function Textarea({ value, onChange, placeholder, rows=8, mono=true, readOnly=false, style={} }) {
  return (
    <textarea value={value} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly}
      style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 14px",color:C.text,fontSize:13,fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif",outline:"none",lineHeight:1.6,...style}}
      onFocus={e=>!readOnly&&(e.target.style.borderColor=C.amber)} onBlur={e=>e.target.style.borderColor=C.border}/>
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 14px",color:C.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer",...style}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  );
}

function Card({ children, style={} }) {
  return <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:20,...style}}>{children}</div>;
}

function Label({ children }) { return <div style={{...T.label,marginBottom:6}}>{children}</div>; }

function CopyBtn({ text, style={} }) {
  const [copied, setCopied] = useState(false);
  const [err, setErr]       = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text || '').then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800);
    }).catch(() => { setErr(true); setTimeout(() => setErr(false), 2000); });
  };
  return (
    <button onClick={copy} style={{
      background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
      color: err ? '#EF4444' : copied ? '#10B981' : '#94A3B8',
      borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.15s', minHeight: 36,
      fontFamily: "'Plus Jakarta Sans',sans-serif", ...style,
    }}>
      {err ? 'Failed' : copied ? '✓ Copied!' : 'Copy'}
    </button>
  );
}

function VStack({ children, gap=12 }) { return <div style={{display:"flex",flexDirection:"column",gap}}>{children}</div>; }
function Grid2({ children, gap=16 }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap}}>{children}</div>; }
function Grid3({ children }) { return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{children}</div>; }

function StatBox({ value, label, accent=C.amber }) {
  return (
    <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 10px",textAlign:"center"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:accent,wordBreak:"break-all"}}>{value}</div>
      <div style={{fontSize:11,color:C.muted,marginTop:2}}>{label}</div>
    </div>
  );
}

function ModeToggle({ mode, setMode, options }) {
  return (
    <div style={{display:"inline-flex",background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,borderRadius:8,padding:3,gap:2}}>
      {options.map(([v,l])=>(
        <button key={v} onClick={()=>setMode(v)}
          style={{padding:"6px 16px",borderRadius:6,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Plus Jakarta Sans',sans-serif",background:mode===v?`linear-gradient(135deg,${C.amber},${C.amberD})`:"transparent",color:mode===v?"#000":C.muted,transition:"all .15s"}}>
          {l}
        </button>
      ))}
    </div>
  );
}

function ErrorBox({ msg }) {
  if(!msg) return null;
  return <div style={{padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:8,fontSize:13,color:"#FCA5A5",fontFamily:"'JetBrains Mono',monospace"}}>{msg}</div>;
}

function SuccessBox({ msg }) {
  if(!msg) return null;
  return <div style={{padding:"10px 14px",background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:8,fontSize:13,color:"#34D399"}}>{msg}</div>;
}

// �"����� JSON SYNTAX HIGHLIGHTER ���������������������������������������������������������������������������������������������������"�
function highlight(json) {
  if(!json) return "";
  return json
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m=>{
      let cls="json-num";
      if(/^"/.test(m)) cls=/:$/.test(m)?"json-key":"json-str";
      else if(/true|false/.test(m)) cls="json-bool";
      else if(/null/.test(m)) cls="json-null";
      return `<span class="${cls}">${m}</span>`;
    });
}

function JsonEditor({ value, onChange, label, height=320, readOnly=false, showHighlight=false }) {
  const lineCount = value ? value.split("\n").length : 1;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {label && <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><Label>{label}</Label>{value&&<CopyBtn text={value}/>}</div>}
      <div style={{position:"relative",display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`,background:"rgba(0,0,0,0.3)"}}>
        {/* Line numbers */}
        <div style={{minWidth:40,background:"rgba(255,255,255,0.02)",borderRight:`1px solid ${C.border}`,padding:"12px 8px",fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.muted,lineHeight:"1.6",userSelect:"none",overflowY:"hidden",textAlign:"right"}}>
          {Array.from({length:Math.max(lineCount,1)},(_,i)=><div key={i}>{i+1}</div>)}
        </div>
        <textarea
          value={value} onChange={e=>onChange&&onChange(e.target.value)} readOnly={readOnly}
          style={{flex:1,background:"transparent",border:"none",padding:"12px 14px",color:C.text,fontSize:13,fontFamily:"'JetBrains Mono',monospace",outline:"none",lineHeight:"1.6",resize:"none",minHeight:height,maxHeight:height,overflowY:"auto"}}
          onFocus={e=>!readOnly&&(e.target.parentElement.parentElement.style.borderColor=C.amber)}
          onBlur={e=>e.target.parentElement.parentElement.style.borderColor=C.border}
        />
      </div>
    </div>
  );
}

// �"����� ROUTER �������������������������������������������������������������������������������������������������������������������������������������"�
function useAppRouter() {
  const parse=()=>{const h=window.location.hash||"#/";const path=h.replace(/^#/,"")||"/";const parts=path.split("/").filter(Boolean);if(!parts.length)return{page:"home"};if(parts[0]==="tool"&&parts[1])return{page:"tool",toolId:parts[1]};if(parts[0]==="category"&&parts[1])return{page:"home"};return{page:"home"};};
  const[route,setRoute]=useState(parse);
  useEffect(()=>{const fn=()=>setRoute(parse());window.addEventListener("hashchange",fn);return()=>window.removeEventListener("hashchange",fn);},[]);
  useEffect(()=>{const fn=e=>{const a=e.target.closest("a[href]");if(!a)return;const h=a.getAttribute("href");if(h&&h.startsWith("#/")){e.preventDefault();window.location.hash=h;}};document.addEventListener("click",fn);return()=>document.removeEventListener("click",fn);},[]);
  return route;
}

// �"����� SAMPLE JSON ���������������������������������������������������������������������������������������������������������������������������"�
const SAMPLE = `{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "age": 28,
      "active": true,
      "role": "admin",
      "tags": ["react", "nodejs"],
      "address": {
        "city": "San Francisco",
        "country": "USA"
      }
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "age": 34,
      "active": false,
      "role": "editor",
      "tags": ["python", "devops"],
      "address": {
        "city": "New York",
        "country": "USA"
      }
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "version": "2.1.0"
  }
}`;

// �"����� TOOL REGISTRY �����������������������������������������������������������������������������������������������������������������������"�
const TOOLS = [
  {id:"json-formatter",     cat:"format",   name:"JSON Formatter",            desc:"Beautify and format JSON with syntax highlighting",      icon:"✨", free:true},
  {id:"json-minifier",      cat:"format",   name:"JSON Minifier",             desc:"Minify JSON to remove whitespace and reduce file size",  icon:"🧬", free:true},
  {id:"json-validator",     cat:"format",   name:"JSON Validator",            desc:"Validate JSON syntax and get detailed error messages",   icon:"✅", free:true},
  {id:"json-escape",        cat:"format",   name:"JSON String Escape",        desc:"Escape and unescape JSON special characters in strings", icon:"🧬", free:true},
  {id:"json-size",          cat:"format",   name:"JSON Size Analyzer",        desc:"Analyze JSON structure depth, key count, and byte size",  icon:"🧬", free:true},
  {id:"json-to-csv",        cat:"convert",  name:"JSON to CSV",               desc:"Convert JSON arrays to CSV format for spreadsheets",     icon:"🧬", free:true},
  {id:"csv-to-json",        cat:"convert",  name:"CSV to JSON",               desc:"Convert CSV data to structured JSON format",             icon:"🧬", free:true},
  {id:"json-to-xml",        cat:"convert",  name:"JSON to XML",               desc:"Convert JSON objects to well-formed XML documents",      icon:"🧬", free:true},
  {id:"xml-to-json",        cat:"convert",  name:"XML to JSON",               desc:"Parse XML and convert it to clean JSON format",          icon:"🧬", free:true},
  {id:"json-to-yaml",       cat:"convert",  name:"JSON to YAML",              desc:"Convert JSON to YAML format for configs and manifests",  icon:"🧬", free:true},
  {id:"yaml-to-json",       cat:"convert",  name:"YAML to JSON",              desc:"Convert YAML configuration files back to JSON",          icon:"🧬", free:true},
  {id:"json-to-typescript", cat:"convert",  name:"JSON to TypeScript",        desc:"Generate TypeScript interfaces from JSON objects",       icon:"🟦", free:true},
  {id:"json-to-table",      cat:"convert",  name:"JSON to Table",             desc:"Render JSON arrays as an interactive HTML table",        icon:"📄", free:true},
  {id:"json-to-markdown",   cat:"convert",  name:"JSON to Markdown Table",    desc:"Convert JSON arrays to GitHub-flavored Markdown tables", icon:"🧬", free:true},
  {id:"json-to-env",        cat:"convert",  name:"JSON to .env",              desc:"Convert flat JSON objects to .env environment variables", icon:"🧬", free:true},
  {id:"json-diff",          cat:"analyze",  name:"JSON Diff / Comparator",    desc:"Compare two JSON objects and highlight all differences", icon:"🧬", free:true},
  {id:"json-path",          cat:"analyze",  name:"JSONPath Tester",           desc:"Test JSONPath expressions and extract values from JSON",  icon:"🧬", free:true},
  {id:"json-schema",        cat:"analyze",  name:"JSON Schema Validator",     desc:"Validate JSON data against a JSON Schema (draft-7)",     icon:"🧬", free:true},
  {id:"json-sorter",        cat:"analyze",  name:"JSON Key Sorter",           desc:"Sort all JSON object keys alphabetically (deep)",        icon:"🧬", free:true},
  {id:"json-flatten",       cat:"analyze",  name:"JSON Flattener",            desc:"Flatten nested JSON into a single-level dot-notation object", icon:"🧬", free:true},
  {id:"json-unflatten",     cat:"analyze",  name:"JSON Unflattener",          desc:"Expand flat dot-notation JSON back to nested structure", icon:"🧬", free:true},
  {id:"json-keys",          cat:"analyze",  name:"JSON Key Extractor",        desc:"Extract all keys, paths, and values from a JSON object", icon:"🧬", free:true},
  {id:"json-merger",        cat:"analyze",  name:"JSON Merger",               desc:"Deep merge two JSON objects with conflict resolution",   icon:"🧬", free:true},
  {id:"json-array-tools",   cat:"analyze",  name:"JSON Array Tools",          desc:"Filter, sort, map and paginate JSON arrays interactively", icon:"🧬", free:true},
  {id:"json-query",         cat:"analyze",  name:"JSON Query / Filter",       desc:"Filter and transform JSON arrays with field conditions",  icon:"🧬", free:true},
  {id:"json-repair",        cat:"format",   name:"JSON Repair",               desc:"Fix broken JSON — trailing commas, single quotes, unquoted keys, comments", icon:"🔧", free:true},
  {id:"jsonl-converter",    cat:"convert",  name:"JSON ⇄ JSONL Converter",    desc:"Convert a JSON array to JSONL/NDJSON and back, line by line",  icon:"📑", free:true},
  {id:"json-to-go",         cat:"convert",  name:"JSON to Go Struct",         desc:"Generate a Go struct with json tags from a JSON sample",  icon:"🐹", free:true},
  {id:"json-to-python",     cat:"convert",  name:"JSON to Python TypedDict",  desc:"Generate a Python TypedDict class from a JSON sample",    icon:"🐍", free:true},
  {id:"json-to-sql",        cat:"convert",  name:"JSON to SQL INSERT",        desc:"Generate SQL INSERT statements from a JSON array of objects", icon:"🗄️", free:true},
];

const CATEGORIES = [
  {id:"format",  name:"Format & Validate", icon:"✨", desc:"Format, minify, validate and escape JSON"},
  {id:"convert", name:"Convert",           icon:"🧬", desc:"Convert JSON to CSV, XML, YAML, TypeScript and more"},
  {id:"analyze", name:"Analyze & Transform",icon:"🧬", desc:"Diff, query, sort, flatten and merge JSON"},
];

const TOOL_META = {
  "json-formatter":     {title:"JSON Formatter & Beautifier — Pretty Print JSON Online", desc:"Format and beautify JSON with syntax highlighting, line numbers, and indentation control. Instant validation included.", faq:[["What indentation should I use?","2 or 4 spaces is standard. Tab indentation is preferred by some style guides like Google's."],["Does it validate while formatting?","Yes — invalid JSON triggers an error before formatting is attempted."],["Can I format minified JSON?","Yes — paste minified JSON and it will be expanded and formatted instantly."]]},
  "json-minifier":      {title:"JSON Minifier — Compress and Minify JSON Online",        desc:"Minify JSON by stripping all whitespace. Reduces JSON payload size for API responses and storage.", faq:[["How much does minification reduce size?","Typically 20–40%. Deeply indented JSON with long keys benefits the most."],["Is minified JSON still valid?","Yes — whitespace is not meaningful in JSON. Minified JSON is fully spec-compliant."],["Should I minify production API responses?","Yes — always minify JSON in production APIs to reduce bandwidth."]]},
  "json-validator":     {title:"JSON Validator — Validate JSON Syntax Online",           desc:"Validate JSON files and strings. Get line-accurate error messages for syntax issues.", faq:[["What makes JSON invalid?","Trailing commas, single quotes instead of double quotes, unquoted keys, and comments all make JSON invalid."],["Does it check JSON Schema?","No — this tool checks JSON syntax only. Use the JSON Schema Validator for structure validation."],["Why is my JSON failing?","Common causes: trailing commas after the last item, missing quotes around keys, or using undefined/NaN."]]},
  "json-to-csv":        {title:"JSON to CSV Converter — Convert JSON Arrays to CSV",     desc:"Convert JSON arrays to CSV format. Handles nested objects, arrays, and custom column selection.", faq:[["What JSON structure works best?","An array of objects with the same keys. Nested objects are flattened to dot-notation columns."],["Can I choose which columns to export?","Yes — select specific keys to include or exclude from the CSV output."],["Is the CSV Excel-compatible?","Yes — the output uses standard comma delimiter and quoted fields for full Excel compatibility."]]},
  "json-diff":          {title:"JSON Diff Tool — Compare Two JSON Objects Online",       desc:"Compare two JSON objects side-by-side and visualize additions, deletions, and changes.", faq:[["What types of differences are shown?","Added keys (green), removed keys (red), and changed values (yellow) are all highlighted."],["Does it handle nested objects?","Yes — the diff is recursive and shows differences at any nesting level."],["Can I compare JSON arrays?","Yes — array element differences are shown with index-based tracking."]]},
  "json-path":          {title:"JSONPath Tester — Test JSONPath Expressions Online",     desc:"Test JSONPath expressions against JSON data. Supports standard JSONPath syntax including wildcards and filters.", faq:[["What is JSONPath?","JSONPath is a query language for JSON, similar to XPath for XML. Developed by Stefan Goessner."],["What is the root symbol?","$ represents the root of the JSON document. $.users[0].name gets the first user's name."],["What are common JSONPath operators?","$ (root), . (child), [] (subscript), * (wildcard), [?(@.prop)] (filter), .. (recursive descent)"]]},
  "json-to-typescript": {title:"JSON to TypeScript Interface Generator",                 desc:"Automatically generate TypeScript interface definitions from JSON objects. Handles nested types and arrays.", faq:[["Can it handle nested objects?","Yes — nested objects become nested interfaces or inline types automatically."],["What about arrays?","Arrays of objects generate typed array signatures like UserItem[]."],["Does it handle optional fields?","Fields are marked as required by default. Manually add ? for optional fields."]]},
  "json-repair":        {title:"JSON Repair — Fix Broken & Malformed JSON Online",       desc:"Paste broken JSON and get valid, strict JSON back. Fixes trailing commas, single quotes, unquoted keys, and comments using JSON5.", faq:[["What can it fix?","Trailing commas, single-quoted strings, unquoted object keys, comments, and other JSON5-tolerated syntax are all repaired into strict JSON."],["How does it work?","Your input is parsed with the JSON5 parser (which is lenient) and re-serialized with strict JSON.stringify, producing valid JSON."],["Why can't some JSON be repaired?","If the input is too broken for even the lenient JSON5 parser (e.g. missing brackets or mismatched quotes), it reports the parse error instead of guessing."]]},
  "jsonl-converter":    {title:"JSON to JSONL / NDJSON Converter (Both Ways)",           desc:"Convert a JSON array to JSONL (newline-delimited JSON) and back. One compact object per line, with per-line error reporting.", faq:[["What is JSONL / NDJSON?","JSONL (also called NDJSON) is newline-delimited JSON — one complete JSON value per line. It is used for streaming, logs, and big-data pipelines."],["Does it validate each line?","Yes — when converting JSONL back to an array, every non-empty line is parsed and the exact line number of any failure is reported."],["Does the array need to be objects?","No — any JSON array works. Each element becomes one line, whether it is an object, number, string, or nested array."]]},
  "json-to-go":         {title:"JSON to Go Struct Generator — Struct with json Tags",     desc:"Generate a Go struct from a JSON sample, with PascalCase fields and json tags. Nested objects become nested struct types.", faq:[["What types does it infer?","string→string, whole numbers→int, decimals→float64, true/false→bool, null→interface{}, arrays→[]T, and objects→nested structs."],["Is the output ready to compile?","It is a strong starting point. Review numeric widths, optional fields, and pointer usage — inference is intentionally conservative."],["How are nested objects handled?","Each nested object gets its own named struct type, referenced by field, with matching json tags for the original keys."]]},
  "json-to-python":     {title:"JSON to Python TypedDict Generator",                     desc:"Generate a Python TypedDict from a JSON sample. Nested objects become nested TypedDicts, with functional syntax for non-identifier keys.", faq:[["Why TypedDict instead of dataclass?","TypedDict describes dictionary shapes exactly as JSON decodes them, so it matches json.loads output without conversion."],["What about keys that aren't valid identifiers?","Keys like 'first-name' use the functional TypedDict(...) syntax so any string key is supported."],["Is the output final?","Treat it as a starting point — verify Optional fields and numeric types, since they are inferred from a single sample."]]},
  "json-to-sql":        {title:"JSON to SQL INSERT Generator — Convert JSON to SQL",     desc:"Convert a JSON array of objects into ready-to-run SQL INSERT statements. Escapes quotes, handles NULL, numbers, booleans and nested values.", faq:[["What JSON shape is expected?","An array of objects, e.g. [{\"id\":1,\"name\":\"Al\"}]. A single object is wrapped into a one-row insert automatically."],["How are values escaped?","Strings are single-quoted with embedded quotes doubled ('' ), numbers and booleans are written literally, null becomes NULL, and nested objects/arrays are stored as JSON strings."],["Can I change the table name?","Yes — set the table name field and the tool regenerates every INSERT statement instantly."]]},
  "json-escape":        {title:"JSON String Escape & Unescape — Free Online Tool", desc:"Escape text into a safe JSON string or unescape a JSON string back to raw text. Handles quotes, backslashes, newlines and Unicode.", keywords:"json escape, json unescape, escape json string", howTo:"Pick escape or unescape, paste your text, and the converted string appears instantly ready to drop into JSON or read back out.", faq:[["Which characters get escaped?","Double quotes, backslashes, newlines, tabs and other control characters are converted to their escaped forms so the result is valid inside a JSON string."],["When do I need to escape JSON?","When embedding arbitrary text inside a JSON string value, especially content that contains quotes or line breaks."],["Does it handle Unicode?","Yes — it can escape non-ASCII characters to Unicode escape sequences and unescape them back to the original characters."]]},
  "json-size":          {title:"JSON Size Analyzer — Depth, Keys & Byte Size Online", desc:"Analyze a JSON document's byte size, nesting depth, key count and value types. Understand payload weight before you ship it.", keywords:"json size analyzer, json depth, json byte size", howTo:"Paste your JSON and the analyzer reports total bytes, number of keys, maximum nesting depth and a breakdown of value types.", faq:[["What does it measure?","Total byte size, key and value counts, maximum nesting depth and the mix of strings, numbers, arrays and objects."],["Why does JSON size matter?","Smaller payloads load faster and cost less bandwidth. Knowing the size helps you decide whether to minify or restructure."],["Is byte size the same as string length?","Not always — multi-byte UTF-8 characters take more than one byte, so the analyzer measures true encoded size."]]},
  "csv-to-json":        {title:"CSV to JSON Converter — Convert CSV to JSON Online", desc:"Convert CSV data into structured JSON. Uses the header row as keys and handles quoted fields, commas and custom delimiters.", keywords:"csv to json, convert csv, csv parser online", howTo:"Paste your CSV, confirm the delimiter, and each row becomes a JSON object keyed by the header columns, ready to copy.", faq:[["How are columns mapped?","The first row is treated as headers and becomes the object keys; every following row becomes one JSON object."],["Does it handle quoted values?","Yes — fields wrapped in double quotes may contain commas and line breaks, which are parsed correctly."],["Can I use a different delimiter?","Yes — semicolon or tab-separated files are supported by choosing the matching delimiter."]]},
  "json-to-xml":        {title:"JSON to XML Converter — Convert JSON to XML Online", desc:"Convert JSON objects into well-formed XML documents. Keys become elements, arrays repeat and nested objects nest naturally.", keywords:"json to xml, convert json to xml, json xml converter", howTo:"Paste your JSON and it is transformed into indented, well-formed XML you can copy straight into configs or SOAP payloads.", faq:[["How are arrays represented?","Each array item becomes a repeated element with the same tag name, which is the standard XML way to express lists."],["What about a root element?","A single root element wraps the document so the output is well-formed XML with exactly one top-level node."],["Are special characters escaped?","Yes — characters like <, > and & are escaped to their XML entities so the result stays valid."]]},
  "xml-to-json":        {title:"XML to JSON Converter — Parse XML to JSON Online", desc:"Parse XML and convert it into clean, readable JSON. Elements become keys, attributes are preserved and repeated tags become arrays.", keywords:"xml to json, convert xml, parse xml online", howTo:"Paste your XML and the parser produces structured JSON, turning elements into keys and repeated tags into arrays automatically.", faq:[["How are attributes handled?","Element attributes are preserved in the JSON output, typically under a dedicated key so no information is lost."],["What happens to repeated tags?","Repeated sibling elements with the same name are collected into a JSON array to reflect the list structure."],["Does it validate the XML?","The input must be well-formed XML; malformed markup produces a parse error pointing to the problem."]]},
  "json-to-yaml":       {title:"JSON to YAML Converter — Convert JSON to YAML Online", desc:"Convert JSON to clean YAML for configs, CI pipelines and Kubernetes manifests. Preserves nesting, arrays and data types.", keywords:"json to yaml, convert json to yaml, yaml converter", howTo:"Paste your JSON and it is rewritten as neatly indented YAML you can copy into config files or manifests.", faq:[["Why convert JSON to YAML?","YAML is more human-readable for configuration and is the format used by Docker Compose, Kubernetes and many CI systems."],["Are data types preserved?","Yes — numbers, booleans, null and nested structures are represented with correct YAML syntax."],["How is indentation handled?","Nested objects and arrays are indented with spaces following YAML conventions, since YAML does not allow tabs."]]},
  "yaml-to-json":       {title:"YAML to JSON Converter — Convert YAML to JSON Online", desc:"Convert YAML configuration back into JSON. Handles nested maps, lists, scalars and multi-document YAML input.", keywords:"yaml to json, convert yaml, yaml parser online", howTo:"Paste your YAML and it is parsed into equivalent JSON instantly, ready to copy for APIs or tooling that expects JSON.", faq:[["What YAML features are supported?","Nested maps, lists, scalars, booleans and null are converted to their JSON equivalents."],["Can it read Docker or Kubernetes files?","Yes — typical Compose and Kubernetes YAML converts cleanly to JSON for inspection or tooling."],["What if my YAML is invalid?","A parse error is shown describing the issue so you can fix the indentation or syntax."]]},
  "json-to-table":      {title:"JSON to Table — Render JSON Arrays as HTML Tables", desc:"Turn a JSON array of objects into a clean, sortable HTML table. Great for inspecting API responses and datasets at a glance.", keywords:"json to table, json table viewer, json array to html", howTo:"Paste a JSON array of objects and it renders as a table with a column per key, so you can scan the data instantly.", faq:[["What JSON works best?","An array of objects that share keys — each object becomes a row and each key becomes a column."],["What about nested values?","Nested objects and arrays are shown inline within their cell so the table stays readable."],["Can I copy the table?","Yes — the rendered table can be copied into spreadsheets or documents that accept HTML tables."]]},
  "json-to-markdown":   {title:"JSON to Markdown Table Converter — Online Tool", desc:"Convert a JSON array of objects into a GitHub-flavored Markdown table. Perfect for READMEs, docs and pull-request descriptions.", keywords:"json to markdown, markdown table generator, json to md", howTo:"Paste a JSON array and copy the generated Markdown table, complete with header row and alignment separators.", faq:[["What Markdown flavor is produced?","GitHub-flavored Markdown tables using pipe separators and a header divider row that renders on GitHub and most docs sites."],["What structure is required?","An array of objects with shared keys; the keys become the table header and each object becomes a row."],["How are missing keys handled?","Objects missing a key get an empty cell so every row stays aligned with the header columns."]]},
  "json-to-env":        {title:"JSON to .env Converter — Generate Environment Variables", desc:"Convert a flat JSON object into .env environment variable lines. Keys become variable names and values are quoted when needed.", keywords:"json to env, dotenv generator, json environment variables", howTo:"Paste a flat JSON object and copy the resulting KEY=value lines straight into your .env file.", faq:[["How are keys converted?","Each top-level key becomes an environment variable name, typically upper-cased with dots or dashes turned into underscores."],["Are values quoted?","Values containing spaces or special characters are wrapped in quotes so the .env line parses correctly."],["What about nested objects?","Flatten nested JSON first — .env files are flat key-value pairs and cannot represent nested structures directly."]]},
  "json-schema":        {title:"JSON Schema Validator — Validate Against Draft-7 Online", desc:"Validate JSON data against a JSON Schema (draft-7). Get precise, path-level error messages for every constraint that fails.", keywords:"json schema validator, draft-7 schema, validate json schema", howTo:"Paste your schema and your data in the two panels; the validator reports whether the data conforms and lists each violation.", faq:[["Which schema draft is supported?","JSON Schema draft-7, the most widely adopted version for validating types, required fields and value constraints."],["What errors does it report?","Each failing keyword — such as type, required, minimum or pattern — is reported with the JSON path where it occurred."],["Is my data uploaded?","No — validation runs entirely in your browser, so both the schema and the data stay on your device."]]},
  "json-sorter":        {title:"JSON Key Sorter — Alphabetically Sort JSON Keys Online", desc:"Sort all object keys in a JSON document alphabetically, recursively at every level. Produces stable, diff-friendly JSON.", keywords:"json key sorter, sort json keys, alphabetize json", howTo:"Paste your JSON and the tool returns the same data with every object's keys sorted alphabetically at all nesting levels.", faq:[["Why sort JSON keys?","Consistent key order makes JSON easier to read and produces clean, minimal diffs in version control."],["Does it sort nested objects too?","Yes — the sort is recursive, so keys inside nested objects and array elements are ordered as well."],["Are array orders changed?","No — only object keys are reordered. Array element order is preserved because it is meaningful."]]},
  "json-flatten":       {title:"JSON Flattener — Flatten Nested JSON to Dot Notation", desc:"Flatten deeply nested JSON into a single-level object using dot-notation keys. Ideal for configs, spreadsheets and diffing.", keywords:"json flatten, flatten nested json, dot notation json", howTo:"Paste nested JSON and it is collapsed into one flat object where each key is the full dot-notation path to its value.", faq:[["What does flattening produce?","A single-level object whose keys are paths like user.address.city, each mapping to the original leaf value."],["How are arrays flattened?","Array items use bracket or dotted index notation, such as items.0.name, so every element remains addressable."],["Can I reverse it?","Yes — use the JSON Unflattener to expand dot-notation keys back into nested objects."]]},
  "json-unflatten":     {title:"JSON Unflattener — Expand Dot-Notation JSON Online", desc:"Expand a flat dot-notation JSON object back into a fully nested structure. The exact inverse of flattening.", keywords:"json unflatten, expand json, dot notation to nested", howTo:"Paste a flat object with dot-notation keys and it is rebuilt into the nested JSON structure those paths describe.", faq:[["What input does it expect?","A flat object whose keys are paths like user.address.city; these are expanded into nested objects."],["How are array indexes handled?","Numeric path segments such as items.0 are rebuilt as array elements in the correct positions."],["Is this the opposite of flattening?","Yes — unflattening reverses the JSON Flattener, turning dot-notation keys back into nested structure."]]},
  "json-keys":          {title:"JSON Key Extractor — List All Keys, Paths & Values", desc:"Extract every key, full path and value from a JSON document. See the complete structure of large or unfamiliar JSON at a glance.", keywords:"json key extractor, list json keys, json paths", howTo:"Paste your JSON and the tool lists all keys with their dot-notation paths and values, so you can map the structure quickly.", faq:[["What does it extract?","Every key in the document along with its full path and the value stored there, including nested objects and arrays."],["Why extract keys?","To understand the shape of large or unfamiliar JSON, build schemas, or find where a particular field lives."],["Are duplicate keys shown?","Keys that repeat under different paths are each listed with their own unique path so nothing is hidden."]]},
  "json-merger":        {title:"JSON Merger — Deep Merge Two JSON Objects Online", desc:"Deep merge two JSON objects with configurable conflict resolution. Combine configs and defaults with overrides in one step.", keywords:"json merger, deep merge json, combine json objects", howTo:"Paste two JSON objects and the merger deep-combines them, letting the second override the first where keys collide.", faq:[["How does a deep merge work?","Nested objects are merged recursively rather than replaced, so only the specific keys that overlap are combined or overridden."],["Which object wins on conflicts?","By default the second object overrides the first for conflicting keys, ideal for applying overrides on top of defaults."],["How are arrays merged?","Arrays are typically replaced rather than concatenated, since merging list items by position is often ambiguous."]]},
  "json-array-tools":   {title:"JSON Array Tools — Filter, Sort, Map & Paginate Online", desc:"Filter, sort, map and paginate JSON arrays interactively. Reshape arrays of objects without writing any code.", keywords:"json array tools, filter json array, sort json array", howTo:"Paste a JSON array of objects, then apply filter, sort, map and pagination controls to transform it and copy the result.", faq:[["What operations are available?","Filtering by field conditions, sorting by any key, mapping to selected fields, and paginating into pages of a chosen size."],["Do transformations stack?","Yes — you can filter, then sort, then paginate, and the operations apply in sequence to the array."],["Is the original data changed?","No — transformations are non-destructive; your pasted array stays intact and only the output view changes."]]},
  "json-query":         {title:"JSON Query & Filter — Filter JSON Arrays by Field", desc:"Filter and transform JSON arrays with simple field conditions. Extract just the records and fields you need, instantly.", keywords:"json query, filter json, json where clause", howTo:"Paste a JSON array and define field conditions; matching objects are returned so you can copy just the data you want.", faq:[["How do conditions work?","You specify a field and a comparison — such as equals, contains or greater-than — and only matching objects are kept."],["Can I combine conditions?","Yes — multiple field conditions can be applied together to narrow the results to exactly what you need."],["Does it change the source JSON?","No — filtering produces a new result set while leaving your original array untouched."]]},
};

// �"����� YAML HELPERS �������������������������������������������������������������������������������������������������������������������������"�
function jsonToYaml(obj, indent=0) {
  const pad = "  ".repeat(indent);
  if(obj===null) return "null";
  if(typeof obj==="boolean") return obj?"true":"false";
  if(typeof obj==="number") return String(obj);
  if(typeof obj==="string") {
    if(/[\n:"#{}[\],&*?|<>=!%@`]/.test(obj)||obj.trim()!==obj||obj==="") return JSON.stringify(obj);
    return obj;
  }
  if(Array.isArray(obj)) {
    if(obj.length===0) return "[]";
    return obj.map(v=>{
      const val=jsonToYaml(v,indent+1);
      if(typeof v==="object"&&v!==null&&!Array.isArray(v)) return `${pad}-\n${val}`;
      return `${pad}- ${val}`;
    }).join("\n");
  }
  const entries=Object.entries(obj);
  if(entries.length===0) return "{}";
  return entries.map(([k,v])=>{
    const key=/[^a-zA-Z0-9_-]/.test(k)?JSON.stringify(k):k;
    if(typeof v==="object"&&v!==null&&!Array.isArray(v)&&Object.keys(v).length>0)
      return `${pad}${key}:\n${jsonToYaml(v,indent+1)}`;
    if(Array.isArray(v)&&v.length>0&&typeof v[0]==="object")
      return `${pad}${key}:\n${jsonToYaml(v,indent+1)}`;
    return `${pad}${key}: ${jsonToYaml(v,indent)}`;
  }).join("\n");
}

function yamlToJson(yaml) {
  // Basic YAML parser for common cases
  const lines = yaml.split("\n");
  function parseValue(s) {
    s = s.trim();
    if(s==="null"||s==="~") return null;
    if(s==="true") return true;
    if(s==="false") return false;
    if(s==="[]") return [];
    if(s==="{}") return {};
    if(/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
    if((s.startsWith('"')&&s.endsWith('"'))||(s.startsWith("'")&&s.endsWith("'"))) return s.slice(1,-1);
    return s;
  }
  // Fall back to JSON.parse if it looks like JSON
  const trimmed = yaml.trim();
  if(trimmed.startsWith("{") || trimmed.startsWith("[")) return JSON.parse(trimmed);
  
  function parseBlock(lines, baseIndent) {
    const result = {};
    let i = 0;
    while(i < lines.length) {
      const line = lines[i];
      if(!line.trim() || line.trim().startsWith("#")) { i++; continue; }
      const indent = line.search(/\S/);
      if(indent < baseIndent) break;
      
      const listMatch = line.match(/^(\s*)- (.*)$/);
      if(listMatch) {
        const arr = [];
        while(i < lines.length) {
          const lm = lines[i].match(/^(\s*)- (.*)$/);
          if(!lm || lm[1].length !== baseIndent) break;
          const val = lm[2].trim();
          if(!val) {
            // Block item
            const subLines = [];
            i++;
            while(i<lines.length && (lines[i].search(/\S/)>baseIndent||!lines[i].trim())) {
              subLines.push(lines[i].slice(baseIndent+2));
              i++;
            }
            arr.push(parseBlock(subLines, 0));
          } else if(val.endsWith(":")) {
            const subLines = [lines[i].slice(baseIndent)];
            i++;
            while(i<lines.length && lines[i].search(/\S/)>baseIndent) { subLines.push(lines[i].slice(baseIndent)); i++; }
            const sub = parseBlock(subLines, 0);
            arr.push(sub);
          } else {
            arr.push(parseValue(val));
            i++;
          }
        }
        return arr;
      }
      
      const kvMatch = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if(kvMatch && kvMatch[1].length === baseIndent) {
        const key = kvMatch[2].trim().replace(/^["']|["']$/g,"");
        const rawVal = kvMatch[3].trim();
        i++;
        if(!rawVal) {
          // Collect child lines
          const childLines = [];
          while(i<lines.length&&(lines[i].search(/\S/)>baseIndent||!lines[i].trim())) {
            childLines.push(lines[i].slice(baseIndent+2));
            i++;
          }
          result[key] = parseBlock(childLines, 0);
        } else {
          result[key] = parseValue(rawVal);
        }
      } else { i++; }
    }
    return result;
  }
  return parseBlock(lines, 0);
}

// �"����� FLATTEN / UNFLATTEN �����������������������������������������������������������������������������������������������������������"�
function flattenJson(obj, prefix="", sep=".") {
  const out = {};
  function recurse(val, pre) {
    if(val===null||typeof val!=="object"){ out[pre]=val; return; }
    if(Array.isArray(val)) { val.forEach((v,i)=>recurse(v,pre?`${pre}[${i}]`:`[${i}]`)); return; }
    Object.entries(val).forEach(([k,v])=>recurse(v,pre?`${pre}${sep}${k}`:k));
  }
  recurse(obj, prefix);
  return out;
}

function unflattenJson(flat, sep=".") {
  const out = {};
  for(const [key,val] of Object.entries(flat)) {
    const parts = key.split(sep);
    let cur = out;
    parts.forEach((p,i)=>{
      if(i===parts.length-1) { cur[p]=val; }
      else { if(!(p in cur)) cur[p]={}; cur=cur[p]; }
    });
  }
  return out;
}

// �"����� TYPESCRIPT GENERATOR ���������������������������������������������������������������������������������������������������������"�
function inferType(val, name="Root", depth=0) {
  if(val===null) return "null";
  if(typeof val==="boolean") return "boolean";
  if(typeof val==="number") return Number.isInteger(val)?"number":"number";
  if(typeof val==="string") return "string";
  if(Array.isArray(val)) {
    if(val.length===0) return "unknown[]";
    const itemType=inferType(val[0],name+"Item",depth);
    if(typeof val[0]==="object"&&val[0]!==null&&!Array.isArray(val[0])) {
      return `${pascalCase(name)}Item[]`;
    }
    return `${itemType}[]`;
  }
  return pascalCase(name);
}
function pascalCase(s) { return s.replace(/(^|[^a-zA-Z])([a-zA-Z])/g,(_,p,c)=>p+c.toUpperCase()).replace(/[^a-zA-Z0-9]/g,""); }

function generateInterface(obj, name="Root", depth=0) {
  if(typeof obj!=="object"||obj===null||Array.isArray(obj)) return "";
  const pad="  ".repeat(depth);
  const nested=[];
  const fields=Object.entries(obj).map(([k,v])=>{
    let type;
    if(v===null) type="null";
    else if(typeof v==="boolean") type="boolean";
    else if(typeof v==="number") type="number";
    else if(typeof v==="string") type="string";
    else if(Array.isArray(v)) {
      if(v.length===0) type="unknown[]";
      else if(typeof v[0]==="object"&&v[0]!==null&&!Array.isArray(v[0])) {
        const childName=pascalCase(k)+"Item";
        nested.push(generateInterface(v[0],childName,depth));
        type=`${childName}[]`;
      } else { type=`${inferType(v[0])}[]`; }
    } else {
      const childName=pascalCase(k);
      nested.push(generateInterface(v,childName,depth));
      type=childName;
    }
    return `${pad}  ${k}: ${type};`;
  });
  const iface=`${pad}interface ${pascalCase(name)} {\n${fields.join("\n")}\n${pad}}`;
  return [...nested,iface].filter(Boolean).join("\n\n");
}

// �"����� XML HELPERS ���������������������������������������������������������������������������������������������������������������������������"�
function jsonToXml(obj, name="root", depth=0) {
  const pad="  ".repeat(depth);
  if(obj===null) return `${pad}<${name} xsi:nil="true"/>`;
  if(typeof obj!=="object") {
    const escaped=String(obj).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    return `${pad}<${name}>${escaped}</${name}>`;
  }
  if(Array.isArray(obj)) {
    return obj.map((v,i)=>jsonToXml(v,name,depth)).join("\n");
  }
  const children=Object.entries(obj).map(([k,v])=>{
    const tag=k.replace(/[^a-zA-Z0-9_.-]/g,"_");
    if(Array.isArray(v)) return v.map(item=>jsonToXml(item,tag,depth+1)).join("\n");
    return jsonToXml(v,tag,depth+1);
  }).join("\n");
  return `${pad}<${name}>\n${children}\n${pad}</${name}>`;
}

function xmlToJson(xmlStr) {
  const parser=new DOMParser();
  const doc=parser.parseFromString(xmlStr,"text/xml");
  function nodeToObj(node) {
    if(node.nodeType===3) return node.nodeValue.trim();
    const obj={};
    for(const child of node.childNodes) {
      if(child.nodeType===3) {
        const v=child.nodeValue.trim();
        if(v) return v;
        continue;
      }
      const k=child.nodeName;
      const v=nodeToObj(child);
      if(k in obj) {
        if(!Array.isArray(obj[k])) obj[k]=[obj[k]];
        obj[k].push(v);
      } else obj[k]=v;
    }
    return obj;
  }
  return nodeToObj(doc.documentElement);
}

// �"����� JSON PATH �������������������������������������������������������������������������������������������������������������������������������"�
function jsonPath(obj, path) {
  if(path==="$") return [obj];
  const p=path.replace(/^\$/,"");
  function query(cur, tokens) {
    if(tokens.length===0) return [cur];
    const [tok,...rest]=tokens;
    if(tok==="*") {
      if(Array.isArray(cur)) return cur.flatMap(v=>query(v,rest));
      if(typeof cur==="object"&&cur) return Object.values(cur).flatMap(v=>query(v,rest));
      return [];
    }
    if(tok.startsWith("[?(@.")) {
      const m=tok.match(/\[\?\(@\.([^\s]+)\s*(==|!=|>|<|>=|<=)\s*(.+)\)\]/);
      if(!m) return [];
      const[,field,op,rhs]=m;
      const rhsVal=JSON.parse(rhs);
      const arr=Array.isArray(cur)?cur:[];
      const filtered=arr.filter(item=>{
        const v=item[field];
        if(op==="==") return v==rhsVal;
        if(op==="!=") return v!=rhsVal;
        if(op===">") return v>rhsVal;
        if(op==="<") return v<rhsVal;
        if(op===">=") return v>=rhsVal;
        if(op==="<=") return v<=rhsVal;
        return false;
      });
      return filtered.flatMap(v=>query(v,rest));
    }
    const arrIdx=tok.match(/^\[(\d+)\]$/);
    if(arrIdx) {
      const idx=parseInt(arrIdx[1]);
      if(Array.isArray(cur)&&idx<cur.length) return query(cur[idx],rest);
      return [];
    }
    const key=tok.replace(/^\.|^\["|"\]$/g,"").replace(/^\./, "");
    if(cur&&typeof cur==="object"&&key in cur) return query(cur[key],rest);
    return [];
  }
  const tokens=p.split(/(?=\.|\[)/).map(t=>t.replace(/^\./,"")).filter(Boolean);
  return query(obj,tokens);
}

// �"����� TOOL COMPONENTS �����������������������������������������������������������������������������������������������������������������"�

function JsonFormatter() {
  const [input,setInput]=useState(SAMPLE);
  const [indent,setIndent]=useState("2");
  const [sortKeys,setSortKeys]=useState(false);
  const [error,setError]=useState("");
  const [output,setOutput]=useState("");

  useEffect(()=>{
    if(!input.trim()){setOutput("");setError("");return;}
    try{
      let parsed=JSON.parse(input);
      if(sortKeys) parsed=deepSortKeys(parsed);
      setOutput(JSON.stringify(parsed,null,parseInt(indent)||2));
      setError("");
    }catch(e){setError(e.message);setOutput("");}
  },[input,indent,sortKeys]);

  function deepSortKeys(obj) {
    if(Array.isArray(obj)) return obj.map(deepSortKeys);
    if(typeof obj==="object"&&obj) return Object.fromEntries(Object.keys(obj).sort().map(k=>[k,deepSortKeys(obj[k])]));
    return obj;
  }

  const stats = useMemo(()=>{
    if(!output) return null;
    try{
      const p=JSON.parse(output);
      const keys=(s=>s.match(/"[^"]+"\s*:/g)||[])(output).length;
      return{keys,chars:output.length,minified:JSON.stringify(p).length};
    }catch{return null;}
  },[output]);

  return (
    <VStack>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Label>Indent:</Label>
          {["2","4","tab"].map(v=><Btn key={v} variant={indent===v?"primary":"secondary"} size="sm" onClick={()=>setIndent(v)}>{v==="tab"?"Tab":v+" spaces"}</Btn>)}
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}>
          <input type="checkbox" checked={sortKeys} onChange={e=>setSortKeys(e.target.checked)}/> Sort keys
        </label>
        <Btn variant="secondary" size="sm" onClick={()=>setInput(SAMPLE)}>Load sample</Btn>
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={340}/>
        <JsonEditor value={output} onChange={()=>{}} label="Formatted JSON" height={340} readOnly/>
      </Grid2>
      {stats&&<Grid3><StatBox value={stats.keys} label="Keys"/><StatBox value={`${stats.chars} B`} label="Formatted"/><StatBox value={`${stats.minified} B`} label="Minified"/></Grid3>}
    </VStack>
  );
}

function JsonMinifier() {
  const [input,setInput]=useState("");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{setError("");return JSON.stringify(JSON.parse(input));}
    catch(e){setError(e.message);return "";}
  },[input]);
  const saved = input&&output ? (input.length-output.length) : 0;
  const pct = input ? Math.round((saved/input.length)*100) : 0;
  return (
    <VStack>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={320}/>
        <JsonEditor value={output} onChange={()=>{}} label="Minified JSON" height={320} readOnly/>
      </Grid2>
      {output&&(
        <Card>
          <Grid3>
            <StatBox value={`${input.length} B`} label="Original"/>
            <StatBox value={`${output.length} B`} label="Minified"/>
            <StatBox value={`${pct}% saved`} label="Reduction" accent={C.green}/>
          </Grid3>
        </Card>
      )}
    </VStack>
  );
}

function JsonValidator() {
  const [input,setInput]=useState("");
  const result=useMemo(()=>{
    if(!input.trim()) return null;
    try{
      const parsed=JSON.parse(input);
      const type=Array.isArray(parsed)?"array":typeof parsed;
      let keys=0,depth=0;
      const walk=(o,d=0)=>{
        depth=Math.max(depth,d);
        if(typeof o==="object"&&o){
          const entries=Array.isArray(o)?o:Object.entries(o);
          if(!Array.isArray(o)) keys+=entries.length;
          (Array.isArray(o)?o:entries.map(([,v])=>v)).forEach(v=>walk(v,d+1));
        }
      };
      walk(parsed);
      return{valid:true,type,keys,depth,chars:input.length};
    }catch(e){
      const line=e.message.match(/line (\d+)/i)?.[1];
      const col=e.message.match(/column (\d+)/i)?.[1];
      return{valid:false,error:e.message,line,col};
    }
  },[input]);

  return (
    <VStack>
      <JsonEditor value={input} onChange={setInput} label="JSON to Validate" height={300}/>
      {result&&(
        <div className="fade-in" style={{padding:"20px 24px",background:result.valid?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${result.valid?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.25)"}`,borderRadius:12,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>{result.valid?"✅":"❌"}</div>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:result.valid?C.green:C.danger}}>{result.valid?"Valid JSON":"Invalid JSON"}</div>
          {result.valid&&<div style={{marginTop:12,display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
            {[["Type",result.type],["Keys",result.keys],["Max Depth",result.depth],["Chars",result.chars]].map(([l,v])=><div key={l} style={{textAlign:"center"}}><div style={{color:C.amber,fontWeight:700,fontSize:18}}>{v}</div><div style={{fontSize:11,color:C.muted}}>{l}</div></div>)}
          </div>}
          {!result.valid&&<div style={{marginTop:10,fontFamily:"'JetBrains Mono',monospace",fontSize:13,color:"#FCA5A5"}}>{result.error}{result.line&&` (line ${result.line}${result.col?`, col ${result.col}`:""})`}</div>}
        </div>
      )}
      <Card>
        <Label>Common JSON Errors</Label>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {[["Trailing comma",`{"a":1, "b":2,}  — remove last comma`],["Single quotes",`{'key':'val'}  — must use double quotes`],["Unquoted key",`{key:"val"}  — keys must be quoted`],["Comments",`{"a":1 // comment}  — JSON has no comments`]].map(([l,ex])=>(
            <div key={l} style={{fontSize:12,padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
              <span style={{color:C.danger,fontWeight:600}}>{l}:</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:C.muted,marginLeft:8}}>{ex}</span>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function JsonEscape() {
  const [input,setInput]=useState('Hello "World"\nLine 2\tTabbed');
  const [mode,setMode]=useState("escape");
  const output=useMemo(()=>{
    if(!input) return "";
    if(mode==="escape") return input.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t").replace(/\f/g,"\\f").replace(/\b/g,"\\b");
    return input.replace(/\\n/g,"\n").replace(/\\r/g,"\r").replace(/\\t/g,"\t").replace(/\\f/g,"\f").replace(/\\b/g,"\b").replace(/\\"/g,'"').replace(/\\\\/g,"\\");
  },[input,mode]);
  return (
    <VStack>
      <ModeToggle mode={mode} setMode={setMode} options={[["escape","Escape"],["unescape","Unescape"]]}/>
      <Grid2>
        <div><Label>{mode==="escape"?"Plain String":"Escaped JSON String"}</Label><Textarea value={input} onChange={setInput} rows={7} mono={false}/></div>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>{mode==="escape"?"Escaped for JSON":"Unescaped String"}</Label><CopyBtn text={output}/></div><Textarea value={output} onChange={()=>{}} rows={7} readOnly/></div>
      </Grid2>
      <Card><Label>Escape Reference</Label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:8}}>
          {[['\\n',"Newline"],['\\t',"Tab"],['\\r',"Carriage return"],['\\\\','Backslash'],['\\\"','Double quote'],['\\b',"Backspace"],['\\f',"Form feed"],['\\uXXXX',"Unicode"]].map(([esc,desc])=>(
            <div key={esc} style={{textAlign:"center",padding:"6px 4px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",color:C.amber,fontSize:12,fontWeight:700}}>{esc}</div>
              <div style={{fontSize:10,color:C.muted,marginTop:2}}>{desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function JsonSize() {
  const [input,setInput]=useState(SAMPLE);
  const stats=useMemo(()=>{
    if(!input.trim()) return null;
    try{
      const parsed=JSON.parse(input);
      let keys=0,strings=0,numbers=0,booleans=0,nulls=0,arrays=0,objects=0,maxDepth=0;
      function walk(v,d=0){
        maxDepth=Math.max(maxDepth,d);
        if(v===null){nulls++;return;}
        if(typeof v==="boolean"){booleans++;return;}
        if(typeof v==="number"){numbers++;return;}
        if(typeof v==="string"){strings++;return;}
        if(Array.isArray(v)){arrays++;v.forEach(x=>walk(x,d+1));return;}
        objects++;keys+=Object.keys(v).length;Object.values(v).forEach(x=>walk(x,d+1));
      }
      walk(parsed);
      const minified=JSON.stringify(parsed).length;
      const formatted=JSON.stringify(parsed,null,2).length;
      const encoder=new TextEncoder();
      const bytes=encoder.encode(input).length;
      return{keys,strings,numbers,booleans,nulls,arrays,objects,maxDepth,minified,formatted,bytes};
    }catch{return null;}
  },[input]);

  return (
    <VStack>
      <JsonEditor value={input} onChange={setInput} label="JSON to Analyze" height={240}/>
      {!JSON.parse(input||"null")||!stats?<ErrorBox msg={input&&!stats?"Invalid JSON":""}/> : null}
      {stats&&(
        <div className="fade-in">
          <Grid2>
            <Card>
              <Label>Value Types</Label>
              <div style={{display:"flex",flexDirection:"column",gap:0,marginTop:8}}>
                {[["Objects",stats.objects,"#FB923C"],["Arrays",stats.arrays,"#60A5FA"],["Strings",stats.strings,"#34D399"],["Numbers",stats.numbers,"#FCD34D"],["Booleans",stats.booleans,C.amber],["Nulls",stats.nulls,C.muted]].map(([l,v,color])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <span style={{color,fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <Label>Size & Structure</Label>
              <div style={{display:"flex",flexDirection:"column",gap:0,marginTop:8}}>
                {[["Total Keys",stats.keys],["Max Depth",stats.maxDepth+" levels"],["Input Bytes",stats.bytes+" B"],["Minified",stats.minified+" B"],["Formatted",stats.formatted+" B"],["Compression",Math.round((1-stats.minified/stats.bytes)*100)+"%"]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}>
                    <span style={{color:C.muted}}>{l}</span>
                    <span style={{color:C.amber,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Grid2>
        </div>
      )}
    </VStack>
  );
}

function JsonToCsv() {
  const [input,setInput]=useState(JSON.stringify([{id:1,name:"Alice",age:28,city:"SF"},{id:2,name:"Bob",age:34,city:"NY"}],null,2));
  const [delimiter,setDelimiter]=useState(",");
  const [includeHeader,setIncludeHeader]=useState(true);
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      let parsed=JSON.parse(input);
      if(!Array.isArray(parsed)) parsed=Object.values(parsed).find(Array.isArray)||[parsed];
      if(!parsed.length) return "";
      const flat=parsed.map(row=>flattenJson(row));
      const keys=[...new Set(flat.flatMap(r=>Object.keys(r)))];
      const escape=v=>{
        const s=v===null||v===undefined?"":String(v);
        if(s.includes(delimiter)||s.includes("\n")||s.includes('"')) return `"${s.replace(/"/g,'""')}"`;
        return s;
      };
      const rows=flat.map(row=>keys.map(k=>escape(row[k]??"")));
      const lines=includeHeader?[keys.join(delimiter),...rows.map(r=>r.join(delimiter))]:rows.map(r=>r.join(delimiter));
      setError(""); return lines.join("\n");
    }catch(e){setError(e.message);return "";}
  },[input,delimiter,includeHeader]);
  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div><Label>Delimiter</Label><SelectInput value={delimiter} onChange={setDelimiter} options={[{value:",",label:"Comma (CSV)"},{value:";",label:"Semicolon"},{value:"\t",label:"Tab (TSV)"},{value:"|",label:"Pipe"}]}/></div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}><input type="checkbox" checked={includeHeader} onChange={e=>setIncludeHeader(e.target.checked)}/> Include header</label>
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON (array of objects)" height={300}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>CSV Output</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={14} readOnly mono/></div>
      </Grid2>
    </VStack>
  );
}

function CsvToJson() {
  const [input,setInput]=useState("id,name,age,city\n1,Alice,28,SF\n2,Bob,34,NY");
  const [delimiter,setDelimiter]=useState(",");
  const [hasHeader,setHasHeader]=useState(true);
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const lines=input.trim().split(/\r?\n/);
      const parse=line=>{
        const fields=[]; let cur="",inQ=false;
        for(let i=0;i<line.length;i++){
          const ch=line[i];
          if(ch==='"'&&inQ&&line[i+1]==='"'){cur+='"';i++;}
          else if(ch==='"'){inQ=!inQ;}
          else if(ch===delimiter&&!inQ){fields.push(cur.trim());cur="";}
          else cur+=ch;
        }
        fields.push(cur.trim()); return fields;
      };
      const rows=lines.map(parse);
      let result;
      if(hasHeader){
        const headers=rows[0];
        result=rows.slice(1).map(row=>Object.fromEntries(headers.map((h,i)=>{
          const v=row[i]??"";
          const n=parseFloat(v);
          return[h,v===""?null:(!isNaN(n)&&v.trim()!=="")? n:(v==="true"?true:v==="false"?false:v)];
        })));
      } else {
        result=rows.map(r=>r.map(v=>{const n=parseFloat(v);return!isNaN(n)?n:(v==="true"?true:v==="false"?false:v);}));
      }
      setError(""); return JSON.stringify(result,null,2);
    }catch(e){setError(e.message);return "";}
  },[input,delimiter,hasHeader]);
  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <div><Label>Delimiter</Label><SelectInput value={delimiter} onChange={setDelimiter} options={[{value:",",label:"Comma"},{value:";",label:"Semicolon"},{value:"\t",label:"Tab"},{value:"|",label:"Pipe"}]}/></div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:C.text}}><input type="checkbox" checked={hasHeader} onChange={e=>setHasHeader(e.target.checked)}/> First row is header</label>
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <div><Label>CSV Input</Label><Textarea value={input} onChange={setInput} rows={14} mono/></div>
        <JsonEditor value={output} onChange={()=>{}} label="JSON Output" height={300} readOnly/>
      </Grid2>
    </VStack>
  );
}

function JsonToXml() {
  const [input,setInput]=useState('{"user":{"name":"Alice","age":28,"tags":["react","node"]}}');
  const [root,setRoot]=useState("root");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const parsed=JSON.parse(input);
      setError("");
      const xml=jsonToXml(parsed,root||"root",0);
      return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
    }catch(e){setError(e.message);return "";}
  },[input,root]);
  return (
    <VStack>
      <div><Label>Root Element Name</Label><Input value={root} onChange={setRoot} placeholder="root" style={{maxWidth:200}}/></div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={300}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>XML Output</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={14} readOnly/></div>
      </Grid2>
    </VStack>
  );
}

function XmlToJson() {
  const [input,setInput]=useState(`<?xml version="1.0"?>
<user>
  <name>Alice</name>
  <age>28</age>
  <role>admin</role>
</user>`);
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{const r=xmlToJson(input);setError("");return JSON.stringify(r,null,2);}
    catch(e){setError(e.message);return "";}
  },[input]);
  return (
    <VStack>
      <ErrorBox msg={error}/>
      <Grid2>
        <div><Label>XML Input</Label><Textarea value={input} onChange={setInput} rows={14}/></div>
        <JsonEditor value={output} onChange={()=>{}} label="JSON Output" height={300} readOnly/>
      </Grid2>
    </VStack>
  );
}

function JsonToYaml() {
  const [input,setInput]=useState(SAMPLE);
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{const p=JSON.parse(input);setError("");return jsonToYaml(p);}
    catch(e){setError(e.message);return "";}
  },[input]);
  return (
    <VStack>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={320}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>YAML Output</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={15} readOnly/></div>
      </Grid2>
    </VStack>
  );
}

function YamlToJson() {
  const [input,setInput]=useState(`users:\n  - name: Alice\n    age: 28\n    active: true\n  - name: Bob\n    age: 34\n    active: false\nmeta:\n  total: 2\n  version: "1.0"`);
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{const r=yamlToJson(input);setError("");return JSON.stringify(r,null,2);}
    catch(e){setError(e.message);return "";}
  },[input]);
  return (
    <VStack>
      <ErrorBox msg={error}/>
      <Grid2>
        <div><Label>YAML Input</Label><Textarea value={input} onChange={setInput} rows={15}/></div>
        <JsonEditor value={output} onChange={()=>{}} label="JSON Output" height={320} readOnly/>
      </Grid2>
    </VStack>
  );
}

function JsonToTypescript() {
  const [input,setInput]=useState(SAMPLE);
  const [rootName,setRootName]=useState("Root");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const parsed=JSON.parse(input);
      setError("");
      return generateInterface(parsed,rootName||"Root");
    }catch(e){setError(e.message);return "";}
  },[input,rootName]);
  return (
    <VStack>
      <div><Label>Root Interface Name</Label><Input value={rootName} onChange={setRootName} placeholder="Root" style={{maxWidth:200}}/></div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={320}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>TypeScript Interfaces</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={15} mono/></div>
      </Grid2>
    </VStack>
  );
}

function JsonToTable() {
  const [input,setInput]=useState(JSON.stringify([{id:1,name:"Alice Johnson",role:"admin",age:28,active:true},{id:2,name:"Bob Smith",role:"editor",age:34,active:false},{id:3,name:"Carol Lee",role:"viewer",age:25,active:true}],null,2));
  const [error,setError]=useState("");
  const [sortCol,setSortCol]=useState(null);
  const [sortDir,setSortDir]=useState("asc");
  const [filter,setFilter]=useState("");

  const {headers,rows}=useMemo(()=>{
    if(!input.trim()) return{headers:[],rows:[]};
    try{
      let p=JSON.parse(input);
      if(!Array.isArray(p)) p=[p];
      const flat=p.map(r=>flattenJson(r));
      const headers=[...new Set(flat.flatMap(r=>Object.keys(r)))];
      setError("");
      return{headers,rows:flat};
    }catch(e){setError(e.message);return{headers:[],rows:[]};}
  },[input]);

  const displayed=useMemo(()=>{
    let r=[...rows];
    if(filter) r=r.filter(row=>Object.values(row).some(v=>String(v).toLowerCase().includes(filter.toLowerCase())));
    if(sortCol) r.sort((a,b)=>{const av=a[sortCol]??"",bv=b[sortCol]??"";return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1);});
    return r;
  },[rows,filter,sortCol,sortDir]);

  const handleSort=col=>{if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortCol(col);setSortDir("asc");}};

  return (
    <VStack>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="JSON Array" height={200}/>
        <div><Label>Filter Rows</Label><Input value={filter} onChange={setFilter} placeholder="Search any value…"/></div>
      </Grid2>
      {headers.length>0&&(
        <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:10}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:12}}>
            <thead style={{background:"rgba(255,255,255,0.04)",position:"sticky",top:0}}>
              <tr>{headers.map(h=>(
                <th key={h} onClick={()=>handleSort(h)} style={{padding:"10px 14px",textAlign:"left",color:sortCol===h?C.amber:C.muted,fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:`1px solid ${C.border}`,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap"}}>
                  {h} {sortCol===h?(sortDir==="asc"?"▲":"▼"):""}
                </th>
              ))}</tr>
            </thead>
            <tbody>
              {displayed.map((row,i)=>(
                <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`}} onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.04)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                  {headers.map(h=>{
                    const v=row[h];
                    const isNull=v===null||v===undefined;
                    const isBool=typeof v==="boolean";
                    return <td key={h} style={{padding:"8px 14px",color:isNull?C.muted:isBool?(v?"#34D399":"#FCA5A5"):C.text,fontFamily:typeof v==="number"?"'JetBrains Mono',monospace":"inherit"}}>{isNull?"—":String(v)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding:"8px 14px",borderTop:`1px solid ${C.border}`,fontSize:12,color:C.muted}}>{displayed.length} of {rows.length} rows</div>
        </div>
      )}
    </VStack>
  );
}

function JsonToMarkdown() {
  const [input,setInput]=useState(JSON.stringify([{Name:"Alice",Role:"Admin",Age:28},{Name:"Bob",Role:"Editor",Age:34}],null,2));
  const [error,setError]=useState("");
  const esc=v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      let p=JSON.parse(input);
      if(!Array.isArray(p)) p=[p];
      const flat=p.map(r=>flattenJson(r));
      const cols=[...new Set(flat.flatMap(r=>Object.keys(r)))];
      const escape=v=>String(v??"-").replace(/\|/g,"\\|");
      const header=`| ${cols.join(" | ")} |`;
      const sep=`| ${cols.map(()=>"---").join(" | ")} |`;
      const rows=flat.map(row=>`| ${cols.map(k=>escape(row[k]??"-")).join(" | ")} |`);
      setError(""); return [header,sep,...rows].join("\n");
    }catch(e){setError(e.message);return "";}
  },[input]);
  return (
    <VStack>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="JSON Array" height={280}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>Markdown Table</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={13} readOnly mono/></div>
      </Grid2>
      {output&&(
        <Card>
          <Label>Preview</Label>
          <div style={{overflowX:"auto",marginTop:8}} dangerouslySetInnerHTML={{__html:output.split("\n").reduce((acc,line,i)=>{
            if(i===0) return `<table style="border-collapse:collapse;font-size:13px;width:100%"><thead><tr>${line.split("|").filter(Boolean).map(c=>`<th style="padding:8px 12px;text-align:left;border-bottom:1px solid rgba(255,255,255,0.1);color:#94A3B8;font-size:11px;text-transform:uppercase">${esc(c.trim())}</th>`).join("")}</tr></thead><tbody>`;
            if(i===1) return acc;
            return acc+`<tr>${line.split("|").filter(Boolean).map(c=>`<td style="padding:7px 12px;border-bottom:1px solid rgba(255,255,255,0.04);color:#E2E8F0">${esc(c.trim())}</td>`).join("")}</tr>`;
          },"")+"</tbody></table>"}}/>
        </Card>
      )}
    </VStack>
  );
}

function JsonToEnv() {
  const [input,setInput]=useState('{\n  "DATABASE_URL": "postgres://localhost/mydb",\n  "PORT": 3000,\n  "DEBUG": true,\n  "SECRET_KEY": "abc123",\n  "API_TIMEOUT": 30\n}');
  const [prefix,setPrefix]=useState("");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const p=JSON.parse(input);
      const flat=flattenJson(p,"","_");
      setError("");
      return Object.entries(flat).map(([k,v])=>{
        const key=(prefix?prefix.toUpperCase()+"_":"")+k.toUpperCase().replace(/[^A-Z0-9_]/g,"_");
        const val=typeof v==="string"&&(v.includes(" ")||v.includes("$")||v.includes("#"))?`"${v}"`:String(v);
        return `${key}=${val}`;
      }).join("\n");
    }catch(e){setError(e.message);return "";}
  },[input,prefix]);
  return (
    <VStack>
      <div><Label>Variable Prefix (optional)</Label><Input value={prefix} onChange={setPrefix} placeholder="e.g. APP" style={{maxWidth:200}}/></div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Flat JSON Object" height={280}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>.env Output</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={13} readOnly mono/></div>
      </Grid2>
    </VStack>
  );
}

function JsonDiff() {
  const [a,setA]=useState('{\n  "name": "Alice",\n  "age": 28,\n  "role": "user",\n  "city": "SF"\n}');
  const [b,setB]=useState('{\n  "name": "Alice",\n  "age": 30,\n  "role": "admin",\n  "country": "USA"\n}');
  const diff=useMemo(()=>{
    try{
      const pa=JSON.parse(a||"{}"),pb=JSON.parse(b||"{}");
      const results=[];
      function compare(oa,ob,path="") {
        const allKeys=new Set([...Object.keys(oa||{}),...Object.keys(ob||{})]);
        for(const k of allKeys){
          const fullPath=path?`${path}.${k}`:k;
          const va=oa?.[k],vb=ob?.[k];
          if(!(k in (oa||{}))) results.push({type:"add",path:fullPath,value:vb});
          else if(!(k in (ob||{}))) results.push({type:"remove",path:fullPath,value:va});
          else if(typeof va==="object"&&va!==null&&typeof vb==="object"&&vb!==null&&!Array.isArray(va)&&!Array.isArray(vb)) compare(va,vb,fullPath);
          else if(JSON.stringify(va)!==JSON.stringify(vb)) results.push({type:"change",path:fullPath,from:va,to:vb});
          else results.push({type:"same",path:fullPath,value:va});
        }
      }
      compare(pa,pb);
      return results;
    }catch{return null;}
  },[a,b]);

  const counts=diff?{add:diff.filter(d=>d.type==="add").length,remove:diff.filter(d=>d.type==="remove").length,change:diff.filter(d=>d.type==="change").length,same:diff.filter(d=>d.type==="same").length}:null;

  return (
    <VStack>
      <Grid2>
        <JsonEditor value={a} onChange={setA} label="JSON A (Original)" height={240}/>
        <JsonEditor value={b} onChange={setB} label="JSON B (Modified)" height={240}/>
      </Grid2>
      {counts&&<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Badge color="green">+{counts.add} added</Badge>
        <Badge color="red">-{counts.remove} removed</Badge>
        <Badge color="amber">~{counts.change} changed</Badge>
        <Badge color="teal">{counts.same} same</Badge>
      </div>}
      {diff&&(
        <div style={{maxHeight:360,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
          {diff.filter(d=>d.type!=="same").map((d,i)=>{
            const bg=d.type==="add"?"rgba(16,185,129,0.08)":d.type==="remove"?"rgba(239,68,68,0.08)":"rgba(245,158,11,0.08)";
            const color=d.type==="add"?C.green:d.type==="remove"?C.danger:C.amber;
            const icon=d.type==="add"?"+ ":d.type==="remove"?"— ":"~ ";
            return (
              <div key={i} style={{padding:"8px 16px",background:bg,borderBottom:`1px solid rgba(255,255,255,0.04)`,display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{color,fontFamily:"'JetBrains Mono',monospace",fontSize:13,minWidth:16}}>{icon}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#60A5FA",minWidth:140}}>{d.path}</span>
                <span style={{fontSize:12,color:C.muted,flex:1}}>
                  {d.type==="change"?<><span style={{color:"#FCA5A5"}}>{JSON.stringify(d.from)}</span><span style={{color:C.muted}}> → </span><span style={{color:"#34D399"}}>{JSON.stringify(d.to)}</span></>:
                  d.type==="add"?<span style={{color:"#34D399"}}>{JSON.stringify(d.value)}</span>:
                  <span style={{color:"#FCA5A5"}}>{JSON.stringify(d.value)}</span>}
                </span>
              </div>
            );
          })}
          {diff.filter(d=>d.type!=="same").length===0&&<div style={{padding:20,textAlign:"center",color:C.green}}>— No differences found — JSON objects are identical</div>}
        </div>
      )}
    </VStack>
  );
}

function JsonPathTester() {
  const [input,setInput]=useState(SAMPLE);
  const [path,setPath]=useState("$.users[*].name");
  const [error,setError]=useState("");
  const [result,setResult]=useState(null);

  const run=useCallback(()=>{
    if(!input.trim()||!path.trim()) return;
    try{
      const p=JSON.parse(input);
      const r=jsonPath(p,path);
      setResult(r); setError("");
    }catch(e){setError(e.message);setResult(null);}
  },[input,path]);

  const examples=[["$.users[0].name","First user's name"],["$.users[*].email","All email addresses"],["$.meta.total","Meta total count"],["$.users[*].address.city","All cities"],["$.users[?(@.active==true)].name","Active users"]];

  return (
    <VStack>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><Label>JSONPath Expression</Label><Input value={path} onChange={setPath} placeholder="$.users[*].name" mono onKeyDown={e=>e.key==="Enter"&&run()}/></div>
        <div style={{alignSelf:"flex-end"}}><Btn onClick={run}>Run</Btn></div>
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="JSON Data" height={320}/>
        <div>
          <Label>Result ({result?.length??0} matches)</Label>
          <Textarea value={result?JSON.stringify(result,null,2):""} onChange={()=>{}} rows={15} readOnly/>
        </div>
      </Grid2>
      <Card>
        <Label>Example Expressions</Label>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:8}}>
          {examples.map(([expr,desc])=>(
            <div key={expr} style={{display:"flex",gap:10,alignItems:"center",padding:"6px 10px",background:"rgba(255,255,255,0.02)",borderRadius:6,cursor:"pointer"}} onClick={()=>setPath(expr)}>
              <code style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:C.amber,flex:"0 0 auto"}}>{expr}</code>
              <span style={{fontSize:12,color:C.muted}}>{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function JsonSchema() {
  const [data,setData]=useState('{\n  "name": "Alice",\n  "age": 28,\n  "email": "alice@example.com"\n}');
  const [schema,setSchema]=useState('{\n  "type": "object",\n  "required": ["name","age"],\n  "properties": {\n    "name": {"type":"string","minLength":1},\n    "age": {"type":"number","minimum":0,"maximum":150},\n    "email": {"type":"string"}\n  }\n}');
  const [result,setResult]=useState(null);

  const validate=useCallback(()=>{
    try{
      const d=JSON.parse(data),s=JSON.parse(schema);
      const errors=[];
      function check(val,sc,path="root"){
        if(sc.type&&typeof val!==sc.type&&!(sc.type==="number"&&typeof val==="number")) errors.push(`${path}: expected ${sc.type}, got ${typeof val}`);
        if(sc.type==="string"){if(sc.minLength&&val.length<sc.minLength) errors.push(`${path}: length ${val.length} < minLength ${sc.minLength}`);if(sc.maxLength&&val.length>sc.maxLength) errors.push(`${path}: length ${val.length} > maxLength ${sc.maxLength}`);if(sc.pattern&&!new RegExp(sc.pattern).test(val)) errors.push(`${path}: does not match pattern ${sc.pattern}`);}
        if(sc.type==="number"){if(sc.minimum!==undefined&&val<sc.minimum) errors.push(`${path}: ${val} < minimum ${sc.minimum}`);if(sc.maximum!==undefined&&val>sc.maximum) errors.push(`${path}: ${val} > maximum ${sc.maximum}`);}
        if(sc.required&&Array.isArray(sc.required)) sc.required.forEach(k=>{if(!(k in (val||{}))) errors.push(`${path}: missing required property "${k}"`);});
        if(sc.properties&&typeof val==="object"&&val) Object.entries(sc.properties).forEach(([k,subSc])=>{if(k in val) check(val[k],subSc,`${path}.${k}`);});
        if(sc.items&&Array.isArray(val)) val.forEach((item,i)=>check(item,sc.items,`${path}[${i}]`));
      }
      check(d,s);
      setResult({valid:errors.length===0,errors});
    }catch(e){setResult({valid:false,errors:[e.message]});}
  },[data,schema]);

  return (
    <VStack>
      <Grid2>
        <JsonEditor value={data} onChange={setData} label="JSON Data" height={260}/>
        <JsonEditor value={schema} onChange={setSchema} label="JSON Schema" height={260}/>
      </Grid2>
      <Btn onClick={validate}>Validate Against Schema</Btn>
      {result&&(
        <div className="fade-in" style={{padding:"16px 20px",background:result.valid?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${result.valid?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.25)"}`,borderRadius:12}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:result.valid?C.green:C.danger,marginBottom:result.errors.length?10:0}}>{result.valid?"✅ Valid — data matches the schema":"❌ Invalid — validation errors found"}</div>
          {result.errors.map((e,i)=><div key={i} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#FCA5A5",marginTop:4}}>• {e}</div>)}
        </div>
      )}
    </VStack>
  );
}

function JsonSorter() {
  const [input,setInput]=useState(SAMPLE);
  const [error,setError]=useState("");
  const [dir,setDir]=useState("asc");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const p=JSON.parse(input);
      function sortDeep(obj){
        if(Array.isArray(obj)) return obj.map(sortDeep);
        if(typeof obj==="object"&&obj){
          const sorted=dir==="asc"?Object.keys(obj).sort():Object.keys(obj).sort().reverse();
          return Object.fromEntries(sorted.map(k=>[k,sortDeep(obj[k])]));
        }
        return obj;
      }
      setError(""); return JSON.stringify(sortDeep(p),null,2);
    }catch(e){setError(e.message);return "";}
  },[input,dir]);
  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <ModeToggle mode={dir} setMode={setDir} options={[["asc","A → Z"],["desc","Z → A"]]}/>
        <span style={{fontSize:12,color:C.muted}}>Sorts all object keys recursively</span>
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={320}/>
        <JsonEditor value={output} onChange={()=>{}} label="Sorted JSON" height={320} readOnly/>
      </Grid2>
    </VStack>
  );
}

function JsonFlatten() {
  const [input,setInput]=useState(SAMPLE);
  const [sep,setSep]=useState(".");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{setError("");return JSON.stringify(flattenJson(JSON.parse(input),"",sep),null,2);}
    catch(e){setError(e.message);return "";}
  },[input,sep]);
  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <Label>Separator:</Label>
        {[".","_","/","->"].map(s=><Btn key={s} variant={sep===s?"primary":"secondary"} size="sm" onClick={()=>setSep(s)}>{s}</Btn>)}
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Nested JSON" height={320}/>
        <JsonEditor value={output} onChange={()=>{}} label="Flattened JSON" height={320} readOnly/>
      </Grid2>
    </VStack>
  );
}

function JsonUnflatten() {
  const [input,setInput]=useState('{\n  "users.0.name": "Alice",\n  "users.0.age": 28,\n  "users.1.name": "Bob",\n  "users.1.age": 34,\n  "meta.total": 2\n}');
  const [sep,setSep]=useState(".");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{setError("");return JSON.stringify(unflattenJson(JSON.parse(input),sep),null,2);}
    catch(e){setError(e.message);return "";}
  },[input,sep]);
  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <Label>Separator:</Label>
        {[".","_","/"].map(s=><Btn key={s} variant={sep===s?"primary":"secondary"} size="sm" onClick={()=>setSep(s)}>{s}</Btn>)}
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Flat JSON (dot-notation)" height={280}/>
        <JsonEditor value={output} onChange={()=>{}} label="Nested JSON" height={280} readOnly/>
      </Grid2>
    </VStack>
  );
}

function JsonKeys() {
  const [input,setInput]=useState(SAMPLE);
  const [error,setError]=useState("");
  const {keys,paths}=useMemo(()=>{
    if(!input.trim()) return{keys:[],paths:[]};
    try{
      const p=JSON.parse(input);
      const paths=[],keys=new Set();
      function walk(obj,path=""){
        if(typeof obj!=="object"||obj===null){paths.push({path,value:JSON.stringify(obj),type:typeof obj});return;}
        if(Array.isArray(obj)){obj.forEach((v,i)=>walk(v,`${path}[${i}]`));return;}
        Object.entries(obj).forEach(([k,v])=>{keys.add(k);walk(v,path?`${path}.${k}`:k);});
      }
      walk(p);
      return{keys:[...keys].sort(),paths};
    }catch(e){setError(e.message);return{keys:[],paths:[]};}
  },[input]);

  return (
    <VStack>
      <JsonEditor value={input} onChange={setInput} label="JSON Input" height={220}/>
      <ErrorBox msg={error}/>
      {keys.length>0&&(
        <Grid2>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><Label>Unique Keys ({keys.length})</Label><CopyBtn text={keys.join("\n")}/></div>
            <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexWrap:"wrap",gap:6}}>
              {keys.map(k=><Badge key={k} color="amber">{k}</Badge>)}
            </div>
          </Card>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><Label>All Paths ({paths.length})</Label><CopyBtn text={paths.map(p=>p.path).join("\n")}/></div>
            <div style={{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:4}}>
              {paths.map((p,i)=>(
                <div key={i} style={{display:"flex",gap:8,fontSize:12,padding:"3px 0"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#60A5FA",flex:"0 0 auto",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.path||"(root)"}</span>
                  <span style={{color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Grid2>
      )}
    </VStack>
  );
}

function JsonMerger() {
  const [a,setA]=useState('{\n  "name": "Alice",\n  "role": "user",\n  "settings": {"theme": "dark"}\n}');
  const [b,setB]=useState('{\n  "role": "admin",\n  "email": "alice@example.com",\n  "settings": {"notifications": true}\n}');
  const [strategy,setStrategy]=useState("deep");
  const [error,setError]=useState("");

  const output=useMemo(()=>{
    if(!a.trim()||!b.trim()) return "";
    try{
      const pa=JSON.parse(a),pb=JSON.parse(b);
      function deepMerge(base,override){
        if(typeof base!=="object"||typeof override!=="object"||!base||!override) return override;
        if(Array.isArray(base)&&Array.isArray(override)) return strategy==="concat"?[...base,...override]:override;
        const result={...base};
        for(const k of Object.keys(override)){
          result[k]=(strategy==="deep"&&typeof base[k]==="object"&&typeof override[k]==="object"&&!Array.isArray(base[k]))
            ?deepMerge(base[k],override[k]):override[k];
        }
        return result;
      }
      setError(""); return JSON.stringify(deepMerge(pa,pb),null,2);
    }catch(e){setError(e.message);return "";}
  },[a,b,strategy]);

  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <Label>Merge Strategy:</Label>
        <ModeToggle mode={strategy} setMode={setStrategy} options={[["deep","Deep Merge"],["shallow","Shallow"],["concat","Concat Arrays"]]}/>
      </div>
      <ErrorBox msg={error}/>
      <Grid3>
        <JsonEditor value={a} onChange={setA} label="JSON A (Base)" height={240}/>
        <JsonEditor value={b} onChange={setB} label="JSON B (Override)" height={240}/>
        <JsonEditor value={output} onChange={()=>{}} label="Merged Result" height={240} readOnly/>
      </Grid3>
    </VStack>
  );
}

function JsonArrayTools() {
  const [input,setInput]=useState(JSON.stringify([{id:1,name:"Alice",age:28,role:"admin"},{id:2,name:"Bob",age:34,role:"editor"},{id:3,name:"Carol",age:25,role:"admin"},{id:4,name:"Dave",age:41,role:"viewer"}],null,2));
  const [filterKey,setFilterKey]=useState("role");
  const [filterVal,setFilterVal]=useState("admin");
  const [sortKey,setSortKey]=useState("age");
  const [sortDir,setSortDir]=useState("asc");
  const [page,setPage]=useState(1);
  const [pageSize]=useState(10);
  const [error,setError]=useState("");

  const {parsed,filtered,sorted,paged,headers}=useMemo(()=>{
    try{
      const parsed=JSON.parse(input);
      if(!Array.isArray(parsed)) return{parsed:null};
      const headers=[...new Set(parsed.flatMap(r=>typeof r==="object"?Object.keys(r):[]))];
      const filtered=filterKey&&filterVal?parsed.filter(r=>String(r[filterKey]??"").toLowerCase().includes(filterVal.toLowerCase())):parsed;
      const sorted=sortKey?[...filtered].sort((a,b)=>{const av=a[sortKey]??"",bv=b[sortKey]??"";return sortDir==="asc"?(av>bv?1:-1):(av<bv?1:-1);}):filtered;
      const totalPages=Math.ceil(sorted.length/pageSize);
      const paged=sorted.slice((page-1)*pageSize,page*pageSize);
      setError("");
      return{parsed,filtered,sorted,paged,headers,totalPages};
    }catch(e){setError(e.message);return{parsed:null};}
  },[input,filterKey,filterVal,sortKey,sortDir,page,pageSize]);

  return (
    <VStack>
      <JsonEditor value={input} onChange={setInput} label="JSON Array" height={180}/>
      <ErrorBox msg={error}/>
      {parsed&&(
        <>
          <Grid3>
            <div><Label>Filter Key</Label><SelectInput value={filterKey} onChange={setFilterKey} options={[{value:"",label:"All"},...(headers||[]).map(h=>({value:h,label:h}))]}/></div>
            <div><Label>Filter Value</Label><Input value={filterVal} onChange={setFilterVal} placeholder="e.g. admin"/></div>
            <div><Label>Sort By</Label><div style={{display:"flex",gap:6}}><SelectInput value={sortKey} onChange={setSortKey} options={[{value:"",label:"None"},...(headers||[]).map(h=>({value:h,label:h}))]}/><Btn variant="secondary" size="sm" onClick={()=>setSortDir(d=>d==="asc"?"desc":"asc")}>{sortDir==="asc"?"↑":"↓"}</Btn></div></div>
          </Grid3>
          <div style={{display:"flex",gap:8}}>
            <Badge color="amber">{filtered?.length} filtered</Badge>
            <Badge color="blue">{sorted?.length} sorted</Badge>
            <CopyBtn text={JSON.stringify(sorted,null,2)}/>
          </div>
          {paged&&headers&&paged.length>0&&(
            <div style={{overflowX:"auto",border:`1px solid ${C.border}`,borderRadius:10}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                <thead><tr style={{background:"rgba(255,255,255,0.04)"}}>{headers.map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",color:C.muted,fontSize:11,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
                <tbody>{paged.map((row,i)=><tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`}}>{headers.map(h=><td key={h} style={{padding:"7px 12px",color:C.text}}>{String(row[h]??"—")}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </VStack>
  );
}

function JsonQuery() {
  const [input,setInput]=useState(SAMPLE);
  const [conditions,setConditions]=useState([{field:"active",op:"==",value:"true"}]);
  const [error,setError]=useState("");
  const [output,setOutput]=useState("");

  const run=useCallback(()=>{
    try{
      const p=JSON.parse(input);
      const arr=Array.isArray(p)?p:Object.values(p).find(Array.isArray)||[p];
      const cast=v=>{if(v==="true")return true;if(v==="false")return false;if(v==="null")return null;const n=parseFloat(v);return isNaN(n)?v:n;};
      const result=arr.filter(item=>conditions.every(({field,op,value})=>{
        const iv=item[field]??item[field.split(".").reduce((o,k)=>o?.[k],item)];
        const cv=cast(value);
        if(op==="==") return iv==cv;
        if(op==="!=") return iv!=cv;
        if(op===">") return iv>cv;
        if(op==="<") return iv<cv;
        if(op==="contains") return String(iv).toLowerCase().includes(String(cv).toLowerCase());
        if(op==="starts") return String(iv).startsWith(String(cv));
        return true;
      }));
      setOutput(JSON.stringify(result,null,2));
      setError("");
    }catch(e){setError(e.message);}
  },[input,conditions]);

  const addCond=()=>setConditions(c=>[...c,{field:"",op:"==",value:""}]);
  const updateCond=(i,k,v)=>setConditions(c=>c.map((x,j)=>j===i?{...x,[k]:v}:x));
  const removeCond=i=>setConditions(c=>c.filter((_,j)=>j!==i));

  return (
    <VStack>
      <JsonEditor value={input} onChange={setInput} label="JSON Data" height={200}/>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <Label>Filter Conditions (AND)</Label>
          <Btn variant="secondary" size="sm" onClick={addCond}>+ Add Condition</Btn>
        </div>
        <VStack gap={8}>
          {conditions.map((c,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center"}}>
              <Input value={c.field} onChange={v=>updateCond(i,"field",v)} placeholder="field" style={{flex:1}}/>
              <SelectInput value={c.op} onChange={v=>updateCond(i,"op",v)} options={[{value:"==",label:"=="},{value:"!=",label:"!="},{value:">",label:">"},{value:"<",label:"<"},{value:"contains",label:"contains"},{value:"starts",label:"starts with"}]} style={{width:120}}/>
              <Input value={c.value} onChange={v=>updateCond(i,"value",v)} placeholder="value" style={{flex:1}}/>
              {conditions.length>1&&<Btn variant="danger" size="sm" onClick={()=>removeCond(i)}>×</Btn>}
            </div>
          ))}
        </VStack>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={run}>Run Query</Btn>
        <ErrorBox msg={error}/>
      </div>
      {output&&<JsonEditor value={output} onChange={()=>{}} label="Query Result" height={240} readOnly/>}
    </VStack>
  );
}

// ═══ CDN SCRIPT LOADER (cached) ═══════════════════════════════════════════
const _scripts = {};
function loadScript(src) {
  if (_scripts[src]) return _scripts[src];
  _scripts[src] = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = res;
    s.onerror = () => { delete _scripts[src]; rej(new Error('load failed')); };
    document.body.appendChild(s);
  });
  return _scripts[src];
}

// ═══ CODEGEN HELPERS (Go / Python) ════════════════════════════════════════
function codePascal(s) {
  return String(s).replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Field';
}
function singularize(s) {
  const w = String(s || 'Item');
  if (/ies$/i.test(w)) return w.replace(/ies$/i, 'y');
  if (/ses$/i.test(w)) return w.replace(/es$/i, '');
  if (/s$/i.test(w) && !/ss$/i.test(w)) return w.replace(/s$/i, '');
  return w;
}

// JSON → Go struct. Conservative type inference; nested objects become named structs.
function jsonToGo(value, rootName) {
  const structs = [];
  function goType(val, nameHint) {
    if (val === null) return 'interface{}';
    const t = typeof val;
    if (t === 'boolean') return 'bool';
    if (t === 'number') return Number.isInteger(val) ? 'int' : 'float64';
    if (t === 'string') return 'string';
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]interface{}';
      return '[]' + goType(val[0], singularize(nameHint));
    }
    if (t === 'object') {
      const name = codePascal(nameHint);
      buildStruct(val, name);
      return name;
    }
    return 'interface{}';
  }
  function buildStruct(obj, name) {
    // Build field types first so nested struct defs are pushed before this one.
    const fields = Object.entries(obj).map(([k, v]) =>
      '\t' + codePascal(k) + ' ' + goType(v, k) + ' `json:"' + k + '"`');
    const body = fields.length ? fields.join('\n') : '\t// (empty object)';
    structs.push('type ' + name + ' struct {\n' + body + '\n}');
  }
  const rn = codePascal(rootName || 'AutoGenerated');
  if (Array.isArray(value)) {
    if (value.length && value[0] && typeof value[0] === 'object' && !Array.isArray(value[0])) {
      buildStruct(value[0], rn);
      structs.push('// Root JSON is an array — use: type Root = []' + rn);
    } else {
      return '// Root JSON is an array of scalars: ' + goType(value, rn);
    }
  } else if (value && typeof value === 'object') {
    buildStruct(value, rn);
  } else {
    return '// Root JSON is ' + goType(value, rn) + ' (not an object)';
  }
  return '// Starting point — review numeric widths, pointers and optional fields.\n\n' + structs.join('\n\n');
}

const PY_KEYWORDS = new Set(['False','None','True','and','as','assert','async','await','break','class','continue','def','del','elif','else','except','finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try','while','with','yield']);
function isValidPyId(k) { return /^[A-Za-z_][A-Za-z0-9_]*$/.test(k) && !PY_KEYWORDS.has(k); }

// JSON → Python TypedDict. Nested objects become nested TypedDicts (defined first).
function jsonToPython(value, rootName) {
  const classes = [];
  function pyType(val, nameHint) {
    if (val === null) return 'Optional[Any]';
    const t = typeof val;
    if (t === 'boolean') return 'bool';
    if (t === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (t === 'string') return 'str';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]';
      return 'List[' + pyType(val[0], singularize(nameHint)) + ']';
    }
    if (t === 'object') {
      const name = codePascal(nameHint);
      buildClass(val, name);
      return name;
    }
    return 'Any';
  }
  function buildClass(obj, name) {
    const entries = Object.entries(obj);
    // Resolve field types first so nested classes are defined before this one.
    const fieldTypes = entries.map(([k, v]) => [k, pyType(v, k)]);
    const allValid = entries.every(([k]) => isValidPyId(k));
    let def;
    if (allValid) {
      const body = fieldTypes.length
        ? fieldTypes.map(([k, ty]) => '    ' + k + ': ' + ty).join('\n')
        : '    pass';
      def = 'class ' + name + '(TypedDict):\n' + body;
    } else {
      const body = fieldTypes.map(([k, ty]) => "    '" + k + "': " + ty + ',').join('\n');
      def = name + " = TypedDict('" + name + "', {\n" + body + '\n})';
    }
    classes.push(def);
  }
  const rn = codePascal(rootName || 'Model');
  if (Array.isArray(value)) {
    if (value.length && value[0] && typeof value[0] === 'object' && !Array.isArray(value[0])) {
      buildClass(value[0], rn);
      classes.push('# Root JSON is an array — use: List[' + rn + ']');
    } else {
      return '# Root JSON is an array of scalars: ' + pyType(value, rn);
    }
  } else if (value && typeof value === 'object') {
    buildClass(value, rn);
  } else {
    return '# Root JSON is ' + pyType(value, rn) + ' (not an object)';
  }
  const header = 'from typing import TypedDict, List, Optional, Any\n';
  return header + '\n# Starting point — verify Optional fields and numeric types.\n\n' + classes.join('\n\n');
}

// ═══ NEW TOOL COMPONENTS ══════════════════════════════════════════════════
function JsonRepair() {
  const [input,setInput]=useState("{\n  name: 'ToolsRift',\n  // trailing comma + single quotes + unquoted keys\n  tags: ['json', 'repair',],\n  count: 42,\n  active: true,\n}");
  const [output,setOutput]=useState("");
  const [error,setError]=useState("");
  const [ready,setReady]=useState(typeof window!=="undefined"&&!!window.JSON5);
  useEffect(()=>{
    if(typeof window!=="undefined"&&window.JSON5){setReady(true);return;}
    loadScript("https://cdn.jsdelivr.net/npm/json5@2.2.3/dist/index.min.js")
      .then(()=>setReady(true))
      .catch(()=>setError("Could not load the JSON5 library. Check your connection and retry."));
  },[]);
  useEffect(()=>{
    if(!input.trim()){setOutput("");setError("");return;}
    if(!ready||!window.JSON5){setOutput("");return;}
    try{
      const obj=window.JSON5.parse(input);
      setOutput(JSON.stringify(obj,null,2));
      setError("");
    }catch(e){setError("Could not repair JSON: "+e.message);setOutput("");}
  },[input,ready]);
  return (
    <VStack>
      <div style={{fontSize:12,color:C.muted}}>Paste malformed JSON — trailing commas, single quotes, unquoted keys and comments are all tolerated and rewritten as strict, valid JSON.{!ready&&" (loading repair engine…)"}</div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Broken JSON" height={320}/>
        <JsonEditor value={output} onChange={()=>{}} label="Repaired (Strict JSON)" height={320} readOnly/>
      </Grid2>
      {output&&<SuccessBox msg="✓ Repaired into valid, strict JSON."/>}
    </VStack>
  );
}

function JsonlConverter() {
  const [mode,setMode]=useState("toJsonl");
  const [input,setInput]=useState(JSON.stringify([{id:1,name:"Alice",active:true},{id:2,name:"Bob",active:false}],null,2));
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      if(mode==="toJsonl"){
        const arr=JSON.parse(input);
        if(!Array.isArray(arr)) throw new Error("Input must be a JSON array.");
        setError("");
        return arr.map(item=>JSON.stringify(item)).join("\n");
      } else {
        const lines=input.split(/\r?\n/);
        const arr=[];
        lines.forEach((line,i)=>{
          if(!line.trim()) return;
          try{ arr.push(JSON.parse(line)); }
          catch(e){ throw new Error("Line "+(i+1)+": "+e.message); }
        });
        setError("");
        return JSON.stringify(arr,null,2);
      }
    }catch(e){ setError(e.message); return ""; }
  },[input,mode]);
  const swap=()=>{ if(output){setInput(output);} setMode(m=>m==="toJsonl"?"toArray":"toJsonl"); };
  return (
    <VStack>
      <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <ModeToggle mode={mode} setMode={setMode} options={[["toJsonl","Array → JSONL"],["toArray","JSONL → Array"]]}/>
        <Btn variant="secondary" size="sm" onClick={swap}>⇄ Use output as input</Btn>
      </div>
      <ErrorBox msg={error}/>
      <Grid2>
        {mode==="toJsonl"
          ? <JsonEditor value={input} onChange={setInput} label="JSON Array" height={320}/>
          : <div><Label>JSONL / NDJSON (one JSON value per line)</Label><Textarea value={input} onChange={setInput} rows={16} mono/></div>}
        {mode==="toJsonl"
          ? <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>JSONL Output</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={16} readOnly mono/></div>
          : <JsonEditor value={output} onChange={()=>{}} label="JSON Array" height={320} readOnly/>}
      </Grid2>
    </VStack>
  );
}

function JsonToGo() {
  const [input,setInput]=useState(SAMPLE);
  const [rootName,setRootName]=useState("AutoGenerated");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{ const parsed=JSON.parse(input); setError(""); return jsonToGo(parsed,rootName||"AutoGenerated"); }
    catch(e){ setError(e.message); return ""; }
  },[input,rootName]);
  return (
    <VStack>
      <div><Label>Root Struct Name</Label><Input value={rootName} onChange={setRootName} placeholder="AutoGenerated" style={{maxWidth:220}}/></div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={340}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>Go Struct</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={16} readOnly mono/></div>
      </Grid2>
    </VStack>
  );
}

function JsonToPython() {
  const [input,setInput]=useState(SAMPLE);
  const [rootName,setRootName]=useState("Model");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{ const parsed=JSON.parse(input); setError(""); return jsonToPython(parsed,rootName||"Model"); }
    catch(e){ setError(e.message); return ""; }
  },[input,rootName]);
  return (
    <VStack>
      <div><Label>Root Class Name</Label><Input value={rootName} onChange={setRootName} placeholder="Model" style={{maxWidth:220}}/></div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON" height={340}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>Python TypedDict</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={16} readOnly mono/></div>
      </Grid2>
    </VStack>
  );
}

function jsonToSql(data, table) {
  let rows = Array.isArray(data) ? data : (typeof data === "object" && data !== null ? [data] : []);
  rows = rows.filter(r => r && typeof r === "object" && !Array.isArray(r));
  if (!rows.length) return "";
  const cols = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const esc = v => {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
    if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
    if (typeof v === "object") v = JSON.stringify(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  };
  const colList = cols.map(c => `\`${c}\``).join(", ");
  return rows.map(row => `INSERT INTO \`${table}\` (${colList}) VALUES (${cols.map(c => esc(row[c])).join(", ")});`).join("\n");
}
function JsonToSql() {
  const [input,setInput]=useState(JSON.stringify([{id:1,name:"Alice",active:true},{id:2,name:"O'Brien",active:false}],null,2));
  const [table,setTable]=useState("users");
  const [error,setError]=useState("");
  const output=useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const parsed=JSON.parse(input);
      const sql=jsonToSql(parsed, (table||"table").replace(/[`\s]/g,"_"));
      setError(sql?"":"Provide a JSON object or a non-empty array of objects.");
      return sql;
    }catch(e){ setError(e.message); return ""; }
  },[input,table]);
  return (
    <VStack>
      <div><Label>Table Name</Label><Input value={table} onChange={setTable} placeholder="users" style={{maxWidth:220}}/></div>
      <ErrorBox msg={error}/>
      <Grid2>
        <JsonEditor value={input} onChange={setInput} label="Input JSON (array of objects)" height={320}/>
        <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Label>SQL INSERT Statements</Label>{output&&<CopyBtn text={output}/>}</div><Textarea value={output} onChange={()=>{}} rows={15} readOnly mono/></div>
      </Grid2>
    </VStack>
  );
}

// �"����� COMPONENT MAP �����������������������������������������������������������������������������������������������������������������������"�
const TOOL_COMPONENTS = {
  "json-formatter":    JsonFormatter,
  "json-minifier":     JsonMinifier,
  "json-validator":    JsonValidator,
  "json-escape":       JsonEscape,
  "json-size":         JsonSize,
  "json-to-csv":       JsonToCsv,
  "csv-to-json":       CsvToJson,
  "json-to-xml":       JsonToXml,
  "xml-to-json":       XmlToJson,
  "json-to-yaml":      JsonToYaml,
  "yaml-to-json":      YamlToJson,
  "json-to-typescript":JsonToTypescript,
  "json-to-table":     JsonToTable,
  "json-to-markdown":  JsonToMarkdown,
  "json-to-env":       JsonToEnv,
  "json-diff":         JsonDiff,
  "json-path":         JsonPathTester,
  "json-schema":       JsonSchema,
  "json-sorter":       JsonSorter,
  "json-flatten":      JsonFlatten,
  "json-unflatten":    JsonUnflatten,
  "json-keys":         JsonKeys,
  "json-merger":       JsonMerger,
  "json-array-tools":  JsonArrayTools,
  "json-query":        JsonQuery,
  "json-repair":       JsonRepair,
  "jsonl-converter":   JsonlConverter,
  "json-to-go":        JsonToGo,
  "json-to-python":    JsonToPython,
  "json-to-sql":       JsonToSql,
};

// �"����� PAGE SHELLS ���������������������������������������������������������������������������������������������������������������������������"�
function Breadcrumb({ tool }) {
  const cat=CATEGORIES.find(c=>c.id===tool.cat);
  return (
    <>
      <nav style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:C.muted,marginBottom:20}}>
        <a href="https://toolsrift.com" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a><span>›</span>
        <a href={`#/category/${tool.cat}`} style={{color:C.muted,textDecoration:"none"}}>{cat?.name}</a><span>›</span>
        <span style={{color:C.text}}>{tool.name}</span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "JSON Tools", "item": "https://toolsrift.com/json" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function FaqSection({ faqs }) {
  if(!faqs?.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Frequently Asked Questions</h2>
      <VStack gap={8}>
        {faqs.map(([q,a],i)=>(
          <details key={i} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8}}>
            <summary style={{padding:"12px 16px",cursor:"pointer",fontSize:13,fontWeight:600,color:C.text,listStyle:"none",display:"flex",justifyContent:"space-between"}}>
              <h3 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:600,margin:0}}>{q}</h3>
              <span style={{color:C.muted}}>+</span>
            </summary>
            <div style={{padding:"0 16px 14px",fontSize:13,color:C.muted,lineHeight:1.7}}>{a}</div>
          </details>
        ))}
      </VStack>
    </section>
  );
}

function RelatedTools({ currentId }) {
  const current=TOOLS.find(t=>t.id===currentId);
  const related=TOOLS.filter(t=>t.id!==currentId&&t.cat===current?.cat).slice(0,4);
  if(!related.length) return null;
  return (
    <section style={{marginTop:32}}>
      <h2 style={{...T.h2,marginBottom:14}}>Related JSON Tools</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"rgba(255,255,255,0.02)",border:`1px solid ${C.border}`,borderRadius:8,textDecoration:"none",transition:"border-color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(16,185,129,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{t.name}</div><div style={{fontSize:11,color:C.muted}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </section>
  );
}

function ToolPage({ toolId }) {
  const tool=TOOLS.find(t=>t.id===toolId);
  const meta=TOOL_META[toolId];
  const ToolComp=TOOL_COMPONENTS[toolId];
  // PHASE 1: All tools free, no gating. Re-enable in Phase 2.
  useEffect(()=>{document.title=meta?.title||`${tool?.name} — Free JSON Tool | ToolsRift`;},[toolId]);
  if(!tool||!ToolComp) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Tool not found. <a href="#/" style={{color:C.amber}}>← Home</a></div>;
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px 60px"}}>
      <Breadcrumb tool={tool}/>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24,gap:16}}>
        <div>
          <h1 style={{...T.h1,marginBottom:6,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28}}>{tool.icon}</span>{tool.name}
          </h1>
          <p style={{fontSize:14,color:C.muted,lineHeight:1.6,maxWidth:640}}>{meta?.desc||tool.desc}</p>
        </div>
        <Badge color="amber">Free</Badge>
      </div>
      <Card className="fade-in"><ToolComp/></Card>
      {meta?.howTo && (
        <div style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.12)', borderRadius:16, padding:'28px 32px', marginBottom:24, marginTop:24 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 12px', fontFamily:"'Sora', sans-serif" }}>📖 How to Use This Tool</h2>
          <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, margin:0 }}>{meta.howTo}</p>
        </div>
      )}
      <FaqSection faqs={meta?.faq}/>
      {meta?.faq && meta.faq.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": meta.faq.map(([q, a]) => ({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": { "@type": "Answer", "text": a }
          }))
        })}} />
      )}
      <RelatedTools currentId={toolId}/>
    </div>
  );
}

function CategoryPage({ catId }) {
  const cat=CATEGORIES.find(c=>c.id===catId);
  const tools=TOOLS.filter(t=>t.cat===catId);
  useEffect(()=>{document.title=`${cat?.name} — Free JSON Tools | ToolsRift`;},[catId]);
  if(!cat) return <div style={{padding:40,textAlign:"center",color:C.muted}}>Not found. <a href="#/" style={{color:C.amber}}>← Home</a></div>;
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 20px 60px"}}>
      <nav style={{fontSize:12,color:C.muted,marginBottom:20}}><a href="#/" style={{color:C.muted,textDecoration:"none"}}>🏠 ToolsRift</a> › <span style={{color:C.text}}>{cat.name}</span></nav>
      <h1 style={{...T.h1,marginBottom:6}}>{cat.icon} {cat.name}</h1>
      <p style={{fontSize:14,color:C.muted,marginBottom:28}}>{cat.desc} — {tools.length} free tools</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{display:"flex",gap:12,padding:"14px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,textDecoration:"none",alignItems:"flex-start",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(16,185,129,0.4)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
            <span style={{fontSize:24,marginTop:2}}>{t.icon}</span>
            <div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{t.name}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.5}}>{t.desc}</div></div>
          </a>
        ))}
      </div>
    </div>
  );
}


const PAGE_THEME = getCategoryById('code');

// DEV badge overlay — shared for dev-focused categories
function DevBadge() {
  return (
    <span style={{
      position:'absolute', top:8, right:8, pointerEvents:'none',
      background:'rgba(16,185,129,0.15)', color:'#10B981',
      fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4,
      letterSpacing:'0.04em', fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}>DEV</span>
  );
}

const JSON_SPECIAL_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .trj-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  @media(max-width:1024px){.trj-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:640px){.trj-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:400px){.trj-grid{grid-template-columns:1fr}}
  /* Dev mono overrides — output areas */
  .trj-tool-area pre,
  .trj-tool-area code,
  .trj-tool-area textarea{
    font-family:'JetBrains Mono',monospace!important;
    font-size:13px!important;
    line-height:1.6!important;
    background:#020817!important;
    border-color:rgba(255,255,255,0.08)!important;
  }
`;

function CategoryHomePage() {
  useEffect(() => { document.title = 'Free JSON Tools Online — ToolsRift'; }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search JSON tools..."
      />
    </CategoryLayout>
  );
}

function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const meta     = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} — Free JSON Tool | ToolsRift`;
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'} tools={TOOLS} subcats={CATEGORIES}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>← Back to JSON Tools</a>
      </div>
    </CategoryLayout>
  );

  const toolData = { id:tool.id, name:tool.name, description:meta?.desc||tool.desc, howTo:meta?.howTo, faq:meta?.faq };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId} tools={TOOLS} subcats={CATEGORIES}>
      <style>{JSON_SPECIAL_CSS}</style>
      {/* .trj-tool-area styles the tools' textarea/pre/code — keep it wrapping the tool. */}
      <div className="trj-tool-area">
        <a href="#/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginTop:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
          onMouseLeave={e => e.currentTarget.style.color='#64748B'}
        >← Back to JSON Tools</a>
        <ToolPageLayout
          theme={PAGE_THEME}
          tool={toolData}
          tools={TOOLS}
          subcats={CATEGORIES}
          related={TOOLS.filter(t => t.id !== tool.id && t.cat === tool.cat).slice(0, 8)}
        >
          <ToolComp />
        </ToolPageLayout>
      </div>
    </CategoryLayout>
  );
}

function ToolsRiftJson() {
  const route = useAppRouter();
  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {route.page === 'home'     && <CategoryHomePage />}
      {route.page === 'tool'     && <ToolDetailPage toolId={route.toolId} />}
      {route.page === 'category' && <CategoryPage catId={route.catId} />}
    </div>
  );
}

export default ToolsRiftJson;
