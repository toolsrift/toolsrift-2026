import { useState, useEffect, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout from './shared/ToolPageLayout';

const THEME = getCategoryById("study");
const PAGE_THEME = getCategoryById("study");
const BRAND = { name: "ToolsRift", tagline: "Study & Education Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  accent: "#4F46E5", accentD: "#4338CA",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(79,70,229,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} @keyframes trShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-6px,4px) rotate(-4deg)}40%{transform:translate(6px,-4px) rotate(4deg)}60%{transform:translate(-5px,-3px) rotate(-3deg)}80%{transform:translate(5px,3px) rotate(3deg)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} } @media print{ body *{visibility:hidden!important} .tr-print,.tr-print *{visibility:visible!important} .tr-print{position:absolute!important;left:0;top:0;width:100%;background:#fff!important;color:#000!important;padding:0!important;border:none!important} .tr-print *{color:#000!important;background:transparent!important;border-color:#999!important} .tr-noprint{display:none!important} @page{margin:12mm} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ children, color = "rose" }) {
  const map = { rose:"rgba(79,70,229,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
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
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(79,70,229,0.25)` },
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(79,70,229,0.08)", border:`1px solid rgba(79,70,229,0.2)`, borderRadius:10 }}>
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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/study` }] : []),
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
  // ── study & revision ───────────────────────────────────────────────────────
  { id:"flashcard-maker", cat:"study", name:"Flashcard Maker", desc:"Paste term and definition lines to build flippable flashcards you can shuffle, mark known or unknown, track progress on and print.", icon:"🎴", free:true },
  { id:"quiz-generator", cat:"study", name:"Quiz Generator", desc:"Turn a list of questions and answers into a multiple-choice quiz you can take on screen, with instant scoring and a review of every answer.", icon:"📝", free:true },
  { id:"multiple-choice-maker", cat:"study", name:"Multiple Choice Maker", desc:"Build a printable multiple-choice worksheet from your own questions and options, complete with a separate answer key for marking.", icon:"🗒️", free:true },
  { id:"study-timer", cat:"study", name:"Study Timer (Pomodoro)", desc:"A configurable Pomodoro focus timer with custom work, short break and long break lengths, session counting and an end-of-cycle chime.", icon:"⏱️", free:true },
  { id:"spaced-repetition-planner", cat:"study", name:"Spaced Repetition Planner", desc:"Enter the day you first learned a topic and get the full spaced repetition review schedule at 1, 3, 7, 14 and 30 days with exact dates.", icon:"🔁", free:true },
  { id:"revision-planner", cat:"study", name:"Revision Timetable Planner", desc:"Split your subjects across the days you have left before an exam and get a balanced, printable revision timetable with daily study slots.", icon:"📆", free:true },
  { id:"grade-calculator", cat:"study", name:"Weighted Grade Calculator", desc:"Enter each assessment score and its weight to work out your weighted average, current percentage and letter grade for the whole course.", icon:"🎯", free:true },
  { id:"final-grade-needed", cat:"study", name:"Final Grade Calculator", desc:"Work out exactly what mark you need on the final exam to reach your target overall grade, based on your current grade and the exam weight.", icon:"📊", free:true },
  { id:"gpa-planner", cat:"study", name:"GPA Planner", desc:"Find the GPA you need across your remaining credits to reach a target cumulative GPA, based on your current GPA and credits already earned.", icon:"🎓", free:true },
  { id:"attendance-calculator", cat:"study", name:"Attendance Percentage Calculator", desc:"Work out your current attendance percentage and how many more classes in a row you must attend to reach your required minimum.", icon:"✅", free:true },
  { id:"exam-countdown", cat:"study", name:"Exam Countdown", desc:"List your exams and see how many days are left until each one, sorted by date, with weekdays and your available study days broken down.", icon:"⏳", free:true },
  { id:"random-question-picker", cat:"study", name:"Random Question Picker", desc:"Paste a question bank and draw questions at random for cold calling, self-testing or revision drills, with or without repeats.", icon:"🎲", free:true },

  // ── academic writing ───────────────────────────────────────────────────────
  { id:"citation-generator", cat:"writing", name:"Citation Generator", desc:"Create correctly formatted APA 7, MLA 9 and Chicago references for books, journal articles, websites, book chapters and online videos.", icon:"📖", free:true },
  { id:"bibliography-builder", cat:"writing", name:"Bibliography Builder", desc:"Add several sources, then export a complete alphabetised reference list or works cited page in APA 7, MLA 9 or Chicago style.", icon:"📚", free:true },
  { id:"in-text-citation-helper", cat:"writing", name:"In-Text Citation Helper", desc:"Get the correct parenthetical and narrative in-text citation for APA, MLA and Chicago, including two-author and three-or-more-author rules.", icon:"❝", free:true },
  { id:"essay-word-counter", cat:"writing", name:"Essay Word Counter", desc:"Count words, characters, sentences and paragraphs in your essay and see the estimated page count at common assignment formatting settings.", icon:"🔢", free:true },
  { id:"reading-time-estimator", cat:"writing", name:"Reading Time Estimator", desc:"Estimate how long a text takes to read silently or aloud at slow, average and fast words-per-minute speeds, with a speaking time too.", icon:"🕒", free:true },
  { id:"readability-scorer", cat:"writing", name:"Readability Score Checker", desc:"Score any text with Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog and SMOG, each explained in plain English with a target audience.", icon:"📈", free:true },
  { id:"paragraph-splitter", cat:"writing", name:"Paragraph Splitter", desc:"Break a wall of unformatted text into readable paragraphs at proper sentence boundaries, with a target number of sentences per paragraph.", icon:"¶", free:true },
  { id:"outline-builder", cat:"writing", name:"Essay Outline Builder", desc:"Turn an indented list of points into a properly formatted I, A, 1, a academic outline you can copy straight into your essay plan.", icon:"🗂️", free:true },
  { id:"note-summariser-formatter", cat:"writing", name:"Note Formatter", desc:"Clean up messy lecture notes into tidy bullet points, numbered steps or a Cornell-style layout using rule-based formatting, not AI.", icon:"🧾", free:true },

  // ── science reference ──────────────────────────────────────────────────────
  { id:"periodic-table", cat:"science", name:"Interactive Periodic Table", desc:"Explore all 118 elements and click any one for its symbol, atomic mass, category, group, period, electron configuration and state at room temperature.", icon:"⚛️", free:true },
  { id:"molar-mass-calculator", cat:"science", name:"Molar Mass Calculator", desc:"Work out the molar mass of any chemical formula, including nested brackets and hydrates, with a per-element breakdown and mass percentages.", icon:"⚗️", free:true },
  { id:"equation-balancer", cat:"science", name:"Chemical Equation Balancer", desc:"Balance any chemical equation by properly solving the linear system, returning the smallest whole-number coefficients or a clear reason it cannot balance.", icon:"⚖️", free:true },
  { id:"unit-prefix-reference", cat:"science", name:"SI Unit Prefix Table", desc:"The complete list of SI prefixes from quetta down to quecto with symbols, powers of ten, decimal factors and a familiar example of each.", icon:"📏", free:true },
  { id:"physical-constants", cat:"science", name:"Physical Constants Table", desc:"A searchable table of CODATA physical constants including c, h, e, G and the gas constant, each with its symbol, value and SI unit.", icon:"🔬", free:true },
  { id:"greek-alphabet-reference", cat:"science", name:"Greek Alphabet Reference", desc:"All 24 Greek letters in upper and lower case with names, pronunciation and the scientific quantities each letter usually stands for.", icon:"🔠", free:true },
  { id:"significant-figures-counter", cat:"science", name:"Significant Figures Calculator", desc:"Count the significant figures in any measurement and round it to a chosen number of sig figs, with the exact rule that was applied explained.", icon:"🔍", free:true },
  { id:"scientific-notation-converter", cat:"science", name:"Scientific Notation Converter", desc:"Convert numbers between decimal, scientific notation and engineering notation, with the E notation form and the order of magnitude shown.", icon:"🔢", free:true },
  { id:"multiplication-table-generator", cat:"science", name:"Multiplication Table Generator", desc:"Generate a printable times table grid for any range of numbers, plus a practice mode that quizzes you on random facts from that range.", icon:"✖️", free:true },
];

const CATEGORIES = [
  { id:"study", name:"Study & Revision", icon:"🎴", desc:"Flashcards, quizzes, timers and revision planners." },
  { id:"writing", name:"Academic Writing", icon:"📚", desc:"Citations, bibliographies and reference formatting." },
  { id:"science", name:"Science Reference", icon:"🔬", desc:"Periodic table, constants, chemistry and physics helpers." },
];

const TOOL_META = {
  "flashcard-maker": {
    title: "Free Flashcard Maker — Make & Print Flashcards Online",
    desc: "Free online flashcard maker. Paste your terms and definitions, flip through the cards, shuffle them, mark what you know and print a study sheet. No signup.",
    keywords: "flashcard maker, make flashcards online free, printable flashcards, study flashcards, digital flashcards, flashcard generator",
    faq: [
      ["How do I format my terms and definitions?", "Put one card per line and separate the term from the definition with a colon, for example 'Mitochondria : the organelle that produces ATP'. If your definition itself contains a colon, only the first colon is used as the split point, so the rest stays intact."],
      ["Can I save my flashcard deck?", "Yes. Press Save deck and it is stored in this browser's local storage, so it is still there when you come back on the same device and browser. Nothing is uploaded, so the deck will not follow you to another computer or a private window."],
      ["Can I print the flashcards?", "Yes. The print sheet lays your cards out two per row with the term and definition side by side, and the print stylesheet hides the rest of the page so you only use paper on the cards themselves."],
    ],
    howTo: "Type or paste one 'term : definition' pair per line, then press Build cards. Click a card to flip it, mark it known or still learning to track your progress, shuffle the deck for a harder test, and print the sheet when you want a paper copy.",
  },
  "quiz-generator": {
    title: "Quiz Generator — Make a Multiple Choice Quiz Free",
    desc: "Free quiz generator. Paste your questions and answers, and the tool builds a multiple-choice quiz with shuffled options, instant scoring and a full answer review.",
    keywords: "quiz generator, multiple choice quiz maker, make a quiz online free, self test quiz, practice quiz generator",
    faq: [
      ["Where do the wrong answers come from?", "The distractors are taken from the correct answers to your other questions, which keeps them plausible and on-topic without any AI guessing. That means you need at least four questions for a full set of four options per question."],
      ["Are the options shuffled?", "Yes. The correct answer is placed in a random position for every question, so you cannot learn the pattern of where the right answer sits. Re-generating the quiz reshuffles both the questions and the options."],
      ["Does it show me what I got wrong?", "Yes. After you submit, every question is listed with the answer you chose and the correct answer, and wrong answers are highlighted so you know exactly what to revise."],
    ],
    howTo: "Enter one question per line using 'question : answer' format, press Build quiz, then answer each question and press Submit. You get a score out of the total plus a question-by-question review showing the correct answer for anything you missed.",
  },
  "multiple-choice-maker": {
    title: "Multiple Choice Test Maker — Printable MCQ Worksheet",
    desc: "Free multiple choice worksheet maker for teachers and students. Enter questions with their options, then print a clean MCQ test paper plus a separate answer key.",
    keywords: "multiple choice test maker, mcq worksheet generator, printable quiz maker, exam paper generator, answer key generator",
    faq: [
      ["How do I mark the correct option?", "Put an asterisk in front of the correct option, for example '*Paris'. The worksheet prints without the asterisk so students cannot see the answer, while the answer key lists the correct letter for every question."],
      ["Can I print the paper without the answer key?", "Yes. The worksheet and the answer key are separate printable areas, so you can print the student paper on its own and only print the key when you are marking."],
      ["How many options can each question have?", "Anywhere from two to eight. Options are lettered A, B, C and so on automatically, and questions with different numbers of options can be mixed freely in the same worksheet."],
    ],
    howTo: "Write each question on its own line and put its options on the following lines starting with a dash, marking the correct one with an asterisk. Add a title and instructions, preview the worksheet on screen, then print the paper and the answer key separately.",
  },
  "study-timer": {
    title: "Study Timer — Free Online Pomodoro Focus Timer",
    desc: "Free Pomodoro study timer with custom work and break lengths, automatic long breaks, a session counter and a chime at the end of every cycle. Runs in-browser.",
    keywords: "study timer, pomodoro timer online, focus timer, 25 minute timer, revision timer, pomodoro study technique",
    faq: [
      ["What is the Pomodoro technique?", "You work in a fixed focus block, traditionally 25 minutes, then take a short break of about 5 minutes, and after four blocks you take a longer break of 15 to 30 minutes. The fixed cycle protects your attention and gives you a natural, guilt-free stopping point."],
      ["Can I change the lengths?", "Yes. Work, short break and long break lengths are all editable, as is how many work blocks happen before a long break, so you can use 50/10 deep-work cycles or short 15-minute blocks if that suits you better."],
      ["Will it make a sound when the timer ends?", "Yes. A short tone is generated with the browser's Web Audio API when each phase finishes, so no sound file is downloaded. You can mute it if you are working somewhere quiet, and the tab title also shows the time remaining."],
    ],
    howTo: "Set your work, short break and long break lengths, then press Start. The timer counts down, chimes, and moves automatically to the next phase, tracking how many focus sessions you have completed today.",
  },
  "spaced-repetition-planner": {
    title: "Spaced Repetition Planner — Review Schedule Calculator",
    desc: "Free spaced repetition schedule calculator. Enter the day you learned a topic and get the exact review dates at 1, 3, 7, 14 and 30 days, ready to copy into your calendar.",
    keywords: "spaced repetition planner, spaced repetition schedule, review schedule calculator, revision intervals, forgetting curve planner",
    faq: [
      ["Why review at 1, 3, 7, 14 and 30 days?", "These expanding intervals follow the forgetting curve: each review lands just as the memory begins to fade, which forces effortful recall and pushes the next forgetting point further out. Spacing reviews this way retains far more than reading the same material five times in one week."],
      ["Can I use different intervals?", "Yes. You can edit the interval list to match your own system, such as the 2/5/10/21 pattern or a longer set with 60 and 120 day reviews for material you need to keep for a final exam."],
      ["What if I miss a review?", "Do the missed review as soon as you can and keep the remaining dates as planned rather than restarting. A late review is still far more effective than skipping it, and only a very long gap justifies going back to a shorter interval."],
    ],
    howTo: "Pick the date you first studied the topic, adjust the interval list if you use a different system, and the planner instantly lists every review date with its weekday and how many days away it is.",
  },
  "revision-planner": {
    title: "Revision Timetable Maker — Free Printable Study Plan",
    desc: "Free revision timetable generator. Enter your subjects and the days you have left, and get a balanced day-by-day study plan with slots you can print and stick on the wall.",
    keywords: "revision timetable maker, study plan generator, revision planner, exam study schedule, printable timetable",
    faq: [
      ["How are subjects spread across the days?", "Subjects are dealt out in rotation across your available days, so no subject is left until the last minute and you never do the same subject in two consecutive slots where the timetable allows. You can also give a subject extra weight so a harder module gets more slots."],
      ["How many slots should I put in a day?", "Two to four solid slots is realistic for most students. Set the slots per day to match the time you genuinely have after classes and travel, because a timetable you cannot follow is worse than no timetable at all."],
      ["Can I print the timetable?", "Yes. The printable view shows a clean grid of dates down the page with each day's subject slots, with the site interface hidden so the whole sheet is your plan."],
    ],
    howTo: "List one subject per line, choose your start date, how many days you have and how many study slots fit in a day, then press Build timetable. Review the plan on screen and print it out.",
  },
  "grade-calculator": {
    title: "Weighted Grade Calculator — Work Out Your Course Grade",
    desc: "Free weighted grade calculator. Enter each assignment or exam score with its weight and instantly see your weighted average, overall percentage and letter grade.",
    keywords: "weighted grade calculator, course grade calculator, assignment weight calculator, current grade calculator, class grade calculator",
    faq: [
      ["How is a weighted grade worked out?", "Each score is converted to a percentage, multiplied by its weight, and the results are added together and divided by the total weight used. That means a 90% on a piece worth 40% of the course counts four times as much as a 90% on a piece worth 10%."],
      ["What if my weights do not add up to 100?", "The calculator divides by the total weight you actually entered, so partial weights still give a correct average of the work completed so far. It also tells you how much of the course weight is still outstanding."],
      ["Can I change the letter grade boundaries?", "Yes. The grade scale is editable, so you can use your own institution's cut-offs rather than the common A/B/C/D/F ninety-eighty-seventy scale that is set by default."],
    ],
    howTo: "Enter one assessment per line as 'name, score, max, weight', for example 'Midterm, 78, 100, 30'. Your weighted percentage, letter grade and remaining course weight update as you type.",
  },
  "final-grade-needed": {
    title: "Final Grade Calculator — What Do I Need On My Final?",
    desc: "Free final grade calculator. Enter your current grade, your target grade and how much the final exam is worth to see exactly what mark you need on the exam.",
    keywords: "final grade calculator, what do i need on my final, final exam grade calculator, required exam score, grade needed calculator",
    faq: [
      ["What formula does it use?", "Required final mark equals your target grade minus your current grade times one minus the exam weight, all divided by the exam weight. In plain terms it works out how much of the gap the exam alone has to close."],
      ["What if the number it gives is above 100?", "That means the target is no longer reachable with the exam weight you entered, even with a perfect paper. The tool says so directly and also shows the best possible final grade you can still achieve."],
      ["What if I need less than zero?", "That is good news: you have already secured your target and would still reach it even if you scored nothing on the final. The tool shows the minimum mark as zero and tells you the grade you are guaranteed."],
    ],
    howTo: "Type your current overall grade, the final grade you are aiming for and the percentage of the course the final exam is worth. The required exam mark appears instantly along with the best and worst grades still possible.",
  },
  "gpa-planner": {
    title: "GPA Planner — GPA Needed To Reach Your Target",
    desc: "Free GPA planner. Enter your current GPA, credits completed and credits remaining, and see the GPA you must average from here to hit your target cumulative GPA.",
    keywords: "gpa planner, gpa calculator target, gpa needed calculator, cumulative gpa calculator, raise my gpa",
    faq: [
      ["How is the required GPA worked out?", "Your current grade points equal your current GPA times the credits you have completed. The tool works out the total grade points your target needs across all credits, subtracts what you already have, and divides the shortfall by the credits you have left."],
      ["What if the required GPA is above 4.0?", "Then the target is not reachable on a 4.0 scale within the credits remaining, and the tool says so and shows the highest cumulative GPA you could still finish with. Taking more credits is usually the only way to change that."],
      ["Does it work with other GPA scales?", "Yes. Set the maximum to 5.0, 10.0 or whatever your institution uses and the arithmetic and the reachability check both follow that scale."],
    ],
    howTo: "Enter your current GPA, the credits you have already earned, the credits still to come and the cumulative GPA you are targeting. The required average appears immediately, with a note on whether it is realistic.",
  },
  "attendance-calculator": {
    title: "Attendance Calculator — Percentage & Classes Needed",
    desc: "Free attendance percentage calculator. See your current attendance, how many classes you can still miss, and how many you must attend in a row to hit 75% or any minimum.",
    keywords: "attendance calculator, attendance percentage calculator, 75 percent attendance, classes needed calculator, bunk calculator",
    faq: [
      ["How is attendance percentage calculated?", "It is the classes you attended divided by the total classes held, expressed as a percentage. Classes that were cancelled should not be counted in the total, because they were never held."],
      ["How many classes must I attend to recover?", "The tool solves for the smallest number of extra consecutive classes that lifts your percentage to the required minimum. If your current shortfall is large this number can be big, and if it exceeds the classes remaining the tool tells you the target is out of reach."],
      ["How many classes can I safely miss?", "Enter the total classes planned for the term and the tool shows how many of the remaining sessions you can skip while still finishing above your required percentage."],
    ],
    howTo: "Enter the classes you have attended, the total held so far and the minimum percentage your course requires. Your current percentage, the classes you must attend next and the number you can still afford to miss all appear instantly.",
  },
  "exam-countdown": {
    title: "Exam Countdown — Days Left Until Each Exam",
    desc: "Free exam countdown timer. List all your exams with their dates and see the days remaining to each, sorted by date, with weekdays and study days between them.",
    keywords: "exam countdown, days until exam calculator, exam date countdown, study days left, exam timetable countdown",
    faq: [
      ["How is the number of days counted?", "It counts whole calendar days from today to the exam date, so an exam tomorrow shows one day left and an exam today shows zero and is flagged as today. Time of day is ignored so daylight saving changes cannot shift the count."],
      ["What is the study days breakdown?", "As well as total days it shows how many of those are weekdays and how many are weekend days, which makes it much easier to plan realistically when your weekdays are full of classes."],
      ["Can I track several exams at once?", "Yes. Add as many exams as you like, one per line with its date, and the list is automatically sorted so the most urgent exam is always at the top with past exams greyed out."],
    ],
    howTo: "Enter one exam per line as 'subject, YYYY-MM-DD'. The countdown sorts them by date and shows days remaining, the weekday of each exam and the split of weekdays and weekend days you have to study.",
  },
  "random-question-picker": {
    title: "Random Question Picker — Cold Call & Self-Test Tool",
    desc: "Free random question picker for classrooms and revision. Paste a question bank and draw questions at random, with or without repeats, and reveal answers on demand.",
    keywords: "random question picker, cold call generator, random question generator, self test tool, revision question picker",
    faq: [
      ["Can I stop the same question coming up twice?", "Yes. Turn on no repeats and each question is removed from the pool once it has been drawn, so you work through the whole bank before anything repeats. A counter shows how many questions are left."],
      ["Can I hide the answers?", "Yes. If your lines include an answer after a colon, the answer stays hidden behind a reveal button so you can attempt recall first, which is what makes self-testing effective."],
      ["Is the pick genuinely random?", "Yes. Questions are drawn using your browser's cryptographically secure random generator, so every remaining question has an exactly equal chance each time and there is no bias towards the start of the list."],
    ],
    howTo: "Paste one question per line, optionally with 'question : answer', choose whether repeats are allowed, and press Draw. A random question appears full size for the class or for your own recall practice.",
  },

  "citation-generator": {
    title: "Citation Generator — Free APA 7, MLA 9 & Chicago",
    desc: "Free citation generator for APA 7th, MLA 9th and Chicago style. Fill in the details of a book, journal article, website, chapter or video and copy the formatted reference.",
    keywords: "citation generator, apa 7 citation generator, mla 9 citation, chicago style citation, reference generator free",
    faq: [
      ["Which styles and source types are supported?", "APA 7th edition, MLA 9th edition and Chicago notes-bibliography style, each for books, journal articles, websites, chapters in edited books and online videos. All three formatted versions are generated at once so you can compare them."],
      ["How does it handle multiple authors?", "Each style has its own rule and the generator applies it. APA lists up to twenty authors with an ampersand before the last, MLA names the first author then 'et al.' from three authors upward, and Chicago inverts only the first author and uses 'and' before the last."],
      ["Are the italics included when I copy?", "The on-screen reference shows italics exactly where the style requires them, and the copy button gives you plain text. Paste it into your document and re-apply italics to the title, or paste with formatting into a word processor that keeps it."],
    ],
    howTo: "Choose the source type, fill in the author, year, title and publication details you have, and the APA, MLA and Chicago versions build as you type. Copy the style your department asks for straight into your reference list.",
  },
  "bibliography-builder": {
    title: "Bibliography Builder — Free Works Cited List Maker",
    desc: "Free bibliography and works cited builder. Add all your sources, pick APA 7, MLA 9 or Chicago, and export one alphabetised, correctly formatted reference list.",
    keywords: "bibliography builder, works cited generator, reference list maker, apa reference list, mla works cited page",
    faq: [
      ["How is the list ordered?", "Alphabetically by the first author's surname, which is what APA, MLA and Chicago all require for a reference list. Sources with no author are alphabetised by title, again following the published rules."],
      ["Are my sources saved?", "Your list is kept in this browser's local storage, so it survives a refresh and is still there next time you open the tool on the same device. Nothing is uploaded, so clearing browser data or moving to another computer will lose it — export the list when you are done."],
      ["Can I switch styles after adding sources?", "Yes. Sources are stored as structured fields, not as formatted text, so switching between APA, MLA and Chicago instantly reformats the whole list without you re-typing anything."],
    ],
    howTo: "Add each source with its type, authors, year, title and publication details, then choose your style. The full alphabetised reference list is generated below, ready to copy or download as a text file.",
  },
  "in-text-citation-helper": {
    title: "In-Text Citation Helper — APA, MLA & Chicago Format",
    desc: "Free in-text citation helper. Enter the authors, year and page and get the correct parenthetical and narrative citation in APA 7, MLA 9 and Chicago style.",
    keywords: "in text citation generator, apa in text citation, mla parenthetical citation, chicago in text citation, narrative citation",
    faq: [
      ["What is the difference between parenthetical and narrative?", "A parenthetical citation puts everything in brackets at the end, such as (Smith & Jones, 2020). A narrative citation puts the authors in the sentence itself and only the rest in brackets, such as Smith and Jones (2020) argued that."],
      ["How are three or more authors handled?", "APA uses the first author plus 'et al.' from three authors upward, MLA does the same from three authors, and Chicago author-date uses 'et al.' from four authors while listing two or three in full. The helper applies whichever rule matches the style you pick."],
      ["Do I need a page number?", "For a direct quotation, yes, in every style. For a paraphrase APA and Chicago make it optional but recommended, while MLA expects a page number whenever the source has them."],
    ],
    howTo: "Type the author surnames one per line, add the year and the page number if you have one, and pick your style. The correct parenthetical and narrative forms appear side by side with the rule that was applied.",
  },
  "essay-word-counter": {
    title: "Essay Word Counter — Words, Pages & Character Count",
    desc: "Free essay word counter. Get live word, character, sentence and paragraph counts plus the estimated page count at double-spaced and single-spaced formatting.",
    keywords: "essay word counter, word count for essay, words to pages calculator, character counter, paragraph counter",
    faq: [
      ["How many pages is my essay?", "It depends on formatting. A typical double-spaced page in 12pt Times New Roman with one-inch margins holds around 275 words, and a single-spaced page around 550, so the counter shows both estimates rather than one misleading number."],
      ["Does the count include headings and references?", "It counts everything in the box, so paste only the part your word limit applies to. Most departments exclude the reference list and sometimes long quotations, so check your handbook and paste accordingly."],
      ["How are sentences counted?", "Sentences are split on full stops, question marks and exclamation marks, with common abbreviations such as e.g. and Dr. handled so they do not create false sentence breaks."],
    ],
    howTo: "Paste your essay into the box and every count updates as you type. Adjust the words-per-page setting to match your assignment brief and the page estimate follows immediately.",
  },
  "reading-time-estimator": {
    title: "Reading Time Estimator — How Long To Read This Text",
    desc: "Free reading time calculator. Paste any text to see how long it takes to read silently at slow, average and fast speeds, plus how long it takes to read aloud.",
    keywords: "reading time calculator, how long to read, words per minute calculator, speech time calculator, presentation time estimator",
    faq: [
      ["What reading speed should I use?", "Around 130 words per minute is a careful, studying pace, 240 is the average adult silent reading speed for general material, and 400 is fast skimming. Dense academic or technical text sits at the slower end, so use the study pace when planning revision."],
      ["How do I work out a presentation length?", "Use the reading-aloud figure. Most people speak at 130 to 150 words per minute when presenting, so a 10-minute talk is roughly 1,300 to 1,500 words including pauses."],
      ["Does it count differently for long words?", "The estimate is based on word count at the chosen speed, which is the standard method. Very dense material genuinely reads slower, so drop the words-per-minute setting rather than trusting a single fixed figure."],
    ],
    howTo: "Paste your text and the reading times appear straight away at study, average and fast speeds, along with the time to read it aloud. Change the words-per-minute setting to match your own pace.",
  },
  "readability-scorer": {
    title: "Readability Checker — Flesch, Fog & SMOG Score Free",
    desc: "Free readability score checker. Get Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog and SMOG for any text, each explained with the audience it suits.",
    keywords: "readability checker, flesch reading ease calculator, flesch kincaid grade level, gunning fog index, smog readability score",
    faq: [
      ["What is a good Flesch Reading Ease score?", "Scores run from 0 to 100, where 60 to 70 is plain English suitable for most adults and newspapers, 30 to 50 is difficult and typical of academic writing, and below 30 is very hard. Higher is easier, which is the opposite direction to the grade-level scores."],
      ["Which score should I trust?", "Look at them together. Flesch-Kincaid, Gunning Fog and SMOG all report a US school grade level, and if all three cluster around the same number that is a solid signal, while a wide spread usually means unusual sentence lengths or lots of long technical terms."],
      ["How are syllables counted?", "Syllables are estimated with a vowel-group heuristic that merges consecutive vowels, drops silent trailing e, and handles the -le ending and common exceptions. It is very close to a dictionary count for ordinary English but can be off by one on unusual names and loanwords."],
    ],
    howTo: "Paste your text and all four readability scores calculate instantly, together with the word, sentence and syllable counts they are built from and a plain-English reading of what each score means.",
  },
  "paragraph-splitter": {
    title: "Paragraph Splitter — Break Text Into Paragraphs Free",
    desc: "Free paragraph splitter. Turn a wall of unbroken text into readable paragraphs split at proper sentence boundaries, with your chosen number of sentences per paragraph.",
    keywords: "paragraph splitter, split text into paragraphs, add paragraph breaks, text formatter, break up long text",
    faq: [
      ["Where does it split the text?", "Only at real sentence endings — a full stop, question mark or exclamation mark followed by a space and a capital letter. Common abbreviations such as Dr., e.g. and U.S. are recognised so they never cause a split in the middle of a sentence."],
      ["How many sentences per paragraph is best?", "Three to five works well for essays and blog posts, which is the default. Academic writing often runs longer, and web copy often shorter, so set the number to match the piece you are writing."],
      ["Does it change my words?", "No. Not a single word or punctuation mark is altered — the tool only inserts blank lines between groups of sentences and normalises stray double spaces, so your text stays exactly as you wrote it."],
    ],
    howTo: "Paste the unbroken text, choose how many sentences you want in each paragraph, and the formatted version appears below ready to copy back into your document.",
  },
  "outline-builder": {
    title: "Essay Outline Builder — I, A, 1, a Outline Generator",
    desc: "Free essay outline generator. Type an indented list of your points and get a properly formatted academic outline numbered I, A, 1, a with correct nesting.",
    keywords: "essay outline generator, outline builder, alphanumeric outline format, research paper outline, mla outline maker",
    faq: [
      ["How do I set the levels?", "Indent with tabs or spaces. Every two spaces or one tab moves a point down one level, so a top-level heading gets a Roman numeral, its children get capital letters, then Arabic numbers, then lowercase letters, then lowercase Roman numerals."],
      ["What numbering does it use?", "The standard alphanumeric outline used across US and UK academic writing: I, II, III for main sections, A, B, C for subsections, 1, 2, 3 below that, then a, b, c and i, ii, iii. Numbering restarts correctly inside each parent."],
      ["Can I paste it into Word?", "Yes. The output is plain text with real indentation, so it pastes cleanly into Word, Google Docs or any editor without bringing hidden list formatting with it."],
    ],
    howTo: "Type your points one per line and indent sub-points beneath their parent. The formatted I, A, 1, a outline builds live beside your input, ready to copy into your essay plan.",
  },
  "note-summariser-formatter": {
    title: "Note Formatter — Clean Up Messy Notes Into Bullets",
    desc: "Free note formatter. Turn messy lecture notes into tidy bullet points, numbered steps or a Cornell-style layout using rule-based cleanup — no AI, nothing uploaded.",
    keywords: "note formatter, clean up notes, bullet point generator, cornell notes template, lecture notes formatter",
    faq: [
      ["Does this use AI to summarise my notes?", "No. It is purely rule-based formatting: it trims whitespace, removes duplicate blank lines, strips stray bullet characters, capitalises the first letter of each point and re-lays the text out in the structure you choose. Your wording is never rewritten or invented."],
      ["What is the Cornell layout?", "Cornell notes split the page into a narrow cue column for questions and keywords, a wide notes column for the detail, and a summary strip at the bottom. The tool builds that layout from your points so you can print it and fill in the cue column as you review."],
      ["Can it turn a paragraph into bullets?", "Yes. Choose sentence mode and each sentence becomes its own bullet point, which is a fast way to convert a block of typed-up lecture prose into scannable revision notes."],
    ],
    howTo: "Paste your raw notes, pick bullets, numbered steps or the Cornell layout, and choose whether to split on lines or on sentences. The cleaned-up version appears instantly, ready to copy or print.",
  },

  "periodic-table": {
    title: "Interactive Periodic Table — All 118 Elements Free",
    desc: "Free interactive periodic table of the elements. Click any of the 118 elements for its atomic number, standard atomic weight, category, electron configuration and state.",
    keywords: "periodic table, interactive periodic table, periodic table of elements, atomic mass table, electron configuration table",
    faq: [
      ["Which atomic masses are shown?", "The standard atomic weights published by IUPAC, given to five significant figures. For elements with no stable isotope, such as technetium and everything beyond bismuth, the value shown is the mass number of the most stable or best-characterised isotope, which is the usual convention."],
      ["Where do the electron configurations come from?", "Configurations follow the Madelung (aufbau) filling order, with the well-known experimental exceptions applied individually — chromium, copper, niobium, molybdenum, palladium, silver, platinum, gold, lanthanum, cerium, gadolinium and the early actinides all show their measured configurations rather than the naive prediction."],
      ["Why are lanthanides and actinides shown separately?", "The f-block is conventionally printed below the main table so the chart fits a page. Lanthanum to lutetium all sit in period 6 and actinium to lawrencium in period 7, between groups 2 and 3, and clicking any of them shows its true period."],
    ],
    howTo: "Browse the full table laid out by group and period, use the search box to jump to an element by name, symbol or atomic number, and click any tile to open its detail panel with mass, category, configuration and state.",
  },
  "molar-mass-calculator": {
    title: "Molar Mass Calculator — Molecular Weight From Formula",
    desc: "Free molar mass calculator. Enter any chemical formula, including brackets and hydrates like CuSO4.5H2O, to get the molar mass and a full per-element breakdown.",
    keywords: "molar mass calculator, molecular weight calculator, formula mass calculator, molar mass of compound, hydrate molar mass",
    faq: [
      ["Does it handle brackets and hydrates?", "Yes. Nested brackets such as Ca(OH)2 and Al2(SO4)3 are parsed correctly at any depth, and hydrates written with a dot or a middle dot, like CuSO4.5H2O or Na2CO3·10H2O, apply the leading coefficient to the whole water portion."],
      ["How precise are the results?", "Masses use IUPAC standard atomic weights, so CuSO4·5H2O comes out at about 249.68 g/mol. Your textbook may differ in the last digit if it rounds atomic weights to one or two decimal places before adding them up."],
      ["What does the percentage composition show?", "For each element it gives the total mass contributed by that element divided by the molar mass of the whole compound, which is exactly what a percentage composition question asks for and what you compare against empirical formula data."],
    ],
    howTo: "Type a chemical formula using correct capitalisation, such as C6H12O6 or Ca(OH)2, and the molar mass appears immediately with each element's atom count, contribution in grams per mole and percentage by mass.",
  },
  "equation-balancer": {
    title: "Chemical Equation Balancer — Free & Actually Solves It",
    desc: "Free chemical equation balancer. Enter reactants and products and get the smallest whole-number coefficients, solved by Gaussian elimination rather than guesswork.",
    keywords: "chemical equation balancer, balance chemical equations, balancing equations calculator, stoichiometry balancer, equation solver chemistry",
    faq: [
      ["How does the balancer work?", "Each compound becomes a column and each element a row of a linear system, with reactants positive and products negative. The tool row-reduces that matrix over exact fractions and reads the null-space vector, then scales it to the smallest positive whole numbers, so the answer is mathematically proven rather than trial and error."],
      ["What if my equation cannot be balanced?", "It says so and explains why, rather than returning wrong numbers. The usual causes are an element appearing on only one side, a typo in a formula, or a redox half-equation missing its ions and electrons."],
      ["How should I type the equation?", "Use plain formulas separated by plus signs with -> or = between the two sides, for example C3H8 + O2 -> CO2 + H2O. Brackets are fine, existing coefficients are ignored and recalculated, and state symbols like (s) or (aq) are stripped automatically."],
    ],
    howTo: "Type the unbalanced equation with reactants on the left and products on the right, then press Balance. The balanced equation appears with the smallest whole-number coefficients and an atom-count check for every element.",
  },
  "unit-prefix-reference": {
    title: "SI Prefixes Table — Quetta to Quecto With Examples",
    desc: "Complete SI unit prefix table from quetta to quecto with symbols, powers of ten, full decimal factors and a real-world example of each prefix. Free reference.",
    keywords: "si prefixes, metric prefixes table, unit prefix chart, kilo mega giga tera, nano pico femto prefixes",
    faq: [
      ["How many SI prefixes are there?", "Twenty-four, running from quetta at ten to the thirtieth down to quecto at ten to the minus thirtieth. Ronna, quetta, ronto and quecto were added by the General Conference on Weights and Measures in 2022, mainly to cope with data storage and particle-scale measurements."],
      ["Which prefixes use capital letters?", "Every prefix from mega upward uses a capital symbol — M, G, T, P, E, Z, Y, R, Q — while kilo and below use lowercase, apart from the special case that kilo is a lowercase k. Getting this wrong matters: mK and MK differ by nine orders of magnitude."],
      ["Are kibi and mebi the same as kilo and mega?", "No. The binary prefixes kibi, mebi and gibi mean 1024, 1024² and 1024³, while the SI kilo, mega and giga always mean powers of a thousand. That is why a 1 TB drive shows as about 931 GiB in an operating system."],
    ],
    howTo: "Search or browse the full table of SI prefixes and read off the symbol, power of ten, decimal factor and example for each. Use the converter below it to move a value between any two prefixes.",
  },
  "physical-constants": {
    title: "Physical Constants Table — CODATA Values & Units",
    desc: "Searchable table of fundamental physical constants with CODATA values, symbols and SI units — speed of light, Planck constant, G, the gas constant and more.",
    keywords: "physical constants table, codata constants, speed of light value, planck constant value, gas constant value, avogadro number",
    faq: [
      ["Which constants are exact?", "Since the 2019 SI redefinition, seven defining constants have exact values with no uncertainty: the speed of light, the Planck constant, the elementary charge, the Boltzmann constant, the Avogadro constant, the caesium hyperfine frequency and the luminous efficacy. Everything else, including G, is measured and carries an uncertainty."],
      ["Why does the gravitational constant have so few digits?", "G is notoriously hard to measure because gravity is extremely weak and cannot be shielded, so it is known to only about five significant figures — far fewer than atomic constants, which are known to ten or more."],
      ["Which values are these?", "The CODATA recommended values, which are the internationally agreed set used in physics and chemistry. Each entry lists the symbol, the value in SI units and the unit itself, and you can copy any value with one click."],
    ],
    howTo: "Search the table by name or symbol to find a constant, read its value and SI unit, and copy the plain number or the full expression into your calculation or lab report.",
  },
  "greek-alphabet-reference": {
    title: "Greek Alphabet Chart — Letters, Names & Science Uses",
    desc: "All 24 Greek letters in upper and lower case with names, pronunciation and the quantities each stands for in maths, physics, chemistry and statistics. Free chart.",
    keywords: "greek alphabet, greek letters chart, greek alphabet pronunciation, greek letters in physics, alpha beta gamma delta",
    faq: [
      ["Why do sigma and theta have two lowercase forms?", "Lowercase sigma is written ς at the end of a word and σ everywhere else, a rule from written Greek that carries into typesetting. Theta has an alternative ϑ form used in some maths texts, and pi, phi, epsilon and rho have similar variant glyphs."],
      ["Which letters are used for what in science?", "The chart lists the standard uses: alpha for angular acceleration and significance level, lambda for wavelength, mu for the micro prefix and the mean, sigma for standard deviation and summation, omega for angular frequency and ohms, and so on for all 24."],
      ["Can I copy the letters?", "Yes. Each letter has a copy button that puts the actual Unicode character on your clipboard, so you can paste α or Ω straight into a document, spreadsheet or code without hunting through a symbol menu."],
    ],
    howTo: "Browse the full chart of Greek letters with their names, pronunciation and typical scientific meanings, and press copy on any letter to put the Unicode character on your clipboard.",
  },
  "significant-figures-counter": {
    title: "Significant Figures Calculator — Count & Round Sig Figs",
    desc: "Free significant figures calculator. Count the sig figs in any measurement and round it to a chosen number, with the exact rule that decides each digit explained.",
    keywords: "significant figures calculator, sig fig counter, round to significant figures, sig figs rules, significant digits calculator",
    faq: [
      ["What are the rules for significant figures?", "All non-zero digits count, zeros between non-zero digits count, leading zeros never count, and trailing zeros count only when there is a decimal point. That is why 0.00450 has three significant figures while 4500 has an ambiguous two, three or four."],
      ["How do I show that 4500 has four sig figs?", "Write it in scientific notation as 4.500 × 10³, or add a decimal point as 4500. — both make the trailing zeros unambiguous. The tool flags ambiguous trailing zeros rather than silently guessing what you meant."],
      ["How does rounding to sig figs work?", "Keep the required number of significant digits and look at the next one: round up at five or above, down below five. The tool shows the rounded value in both plain and scientific notation so trailing-zero significance is never lost."],
    ],
    howTo: "Type a measurement such as 0.004520 or 1.230e4 and the significant figure count appears with a digit-by-digit explanation. Set a target number of sig figs to see the correctly rounded value.",
  },
  "scientific-notation-converter": {
    title: "Scientific Notation Converter — Standard Form Calculator",
    desc: "Free scientific notation converter. Change any number between decimal, scientific notation and engineering notation, with E notation and order of magnitude shown.",
    keywords: "scientific notation converter, standard form calculator, engineering notation converter, e notation converter, order of magnitude calculator",
    faq: [
      ["What is scientific notation?", "A number written as a coefficient between 1 and 10 multiplied by a power of ten, such as 6.022 × 10²³. It keeps very large and very small numbers readable and makes the number of significant figures explicit."],
      ["How is engineering notation different?", "Engineering notation restricts the exponent to multiples of three, so the coefficient runs from 1 to 999. That lines the exponent up with the SI prefixes, which is why 47,000 ohms is written 47 × 10³ Ω and read as 47 kilohms."],
      ["What is E notation?", "It is the plain-text form calculators and programming languages use, where 6.022e23 means 6.022 × 10²³. The tool shows it alongside the typeset version so you can paste values straight into a spreadsheet or code."],
    ],
    howTo: "Enter a number in any form — 0.00045, 4.5e-4 or 4.5 x 10^-4 — and the decimal, scientific, engineering and E-notation versions all appear together with the order of magnitude.",
  },
  "multiplication-table-generator": {
    title: "Multiplication Table Generator — Printable Times Tables",
    desc: "Free times table generator. Make a printable multiplication grid for any range of numbers, then switch to practice mode for randomly drilled multiplication facts.",
    keywords: "multiplication table generator, printable times tables, times table chart, multiplication grid maker, times tables practice",
    faq: [
      ["What range can I generate?", "Any range you like, from a small 1 to 10 grid up to a 1 to 30 chart, and you can set the rows and columns independently if you only want to drill the 7 times table against 1 to 12."],
      ["Does it print well?", "Yes. The print stylesheet hides everything except the grid, so you get a clean black-on-white chart that fits a page, with the diagonal square numbers shaded so patterns are easy to spot."],
      ["How does practice mode work?", "It draws random facts from the range you set and checks your answer as you type, keeping a running score and streak. Getting one wrong shows the correct answer immediately so the fact is corrected while it is fresh."],
    ],
    howTo: "Set the number ranges for rows and columns to build the grid, view it on screen and print it out. Switch to practice mode to be quizzed on random facts from the same range with instant marking.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  TOOLS
// ══════════════════════════════════════════════════════════════════════════════

// ── Shared helpers ───────────────────────────────────────────────────────────
const LS_PREFIX = "toolsrift_study_";
function lsGet(key) {
  try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : null; }
  catch (e) { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); return null; }
  catch (e) {
    if (e && (e.name === "QuotaExceededError" || e.code === 22)) return "Browser storage is full — remove some saved data and try again.";
    return "Could not save — this browser is blocking local storage (private mode?).";
  }
}
function lsDel(key) { try { localStorage.removeItem(LS_PREFIX + key); } catch (e) {} }

function LocalNote({ children }) {
  return <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.55 }}>🔒 {children || "Saved data stays in this browser only — it is never uploaded and will not follow you to another device."}</div>;
}
function Note({ children }) {
  return <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.55 }}>{children}</div>;
}
function Paper({ children, style = {} }) {
  return (
    <div className="tr-print" style={{ background: "#fff", color: "#111", borderRadius: 10, padding: "22px 24px", fontFamily: "'Plus Jakarta Sans',sans-serif", ...style }}>
      {children}
    </div>
  );
}
function PrintBtn({ label = "🖨️ Print" }) {
  return <Btn variant="secondary" size="sm" onClick={() => { if (typeof window !== "undefined") window.print(); }}>{label}</Btn>;
}
const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayISO = () => toISO(new Date());
const parseISO = (s) => {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((s || "").trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null;
  return d;
};
const addDays = (d, n) => { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; };
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const prettyDate = (d) => `${DAY_NAMES[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS_LONG[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
const daysBetween = (a, b) => Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000);

// ══ 1. Flashcard Maker ════════════════════════════════════════════════════════
const FC_SAMPLE = `Mitochondrion : The organelle that generates most of the cell's ATP through respiration
Osmosis : Movement of water across a semi-permeable membrane from low to high solute concentration
Catalyst : A substance that speeds up a reaction without being consumed by it
Isotope : Atoms of the same element with the same protons but different neutron counts
Photosynthesis : The process converting light energy, water and carbon dioxide into glucose and oxygen
Covalent bond : A bond formed when two atoms share one or more pairs of electrons`;

function FlashcardMaker() {
  const [raw, setRaw] = useState(FC_SAMPLE);
  const [cards, setCards] = useState([]);
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState({});
  const [msg, setMsg] = useState("");

  const parse = (text) => text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const i = line.indexOf(":");
    if (i === -1) return { term: line, def: "(no definition given)" };
    return { term: line.slice(0, i).trim() || "(blank)", def: line.slice(i + 1).trim() || "(no definition given)" };
  });

  const build = (text) => {
    const c = parse(text === undefined ? raw : text);
    setCards(c); setOrder(c.map((_, i) => i)); setIdx(0); setFlipped(false); setStatus({});
  };
  useEffect(() => { build(FC_SAMPLE); /* eslint-disable-next-line */ }, []);

  const cur = cards[order[idx]];
  const known = Object.values(status).filter(v => v === "known").length;
  const learning = Object.values(status).filter(v => v === "learning").length;
  const go = (d) => { setFlipped(false); setIdx(i => (i + d + order.length) % Math.max(1, order.length)); };
  const mark = (v) => {
    const key = order[idx];
    setStatus(s => ({ ...s, [key]: s[key] === v ? undefined : v }));
    setTimeout(() => go(1), 150);
  };

  const save = () => {
    const err = lsSet("flashcards", { raw, status });
    setMsg(err || "✓ Deck saved in this browser.");
    setTimeout(() => setMsg(""), 3000);
  };
  const load = () => {
    const d = lsGet("flashcards");
    if (!d) { setMsg("No saved deck found in this browser."); setTimeout(() => setMsg(""), 3000); return; }
    setRaw(d.raw || ""); build(d.raw || ""); setStatus(d.status || {});
    setMsg("✓ Saved deck loaded."); setTimeout(() => setMsg(""), 3000);
  };

  return (
    <VStack gap={16}>
      <div className="tr-noprint">
        <Label>Cards — one per line as “term : definition” ({cards.length} cards)</Label>
        <Textarea value={raw} onChange={setRaw} rows={7} placeholder="Term : definition" />
      </div>
      <div className="tr-noprint" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn onClick={() => build()}>🎴 Build cards</Btn>
        <Btn variant="secondary" size="md" onClick={() => { setOrder(shuffle(order)); setIdx(0); setFlipped(false); }} disabled={cards.length < 2}>🔀 Shuffle</Btn>
        <Btn variant="secondary" size="md" onClick={() => { setStatus({}); setIdx(0); setFlipped(false); }}>↺ Reset progress</Btn>
        <Btn variant="secondary" size="md" onClick={save}>💾 Save deck</Btn>
        <Btn variant="secondary" size="md" onClick={load}>📂 Load saved</Btn>
        <PrintBtn label="🖨️ Print sheet" />
      </div>
      {msg && <Result mono={false}>{msg}</Result>}

      {cards.length === 0 && <Result mono={false}>Add at least one line in the form “term : definition” to build your deck.</Result>}

      {cur && (
        <div className="tr-noprint">
          <div onClick={() => setFlipped(f => !f)}
            style={{ cursor: "pointer", minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "28px 24px", borderRadius: 16, background: flipped ? "rgba(79,70,229,0.10)" : C.surface, border: `1px solid ${flipped ? "rgba(79,70,229,0.35)" : C.border}`, transition: "all .2s" }}>
            <div style={{ ...T.label, marginBottom: 10 }}>{flipped ? "Definition" : "Term"} · card {idx + 1} of {order.length}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: flipped ? 17 : 26, fontWeight: flipped ? 500 : 700, lineHeight: 1.45, color: C.text }}>{flipped ? cur.def : cur.term}</div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: C.muted }}>Click the card to flip it</div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
            <Btn variant="secondary" size="sm" onClick={() => go(-1)}>← Previous</Btn>
            <Btn variant="secondary" size="sm" onClick={() => setFlipped(f => !f)}>🔄 Flip</Btn>
            <Btn variant="secondary" size="sm" onClick={() => go(1)}>Next →</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <Btn size="sm" onClick={() => mark("known")} style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>✓ I know this</Btn>
            <Btn variant="danger" size="sm" onClick={() => mark("learning")}>↻ Still learning</Btn>
          </div>
          <Grid3>
            <StatBox value={known} label="Known" />
            <StatBox value={learning} label="Still learning" />
            <StatBox value={cards.length - known - learning} label="Not seen" />
          </Grid3>
          <div style={{ marginTop: 10, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${cards.length ? (known / cards.length) * 100 : 0}%`, height: "100%", background: "linear-gradient(90deg,#10B981,#059669)", transition: "width .3s" }} />
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <>
          <div className="tr-noprint" style={{ ...T.label, marginTop: 4 }}>Print preview</div>
          <Paper>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Flashcards ({cards.length})</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {cards.map((c, i) => (
                <div key={i} style={{ border: "1px solid #999", borderRadius: 6, padding: "10px 12px", pageBreakInside: "avoid" }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{i + 1}. {c.term}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.45 }}>{c.def}</div>
                </div>
              ))}
            </div>
          </Paper>
        </>
      )}
      <LocalNote />
    </VStack>
  );
}

// ══ 2. Quiz Generator ═════════════════════════════════════════════════════════
const QZ_SAMPLE = `What is the powerhouse of the cell? : Mitochondrion
What gas do plants absorb for photosynthesis? : Carbon dioxide
What is the chemical symbol for gold? : Au
Who wrote the play Hamlet? : William Shakespeare
What is the capital city of Japan? : Tokyo
What force keeps planets in orbit around the Sun? : Gravity`;

function QuizGenerator() {
  const [raw, setRaw] = useState(QZ_SAMPLE);
  const [quiz, setQuiz] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [err, setErr] = useState("");

  const build = (text) => {
    const pairs = (text === undefined ? raw : text).split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const i = l.indexOf(":");
      if (i === -1) return null;
      const q = l.slice(0, i).trim(), a = l.slice(i + 1).trim();
      return q && a ? { q, a } : null;
    }).filter(Boolean);
    if (pairs.length < 2) { setErr("Add at least two lines in the form “question : answer” to build a quiz."); setQuiz([]); return; }
    setErr("");
    const built = shuffle(pairs).map(p => {
      const others = shuffle(pairs.filter(x => x.a !== p.a).map(x => x.a)).slice(0, 3);
      const opts = shuffle([p.a, ...others]);
      return { q: p.q, a: p.a, opts };
    });
    setQuiz(built); setAnswers({}); setSubmitted(false);
  };
  useEffect(() => { build(QZ_SAMPLE); /* eslint-disable-next-line */ }, []);

  const score = quiz.reduce((s, q, i) => s + (answers[i] === q.a ? 1 : 0), 0);

  return (
    <VStack gap={16}>
      <div>
        <Label>Question bank — one “question : answer” per line</Label>
        <Textarea value={raw} onChange={setRaw} rows={7} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn onClick={() => build()}>📝 Build quiz</Btn>
        <Btn variant="secondary" size="md" onClick={() => { setAnswers({}); setSubmitted(false); }} disabled={!quiz.length}>↺ Retake</Btn>
      </div>
      {err && <Result mono={false}>{err}</Result>}

      {quiz.map((q, i) => (
        <Card key={i} style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{i + 1}. {q.q}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {q.opts.map((o, j) => {
              const chosen = answers[i] === o;
              const correct = submitted && o === q.a;
              const wrong = submitted && chosen && o !== q.a;
              return (
                <button key={j} onClick={() => { if (!submitted) setAnswers(a => ({ ...a, [i]: o })); }}
                  style={{ textAlign: "left", padding: "9px 12px", borderRadius: 8, cursor: submitted ? "default" : "pointer", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
                    background: correct ? "rgba(16,185,129,0.15)" : wrong ? "rgba(239,68,68,0.15)" : chosen ? "rgba(79,70,229,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${correct ? "rgba(16,185,129,0.5)" : wrong ? "rgba(239,68,68,0.5)" : chosen ? "rgba(79,70,229,0.5)" : C.border}`, color: C.text }}>
                  <b style={{ color: C.muted, marginRight: 8 }}>{"ABCD"[j]}</b>{o}{correct ? "  ✓" : wrong ? "  ✗" : ""}
                </button>
              );
            })}
          </div>
        </Card>
      ))}

      {quiz.length > 0 && !submitted && (
        <Btn onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length === 0}>✅ Submit answers</Btn>
      )}
      {submitted && (
        <>
          <BigResult value={`${score} / ${quiz.length}`} label={`${Math.round((score / quiz.length) * 100)}% correct`} />
          <Result mono={false}>
            {quiz.map((q, i) => `${i + 1}. ${q.q}\n   Your answer: ${answers[i] || "(not answered)"}\n   Correct answer: ${q.a}`).join("\n\n")}
          </Result>
        </>
      )}
      <Note>Wrong options are drawn from the answers to your other questions, so add at least four questions for a full set of four choices.</Note>
    </VStack>
  );
}

// ══ 3. Multiple Choice Maker ══════════════════════════════════════════════════
const MCQ_SAMPLE = `Which organelle carries out aerobic respiration?
- Ribosome
- *Mitochondrion
- Golgi apparatus
- Lysosome
What is the pH of a neutral solution at 25 °C?
- 0
- *7
- 10
- 14
Which particle has no electric charge?
- Proton
- Electron
- *Neutron
- Alpha particle`;

function MultipleChoiceMaker() {
  const [raw, setRaw] = useState(MCQ_SAMPLE);
  const [title, setTitle] = useState("Science Quiz — Unit 3");
  const [instructions, setInstructions] = useState("Circle the letter of the best answer for each question. 1 mark each.");

  const parsed = (() => {
    const lines = raw.split("\n").map(l => l.trimEnd()).filter(l => l.trim());
    const qs = []; let cur = null;
    for (const line of lines) {
      const t = line.trim();
      if (/^[-*•]\s*/.test(t) && cur) {
        let o = t.replace(/^[-•]\s*/, "");
        const correct = o.startsWith("*");
        if (correct) o = o.slice(1).trim();
        if (o) cur.opts.push({ text: o, correct });
      } else {
        cur = { q: t, opts: [] };
        qs.push(cur);
      }
    }
    return qs.filter(q => q.opts.length >= 2);
  })();

  const [showKey, setShowKey] = useState(true);
  const letter = (i) => String.fromCharCode(65 + i);

  return (
    <VStack gap={16}>
      <div className="tr-noprint">
        <Grid2>
          <div><Label>Worksheet title</Label><Input value={title} onChange={setTitle} /></div>
          <div><Label>Instructions</Label><Input value={instructions} onChange={setInstructions} /></div>
        </Grid2>
      </div>
      <div className="tr-noprint">
        <Label>Questions — options on following lines starting with “-”, correct one marked “*”</Label>
        <Textarea value={raw} onChange={setRaw} rows={12} mono />
      </div>
      <div className="tr-noprint" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <PrintBtn label="🖨️ Print what is shown" />
        <Btn variant="secondary" size="sm" onClick={() => setShowKey(k => !k)}>{showKey ? "Hide answer key" : "Show answer key"}</Btn>
        <Note>Hide the key before printing the student paper.</Note>
      </div>

      {parsed.length === 0 ? (
        <Result mono={false}>No valid questions yet. Each question needs at least two option lines beginning with a dash, and one of them marked with an asterisk.</Result>
      ) : (
        <>
          <div className="tr-noprint" style={T.label}>Worksheet preview ({parsed.length} questions)</div>
          <Paper>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700 }}>{title || "Worksheet"}</div>
            <div style={{ fontSize: 12, marginTop: 4, marginBottom: 6 }}>{instructions}</div>
            <div style={{ fontSize: 12, borderTop: "1px solid #999", paddingTop: 8, marginBottom: 14 }}>Name: ______________________________   Class: ____________   Date: ____________</div>
            {parsed.map((q, i) => (
              <div key={i} style={{ marginBottom: 14, pageBreakInside: "avoid" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{i + 1}. {q.q}</div>
                {q.opts.map((o, j) => (
                  <div key={j} style={{ fontSize: 12.5, marginLeft: 14, lineHeight: 1.7 }}>({letter(j)}) {o.text}</div>
                ))}
              </div>
            ))}
            {showKey && (
              <div style={{ borderTop: "2px solid #333", marginTop: 18, paddingTop: 10 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Answer key</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.9 }}>
                  {parsed.map((q, i) => {
                    const k = q.opts.findIndex(o => o.correct);
                    return <span key={i} style={{ marginRight: 16, display: "inline-block" }}>{i + 1}. {k === -1 ? "—" : letter(k)}</span>;
                  })}
                </div>
                {parsed.some(q => q.opts.findIndex(o => o.correct) === -1) && (
                  <div style={{ fontSize: 11.5, marginTop: 6 }}>Questions showing “—” have no option marked with an asterisk.</div>
                )}
              </div>
            )}
          </Paper>
        </>
      )}
    </VStack>
  );
}

// ══ 4. Study Timer ════════════════════════════════════════════════════════════
function StudyTimer() {
  const [work, setWork] = useState("25");
  const [shortB, setShortB] = useState("5");
  const [longB, setLongB] = useState("15");
  const [cycles, setCycles] = useState("4");
  const [muted, setMuted] = useState(false);
  const [phase, setPhase] = useState("work");
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const tick = useRef(null);

  const mins = (v, fb) => { const n = parseInt(v, 10); return isNaN(n) || n < 1 ? fb : Math.min(180, n); };
  const durationFor = (p) => (p === "work" ? mins(work, 25) : p === "short" ? mins(shortB, 5) : mins(longB, 15)) * 60;

  const chime = () => {
    if (muted) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      [880, 1320].forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
        g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.22 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.2);
        o.connect(g); g.connect(ctx.destination);
        o.start(ctx.currentTime + i * 0.22); o.stop(ctx.currentTime + i * 0.22 + 0.25);
      });
      setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1200);
    } catch (e) { /* audio unavailable — silently continue */ }
  };

  const advance = () => {
    chime();
    if (phase === "work") {
      const n = done + 1;
      setDone(n);
      const per = mins(cycles, 4);
      const next = n % per === 0 ? "long" : "short";
      setPhase(next); setLeft(durationFor(next));
    } else {
      setPhase("work"); setLeft(durationFor("work"));
    }
  };

  useEffect(() => {
    if (!running) return;
    tick.current = setInterval(() => setLeft(l => l - 1), 1000);
    return () => clearInterval(tick.current);
  }, [running]);

  useEffect(() => { if (left < 0) advance(); /* eslint-disable-next-line */ }, [left]);
  useEffect(() => { if (!running) setLeft(durationFor(phase)); /* eslint-disable-next-line */ }, [work, shortB, longB]);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const mm = Math.max(0, Math.floor(left / 60)), ss = Math.max(0, left % 60);
    if (running) document.title = `${pad2(mm)}:${pad2(ss)} · ${phase === "work" ? "Focus" : "Break"} — Study Timer`;
  }, [left, running, phase]);

  const mm = Math.max(0, Math.floor(left / 60)), ss = Math.max(0, left % 60);
  const total = durationFor(phase) || 1;
  const pct = Math.max(0, Math.min(100, ((total - Math.max(0, left)) / total) * 100));
  const phaseName = phase === "work" ? "Focus session" : phase === "short" ? "Short break" : "Long break";
  const phaseColor = phase === "work" ? C.accent : "#10B981";

  return (
    <VStack gap={16}>
      <div style={{ textAlign: "center", padding: "30px 20px", borderRadius: 16, background: phase === "work" ? "rgba(79,70,229,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${phase === "work" ? "rgba(79,70,229,0.25)" : "rgba(16,185,129,0.25)"}` }}>
        <div style={{ ...T.label, color: phaseColor }}>{phaseName}</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(48px,14vw,84px)", fontWeight: 700, color: C.text, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{pad2(mm)}:{pad2(ss)}</div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", margin: "14px auto 0", maxWidth: 380 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: phaseColor, transition: "width 1s linear" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <Btn onClick={() => setRunning(r => !r)}>{running ? "⏸ Pause" : "▶ Start"}</Btn>
        <Btn variant="secondary" size="md" onClick={() => { setRunning(false); setLeft(durationFor(phase)); }}>↺ Reset phase</Btn>
        <Btn variant="secondary" size="md" onClick={() => { setRunning(false); setPhase("work"); setLeft(durationFor("work")); setDone(0); }}>⏹ Reset all</Btn>
        <Btn variant="secondary" size="md" onClick={() => setMuted(m => !m)}>{muted ? "🔇 Sound off" : "🔔 Sound on"}</Btn>
      </div>
      <Grid2>
        <div><Label>Focus minutes</Label><Input value={work} onChange={setWork} /></div>
        <div><Label>Short break minutes</Label><Input value={shortB} onChange={setShortB} /></div>
        <div><Label>Long break minutes</Label><Input value={longB} onChange={setLongB} /></div>
        <div><Label>Focus blocks before a long break</Label><Input value={cycles} onChange={setCycles} /></div>
      </Grid2>
      <Grid3>
        <StatBox value={done} label="Sessions done" />
        <StatBox value={`${Math.round((done * mins(work, 25)) / 6) / 10} h`} label="Focus time" />
        <StatBox value={mins(cycles, 4) - (done % mins(cycles, 4))} label="Until long break" />
      </Grid3>
      <Note>The countdown keeps running while this tab is open. Session counts are not saved, so they reset if you reload the page.</Note>
    </VStack>
  );
}

// ══ 5. Spaced Repetition Planner ══════════════════════════════════════════════
function SpacedRepetitionPlanner() {
  const [start, setStart] = useState(todayISO());
  const [topic, setTopic] = useState("Cell biology — chapter 4");
  const [intervals, setIntervals] = useState("1, 3, 7, 14, 30");

  const d0 = parseISO(start);
  const list = intervals.split(/[,\s]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n > 0 && n <= 3650);
  const uniq = Array.from(new Set(list)).sort((a, b) => a - b);
  const today = new Date();

  const rows = d0 ? uniq.map(n => {
    const d = addDays(d0, n);
    const away = daysBetween(today, d);
    return [`+${n} day${n === 1 ? "" : "s"}`, toISO(d), DAY_NAMES[d.getDay()], away === 0 ? "Today" : away > 0 ? `in ${away} days` : `${-away} days ago`];
  }) : [];

  const copyText = d0 ? uniq.map(n => `${toISO(addDays(d0, n))} — review: ${topic} (day ${n})`).join("\n") : "";

  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Topic</Label><Input value={topic} onChange={setTopic} /></div>
        <div><Label>Date first studied (YYYY-MM-DD)</Label><Input value={start} onChange={setStart} /></div>
      </Grid2>
      <div><Label>Review intervals in days</Label><Input value={intervals} onChange={setIntervals} placeholder="1, 3, 7, 14, 30" /></div>
      {!d0 && <Result mono={false}>Enter a valid date in YYYY-MM-DD format, for example {todayISO()}.</Result>}
      {d0 && uniq.length === 0 && <Result mono={false}>Enter at least one positive interval, such as 1, 3, 7, 14, 30.</Result>}
      {d0 && uniq.length > 0 && (
        <>
          <Grid3>
            <StatBox value={uniq.length} label="Reviews" />
            <StatBox value={`${uniq[uniq.length - 1]} d`} label="Last review at" />
            <StatBox value={prettyDate(addDays(d0, uniq[0]))} label="Next review" />
          </Grid3>
          <DataTable columns={["Interval", "Date", "Weekday", "From today"]} rows={rows} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
      <Note>Expanding intervals work because each review lands as the memory starts to fade, forcing effortful recall. If you miss one, do it late and keep the remaining dates as planned.</Note>
    </VStack>
  );
}

// ══ 6. Revision Timetable Planner ═════════════════════════════════════════════
function RevisionPlanner() {
  const [subjects, setSubjects] = useState("Biology x2\nChemistry x2\nMathematics\nPhysics\nEnglish Literature");
  const [start, setStart] = useState(todayISO());
  const [days, setDays] = useState("10");
  const [slots, setSlots] = useState("3");
  const [restDay, setRestDay] = useState("none");

  const parsed = subjects.split("\n").map(s => s.trim()).filter(Boolean).map(s => {
    const m = /^(.*?)\s*[x×]\s*(\d+)$/i.exec(s);
    return m ? { name: m[1].trim(), weight: Math.min(5, Math.max(1, parseInt(m[2], 10))) } : { name: s, weight: 1 };
  }).filter(s => s.name);

  const d0 = parseISO(start);
  const nDays = Math.max(1, Math.min(120, parseInt(days, 10) || 1));
  const nSlots = Math.max(1, Math.min(8, parseInt(slots, 10) || 1));

  const pool = [];
  parsed.forEach(s => { for (let i = 0; i < s.weight; i++) pool.push(s.name); });

  const plan = [];
  if (d0 && pool.length) {
    let p = 0;
    for (let i = 0; i < nDays; i++) {
      const d = addDays(d0, i);
      if (restDay !== "none" && d.getDay() === parseInt(restDay, 10)) { plan.push({ date: d, rest: true, items: [] }); continue; }
      const items = [];
      let guard = 0;
      while (items.length < nSlots && guard < pool.length * 4) {
        const cand = pool[p % pool.length]; p++; guard++;
        if (items.length && items[items.length - 1] === cand && pool.length > 1) continue;
        items.push(cand);
      }
      while (items.length < nSlots) items.push(pool[p++ % pool.length]);
      plan.push({ date: d, rest: false, items });
    }
  }

  const copyText = plan.map(r => `${toISO(r.date)} (${DAY_NAMES[r.date.getDay()]}): ${r.rest ? "REST DAY" : r.items.join(" | ")}`).join("\n");
  const counts = {};
  plan.forEach(r => r.items.forEach(s => { counts[s] = (counts[s] || 0) + 1; }));

  return (
    <VStack gap={16}>
      <div className="tr-noprint">
        <Label>Subjects — one per line, add “x2” for double weighting</Label>
        <Textarea value={subjects} onChange={setSubjects} rows={6} />
      </div>
      <div className="tr-noprint">
        <Grid2>
          <div><Label>Start date</Label><Input value={start} onChange={setStart} /></div>
          <div><Label>Days available</Label><Input value={days} onChange={setDays} /></div>
          <div><Label>Study slots per day</Label><Input value={slots} onChange={setSlots} /></div>
          <div><Label>Rest day</Label><SelectInput value={restDay} onChange={setRestDay} options={[["none", "No rest day"], ["0", "Sundays off"], ["6", "Saturdays off"]]} /></div>
        </Grid2>
      </div>
      {!d0 && <Result mono={false}>Enter a valid start date in YYYY-MM-DD format.</Result>}
      {d0 && parsed.length === 0 && <Result mono={false}>Add at least one subject to build a timetable.</Result>}
      {plan.length > 0 && (
        <>
          <div className="tr-noprint" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <PrintBtn label="🖨️ Print timetable" /><CopyBtn text={copyText} />
            <Note>{plan.filter(r => !r.rest).length} study days · {plan.filter(r => !r.rest).length * nSlots} slots total</Note>
          </div>
          <div className="tr-noprint" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.keys(counts).sort().map(k => (
              <span key={k} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 20, background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.25)", color: C.text }}>{k} · {counts[k]} slots</span>
            ))}
          </div>
          <Paper>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Revision Timetable</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #333", width: 150 }}>Day</th>
                  {Array.from({ length: nSlots }, (_, i) => <th key={i} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "2px solid #333" }}>Slot {i + 1}</th>)}
                </tr>
              </thead>
              <tbody>
                {plan.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: "6px 8px", borderBottom: "1px solid #ccc", fontWeight: 600 }}>{DAY_NAMES[r.date.getDay()].slice(0, 3)} {r.date.getDate()} {MONTHS_LONG[r.date.getMonth()].slice(0, 3)}</td>
                    {r.rest
                      ? <td colSpan={nSlots} style={{ padding: "6px 8px", borderBottom: "1px solid #ccc", fontStyle: "italic" }}>Rest day</td>
                      : r.items.map((s, j) => <td key={j} style={{ padding: "6px 8px", borderBottom: "1px solid #ccc" }}>{s}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </>
      )}
    </VStack>
  );
}

// ══ 7. Weighted Grade Calculator ══════════════════════════════════════════════
const DEFAULT_SCALE = "A 90\nB 80\nC 70\nD 60\nF 0";
function GradeCalculator() {
  const [raw, setRaw] = useState("Homework, 88, 100, 15\nQuiz average, 74, 100, 15\nMidterm, 81, 100, 30\nLab report, 92, 100, 10\nFinal exam, , 100, 30");
  const [scaleRaw, setScaleRaw] = useState(DEFAULT_SCALE);

  const rows = raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split(",").map(s => s.trim());
    const score = p[1] === "" || p[1] === undefined ? null : parseFloat(p[1]);
    const max = parseFloat(p[2]);
    const weight = parseFloat(p[3]);
    return { name: p[0] || "(unnamed)", score: isNaN(score) ? null : score, max: isNaN(max) || max <= 0 ? null : max, weight: isNaN(weight) ? null : weight };
  });
  const valid = rows.filter(r => r.max !== null && r.weight !== null && r.weight > 0);
  const graded = valid.filter(r => r.score !== null);
  const usedWeight = graded.reduce((s, r) => s + r.weight, 0);
  const totalWeight = valid.reduce((s, r) => s + r.weight, 0);
  const points = graded.reduce((s, r) => s + (r.score / r.max) * 100 * r.weight, 0);
  const avg = usedWeight > 0 ? points / usedWeight : null;

  const scale = scaleRaw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const m = /^(\S+)\s+(-?[\d.]+)$/.exec(l);
    return m ? { g: m[1], min: parseFloat(m[2]) } : null;
  }).filter(Boolean).sort((a, b) => b.min - a.min);
  const letter = avg === null ? "—" : (scale.find(s => avg >= s.min) || { g: "—" }).g;

  return (
    <VStack gap={16}>
      <div>
        <Label>Assessments — one per line: name, score, max, weight</Label>
        <Textarea value={raw} onChange={setRaw} rows={7} mono />
      </div>
      <Note>Leave the score blank for work you have not done yet — it is excluded from the average but still counted as outstanding weight.</Note>
      {valid.length === 0 ? (
        <Result mono={false}>No valid rows yet. Each line needs a name, a score, a maximum and a weight, separated by commas — for example “Midterm, 78, 100, 30”.</Result>
      ) : (
        <>
          <Grid3>
            <StatBox value={avg === null ? "—" : `${avg.toFixed(2)}%`} label="Weighted average" />
            <StatBox value={letter} label="Letter grade" />
            <StatBox value={`${Math.max(0, totalWeight - usedWeight).toFixed(0)}%`} label="Weight outstanding" />
          </Grid3>
          <DataTable
            columns={["Assessment", "Score", "Percent", "Weight", "Contribution"]}
            rows={valid.map(r => [r.name, r.score === null ? "—" : `${r.score} / ${r.max}`, r.score === null ? "—" : `${((r.score / r.max) * 100).toFixed(1)}%`, `${r.weight}%`, r.score === null ? "pending" : `${(((r.score / r.max) * 100 * r.weight) / 100).toFixed(2)} pts`])}
          />
          {Math.abs(totalWeight - 100) > 0.01 && <Note>Your weights add up to {totalWeight}%, not 100%. The average shown divides by the {usedWeight}% you have actually been graded on, which is correct for a running grade.</Note>}
        </>
      )}
      <div><Label>Grade scale — “letter minimum-percent” per line</Label><Textarea value={scaleRaw} onChange={setScaleRaw} rows={5} mono /></div>
    </VStack>
  );
}

// ══ 8. Final Grade Needed ═════════════════════════════════════════════════════
function FinalGradeNeeded() {
  const [current, setCurrent] = useState("78");
  const [target, setTarget] = useState("85");
  const [weight, setWeight] = useState("30");

  const c = parseFloat(current), t = parseFloat(target), w = parseFloat(weight);
  const bad = isNaN(c) || isNaN(t) || isNaN(w) || w <= 0 || w > 100;
  const wf = w / 100;
  const need = bad ? null : (t - c * (1 - wf)) / wf;
  const best = bad ? null : c * (1 - wf) + 100 * wf;
  const worst = bad ? null : c * (1 - wf);

  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Current grade %</Label><Input value={current} onChange={setCurrent} /></div>
        <div><Label>Target overall grade %</Label><Input value={target} onChange={setTarget} /></div>
        <div><Label>Final exam weight %</Label><Input value={weight} onChange={setWeight} /></div>
      </Grid3>
      {bad ? (
        <Result mono={false}>Enter your current grade, your target grade and a final exam weight between 1 and 100.</Result>
      ) : (
        <>
          <BigResult value={need <= 0 ? "Already secured" : need > 100 ? "Not reachable" : `${need.toFixed(1)}%`} label="Mark needed on the final exam" />
          {need <= 0 && <Result mono={false}>Good news — you have already done enough. Even scoring 0% on the final you would finish on {worst.toFixed(1)}%, which meets your {t}% target.</Result>}
          {need > 100 && <Result mono={false}>A {t}% overall grade is no longer possible: even a perfect 100% on the final gives you {best.toFixed(1)}%. To reach {t}% the final would need to be worth at least {(((t - c) / (100 - c)) * 100).toFixed(1)}% of the course.</Result>}
          {need > 0 && need <= 100 && <Result mono={false}>Score at least {need.toFixed(1)}% on the final and your overall grade will reach {t}%. Every extra mark on the exam moves your overall grade by {(wf).toFixed(2)} points.</Result>}
          <Grid3>
            <StatBox value={`${worst.toFixed(1)}%`} label="If you score 0%" />
            <StatBox value={`${(c * (1 - wf) + 50 * wf).toFixed(1)}%`} label="If you score 50%" />
            <StatBox value={`${best.toFixed(1)}%`} label="If you score 100%" />
          </Grid3>
          <Note>Formula: required = (target − current × (1 − weight)) ÷ weight, with weight as a decimal. This assumes your current grade already covers all the other {(100 - w).toFixed(0)}% of the course.</Note>
        </>
      )}
    </VStack>
  );
}

// ══ 9. GPA Planner ════════════════════════════════════════════════════════════
function GpaPlanner() {
  const [gpa, setGpa] = useState("3.2");
  const [earned, setEarned] = useState("60");
  const [remaining, setRemaining] = useState("60");
  const [target, setTarget] = useState("3.5");
  const [scale, setScale] = useState("4");

  const g = parseFloat(gpa), ce = parseFloat(earned), cr = parseFloat(remaining), t = parseFloat(target), s = parseFloat(scale);
  const bad = [g, ce, cr, t, s].some(isNaN) || cr <= 0 || ce < 0 || s <= 0;
  const need = bad ? null : (t * (ce + cr) - g * ce) / cr;
  const maxPossible = bad ? null : (g * ce + s * cr) / (ce + cr);
  const minPossible = bad ? null : (g * ce) / (ce + cr);

  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Current GPA</Label><Input value={gpa} onChange={setGpa} /></div>
        <div><Label>Credits completed</Label><Input value={earned} onChange={setEarned} /></div>
        <div><Label>Credits remaining</Label><Input value={remaining} onChange={setRemaining} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Target cumulative GPA</Label><Input value={target} onChange={setTarget} /></div>
        <div><Label>GPA scale maximum</Label><Input value={scale} onChange={setScale} /></div>
      </Grid2>
      {bad ? (
        <Result mono={false}>Enter your current GPA, credits completed, credits remaining (must be more than zero), a target GPA and the scale maximum.</Result>
      ) : (
        <>
          <BigResult value={need > s ? "Not reachable" : need <= 0 ? "Already secured" : need.toFixed(2)} label={`GPA needed across your remaining ${cr} credits`} />
          {need > s && <Result mono={false}>A {t.toFixed(2)} cumulative GPA is out of reach on a {s} scale: even straight {s.toFixed(1)}s across all {cr} remaining credits leaves you at {maxPossible.toFixed(3)}. Taking more credits, or lowering the target, is the only way to change that.</Result>}
          {need <= 0 && <Result mono={false}>You have already banked enough grade points — your cumulative GPA stays at or above {t.toFixed(2)} whatever you score from here.</Result>}
          {need > 0 && need <= s && <Result mono={false}>Average {need.toFixed(2)} across your remaining {cr} credits and you finish on a {t.toFixed(2)} cumulative GPA. That is {need > g ? `${(need - g).toFixed(2)} above` : `${(g - need).toFixed(2)} below`} your current average.</Result>}
          <Grid3>
            <StatBox value={minPossible.toFixed(2)} label="Worst case final GPA" />
            <StatBox value={(g * ce).toFixed(1)} label="Grade points earned" />
            <StatBox value={maxPossible.toFixed(2)} label="Best case final GPA" />
          </Grid3>
        </>
      )}
    </VStack>
  );
}

// ══ 10. Attendance Calculator ═════════════════════════════════════════════════
function AttendanceCalculator() {
  const [attended, setAttended] = useState("32");
  const [held, setHeld] = useState("45");
  const [required, setRequired] = useState("75");
  const [planned, setPlanned] = useState("60");

  const a = parseInt(attended, 10), h = parseInt(held, 10), r = parseFloat(required), tp = parseInt(planned, 10);
  const bad = isNaN(a) || isNaN(h) || isNaN(r) || h <= 0 || a < 0 || a > h || r < 0 || r > 100;
  const pct = bad ? null : (a / h) * 100;
  let needed = null, impossible = false;
  if (!bad) {
    if (pct >= r) needed = 0;
    else if (r >= 100) { impossible = true; }
    else needed = Math.max(0, Math.ceil((r * h - 100 * a) / (100 - r)));
  }
  const totalPlanned = isNaN(tp) || tp < h ? null : tp;
  const canMiss = totalPlanned === null || bad ? null : Math.max(0, Math.floor((totalPlanned - h) - ((r / 100) * totalPlanned - a)));

  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Classes attended</Label><Input value={attended} onChange={setAttended} /></div>
        <div><Label>Classes held so far</Label><Input value={held} onChange={setHeld} /></div>
        <div><Label>Required minimum %</Label><Input value={required} onChange={setRequired} /></div>
      </Grid3>
      <div><Label>Total classes planned for the term (optional)</Label><Input value={planned} onChange={setPlanned} /></div>
      {bad ? (
        <Result mono={false}>Check your numbers — classes held must be more than zero, and classes attended cannot be more than classes held.</Result>
      ) : (
        <>
          <BigResult value={`${pct.toFixed(2)}%`} label={`Current attendance (${a} of ${h} classes)`} />
          <Grid3>
            <StatBox value={pct >= r ? "✓ Above" : "✗ Below"} label={`${r}% requirement`} />
            <StatBox value={impossible ? "—" : needed} label="Classes to attend in a row" />
            <StatBox value={canMiss === null ? "—" : canMiss} label="Classes you can still miss" />
          </Grid3>
          {pct >= r && <Result mono={false}>You are {(pct - r).toFixed(2)} percentage points above the {r}% requirement. {canMiss !== null ? `Out of the ${totalPlanned - h} classes still to come you can miss up to ${canMiss} and stay above the line.` : "Enter the total classes planned to see how many you can still afford to miss."}</Result>}
          {pct < r && !impossible && <Result mono={false}>You are {(r - pct).toFixed(2)} percentage points short. Attend the next {needed} class{needed === 1 ? "" : "es"} without missing any and you reach {(((a + needed) / (h + needed)) * 100).toFixed(2)}%.{totalPlanned !== null && needed > totalPlanned - h ? ` Only ${totalPlanned - h} classes remain this term, so ${r}% is no longer reachable — the best you can finish on is ${(((a + (totalPlanned - h)) / totalPlanned) * 100).toFixed(2)}%.` : ""}</Result>}
          {impossible && <Result mono={false}>A 100% requirement cannot be recovered once a class has been missed, because past absences stay in the total.</Result>}
          <Note>Cancelled classes should not be counted in the classes held, since they were never actually taught.</Note>
        </>
      )}
    </VStack>
  );
}

// ══ 11. Exam Countdown ════════════════════════════════════════════════════════
function ExamCountdown() {
  const upcoming = (n) => toISO(addDays(new Date(), n));
  const [raw, setRaw] = useState(`Mathematics Paper 1, ${upcoming(9)}\nBiology, ${upcoming(16)}\nChemistry, ${upcoming(23)}\nEnglish Literature, ${upcoming(31)}`);
  const today = new Date();

  const rows = raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const i = l.lastIndexOf(",");
    if (i === -1) return { name: l, date: null };
    return { name: l.slice(0, i).trim() || "(unnamed)", date: parseISO(l.slice(i + 1)) };
  });
  const valid = rows.filter(r => r.date).map(r => {
    const days = daysBetween(today, r.date);
    let week = 0, wknd = 0;
    for (let k = 1; k <= Math.max(0, days); k++) { const d = addDays(today, k); if (d.getDay() === 0 || d.getDay() === 6) wknd++; else week++; }
    return { ...r, days, week, wknd };
  }).sort((a, b) => a.days - b.days);
  const invalid = rows.filter(r => !r.date);

  return (
    <VStack gap={16}>
      <div>
        <Label>Exams — one per line as “subject, YYYY-MM-DD”</Label>
        <Textarea value={raw} onChange={setRaw} rows={6} mono />
      </div>
      {invalid.length > 0 && <Result mono={false}>{invalid.length} line{invalid.length === 1 ? " has" : "s have"} no valid date. Use the form “Biology, 2026-05-14”.</Result>}
      {valid.length === 0 ? (
        <Result mono={false}>Add at least one exam with a valid date to start the countdown.</Result>
      ) : (
        <>
          {valid.filter(v => v.days >= 0).length > 0 && (
            <BigResult value={`${valid.find(v => v.days >= 0).days} day${valid.find(v => v.days >= 0).days === 1 ? "" : "s"}`} label={`until ${valid.find(v => v.days >= 0).name}`} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {valid.map((v, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 10, background: v.days < 0 ? "rgba(255,255,255,0.02)" : C.surface, border: `1px solid ${v.days < 0 ? C.border : v.days <= 7 ? "rgba(239,68,68,0.35)" : C.border}`, opacity: v.days < 0 ? 0.5 : 1, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{prettyDate(v.date)}{v.days >= 0 ? ` · ${v.week} weekdays + ${v.wknd} weekend days to study` : ""}</div>
                </div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: v.days < 0 ? C.muted : v.days <= 7 ? "#F87171" : C.accent }}>
                  {v.days < 0 ? "past" : v.days === 0 ? "today" : `${v.days}d`}
                </div>
              </div>
            ))}
          </div>
          <CopyBtn text={valid.map(v => `${v.name}: ${toISO(v.date)} (${v.days < 0 ? "past" : v.days + " days left"})`).join("\n")} />
        </>
      )}
    </VStack>
  );
}

// ══ 12. Random Question Picker ════════════════════════════════════════════════
const RQ_SAMPLE = `Define osmosis and give one example : Movement of water across a semi-permeable membrane from a dilute to a concentrated solution — for example water entering a root hair cell
State Newton's second law : Force equals mass times acceleration, F = ma
What is the difference between accuracy and precision? : Accuracy is closeness to the true value; precision is how closely repeated measurements agree with each other
Name the three states of matter and one property of each
Explain why ionic compounds conduct electricity when molten : Their ions become free to move and carry charge
What is a control variable in an experiment? : A factor kept the same throughout so it cannot affect the result`;

function RandomQuestionPicker() {
  const [raw, setRaw] = useState(RQ_SAMPLE);
  const [noRepeat, setNoRepeat] = useState("yes");
  const [current, setCurrent] = useState(null);
  const [used, setUsed] = useState([]);
  const [reveal, setReveal] = useState(false);

  const items = raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const i = l.indexOf(":");
    return i === -1 ? { q: l, a: null } : { q: l.slice(0, i).trim(), a: l.slice(i + 1).trim() || null };
  }).filter(x => x.q);

  const pool = noRepeat === "yes" ? items.filter(x => !used.includes(x.q)) : items;

  const draw = () => {
    if (!pool.length) return;
    const pick = pool[secureRandom(pool.length)];
    setCurrent(pick); setReveal(false);
    if (noRepeat === "yes") setUsed(u => [...u, pick.q]);
  };

  return (
    <VStack gap={16}>
      <div>
        <Label>Question bank — one per line, optionally “question : answer” ({items.length} questions)</Label>
        <Textarea value={raw} onChange={setRaw} rows={7} />
      </div>
      <Grid2>
        <div><Label>Repeats</Label><SelectInput value={noRepeat} onChange={(v) => { setNoRepeat(v); setUsed([]); }} options={[["yes", "No repeats — work through the bank"], ["no", "Allow repeats"]]} /></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <Btn onClick={draw} disabled={!pool.length} style={{ flex: 1 }}>🎲 Draw a question</Btn>
          <Btn variant="secondary" size="md" onClick={() => { setUsed([]); setCurrent(null); }}>↺</Btn>
        </div>
      </Grid2>
      {items.length === 0 && <Result mono={false}>Paste at least one question to draw from.</Result>}
      {items.length > 0 && !pool.length && <Result mono={false}>Every question has been drawn. Press ↺ to reset the pool and start again.</Result>}
      {current && (
        <div style={{ textAlign: "center", padding: "28px 22px", borderRadius: 14, background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.25)" }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(18px,4vw,26px)", fontWeight: 700, lineHeight: 1.4, color: C.text }}>{current.q}</div>
          {current.a && (reveal
            ? <div style={{ marginTop: 14, fontSize: 14, color: C.text, lineHeight: 1.6 }}>{current.a}</div>
            : <div style={{ marginTop: 14 }}><Btn variant="secondary" size="sm" onClick={() => setReveal(true)}>👁 Reveal answer</Btn></div>)}
        </div>
      )}
      {noRepeat === "yes" && <Note>{pool.length} of {items.length} questions still in the pool.</Note>}
    </VStack>
  );
}

// ── Text analysis helpers ────────────────────────────────────────────────────
function splitSentences(text) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return [];
  const PROT = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Sr.", "Jr.", "St.", "vs.", "etc.", "e.g.", "i.e.", "cf.", "Fig.", "No.", "Vol.", "al.", "Inc.", "Ltd.", "U.S.", "U.K.", "a.m.", "p.m."];
  let s = t;
  PROT.forEach(p => { s = s.split(p).join(p.replace(/\./g, "\u0001")); });
  const out = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    cur += s[i];
    if (/[.!?]/.test(s[i])) {
      let j = i + 1;
      while (j < s.length && /[)"'’”\]]/.test(s[j])) { cur += s[j]; j++; }
      if (j >= s.length || /\s/.test(s[j])) { out.push(cur); cur = ""; i = j - 1; }
    }
  }
  if (cur.trim()) out.push(cur);
  return out.map(x => x.replace(/\u0001/g, ".").trim()).filter(Boolean);
}
function wordsOf(text) { return (text || "").trim() ? text.trim().split(/\s+/).filter(w => /[a-zA-Z0-9À-ɏ]/.test(w)) : []; }

const SYL_EXCEPTIONS = { business: 2, wednesday: 2, every: 2, different: 3, people: 2, science: 2, area: 3, idea: 3, being: 2, create: 2, poem: 2, quiet: 2, real: 1, aisle: 1, queue: 1, colonel: 2, evening: 2, interesting: 3, chocolate: 3, camera: 3, family: 3 };
function countSyllables(word) {
  const w = (word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (SYL_EXCEPTIONS[w] !== undefined) return SYL_EXCEPTIONS[w];
  if (w.length <= 3) return 1;
  const s = w.replace(/(?:[^laeiouy]es|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = s.match(/[aeiouy]{1,2}/g);
  let n = m ? m.length : 1;
  if (/[^td]ed$/.test(w) && n > 1) n -= 1;
  return Math.max(1, n);
}

// ── Citation engine ──────────────────────────────────────────────────────────
const I = (t) => ({ i: t });
const Tx = (t) => ({ t: t });
function segText(segs) { return segs.map(s => (s.i !== undefined ? s.i : s.t)).join(""); }
function SegRender({ segs }) {
  return <span>{segs.map((s, i) => s.i !== undefined ? <i key={i}>{s.i}</i> : <span key={i}>{s.t}</span>)}</span>;
}
function parseAuthors(raw) {
  return (raw || "").split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const p = l.split(",");
    if (p.length >= 2) return { last: p[0].trim(), first: p.slice(1).join(",").trim() };
    const bits = l.split(/\s+/);
    return bits.length > 1 ? { last: bits[bits.length - 1], first: bits.slice(0, -1).join(" ") } : { last: l, first: "" };
  });
}
const initials = (first) => (first || "").split(/[\s.]+/).filter(Boolean).map(w => w[0].toUpperCase() + ".").join(" ");
function apaAuthors(a) {
  if (!a.length) return "";
  const f = (x) => `${x.last}${x.first ? ", " + initials(x.first) : ""}`;
  if (a.length === 1) return f(a[0]);
  if (a.length === 2) return `${f(a[0])}, & ${f(a[1])}`;
  if (a.length <= 20) return a.slice(0, -1).map(f).join(", ") + ", & " + f(a[a.length - 1]);
  return a.slice(0, 19).map(f).join(", ") + ", ... " + f(a[a.length - 1]);
}
function mlaAuthors(a) {
  if (!a.length) return "";
  const nat = (x) => `${x.first ? x.first + " " : ""}${x.last}`;
  if (a.length === 1) return `${a[0].last}${a[0].first ? ", " + a[0].first : ""}`;
  if (a.length === 2) return `${a[0].last}${a[0].first ? ", " + a[0].first : ""}, and ${nat(a[1])}`;
  return `${a[0].last}${a[0].first ? ", " + a[0].first : ""}, et al.`;
}
function chiAuthors(a) {
  if (!a.length) return "";
  const nat = (x) => `${x.first ? x.first + " " : ""}${x.last}`;
  const inv = (x) => `${x.last}${x.first ? ", " + x.first : ""}`;
  if (a.length === 1) return inv(a[0]);
  if (a.length <= 3) return a.length === 2 ? `${inv(a[0])}, and ${nat(a[1])}` : `${inv(a[0])}, ${nat(a[1])}, and ${nat(a[2])}`;
  if (a.length <= 10) return inv(a[0]) + ", " + a.slice(1, -1).map(nat).join(", ") + ", and " + nat(a[a.length - 1]);
  return inv(a[0]) + ", " + a.slice(1, 7).map(nat).join(", ") + ", et al.";
}
function editorList(raw, style) {
  const eds = parseAuthors(raw);
  if (!eds.length) return "";
  const nat = (x) => `${x.first ? x.first + " " : ""}${x.last}`;
  if (style === "apa") {
    const f = (x) => `${x.first ? initials(x.first) + " " : ""}${x.last}`;
    const joined = eds.length === 1 ? f(eds[0]) : eds.slice(0, -1).map(f).join(", ") + ", & " + f(eds[eds.length - 1]);
    return `${joined} (${eds.length === 1 ? "Ed." : "Eds."})`;
  }
  return eds.length === 1 ? nat(eds[0]) : eds.slice(0, -1).map(nat).join(", ") + " and " + nat(eds[eds.length - 1]);
}
const monthName = (m) => (m >= 1 && m <= 12 ? MONTHS_LONG[m - 1] : "");
function dateAPA(y, m, d) { const mm = monthName(parseInt(m, 10)); return mm ? `${y}, ${mm}${d ? " " + d : ""}` : `${y || "n.d."}`; }
function dateMLA(y, m, d) { const mm = monthName(parseInt(m, 10)); return mm ? `${d ? d + " " : ""}${mm.slice(0, 3) === "May" ? "May" : mm.length > 4 ? mm.slice(0, 3) + "." : mm} ${y}` : `${y || "n.d."}`; }
function dateCHI(y, m, d) { const mm = monthName(parseInt(m, 10)); return mm ? `${mm} ${d ? d + ", " : ""}${y}` : `${y || "n.d."}`; }

function buildCitation(style, s) {
  const A = parseAuthors(s.authors);
  const year = (s.year || "").trim() || "n.d.";
  const title = (s.title || "Untitled").trim();
  const cont = (s.container || "").trim();
  const pub = (s.publisher || "").trim();
  const place = (s.place || "").trim();
  const vol = (s.volume || "").trim();
  const iss = (s.issue || "").trim();
  const pages = (s.pages || "").trim();
  const url = (s.url || "").trim();
  const doi = (s.doi || "").trim();
  const ed = (s.edition || "").trim();
  const link = doi ? (doi.startsWith("http") ? doi : `https://doi.org/${doi}`) : url;
  const out = [];
  const push = (x) => { if (x !== null && x !== undefined && x !== "") out.push(typeof x === "string" ? Tx(x) : x); };

  if (style === "apa") {
    push(apaAuthors(A) ? apaAuthors(A) + " " : "");
    if (s.type === "website" || s.type === "video") push(`(${dateAPA(year, s.month, s.day)}). `); else push(`(${year}). `);
    if (s.type === "book") {
      push(I(title)); push(ed ? ` (${ed} ed.). ` : ". "); push(pub ? pub + ". " : ""); push(link);
    } else if (s.type === "journal") {
      push(title + ". "); push(I(cont || "Journal")); push(vol ? I(", " + vol) : null); push(iss ? `(${iss})` : null); push(pages ? `, ${pages}` : ""); push(". "); push(link);
    } else if (s.type === "website") {
      push(I(title)); push(". "); push(cont ? cont + ". " : ""); push(url);
    } else if (s.type === "chapter") {
      push(title + ". "); push(editorList(s.editors, "apa") ? `In ${editorList(s.editors, "apa")}, ` : "In "); push(I(cont || "Book title")); push(pages ? ` (pp. ${pages}). ` : ". "); push(pub ? pub + ". " : ""); push(link);
    } else {
      push(I(title)); push(" [Video]. "); push((cont || "YouTube") + ". "); push(url);
    }
  } else if (style === "mla") {
    push(mlaAuthors(A) ? mlaAuthors(A) + ". " : "");
    if (s.type === "book") {
      push(I(title)); push(". "); push(ed ? `${ed} ed., ` : ""); push(pub ? pub + ", " : ""); push(year + ".");
    } else if (s.type === "journal") {
      push(`"${title}." `); push(I(cont || "Journal")); push(vol ? `, vol. ${vol}` : ""); push(iss ? `, no. ${iss}` : ""); push(`, ${year}`); push(pages ? `, pp. ${pages}` : ""); push("."); push(link ? ` ${link}.` : "");
    } else if (s.type === "website") {
      push(`"${title}." `); push(I(cont || "Website")); push(`, ${dateMLA(year, s.month, s.day)}`); push(url ? `, ${url}` : ""); push(".");
    } else if (s.type === "chapter") {
      push(`"${title}." `); push(I(cont || "Book title")); push(editorList(s.editors, "mla") ? `, edited by ${editorList(s.editors, "mla")}` : ""); push(pub ? `, ${pub}` : ""); push(`, ${year}`); push(pages ? `, pp. ${pages}` : ""); push(".");
    } else {
      push(`"${title}." `); push(I(cont || "YouTube")); push(pub ? `, uploaded by ${pub}` : ""); push(`, ${dateMLA(year, s.month, s.day)}`); push(url ? `, ${url}` : ""); push(".");
    }
  } else {
    push(chiAuthors(A) ? chiAuthors(A) + ". " : "");
    if (s.type === "book") {
      push(I(title)); push(ed ? `. ${ed} ed. ` : ". "); push(place ? place + ": " : ""); push(pub ? pub + ", " : ""); push(year + ".");
    } else if (s.type === "journal") {
      push(`"${title}." `); push(I(cont || "Journal")); push(vol ? ` ${vol}` : ""); push(iss ? `, no. ${iss}` : ""); push(` (${year})`); push(pages ? `: ${pages}` : ""); push("."); push(link ? ` ${link}.` : "");
    } else if (s.type === "website") {
      push(`"${title}." `); push(cont ? cont + ". " : ""); push(`${dateCHI(year, s.month, s.day)}. `); push(url ? url + "." : "");
    } else if (s.type === "chapter") {
      push(`"${title}." In `); push(I(cont || "Book title")); push(editorList(s.editors, "chi") ? `, edited by ${editorList(s.editors, "chi")}` : ""); push(pages ? `, ${pages}` : ""); push(". "); push(place ? place + ": " : ""); push(pub ? pub + ", " : ""); push(year + ".");
    } else {
      push(`"${title}." Video. `); push((cont || "YouTube") + ", "); push(`${dateCHI(year, s.month, s.day)}. `); push(url ? url + "." : "");
    }
  }
  return out.filter(x => x && (x.t !== "" || x.i));
}

const CITE_TYPES = [["book", "Book"], ["journal", "Journal article"], ["website", "Website / web page"], ["chapter", "Chapter in an edited book"], ["video", "Online video"]];
const BLANK_SRC = { type: "book", authors: "", year: "", title: "", container: "", publisher: "", place: "", volume: "", issue: "", pages: "", url: "", doi: "", edition: "", editors: "", month: "", day: "" };
const DEMO_SRC = { ...BLANK_SRC, type: "book", authors: "Kahneman, Daniel", year: "2011", title: "Thinking, fast and slow", publisher: "Farrar, Straus and Giroux", place: "New York" };
const STYLE_NOTE = "Departments often apply local variations to these styles — always check the style guide or handbook your course actually asks for before you submit.";

function CitationFields({ src, set }) {
  const f = (k, label, ph) => <div><Label>{label}</Label><Input value={src[k]} onChange={v => set(k, v)} placeholder={ph} /></div>;
  return (
    <VStack gap={12}>
      <div><Label>Source type</Label><SelectInput value={src.type} onChange={v => set("type", v)} options={CITE_TYPES} style={{ width: "100%" }} /></div>
      <div><Label>Authors — one per line, “Last, First”</Label><Textarea value={src.authors} onChange={v => set("authors", v)} rows={3} placeholder={"Kahneman, Daniel\nTversky, Amos"} /></div>
      <Grid2>
        {f("title", src.type === "chapter" ? "Chapter title" : src.type === "journal" ? "Article title" : "Title")}
        {f("year", "Year", "2011")}
      </Grid2>
      {(src.type === "journal" || src.type === "website" || src.type === "chapter" || src.type === "video") &&
        <Grid2>
          {f("container", src.type === "journal" ? "Journal name" : src.type === "website" ? "Website name" : src.type === "chapter" ? "Book title" : "Platform (e.g. YouTube)")}
          {src.type === "journal" ? f("volume", "Volume") : f("publisher", src.type === "video" ? "Channel / uploader" : "Publisher")}
        </Grid2>}
      {src.type === "journal" && <Grid2>{f("issue", "Issue")}{f("pages", "Page range", "99–113")}</Grid2>}
      {src.type === "chapter" && <><div><Label>Editors — one per line, “Last, First”</Label><Textarea value={src.editors} onChange={v => set("editors", v)} rows={2} /></div><Grid2>{f("pages", "Page range", "45–68")}{f("place", "Place of publication (Chicago)")}</Grid2></>}
      {src.type === "book" && <Grid2>{f("publisher", "Publisher")}{f("place", "Place of publication (Chicago)")}</Grid2>}
      {src.type === "book" && <Grid2>{f("edition", "Edition (optional)", "2nd")}{f("url", "URL (optional)")}</Grid2>}
      {(src.type === "website" || src.type === "video") && <Grid3>{f("day", "Day", "14")}{f("month", "Month number", "5")}{f("url", "URL")}</Grid3>}
      {src.type === "journal" && <Grid2>{f("doi", "DOI (optional)", "10.1000/xyz123")}{f("url", "URL (optional)")}</Grid2>}
    </VStack>
  );
}

// ══ 13. Citation Generator ════════════════════════════════════════════════════
function CitationGenerator() {
  const [src, setSrc] = useState(DEMO_SRC);
  const set = (k, v) => setSrc(s => ({ ...s, [k]: v }));
  const styles = [["apa", "APA 7th edition"], ["mla", "MLA 9th edition"], ["chi", "Chicago (notes–bibliography)"]];
  return (
    <VStack gap={16}>
      <CitationFields src={src} set={set} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {styles.map(([k, name]) => {
          const segs = buildCitation(k, src);
          return (
            <Card key={k} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, gap: 10 }}>
                <span style={{ ...T.label, marginBottom: 0 }}>{name}</span>
                <CopyBtn text={segText(segs)} />
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: C.text, paddingLeft: 22, textIndent: -22 }}><SegRender segs={segs} /></div>
            </Card>
          );
        })}
      </div>
      <Note>Italics are shown where each style requires them. The copy button gives plain text, so re-apply italics to the title after pasting.</Note>
      <Note>{STYLE_NOTE}</Note>
    </VStack>
  );
}

// ══ 14. Bibliography Builder ══════════════════════════════════════════════════
function BibliographyBuilder() {
  const [list, setList] = useState([DEMO_SRC, { ...BLANK_SRC, type: "journal", authors: "Deci, Edward L.\nRyan, Richard M.", year: "2000", title: "The what and why of goal pursuits", container: "Psychological Inquiry", volume: "11", issue: "4", pages: "227–268", doi: "10.1207/S15327965PLI1104_01" }]);
  const [draft, setDraft] = useState(BLANK_SRC);
  const [style, setStyle] = useState("apa");
  const [msg, setMsg] = useState("");
  const set = (k, v) => setDraft(s => ({ ...s, [k]: v }));

  useEffect(() => { const d = lsGet("bibliography"); if (d && Array.isArray(d) && d.length) setList(d); }, []);
  const persist = (next) => { setList(next); const e = lsSet("bibliography", next); if (e) { setMsg(e); setTimeout(() => setMsg(""), 4000); } };

  const add = () => {
    if (!draft.title.trim()) { setMsg("Give the source a title before adding it."); setTimeout(() => setMsg(""), 3000); return; }
    persist([...list, draft]); setDraft(BLANK_SRC);
  };
  const sortKey = (s) => { const a = parseAuthors(s.authors); return (a.length ? a[0].last : s.title || "").toLowerCase(); };
  const sorted = list.slice().sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const heading = style === "mla" ? "Works Cited" : style === "apa" ? "References" : "Bibliography";
  const plain = sorted.map(s => segText(buildCitation(style, s))).join("\n\n");

  const download = () => {
    try {
      const blob = new Blob([`${heading}\n\n${plain}\n`], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = `${heading.toLowerCase().replace(/\s+/g, "-")}.txt`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch (e) { setMsg("Download failed — copy the list instead."); setTimeout(() => setMsg(""), 3000); }
  };

  return (
    <VStack gap={16}>
      <div><Label>Reference style</Label><SelectInput value={style} onChange={setStyle} options={[["apa", "APA 7th — References"], ["mla", "MLA 9th — Works Cited"], ["chi", "Chicago — Bibliography"]]} style={{ width: "100%" }} /></div>
      <Card>
        <div style={{ ...T.h2, marginBottom: 12 }}>Add a source</div>
        <CitationFields src={draft} set={set} />
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <Btn onClick={add}>➕ Add to list</Btn>
          <Btn variant="secondary" size="md" onClick={() => setDraft(BLANK_SRC)}>Clear fields</Btn>
        </div>
      </Card>
      {msg && <Result mono={false}>{msg}</Result>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ ...T.label, marginBottom: 0 }}>{heading} — {list.length} source{list.length === 1 ? "" : "s"}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <CopyBtn text={plain} />
          <Btn variant="secondary" size="sm" onClick={download}>⬇ Download .txt</Btn>
          <Btn variant="danger" size="sm" onClick={() => { persist([]); lsDel("bibliography"); }}>Clear all</Btn>
        </div>
      </div>
      {sorted.length === 0 ? <Result mono={false}>No sources yet. Fill in the form above and press Add to list.</Result> : (
        <Card>
          {sorted.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0", borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.7, paddingLeft: 22, textIndent: -22 }}><SegRender segs={buildCitation(style, s)} /></div>
              <button onClick={() => persist(list.filter(x => x !== s))} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 15 }} title="Remove">✕</button>
            </div>
          ))}
        </Card>
      )}
      <LocalNote>Your source list is saved in this browser's local storage only. Download the list before switching device or clearing browser data.</LocalNote>
      <Note>{STYLE_NOTE}</Note>
    </VStack>
  );
}

// ══ 15. In-Text Citation Helper ═══════════════════════════════════════════════
function InTextCitationHelper() {
  const [authors, setAuthors] = useState("Smith\nJones");
  const [year, setYear] = useState("2020");
  const [page, setPage] = useState("42");
  const [org, setOrg] = useState("");

  const names = authors.split("\n").map(s => s.trim()).filter(Boolean);
  const useOrg = org.trim().length > 0;
  const n = useOrg ? 1 : names.length;
  const y = year.trim() || "n.d.";
  const p = page.trim();

  const apaName = useOrg ? org.trim() : n === 0 ? "" : n === 1 ? names[0] : n === 2 ? `${names[0]} & ${names[1]}` : `${names[0]} et al.`;
  const apaNarr = useOrg ? org.trim() : n === 2 ? `${names[0]} and ${names[1]}` : apaName;
  const mlaName = useOrg ? org.trim() : n === 1 ? names[0] : n === 2 ? `${names[0]} and ${names[1]}` : `${names[0]} et al.`;
  const chiName = useOrg ? org.trim() : n === 1 ? names[0] : n === 2 ? `${names[0]} and ${names[1]}` : n === 3 ? `${names[0]}, ${names[1]}, and ${names[2]}` : `${names[0]} et al.`;

  const rows = n === 0 ? [] : [
    ["APA 7 — parenthetical", `(${apaName}, ${y}${p ? ", p. " + p : ""})`],
    ["APA 7 — narrative", `${apaNarr} (${y}${p ? ", p. " + p : ""})`],
    ["MLA 9 — parenthetical", `(${mlaName}${p ? " " + p : ""})`],
    ["MLA 9 — narrative", `${mlaName}${p ? ` … (${p})` : " …"}`],
    ["Chicago author–date", `(${chiName} ${y}${p ? ", " + p : ""})`],
    ["Chicago note (first)", `1. ${useOrg ? org.trim() : names.map(x => x).join(", ")}, Title (Place: Publisher, ${y})${p ? ", " + p : ""}.`],
  ];
  const rule = useOrg ? "Group or organisation author: spell the name out in full on first use in every style."
    : n === 1 ? "One author: name and date only, in all three styles."
      : n === 2 ? "Two authors: APA uses an ampersand inside brackets and “and” in running text; MLA and Chicago always use “and”."
        : n === 3 ? "Three authors: APA and MLA shorten to “et al.”; Chicago author–date still lists all three."
          : "Four or more authors: all three styles shorten to the first author plus “et al.”";

  return (
    <VStack gap={16}>
      <div><Label>Author surnames — one per line</Label><Textarea value={authors} onChange={setAuthors} rows={4} placeholder={"Smith\nJones"} /></div>
      <Grid3>
        <div><Label>Year</Label><Input value={year} onChange={setYear} /></div>
        <div><Label>Page (optional)</Label><Input value={page} onChange={setPage} /></div>
        <div><Label>Organisation author</Label><Input value={org} onChange={setOrg} placeholder="World Health Organization" /></div>
      </Grid3>
      {n === 0 ? <Result mono={false}>Enter at least one author surname, or an organisation name, to see the in-text forms.</Result> : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map(([label, val], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ ...T.label, marginBottom: 3 }}>{label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13.5, color: C.text }}>{val}</div>
                </div>
                <CopyBtn text={val} />
              </div>
            ))}
          </div>
          <Result mono={false}>{rule}</Result>
        </>
      )}
      <Note>A page number is required for any direct quotation in every style. APA and Chicago make it optional for a paraphrase; MLA expects it whenever the source is paginated.</Note>
      <Note>{STYLE_NOTE}</Note>
    </VStack>
  );
}

// ══ 16. Essay Word Counter ════════════════════════════════════════════════════
const ESSAY_SAMPLE = `Climate policy is often framed as a trade-off between economic growth and environmental protection. This framing is misleading. Recent evidence suggests that well-designed carbon pricing can reduce emissions while leaving output broadly unchanged.

The first argument concerns innovation. When emissions carry a price, firms have a standing incentive to find cheaper low-carbon methods. Over time this shifts the whole cost curve downward, which is precisely what happened in the solar and battery sectors after sustained policy support.`;
function EssayWordCounter() {
  const [text, setText] = useState(ESSAY_SAMPLE);
  const [wpp, setWpp] = useState("275");
  const words = wordsOf(text);
  const sentences = splitSentences(text);
  const paragraphs = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const perPage = Math.max(50, parseInt(wpp, 10) || 275);
  const longest = words.reduce((a, w) => (w.length > a.length ? w : a), "");
  return (
    <VStack gap={16}>
      <div><Label>Your essay</Label><Textarea value={text} onChange={setText} rows={10} /></div>
      <Grid3>
        <StatBox value={words.length} label="Words" />
        <StatBox value={chars} label="Characters" />
        <StatBox value={charsNoSpace} label="Characters (no spaces)" />
      </Grid3>
      <Grid3>
        <StatBox value={sentences.length} label="Sentences" />
        <StatBox value={paragraphs.length} label="Paragraphs" />
        <StatBox value={sentences.length ? (words.length / sentences.length).toFixed(1) : "0"} label="Words per sentence" />
      </Grid3>
      <div><Label>Words per page for your assignment format</Label>
        <SelectInput value={wpp} onChange={setWpp} style={{ width: "100%" }} options={[["275", "275 — double-spaced, 12pt Times New Roman, 1in margins"], ["550", "550 — single-spaced, 12pt, 1in margins"], ["500", "500 — 1.5 spaced, 12pt"], ["250", "250 — double-spaced, 12pt Arial"]]} />
      </div>
      <Grid2>
        <StatBox value={(words.length / perPage).toFixed(1)} label={`Pages at ${perPage} words/page`} />
        <StatBox value={longest ? `${longest.length} letters` : "—"} label={longest ? `Longest word: ${longest.slice(0, 18)}` : "Longest word"} />
      </Grid2>
      {words.length === 0 && <Result mono={false}>Paste or type your essay above and every count updates as you go.</Result>}
      <Note>Most departments exclude the reference list, and sometimes long quotations, from the word limit — paste only the part your limit actually covers.</Note>
    </VStack>
  );
}

// ══ 17. Reading Time Estimator ════════════════════════════════════════════════
function ReadingTimeEstimator() {
  const [text, setText] = useState(ESSAY_SAMPLE);
  const [custom, setCustom] = useState("240");
  const words = wordsOf(text).length;
  const fmt = (mins) => {
    if (!words) return "—";
    const total = Math.round(mins * 60);
    const m = Math.floor(total / 60), s = total % 60;
    return m === 0 ? `${s} sec` : `${m} min ${pad2(s)} sec`;
  };
  const speeds = [["Careful study pace", 130], ["Average silent reading", 240], ["Fast skimming", 400], ["Reading aloud / presenting", 140]];
  const cw = Math.max(30, Math.min(2000, parseInt(custom, 10) || 240));
  return (
    <VStack gap={16}>
      <div><Label>Text</Label><Textarea value={text} onChange={setText} rows={9} /></div>
      <Grid2>
        <StatBox value={words} label="Words" />
        <StatBox value={fmt(words / cw)} label={`At your ${cw} wpm setting`} />
      </Grid2>
      <div><Label>Your own reading speed (words per minute)</Label><Input value={custom} onChange={setCustom} /></div>
      {words === 0 ? <Result mono={false}>Paste some text to estimate how long it takes to read.</Result> : (
        <DataTable columns={["Reading mode", "Speed", "Time"]} rows={speeds.map(([n, v]) => [n, `${v} wpm`, fmt(words / v)])} />
      )}
      <Note>For a talk, plan on 130–150 words per minute including pauses — a 10 minute presentation is roughly 1,300–1,500 words of script.</Note>
    </VStack>
  );
}

// ══ 18. Readability Scorer ════════════════════════════════════════════════════
function ReadabilityScorer() {
  const [text, setText] = useState(ESSAY_SAMPLE);
  const sentences = splitSentences(text);
  const words = wordsOf(text);
  const syl = words.map(countSyllables);
  const totalSyl = syl.reduce((a, b) => a + b, 0);
  const W = words.length, S = sentences.length || 1;
  const poly = words.filter((w, i) => syl[i] >= 3).length;
  const complexWords = words.filter((w, i) => {
    if (syl[i] < 3) return false;
    const bare = w.replace(/[^A-Za-z]/g, "");
    if (!bare) return false;
    if (/^[A-Z]/.test(bare) && i > 0) return false;
    const stripped = bare.toLowerCase().replace(/(es|ed|ing)$/, "");
    return countSyllables(stripped) >= 3;
  }).length;

  const ok = W >= 10 && S >= 1;
  const asl = W / S, asw = totalSyl / (W || 1);
  const flesch = 206.835 - 1.015 * asl - 84.6 * asw;
  const fk = 0.39 * asl + 11.8 * asw - 15.59;
  const fog = 0.4 * (asl + 100 * (complexWords / (W || 1)));
  const smog = 1.0430 * Math.sqrt(poly * (30 / S)) + 3.1291;

  const fleschBand = flesch >= 90 ? "Very easy — 5th grade, short sentences and everyday words"
    : flesch >= 80 ? "Easy — 6th grade, conversational English"
      : flesch >= 70 ? "Fairly easy — 7th grade, popular fiction level"
        : flesch >= 60 ? "Plain English — 8th to 9th grade, ideal for general readers"
          : flesch >= 50 ? "Fairly difficult — 10th to 12th grade"
            : flesch >= 30 ? "Difficult — university level, typical of academic writing"
              : "Very difficult — postgraduate, dense and heavily nominalised";
  const gradeText = (g) => g <= 0 ? "below school age" : g >= 17 ? "postgraduate" : `US grade ${g.toFixed(1)}`;

  return (
    <VStack gap={16}>
      <div><Label>Text to score</Label><Textarea value={text} onChange={setText} rows={10} /></div>
      {!ok ? <Result mono={false}>Paste at least ten words of text — readability formulas are meaningless on a fragment.</Result> : (
        <>
          <Grid2>
            <BigResult value={flesch.toFixed(1)} label="Flesch Reading Ease (0–100, higher is easier)" />
            <BigResult value={fk.toFixed(1)} label="Flesch–Kincaid Grade Level" />
          </Grid2>
          <Result mono={false}>{fleschBand}. The Flesch–Kincaid grade of {fk.toFixed(1)} means this reads at {gradeText(fk)}.</Result>
          <DataTable
            columns={["Formula", "Score", "Means"]}
            rows={[
              ["Flesch Reading Ease", flesch.toFixed(1), fleschBand.split(" — ")[0]],
              ["Flesch–Kincaid Grade", fk.toFixed(1), gradeText(fk)],
              ["Gunning Fog Index", fog.toFixed(1), gradeText(fog)],
              ["SMOG Index", smog.toFixed(1), S < 30 ? `${gradeText(smog)} (needs 30+ sentences to be reliable)` : gradeText(smog)],
            ]}
          />
          <Grid3>
            <StatBox value={W} label="Words" />
            <StatBox value={S} label="Sentences" />
            <StatBox value={totalSyl} label="Syllables" />
          </Grid3>
          <Grid3>
            <StatBox value={asl.toFixed(1)} label="Words per sentence" />
            <StatBox value={asw.toFixed(2)} label="Syllables per word" />
            <StatBox value={`${((complexWords / W) * 100).toFixed(1)}%`} label="Complex words (3+ syllables)" />
          </Grid3>
        </>
      )}
      <Note>Coefficients follow the published formulas: Flesch 206.835 − 1.015×ASL − 84.6×ASW; Flesch–Kincaid 0.39×ASL + 11.8×ASW − 15.59; Fog 0.4×(ASL + 100×%complex); SMOG 1.0430×√(polysyllables×30/sentences) + 3.1291. Syllables are estimated with a vowel-group heuristic, so unusual names can be off by one.</Note>
    </VStack>
  );
}

// ══ 19. Paragraph Splitter ════════════════════════════════════════════════════
function ParagraphSplitter() {
  const [text, setText] = useState("The industrial revolution began in Britain in the late eighteenth century. It was driven by a combination of cheap coal, colonial markets and a legal system that protected patents. Textile manufacturing mechanised first. Steam power then spread to mining, transport and metalworking. Cities grew faster than any sanitation system could cope with. Life expectancy in the new industrial towns actually fell for several decades. Reform came slowly and unevenly. The Factory Acts limited working hours for children, and later public health legislation brought clean water. By the end of the century real wages had risen substantially.");
  const [per, setPer] = useState("3");
  const n = Math.max(1, Math.min(12, parseInt(per, 10) || 3));
  const sents = splitSentences(text);
  const paras = [];
  for (let i = 0; i < sents.length; i += n) paras.push(sents.slice(i, i + n).join(" "));
  const out = paras.join("\n\n");
  return (
    <VStack gap={16}>
      <div><Label>Unformatted text</Label><Textarea value={text} onChange={setText} rows={8} /></div>
      <Grid2>
        <div><Label>Sentences per paragraph</Label><Input value={per} onChange={setPer} /></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <StatBox value={sents.length} label="Sentences found" />
          <StatBox value={paras.length} label="Paragraphs" />
        </div>
      </Grid2>
      {sents.length === 0 ? <Result mono={false}>Paste some text with at least one full sentence ending in a full stop, question mark or exclamation mark.</Result> : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...T.label, marginBottom: 0 }}>Formatted output</span><CopyBtn text={out} />
          </div>
          <Result mono={false}>{out}</Result>
        </>
      )}
      <Note>Splits happen only at real sentence endings. Abbreviations such as Dr., e.g. and U.S. are protected so they never break a sentence in half, and not a single word of your text is changed.</Note>
    </VStack>
  );
}

// ══ 20. Outline Builder ═══════════════════════════════════════════════════════
const ROMAN = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
function toRoman(n) { let s = "", v = n; ROMAN.forEach(([k, r]) => { while (v >= k) { s += r; v -= k; } }); return s || "I"; }
const OUTLINE_SAMPLE = `Introduction
  Hook and context
  Thesis statement
Body
  First argument: economic evidence
    Carbon pricing case studies
      British Columbia
      EU emissions trading
    Counter-argument and rebuttal
  Second argument: technological change
    Cost curves for solar and batteries
Conclusion
  Restate thesis
  Wider implications`;
function OutlineBuilder() {
  const [raw, setRaw] = useState(OUTLINE_SAMPLE);
  const lines = raw.split("\n").filter(l => l.trim());
  const marker = (level, idx) => {
    if (level === 0) return toRoman(idx) + ".";
    if (level === 1) return String.fromCharCode(64 + ((idx - 1) % 26) + 1) + ".";
    if (level === 2) return idx + ".";
    if (level === 3) return String.fromCharCode(96 + ((idx - 1) % 26) + 1) + ".";
    return toRoman(idx).toLowerCase() + ".";
  };
  const counters = [];
  const out = lines.map(l => {
    const indent = (l.match(/^[\t ]*/) || [""])[0];
    const level = Math.min(4, indent.replace(/\t/g, "  ").length >> 1);
    counters[level] = (counters[level] || 0) + 1;
    for (let k = level + 1; k < counters.length; k++) counters[k] = 0;
    return `${"    ".repeat(level)}${marker(level, counters[level])} ${l.trim()}`;
  }).join("\n");
  return (
    <VStack gap={16}>
      <div><Label>Your points — indent sub-points with a tab or two spaces</Label><Textarea value={raw} onChange={setRaw} rows={12} mono /></div>
      {lines.length === 0 ? <Result mono={false}>Type at least one point to build an outline.</Result> : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...T.label, marginBottom: 0 }}>Formatted outline</span><CopyBtn text={out} />
          </div>
          <Result>{out}</Result>
        </>
      )}
      <Note>Levels follow the standard alphanumeric outline: I, II, III for main sections, then A, B, C, then 1, 2, 3, then a, b, c, then i, ii, iii. Numbering restarts inside each parent section.</Note>
    </VStack>
  );
}

// ══ 21. Note Formatter ════════════════════════════════════════════════════════
const NOTES_SAMPLE = `photosynthesis happens in the chloroplast
- light dependent stage occurs in the thylakoid membrane
* produces ATP and NADPH, splits water, releases oxygen

light independent stage (Calvin cycle) occurs in the stroma
uses ATP and NADPH to fix CO2 into glucose
rate limited by light intensity, CO2 concentration and temperature`;
function NoteFormatter() {
  const [raw, setRaw] = useState(NOTES_SAMPLE);
  const [mode, setMode] = useState("bullets");
  const [split, setSplit] = useState("lines");
  const [topic, setTopic] = useState("Photosynthesis — lecture 6");

  const clean = (s) => {
    let t = s.replace(/^[\s\-*•·>+]+/, "").replace(/\s+/g, " ").trim();
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const points = (split === "sentences" ? splitSentences(raw) : raw.split("\n")).map(clean).filter(Boolean);

  let output = "";
  if (mode === "bullets") output = points.map(p => `• ${p}`).join("\n");
  else if (mode === "numbered") output = points.map((p, i) => `${i + 1}. ${p}`).join("\n");
  else if (mode === "dashes") output = points.map(p => `- ${p}`).join("\n");
  else output = points.map(p => `• ${p}`).join("\n");

  const cues = points.map(p => { const w = p.split(/\s+/).slice(0, 3).join(" "); return w.replace(/[.,;:]$/, "") + "?"; });

  return (
    <VStack gap={16}>
      <div className="tr-noprint"><Label>Raw notes</Label><Textarea value={raw} onChange={setRaw} rows={9} /></div>
      <div className="tr-noprint">
        <Grid3>
          <div><Label>Layout</Label><SelectInput value={mode} onChange={setMode} style={{ width: "100%" }} options={[["bullets", "Bullet points"], ["numbered", "Numbered steps"], ["dashes", "Dash list"], ["cornell", "Cornell notes"]]} /></div>
          <div><Label>Split on</Label><SelectInput value={split} onChange={setSplit} style={{ width: "100%" }} options={[["lines", "Each line is a point"], ["sentences", "Each sentence is a point"]]} /></div>
          <div><Label>Topic / heading</Label><Input value={topic} onChange={setTopic} /></div>
        </Grid3>
      </div>
      {points.length === 0 ? <Result mono={false}>Paste some notes above — blank lines, stray bullets and extra spaces are cleaned up automatically.</Result> : mode === "cornell" ? (
        <>
          <div className="tr-noprint" style={{ display: "flex", gap: 8 }}><PrintBtn label="🖨️ Print Cornell sheet" /><CopyBtn text={`${topic}\n\n${points.map((p, i) => `${cues[i]}\t${p}`).join("\n")}`} /></div>
          <Paper>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, borderBottom: "2px solid #333", paddingBottom: 6, marginBottom: 10 }}>{topic || "Notes"}</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead><tr><th style={{ width: "30%", textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #333" }}>Cue / question</th><th style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #333" }}>Notes</th></tr></thead>
              <tbody>
                {points.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: "7px 8px", borderRight: "1px solid #333", borderBottom: "1px solid #ddd", verticalAlign: "top", fontWeight: 600 }}>{cues[i]}</td>
                    <td style={{ padding: "7px 8px", borderBottom: "1px solid #ddd" }}>{p}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12, borderTop: "2px solid #333", paddingTop: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>Summary</div>
              <div style={{ height: 54, borderBottom: "1px solid #bbb" }} />
            </div>
          </Paper>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...T.label, marginBottom: 0 }}>{points.length} points</span><CopyBtn text={`${topic}\n\n${output}`} />
          </div>
          <Result mono={false}>{output}</Result>
        </>
      )}
      <Note>This is rule-based formatting only — whitespace is tidied, stray bullet characters removed and each point capitalised. Nothing is rewritten, shortened or generated, so your own wording is preserved exactly.</Note>
    </VStack>
  );
}

// ── Element data (IUPAC standard atomic weights; [] = mass number of the most stable isotope)
const ELEMENT_RAW = "H,Hydrogen,1.008|He,Helium,4.0026|Li,Lithium,6.94|Be,Beryllium,9.0122|B,Boron,10.81|C,Carbon,12.011|N,Nitrogen,14.007|O,Oxygen,15.999|F,Fluorine,18.998|Ne,Neon,20.180|Na,Sodium,22.990|Mg,Magnesium,24.305|Al,Aluminium,26.982|Si,Silicon,28.085|P,Phosphorus,30.974|S,Sulfur,32.06|Cl,Chlorine,35.45|Ar,Argon,39.95|K,Potassium,39.098|Ca,Calcium,40.078|Sc,Scandium,44.956|Ti,Titanium,47.867|V,Vanadium,50.942|Cr,Chromium,51.996|Mn,Manganese,54.938|Fe,Iron,55.845|Co,Cobalt,58.933|Ni,Nickel,58.693|Cu,Copper,63.546|Zn,Zinc,65.38|Ga,Gallium,69.723|Ge,Germanium,72.630|As,Arsenic,74.922|Se,Selenium,78.971|Br,Bromine,79.904|Kr,Krypton,83.798|Rb,Rubidium,85.468|Sr,Strontium,87.62|Y,Yttrium,88.906|Zr,Zirconium,91.224|Nb,Niobium,92.906|Mo,Molybdenum,95.95|Tc,Technetium,98|Ru,Ruthenium,101.07|Rh,Rhodium,102.91|Pd,Palladium,106.42|Ag,Silver,107.87|Cd,Cadmium,112.41|In,Indium,114.82|Sn,Tin,118.71|Sb,Antimony,121.76|Te,Tellurium,127.60|I,Iodine,126.90|Xe,Xenon,131.29|Cs,Caesium,132.91|Ba,Barium,137.33|La,Lanthanum,138.91|Ce,Cerium,140.12|Pr,Praseodymium,140.91|Nd,Neodymium,144.24|Pm,Promethium,145|Sm,Samarium,150.36|Eu,Europium,151.96|Gd,Gadolinium,157.25|Tb,Terbium,158.93|Dy,Dysprosium,162.50|Ho,Holmium,164.93|Er,Erbium,167.26|Tm,Thulium,168.93|Yb,Ytterbium,173.05|Lu,Lutetium,174.97|Hf,Hafnium,178.49|Ta,Tantalum,180.95|W,Tungsten,183.84|Re,Rhenium,186.21|Os,Osmium,190.23|Ir,Iridium,192.22|Pt,Platinum,195.08|Au,Gold,196.97|Hg,Mercury,200.59|Tl,Thallium,204.38|Pb,Lead,207.2|Bi,Bismuth,208.98|Po,Polonium,209|At,Astatine,210|Rn,Radon,222|Fr,Francium,223|Ra,Radium,226|Ac,Actinium,227|Th,Thorium,232.04|Pa,Protactinium,231.04|U,Uranium,238.03|Np,Neptunium,237|Pu,Plutonium,244|Am,Americium,243|Cm,Curium,247|Bk,Berkelium,247|Cf,Californium,251|Es,Einsteinium,252|Fm,Fermium,257|Md,Mendelevium,258|No,Nobelium,259|Lr,Lawrencium,266|Rf,Rutherfordium,267|Db,Dubnium,268|Sg,Seaborgium,269|Bh,Bohrium,270|Hs,Hassium,269|Mt,Meitnerium,278|Ds,Darmstadtium,281|Rg,Roentgenium,282|Cn,Copernicium,285|Nh,Nihonium,286|Fl,Flerovium,289|Mc,Moscovium,290|Lv,Livermorium,293|Ts,Tennessine,294|Og,Oganesson,294";

const SYNTHETIC = new Set([43, 61, 84, 85, 86, 87, 88, 89, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118]);
const CAT_SETS = [
  ["alkali metal", "#F87171", [3, 11, 19, 37, 55, 87]],
  ["alkaline earth metal", "#FBBF24", [4, 12, 20, 38, 56, 88]],
  ["transition metal", "#60A5FA", [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 72, 73, 74, 75, 76, 77, 78, 79, 80, 104, 105, 106, 107, 108, 109, 110, 111, 112]],
  ["post-transition metal", "#34D399", [13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116]],
  ["metalloid", "#22D3EE", [5, 14, 32, 33, 51, 52]],
  ["reactive nonmetal", "#A78BFA", [1, 6, 7, 8, 9, 15, 16, 17, 34, 35, 53]],
  ["noble gas", "#F472B6", [2, 10, 18, 36, 54, 86, 118]],
  ["lanthanide", "#FCD34D", [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]],
  ["actinide", "#FB923C", [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103]],
];
const GASES = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86, 118]);
const LIQUIDS = new Set([35, 80]);
function catOf(z) {
  for (const [name, color, list] of CAT_SETS) if (list.indexOf(z) !== -1) return { name, color };
  return { name: "unknown properties", color: "#94A3B8" };
}
function periodOf(z) { return z <= 2 ? 1 : z <= 10 ? 2 : z <= 18 ? 3 : z <= 36 ? 4 : z <= 54 ? 5 : z <= 86 ? 6 : 7; }
function groupOf(z) {
  if (z === 1) return 1; if (z === 2) return 18;
  if (z <= 10) return z <= 4 ? z - 2 : z + 8;
  if (z <= 18) return z <= 12 ? z - 10 : z;
  if (z <= 36) return z - 18;
  if (z <= 54) return z - 36;
  if (z >= 57 && z <= 71) return null;
  if (z >= 89 && z <= 103) return null;
  if (z <= 86) return z - 68;
  return z - 100;
}
const MADELUNG = [[1, 0, 2], [2, 0, 2], [2, 1, 6], [3, 0, 2], [3, 1, 6], [4, 0, 2], [3, 2, 10], [4, 1, 6], [5, 0, 2], [4, 2, 10], [5, 1, 6], [6, 0, 2], [4, 3, 14], [5, 2, 10], [6, 1, 6], [7, 0, 2], [5, 3, 14], [6, 2, 10], [7, 1, 6]];
const ORB = ["s", "p", "d", "f"];
const NOBLE_CORE = { 2: "He", 10: "Ne", 18: "Ar", 36: "Kr", 54: "Xe", 86: "Rn" };
const EC_EXCEPTIONS = {
  24: "[Ar] 3d5 4s1", 29: "[Ar] 3d10 4s1", 41: "[Kr] 4d4 5s1", 42: "[Kr] 4d5 5s1", 44: "[Kr] 4d7 5s1",
  45: "[Kr] 4d8 5s1", 46: "[Kr] 4d10", 47: "[Kr] 4d10 5s1", 57: "[Xe] 5d1 6s2", 58: "[Xe] 4f1 5d1 6s2",
  64: "[Xe] 4f7 5d1 6s2", 78: "[Xe] 4f14 5d9 6s1", 79: "[Xe] 4f14 5d10 6s1", 89: "[Rn] 6d1 7s2",
  90: "[Rn] 6d2 7s2", 91: "[Rn] 5f2 6d1 7s2", 92: "[Rn] 5f3 6d1 7s2", 93: "[Rn] 5f4 6d1 7s2",
  96: "[Rn] 5f7 6d1 7s2", 103: "[Rn] 5f14 7s2 7p1",
};
function electronConfig(z) {
  if (EC_EXCEPTIONS[z]) return EC_EXCEPTIONS[z];
  let rem = z, cum = 0, coreIdx = 0, coreSym = "";
  const sh = [];
  for (const [n, l, cap] of MADELUNG) {
    if (rem <= 0) break;
    const e = Math.min(cap, rem); rem -= e; cum += e;
    sh.push({ n, l, e });
    if (NOBLE_CORE[cum] && cum < z) { coreIdx = sh.length; coreSym = NOBLE_CORE[cum]; }
  }
  const rest = sh.slice(coreIdx).sort((a, b) => a.n - b.n || a.l - b.l);
  return (coreSym ? `[${coreSym}] ` : "") + rest.map(x => `${x.n}${ORB[x.l]}${x.e}`).join(" ");
}
const ELEMENTS = ELEMENT_RAW.split("|").map((row, i) => {
  const [sym, name, mass] = row.split(",");
  const z = i + 1;
  const c = catOf(z);
  return {
    z, sym, name, mass: parseFloat(mass), approx: SYNTHETIC.has(z) && !/\./.test(mass),
    category: c.name, color: c.color, period: periodOf(z), group: groupOf(z),
    state: GASES.has(z) ? "Gas" : LIQUIDS.has(z) ? "Liquid" : "Solid",
    predicted: z >= 104,
    config: electronConfig(z),
  };
});
const ATOMIC = {};
ELEMENTS.forEach(e => { ATOMIC[e.sym] = e.mass; });

// ══ 22. Periodic Table ════════════════════════════════════════════════════════
function PeriodicTable() {
  const [sel, setSel] = useState(ELEMENTS[5]);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = (e) => !query || e.name.toLowerCase().includes(query) || e.sym.toLowerCase() === query || String(e.z) === query || e.category.includes(query);
  const pos = (e) => e.group ? { gridColumn: e.group, gridRow: e.period } : { gridColumn: 3 + (e.z - (e.z <= 71 ? 57 : 89)), gridRow: e.z <= 71 ? 9 : 10 };

  return (
    <VStack gap={16}>
      <div><Label>Search by name, symbol, atomic number or category</Label><Input value={q} onChange={setQ} placeholder="e.g. iron, Fe, 26, noble gas" /></div>
      <div style={{ overflowX: "auto", paddingBottom: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(18, minmax(38px,1fr))", gap: 3, minWidth: 760 }}>
          {ELEMENTS.map(e => {
            const dim = !match(e);
            const active = sel && sel.z === e.z;
            return (
              <button key={e.z} onClick={() => setSel(e)} title={`${e.name} — ${e.category}`}
                style={{ ...pos(e), padding: "4px 2px", borderRadius: 4, cursor: "pointer", textAlign: "center", opacity: dim ? 0.18 : 1, transition: "opacity .15s,transform .1s", background: active ? e.color : `${e.color}22`, border: `1px solid ${active ? e.color : e.color + "55"}`, color: active ? "#0B1020" : C.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                <div style={{ fontSize: 8, opacity: 0.8, lineHeight: 1.1 }}>{e.z}</div>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.15 }}>{e.sym}</div>
              </button>
            );
          })}
          <div style={{ gridColumn: "1 / 19", gridRow: 8, height: 6 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {CAT_SETS.map(([n, col]) => (
          <span key={n} onClick={() => setQ(n)} style={{ cursor: "pointer", fontSize: 11, padding: "3px 9px", borderRadius: 20, background: col + "22", border: `1px solid ${col}55`, color: C.text }}>{n}</span>
        ))}
      </div>
      {sel && (
        <Card>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ width: 92, height: 92, borderRadius: 12, background: sel.color + "22", border: `2px solid ${sel.color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: C.muted }}>{sel.z}</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 34, fontWeight: 700, color: sel.color, lineHeight: 1 }}>{sel.sym}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{sel.approx ? `[${sel.mass}]` : sel.mass}</div>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ ...T.h1, marginBottom: 4 }}>{sel.name}</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 10, textTransform: "capitalize" }}>{sel.category}</div>
              <DataTable columns={["Property", "Value"]} rows={[
                ["Atomic number", sel.z],
                ["Standard atomic weight", sel.approx ? `[${sel.mass}] (most stable isotope)` : `${sel.mass} u`],
                ["Group", sel.group ? sel.group : "f-block (between groups 2 and 3)"],
                ["Period", sel.period],
                ["Electron configuration", sel.config],
                ["State at 25 °C", sel.predicted ? `${sel.state} (predicted)` : sel.state],
              ]} />
            </div>
          </div>
        </Card>
      )}
      <Note>Values shown are the IUPAC standard atomic weights to five significant figures. Square brackets mark elements with no stable isotope, where the figure is the mass number of the most stable or best-characterised isotope. Electron configurations follow the aufbau order with the known experimental exceptions applied.</Note>
    </VStack>
  );
}

// ── Chemical formula parsing ─────────────────────────────────────────────────
function tokenCounts(str) {
  const stack = [{}];
  let i = 0;
  while (i < str.length) {
    const ch = str[i];
    if (ch === "(" || ch === "[" || ch === "{") { stack.push({}); i++; }
    else if (ch === ")" || ch === "]" || ch === "}") {
      if (stack.length === 1) throw new Error("There is a closing bracket with no matching opening bracket.");
      const top = stack.pop(); i++;
      let num = ""; while (i < str.length && /\d/.test(str[i])) num += str[i++];
      const mult = num ? parseInt(num, 10) : 1;
      const cur = stack[stack.length - 1];
      for (const k in top) cur[k] = (cur[k] || 0) + top[k] * mult;
    } else if (/[A-Z]/.test(ch)) {
      let sym = ch; i++;
      while (i < str.length && /[a-z]/.test(str[i])) sym += str[i++];
      let num = ""; while (i < str.length && /\d/.test(str[i])) num += str[i++];
      if (ATOMIC[sym] === undefined) throw new Error(`“${sym}” is not a known element symbol — check the capitalisation (Co is cobalt, CO is carbon monoxide).`);
      const cur = stack[stack.length - 1];
      cur[sym] = (cur[sym] || 0) + (num ? parseInt(num, 10) : 1);
      i++; i--;
    } else if (/[\s+]/.test(ch)) { i++; }
    else if (/[a-z]/.test(ch)) { throw new Error(`Element symbols must start with a capital letter — found “${ch}” with nothing before it.`); }
    else if (/\d/.test(ch)) { throw new Error("A number appears where an element symbol was expected."); }
    else throw new Error(`Unexpected character “${ch}” in the formula.`);
  }
  if (stack.length > 1) throw new Error("A bracket was opened but never closed.");
  return stack[0];
}
function parseFormula(formula) {
  const norm = (formula || "").replace(/[·•*∙]/g, ".").replace(/\((s|l|g|aq)\)/gi, "").trim();
  if (!norm) throw new Error("Enter a chemical formula.");
  const parts = norm.split(".").map(s => s.trim()).filter(Boolean);
  if (!parts.length) throw new Error("Enter a chemical formula.");
  const total = {};
  for (let part of parts) {
    let mult = 1;
    const m = /^(\d+)([A-Za-z(\[].*)$/.exec(part);
    if (m) { mult = parseInt(m[1], 10); part = m[2]; }
    const c = tokenCounts(part);
    for (const k in c) total[k] = (total[k] || 0) + c[k] * mult;
  }
  if (!Object.keys(total).length) throw new Error("No elements were found in that formula.");
  return total;
}

// ══ 23. Molar Mass Calculator ═════════════════════════════════════════════════
function MolarMassCalculator() {
  const [formula, setFormula] = useState("CuSO4.5H2O");
  let counts = null, error = null;
  try { counts = parseFormula(formula); } catch (e) { error = e.message; }
  const keys = counts ? Object.keys(counts).sort() : [];
  const total = keys.reduce((s, k) => s + ATOMIC[k] * counts[k], 0);
  const examples = ["H2O", "CuSO4.5H2O", "Ca(OH)2", "Al2(SO4)3", "C6H12O6", "NaHCO3", "Fe2O3", "Na2CO3.10H2O", "KMnO4", "CH3COOH"];
  return (
    <VStack gap={16}>
      <div><Label>Chemical formula</Label><Input value={formula} onChange={setFormula} placeholder="CuSO4.5H2O" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16 }} /></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {examples.map(x => <button key={x} onClick={() => setFormula(x)} style={{ cursor: "pointer", fontSize: 11.5, padding: "4px 10px", borderRadius: 20, background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.25)", color: C.text, fontFamily: "'JetBrains Mono',monospace" }}>{x}</button>)}
      </div>
      {error ? <Result mono={false}>⚠ {error}</Result> : (
        <>
          <BigResult value={`${total.toFixed(3)} g/mol`} label={`Molar mass of ${formula.trim()}`} />
          <DataTable
            columns={["Element", "Atoms", "Atomic mass", "Contribution", "% by mass"]}
            rows={keys.map(k => {
              const contrib = ATOMIC[k] * counts[k];
              const el = ELEMENTS.find(e => e.sym === k);
              return [`${k} — ${el ? el.name : ""}`, counts[k], `${ATOMIC[k]} u`, `${contrib.toFixed(3)} g/mol`, `${((contrib / total) * 100).toFixed(2)}%`];
            })}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <CopyBtn text={`${formula.trim()} = ${total.toFixed(3)} g/mol\n` + keys.map(k => `${k}${counts[k] > 1 ? counts[k] : ""}: ${(ATOMIC[k] * counts[k]).toFixed(3)} g/mol (${((ATOMIC[k] * counts[k] / total) * 100).toFixed(2)}%)`).join("\n")} />
          </div>
          <Grid3>
            <StatBox value={keys.length} label="Different elements" />
            <StatBox value={keys.reduce((s, k) => s + counts[k], 0)} label="Atoms per formula unit" />
            <StatBox value={`${(total / 1).toFixed(2)} g`} label="Mass of 1 mole" />
          </Grid3>
        </>
      )}
      <Note>Nested brackets are supported at any depth, and hydrates can be written with a full stop or a middle dot — CuSO4.5H2O and CuSO4·5H2O both give 249.677 g/mol. State symbols such as (s) or (aq) are ignored.</Note>
    </VStack>
  );
}

// ── Exact rational arithmetic for the balancer ───────────────────────────────
function gcdInt(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; }
function fr(n, d) { if (d === undefined) d = 1; if (d === 0) throw new Error("Division by zero while solving."); if (d < 0) { n = -n; d = -d; } const g = gcdInt(n, d); return [n / g, d / g]; }
const fadd = (a, b) => fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const fmul = (a, b) => fr(a[0] * b[0], a[1] * b[1]);
const fdiv = (a, b) => fr(a[0] * b[1], a[1] * b[0]);
const fneg = (a) => [-a[0], a[1]];
const fzero = (a) => a[0] === 0;

function splitSpecies(side) {
  return side.split("+").map(s => s.trim()).filter(Boolean);
}
function balanceEquation(input) {
  const cleaned = (input || "").replace(/[⟶→=]+/g, "->").replace(/-+>/g, "->");
  const halves = cleaned.split("->");
  if (halves.length !== 2) return { error: "Use one arrow between the two sides, for example: C3H8 + O2 -> CO2 + H2O" };
  const left = splitSpecies(halves[0]), right = splitSpecies(halves[1]);
  if (!left.length || !right.length) return { error: "Both sides of the equation need at least one compound." };
  const species = left.concat(right).map(s => s.replace(/^\s*\d+\s*(?=[A-Z(\[])/, "").trim());
  const counts = [];
  for (const s of species) {
    try { counts.push(parseFormula(s)); }
    catch (e) { return { error: `Could not read “${s}”: ${e.message}` }; }
  }
  const elements = [];
  counts.forEach(c => Object.keys(c).forEach(k => { if (elements.indexOf(k) === -1) elements.push(k); }));
  const nL = left.length;
  for (const el of elements) {
    const onL = counts.slice(0, nL).some(c => c[el]);
    const onR = counts.slice(nL).some(c => c[el]);
    if (!onL || !onR) return { error: `This equation cannot be balanced: ${el} appears only on the ${onL ? "left" : "right"}-hand side. Check for a missing product or a typo in a formula.` };
  }
  const rows = elements.length, cols = species.length;
  const M = elements.map(el => species.map((_, j) => fr((counts[j][el] || 0) * (j < nL ? 1 : -1), 1)));

  // Gauss–Jordan elimination over exact fractions
  const pivots = [];
  let r = 0;
  for (let c = 0; c < cols && r < rows; c++) {
    let p = -1;
    for (let i = r; i < rows; i++) if (!fzero(M[i][c])) { p = i; break; }
    if (p === -1) continue;
    const tmp = M[r]; M[r] = M[p]; M[p] = tmp;
    const lead = M[r][c];
    for (let j = 0; j < cols; j++) M[r][j] = fdiv(M[r][j], lead);
    for (let i = 0; i < rows; i++) {
      if (i === r || fzero(M[i][c])) continue;
      const f = M[i][c];
      for (let j = 0; j < cols; j++) M[i][j] = fadd(M[i][j], fneg(fmul(f, M[r][j])));
    }
    pivots.push(c); r++;
  }
  const free = [];
  for (let c = 0; c < cols; c++) if (pivots.indexOf(c) === -1) free.push(c);
  if (free.length === 0) return { error: "This equation cannot be balanced: the only mathematical solution sets every coefficient to zero. Usually this means a compound or an element is missing from one side." };
  if (free.length > 1) return { error: `This equation does not have a unique balance — there are ${free.length} independent solutions. That normally means a species is repeated, or the reaction should be split into separate equations.` };

  const f0 = free[0];
  const x = new Array(cols).fill(null).map(() => fr(0, 1));
  x[f0] = fr(1, 1);
  pivots.forEach((c, i) => { x[c] = fneg(M[i][f0]); });

  let lcm = 1;
  x.forEach(v => { lcm = (lcm * v[1]) / gcdInt(lcm, v[1]); });
  let ints = x.map(v => Math.round((v[0] * lcm) / v[1]));
  let g = ints.reduce((a, b) => gcdInt(a, b), 0) || 1;
  ints = ints.map(v => v / g);
  if (ints.every(v => v < 0)) ints = ints.map(v => -v);
  if (ints.some(v => v <= 0)) return { error: "This equation cannot be balanced with positive whole numbers — the solution requires a zero or negative coefficient, which is not chemically meaningful." };
  if (ints.some(v => !isFinite(v) || Math.abs(v) > 1e6)) return { error: "The coefficients came out impossibly large — check the formulas for a typo." };

  const fmtSide = (from, to) => species.slice(from, to).map((s, i) => `${ints[from + i] === 1 ? "" : ints[from + i]}${s}`).join(" + ");
  const check = elements.map(el => {
    const l = counts.slice(0, nL).reduce((a, c, i) => a + (c[el] || 0) * ints[i], 0);
    const rr = counts.slice(nL).reduce((a, c, i) => a + (c[el] || 0) * ints[nL + i], 0);
    return [el, l, rr, l === rr ? "✓" : "✗"];
  });
  return { balanced: `${fmtSide(0, nL)} → ${fmtSide(nL, cols)}`, coefficients: ints, species, check };
}

// ══ 24. Chemical Equation Balancer ════════════════════════════════════════════
function EquationBalancer() {
  const [eq, setEq] = useState("C3H8 + O2 -> CO2 + H2O");
  const res = balanceEquation(eq);
  const samples = ["C3H8 + O2 -> CO2 + H2O", "Fe + O2 -> Fe2O3", "KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2", "Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O", "C2H5OH + O2 -> CO2 + H2O", "Al + CuSO4 -> Al2(SO4)3 + Cu"];
  return (
    <VStack gap={16}>
      <div><Label>Unbalanced equation</Label><Input value={eq} onChange={setEq} placeholder="C3H8 + O2 -> CO2 + H2O" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15 }} /></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {samples.map(s => <button key={s} onClick={() => setEq(s)} style={{ cursor: "pointer", fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.25)", color: C.text, fontFamily: "'JetBrains Mono',monospace" }}>{s}</button>)}
      </div>
      {res.error ? <Result mono={false}>⚠ {res.error}</Result> : (
        <>
          <div style={{ textAlign: "center", padding: "22px 16px", borderRadius: 12, background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.25)" }}>
            <div style={{ ...T.label, marginBottom: 8 }}>Balanced equation</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(15px,3.4vw,22px)", fontWeight: 600, color: C.text, wordBreak: "break-word" }}>{res.balanced}</div>
            <div style={{ marginTop: 10 }}><CopyBtn text={res.balanced} /></div>
          </div>
          <DataTable columns={["Element", "Atoms on left", "Atoms on right", "Balanced"]} rows={res.check} />
          <Result>{res.species.map((s, i) => `${s}: ${res.coefficients[i]}`).join("\n")}</Result>
        </>
      )}
      <Note>Coefficients are found by row-reducing the element/species matrix over exact fractions and reading the null-space vector, then scaling to the smallest positive whole numbers — so the answer is proven, not guessed. Existing coefficients in your input are ignored and recalculated.</Note>
    </VStack>
  );
}

function StatRow({ items }) {
  return <Grid3>{items.map((it, i) => <StatBox key={i} value={it[1]} label={it[0]} />)}</Grid3>;
}

// ══ 25. SI Unit Prefix Table ══════════════════════════════════════════════════
const SI_PREFIXES = [
  ["Q", "quetta", 30, "1 QB ≈ a quetta­byte, proposed for the largest global data estimates"],
  ["R", "ronna", 27, "roughly the mass of the Earth in grams (≈6 Rg)"],
  ["Y", "yotta", 24, "a yottabyte — far beyond current global data storage"],
  ["Z", "zetta", 21, "total grains of sand on Earth is on the order of 1 Z"],
  ["E", "exa", 18, "an exabyte — roughly a decade of a large ISP's traffic"],
  ["P", "peta", 15, "a petabyte — around 500 billion pages of text"],
  ["T", "tera", 12, "a terabyte hard drive"],
  ["G", "giga", 9, "a gigahertz processor clock, a gigabyte of RAM"],
  ["M", "mega", 6, "a megapixel camera, a megawatt power plant"],
  ["k", "kilo", 3, "a kilogram, a kilometre"],
  ["h", "hecto", 2, "a hectare is 100 are; rarely used alone"],
  ["da", "deka", 1, "a dekagram; rarely used"],
  ["", "(base unit)", 0, "metre, gram, second, litre…"],
  ["d", "deci", -1, "a decilitre, a decibel scale step"],
  ["c", "centi", -2, "a centimetre, a centilitre"],
  ["m", "milli", -3, "a millimetre, a milligram"],
  ["µ", "micro", -6, "a micrometre (micron), a microgram"],
  ["n", "nano", -9, "a nanometre, a nanosecond"],
  ["p", "pico", -12, "a picofarad, a picosecond"],
  ["f", "femto", -15, "a femtosecond laser pulse"],
  ["a", "atto", -18, "an attosecond — the timescale of electron motion"],
  ["z", "zepto", -21, "close to the mass of a single proton in grams"],
  ["y", "yocto", -24, "close to the mass of a single nucleon in grams"],
  ["r", "ronto", -27, "smaller than a single atom's mass in grams"],
  ["q", "quecto", -30, "the smallest defined SI prefix, added in 2022"],
];
function UnitPrefixReference() {
  const [q, setQ] = useState("");
  const rows = SI_PREFIXES.filter(([sym, name]) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase()) || sym.toLowerCase() === q.trim().toLowerCase());
  return (
    <VStack gap={16}>
      <div><Label>Filter by name or symbol</Label><Input value={q} onChange={setQ} placeholder="e.g. nano, µ, giga" /></div>
      <DataTable
        columns={["Symbol", "Prefix", "Power of 10", "Decimal factor", "Example"]}
        rows={rows.map(([sym, name, pow, ex]) => [
          sym || "—", name, `10${pow >= 0 ? "^" + pow : "^(" + pow + ")"}`,
          Math.abs(pow) >= 18 ? (pow >= 0 ? "1" + "0".repeat(Math.min(pow, 30)) : "0." + "0".repeat(Math.abs(pow) - 1) + "1") : Number(`1e${pow}`).toLocaleString(undefined, { maximumFractionDigits: 30 }),
          ex,
        ])}
      />
      <Note>The full 24-prefix range runs from quetta (10³⁰) to quecto (10⁻³⁰). Ronna, quetta, ronto and quecto were added by the CGPM in November 2022 to keep pace with data-storage and quantum-scale measurements.</Note>
    </VStack>
  );
}

// ══ 26. Physical Constants Table ══════════════════════════════════════════════
const PHYSICAL_CONSTANTS = [
  ["c", "Speed of light in vacuum", "299,792,458", "m/s", true],
  ["h", "Planck constant", "6.62607015×10⁻³⁴", "J·s", true],
  ["ħ", "Reduced Planck constant (h/2π)", "1.054571817×10⁻³⁴", "J·s", false],
  ["e", "Elementary charge", "1.602176634×10⁻¹⁹", "C", true],
  ["Nₐ", "Avogadro constant", "6.02214076×10²³", "mol⁻¹", true],
  ["k", "Boltzmann constant", "1.380649×10⁻²³", "J/K", true],
  ["R", "Molar gas constant (Nₐ·k)", "8.314462618", "J/(mol·K)", false],
  ["G", "Newtonian gravitational constant", "6.67430×10⁻¹¹", "m³/(kg·s²)", false],
  ["mₑ", "Electron mass", "9.1093837139×10⁻³¹", "kg", false],
  ["mₚ", "Proton mass", "1.67262192595×10⁻²⁷", "kg", false],
  ["mₙ", "Neutron mass", "1.67492750056×10⁻²⁷", "kg", false],
  ["ε₀", "Vacuum electric permittivity", "8.8541878188×10⁻¹²", "F/m", false],
  ["µ₀", "Vacuum magnetic permeability", "1.25663706127×10⁻⁶", "N/A²", false],
  ["F", "Faraday constant (Nₐ·e)", "96,485.33212", "C/mol", false],
  ["σ", "Stefan–Boltzmann constant", "5.670374419×10⁻⁸", "W/(m²·K⁴)", false],
  ["g", "Standard acceleration of gravity", "9.80665", "m/s²", true],
  ["atm", "Standard atmosphere", "101,325", "Pa", true],
  ["u", "Atomic mass unit (dalton)", "1.66053906892×10⁻²⁷", "kg", false],
  ["α", "Fine-structure constant", "7.2973525643×10⁻³", "(dimensionless)", false],
  ["R∞", "Rydberg constant", "10,973,731.568157", "m⁻¹", false],
];
function PhysicalConstants() {
  const [q, setQ] = useState("");
  const rows = PHYSICAL_CONSTANTS.filter(([sym, name]) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase()) || sym.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <VStack gap={16}>
      <div><Label>Search by symbol or name</Label><Input value={q} onChange={setQ} placeholder="e.g. Planck, c, Avogadro" /></div>
      <DataTable columns={["Symbol", "Constant", "Value", "Unit", "Exact?"]} rows={rows.map(([sym, name, val, unit, exact]) => [sym, name, val, unit, exact ? "Exact (defined)" : "Measured"])} />
      <Note>Values follow the 2022 CODATA recommended set. Seven constants — c, h, e, Nₐ, k, g and atm — are exact by definition since the 2019 redefinition of the SI base units; the rest are the most precisely measured values currently available and are periodically refined.</Note>
    </VStack>
  );
}

// ══ 27. Greek Alphabet Reference ══════════════════════════════════════════════
const GREEK_LETTERS = [
  ["Α", "α", "Alpha", "AL-fuh", "angles, angular acceleration, significance level, alpha particles"],
  ["Β", "β", "Beta", "BAY-tuh", "angles, beta particles, regression coefficients, thermodynamic beta"],
  ["Γ", "γ", "Gamma", "GAM-uh", "gamma rays, the gamma function, surface tension, shear strain"],
  ["Δ", "δ", "Delta", "DEL-tuh", "change or difference (Δx), the Kronecker/Dirac delta"],
  ["Ε", "ε", "Epsilon", "EP-si-lon", "permittivity, strain, a small positive quantity in limits"],
  ["Ζ", "ζ", "Zeta", "ZAY-tuh", "damping ratio, the Riemann zeta function"],
  ["Η", "η", "Eta", "AY-tuh", "efficiency, viscosity, the Dedekind eta function"],
  ["Θ", "θ", "Theta", "THAY-tuh", "angles, angular position, Big-Theta notation in computer science"],
  ["Ι", "ι", "Iota", "eye-OH-tuh", "a very small amount; index variable in some notations"],
  ["Κ", "κ", "Kappa", "KAP-uh", "curvature, the Kappa statistic, thermal conductivity (sometimes)"],
  ["Λ", "λ", "Lambda", "LAM-duh", "wavelength, eigenvalues, the cosmological constant, decay constant"],
  ["Μ", "μ", "Mu", "MYOO", "the micro prefix, population mean, coefficient of friction, permeability"],
  ["Ν", "ν", "Nu", "NEW", "frequency (to avoid clashing with v for velocity), kinematic viscosity"],
  ["Ξ", "ξ", "Xi", "KSY or ZYE", "a random variable, the Riemann Xi function"],
  ["Ο", "ο", "Omicron", "OM-i-kron", "rarely used in physics; Big-O notation in computer science"],
  ["Π", "π", "Pi", "PIE", "the circle constant 3.14159…, product notation (Π)"],
  ["Ρ", "ρ", "Rho", "ROW", "density, resistivity, correlation coefficient, charge density"],
  ["Σ", "σ / ς", "Sigma", "SIG-muh", "summation (Σ), standard deviation (σ), stress, conductivity"],
  ["Τ", "τ", "Tau", "TAU (rhymes with cow)", "torque, time constant, shear stress, the constant 2π"],
  ["Υ", "υ", "Upsilon", "UP-si-lon", "rarely used alone; appears in particle physics naming"],
  ["Φ", "φ / ϕ", "Phi", "FEE or FY", "angles, the golden ratio (φ ≈ 1.618), electric/magnetic flux, wave functions"],
  ["Χ", "χ", "Chi", "KY (rhymes with sky)", "the chi-squared statistic, susceptibility"],
  ["Ψ", "ψ", "Psi", "SY or PSY", "wave function in quantum mechanics, the digamma function"],
  ["Ω", "ω", "Omega", "oh-MAY-guh", "ohms (Ω, resistance), angular velocity (ω), the last element of a set"],
];
function GreekAlphabetReference() {
  const [q, setQ] = useState("");
  const rows = GREEK_LETTERS.filter(([, , name, , usage]) => !q.trim() || name.toLowerCase().includes(q.trim().toLowerCase()) || usage.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <VStack gap={16}>
      <div><Label>Search by name or use (e.g. "wavelength", "density")</Label><Input value={q} onChange={setQ} placeholder="e.g. lambda, density, torque" /></div>
      <DataTable columns={["Upper", "Lower", "Name", "Pronunciation", "Common scientific use"]} rows={rows.map(([up, lo, name, pron, usage]) => [up, lo, name, pron, usage])} />
      <Note>All 24 letters of the classical Greek alphabet, as used in mathematics, physics, engineering and statistics. Where a letter has two lowercase forms (like final sigma ς), both are shown.</Note>
    </VStack>
  );
}

// ══ 28. Significant Figures Counter ═══════════════════════════════════════════
function analyzeSigFigs(raw) {
  const s0 = (raw || "").trim();
  if (!s0) return null;
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(s0);
  if (!m || (!m[2] && !m[3])) return { error: "Enter a plain or scientific-notation number, e.g. 0.004080, 1200, or 6.022e23." };
  const intPart = m[2] || "", fracPart = m[3], hasExp = m[4] !== undefined;
  const digitsOnly = (intPart + (fracPart || "")).replace(/^0+/, "") || "0";
  let count, rule;
  if (hasExp) {
    const mantissaDigits = (intPart + (fracPart || "")).replace(/^0+(?=.)/, "");
    count = mantissaDigits.length;
    rule = "Written in scientific notation, so every digit in the mantissa is significant — there is no ambiguity about trailing zeros.";
  } else if (fracPart !== undefined) {
    const stripped = (intPart + fracPart).replace(/^0+(?=.)/, "");
    count = stripped === "0" ? 1 : stripped.length;
    if (/^0*$/.test(intPart) && fracPart) {
      const afterLeadingZeros = fracPart.replace(/^0+/, "");
      count = afterLeadingZeros.length || 1;
      rule = "Leading zeros before the first non-zero digit are never significant; every digit from the first non-zero digit onward is significant, including trailing zeros after the decimal point.";
    } else {
      rule = "All digits are significant: non-zero digits, captured zeros between them, and trailing zeros after a decimal point all count.";
    }
  } else {
    const trimmedTrailing = intPart.replace(/0+$/, "");
    count = trimmedTrailing.length || 1;
    rule = "This whole number has no decimal point, so trailing zeros are treated as not significant by convention (they may just be place-holders). Write it in scientific notation, or add a decimal point, to remove the ambiguity.";
  }
  return { count, rule, digitsOnly };
}
function roundToSigFigs(value, n) {
  if (value === 0) return "0";
  const neg = value < 0; const v = Math.abs(value);
  const exp = Math.floor(Math.log10(v));
  const factor = Math.pow(10, exp - n + 1);
  let rounded = Math.round(v / factor) * factor;
  // Guard against floating point re-crossing a power of ten (e.g. 9.996 -> 10.00)
  const digits = Math.max(0, n - 1 - Math.floor(Math.log10(rounded)));
  rounded = parseFloat(rounded.toFixed(Math.min(20, Math.max(0, digits))));
  const newExp = Math.floor(Math.log10(rounded));
  if (newExp < -4 || newExp >= 21) {
    return (neg ? "-" : "") + rounded.toExponential(n - 1);
  }
  const decimals = Math.max(0, n - 1 - newExp);
  return (neg ? "-" : "") + rounded.toFixed(decimals);
}
function SignificantFiguresCounter() {
  const [val, setVal] = useState("0.004080");
  const [roundTo, setRoundTo] = useState("2");
  const res = analyzeSigFigs(val);
  const n = Math.max(1, parseInt(roundTo, 10) || 1);
  const num = parseFloat(val);
  return (
    <VStack gap={16}>
      <div><Label>Measurement</Label><Input value={val} onChange={setVal} placeholder="0.004080" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16 }} /></div>
      {!res ? <Result mono={false}>Enter a number to analyse.</Result> : res.error ? <Result mono={false}>⚠ {res.error}</Result> : (
        <>
          <BigResult value={res.count} label={`Significant figure${res.count !== 1 ? "s" : ""}`} />
          <Note>{res.rule}</Note>
          <Grid2>
            <div><Label>Round to how many sig figs</Label><Input value={roundTo} onChange={setRoundTo} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              {!isNaN(num) && <BigResult value={roundToSigFigs(num, n)} label={`Rounded to ${n} sig fig${n !== 1 ? "s" : ""}`} />}
            </div>
          </Grid2>
        </>
      )}
      <Note>Rules applied: (1) all non-zero digits are significant, (2) zeros between non-zero digits are significant, (3) leading zeros are never significant, (4) trailing zeros are significant only when a decimal point is present, (5) numbers with no decimal point have ambiguous trailing zeros unless written in scientific notation.</Note>
    </VStack>
  );
}

// ══ 29. Scientific Notation Converter ═════════════════════════════════════════
function toEngineering(value) {
  if (value === 0) return { mantissa: "0", exp: 0 };
  const neg = value < 0; const v = Math.abs(value);
  let exp = Math.floor(Math.log10(v));
  let engExp = Math.floor(exp / 3) * 3;
  let mantissa = v / Math.pow(10, engExp);
  // guard rounding pushing mantissa to 1000
  if (mantissa >= 1000) { mantissa /= 1000; engExp += 3; }
  return { mantissa: (neg ? -mantissa : mantissa), exp: engExp };
}
function ScientificNotationConverter() {
  const [val, setVal] = useState("6371000");
  const num = parseFloat(val);
  const valid = val.trim() !== "" && !isNaN(num);
  let sci = null, eng = null, decimal = null;
  if (valid) {
    decimal = num.toLocaleString(undefined, { maximumFractionDigits: 20 });
    const exp = num === 0 ? 0 : Math.floor(Math.log10(Math.abs(num)));
    const mantissa = num === 0 ? 0 : num / Math.pow(10, exp);
    sci = { mantissa: parseFloat(mantissa.toPrecision(10)), exp };
    eng = toEngineering(num);
  }
  return (
    <VStack gap={16}>
      <div><Label>Enter a number (decimal, scientific "6.022e23", or engineering)</Label><Input value={val} onChange={setVal} placeholder="6371000 or 6.022e23" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16 }} /></div>
      {!valid ? <Result mono={false}>Enter a valid number.</Result> : (
        <>
          <Grid3>
            <div>
              <Label>Decimal (standard form)</Label>
              <Result>{decimal}</Result>
            </div>
            <div>
              <Label>Scientific notation</Label>
              <Result>{sci.mantissa} × 10{sci.exp >= 0 ? "^" + sci.exp : "^(" + sci.exp + ")"}</Result>
            </div>
            <div>
              <Label>Engineering notation</Label>
              <Result>{eng.mantissa.toPrecision(10).replace(/\.?0+$/, "")} × 10{eng.exp >= 0 ? "^" + eng.exp : "^(" + eng.exp + ")"}</Result>
            </div>
          </Grid3>
          <StatRow items={[["Order of magnitude", "10^" + sci.exp], ["E-notation", num.toExponential(6)], ["Engineering exponent", (eng.exp >= 0 ? "+" : "") + eng.exp]]} />
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={`${decimal} = ${sci.mantissa}×10^${sci.exp} = ${num.toExponential(6)}`} /></div>
        </>
      )}
      <Note>Scientific notation always keeps exactly one non-zero digit before the decimal point. Engineering notation instead keeps the exponent a multiple of 3, so it lines up with SI prefixes — 6.371×10⁶ becomes 6.371×10⁶ (mega-scale) rather than an arbitrary power of ten.</Note>
    </VStack>
  );
}

// ══ 30. Multiplication Table Generator ════════════════════════════════════════
function MultiplicationTableGenerator() {
  const [from, setFrom] = useState("1");
  const [to, setTo] = useState("12");
  const [mode, setMode] = useState("table");
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const lo = Math.max(0, Math.min(30, parseInt(from, 10) || 0));
  const hi = Math.max(lo, Math.min(30, parseInt(to, 10) || 12));
  const range = [];
  for (let i = lo; i <= hi; i++) range.push(i);

  const newQuestion = () => {
    const a = range[secureRandom(range.length)];
    const b = range[secureRandom(range.length)];
    setQuiz({ a, b });
    setAnswer(""); setFeedback(null);
  };
  useEffect(() => { if (mode === "practice" && !quiz) newQuestion(); }, [mode]); // eslint-disable-line

  const checkAnswer = () => {
    if (!quiz) return;
    const correct = quiz.a * quiz.b;
    const ok = parseInt(answer, 10) === correct;
    setScore(s => ({ right: s.right + (ok ? 1 : 0), wrong: s.wrong + (ok ? 0 : 1) }));
    setFeedback(ok ? "✓ Correct!" : `✗ Not quite — ${quiz.a} × ${quiz.b} = ${correct}`);
    setTimeout(newQuestion, ok ? 700 : 1600);
  };

  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>From</Label><Input value={from} onChange={setFrom} /></div>
        <div><Label>To</Label><Input value={to} onChange={setTo} /></div>
        <div><Label>Mode</Label><SelectInput value={mode} onChange={v => { setMode(v); setQuiz(null); setScore({ right: 0, wrong: 0 }); }} style={{ width: "100%" }} options={[["table", "Printable table"], ["practice", "Practice quiz"]]} /></div>
      </Grid3>
      {mode === "table" ? (
        <>
          <PrintBtn />
          <Paper style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: "'JetBrains Mono',monospace", fontSize: 12.5 }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: 6, background: "#F3F4F6" }}>×</th>
                  {range.map(c => <th key={c} style={{ border: "1px solid #ccc", padding: 6, background: "#F3F4F6" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {range.map(r => (
                  <tr key={r}>
                    <th style={{ border: "1px solid #ccc", padding: 6, background: "#F3F4F6" }}>{r}</th>
                    {range.map(c => <td key={c} style={{ border: "1px solid #ccc", padding: 6, textAlign: "center" }}>{r * c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </Paper>
        </>
      ) : (
        <VStack gap={14}>
          <StatRow items={[["Correct", score.right], ["Incorrect", score.wrong], ["Accuracy", score.right + score.wrong ? Math.round(100 * score.right / (score.right + score.wrong)) + "%" : "—"]]} />
          {quiz && (
            <div style={{ textAlign: "center", padding: "28px 16px", borderRadius: 12, background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.25)" }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 30, fontWeight: 700, marginBottom: 14 }}>{quiz.a} × {quiz.b} = ?</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                <Input value={answer} onChange={setAnswer} style={{ maxWidth: 120, textAlign: "center" }} placeholder="?" />
                <Btn onClick={checkAnswer} disabled={answer.trim() === ""}>Check</Btn>
              </div>
              {feedback && <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: feedback.startsWith("✓") ? C.success : C.warn }}>{feedback}</div>}
            </div>
          )}
        </VStack>
      )}
      <Note>Table facts run from {lo} to {hi}. Practice mode draws random pairs from that same range using your browser's secure random generator.</Note>
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
const TOOL_COMPONENTS = {
  "flashcard-maker": FlashcardMaker,
  "quiz-generator": QuizGenerator,
  "multiple-choice-maker": MultipleChoiceMaker,
  "study-timer": StudyTimer,
  "spaced-repetition-planner": SpacedRepetitionPlanner,
  "revision-planner": RevisionPlanner,
  "grade-calculator": GradeCalculator,
  "final-grade-needed": FinalGradeNeeded,
  "gpa-planner": GpaPlanner,
  "attendance-calculator": AttendanceCalculator,
  "exam-countdown": ExamCountdown,
  "random-question-picker": RandomQuestionPicker,
  "citation-generator": CitationGenerator,
  "bibliography-builder": BibliographyBuilder,
  "in-text-citation-helper": InTextCitationHelper,
  "essay-word-counter": EssayWordCounter,
  "reading-time-estimator": ReadingTimeEstimator,
  "readability-scorer": ReadabilityScorer,
  "paragraph-splitter": ParagraphSplitter,
  "outline-builder": OutlineBuilder,
  "note-summariser-formatter": NoteFormatter,
  "periodic-table": PeriodicTable,
  "molar-mass-calculator": MolarMassCalculator,
  "equation-balancer": EquationBalancer,
  "unit-prefix-reference": UnitPrefixReference,
  "physical-constants": PhysicalConstants,
  "greek-alphabet-reference": GreekAlphabetReference,
  "significant-figures-counter": SignificantFiguresCounter,
  "scientific-notation-converter": ScientificNotationConverter,
  "multiplication-table-generator": MultiplicationTableGenerator,
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
    document.title = `${cat?.name || 'Category'} – Study & Education Tools | ToolsRift`;
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
    document.title = "Free Study Tools – Flashcards, Citations, Periodic Table | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search study & education tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(79,70,229,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.accent, textDecoration:"none" }}>{THEME?.name||"Study & Education Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(79,70,229,0.12)", color:C.accent, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(79,70,229,0.25)" }}>{TOOLS.length} tools</span>
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

function ToolsRiftStudy() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="study"/>}
    </div>
  );
}

export default ToolsRiftStudy;
