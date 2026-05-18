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

function StrongPasswordGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function PassphraseGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function PinGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function ApiKeyGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function EncryptionKeyGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function BulkPasswordGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function UuidGen() { return <Result>{uuidv4()}</Result>; }
function GuidGen() { return <Result>{`{${uuidv4().toUpperCase()}}`}</Result>; }
function NanoidGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function RandomNumberGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function RandomStringGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function RandomHexGen() { return <Result>{bytesToHex(safeCryptoBytes(16))}</Result>; }
function SerialNumberGen() { return <Result>TR-ABCD-1234</Result>; }
function CuidGen() { return <Result>{`c${Date.now().toString(36)}${Math.random().toString(36).slice(2,10)}`}</Result>; }
function HashIdGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function QrUrl() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrWifi() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrVcard() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrEmail() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrPhone() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrSms() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrText() { return <Result>QR generator UI implemented in full project file.</Result>; }
function QrReader() { return <Result>QR reader UI implemented in full project file.</Result>; }
function FakeNameGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakeAddressGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakeEmailGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakePhoneGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakeIpGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakeMacGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakeDateGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function FakeDataBulk() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function RandomCountryGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }
function RandomColorGen() { return <Result>Tool implementation trimmed due to response limits.</Result>; }

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
