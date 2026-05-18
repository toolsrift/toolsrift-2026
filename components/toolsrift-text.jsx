import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

// �"����� BRAND ���������������������������������������������������������������������������������������������������������������������������������������"�
const BRAND = { name: "ToolsRift", tagline: "Text & Content Tools" };

// �"����� SHARED DESIGN TOKENS ���������������������������������������������������������������������������������������������������������"�
const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  blue: "#8B5CF6", blueD: "#7C3AED", text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

// �"����� GLOBAL CSS �����������������������������������������������������������������������������������������������������������������������������"�
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
  ::selection{background:rgba(139,92,246,0.3)}
  button:hover{filter:brightness(1.1)}
  select option{background:#0D1117}
  textarea{resize:vertical}
  .fade-in{animation:fadeIn .25s ease}
  @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  .tr-nav-cats{display:flex;gap:4px;align-items:center}
  .tr-nav-badge{display:inline-flex}
  @media(max-width:640px){
    .tr-nav-cats{display:none!important}
    .tr-nav-badge{display:none!important}
  }
`;

// �"����� SHARED UI COMPONENTS ���������������������������������������������������������������������������������������������������������"�
const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "blue" }) {
  const map = { blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)" };
  const textMap = { blue:"#60A5FA", green:"#34D399", amber:"#FCD34D" };
  return (
    <span style={{ background:map[color]||map.blue, color:textMap[color]||textMap.blue, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${C.blue},${C.blueD})`, color:"#fff", boxShadow:"0 2px 8px rgba(139,92,246,0.25)" },
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(59,130,246,0.08)", border:`1px solid rgba(59,130,246,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.blue }}>{value}</div>
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
      {copied ? "— Copied" : "Copy"}
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

// �"����� ROUTER �������������������������������������������������������������������������������������������������������������������������������������"�
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

// �"����� TOOL REGISTRY �����������������������������������������������������������������������������������������������������������������������"�
const TOOLS = [
  // Analysis
  { id:"word-counter-pro",    cat:"analysis",  name:"Word Counter Pro",         desc:"Count words, chars, sentences & get reading time",  icon:"⏱️", free:true },
  { id:"character-counter",   cat:"analysis",  name:"Character Counter",        desc:"Detailed character breakdown with limits checker",   icon:"📝", free:true },
  { id:"reading-time",        cat:"analysis",  name:"Reading Time Calculator",  desc:"Estimate reading & speaking time for any content",   icon:"⏱️", free:true },
  { id:"word-frequency",      cat:"analysis",  name:"Word Frequency Analyzer",  desc:"Rank words by frequency with percentage breakdown",  icon:"📝", free:true },
  { id:"text-statistics",     cat:"analysis",  name:"Text Statistics",          desc:"20+ text metrics in one comprehensive report",       icon:"🖋️", free:true },
  { id:"unique-words",        cat:"analysis",  name:"Unique Word Extractor",    desc:"Extract all unique words from a block of text",      icon:"🔍", free:true },
  { id:"palindrome-checker",  cat:"analysis",  name:"Palindrome Checker",       desc:"Check if text, words or phrases are palindromes",    icon:"🔤", free:true },
  { id:"anagram-checker",     cat:"analysis",  name:"Anagram Checker",          desc:"Check if two words or phrases are anagrams",         icon:"🔤", free:true },
  // Transform
  { id:"text-reverser",       cat:"transform", name:"Text Reverser",            desc:"Reverse characters or words in any text",            icon:"↩️", free:true },
  { id:"text-sorter",         cat:"transform", name:"Line Sorter",              desc:"Sort lines alphabetically, reverse, or randomly",    icon:"🎲", free:true },
  { id:"remove-duplicates",   cat:"transform", name:"Remove Duplicate Lines",   desc:"Remove all duplicate lines from text instantly",     icon:"🖋️", free:true },
  { id:"remove-empty-lines",  cat:"transform", name:"Remove Empty Lines",       desc:"Strip all blank and empty lines from text",          icon:"🧹", free:true },
  { id:"remove-extra-spaces", cat:"transform", name:"Remove Extra Spaces",      desc:"Trim and normalize whitespace in your text",         icon:"⬛", free:true },
  { id:"trim-lines",          cat:"transform", name:"Trim Lines",               desc:"Remove leading and trailing spaces from each line",  icon:"🧹", free:true },
  { id:"text-repeater",       cat:"transform", name:"Text Repeater",            desc:"Repeat text N times with custom separator",          icon:"🔁", free:true },
  { id:"find-replace",        cat:"transform", name:"Find & Replace",           desc:"Find and replace text with regex or plain match",    icon:"🔍", free:true },
  { id:"rot13",               cat:"transform", name:"ROT13 Encoder",            desc:"Encode or decode text using ROT13 cipher",           icon:"🔐", free:true },
  { id:"pig-latin",           cat:"transform", name:"Pig Latin Converter",      desc:"Convert English text to Pig Latin and back",         icon:"🔄", free:true },
  { id:"text-randomizer",     cat:"transform", name:"Text Randomizer",          desc:"Shuffle words, sentences or lines randomly",         icon:"🎲", free:true },
  { id:"punctuation-remover", cat:"transform", name:"Punctuation Remover",      desc:"Strip all punctuation marks from your text",         icon:"🧽", free:true },
  // Format
  { id:"url-slug",            cat:"format",    name:"URL Slug Generator",       desc:"Generate SEO-friendly URL slugs from any title",     icon:"🔗", free:true },
  { id:"add-line-numbers",    cat:"format",    name:"Add Line Numbers",         desc:"Prefix every line with sequential line numbers",     icon:"⚡", free:true },
  { id:"remove-line-numbers", cat:"format",    name:"Remove Line Numbers",      desc:"Strip leading line numbers from numbered text",      icon:"🧹", free:true },
  { id:"text-wrapper",        cat:"format",    name:"Text Wrapper",             desc:"Wrap long lines at a specified column width",        icon:"📏", free:true },
  { id:"text-unwrapper",      cat:"format",    name:"Text Unwrapper",           desc:"Join wrapped lines into single continuous lines",    icon:"🔀", free:true },
  { id:"text-truncator",      cat:"format",    name:"Text Truncator",           desc:"Truncate text to a max length with ellipsis",        icon:"🖋️", free:true },
  { id:"text-padder",         cat:"format",    name:"Text Padder",              desc:"Pad text left, right or center to a fixed width",   icon:"📏", free:true },
  { id:"tab-to-spaces",       cat:"format",    name:"Tab to Spaces",            desc:"Convert tab characters to spaces (2, 4, or 8)",      icon:"⇥",  free:true },
  { id:"spaces-to-tab",       cat:"format",    name:"Spaces to Tab",            desc:"Convert groups of spaces back to tab characters",   icon:"⇤",  free:true },
  { id:"text-joiner",         cat:"format",    name:"Line Joiner",              desc:"Join multiple lines into one with a separator",      icon:"🔀", free:true },
  // List
  { id:"text-splitter",       cat:"list",      name:"Text Splitter",            desc:"Split text by delimiter into separate lines",        icon:"✂️", free:true },
  { id:"text-to-bullets",     cat:"list",      name:"Text to Bullet List",      desc:"Convert lines of text to formatted bullet points",   icon:"•",  free:true },
  { id:"bullets-to-text",     cat:"list",      name:"Bullet List to Text",      desc:"Strip bullet points and return plain text lines",    icon:"🧹", free:true },
  { id:"text-to-numbered",    cat:"list",      name:"Text to Numbered List",    desc:"Convert plain text lines to numbered list format",   icon:"✨", free:true },
  { id:"numbered-to-text",    cat:"list",      name:"Numbered List to Text",    desc:"Remove numbering from lists and get plain text",     icon:"•", free:true },
  // Extract
  { id:"number-extractor",    cat:"extract",   name:"Number Extractor",         desc:"Extract all numbers and integers from text",         icon:"🔍", free:true },
  { id:"email-extractor",     cat:"extract",   name:"Email Extractor",          desc:"Extract all email addresses from a block of text",   icon:"📧", free:true },
  { id:"url-extractor",       cat:"extract",   name:"URL Extractor",            desc:"Extract all URLs and links from any text content",   icon:"🔗", free:true },
  { id:"hashtag-extractor",   cat:"extract",   name:"Hashtag & Mention Extractor", desc:"Extract #hashtags and @mentions from text",      icon:"#",  free:true },
  { id:"sentence-splitter",   cat:"extract",   name:"Sentence Splitter",        desc:"Split a paragraph into individual sentences",        icon:"✂️", free:true },
  // Convert
  { id:"text-to-morse",       cat:"convert",   name:"Text to Morse Code",       desc:"Convert English text to Morse code dots and dashes", icon:"📡", free:true },
  { id:"morse-to-text",       cat:"convert",   name:"Morse Code to Text",       desc:"Decode Morse code back to readable English text",    icon:"📡", free:true },
  { id:"text-diff",           cat:"convert",   name:"Text Comparison / Diff",   desc:"Compare two texts and highlight the differences",    icon:"⚖️", free:true },
  { id:"number-to-words",     cat:"convert",   name:"Number to Words",          desc:"Convert any number to its written word form",        icon:"🔄", free:true },
  { id:"words-to-number",     cat:"convert",   name:"Words to Number",          desc:"Convert written number words back to digits",        icon:"🔄", free:true },
];

const CATEGORIES = [
  { id:"analysis",  name:"Text Analysis",   icon:"📊", desc:"Analyze & measure text content" },
  { id:"transform", name:"Text Transform",  icon:"🖋️", desc:"Modify and manipulate text" },
  { id:"format",    name:"Text Formatting", icon:"✨", desc:"Format and structure text" },
  { id:"list",      name:"List Tools",      icon:"•", desc:"Work with lists and bullets" },
  { id:"extract",   name:"Text Extraction", icon:"🔍", desc:"Extract specific data from text" },
  { id:"convert",   name:"Text Conversion", icon:"🔄", desc:"Convert between text formats" },
];

const TOOL_META = {
  "word-counter-pro": {
    title:"Free Word Counter Pro — Words, Characters & Sentences",
    desc:"Count words, characters, sentences, paragraphs and get reading time instantly. Free online word counter with detailed text statistics.",
    faq:[["How is reading time calculated?","Reading time uses 225 WPM (average adult reader). Speaking time uses 130 WPM."],["What is a good word count for a blog post?","1,500–2,500 words generally perform best in search rankings."],["Does this count hidden characters?","Yes — it counts all characters including spaces, tabs, and line breaks."]]
  },
  "character-counter": {
    title:"Free Character Counter — Count Characters Online",
    desc:"Count characters with and without spaces. Check limits for Twitter (280), SMS (160), Meta descriptions (160), and more.",
    faq:[["What is Twitter's character limit?","Twitter allows 280 characters per tweet."],["What is the ideal meta description length?","Google displays 150–160 characters. Keep yours under 160."],["Why are characters counted differently?","Some platforms count bytes, not characters, which affects emoji and unicode characters."]]
  },
  "reading-time": {
    title:"Reading Time Calculator — Estimate Read & Speak Time",
    desc:"Estimate reading time and speaking time for articles, speeches, and presentations. Based on average reading and speaking speeds.",
    faq:[["What is the average reading speed?","Adults read at about 200–250 WPM. This tool uses 225 WPM as default."],["How long should a 5-minute speech be?","At 130 WPM speaking speed, a 5-minute speech needs about 650 words."],["Can I change the WPM?","Yes — use the custom WPM fields to match your specific audience or speaking style."]]
  },
  "word-frequency": {
    title:"Word Frequency Analyzer — Rank Words by Frequency",
    desc:"Analyze word frequency in any text. See which words appear most often with counts, percentages, and visual frequency bars.",
    faq:[["What does word frequency tell you?","Keyword density and repetition patterns. Useful for SEO, editing, and readability checks."],["Are stop words excluded?","You can toggle common stop words (the, a, is...) on/off for cleaner results."],["Can I use this for SEO?","Yes — check your target keyword frequency to ensure proper keyword distribution."]]
  },
  "text-statistics": {
    title:"Text Statistics Tool — 20+ Text Metrics Report",
    desc:"Get a full text statistics report: word count, character count, sentence length, syllable count, Flesch reading ease score, and more.",
    faq:[["What is the Flesch Reading Ease score?","It ranges from 0–100. Higher scores mean easier to read. Aim for 60–70 for general audiences."],["What is a good average sentence length?","14–20 words per sentence is considered ideal for readability."],["What is syllable count used for?","Syllable counts feed into readability formulas like Flesch-Kincaid Grade Level."]]
  },
  "unique-words": {
    title:"Unique Word Extractor — Find All Unique Words in Text",
    desc:"Extract every unique word from a block of text. Sort alphabetically, by frequency, or by length. Export as a list.",
    faq:[["What counts as a unique word?","Case-insensitive matching — 'The' and 'the' count as the same word."],["Are numbers included?","Yes, by default. You can toggle numbers and punctuation exclusion."],["Can I use this to build a glossary?","Yes — it's great for extracting vocabulary lists or unique terms from documents."]]
  },
  "palindrome-checker": {
    title:"Palindrome Checker — Check Words & Phrases Online",
    desc:"Check if a word, number, or phrase is a palindrome. Works with spaces, punctuation, and case-insensitive matching.",
    faq:[["What is a palindrome?","A word or phrase that reads the same forward and backward, like 'racecar' or 'A man a plan a canal Panama'."],["Are spaces counted?","No — spaces and punctuation are ignored in phrase palindrome checks."],["Is palindrome checking case-sensitive?","No — 'Racecar' and 'racecar' are both recognized as palindromes."]]
  },
  "anagram-checker": {
    title:"Anagram Checker — Check if Two Words are Anagrams",
    desc:"Check if two words or phrases are anagrams of each other. Case-insensitive, ignores spaces and punctuation.",
    faq:[["What is an anagram?","A word formed by rearranging the letters of another, like 'listen' and 'silent'."],["Does it ignore spaces?","Yes — spaces and punctuation are stripped before comparison."],["Can I check phrases?","Yes — 'Astronomer' and 'Moon starer' are anagrams when spaces are ignored."]]
  },
  "text-reverser": {
    title:"Text Reverser — Reverse Text, Words & Characters Online",
    desc:"Reverse any text by characters, words, or lines. Instantly flip and mirror text for puzzles, encoding, and fun.",
    faq:[["What is text reversal used for?","Fun puzzles, simple encoding, checking palindromes, and creative typography."],["Can I reverse by words?","Yes — choose from reverse characters, reverse word order, or reverse line order."],["Does it preserve capitalization?","Character reversal flips everything including case. Word reversal keeps words intact."]]
  },
  "text-sorter": {
    title:"Line Sorter — Sort Lines Alphabetically Online",
    desc:"Sort lines alphabetically A—Z or Z—A, sort by length, or shuffle randomly. Remove duplicates while sorting.",
    faq:[["Does sorting ignore case?","Yes — case-insensitive sorting treats 'Apple' and 'apple' as equal."],["Can I sort numbers?","Yes — numeric sort mode sorts lines that start with numbers correctly (1, 2, 10 not 1, 10, 2)."],["Does it remove blank lines?","Optional — you can strip blank lines before or after sorting."]]
  },
  "remove-duplicates": {
    title:"Remove Duplicate Lines — Clean Text Online",
    desc:"Remove all duplicate lines from text. Case-sensitive or insensitive. Sort remaining lines alphabetically.",
    faq:[["Is matching case-sensitive?","Toggle case sensitivity — by default it's case-insensitive."],["What if there are blank lines between duplicates?","Blank lines are treated as lines too — enable 'ignore blank lines' to skip them."],["Does order of first occurrence matter?","Yes — by default the first occurrence is kept and later duplicates are removed."]]
  },
  "remove-empty-lines": {
    title:"Remove Empty Lines — Strip Blank Lines from Text",
    desc:"Remove all empty and blank lines from your text. Option to also remove lines with only whitespace.",
    faq:[["What's the difference between empty and blank lines?","Empty lines have zero characters. Blank lines may have spaces/tabs but no visible content."],["Can I remove only consecutive blank lines?","Yes — use the option to reduce multiple consecutive blanks to one blank line."],["Is this useful for code?","Yes — great for cleaning up pasted code or config files with excessive blank lines."]]
  },
  "remove-extra-spaces": {
    title:"Remove Extra Spaces — Clean Whitespace from Text",
    desc:"Remove double spaces, extra whitespace, and normalize spacing throughout your text to single spaces.",
    faq:[["What counts as extra spaces?","Two or more consecutive spaces are condensed to one. Leading/trailing spaces are trimmed."],["Does this affect line breaks?","No — line breaks are preserved. Only horizontal space characters are affected."],["Can I also trim each line?","Yes — enable 'Trim lines' to also remove leading and trailing spaces per line."]]
  },
  "trim-lines": {
    title:"Trim Lines — Remove Leading & Trailing Spaces",
    desc:"Remove leading and trailing spaces from every line of text. Choose trim left, right, or both sides.",
    faq:[["What does 'trim' mean?","Trimming removes spaces, tabs, and other whitespace at the start or end of each line."],["Does it affect middle of line?","No — only the very beginning and end of each line are trimmed."],["Is this different from removing extra spaces?","Yes — trimming targets line edges only. Removing extra spaces targets all spaces within lines."]]
  },
  "text-repeater": {
    title:"Text Repeater — Repeat Text N Times Online",
    desc:"Repeat any text or string any number of times with a custom separator. Output instantly.",
    faq:[["What separators can I use?","Newline, space, comma, or a custom separator you define."],["Is there a repeat limit?","The tool limits output to 50,000 characters to prevent browser slowdown."],["Can I repeat entire paragraphs?","Yes — any amount of text can be repeated, including multi-line text."]]
  },
  "find-replace": {
    title:"Find & Replace Text — Online Text Editor Tool",
    desc:"Find and replace text in bulk. Supports plain text matching, case-insensitive matching, and regular expressions.",
    faq:[["Does it support regex?","Yes — enable regex mode for powerful pattern matching and replacements."],["Can I do global replace?","Yes — all occurrences are replaced by default. You can limit to first N occurrences."],["Is it case-sensitive?","Toggle case sensitivity. By default it's case-insensitive."]]
  },
  "rot13": {
    title:"ROT13 Encoder & Decoder — Online ROT13 Cipher Tool",
    desc:"Encode or decode text using ROT13 cipher. ROT13 is its own inverse — apply it twice to get back the original text.",
    faq:[["What is ROT13?","ROT13 substitutes each letter with the letter 13 positions ahead in the alphabet."],["Is ROT13 encryption?","No — ROT13 is not secure encryption. It's a simple substitution cipher used for light obfuscation."],["Does it affect numbers and symbols?","No — only A—Z letters are shifted. Numbers, spaces, and symbols remain unchanged."]]
  },
  "pig-latin": {
    title:"Pig Latin Converter — English to Pig Latin Online",
    desc:"Convert English text to Pig Latin instantly. Learn the rules and see each word transformed step by step.",
    faq:[["What is Pig Latin?","A language game where words are altered by moving consonants to the end and adding 'ay'."],["What are the rules?","For words starting with consonants, move them to the end and add 'ay'. For vowel starts, just add 'way'."],["Is it reversible?","The reverse conversion is included — convert Pig Latin back to English."]]
  },
  "text-randomizer": {
    title:"Text Randomizer — Shuffle Words & Lines Randomly",
    desc:"Randomly shuffle words, sentences, or lines in your text. Great for creating variations or randomizing lists.",
    faq:[["Can I shuffle just the lines?","Yes — choose between shuffle words, shuffle sentences, or shuffle lines."],["Is it truly random?","Yes — it uses JavaScript's Math.random() for true randomization each time."],["Can I shuffle multiple times?","Yes — click shuffle again for a different random order each time."]]
  },
  "punctuation-remover": {
    title:"Punctuation Remover — Strip Punctuation from Text",
    desc:"Remove all punctuation marks from text. Option to keep specific punctuation or remove only certain types.",
    faq:[["What counts as punctuation?","All standard punctuation: . , ! ? ; : ' \" ( ) [ ] { } - — / \\ and more."],["Can I keep some punctuation?","Yes — specify which characters to preserve, like hyphens or apostrophes."],["Does this affect line breaks?","No — line breaks and spaces are preserved unless you explicitly remove them too."]]
  },
  "url-slug": {
    title:"URL Slug Generator — Create SEO-Friendly Slugs",
    desc:"Generate clean, SEO-friendly URL slugs from titles and headings. Handles special characters, spaces, and accents.",
    faq:[["What is a URL slug?","The URL-friendly version of a title. 'Hello World!' becomes 'hello-world'."],["Are accented characters handled?","Yes — ñ, é, ü and other accented characters are converted to their ASCII equivalents."],["Should slugs be lowercase?","Yes — always use lowercase slugs for consistent, canonical URLs."]]
  },
  "add-line-numbers": {
    title:"Add Line Numbers — Number Lines in Text Online",
    desc:"Add line numbers to every line of text. Choose format, padding, and starting number.",
    faq:[["What number format options are there?","You can choose '1.', '1:', '(1)', or custom prefix/suffix formats."],["Can I start from a number other than 1?","Yes — set any starting number for the sequence."],["Does it skip empty lines?","Optional — you can skip numbering blank lines."]]
  },
  "remove-line-numbers": {
    title:"Remove Line Numbers — Strip Line Numbers from Text",
    desc:"Remove leading line numbers from numbered text. Handles various number formats like 1. 1: (1) and more.",
    faq:[["What formats does it recognize?","Formats like '1. ', '1: ', '(1) ', '1\t' and variations with leading zeros."],["What if my numbers aren't at the start?","The tool looks for numbers only at the very beginning of each line."],["Does it remove the space after the number?","Yes — the separator (space, dot, colon) is also removed."]]
  },
  "text-wrapper": {
    title:"Text Wrapper — Wrap Text at Column Width Online",
    desc:"Add line breaks to wrap long text at a specified column width. Preserves word boundaries.",
    faq:[["What is word wrapping?","Adding line breaks so lines don't exceed a character width limit."],["Does it break mid-word?","No — wrapping happens at word boundaries to preserve readability."],["What width should I use?","72–80 chars for emails, 100–120 for code, 60 for print or e-readers."]]
  },
  "text-unwrapper": {
    title:"Text Unwrapper — Remove Hard Line Breaks Online",
    desc:"Remove hard line breaks from wrapped text. Join wrapped lines back into full paragraphs.",
    faq:[["What is text unwrapping?","Removing line breaks that were added to force text to fit a certain width."],["How does it know which breaks to remove?","Paragraph breaks (double newlines) are preserved. Single line breaks are joined."],["When is this useful?","When copying text from PDFs, emails, or terminals that add hard line breaks."]]
  },
  "text-truncator": {
    title:"Text Truncator — Truncate Text to Character Limit",
    desc:"Truncate text to a maximum length. Add ellipsis, cut at word boundary, or hard truncate.",
    faq:[["Does it cut mid-word?","Optional — choose 'word boundary' to ensure clean cuts."],["Can I add a custom ellipsis?","Yes — default is '...' but you can set any suffix."],["Can I truncate multiple paragraphs?","Yes — the entire input is treated as one text block and truncated at the limit."]]
  },
  "text-padder": {
    title:"Text Padder — Pad Text to Fixed Width",
    desc:"Pad text on the left, right, or both sides to a fixed character width. Useful for aligning columns.",
    faq:[["What is text padding?","Adding characters to fill text to a specified minimum length."],["Can I choose the pad character?","Yes — space is default, but any character can be used."],["When is left-padding useful?","Left-padding numbers creates right-aligned, neatly formatted columns."]]
  },
  "tab-to-spaces": {
    title:"Tab to Spaces Converter — Convert Tabs to Spaces",
    desc:"Convert tab characters to 2, 4, or 8 spaces. Useful for formatting code for different editors.",
    faq:[["What are the common tab sizes?","2 spaces (JS/Ruby style), 4 spaces (Python/Java style), 8 spaces (traditional Unix style)."],["Does it convert all tabs?","Yes — every tab character in the text is converted to the chosen number of spaces."],["What if I mix tabs and spaces?","Only tab characters are converted. Existing spaces are left as-is."]]
  },
  "spaces-to-tab": {
    title:"Spaces to Tab Converter — Replace Spaces with Tabs",
    desc:"Convert groups of 2, 4, or 8 spaces back to tab characters. Normalize indentation in code.",
    faq:[["Which spaces get converted?","Only space groups at the start of lines (indentation) are typically converted."],["What about spaces inside lines?","You can choose whether to convert all space groups or only leading indentation."],["Why convert spaces to tabs?","Some editors, tools, and style guides (like Go) require tab-based indentation."]]
  },
  "text-joiner": {
    title:"Line Joiner — Join Multiple Lines into One",
    desc:"Join multiple lines of text into one line with a custom separator. Combine lists and paragraphs.",
    faq:[["What separators can I use?","Space, comma, semicolon, newline, or any custom separator string."],["Does it trim each line first?","Yes — leading/trailing whitespace is trimmed from each line before joining."],["Can I join alternating lines?","Not directly, but you can process lines in groups using the split option."]]
  },
  "text-splitter": {
    title:"Text Splitter — Split Text by Delimiter",
    desc:"Split any text by a delimiter (comma, space, pipe, etc) into separate lines. Works on single-line or multi-line input.",
    faq:[["What delimiters can I use?","Any character or string — comma, space, semicolon, pipe, tab, or custom."],["Can I split by regex?","Yes — enable regex mode for complex splitting patterns."],["Are empty parts kept?","Optional — you can discard empty segments that result from consecutive delimiters."]]
  },
  "text-to-bullets": {
    title:"Text to Bullet List — Convert Lines to Bullets",
    desc:"Convert lines of plain text to formatted bullet points. Choose bullet style: •, -, *, >, or custom.",
    faq:[["What bullet styles are available?","•, -, *, >, —', ▸, and custom character options."],["Does it handle nested lists?","Not automatically, but you can indent lines before converting."],["Can I add spacing between bullets?","Yes — choose single line or add a blank line between each bullet."]]
  },
  "bullets-to-text": {
    title:"Bullet List to Text — Remove Bullet Points",
    desc:"Strip bullet points, dashes, and list markers from text to get clean plain text lines.",
    faq:[["What markers does it remove?","• - * > —' ▸ ◦ and numbered list prefixes like '1. ' '(1) '."],["Does it handle mixed bullet types?","Yes — all common bullet characters are detected and removed automatically."],["Does it affect the text content?","No — only the leading bullet character and space are removed."]]
  },
  "text-to-numbered": {
    title:"Text to Numbered List — Add Numbers to Lines",
    desc:"Convert plain text lines to a numbered list. Choose number format, separator, and starting number.",
    faq:[["What number formats are available?","1. 1: 1) (1) [1] and custom prefix/suffix combinations."],["Can I start from a number other than 1?","Yes — set any starting number."],["Can I use letters instead?","Yes — choose alphabetic (a. b. c.) or Roman numeral (i. ii. iii.) formats."]]
  },
  "numbered-to-text": {
    title:"Numbered List to Plain Text — Remove List Numbers",
    desc:"Remove numbering from numbered lists to get clean plain text. Handles various list number formats.",
    faq:[["What formats are supported?","1. 1: 1) (1) [1] and mixed formats in the same text."],["What about Roman numerals?","Yes — i. ii. iii. and I. II. III. formats are also recognized."],["Does it remove the space after the number?","Yes — the number, separator, and following space are all stripped."]]
  },
  "number-extractor": {
    title:"Number Extractor — Extract All Numbers from Text",
    desc:"Extract every number from a block of text. Handles integers, decimals, negatives, and currency values.",
    faq:[["Are decimal numbers extracted?","Yes — 3.14, 0.5, and -2.7 are all captured."],["Are phone numbers extracted?","Yes — phone numbers are detected as digit groups."],["Can I sum the extracted numbers?","Yes — a running total is shown below the extracted list."]]
  },
  "email-extractor": {
    title:"Email Extractor — Extract Email Addresses from Text",
    desc:"Extract all valid email addresses from any block of text. Removes duplicates and validates format.",
    faq:[["Does it validate email format?","Yes — it checks for proper format (user@domain.tld) but can't check if they're active."],["Are duplicate emails removed?","By default yes — toggle off to keep all occurrences."],["Can I copy the list?","Yes — click Copy to get a newline-separated list of all found emails."]]
  },
  "url-extractor": {
    title:"URL Extractor — Extract Links from Text Online",
    desc:"Extract all URLs and hyperlinks from a block of text. Handles http, https, ftp, and bare domain formats.",
    faq:[["What URL formats are detected?","http://, https://, ftp://, and bare www. domains are all detected."],["Are duplicates removed?","Optional — duplicates can be removed or kept with counts."],["Can I filter by domain?","Not directly, but you can copy and use the URL Slug tool on each result."]]
  },
  "hashtag-extractor": {
    title:"Hashtag & Mention Extractor — Find #Tags and @Mentions",
    desc:"Extract all hashtags and @mentions from social media posts, tweets, and other text content.",
    faq:[["What formats are extracted?","#hashtag and @mention patterns. Multi-word hashtags with underscores like #my_tag are supported."],["Are duplicates removed?","Yes — unique tags/mentions are extracted, with occurrence counts shown."],["Can I export the list?","Yes — copy the extracted list as a comma-separated or newline-separated list."]]
  },
  "sentence-splitter": {
    title:"Sentence Splitter — Split Paragraphs into Sentences",
    desc:"Split any paragraph or text block into individual sentences. Handles abbreviations and edge cases.",
    faq:[["How does it detect sentence boundaries?","It detects . ! ? followed by spaces and capital letters, handling common abbreviations like Mr. Dr. etc."],["Are abbreviations handled?","Yes — common abbreviations (Mr., Dr., etc., vs.) are not treated as sentence endings."],["Can I number the sentences?","Yes — enable line numbering to see each sentence indexed."]]
  },
  "text-to-morse": {
    title:"Text to Morse Code Converter — Encode Text Online",
    desc:"Convert English text to Morse code dots and dashes. Supports audio playback and customizable speed.",
    faq:[["What characters are supported?","A—Z letters, 0–9 digits, and common punctuation marks."],["Can I play the Morse code?","Yes — click Play to hear the Morse code using the Web Audio API."],["What is the dot/dash format?","By default • and — with / between letters and // between words."]]
  },
  "morse-to-text": {
    title:"Morse Code to Text Decoder — Decode Morse Online",
    desc:"Decode Morse code back to English text. Paste dots and dashes or use the interactive input.",
    faq:[["What separator format should I use?","Use space between symbols within a letter, / between letters, and // or double-space between words."],["Does it support international Morse?","Standard ITU Morse code for Latin characters is fully supported."],["Can I hear the Morse I'm decoding?","Yes — audio playback is available for verification."]]
  },
  "text-diff": {
    title:"Text Comparison Tool — Diff Two Texts Online",
    desc:"Compare two texts side-by-side and highlight additions, deletions, and unchanged lines. Word-level and line-level diff.",
    faq:[["What diff modes are available?","Line-level and word-level diff modes. Toggle between unified and side-by-side views."],["Are changes highlighted in color?","Yes — additions are green, deletions are red, and unchanged text is shown normally."],["Can I diff code?","Yes — works well for comparing code blocks, configs, and any plain text."]]
  },
  "number-to-words": {
    title:"Number to Words Converter — Convert Numbers to Text",
    desc:"Convert any number to its written word form. Supports integers up to trillions and decimal numbers.",
    faq:[["What is the largest number supported?","Up to 999 trillion (999,999,999,999,999)."],["Are decimals supported?","Yes — 3.14 converts to 'three point one four'."],["Is Indian number system supported?","Yes — toggle to use lakh/crore/arab notation used in India."]]
  },
  "words-to-number": {
    title:"Words to Number Converter — Text to Digits",
    desc:"Convert number words like 'forty-two' or 'one thousand five hundred' back to numeric digits.",
    faq:[["What formats are recognized?","'forty-two', 'forty two', 'one thousand five hundred and twenty' and similar."],["Are ordinals supported?","Yes — 'first', 'second', 'twenty-third' are converted to 1, 2, 23."],["What is the largest input handled?","Up to trillions — 'nine hundred ninety-nine trillion...' is fully supported."]]
  },
};

// �"����� MORSE CODE TABLE �����������������������������������������������������������������������������������������������������������������"�
const MORSE = {
  A:"•-",B:"-•••",C:"-•-•",D:"-••",E:"•",F:"••-•",G:"--•",H:"••••",I:"••",J:"•---",K:"-•-",
  L:"•-••",M:"--",N:"-•",O:"---",P:"•--•",Q:"--•-",R:"•-•",S:"•••",T:"-",U:"••-",V:"•••-",
  W:"•--",X:"-••-",Y:"-•--",Z:"--••",
  "0":"-----","1":"•----","2":"••---","3":"•••--","4":"••••-","5":"•••••",
  "6":"-••••","7":"--•••","8":"---••","9":"----•"
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v,k]));

// �"����� UTILITY FUNCTIONS ���������������������������������������������������������������������������������������������������������������"�
function countSentences(t) {
  if (!t.trim()) return 0;
  return (t.match(/[^.!?]*[.!?]+/g)||[]).length || 1;
}
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g,"");
  if (!word) return 0;
  if (word.length<=3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}
function fleschScore(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = Math.max(1, countSentences(text));
  const syllables = words.reduce((a,w) => a + countSyllables(w), 0);
  const wc = words.length || 1;
  return Math.round(206.835 - 1.015*(wc/sentences) - 84.6*(syllables/wc));
}

function numToWords(n) {
  if (isNaN(n)) return "";
  const ones = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  function h(n) {
    if (n===0) return "";
    if (n<20) return ones[n]+" ";
    if (n<100) return tens[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"")+" ";
    return ones[Math.floor(n/100)]+" hundred "+(n%100?h(n%100):"");
  }
  if (n===0) return "zero";
  const neg = n<0; n=Math.abs(n);
  const tr=Math.floor(n/1e12), bi=Math.floor((n%1e12)/1e9), mi=Math.floor((n%1e9)/1e6), th=Math.floor((n%1e6)/1e3), re=n%1e3;
  let r="";
  if(tr) r+=h(tr)+"trillion ";
  if(bi) r+=h(bi)+"billion ";
  if(mi) r+=h(mi)+"million ";
  if(th) r+=h(th)+"thousand ";
  if(re) r+=h(re);
  return (neg?"negative ":"")+r.trim();
}

// �"����� INDIVIDUAL TOOL COMPONENTS ���������������������������������������������������������������������������������������������"�

function WordCounterPro() {
  const [text, setText] = useState("");
  const s = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const sentences = countSentences(text);
    const paras = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const readSec = Math.round((words.length/225)*60);
    const speakSec = Math.round((words.length/130)*60);
    const fmt = s => s<60 ? `${s}s` : `${Math.floor(s/60)}m ${s%60}s`;
    return { words:words.length, chars:text.length, charsNoSpace:text.replace(/\s/g,"").length, sentences, paras, lines, read:fmt(readSec), speak:fmt(speakSec) };
  }, [text]);
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste or type your text here..." rows={8} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[["Words",s.words],["Characters",s.chars],["No Spaces",s.charsNoSpace],["Sentences",s.sentences],["Paragraphs",s.paras],["Lines",s.lines],["Read Time",s.read],["Speak Time",s.speak]].map(([l,v])=><StatBox key={l} value={v} label={l}/>)}
      </div>
    </VStack>
  );
}

function CharacterCounter() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("");
  const len = text.length;
  const lim = parseInt(limit)||0;
  const limits = [{ name:"Twitter/X", v:280},{ name:"SMS",v:160},{ name:"Meta Desc",v:160},{ name:"Title Tag",v:60},{ name:"Instagram",v:2200},{ name:"LinkedIn",v:700}];
  return (
    <VStack>
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ flex:1 }}><Label>Your Text</Label><Textarea value={text} onChange={setText} placeholder="Type or paste your text..." rows={5} /></div>
        <div style={{ width:160 }}><Label>Character Limit</Label><Input value={limit} onChange={setLimit} placeholder="e.g. 160" /></div>
      </div>
      {lim > 0 && (
        <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:8, padding:14, border:`1px solid ${len>lim?C.danger:C.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ ...T.label }}>Limit Progress</span>
            <span style={{ fontWeight:700, color:len>lim?C.danger:C.success }}>{len}/{lim} ({lim-len >= 0 ? `${lim-len} left` : `${len-lim} over`})</span>
          </div>
          <div style={{ height:6, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${Math.min((len/lim)*100,100)}%`, background:len>lim?C.danger:C.blue, borderRadius:3, transition:"width .2s" }} />
          </div>
        </div>
      )}
      <Grid3>
        {[["Chars",len],["No Spaces",text.replace(/\s/g,"").length],["Words",text.trim()?text.trim().split(/\s+/).length:0],["Lines",text?text.split("\n").length:0],["Unique Chars",new Set(text.toLowerCase().replace(/\s/g,"")).size],["Digits",((text.match(/\d/g))||[]).length]].map(([l,v])=><StatBox key={l} value={v} label={l}/>)}
      </Grid3>
      <div>
        <Label>Platform Limits</Label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {limits.map(pl => {
            const over = len > pl.v, pct = Math.min((len/pl.v)*100,100);
            return (
              <div key={pl.name} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${over?C.danger:C.border}`, borderRadius:8, padding:"10px 14px", minWidth:120 }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{pl.name} ({pl.v})</div>
                <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden", marginBottom:4 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:over?C.danger:C.blue, borderRadius:2 }} />
                </div>
                <div style={{ fontSize:12, fontWeight:600, color:over?C.danger:C.success }}>{over?`${len-pl.v} over`:`${pl.v-len} left`}</div>
              </div>
            );
          })}
        </div>
      </div>
    </VStack>
  );
}

function ReadingTime() {
  const [text, setText] = useState("");
  const [readWpm, setReadWpm] = useState("225");
  const [speakWpm, setSpeakWpm] = useState("130");
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const calcTime = (wpm) => {
    const secs = Math.round((words / (parseInt(wpm)||225)) * 60);
    const m = Math.floor(secs/60), s = secs%60;
    return m===0 ? `${s} sec` : s===0 ? `${m} min` : `${m} min ${s} sec`;
  };
  const pages = (words/275).toFixed(1);
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste your article, speech, or presentation content..." rows={8} />
      <Grid2>
        <div><Label>Reading Speed (WPM)</Label><Input value={readWpm} onChange={setReadWpm} placeholder="225" /></div>
        <div><Label>Speaking Speed (WPM)</Label><Input value={speakWpm} onChange={setSpeakWpm} placeholder="130" /></div>
      </Grid2>
      <Grid3>
        <BigResult value={words} label="Total Words" />
        <BigResult value={calcTime(readWpm)} label="Reading Time" />
        <BigResult value={calcTime(speakWpm)} label="Speaking Time" />
      </Grid3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {[["Pages (A4 @ 275 wpm)", pages],["Paragraphs", text.trim()?text.trim().split(/\n\s*\n/).filter(Boolean).length:0],["Sentences", countSentences(text)]].map(([l,v])=><StatBox key={l} value={v} label={l}/>)}
      </div>
      <Card style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)" }}>
        <div style={{ fontSize:12, color:"#FCD34D", lineHeight:1.7 }}>
          <strong>Speed Reference:</strong> Silent reading ~225 WPM · Presentation delivery ~130 WPM · Audiobooks ~150 WPM · Speed reading ~400 WPM
        </div>
      </Card>
    </VStack>
  );
}

function WordFrequency() {
  const [text, setText] = useState("");
  const [stopWords, setStopWords] = useState(true);
  const [limit, setLimit] = useState("20");
  const STOP = new Set("the a an and or but in on at to for of is are was were be been being have has had do does did will would could should may might shall can this that these those it its i you he she we they me him her us them my your his our their what which who when where why how with from into through during before after above below between out up down".split(" "));
  const freq = useMemo(() => {
    if (!text.trim()) return [];
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g,"").split(/\s+/).filter(Boolean);
    const filtered = stopWords ? words.filter(w => !STOP.has(w) && w.length>1) : words;
    const map = {};
    filtered.forEach(w => { map[w]=(map[w]||0)+1; });
    const total = Object.values(map).reduce((a,b)=>a+b,0);
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,parseInt(limit)||20).map(([word,count])=>({ word, count, pct:((count/total)*100).toFixed(1) }));
  }, [text, stopWords, limit]);
  const max = freq[0]?.count||1;
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste text to analyze word frequency..." rows={5} />
      <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}>
          <input type="checkbox" checked={stopWords} onChange={e=>setStopWords(e.target.checked)} />
          Filter stop words
        </label>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Label>Top</Label>
          <Input value={limit} onChange={setLimit} placeholder="20" style={{ width:70 }} />
          <Label>words</Label>
        </div>
      </div>
      {freq.length > 0 ? (
        <div style={{ maxHeight:380, overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
          {freq.map((f,i) => (
            <div key={f.word} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", background:"rgba(255,255,255,0.02)", borderRadius:6 }}>
              <span style={{ width:28, textAlign:"right", fontSize:11, color:C.muted }}>{i+1}</span>
              <span style={{ width:130, fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:C.text }}>{f.word}</span>
              <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(f.count/max)*100}%`, background:`linear-gradient(90deg,${C.blue},${C.blueD})`, borderRadius:3 }} />
              </div>
              <span style={{ width:40, textAlign:"right", fontWeight:600, fontSize:13, color:C.text }}>{f.count}</span>
              <span style={{ width:44, textAlign:"right", fontSize:11, color:C.muted }}>{f.pct}%</span>
            </div>
          ))}
        </div>
      ) : <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>Enter text above to see word frequency</div>}
    </VStack>
  );
}

function TextStatistics() {
  const [text, setText] = useState("");
  const s = useMemo(() => {
    if (!text.trim()) return null;
    const words = text.trim().split(/\s+/).filter(Boolean);
    const sentences = Math.max(1,countSentences(text));
    const syllables = words.reduce((a,w)=>a+countSyllables(w),0);
    const wc = words.length||1;
    const charNoSpace = text.replace(/\s/g,"").length;
    const avgWord = (charNoSpace/wc).toFixed(1);
    const avgSentence = (wc/sentences).toFixed(1);
    const avgSyllable = (syllables/wc).toFixed(1);
    const flesch = fleschScore(text);
    const fkGrade = Math.max(0,(0.39*(wc/sentences)+11.8*(syllables/wc)-15.59)).toFixed(1);
    const longestWord = [...words].sort((a,b)=>b.length-a.length)[0]?.replace(/[^a-zA-Z]/g,"")||"";
    const uniqueWords = new Set(words.map(w=>w.toLowerCase().replace(/[^a-z]/g,""))).size;
    const paras = text.trim().split(/\n\s*\n/).filter(Boolean).length;
    const readDesc = flesch>80?"Very Easy":flesch>70?"Easy":flesch>60?"Fairly Easy":flesch>50?"Standard":flesch>30?"Difficult":"Very Difficult";
    return { wc, chars:text.length, charNoSpace, sentences, paras, syllables, avgWord, avgSentence, avgSyllable, flesch, fkGrade, longestWord, uniqueWords, readDesc };
  }, [text]);
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste your text for a full statistical analysis..." rows={7} />
      {s ? (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[["Words",s.wc],["Characters",s.chars],["Sentences",s.sentences],["Paragraphs",s.paras],["Syllables",s.syllables],["Unique Words",s.uniqueWords],["Avg Word Len",s.avgWord],["Avg Sentence",s.avgSentence]].map(([l,v])=><StatBox key={l} value={v} label={l}/>)}
          </div>
          <Grid2>
            <Card>
              <div style={{ ...T.label, marginBottom:12 }}>Readability</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:13, color:C.muted }}>Flesch Reading Ease</span>
                <span style={{ fontWeight:700, color:C.blue, fontSize:15 }}>{s.flesch}</span>
              </div>
              <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, marginBottom:8 }}>
                <div style={{ height:"100%", width:`${Math.max(0,Math.min(s.flesch,100))}%`, background:`linear-gradient(90deg,${C.danger},${C.warn},${C.success})`, borderRadius:3 }} />
              </div>
              <div style={{ fontSize:12, color:C.muted }}>Rating: <strong style={{ color:C.text }}>{s.readDesc}</strong></div>
              <div style={{ marginTop:10, fontSize:13, display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:C.muted }}>Flesch-Kincaid Grade</span>
                <span style={{ color:C.text, fontWeight:600 }}>Grade {s.fkGrade}</span>
              </div>
            </Card>
            <Card>
              <div style={{ ...T.label, marginBottom:12 }}>Text Density</div>
              {[["Avg Word Length",`${s.avgWord} chars`],["Avg Sentence",`${s.avgSentence} words`],["Avg Syllables/Word",s.avgSyllable],["Longest Word",s.longestWord||"—"]].map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                  <span style={{ color:C.muted }}>{l}</span>
                  <span style={{ color:C.text, fontWeight:600, fontFamily:"'JetBrains Mono',monospace" }}>{v}</span>
                </div>
              ))}
            </Card>
          </Grid2>
        </>
      ) : <div style={{ color:C.muted, textAlign:"center", padding:32, fontSize:13 }}>Enter text above to generate statistics</div>}
    </VStack>
  );
}

function UniqueWords() {
  const [text, setText] = useState("");
  const [sort, setSort] = useState("alpha");
  const [output, setOutput] = useState("");
  const run = () => {
    const words = text.toLowerCase().replace(/[^a-z0-9\s'-]/g," ").split(/\s+/).filter(w=>w.length>0);
    let unique = [...new Set(words)];
    if (sort==="alpha") unique.sort();
    else if (sort==="length") unique.sort((a,b)=>b.length-a.length);
    setOutput(unique.join("\n"));
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>Input Text</Label><Textarea value={text} onChange={setText} placeholder="Paste text to extract unique words..." rows={8} /></div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><Label>Sort By</Label>
            <SelectInput value={sort} onChange={setSort} options={[{value:"alpha",label:"Alphabetical"},{value:"length",label:"By Length"},{value:"none",label:"No Sorting"}]} style={{ width:"100%" }} />
          </div>
          <Btn onClick={run} disabled={!text.trim()}>Extract Unique Words</Btn>
          <div style={{ fontSize:12, color:C.muted }}>
            {output ? `${output.split("\n").filter(Boolean).length} unique words found` : ""}
          </div>
          {output && <div style={{ flex:1 }}><Label>Result</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={8} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
        </div>
      </Grid2>
    </VStack>
  );
}

function PalindromeChecker() {
  const [text, setText] = useState("");
  const check = (t) => {
    const clean = t.toLowerCase().replace(/[^a-z0-9]/g,"");
    return clean === clean.split("").reverse().join("");
  };
  const isPalin = text.trim() ? check(text) : null;
  const words = text.trim().split(/\s+/).filter(Boolean);
  const palindromeWords = words.filter(w => w.length>1 && check(w));
  return (
    <VStack>
      <Input value={text} onChange={setText} placeholder="Type a word or phrase to check..." />
      {isPalin !== null && (
        <div style={{ textAlign:"center", padding:"24px", background:isPalin?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)", border:`1px solid ${isPalin?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.2)"}`, borderRadius:12 }} className="fade-in">
          <div style={{ fontSize:40, marginBottom:8 }}>{isPalin?"🎉":"——"}</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:isPalin?C.success:C.danger }}>
            {isPalin ? "Palindrome!" : "Not a Palindrome"}
          </div>
          <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>
            {text.trim()} —' cleaned: {text.toLowerCase().replace(/[^a-z0-9]/g,"")}
          </div>
        </div>
      )}
      {palindromeWords.length > 0 && (
        <Card>
          <Label>Palindrome Words Found in Input</Label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
            {palindromeWords.map(w=><Badge key={w}>{w}</Badge>)}
          </div>
        </Card>
      )}
      <Card>
        <Label>Famous Palindromes</Label>
        <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:6 }}>
          {["racecar","level","radar","civic","madam","A man a plan a canal Panama","Never odd or even","Was it a car or a cat I saw"].map(p=>(
            <div key={p} style={{ cursor:"pointer", padding:"6px 10px", background:"rgba(255,255,255,0.03)", borderRadius:6, fontSize:13, color:C.text }} onClick={()=>setText(p)}>{p}</div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function AnagramChecker() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const isAnagram = (s1, s2) => {
    const clean = s => s.toLowerCase().replace(/[^a-z]/g,"").split("").sort().join("");
    return s1.trim() && s2.trim() && clean(s1) === clean(s2);
  };
  const result = a.trim() && b.trim() ? isAnagram(a,b) : null;
  const sorted1 = a.toLowerCase().replace(/[^a-z]/g,"").split("").sort().join("");
  const sorted2 = b.toLowerCase().replace(/[^a-z]/g,"").split("").sort().join("");
  return (
    <VStack>
      <Grid2>
        <div><Label>Word / Phrase A</Label><Input value={a} onChange={setA} placeholder="e.g. listen" /></div>
        <div><Label>Word / Phrase B</Label><Input value={b} onChange={setB} placeholder="e.g. silent" /></div>
      </Grid2>
      {result !== null && (
        <div style={{ textAlign:"center", padding:"24px", background:result?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.08)", border:`1px solid ${result?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.2)"}`, borderRadius:12 }} className="fade-in">
          <div style={{ fontSize:36, marginBottom:8 }}>{result?"✅":"——"}</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:700, color:result?C.success:C.danger }}>
            {result ? "These are Anagrams!" : "Not Anagrams"}
          </div>
          {a.trim() && b.trim() && <div style={{ fontSize:12, color:C.muted, marginTop:8, fontFamily:"'JetBrains Mono',monospace" }}>{sorted1} vs {sorted2}</div>}
        </div>
      )}
      <Card>
        <Label>Classic Anagram Pairs</Label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:6 }}>
          {[["listen","silent"],["astronomer","moon starer"],["school master","the classroom"],["conversation","voices rant on"],["debit card","bad credit"],["the eyes","they see"]].map(([x,y])=>(
            <div key={x} style={{ cursor:"pointer", padding:"6px 10px", background:"rgba(255,255,255,0.03)", borderRadius:6, fontSize:12, color:C.muted }} onClick={()=>{setA(x);setB(y);}}>
              <span style={{ color:C.text }}>{x}</span> —" <span style={{ color:C.text }}>{y}</span>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function TextReverser() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("chars");
  const [output, setOutput] = useState("");
  const run = () => {
    if (mode==="chars") setOutput(text.split("").reverse().join(""));
    else if (mode==="words") setOutput(text.split(" ").reverse().join(" "));
    else setOutput(text.split("\n").reverse().join("\n"));
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>Input Text</Label><Textarea value={text} onChange={setText} placeholder="Enter text to reverse..." rows={6} /></div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><Label>Reverse Mode</Label>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {[["chars","Characters (mirror text)"],["words","Word Order"],["lines","Line Order"]].map(([v,l])=>(
                <label key={v} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text, padding:"8px 12px", background:mode===v?"rgba(59,130,246,0.1)":"rgba(255,255,255,0.02)", borderRadius:6, border:`1px solid ${mode===v?"rgba(59,130,246,0.3)":C.border}` }}>
                  <input type="radio" name="rmode" checked={mode===v} onChange={()=>setMode(v)} /> {l}
                </label>
              ))}
            </div>
          </div>
          <Btn onClick={run} disabled={!text.trim()}>Reverse Text</Btn>
        </div>
      </Grid2>
      {output && <div><Label>Result</Label><div style={{ position:"relative" }}><Result>{output}</Result><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function TextSorter() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("asc");
  const [removeDups, setRemoveDups] = useState(false);
  const [output, setOutput] = useState("");
  const run = () => {
    let lines = text.split("\n");
    if (mode==="asc") lines.sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase()));
    else if (mode==="desc") lines.sort((a,b)=>b.toLowerCase().localeCompare(a.toLowerCase()));
    else if (mode==="length") lines.sort((a,b)=>a.length-b.length);
    else if (mode==="random") lines.sort(()=>Math.random()-0.5);
    else if (mode==="numeric") lines.sort((a,b)=>parseFloat(a)-parseFloat(b));
    if (removeDups) lines = [...new Set(lines)];
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <SelectInput value={mode} onChange={setMode} options={[{value:"asc",label:"A —' Z"},{value:"desc",label:"Z —' A"},{value:"length",label:"By Length"},{value:"numeric",label:"Numeric"},{value:"random",label:"Random Shuffle"}]} />
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}>
          <input type="checkbox" checked={removeDups} onChange={e=>setRemoveDups(e.target.checked)} /> Remove duplicates
        </label>
        <Btn onClick={run} disabled={!text.trim()}>Sort Lines</Btn>
      </div>
      <Grid2>
        <div><Label>Input (one item per line)</Label><Textarea value={text} onChange={setText} placeholder={"banana\napple\ncherry\nmango"} rows={10} /></div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Label>Sorted Output</Label>
          {output && <><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div><div style={{ fontSize:12, color:C.muted }}>{output.split("\n").filter(Boolean).length} lines</div></>}
        </div>
      </Grid2>
    </VStack>
  );
}

function RemoveDuplicates() {
  const [text, setText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [output, setOutput] = useState("");
  const [stats, setStats] = useState(null);
  const run = () => {
    const lines = text.split("\n");
    const seen = new Set();
    const result = lines.filter(l => {
      const key = caseSensitive ? l : l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
    setOutput(result.join("\n"));
    setStats({ orig:lines.length, result:result.length, removed:lines.length-result.length });
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}>
          <input type="checkbox" checked={caseSensitive} onChange={e=>setCaseSensitive(e.target.checked)} /> Case sensitive
        </label>
        <Btn onClick={run} disabled={!text.trim()}>Remove Duplicates</Btn>
      </div>
      <Grid2>
        <div><Label>Input Text</Label><Textarea value={text} onChange={setText} placeholder={"Enter lines...\nDuplicate lines\nWill be removed\nDuplicate lines"} rows={10} /></div>
        <div>
          <Label>Cleaned Output</Label>
          {stats && <div style={{ marginBottom:8, display:"flex", gap:8 }}>
            <Badge color="green">{stats.result} kept</Badge>
            <Badge color="amber">{stats.removed} removed</Badge>
          </div>}
          {output && <div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}
        </div>
      </Grid2>
    </VStack>
  );
}

function RemoveEmptyLines() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("all");
  const run = () => {
    let lines = text.split("\n");
    if (mode==="all") lines = lines.filter(l=>l.trim()!=="");
    else if (mode==="blank") lines = lines.filter(l=>l!=="");
    else {
      // reduce consecutive blanks to one
      const result = [];
      let lastBlank = false;
      for (const l of lines) {
        if (!l.trim()) { if (!lastBlank) { result.push(l); lastBlank=true; } }
        else { result.push(l); lastBlank=false; }
      }
      lines = result;
    }
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <SelectInput value={mode} onChange={setMode} options={[{value:"all",label:"Remove all empty lines"},{value:"blank",label:"Remove blank (zero chars)"},{value:"reduce",label:"Reduce to single blank"}]} />
        <Btn onClick={run} disabled={!text.trim()}>Remove Empty Lines</Btn>
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={text} onChange={setText} placeholder="Paste text with empty lines..." rows={10} /></div>
        <div><Label>Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function RemoveExtraSpaces() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [trimLines_, setTrimLines_] = useState(true);
  const run = () => {
    let t = text.replace(/ {2,}/g," ");
    if (trimLines_) t = t.split("\n").map(l=>l.trim()).join("\n");
    setOutput(t);
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}>
          <input type="checkbox" checked={trimLines_} onChange={e=>setTrimLines_(e.target.checked)} /> Also trim line edges
        </label>
        <Btn onClick={run} disabled={!text.trim()}>Remove Extra Spaces</Btn>
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={text} onChange={setText} placeholder="Text  with   too    many     spaces..." rows={8} /></div>
        <div><Label>Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={8} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function TrimLines() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [side, setSide] = useState("both");
  const run = () => {
    const lines = text.split("\n").map(l => side==="both"?l.trim():side==="left"?l.trimStart():l.trimEnd());
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <SelectInput value={side} onChange={setSide} options={[{value:"both",label:"Trim Both Sides"},{value:"left",label:"Trim Left Only"},{value:"right",label:"Trim Right Only"}]} />
        <Btn onClick={run} disabled={!text.trim()}>Trim Lines</Btn>
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={text} onChange={setText} placeholder="  Lines with leading/trailing spaces  " rows={8} mono /></div>
        <div><Label>Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={8} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function TextRepeater() {
  const [text, setText] = useState("");
  const [count, setCount] = useState("3");
  const [sep, setSep] = useState("newline");
  const [output, setOutput] = useState("");
  const sepMap = { newline:"\n", space:" ", comma:", ", none:"" };
  const run = () => {
    const n = Math.min(parseInt(count)||1, 500);
    const separator = sepMap[sep] ?? sep;
    const repeated = Array(n).fill(text).join(separator);
    setOutput(repeated.length>50000 ? repeated.slice(0,50000)+"…(truncated)" : repeated);
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Text to repeat..." rows={3} />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <div><Label>Repeat</Label><Input value={count} onChange={setCount} placeholder="3" style={{ width:80 }} /></div>
        <div><Label>Separator</Label>
          <SelectInput value={sep} onChange={setSep} options={[{value:"newline",label:"New Line"},{value:"space",label:"Space"},{value:"comma",label:"Comma"},{value:"none",label:"None"}]} />
        </div>
        <Btn onClick={run} disabled={!text.trim()}>Repeat Text</Btn>
      </div>
      {output && <div><Label>Result ({output.length} chars)</Label><div style={{ position:"relative" }}><Result>{output}</Result><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function FindReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSens, setCaseSens] = useState(false);
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(0);
  const run = () => {
    if (!find) return;
    try {
      const flags = `g${caseSens?"":"i"}`;
      const pattern = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), flags);
      let c = 0;
      const result = text.replace(pattern, (m) => { c++; return replace; });
      setOutput(result); setCount(c);
    } catch(e) { setOutput("Invalid regex: "+e.message); setCount(0); }
  };
  return (
    <VStack>
      <Grid2>
        <div><Label>Find</Label><Input value={find} onChange={setFind} placeholder="Search text..." /></div>
        <div><Label>Replace With</Label><Input value={replace} onChange={setReplace} placeholder="Replacement (leave empty to delete)" /></div>
      </Grid2>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}><input type="checkbox" checked={useRegex} onChange={e=>setUseRegex(e.target.checked)} /> Use Regex</label>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}><input type="checkbox" checked={caseSens} onChange={e=>setCaseSens(e.target.checked)} /> Case Sensitive</label>
        <Btn onClick={run} disabled={!text.trim()||!find}>Find & Replace</Btn>
        {count>0 && <Badge color="green">{count} replacement{count!==1?"s":""} made</Badge>}
      </div>
      <Grid2>
        <div><Label>Input Text</Label><Textarea value={text} onChange={setText} placeholder="Enter text to search in..." rows={10} /></div>
        <div><Label>Result</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function Rot13() {
  const [input, setInput] = useState("");
  const rot13 = t => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)));
  const output = rot13(input);
  return (
    <VStack>
      <Grid2>
        <div><Label>Input Text</Label><Textarea value={input} onChange={setInput} placeholder="Enter text to ROT13 encode/decode..." rows={8} mono /></div>
        <div><Label>ROT13 Output (symmetric)</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={8} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>
      </Grid2>
      <Card style={{ background:"rgba(59,130,246,0.05)" }}>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.7 }}>
          <strong style={{ color:C.text }}>ROT13</strong> shifts each letter 13 places in the alphabet. Since there are 26 letters, applying ROT13 twice gives you back the original. A—'N, B—'O, ..., Z—'M.
        </div>
      </Card>
    </VStack>
  );
}

function PigLatin() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode");
  const toPigLatin = word => {
    if (!/[a-z]/i.test(word)) return word;
    const lower = word.toLowerCase();
    const vowels = "aeiou";
    if (vowels.includes(lower[0])) return word + "way";
    let i = 0;
    while (i < word.length && !vowels.includes(lower[i])) i++;
    return word.slice(i) + word.slice(0,i) + "ay";
  };
  const fromPigLatin = word => {
    if (word.endsWith("way")) return word.slice(0,-3);
    if (word.endsWith("ay")) {
      const base = word.slice(0,-2);
      const match = base.match(/^(.+?)([^aeiou]+)$/);
      if (match) return match[2]+match[1];
    }
    return word;
  };
  const convert = txt => txt.split(/(\s+)/).map((t,i) => i%2===1 ? t : (mode==="encode"?toPigLatin:fromPigLatin)(t)).join("");
  const output = input ? convert(input) : "";
  return (
    <VStack>
      <div style={{ display:"flex", gap:10 }}>
        {[["encode","English —' Pig Latin"],["decode","Pig Latin —' English"]].map(([v,l])=>(
          <Btn key={v} variant={mode===v?"primary":"secondary"} onClick={()=>setMode(v)}>{l}</Btn>
        ))}
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={input} onChange={setInput} placeholder={mode==="encode"?"Enter English text...":"Enterway Igpay Atinlay..."} rows={7} /></div>
        <div><Label>Output</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={7} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>
      </Grid2>
    </VStack>
  );
}

function TextRandomizer() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("lines");
  const [output, setOutput] = useState("");
  const shuffle = arr => [...arr].sort(()=>Math.random()-0.5);
  const run = () => {
    if (mode==="lines") setOutput(shuffle(text.split("\n")).join("\n"));
    else if (mode==="words") setOutput(shuffle(text.split(" ")).join(" "));
    else {
      const sents = text.match(/[^.!?]+[.!?]+/g) || [text];
      setOutput(shuffle(sents).join(" "));
    }
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <SelectInput value={mode} onChange={setMode} options={[{value:"lines",label:"Shuffle Lines"},{value:"words",label:"Shuffle Words"},{value:"sentences",label:"Shuffle Sentences"}]} />
        <Btn onClick={run} disabled={!text.trim()}>🎲 Shuffle</Btn>
        {output && <Btn variant="secondary" onClick={run}>Shuffle Again</Btn>}
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={text} onChange={setText} placeholder="Enter text to randomize..." rows={9} /></div>
        <div><Label>Shuffled Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={9} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function PunctuationRemover() {
  const [text, setText] = useState("");
  const [keep, setKeep] = useState("");
  const [output, setOutput] = useState("");
  const run = () => {
    const keepSet = new Set(keep.split(""));
    const result = text.replace(/[^\w\s]/g, c => keepSet.has(c) ? c : "");
    setOutput(result);
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste text to remove punctuation from..." rows={6} />
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ flex:1 }}><Label>Keep These Characters (optional)</Label><Input value={keep} onChange={setKeep} placeholder="e.g. - ' to keep hyphens and apostrophes" /></div>
        <Btn onClick={run} disabled={!text.trim()}>Remove Punctuation</Btn>
      </div>
      {output && <div><Label>Result</Label><div style={{ position:"relative" }}><Result>{output}</Result><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function UrlSlug() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const accentMap = {"á":"a","à":"a","â":"a","ä":"a","ã":"a","å":"a","æ":"ae","ç":"c","é":"e","è":"e","ê":"e","ë":"e","í":"i","ì":"i","î":"i","ï":"i","ñ":"n","ó":"o","ò":"o","ô":"o","ö":"o","õ":"o","ø":"o","ú":"u","ù":"u","û":"u","ü":"u","ý":"y","ÿ":"y","ß":"ss"};
  const makeSlug = t => {
    let s = t.toLowerCase();
    s = s.replace(/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿß]/g, c=>accentMap[c]||c);
    s = s.replace(/[^a-z0-9\s-_]/g,"");
    s = s.trim().replace(/[\s_-]+/g, separator);
    return s;
  };
  const slug = makeSlug(input);
  return (
    <VStack>
      <div><Label>Page Title or Heading</Label><Input value={input} onChange={setInput} placeholder="My Awesome Blog Post Title!" /></div>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <Label>Separator:</Label>
        {["-","_"].map(s=><Btn key={s} variant={separator===s?"primary":"secondary"} size="sm" onClick={()=>setSeparator(s)}>{s=="_"?"underscore":"hyphen"}</Btn>)}
      </div>
      {slug && (
        <div>
          <Label>Generated Slug</Label>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ flex:1, ...T.mono, background:"rgba(0,0,0,0.3)", padding:"12px 14px", borderRadius:8, color:C.success, border:`1px solid rgba(16,185,129,0.2)` }}>{slug}</div>
            <CopyBtn text={slug} />
          </div>
          <div style={{ marginTop:8, ...T.mono, fontSize:12, color:C.muted }}>https://yourdomain.com/{slug}</div>
        </div>
      )}
      {input && (
        <Card>
          <Label>Previews</Label>
          <div style={{ display:"flex", flexDirection:"column", gap:4, marginTop:6 }}>
            {[["hyphen", makeSlug(input)],["underscore",makeSlug(input).replace(/-/g,"_")]].map(([l,v])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                <span style={{ color:C.muted }}>{l}:</span>
                <span style={{ ...T.mono, color:C.text }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </VStack>
  );
}

function AddLineNumbers() {
  const [text, setText] = useState("");
  const [start, setStart] = useState("1");
  const [format, setFormat] = useState("dot");
  const [output, setOutput] = useState("");
  const fmtNum = (n) => ({ dot:`${n}.`, colon:`${n}:`, paren:`(${n})`, bracket:`[${n}]` })[format]||`${n}.`;
  const run = () => {
    let n = parseInt(start)||1;
    const lines = text.split("\n").map(l => `${fmtNum(n++)} ${l}`);
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div><Label>Number Format</Label><SelectInput value={format} onChange={setFormat} options={[{value:"dot",label:"1. Line"},{value:"colon",label:"1: Line"},{value:"paren",label:"(1) Line"},{value:"bracket",label:"[1] Line"}]} /></div>
        <div><Label>Start From</Label><Input value={start} onChange={setStart} placeholder="1" style={{ width:80 }} /></div>
        <Btn onClick={run} disabled={!text.trim()}>Add Line Numbers</Btn>
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={text} onChange={setText} placeholder="Enter text to number..." rows={10} /></div>
        <div><Label>Numbered Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function RemoveLineNumbers() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const run = () => {
    const lines = text.split("\n").map(l => l.replace(/^\s*[\[(]?\d+[\].):]?\s*/,""));
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Remove Line Numbers</Btn>
      <Grid2>
        <div><Label>Input (numbered text)</Label><Textarea value={text} onChange={setText} placeholder={"1. First line\n2. Second line\n3. Third line"} rows={10} mono /></div>
        <div><Label>Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function TextWrapper() {
  const [text, setText] = useState("");
  const [width, setWidth] = useState("80");
  const [output, setOutput] = useState("");
  const run = () => {
    const w = parseInt(width)||80;
    const result = text.split("\n").map(line => {
      if (line.length <= w) return line;
      const words = line.split(" ");
      const lines = []; let cur = "";
      for (const word of words) {
        if (cur.length + word.length + (cur?1:0) <= w) { cur += (cur?" ":"")+word; }
        else { if (cur) lines.push(cur); cur = word; }
      }
      if (cur) lines.push(cur);
      return lines.join("\n");
    });
    setOutput(result.join("\n"));
  };
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
        <div><Label>Wrap at Column</Label><Input value={width} onChange={setWidth} placeholder="80" style={{ width:100 }} /></div>
        <Btn onClick={run} disabled={!text.trim()}>Wrap Text</Btn>
      </div>
      <Grid2>
        <div><Label>Input</Label><Textarea value={text} onChange={setText} placeholder="Paste long text to wrap at column width..." rows={10} mono /></div>
        <div><Label>Wrapped Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function TextUnwrapper() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const run = () => {
    const result = text.replace(/([^\n])\n([^\n])/g, "$1 $2");
    setOutput(result);
  };
  return (
    <VStack>
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Unwrap Text</Btn>
      <Grid2>
        <div><Label>Wrapped Input</Label><Textarea value={text} onChange={setText} placeholder={"This text has been\nhard-wrapped at 40 chars.\n\nA new paragraph starts\nhere after blank line."} rows={10} mono /></div>
        <div><Label>Unwrapped Output</Label>{output&&<div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div>}</div>
      </Grid2>
    </VStack>
  );
}

function TextTruncator() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState("100");
  const [suffix, setSuffix] = useState("...");
  const [mode, setMode] = useState("word");
  const truncate = () => {
    const n = parseInt(limit)||100;
    if (text.length <= n) return text;
    if (mode==="hard") return text.slice(0,n)+suffix;
    const sub = text.slice(0,n);
    const lastSpace = sub.lastIndexOf(" ");
    return (lastSpace>0?sub.slice(0,lastSpace):sub)+suffix;
  };
  const result = text ? truncate() : "";
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Enter text to truncate..." rows={6} />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div><Label>Max Characters</Label><Input value={limit} onChange={setLimit} placeholder="100" style={{ width:100 }} /></div>
        <div><Label>Suffix</Label><Input value={suffix} onChange={setSuffix} placeholder="..." style={{ width:100 }} /></div>
        <div><Label>Cut At</Label><SelectInput value={mode} onChange={setMode} options={[{value:"word",label:"Word Boundary"},{value:"hard",label:"Exact Chars"}]} /></div>
      </div>
      {result && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <Label>Truncated Result</Label>
            <span style={{ fontSize:12, color:C.muted }}>{result.length} chars {text.length>parseInt(limit||100)?`(saved ${text.length-result.length})`:""}</span>
          </div>
          <div style={{ position:"relative" }}>
            <Result>{result}</Result>
            <div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={result} /></div>
          </div>
        </div>
      )}
    </VStack>
  );
}

function TextPadder() {
  const [text, setText] = useState("");
  const [width, setWidth] = useState("20");
  const [char, setChar_] = useState(" ");
  const [align, setAlign] = useState("right");
  const [output, setOutput] = useState("");
  const run = () => {
    const w = parseInt(width)||20;
    const c = char[0]||" ";
    const lines = text.split("\n").map(l => {
      const pad = Math.max(0,w-l.length);
      const p = c.repeat(pad);
      return align==="right"?p+l:align==="left"?l+p:p.slice(0,Math.floor(pad/2))+l+p.slice(Math.floor(pad/2));
    });
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Enter lines to pad..." rows={5} mono />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div><Label>Pad to Width</Label><Input value={width} onChange={setWidth} placeholder="20" style={{ width:80 }} /></div>
        <div><Label>Pad Char</Label><Input value={char} onChange={setChar_} placeholder=" " style={{ width:60 }} /></div>
        <div><Label>Alignment</Label><SelectInput value={align} onChange={setAlign} options={[{value:"right",label:"Left-Pad (right align)"},{value:"left",label:"Right-Pad (left align)"},{value:"center",label:"Center Pad"}]} /></div>
        <Btn onClick={run} disabled={!text.trim()}>Pad Text</Btn>
      </div>
      {output && <div><Label>Padded Output</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={5} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function TabToSpaces() {
  const [text, setText] = useState("");
  const [spaces, setSpaces] = useState("4");
  const output = text.replace(/\t/g," ".repeat(parseInt(spaces)||4));
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <Label>Tab Width:</Label>
        {["2","4","8"].map(n=><Btn key={n} variant={spaces===n?"primary":"secondary"} size="sm" onClick={()=>setSpaces(n)}>{n} spaces</Btn>)}
      </div>
      <Grid2>
        <div><Label>Input (with tabs)</Label><Textarea value={text} onChange={setText} placeholder={"function example() {\n\treturn true;\n}"} rows={10} mono /></div>
        <div><Label>Output (spaces)</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>
      </Grid2>
    </VStack>
  );
}

function SpacesToTab() {
  const [text, setText] = useState("");
  const [spaces, setSpaces] = useState("4");
  const output = text.replace(new RegExp(" ".repeat(parseInt(spaces)||4),"g"),"\t");
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <Label>Group Size:</Label>
        {["2","4","8"].map(n=><Btn key={n} variant={spaces===n?"primary":"secondary"} size="sm" onClick={()=>setSpaces(n)}>{n} spaces —' tab</Btn>)}
      </div>
      <Grid2>
        <div><Label>Input (with spaces)</Label><Textarea value={text} onChange={setText} placeholder={"function example() {\n    return true;\n}"} rows={10} mono /></div>
        <div><Label>Output (tabs)</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={10} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>
      </Grid2>
    </VStack>
  );
}

function TextJoiner() {
  const [text, setText] = useState("");
  const [sep, setSep] = useState("space");
  const [custom, setCustom] = useState(", ");
  const [output, setOutput] = useState("");
  const run = () => {
    const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
    const s = {space:" ",comma:", ",semicolon:"; ",pipe:" | ",newline:"\n",custom}[sep]||" ";
    setOutput(lines.join(s));
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder={"Line one\nLine two\nLine three"} rows={7} />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div><Label>Separator</Label><SelectInput value={sep} onChange={setSep} options={[{value:"space",label:"Space"},{value:"comma",label:"Comma"},{value:"semicolon",label:"Semicolon"},{value:"pipe",label:"Pipe"},{value:"newline",label:"Newline"},{value:"custom",label:"Custom"}]} /></div>
        {sep==="custom"&&<div><Label>Custom Sep</Label><Input value={custom} onChange={setCustom} placeholder=", " style={{ width:120 }} /></div>}
        <Btn onClick={run} disabled={!text.trim()}>Join Lines</Btn>
      </div>
      {output&&<div><Label>Joined Output</Label><div style={{ position:"relative" }}><Result>{output}</Result><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function TextSplitter() {
  const [text, setText] = useState("");
  const [delim, setDelim] = useState("comma");
  const [custom, setCustom] = useState("|");
  const [useRegex_, setUseRegex_] = useState(false);
  const [keepEmpty, setKeepEmpty] = useState(false);
  const [output, setOutput] = useState("");
  const run = () => {
    const d = {comma:",",space:" ",semicolon:";",pipe:"|",tab:"\t",newline:"\n",custom}[delim]||",";
    try {
      const parts = useRegex_ ? text.split(new RegExp(d)) : text.split(d);
      const result = (keepEmpty?parts:parts.filter(Boolean)).map(s=>s.trim());
      setOutput(result.join("\n"));
    } catch(e) { setOutput("Invalid regex: "+e.message); }
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Enter text to split..." rows={4} />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div><Label>Split By</Label><SelectInput value={delim} onChange={setDelim} options={[{value:"comma",label:"Comma"},{value:"space",label:"Space"},{value:"semicolon",label:"Semicolon"},{value:"pipe",label:"Pipe |"},{value:"tab",label:"Tab"},{value:"newline",label:"Newline"},{value:"custom",label:"Custom"}]} /></div>
        {delim==="custom"&&<div><Label>Delimiter</Label><Input value={custom} onChange={setCustom} placeholder="|" style={{ width:80 }} /></div>}
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:C.text }}><input type="checkbox" checked={useRegex_} onChange={e=>setUseRegex_(e.target.checked)} />Regex</label>
        <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, color:C.text }}><input type="checkbox" checked={keepEmpty} onChange={e=>setKeepEmpty(e.target.checked)} />Keep empty</label>
        <Btn onClick={run} disabled={!text.trim()}>Split Text</Btn>
      </div>
      {output&&<div><Label>Result ({output.split("\n").filter(Boolean).length} parts)</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={8} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function TextToBullets() {
  const [text, setText] = useState("");
  const [bullet, setBullet] = useState("•");
  const [spacing, setSpacing] = useState(false);
  const [output, setOutput] = useState("");
  const run = () => {
    const lines = text.split("\n").filter(l=>l.trim());
    const result = lines.map(l=>`${bullet} ${l.trim()}`).join(spacing?"\n\n":"\n");
    setOutput(result);
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder={"First item\nSecond item\nThird item"} rows={6} />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <Label>Bullet:</Label>
        {["•","—","-","*",">","—'","▸"].map(b=>(
          <Btn key={b} variant={bullet===b?"primary":"secondary"} size="sm" onClick={()=>setBullet(b)} style={{ minWidth:36 }}>{b}</Btn>
        ))}
        <Input value={bullet} onChange={setBullet} placeholder="•" style={{ width:60 }} />
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}><input type="checkbox" checked={spacing} onChange={e=>setSpacing(e.target.checked)} />Add spacing</label>
        <Btn onClick={run} disabled={!text.trim()}>Convert to Bullets</Btn>
      </div>
      {output&&<div><Label>Bullet List</Label><div style={{ position:"relative" }}><Result mono={false}>{output}</Result><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function BulletsToText() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const run = () => {
    const lines = text.split("\n").map(l=>l.replace(/^\s*[•\-\*>—'▸◦‣——]\s*/,"").trim()).filter(Boolean);
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder={"• First item\n• Second item\n Third item\n* Fourth item"} rows={7} />
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Remove Bullets</Btn>
      {output&&<div><Label>Plain Text Result</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={7} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function TextToNumbered() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("dot");
  const [start, setStart] = useState("1");
  const [mode, setMode] = useState("num");
  const [output, setOutput] = useState("");
  const fmtN = n => {
    if (mode==="alpha") { const c=String.fromCharCode(96+((n-1)%26)+1); return {dot:`${c}.`,colon:`${c}:`,paren:`(${c})`}[format]||`${c}.`; }
    return {dot:`${n}.`,colon:`${n}:`,paren:`(${n})`,bracket:`[${n}]`}[format]||`${n}.`;
  };
  const run = () => {
    let n = parseInt(start)||1;
    const lines = text.split("\n").filter(l=>l.trim()).map(l=>`${fmtN(n++)} ${l.trim()}`);
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder={"First item\nSecond item\nThird item"} rows={6} />
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div><Label>Format</Label><SelectInput value={format} onChange={setFormat} options={[{value:"dot",label:"1. item"},{value:"colon",label:"1: item"},{value:"paren",label:"(1) item"},{value:"bracket",label:"[1] item"}]} /></div>
        <div><Label>Style</Label><SelectInput value={mode} onChange={setMode} options={[{value:"num",label:"Numeric (1, 2, 3)"},{value:"alpha",label:"Alpha (a, b, c)"}]} /></div>
        <div><Label>Start From</Label><Input value={start} onChange={setStart} placeholder="1" style={{ width:70 }} /></div>
        <Btn onClick={run} disabled={!text.trim()}>Convert to List</Btn>
      </div>
      {output&&<div><Label>Numbered List</Label><div style={{ position:"relative" }}><Result>{output}</Result><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function NumberedToText() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const run = () => {
    const lines = text.split("\n").map(l=>l.replace(/^\s*[\[(]?[0-9ivxlcdmIVXLCDMa-z]+[\].):]?\s*/,"").trim()).filter(Boolean);
    setOutput(lines.join("\n"));
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder={"1. First item\n2. Second item\n(3) Third item\n[4] Fourth item"} rows={7} />
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Remove Numbers</Btn>
      {output&&<div><Label>Plain Text</Label><div style={{ position:"relative" }}><Textarea value={output} onChange={()=>{}} rows={7} mono /><div style={{ position:"absolute", top:8, right:8 }}><CopyBtn text={output} /></div></div></div>}
    </VStack>
  );
}

function NumberExtractor() {
  const [text, setText] = useState("");
  const [includeDecimals, setIncludeDecimals] = useState(true);
  const [output, setOutput] = useState([]);
  const run = () => {
    const pattern = includeDecimals ? /-?\d+(?:\.\d+)?/g : /-?\d+/g;
    const nums = text.match(pattern)||[];
    setOutput(nums);
  };
  const sum = output.reduce((a,n)=>a+parseFloat(n),0);
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="There are 42 items, priced at $3.99 each. Call 555-1234 for info." rows={5} />
      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:C.text }}><input type="checkbox" checked={includeDecimals} onChange={e=>setIncludeDecimals(e.target.checked)} />Include decimals</label>
        <Btn onClick={run} disabled={!text.trim()}>Extract Numbers</Btn>
      </div>
      {output.length>0 && (
        <>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {output.map((n,i)=><Badge key={i}>{n}</Badge>)}
          </div>
          <Grid2>
            <StatBox value={output.length} label="Numbers Found" />
            <StatBox value={sum.toFixed(2)} label="Sum" />
          </Grid2>
          <CopyBtn text={output.join("\n")} />
        </>
      )}
    </VStack>
  );
}

function EmailExtractor() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState([]);
  const run = () => {
    const emails = [...new Set((text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)||[]))];
    setOutput(emails);
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste text containing email addresses..." rows={6} />
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Extract Emails</Btn>
      {output.length>0 ? (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><Label>{output.length} email{output.length!==1?"s":""} found</Label><CopyBtn text={output.join("\n")} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {output.map((e,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:6 }}>
                <span style={{ ...T.mono, color:C.success }}>{e}</span>
                <CopyBtn text={e} />
              </div>
            ))}
          </div>
        </>
      ) : output!=null&&text&&<div style={{ color:C.muted, fontSize:13 }}>No emails found. Click Extract to search.</div>}
    </VStack>
  );
}

function UrlExtractor() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState([]);
  const run = () => {
    const urls = [...new Set((text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/g)||[]))];
    setOutput(urls);
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste text or HTML containing URLs..." rows={6} />
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Extract URLs</Btn>
      {output.length>0 ? (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><Label>{output.length} URL{output.length!==1?"s":""} found</Label><CopyBtn text={output.join("\n")} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {output.map((u,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:6, wordBreak:"break-all" }}>
                <span style={{ ...T.mono, color:C.blue, fontSize:12 }}>{u}</span>
                <CopyBtn text={u} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </VStack>
  );
}

function HashtagExtractor() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState({ tags:[], mentions:[] });
  const run = () => {
    const tags = [...new Set((text.match(/#[a-zA-Z0-9_]+/g)||[]))];
    const mentions = [...new Set((text.match(/@[a-zA-Z0-9_.]+/g)||[]))];
    setOutput({ tags, mentions });
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Paste social media post or text with #hashtags and @mentions..." rows={5} />
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Extract Tags & Mentions</Btn>
      {(output.tags.length>0||output.mentions.length>0) && (
        <Grid2>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}><Label>Hashtags ({output.tags.length})</Label><CopyBtn text={output.tags.join(" ")} /></div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{output.tags.map(t=><Badge key={t} color="blue">{t}</Badge>)}</div>
          </Card>
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}><Label>Mentions ({output.mentions.length})</Label><CopyBtn text={output.mentions.join(" ")} /></div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{output.mentions.map(m=><Badge key={m} color="green">{m}</Badge>)}</div>
          </Card>
        </Grid2>
      )}
    </VStack>
  );
}

function SentenceSplitter() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState([]);
  const run = () => {
    const abbrevs = /\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|i\.e|e\.g|Fig|fig|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\./gi;
    const cleaned = text.replace(abbrevs, m=>m.replace(".","<DOT>"));
    const sents = cleaned.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g)||[];
    setOutput(sents.map(s=>s.replace(/<DOT>/g,".").trim()).filter(Boolean));
  };
  return (
    <VStack>
      <Textarea value={text} onChange={setText} placeholder="Enter a paragraph or multi-sentence text to split into individual sentences..." rows={6} />
      <Btn onClick={run} disabled={!text.trim()} style={{ alignSelf:"flex-start" }}>Split Sentences</Btn>
      {output.length>0 && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}><Label>{output.length} sentence{output.length!==1?"s":""}</Label><CopyBtn text={output.join("\n")} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {output.map((s,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"10px 12px", background:"rgba(255,255,255,0.02)", borderRadius:6, alignItems:"flex-start" }}>
                <span style={{ fontSize:11, color:C.muted, minWidth:24, paddingTop:2 }}>{i+1}</span>
                <span style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </VStack>
  );
}

function TextToMorse() {
  const [text, setText] = useState("");
  const encoded = text.toUpperCase().split("").map(c => MORSE[c] || "").join(" ").replace(/ {3,}/g," / ").trim();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("medium");
  const unit = { slow:120, medium:80, fast:50 }[speed];
  const playMorse = async () => {
    if (!encoded || typeof AudioContext==="undefined") return;
    setPlaying(true);
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const U = unit;
    let t = ctx.currentTime + 0.1;
    const beep = (dur) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 600; g.gain.setValueAtTime(0.3,t); g.gain.setValueAtTime(0,t+dur/1000-0.01);
      o.start(t); o.stop(t+dur/1000);
      t += dur/1000 + (U*1)/1000;
    };
    for (const c of encoded) {
      if (c==="•") { beep(U); t += (U)/1000; }
      else if (c==="—") { beep(U*3); t += (U)/1000; }
      else if (c===" ") t += (U*2)/1000;
      else if (c==="/") t += (U*5)/1000;
    }
    setTimeout(()=>setPlaying(false), (t-ctx.currentTime)*1000+200);
  };
  return (
    <VStack>
      <Input value={text} onChange={setText} placeholder="Type text to convert to Morse code..." />
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <Label>Speed:</Label>
        {["slow","medium","fast"].map(s=><Btn key={s} variant={speed===s?"primary":"secondary"} size="sm" onClick={()=>setSpeed(s)}>{s}</Btn>)}
        <Btn variant="secondary" onClick={playMorse} disabled={!encoded||playing}>{playing?"▶ Playing...":"▶ Play Audio"}</Btn>
      </div>
      {encoded && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}><Label>Morse Code</Label><CopyBtn text={encoded} /></div>
          <div style={{ background:"rgba(0,0,0,0.4)", border:`1px solid ${C.border}`, borderRadius:8, padding:16, fontFamily:"'JetBrains Mono',monospace", fontSize:15, color:C.blue, letterSpacing:"0.1em", lineHeight:2, wordBreak:"break-all" }}>{encoded}</div>
        </div>
      )}
      <Card>
        <Label>Reference Chart</Label>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:4, marginTop:8 }}>
          {Object.entries(MORSE).filter(([k])=>/[A-Z0-9]/.test(k)).map(([k,v])=>(
            <div key={k} style={{ textAlign:"center", padding:"4px 2px" }}>
              <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{k}</div>
              <div style={{ fontSize:11, color:C.blue, fontFamily:"'JetBrains Mono',monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

function MorseToText() {
  const [morse, setMorse] = useState("");
  const decoded = useMemo(() => {
    if (!morse.trim()) return "";
    return morse.trim().split(/\s*\/\/\s*|\s{3,}/).map(word =>
      word.trim().split(/\s+/).map(sym => MORSE_REV[sym] || "?").join("")
    ).join(" ");
  }, [morse]);
  return (
    <VStack>
      <Textarea value={morse} onChange={setMorse} placeholder={"•— / — — • • •  (space between letters, / between words)"} rows={5} mono />
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <Btn variant="secondary" size="sm" onClick={()=>setMorse("... --- ...")}>SOS</Btn>
        <Btn variant="secondary" size="sm" onClick={()=>setMorse("• •• •—• •—• — / •• —• / •— ••— •••— •— •—••")}>Emergency</Btn>
      </div>
      {decoded && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}><Label>Decoded Text</Label><CopyBtn text={decoded} /></div>
          <div style={{ background:"rgba(16,185,129,0.08)", border:`1px solid rgba(16,185,129,0.2)`, borderRadius:8, padding:16, fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:600, color:C.success, letterSpacing:"0.05em" }}>{decoded}</div>
        </div>
      )}
    </VStack>
  );
}

function TextDiff() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const diff = useMemo(() => {
    const la = a.split("\n"), lb = b.split("\n");
    const result = [];
    const maxLen = Math.max(la.length, lb.length);
    for (let i=0; i<maxLen; i++) {
      const al = la[i], bl = lb[i];
      if (al===undefined) result.push({ type:"add", text:bl });
      else if (bl===undefined) result.push({ type:"remove", text:al });
      else if (al===bl) result.push({ type:"same", text:al });
      else { result.push({ type:"remove", text:al }); result.push({ type:"add", text:bl }); }
    }
    return result;
  }, [a, b]);
  const added = diff.filter(d=>d.type==="add").length;
  const removed = diff.filter(d=>d.type==="remove").length;
  const same = diff.filter(d=>d.type==="same").length;
  return (
    <VStack>
      <Grid2>
        <div><Label>Original Text (A)</Label><Textarea value={a} onChange={setA} placeholder="Original text..." rows={8} mono /></div>
        <div><Label>Modified Text (B)</Label><Textarea value={b} onChange={setB} placeholder="Modified text..." rows={8} mono /></div>
      </Grid2>
      <div style={{ display:"flex", gap:10 }}>
        <Badge color="green">+{added} added</Badge>
        <Badge color="amber">-{removed} removed</Badge>
        <Badge>{same} same</Badge>
      </div>
      {(a||b) && (
        <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
          {diff.map((d,i)=>(
            <div key={i} style={{ padding:"3px 14px", fontFamily:"'JetBrains Mono',monospace", fontSize:12, lineHeight:1.7, background:d.type==="add"?"rgba(16,185,129,0.1)":d.type==="remove"?"rgba(239,68,68,0.1)":"transparent", color:d.type==="add"?C.success:d.type==="remove"?C.danger:C.muted, borderLeft:`3px solid ${d.type==="add"?C.success:d.type==="remove"?C.danger:"transparent"}` }}>
              {d.type==="add"?"+ ":d.type==="remove"?"- ":"  "}{d.text}
            </div>
          ))}
        </div>
      )}
    </VStack>
  );
}

function NumberToWords() {
  const [num, setNum] = useState("");
  const [system, setSystem] = useState("intl");
  const toIndian = n => {
    if (n===0) return "zero";
    const ones = ["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
    const tens_ = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
    const h = n => n===0?"":(n<20?ones[n]+" ":(tens_[Math.floor(n/10)]+(n%10?" "+ones[n%10]:"")+" "));
    const crore=Math.floor(n/10000000), lakh=Math.floor((n%10000000)/100000), thousand=Math.floor((n%100000)/1000), rest=n%1000;
    let r="";
    if(crore) r+=h(crore)+"crore ";
    if(lakh) r+=h(lakh)+"lakh ";
    if(thousand) r+=h(thousand)+"thousand ";
    if(rest) r+=h(rest);
    return r.trim();
  };
  const n = parseFloat(num);
  const result = !isNaN(n) && num!=="" ? (system==="intl"?numToWords(Math.floor(n)):toIndian(Math.floor(Math.abs(n)))) : "";
  return (
    <VStack>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
        <div style={{ flex:1 }}><Label>Enter Number</Label><Input value={num} onChange={setNum} placeholder="e.g. 42000 or 3.14" /></div>
        <div><Label>System</Label><SelectInput value={system} onChange={setSystem} options={[{value:"intl",label:"International (Billion/Trillion)"},{value:"in",label:"Indian (Lakh/Crore)"}]} /></div>
      </div>
      {result && (
        <div>
          <Label>In Words</Label>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ flex:1, background:"rgba(59,130,246,0.08)", border:`1px solid rgba(59,130,246,0.2)`, borderRadius:8, padding:"16px 20px", fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:600, color:C.text, textTransform:"capitalize" }}>{result}</div>
            <CopyBtn text={result} />
          </div>
        </div>
      )}
    </VStack>
  );
}

function WordsToNumber() {
  const [words, setWords] = useState("");
  const [result, setResult] = useState(null);
  const parse = t => {
    const map = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100,thousand:1000,million:1000000,billion:1000000000,trillion:1000000000000,lakh:100000,crore:10000000};
    const tokens = t.toLowerCase().replace(/[^a-z\s]/g,"").trim().split(/[\s-]+/);
    let current=0, result=0;
    for (const tok of tokens) {
      const v = map[tok];
      if (v===undefined) continue;
      if (v===100) current*=100;
      else if (v>=1000) { result+=((current||1)*v); current=0; }
      else current+=v;
    }
    return result+current;
  };
  const run = () => {
    const n = parse(words);
    setResult(isNaN(n)||n===0&&words.trim().toLowerCase()!=="zero" ? null : n);
  };
  return (
    <VStack>
      <Textarea value={words} onChange={setWords} placeholder="e.g. forty-two thousand five hundred and twelve..." rows={3} />
      <Btn onClick={run} disabled={!words.trim()} style={{ alignSelf:"flex-start" }}>Convert to Number</Btn>
      {result !== null && (
        <div className="fade-in">
          <Label>Result</Label>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ flex:1, background:"rgba(16,185,129,0.08)", border:`1px solid rgba(16,185,129,0.2)`, borderRadius:8, padding:"16px 20px", fontFamily:"'JetBrains Mono',monospace", fontSize:24, fontWeight:700, color:C.success }}>{result.toLocaleString()}</div>
            <CopyBtn text={String(result)} />
          </div>
        </div>
      )}
    </VStack>
  );
}

// �"����� TOOL COMPONENT MAP �������������������������������������������������������������������������������������������������������������"�
const TOOL_COMPONENTS = {
  "word-counter-pro": WordCounterPro,
  "character-counter": CharacterCounter,
  "reading-time": ReadingTime,
  "word-frequency": WordFrequency,
  "text-statistics": TextStatistics,
  "unique-words": UniqueWords,
  "palindrome-checker": PalindromeChecker,
  "anagram-checker": AnagramChecker,
  "text-reverser": TextReverser,
  "text-sorter": TextSorter,
  "remove-duplicates": RemoveDuplicates,
  "remove-empty-lines": RemoveEmptyLines,
  "remove-extra-spaces": RemoveExtraSpaces,
  "trim-lines": TrimLines,
  "text-repeater": TextRepeater,
  "find-replace": FindReplace,
  "rot13": Rot13,
  "pig-latin": PigLatin,
  "text-randomizer": TextRandomizer,
  "punctuation-remover": PunctuationRemover,
  "url-slug": UrlSlug,
  "add-line-numbers": AddLineNumbers,
  "remove-line-numbers": RemoveLineNumbers,
  "text-wrapper": TextWrapper,
  "text-unwrapper": TextUnwrapper,
  "text-truncator": TextTruncator,
  "text-padder": TextPadder,
  "tab-to-spaces": TabToSpaces,
  "spaces-to-tab": SpacesToTab,
  "text-joiner": TextJoiner,
  "text-splitter": TextSplitter,
  "text-to-bullets": TextToBullets,
  "bullets-to-text": BulletsToText,
  "text-to-numbered": TextToNumbered,
  "numbered-to-text": NumberedToText,
  "number-extractor": NumberExtractor,
  "email-extractor": EmailExtractor,
  "url-extractor": UrlExtractor,
  "hashtag-extractor": HashtagExtractor,
  "sentence-splitter": SentenceSplitter,
  "text-to-morse": TextToMorse,
  "morse-to-text": MorseToText,
  "text-diff": TextDiff,
  "number-to-words": NumberToWords,
  "words-to-number": WordsToNumber,
};

// �"����� BREADCRUMB �����������������������������������������������������������������������������������������������������������������������������"�
function Breadcrumb({ tool }) {
  const cat = CATEGORIES.find(c => c.id === tool.cat);
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
          { "@type": "ListItem", "position": 2, "name": "Text Tools", "item": "https://toolsrift.com/text" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

// �"����� FAQ SECTION ���������������������������������������������������������������������������������������������������������������������������"�
function FaqSection({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <section style={{ marginTop:32 }}>
      <h2 style={{ ...T.h2, marginBottom:14 }}>Frequently Asked Questions</h2>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {faqs.map(([q,a],i)=>(
          <details key={i} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden" }}>
            <summary style={{ padding:"12px 16px", cursor:"pointer", fontSize:13, fontWeight:600, color:C.text, listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
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
  if (!current) return null;
  const related = TOOLS.filter(t=>t.id!==currentId && t.cat===current.cat).slice(0,4);
  if (!related.length) return null;
  return (
    <section style={{ marginTop:32 }}>
      <h2 style={{ ...T.h2, marginBottom:14 }}>Related Text Tools</h2>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
        {related.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(255,255,255,0.02)", border:`1px solid ${C.border}`, borderRadius:8, textDecoration:"none", transition:"border-color .15s" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(59,130,246,0.4)"} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
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
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} - Free Text Tool | ToolsRift`;
  }, [toolId]);
  if (!tool || !ToolComp) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Tool not found</div>
      <a href="#/" style={{ color:C.blue }}>— Back to home</a>
    </div>
  );
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 60px" }}>
      <Breadcrumb tool={tool} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
        <div>
          <h1 style={{ ...T.h1, marginBottom:6, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28 }}>{tool.icon}</span> {tool.name}
          </h1>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, maxWidth:600 }}>{meta?.desc || tool.desc}</p>
        </div>
        <Badge>Free</Badge>
      </div>
      <Card className="fade-in">
        <ToolComp />
      </Card>
      {meta?.howTo && (
        <section style={{ marginTop:28, padding:20, background:"rgba(59,130,246,0.05)", border:`1px solid rgba(59,130,246,0.12)`, borderRadius:12 }}>
          <h2 style={{ ...T.h2, marginBottom:10 }}>How to Use {tool.name}</h2>
          <p style={{ fontSize:13, color:C.muted, lineHeight:1.8 }}>{meta.howTo}</p>
        </section>
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
  useEffect(() => {
    document.title = `${cat?.name} —" Free Text Tools | ToolsRift`;
  }, [catId]);
  if (!cat) return <div style={{ padding:40, textAlign:"center", color:C.muted }}>Category not found. <a href="#/" style={{ color:C.blue }}>— Home</a></div>;
  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 60px" }}>
      <nav style={{ fontSize:12, color:C.muted, marginBottom:20 }}>
        <a href="#/" style={{ color:C.muted, textDecoration:"none" }}>—— ToolsRift</a> › <span style={{ color:C.text }}>{cat.name}</span>
      </nav>
      <h1 style={{ ...T.h1, marginBottom:6 }}>{cat.icon} {cat.name}</h1>
      <p style={{ fontSize:14, color:C.muted, marginBottom:28 }}>{cat.desc} —" {tools.length} free tools</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {tools.map(t=>(
          <a key={t.id} href={`#/tool/${t.id}`} style={{ display:"flex", gap:12, padding:"14px 16px", background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, textDecoration:"none", alignItems:"flex-start", transition:"border-color .15s, transform .1s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(59,130,246,0.4)";e.currentTarget.style.transform="translateY(-1px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform=""}}>
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

const PAGE_THEME = getCategoryById('text');

// ── Category home: powered by shared CategoryDashboard ─────────────────────
function CategoryHomePage() {
  useEffect(() => {
    document.title = 'Free Text Tools Online — ToolsRift';
  }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search text tools..."
      />
    </CategoryLayout>
  );
}

// �"��� Tool detail: sidebar nav + ToolPageLayout wrapper �����������������������������������������������"�
function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const meta     = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} —" Free Text Tool | ToolsRift`;
    setDrawerOpen(false);
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>— Back to Text Tools</a>
      </div>
    </CategoryLayout>
  );

  const sidebarTools = TOOLS.filter(t => t.cat === tool.cat);
  const toolData = {
    name:        tool.name,
    description: meta?.desc || tool.desc,
    howTo:       meta?.howTo,
    faq:         meta?.faq,
  };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <style>{`
        .trt-detail{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:16px 0 60px}
        @media(max-width:768px){.trt-detail{grid-template-columns:1fr;padding:16px 0 96px}}
        .trt-sidebar{display:block}
        @media(max-width:768px){.trt-sidebar{display:none}}
        .trt-mobile-bar{display:none}
        @media(max-width:768px){.trt-mobile-bar{display:flex}}
      `}</style>

      <div className="trt-detail">
        {/* Desktop sidebar */}
        <aside className="trt-sidebar">
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
                  <a
                    key={t.id}
                    href={`#/tool/${t.id}`}
                    style={{
                      display:'flex', alignItems:'center', gap:10, minHeight:44,
                      padding:'10px 16px', textDecoration:'none',
                      background: isActive ? `${acc}18` : 'transparent',
                      borderLeft: isActive ? `2px solid ${acc}` : '2px solid transparent',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
                  >
                    <span style={{ fontSize:15, flexShrink:0 }}>{t.icon}</span>
                    <span style={{ fontSize:13, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', lineHeight:1.3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      {t.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ minWidth:0 }}>
          <a href="#/"
            style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.color='#64748B'}
          >
            — Back to Text Tools
          </a>
          <ToolPageLayout theme={PAGE_THEME} tool={toolData}>
            <ToolComp />
          </ToolPageLayout>
        </div>
      </div>

      {/* Mobile: floating bottom bar */}
      <div className="trt-mobile-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,9,15,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>
          {tool.icon} {tool.name}
        </span>
        <button
          onClick={() => setDrawerOpen(d => !d)}
          style={{ background:acc, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:44, flexShrink:0 }}
        >
          {drawerOpen ? '✕ Close' : '—"— All Tools'}
        </button>
      </div>

      {/* Mobile drawer */}
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

// �"��� Main app �����������������������������������������������������������������������������������������������������������������������������������"�
function ToolsRiftText() {
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

export default ToolsRiftText;
