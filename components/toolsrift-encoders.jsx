import { useState, useEffect, useCallback, useMemo } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import PremiumCategoryLanding from './shared/PremiumCategoryLanding';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
import InteractiveToolWorkspace from './shared/InteractiveToolWorkspace';
import SmartInput from './shared/SmartInput';
import SmartOutput from './shared/SmartOutput';
import SmartControls from './shared/SmartControls';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

// �"����� BRAND / TOKENS �������������������������������������������������������������������������������������������������������������������"�
const C = {
  bg:"#06090F", surface:"#0D1117", border:"rgba(255,255,255,0.06)",
  blue:"#3B82F6", blueD:"#2563EB", text:"#E2E8F0", muted:"#64748B",
  success:"#10B981", warn:"#F59E0B", danger:"#EF4444", purple:"#8B5CF6",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(59,130,246,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  textarea{resize:vertical}
  .fade-in{animation:fadeIn .22s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
  .tr-nav-cats{display:flex;gap:4px;align-items:center}
  .tr-nav-badge{display:inline-flex}
  @media(max-width:640px){
    .tr-nav-cats{display:none!important}
    .tr-nav-badge{display:none!important}
  }
`;

const T = {
  body:{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono:{ fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label:{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1:{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2:{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// �"����� SHARED COMPONENTS ���������������������������������������������������������������������������������������������������������������"�
function Badge({ children, color="purple" }) {
  const bg={ blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", purple:"rgba(139,92,246,0.15)", red:"rgba(239,68,68,0.15)" };
  const fg={ blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", purple:"#A78BFA", red:"#FCA5A5" };
  return <span style={{ background:bg[color]||bg.purple, color:fg[color]||fg.purple, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{children}</span>;
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const base={ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz={ sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v={
    primary:{ background:`linear-gradient(135deg,${C.blue},${C.blueD})`, color:"#fff", boxShadow:"0 2px 8px rgba(59,130,246,0.25)" },
    secondary:{ background:"rgba(255,255,255,0.05)", color:C.text, border:`1px solid ${C.border}` },
    ghost:{ background:"transparent", color:C.muted },
    blue:{ background:`linear-gradient(135deg,${C.blue},${C.blueD})`, color:"#fff", boxShadow:"0 2px 8px rgba(59,130,246,0.25)" },
    danger:{ background:"rgba(239,68,68,0.15)", color:"#FCA5A5" },
  }[variant];
  const p={ style:{...base,...sz,...v,...style}, onClick, disabled };
  if(href) return <a href={href} {...p}>{children}</a>;
  return <button {...p}>{children}</button>;
}

function Input({ value, onChange, placeholder, style={}, mono=false }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", ...style }}
      onFocus={e=>e.target.style.borderColor=C.purple} onBlur={e=>e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=true, readOnly=false, style={} }) {
  return (
    <textarea value={value} onChange={e=>onChange&&e&&onChange(e.target.value)} placeholder={placeholder} rows={rows} readOnly={readOnly}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e=>!readOnly&&(e.target.style.borderColor=C.purple)} onBlur={e=>e.target.style.borderColor=C.border} />
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", cursor:"pointer", ...style }}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, ...style }}>{children}</div>;
}

function Label({ children }) {
  return <div style={{ ...T.label, marginBottom:6 }}>{children}</div>;
}

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

function IOPanel({ inputLabel="Input", outputLabel="Output", input, onInput, output, outputMono=true, inputMono=true, rows=7, children, error="" }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <Label>{inputLabel}</Label>
        <Textarea value={input} onChange={onInput} rows={rows} mono={inputMono} placeholder="Enter text here..." />
        {children}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Label>{outputLabel}</Label>
          {output && !error && <CopyBtn text={output} />}
        </div>
        {error
          ? <div style={{ padding:"12px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:C.danger }}>{error}</div>
          : <Textarea value={output} onChange={()=>{}} rows={rows} mono={outputMono} readOnly />
        }
      </div>
    </div>
  );
}

function StatRow({ label, value, mono=false }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}>
      <span style={{ color:C.muted }}>{label}</span>
      <span style={{ color:C.text, fontFamily:mono?"'JetBrains Mono',monospace":"inherit", fontWeight:600 }}>{value}</span>
    </div>
  );
}

function VStack({ children, gap=12 }) {
  return <div style={{ display:"flex", flexDirection:"column", gap }}>{children}</div>;
}

function Grid2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>;
}

function ModeToggle({ mode, setMode, options }) {
  return (
    <div style={{ display:"inline-flex", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:3, gap:2 }}>
      {options.map(([v,l])=>(
        <button key={v} onClick={()=>setMode(v)} style={{ padding:"6px 16px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif", background:mode===v?`linear-gradient(135deg,${C.blue},${C.blueD})`:"transparent", color:mode===v?"#fff":C.muted, transition:"all .15s" }}>{l}</button>
      ))}
    </div>
  );
}

// �"����� ROUTER �������������������������������������������������������������������������������������������������������������������������������������"�
function useAppRouter() {
  const parse = () => {
    const h = window.location.hash||"#/";
    const path = h.replace(/^#/, "").replace(/\?.*$/, "") || "/";
    const parts = path.split("/").filter(Boolean);
    if(!parts.length) return { page:"home" };
    if(parts[0]==="tool"&&parts[1]) return { page:"tool", toolId:parts[1] };
    if(parts[0]==="category"&&parts[1]) return { page:"category", catId:parts[1] };
    return { page:"home" };
  };
  const [route, setRoute] = useState(parse);
  useEffect(()=>{
    const onHash=()=>setRoute(parse());
    window.addEventListener("hashchange",onHash);
    return ()=>window.removeEventListener("hashchange",onHash);
  },[]);
  useEffect(()=>{
    const onClick=e=>{
      const a=e.target.closest("a[href]");
      if(!a) return;
      const h=a.getAttribute("href");
      if(h&&h.startsWith("#/")){e.preventDefault();window.location.hash=h;}
    };
    document.addEventListener("click",onClick);
    return ()=>document.removeEventListener("click",onClick);
  },[]);
  return route;
}

// �"����� TOOL REGISTRY �����������������������������������������������������������������������������������������������������������������������"�
const TOOLS = [
  { id:"base64-encode",        cat:"base",    name:"Base64 Encoder",           desc:"Encode text or files to Base64 string format",            icon:"🔢", free:true },
  { id:"base64-decode",        cat:"base",    name:"Base64 Decoder",           desc:"Decode Base64 strings back to plain text or binary",      icon:"🔢", free:true },
  { id:"base64-image",         cat:"base",    name:"Base64 Image Encoder",     desc:"Convert images to Base64 data URIs for CSS/HTML",         icon:"🔢", free:true },
  { id:"base32-encode",        cat:"base",    name:"Base32 Encoder",           desc:"Encode text using RFC 4648 Base32 encoding",              icon:"🔁", free:true },
  { id:"base32-decode",        cat:"base",    name:"Base32 Decoder",           desc:"Decode Base32 encoded strings back to plain text",        icon:"🔁", free:true },
  { id:"url-encode",           cat:"url",     name:"URL Encoder",              desc:"Percent-encode special characters for safe URL usage",    icon:"🔗", free:true },
  { id:"url-decode",           cat:"url",     name:"URL Decoder",              desc:"Decode percent-encoded URLs back to readable text",       icon:"🔗", free:true },
  { id:"html-encode",          cat:"html",    name:"HTML Entities Encoder",    desc:"Encode special characters to HTML entity references",     icon:"📄", free:true },
  { id:"html-decode",          cat:"html",    name:"HTML Entities Decoder",    desc:"Decode HTML entities back to their plain text form",      icon:"📄", free:true },
  { id:"binary-encode",        cat:"binary",  name:"Text to Binary",           desc:"Convert text to 8-bit binary (0s and 1s) format",         icon:"🔢", free:true },
  { id:"binary-decode",        cat:"binary",  name:"Binary to Text",           desc:"Convert binary (0s and 1s) back to readable text",        icon:"🔢", free:true },
  { id:"hex-encode",           cat:"binary",  name:"Text to Hex",              desc:"Convert text to hexadecimal (base 16) encoding",          icon:"🔢", free:true },
  { id:"hex-decode",           cat:"binary",  name:"Hex to Text",              desc:"Decode hexadecimal values back to readable text",         icon:"🟣", free:true },
  { id:"ascii-table",          cat:"binary",  name:"ASCII Code Lookup",        desc:"Look up ASCII codes and convert characters to/from codes", icon:"🔄", free:true },
  { id:"octal-encode",         cat:"binary",  name:"Text to Octal",            desc:"Encode text as octal (base 8) numbers",                   icon:"🔢", free:true },
  { id:"unicode-encode",       cat:"unicode", name:"Unicode Encoder",          desc:"Encode text to Unicode code points (\\u escape format)",   icon:"✨", free:true },
  { id:"unicode-decode",       cat:"unicode", name:"Unicode Decoder",          desc:"Decode Unicode escape sequences back to text",            icon:"🔁", free:true },
  { id:"unicode-lookup",       cat:"unicode", name:"Unicode Character Lookup", desc:"Look up any Unicode character by code point or name",     icon:"🔤", free:true },
  { id:"jwt-decoder",          cat:"special", name:"JWT Decoder",              desc:"Decode & inspect JWT tokens (header, payload, signature)", icon:"🔐", free:true },
  { id:"caesar-cipher",        cat:"cipher",  name:"Caesar Cipher",            desc:"Encode or decode text with the classic Caesar shift cipher", icon:"🔐", free:true },
  { id:"vigenere-cipher",      cat:"cipher",  name:"Vigenère Cipher",          desc:"Encrypt or decrypt text using the Vigenère polyalphabetic cipher", icon:"🔐", free:true },
  { id:"atbash-cipher",        cat:"cipher",  name:"Atbash Cipher",            desc:"Encode text using the Atbash mirror substitution cipher",  icon:"🪞", free:true },
  { id:"morse-encoder",        cat:"cipher",  name:"Morse Code Encoder",       desc:"Convert text to Morse code with audio playback support",   icon:"📡", free:true },
  { id:"quoted-printable",     cat:"special", name:"Quoted-Printable Encoder", desc:"Encode text using MIME quoted-printable encoding for email", icon:"📧", free:true },
  { id:"xml-encode",           cat:"html",    name:"XML Encoder / Decoder",    desc:"Encode and decode XML special characters safely",          icon:"📄", free:true },
];

const CATEGORIES = [
  { id:"base",    name:"Base Encodings", icon:"🔢", desc:"Base64, Base32 and data URI encodings" },
  { id:"url",     name:"URL Encoding",   icon:"🔗", desc:"Percent encoding for URLs and query strings" },
  { id:"html",    name:"HTML & XML",     icon:"📄", desc:"HTML entities, XML escaping" },
  { id:"binary",  name:"Binary & Hex",   icon:"🔢", desc:"Binary, hexadecimal, octal, ASCII" },
  { id:"unicode", name:"Unicode",        icon:"🔤", desc:"Unicode code points, escape sequences" },
  { id:"cipher",  name:"Classic Ciphers", icon:"📡", desc:"Caesar, Vigenère, Atbash, Morse" },
  { id:"special", name:"Special Formats", icon:"🔐", desc:"JWT, Quoted-Printable and more" },
];

const TOOL_META = {
  "base64-encode": { title:"Free Base64 Encoder — Encode Text to Base64 Online", desc:"Encode any text or binary data to Base64 string format. Supports standard and URL-safe Base64 encoding.", faq:[["What is Base64?","Base64 encodes binary data into 64 ASCII characters (A—Z, a'z, 0–9, +, /) making it safe to transmit in text-based protocols."],["When is Base64 used?","Embedding images in HTML/CSS, encoding email attachments (MIME), and transmitting binary data in JSON/XML APIs."],["Does Base64 encrypt data?","No — Base64 is encoding, not encryption. Anyone can decode it. Use it only for format compatibility, not security."]] },
  "base64-decode": { title:"Free Base64 Decoder — Decode Base64 Strings Online", desc:"Instantly decode Base64 encoded strings back to plain text. Supports standard and URL-safe Base64.", faq:[["Why does Base64 use = padding?","Padding aligns output to multiples of 4 characters. Some implementations omit it — the decoder handles both."],["What if my Base64 has line breaks?","This decoder strips line breaks before decoding — common in MIME-encoded email content."],["Can I decode Base64 images?","Paste the Base64 data (after the data:image/png;base64, prefix) to see the raw data."]] },
  "base64-image": { title:"Image to Base64 Converter — Encode Images as Data URIs", desc:"Convert PNG, JPEG, GIF, SVG images to Base64 data URIs for use in HTML, CSS, and JavaScript.", faq:[["What is a Base64 data URI?","A self-contained URL that embeds file data directly: data:image/png;base64,iVBOR..."],["When should I use Base64 images?","For small icons or logos to eliminate HTTP requests. Avoid for large images as Base64 is ~33% larger than binary."],["What formats are supported?","PNG, JPEG, GIF, WebP, SVG, BMP, ICO and most common web image formats."]] },
  "base32-encode": { title:"Base32 Encoder — Encode Text to Base32 Online", desc:"Encode text using RFC 4648 Base32 encoding. Uses A—Z and 2–7 alphabet, no case ambiguity.", faq:[["What is Base32?","Base32 uses 32 ASCII characters (A—Z, 2–7) and is human-readable, case-insensitive, and safe in DNS names."],["How does Base32 differ from Base64?","Base32 is ~20% larger than Base64 but uses only uppercase letters and digits 2–7, making it unambiguous to read/dictate."],["Where is Base32 used?","Google Authenticator TOTP seeds, Bitcoin addresses, IPFS CIDs, and file format signatures."]] },
  "base32-decode": { title:"Base32 Decoder — Decode Base32 Strings Online", desc:"Decode RFC 4648 Base32 encoded strings back to plain text. Handles optional padding.", faq:[["Does it require uppercase input?","No — the decoder normalizes to uppercase before decoding. 'hello' and 'HELLO' are treated the same."],["What if padding (=) is missing?","The decoder auto-pads the input to a valid multiple of 8 characters before decoding."],["Why does Base32 use 2–7 instead of 0–9?","0 looks like O, 1 looks like I and L. Using 2–7 eliminates all visually ambiguous characters."]] },
  "url-encode": { title:"URL Encoder — Percent Encode URLs Online", desc:"Percent-encode special characters in URLs and query string values. RFC 3986 compliant.", faq:[["What characters need URL encoding?","Spaces, &, =, #, %, ?, +, and non-ASCII characters must be encoded as %XX hex sequences."],["What is the difference between + and %20?","Both represent a space. %20 is used in URL paths; + is used in HTML form data (application/x-www-form-urlencoded)."],["Should I encode the full URL or just parameters?","Only encode individual query parameter values, not the entire URL — encoding colons in http:// or slashes breaks the URL."]] },
  "url-decode": { title:"URL Decoder — Decode Percent-Encoded URLs Online", desc:"Decode percent-encoded URL strings back to human-readable text. Handles %20, %2F, + and all encodings.", faq:[["Why does my URL have %20 everywhere?","Spaces in URLs are encoded as %20 (or + in query strings). Decoding reveals the original readable URL."],["Does it handle Unicode URLs?","Yes — %C3%A9 and similar multi-byte UTF-8 sequences are decoded to their Unicode characters."],["What if there are double-encoded characters?","Enable the 'decode twice' option to handle URLs that were encoded multiple times."]] },
  "html-encode": { title:"HTML Entity Encoder — Escape HTML Characters Online", desc:"Encode special HTML characters to entity references. Prevents XSS and renders text safely in HTML.", faq:[["Which characters must be HTML-encoded?","<, >, &, \" and ' must be encoded to prevent HTML injection and XSS vulnerabilities."],["What is the difference between &#60; and &lt;?","They both produce '<'. Named entities (&lt;) are more readable; numeric entities (&#60;) work in all parsers."],["Should I encode all characters?","For security, encode at least <, >, &, \" and '. Full encoding is optional but ensures maximum compatibility."]] },
  "html-decode": { title:"HTML Entity Decoder — Unescape HTML Entities Online", desc:"Decode HTML entities back to their original characters. Handles named, decimal, and hex entities.", faq:[["Which HTML entities are decoded?","All standard named entities (&amp;, &lt;, &gt;, &quot;, etc.) plus numeric &#NNN; and hex &#xNNN; forms."],["Can I decode HTML source code?","Yes — paste any HTML and all entities within it will be decoded to their visible characters."],["Is this safe to use on untrusted HTML?","Yes — decoding entities is safe. Never inject decoded output back into live HTML without sanitization."]] },
  "binary-encode": { title:"Text to Binary Converter — Convert Text to 0s and 1s", desc:"Convert any text to 8-bit binary representation. Shows binary for each ASCII/Unicode character.", faq:[["How is text converted to binary?","Each character's ASCII or Unicode code point is represented as an 8-bit (or 16-bit for Unicode) binary number."],["What is 'A' in binary?","'A' is ASCII 65, which is 01000001 in 8-bit binary."],["Can I convert binary back?","Yes — use the Binary to Text decoder to convert binary 0s and 1s back to readable characters."]] },
  "binary-decode": { title:"Binary to Text Decoder — Convert Binary to Text Online", desc:"Convert binary (0s and 1s) back to readable text. Handles 8-bit ASCII binary and space-separated groups.", faq:[["How should I format binary input?","Space-separate 8-bit groups: '01001000 01100101 01101100 01101100 01101111' for 'Hello'."],["What if my binary isn't divisible by 8?","The decoder pads the last group with leading zeros to complete an 8-bit byte."],["Can it decode 16-bit Unicode binary?","Yes — enable 16-bit mode for characters outside the basic ASCII range."]] },
  "hex-encode": { title:"Text to Hex Converter — Convert Text to Hexadecimal", desc:"Convert any text to hexadecimal (base 16) encoding. Shows hex codes for each character.", faq:[["What is hexadecimal encoding?","Each character is represented as its byte value in base 16 (0–9, A—F). 'A' = 0x41."],["Is hex the same as Base16?","Yes — hexadecimal and Base16 are the same encoding. Hex is commonly used for binary data, color codes, and memory addresses."],["How is hex used in practice?","HTML color codes (#FF5733), CSS colors, MD5/SHA hash values, and memory addresses all use hex."]] },
  "hex-decode": { title:"Hex to Text Decoder — Convert Hexadecimal to Text", desc:"Decode hexadecimal strings back to readable text. Handles spaced and non-spaced hex input.", faq:[["Should hex be uppercase or lowercase?","Either works — the decoder normalizes to uppercase before parsing."],["Can I paste hex with spaces?","Yes — '48 65 6C 6C 6F' and '48656c6c6f' are both decoded to 'Hello'."],["What if I have a 0x prefix?","The 0x prefix is stripped automatically before decoding."]] },
  "ascii-table": { title:"ASCII Code Lookup Table — Characters, Codes & Hex", desc:"Complete ASCII reference table. Look up any character by its decimal code, hex value, or binary.", faq:[["What is ASCII?","American Standard Code for Information Interchange — a 7-bit character encoding standard covering 128 characters (0–127)."],["What are control characters?","ASCII 0–31 are non-printable control characters like NUL (0), TAB (9), LF (10), CR (13)."],["What is extended ASCII?","Codes 128–255 are extended ASCII — varies by code page. This table shows standard 7-bit ASCII only."]] },
  "octal-encode": { title:"Text to Octal Encoder — Convert Text to Base 8", desc:"Convert text to octal (base 8) representation. Each character encoded as its byte value in base 8.", faq:[["What is octal?","Base 8 — uses digits 0–7. Commonly used in Unix file permissions (chmod 755) and older systems."],["How is 'A' encoded in octal?","'A' is ASCII 65 decimal = 101 octal."],["When is octal used today?","Unix/Linux file permission bits use octal: rwx = 7 (4+2+1), r-x = 5 (4+1)."]] },
  "unicode-encode": { title:"Unicode Encoder — Convert Text to Unicode Escape Sequences", desc:"Encode text to Unicode escape sequences (\\u0041 format). Useful for JavaScript, Python, and JSON strings.", faq:[["What is a Unicode escape sequence?","A \\u followed by a 4-digit hex code point, like \\u0041 for 'A'. Used in JavaScript, JSON, Java, C."],["What is the difference between \\u and \\U?","\\u is for 4-digit BMP code points. \\U (Python) handles full range including emoji above U+FFFF."],["Should I encode ASCII characters?","Only encode non-ASCII characters for safety. Encoding ASCII is valid but unnecessary."]] },
  "unicode-decode": { title:"Unicode Decoder — Decode Unicode Escape Sequences", desc:"Decode \\u and \\U escape sequences back to readable Unicode characters. Supports JS, Python, and CSS formats.", faq:[["What formats does it support?","\\uXXXX (JS/JSON), \\UXXXXXXXX (Python), \\XXXXXX (CSS), and &#xXXXX; (HTML hex) formats."],["Can it decode emoji?","Yes — \\u{1F600} or \\uD83D\\uDE00 (surrogate pair) for 😀 are both supported."],["What if I mix encoded and plain text?","Only the escape sequences are decoded; surrounding plain text is left as-is."]] },
  "unicode-lookup": { title:"Unicode Character Lookup — Find Characters by Code Point", desc:"Look up any Unicode character by code point (U+XXXX) or search by character name.", faq:[["How do I enter a code point?","Type 'U+1F600' or just '1F600' for 😀. Decimal (128512) is also accepted."],["What information is shown?","Code point, character name, block/category, HTML entity, CSS escape, and JS escape sequences."],["Can I search by character name?","Yes — search 'snowman' or 'thumbs up' to find characters by their Unicode name."]] },
  "jwt-decoder": { title:"JWT Decoder — Decode & Inspect JWT Tokens Online", desc:"Decode JSON Web Tokens (JWT) without a secret. View header, payload, and signature components.", faq:[["Is it safe to paste my JWT here?","Never paste production tokens in public tools. This tool runs entirely in your browser with no server transmission."],["Can it verify the signature?","Signature verification requires the secret key. This tool decodes the header and payload only."],["What are the three JWT parts?","Header (algorithm), Payload (claims/data), Signature (verification). Separated by dots."]] },
  "caesar-cipher": { title:"Caesar Cipher Encoder & Decoder — Classic ROT Shift Online", desc:"Encode or decode text with the Caesar shift cipher. Choose any shift from 1–25.", faq:[["What is the Caesar cipher?","A substitution cipher where each letter is shifted N positions in the alphabet. ROT13 is Caesar shift 13."],["How secure is the Caesar cipher?","Not secure at all — only 25 possible keys, easily broken by brute force or frequency analysis."],["Can I brute force all 25 shifts?","Yes — the tool shows all 25 possible decodings at once in brute force mode."]] },
  "vigenere-cipher": { title:"Vigenère Cipher Encoder & Decoder — Polyalphabetic Cipher", desc:"Encrypt and decrypt text using the Vigenère polyalphabetic substitution cipher with a keyword.", faq:[["What is the Vigenère cipher?","A series of Caesar ciphers with different shifts determined by the letters of a repeating keyword."],["How secure is Vigenère?","Much stronger than Caesar but still breakable via Kasiski examination for long ciphertexts. Not suitable for modern security."],["What should the key be?","A single word or phrase using only letters (A—Z). Longer keys are harder to crack."]] },
  "atbash-cipher": { title:"Atbash Cipher Encoder & Decoder — Mirror Alphabet Cipher", desc:"Encode text with the Atbash cipher — mirror the alphabet (A—Z, B—Y). Symmetric encode/decode.", faq:[["What is the Atbash cipher?","A substitution cipher where each letter is mapped to its mirror: A—'Z, B—'Y, ..., Z—'A."],["Is it symmetric?","Yes — encoding and decoding use the exact same operation. Apply it twice to get the original."],["Where did Atbash originate?","Ancient Hebrew cryptography. 'Atbash' itself encodes the first and last Hebrew letters: Aleph-Tav-Bet-Shin."]] },
  "morse-encoder": { title:"Morse Code Encoder & Decoder — Convert Text to Morse", desc:"Convert text to Morse code and back. Audio playback with adjustable speed and dot/dash customization.", faq:[["What is Morse code?","An encoding where letters are represented as sequences of dots (•) and dashes (—)."],["Can I hear the Morse code?","Yes — click Play to hear the Morse code using your browser's Web Audio API."],["What characters are supported?","A—Z, 0–9, and common punctuation: . , ? ' ! / ( ) & : ; = + - _ \" $ @"]] },
  "quoted-printable": { title:"Quoted-Printable Encoder — MIME Email Encoding", desc:"Encode text using MIME Quoted-Printable encoding for email headers and bodies. RFC 2045 compliant.", faq:[["What is Quoted-Printable?","A MIME encoding where most ASCII characters pass through unchanged, but non-ASCII bytes become =XX hex sequences."],["When is Quoted-Printable used?","In email bodies containing mostly ASCII with some special characters. More readable than Base64 for text content."],["What is the line length limit?","RFC 2045 requires lines to be no longer than 76 characters, with = as a soft line break."]] },
  "xml-encode": { title:"XML Encoder & Decoder — Escape XML Special Characters", desc:"Encode and decode XML special characters. Escapes <, >, &, ', \" for safe XML content.", faq:[["Which characters must be escaped in XML?","& —' &amp;, < —' &lt;, > —' &gt;, \" —' &quot;, ' —' &apos;"],["Is XML encoding the same as HTML encoding?","Almost — XML uses &apos; while HTML prefers &#39;. XML requires stricter well-formedness."],["When is XML encoding needed?","When embedding user-provided text inside XML tags or attributes to prevent XML injection attacks."]] },
};

// �"����� MORSE TABLE �������������������������������������������������������������������������������������������������������������������������"�
const MORSE_MAP = {A:"•-",B:"-•••",C:"-•-•",D:"-••",E:"•",F:"••-•",G:"--•",H:"••••",I:"••",J:"•---",K:"-•-",L:"•-••",M:"--",N:"-•",O:"---",P:"•--•",Q:"--•-",R:"•-•",S:"•••",T:"-",U:"••-",V:"•••-",W:"•--",X:"-••-",Y:"-•--",Z:"--••","0":"-----","1":"•----","2":"••---","3":"•••--","4":"••••-","5":"•••••","6":"-••••","7":"--•••","8":"---••","9":"----•",".":"•-•-•-",",":" --••--","?":"••--••","'":"•----•","!":"-•-•--","/":"-••-•","(":"-•--•",")":"-•--•-","&":"•-•••",":":"---•••",";":"-•-•-•","=":"-•••-","+":"•-•-•","-":"-••••-","_":"••--•-",'"':"•-••-•","$":"•••-••-","@":"•--•-•"," ":"/"};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE_MAP).map(([k,v])=>[v,k]));

// �"����� BASE32 �������������������������������������������������������������������������������������������������������������������������������������"�
const B32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(str) {
  let bits = "";
  for(let i=0;i<str.length;i++) bits += str.charCodeAt(i).toString(2).padStart(8,"0");
  while(bits.length%5!==0) bits+="0";
  let out="";
  for(let i=0;i<bits.length;i+=5) out+=B32_CHARS[parseInt(bits.slice(i,i+5),2)];
  while(out.length%8!==0) out+="=";
  return out;
}
function base32Decode(str) {
  const s=str.toUpperCase().replace(/=/g,"");
  let bits="";
  for(const c of s){ const i=B32_CHARS.indexOf(c); if(i<0) throw new Error(`Invalid Base32 char: ${c}`); bits+=i.toString(2).padStart(5,"0"); }
  let out="";
  for(let i=0;i+8<=bits.length;i+=8) out+=String.fromCharCode(parseInt(bits.slice(i,i+8),2));
  return out;
}

// �"����� QUOTED-PRINTABLE �����������������������������������������������������������������������������������������������������������������"�
function qpEncode(str) {
  let out="";
  let lineLen=0;
  for(const c of str){
    const code=c.charCodeAt(0);
    let encoded;
    if((code>=33&&code<=126&&c!=="=")||c===" "||c==="\t") encoded=c;
    else if(c==="\r"||c==="\n"){ out+=c; lineLen=0; continue; }
    else encoded="="+code.toString(16).toUpperCase().padStart(2,"0");
    if(lineLen+encoded.length>75){ out+="=\r\n"; lineLen=0; }
    out+=encoded; lineLen+=encoded.length;
  }
  return out;
}
function qpDecode(str) {
  return str.replace(/=\r?\n/g,"").replace(/=([0-9A-Fa-f]{2})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
}

// �"����� TOOL COMPONENTS �����������������������������������������������������������������������������������������������������������������"�

// �"��� Base64 Encode �������������������������������������������������������������������������������������������������������������������������"�
function Base64Encode() {
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const theme = getCategoryById('encoders');
  const tool  = { id:'base64-encode', name:'Base64 Encoder', icon:'🔢' };
  const { output, error } = useMemo(() => {
    if (!input) return { output:'', error:'' };
    try {
      let enc = btoa(unescape(encodeURIComponent(input)));
      if (urlSafe) enc = enc.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
      return { output: enc, error: '' };
    } catch (e) { return { output:'', error:'Encoding failed: '+e.message }; }
  }, [input, urlSafe]);

  const status = error
    ? { state:'error', label:'Error', detail:error }
    : input
      ? { state:'live', label:'Encoded', detail:`${output.length.toLocaleString()} chars` }
      : { state:'idle', label:'Waiting for text' };

  return (
    <InteractiveToolWorkspace
      theme={theme}
      tool={tool}
      inputLabel="Plain text"
      outputLabel="Base64"
      status={status}
      stats={{ chars: input.length, detail: input ? `${Math.round((output.length/Math.max(input.length,1)-1)*100)}% larger` : '' }}
      onLoadSample={() => setInput('Hello, ToolsRift! 👋 — Encode me to Base64.')}
      onClear={() => setInput('')}
      onCopy={() => output}
      onDownload={() => ({ content: output, filename: 'encoded.base64.txt' })}
      shareState={input ? { t: input, u: urlSafe } : null}
      onRestoreState={(st) => { if (typeof st?.t === 'string') setInput(st.t); if (typeof st?.u === 'boolean') setUrlSafe(st.u); }}
    >
      <InteractiveToolWorkspace.Controls>
        <SmartControls
          theme={theme}
          title="Options"
          fields={[
            { type:'toggle', label:'URL-safe Base64', hint:'Uses -_ instead of +/, strips = padding', value:urlSafe, onChange:setUrlSafe },
          ]}
        />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <SmartInput
          theme={theme}
          value={input}
          onChange={setInput}
          placeholder="Type or paste any text…"
          rows={10}
          maxRows={26}
          ariaLabel="Text to encode"
        />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <SmartOutput
          theme={theme}
          value={output}
          empty="Base64 output appears here as you type."
          mono
        />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// ─── Base64 Decode ──────────────────────────────────────────────────────────
function Base64Decode() {
  const [input, setInput] = useState("");
  const theme = getCategoryById('encoders');
  const tool  = { id:'base64-decode', name:'Base64 Decoder', icon:'🔢' };
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output:'', error:'' };
    try {
      let s = input.trim().replace(/\s/g,'').replace(/-/g,'+').replace(/_/g,'/');
      while (s.length % 4) s += '=';
      const decoded = decodeURIComponent(escape(atob(s)));
      return { output: decoded, error: '' };
    } catch (e) { return { output:'', error:'Invalid Base64: '+e.message }; }
  }, [input]);

  const status = error
    ? { state:'error', label:'Invalid', detail:error }
    : input.trim()
      ? { state:'ok', label:'Decoded', detail:`${output.length.toLocaleString()} chars` }
      : { state:'idle', label:'Paste a Base64 string' };

  return (
    <InteractiveToolWorkspace
      theme={theme}
      tool={tool}
      inputLabel="Base64 string"
      outputLabel="Decoded text"
      status={status}
      stats={{ chars: input.length }}
      onLoadSample={() => setInput('SGVsbG8sIFRvb2xzUmlmdCEg8J+RiyDigJQgRGVjb2RlIG1lLg==')}
      onClear={() => setInput('')}
      onCopy={() => output}
      onDownload={() => ({ content: output, filename: 'decoded.txt' })}
      shareState={input ? { t: input } : null}
      onRestoreState={(st) => { if (typeof st?.t === 'string') setInput(st.t); }}
    >
      <InteractiveToolWorkspace.Input>
        <SmartInput
          theme={theme}
          value={input}
          onChange={setInput}
          placeholder="Paste a Base64-encoded string (standard or URL-safe)…"
          rows={10}
          maxRows={26}
          mono
          ariaLabel="Base64 to decode"
        />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <SmartOutput
          theme={theme}
          value={output}
          empty="Decoded text appears here. Whitespace, line-breaks and padding are handled automatically."
          mono={false}
        />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// �"��� Base64 Image ���������������������������������������������������������������������������������������������������������������������������"�
function Base64Image() {
  const [dataUri, setDataUri] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useCallback(node=>{ if(node) node.value=""; },[]);

  const processFile = file => {
    if(!file) return;
    if(!file.type.startsWith("image/")){ setError("Please upload an image file."); return; }
    setFileName(file.name); setMimeType(file.type); setError("");
    const reader = new FileReader();
    reader.onload = e => setDataUri(e.target.result);
    reader.readAsDataURL(file);
  };

  const onFile = e => processFile(e.target.files[0]);
  const onDrop = e => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };

  const b64Only = dataUri.split(",")[1]||"";
  const cssUrl = `url("${dataUri}")`;
  const imgTag = `<img src="${dataUri}" alt="${fileName||"image"}" />`;

  return (
    <VStack>
      <div
        onDragEnter={()=>setDragging(true)} onDragLeave={()=>setDragging(false)} onDragOver={e=>e.preventDefault()} onDrop={onDrop}
        style={{ border:`2px dashed ${dragging?C.purple:C.border}`, borderRadius:12, padding:32, textAlign:"center", background:dragging?"rgba(139,92,246,0.08)":"rgba(255,255,255,0.02)", cursor:"pointer", transition:"all .15s" }}
        onClick={()=>document.getElementById("b64img-input").click()}>
        <div style={{ fontSize:36, marginBottom:8 }}>🖼—</div>
        <div style={{ fontSize:13, color:C.text, marginBottom:4 }}>Drag & drop an image here</div>
        <div style={{ fontSize:12, color:C.muted }}>or click to browse —" PNG, JPG, GIF, SVG, WebP</div>
        <input ref={fileRef} id="b64img-input" type="file" accept="image/*" onChange={onFile} style={{ display:"none" }} />
      </div>
      {error && <div style={{ color:C.danger, fontSize:13 }}>{error}</div>}
      {dataUri && (
        <>
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <img src={dataUri} alt="preview" style={{ maxWidth:160, maxHeight:120, borderRadius:8, border:`1px solid ${C.border}`, objectFit:"contain", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ flex:1 }}>
              {[["File", fileName],["MIME Type", mimeType],["Base64 Length", b64Only.length+" chars"],["Data URI Length", dataUri.length+" chars"]].map(([l,v])=><StatRow key={l} label={l} value={v} />)}
            </div>
          </div>
          {[
            ["Base64 Data Only (without prefix)", b64Only],
            ["Full Data URI (for <img src>)", dataUri],
            ["CSS Background", cssUrl],
            ["HTML img tag", imgTag],
          ].map(([label, val])=>(
            <div key={label}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <Label>{label}</Label>
                <CopyBtn text={val} />
              </div>
              <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.muted, wordBreak:"break-all", maxHeight:60, overflow:"hidden" }}>
                {val.slice(0,200)}{val.length>200?"…":""}
              </div>
            </div>
          ))}
        </>
      )}
    </VStack>
  );
}

// �"��� Base32 ���������������������������������������������������������������������������������������������������������������������������������������"�
function Base32EncodeComp() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const output = useMemo(()=>{ try{ setError(""); return input?base32Encode(input):""; } catch(e){ setError(e.message); return ""; } },[input]);
  return <VStack><IOPanel input={input} onInput={setInput} output={output} inputLabel="Plain Text" outputLabel="Base32 Encoded" error={error} /></VStack>;
}
function Base32DecodeComp() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const output = useMemo(()=>{ try{ setError(""); return input.trim()?base32Decode(input.trim()):""; } catch(e){ setError(e.message); return ""; } },[input]);
  return <VStack><IOPanel input={input} onInput={setInput} output={output} inputLabel="Base32 Encoded String" outputLabel="Decoded Text" error={error} inputMono /></VStack>;
}

// �"��� URL Encode/Decode �����������������������������������������������������������������������������������������������������������������"�
function UrlEncode() {
  const theme = getCategoryById('encoders');
  const tool  = { id:'url-encode', name:'URL Encoder', icon:'🔗' };
  const [input, setInput] = useState("");
  const [mode, setMode]   = useState('component');
  const output = useMemo(() => {
    if (!input) return '';
    return mode === 'component' ? encodeURIComponent(input) : encodeURI(input);
  }, [input, mode]);
  const status = input
    ? { state:'live', label:'Encoded', detail:`${output.length.toLocaleString()} chars` }
    : { state:'idle', label:'Paste text or URL' };
  return (
    <InteractiveToolWorkspace
      theme={theme}
      tool={tool}
      inputLabel="Plain text / URL"
      outputLabel="URL-encoded"
      status={status}
      stats={{ chars: input.length }}
      onLoadSample={() => setInput('https://toolsrift.com/search?q=hello world & friends')}
      onClear={() => setInput('')}
      onCopy={() => output}
      onDownload={() => ({ content: output, filename: 'url-encoded.txt' })}
      shareState={input ? { t: input, m: mode } : null}
      onRestoreState={(st) => { if (typeof st?.t === 'string') setInput(st.t); if (typeof st?.m === 'string') setMode(st.m); }}
    >
      <InteractiveToolWorkspace.Controls>
        <SmartControls
          theme={theme}
          title="Encoding mode"
          fields={[
            { type:'segmented', label:'Mode', value:mode,
              options:[{value:'component',label:'Component (safe)'},{value:'full',label:'Full URI'}], onChange:setMode },
          ]}
        />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <SmartInput
          theme={theme}
          value={input}
          onChange={setInput}
          placeholder="Paste text or a URL with spaces / special chars…"
          rows={10}
        />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <SmartOutput
          theme={theme}
          value={output}
          empty={mode === 'component' ? 'Encodes everything except A-Z a-z 0-9 - _ . !' : 'Preserves :// ? = & # / so the URL structure stays valid.'}
          mono
        />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

function UrlDecode() {
  const theme = getCategoryById('encoders');
  const tool  = { id:'url-decode', name:'URL Decoder', icon:'🔗' };
  const [input, setInput] = useState('');
  const [twice, setTwice] = useState(false);
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output:'', error:'' };
    try {
      let d = decodeURIComponent(input.replace(/\+/g, ' '));
      if (twice) d = decodeURIComponent(d.replace(/\+/g, ' '));
      return { output:d, error:'' };
    } catch (e) { return { output:'', error: 'Malformed URL encoding: ' + e.message }; }
  }, [input, twice]);
  const status = error
    ? { state:'error', label:'Invalid', detail:error.slice(0, 50) }
    : input.trim()
      ? { state:'ok', label:'Decoded', detail:`${output.length.toLocaleString()} chars` }
      : { state:'idle', label:'Paste a URL-encoded string' };
  return (
    <InteractiveToolWorkspace
      theme={theme}
      tool={tool}
      inputLabel="URL-encoded string"
      outputLabel="Decoded"
      status={status}
      stats={{ chars: input.length }}
      onLoadSample={() => setInput('https%3A%2F%2Ftoolsrift.com%2Fsearch%3Fq%3Dhello%2520world')}
      onClear={() => setInput('')}
      onCopy={() => output}
      onDownload={() => ({ content: output, filename: 'url-decoded.txt' })}
      shareState={input ? { t: input, d: twice } : null}
      onRestoreState={(st) => { if (typeof st?.t === 'string') setInput(st.t); if (typeof st?.d === 'boolean') setTwice(st.d); }}
    >
      <InteractiveToolWorkspace.Controls>
        <SmartControls
          theme={theme}
          title="Options"
          fields={[
            { type:'toggle', label:'Decode twice (double-encoded URLs)', value:twice, onChange:setTwice },
          ]}
        />
      </InteractiveToolWorkspace.Controls>
      <InteractiveToolWorkspace.Input>
        <SmartInput theme={theme} value={input} onChange={setInput} placeholder="Paste a percent-encoded URL…" rows={10} mono />
      </InteractiveToolWorkspace.Input>
      <InteractiveToolWorkspace.Output>
        <SmartOutput theme={theme} value={output} empty="Decoded text appears here." mono={false} />
      </InteractiveToolWorkspace.Output>
    </InteractiveToolWorkspace>
  );
}

// �"��� HTML Entities �������������������������������������������������������������������������������������������������������������������������"�
const HTML_ENTITIES = {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","©":"&copy;","®":"&reg;","™":"&trade;","€":"&euro;","£":"&pound;","¥":"&yen;","¢":"&cent;","°":"&deg;","±":"&plusmn;","×":"&times;","÷":"&divide;","§":"&sect;","¶":"&para;","•":"&bull;","…":"&hellip;","—":"&mdash;","–":"&ndash;","←":"&larr;","→":"&rarr;","↑":"&uarr;","↓":"&darr;","♠":"&spades;","♣":"&clubs;","♥":"&hearts;","♦":"&diams;"," ":"&nbsp;"};
const HTML_ENTITIES_REV = Object.fromEntries(Object.entries(HTML_ENTITIES).map(([k,v])=>[v,k]));

function HtmlEncode() {
  const [input, setInput] = useState("");
  const [full, setFull] = useState(false);
  const output = useMemo(()=>{
    if(!input) return "";
    if(full) return input.split("").map(c=>HTML_ENTITIES[c]||(c.charCodeAt(0)>127?`&#${c.charCodeAt(0)};`:c)).join("");
    return input.replace(/[&<>"']/g, c=>HTML_ENTITIES[c]||c);
  },[input,full]);
  return (
    <VStack>
      <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}>
        <input type="checkbox" checked={full} onChange={e=>setFull(e.target.checked)} /> Full encoding (all non-ASCII + special chars)
      </label>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Plain Text" outputLabel="HTML Encoded" inputMono={false} />
    </VStack>
  );
}
function HtmlDecode() {
  const [input, setInput] = useState("");
  const output = useMemo(()=>{
    if(!input) return "";
    return input
      .replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&#0*39;/gi,"'").replace(/&apos;/gi,"'").replace(/&nbsp;/gi,"\u00A0")
      .replace(/&([a-z]+);/gi,(_,n)=>HTML_ENTITIES_REV["&"+n+";"]||_)
      .replace(/&#x([0-9a-f]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16)))
      .replace(/&#([0-9]+);/gi,(_,d)=>String.fromCodePoint(parseInt(d)));
  },[input]);
  return <IOPanel input={input} onInput={setInput} output={output} inputLabel="HTML Encoded Text" outputLabel="Decoded Text" inputMono outputMono={false} />;
}

// �"��� XML Encode/Decode �����������������������������������������������������������������������������������������������������������������"�
function XmlEncode() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
  const output = useMemo(()=>{
    if(!input) return "";
    if(mode==="encode") return input.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
    return input.replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&quot;/gi,'"').replace(/&apos;/gi,"'");
  },[input,mode]);
  return (
    <VStack>
      <ModeToggle mode={mode} setMode={setMode} options={[["encode","Encode (Escape)"],["decode","Decode (Unescape)"]]} />
      <IOPanel input={input} onInput={setInput} output={output} inputLabel={mode==="encode"?"Plain Text":"XML Encoded"} outputLabel={mode==="encode"?"XML Encoded":"Decoded Text"} inputMono={mode!=="encode"} outputMono={mode==="encode"} />
    </VStack>
  );
}

// �"��� Binary ���������������������������������������������������������������������������������������������������������������������������������������"�
function BinaryEncode() {
  const [input, setInput] = useState("");
  const [sep, setSep] = useState("space");
  const sepChar = { space:" ", none:"", newline:"\n", comma:"," }[sep];
  const output = useMemo(()=>{
    if(!input) return "";
    return Array.from(input).map(c=>c.charCodeAt(0).toString(2).padStart(8,"0")).join(sepChar);
  },[input,sep]);
  const charCount = Array.from(input).length;
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <Label>Group separator:</Label>
        {[["space","Space"],["none","None"],["newline","New Line"],["comma","Comma"]].map(([v,l])=>(
          <Btn key={v} variant={sep===v?"primary":"secondary"} size="sm" onClick={()=>setSep(v)}>{l}</Btn>
        ))}
      </div>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Plain Text" outputLabel={`Binary (${charCount} chars × 8 bits = ${charCount*8} bits)`} inputMono={false} />
    </VStack>
  );
}
function BinaryDecode() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const output = useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const cleaned = input.trim().replace(/[^01\s,]/g,"");
      const groups = cleaned.split(/[\s,]+/).filter(Boolean);
      const result = groups.map(g=>{
        const padded = g.padStart(8,"0");
        return String.fromCharCode(parseInt(padded,2));
      }).join("");
      setError(""); return result;
    } catch(e){ setError("Invalid binary: "+e.message); return ""; }
  },[input]);
  return (
    <VStack>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Binary (0s and 1s)" outputLabel="Decoded Text" error={error} outputMono={false} />
      <Card style={{ background:"rgba(139,92,246,0.05)" }}>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.7 }}>
          <strong style={{ color:C.text }}>Format:</strong> Space-separate 8-bit groups —" <span style={{ fontFamily:"'JetBrains Mono',monospace", color:C.purple }}>01001000 01101001</span> —' "Hi"
        </div>
      </Card>
    </VStack>
  );
}

// �"��� Hex ���������������������������������������������������������������������������������������������������������������������������������������������"�
function HexEncode() {
  const [input, setInput] = useState("");
  const [sep, setSep] = useState("space");
  const [upper, setUpper] = useState(true);
  const sepChar = { space:" ", none:"", newline:"\n", comma:",", "0x":"" }[sep];
  const output = useMemo(()=>{
    if(!input) return "";
    return Array.from(input).map(c=>{
      const h = c.charCodeAt(0).toString(16).padStart(2,"0");
      const H = upper?h.toUpperCase():h;
      return sep==="0x"?`0x${H}`:H;
    }).join(sep==="0x"?" ":sepChar);
  },[input,sep,upper]);
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6 }}>
          {[["space","Space"],["none","None"],["comma","Comma"],["0x","0x Prefix"]].map(([v,l])=>(
            <Btn key={v} variant={sep===v?"primary":"secondary"} size="sm" onClick={()=>setSep(v)}>{l}</Btn>
          ))}
        </div>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}>
          <input type="checkbox" checked={upper} onChange={e=>setUpper(e.target.checked)} /> Uppercase
        </label>
      </div>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Plain Text" outputLabel="Hexadecimal" inputMono={false} />
    </VStack>
  );
}
function HexDecode() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const output = useMemo(()=>{
    if(!input.trim()) return "";
    try{
      const cleaned = input.trim().replace(/0x/gi,"").replace(/[^0-9a-fA-F]/g," ").trim();
      const groups = cleaned.split(/\s+/).filter(Boolean);
      const result = groups.map(g=>String.fromCharCode(parseInt(g.padStart(2,"0"),16))).join("");
      setError(""); return result;
    } catch(e){ setError("Invalid hex: "+e.message); return ""; }
  },[input]);
  return (
    <VStack>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Hex String" outputLabel="Decoded Text" error={error} outputMono={false} />
    </VStack>
  );
}

// �"��� Octal �����������������������������������������������������������������������������������������������������������������������������������������"�
function OctalEncode() {
  const [input, setInput] = useState("");
  const [sep, setSep] = useState("space");
  const sepChar = { space:" ", none:"", newline:"\n", backslash:"" }[sep];
  const output = useMemo(()=>{
    if(!input) return "";
    return Array.from(input).map(c=>{
      const o = c.charCodeAt(0).toString(8).padStart(3,"0");
      return sep==="backslash"?`\\${o}`:o;
    }).join(sep==="backslash"?"":sepChar);
  },[input,sep]);
  return (
    <VStack>
      <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
        <Label>Format:</Label>
        {[["space","Space"],["none","None"],["newline","New Line"],["backslash","\\XXX"]].map(([v,l])=>(
          <Btn key={v} variant={sep===v?"primary":"secondary"} size="sm" onClick={()=>setSep(v)}>{l}</Btn>
        ))}
      </div>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Plain Text" outputLabel="Octal" inputMono={false} />
    </VStack>
  );
}

// �"��� ASCII Table �����������������������������������������������������������������������������������������������������������������������������"�
function AsciiTable() {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("printable");
  const rows = useMemo(()=>{
    const all = Array.from({length:128},(_,i)=>{
      const char = i>=32&&i<127?String.fromCharCode(i):"";
      const names = {0:"NUL",1:"SOH",2:"STX",3:"ETX",4:"EOT",5:"ENQ",6:"ACK",7:"BEL",8:"BS",9:"HT",10:"LF",11:"VT",12:"FF",13:"CR",14:"SO",15:"SI",16:"DLE",17:"DC1",18:"DC2",19:"DC3",20:"DC4",21:"NAK",22:"SYN",23:"ETB",24:"CAN",25:"EM",26:"SUB",27:"ESC",28:"FS",29:"GS",30:"RS",31:"US",32:"Space",127:"DEL"};
      return { dec:i, hex:i.toString(16).toUpperCase().padStart(2,"0"), oct:i.toString(8).padStart(3,"0"), bin:i.toString(2).padStart(8,"0"), char:char||names[i]||"", printable:!!char };
    });
    let filtered = range==="printable"?all.filter(r=>r.printable):range==="control"?all.filter(r=>!r.printable):all;
    if(search) filtered = filtered.filter(r=>r.char.toLowerCase().includes(search.toLowerCase())||String(r.dec).includes(search)||r.hex.toLowerCase().includes(search.toLowerCase()));
    return filtered;
  },[search,range]);
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <Input value={search} onChange={setSearch} placeholder="Search char, decimal, or hex..." style={{ width:240 }} />
        <ModeToggle mode={range} setMode={setRange} options={[["printable","Printable"],["control","Control"],["all","All 128"]]} />
      </div>
      <div style={{ maxHeight:420, overflowY:"auto", border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
          <thead style={{ background:"rgba(255,255,255,0.04)", position:"sticky", top:0 }}>
            <tr>{["Dec","Hex","Oct","Bin","Char"].map(h=><th key={h} style={{ padding:"8px 12px", textAlign:"left", color:C.muted, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, fontSize:11, borderBottom:`1px solid ${C.border}` }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.dec} style={{ borderBottom:`1px solid rgba(255,255,255,0.03)` }} onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.06)"} onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{ padding:"6px 12px", color:C.text }}>{r.dec}</td>
                <td style={{ padding:"6px 12px", color:C.muted }}>0x{r.hex}</td>
                <td style={{ padding:"6px 12px", color:C.muted }}>{r.oct}</td>
                <td style={{ padding:"6px 12px", color:C.muted, fontSize:11 }}>{r.bin}</td>
                <td style={{ padding:"6px 12px", color:C.purple, fontWeight:700, fontSize:14 }}>{r.char}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VStack>
  );
}

// �"��� Unicode Encode/Decode ���������������������������������������������������������������������������������������������������������"�
function UnicodeEncode() {
  const [input, setInput] = useState("");
  const [fmt, setFmt] = useState("js");
  const output = useMemo(()=>{
    if(!input) return "";
    return Array.from(input).map(c=>{
      const cp = c.codePointAt(0);
      if(fmt==="js") return cp<0x10000?`\\u${cp.toString(16).toUpperCase().padStart(4,"0")}`:c;
      if(fmt==="jsfull") return `\\u{${cp.toString(16).toUpperCase()}}`;
      if(fmt==="py") return cp>127?`\\u${cp.toString(16).toUpperCase().padStart(4,"0")}`:c;
      if(fmt==="css") return cp>127?`\\${cp.toString(16).toUpperCase()} `:c;
      if(fmt==="html") return cp>127?`&#x${cp.toString(16).toUpperCase()};`:c;
      if(fmt==="codepoint") return `U+${cp.toString(16).toUpperCase().padStart(4,"0")}`;
      return c;
    }).join("");
  },[input,fmt]);
  return (
    <VStack>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {[["js","JS \\uXXXX"],["jsfull","JS \\u{XXXX}"],["py","Python"],["css","CSS \\XXXX"],["html","HTML &#x;"],["codepoint","U+ Points"]].map(([v,l])=>(
          <Btn key={v} variant={fmt===v?"primary":"secondary"} size="sm" onClick={()=>setFmt(v)}>{l}</Btn>
        ))}
      </div>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Plain Text" outputLabel="Unicode Escaped" inputMono={false} />
    </VStack>
  );
}
function UnicodeDecode() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const output = useMemo(()=>{
    if(!input.trim()) return "";
    try{
      let result = input;
      result = result.replace(/\\u\{([0-9a-fA-F]+)\}/g,(_,h)=>String.fromCodePoint(parseInt(h,16)));
      result = result.replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
      result = result.replace(/\\([0-9a-fA-F]{1,6}) ?/g,(_,h)=>String.fromCodePoint(parseInt(h,16)));
      result = result.replace(/&#x([0-9a-fA-F]+);/gi,(_,h)=>String.fromCodePoint(parseInt(h,16)));
      result = result.replace(/&#([0-9]+);/g,(_,d)=>String.fromCodePoint(parseInt(d)));
      result = result.replace(/U\+([0-9a-fA-F]+)/gi,(_,h)=>String.fromCodePoint(parseInt(h,16)));
      setError(""); return result;
    } catch(e){ setError("Decode error: "+e.message); return ""; }
  },[input]);
  return <IOPanel input={input} onInput={setInput} output={output} inputLabel="Unicode Escaped Text" outputLabel="Decoded Text" error={error} outputMono={false} />;
}

// �"��� Unicode Lookup �����������������������������������������������������������������������������������������������������������������������"�
function UnicodeLookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const lookup = () => {
    const q = query.trim();
    if(!q) return;
    const found = [];
    // Parse as code point
    const hexMatch = q.match(/^(?:U\+|0x)?([0-9a-fA-F]+)$/i);
    const decMatch = q.match(/^([0-9]+)$/);
    let cp = null;
    if(hexMatch) cp = parseInt(hexMatch[1],16);
    else if(decMatch) cp = parseInt(decMatch[1]);
    else if(q.length===1) cp = q.codePointAt(0);
    if(cp!==null && cp>=0 && cp<=0x10FFFF) {
      const char = String.fromCodePoint(cp);
      found.push({
        cp, char,
        hex: cp.toString(16).toUpperCase().padStart(4,"0"),
        js: cp<0x10000?`\\u${cp.toString(16).toUpperCase().padStart(4,"0")}`:`\\u{${cp.toString(16).toUpperCase()}}`,
        html: `&#x${cp.toString(16).toUpperCase()};`,
        css: `\\${cp.toString(16).toUpperCase()}`,
        decimal: cp,
      });
    } else if(q.length>0) {
      // treat as text —" show each character
      Array.from(q).slice(0,8).forEach(c=>{
        const cp2 = c.codePointAt(0);
        found.push({
          cp:cp2, char:c,
          hex:cp2.toString(16).toUpperCase().padStart(4,"0"),
          js:cp2<0x10000?`\\u${cp2.toString(16).toUpperCase().padStart(4,"0")}`:`\\u{${cp2.toString(16).toUpperCase()}}`,
          html:`&#x${cp2.toString(16).toUpperCase()};`,
          css:`\\${cp2.toString(16).toUpperCase()}`,
          decimal:cp2,
        });
      });
    }
    setResults(found);
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ flex:1 }}><Input value={query} onChange={setQuery} placeholder="Enter U+1F600, decimal 128512, or type any character..." onKeyDown={e=>e.key==="Enter"&&lookup()} /></div>
        <Btn onClick={lookup}>Lookup</Btn>
      </div>
      {results.map((r,i)=>(
        <Card key={i} className="fade-in">
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ fontSize:52, lineHeight:1, minWidth:60, textAlign:"center" }}>{r.char}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:C.text, marginBottom:12 }}>U+{r.hex}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                {[["Code Point","U+"+r.hex],["Decimal",r.decimal],["HTML Entity",r.html],["JS Escape",r.js],["CSS Escape",r.css],["Character",r.char]].map(([l,v])=><StatRow key={l} label={l} value={String(v)} mono />)}
              </div>
            </div>
          </div>
        </Card>
      ))}
      {results.length===0&&query&&<div style={{ color:C.muted, fontSize:13 }}>No results —" click Lookup or press Enter</div>}
      <div>
        <Label>Quick Reference —" Common Code Points</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
          {[["😀","U+1F600"],["——","U+2764"],["—","U+2713"],["©","U+00A9"],["€","U+20AC"],["中","U+4E2D"],["α","U+03B1"],["∞","U+221E"],["—","U+2190"],["★","U+2605"]].map(([c,u])=>(
            <button key={u} onClick={()=>{setQuery(u);setResults([]);}} style={{ padding:"6px 10px", background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:6, cursor:"pointer", fontSize:14, color:C.text, display:"flex", alignItems:"center", gap:6 }}>
              <span>{c}</span><span style={{ fontSize:10, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>{u}</span>
            </button>
          ))}
        </div>
      </div>
    </VStack>
  );
}

// �"��� JWT Decoder �����������������������������������������������������������������������������������������������������������������������������"�
function JwtDecoder() {
  const [token, setToken] = useState("");
  const decoded = useMemo(()=>{
    if(!token.trim()) return null;
    try{
      const parts = token.trim().split(".");
      if(parts.length<2) return { error:"Not a valid JWT — must have at least 2 dot-separated parts" };
      const decode64 = s=>{ let p=s.replace(/-/g,"+").replace(/_/g,"/"); while(p.length%4) p+="="; return JSON.parse(decodeURIComponent(escape(atob(p)))); };
      const header = decode64(parts[0]);
      const payload = decode64(parts[1]);
      const sig = parts[2]||"";
      const now = Math.floor(Date.now()/1000);
      const expired = payload.exp && payload.exp < now;
      const issuedAgo = payload.iat ? Math.floor((now-payload.iat)/60)+"m ago" : null;
      return { header, payload, sig, expired, issuedAgo, raw:parts };
    } catch(e){ return { error:"Failed to decode: "+e.message }; }
  },[token]);

  const sampleJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  return (
    <VStack>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
          <Label>JWT Token</Label>
          <Btn variant="ghost" size="sm" onClick={()=>setToken(sampleJwt)}>Load sample JWT</Btn>
        </div>
        <Textarea value={token} onChange={setToken} placeholder="Paste your JWT token here..." rows={3} />
      </div>
      {decoded?.error && <div style={{ padding:"12px 14px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:C.danger }}>{decoded.error}</div>}
      {decoded&&!decoded.error&&(
        <>
          {decoded.expired && <div style={{ padding:"10px 14px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:8, fontSize:13, color:C.warn }}>⚠— This token has expired</div>}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[["Header (Algorithm & Type)", decoded.header, "#3B82F6"],["Payload (Claims & Data)", decoded.payload, C.purple]].map(([label, data, accent])=>(
              <Card key={label} style={{ border:`1px solid ${accent}30` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <Label>{label}</Label>
                  <CopyBtn text={JSON.stringify(data,null,2)} />
                </div>
                <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:12, fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.text, whiteSpace:"pre-wrap" }}>
                  {JSON.stringify(data,null,2)}
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <Label>Payload Claims</Label>
            <div style={{ marginTop:8 }}>
              {Object.entries(decoded.payload).map(([k,v])=>{
                let display = String(v);
                let note = "";
                if((k==="exp"||k==="iat"||k==="nbf")&&typeof v==="number"){ display = new Date(v*1000).toLocaleString(); note = k==="exp"?(decoded.expired?" (EXPIRED)":""):""; }
                return <StatRow key={k} label={k+(note?" "+note:"")} value={display} mono />;
              })}
            </div>
          </Card>
          <Card style={{ background:"rgba(255,255,255,0.02)" }}>
            <Label>Signature</Label>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:C.muted, wordBreak:"break-all", marginTop:6 }}>{decoded.sig||"(none)"}</div>
          </Card>
          <div style={{ padding:"10px 14px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.15)", borderRadius:8, fontSize:12, color:C.danger }}>
            —"' Signature not verified —" verification requires the secret key. This tool only decodes the payload.
          </div>
        </>
      )}
    </VStack>
  );
}

// �"��� Caesar Cipher �������������������������������������������������������������������������������������������������������������������������"�
function CaesarCipher() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(13);
  const [mode, setMode] = useState("encode");
  const caesar = (t, n, enc) => {
    const s = enc ? n : 26-n;
    return t.replace(/[a-z]/g,c=>String.fromCharCode((c.charCodeAt(0)-97+s)%26+97)).replace(/[A-Z]/g,c=>String.fromCharCode((c.charCodeAt(0)-65+s)%26+65));
  };
  const output = input ? caesar(input, shift, mode==="encode") : "";
  const allShifts = useMemo(()=>Array.from({length:25},(_,i)=>({ shift:i+1, text:caesar(input||"",i+1,false) })),[input]);
  return (
    <VStack>
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <ModeToggle mode={mode} setMode={setMode} options={[["encode","Encode"],["decode","Decode"]]} />
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Label>Shift:</Label>
          <input type="range" min={1} max={25} value={shift} onChange={e=>setShift(Number(e.target.value))} style={{ width:120 }} />
          <div style={{ minWidth:28, textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:15, fontWeight:700, color:C.purple }}>{shift}</div>
          {shift===13&&<Badge color="purple">ROT13</Badge>}
        </div>
      </div>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Input Text" outputLabel={`${mode==="encode"?"Encoded":"Decoded"} (shift ${shift})`} inputMono={false} outputMono={false} />
      {input && (
        <details style={{ border:`1px solid ${C.border}`, borderRadius:8 }}>
          <summary style={{ padding:"10px 14px", cursor:"pointer", fontSize:13, fontWeight:600, color:C.text }}>— Brute Force —" All 25 Shifts</summary>
          <div style={{ maxHeight:300, overflowY:"auto" }}>
            {allShifts.map(({ shift:s, text })=>(
              <div key={s} style={{ display:"flex", gap:12, padding:"6px 14px", borderTop:`1px solid ${C.border}`, fontSize:12 }}>
                <span style={{ minWidth:60, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>Shift {s}:</span>
                <span style={{ color:C.text }}>{text.slice(0,80)}{text.length>80?"…":""}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </VStack>
  );
}

// �"��� Vigenère Cipher ���������������������������������������������������������������������������������������������������������������������"�
function VigenereCipher() {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("KEY");
  const [mode, setMode] = useState("encode");
  const [error, setError] = useState("");
  const vigenere = (t, k, enc) => {
    if(!k.match(/^[a-zA-Z]+$/)) return null;
    const K = k.toUpperCase();
    let ki = 0;
    return t.replace(/[a-zA-Z]/g, c=>{
      const upper = c===c.toUpperCase();
      const base = upper?65:97;
      const shift = K.charCodeAt(ki%K.length)-65;
      ki++;
      return String.fromCharCode((c.toUpperCase().charCodeAt(0)-65+(enc?shift:26-shift))%26+(upper?65:97));
    });
  };
  const output = useMemo(()=>{
    if(!input||!key) return "";
    const r = vigenere(input,key,mode==="encode");
    if(r===null){ setError("Key must contain only letters (A—Z)"); return ""; }
    setError(""); return r;
  },[input,key,mode]);
  return (
    <VStack>
      <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
        <ModeToggle mode={mode} setMode={setMode} options={[["encode","Encrypt"],["decode","Decrypt"]]} />
        <div style={{ flex:1, maxWidth:300 }}>
          <Label>Keyword</Label>
          <Input value={key} onChange={setKey} placeholder="Enter keyword (letters only)" style={{ textTransform:"uppercase" }} />
        </div>
      </div>
      {error && <div style={{ color:C.danger, fontSize:13 }}>{error}</div>}
      <IOPanel input={input} onInput={setInput} output={output} inputLabel={mode==="encode"?"Plain Text":"Cipher Text"} outputLabel={mode==="encode"?"Encrypted (Vigenère)":"Decrypted Text"} inputMono={false} outputMono={false} />
      {key&&key.match(/^[a-zA-Z]+$/)&&(
        <Card>
          <Label>Key Schedule</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
            {Array.from(key.toUpperCase()).map((c,i)=>(
              <div key={i} style={{ textAlign:"center", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:6, padding:"4px 8px" }}>
                <div style={{ fontWeight:700, color:C.purple, fontSize:13 }}>{c}</div>
                <div style={{ fontSize:10, color:C.muted }}>+{c.charCodeAt(0)-65}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </VStack>
  );
}

// �"��� Atbash ���������������������������������������������������������������������������������������������������������������������������������������"�
function AtbashCipher() {
  const [input, setInput] = useState("");
  const atbash = t => t.replace(/[a-z]/g,c=>String.fromCharCode(122-(c.charCodeAt(0)-97))).replace(/[A-Z]/g,c=>String.fromCharCode(90-(c.charCodeAt(0)-65)));
  const output = atbash(input);
  return (
    <VStack>
      <IOPanel input={input} onInput={setInput} output={output} inputLabel="Input (Atbash is symmetric)" outputLabel="Output" inputMono={false} outputMono={false} />
      <Card style={{ background:"rgba(139,92,246,0.05)" }}>
        <Label>Atbash Mirror</Label>
        <div style={{ display:"flex", gap:2, flexWrap:"wrap", marginTop:8 }}>
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(c=>(
            <div key={c} style={{ textAlign:"center", minWidth:26 }}>
              <div style={{ fontSize:12, color:C.purple, fontWeight:700 }}>{c}</div>
              <div style={{ fontSize:10, color:C.muted }}>↕</div>
              <div style={{ fontSize:12, color:C.text }}>{String.fromCharCode(90-(c.charCodeAt(0)-65))}</div>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

// �"��� Morse Encoder �������������������������������������������������������������������������������������������������������������������������"�
function MorseEncoder() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
  const [speed, setSpeed] = useState("medium");
  const [playing, setPlaying] = useState(false);
  const unit = { slow:130, medium:80, fast:45 }[speed];

  const encoded = useMemo(()=>{
    if(!input) return "";
    return input.toUpperCase().split("").map(c=>MORSE_MAP[c]||"").join(" ").replace(/ {3,}/g," / ").trim();
  },[input]);

  const decoded = useMemo(()=>{
    if(!input.trim()) return "";
    return input.trim().split(/\s*\/\/\s*|\s{3,}|\//).map(word=>
      word.trim().split(/\s+/).map(sym=>MORSE_REV[sym]||"?").join("")
    ).join(" ");
  },[input]);

  const playMorse = async () => {
    const code = mode==="encode"?encoded:input;
    if(!code||playing) return;
    setPlaying(true);
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    let t = ctx.currentTime+0.1;
    const beep = dur => {
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.frequency.value=650;g.gain.setValueAtTime(0.3,t);g.gain.setValueAtTime(0,t+dur/1000-0.01);
      o.start(t);o.stop(t+dur/1000);t+=dur/1000+(unit*1)/1000;
    };
    for(const c of code){
      if(c==="•"){ beep(unit);t+=unit/1000; }
      else if(c==="-"){ beep(unit*3);t+=unit/1000; }
      else if(c===" ") t+=(unit*2)/1000;
      else if(c==="/") t+=(unit*5)/1000;
    }
    setTimeout(()=>setPlaying(false),(t-ctx.currentTime)*1000+300);
  };

  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <ModeToggle mode={mode} setMode={setMode} options={[["encode","Text —' Morse"],["decode","Morse —' Text"]]} />
        <div style={{ display:"flex", gap:6 }}>
          {["slow","medium","fast"].map(s=><Btn key={s} variant={speed===s?"secondary":"ghost"} size="sm" onClick={()=>setSpeed(s)}>{s}</Btn>)}
        </div>
        <Btn variant="secondary" size="sm" onClick={playMorse} disabled={playing}>
          {playing?"—— Playing…":"▶ Play Audio"}
        </Btn>
      </div>
      <IOPanel input={input} onInput={setInput} output={mode==="encode"?encoded:decoded} inputLabel={mode==="encode"?"Plain Text (A—Z, 0–9)":"Morse Code (• — / format)"} outputLabel={mode==="encode"?"Morse Code":"Decoded Text"} inputMono={mode!=="encode"} outputMono={mode==="encode"} rows={5} />
      {mode==="encode"&&encoded&&(
        <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:16, fontFamily:"'JetBrains Mono',monospace", fontSize:16, color:C.purple, letterSpacing:"0.12em", lineHeight:2.2, wordBreak:"break-all" }}>{encoded}</div>
      )}
      <Card>
        <Label>International Morse Chart</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:4, marginTop:8 }}>
          {Object.entries(MORSE_MAP).filter(([k])=>/[A-Z0-9]/.test(k)).map(([k,v])=>(
            <div key={k} style={{ textAlign:"center", padding:"4px 2px" }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{k}</div>
              <div style={{ fontSize:11, color:C.purple, fontFamily:"'JetBrains Mono',monospace", lineHeight:1.4 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

// �"��� Quoted-Printable �������������������������������������������������������������������������������������������������������������������"�
function QuotedPrintable() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
  const output = useMemo(()=>{
    if(!input) return "";
    return mode==="encode"?qpEncode(input):qpDecode(input);
  },[input,mode]);
  return (
    <VStack>
      <ModeToggle mode={mode} setMode={setMode} options={[["encode","Encode"],["decode","Decode"]]} />
      <IOPanel input={input} onInput={setInput} output={output} inputLabel={mode==="encode"?"Plain Text":"QP Encoded"} outputLabel={mode==="encode"?"Quoted-Printable":"Decoded Text"} inputMono={false} />
      <Card style={{ background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.12)" }}>
        <div style={{ fontSize:12, color:C.muted, lineHeight:1.8 }}>
          <strong style={{ color:C.text }}>RFC 2045</strong> —" Printable ASCII passes through unchanged. Non-ASCII and = become <span style={{ fontFamily:"'JetBrains Mono',monospace", color:"#60A5FA" }}>=XX</span> hex pairs. Lines are soft-wrapped at 76 chars with <span style={{ fontFamily:"'JetBrains Mono',monospace", color:"#60A5FA" }}>=\r\n</span>.
        </div>
      </Card>
    </VStack>
  );
}

// �"����� COMPONENT MAP �����������������������������������������������������������������������������������������������������������������������"�
const TOOL_COMPONENTS = {
  "base64-encode": Base64Encode,
  "base64-decode": Base64Decode,
  "base64-image": Base64Image,
  "base32-encode": Base32EncodeComp,
  "base32-decode": Base32DecodeComp,
  "url-encode": UrlEncode,
  "url-decode": UrlDecode,
  "html-encode": HtmlEncode,
  "html-decode": HtmlDecode,
  "binary-encode": BinaryEncode,
  "binary-decode": BinaryDecode,
  "hex-encode": HexEncode,
  "hex-decode": HexDecode,
  "ascii-table": AsciiTable,
  "octal-encode": OctalEncode,
  "unicode-encode": UnicodeEncode,
  "unicode-decode": UnicodeDecode,
  "unicode-lookup": UnicodeLookup,
  "jwt-decoder": JwtDecoder,
  "caesar-cipher": CaesarCipher,
  "vigenere-cipher": VigenereCipher,
  "atbash-cipher": AtbashCipher,
  "morse-encoder": MorseEncoder,
  "quoted-printable": QuotedPrintable,
  "xml-encode": XmlEncode,
};

// �"����� BREADCRUMB �����������������������������������������������������������������������������������������������������������������������������"�
function Breadcrumb({ tool }) {
  const cat = CATEGORIES.find(c=>c.id===tool.cat);
  return (
    <>
      <nav style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:C.muted, marginBottom:20 }}>
        <a href="https://toolsrift.com" style={{ color:C.muted, textDecoration:"none" }}>—— ToolsRift</a>
        <span>›</span>
        <a href={`#/category/${tool.cat}`} style={{ color:C.muted, textDecoration:"none" }}>{cat?.name}</a>
        <span>›</span>
        <span style={{ color:C.text }}>{tool.name}</span>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "Encoder & Decoder Tools", "item": "https://toolsrift.com/encoders" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

// �"����� FAQ �������������������������������������������������������������������������������������������������������������������������������������������"�
function FaqSection({ faqs }) {
  if(!faqs?.length) return null;
  return (
    <section style={{ marginTop:32 }}>
      <h2 style={{ ...T.h2, marginBottom:14 }}>Frequently Asked Questions</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {faqs.map(([q,a],i)=>(
          <details key={i} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:8 }}>
            <summary style={{ padding:"12px 16px", cursor:"pointer", fontSize:13, fontWeight:600, color:C.text, listStyle:"none", display:"flex", justifyContent:"space-between" }}>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, margin:0 }}>{q}</h3>
              <span style={{ color:C.muted }}>+</span>
            </summary>
            <div style={{ padding:"0 16px 14px", fontSize:13, color:C.muted, lineHeight:1.7 }}>{a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

// �"����� RELATED TOOLS �����������������������������������������������������������������������������������������������������������������������"�
function RelatedTools({ currentId }) {
  const current = TOOLS.find(t=>t.id===currentId);
  const related = TOOLS.filter(t=>t.id!==currentId&&t.cat===current?.cat).slice(0,4);
  if(!related.length) return null;
  return (
    <section style={{ marginTop:32 }}>
      <h2 style={{ ...T.h2, marginBottom:14 }}>Related Encoding Tools</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:8, textDecoration:"none", transition:"border-color .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <span style={{ fontSize:20 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{t.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{t.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// �"����� TOOL PAGE �������������������������������������������������������������������������������������������������������������������������������"�
function ToolPage({ toolId }) {
  const tool = TOOLS.find(t=>t.id===toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  // PHASE 1: All tools free, no gating. Re-enable in Phase 2.
  useEffect(()=>{ document.title = meta?.title||`${tool?.name} —" Free Encoder | ToolsRift`; },[toolId]);
  if(!tool||!ToolComp) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
      <div style={{ fontSize:16, color:C.text, marginBottom:8 }}>Tool not found</div>
      <a href="#/" style={{ color:C.purple }}>— Back to home</a>
    </div>
  );
  return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"24px 20px 60px" }}>
      <Breadcrumb tool={tool} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
        <div>
          <h1 style={{ ...T.h1, marginBottom:6, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28 }}>{tool.icon}</span> {tool.name}
          </h1>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, maxWidth:620 }}>{meta?.desc||tool.desc}</p>
        </div>
        <Badge color="purple">Free</Badge>
      </div>
      <Card className="fade-in">
        <ToolComp />
      </Card>
      {meta?.howTo && (
        <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:16, padding:'28px 32px', marginBottom:24, marginTop:24 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 12px', fontFamily:"'Sora', sans-serif" }}>—"— How to Use This Tool</h2>
          <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, margin:0 }}>{meta.howTo}</p>
        </div>
      )}
      <FaqSection faqs={meta?.faq} />
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
      <RelatedTools currentId={toolId} />
    </div>
  );
}

// �"����� CATEGORY PAGE �����������������������������������������������������������������������������������������������������������������������"�
function CategoryPage({ catId }) {
  const cat = CATEGORIES.find(c=>c.id===catId);
  const tools = TOOLS.filter(t=>t.cat===catId);
  useEffect(()=>{ document.title = `${cat?.name} —" Free Online Encoders | ToolsRift`; },[catId]);
  if(!cat) return <div style={{ padding:40, textAlign:"center", color:C.muted }}>Category not found. <a href="#/" style={{ color:C.purple }}>— Home</a></div>;
  return (
    <div style={{ maxWidth:920, margin:"0 auto", padding:"24px 20px 60px" }}>
      <nav style={{ fontSize:12, color:C.muted, marginBottom:20 }}>
        <a href="#/" style={{ color:C.muted, textDecoration:"none" }}>—— ToolsRift</a> › <span style={{ color:C.text }}>{cat.name}</span>
      </nav>
      <h1 style={{ ...T.h1, marginBottom:6 }}>{cat.icon} {cat.name}</h1>
      <p style={{ fontSize:14, color:C.muted, marginBottom:28 }}>{cat.desc} —" {tools.length} free tools</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{ display:"flex", gap:12, padding:"14px 16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, textDecoration:"none", alignItems:"flex-start", transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(139,92,246,0.4)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform=""}}>
            <span style={{ fontSize:24, marginTop:2 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:3 }}>{t.name}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>{t.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// �"����� HOME PAGE �������������������������������������������������������������������������������������������������������������������������������"�

const PAGE_THEME = getCategoryById('encoders');

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

const ENC_SPECIAL_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .tre-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  @media(max-width:1024px){.tre-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:640px){.tre-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:400px){.tre-grid{grid-template-columns:1fr}}
  .tre-detail{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:16px 0 60px}
  @media(max-width:768px){.tre-detail{grid-template-columns:1fr;padding:16px 0 96px}}
  .tre-sidebar{display:block}
  @media(max-width:768px){.tre-sidebar{display:none}}
  .tre-mobile-bar{display:none}
  @media(max-width:768px){.tre-mobile-bar{display:flex}}
`;

function CategoryHomePage() {
  useEffect(() => { document.title = 'Free Encoder & Decoder Tools —" ToolsRift'; }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <PremiumCategoryLanding
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search encoder & decoder tools..."
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
    document.title = meta?.title || `${tool?.name} —" Free Encoder Tool | ToolsRift`;
    setDrawerOpen(false);
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>— Back to Encoders</a>
      </div>
    </CategoryLayout>
  );

  const sidebarTools = TOOLS.filter(t => t.cat === tool.cat);
  const toolData = { name:tool.name, description:meta?.desc||tool.desc, howTo:meta?.howTo, faq:meta?.faq };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <style>{ENC_SPECIAL_CSS}</style>
      <div className="tre-detail">
        <aside className="tre-sidebar">
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

        <div style={{ minWidth:0 }}>
          <a href="#/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.color='#64748B'}
          >— Back to Encoders & Decoders</a>
          <ToolPageLayout theme={PAGE_THEME} tool={toolData}>
            <ToolComp />
          </ToolPageLayout>
        </div>
      </div>

      <div className="tre-mobile-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,9,15,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>{tool.icon} {tool.name}</span>
        <button onClick={() => setDrawerOpen(d => !d)} style={{ background:acc, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:44, flexShrink:0 }}>
          {drawerOpen ? '✕ Close' : '—"— All Tools'}
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

function ToolsRiftEncoders() {
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

export default ToolsRiftEncoders;
