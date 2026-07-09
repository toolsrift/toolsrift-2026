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
  amber:"#F59E0B", amberD:"#D97706", text:"#E2E8F0", muted:"#64748B",
  blue:"#F59E0B", blueD:"#D97706", green:"#10B981", purple:"#8B5CF6",
  danger:"#EF4444", teal:"#14B8A6", sky:"#0EA5E9",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(245,158,11,0.3)}
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
    primary:{background:`linear-gradient(135deg,${C.blue},${C.blueD})`,color:"#000",boxShadow:"0 2px 8px rgba(245,158,11,0.3)"},
    secondary:{background:"rgba(255,255,255,0.05)",color:C.text,border:`1px solid ${C.border}`},
    ghost:{background:"transparent",color:C.muted},
    danger:{background:"rgba(239,68,68,0.15)",color:"#FCA5A5"},
    blue:{background:`linear-gradient(135deg,${C.blue},#2563EB)`,color:"#fff",boxShadow:"0 2px 8px rgba(59,130,246,0.25)"},
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
                <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.03)`}} onMouseEnter={e=>e.currentTarget.style.background="rgba(245,158,11,0.04)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
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
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(245,158,11,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
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
        <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:16, padding:'28px 32px', marginBottom:24, marginTop:24 }}>
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
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(245,158,11,0.4)";e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="";}}>
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
  .trj-detail{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:16px 0 60px}
  @media(max-width:768px){.trj-detail{grid-template-columns:1fr;padding:16px 0 96px}}
  .trj-sidebar{display:block}
  @media(max-width:768px){.trj-sidebar{display:none}}
  .trj-mobile-bar{display:none}
  @media(max-width:768px){.trj-mobile-bar{display:flex}}
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
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} — Free JSON Tool | ToolsRift`;
    setDrawerOpen(false);
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>← Back to JSON Tools</a>
      </div>
    </CategoryLayout>
  );

  const sidebarTools = TOOLS.filter(t => t.cat === tool.cat);
  const toolData = { name:tool.name, description:meta?.desc||tool.desc, howTo:meta?.howTo, faq:meta?.faq };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <style>{JSON_SPECIAL_CSS}</style>
      <div className="trj-detail">
        <aside className="trj-sidebar">
          <div style={{ position:'sticky', top:72, background:'#0D1117', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                {CATEGORIES.find(c => c.id === tool.cat)?.name || 'Tools'}
              </div>
            </div>
            <div style={{ padding:'8px 0', maxHeight:'calc(100vh - 160px)', overflowY:'auto' }}>
              {sidebarTools.map(t => {
                const isActive = t.id === toolId;
                return (
                  <a key={t.id} href={`#/tool/${t.id}`}
                    style={{ display:'flex', alignItems:'center', gap:10, minHeight:44, padding:'10px 16px', textDecoration:'none', background:isActive?`${acc}18`:'transparent', borderLeft:isActive?`2px solid ${acc}`:'2px solid transparent', transition:'background 0.15s' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
                  >
                    <span style={{ fontSize:15, flexShrink:0 }}>{t.icon}</span>
                    <span style={{ fontSize:13, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', lineHeight:1.3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <div style={{ minWidth:0 }} className="trj-tool-area">
          <a href="#/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.color='#64748B'}
          >← Back to JSON Tools</a>
          <ToolPageLayout theme={PAGE_THEME} tool={toolData}>
            <ToolComp />
          </ToolPageLayout>
        </div>
      </div>

      <div className="trj-mobile-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,9,15,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>{tool.icon} {tool.name}</span>
        <button onClick={() => setDrawerOpen(d => !d)} style={{ background:acc, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:44, flexShrink:0 }}>
          {drawerOpen ? '✕ Close' : '☰ All Tools'}
        </button>
      </div>

      {drawerOpen && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:199, background:'#0D1117', borderTop:`2px solid ${acc}`, maxHeight:'60vh', overflowY:'auto', padding:'8px 0 80px' }}>
          {sidebarTools.map(t => {
            const isActive = t.id === toolId;
            return (
              <a key={t.id} href={`#/tool/${t.id}`} onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', minHeight:52, textDecoration:'none', background:isActive?`${acc}18`:'transparent', borderLeft:isActive?`3px solid ${acc}`:'3px solid transparent' }}
              >
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{ fontSize:14, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.name}</span>
              </a>
            );
          })}
        </div>
      )}
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
