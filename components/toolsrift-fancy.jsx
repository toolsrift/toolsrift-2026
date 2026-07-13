import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
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

  // New Tools (added July 2026)
  { id:"fullwidth-text", cat:"styles", name:"Fullwidth Text Generator", desc:"Convert text to fullwidth Unicode letters for vaporwave and aesthetic ａｅｓｔｈｅｔｉｃ style", icon:"🔠", free:true },
  { id:"cool-symbols", cat:"decorators", name:"Cool Symbols & Kaomoji", desc:"Click-to-copy board of arrows, stars, hearts, math symbols, currency and kaomoji faces", icon:"🔣", free:true },
  { id:"discord-formatter", cat:"decorators", name:"Discord Text Formatter", desc:"Build Discord-formatted messages with bold, italic, spoiler markdown and colored ANSI text", icon:"💬", free:true },
  { id:"emoji-letters", cat:"styles", name:"Emoji Letters Generator", desc:"Turn text into regional indicator or squared Latin emoji letters like 🇦🇧🅰🅱", icon:"🅰️", free:true },

  // New Tools (added July 2026 — batch 2)
  { id:"serif-bold-text", cat:"styles", name:"Serif Bold Text Generator", desc:"Convert text to Unicode serif bold letters 𝐀𝐚 for a classic, heavy typographic look", icon:"𝐁", free:true },
  { id:"negative-circled-text", cat:"styles", name:"Negative Circled Text", desc:"Convert text to solid black circled letters 🅐🅑🅒 for bold, high-contrast styling", icon:"🅝", free:true },
  { id:"parenthesized-text", cat:"styles", name:"Parenthesized Text Generator", desc:"Wrap each letter in Unicode parentheses like ⒜⒝⒞ for list and label styling", icon:"⒫", free:true },
  { id:"double-underline-text", cat:"styles", name:"Double Underline Text", desc:"Add a Unicode double underline beneath each letter for strong emphasis", icon:"D̳", free:true },
  { id:"overline-text", cat:"styles", name:"Overline Text Generator", desc:"Add a Unicode overline above each letter for a bar-over, math-like appearance", icon:"O̅", free:true },
  { id:"slashthrough-text", cat:"styles", name:"Slashthrough Text Generator", desc:"Cross out text with a diagonal Unicode long-solidus overlay for a slashed effect", icon:"S̸", free:true },
  { id:"wide-spaced-text", cat:"styles", name:"Wide Spaced Text", desc:"Insert spaces between every character to create l e t t e r spaced-out titles", icon:"W␣", free:true },

  { id:"spongebob-mocking-case", cat:"decorative", name:"Mocking SpongeBob Case", desc:"Convert text to aLtErNaTiNg case for the mocking SpongeBob meme and sarcasm", icon:"Sᴘ", free:true },
  { id:"flip-case", cat:"decorative", name:"Flip Case Converter", desc:"Swap uppercase to lowercase and lowercase to uppercase in one click", icon:"aA", free:true },
  { id:"reverse-words", cat:"decorative", name:"Reverse Word Order", desc:"Reverse the order of words in a sentence while keeping each word readable", icon:"↩", free:true },
  { id:"leetspeak-generator", cat:"decorative", name:"Leetspeak Generator", desc:"Convert text to 1337 h4x0r leetspeak by swapping letters for numbers and symbols", icon:"1337", free:true },
  { id:"faux-cyrillic-text", cat:"decorative", name:"Faux Cyrillic Text", desc:"Style text with Cyrillic lookalike letters like Я and И for a fake Russian aesthetic", icon:"Я", free:true },

  { id:"clap-text", cat:"decorators", name:"Clap Text Generator", desc:"Insert 👏 clap emoji between every word for emphatic, meme-style messages", icon:"👏", free:true },
  { id:"sparkle-text", cat:"decorators", name:"Sparkle Text Generator", desc:"Wrap words with ✨ sparkle emoji for a cute, aesthetic Twitter and Instagram look", icon:"✨", free:true },
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
  // Astral chars (U+1D400+, U+1F130+) are 2 UTF-16 units, so string[idx] would
  // return a lone surrogate. Precompute code-point arrays so indexing is correct.
  const up = map.upper ? [...map.upper] : null;
  const low = map.lower ? [...map.lower] : null;
  const dig = map.digits ? [...map.digits] : null;
  let result = '';

  for (let char of text) {
    if (up && char >= 'A' && char <= 'Z') {
      const idx = char.charCodeAt(0) - 65;
      result += up[idx] || char;
    } else if (low && char >= 'a' && char <= 'z') {
      const idx = char.charCodeAt(0) - 97;
      result += low[idx] || char;
    } else if (dig && char >= '0' && char <= '9') {
      const idx = char.charCodeAt(0) - 48;
      result += dig[idx] || char;
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
  },
  "fullwidth-text": {
    title: "Free Fullwidth Text Generator – Aesthetic Vaporwave Text | ToolsRift",
    desc: "Convert text to fullwidth Unicode letters for vaporwave and aesthetic styling. Create ａｅｓｔｈｅｔｉｃ ｔｅｘｔ for social media instantly.",
    faq: [
      ["What is fullwidth text?", "Fullwidth text uses Unicode Fullwidth Forms characters that each take up the space of a full CJK character, creating the spaced-out ａｅｓｔｈｅｔｉｃ look popular in vaporwave aesthetics."],
      ["Where can I use fullwidth text?", "Fullwidth text works on Twitter, Instagram, Discord, TikTok and most apps that support Unicode. It's popular for bios, usernames and aesthetic posts."],
      ["Why are there big spaces between letters?", "Each fullwidth character is as wide as a Chinese or Japanese character, so Latin letters appear evenly spaced. The regular space is converted to an ideographic space to match."]
    ]
  },
  "cool-symbols": {
    title: "Free Cool Symbols & Kaomoji – Click to Copy Symbols | ToolsRift",
    desc: "Click-to-copy board of cool symbols and kaomoji: arrows, stars, hearts, math, currency and text faces like ¯\\_(ツ)_/¯. Copy any symbol instantly.",
    faq: [
      ["How do I copy a symbol?", "Just click any symbol or kaomoji on the board and it is instantly copied to your clipboard, ready to paste anywhere."],
      ["What are kaomoji?", "Kaomoji are Japanese-style text emoticons made from Unicode characters, like ¯\\_(ツ)_/¯ and (╯°□°)╯, that you can read without rotating your head."],
      ["Do these symbols work everywhere?", "Most symbols are standard Unicode and display on all modern devices and platforms, though a few decorative characters may look slightly different by font."]
    ]
  },
  "discord-formatter": {
    title: "Free Discord Text Formatter – Bold, Spoiler & ANSI Colors | ToolsRift",
    desc: "Build Discord-formatted text with bold, italic, underline, strikethrough, spoiler and code markdown, plus colored ANSI text blocks. Copy and paste.",
    faq: [
      ["How do I make colored text in Discord?", "Switch to ANSI mode, pick a color, then copy the generated ```ansi code block. Paste it into Discord — colors render in the desktop and web apps."],
      ["Does Discord colored text work on mobile?", "No. ANSI color code blocks only render in the Discord desktop and web clients. On mobile the text shows without colors but stays fully readable."],
      ["What markdown does Discord support?", "Discord supports bold (**), italic (*), underline (__), strikethrough (~~), spoiler (||), inline code (`) and multi-line code blocks (```)."]
    ]
  },
  "emoji-letters": {
    title: "Free Emoji Letters Generator – Regional & Squared Letters | ToolsRift",
    desc: "Turn text into emoji letters: regional indicator symbols 🇦🇧🇨 or negative-squared Latin 🅰🅱🅲. Copy emoji text for social media bios and posts.",
    faq: [
      ["What are regional indicator letters?", "Regional indicator symbols are Unicode letters A-Z that render as blue-boxed emoji. When two combine they can form a country flag — for example US becomes the US flag."],
      ["What is squared Latin text?", "Squared Latin uses the negative-squared alphabet block (🅰🅱🅲) where each letter appears as a solid rounded square, great for bold emoji-style headers."],
      ["Do emoji letters work in usernames?", "Many platforms allow these Unicode emoji in bios and posts. Some restrict them in usernames, so check the specific platform's rules first."]
    ]
  },
  "serif-bold-text": {
    title: "Free Serif Bold Text Generator – Unicode Bold Font | ToolsRift",
    desc: "Convert text to Unicode serif bold letters (𝐀𝐚𝟏) for a classic, heavy look. Copy bold serif text for social media, bios and headlines instantly.",
    faq: [
      ["How is serif bold different from sans bold?", "Serif bold uses the Mathematical Bold alphabet (𝐀) which has small strokes on each letter, giving a classic look, while sans bold (𝗔) has clean, modern edges."],
      ["Where does serif bold text work?", "These Unicode characters display on Instagram, Twitter, Facebook, Discord and most modern apps that support Unicode, no formatting tags needed."],
      ["Does it convert numbers too?", "Yes, digits 0-9 are converted to bold serif numerals. Punctuation and other symbols pass through unchanged."]
    ]
  },
  "negative-circled-text": {
    title: "Free Negative Circled Text – Solid Black Circle Letters | ToolsRift",
    desc: "Convert text to solid black circled letters (🅐🅑🅒) for bold, high-contrast styling. Copy negative circled text for headers, usernames and posts.",
    faq: [
      ["What is negative circled text?", "Negative circled text uses filled black circle characters with white letters inside (🅐), the inverse of standard bubble letters, for strong visual contrast."],
      ["Does it support lowercase?", "The negative circled Unicode block only defines uppercase letters, so lowercase input is automatically converted to the uppercase circled form."],
      ["Can I use it for numbers?", "Yes, digits map to negative circled numbers such as ❶❷❸ and ⓿ for zero."]
    ]
  },
  "parenthesized-text": {
    title: "Free Parenthesized Text Generator – Bracketed Letters | ToolsRift",
    desc: "Wrap each letter in Unicode parentheses like ⒜⒝⒞ for decorative labels and lists. Copy parenthesized text for social media and creative formatting.",
    faq: [
      ["What is parenthesized text?", "Parenthesized text uses single Unicode characters that show a letter or number inside round brackets, such as ⒜ and ⑴, without typing separate parentheses."],
      ["Do uppercase and lowercase both work?", "Yes. Lowercase uses the ⒜–⒵ block and uppercase uses the parenthesized Latin capital block 🄐–🄩."],
      ["Which numbers are supported?", "Digits 1 through 9 convert to parenthesized numbers ⑴–⑼. Zero has no parenthesized form, so it stays as a normal 0."]
    ]
  },
  "double-underline-text": {
    title: "Free Double Underline Text Generator – Unicode Underline | ToolsRift",
    desc: "Add a Unicode double underline beneath each letter for strong emphasis. Copy double underlined text for social media, titles and highlights.",
    faq: [
      ["How does double underline work?", "The tool appends the Unicode combining double low line (U+0333) beneath each letter and number, creating a double underline that travels with the text."],
      ["Is this the same as HTML underline?", "No. This uses Unicode combining marks that work in plain text like social media and messages, where HTML underline tags do not apply."],
      ["Does it work everywhere?", "Most modern platforms render combining marks correctly, though a few older systems may show the underline slightly offset."]
    ]
  },
  "overline-text": {
    title: "Free Overline Text Generator – Unicode Bar Over Text | ToolsRift",
    desc: "Add a Unicode overline above each letter for a bar-over, math-style look. Copy overlined text for equations, headers and creative formatting.",
    faq: [
      ["What is overline text used for?", "An overline (a bar above the letters) is used in mathematics for repeating decimals and means, and as a decorative style for headings and usernames."],
      ["How is the overline added?", "The tool appends the Unicode combining overline mark (U+0305) above each letter and digit so the bar stays attached to your text."],
      ["Does overline work in social media?", "Yes, Unicode combining overlines display on most modern social platforms and messaging apps that support combining characters."]
    ]
  },
  "slashthrough-text": {
    title: "Free Slashthrough Text Generator – Diagonal Strike Text | ToolsRift",
    desc: "Cross out text with a diagonal Unicode long-solidus overlay for a slashed look. Copy slashthrough text for corrections and stylistic emphasis.",
    faq: [
      ["How is slashthrough different from strikethrough?", "Strikethrough draws a horizontal line through letters, while slashthrough uses a diagonal long solidus overlay (U+0338) for an angled crossed-out effect."],
      ["Where can I use slashthrough text?", "It works on most modern platforms including Twitter, Discord and WhatsApp that render Unicode combining marks."],
      ["Does it slash spaces too?", "No. The overlay is applied only to letters and numbers, so spaces and line breaks stay clean."]
    ]
  },
  "wide-spaced-text": {
    title: "Free Wide Spaced Text Generator – Letter Spacing Online | ToolsRift",
    desc: "Insert spaces between every character to create l e t t e r spaced-out titles. Copy wide spaced text for aesthetic bios, headers and social posts.",
    faq: [
      ["What is wide spaced text?", "Wide spaced text adds a space between each character so words appear stretched out, a popular aesthetic style for titles and social media bios."],
      ["Is this different from fullwidth text?", "Yes. Fullwidth uses special wide Unicode characters, while this simply inserts normal spaces between your regular letters."],
      ["Will it break on copy?", "No. The output is plain letters and spaces, so it copies and pastes reliably into any app or platform."]
    ]
  },
  "spongebob-mocking-case": {
    title: "Free Mocking SpongeBob Text – aLtErNaTiNg Case | ToolsRift",
    desc: "Convert text to aLtErNaTiNg case for the mocking SpongeBob meme and sarcasm. Copy mocking text instantly for memes, replies and jokes.",
    faq: [
      ["What is mocking SpongeBob text?", "It is text with randomly-looking alternating uppercase and lowercase letters, made famous by the Mocking SpongeBob meme to convey sarcasm."],
      ["How does the alternation work?", "The tool alternates case on each letter, ignoring spaces and punctuation so the pattern stays consistent across words."],
      ["Where do people use it?", "It is used in social media replies, memes and comments to mock or sarcastically repeat someone's statement."]
    ]
  },
  "flip-case": {
    title: "Free Flip Case Converter – Swap Upper & Lower Case | ToolsRift",
    desc: "Swap uppercase to lowercase and lowercase to uppercase in one click. Copy flipped case text instantly for quick reformatting and fun effects.",
    faq: [
      ["What does flip case do?", "Flip case inverts the case of every letter: uppercase becomes lowercase and lowercase becomes uppercase, so Hello becomes hELLO."],
      ["Does it change numbers or symbols?", "No. Only letters have a case, so numbers, spaces and punctuation are left exactly as you typed them."],
      ["Is this the same as inverse case?", "Yes, flip case and inverse case both mean swapping each letter to the opposite case."]
    ]
  },
  "reverse-words": {
    title: "Free Reverse Word Order Tool – Flip Sentence Words | ToolsRift",
    desc: "Reverse the order of words in a sentence while keeping each word readable. Copy the reversed sentence for puzzles, poems and creative writing.",
    faq: [
      ["How is this different from reversing letters?", "This reverses the order of whole words, so each word stays spelled correctly, unlike mirror text which reverses individual characters."],
      ["Does it keep my spacing?", "Word order is reversed while the spacing between words is preserved so the result reads naturally."],
      ["What can I use reversed word order for?", "It is handy for word puzzles, poetry experiments, Yoda-style phrasing and creative text games."]
    ]
  },
  "leetspeak-generator": {
    title: "Free Leetspeak Generator – 1337 H4x0r Text Online | ToolsRift",
    desc: "Convert text to 1337 leetspeak by swapping letters for numbers and symbols. Copy h4x0r text for gamertags, usernames and retro hacker style.",
    faq: [
      ["What is leetspeak?", "Leetspeak (1337) is an internet writing style that replaces letters with similar-looking numbers and symbols, such as E to 3 and A to 4."],
      ["Which letters get replaced?", "Common substitutions include a→4, e→3, i→1, l→1, o→0, s→5, t→7, b→8, g→9, z→2 and c→(. Other letters stay the same."],
      ["Where is leetspeak used?", "It is popular in gaming usernames, gamertags, retro hacker culture and playful internet handles."]
    ]
  },
  "faux-cyrillic-text": {
    title: "Free Faux Cyrillic Text – Fake Russian Style Letters | ToolsRift",
    desc: "Style text with Cyrillic lookalike letters like Я and И for a faux Russian aesthetic. Copy fake Cyrillic text for band names, posters and memes.",
    faq: [
      ["What is faux Cyrillic text?", "Faux Cyrillic swaps Latin letters for visually similar Cyrillic characters, like R to Я and N to И, to create a stylized fake Russian look."],
      ["Is this real Russian?", "No. It only borrows the shapes of Cyrillic letters for style and is not readable or meaningful Russian text."],
      ["Where is it commonly used?", "It appears in band logos, movie posters, game titles and memes that want a Soviet or Eastern European aesthetic."]
    ]
  },
  "clap-text": {
    title: "Free Clap Text Generator – 👏 Emoji Between Words | ToolsRift",
    desc: "Insert 👏 clap emoji between every word for emphatic, meme-style messages. Copy clap text instantly for tweets, comments and social posts.",
    faq: [
      ["What is clap text?", "Clap text places a 👏 clap emoji between each word, a popular social media style used to add emphasis to a statement one word at a time."],
      ["Does it add claps at the ends?", "No, the clap emoji is placed only between words, matching the common clap-back format like make 👏 it 👏 stop."],
      ["Can I use it anywhere?", "Yes, the 👏 emoji and spaces are standard Unicode, so clap text copies and pastes into any app or platform."]
    ]
  },
  "sparkle-text": {
    title: "Free Sparkle Text Generator – ✨ Aesthetic Text | ToolsRift",
    desc: "Wrap words with ✨ sparkle emoji for a cute, aesthetic look. Copy sparkle text for Twitter, Instagram bios, captions and playful messages.",
    faq: [
      ["What is sparkle text?", "Sparkle text surrounds your words with ✨ sparkle emoji, a cute and ironic social media style used to emphasize or dress up a phrase."],
      ["Where are the sparkles placed?", "A ✨ is added at the start, between each word, and at the end, so cute vibes becomes ✨ cute ✨ vibes ✨."],
      ["Does sparkle text work everywhere?", "Yes, the ✨ emoji is standard Unicode and displays on virtually all modern devices, apps and social platforms."]
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

// Fullwidth Text
function FullwidthText() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      let result = '';
      for (const ch of input) {
        const code = ch.codePointAt(0);
        if (code === 0x20) {
          result += '　'; // ideographic space
        } else if (code >= 0x21 && code <= 0x7E) {
          result += String.fromCodePoint(code + 0xFEE0); // map into Fullwidth Forms (U+FF01–U+FF5E)
        } else {
          result += ch;
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
        <Textarea value={input} onChange={setInput} rows={4} placeholder="vaporwave aesthetic..." />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Fullwidth Text</Label>
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

// Cool Symbols & Kaomoji
const SYMBOL_GROUPS = [
  { name:"Arrows", items:['←','→','↑','↓','↔','↕','⇐','⇒','⇑','⇓','⇔','↖','↗','↘','↙','➜','➤','⟵','⟶','↺','↻','⇦','⇨'] },
  { name:"Stars", items:['★','☆','✦','✧','✩','✪','✫','✬','✭','✮','✯','✰','⭐','🌟','✨','❇','❈','❉','⁂','꙰'] },
  { name:"Hearts", items:['♥','♡','❤','🧡','💛','💚','💙','💜','🖤','🤍','💕','💖','💗','💘','❥','❦','❧'] },
  { name:"Math", items:['±','×','÷','∞','≈','≠','≤','≥','π','∑','√','∫','∂','∆','∏','µ','°','∝','∈','∉','⊂','⊃','∅','∴','∵','∇'] },
  { name:"Currency", items:['€','£','¥','₹','¢','$','₩','₽','₿','₺','₴','₦','฿','₫','₱','₡','₪','₲'] },
  { name:"Bullets & Dividers", items:['•','◦','‣','▪','▫','●','○','■','□','◆','◇','—','–','·','∼','═','━','┅','⋯','⸻','❖','✤','⟡','⁙'] },
  { name:"Kaomoji", items:['¯\\_(ツ)_/¯','(╯°□°)╯︵ ┻━┻','ツ','٩(◕‿◕)۶','(ﾉ◕ヮ◕)ﾉ','(⌐■_■)','(づ｡◕‿‿◕｡)づ','＼(^o^)／','(╥﹏╥)','(¬‿¬)','ᕕ( ᐛ )ᕗ'] },
];

function SymbolChip({ sym }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(sym).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1200);
    }).catch(() => {});
  };
  return (
    <button onClick={copy} title="Click to copy" style={{
      minWidth:40, minHeight:40, padding:"6px 10px",
      background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
      border:`1px solid ${copied ? C.success : C.border}`, borderRadius:8,
      color: copied ? C.success : C.text, fontSize:18, cursor:"pointer",
      fontFamily:"'JetBrains Mono',monospace", transition:"all .15s", whiteSpace:"nowrap",
      display:"inline-flex", alignItems:"center", justifyContent:"center",
    }}>{copied ? "✓ Copied" : sym}</button>
  );
}

function CoolSymbols() {
  return (
    <VStack>
      <div style={{ fontSize:13, color:C.muted, lineHeight:1.5 }}>
        Click any symbol or kaomoji to copy it to your clipboard.
      </div>
      {SYMBOL_GROUPS.map(group => (
        <div key={group.name}>
          <Label>{group.name}</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
            {group.items.map((sym, i) => <SymbolChip key={i} sym={sym} />)}
          </div>
        </div>
      ))}
    </VStack>
  );
}

// Discord Text Formatter
const DISCORD_ANSI_COLORS = [
  { value:'30', label:'Gray (30)' },
  { value:'31', label:'Red (31)' },
  { value:'32', label:'Green (32)' },
  { value:'33', label:'Yellow (33)' },
  { value:'34', label:'Blue (34)' },
  { value:'35', label:'Magenta (35)' },
  { value:'36', label:'Cyan (36)' },
  { value:'37', label:'White (37)' },
  { value:'90', label:'Bright Gray (90)' },
  { value:'91', label:'Bright Red (91)' },
  { value:'92', label:'Bright Green (92)' },
  { value:'93', label:'Bright Yellow (93)' },
  { value:'94', label:'Bright Blue (94)' },
  { value:'95', label:'Bright Magenta (95)' },
  { value:'96', label:'Bright Cyan (96)' },
  { value:'97', label:'Bright White (97)' },
];

function DiscordToggle({ on, onClick, children }) {
  return <Btn size="sm" variant={on ? "primary" : "secondary"} onClick={onClick}>{children}</Btn>;
}

function DiscordFormatter() {
  const [input, setInput] = useState('Hello world');
  const [mode, setMode] = useState('markdown');
  // markdown toggles
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  const [spoiler, setSpoiler] = useState(false);
  const [inlineCode, setInlineCode] = useState(false);
  const [codeBlock, setCodeBlock] = useState(false);
  // ansi options
  const [fg, setFg] = useState('31');
  const [ansiBold, setAnsiBold] = useState(true);
  const [ansiUnderline, setAnsiUnderline] = useState(false);

  const output = useMemo(() => {
    const text = input || '';
    if (mode === 'ansi') {
      const codes = [];
      if (ansiBold) codes.push('1');
      if (ansiUnderline) codes.push('4');
      codes.push(fg);
      const esc = '\u001b'; // ANSI escape (U+001B)
      return '```ansi\n' + esc + '[' + codes.join(';') + 'm' + text + esc + '[0m\n```';
    }
    let out = text;
    if (inlineCode) out = '`' + out + '`';
    if (bold) out = '**' + out + '**';
    if (italic) out = '*' + out + '*';
    if (underline) out = '__' + out + '__';
    if (strike) out = '~~' + out + '~~';
    if (spoiler) out = '||' + out + '||';
    if (codeBlock) out = '```\n' + out + '\n```';
    return out;
  }, [input, mode, bold, italic, underline, strike, spoiler, inlineCode, codeBlock, fg, ansiBold, ansiUnderline]);

  const escaped = output.replace(/\u001b/g, '\\u001b');

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={3} placeholder="Type your Discord message..." />
      </div>
      <div>
        <Label>Format Mode</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'markdown', label:'Markdown (bold, italic, spoiler…)' },
          { value:'ansi', label:'ANSI Color (colored text)' },
        ]} />
      </div>
      {mode === 'markdown' ? (
        <div>
          <Label>Styles</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
            <DiscordToggle on={bold} onClick={() => setBold(v => !v)}>Bold</DiscordToggle>
            <DiscordToggle on={italic} onClick={() => setItalic(v => !v)}>Italic</DiscordToggle>
            <DiscordToggle on={underline} onClick={() => setUnderline(v => !v)}>Underline</DiscordToggle>
            <DiscordToggle on={strike} onClick={() => setStrike(v => !v)}>Strikethrough</DiscordToggle>
            <DiscordToggle on={spoiler} onClick={() => setSpoiler(v => !v)}>Spoiler</DiscordToggle>
            <DiscordToggle on={inlineCode} onClick={() => setInlineCode(v => !v)}>Inline Code</DiscordToggle>
            <DiscordToggle on={codeBlock} onClick={() => setCodeBlock(v => !v)}>Code Block</DiscordToggle>
          </div>
        </div>
      ) : (
        <>
          <div>
            <Label>Text Color</Label>
            <SelectInput value={fg} onChange={setFg} options={DISCORD_ANSI_COLORS} />
          </div>
          <div>
            <Label>Style</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
              <DiscordToggle on={ansiBold} onClick={() => setAnsiBold(v => !v)}>Bold</DiscordToggle>
              <DiscordToggle on={ansiUnderline} onClick={() => setAnsiUnderline(v => !v)}>Underline</DiscordToggle>
            </div>
          </div>
          <div style={{ fontSize:12, color:C.warn, lineHeight:1.5 }}>
            Note: ANSI colors only render in the Discord desktop and web apps, not on mobile.
          </div>
        </>
      )}
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <Label>Formatted Output (raw — paste into Discord)</Label>
          <CopyBtn text={output} />
        </div>
        <Result>{output || '—'}</Result>
        {mode === 'ansi' && (
          <div style={{ marginTop:10 }}>
            <Label>Escape Codes Visible</Label>
            <Result>{escaped || '—'}</Result>
          </div>
        )}
      </div>
    </VStack>
  );
}

// Emoji Letters
function EmojiLetters() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('regional');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (input) {
      let result = '';
      for (const ch of input) {
        const code = ch.toUpperCase().codePointAt(0);
        if (code >= 65 && code <= 90) {
          result += mode === 'regional'
            ? String.fromCodePoint(0x1F1E6 + (code - 65)) // regional indicator A = U+1F1E6
            : String.fromCodePoint(0x1F170 + (code - 65)); // negative-squared A = U+1F170
        } else {
          result += ch;
        }
      }
      setOutput(result);
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={3} placeholder="Type A-Z text..." />
      </div>
      <div>
        <Label>Style</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'regional', label:'Regional Indicator 🇦🇧🇨 (pairs form flags)' },
          { value:'squared', label:'Squared Latin 🅰🅱🅲' },
        ]} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <Label>Emoji Letters</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.5, wordBreak:"break-word" }}>
            {output}
          </div>
        </div>
      )}
    </VStack>
  );
}

// --- Shared output-block helper for the batch-2 tools ---
function FancyOutput({ label, output }) {
  if (!output) return null;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
        <Label>{label}</Label>
        <CopyBtn text={output} />
      </div>
      <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 16px", fontSize:26, fontWeight:400, color:C.text, lineHeight:1.4, wordBreak:"break-word" }}>
        {output}
      </div>
    </div>
  );
}

// Serif Bold Text (Mathematical Bold)
function SerifBoldText() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    let r = '';
    for (const ch of input) {
      const c = ch.codePointAt(0);
      if (c >= 65 && c <= 90) r += String.fromCodePoint(0x1D400 + (c - 65));
      else if (c >= 97 && c <= 122) r += String.fromCodePoint(0x1D41A + (c - 97));
      else if (c >= 48 && c <= 57) r += String.fromCodePoint(0x1D7CE + (c - 48));
      else r += ch;
    }
    return r;
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Serif Bold Text" output={output} />
    </VStack>
  );
}

// Negative Circled Text
function NegativeCircledText() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    let r = '';
    for (const ch of input) {
      const c = ch.codePointAt(0);
      const u = ch.toUpperCase().codePointAt(0);
      if (u >= 65 && u <= 90) r += String.fromCodePoint(0x1F150 + (u - 65));
      else if (c >= 49 && c <= 57) r += String.fromCodePoint(0x2776 + (c - 49));
      else if (c === 48) r += '⓿';
      else r += ch;
    }
    return r;
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Negative Circled Text" output={output} />
    </VStack>
  );
}

// Parenthesized Text
function ParenthesizedText() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    let r = '';
    for (const ch of input) {
      const c = ch.codePointAt(0);
      if (c >= 65 && c <= 90) r += String.fromCodePoint(0x1F110 + (c - 65));
      else if (c >= 97 && c <= 122) r += String.fromCodePoint(0x249C + (c - 97));
      else if (c >= 49 && c <= 57) r += String.fromCodePoint(0x2474 + (c - 49));
      else r += ch;
    }
    return r;
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Parenthesized Text" output={output} />
    </VStack>
  );
}

// Double Underline Text
function DoubleUnderlineText() {
  const [input, setInput] = useState('');
  const output = useMemo(() =>
    Array.from(input).map(ch => /[A-Za-z0-9]/.test(ch) ? ch + '̳' : ch).join(''),
  [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Double Underlined Text" output={output} />
    </VStack>
  );
}

// Overline Text
function OverlineText() {
  const [input, setInput] = useState('');
  const output = useMemo(() =>
    Array.from(input).map(ch => /[A-Za-z0-9]/.test(ch) ? ch + '̅' : ch).join(''),
  [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Overlined Text" output={output} />
    </VStack>
  );
}

// Slashthrough Text
function SlashthroughText() {
  const [input, setInput] = useState('');
  const output = useMemo(() =>
    Array.from(input).map(ch => /[A-Za-z0-9]/.test(ch) ? ch + '̸' : ch).join(''),
  [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Slashthrough Text" output={output} />
    </VStack>
  );
}

// Wide Spaced Text
function WideSpacedText() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    // space out each line's characters, preserve line breaks
    return input.split('\n').map(line => Array.from(line).join(' ')).join('\n');
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Type your text here..." />
      </div>
      <FancyOutput label="Wide Spaced Text" output={output} />
    </VStack>
  );
}

// Mocking SpongeBob Case
function MockingSpongebobCase() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    let r = '', i = 0;
    for (const ch of input) {
      if (/[a-z]/i.test(ch)) {
        r += (i % 2 === 0) ? ch.toLowerCase() : ch.toUpperCase();
        i++;
      } else r += ch;
    }
    return r;
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="this is fine..." />
      </div>
      <FancyOutput label="Mocking Text" output={output} />
    </VStack>
  );
}

// Flip Case
function FlipCase() {
  const [input, setInput] = useState('');
  const output = useMemo(() =>
    Array.from(input).map(ch => {
      const lower = ch.toLowerCase();
      const upper = ch.toUpperCase();
      if (lower === upper) return ch;
      return ch === lower ? upper : lower;
    }).join(''),
  [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Hello World..." />
      </div>
      <FancyOutput label="Flipped Case Text" output={output} />
    </VStack>
  );
}

// Reverse Word Order
function ReverseWords() {
  const [input, setInput] = useState('');
  const output = useMemo(() => input.split(/(\s+)/).reverse().join(''), [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="one two three..." />
      </div>
      <FancyOutput label="Reversed Word Order" output={output} />
    </VStack>
  );
}

// Leetspeak Generator
const LEET_MAP = { a:'4', b:'8', c:'(', e:'3', g:'9', i:'1', l:'1', o:'0', s:'5', t:'7', z:'2' };
function LeetspeakGenerator() {
  const [input, setInput] = useState('');
  const output = useMemo(() =>
    Array.from(input).map(ch => {
      const low = ch.toLowerCase();
      return LEET_MAP[low] !== undefined ? LEET_MAP[low] : ch;
    }).join(''),
  [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="leet hacker text..." />
      </div>
      <FancyOutput label="Leetspeak Text" output={output} />
    </VStack>
  );
}

// Faux Cyrillic Text
const CYRILLIC_MAP = {
  A:'Д', B:'Б', C:'С', D:'Д', E:'Э', G:'Б', H:'Н', I:'И', K:'К', M:'М',
  N:'И', O:'Ф', P:'Р', R:'Я', S:'Ѕ', T:'Т', U:'Ц', W:'Ш', X:'Х', Y:'Ч',
  a:'а', b:'ъ', c:'с', e:'э', g:'ɡ', h:'н', i:'и', k:'к', m:'м', n:'п',
  o:'о', p:'р', r:'я', s:'ѕ', t:'т', u:'ц', w:'ш', x:'х', y:'у',
};
function FauxCyrillicText() {
  const [input, setInput] = useState('');
  const output = useMemo(() =>
    Array.from(input).map(ch => CYRILLIC_MAP[ch] !== undefined ? CYRILLIC_MAP[ch] : ch).join(''),
  [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="fake russian style..." />
      </div>
      <FancyOutput label="Faux Cyrillic Text" output={output} />
    </VStack>
  );
}

// Clap Text
function ClapText() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    const words = input.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    return words.join(' 👏 ');
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="make it stop..." />
      </div>
      <FancyOutput label="Clap Text" output={output} />
    </VStack>
  );
}

// Sparkle Text
function SparkleText() {
  const [input, setInput] = useState('');
  const output = useMemo(() => {
    const words = input.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    return '✨ ' + words.join(' ✨ ') + ' ✨';
  }, [input]);
  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="cute aesthetic vibes..." />
      </div>
      <FancyOutput label="Sparkle Text" output={output} />
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
  "fullwidth-text": FullwidthText,
  "cool-symbols": CoolSymbols,
  "discord-formatter": DiscordFormatter,
  "emoji-letters": EmojiLetters,
  "serif-bold-text": SerifBoldText,
  "negative-circled-text": NegativeCircledText,
  "parenthesized-text": ParenthesizedText,
  "double-underline-text": DoubleUnderlineText,
  "overline-text": OverlineText,
  "slashthrough-text": SlashthroughText,
  "wide-spaced-text": WideSpacedText,
  "spongebob-mocking-case": MockingSpongebobCase,
  "flip-case": FlipCase,
  "reverse-words": ReverseWords,
  "leetspeak-generator": LeetspeakGenerator,
  "faux-cyrillic-text": FauxCyrillicText,
  "clap-text": ClapText,
  "sparkle-text": SparkleText,
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
  "fullwidth-text": "Ａａ",
  "cool-symbols": "★ ♥ →",
  "discord-formatter": "**Aa**",
  "emoji-letters": "🇦🅱",
  "serif-bold-text": "𝐀𝐚",
  "negative-circled-text": "🅐🅑",
  "parenthesized-text": "🄐⒜",
  "double-underline-text": "A̳a̳",
  "overline-text": "A̅a̅",
  "slashthrough-text": "A̸a̸",
  "wide-spaced-text": "A a",
  "spongebob-mocking-case": "aAaA",
  "flip-case": "aA",
  "reverse-words": "cba",
  "leetspeak-generator": "1337",
  "faux-cyrillic-text": "ЯИ",
  "clap-text": "A👏B",
  "sparkle-text": "✨A✨",
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
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
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
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
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