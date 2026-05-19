import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import PremiumCategoryLanding from './shared/PremiumCategoryLanding';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';
import InteractiveToolWorkspace from './shared/InteractiveToolWorkspace';
import SmartControls from './shared/SmartControls';
import SmartOutput from './shared/SmartOutput';
// (SmartOutput is imported above; this line kept for clarity.)

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
const path = h.replace(/^#/, "").replace(/\?.*$/, "") || "/";
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

function StrongPasswordGen() {
  const theme = getCategoryById('generators');
  const tool  = { id:'strong-password-gen', name:'Strong Password Generator', icon:'🔐' };
  const [length, setLength]   = useState(20);
  const [upper, setUpper]     = useState(true);
  const [lower, setLower]     = useState(true);
  const [digits, setDigits]   = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [exclSimilar, setExclSimilar] = useState(true);
  const [password, setPassword]       = useState('');

  const generate = useCallback(() => {
    const SETS = { upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower:'abcdefghijklmnopqrstuvwxyz', digits:'0123456789', symbols:'!@#$%^&*()-_=+[]{};:,.<>?/' };
    const SIMILAR = /[Il1O0]/g;
    let pool = '';
    if (upper)   pool += SETS.upper;
    if (lower)   pool += SETS.lower;
    if (digits)  pool += SETS.digits;
    if (symbols) pool += SETS.symbols;
    if (exclSimilar) pool = pool.replace(SIMILAR, '');
    if (!pool) { setPassword(''); return; }
    const bytes = safeCryptoBytes(length);
    let out = '';
    for (let i = 0; i < length; i++) out += pool[bytes[i] % pool.length];
    setPassword(out);
  }, [length, upper, lower, digits, symbols, exclSimilar]);

  useEffect(() => { generate(); }, [generate]);

  // Rough strength estimate via entropy bits
  const strength = useMemo(() => {
    const sets = (upper?26:0) + (lower?26:0) + (digits?10:0) + (symbols?27:0) - (exclSimilar?5:0);
    const bits = Math.round(length * Math.log2(Math.max(sets, 1)));
    let label = 'Weak', color = '#F87171', pct = 25;
    if (bits >= 128) { label = 'Excellent'; color = '#10B981'; pct = 100; }
    else if (bits >= 90)  { label = 'Strong';    color = '#22C55E'; pct = 80; }
    else if (bits >= 60)  { label = 'Good';      color = '#FBBF24'; pct = 60; }
    else if (bits >= 40)  { label = 'Fair';      color = '#FB923C'; pct = 45; }
    return { bits, label, color, pct };
  }, [length, upper, lower, digits, symbols, exclSimilar]);

  const status = password
    ? { state:'ok', label:strength.label, detail:`${strength.bits} bits of entropy` }
    : { state:'error', label:'Pick at least one character set' };

  return (
    <InteractiveToolWorkspace
      theme={theme}
      tool={tool}
      outputLabel="Generated password"
      status={status}
      stats={{ chars: password.length, detail: `${strength.bits} bits` }}
      onLoadSample={generate}
      onCopy={() => password}
      onDownload={() => ({ content: password, filename: 'password.txt' })}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}
    >
      <InteractiveToolWorkspace.Controls>
        <SmartControls
          theme={theme}
          title="Password options"
          fields={[
            { type:'slider',  label:'Length',    value:length,  min:6, max:64, onChange:setLength, unit:'chars' },
            { type:'toggle',  label:'Uppercase (A-Z)', value:upper,   onChange:setUpper },
            { type:'toggle',  label:'Lowercase (a-z)', value:lower,   onChange:setLower },
            { type:'toggle',  label:'Digits (0-9)',    value:digits,  onChange:setDigits },
            { type:'toggle',  label:'Symbols (!@#$…)', value:symbols, onChange:setSymbols },
            { type:'toggle',  label:'Exclude similar (I, l, 1, O, 0)', value:exclSimilar, onChange:setExclSimilar },
          ]}
        />
      </InteractiveToolWorkspace.Controls>

      <InteractiveToolWorkspace.Input>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <button
            type="button"
            onClick={generate}
            style={{
              background: theme.gradient, color: theme.textOnColor || '#fff',
              border: 'none', borderRadius: 12, padding: '14px 18px', cursor:'pointer',
              fontFamily: theme.fonts.body, fontSize:14, fontWeight:700,
              display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow: `0 8px 24px ${theme.tint25}`, minHeight: 48,
            }}
          >🎲 Generate new password</button>
          <div style={{ fontSize:12.5, color:'#94A3B8', lineHeight:1.55 }}>
            Passwords are generated with <strong>crypto.getRandomValues</strong> in your
            browser. Nothing is sent anywhere.
          </div>
        </div>
      </InteractiveToolWorkspace.Input>

      <InteractiveToolWorkspace.Output>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div
            style={{
              padding: '20px 18px',
              background: `linear-gradient(135deg, ${theme.tint25}, ${theme.tint06})`,
              border: `1px solid ${theme.tint25}`,
              borderRadius: 14,
              fontFamily: theme.fonts.mono,
              fontSize: 'clamp(16px,3vw,22px)',
              fontWeight: 700,
              color: '#F8FAFC',
              letterSpacing: '0.02em',
              wordBreak: 'break-all',
              textAlign: 'center',
              minHeight: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {password || '—'}
          </div>
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12, color:'#94A3B8', fontFamily: theme.fonts.body }}>
              <span>Strength</span>
              <span style={{ color: strength.color, fontWeight:700 }}>{strength.label} · {strength.bits} bits</span>
            </div>
            <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
              <div style={{ width:`${strength.pct}%`, height:'100%', background:strength.color, transition:'width .25s, background .25s' }} />
            </div>
          </div>
        </div>
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}
// ─── Helper data tables for fake-data generators ────────────────────────────
const FIRST_NAMES = ['Aarav','Aditi','Ananya','Arjun','Aryan','Diya','Ishaan','Kavya','Krishna','Maya','Neha','Priya','Rahul','Riya','Rohan','Sanya','Saurav','Tanvi','Vikram','Zara','Alex','Amelia','Ava','Ben','Charlotte','Daniel','Emma','Ethan','Grace','Henry','Isabella','Jack','Lily','Liam','Mia','Noah','Olivia','Oliver','Sophia','William'];
const LAST_NAMES  = ['Sharma','Patel','Verma','Gupta','Singh','Kumar','Reddy','Iyer','Nair','Joshi','Rao','Mehta','Khan','Ali','Bose','Roy','Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Wilson','Anderson','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White'];
const STREETS    = ['Main','Park','Oak','Pine','Cedar','Elm','Lake','Hill','River','Maple','Sunset','Garden','Spring','Forest','Valley','Ridge','Lotus','Jasmine','Tulip','Brigade'];
const STREET_TYPES = ['Street','Avenue','Road','Lane','Boulevard','Drive','Way','Marg'];
const CITIES_INDIA = ['Mumbai','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad','Jaipur','Lucknow','Indore','Kanpur','Nagpur','Surat','Patna','Bhopal'];
const CITIES_US    = ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','Austin','Seattle','Denver','Boston'];
const COUNTRIES = [
  {n:'India',c:'IN',d:'+91'},{n:'United States',c:'US',d:'+1'},{n:'United Kingdom',c:'GB',d:'+44'},{n:'Canada',c:'CA',d:'+1'},{n:'Australia',c:'AU',d:'+61'},
  {n:'Germany',c:'DE',d:'+49'},{n:'France',c:'FR',d:'+33'},{n:'Japan',c:'JP',d:'+81'},{n:'Brazil',c:'BR',d:'+55'},{n:'Singapore',c:'SG',d:'+65'},
  {n:'Netherlands',c:'NL',d:'+31'},{n:'Spain',c:'ES',d:'+34'},{n:'Mexico',c:'MX',d:'+52'},{n:'Sweden',c:'SE',d:'+46'},{n:'Norway',c:'NO',d:'+47'},
  {n:'South Korea',c:'KR',d:'+82'},{n:'Italy',c:'IT',d:'+39'},{n:'New Zealand',c:'NZ',d:'+64'},{n:'Switzerland',c:'CH',d:'+41'},{n:'Ireland',c:'IE',d:'+353'},
];
const EMAIL_DOMAINS = ['example.com','test.org','demo.net','sample.io','example.dev','mail.test'];

function makeFakeName() { return `${randPick(FIRST_NAMES)} ${randPick(LAST_NAMES)}`; }
function makeFakeStreet() { return `${randInt(1,9999)} ${randPick(STREETS)} ${randPick(STREET_TYPES)}`; }
function makeFakeAddress(region='india') {
  const city = region === 'us' ? randPick(CITIES_US) : randPick(CITIES_INDIA);
  return `${makeFakeStreet()}\n${city}${region==='us'? ', ' + ['NY','CA','TX','FL','IL','WA','MA','GA'][randInt(0,7)] + ' ' + (10000+randInt(0,89999)) : ' - ' + (100000+randInt(0,899999))}\n${region==='us'?'United States':'India'}`;
}
function makeFakeEmail() {
  const first = randPick(FIRST_NAMES).toLowerCase();
  const last  = randPick(LAST_NAMES).toLowerCase();
  return `${first}.${last}${randInt(1,99)}@${randPick(EMAIL_DOMAINS)}`;
}
function makeFakePhone(country='IN') {
  if (country === 'IN') return `+91 ${randInt(70000,99999)} ${randInt(10000,99999)}`;
  if (country === 'US') return `+1 (${randInt(200,999)}) ${randInt(200,999)}-${String(randInt(0,9999)).padStart(4,'0')}`;
  if (country === 'GB') return `+44 7${randInt(100,999)} ${randInt(100,999)} ${randInt(100,999)}`;
  return `+${randInt(1,99)} ${randInt(10000000,99999999)}`;
}
function makeFakeIPv4() { return Array.from({length:4},()=>randInt(0,255)).join('.'); }
function makeFakeIPv6() {
  return Array.from({length:8},()=>Array.from({length:4},()=>'0123456789abcdef'[randInt(0,15)]).join('')).join(':');
}
function makeFakeMac() {
  return Array.from({length:6},()=>('0'+randInt(0,255).toString(16)).slice(-2)).join(':');
}
function makeFakeDate(startYear=1970, endYear=2030) {
  const y = randInt(startYear, endYear);
  const m = randInt(1,12);
  const d = randInt(1, new Date(y,m,0).getDate());
  return new Date(y, m-1, d);
}

// Helper: generic "Generate" button row
function GenerateBtn({ theme, onClick, label = 'Generate', icon = '🎲' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: theme.gradient, color: theme.textOnColor || '#fff',
        border: 'none', borderRadius: 12, padding: '14px 18px', cursor:'pointer',
        fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700,
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
        boxShadow: `0 8px 24px ${theme.tint25}`, minHeight: 48,
        width: '100%',
      }}
    >{icon} {label}</button>
  );
}

// Helper: big monospace result panel
function BigCodeResult({ theme, value, wrap = false }) {
  return (
    <div
      style={{
        padding: '20px 18px',
        background: `linear-gradient(135deg, ${theme.tint25}, ${theme.tint06})`,
        border: `1px solid ${theme.tint25}`,
        borderRadius: 14,
        fontFamily: theme.fonts.mono,
        fontSize: 'clamp(14px,2vw,18px)',
        fontWeight: 700,
        color: '#F8FAFC',
        letterSpacing: '0.02em',
        wordBreak: wrap ? 'break-word' : 'break-all',
        whiteSpace: wrap ? 'pre-wrap' : 'normal',
        textAlign: 'center',
        minHeight: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {value || '—'}
    </div>
  );
}

// ─── 1. Passphrase Generator ────────────────────────────────────────────────
const PASSPHRASE_WORDS = ['amber','breeze','candle','dragon','ember','forest','glacier','harbor','island','jaguar','kettle','lantern','meadow','nimbus','orchard','prairie','quiver','ribbon','silver','thunder','umbrella','velvet','willow','xenon','yonder','zenith','autumn','beacon','cobalt','dahlia','ember','feather','gentle','hollow','iris','jovial','kindle','lotus','mirror','nectar','onyx','pebble','quartz','radiant','silver','tulip','urchin','violet','whisper','crimson','emerald'];
function PassphraseGen() {
  const theme = getCategoryById('generators');
  const tool  = { id:'passphrase-gen', name:'Passphrase Generator', icon:'🗝️' };
  const [count, setCount] = useState(4);
  const [sep, setSep] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [appendNumber, setAppendNumber] = useState(true);
  const [phrase, setPhrase] = useState('');
  const generate = useCallback(() => {
    const words = Array.from({length: count}, () => {
      const w = randPick(PASSPHRASE_WORDS);
      return capitalize ? w[0].toUpperCase() + w.slice(1) : w;
    });
    let p = words.join(sep);
    if (appendNumber) p += sep + randInt(10,99);
    setPhrase(p);
  }, [count, sep, capitalize, appendNumber]);
  useEffect(() => { generate(); }, [generate]);
  const entropy = Math.round(count * Math.log2(PASSPHRASE_WORDS.length) + (appendNumber ? 7 : 0));
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Generated passphrase"
      status={{state:'ok', label:'Generated', detail:`~${entropy} bits entropy`}}
      onLoadSample={generate} onCopy={() => phrase}
      onDownload={() => ({ content: phrase, filename: 'passphrase.txt' })}
      primaryAction={{ label:'Generate new', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Passphrase options" fields={[
          { type:'slider', label:'Word count', value:count, min:2, max:10, onChange:setCount, unit:'words' },
          { type:'segmented', label:'Separator', value:sep,
            options:[{value:'-',label:'hyphen'},{value:'_',label:'underscore'},{value:'.',label:'dot'},{value:' ',label:'space'}], onChange:setSep },
          { type:'toggle', label:'Capitalize words', value:capitalize, onChange:setCapitalize },
          { type:'toggle', label:'Append a random number', value:appendNumber, onChange:setAppendNumber },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} label="Generate new passphrase" />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <BigCodeResult theme={theme} value={phrase} wrap />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 2. PIN Generator ───────────────────────────────────────────────────────
function PinGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'pin-gen', name:'PIN Generator', icon:'🔢' };
  const [digits, setDigits] = useState(6);
  const [pin, setPin] = useState('');
  const generate = useCallback(() => {
    const bytes = safeCryptoBytes(digits);
    setPin(Array.from(bytes).map(b => b % 10).join(''));
  }, [digits]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Generated PIN"
      status={{state:'ok', label:`${digits}-digit PIN`}}
      onLoadSample={generate} onCopy={() => pin}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="PIN length" fields={[
          { type:'segmented', label:'Digits', value:digits,
            options:[{value:4,label:'4'},{value:6,label:'6'},{value:8,label:'8'},{value:10,label:'10'},{value:12,label:'12'}], onChange:(v)=>setDigits(Number(v)) },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} label={`Generate ${digits}-digit PIN`} />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <BigCodeResult theme={theme} value={pin} />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 3. API Key Generator ───────────────────────────────────────────────────
const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function bytesToBase58(bytes) {
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let s = '';
  while (num > 0n) { s = B58_ALPHABET[Number(num % 58n)] + s; num /= 58n; }
  return s || '1';
}
function ApiKeyGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'api-key-gen', name:'API Key Generator', icon:'🧪' };
  const [format, setFormat] = useState('hex');
  const [length, setLength] = useState(32);
  const [prefix, setPrefix] = useState('sk_');
  const [key, setKey] = useState('');
  const generate = useCallback(() => {
    const bytes = safeCryptoBytes(length);
    let body;
    if (format === 'hex')         body = bytesToHex(bytes).slice(0, length);
    else if (format === 'base64') body = bytesToBase64(bytes).replace(/[+/=]/g, '').slice(0, length);
    else if (format === 'base58') body = bytesToBase58(bytes).slice(0, length);
    else if (format === 'uuid')   body = uuidv4();
    setKey((prefix || '') + body);
  }, [format, length, prefix]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Generated API key"
      status={{state:'ok', label:format.toUpperCase(), detail:`${key.length} chars`}}
      onLoadSample={generate} onCopy={() => key}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="API key format" fields={[
          { type:'segmented', label:'Format', value:format,
            options:[{value:'hex',label:'hex'},{value:'base64',label:'base64'},{value:'base58',label:'base58'},{value:'uuid',label:'uuid v4'}], onChange:setFormat },
          ...(format !== 'uuid' ? [{ type:'slider', label:'Length', value:length, min:8, max:128, unit:'chars', onChange:setLength }] : []),
          { type:'segmented', label:'Prefix', value:prefix,
            options:[{value:'',label:'none'},{value:'sk_',label:'sk_'},{value:'pk_',label:'pk_'},{value:'tr_',label:'tr_'}], onChange:setPrefix },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} label="Generate new key" />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <BigCodeResult theme={theme} value={key} wrap />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 4. Encryption Key Generator ────────────────────────────────────────────
function EncryptionKeyGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'encryption-key-gen', name:'Encryption Key Generator', icon:'🛡️' };
  const [bits, setBits] = useState(256);
  const [format, setFormat] = useState('hex');
  const [key, setKey] = useState('');
  const generate = useCallback(() => {
    const bytes = safeCryptoBytes(bits / 8);
    if (format === 'hex')    setKey(bytesToHex(bytes));
    else if (format === 'base64') setKey(bytesToBase64(bytes));
    else                          setKey(Array.from(bytes).join(','));
  }, [bits, format]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel={`${bits}-bit ${format} key`}
      status={{state:'ok', label:`${bits} bits`, detail:format}}
      onLoadSample={generate} onCopy={() => key}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Key size" fields={[
          { type:'segmented', label:'Bits', value:bits,
            options:[{value:128,label:'AES-128'},{value:192,label:'AES-192'},{value:256,label:'AES-256'},{value:512,label:'512-bit'}], onChange:(v)=>setBits(Number(v)) },
          { type:'segmented', label:'Format', value:format,
            options:[{value:'hex',label:'hex'},{value:'base64',label:'base64'},{value:'bytes',label:'bytes[]'}], onChange:setFormat },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} label="Generate new key" />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <BigCodeResult theme={theme} value={key} wrap />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 5. Bulk Password Generator ─────────────────────────────────────────────
function BulkPasswordGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'bulk-password-gen', name:'Bulk Password Generator', icon:'📦' };
  const [count, setCount] = useState(20);
  const [length, setLength] = useState(16);
  const [pool, setPool] = useState('alnum+sym');
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    const sets = {
      alnum:     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      'alnum+sym':'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+',
      hex:       '0123456789abcdef',
    };
    const charset = sets[pool] || sets['alnum+sym'];
    const out = [];
    for (let i = 0; i < count; i++) {
      const bytes = safeCryptoBytes(length);
      out.push(Array.from(bytes).map((b) => charset[b % charset.length]).join(''));
    }
    setList(out.join('\n'));
  }, [count, length, pool]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Generated passwords"
      status={{state:'ok', label:`${count} passwords`, detail:`${length} chars each`}}
      stats={{ chars: list.length, lines: count }}
      onLoadSample={generate} onCopy={() => list}
      onDownload={() => ({ content: list, filename: `bulk-passwords-${count}.txt` })}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Bulk options" fields={[
          { type:'slider', label:'Count', value:count, min:1, max:200, onChange:setCount, unit:'pwds' },
          { type:'slider', label:'Length', value:length, min:6, max:64, onChange:setLength, unit:'chars' },
          { type:'segmented', label:'Charset', value:pool,
            options:[{value:'alnum',label:'A-Z a-z 0-9'},{value:'alnum+sym',label:'+ symbols'},{value:'hex',label:'hex'}], onChange:setPool },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} label={`Generate ${count} passwords`} />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <SmartOutput theme={theme} value={list} mono empty="Generated list appears here." />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── Single-result UUID / GUID / Hex / Serial / CUID (kept as one-liners) ──
function UuidGen()   { return <Result>{uuidv4()}</Result>; }
function GuidGen()   { return <Result>{`{${uuidv4().toUpperCase()}}`}</Result>; }
function RandomHexGen() { return <Result>{bytesToHex(safeCryptoBytes(16))}</Result>; }
function SerialNumberGen() {
  const seg = () => Array.from(safeCryptoBytes(4)).map((b)=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
  return <Result>{`TR-${seg()}-${seg()}`}</Result>;
}
function CuidGen()   { return <Result>{`c${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}</Result>; }

// ─── 6. NanoID Generator ────────────────────────────────────────────────────
const NANO_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';
function NanoidGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'nanoid-gen', name:'NanoID Generator', icon:'🆔' };
  const [size, setSize] = useState(21);
  const [count, setCount] = useState(1);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const bytes = safeCryptoBytes(size);
      out.push(Array.from(bytes).map((b)=>NANO_ALPHABET[b%64]).join(''));
    }
    setList(out.join('\n'));
  }, [size, count]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="NanoID(s)"
      status={{state:'ok', label:`${count} × ${size} chars`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="NanoID options" fields={[
          { type:'slider', label:'Length per ID', value:size, min:8, max:36, onChange:setSize, unit:'chars' },
          { type:'slider', label:'How many', value:count, min:1, max:50, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        {count === 1
          ? <BigCodeResult theme={theme} value={list} wrap />
          : <SmartOutput theme={theme} value={list} mono />}
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 7. Random Number Generator ─────────────────────────────────────────────
function RandomNumberGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'random-number-gen', name:'Random Number Generator', icon:'🎲' };
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [unique, setUnique] = useState(false);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    const lo = Math.min(Number(min), Number(max));
    const hi = Math.max(Number(min), Number(max));
    const range = hi - lo + 1;
    if (unique) {
      const target = Math.min(count, range);
      const seen = new Set();
      while (seen.size < target) seen.add(lo + (safeCryptoBytes(4).reduce((a,b)=>a*256+b,0) % range));
      setList([...seen].join('\n'));
    } else {
      const out = [];
      for (let i = 0; i < count; i++) out.push(lo + (safeCryptoBytes(4).reduce((a,b)=>a*256+b,0) % range));
      setList(out.join('\n'));
    }
  }, [min, max, count, unique]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Random numbers"
      status={{state:'ok', label:`${count} number${count===1?'':'s'}`, detail:`${min}-${max}`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Range" fields={[
          { type:'number', label:'Min', value:min, onChange:setMin, step:1 },
          { type:'number', label:'Max', value:max, onChange:setMax, step:1 },
          { type:'slider', label:'Count', value:count, min:1, max:100, onChange:setCount },
          { type:'toggle', label:'Unique numbers (no duplicates)', value:unique, onChange:setUnique },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        {count === 1 ? <BigCodeResult theme={theme} value={list} /> : <SmartOutput theme={theme} value={list} mono />}
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 8. Random String Generator ─────────────────────────────────────────────
function RandomStringGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'random-string-gen', name:'Random String Generator', icon:'🔤' };
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [count, setCount] = useState(1);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    let pool = '';
    if (upper)   pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower)   pool += 'abcdefghijklmnopqrstuvwxyz';
    if (digits)  pool += '0123456789';
    if (symbols) pool += '!@#$%^&*()-_=+';
    if (!pool) { setList(''); return; }
    const out = [];
    for (let i = 0; i < count; i++) {
      const bytes = safeCryptoBytes(length);
      out.push(Array.from(bytes).map((b)=>pool[b%pool.length]).join(''));
    }
    setList(out.join('\n'));
  }, [length, upper, lower, digits, symbols, count]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Random string(s)"
      status={{state:'ok', label:`${count} string${count===1?'':'s'}`, detail:`${length} chars`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="String options" fields={[
          { type:'slider', label:'Length', value:length, min:4, max:128, onChange:setLength, unit:'chars' },
          { type:'slider', label:'How many', value:count, min:1, max:50, onChange:setCount },
          { type:'toggle', label:'Uppercase A-Z', value:upper, onChange:setUpper },
          { type:'toggle', label:'Lowercase a-z', value:lower, onChange:setLower },
          { type:'toggle', label:'Digits 0-9',    value:digits, onChange:setDigits },
          { type:'toggle', label:'Symbols !@#$',  value:symbols, onChange:setSymbols },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <GenerateBtn theme={theme} onClick={generate} />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        {count === 1 ? <BigCodeResult theme={theme} value={list} wrap /> : <SmartOutput theme={theme} value={list} mono />}
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 9. HashID Generator (numeric → short alphanumeric) ────────────────────
function HashIdGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'hashid-gen', name:'HashID Generator', icon:'#' };
  const [num, setNum] = useState(12345);
  const [salt, setSalt] = useState('toolsrift');
  const result = useMemo(() => {
    const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    // Simple shuffle by salt
    const arr = ALPHABET.split('');
    let seed = 0;
    for (const c of salt || 'x') seed += c.charCodeAt(0);
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 9301 + 49297) % 233280;
      const j = Math.abs(seed) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const shuffled = arr.join('');
    let n = BigInt(Math.abs(Number(num) || 0));
    let s = '';
    while (n > 0n) { s = shuffled[Number(n % BigInt(shuffled.length))] + s; n /= BigInt(shuffled.length); }
    return s || shuffled[0];
  }, [num, salt]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Encoded HashID"
      status={{state:'ok', label:result.length + ' chars'}}
      onCopy={() => result}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="HashID options" fields={[
          { type:'number', label:'Number to encode', value:num, onChange:setNum, step:1 },
          { type:'select', label:'Salt', value:salt, onChange:setSalt,
            options:[{value:'toolsrift',label:'toolsrift'},{value:'my-app',label:'my-app'},{value:'short',label:'short'}] },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <div style={{ fontSize:13, color:'#94A3B8', lineHeight:1.6 }}>
          HashIDs encode a positive integer into a short, URL-safe string using a salt-shuffled alphabet. Common use: short public IDs that don't reveal sequential database keys.
        </div>
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <BigCodeResult theme={theme} value={result} />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── QR generators: placeholder pages until qrcode lib is wired in ─────────
function QrPlaceholder({ id, name, icon, hint }) {
  const theme = getCategoryById('generators');
  const tool = { id, name, icon };
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} status={{ state:'idle', label:'Coming soon' }}>
      <InteractiveToolWorkspace.Input>
        <div style={{ padding:'18px 20px', background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.18)', borderRadius:12, color:'#FBBF24', fontSize:14, lineHeight:1.7 }}>
          <strong style={{ color:'#FCD34D' }}>Coming soon.</strong> {hint || 'This QR-code tool will render a downloadable PNG/SVG using a small QR library.'} Until then, try the universal QR generator on{' '}
          <a href="#/tool/qr-code-gen" style={{ color:'#FCD34D' }}>/generators</a> if available, or paste the same data into any other QR site.
        </div>
      </InteractiveToolWorkspace.Input>
    </InteractiveToolWorkspace>
  );
}
function QrUrl()    { return <QrPlaceholder id="qr-url"    name="QR Code: URL"        icon="📱" />; }
function QrWifi()   { return <QrPlaceholder id="qr-wifi"   name="QR Code: Wi-Fi"      icon="📶" />; }
function QrVcard()  { return <QrPlaceholder id="qr-vcard"  name="QR Code: vCard"      icon="🪪" />; }
function QrEmail()  { return <QrPlaceholder id="qr-email"  name="QR Code: Email"      icon="✉️" />; }
function QrPhone()  { return <QrPlaceholder id="qr-phone"  name="QR Code: Phone Call" icon="📞" />; }
function QrSms()    { return <QrPlaceholder id="qr-sms"    name="QR Code: SMS"        icon="💬" />; }
function QrText()   { return <QrPlaceholder id="qr-text"   name="QR Code: Text"       icon="📝" />; }
function QrReader() { return <QrPlaceholder id="qr-reader" name="QR Code Reader"      icon="🔍" hint="Camera-based QR scanner coming soon." />; }

// ─── 10. Fake Name Generator ────────────────────────────────────────────────
function FakeNameGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-name-gen', name:'Fake Name Generator', icon:'👤' };
  const [count, setCount] = useState(1);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => makeFakeName()).join('\n'));
  }, [count]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Generated names"
      status={{state:'ok', label:`${count} name${count===1?'':'s'}`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'slider', label:'How many', value:count, min:1, max:100, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        {count === 1 ? <BigCodeResult theme={theme} value={list} wrap /> : <SmartOutput theme={theme} value={list} mono={false} />}
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 11. Fake Address Generator ─────────────────────────────────────────────
function FakeAddressGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-address-gen', name:'Fake Address Generator', icon:'🏠' };
  const [count, setCount] = useState(1);
  const [region, setRegion] = useState('india');
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => makeFakeAddress(region)).join('\n\n'));
  }, [count, region]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Generated addresses"
      status={{state:'ok', label:`${count} addr.`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'segmented', label:'Region', value:region,
            options:[{value:'india',label:'India'},{value:'us',label:'United States'}], onChange:setRegion },
          { type:'slider', label:'How many', value:count, min:1, max:50, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono={false} /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 12. Fake Email Generator ───────────────────────────────────────────────
function FakeEmailGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-email-gen', name:'Fake Email Generator', icon:'✉️' };
  const [count, setCount] = useState(5);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => makeFakeEmail()).join('\n'));
  }, [count]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Fake emails"
      status={{state:'ok', label:`${count} email${count===1?'':'s'}`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'slider', label:'How many', value:count, min:1, max:100, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 13. Fake Phone Generator ───────────────────────────────────────────────
function FakePhoneGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-phone-gen', name:'Fake Phone Number Generator', icon:'📞' };
  const [count, setCount] = useState(5);
  const [country, setCountry] = useState('IN');
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => makeFakePhone(country)).join('\n'));
  }, [count, country]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Fake phone numbers"
      status={{state:'ok', label:`${count} number${count===1?'':'s'}`, detail:country}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'segmented', label:'Country', value:country,
            options:[{value:'IN',label:'India'},{value:'US',label:'USA'},{value:'GB',label:'UK'}], onChange:setCountry },
          { type:'slider', label:'How many', value:count, min:1, max:50, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 14. Fake IP Generator ──────────────────────────────────────────────────
function FakeIpGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-ip-gen', name:'Fake IP Address Generator', icon:'🌐' };
  const [version, setVersion] = useState('4');
  const [count, setCount] = useState(5);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => version === '4' ? makeFakeIPv4() : makeFakeIPv6()).join('\n'));
  }, [count, version]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel={`Fake IPv${version}`}
      status={{state:'ok', label:`${count} address${count===1?'':'es'}`, detail:`IPv${version}`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'segmented', label:'Version', value:version,
            options:[{value:'4',label:'IPv4'},{value:'6',label:'IPv6'}], onChange:setVersion },
          { type:'slider', label:'How many', value:count, min:1, max:50, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 15. Fake MAC Generator ─────────────────────────────────────────────────
function FakeMacGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-mac-gen', name:'Fake MAC Address Generator', icon:'🔌' };
  const [count, setCount] = useState(5);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => makeFakeMac()).join('\n'));
  }, [count]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Fake MAC addresses"
      status={{state:'ok', label:`${count} addr.`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'slider', label:'How many', value:count, min:1, max:50, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 16. Fake Date Generator ────────────────────────────────────────────────
function FakeDateGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-date-gen', name:'Fake Date Generator', icon:'📅' };
  const [count, setCount] = useState(5);
  const [startY, setStartY] = useState(1990);
  const [endY,   setEndY]   = useState(2030);
  const [format, setFormat] = useState('iso');
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    const fmt = (d) => {
      if (format === 'iso') return d.toISOString().slice(0,10);
      if (format === 'us')  return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
      if (format === 'eu')  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
      return d.toDateString();
    };
    setList(Array.from({length: count}, () => fmt(makeFakeDate(Number(startY), Number(endY)))).join('\n'));
  }, [count, startY, endY, format]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Fake dates"
      status={{state:'ok', label:`${count} date${count===1?'':'s'}`, detail:format.toUpperCase()}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'segmented', label:'Format', value:format,
            options:[{value:'iso',label:'ISO 2026-05-19'},{value:'us',label:'US 5/19/2026'},{value:'eu',label:'EU 19/5/2026'},{value:'long',label:'Long'}], onChange:setFormat },
          { type:'number', label:'Start year', value:startY, onChange:setStartY, step:1 },
          { type:'number', label:'End year',   value:endY,   onChange:setEndY,   step:1 },
          { type:'slider', label:'How many', value:count, min:1, max:100, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 17. Fake Data Bulk (CSV-style) ─────────────────────────────────────────
function FakeDataBulk() {
  const theme = getCategoryById('generators');
  const tool = { id:'fake-data-bulk', name:'Fake Data Bulk (CSV)', icon:'📊' };
  const [count, setCount] = useState(10);
  const [region, setRegion] = useState('india');
  const [format, setFormat] = useState('csv');
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    const rows = [];
    for (let i = 0; i < count; i++) {
      const row = {
        name:    makeFakeName(),
        email:   makeFakeEmail(),
        phone:   makeFakePhone(region === 'us' ? 'US' : 'IN'),
        address: makeFakeAddress(region).replace(/\n/g, ', '),
        country: region === 'us' ? 'United States' : 'India',
      };
      rows.push(row);
    }
    if (format === 'csv') {
      const header = 'name,email,phone,address,country';
      const body   = rows.map((r) => [r.name, r.email, r.phone, `"${r.address}"`, r.country].join(',')).join('\n');
      setList(header + '\n' + body);
    } else if (format === 'json') {
      setList(JSON.stringify(rows, null, 2));
    } else {
      setList(rows.map((r) => Object.entries(r).map(([k,v]) => `${k}: ${v}`).join('\n')).join('\n\n'));
    }
  }, [count, region, format]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel={`Bulk fake data (${format})`}
      status={{state:'ok', label:`${count} records`, detail:format.toUpperCase()}}
      stats={{ chars: list.length, lines: list.split('\n').length }}
      onLoadSample={generate} onCopy={() => list}
      onDownload={() => ({ content: list, filename: `fake-data.${format === 'json' ? 'json' : 'csv'}` })}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Bulk options" fields={[
          { type:'segmented', label:'Region', value:region,
            options:[{value:'india',label:'India'},{value:'us',label:'USA'}], onChange:setRegion },
          { type:'segmented', label:'Format', value:format,
            options:[{value:'csv',label:'CSV'},{value:'json',label:'JSON'},{value:'lines',label:'Lines'}], onChange:setFormat },
          { type:'slider', label:'How many records', value:count, min:1, max:200, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output><SmartOutput theme={theme} value={list} mono /></InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 18. Random Country Generator ───────────────────────────────────────────
function RandomCountryGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'random-country-gen', name:'Random Country Generator', icon:'🌍' };
  const [count, setCount] = useState(1);
  const [list, setList] = useState('');
  const generate = useCallback(() => {
    setList(Array.from({length: count}, () => {
      const c = randPick(COUNTRIES);
      return `${c.n} (${c.c}) · dial ${c.d}`;
    }).join('\n'));
  }, [count]);
  useEffect(() => { generate(); }, [generate]);
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Random country"
      status={{state:'ok', label:`${count} country${count===1?'':'ies'}`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎲', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'slider', label:'How many', value:count, min:1, max:20, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        {count === 1 ? <BigCodeResult theme={theme} value={list} wrap /> : <SmartOutput theme={theme} value={list} mono={false} />}
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── 19. Random Color Generator ─────────────────────────────────────────────
function RandomColorGen() {
  const theme = getCategoryById('generators');
  const tool = { id:'random-color-gen', name:'Random Color Generator', icon:'🎨' };
  const [count, setCount] = useState(1);
  const [colors, setColors] = useState([]);
  const generate = useCallback(() => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const bytes = safeCryptoBytes(3);
      const hex = '#' + Array.from(bytes).map((b) => b.toString(16).padStart(2,'0')).join('').toUpperCase();
      out.push(hex);
    }
    setColors(out);
  }, [count]);
  useEffect(() => { generate(); }, [generate]);
  const list = colors.join('\n');
  return (
    <InteractiveToolWorkspace theme={theme} tool={tool} outputLabel="Random color"
      status={{state:'ok', label:`${count} color${count===1?'':'s'}`}}
      onLoadSample={generate} onCopy={() => list}
      primaryAction={{ label:'Generate', icon:'🎨', onClick: generate }}>
      <InteractiveToolWorkspace.Controls>
        <SmartControls theme={theme} title="Options" fields={[
          { type:'slider', label:'How many', value:count, min:1, max:30, onChange:setCount },
        ]} />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input><GenerateBtn theme={theme} onClick={generate} icon="🎨" /></InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <div style={{ display:'grid', gap:8, gridTemplateColumns:'repeat(auto-fill, minmax(min(100%, 130px), 1fr))' }}>
          {colors.map((c) => (
            <div key={c} style={{ background:c, borderRadius:12, height:90, display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:8, fontFamily: theme.fonts.mono, fontSize:13, fontWeight:700, color:'#0a0a0a', boxShadow:'inset 0 0 0 2px rgba(255,255,255,0.18)' }}>
              <span style={{ background:'rgba(0,0,0,0.55)', color:'#fff', padding:'3px 8px', borderRadius:6 }}>{c}</span>
            </div>
          ))}
        </div>
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
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

{ id:"qr-url", cat:"qr", name:"QR Code URL Generator", desc:"Generate QR codes for URLs online instantly using live preview and copy-ready links for marketing pages and quick sharing.", icon:"🌐", free:true },
{ id:"qr-wifi", cat:"qr", name:"QR WiFi Generator", desc:"Create WiFi QR codes online from SSID, password, and encryption type for fast network onboarding and device setup.", icon:"📶", free:true },
{ id:"qr-vcard", cat:"qr", name:"QR vCard Generator", desc:"Generate vCard QR codes online with contact details for business cards, events, and frictionless mobile contact saving.", icon:"👤", free:true },
{ id:"qr-email", cat:"qr", name:"QR Email Generator", desc:"Generate email compose QR codes online with recipient, subject, and body fields for campaigns and support workflows.", icon:"✉️", free:true },
{ id:"qr-phone", cat:"qr", name:"QR Phone Generator", desc:"Create phone dialer QR codes online with tel links for instant calls from printed materials and landing pages.", icon:"📞", free:true },
{ id:"qr-sms", cat:"qr", name:"QR SMS Generator", desc:"Generate SMS QR codes online with prefilled recipient and message text for faster customer outreach and opt-in flows.", icon:"💬", free:true },
{ id:"qr-text", cat:"qr", name:"QR Text Generator", desc:"Create plain text QR codes online instantly for notes, labels, instructions, and offline-to-digital handoffs.", icon:"📝", free:true },
{ id:"qr-reader", cat:"qr", name:"QR Reader", desc:"Decode QR codes from uploaded images online using browser-based reader logic without server uploads or account signup.", icon:"🔍", free:true },

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
];

const CATEGORIES = [
{ id:"security", name:"Security Generators", icon:"🔐", desc:"Passwords, passphrases, API keys, encryption keys, and secure credential generators." },
{ id:"ids", name:"ID & Token Generators", icon:"🧬", desc:"UUIDs, GUIDs, Nano IDs, random strings, serials, and short hash IDs." },
{ id:"qr", name:"QR Code Generators", icon:"📱", desc:"Generate QR codes for URLs, WiFi, contact cards, messages, and decode uploaded QR images." },
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

const TOOL_COMPONENTS = {
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
"qr-url": QrUrl,
"qr-wifi": QrWifi,
"qr-vcard": QrVcard,
"qr-email": QrEmail,
"qr-phone": QrPhone,
"qr-sms": QrSms,
"qr-text": QrText,
"qr-reader": QrReader,
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
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <PremiumCategoryLanding
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
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}80`, flexShrink: 0 }} />
        <a href="https://toolsrift.com" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#F8FAFC", textDecoration: "none", letterSpacing: "-0.01em" }}>ToolsRift</a>
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
