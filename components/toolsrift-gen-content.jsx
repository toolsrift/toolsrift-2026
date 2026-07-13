import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
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

// ---------- Shared helpers ----------
const rInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const rPick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const cap = s => (s || "").trim().replace(/\b\w/g, c => c.toUpperCase());
const YEAR = new Date().getFullYear();

function LegalDocTool({ fields, build, filename }) {
  const defaults = { company:"Acme Inc.", website:"https://example.com", email:"legal@example.com", jurisdiction:"California, United States", date:new Date().toISOString().slice(0,10) };
  const [vals, setVals] = useState(() => {
    const o = {}; fields.forEach(f => { o[f.key] = f.default !== undefined ? f.default : (defaults[f.key] || ""); }); return o;
  });
  const set = (k, v) => setVals(p => ({ ...p, [k]: v }));
  // Every generated legal document carries a disclaimer header so it travels with
  // the copied/downloaded text, not just the on-screen UI.
  const DISCLAIMER = "DISCLAIMER: This is an auto-generated template, not legal advice. Review it with a qualified attorney before publishing or relying on it.";
  const text = `${DISCLAIMER}\n${"=".repeat(64)}\n\n${build(vals)}`;
  return (
    <VStack>
      <div style={{ padding:"12px 14px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6 }}>
        <strong>Not legal advice.</strong> This tool produces a starting template only. Laws vary by country, state and industry — have a qualified lawyer review any policy or agreement before you rely on it.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {fields.map(f => (
          <div key={f.key} style={f.full ? { gridColumn:"1 / -1" } : {}}>
            <Label>{f.label}</Label>
            {f.type === "textarea"
              ? <Textarea value={vals[f.key]} onChange={v => set(f.key, v)} rows={3} placeholder={f.placeholder} />
              : <Input value={vals[f.key]} onChange={v => set(f.key, v)} placeholder={f.placeholder} />}
          </div>
        ))}
      </div>
      <Textarea value={text} onChange={() => {}} rows={16} mono style={{ minHeight:280 }} />
      <LegalDocActions text={text} filename={filename} />
    </VStack>
  );
}

function SvgOutput({ svg, filename }) {
  return (
    <VStack gap={10}>
      <div style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${C.border}`, background:"#0b0e14", display:"flex", justifyContent:"center", alignItems:"center", minHeight:160 }}
        dangerouslySetInnerHTML={{ __html: svg }} />
      <Textarea value={svg} onChange={() => {}} rows={6} mono />
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <CopyBtn text={svg} />
        <Btn variant="secondary" size="sm" onClick={() => downloadText(filename || "art.svg", svg)}>Download SVG</Btn>
      </div>
    </VStack>
  );
}

function CssOutput({ css, previewStyle }) {
  return (
    <VStack gap={10}>
      <div style={{ borderRadius:10, border:`1px solid ${C.border}`, minHeight:160, ...previewStyle }} />
      <Textarea value={css} onChange={() => {}} rows={5} mono />
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <CopyBtn text={css} />
        <Btn variant="secondary" size="sm" onClick={() => downloadText("style.css", css)}>Download CSS</Btn>
      </div>
    </VStack>
  );
}

function ContentList({ items, empty="Fill in the details above and click Generate." }) {
  const all = (items || []).join("\n");
  return (
    <VStack gap={8}>
      {(!items || items.length === 0) && <Result mono={false}>{empty}</Result>}
      {(items || []).map((it, i) => (
        <div key={i} style={{ display:"flex", justifyContent:"space-between", gap:10, background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", alignItems:"center" }}>
          <span style={{ color:C.text, fontSize:13, lineHeight:1.5, whiteSpace:"pre-wrap" }}>{it}</span>
          <div style={{ flexShrink:0 }}><CopyBtn text={it} /></div>
        </div>
      ))}
      {items && items.length > 0 && (
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <CopyBtn text={all} />
          <Btn variant="secondary" size="sm" onClick={() => downloadText("content.txt", all)}>Download All</Btn>
        </div>
      )}
    </VStack>
  );
}

function BlockOutput({ text }) {
  return (
    <VStack gap={8}>
      <Textarea value={text} onChange={() => {}} rows={10} />
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <CopyBtn text={text} />
        <Btn variant="secondary" size="sm" onClick={() => downloadText("content.txt", text)}>Download</Btn>
      </div>
    </VStack>
  );
}

// ---------- Legal document generators ----------
function PrivacyPolicyGen() {
  return <LegalDocTool filename="privacy-policy.txt"
    fields={[
      { key:"company", label:"Company / Site name" },
      { key:"website", label:"Website URL" },
      { key:"email", label:"Contact email" },
      { key:"date", label:"Effective date" },
    ]}
    build={v => buildDocument("PRIVACY POLICY", [
      { h:"1. Introduction", p:`This Privacy Policy describes how ${v.company} ("we", "us", or "our") collects, uses, and protects information when you visit ${v.website} (the "Site"). Effective date: ${v.date}. By using the Site you agree to the practices described here.` },
      { h:"2. Information We Collect", p:`We may collect personal information you provide directly (such as name and email address) and information collected automatically, including IP address, browser type, device information, pages visited, and referring URLs.` },
      { h:"3. How We Use Your Information", p:`We use collected information to operate and improve the Site, respond to inquiries, personalize content, analyze usage, prevent fraud, and comply with legal obligations.` },
      { h:"4. Cookies and Tracking", p:`The Site uses cookies and similar technologies to remember preferences, measure traffic, and support analytics. You can disable cookies through your browser settings, though some features may not function properly.` },
      { h:"5. Third-Party Services", p:`We may use third-party services (such as analytics and advertising providers) that collect information under their own privacy policies. We are not responsible for the practices of third parties.` },
      { h:"6. Data Retention", p:`We retain personal information only as long as necessary for the purposes described in this policy or as required by law.` },
      { h:"7. Your Rights", p:`Depending on your location, you may have the right to access, correct, delete, or restrict the use of your personal information. To exercise these rights, contact us at ${v.email}.` },
      { h:"8. Data Security", p:`We implement reasonable technical and organizational measures to protect your information; however, no method of transmission or storage is completely secure.` },
      { h:"9. Children's Privacy", p:`The Site is not intended for children under 13, and we do not knowingly collect personal information from them.` },
      { h:"10. Changes to This Policy", p:`We may update this Privacy Policy from time to time. Changes are effective when posted on this page with an updated effective date.` },
      { h:"11. Contact Us", p:`If you have questions about this Privacy Policy, contact ${v.company} at ${v.email}.` },
    ])} />;
}

function TermsConditionsGen() {
  return <LegalDocTool filename="terms-and-conditions.txt"
    fields={[
      { key:"company", label:"Company / Site name" },
      { key:"website", label:"Website URL" },
      { key:"email", label:"Contact email" },
      { key:"jurisdiction", label:"Governing jurisdiction" },
    ]}
    build={v => buildDocument("TERMS & CONDITIONS", [
      { h:"1. Acceptance of Terms", p:`These Terms & Conditions govern your use of ${v.website} operated by ${v.company}. By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, do not use the Site.` },
      { h:"2. Use of the Site", p:`You agree to use the Site only for lawful purposes and in a manner that does not infringe the rights of, or restrict the use of, the Site by any third party.` },
      { h:"3. Intellectual Property", p:`All content, trademarks, logos, and materials on the Site are the property of ${v.company} or its licensors and are protected by applicable intellectual property laws.` },
      { h:"4. Prohibited Activities", p:`You may not misuse the Site, including attempting unauthorized access, distributing malware, scraping content without permission, or engaging in fraudulent activity.` },
      { h:"5. Disclaimer of Warranties", p:`The Site is provided "as is" and "as available" without warranties of any kind, whether express or implied, including fitness for a particular purpose.` },
      { h:"6. Limitation of Liability", p:`To the maximum extent permitted by law, ${v.company} shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Site.` },
      { h:"7. Third-Party Links", p:`The Site may contain links to third-party websites. We are not responsible for the content or practices of those websites.` },
      { h:"8. Termination", p:`We may suspend or terminate your access to the Site at any time, without notice, for conduct that violates these Terms.` },
      { h:"9. Governing Law", p:`These Terms are governed by and construed in accordance with the laws of ${v.jurisdiction}, without regard to its conflict of law provisions.` },
      { h:"10. Contact", p:`Questions about these Terms may be directed to ${v.email}.` },
    ])} />;
}

function CookiePolicyGen() {
  return <LegalDocTool filename="cookie-policy.txt"
    fields={[
      { key:"company", label:"Company / Site name" },
      { key:"website", label:"Website URL" },
      { key:"email", label:"Contact email" },
      { key:"date", label:"Effective date" },
    ]}
    build={v => buildDocument("COOKIE POLICY", [
      { h:"1. What Are Cookies", p:`Cookies are small text files stored on your device when you visit ${v.website}. They help the Site function and provide information to the owners. Effective date: ${v.date}.` },
      { h:"2. How We Use Cookies", p:`${v.company} uses cookies to remember your preferences, keep you signed in, understand how the Site is used, and support advertising and analytics.` },
      { h:"3. Essential Cookies", p:`These cookies are necessary for the Site to function and cannot be switched off. They are usually set in response to actions you take, such as setting privacy preferences or filling in forms.` },
      { h:"4. Analytics Cookies", p:`These cookies allow us to count visits and traffic sources so we can measure and improve the performance of the Site.` },
      { h:"5. Preference Cookies", p:`These cookies enable the Site to remember choices you make (such as language or region) to provide enhanced, personalized features.` },
      { h:"6. Advertising Cookies", p:`These cookies may be set through the Site by advertising partners to build a profile of your interests and show relevant ads on other sites.` },
      { h:"7. Managing Cookies", p:`You can control and delete cookies through your browser settings. Disabling cookies may affect the functionality of the Site.` },
      { h:"8. Contact", p:`For questions about our use of cookies, contact ${v.company} at ${v.email}.` },
    ])} />;
}

function DisclaimerGen() {
  return <LegalDocTool filename="disclaimer.txt"
    fields={[
      { key:"company", label:"Company / Site name" },
      { key:"website", label:"Website URL" },
      { key:"email", label:"Contact email" },
    ]}
    build={v => buildDocument("DISCLAIMER", [
      { h:"1. General Information", p:`The information provided by ${v.company} on ${v.website} is for general informational purposes only. All information is provided in good faith; however, we make no representation or warranty of any kind regarding its accuracy or completeness.` },
      { h:"2. No Professional Advice", p:`The Site does not contain professional (legal, financial, or medical) advice. Any reliance you place on such information is strictly at your own risk.` },
      { h:"3. External Links", p:`The Site may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy or reliability of any information on these external sites.` },
      { h:"4. Limitation of Liability", p:`Under no circumstance shall ${v.company} be liable for any loss or damage of any kind incurred as a result of the use of the Site or reliance on any information provided.` },
      { h:"5. Contact", p:`If you have questions about this Disclaimer, contact us at ${v.email}.` },
    ])} />;
}

function ReturnPolicyGen() {
  return <LegalDocTool filename="return-policy.txt"
    fields={[
      { key:"company", label:"Store name" },
      { key:"email", label:"Support email" },
      { key:"days", label:"Return window (days)", default:"30" },
      { key:"website", label:"Website URL" },
    ]}
    build={v => buildDocument("RETURN & REFUND POLICY", [
      { h:"1. Overview", p:`At ${v.company} we want you to be satisfied with your purchase. This policy explains how returns and refunds work for orders placed on ${v.website}.` },
      { h:"2. Return Window", p:`You may request a return within ${v.days} days of receiving your order. To be eligible, items must be unused, in their original condition, and in the original packaging.` },
      { h:"3. Non-Returnable Items", p:`Certain items cannot be returned, including perishable goods, digital downloads, gift cards, and personalized products, unless they arrive damaged or defective.` },
      { h:"4. How to Start a Return", p:`To start a return, contact us at ${v.email} with your order number and reason for return. We will provide instructions on how and where to send your item.` },
      { h:"5. Refunds", p:`Once your return is received and inspected, we will notify you of the approval or rejection of your refund. Approved refunds are processed to your original payment method within 5–10 business days.` },
      { h:"6. Exchanges", p:`If you need to exchange an item for the same product, contact ${v.email}. Exchanges are subject to availability.` },
      { h:"7. Shipping Costs", p:`Return shipping costs are the responsibility of the customer unless the item was received damaged or incorrect.` },
      { h:"8. Contact", p:`For any questions about returns, reach us at ${v.email}.` },
    ])} />;
}

function NdaGen() {
  return <LegalDocTool filename="nda.txt"
    fields={[
      { key:"partyA", label:"Disclosing Party", default:"Acme Inc." },
      { key:"partyB", label:"Receiving Party", default:"Recipient Name" },
      { key:"date", label:"Effective date" },
      { key:"jurisdiction", label:"Governing jurisdiction" },
      { key:"mutual", label:"Type (mutual / one-way)", default:"mutual" },
    ]}
    build={v => buildDocument("NON-DISCLOSURE AGREEMENT", [
      { h:"1. Parties", p:`This Non-Disclosure Agreement ("Agreement") is entered into as of ${v.date} between ${v.partyA} and ${v.partyB} (each a "Party"). This is a ${/one/i.test(v.mutual) ? "one-way" : "mutual"} confidentiality agreement.` },
      { h:"2. Definition of Confidential Information", p:`"Confidential Information" means any non-public information disclosed by one Party to the other, whether oral, written, or electronic, including business plans, technical data, customer lists, and trade secrets.` },
      { h:"3. Obligations", p:`The receiving Party agrees to keep Confidential Information strictly confidential, to use it solely for the purpose of the parties' relationship, and not to disclose it to any third party without prior written consent.` },
      { h:"4. Exclusions", p:`Confidential Information does not include information that is or becomes publicly available through no fault of the receiving Party, was rightfully known before disclosure, or is independently developed.` },
      { h:"5. Term", p:`The obligations under this Agreement remain in effect for a period of three (3) years from the date of disclosure, unless otherwise agreed in writing.` },
      { h:"6. Return of Materials", p:`Upon request, the receiving Party shall promptly return or destroy all materials containing Confidential Information.` },
      { h:"7. Governing Law", p:`This Agreement is governed by the laws of ${v.jurisdiction}.` },
      { h:"8. Signatures", p:`${v.partyA}\n\nBy: ____________________   Date: __________\n\n${v.partyB}\n\nBy: ____________________   Date: __________` },
    ])} />;
}

function CopyrightNoticeGen() {
  return <LegalDocTool filename="copyright-notice.txt"
    fields={[
      { key:"owner", label:"Copyright owner", default:"Acme Inc." },
      { key:"year", label:"Year", default:String(YEAR) },
      { key:"website", label:"Website (optional)" },
      { key:"rights", label:"Rights statement", default:"All rights reserved." },
    ]}
    build={v => `© ${v.year} ${v.owner}. ${v.rights}\n\n` +
      `Copyright © ${v.year} ${v.owner}\n${v.rights}\n\n` +
      `All content on ${v.website || "this website"}, including text, graphics, logos, images, and software, is the property of ${v.owner} and is protected by international copyright laws. No part of this material may be reproduced, distributed, or transmitted in any form without the prior written permission of ${v.owner}.\n\n` +
      `HTML:\n<p>&copy; ${v.year} ${v.owner}. ${v.rights}</p>\n`} />;
}

function DmcaNoticeGen() {
  return <LegalDocTool filename="dmca-notice.txt"
    fields={[
      { key:"owner", label:"Your name / company", default:"Rights Holder" },
      { key:"email", label:"Your contact email" },
      { key:"work", label:"Original work (URL/description)", full:true, default:"https://example.com/original-work", type:"textarea" },
      { key:"infringing", label:"Infringing material URL(s)", full:true, default:"https://infringer.com/stolen-page", type:"textarea" },
    ]}
    build={v => buildDocument("DMCA TAKEDOWN NOTICE", [
      { h:"To Whom It May Concern", p:`I, ${v.owner}, am submitting this notice under the Digital Millennium Copyright Act (DMCA) to report copyright infringement.` },
      { h:"1. Identification of Copyrighted Work", p:`The original copyrighted work is located at / described as:\n${v.work}` },
      { h:"2. Identification of Infringing Material", p:`The infringing material that should be removed is located at:\n${v.infringing}` },
      { h:"3. Contact Information", p:`I can be contacted at: ${v.email}` },
      { h:"4. Good Faith Statement", p:`I have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.` },
      { h:"5. Accuracy Statement", p:`I swear, under penalty of perjury, that the information in this notice is accurate and that I am the copyright owner or authorized to act on behalf of the owner.` },
      { h:"6. Signature", p:`Signed: ${v.owner}\nDate: ${new Date().toISOString().slice(0,10)}` },
    ])} />;
}

function GdprComplianceGen() {
  return <LegalDocTool filename="gdpr-notice.txt"
    fields={[
      { key:"company", label:"Company / Controller name" },
      { key:"email", label:"Data protection contact email" },
      { key:"basis", label:"Lawful basis", default:"consent and legitimate interest" },
      { key:"retention", label:"Retention period", default:"24 months" },
    ]}
    build={v => buildDocument("GDPR DATA PROCESSING NOTICE", [
      { h:"1. Data Controller", p:`${v.company} is the data controller responsible for your personal data. For any data protection inquiries, contact ${v.email}.` },
      { h:"2. Lawful Basis for Processing", p:`We process personal data on the basis of ${v.basis}, in accordance with Article 6 of the General Data Protection Regulation (GDPR).` },
      { h:"3. Data We Process", p:`We may process identity data, contact data, technical data (IP address, device identifiers), and usage data relating to how you interact with our services.` },
      { h:"4. Your Rights", p:`Under the GDPR you have the right to access, rectify, erase, restrict, and port your personal data, and to object to processing. You also have the right to withdraw consent at any time and to lodge a complaint with a supervisory authority.` },
      { h:"5. Data Retention", p:`We retain personal data for ${v.retention}, or for as long as necessary to fulfil the purposes described in this notice and to comply with legal obligations.` },
      { h:"6. International Transfers", p:`Where personal data is transferred outside the European Economic Area, we ensure appropriate safeguards such as Standard Contractual Clauses are in place.` },
      { h:"7. Contact", p:`To exercise any of your rights, contact ${v.company} at ${v.email}.` },
    ])} />;
}

function EulaGen() {
  return <LegalDocTool filename="eula.txt"
    fields={[
      { key:"company", label:"Software company / licensor" },
      { key:"product", label:"Software / app name", default:"MyApp" },
      { key:"email", label:"Contact email" },
      { key:"jurisdiction", label:"Governing jurisdiction" },
    ]}
    build={v => buildDocument("END USER LICENSE AGREEMENT (EULA)", [
      { h:"1. License Grant", p:`${v.company} ("Licensor") grants you a non-exclusive, non-transferable, revocable license to install and use ${v.product} (the "Software") for your personal or internal business purposes, subject to this Agreement.` },
      { h:"2. Restrictions", p:`You may not copy, modify, reverse engineer, decompile, distribute, sublicense, or create derivative works of the Software except as expressly permitted by law.` },
      { h:"3. Ownership", p:`The Software is licensed, not sold. ${v.company} retains all right, title, and interest in and to the Software, including all intellectual property rights.` },
      { h:"4. Updates", p:`Licensor may provide updates or upgrades to the Software at its discretion. This Agreement governs any updates unless accompanied by separate terms.` },
      { h:"5. Termination", p:`This license is effective until terminated. It terminates automatically if you breach any term. Upon termination, you must cease all use and destroy all copies of the Software.` },
      { h:"6. Disclaimer of Warranty", p:`The Software is provided "as is" without warranty of any kind. ${v.company} disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose.` },
      { h:"7. Limitation of Liability", p:`In no event shall ${v.company} be liable for any damages arising out of the use of or inability to use the Software.` },
      { h:"8. Governing Law", p:`This Agreement is governed by the laws of ${v.jurisdiction}. Questions may be directed to ${v.email}.` },
    ])} />;
}

// ---------- SVG & background generators ----------
const seeded = s => { const x = Math.sin(s * 99991) * 10000; return x - Math.floor(x); };

function SvgWaveGen() {
  const [color, setColor] = useState("#0EA5E9");
  const [height, setHeight] = useState(200);
  const [amp, setAmp] = useState(40);
  const [freq, setFreq] = useState(2);
  const W = 1440;
  const buildWave = (yBase, amplitude, phase) => {
    const steps = 40; const pts = [];
    for (let i = 0; i <= steps; i++) pts.push([(i / steps) * W, yBase + Math.sin((i / steps) * Math.PI * 2 * freq + phase) * amplitude]);
    return `M0,${height} L0,${pts[0][1].toFixed(1)} ` + pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + ` L${W},${height} Z`;
  };
  const svg = `<svg viewBox="0 0 ${W} ${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width:100%;height:auto;display:block">\n  <path d="${buildWave(height * 0.55, amp, 0)}" fill="${color}" fill-opacity="0.35"/>\n  <path d="${buildWave(height * 0.65, amp * 0.8, 1.5)}" fill="${color}" fill-opacity="0.6"/>\n  <path d="${buildWave(height * 0.75, amp * 0.6, 3)}" fill="${color}"/>\n</svg>`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Height: {height}px</Label><input type="range" min={100} max={400} value={height} onChange={e => setHeight(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Amplitude: {amp}</Label><input type="range" min={5} max={100} value={amp} onChange={e => setAmp(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
        <div><Label>Waves: {freq}</Label><input type="range" min={1} max={6} value={freq} onChange={e => setFreq(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      </Grid2>
      <SvgOutput svg={svg} filename="wave.svg" />
    </VStack>
  );
}

function SvgBlobGen() {
  const [color, setColor] = useState("#6366F1");
  const [points, setPoints] = useState(6);
  const [randomness, setRandomness] = useState(0.4);
  const [seed, setSeed] = useState(1);
  const S = 400;
  const cx = S / 2, cy = S / 2, r = S * 0.34;
  const pts = [];
  for (let i = 0; i < points; i++) {
    const ang = (i / points) * Math.PI * 2;
    const rr = r * (1 - randomness + seeded(seed + i * 1.7) * randomness * 2);
    pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
  }
  const mid = (a, b) => [((a[0] + b[0]) / 2), ((a[1] + b[1]) / 2)];
  let start = mid(pts[points - 1], pts[0]);
  let d = `M${start[0].toFixed(1)},${start[1].toFixed(1)} `;
  for (let i = 0; i < points; i++) {
    const cur = pts[i], next = pts[(i + 1) % points]; const m = mid(cur, next);
    d += `Q${cur[0].toFixed(1)},${cur[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)} `;
  }
  d += "Z";
  const svg = `<svg viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:300px;height:auto;display:block">\n  <path d="${d}" fill="${color}"/>\n</svg>`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Points: {points}</Label><input type="range" min={4} max={12} value={points} onChange={e => setPoints(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      </Grid2>
      <div><Label>Randomness: {randomness.toFixed(2)}</Label><input type="range" min={0} max={0.8} step={0.05} value={randomness} onChange={e => setRandomness(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      <Btn variant="secondary" size="sm" onClick={() => setSeed(s => s + 1)}>🎲 Randomize Shape</Btn>
      <SvgOutput svg={svg} filename="blob.svg" />
    </VStack>
  );
}

function SvgPatternGen() {
  const [type, setType] = useState("dots");
  const [fg, setFg] = useState("#0EA5E9");
  const [bg, setBg] = useState("#0b0e14");
  const [size, setSize] = useState(24);
  let pat = "";
  if (type === "dots") pat = `<circle cx="${size/2}" cy="${size/2}" r="${size*0.12}" fill="${fg}"/>`;
  else if (type === "grid") pat = `<path d="M${size} 0 L0 0 0 ${size}" fill="none" stroke="${fg}" stroke-width="1"/>`;
  else if (type === "stripes") pat = `<rect width="${size/2}" height="${size}" fill="${fg}"/>`;
  else if (type === "zigzag") pat = `<path d="M0 ${size*0.75} L${size/2} ${size*0.25} L${size} ${size*0.75}" fill="none" stroke="${fg}" stroke-width="2"/>`;
  else if (type === "cross") pat = `<path d="M${size/2} ${size*0.25} V${size*0.75} M${size*0.25} ${size/2} H${size*0.75}" stroke="${fg}" stroke-width="2"/>`;
  const svg = `<svg viewBox="0 0 240 160" width="240" height="160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">\n  <defs>\n    <pattern id="p" width="${size}" height="${size}" patternUnits="userSpaceOnUse">\n      ${pat}\n    </pattern>\n  </defs>\n  <rect width="100%" height="100%" fill="${bg}"/>\n  <rect width="100%" height="100%" fill="url(#p)"/>\n</svg>`;
  return (
    <VStack>
      <div><Label>Pattern</Label><SelectInput value={type} onChange={setType} options={[{value:"dots",label:"Dots"},{value:"grid",label:"Grid"},{value:"stripes",label:"Stripes"},{value:"zigzag",label:"Zigzag"},{value:"cross",label:"Cross"}]} style={{ width:"100%" }} /></div>
      <Grid2>
        <div><Label>Foreground</Label><input type="color" value={fg} onChange={e => setFg(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Background</Label><input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
      </Grid2>
      <div><Label>Tile size: {size}px</Label><input type="range" min={10} max={60} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      <SvgOutput svg={svg} filename="pattern.svg" />
    </VStack>
  );
}

function GradientGen() {
  const [type, setType] = useState("linear");
  const [angle, setAngle] = useState(135);
  const [c1, setC1] = useState("#0EA5E9");
  const [c2, setC2] = useState("#6366F1");
  const [c3, setC3] = useState("");
  const stops = [c1, c2, ...(c3 ? [c3] : [])].join(", ");
  const value = type === "linear" ? `linear-gradient(${angle}deg, ${stops})` : `radial-gradient(circle, ${stops})`;
  const css = `background: ${value};`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Type</Label><SelectInput value={type} onChange={setType} options={[{value:"linear",label:"Linear"},{value:"radial",label:"Radial"}]} style={{ width:"100%" }} /></div>
        {type === "linear" ? <div><Label>Angle: {angle}°</Label><input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div> : <div />}
      </Grid2>
      <Grid3>
        <div><Label>Color 1</Label><input type="color" value={c1} onChange={e => setC1(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Color 2</Label><input type="color" value={c2} onChange={e => setC2(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Color 3 (opt)</Label><input type="color" value={c3 || "#000000"} onChange={e => setC3(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
      </Grid3>
      {c3 && <Btn variant="ghost" size="sm" onClick={() => setC3("")}>Remove third color</Btn>}
      <CssOutput css={css} previewStyle={{ background:value }} />
    </VStack>
  );
}

function MeshGradientGen() {
  const [seed, setSeed] = useState(1);
  const palette = ["#0EA5E9","#6366F1","#EC4899","#F59E0B","#10B981","#8B5CF6","#EF4444","#14B8A6"];
  const cols = shuffle(palette).slice(0, 4);
  // seed only used to force re-shuffle via re-render
  const layers = cols.map((c, i) => `radial-gradient(at ${rInt(5,95)}% ${rInt(5,95)}%, ${c} 0px, transparent 55%)`);
  void seed;
  const value = layers.join(",\n    ");
  const css = `background-color: ${cols[0]};\nbackground-image:\n    ${value};`;
  return (
    <VStack>
      <Btn variant="secondary" size="sm" onClick={() => setSeed(s => s + 1)}>🎲 Randomize Mesh</Btn>
      <CssOutput css={css} previewStyle={{ backgroundColor:cols[0], backgroundImage:layers.join(",") }} />
    </VStack>
  );
}

function NoiseTextureGen() {
  const [freq, setFreq] = useState(0.8);
  const [opacity, setOpacity] = useState(0.35);
  const [bg, setBg] = useState("#111827");
  const svg = `<svg viewBox="0 0 240 160" width="240" height="160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">\n  <rect width="100%" height="100%" fill="${bg}"/>\n  <filter id="noise">\n    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" stitchTiles="stitch"/>\n  </filter>\n  <rect width="100%" height="100%" filter="url(#noise)" opacity="${opacity}"/>\n</svg>`;
  return (
    <VStack>
      <div><Label>Base frequency: {freq.toFixed(2)}</Label><input type="range" min={0.1} max={1.5} step={0.05} value={freq} onChange={e => setFreq(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      <div><Label>Noise opacity: {opacity.toFixed(2)}</Label><input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      <div><Label>Background</Label><input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
      <SvgOutput svg={svg} filename="noise.svg" />
    </VStack>
  );
}

function GeometricPatternGen() {
  const [seed, setSeed] = useState(1);
  const [c1, setC1] = useState("#0EA5E9");
  const [c2, setC2] = useState("#6366F1");
  const [bg, setBg] = useState("#0b0e14");
  const W = 240, H = 160, cell = 40;
  let shapes = "";
  let k = 0;
  for (let y = 0; y < H; y += cell) {
    for (let x = 0; x < W; x += cell) {
      const rnd = seeded(seed + k * 2.13);
      const col = rnd > 0.5 ? c1 : c2;
      if (rnd < 0.33) shapes += `<circle cx="${x + cell/2}" cy="${y + cell/2}" r="${cell*0.35}" fill="${col}"/>`;
      else if (rnd < 0.66) shapes += `<polygon points="${x},${y+cell} ${x+cell/2},${y} ${x+cell},${y+cell}" fill="${col}"/>`;
      else shapes += `<line x1="${x}" y1="${y}" x2="${x+cell}" y2="${y+cell}" stroke="${col}" stroke-width="3"/>`;
      k++;
    }
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">\n  <rect width="100%" height="100%" fill="${bg}"/>\n  ${shapes}\n</svg>`;
  return (
    <VStack>
      <Grid3>
        <div><Label>Color 1</Label><input type="color" value={c1} onChange={e => setC1(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Color 2</Label><input type="color" value={c2} onChange={e => setC2(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
        <div><Label>Background</Label><input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }} /></div>
      </Grid3>
      <Btn variant="secondary" size="sm" onClick={() => setSeed(s => s + 1)}>🎲 Randomize</Btn>
      <SvgOutput svg={svg} filename="geometric.svg" />
    </VStack>
  );
}

function AbstractBgGen() {
  const [seed, setSeed] = useState(1);
  const palette = ["#0EA5E9","#6366F1","#EC4899","#F59E0B","#10B981","#8B5CF6"];
  const W = 300, H = 200;
  let blobs = "";
  for (let i = 0; i < 5; i++) {
    const col = palette[Math.floor(seeded(seed + i * 3.1) * palette.length)];
    const cx = seeded(seed + i * 7.3) * W, cy = seeded(seed + i * 5.9) * H, r = 40 + seeded(seed + i) * 70;
    blobs += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="${col}" fill-opacity="0.55"/>`;
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">\n  <rect width="100%" height="100%" fill="#0b0e14"/>\n  <g filter="url(#b)">${blobs}</g>\n  <defs><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="24"/></filter></defs>\n</svg>`;
  return (
    <VStack>
      <Btn variant="secondary" size="sm" onClick={() => setSeed(s => s + 1)}>🎲 Randomize Background</Btn>
      <SvgOutput svg={svg} filename="abstract-bg.svg" />
    </VStack>
  );
}

// ---------- Content & marketing copy generators ----------
function useTopicTool(defaultTopic, buildFn) {
  const [topic, setTopic] = useState(defaultTopic);
  const [items, setItems] = useState([]);
  const gen = () => setItems(buildFn(topic.trim() || defaultTopic));
  useEffect(() => { setItems(buildFn(defaultTopic)); /* eslint-disable-next-line */ }, []);
  return { topic, setTopic, items, gen };
}

function BlogTitleGen() {
  const { topic, setTopic, items, gen } = useTopicTool("productivity", t => shuffle([
    `${rInt(7,15)} Proven Ways to Improve Your ${cap(t)}`,
    `The Ultimate Guide to ${cap(t)} in ${YEAR}`,
    `How to Master ${cap(t)} (Even If You're a Beginner)`,
    `Why ${cap(t)} Matters More Than You Think`,
    `${cap(t)}: Everything You Need to Know`,
    `The Beginner's Guide to ${cap(t)}`,
    `${rInt(5,12)} Common ${cap(t)} Mistakes and How to Avoid Them`,
    `${cap(t)} 101: A Complete Walkthrough`,
    `Stop Doing These ${cap(t)} Mistakes Today`,
    `The Secret to Better ${cap(t)} Nobody Talks About`,
  ]).slice(0, 8));
  return (
    <VStack>
      <div><Label>Topic / keyword</Label><Input value={topic} onChange={setTopic} placeholder="e.g. remote work" /></div>
      <Btn onClick={gen}>⚡ Generate Titles</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function YoutubeTitleGen() {
  const { topic, setTopic, items, gen } = useTopicTool("photography", t => shuffle([
    `I Tried ${cap(t)} for 30 Days — Here's What Happened`,
    `The TRUTH About ${cap(t)} (Nobody Tells You This)`,
    `${cap(t)}: ${rInt(5,10)} Tips That Actually Work`,
    `Why Everyone Is Wrong About ${cap(t)}`,
    `How I Got Better at ${cap(t)} FAST`,
    `${cap(t)} for Beginners — Full Guide ${YEAR}`,
    `Watch This BEFORE You Start ${cap(t)}`,
    `The ${cap(t)} Mistake That's Ruining Your Results`,
    `${rInt(3,7)} ${cap(t)} Hacks You Wish You Knew Sooner`,
  ]).slice(0, 8));
  return (
    <VStack>
      <div><Label>Video topic</Label><Input value={topic} onChange={setTopic} placeholder="e.g. street photography" /></div>
      <Btn onClick={gen}>⚡ Generate Titles</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function YoutubeDescriptionGen() {
  const [title, setTitle] = useState("How to Edit Photos Like a Pro");
  const [points, setPoints] = useState("Choosing the right software\nColor grading basics\nExporting for web");
  const [link, setLink] = useState("https://example.com");
  const [text, setText] = useState("");
  const gen = () => {
    const pts = points.split("\n").map(p => p.trim()).filter(Boolean);
    let ts = 0;
    const chapters = pts.map((p, i) => { const t = `${String(Math.floor(ts/60)).padStart(2,"0")}:${String(ts%60).padStart(2,"0")}`; ts += rInt(90, 180); return `${t} ${p}`; });
    setText(
`${title}

In this video, we break down everything you need to know. Whether you're just getting started or looking to level up, this guide has you covered.

⏱️ TIMESTAMPS
00:00 Intro
${chapters.join("\n")}

🔗 RESOURCES
Website: ${link}

👍 If you found this helpful, like and subscribe for more content.

#${(title.split(" ")[0] || "video").toLowerCase()} #tutorial #howto`);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <div><Label>Video title</Label><Input value={title} onChange={setTitle} /></div>
      <div><Label>Key points (one per line)</Label><Textarea value={points} onChange={setPoints} rows={4} /></div>
      <div><Label>Link</Label><Input value={link} onChange={setLink} /></div>
      <Btn onClick={gen}>⚡ Generate Description</Btn>
      <BlockOutput text={text} />
    </VStack>
  );
}

function YoutubeTagsGen() {
  const { topic, setTopic, items, gen } = useTopicTool("cooking", t => {
    const base = t.toLowerCase();
    const mods = ["tutorial","tips","guide","for beginners","how to",YEAR+"",`best ${base}`,`${base} ideas`,`${base} tricks`,`learn ${base}`,`${base} explained`,`${base} basics`,`easy ${base}`,`${base} at home`,`${base} course`,`${base} step by step`,`${base} hacks`,`${base} mistakes`,`${base} tools`,`${base} review`];
    const tags = Array.from(new Set([base, ...mods.map(m => m.includes(base) ? m : `${base} ${m}`)])).slice(0, 28);
    return [tags.join(", ")];
  });
  return (
    <VStack>
      <div><Label>Niche / topic</Label><Input value={topic} onChange={setTopic} placeholder="e.g. home cooking" /></div>
      <Btn onClick={gen}>⚡ Generate Tags</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function InstagramCaptionGen() {
  const [topic, setTopic] = useState("morning coffee");
  const [mood, setMood] = useState("aesthetic");
  const [items, setItems] = useState([]);
  const gen = () => {
    const t = topic.trim() || "life";
    const moods = {
      aesthetic: [`Chasing light and ${t}. ✨`, `A little ${t}, a lot of magic.`, `Slow mornings and ${t}. 🤍`],
      funny: [`${cap(t)} > my problems 😌`, `Me + ${t} = unstoppable (kind of).`, `Powered by ${t} and questionable decisions.`],
      motivational: [`Every day is a fresh start with ${t}. 🌱`, `Small moments like ${t} build big dreams.`, `Show up for your ${t}. Show up for you.`],
    };
    const tags = shuffle([`#${t.replace(/\s/g,"")}`, "#instagood", "#photooftheday", "#vibes", "#dailylife", "#moments", "#aesthetic", "#instadaily"]).slice(0, 6).join(" ");
    setItems((moods[mood] || moods.aesthetic).map(c => `${c}\n\n${tags}`));
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <Grid2>
        <div><Label>Topic</Label><Input value={topic} onChange={setTopic} placeholder="e.g. sunset walk" /></div>
        <div><Label>Mood</Label><SelectInput value={mood} onChange={setMood} options={[{value:"aesthetic",label:"Aesthetic"},{value:"funny",label:"Funny"},{value:"motivational",label:"Motivational"}]} style={{ width:"100%" }} /></div>
      </Grid2>
      <Btn onClick={gen}>⚡ Generate Captions</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function InstagramHashtagGen() {
  const { topic, setTopic, items, gen } = useTopicTool("travel", t => {
    const base = t.toLowerCase().replace(/\s/g, "");
    const generic = ["instagood","photooftheday","love","instadaily","picoftheday","beautiful","happy","art","photography","nature","style","inspiration","explore","trending","viral","aesthetic","dailypost","community","lifestyle","mood"];
    const niche = [base, `${base}life`, `${base}lover`, `${base}gram`, `${base}daily`, `${base}addict`, `insta${base}`, `${base}ofinstagram`, `best${base}`, `${base}vibes`];
    const tags = shuffle([...niche, ...generic]).slice(0, 30).map(x => `#${x}`);
    return [tags.join(" ")];
  });
  return (
    <VStack>
      <div><Label>Niche / topic</Label><Input value={topic} onChange={setTopic} placeholder="e.g. fitness" /></div>
      <Btn onClick={gen}>⚡ Generate 30 Hashtags</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function TwitterBioGen() {
  const [role, setRole] = useState("Software Engineer");
  const [interests, setInterests] = useState("coffee, open source, running");
  const [items, setItems] = useState([]);
  const gen = () => {
    const ints = interests.split(",").map(s => s.trim()).filter(Boolean);
    const emoji = ["✨","🚀","☕","💡","📚","🎯"];
    setItems(shuffle([
      `${role} • ${ints.slice(0,3).join(" • ")} ${rPick(emoji)}`,
      `${rPick(emoji)} ${role} building cool things. Into ${ints[0] || "life"} & ${ints[1] || "learning"}.`,
      `${role} by day. ${cap(ints[0] || "dreamer")} always. ${rPick(emoji)}`,
      `Helping people through ${ints[0] || "my work"}. ${role}. Opinions my own.`,
      `${rPick(emoji)} ${role} | ${ints.join(" | ")}`,
    ]).slice(0, 5));
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <Grid2>
        <div><Label>Role / profession</Label><Input value={role} onChange={setRole} /></div>
        <div><Label>Interests (comma separated)</Label><Input value={interests} onChange={setInterests} /></div>
      </Grid2>
      <Btn onClick={gen}>⚡ Generate Bios</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function LinkedinSummaryGen() {
  const [role, setRole] = useState("Product Manager");
  const [skills, setSkills] = useState("strategy, user research, roadmapping");
  const [years, setYears] = useState("6");
  const [text, setText] = useState("");
  const gen = () => {
    const sk = skills.split(",").map(s => s.trim()).filter(Boolean);
    setText(
`${role} with ${years}+ years of experience delivering results across fast-paced teams. I specialize in ${sk.slice(0,3).join(", ")}, and I'm passionate about turning complex problems into simple, impactful solutions.

Throughout my career I have focused on ${sk[0] || "driving outcomes"} and collaborating with cross-functional partners to ship work that matters. I believe great results come from a mix of curiosity, clear communication, and continuous learning.

Core strengths: ${sk.join(" • ")}.

I'm always open to connecting with like-minded professionals. Feel free to reach out.`);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <Grid3>
        <div><Label>Role</Label><Input value={role} onChange={setRole} /></div>
        <div><Label>Years exp.</Label><Input value={years} onChange={setYears} /></div>
        <div><Label>Skills (comma)</Label><Input value={skills} onChange={setSkills} /></div>
      </Grid3>
      <Btn onClick={gen}>⚡ Generate Summary</Btn>
      <BlockOutput text={text} />
    </VStack>
  );
}

function ProductDescriptionGen() {
  const [name, setName] = useState("EcoBottle Pro");
  const [features, setFeatures] = useState("keeps drinks cold 24h, BPA-free, leak-proof lid");
  const [items, setItems] = useState([]);
  const gen = () => {
    const f = features.split(",").map(s => s.trim()).filter(Boolean);
    const list = f.map(x => `• ${cap(x)}`).join("\n");
    setItems([
      `Meet the ${name} — designed to make your everyday better. ${f[0] ? cap(f[0]) + "." : ""} Thoughtfully crafted with quality you can feel.\n\n${list}`,
      `Upgrade your routine with the ${name}. Built for people who want more from the essentials, it combines ${f.slice(0,2).join(" and ")} in one sleek package.\n\nKey features:\n${list}`,
      `The ${name} isn't just another product — it's an upgrade. ${f[0] ? "Enjoy " + f[0] + "" : "Enjoy premium quality"}, plus everything you need and nothing you don't.\n\n${list}`,
    ]);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <div><Label>Product name</Label><Input value={name} onChange={setName} /></div>
      <div><Label>Features (comma separated)</Label><Textarea value={features} onChange={setFeatures} rows={2} /></div>
      <Btn onClick={gen}>⚡ Generate Descriptions</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function HeadlineGen() {
  const { topic, setTopic, items, gen } = useTopicTool("email marketing", t => shuffle([
    `The ${cap(t)} Strategy That Doubled Our Results`,
    `${cap(t)} Made Simple: A No-Nonsense Guide`,
    `${rInt(5,10)} ${cap(t)} Secrets the Experts Won't Share`,
    `How to Win at ${cap(t)} Without Wasting Time`,
    `${cap(t)}: The Complete ${YEAR} Playbook`,
    `Everything You're Getting Wrong About ${cap(t)}`,
    `Turn ${cap(t)} Into Your Biggest Advantage`,
    `The Fastest Way to Improve Your ${cap(t)}`,
  ]).slice(0, 7));
  return (
    <VStack>
      <div><Label>Topic</Label><Input value={topic} onChange={setTopic} placeholder="e.g. content marketing" /></div>
      <Btn onClick={gen}>⚡ Generate Headlines</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function SloganGen() {
  const { topic, setTopic, items, gen } = useTopicTool("coffee shop", t => shuffle([
    `${cap(t)}. Done right.`,
    `Your ${cap(t)}, elevated.`,
    `Where ${cap(t)} meets passion.`,
    `Think ${cap(t)}. Think better.`,
    `${cap(t)} for the way you live.`,
    `Simply ${cap(t)}.`,
    `Powered by ${cap(t)}.`,
    `The future of ${cap(t)} is here.`,
  ]).slice(0, 7));
  return (
    <VStack>
      <div><Label>Brand / product</Label><Input value={topic} onChange={setTopic} placeholder="e.g. sneakers" /></div>
      <Btn onClick={gen}>⚡ Generate Slogans</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function CtaGen() {
  const { topic, setTopic, items, gen } = useTopicTool("newsletter", t => shuffle([
    `Get Started Free`,
    `Join Our ${cap(t)} Today`,
    `Claim Your Spot`,
    `Yes, I Want In!`,
    `Sign Up in Seconds`,
    `Unlock ${cap(t)} Now`,
    `Start My Free Trial`,
    `Grab It Before It's Gone`,
    `Subscribe & Save`,
    `Try ${cap(t)} Risk-Free`,
  ]).slice(0, 8));
  return (
    <VStack>
      <div><Label>Goal / offer</Label><Input value={topic} onChange={setTopic} placeholder="e.g. free trial" /></div>
      <Btn onClick={gen}>⚡ Generate CTAs</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function SubjectLineGen() {
  const { topic, setTopic, items, gen } = useTopicTool("summer sale", t => shuffle([
    `Don't miss this: ${cap(t)} 👀`,
    `${cap(t)} — you're going to want to see this`,
    `Quick question about ${t}...`,
    `Last chance for ${t}`,
    `Your ${t} is waiting`,
    `${rInt(3,5)} things you need to know about ${t}`,
    `We saved you a spot 🎟️ (${t})`,
    `Open before it's too late: ${cap(t)}`,
  ]).slice(0, 7));
  return (
    <VStack>
      <div><Label>Topic / offer</Label><Input value={topic} onChange={setTopic} placeholder="e.g. product launch" /></div>
      <Btn onClick={gen}>⚡ Generate Subject Lines</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function BusinessNameGen() {
  const { topic, setTopic, items, gen } = useTopicTool("cloud", t => {
    const base = cap(t.split(" ")[0] || t);
    const prefixes = ["Nova", "Peak", "Bright", "Ever", "Prime", "Zen", "Blue", "North"];
    const suffixes = ["ly", "ify", "Labs", "Hub", "Works", "Loop", "Base", "Sphere", "Wave", "Forge"];
    const out = new Set();
    while (out.size < 10) {
      const style = rInt(0, 2);
      if (style === 0) out.add(`${rPick(prefixes)}${base}`);
      else if (style === 1) out.add(`${base}${rPick(suffixes)}`);
      else out.add(`${rPick(prefixes)} ${base}`);
    }
    return [...out];
  });
  return (
    <VStack>
      <div><Label>Keyword / industry</Label><Input value={topic} onChange={setTopic} placeholder="e.g. coffee" /></div>
      <Btn onClick={gen}>⚡ Generate Names</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function UsernameGen() {
  const { topic, setTopic, items, gen } = useTopicTool("alex", t => {
    const base = t.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    const adj = ["real", "the", "its", "official", "just", "iam"];
    const suf = ["x", "hq", "dev", "pro", "yt", "_", "1", "cool"];
    const out = new Set();
    while (out.size < 10) {
      const style = rInt(0, 3);
      if (style === 0) out.add(`${base}_${rPick(suf)}`);
      else if (style === 1) out.add(`${rPick(adj)}${base}`);
      else if (style === 2) out.add(`${base}${rInt(10, 9999)}`);
      else out.add(`${base}.${rPick(suf)}`);
    }
    return [...out];
  });
  return (
    <VStack>
      <div><Label>Name / keyword</Label><Input value={topic} onChange={setTopic} placeholder="e.g. jordan" /></div>
      <Btn onClick={gen}>⚡ Generate Usernames</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

function ElevatorPitchGen() {
  const [role, setRole] = useState("UX Designer");
  const [value, setValue] = useState("help startups turn ideas into products users love");
  const [items, setItems] = useState([]);
  const gen = () => {
    const r = role.trim() || "professional";
    const v = value.trim() || "deliver great results";
    setItems([
      `Hi, I'm a ${r}. I ${v}. Over the years I've learned that the best outcomes come from truly understanding people's needs — and that's exactly what I bring to every project. I'd love to explore how I can help you.`,
      `I'm a ${r} who helps ${v}. Think of me as the person who bridges the gap between an idea and something real people actually use. If that sounds useful, let's talk.`,
      `As a ${r}, my job is simple: I ${v}. I combine strategy with hands-on execution so nothing gets lost between the plan and the result. Happy to share how that could work for you.`,
    ]);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <div><Label>Your role</Label><Input value={role} onChange={setRole} /></div>
      <div><Label>What you do / value you provide</Label><Textarea value={value} onChange={setValue} rows={2} /></div>
      <Btn onClick={gen}>⚡ Generate Pitch</Btn>
      <ContentList items={items} />
    </VStack>
  );
}

// ---------- Shared helpers for added tools (W2) ----------
const hashStr = s => { let h = 5381; const str = String(s); for (let i = 0; i < str.length; i++) { h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; } return h >>> 0; };
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const COLOR_INPUT = { width:"100%", height:40, background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" };

// ---------- Added legal document generators ----------
function AffiliateDisclosureGen() {
  return <LegalDocTool filename="affiliate-disclosure.txt"
    fields={[
      { key:"company", label:"Site / brand name" },
      { key:"website", label:"Website URL" },
      { key:"email", label:"Contact email" },
    ]}
    build={v => buildDocument("AFFILIATE DISCLOSURE", [
      { h:"1. Disclosure", p:`${v.company} (${v.website}) participates in affiliate marketing programs. This means we may earn commissions on qualifying purchases made through links on our site, at no additional cost to you.` },
      { h:"2. How It Works", p:`When you click an affiliate link and make a purchase, we may receive a small commission from the retailer. These commissions help support the operation of our website and allow us to continue producing free content.` },
      { h:"3. Our Promise", p:`We only recommend products and services we genuinely believe provide value to our readers. Our opinions are our own and are never influenced by commission potential.` },
      { h:"4. Amazon Associates", p:`As an Amazon Associate, ${v.company} earns from qualifying purchases. Amazon and the Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.` },
      { h:"5. Your Trust", p:`Your trust matters to us. If you have any questions about our affiliate relationships, please contact us at ${v.email}.` },
    ])} />;
}

function ShippingPolicyGen() {
  return <LegalDocTool filename="shipping-policy.txt"
    fields={[
      { key:"company", label:"Store name" },
      { key:"email", label:"Support email" },
      { key:"days", label:"Processing time (days)", default:"1-2" },
      { key:"delivery", label:"Delivery estimate", default:"5-7 business days" },
    ]}
    build={v => buildDocument("SHIPPING POLICY", [
      { h:"1. Order Processing", p:`Orders placed with ${v.company} are processed within ${v.days} business days. Orders are not shipped or delivered on weekends or public holidays.` },
      { h:"2. Shipping Rates & Delivery", p:`Estimated delivery time is ${v.delivery} after dispatch, depending on your location and chosen shipping method. Shipping charges are calculated and displayed at checkout.` },
      { h:"3. Shipment Confirmation", p:`You will receive a shipment confirmation email with tracking information once your order has been dispatched. Please allow up to 48 hours for tracking details to update.` },
      { h:"4. Customs, Duties & Taxes", p:`${v.company} is not responsible for any customs fees, duties, or import taxes applied to international orders. These charges are the responsibility of the customer.` },
      { h:"5. Damaged or Lost Items", p:`If your order arrives damaged or is lost in transit, contact us at ${v.email} with your order number and photos of any damage so we can help resolve the issue promptly.` },
      { h:"6. Contact", p:`For any shipping-related questions, reach our support team at ${v.email}.` },
    ])} />;
}

function AcceptableUsePolicyGen() {
  return <LegalDocTool filename="acceptable-use-policy.txt"
    fields={[
      { key:"company", label:"Company / Service name" },
      { key:"website", label:"Website / Service URL" },
      { key:"email", label:"Contact email" },
    ]}
    build={v => buildDocument("ACCEPTABLE USE POLICY", [
      { h:"1. Purpose", p:`This Acceptable Use Policy governs your use of the services provided by ${v.company} at ${v.website}. By accessing or using our services, you agree to comply with this policy.` },
      { h:"2. Prohibited Activities", p:`You may not use our services to engage in illegal activity, distribute malware, send spam or bulk unsolicited messages, harass others, infringe intellectual property, or attempt unauthorized access to systems or data.` },
      { h:"3. Content Standards", p:`You are responsible for all content you submit. Content must not be defamatory, obscene, hateful, or otherwise objectionable, and must not violate the rights of any third party.` },
      { h:"4. Security", p:`You must not attempt to probe, scan, or test the vulnerability of our systems, breach security or authentication measures, or interfere with service to any user, host, or network.` },
      { h:"5. Enforcement", p:`${v.company} reserves the right to investigate suspected violations and may suspend or terminate access for any user who breaches this policy, with or without prior notice.` },
      { h:"6. Reporting & Contact", p:`To report a violation of this policy, contact us at ${v.email}.` },
    ])} />;
}

function WarrantyPolicyGen() {
  return <LegalDocTool filename="warranty-policy.txt"
    fields={[
      { key:"company", label:"Company / Brand name" },
      { key:"email", label:"Support email" },
      { key:"period", label:"Warranty period", default:"12 months" },
    ]}
    build={v => buildDocument("WARRANTY POLICY", [
      { h:"1. Limited Warranty", p:`${v.company} warrants that its products will be free from defects in materials and workmanship under normal use for a period of ${v.period} from the original date of purchase.` },
      { h:"2. What Is Covered", p:`This warranty covers genuine manufacturing defects. If a product fails due to such a defect during the warranty period, ${v.company} will repair or replace it, or issue a refund, at our discretion.` },
      { h:"3. What Is Not Covered", p:`This warranty does not cover damage caused by misuse, accidents, unauthorized modification or repair, normal wear and tear, or failure to follow care and usage instructions.` },
      { h:"4. How to Make a Claim", p:`To make a warranty claim, contact ${v.email} with your proof of purchase and a description of the defect. We may request photos or the return of the item for inspection.` },
      { h:"5. Limitations", p:`To the extent permitted by law, ${v.company}'s liability under this warranty is limited to the repair, replacement, or refund of the product. We are not liable for any incidental or consequential damages.` },
      { h:"6. Contact", p:`For warranty questions, contact ${v.company} at ${v.email}.` },
    ])} />;
}

// ---------- Added SVG generators ----------
function SvgSpinnerGen() {
  const [color, setColor] = useState("#0EA5E9");
  const [size, setSize] = useState(48);
  const [speed, setSpeed] = useState(1);
  const track = "rgba(255,255,255,0.12)";
  const svg = `<svg viewBox="0 0 50 50" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="display:block">\n  <circle cx="25" cy="25" r="20" fill="none" stroke="${track}" stroke-width="5"/>\n  <path d="M25 5 A20 20 0 0 1 45 25" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round">\n    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="${speed}s" repeatCount="indefinite"/>\n  </path>\n</svg>`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={COLOR_INPUT} /></div>
        <div><Label>Size: {size}px</Label><input type="range" min={24} max={120} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      </Grid2>
      <div><Label>Speed: {speed}s per rotation</Label><input type="range" min={0.4} max={3} step={0.1} value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      <SvgOutput svg={svg} filename="spinner.svg" />
    </VStack>
  );
}

function SvgDividerGen() {
  const [style, setStyle] = useState("curve");
  const [color, setColor] = useState("#0EA5E9");
  const [h, setH] = useState(120);
  const [flip, setFlip] = useState(false);
  const W = 1440;
  let d;
  if (style === "tilt") d = `M0 ${h} L${W} 0 L${W} ${h} Z`;
  else if (style === "triangle") d = `M0 ${h} L${W / 2} 0 L${W} ${h} Z`;
  else if (style === "curve-asym") d = `M0 ${h} C ${W * 0.3} 0 ${W * 0.7} ${h} ${W} ${h * 0.35} L${W} ${h} Z`;
  else d = `M0 ${h} C ${W * 0.35} 0 ${W * 0.65} 0 ${W} ${h} L${W} ${h} Z`;
  const flipT = flip ? ` transform="translate(${W},0) scale(-1,1)"` : "";
  const svg = `<svg viewBox="0 0 ${W} ${h}" width="100%" height="${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto">\n  <path d="${d}" fill="${color}"${flipT}/>\n</svg>`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Style</Label><SelectInput value={style} onChange={setStyle} options={[{value:"curve",label:"Curve"},{value:"curve-asym",label:"Asymmetric Curve"},{value:"tilt",label:"Tilt"},{value:"triangle",label:"Triangle"}]} style={{ width:"100%" }} /></div>
        <div><Label>Color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={COLOR_INPUT} /></div>
      </Grid2>
      <div><Label>Height: {h}px</Label><input type="range" min={40} max={300} value={h} onChange={e => setH(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      <Btn variant="secondary" size="sm" onClick={() => setFlip(f => !f)}>↔ Flip Horizontal ({flip ? "on" : "off"})</Btn>
      <SvgOutput svg={svg} filename="divider.svg" />
    </VStack>
  );
}

function SvgCheckmarkGen() {
  const [variant, setVariant] = useState("success");
  const [color, setColor] = useState("#10B981");
  const [size, setSize] = useState(96);
  const mark = variant === "error"
    ? `<path d="M18 18 L38 38 M38 18 L18 38" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0"><animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze"/></path>`
    : `<path d="M16 29 L25 38 L41 20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="60" stroke-dashoffset="60"><animate attributeName="stroke-dashoffset" from="60" to="0" dur="0.5s" fill="freeze"/></path>`;
  const bg = variant === "error" ? "#EF4444" : color;
  const svg = `<svg viewBox="0 0 56 56" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="display:block">\n  <circle cx="28" cy="28" r="26" fill="${bg}"/>\n  ${mark}\n</svg>`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Type</Label><SelectInput value={variant} onChange={setVariant} options={[{value:"success",label:"Success ✓"},{value:"error",label:"Error ✕"}]} style={{ width:"100%" }} /></div>
        <div><Label>Size: {size}px</Label><input type="range" min={48} max={200} value={size} onChange={e => setSize(Number(e.target.value))} style={{ width:"100%", accentColor:C.blue }} /></div>
      </Grid2>
      {variant === "success" && <div><Label>Circle color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={COLOR_INPUT} /></div>}
      <SvgOutput svg={svg} filename="checkmark.svg" />
    </VStack>
  );
}

function SvgBadgeGen() {
  const [label, setLabel] = useState("build");
  const [message, setMessage] = useState("passing");
  const [color, setColor] = useState("#10B981");
  const textWidth = s => { let w = 0; for (const ch of String(s)) { if ("iljI.,:;'!|".includes(ch)) w += 3; else if ("mwMW".includes(ch)) w += 9; else if (ch >= "A" && ch <= "Z") w += 7.5; else if (ch === " ") w += 4; else w += 6.5; } return w; };
  const lw = Math.round(textWidth(label)) + 20;
  const mw = Math.round(textWidth(message)) + 20;
  const H = 20, total = lw + mw;
  const lx = (lw / 2).toFixed(1), mx = (lw + mw / 2).toFixed(1);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${H}" viewBox="0 0 ${total} ${H}" role="img" aria-label="${escapeHtml(label)}: ${escapeHtml(message)}" style="display:block">\n  <rect rx="3" width="${total}" height="${H}" fill="#555"/>\n  <rect rx="3" x="${lw}" width="${mw}" height="${H}" fill="${color}"/>\n  <rect x="${lw}" width="4" height="${H}" fill="${color}"/>\n  <g fill="#fff" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">\n    <text x="${lx}" y="14">${escapeHtml(label)}</text>\n    <text x="${mx}" y="14">${escapeHtml(message)}</text>\n  </g>\n</svg>`;
  return (
    <VStack>
      <Grid2>
        <div><Label>Label (left)</Label><Input value={label} onChange={setLabel} placeholder="build" /></div>
        <div><Label>Message (right)</Label><Input value={message} onChange={setMessage} placeholder="passing" /></div>
      </Grid2>
      <div><Label>Message color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={COLOR_INPUT} /></div>
      <SvgOutput svg={svg} filename="badge.svg" />
    </VStack>
  );
}

function SvgAvatarGen() {
  const [seed, setSeed] = useState("jordan@example.com");
  const h = hashStr(seed || "user");
  const hue = h % 360;
  const fill = `hsl(${hue}, 60%, 52%)`;
  const on = [];
  for (let i = 0; i < 15; i++) on.push((hashStr(seed + "#" + i) & 1) === 1);
  const cell = 70, pad = 5;
  let rects = "";
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { const cc = c < 3 ? c : 4 - c; if (on[cc * 5 + r]) rects += `<rect x="${pad + c * cell}" y="${pad + r * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`; }
  const S = pad * 2 + cell * 5;
  const svg = `<svg viewBox="0 0 ${S} ${S}" width="200" height="200" xmlns="http://www.w3.org/2000/svg" style="display:block">\n  <rect width="${S}" height="${S}" rx="24" fill="#EEF2F6"/>\n  ${rects}\n</svg>`;
  return (
    <VStack>
      <div><Label>Name / email / seed</Label><Input value={seed} onChange={setSeed} placeholder="any text produces a unique avatar" /></div>
      <div style={{ fontSize:12, color:C.muted }}>Same input always produces the same symmetric identicon.</div>
      <SvgOutput svg={svg} filename="avatar.svg" />
    </VStack>
  );
}

// ---------- Added content generators ----------
function AboutUsGen() {
  const [name, setName] = useState("Acme Studio");
  const [year, setYear] = useState("2019");
  const [does, setDoes] = useState("design tools for small businesses");
  const [values, setValues] = useState("quality, honesty, customer focus");
  const [text, setText] = useState("");
  const gen = () => {
    const vals = values.split(",").map(s => s.trim()).filter(Boolean);
    setText(
`About ${name}

Founded in ${year}, ${name} was built on a simple idea: to ${does}. What started as a small project has grown into something we're genuinely proud of, shaped every day by the people we serve.

We ${does}, and we do it with care. Our team believes the best work comes from truly understanding the people we help — listening first, then building solutions that make a real difference.

At the heart of everything we do are our core values: ${vals.join(", ") || "integrity and excellence"}. These aren't just words on a wall; they guide every decision we make and every product we ship.

Thank you for being part of our story. We're only just getting started.`);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <Grid2>
        <div><Label>Company / brand name</Label><Input value={name} onChange={setName} /></div>
        <div><Label>Year founded</Label><Input value={year} onChange={setYear} /></div>
      </Grid2>
      <div><Label>What you do</Label><Input value={does} onChange={setDoes} placeholder="e.g. build eco-friendly packaging" /></div>
      <div><Label>Core values (comma separated)</Label><Input value={values} onChange={setValues} /></div>
      <Btn onClick={gen}>⚡ Generate About Us</Btn>
      <BlockOutput text={text} />
    </VStack>
  );
}

function FaqSchemaGen() {
  const [input, setInput] = useState("What is ToolsRift? | A free online tools platform.\nIs it free? | Yes, every tool is completely free to use.\nDo I need an account? | No signup or account is required.");
  const out = useMemo(() => {
    const lines = input.split("\n").map(l => l.trim()).filter(Boolean);
    const pairs = [];
    if (lines.some(l => l.includes("|"))) {
      for (const l of lines) { const idx = l.indexOf("|"); if (idx > 0) { const q = l.slice(0, idx).trim(); const a = l.slice(idx + 1).trim(); if (q && a) pairs.push([q, a]); } }
    } else {
      for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([lines[i], lines[i + 1]]);
    }
    const obj = { "@context":"https://schema.org", "@type":"FAQPage", mainEntity: pairs.map(([q, a]) => ({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a } })) };
    return { count: pairs.length, code: `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>` };
  }, [input]);
  return (
    <VStack>
      <div><Label>FAQ items — one per line: Question | Answer</Label><Textarea value={input} onChange={setInput} rows={6} placeholder="How much does it cost? | It is free." /></div>
      <div style={{ fontSize:12, color:C.muted }}>{out.count} question{out.count === 1 ? "" : "s"} detected · valid JSON-LD FAQPage schema for Google rich results</div>
      <BlockOutput text={out.code} />
    </VStack>
  );
}

function EmailSignatureGen() {
  const [name, setName] = useState("Jane Doe");
  const [title, setTitle] = useState("Marketing Lead");
  const [company, setCompany] = useState("Acme Inc.");
  const [phone, setPhone] = useState("+1 555 123 4567");
  const [email, setEmail] = useState("jane@acme.com");
  const [website, setWebsite] = useState("https://acme.com");
  const [color, setColor] = useState("#0EA5E9");
  const html = useMemo(() => {
    const e = escapeHtml;
    const site = website.replace(/^https?:\/\//, "");
    const roleLine = [title, company].filter(Boolean).map(e).join(" · ");
    return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#333;line-height:1.5">
  <tr>
    <td style="border-left:3px solid ${e(color)};padding-left:12px">
      <div style="font-size:16px;font-weight:bold;color:#111">${e(name)}</div>
      <div style="color:${e(color)};font-weight:bold">${roleLine}</div>
      <div style="margin-top:6px;color:#555">
        ${phone ? `${e(phone)}<br>` : ""}${email ? `<a href="mailto:${e(email)}" style="color:#555;text-decoration:none">${e(email)}</a><br>` : ""}${website ? `<a href="${e(website)}" style="color:${e(color)};text-decoration:none">${e(site)}</a>` : ""}
      </div>
    </td>
  </tr>
</table>`;
  }, [name, title, company, phone, email, website, color]);
  return (
    <VStack>
      <Grid2>
        <div><Label>Full name</Label><Input value={name} onChange={setName} /></div>
        <div><Label>Job title</Label><Input value={title} onChange={setTitle} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Company</Label><Input value={company} onChange={setCompany} /></div>
        <div><Label>Phone</Label><Input value={phone} onChange={setPhone} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Email</Label><Input value={email} onChange={setEmail} /></div>
        <div><Label>Website</Label><Input value={website} onChange={setWebsite} /></div>
      </Grid2>
      <div><Label>Accent color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={COLOR_INPUT} /></div>
      <Label>Preview</Label>
      <div style={{ background:"#fff", borderRadius:8, padding:16, border:`1px solid ${C.border}` }} dangerouslySetInnerHTML={{ __html: html }} />
      <BlockOutput text={html} />
    </VStack>
  );
}

function MissionVisionGen() {
  const [company, setCompany] = useState("Acme");
  const [industry, setIndustry] = useState("education");
  const [audience, setAudience] = useState("students");
  const [goal, setGoal] = useState("make learning accessible to everyone");
  const [text, setText] = useState("");
  const gen = () => {
    const g = goal.trim() || "deliver exceptional value";
    setText(
`MISSION
At ${company}, our mission is to ${g}. We exist to serve ${audience} by delivering meaningful value in the ${industry} space, every single day.

VISION
We envision a future where ${audience} everywhere can benefit as we ${g.replace(/^to\s+/i, "")}. ${company} strives to be the most trusted name in ${industry}, setting the standard for what's possible.

VALUES
• Integrity — we do the right thing, always.
• Excellence — we hold ourselves to the highest standard.
• Empathy — we put ${audience} at the center of every decision.
• Innovation — we constantly seek better ways to serve.`);
  };
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <VStack>
      <Grid2>
        <div><Label>Company name</Label><Input value={company} onChange={setCompany} /></div>
        <div><Label>Industry</Label><Input value={industry} onChange={setIndustry} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Target audience</Label><Input value={audience} onChange={setAudience} /></div>
        <div><Label>Primary goal</Label><Input value={goal} onChange={setGoal} /></div>
      </Grid2>
      <Btn onClick={gen}>⚡ Generate Mission & Vision</Btn>
      <BlockOutput text={text} />
    </VStack>
  );
}

function CookieConsentBannerGen() {
  const [msg, setMsg] = useState("We use cookies to improve your experience.");
  const [btn, setBtn] = useState("Got it");
  const [url, setUrl] = useState("/privacy-policy");
  const [color, setColor] = useState("#0EA5E9");
  const html = useMemo(() => {
    const e = escapeHtml;
    return `<!-- Cookie consent banner (paste before </body>) -->
<div id="cookie-consent" style="position:fixed;left:0;right:0;bottom:0;background:#0D1117;color:#E2E8F0;padding:14px 18px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:14px;font-family:sans-serif;font-size:14px;box-shadow:0 -2px 12px rgba(0,0,0,.3);z-index:9999">
  <span>${e(msg)} <a href="${e(url)}" style="color:${e(color)}">Learn more</a></span>
  <button onclick="document.getElementById('cookie-consent').remove();try{localStorage.setItem('cookieConsent','1')}catch(e){}" style="background:${e(color)};color:#fff;border:none;border-radius:6px;padding:8px 18px;font-size:14px;cursor:pointer">${e(btn)}</button>
</div>
<script>try{if(localStorage.getItem('cookieConsent')){var _b=document.getElementById('cookie-consent');if(_b)_b.remove();}}catch(e){}</script>`;
  }, [msg, btn, url, color]);
  return (
    <VStack>
      <div><Label>Banner message</Label><Textarea value={msg} onChange={setMsg} rows={2} /></div>
      <Grid2>
        <div><Label>Button text</Label><Input value={btn} onChange={setBtn} /></div>
        <div><Label>Policy URL</Label><Input value={url} onChange={setUrl} /></div>
      </Grid2>
      <div><Label>Accent color</Label><input type="color" value={color} onChange={e => setColor(e.target.value)} style={COLOR_INPUT} /></div>
      <div style={{ fontSize:12, color:C.muted }}>Remembers consent via localStorage — the banner won't reappear after the button is clicked.</div>
      <BlockOutput text={html} />
    </VStack>
  );
}

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
{ id:"affiliate-disclosure-gen", cat:"legal", name:"Affiliate Disclosure Generator", desc:"Generate an FTC-style affiliate disclosure statement online with commission, Amazon Associates, and reader-trust clauses.", icon:"🔗", free:true },
{ id:"shipping-policy-gen", cat:"legal", name:"Shipping Policy Generator", desc:"Create an e-commerce shipping policy online with processing time, delivery estimates, customs, and lost-parcel handling.", icon:"📦", free:true },
{ id:"acceptable-use-policy-gen", cat:"legal", name:"Acceptable Use Policy Generator", desc:"Generate an acceptable use policy online covering prohibited activities, content standards, security, and enforcement.", icon:"🚧", free:true },
{ id:"warranty-policy-gen", cat:"legal", name:"Warranty Policy Generator", desc:"Create a product warranty policy online with coverage period, exclusions, claim steps, and liability limitations.", icon:"🛠️", free:true },

{ id:"svg-wave-gen", cat:"svg", name:"SVG Wave Generator", desc:"Generate smooth layered SVG wave backgrounds online with controls for height, amplitude, frequency, and color.", icon:"🌊", free:true },
{ id:"svg-blob-gen", cat:"svg", name:"SVG Blob Generator", desc:"Create organic SVG blob shapes online with randomize controls and color selection for hero and section backgrounds.", icon:"🫧", free:true },
{ id:"svg-pattern-gen", cat:"svg", name:"SVG Pattern Generator", desc:"Generate repeating SVG patterns online including dots, stripes, grid, zigzag, and hexagon styles.", icon:"🔳", free:true },
{ id:"gradient-gen", cat:"svg", name:"Gradient Generator", desc:"Generate CSS linear and radial gradients online with multi-stop colors and one-click CSS code copy.", icon:"🎛️", free:true },
{ id:"mesh-gradient-gen", cat:"svg", name:"Mesh Gradient Generator", desc:"Create mesh gradient backgrounds online as SVG/CSS with blended color fields for modern UI visuals.", icon:"🕸️", free:true },
{ id:"noise-texture-gen", cat:"svg", name:"Noise Texture Generator", desc:"Generate SVG noise texture backgrounds online using turbulence filters for depth and subtle design grain.", icon:"📺", free:true },
{ id:"geometric-pattern-gen", cat:"svg", name:"Geometric Pattern Generator", desc:"Create geometric SVG art patterns online with triangles, circles, and lines for abstract visual systems.", icon:"📐", free:true },
{ id:"abstract-bg-gen", cat:"svg", name:"Abstract Background Generator", desc:"Generate abstract SVG background artwork online with layered shapes and color harmonies for web sections.", icon:"🖼️", free:true },
{ id:"svg-spinner-gen", cat:"svg", name:"SVG Spinner Generator", desc:"Generate an animated SVG loading spinner online with adjustable color, size, and rotation speed for any website.", icon:"⏳", free:true },
{ id:"svg-divider-gen", cat:"svg", name:"SVG Section Divider Generator", desc:"Create SVG section divider shapes online including curve, tilt, and triangle styles with flip and color controls.", icon:"〰️", free:true },
{ id:"svg-checkmark-gen", cat:"svg", name:"SVG Checkmark Generator", desc:"Generate an animated SVG success checkmark or error cross online with a colored circle badge and draw animation.", icon:"✅", free:true },
{ id:"svg-badge-gen", cat:"svg", name:"SVG Badge Generator", desc:"Create shields-style status badges as SVG online with custom label, message, and color for READMEs and docs.", icon:"🏅", free:true },
{ id:"svg-avatar-gen", cat:"svg", name:"SVG Identicon Avatar Generator", desc:"Generate a deterministic symmetric identicon avatar as SVG online from any name, email, or seed string.", icon:"🧩", free:true },

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
{ id:"about-us-gen", cat:"content", name:"About Us Page Generator", desc:"Generate an About Us page draft online from company name, founding year, offering, and values.", icon:"🏛️", free:true },
{ id:"faq-schema-gen", cat:"content", name:"FAQ Schema Generator", desc:"Generate valid FAQPage JSON-LD structured data online from your questions and answers for Google rich results.", icon:"❓", free:true },
{ id:"email-signature-gen", cat:"content", name:"Email Signature Generator", desc:"Create an HTML email signature online from name, title, contact details, and accent color with live preview.", icon:"✉️", free:true },
{ id:"mission-vision-gen", cat:"content", name:"Mission & Vision Statement Generator", desc:"Generate mission, vision, and values statements online from company, industry, audience, and goal.", icon:"🎯", free:true },
{ id:"cookie-consent-banner-gen", cat:"content", name:"Cookie Consent Banner Generator", desc:"Generate a copy-paste cookie consent banner online with HTML, styling, and localStorage remember-choice logic.", icon:"🍪", free:true },
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
"affiliate-disclosure-gen": AffiliateDisclosureGen,
"shipping-policy-gen": ShippingPolicyGen,
"acceptable-use-policy-gen": AcceptableUsePolicyGen,
"warranty-policy-gen": WarrantyPolicyGen,
"svg-wave-gen": SvgWaveGen,
"svg-blob-gen": SvgBlobGen,
"svg-pattern-gen": SvgPatternGen,
"gradient-gen": GradientGen,
"mesh-gradient-gen": MeshGradientGen,
"noise-texture-gen": NoiseTextureGen,
"geometric-pattern-gen": GeometricPatternGen,
"abstract-bg-gen": AbstractBgGen,
"svg-spinner-gen": SvgSpinnerGen,
"svg-divider-gen": SvgDividerGen,
"svg-checkmark-gen": SvgCheckmarkGen,
"svg-badge-gen": SvgBadgeGen,
"svg-avatar-gen": SvgAvatarGen,
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
"about-us-gen": AboutUsGen,
"faq-schema-gen": FaqSchemaGen,
"email-signature-gen": EmailSignatureGen,
"mission-vision-gen": MissionVisionGen,
"cookie-consent-banner-gen": CookieConsentBannerGen,
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
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
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
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
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
