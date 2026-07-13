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
      {options.map(o => {
        const val = Array.isArray(o) ? o[0] : o.value;
        const lab = Array.isArray(o) ? o[1] : o.label;
        return <option key={val} value={val}>{lab}</option>;
      })}
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
];

const CATEGORIES = [
  { id:"pickers", name:"Name Pickers & Wheels", icon:"🎡", desc:"Spinner wheel, random picker and team generator." },
  { id:"randomizers", name:"Random Generators", icon:"🎲", desc:"Numbers, letters, dice, coins and bingo cards." },
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
