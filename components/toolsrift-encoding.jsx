import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("encoding");
const PAGE_THEME = getCategoryById('encoding');
const BRAND = { name: "ToolsRift", tagline: "Text Encoding" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  indigo: "#6366F1", indigoD: "#4F46E5",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(99,102,241,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "indigo" }) {
  const map = { indigo:"rgba(99,102,241,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { indigo:"#A5B4FC", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.indigo, color:textMap[color]||textMap.indigo, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.indigo; const ACCENTD = C.indigoD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(99,102,241,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.indigo} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.indigo} onBlur={e => e.target.style.borderColor=C.border} />
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(99,102,241,0.08)", border:`1px solid rgba(99,102,241,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.indigo }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.indigo }}>{value}</div>
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
  { id:"morse-code", cat:"encoding", name:"Morse Code Translator", desc:"Convert text to Morse code and decode Morse back to text with audio playback support", icon:"•—", free:true },
  { id:"nato-alphabet", cat:"encoding", name:"NATO Phonetic Alphabet", desc:"Convert text to NATO phonetic alphabet (Alpha, Bravo, Charlie) for clear communication", icon:"🔤", free:true },
  { id:"binary-text", cat:"encoding", name:"Binary Text Converter", desc:"Convert text to binary representation and decode binary back to readable text", icon:"01", free:true },
  { id:"hex-text", cat:"encoding", name:"Hex Text Converter", desc:"Convert text to hexadecimal encoding and decode hex strings back to text", icon:"0x", free:true },
  { id:"octal-text", cat:"encoding", name:"Octal Text Converter", desc:"Convert text to octal representation and decode octal sequences to text", icon:"🔢", free:true },
  { id:"rot13", cat:"encoding", name:"ROT13 Encoder/Decoder", desc:"Encode and decode text using ROT13 cipher substitution for simple text obfuscation", icon:"🔄", free:true },
  { id:"rot47", cat:"encoding", name:"ROT47 Encoder/Decoder", desc:"Encode and decode text using ROT47 cipher including numbers and symbols", icon:"🔃", free:true },
  { id:"caesar-cipher", cat:"encoding", name:"Caesar Cipher", desc:"Encrypt and decrypt text with Caesar cipher using adjustable shift amount (1-25)", icon:"🔐", free:true },
  { id:"text-to-ascii", cat:"encoding", name:"Text to ASCII Codes", desc:"Convert text to ASCII code numbers and decode ASCII codes back to readable text", icon:"📊", free:true },
  { id:"text-to-unicode", cat:"encoding", name:"Text to Unicode Points", desc:"Convert text to Unicode code points (U+0048 format) and decode back to characters", icon:"Ⓤ", free:true },
  { id:"braille-translator", cat:"encoding", name:"Braille Translator", desc:"Convert text to Braille Unicode characters and translate Braille back to text", icon:"⠓", free:true },
  { id:"leetspeak-translator", cat:"encoding", name:"Leetspeak Translator", desc:"Convert text to and from leetspeak (l33t) with light and heavy substitution modes", icon:"1337", free:true },
  { id:"a1z26-cipher", cat:"encoding", name:"A1Z26 Cipher", desc:"Encode letters to numbers (A=1, Z=26) and decode number sequences back to text", icon:"🔢", free:true },
  { id:"rail-fence-cipher", cat:"encoding", name:"Rail Fence Cipher", desc:"Encrypt and decrypt text with the zigzag rail fence transposition cipher (2-10 rails)", icon:"🚧", free:true },
];

const CATEGORIES = [
  { id:"encoding", name:"Text Encoding & Decoding", icon:"🔐", desc:"Convert text between various encoding formats and cipher systems" },
];

const TOOL_META = {
  "morse-code": {
    title: "Free Morse Code Translator – Convert Text to Morse Online | ToolsRift",
    desc: "Convert text to Morse code and decode Morse back to text. Includes audio playback feature to hear Morse code beeps. Free online translator.",
    faq: [
      ["What is Morse code?", "Morse code is a character encoding system using dots (.) and dashes (—) to represent letters and numbers. It was invented by Samuel Morse for telegraph communication."],
      ["How do I read Morse code?", "Each letter is represented by a unique pattern of dots and dashes. Short signals are dots, long signals are dashes. Letters are separated by spaces, words by slashes (/)."],
      ["Can I hear the Morse code?", "Yes! Click the 'Play Audio' button to hear the Morse code as beeps. Dots are short beeps, dashes are longer beeps, with pauses between letters and words."]
    ]
  },
  "nato-alphabet": {
    title: "Free NATO Phonetic Alphabet Converter – Spell with Alpha Bravo | ToolsRift",
    desc: "Convert text to NATO phonetic alphabet instantly. Spell words clearly using Alpha, Bravo, Charlie for communications and radio.",
    faq: [
      ["What is the NATO phonetic alphabet?", "The NATO phonetic alphabet assigns code words to each letter (A=Alpha, B=Bravo, etc.) to ensure clear communication over radio and phone, especially in noisy conditions."],
      ["When should I use the NATO alphabet?", "Use it when spelling names, addresses, or important information over phone/radio where letters might be misheard (like B vs D, M vs N)."],
      ["Is this the same as military alphabet?", "Yes, the NATO phonetic alphabet is also called the military alphabet or aviation alphabet. It's the international standard for voice communication."]
    ]
  },
  "binary-text": {
    title: "Free Binary Text Converter – Text to Binary Translator | ToolsRift",
    desc: "Convert text to binary code and decode binary back to text. Translate between ASCII text and binary representation online.",
    faq: [
      ["How does binary encoding work?", "Each character is converted to its ASCII value, then that number is represented in binary (base-2). For example, 'A' is ASCII 65, which is 01000001 in binary."],
      ["What's the format of binary output?", "Each character becomes an 8-bit binary number (byte). Numbers are separated by spaces for readability."],
      ["Can I decode binary back to text?", "Yes, enter binary numbers (with or without spaces) and click decode to convert back to readable text."]
    ]
  },
  "hex-text": {
    title: "Free Hex Text Converter – Text to Hexadecimal Online | ToolsRift",
    desc: "Convert text to hexadecimal encoding and decode hex strings to text. ASCII to hex converter with instant results.",
    faq: [
      ["What is hexadecimal encoding?", "Hexadecimal (hex) uses base-16 to represent data. Each character's ASCII value is converted to a 2-digit hex number (0-9, A-F)."],
      ["Why use hex instead of decimal?", "Hex is compact and widely used in computing. Two hex digits represent one byte, making it efficient for displaying binary data."],
      ["How do I decode hex to text?", "Enter hex values (with or without spaces) and the tool will convert each hex pair back to its ASCII character."]
    ]
  },
  "octal-text": {
    title: "Free Octal Text Converter – Text to Octal Online | ToolsRift",
    desc: "Convert text to octal representation and decode octal sequences to text. ASCII to octal encoding tool.",
    faq: [
      ["What is octal encoding?", "Octal uses base-8 (digits 0-7) to represent numbers. Each character's ASCII value is converted to its octal equivalent."],
      ["Where is octal used?", "Octal was historically used in computing and is still used in some Unix/Linux file permissions (like chmod 755)."],
      ["Can I mix octal formats?", "The tool accepts octal numbers with or without spaces. Leading zeros are optional but commonly used."]
    ]
  },
  "rot13": {
    title: "Free ROT13 Encoder/Decoder – ROT13 Cipher Online | ToolsRift",
    desc: "Encode and decode text using ROT13 cipher. Simple letter substitution cipher that shifts each letter by 13 positions.",
    faq: [
      ["What is ROT13?", "ROT13 is a simple letter substitution cipher that replaces each letter with the letter 13 positions after it in the alphabet. A becomes N, B becomes O, etc."],
      ["Why is ROT13 used?", "ROT13 is used to obscure text (like spoilers or puzzle answers) without true encryption. It's easily reversible—applying ROT13 twice returns the original text."],
      ["Does ROT13 work on numbers?", "No, standard ROT13 only affects letters A-Z. Numbers and special characters remain unchanged."]
    ]
  },
  "rot47": {
    title: "Free ROT47 Encoder/Decoder – ROT47 Cipher Online | ToolsRift",
    desc: "Encode and decode text using ROT47 cipher. Extended cipher that includes numbers and symbols unlike ROT13.",
    faq: [
      ["What is ROT47?", "ROT47 extends ROT13 by rotating all printable ASCII characters (33-126), including numbers and symbols. Each character shifts by 47 positions."],
      ["How is ROT47 different from ROT13?", "ROT13 only affects letters. ROT47 affects letters, numbers, and symbols, making it more comprehensive but still easily reversible."],
      ["Is ROT47 secure encryption?", "No, ROT47 is trivial to decode and not suitable for security. It's only for simple obfuscation of text."]
    ]
  },
  "caesar-cipher": {
    title: "Free Caesar Cipher – Encrypt & Decrypt with Shift Key | ToolsRift",
    desc: "Encrypt and decrypt text with Caesar cipher. Adjustable shift amount (1-25) for custom letter substitution encryption.",
    faq: [
      ["What is the Caesar cipher?", "The Caesar cipher is one of the oldest encryption techniques. It shifts each letter by a fixed number of positions in the alphabet. Julius Caesar used a shift of 3."],
      ["How do I decrypt Caesar cipher?", "Use the negative shift (or 26 minus the shift). For example, to decrypt text encrypted with shift 5, use shift 21 (or shift -5)."],
      ["Can Caesar cipher be broken?", "Yes, easily. There are only 25 possible shifts to try. Caesar cipher is not secure for real encryption but useful for learning cryptography."]
    ]
  },
  "text-to-ascii": {
    title: "Free Text to ASCII Converter – ASCII Code Translator | ToolsRift",
    desc: "Convert text to ASCII code numbers and decode ASCII codes back to text. Character to ASCII value converter.",
    faq: [
      ["What is ASCII?", "ASCII (American Standard Code for Information Interchange) assigns numbers 0-127 to characters. For example, 'A' is 65, 'a' is 97, '0' is 48."],
      ["What's the difference between ASCII and Unicode?", "ASCII uses 7 bits (128 characters). Unicode extends this to millions of characters including emoji and international alphabets."],
      ["Can I decode ASCII numbers back?", "Yes, enter ASCII codes separated by spaces and decode them back to text. Each number from 0-127 represents a specific character."]
    ]
  },
  "text-to-unicode": {
    title: "Free Text to Unicode Converter – Unicode Code Points | ToolsRift",
    desc: "Convert text to Unicode code points (U+0048 format) and decode code points back to characters. Unicode encoding tool.",
    faq: [
      ["What are Unicode code points?", "Unicode code points are unique numbers assigned to every character. They're written as U+XXXX in hexadecimal. For example, 'A' is U+0041."],
      ["How many Unicode characters exist?", "Unicode 15.0 defines over 149,000 characters covering all modern and historic scripts, symbols, and emoji."],
      ["Can I decode Unicode back to text?", "Yes, enter code points in U+XXXX format (with or without U+) and decode them to see the actual characters."]
    ]
  },
  "braille-translator": {
    title: "Free Braille Translator – Text to Braille Converter | ToolsRift",
    desc: "Convert text to Braille Unicode characters and translate Braille back to text. Online Braille encoding tool.",
    faq: [
      ["What is Braille?", "Braille is a tactile writing system used by people who are blind. It uses raised dots in patterns to represent letters and numbers."],
      ["Does this show visual Braille?", "Yes, this tool uses Unicode Braille characters (⠁⠃⠉) which display the dot patterns visually. Real Braille is felt with fingers."],
      ["Can I print this Braille?", "The Unicode Braille characters will print, but they're not embossed. For actual tactile Braille, use a Braille embosser or printer."]
    ]
  },
  "leetspeak-translator": {
    title: "Free Leetspeak Translator – Text to l33t Converter Online | ToolsRift",
    desc: "Convert text to and from leetspeak (l33t sp34k). Light and heavy substitution modes for gaming tags, usernames, and fun text obfuscation.",
    faq: [
      ["What is leetspeak?", "Leetspeak (or 'l33t sp34k') is an internet slang that replaces letters with numbers and symbols that resemble them, like A→4, E→3, and O→0. It started in online gaming and hacker communities."],
      ["What's the difference between light and heavy mode?", "Light mode swaps common vowels and a few letters (a→4, e→3, i→1, o→0, s→5, t→7). Heavy mode adds more aggressive substitutions like b→8, g→9, l→|, and z→2 for a more extreme look."],
      ["Can leetspeak be decoded reliably?", "Light mode decodes cleanly. Heavy mode can be ambiguous or lossy — for example '|' could map back to L or I — so decoding is best-effort and may not perfectly restore the original text."]
    ]
  },
  "a1z26-cipher": {
    title: "Free A1Z26 Cipher – Letter to Number Encoder/Decoder | ToolsRift",
    desc: "Encode letters to numbers (A=1, B=2 … Z=26) and decode number sequences back to text. Popular in escape rooms, puzzles, and geocaching.",
    faq: [
      ["What is the A1Z26 cipher?", "A1Z26 is a simple substitution cipher that replaces each letter with its position in the alphabet: A=1, B=2, up to Z=26. Numbers are joined by a separator such as a dash or space."],
      ["How are words separated when decoding?", "Spaces between number groups act as word breaks. The tool preserves word boundaries so decoded output keeps the original spacing between words."],
      ["Is A1Z26 case-sensitive?", "No — encoding is case-insensitive since both 'A' and 'a' map to 1. Decoded output is returned in lowercase letters."]
    ]
  },
  "rail-fence-cipher": {
    title: "Free Rail Fence Cipher – Zigzag Transposition Encoder | ToolsRift",
    desc: "Encrypt and decrypt text with the rail fence cipher. Adjustable rail count (2-10) for the classic zigzag transposition cipher. Guaranteed round-trip.",
    faq: [
      ["How does the rail fence cipher work?", "Characters are written diagonally down and up across a number of 'rails' (rows) in a zigzag pattern, then read off row by row to produce the ciphertext. It's a transposition cipher — it rearranges letters rather than substituting them."],
      ["How many rails should I use?", "Any number from 2 to 10. More rails create a more scrambled result. Note that using 1 rail leaves the text unchanged (identity)."],
      ["Does decryption restore the exact original?", "Yes — the tool reconstructs the zigzag pattern from the ciphertext length, so decoding an encoded message with the same rail count returns your exact original text, including spaces and punctuation."]
    ]
  }
};

// Morse Code mapping
const MORSE_CODE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':".-.-.-",',':"--..--",'?':"..--..",'/':"-..-.",'-':"-....-",'(':"-.--.",')':'-.--.-',' ':'/'
};

const NATO_ALPHABET = {
  'A':'Alpha','B':'Bravo','C':'Charlie','D':'Delta','E':'Echo','F':'Foxtrot','G':'Golf','H':'Hotel','I':'India','J':'Juliett','K':'Kilo','L':'Lima','M':'Mike','N':'November','O':'Oscar','P':'Papa','Q':'Quebec','R':'Romeo','S':'Sierra','T':'Tango','U':'Uniform','V':'Victor','W':'Whiskey','X':'X-ray','Y':'Yankee','Z':'Zulu','0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine'
};

const BRAILLE = {
  'a':'⠁','b':'⠃','c':'⠉','d':'⠙','e':'⠑','f':'⠋','g':'⠛','h':'⠓','i':'⠊','j':'⠚','k':'⠅','l':'⠇','m':'⠍','n':'⠝','o':'⠕','p':'⠏','q':'⠟','r':'⠗','s':'⠎','t':'⠞','u':'⠥','v':'⠧','w':'⠺','x':'⠭','y':'⠽','z':'⠵','1':'⠼⠁','2':'⠼⠃','3':'⠼⠉','4':'⠼⠙','5':'⠼⠑','6':'⠼⠋','7':'⠼⠛','8':'⠼⠓','9':'⠼⠊','0':'⠼⠚',' ':' ',',':'⠂','.':'⠲','?':'⠦','!':'⠖'
};

// Morse Code Component
function MorseCode() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const audioContextRef = useRef(null);

  const textToMorse = (text) => {
    return text.toUpperCase().split('').map(char => MORSE_CODE[char] || char).join(' ');
  };

  const morseToText = (morse) => {
    const reverseMorse = {};
    Object.keys(MORSE_CODE).forEach(key => {
      reverseMorse[MORSE_CODE[key]] = key;
    });
    return morse.split(' / ').map(word => 
      word.split(' ').map(code => reverseMorse[code] || '').join('')
    ).join(' ');
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToMorse(input));
      } else {
        setOutput(morseToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  const playMorse = () => {
    if (!output || mode !== 'encode') return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const dotTime = 60;
    const dashTime = dotTime * 3;
    const letterGap = dotTime * 3;
    const wordGap = dotTime * 7;
    let currentTime = audioContext.currentTime;

    const playBeep = (duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.3, currentTime);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + duration / 1000);
      
      currentTime += duration / 1000;
    };

    output.split(' ').forEach(symbol => {
      if (symbol === '/') {
        currentTime += wordGap / 1000;
      } else if (symbol === '.') {
        playBeep(dotTime);
        currentTime += dotTime / 1000;
      } else if (symbol === '-') {
        playBeep(dashTime);
        currentTime += dashTime / 1000;
      }
      currentTime += letterGap / 1000;
    });
  };

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'encode', label:'Text to Morse' },
          { value:'decode', label:'Morse to Text' }
        ]} />
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Morse Code'}</Label>
        <Textarea value={input} onChange={setInput} rows={4} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello World' : '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Morse Code' : 'Text'}</Label>
            <div style={{ display:"flex", gap:8 }}>
              {mode === 'encode' && <Btn size="sm" onClick={playMorse}>🔊 Play Audio</Btn>}
              <CopyBtn text={output} />
            </div>
          </div>
          <Result mono>{output}</Result>
        </div>
      )}
      <div style={{ marginTop:8 }}>
        <Label>Morse Code Reference</Label>
        <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:12, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(60px, 1fr))", gap:8, fontSize:11, fontFamily:"'JetBrains Mono',monospace" }}>
          {Object.entries(MORSE_CODE).slice(0, 26).map(([char, code]) => (
            <div key={char}><span style={{ color:C.indigo }}>{char}</span> {code}</div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

// NATO Alphabet Component
function NatoAlphabet() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);

  useEffect(() => {
    if (input) {
      const words = input.toUpperCase().split('').map(char => {
        if (NATO_ALPHABET[char]) {
          return `${char} → ${NATO_ALPHABET[char]}`;
        } else if (char === ' ') {
          return '(space)';
        } else {
          return char;
        }
      });
      setOutput(words);
    } else {
      setOutput([]);
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={4} placeholder="Hello World" />
      </div>
      {output.length > 0 && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>NATO Phonetic Alphabet</Label>
            <CopyBtn text={output.join('\n')} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", maxHeight:400, overflowY:"auto" }}>
            {output.map((line, i) => (
              <div key={i} style={{ fontSize:14, color:C.text, marginBottom:4, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop:8 }}>
        <Label>NATO Alphabet Reference</Label>
        <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:12, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))", gap:6, fontSize:12 }}>
          {Object.entries(NATO_ALPHABET).slice(0, 26).map(([char, word]) => (
            <div key={char}><span style={{ color:C.indigo, fontWeight:600 }}>{char}</span> - {word}</div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

// Binary Text Component
function BinaryText() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const textToBinary = (text) => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
  };

  const binaryToText = (binary) => {
    try {
      const bytes = binary.replace(/\s/g, '').match(/.{1,8}/g) || [];
      return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('');
    } catch {
      return 'Error: Invalid binary';
    }
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToBinary(input));
      } else {
        setOutput(binaryToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Binary</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Binary → Text</Btn>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Binary'}</Label>
        <Textarea value={input} onChange={setInput} rows={6} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello' : '01001000 01100101 01101100 01101100 01101111'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Binary' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={mode === 'encode'}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// Hex Text Component
function HexText() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const textToHex = (text) => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
    }).join(' ');
  };

  const hexToText = (hex) => {
    try {
      const bytes = hex.replace(/\s/g, '').match(/.{1,2}/g) || [];
      return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
    } catch {
      return 'Error: Invalid hex';
    }
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToHex(input));
      } else {
        setOutput(hexToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Hex</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Hex → Text</Btn>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Hexadecimal'}</Label>
        <Textarea value={input} onChange={setInput} rows={6} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello' : '48 65 6C 6C 6F'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Hexadecimal' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={mode === 'encode'}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// Octal Text Component
function OctalText() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const textToOctal = (text) => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(8).padStart(3, '0');
    }).join(' ');
  };

  const octalToText = (octal) => {
    try {
      const bytes = octal.trim().split(/\s+/);
      return bytes.map(byte => String.fromCharCode(parseInt(byte, 8))).join('');
    } catch {
      return 'Error: Invalid octal';
    }
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToOctal(input));
      } else {
        setOutput(octalToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Octal</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Octal → Text</Btn>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Octal'}</Label>
        <Textarea value={input} onChange={setInput} rows={6} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello' : '110 145 154 154 157'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Octal' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={mode === 'encode'}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// ROT13 Component
function Rot13() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const rot13 = (text) => {
    return text.replace(/[a-zA-Z]/g, char => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  };

  useEffect(() => {
    if (input) {
      setOutput(rot13(input));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={6} placeholder="Hello World" />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>ROT13 Output</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={false}>{output}</Result>
          <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>
            💡 ROT13 is reversible: applying it twice returns the original text
          </div>
        </div>
      )}
    </VStack>
  );
}

// ROT47 Component
function Rot47() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const rot47 = (text) => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 33 && code <= 126) {
        return String.fromCharCode(33 + ((code - 33 + 47) % 94));
      }
      return char;
    }).join('');
  };

  useEffect(() => {
    if (input) {
      setOutput(rot47(input));
    } else {
      setOutput('');
    }
  }, [input]);

  return (
    <VStack>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={6} placeholder="Hello World 123!" />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>ROT47 Output</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
          <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>
            💡 ROT47 is reversible: applying it twice returns the original text
          </div>
        </div>
      )}
    </VStack>
  );
}

// Caesar Cipher Component
function CaesarCipher() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(3);
  const [output, setOutput] = useState('');

  const caesar = (text, shift, decode = false) => {
    const actualShift = decode ? -shift : shift;
    return text.replace(/[a-zA-Z]/g, char => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + actualShift + 26) % 26) + base);
    });
  };

  useEffect(() => {
    if (input) {
      setOutput(caesar(input, shift, mode === 'decode'));
    } else {
      setOutput('');
    }
  }, [input, shift, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <SelectInput value={mode} onChange={setMode} options={[
          { value:'encode', label:'Encrypt' },
          { value:'decode', label:'Decrypt' }
        ]} />
      </div>
      <div>
        <Label>Shift Amount: {shift}</Label>
        <input type="range" min="1" max="25" value={shift} onChange={e => setShift(parseInt(e.target.value))} 
          style={{ width:"100%", accentColor:C.indigo }} />
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginTop:4 }}>
          <span>1</span>
          <span>13</span>
          <span>25</span>
        </div>
      </div>
      <div>
        <Label>Your Text</Label>
        <Textarea value={input} onChange={setInput} rows={6} placeholder="Hello World" />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Encrypted' : 'Decrypted'} Text</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={false}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// Text to ASCII Component
function TextToAscii() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const textToAscii = (text) => {
    return text.split('').map(char => char.charCodeAt(0)).join(' ');
  };

  const asciiToText = (ascii) => {
    try {
      const codes = ascii.trim().split(/\s+/).map(n => parseInt(n));
      return codes.map(code => String.fromCharCode(code)).join('');
    } catch {
      return 'Error: Invalid ASCII codes';
    }
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToAscii(input));
      } else {
        setOutput(asciiToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → ASCII</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>ASCII → Text</Btn>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'ASCII Codes'}</Label>
        <Textarea value={input} onChange={setInput} rows={6} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello' : '72 101 108 108 111'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'ASCII Codes' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={mode === 'encode'}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// Text to Unicode Component
function TextToUnicode() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const textToUnicode = (text) => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
      return `U+${code}`;
    }).join(' ');
  };

  const unicodeToText = (unicode) => {
    try {
      const codes = unicode.replace(/U\+/gi, '').trim().split(/\s+/);
      return codes.map(code => String.fromCharCode(parseInt(code, 16))).join('');
    } catch {
      return 'Error: Invalid Unicode';
    }
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToUnicode(input));
      } else {
        setOutput(unicodeToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Unicode</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Unicode → Text</Btn>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Unicode Code Points'}</Label>
        <Textarea value={input} onChange={setInput} rows={6} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello' : 'U+0048 U+0065 U+006C U+006C U+006F'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Unicode Code Points' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={mode === 'encode'}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// Braille Translator Component
function BrailleTranslator() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const textToBraille = (text) => {
    return text.toLowerCase().split('').map(char => BRAILLE[char] || char).join('');
  };

  const brailleToText = (braille) => {
    const reverseBraille = {};
    Object.keys(BRAILLE).forEach(key => {
      reverseBraille[BRAILLE[key]] = key;
    });
    return braille.split('').map(char => reverseBraille[char] || char).join('');
  };

  useEffect(() => {
    if (input) {
      if (mode === 'encode') {
        setOutput(textToBraille(input));
      } else {
        setOutput(brailleToText(input));
      }
    } else {
      setOutput('');
    }
  }, [input, mode]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Braille</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Braille → Text</Btn>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Braille'}</Label>
        <Textarea value={input} onChange={setInput} rows={6} placeholder={mode === 'encode' ? 'hello' : '⠓⠑⠇⠇⠕'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Braille' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"16px", fontSize:mode === 'encode' ? 28 : 16, color:C.text, lineHeight:1.6 }}>
            {output}
          </div>
        </div>
      )}
      <div style={{ marginTop:8 }}>
        <Label>Braille Reference</Label>
        <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:12, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(50px, 1fr))", gap:8, fontSize:16 }}>
          {Object.entries(BRAILLE).slice(0, 26).map(([char, braille]) => (
            <div key={char} style={{ textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:2 }}>{braille}</div>
              <div style={{ fontSize:11, color:C.muted }}>{char}</div>
            </div>
          ))}
        </div>
      </div>
    </VStack>
  );
}

// Leetspeak Component
const LEET_LIGHT = { a:'4', e:'3', i:'1', o:'0', s:'5', t:'7' };
const LEET_HEAVY = { a:'4', b:'8', e:'3', g:'9', i:'1', l:'|', o:'0', s:'5', t:'7', z:'2', c:'(', d:'|)', h:'#', k:'|<', m:'|\\/|', n:'|\\|', u:'|_', v:'\\/', w:'\\/\\/', x:'><' };
function buildLeetDecodeMap(map) {
  // Longest leet tokens first so multi-char sequences (|\/| etc.) decode before single chars
  const entries = Object.entries(map).map(([letter, leet]) => [leet, letter]);
  entries.sort((a, b) => b[0].length - a[0].length);
  return entries;
}
function leetEncode(text, map) {
  return text.split('').map(ch => {
    const lower = ch.toLowerCase();
    return map[lower] !== undefined ? map[lower] : ch;
  }).join('');
}
function leetDecode(text, map) {
  const decodeEntries = buildLeetDecodeMap(map);
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [leet, letter] of decodeEntries) {
      if (leet && text.startsWith(leet, i)) {
        result += letter;
        i += leet.length;
        matched = true;
        break;
      }
    }
    if (!matched) { result += text[i]; i++; }
  }
  return result;
}
function LeetspeakTranslator() {
  const [mode, setMode] = useState('encode');
  const [level, setLevel] = useState('light');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    const map = level === 'heavy' ? LEET_HEAVY : LEET_LIGHT;
    setOutput(mode === 'encode' ? leetEncode(input, map) : leetDecode(input, map));
  }, [input, mode, level]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Leet</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Leet → Text</Btn>
        </div>
      </div>
      <div>
        <Label>Substitution Level</Label>
        <SelectInput value={level} onChange={setLevel} options={[
          { value:'light', label:'Light (a→4, e→3, i→1, o→0, s→5, t→7)' },
          { value:'heavy', label:'Heavy (adds b→8, g→9, l→|, z→2 and more)' }
        ]} />
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Leetspeak'}</Label>
        <Textarea value={input} onChange={setInput} rows={5} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Elite Hacker' : '3l1t3 h4ck3r'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Leetspeak' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
          {mode === 'decode' && level === 'heavy' && (
            <div style={{ fontSize:11, color:C.warn, marginTop:6 }}>
              ⚠ Heavy-mode decoding is best-effort — some substitutions are ambiguous and may not perfectly restore the original text.
            </div>
          )}
        </div>
      )}
    </VStack>
  );
}

// A1Z26 Cipher Component
function A1Z26Cipher() {
  const [mode, setMode] = useState('encode');
  const [sep, setSep] = useState('-');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const encode = (text, separator) => {
    return text.split(/(\s+)/).map(token => {
      if (/^\s+$/.test(token)) return ' '; // collapse whitespace to a single word break
      return token.split('').map(ch => {
        const code = ch.toLowerCase().charCodeAt(0);
        if (code >= 97 && code <= 122) return String(code - 96);
        return ch; // pass through non-letters
      }).join(separator);
    }).join('');
  };

  const decode = (text) => {
    // Words are separated by spaces; within a word, numbers are split on any non-digit separator
    return text.trim().split(/\s+/).map(word => {
      return word.split(/[^0-9]+/).filter(Boolean).map(numStr => {
        const n = parseInt(numStr, 10);
        if (n >= 1 && n <= 26) return String.fromCharCode(n + 96);
        return '';
      }).join('');
    }).join(' ');
  };

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    setOutput(mode === 'encode' ? encode(input, sep) : decode(input));
  }, [input, mode, sep]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Text → Numbers</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Numbers → Text</Btn>
        </div>
      </div>
      {mode === 'encode' && (
        <div>
          <Label>Separator</Label>
          <SelectInput value={sep} onChange={setSep} options={[
            { value:'-', label:'Dash ( - )' },
            { value:' ', label:'Space (   )' },
            { value:',', label:'Comma ( , )' }
          ]} />
        </div>
      )}
      <div>
        <Label>{mode === 'encode' ? 'Text' : 'Numbers'}</Label>
        <Textarea value={input} onChange={setInput} rows={5} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'Hello World' : '8-5-12-12-15 23-15-18-12-4'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Numbers' : 'Text'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono={mode === 'encode'}>{output}</Result>
        </div>
      )}
    </VStack>
  );
}

// Rail Fence Cipher Component
function railFenceEncode(text, rails) {
  if (rails < 2) return text;
  const chars = Array.from(text);
  const rows = Array.from({ length: rails }, () => []);
  let r = 0, dir = 1;
  for (const ch of chars) {
    rows[r].push(ch);
    if (r === 0) dir = 1;
    else if (r === rails - 1) dir = -1;
    r += dir;
  }
  return rows.map(row => row.join('')).join('');
}
function railFenceDecode(cipher, rails) {
  if (rails < 2) return cipher;
  const chars = Array.from(cipher);
  const len = chars.length;
  // 1. Reconstruct the zigzag rail index for each position
  const pattern = [];
  let r = 0, dir = 1;
  for (let i = 0; i < len; i++) {
    pattern.push(r);
    if (r === 0) dir = 1;
    else if (r === rails - 1) dir = -1;
    r += dir;
  }
  // 2. Count how many chars land on each rail
  const counts = Array(rails).fill(0);
  for (const p of pattern) counts[p]++;
  // 3. Slice the ciphertext into rails (top to bottom)
  const railChars = [];
  let idx = 0;
  for (let rr = 0; rr < rails; rr++) {
    railChars.push(chars.slice(idx, idx + counts[rr]));
    idx += counts[rr];
  }
  // 4. Read back following the zigzag order
  const pointers = Array(rails).fill(0);
  let out = '';
  for (const p of pattern) out += railChars[p][pointers[p]++];
  return out;
}
function RailFenceCipher() {
  const [mode, setMode] = useState('encode');
  const [rails, setRails] = useState(3);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => {
    if (!input) { setOutput(''); return; }
    setOutput(mode === 'encode' ? railFenceEncode(input, rails) : railFenceDecode(input, rails));
  }, [input, mode, rails]);

  return (
    <VStack>
      <div>
        <Label>Mode</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Btn variant={mode === 'encode' ? 'primary' : 'secondary'} onClick={() => setMode('encode')}>Encrypt</Btn>
          <Btn variant={mode === 'decode' ? 'primary' : 'secondary'} onClick={() => setMode('decode')}>Decrypt</Btn>
        </div>
      </div>
      <div>
        <Label>Rails: {rails}</Label>
        <input type="range" min="2" max="10" value={rails} onChange={e => setRails(parseInt(e.target.value))}
          style={{ width:"100%", accentColor:C.indigo }} />
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.muted, marginTop:4 }}>
          <span>2</span><span>6</span><span>10</span>
        </div>
      </div>
      <div>
        <Label>{mode === 'encode' ? 'Plaintext' : 'Ciphertext'}</Label>
        <Textarea value={input} onChange={setInput} rows={5} mono={mode === 'decode'} placeholder={mode === 'encode' ? 'WEAREDISCOVEREDFLEEATONCE' : 'WECRLTEERDSOEEFEAOCAIVDEN'} />
      </div>
      {output && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>{mode === 'encode' ? 'Ciphertext' : 'Plaintext'}</Label>
            <CopyBtn text={output} />
          </div>
          <Result mono>{output}</Result>
          <div style={{ fontSize:11, color:C.muted, marginTop:6 }}>
            💡 Decrypting the ciphertext with the same rail count restores your exact original text.
          </div>
        </div>
      )}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "morse-code": MorseCode,
  "nato-alphabet": NatoAlphabet,
  "binary-text": BinaryText,
  "hex-text": HexText,
  "octal-text": OctalText,
  "rot13": Rot13,
  "rot47": Rot47,
  "caesar-cipher": CaesarCipher,
  "text-to-ascii": TextToAscii,
  "text-to-unicode": TextToUnicode,
  "braille-translator": BrailleTranslator,
  "leetspeak-translator": LeetspeakTranslator,
  "a1z26-cipher": A1Z26Cipher,
  "rail-fence-cipher": RailFenceCipher,
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
          { "@type": "ListItem", "position": 2, "name": "Text Encoding Tools", "item": "https://toolsrift.com/encoding" },
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
    document.title = meta?.title || `${tool?.name} – Free Encoding Tool | ToolsRift`;
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
    document.title = `${cat?.name || 'Category'} – Text Encoding | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.indigo }}>← Back to home</a>
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.indigo; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{tool.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, color:C.text, marginBottom:6 }}>{tool.name}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.5, marginBottom:10 }}>{tool.desc}</div>
              <Badge color={tool.free?"green":"amber"}>{tool.free?"Free":"Pro"}</Badge>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

function HomePage() {
  useEffect(() => {
    document.title = "Free Text Encoding Tools – Morse, Binary, Hex, Cipher Online | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search text encoding tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(99,102,241,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.indigo, textDecoration:"none" }}>{THEME?.name||"Text Encoding"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(99,102,241,0.12)", color:C.indigo, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(99,102,241,0.25)" }}>{TOOLS.length} tools</span>
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
    {href:"/fancy",icon:"✨",label:"Fancy Text"},
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
        <a href="/" style={{fontSize:12,color:"#6366F1",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftEncoding() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="encoding"/>}
    </div>
  );
}

export default ToolsRiftEncoding;