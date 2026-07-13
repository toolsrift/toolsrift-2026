import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("everyday");
const PAGE_THEME = getCategoryById('everyday');
const BRAND = { name: "ToolsRift", tagline: "Everyday Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  indigo: "#F97316", indigoD: "#EA580C",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(249,115,22,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

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
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(249,115,22,0.25)` },
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
    <div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, minHeight:40, whiteSpace:"pre-wrap", wordBreak:"break-all" }}>
      {children}
    </div>
  );
}

function BigResult({ value, label }) {
  return (
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(249,115,22,0.08)", border:`1px solid rgba(249,115,22,0.2)`, borderRadius:10 }}>
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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/everyday` }] : []),
          ...(tool ? [{ "@type": "ListItem", "position": 3, "name": tool.name || tool.id || "" }] : [])
        ]
      }) }} />
    </>
  );
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
  { id:"age-calculator", cat:"datetime", name:"Age Calculator", desc:"Calculate exact age in years, months and days from date of birth, with next birthday countdown", icon:"🎂", free:true },
  { id:"date-difference", cat:"datetime", name:"Date Difference Calculator", desc:"Days, weeks, months and years between any two dates", icon:"📅", free:true },
  { id:"add-subtract-days", cat:"datetime", name:"Add or Subtract Days", desc:"Add or subtract days from any date and get the exact resulting date and weekday", icon:"➕", free:true },
  { id:"days-until", cat:"datetime", name:"Days Until Calculator", desc:"Count down the days remaining until a birthday, exam, wedding or any event", icon:"⏳", free:true },
  { id:"world-clock", cat:"datetime", name:"World Clock & Time Zone Converter", desc:"See the current time in major cities worldwide and convert any time between time zones", icon:"🌍", free:true },
  { id:"countdown-timer", cat:"timers", name:"Countdown Timer", desc:"Set minutes and seconds and count down with start, pause and reset controls", icon:"⏲️", free:true },
  { id:"stopwatch", cat:"timers", name:"Online Stopwatch", desc:"Precise stopwatch with lap times, start, pause and reset — works fullscreen", icon:"⏱️", free:true },
  { id:"pomodoro-timer", cat:"timers", name:"Pomodoro Timer", desc:"Focus timer with 25-minute work sessions and 5-minute breaks for productivity", icon:"🍅", free:true },
  { id:"typing-speed-test", cat:"fun", name:"Typing Speed Test", desc:"Test your typing speed in WPM with live accuracy tracking — retry as many times as you want", icon:"⌨️", free:true },
  { id:"random-name-picker", cat:"fun", name:"Random Name Picker", desc:"Paste a list of names and pick a random winner — great for giveaways and classrooms", icon:"🎯", free:true },
  { id:"dice-roller", cat:"fun", name:"Dice Roller", desc:"Roll up to six virtual dice with 4 to 20 sides — perfect for board games and D&D", icon:"🎲", free:true },
  { id:"coin-flip", cat:"fun", name:"Coin Flip", desc:"Flip a virtual coin for instant heads-or-tails decisions with flip history", icon:"🪙", free:true },
  { id:"scoreboard", cat:"fun", name:"Online Scoreboard", desc:"Simple two-team scoreboard with custom names — great for games and sports", icon:"🏆", free:true },
  { id:"leap-year-checker", cat:"datetime", name:"Leap Year Checker", desc:"Check whether any year is a leap year and see the next and previous leap years", icon:"📆", free:true },
  { id:"iso-week-number", cat:"datetime", name:"ISO Week Number", desc:"Find the ISO 8601 week number for any date, plus the day of year and week-year", icon:"🗓️", free:true },
  { id:"day-of-week-finder", cat:"datetime", name:"Day of the Week Finder", desc:"Find what day of the week any date falls on using Zeller's congruence — any year", icon:"📅", free:true },
  { id:"moon-phase", cat:"datetime", name:"Moon Phase Calculator", desc:"See the moon phase, illumination and lunar age for any date with an emoji icon", icon:"🌙", free:true },
  { id:"business-days-between", cat:"datetime", name:"Business Days Calculator", desc:"Count working days (Mon–Fri) between two dates, excluding weekends", icon:"💼", free:true },
  { id:"days-in-month", cat:"datetime", name:"Days in Month Calculator", desc:"Find how many days are in any month and year, including leap-year February", icon:"📇", free:true },
  { id:"easter-date", cat:"datetime", name:"Easter Sunday Date Finder", desc:"Calculate the exact date of Easter Sunday for any year using the Computus algorithm", icon:"🐣", free:true },
  { id:"unix-timestamp-converter", cat:"datetime", name:"Unix Timestamp Converter", desc:"Convert Unix epoch timestamps to human dates and back, in UTC and local time", icon:"⏰", free:true },
  { id:"weekday-counter", cat:"datetime", name:"Weekday Counter", desc:"Count how many Mondays, Fridays or any weekday fall between two dates", icon:"🔢", free:true },
  { id:"half-birthday", cat:"datetime", name:"Half Birthday Calculator", desc:"Find your half birthday — exactly six months from your date of birth", icon:"🎉", free:true },
  { id:"zodiac-sign", cat:"fun", name:"Zodiac Sign Finder", desc:"Discover your Western star sign, element and date range from your birthday", icon:"♈", free:true },
  { id:"chinese-zodiac", cat:"fun", name:"Chinese Zodiac Finder", desc:"Find your Chinese zodiac animal and its traits from your birth year", icon:"🐲", free:true },
  { id:"generation-finder", cat:"fun", name:"Generation Finder", desc:"Find which generation you belong to — Boomer, Gen X, Millennial, Gen Z and more", icon:"👥", free:true },
  { id:"next-friday-13", cat:"fun", name:"Next Friday the 13th", desc:"Find the next Friday the 13th and list upcoming ones — count the days until each", icon:"😱", free:true },
];

const CATEGORIES = [
  { id:"datetime", name:"Date & Age Calculators", icon:"📅", desc:"Age, date difference and day counting tools." },
  { id:"timers", name:"Timers & Stopwatch", icon:"⏱️", desc:"Countdown, stopwatch and Pomodoro focus timers." },
  { id:"fun", name:"Games & Random Tools", icon:"🎲", desc:"Typing test, dice, coin flip, name picker and scoreboard." },
];

const TOOL_META = {
  "age-calculator": {
    title: "Free Age Calculator – Exact Age in Years, Months & Days | ToolsRift",
    desc: "Calculate your exact age from your date of birth — in years, months, days, and total days lived — with a countdown to your next birthday. Free, instant, no signup.",
    faq: [
      ["How is my exact age calculated?", "Your age is calculated as complete years since your birth date, then remaining complete months, then remaining days — the same way official documents count age."],
      ["Can I calculate age on a specific date?", "Yes. Change the 'Age as of' date to any past or future date to see how old you were or will be on that day."],
      ["Is my date of birth stored anywhere?", "No. The calculation runs entirely in your browser and nothing is uploaded or saved."],
    ],
  },
  "date-difference": {
    title: "Date Difference Calculator – Days Between Two Dates | ToolsRift",
    desc: "Find the exact number of days, weeks, months and years between any two dates. Useful for deadlines, contracts, pregnancies and project planning.",
    faq: [
      ["Does it include both start and end dates?", "By default the difference counts the days between the dates. Toggle 'include end date' to add one day, which is common for contract and rental calculations."],
      ["Can I compare dates across years?", "Yes, any two dates work — even decades apart — and the result shows years, months, days plus total days and weeks."],
    ],
  },
  "add-subtract-days": {
    title: "Add or Subtract Days From a Date – Date Calculator | ToolsRift",
    desc: "Add or subtract any number of days from a date and instantly get the resulting date with its weekday. Great for deadlines, notice periods and delivery dates.",
    faq: [
      ["What can I use this for?", "Common uses: finding a deadline 90 days from today, a 30-day notice period end date, a return-window date, or medication schedules."],
      ["Does it handle months and leap years?", "Yes. The calculation uses real calendar dates so month lengths and leap years are always correct."],
    ],
  },
  "days-until": {
    title: "Days Until Calculator – Countdown to Any Date | ToolsRift",
    desc: "How many days until your birthday, exam, wedding or holiday? Pick a date and get the countdown in days and weeks instantly.",
    faq: [
      ["Does today count as a day?", "No — the result is the number of complete days between today and your chosen date."],
      ["What if I pick a past date?", "You'll see how many days have passed since that date instead."],
    ],
  },
  "world-clock": {
    title: "World Clock & Time Zone Converter – Current Time in Cities | ToolsRift",
    desc: "See the current local time in major cities worldwide — New York, London, Dubai, India, Tokyo, Sydney and more — and convert any time between time zones. Free, live, no signup.",
    faq: [
      ["How is the time kept accurate?", "The clock uses your device's own clock and the browser's built-in IANA time zone database (Intl.DateTimeFormat), so each city shows the correct local time including daylight saving."],
      ["How does the time zone converter work?", "Enter a time and pick the source city. The tool treats that as the wall-clock time in the source zone and shows the exact matching local time in every other city."],
      ["Does it need the internet?", "No. All conversions run entirely in your browser with no network calls, so your data never leaves your device."],
    ],
  },
  "countdown-timer": {
    title: "Online Countdown Timer – Set Minutes & Seconds Free | ToolsRift",
    desc: "Free online countdown timer with start, pause and reset. Set any minutes and seconds — perfect for cooking, workouts, studying and presentations.",
    faq: [
      ["Will the timer keep running if I switch tabs?", "Yes, the countdown continues in the background, and the remaining time is shown in the page title so you can see it from the tab."],
      ["Can I pause and resume?", "Yes — pause any time and resume exactly where you left off, or reset to your original time."],
    ],
  },
  "stopwatch": {
    title: "Online Stopwatch with Laps – Free & Precise | ToolsRift",
    desc: "Free online stopwatch with lap times and centisecond precision. Start, pause, lap and reset — ideal for sports, science experiments and time tracking.",
    faq: [
      ["How precise is the stopwatch?", "It displays hundredths of a second and uses your device's high-precision clock, so pausing and resuming stays accurate."],
      ["Can I record lap times?", "Yes — press Lap while running to record split times, listed with lap number and total elapsed time."],
    ],
  },
  "pomodoro-timer": {
    title: "Pomodoro Timer Online – 25/5 Focus Timer Free | ToolsRift",
    desc: "Free Pomodoro timer with 25-minute focus sessions and 5-minute breaks. Track completed pomodoros and stay productive — no app or signup needed.",
    faq: [
      ["What is the Pomodoro Technique?", "A time-management method: work with full focus for 25 minutes, then take a 5-minute break. Each cycle is one 'pomodoro'. After 4 pomodoros, take a longer break."],
      ["Can I customize the durations?", "Yes — adjust both the focus and break lengths to fit your workflow before starting."],
    ],
  },
  "typing-speed-test": {
    title: "Typing Speed Test – Check Your WPM Free Online | ToolsRift",
    desc: "Test your typing speed in words per minute (WPM) with live accuracy tracking. One-minute test, unlimited retries, multiple sample texts — completely free.",
    faq: [
      ["How is WPM calculated?", "WPM = (correct characters typed ÷ 5) ÷ minutes elapsed. Five characters count as one standard 'word', which is the industry-standard method."],
      ["What is a good typing speed?", "Average is around 40 WPM. 60+ WPM is good, 80+ is fast, and professional typists often exceed 100 WPM. Accuracy above 95% matters as much as speed."],
    ],
  },
  "random-name-picker": {
    title: "Random Name Picker – Pick a Winner From a List | ToolsRift",
    desc: "Paste names, click pick, and get a random winner. Optionally remove winners for multiple rounds. Perfect for giveaways, raffles, classrooms and teams.",
    faq: [
      ["Is the picking really random?", "Yes — it uses your browser's cryptographically-strong random number generator, so every name has an exactly equal chance."],
      ["Can I pick multiple winners?", "Yes. Enable 'remove winner after picking' and click pick repeatedly — each round excludes previous winners."],
    ],
  },
  "dice-roller": {
    title: "Dice Roller Online – Roll D4, D6, D8, D10, D12, D20 | ToolsRift",
    desc: "Roll up to six virtual dice with 4, 6, 8, 10, 12 or 20 sides. Instant results with total — perfect for board games, D&D and classroom activities.",
    faq: [
      ["Are the rolls fair?", "Yes — each roll uses your browser's secure random generator, giving every face an equal probability just like a physical die."],
      ["Can I roll D&D dice?", "Yes. Choose 4, 6, 8, 10, 12 or 20 sides to roll any standard tabletop RPG die, up to six at once."],
    ],
  },
  "coin-flip": {
    title: "Coin Flip Online – Heads or Tails Instantly | ToolsRift",
    desc: "Flip a virtual coin for instant heads-or-tails results with a running history and tally. Fair 50/50 odds using secure randomness.",
    faq: [
      ["Is the coin flip fair?", "Yes — heads and tails each have an exactly 50% chance, generated by your browser's secure random source."],
      ["Can I see past flips?", "Yes, the history shows your recent flips and the running heads/tails tally."],
    ],
  },
  "scoreboard": {
    title: "Online Scoreboard – Free Score Keeper for Two Teams | ToolsRift",
    desc: "Simple online scoreboard for two teams with custom names, +/- controls and reset. Great for table tennis, badminton, quizzes and family games.",
    faq: [
      ["Can I rename the teams?", "Yes — click on a team name and type any name you like."],
      ["Does the score save if I refresh?", "No, the scoreboard resets on refresh — it is designed for live score keeping during a game."],
    ],
  },
  "leap-year-checker": {
    title: "Leap Year Checker – Is It a Leap Year? Free Online | ToolsRift",
    desc: "Instantly check whether any year is a leap year, why, and see the next and previous leap years. Uses the exact Gregorian rule: divisible by 4, except centuries not divisible by 400.",
    faq: [
      ["What makes a year a leap year?", "A year is a leap year if it is divisible by 4, except for century years, which must also be divisible by 400. So 2000 was a leap year but 1900 was not."],
      ["Why do we need leap years?", "Earth takes about 365.2422 days to orbit the Sun. Adding a day every four years keeps the calendar aligned with the seasons; the century rule corrects the small remaining error."],
      ["Is 2100 a leap year?", "No. 2100 is divisible by 4 but it is a century year not divisible by 400, so it is a common year of 365 days."],
    ],
  },
  "iso-week-number": {
    title: "ISO Week Number Calculator – Week of the Year | ToolsRift",
    desc: "Find the ISO 8601 week number for any date, plus the day of the year and the ISO week-year. Weeks start on Monday and week 1 always contains the year's first Thursday.",
    faq: [
      ["How is the ISO week number defined?", "Under ISO 8601, weeks start on Monday and week 1 is the week containing the first Thursday of the year (equivalently, the week with January 4th)."],
      ["Why can early January be week 52 or 53?", "If the first days of January fall before that year's first Thursday, they belong to the last week of the previous ISO year — which is why the week-year can differ from the calendar year."],
      ["Does the week ever go to 53?", "Yes. Years starting on a Thursday, and leap years starting on a Wednesday, have 53 ISO weeks."],
    ],
  },
  "day-of-week-finder": {
    title: "Day of the Week Finder – What Day Was Any Date? | ToolsRift",
    desc: "Find what day of the week any date falls on, past or future, using Zeller's congruence. Discover the weekday of your birthday, a historical event or a future deadline.",
    faq: [
      ["How does it work?", "It uses Zeller's congruence, a classic formula that computes the weekday directly from the day, month and year of a proleptic Gregorian date — no calendar lookup needed."],
      ["Does it work for old historical dates?", "Yes, for dates in the Gregorian calendar. Note that many countries adopted the Gregorian calendar at different times before the 1900s."],
      ["What day was I born on?", "Enter your date of birth and the tool tells you instantly which day of the week you were born."],
    ],
  },
  "moon-phase": {
    title: "Moon Phase Calculator – Lunar Phase for Any Date | ToolsRift",
    desc: "See the moon phase, illumination percentage and lunar age for any date, with a matching emoji. Based on the average synodic month for a fast, offline approximation.",
    faq: [
      ["How accurate is the moon phase?", "It uses the average synodic month (29.53 days) from a known new moon, so it is accurate to within roughly a day — great for a quick reference, planning or curiosity."],
      ["What are the eight phases?", "New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter and Waning Crescent — the full cycle repeats about every 29.5 days."],
      ["What does illumination mean?", "It is the fraction of the Moon's visible disc lit by the Sun — 0% at new moon, 100% at full moon."],
    ],
  },
  "business-days-between": {
    title: "Business Days Calculator – Working Days Between Dates | ToolsRift",
    desc: "Count the number of business days (Monday to Friday) between two dates, excluding weekends. Perfect for delivery estimates, notice periods, invoices and SLAs.",
    faq: [
      ["Are weekends excluded?", "Yes. Only Monday through Friday are counted; Saturdays and Sundays are skipped. Both the start and end dates are included in the count if they are weekdays."],
      ["Does it account for public holidays?", "No — it counts standard Monday–Friday working days only. Public holidays vary by country and are not deducted."],
      ["What is a business day used for?", "Business days are used for delivery windows, payment terms, legal notice periods and service-level agreements where weekends do not count."],
    ],
  },
  "days-in-month": {
    title: "Days in Month Calculator – How Many Days in a Month | ToolsRift",
    desc: "Find how many days are in any month of any year, including February in leap years. Quick reference for 28, 29, 30 or 31-day months and payroll or billing periods.",
    faq: [
      ["How many days does February have?", "February has 28 days in common years and 29 days in leap years. This tool checks the leap-year rule automatically for the year you enter."],
      ["Which months have 31 days?", "January, March, May, July, August, October and December each have 31 days. April, June, September and November have 30."],
      ["Why does this matter for billing?", "Daily rates, prorated rent and interest calculations depend on the exact number of days in the month, which varies through the year."],
    ],
  },
  "easter-date": {
    title: "Easter Date Calculator – Find Easter Sunday for Any Year | ToolsRift",
    desc: "Calculate the exact date of Easter Sunday for any year using the Gregorian Computus algorithm. Also shows the weekday and days from today. Free and instant.",
    faq: [
      ["How is the Easter date determined?", "Easter is the first Sunday after the first ecclesiastical full moon on or after March 21. This tool uses the Anonymous Gregorian Computus algorithm to compute it exactly."],
      ["What is the earliest and latest Easter can fall?", "In the Gregorian calendar, Easter Sunday can fall anywhere from March 22 to April 25."],
      ["Does this match Orthodox Easter?", "Not always. This calculates Western (Gregorian) Easter. Orthodox churches use the Julian calendar, so their Easter often falls on a different date."],
    ],
  },
  "unix-timestamp-converter": {
    title: "Unix Timestamp Converter – Epoch to Date & Back | ToolsRift",
    desc: "Convert Unix epoch timestamps to human-readable dates and convert dates back to timestamps. Shows both UTC and local time, in seconds or milliseconds. Free, no signup.",
    faq: [
      ["What is a Unix timestamp?", "It is the number of seconds that have elapsed since 00:00:00 UTC on January 1, 1970 (the Unix epoch), a standard way computers store time."],
      ["Seconds or milliseconds?", "Unix timestamps are traditionally in seconds; JavaScript and many APIs use milliseconds. This tool auto-detects and lets you choose the unit."],
      ["What time zone is used?", "The tool shows both UTC and your device's local time so you can read the timestamp either way."],
    ],
  },
  "weekday-counter": {
    title: "Weekday Counter – Count Mondays, Fridays Between Dates | ToolsRift",
    desc: "Count how many times each weekday — Mondays, Tuesdays, Fridays and so on — occur between two dates. Useful for scheduling classes, shifts, rent and recurring events.",
    faq: [
      ["What does it count?", "It counts how many of each of the seven weekdays fall in your chosen date range, inclusive of both the start and end dates."],
      ["What can I use it for?", "Great for figuring out how many working Fridays are in a quarter, how many weekend days are in a trip, or how many of a specific class day fall in a term."],
      ["Are both endpoints included?", "Yes. The start date and end date are both counted if they land on the weekday in question."],
    ],
  },
  "half-birthday": {
    title: "Half Birthday Calculator – Find Your Half Birthday | ToolsRift",
    desc: "Find your half birthday — the date exactly six months from your date of birth. Fun for kids' celebrations, planning surprises and summer-birthday half parties.",
    faq: [
      ["What is a half birthday?", "Your half birthday is the day exactly six months after your birthday. People with birthdays near holidays sometimes celebrate their half birthday instead."],
      ["How is it calculated?", "The tool adds six calendar months to your birth date. For example, a January 15 birthday gives a July 15 half birthday."],
      ["What if I was born on August 31?", "Adding six months lands in late February, which has fewer days, so the resulting date rolls to early March — the tool shows the exact resolved date."],
    ],
  },
  "zodiac-sign": {
    title: "Zodiac Sign Finder – What's My Star Sign? Free | ToolsRift",
    desc: "Find your Western zodiac star sign, its element and date range from your birthday. Discover whether you're an Aries, Leo, Scorpio, Pisces and all twelve signs.",
    faq: [
      ["How is my zodiac sign determined?", "Your Western (tropical) zodiac sign is based on the calendar date of your birthday, using the standard sign date ranges — no birth year or time needed."],
      ["What are the four elements?", "The twelve signs are grouped into Fire (Aries, Leo, Sagittarius), Earth (Taurus, Virgo, Capricorn), Air (Gemini, Libra, Aquarius) and Water (Cancer, Scorpio, Pisces)."],
      ["What if I'm born on a cusp date?", "Sign boundaries can shift by a day between years due to the Sun's exact position. This tool uses the common fixed date ranges; borderline dates may vary slightly by source."],
    ],
  },
  "chinese-zodiac": {
    title: "Chinese Zodiac Finder – Your Animal Sign by Year | ToolsRift",
    desc: "Find your Chinese zodiac animal — Rat, Ox, Tiger, Dragon and more — and its traits from your birth year. The 12-animal cycle repeats every twelve years.",
    faq: [
      ["What are the 12 Chinese zodiac animals?", "In order: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog and Pig. The cycle repeats every 12 years."],
      ["Is it based on the exact year?", "This tool uses the Gregorian birth year. Note the Chinese New Year falls in late January or February, so people born in those weeks may belong to the previous animal's year."],
      ["What year is my animal?", "Enter your birth year and the tool shows your animal and the years it recurs. For example, 2024 is the Year of the Dragon."],
    ],
  },
  "generation-finder": {
    title: "Generation Finder – Boomer, Gen X, Millennial, Gen Z | ToolsRift",
    desc: "Find which generation you belong to from your birth year — the Silent Generation, Baby Boomers, Gen X, Millennials, Gen Z, Gen Alpha and Gen Beta.",
    faq: [
      ["Which birth years define each generation?", "Common ranges: Baby Boomers 1946–1964, Gen X 1965–1980, Millennials 1981–1996, Gen Z 1997–2012, Gen Alpha 2013–2024, and Gen Beta from 2025."],
      ["Are generation boundaries exact?", "No — they are widely-used conventions (based on Pew Research and popular usage), and different sources set the cut-offs a year or two apart."],
      ["What generation am I?", "Enter your birth year and the tool names your generation and shows its full year range."],
    ],
  },
  "next-friday-13": {
    title: "Next Friday the 13th – Countdown to the Unlucky Day | ToolsRift",
    desc: "Find the next Friday the 13th and the days until it, plus a list of upcoming Friday the 13ths. Every year has at least one and at most three.",
    faq: [
      ["How often is Friday the 13th?", "Every calendar year has between one and three Friday the 13ths. On average there is one about every 212 days."],
      ["Why is it considered unlucky?", "The superstition combines the number 13 (long viewed as unlucky in Western culture) with Friday. The fear even has a name: paraskevidekatriaphobia."],
      ["How is the next one found?", "The tool checks the 13th of each upcoming month and reports the next one that falls on a Friday, then lists several that follow."],
    ],
  },
};

// ── date helpers ─────────────────────────────────────────────────────────────
const fmtDate = (d) => d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
const toISO = (d) => { const z = new Date(d); z.setMinutes(z.getMinutes() - z.getTimezoneOffset()); return z.toISOString().slice(0, 10); };
const dateInputStyle = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#E2E8F0", fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", colorScheme: "dark" };
const bigBtn = (bg) => ({ padding: "12px 28px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Sora',sans-serif", color: "#fff", background: bg });
const ageBreakdown = (from, to) => {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) { m -= 1; d += new Date(to.getFullYear(), to.getMonth(), 0).getDate(); }
  if (m < 0) { y -= 1; m += 12; }
  return { y, m, d };
};

function AgeCalculator() {
  const [dob, setDob] = useState("2000-01-01");
  const [asOf, setAsOf] = useState(toISO(new Date()));
  const out = useMemo(() => {
    const from = new Date(dob), to = new Date(asOf);
    if (isNaN(from) || isNaN(to) || from > to) return null;
    const { y, m, d } = ageBreakdown(from, to);
    const totalDays = Math.floor((to - from) / 86400000);
    let next = new Date(to.getFullYear(), from.getMonth(), from.getDate());
    if (next <= to) next = new Date(to.getFullYear() + 1, from.getMonth(), from.getDate());
    const untilBday = Math.ceil((next - to) / 86400000);
    return { y, m, d, totalDays, weeks: Math.floor(totalDays / 7), untilBday };
  }, [dob, asOf]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Date of Birth</Label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={dateInputStyle} /></div>
        <div><Label>Age as of</Label><input type="date" value={asOf} onChange={e => setAsOf(e.target.value)} style={dateInputStyle} /></div>
      </Grid2>
      {out ? (
        <>
          <Grid3>
            <BigResult value={out.y} label="Years" />
            <BigResult value={out.m} label="Months" />
            <BigResult value={out.d} label="Days" />
          </Grid3>
          <Grid3>
            <StatBox value={out.totalDays.toLocaleString("en-IN")} label="Total Days Lived" />
            <StatBox value={out.weeks.toLocaleString("en-IN")} label="Total Weeks" />
            <StatBox value={`${out.untilBday} days`} label="Until Next Birthday 🎂" />
          </Grid3>
        </>
      ) : <Result mono={false}>Enter a valid date of birth (before the "as of" date).</Result>}
    </VStack>
  );
}

function DateDifference() {
  const [start, setStart] = useState(toISO(new Date()));
  const [end, setEnd] = useState(toISO(new Date(Date.now() + 30 * 86400000)));
  const [inclusive, setInclusive] = useState("no");
  const out = useMemo(() => {
    let a = new Date(start), b = new Date(end);
    if (isNaN(a) || isNaN(b)) return null;
    if (a > b) [a, b] = [b, a];
    const extra = inclusive === "yes" ? 1 : 0;
    const totalDays = Math.floor((b - a) / 86400000) + extra;
    const { y, m, d } = ageBreakdown(a, b);
    return { y, m, d: d + extra, totalDays, weeks: (totalDays / 7).toFixed(1) };
  }, [start, end, inclusive]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Start Date</Label><input type="date" value={start} onChange={e => setStart(e.target.value)} style={dateInputStyle} /></div>
        <div><Label>End Date</Label><input type="date" value={end} onChange={e => setEnd(e.target.value)} style={dateInputStyle} /></div>
        <div><Label>Include End Date?</Label><SelectInput value={inclusive} onChange={setInclusive} options={[["no","No"],["yes","Yes (+1 day)"]]} /></div>
      </Grid3>
      {out && (
        <>
          <Grid2>
            <BigResult value={out.totalDays.toLocaleString("en-IN")} label="Total Days" />
            <BigResult value={out.weeks} label="Total Weeks" />
          </Grid2>
          <Result mono={false}>That's {out.y} year{out.y !== 1 ? "s" : ""}, {out.m} month{out.m !== 1 ? "s" : ""} and {out.d} day{out.d !== 1 ? "s" : ""}.</Result>
        </>
      )}
    </VStack>
  );
}

function AddSubtractDays() {
  const [start, setStart] = useState(toISO(new Date()));
  const [days, setDays] = useState("90");
  const [mode, setMode] = useState("add");
  const out = useMemo(() => {
    const a = new Date(start);
    if (isNaN(a)) return null;
    const nd = parseInt(days) || 0;
    const r = new Date(a);
    r.setDate(r.getDate() + (mode === "add" ? nd : -nd));
    return r;
  }, [start, days, mode]);
  return (
    <VStack>
      <Grid3>
        <div><Label>Start Date</Label><input type="date" value={start} onChange={e => setStart(e.target.value)} style={dateInputStyle} /></div>
        <div><Label>Days</Label><Input value={days} onChange={setDays} /></div>
        <div><Label>Operation</Label><SelectInput value={mode} onChange={setMode} options={[["add","➕ Add days"],["sub","➖ Subtract days"]]} /></div>
      </Grid3>
      {out && <BigResult value={fmtDate(out)} label={`${mode === "add" ? "+" : "−"}${days} days from start`} />}
    </VStack>
  );
}

function DaysUntil() {
  const [target, setTarget] = useState(toISO(new Date(Date.now() + 100 * 86400000)));
  const out = useMemo(() => {
    const t = new Date(target); if (isNaN(t)) return null;
    const today = new Date(toISO(new Date()));
    const diff = Math.round((t - today) / 86400000);
    return { diff, weeks: Math.floor(Math.abs(diff) / 7), rem: Math.abs(diff) % 7 };
  }, [target]);
  return (
    <VStack>
      <div><Label>Target Date</Label><input type="date" value={target} onChange={e => setTarget(e.target.value)} style={dateInputStyle} /></div>
      {out && (
        <>
          <BigResult value={`${Math.abs(out.diff).toLocaleString("en-IN")} days`} label={out.diff >= 0 ? "Remaining Until Target 🎉" : "Passed Since Target"} />
          <Result mono={false}>That's {out.weeks} week{out.weeks !== 1 ? "s" : ""}{out.rem ? ` and ${out.rem} day${out.rem !== 1 ? "s" : ""}` : ""} {out.diff >= 0 ? "to go" : "ago"}.</Result>
        </>
      )}
    </VStack>
  );
}

function CountdownTimer() {
  const [mins, setMins] = useState("5");
  const [secs, setSecs] = useState("0");
  const [left, setLeft] = useState(300);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  const total = () => Math.max(1, (parseInt(mins) || 0) * 60 + (parseInt(secs) || 0));
  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setLeft(l => {
      if (l <= 1) { clearInterval(ref.current); setRunning(false); setDone(true); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  useEffect(() => {
    if (running || done) document.title = done ? "⏰ Time's up! | ToolsRift" : `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")} — Countdown | ToolsRift`;
  }, [left, running, done]);
  const start = () => { if (!running) { if (done || left === 0) setLeft(total()); setDone(false); setRunning(true); } };
  const reset = () => { setRunning(false); setDone(false); setLeft(total()); };
  return (
    <VStack gap={20}>
      <Grid2>
        <div><Label>Minutes</Label><Input value={mins} onChange={v => { setMins(v); if (!running) setLeft((parseInt(v) || 0) * 60 + (parseInt(secs) || 0)); }} /></div>
        <div><Label>Seconds</Label><Input value={secs} onChange={v => { setSecs(v); if (!running) setLeft((parseInt(mins) || 0) * 60 + (parseInt(v) || 0)); }} /></div>
      </Grid2>
      <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(56px,14vw,110px)", fontWeight: 700, color: done ? "#EF4444" : left <= 10 && running ? "#F59E0B" : "#E2E8F0", letterSpacing: "0.02em" }}>
        {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
      </div>
      {done && <div style={{ textAlign: "center", fontSize: 20, color: "#EF4444", fontWeight: 700 }}>⏰ Time's up!</div>}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {!running ? <button onClick={start} style={bigBtn("#22C55E")}>▶ Start</button>
          : <button onClick={() => setRunning(false)} style={bigBtn("#F59E0B")}>⏸ Pause</button>}
        <button onClick={reset} style={bigBtn("rgba(255,255,255,0.1)")}>↺ Reset</button>
      </div>
    </VStack>
  );
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const startRef = useRef(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - elapsed;
    const tick = () => { setElapsed(performance.now() - startRef.current); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]); // eslint-disable-line
  const fmt = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };
  return (
    <VStack gap={20}>
      <div style={{ textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(52px,13vw,100px)", fontWeight: 700, color: "#E2E8F0" }}>{fmt(elapsed)}</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {!running ? <button onClick={() => setRunning(true)} style={bigBtn("#22C55E")}>▶ Start</button>
          : <button onClick={() => setRunning(false)} style={bigBtn("#F59E0B")}>⏸ Pause</button>}
        <button onClick={() => running && setLaps(l => [elapsed, ...l])} disabled={!running} style={{ ...bigBtn("rgba(249,115,22,0.9)"), opacity: running ? 1 : 0.4 }}>⚑ Lap</button>
        <button onClick={() => { setRunning(false); setElapsed(0); setLaps([]); }} style={bigBtn("rgba(255,255,255,0.1)")}>↺ Reset</button>
      </div>
      {laps.length > 0 && <DataTable columns={["Lap", "Time"]} rows={laps.map((t, i) => [laps.length - i, fmt(t)])} />}
    </VStack>
  );
}

function PomodoroTimer() {
  const [focusMin, setFocusMin] = useState("25");
  const [breakMin, setBreakMin] = useState("5");
  const [mode, setMode] = useState("focus");
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => setLeft(l => {
      if (l <= 1) {
        const nextMode = mode === "focus" ? "break" : "focus";
        if (mode === "focus") setCount(c => c + 1);
        setMode(nextMode);
        return (nextMode === "focus" ? parseInt(focusMin) || 25 : parseInt(breakMin) || 5) * 60;
      }
      return l - 1;
    }), 1000);
    return () => clearInterval(ref.current);
  }, [running, mode, focusMin, breakMin]);
  useEffect(() => {
    if (running) document.title = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")} ${mode === "focus" ? "🍅 Focus" : "☕ Break"} | ToolsRift`;
  }, [left, running, mode]);
  const reset = () => { setRunning(false); setMode("focus"); setLeft((parseInt(focusMin) || 25) * 60); };
  return (
    <VStack gap={20}>
      <Grid2>
        <div><Label>Focus (minutes)</Label><Input value={focusMin} onChange={v => { setFocusMin(v); if (!running && mode === "focus") setLeft((parseInt(v) || 25) * 60); }} /></div>
        <div><Label>Break (minutes)</Label><Input value={breakMin} onChange={setBreakMin} /></div>
      </Grid2>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 700, background: mode === "focus" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", color: mode === "focus" ? "#F87171" : "#4ADE80", marginBottom: 8 }}>
          {mode === "focus" ? "🍅 FOCUS SESSION" : "☕ BREAK TIME"}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(56px,14vw,110px)", fontWeight: 700, color: "#E2E8F0" }}>
          {String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>Pomodoros completed today: <b style={{ color: "#E2E8F0" }}>{count}</b> 🍅</div>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {!running ? <button onClick={() => setRunning(true)} style={bigBtn("#22C55E")}>▶ Start</button>
          : <button onClick={() => setRunning(false)} style={bigBtn("#F59E0B")}>⏸ Pause</button>}
        <button onClick={reset} style={bigBtn("rgba(255,255,255,0.1)")}>↺ Reset</button>
      </div>
    </VStack>
  );
}

const TYPING_TEXTS = [
  "The quick brown fox jumps over the lazy dog while the bright sun sets behind the tall green hills of the quiet valley.",
  "Learning to type faster takes regular practice and patience. Keep your fingers on the home row and try not to look down at the keyboard.",
  "Technology has changed the way people work and communicate. Every day millions of messages travel across the world in less than a second.",
  "A good habit is built one small step at a time. Practice for a few minutes every day and you will be surprised by your progress in a month.",
];

function TypingSpeedTest() {
  const [textIdx, setTextIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [startAt, setStartAt] = useState(null);
  const [now, setNow] = useState(0);
  const ref = useRef(null);
  const target = TYPING_TEXTS[textIdx];
  const finished = typed.length >= target.length;
  useEffect(() => {
    if (startAt && !finished) {
      ref.current = setInterval(() => setNow(Date.now()), 200);
      return () => clearInterval(ref.current);
    }
    clearInterval(ref.current);
  }, [startAt, finished]);
  const onType = (v) => {
    if (!startAt && v.length > 0) { setStartAt(Date.now()); setNow(Date.now()); }
    if (v.length <= target.length) setTyped(v);
  };
  const stats = useMemo(() => {
    if (!startAt) return { wpm: 0, acc: 100, sec: 0 };
    const sec = Math.max(0.5, ((finished ? now : Date.now()) - startAt) / 1000);
    let correct = 0;
    for (let i = 0; i < typed.length; i++) if (typed[i] === target[i]) correct++;
    const wpm = Math.round((correct / 5) / (sec / 60));
    const acc = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    return { wpm, acc, sec: Math.round(sec) };
  }, [typed, startAt, now, finished, target]);
  const restart = (nextText) => {
    setTyped(""); setStartAt(null); setNow(0);
    if (nextText) setTextIdx(i => (i + 1) % TYPING_TEXTS.length);
  };
  return (
    <VStack gap={16}>
      <Card>
        <div style={{ fontSize: 16, lineHeight: 1.9, fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.01em" }}>
          {target.split("").map((ch, i) => (
            <span key={i} style={{
              color: i < typed.length ? (typed[i] === ch ? "#4ADE80" : "#F87171") : "#64748B",
              background: i === typed.length ? "rgba(249,115,22,0.35)" : (i < typed.length && typed[i] !== ch ? "rgba(239,68,68,0.15)" : "transparent"),
              borderRadius: 2,
            }}>{ch}</span>
          ))}
        </div>
      </Card>
      <Textarea value={typed} onChange={onType} rows={3} placeholder="Start typing here — the timer starts on your first keystroke..." mono />
      <Grid3>
        <BigResult value={stats.wpm} label="WPM" />
        <BigResult value={`${stats.acc}%`} label="Accuracy" />
        <BigResult value={`${stats.sec}s`} label="Time" />
      </Grid3>
      {finished && <Result mono={false}>🎉 Done! You typed at <b>{stats.wpm} WPM</b> with <b>{stats.acc}%</b> accuracy. Average is ~40 WPM — try again to beat your score!</Result>}
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => restart(false)} style={bigBtn("rgba(255,255,255,0.1)")}>↺ Restart</button>
        <button onClick={() => restart(true)} style={bigBtn("rgba(249,115,22,0.9)")}>📄 New Text</button>
      </div>
    </VStack>
  );
}

const secureRandom = (max) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
};

function RandomNamePicker() {
  const [names, setNames] = useState("Aarav\nDiya\nRahul\nSneha\nVikram\nPriya");
  const [winner, setWinner] = useState(null);
  const [remove, setRemove] = useState("no");
  const [picking, setPicking] = useState(false);
  const list = names.split("\n").map(s => s.trim()).filter(Boolean);
  const pick = () => {
    if (list.length === 0 || picking) return;
    setPicking(true);
    let i = 0;
    const spin = setInterval(() => {
      setWinner(list[secureRandom(list.length)]);
      if (++i >= 12) {
        clearInterval(spin);
        const w = list[secureRandom(list.length)];
        setWinner(w); setPicking(false);
        if (remove === "yes") setNames(list.filter(x => x !== w).join("\n"));
      }
    }, 90);
  };
  return (
    <VStack>
      <div><Label>Names (one per line) — {list.length} entries</Label><Textarea value={names} onChange={setNames} rows={7} /></div>
      <Grid2>
        <div><Label>After Picking</Label><SelectInput value={remove} onChange={setRemove} options={[["no","Keep winner in list"],["yes","Remove winner from list"]]} /></div>
        <div style={{ display: "flex", alignItems: "flex-end" }}><button onClick={pick} style={{ ...bigBtn("#22C55E"), width: "100%" }} disabled={picking}>🎯 Pick a Winner</button></div>
      </Grid2>
      {winner && (
        <div style={{ textAlign: "center", padding: "28px 20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 14 }}>
          <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{picking ? "Picking..." : "🎉 Winner"}</div>
          <div style={{ fontSize: "clamp(26px,6vw,40px)", fontWeight: 800, fontFamily: "'Sora',sans-serif", color: "#4ADE80" }}>{winner}</div>
        </div>
      )}
    </VStack>
  );
}

function DiceRoller() {
  const [count, setCount] = useState("2");
  const [sides, setSides] = useState("6");
  const [rolls, setRolls] = useState([]);
  const roll = () => {
    const nDice = Math.min(6, Math.max(1, parseInt(count) || 1));
    const s = parseInt(sides) || 6;
    setRolls(Array.from({ length: nDice }, () => 1 + secureRandom(s)));
  };
  const faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <VStack gap={18}>
      <Grid2>
        <div><Label>Number of Dice (1–6)</Label><Input value={count} onChange={setCount} /></div>
        <div><Label>Sides per Die</Label><SelectInput value={sides} onChange={setSides} options={[["4","D4"],["6","D6 (standard)"],["8","D8"],["10","D10"],["12","D12"],["20","D20"]]} /></div>
      </Grid2>
      <button onClick={roll} style={{ ...bigBtn("#22C55E"), alignSelf: "center" }}>🎲 Roll Dice</button>
      {rolls.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {rolls.map((r, i) => (
              <div key={i} style={{ width: 76, height: 76, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: sides === "6" ? 46 : 30, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: "#E2E8F0" }}>
                {sides === "6" ? faces[r] : r}
              </div>
            ))}
          </div>
          <BigResult value={rolls.reduce((a, b) => a + b, 0)} label="Total" />
        </>
      )}
    </VStack>
  );
}

function CoinFlip() {
  const [history, setHistory] = useState([]);
  const [flipping, setFlipping] = useState(false);
  const [face, setFace] = useState(null);
  const flip = () => {
    if (flipping) return;
    setFlipping(true);
    let i = 0;
    const spin = setInterval(() => {
      setFace(secureRandom(2) ? "Heads" : "Tails");
      if (++i >= 10) {
        clearInterval(spin);
        const result = secureRandom(2) ? "Heads" : "Tails";
        setFace(result); setFlipping(false);
        setHistory(h => [result, ...h].slice(0, 20));
      }
    }, 80);
  };
  const heads = history.filter(h => h === "Heads").length;
  return (
    <VStack gap={18}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 140, height: 140, margin: "0 auto 14px", borderRadius: "50%", background: face === "Heads" ? "linear-gradient(135deg,#F59E0B,#D97706)" : face === "Tails" ? "linear-gradient(135deg,#94A3B8,#64748B)" : "rgba(255,255,255,0.06)", border: "3px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, transition: "background .15s" }}>
          {face ? (face === "Heads" ? "👑" : "🪙") : "?"}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: "#E2E8F0", minHeight: 36 }}>{flipping ? "Flipping..." : face || "Flip to start"}</div>
      </div>
      <button onClick={flip} style={{ ...bigBtn("#22C55E"), alignSelf: "center" }} disabled={flipping}>🪙 Flip Coin</button>
      {history.length > 0 && (
        <>
          <Grid2>
            <StatBox value={heads} label="Heads 👑" />
            <StatBox value={history.length - heads} label="Tails 🪙" />
          </Grid2>
          <Result mono={false}>Recent: {history.slice(0, 12).join(" · ")}</Result>
        </>
      )}
    </VStack>
  );
}

function Scoreboard() {
  const [nameA, setNameA] = useState("Team A");
  const [nameB, setNameB] = useState("Team B");
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const Side = ({ name, setName, score, setScore, color }) => (
    <div style={{ textAlign: "center", padding: "24px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${color}40`, borderRadius: 16 }}>
      <input value={name} onChange={e => setName(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", color, fontSize: 18, fontWeight: 800, fontFamily: "'Sora',sans-serif", textAlign: "center", width: "100%", marginBottom: 8 }} />
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(56px,12vw,96px)", fontWeight: 700, color: "#E2E8F0", lineHeight: 1 }}>{score}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
        <button onClick={() => setScore(s => s + 1)} style={{ ...bigBtn(color), padding: "10px 22px" }}>+1</button>
        <button onClick={() => setScore(s => Math.max(0, s - 1))} style={{ ...bigBtn("rgba(255,255,255,0.1)"), padding: "10px 22px" }}>−1</button>
      </div>
    </div>
  );
  return (
    <VStack gap={18}>
      <Grid2>
        <Side name={nameA} setName={setNameA} score={a} setScore={setA} color="#22C55E" />
        <Side name={nameB} setName={setNameB} score={b} setScore={setB} color="#6366F1" />
      </Grid2>
      <div style={{ textAlign: "center", fontSize: 15, color: "#94A3B8", fontWeight: 600 }}>
        {a === b ? "🤝 It's a tie!" : `🏆 ${a > b ? nameA : nameB} leads by ${Math.abs(a - b)}`}
      </div>
      <button onClick={() => { setA(0); setB(0); }} style={{ ...bigBtn("rgba(255,255,255,0.1)"), alignSelf: "center" }}>↺ Reset Scores</button>
    </VStack>
  );
}

// ── world clock helpers ──────────────────────────────────────────────────────
const WORLD_CITIES = [
  { name: "Los Angeles", tz: "America/Los_Angeles" },
  { name: "New York", tz: "America/New_York" },
  { name: "London", tz: "Europe/London" },
  { name: "Paris", tz: "Europe/Paris" },
  { name: "Dubai", tz: "Asia/Dubai" },
  { name: "India (Kolkata)", tz: "Asia/Kolkata" },
  { name: "Singapore", tz: "Asia/Singapore" },
  { name: "Tokyo", tz: "Asia/Tokyo" },
  { name: "Sydney", tz: "Australia/Sydney" },
];
const fmtZonedTime = (date, tz) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
const fmtZonedDate = (date, tz) => new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).format(date);
const tzOffsetLabel = (date, tz) => {
  try {
    const part = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(date).find(p => p.type === "timeZoneName");
    return part ? part.value.replace("GMT", "UTC") : "";
  } catch { return ""; }
};
// Convert a wall-clock time in a given IANA zone to a real UTC timestamp.
const zonedWallTimeToUTC = (y, mo, d, h, mi, tz) => {
  const guess = Date.UTC(y, mo, d, h, mi);
  const asUTC = new Date(new Date(guess).toLocaleString("en-US", { timeZone: "UTC" }));
  const asTZ = new Date(new Date(guess).toLocaleString("en-US", { timeZone: tz }));
  const offset = asTZ.getTime() - asUTC.getTime();
  return guess - offset;
};

function WorldClock() {
  const localTz = useMemo(() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; } }, []);
  const cities = useMemo(() => {
    const list = [...WORLD_CITIES];
    if (localTz && !list.some(c => c.tz === localTz)) list.unshift({ name: `Your Time (${localTz.split("/").pop().replace(/_/g, " ")})`, tz: localTz, local: true });
    else list.unshift({ name: "Your Time", tz: localTz, local: true });
    return list;
  }, [localTz]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const nowDate = new Date(now);

  // converter state
  const [srcTz, setSrcTz] = useState(localTz || "America/New_York");
  const pad = (n) => String(n).padStart(2, "0");
  const [convTime, setConvTime] = useState(`${pad(nowDate.getHours())}:${pad(nowDate.getMinutes())}`);
  const converted = useMemo(() => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(convTime.trim());
    if (!m) return null;
    const h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
    if (h > 23 || mi > 59) return null;
    const base = new Date();
    const ts = zonedWallTimeToUTC(base.getFullYear(), base.getMonth(), base.getDate(), h, mi, srcTz);
    return new Date(ts);
  }, [convTime, srcTz]);

  const cityOptions = cities.map(c => [c.tz, c.name]);

  return (
    <VStack gap={20}>
      <div>
        <Label>Current Time Around the World</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {cities.map((c) => (
            <div key={c.tz + c.name} style={{ background: c.local ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${c.local ? "rgba(249,115,22,0.3)" : C.border}`, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{c.name}</span>
                <span style={{ fontSize: 10, color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>{tzOffsetLabel(nowDate, c.tz)}</span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 700, color: c.local ? C.indigo : C.text, letterSpacing: "0.02em" }}>{fmtZonedTime(nowDate, c.tz)}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{fmtZonedDate(nowDate, c.tz)}</div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <Label>Time Zone Converter</Label>
        <Grid2>
          <div><Label>Time</Label><input type="time" value={convTime} onChange={e => setConvTime(e.target.value)} style={dateInputStyle} /></div>
          <div><Label>Source City</Label><SelectInput value={srcTz} onChange={setSrcTz} options={cityOptions} /></div>
        </Grid2>
        {converted ? (
          <div style={{ marginTop: 14 }}>
            <DataTable
              columns={["City", "Local Time", "Date", "Offset"]}
              rows={cities.map(c => [c.name, fmtZonedTime(converted, c.tz), fmtZonedDate(converted, c.tz), tzOffsetLabel(converted, c.tz)])}
            />
          </div>
        ) : <div style={{ marginTop: 14 }}><Result mono={false}>Enter a valid time (HH:MM) to convert across time zones.</Result></div>}
      </Card>
    </VStack>
  );
}

// ── extra everyday helpers (verified in Node) ────────────────────────────────
const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const WEEKDAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function isoWeekOf(y, mo, d) { // mo 0-based
  const dt = new Date(Date.UTC(y, mo, d));
  const dayNum = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThu.getUTCDay() + 6) % 7;
  firstThu.setUTCDate(firstThu.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((dt - firstThu) / (7 * 86400000));
  return { week, year: dt.getUTCFullYear() };
}
function zellerDay(y, m, d) { // m 1-12 → weekday name
  if (m < 3) { m += 12; y -= 1; }
  const K = y % 100, J = Math.floor(y / 100);
  const h = (d + Math.floor(13 * (m + 1) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) + 5 * J) % 7;
  return ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"][h];
}
function easterOf(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day }; // month 3=March, 4=April
}
const SYNODIC = 29.530588853;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
function moonInfo(ts) {
  let age = (ts - REF_NEW_MOON) / 86400000 % SYNODIC;
  if (age < 0) age += SYNODIC;
  const phaseFrac = age / SYNODIC;
  const idx = Math.floor(phaseFrac * 8 + 0.5) % 8;
  const names = ["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"];
  const emojis = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];
  const illum = Math.round((1 - Math.cos(2 * Math.PI * phaseFrac)) / 2 * 100);
  return { age, name: names[idx], emoji: emojis[idx], illum };
}
const ZSIGNS = [
  [19,"Capricorn","♑","Earth"],[18,"Aquarius","♒","Air"],[20,"Pisces","♓","Water"],
  [19,"Aries","♈","Fire"],[20,"Taurus","♉","Earth"],[20,"Gemini","♊","Air"],
  [22,"Cancer","♋","Water"],[22,"Leo","♌","Fire"],[22,"Virgo","♍","Earth"],
  [22,"Libra","♎","Air"],[21,"Scorpio","♏","Water"],[21,"Sagittarius","♐","Fire"]
];
function westernZodiac(m, d) { // m 1-12
  const [cut, name, sym, elem] = ZSIGNS[m - 1];
  if (d <= cut) return { name, sym, elem };
  const nx = ZSIGNS[m % 12];
  return { name: nx[1], sym: nx[2], elem: nx[3] };
}
const CHINESE_ZODIAC = [
  ["Rat","🐀","Quick-witted, resourceful, versatile"],
  ["Ox","🐂","Diligent, dependable, determined"],
  ["Tiger","🐅","Brave, confident, competitive"],
  ["Rabbit","🐇","Gentle, elegant, kind"],
  ["Dragon","🐉","Confident, ambitious, charismatic"],
  ["Snake","🐍","Wise, intuitive, graceful"],
  ["Horse","🐎","Energetic, independent, warm-hearted"],
  ["Goat","🐐","Calm, gentle, creative"],
  ["Monkey","🐒","Clever, curious, playful"],
  ["Rooster","🐓","Observant, hardworking, courageous"],
  ["Dog","🐕","Loyal, honest, friendly"],
  ["Pig","🐖","Generous, diligent, easy-going"],
];
const GENERATIONS = [
  ["The Greatest Generation", 1901, 1927],
  ["The Silent Generation", 1928, 1945],
  ["Baby Boomers", 1946, 1964],
  ["Generation X", 1965, 1980],
  ["Millennials (Gen Y)", 1981, 1996],
  ["Generation Z", 1997, 2012],
  ["Generation Alpha", 2013, 2024],
  ["Generation Beta", 2025, 2039],
];

function LeapYearChecker() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const out = useMemo(() => {
    const y = parseInt(year, 10);
    if (!Number.isFinite(y) || String(year).trim() === "") return null;
    const leap = isLeapYear(y);
    let nextLeap = y + 1; while (!isLeapYear(nextLeap)) nextLeap++;
    let prevLeap = y - 1; while (!isLeapYear(prevLeap)) prevLeap--;
    return { y, leap, nextLeap, prevLeap };
  }, [year]);
  const copyText = out ? `${out.y} is ${out.leap ? "a leap year (366 days)" : "not a leap year (365 days)"}. Previous leap year: ${out.prevLeap}. Next leap year: ${out.nextLeap}.` : "";
  return (
    <VStack>
      <div><Label>Year</Label><Input value={year} onChange={setYear} placeholder="e.g. 2024" /></div>
      {out ? (
        <>
          <BigResult value={out.leap ? "✅ Leap Year" : "❌ Common Year"} label={`${out.y} has ${out.leap ? 366 : 365} days`} />
          <Grid2>
            <StatBox value={out.prevLeap} label="Previous Leap Year" />
            <StatBox value={out.nextLeap} label="Next Leap Year" />
          </Grid2>
          <Result mono={false}>{out.leap
            ? `${out.y} is divisible by 4${out.y % 100 === 0 ? " and by 400" : (out.y % 100 !== 0 ? " and is not a century year" : "")}, so February has 29 days.`
            : `${out.y} is ${out.y % 4 !== 0 ? "not divisible by 4" : "a century year not divisible by 400"}, so February has 28 days.`}</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Enter a valid year to check.</Result>}
    </VStack>
  );
}

function IsoWeekNumber() {
  const [date, setDate] = useState(toISO(new Date()));
  const out = useMemo(() => {
    const dt = new Date(date); if (isNaN(dt)) return null;
    const y = dt.getFullYear(), mo = dt.getMonth(), d = dt.getDate();
    const { week, year } = isoWeekOf(y, mo, d);
    const startOfYear = new Date(Date.UTC(y, 0, 0));
    const dayOfYear = Math.floor((Date.UTC(y, mo, d) - startOfYear) / 86400000);
    return { week, year, dayOfYear, weekday: WEEKDAY_NAMES[dt.getDay()], remaining: (isLeapYear(y) ? 366 : 365) - dayOfYear };
  }, [date]);
  const copyText = out ? `ISO week ${out.week} of ${out.year}. Day ${out.dayOfYear} of the year.` : "";
  return (
    <VStack>
      <div><Label>Date</Label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={dateInputStyle} /></div>
      {out ? (
        <>
          <BigResult value={`Week ${out.week}`} label={`ISO week-year ${out.year}`} />
          <Grid3>
            <StatBox value={out.dayOfYear} label="Day of Year" />
            <StatBox value={out.remaining} label="Days Left in Year" />
            <StatBox value={out.weekday} label="Weekday" />
          </Grid3>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid date.</Result>}
    </VStack>
  );
}

function DayOfWeekFinder() {
  const [date, setDate] = useState(toISO(new Date()));
  const out = useMemo(() => {
    const dt = new Date(date); if (isNaN(dt)) return null;
    const y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate();
    const weekday = zellerDay(y, m, d);
    const isWeekend = weekday === "Saturday" || weekday === "Sunday";
    return { weekday, isWeekend, pretty: `${MONTH_NAMES[m - 1]} ${d}, ${y}` };
  }, [date]);
  const copyText = out ? `${out.pretty} falls on a ${out.weekday}.` : "";
  return (
    <VStack>
      <div><Label>Date (any year)</Label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={dateInputStyle} /></div>
      {out ? (
        <>
          <BigResult value={out.weekday} label={out.pretty} />
          <Result mono={false}>{out.isWeekend ? "🛌 It's a weekend day." : "💼 It's a weekday."} Computed with Zeller's congruence — works for any year.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid date.</Result>}
    </VStack>
  );
}

function MoonPhase() {
  const [date, setDate] = useState(toISO(new Date()));
  const out = useMemo(() => {
    const dt = new Date(date); if (isNaN(dt)) return null;
    const noon = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12, 0);
    const info = moonInfo(noon);
    return { ...info, pretty: `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}` };
  }, [date]);
  const copyText = out ? `Moon on ${out.pretty}: ${out.name} (${out.illum}% illuminated, ${out.age.toFixed(1)} days old).` : "";
  return (
    <VStack>
      <div><Label>Date</Label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={dateInputStyle} /></div>
      {out ? (
        <>
          <div style={{ textAlign: "center", padding: "18px 16px", background: "rgba(249,115,22,0.08)", border: `1px solid rgba(249,115,22,0.2)`, borderRadius: 10 }}>
            <div style={{ fontSize: 64, lineHeight: 1 }}>{out.emoji}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: C.indigo, marginTop: 8 }}>{out.name}</div>
            <div style={{ ...T.label, marginTop: 4 }}>{out.pretty}</div>
          </div>
          <Grid2>
            <StatBox value={`${out.illum}%`} label="Illumination" />
            <StatBox value={`${out.age.toFixed(1)} d`} label="Lunar Age" />
          </Grid2>
          <Result mono={false}>Approximation from the average 29.53-day synodic month — accurate to within about a day.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid date.</Result>}
    </VStack>
  );
}

function BusinessDaysBetween() {
  const [start, setStart] = useState(toISO(new Date()));
  const [end, setEnd] = useState(toISO(new Date(Date.now() + 30 * 86400000)));
  const out = useMemo(() => {
    let a = new Date(start), b = new Date(end);
    if (isNaN(a) || isNaN(b)) return null;
    let sa = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    let sb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    if (sa > sb) [sa, sb] = [sb, sa];
    const total = Math.round((sb - sa) / 86400000) + 1;
    const fullWeeks = Math.floor(total / 7);
    let bd = fullWeeks * 5;
    const rem = total % 7;
    const sd = new Date(sa).getUTCDay();
    for (let i = 0; i < rem; i++) { const dow = (sd + i) % 7; if (dow !== 0 && dow !== 6) bd++; }
    return { total, bd, weekends: total - bd };
  }, [start, end]);
  const copyText = out ? `${out.bd} business days (and ${out.weekends} weekend days) across ${out.total} calendar days.` : "";
  return (
    <VStack>
      <Grid2>
        <div><Label>Start Date</Label><input type="date" value={start} onChange={e => setStart(e.target.value)} style={dateInputStyle} /></div>
        <div><Label>End Date</Label><input type="date" value={end} onChange={e => setEnd(e.target.value)} style={dateInputStyle} /></div>
      </Grid2>
      {out ? (
        <>
          <BigResult value={out.bd.toLocaleString("en-IN")} label="Business Days (Mon–Fri)" />
          <Grid2>
            <StatBox value={out.total.toLocaleString("en-IN")} label="Total Calendar Days" />
            <StatBox value={out.weekends.toLocaleString("en-IN")} label="Weekend Days" />
          </Grid2>
          <Result mono={false}>Both start and end dates are included. Public holidays are not deducted.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick valid start and end dates.</Result>}
    </VStack>
  );
}

function DaysInMonth() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const out = useMemo(() => {
    const m = parseInt(month, 10), y = parseInt(year, 10);
    if (!(m >= 1 && m <= 12) || !Number.isFinite(y)) return null;
    const days = new Date(y, m, 0).getDate();
    const firstDay = zellerDay(y, m, 1);
    const lastDay = zellerDay(y, m, days);
    return { days, name: MONTH_NAMES[m - 1], firstDay, lastDay, y };
  }, [month, year]);
  const monthOpts = MONTH_NAMES.map((n, i) => [String(i + 1), n]);
  const copyText = out ? `${out.name} ${out.y} has ${out.days} days.` : "";
  return (
    <VStack>
      <Grid2>
        <div><Label>Month</Label><SelectInput value={month} onChange={setMonth} options={monthOpts} /></div>
        <div><Label>Year</Label><Input value={year} onChange={setYear} placeholder="e.g. 2024" /></div>
      </Grid2>
      {out ? (
        <>
          <BigResult value={out.days} label={`Days in ${out.name} ${out.y}`} />
          <Grid2>
            <StatBox value={out.firstDay} label="Starts On" />
            <StatBox value={out.lastDay} label="Ends On" />
          </Grid2>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Choose a month and valid year.</Result>}
    </VStack>
  );
}

function EasterDate() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const out = useMemo(() => {
    const y = parseInt(year, 10);
    if (!Number.isFinite(y) || y < 1583) return null;
    const { month, day } = easterOf(y);
    const weekday = zellerDay(y, month, day); // always Sunday, shown for confidence
    const goodFri = new Date(Date.UTC(y, month - 1, day - 2));
    const ash = new Date(Date.UTC(y, month - 1, day - 46));
    return {
      pretty: `${MONTH_NAMES[month - 1]} ${day}, ${y}`, weekday,
      goodFriday: `${MONTH_NAMES[goodFri.getUTCMonth()]} ${goodFri.getUTCDate()}`,
      ashWed: `${MONTH_NAMES[ash.getUTCMonth()]} ${ash.getUTCDate()}`,
    };
  }, [year]);
  const copyText = out ? `Easter Sunday ${year} falls on ${out.pretty}.` : "";
  return (
    <VStack>
      <div><Label>Year (1583 or later)</Label><Input value={year} onChange={setYear} placeholder="e.g. 2025" /></div>
      {out ? (
        <>
          <BigResult value={out.pretty} label={`Easter Sunday (${out.weekday})`} />
          <Grid2>
            <StatBox value={out.goodFriday} label="Good Friday" />
            <StatBox value={out.ashWed} label="Ash Wednesday" />
          </Grid2>
          <Result mono={false}>Western (Gregorian) Easter, computed with the Anonymous Gregorian Computus. It can fall between March 22 and April 25.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Enter a valid year (Gregorian calendar, 1583 onward).</Result>}
    </VStack>
  );
}

function UnixTimestampConverter() {
  const [mode, setMode] = useState("toDate");
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateStr, setDateStr] = useState(toISO(new Date()));
  const toDateOut = useMemo(() => {
    if (mode !== "toDate") return null;
    const raw = ts.trim(); if (!/^\d+$/.test(raw)) return null;
    const n = Number(raw);
    const ms = raw.length > 10 ? n : n * 1000; // heuristic: >10 digits => ms
    const dt = new Date(ms);
    if (isNaN(dt)) return null;
    return {
      utc: dt.toUTCString(),
      local: dt.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" }),
      iso: dt.toISOString(),
      unit: raw.length > 10 ? "milliseconds" : "seconds",
    };
  }, [mode, ts]);
  const toTsOut = useMemo(() => {
    if (mode !== "toTs") return null;
    const dt = new Date(dateStr); if (isNaN(dt)) return null;
    const secs = Math.floor(dt.getTime() / 1000);
    return { secs, ms: dt.getTime() };
  }, [mode, dateStr]);
  return (
    <VStack>
      <div><Label>Direction</Label><SelectInput value={mode} onChange={setMode} options={[["toDate","Timestamp → Date"],["toTs","Date → Timestamp"]]} /></div>
      {mode === "toDate" ? (
        <>
          <div><Label>Unix Timestamp (seconds or ms)</Label><Input value={ts} onChange={setTs} placeholder="e.g. 1700000000" /></div>
          {toDateOut ? (
            <>
              <Result mono={false}>Detected unit: <b>{toDateOut.unit}</b></Result>
              <Grid2>
                <div><Label>UTC</Label><Result>{toDateOut.utc}</Result></div>
                <div><Label>Local Time</Label><Result mono={false}>{toDateOut.local}</Result></div>
              </Grid2>
              <div><Label>ISO 8601</Label><Result>{toDateOut.iso}</Result></div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={toDateOut.iso} /></div>
            </>
          ) : <Result mono={false}>Enter a whole-number timestamp.</Result>}
        </>
      ) : (
        <>
          <div><Label>Date & Time</Label><input type="datetime-local" value={dateStr.length <= 10 ? dateStr + "T00:00" : dateStr} onChange={e => setDateStr(e.target.value)} style={dateInputStyle} /></div>
          {toTsOut ? (
            <>
              <Grid2>
                <BigResult value={toTsOut.secs.toLocaleString("en-US")} label="Seconds" />
                <BigResult value={toTsOut.ms.toLocaleString("en-US")} label="Milliseconds" />
              </Grid2>
              <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={String(toTsOut.secs)} /></div>
            </>
          ) : <Result mono={false}>Pick a valid date and time.</Result>}
        </>
      )}
    </VStack>
  );
}

function WeekdayCounter() {
  const [start, setStart] = useState(toISO(new Date()));
  const [end, setEnd] = useState(toISO(new Date(Date.now() + 90 * 86400000)));
  const out = useMemo(() => {
    const a = new Date(start), b = new Date(end);
    if (isNaN(a) || isNaN(b)) return null;
    let sa = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    let sb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    if (sa > sb) [sa, sb] = [sb, sa];
    const total = Math.round((sb - sa) / 86400000) + 1;
    if (total > 200000) return null; // guard absurd ranges
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const startDow = new Date(sa).getUTCDay();
    const fullWeeks = Math.floor(total / 7);
    for (let i = 0; i < 7; i++) counts[i] = fullWeeks;
    const rem = total % 7;
    for (let i = 0; i < rem; i++) counts[(startDow + i) % 7]++;
    return { counts, total };
  }, [start, end]);
  const copyText = out ? WEEKDAY_NAMES.map((n, i) => `${n}: ${out.counts[i]}`).join(", ") : "";
  return (
    <VStack>
      <Grid2>
        <div><Label>Start Date</Label><input type="date" value={start} onChange={e => setStart(e.target.value)} style={dateInputStyle} /></div>
        <div><Label>End Date</Label><input type="date" value={end} onChange={e => setEnd(e.target.value)} style={dateInputStyle} /></div>
      </Grid2>
      {out ? (
        <>
          <DataTable columns={["Weekday", "Count"]} rows={WEEKDAY_NAMES.map((n, i) => [n, out.counts[i]])} />
          <Result mono={false}>{out.total.toLocaleString("en-IN")} total days (both endpoints included).</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid date range.</Result>}
    </VStack>
  );
}

function HalfBirthday() {
  const [dob, setDob] = useState("2000-01-15");
  const out = useMemo(() => {
    const dt = new Date(dob); if (isNaN(dt)) return null;
    const y = dt.getFullYear(), mo = dt.getMonth(), d = dt.getDate();
    const half = new Date(Date.UTC(y, mo + 6, d));
    const pretty = `${WEEKDAY_NAMES[half.getUTCDay()]}, ${MONTH_NAMES[half.getUTCMonth()]} ${half.getUTCDate()}`;
    // days until next half birthday from today
    const today = new Date(); const ty = today.getFullYear();
    let next = new Date(Date.UTC(ty, half.getUTCMonth(), half.getUTCDate()));
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    if (next < todayUTC) next = new Date(Date.UTC(ty + 1, half.getUTCMonth(), half.getUTCDate()));
    const daysUntil = Math.round((next - todayUTC) / 86400000);
    return { pretty, daysUntil };
  }, [dob]);
  const copyText = out ? `Half birthday: ${out.pretty}.` : "";
  return (
    <VStack>
      <div><Label>Date of Birth</Label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={dateInputStyle} /></div>
      {out ? (
        <>
          <BigResult value={out.pretty} label="🎉 Your Half Birthday" />
          <StatBox value={`${out.daysUntil} days`} label="Until Your Next Half Birthday" />
          <Result mono={false}>Exactly six calendar months from your birthday.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid date of birth.</Result>}
    </VStack>
  );
}

function ZodiacSign() {
  const [dob, setDob] = useState("2000-07-23");
  const out = useMemo(() => {
    const dt = new Date(dob); if (isNaN(dt)) return null;
    const m = dt.getMonth() + 1, d = dt.getDate();
    const z = westernZodiac(m, d);
    return { ...z, pretty: `${MONTH_NAMES[m - 1]} ${d}` };
  }, [dob]);
  const copyText = out ? `${out.pretty} → ${out.name} ${out.sym} (${out.elem} sign).` : "";
  return (
    <VStack>
      <div><Label>Birthday</Label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={dateInputStyle} /></div>
      {out ? (
        <>
          <div style={{ textAlign: "center", padding: "20px 16px", background: "rgba(249,115,22,0.08)", border: `1px solid rgba(249,115,22,0.2)`, borderRadius: 10 }}>
            <div style={{ fontSize: 56, lineHeight: 1 }}>{out.sym}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 700, color: C.indigo, marginTop: 6 }}>{out.name}</div>
            <div style={{ ...T.label, marginTop: 4 }}>{out.elem} element · {out.pretty}</div>
          </div>
          <Result mono={false}>Based on the standard tropical zodiac date ranges. Cusp dates near a sign boundary can vary by a day between years.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid birthday.</Result>}
    </VStack>
  );
}

function ChineseZodiac() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const out = useMemo(() => {
    const y = parseInt(year, 10);
    if (!Number.isFinite(y)) return null;
    const idx = ((y - 4) % 12 + 12) % 12;
    const [animal, emoji, traits] = CHINESE_ZODIAC[idx];
    const years = [y - 12, y, y + 12];
    return { animal, emoji, traits, years };
  }, [year]);
  const copyText = out ? `Year ${year}: ${out.animal} ${out.emoji}. ${out.traits}.` : "";
  return (
    <VStack>
      <div><Label>Birth Year</Label><Input value={year} onChange={setYear} placeholder="e.g. 1996" /></div>
      {out ? (
        <>
          <div style={{ textAlign: "center", padding: "20px 16px", background: "rgba(249,115,22,0.08)", border: `1px solid rgba(249,115,22,0.2)`, borderRadius: 10 }}>
            <div style={{ fontSize: 56, lineHeight: 1 }}>{out.emoji}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 700, color: C.indigo, marginTop: 6 }}>Year of the {out.animal}</div>
            <div style={{ ...T.label, marginTop: 4 }}>{out.traits}</div>
          </div>
          <StatBox value={out.years.join(" · ")} label="Recurring Years" />
          <Result mono={false}>Uses the Gregorian birth year. As Chinese New Year falls in late Jan–Feb, people born then may belong to the previous animal's year.</Result>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Enter a valid year.</Result>}
    </VStack>
  );
}

function GenerationFinder() {
  const [year, setYear] = useState("1995");
  const out = useMemo(() => {
    const y = parseInt(year, 10);
    if (!Number.isFinite(y)) return null;
    const g = GENERATIONS.find(([, a, b]) => y >= a && y <= b);
    if (!g) return { none: true, y };
    return { name: g[0], range: `${g[1]}–${g[2]}`, y };
  }, [year]);
  const copyText = out && !out.none ? `Born ${out.y}: ${out.name} (${out.range}).` : "";
  return (
    <VStack>
      <div><Label>Birth Year</Label><Input value={year} onChange={setYear} placeholder="e.g. 1990" /></div>
      {out ? (
        out.none ? (
          <Result mono={false}>No named generation covers {out.y}. Common labels span 1901 (Greatest Generation) to 2039 (Generation Beta).</Result>
        ) : (
          <>
            <BigResult value={out.name} label={`Born ${out.range}`} />
            <Result mono={false}>Generation ranges are widely-used conventions (Pew Research / popular usage) and vary by a year or two between sources.</Result>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
          </>
        )
      ) : <Result mono={false}>Enter a valid birth year.</Result>}
    </VStack>
  );
}

function NextFriday13() {
  const [from, setFrom] = useState(toISO(new Date()));
  const out = useMemo(() => {
    const dt = new Date(from); if (isNaN(dt)) return null;
    const fromUTC = Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const results = [];
    let y = dt.getFullYear(), m = dt.getMonth();
    for (let i = 0; i < 240 && results.length < 6; i++) {
      const cand = new Date(Date.UTC(y, m, 13));
      if (cand.getTime() >= fromUTC && cand.getUTCDay() === 5) {
        const days = Math.round((cand - fromUTC) / 86400000);
        results.push({ pretty: `${WEEKDAY_NAMES[5]}, ${MONTH_NAMES[m]} 13, ${y}`, days });
      }
      m++; if (m > 11) { m = 0; y++; }
    }
    return results;
  }, [from]);
  const copyText = out && out.length ? out.map(r => `${r.pretty} (${r.days} days)`).join("\n") : "";
  return (
    <VStack>
      <div><Label>Search From Date</Label><input type="date" value={from} onChange={e => setFrom(e.target.value)} style={dateInputStyle} /></div>
      {out && out.length > 0 ? (
        <>
          <BigResult value={`${out[0].days} days`} label={`Next: ${out[0].pretty} 😱`} />
          <div><Label>Upcoming Friday the 13ths</Label>
            <DataTable columns={["Date", "Days Away"]} rows={out.map(r => [r.pretty, r.days])} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      ) : <Result mono={false}>Pick a valid date to search from.</Result>}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "age-calculator": AgeCalculator,
  "leap-year-checker": LeapYearChecker,
  "iso-week-number": IsoWeekNumber,
  "day-of-week-finder": DayOfWeekFinder,
  "moon-phase": MoonPhase,
  "business-days-between": BusinessDaysBetween,
  "days-in-month": DaysInMonth,
  "easter-date": EasterDate,
  "unix-timestamp-converter": UnixTimestampConverter,
  "weekday-counter": WeekdayCounter,
  "half-birthday": HalfBirthday,
  "zodiac-sign": ZodiacSign,
  "chinese-zodiac": ChineseZodiac,
  "generation-finder": GenerationFinder,
  "next-friday-13": NextFriday13,
  "date-difference": DateDifference,
  "add-subtract-days": AddSubtractDays,
  "days-until": DaysUntil,
  "world-clock": WorldClock,
  "countdown-timer": CountdownTimer,
  "stopwatch": Stopwatch,
  "pomodoro-timer": PomodoroTimer,
  "typing-speed-test": TypingSpeedTest,
  "random-name-picker": RandomNamePicker,
  "dice-roller": DiceRoller,
  "coin-flip": CoinFlip,
  "scoreboard": Scoreboard,
};

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
    document.title = `${cat?.name || 'Category'} – Everyday Tools | ToolsRift`;
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
    document.title = "Free Everyday Tools – Age Calculator, Timers, Typing Test Online | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search everyday tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(249,115,22,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.indigo, textDecoration:"none" }}>{THEME?.name||"Everyday Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(249,115,22,0.12)", color:C.indigo, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(249,115,22,0.25)" }}>{TOOLS.length} tools</span>
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
        <a href="/" style={{fontSize:12,color:"#F97316",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftEveryday() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="everyday"/>}
    </div>
  );
}

export default ToolsRiftEveryday;
