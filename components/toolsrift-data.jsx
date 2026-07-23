import { useState, useEffect, useRef, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout from './shared/ToolPageLayout';

const THEME = getCategoryById("data");
const PAGE_THEME = getCategoryById("data");
const BRAND = { name: "ToolsRift", tagline: "Charts & Data Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  accent: "#2DD4BF", accentD: "#0D9488",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(45,212,191,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} @keyframes trShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-6px,4px) rotate(-4deg)}40%{transform:translate(6px,-4px) rotate(4deg)}60%{transform:translate(-5px,-3px) rotate(-3deg)}80%{transform:translate(5px,3px) rotate(3deg)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ children, color = "rose" }) {
  const map = { rose:"rgba(45,212,191,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
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
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(45,212,191,0.25)` },
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(45,212,191,0.08)", border:`1px solid rgba(45,212,191,0.2)`, borderRadius:10 }}>
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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/data` }] : []),
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
  // ── charts ─────────────────────────────────────────────────────────────────
  { id:"bar-chart-maker", cat:"charts", name:"Bar Chart Maker", desc:"Turn pasted numbers or a CSV into a clean labelled bar chart with gridlines and value labels, then download sharp SVG or PNG.", icon:"📊", free:true },
  { id:"line-chart-maker", cat:"charts", name:"Line Chart Maker", desc:"Plot one or many data series as a line chart with nice axis ticks, a legend and optional smoothing, and export SVG or PNG.", icon:"📈", free:true },
  { id:"pie-chart-maker", cat:"charts", name:"Pie Chart Maker", desc:"Build a pie chart from labels and values with percentage labels, a legend and six colour themes — download as SVG or PNG.", icon:"🥧", free:true },
  { id:"donut-chart-maker", cat:"charts", name:"Donut Chart Maker", desc:"Create a donut chart with an adjustable hole, a centre total and percentage labels, then export a crisp SVG or a PNG image.", icon:"🍩", free:true },
  { id:"area-chart-maker", cat:"charts", name:"Area Chart Maker", desc:"Draw filled area charts from your data, stacked or overlapping, with gridlines, a legend and one-click SVG or PNG download.", icon:"🏔️", free:true },
  { id:"scatter-plot-maker", cat:"charts", name:"Scatter Plot Maker", desc:"Plot X against Y as a scatter chart with auto-scaled axes, adjustable point size and an optional trend line; export SVG or PNG.", icon:"🔵", free:true },
  { id:"horizontal-bar-chart", cat:"charts", name:"Horizontal Bar Chart Maker", desc:"Make a horizontal bar chart that fits long category names, sorted or unsorted, with value labels and SVG or PNG export.", icon:"📶", free:true },
  { id:"stacked-bar-chart", cat:"charts", name:"Stacked Bar Chart Maker", desc:"Stack several series into one bar per category, in absolute values or as a 100% share, with a legend and SVG or PNG download.", icon:"🧱", free:true },
  { id:"sparkline-generator", cat:"charts", name:"Sparkline Generator", desc:"Generate tiny inline sparklines from a list of numbers, with min and max markers and area fill, ready to paste as SVG or PNG.", icon:"〰️", free:true },
  { id:"gauge-chart-maker", cat:"charts", name:"Gauge Chart Maker", desc:"Show a single KPI as a gauge dial with a coloured arc, a min and max range, a target marker and units — export SVG or PNG.", icon:"🎯", free:true },
  { id:"heatmap-generator", cat:"charts", name:"Heatmap Generator", desc:"Paste a matrix of values and get a colour-graded heatmap grid with row and column labels, a scale legend and SVG or PNG export.", icon:"🔥", free:true },
  { id:"gantt-chart-maker", cat:"charts", name:"Gantt Chart Maker", desc:"Turn a task list with start and end dates into a Gantt timeline with a date grid, progress bars and SVG or PNG download.", icon:"🗓️", free:true },
  { id:"org-chart-maker", cat:"charts", name:"Org Chart Maker", desc:"Type an indented list of roles and get a clean organisation chart with connector lines, ready to download as SVG or PNG.", icon:"🏢", free:true },
  { id:"timeline-maker", cat:"charts", name:"Timeline Maker", desc:"Turn dated events into a horizontal or vertical timeline with markers, titles and descriptions; export a sharp SVG or PNG.", icon:"⏳", free:true },

  // ── csv ────────────────────────────────────────────────────────────────────
  { id:"csv-viewer", cat:"csv", name:"CSV Viewer", desc:"Open a CSV in your browser and browse it as a sortable, searchable table with row and column counts — nothing is ever uploaded.", icon:"👁️", free:true },
  { id:"csv-cleaner", cat:"csv", name:"CSV Cleaner", desc:"Clean messy CSV files: trim whitespace, drop empty rows and columns, normalise line endings and fix quoting, then download it.", icon:"🧹", free:true },
  { id:"csv-deduplicator", cat:"csv", name:"CSV Duplicate Remover", desc:"Remove duplicate rows from a CSV, on the whole row or keyed on the columns you choose, and see exactly how many were dropped.", icon:"🧬", free:true },
  { id:"csv-splitter", cat:"csv", name:"CSV Splitter", desc:"Split a large CSV into smaller files by row count or by number of parts, each keeping the header row and its own download button.", icon:"✂️", free:true },
  { id:"csv-merger", cat:"csv", name:"CSV Merger", desc:"Combine several CSV files into one, matching columns by header name or stacking them, with a union or intersection of columns.", icon:"🔗", free:true },
  { id:"csv-column-extractor", cat:"csv", name:"CSV Column Extractor", desc:"Pick, reorder and rename the CSV columns you want to keep, then export a tidy new CSV containing only those fields.", icon:"🧾", free:true },
  { id:"csv-to-json-table", cat:"csv", name:"CSV to JSON Converter", desc:"Convert CSV to a JSON array of objects and JSON back to CSV, with typed numbers, a live table preview and one-click download.", icon:"🔁", free:true },
  { id:"csv-transposer", cat:"csv", name:"CSV Transposer", desc:"Swap the rows and columns of any CSV so records become fields, with a live preview and a download of the transposed file.", icon:"🔄", free:true },

  // ── stats ──────────────────────────────────────────────────────────────────
  { id:"data-summary-stats", cat:"stats", name:"Summary Statistics Calculator", desc:"Get count, sum, mean, median, mode, min, max, range, variance, standard deviation and quartiles for every numeric CSV column.", icon:"📐", free:true },
  { id:"pivot-table-builder", cat:"stats", name:"Pivot Table Builder", desc:"Build a pivot table from any CSV: choose a row field, a column field, a value field and sum, count, average, min or max.", icon:"🧮", free:true },
  { id:"frequency-counter", cat:"stats", name:"Frequency Counter", desc:"Count how often each value appears in a chosen CSV column, with percentages, a mini bar visual and a copyable results table.", icon:"🔢", free:true },
];

const CATEGORIES = [
  { id:"charts", name:"Chart Makers", icon:"📊", desc:"Bar, line, pie, donut, area and scatter charts." },
  { id:"csv", name:"CSV & Spreadsheet", icon:"📋", desc:"View, clean, split, merge and convert CSV data." },
  { id:"stats", name:"Data Analysis", icon:"📈", desc:"Summaries, pivots and quick statistics on your data." },
];

const TOOL_META = {
  "bar-chart-maker": {
    title: "Bar Chart Maker — Free Online, SVG & PNG Export | ToolsRift",
    desc: "Free bar chart maker. Paste numbers or load a CSV and get a labelled bar chart with gridlines, a legend and value labels. Download vector SVG or PNG.",
    keywords: "bar chart maker, free bar graph generator, csv to bar chart, online chart maker, bar chart svg download",
    faq: [
      ["Is my data uploaded to a server?", "No. The CSV you paste or load is parsed entirely in your browser's memory using JavaScript, and the chart is drawn locally as inline SVG. Nothing is transmitted, logged or stored anywhere, which matters when you are charting confidential revenue, payroll or customer figures."],
      ["What is the difference between the SVG and PNG downloads?", "SVG is a vector file: the bars and text stay perfectly sharp at any size, so it scales cleanly into a report, a poster or a slide deck without pixelation. PNG is a raster image exported at 2x resolution, which is easier to paste into apps such as email clients or chat tools that do not accept SVG."],
      ["Can I plot more than one series?", "Yes. Put your category names in the first column and add one extra column per series. Each extra column becomes its own coloured group of bars with an automatic legend, and the vertical axis rescales to fit every series including negative values."],
    ],
    howTo: "Paste your data as CSV with labels in the first column and numbers in the columns after it, or load a .csv file. Set the title, axis labels, colour theme and value labels, then download the chart as SVG or PNG.",
  },
  "line-chart-maker": {
    title: "Line Chart Maker — Free Online Line Graph Tool | ToolsRift",
    desc: "Free line chart maker. Turn CSV or pasted numbers into a multi-series line graph with nice axis ticks, a legend, smoothing and SVG or PNG download.",
    keywords: "line chart maker, line graph generator, csv to line chart, trend chart maker, free line graph tool",
    faq: [
      ["How are the axis ticks chosen?", "The tool computes a 'nice' scale rather than using your raw minimum and maximum. It rounds the interval to a friendly 1, 2, 2.5, 5 or 10 times a power of ten so the gridlines land on readable round numbers, and it always includes zero when your data crosses it."],
      ["What do the straight, smooth and stepped line styles do?", "Straight joins the points with direct segments, which is the most honest option for measured data. Smooth fits a Catmull-Rom curve for a softer look, and stepped holds each value until the next reading, which suits things like price changes or stock levels."],
      ["What happens if some values are blank?", "Blank or non-numeric cells are treated as gaps rather than zeros, so the line breaks and resumes instead of falsely dropping to the baseline. This keeps charts of partially collected data truthful."],
    ],
    howTo: "Paste CSV with your x-axis labels in the first column and one column per line series. Choose a line style, colour theme and whether to show point markers and value labels, then export SVG or PNG.",
  },
  "pie-chart-maker": {
    title: "Pie Chart Maker — Free Online Pie Chart Generator | ToolsRift",
    desc: "Free pie chart maker. Enter labels and values to build a pie chart with percentages, a legend and six colour themes. Export a sharp SVG or a PNG image.",
    keywords: "pie chart maker, pie chart generator, percentage chart maker, free pie graph, pie chart svg export",
    faq: [
      ["How are the percentages calculated?", "Each slice angle is its value divided by the total of all values, so the percentages always add up to 100%. The tool ignores blank cells and skips zero or negative values, since a pie chart cannot represent a negative share."],
      ["How many slices work well?", "Between two and about eight slices is readable. Beyond that the labels start to collide, so the tool automatically hides the inline label on any slice smaller than a few percent and relies on the legend instead, keeping the chart clean."],
      ["Is the exported file good enough for print?", "Yes. The SVG export is pure vector geometry with real text, so it prints at whatever resolution your printer or press supports. The PNG is rasterised at 2x for crisp on-screen use, and you can switch the export background to white so it drops straight into a document."],
    ],
    howTo: "Enter one label and one number per line as CSV, choose a colour theme and decide whether to show values or percentages, then download the finished pie chart as SVG or PNG.",
  },
  "donut-chart-maker": {
    title: "Donut Chart Maker — Free Online Ring Chart Tool | ToolsRift",
    desc: "Free donut chart maker. Build a ring chart with an adjustable hole, a centre total, percentage labels and a legend. Download vector SVG or high-res PNG.",
    keywords: "donut chart maker, ring chart generator, doughnut chart online, free donut graph, donut chart svg",
    faq: [
      ["What is the centre of the donut for?", "The hole is a natural place for a headline figure, so the tool prints the total of all your slices there along with a caption you can change. That turns the chart into a KPI card that shows both the overall number and its breakdown at a glance."],
      ["Can I change how thick the ring is?", "Yes. The hole size control moves the inner radius between a thin ring and a very wide hole. Thinner rings suit dashboards with a large centre figure, while thicker rings read more like a classic pie when you have many slices."],
      ["Does it handle a single category or a zero total?", "Yes. A single value draws as a complete ring rather than a broken arc, and if every value is zero or blank the tool shows a short explanation of what to fix instead of rendering an empty or broken shape."],
    ],
    howTo: "Paste your categories and numbers as CSV, adjust the hole size, colour theme and label style, then export the donut chart as a scalable SVG or a 2x PNG.",
  },
  "area-chart-maker": {
    title: "Area Chart Maker — Free Stacked Area Graph Tool | ToolsRift",
    desc: "Free area chart maker. Plot filled areas from CSV data, stacked or overlapping, with nice gridlines, a legend and one-click SVG or PNG download.",
    keywords: "area chart maker, stacked area chart generator, filled line graph, csv area chart, area graph svg",
    faq: [
      ["When should I stack the areas instead of overlapping them?", "Stack them when the series are parts of a whole, such as revenue by product line, because the top edge then shows the total. Overlap them with transparency when the series are independent measures you want to compare directly, such as two regions' sales."],
      ["Are negative numbers supported?", "In overlapping mode yes: the axis extends below zero and a stronger zero line is drawn so you can see which points fall under it. Stacked mode is designed for non-negative parts of a whole, so mixing signs there produces a chart that is hard to read honestly."],
      ["Can I use it for time series with many points?", "Yes. When the x-axis becomes crowded the tool rotates the labels and then skips them at a regular interval so they never overlap, while every data point is still drawn. Very long datasets are capped for rendering speed with a clear notice."],
    ],
    howTo: "Paste CSV with time or category labels in the first column and one column per series, choose stacked or overlapping, set the theme and labels, then download SVG or PNG.",
  },
  "scatter-plot-maker": {
    title: "Scatter Plot Maker — Free XY Chart Generator | ToolsRift",
    desc: "Free scatter plot maker. Plot X against Y from CSV with auto-scaled axes, adjustable point size and an optional trend line. Export sharp SVG or PNG.",
    keywords: "scatter plot maker, xy chart generator, correlation chart, scatter graph online, trend line chart",
    faq: [
      ["How does the tool decide which column is X?", "The first column is the X axis and every numeric column after it becomes a Y series with its own colour. If your first column contains text labels instead of numbers, the tool falls back to using the second column as X so the chart still makes sense."],
      ["What does the trend line show?", "It is an ordinary least-squares line of best fit through the first series, drawn with its equation so you can read the slope. It is a quick visual guide to direction and strength, not a full statistical model, so treat it as a starting point rather than a conclusion."],
      ["Can I plot thousands of points?", "The renderer caps the number of drawn points to keep the browser responsive and tells you how many of your rows are shown. For exploratory work that limit is usually plenty; for very large datasets consider aggregating first with the summary statistics tool."],
    ],
    howTo: "Paste CSV with X values in the first column and one or more Y columns after it, set the point size, theme and trend line option, then download the plot as SVG or PNG.",
  },
  "horizontal-bar-chart": {
    title: "Horizontal Bar Chart Maker — Free Online Tool | ToolsRift",
    desc: "Free horizontal bar chart maker for long category names. Sort bars, show value labels, pick a colour theme and export a vector SVG or a high-res PNG.",
    keywords: "horizontal bar chart maker, bar chart generator, ranked bar chart, sorted bar graph, horizontal bar svg",
    faq: [
      ["Why use horizontal bars instead of vertical ones?", "Horizontal bars give each category a full line of width for its name, so long labels such as product names, survey answers or country names stay readable without rotating the text. They also read naturally as a ranking when sorted from largest to smallest."],
      ["Can I sort the bars?", "Yes. You can keep your original order or sort descending or ascending by value. Sorting turns the chart into a clear ranking, which is usually the fastest way for a reader to see the top and bottom performers."],
      ["Do negative values work?", "Yes. When any value is below zero the axis extends to the left of a highlighted zero line and negative bars grow leftwards, so profit-and-loss style data reads correctly rather than being clipped."],
    ],
    howTo: "Paste your categories and values as CSV, choose a sort order, colour theme and value-label setting, then download the horizontal bar chart as SVG or PNG.",
  },
  "stacked-bar-chart": {
    title: "Stacked Bar Chart Maker — Free 100% Stack Tool | ToolsRift",
    desc: "Free stacked bar chart maker. Stack several series per category in absolute values or as a 100% share, with a legend, value labels and SVG or PNG export.",
    keywords: "stacked bar chart maker, 100% stacked bar chart, composition chart generator, stacked column chart, csv stacked chart",
    faq: [
      ["What is the difference between absolute and 100% stacking?", "Absolute stacking keeps the real numbers, so bar height shows the total for each category as well as the split. 100% stacking rescales every bar to full height so you compare composition rather than size, which is the right choice when totals differ wildly."],
      ["How many series can I stack?", "As many columns as you add, though six to eight segments per bar is about the practical limit for readability. The legend lists every series in order, and segment value labels are hidden automatically when a segment is too small to hold text."],
      ["Can segments have different totals per category?", "Yes. Each bar is stacked independently from its own row, so categories with missing series simply have fewer segments. Blank cells are treated as zero within a stack rather than breaking the bar."],
    ],
    howTo: "Paste CSV with categories in the first column and one column per stacked series, choose absolute or 100% mode, set the theme and labels, then export SVG or PNG.",
  },
  "sparkline-generator": {
    title: "Sparkline Generator — Free Inline Mini Chart Maker | ToolsRift",
    desc: "Free sparkline generator. Turn a list of numbers into a tiny inline trend chart with min and max markers and area fill, then copy the SVG or download a PNG.",
    keywords: "sparkline generator, mini chart maker, inline trend chart, tiny line graph, sparkline svg code",
    faq: [
      ["What is a sparkline?", "A sparkline is a small word-sized chart with no axes, designed to sit inline in a table, a dashboard cell or a sentence. It shows the shape of a trend rather than exact values, which makes it perfect for showing dozens of series compactly."],
      ["Can I paste the sparkline into a spreadsheet or web page?", "Yes. Download the SVG and drop the file into a document, or open it in a text editor and paste the markup straight into your HTML — it is plain inline SVG with no external dependencies, scripts or fonts required."],
      ["What do the coloured dots mean?", "When markers are enabled the tool highlights the lowest point, the highest point and the most recent value. Those three markers give a reader the range and the current position instantly without needing any axis labels."],
    ],
    howTo: "Paste your numbers separated by commas, spaces or new lines, choose the fill, marker and colour options, then download the sparkline as an SVG or a PNG.",
  },
  "gauge-chart-maker": {
    title: "Gauge Chart Maker — Free KPI Dial Generator | ToolsRift",
    desc: "Free gauge chart maker. Show a single KPI as a dial with a coloured arc, custom min and max, a target marker and units. Download vector SVG or a PNG.",
    keywords: "gauge chart maker, kpi dial generator, speedometer chart, progress gauge svg, free gauge graph",
    faq: [
      ["What is a gauge chart good for?", "A gauge is best for one number measured against a known range — utilisation, a completion percentage, a score, or a target attainment. It answers 'how far along are we' at a glance, which is why gauges are common on executive dashboards."],
      ["Can I set my own range and target?", "Yes. Enter any minimum and maximum, including ranges that start above zero, and set an optional target value that is drawn as a marker on the arc. The needle position and the percentage read-out both respect your range."],
      ["What happens if the value is outside the range?", "The needle is clamped to the end of the arc so the dial never draws outside itself, and the numeric read-out still shows your true value so nothing is hidden. That makes over-target results obvious rather than misleading."],
    ],
    howTo: "Enter the value, the minimum and maximum for the scale, an optional target and a unit suffix, choose a colour theme, then download the gauge as SVG or PNG.",
  },
  "heatmap-generator": {
    title: "Heatmap Generator — Free Colour Matrix Chart Maker | ToolsRift",
    desc: "Free heatmap generator. Paste a matrix of values and get a colour-graded grid with row and column labels, cell values and a scale legend. SVG and PNG export.",
    keywords: "heatmap generator, matrix chart maker, colour grid chart, correlation heatmap online, heatmap svg export",
    faq: [
      ["What shape should my data be?", "Use a grid: the first row holds your column headings, the first column holds your row names, and every other cell holds a number. That is exactly what you get when you copy a block out of a spreadsheet, so you can usually paste it straight in."],
      ["What is the difference between the sequential and diverging scales?", "Sequential runs from a light tone at the minimum to a saturated tone at the maximum and suits data that only goes up, like traffic or sales. Diverging colours negatives and positives differently around a neutral midpoint, which is what you want for change, variance or correlation matrices."],
      ["Can I show the numbers inside the cells?", "Yes. Value labels can be turned on and the text colour flips automatically between dark and light depending on how saturated the cell is, so the numbers stay legible on both ends of the scale."],
    ],
    howTo: "Paste your matrix as CSV with column headings in the first row and row names in the first column, pick a colour scale and value-label setting, then export SVG or PNG.",
  },
  "gantt-chart-maker": {
    title: "Gantt Chart Maker — Free Online Project Timeline | ToolsRift",
    desc: "Free Gantt chart maker. Turn a task list with start and end dates into a project timeline with a date grid, progress bars and today marker. Export SVG or PNG.",
    keywords: "gantt chart maker, project timeline generator, free gantt online, task schedule chart, gantt chart svg",
    faq: [
      ["What format do the dates need to be in?", "ISO dates like 2026-03-14 are the safest because they are unambiguous everywhere in the world. Common formats such as 14 Mar 2026 also parse, and any row with a date the browser cannot read is listed as skipped so you can fix it rather than losing it silently."],
      ["Can I show how far along each task is?", "Yes. Add an optional fourth column with a percentage and each bar gets a darker inner fill showing that much progress, plus the percentage printed at the end of the bar. Leave the column out and the bars are drawn as plain durations."],
      ["Is the project data private?", "Completely. Project schedules often reveal launch dates, client commitments and staffing, so nothing is uploaded: the CSV is parsed in memory in your browser and the SVG is generated locally on your own device."],
    ],
    howTo: "List one task per line as Task, start date, end date and an optional progress percentage. Adjust the theme and labels, then download the Gantt chart as SVG or PNG.",
  },
  "org-chart-maker": {
    title: "Org Chart Maker — Free Organisation Chart Generator | ToolsRift",
    desc: "Free org chart maker. Type an indented list of roles and instantly get an organisation chart with boxes and connector lines. Download vector SVG or a PNG.",
    keywords: "org chart maker, organisation chart generator, hierarchy chart online, team structure diagram, org chart svg",
    faq: [
      ["How do I describe the hierarchy?", "Write one person or role per line and indent with spaces or a tab to show who reports to whom. Every level of indentation creates a new tier, so restructuring the chart is just a matter of adding or removing indentation — no dragging boxes around."],
      ["Can a box show a name and a job title?", "Yes. Put the name first, then a comma or a pipe, then the title, and the box prints the name in bold with the title underneath in a lighter tone. That keeps each node compact while still carrying the information people actually look for."],
      ["Will a wide organisation still fit?", "The canvas grows with the number of people at the widest level and boxes shrink to fit, and the chart scrolls sideways on small screens. Because the export is SVG you can also open it at any size later without the text ever going blurry."],
    ],
    howTo: "Type your hierarchy one person per line, indenting each report under its manager, add optional job titles after a comma, then download the org chart as SVG or PNG.",
  },
  "timeline-maker": {
    title: "Timeline Maker — Free Online Event Timeline Chart | ToolsRift",
    desc: "Free timeline maker. Turn dated events into a horizontal or vertical timeline with markers, titles and descriptions. Download a crisp SVG or a high-res PNG.",
    keywords: "timeline maker, event timeline generator, history timeline chart, roadmap timeline online, timeline svg export",
    faq: [
      ["Should I use the horizontal or the vertical layout?", "Horizontal works well for a handful of milestones on a slide because it reads like a journey from left to right. Vertical is better when you have many events or longer descriptions, since each entry gets its own full line of text."],
      ["Are the events spaced by real dates?", "In horizontal mode yes — events are positioned proportionally along the axis, so long gaps between milestones are visible. Vertical mode lists them in date order at even spacing, which keeps long descriptions readable."],
      ["Can I use it for non-date labels like quarters?", "Yes. If a value cannot be read as a date the tool falls back to using it as a plain label in the order you wrote it, so Q1, Phase 2 or Week 6 all work as timeline stops."],
    ],
    howTo: "Enter one event per line as date, title and an optional description. Choose horizontal or vertical, set the colour theme, then export the timeline as SVG or PNG.",
  },
  "csv-viewer": {
    title: "CSV Viewer — Free Online, Sortable & Private | ToolsRift",
    desc: "Free online CSV viewer. Open a CSV or TSV in your browser and sort, search and browse it as a clean table with row and column counts. Nothing is uploaded.",
    keywords: "csv viewer, open csv online, csv reader, view csv file free, sortable csv table",
    faq: [
      ["Is my file uploaded anywhere?", "No. The file is read with the browser's FileReader API and parsed in memory on your own machine. Nothing is sent over the network, which means you can safely open exports containing customer records, salaries or financial detail."],
      ["How does it handle awkward CSV files?", "The parser handles quoted fields, commas and line breaks inside quotes, doubled quotes as an escape, and both CRLF and LF line endings. It also auto-detects whether your delimiter is a comma, tab, semicolon or pipe and whether the first row is a header."],
      ["What happens with very large files?", "Only the first block of rows is rendered so the page stays responsive, and a notice tells you how many rows the file actually contains. Sorting and searching still run over the complete dataset, not just the visible page."],
    ],
    howTo: "Load a CSV file or paste the text, then click any column heading to sort and type in the search box to filter. Row and column counts update as you go.",
  },
  "csv-cleaner": {
    title: "CSV Cleaner — Free Tool to Fix Messy CSV Files | ToolsRift",
    desc: "Free CSV cleaner. Trim whitespace, drop empty rows and columns, collapse blank lines, normalise line endings and rewrite quoting, then download the clean file.",
    keywords: "csv cleaner, clean csv online, fix messy csv, remove empty rows csv, trim whitespace csv",
    faq: [
      ["What exactly does cleaning change?", "Each option is separate: trimming removes leading and trailing spaces from every cell, empty-row and empty-column removal drops lines and fields that contain nothing at all, and quote normalisation rewrites the file so only fields that genuinely need quotes have them."],
      ["Why do line endings matter?", "Files that mix Windows CRLF and Unix LF endings break naive importers and can produce phantom blank rows. The cleaner rewrites every line break consistently in whichever style you pick, so the file loads cleanly into databases, spreadsheets and scripts."],
      ["Will it change my actual values?", "Only in the ways you ask for. Numbers, dates and text content are never reformatted or reinterpreted, so a cleaned file still contains exactly the same data — just without the whitespace, empty structure and inconsistent quoting."],
    ],
    howTo: "Paste or load your CSV, tick the cleaning options you want, review the before-and-after counts in the preview, then download the cleaned CSV.",
  },
  "csv-deduplicator": {
    title: "CSV Duplicate Remover — Free Dedupe Tool Online | ToolsRift",
    desc: "Free CSV duplicate remover. Delete repeated rows across the whole row or keyed on chosen columns, see how many were removed and download the deduped file.",
    keywords: "csv duplicate remover, remove duplicate rows csv, dedupe csv online, unique rows csv, csv deduplicator",
    faq: [
      ["What counts as a duplicate?", "By default two rows are duplicates only when every field matches. If you tick specific key columns instead, rows are compared on just those fields — so you can keep one record per email address or per order ID even when the other columns differ."],
      ["Which copy is kept?", "The first occurrence in the file order is kept and later matches are dropped, which preserves the original sequence of your data. The removed rows are counted and listed so you can confirm the tool did what you expected before downloading."],
      ["Can I ignore case and spacing?", "Yes. The case-insensitive option treats Alice and alice as the same value, and trimming ignores stray leading or trailing spaces. Both are common causes of near-duplicates in exported contact and lead lists."],
    ],
    howTo: "Load your CSV, choose whether to match on the whole row or specific key columns, set case and whitespace handling, then download the deduplicated file.",
  },
  "csv-splitter": {
    title: "CSV Splitter — Split a Large CSV Into Files Free | ToolsRift",
    desc: "Free CSV splitter. Break a large CSV into chunks of N rows or into N equal parts, each keeping the header row, with a separate download for every piece.",
    keywords: "csv splitter, split csv file online, split large csv, csv chunk splitter, divide csv rows",
    faq: [
      ["Does every part keep the header row?", "Yes, when your file has a header the tool repeats it at the top of every part so each piece is a valid standalone CSV. That is what import tools and spreadsheet apps expect, so the parts open correctly without any manual fixing."],
      ["Should I split by row count or by number of parts?", "Split by rows when a system has an import limit, for example 500 records per upload. Split by parts when you want to hand the work to a fixed number of people or processes and do not mind how many rows each one gets."],
      ["Is there a file size limit?", "The practical limit is your device's memory, since the whole file is held in the browser. Multi-megabyte files are fine on a normal laptop, and because nothing is uploaded there is no server-side size cap or transfer wait at all."],
    ],
    howTo: "Load your CSV, choose split by rows per file or by number of files, set the number, then download each generated part with its own button.",
  },
  "csv-merger": {
    title: "CSV Merger — Combine Multiple CSV Files Free | ToolsRift",
    desc: "Free CSV merger. Combine several CSV files into one, matching columns by header name or stacking them, with union or intersection of columns and a source tag.",
    keywords: "csv merger, combine csv files, merge multiple csv online, concatenate csv, join csv files free",
    faq: [
      ["What if the files have different columns?", "Choose union to keep every column that appears in any file, filling missing values with blanks, or intersection to keep only the columns that all files share. Union is safer when you do not want to lose data; intersection gives a tidy rectangular result."],
      ["Does column order have to match?", "No. When matching by header name the tool maps each file's columns onto the merged header by name, so a file whose columns are in a different order still lands in the right places. Positional stacking is available too if your files have no headers."],
      ["Can I tell which file each row came from?", "Yes. Turn on the source column and every merged row gets an extra field naming the file or block it came from, which makes it easy to trace a record back or to filter one source out later."],
    ],
    howTo: "Load or paste two or more CSVs, choose union or intersection of columns and whether to add a source column, then preview the merged table and download it.",
  },
  "csv-column-extractor": {
    title: "CSV Column Extractor — Select & Reorder Columns Free | ToolsRift",
    desc: "Free CSV column extractor. Pick exactly the columns you need, reorder and rename them, then export a tidy CSV with only those fields. Runs in your browser.",
    keywords: "csv column extractor, select csv columns, reorder csv columns, remove columns from csv, extract csv fields",
    faq: [
      ["Why extract columns instead of deleting them in a spreadsheet?", "Because a spreadsheet can silently reformat your data — dropping leading zeros from postcodes, turning long IDs into scientific notation or reinterpreting dates. This tool treats every field as text and only removes or reorders columns, so the values you keep are byte-for-byte the ones you had."],
      ["Can I change the order of the columns I keep?", "Yes. Move any selected column up or down and the export follows that order exactly, which is handy when a target system expects its fields in a fixed sequence."],
      ["Can I rename the headers on the way out?", "Yes. Each kept column has an editable output name, so you can map your internal field names onto whatever an import template or API expects without touching the data itself."],
    ],
    howTo: "Load your CSV, tick the columns to keep, reorder or rename them as needed, check the live preview, then download the trimmed CSV file.",
  },
  "csv-to-json-table": {
    title: "CSV to JSON Converter — Free Two-Way Tool Online | ToolsRift",
    desc: "Free CSV to JSON converter with a JSON to CSV mode. Get a JSON array of objects with typed numbers, a live table preview and one-click download. No upload.",
    keywords: "csv to json, json to csv, csv json converter, convert csv to json array, csv to json online free",
    faq: [
      ["What does the output JSON look like?", "You get an array of objects where each object is one row and the keys come from your header row, which is the shape almost every API, JavaScript app and NoSQL import expects. Pretty-printed and minified output are both available."],
      ["What is number typing?", "With typing on, a cell like 42 becomes the JSON number 42 rather than the string \"42\", and true, false and empty values are converted too. Turn typing off when fields such as ZIP codes, phone numbers or IDs must stay exactly as written."],
      ["Can it convert JSON back into CSV?", "Yes. Paste an array of objects and the tool collects every key across all records into a header row, then writes one line per object with proper quoting. Missing keys become empty cells and nested values are serialised as compact JSON."],
    ],
    howTo: "Paste CSV and read the JSON output, or switch direction and paste a JSON array to get CSV. Toggle number typing and pretty printing, then copy or download the result.",
  },
  "csv-transposer": {
    title: "CSV Transposer — Swap Rows and Columns Free Online | ToolsRift",
    desc: "Free CSV transposer. Flip a CSV so rows become columns and columns become rows, with a live preview and instant download. Parsed privately in your browser.",
    keywords: "csv transposer, transpose csv online, swap rows and columns, flip csv table, rotate csv data",
    faq: [
      ["When do I need to transpose a CSV?", "Usually when a report was written wide — one column per month or per metric — but the tool you are importing into expects one row per record. Transposing turns that wide layout into a tall one, or the other way round, in a single step."],
      ["What happens to the header row?", "The header becomes the first column of the output, so no labels are lost. Uneven rows are padded with empty cells first, which guarantees the transposed grid is rectangular and opens cleanly in any spreadsheet."],
      ["Is there a size limit?", "Transposing is done entirely in memory, so the limit is your device rather than a server. Very wide results are previewed with a column cap and a notice, while the downloaded file always contains every single cell."],
    ],
    howTo: "Paste or load your CSV, check the transposed preview showing rows as columns, then copy the result or download it as a new CSV file.",
  },
  "data-summary-stats": {
    title: "Summary Statistics Calculator — Mean, Median, SD | ToolsRift",
    desc: "Free summary statistics tool. Get count, sum, mean, median, mode, min, max, range, variance, standard deviation and quartiles for every numeric CSV column.",
    keywords: "summary statistics calculator, mean median mode calculator, standard deviation csv, descriptive statistics online, quartile calculator",
    faq: [
      ["Which statistics are calculated?", "For every numeric column you get the count of valid values, the sum, mean, median, mode, minimum, maximum, range, variance, standard deviation and the Q1, Q2 and Q3 quartiles with the interquartile range. Non-numeric columns are reported as text and skipped."],
      ["Is the standard deviation for a sample or a population?", "You can choose. Sample standard deviation divides by n-1 and is the right default when your rows are a sample of something larger; population divides by n and is correct only when you hold every member of the group."],
      ["How are the quartiles computed?", "Using the linear interpolation method on the sorted values, which is the same approach as spreadsheet QUARTILE functions, so the numbers match what Excel or Google Sheets would give you for the same column."],
    ],
    howTo: "Paste or load your CSV, pick sample or population for the deviation, and read the statistics table generated for every numeric column. Copy the results in one click.",
  },
  "pivot-table-builder": {
    title: "Pivot Table Builder — Free Online CSV Pivot Tool | ToolsRift",
    desc: "Free pivot table builder. Choose a row field, a column field, a value field and sum, count, average, min or max to cross-tabulate any CSV in your browser.",
    keywords: "pivot table builder, csv pivot table online, cross tabulation tool, group by csv, free pivot table generator",
    faq: [
      ["How is this different from a spreadsheet pivot table?", "It does the same cross-tabulation but with no setup, no file upload and no risk of the spreadsheet reformatting your data. Pick the fields from dropdowns and the table appears instantly, complete with row totals, column totals and a grand total."],
      ["Which aggregations are available?", "Sum, count, average, minimum and maximum. Count works on any column including text, while the numeric aggregations skip cells that are not numbers so a few stray labels will not break the result or produce NaN."],
      ["Can I use only a row field with no column field?", "Yes. Leave the column field set to none and you get a simple grouped summary — one line per distinct row value with its aggregate — which is often exactly the group-by report you were after."],
    ],
    howTo: "Load your CSV, choose the row field, an optional column field, the value field and an aggregation, then read the cross-tab and copy or download it as CSV.",
  },
  "frequency-counter": {
    title: "Frequency Counter — Count Value Occurrences in CSV | ToolsRift",
    desc: "Free frequency counter. Count how often each value appears in any CSV column, with percentages, a cumulative share and a mini bar chart. Nothing is uploaded.",
    keywords: "frequency counter, value counts csv, count occurrences online, frequency table generator, csv value distribution",
    faq: [
      ["What does the frequency table show?", "Every distinct value in the chosen column with how many times it occurs, its share of the total as a percentage, a running cumulative percentage and a small bar so you can see the shape of the distribution without building a chart."],
      ["Can I group values that only differ by case or spacing?", "Yes. The case-insensitive and trim options fold values like 'Email', 'email' and ' email ' into one bucket, which is essential when counting free-text fields such as channels, tags or survey answers."],
      ["What about long-tail values?", "You can limit the table to the top N values and the rest are grouped into a single 'other' line with its own count and percentage, so a column with thousands of unique values still gives a readable summary."],
    ],
    howTo: "Load your CSV, choose the column to count, set case and trim handling and how many top values to show, then read the frequency table and copy it.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  TOOLS
// ══════════════════════════════════════════════════════════════════════════════

// ── Shared data engine: CSV parsing, formatting, downloads ───────────────────
const PRIVACY_NOTE = "🔒 Parsed in memory inside your browser — nothing is ever uploaded.";
const MAX_PREVIEW = 100;
const MAX_CHART_ROWS = 300;

const DELIMS = [",", "\t", ";", "|"];
const DELIM_NAME = { ",": "comma", "\t": "tab", ";": "semicolon", "|": "pipe" };

const splitLines = (t) => String(t).split(/\r\n|\n|\r/);

function countOutsideQuotes(line, d) {
  let n = 0, q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') q = !q;
    else if (!q && ch === d) n++;
  }
  return n;
}

// Auto-detect the delimiter: highest average count per line with the lowest variance.
function detectDelimiter(text) {
  const lines = splitLines(text).filter((l) => l.trim() !== "").slice(0, 25);
  if (!lines.length) return ",";
  let best = ",", bestScore = -Infinity;
  for (const d of DELIMS) {
    const counts = lines.map((l) => countOutsideQuotes(l, d));
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    if (avg < 1) continue;
    const varr = counts.reduce((a, b) => a + (b - avg) * (b - avg), 0) / counts.length;
    const score = avg - varr * 3;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

// RFC-4180 style parser: quoted fields, embedded delimiters and newlines,
// "" as an escaped quote, and CRLF / LF / CR line endings.
function parseCsvRaw(text, delim) {
  const rows = []; let row = []; let field = ""; let inQ = false; let i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQ = false; i++; continue;
      }
      field += ch; i++; continue;
    }
    if (ch === '"') { inQ = true; i++; continue; }
    if (ch === delim) { row.push(field); field = ""; i++; continue; }
    if (ch === "\r") { if (text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; i++; continue; }
    field += ch; i++;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toNum(v) {
  if (v === null || v === undefined) return NaN;
  let s = String(v).trim();
  if (!s) return NaN;
  s = s.replace(/[₹$€£¥\s,]/g, "").replace(/%$/, "");
  if (/^\(.*\)$/.test(s)) s = "-" + s.slice(1, -1);
  if (!/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return NaN;
  return parseFloat(s);
}
const isNum = (v) => !isNaN(toNum(v));

function detectHeader(rows) {
  if (rows.length < 2) return false;
  const r0 = rows[0], rest = rows.slice(1, 12);
  let score = 0;
  for (let c = 0; c < r0.length; c++) {
    const headNumeric = isNum(r0[c]);
    const bodyNumeric = rest.some((r) => isNum(r[c]));
    if (!headNumeric && bodyNumeric) score += 1;
    else if (headNumeric && bodyNumeric) score -= 1;
  }
  if (score === 0) return r0.every((v) => String(v).trim() !== "");
  return score > 0;
}

function parseCSV(text, opts = {}) {
  const t = String(text || "").replace(/^﻿/, "");
  const empty = { ok: false, error: "No data yet — paste some CSV above or load a file to get started.", header: [], rows: [], delim: ",", hasHeader: false };
  if (!t.trim()) return empty;
  const delim = opts.delim && opts.delim !== "auto" ? (opts.delim === "tab" ? "\t" : opts.delim) : detectDelimiter(t);
  let rows = parseCsvRaw(t, delim).filter((r) => r.length > 1 || String(r[0] || "").trim() !== "");
  if (!rows.length) return { ...empty, error: "That input did not contain any readable rows. Check for stray quote characters." };
  const width = rows.reduce((m, r) => Math.max(m, r.length), 0);
  rows = rows.map((r) => { const c = r.slice(); while (c.length < width) c.push(""); return c; });
  const hasHeader = opts.header === "yes" ? true : opts.header === "no" ? false : detectHeader(rows);
  const header = hasHeader
    ? rows[0].map((h, i) => String(h).trim() || `Column ${i + 1}`)
    : rows[0].map((_, i) => `Column ${i + 1}`);
  const body = hasHeader ? rows.slice(1) : rows;
  return { ok: true, error: null, delim, hasHeader, header, rows: body, width };
}

const csvEsc = (v, d) => {
  const s = v === null || v === undefined ? "" : String(v);
  return (s.includes('"') || s.includes("\n") || s.includes("\r") || s.includes(d)) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
function toCSV(header, rows, delim = ",", withHeader = true, eol = "\r\n") {
  const out = [];
  if (withHeader && header && header.length) out.push(header.map((v) => csvEsc(v, delim)).join(delim));
  rows.forEach((r) => out.push(r.map((v) => csvEsc(v, delim)).join(delim)));
  return out.join(eol);
}

function fmtNum(v) {
  if (v === null || v === undefined || isNaN(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e9) return (v / 1e9).toFixed(a >= 1e10 ? 0 : 1) + "B";
  if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
  if (a >= 1e4) return (v / 1e3).toFixed(a >= 1e5 ? 0 : 1) + "k";
  if (Number.isInteger(v)) return String(v);
  return String(+v.toFixed(Math.abs(v) < 1 ? 3 : 2));
}
const fmtFull = (v) => (v === null || v === undefined || isNaN(v) ? "—" : String(+Number(v).toFixed(4)));

function downloadText(name, text, mime = "text/plain") {
  try {
    const blob = new Blob([text], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (e) { /* download unsupported */ }
}

const safeName = (s, fallback) => (String(s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback);

function serializeSvg(svgEl) {
  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  const vb = (svgEl.getAttribute("viewBox") || "0 0 800 460").split(/\s+/).map(Number);
  clone.setAttribute("width", vb[2]);
  clone.setAttribute("height", vb[3]);
  clone.removeAttribute("style");
  return { markup: new XMLSerializer().serializeToString(clone), w: vb[2], h: vb[3] };
}
function downloadSvgFile(svgEl, name) {
  if (!svgEl) return;
  const { markup } = serializeSvg(svgEl);
  downloadText(name + ".svg", '<?xml version="1.0" encoding="UTF-8"?>\n' + markup, "image/svg+xml");
}
function downloadSvgPng(svgEl, name, scale, bg, onError) {
  if (!svgEl) return;
  const { markup, w, h } = serializeSvg(svgEl);
  const img = new Image();
  img.onload = () => {
    try {
      const cv = document.createElement("canvas");
      cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
      const ctx = cv.getContext("2d");
      ctx.fillStyle = bg || "#0D1117";
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob((b) => {
        if (!b) { onError && onError("PNG export failed in this browser — the SVG download always works."); return; }
        const url = URL.createObjectURL(b);
        const a = document.createElement("a");
        a.href = url; a.download = name + ".png";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }, "image/png");
    } catch (e) { onError && onError("PNG export failed — use the SVG download instead."); }
  };
  img.onerror = () => onError && onError("PNG export failed — use the SVG download instead.");
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
}

// ── Shared inputs & table preview ────────────────────────────────────────────
function FileLoadBtn({ onText, accept = ".csv,.tsv,.txt,text/csv,text/plain", label = "📁 Load a file", multiple = false }) {
  const [name, setName] = useState("");
  const onPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setName(files.map((f) => f.name).join(", "));
    let done = 0; const out = [];
    files.forEach((f, i) => {
      const r = new FileReader();
      r.onload = () => { out[i] = { name: f.name, text: String(r.result || "") }; if (++done === files.length) onText(multiple ? out : out[0].text); };
      r.onerror = () => { out[i] = { name: f.name, text: "" }; if (++done === files.length) onText(multiple ? out : ""); };
      r.readAsText(f);
    });
    e.target.value = "";
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 600, color: C.text, cursor: "pointer" }}>
        {label}
        <input type="file" accept={accept} multiple={multiple} onChange={onPick} style={{ display: "none" }} />
      </label>
      {name && <span style={{ fontSize: 11, color: C.muted, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>}
    </span>
  );
}

function CsvSource({ value, onChange, label = "Your data (CSV, TSV or pasted spreadsheet cells)", rows = 8 }) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea value={value} onChange={onChange} rows={rows} mono placeholder={"Name,Value\nAlpha,120\nBeta,90"} />
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
        <FileLoadBtn onText={onChange} />
        <span style={{ fontSize: 11, color: C.muted }}>{PRIVACY_NOTE}</span>
      </div>
    </div>
  );
}

function ParseOptions({ delim, setDelim, header, setHeader, detected }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 }}>
      <div><Label>Delimiter</Label><SelectInput value={delim} onChange={setDelim} style={{ width: "100%" }}
        options={[["auto", `Auto-detect${detected ? " (" + (DELIM_NAME[detected] || detected) + ")" : ""}`], [",", "Comma ,"], ["tab", "Tab"], [";", "Semicolon ;"], ["|", "Pipe |"]]} /></div>
      <div><Label>First row</Label><SelectInput value={header} onChange={setHeader} style={{ width: "100%" }}
        options={[["auto", "Auto-detect header"], ["yes", "Is a header row"], ["no", "Is data"]]} /></div>
    </div>
  );
}

function PreviewTable({ header, rows, max = MAX_PREVIEW, maxCols = 40, onSort, sortCol, sortDir, note }) {
  const cols = header.slice(0, maxCols);
  const shown = rows.slice(0, max);
  const th = { textAlign: "left", padding: "8px 12px", color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)", position: "sticky", top: 0, whiteSpace: "nowrap", cursor: onSort ? "pointer" : "default" };
  const td = { padding: "7px 12px", color: C.text, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <div>
      <div style={{ overflow: "auto", maxHeight: 460, border: `1px solid ${C.border}`, borderRadius: 10 }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, width: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...th, cursor: "default", color: "#475569" }}>#</th>
              {cols.map((h, i) => (
                <th key={i} style={th} onClick={onSort ? () => onSort(i) : undefined} title={h}>
                  {h}{sortCol === i ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, ri) => (
              <tr key={ri}>
                <td style={{ ...td, color: "#475569" }}>{ri + 1}</td>
                {cols.map((_, ci) => (
                  <td key={ci} style={td} title={r[ci]}>{String(r[ci] ?? "") === "" ? <span style={{ color: "#334155" }}>—</span> : r[ci]}</td>
                ))}
              </tr>
            ))}
            {!shown.length && <tr><td style={{ ...td, color: C.muted }} colSpan={cols.length + 1}>No rows match.</td></tr>}
          </tbody>
        </table>
      </div>
      {(rows.length > max || header.length > maxCols || note) && (
        <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
          {rows.length > max && `Showing the first ${max} of ${rows.length.toLocaleString()} rows. `}
          {header.length > maxCols && `Showing the first ${maxCols} of ${header.length} columns. `}
          {rows.length > max || header.length > maxCols ? "Every calculation and download still uses the complete data. " : ""}
          {note}
        </div>
      )}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.text, cursor: "pointer", padding: "6px 0" }}>
      <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.accent, cursor: "pointer" }} />
      {label}
    </label>
  );
}

function Notice({ children, tone = "info" }) {
  const map = { info: ["rgba(45,212,191,0.08)", "rgba(45,212,191,0.25)"], warn: ["rgba(245,158,11,0.08)", "rgba(245,158,11,0.3)"], err: ["rgba(239,68,68,0.08)", "rgba(239,68,68,0.3)"] };
  const [bg, bd] = map[tone] || map.info;
  return <div style={{ background: bg, border: `1px solid ${bd}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.text, lineHeight: 1.55 }}>{children}</div>;
}

// ── Chart primitives ─────────────────────────────────────────────────────────
const PALETTES = {
  teal: { name: "Teal (site)", colors: ["#2DD4BF", "#38BDF8", "#818CF8", "#F472B6", "#FBBF24", "#34D399", "#FB7185", "#A78BFA"] },
  ocean: { name: "Ocean", colors: ["#0EA5E9", "#22D3EE", "#6366F1", "#14B8A6", "#3B82F6", "#8B5CF6", "#06B6D4", "#4F46E5"] },
  sunset: { name: "Sunset", colors: ["#F97316", "#F43F5E", "#FBBF24", "#EF4444", "#EC4899", "#FB923C", "#F59E0B", "#D946EF"] },
  forest: { name: "Forest", colors: ["#22C55E", "#84CC16", "#10B981", "#65A30D", "#14B8A6", "#4ADE80", "#A3E635", "#059669"] },
  grape: { name: "Grape", colors: ["#A855F7", "#8B5CF6", "#D946EF", "#6366F1", "#C084FC", "#7C3AED", "#E879F9", "#4F46E5"] },
  slate: { name: "Monochrome", colors: ["#94A3B8", "#CBD5E1", "#64748B", "#E2E8F0", "#475569", "#F1F5F9", "#334155", "#A8B5C4"] },
};
const PALETTE_OPTS = Object.keys(PALETTES).map((k) => [k, PALETTES[k].name]);

function niceScale(min, max, count = 5) {
  let lo = min, hi = max;
  if (!isFinite(lo) || !isFinite(hi)) { lo = 0; hi = 1; }
  if (lo === hi) { if (lo === 0) { lo = 0; hi = 1; } else { const p = Math.abs(lo) * 0.2; lo -= p; hi += p; } }
  const raw = (hi - lo) / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  step *= mag;
  const nlo = Math.floor(lo / step) * step;
  const nhi = Math.ceil(hi / step) * step;
  const ticks = [];
  for (let v = nlo, guard = 0; v <= nhi + step / 1000 && guard < 60; v += step, guard++) ticks.push(+v.toPrecision(12));
  return { lo: nlo, hi: nhi === nlo ? nlo + step : nhi, step, ticks };
}

function extentOf(values) {
  let mn = Infinity, mx = -Infinity;
  values.forEach((v) => { if (v === null || v === undefined || isNaN(v)) return; if (v < mn) mn = v; if (v > mx) mx = v; });
  if (mn === Infinity) { mn = 0; mx = 1; }
  return [mn, mx];
}

function axisLayout(o, { yMin, yMax, legendCount = 1, bottomExtra = 0 }) {
  const nice = niceScale(yMin, yMax, 5);
  let tw = 3; nice.ticks.forEach((t) => { tw = Math.max(tw, fmtNum(t).length); });
  const legendH = legendCount > 1 ? 24 : 0;
  const top = (o.title ? 44 : 16) + legendH;
  const left = 14 + tw * 7 + (o.yLabel ? 18 : 0);
  const right = 22;
  const bottom = 42 + (o.xLabel ? 20 : 0) + bottomExtra;
  const ph = Math.max(50, o.H - top - bottom);
  const pw = Math.max(60, o.W - left - right);
  const span = (nice.hi - nice.lo) || 1;
  const y = (v) => top + ph - ((v - nice.lo) / span) * ph;
  return { nice, top, left, right, bottom, pw, ph, y, x0: left, x1: left + pw, y0: top, y1: top + ph, legendY: o.title ? 34 : 8 };
}

function axisLayoutH(o, { xMin, xMax, labels, legendCount = 1 }) {
  const nice = niceScale(xMin, xMax, 5);
  const legendH = legendCount > 1 ? 24 : 0;
  const top = (o.title ? 44 : 16) + legendH;
  let lw = 4; labels.forEach((l) => { lw = Math.max(lw, String(l).length); });
  const left = Math.min(210, Math.max(56, lw * 6.6 + 14));
  const right = 46;
  const bottom = 34 + (o.xLabel ? 18 : 0);
  const pw = Math.max(60, o.W - left - right);
  const ph = Math.max(40, o.H - top - bottom);
  const span = (nice.hi - nice.lo) || 1;
  const x = (v) => left + ((v - nice.lo) / span) * pw;
  return { nice, top, left, right, bottom, pw, ph, x, x0: left, x1: left + pw, y0: top, y1: top + ph, legendY: o.title ? 34 : 8 };
}

function gridY(o, L) {
  return L.nice.ticks.map((t, i) => (
    <g key={"gy" + i}>
      <line x1={L.x0} x2={L.x1} y1={L.y(t)} y2={L.y(t)} stroke={t === 0 ? o.sub : o.grid} strokeWidth={t === 0 ? 1.3 : 1} />
      <text x={L.x0 - 8} y={L.y(t) + 4} textAnchor="end" fill={o.sub} fontSize="11">{fmtNum(t)}</text>
    </g>
  ));
}
function gridX(o, L) {
  return L.nice.ticks.map((t, i) => (
    <g key={"gx" + i}>
      <line x1={L.x(t)} x2={L.x(t)} y1={L.y0} y2={L.y1} stroke={t === 0 ? o.sub : o.grid} strokeWidth={t === 0 ? 1.3 : 1} />
      <text x={L.x(t)} y={L.y1 + 16} textAnchor="middle" fill={o.sub} fontSize="11">{fmtNum(t)}</text>
    </g>
  ));
}

function xLabelPlan(labels, pw) {
  const n = Math.max(1, labels.length);
  const slot = pw / n;
  let maxLen = 1; labels.forEach((l) => { maxLen = Math.max(maxLen, String(l).length); });
  const need = maxLen * 6.4 + 8;
  if (need <= slot) return { rotate: 0, step: 1 };
  const step = Math.max(1, Math.ceil(15 / slot));
  return { rotate: -42, step };
}

function axisXBand(o, L, labels, plan) {
  const n = Math.max(1, labels.length);
  const bw = L.pw / n;
  const out = [<line key="base" x1={L.x0} x2={L.x1} y1={L.y1} y2={L.y1} stroke={o.sub} strokeWidth="1.2" />];
  labels.forEach((lab, i) => {
    if (i % plan.step !== 0) return;
    const cx = L.x0 + bw * (i + 0.5);
    const txt = String(lab).length > 22 ? String(lab).slice(0, 21) + "…" : String(lab);
    out.push(plan.rotate
      ? <text key={"xl" + i} transform={`translate(${cx},${L.y1 + 14}) rotate(${plan.rotate})`} textAnchor="end" fill={o.sub} fontSize="11">{txt}</text>
      : <text key={"xl" + i} x={cx} y={L.y1 + 17} textAnchor="middle" fill={o.sub} fontSize="11">{txt}</text>);
  });
  return out;
}

function frameLabels(o, L) {
  const out = [];
  if (o.xLabel) out.push(<text key="xt" x={L.x0 + L.pw / 2} y={o.H - 8} textAnchor="middle" fill={o.sub} fontSize="12" fontWeight="600">{o.xLabel}</text>);
  if (o.yLabel) out.push(<text key="yt" transform={`translate(13,${L.y0 + L.ph / 2}) rotate(-90)`} textAnchor="middle" fill={o.sub} fontSize="12" fontWeight="600">{o.yLabel}</text>);
  return out;
}

function legendRow(o, names, startX = 16, y = null) {
  const yy = y === null ? (o.title ? 34 : 8) : y;
  let x = startX; const out = [];
  names.forEach((n, i) => {
    const label = String(n).length > 24 ? String(n).slice(0, 23) + "…" : String(n);
    const w = label.length * 6.4 + 26;
    if (x + w > o.W - 8) return;
    out.push(
      <g key={"lg" + i} transform={`translate(${x},${yy})`}>
        <rect width="11" height="11" rx="2.5" y="3" fill={o.pal[i % o.pal.length]} />
        <text x="17" y="12" fill={o.sub} fontSize="11">{label}</text>
      </g>
    );
    x += w;
  });
  return out;
}

function linePath(pts, mode) {
  const segs = []; let cur = [];
  pts.forEach((p) => { if (p) cur.push(p); else { if (cur.length) segs.push(cur); cur = []; } });
  if (cur.length) segs.push(cur);
  return segs.map((seg) => {
    if (seg.length === 1) return `M ${seg[0][0]} ${seg[0][1]} l 0.01 0`;
    if (mode === "step") {
      let s = `M ${seg[0][0]} ${seg[0][1]}`;
      for (let i = 1; i < seg.length; i++) s += ` L ${seg[i][0]} ${seg[i - 1][1]} L ${seg[i][0]} ${seg[i][1]}`;
      return s;
    }
    if (mode === "smooth") {
      let s = `M ${seg[0][0]} ${seg[0][1]}`;
      for (let i = 0; i < seg.length - 1; i++) {
        const p0 = seg[i - 1] || seg[i], p1 = seg[i], p2 = seg[i + 1], p3 = seg[i + 2] || seg[i + 1];
        s += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
      }
      return s;
    }
    return "M " + seg.map((p) => `${p[0]} ${p[1]}`).join(" L ");
  }).join(" ");
}

function arcPath(cx, cy, r, ri, a0, a1) {
  const pt = (a, rr) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  const large = (a1 - a0) % (Math.PI * 2) > Math.PI ? 1 : 0;
  const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
  if (ri <= 0) return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  const [x2, y2] = pt(a1, ri), [x3, y3] = pt(a0, ri);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${ri} ${ri} 0 ${large} 0 ${x3} ${y3} Z`;
}

const hexRgb = (h) => { const s = h.replace("#", ""); return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]; };
const rgbHex = (r) => "#" + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mixHex = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t)); };
const lumOf = (h) => { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

// Turn any pasted CSV into chart-ready labels + numeric series.
function chartDataFrom(text) {
  const p = parseCSV(text, {});
  if (!p.ok) return { ...p, labels: [], series: [], text };
  let rows = p.rows;
  const truncated = rows.length > MAX_CHART_ROWS;
  if (truncated) rows = rows.slice(0, MAX_CHART_ROWS);
  const labels = rows.map((r) => String(r[0] ?? "").trim());
  const series = [];
  for (let c = 1; c < p.header.length; c++) {
    const vals = rows.map((r) => { const n = toNum(r[c]); return isNaN(n) ? null : n; });
    if (vals.some((v) => v !== null)) series.push({ name: p.header[c], values: vals });
  }
  const numericLabels = labels.map(toNum);
  return { ...p, rows, labels, series, numericLabels, allNumericLabels: labels.length > 0 && numericLabels.every((v) => !isNaN(v)), truncated, totalRows: p.rows.length, text };
}

// The shared chart workbench: data input, options, live SVG, SVG + PNG export.
function ChartWorkbench({ sample, dataLabel, dataRows = 7, extras = [], W = 800, H = 460, size, draw, fileBase = "chart", defaultTitle = "", defaultX = "", defaultY = "", help }) {
  const [text, setText] = useState(sample);
  const [title, setTitle] = useState(defaultTitle);
  const [xLabel, setXLabel] = useState(defaultX);
  const [yLabel, setYLabel] = useState(defaultY);
  const [pal, setPal] = useState("teal");
  const [showVals, setShowVals] = useState("yes");
  const [bgMode, setBgMode] = useState("dark");
  const [ext, setExt] = useState(() => { const o = {}; extras.forEach((e) => { o[e.key] = e.def; }); return o; });
  const [pngErr, setPngErr] = useState(null);
  const svgRef = useRef(null);

  const data = useMemo(() => chartDataFrom(text), [text]);
  const light = bgMode === "light";
  const dims = (size && data.ok) ? size(data, ext) : { W, H };
  const o = {
    W: dims.W, H: dims.H, pal: PALETTES[pal].colors,
    fg: light ? "#0F172A" : "#E2E8F0",
    sub: light ? "#475569" : "#94A3B8",
    grid: light ? "rgba(15,23,42,0.13)" : "rgba(255,255,255,0.10)",
    bg: light ? "#FFFFFF" : "#0D1117",
    light, title, xLabel, yLabel, showVals: showVals === "yes", ...ext,
  };

  let body = null, drawErr = null;
  if (data.ok) { try { body = draw(data, o); } catch (e) { drawErr = e && e.message ? e.message : "Could not draw this data."; } }

  const base = safeName(title, fileBase);
  const set = (k, v) => setExt((s) => ({ ...s, [k]: v }));

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} label={dataLabel || "Chart data (CSV — first column is the label)"} rows={dataRows} />
      {help && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.55 }}>{help}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 12 }}>
        <div><Label>Chart title</Label><Input value={title} onChange={setTitle} placeholder="Optional title" /></div>
        <div><Label>X axis label</Label><Input value={xLabel} onChange={setXLabel} placeholder="Optional" /></div>
        <div><Label>Y axis label</Label><Input value={yLabel} onChange={setYLabel} placeholder="Optional" /></div>
        <div><Label>Colour theme</Label><SelectInput value={pal} onChange={setPal} options={PALETTE_OPTS} style={{ width: "100%" }} /></div>
        <div><Label>Value labels</Label><SelectInput value={showVals} onChange={setShowVals} options={[["yes", "Show values"], ["no", "Hide values"]]} style={{ width: "100%" }} /></div>
        <div><Label>Background</Label><SelectInput value={bgMode} onChange={setBgMode} options={[["dark", "Dark (matches site)"], ["light", "Light (for documents)"]]} style={{ width: "100%" }} /></div>
        {extras.map((x) => (
          <div key={x.key}>
            <Label>{x.label}</Label>
            {x.type === "text"
              ? <Input value={ext[x.key]} onChange={(v) => set(x.key, v)} placeholder={x.placeholder} />
              : <SelectInput value={ext[x.key]} onChange={(v) => set(x.key, v)} options={x.options} style={{ width: "100%" }} />}
          </div>
        ))}
      </div>

      {!data.ok && <Notice tone="warn">{data.error}</Notice>}
      {drawErr && <Notice tone="warn">{drawErr}</Notice>}
      {data.truncated && <Notice>Showing the first {MAX_CHART_ROWS} of {data.totalRows.toLocaleString()} rows so the chart stays readable and your browser stays fast.</Notice>}

      {data.ok && !drawErr && (
        <>
          <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 12, background: o.bg, padding: 4 }}>
            <svg ref={svgRef} viewBox={`0 0 ${o.W} ${o.H}`} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
              style={{ display: "block", width: "100%", minWidth: Math.min(o.W, 460), height: "auto", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif" }}>
              <rect x="0" y="0" width={o.W} height={o.H} fill={o.bg} />
              {title ? <text x={o.W / 2} y={27} textAnchor="middle" fill={o.fg} fontSize="17" fontWeight="700">{title}</text> : null}
              {body}
            </svg>
          </div>
          {pngErr && <Notice tone="err">{pngErr}</Notice>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.muted, marginRight: "auto" }}>SVG stays razor-sharp at any size · PNG is rasterised locally · no watermark</span>
            <Btn size="sm" variant="primary" onClick={() => downloadSvgFile(svgRef.current, base)}>⬇ SVG (vector)</Btn>
            <Btn size="sm" variant="secondary" onClick={() => { setPngErr(null); downloadSvgPng(svgRef.current, base, 2, o.bg, setPngErr); }}>⬇ PNG 2×</Btn>
            <Btn size="sm" variant="ghost" onClick={() => { setPngErr(null); downloadSvgPng(svgRef.current, base, 4, o.bg, setPngErr); }}>⬇ PNG 4×</Btn>
          </div>
        </>
      )}
    </VStack>
  );
}

const needSeries = (d) => {
  if (!d.series.length) throw new Error("No numeric columns found. Put your category names in the first column and at least one column of numbers after it.");
  return d.series;
};

// ── Sample datasets ──────────────────────────────────────────────────────────
const SAMPLE_MONTHLY = "Month,Revenue,Expenses\nJan,42000,31000\nFeb,45500,32400\nMar,51200,33800\nApr,48900,35100\nMay,56300,36000\nJun,61800,37450\nJul,59400,38900\nAug,64100,39200\nSep,70500,41000\nOct,68200,42600\nNov,75900,43800\nDec,82400,45100";
const SAMPLE_SHARE = "Channel,Sessions\nOrganic search,48210\nDirect,21940\nPaid social,15380\nEmail,9120\nReferral,6450\nAffiliate,2870";
const SAMPLE_CSV = 'id,name,email,country,plan,mrr,signup_date\n1,"Patel, Anjali",anjali@example.com,India,Pro,49,2026-01-14\n2,"O\'Neill, Sean",sean@example.com,Ireland,Starter,19,2026-01-21\n3,"Zhang, Wei",wei@example.com,Singapore,Pro,49,2026-02-02\n4,"Silva, Ana",ana@example.com,Brazil,Enterprise,199,2026-02-11\n5,"Dubois, Marc",marc@example.com,France,Starter,19,2026-02-19\n6,"Patel, Anjali",anjali@example.com,India,Pro,49,2026-01-14\n7,"Kimura, Yuki",yuki@example.com,Japan,Pro,49,2026-03-03\n8,"Adeyemi, Tolu",tolu@example.com,Nigeria,Starter,19,2026-03-12\n9,"Novak, Petra",petra@example.com,Czechia,Enterprise,199,2026-03-18\n10,"Smith, John",john@example.com,USA,Pro,49,2026-03-25';

// ══════════════════════════════════════════════════════════════════════════════
//  CHART TOOLS
// ══════════════════════════════════════════════════════════════════════════════

function BarChartMaker() {
  return (
    <ChartWorkbench
      sample={SAMPLE_MONTHLY} fileBase="bar-chart" defaultTitle="Revenue vs expenses" defaultY="Amount (USD)"
      help="First column = category label. Every column after it becomes its own coloured series with a legend."
      extras={[{ key: "gap", label: "Bar spacing", options: [["0.7", "Normal"], ["0.9", "Wide bars"], ["0.5", "Slim bars"]], def: "0.7" }]}
      draw={(d, o) => {
        const S = needSeries(d);
        const all = []; S.forEach((s) => s.values.forEach((v) => all.push(v)));
        const [mn, mx] = extentOf(all);
        const L = axisLayout(o, { yMin: Math.min(0, mn), yMax: Math.max(0, mx), legendCount: S.length });
        const n = Math.max(1, d.labels.length);
        const gw = L.pw / n;
        const bw = Math.max(1.2, (gw * parseFloat(o.gap)) / S.length);
        const zero = L.y(Math.max(L.nice.lo, Math.min(0, L.nice.hi)));
        const plan = xLabelPlan(d.labels, L.pw);
        const out = [<g key="g">{gridY(o, L)}</g>];
        S.forEach((s, si) => s.values.forEach((v, i) => {
          if (v === null) return;
          const x = L.x0 + i * gw + (gw - bw * S.length) / 2 + si * bw;
          const yv = L.y(v);
          const top = Math.min(yv, zero), h = Math.max(1, Math.abs(yv - zero));
          out.push(<rect key={`b${si}_${i}`} x={x} y={top} width={Math.max(1, bw - 2)} height={h} rx={Math.min(3, bw / 4)} fill={o.pal[si % o.pal.length]} />);
          if (o.showVals && bw >= 20 && i % plan.step === 0) out.push(<text key={`v${si}_${i}`} x={x + (bw - 2) / 2} y={v >= 0 ? top - 5 : top + h + 12} textAnchor="middle" fill={o.sub} fontSize="10">{fmtNum(v)}</text>);
        }));
        out.push(<g key="ax">{axisXBand(o, L, d.labels, plan)}</g>);
        out.push(<g key="fl">{frameLabels(o, L)}</g>);
        if (S.length > 1) out.push(<g key="lg">{legendRow(o, S.map((s) => s.name), L.x0)}</g>);
        return out;
      }}
    />
  );
}

function LineChartMaker() {
  return (
    <ChartWorkbench
      sample={SAMPLE_MONTHLY} fileBase="line-chart" defaultTitle="Revenue vs expenses" defaultY="Amount (USD)"
      help="Blank cells become gaps in the line rather than dropping to zero, so partial data stays honest."
      extras={[
        { key: "curve", label: "Line style", options: [["straight", "Straight"], ["smooth", "Smooth"], ["step", "Stepped"]], def: "straight" },
        { key: "dots", label: "Point markers", options: [["yes", "Show points"], ["no", "Line only"]], def: "yes" },
      ]}
      draw={(d, o) => {
        const S = needSeries(d);
        const all = []; S.forEach((s) => s.values.forEach((v) => all.push(v)));
        const [mn, mx] = extentOf(all);
        const L = axisLayout(o, { yMin: mn > 0 ? Math.min(0, mn) : mn, yMax: mx, legendCount: S.length });
        const n = Math.max(1, d.labels.length);
        const gw = L.pw / n;
        const plan = xLabelPlan(d.labels, L.pw);
        const out = [<g key="g">{gridY(o, L)}</g>];
        S.forEach((s, si) => {
          const col = o.pal[si % o.pal.length];
          const pts = s.values.map((v, i) => (v === null ? null : [L.x0 + gw * (i + 0.5), L.y(v)]));
          out.push(<path key={"p" + si} d={linePath(pts, o.curve)} fill="none" stroke={col} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />);
          if (o.dots === "yes" && n <= 80) pts.forEach((p, i) => p && out.push(<circle key={`c${si}_${i}`} cx={p[0]} cy={p[1]} r="3.2" fill={o.bg} stroke={col} strokeWidth="2" />));
          if (o.showVals && n <= 26) pts.forEach((p, i) => p && i % plan.step === 0 && out.push(<text key={`t${si}_${i}`} x={p[0]} y={p[1] - 9} textAnchor="middle" fill={o.sub} fontSize="10">{fmtNum(s.values[i])}</text>));
        });
        out.push(<g key="ax">{axisXBand(o, L, d.labels, plan)}</g>);
        out.push(<g key="fl">{frameLabels(o, L)}</g>);
        if (S.length > 1) out.push(<g key="lg">{legendRow(o, S.map((s) => s.name), L.x0)}</g>);
        return out;
      }}
    />
  );
}

function pieSlices(d, o) {
  const S = needSeries(d);
  const s = S[0];
  const items = d.labels.map((lab, i) => ({ label: lab || `Item ${i + 1}`, value: s.values[i] })).filter((it) => it.value !== null && it.value > 0);
  if (!items.length) throw new Error("A pie chart needs at least one value greater than zero. Check the second column of your data.");
  const total = items.reduce((a, b) => a + b.value, 0);
  return { items, total, seriesName: s.name };
}

function PieDonut({ isDonut }) {
  return (
    <ChartWorkbench
      sample={SAMPLE_SHARE} fileBase={isDonut ? "donut-chart" : "pie-chart"} defaultTitle="Traffic by channel" W={780} H={470}
      help="Two columns: a label and a positive number. Zero and negative values are skipped because a slice cannot be negative."
      extras={[
        { key: "labelMode", label: "Slice labels", options: [["pct", "Percentage"], ["value", "Value"], ["both", "Value + %"]], def: "pct" },
        ...(isDonut ? [{ key: "hole", label: "Hole size", options: [["0.45", "Medium"], ["0.62", "Large"], ["0.3", "Small"]], def: "0.55" }] : [{ key: "sort", label: "Slice order", options: [["none", "As entered"], ["desc", "Largest first"], ["asc", "Smallest first"]], def: "none" }]),
      ]}
      draw={(d, o) => {
        const { items, total, seriesName } = pieSlices(d, o);
        let list = items.slice();
        if (o.sort === "desc") list.sort((a, b) => b.value - a.value);
        if (o.sort === "asc") list.sort((a, b) => a.value - b.value);
        const legendRows = Math.ceil(list.length / 3);
        const legendH = legendRows * 20 + 10;
        const top = o.title ? 44 : 16;
        const areaH = o.H - top - legendH - 10;
        const cx = o.W / 2, cy = top + areaH / 2;
        const r = Math.max(40, Math.min(areaH / 2 - 6, o.W / 2 - 40));
        const ri = isDonut ? r * parseFloat(o.hole || 0.55) : 0;
        const out = [];
        let a = -Math.PI / 2;
        list.forEach((it, i) => {
          const frac = it.value / total;
          const a1 = a + frac * Math.PI * 2;
          const col = o.pal[i % o.pal.length];
          if (list.length === 1) {
            out.push(<circle key="one" cx={cx} cy={cy} r={r} fill={col} />);
            if (ri > 0) out.push(<circle key="onehole" cx={cx} cy={cy} r={ri} fill={o.bg} />);
          } else {
            out.push(<path key={"s" + i} d={arcPath(cx, cy, r, ri, a, a1)} fill={col} stroke={o.bg} strokeWidth="1.5" />);
          }
          if (o.showVals && frac > 0.045) {
            const mid = (a + a1) / 2;
            const lr = ri > 0 ? (r + ri) / 2 : r * 0.68;
            const tx = cx + lr * Math.cos(mid), ty = cy + lr * Math.sin(mid);
            const txt = o.labelMode === "value" ? fmtNum(it.value) : o.labelMode === "both" ? `${fmtNum(it.value)} (${(frac * 100).toFixed(0)}%)` : `${(frac * 100).toFixed(frac < 0.1 ? 1 : 0)}%`;
            out.push(<text key={"l" + i} x={tx} y={ty + 4} textAnchor="middle" fill={lumOf(col) > 0.62 ? "#0F172A" : "#FFFFFF"} fontSize="12" fontWeight="700">{txt}</text>);
          }
          a = a1;
        });
        if (isDonut && ri > 0) {
          out.push(<text key="ct" x={cx} y={cy - 2} textAnchor="middle" fill={o.fg} fontSize={ri > 60 ? "22" : "16"} fontWeight="800">{fmtNum(total)}</text>);
          out.push(<text key="cl" x={cx} y={cy + 17} textAnchor="middle" fill={o.sub} fontSize="11">{seriesName || "Total"}</text>);
        }
        const colW = o.W / 3;
        list.forEach((it, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          const lx = 20 + col * colW, ly = o.H - legendH + row * 20 + 6;
          const name = it.label.length > 20 ? it.label.slice(0, 19) + "…" : it.label;
          out.push(
            <g key={"lg" + i} transform={`translate(${lx},${ly})`}>
              <rect width="11" height="11" rx="2.5" fill={o.pal[i % o.pal.length]} />
              <text x="17" y="10" fill={o.sub} fontSize="11">{name} · {((it.value / total) * 100).toFixed(1)}%</text>
            </g>
          );
        });
        return out;
      }}
    />
  );
}
const PieChartMaker = () => <PieDonut isDonut={false} />;
const DonutChartMaker = () => <PieDonut isDonut={true} />;

function AreaChartMaker() {
  return (
    <ChartWorkbench
      sample={SAMPLE_MONTHLY} fileBase="area-chart" defaultTitle="Revenue vs expenses" defaultY="Amount (USD)"
      help="Stack the areas when the series are parts of a whole; overlap them when they are independent measures."
      extras={[{ key: "mode", label: "Layering", options: [["overlap", "Overlapping"], ["stack", "Stacked"]], def: "overlap" }]}
      draw={(d, o) => {
        const S = needSeries(d);
        const n = Math.max(1, d.labels.length);
        const stacked = o.mode === "stack";
        let mn = 0, mx = 0;
        if (stacked) {
          for (let i = 0; i < n; i++) { let t = 0; S.forEach((s) => { t += s.values[i] || 0; }); mx = Math.max(mx, t); mn = Math.min(mn, t); }
        } else {
          const all = []; S.forEach((s) => s.values.forEach((v) => all.push(v)));
          const e = extentOf(all); mn = Math.min(0, e[0]); mx = e[1];
        }
        const L = axisLayout(o, { yMin: mn, yMax: mx, legendCount: S.length });
        const gw = L.pw / n;
        const px = (i) => L.x0 + gw * (i + 0.5);
        const plan = xLabelPlan(d.labels, L.pw);
        const out = [<g key="g">{gridY(o, L)}</g>];
        const base = new Array(n).fill(0);
        S.forEach((s, si) => {
          const col = o.pal[si % o.pal.length];
          const tops = [], bots = [];
          for (let i = 0; i < n; i++) {
            const v = s.values[i];
            if (v === null && !stacked) { tops.push(null); bots.push(null); continue; }
            const b = stacked ? base[i] : 0;
            const t = b + (v || 0);
            tops.push([px(i), L.y(t)]);
            bots.push([px(i), L.y(b)]);
            if (stacked) base[i] = t;
          }
          const valid = tops.filter(Boolean);
          if (valid.length) {
            const up = linePath(tops, "straight");
            const down = bots.filter(Boolean).reverse().map((p) => `${p[0]} ${p[1]}`).join(" L ");
            out.push(<path key={"a" + si} d={`${up} L ${down} Z`} fill={col} fillOpacity={stacked ? 0.85 : 0.28} />);
            out.push(<path key={"ln" + si} d={up} fill="none" stroke={col} strokeWidth="2.2" strokeLinejoin="round" />);
          }
          if (o.showVals && n <= 20) tops.forEach((p, i) => p && s.values[i] !== null && out.push(<text key={`t${si}_${i}`} x={p[0]} y={p[1] - 7} textAnchor="middle" fill={o.sub} fontSize="10">{fmtNum(s.values[i])}</text>));
        });
        out.push(<g key="ax">{axisXBand(o, L, d.labels, plan)}</g>);
        out.push(<g key="fl">{frameLabels(o, L)}</g>);
        if (S.length > 1) out.push(<g key="lg">{legendRow(o, S.map((s) => s.name), L.x0)}</g>);
        return out;
      }}
    />
  );
}

const SAMPLE_SCATTER = "Ad spend,Revenue\n120,4300\n240,7100\n310,8250\n420,11600\n505,12900\n610,16400\n700,17100\n820,21050\n905,22400\n1010,26800\n1120,27300\n1250,31900";

function ScatterPlotMaker() {
  return (
    <ChartWorkbench
      sample={SAMPLE_SCATTER} fileBase="scatter-plot" defaultTitle="Ad spend vs revenue" defaultX="Ad spend (USD)" defaultY="Revenue (USD)"
      help="First column = X values. Every numeric column after it becomes a Y series with its own colour."
      extras={[
        { key: "psize", label: "Point size", options: [["4", "Small"], ["6", "Medium"], ["9", "Large"]], def: "6" },
        { key: "trend", label: "Trend line", options: [["no", "Off"], ["yes", "Least-squares fit"]], def: "yes" },
      ]}
      draw={(d, o) => {
        const S = needSeries(d);
        let xs, ySeries;
        if (d.allNumericLabels) { xs = d.numericLabels; ySeries = S; }
        else if (S.length >= 2) { xs = S[0].values; ySeries = S.slice(1); }
        else throw new Error("A scatter plot needs numeric X values. Put numbers in the first column, or add a second numeric column to use as X.");
        const [xmn, xmx] = extentOf(xs);
        const all = []; ySeries.forEach((s) => s.values.forEach((v) => all.push(v)));
        const [ymn, ymx] = extentOf(all);
        const L = axisLayout(o, { yMin: Math.min(0, ymn), yMax: ymx, legendCount: ySeries.length, bottomExtra: 4 });
        const xs2 = niceScale(Math.min(0, xmn), xmx, 5);
        const xspan = (xs2.hi - xs2.lo) || 1;
        const X = (v) => L.x0 + ((v - xs2.lo) / xspan) * L.pw;
        const out = [<g key="gy">{gridY(o, L)}</g>];
        out.push(<g key="gx">{xs2.ticks.map((t, i) => (
          <g key={"xt" + i}>
            <line x1={X(t)} x2={X(t)} y1={L.y0} y2={L.y1} stroke={t === 0 ? o.sub : o.grid} strokeWidth={t === 0 ? 1.3 : 1} />
            <text x={X(t)} y={L.y1 + 17} textAnchor="middle" fill={o.sub} fontSize="11">{fmtNum(t)}</text>
          </g>))}</g>);
        const r = parseFloat(o.psize) / 1.6;
        ySeries.forEach((s, si) => {
          const col = o.pal[si % o.pal.length];
          const pts = [];
          s.values.forEach((v, i) => {
            const xv = xs[i];
            if (v === null || xv === null || isNaN(xv)) return;
            pts.push([xv, v]);
            out.push(<circle key={`p${si}_${i}`} cx={X(xv)} cy={L.y(v)} r={r} fill={col} fillOpacity="0.8" stroke={col} strokeWidth="1" />);
          });
          if (o.trend === "yes" && pts.length >= 2) {
            const nn = pts.length;
            const sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
            const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0), sxx = pts.reduce((a, p) => a + p[0] * p[0], 0);
            const den = nn * sxx - sx * sx;
            if (den !== 0) {
              const m = (nn * sxy - sx * sy) / den, b = (sy - m * sx) / nn;
              out.push(<line key={"tr" + si} x1={X(xs2.lo)} y1={L.y(m * xs2.lo + b)} x2={X(xs2.hi)} y2={L.y(m * xs2.hi + b)} stroke={col} strokeWidth="1.6" strokeDasharray="6 5" opacity="0.85" />);
              if (o.showVals) out.push(<text key={"tt" + si} x={L.x1 - 4} y={L.y0 + 14 + si * 14} textAnchor="end" fill={o.sub} fontSize="11">y = {(+m.toFixed(3))}x + {(+b.toFixed(2))}</text>);
            }
          }
        });
        out.push(<line key="base" x1={L.x0} x2={L.x1} y1={L.y1} y2={L.y1} stroke={o.sub} strokeWidth="1.2" />);
        out.push(<g key="fl">{frameLabels(o, L)}</g>);
        if (ySeries.length > 1) out.push(<g key="lg">{legendRow(o, ySeries.map((s) => s.name), L.x0)}</g>);
        return out;
      }}
    />
  );
}

const SAMPLE_RANK = "Country,Customers\nUnited States,4820\nIndia,3915\nUnited Kingdom,2140\nGermany,1870\nBrazil,1520\nAustralia,1195\nCanada,1080\nSingapore,860\nNetherlands,645\nJapan,590";

function HorizontalBarChart() {
  return (
    <ChartWorkbench
      sample={SAMPLE_RANK} fileBase="horizontal-bar-chart" defaultTitle="Customers by country" defaultX="Customers"
      W={800} H={420} size={(d) => ({ W: 800, H: Math.max(260, 90 + Math.min(d.labels.length, MAX_CHART_ROWS) * 30) })}
      help="Ideal when your category names are too long to fit under vertical bars."
      extras={[{ key: "sort", label: "Bar order", options: [["none", "As entered"], ["desc", "Largest first"], ["asc", "Smallest first"]], def: "none" }]}
      draw={(d, o) => {
        const S = needSeries(d);
        const s = S[0];
        let items = d.labels.map((lab, i) => ({ label: lab || `Item ${i + 1}`, value: s.values[i] })).filter((it) => it.value !== null);
        if (!items.length) throw new Error("No numeric values found in the second column.");
        if (o.sort === "desc") items.sort((a, b) => b.value - a.value);
        if (o.sort === "asc") items.sort((a, b) => a.value - b.value);
        const [mn, mx] = extentOf(items.map((i) => i.value));
        const L = axisLayoutH(o, { xMin: Math.min(0, mn), xMax: Math.max(0, mx), labels: items.map((i) => i.label) });
        const rh = L.ph / items.length;
        const bh = Math.max(4, rh * 0.68);
        const zero = L.x(Math.max(L.nice.lo, Math.min(0, L.nice.hi)));
        const out = [<g key="g">{gridX(o, L)}</g>];
        items.forEach((it, i) => {
          const cy = L.y0 + rh * i + rh / 2;
          const xv = L.x(it.value);
          const x = Math.min(xv, zero), w = Math.max(1, Math.abs(xv - zero));
          out.push(<rect key={"b" + i} x={x} y={cy - bh / 2} width={w} height={bh} rx={Math.min(3, bh / 4)} fill={o.pal[i % o.pal.length]} />);
          const name = it.label.length > 28 ? it.label.slice(0, 27) + "…" : it.label;
          out.push(<text key={"n" + i} x={L.x0 - 8} y={cy + 4} textAnchor="end" fill={o.fg} fontSize={rh < 20 ? "10" : "12"}>{name}</text>);
          if (o.showVals) out.push(<text key={"v" + i} x={it.value >= 0 ? x + w + 6 : x - 6} y={cy + 4} textAnchor={it.value >= 0 ? "start" : "end"} fill={o.sub} fontSize="11">{fmtNum(it.value)}</text>);
        });
        out.push(<line key="ax" x1={zero} x2={zero} y1={L.y0} y2={L.y1} stroke={o.sub} strokeWidth="1.2" />);
        if (o.xLabel) out.push(<text key="xt" x={L.x0 + L.pw / 2} y={o.H - 6} textAnchor="middle" fill={o.sub} fontSize="12" fontWeight="600">{o.xLabel}</text>);
        return out;
      }}
    />
  );
}

const SAMPLE_STACK = "Quarter,Subscriptions,Services,Hardware\nQ1,42000,18500,9200\nQ2,47500,21000,8700\nQ3,52800,19400,11300\nQ4,61200,24700,12600";

function StackedBarChart() {
  return (
    <ChartWorkbench
      sample={SAMPLE_STACK} fileBase="stacked-bar-chart" defaultTitle="Revenue mix by quarter" defaultY="Revenue (USD)"
      help="First column = category. Every column after it becomes one stacked segment of that bar."
      extras={[{ key: "mode", label: "Stack mode", options: [["abs", "Absolute values"], ["pct", "100% share"]], def: "abs" }]}
      draw={(d, o) => {
        const S = needSeries(d);
        const n = Math.max(1, d.labels.length);
        const pct = o.mode === "pct";
        const totals = [];
        for (let i = 0; i < n; i++) { let t = 0; S.forEach((s) => { t += Math.max(0, s.values[i] || 0); }); totals.push(t); }
        const mx = pct ? 100 : Math.max(1, ...totals);
        const L = axisLayout(o, { yMin: 0, yMax: mx, legendCount: S.length });
        const gw = L.pw / n;
        const bw = Math.min(70, gw * 0.62);
        const plan = xLabelPlan(d.labels, L.pw);
        const out = [<g key="g">{gridY(o, L)}</g>];
        for (let i = 0; i < n; i++) {
          let acc = 0;
          const x = L.x0 + gw * i + (gw - bw) / 2;
          S.forEach((s, si) => {
            const raw = Math.max(0, s.values[i] || 0);
            if (raw <= 0) return;
            const v = pct ? (totals[i] ? (raw / totals[i]) * 100 : 0) : raw;
            const y1 = L.y(acc), y2 = L.y(acc + v);
            const h = Math.max(0.5, y1 - y2);
            out.push(<rect key={`s${i}_${si}`} x={x} y={y2} width={bw} height={h} fill={o.pal[si % o.pal.length]} />);
            if (o.showVals && h >= 15 && bw >= 34) {
              const col = o.pal[si % o.pal.length];
              out.push(<text key={`t${i}_${si}`} x={x + bw / 2} y={y2 + h / 2 + 4} textAnchor="middle" fill={lumOf(col) > 0.62 ? "#0F172A" : "#FFFFFF"} fontSize="10" fontWeight="600">{pct ? v.toFixed(0) + "%" : fmtNum(raw)}</text>);
            }
            acc += v;
          });
          if (o.showVals && !pct) out.push(<text key={"tot" + i} x={x + bw / 2} y={L.y(acc) - 6} textAnchor="middle" fill={o.sub} fontSize="10" fontWeight="600">{fmtNum(totals[i])}</text>);
        }
        out.push(<g key="ax">{axisXBand(o, L, d.labels, plan)}</g>);
        out.push(<g key="fl">{frameLabels(o, L)}</g>);
        out.push(<g key="lg">{legendRow(o, S.map((s) => s.name), L.x0)}</g>);
        return out;
      }}
    />
  );
}

function SparklineGenerator() {
  return (
    <ChartWorkbench
      sample="12, 15, 14, 19, 23, 21, 27, 30, 28, 34, 39, 37, 44, 48, 46, 53"
      dataLabel="Numbers (separated by commas, spaces or new lines)" dataRows={4}
      fileBase="sparkline" W={480} H={130}
      help="A sparkline is a word-sized chart with no axes, made to sit inline in a table, a dashboard cell or a sentence."
      extras={[
        { key: "fill", label: "Area fill", options: [["yes", "Filled"], ["no", "Line only"]], def: "yes" },
        { key: "marks", label: "Markers", options: [["yes", "Min, max & last"], ["no", "None"]], def: "yes" },
        { key: "curve", label: "Line style", options: [["straight", "Straight"], ["smooth", "Smooth"]], def: "smooth" },
      ]}
      draw={(d, o) => {
        const nums = String(d.text).split(/[\s,;|]+/).map(toNum).filter((v) => !isNaN(v));
        if (nums.length < 2) throw new Error("Enter at least two numbers separated by commas, spaces or new lines.");
        const vals = nums.slice(0, 400);
        const [mn, mx] = extentOf(vals);
        const top = o.title ? 42 : 14, bottom = 22;
        const x0 = 14, x1 = o.W - 14, y0 = top, y1 = o.H - bottom;
        const span = (mx - mn) || 1;
        const X = (i) => x0 + (i / (vals.length - 1)) * (x1 - x0);
        const Y = (v) => y1 - ((v - mn) / span) * (y1 - y0);
        const pts = vals.map((v, i) => [X(i), Y(v)]);
        const col = o.pal[0];
        const out = [];
        const path = linePath(pts, o.curve);
        if (o.fill === "yes") out.push(<path key="f" d={`${path} L ${x1} ${y1} L ${x0} ${y1} Z`} fill={col} fillOpacity="0.18" />);
        out.push(<path key="l" d={path} fill="none" stroke={col} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />);
        if (o.marks === "yes") {
          const iMin = vals.indexOf(mn), iMax = vals.indexOf(mx), iLast = vals.length - 1;
          out.push(<circle key="mn" cx={X(iMin)} cy={Y(mn)} r="3.6" fill={o.pal[3] || "#F472B6"} />);
          out.push(<circle key="mx" cx={X(iMax)} cy={Y(mx)} r="3.6" fill={o.pal[1] || "#38BDF8"} />);
          out.push(<circle key="ls" cx={X(iLast)} cy={Y(vals[iLast])} r="4" fill={col} stroke={o.bg} strokeWidth="1.5" />);
        }
        if (o.showVals) {
          out.push(<text key="tl" x={x0} y={o.H - 7} fill={o.sub} fontSize="10">min {fmtNum(mn)}</text>);
          out.push(<text key="tr" x={x1} y={o.H - 7} textAnchor="end" fill={o.sub} fontSize="10">max {fmtNum(mx)} · last {fmtNum(vals[vals.length - 1])}</text>);
        }
        return out;
      }}
    />
  );
}

function GaugeChartMaker() {
  return (
    <ChartWorkbench
      sample="Metric,Value\nSLA attainment,87.4"
      dataLabel="Value (label, number — only the first row is used)" dataRows={3}
      fileBase="gauge-chart" W={520} H={340} defaultTitle="SLA attainment"
      help="A gauge shows one number against a known range — utilisation, completion, a score or target attainment."
      extras={[
        { key: "min", label: "Scale minimum", type: "text", def: "0", placeholder: "0" },
        { key: "max", label: "Scale maximum", type: "text", def: "100", placeholder: "100" },
        { key: "target", label: "Target marker", type: "text", def: "95", placeholder: "optional" },
        { key: "unit", label: "Unit suffix", type: "text", def: "%", placeholder: "e.g. % or ms" },
      ]}
      draw={(d, o) => {
        let value = null, caption = "";
        if (d.series.length && d.series[0].values.length) { value = d.series[0].values.find((v) => v !== null); caption = d.labels[0] || d.series[0].name; }
        if (value === null || value === undefined) { const n = toNum(String(d.text).split(/[\s,]+/).find((t) => isNum(t))); value = isNaN(n) ? null : n; }
        if (value === null || value === undefined || isNaN(value)) throw new Error("Enter a value like: SLA attainment, 87.4");
        const lo = toNum(o.min), hi = toNum(o.max);
        const mn = isNaN(lo) ? 0 : lo, mx = isNaN(hi) ? 100 : hi;
        if (mx <= mn) throw new Error("The scale maximum must be greater than the scale minimum.");
        const tgt = toNum(o.target);
        const frac = Math.max(0, Math.min(1, (value - mn) / (mx - mn)));
        const cx = o.W / 2, cy = o.H - 68, r = Math.min(o.W / 2 - 34, o.H - 130);
        const ri = r * 0.62;
        const A0 = Math.PI, A1 = Math.PI * 2;
        const ang = (f) => A0 + f * (A1 - A0);
        const out = [];
        out.push(<path key="track" d={arcPath(cx, cy, r, ri, A0, A1)} fill={o.light ? "#E2E8F0" : "rgba(255,255,255,0.07)"} />);
        const steps = 40;
        for (let i = 0; i < steps; i++) {
          const f0 = i / steps, f1 = (i + 1) / steps;
          if (f0 >= frac) break;
          const f = Math.min(f1, frac);
          out.push(<path key={"a" + i} d={arcPath(cx, cy, r, ri, ang(f0), ang(f))} fill={mixHex(o.pal[0], o.pal[3] || o.pal[1], f0)} />);
        }
        [0, 0.25, 0.5, 0.75, 1].forEach((f, i) => {
          const a = ang(f);
          out.push(<line key={"tk" + i} x1={cx + (r + 3) * Math.cos(a)} y1={cy + (r + 3) * Math.sin(a)} x2={cx + (r + 10) * Math.cos(a)} y2={cy + (r + 10) * Math.sin(a)} stroke={o.sub} strokeWidth="1.4" />);
          out.push(<text key={"tl" + i} x={cx + (r + 22) * Math.cos(a)} y={cy + (r + 22) * Math.sin(a) + 4} textAnchor="middle" fill={o.sub} fontSize="10">{fmtNum(mn + f * (mx - mn))}</text>);
        });
        if (!isNaN(tgt) && tgt >= mn && tgt <= mx) {
          const a = ang((tgt - mn) / (mx - mn));
          out.push(<line key="tg" x1={cx + (ri - 4) * Math.cos(a)} y1={cy + (ri - 4) * Math.sin(a)} x2={cx + (r + 6) * Math.cos(a)} y2={cy + (r + 6) * Math.sin(a)} stroke={o.light ? "#0F172A" : "#F8FAFC"} strokeWidth="2.4" />);
          out.push(<text key="tgl" x={cx + (r + 24) * Math.cos(a)} y={cy + (r + 24) * Math.sin(a) - 6} textAnchor="middle" fill={o.fg} fontSize="10" fontWeight="700">target {fmtNum(tgt)}</text>);
        }
        const na = ang(frac);
        out.push(<line key="nd" x1={cx} y1={cy} x2={cx + (r - 6) * Math.cos(na)} y2={cy + (r - 6) * Math.sin(na)} stroke={o.fg} strokeWidth="3" strokeLinecap="round" />);
        out.push(<circle key="hub" cx={cx} cy={cy} r="7" fill={o.fg} />);
        out.push(<text key="val" x={cx} y={cy + 42} textAnchor="middle" fill={o.fg} fontSize="30" fontWeight="800">{fmtNum(value)}{o.unit || ""}</text>);
        if (o.showVals) out.push(<text key="cap" x={cx} y={cy + 62} textAnchor="middle" fill={o.sub} fontSize="12">{caption || "Value"} · {(frac * 100).toFixed(1)}% of range</text>);
        return out;
      }}
    />
  );
}

const SAMPLE_HEAT = "Hour,Mon,Tue,Wed,Thu,Fri,Sat,Sun\n08:00,12,15,14,18,21,6,4\n10:00,34,41,38,44,49,14,9\n12:00,52,58,55,61,67,25,17\n14:00,48,54,51,57,63,29,21\n16:00,39,45,42,47,52,31,24\n18:00,27,31,29,33,41,35,28\n20:00,15,18,17,20,29,33,26";

function HeatmapGenerator() {
  return (
    <ChartWorkbench
      sample={SAMPLE_HEAT} fileBase="heatmap" defaultTitle="Sessions by hour and weekday"
      W={820} H={460} size={(d) => ({ W: 820, H: Math.max(260, 130 + Math.min(d.rows.length, 60) * 34) })}
      help="Column headings in the first row, row names in the first column, numbers everywhere else — exactly what you get pasting a block out of a spreadsheet."
      extras={[{ key: "scale", label: "Colour scale", options: [["seq", "Sequential (low to high)"], ["div", "Diverging (around zero)"]], def: "seq" }]}
      draw={(d, o) => {
        const cols = d.header.slice(1);
        const rowsRaw = d.rows.slice(0, 60);
        if (!cols.length || !rowsRaw.length) throw new Error("Paste a grid: column headings in the first row and a row name plus numbers on every line after it.");
        const matrix = rowsRaw.map((r) => cols.map((_, c) => { const v = toNum(r[c + 1]); return isNaN(v) ? null : v; }));
        const flat = []; matrix.forEach((r) => r.forEach((v) => flat.push(v)));
        if (!flat.some((v) => v !== null)) throw new Error("No numeric cells found in the grid. Check that the values are plain numbers.");
        const [mn, mx] = extentOf(flat);
        const diverging = o.scale === "div";
        const lim = Math.max(Math.abs(mn), Math.abs(mx)) || 1;
        const lowC = diverging ? (o.pal[3] || "#F472B6") : (o.light ? "#EAF7F5" : "#0F2A2A");
        const midC = o.light ? "#F1F5F9" : "#111827";
        const highC = o.pal[0];
        const colorOf = (v) => {
          if (v === null) return o.light ? "#F1F5F9" : "rgba(255,255,255,0.04)";
          if (diverging) { const t = v / lim; return t >= 0 ? mixHex(midC, highC, Math.min(1, t)) : mixHex(midC, lowC, Math.min(1, -t)); }
          return mixHex(lowC, highC, (mx - mn) ? (v - mn) / (mx - mn) : 0.5);
        };
        const top = (o.title ? 46 : 18) + 20;
        const left = Math.min(120, Math.max(52, rowsRaw.reduce((m, r) => Math.max(m, String(r[0]).length), 4) * 6.6 + 12));
        const right = 16, bottom = 52;
        const gw = (o.W - left - right) / cols.length;
        const gh = (o.H - top - bottom) / rowsRaw.length;
        const out = [];
        cols.forEach((c, i) => {
          const name = String(c).length > 10 ? String(c).slice(0, 9) + "…" : String(c);
          out.push(<text key={"ch" + i} x={left + gw * (i + 0.5)} y={top - 8} textAnchor="middle" fill={o.sub} fontSize="11">{name}</text>);
        });
        matrix.forEach((row, ri) => {
          const rname = String(rowsRaw[ri][0]);
          out.push(<text key={"rh" + ri} x={left - 8} y={top + gh * (ri + 0.5) + 4} textAnchor="end" fill={o.sub} fontSize="11">{rname.length > 16 ? rname.slice(0, 15) + "…" : rname}</text>);
          row.forEach((v, ci) => {
            const fill = colorOf(v);
            out.push(<rect key={`c${ri}_${ci}`} x={left + gw * ci + 1} y={top + gh * ri + 1} width={Math.max(1, gw - 2)} height={Math.max(1, gh - 2)} rx="3" fill={fill} />);
            if (o.showVals && gw > 30 && gh > 18 && v !== null) {
              const dark = fill.startsWith("#") ? lumOf(fill) > 0.58 : true;
              out.push(<text key={`v${ri}_${ci}`} x={left + gw * (ci + 0.5)} y={top + gh * (ri + 0.5) + 4} textAnchor="middle" fill={dark ? "#0F172A" : "#F8FAFC"} fontSize={gw < 46 ? "9" : "11"} fontWeight="600">{fmtNum(v)}</text>);
            }
          });
        });
        const lx = left, ly = o.H - 26, lw = Math.min(260, o.W - left - right);
        for (let i = 0; i < 40; i++) {
          const t = i / 39;
          const v = diverging ? -lim + t * 2 * lim : mn + t * (mx - mn);
          out.push(<rect key={"sc" + i} x={lx + (lw / 40) * i} y={ly} width={lw / 40 + 0.6} height="10" fill={colorOf(v)} />);
        }
        out.push(<text key="scl" x={lx} y={ly + 22} fill={o.sub} fontSize="10">{fmtNum(diverging ? -lim : mn)}</text>);
        out.push(<text key="sch" x={lx + lw} y={ly + 22} textAnchor="end" fill={o.sub} fontSize="10">{fmtNum(diverging ? lim : mx)}</text>);
        return out;
      }}
    />
  );
}

const SAMPLE_GANTT = "Task,Start,End,Progress\nDiscovery & research,2026-01-05,2026-01-30,100\nUX wireframes,2026-01-26,2026-02-20,100\nVisual design,2026-02-16,2026-03-13,80\nFrontend build,2026-03-02,2026-04-24,45\nBackend API,2026-03-09,2026-05-01,35\nQA & bug fixing,2026-04-20,2026-05-22,0\nBeta launch,2026-05-25,2026-06-05,0";

function GanttChartMaker() {
  return (
    <ChartWorkbench
      sample={SAMPLE_GANTT} fileBase="gantt-chart" defaultTitle="Project plan"
      W={860} H={420} size={(d) => ({ W: 860, H: Math.max(240, 110 + Math.min(d.rows.length, 60) * 32) })}
      help="One task per line: name, start date, end date and an optional progress percentage. ISO dates like 2026-03-14 are the safest."
      extras={[{ key: "today", label: "Today marker", options: [["yes", "Show"], ["no", "Hide"]], def: "yes" }]}
      draw={(d, o) => {
        const parsed = [], skipped = [];
        d.rows.slice(0, 60).forEach((r) => {
          const name = String(r[0] || "").trim();
          const s = Date.parse(String(r[1] || "").trim()), e = Date.parse(String(r[2] || "").trim());
          const prog = toNum(r[3]);
          if (!name || isNaN(s) || isNaN(e)) { if (name) skipped.push(name); return; }
          parsed.push({ name, s, e: Math.max(e, s + 86400000), prog: isNaN(prog) ? null : Math.max(0, Math.min(100, prog)) });
        });
        if (!parsed.length) throw new Error("No task had a readable start and end date. Use a format like: Design, 2026-03-01, 2026-03-20");
        const minT = Math.min(...parsed.map((p) => p.s)), maxT = Math.max(...parsed.map((p) => p.e));
        const span = (maxT - minT) || 86400000;
        const top = (o.title ? 46 : 18) + 22;
        const left = Math.min(210, Math.max(90, parsed.reduce((m, p) => Math.max(m, p.name.length), 6) * 6.4 + 14));
        const right = 24, bottom = 34;
        const pw = o.W - left - right;
        const rh = (o.H - top - bottom) / parsed.length;
        const X = (t) => left + ((t - minT) / span) * pw;
        const out = [];
        const ticks = [];
        const start = new Date(minT); start.setDate(1);
        for (let dt = new Date(start.getFullYear(), start.getMonth(), 1); dt.getTime() <= maxT; dt = new Date(dt.getFullYear(), dt.getMonth() + 1, 1)) {
          if (dt.getTime() >= minT - 86400000 * 31) ticks.push(new Date(dt));
          if (ticks.length > 40) break;
        }
        ticks.forEach((t, i) => {
          const x = X(t.getTime());
          if (x < left - 1 || x > left + pw + 1) return;
          out.push(<line key={"g" + i} x1={x} x2={x} y1={top - 6} y2={top + rh * parsed.length} stroke={o.grid} strokeWidth="1" />);
          out.push(<text key={"gl" + i} x={x + 4} y={top - 10} fill={o.sub} fontSize="10">{t.toLocaleDateString(undefined, { month: "short", year: "2-digit" })}</text>);
        });
        parsed.forEach((p, i) => {
          const y = top + rh * i + rh * 0.2, h = Math.max(8, rh * 0.6);
          const x = X(p.s), w = Math.max(3, X(p.e) - X(p.s));
          const col = o.pal[i % o.pal.length];
          out.push(<text key={"n" + i} x={left - 8} y={y + h / 2 + 4} textAnchor="end" fill={o.fg} fontSize={rh < 24 ? "10" : "12"}>{p.name.length > 30 ? p.name.slice(0, 29) + "…" : p.name}</text>);
          out.push(<rect key={"b" + i} x={x} y={y} width={w} height={h} rx={Math.min(4, h / 3)} fill={col} fillOpacity="0.35" stroke={col} strokeWidth="1" />);
          if (p.prog !== null && p.prog > 0) out.push(<rect key={"p" + i} x={x} y={y} width={Math.max(2, (w * p.prog) / 100)} height={h} rx={Math.min(4, h / 3)} fill={col} />);
          if (o.showVals) {
            const days = Math.round((p.e - p.s) / 86400000);
            out.push(<text key={"d" + i} x={x + w + 6} y={y + h / 2 + 4} fill={o.sub} fontSize="10">{days}d{p.prog !== null ? ` · ${p.prog}%` : ""}</text>);
          }
        });
        if (o.today === "yes") {
          const now = Date.now();
          if (now >= minT && now <= maxT) {
            const x = X(now);
            out.push(<line key="td" x1={x} x2={x} y1={top - 6} y2={top + rh * parsed.length} stroke={o.pal[3] || "#F472B6"} strokeWidth="1.6" strokeDasharray="4 4" />);
            out.push(<text key="tdl" x={x + 4} y={top + rh * parsed.length + 14} fill={o.pal[3] || "#F472B6"} fontSize="10" fontWeight="700">today</text>);
          }
        }
        if (skipped.length) out.push(<text key="sk" x={left} y={o.H - 8} fill={o.sub} fontSize="10">Skipped (unreadable dates): {skipped.slice(0, 4).join(", ")}{skipped.length > 4 ? "…" : ""}</text>);
        return out;
      }}
    />
  );
}

const SAMPLE_ORG = "Asha Menon, CEO\n  Ravi Kapoor, CTO\n    Lena Fischer, Eng Manager\n      Tom Baker, Backend\n      Nia Owusu, Frontend\n    Sam Wright, Data Lead\n  Maya Iyer, CFO\n    Jon Park, Controller\n  Elena Rossi, CMO\n    Dana Lee, Content\n    Omar Haddad, Growth";

function OrgChartMaker() {
  const buildTree = (text) => {
    const lines = splitLines(text).filter((l) => l.trim() !== "");
    const root = { children: [], depth: -1 };
    const stack = [root];
    lines.forEach((raw) => {
      const indent = (raw.match(/^[\t ]*/) || [""])[0].replace(/\t/g, "  ").length;
      const depth = Math.floor(indent / 2);
      const body = raw.trim();
      const parts = body.split(/\s*[,|]\s*/);
      const node = { name: parts[0], title: parts.slice(1).join(", "), children: [], depth };
      while (stack.length > 1 && stack[stack.length - 1].depth >= depth) stack.pop();
      stack[stack.length - 1].children.push(node);
      stack.push(node);
    });
    return root;
  };
  const countLeaves = (n) => (n.children.length ? n.children.reduce((a, c) => a + countLeaves(c), 0) : 1);
  const maxDepth = (n) => (n.children.length ? 1 + Math.max(...n.children.map(maxDepth)) : 1);

  return (
    <ChartWorkbench
      sample={SAMPLE_ORG} dataLabel="Hierarchy — one person per line, indent two spaces per level" dataRows={10}
      fileBase="org-chart" defaultTitle="Organisation chart" W={900} H={420}
      size={(d) => {
        const root = buildTree(d.text);
        const leaves = Math.max(1, root.children.reduce((a, c) => a + countLeaves(c), 0));
        const depth = root.children.length ? Math.max(...root.children.map(maxDepth)) : 1;
        return { W: Math.max(560, Math.min(2600, leaves * 150 + 60)), H: Math.max(220, 70 + depth * 108) };
      }}
      help="Indent with two spaces (or a tab) per level. Add a comma after the name for a job title."
      extras={[]}
      draw={(d, o) => {
        const root = buildTree(d.text);
        if (!root.children.length) throw new Error("Type at least one person, then indent their reports underneath.");
        const leaves = Math.max(1, root.children.reduce((a, c) => a + countLeaves(c), 0));
        const top = (o.title ? 48 : 18);
        const slot = (o.W - 40) / leaves;
        const boxW = Math.max(74, Math.min(150, slot - 16));
        const boxH = 46, vGap = 108;
        const out = [];
        let cursor = 0;
        const place = (node, depth) => {
          let cx;
          if (!node.children.length) { cx = 20 + slot * (cursor + 0.5); cursor += 1; }
          else { const kids = node.children.map((c) => place(c, depth + 1)); cx = (kids[0].cx + kids[kids.length - 1].cx) / 2; }
          const cy = top + depth * vGap;
          return { cx, cy, node, depth };
        };
        const nodes = [];
        const walk = (node, depth) => {
          const pos = place(node, depth);
          return pos;
        };
        const layout = (node, depth) => {
          let pos;
          if (!node.children.length) { pos = { cx: 20 + slot * (cursor + 0.5), cy: top + depth * vGap, node }; cursor += 1; }
          else {
            const kids = node.children.map((c) => layout(c, depth + 1));
            pos = { cx: (kids[0].cx + kids[kids.length - 1].cx) / 2, cy: top + depth * vGap, node, kids };
          }
          nodes.push(pos);
          return pos;
        };
        root.children.forEach((c) => layout(c, 0));
        nodes.forEach((p, i) => {
          if (!p.kids) return;
          const midY = p.cy + boxH / 2 + (vGap - boxH) / 2;
          out.push(<line key={"cd" + i} x1={p.cx} y1={p.cy + boxH / 2} x2={p.cx} y2={midY} stroke={o.sub} strokeWidth="1.3" />);
          out.push(<line key={"ch" + i} x1={p.kids[0].cx} y1={midY} x2={p.kids[p.kids.length - 1].cx} y2={midY} stroke={o.sub} strokeWidth="1.3" />);
          p.kids.forEach((k, j) => out.push(<line key={`cv${i}_${j}`} x1={k.cx} y1={midY} x2={k.cx} y2={k.cy - boxH / 2} stroke={o.sub} strokeWidth="1.3" />));
        });
        nodes.forEach((p, i) => {
          const col = o.pal[(p.node.depth + 8) % o.pal.length] || o.pal[0];
          const name = p.node.name.length > 18 ? p.node.name.slice(0, 17) + "…" : p.node.name;
          const title = String(p.node.title || "");
          out.push(
            <g key={"n" + i}>
              <rect x={p.cx - boxW / 2} y={p.cy - boxH / 2} width={boxW} height={boxH} rx="8" fill={o.light ? "#F8FAFC" : "rgba(255,255,255,0.05)"} stroke={col} strokeWidth="1.6" />
              <text x={p.cx} y={p.cy - (title ? 2 : -5)} textAnchor="middle" fill={o.fg} fontSize="12" fontWeight="700">{name}</text>
              {title ? <text x={p.cx} y={p.cy + 14} textAnchor="middle" fill={o.sub} fontSize="10">{title.length > 22 ? title.slice(0, 21) + "…" : title}</text> : null}
            </g>
          );
        });
        return out;
      }}
    />
  );
}

const SAMPLE_TIMELINE = "2021-03-01,Company founded,Two people and a prototype\n2022-06-15,Seed round,$2.4M raised to build the team\n2023-02-10,Public launch,First 1,000 paying customers\n2024-09-05,Series A,Expanded into three new markets\n2026-01-20,100k users,Crossed six figures of active users";

function TimelineMaker() {
  return (
    <ChartWorkbench
      sample={SAMPLE_TIMELINE} dataLabel="Events — date, title, optional description (one per line)" dataRows={7}
      fileBase="timeline" defaultTitle="Company milestones" W={880} H={360}
      size={(d, ext) => (ext.orient === "vertical" ? { W: 720, H: Math.max(240, 80 + Math.min(d.rows.length, 40) * 74) } : { W: 880, H: 360 })}
      help="Horizontal spaces events by their real dates. Vertical lists them in order and gives longer descriptions more room."
      extras={[{ key: "orient", label: "Orientation", options: [["horizontal", "Horizontal"], ["vertical", "Vertical"]], def: "horizontal" }]}
      draw={(d, o) => {
        const items = d.rows.slice(0, 40).map((r) => {
          const raw = String(r[0] || "").trim();
          const t = Date.parse(raw);
          return { raw, t: isNaN(t) ? null : t, title: String(r[1] || "").trim(), desc: String(r[2] || "").trim() };
        }).filter((i) => i.raw || i.title);
        if (!items.length) throw new Error("Add at least one event as: 2026-01-20, Launch day, optional description");
        const dated = items.filter((i) => i.t !== null);
        const out = [];
        if (o.orient === "vertical") {
          const top = (o.title ? 52 : 22);
          const x = 92, rowH = (o.H - top - 24) / items.length;
          out.push(<line key="ax" x1={x} y1={top} x2={x} y2={top + rowH * (items.length - 1) + 10} stroke={o.grid} strokeWidth="2.5" />);
          items.forEach((it, i) => {
            const y = top + rowH * i + 10;
            const col = o.pal[i % o.pal.length];
            out.push(<circle key={"d" + i} cx={x} cy={y} r="7" fill={col} stroke={o.bg} strokeWidth="2.5" />);
            out.push(<text key={"dt" + i} x={x - 16} y={y + 4} textAnchor="end" fill={o.sub} fontSize="11" fontWeight="600">{it.t ? new Date(it.t).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : it.raw}</text>);
            out.push(<text key={"tt" + i} x={x + 18} y={y - 1} fill={o.fg} fontSize="13" fontWeight="700">{it.title.slice(0, 52)}</text>);
            if (it.desc && o.showVals) out.push(<text key={"ds" + i} x={x + 18} y={y + 16} fill={o.sub} fontSize="11">{it.desc.slice(0, 64)}</text>);
          });
          return out;
        }
        const top = (o.title ? 52 : 24);
        const y = o.H / 2 + 6, x0 = 46, x1 = o.W - 46;
        let pos;
        if (dated.length >= 2) {
          const mn = Math.min(...dated.map((i) => i.t)), mx = Math.max(...dated.map((i) => i.t));
          const span = (mx - mn) || 1;
          pos = items.map((it, i) => (it.t !== null ? x0 + ((it.t - mn) / span) * (x1 - x0) : x0 + ((i + 0.5) / items.length) * (x1 - x0)));
        } else {
          pos = items.map((_, i) => x0 + ((i + 0.5) / items.length) * (x1 - x0));
        }
        out.push(<line key="ax" x1={x0} y1={y} x2={x1} y2={y} stroke={o.grid} strokeWidth="2.5" />);
        items.forEach((it, i) => {
          const px = pos[i], up = i % 2 === 0;
          const col = o.pal[i % o.pal.length];
          const ty = up ? y - 24 : y + 24;
          out.push(<line key={"s" + i} x1={px} y1={y} x2={px} y2={ty} stroke={col} strokeWidth="1.6" />);
          out.push(<circle key={"c" + i} cx={px} cy={y} r="6.5" fill={col} stroke={o.bg} strokeWidth="2.5" />);
          out.push(<text key={"t" + i} x={px} y={up ? ty - 16 : ty + 14} textAnchor="middle" fill={o.fg} fontSize="12" fontWeight="700">{it.title.slice(0, 22)}</text>);
          out.push(<text key={"d" + i} x={px} y={up ? ty - 3 : ty + 27} textAnchor="middle" fill={o.sub} fontSize="10">{it.t ? new Date(it.t).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : it.raw}</text>);
          if (it.desc && o.showVals) out.push(<text key={"x" + i} x={px} y={up ? ty - 30 : ty + 40} textAnchor="middle" fill={o.sub} fontSize="10">{it.desc.slice(0, 26)}</text>);
        });
        return out;
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CSV TOOLS
// ══════════════════════════════════════════════════════════════════════════════

function useCsv(sample) {
  const [text, setText] = useState(sample);
  const [delim, setDelim] = useState("auto");
  const [header, setHeader] = useState("auto");
  const parsed = useMemo(() => parseCSV(text, { delim, header }), [text, delim, header]);
  return { text, setText, delim, setDelim, header, setHeader, parsed };
}

function ExportRow({ csv, name, extra }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
      {extra}
      <CopyBtn text={csv} />
      <Btn size="sm" variant="primary" onClick={() => downloadText(name, csv, "text/csv")}>⬇ Download CSV</Btn>
    </div>
  );
}

function CsvViewer() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_CSV);
  const [q, setQ] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const rows = useMemo(() => {
    if (!parsed.ok) return [];
    let r = parsed.rows;
    const needle = q.trim().toLowerCase();
    if (needle) r = r.filter((row) => row.some((c) => String(c).toLowerCase().includes(needle)));
    if (sortCol !== null) {
      r = r.slice().sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        const an = toNum(av), bn = toNum(bv);
        const cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return r;
  }, [parsed, q, sortCol, sortDir]);
  const onSort = (i) => { if (sortCol === i) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortCol(i); setSortDir("asc"); } };

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <StatBox value={parsed.rows.length.toLocaleString()} label="Data rows" />
            <StatBox value={parsed.header.length} label="Columns" />
            <StatBox value={rows.length.toLocaleString()} label="Matching rows" />
            <StatBox value={DELIM_NAME[parsed.delim] || parsed.delim} label="Delimiter" />
            <StatBox value={parsed.hasHeader ? "Yes" : "No"} label="Header row" />
          </div>
          <div><Label>Search all columns</Label><Input value={q} onChange={setQ} placeholder="Type to filter rows…" /></div>
          <PreviewTable header={parsed.header} rows={rows} max={200} onSort={onSort} sortCol={sortCol} sortDir={sortDir} note="Click a column heading to sort." />
          <ExportRow csv={toCSV(parsed.header, rows, ",", parsed.hasHeader)} name="filtered.csv" />
        </>
      )}
    </VStack>
  );
}

const SAMPLE_MESSY = '  Name , Email ,  Notes ,,\n  Alice   , alice@example.com ,"Said ""yes"", then called back" ,,\n\n Bob ,bob@example.com , "Multi-line\nnote here" ,,\n\n\n  Chen ,chen@example.com,  ,,';

function CsvCleaner() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_MESSY);
  const [trim, setTrim] = useState(true);
  const [dropRows, setDropRows] = useState(true);
  const [dropCols, setDropCols] = useState(true);
  const [collapse, setCollapse] = useState(true);
  const [eol, setEol] = useState("crlf");
  const [outDelim, setOutDelim] = useState(",");

  const result = useMemo(() => {
    if (!parsed.ok) return null;
    let head = parsed.header.slice();
    let rows = parsed.rows.map((r) => r.slice());
    const before = { rows: rows.length, cols: head.length };
    if (trim) { head = head.map((h) => String(h).trim()); rows = rows.map((r) => r.map((c) => String(c).trim())); }
    if (collapse) rows = rows.map((r) => r.map((c) => String(c).replace(/[ \t]+/g, " ")));
    if (dropRows) rows = rows.filter((r) => r.some((c) => String(c).trim() !== ""));
    if (dropCols) {
      const keep = head.map((h, i) => (String(h).trim() !== "" && !/^Column \d+$/.test(h)) || rows.some((r) => String(r[i] ?? "").trim() !== ""));
      head = head.filter((_, i) => keep[i]);
      rows = rows.map((r) => r.filter((_, i) => keep[i]));
    }
    const d = outDelim === "tab" ? "\t" : outDelim;
    const csv = toCSV(head, rows, d, parsed.hasHeader, eol === "crlf" ? "\r\n" : "\n");
    return { head, rows, csv, before, after: { rows: rows.length, cols: head.length } };
  }, [parsed, trim, dropRows, dropCols, collapse, eol, outDelim]);

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} label="Messy CSV to clean" />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 4 }}>
          <Toggle label="Trim whitespace around every cell" value={trim} onChange={setTrim} />
          <Toggle label="Collapse runs of spaces and tabs" value={collapse} onChange={setCollapse} />
          <Toggle label="Drop completely empty rows" value={dropRows} onChange={setDropRows} />
          <Toggle label="Drop completely empty columns" value={dropCols} onChange={setDropCols} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12, marginTop: 12 }}>
          <div><Label>Line endings</Label><SelectInput value={eol} onChange={setEol} options={[["crlf", "CRLF (Windows / Excel)"], ["lf", "LF (Unix)"]]} style={{ width: "100%" }} /></div>
          <div><Label>Output delimiter</Label><SelectInput value={outDelim} onChange={setOutDelim} options={[[",", "Comma ,"], ["tab", "Tab"], [";", "Semicolon ;"], ["|", "Pipe |"]]} style={{ width: "100%" }} /></div>
        </div>
      </Card>
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : result && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <StatBox value={`${result.before.rows} → ${result.after.rows}`} label="Rows" />
            <StatBox value={`${result.before.cols} → ${result.after.cols}`} label="Columns" />
            <StatBox value={(result.before.rows - result.after.rows) + (result.before.cols - result.after.cols)} label="Items removed" />
            <StatBox value={result.csv.length.toLocaleString()} label="Output characters" />
          </div>
          <PreviewTable header={result.head} rows={result.rows} />
          <ExportRow csv={result.csv} name="cleaned.csv" />
        </>
      )}
    </VStack>
  );
}

function CsvDeduplicator() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_CSV);
  const [keys, setKeys] = useState([]);
  const [ci, setCi] = useState(true);
  const [trimKeys, setTrimKeys] = useState(true);
  const headKey = parsed.header.join("|");
  useEffect(() => { setKeys([]); }, [headKey]);

  const result = useMemo(() => {
    if (!parsed.ok) return null;
    const idx = keys.length ? keys : parsed.header.map((_, i) => i);
    const seen = new Set(); const kept = []; const dropped = [];
    parsed.rows.forEach((r) => {
      const k = idx.map((i) => { let v = String(r[i] ?? ""); if (trimKeys) v = v.trim(); if (ci) v = v.toLowerCase(); return v; }).join("\x00");
      if (seen.has(k)) dropped.push(r); else { seen.add(k); kept.push(r); }
    });
    return { kept, dropped, csv: toCSV(parsed.header, kept, ",", parsed.hasHeader) };
  }, [parsed, keys, ci, trimKeys]);

  const toggleKey = (i) => setKeys((k) => (k.includes(i) ? k.filter((x) => x !== i) : [...k, i].sort((a, b) => a - b)));

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : (
        <>
          <Card>
            <Label>Key columns — leave all unticked to compare the whole row</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {parsed.header.map((h, i) => (
                <button key={i} onClick={() => toggleKey(i)} style={{ padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", border: `1px solid ${keys.includes(i) ? C.accent : C.border}`, background: keys.includes(i) ? "rgba(45,212,191,0.15)" : "rgba(255,255,255,0.04)", color: keys.includes(i) ? C.accent : C.muted }}>{h}</button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 4, marginTop: 12 }}>
              <Toggle label="Ignore upper/lower case" value={ci} onChange={setCi} />
              <Toggle label="Ignore leading/trailing spaces" value={trimKeys} onChange={setTrimKeys} />
            </div>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <StatBox value={parsed.rows.length.toLocaleString()} label="Rows in" />
            <StatBox value={result.kept.length.toLocaleString()} label="Unique rows" />
            <StatBox value={result.dropped.length.toLocaleString()} label="Duplicates removed" />
            <StatBox value={keys.length ? keys.length + " cols" : "Whole row"} label="Matched on" />
          </div>
          {result.dropped.length === 0 && <Notice>No duplicates found with the current settings — every row is already unique.</Notice>}
          <PreviewTable header={parsed.header} rows={result.kept} />
          {result.dropped.length > 0 && (
            <div>
              <Label>Removed duplicate rows ({result.dropped.length})</Label>
              <PreviewTable header={parsed.header} rows={result.dropped} max={25} />
            </div>
          )}
          <ExportRow csv={result.csv} name="deduplicated.csv" />
        </>
      )}
    </VStack>
  );
}

function CsvSplitter() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_CSV);
  const [mode, setMode] = useState("rows");
  const [n, setN] = useState("3");
  const parts = useMemo(() => {
    if (!parsed.ok) return [];
    const total = parsed.rows.length;
    const num = Math.max(1, Math.min(500, parseInt(n) || 1));
    const size = mode === "rows" ? num : Math.ceil(total / num);
    if (!size) return [];
    const out = [];
    for (let i = 0; i < total; i += size) out.push(parsed.rows.slice(i, i + size));
    return out.slice(0, 500);
  }, [parsed, mode, n]);

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} label="CSV to split" />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div><Label>Split by</Label><SelectInput value={mode} onChange={setMode} options={[["rows", "Rows per file"], ["parts", "Number of files"]]} style={{ width: "100%" }} /></div>
        <div><Label>{mode === "rows" ? "Rows in each file" : "How many files"}</Label><Input value={n} onChange={setN} /></div>
      </div>
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : !parts.length ? <Notice tone="warn">Nothing to split — the file has no data rows.</Notice> : (
        <>
          <Notice>{parsed.rows.length.toLocaleString()} rows will be split into <b>{parts.length}</b> file{parts.length === 1 ? "" : "s"}{parsed.hasHeader ? ", each repeating the header row so it opens as a valid CSV." : "."}</Notice>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
            {parts.map((p, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>part-{i + 1}.csv</div>
                <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{p.length.toLocaleString()} rows</div>
                <Btn size="sm" variant="secondary" onClick={() => downloadText(`part-${i + 1}.csv`, toCSV(parsed.header, p, ",", parsed.hasHeader), "text/csv")}>⬇ Download</Btn>
              </div>
            ))}
          </div>
          <div><Label>Preview of part 1</Label><PreviewTable header={parsed.header} rows={parts[0]} max={20} /></div>
        </>
      )}
    </VStack>
  );
}

const SAMPLE_MERGE_A = "name,email,plan\nAnjali,anjali@example.com,Pro\nSean,sean@example.com,Starter";
const SAMPLE_MERGE_B = "name,email,country\nWei,wei@example.com,Singapore\nAna,ana@example.com,Brazil";

function CsvMerger() {
  const [blocks, setBlocks] = useState([{ name: "file-a.csv", text: SAMPLE_MERGE_A }, { name: "file-b.csv", text: SAMPLE_MERGE_B }]);
  const [mode, setMode] = useState("union");
  const [srcCol, setSrcCol] = useState(true);

  const parsedBlocks = useMemo(() => blocks.map((b) => ({ ...b, p: parseCSV(b.text, {}) })).filter((b) => b.p.ok), [blocks]);
  const result = useMemo(() => {
    if (!parsedBlocks.length) return null;
    let cols;
    if (mode === "intersect") {
      cols = parsedBlocks[0].p.header.filter((h) => parsedBlocks.every((b) => b.p.header.includes(h)));
    } else {
      cols = [];
      parsedBlocks.forEach((b) => b.p.header.forEach((h) => { if (!cols.includes(h)) cols.push(h); }));
    }
    if (!cols.length) return { header: [], rows: [], warn: "These files share no column names, so the intersection is empty. Switch to union to keep every column." };
    const header = srcCol ? ["source", ...cols] : cols;
    const rows = [];
    parsedBlocks.forEach((b) => {
      const map = cols.map((c) => b.p.header.indexOf(c));
      b.p.rows.forEach((r) => {
        const line = map.map((i) => (i === -1 ? "" : r[i] ?? ""));
        rows.push(srcCol ? [b.name, ...line] : line);
      });
    });
    return { header, rows, warn: null };
  }, [parsedBlocks, mode, srcCol]);

  const addFiles = (list) => setBlocks((b) => [...b, ...list.map((f) => ({ name: f.name, text: f.text }))]);

  return (
    <VStack gap={16}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <FileLoadBtn onText={addFiles} multiple label="📁 Add CSV files" />
        <Btn size="sm" variant="secondary" onClick={() => setBlocks((b) => [...b, { name: `block-${b.length + 1}.csv`, text: "" }])}>+ Add a paste box</Btn>
        <span style={{ fontSize: 11, color: C.muted }}>{PRIVACY_NOTE}</span>
      </div>
      {blocks.map((b, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <Label>{b.name}</Label>
            {blocks.length > 1 && <Btn size="sm" variant="danger" onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))}>Remove</Btn>}
          </div>
          <Textarea value={b.text} onChange={(v) => setBlocks((bs) => bs.map((x, j) => (j === i ? { ...x, text: v } : x)))} rows={5} mono />
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        <div><Label>Column matching</Label><SelectInput value={mode} onChange={setMode} options={[["union", "Union — keep every column"], ["intersect", "Intersection — shared columns only"]]} style={{ width: "100%" }} /></div>
        <div style={{ display: "flex", alignItems: "flex-end" }}><Toggle label="Add a source column" value={srcCol} onChange={setSrcCol} /></div>
      </div>
      {!parsedBlocks.length ? <Notice tone="warn">Add at least one CSV with data to merge.</Notice> : result.warn ? <Notice tone="warn">{result.warn}</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <StatBox value={parsedBlocks.length} label="Files merged" />
            <StatBox value={result.rows.length.toLocaleString()} label="Total rows" />
            <StatBox value={result.header.length} label="Columns out" />
          </div>
          <PreviewTable header={result.header} rows={result.rows} />
          <ExportRow csv={toCSV(result.header, result.rows, ",", true)} name="merged.csv" />
        </>
      )}
    </VStack>
  );
}

function CsvColumnExtractor() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_CSV);
  const [cols, setCols] = useState([]);
  const headKey = parsed.header.join("|");
  useEffect(() => {
    setCols(parsed.ok ? parsed.header.map((h, i) => ({ idx: i, name: h, keep: true })) : []);
  }, [headKey, parsed.ok]);

  const kept = cols.filter((c) => c.keep);
  const outHeader = kept.map((c) => c.name);
  const outRows = parsed.ok ? parsed.rows.map((r) => kept.map((c) => r[c.idx] ?? "")) : [];
  const move = (i, dir) => setCols((cs) => { const a = cs.slice(); const j = i + dir; if (j < 0 || j >= a.length) return cs; [a[i], a[j]] = [a[j], a[i]]; return a; });

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : (
        <>
          <Card>
            <Label>Columns — tick to keep, rename freely, reorder with the arrows</Label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {cols.map((c, i) => (
                <div key={c.idx} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="checkbox" checked={c.keep} onChange={(e) => setCols((cs) => cs.map((x, j) => (j === i ? { ...x, keep: e.target.checked } : x)))} style={{ width: 16, height: 16, accentColor: C.accent, cursor: "pointer" }} />
                  <span style={{ fontSize: 12, color: C.muted, minWidth: 110, fontFamily: "'JetBrains Mono',monospace" }}>{parsed.header[c.idx]}</span>
                  <Input value={c.name} onChange={(v) => setCols((cs) => cs.map((x, j) => (j === i ? { ...x, name: v } : x)))} style={{ maxWidth: 220 }} />
                  <Btn size="sm" variant="ghost" onClick={() => move(i, -1)}>↑</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => move(i, 1)}>↓</Btn>
                </div>
              ))}
            </div>
          </Card>
          {!kept.length ? <Notice tone="warn">Tick at least one column to keep.</Notice> : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
                <StatBox value={`${parsed.header.length} → ${kept.length}`} label="Columns" />
                <StatBox value={parsed.rows.length.toLocaleString()} label="Rows kept" />
              </div>
              <PreviewTable header={outHeader} rows={outRows} />
              <ExportRow csv={toCSV(outHeader, outRows, ",", true)} name="columns.csv" />
            </>
          )}
        </>
      )}
    </VStack>
  );
}

function CsvToJsonTable() {
  const [dir, setDir] = useState("c2j");
  const [csvText, setCsvText] = useState(SAMPLE_MERGE_A);
  const [jsonText, setJsonText] = useState('[\n  { "name": "Anjali", "plan": "Pro", "mrr": 49 },\n  { "name": "Sean", "plan": "Starter", "mrr": 19 }\n]');
  const [typed, setTyped] = useState(true);
  const [pretty, setPretty] = useState(true);

  const c2j = useMemo(() => {
    const p = parseCSV(csvText, {});
    if (!p.ok) return { err: p.error };
    const objs = p.rows.map((r) => {
      const o = {};
      p.header.forEach((h, i) => {
        const raw = r[i] ?? "";
        if (!typed) { o[h] = raw; return; }
        const t = String(raw).trim();
        if (t === "") o[h] = "";
        else if (t.toLowerCase() === "true") o[h] = true;
        else if (t.toLowerCase() === "false") o[h] = false;
        else { const n = toNum(t); o[h] = isNaN(n) || /^0\d/.test(t) ? raw : n; }
      });
      return o;
    });
    return { objs, out: JSON.stringify(objs, null, pretty ? 2 : 0), header: p.header, rows: p.rows };
  }, [csvText, typed, pretty]);

  const j2c = useMemo(() => {
    try {
      const v = JSON.parse(jsonText);
      const arr = Array.isArray(v) ? v : [v];
      if (!arr.length) return { err: "The JSON array is empty — add at least one object." };
      const keys = [];
      arr.forEach((o) => { if (o && typeof o === "object" && !Array.isArray(o)) Object.keys(o).forEach((k) => { if (!keys.includes(k)) keys.push(k); }); });
      if (!keys.length) return { err: "Expected an array of objects, for example: [{ \"name\": \"Anjali\" }]" };
      const rows = arr.map((o) => keys.map((k) => { const v2 = o ? o[k] : ""; return v2 === null || v2 === undefined ? "" : typeof v2 === "object" ? JSON.stringify(v2) : String(v2); }));
      return { header: keys, rows, out: toCSV(keys, rows, ",", true) };
    } catch (e) { return { err: "That is not valid JSON: " + e.message }; }
  }, [jsonText]);

  const active = dir === "c2j" ? c2j : j2c;

  return (
    <VStack gap={16}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <div><Label>Direction</Label><SelectInput value={dir} onChange={setDir} options={[["c2j", "CSV → JSON"], ["j2c", "JSON → CSV"]]} style={{ width: "100%" }} /></div>
        {dir === "c2j" && <div style={{ display: "flex", alignItems: "flex-end" }}><Toggle label="Type numbers & booleans" value={typed} onChange={setTyped} /></div>}
        {dir === "c2j" && <div style={{ display: "flex", alignItems: "flex-end" }}><Toggle label="Pretty print" value={pretty} onChange={setPretty} /></div>}
      </div>
      {dir === "c2j"
        ? <CsvSource value={csvText} onChange={setCsvText} label="CSV input" />
        : <div><Label>JSON input (array of objects)</Label><Textarea value={jsonText} onChange={setJsonText} rows={9} mono /><div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>{PRIVACY_NOTE}</div></div>}
      {active.err ? <Notice tone="warn">{active.err}</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <StatBox value={(dir === "c2j" ? c2j.objs.length : j2c.rows.length).toLocaleString()} label="Records" />
            <StatBox value={active.header.length} label="Fields" />
            <StatBox value={active.out.length.toLocaleString()} label="Output characters" />
          </div>
          <PreviewTable header={active.header} rows={active.rows} max={30} />
          <div><Label>{dir === "c2j" ? "JSON output" : "CSV output"}</Label><Textarea value={active.out} onChange={() => {}} rows={10} mono /></div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <CopyBtn text={active.out} />
            <Btn size="sm" variant="primary" onClick={() => downloadText(dir === "c2j" ? "data.json" : "data.csv", active.out, dir === "c2j" ? "application/json" : "text/csv")}>⬇ Download {dir === "c2j" ? "JSON" : "CSV"}</Btn>
          </div>
        </>
      )}
    </VStack>
  );
}

function CsvTransposer() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_STACK);
  const result = useMemo(() => {
    if (!parsed.ok) return null;
    const grid = parsed.hasHeader ? [parsed.header, ...parsed.rows] : parsed.rows;
    const w = grid.reduce((m, r) => Math.max(m, r.length), 0);
    const out = [];
    for (let c = 0; c < w; c++) out.push(grid.map((r) => r[c] ?? ""));
    const head = out.length ? out[0].map((_, i) => `Row ${i + 1}`) : [];
    return { grid: out, head, csv: toCSV(null, out, ",", false) };
  }, [parsed]);

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} label="CSV to transpose" />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
            <StatBox value={`${(parsed.hasHeader ? parsed.rows.length + 1 : parsed.rows.length)} × ${parsed.header.length}`} label="Original grid" />
            <StatBox value={`${result.grid.length} × ${result.grid[0] ? result.grid[0].length : 0}`} label="Transposed grid" />
          </div>
          <PreviewTable header={result.head} rows={result.grid} maxCols={30} />
          <ExportRow csv={result.csv} name="transposed.csv" />
        </>
      )}
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  STATS TOOLS
// ══════════════════════════════════════════════════════════════════════════════

function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function DataSummaryStats() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_MONTHLY);
  const [sdMode, setSdMode] = useState("sample");

  const stats = useMemo(() => {
    if (!parsed.ok) return [];
    return parsed.header.map((h, c) => {
      const raw = parsed.rows.map((r) => r[c]);
      const nums = raw.map(toNum).filter((v) => !isNaN(v));
      if (nums.length < Math.max(1, raw.filter((v) => String(v).trim() !== "").length * 0.6)) {
        const uniq = new Set(raw.map((v) => String(v).trim()).filter(Boolean));
        return { name: h, numeric: false, filled: raw.filter((v) => String(v).trim() !== "").length, unique: uniq.size };
      }
      const sorted = nums.slice().sort((a, b) => a - b);
      const n = nums.length;
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const varr = n > 1 ? nums.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (sdMode === "sample" ? n - 1 : n) : 0;
      const counts = {}; let mode = null, best = 0;
      nums.forEach((v) => { counts[v] = (counts[v] || 0) + 1; if (counts[v] > best) { best = counts[v]; mode = v; } });
      const q1 = quantile(sorted, 0.25), q2 = quantile(sorted, 0.5), q3 = quantile(sorted, 0.75);
      return { name: h, numeric: true, n, sum, mean, median: q2, mode: best > 1 ? mode : null, min: sorted[0], max: sorted[n - 1], range: sorted[n - 1] - sorted[0], varr, sd: Math.sqrt(varr), q1, q3, iqr: q3 - q1 };
    });
  }, [parsed, sdMode]);

  const numericCols = stats.filter((s) => s.numeric);
  const copyText = numericCols.map((s) => `${s.name}: n=${s.n}, sum=${fmtFull(s.sum)}, mean=${fmtFull(s.mean)}, median=${fmtFull(s.median)}, min=${fmtFull(s.min)}, max=${fmtFull(s.max)}, sd=${fmtFull(s.sd)}`).join("\n");
  const rowsFor = (s) => [
    ["Count", s.n], ["Sum", fmtFull(s.sum)], ["Mean", fmtFull(s.mean)], ["Median (Q2)", fmtFull(s.median)],
    ["Mode", s.mode === null ? "no repeats" : fmtFull(s.mode)], ["Minimum", fmtFull(s.min)], ["Maximum", fmtFull(s.max)],
    ["Range", fmtFull(s.range)], ["Variance", fmtFull(s.varr)], ["Std deviation", fmtFull(s.sd)],
    ["Q1 (25%)", fmtFull(s.q1)], ["Q3 (75%)", fmtFull(s.q3)], ["IQR", fmtFull(s.iqr)],
  ];

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        <div><Label>Variance & deviation</Label><SelectInput value={sdMode} onChange={setSdMode} options={[["sample", "Sample (n − 1)"], ["population", "Population (n)"]]} style={{ width: "100%" }} /></div>
      </div>
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : !numericCols.length ? <Notice tone="warn">No numeric columns were found. Check that at least one column contains plain numbers.</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
            <StatBox value={parsed.rows.length.toLocaleString()} label="Rows" />
            <StatBox value={numericCols.length} label="Numeric columns" />
            <StatBox value={stats.length - numericCols.length} label="Text columns" />
          </div>
          {numericCols.map((s) => (
            <Card key={s.name}>
              <div style={{ ...T.h2, marginBottom: 12 }}>📐 {s.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
                {rowsFor(s).map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 11, color: C.muted }}>{k}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono',monospace", wordBreak: "break-all" }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {stats.filter((s) => !s.numeric).length > 0 && (
            <Notice>Text columns skipped: {stats.filter((s) => !s.numeric).map((s) => `${s.name} (${s.unique} unique values)`).join(", ")}.</Notice>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}><CopyBtn text={copyText} /></div>
        </>
      )}
    </VStack>
  );
}

const SAMPLE_PIVOT = "region,product,quarter,units,revenue\nNorth,Widget,Q1,120,4800\nNorth,Gadget,Q1,80,6400\nSouth,Widget,Q1,95,3800\nSouth,Gadget,Q1,140,11200\nNorth,Widget,Q2,150,6000\nNorth,Gadget,Q2,110,8800\nSouth,Widget,Q2,105,4200\nSouth,Gadget,Q2,160,12800\nEast,Widget,Q1,60,2400\nEast,Gadget,Q2,90,7200";

function PivotTableBuilder() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_PIVOT);
  const [rowF, setRowF] = useState("0");
  const [colF, setColF] = useState("-1");
  const [valF, setValF] = useState("4");
  const [agg, setAgg] = useState("sum");
  const headKey = parsed.header.join("|");
  useEffect(() => {
    if (!parsed.ok) return;
    setRowF("0");
    setColF(parsed.header.length > 2 ? "2" : "-1");
    const firstNum = parsed.header.findIndex((_, i) => parsed.rows.some((r) => isNum(r[i])));
    setValF(String(firstNum === -1 ? 0 : firstNum));
  }, [headKey]);

  const pivot = useMemo(() => {
    if (!parsed.ok) return null;
    const ri = parseInt(rowF), cif = parseInt(colF), vi = parseInt(valF);
    if (isNaN(ri) || ri < 0 || ri >= parsed.header.length) return null;
    const rowKeys = [], colKeys = [];
    const cells = {};
    parsed.rows.forEach((r) => {
      const rk = String(r[ri] ?? "").trim() || "(blank)";
      const ck = cif >= 0 ? (String(r[cif] ?? "").trim() || "(blank)") : "Value";
      if (!rowKeys.includes(rk)) rowKeys.push(rk);
      if (!colKeys.includes(ck)) colKeys.push(ck);
      const key = rk + "\x00" + ck;
      if (!cells[key]) cells[key] = [];
      cells[key].push(vi >= 0 ? r[vi] : 1);
    });
    const aggregate = (arr) => {
      if (!arr || !arr.length) return null;
      if (agg === "count") return arr.length;
      const nums = arr.map(toNum).filter((v) => !isNaN(v));
      if (!nums.length) return null;
      if (agg === "sum") return nums.reduce((a, b) => a + b, 0);
      if (agg === "avg") return nums.reduce((a, b) => a + b, 0) / nums.length;
      if (agg === "min") return Math.min(...nums);
      if (agg === "max") return Math.max(...nums);
      return null;
    };
    rowKeys.sort(); colKeys.sort();
    const grid = rowKeys.map((rk) => colKeys.map((ck) => aggregate(cells[rk + "\x00" + ck])));
    const rowTot = rowKeys.map((rk) => aggregate([].concat(...colKeys.map((ck) => cells[rk + "\x00" + ck] || []))));
    const colTot = colKeys.map((ck) => aggregate([].concat(...rowKeys.map((rk) => cells[rk + "\x00" + ck] || []))));
    const grand = aggregate([].concat(...Object.keys(cells).map((k) => cells[k])));
    return { rowKeys, colKeys, grid, rowTot, colTot, grand };
  }, [parsed, rowF, colF, valF, agg]);

  const fieldOpts = parsed.ok ? parsed.header.map((h, i) => [String(i), h]) : [];
  const csvOut = pivot ? toCSV([parsed.header[parseInt(rowF)] || "Row", ...pivot.colKeys, "Total"], pivot.rowKeys.map((rk, i) => [rk, ...pivot.grid[i].map((v) => (v === null ? "" : fmtFull(v))), fmtFull(pivot.rowTot[i])]), ",", true) : "";

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 12 }}>
            <div><Label>Rows</Label><SelectInput value={rowF} onChange={setRowF} options={fieldOpts} style={{ width: "100%" }} /></div>
            <div><Label>Columns</Label><SelectInput value={colF} onChange={setColF} options={[["-1", "None"], ...fieldOpts]} style={{ width: "100%" }} /></div>
            <div><Label>Values</Label><SelectInput value={valF} onChange={setValF} options={fieldOpts} style={{ width: "100%" }} /></div>
            <div><Label>Aggregation</Label><SelectInput value={agg} onChange={setAgg} options={[["sum", "Sum"], ["count", "Count"], ["avg", "Average"], ["min", "Minimum"], ["max", "Maximum"]]} style={{ width: "100%" }} /></div>
          </div>
          {!pivot ? <Notice tone="warn">Choose a row field to build the pivot table.</Notice> : (
            <>
              <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 10 }}>
                <table style={{ borderCollapse: "collapse", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "9px 12px", color: C.accent, fontWeight: 700, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)" }}>{parsed.header[parseInt(rowF)]}</th>
                      {pivot.colKeys.map((c, i) => <th key={i} style={{ textAlign: "right", padding: "9px 12px", color: C.muted, fontWeight: 700, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)" }}>{c}</th>)}
                      <th style={{ textAlign: "right", padding: "9px 12px", color: C.accent, fontWeight: 700, borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.03)" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pivot.rowKeys.map((rk, ri) => (
                      <tr key={ri}>
                        <td style={{ padding: "8px 12px", color: C.text, borderBottom: `1px solid ${C.border}` }}>{rk}</td>
                        {pivot.grid[ri].map((v, ci) => <td key={ci} style={{ padding: "8px 12px", textAlign: "right", color: v === null ? "#334155" : C.text, borderBottom: `1px solid ${C.border}` }}>{v === null ? "—" : fmtNum(v)}</td>)}
                        <td style={{ padding: "8px 12px", textAlign: "right", color: C.accent, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{pivot.rowTot[ri] === null ? "—" : fmtNum(pivot.rowTot[ri])}</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: "8px 12px", color: C.accent, fontWeight: 700 }}>Total</td>
                      {pivot.colTot.map((v, i) => <td key={i} style={{ padding: "8px 12px", textAlign: "right", color: C.accent, fontWeight: 700 }}>{v === null ? "—" : fmtNum(v)}</td>)}
                      <td style={{ padding: "8px 12px", textAlign: "right", color: C.accent, fontWeight: 800 }}>{pivot.grand === null ? "—" : fmtNum(pivot.grand)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ExportRow csv={csvOut} name="pivot.csv" />
            </>
          )}
        </>
      )}
    </VStack>
  );
}

function FrequencyCounter() {
  const { text, setText, delim, setDelim, header, setHeader, parsed } = useCsv(SAMPLE_PIVOT);
  const [col, setCol] = useState("0");
  const [ci, setCi] = useState(false);
  const [trimV, setTrimV] = useState(true);
  const [topN, setTopN] = useState("20");
  const headKey = parsed.header.join("|");
  useEffect(() => { setCol("0"); }, [headKey]);

  const freq = useMemo(() => {
    if (!parsed.ok) return null;
    const c = parseInt(col);
    if (isNaN(c) || c < 0 || c >= parsed.header.length) return null;
    const counts = new Map();
    let total = 0;
    parsed.rows.forEach((r) => {
      let v = String(r[c] ?? "");
      if (trimV) v = v.trim();
      if (ci) v = v.toLowerCase();
      if (v === "") v = "(blank)";
      counts.set(v, (counts.get(v) || 0) + 1);
      total++;
    });
    let list = Array.from(counts.entries()).map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
    const n = Math.max(1, Math.min(500, parseInt(topN) || 20));
    let other = null;
    if (list.length > n) {
      const rest = list.slice(n);
      other = { value: `(${rest.length} other values)`, count: rest.reduce((a, b) => a + b.count, 0) };
      list = list.slice(0, n);
    }
    const max = list.length ? list[0].count : 1;
    let cum = 0;
    list = list.map((x) => { cum += x.count; return { ...x, pct: total ? (x.count / total) * 100 : 0, cum: total ? (cum / total) * 100 : 0 }; });
    return { list, other, total, unique: counts.size, max };
  }, [parsed, col, ci, trimV, topN]);

  const copyText = freq ? ["value\tcount\tpercent", ...freq.list.map((x) => `${x.value}\t${x.count}\t${x.pct.toFixed(2)}%`)].join("\n") : "";

  return (
    <VStack gap={16}>
      <CsvSource value={text} onChange={setText} />
      <ParseOptions delim={delim} setDelim={setDelim} header={header} setHeader={setHeader} detected={parsed.delim} />
      {!parsed.ok ? <Notice tone="warn">{parsed.error}</Notice> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 12 }}>
            <div><Label>Column to count</Label><SelectInput value={col} onChange={setCol} options={parsed.header.map((h, i) => [String(i), h])} style={{ width: "100%" }} /></div>
            <div><Label>Show top</Label><Input value={topN} onChange={setTopN} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><Toggle label="Ignore case" value={ci} onChange={setCi} /></div>
            <div style={{ display: "flex", alignItems: "flex-end" }}><Toggle label="Trim spaces" value={trimV} onChange={setTrimV} /></div>
          </div>
          {!freq || !freq.list.length ? <Notice tone="warn">That column has no values to count.</Notice> : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>
                <StatBox value={freq.total.toLocaleString()} label="Values counted" />
                <StatBox value={freq.unique.toLocaleString()} label="Distinct values" />
                <StatBox value={freq.list[0].value.length > 12 ? freq.list[0].value.slice(0, 11) + "…" : freq.list[0].value} label="Most common" />
                <StatBox value={freq.list[0].pct.toFixed(1) + "%"} label="Top share" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {freq.list.map((x, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(90px,1.2fr) 3fr 70px 62px", gap: 10, alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={x.value}>{x.value}</div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 5, height: 16, overflow: "hidden" }}>
                      <div style={{ width: `${(x.count / freq.max) * 100}%`, height: "100%", background: `linear-gradient(90deg,${C.accent},${C.accentD})`, borderRadius: 5 }} />
                    </div>
                    <div style={{ fontSize: 12, color: C.text, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{x.count.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{x.pct.toFixed(1)}%</div>
                  </div>
                ))}
                {freq.other && (
                  <div style={{ display: "grid", gridTemplateColumns: "minmax(90px,1.2fr) 3fr 70px 62px", gap: 10, alignItems: "center", opacity: 0.7 }}>
                    <div style={{ fontSize: 12, color: C.muted }}>{freq.other.value}</div>
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 5, height: 16 }}>
                      <div style={{ width: `${(freq.other.count / freq.max) * 100}%`, height: "100%", background: "rgba(255,255,255,0.15)", borderRadius: 5 }} />
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{freq.other.count.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontFamily: "'JetBrains Mono',monospace", textAlign: "right" }}>{((freq.other.count / freq.total) * 100).toFixed(1)}%</div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <CopyBtn text={copyText} />
                <Btn size="sm" variant="primary" onClick={() => downloadText("frequency.csv", toCSV(["value", "count", "percent", "cumulative"], freq.list.map((x) => [x.value, x.count, x.pct.toFixed(2), x.cum.toFixed(2)]), ",", true), "text/csv")}>⬇ Download CSV</Btn>
              </div>
            </>
          )}
        </>
      )}
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
const TOOL_COMPONENTS = {
  "bar-chart-maker": BarChartMaker,
  "line-chart-maker": LineChartMaker,
  "pie-chart-maker": PieChartMaker,
  "donut-chart-maker": DonutChartMaker,
  "area-chart-maker": AreaChartMaker,
  "scatter-plot-maker": ScatterPlotMaker,
  "horizontal-bar-chart": HorizontalBarChart,
  "stacked-bar-chart": StackedBarChart,
  "sparkline-generator": SparklineGenerator,
  "gauge-chart-maker": GaugeChartMaker,
  "heatmap-generator": HeatmapGenerator,
  "gantt-chart-maker": GanttChartMaker,
  "org-chart-maker": OrgChartMaker,
  "timeline-maker": TimelineMaker,
  "csv-viewer": CsvViewer,
  "csv-cleaner": CsvCleaner,
  "csv-deduplicator": CsvDeduplicator,
  "csv-splitter": CsvSplitter,
  "csv-merger": CsvMerger,
  "csv-column-extractor": CsvColumnExtractor,
  "csv-to-json-table": CsvToJsonTable,
  "csv-transposer": CsvTransposer,
  "data-summary-stats": DataSummaryStats,
  "pivot-table-builder": PivotTableBuilder,
  "frequency-counter": FrequencyCounter,
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
    document.title = `${cat?.name || 'Category'} – Charts & Data Tools | ToolsRift`;
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
    document.title = "Free Chart Maker & Data Tools – Bar, Line, Pie, CSV | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search chart & data tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(45,212,191,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.accent, textDecoration:"none" }}>{THEME?.name||"Charts & Data Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(45,212,191,0.12)", color:C.accent, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(45,212,191,0.25)" }}>{TOOLS.length} tools</span>
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

function ToolsRiftData() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="data"/>}
    </div>
  );
}

export default ToolsRiftData;
