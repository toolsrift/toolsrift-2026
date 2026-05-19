import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import PremiumCategoryLanding from './shared/PremiumCategoryLanding';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("fancy");
const PAGE_THEME = getCategoryById('fancy');
const BRAND = { name: "ToolsRift", tagline: "Fancy Text" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  fuchsia: "#D946EF", fuchsiaD: "#C026D3",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(217,70,239,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "fuchsia" }) {
  const map = { fuchsia:"rgba(217,70,239,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { fuchsia:"#E879F9", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.fuchsia, color:textMap[color]||textMap.fuchsia, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.fuchsia; const ACCENTD = C.fuchsiaD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(217,70,239,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.fuchsia} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.fuchsia} onBlur={e => e.target.style.borderColor=C.border} />
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(217,70,239,0.08)", border:`1px solid rgba(217,70,239,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.fuchsia }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.fuchsia }}>{value}</div>
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

const TOOLS = [
  // Text Style Generators
  { id:"bold-text-generator", cat:"styles", name:"Bold Text Generator", desc:"Convert text to Unicode bold letters for social media, messages, and formatting", icon:"𝗕", free:true },
  { id:"italic-text-generator", cat:"styles", name:"Italic Text Generator", desc:"Convert text to Unicode italic letters for emphasis and stylistic formatting", icon:"𝘐", free:true },
  { id:"bold-italic-generator", cat:"styles", name:"Bold Italic Generator", desc:"Convert text to Unicode bold italic letters combining both styles", icon:"𝙄", free:true },
  { id:"underline-text", cat:"styles", name:"Underline Text", desc:"Add Unicode underline combining characters to emphasize text", icon:"U͟", free:true },
  { id:"strikethrough-text", cat:"styles", name:"Strikethrough Text", desc:"Convert text to strikethrough style for crossing out words and corrections", icon:"S̶", free:true },
  { id:"bubble-text", cat:"styles", name:"Bubble Text Generator", desc:"Convert text to circled Unicode letters for decorative bubble effect", icon:"Ⓑ", free:true },
  { id:"square-text", cat:"styles", name:"Square Text Generator", desc:"Convert text to squared Unicode letters for bold geometric style", icon:"🅂", free:true },
  { id:"small-caps", cat:"styles", name:"Small Caps Generator", desc:"Convert text to Unicode small capital letters for elegant typography", icon:"ꜱ", free:true },
  { id:"superscript-text", cat:"styles", name:"Superscript Generator", desc:"Convert text to superscript for mathematical notation and footnotes", icon:"ˢ", free:true },
  { id:"subscript-text", cat:"styles", name:"Subscript Generator", desc:"Convert text to subscript for chemical formulas and mathematical expressions", icon:"ₛ", free:true },

  // Decorative & Fun
  { id:"upside-down-text", cat:"decorative", name:"Upside Down Text", desc:"Flip text upside down for fun messages and social media posts", icon:"ʇ", free:true },
  { id:"mirror-text", cat:"decorative", name:"Mirror Text Generator", desc:"Mirror and reverse text characters for creative text effects", icon:"ᴙ", free:true },
  { id:"glitch-text", cat:"decorative", name:"Glitch Text Generator", desc:"Add Zalgo glitch effect with diacritics for corrupted text appearance", icon:"G̷", free:true },
  { id:"cursive-text", cat:"decorative", name:"Cursive Text Generator", desc:"Convert to Unicode cursive script font for elegant handwritten style", icon:"𝒞", free:true },
  { id:"double-struck", cat:"decorative", name:"Double Struck Text", desc:"Convert to double-struck Unicode for mathematical blackboard bold style", icon:"𝔻", free:true },
  { id:"fraktur-text", cat:"decorative", name:"Fraktur Text Generator", desc:"Convert to Fraktur Gothic style Unicode letters for medieval appearance", icon:"𝔉", free:true },
  { id:"monospace-text", cat:"decorative", name:"Monospace Text", desc:"Convert to Unicode monospace font for code-like appearance", icon:"𝚖", free:true },

  // Text Decorators
  { id:"text-to-emoji", cat:"decorators", name:"Text to Emoji Converter", desc:"Automatically add relevant emoji alongside words for expressive messages", icon:"😊", free:true },
  { id:"fancy-text-all", cat:"decorators", name:"Fancy Text - All Styles", desc:"Generate all fancy text styles at once with one-click copy for each style", icon:"✨", free:true },
  { id:"unicode-text-art", cat:"decorators", name:"Unicode Text Art", desc:"Generate simple text art borders and decorative boxes around your text", icon:"╔═╗", free:true },
];

const CATEGORIES = [
  { id:"styles", name:"Text Style Generators", icon:"✨", desc:"Bold, italic, underline, strikethrough and more Unicode styles" },
  { id:"decorative", name:"Decorative & Fun", icon:"🎨", desc:"Upside down, mirror, glitch, cursive and artistic text effects" },
  { id:"decorators", name:"Text Decorators", icon:"🌟", desc:"Emoji additions, all-in-one styles, and text art borders" },
];

// Unicode character maps
const UNICODE_MAPS = {
  bold: {
    upper: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭',
    lower: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇',
    digits: '𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'
  },
  italic: {
    upper: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡',
    lower: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'
  },
  boldItalic: {
    upper: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕',
    lower: '𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯'
  },
  bubble: {
    upper: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ',
    lower: 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ',
    digits: '⓪①②③④⑤⑥⑦⑧⑨'
  },
  square: {
    upper: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉',
    lower: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉'
  },
  smallCaps: {
    lower: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ'
  },
  superscript: {
    upper: 'ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᵠᴿˢᵀᵁⱽᵂˣʸᶻ',
    lower: 'ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻ',
    digits: '⁰¹²³⁴⁵⁶⁷⁸⁹'
  },
  subscript: {
    lower: 'ₐₑᵢₒᵤᵥₓ',
    digits: '₀₁₂₃₄₅₆₇₈₉'
  },
  upsideDown: {
    map: { 'a':'ɐ','b':'q','c':'ɔ','d':'p','e':'ǝ','f':'ɟ','g':'ƃ','h':'ɥ','i':'ᴉ','j':'ɾ','k':'ʞ','l':'l','m':'ɯ','n':'u','o':'o','p':'d','q':'b','r':'ɹ','s':'s','t':'ʇ','u':'n','v':'ʌ','w':'ʍ','x':'x','y':'ʎ','z':'z','A':'∀','B':'ᙠ','C':'Ɔ','D':'ᗡ','E':'Ǝ','F':'Ⅎ','G':'⅁','H':'H','I':'I','J':'ſ','K':'⋊','L':'⅂','M':'W','N':'N','O':'O','P':'Ԁ','Q':'Ό','R':'ᴚ','S':'S','T':'⊥','U':'∩','V':'Λ','W':'M','X':'X','Y':'⅄','Z':'Z','0':'0','1':'Ɩ','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6','.':'˙',',':'\'','?':'¿','!':'¡','\'':',','"':',','&':'⅋','_':'‾',';':'؛','(':')',')':'(','{':'}','}':'{','[':']',']':'[','<':'>','>':'<','\\':'/','/':'\\' }
  },
  cursive: {
    upper: '𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
    lower: '𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'
  },
  doubleStruck: {
    upper: '𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ',
    lower: '𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫',
    digits: '𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'
  },
  fraktur: {
    upper: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ',
    lower: '𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷'
  },
  monospace: {
    upper: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉',
    lower: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣',
    digits: '𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'
  }
};

const convertToUnicode = (text, map) => {
  const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let char of text) {
    if (map.upper && char >= 'A' && char <= 'Z') {
      const idx = char.charCodeAt(0) - 65;
      result += map.upper[idx] || char;
    } else if (map.lower && char >= 'a' && char <= 'z') {
      const idx = char.charCodeAt(0) - 97;
      result += map.lower[idx] || char;
    } else if (map.digits && char >= '0' && char <= '9') {
      const idx = char.charCodeAt(0) - 48;
      result += map.digits[idx] || char;
    } else {
      result += char;
    }
  }
  
  return result;
};

const TOOL_META = {
  "bold-text-generator": {
    title: "Free Bold Text Generator – Unicode Bold Letters | ToolsRift",
    desc: "Convert text to Unicode bold letters for social media posts, messages, and formatting. Copy bold text instantly with our free generator.",
    faq: [
      ["How does Unicode bold text work?", "Unicode bold text uses special mathematical alphanumeric symbols that look like bold letters. These work anywhere that supports Unicode, including social media, messages, and most apps."],
      ["Can I use bold text on Instagram?", "Yes! Unicode bold text works perfectly on Instagram, Twitter, Facebook, WhatsApp, and most social media platforms without any special formatting."],
      ["Is this real bold or just Unicode characters?", "These are Unicode characters that look bold. They're not HTML/CSS bold formatting, so they work in plain text environments like social media and messages."]
    ]
  },
  "italic-text-generator": {
    title: "Free Italic Text Generator – Unicode Italic Letters | ToolsRift",
    desc: "Convert text to Unicode italic letters for emphasis and stylistic formatting. Create italic text for social media and messages.",
    faq: [
      ["Where can I use italic Unicode text?", "Italic Unicode text works on all social media platforms, messaging apps, emails, and anywhere that supports Unicode text display."],
      ["Is this different from HTML italics?", "Yes, this uses Unicode mathematical italic characters that work in plain text. HTML/CSS italics require formatting tags that don't work everywhere."],
      ["Can I combine italic with bold?", "Yes, use our Bold Italic Generator to create text that's both bold and italic using Unicode characters."]
    ]
  },
  "bold-italic-generator": {
    title: "Free Bold Italic Text Generator – Unicode Bold Italic | ToolsRift",
    desc: "Convert text to Unicode bold italic letters combining both styles. Create emphasized text for social media and messages.",
    faq: [
      ["What is bold italic text?", "Bold italic combines the weight of bold with the slant of italic, creating highly emphasized text that stands out in messages and posts."],
      ["Does it work on mobile devices?", "Yes, Unicode bold italic displays correctly on iOS, Android, and all modern mobile devices in apps and browsers."],
      ["Can I use special characters?", "The converter works with A-Z letters and numbers. Special characters and emoji will pass through unchanged."]
    ]
  },
  "underline-text": {
    title: "Free Underline Text Generator – Unicode Underlined Text | ToolsRift",
    desc: "Add Unicode underline to text using combining characters. Create underlined text for social media emphasis.",
    faq: [
      ["How does Unicode underline work?", "This tool adds Unicode combining characters beneath each letter to create an underline effect. It's different from HTML underline tags."],
      ["Does underlined text work everywhere?", "Most modern platforms support Unicode combining characters, but some older systems may not display the underline correctly."],
      ["Can I underline emoji?", "Combining characters work best with letters and numbers. Emoji may not display underlines correctly on all platforms."]
    ]
  },
  "strikethrough-text": {
    title: "Free Strikethrough Text Generator – Unicode Strike Text | ToolsRift",
    desc: "Convert text to strikethrough style using Unicode combining characters. Cross out text for corrections and emphasis.",
    faq: [
      ["When should I use strikethrough text?", "Strikethrough is perfect for showing corrections, deletions, or humorous contradictions in social media posts and messages."],
      ["Does strikethrough work on all platforms?", "Unicode strikethrough works on most modern platforms including Twitter, Facebook, Discord, and WhatsApp."],
      ["Can I combine strikethrough with other styles?", "Yes, you can manually combine strikethrough with bold or italic by applying both conversions sequentially."]
    ]
  },
  "bubble-text": {
    title: "Free Bubble Text Generator – Unicode Circled Letters | ToolsRift",
    desc: "Convert text to circled Unicode letters for decorative bubble effect. Create bubble text for social media and fun messages.",
    faq: [
      ["What is bubble text?", "Bubble text uses Unicode circled letter characters that create a fun, bubbly appearance perfect for playful messages and social media."],
      ["Can I use bubble numbers?", "Yes, the generator converts digits 0-9 to circled number characters as well."],
      ["Are there different bubble styles?", "This uses standard circled characters. For outlined bubbles, some platforms have alternative Unicode sets available."]
    ]
  },
  "square-text": {
    title: "Free Square Text Generator – Unicode Squared Letters | ToolsRift",
    desc: "Convert text to squared Unicode letters for bold geometric style. Create squared text for modern, bold appearance.",
    faq: [
      ["What makes square text different?", "Square text uses Unicode characters with geometric square backgrounds, creating a bold, modern look perfect for headers and emphasis."],
      ["Does it work with lowercase?", "Square Unicode characters are typically uppercase. Lowercase letters will be converted to the square uppercase equivalents."],
      ["Where is square text commonly used?", "Square text is popular in social media posts, usernames, bios, and anywhere you want bold, geometric typography."]
    ]
  },
  "small-caps": {
    title: "Free Small Caps Generator – Unicode Small Capitals | ToolsRift",
    desc: "Convert text to Unicode small capital letters for elegant typography. Create small caps for professional text formatting.",
    faq: [
      ["What are small caps?", "Small caps are uppercase letters that are the height of lowercase letters, creating an elegant typographic style used in formal documents and design."],
      ["Can I convert uppercase to small caps?", "Both uppercase and lowercase input will convert to small caps. True uppercase doesn't have a small caps equivalent."],
      ["Where are small caps used?", "Small caps are used in typography for acronyms, headers, legal documents, and anywhere refined formatting is desired."]
    ]
  },
  "superscript-text": {
    title: "Free Superscript Generator – Unicode Superscript Text | ToolsRift",
    desc: "Convert text to superscript using Unicode characters. Create superscript for mathematical notation, footnotes, and exponents.",
    faq: [
      ["What is superscript used for?", "Superscript is used for mathematical exponents (x²), ordinal indicators (1st, 2nd), footnote markers, and scientific notation."],
      ["Are all letters available in superscript?", "Most letters have superscript equivalents, though some less common letters may not have Unicode superscript versions."],
      ["Can I use superscript in formulas?", "Yes, superscript is perfect for simple mathematical formulas in text, like equations and scientific notation."]
    ]
  },
  "subscript-text": {
    title: "Free Subscript Generator – Unicode Subscript Text | ToolsRift",
    desc: "Convert text to subscript using Unicode characters. Create subscript for chemical formulas and mathematical expressions.",
    faq: [
      ["When do you use subscript?", "Subscript is commonly used in chemical formulas (H₂O), mathematical indices (xᵢ), and scientific notation."],
      ["Which characters have subscript versions?", "Digits and some vowels have Unicode subscript equivalents. Other letters may not have subscript versions."],
      ["Can I mix subscript and superscript?", "Yes, you can manually combine subscript and superscript in the same text for complex scientific notation."]
    ]
  },
  "upside-down-text": {
    title: "Free Upside Down Text Generator – Flip Text Generator | ToolsRift",
    desc: "Flip text upside down using Unicode characters. Create upside down text for fun messages and social media posts.",
    faq: [
      ["How does upside down text work?", "The generator maps each character to a Unicode character that looks like its upside-down equivalent, then reverses the order."],
      ["Does it work with all characters?", "Most common letters, numbers, and punctuation have upside-down equivalents. Some special characters may not flip."],
      ["Why is the text also reversed?", "To read correctly when upside down, the text must also be reversed (mirrored horizontally) so it appears natural when flipped."]
    ]
  },
  "mirror-text": {
    title: "Free Mirror Text Generator – Reverse Text Online | ToolsRift",
    desc: "Mirror and reverse text characters for creative effects. Create mirrored text for fun messages and puzzles.",
    faq: [
      ["What's the difference between mirror and reverse?", "Reverse flips the order of characters. Mirror uses Unicode characters that look like mirrored letters (like Я for R)."],
      ["Can I read mirrored text?", "Mirrored text requires practice to read. It's often used for creative effects, puzzles, or Da Vinci-style writing."],
      ["Does mirror text work everywhere?", "Yes, mirrored Unicode characters display on all platforms that support Unicode, though readability varies."]
    ]
  },
  "glitch-text": {
    title: "Free Glitch Text Generator – Zalgo Text Creator | ToolsRift",
    desc: "Add Zalgo glitch effect with combining diacritics. Create corrupted, creepy glitch text for spooky messages.",
    faq: [
      ["What is Zalgo text?", "Zalgo text uses Unicode combining diacritical marks to create a corrupted, glitchy appearance. It's popular for horror themes and memes."],
      ["Is Zalgo text safe to use?", "Yes, but excessive Zalgo can cause rendering issues on some platforms. Use moderate amounts for best results."],
      ["Can I control the glitch intensity?", "Yes, the tool allows you to adjust how many combining characters are added for light, medium, or heavy glitch effects."]
    ]
  },
  "cursive-text": {
    title: "Free Cursive Text Generator – Unicode Script Font | ToolsRift",
    desc: "Convert to Unicode cursive script font for elegant handwritten style. Create cursive text for social media and messages.",
    faq: [
      ["Is this real cursive handwriting?", "This uses Unicode mathematical script characters that resemble cursive. It's not actual handwriting but looks elegant and flowing."],
      ["Can I use cursive text in usernames?", "Many platforms allow Unicode characters in usernames and bios. Check specific platform rules before using special characters."],
      ["Does cursive work with all letters?", "Most letters have cursive Unicode equivalents. Numbers and special characters pass through unchanged."]
    ]
  },
  "double-struck": {
    title: "Free Double Struck Text – Unicode Blackboard Bold | ToolsRift",
    desc: "Convert to double-struck Unicode for mathematical blackboard bold style. Create double outline text effect.",
    faq: [
      ["What is double-struck text?", "Double-struck (blackboard bold) is a typeface used in mathematics to denote sets like ℝ (real numbers) and ℕ (natural numbers)."],
      ["Why is it called blackboard bold?", "It originated from mathematicians emphasizing letters on chalkboards by drawing them with double lines."],
      ["Can I use double-struck for emphasis?", "While designed for mathematics, double-struck text works great for creating unique, eye-catching text in social media."]
    ]
  },
  "fraktur-text": {
    title: "Free Fraktur Text Generator – Gothic Unicode Font | ToolsRift",
    desc: "Convert to Fraktur Gothic style Unicode letters for medieval appearance. Create Gothic text for dramatic effect.",
    faq: [
      ["What is Fraktur?", "Fraktur is a Gothic blackletter typeface used in German-speaking countries until the mid-20th century. It has a distinctive medieval appearance."],
      ["Where is Fraktur text used?", "Fraktur is used for historical themes, German cultural references, heavy metal band names, and creating an old-world aesthetic."],
      ["Is Fraktur hard to read?", "Fraktur is less readable than modern fonts. Use it sparingly for headers and emphasis rather than body text."]
    ]
  },
  "monospace-text": {
    title: "Free Monospace Text Generator – Unicode Fixed Width Font | ToolsRift",
    desc: "Convert to Unicode monospace font for code-like appearance. Create fixed-width text for technical formatting.",
    faq: [
      ["What is monospace text?", "Monospace text uses fixed-width characters where each letter takes the same space, like code editors and typewriters."],
      ["When should I use monospace?", "Use monospace for code snippets, ASCII art, tables, and anywhere you need precise character alignment."],
      ["Does it work in social media?", "Yes, Unicode monospace characters work in most social media platforms and messaging apps."]
    ]
  },
  "text-to-emoji": {
    title: "Free Text to Emoji Converter – Add Emoji to Text | ToolsRift",
    desc: "Automatically add relevant emoji alongside words for expressive messages. Generate emoji text combinations.",
    faq: [
      ["How does emoji detection work?", "The tool matches words to relevant emoji based on a database of common word-emoji associations and adds them inline."],
      ["Can I customize which emoji are added?", "The tool uses smart matching. You can manually edit the output to change or remove specific emoji."],
      ["Does it work with all languages?", "The tool works best with English text. Other languages may have limited emoji matching."]
    ]
  },
  "fancy-text-all": {
    title: "Free Fancy Text Generator – All Unicode Styles in One | ToolsRift",
    desc: "Generate all fancy text styles at once with one-click copy. See 16+ Unicode text styles side-by-side instantly.",
    faq: [
      ["How many styles does it show?", "The tool generates 15+ different Unicode styles including bold, italic, bubble, square, cursive, glitch, and more all at once."],
      ["Can I copy individual styles?", "Yes, each style has its own copy button so you can quickly grab the one you want without regenerating."],
      ["Is this the fastest way to try styles?", "Absolutely! Instead of using separate tools, see all styles instantly and pick your favorite."]
    ]
  },
  "unicode-text-art": {
    title: "Free Unicode Text Art Generator – Text Box Borders | ToolsRift",
    desc: "Generate simple text art borders and decorative boxes around text. Create ASCII art frames for messages.",
    faq: [
      ["What border styles are available?", "The tool offers single-line, double-line, rounded, and decorative Unicode box-drawing characters for various border styles."],
      ["Can I adjust the box size?", "The box automatically sizes to fit your text. You can manually adjust by editing the output."],
      ["Does text art work everywhere?", "Text art works in most plain text environments, but formatting may vary slightly across different fonts and platforms."]
    ]
  }
};

// Bold Text Generator
function BoldTextGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.bold));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Bold Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Italic Text Generator
function ItalicTextGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.italic));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Italic Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Bold Italic Generator
function BoldItalicGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.boldItalic));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Bold Italic Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Underline Text
function UnderlineText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      const underlined = input.split('').map(char => {
        if (char.match(/[a-zA-Z0-9]/)) {
          return char + '\u0332';
        }
        return char;
      }).join('');
      setOutput(underlined);
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Underlined Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Strikethrough Text
function StrikethroughText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      const strikethrough = input.split('').map(char => {
        if (char !== ' ' && char !== '\n') {
          return char + '\u0336';
        }
        return char;
      }).join('');
      setOutput(strikethrough);
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Strikethrough Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Bubble Text
function BubbleText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.bubble));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Bubble Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Square Text
function SquareText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input.toUpperCase(), UNICODE_MAPS.square));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Square Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Small Caps
function SmallCaps() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      let result = '';
      for (let char of input.toLowerCase()) {
        if (char >= 'a' && char <= 'z') {
          const idx = char.charCodeAt(0) - 97;
          result += UNICODE_MAPS.smallCaps.lower[idx] || char;
        } else {
          result += char;
        }
      }
      setOutput(result);
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Small Caps Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Superscript Text
function SuperscriptText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.superscript));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Superscript Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Subscript Text
function SubscriptText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      let result = '';
      const subMap = { 'a':'ₐ','e':'ₑ','i':'ᵢ','o':'ₒ','u':'ᵤ','v':'ᵥ','x':'ₓ' };
      for (let char of input) {
        if (char >= '0' && char <= '9') {
          const idx = char.charCodeAt(0) - 48;
          result += UNICODE_MAPS.subscript.digits[idx];
        } else if (subMap[char.toLowerCase()]) {
          result += subMap[char.toLowerCase()];
        } else {
          result += char;
        }
      }
      setOutput(result);
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Subscript Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Upside Down Text
function UpsideDownText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      const flipped = input.split('').map(char => UNICODE_MAPS.upsideDown.map[char] || char).reverse().join('');
      setOutput(flipped);
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Upside Down Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Mirror Text
function MirrorText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(input.split('').reverse().join(''));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Mirrored Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Glitch Text
function GlitchText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [intensity, setIntensity] = useState('medium');

  useEffect(() => {
    if (input) {
      const zalgoChars = '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313\u0314\u0315\u031A\u031B\u033D\u033E\u033F\u0340\u0341\u0342\u0343\u0344\u0345\u0346\u0347\u0348\u0349\u034A\u034B\u034C';
      const count = intensity === 'light' ? 2 : intensity === 'medium' ? 4 : 8;
      
      const glitched = input.split('').map(char => {
        if (char.match(/[a-zA-Z]/)) {
          let result = char;
          for (let i = 0; i < count; i++) {
            result += zalgoChars[Math.floor(Math.random() * zalgoChars.length)];
          }
          return result;
        }
        return char;
      }).join('');
      
      setOutput(glitched);
    } else {
      setOutput('');
    }
  }, [input, intensity]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <div>
        <Label>Glitch Intensity</Label>
        <SelectInput value={intensity} onChange={setIntensity} options={[
          { value:'light', label:'Light' },
          { value:'medium', label:'Medium' },
          { value:'heavy', label:'Heavy' }
        ]} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Glitch Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Cursive Text
function CursiveText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.cursive));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Cursive Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Double Struck
function DoubleStruck() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.doubleStruck));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Double Struck Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Fraktur Text
function FrakturText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.fraktur));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Fraktur Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Monospace Text
function MonospaceText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      setOutput(convertToUnicode(input, UNICODE_MAPS.monospace));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Monospace Text</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Text to Emoji
function TextToEmoji() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const emojiMap = {
    'love':'❤️','heart':'💖','happy':'😊','sad':'😢','fire':'🔥','star':'⭐','sun':'☀️','moon':'🌙',
    'water':'💧','tree':'🌳','flower':'🌸','music':'🎵','book':'📚','phone':'📱','computer':'💻',
    'money':'💰','time':'⏰','home':'🏠','car':'🚗','food':'🍔','pizza':'🍕','coffee':'☕','cake':'🎂'
  };

  useEffect(() => {
    if (input) {
      const words = input.split(' ');
      const withEmoji = words.map(word => {
        const lower = word.toLowerCase().replace(/[^a-z]/g, '');
        const emoji = emojiMap[lower];
        return emoji ? `${word} ${emoji}` : word;
      }).join(' ');
      setOutput(withEmoji);
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="I love coffee and pizza..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Text with Emoji</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:22, fontWeight:400, color:C.text, lineHeight:1.5, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Fancy Text All Styles
function FancyTextAll() {
  const [input, setInput] = useState('');

  const styles = [
    { name: 'Bold', convert: (t) => convertToUnicode(t, UNICODE_MAPS.bold) },
    { name: 'Italic', convert: (t) => convertToUnicode(t, UNICODE_MAPS.italic) },
    { name: 'Bold Italic', convert: (t) => convertToUnicode(t, UNICODE_MAPS.boldItalic) },
    { name: 'Bubble', convert: (t) => convertToUnicode(t, UNICODE_MAPS.bubble) },
    { name: 'Square', convert: (t) => convertToUnicode(t.toUpperCase(), UNICODE_MAPS.square) },
    { name: 'Small Caps', convert: (t) => {
      let r = '';
      for (let c of t.toLowerCase()) {
        if (c >= 'a' && c <= 'z') r += UNICODE_MAPS.smallCaps.lower[c.charCodeAt(0) - 97] || c;
        else r += c;
      }
      return r;
    }},
    { name: 'Superscript', convert: (t) => convertToUnicode(t, UNICODE_MAPS.superscript) },
    { name: 'Cursive', convert: (t) => convertToUnicode(t, UNICODE_MAPS.cursive) },
    { name: 'Double Struck', convert: (t) => convertToUnicode(t, UNICODE_MAPS.doubleStruck) },
    { name: 'Fraktur', convert: (t) => convertToUnicode(t, UNICODE_MAPS.fraktur) },
    { name: 'Monospace', convert: (t) => convertToUnicode(t, UNICODE_MAPS.monospace) },
    { name: 'Underline', convert: (t) => t.split('').map(c => c.match(/[a-zA-Z0-9]/) ? c + '\u0332' : c).join('') },
    { name: 'Strikethrough', convert: (t) => t.split('').map(c => c !== ' ' && c !== '\n' ? c + '\u0336' : c).join('') },
    { name: 'Upside Down', convert: (t) => t.split('').map(c => UNICODE_MAPS.upsideDown.map[c] || c).reverse().join('') },
    { name: 'Mirrored', convert: (t) => t.split('').reverse().join('') }
  ];

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here to see all styles..." />
      </div>
      {input && (
        <div>
          <Label>All Fancy Styles ({styles.length})</Label>
          <div style={{ display:"grid", gap:12, maxHeight:600, overflowY:"auto", padding:4 }}>
            {styles.map((style, i) => {
              const converted = style.convert(input);
              return (
                <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:C.muted }}>{style.name}</span>
                    <CopyBtn text={converted} />
                  </div>
                  <div style={{ fontSize:20, color:C.text, wordBreak:"break-word", lineHeight:1.4 }}>
                    {converted}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </VStack>
  );
}

// Unicode Text Art
function UnicodeTextArt() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [style, setStyle] = useState('single');

  useEffect(() => {
    if (input) {
      const lines = input.split('\n');
      const maxLen = Math.max(...lines.map(l => l.length));
      
      const borders = {
        single: { tl:'┌', tr:'┐', bl:'└', br:'┘', h:'─', v:'│' },
        double: { tl:'╔', tr:'╗', bl:'╚', br:'╝', h:'═', v:'║' },
        rounded: { tl:'╭', tr:'╮', bl:'╰', br:'╯', h:'─', v:'│' },
        heavy: { tl:'┏', tr:'┓', bl:'┗', br:'┛', h:'━', v:'┃' }
      };
      
      const b = borders[style];
      let result = b.tl + b.h.repeat(maxLen + 2) + b.tr + '\n';
      lines.forEach(line => {
        result += b.v + ' ' + line.padEnd(maxLen, ' ') + ' ' + b.v + '\n';
      });
      result += b.bl + b.h.repeat(maxLen + 2) + b.br;
      
      setOutput(result);
    } else {
      setOutput('');
    }
  }, [input, style]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <div>
        <Label>Border Style</Label>
        <SelectInput value={style} onChange={setStyle} options={[
          { value:'single', label:'Single Line' },
          { value:'double', label:'Double Line' },
          { value:'rounded', label:'Rounded' },
          { value:'heavy', label:'Heavy' }
        ]} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Text Art</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"16px", fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:C.text, lineHeight:1.4, whiteSpace:"pre" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "bold-text-generator": BoldTextGenerator,
  "italic-text-generator": ItalicTextGenerator,
  "bold-italic-generator": BoldItalicGenerator,
  "underline-text": UnderlineText,
  "strikethrough-text": StrikethroughText,
  "bubble-text": BubbleText,
  "square-text": SquareText,
  "small-caps": SmallCaps,
  "superscript-text": SuperscriptText,
  "subscript-text": SubscriptText,
  "upside-down-text": UpsideDownText,
  "mirror-text": MirrorText,
  "glitch-text": GlitchText,
  "cursive-text": CursiveText,
  "double-struck": DoubleStruck,
  "fraktur-text": FrakturText,
  "monospace-text": MonospaceText,
  "text-to-emoji": TextToEmoji,
  "fancy-text-all": FancyTextAll,
  "unicode-text-art": UnicodeTextArt,
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
          { "@type": "ListItem", "position": 2, "name": "Fancy Text Generators", "item": "https://toolsrift.com/fancy" },
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
    document.title = meta?.title || `${tool?.name} – Free Fancy Text Tool | ToolsRift`;
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

const FANCY_PREVIEW = {
  "bold-text-generator": "𝗔𝗮",
  "italic-text-generator": "𝘈𝘢",
  "bold-italic-generator": "𝘼𝙖",
  "underline-text": "A͟a͟",
  "strikethrough-text": "A̶a̶",
  "bubble-text": "Ⓐⓐ",
  "square-text": "🄰🄰",
  "small-caps": "Aᴀ",
  "superscript-text": "ᴬᵃ",
  "subscript-text": "Aₐ",
  "upside-down-text": "∀ɐ",
  "mirror-text": "Aꜻ",
  "glitch-text": "A̷a̸",
  "cursive-text": "𝒜𝒶",
  "double-struck": "𝔸𝕒",
  "fraktur-text": "𝔄𝔞",
  "monospace-text": "𝙰𝚊",
  "text-to-emoji": "A😊",
  "fancy-text-all": "✨Aa",
  "unicode-text-art": "╔Aa╗",
};

function FancyPreview({ toolId }) {
  const preview = FANCY_PREVIEW[toolId] || "Aa";
  return (
    <div style={{
      marginTop:12, padding:"10px 12px", borderRadius:8,
      background:"rgba(217,70,239,0.08)", border:"1px solid rgba(217,70,239,0.18)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:22, color:"#F5D0FE", letterSpacing:"0.06em", minHeight:44,
    }}>{preview}</div>
  );
}

function CategoryPage({ catId }) {
  const cat = CATEGORIES.find(c => c.id === catId);
  const catTools = TOOLS.filter(t => t.cat === catId);

  useEffect(() => {
    document.title = `${cat?.name || 'Category'} – Fancy Text | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.fuchsia }}>← Back to home</a>
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.fuchsia; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{tool.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>{tool.name}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:10 }}>{tool.desc}</div>
              <Badge color={tool.free?"green":"amber"}>{tool.free?"Free":"Pro"}</Badge>
              <FancyPreview toolId={tool.id}/>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(() => {
    document.title = "Free Fancy Text Generator – Unicode Styles & Fonts Online | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <PremiumCategoryLanding
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search fancy text generators..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(217,70,239,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ width:8, height:8, borderRadius:"50%", background:C.fuchsia, boxShadow:`0 0 6px ${C.fuchsia}80`, flexShrink:0 }}/>
        <a href="https://toolsrift.com" style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:C.text, textDecoration:"none", letterSpacing:"-0.01em" }}>ToolsRift</a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.fuchsia, textDecoration:"none" }}>{THEME?.name||"Fancy Text"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(217,70,239,0.12)", color:C.fuchsia, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(217,70,239,0.25)" }}>{TOOLS.length} tools</span>
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
    {href:"/formatters",icon:"🔧",label:"Code Formatters"},
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
        <a href="/" style={{fontSize:12,color:"#D946EF",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftFancy() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="fancy"/>}
    </div>
  );
}

export default ToolsRiftFancy;