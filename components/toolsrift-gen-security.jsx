import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("hash");
const PAGE_THEME = getCategoryById('generators');
const BRAND = { name: "ToolsRift", tagline: "Security & Data Generators" };

const C = {
bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
blue: "#14B8A6", blueD: "#0D9488",
text: "#E2E8F0", muted: "#64748B",
success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(20,184,166,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} };`;

const T = {
body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "blue" }) {
const map = { blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
const textMap = { blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
return (
<span style={{ background:map[color]||map.blue, color:textMap[color]||textMap.blue, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
{children}
</span>
);
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
const ACCENT = C.blue; const ACCENTD = C.blueD;
const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
const v = {
primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:"0 2px 8px rgba(20,184,166,0.25)" },
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
onFocus={e => e.target.style.borderColor=C.blue} onBlur={e => e.target.style.borderColor=C.border} />
);
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
return (
<textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
onFocus={e => e.target.style.borderColor=C.blue} onBlur={e => e.target.style.borderColor=C.border} />
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
<div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(132,204,22,0.08)", border:"1px solid rgba(132,204,22,0.2)", borderRadius:10 }}>
<div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.blue }}>{value}</div>
<div style={{ ...T.label, marginTop:4 }}>{label}</div>
</div>
);
}

function CopyBtn({ text, style={} }) {
const [copied, setCopied] = useState(false);
const [errMsg, setErrMsg] = useState(null);
const copy = () => {
navigator.clipboard.writeText(text || "").then(() => {
  setCopied(true); setErrMsg(null); setTimeout(() => setCopied(false), 2000);
}).catch(() => { setErrMsg("Copy failed — please select and copy manually."); setTimeout(() => setErrMsg(null), 3000); });
};
if (errMsg) return <span style={{fontSize:12,color:'#EF4444'}}>{errMsg}</span>;
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
<div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.blue }}>{value}</div>
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

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPick = arr => arr[Math.floor(Math.random() * arr.length)];
const downloadText = (filename, content, type="text/plain;charset=utf-8") => {
const blob = new Blob([content], { type });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
};
const bytesToHex = bytes => Array.from(bytes).map(b=>b.toString(16).padStart(2,"0")).join("");
const bytesToBase64 = bytes => btoa(String.fromCharCode(...bytes));
const safeCryptoBytes = (n) => {
const arr = new Uint8Array(n);
crypto.getRandomValues(arr);
return arr;
};
const uuidv4 = () => {
const b = safeCryptoBytes(16);
b[6] = (b[6] & 0x0f) | 0x40;
b[8] = (b[8] & 0x3f) | 0x80;
const h = bytesToHex(b);
return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
};

// ---------- Generation helpers ----------
const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?",
};
function buildCharset({ upper, lower, digits, symbols, excludeAmbiguous }) {
  let cs = "";
  if (upper) cs += CHARSETS.upper;
  if (lower) cs += CHARSETS.lower;
  if (digits) cs += CHARSETS.digits;
  if (symbols) cs += CHARSETS.symbols;
  if (excludeAmbiguous) cs = cs.split("").filter(c => !"Il1O0o".includes(c)).join("");
  return cs;
}
function pickFromCharset(len, cs) {
  if (!cs || len <= 0) return "";
  const bytes = safeCryptoBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += cs[bytes[i] % cs.length];
  return out;
}
function passwordStrength(pw, charsetSize) {
  if (!pw) return { label: "—", color: "blue", pct: 0 };
  const entropy = pw.length * Math.log2(Math.max(charsetSize, 2));
  if (entropy < 40) return { label: "Weak", color: "red", pct: 25 };
  if (entropy < 60) return { label: "Fair", color: "amber", pct: 55 };
  if (entropy < 80) return { label: "Good", color: "blue", pct: 78 };
  return { label: "Strong", color: "green", pct: 100 };
}
const PASSPHRASE_WORDS = ["apple","river","stone","cloud","tiger","maple","ocean","planet","forest","ember","silver","garden","meadow","harbor","copper","velvet","cactus","falcon","willow","pebble","cobalt","nebula","orchid","summit","breeze","canyon","marble","lantern","thunder","glacier","harvest","jasmine","kettle","lemon","mango","noble","olive","pixel","quartz","raven","saddle","tundra","umbra","violet","walnut","yonder","zephyr","anchor","beacon","cedar","dolphin","echo","frost","grove","hazel","indigo","juniper","kernel","lagoon","meteor"];

function Check({ label, checked, onChange }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text, userSelect:"none" }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ accentColor:C.blue, width:16, height:16 }} />
      {label}
    </label>
  );
}
function NumberField({ value, onChange, min, max, step=1 }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(e.target.value)}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"'JetBrains Mono',monospace", outline:"none" }}
      onFocus={e => e.target.style.borderColor=C.blue} onBlur={e => e.target.style.borderColor=C.border} />
  );
}
function OutputBox({ text, onRegen, filename, download=false, label }) {
  return (
    <VStack gap={8}>
      {label && <Label>{label}</Label>}
      <Result>{text || "—"}</Result>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <CopyBtn text={text} />
        {onRegen && <Btn variant="secondary" size="sm" onClick={onRegen}>↻ Regenerate</Btn>}
        {download && <Btn variant="secondary" size="sm" onClick={() => downloadText(filename || "output.txt", text)}>Download</Btn>}
      </div>
    </VStack>
  );
}

function StrongPasswordGen() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excl, setExcl] = useState(false);
  const [out, setOut] = useState("");
  const opts = { upper, lower, digits, symbols, excludeAmbiguous: excl };
  const cs = buildCharset(opts);
  const gen = useCallback(() => {
    const c = buildCharset({ upper, lower, digits, symbols, excludeAmbiguous: excl });
    setOut(pickFromCharset(Math.max(4, Math.min(128, Number(length) || 16)), c));
  }, [length, upper, lower, digits, symbols, excl]);
  useEffect(() => { gen(); }, [gen]);
  const st = passwordStrength(out, cs.length);
  return (
    <VStack>
      <div><Label>Length: {length}</Label>
        <input type="range" min={4} max={64} value={length} onChange={e => setLength(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} />
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:16 }}>
        <Check label="Uppercase (A-Z)" checked={upper} onChange={setUpper} />
        <Check label="Lowercase (a-z)" checked={lower} onChange={setLower} />
        <Check label="Digits (0-9)" checked={digits} onChange={setDigits} />
        <Check label="Symbols (!@#)" checked={symbols} onChange={setSymbols} />
        <Check label="Exclude ambiguous" checked={excl} onChange={setExcl} />
      </div>
      {cs.length === 0 && <div style={{ color:C.warn, fontSize:12 }}>Select at least one character set.</div>}
      <OutputBox text={out} onRegen={gen} />
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
          <div style={{ width:`${st.pct}%`, height:"100%", background: st.color==="red"?C.danger:st.color==="amber"?C.warn:st.color==="green"?C.success:C.blue, transition:"width .2s" }} />
        </div>
        <Badge color={st.color}>{st.label}</Badge>
      </div>
    </VStack>
  );
}

function PassphraseGen() {
  const [count, setCount] = useState(4);
  const [sep, setSep] = useState("-");
  const [cap, setCap] = useState(true);
  const [addNum, setAddNum] = useState(true);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(2, Math.min(12, Number(count) || 4));
    const bytes = safeCryptoBytes(n);
    let words = [];
    for (let i = 0; i < n; i++) {
      let w = PASSPHRASE_WORDS[bytes[i] % PASSPHRASE_WORDS.length];
      if (cap) w = w.charAt(0).toUpperCase() + w.slice(1);
      words.push(w);
    }
    let phrase = words.join(sep === "space" ? " " : sep);
    if (addNum) phrase += (sep === "space" ? " " : sep) + randInt(10, 99);
    setOut(phrase);
  }, [count, sep, cap, addNum]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Word count</Label><NumberField value={count} onChange={setCount} min={2} max={12} /></div>
        <div><Label>Separator</Label><SelectInput value={sep} onChange={setSep} options={[{value:"-",label:"Hyphen (-)"},{value:".",label:"Dot (.)"},{value:"_",label:"Underscore (_)"},{value:"space",label:"Space"}]} style={{ width:"100%" }} /></div>
      </Grid2>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <Check label="Capitalize words" checked={cap} onChange={setCap} />
        <Check label="Append number" checked={addNum} onChange={setAddNum} />
      </div>
      <OutputBox text={out} onRegen={gen} />
    </VStack>
  );
}

function PinGen() {
  const [len, setLen] = useState("4");
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Number(len);
    const bytes = safeCryptoBytes(n);
    let pin = "";
    for (let i = 0; i < n; i++) pin += (bytes[i] % 10).toString();
    setOut(pin);
  }, [len]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <div><Label>PIN length</Label><SelectInput value={len} onChange={setLen} options={[{value:"4",label:"4 digits"},{value:"6",label:"6 digits"},{value:"8",label:"8 digits"}]} style={{ width:"100%" }} /></div>
      <OutputBox text={out} onRegen={gen} />
    </VStack>
  );
}

function ApiKeyGen() {
  const [format, setFormat] = useState("hex");
  const [prefix, setPrefix] = useState("sk");
  const [len, setLen] = useState(32);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(8, Math.min(128, Number(len) || 32));
    let key = "";
    if (format === "hex") key = bytesToHex(safeCryptoBytes(Math.ceil(n / 2))).slice(0, n);
    else if (format === "base64") key = bytesToBase64(safeCryptoBytes(n)).replace(/[+/=]/g, "").slice(0, n);
    else if (format === "uuid") key = uuidv4();
    else if (format === "prefixed") key = `${prefix || "sk"}_${bytesToHex(safeCryptoBytes(Math.ceil(n / 2))).slice(0, n)}`;
    setOut(key);
  }, [format, prefix, len]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Format</Label><SelectInput value={format} onChange={setFormat} options={[{value:"hex",label:"Hex"},{value:"base64",label:"Base64 (URL-safe)"},{value:"uuid",label:"UUID v4"},{value:"prefixed",label:"Prefixed (sk_...)"}]} style={{ width:"100%" }} /></div>
        {format === "prefixed"
          ? <div><Label>Prefix</Label><Input value={prefix} onChange={setPrefix} placeholder="sk" /></div>
          : format !== "uuid" ? <div><Label>Length</Label><NumberField value={len} onChange={setLen} min={8} max={128} /></div> : <div />}
      </Grid2>
      <OutputBox text={out} onRegen={gen} />
    </VStack>
  );
}

function EncryptionKeyGen() {
  const [bits, setBits] = useState("256");
  const [fmt, setFmt] = useState("hex");
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const nbytes = Number(bits) / 8;
    const bytes = safeCryptoBytes(nbytes);
    setOut(fmt === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes));
  }, [bits, fmt]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Key size</Label><SelectInput value={bits} onChange={setBits} options={[{value:"128",label:"128-bit (AES-128)"},{value:"192",label:"192-bit (AES-192)"},{value:"256",label:"256-bit (AES-256)"},{value:"512",label:"512-bit"}]} style={{ width:"100%" }} /></div>
        <div><Label>Output format</Label><SelectInput value={fmt} onChange={setFmt} options={[{value:"hex",label:"Hex"},{value:"base64",label:"Base64"}]} style={{ width:"100%" }} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} />
    </VStack>
  );
}

function BulkPasswordGen() {
  const [count, setCount] = useState(10);
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const cs = buildCharset({ upper, lower, digits, symbols, excludeAmbiguous: false });
    if (!cs) { setOut(""); return; }
    const n = Math.max(1, Math.min(500, Number(count) || 10));
    const l = Math.max(4, Math.min(128, Number(length) || 16));
    setOut(Array.from({ length: n }, () => pickFromCharset(l, cs)).join("\n"));
  }, [count, length, upper, lower, digits, symbols]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
        <div><Label>Length each</Label><NumberField value={length} onChange={setLength} min={4} max={128} /></div>
      </Grid2>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <Check label="A-Z" checked={upper} onChange={setUpper} />
        <Check label="a-z" checked={lower} onChange={setLower} />
        <Check label="0-9" checked={digits} onChange={setDigits} />
        <Check label="Symbols" checked={symbols} onChange={setSymbols} />
      </div>
      <OutputBox text={out} onRegen={gen} download filename="passwords.txt" />
    </VStack>
  );
}

function UuidGen() {
  const [count, setCount] = useState(1);
  const [upper, setUpper] = useState(false);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 1));
    let list = Array.from({ length: n }, () => uuidv4());
    if (upper) list = list.map(u => u.toUpperCase());
    setOut(list.join("\n"));
  }, [count, upper]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
        <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:8 }}><Check label="Uppercase" checked={upper} onChange={setUpper} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="uuids.txt" />
    </VStack>
  );
}

function GuidGen() {
  const [count, setCount] = useState(1);
  const [braces, setBraces] = useState(true);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 1));
    setOut(Array.from({ length: n }, () => {
      const g = uuidv4().toUpperCase();
      return braces ? `{${g}}` : g;
    }).join("\n"));
  }, [count, braces]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
        <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:8 }}><Check label="Wrap in braces { }" checked={braces} onChange={setBraces} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="guids.txt" />
    </VStack>
  );
}

function NanoidGen() {
  const DEFAULT_AB = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
  const [len, setLen] = useState(21);
  const [alphabet, setAlphabet] = useState(DEFAULT_AB);
  const [count, setCount] = useState(1);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const ab = alphabet || DEFAULT_AB;
    const l = Math.max(1, Math.min(128, Number(len) || 21));
    const n = Math.max(1, Math.min(500, Number(count) || 1));
    setOut(Array.from({ length: n }, () => pickFromCharset(l, ab)).join("\n"));
  }, [len, alphabet, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Length</Label><NumberField value={len} onChange={setLen} min={1} max={128} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <div><Label>Alphabet</Label><Input value={alphabet} onChange={setAlphabet} placeholder={DEFAULT_AB} /></div>
      <OutputBox text={out} onRegen={gen} download filename="nanoids.txt" />
    </VStack>
  );
}

function RandomNumberGen() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [mode, setMode] = useState("int");
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    let lo = Number(min), hi = Number(max);
    if (isNaN(lo) || isNaN(hi)) { setOut("Enter valid numbers"); return; }
    if (lo > hi) { const t = lo; lo = hi; hi = t; }
    const n = Math.max(1, Math.min(1000, Number(count) || 1));
    const vals = [];
    for (let i = 0; i < n; i++) {
      const r = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      vals.push(mode === "int" ? Math.floor(r * (hi - lo + 1)) + lo : (r * (hi - lo) + lo).toFixed(4));
    }
    setOut(vals.join(", "));
  }, [min, max, count, mode]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Min</Label><NumberField value={min} onChange={setMin} /></div>
        <div><Label>Max</Label><NumberField value={max} onChange={setMax} /></div>
        <div><Label>Count</Label><NumberField value={count} onChange={setCount} min={1} max={1000} /></div>
      </Grid3>
      <div><Label>Type</Label><SelectInput value={mode} onChange={setMode} options={[{value:"int",label:"Integer"},{value:"dec",label:"Decimal"}]} style={{ width:"100%" }} /></div>
      <OutputBox text={out} onRegen={gen} />
    </VStack>
  );
}

function RandomStringGen() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const cs = buildCharset({ upper, lower, digits, symbols, excludeAmbiguous: false });
    if (!cs) { setOut(""); return; }
    const l = Math.max(1, Math.min(256, Number(length) || 16));
    const n = Math.max(1, Math.min(500, Number(count) || 1));
    setOut(Array.from({ length: n }, () => pickFromCharset(l, cs)).join("\n"));
  }, [length, count, upper, lower, digits, symbols]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Length</Label><NumberField value={length} onChange={setLength} min={1} max={256} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        <Check label="A-Z" checked={upper} onChange={setUpper} />
        <Check label="a-z" checked={lower} onChange={setLower} />
        <Check label="0-9" checked={digits} onChange={setDigits} />
        <Check label="Symbols" checked={symbols} onChange={setSymbols} />
      </div>
      <OutputBox text={out} onRegen={gen} download filename="strings.txt" />
    </VStack>
  );
}

function RandomHexGen() {
  const [bytesLen, setBytesLen] = useState(16);
  const [count, setCount] = useState(1);
  const [upper, setUpper] = useState(false);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const b = Math.max(1, Math.min(256, Number(bytesLen) || 16));
    const n = Math.max(1, Math.min(500, Number(count) || 1));
    setOut(Array.from({ length: n }, () => {
      const h = bytesToHex(safeCryptoBytes(b));
      return upper ? h.toUpperCase() : h;
    }).join("\n"));
  }, [bytesLen, count, upper]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Bytes (→ {Number(bytesLen)*2||0} hex chars)</Label><NumberField value={bytesLen} onChange={setBytesLen} min={1} max={256} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <Check label="Uppercase" checked={upper} onChange={setUpper} />
      <OutputBox text={out} onRegen={gen} download filename="hex.txt" />
    </VStack>
  );
}

function SerialNumberGen() {
  const [prefix, setPrefix] = useState("TR");
  const [segments, setSegments] = useState(2);
  const [segLen, setSegLen] = useState(4);
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const cs = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const gen = useCallback(() => {
    const segN = Math.max(1, Math.min(8, Number(segments) || 2));
    const segL = Math.max(2, Math.min(12, Number(segLen) || 4));
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => {
      const parts = Array.from({ length: segN }, () => pickFromCharset(segL, cs));
      return `${prefix ? prefix + "-" : ""}${parts.join("-")}`;
    }).join("\n"));
  }, [prefix, segments, segLen, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Prefix</Label><Input value={prefix} onChange={setPrefix} placeholder="TR" /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Segments</Label><NumberField value={segments} onChange={setSegments} min={1} max={8} /></div>
        <div><Label>Chars per segment</Label><NumberField value={segLen} onChange={setSegLen} min={2} max={12} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="serials.txt" />
    </VStack>
  );
}

function CuidGen() {
  const [count, setCount] = useState(1);
  const [out, setOut] = useState("");
  const one = () => `c${Date.now().toString(36)}${bytesToHex(safeCryptoBytes(6))}${pickFromCharset(4, "0123456789abcdefghijklmnopqrstuvwxyz")}`;
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 1));
    setOut(Array.from({ length: n }, one).join("\n"));
  }, [count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      <OutputBox text={out} onRegen={gen} download filename="cuids.txt" />
    </VStack>
  );
}

const HASHID_AB = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
function shuffleAlphabet(alphabet, salt) {
  const a = alphabet.split("");
  if (!salt) return a.join("");
  for (let i = a.length - 1, v = 0, p = 0; i > 0; i--, v++) {
    v %= salt.length;
    const int = salt.charCodeAt(v);
    p += int;
    const j = (int + v + p) % i;
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a.join("");
}
function hashidEncode(num, salt, minLen) {
  let n = Math.floor(Number(num));
  if (!Number.isFinite(n) || n < 0) return "";
  const ab = shuffleAlphabet(HASHID_AB, salt);
  let out = "";
  if (n === 0) out = ab[0];
  while (n > 0) { out = ab[n % ab.length] + out; n = Math.floor(n / ab.length); }
  const ml = Math.max(0, Math.min(32, Number(minLen) || 0));
  while (out.length < ml) out = ab[(out.length + salt.length) % ab.length] + out;
  return out;
}
function HashIdGen() {
  const [num, setNum] = useState(12345);
  const [salt, setSalt] = useState("toolsrift");
  const [minLen, setMinLen] = useState(6);
  const out = hashidEncode(num, salt, minLen);
  return (
    <VStack>
      <Grid3>
        <div><Label>Number</Label><NumberField value={num} onChange={setNum} min={0} /></div>
        <div><Label>Salt</Label><Input value={salt} onChange={setSalt} placeholder="salt" /></div>
        <div><Label>Min length</Label><NumberField value={minLen} onChange={setMinLen} min={0} max={32} /></div>
      </Grid3>
      <OutputBox text={out} label="Encoded Hash ID" />
      <div style={{ fontSize:11, color:C.muted }}>Deterministic: the same number + salt always produces the same ID.</div>
    </VStack>
  );
}

// ---------- Fake data ----------
const FN_MALE = ["James","John","Robert","Michael","William","David","Daniel","Matthew","Anthony","Mark","Aarav","Vivaan","Aditya","Rohan","Liam","Noah","Lucas","Mateo","Hiroshi","Omar"];
const FN_FEMALE = ["Mary","Patricia","Jennifer","Linda","Elizabeth","Jessica","Sarah","Emily","Emma","Olivia","Priya","Ananya","Diya","Aisha","Sophia","Isabella","Mia","Amara","Yuki","Fatima"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Patel","Sharma","Kumar","Singh","Khan","Nguyen","Wang","Chen","Taylor","Anderson"];
const EMAIL_DOMAINS = ["example.com","mail.com","test.dev","inbox.co","demo.io","sample.net"];
const ADDR = {
  US: { streets:["Main St","Oak Ave","Maple Dr","Elm St","Cedar Ln","Pine Rd","Park Ave"], cities:["Springfield","Franklin","Clinton","Georgetown","Madison","Riverside"], regions:["CA","NY","TX","FL","IL","WA"], zip:()=>String(randInt(10000,99999)) },
  UK: { streets:["High St","Church Rd","Station Rd","Victoria Rd","Kings Rd","Queens Ave"], cities:["London","Manchester","Bristol","Leeds","Liverpool","Sheffield"], regions:["England","Scotland","Wales"], zip:()=>`${randPick(["SW","NW","EC","M","B","LS"])}${randInt(1,9)} ${randInt(1,9)}${randPick(["AA","BB","ZX","QP"])}` },
  IN: { streets:["MG Road","Gandhi Nagar","Nehru St","Park St","Ring Rd","Church St"], cities:["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Pune"], regions:["Maharashtra","Karnataka","Telangana","Tamil Nadu","Delhi"], zip:()=>String(randInt(100000,999999)) },
};
const PHONE_FMT = {
  US: () => `+1 (${randInt(200,999)}) ${randInt(200,999)}-${String(randInt(0,9999)).padStart(4,"0")}`,
  UK: () => `+44 7${randInt(100,999)} ${String(randInt(0,999999)).padStart(6,"0")}`,
  IN: () => `+91 ${randInt(70,99)}${String(randInt(0,99999999)).padStart(8,"0")}`,
  AU: () => `+61 4${randInt(10,99)} ${String(randInt(100,999))} ${String(randInt(100,999))}`,
};
const COUNTRIES = [
  { name:"United States", code:"US", capital:"Washington, D.C.", currency:"USD" },
  { name:"United Kingdom", code:"GB", capital:"London", currency:"GBP" },
  { name:"India", code:"IN", capital:"New Delhi", currency:"INR" },
  { name:"Canada", code:"CA", capital:"Ottawa", currency:"CAD" },
  { name:"Australia", code:"AU", capital:"Canberra", currency:"AUD" },
  { name:"Germany", code:"DE", capital:"Berlin", currency:"EUR" },
  { name:"France", code:"FR", capital:"Paris", currency:"EUR" },
  { name:"Japan", code:"JP", capital:"Tokyo", currency:"JPY" },
  { name:"Brazil", code:"BR", capital:"Brasília", currency:"BRL" },
  { name:"South Africa", code:"ZA", capital:"Pretoria", currency:"ZAR" },
  { name:"Mexico", code:"MX", capital:"Mexico City", currency:"MXN" },
  { name:"Italy", code:"IT", capital:"Rome", currency:"EUR" },
  { name:"Spain", code:"ES", capital:"Madrid", currency:"EUR" },
  { name:"Netherlands", code:"NL", capital:"Amsterdam", currency:"EUR" },
  { name:"Sweden", code:"SE", capital:"Stockholm", currency:"SEK" },
  { name:"Singapore", code:"SG", capital:"Singapore", currency:"SGD" },
  { name:"United Arab Emirates", code:"AE", capital:"Abu Dhabi", currency:"AED" },
  { name:"South Korea", code:"KR", capital:"Seoul", currency:"KRW" },
];
const fakeName = (gender) => {
  const first = gender === "male" ? randPick(FN_MALE) : gender === "female" ? randPick(FN_FEMALE) : randPick([...FN_MALE, ...FN_FEMALE]);
  return `${first} ${randPick(LAST)}`;
};

function FakeNameGen() {
  const [gender, setGender] = useState("any");
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => fakeName(gender)).join("\n"));
  }, [gender, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Gender</Label><SelectInput value={gender} onChange={setGender} options={[{value:"any",label:"Any"},{value:"male",label:"Male"},{value:"female",label:"Female"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="names.txt" />
    </VStack>
  );
}

function FakeAddressGen() {
  const [country, setCountry] = useState("US");
  const [count, setCount] = useState(3);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const c = ADDR[country] || ADDR.US;
    const n = Math.max(1, Math.min(200, Number(count) || 3));
    setOut(Array.from({ length: n }, () => `${randInt(1,9999)} ${randPick(c.streets)}, ${randPick(c.cities)}, ${randPick(c.regions)} ${c.zip()}`).join("\n"));
  }, [country, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Country</Label><SelectInput value={country} onChange={setCountry} options={[{value:"US",label:"United States"},{value:"UK",label:"United Kingdom"},{value:"IN",label:"India"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={200} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="addresses.txt" />
    </VStack>
  );
}

function FakeEmailGen() {
  const [style, setStyle] = useState("name");
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => {
      const fn = randPick([...FN_MALE, ...FN_FEMALE]).toLowerCase();
      const ln = randPick(LAST).toLowerCase();
      let local;
      if (style === "name") local = `${fn}.${ln}`;
      else if (style === "initial") local = `${fn[0]}${ln}`;
      else local = `${fn}${randInt(10,9999)}`;
      return `${local}@${randPick(EMAIL_DOMAINS)}`;
    }).join("\n"));
  }, [style, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Style</Label><SelectInput value={style} onChange={setStyle} options={[{value:"name",label:"first.last"},{value:"initial",label:"flast"},{value:"random",label:"name+number"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="emails.txt" />
    </VStack>
  );
}

function FakePhoneGen() {
  const [country, setCountry] = useState("US");
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const fmt = PHONE_FMT[country] || PHONE_FMT.US;
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => fmt()).join("\n"));
  }, [country, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Country</Label><SelectInput value={country} onChange={setCountry} options={[{value:"US",label:"United States"},{value:"UK",label:"United Kingdom"},{value:"IN",label:"India"},{value:"AU",label:"Australia"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="phones.txt" />
    </VStack>
  );
}

function FakeIpGen() {
  const [ver, setVer] = useState("v4");
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => {
      if (ver === "v4") return Array.from({ length: 4 }, () => randInt(0, 255)).join(".");
      return Array.from({ length: 8 }, () => bytesToHex(safeCryptoBytes(2))).join(":");
    }).join("\n"));
  }, [ver, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Version</Label><SelectInput value={ver} onChange={setVer} options={[{value:"v4",label:"IPv4"},{value:"v6",label:"IPv6"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="ips.txt" />
    </VStack>
  );
}

function FakeMacGen() {
  const [fmt, setFmt] = useState("colon");
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => {
      const parts = Array.from({ length: 6 }, () => bytesToHex(safeCryptoBytes(1)).toUpperCase());
      if (fmt === "colon") return parts.join(":");
      if (fmt === "dash") return parts.join("-");
      return parts.join("").replace(/(.{4})(?=.)/g, "$1.");
    }).join("\n"));
  }, [fmt, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Format</Label><SelectInput value={fmt} onChange={setFmt} options={[{value:"colon",label:"Colon (AA:BB:...)"},{value:"dash",label:"Dash (AA-BB-...)"},{value:"dot",label:"Dot (AABB.CCDD...)"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="macs.txt" />
    </VStack>
  );
}

function FakeDateGen() {
  const [start, setStart] = useState("2000-01-01");
  const [end, setEnd] = useState("2025-12-31");
  const [fmt, setFmt] = useState("iso");
  const [count, setCount] = useState(5);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const s = new Date(start).getTime(), e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) { setOut("Enter valid dates"); return; }
    const lo = Math.min(s, e), hi = Math.max(s, e);
    const n = Math.max(1, Math.min(500, Number(count) || 5));
    setOut(Array.from({ length: n }, () => {
      const d = new Date(lo + Math.random() * (hi - lo));
      if (fmt === "iso") return d.toISOString().slice(0, 10);
      if (fmt === "us") return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`;
      if (fmt === "eu") return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
      return d.toDateString();
    }).join("\n"));
  }, [start, end, fmt, count]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Start date</Label><Input value={start} onChange={setStart} placeholder="2000-01-01" /></div>
        <div><Label>End date</Label><Input value={end} onChange={setEnd} placeholder="2025-12-31" /></div>
      </Grid2>
      <Grid2>
        <div><Label>Format</Label><SelectInput value={fmt} onChange={setFmt} options={[{value:"iso",label:"ISO (YYYY-MM-DD)"},{value:"us",label:"US (MM/DD/YYYY)"},{value:"eu",label:"EU (DD/MM/YYYY)"},{value:"long",label:"Long (Mon DD YYYY)"}]} style={{ width:"100%" }} /></div>
        <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={500} /></div>
      </Grid2>
      <OutputBox text={out} onRegen={gen} download filename="dates.txt" />
    </VStack>
  );
}

function FakeDataBulk() {
  const [rows, setRows] = useState(10);
  const [out, setOut] = useState("");
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(500, Number(rows) || 10));
    const header = "name,email,phone,city,country";
    const lines = Array.from({ length: n }, () => {
      const name = fakeName("any");
      const email = `${name.toLowerCase().replace(/[^a-z]/g, ".")}@${randPick(EMAIL_DOMAINS)}`;
      const country = randPick(COUNTRIES);
      const addr = ADDR[country.code === "GB" ? "UK" : (ADDR[country.code] ? country.code : "US")] || ADDR.US;
      const phone = (PHONE_FMT[country.code] || PHONE_FMT.US)();
      return `"${name}","${email}","${phone}","${randPick(addr.cities)}","${country.name}"`;
    });
    setOut([header, ...lines].join("\n"));
  }, [rows]);
  useEffect(() => { gen(); }, [gen]);
  return (
    <VStack>
      <div><Label>Rows</Label><NumberField value={rows} onChange={setRows} min={1} max={500} /></div>
      <OutputBox text={out} onRegen={gen} download filename="fake-data.csv" label="CSV output" />
    </VStack>
  );
}

function RandomCountryGen() {
  const [count, setCount] = useState(1);
  const [picks, setPicks] = useState([]);
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(COUNTRIES.length, Number(count) || 1));
    const pool = [...COUNTRIES];
    const chosen = [];
    for (let i = 0; i < n && pool.length; i++) chosen.push(pool.splice(randInt(0, pool.length - 1), 1)[0]);
    setPicks(chosen);
  }, [count]);
  useEffect(() => { gen(); }, [gen]);
  const asText = picks.map(c => `${c.name} — ${c.code} — Capital: ${c.capital} — Currency: ${c.currency}`).join("\n");
  return (
    <VStack>
      <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={COUNTRIES.length} /></div>
      <VStack gap={8}>
        {picks.map((c, i) => (
          <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:10, background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", flexWrap:"wrap" }}>
            <span style={{ fontWeight:700, color:C.text }}>{c.name} <Badge color="blue">{c.code}</Badge></span>
            <span style={{ color:C.muted, fontSize:12 }}>Capital: {c.capital} · Currency: {c.currency}</span>
          </div>
        ))}
      </VStack>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <CopyBtn text={asText} />
        <Btn variant="secondary" size="sm" onClick={gen}>↻ Regenerate</Btn>
      </div>
    </VStack>
  );
}

function RandomColorGen() {
  const [count, setCount] = useState(6);
  const [colors, setColors] = useState([]);
  const gen = useCallback(() => {
    const n = Math.max(1, Math.min(60, Number(count) || 6));
    setColors(Array.from({ length: n }, () => {
      const r = randInt(0, 255), g = randInt(0, 255), b = randInt(0, 255);
      const hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
      const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255, l = (max + min) / 2;
      let h = 0, s = 0;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        const rr = r/255, gg = g/255, bb = b/255;
        if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0));
        else if (max === gg) h = (bb - rr) / d + 2;
        else h = (rr - gg) / d + 4;
        h *= 60;
      }
      return { hex, rgb:`rgb(${r}, ${g}, ${b})`, hsl:`hsl(${Math.round(h)}, ${Math.round(s*100)}%, ${Math.round(l*100)}%)` };
    }));
  }, [count]);
  useEffect(() => { gen(); }, [gen]);
  const asText = colors.map(c => `${c.hex}  ${c.rgb}  ${c.hsl}`).join("\n");
  return (
    <VStack>
      <div><Label>How many</Label><NumberField value={count} onChange={setCount} min={1} max={60} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
        {colors.map((c, i) => (
          <div key={i} style={{ border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
            <div style={{ height:56, background:c.hex }} />
            <div style={{ padding:"8px 10px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.text }}>
              <div>{c.hex}</div>
              <div style={{ color:C.muted }}>{c.rgb}</div>
              <div style={{ color:C.muted }}>{c.hsl}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <CopyBtn text={asText} />
        <Btn variant="secondary" size="sm" onClick={gen}>↻ Regenerate</Btn>
      </div>
    </VStack>
  );
}

const TOOLS = [
{ id:"strong-password-gen", cat:"security", name:"Strong Password Generator", desc:"Generate secure strong passwords online with length, symbols, and ambiguous character controls for safer account protection.", icon:"🔐", free:true },
{ id:"passphrase-gen", cat:"security", name:"Passphrase Generator", desc:"Create memorable passphrases online with customizable word count and separators for secure yet human-friendly authentication.", icon:"🗝️", free:true },
{ id:"pin-gen", cat:"security", name:"PIN Generator", desc:"Generate random numeric PIN codes online in 4, 6, or 8 digits with instant strength rating for secure lock and OTP usage.", icon:"🔢", free:true },
{ id:"api-key-gen", cat:"security", name:"API Key Generator", desc:"Create random API keys online in hex, UUID, and base58 formats for secure application authentication and integration testing.", icon:"🧪", free:true },
{ id:"encryption-key-gen", cat:"security", name:"Encryption Key Generator", desc:"Generate AES, RSA-sized, and random encryption key material online in hex or base64 for secure cryptography workflows.", icon:"🛡️", free:true },
{ id:"bulk-password-gen", cat:"security", name:"Bulk Password Generator", desc:"Generate multiple secure passwords in bulk online with custom policy controls and quick export for teams and admin tasks.", icon:"📦", free:true },

{ id:"uuid-gen", cat:"ids", name:"UUID Generator", desc:"Generate UUID v4 values online in single or bulk mode with one-click copy for IDs, databases, and distributed systems.", icon:"🧬", free:true },
{ id:"guid-gen", cat:"ids", name:"GUID Generator", desc:"Create Windows-style GUID strings online with optional braces for .NET apps, registries, and enterprise integrations.", icon:"🧷", free:true },
{ id:"nanoid-gen", cat:"ids", name:"Nano ID Generator", desc:"Generate compact Nano IDs online with custom alphabet and length for short unique identifiers in modern web applications.", icon:"🧵", free:true },
{ id:"random-number-gen", cat:"ids", name:"Random Number Generator", desc:"Generate random integers or decimals online within custom min-max range, including bulk output for testing and simulations.", icon:"🎲", free:true },
{ id:"random-string-gen", cat:"ids", name:"Random String Generator", desc:"Create random strings online using custom charset and length settings for tokens, mock data, and secure placeholders.", icon:"🔤", free:true },
{ id:"random-hex-gen", cat:"ids", name:"Random Hex Generator", desc:"Generate random hexadecimal strings online with flexible length for IDs, seeds, salts, and technical testing workflows.", icon:"🧱", free:true },
{ id:"serial-number-gen", cat:"ids", name:"Serial Number Generator", desc:"Generate serial numbers online with custom prefix and format patterns like TR-XXXX-YYYY for products and inventory.", icon:"🏷️", free:true },
{ id:"cuid-gen", cat:"ids", name:"CUID Generator", desc:"Create collision-resistant CUID identifiers online for scalable apps that require readable and unique IDs across clients.", icon:"🧰", free:true },
{ id:"hash-id-gen", cat:"ids", name:"Hash ID Generator", desc:"Encode numbers into short hash IDs online using hashids-style alphabet mapping for cleaner URLs and public identifiers.", icon:"🔑", free:true },

// TODO: QR tools need a vetted encoder — removed until a correct client-side QR encoder is vendored.

{ id:"fake-name-gen", cat:"fakedata", name:"Fake Name Generator", desc:"Generate realistic fake names online by gender and locale for testing forms, demos, and privacy-safe mock datasets.", icon:"🧍", free:true },
{ id:"fake-address-gen", cat:"fakedata", name:"Fake Address Generator", desc:"Create fake addresses online for US, UK, and IN with city, region, and postal formats for QA and sample records.", icon:"📍", free:true },
{ id:"fake-email-gen", cat:"fakedata", name:"Fake Email Generator", desc:"Generate fake email addresses online in multiple naming styles for mock accounts, testing pipelines, and UX prototypes.", icon:"📧", free:true },
{ id:"fake-phone-gen", cat:"fakedata", name:"Fake Phone Generator", desc:"Generate fake phone numbers online in US, UK, IN, and AU formats for realistic test data and validation scenarios.", icon:"☎️", free:true },
{ id:"fake-ip-gen", cat:"fakedata", name:"Fake IP Generator", desc:"Create random IPv4 and IPv6 addresses online for networking examples, logs, and synthetic security testing datasets.", icon:"🛰️", free:true },
{ id:"fake-mac-gen", cat:"fakedata", name:"Fake MAC Generator", desc:"Generate random MAC addresses online in colon, dash, and dot formats for labs, documentation, and parser testing.", icon:"💻", free:true },
{ id:"fake-date-gen", cat:"fakedata", name:"Fake Date Generator", desc:"Generate random dates online within custom ranges and formats for testing schedules, reports, and seed datasets.", icon:"📅", free:true },
{ id:"fake-data-bulk", cat:"fakedata", name:"Bulk Fake Data Generator", desc:"Generate bulk fake data rows online with name, email, phone, and address and export as CSV for QA and dev workflows.", icon:"📊", free:true },
{ id:"random-country-gen", cat:"fakedata", name:"Random Country Generator", desc:"Generate random country data online including ISO code, capital, and currency for localization and mock dashboards.", icon:"🌍", free:true },
{ id:"random-color-gen", cat:"fakedata", name:"Random Color Generator", desc:"Generate random colors online in HEX, RGB, and HSL with preview swatch for design systems, mocks, and palettes.", icon:"🎨", free:true },
{ id:"totp-secret-gen", cat:"security", name:"2FA / TOTP Secret Generator", desc:"Generate a cryptographically random Base32 TOTP secret and otpauth:// URI for Google Authenticator and Authy setup.", icon:"🔑", free:true },
{ id:"rsa-key-pair-gen", cat:"security", name:"RSA Key Pair Generator", desc:"Generate an RSA public/private key pair in PEM format entirely in your browser using the native WebCrypto API.", icon:"🔏", free:true },
{ id:"ulid-gen", cat:"ids", name:"ULID Generator", desc:"Generate ULIDs online — lexicographically sortable, timestamp-prefixed identifiers in Crockford Base32.", icon:"🆔", free:true },
{ id:"objectid-gen", cat:"ids", name:"MongoDB ObjectId Generator", desc:"Generate valid MongoDB ObjectId values online with a real timestamp prefix and random tail for testing and seeds.", icon:"🍃", free:true },
];

const CATEGORIES = [
{ id:"security", name:"Security Generators", icon:"🔐", desc:"Passwords, passphrases, API keys, encryption keys, and secure credential generators." },
{ id:"ids", name:"ID & Token Generators", icon:"🧬", desc:"UUIDs, GUIDs, Nano IDs, random strings, serials, and short hash IDs." },
{ id:"fakedata", name:"Fake Data Generators", icon:"🧪", desc:"Create realistic fake names, addresses, phone numbers, dates, and bulk mock datasets." },
];

const TOOL_META = Object.fromEntries(TOOLS.map(t => [t.id, {
title:`Free ${t.name} – Generate Online | ToolsRift`,
desc:t.desc,
faq:[
["Is this tool free to use?", "Yes. This tool is completely free to use with no daily limits and no signup required."],
["Does this tool send my data to a server?", "No. Processing runs in your browser for fast, private generation and analysis."],
["Can I copy or export generated output?", "Yes. Most generators include Copy, Copy All, and download options for quick workflows."]
]
}]));

// ─── Base32 (RFC 4648) encode — for TOTP secrets ───
const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(bytes) {
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b; bits += 8;
    while (bits >= 5) { out += B32_ALPHA[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32_ALPHA[(value << (5 - bits)) & 31];
  return out;
}
// ─── Crockford Base32 — for ULID ───
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function TotpSecretGen() {
  const [len, setLen] = useState("20");
  const [label, setLabel] = useState("user@example.com");
  const [issuer, setIssuer] = useState("ToolsRift");
  const [out, setOut] = useState(null);
  const gen = () => {
    const n = Math.max(10, Math.min(64, Number(len) || 20));
    const secret = base32Encode(safeCryptoBytes(n));
    const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
    setOut({ secret, uri });
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>Secret length (bytes)</Label><Input value={len} onChange={setLen} placeholder="20" /></div>
        <div><Label>Account label</Label><Input value={label} onChange={setLabel} placeholder="user@example.com" /></div>
      </Grid2>
      <div><Label>Issuer</Label><Input value={issuer} onChange={setIssuer} placeholder="ToolsRift" /></div>
      <Btn onClick={gen}>Generate TOTP Secret</Btn>
      {out && (
        <>
          <div><Label>Base32 secret</Label><Result>{out.secret}</Result><CopyBtn text={out.secret} /></div>
          <div><Label>otpauth:// URI (paste into an authenticator, or make a QR of it)</Label><Result>{out.uri}</Result><CopyBtn text={out.uri} /></div>
          <Card style={{ background:"rgba(59,130,246,0.06)" }}>
            <div style={{ fontSize:12, color:"#94A3B8", lineHeight:1.7 }}>Random bytes come from <strong style={{color:"#E2E8F0"}}>crypto.getRandomValues</strong> and are Base32-encoded (RFC 4648). Feed the secret to any RFC 6238 authenticator — it will produce the same 6-digit codes as the ToolsRift OTP tool.</div>
          </Card>
        </>
      )}
    </VStack>
  );
}

function UlidGen() {
  const [count, setCount] = useState("5");
  const [out, setOut] = useState("");
  const makeUlid = () => {
    const time = Date.now();
    // 48-bit timestamp → 10 Crockford chars
    let ts = "", t = time;
    for (let i = 9; i >= 0; i--) { ts = CROCKFORD[t % 32] + ts; t = Math.floor(t / 32); }
    // 80 bits of randomness → 16 Crockford chars
    const rnd = safeCryptoBytes(10);
    let rand = "", bits = 0, value = 0;
    for (const b of rnd) {
      value = (value << 8) | b; bits += 8;
      while (bits >= 5) { rand += CROCKFORD[(value >>> (bits - 5)) & 31]; bits -= 5; }
    }
    if (bits > 0) rand += CROCKFORD[(value << (5 - bits)) & 31];
    return (ts + rand).slice(0, 26);
  };
  const gen = () => {
    const n = Math.max(1, Math.min(1000, Number(count) || 1));
    setOut(Array.from({ length: n }, makeUlid).join("\n"));
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>How many</Label><Input value={count} onChange={setCount} placeholder="5" /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}><Btn onClick={gen} style={{ width:"100%" }}>Generate ULIDs</Btn></div>
      </Grid2>
      {out && <><Result>{out}</Result><CopyBtn text={out} /></>}
      <Card style={{ background:"rgba(59,130,246,0.06)" }}>
        <div style={{ fontSize:12, color:"#94A3B8", lineHeight:1.7 }}>A <strong style={{color:"#E2E8F0"}}>ULID</strong> is 26 Crockford-Base32 chars: a 48-bit millisecond timestamp (sortable) followed by 80 crypto-random bits. Unlike UUIDv4, ULIDs generated later sort lexicographically later.</div>
      </Card>
    </VStack>
  );
}

function ObjectIdGen() {
  const [count, setCount] = useState("5");
  const [out, setOut] = useState("");
  // Per-session random machine/process id (5 bytes) + incrementing counter (3 bytes), like the spec.
  const machine = useMemo(() => bytesToHex(safeCryptoBytes(5)), []);
  const counterRef = useRef((safeCryptoBytes(3)[0] << 16) | (safeCryptoBytes(1)[0] << 8) | safeCryptoBytes(1)[0]);
  const makeId = () => {
    const ts = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
    counterRef.current = (counterRef.current + 1) & 0xffffff;
    const ctr = counterRef.current.toString(16).padStart(6, "0");
    return ts + machine + ctr;
  };
  const gen = () => {
    const n = Math.max(1, Math.min(1000, Number(count) || 1));
    setOut(Array.from({ length: n }, makeId).join("\n"));
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>How many</Label><Input value={count} onChange={setCount} placeholder="5" /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}><Btn onClick={gen} style={{ width:"100%" }}>Generate ObjectIds</Btn></div>
      </Grid2>
      {out && <><Result>{out}</Result><CopyBtn text={out} /></>}
      <Card style={{ background:"rgba(59,130,246,0.06)" }}>
        <div style={{ fontSize:12, color:"#94A3B8", lineHeight:1.7 }}>A MongoDB <strong style={{color:"#E2E8F0"}}>ObjectId</strong> is 24 hex chars: a 4-byte Unix timestamp, a 5-byte random value, and a 3-byte incrementing counter. The timestamp prefix makes them roughly time-ordered.</div>
      </Card>
    </VStack>
  );
}

function RsaKeyPairGen() {
  const [bits, setBits] = useState("2048");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [out, setOut] = useState(null);
  const toPem = (buf, label) => {
    const b64 = bytesToBase64(new Uint8Array(buf));
    const lines = b64.match(/.{1,64}/g).join("\n");
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  };
  const gen = async () => {
    setBusy(true); setErr(""); setOut(null);
    try {
      const kp = await crypto.subtle.generateKey(
        { name: "RSASSA-PKCS1-v1_5", modulusLength: Number(bits), publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
        true, ["sign", "verify"]
      );
      const spki = await crypto.subtle.exportKey("spki", kp.publicKey);
      const pkcs8 = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
      setOut({ pub: toPem(spki, "PUBLIC KEY"), priv: toPem(pkcs8, "PRIVATE KEY") });
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>Key size</Label><SelectInput value={bits} onChange={setBits} options={[{value:"2048",label:"2048-bit (standard)"},{value:"3072",label:"3072-bit"},{value:"4096",label:"4096-bit (slow)"}]} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}><Btn onClick={gen} disabled={busy} style={{ width:"100%" }}>{busy ? "Generating…" : "Generate RSA Key Pair"}</Btn></div>
      </Grid2>
      {err && <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, fontSize:13, color:"#E2E8F0" }}>{err}</div>}
      {out && (
        <>
          <div><Label>Public key (SPKI PEM)</Label><Result>{out.pub}</Result><CopyBtn text={out.pub} /></div>
          <div><Label>Private key (PKCS#8 PEM)</Label><Result>{out.priv}</Result><CopyBtn text={out.priv} /></div>
          <Card style={{ background:"rgba(245,158,11,0.08)" }}>
            <div style={{ fontSize:12, color:"#E2E8F0", lineHeight:1.7 }}>Generated locally with the browser's native <strong>WebCrypto</strong> — the private key never leaves your device. Still, treat any generated private key as test/development material unless you fully control this environment.</div>
          </Card>
        </>
      )}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
"totp-secret-gen": TotpSecretGen,
"rsa-key-pair-gen": RsaKeyPairGen,
"ulid-gen": UlidGen,
"objectid-gen": ObjectIdGen,
"strong-password-gen": StrongPasswordGen,
"passphrase-gen": PassphraseGen,
"pin-gen": PinGen,
"api-key-gen": ApiKeyGen,
"encryption-key-gen": EncryptionKeyGen,
"bulk-password-gen": BulkPasswordGen,
"uuid-gen": UuidGen,
"guid-gen": GuidGen,
"nanoid-gen": NanoidGen,
"random-number-gen": RandomNumberGen,
"random-string-gen": RandomStringGen,
"random-hex-gen": RandomHexGen,
"serial-number-gen": SerialNumberGen,
"cuid-gen": CuidGen,
"hash-id-gen": HashIdGen,
// QR tools removed — see TOOLS array note.
"fake-name-gen": FakeNameGen,
"fake-address-gen": FakeAddressGen,
"fake-email-gen": FakeEmailGen,
"fake-phone-gen": FakePhoneGen,
"fake-ip-gen": FakeIpGen,
"fake-mac-gen": FakeMacGen,
"fake-date-gen": FakeDateGen,
"fake-data-bulk": FakeDataBulk,
"random-country-gen": RandomCountryGen,
"random-color-gen": RandomColorGen,
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
{ "@type": "ListItem", "position": 2, "name": "Security Generators", "item": "https://toolsrift.com/generators" },
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
    document.title = meta?.title || `${tool?.name} – Free Security Generator | ToolsRift`;
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
const items = TOOLS.filter(t => t.cat === catId);
if (!cat) return <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px",color:C.muted}}>Category not found.</div>;
return (
<div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px 60px" }}>
<Breadcrumb cat={cat} />
<div style={{ marginBottom:20 }}>
<h1 style={T.h1}>{cat.icon} {cat.name}</h1>
<p style={{ color:C.muted, marginTop:8 }}>{cat.desc}</p>
</div>
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
{items.map(t => (
<a key={t.id} href={`#/tool/${t.id}`} style={{ textDecoration:"none" }}>
<Card style={{ height:"100%" }}>
<div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
<div style={{ fontSize:22 }}>{t.icon}</div>
<Badge color="green">Free</Badge>
</div>
<div style={{ fontWeight:700, color:C.text, marginBottom:8, fontSize:14 }}>{t.name}</div>
<div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{t.desc}</div>
</Card>
</a>
))}
</div>
</div>
);
}

function HomePage() {
  useEffect(() => { document.title = "ToolsRift Generators – Free Security & Data Generators Online"; }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search security & data generators..."
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
    <nav style={{
      height: 56, display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
      background: `rgba(6,9,15,${scrolled ? 0.97 : 0.85})`,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${scrolled ? "rgba(20,184,166,0.2)" : C.border}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 500, color: C.blue }}>{THEME?.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "rgba(20,184,166,0.12)", color: C.blue, border: "1px solid rgba(20,184,166,0.25)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{TOOLS.length} tools</span>
        <a href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none", fontWeight: 500 }}>🏠 Home</a>
        {/* PHASE 2: <UsageCounter/> */}
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
{href:"/generators",icon:"⚡",label:"Generators"},
{href:"/generators2",icon:"✍️",label:"Content Gen"},
{href:"/devgen",icon:"⚙️",label:"Dev Config"},
{href:"/mathcalc",icon:"📐",label:"Math Calc"},
{href:"/financecalc",icon:"💰",label:"Finance Calc"},
{href:"/devtools",icon:"🛠️",label:"Dev Tools"},
{href:"/js",icon:"📜",label:"JS Tools"},
{href:"/converters2",icon:"🔄",label:"More Converters"},
{href:"/about",icon:"ℹ️",label:"About"},
{href:"/privacy-policy",icon:"🔏",label:"Privacy Policy"},
].filter(p => !p.href.endsWith("/"+currentPage));
return (
<div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
<span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
<a href="/" style={{fontSize:12,color:"#3B82F6",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftGenSecurity() {
const route = useAppRouter();
const showChrome = route.page !== 'home' && route.page !== 'tool';
return (
<div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
<style>{GLOBAL_CSS}</style>
{showChrome && <Nav />}
{route.page==="home" && <HomePage />}
{route.page==="tool" && <ToolPage toolId={route.toolId} />}
{route.page==="category" && <CategoryPage catId={route.catId} />}
{showChrome && <SiteFooter currentPage="generators"/>}
</div>
);
}

export default ToolsRiftGenSecurity;
