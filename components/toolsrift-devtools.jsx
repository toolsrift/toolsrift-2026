import { useEffect, useMemo, useState } from "react";
// PHASE 1: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from "../lib/usage";
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
// PHASE 2: import UpgradeModal from "./UpgradeModal";
// PHASE 2: import UsageCounter from "./UsageCounter";

const BRAND = { name: "ToolsRift", tagline: "Developer Tools" };

const C = {
  bg: "#06090F",
  surface: "#0D1117",
  border: "rgba(255,255,255,0.08)",
  blue: "#3B82F6",
  blueD: "#2563EB",
  text: "#E2E8F0",
  muted: "#64748B",
};

const T = {
  h1: { fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: C.text },
  label: { fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{box-sizing:border-box}
body{margin:0;padding:0;background:#06090F;color:#E2E8F0;font-family:'Plus Jakarta Sans',sans-serif}
input,select,textarea,button{font-family:inherit}
pre,code{font-family:'JetBrains Mono',monospace}
a{color:inherit}
.fade-in{animation:fadeIn .2s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid rgba(255,255,255,.08);padding:8px 10px;font-size:12px;vertical-align:top}
th{background:rgba(255,255,255,.04);text-align:left}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:8px}
::selection{background:rgba(59,130,246,0.3)}
`;

const n = (v) => {
  const x = parseFloat(v);
  return Number.isFinite(x) ? x : 0;
};
const round = (x, p = 6) => (Number.isFinite(x) ? Number(x.toFixed(p)) : 0);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const copyText = async (txt) => {
  try { await navigator.clipboard.writeText(String(txt)); return true; } catch { return false; }
};
const fmtDate = (d) => {
  const z = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`;
};

function Card({ children, style = {} }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, ...style }}>{children}</div>;
}
function Label({ children }) { return <div style={T.label}>{children}</div>; }
function Input({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13 }} />;
}
function Textarea({ value, onChange, rows = 6, placeholder }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
    style={{ width: "100%", resize: "vertical", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13, lineHeight: 1.5 }} />;
}
function SelectInput({ value, onChange, options }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)}
    style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 13 }}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}
function Btn({ children, onClick, style = {} }) {
  return <button onClick={onClick} style={{ border: `1px solid ${C.border}`, background: C.blue, color: "white", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", ...style }}>{children}</button>;
}
function GhostBtn({ children, onClick }) {
  return <button onClick={onClick} style={{ border: `1px solid ${C.border}`, background: "rgba(255,255,255,.05)", color: C.text, borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{children}</button>;
}
function Badge({ children }) {
  return <span style={{ background: "rgba(59,130,246,.18)", color: "#93C5FD", border: `1px solid rgba(59,130,246,.35)`, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{children}</span>;
}
function Grid2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>; }
function Grid3({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>{children}</div>; }
function VStack({ children, gap = 12 }) { return <div style={{ display: "flex", flexDirection: "column", gap }}>{children}</div>; }

function DataTable({ columns, rows, maxHeight }) {
  return (
    <div style={{ overflow: "auto", maxHeight: maxHeight || "unset", border: `1px solid ${C.border}`, borderRadius: 10 }}>
      <table>
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
function CodeBox({ code }) {
  return <pre style={{ margin: 0, background: "rgba(0,0,0,.25)", border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, overflow: "auto", fontSize: 12, lineHeight: 1.6 }}>{code}</pre>;
}
function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 20 }}>{icon}</div>
        <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 18 }}>{title}</h2>
      </div>
      {subtitle && <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{subtitle}</div>}
    </div>
  );
}

/* ---- Tool metadata ---- */
const CATEGORIES = [
  { id: "time", name: "Time & Date Dev Tools", icon: "⏱️", desc: "Timestamps, cron, timezones and date formats." },
  { id: "network", name: "Network & URL Tools", icon: "🔗", desc: "URL, IP, CIDR, MIME and status code utilities." },
  { id: "text", name: "Text & Code Dev Tools", icon: "🧾", desc: "Diff, regex, curl, JWT, chmod and cron helpers." },
  { id: "reference", name: "Dev Reference Tools", icon:"💻", desc:"Searchable dev reference sheets and palettes." },
  { id: "generators2", name: "Dev Code Generators", icon: "💻", desc: "Code generators with live preview and copy." },
];

const TOOLS = [
  // time
  { id: "unix-timestamp", cat: "time", name: "Unix Timestamp", icon: "⏱️", desc: "Unix — human date + live now." },
  { id: "cron-parser", cat: "time", name: "Cron Parser", icon: "⏱️", desc: "Explain cron and next 10 run times." },
  { id: "cron-gen", cat: "time", name: "Cron Generator", icon: "⏱️", desc: "Build cron from schedule dropdowns." },
  { id: "timezone-dev", cat: "time", name: "Timezone Dev", icon: "⏱️", desc: "Major timezone clock table." },
  { id: "date-format-calc", cat: "time", name: "Date Format Calc", icon:"📅", desc:"20+ date format conversions." },

  // network
  { id: "url-parser", cat: "network", name: "URL Parser", icon:"🔗", desc:"Parse full URL structure." },
  { id: "query-string-builder", cat: "network", name: "Query String Builder", icon: "🔁", desc: "Build and encode query strings." },
  { id: "user-agent-parser", cat: "network", name: "User-Agent Parser", icon: "🕵️", desc: "Extract browser/OS/device/engine." },
  { id: "ip-info", cat: "network", name: "IP Info", icon: "🧠", desc: "IPv4/IPv6 class/type/binary info." },
  { id: "cidr-calc", cat: "network", name: "CIDR Calculator", icon:"🌐", desc:"Network range, netmask, hosts." },
  { id: "http-status-codes", cat: "network", name: "HTTP Status Codes", icon:"🌐", desc:"Searchable HTTP code reference." },
  { id: "mime-types", cat: "network", name: "MIME Types", icon: "🧷", desc: "Extension — MIME lookup." },

  // text
  { id: "diff-checker", cat: "text", name: "Diff Checker", icon: "🧬", desc: "Line-by-line visual differences." },
  { id: "regex-tester-adv", cat: "text", name: "Regex Tester Advanced", icon: "🧪", desc: "Flags, groups, replace, cheat sheet." },
  { id: "curl-builder", cat: "text", name: "cURL Builder", icon:"💻", desc:"Build cURL command from form." },
  { id: "curl-to-code", cat: "text", name: "cURL to Code", icon: "💻", desc: "Convert cURL to JS/Python/PHP/Go." },
  { id: "jwt-debugger", cat: "text", name: "JWT Debugger", icon: "🔐", desc: "Decode JWT segments and verify." },
  { id: "chmod-calc", cat: "text", name: "Chmod Calculator", icon: "🧩", desc: "Symbolic — octal permission grid." },
  { id: "crontab-guru", cat: "text", name: "Crontab Guru", icon:"⏱️", desc:"Visual cron builder + readable output." },

  // reference
  { id: "ascii-table", cat: "reference", name: "ASCII Table", icon:"🔤", desc:"0-127 searchable ASCII reference." },
  { id: "html-entities-ref", cat: "reference", name: "HTML Entities Ref", icon: "🧱", desc: "Search HTML entities quickly." },
  { id: "css-units-ref", cat: "reference", name: "CSS Units Ref", icon: "🎨", desc: "All CSS units with preview." },
  { id: "git-cheatsheet", cat: "reference", name: "Git Cheatsheet", icon: "🌿", desc: "Interactive Git command guide." },
  { id: "linux-commands-ref", cat: "reference", name: "Linux Commands Ref", icon:"🔍", desc:"Search Linux commands + examples." },
  { id: "regex-cheatsheet", cat: "reference", name: "Regex Cheatsheet", icon: "🧠", desc: "Regex patterns with live test." },
  { id: "http-headers-ref", cat: "reference", name: "HTTP Headers Ref", icon:"🌐", desc:"Common request/response headers." },
  { id: "color-names-ref", cat: "reference", name: "Color Names Ref", icon: "🎨", desc: "CSS named colors palette." },

  // generators2
  { id: "lorem-ipsum-adv", cat: "generators2", name: "Lorem Ipsum Advanced", icon: "⚡", desc: "Words/sentences/paragraphs generator." },
  { id: "hash-generator-adv", cat: "generators2", name: "Hash Generator Advanced", icon: "#️⃣", desc: "MD5/SHA1/SHA256/SHA512 side-by-side." },
  { id: "color-gradient-css", cat: "generators2", name: "Color Gradient CSS", icon: "🌈", desc: "Linear/radial/conic gradient generator." },
  { id: "box-shadow-gen", cat: "generators2", name: "Box Shadow Generator", icon: "🧊", desc: "Live CSS box-shadow preview." },
  { id: "text-shadow-gen", cat: "generators2", name: "Text Shadow Generator", icon: "🌫️", desc: "Live CSS text-shadow preview." },
  { id: "border-radius-gen", cat: "generators2", name: "Border Radius Generator", icon:"⬛", desc:"Independent corner radius controls." },
  { id: "flexbox-gen", cat: "generators2", name: "Flexbox Generator", icon:"📐", desc:"Visual flex layout + CSS code." },
  { id: "grid-gen", cat: "generators2", name: "Grid Generator", icon: "🧱", desc: "Visual grid layout + CSS code." },
  { id: "animation-gen", cat: "generators2", name: "Animation Generator", icon: "🎬", desc: "Generate keyframes with preview." },
  { id: "meta-tags-adv", cat: "generators2", name: "Meta Tags Advanced", icon: "⚡", desc: "SEO + OG + Twitter meta generator." },
];

/* Placeholder map; real assignments come in later chunks */
const TOOL_COMPONENTS = {};

/* ---- Router + pages ---- */
function useAppRouter() {
  const parse = () => {
    const h = window.location.hash || "#/";
    const path = h.replace(/^#/, "") || "/";
    const parts = path.split("/").filter(Boolean);
    if (!parts.length) return { page: "home" };
    if (parts[0] === "tool" && parts[1]) return { page: "tool", toolId: parts[1] };
    if (parts[0] === "category" && parts[1]) return { page: "category", catId: parts[1] };
    return { page: "home" };
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onHash = () => setRoute(parse());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function Breadcrumb({ tool, cat }) {
  return (
    <>
      <div style={{ display: "flex", gap: 6, fontSize: 12, color: C.muted, marginBottom: 16 }}>
        <a href="https://toolsrift.com" style={{ color: C.muted, textDecoration: "none" }}>—— ToolsRift</a>
        {cat && <><span>›</span><a href={`#/category/${cat.id}`} style={{ color: C.muted, textDecoration: "none" }}>{cat.name}</a></>}
        {tool && <><span>›</span><span style={{ color: C.text }}>{tool.name}</span></>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://toolsrift.com" },
          { "@type": "ListItem", "position": 2, "name": "Developer Tools", "item": "https://toolsrift.com/devtools" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function ToolPage({ toolId }) {
  const tool = TOOLS.find((t) => t.id === toolId);
  const meta = null; // TOOL_META placeholder —" add per-tool SEO meta here in future
  const ToolComp = TOOL_COMPONENTS[toolId];
  const cat = CATEGORIES.find((c) => c.id === tool?.cat);
  // PHASE 2: const [upgradeReason, setUpgradeReason] = useState(null);
  // PHASE 2: const [allowed, setAllowed] = useState(false);
  // PHASE 2: useEffect(() => { if (isLimitReached()) { ... } trackUse(toolId); }, [toolId]);

  if (!tool || !ToolComp) return <div style={{ padding: 24, color: C.muted }}>Tool not found or not loaded in this chunk.</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Breadcrumb tool={tool} cat={cat} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
        <div>
          <h1 style={{ ...T.h1, display: "flex", alignItems: "center", gap: 10 }}><span>{tool.icon}</span>{tool.name}</h1>
          <p style={{ color: C.muted, marginTop: 6, fontSize: 14 }}>{tool.desc}</p>
        </div>
        <Badge>Dev Tools</Badge>
      </div>
      {/* PHASE 2: {upgradeReason && <UpgradeModal reason={upgradeReason} onClose={() => setUpgradeReason(null)} />} */}
      {/* PHASE 1: All tools are free —" always render tool directly */}
      <Card className="fade-in"><ToolComp /></Card>
      {meta?.howTo && (
        <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:16, padding:'28px 32px', marginBottom:24, marginTop:24 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 12px', fontFamily:"'Sora', sans-serif" }}>—"— How to Use This Tool</h2>
          <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, margin:0 }}>{meta.howTo}</p>
        </div>
      )}
      {meta?.faq && meta.faq.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 16px', fontFamily:"'Sora', sans-serif" }}>—" Frequently Asked Questions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {meta.faq.map(([q,a],i) => (
              <details key={i} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, overflow:'hidden' }}>
                <summary style={{ padding:'14px 18px', fontSize:14, fontWeight:600, color:'#F1F5F9', cursor:'pointer', listStyle:'none', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  {q}<span style={{ color:'#64748B', fontSize:18, flexShrink:0 }}>+</span>
                </summary>
                <div style={{ padding:'0 18px 16px', fontSize:14, color:'#94A3B8', lineHeight:1.75 }}>{a}</div>
              </details>
            ))}
          </div>
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": meta.faq.map(([q,a]) => ({
              "@type": "Question",
              "name": q,
              "acceptedAnswer": { "@type": "Answer", "text": a }
            }))
          })}</script>
        </div>
      )}
      <div style={{ marginBottom:48 }}>
        <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 14px', fontFamily:"'Sora', sans-serif" }}>—"— Related Tools</h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          {TOOLS.filter(t => t.cat === tool.cat && t.id !== tool.id).slice(0,6).map(t => (
            <a key={t.id} href={`#/tool/${t.id}`} style={{ padding:'8px 16px', borderRadius:20, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', color:'#94A3B8', textDecoration:'none', fontSize:13, fontWeight:500 }}>{t.name}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryPage({ catId }) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  const items = TOOLS.filter((t) => t.cat === catId);
  if (!cat) return <div style={{ padding: 24, color: C.muted }}>Category not found.</div>;
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
      <Breadcrumb cat={cat} />
      <h1 style={T.h1}>{cat.icon} {cat.name}</h1>
      <p style={{ color: C.muted, marginTop: 8, marginBottom: 14 }}>{cat.desc}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {items.map((t) => (
          <a key={t.id} href={`#/tool/${t.id}`} style={{ textDecoration: "none" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 20 }}>{t.icon}</div>
                <Badge>Dev Tools</Badge>
              </div>
              <div style={{ color: C.text, fontWeight: 700, marginBottom: 6 }}>{t.name}</div>
              <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>{t.desc}</div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: C.blue }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
    </div>
  );
}


const PAGE_THEME = getCategoryById('devtools');

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

const DEV_SPECIAL_CSS = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  .trd-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  @media(max-width:1024px){.trd-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:640px){.trd-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:400px){.trd-grid{grid-template-columns:1fr}}
  .trd-detail{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:16px 0 60px}
  @media(max-width:768px){.trd-detail{grid-template-columns:1fr;padding:16px 0 96px}}
  .trd-sidebar{display:block}
  @media(max-width:768px){.trd-sidebar{display:none}}
  .trd-mobile-bar{display:none}
  @media(max-width:768px){.trd-mobile-bar{display:flex}}
  /* Dev mono textarea overrides */
  .trd-tool-area textarea,
  .trd-tool-area pre,
  .trd-tool-area code {
    font-family:'JetBrains Mono',monospace!important;
    font-size:13px!important;
    line-height:1.6!important;
    background:#020817!important;
    border-color:rgba(255,255,255,0.08)!important;
  }
  /* Output area tint (amber for devtools) */
  .trd-tool-area [data-output]>pre,
  .trd-tool-area .output-area {
    background:rgba(59,130,246,0.04)!important;
    border-color:rgba(59,130,246,0.12)!important;
  }
`;

function CategoryHomePage() {
  useEffect(() => { document.title = 'Free Developer Tools —" ToolsRift'; }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search developer tools..."
      />
    </CategoryLayout>
  );
}

function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const ToolComp = TOOL_COMPONENTS[toolId];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = `${tool?.name || toolId} —" Free Developer Tool | ToolsRift`;
    setDrawerOpen(false);
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>— Back to Developer Tools</a>
      </div>
    </CategoryLayout>
  );

  const sidebarTools = TOOLS.filter(t => t.cat === tool.cat);
  const toolData = { name:tool.name, description:tool.desc||'', howTo:null, faq:null };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <style>{DEV_SPECIAL_CSS}</style>
      <div className="trd-detail">
        <aside className="trd-sidebar">
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
                    <span style={{ fontSize:15, flexShrink:0 }}>{t.icon||'—"—'}</span>
                    <span style={{ fontSize:13, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', lineHeight:1.3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        <div style={{ minWidth:0 }} className="trd-tool-area">
          <a href="#/" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.color='#64748B'}
          >— Back to Developer Tools</a>
          <ToolPageLayout theme={PAGE_THEME} tool={toolData}>
            <ToolComp />
          </ToolPageLayout>
        </div>
      </div>

      <div className="trd-mobile-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,9,15,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>{tool.icon||'—"—'} {tool.name}</span>
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
                <span style={{ fontSize:20 }}>{t.icon||'—"—'}</span>
                <span style={{ fontSize:14, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.name}</span>
              </a>
            );
          })}
        </div>
      )}
    </CategoryLayout>
  );
}

function ToolsRiftDevTools() {
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


// export default comes in final chunk after all tool components are attached.
/* =========================
   Chunk 2: Time + Network
   ========================= */

function UnixTimestampTool() {
  const [unixInput, setUnixInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 19));
  const [nowTs, setNowTs] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNowTs(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const parsedUnix = useMemo(() => {
    const ts = n(unixInput);
    const d = new Date(ts * 1000);
    return Number.isFinite(ts) && !isNaN(d.getTime()) ? d : null;
  }, [unixInput]);

  const parsedDate = useMemo(() => {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }, [dateInput]);

  return (
    <VStack>
      <SectionTitle icon="——" title="Unix Timestamp Converter" subtitle="Convert Unix timestamp — human-readable date, with live current timestamp." />
      <Grid2>
        <div>
          <Label>Unix Timestamp (seconds)</Label>
          <Input value={unixInput} onChange={setUnixInput} />
          <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
            {parsedUnix ? parsedUnix.toString() : "Invalid timestamp"}
          </div>
        </div>
        <div>
          <Label>Date Time (ISO-ish input)</Label>
          <Input value={dateInput} onChange={setDateInput} placeholder="YYYY-MM-DDTHH:mm:ss" />
          <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
            {parsedDate ? `Unix: ${Math.floor(parsedDate.getTime() / 1000)}` : "Invalid date"}
          </div>
        </div>
      </Grid2>
      <Card style={{ background: "rgba(59,130,246,.08)" }}>
        <div style={{ fontSize: 12, color: "#93C5FD", marginBottom: 4 }}>Current Unix Timestamp (live)</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 700 }}>{nowTs}</div>
      </Card>
    </VStack>
  );
}

/* ---------- cron helpers ---------- */
const CRON_FIELD_RANGES = [
  { min: 0, max: 59, name: "minute" },
  { min: 0, max: 23, name: "hour" },
  { min: 1, max: 31, name: "dayOfMonth" },
  { min: 1, max: 12, name: "month" },
  { min: 0, max: 6, name: "dayOfWeek" },
];

function expandCronField(expr, min, max) {
  // supports *, */n, a,b,c, a-b, exact
  const out = new Set();
  const parts = String(expr || "*").split(",");
  for (const p0 of parts) {
    const p = p0.trim();
    if (p === "*") {
      for (let i = min; i <= max; i++) out.add(i);
      continue;
    }
    if (p.includes("/")) {
      const [left, stepRaw] = p.split("/");
      const step = Math.max(1, parseInt(stepRaw, 10) || 1);
      let s = min, e = max;
      if (left && left !== "*") {
        if (left.includes("-")) {
          const [a, b] = left.split("-").map((x) => parseInt(x, 10));
          s = Number.isFinite(a) ? a : min;
          e = Number.isFinite(b) ? b : max;
        } else {
          const v = parseInt(left, 10);
          s = e = Number.isFinite(v) ? v : min;
        }
      }
      for (let i = s; i <= e; i += step) if (i >= min && i <= max) out.add(i);
      continue;
    }
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((x) => parseInt(x, 10));
      if (Number.isFinite(a) && Number.isFinite(b)) {
        for (let i = a; i <= b; i++) if (i >= min && i <= max) out.add(i);
      }
      continue;
    }
    const v = parseInt(p, 10);
    if (Number.isFinite(v) && v >= min && v <= max) out.add(v);
  }
  return Array.from(out).sort((a, b) => a - b);
}

function parseCron(expr) {
  const parts = String(expr || "").trim().split(/\s+/);
  if (parts.length !== 5) return { ok: false, error: "Cron must have 5 fields: m h dom mon dow" };
  const vals = parts.map((p, i) => expandCronField(p, CRON_FIELD_RANGES[i].min, CRON_FIELD_RANGES[i].max));
  if (vals.some((v) => v.length === 0)) return { ok: false, error: "One or more fields are invalid." };
  return { ok: true, parts, vals };
}

function nextCronRuns(expr, count = 10) {
  const p = parseCron(expr);
  if (!p.ok) return [];
  const [mins, hours, doms, mons, dows] = p.vals;
  const out = [];
  let d = new Date();
  d.setSeconds(0, 0);
  d = new Date(d.getTime() + 60000);
  let guard = 0;
  while (out.length < count && guard < 600000) {
    guard++;
    const m = d.getMinutes();
    const h = d.getHours();
    const dom = d.getDate();
    const mon = d.getMonth() + 1;
    const dow = d.getDay();
    if (mins.includes(m) && hours.includes(h) && doms.includes(dom) && mons.includes(mon) && dows.includes(dow)) {
      out.push(new Date(d));
    }
    d = new Date(d.getTime() + 60000);
  }
  return out;
}

function humanizeCron(expr) {
  const p = parseCron(expr);
  if (!p.ok) return p.error;
  const [m, h, dom, mon, dow] = p.parts;
  return `Runs when minute="${m}", hour="${h}", day-of-month="${dom}", month="${mon}", day-of-week="${dow}"`;
}

function CronParserTool() {
  const [expr, setExpr] = useState("*/15 * * * *");
  const parsed = useMemo(() => parseCron(expr), [expr]);
  const nextRuns = useMemo(() => nextCronRuns(expr, 10), [expr]);

  return (
    <VStack>
      <SectionTitle icon="—" title="Cron Parser" subtitle="Parse cron expression and show next 10 run times." />
      <div>
        <Label>Cron Expression</Label>
        <Input value={expr} onChange={setExpr} placeholder="m h dom mon dow" />
      </div>
      <Card style={{ background: "rgba(255,255,255,.03)" }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>Human-readable</div>
        <div style={{ fontSize: 14 }}>{humanizeCron(expr)}</div>
      </Card>
      {parsed.ok ? (
        <DataTable
          columns={["#", "Next Run (Local)", "ISO"]}
          rows={nextRuns.map((d, i) => [i + 1, fmtDate(d), d.toISOString()])}
        />
      ) : (
        <Card><div style={{ color: "#FCA5A5", fontSize: 13 }}>{parsed.error}</div></Card>
      )}
    </VStack>
  );
}

function CronGenTool() {
  const [minuteMode, setMinuteMode] = useState("every");
  const [minuteValue, setMinuteValue] = useState("5");
  const [hourMode, setHourMode] = useState("every");
  const [hourValue, setHourValue] = useState("1");
  const [dom, setDom] = useState("*");
  const [mon, setMon] = useState("*");
  const [dow, setDow] = useState("*");

  const minuteExpr = minuteMode === "every" ? "*" : minuteMode === "step" ? `*/${Math.max(1, Math.floor(n(minuteValue)) || 1)}` : String(Math.floor(n(minuteValue)) || 0);
  const hourExpr = hourMode === "every" ? "*" : hourMode === "step" ? `*/${Math.max(1, Math.floor(n(hourValue)) || 1)}` : String(Math.floor(n(hourValue)) || 0);
  const expr = `${minuteExpr} ${hourExpr} ${dom || "*"} ${mon || "*"} ${dow || "*"}`;

  return (
    <VStack>
      <SectionTitle icon="🛠—" title="Cron Generator" subtitle="Generate cron expression from dropdown controls." />
      <Grid3>
        <div>
          <Label>Minute Mode</Label>
          <SelectInput value={minuteMode} onChange={setMinuteMode} options={[
            { value: "every", label: "Every minute (*)" },
            { value: "step", label: "Every N minutes (*/N)" },
            { value: "exact", label: "Exact minute" },
          ]} />
        </div>
        <div>
          <Label>Minute Value</Label>
          <Input value={minuteValue} onChange={setMinuteValue} />
        </div>
        <div>
          <Label>Hour Mode</Label>
          <SelectInput value={hourMode} onChange={setHourMode} options={[
            { value: "every", label: "Every hour (*)" },
            { value: "step", label: "Every N hours (*/N)" },
            { value: "exact", label: "Exact hour" },
          ]} />
        </div>
      </Grid3>
      <Grid3>
        <div><Label>Hour Value</Label><Input value={hourValue} onChange={setHourValue} /></div>
        <div><Label>Day of Month</Label><Input value={dom} onChange={setDom} placeholder="*" /></div>
        <div><Label>Month</Label><Input value={mon} onChange={setMon} placeholder="*" /></div>
      </Grid3>
      <div>
        <Label>Day of Week</Label>
        <Input value={dow} onChange={setDow} placeholder="* (0=Sun..6=Sat)" />
      </div>
      <CodeBox code={expr} />
      <Card style={{ background: "rgba(255,255,255,.03)" }}>
        <div style={{ fontSize: 12, color: C.muted }}>Readable</div>
        <div>{humanizeCron(expr)}</div>
      </Card>
    </VStack>
  );
}

function TimezoneDevTool() {
  const zones = [
    "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin",
    "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney",
  ];
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const rows = zones.map((z) => {
    const d = new Date(now);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: z, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).format(d);
    return [z, fmt];
  });

  return (
    <VStack>
      <SectionTitle icon="—" title="Timezone Dev" subtitle="Current time in major timezones, live-updating." />
      <DataTable columns={["Timezone", "Current Time"]} rows={rows} />
    </VStack>
  );
}

function formatDateByPattern(d, pattern) {
  const z = (x, k = 2) => String(x).padStart(k, "0");
  const map = {
    YYYY: d.getFullYear(),
    YY: String(d.getFullYear()).slice(-2),
    MM: z(d.getMonth() + 1),
    M: d.getMonth() + 1,
    DD: z(d.getDate()),
    D: d.getDate(),
    HH: z(d.getHours()),
    H: d.getHours(),
    mm: z(d.getMinutes()),
    m: d.getMinutes(),
    ss: z(d.getSeconds()),
    s: d.getSeconds(),
  };
  return pattern.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, (k) => map[k]);
}

function DateFormatCalcTool() {
  const [input, setInput] = useState(new Date().toISOString());
  const [custom, setCustom] = useState("YYYY-MM-DD HH:mm:ss");

  const d = useMemo(() => new Date(input), [input]);
  const valid = !isNaN(d.getTime());

  const rows = useMemo(() => {
    if (!valid) return [];
    const unix = Math.floor(d.getTime() / 1000);
    const ms = d.getTime();
    return [
      ["ISO 8601", d.toISOString()],
      ["Unix (seconds)", String(unix)],
      ["Unix (milliseconds)", String(ms)],
      ["RFC 2822", d.toUTCString()],
      ["Locale String", d.toString()],
      ["YYYY-MM-DD", formatDateByPattern(d, "YYYY-MM-DD")],
      ["DD/MM/YYYY", formatDateByPattern(d, "DD/MM/YYYY")],
      ["MM/DD/YYYY", formatDateByPattern(d, "MM/DD/YYYY")],
      ["YYYY/MM/DD", formatDateByPattern(d, "YYYY/MM/DD")],
      ["YYYY-MM-DD HH:mm:ss", formatDateByPattern(d, "YYYY-MM-DD HH:mm:ss")],
      ["HH:mm:ss", formatDateByPattern(d, "HH:mm:ss")],
      ["YY-M-D H:m:s", formatDateByPattern(d, "YY-M-D H:m:s")],
      ["Custom", formatDateByPattern(d, custom)],
      ["Weekday (long)", d.toLocaleDateString("en-US", { weekday: "long" })],
      ["Month (long)", d.toLocaleDateString("en-US", { month: "long" })],
      ["Date only (UTC)", d.toISOString().slice(0, 10)],
      ["Time only (UTC)", d.toISOString().slice(11, 19)],
      ["RFC 3339", d.toISOString()],
      ["toDateString()", d.toDateString()],
      ["toTimeString()", d.toTimeString()],
      ["toLocaleDateString()", d.toLocaleDateString()],
      ["toLocaleTimeString()", d.toLocaleTimeString()],
    ];
  }, [d, valid, custom]);

  return (
    <VStack>
      <SectionTitle icon="—" title="Date Format Calculator" subtitle="Convert dates into 20+ standard and custom formats." />
      <Grid2>
        <div><Label>Date Input</Label><Input value={input} onChange={setInput} placeholder="ISO, RFC, or parseable date string" /></div>
        <div><Label>Custom Pattern</Label><Input value={custom} onChange={setCustom} placeholder="YYYY-MM-DD HH:mm:ss" /></div>
      </Grid2>
      {!valid ? <Card><div style={{ color: "#FCA5A5" }}>Invalid date input.</div></Card> : <DataTable columns={["Format", "Value"]} rows={rows} />}
    </VStack>
  );
}

/* =========================
   Network Tools
   ========================= */

function UrlParserTool() {
  const [url, setUrl] = useState("https://example.com:8080/path/to/page?x=1&y=two#section");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const u = new URL(url);
      const params = Array.from(u.searchParams.entries());
      const queryStr = params.map(([k, v]) => `${k}=${v}`).join(", ");
      setRows([
        ["href", u.href],
        ["protocol", u.protocol],
        ["username", u.username || "—"],
        ["password", u.password ? "••••" : "—"],
        ["host", u.host],
        ["hostname", u.hostname],
        ["port", u.port || "(default)"],
        ["pathname", u.pathname],
        ["search", u.search || "—"],
        ["query params", queryStr || "—"],
        ["hash/fragment", u.hash || "—"],
        ["origin", u.origin],
      ]);
    } catch {
      setRows([["Error", "Invalid URL"]]);
    }
  }, [url]);

  return (
    <VStack>
      <SectionTitle icon="—" title="URL Parser" subtitle="Fully parse protocol, host, port, path, query, fragment." />
      <div><Label>URL</Label><Input value={url} onChange={setUrl} /></div>
      <DataTable columns={["Part", "Value"]} rows={rows} />
    </VStack>
  );
}

function QueryStringBuilderTool() {
  const [pairs, setPairs] = useState([{ key: "q", value: "tools" }, { key: "page", value: "1" }]);
  const [decodeInput, setDecodeInput] = useState("q=hello%20world&page=2");

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    pairs.forEach((p) => {
      if (p.key !== "") sp.append(p.key, p.value ?? "");
    });
    return sp.toString();
  }, [pairs]);

  const decodedRows = useMemo(() => {
    const s = decodeInput.replace(/^\?/, "");
    const sp = new URLSearchParams(s);
    return Array.from(sp.entries()).map(([k, v]) => [k, v]);
  }, [decodeInput]);

  const update = (i, field, v) => {
    setPairs((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: v } : p));
  };
  const addPair = () => setPairs((p) => [...p, { key: "", value: "" }]);
  const removePair = (i) => setPairs((p) => p.filter((_, idx) => idx !== i));

  return (
    <VStack>
      <SectionTitle icon="—" title="Query String Builder" subtitle="Build and encode/decode key-value query strings." />
      {pairs.map((p, i) => (
        <Grid3 key={i}>
          <div><Label>Key</Label><Input value={p.key} onChange={(v) => update(i, "key", v)} /></div>
          <div><Label>Value</Label><Input value={p.value} onChange={(v) => update(i, "value", v)} /></div>
          <div style={{ display: "flex", alignItems: "end" }}><GhostBtn onClick={() => removePair(i)}>Remove</GhostBtn></div>
        </Grid3>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={addPair}>Add Pair</Btn>
        <GhostBtn onClick={() => copyText(query)}>Copy Query</GhostBtn>
      </div>
      <CodeBox code={`?${query}`} />
      <div>
        <Label>Decode Query String</Label>
        <Input value={decodeInput} onChange={setDecodeInput} />
      </div>
      <DataTable columns={["Key", "Value"]} rows={decodedRows.length ? decodedRows : [["—", "No params"]]} />
    </VStack>
  );
}

function UserAgentParserTool() {
  const [ua, setUa] = useState(typeof navigator !== "undefined" ? navigator.userAgent : "");

  const parsed = useMemo(() => {
    const s = ua;
    const browser =
      /Edg\//.test(s) ? "Edge" :
      /OPR\//.test(s) ? "Opera" :
      /Chrome\//.test(s) ? "Chrome" :
      /Firefox\//.test(s) ? "Firefox" :
      /Safari\//.test(s) && /Version\//.test(s) ? "Safari" : "Unknown";

    const engine =
      /AppleWebKit\//.test(s) ? "WebKit" :
      /Gecko\//.test(s) ? "Gecko" :
      /Trident\//.test(s) ? "Trident" : "Unknown";

    const os =
      /Windows NT/.test(s) ? "Windows" :
      /Mac OS X/.test(s) ? "macOS" :
      /Android/.test(s) ? "Android" :
      /iPhone|iPad|iPod/.test(s) ? "iOS" :
      /Linux/.test(s) ? "Linux" : "Unknown";

    const device =
      /Mobile|iPhone|Android/.test(s) ? "Mobile" :
      /iPad|Tablet/.test(s) ? "Tablet" : "Desktop";

    const browserVer =
      (s.match(/Edg\/([\d.]+)/) || s.match(/OPR\/([\d.]+)/) || s.match(/Chrome\/([\d.]+)/) || s.match(/Firefox\/([\d.]+)/) || s.match(/Version\/([\d.]+)/) || [])[1] || "Unknown";

    return { browser, browserVer, os, device, engine };
  }, [ua]);

  return (
    <VStack>
      <SectionTitle icon="🕵—" title="User-Agent Parser" subtitle="Extract browser, OS, device, and engine details." />
      <div><Label>User-Agent String</Label><Textarea value={ua} onChange={setUa} rows={5} /></div>
      <DataTable columns={["Field", "Value"]} rows={[
        ["Browser", `${parsed.browser} ${parsed.browserVer}`],
        ["OS", parsed.os],
        ["Device", parsed.device],
        ["Engine", parsed.engine],
      ]} />
    </VStack>
  );
}

/* IP helpers */
function ipv4ToInt(ip) {
  const parts = ip.split(".").map((x) => parseInt(x, 10));
  if (parts.length !== 4 || parts.some((x) => !Number.isInteger(x) || x < 0 || x > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}
function intToIpv4(i) {
  return [(i >>> 24) & 255, (i >>> 16) & 255, (i >>> 8) & 255, i & 255].join(".");
}
function ipv4Class(first) {
  if (first >= 1 && first <= 126) return "A";
  if (first >= 128 && first <= 191) return "B";
  if (first >= 192 && first <= 223) return "C";
  if (first >= 224 && first <= 239) return "D (Multicast)";
  if (first >= 240 && first <= 255) return "E (Experimental)";
  return "Unknown";
}
function ipv4Binary(ip) {
  return ip.split(".").map((x) => String(parseInt(x, 10)).padStart(1, "0")).map((x) => Number(x).toString(2).padStart(8, "0")).join(".");
}
function isPrivateIpv4(ip) {
  const p = ip.split(".").map(Number);
  if (p[0] === 10) return true;
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
  if (p[0] === 192 && p[1] === 168) return true;
  return false;
}
function isIPv6(str) {
  return /^[0-9a-fA-F:]+$/.test(str) && str.includes(":");
}

function IpInfoTool() {
  const [ip, setIp] = useState("192.168.1.10");

  const rows = useMemo(() => {
    if (isIPv6(ip)) {
      return [
        ["Version", "IPv6"],
        ["Type", /::1/.test(ip) ? "Loopback" : ip.startsWith("fe80") ? "Link-local" : ip.startsWith("fc") || ip.startsWith("fd") ? "Unique local" : "Global/Other"],
        ["Binary representation", "Expanded binary rendering omitted (very long)."],
      ];
    }
    const iv = ipv4ToInt(ip);
    if (iv == null) return [["Error", "Invalid IPv4/IPv6 address"]];
    const first = parseInt(ip.split(".")[0], 10);
    return [
      ["Version", "IPv4"],
      ["Class", ipv4Class(first)],
      ["Type", isPrivateIpv4(ip) ? "Private" : "Public"],
      ["Decimal integer", String(iv >>> 0)],
      ["Binary", ipv4Binary(ip)],
      ["Hex", "0x" + (iv >>> 0).toString(16).toUpperCase()],
    ];
  }, [ip]);

  return (
    <VStack>
      <SectionTitle icon="🧠" title="IP Info" subtitle="Inspect IPv4/IPv6 class, type, and binary representation." />
      <div><Label>IP Address</Label><Input value={ip} onChange={setIp} /></div>
      <DataTable columns={["Property", "Value"]} rows={rows} />
    </VStack>
  );
}

function CidrCalcTool() {
  const [cidr, setCidr] = useState("192.168.1.10/24");

  const out = useMemo(() => {
    const [ip, prefixRaw] = cidr.split("/");
    const prefix = parseInt(prefixRaw, 10);
    const ipInt = ipv4ToInt(ip || "");
    if (ipInt == null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
      return { err: "Invalid CIDR (expect IPv4/prefix like 192.168.1.10/24)" };
    }
    const mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
    const network = ipInt & mask;
    const broadcast = network | (~mask >>> 0);
    const hosts = prefix >= 31 ? 0 : Math.max(0, (2 ** (32 - prefix)) - 2);
    return {
      network: intToIpv4(network >>> 0),
      broadcast: intToIpv4(broadcast >>> 0),
      netmask: intToIpv4(mask >>> 0),
      wildcard: intToIpv4((~mask) >>> 0),
      firstHost: prefix >= 31 ? "N/A" : intToIpv4((network + 1) >>> 0),
      lastHost: prefix >= 31 ? "N/A" : intToIpv4((broadcast - 1) >>> 0),
      hosts,
      prefix,
    };
  }, [cidr]);

  return (
    <VStack>
      <SectionTitle icon="—" title="CIDR Calculator" subtitle="Compute network range, broadcast, netmask and hosts." />
      <div><Label>CIDR Notation</Label><Input value={cidr} onChange={setCidr} /></div>
      {"err" in out ? (
        <Card><div style={{ color: "#FCA5A5" }}>{out.err}</div></Card>
      ) : (
        <DataTable columns={["Field", "Value"]} rows={[
          ["Prefix", `/${out.prefix}`],
          ["Netmask", out.netmask],
          ["Wildcard", out.wildcard],
          ["Network", out.network],
          ["Broadcast", out.broadcast],
          ["First host", out.firstHost],
          ["Last host", out.lastHost],
          ["Available hosts", String(out.hosts)],
        ]} />
      )}
    </VStack>
  );
}

const HTTP_STATUS_DATA = [
  [100,"Continue"],[101,"Switching Protocols"],[102,"Processing"],[103,"Early Hints"],
  [200,"OK"],[201,"Created"],[202,"Accepted"],[203,"Non-Authoritative Information"],[204,"No Content"],[205,"Reset Content"],[206,"Partial Content"],[207,"Multi-Status"],[208,"Already Reported"],[226,"IM Used"],
  [300,"Multiple Choices"],[301,"Moved Permanently"],[302,"Found"],[303,"See Other"],[304,"Not Modified"],[305,"Use Proxy"],[307,"Temporary Redirect"],[308,"Permanent Redirect"],
  [400,"Bad Request"],[401,"Unauthorized"],[402,"Payment Required"],[403,"Forbidden"],[404,"Not Found"],[405,"Method Not Allowed"],[406,"Not Acceptable"],[407,"Proxy Authentication Required"],[408,"Request Timeout"],[409,"Conflict"],[410,"Gone"],[411,"Length Required"],[412,"Precondition Failed"],[413,"Payload Too Large"],[414,"URI Too Long"],[415,"Unsupported Media Type"],[416,"Range Not Satisfiable"],[417,"Expectation Failed"],[418,"I'm a teapot"],[421,"Misdirected Request"],[422,"Unprocessable Entity"],[423,"Locked"],[424,"Failed Dependency"],[425,"Too Early"],[426,"Upgrade Required"],[428,"Precondition Required"],[429,"Too Many Requests"],[431,"Request Header Fields Too Large"],[451,"Unavailable For Legal Reasons"],
  [500,"Internal Server Error"],[501,"Not Implemented"],[502,"Bad Gateway"],[503,"Service Unavailable"],[504,"Gateway Timeout"],[505,"HTTP Version Not Supported"],[506,"Variant Also Negotiates"],[507,"Insufficient Storage"],[508,"Loop Detected"],[510,"Not Extended"],[511,"Network Authentication Required"],
];

function HttpStatusCodesTool() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return HTTP_STATUS_DATA
      .filter(([c, t]) => !s || String(c).includes(s) || t.toLowerCase().includes(s))
      .map(([c, t]) => [String(c), t, `${Math.floor(c / 100)}xx`]);
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="—" title="HTTP Status Codes" subtitle="Searchable reference of HTTP response status codes." />
      <div><Label>Search</Label><Input value={q} onChange={setQ} placeholder="e.g. 404, timeout, created" /></div>
      <DataTable columns={["Code", "Description", "Class"]} rows={rows} maxHeight={460} />
    </VStack>
  );
}

const MIME_DATA = [
  ["html","text/html"],["htm","text/html"],["css","text/css"],["js","application/javascript"],["mjs","application/javascript"],
  ["json","application/json"],["xml","application/xml"],["txt","text/plain"],["csv","text/csv"],["md","text/markdown"],
  ["png","image/png"],["jpg","image/jpeg"],["jpeg","image/jpeg"],["gif","image/gif"],["webp","image/webp"],["svg","image/svg+xml"],["ico","image/x-icon"],["bmp","image/bmp"],
  ["mp3","audio/mpeg"],["wav","audio/wav"],["ogg","audio/ogg"],["mp4","video/mp4"],["webm","video/webm"],["avi","video/x-msvideo"],["mov","video/quicktime"],
  ["pdf","application/pdf"],["zip","application/zip"],["gz","application/gzip"],["tar","application/x-tar"],["rar","application/vnd.rar"],["7z","application/x-7z-compressed"],
  ["woff","font/woff"],["woff2","font/woff2"],["ttf","font/ttf"],["otf","font/otf"],["eot","application/vnd.ms-fontobject"],
  ["wasm","application/wasm"],["apk","application/vnd.android.package-archive"],["exe","application/vnd.microsoft.portable-executable"],
];

function MimeTypesTool() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return MIME_DATA
      .filter(([ext, mime]) => !s || ext.includes(s) || mime.toLowerCase().includes(s))
      .map(([ext, mime]) => [ext, mime]);
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="🧷" title="MIME Types Reference" subtitle="Search extension — MIME type mappings." />
      <div><Label>Search</Label><Input value={q} onChange={setQ} placeholder="e.g. json, image/, pdf, woff2" /></div>
      <DataTable columns={["Extension", "MIME Type"]} rows={rows} maxHeight={460} />
    </VStack>
  );
}

/* attach Chunk 2 tools */
Object.assign(TOOL_COMPONENTS, {
  "unix-timestamp": UnixTimestampTool,
  "cron-parser": CronParserTool,
  "cron-gen": CronGenTool,
  "timezone-dev": TimezoneDevTool,
  "date-format-calc": DateFormatCalcTool,

  "url-parser": UrlParserTool,
  "query-string-builder": QueryStringBuilderTool,
  "user-agent-parser": UserAgentParserTool,
  "ip-info": IpInfoTool,
  "cidr-calc": CidrCalcTool,
  "http-status-codes": HttpStatusCodesTool,
  "mime-types": MimeTypesTool,
});
/* =========================
   Chunk 3: Text tools
   ========================= */

/* ---------- diff-checker ---------- */
function computeLineDiff(leftText, rightText) {
  const a = String(leftText || "").split("\n");
  const b = String(rightText || "").split("\n");
  const max = Math.max(a.length, b.length);
  const rows = [];
  for (let i = 0; i < max; i++) {
    const l = a[i] ?? "";
    const r = b[i] ?? "";
    if (l === r) {
      rows.push({ type: "same", left: l, right: r, line: i + 1 });
    } else {
      rows.push({ type: "changed", left: l, right: r, line: i + 1 });
    }
  }
  return rows;
}

function DiffCheckerTool() {
  const [left, setLeft] = useState("const x = 1;\nconsole.log(x);\nreturn true;");
  const [right, setRight] = useState("const x = 2;\nconsole.log(x);\nreturn true;\n// done");

  const rows = useMemo(() => computeLineDiff(left, right), [left, right]);

  return (
    <VStack>
      <SectionTitle icon="🧬" title="Diff Checker" subtitle="Line-by-line comparison with removed lines in red, added in green, unchanged normal." />
      <Grid2>
        <div>
          <Label>Left / Original</Label>
          <Textarea value={left} onChange={setLeft} rows={12} />
        </div>
        <div>
          <Label>Right / New</Label>
          <Textarea value={right} onChange={setRight} rows={12} />
        </div>
      </Grid2>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "rgba(255,255,255,.04)", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ padding: "8px 10px", fontSize: 12, color: C.muted }}>Left</div>
          <div style={{ padding: "8px 10px", fontSize: 12, color: C.muted, borderLeft: `1px solid ${C.border}` }}>Right</div>
        </div>
        <div style={{ maxHeight: 360, overflow: "auto" }}>
          {rows.map((r, idx) => {
            const leftBg = r.type === "same" ? "transparent" : "rgba(239,68,68,0.18)";
            const rightBg = r.type === "same" ? "transparent" : "rgba(34,197,94,0.18)";
            return (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", padding: "7px 10px", background: leftBg, fontSize: 12 }}>
{r.left || " "}
                </pre>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", padding: "7px 10px", background: rightBg, borderLeft: `1px solid ${C.border}`, fontSize: 12 }}>
{r.right || " "}
                </pre>
              </div>
            );
          })}
        </div>
      </Card>
    </VStack>
  );
}

/* ---------- regex-tester-adv ---------- */
function RegexTesterAdvTool() {
  const [pattern, setPattern] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("gi");
  const [input, setInput] = useState("Contact us at support@example.com or admin@toolsrift.dev");
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceWith, setReplaceWith] = useState("[email]");
  const [error, setError] = useState("");

  const regex = useMemo(() => {
    try {
      setError("");
      return new RegExp(pattern, flags);
    } catch (e) {
      setError(String(e.message || e));
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex) return [];
    const out = [];
    let m;
    const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    while ((m = r.exec(input)) !== null) {
      out.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1),
      });
      if (m.index === r.lastIndex) r.lastIndex++;
    }
    return out;
  }, [regex, input]);

  const highlighted = useMemo(() => {
    if (!regex) return esc(input);
    const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    let last = 0;
    let html = "";
    let m;
    while ((m = r.exec(input)) !== null) {
      html += esc(input.slice(last, m.index));
      html += `<mark style="background:#FDE68A;color:#111;padding:0 2px;border-radius:2px">${esc(m[0])}</mark>`;
      last = m.index + m[0].length;
      if (m.index === r.lastIndex) r.lastIndex++;
    }
    html += esc(input.slice(last));
    return html;
  }, [regex, input]);

  const replaced = useMemo(() => {
    if (!regex) return "";
    try { return input.replace(regex, replaceWith); } catch { return ""; }
  }, [regex, input, replaceWith]);

  const cheatRows = [
    ["\\d", "digit"], ["\\w", "word char"], ["\\s", "whitespace"],
    [".", "any char"], ["^ / $", "start / end"], ["[abc]", "char set"],
    ["[^abc]", "negated set"], ["a|b", "alternation"], ["(group)", "capturing group"],
    ["(?:group)", "non-capturing group"], ["\\b", "word boundary"], ["{n,m}", "range quantifier"],
  ];

  return (
    <VStack>
      <SectionTitle icon="🧪" title="Regex Tester Advanced" subtitle="Flags, groups, replace mode, and inline yellow-highlighted matches." />
      <Grid3>
        <div><Label>Pattern</Label><Input value={pattern} onChange={setPattern} /></div>
        <div><Label>Flags</Label><Input value={flags} onChange={setFlags} placeholder="gimsyu" /></div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <GhostBtn onClick={() => setReplaceMode((v) => !v)}>{replaceMode ? "Disable Replace Mode" : "Enable Replace Mode"}</GhostBtn>
        </div>
      </Grid3>
      {replaceMode && <div><Label>Replace With</Label><Input value={replaceWith} onChange={setReplaceWith} /></div>}
      <div><Label>Test Input</Label><Textarea value={input} onChange={setInput} rows={8} /></div>

      {error ? <Card><div style={{ color: "#FCA5A5" }}>{error}</div></Card> : (
        <>
          <Card>
            <Label>Highlighted Matches</Label>
            <div style={{ minHeight: 64, lineHeight: 1.7, whiteSpace: "pre-wrap", fontSize: 13 }} dangerouslySetInnerHTML={{ __html: highlighted }} />
          </Card>

          <DataTable
            columns={["#", "Match", "Index", "Groups"]}
            rows={matches.map((m, i) => [String(i + 1), m.match, String(m.index), m.groups.length ? m.groups.join(" | ") : "—"])}
          />

          {replaceMode && (
            <Card>
              <Label>Replace Result</Label>
              <CodeBox code={replaced} />
            </Card>
          )}
        </>
      )}

      <Card>
        <Label>Regex Cheat Sheet</Label>
        <DataTable columns={["Token", "Meaning"]} rows={cheatRows} />
      </Card>
    </VStack>
  );
}

/* ---------- curl-builder ---------- */
function CurlBuilderTool() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.example.com/users");
  const [headers, setHeaders] = useState([{ k: "Content-Type", v: "application/json" }]);
  const [body, setBody] = useState('{\n  "name": "Alice"\n}');

  const cmd = useMemo(() => {
    const parts = [`curl -X ${method}`];
    headers.forEach((h) => {
      if (h.k.trim()) parts.push(`-H "${h.k}: ${h.v}"`);
    });
    if (!["GET", "HEAD"].includes(method) && body.trim()) parts.push(`--data '${body.replace(/'/g, `'\\''`)}'`);
    parts.push(`"${url}"`);
    return parts.join(" \\\n  ");
  }, [method, url, headers, body]);

  const setHeader = (i, field, val) => setHeaders((prev) => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h));

  return (
    <VStack>
      <SectionTitle icon="—" title="cURL Builder" subtitle="Build cURL commands from method, URL, headers, and body input." />
      <Grid2>
        <div>
          <Label>Method</Label>
          <SelectInput value={method} onChange={setMethod} options={["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map((m) => ({ value: m, label: m }))} />
        </div>
        <div>
          <Label>URL</Label>
          <Input value={url} onChange={setUrl} />
        </div>
      </Grid2>

      <Card>
        <Label>Headers</Label>
        <VStack>
          {headers.map((h, i) => (
            <Grid3 key={i}>
              <div><Input value={h.k} onChange={(v) => setHeader(i, "k", v)} placeholder="Header name" /></div>
              <div><Input value={h.v} onChange={(v) => setHeader(i, "v", v)} placeholder="Header value" /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <GhostBtn onClick={() => setHeaders((prev) => prev.filter((_, x) => x !== i))}>Remove</GhostBtn>
              </div>
            </Grid3>
          ))}
          <Btn onClick={() => setHeaders((prev) => [...prev, { k: "", v: "" }])}>Add Header</Btn>
        </VStack>
      </Card>

      {!["GET","HEAD"].includes(method) && (
        <div>
          <Label>Body</Label>
          <Textarea value={body} onChange={setBody} rows={8} />
        </div>
      )}

      <CodeBox code={cmd} />
      <div style={{ display: "flex", gap: 8 }}>
        <GhostBtn onClick={() => copyText(cmd)}>Copy cURL</GhostBtn>
      </div>
    </VStack>
  );
}

/* ---------- curl-to-code ---------- */
function parseCurlBasic(curl) {
  const method = (curl.match(/-X\s+([A-Z]+)/i) || [])[1] || "GET";
  const url = (curl.match(/"(https?:\/\/[^"]+)"/i) || curl.match(/'(https?:\/\/[^']+)'/i) || [])[1] || "";
  const headerMatches = [...curl.matchAll(/-H\s+"([^"]+)"/g), ...curl.matchAll(/-H\s+'([^']+)'/g)];
  const headers = {};
  headerMatches.forEach((m) => {
    const line = m[1];
    const idx = line.indexOf(":");
    if (idx > -1) headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  const body = (curl.match(/--data\s+'([\s\S]*?)'/) || curl.match(/--data\s+"([\s\S]*?)"/) || [])[1] || "";
  return { method, url, headers, body };
}

function CurlToCodeTool() {
  const [curl, setCurl] = useState(`curl -X POST \\
  -H "Content-Type: application/json" \\
  --data '{"name":"Alice"}' \\
  "https://api.example.com/users"`);

  const p = useMemo(() => parseCurlBasic(curl), [curl]);

  const jsCode = `fetch("${p.url}", {
  method: "${p.method}",
  headers: ${JSON.stringify(p.headers, null, 2)},
  ${p.body ? `body: ${JSON.stringify(p.body)},` : ""}
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);`;

  const pyCode = `import requests

url = "${p.url}"
headers = ${JSON.stringify(p.headers, null, 2)}
${p.body ? `data = ${JSON.stringify(p.body)}` : "data = None"}

resp = requests.request("${p.method}", url, headers=headers, data=data)
print(resp.status_code)
print(resp.text)`;

  const phpCode = `<?php
$ch = curl_init("${p.url}");
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${p.method}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
${Object.entries(p.headers).map(([k, v]) => `  "${k}: ${v}",`).join("\n")}
]);
${p.body ? `curl_setopt($ch, CURLOPT_POSTFIELDS, '${p.body.replace(/'/g, "\\'")}');` : ""}
$response = curl_exec($ch);
curl_close($ch);
echo $response;`;

  const goCode = `package main

import (
  "fmt"
  "io"
  "net/http"
  "strings"
)

func main() {
  payload := strings.NewReader(${JSON.stringify(p.body || "")})
  req, _ := http.NewRequest("${p.method}", "${p.url}", payload)
${Object.entries(p.headers).map(([k, v]) => `  req.Header.Set("${k}", "${v}")`).join("\n")}
  client := &http.Client{}
  res, _ := client.Do(req)
  defer res.Body.Close()
  body, _ := io.ReadAll(res.Body)
  fmt.Println(string(body))
}`;

  const [lang, setLang] = useState("javascript");
  const code = lang === "javascript" ? jsCode : lang === "python" ? pyCode : lang === "php" ? phpCode : goCode;

  return (
    <VStack>
      <SectionTitle icon="—" title="cURL to Code" subtitle="Convert cURL command into Python / JavaScript / PHP / Go snippets." />
      <div><Label>cURL Command</Label><Textarea value={curl} onChange={setCurl} rows={9} /></div>
      <Grid2>
        <div>
          <Label>Output Language</Label>
          <SelectInput value={lang} onChange={setLang} options={[
            { value: "javascript", label: "JavaScript (fetch)" },
            { value: "python", label: "Python (requests)" },
            { value: "php", label: "PHP (cURL)" },
            { value: "go", label: "Go (net/http)" },
          ]} />
        </div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <GhostBtn onClick={() => copyText(code)}>Copy Code</GhostBtn>
        </div>
      </Grid2>
      <CodeBox code={code} />
    </VStack>
  );
}

/* ---------- jwt-debugger ---------- */
function b64UrlToUtf8(input) {
  try {
    const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((input.length + 3) % 4);
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}
async function hmacSHA256(key, msg) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(msg));
  const b = Array.from(new Uint8Array(sig)).map((x) => String.fromCharCode(x)).join("");
  return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function JwtDebuggerTool() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyRes, setVerifyRes] = useState("Not verified");

  const parts = useMemo(() => String(token || "").split("."), [token]);
  const [h, p, s] = parts.length >= 3 ? parts : ["", "", ""];

  const decodedHeader = useMemo(() => b64UrlToUtf8(h), [h]);
  const decodedPayload = useMemo(() => b64UrlToUtf8(p), [p]);

  const headerJson = useMemo(() => {
    try { return JSON.stringify(JSON.parse(decodedHeader || "{}"), null, 2); } catch { return decodedHeader || "Invalid header"; }
  }, [decodedHeader]);
  const payloadJson = useMemo(() => {
    try { return JSON.stringify(JSON.parse(decodedPayload || "{}"), null, 2); } catch { return decodedPayload || "Invalid payload"; }
  }, [decodedPayload]);

  const verify = async () => {
    if (!secret || !h || !p || !s) { setVerifyRes("Provide token + secret"); return; }
    try {
      const data = `${h}.${p}`;
      const sig = await hmacSHA256(secret, data);
      setVerifyRes(sig === s ? "✅ Signature valid (HS256)" : "—— Signature mismatch");
    } catch {
      setVerifyRes("Verification failed");
    }
  };

  return (
    <VStack>
      <SectionTitle icon="—" title="JWT Debugger" subtitle="Decode header/payload/signature and verify HS256 signature." />
      <div><Label>JWT Token</Label><Textarea value={token} onChange={setToken} rows={7} /></div>
      <Grid2>
        <div><Label>Secret (for HS256 verify)</Label><Input value={secret} onChange={setSecret} /></div>
        <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
          <Btn onClick={verify}>Verify Signature</Btn>
          <div style={{ fontSize: 12, color: C.muted }}>{verifyRes}</div>
        </div>
      </Grid2>

      <Grid3>
        <Card style={{ background: "rgba(59,130,246,.18)", borderColor: "rgba(59,130,246,.45)" }}>
          <Label>Header (Blue)</Label>
          <CodeBox code={headerJson} />
        </Card>
        <Card style={{ background: "rgba(168,85,247,.18)", borderColor: "rgba(168,85,247,.45)" }}>
          <Label>Payload (Purple)</Label>
          <CodeBox code={payloadJson} />
        </Card>
        <Card style={{ background: "rgba(239,68,68,.18)", borderColor: "rgba(239,68,68,.45)" }}>
          <Label>Signature (Red)</Label>
          <CodeBox code={s || "(missing)"} />
        </Card>
      </Grid3>
    </VStack>
  );
}

/* ---------- chmod-calc ---------- */
const PERM_BITS = [
  { who: "owner", r: 4, w: 2, x: 1 },
  { who: "group", r: 4, w: 2, x: 1 },
  { who: "other", r: 4, w: 2, x: 1 },
];
function symbolFromFlags(f) {
  const seg = (o) => `${o.r ? "r" : "-"}${o.w ? "w" : "-"}${o.x ? "x" : "-"}`;
  return `${seg(f.owner)}${seg(f.group)}${seg(f.other)}`;
}
function octalFromFlags(f) {
  const num = (o) => (o.r ? 4 : 0) + (o.w ? 2 : 0) + (o.x ? 1 : 0);
  return `${num(f.owner)}${num(f.group)}${num(f.other)}`;
}
function flagsFromOctal(oct) {
  const s = String(oct).replace(/[^\d]/g, "").slice(0, 3).padEnd(3, "0");
  const toObj = (d) => {
    const v = Number(d);
    return { r: !!(v & 4), w: !!(v & 2), x: !!(v & 1) };
  };
  return { owner: toObj(s[0]), group: toObj(s[1]), other: toObj(s[2]) };
}

function ChmodCalcTool() {
  const [flags, setFlags] = useState(flagsFromOctal("755"));
  const [octal, setOctal] = useState("755");

  useEffect(() => {
    setOctal(octalFromFlags(flags));
  }, [flags]);

  const toggle = (who, key) => setFlags((prev) => ({ ...prev, [who]: { ...prev[who], [key]: !prev[who][key] } }));

  const applyOctal = (v) => {
    setOctal(v);
    if (/^\d{3}$/.test(v)) setFlags(flagsFromOctal(v));
  };

  const symbolic = useMemo(() => symbolFromFlags(flags), [flags]);

  return (
    <VStack>
      <SectionTitle icon="🧩" title="Chmod Calculator" subtitle="3×3 permission checkbox grid with symbolic — octal conversion." />
      <Grid2>
        <div><Label>Octal</Label><Input value={octal} onChange={applyOctal} /></div>
        <div><Label>Symbolic</Label><Input value={symbolic} onChange={() => {}} /></div>
      </Grid2>

      <Card>
        <Label>Permissions Grid (Owner / Group / Other × Read / Write / Execute)</Label>
        <div style={{ display: "grid", gridTemplateColumns: "140px repeat(3, 100px)", gap: 8, alignItems: "center" }}>
          <div></div><div style={T.label}>Read</div><div style={T.label}>Write</div><div style={T.label}>Execute</div>
          {["owner", "group", "other"].map((who) => (
            <>
              <div key={`${who}-label`} style={{ textTransform: "capitalize", color: C.text, fontSize: 13 }}>{who}</div>
              {["r", "w", "x"].map((k) => (
                <label key={`${who}-${k}`} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <input type="checkbox" checked={flags[who][k]} onChange={() => toggle(who, k)} />
                  {k.toUpperCase()}
                </label>
              ))}
            </>
          ))}
        </div>
      </Card>
    </VStack>
  );
}

/* ---------- crontab-guru ---------- */
function CrontabGuruTool() {
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("9");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("1-5");

  const expr = `${minute} ${hour} ${dom} ${month} ${dow}`;
  const nextRuns = useMemo(() => getNextCronRuns(expr, 10), [expr]);

  const readable = useMemo(() => {
    const dowTxt = dow === "*" ? "every day" :
      dow.split(",").map((x) => {
        if (x.includes("-")) {
          const [a, b] = x.split("-").map(Number);
          return `${DOW_NAMES[a] || a}-${DOW_NAMES[b] || b}`;
        }
        return DOW_NAMES[Number(x)] || x;
      }).join(", ");
    const monTxt = month === "*" ? "every month" :
      month.split(",").map((x) => MON_NAMES[Number(x) - 1] || x).join(", ");
    return `At ${hour}:${String(minute).padStart(2, "0")} on ${dom === "*" ? "every day-of-month" : `day ${dom}`}, ${monTxt}, ${dowTxt}.`;
  }, [minute, hour, dom, month, dow]);

  return (
    <VStack>
      <SectionTitle icon="—" title="Crontab Guru (Visual Builder)" subtitle="Build cron schedule visually and get human-readable explanation + next runs." />
      <Grid3>
        <div><Label>Minute</Label><Input value={minute} onChange={setMinute} /></div>
        <div><Label>Hour</Label><Input value={hour} onChange={setHour} /></div>
        <div><Label>Day of Month</Label><Input value={dom} onChange={setDom} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Month</Label><Input value={month} onChange={setMonth} /></div>
        <div><Label>Day of Week</Label><Input value={dow} onChange={setDow} placeholder="0-6 or ranges, commas" /></div>
      </Grid2>

      <CodeBox code={expr} />
      <Card style={{ background: "rgba(255,255,255,.03)" }}>
        <Label>Human-readable Output</Label>
        <div>{readable}</div>
      </Card>
      <DataTable
        columns={["#", "Next Run (Local)", "ISO"]}
        rows={nextRuns.map((d, i) => [String(i + 1), formatLocalDateTime(d), d.toISOString()])}
      />
    </VStack>
  );
}

/* ---------- register Chunk 3 tools ---------- */
Object.assign(TOOL_COMPONENTS, {
  "diff-checker": DiffCheckerTool,
  "regex-tester-adv": RegexTesterAdvTool,
  "curl-builder": CurlBuilderTool,
  "curl-to-code": CurlToCodeTool,
  "jwt-debugger": JwtDebuggerTool,
  "chmod-calc": ChmodCalcTool,
  "crontab-guru": CrontabGuruTool,
});
/* =========================
   Chunk 4: Reference tools
   ========================= */

/* ---------- shared reference data ---------- */
const CONTROL_NAMES = {
  0: "NUL", 1: "SOH", 2: "STX", 3: "ETX", 4: "EOT", 5: "ENQ", 6: "ACK", 7: "BEL",
  8: "BS", 9: "TAB", 10: "LF", 11: "VT", 12: "FF", 13: "CR", 14: "SO", 15: "SI",
  16: "DLE", 17: "DC1", 18: "DC2", 19: "DC3", 20: "DC4", 21: "NAK", 22: "SYN", 23: "ETB",
  24: "CAN", 25: "EM", 26: "SUB", 27: "ESC", 28: "FS", 29: "GS", 30: "RS", 31: "US", 127: "DEL",
};

const HTML_ENTITIES = [
  ["&amp;", "&", "Ampersand"],
  ["&lt;", "<", "Less-than"],
  ["&gt;", ">", "Greater-than"],
  ["&quot;", `"`, "Double quote"],
  ["&apos;", `'`, "Single quote"],
  ["&nbsp;", " ", "Non-breaking space"],
  ["&copy;", "©", "Copyright"],
  ["&reg;", "®", "Registered"],
  ["&trade;", "™", "Trademark"],
  ["&euro;", "€", "Euro"],
  ["&pound;", "£", "Pound"],
  ["&yen;", "¥", "Yen"],
  ["&cent;", "¢", "Cent"],
  ["&sect;", "§", "Section sign"],
  ["&para;", "¶", "Paragraph sign"],
  ["&middot;", "·", "Middle dot"],
  ["&laquo;", "«", "Left guillemet"],
  ["&raquo;", "»", "Right guillemet"],
  ["&mdash;", "—", "Em dash"],
  ["&ndash;", "—", "En dash"],
  ["&hellip;", "…", "Ellipsis"],
  ["&bull;", "•", "Bullet"],
  ["&deg;", "°", "Degree"],
  ["&plusmn;", "±", "Plus-minus"],
  ["&times;", "×", "Multiply"],
  ["&divide;", "÷", "Divide"],
  ["&le;", "≤", "Less or equal"],
  ["&ge;", "≥", "Greater or equal"],
  ["&ne;", "≠", "Not equal"],
  ["&asymp;", "≈", "Approximately"],
  ["&infin;", "∞", "Infinity"],
  ["&alpha;", "α", "Alpha"],
  ["&beta;", "β", "Beta"],
  ["&gamma;", "γ", "Gamma"],
  ["&delta;", "δ", "Delta"],
  ["&pi;", "π", "Pi"],
  ["&sigma;", "σ", "Sigma"],
  ["&omega;", "ω", "Omega"],
];

const CSS_UNITS = [
  ["px", "Absolute", "Pixels", "width: 240px"],
  ["pt", "Absolute", "Points (1/72 in)", "font-size: 12pt"],
  ["pc", "Absolute", "Picas (12pt)", "font-size: 1pc"],
  ["cm", "Absolute", "Centimeters", "width: 5cm"],
  ["mm", "Absolute", "Millimeters", "width: 40mm"],
  ["in", "Absolute", "Inches", "width: 2in"],
  ["Q", "Absolute", "Quarter-millimeters", "width: 80Q"],
  ["em", "Relative", "Relative to font-size", "font-size: 1.25em"],
  ["rem", "Relative", "Relative to root font-size", "font-size: 1.25rem"],
  ["ex", "Relative", "x-height of element font", "font-size: 2ex"],
  ["ch", "Relative", "Width of “0— glyph", "width: 20ch"],
  ["lh", "Relative", "Line height of element", "margin-top: 2lh"],
  ["rlh", "Relative", "Root line height", "margin-top: 1rlh"],
  ["vw", "Viewport", "1% viewport width", "width: 50vw"],
  ["vh", "Viewport", "1% viewport height", "height: 30vh"],
  ["vmin", "Viewport", "1% smaller viewport axis", "width: 20vmin"],
  ["vmax", "Viewport", "1% larger viewport axis", "width: 20vmax"],
  ["svw", "Viewport", "Small viewport width", "width: 30svw"],
  ["svh", "Viewport", "Small viewport height", "height: 30svh"],
  ["lvw", "Viewport", "Large viewport width", "width: 30lvw"],
  ["lvh", "Viewport", "Large viewport height", "height: 30lvh"],
  ["dvw", "Viewport", "Dynamic viewport width", "width: 30dvw"],
  ["dvh", "Viewport", "Dynamic viewport height", "height: 30dvh"],
  ["%", "Relative", "Percentage of containing block", "width: 75%"],
];

const GIT_COMMANDS = [
  ["Setup", "git config --global user.name \"Your Name\"", "Set global username"],
  ["Setup", "git config --global user.email \"you@example.com\"", "Set global email"],
  ["Create", "git init", "Initialize repository"],
  ["Create", "git clone <url>", "Clone repository"],
  ["Stage", "git add .", "Stage all changes"],
  ["Stage", "git add <file>", "Stage one file"],
  ["Commit", "git commit -m \"message\"", "Commit staged changes"],
  ["Status", "git status", "Show working tree status"],
  ["History", "git log --oneline --graph --decorate", "Compact commit history"],
  ["Branch", "git branch", "List branches"],
  ["Branch", "git checkout -b feature/x", "Create and switch branch"],
  ["Branch", "git switch feature/x", "Switch branch"],
  ["Merge", "git merge feature/x", "Merge branch into current"],
  ["Remote", "git remote -v", "List remotes"],
  ["Remote", "git push -u origin main", "Push and set upstream"],
  ["Remote", "git pull --rebase", "Pull with rebase"],
  ["Undo", "git restore <file>", "Discard file changes"],
  ["Undo", "git reset --soft HEAD~1", "Undo last commit keep changes"],
  ["Stash", "git stash", "Stash working changes"],
  ["Stash", "git stash pop", "Restore stashed changes"],
];

const LINUX_COMMANDS = [
  ["ls", "List files", "ls -la"],
  ["cd", "Change directory", "cd /var/www"],
  ["pwd", "Print working directory", "pwd"],
  ["mkdir", "Create directory", "mkdir -p app/logs"],
  ["rm", "Remove files/directories", "rm -rf build"],
  ["cp", "Copy files", "cp -r src backup"],
  ["mv", "Move/rename files", "mv old.txt new.txt"],
  ["cat", "Print file content", "cat /etc/hosts"],
  ["less", "View file paginated", "less app.log"],
  ["grep", "Search text by pattern", "grep -R \"TODO\" ."],
  ["find", "Find files", "find . -name \"*.js\""],
  ["chmod", "Change permissions", "chmod 755 script.sh"],
  ["chown", "Change ownership", "sudo chown user:group file"],
  ["ps", "List processes", "ps aux"],
  ["top", "Live process monitor", "top"],
  ["kill", "Terminate process", "kill -9 1234"],
  ["df", "Disk usage by filesystem", "df -h"],
  ["du", "Disk usage by path", "du -sh *"],
  ["tar", "Archive files", "tar -czf out.tar.gz folder"],
  ["curl", "HTTP requests", "curl -I https://example.com"],
  ["wget", "Download files", "wget https://example.com/file.zip"],
  ["ssh", "Remote shell", "ssh user@host"],
  ["scp", "Secure copy", "scp file user@host:/path"],
  ["sed", "Stream editor", "sed -n '1,20p' file.txt"],
  ["awk", "Pattern scanning", "awk '{print $1}' file.txt"],
];

const REGEX_CHEAT = [
  ["\\d", "Digit"],
  ["\\D", "Non-digit"],
  ["\\w", "Word char"],
  ["\\W", "Non-word char"],
  ["\\s", "Whitespace"],
  ["\\S", "Non-whitespace"],
  [".", "Any character"],
  ["^", "Start of string"],
  ["$", "End of string"],
  ["[abc]", "Character class"],
  ["[^abc]", "Negated class"],
  ["a|b", "Alternation"],
  ["(abc)", "Capture group"],
  ["(?:abc)", "Non-capture group"],
  ["(?<name>abc)", "Named group"],
  ["\\1", "Backreference"],
  ["a*", "0 or more"],
  ["a+", "1 or more"],
  ["a?", "0 or 1"],
  ["a{2,4}", "Between 2 and 4"],
  ["\\b", "Word boundary"],
];

const HTTP_HEADERS = [
  ["Accept", "Request", "Media types the client accepts"],
  ["Accept-Encoding", "Request", "Compression algorithms accepted"],
  ["Accept-Language", "Request", "Preferred natural languages"],
  ["Authorization", "Request", "Credentials for auth"],
  ["Cache-Control", "Both", "Caching directives"],
  ["Connection", "Both", "Connection options"],
  ["Content-Length", "Both", "Body size in bytes"],
  ["Content-Type", "Both", "MIME type of payload"],
  ["Cookie", "Request", "Cookie data sent by client"],
  ["Host", "Request", "Target host and port"],
  ["If-None-Match", "Request", "Conditional request by ETag"],
  ["Origin", "Request", "Origin of CORS request"],
  ["Referer", "Request", "Referring page URL"],
  ["User-Agent", "Request", "Client agent identification"],
  ["ETag", "Response", "Entity identifier for caching"],
  ["Last-Modified", "Response", "Last modification time"],
  ["Location", "Response", "Redirect target URL"],
  ["Server", "Response", "Server software details"],
  ["Set-Cookie", "Response", "Cookie instructions to client"],
  ["Strict-Transport-Security", "Response", "HSTS policy"],
  ["Vary", "Response", "Caching variance dimensions"],
  ["WWW-Authenticate", "Response", "Auth challenge details"],
];

/* Full CSS named colors (148) */
const CSS_NAMED_COLORS = [
  ["AliceBlue","#F0F8FF"],["AntiqueWhite","#FAEBD7"],["Aqua","#00FFFF"],["Aquamarine","#7FFFD4"],["Azure","#F0FFFF"],["Beige","#F5F5DC"],["Bisque","#FFE4C4"],["Black","#000000"],["BlanchedAlmond","#FFEBCD"],["Blue","#0000FF"],["BlueViolet","#8A2BE2"],["Brown","#A52A2A"],["BurlyWood","#DEB887"],["CadetBlue","#5F9EA0"],["Chartreuse","#7FFF00"],["Chocolate","#D2691E"],["Coral","#FF7F50"],["CornflowerBlue","#6495ED"],["Cornsilk","#FFF8DC"],["Crimson","#DC143C"],["Cyan","#00FFFF"],["DarkBlue","#00008B"],["DarkCyan","#008B8B"],["DarkGoldenRod","#B8860B"],["DarkGray","#A9A9A9"],["DarkGrey","#A9A9A9"],["DarkGreen","#006400"],["DarkKhaki","#BDB76B"],["DarkMagenta","#8B008B"],["DarkOliveGreen","#556B2F"],["DarkOrange","#FF8C00"],["DarkOrchid","#9932CC"],["DarkRed","#8B0000"],["DarkSalmon","#E9967A"],["DarkSeaGreen","#8FBC8F"],["DarkSlateBlue","#483D8B"],["DarkSlateGray","#2F4F4F"],["DarkSlateGrey","#2F4F4F"],["DarkTurquoise","#00CED1"],["DarkViolet","#9400D3"],["DeepPink","#FF1493"],["DeepSkyBlue","#00BFFF"],["DimGray","#696969"],["DimGrey","#696969"],["DodgerBlue","#1E90FF"],["FireBrick","#B22222"],["FloralWhite","#FFFAF0"],["ForestGreen","#228B22"],["Fuchsia","#FF00FF"],["Gainsboro","#DCDCDC"],["GhostWhite","#F8F8FF"],["Gold","#FFD700"],["GoldenRod","#DAA520"],["Gray","#808080"],["Grey","#808080"],["Green","#008000"],["GreenYellow","#ADFF2F"],["HoneyDew","#F0FFF0"],["HotPink","#FF69B4"],["IndianRed","#CD5C5C"],["Indigo","#4B0082"],["Ivory","#FFFFF0"],["Khaki","#F0E68C"],["Lavender","#E6E6FA"],["LavenderBlush","#FFF0F5"],["LawnGreen","#7CFC00"],["LemonChiffon","#FFFACD"],["LightBlue","#ADD8E6"],["LightCoral","#F08080"],["LightCyan","#E0FFFF"],["LightGoldenRodYellow","#FAFAD2"],["LightGray","#D3D3D3"],["LightGrey","#D3D3D3"],["LightGreen","#90EE90"],["LightPink","#FFB6C1"],["LightSalmon","#FFA07A"],["LightSeaGreen","#20B2AA"],["LightSkyBlue","#87CEFA"],["LightSlateGray","#778899"],["LightSlateGrey","#778899"],["LightSteelBlue","#B0C4DE"],["LightYellow","#FFFFE0"],["Lime","#00FF00"],["LimeGreen","#32CD32"],["Linen","#FAF0E6"],["Magenta","#FF00FF"],["Maroon","#800000"],["MediumAquaMarine","#66CDAA"],["MediumBlue","#0000CD"],["MediumOrchid","#BA55D3"],["MediumPurple","#9370DB"],["MediumSeaGreen","#3CB371"],["MediumSlateBlue","#7B68EE"],["MediumSpringGreen","#00FA9A"],["MediumTurquoise","#48D1CC"],["MediumVioletRed","#C71585"],["MidnightBlue","#191970"],["MintCream","#F5FFFA"],["MistyRose","#FFE4E1"],["Moccasin","#FFE4B5"],["NavajoWhite","#FFDEAD"],["Navy","#000080"],["OldLace","#FDF5E6"],["Olive","#808000"],["OliveDrab","#6B8E23"],["Orange","#FFA500"],["OrangeRed","#FF4500"],["Orchid","#DA70D6"],["PaleGoldenRod","#EEE8AA"],["PaleGreen","#98FB98"],["PaleTurquoise","#AFEEEE"],["PaleVioletRed","#DB7093"],["PapayaWhip","#FFEFD5"],["PeachPuff","#FFDAB9"],["Peru","#CD853F"],["Pink","#FFC0CB"],["Plum","#DDA0DD"],["PowderBlue","#B0E0E6"],["Purple","#800080"],["RebeccaPurple","#663399"],["Red","#FF0000"],["RosyBrown","#BC8F8F"],["RoyalBlue","#4169E1"],["SaddleBrown","#8B4513"],["Salmon","#FA8072"],["SandyBrown","#F4A460"],["SeaGreen","#2E8B57"],["SeaShell","#FFF5EE"],["Sienna","#A0522D"],["Silver","#C0C0C0"],["SkyBlue","#87CEEB"],["SlateBlue","#6A5ACD"],["SlateGray","#708090"],["SlateGrey","#708090"],["Snow","#FFFAFA"],["SpringGreen","#00FF7F"],["SteelBlue","#4682B4"],["Tan","#D2B48C"],["Teal","#008080"],["Thistle","#D8BFD8"],["Tomato","#FF6347"],["Turquoise","#40E0D0"],["Violet","#EE82EE"],["Wheat","#F5DEB3"],["White","#FFFFFF"],["WhiteSmoke","#F5F5F5"],["Yellow","#FFFF00"],["YellowGreen","#9ACD32"],
];

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}

/* ---------- ascii-table ---------- */
function AsciiTableTool() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");

  const rows = useMemo(() => {
    const all = Array.from({ length: 128 }, (_, dec) => {
      const hex = dec.toString(16).toUpperCase().padStart(2, "0");
      const oct = dec.toString(8).padStart(3, "0");
      const bin = dec.toString(2).padStart(8, "0");
      const chr = (dec < 32 || dec === 127) ? CONTROL_NAMES[dec] : String.fromCharCode(dec);
      return [dec, hex, oct, bin, chr];
    });

    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter((r) => r.some((v) => String(v).toLowerCase().includes(s)));
  }, [q]);

  const onRowClick = async (r) => {
    const dec = r[0];
    const char = (dec < 32 || dec === 127) ? CONTROL_NAMES[dec] : String.fromCharCode(dec);
    await copyText(char);
    setCopied(`Copied: ${char}`);
    setTimeout(() => setCopied(""), 900);
  };

  return (
    <VStack>
      <SectionTitle icon="—" title="ASCII Table" subtitle="Complete 0–127 table. Searchable, scrollable, and clicking a row copies the character." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="e.g. 65, A, DEL, 01000001" /></div>
      {copied && <div style={{ color: "#93C5FD", fontSize: 12 }}>{copied}</div>}
      <div style={{ maxHeight: 460, overflow: "auto", border: `1px solid ${C.border}`, borderRadius: 10 }}>
        <table>
          <thead>
            <tr>
              <th>Dec</th><th>Hex</th><th>Oct</th><th>Binary</th><th>Char</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} onClick={() => onRowClick(r)} style={{ cursor: "pointer" }}>
                <td>{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td style={{ fontFamily: "'JetBrains Mono',monospace" }}>{r[3]}</td>
                <td>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VStack>
  );
}

/* ---------- html-entities-ref ---------- */
function HtmlEntitiesRefTool() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return HTML_ENTITIES
      .filter(([entity, char, desc]) => !s || entity.toLowerCase().includes(s) || char.toLowerCase().includes(s) || desc.toLowerCase().includes(s))
      .map(([entity, char, desc]) => [entity, char, desc]);
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="🧱" title="HTML Entities Reference" subtitle="Searchable table of common HTML entities." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="amp, quote, euro..." /></div>
      <DataTable columns={["Entity", "Char", "Description"]} rows={rows} maxHeight={460} />
    </VStack>
  );
}

/* ---------- css-units-ref ---------- */
function CssUnitsRefTool() {
  const [q, setQ] = useState("");
  const [previewVal, setPreviewVal] = useState("2rem");
  const [previewText, setPreviewText] = useState("ToolsRift CSS Units Preview");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CSS_UNITS
      .filter(([u, type, desc, ex]) => !s || u.toLowerCase().includes(s) || type.toLowerCase().includes(s) || desc.toLowerCase().includes(s) || ex.toLowerCase().includes(s))
      .map(([u, type, desc, ex]) => [u, type, desc, ex]);
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="—" title="CSS Units Reference" subtitle="Searchable guide to CSS units with live preview." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="px, rem, viewport, absolute..." /></div>

      <Card>
        <Grid2>
          <div><Label>Preview Font Size (any CSS unit)</Label><Input value={previewVal} onChange={setPreviewVal} /></div>
          <div><Label>Preview Text</Label><Input value={previewText} onChange={setPreviewText} /></div>
        </Grid2>
        <div style={{ marginTop: 10, padding: 12, border: `1px dashed ${C.border}`, borderRadius: 8 }}>
          <div style={{ fontSize: previewVal, lineHeight: 1.3 }}>{previewText}</div>
        </div>
      </Card>

      <DataTable columns={["Unit", "Type", "Description", "Example"]} rows={rows} maxHeight={460} />
    </VStack>
  );
}

/* ---------- git-cheatsheet ---------- */
function GitCheatsheetTool() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return GIT_COMMANDS.filter(([cat, cmd, desc]) =>
      !s || cat.toLowerCase().includes(s) || cmd.toLowerCase().includes(s) || desc.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="🌿" title="Git Cheatsheet" subtitle="Interactive command reference organized by category with copy buttons." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="commit, branch, stash..." /></div>
      <Card style={{ padding: 0 }}>
        <div style={{ maxHeight: 480, overflow: "auto" }}>
          <table>
            <thead><tr><th>Category</th><th>Command</th><th>Description</th><th>Copy</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r[0]}</td>
                  <td style={{ fontFamily: "'JetBrains Mono',monospace" }}>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td><GhostBtn onClick={() => copyText(r[1])}>Copy</GhostBtn></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </VStack>
  );
}

/* ---------- linux-commands-ref ---------- */
function LinuxCommandsRefTool() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return LINUX_COMMANDS
      .filter(([cmd, desc, ex]) => !s || cmd.toLowerCase().includes(s) || desc.toLowerCase().includes(s) || ex.toLowerCase().includes(s))
      .map(([cmd, desc, ex]) => [cmd, desc, ex]);
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="——" title="Linux Commands Reference" subtitle="Search Linux commands with practical examples." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="grep, ssh, tar..." /></div>
      <DataTable columns={["Command", "Description", "Example"]} rows={rows} maxHeight={500} />
    </VStack>
  );
}

/* ---------- regex-cheatsheet ---------- */
function RegexCheatsheetTool() {
  const [q, setQ] = useState("");
  const [pat, setPat] = useState("\\b\\w{4}\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("This line has four word size bits and more.");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return REGEX_CHEAT.filter(([tok, desc]) => !s || tok.toLowerCase().includes(s) || desc.toLowerCase().includes(s));
  }, [q]);

  let regex = null;
  let err = "";
  try { regex = new RegExp(pat, flags); } catch (e) { err = String(e.message || e); }

  const highlighted = useMemo(() => {
    if (!regex) return esc(text);
    const rg = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    let m, last = 0, html = "";
    while ((m = rg.exec(text)) !== null) {
      html += esc(text.slice(last, m.index));
      html += `<mark style="background:#FDE68A;color:#111;padding:0 2px;border-radius:2px">${esc(m[0])}</mark>`;
      last = m.index + m[0].length;
      if (m.index === rg.lastIndex) rg.lastIndex++;
    }
    html += esc(text.slice(last));
    return html;
  }, [regex, text]);

  return (
    <VStack>
      <SectionTitle icon="🧠" title="Regex Cheatsheet" subtitle="Interactive regex cheat sheet with live test input." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="boundary, group, \\d ..." /></div>
      <DataTable columns={["Token", "Meaning"]} rows={filtered} maxHeight={280} />

      <Card>
        <Grid3>
          <div><Label>Pattern</Label><Input value={pat} onChange={setPat} /></div>
          <div><Label>Flags</Label><Input value={flags} onChange={setFlags} /></div>
          <div></div>
        </Grid3>
        <div><Label>Test Text</Label><Textarea value={text} onChange={setText} rows={4} /></div>
        {err ? <div style={{ color: "#FCA5A5", fontSize: 12 }}>{err}</div> : (
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlighted }} />
        )}
      </Card>
    </VStack>
  );
}

/* ---------- http-headers-ref ---------- */
function HttpHeadersRefTool() {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return HTTP_HEADERS
      .filter(([h, t, d]) => !s || h.toLowerCase().includes(s) || t.toLowerCase().includes(s) || d.toLowerCase().includes(s))
      .map(([h, t, d]) => [h, t, d]);
  }, [q]);

  return (
    <VStack>
      <SectionTitle icon="—" title="HTTP Headers Reference" subtitle="Common request/response headers and descriptions." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="content-type, auth, cache..." /></div>
      <DataTable columns={["Header", "Type", "Description"]} rows={rows} maxHeight={500} />
    </VStack>
  );
}

/* ---------- color-names-ref ---------- */
function ColorNamesRefTool() {
  const [q, setQ] = useState("");
  const [copied, setCopied] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return CSS_NAMED_COLORS.filter(([name, hex]) =>
      !s || name.toLowerCase().includes(s) || hex.toLowerCase().includes(s)
    );
  }, [q]);

  const copyColor = async (name, hex) => {
    await copyText(hex);
    setCopied(`Copied ${name}: ${hex}`);
    setTimeout(() => setCopied(""), 1100);
  };

  return (
    <VStack>
      <SectionTitle icon="🎨" title="Color Names Reference" subtitle="All CSS named colors in a swatch grid. Search and click to copy HEX." />
      <div><Label>Search / Filter</Label><Input value={q} onChange={setQ} placeholder="blue, fuchsia, #ff..." /></div>
      {copied && <div style={{ color: "#93C5FD", fontSize: 12 }}>{copied}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {list.map(([name, hex]) => {
          const [r, g, b] = hexToRgb(hex);
          const dark = (r * 0.299 + g * 0.587 + b * 0.114) < 150;
          return (
            <button
              key={name}
              onClick={() => copyColor(name, hex)}
              style={{
                border: `1px solid ${C.border}`,
                background: "rgba(255,255,255,.02)",
                borderRadius: 10,
                padding: 8,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ height: 56, borderRadius: 7, background: hex, border: "1px solid rgba(0,0,0,.15)" }} />
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700 }}>{name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{hex} · rgb({r},{g},{b})</div>
              <div style={{ marginTop: 5, fontSize: 11, color: dark ? "#93C5FD" : C.blue }}>Click to copy HEX</div>
            </button>
          );
        })}
      </div>
    </VStack>
  );
}

/* ---------- register Chunk 4 tools ---------- */
Object.assign(TOOL_COMPONENTS, {
  "ascii-table": AsciiTableTool,
  "html-entities-ref": HtmlEntitiesRefTool,
  "css-units-ref": CssUnitsRefTool,
  "git-cheatsheet": GitCheatsheetTool,
  "linux-commands-ref": LinuxCommandsRefTool,
  "regex-cheatsheet": RegexCheatsheetTool,
  "http-headers-ref": HttpHeadersRefTool,
  "color-names-ref": ColorNamesRefTool,
});
/* =========================
   Chunk 5: Generators + final export
   ========================= */

/* ---------- lorem-ipsum-adv ---------- */
const LOREM_WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
"ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit " +
"in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt " +
"mollit anim id est laborum").split(/\s+/);

function makeLoremWords(count) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  return arr.join(" ");
}
function makeLoremSentences(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const len = 8 + (i % 9);
    const words = makeLoremWords(len).split(" ");
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    out.push(words.join(" ") + ".");
  }
  return out.join(" ");
}
function makeLoremParagraphs(count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(makeLoremSentences(4 + (i % 3)));
  return out.join("\n\n");
}

function LoremIpsumAdvTool() {
  const [mode, setMode] = useState("paragraphs");
  const [count, setCount] = useState("3");

  const output = useMemo(() => {
    const c = Math.max(1, Math.min(5000, parseInt(count || "1", 10) || 1));
    if (mode === "words") return makeLoremWords(c);
    if (mode === "sentences") return makeLoremSentences(c);
    return makeLoremParagraphs(c);
  }, [mode, count]);

  return (
    <VStack>
      <SectionTitle icon="——" title="Lorem Ipsum Advanced" subtitle="Generate lorem ipsum by words, sentences, or paragraphs with custom length." />
      <Grid2>
        <div>
          <Label>Mode</Label>
          <SelectInput value={mode} onChange={setMode} options={[
            { value: "words", label: "Words" },
            { value: "sentences", label: "Sentences" },
            { value: "paragraphs", label: "Paragraphs" },
          ]} />
        </div>
        <div>
          <Label>Count</Label>
          <Input value={count} onChange={setCount} />
        </div>
      </Grid2>
      <CodeBox code={output} />
      <div><GhostBtn onClick={() => copyText(output)}>Copy Output</GhostBtn></div>
    </VStack>
  );
}

/* ---------- hash-generator-adv ---------- */
/* deterministic non-crypto placeholders for MD5/SHA1 fallback */
function pseudoHash(input, len = 32) {
  let h1 = 0x811c9dc5, h2 = 0x9e3779b1, h3 = 0x85ebca6b, h4 = 0xc2b2ae35;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x27d4eb2d);
    h3 = Math.imul(h3 ^ c, 0x165667b1);
    h4 = Math.imul(h4 ^ c, 0x85ebca77);
  }
  const hex = [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0].map((n) => n.toString(16).padStart(8, "0")).join("");
  let out = hex;
  while (out.length < len) out += hex;
  return out.slice(0, len);
}
async function shaDigest(algo, txt) {
  const enc = new TextEncoder().encode(txt);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function HashGeneratorAdvTool() {
  const [text, setText] = useState("hello world");
  const [hashes, setHashes] = useState({ md5: "", sha1: "", sha256: "", sha512: "" });

  useEffect(() => {
    let live = true;
    (async () => {
      const sha1 = await shaDigest("SHA-1", text);
      const sha256 = await shaDigest("SHA-256", text);
      const sha512 = await shaDigest("SHA-512", text);
      const md5 = pseudoHash(text, 32); // browser subtle has no MD5
      if (live) setHashes({ md5, sha1, sha256, sha512 });
    })();
    return () => { live = false; };
  }, [text]);

  return (
    <VStack>
      <SectionTitle icon="#—⃣" title="Hash Generator Advanced" subtitle="Generate MD5, SHA1, SHA256, SHA512 side by side from text input." />
      <div><Label>Input Text</Label><Textarea value={text} onChange={setText} rows={6} /></div>
      <DataTable columns={["Algorithm", "Hash"]} rows={[
        ["MD5", hashes.md5],
        ["SHA1", hashes.sha1],
        ["SHA256", hashes.sha256],
        ["SHA512", hashes.sha512],
      ]} />
    </VStack>
  );
}

/* ---------- color-gradient-css ---------- */
function ColorGradientCssTool() {
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState("90");
  const [c1, setC1] = useState("#3B82F6");
  const [c2, setC2] = useState("#2563EB");
  const [c3, setC3] = useState("#0EA5E9");

  const css = useMemo(() => {
    if (type === "radial") return `background: radial-gradient(circle, ${c1} 0%, ${c2} 55%, ${c3} 100%);`;
    if (type === "conic") return `background: conic-gradient(from ${angle}deg, ${c1}, ${c2}, ${c3}, ${c1});`;
    return `background: linear-gradient(${angle}deg, ${c1} 0%, ${c2} 55%, ${c3} 100%);`;
  }, [type, angle, c1, c2, c3]);

  return (
    <VStack>
      <SectionTitle icon="🌈" title="Color Gradient CSS Generator" subtitle="Create linear, radial, and conic gradients with live preview." />
      <Grid3>
        <div><Label>Type</Label><SelectInput value={type} onChange={setType} options={[
          { value: "linear", label: "Linear" },
          { value: "radial", label: "Radial" },
          { value: "conic", label: "Conic" },
        ]} /></div>
        <div><Label>Angle (deg)</Label><Input value={angle} onChange={setAngle} /></div>
        <div></div>
      </Grid3>
      <Grid3>
        <div><Label>Color 1</Label><Input value={c1} onChange={setC1} /></div>
        <div><Label>Color 2</Label><Input value={c2} onChange={setC2} /></div>
        <div><Label>Color 3</Label><Input value={c3} onChange={setC3} /></div>
      </Grid3>
      <div style={{ height: 160, borderRadius: 12, border: `1px solid ${C.border}`, ...Object.fromEntries(css.replace("background: ", "").replace(";", "").split(";").filter(Boolean).map(() => ["background", css.replace("background: ", "").replace(";", "")])) }} />
      <CodeBox code={css} />
      <GhostBtn onClick={() => copyText(css)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- box-shadow-gen ---------- */
function BoxShadowGenTool() {
  const [x, setX] = useState("0");
  const [y, setY] = useState("8");
  const [blur, setBlur] = useState("24");
  const [spread, setSpread] = useState("0");
  const [color, setColor] = useState("rgba(37,99,235,0.45)");
  const [inset, setInset] = useState(false);

  const css = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${color}`;

  return (
    <VStack>
      <SectionTitle icon="🧊" title="Box Shadow Generator" subtitle="Generate box-shadow CSS with live preview controls." />
      <Grid3>
        <div><Label>Offset X</Label><Input value={x} onChange={setX} /></div>
        <div><Label>Offset Y</Label><Input value={y} onChange={setY} /></div>
        <div><Label>Blur</Label><Input value={blur} onChange={setBlur} /></div>
      </Grid3>
      <Grid3>
        <div><Label>Spread</Label><Input value={spread} onChange={setSpread} /></div>
        <div><Label>Color</Label><Input value={color} onChange={setColor} /></div>
        <div style={{ display: "flex", alignItems: "end" }}>
          <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} />
            Inset
          </label>
        </div>
      </Grid3>

      <div style={{ height: 180, borderRadius: 12, border: `1px dashed ${C.border}`, display: "grid", placeItems: "center" }}>
        <div style={{ width: 170, height: 100, borderRadius: 12, background: "#111827", border: `1px solid ${C.border}`, boxShadow: css }} />
      </div>
      <CodeBox code={`box-shadow: ${css};`} />
      <GhostBtn onClick={() => copyText(`box-shadow: ${css};`)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- text-shadow-gen ---------- */
function TextShadowGenTool() {
  const [x, setX] = useState("0");
  const [y, setY] = useState("2");
  const [blur, setBlur] = useState("8");
  const [color, setColor] = useState("rgba(59,130,246,0.75)");
  const [text, setText] = useState("ToolsRift");

  const css = `${x}px ${y}px ${blur}px ${color}`;

  return (
    <VStack>
      <SectionTitle icon="—" title="Text Shadow Generator" subtitle="Generate text-shadow CSS with a live text preview." />
      <Grid2>
        <div><Label>Preview Text</Label><Input value={text} onChange={setText} /></div>
        <div><Label>Color</Label><Input value={color} onChange={setColor} /></div>
      </Grid2>
      <Grid3>
        <div><Label>Offset X</Label><Input value={x} onChange={setX} /></div>
        <div><Label>Offset Y</Label><Input value={y} onChange={setY} /></div>
        <div><Label>Blur</Label><Input value={blur} onChange={setBlur} /></div>
      </Grid3>
      <div style={{ padding: 18, border: `1px dashed ${C.border}`, borderRadius: 12, textAlign: "center", fontSize: 44, fontWeight: 800, fontFamily: "'Sora',sans-serif", textShadow: css }}>
        {text}
      </div>
      <CodeBox code={`text-shadow: ${css};`} />
      <GhostBtn onClick={() => copyText(`text-shadow: ${css};`)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- border-radius-gen ---------- */
function BorderRadiusGenTool() {
  const [tl, setTl] = useState("16");
  const [tr, setTr] = useState("16");
  const [br, setBr] = useState("16");
  const [bl, setBl] = useState("16");

  const css = `${tl}px ${tr}px ${br}px ${bl}px`;

  return (
    <VStack>
      <SectionTitle icon="—" title="Border Radius Generator" subtitle="Set each corner independently with live preview." />
      <Grid2>
        <div><Label>Top Left</Label><Input value={tl} onChange={setTl} /></div>
        <div><Label>Top Right</Label><Input value={tr} onChange={setTr} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Bottom Right</Label><Input value={br} onChange={setBr} /></div>
        <div><Label>Bottom Left</Label><Input value={bl} onChange={setBl} /></div>
      </Grid2>
      <div style={{ height: 180, display: "grid", placeItems: "center", border: `1px dashed ${C.border}`, borderRadius: 12 }}>
        <div style={{ width: 180, height: 110, background: "#1F2937", border: `1px solid ${C.border}`, borderRadius: css }} />
      </div>
      <CodeBox code={`border-radius: ${css};`} />
      <GhostBtn onClick={() => copyText(`border-radius: ${css};`)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- flexbox-gen ---------- */
function FlexboxGenTool() {
  const [dir, setDir] = useState("row");
  const [justify, setJustify] = useState("space-between");
  const [align, setAlign] = useState("center");
  const [wrap, setWrap] = useState("nowrap");
  const [gap, setGap] = useState("10");

  const css = `display: flex;
flex-direction: ${dir};
justify-content: ${justify};
align-items: ${align};
flex-wrap: ${wrap};
gap: ${gap}px;`;

  return (
    <VStack>
      <SectionTitle icon="—" title="Flexbox Generator" subtitle="Visual flex controls with live layout preview and CSS output." />
      <Grid3>
        <div><Label>Direction</Label><SelectInput value={dir} onChange={setDir} options={[
          { value: "row", label: "row" }, { value: "column", label: "column" }, { value: "row-reverse", label: "row-reverse" }, { value: "column-reverse", label: "column-reverse" },
        ]} /></div>
        <div><Label>Justify Content</Label><SelectInput value={justify} onChange={setJustify} options={[
          { value: "flex-start", label: "flex-start" }, { value: "center", label: "center" }, { value: "flex-end", label: "flex-end" }, { value: "space-between", label: "space-between" }, { value: "space-around", label: "space-around" }, { value: "space-evenly", label: "space-evenly" },
        ]} /></div>
        <div><Label>Align Items</Label><SelectInput value={align} onChange={setAlign} options={[
          { value: "stretch", label: "stretch" }, { value: "flex-start", label: "flex-start" }, { value: "center", label: "center" }, { value: "flex-end", label: "flex-end" }, { value: "baseline", label: "baseline" },
        ]} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Wrap</Label><SelectInput value={wrap} onChange={setWrap} options={[
          { value: "nowrap", label: "nowrap" }, { value: "wrap", label: "wrap" }, { value: "wrap-reverse", label: "wrap-reverse" },
        ]} /></div>
        <div><Label>Gap (px)</Label><Input value={gap} onChange={setGap} /></div>
      </Grid2>

      <Card>
        <Label>Live Preview</Label>
        <div style={{ minHeight: 180, border: `1px dashed ${C.border}`, borderRadius: 10, padding: 10, display: "flex", flexDirection: dir, justifyContent: justify, alignItems: align, flexWrap: wrap, gap: `${gap}px` }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ width: 54, height: 54, borderRadius: 8, background: i % 2 ? "rgba(59,130,246,.25)" : "rgba(37,99,235,.35)", border: `1px solid ${C.border}`, display: "grid", placeItems: "center", fontSize: 12 }}>
              {i + 1}
            </div>
          ))}
        </div>
      </Card>
      <CodeBox code={css} />
      <GhostBtn onClick={() => copyText(css)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- grid-gen ---------- */
function GridGenTool() {
  const [cols, setCols] = useState("3");
  const [rows, setRows] = useState("2");
  const [gap, setGap] = useState("10");
  const [items, setItems] = useState("6");

  const colN = Math.max(1, Math.min(12, parseInt(cols || "1", 10) || 1));
  const rowN = Math.max(1, Math.min(12, parseInt(rows || "1", 10) || 1));
  const itemN = Math.max(1, Math.min(60, parseInt(items || "1", 10) || 1));

  const css = `display: grid;
grid-template-columns: repeat(${colN}, 1fr);
grid-template-rows: repeat(${rowN}, minmax(60px, auto));
gap: ${Math.max(0, parseInt(gap || "0", 10) || 0)}px;`;

  return (
    <VStack>
      <SectionTitle icon="🧱" title="Grid Generator" subtitle="Configure rows/columns with a live CSS grid preview." />
      <Grid2>
        <div><Label>Columns</Label><Input value={cols} onChange={setCols} /></div>
        <div><Label>Rows</Label><Input value={rows} onChange={setRows} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Gap (px)</Label><Input value={gap} onChange={setGap} /></div>
        <div><Label>Item Count</Label><Input value={items} onChange={setItems} /></div>
      </Grid2>

      <Card>
        <Label>Live Preview</Label>
        <div style={{ minHeight: 190, border: `1px dashed ${C.border}`, borderRadius: 10, padding: 10, display: "grid", gridTemplateColumns: `repeat(${colN}, 1fr)`, gridTemplateRows: `repeat(${rowN}, minmax(60px, auto))`, gap: `${gap}px` }}>
          {Array.from({ length: itemN }, (_, i) => (
            <div key={i} style={{ borderRadius: 8, background: i % 2 ? "rgba(59,130,246,.25)" : "rgba(37,99,235,.35)", border: `1px solid ${C.border}`, display: "grid", placeItems: "center", fontSize: 12 }}>
              {i + 1}
            </div>
          ))}
        </div>
      </Card>
      <CodeBox code={css} />
      <GhostBtn onClick={() => copyText(css)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- animation-gen ---------- */
function AnimationGenTool() {
  const [name, setName] = useState("pulseMove");
  const [duration, setDuration] = useState("1.6");
  const [timing, setTiming] = useState("ease-in-out");
  const [delay, setDelay] = useState("0");
  const [iter, setIter] = useState("infinite");
  const [dx, setDx] = useState("30");
  const [scale, setScale] = useState("1.12");
  const [rot, setRot] = useState("8");

  const keyframes = `@keyframes ${name} {
  0%   { transform: translateX(0px) scale(1) rotate(0deg); opacity: 0.85; }
  50%  { transform: translateX(${dx}px) scale(${scale}) rotate(${rot}deg); opacity: 1; }
  100% { transform: translateX(0px) scale(1) rotate(0deg); opacity: 0.85; }
}

.demo {
  animation: ${name} ${duration}s ${timing} ${delay}s ${iter};
}`;

  return (
    <VStack>
      <SectionTitle icon="🎞—" title="Animation Generator" subtitle="Generate @keyframes animation CSS with live preview." />
      <Grid3>
        <div><Label>Name</Label><Input value={name} onChange={setName} /></div>
        <div><Label>Duration (s)</Label><Input value={duration} onChange={setDuration} /></div>
        <div><Label>Timing</Label><SelectInput value={timing} onChange={setTiming} options={[
          { value: "linear", label: "linear" }, { value: "ease", label: "ease" }, { value: "ease-in", label: "ease-in" }, { value: "ease-out", label: "ease-out" }, { value: "ease-in-out", label: "ease-in-out" },
        ]} /></div>
      </Grid3>
      <Grid3>
        <div><Label>Delay (s)</Label><Input value={delay} onChange={setDelay} /></div>
        <div><Label>Iterations</Label><Input value={iter} onChange={setIter} /></div>
        <div></div>
      </Grid3>
      <Grid3>
        <div><Label>Translate X (px)</Label><Input value={dx} onChange={setDx} /></div>
        <div><Label>Scale</Label><Input value={scale} onChange={setScale} /></div>
        <div><Label>Rotate (deg)</Label><Input value={rot} onChange={setRot} /></div>
      </Grid3>

      <Card>
        <Label>Live Preview</Label>
        <div style={{ minHeight: 150, border: `1px dashed ${C.border}`, borderRadius: 10, display: "grid", placeItems: "center", overflow: "hidden" }}>
          <style>{`@keyframes __preview__ {
            0% { transform: translateX(0px) scale(1) rotate(0deg); opacity:.85; }
            50% { transform: translateX(${dx}px) scale(${scale}) rotate(${rot}deg); opacity:1; }
            100% { transform: translateX(0px) scale(1) rotate(0deg); opacity:.85; }
          }`}</style>
          <div style={{ width: 86, height: 86, borderRadius: 12, background: "linear-gradient(135deg,#3B82F6,#2563EB)", border: `1px solid ${C.border}`, animation: `__preview__ ${duration}s ${timing} ${delay}s ${iter}` }} />
        </div>
      </Card>

      <CodeBox code={keyframes} />
      <GhostBtn onClick={() => copyText(keyframes)}>Copy CSS</GhostBtn>
    </VStack>
  );
}

/* ---------- meta-tags-adv ---------- */
function MetaTagsAdvTool() {
  const [title, setTitle] = useState("ToolsRift Dev Tools");
  const [desc, setDesc] = useState("Fast developer tools: regex, hashes, diff, cron, and more.");
  const [url, setUrl] = useState("https://toolsrift.example/devtools");
  const [image, setImage] = useState("https://toolsrift.example/og/devtools.png");
  const [site, setSite] = useState("ToolsRift");
  const [twitter, setTwitter] = useState("@toolsrift");
  const [keywords, setKeywords] = useState("developer tools, regex tester, hash generator, cron parser");

  const html = `<!-- Basic SEO -->
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="keywords" content="${esc(keywords)}" />
<link rel="canonical" href="${esc(url)}" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:site_name" content="${esc(site)}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${esc(twitter)}" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />`;

  return (
    <VStack>
      <SectionTitle icon="——" title="Meta Tags Advanced Generator" subtitle="Generate complete SEO, Open Graph, and Twitter meta tags with preview." />
      <Grid2>
        <div><Label>Page Title</Label><Input value={title} onChange={setTitle} /></div>
        <div><Label>Site Name</Label><Input value={site} onChange={setSite} /></div>
      </Grid2>
      <div><Label>Description</Label><Textarea value={desc} onChange={setDesc} rows={4} /></div>
      <Grid2>
        <div><Label>Canonical URL</Label><Input value={url} onChange={setUrl} /></div>
        <div><Label>OG/Twitter Image URL</Label><Input value={image} onChange={setImage} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Twitter Handle</Label><Input value={twitter} onChange={setTwitter} /></div>
        <div><Label>Keywords</Label><Input value={keywords} onChange={setKeywords} /></div>
      </Grid2>

      <Card>
        <Label>Preview</Label>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: "rgba(255,255,255,.02)" }}>
          <div style={{ color: "#93C5FD", fontSize: 12 }}>{url}</div>
          <div style={{ fontWeight: 700, marginTop: 3 }}>{title}</div>
          <div style={{ color: C.muted, marginTop: 4, fontSize: 13 }}>{desc}</div>
        </div>
      </Card>

      <CodeBox code={html} />
      <GhostBtn onClick={() => copyText(html)}>Copy Meta Tags</GhostBtn>
    </VStack>
  );
}

/* ---------- register Chunk 5 tools ---------- */
Object.assign(TOOL_COMPONENTS, {
  "lorem-ipsum-adv": LoremIpsumAdvTool,
  "hash-generator-adv": HashGeneratorAdvTool,
  "color-gradient-css": ColorGradientCssTool,
  "box-shadow-gen": BoxShadowGenTool,
  "text-shadow-gen": TextShadowGenTool,
  "border-radius-gen": BorderRadiusGenTool,
  "flexbox-gen": FlexboxGenTool,
  "grid-gen": GridGenTool,
  "animation-gen": AnimationGenTool,
  "meta-tags-adv": MetaTagsAdvTool,
});

/* ---------- final export ---------- */
export default ToolsRiftDevTools;
