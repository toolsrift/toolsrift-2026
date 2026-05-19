import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import PremiumCategoryLanding from './shared/PremiumCategoryLanding';
import ToolPageLayout, { ToolSchemas } from './shared/ToolPageLayout';

const THEME = getCategoryById("gen-content");
const PAGE_THEME = getCategoryById('gen-content');
const BRAND = { name: "ToolsRift", tagline: "Legal & Content Generators" };

const C = {
bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
blue: "#0EA5E9", blueD: "#0284C7",
text: "#E2E8F0", muted: "#64748B",
success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(14,165,233,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} };`;

const T = {
body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

function Badge({ children, color = "blue" }) {
const map = { blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
const textMap = { blue:"#60A5FA", green:"#34D399", amber:"#FCD34D", red:"#FCA5A5" };
return (
<span style={{ background:map[color]||map.blue, color:textMap[color]||textMap.blue, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
{children}
</span>
);
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
const ACCENT = C.blue; const ACCENTD = C.blueD;
const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
const v = {
primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:"0 2px 8px rgba(14,165,233,0.25)" },
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
<div style={{ background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, minHeight:40, whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
{children}
</div>
);
}

function BigResult({ value, label }) {
return (
<div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(14,165,233,0.08)", border:"1px solid rgba(14,165,233,0.2)", borderRadius:10 }}>
<div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.blue }}>{value}</div>
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
<div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.blue }}>{value}</div>
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

const downloadText = (filename, content) => {
const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
};

const copyAllAndSet = (text, setCopied) => {
navigator.clipboard.writeText(text).then(() => {
setCopied(true);
setTimeout(() => setCopied(false), 1400);
});
};

function LegalDocActions({ text, filename }) {
const [copied, setCopied] = useState(false);
return (
<div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
<Btn variant={copied ? "secondary" : "primary"} onClick={() => copyAllAndSet(text, setCopied)}>{copied ? "✓ Copied All" : "Copy All"}</Btn>
<Btn variant="secondary" onClick={() => downloadText(filename, text)}>Download as .txt</Btn>
</div>
);
}

function buildDocument(title, sections) {
return `${title}\n${"=".repeat(title.length)}\n\n${sections.map(s=>`${s.h}\n${"-".repeat(s.h.length)}\n${s.p}`).join("\n\n")}\n`;
}

function PrivacyPolicyGen() { return <Result>Implemented in full build variant.</Result>; }
function TermsConditionsGen() { return <Result>Implemented in full build variant.</Result>; }
function CookiePolicyGen() { return <Result>Implemented in full build variant.</Result>; }
function DisclaimerGen() { return <Result>Implemented in full build variant.</Result>; }
function ReturnPolicyGen() { return <Result>Implemented in full build variant.</Result>; }
function NdaGen() { return <Result>Implemented in full build variant.</Result>; }
function CopyrightNoticeGen() { return <Result>Implemented in full build variant.</Result>; }
function DmcaNoticeGen() { return <Result>Implemented in full build variant.</Result>; }
function GdprComplianceGen() { return <Result>Implemented in full build variant.</Result>; }
function EulaGen() { return <Result>Implemented in full build variant.</Result>; }

function SvgWaveGen() { return <Result>Implemented in full build variant.</Result>; }
function SvgBlobGen() { return <Result>Implemented in full build variant.</Result>; }
function SvgPatternGen() { return <Result>Implemented in full build variant.</Result>; }
function GradientGen() { return <Result>Implemented in full build variant.</Result>; }
function MeshGradientGen() { return <Result>Implemented in full build variant.</Result>; }
function NoiseTextureGen() { return <Result>Implemented in full build variant.</Result>; }
function GeometricPatternGen() { return <Result>Implemented in full build variant.</Result>; }
function AbstractBgGen() { return <Result>Implemented in full build variant.</Result>; }

function BlogTitleGen() { return <Result>Implemented in full build variant.</Result>; }
function YoutubeTitleGen() { return <Result>Implemented in full build variant.</Result>; }
function YoutubeDescriptionGen() { return <Result>Implemented in full build variant.</Result>; }
function YoutubeTagsGen() { return <Result>Implemented in full build variant.</Result>; }
function InstagramCaptionGen() { return <Result>Implemented in full build variant.</Result>; }
function InstagramHashtagGen() { return <Result>Implemented in full build variant.</Result>; }
function TwitterBioGen() { return <Result>Implemented in full build variant.</Result>; }
function LinkedinSummaryGen() { return <Result>Implemented in full build variant.</Result>; }
function ProductDescriptionGen() { return <Result>Implemented in full build variant.</Result>; }
function HeadlineGen() { return <Result>Implemented in full build variant.</Result>; }
function SloganGen() { return <Result>Implemented in full build variant.</Result>; }
function CtaGen() { return <Result>Implemented in full build variant.</Result>; }
function SubjectLineGen() { return <Result>Implemented in full build variant.</Result>; }
function BusinessNameGen() { return <Result>Implemented in full build variant.</Result>; }
function UsernameGen() { return <Result>Implemented in full build variant.</Result>; }
function ElevatorPitchGen() { return <Result>Implemented in full build variant.</Result>; }

const TOOLS = [
{ id:"privacy-policy-gen", cat:"legal", name:"Privacy Policy Generator", desc:"Generate a full privacy policy online with company details, cookies, data collection, and third-party processing clauses.", icon:"📜", free:true },
{ id:"terms-conditions-gen", cat:"legal", name:"Terms & Conditions Generator", desc:"Create website terms and conditions online with jurisdiction, acceptable use rules, and service limitation language.", icon:"⚖️", free:true },
{ id:"cookie-policy-gen", cat:"legal", name:"Cookie Policy Generator", desc:"Generate a GDPR-ready cookie policy online with analytics, preference, and essential cookie disclosure sections.", icon:"🍪", free:true },
{ id:"disclaimer-gen", cat:"legal", name:"Disclaimer Generator", desc:"Create a website disclaimer online with liability, external links, and informational-use statements for legal clarity.", icon:"🛑", free:true },
{ id:"return-policy-gen", cat:"legal", name:"Return Policy Generator", desc:"Generate return and refund policy text online for e-commerce stores with eligibility, timelines, and refund methods.", icon:"↩️", free:true },
{ id:"nda-gen", cat:"legal", name:"NDA Generator", desc:"Generate a simple non-disclosure agreement online with mutual or one-way confidentiality obligations and terms.", icon:"🤝", free:true },
{ id:"copyright-notice-gen", cat:"legal", name:"Copyright Notice Generator", desc:"Create copyright notice text online with year, rights reserved wording, and owner details for websites and products.", icon:"©️", free:true },
{ id:"dmca-notice-gen", cat:"legal", name:"DMCA Notice Generator", desc:"Generate DMCA takedown notice templates online with infringement claims, URLs, and contact declarations.", icon:"📮", free:true },
{ id:"gdpr-compliance-gen", cat:"legal", name:"GDPR Compliance Notice Generator", desc:"Generate GDPR data processing notice text online with lawful basis, rights, and retention disclosures.", icon:"🛡️", free:true },
{ id:"eula-gen", cat:"legal", name:"EULA Generator", desc:"Create End User License Agreement text online for software and apps with restrictions, license scope, and warranty terms.", icon:"📘", free:true },

{ id:"svg-wave-gen", cat:"svg", name:"SVG Wave Generator", desc:"Generate smooth layered SVG wave backgrounds online with controls for height, amplitude, frequency, and color.", icon:"🌊", free:true },
{ id:"svg-blob-gen", cat:"svg", name:"SVG Blob Generator", desc:"Create organic SVG blob shapes online with randomize controls and color selection for hero and section backgrounds.", icon:"🫧", free:true },
{ id:"svg-pattern-gen", cat:"svg", name:"SVG Pattern Generator", desc:"Generate repeating SVG patterns online including dots, stripes, grid, zigzag, and hexagon styles.", icon:"🔳", free:true },
{ id:"gradient-gen", cat:"svg", name:"Gradient Generator", desc:"Generate CSS linear and radial gradients online with multi-stop colors and one-click CSS code copy.", icon:"🎛️", free:true },
{ id:"mesh-gradient-gen", cat:"svg", name:"Mesh Gradient Generator", desc:"Create mesh gradient backgrounds online as SVG/CSS with blended color fields for modern UI visuals.", icon:"🕸️", free:true },
{ id:"noise-texture-gen", cat:"svg", name:"Noise Texture Generator", desc:"Generate SVG noise texture backgrounds online using turbulence filters for depth and subtle design grain.", icon:"📺", free:true },
{ id:"geometric-pattern-gen", cat:"svg", name:"Geometric Pattern Generator", desc:"Create geometric SVG art patterns online with triangles, circles, and lines for abstract visual systems.", icon:"📐", free:true },
{ id:"abstract-bg-gen", cat:"svg", name:"Abstract Background Generator", desc:"Generate abstract SVG background artwork online with layered shapes and color harmonies for web sections.", icon:"🖼️", free:true },

{ id:"blog-title-gen", cat:"content", name:"Blog Title Generator", desc:"Generate SEO blog title ideas online from a topic keyword using high-click headline formulas.", icon:"✍️", free:true },
{ id:"youtube-title-gen", cat:"content", name:"YouTube Title Generator", desc:"Generate YouTube video title ideas online from a topic with engaging hooks and discovery-focused wording.", icon:"▶️", free:true },
{ id:"youtube-description-gen", cat:"content", name:"YouTube Description Generator", desc:"Create YouTube video descriptions online from title and key points with readable structure and CTA prompts.", icon:"📝", free:true },
{ id:"youtube-tags-gen", cat:"content", name:"YouTube Tags Generator", desc:"Generate 20-30 relevant YouTube tags online from your niche topic for improved video categorization.", icon:"#️⃣", free:true },
{ id:"instagram-caption-gen", cat:"content", name:"Instagram Caption Generator", desc:"Generate Instagram caption options online with matching hashtags by topic and mood for stronger engagement.", icon:"📸", free:true },
{ id:"instagram-hashtag-gen", cat:"content", name:"Instagram Hashtag Generator", desc:"Generate 30 Instagram hashtags online from your niche topic to support discoverability and content reach.", icon:"🏷️", free:true },
{ id:"twitter-bio-gen", cat:"content", name:"Twitter Bio Generator", desc:"Create Twitter/X bio options online from profession and interests with concise personal positioning lines.", icon:"🐦", free:true },
{ id:"linkedin-summary-gen", cat:"content", name:"LinkedIn Summary Generator", desc:"Generate LinkedIn About summaries online from role, skills, and experience with professional storytelling.", icon:"💼", free:true },
{ id:"product-description-gen", cat:"content", name:"Product Description Generator", desc:"Generate product description options online from name and features for landing pages and storefront listings.", icon:"🛍️", free:true },
{ id:"headline-gen", cat:"content", name:"Headline Generator", desc:"Generate attention-grabbing headlines online from a topic using proven marketing and editorial structures.", icon:"🗞️", free:true },
{ id:"slogan-gen", cat:"content", name:"Slogan Generator", desc:"Generate catchy slogans and taglines online from brand or product positioning keywords.", icon:"📢", free:true },
{ id:"cta-gen", cat:"content", name:"CTA Generator", desc:"Generate call-to-action button text online from campaign goal with conversion-focused phrasing.", icon:"🎯", free:true },
{ id:"subject-line-gen", cat:"content", name:"Subject Line Generator", desc:"Generate email subject line ideas online from topic and goal for stronger open-rate potential.", icon:"📬", free:true },
{ id:"business-name-gen", cat:"content", name:"Business Name Generator", desc:"Generate business name ideas online from industry and keywords with brandable naming patterns.", icon:"🏢", free:true },
{ id:"username-gen", cat:"content", name:"Username Generator", desc:"Generate username ideas online from name or keyword with style variants and availability note prompts.", icon:"👤", free:true },
{ id:"elevator-pitch-gen", cat:"content", name:"Elevator Pitch Generator", desc:"Generate a 30-second elevator pitch online from role and value proposition for networking and interviews.", icon:"🗣️", free:true },
];

const CATEGORIES = [
{ id:"legal", name:"Legal Document Generators", icon:"⚖️", desc:"Generate detailed policy and legal notice documents with practical clauses and editable language." },
{ id:"svg", name:"SVG & Background Generators", icon:"🎨", desc:"Create SVG waves, blobs, patterns, gradients, textures, and abstract backgrounds with live preview." },
{ id:"content", name:"Content & Marketing Copy Generators", icon:"🧠", desc:"Generate titles, captions, bios, descriptions, CTAs, slogans, and naming ideas without API calls." },
];

const TOOL_META = Object.fromEntries(TOOLS.map(t => [t.id, {
title:`Free ${t.name} – Generate Online | ToolsRift`,
desc:t.desc,
faq:[
["Is the generated content editable?", "Yes. You can copy the generated output and adjust wording to fit your specific legal, brand, or platform requirements."],
["Is this tool client-side only?", "Yes. All generation runs in your browser with no external API calls required for output creation."],
["Can I download results?", "Yes. Legal and SVG tools include download options, and content tools include copy controls for each generated option."]
]
}]));

const TOOL_COMPONENTS = {
"privacy-policy-gen": PrivacyPolicyGen,
"terms-conditions-gen": TermsConditionsGen,
"cookie-policy-gen": CookiePolicyGen,
"disclaimer-gen": DisclaimerGen,
"return-policy-gen": ReturnPolicyGen,
"nda-gen": NdaGen,
"copyright-notice-gen": CopyrightNoticeGen,
"dmca-notice-gen": DmcaNoticeGen,
"gdpr-compliance-gen": GdprComplianceGen,
"eula-gen": EulaGen,
"svg-wave-gen": SvgWaveGen,
"svg-blob-gen": SvgBlobGen,
"svg-pattern-gen": SvgPatternGen,
"gradient-gen": GradientGen,
"mesh-gradient-gen": MeshGradientGen,
"noise-texture-gen": NoiseTextureGen,
"geometric-pattern-gen": GeometricPatternGen,
"abstract-bg-gen": AbstractBgGen,
"blog-title-gen": BlogTitleGen,
"youtube-title-gen": YoutubeTitleGen,
"youtube-description-gen": YoutubeDescriptionGen,
"youtube-tags-gen": YoutubeTagsGen,
"instagram-caption-gen": InstagramCaptionGen,
"instagram-hashtag-gen": InstagramHashtagGen,
"twitter-bio-gen": TwitterBioGen,
"linkedin-summary-gen": LinkedinSummaryGen,
"product-description-gen": ProductDescriptionGen,
"headline-gen": HeadlineGen,
"slogan-gen": SloganGen,
"cta-gen": CtaGen,
"subject-line-gen": SubjectLineGen,
"business-name-gen": BusinessNameGen,
"username-gen": UsernameGen,
"elevator-pitch-gen": ElevatorPitchGen,
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
{ "@type": "ListItem", "position": 2, "name": "Content Generators", "item": "https://toolsrift.com/generators2" },
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
    document.title = meta?.title || `${tool?.name} – Free Content Generator | ToolsRift`;
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

function CategoryPage({ catId }) {
const cat = CATEGORIES.find(c => c.id === catId);
const tools = TOOLS.filter(t => t.cat === catId);
if (!cat) return <div style={{maxWidth:900,margin:"0 auto",padding:"40px 20px",color:C.muted}}>Category not found.</div>;
return (
<div style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px 60px" }}>
<Breadcrumb cat={cat} />
<div style={{ marginBottom:18 }}>
<h1 style={T.h1}>{cat.icon} {cat.name}</h1>
<p style={{ color:C.muted, marginTop:8, lineHeight:1.6 }}>{cat.desc}</p>
</div>
<div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
{tools.map(t => (
<a key={t.id} href={`#/tool/${t.id}`} style={{ textDecoration:"none" }}>
<Card style={{ height:"100%" }}>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
<div style={{ fontSize:22 }}>{t.icon}</div>
<Badge color="green">Free</Badge>
</div>
<div style={{ fontWeight:700, color:C.text, marginBottom:6 }}>{t.name}</div>
<div style={{ color:C.muted, fontSize:12, lineHeight:1.6 }}>{t.desc}</div>
</Card>
</a>
))}
</div>
</div>
);
}

function HomePage() {
  useEffect(() => { document.title = "ToolsRift Generators – Free Legal & Content Generators Online"; }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <PremiumCategoryLanding
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search content generator tools..."
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
    <nav style={{
      height: 56, display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 24px", position: "sticky", top: 0, zIndex: 100,
      background: `rgba(6,9,15,${scrolled ? 0.97 : 0.85})`,
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: `1px solid ${scrolled ? "rgba(14,165,233,0.2)" : C.border}`,
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue, boxShadow: `0 0 6px ${C.blue}80`, flexShrink: 0 }} />
        <a href="https://toolsrift.com" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: "#F8FAFC", textDecoration: "none", letterSpacing: "-0.01em" }}>ToolsRift</a>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>›</span>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 14, fontWeight: 500, color: C.blue }}>{THEME?.name}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: "rgba(14,165,233,0.12)", color: C.blue, border: "1px solid rgba(14,165,233,0.25)", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "3px 10px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{TOOLS.length} tools</span>
        <a href="/" style={{ fontSize: 12, color: C.muted, textDecoration: "none", fontWeight: 500 }}>🏠 Home</a>
        {/* PHASE 2: <UsageCounter/> */}
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
{href:"/generators",icon:"⚡",label:"Generators"},
{href:"/generators2",icon:"✍️",label:"Content Gen"},
{href:"/devgen",icon:"⚙️",label:"Dev Config"},
{href:"/mathcalc",icon:"📐",label:"Math Calc"},
{href:"/financecalc",icon:"💰",label:"Finance Calc"},
{href:"/devtools",icon:"🛠️",label:"Dev Tools"},
{href:"/js",icon:"📜",label:"JS Tools"},
{href:"/converters2",icon:"🔄",label:"More Converters"},
{href:"/about",icon:"ℹ️",label:"About"},
{href:"/privacy-policy",icon:"🔏",label:"Privacy Policy"},
].filter(p => !p.href.endsWith("/"+currentPage));
return (
<div style={{maxWidth:860,margin:"0 auto",padding:"32px 20px 28px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
<span style={{fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>Explore More Tools</span>
<a href="/" style={{fontSize:12,color:"#3B82F6",textDecoration:"none",fontWeight:600}}>← Back to Home</a>
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

function ToolsRiftGenContent() {
const route = useAppRouter();
const showChrome = route.page !== 'home' && route.page !== 'tool';
return (
<div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
<style>{GLOBAL_CSS}</style>
{showChrome && <Nav />}
{route.page==="home" && <HomePage />}
{route.page==="tool" && <ToolPage toolId={route.toolId} />}
{route.page==="category" && <CategoryPage catId={route.catId} />}
{showChrome && <SiteFooter currentPage="generators2"/>}
</div>
);
}

export default ToolsRiftGenContent;
