import { useState, useEffect, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout from './shared/ToolPageLayout';

const THEME = getCategoryById("random");
const PAGE_THEME = getCategoryById("random");
const BRAND = { name: "ToolsRift", tagline: "Randomizers & Games" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  accent: "#F43F5E", accentD: "#E11D48",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(244,63,94,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} @keyframes trShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-6px,4px) rotate(-4deg)}40%{transform:translate(6px,-4px) rotate(4deg)}60%{transform:translate(-5px,-3px) rotate(-3deg)}80%{transform:translate(5px,3px) rotate(3deg)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ children, color = "rose" }) {
  const map = { rose:"rgba(244,63,94,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
  const textMap = { rose:"#FDA4AF", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
  return (
    <span style={{ background:map[color]||map.rose, color:textMap[color]||textMap.rose, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.accent; const ACCENTD = C.accentD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(244,63,94,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function SelectInput({ value, onChange, options, style={} }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"9px 14px", color:C.text, fontSize:13, fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", cursor:"pointer", ...style }}>
      {options.map((o) => Array.isArray(o) ? { value: o[0], label: o[1] } : (typeof o === "string" ? { value: o, label: o } : o)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
    <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, minHeight:40, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
      {children}
    </div>
  );
}

function BigResult({ value, label }) {
  return (
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(244,63,94,0.08)", border:`1px solid rgba(244,63,94,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.accent }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.accent }}>{value}</div>
      <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{label}</div>
    </div>
  );
}

function DataTable({ columns=[], rows=[] }) {
  return (
    <div style={{ overflowX:"auto", border:`1px solid ${C.border}`, borderRadius:10 }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} style={{ textAlign:"left", padding:"10px 14px", color:C.muted, fontWeight:600, borderBottom:`1px solid ${C.border}`, background:"rgba(255,255,255,0.02)" }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                <td key={ci} style={{ padding:"10px 14px", color:C.text, borderBottom:ri < rows.length-1 ? `1px solid ${C.border}` : "none" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/random` }] : []),
          ...(tool ? [{ "@type": "ListItem", "position": 3, "name": tool.name || tool.id || "" }] : [])
        ]
      }) }} />
    </>
  );
}

const bigBtn = (bg) => ({ padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora',sans-serif", color: "#fff", background: bg });

// Cryptographically-strong uniform random integer in [0, max).
const secureRandom = (max) => {
  if (max <= 0) return 0;
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
};
// Fisher–Yates shuffle using secure randomness.
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandom(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

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

// ── Tool registry ────────────────────────────────────────────────────────────
const TOOLS = [
  { id:"spinner-wheel", cat:"pickers", name:"Spinner Wheel", desc:"Add names and spin an animated wheel of names to pick a random winner — great for giveaways and classrooms", icon:"🎡", free:true },
  { id:"random-team-generator", cat:"pickers", name:"Random Team Generator", desc:"Paste a list of people and split them into balanced random teams instantly", icon:"👥", free:true },
  { id:"random-picker", cat:"pickers", name:"Random Picker", desc:"Paste any list of options and let the picker choose one at random for you", icon:"🎯", free:true },
  { id:"random-number-generator", cat:"randomizers", name:"Random Number Generator", desc:"Generate random numbers in any range with unique and sorted options", icon:"🔢", free:true },
  { id:"random-letter-generator", cat:"randomizers", name:"Random Letter Generator", desc:"Generate random letters with uppercase, lowercase, vowel and consonant filters", icon:"🔠", free:true },
  { id:"dice-roller-3d", cat:"randomizers", name:"RPG Dice Roller", desc:"Roll multiple D4, D6, D8, D10, D12 or D20 dice at once and see the total — perfect for D&D", icon:"🎲", free:true },
  { id:"coin-flip-batch", cat:"randomizers", name:"Batch Coin Flip", desc:"Flip many coins at once and see the heads and tails counts plus the full sequence", icon:"🪙", free:true },
  { id:"bingo-card-generator", cat:"randomizers", name:"Bingo Card Generator", desc:"Generate a printable random 5x5 B-I-N-G-O card with a free center square", icon:"🔳", free:true },
  { id:"magic-8-ball", cat:"decisions", name:"Magic 8 Ball", desc:"Ask a yes or no question and shake the magic 8 ball for a classic random answer", icon:"🎱", free:true },
  { id:"yes-no-generator", cat:"decisions", name:"Yes or No Generator", desc:"Get a random Yes, No or Maybe with a coin-flip style reveal to settle any decision", icon:"✅", free:true },

  // ── randomizers (added) ────────────────────────────────────────────────────
  { id:"random-color-picker", cat:"randomizers", name:"Random Color Generator", desc:"Generate random colors with a live swatch plus HEX, RGB and HSL values you can copy in one click", icon:"🎨", free:true },
  { id:"random-date-generator", cat:"randomizers", name:"Random Date Generator", desc:"Pick random dates between any two dates, with the weekday shown and unique or sorted output", icon:"📅", free:true },
  { id:"random-time-generator", cat:"randomizers", name:"Random Time Generator", desc:"Generate random times of day in 12 or 24 hour format, optionally snapped to 5, 15 or 30 minute slots", icon:"⏰", free:true },
  { id:"lottery-number-generator", cat:"randomizers", name:"Lottery Number Generator", desc:"Generate random lottery numbers with pick-N-from-M settings and one-click presets for popular draws", icon:"🎟️", free:true },
  { id:"random-password-phrase", cat:"randomizers", name:"Random Passphrase Generator", desc:"Create memorable random passphrases from a built-in word list, with separator, digit and capital options", icon:"🔑", free:true },
  { id:"random-emoji-generator", cat:"randomizers", name:"Random Emoji Generator", desc:"Draw random emoji from faces, animals, food, activities, travel and objects — pick how many you want", icon:"😀", free:true },
  { id:"random-binary-generator", cat:"randomizers", name:"Random Binary Generator", desc:"Generate random binary, hexadecimal, octal or decimal strings of any length for tests and demos", icon:"⚙️", free:true },
  { id:"random-ip-generator", cat:"randomizers", name:"Random IP Address Generator", desc:"Generate random IPv4 or IPv6 addresses from safe documentation and private ranges for testing and demos", icon:"🌐", free:true },
  { id:"random-seed-generator", cat:"randomizers", name:"Seeded Random Generator", desc:"Reproducible random numbers from a seed — the same seed always returns the same sequence for fair draws", icon:"🌱", free:true },
  { id:"random-group-assigner", cat:"randomizers", name:"Random Group Assigner", desc:"Assign a list of people or items to named groups at random, with balanced sizes and a copyable roster", icon:"🗂️", free:true },

  // ── lists ──────────────────────────────────────────────────────────────────
  { id:"list-shuffler", cat:"lists", name:"List Shuffler", desc:"Paste any list and shuffle it into a fair random order, with optional numbering and duplicate removal", icon:"🔀", free:true },
  { id:"list-randomizer-weighted", cat:"lists", name:"Weighted Random Picker", desc:"Pick a random entry where each option carries a weight — write Name, 3 per line to make it more likely", icon:"⚖️", free:true },
  { id:"random-line-picker", cat:"lists", name:"Random Line Picker", desc:"Pick any number of random lines from pasted text, with or without repeats, and copy the selection", icon:"📃", free:true },
  { id:"random-word-generator", cat:"lists", name:"Random Word Generator", desc:"Draw random English words from a built-in list of 300+ nouns, verbs and adjectives for games and prompts", icon:"📖", free:true },
  { id:"random-letter-sequence", cat:"lists", name:"Random Letter Sequence", desc:"Generate random letter sequences and consonant-vowel patterns for word games, drills and nonsense names", icon:"🔡", free:true },
  { id:"random-sentence-generator", cat:"lists", name:"Random Sentence Generator", desc:"Build grammatically sensible random sentences from built-in word banks — great for writing warm-ups", icon:"✍️", free:true },
  { id:"random-question-generator", cat:"lists", name:"Random Question Generator", desc:"Draw random icebreaker and conversation questions from a bank of 80+ prompts for teams and parties", icon:"❓", free:true },
  { id:"would-you-rather-generator", cat:"lists", name:"Would You Rather Generator", desc:"Random Would You Rather dilemmas from a built-in bank of 60+ family-friendly this-or-that questions", icon:"🤔", free:true },
  { id:"random-charades-generator", cat:"lists", name:"Random Charades Generator", desc:"Draw random charades prompts across movies, animals, actions and jobs with an easy, medium or hard difficulty setting", icon:"🎭", free:true },
  { id:"random-trivia-generator", cat:"lists", name:"Random Trivia Generator", desc:"Random trivia questions from a bank of 60+ real facts, with the answer hidden until you press reveal", icon:"🧠", free:true },

  // ── fun ────────────────────────────────────────────────────────────────────
  { id:"random-animal-generator", cat:"fun", name:"Random Animal Generator", desc:"Draw a random animal from 120+ mammals, birds, reptiles, sea life and insects, each with its emoji", icon:"🦊", free:true },
  { id:"random-food-generator", cat:"fun", name:"Random Food Generator", desc:"Cannot decide what to eat? Draw a random dish from 150+ meals across world cuisines with a cuisine tag", icon:"🍜", free:true },
  { id:"random-movie-genre-generator", cat:"fun", name:"Random Movie Genre Generator", desc:"Get a random movie genre, decade and mood combo to decide what to watch or spark a story idea", icon:"🎬", free:true },
  { id:"random-country-picker", cat:"fun", name:"Random Country Picker", desc:"Pick a random country from 190+ nations with its flag, capital city and continent for quizzes and travel", icon:"🌍", free:true },
  { id:"random-name-generator-fun", cat:"fun", name:"Random Name Generator", desc:"Generate random first and last name combos from built-in name banks for characters, testing and games", icon:"🧑", free:true },
  { id:"random-username-generator", cat:"fun", name:"Random Username Generator", desc:"Create catchy adjective-noun-number usernames and gamertags in several styles, generated in your browser", icon:"🏷️", free:true },
  { id:"random-hobby-generator", cat:"fun", name:"Random Hobby Generator", desc:"Find something new to try — a random hobby from 120+ ideas, each tagged creative, active, mindful or geeky", icon:"🎯", free:true },
  { id:"random-color-palette", cat:"fun", name:"Random Color Palette Generator", desc:"Generate a 5-colour harmonious palette with HEX codes, chosen scheme and copy-all for your next design", icon:"🖌️", free:true },
  { id:"tournament-bracket-generator", cat:"fun", name:"Tournament Bracket Generator", desc:"Seed players into a random single-elimination bracket with byes, rendered round by round to the final", icon:"🏆", free:true },
  { id:"random-tarot-card", cat:"fun", name:"Random Tarot Card Generator", desc:"Draw a random Major Arcana tarot card upright or reversed with its keywords — for entertainment only", icon:"🔮", free:true },
];

const CATEGORIES = [
  { id:"pickers", name:"Name Pickers & Wheels", icon:"🎡", desc:"Spinner wheel, random picker and team generator." },
  { id:"randomizers", name:"Random Generators", icon:"🎲", desc:"Numbers, letters, dates, colors, dice, coins and bingo cards." },
  { id:"lists", name:"List & Text Randomizers", icon:"🔀", desc:"Shuffle lists, pick lines and draw random words, questions and trivia." },
  { id:"fun", name:"Fun Random Generators", icon:"🎉", desc:"Animals, food, countries, usernames, palettes and party generators." },
  { id:"decisions", name:"Decision Makers", icon:"🎱", desc:"Magic 8 ball and yes-or-no answers." },
];

const TOOL_META = {
  "spinner-wheel": {
    title: "Spinner Wheel — Wheel of Names Random Picker | ToolsRift",
    desc: "Free spinner wheel and wheel of names. Add names, spin the animated wheel and pick a random winner for giveaways, raffles, classrooms and team decisions.",
    keywords: "spinner wheel, wheel of names, random name wheel, spin the wheel, random winner picker, giveaway wheel",
    faq: [
      ["How does the spinner wheel pick a winner?", "When you spin, the wheel accelerates and then eases to a stop at a random position chosen with your browser's cryptographically-secure random generator, so every name has an exactly equal chance of landing at the pointer."],
      ["How many names can I add?", "Add as many names as you like — one per line. The wheel automatically resizes each colored segment to fit, so it works with just two names or dozens."],
      ["Can I remove a winner and spin again?", "Yes. After a spin you can delete the winning name from the list and spin again for multiple rounds, which is ideal for draws with several prizes."],
    ],
    howTo: "Type one name per line in the box, then press Spin. The wheel spins with realistic easing and the pointer at the top marks the winner when it stops. Edit the list and spin again as many times as you need.",
  },
  "random-team-generator": {
    title: "Random Team Generator — Split People Into Teams | ToolsRift",
    desc: "Free random team generator. Paste a list of names, choose how many teams you want and instantly split everyone into balanced, fair random teams. No signup.",
    keywords: "random team generator, team picker, group generator, split into teams, random group maker",
    faq: [
      ["How are the teams balanced?", "The tool shuffles everyone randomly, then deals them out one at a time across the teams, so team sizes differ by at most one person even when the total does not divide evenly."],
      ["Is the assignment truly random?", "Yes. Names are shuffled with a Fisher–Yates shuffle driven by your browser's secure random generator, so every arrangement of people into teams is equally likely."],
      ["Can I generate the teams again?", "Yes — press Generate again for a completely new random split. Each run is independent, so re-rolling until you are happy is fine."],
    ],
    howTo: "Paste one name per line, set the number of teams, and press Generate Teams. Everyone is shuffled and dealt into balanced teams you can copy or re-roll.",
  },
  "random-picker": {
    title: "Random Picker — Pick One Option From a List | ToolsRift",
    desc: "Free random picker and decision maker. Paste any list of options — restaurants, movies, chores, names — and let the picker choose one at random for you.",
    keywords: "random picker, random choice generator, decision maker, pick one at random, this or that picker",
    faq: [
      ["What can I use the random picker for?", "Anything with a shortlist: what to eat, which movie to watch, who goes first, which task to do next, or picking a winner from entries. Paste the options and let chance decide."],
      ["Is every option equally likely?", "Yes. The pick uses your browser's secure random generator, so each line in your list has exactly the same chance of being chosen, no matter its position."],
      ["Does it need the internet?", "No. The random picker runs entirely in your browser, so it keeps working offline once the page has loaded and never uploads your list anywhere."],
    ],
    howTo: "Enter your options, one per line, and press Pick. A short shuffle animation lands on one random choice, which you can copy or pick again.",
  },
  "random-number-generator": {
    title: "Random Number Generator — Custom Range & Unique | ToolsRift",
    desc: "Free random number generator. Pick a minimum, maximum and how many numbers you want, with options for unique-only and sorted output. Fast and secure.",
    keywords: "random number generator, RNG, random integer generator, unique random numbers, number picker",
    faq: [
      ["Can I generate unique numbers with no repeats?", "Yes. Turn on the Unique option and every number in the result will be different — useful for lottery numbers, raffles and sampling without replacement."],
      ["How random are the numbers?", "Numbers come from your browser's cryptographically-secure random generator (crypto.getRandomValues), which is far higher quality than a basic pseudo-random function and is unbiased across your chosen range."],
      ["What if I ask for more unique numbers than the range allows?", "The tool caps the count to the size of the range so it cannot loop forever — for example you can get at most 10 unique numbers between 1 and 10."],
    ],
    howTo: "Set the minimum, maximum and how many numbers to generate, toggle Unique or Sorted if you want, then press Generate. Copy the results with one click.",
  },
  "random-letter-generator": {
    title: "Random Letter Generator — A-Z With Filters | ToolsRift",
    desc: "Free random letter generator. Produce one or many random letters with uppercase, lowercase, vowels-only or consonants-only filters. Great for games and prompts.",
    keywords: "random letter generator, random alphabet picker, random vowel generator, random consonant, letter randomizer",
    faq: [
      ["Can I get only vowels or only consonants?", "Yes. Choose the Vowels only or Consonants only filter and every letter generated will come from just that set — handy for word games and teaching."],
      ["Can I generate more than one letter?", "Yes. Set the count to produce a string of random letters, useful for game prompts, placeholder initials, or drawing a random starting letter for each round."],
      ["Is the letter choice fair?", "Yes. Each allowed letter has an equal chance because the tool uses your browser's secure random generator over the filtered alphabet."],
    ],
    howTo: "Choose a case (uppercase or lowercase), an optional vowels/consonants filter and how many letters you want, then press Generate to get your random letters.",
  },
  "dice-roller-3d": {
    title: "RPG Dice Roller — Roll D4 D6 D8 D10 D12 D20 | ToolsRift",
    desc: "Free RPG dice roller for Dungeons & Dragons and board games. Roll several D4, D6, D8, D10, D12 or D20 dice at once, add a modifier and see the total.",
    keywords: "dice roller, d20 roller, dnd dice, rpg dice roller, roll multiple dice, tabletop dice",
    faq: [
      ["Which dice can I roll?", "All the standard polyhedral dice used in tabletop RPGs: D4, D6, D8, D10, D12 and D20. Choose how many of the selected die to roll at once, up to twenty."],
      ["Can I add a modifier like +3?", "Yes. Enter a positive or negative modifier and it is added to the sum of the dice, so a roll like 2d6+3 is shown as the individual dice plus the final total."],
      ["Are the rolls fair?", "Yes. Each die uses your browser's secure random generator, giving every face an equal, unbiased probability just like a real physical die."],
    ],
    howTo: "Pick the die type, the number of dice and an optional modifier, then press Roll. Each die shows its value and the tool adds them up with your modifier for the total.",
  },
  "coin-flip-batch": {
    title: "Batch Coin Flip — Flip Many Coins At Once | ToolsRift",
    desc: "Free batch coin flip tool. Flip any number of coins at once and see the heads and tails counts, the percentage split and the full flip sequence. No signup.",
    keywords: "coin flip, flip multiple coins, batch coin toss, heads or tails counter, coin flip simulator",
    faq: [
      ["How many coins can I flip at once?", "Flip anywhere from a single coin up to a thousand at a time — perfect for probability demonstrations and seeing how results approach a 50/50 split as the count grows."],
      ["Is each flip a fair 50/50?", "Yes. Every coin is flipped independently using your browser's secure random generator, so heads and tails each have exactly a 50% chance on every flip."],
      ["Can I see the full sequence?", "Yes. Along with the heads and tails totals and percentages, the tool lists the complete sequence of H and T results so you can inspect the run."],
    ],
    howTo: "Enter how many coins to flip and press Flip. The tool shows the heads and tails counts, the percentage split and the full H/T sequence, which you can copy.",
  },
  "bingo-card-generator": {
    title: "Bingo Card Generator — Free Printable 5x5 Card | ToolsRift",
    desc: "Free bingo card generator. Create a random printable 5x5 B-I-N-G-O card with the classic number ranges per column and a free center square. Generate unlimited cards.",
    keywords: "bingo card generator, printable bingo card, random bingo card, 5x5 bingo, bingo maker",
    faq: [
      ["What number ranges does each column use?", "The classic 1–75 layout: B holds 1–15, I holds 16–30, N holds 31–45, G holds 46–60 and O holds 61–75, with no repeated numbers within a column."],
      ["Is the center square free?", "Yes. Following the standard rules the middle square of the N column is a FREE space, so it is already marked on every card the generator makes."],
      ["Can I make many different cards?", "Yes. Press Generate as many times as you like for a fresh random card each time, then print the page to hand physical cards out to players."],
    ],
    howTo: "Press Generate to create a random 5x5 bingo card with valid numbers in each B-I-N-G-O column and a free center. Generate again for a new card and print it out.",
  },
  "magic-8-ball": {
    title: "Magic 8 Ball — Free Online Yes/No Answers | ToolsRift",
    desc: "Free online Magic 8 Ball. Ask a yes-or-no question, shake the ball and receive one of the twenty classic random answers. Fun for decisions, parties and games.",
    keywords: "magic 8 ball, magic eight ball, online 8 ball, yes no answer, ask the 8 ball",
    faq: [
      ["What answers can the Magic 8 Ball give?", "It uses the twenty traditional replies — ten positive like 'It is certain', five non-committal like 'Ask again later', and five negative like 'My reply is no' — chosen at random each shake."],
      ["How does it choose an answer?", "Each shake picks one of the twenty answers at random using your browser's secure random generator, so the reply is unpredictable and every answer is equally likely."],
      ["Is this just for fun?", "Yes. The Magic 8 Ball is a novelty toy for entertainment and light-hearted decisions — it does not predict the future, so use it for fun rather than important choices."],
    ],
    howTo: "Type your yes-or-no question, press Shake, and the magic 8 ball reveals one of the twenty classic answers after a short shake animation.",
  },
  "yes-no-generator": {
    title: "Yes or No Generator — Random Decision Maker | ToolsRift",
    desc: "Free Yes or No generator. Get a random Yes, No or optional Maybe with a quick coin-flip style reveal to settle any decision instantly. No signup, runs in-browser.",
    keywords: "yes or no generator, random yes no, decision maker, yes no wheel, should i decision tool",
    faq: [
      ["Can I include a Maybe answer?", "Yes. Turn on the Maybe option and the generator chooses randomly between Yes, No and Maybe. Leave it off for a straight, even Yes-or-No result."],
      ["Are the answers evenly weighted?", "Yes. With two options each has a 50% chance, and with Maybe enabled each of the three has an equal one-in-three chance, all drawn from your browser's secure random generator."],
      ["What is it useful for?", "Settling small decisions quickly, breaking a tie, deciding who goes first, or adding a bit of chance to a game — anywhere you just need an impartial answer."],
    ],
    howTo: "Optionally enable Maybe, then press the button for a random Yes, No or Maybe revealed with a short flip animation. Press again for a new answer any time.",
  },

  "random-color-picker": {
    title: "Random Color Generator — HEX, RGB & HSL Swatch | ToolsRift",
    desc: "Free random color generator. Press once for a random colour with a large live swatch and copyable HEX, RGB and HSL values. Choose bright, pastel or dark modes.",
    keywords: "random color generator, random hex color, random rgb, random colour picker, color randomizer",
    faq: [
      ["How is the random colour chosen?", "The tool picks a random hue from the full 360-degree colour wheel using your browser's secure random generator, then applies the saturation and lightness band you selected. That keeps every colour usable instead of producing muddy results."],
      ["What is the difference between the bright, pastel and dark modes?", "All three use a random hue, but pastel keeps saturation low and lightness high, bright uses strong saturation at mid lightness, and dark keeps lightness low. Any mode gives you the same HEX, RGB and HSL values."],
      ["Can I copy the colour into my design tool?", "Yes. Each format has its own copy button, so you can paste #F43F5E into Figma, rgb(244, 63, 94) into CSS, or the HSL value straight into a stylesheet variable."],
    ],
    howTo: "Choose a colour style — any, bright, pastel or dark — then press Generate. A large swatch appears with its HEX, RGB and HSL values, each with a copy button.",
  },
  "random-date-generator": {
    title: "Random Date Generator — Pick Dates Between Two Dates | ToolsRift",
    desc: "Free random date generator. Set a start and end date, choose how many dates you need and get random calendar dates with weekdays, unique-only and sorted options.",
    keywords: "random date generator, random date picker, date randomizer, random day generator, pick a random date",
    faq: [
      ["Are the start and end dates included?", "Yes. The range is inclusive at both ends, so a range of 1 January to 31 January can return either of those dates as well as every day in between."],
      ["Can I avoid repeated dates?", "Yes. Turn on Unique and every date returned is different. If you ask for more unique dates than there are days in the range, the count is trimmed to the number of available days."],
      ["Why does it show the weekday?", "Knowing whether a random date lands on a weekend matters for scheduling, sampling and planning, so each result shows its weekday next to the ISO date you can copy."],
    ],
    howTo: "Enter a start date and an end date, set how many dates you want, and press Generate. Each random date is shown with its weekday and can be copied as a list.",
  },
  "random-time-generator": {
    title: "Random Time Generator — Random Times of Day | ToolsRift",
    desc: "Free random time generator. Produce random times of day in 12 or 24 hour format, limit them to a window of hours and snap them to 5, 15 or 30 minute slots.",
    keywords: "random time generator, random clock time, random hour generator, time randomizer, random time slot",
    faq: [
      ["Can I limit the times to working hours?", "Yes. Set the earliest and latest hour, for example 9 to 17, and every generated time falls inside that window — useful for random check-ins, drills and sampling."],
      ["What does the interval option do?", "It snaps results to tidy slots. With a 15 minute interval you only ever get times like 10:15 or 10:30, which is far more practical for scheduling than 10:17."],
      ["Can I get 12-hour AM/PM times?", "Yes. Switch the format to 12-hour and each result is shown as 3:45 PM style, while 24-hour format returns 15:45. The copy button uses whichever format is on screen."],
    ],
    howTo: "Pick the hour window, the minute interval, the format and how many times you need, then press Generate to get your random times, ready to copy.",
  },
  "lottery-number-generator": {
    title: "Lottery Number Generator — Random Picks & Presets | ToolsRift",
    desc: "Free lottery number generator. Pick N unique numbers from a range with one-click presets for 6/49, 6/45, Powerball and EuroMillions style draws, plus a bonus ball.",
    keywords: "lottery number generator, random lottery numbers, quick pick generator, powerball number generator, lucky numbers",
    faq: [
      ["Are the numbers always unique?", "Yes. Main lottery numbers are drawn without replacement, exactly like balls from a machine, so the same number never appears twice in one line. The bonus ball is drawn from its own separate pool."],
      ["Does this improve my chance of winning?", "No. Every combination in a lottery is equally likely, so a generated line has the same odds as any other. The tool simply saves you the trouble of choosing and avoids common patterns people pick by hand."],
      ["Can I generate several lines at once?", "Yes. Set how many lines you want and each one is drawn independently, so you can print or copy a whole batch of quick picks in a single press."],
    ],
    howTo: "Choose a preset or set your own pick count, maximum number and bonus ball, decide how many lines you want, then press Generate to draw your numbers.",
  },
  "random-password-phrase": {
    title: "Random Passphrase Generator — Memorable Secure Phrases | ToolsRift",
    desc: "Free random passphrase generator. Build memorable four-word passphrases from a built-in word list with separator, capitalisation and number options. Runs in-browser.",
    keywords: "passphrase generator, random passphrase, diceware style password, memorable password generator, xkcd password",
    faq: [
      ["Why is a passphrase better than a short password?", "A phrase of four unrelated words is long, which is what actually resists guessing, yet it is far easier to remember than a scramble of symbols. Length beats complexity for real-world security."],
      ["Where do the words come from?", "From a built-in list of common, easy-to-spell English words bundled with the page. Nothing is fetched from a server, and each word is drawn with your browser's secure random generator."],
      ["Is my passphrase sent anywhere?", "No. The passphrase is created entirely inside your browser and never leaves your device. Reload the page and it is gone, so copy it into a password manager before you navigate away."],
    ],
    howTo: "Choose how many words you want, a separator, and whether to add capitals or a number, then press Generate. Copy the passphrase straight into your password manager.",
  },
  "random-emoji-generator": {
    title: "Random Emoji Generator — Draw Random Emojis Free | ToolsRift",
    desc: "Free random emoji generator. Draw one or many random emoji from faces, animals, food, activities, travel, objects and symbols, then copy them with a single click.",
    keywords: "random emoji generator, emoji randomizer, random emoji picker, emoji generator, random emoji copy paste",
    faq: [
      ["Which emoji can appear?", "The tool draws from a curated built-in set covering smileys, animals, food and drink, activities, travel, objects and symbols, so results always render correctly rather than showing empty boxes."],
      ["Can I limit it to one category?", "Yes. Pick a category such as animals or food and every emoji drawn comes from that group only, which is handy for themed games, prompts and social posts."],
      ["Can I get several emoji at once?", "Yes. Set the count and the tool returns that many emoji as one copyable string — useful for reaction rows, random prompts and emoji-guessing games."],
    ],
    howTo: "Choose a category and how many emoji you want, then press Generate. The emoji appear large on screen and the copy button puts them on your clipboard.",
  },
  "random-binary-generator": {
    title: "Random Binary Generator — Binary, Hex & Octal Strings | ToolsRift",
    desc: "Free random binary generator. Produce random binary, hexadecimal, octal or decimal digit strings of any length, with optional grouping into readable byte blocks.",
    keywords: "random binary generator, random bit string, random hex generator, random octal, binary randomizer",
    faq: [
      ["What is a random binary string useful for?", "Test fixtures, teaching binary and hex, generating sample bit patterns, mock identifiers and placeholder data for parsers — anywhere you need digits with no meaning attached."],
      ["Are these safe to use as cryptographic keys?", "The digits do come from your browser's secure random generator, but a real key should be produced by your crypto library with the right length and format. Treat these strings as test data rather than production secrets."],
      ["What does the grouping option do?", "It inserts a space every 4 or 8 characters, so a 32-bit binary string reads as four tidy bytes instead of one unbroken run. Grouping is only visual — the copy button can copy either form."],
    ],
    howTo: "Choose the base (binary, octal, hex or decimal), the length and optional grouping, then press Generate to get a random digit string you can copy.",
  },
  "random-ip-generator": {
    title: "Random IP Address Generator — IPv4 & IPv6 Test IPs | ToolsRift",
    desc: "Free random IP address generator. Create random IPv4 or IPv6 addresses from safe documentation and private ranges for testing, mock data, tutorials and screenshots.",
    keywords: "random ip generator, random ipv4 address, random ipv6 generator, fake ip address generator, test ip addresses",
    faq: [
      ["Are these real addresses on the internet?", "No, and that is deliberate. The generator uses the reserved documentation blocks (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 and 2001:db8::/32) and the private RFC 1918 ranges, so nothing you publish points at somebody's real server."],
      ["Which mode should I choose?", "Use documentation ranges for tutorials, blog posts and screenshots, private ranges when you need addresses that look like a LAN, and IPv6 when you are testing dual-stack code paths."],
      ["Can I generate a whole batch?", "Yes. Set the count to produce a list of addresses at once, then copy them straight into a fixture file, a test seed or a config sample."],
    ],
    howTo: "Choose IPv4 or IPv6 and a safe address range, set how many addresses you need, then press Generate and copy the list.",
  },
  "random-seed-generator": {
    title: "Seeded Random Generator — Reproducible Random Numbers | ToolsRift",
    desc: "Free seeded random number generator. Enter a seed and get a reproducible sequence — the same seed always gives the same numbers, so anyone can verify a fair draw.",
    keywords: "seeded random generator, reproducible random numbers, seed rng, deterministic random generator, prng seed",
    faq: [
      ["What does a seed actually do?", "The seed sets the starting state of the pseudo-random algorithm. From the same starting state the algorithm walks the same path every time, so the same seed reliably produces the same sequence of numbers."],
      ["Why would I want reproducible randomness?", "So a draw can be audited. Publish the seed before a giveaway, or note it in a simulation, and anyone can rerun the tool and confirm they get identical results — something a normal random generator cannot offer."],
      ["Is a seeded sequence as secure as a normal random draw?", "No. It uses the mulberry32 pseudo-random algorithm, which is fast and evenly distributed but predictable once the seed is known. Use it for fairness and reproducibility, never for passwords or keys."],
    ],
    howTo: "Type any seed word or number — or press the dice to get a random one — set the range and count, then press Generate. Share the seed so others can reproduce the exact draw.",
  },
  "random-group-assigner": {
    title: "Random Group Assigner — Assign People to Named Groups | ToolsRift",
    desc: "Free random group assigner. Paste names, add your own group labels and randomly assign everyone to balanced groups, then copy the finished roster in one click.",
    keywords: "random group assigner, group randomizer, assign people to groups, random group maker, classroom group generator",
    faq: [
      ["How is it different from the team generator?", "This tool lets you name the groups yourself — Red, Blue, Kitchen, Table 1 — and assigns people into those named buckets, which suits classrooms, events and rosters better than numbered teams."],
      ["Are the groups the same size?", "As close as possible. Everyone is shuffled then dealt round-robin into the groups, so sizes differ by at most one person when the total does not divide evenly."],
      ["Can I re-roll if I do not like the split?", "Yes. Press Assign again for a fresh independent shuffle. Nothing is stored, so every run is a completely new random assignment."],
    ],
    howTo: "Paste one person or item per line, enter your group names one per line, then press Assign Groups. Copy the roster or re-roll for a different split.",
  },

  "list-shuffler": {
    title: "List Shuffler — Randomize the Order of Any List | ToolsRift",
    desc: "Free online list shuffler. Paste any list and randomise the order fairly with a Fisher-Yates shuffle, with options to number the results and strip duplicate lines.",
    keywords: "list shuffler, randomize list, list randomizer, shuffle list online, random order generator",
    faq: [
      ["Is the shuffle genuinely fair?", "Yes. It uses a Fisher-Yates shuffle driven by your browser's secure random generator, which is the standard unbiased algorithm — every possible ordering of your list is equally likely."],
      ["Can I remove duplicate lines first?", "Yes. Turn on Remove duplicates and identical lines are collapsed to one before shuffling, so a name entered twice cannot take two slots in the result."],
      ["Is there a limit on list size?", "No practical limit. Thousands of lines shuffle instantly because everything runs locally in your browser and nothing is uploaded to a server."],
    ],
    howTo: "Paste your list with one item per line, choose whether to number the output or drop duplicates, then press Shuffle and copy the randomised list.",
  },
  "list-randomizer-weighted": {
    title: "Weighted Random Picker — Pick With Custom Odds | ToolsRift",
    desc: "Free weighted random picker. Give each option a weight using simple Name, 3 syntax and draw a winner where higher weights really are more likely. Shows exact odds.",
    keywords: "weighted random picker, weighted randomizer, random picker with odds, weighted choice generator, probability picker",
    faq: [
      ["How do I set the weights?", "Write one option per line as Name, weight — for example 'Alice, 3'. Alice then gets three entries against a line with weight 1. A line with no weight is treated as weight 1."],
      ["How is the winner drawn?", "All weights are added up, a secure random point is picked in that total, and the tool walks the list until it reaches that point. That gives each option a probability of exactly its weight divided by the total."],
      ["Can I see the real odds?", "Yes. The table shows every option with its weight and its exact percentage chance, so you can sanity-check the setup before you draw."],
    ],
    howTo: "Enter one option per line as Name, weight, check the odds table, then press Pick Winner to draw an entry with those probabilities.",
  },
  "random-line-picker": {
    title: "Random Line Picker — Pick Random Lines From Text | ToolsRift",
    desc: "Free random line picker. Paste any text and pull out one or many random lines, with or without repeats, keeping or dropping blanks. Perfect for sampling lists.",
    keywords: "random line picker, pick random lines, random line selector, sample lines from text, random row picker",
    faq: [
      ["What is the difference between with and without repeats?", "Without repeats each line can only be selected once, which is sampling without replacement. With repeats the same line can come up several times, which is what you want when simulating draws."],
      ["What happens to blank lines?", "By default blank lines are ignored so you never draw an empty result. Turn the option off if the blank lines are meaningful to your data."],
      ["Can I use it on CSV rows?", "Yes. Each line is treated as one item regardless of its contents, so pasting rows from a spreadsheet or CSV gives you a quick random sample of those rows."],
    ],
    howTo: "Paste your text, set how many lines to pick and whether repeats are allowed, then press Pick Lines and copy the selected lines.",
  },
  "random-word-generator": {
    title: "Random Word Generator — 300+ English Words Free | ToolsRift",
    desc: "Free random word generator with a built-in list of 300+ English nouns, verbs and adjectives. Filter by word type or length for games, prompts and brainstorming.",
    keywords: "random word generator, random english words, word randomizer, random noun generator, writing prompt words",
    faq: [
      ["Where do the words come from?", "From a curated list of over 300 common English nouns, verbs and adjectives bundled into the page. Because the list ships with the tool it works offline and never calls an external dictionary API."],
      ["Can I filter by word type or length?", "Yes. Choose nouns, verbs, adjectives or all types, and set a maximum word length. If a filter matches nothing the tool tells you instead of returning an empty box."],
      ["What are random words good for?", "Pictionary and charades, writing warm-ups, brainstorming and lateral-thinking exercises, vocabulary practice, and generating placeholder labels in mock-ups."],
    ],
    howTo: "Choose the word type, an optional maximum length and how many words you need, then press Generate. Copy the words or draw again for a fresh set.",
  },
  "random-letter-sequence": {
    title: "Random Letter Sequence Generator — CVC & Game Patterns | ToolsRift",
    desc: "Free random letter sequence generator. Create random letter runs or consonant-vowel patterns like CVC and CVCV for word games, phonics drills and nonsense names.",
    keywords: "random letter sequence, consonant vowel generator, cvc word generator, random letter pattern, nonsense word generator",
    faq: [
      ["What does the CV pattern mean?", "C stands for a consonant and V for a vowel. A CVC pattern produces pronounceable three-letter runs like 'tam', while CVCV gives you 'lomi' — far easier to say aloud than a purely random jumble."],
      ["What is this useful for?", "Phonics and reading practice, inventing fantasy or product names, generating call signs, and letter-based party games where players must think of a word starting with the sequence."],
      ["Can I still get pure random letters?", "Yes. Choose the Random letters mode and set a length, and every position is drawn from the whole alphabet with no consonant-vowel structure applied."],
    ],
    howTo: "Pick a mode — random letters or a CV pattern such as CVC — set the length or pattern and how many sequences you want, then press Generate.",
  },
  "random-sentence-generator": {
    title: "Random Sentence Generator — Sensible Random Sentences | ToolsRift",
    desc: "Free random sentence generator. Builds grammatically correct random sentences from built-in word banks — useful for writing prompts, typing practice and test copy.",
    keywords: "random sentence generator, sentence randomizer, random sentence maker, writing prompt generator, random text generator",
    faq: [
      ["How are the sentences built?", "Each sentence follows a real grammar template such as 'The [adjective] [noun] [verb] the [adjective] [noun]', with every slot filled at random from the matching built-in word bank. The result is always grammatical, even when the meaning is absurd."],
      ["Will the sentences make sense?", "They will be grammatically correct but often surreal, which is exactly what makes them good creative prompts. They are not intended as factual or publishable copy."],
      ["What can I use them for?", "Writing warm-ups and story prompts, typing and handwriting practice, testing text layout and line wrapping in a design, and generating placeholder copy that is more readable than lorem ipsum."],
    ],
    howTo: "Choose how many sentences you want and press Generate. Each sentence is assembled from a random grammar template and word bank, ready to copy.",
  },
  "random-question-generator": {
    title: "Random Question Generator — 80+ Icebreaker Questions | ToolsRift",
    desc: "Free random question generator with a built-in bank of 80+ icebreaker and conversation questions for teams, classrooms, dinner parties and first meetings.",
    keywords: "random question generator, icebreaker questions, conversation starter generator, random questions, team icebreaker tool",
    faq: [
      ["What kinds of questions are included?", "Light icebreakers, deeper get-to-know-you questions, fun hypotheticals and reflective prompts — over eighty in total, all safe to ask in a workplace or classroom setting."],
      ["Can I draw several questions at once?", "Yes. Set the count to pull a batch of different questions in one press, which is handy when you are planning a whole session rather than asking one at a time."],
      ["Are questions repeated?", "When you request several at once they are drawn without repeats, so you always get that many distinct questions from the bank."],
    ],
    howTo: "Choose a question style and how many you want, then press Generate to draw random questions from the built-in bank and copy them for your session.",
  },
  "would-you-rather-generator": {
    title: "Would You Rather Generator — 60+ Random Dilemmas | ToolsRift",
    desc: "Free Would You Rather generator with a built-in bank of 60+ family-friendly this-or-that dilemmas for road trips, parties, classrooms and team icebreakers.",
    keywords: "would you rather generator, would you rather questions, random dilemma generator, this or that game, party question generator",
    faq: [
      ["Are the questions suitable for kids?", "Yes. Every dilemma in the bank is family-friendly — silly superpowers, food swaps, travel choices and everyday trade-offs, with nothing rude, frightening or adult in tone."],
      ["How many questions are there?", "More than sixty hand-written dilemmas ship with the page, drawn at random each press, so a long session keeps producing fresh choices without repeating quickly."],
      ["Can I play with a group?", "Absolutely. Project or pass the screen around, press for a dilemma, and have everyone answer and explain why — the explanation is usually the fun part."],
    ],
    howTo: "Press the button to draw a random Would You Rather dilemma from the built-in bank. Copy it to share, or press again for the next one.",
  },
  "random-charades-generator": {
    title: "Random Charades Generator — 150+ Free Charades Ideas | ToolsRift",
    desc: "Free random charades generator with 150+ prompts across movies, animals, actions and jobs. Choose easy, medium or hard, and use the built-in countdown timer.",
    keywords: "random charades generator, charades ideas, charades word generator, charades game online, charades prompts for kids",
    faq: [
      ["How many charades prompts are included?", "More than 150 prompts ship with the page, split across four themes — movies and shows, animals, actions and jobs — and three difficulty levels, so a long game keeps producing fresh ideas."],
      ["What do the difficulty levels mean?", "Easy prompts are short, familiar and simple to mime, medium prompts need a little more setup, and hard prompts are abstract or multi-step and reward inventive acting. Pick the level that matches your players."],
      ["Is there a timer built in?", "Yes. Turn the countdown on and choose 30, 60 or 90 seconds. It starts when you draw a prompt, counts down on screen and tells you when the round is over — no phone stopwatch needed."],
    ],
    howTo: "Choose a theme and a difficulty, optionally switch the countdown timer on, then press Draw Next for a random charades prompt. Act it out and press again for the next player.",
  },
  "random-trivia-generator": {
    title: "Random Trivia Generator — 60+ Real Trivia Questions | ToolsRift",
    desc: "Free random trivia generator with a bank of 60+ real questions across science, history, geography, nature and culture. The answer stays hidden until you reveal it.",
    keywords: "random trivia generator, trivia questions and answers, random quiz question, trivia game generator, pub quiz questions",
    faq: [
      ["Are the answers accurate?", "Yes. Every question in the bank is a checked factual question with a single well-established answer, drawn from science, history, geography, nature and general culture."],
      ["Why is the answer hidden at first?", "So you can actually play. Read the question aloud, let everyone guess, then press Reveal Answer to settle it — which makes the tool usable as a quiz host rather than a list of facts."],
      ["Can I choose a topic?", "Yes. Filter by category to draw only science, history, geography, nature or culture questions, or leave it on All for a mixed round."],
    ],
    howTo: "Pick a category and press New Question. Read it out, take guesses, then press Reveal Answer. Press New Question again for the next round.",
  },

  "random-animal-generator": {
    title: "Random Animal Generator — 120+ Animals With Emoji | ToolsRift",
    desc: "Free random animal generator drawing from 120+ mammals, birds, reptiles, sea creatures and insects, each with an emoji and group tag. Great for games and lessons.",
    keywords: "random animal generator, random animal picker, animal randomizer, random animal name, animal game generator",
    faq: [
      ["How many animals are in the list?", "Over 120 real animals grouped into mammals, birds, reptiles and amphibians, sea life and insects, each shown with a matching emoji so results are instantly recognisable."],
      ["Can I limit it to one group?", "Yes. Choose mammals, birds, reptiles, sea life or insects and every draw comes from that group only, which suits themed lessons and quiz rounds."],
      ["What can I use it for?", "Charades and drawing games, classroom prompts, choosing a mascot or team animal, writing prompts, and picking a random creature to research."],
    ],
    howTo: "Pick an animal group and how many animals you want, then press Generate to draw random animals with their emoji and group tag.",
  },
  "random-food-generator": {
    title: "Random Food Generator — What Should I Eat Tonight? | ToolsRift",
    desc: "Free random food generator with 150+ real dishes from world cuisines. Cannot decide what to eat? Draw a random meal, filter by cuisine, and settle dinner in seconds.",
    keywords: "random food generator, what should i eat, random meal picker, random dish generator, dinner decider",
    faq: [
      ["How many dishes are included?", "More than 150 real dishes spanning Indian, Italian, Mexican, Chinese, Japanese, Thai, American, Middle Eastern and Mediterranean cooking, each labelled with its cuisine."],
      ["Can I filter by cuisine?", "Yes. Choose a cuisine and every draw comes from that kitchen only, so you can decide 'Italian tonight' and still let chance pick the actual dish."],
      ["Does it give me recipes?", "No — it gives you the decision. Once you have a dish name you can search it in your favourite recipe site or takeaway app, which keeps this tool fast and offline-friendly."],
    ],
    howTo: "Choose a cuisine or leave it on Any, then press Generate to draw a random dish with its cuisine tag. Press again until something sounds good.",
  },
  "random-movie-genre-generator": {
    title: "Random Movie Genre Generator — Genre, Decade & Mood | ToolsRift",
    desc: "Free random movie genre generator. Get a random genre, decade and mood combination to decide what to watch tonight or to spark a fresh screenplay or story idea.",
    keywords: "random movie genre generator, what should i watch, random film genre, movie night picker, story prompt generator",
    faq: [
      ["What does the combo give me?", "Three random elements at once: a genre such as neo-noir or heist, a decade from the 1950s to the 2020s, and a mood or theme like 'redemption' — together they make a specific, searchable brief."],
      ["How do I turn it into an actual film?", "Search the genre and decade on any streaming service or film database. A prompt like 'heist, 1970s, betrayal' narrows a limitless catalogue down to a handful of strong candidates."],
      ["Can writers use it?", "Yes — that is one of its best uses. A random genre, era and theme is a classic constraint exercise for screenwriters and novelists looking for an unexpected starting point."],
    ],
    howTo: "Press Generate for a random genre, decade and mood combination. Use it as a watch-list filter or a writing prompt, and press again for another.",
  },
  "random-country-picker": {
    title: "Random Country Picker — 190+ Countries With Capitals | ToolsRift",
    desc: "Free random country picker covering 190+ countries with flag emoji, capital city and continent. Filter by continent for geography quizzes, travel ideas and games.",
    keywords: "random country generator, random country picker, random country with capital, geography quiz generator, random nation picker",
    faq: [
      ["Which countries are included?", "Over 190 sovereign countries, each stored with its flag emoji, capital city and continent, so every draw gives you a complete little fact card rather than just a name."],
      ["Can I limit it to one continent?", "Yes. Choose Africa, Asia, Europe, North America, South America or Oceania and only countries from that continent are drawn — ideal for focused geography revision."],
      ["What is it useful for?", "Geography quizzes and classroom warm-ups, choosing a country to research or cook from, picking a random travel destination, and country-guessing party games."],
    ],
    howTo: "Choose a continent or leave it on All, set how many countries you want, then press Generate to draw random countries with flags and capitals.",
  },
  "random-name-generator-fun": {
    title: "Random Name Generator — Random First & Last Names | ToolsRift",
    desc: "Free random name generator. Combine built-in first and last name banks to create random full names for characters, test data, games and placeholder profiles.",
    keywords: "random name generator, random full name, fake name generator, character name generator, random person name",
    faq: [
      ["Are these real people's names?", "No. First names and surnames are drawn independently from two separate built-in lists and combined at random, so any resemblance to a real individual is coincidence rather than data about a real person."],
      ["Can I choose the name style?", "Yes. Pick feminine, masculine or any for the first name, and choose whether you want a full name, first name only or surname only in the output."],
      ["What are random names good for?", "Seeding test databases and UI mock-ups, naming characters in stories and games, creating example accounts for tutorials, and anonymising demo screenshots."],
    ],
    howTo: "Choose the name style and how many names you need, then press Generate. Copy the whole list straight into your test data or character sheet.",
  },
  "random-username-generator": {
    title: "Random Username Generator — Handles & Gamertags | ToolsRift",
    desc: "Free random username generator. Create catchy adjective-noun-number handles and gamertags in several styles, all generated privately inside your own browser.",
    keywords: "random username generator, gamertag generator, random handle generator, cool username ideas, nickname generator",
    faq: [
      ["What styles can I generate?", "Classic adjective-noun handles, snake_case, camelCase, a dotted style, and an all-lowercase run-together form — with an optional two to four digit number appended for uniqueness."],
      ["Will the username be available?", "The tool cannot check any platform, so treat each suggestion as an idea. Adding the random number option greatly improves the odds that a handle is still free on a busy site."],
      ["Is the generation private?", "Yes. Words are drawn from lists bundled with the page and combined in your browser, so nothing about the names you generate is ever sent to a server."],
    ],
    howTo: "Choose a style, decide whether to append a number, set how many ideas you want, and press Generate to get a batch of usernames you can copy.",
  },
  "random-hobby-generator": {
    title: "Random Hobby Generator — 120+ New Things To Try | ToolsRift",
    desc: "Free random hobby generator with 120+ ideas, each tagged creative, active, mindful, social or geeky. Filter by type and find something new to try this weekend.",
    keywords: "random hobby generator, what hobby should i try, hobby ideas generator, random activity picker, new hobby finder",
    faq: [
      ["How many hobbies are in the list?", "Over 120 real hobbies covering creative crafts, sports and outdoor activity, calm mindful pursuits, social and group hobbies, and technical or geeky interests."],
      ["Can I filter by the kind of hobby?", "Yes. Choose creative, active, mindful, social or geeky and only hobbies with that tag are drawn, so an answer always fits the sort of free time you actually have."],
      ["What if I do not like the suggestion?", "Press again — that is the point. Cycling through a dozen random ideas is a fast way to discover which ones genuinely appeal to you and which you dismiss instantly."],
    ],
    howTo: "Pick a hobby type or leave it on Any, then press Generate to draw a random hobby with its category tag. Press again for another idea.",
  },
  "random-color-palette": {
    title: "Random Color Palette Generator — 5 Harmonious Colors | ToolsRift",
    desc: "Free random colour palette generator. Produce five harmonious colours using analogous, complementary, triadic or monochrome rules, with HEX codes and copy-all.",
    keywords: "random color palette generator, random palette, color scheme generator, hex palette generator, harmonious colors",
    faq: [
      ["What makes the palette harmonious?", "The colours are not drawn independently. One base hue is chosen at random, then the other four are placed at musical intervals around the colour wheel according to the scheme you select, which is why they sit well together."],
      ["Which schemes are available?", "Analogous (neighbouring hues), complementary (opposite hues), triadic (three evenly spaced hues), monochrome (one hue at different lightness) and a random scheme that picks one for you."],
      ["Can I copy the whole palette at once?", "Yes. Each swatch has its own copy button for the HEX code, and Copy all puts every code on your clipboard as a single comma-separated line, ready for CSS variables."],
    ],
    howTo: "Choose a harmony scheme or leave it on random, press Generate, and copy individual HEX codes or the whole palette in one click.",
  },
  "tournament-bracket-generator": {
    title: "Tournament Bracket Generator — Random Single Elimination | ToolsRift",
    desc: "Free tournament bracket generator. Paste your players, shuffle them into a random single-elimination bracket with automatic byes, and see every round to the final.",
    keywords: "tournament bracket generator, random bracket maker, single elimination bracket, knockout draw generator, random seeding tool",
    faq: [
      ["What happens if I do not have a power of two?", "The tool pads the draw up to the next power of two with byes. Players who receive a bye skip round one and enter round two, exactly as a real knockout draw is organised."],
      ["Is the seeding random or ranked?", "Random by default — everyone is shuffled with a Fisher-Yates shuffle so no player has an advantage. Enter names in your preferred order and re-roll until you are happy if you want a specific look."],
      ["Can I copy or print the bracket?", "Yes. The bracket renders round by round on screen so you can print the page, and the copy button gives you a plain-text version of every round's pairings."],
    ],
    howTo: "Paste one player per line and press Generate Bracket. Everyone is shuffled, byes are added if needed, and every round is laid out through to the final.",
  },
  "random-tarot-card": {
    title: "Random Tarot Card Generator — Major Arcana Draw | ToolsRift",
    desc: "Free random tarot card generator. Draw one of the 22 Major Arcana upright or reversed with its keywords and number. Entertainment only — not advice or prediction.",
    keywords: "random tarot card generator, tarot card draw, major arcana generator, online tarot card picker, daily tarot card",
    faq: [
      ["Which cards can be drawn?", "All 22 Major Arcana, from The Fool at zero through to The World at twenty-one, each with its number, an emoji, and short upright and reversed keyword sets."],
      ["What does reversed mean?", "In tarot practice a card that lands upside down is read differently, often as a blocked or inward form of its usual theme. The tool flips each draw at random so both readings appear, and shows the matching keywords."],
      ["Is this a real reading?", "No. This is a novelty randomiser for entertainment only. It does not predict the future and must not be used for medical, legal, financial or other important decisions."],
    ],
    howTo: "Press Draw a Card to reveal a random Major Arcana card, upright or reversed, with its keywords. Draw again any time — it is for entertainment only.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  TOOLS
// ══════════════════════════════════════════════════════════════════════════════

const WHEEL_COLORS = ["#F43F5E","#F59E0B","#10B981","#3B82F6","#A855F7","#EC4899","#14B8A6","#F97316","#6366F1","#22C55E","#EAB308","#06B6D4"];

function SpinnerWheel() {
  const [names, setNames] = useState("Alice\nBob\nCharlie\nDiana\nEthan\nFiona");
  const [winner, setWinner] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const list = names.split("\n").map(s => s.trim()).filter(Boolean);

  const draw = (angle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 6;
    ctx.clearRect(0, 0, size, size);
    const n = list.length;
    if (n === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = "#64748B"; ctx.font = "16px 'Plus Jakarta Sans',sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("Add names to spin", cx, cy);
      return;
    }
    const seg = (2 * Math.PI) / n;
    for (let i = 0; i < n; i++) {
      const start = angle + i * seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(6,9,15,0.6)"; ctx.lineWidth = 2; ctx.stroke();
      // label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + seg / 2);
      ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#0B0B0F";
      ctx.font = `600 ${Math.max(11, Math.min(18, 220 / n))}px 'Plus Jakarta Sans',sans-serif`;
      const label = list[i].length > 16 ? list[i].slice(0, 15) + "…" : list[i];
      ctx.fillText(label, r - 12, 0);
      ctx.restore();
    }
    // hub
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#0D1117"; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2; ctx.stroke();
  };

  useEffect(() => { draw(angleRef.current); }, [names]); // eslint-disable-line
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const spin = () => {
    if (spinning || list.length < 2) return;
    setSpinning(true); setWinner(null);
    const n = list.length;
    const seg = (2 * Math.PI) / n;
    const start = angleRef.current;
    const target = start + (5 + Math.random() * 3) * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const dur = 4200;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const frame = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const cur = start + (target - start) * ease(p);
      angleRef.current = cur;
      draw(cur);
      if (p < 1) { rafRef.current = requestAnimationFrame(frame); }
      else {
        angleRef.current = ((cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer sits at the top of the wheel, i.e. screen angle 3π/2 (270°).
        const pointer = (3 * Math.PI) / 2;
        const rel = ((pointer - angleRef.current) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const idx = Math.floor(rel / seg) % n;
        setWinner(list[idx]);
        setSpinning(false);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  const removeWinner = () => {
    if (!winner) return;
    setNames(list.filter(x => x !== winner).join("\n"));
    setWinner(null);
  };

  return (
    <VStack gap={18}>
      <Grid2>
        <div>
          <Label>Names — one per line ({list.length})</Label>
          <Textarea value={names} onChange={setNames} rows={10} placeholder="Add one name per line..." />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 320 }}>
            {/* Pointer */}
            <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", zIndex: 2, width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: `20px solid ${C.accent}`, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.4))" }} />
            <canvas ref={canvasRef} width={320} height={320} style={{ width: "100%", height: "auto", display: "block", borderRadius: "50%" }} />
          </div>
          <button onClick={spin} disabled={spinning || list.length < 2} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width: "100%", maxWidth: 320, opacity: spinning || list.length < 2 ? 0.55 : 1 }}>
            {spinning ? "Spinning…" : "🎡 Spin the Wheel"}
          </button>
        </div>
      </Grid2>
      {winner && !spinning && (
        <div style={{ textAlign: "center", padding: "24px 20px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 14 }}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>🎉 Winner</div>
          <div style={{ fontSize: "clamp(26px,6vw,40px)", fontWeight: 800, fontFamily: "'Sora',sans-serif", color: C.accent }}>{winner}</div>
          <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn size="sm" variant="secondary" onClick={removeWinner}>Remove &amp; spin again</Btn>
            <CopyBtn text={winner} />
          </div>
        </div>
      )}
      {list.length < 2 && <Result mono={false}>Add at least two names to spin the wheel.</Result>}
    </VStack>
  );
}

function RandomTeamGenerator() {
  const [names, setNames] = useState("Aarav\nDiya\nRahul\nSneha\nVikram\nPriya\nArjun\nMeera\nKabir\nAnaya");
  const [teamCount, setTeamCount] = useState("2");
  const [teams, setTeams] = useState(null);
  const list = names.split("\n").map(s => s.trim()).filter(Boolean);
  const generate = () => {
    const n = Math.max(2, Math.min(list.length || 2, parseInt(teamCount) || 2));
    const shuffled = shuffle(list);
    const buckets = Array.from({ length: n }, () => []);
    shuffled.forEach((name, i) => buckets[i % n].push(name));
    setTeams(buckets);
  };
  const copyText = teams ? teams.map((t, i) => `Team ${i + 1}: ${t.join(", ")}`).join("\n") : "";
  return (
    <VStack gap={16}>
      <div><Label>People — one per line ({list.length})</Label><Textarea value={names} onChange={setNames} rows={8} /></div>
      <Grid2>
        <div><Label>Number of Teams</Label><Input value={teamCount} onChange={setTeamCount} /></div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={generate} disabled={list.length < 2} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width: "100%", opacity: list.length < 2 ? 0.55 : 1 }}>👥 Generate Teams</button>
        </div>
      </Grid2>
      {teams && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
            {teams.map((t, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${WHEEL_COLORS[i % WHEEL_COLORS.length]}55`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: WHEEL_COLORS[i % WHEEL_COLORS.length], marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Team {i + 1} · {t.length}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {t.map((name, j) => <div key={j} style={{ fontSize: 14, color: C.text }}>{name}</div>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
      {list.length < 2 && <Result mono={false}>Enter at least two people to build teams.</Result>}
    </VStack>
  );
}

function RandomPicker() {
  const [options, setOptions] = useState("Pizza\nSushi\nBurgers\nTacos\nPasta\nSalad");
  const [picked, setPicked] = useState(null);
  const [picking, setPicking] = useState(false);
  const list = options.split("\n").map(s => s.trim()).filter(Boolean);
  const pick = () => {
    if (picking || list.length === 0) return;
    setPicking(true);
    let i = 0;
    const spin = setInterval(() => {
      setPicked(list[secureRandom(list.length)]);
      if (++i >= 14) {
        clearInterval(spin);
        setPicked(list[secureRandom(list.length)]);
        setPicking(false);
      }
    }, 80);
  };
  return (
    <VStack gap={16}>
      <div><Label>Options — one per line ({list.length})</Label><Textarea value={options} onChange={setOptions} rows={8} placeholder="Enter one option per line..." /></div>
      <button onClick={pick} disabled={picking || list.length === 0} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center", opacity: picking || list.length === 0 ? 0.55 : 1 }}>🎯 Pick One</button>
      {picked && (
        <div style={{ textAlign: "center", padding: "26px 20px", background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.3)", borderRadius: 14 }}>
          <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{picking ? "Picking…" : "✨ The choice is"}</div>
          <div style={{ fontSize: "clamp(24px,6vw,38px)", fontWeight: 800, fontFamily: "'Sora',sans-serif", color: C.accent }}>{picked}</div>
          {!picking && <div style={{ marginTop: 10 }}><CopyBtn text={picked} /></div>}
        </div>
      )}
      {list.length === 0 && <Result mono={false}>Add at least one option to pick from.</Result>}
    </VStack>
  );
}

function RandomNumberGenerator() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("5");
  const [unique, setUnique] = useState("no");
  const [sorted, setSorted] = useState("no");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const generate = () => {
    let lo = parseInt(min), hi = parseInt(max);
    let n = parseInt(count);
    if (isNaN(lo) || isNaN(hi) || isNaN(n)) { setErr("Enter valid numbers for min, max and count."); setResult(null); return; }
    if (lo > hi) [lo, hi] = [hi, lo];
    n = Math.max(1, n);
    const rangeSize = hi - lo + 1;
    if (unique === "yes" && n > rangeSize) n = rangeSize; // cannot exceed range
    setErr(null);
    let nums;
    if (unique === "yes") {
      const pool = Array.from({ length: rangeSize }, (_, i) => lo + i);
      nums = shuffle(pool).slice(0, n);
    } else {
      nums = Array.from({ length: n }, () => lo + secureRandom(rangeSize));
    }
    if (sorted === "yes") nums = nums.slice().sort((a, b) => a - b);
    setResult(nums);
  };
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Minimum</Label><Input value={min} onChange={setMin} /></div>
        <div><Label>Maximum</Label><Input value={max} onChange={setMax} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Unique (no repeats)</Label><SelectInput value={unique} onChange={setUnique} options={[["no","No — allow repeats"],["yes","Yes — all different"]]} /></div>
        <div><Label>Sort Results</Label><SelectInput value={sorted} onChange={setSorted} options={[["no","No — random order"],["yes","Yes — ascending"]]} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center" }}>🔢 Generate Numbers</button>
      {err && <Result mono={false}>{err}</Result>}
      {result && (
        <>
          {result.length === 1 ? (
            <BigResult value={result[0]} label="Random Number" />
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {result.map((num, i) => (
                <div key={i} style={{ minWidth: 54, padding: "12px 16px", borderRadius: 10, background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.25)", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 20, fontWeight: 700, color: C.text }}>{num}</div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={result.join(", ")} /></div>
        </>
      )}
    </VStack>
  );
}

const VOWELS = "AEIOU";
const CONSONANTS = "BCDFGHJKLMNPQRSTVWXYZ";
function RandomLetterGenerator() {
  const [count, setCount] = useState("1");
  const [caseMode, setCaseMode] = useState("upper");
  const [filter, setFilter] = useState("all");
  const [result, setResult] = useState(null);
  const generate = () => {
    const pool = filter === "vowels" ? VOWELS : filter === "consonants" ? CONSONANTS : VOWELS + CONSONANTS;
    // reorder into A-Z when using the full set for readability of the pool (not required for randomness)
    const set = filter === "all" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : pool;
    const n = Math.max(1, Math.min(200, parseInt(count) || 1));
    let out = "";
    for (let i = 0; i < n; i++) out += set[secureRandom(set.length)];
    if (caseMode === "lower") out = out.toLowerCase();
    setResult(out);
  };
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
        <div><Label>Case</Label><SelectInput value={caseMode} onChange={setCaseMode} options={[["upper","UPPERCASE"],["lower","lowercase"]]} /></div>
        <div><Label>Filter</Label><SelectInput value={filter} onChange={setFilter} options={[["all","All letters"],["vowels","Vowels only"],["consonants","Consonants only"]]} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center" }}>🔠 Generate Letters</button>
      {result && (
        <>
          <BigResult value={result.length > 24 ? result.slice(0, 24) + "…" : result} label={`${result.length} random letter${result.length !== 1 ? "s" : ""}`} />
          {result.length > 24 && <Result>{result}</Result>}
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={result} /></div>
        </>
      )}
    </VStack>
  );
}

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
function DiceRoller3D() {
  const [sides, setSides] = useState("20");
  const [count, setCount] = useState("2");
  const [mod, setMod] = useState("0");
  const [rolls, setRolls] = useState([]);
  const roll = () => {
    const s = parseInt(sides) || 6;
    const n = Math.max(1, Math.min(20, parseInt(count) || 1));
    setRolls(Array.from({ length: n }, () => 1 + secureRandom(s)));
  };
  const s = parseInt(sides) || 6;
  const m = parseInt(mod) || 0;
  const subtotal = rolls.reduce((a, b) => a + b, 0);
  const total = subtotal + m;
  const copyText = rolls.length ? `${rolls.length}d${s}${m ? (m > 0 ? "+" + m : m) : ""}: [${rolls.join(", ")}]${m ? ` ${m > 0 ? "+" : "−"} ${Math.abs(m)}` : ""} = ${total}` : "";
  return (
    <VStack gap={18}>
      <Grid3>
        <div><Label>Die Type</Label><SelectInput value={sides} onChange={setSides} options={[["4","D4"],["6","D6"],["8","D8"],["10","D10"],["12","D12"],["20","D20"]]} /></div>
        <div><Label>Number of Dice (1–20)</Label><Input value={count} onChange={setCount} /></div>
        <div><Label>Modifier (±)</Label><Input value={mod} onChange={setMod} /></div>
      </Grid3>
      <button onClick={roll} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center" }}>🎲 Roll {count || 1}d{s}{m ? (m > 0 ? "+" + m : m) : ""}</button>
      {rolls.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {rolls.map((r, i) => (
              <div key={i} style={{ width: 64, height: 64, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.accent}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: s === 6 ? 40 : 24, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: C.text }}>
                {s === 6 ? DICE_FACES[r] : r}
              </div>
            ))}
          </div>
          <BigResult value={total} label={m ? `Dice ${subtotal} ${m > 0 ? "+" : "−"} ${Math.abs(m)} modifier` : "Total"} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
    </VStack>
  );
}

function CoinFlipBatch() {
  const [count, setCount] = useState("10");
  const [flips, setFlips] = useState(null);
  const flip = () => {
    const n = Math.max(1, Math.min(1000, parseInt(count) || 1));
    setFlips(Array.from({ length: n }, () => (secureRandom(2) ? "H" : "T")));
  };
  const heads = flips ? flips.filter(f => f === "H").length : 0;
  const tails = flips ? flips.length - heads : 0;
  const pct = flips && flips.length ? ((heads / flips.length) * 100).toFixed(1) : "0";
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Number of Coins (1–1000)</Label><Input value={count} onChange={setCount} /></div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={flip} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width: "100%" }}>🪙 Flip Coins</button>
        </div>
      </Grid2>
      {flips && (
        <>
          <Grid3>
            <StatBox value={heads} label={`Heads (${pct}%)`} />
            <StatBox value={tails} label={`Tails (${(100 - parseFloat(pct)).toFixed(1)}%)`} />
            <StatBox value={flips.length} label="Total Flips" />
          </Grid3>
          <div><Label>Sequence</Label>
            <Result>{flips.join(" ")}</Result>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={`Heads ${heads}, Tails ${tails}\n${flips.join(" ")}`} /></div>
        </>
      )}
    </VStack>
  );
}

const BINGO_COLS = [
  { letter: "B", lo: 1, hi: 15 },
  { letter: "I", lo: 16, hi: 30 },
  { letter: "N", lo: 31, hi: 45 },
  { letter: "G", lo: 46, hi: 60 },
  { letter: "O", lo: 61, hi: 75 },
];
function BingoCardGenerator() {
  const buildCard = () => BINGO_COLS.map((col, ci) => {
    const pool = Array.from({ length: col.hi - col.lo + 1 }, (_, i) => col.lo + i);
    const picks = shuffle(pool).slice(0, 5);
    if (ci === 2) picks[2] = "FREE"; // center of the N column
    return picks;
  });
  const [card, setCard] = useState(buildCard);
  const regenerate = () => setCard(buildCard());
  return (
    <VStack gap={18}>
      <button onClick={regenerate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center" }}>🔳 Generate New Card</button>
      <div style={{ maxWidth: 380, margin: "0 auto", width: "100%" }}>
        {/* header row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginBottom: 6 }}>
          {BINGO_COLS.map(col => (
            <div key={col.letter} style={{ textAlign: "center", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: C.accent }}>{col.letter}</div>
          ))}
        </div>
        {/* 5x5 grid — rendered row-major from column-major card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
          {Array.from({ length: 5 }).map((_, row) =>
            BINGO_COLS.map((col, ci) => {
              const val = card[ci][row];
              const isFree = val === "FREE";
              return (
                <div key={`${ci}-${row}`} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", background: isFree ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isFree ? C.accent : C.border}`, borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: isFree ? 12 : 18, fontWeight: 700, color: isFree ? C.accent : C.text }}>
                  {isFree ? "FREE" : val}
                </div>
              );
            })
          )}
        </div>
      </div>
      <Result mono={false}>Standard 1–75 bingo: B 1–15, I 16–30, N 31–45, G 46–60, O 61–75, with a free center square. Press Generate for a new card, then print this page to hand it out.</Result>
    </VStack>
  );
}

const EIGHT_BALL_ANSWERS = [
  "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes definitely.",
  "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.",
  "Yes.", "Signs point to yes.",
  "Reply hazy, try again.", "Ask again later.", "Better not tell you now.",
  "Cannot predict now.", "Concentrate and ask again.",
  "Don't count on it.", "My reply is no.", "My sources say no.",
  "Outlook not so good.", "Very doubtful.",
];
function Magic8Ball() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [shaking, setShaking] = useState(false);
  const shake = () => {
    if (shaking) return;
    setShaking(true); setAnswer(null);
    let i = 0;
    const spin = setInterval(() => {
      setAnswer(EIGHT_BALL_ANSWERS[secureRandom(EIGHT_BALL_ANSWERS.length)]);
      if (++i >= 10) {
        clearInterval(spin);
        setAnswer(EIGHT_BALL_ANSWERS[secureRandom(EIGHT_BALL_ANSWERS.length)]);
        setShaking(false);
      }
    }, 90);
  };
  return (
    <VStack gap={18}>
      <div><Label>Your yes-or-no question (optional)</Label><Input value={question} onChange={setQuestion} placeholder="Will it rain tomorrow?" /></div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 180, height: 180, margin: "0 auto", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #334155, #0B0B0F 70%)", border: "3px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", animation: shaking ? "trShake 0.4s ease-in-out infinite" : "none" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "rgba(244,63,94,0.12)", border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 8 }}>
            <span style={{ fontSize: answer ? 12 : 40, fontWeight: 700, fontFamily: answer ? "'Plus Jakarta Sans',sans-serif" : "'Sora',sans-serif", color: answer ? "#FDA4AF" : C.accent, lineHeight: 1.2 }}>
              {answer ? answer : "8"}
            </span>
          </div>
        </div>
      </div>
      <button onClick={shake} disabled={shaking} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center", opacity: shaking ? 0.6 : 1 }}>🎱 {shaking ? "Shaking…" : "Shake the 8 Ball"}</button>
      {answer && !shaking && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora',sans-serif", color: C.text }}>{answer}</div>
        </div>
      )}
    </VStack>
  );
}

function YesNoGenerator() {
  const [includeMaybe, setIncludeMaybe] = useState("no");
  const [answer, setAnswer] = useState(null);
  const [rolling, setRolling] = useState(false);
  const options = () => includeMaybe === "yes" ? ["Yes", "No", "Maybe"] : ["Yes", "No"];
  const decide = () => {
    if (rolling) return;
    setRolling(true); setAnswer(null);
    const opts = options();
    let i = 0;
    const spin = setInterval(() => {
      setAnswer(opts[secureRandom(opts.length)]);
      if (++i >= 12) {
        clearInterval(spin);
        setAnswer(opts[secureRandom(opts.length)]);
        setRolling(false);
      }
    }, 70);
  };
  const color = answer === "Yes" ? C.success : answer === "No" ? C.danger : C.warn;
  return (
    <VStack gap={18}>
      <div><Label>Include "Maybe"?</Label><SelectInput value={includeMaybe} onChange={setIncludeMaybe} options={[["no","No — Yes or No only"],["yes","Yes — Yes / No / Maybe"]]} /></div>
      <div style={{ textAlign: "center", padding: "34px 20px", background: "rgba(255,255,255,0.03)", border: `1px solid ${answer && !rolling ? color + "55" : C.border}`, borderRadius: 16 }}>
        <div style={{ fontSize: "clamp(40px,12vw,72px)", fontWeight: 800, fontFamily: "'Sora',sans-serif", color: rolling ? C.muted : answer ? color : C.muted, minHeight: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {answer || "?"}
        </div>
      </div>
      <button onClick={decide} disabled={rolling} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center", opacity: rolling ? 0.6 : 1 }}>✅ {rolling ? "Deciding…" : "Decide for Me"}</button>
    </VStack>
  );
}

// ── Colour helpers ───────────────────────────────────────────────────────────
const hslToRgb = (h, s, l) => {
  const S = s / 100, L = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n) => Math.round(255 * (L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return [f(0), f(8), f(4)];
};
const rgbToHex = (r, g, b) => "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
const makeColor = (h, s, l) => {
  const [r, g, b] = hslToRgb(h, s, l);
  return { h, s, l, hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${h}, ${s}%, ${l}%)` };
};

function RandomColorPicker() {
  const [mode, setMode] = useState("any");
  const [color, setColor] = useState(null);
  const generate = () => {
    const h = secureRandom(360);
    let s, l;
    if (mode === "bright") { s = 70 + secureRandom(31); l = 45 + secureRandom(16); }
    else if (mode === "pastel") { s = 35 + secureRandom(31); l = 78 + secureRandom(11); }
    else if (mode === "dark") { s = 45 + secureRandom(36); l = 16 + secureRandom(15); }
    else { s = 40 + secureRandom(56); l = 30 + secureRandom(46); }
    setColor(makeColor(h, s, l));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Colour Style</Label><SelectInput value={mode} onChange={setMode} options={[["any","Any colour"],["bright","Bright & saturated"],["pastel","Soft pastel"],["dark","Deep & dark"]]} style={{ width:"100%" }} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}>
          <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width:"100%" }}>🎨 Generate Colour</button>
        </div>
      </Grid2>
      {color && (
        <>
          <div style={{ height:170, borderRadius:14, background:color.hex, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:26, fontWeight:700, color: color.l > 55 ? "#0B0B0F" : "#FFFFFF" }}>{color.hex}</span>
          </div>
          <Grid3>
            {[["HEX", color.hex], ["RGB", color.rgb], ["HSL", color.hsl]].map(([k, v]) => (
              <div key={k} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 12px", textAlign:"center" }}>
                <div style={{ ...T.label, marginBottom:6 }}>{k}</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, color:C.text, marginBottom:6, wordBreak:"break-all" }}>{v}</div>
                <CopyBtn text={v} />
              </div>
            ))}
          </Grid3>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={`${color.hex}\n${color.rgb}\n${color.hsl}`} /></div>
        </>
      )}
    </VStack>
  );
}

const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const toISO = (ms) => new Date(ms).toISOString().slice(0, 10);
function RandomDateGenerator() {
  const [start, setStart] = useState("2020-01-01");
  const [end, setEnd] = useState("2026-12-31");
  const [count, setCount] = useState("5");
  const [unique, setUnique] = useState("no");
  const [sorted, setSorted] = useState("no");
  const [dates, setDates] = useState(null);
  const [err, setErr] = useState(null);
  const DAY = 86400000;
  const generate = () => {
    const a = Date.parse(start + "T00:00:00Z");
    const b = Date.parse(end + "T00:00:00Z");
    if (isNaN(a) || isNaN(b)) { setErr("Enter both dates in YYYY-MM-DD format, for example 2026-01-31."); setDates(null); return; }
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const span = Math.round((hi - lo) / DAY) + 1;
    let n = Math.max(1, Math.min(500, parseInt(count) || 1));
    if (unique === "yes" && n > span) n = span;
    setErr(null);
    let picks;
    if (unique === "yes") {
      const pool = Array.from({ length: span }, (_, i) => lo + i * DAY);
      picks = shuffle(pool).slice(0, n);
    } else {
      picks = Array.from({ length: n }, () => lo + secureRandom(span) * DAY);
    }
    if (sorted === "yes") picks = picks.slice().sort((x, y) => x - y);
    setDates(picks.map(ms => ({ iso: toISO(ms), day: WEEKDAYS[new Date(ms).getUTCDay()] })));
  };
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Start Date</Label><Input value={start} onChange={setStart} placeholder="2020-01-01" /></div>
        <div><Label>End Date</Label><Input value={end} onChange={setEnd} placeholder="2026-12-31" /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Unique (no repeats)</Label><SelectInput value={unique} onChange={setUnique} options={[["no","No — allow repeats"],["yes","Yes — all different"]]} style={{ width:"100%" }} /></div>
        <div><Label>Sort Results</Label><SelectInput value={sorted} onChange={setSorted} options={[["no","No — random order"],["yes","Yes — oldest first"]]} style={{ width:"100%" }} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>📅 Generate Dates</button>
      {err && <Result mono={false}>{err}</Result>}
      {dates && dates.length > 0 && (
        <>
          <DataTable columns={["#", "Date", "Weekday"]} rows={dates.map((d, i) => [i + 1, d.iso, d.day])} />
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={dates.map(d => `${d.iso} (${d.day})`).join("\n")} /></div>
        </>
      )}
    </VStack>
  );
}

const pad2 = (n) => String(n).padStart(2, "0");
function RandomTimeGenerator() {
  const [fromH, setFromH] = useState("0");
  const [toH, setToH] = useState("23");
  const [interval, setIntervalMin] = useState("1");
  const [fmt, setFmt] = useState("24");
  const [count, setCount] = useState("5");
  const [times, setTimes] = useState(null);
  const [err, setErr] = useState(null);
  const generate = () => {
    let lo = parseInt(fromH), hi = parseInt(toH);
    const step = parseInt(interval) || 1;
    const n = Math.max(1, Math.min(500, parseInt(count) || 1));
    if (isNaN(lo) || isNaN(hi)) { setErr("Enter an earliest and latest hour between 0 and 23."); setTimes(null); return; }
    lo = Math.max(0, Math.min(23, lo)); hi = Math.max(0, Math.min(23, hi));
    if (lo > hi) [lo, hi] = [hi, lo];
    setErr(null);
    const slotsPerHour = Math.floor(60 / step);
    const totalSlots = (hi - lo + 1) * slotsPerHour;
    const out = [];
    for (let i = 0; i < n; i++) {
      const s = secureRandom(totalSlots);
      const h = lo + Math.floor(s / slotsPerHour);
      const m = (s % slotsPerHour) * step;
      out.push(fmt === "12"
        ? `${((h % 12) || 12)}:${pad2(m)} ${h < 12 ? "AM" : "PM"}`
        : `${pad2(h)}:${pad2(m)}`);
    }
    setTimes(out);
  };
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Earliest Hour (0–23)</Label><Input value={fromH} onChange={setFromH} /></div>
        <div><Label>Latest Hour (0–23)</Label><Input value={toH} onChange={setToH} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Minute Interval</Label><SelectInput value={interval} onChange={setIntervalMin} options={[["1","Any minute"],["5","5 minute slots"],["15","15 minute slots"],["30","30 minute slots"]]} style={{ width:"100%" }} /></div>
        <div><Label>Format</Label><SelectInput value={fmt} onChange={setFmt} options={[["24","24-hour (15:45)"],["12","12-hour (3:45 PM)"]]} style={{ width:"100%" }} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>⏰ Generate Times</button>
      {err && <Result mono={false}>{err}</Result>}
      {times && (
        <>
          {times.length === 1 ? <BigResult value={times[0]} label="Random Time" /> : (
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
              {times.map((t, i) => (
                <div key={i} style={{ padding:"10px 16px", borderRadius:10, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:700, color:C.text }}>{t}</div>
              ))}
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={times.join("\n")} /></div>
        </>
      )}
    </VStack>
  );
}

const LOTTO_PRESETS = {
  custom:   { label:"Custom",                     pick:6, max:49, bonusCount:0, bonusMax:0 },
  "6-49":   { label:"6 from 49",                  pick:6, max:49, bonusCount:0, bonusMax:0 },
  "6-45":   { label:"6 from 45",                  pick:6, max:45, bonusCount:0, bonusMax:0 },
  power:    { label:"Powerball style (5/69 + 1/26)", pick:5, max:69, bonusCount:1, bonusMax:26 },
  euro:     { label:"EuroMillions style (5/50 + 2/12)", pick:5, max:50, bonusCount:2, bonusMax:12 },
};
function LotteryNumberGenerator() {
  const [preset, setPreset] = useState("6-49");
  const [pick, setPick] = useState("6");
  const [maxNum, setMaxNum] = useState("49");
  const [bonusCount, setBonusCount] = useState("0");
  const [bonusMax, setBonusMax] = useState("0");
  const [lines, setLines] = useState("1");
  const [draws, setDraws] = useState(null);
  const [err, setErr] = useState(null);
  const applyPreset = (key) => {
    setPreset(key);
    const p = LOTTO_PRESETS[key];
    if (!p || key === "custom") return;
    setPick(String(p.pick)); setMaxNum(String(p.max));
    setBonusCount(String(p.bonusCount)); setBonusMax(String(p.bonusMax));
  };
  const generate = () => {
    const k = parseInt(pick), m = parseInt(maxNum);
    const bc = Math.max(0, Math.min(5, parseInt(bonusCount) || 0));
    const bm = parseInt(bonusMax) || 0;
    const nLines = Math.max(1, Math.min(50, parseInt(lines) || 1));
    if (isNaN(k) || isNaN(m) || k < 1 || m < 1) { setErr("Enter how many numbers to pick and the highest number available."); setDraws(null); return; }
    if (k > m) { setErr(`You cannot pick ${k} unique numbers from only ${m}. Lower the pick count or raise the maximum.`); setDraws(null); return; }
    if (bc > 0 && bm < bc) { setErr(`The bonus pool must be at least ${bc} for ${bc} bonus ball${bc > 1 ? "s" : ""}.`); setDraws(null); return; }
    setErr(null);
    const out = [];
    for (let i = 0; i < nLines; i++) {
      const pool = Array.from({ length: m }, (_, x) => x + 1);
      const main = shuffle(pool).slice(0, k).sort((a, b) => a - b);
      let bonus = [];
      if (bc > 0) {
        const bpool = Array.from({ length: bm }, (_, x) => x + 1);
        bonus = shuffle(bpool).slice(0, bc).sort((a, b) => a - b);
      }
      out.push({ main, bonus });
    }
    setDraws(out);
  };
  const copyText = draws ? draws.map((d, i) => `Line ${i + 1}: ${d.main.join(" ")}${d.bonus.length ? "  +  " + d.bonus.join(" ") : ""}`).join("\n") : "";
  return (
    <VStack gap={16}>
      <div><Label>Preset</Label><SelectInput value={preset} onChange={applyPreset} options={Object.entries(LOTTO_PRESETS).map(([k, v]) => [k, v.label])} style={{ width:"100%" }} /></div>
      <Grid3>
        <div><Label>Numbers To Pick</Label><Input value={pick} onChange={v => { setPick(v); setPreset("custom"); }} /></div>
        <div><Label>Highest Number</Label><Input value={maxNum} onChange={v => { setMaxNum(v); setPreset("custom"); }} /></div>
        <div><Label>Lines (1–50)</Label><Input value={lines} onChange={setLines} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Bonus Balls</Label><Input value={bonusCount} onChange={v => { setBonusCount(v); setPreset("custom"); }} /></div>
        <div><Label>Bonus Pool Size</Label><Input value={bonusMax} onChange={v => { setBonusMax(v); setPreset("custom"); }} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🎟️ Generate Numbers</button>
      {err && <Result mono={false}>{err}</Result>}
      {draws && (
        <>
          <VStack gap={10}>
            {draws.map((d, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                <span style={{ ...T.label, minWidth:52 }}>Line {i + 1}</span>
                {d.main.map((n, j) => (
                  <span key={j} style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C.accent},${C.accentD})`, color:"#fff", display:"inline-flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15 }}>{n}</span>
                ))}
                {d.bonus.map((n, j) => (
                  <span key={"b" + j} style={{ width:40, height:40, borderRadius:"50%", background:"rgba(245,158,11,0.18)", border:"1px solid rgba(245,158,11,0.5)", color:"#FCD34D", display:"inline-flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15 }}>{n}</span>
                ))}
              </div>
            ))}
          </VStack>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
    </VStack>
  );
}

// ── Shared word banks (used by several tools below) ──────────────────────────
const WORD_NOUNS = ("anchor apple arrow autumn bakery balloon banner basket beacon bicycle blanket bottle boulder bracket breeze bridge bubble bucket candle canvas canyon carpet castle cavern cherry chimney cloud comet compass copper cottage crayon crystal curtain diamond dolphin donkey dragon drummer eagle ember engine envelope falcon feather ferry fiddle forest fountain garden glacier glider granite grotto guitar hammer harbor harvest hedgehog helmet hillside horizon iceberg island jacket jigsaw journal jungle kettle kitten ladder lantern lagoon lattice lemon library lighthouse lily lobster locket lumber magnet mammoth mango marble meadow melon meteor mirror mitten monsoon mountain muffin nectar needle nutmeg oasis orchard otter oyster paddle palace pancake parcel parrot pebble pelican pencil penguin pepper pillow planet plateau pocket pottery prairie pumpkin puzzle quartz quilt rabbit raccoon rainbow ribbon river rocket saddle sapphire satchel scooter seagull shadow shovel signal silver sparrow spider spiral stadium station stencil summit sunrise sweater tangerine teapot temple thistle thunder tiger timber tractor trumpet tunnel turtle umbrella valley velvet village violin volcano walnut whistle willow window winter wombat yogurt zebra zipper").split(" ");
const WORD_VERBS = ("adjust admire arrange assemble balance blend bloom bounce breathe build capture carve chase climb collect compose connect cook create dance decide deliver design discover draw drift explore fasten fetch finish float follow forge gather glide grow guide hammer hurry imagine invent jump kindle knit launch leap listen measure mend mix navigate notice organize paint paddle plant polish practice prepare press protect pull push question read repair rescue rest ride sail scatter search shape share shuffle sing sketch slide sort sparkle spin sprint stack stitch stretch study support sweep swim teach tinker travel tune unfold unpack visit wander watch weave whisper wonder wrap write").split(" ");
const WORD_ADJS = ("ancient bold brave breezy bright brisk calm cheerful clever clumsy cosy crimson curious daring dazzling deep delicate distant dusty eager early easy elegant emerald empty fearless fierce flaky fluffy fragrant fresh friendly frosty gentle giant glassy gleaming golden graceful grand happy hidden honest humble hungry icy jolly joyful kind lively lofty loyal lucky mellow merry mighty misty modern muddy narrow neat nimble noble noisy odd pale patient peaceful playful polite proud quick quiet rapid rare restless rocky rosy rugged rustic salty sandy scarlet sharp shiny silent silky simple sleepy slender smooth snowy soft solid sparkling spicy steady sturdy sunny sweet swift tall tender tidy tiny velvet vivid warm wild windy winding wise witty wooden young zesty").split(" ");

const SEPARATORS = { "-":"Hyphen  a-b-c", ".":"Dot  a.b.c", "_":"Underscore  a_b_c", " ":"Space  a b c", "":"None  abc" };
function RandomPassphraseGenerator() {
  const [words, setWords] = useState("4");
  const [sep, setSep] = useState("-");
  const [caps, setCaps] = useState("yes");
  const [digits, setDigits] = useState("yes");
  const [phrase, setPhrase] = useState(null);
  const bank = WORD_NOUNS.concat(WORD_VERBS, WORD_ADJS);
  const generate = () => {
    const n = Math.max(2, Math.min(12, parseInt(words) || 4));
    let parts = Array.from({ length: n }, () => bank[secureRandom(bank.length)]);
    if (caps === "yes") parts = parts.map(w => w.charAt(0).toUpperCase() + w.slice(1));
    let out = parts.join(sep);
    if (digits === "yes") out += (sep || "") + (10 + secureRandom(90));
    setPhrase(out);
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Number of Words (2–12)</Label><Input value={words} onChange={setWords} /></div>
        <div><Label>Separator</Label><SelectInput value={sep} onChange={setSep} options={Object.entries(SEPARATORS).map(([k, v]) => [k, v])} style={{ width:"100%" }} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Capitalise Words</Label><SelectInput value={caps} onChange={setCaps} options={[["yes","Yes — Title Case"],["no","No — all lowercase"]]} style={{ width:"100%" }} /></div>
        <div><Label>Append Number</Label><SelectInput value={digits} onChange={setDigits} options={[["yes","Yes — add 2 digits"],["no","No — words only"]]} style={{ width:"100%" }} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🔑 Generate Passphrase</button>
      {phrase && (
        <>
          <div style={{ textAlign:"center", padding:"22px 16px", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:12 }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"clamp(15px,3.4vw,24px)", fontWeight:600, color:C.text, wordBreak:"break-all" }}>{phrase}</div>
            <div style={{ ...T.label, marginTop:8 }}>{phrase.length} characters</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={phrase} /></div>
          <Result mono={false}>Generated entirely in your browser and never sent anywhere. Save it in a password manager before you leave this page.</Result>
        </>
      )}
    </VStack>
  );
}

const EMOJI_BANK = {
  faces: "😀 😃 😄 😁 😆 😅 😂 🙂 😊 😇 🙃 😉 😌 😍 🥰 😘 😋 😜 🤪 🤗 🤔 🤨 😐 😴 😪 🤤 😎 🥳 🤓 🧐 😺 😸 🙈 🙉 🙊".split(" "),
  animals: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦆 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🐛 🦋 🐌 🐞 🐢 🐍 🐙 🦑 🦀 🐬 🐳 🐟 🦈 🐊 🦓 🦍 🐘 🦏 🐫 🦒 🦘 🐇 🦔".split(" "),
  food: "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🥦 🥕 🌽 🥔 🍠 🥐 🍞 🥖 🧀 🥚 🥞 🧇 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍚 🍦 🍩 🍪 🎂 🍫 🍬 🍭 🍯 ☕ 🍵".split(" "),
  activities: "⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🥅 🏒 🏑 🥍 🏏 ⛳ 🏹 🎣 🥊 🥋 🎽 🛹 🛼 🎿 ⛸️ 🏂 🏋️ 🤸 ⛹️ 🚴 🧗 🎯 🎳 🎮 🎲 🧩 🎨 🎤 🎧 🎸 🥁 🎺 🎻 🎬".split(" "),
  travel: "🚗 🚕 🚌 🚎 🏎️ 🚓 🚑 🚒 🚚 🚜 🛵 🏍️ 🚲 🛴 🚂 🚄 🚅 🚈 🚝 🚠 ✈️ 🛫 🚀 🛸 🚁 ⛵ 🚤 🛳️ ⚓ 🗺️ 🧭 🏝️ 🏔️ 🌋 🏕️ 🏖️ 🗽 🗼 🏰 🎡 🎢 🎠".split(" "),
  objects: "⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 📷 📹 📼 🔍 💡 🔦 🕯️ 📔 📕 📗 📘 📙 📚 📝 ✏️ 🖊️ 🖌️ 📌 📎 ✂️ 📏 📐 🔒 🔑 🔨 🪓 🔧 🔩 ⚙️ 🧲 🧪 🔬 🔭 🧵 🧶 🧹 🧺 🎁 🎈 🎀".split(" "),
  symbols: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 ⭐ 🌟 ✨ ⚡ 🔥 💧 🌈 ☀️ 🌙 ☁️ ❄️ 🍀 🌸 🌼 🌺 🌻 🌹 🎵 🎶 ✅ ❌ ❓ ❗ 💯 🔔 🔆 ♻️ 🔱 🎯 🏆 🥇 🥈 🥉".split(" "),
};
function RandomEmojiGenerator() {
  const [cat, setCat] = useState("all");
  const [count, setCount] = useState("5");
  const [out, setOut] = useState(null);
  const generate = () => {
    const pool = cat === "all" ? Object.values(EMOJI_BANK).flat() : (EMOJI_BANK[cat] || []);
    if (!pool.length) { setOut([]); return; }
    const n = Math.max(1, Math.min(200, parseInt(count) || 1));
    setOut(Array.from({ length: n }, () => pool[secureRandom(pool.length)]));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Category</Label><SelectInput value={cat} onChange={setCat} options={[["all","All categories"],["faces","Smileys & faces"],["animals","Animals"],["food","Food & drink"],["activities","Activities & sport"],["travel","Travel & places"],["objects","Objects"],["symbols","Symbols & nature"]]} style={{ width:"100%" }} /></div>
        <div><Label>How Many (1–200)</Label><Input value={count} onChange={setCount} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>😀 Generate Emoji</button>
      {out && out.length > 0 && (
        <>
          <div style={{ textAlign:"center", padding:"22px 16px", background:"rgba(244,63,94,0.06)", border:`1px solid ${C.border}`, borderRadius:12, fontSize:out.length > 30 ? 24 : 34, lineHeight:1.5, wordBreak:"break-word" }}>
            {out.join(" ")}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={out.join(" ")} /></div>
        </>
      )}
      {out && out.length === 0 && <Result mono={false}>That category is empty — choose another category.</Result>}
    </VStack>
  );
}

function RandomBinaryGenerator() {
  const [base, setBase] = useState("2");
  const [len, setLen] = useState("32");
  const [group, setGroup] = useState("8");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const generate = () => {
    const b = parseInt(base) || 2;
    const n = parseInt(len);
    if (isNaN(n) || n < 1) { setErr("Enter a length of at least 1 character."); setOut(null); return; }
    setErr(null);
    const digits = "0123456789ABCDEF".slice(0, b);
    const size = Math.min(4096, n);
    let s = "";
    for (let i = 0; i < size; i++) s += digits[secureRandom(b)];
    setOut(s);
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  const grouped = (() => {
    if (!out) return "";
    const g = parseInt(group) || 0;
    if (!g) return out;
    return out.match(new RegExp(`.{1,${g}}`, "g")).join(" ");
  })();
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Base</Label><SelectInput value={base} onChange={setBase} options={[["2","Binary (0–1)"],["8","Octal (0–7)"],["10","Decimal (0–9)"],["16","Hexadecimal (0–F)"]]} style={{ width:"100%" }} /></div>
        <div><Label>Length (1–4096)</Label><Input value={len} onChange={setLen} /></div>
        <div><Label>Grouping</Label><SelectInput value={group} onChange={setGroup} options={[["0","None"],["4","Every 4 characters"],["8","Every 8 characters"]]} style={{ width:"100%" }} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>⚙️ Generate String</button>
      {err && <Result mono={false}>{err}</Result>}
      {out && (
        <>
          <Result>{grouped}</Result>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
            <CopyBtn text={grouped} /><CopyBtn text={out} style={{ opacity:0.85 }} />
          </div>
          <Result mono={false}>Left button copies the grouped form, right button copies the unbroken string. Use these as test data, not as production keys.</Result>
        </>
      )}
    </VStack>
  );
}

const DOC_V4_BLOCKS = [[192, 0, 2], [198, 51, 100], [203, 0, 113]];
function RandomIpGenerator() {
  const [ver, setVer] = useState("v4");
  const [range, setRange] = useState("doc");
  const [count, setCount] = useState("5");
  const [ips, setIps] = useState(null);
  const hex4 = () => Array.from({ length: 4 }, () => "0123456789abcdef"[secureRandom(16)]).join("");
  const makeOne = () => {
    if (ver === "v6") {
      if (range === "private") return "fd" + hex4().slice(0, 2) + ":" + Array.from({ length: 4 }, hex4).join(":") + ":" + hex4();
      return "2001:db8:" + Array.from({ length: 5 }, hex4).join(":");
    }
    if (range === "private") {
      const which = secureRandom(3);
      if (which === 0) return `10.${secureRandom(256)}.${secureRandom(256)}.${1 + secureRandom(254)}`;
      if (which === 1) return `172.${16 + secureRandom(16)}.${secureRandom(256)}.${1 + secureRandom(254)}`;
      return `192.168.${secureRandom(256)}.${1 + secureRandom(254)}`;
    }
    const b = DOC_V4_BLOCKS[secureRandom(DOC_V4_BLOCKS.length)];
    return `${b[0]}.${b[1]}.${b[2]}.${1 + secureRandom(254)}`;
  };
  const generate = () => {
    const n = Math.max(1, Math.min(500, parseInt(count) || 1));
    setIps(Array.from({ length: n }, makeOne));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>IP Version</Label><SelectInput value={ver} onChange={setVer} options={[["v4","IPv4"],["v6","IPv6"]]} style={{ width:"100%" }} /></div>
        <div><Label>Address Range</Label><SelectInput value={range} onChange={setRange} options={[["doc","Documentation (safe to publish)"],["private","Private / LAN style"]]} style={{ width:"100%" }} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🌐 Generate Addresses</button>
      {ips && (
        <>
          <Result>{ips.join("\n")}</Result>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={ips.join("\n")} /></div>
          <Result mono={false}>These come from reserved documentation blocks (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32) or private ranges, so they never point at somebody's real server.</Result>
        </>
      )}
    </VStack>
  );
}

// mulberry32 — small, fast, fully deterministic PRNG.
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const seedFromString = (str) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
};
function SeededRandomGenerator() {
  const [seed, setSeed] = useState("toolsrift-2026");
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("10");
  const [out, setOut] = useState(null);
  const [usedSeed, setUsedSeed] = useState(null);
  const [err, setErr] = useState(null);
  const randomiseSeed = () => setSeed(String(100000 + secureRandom(900000)));
  const generate = () => {
    const s = (seed || "").trim();
    let lo = parseInt(min), hi = parseInt(max);
    const n = Math.max(1, Math.min(1000, parseInt(count) || 1));
    if (!s) { setErr("Enter a seed — any word or number will do."); setOut(null); return; }
    if (isNaN(lo) || isNaN(hi)) { setErr("Enter valid minimum and maximum numbers."); setOut(null); return; }
    if (lo > hi) [lo, hi] = [hi, lo];
    setErr(null);
    let state = seedFromString(s);
    const nums = [];
    for (let i = 0; i < n; i++) {
      const r = mulberry32(state)();
      state = (state + 0x6D2B79F5) | 0;
      nums.push(lo + Math.floor(r * (hi - lo + 1)));
    }
    setUsedSeed(s);
    setOut(nums);
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <div>
        <Label>Seed</Label>
        <div style={{ display:"flex", gap:8 }}>
          <Input value={seed} onChange={setSeed} placeholder="any word or number" />
          <Btn variant="secondary" size="sm" onClick={randomiseSeed} style={{ flexShrink:0 }}>🎲 Random</Btn>
        </div>
      </div>
      <Grid3>
        <div><Label>Minimum</Label><Input value={min} onChange={setMin} /></div>
        <div><Label>Maximum</Label><Input value={max} onChange={setMax} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🌱 Generate From Seed</button>
      {err && <Result mono={false}>{err}</Result>}
      {out && (
        <>
          <div style={{ padding:"10px 14px", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:10, fontSize:13, color:C.text }}>
            Seed used: <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:C.accent }}>{usedSeed}</span> — re-enter this seed with the same range and count to reproduce the exact same sequence.
          </div>
          <Result>{out.join(", ")}</Result>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={`seed: ${usedSeed}\n${out.join(", ")}`} /></div>
          <Result mono={false}>Seeded sequences are reproducible by design, which also makes them predictable. Never use them for passwords or keys.</Result>
        </>
      )}
    </VStack>
  );
}

function RandomGroupAssigner() {
  const [people, setPeople] = useState("Aarav\nDiya\nRahul\nSneha\nVikram\nPriya\nArjun\nMeera\nKabir\nAnaya\nRohan\nIsha");
  const [groups, setGroups] = useState("Red\nBlue\nGreen");
  const [assigned, setAssigned] = useState(null);
  const pList = people.split("\n").map(s => s.trim()).filter(Boolean);
  const gList = groups.split("\n").map(s => s.trim()).filter(Boolean);
  const assign = () => {
    if (!pList.length || !gList.length) { setAssigned(null); return; }
    const buckets = gList.map(name => ({ name, members: [] }));
    shuffle(pList).forEach((p, i) => buckets[i % buckets.length].members.push(p));
    setAssigned(buckets);
  };
  const copyText = assigned ? assigned.map(b => `${b.name} (${b.members.length}): ${b.members.join(", ")}`).join("\n") : "";
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>People or Items — one per line ({pList.length})</Label><Textarea value={people} onChange={setPeople} rows={9} /></div>
        <div><Label>Group Names — one per line ({gList.length})</Label><Textarea value={groups} onChange={setGroups} rows={9} /></div>
      </Grid2>
      <button onClick={assign} disabled={!pList.length || !gList.length} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center", opacity: (!pList.length || !gList.length) ? 0.55 : 1 }}>🗂️ Assign Groups</button>
      {(!pList.length || !gList.length) && <Result mono={false}>Add at least one person and at least one group name to make an assignment.</Result>}
      {assigned && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {assigned.map((b, i) => (
              <div key={i} style={{ background:C.surface, border:`1px solid ${WHEEL_COLORS[i % WHEEL_COLORS.length]}55`, borderRadius:12, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:800, fontFamily:"'Sora',sans-serif", color:WHEEL_COLORS[i % WHEEL_COLORS.length], marginBottom:10, textTransform:"uppercase", letterSpacing:"0.04em" }}>{b.name} · {b.members.length}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {b.members.length ? b.members.map((m, j) => <div key={j} style={{ fontSize:14, color:C.text }}>{m}</div>) : <div style={{ fontSize:13, color:C.muted }}>— empty —</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
    </VStack>
  );
}

function ListShuffler() {
  const [text, setText] = useState("Apples\nBananas\nCherries\nDates\nElderberries\nFigs\nGrapes");
  const [numbered, setNumbered] = useState("no");
  const [dedupe, setDedupe] = useState("no");
  const [out, setOut] = useState(null);
  const shuffleIt = () => {
    let list = text.split("\n").map(s => s.trim()).filter(Boolean);
    if (dedupe === "yes") list = Array.from(new Set(list));
    if (!list.length) { setOut([]); return; }
    setOut(shuffle(list));
  };
  const rendered = out ? out.map((x, i) => numbered === "yes" ? `${i + 1}. ${x}` : x).join("\n") : "";
  return (
    <VStack gap={16}>
      <div><Label>Your List — one item per line</Label><Textarea value={text} onChange={setText} rows={9} placeholder="Paste one item per line..." /></div>
      <Grid2>
        <div><Label>Number the Output</Label><SelectInput value={numbered} onChange={setNumbered} options={[["no","No"],["yes","Yes — 1. 2. 3."]]} style={{ width:"100%" }} /></div>
        <div><Label>Remove Duplicates</Label><SelectInput value={dedupe} onChange={setDedupe} options={[["no","No — keep every line"],["yes","Yes — collapse duplicates"]]} style={{ width:"100%" }} /></div>
      </Grid2>
      <button onClick={shuffleIt} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🔀 Shuffle List</button>
      {out && out.length > 0 && (
        <>
          <div><Label>Shuffled ({out.length} items)</Label><Result>{rendered}</Result></div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={rendered} /></div>
        </>
      )}
      {out && out.length === 0 && <Result mono={false}>Your list is empty — paste at least one line to shuffle.</Result>}
    </VStack>
  );
}

function WeightedRandomPicker() {
  const [text, setText] = useState("Alice, 3\nBob, 1\nCharlie, 2\nDiana, 4");
  const [winner, setWinner] = useState(null);
  const parsed = text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const m = line.match(/^(.*?)[,|]\s*(\d+(?:\.\d+)?)\s*$/);
    if (m && parseFloat(m[2]) > 0) return { name: m[1].trim() || line, weight: parseFloat(m[2]) };
    return { name: line, weight: 1 };
  }).filter(o => o.name);
  const total = parsed.reduce((a, o) => a + o.weight, 0);
  const pick = () => {
    if (!parsed.length || total <= 0) { setWinner(null); return; }
    // 4 decimal places of resolution is plenty for weights typed by hand
    const point = secureRandom(Math.round(total * 10000)) / 10000;
    let acc = 0, chosen = parsed[parsed.length - 1].name;
    for (const o of parsed) { acc += o.weight; if (point < acc) { chosen = o.name; break; } }
    setWinner(chosen);
  };
  return (
    <VStack gap={16}>
      <div><Label>Options — one per line as "Name, weight"</Label><Textarea value={text} onChange={setText} rows={8} placeholder={"Alice, 3\nBob, 1"} /></div>
      {parsed.length > 0 ? (
        <DataTable columns={["Option", "Weight", "Chance"]} rows={parsed.map(o => [o.name, o.weight, ((o.weight / total) * 100).toFixed(2) + "%"])} />
      ) : (
        <Result mono={false}>Add at least one option. Write each line as "Name, weight" — a line with no weight counts as 1.</Result>
      )}
      <button onClick={pick} disabled={!parsed.length} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center", opacity: parsed.length ? 1 : 0.55 }}>⚖️ Pick Winner</button>
      {winner && (
        <div style={{ textAlign:"center", padding:"24px 20px", background:"rgba(244,63,94,0.08)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:14 }}>
          <div style={{ ...T.label, marginBottom:6 }}>🏅 Winner</div>
          <div style={{ fontSize:"clamp(24px,6vw,38px)", fontWeight:800, fontFamily:"'Sora',sans-serif", color:C.accent }}>{winner}</div>
          <div style={{ marginTop:10 }}><CopyBtn text={winner} /></div>
        </div>
      )}
    </VStack>
  );
}

function RandomLinePicker() {
  const [text, setText] = useState("First line\nSecond line\nThird line\nFourth line\nFifth line\nSixth line");
  const [count, setCount] = useState("2");
  const [repeats, setRepeats] = useState("no");
  const [skipBlank, setSkipBlank] = useState("yes");
  const [picked, setPicked] = useState(null);
  const pickLines = () => {
    let lines = text.split("\n");
    if (skipBlank === "yes") lines = lines.filter(l => l.trim() !== "");
    if (!lines.length) { setPicked([]); return; }
    let n = Math.max(1, Math.min(1000, parseInt(count) || 1));
    if (repeats === "no") {
      n = Math.min(n, lines.length);
      setPicked(shuffle(lines).slice(0, n));
    } else {
      setPicked(Array.from({ length: n }, () => lines[secureRandom(lines.length)]));
    }
  };
  return (
    <VStack gap={16}>
      <div><Label>Your Text — one item per line</Label><Textarea value={text} onChange={setText} rows={9} /></div>
      <Grid3>
        <div><Label>How Many Lines</Label><Input value={count} onChange={setCount} /></div>
        <div><Label>Allow Repeats</Label><SelectInput value={repeats} onChange={setRepeats} options={[["no","No — each line once"],["yes","Yes — repeats allowed"]]} style={{ width:"100%" }} /></div>
        <div><Label>Blank Lines</Label><SelectInput value={skipBlank} onChange={setSkipBlank} options={[["yes","Ignore blank lines"],["no","Include blank lines"]]} style={{ width:"100%" }} /></div>
      </Grid3>
      <button onClick={pickLines} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>📃 Pick Lines</button>
      {picked && picked.length > 0 && (
        <>
          <div><Label>Selected ({picked.length})</Label><Result>{picked.join("\n")}</Result></div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={picked.join("\n")} /></div>
        </>
      )}
      {picked && picked.length === 0 && <Result mono={false}>There are no lines to pick from — paste some text above first.</Result>}
    </VStack>
  );
}

function RandomWordGenerator() {
  const [type, setType] = useState("all");
  const [maxLen, setMaxLen] = useState("0");
  const [count, setCount] = useState("5");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const generate = () => {
    let pool = type === "noun" ? WORD_NOUNS : type === "verb" ? WORD_VERBS : type === "adj" ? WORD_ADJS : WORD_NOUNS.concat(WORD_VERBS, WORD_ADJS);
    const ml = parseInt(maxLen) || 0;
    if (ml > 0) pool = pool.filter(w => w.length <= ml);
    if (!pool.length) { setErr(`No words match that filter — try a longer maximum length than ${ml}.`); setOut(null); return; }
    setErr(null);
    const n = Math.max(1, Math.min(300, parseInt(count) || 1));
    setOut(Array.from({ length: n }, () => pool[secureRandom(pool.length)]));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  const bankSize = WORD_NOUNS.length + WORD_VERBS.length + WORD_ADJS.length;
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Word Type</Label><SelectInput value={type} onChange={setType} options={[["all","All types"],["noun","Nouns"],["verb","Verbs"],["adj","Adjectives"]]} style={{ width:"100%" }} /></div>
        <div><Label>Max Length (0 = any)</Label><Input value={maxLen} onChange={setMaxLen} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>📖 Generate Words</button>
      {err && <Result mono={false}>{err}</Result>}
      {out && (
        <>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
            {out.map((w, i) => (
              <span key={i} style={{ padding:"9px 16px", borderRadius:20, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", fontSize:15, fontWeight:600, color:C.text }}>{w}</span>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>Drawn from a built-in bank of {bankSize} English words.</span>
            <CopyBtn text={out.join(", ")} />
          </div>
        </>
      )}
    </VStack>
  );
}

function RandomLetterSequence() {
  const [mode, setMode] = useState("cvc");
  const [len, setLen] = useState("5");
  const [pattern, setPattern] = useState("CVC");
  const [count, setCount] = useState("6");
  const [out, setOut] = useState(null);
  const [err, setErr] = useState(null);
  const lowerV = "aeiou", lowerC = "bcdfghjklmnpqrstvwxyz", all = "abcdefghijklmnopqrstuvwxyz";
  const generate = () => {
    const n = Math.max(1, Math.min(200, parseInt(count) || 1));
    if (mode === "letters") {
      const L = Math.max(1, Math.min(40, parseInt(len) || 1));
      setErr(null);
      setOut(Array.from({ length: n }, () => Array.from({ length: L }, () => all[secureRandom(26)]).join("")));
      return;
    }
    const p = (pattern || "").toUpperCase().replace(/[^CV]/g, "");
    if (!p) { setErr("Enter a pattern made of C (consonant) and V (vowel), for example CVC or CVCV."); setOut(null); return; }
    setErr(null);
    setOut(Array.from({ length: n }, () =>
      p.split("").map(ch => ch === "V" ? lowerV[secureRandom(lowerV.length)] : lowerC[secureRandom(lowerC.length)]).join("")
    ));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} options={[["cvc","Consonant / vowel pattern"],["letters","Random letters"]]} style={{ width:"100%" }} /></div>
        {mode === "letters"
          ? <div><Label>Length (1–40)</Label><Input value={len} onChange={setLen} /></div>
          : <div><Label>Pattern (C and V)</Label><Input value={pattern} onChange={setPattern} placeholder="CVC" /></div>}
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🔡 Generate Sequences</button>
      {err && <Result mono={false}>{err}</Result>}
      {out && (
        <>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center" }}>
            {out.map((s, i) => (
              <span key={i} style={{ padding:"10px 16px", borderRadius:10, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", fontFamily:"'JetBrains Mono',monospace", fontSize:17, fontWeight:700, color:C.text, letterSpacing:"0.05em" }}>{s}</span>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={out.join("\n")} /></div>
        </>
      )}
    </VStack>
  );
}

const SENTENCE_TEMPLATES = [
  "The {adj} {noun} {verbs} the {adj} {noun}.",
  "A {adj} {noun} quietly {verbs} beside the {noun}.",
  "Every morning the {noun} {verbs} while the {adj} {noun} waits.",
  "When the {noun} {verbs}, the {adj} {noun} follows without a sound.",
  "Somewhere beyond the {adj} {noun}, a {noun} began to {verb}.",
  "The {noun} decided to {verb} before the {adj} {noun} arrived.",
  "Under a {adj} sky the {noun} {verbs} with surprising patience.",
  "Nobody expected the {adj} {noun} to {verb} quite so early.",
];
const conjugate = (v) => (/(s|sh|ch|x|z|o)$/.test(v) ? v + "es" : /[^aeiou]y$/.test(v) ? v.slice(0, -1) + "ies" : v + "s");
function RandomSentenceGenerator() {
  const [count, setCount] = useState("3");
  const [out, setOut] = useState(null);
  const pickFrom = (arr) => arr[secureRandom(arr.length)];
  const build = () => {
    const t = pickFrom(SENTENCE_TEMPLATES);
    let s = t.replace(/\{(adj|noun|verbs|verb)\}/g, (_, k) => {
      if (k === "adj") return pickFrom(WORD_ADJS);
      if (k === "noun") return pickFrom(WORD_NOUNS);
      if (k === "verbs") return conjugate(pickFrom(WORD_VERBS));
      return pickFrom(WORD_VERBS);
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
  const generate = () => {
    const n = Math.max(1, Math.min(50, parseInt(count) || 1));
    setOut(Array.from({ length: n }, build));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>How Many Sentences (1–50)</Label><Input value={count} onChange={setCount} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}>
          <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width:"100%" }}>✍️ Generate Sentences</button>
        </div>
      </Grid2>
      {out && (
        <>
          <VStack gap={10}>
            {out.map((s, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", fontSize:15, lineHeight:1.6, color:C.text }}>{s}</div>
            ))}
          </VStack>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={out.join("\n")} /></div>
        </>
      )}
    </VStack>
  );
}

const QUESTION_BANK = {
  icebreaker: [
    "What is the best meal you have eaten in the last month?",
    "If you could instantly master one skill, what would it be?",
    "What is your go-to karaoke or shower song?",
    "Are you a morning person or a night owl, and why?",
    "What is the last photo you took on your phone?",
    "Which season suits you best?",
    "What small thing always improves your day?",
    "Tea, coffee or something else entirely?",
    "What is the most useful app on your phone right now?",
    "If your week had a theme song, what would it be?",
    "What is your favourite way to spend a rainy afternoon?",
    "Which city would you happily visit again?",
    "What is one food you could eat every single week?",
    "Do you prefer the mountains or the sea?",
    "What was your first job?",
    "What is a hobby you had as a child?",
    "Which board game or card game do you actually enjoy?",
    "What is the best piece of advice you were given at work?",
    "If you had an extra hour every day, how would you use it?",
    "What is something you are looking forward to this month?",
    "Which fictional place would you most like to visit?",
  ],
  deep: [
    "What does a genuinely good day look like for you?",
    "Which person outside your family shaped who you are?",
    "What belief have you changed your mind about?",
    "What are you most proud of that nobody knows about?",
    "What does success mean to you right now?",
    "Which mistake taught you the most?",
    "What would you tell your fifteen-year-old self?",
    "What kind of work makes you lose track of time?",
    "When do you feel most like yourself?",
    "What is a fear you have grown out of?",
    "Which habit has changed your life the most?",
    "What do you wish more people understood about you?",
    "How do you like to be supported when things are hard?",
    "What is something you are still learning?",
    "Which compliment has stayed with you?",
    "What would you do differently if nobody were watching?",
    "How has your definition of home changed over time?",
    "What is worth being patient for?",
    "Which decision are you glad you made?",
    "What do you want to be known for?",
    "What is a tradition you want to keep?",
  ],
  fun: [
    "If animals could talk, which would be the rudest?",
    "What is the strangest thing you have ever eaten?",
    "Which fictional character would be a nightmare housemate?",
    "If you had to be a kitchen appliance, which one?",
    "What is your completely unnecessary but genuine talent?",
    "Which emoji do you overuse?",
    "What would your reality show be called?",
    "If you had a personal theme tune, what plays?",
    "What is the worst haircut you have had?",
    "Which snack would you defend in a debate?",
    "If you could rename a colour, which and what?",
    "What would you put on a billboard for a day?",
    "Which everyday object deserves a better name?",
    "What is the most useless fact you remember?",
    "If you opened a café, what would it be called?",
    "What is your most irrational pet peeve?",
    "Which historical figure would be great at karaoke?",
    "What is the best pun you have heard?",
    "If you were a biscuit, which biscuit?",
    "What is the silliest thing that made you laugh recently?",
    "Which chore would you happily delegate forever?",
  ],
  reflective: [
    "What went better than expected this week?",
    "Which task have you been avoiding, and why?",
    "What are you grateful for today?",
    "What drained your energy this week?",
    "Which small win deserves more credit?",
    "What is one thing you would repeat from last month?",
    "Where did you spend your attention most?",
    "What feedback have you not acted on yet?",
    "Which relationship deserves more of your time?",
    "What would make next week 10% easier?",
    "What did you learn the hard way recently?",
    "Which commitment could you let go of?",
    "What is the kindest thing you did lately?",
    "Where are you being too hard on yourself?",
    "What system or routine is actually working?",
    "Which goal has quietly gone stale?",
    "What has surprised you about this year?",
    "Who deserves a thank-you message from you?",
    "What is one boundary worth protecting?",
    "What would you like to have finished by next month?",
    "Which question are you sitting with right now?",
  ],
};
function RandomQuestionGenerator() {
  const [style, setStyle] = useState("all");
  const [count, setCount] = useState("1");
  const [out, setOut] = useState(null);
  const generate = () => {
    const pool = style === "all" ? Object.values(QUESTION_BANK).flat() : (QUESTION_BANK[style] || []);
    if (!pool.length) { setOut([]); return; }
    const n = Math.max(1, Math.min(pool.length, parseInt(count) || 1));
    setOut(shuffle(pool).slice(0, n));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  const bankSize = Object.values(QUESTION_BANK).flat().length;
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Question Style</Label><SelectInput value={style} onChange={setStyle} options={[["all","All styles"],["icebreaker","Light icebreakers"],["deep","Get to know you"],["fun","Fun & silly"],["reflective","Reflective prompts"]]} style={{ width:"100%" }} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>❓ Draw Questions</button>
      {out && out.length > 0 && (
        <>
          <VStack gap={10}>
            {out.map((q, i) => (
              <div key={i} style={{ background:"rgba(244,63,94,0.06)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:12, padding:"16px 18px", fontSize:16, lineHeight:1.55, color:C.text }}>{q}</div>
            ))}
          </VStack>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{bankSize} questions in the bank.</span>
            <CopyBtn text={out.join("\n")} />
          </div>
        </>
      )}
      {out && out.length === 0 && <Result mono={false}>No questions match that style — choose another style.</Result>}
    </VStack>
  );
}

const WYR_BANK = [
  "Would you rather be able to fly or be invisible?",
  "Would you rather always be 10 minutes early or 20 minutes late?",
  "Would you rather live by the sea or in the mountains?",
  "Would you rather have unlimited books or unlimited films?",
  "Would you rather speak every language or play every instrument?",
  "Would you rather explore space or the deep ocean?",
  "Would you rather have a pet dragon or a talking dog?",
  "Would you rather it always be sunny or always be snowy?",
  "Would you rather eat only pizza or only pasta for a year?",
  "Would you rather have a personal chef or a personal driver?",
  "Would you rather travel to the past or to the future?",
  "Would you rather be famous for singing or for inventing?",
  "Would you rather have super speed or super strength?",
  "Would you rather live in a treehouse or in a lighthouse?",
  "Would you rather always know the weather or always know the time to the second?",
  "Would you rather be great at maths or great at drawing?",
  "Would you rather have a robot helper or a flying bicycle?",
  "Would you rather never lose your keys or never lose your phone?",
  "Would you rather read minds or see one minute into the future?",
  "Would you rather live without music or without television?",
  "Would you rather have breakfast for every meal or dessert for every meal?",
  "Would you rather be able to talk to animals or to plants?",
  "Would you rather go camping or stay in a fancy hotel?",
  "Would you rather have a photographic memory or perfect directions sense?",
  "Would you rather write a famous book or direct a famous film?",
  "Would you rather have summer all year or autumn all year?",
  "Would you rather be the funniest person or the smartest person in the room?",
  "Would you rather ride a horse to work or ride a hot air balloon?",
  "Would you rather have free travel forever or free food forever?",
  "Would you rather be able to pause time or rewind five minutes?",
  "Would you rather own a bookshop or own a bakery?",
  "Would you rather have a garden that never needs weeding or a room that tidies itself?",
  "Would you rather learn every recipe or learn every card trick?",
  "Would you rather live in a city with no cars or a village with no shops?",
  "Would you rather always have perfect hair or always have comfortable shoes?",
  "Would you rather be a brilliant painter or a brilliant dancer?",
  "Would you rather have a treehouse office or an office on a boat?",
  "Would you rather never feel cold or never feel too hot?",
  "Would you rather have a pet parrot that repeats everything or a cat that ignores you?",
  "Would you rather win a quiz show or win a baking contest?",
  "Would you rather have an extra hour of sleep or an extra hour of free time?",
  "Would you rather visit every country once or one country every year?",
  "Would you rather be able to breathe underwater or walk through walls?",
  "Would you rather have a library in your home or a cinema in your home?",
  "Would you rather always take the scenic route or always take the fastest route?",
  "Would you rather grow all your own vegetables or bake all your own bread?",
  "Would you rather be an astronaut for a week or a marine biologist for a year?",
  "Would you rather have handwriting like calligraphy or a singing voice like a choir?",
  "Would you rather your shoes always be dry or your bag never be heavy?",
  "Would you rather learn to juggle or learn to whistle any tune?",
  "Would you rather live in a house made of glass or a house underground?",
  "Would you rather have a magic notebook that never runs out or a pen that writes any colour?",
  "Would you rather remember every dream or never need an alarm clock?",
  "Would you rather be the captain of a team or the coach of a team?",
  "Would you rather picnic in a forest or picnic on a beach?",
  "Would you rather have a talent for chess or a talent for tennis?",
  "Would you rather always find the perfect parking spot or the perfect seat on a train?",
  "Would you rather be able to name every star or every bird?",
  "Would you rather receive a handwritten letter every week or a surprise parcel every month?",
  "Would you rather live in a lively neighbourhood or a very quiet one?",
  "Would you rather have a garden pond or a garden treehouse?",
  "Would you rather taste every spice in a dish or hear every instrument in a song?",
  "Would you rather work four long days or five short days?",
  "Would you rather be brilliant at one thing or good at twenty things?",
];
function WouldYouRatherGenerator() {
  const [q, setQ] = useState(null);
  const draw = () => setQ(WYR_BANK[secureRandom(WYR_BANK.length)]);
  useEffect(() => { draw(); }, []); // eslint-disable-line
  return (
    <VStack gap={18}>
      <div style={{ textAlign:"center", padding:"30px 22px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:16, minHeight:120, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:"clamp(17px,3.6vw,24px)", fontWeight:700, fontFamily:"'Sora',sans-serif", color:C.text, lineHeight:1.5 }}>{q || "Press the button for a dilemma"}</div>
      </div>
      <button onClick={draw} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🤔 Next Dilemma</button>
      {q && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:12, color:C.muted }}>{WYR_BANK.length} family-friendly dilemmas in the bank.</span>
          <CopyBtn text={q} />
        </div>
      )}
    </VStack>
  );
}

const CHARADES_BANK = {
  movies: {
    easy: ["Frozen","The Lion King","Toy Story","Finding Nemo","Harry Potter","Star Wars","Spider-Man","Jurassic Park","Kung Fu Panda","Shrek","Cinderella","Peter Pan","The Jungle Book"],
    medium: ["Titanic","Jaws","Indiana Jones","The Wizard of Oz","Back to the Future","Home Alone","The Sound of Music","Mary Poppins","Ghostbusters","The Karate Kid","Night at the Museum","Ice Age","The Princess Bride"],
    hard: ["Inception","The Matrix","Forrest Gump","The Truman Show","Groundhog Day","Cast Away","The Great Escape","Life of Pi","A Beautiful Mind","The Prestige","Interstellar","The Grand Budapest Hotel","Twelve Angry Men"],
  },
  animals: {
    easy: ["Cat","Dog","Rabbit","Elephant","Monkey","Snake","Frog","Duck","Cow","Horse","Fish","Bird","Bee"],
    medium: ["Kangaroo","Penguin","Giraffe","Crab","Octopus","Owl","Gorilla","Camel","Flamingo","Squirrel","Hedgehog","Dolphin","Woodpecker"],
    hard: ["Chameleon","Platypus","Sloth","Praying mantis","Meerkat","Pufferfish","Jellyfish","Anteater","Seahorse","Armadillo","Peacock","Walrus","Stick insect"],
  },
  actions: {
    easy: ["Brushing your teeth","Tying shoelaces","Waving goodbye","Drinking water","Reading a book","Sweeping the floor","Clapping","Sleeping","Skipping with a rope","Typing","Taking a photo","Eating soup","Combing your hair"],
    medium: ["Riding a bicycle","Painting a wall","Fishing","Playing the guitar","Doing yoga","Packing a suitcase","Washing a car","Flying a kite","Making a sandwich","Planting a tree","Ice skating","Rowing a boat","Blowing up a balloon"],
    hard: ["Conducting an orchestra","Threading a needle","Juggling","Doing a magic trick","Assembling flat-pack furniture","Walking against strong wind","Building a sandcastle","Solving a Rubik's cube","Herding sheep","Reading a giant map","Kneading bread dough","Wrapping an awkward present","Miming being in a lift"],
  },
  jobs: {
    easy: ["Teacher","Doctor","Chef","Firefighter","Police officer","Farmer","Painter","Singer","Bus driver","Nurse","Barber","Cleaner","Postal worker"],
    medium: ["Dentist","Photographer","Mechanic","Librarian","Pilot","Carpenter","Gardener","Lifeguard","Tailor","Baker","Referee","Electrician","Waiter"],
    hard: ["Archaeologist","Air traffic controller","Sign language interpreter","Marine biologist","Locksmith","Sound engineer","Glassblower","Cartographer","Beekeeper","Puppeteer","Meteorologist","Ventriloquist","Watchmaker"],
  },
};
const CHARADES_THEME_LABELS = { movies:"Movies & shows", animals:"Animals", actions:"Actions", jobs:"Jobs" };
function RandomCharadesGenerator() {
  const [theme, setTheme] = useState("all");
  const [level, setLevel] = useState("all");
  const [timerLen, setTimerLen] = useState("0");
  const [prompt, setPrompt] = useState(null);
  const [left, setLeft] = useState(0);
  const tickRef = useRef(null);
  useEffect(() => () => clearInterval(tickRef.current), []);
  useEffect(() => {
    if (left <= 0) { clearInterval(tickRef.current); return; }
  }, [left]);
  const buildPool = () => {
    const themes = theme === "all" ? Object.keys(CHARADES_BANK) : [theme];
    const levels = level === "all" ? ["easy", "medium", "hard"] : [level];
    const pool = [];
    themes.forEach(t => levels.forEach(l => (CHARADES_BANK[t][l] || []).forEach(p => pool.push({ text: p, theme: t, level: l }))));
    return pool;
  };
  const totalPrompts = Object.values(CHARADES_BANK).reduce((a, t) => a + t.easy.length + t.medium.length + t.hard.length, 0);
  const draw = () => {
    const pool = buildPool();
    if (!pool.length) { setPrompt(null); return; }
    setPrompt(pool[secureRandom(pool.length)]);
    clearInterval(tickRef.current);
    const secs = parseInt(timerLen) || 0;
    setLeft(secs);
    if (secs > 0) {
      tickRef.current = setInterval(() => {
        setLeft(v => {
          if (v <= 1) { clearInterval(tickRef.current); return 0; }
          return v - 1;
        });
      }, 1000);
    }
  };
  const secs = parseInt(timerLen) || 0;
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Theme</Label><SelectInput value={theme} onChange={setTheme} options={[["all","All themes"],["movies","Movies & shows"],["animals","Animals"],["actions","Actions"],["jobs","Jobs"]]} style={{ width:"100%" }} /></div>
        <div><Label>Difficulty</Label><SelectInput value={level} onChange={setLevel} options={[["all","Any difficulty"],["easy","Easy"],["medium","Medium"],["hard","Hard"]]} style={{ width:"100%" }} /></div>
        <div><Label>Countdown Timer</Label><SelectInput value={timerLen} onChange={setTimerLen} options={[["0","Off"],["30","30 seconds"],["60","60 seconds"],["90","90 seconds"]]} style={{ width:"100%" }} /></div>
      </Grid3>
      <div style={{ textAlign:"center", padding:"30px 22px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:16, minHeight:130 }}>
        {prompt ? (
          <>
            <div style={{ fontSize:"clamp(22px,5vw,34px)", fontWeight:800, fontFamily:"'Sora',sans-serif", color:C.text, lineHeight:1.35 }}>{prompt.text}</div>
            <div style={{ marginTop:10, display:"flex", gap:8, justifyContent:"center" }}>
              <Badge color="rose">{CHARADES_THEME_LABELS[prompt.theme]}</Badge>
              <Badge color={prompt.level === "easy" ? "green" : prompt.level === "medium" ? "amber" : "red"}>{prompt.level}</Badge>
            </div>
          </>
        ) : (
          <div style={{ fontSize:16, color:C.muted, paddingTop:20 }}>Press Draw Next for your first charades prompt.</div>
        )}
      </div>
      {secs > 0 && prompt && (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:40, fontWeight:800, color: left === 0 ? C.danger : C.accent }}>{left === 0 ? "Time!" : `${left}s`}</div>
          <div style={{ height:8, borderRadius:4, background:"rgba(255,255,255,0.06)", overflow:"hidden", marginTop:8 }}>
            <div style={{ height:"100%", width:`${(left / secs) * 100}%`, background:`linear-gradient(90deg,${C.accent},${C.accentD})`, transition:"width 1s linear" }} />
          </div>
        </div>
      )}
      <button onClick={draw} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🎭 Draw Next Prompt</button>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:C.muted }}>{totalPrompts} prompts across four themes and three difficulty levels.</span>
        {prompt && <CopyBtn text={prompt.text} />}
      </div>
    </VStack>
  );
}

const TRIVIA_BANK = [
  { cat:"science", q:"What gas do plants absorb from the air for photosynthesis?", a:"Carbon dioxide" },
  { cat:"science", q:"What is the chemical symbol for gold?", a:"Au" },
  { cat:"science", q:"How many bones are there in the adult human body?", a:"206" },
  { cat:"science", q:"Which planet is known as the Red Planet?", a:"Mars" },
  { cat:"science", q:"What is the hardest naturally occurring substance?", a:"Diamond" },
  { cat:"science", q:"Which force keeps the planets in orbit around the Sun?", a:"Gravity" },
  { cat:"science", q:"At sea level, what is the boiling point of water in Celsius?", a:"100 degrees Celsius" },
  { cat:"science", q:"Which part of a human cell contains most of its DNA?", a:"The nucleus" },
  { cat:"science", q:"What is the most abundant gas in Earth's atmosphere?", a:"Nitrogen" },
  { cat:"science", q:"What does DNA stand for?", a:"Deoxyribonucleic acid" },
  { cat:"science", q:"Which scientist published the theory of general relativity?", a:"Albert Einstein" },
  { cat:"science", q:"What is the chemical formula for table salt?", a:"NaCl — sodium chloride" },
  { cat:"science", q:"Roughly how fast does light travel in a vacuum?", a:"About 300,000 kilometres per second" },
  { cat:"history", q:"In which year did the Second World War end?", a:"1945" },
  { cat:"history", q:"Who was the first person to walk on the Moon?", a:"Neil Armstrong" },
  { cat:"history", q:"Which ancient civilisation built the pyramids at Giza?", a:"The ancient Egyptians" },
  { cat:"history", q:"In which year did the Berlin Wall fall?", a:"1989" },
  { cat:"history", q:"Who was the first Prime Minister of India?", a:"Jawaharlal Nehru" },
  { cat:"history", q:"In which year did the Titanic sink?", a:"1912" },
  { cat:"history", q:"Who wrote the first draft of the United States Declaration of Independence?", a:"Thomas Jefferson" },
  { cat:"history", q:"Which country gifted the Statue of Liberty to the United States?", a:"France" },
  { cat:"history", q:"Who was the first woman to win a Nobel Prize?", a:"Marie Curie" },
  { cat:"history", q:"On which ship did Charles Darwin make his famous voyage?", a:"HMS Beagle" },
  { cat:"history", q:"In which century did the Industrial Revolution begin?", a:"The 18th century" },
  { cat:"history", q:"Which empire was ruled from the city of Rome?", a:"The Roman Empire" },
  { cat:"history", q:"Who led India's non-violent independence movement?", a:"Mahatma Gandhi" },
  { cat:"geography", q:"Which is the largest ocean on Earth?", a:"The Pacific Ocean" },
  { cat:"geography", q:"What is the capital of Australia?", a:"Canberra" },
  { cat:"geography", q:"What is the largest hot desert in the world?", a:"The Sahara" },
  { cat:"geography", q:"Mount Everest sits on the border of which two countries?", a:"Nepal and China" },
  { cat:"geography", q:"Which is the driest continent?", a:"Antarctica" },
  { cat:"geography", q:"What is the smallest country in the world by area?", a:"Vatican City" },
  { cat:"geography", q:"What is the capital of Canada?", a:"Ottawa" },
  { cat:"geography", q:"Which mountain range separates Europe from Asia?", a:"The Ural Mountains" },
  { cat:"geography", q:"What is the largest island in the world?", a:"Greenland" },
  { cat:"geography", q:"Which country contains most of the Amazon rainforest?", a:"Brazil" },
  { cat:"geography", q:"What is the capital of Japan?", a:"Tokyo" },
  { cat:"geography", q:"Which river flows through Cairo?", a:"The Nile" },
  { cat:"geography", q:"On which continent is the Serengeti?", a:"Africa" },
  { cat:"nature", q:"What is the largest animal on Earth?", a:"The blue whale" },
  { cat:"nature", q:"How many legs does a spider have?", a:"Eight" },
  { cat:"nature", q:"What is a group of lions called?", a:"A pride" },
  { cat:"nature", q:"Which bird is the fastest animal in a dive?", a:"The peregrine falcon" },
  { cat:"nature", q:"What do bees collect from flowers to make honey?", a:"Nectar" },
  { cat:"nature", q:"Which is the tallest species of tree?", a:"The coast redwood" },
  { cat:"nature", q:"Which mammal is capable of true flight?", a:"The bat" },
  { cat:"nature", q:"Which is the largest species of big cat?", a:"The tiger" },
  { cat:"nature", q:"How many hearts does an octopus have?", a:"Three" },
  { cat:"nature", q:"What is a baby kangaroo called?", a:"A joey" },
  { cat:"nature", q:"Which tree produces acorns?", a:"The oak" },
  { cat:"nature", q:"What is the fastest land animal?", a:"The cheetah" },
  { cat:"nature", q:"What colour is a polar bear's skin beneath its fur?", a:"Black" },
  { cat:"culture", q:"How many strings does a standard guitar have?", a:"Six" },
  { cat:"culture", q:"Who painted the Mona Lisa?", a:"Leonardo da Vinci" },
  { cat:"culture", q:"How many players from each team are on the pitch in football?", a:"Eleven" },
  { cat:"culture", q:"How many keys does a standard piano have?", a:"88" },
  { cat:"culture", q:"Who wrote the play Romeo and Juliet?", a:"William Shakespeare" },
  { cat:"culture", q:"How many squares are there on a chessboard?", a:"64" },
  { cat:"culture", q:"In which country did the Olympic Games originate?", a:"Greece" },
  { cat:"culture", q:"What is the official language of Brazil?", a:"Portuguese" },
  { cat:"culture", q:"How many lines does a haiku have?", a:"Three" },
  { cat:"culture", q:"Which orchestral instrument has strings and seven pedals?", a:"The harp" },
  { cat:"culture", q:"What are the five colours of the Olympic rings?", a:"Blue, yellow, black, green and red" },
  { cat:"culture", q:"How many minutes are there in a standard football match, excluding stoppage time?", a:"90" },
  { cat:"culture", q:"Which board game uses the terms check and checkmate?", a:"Chess" },
];
function RandomTriviaGenerator() {
  const [cat, setCat] = useState("all");
  const [item, setItem] = useState(null);
  const [shown, setShown] = useState(false);
  const draw = () => {
    const pool = cat === "all" ? TRIVIA_BANK : TRIVIA_BANK.filter(t => t.cat === cat);
    if (!pool.length) { setItem(null); return; }
    setItem(pool[secureRandom(pool.length)]);
    setShown(false);
  };
  useEffect(() => { draw(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Category</Label><SelectInput value={cat} onChange={setCat} options={[["all","All categories"],["science","Science"],["history","History"],["geography","Geography"],["nature","Nature"],["culture","Culture & sport"]]} style={{ width:"100%" }} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}>
          <button onClick={draw} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width:"100%" }}>🧠 New Question</button>
        </div>
      </Grid2>
      {item ? (
        <>
          <div style={{ padding:"22px 20px", background:"rgba(244,63,94,0.06)", border:"1px solid rgba(244,63,94,0.2)", borderRadius:14 }}>
            <Badge color="rose">{item.cat}</Badge>
            <div style={{ fontSize:"clamp(17px,3.4vw,22px)", fontWeight:700, fontFamily:"'Sora',sans-serif", color:C.text, lineHeight:1.45, marginTop:10 }}>{item.q}</div>
          </div>
          {shown ? (
            <div style={{ padding:"16px 18px", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:12 }}>
              <div style={{ ...T.label, marginBottom:4 }}>Answer</div>
              <div style={{ fontSize:17, fontWeight:700, color:"#34D399" }}>{item.a}</div>
            </div>
          ) : (
            <Btn variant="secondary" onClick={() => setShown(true)} style={{ alignSelf:"center" }}>👀 Reveal Answer</Btn>
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{TRIVIA_BANK.length} questions in the bank.</span>
            <CopyBtn text={`${item.q}\nAnswer: ${item.a}`} />
          </div>
        </>
      ) : (
        <Result mono={false}>No questions match that category — choose another category.</Result>
      )}
    </VStack>
  );
}

// ── Animals: 121 entries as "emoji|name|group" ───────────────────────────────
const ANIMAL_BANK = ("🦊|Fox|mammals;🐺|Wolf|mammals;🐻|Bear|mammals;🐼|Giant panda|mammals;🐨|Koala|mammals;🐯|Tiger|mammals;🦁|Lion|mammals;🐮|Cow|mammals;🐷|Pig|mammals;🐴|Horse|mammals;🦓|Zebra|mammals;🦒|Giraffe|mammals;🐘|Elephant|mammals;🦏|Rhinoceros|mammals;🦛|Hippopotamus|mammals;🐫|Camel|mammals;🦘|Kangaroo|mammals;🦔|Hedgehog|mammals;🐇|Rabbit|mammals;🐹|Hamster|mammals;🐭|Mouse|mammals;🐿️|Squirrel|mammals;🦡|Badger|mammals;🦦|Otter|mammals;🦥|Sloth|mammals;🐒|Monkey|mammals;🦍|Gorilla|mammals;🦧|Orangutan|mammals;🐐|Goat|mammals;🐑|Sheep|mammals;🦌|Deer|mammals;🐕|Dog|mammals;🐈|Cat|mammals;🦇|Bat|mammals;🦙|Llama|mammals;🐆|Leopard|mammals;🐃|Water buffalo|mammals;🦨|Skunk|mammals;🦫|Beaver|mammals;🦝|Raccoon|mammals;" +
"🐔|Chicken|birds;🐓|Rooster|birds;🦆|Duck|birds;🦢|Swan|birds;🦉|Owl|birds;🦅|Eagle|birds;🦜|Parrot|birds;🐧|Penguin|birds;🕊️|Dove|birds;🦚|Peacock|birds;🦩|Flamingo|birds;🦃|Turkey|birds;🐦|Sparrow|birds;🐦|Robin|birds;🐦|Crow|birds;🐦|Hummingbird|birds;🐦|Pelican|birds;🐦|Woodpecker|birds;🐦|Kingfisher|birds;🐦|Ostrich|birds;🐦|Seagull|birds;🐦|Heron|birds;" +
"🐍|Snake|reptiles;🦎|Lizard|reptiles;🐢|Turtle|reptiles;🐊|Crocodile|reptiles;🐸|Frog|reptiles;🦎|Chameleon|reptiles;🦎|Gecko|reptiles;🦎|Iguana|reptiles;🐊|Alligator|reptiles;🐢|Tortoise|reptiles;🐍|Cobra|reptiles;🐍|Python|reptiles;🐍|Rattlesnake|reptiles;🦎|Newt|reptiles;🦎|Salamander|reptiles;🐸|Toad|reptiles;🦎|Komodo dragon|reptiles;🐢|Sea turtle|reptiles;" +
"🐟|Fish|sea;🐠|Tropical fish|sea;🐡|Pufferfish|sea;🦈|Shark|sea;🐙|Octopus|sea;🦑|Squid|sea;🦐|Shrimp|sea;🦞|Lobster|sea;🦀|Crab|sea;🐬|Dolphin|sea;🐳|Blue whale|sea;🐋|Humpback whale|sea;🦭|Seal|sea;🐠|Seahorse|sea;🐟|Manta ray|sea;🐟|Swordfish|sea;🐠|Clownfish|sea;🐟|Eel|sea;🐚|Starfish|sea;🐚|Sea urchin|sea;🌊|Jellyfish|sea;🐋|Orca|sea;🦭|Walrus|sea;🐋|Narwhal|sea;🐚|Sea snail|sea;" +
"🐝|Bee|insects;🐛|Caterpillar|insects;🦋|Butterfly|insects;🐌|Snail|insects;🐞|Ladybird|insects;🐜|Ant|insects;🦗|Cricket|insects;🕷️|Spider|insects;🦂|Scorpion|insects;🐜|Housefly|insects;🦟|Mosquito|insects;🐞|Beetle|insects;🦋|Dragonfly|insects;🦋|Moth|insects;🦗|Grasshopper|insects;🐜|Termite|insects").split(";").map(s => { const p = s.split("|"); return { emoji: p[0], name: p[1], group: p[2] }; });
const ANIMAL_GROUP_LABELS = { mammals:"Mammal", birds:"Bird", reptiles:"Reptile / amphibian", sea:"Sea life", insects:"Insect / bug" };
function RandomAnimalGenerator() {
  const [group, setGroup] = useState("all");
  const [count, setCount] = useState("1");
  const [out, setOut] = useState(null);
  const generate = () => {
    const pool = group === "all" ? ANIMAL_BANK : ANIMAL_BANK.filter(a => a.group === group);
    if (!pool.length) { setOut([]); return; }
    const n = Math.max(1, Math.min(60, parseInt(count) || 1));
    setOut(Array.from({ length: n }, () => pool[secureRandom(pool.length)]));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Animal Group</Label><SelectInput value={group} onChange={setGroup} options={[["all","All animals"],["mammals","Mammals"],["birds","Birds"],["reptiles","Reptiles & amphibians"],["sea","Sea life"],["insects","Insects & bugs"]]} style={{ width:"100%" }} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🦊 Generate Animals</button>
      {out && out.length > 0 && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:12 }}>
            {out.map((a, i) => (
              <div key={i} style={{ textAlign:"center", background:"rgba(255,255,255,0.03)", border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 10px" }}>
                <div style={{ fontSize:40 }}>{a.emoji}</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.text, margin:"6px 0 6px" }}>{a.name}</div>
                <Badge color="rose">{ANIMAL_GROUP_LABELS[a.group]}</Badge>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{ANIMAL_BANK.length} animals in the bank.</span>
            <CopyBtn text={out.map(a => `${a.emoji} ${a.name}`).join("\n")} />
          </div>
        </>
      )}
      {out && out.length === 0 && <Result mono={false}>No animals match that group — choose another group.</Result>}
    </VStack>
  );
}

// ── Foods: 155 dishes as "dish|cuisine" ──────────────────────────────────────
const FOOD_BANK = ("Butter chicken|Indian;Palak paneer|Indian;Chana masala|Indian;Masala dosa|Indian;Biryani|Indian;Rogan josh|Indian;Chole bhature|Indian;Idli sambar|Indian;Pav bhaji|Indian;Dal makhani|Indian;Aloo gobi|Indian;Tandoori chicken|Indian;Rajma chawal|Indian;Baingan bharta|Indian;Vada pav|Indian;Pani puri|Indian;Malai kofta|Indian;Hyderabadi haleem|Indian;" +
"Margherita pizza|Italian;Spaghetti carbonara|Italian;Lasagne|Italian;Risotto alla milanese|Italian;Gnocchi|Italian;Ravioli|Italian;Minestrone|Italian;Osso buco|Italian;Caprese salad|Italian;Bruschetta|Italian;Fettuccine alfredo|Italian;Penne arrabbiata|Italian;Focaccia|Italian;Tiramisu|Italian;Panzanella|Italian;Arancini|Italian;Cacio e pepe|Italian;Creamy polenta|Italian;" +
"Tacos al pastor|Mexican;Chicken enchiladas|Mexican;Quesadilla|Mexican;Guacamole and chips|Mexican;Chiles rellenos|Mexican;Tamales|Mexican;Pozole|Mexican;Bean burrito|Mexican;Elote|Mexican;Sopes|Mexican;Mole poblano|Mexican;Huevos rancheros|Mexican;Tostadas|Mexican;Fajitas|Mexican;Chilaquiles|Mexican;Birria|Mexican;Tortilla soup|Mexican;" +
"Kung pao chicken|Chinese;Mapo tofu|Chinese;Sweet and sour pork|Chinese;Steamed dumplings|Chinese;Char siu|Chinese;Hot and sour soup|Chinese;Chow mein|Chinese;Peking duck|Chinese;Spring rolls|Chinese;Egg fried rice|Chinese;Wonton soup|Chinese;Dan dan noodles|Chinese;Steamed bao|Chinese;Twice cooked pork|Chinese;Hainanese chicken rice|Chinese;Congee|Chinese;Salt and pepper tofu|Chinese;" +
"Sushi rolls|Japanese;Chicken teriyaki|Japanese;Ramen|Japanese;Udon noodle soup|Japanese;Tempura|Japanese;Katsu curry|Japanese;Okonomiyaki|Japanese;Onigiri|Japanese;Miso soup|Japanese;Gyoza|Japanese;Yakitori|Japanese;Donburi bowl|Japanese;Soba noodles|Japanese;Takoyaki|Japanese;Chirashi bowl|Japanese;Tonkatsu|Japanese;Omurice|Japanese;" +
"Pad thai|Thai;Green curry|Thai;Tom yum soup|Thai;Massaman curry|Thai;Som tam|Thai;Pad see ew|Thai;Red curry|Thai;Larb|Thai;Tom kha gai|Thai;Khao soi|Thai;Mango sticky rice|Thai;Satay skewers|Thai;Pineapple fried rice|Thai;Panang curry|Thai;Thai basil chicken|Thai;Thai fish cakes|Thai;Coconut soup|Thai;" +
"Cheeseburger|American;Mac and cheese|American;Barbecue ribs|American;Fried chicken|American;Clam chowder|American;Buffalo wings|American;Pancakes with syrup|American;Cobb salad|American;Grilled cheese sandwich|American;Chili con carne|American;Pulled pork sandwich|American;Meatloaf|American;Corn bread|American;Reuben sandwich|American;Biscuits and gravy|American;Lobster roll|American;Apple pie|American;" +
"Hummus and pita|Middle Eastern;Falafel wrap|Middle Eastern;Shawarma|Middle Eastern;Tabbouleh|Middle Eastern;Baba ganoush|Middle Eastern;Mixed kebabs|Middle Eastern;Mujadara|Middle Eastern;Fattoush|Middle Eastern;Shakshuka|Middle Eastern;Manakish|Middle Eastern;Kibbeh|Middle Eastern;Maqluba|Middle Eastern;Stuffed vine leaves|Middle Eastern;Red lentil soup|Middle Eastern;Baklava|Middle Eastern;Labneh with olive oil|Middle Eastern;Chicken machboos|Middle Eastern;" +
"Greek salad|Mediterranean;Moussaka|Mediterranean;Paella|Mediterranean;Spanakopita|Mediterranean;Gyros|Mediterranean;Tzatziki with bread|Mediterranean;Ratatouille|Mediterranean;Grilled sardines|Mediterranean;Couscous with vegetables|Mediterranean;Souvlaki|Mediterranean;Gazpacho|Mediterranean;Tortilla española|Mediterranean;Dolma|Mediterranean;Pissaladière|Mediterranean;Seafood risotto|Mediterranean;Bouillabaisse|Mediterranean;Caponata|Mediterranean").split(";").map(s => { const p = s.split("|"); return { dish: p[0], cuisine: p[1] }; });
const CUISINES = ["Indian","Italian","Mexican","Chinese","Japanese","Thai","American","Middle Eastern","Mediterranean"];
function RandomFoodGenerator() {
  const [cuisine, setCuisine] = useState("any");
  const [pick, setPick] = useState(null);
  const generate = () => {
    const pool = cuisine === "any" ? FOOD_BANK : FOOD_BANK.filter(f => f.cuisine === cuisine);
    if (!pool.length) { setPick(null); return; }
    setPick(pool[secureRandom(pool.length)]);
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={18}>
      <Grid2>
        <div><Label>Cuisine</Label><SelectInput value={cuisine} onChange={setCuisine} options={[["any","Any cuisine"], ...CUISINES.map(c => [c, c])]} style={{ width:"100%" }} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}>
          <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width:"100%" }}>🍜 What Should I Eat?</button>
        </div>
      </Grid2>
      {pick ? (
        <>
          <div style={{ textAlign:"center", padding:"30px 20px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:16 }}>
            <div style={{ fontSize:44, marginBottom:6 }}>🍽️</div>
            <div style={{ fontSize:"clamp(22px,5vw,34px)", fontWeight:800, fontFamily:"'Sora',sans-serif", color:C.text }}>{pick.dish}</div>
            <div style={{ marginTop:10 }}><Badge color="rose">{pick.cuisine}</Badge></div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{FOOD_BANK.length} dishes across {CUISINES.length} cuisines.</span>
            <CopyBtn text={`${pick.dish} (${pick.cuisine})`} />
          </div>
        </>
      ) : <Result mono={false}>No dishes match that cuisine — choose another cuisine.</Result>}
    </VStack>
  );
}

const MOVIE_GENRES = ["Action","Adventure","Animation","Biopic","Comedy","Coming-of-age","Crime","Documentary","Drama","Epic","Fantasy","Heist","Historical drama","Horror","Legal drama","Musical","Mystery","Neo-noir","Political thriller","Road movie","Romance","Science fiction","Sports drama","Spy thriller","Superhero","Survival","Thriller","War","Western","Whodunnit"];
const MOVIE_DECADES = ["1950s","1960s","1970s","1980s","1990s","2000s","2010s","2020s"];
const MOVIE_MOODS = ["redemption","betrayal","first love","found family","revenge served slowly","an unlikely friendship","a race against time","a small town with a secret","a long journey home","an impossible choice","rivalry turned respect","a second chance","the cost of ambition","hope against the odds","a stranger arrives","the truth comes out","surviving the wilderness","one perfect night","the last job","growing up too fast","a comeback nobody expected","loyalty tested","a mystery in plain sight","letting go"];
function RandomMovieGenreGenerator() {
  const [combo, setCombo] = useState(null);
  const generate = () => setCombo({
    genre: MOVIE_GENRES[secureRandom(MOVIE_GENRES.length)],
    decade: MOVIE_DECADES[secureRandom(MOVIE_DECADES.length)],
    mood: MOVIE_MOODS[secureRandom(MOVIE_MOODS.length)],
  });
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={18}>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🎬 Generate Combo</button>
      {combo && (
        <>
          <Grid3>
            <StatBox value={combo.genre} label="Genre" />
            <StatBox value={combo.decade} label="Decade" />
            <StatBox value="🎭" label="Mood / theme" />
          </Grid3>
          <div style={{ textAlign:"center", padding:"22px 20px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:14 }}>
            <div style={{ fontSize:"clamp(17px,3.6vw,24px)", fontWeight:700, fontFamily:"'Sora',sans-serif", color:C.text, lineHeight:1.5 }}>
              A {combo.genre.toLowerCase()} film from the {combo.decade} about {combo.mood}.
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={`${combo.genre} · ${combo.decade} · ${combo.mood}`} /></div>
        </>
      )}
    </VStack>
  );
}

// ── Countries: 194 entries as "name|flag|capital|continent" ──────────────────
const COUNTRY_BANK = ("Algeria|🇩🇿|Algiers|Africa;Angola|🇦🇴|Luanda|Africa;Benin|🇧🇯|Porto-Novo|Africa;Botswana|🇧🇼|Gaborone|Africa;Burkina Faso|🇧🇫|Ouagadougou|Africa;Burundi|🇧🇮|Gitega|Africa;Cabo Verde|🇨🇻|Praia|Africa;Cameroon|🇨🇲|Yaounde|Africa;Central African Republic|🇨🇫|Bangui|Africa;Chad|🇹🇩|N'Djamena|Africa;Comoros|🇰🇲|Moroni|Africa;Republic of the Congo|🇨🇬|Brazzaville|Africa;DR Congo|🇨🇩|Kinshasa|Africa;Djibouti|🇩🇯|Djibouti|Africa;Egypt|🇪🇬|Cairo|Africa;Equatorial Guinea|🇬🇶|Malabo|Africa;Eritrea|🇪🇷|Asmara|Africa;Eswatini|🇸🇿|Mbabane|Africa;Ethiopia|🇪🇹|Addis Ababa|Africa;Gabon|🇬🇦|Libreville|Africa;Gambia|🇬🇲|Banjul|Africa;Ghana|🇬🇭|Accra|Africa;Guinea|🇬🇳|Conakry|Africa;Guinea-Bissau|🇬🇼|Bissau|Africa;Ivory Coast|🇨🇮|Yamoussoukro|Africa;Kenya|🇰🇪|Nairobi|Africa;Lesotho|🇱🇸|Maseru|Africa;Liberia|🇱🇷|Monrovia|Africa;Libya|🇱🇾|Tripoli|Africa;Madagascar|🇲🇬|Antananarivo|Africa;Malawi|🇲🇼|Lilongwe|Africa;Mali|🇲🇱|Bamako|Africa;Mauritania|🇲🇷|Nouakchott|Africa;Mauritius|🇲🇺|Port Louis|Africa;Morocco|🇲🇦|Rabat|Africa;Mozambique|🇲🇿|Maputo|Africa;Namibia|🇳🇦|Windhoek|Africa;Niger|🇳🇪|Niamey|Africa;Nigeria|🇳🇬|Abuja|Africa;Rwanda|🇷🇼|Kigali|Africa;Sao Tome and Principe|🇸🇹|Sao Tome|Africa;Senegal|🇸🇳|Dakar|Africa;Seychelles|🇸🇨|Victoria|Africa;Sierra Leone|🇸🇱|Freetown|Africa;Somalia|🇸🇴|Mogadishu|Africa;South Africa|🇿🇦|Pretoria|Africa;South Sudan|🇸🇸|Juba|Africa;Sudan|🇸🇩|Khartoum|Africa;Tanzania|🇹🇿|Dodoma|Africa;Togo|🇹🇬|Lome|Africa;Tunisia|🇹🇳|Tunis|Africa;Uganda|🇺🇬|Kampala|Africa;Zambia|🇿🇲|Lusaka|Africa;Zimbabwe|🇿🇼|Harare|Africa;" +
"Afghanistan|🇦🇫|Kabul|Asia;Armenia|🇦🇲|Yerevan|Asia;Azerbaijan|🇦🇿|Baku|Asia;Bahrain|🇧🇭|Manama|Asia;Bangladesh|🇧🇩|Dhaka|Asia;Bhutan|🇧🇹|Thimphu|Asia;Brunei|🇧🇳|Bandar Seri Begawan|Asia;Cambodia|🇰🇭|Phnom Penh|Asia;China|🇨🇳|Beijing|Asia;Cyprus|🇨🇾|Nicosia|Asia;Georgia|🇬🇪|Tbilisi|Asia;India|🇮🇳|New Delhi|Asia;Indonesia|🇮🇩|Jakarta|Asia;Iran|🇮🇷|Tehran|Asia;Iraq|🇮🇶|Baghdad|Asia;Israel|🇮🇱|Jerusalem|Asia;Japan|🇯🇵|Tokyo|Asia;Jordan|🇯🇴|Amman|Asia;Kazakhstan|🇰🇿|Astana|Asia;Kuwait|🇰🇼|Kuwait City|Asia;Kyrgyzstan|🇰🇬|Bishkek|Asia;Laos|🇱🇦|Vientiane|Asia;Lebanon|🇱🇧|Beirut|Asia;Malaysia|🇲🇾|Kuala Lumpur|Asia;Maldives|🇲🇻|Male|Asia;Mongolia|🇲🇳|Ulaanbaatar|Asia;Myanmar|🇲🇲|Naypyidaw|Asia;Nepal|🇳🇵|Kathmandu|Asia;North Korea|🇰🇵|Pyongyang|Asia;Oman|🇴🇲|Muscat|Asia;Pakistan|🇵🇰|Islamabad|Asia;Philippines|🇵🇭|Manila|Asia;Qatar|🇶🇦|Doha|Asia;Saudi Arabia|🇸🇦|Riyadh|Asia;Singapore|🇸🇬|Singapore|Asia;South Korea|🇰🇷|Seoul|Asia;Sri Lanka|🇱🇰|Sri Jayawardenepura Kotte|Asia;Syria|🇸🇾|Damascus|Asia;Tajikistan|🇹🇯|Dushanbe|Asia;Thailand|🇹🇭|Bangkok|Asia;Timor-Leste|🇹🇱|Dili|Asia;Turkey|🇹🇷|Ankara|Asia;Turkmenistan|🇹🇲|Ashgabat|Asia;United Arab Emirates|🇦🇪|Abu Dhabi|Asia;Uzbekistan|🇺🇿|Tashkent|Asia;Vietnam|🇻🇳|Hanoi|Asia;Yemen|🇾🇪|Sanaa|Asia;" +
"Albania|🇦🇱|Tirana|Europe;Andorra|🇦🇩|Andorra la Vella|Europe;Austria|🇦🇹|Vienna|Europe;Belarus|🇧🇾|Minsk|Europe;Belgium|🇧🇪|Brussels|Europe;Bosnia and Herzegovina|🇧🇦|Sarajevo|Europe;Bulgaria|🇧🇬|Sofia|Europe;Croatia|🇭🇷|Zagreb|Europe;Czechia|🇨🇿|Prague|Europe;Denmark|🇩🇰|Copenhagen|Europe;Estonia|🇪🇪|Tallinn|Europe;Finland|🇫🇮|Helsinki|Europe;France|🇫🇷|Paris|Europe;Germany|🇩🇪|Berlin|Europe;Greece|🇬🇷|Athens|Europe;Hungary|🇭🇺|Budapest|Europe;Iceland|🇮🇸|Reykjavik|Europe;Ireland|🇮🇪|Dublin|Europe;Italy|🇮🇹|Rome|Europe;Latvia|🇱🇻|Riga|Europe;Liechtenstein|🇱🇮|Vaduz|Europe;Lithuania|🇱🇹|Vilnius|Europe;Luxembourg|🇱🇺|Luxembourg|Europe;Malta|🇲🇹|Valletta|Europe;Moldova|🇲🇩|Chisinau|Europe;Monaco|🇲🇨|Monaco|Europe;Montenegro|🇲🇪|Podgorica|Europe;Netherlands|🇳🇱|Amsterdam|Europe;North Macedonia|🇲🇰|Skopje|Europe;Norway|🇳🇴|Oslo|Europe;Poland|🇵🇱|Warsaw|Europe;Portugal|🇵🇹|Lisbon|Europe;Romania|🇷🇴|Bucharest|Europe;Russia|🇷🇺|Moscow|Europe;San Marino|🇸🇲|San Marino|Europe;Serbia|🇷🇸|Belgrade|Europe;Slovakia|🇸🇰|Bratislava|Europe;Slovenia|🇸🇮|Ljubljana|Europe;Spain|🇪🇸|Madrid|Europe;Sweden|🇸🇪|Stockholm|Europe;Switzerland|🇨🇭|Bern|Europe;Ukraine|🇺🇦|Kyiv|Europe;United Kingdom|🇬🇧|London|Europe;Vatican City|🇻🇦|Vatican City|Europe;" +
"Antigua and Barbuda|🇦🇬|Saint John's|North America;Bahamas|🇧🇸|Nassau|North America;Barbados|🇧🇧|Bridgetown|North America;Belize|🇧🇿|Belmopan|North America;Canada|🇨🇦|Ottawa|North America;Costa Rica|🇨🇷|San Jose|North America;Cuba|🇨🇺|Havana|North America;Dominica|🇩🇲|Roseau|North America;Dominican Republic|🇩🇴|Santo Domingo|North America;El Salvador|🇸🇻|San Salvador|North America;Grenada|🇬🇩|Saint George's|North America;Guatemala|🇬🇹|Guatemala City|North America;Haiti|🇭🇹|Port-au-Prince|North America;Honduras|🇭🇳|Tegucigalpa|North America;Jamaica|🇯🇲|Kingston|North America;Mexico|🇲🇽|Mexico City|North America;Nicaragua|🇳🇮|Managua|North America;Panama|🇵🇦|Panama City|North America;Saint Kitts and Nevis|🇰🇳|Basseterre|North America;Saint Lucia|🇱🇨|Castries|North America;Saint Vincent and the Grenadines|🇻🇨|Kingstown|North America;Trinidad and Tobago|🇹🇹|Port of Spain|North America;United States|🇺🇸|Washington DC|North America;" +
"Argentina|🇦🇷|Buenos Aires|South America;Bolivia|🇧🇴|Sucre|South America;Brazil|🇧🇷|Brasilia|South America;Chile|🇨🇱|Santiago|South America;Colombia|🇨🇴|Bogota|South America;Ecuador|🇪🇨|Quito|South America;Guyana|🇬🇾|Georgetown|South America;Paraguay|🇵🇾|Asuncion|South America;Peru|🇵🇪|Lima|South America;Suriname|🇸🇷|Paramaribo|South America;Uruguay|🇺🇾|Montevideo|South America;Venezuela|🇻🇪|Caracas|South America;" +
"Australia|🇦🇺|Canberra|Oceania;Fiji|🇫🇯|Suva|Oceania;Kiribati|🇰🇮|Tarawa|Oceania;Marshall Islands|🇲🇭|Majuro|Oceania;Micronesia|🇫🇲|Palikir|Oceania;Nauru|🇳🇷|Yaren|Oceania;New Zealand|🇳🇿|Wellington|Oceania;Palau|🇵🇼|Ngerulmud|Oceania;Papua New Guinea|🇵🇬|Port Moresby|Oceania;Samoa|🇼🇸|Apia|Oceania;Solomon Islands|🇸🇧|Honiara|Oceania;Tonga|🇹🇴|Nukualofa|Oceania;Tuvalu|🇹🇻|Funafuti|Oceania;Vanuatu|🇻🇺|Port Vila|Oceania").split(";").map(s => { const p = s.split("|"); return { name: p[0], flag: p[1], capital: p[2], continent: p[3] }; });
const CONTINENTS = ["Africa","Asia","Europe","North America","South America","Oceania"];
function RandomCountryPicker() {
  const [cont, setCont] = useState("all");
  const [count, setCount] = useState("1");
  const [out, setOut] = useState(null);
  const generate = () => {
    const pool = cont === "all" ? COUNTRY_BANK : COUNTRY_BANK.filter(c => c.continent === cont);
    if (!pool.length) { setOut([]); return; }
    const n = Math.max(1, Math.min(pool.length, parseInt(count) || 1));
    setOut(shuffle(pool).slice(0, n));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Continent</Label><SelectInput value={cont} onChange={setCont} options={[["all","All continents"], ...CONTINENTS.map(c => [c, c])]} style={{ width:"100%" }} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid2>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🌍 Pick Countries</button>
      {out && out.length > 0 && (
        <>
          {out.length === 1 ? (
            <div style={{ textAlign:"center", padding:"26px 20px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:16 }}>
              <div style={{ fontSize:56, lineHeight:1 }}>{out[0].flag}</div>
              <div style={{ fontSize:"clamp(22px,5vw,32px)", fontWeight:800, fontFamily:"'Sora',sans-serif", color:C.text, marginTop:8 }}>{out[0].name}</div>
              <div style={{ fontSize:14, color:C.muted, marginTop:6 }}>Capital: {out[0].capital} · {out[0].continent}</div>
            </div>
          ) : (
            <DataTable columns={["Flag", "Country", "Capital", "Continent"]} rows={out.map(c => [c.flag, c.name, c.capital, c.continent])} />
          )}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{COUNTRY_BANK.length} countries in the bank.</span>
            <CopyBtn text={out.map(c => `${c.flag} ${c.name} — ${c.capital} (${c.continent})`).join("\n")} />
          </div>
        </>
      )}
      {out && out.length === 0 && <Result mono={false}>No countries match that continent — choose another continent.</Result>}
    </VStack>
  );
}

const FIRST_F = ("Aarti Ada Aisha Amara Amelia Ananya Astrid Beatriz Camila Carmen Chloe Clara Daniela Diya Elena Elif Emma Esther Farah Fatima Freya Grace Hana Ines Iris Isla Jasmine Julia Kavya Lara Leila Lucia Maya Meera Mia Nadia Naomi Nina Nora Olivia Paloma Priya Rania Rhea Rosa Ruth Sana Sara Sienna Sofia Sophie Tara Thandiwe Uma Valentina Wren Yasmin Zainab Zara Zoe").split(" ");
const FIRST_M = ("Aaron Adam Ahmed Alex Amir Andre Aniket Arjun Ben Bruno Caleb Carlos Daniel David Diego Dmitri Elias Emeka Enzo Ethan Felix Gabriel Hassan Henry Hugo Ibrahim Isaac Ivan Jack Jamal James Javier Jonas Kabir Karim Kenji Leo Liam Lucas Mateo Max Miguel Mohan Nikhil Noah Omar Oscar Pablo Rahul Ravi Rohan Samuel Sebastian Theo Tomas Viktor Vikram Yusuf Zane Zayn").split(" ");
const LAST_NAMES = ("Adeyemi Ahmed Alvarez Andersen Bakker Bianchi Brooks Cabrera Carter Chen Costa Dahl Davies Delgado Diallo Dubois Eriksson Fernandes Fischer Fontaine Garcia Gupta Haddad Hansen Hernandez Hoffmann Ibrahim Iyer Jansen Johansson Jones Kaur Keller Khan Kim Kowalski Kumar Larsen Lopez Lund Marino Martin Mehta Mendes Mensah Meyer Miller Moreau Morris Muller Nakamura Navarro Nguyen Novak Okafor Oliveira Osei Park Patel Petrov Popescu Reddy Reyes Ricci Rossi Ryan Santos Sato Schmidt Sharma Silva Singh Smith Sorensen Tanaka Taylor Torres Vargas Walker Yilmaz").split(" ");
function RandomNameGeneratorFun() {
  const [style, setStyle] = useState("any");
  const [shape, setShape] = useState("full");
  const [count, setCount] = useState("5");
  const [out, setOut] = useState(null);
  const generate = () => {
    const firstPool = style === "f" ? FIRST_F : style === "m" ? FIRST_M : FIRST_F.concat(FIRST_M);
    const n = Math.max(1, Math.min(200, parseInt(count) || 1));
    setOut(Array.from({ length: n }, () => {
      const f = firstPool[secureRandom(firstPool.length)];
      const l = LAST_NAMES[secureRandom(LAST_NAMES.length)];
      return shape === "first" ? f : shape === "last" ? l : `${f} ${l}`;
    }));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>First Name Style</Label><SelectInput value={style} onChange={setStyle} options={[["any","Any"],["f","Feminine"],["m","Masculine"]]} style={{ width:"100%" }} /></div>
        <div><Label>Output</Label><SelectInput value={shape} onChange={setShape} options={[["full","Full name"],["first","First name only"],["last","Surname only"]]} style={{ width:"100%" }} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🧑 Generate Names</button>
      {out && (
        <>
          <Result>{out.join("\n")}</Result>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{FIRST_F.length + FIRST_M.length} first names · {LAST_NAMES.length} surnames.</span>
            <CopyBtn text={out.join("\n")} />
          </div>
        </>
      )}
    </VStack>
  );
}

const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
function RandomUsernameGenerator() {
  const [style, setStyle] = useState("classic");
  const [addNum, setAddNum] = useState("yes");
  const [count, setCount] = useState("8");
  const [out, setOut] = useState(null);
  const makeOne = () => {
    const a = WORD_ADJS[secureRandom(WORD_ADJS.length)];
    const n = WORD_NOUNS[secureRandom(WORD_NOUNS.length)];
    let base;
    if (style === "snake") base = `${a}_${n}`;
    else if (style === "camel") base = `${a}${cap(n)}`;
    else if (style === "dotted") base = `${a}.${n}`;
    else if (style === "lower") base = `${a}${n}`;
    else base = `${cap(a)}${cap(n)}`;
    if (addNum === "yes") {
      const digits = 2 + secureRandom(3); // 2–4 digits
      let num = "";
      for (let i = 0; i < digits; i++) num += secureRandom(10);
      base += (style === "snake" ? "_" : style === "dotted" ? "." : "") + num;
    }
    return base;
  };
  const generate = () => {
    const n = Math.max(1, Math.min(100, parseInt(count) || 1));
    setOut(Array.from({ length: n }, makeOne));
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Style</Label><SelectInput value={style} onChange={setStyle} options={[["classic","Classic — BraveOtter"],["snake","snake_case"],["camel","camelCase"],["dotted","dotted.style"],["lower","lowercase run-together"]]} style={{ width:"100%" }} /></div>
        <div><Label>Append Number</Label><SelectInput value={addNum} onChange={setAddNum} options={[["yes","Yes — 2 to 4 digits"],["no","No — words only"]]} style={{ width:"100%" }} /></div>
        <div><Label>How Many</Label><Input value={count} onChange={setCount} /></div>
      </Grid3>
      <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🏷️ Generate Usernames</button>
      {out && (
        <>
          <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
            {out.map((u, i) => (
              <span key={i} style={{ padding:"9px 14px", borderRadius:8, background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:C.text }}>{u}</span>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>Availability is not checked — treat each one as an idea.</span>
            <CopyBtn text={out.join("\n")} />
          </div>
        </>
      )}
    </VStack>
  );
}

// ── Hobbies: 125 entries as "name|tag" ───────────────────────────────────────
const HOBBY_BANK = ("Watercolour painting|creative;Calligraphy|creative;Pottery|creative;Knitting|creative;Crochet|creative;Origami|creative;Scrapbooking|creative;Digital illustration|creative;Photography|creative;Songwriting|creative;Playing the ukulele|creative;Creative writing|creative;Journalling|creative;Baking bread|creative;Cake decorating|creative;Candle making|creative;Soap making|creative;Jewellery making|creative;Woodworking|creative;Sewing|creative;Embroidery|creative;Quilting|creative;Sketching|creative;Scale model building|creative;Flower arranging|creative;" +
"Running|active;Cycling|active;Swimming|active;Hiking|active;Rock climbing|active;Yoga|active;Pilates|active;Badminton|active;Table tennis|active;Tennis|active;Basketball|active;Football|active;Skateboarding|active;Roller skating|active;Kayaking|active;Rowing|active;Archery|active;Martial arts|active;Dancing|active;Trail walking|active;Bouldering|active;Orienteering|active;Skipping rope|active;Fencing|active;Ultimate frisbee|active;" +
"Meditation|mindful;Breathwork|mindful;Gardening|mindful;Bonsai|mindful;Birdwatching|mindful;Stargazing|mindful;Tea brewing|mindful;Nature journalling|mindful;Forest walking|mindful;Sketching outdoors|mindful;Reading fiction|mindful;Jigsaw puzzles|mindful;Colouring books|mindful;Aquarium keeping|mindful;Houseplant care|mindful;Slow cooking|mindful;Sourdough starter care|mindful;Yoga nidra|mindful;Tai chi|mindful;Beachcombing|mindful;Cloud watching|mindful;Herb growing|mindful;Letter writing|mindful;Mindful photography|mindful;Zen sand gardening|mindful;" +
"Board game nights|social;Book club|social;Volunteering|social;Community choir|social;Amateur theatre|social;Language exchange|social;Dance classes|social;Trivia nights|social;Cooking club|social;Hiking group|social;Cycling club|social;Public speaking club|social;Local sports league|social;Photography walks|social;Improv comedy|social;Chess club|social;Quiz hosting|social;Community gardening|social;Mentoring|social;Craft circles|social;Karaoke nights|social;Running club|social;Beach clean-ups|social;Potluck dinners|social;Playtesting board games|social;" +
"Chess|geeky;Sudoku|geeky;Crossword puzzles|geeky;Speedcubing|geeky;Coding side projects|geeky;Retro gaming|geeky;Tabletop role-playing games|geeky;Model railways|geeky;Astronomy with a telescope|geeky;Amateur radio|geeky;Electronics kits|geeky;3D printing|geeky;Raspberry Pi projects|geeky;Home automation|geeky;Robotics|geeky;Fantasy world building|geeky;Trading card games|geeky;Mechanical keyboards|geeky;Drone flying|geeky;Video editing|geeky;Podcasting|geeky;Genealogy research|geeky;Map collecting|geeky;Fossil hunting|geeky;Stamp collecting|geeky").split(";").map(s => { const p = s.split("|"); return { name: p[0], tag: p[1] }; });
const HOBBY_LABELS = { creative:"Creative", active:"Active", mindful:"Mindful", social:"Social", geeky:"Geeky" };
function RandomHobbyGenerator() {
  const [tag, setTag] = useState("any");
  const [pick, setPick] = useState(null);
  const generate = () => {
    const pool = tag === "any" ? HOBBY_BANK : HOBBY_BANK.filter(h => h.tag === tag);
    if (!pool.length) { setPick(null); return; }
    setPick(pool[secureRandom(pool.length)]);
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={18}>
      <Grid2>
        <div><Label>Hobby Type</Label><SelectInput value={tag} onChange={setTag} options={[["any","Any type"],["creative","Creative"],["active","Active"],["mindful","Mindful"],["social","Social"],["geeky","Geeky"]]} style={{ width:"100%" }} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}>
          <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width:"100%" }}>🎯 Suggest a Hobby</button>
        </div>
      </Grid2>
      {pick ? (
        <>
          <div style={{ textAlign:"center", padding:"30px 20px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.25)", borderRadius:16 }}>
            <div style={{ fontSize:"clamp(22px,5vw,34px)", fontWeight:800, fontFamily:"'Sora',sans-serif", color:C.text }}>{pick.name}</div>
            <div style={{ marginTop:10 }}><Badge color="rose">{HOBBY_LABELS[pick.tag]}</Badge></div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>{HOBBY_BANK.length} hobby ideas in the bank.</span>
            <CopyBtn text={`${pick.name} (${HOBBY_LABELS[pick.tag]})`} />
          </div>
        </>
      ) : <Result mono={false}>No hobbies match that type — choose another type.</Result>}
    </VStack>
  );
}

const PALETTE_SCHEMES = { random:"Random scheme", analogous:"Analogous", complementary:"Complementary", triadic:"Triadic", monochrome:"Monochrome" };
function RandomColorPalette() {
  const [scheme, setScheme] = useState("random");
  const [palette, setPalette] = useState(null);
  const [usedScheme, setUsedScheme] = useState("analogous");
  const generate = () => {
    const keys = ["analogous", "complementary", "triadic", "monochrome"];
    const s = scheme === "random" ? keys[secureRandom(keys.length)] : scheme;
    const base = secureRandom(360);
    const sat = 55 + secureRandom(31);
    const out = [];
    for (let i = 0; i < 5; i++) {
      let h = base, l = 40 + i * 8;
      if (s === "analogous") { h = (base + (i - 2) * 24 + 360) % 360; l = 38 + i * 8; }
      else if (s === "complementary") { h = (base + (i % 2 === 0 ? 0 : 180)) % 360; l = 32 + i * 9; }
      else if (s === "triadic") { h = (base + (i % 3) * 120) % 360; l = 36 + i * 8; }
      else { h = base; l = 20 + i * 15; }
      out.push(makeColor(h, sat, Math.max(12, Math.min(88, l))));
    }
    setUsedScheme(s);
    setPalette(out);
  };
  useEffect(() => { generate(); }, []); // eslint-disable-line
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Harmony Scheme</Label><SelectInput value={scheme} onChange={setScheme} options={Object.entries(PALETTE_SCHEMES).map(([k, v]) => [k, v])} style={{ width:"100%" }} /></div>
        <div style={{ display:"flex", alignItems:"flex-end" }}>
          <button onClick={generate} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), width:"100%" }}>🖌️ Generate Palette</button>
        </div>
      </Grid2>
      {palette && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))", gap:10 }}>
            {palette.map((c, i) => (
              <div key={i} style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${C.border}` }}>
                <div style={{ height:96, background:c.hex }} />
                <div style={{ padding:"10px 8px", textAlign:"center", background:"rgba(255,255,255,0.03)" }}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:C.text, marginBottom:6 }}>{c.hex}</div>
                  <CopyBtn text={c.hex} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.muted }}>Scheme used: {PALETTE_SCHEMES[usedScheme]}</span>
            <CopyBtn text={palette.map(c => c.hex).join(", ")} />
          </div>
        </>
      )}
    </VStack>
  );
}

function TournamentBracketGenerator() {
  const [names, setNames] = useState("Alice\nBob\nCharlie\nDiana\nEthan\nFiona\nGeorge");
  const [rounds, setRounds] = useState(null);
  const list = names.split("\n").map(s => s.trim()).filter(Boolean);
  const generate = () => {
    if (list.length < 2) { setRounds(null); return; }
    const entrants = shuffle(list);
    let size = 2;
    while (size < entrants.length) size *= 2;
    const byes = size - entrants.length;
    const byePlayers = entrants.slice(0, byes);
    const rest = entrants.slice(byes);
    let pairs = byePlayers.map(p => [p, null]);
    for (let i = 0; i < rest.length; i += 2) pairs.push([rest[i], rest[i + 1] || null]);
    pairs = shuffle(pairs);
    let matchNo = 1;
    const all = [];
    let current = pairs.map(p => ({ id: "M" + (matchNo++), a: p[0], b: p[1] }));
    all.push(current);
    while (current.length > 1) {
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        const slot = (m) => (m.b === null ? m.a : `Winner of ${m.id}`);
        next.push({ id: "M" + (matchNo++), a: slot(current[i]), b: current[i + 1] ? slot(current[i + 1]) : null });
      }
      all.push(next);
      current = next;
    }
    setRounds({ list: all, byes, size, players: entrants.length });
  };
  const roundName = (i, total) => i === total - 1 ? "Final" : i === total - 2 ? "Semi-finals" : i === total - 3 ? "Quarter-finals" : `Round ${i + 1}`;
  const copyText = rounds ? rounds.list.map((r, i) =>
    `${roundName(i, rounds.list.length)}\n` + r.map(m => `  ${m.id}: ${m.a} vs ${m.b === null ? "BYE" : m.b}`).join("\n")
  ).join("\n\n") : "";
  return (
    <VStack gap={16}>
      <div><Label>Players — one per line ({list.length})</Label><Textarea value={names} onChange={setNames} rows={9} /></div>
      <button onClick={generate} disabled={list.length < 2} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center", opacity: list.length < 2 ? 0.55 : 1 }}>🏆 Generate Bracket</button>
      {list.length < 2 && <Result mono={false}>Enter at least two players to build a bracket.</Result>}
      {rounds && (
        <>
          <Grid3>
            <StatBox value={rounds.players} label="Players" />
            <StatBox value={rounds.byes} label="Byes given" />
            <StatBox value={rounds.list.length} label="Rounds" />
          </Grid3>
          <div style={{ display:"flex", gap:16, overflowX:"auto", paddingBottom:8 }}>
            {rounds.list.map((r, i) => (
              <div key={i} style={{ minWidth:230, flex:"0 0 auto" }}>
                <div style={{ ...T.label, marginBottom:10, color:C.accent }}>{roundName(i, rounds.list.length)}</div>
                <VStack gap={10}>
                  {r.map(m => (
                    <div key={m.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                      <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>{m.id}</div>
                      <div style={{ fontSize:14, color:C.text, fontWeight:600 }}>{m.a}</div>
                      <div style={{ fontSize:11, color:C.muted, margin:"4px 0" }}>vs</div>
                      <div style={{ fontSize:14, color: m.b === null ? C.warn : C.text, fontWeight:600 }}>{m.b === null ? "BYE — advances" : m.b}</div>
                    </div>
                  ))}
                </VStack>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
    </VStack>
  );
}

const TAROT_MAJOR = [
  { n:0,  name:"The Fool",            emoji:"🃏", up:"new beginnings, spontaneity, a leap of faith", rev:"hesitation, recklessness, holding back" },
  { n:1,  name:"The Magician",        emoji:"🪄", up:"manifestation, resourcefulness, focus",        rev:"untapped potential, scattered energy" },
  { n:2,  name:"The High Priestess",  emoji:"🌙", up:"intuition, inner voice, quiet knowing",        rev:"secrets withheld, ignored instinct" },
  { n:3,  name:"The Empress",         emoji:"🌸", up:"abundance, nurturing, creativity",             rev:"creative block, neglecting yourself" },
  { n:4,  name:"The Emperor",         emoji:"🏛️", up:"structure, authority, stability",              rev:"rigidity, control for its own sake" },
  { n:5,  name:"The Hierophant",      emoji:"📜", up:"tradition, learning, guidance",                rev:"rebellion, unconventional paths" },
  { n:6,  name:"The Lovers",          emoji:"💞", up:"partnership, alignment, meaningful choice",    rev:"imbalance, an avoided decision" },
  { n:7,  name:"The Chariot",         emoji:"🛡️", up:"determination, momentum, willpower",           rev:"lack of direction, stalled drive" },
  { n:8,  name:"Strength",            emoji:"🦁", up:"courage, patience, gentle power",              rev:"self-doubt, impatience" },
  { n:9,  name:"The Hermit",          emoji:"🏮", up:"reflection, solitude, inner search",           rev:"isolation, avoiding good advice" },
  { n:10, name:"Wheel of Fortune",    emoji:"🎡", up:"cycles, turning points, good fortune",         rev:"resistance to change, delay" },
  { n:11, name:"Justice",             emoji:"⚖️", up:"fairness, truth, accountability",              rev:"bias, avoided consequences" },
  { n:12, name:"The Hanged Man",      emoji:"🙃", up:"pause, a new perspective, letting go",         rev:"stalling, needless sacrifice" },
  { n:13, name:"Death",               emoji:"🦋", up:"endings, transformation, renewal",             rev:"clinging to the past, slow change" },
  { n:14, name:"Temperance",          emoji:"🕊️", up:"balance, moderation, blending",                rev:"excess, poor timing" },
  { n:15, name:"The Devil",           emoji:"⛓️", up:"attachment, habits, material focus",           rev:"breaking free, regaining choice" },
  { n:16, name:"The Tower",           emoji:"🗼", up:"sudden change, upheaval, truth revealed",      rev:"delayed disruption, fear of change" },
  { n:17, name:"The Star",            emoji:"⭐", up:"hope, renewal, inspiration",                   rev:"discouragement, lost faith" },
  { n:18, name:"The Moon",            emoji:"🌕", up:"imagination, uncertainty, dreams",             rev:"clarity returning, confusion lifting" },
  { n:19, name:"The Sun",             emoji:"☀️", up:"joy, vitality, success",                       rev:"temporary gloom, dimmed optimism" },
  { n:20, name:"Judgement",           emoji:"📯", up:"reckoning, awakening, honest review",          rev:"self-doubt, ignoring the call" },
  { n:21, name:"The World",           emoji:"🌍", up:"completion, wholeness, achievement",           rev:"unfinished business, a near miss" },
];
function RandomTarotCard() {
  const [draw, setDraw] = useState(null);
  const drawCard = () => {
    const card = TAROT_MAJOR[secureRandom(TAROT_MAJOR.length)];
    setDraw({ card, reversed: secureRandom(2) === 1 });
  };
  useEffect(() => { drawCard(); }, []); // eslint-disable-line
  return (
    <VStack gap={18}>
      <button onClick={drawCard} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf:"center" }}>🔮 Draw a Card</button>
      {draw && (
        <>
          <div style={{ maxWidth:340, margin:"0 auto", width:"100%", textAlign:"center", padding:"26px 20px", background:"rgba(244,63,94,0.07)", border:"1px solid rgba(244,63,94,0.3)", borderRadius:18 }}>
            <div style={{ fontSize:58, lineHeight:1, transform: draw.reversed ? "rotate(180deg)" : "none", display:"inline-block" }}>{draw.card.emoji}</div>
            <div style={{ ...T.label, marginTop:12 }}>Major Arcana · {draw.card.n}</div>
            <div style={{ fontSize:"clamp(22px,5vw,30px)", fontWeight:800, fontFamily:"'Sora',sans-serif", color:C.text, marginTop:4 }}>{draw.card.name}</div>
            <div style={{ marginTop:10 }}><Badge color={draw.reversed ? "amber" : "green"}>{draw.reversed ? "Reversed" : "Upright"}</Badge></div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.6, marginTop:14 }}>{draw.reversed ? draw.card.rev : draw.card.up}</div>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <CopyBtn text={`${draw.card.name} (${draw.card.n}) — ${draw.reversed ? "Reversed" : "Upright"}: ${draw.reversed ? draw.card.rev : draw.card.up}`} />
          </div>
          <Result mono={false}>For entertainment only. This is a novelty randomiser — it does not predict the future and must not be used for medical, legal, financial or other important decisions.</Result>
        </>
      )}
    </VStack>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
const TOOL_COMPONENTS = {
  "spinner-wheel": SpinnerWheel,
  "random-team-generator": RandomTeamGenerator,
  "random-picker": RandomPicker,
  "random-number-generator": RandomNumberGenerator,
  "random-letter-generator": RandomLetterGenerator,
  "dice-roller-3d": DiceRoller3D,
  "coin-flip-batch": CoinFlipBatch,
  "bingo-card-generator": BingoCardGenerator,
  "magic-8-ball": Magic8Ball,
  "yes-no-generator": YesNoGenerator,

  "random-color-picker": RandomColorPicker,
  "random-date-generator": RandomDateGenerator,
  "random-time-generator": RandomTimeGenerator,
  "lottery-number-generator": LotteryNumberGenerator,
  "random-password-phrase": RandomPassphraseGenerator,
  "random-emoji-generator": RandomEmojiGenerator,
  "random-binary-generator": RandomBinaryGenerator,
  "random-ip-generator": RandomIpGenerator,
  "random-seed-generator": SeededRandomGenerator,
  "random-group-assigner": RandomGroupAssigner,

  "list-shuffler": ListShuffler,
  "list-randomizer-weighted": WeightedRandomPicker,
  "random-line-picker": RandomLinePicker,
  "random-word-generator": RandomWordGenerator,
  "random-letter-sequence": RandomLetterSequence,
  "random-sentence-generator": RandomSentenceGenerator,
  "random-question-generator": RandomQuestionGenerator,
  "would-you-rather-generator": WouldYouRatherGenerator,
  "random-charades-generator": RandomCharadesGenerator,
  "random-trivia-generator": RandomTriviaGenerator,

  "random-animal-generator": RandomAnimalGenerator,
  "random-food-generator": RandomFoodGenerator,
  "random-movie-genre-generator": RandomMovieGenreGenerator,
  "random-country-picker": RandomCountryPicker,
  "random-name-generator-fun": RandomNameGeneratorFun,
  "random-username-generator": RandomUsernameGenerator,
  "random-hobby-generator": RandomHobbyGenerator,
  "random-color-palette": RandomColorPalette,
  "tournament-bracket-generator": TournamentBracketGenerator,
  "random-tarot-card": RandomTarotCard,
};

// ── Page shells ──────────────────────────────────────────────────────────────
function ToolPage({ toolId }) {
  const tool = TOOLS.find(t => t.id === toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  useEffect(() => {
    document.title = meta?.title || `${tool?.name} – Free Online Tool | ToolsRift`;
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
    document.title = `${cat?.name || 'Category'} – Randomizers & Games | ToolsRift`;
  }, [catId, cat]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📁</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.accent }}>← Back to home</a>
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.transform = "translateY(-2px)"; }}
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
    document.title = "Free Randomizers & Games – Spinner Wheel, Dice, Random Picker | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search randomizers & games..."
      />
    </CategoryLayout>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(244,63,94,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.accent, textDecoration:"none" }}>{THEME?.name||"Randomizers & Games"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(244,63,94,0.12)", color:C.accent, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(244,63,94,0.25)" }}>{TOOLS.length} tools</span>
        {/* PHASE 2: <UsageCounter/> */}
        <a href="/" style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:8, fontSize:12, fontWeight:600, color:"#E2E8F0", textDecoration:"none", background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}` }}>🏠 Home</a>
      </div>
    </nav>
  );
}

function SiteFooter({ currentPage }) {
  const pages = [
    {href:"/everyday",icon:"🧰",label:"Everyday Tools"},
    {href:"/business",icon:"💼",label:"Business"},
    {href:"/text",icon:"✍️",label:"Text Tools"},
    {href:"/json",icon:"🧑‍💻",label:"JSON Tools"},
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
        <a href="/" style={{fontSize:12,color:C.accent,textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftRandom() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="random"/>}
    </div>
  );
}

export default ToolsRiftRandom;
