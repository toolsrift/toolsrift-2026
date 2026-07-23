import { useState, useEffect, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout from './shared/ToolPageLayout';

const THEME = getCategoryById("office");
const PAGE_THEME = getCategoryById("office");
const BRAND = { name: "ToolsRift", tagline: "Office & Productivity" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  accent: "#0891B2", accentD: "#0E7490",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(8,145,178,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} @keyframes trShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-6px,4px) rotate(-4deg)}40%{transform:translate(6px,-4px) rotate(4deg)}60%{transform:translate(-5px,-3px) rotate(-3deg)}80%{transform:translate(5px,3px) rotate(3deg)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ children, color = "rose" }) {
  const map = { rose:"rgba(8,145,178,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
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
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(8,145,178,0.25)` },
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(8,145,178,0.08)", border:`1px solid rgba(8,145,178,0.2)`, borderRadius:10 }}>
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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/office` }] : []),
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
  // ── contact ────────────────────────────────────────────────────────────────
  { id:"vcard-generator", cat:"contact", name:"vCard QR Generator", desc:"Build a downloadable .vcf contact card and a matching QR code that saves your name, phone, email and address straight to any phone.", icon:"📇", free:true },
  { id:"wifi-qr-generator", cat:"contact", name:"WiFi QR Code Generator", desc:"Turn your network name and password into a WiFi QR code guests scan to join instantly — no typing the password out loud.", icon:"📶", free:true },
  { id:"qr-code-studio", cat:"contact", name:"QR Code Studio", desc:"Make static QR codes for a link, plain text, phone number, SMS or email with size, colour and error-correction control, as PNG or SVG.", icon:"🔳", free:true },
  { id:"email-link-generator", cat:"contact", name:"Mailto Link Generator", desc:"Build a correctly encoded mailto: link with subject, body, CC and BCC already filled in, ready to paste into a page or signature.", icon:"✉️", free:true },
  { id:"sms-link-generator", cat:"contact", name:"SMS Link Generator", desc:"Create sms: click-to-text links with the number and message body pre-filled so visitors can text you in a single tap.", icon:"💬", free:true },
  { id:"whatsapp-link-generator", cat:"contact", name:"WhatsApp Link Generator", desc:"Generate a wa.me click-to-chat link with a pre-written message so customers can start a WhatsApp chat with one tap.", icon:"🟢", free:true },
  { id:"phone-link-generator", cat:"contact", name:"Click-to-Call Link Generator", desc:"Build a tel: click-to-call link plus a scannable QR code so people can dial your number from a page, poster or card.", icon:"📞", free:true },
  { id:"contact-list-formatter", cat:"contact", name:"Contact List Formatter", desc:"Paste messy contact rows from a spreadsheet or email and get a clean, aligned contact list plus a multi-card .vcf export.", icon:"🗒️", free:true },
  // ── planning ───────────────────────────────────────────────────────────────
  { id:"ical-event-generator", cat:"planning", name:"iCal Event Generator (.ics)", desc:"Create a standards-compliant .ics calendar invite with location, timezone, description and reminder that imports into any calendar.", icon:"📆", free:true },
  { id:"quick-notepad", cat:"planning", name:"Quick Notepad", desc:"A distraction-free notepad that autosaves to this browser as you type, counts words and characters and exports to a .txt file.", icon:"📝", free:true },
  { id:"todo-list-maker", cat:"planning", name:"To-Do List Maker", desc:"Build a checkable to-do list that saves in your browser, shows live progress and prints or exports as plain text.", icon:"✅", free:true },
  { id:"kanban-board", cat:"planning", name:"Kanban Board", desc:"A three-column To Do / Doing / Done board with add, move and delete that keeps your cards in this browser between visits.", icon:"🗂️", free:true },
  { id:"checklist-maker", cat:"planning", name:"Printable Checklist Maker", desc:"Turn a pasted list into a reusable printable checklist with tick boxes, a title, optional notes column and clean print layout.", icon:"📋", free:true },
  { id:"meeting-cost-calculator", cat:"planning", name:"Meeting Cost Calculator", desc:"See what a meeting really costs — attendees times hourly rate times duration, with a live per-minute running total.", icon:"💸", free:true },
  { id:"weekly-planner-printable", cat:"planning", name:"Weekly Planner (Printable)", desc:"Generate a printable week planner grid with your own start hour, end hour and slot length, plus a notes column.", icon:"🗓️", free:true },
  { id:"monthly-calendar-printable", cat:"planning", name:"Monthly Calendar (Printable)", desc:"Print a clean month calendar for any month and year, with a week-start option and a side notes column for reminders.", icon:"📅", free:true },
  { id:"countdown-to-date", cat:"planning", name:"Countdown to Date", desc:"Count the days, hours and minutes to any target date with a live ticking display and a copyable one-line summary.", icon:"⏳", free:true },
  { id:"time-slot-generator", cat:"planning", name:"Time Slot Generator", desc:"Split a working window into equal appointment slots of N minutes with gaps and a lunch break, then copy the schedule.", icon:"⏱️", free:true },
  // ── documents ──────────────────────────────────────────────────────────────
  { id:"signature-pad", cat:"documents", name:"Signature Pad", desc:"Draw your signature with a mouse, trackpad or finger and export it as a transparent PNG with adjustable pen width and colour.", icon:"✍️", free:true },
  { id:"address-label-sheet", cat:"documents", name:"Address Label Sheet", desc:"Paste addresses and lay them out on a printable Avery-style label sheet in 2x7, 3x10 or 2x5 grids with alignment control.", icon:"🏷️", free:true },
  { id:"name-badge-maker", cat:"documents", name:"Name Badge Maker", desc:"Turn a pasted list of names and roles into printable conference name badges with your event title on every badge.", icon:"📛", free:true },
  { id:"certificate-maker", cat:"documents", name:"Certificate Maker", desc:"Design a printable landscape certificate with recipient, award reason, date, signatory and a choice of decorative borders.", icon:"🏆", free:true },
  { id:"letterhead-generator", cat:"documents", name:"Letterhead Generator", desc:"Build a printable company letterhead with your business name, address, contact details, tagline and accent colour.", icon:"📄", free:true },
  { id:"envelope-addresser", cat:"documents", name:"Envelope Addresser", desc:"Print addresses straight onto DL, C5, C6 or US #10 envelopes with correctly placed sender and recipient blocks.", icon:"✉️", free:true },
  { id:"page-border-printable", cat:"documents", name:"Printable Page Borders", desc:"Print decorative page borders for handouts, notices and worksheets — pick a style, thickness, colour and optional title.", icon:"🖼️", free:true },
];

const CATEGORIES = [
  { id:"contact", name:"Contacts & Sharing", icon:"📇", desc:"vCards, QR codes and shareable contact details." },
  { id:"planning", name:"Planning & Tasks", icon:"🗓️", desc:"Notes, to-do lists, kanban boards and calendars." },
  { id:"documents", name:"Print & Documents", icon:"🖨️", desc:"Labels, certificates, letterheads and signatures." },
];

const TOOL_META = {
  "vcard-generator": {
    title: "vCard QR Code Generator — Free .vcf Contact Card | ToolsRift",
    desc: "Free vCard generator. Enter your details once and download a valid .vcf contact card plus a static QR code that saves you into any phone's address book.",
    keywords: "vcard generator, vcf file generator, contact qr code, digital business card, vcard qr code",
    faq: [
      ["Will the .vcf file import into Outlook, Google Contacts and iPhone?", "Yes. The file is written as vCard 3.0 with CRLF line endings and properly escaped commas, semicolons and line breaks, which is the format every mainstream contacts app accepts. Download it and open it, or attach it to an email and let the recipient tap it."],
      ["Does the QR code expire or track who scans it?", "No. The QR code encodes your contact details directly inside the pattern — there is no short link, no redirect service and no analytics in the middle. It keeps working forever and nobody logs the scans, which is not true of most 'dynamic' QR services."],
      ["Can I put the QR code on a printed business card?", "Yes, that is the most common use. Download the PNG at a large size and place it at roughly 2 cm square or bigger on the card; because the code is generated at high resolution it stays sharp at print DPI and scans reliably from a phone camera."],
    ],
    howTo: "Fill in the name, phone, email, company and address fields — the .vcf preview and QR code update as you type. Then download the .vcf file for emailing or the PNG QR code for printing.",
  },
  "wifi-qr-generator": {
    title: "WiFi QR Code Generator — Free Guest Network Code | ToolsRift",
    desc: "Create a free WiFi QR code from your network name and password. Guests scan with any phone camera and join instantly, with no password typed out loud or written down.",
    keywords: "wifi qr code generator, guest wifi qr code, wpa qr code, network password qr, wifi login qr",
    faq: [
      ["Which phones can join a network by scanning?", "Both iPhone (iOS 11 and later) and Android (version 10 and later) read WiFi QR codes with the built-in camera app and offer a Join Network prompt. Older Android phones may need a QR scanner app, and the code still shows the network details in plain text as a fallback."],
      ["Is my WiFi password sent anywhere?", "No. The code is built entirely inside your browser using the standard WIFI:T:WPA;S:name;P:password;; format, and nothing is uploaded, logged or stored. Close the tab and no trace of the password remains."],
      ["Should I use this for a hidden network?", "Yes — tick the hidden network option and the code includes the H:true flag, which tells the phone to look for an SSID that is not broadcast. Without that flag some phones silently fail to connect to hidden networks."],
    ],
    howTo: "Type your network name (SSID) and password, pick the security type — WPA/WPA2 for almost every modern router — then download the PNG and print or frame it where guests can scan it.",
  },
  "qr-code-studio": {
    title: "QR Code Generator — Free PNG & SVG, No Tracking | ToolsRift",
    desc: "Free QR code generator for links, text, phone numbers, SMS and email. Choose size, colours and error correction, then download a permanent static PNG or vector SVG.",
    keywords: "qr code generator, free qr code, qr code svg download, static qr code, url qr code maker",
    faq: [
      ["Are these QR codes permanent?", "Yes. Every code is static, meaning your URL or text lives inside the black-and-white pattern itself. There is no redirect domain that can expire, get sold, or start charging you, so a code you print today still resolves in ten years."],
      ["What does the error correction level change?", "It sets how much of the code can be damaged or covered while still scanning: L tolerates about 7%, M 15%, Q 25% and H 30%. Higher levels make the pattern denser but let you place a small logo in the centre or survive a scuffed print."],
      ["When should I download SVG instead of PNG?", "Use SVG for anything printed — signage, packaging, posters — because it is vector and stays perfectly sharp at any size. PNG is easier for websites, slides and messaging apps where a fixed-size raster image is all you need."],
    ],
    howTo: "Pick the content type, fill in the fields, and adjust size, colour and error correction on the right. The preview redraws instantly — then download it as PNG or SVG.",
  },
  "email-link-generator": {
    title: "Mailto Link Generator — Free Email Link Builder | ToolsRift",
    desc: "Build a correctly encoded mailto: link with subject, body, CC and BCC pre-filled. Copy the URL or ready-made HTML anchor for your website, signature or email campaign.",
    keywords: "mailto link generator, email link builder, mailto with subject and body, html email link, mailto cc bcc",
    faq: [
      ["Why do I need a generator instead of typing the link?", "Because everything after the question mark must be percent-encoded. Spaces, ampersands, line breaks and accented characters all break a hand-written mailto link silently — the mail client just drops the subject or truncates the body. This tool encodes every field correctly."],
      ["How do I put line breaks in the message body?", "Just press Enter in the body box. Each newline is encoded as %0A, which mail clients turn back into a real line break, so you can pre-fill a multi-paragraph template or a labelled form for people to fill in."],
      ["Can I send to several recipients?", "Yes. Separate addresses with commas in the To, CC or BCC fields and they are encoded as one recipient list. Note that some webmail clients cap how many addresses they accept from a link, so keep lists short for reliability."],
    ],
    howTo: "Enter the recipient, subject, body and any CC or BCC addresses. The encoded mailto link and a ready-to-paste HTML anchor appear below — copy whichever you need.",
  },
  "sms-link-generator": {
    title: "SMS Link Generator — Free Click-to-Text Link | ToolsRift",
    desc: "Create sms: click-to-text links with the phone number and message body already filled in, so visitors can text you in one tap. Copy the link or the HTML button code.",
    keywords: "sms link generator, click to text link, sms url with body, tap to text link, sms href generator",
    faq: [
      ["Do SMS links work on both iPhone and Android?", "Yes, though the separator differs historically: iOS prefers sms:number&body=… while Android accepts sms:number?body=…. This tool outputs both variants so you can pick the one that matches your audience, or use the widely supported ?body= form."],
      ["What happens if someone clicks it on a desktop?", "Desktop browsers hand the link to whatever app is registered for the sms: scheme — on a Mac that is usually Messages, and on Windows it is often nothing at all. Treat click-to-text as a mobile-first feature and always show the plain number as a fallback."],
      ["Should I include the country code?", "Yes. Write the number in full international form starting with a plus sign, such as +447700900123. Without the country code the message may fail for anyone roaming or dialling from another country."],
    ],
    howTo: "Enter the destination phone number in international format and the message you want pre-filled. Copy the generated sms: link, or the HTML button snippet, into your page.",
  },
  "whatsapp-link-generator": {
    title: "WhatsApp Link Generator — Free wa.me Chat Link | ToolsRift",
    desc: "Generate a free wa.me click-to-chat link with a pre-written message so customers can start a WhatsApp conversation in one tap. No WhatsApp Business account needed.",
    keywords: "whatsapp link generator, wa.me link, click to chat whatsapp, whatsapp message link, whatsapp qr code",
    faq: [
      ["How should I format the phone number?", "Use the full international number with no plus sign, no spaces, no dashes and no leading zeros — for example 919876543210 for an Indian number. WhatsApp rejects any other format, which is the single most common reason these links fail."],
      ["Does the recipient have to have my number saved?", "No, and that is the point of a wa.me link. It opens a chat with the number directly, so neither side needs to add the other to their contacts first — ideal for a support button on a website or a poster in a shop."],
      ["Is the pre-filled message locked?", "No. Whatever you write is placed in the chat's text box, and the sender can edit or delete it before hitting send. Use it as a helpful starting point such as 'Hi, I'd like a quote for…' rather than as a form you expect back verbatim."],
    ],
    howTo: "Enter your WhatsApp number in international digits with no plus sign, type the message you want pre-filled, then copy the wa.me link or scan the QR code to test it.",
  },
  "phone-link-generator": {
    title: "Click-to-Call Link Generator — Free tel: Link & QR | ToolsRift",
    desc: "Build a tel: click-to-call link plus a matching QR code so people can dial your number straight from a web page, poster or business card. Copy the link or HTML button.",
    keywords: "tel link generator, click to call link, phone number qr code, tel href, call button html",
    faq: [
      ["What is the correct format for a tel: link?", "Use the international form with a plus sign and digits only, like tel:+442079460958. Brackets, spaces and dashes are technically allowed but some Android dialers mishandle them, so stripping them is the safest choice — this tool does that automatically."],
      ["Can I include an extension?", "Yes. Add a comma for a short pause followed by the extension digits, for example +442079460958,,123. Each comma is roughly a two-second pause while the call connects, and the dialer then sends the extension as tones."],
      ["Does the QR code work on a printed poster?", "Yes. The QR encodes the tel: URI, so a phone camera reads it and offers to dial immediately. Because the code is static there is no redirect service involved, so it keeps working even if this site changes."],
    ],
    howTo: "Type the phone number in international format and an optional link label. Copy the tel: link or HTML button, and download the QR code PNG for printed material.",
  },
  "contact-list-formatter": {
    title: "Contact List Formatter — Clean Up & Export .vcf | ToolsRift",
    desc: "Paste messy contact rows from a spreadsheet or email and get a clean aligned contact list, plus a multi-card .vcf export you can import into any address book at once.",
    keywords: "contact list formatter, csv to vcf converter, bulk vcard export, clean contact list, contacts to vcf",
    faq: [
      ["What input format does it expect?", "One contact per line with fields separated by commas, semicolons or tabs, in the order Name, Phone, Email, Company. Extra spaces, blank lines and inconsistent separators are all cleaned up automatically, so pasting straight from a spreadsheet column normally just works."],
      ["Can I import all the contacts in one go?", "Yes. The export writes a single .vcf file containing one vCard block per contact, which Google Contacts, Outlook and iOS all accept as a bulk import — you do not have to open each person separately."],
      ["Is my contact list uploaded to a server?", "No. Parsing, formatting and file creation all happen in your browser with JavaScript, so a list of client or member contacts never leaves your machine. That matters when the data is personal information you are responsible for."],
    ],
    howTo: "Paste your rows into the box, pick which columns you have, and review the cleaned table. Then copy the formatted list or download every contact as one .vcf file.",
  },
  "ical-event-generator": {
    title: "iCal .ics Event Generator — Free Calendar Invite | ToolsRift",
    desc: "Create a standards-compliant .ics calendar file with title, location, timezone, description and a reminder alarm. Imports cleanly into Google Calendar, Outlook and Apple Calendar.",
    keywords: "ics file generator, ical event generator, calendar invite maker, add to calendar file, ics download",
    faq: [
      ["Will the .ics file open in Google Calendar and Outlook?", "Yes. The output follows RFC 5545 with the required VCALENDAR and VEVENT blocks, CRLF line endings, a unique UID and a DTSTAMP, which is exactly what those apps validate. Attach it to an email or import it from the calendar's settings."],
      ["How are timezones handled?", "Choose UTC and the times are written with a trailing Z, which every client interprets identically. Choose a named timezone and the event is written as a floating local time with a TZID, so 10:00 stays 10:00 for attendees in that zone."],
      ["Can I add a reminder?", "Yes. Pick a reminder interval and a VALARM block is added with a DISPLAY action and a negative trigger, so the calendar app pops a notification that many minutes, hours or days before the event starts."],
    ],
    howTo: "Fill in the event title, date, start and end time, location and description, choose a timezone and reminder, then download the .ics file or copy the raw text.",
  },
  "quick-notepad": {
    title: "Quick Online Notepad — Free Autosaving Scratchpad | ToolsRift",
    desc: "A distraction-free online notepad that autosaves to your browser as you type. Live word and character counts, plus one-click export to a plain .txt file. No account needed.",
    keywords: "online notepad, free scratchpad, autosave notepad, browser notepad, text editor online",
    faq: [
      ["Where exactly is my note saved?", "In this browser's localStorage on this device only. It survives closing the tab and restarting the computer, but it is not synced anywhere and another browser or another machine will not see it — export to .txt whenever the text matters."],
      ["What happens if I clear my browser data?", "The note is deleted permanently along with cookies and site data, and there is no server copy to restore from. Private or incognito windows also discard it when you close them, so treat this as a scratchpad rather than long-term storage."],
      ["Is the notepad private?", "Yes. Nothing you type is transmitted — there is no server request at all while you write. That makes it usable for a quick draft you would not want to paste into a cloud editor, though anyone with access to your computer can still open the same tab."],
    ],
    howTo: "Start typing — the note saves itself a moment after you stop. Use the counters to track length, and press Download .txt to keep a copy outside the browser.",
  },
  "todo-list-maker": {
    title: "To-Do List Maker — Free Online Checklist, Saves Local | ToolsRift",
    desc: "Build a checkable to-do list that saves in your browser between visits. Tick items off, watch live progress, reorder or clear finished tasks, then print or export as text.",
    keywords: "to do list maker, online checklist, task list app, printable todo list, free task tracker",
    faq: [
      ["Does my list survive closing the browser?", "Yes. Every change is written to this browser's localStorage immediately, so the list is exactly as you left it next time you open the page on the same device and browser. It is not synced to any account or other device."],
      ["Can I print the list?", "Yes. The print view strips out the site navigation and buttons and lays out just the tasks with empty tick boxes on clean white paper, which is handy for a shopping list or a shift handover sheet."],
      ["How do I move a list to another computer?", "Use Export as text, which produces a plain-text version with checkbox markers. Save or email that file, then paste it back into the box on the other machine — there is no account, so this is the migration path."],
    ],
    howTo: "Type a task and press Enter or Add. Click any task to tick it off, use the arrows to reorder, and print or export when you want the list on paper or in a file.",
  },
  "kanban-board": {
    title: "Simple Kanban Board — Free Online, No Signup | ToolsRift",
    desc: "A three-column To Do, Doing and Done board that saves your cards in this browser. Add, move and delete tasks in one click, with per-column counts and a text export.",
    keywords: "kanban board online, free kanban tool, todo doing done board, simple task board, no signup kanban",
    faq: [
      ["How do I move a card between columns?", "Each card has arrow buttons that push it one column left or right, so a task flows To Do to Doing to Done with a single click. Buttons are used rather than drag-and-drop so the board works identically on a phone screen."],
      ["Is the board shared with my team?", "No. This is a personal board stored in your own browser with no server or account behind it, so nobody else can see or edit it. For shared work, export the board as text and paste it wherever your team already collaborates."],
      ["Could I lose my cards?", "Yes, if you clear site data, use a private window, or open the page in a different browser. Because there is no cloud backup, export the board to text whenever it holds something you would hate to retype."],
    ],
    howTo: "Type a card title, choose its column and press Add. Use the arrows on each card to move it along the board and the cross to delete it — everything saves automatically.",
  },
  "checklist-maker": {
    title: "Printable Checklist Maker — Free Custom Checklist | ToolsRift",
    desc: "Turn a pasted list into a reusable printable checklist with tick boxes, a title, subtitle and optional notes column. Print clean A4 or Letter pages with no site clutter.",
    keywords: "printable checklist maker, checklist template generator, free checklist pdf, tick box list, custom checklist",
    faq: [
      ["How do I get a PDF instead of paper?", "Press Print and choose 'Save as PDF' as the destination in your browser's print dialog. That produces a proper vector PDF of exactly the print preview, which you can email or store — no separate export step is needed."],
      ["Can I add section headings?", "Yes. Start a line with a hash character and it renders as a bold section heading with no tick box, so you can group a long checklist into stages such as Before, During and After."],
      ["Does the site menu appear on the printout?", "No. A scoped print stylesheet hides the navigation, buttons and footer so only the checklist page prints, with correct page margins. The on-screen preview shows the real page boundary so you know what will fit."],
    ],
    howTo: "Enter a title, then paste your items one per line, using # to start a section heading. Choose the paper size and whether you want a notes column, then press Print.",
  },
  "meeting-cost-calculator": {
    title: "Meeting Cost Calculator — What Your Meeting Costs | ToolsRift",
    desc: "Work out the real cost of a meeting from attendees, average hourly rate and duration, with a live per-minute running total and an annual cost if the meeting is recurring.",
    keywords: "meeting cost calculator, cost of meetings, salary per hour meeting, meeting roi calculator, time cost calculator",
    faq: [
      ["What hourly rate should I use?", "A fully loaded rate is more honest than raw salary: take the annual salary, add roughly 25-35% for employer taxes, benefits and overhead, then divide by about 1,800 working hours. Using bare salary understates a meeting's true cost by a third."],
      ["What does the live timer do?", "Start it at the beginning of a real meeting and the cost ticks upward second by second at the rate you entered. Projected on a screen it is a famously effective way to keep a status meeting short."],
      ["How is the annual figure calculated?", "It multiplies the single-meeting cost by how often the meeting recurs in a year — 52 for weekly, 26 for fortnightly, 12 for monthly. A one-hour weekly meeting with eight people is usually the number that surprises people most."],
    ],
    howTo: "Enter how many people attend, their average hourly rate and how long the meeting runs. The cost updates instantly, and you can start the live timer during the meeting itself.",
  },
  "weekly-planner-printable": {
    title: "Printable Weekly Planner — Free Custom Week Grid | ToolsRift",
    desc: "Generate a printable weekly planner with your own start hour, end hour and slot length, a Monday or Sunday week start and a side notes column. Print A4 or Letter.",
    keywords: "printable weekly planner, weekly schedule template, hourly planner printable, week grid pdf, time blocking template",
    faq: [
      ["Can I set my own hours?", "Yes. Choose any start and end hour and a slot length of 15, 30 or 60 minutes, so an early-shift planner running 05:00-14:00 in half hours is as easy to make as a standard 09:00-18:00 grid."],
      ["Should the week start on Monday or Sunday?", "Both are offered because it is regional: most of Europe, India and the ISO standard start on Monday, while the United States, Canada and Japan usually start on Sunday. Pick whichever matches the calendar your team already reads."],
      ["Will the whole week fit on one page?", "Yes, in landscape. The preview shows the real page boundary, so if you pick a long day at 15-minute slots and it overflows, either widen the slot length or shorten the hour range until it fits."],
    ],
    howTo: "Set the start and end hour, slot length and week start, and add a title if you want one. Check the on-screen page preview, then press Print for a clean planner page.",
  },
  "monthly-calendar-printable": {
    title: "Printable Monthly Calendar — Any Month & Year Free | ToolsRift",
    desc: "Print a clean month calendar for any month and year with a Monday or Sunday week start, weekend shading and an optional side notes column for reminders and goals.",
    keywords: "printable monthly calendar, blank calendar template, print calendar any year, month planner printable, calendar pdf free",
    faq: [
      ["How far ahead can I print?", "Any month of any year the calendar handles, including leap years, which are calculated properly rather than approximated. That makes it useful for planning a school term or a project a couple of years out."],
      ["Are public holidays marked?", "No. Holidays differ by country, state and even city, so the calendar is deliberately blank and you can write your own in. That also keeps it usable anywhere in the world without a wrong date on it."],
      ["Can I add notes beside the grid?", "Yes. Turn on the notes column and a ruled panel prints down the right side of the sheet, which works well for monthly goals, birthdays or a bills-due list next to the dates themselves."],
    ],
    howTo: "Choose the month, year and week start, decide whether you want the notes column, then check the page preview and press Print for a full-page calendar.",
  },
  "countdown-to-date": {
    title: "Countdown to Date — Free Live Days Until Counter | ToolsRift",
    desc: "Count the days, hours, minutes and seconds until any date and time, with a live ticking display, working-days remaining and a one-line summary you can copy and share.",
    keywords: "countdown to date, days until calculator, countdown timer online, days between dates, event countdown",
    faq: [
      ["Does the countdown keep running?", "Yes. It updates once a second while the tab is open, so you can leave it on a second screen during a launch or deadline. Nothing is stored, so reopening the page means re-entering the date."],
      ["What are working days remaining?", "It is the count of Mondays to Fridays left before the target, which is usually a far more useful deadline number than raw calendar days. It does not subtract public holidays, since those vary by country."],
      ["Can I count down to a past date?", "Yes. If the target is in the past the tool switches to counting up and tells you how long ago it was, which works nicely for anniversaries, sobriety dates or 'days since the last incident' boards."],
    ],
    howTo: "Pick the target date and time and give the event a name. The countdown starts immediately — copy the summary line to paste into a chat, email or status page.",
  },
  "time-slot-generator": {
    title: "Time Slot Generator — Split a Day Into Appointments | ToolsRift",
    desc: "Split a working window into equal appointment slots of any length, with optional gaps between slots and a lunch break excluded. Copy the schedule or print the slot sheet.",
    keywords: "time slot generator, appointment schedule maker, split day into slots, booking slots generator, interview schedule",
    faq: [
      ["What are the gaps between slots for?", "A buffer between appointments absorbs overruns and gives you time to write notes or reset a room. Setting a 5 or 10 minute gap on a 30 minute slot is what stops a clinic or interview day from sliding an hour late by the afternoon."],
      ["How is the lunch break handled?", "Enter a start time and length and no slot is generated that overlaps it. If a slot would straddle the break, generation resumes cleanly at the end of the break rather than producing an awkward part-length appointment."],
      ["Can I use it for interview scheduling?", "Yes, that is a common use. Generate the slots, copy the list, and paste it into an email or booking sheet so each candidate can claim a specific time rather than negotiating one by one."],
    ],
    howTo: "Set the day's start and end time, the slot length and any gap or lunch break. The full list of slots appears instantly, ready to copy, print or paste into a booking sheet.",
  },
  "signature-pad": {
    title: "Online Signature Pad — Draw & Download PNG Free | ToolsRift",
    desc: "Draw your signature with a mouse, trackpad or finger and download it as a transparent PNG. Adjustable pen width and colour, smooth strokes, undo, and nothing uploaded.",
    keywords: "online signature pad, draw signature online, signature png transparent, e signature maker, digital signature image",
    faq: [
      ["Is my signature uploaded anywhere?", "No. The drawing lives on an HTML canvas in your browser and the PNG is created locally with the canvas toBlob API. Your signature image is never transmitted, which matters because a signature is exactly the kind of thing you should not hand to a random web service."],
      ["Why does the transparent background matter?", "A transparent PNG drops cleanly onto a contract, letter or slide without a white box around it. Choose the white-background option instead only if the software you are pasting into cannot handle transparency."],
      ["Does this create a legally binding signature?", "A drawn image on its own is not the same as a qualified electronic signature. It is fine for informal approvals and for pasting into documents, but for contracts requiring legal weight use a service that provides an audit trail and identity verification."],
    ],
    howTo: "Draw inside the pad with your mouse or finger, adjusting the pen width and colour first if you want. Use Undo to remove the last stroke, then download the PNG.",
  },
  "address-label-sheet": {
    title: "Address Label Sheet Maker — Free Printable Labels | ToolsRift",
    desc: "Paste addresses and lay them out on a printable Avery-style label sheet. Choose a 2x7, 3x10 or 2x5 grid, tune the alignment, and print straight onto label stock.",
    keywords: "address label printable, avery label template free, print mailing labels, label sheet generator, address labels online",
    faq: [
      ["Which label sheets does this match?", "The 3x10 grid matches Avery 5160 and L7160 style 63.5 x 38.1 mm labels, 2x7 matches the larger 99.1 x 38.1 mm sheets, and 2x5 suits shipping labels. Always print one test page on plain paper and hold it against your sheet before committing."],
      ["Why is my print slightly off the labels?", "Printers vary by a millimetre or two in how they grip paper. Use the horizontal and vertical offset controls to nudge the whole grid, and make sure your print dialog is set to 100% scale rather than 'fit to page', which is the usual culprit."],
      ["Can I repeat the same address on every label?", "Yes. Enter one address and turn on repeat, and it fills the whole sheet — the standard way to make a page of return address labels. Otherwise separate each address with a blank line to place them one per label."],
    ],
    howTo: "Paste addresses separated by blank lines, choose the label grid and font size, and adjust the offsets if your printer runs off-centre. Check the preview, then print.",
  },
  "name-badge-maker": {
    title: "Name Badge Maker — Free Printable Conference Badges | ToolsRift",
    desc: "Turn a pasted list of names and roles into printable conference name badges, with your event title on every badge and a choice of badge sizes and accent colours.",
    keywords: "name badge maker, printable name tags, conference badge template, event name tags free, badge sheet printable",
    faq: [
      ["What input format do the names need?", "One person per line, optionally with a comma to add their role or company — for example 'Priya Sharma, Head of Design'. The name prints large and the role prints smaller underneath, which is what makes a badge readable across a room."],
      ["What badge size should I use?", "The standard clip-on badge insert is 90 x 54 mm, which fits eight to a page and suits most badge holders. The large option prints six per page and is easier to read at a distance for a keynote or a busy trade stand."],
      ["Can I print onto perforated badge stock?", "Yes, if the stock matches one of the grid layouts. Print a test page on plain paper first and hold it against the sheet, since even matching sizes can sit a millimetre out depending on your printer."],
    ],
    howTo: "Enter your event name, paste one attendee per line with an optional comma and role, and choose the badge size and accent colour. Preview the sheet, then print.",
  },
  "certificate-maker": {
    title: "Certificate Maker — Free Printable Award Certificate | ToolsRift",
    desc: "Design a printable landscape certificate with recipient name, award reason, date and signatory. Choose a decorative border and accent colour, then print or save as PDF.",
    keywords: "certificate maker free, printable certificate template, award certificate generator, certificate of achievement, diploma template print",
    faq: [
      ["How do I save it as a PDF?", "Press Print and pick 'Save as PDF' in your browser's print destination list. Because the certificate is drawn with vector text and borders rather than as an image, the PDF stays crisp at any zoom and prints sharply on heavy card."],
      ["Can I make certificates for a whole class?", "Yes, though one at a time: change the recipient name and print again. Everything else stays as you set it, so a run of thirty certificates is just thirty name edits and prints rather than a redesign each time."],
      ["Should I print it landscape?", "Yes. The layout is designed for landscape A4 or Letter, and the print stylesheet already requests that orientation. Check that your print dialog has not overridden it to portrait, which would crop the border."],
    ],
    howTo: "Fill in the recipient, the award title and reason, the date and the signatory line, then pick a border style and accent colour. Check the preview and press Print.",
  },
  "letterhead-generator": {
    title: "Letterhead Generator — Free Printable Company Header | ToolsRift",
    desc: "Build a printable company letterhead with your business name, tagline, address, phone, email and website, in a choice of layouts and accent colours. Print or save as PDF.",
    keywords: "letterhead generator, free letterhead template, company letterhead printable, business letter header, letterhead pdf maker",
    faq: [
      ["Can I write the letter body here too?", "Yes. There is a body text area, so you can compose the whole letter and print a finished document. Leave it empty instead and you get a blank letterhead sheet to run through the printer and then write or type on."],
      ["Which layout should I choose?", "Centred looks traditional and works for formal correspondence, while the left-aligned layout with details in a right column reads as more modern and leaves cleaner space for a logo. Both keep a footer strip with your contact line."],
      ["Does it include a logo?", "The generator is text and colour based rather than image based, so it produces a clean typographic header without uploading anything. If you need a logo, print the letterhead onto pre-printed stock or add the image in your word processor."],
    ],
    howTo: "Enter your company name, tagline and contact details, pick a layout and accent colour, and optionally type the letter body. Check the page preview, then press Print.",
  },
  "envelope-addresser": {
    title: "Envelope Addresser — Print Addresses on Envelopes Free | ToolsRift",
    desc: "Print addresses straight onto DL, C5, C6 or US #10 envelopes with correctly positioned sender and recipient blocks, adjustable font size and printer alignment offsets.",
    keywords: "print envelope address, envelope printing template, dl envelope printable, address envelope online, c5 envelope print",
    faq: [
      ["Which way do I feed the envelope?", "It depends on the printer, and the only reliable method is a test: mark one corner of a blank envelope, feed it, and see where the text lands. Most desktop printers take envelopes face up with the flap to the left, but manufacturers differ."],
      ["What if the address prints in the wrong place?", "Use the horizontal and vertical offset controls to shift both blocks together, and make sure your print dialog is set to 100% scale with the envelope size selected as the paper. Scaling set to 'fit to page' will always misplace it."],
      ["Which envelope sizes are supported?", "DL (110 x 220 mm), C5 (162 x 229 mm), C6 (114 x 162 mm) and US #10 (4.125 x 9.5 in), covering the common business sizes in Europe, India and North America. The preview shows the true proportions of the one you pick."],
    ],
    howTo: "Type the sender and recipient addresses, choose your envelope size and font size, and nudge the offsets if your printer runs off-centre. Print a test on paper first.",
  },
  "page-border-printable": {
    title: "Printable Page Borders — Free Decorative Border Sheets | ToolsRift",
    desc: "Print decorative page borders for handouts, notices, worksheets and certificates. Pick a border style, thickness, colour and optional title, with ruled or blank lines inside.",
    keywords: "printable page borders, decorative border template, border paper printable, worksheet border free, page frame print",
    faq: [
      ["What are the border styles?", "Classic double rule, thick and thin combinations, dotted, dashed, rounded corners and a corner-ornament frame. All are drawn with CSS rather than images, so they print at your printer's full resolution instead of looking pixelated."],
      ["Can I add writing lines inside the border?", "Yes. Turn on ruled lines and choose the spacing, which turns the sheet into bordered writing paper for classrooms, letters or notices. Leave it off for a plain frame you can print a document into or write freehand on."],
      ["Will the border be cut off at the page edge?", "No, as long as your print dialog is set to 100% scale. The border sits inside the printable margin every consumer printer supports, and the on-screen preview shows the true page boundary so you can see the clearance before printing."],
    ],
    howTo: "Choose a border style, thickness and colour, add a title if you want one, and turn on ruled lines if you need writing space. Check the preview and press Print.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  TOOLS
// ══════════════════════════════════════════════════════════════════════════════

// ── Generic helpers ──────────────────────────────────────────────────────────

// Download any string or Blob, always revoking the object URL afterwards.
function downloadBlob(filename, mime, data) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// State mirrored into localStorage under a namespaced key, with quota handling.
function useLocalState(name, initial) {
  const key = "toolsrift_office_" + name;
  const [val, setVal] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storeErr, setStoreErr] = useState(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setVal(JSON.parse(raw));
    } catch (e) { /* corrupt or blocked storage — fall back to the default */ }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(key, JSON.stringify(val)); setStoreErr(null); }
    catch (e) {
      setStoreErr(e && (e.name === "QuotaExceededError" || e.code === 22)
        ? "Browser storage is full — this change was NOT saved. Export your data, then clear some space."
        : "Could not save to this browser (storage may be blocked in a private window). Export your data to keep it.");
    }
  }, [key, val, ready]);
  return [val, setVal, storeErr, ready];
}

function LocalDataNotice({ error }) {
  return (
    <div className="tr-noprint" style={{ background: error ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.08)", border: `1px solid ${error ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.22)"}`, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: error ? "#FCA5A5" : "#FCD34D", lineHeight: 1.55 }}>
      {error || "⚠️ Saved in this browser only — not synced to any account or device. Clearing site data or using a private window wipes it, so export a copy of anything you need to keep."}
    </div>
  );
}

// Print stylesheet scoped so only the .tr-print sheet reaches the paper.
const PRINT_BASE = "@media print{html,body{background:#fff !important}body *{visibility:hidden !important}" +
  ".tr-print,.tr-print *{visibility:visible !important}" +
  ".tr-print{position:absolute !important;left:0 !important;top:0 !important;transform:none !important;width:auto !important;height:auto !important;min-height:0 !important;margin:0 !important;padding:0 !important;box-shadow:none !important;border-radius:0 !important;overflow:visible !important}" +
  ".tr-prev-wrap{overflow:visible !important;border:none !important;background:none !important;padding:0 !important}" +
  ".tr-prev-inner{width:auto !important;height:auto !important;margin:0 !important}" +
  ".tr-noprint{display:none !important}}";

function usePrintStyle(pageSize, margin) {
  useEffect(() => {
    const el = document.createElement("style");
    el.setAttribute("data-tr-print", "1");
    el.textContent = "@page{size:" + pageSize + ";margin:" + margin + "}" + PRINT_BASE;
    document.head.appendChild(el);
    return () => { if (el.parentNode) el.parentNode.removeChild(el); };
  }, [pageSize, margin]);
}

// On-screen sheet showing the real page boundary, scaled down to fit the layout.
function PaperSheet({ wmm, hmm, zoom = 0.5, pad = 12, flow = false, children, bg = "#FFFFFF" }) {
  return (
    <div className="tr-prev-wrap" style={{ overflow: "auto", background: "rgba(255,255,255,0.03)", border: `1px dashed ${C.border}`, borderRadius: 10, padding: 14 }}>
      <div className="tr-prev-inner" style={{ width: `${wmm * zoom}mm`, height: flow ? "auto" : `${hmm * zoom}mm`, margin: "0 auto" }}>
        <div className="tr-print" style={{ width: `${wmm}mm`, [flow ? "minHeight" : "height"]: `${hmm}mm`, transform: `scale(${zoom})`, transformOrigin: "top left", background: bg, color: "#111827", padding: `${pad}mm`, boxShadow: "0 6px 28px rgba(0,0,0,0.55)", overflow: flow ? "visible" : "hidden", fontFamily: "'Plus Jakarta Sans',sans-serif", boxSizing: "border-box" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PrintBar({ note }) {
  return (
    <div className="tr-noprint" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, flex: 1, minWidth: 200 }}>{note || "Set your print dialog to 100% scale (not “fit to page”) so sizes come out right."}</div>
      <button onClick={() => window.print()} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`) }}>🖨️ Print</button>
    </div>
  );
}

const PAPER = { a4p: [210, 297, "A4 portrait"], a4l: [297, 210, "A4 landscape"], ltp: [216, 279, "Letter portrait"], ltl: [279, 216, "Letter landscape"] };

// ══════════════════════════════════════════════════════════════════════════════
//  QR code encoder — byte mode, versions 1–10, EC levels L/M/Q/H
//  A self-contained implementation of ISO/IEC 18004 so nothing is loaded from a
//  CDN and every code stays static (no redirect service, no scan tracking).
//  Pipeline: UTF-8 bytes → data codewords → Reed–Solomon EC over GF(256) →
//  block interleaving → module placement → mask chosen by penalty score →
//  format/version information. Verified against the ISO/IEC 18004 Annex I.2
//  worked example and the published format/version information tables.
// ══════════════════════════════════════════════════════════════════════════════

// GF(256) log/antilog tables, primitive polynomial x^8+x^4+x^3+x^2+1 (0x11D).
const QR_EXP = new Uint8Array(512);
const QR_LOG = new Uint8Array(256);
(function buildQrGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) { QR_EXP[i] = x; QR_LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11D; }
  for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255];
})();
const qrMul = (a, b) => (a === 0 || b === 0) ? 0 : QR_EXP[QR_LOG[a] + QR_LOG[b]];

// Reed–Solomon generator polynomial of degree n = product of (x - a^i).
function qrGenPoly(n) {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];                        // × x
      next[j + 1] ^= qrMul(poly[j], QR_EXP[i]);  // × a^i
    }
    poly = next;
  }
  return poly;
}

// Polynomial long division — the remainder is the EC codeword block.
function qrEC(dataBytes, ecLen) {
  const gen = qrGenPoly(ecLen);
  const res = new Array(ecLen).fill(0);
  for (let k = 0; k < dataBytes.length; k++) {
    const factor = dataBytes[k] ^ res[0];
    res.shift(); res.push(0);
    if (factor !== 0) for (let i = 0; i < ecLen; i++) res[i] ^= qrMul(gen[i + 1], factor);
  }
  return res;
}

// version → level → [ecCodewordsPerBlock, [[blockCount, dataCodewordsPerBlock], …]]
const QR_BLOCKS = {
  1:  { L:[7,[[1,19]]],         M:[10,[[1,16]]],        Q:[13,[[1,13]]],        H:[17,[[1,9]]] },
  2:  { L:[10,[[1,34]]],        M:[16,[[1,28]]],        Q:[22,[[1,22]]],        H:[28,[[1,16]]] },
  3:  { L:[15,[[1,55]]],        M:[26,[[1,44]]],        Q:[18,[[2,17]]],        H:[22,[[2,13]]] },
  4:  { L:[20,[[1,80]]],        M:[18,[[2,32]]],        Q:[26,[[2,24]]],        H:[16,[[4,9]]] },
  5:  { L:[26,[[1,108]]],       M:[24,[[2,43]]],        Q:[18,[[2,15],[2,16]]], H:[22,[[2,11],[2,12]]] },
  6:  { L:[18,[[2,68]]],        M:[16,[[4,27]]],        Q:[24,[[4,19]]],        H:[28,[[4,15]]] },
  7:  { L:[20,[[2,78]]],        M:[18,[[4,31]]],        Q:[18,[[2,14],[4,15]]], H:[26,[[4,13],[1,14]]] },
  8:  { L:[24,[[2,97]]],        M:[22,[[2,38],[2,39]]], Q:[22,[[4,18],[2,19]]], H:[26,[[4,14],[2,15]]] },
  9:  { L:[30,[[2,116]]],       M:[22,[[3,36],[2,37]]], Q:[20,[[4,16],[4,17]]], H:[24,[[4,12],[4,13]]] },
  10: { L:[18,[[2,68],[2,69]]], M:[26,[[4,43],[1,44]]], Q:[24,[[6,19],[2,20]]], H:[28,[[6,15],[2,16]]] },
};
const QR_ALIGN = { 1:[], 2:[6,18], 3:[6,22], 4:[6,26], 5:[6,30], 6:[6,34], 7:[6,22,38], 8:[6,24,42], 9:[6,26,46], 10:[6,28,50] };
const QR_ECBITS = { L:1, M:0, Q:3, H:2 }; // numeric level value inside format info

function qrUtf8(str) {
  if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(str));
  const s = unescape(encodeURIComponent(str)); const out = [];
  for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
  return out;
}
const qrCapacity = (v, ec) => QR_BLOCKS[v][ec][1].reduce((s, g) => s + g[0] * g[1], 0);

// BCH remainder, shared by format (poly 0x537) and version (poly 0x1F25) info.
function qrBCH(value, poly, polyBits) {
  const digit = (n) => { let d = 0; while (n !== 0) { d++; n >>>= 1; } return d; };
  let d = value;
  while (digit(d) - polyBits >= 0) d ^= poly << (digit(d) - polyBits);
  return d;
}

// The eight mask conditions from the specification.
function qrMaskFn(pattern, i, j) {
  switch (pattern) {
    case 0: return (i + j) % 2 === 0;
    case 1: return i % 2 === 0;
    case 2: return j % 3 === 0;
    case 3: return (i + j) % 3 === 0;
    case 4: return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    default: return (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
  }
}

// Function patterns + format/version info. Data cells are left null.
function qrBuildMatrix(version, ecLevel, maskPattern) {
  const size = version * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(null));
  const finder = (r, c) => {
    for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
      m[rr][cc] = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                  (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                  (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
    }
  };
  finder(0, 0); finder(size - 7, 0); finder(0, size - 7);
  const pos = QR_ALIGN[version];
  for (const r of pos) for (const c of pos) {
    if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
      m[r + dr][c + dc] = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
  }
  for (let i = 8; i < size - 8; i++) {
    if (m[i][6] === null) m[i][6] = i % 2 === 0;
    if (m[6][i] === null) m[6][i] = i % 2 === 0;
  }
  if (version >= 7) {
    const bits = (version << 12) | qrBCH(version << 12, 0x1F25, 13);
    for (let i = 0; i < 18; i++) {
      const on = ((bits >> i) & 1) === 1;
      m[Math.floor(i / 3)][(i % 3) + size - 11] = on;
      m[(i % 3) + size - 11][Math.floor(i / 3)] = on;
    }
  }
  const fdata = (QR_ECBITS[ecLevel] << 3) | maskPattern;
  const fbits = ((fdata << 10) | qrBCH(fdata << 10, 0x537, 11)) ^ 0x5412;
  for (let i = 0; i < 15; i++) {
    const on = ((fbits >> i) & 1) === 1;
    if (i < 6) m[i][8] = on; else if (i < 8) m[i + 1][8] = on; else m[size - 15 + i][8] = on;
    if (i < 8) m[8][size - i - 1] = on; else if (i < 9) m[8][15 - i] = on; else m[8][14 - i] = on;
  }
  m[size - 8][8] = true; // permanently dark module
  return m;
}

// Zig-zag placement of the codeword stream, applying the mask as it goes.
function qrMapData(m, data, maskPattern) {
  const size = m.length;
  let inc = -1, row = size - 1, bitIndex = 7, byteIndex = 0;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (;;) {
      for (let c = 0; c < 2; c++) {
        if (m[row][col - c] === null) {
          let dark = byteIndex < data.length ? ((data[byteIndex] >>> bitIndex) & 1) === 1 : false;
          if (qrMaskFn(maskPattern, row, col - c)) dark = !dark;
          m[row][col - c] = dark;
          if (--bitIndex === -1) { byteIndex++; bitIndex = 7; }
        }
      }
      row += inc;
      if (row < 0 || row >= size) { row -= inc; inc = -inc; break; }
    }
  }
}

// Standard penalty score (N1=3, N2=3, N3=40, N4=10) used to choose the mask.
function qrPenalty(m) {
  const size = m.length; let score = 0;
  for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) {
    const v = m[r][c];
    if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
  }
  const runScore = (line) => {
    let s = 0, run = 1;
    for (let i = 1; i < line.length; i++) {
      if (line[i] === line[i - 1]) run++;
      else { if (run >= 5) s += 3 + (run - 5); run = 1; }
    }
    if (run >= 5) s += 3 + (run - 5);
    return s;
  };
  const p1 = [true, false, true, true, true, false, true, false, false, false, false];
  const p2 = [false, false, false, false, true, false, true, true, true, false, true];
  const hit = (line, i, p) => p.every((v, k) => line[i + k] === v);
  for (let r = 0; r < size; r++) {
    const row = m[r], col = m.map(x => x[r]);
    score += runScore(row) + runScore(col);
    for (let i = 0; i + 11 <= size; i++) {
      if (hit(row, i, p1) || hit(row, i, p2)) score += 40;
      if (hit(col, i, p1) || hit(col, i, p2)) score += 40;
    }
  }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return score;
}

// Public entry point → { size, modules, version, ecLevel, mask }.
function qrEncode(text, ecLevel) {
  const ec = QR_BLOCKS[1][ecLevel] ? ecLevel : "M";
  const bytes = qrUtf8(text == null ? "" : String(text));
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const cci = v <= 9 ? 8 : 16;
    if (4 + cci + bytes.length * 8 <= qrCapacity(v, ec) * 8) { version = v; break; }
  }
  if (!version) throw new Error("Too long for a QR code at this error-correction level — shorten the text or drop to level L.");

  const total = qrCapacity(version, ec);
  const bits = [];
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
  push(4, 4);                                   // byte mode indicator
  push(bytes.length, version <= 9 ? 8 : 16);    // character count indicator
  for (const b of bytes) push(b, 8);
  for (let i = 0; i < 4 && bits.length < total * 8; i++) bits.push(0); // terminator
  while (bits.length % 8 !== 0) bits.push(0);
  const dataCw = [];
  for (let i = 0; i < bits.length; i += 8) { let v = 0; for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j]; dataCw.push(v); }
  const pads = [0xEC, 0x11];
  for (let i = 0; dataCw.length < total; i++) dataCw.push(pads[i % 2]);

  const ecLen = QR_BLOCKS[version][ec][0], groups = QR_BLOCKS[version][ec][1];
  const dBlocks = [], eBlocks = [];
  let off = 0;
  for (const g of groups) for (let b = 0; b < g[0]; b++) {
    const chunk = dataCw.slice(off, off + g[1]); off += g[1];
    dBlocks.push(chunk); eBlocks.push(qrEC(chunk, ecLen));
  }
  const final = [];
  const maxD = Math.max.apply(null, dBlocks.map(b => b.length));
  for (let i = 0; i < maxD; i++) for (const b of dBlocks) if (i < b.length) final.push(b[i]);
  for (let i = 0; i < ecLen; i++) for (const b of eBlocks) final.push(b[i]);

  let best = null, bestScore = Infinity, bestMask = 0;
  for (let mask = 0; mask < 8; mask++) {
    const m = qrBuildMatrix(version, ec, mask);
    qrMapData(m, final, mask);
    const s = qrPenalty(m);
    if (s < bestScore) { bestScore = s; best = m; bestMask = mask; }
  }
  return { size: best.length, modules: best, version, ecLevel: ec, mask: bestMask };
}

function qrDrawCanvas(canvas, text, o) {
  const opt = Object.assign({ level: "M", scale: 8, margin: 4, dark: "#000000", light: "#FFFFFF" }, o || {});
  const res = qrEncode(text, opt.level);
  const total = res.size + opt.margin * 2, px = total * opt.scale;
  canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, px, px);
  if (opt.light !== "transparent") { ctx.fillStyle = opt.light; ctx.fillRect(0, 0, px, px); }
  ctx.fillStyle = opt.dark;
  for (let r = 0; r < res.size; r++) for (let c = 0; c < res.size; c++)
    if (res.modules[r][c]) ctx.fillRect((c + opt.margin) * opt.scale, (r + opt.margin) * opt.scale, opt.scale, opt.scale);
  return res;
}

function qrToSVG(text, o) {
  const opt = Object.assign({ level: "M", scale: 8, margin: 4, dark: "#000000", light: "#FFFFFF" }, o || {});
  const res = qrEncode(text, opt.level);
  const total = res.size + opt.margin * 2;
  let d = "";
  for (let r = 0; r < res.size; r++) for (let c = 0; c < res.size; c++)
    if (res.modules[r][c]) d += `M${c + opt.margin} ${r + opt.margin}h1v1h-1z`;
  const bg = opt.light === "transparent" ? "" : `<rect width="${total}" height="${total}" fill="${opt.light}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total * opt.scale}" height="${total * opt.scale}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">${bg}<path d="${d}" fill="${opt.dark}"/></svg>`;
}

// Reusable QR preview + PNG/SVG download block.
function QRBlock({ text, level = "M", px = 240, dark = "#000000", light = "#FFFFFF", filename = "qr-code", showDownloads = true, margin = 4 }) {
  const ref = useRef(null);
  const [info, setInfo] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      if (!text) { setErr("Fill in the fields above to generate a QR code."); setInfo(null); return; }
      const res = qrEncode(text, level);
      const scale = Math.max(2, Math.round(px / (res.size + margin * 2)));
      qrDrawCanvas(ref.current, text, { level, scale, margin, dark, light });
      setInfo(res); setErr(null);
    } catch (e) { setErr(e.message); setInfo(null); }
  }, [text, level, px, dark, light, margin]);
  const savePng = () => {
    const cv = document.createElement("canvas");
    qrDrawCanvas(cv, text, { level, scale: 16, margin, dark, light });
    cv.toBlob(b => downloadBlob(filename + ".png", "image/png", b), "image/png");
  };
  const saveSvg = () => downloadBlob(filename + ".svg", "image/svg+xml", qrToSVG(text, { level, scale: 8, margin, dark, light }));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ background: light === "transparent" ? "#fff" : light, padding: 8, borderRadius: 10, border: `1px solid ${C.border}`, display: err ? "none" : "block" }}>
        <canvas ref={ref} style={{ display: "block", width: px, height: px, imageRendering: "pixelated" }} />
      </div>
      {err && <Result mono={false}>{err}</Result>}
      {info && (
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
          Version {info.version} · {info.size}×{info.size} modules · EC level {info.ecLevel} · mask {info.mask}
          <div style={{ marginTop: 3, color: "#34D399" }}>Static code — data is inside the pattern, no redirect and no scan tracking.</div>
        </div>
      )}
      {showDownloads && info && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          <Btn size="sm" onClick={savePng}>⬇ PNG</Btn>
          <Btn size="sm" variant="secondary" onClick={saveSvg}>⬇ SVG (vector)</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CONTACT TOOLS
// ══════════════════════════════════════════════════════════════════════════════

// vCard/iCal TEXT escaping: backslash, semicolon, comma and newlines.
const icsEsc = (s) => String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
// Fold long content lines at 75 octets as the vCard/iCal specs recommend.
const foldLines = (text) => text.split("\r\n").map(line => {
  if (line.length <= 75) return line;
  let out = line.slice(0, 75), rest = line.slice(75);
  while (rest.length > 74) { out += "\r\n " + rest.slice(0, 74); rest = rest.slice(74); }
  return out + (rest ? "\r\n " + rest : "");
}).join("\r\n");

function buildVCard(p) {
  const L = ["BEGIN:VCARD", "VERSION:3.0"];
  const last = icsEsc(p.last), first = icsEsc(p.first);
  L.push(`N:${last};${first};;;`);
  L.push(`FN:${icsEsc(((p.first || "") + " " + (p.last || "")).trim() || p.company || "Contact")}`);
  if (p.company) L.push(`ORG:${icsEsc(p.company)}`);
  if (p.title) L.push(`TITLE:${icsEsc(p.title)}`);
  if (p.mobile) L.push(`TEL;TYPE=CELL,VOICE:${icsEsc(p.mobile)}`);
  if (p.phone) L.push(`TEL;TYPE=WORK,VOICE:${icsEsc(p.phone)}`);
  if (p.email) L.push(`EMAIL;TYPE=INTERNET,PREF:${icsEsc(p.email)}`);
  if (p.url) L.push(`URL:${icsEsc(p.url)}`);
  if (p.street || p.city || p.region || p.zip || p.country)
    L.push(`ADR;TYPE=WORK:;;${icsEsc(p.street)};${icsEsc(p.city)};${icsEsc(p.region)};${icsEsc(p.zip)};${icsEsc(p.country)}`);
  if (p.note) L.push(`NOTE:${icsEsc(p.note)}`);
  L.push("END:VCARD");
  return L.join("\r\n") + "\r\n";
}

function vCardQRGenerator() {
  const [p, setP] = useState({ first: "Priya", last: "Sharma", title: "Head of Design", company: "Rift Studio", mobile: "+91 98765 43210", phone: "+91 40 4000 1234", email: "priya@riftstudio.in", url: "https://riftstudio.in", street: "12 Banjara Hills Road 2", city: "Hyderabad", region: "Telangana", zip: "500034", country: "India", note: "" });
  const set = (k) => (v) => setP(o => Object.assign({}, o, { [k]: v }));
  const vcf = buildVCard(p);
  const filename = ((p.first || "contact") + "-" + (p.last || "")).trim().replace(/\s+/g, "-").toLowerCase().replace(/-+$/, "");
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>First Name</Label><Input value={p.first} onChange={set("first")} /></div>
        <div><Label>Last Name</Label><Input value={p.last} onChange={set("last")} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Job Title</Label><Input value={p.title} onChange={set("title")} /></div>
        <div><Label>Company</Label><Input value={p.company} onChange={set("company")} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Mobile</Label><Input value={p.mobile} onChange={set("mobile")} placeholder="+91 98765 43210" /></div>
        <div><Label>Work Phone</Label><Input value={p.phone} onChange={set("phone")} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Email</Label><Input value={p.email} onChange={set("email")} /></div>
        <div><Label>Website</Label><Input value={p.url} onChange={set("url")} /></div>
      </Grid2>
      <div><Label>Street</Label><Input value={p.street} onChange={set("street")} /></div>
      <Grid3>
        <div><Label>City</Label><Input value={p.city} onChange={set("city")} /></div>
        <div><Label>State / Region</Label><Input value={p.region} onChange={set("region")} /></div>
        <div><Label>Postcode</Label><Input value={p.zip} onChange={set("zip")} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Country</Label><Input value={p.country} onChange={set("country")} /></div>
        <div><Label>Note (optional)</Label><Input value={p.note} onChange={set("note")} /></div>
      </Grid2>

      <Card>
        <QRBlock text={vcf} level="M" px={250} filename={"vcard-" + (filename || "contact")} />
      </Card>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>vCard 3.0 (.vcf) output</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <CopyBtn text={vcf} />
            <Btn size="sm" onClick={() => downloadBlob((filename || "contact") + ".vcf", "text/vcard;charset=utf-8", foldLines(vcf))}>⬇ .vcf</Btn>
          </div>
        </div>
        <Result>{vcf}</Result>
      </div>
    </VStack>
  );
}

function WifiQRGenerator() {
  const [ssid, setSsid] = useState("Rift Cafe Guest");
  const [pass, setPass] = useState("latte2026");
  const [enc, setEnc] = useState("WPA");
  const [hidden, setHidden] = useState("no");
  // WIFI: payload escapes \ ; , : and " with a backslash.
  const esc = (s) => String(s || "").replace(/([\\;,:"])/g, "\\$1");
  const payload = `WIFI:T:${enc === "nopass" ? "nopass" : enc};S:${esc(ssid)};${enc === "nopass" ? "" : "P:" + esc(pass) + ";"}${hidden === "yes" ? "H:true;" : ""};`;
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Network Name (SSID)</Label><Input value={ssid} onChange={setSsid} placeholder="MyNetwork" /></div>
        <div><Label>Security</Label><SelectInput value={enc} onChange={setEnc} options={[["WPA", "WPA / WPA2 / WPA3 (most routers)"], ["WEP", "WEP (old)"], ["nopass", "Open — no password"]]} style={{ width: "100%" }} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Password</Label><Input value={pass} onChange={setPass} placeholder={enc === "nopass" ? "not needed" : "network password"} /></div>
        <div><Label>Hidden Network</Label><SelectInput value={hidden} onChange={setHidden} options={[["no", "No — SSID is broadcast"], ["yes", "Yes — SSID is hidden"]]} style={{ width: "100%" }} /></div>
      </Grid2>
      <Card>
        <QRBlock text={ssid ? payload : ""} level="M" px={250} filename={"wifi-" + (ssid || "network").replace(/\s+/g, "-").toLowerCase()} />
      </Card>
      <div style={{ textAlign: "center", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 10 }}>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Print this under the code as a fallback</div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700 }}>{ssid || "—"}</div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, color: C.accent, marginTop: 2 }}>{enc === "nopass" ? "Open network" : pass || "—"}</div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>Encoded payload</Label><CopyBtn text={payload} />
        </div>
        <Result>{payload}</Result>
      </div>
      <Result mono={false}>Nothing is uploaded — the password is encoded in your browser only. iPhone (iOS 11+) and Android 10+ join straight from the camera app.</Result>
    </VStack>
  );
}

function QRCodeStudio() {
  const [type, setType] = useState("url");
  const [url, setUrl] = useState("https://toolsrift.com");
  const [text, setText] = useState("Scan me — ToolsRift makes static QR codes with no tracking.");
  const [phone, setPhone] = useState("+442079460958");
  const [smsBody, setSmsBody] = useState("Hi! I'd like to book a table.");
  const [email, setEmail] = useState("hello@example.com");
  const [subject, setSubject] = useState("Website enquiry");
  const [body, setBody] = useState("Hello,\n\n");
  const [level, setLevel] = useState("M");
  const [size, setSize] = useState("260");
  const [dark, setDark] = useState("#0F172A");
  const [light, setLight] = useState("#FFFFFF");
  const [quiet, setQuiet] = useState("4");

  let payload = "";
  if (type === "url") payload = url;
  else if (type === "text") payload = text;
  else if (type === "phone") payload = "tel:" + phone.replace(/[^\d+]/g, "");
  else if (type === "sms") payload = "sms:" + phone.replace(/[^\d+]/g, "") + (smsBody ? "?body=" + encodeURIComponent(smsBody) : "");
  else payload = "mailto:" + email.trim() + (subject || body ? "?" + [subject && "subject=" + encodeURIComponent(subject), body && "body=" + encodeURIComponent(body)].filter(Boolean).join("&") : "");

  return (
    <VStack gap={16}>
      <div><Label>QR Content Type</Label>
        <SelectInput value={type} onChange={setType} style={{ width: "100%" }} options={[["url", "🔗 Website link"], ["text", "📝 Plain text"], ["phone", "📞 Phone number (tel:)"], ["sms", "💬 SMS message"], ["email", "✉️ Email (mailto:)"]]} />
      </div>
      {type === "url" && <div><Label>URL</Label><Input value={url} onChange={setUrl} placeholder="https://example.com" /></div>}
      {type === "text" && <div><Label>Text</Label><Textarea value={text} onChange={setText} rows={4} /></div>}
      {(type === "phone" || type === "sms") && <div><Label>Phone Number (international)</Label><Input value={phone} onChange={setPhone} placeholder="+441234567890" /></div>}
      {type === "sms" && <div><Label>Pre-filled Message</Label><Textarea value={smsBody} onChange={setSmsBody} rows={3} /></div>}
      {type === "email" && <>
        <div><Label>To</Label><Input value={email} onChange={setEmail} /></div>
        <div><Label>Subject</Label><Input value={subject} onChange={setSubject} /></div>
        <div><Label>Body</Label><Textarea value={body} onChange={setBody} rows={4} /></div>
      </>}

      <Grid2>
        <div><Label>Error Correction</Label><SelectInput value={level} onChange={setLevel} style={{ width: "100%" }} options={[["L", "L — ~7% recoverable (smallest)"], ["M", "M — ~15% (recommended)"], ["Q", "Q — ~25%"], ["H", "H — ~30% (logo overlay)"]]} /></div>
        <div><Label>Preview Size</Label><SelectInput value={size} onChange={setSize} style={{ width: "100%" }} options={[["180", "Small — 180 px"], ["260", "Medium — 260 px"], ["340", "Large — 340 px"]]} /></div>
      </Grid2>
      <Grid3>
        <div><Label>Foreground</Label><input type="color" value={dark} onChange={e => setDark(e.target.value)} style={{ width: "100%", height: 38, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer" }} /></div>
        <div><Label>Background</Label><input type="color" value={light} onChange={e => setLight(e.target.value)} style={{ width: "100%", height: 38, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer" }} /></div>
        <div><Label>Quiet Zone</Label><SelectInput value={quiet} onChange={setQuiet} style={{ width: "100%" }} options={[["2", "2 modules (tight)"], ["4", "4 modules (standard)"], ["6", "6 modules (safe)"]]} /></div>
      </Grid3>

      <Card>
        <QRBlock text={payload} level={level} px={parseInt(size, 10)} dark={dark} light={light} margin={parseInt(quiet, 10)} filename="qr-code" />
      </Card>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>Encoded payload</Label><CopyBtn text={payload} />
        </div>
        <Result>{payload || "—"}</Result>
      </div>
      <Result mono={false}>Keep the contrast strong — a dark foreground on a light background scans far more reliably than the reverse. Below roughly 40% contrast most phone cameras give up.</Result>
    </VStack>
  );
}

function EmailLinkGenerator() {
  const [to, setTo] = useState("hello@example.com");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("Quote request — website design");
  const [body, setBody] = useState("Hi,\n\nI found you through your website and I'd like a quote for:\n\n- \n- \n\nThanks,\n");
  const [label, setLabel] = useState("Email us");
  const params = [];
  if (cc.trim()) params.push("cc=" + encodeURIComponent(cc.trim()));
  if (bcc.trim()) params.push("bcc=" + encodeURIComponent(bcc.trim()));
  if (subject) params.push("subject=" + encodeURIComponent(subject));
  if (body) params.push("body=" + encodeURIComponent(body));
  const link = "mailto:" + encodeURIComponent(to.trim()).replace(/%40/g, "@").replace(/%2C/gi, ",") + (params.length ? "?" + params.join("&") : "");
  const html = `<a href="${link.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">${(label || "Email us").replace(/</g, "&lt;")}</a>`;
  return (
    <VStack gap={16}>
      <div><Label>To (comma-separate several)</Label><Input value={to} onChange={setTo} /></div>
      <Grid2>
        <div><Label>CC (optional)</Label><Input value={cc} onChange={setCc} /></div>
        <div><Label>BCC (optional)</Label><Input value={bcc} onChange={setBcc} /></div>
      </Grid2>
      <div><Label>Subject</Label><Input value={subject} onChange={setSubject} /></div>
      <div><Label>Message Body (line breaks are encoded as %0A)</Label><Textarea value={body} onChange={setBody} rows={7} /></div>
      <div><Label>Link Text (for the HTML snippet)</Label><Input value={label} onChange={setLabel} /></div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>Encoded mailto: link</Label><CopyBtn text={link} />
        </div>
        <Result>{link}</Result>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>HTML anchor</Label><CopyBtn text={html} />
        </div>
        <Result>{html}</Result>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <a href={link} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), textDecoration: "none", display: "inline-block" }}>{label || "Email us"} →</a>
        <span style={{ fontSize: 12, color: C.muted }}>Click to test in your own mail client.</span>
      </div>
      <StatRow items={[["Length", link.length + " chars"], ["Recipients", to.split(",").filter(s => s.trim()).length], ["Body lines", body ? body.split("\n").length : 0]]} />
    </VStack>
  );
}

function StatRow({ items }) {
  return <Grid3>{items.map((it, i) => <StatBox key={i} value={it[1]} label={it[0]} />)}</Grid3>;
}

function SmsLinkGenerator() {
  const [num, setNum] = useState("+447700900123");
  const [msg, setMsg] = useState("Hi! I'd like to book an appointment.");
  const [label, setLabel] = useState("Text us");
  const clean = num.replace(/[^\d+]/g, "");
  const qLink = "sms:" + clean + (msg ? "?body=" + encodeURIComponent(msg) : "");
  const aLink = "sms:" + clean + (msg ? "&body=" + encodeURIComponent(msg) : "");
  const html = `<a href="${qLink.replace(/&/g, "&amp;")}">${(label || "Text us").replace(/</g, "&lt;")}</a>`;
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>Phone Number (international)</Label><Input value={num} onChange={setNum} placeholder="+447700900123" /></div>
        <div><Label>Link Text</Label><Input value={label} onChange={setLabel} /></div>
      </Grid2>
      <div><Label>Pre-filled Message</Label><Textarea value={msg} onChange={setMsg} rows={4} /></div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>Standard link (?body — widest support)</Label><CopyBtn text={qLink} />
        </div>
        <Result>{qLink}</Result>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>Legacy iOS variant (&amp;body)</Label><CopyBtn text={aLink} />
        </div>
        <Result>{aLink}</Result>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>HTML anchor</Label><CopyBtn text={html} />
        </div>
        <Result>{html}</Result>
      </div>
      <Card><QRBlock text={qLink} level="M" px={220} filename="sms-link" /></Card>
      {!/^\+\d{6,}$/.test(clean) && <Result mono={false}>⚠️ Write the number in full international form starting with + and digits only, or it will fail for anyone outside your country.</Result>}
    </VStack>
  );
}

function WhatsAppLinkGenerator() {
  const [num, setNum] = useState("919876543210");
  const [msg, setMsg] = useState("Hi! I saw your website and I'd like to know more about your pricing.");
  const [label, setLabel] = useState("Chat on WhatsApp");
  const clean = num.replace(/\D/g, "").replace(/^0+/, "");
  const link = "https://wa.me/" + clean + (msg ? "?text=" + encodeURIComponent(msg) : "");
  const html = `<a href="${link.replace(/&/g, "&amp;")}" target="_blank" rel="noopener">${(label || "Chat on WhatsApp").replace(/</g, "&lt;")}</a>`;
  const valid = clean.length >= 8 && clean.length <= 15;
  return (
    <VStack gap={16}>
      <Grid2>
        <div><Label>WhatsApp Number (country code, digits only)</Label><Input value={num} onChange={setNum} placeholder="919876543210" /></div>
        <div><Label>Button Text</Label><Input value={label} onChange={setLabel} /></div>
      </Grid2>
      <div><Label>Pre-filled Message</Label><Textarea value={msg} onChange={setMsg} rows={4} /></div>
      <div style={{ padding: "10px 12px", borderRadius: 8, background: valid ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.1)", border: `1px solid ${valid ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.3)"}`, fontSize: 12, color: valid ? "#34D399" : "#FCA5A5" }}>
        {valid ? `✓ Number normalised to ${clean} — no plus sign, no spaces, no leading zero, which is exactly what wa.me needs.` : "⚠️ WhatsApp needs the full international number in digits only (country code first, no + and no leading 0). Right now that is not valid."}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>Click-to-chat link</Label><CopyBtn text={link} />
        </div>
        <Result>{link}</Result>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>HTML button</Label><CopyBtn text={html} />
        </div>
        <Result>{html}</Result>
      </div>
      <Card><QRBlock text={link} level="M" px={230} dark="#075E54" filename="whatsapp-link" /></Card>
    </VStack>
  );
}

function PhoneLinkGenerator() {
  const [num, setNum] = useState("+44 20 7946 0958");
  const [ext, setExt] = useState("");
  const [label, setLabel] = useState("Call us");
  const clean = num.replace(/[^\d+]/g, "") + (ext.trim() ? ",," + ext.replace(/\D/g, "") : "");
  const link = "tel:" + clean;
  const html = `<a href="${link}">${(label || "Call us").replace(/</g, "&lt;")}</a>`;
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Phone Number</Label><Input value={num} onChange={setNum} placeholder="+44 20 7946 0958" /></div>
        <div><Label>Extension (optional)</Label><Input value={ext} onChange={setExt} placeholder="123" /></div>
        <div><Label>Link Text</Label><Input value={label} onChange={setLabel} /></div>
      </Grid3>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>tel: link (punctuation stripped for dialer safety)</Label><CopyBtn text={link} />
        </div>
        <Result>{link}</Result>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Label>HTML anchor</Label><CopyBtn text={html} />
        </div>
        <Result>{html}</Result>
      </div>
      <Card><QRBlock text={link} level="M" px={230} filename="call-link" /></Card>
      <Result mono={false}>{ext.trim() ? "Each comma is roughly a two-second pause before the extension tones are sent." : "Add an extension above and it is appended after a pause, e.g. tel:+442079460958,,123."}</Result>
    </VStack>
  );
}

function ContactListFormatter() {
  const [raw, setRaw] = useState("Priya Sharma, +91 98765 43210, priya@riftstudio.in, Rift Studio\nTom Bennett; tom.bennett@northgate.co.uk; +44 7700 900123; Northgate Ltd\nMeera Iyer\t+91 90000 11122\tmeera@vaultworks.in\tVaultWorks\nDaniel Okoro , daniel@okorodesign.com , +234 802 555 0199");
  const parsed = raw.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
    const parts = line.split(/[\t;,|]+/).map(s => s.trim()).filter(Boolean);
    const rec = { name: "", phone: "", email: "", company: "" };
    const rest = [];
    for (const p of parts) {
      if (!rec.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)) rec.email = p;
      else if (!rec.phone && /^[+()\d][\d\s().-]{5,}$/.test(p)) rec.phone = p.replace(/\s+/g, " ");
      else rest.push(p);
    }
    rec.name = rest.shift() || "";
    rec.company = rest.join(" ").trim();
    return rec;
  });
  const formatted = parsed.map(r => [r.name, r.phone, r.email, r.company].filter(Boolean).join(" · ")).join("\n");
  const vcf = parsed.filter(r => r.name || r.email).map(r => {
    const bits = r.name.split(/\s+/);
    return buildVCard({ first: bits.slice(0, -1).join(" ") || bits[0] || "", last: bits.length > 1 ? bits[bits.length - 1] : "", mobile: r.phone, email: r.email, company: r.company });
  }).join("");
  return (
    <VStack gap={16}>
      <div><Label>Paste contacts — one per line, fields split by comma, semicolon or tab</Label>
        <Textarea value={raw} onChange={setRaw} rows={9} mono />
      </div>
      <StatRow items={[["Contacts", parsed.length], ["With email", parsed.filter(r => r.email).length], ["With phone", parsed.filter(r => r.phone).length]]} />
      {parsed.length > 0 ? (
        <>
          <DataTable columns={["Name", "Phone", "Email", "Company"]} rows={parsed.map(r => [r.name || "—", r.phone || "—", r.email || "—", r.company || "—"])} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <CopyBtn text={formatted} />
            <Btn size="sm" variant="secondary" onClick={() => downloadBlob("contacts.txt", "text/plain;charset=utf-8", formatted)}>⬇ .txt</Btn>
            <Btn size="sm" onClick={() => downloadBlob("contacts.vcf", "text/vcard;charset=utf-8", foldLines(vcf))}>⬇ {parsed.length} contacts as .vcf</Btn>
          </div>
          <div><Label>Clean list</Label><Result>{formatted}</Result></div>
        </>
      ) : <Result mono={false}>Paste at least one contact row above.</Result>}
      <Result mono={false}>Emails and phone numbers are detected by shape, so the column order does not have to be consistent. Everything is parsed in your browser — no contact data is uploaded.</Result>
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PLANNING TOOLS
// ══════════════════════════════════════════════════════════════════════════════

function NativeInput({ type, value, onChange, min, max, step, style = {} }) {
  return (
    <input type={type} value={value} min={min} max={max} step={step} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", colorScheme: "dark", ...style }} />
  );
}

const pad2 = n => String(n).padStart(2, "0");
const isoToday = (offsetDays = 0) => { const d = new Date(); d.setDate(d.getDate() + offsetDays); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

// Offset (minutes) of a named IANA zone at a given UTC instant.
function zoneOffsetMinutes(tz, instant) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(instant).reduce((a, p) => { a[p.type] = p.value; return a; }, {});
    const asUTC = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour % 24, +parts.minute, +parts.second);
    return (asUTC - instant.getTime()) / 60000;
  } catch (e) { return 0; }
}
// Wall-clock time in a zone → the true UTC instant (two-pass, DST-safe).
function zonedToUTC(y, mo, d, h, mi, tz) {
  const naive = Date.UTC(y, mo - 1, d, h, mi, 0);
  let ms = naive;
  for (let i = 0; i < 2; i++) ms = naive - zoneOffsetMinutes(tz, new Date(ms)) * 60000;
  return new Date(ms);
}
const icsStamp = (dt) => dt.getUTCFullYear() + pad2(dt.getUTCMonth() + 1) + pad2(dt.getUTCDate()) + "T" + pad2(dt.getUTCHours()) + pad2(dt.getUTCMinutes()) + pad2(dt.getUTCSeconds()) + "Z";

const TZ_LIST = ["UTC", "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Sao_Paulo", "Africa/Lagos", "Africa/Johannesburg"];

function ICalEventGenerator() {
  const [title, setTitle] = useState("Q3 Planning Workshop");
  const [loc, setLoc] = useState("Rift Studio, Banjara Hills, Hyderabad");
  const [date, setDate] = useState(isoToday(7));
  const [start, setStart] = useState("10:00");
  const [endDate, setEndDate] = useState(isoToday(7));
  const [end, setEnd] = useState("12:30");
  const [tz, setTz] = useState("Asia/Kolkata");
  const [allDay, setAllDay] = useState("no");
  const [desc, setDesc] = useState("Agenda:\n1. Review Q2 results\n2. Set Q3 objectives\n3. Resourcing");
  const [alarm, setAlarm] = useState("PT30M");
  const [organizer, setOrganizer] = useState("");
  const [err, setErr] = useState(null);

  const build = () => {
    try {
      const [y, mo, d] = date.split("-").map(Number);
      const [ey, emo, ed] = (endDate || date).split("-").map(Number);
      if (!y || !mo || !d) throw new Error("Pick a valid start date.");
      const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ToolsRift//Office Tools//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "BEGIN:VEVENT"];
      L.push("UID:" + uid() + "@toolsrift.com");
      L.push("DTSTAMP:" + icsStamp(new Date()));
      if (allDay === "yes") {
        const next = new Date(Date.UTC(ey, emo - 1, ed + 1));
        L.push(`DTSTART;VALUE=DATE:${y}${pad2(mo)}${pad2(d)}`);
        L.push(`DTEND;VALUE=DATE:${next.getUTCFullYear()}${pad2(next.getUTCMonth() + 1)}${pad2(next.getUTCDate())}`);
      } else {
        const [sh, sm] = start.split(":").map(Number);
        const [eh, em] = end.split(":").map(Number);
        const s = zonedToUTC(y, mo, d, sh, sm, tz);
        const e = zonedToUTC(ey, emo, ed, eh, em, tz);
        if (e <= s) throw new Error("The end time must be after the start time.");
        L.push("DTSTART:" + icsStamp(s));
        L.push("DTEND:" + icsStamp(e));
      }
      L.push("SUMMARY:" + icsEsc(title));
      if (loc) L.push("LOCATION:" + icsEsc(loc));
      if (desc) L.push("DESCRIPTION:" + icsEsc(desc));
      if (organizer.trim()) L.push("ORGANIZER;CN=" + icsEsc(organizer.split("<")[0].trim()) + ":mailto:" + (organizer.match(/<(.+)>/) ? organizer.match(/<(.+)>/)[1] : organizer.trim()));
      L.push("STATUS:CONFIRMED", "TRANSP:OPAQUE");
      if (alarm !== "none") L.push("BEGIN:VALARM", "TRIGGER:-" + alarm, "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(title || "Reminder"), "END:VALARM");
      L.push("END:VEVENT", "END:VCALENDAR");
      setErr(null);
      return L.join("\r\n") + "\r\n";
    } catch (e) { setErr(e.message); return ""; }
  };
  const ics = build();
  const fname = (title || "event").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "event";
  return (
    <VStack gap={16}>
      <div><Label>Event Title</Label><Input value={title} onChange={setTitle} /></div>
      <div><Label>Location</Label><Input value={loc} onChange={setLoc} /></div>
      <Grid2>
        <div><Label>All-day Event</Label><SelectInput value={allDay} onChange={setAllDay} style={{ width: "100%" }} options={[["no", "No — timed event"], ["yes", "Yes — all day"]]} /></div>
        <div><Label>Timezone</Label><SelectInput value={tz} onChange={setTz} style={{ width: "100%" }} options={TZ_LIST} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Start Date</Label><NativeInput type="date" value={date} onChange={v => { setDate(v); if (endDate < v) setEndDate(v); }} /></div>
        <div><Label>End Date</Label><NativeInput type="date" value={endDate} onChange={setEndDate} /></div>
      </Grid2>
      {allDay === "no" && (
        <Grid2>
          <div><Label>Start Time</Label><NativeInput type="time" value={start} onChange={setStart} /></div>
          <div><Label>End Time</Label><NativeInput type="time" value={end} onChange={setEnd} /></div>
        </Grid2>
      )}
      <Grid2>
        <div><Label>Reminder</Label><SelectInput value={alarm} onChange={setAlarm} style={{ width: "100%" }} options={[["none", "No reminder"], ["PT10M", "10 minutes before"], ["PT30M", "30 minutes before"], ["PT1H", "1 hour before"], ["P1D", "1 day before"], ["P1W", "1 week before"]]} /></div>
        <div><Label>Organizer (optional)</Label><Input value={organizer} onChange={setOrganizer} placeholder="Priya Sharma <priya@example.com>" /></div>
      </Grid2>
      <div><Label>Description</Label><Textarea value={desc} onChange={setDesc} rows={5} /></div>
      {err && <Result mono={false}>⚠️ {err}</Result>}
      {ics && (
        <>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <CopyBtn text={ics} />
            <Btn onClick={() => downloadBlob(fname + ".ics", "text/calendar;charset=utf-8", foldLines(ics))}>⬇ Download .ics</Btn>
          </div>
          <div><Label>RFC 5545 output</Label><Result>{ics}</Result></div>
          <Result mono={false}>Times are converted from {tz} to UTC and written with a trailing Z, which every calendar app interprets identically — no VTIMEZONE guesswork.</Result>
        </>
      )}
    </VStack>
  );
}

function QuickNotepad() {
  const [note, setNote, storeErr, ready] = useLocalState("notepad", "Meeting notes — 23 July\n\n• \n• \n");
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!ready) return;
    setSaved(false);
    const t = setTimeout(() => setSaved(true), 600);
    return () => clearTimeout(t);
  }, [note, ready]);
  const words = note.trim() ? note.trim().split(/\s+/).length : 0;
  const lines = note ? note.split("\n").length : 0;
  return (
    <VStack gap={14}>
      <LocalDataNotice error={storeErr} />
      <Textarea value={note} onChange={setNote} rows={18} mono placeholder="Start typing — your note saves itself…" />
      <Grid3>
        <StatBox value={words} label="Words" />
        <StatBox value={note.length} label="Characters" />
        <StatBox value={lines} label="Lines" />
      </Grid3>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: saved ? C.success : C.muted }}>{saved ? "✓ Saved to this browser" : "…typing"}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <CopyBtn text={note} />
          <Btn size="sm" variant="secondary" onClick={() => { if (window.confirm("Clear the whole note? This cannot be undone.")) setNote(""); }}>Clear</Btn>
          <Btn size="sm" onClick={() => downloadBlob("note-" + isoToday() + ".txt", "text/plain;charset=utf-8", note)}>⬇ Download .txt</Btn>
        </div>
      </div>
    </VStack>
  );
}

function TodoListMaker() {
  const [items, setItems, storeErr] = useLocalState("todo", [
    { id: "a1", text: "Send the Q3 proposal to Northgate", done: false },
    { id: "a2", text: "Book the venue for the workshop", done: true },
    { id: "a3", text: "Review design handoff", done: false },
  ]);
  const [title, setTitle] = useLocalState("todo_title", "My To-Do List");
  const [draft, setDraft] = useState("");
  usePrintStyle("A4 portrait", "18mm");
  const add = () => { if (!draft.trim()) return; setItems(it => it.concat([{ id: uid(), text: draft.trim(), done: false }])); setDraft(""); };
  const toggle = id => setItems(it => it.map(x => x.id === id ? Object.assign({}, x, { done: !x.done }) : x));
  const del = id => setItems(it => it.filter(x => x.id !== id));
  const move = (i, d) => setItems(it => { const a = it.slice(); const j = i + d; if (j < 0 || j >= a.length) return a; const t = a[i]; a[i] = a[j]; a[j] = t; return a; });
  const done = items.filter(i => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const asText = items.map(i => (i.done ? "[x] " : "[ ] ") + i.text).join("\n");
  return (
    <VStack gap={14}>
      <LocalDataNotice error={storeErr} />
      <div><Label>List Title</Label><Input value={title} onChange={setTitle} /></div>
      <div style={{ display: "flex", gap: 8 }}>
        <Input value={draft} onChange={setDraft} placeholder="Add a task and press Enter…" style={{ flex: 1 }} />
        <Btn onClick={add}>+ Add</Btn>
      </div>
      <div className="tr-noprint" style={{ display: "none" }} />
      <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: `linear-gradient(90deg,${C.accent},${C.success})`, transition: "width .25s" }} />
      </div>
      <div style={{ fontSize: 12, color: C.muted }}>{done} of {items.length} done · {pct}%</div>
      <VStack gap={8}>
        {items.map((it, i) => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
            <input type="checkbox" checked={it.done} onChange={() => toggle(it.id)} style={{ width: 17, height: 17, accentColor: C.accent, cursor: "pointer" }} />
            <span style={{ flex: 1, fontSize: 14, color: it.done ? C.muted : C.text, textDecoration: it.done ? "line-through" : "none" }}>{it.text}</span>
            <button onClick={() => move(i, -1)} title="Move up" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>↑</button>
            <button onClick={() => move(i, 1)} title="Move down" style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14 }}>↓</button>
            <button onClick={() => del(it.id)} title="Delete" style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", fontSize: 15 }}>✕</button>
          </div>
        ))}
        {items.length === 0 && <Result mono={false}>Your list is empty — add a task above.</Result>}
      </VStack>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <CopyBtn text={asText} />
        <Btn size="sm" variant="secondary" onClick={() => downloadBlob("todo-list.txt", "text/plain;charset=utf-8", title + "\n\n" + asText)}>⬇ Export .txt</Btn>
        <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Remove all completed tasks?")) setItems(it => it.filter(x => !x.done)); }}>Clear done</Btn>
      </div>
      <PrintBar note="Printing gives you a clean tick-box sheet with no site navigation." />
      <PaperSheet wmm={210} hmm={297} zoom={0.52} pad={16} flow>
        <div style={{ fontFamily: "Georgia,serif", fontSize: "20pt", fontWeight: 700, marginBottom: "2mm" }}>{title}</div>
        <div style={{ fontSize: "9pt", color: "#6B7280", marginBottom: "8mm" }}>{items.length} tasks · printed from toolsrift.com</div>
        {items.map(it => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: "4mm", padding: "3mm 0", borderBottom: "1px solid #E5E7EB", fontSize: "12pt" }}>
            <span style={{ width: "5mm", height: "5mm", border: "1.5pt solid #111827", borderRadius: "1mm", display: "inline-block", flexShrink: 0, textAlign: "center", lineHeight: "4mm", fontSize: "9pt" }}>{it.done ? "✓" : ""}</span>
            <span style={{ textDecoration: it.done ? "line-through" : "none", color: it.done ? "#6B7280" : "#111827" }}>{it.text}</span>
          </div>
        ))}
      </PaperSheet>
    </VStack>
  );
}

const KANBAN_COLS = [["todo", "To Do", "#3B82F6"], ["doing", "Doing", "#F59E0B"], ["done", "Done", "#10B981"]];
function KanbanBoard() {
  const [cards, setCards, storeErr] = useLocalState("kanban", [
    { id: "k1", text: "Draft the client brief", col: "todo" },
    { id: "k2", text: "Wireframe the pricing page", col: "todo" },
    { id: "k3", text: "Build the onboarding email", col: "doing" },
    { id: "k4", text: "Ship the analytics fix", col: "done" },
  ]);
  const [draft, setDraft] = useState("");
  const [col, setCol] = useState("todo");
  const add = () => { if (!draft.trim()) return; setCards(c => c.concat([{ id: uid(), text: draft.trim(), col }])); setDraft(""); };
  const move = (id, dir) => setCards(cs => cs.map(c => {
    if (c.id !== id) return c;
    const i = KANBAN_COLS.findIndex(k => k[0] === c.col);
    const j = Math.max(0, Math.min(KANBAN_COLS.length - 1, i + dir));
    return Object.assign({}, c, { col: KANBAN_COLS[j][0] });
  }));
  const del = id => setCards(cs => cs.filter(c => c.id !== id));
  const asText = KANBAN_COLS.map(k => k[1] + ":\n" + cards.filter(c => c.col === k[0]).map(c => "  - " + c.text).join("\n")).join("\n\n");
  return (
    <VStack gap={14}>
      <LocalDataNotice error={storeErr} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Input value={draft} onChange={setDraft} placeholder="New card…" style={{ flex: 1, minWidth: 180 }} />
        <SelectInput value={col} onChange={setCol} options={KANBAN_COLS.map(k => [k[0], k[1]])} />
        <Btn onClick={add}>+ Add Card</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
        {KANBAN_COLS.map(([id, name, color], ci) => {
          const list = cards.filter(c => c.col === id);
          return (
            <div key={id} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, minHeight: 160 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color }}>{name}</span>
                <span style={{ fontSize: 11, color: C.muted, background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 20 }}>{list.length}</span>
              </div>
              <VStack gap={8}>
                {list.map(c => (
                  <div key={c.id} style={{ background: C.surface, border: `1px solid ${color}44`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "9px 10px" }}>
                    <div style={{ fontSize: 13, color: C.text, marginBottom: 6, lineHeight: 1.45 }}>{c.text}</div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button onClick={() => move(c.id, -1)} disabled={ci === 0} style={{ background: "none", border: "none", color: ci === 0 ? "#334155" : C.muted, cursor: ci === 0 ? "default" : "pointer", fontSize: 13 }}>←</button>
                      <button onClick={() => move(c.id, 1)} disabled={ci === KANBAN_COLS.length - 1} style={{ background: "none", border: "none", color: ci === KANBAN_COLS.length - 1 ? "#334155" : C.muted, cursor: ci === KANBAN_COLS.length - 1 ? "default" : "pointer", fontSize: 13 }}>→</button>
                      <button onClick={() => del(c.id)} style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", fontSize: 13 }}>✕</button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div style={{ fontSize: 12, color: "#334155", textAlign: "center", padding: "14px 0" }}>Empty</div>}
              </VStack>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <CopyBtn text={asText} />
        <Btn size="sm" variant="secondary" onClick={() => downloadBlob("kanban-board.txt", "text/plain;charset=utf-8", asText)}>⬇ Export .txt</Btn>
        <Btn size="sm" variant="danger" onClick={() => { if (window.confirm("Delete every card on the board?")) setCards([]); }}>Clear board</Btn>
      </div>
    </VStack>
  );
}

function ChecklistMaker() {
  const [title, setTitle] = useState("Event Setup Checklist");
  const [sub, setSub] = useState("Rift Studio · Q3 Workshop");
  const [raw, setRaw] = useState("# Before the day\nConfirm the venue booking\nPrint name badges\nTest the projector and adapters\nOrder catering for 24 people\n\n# On the day\nSet out chairs and tables\nCheck the WiFi QR code works\nLay out badges alphabetically\n\n# After\nCollect feedback forms\nSend thank-you email");
  const [paper, setPaper] = useState("a4p");
  const [notes, setNotes] = useState("yes");
  const [dense, setDense] = useState("normal");
  const [w, h, pageName] = PAPER[paper];
  usePrintStyle(pageName, "14mm");
  const rows = raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => l.startsWith("#") ? { head: l.replace(/^#+\s*/, "") } : { item: l });
  const rowPad = dense === "tight" ? "2mm" : dense === "airy" ? "5mm" : "3.4mm";
  return (
    <VStack gap={14}>
      <Grid2>
        <div><Label>Title</Label><Input value={title} onChange={setTitle} /></div>
        <div><Label>Subtitle</Label><Input value={sub} onChange={setSub} /></div>
      </Grid2>
      <div><Label>Items — one per line, prefix a line with # for a section heading</Label><Textarea value={raw} onChange={setRaw} rows={10} /></div>
      <Grid3>
        <div><Label>Paper</Label><SelectInput value={paper} onChange={setPaper} style={{ width: "100%" }} options={[["a4p", "A4 portrait"], ["ltp", "Letter portrait"]]} /></div>
        <div><Label>Notes Column</Label><SelectInput value={notes} onChange={setNotes} style={{ width: "100%" }} options={[["yes", "Show notes column"], ["no", "Hide"]]} /></div>
        <div><Label>Row Spacing</Label><SelectInput value={dense} onChange={setDense} style={{ width: "100%" }} options={[["tight", "Tight"], ["normal", "Normal"], ["airy", "Airy"]]} /></div>
      </Grid3>
      <StatRow items={[["Items", rows.filter(r => r.item).length], ["Sections", rows.filter(r => r.head).length], ["Paper", pageName]]} />
      <PrintBar />
      <PaperSheet wmm={w} hmm={h} zoom={0.52} pad={14} flow>
        <div style={{ borderBottom: "2pt solid #111827", paddingBottom: "3mm", marginBottom: "6mm" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "20pt", fontWeight: 700 }}>{title}</div>
          {sub && <div style={{ fontSize: "10pt", color: "#4B5563", marginTop: "1mm" }}>{sub}</div>}
        </div>
        {rows.map((r, i) => r.head ? (
          <div key={i} style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#374151", margin: (i === 0 ? "0" : "5mm") + " 0 2mm" }}>{r.head}</div>
        ) : (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "4mm", padding: rowPad + " 0", borderBottom: "0.5pt solid #D1D5DB", fontSize: "11pt" }}>
            <span style={{ width: "4.5mm", height: "4.5mm", border: "1pt solid #111827", borderRadius: "0.8mm", flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{r.item}</span>
            {notes === "yes" && <span style={{ width: "45mm", borderBottom: "0.5pt dotted #9CA3AF", height: "4mm" }} />}
          </div>
        ))}
        <div style={{ marginTop: "8mm", fontSize: "7.5pt", color: "#9CA3AF", textAlign: "right" }}>toolsrift.com/office/checklist-maker</div>
      </PaperSheet>
    </VStack>
  );
}

function MeetingCostCalculator() {
  const [people, setPeople] = useState("8");
  const [rate, setRate] = useState("55");
  const [mins, setMins] = useState("60");
  const [cur, setCur] = useState("$");
  const [freq, setFreq] = useState("52");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const n = Math.max(0, parseFloat(people) || 0);
  const r = Math.max(0, parseFloat(rate) || 0);
  const m = Math.max(0, parseFloat(mins) || 0);
  const perMin = (n * r) / 60;
  const cost = perMin * m;
  const annual = cost * (parseFloat(freq) || 0);
  const live = perMin * (elapsed / 60);
  const fmt = (v) => cur + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Attendees</Label><Input value={people} onChange={setPeople} /></div>
        <div><Label>Avg Hourly Rate</Label><Input value={rate} onChange={setRate} /></div>
        <div><Label>Duration (minutes)</Label><Input value={mins} onChange={setMins} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Currency Symbol</Label><SelectInput value={cur} onChange={setCur} style={{ width: "100%" }} options={[["$", "$ USD"], ["€", "€ EUR"], ["£", "£ GBP"], ["₹", "₹ INR"], ["A$", "A$ AUD"], ["¥", "¥ JPY"]]} /></div>
        <div><Label>Repeats</Label><SelectInput value={freq} onChange={setFreq} style={{ width: "100%" }} options={[["0", "One-off"], ["52", "Weekly (52/yr)"], ["26", "Fortnightly (26/yr)"], ["12", "Monthly (12/yr)"], ["250", "Daily on workdays (250/yr)"]]} /></div>
      </Grid2>
      {n > 0 && r > 0 && m > 0 ? (
        <>
          <BigResult value={fmt(cost)} label={`Cost of one ${m}-minute meeting with ${n} people`} />
          <Grid3>
            <StatBox value={fmt(perMin)} label="Per minute" />
            <StatBox value={fmt(perMin * 60)} label="Per hour" />
            <StatBox value={(n * m / 60).toFixed(1) + " h"} label="Person-hours" />
          </Grid3>
          {parseFloat(freq) > 0 && <BigResult value={fmt(annual)} label={`Annual cost if it runs ${freq} times a year`} />}
        </>
      ) : <Result mono={false}>Enter attendees, an hourly rate and a duration greater than zero.</Result>}
      <Card>
        <Label>Live meeting timer</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 700, color: C.accent }}>{fmt(live)}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{Math.floor(elapsed / 60)}m {elapsed % 60}s elapsed</div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <Btn size="sm" onClick={() => setRunning(x => !x)}>{running ? "⏸ Pause" : "▶ Start"}</Btn>
            <Btn size="sm" variant="secondary" onClick={() => { setRunning(false); setElapsed(0); }}>Reset</Btn>
          </div>
        </div>
      </Card>
      <Result mono={false}>Use a fully loaded rate — salary plus roughly 25-35% for tax, benefits and overhead, divided by about 1,800 working hours. Bare salary understates the real cost by a third.</Result>
    </VStack>
  );
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function WeeklyPlannerPrintable() {
  const [title, setTitle] = useState("Week Planner");
  const [startH, setStartH] = useState("8");
  const [endH, setEndH] = useState("18");
  const [slot, setSlot] = useState("60");
  const [weekStart, setWeekStart] = useState("1");
  const [paper, setPaper] = useState("a4l");
  const [notesCol, setNotesCol] = useState("yes");
  const [w, h, pageName] = PAPER[paper];
  usePrintStyle(pageName, "10mm");
  const sh = Math.max(0, Math.min(23, parseInt(startH, 10) || 0));
  const eh = Math.max(sh + 1, Math.min(24, parseInt(endH, 10) || 24));
  const step = parseInt(slot, 10) || 60;
  const slots = [];
  for (let t = sh * 60; t + step <= eh * 60; t += step) slots.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
  const days = [];
  for (let i = 0; i < 7; i++) days.push(DAY_NAMES[(parseInt(weekStart, 10) + i) % 7]);
  const cols = days.length + (notesCol === "yes" ? 1 : 0);
  return (
    <VStack gap={14}>
      <Grid2>
        <div><Label>Title</Label><Input value={title} onChange={setTitle} /></div>
        <div><Label>Week Starts On</Label><SelectInput value={weekStart} onChange={setWeekStart} style={{ width: "100%" }} options={[["1", "Monday (ISO, Europe, India)"], ["0", "Sunday (US, Canada, Japan)"]]} /></div>
      </Grid2>
      <Grid3>
        <div><Label>Start Hour</Label><Input value={startH} onChange={setStartH} /></div>
        <div><Label>End Hour</Label><Input value={endH} onChange={setEndH} /></div>
        <div><Label>Slot Length</Label><SelectInput value={slot} onChange={setSlot} style={{ width: "100%" }} options={[["15", "15 minutes"], ["30", "30 minutes"], ["60", "1 hour"]]} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Paper</Label><SelectInput value={paper} onChange={setPaper} style={{ width: "100%" }} options={[["a4l", "A4 landscape"], ["ltl", "Letter landscape"], ["a4p", "A4 portrait"]]} /></div>
        <div><Label>Notes Column</Label><SelectInput value={notesCol} onChange={setNotesCol} style={{ width: "100%" }} options={[["yes", "Show notes column"], ["no", "Hide"]]} /></div>
      </Grid2>
      <StatRow items={[["Time slots", slots.length], ["Cells", slots.length * cols], ["Paper", pageName]]} />
      <PrintBar note="Landscape fits the whole week comfortably. Keep the print scale at 100%." />
      <PaperSheet wmm={w} hmm={h} zoom={0.45} pad={10}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "3mm" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "16pt", fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: "8pt", color: "#6B7280" }}>Week of ____ / ____ / ______</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: slots.length > 20 ? "6pt" : "7.5pt" }}>
          <thead>
            <tr>
              <th style={{ width: "14mm", border: "0.5pt solid #9CA3AF", background: "#F3F4F6", padding: "1mm", fontSize: "7pt" }}>Time</th>
              {days.map(d => <th key={d} style={{ border: "0.5pt solid #9CA3AF", background: "#F3F4F6", padding: "1mm", fontSize: "7.5pt" }}>{d}</th>)}
              {notesCol === "yes" && <th style={{ border: "0.5pt solid #9CA3AF", background: "#F3F4F6", padding: "1mm", fontSize: "7.5pt", width: "26mm" }}>Notes</th>}
            </tr>
          </thead>
          <tbody>
            {slots.map((t, i) => (
              <tr key={t}>
                <td style={{ border: "0.5pt solid #9CA3AF", padding: "1mm", textAlign: "center", background: "#FAFAFA", fontFamily: "monospace" }}>{t}</td>
                {days.map(d => <td key={d} style={{ border: "0.5pt solid #D1D5DB", height: slots.length > 20 ? "5mm" : "7mm", background: (d === "Saturday" || d === "Sunday") ? "#F9FAFB" : "#fff" }} />)}
                {notesCol === "yes" && <td style={{ border: "0.5pt solid #D1D5DB", background: "#fff" }} />}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "2mm", fontSize: "6.5pt", color: "#9CA3AF", textAlign: "right" }}>toolsrift.com — free printable planners</div>
      </PaperSheet>
    </VStack>
  );
}

function MonthlyCalendarPrintable() {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth()));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [weekStart, setWeekStart] = useState("1");
  const [notesCol, setNotesCol] = useState("yes");
  const [paper, setPaper] = useState("a4l");
  const [w, h, pageName] = PAPER[paper];
  usePrintStyle(pageName, "10mm");
  const y = parseInt(year, 10) || now.getFullYear();
  const mo = parseInt(month, 10) || 0;
  const ws = parseInt(weekStart, 10);
  const first = new Date(y, mo, 1);
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const lead = (first.getDay() - ws + 7) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const heads = [];
  for (let i = 0; i < 7; i++) heads.push(DAY_NAMES[(ws + i) % 7]);
  const monthName = first.toLocaleString("en-US", { month: "long" });
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return (
    <VStack gap={14}>
      <Grid3>
        <div><Label>Month</Label><SelectInput value={month} onChange={setMonth} style={{ width: "100%" }} options={DAY_NAMES.length ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((n, i) => [String(i), n]) : []} /></div>
        <div><Label>Year</Label><Input value={year} onChange={setYear} /></div>
        <div><Label>Week Starts On</Label><SelectInput value={weekStart} onChange={setWeekStart} style={{ width: "100%" }} options={[["1", "Monday"], ["0", "Sunday"]]} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Paper</Label><SelectInput value={paper} onChange={setPaper} style={{ width: "100%" }} options={[["a4l", "A4 landscape"], ["a4p", "A4 portrait"], ["ltl", "Letter landscape"]]} /></div>
        <div><Label>Notes Column</Label><SelectInput value={notesCol} onChange={setNotesCol} style={{ width: "100%" }} options={[["yes", "Show notes column"], ["no", "Hide"]]} /></div>
      </Grid2>
      <StatRow items={[["Days", daysInMonth], ["Weeks shown", weeks.length], [isLeap ? "Leap year" : "Common year", y]]} />
      <PrintBar />
      <PaperSheet wmm={w} hmm={h} zoom={0.45} pad={10}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4mm" }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "22pt", fontWeight: 700 }}>{monthName} <span style={{ color: "#6B7280", fontWeight: 400 }}>{y}</span></div>
          <div style={{ fontSize: "8pt", color: "#9CA3AF" }}>toolsrift.com</div>
        </div>
        <div style={{ display: "flex", gap: "4mm" }}>
          <table style={{ flex: 1, borderCollapse: "collapse", tableLayout: "fixed", fontSize: "8pt" }}>
            <thead>
              <tr>{heads.map(d => <th key={d} style={{ border: "0.5pt solid #9CA3AF", background: "#F3F4F6", padding: "1.5mm", fontSize: "8pt" }}>{d.slice(0, 3)}</th>)}</tr>
            </thead>
            <tbody>
              {weeks.map((wk, i) => (
                <tr key={i}>
                  {wk.map((d, j) => {
                    const dow = (ws + j) % 7;
                    return (
                      <td key={j} style={{ border: "0.5pt solid #D1D5DB", height: weeks.length > 5 ? "16mm" : "19mm", verticalAlign: "top", padding: "1mm", background: (dow === 0 || dow === 6) ? "#F9FAFB" : "#fff" }}>
                        <span style={{ fontSize: "9pt", fontWeight: 700, color: d ? ((dow === 0 || dow === 6) ? "#9CA3AF" : "#111827") : "transparent" }}>{d || ""}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {notesCol === "yes" && (
            <div style={{ width: "42mm", border: "0.5pt solid #9CA3AF" }}>
              <div style={{ background: "#F3F4F6", borderBottom: "0.5pt solid #9CA3AF", padding: "1.5mm", fontSize: "8pt", fontWeight: 700, textAlign: "center" }}>Notes</div>
              {Array.from({ length: 16 }).map((_, i) => <div key={i} style={{ borderBottom: "0.4pt dotted #C7CBD1", height: "6.5mm" }} />)}
            </div>
          )}
        </div>
      </PaperSheet>
    </VStack>
  );
}

function CountdownToDate() {
  const [name, setName] = useState("Product Launch");
  const [date, setDate] = useState(isoToday(30));
  const [time, setTime] = useState("09:00");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const target = new Date(date + "T" + (time || "00:00") + ":00");
  const valid = !isNaN(target.getTime());
  const diff = valid ? target.getTime() - now : 0;
  const past = diff < 0;
  const abs = Math.abs(diff);
  const d = Math.floor(abs / 86400000);
  const hh = Math.floor((abs % 86400000) / 3600000);
  const mm = Math.floor((abs % 3600000) / 60000);
  const ss = Math.floor((abs % 60000) / 1000);
  let workdays = 0;
  if (valid) {
    const a = new Date(Math.min(now, target.getTime())), b = new Date(Math.max(now, target.getTime()));
    a.setHours(0, 0, 0, 0);
    for (let cur = new Date(a); cur < b; cur.setDate(cur.getDate() + 1)) { const w = cur.getDay(); if (w !== 0 && w !== 6) workdays++; }
  }
  const summary = valid ? `${name || "Event"} — ${past ? "was" : "is"} ${d} days, ${hh} hours and ${mm} minutes ${past ? "ago" : "away"} (${target.toLocaleString()})` : "";
  return (
    <VStack gap={16}>
      <div><Label>Event Name</Label><Input value={name} onChange={setName} /></div>
      <Grid2>
        <div><Label>Target Date</Label><NativeInput type="date" value={date} onChange={setDate} /></div>
        <div><Label>Target Time</Label><NativeInput type="time" value={time} onChange={setTime} /></div>
      </Grid2>
      {valid ? (
        <>
          <div style={{ textAlign: "center", padding: "8px 0", fontSize: 13, color: C.muted }}>{past ? "Time since" : "Time until"} <strong style={{ color: C.text }}>{name || "your event"}</strong></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[[d, "Days"], [hh, "Hours"], [mm, "Minutes"], [ss, "Seconds"]].map(([v, l]) => (
              <div key={l} style={{ textAlign: "center", padding: "18px 6px", background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.22)", borderRadius: 12 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(22px,5vw,34px)", fontWeight: 800, color: C.accent }}>{v}</div>
                <div style={{ ...T.label, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <Grid3>
            <StatBox value={d} label="Total days" />
            <StatBox value={workdays} label={past ? "Workdays since" : "Workdays left"} />
            <StatBox value={Math.floor(abs / 3600000).toLocaleString()} label="Total hours" />
          </Grid3>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Label>Shareable summary</Label><CopyBtn text={summary} />
            </div>
            <Result mono={false}>{summary}</Result>
          </div>
        </>
      ) : <Result mono={false}>Pick a valid target date to start the countdown.</Result>}
    </VStack>
  );
}

function TimeSlotGenerator() {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [len, setLen] = useState("30");
  const [gap, setGap] = useState("5");
  const [lunch, setLunch] = useState("yes");
  const [lunchStart, setLunchStart] = useState("13:00");
  const [lunchLen, setLunchLen] = useState("45");
  const [label, setLabel] = useState("Interview slots — Thursday");
  const toMin = (t) => { const p = String(t).split(":"); return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0); };
  const fmt = (m) => `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`;
  const s = toMin(start), e = toMin(end), L = Math.max(5, parseInt(len, 10) || 30), G = Math.max(0, parseInt(gap, 10) || 0);
  const ls = toMin(lunchStart), ll = Math.max(0, parseInt(lunchLen, 10) || 0);
  const slots = [];
  let err = null;
  if (e <= s) err = "The end time must be after the start time.";
  else {
    let t = s, guard = 0;
    while (t + L <= e && guard++ < 500) {
      const overlapsLunch = lunch === "yes" && ll > 0 && t < ls + ll && t + L > ls;
      if (overlapsLunch) { t = ls + ll; continue; }
      slots.push([fmt(t), fmt(t + L)]);
      t += L + G;
    }
    if (!slots.length) err = "No slots fit — shorten the slot length or widen the working window.";
  }
  const text = slots.map((sl, i) => `${i + 1}. ${sl[0]} – ${sl[1]}`).join("\n");
  usePrintStyle("A4 portrait", "16mm");
  return (
    <VStack gap={14}>
      <div><Label>Sheet Title</Label><Input value={label} onChange={setLabel} /></div>
      <Grid2>
        <div><Label>Day Starts</Label><NativeInput type="time" value={start} onChange={setStart} /></div>
        <div><Label>Day Ends</Label><NativeInput type="time" value={end} onChange={setEnd} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Slot Length (minutes)</Label><Input value={len} onChange={setLen} /></div>
        <div><Label>Gap Between Slots (minutes)</Label><Input value={gap} onChange={setGap} /></div>
      </Grid2>
      <Grid3>
        <div><Label>Lunch Break</Label><SelectInput value={lunch} onChange={setLunch} style={{ width: "100%" }} options={[["yes", "Exclude a break"], ["no", "No break"]]} /></div>
        <div><Label>Break Starts</Label><NativeInput type="time" value={lunchStart} onChange={setLunchStart} /></div>
        <div><Label>Break Length (minutes)</Label><Input value={lunchLen} onChange={setLunchLen} /></div>
      </Grid3>
      {err ? <Result mono={false}>⚠️ {err}</Result> : (
        <>
          <StatRow items={[["Slots", slots.length], ["Booked time", (slots.length * L / 60).toFixed(1) + " h"], ["Slot length", L + " min"]]} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {slots.map((sl, i) => (
              <div key={i} style={{ padding: "8px 12px", background: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.22)", borderRadius: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{sl[0]} – {sl[1]}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <CopyBtn text={text} />
            <Btn size="sm" variant="secondary" onClick={() => downloadBlob("time-slots.txt", "text/plain;charset=utf-8", label + "\n\n" + text)}>⬇ .txt</Btn>
          </div>
          <PrintBar note="Prints a sign-up sheet with a name line beside every slot." />
          <PaperSheet wmm={210} hmm={297} zoom={0.5} pad={16} flow>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "18pt", fontWeight: 700, borderBottom: "1.5pt solid #111827", paddingBottom: "2mm", marginBottom: "5mm" }}>{label}</div>
            {slots.map((sl, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4mm", padding: "3mm 0", borderBottom: "0.5pt solid #D1D5DB", fontSize: "11pt" }}>
                <span style={{ fontFamily: "monospace", width: "34mm", fontWeight: 600 }}>{sl[0]} – {sl[1]}</span>
                <span style={{ flex: 1, borderBottom: "0.5pt dotted #9CA3AF", height: "5mm" }} />
              </div>
            ))}
          </PaperSheet>
        </>
      )}
    </VStack>
  );
}

// ── documents ────────────────────────────────────────────────────────────────

function SignaturePad() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const strokes = useRef([]); // array of stroke arrays of {x,y}, for undo
  const [penWidth, setPenWidth] = useState("3");
  const [penColor, setPenColor] = useState("#111827");
  const [bg, setBg] = useState("transparent");
  const [hasInk, setHasInk] = useState(false);
  const DPR = typeof window !== "undefined" ? Math.max(1, window.devicePixelRatio || 1) : 1;
  const CW = 640, CH = 260;

  const redraw = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    if (bg === "white") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, CW, CH); }
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    strokes.current.forEach(s => {
      if (s.pts.length < 2) return;
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width;
      ctx.beginPath(); ctx.moveTo(s.pts[0].x, s.pts[0].y);
      for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x, s.pts[i].y);
      ctx.stroke();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.width = CW * DPR; canvas.height = CH * DPR;
    canvas.style.width = CW + "px"; canvas.style.height = CH + "px";
    redraw();
  }, []); // eslint-disable-line
  useEffect(() => { redraw(); }, [bg]); // eslint-disable-line

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };
  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    strokes.current.push({ color: penColor, width: parseFloat(penWidth) || 3, pts: [pos(e)] });
    setHasInk(true);
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    strokes.current[strokes.current.length - 1].pts.push(pos(e));
    redraw();
  };
  const end = () => { drawing.current = false; };
  const undo = () => { strokes.current.pop(); setHasInk(strokes.current.length > 0); redraw(); };
  const clearAll = () => { strokes.current = []; setHasInk(false); redraw(); };
  const download = () => {
    canvasRef.current.toBlob((blob) => { if (blob) downloadBlob("signature.png", "image/png", blob); }, "image/png");
  };

  return (
    <VStack gap={16}>
      <Grid3>
        <div><Label>Pen Width</Label><SelectInput value={penWidth} onChange={setPenWidth} style={{ width: "100%" }} options={[["1.5", "Thin"], ["3", "Medium"], ["5", "Thick"], ["7", "Bold"]]} /></div>
        <div><Label>Pen Colour</Label><SelectInput value={penColor} onChange={setPenColor} style={{ width: "100%" }} options={[["#111827", "Black"], ["#1D4ED8", "Blue ink"], ["#0F766E", "Teal ink"]]} /></div>
        <div><Label>Canvas Background</Label><SelectInput value={bg} onChange={setBg} style={{ width: "100%" }} options={[["transparent", "Transparent (for PNG)"], ["white", "White"]]} /></div>
      </Grid3>
      <div
        style={{
          background: bg === "white" ? "#FFFFFF" : "repeating-conic-gradient(#e5e7eb 0% 25%, #f9fafb 0% 50%) 50%/16px 16px",
          borderRadius: 10, border: `1px solid ${C.border}`, touchAction: "none", cursor: "crosshair", width: CW, maxWidth: "100%",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          style={{ display: "block", width: "100%", height: "auto" }}
        />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Btn size="sm" variant="secondary" onClick={undo} disabled={!hasInk}>↩ Undo Stroke</Btn>
        <Btn size="sm" variant="secondary" onClick={clearAll} disabled={!hasInk}>Clear</Btn>
        <Btn size="sm" onClick={download} disabled={!hasInk}>⬇ Download PNG</Btn>
      </div>
      <Result mono={false}>Drawn locally on a canvas element — your signature is never uploaded. A drawn image is fine for informal approvals and documents, but is not the same as a legally qualified electronic signature for contracts.</Result>
    </VStack>
  );
}

function AddressLabelSheet() {
  const [raw, setRaw] = useState("Priya Sharma\n221B Banjara Hills Road\nHyderabad, Telangana 500034\nIndia\n\nArjun Mehta\n48 MG Road, 4th Floor\nBengaluru, Karnataka 560001\nIndia\n\nSara Ahmed\n12 Palm Jumeirah, Villa 7\nDubai, UAE");
  const [grid, setGrid] = useState("3x10");
  const [size, setSize] = useState("9");
  const [repeat, setRepeat] = useState("no");
  const [offX, setOffX] = useState("0");
  const [offY, setOffY] = useState("0");
  usePrintStyle("A4 portrait", "0mm");
  const GRID = { "3x10": [3, 10, "63.5 x 38.1 mm — matches Avery 5160 / L7160"], "2x7": [2, 7, "99.1 x 38.1 mm — larger address labels"], "2x5": [2, 5, "99.1 x 57 mm — shipping labels"] };
  const [cols, rows, gridDesc] = GRID[grid];
  const blocks = raw.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const total = cols * rows;
  const cells = repeat === "yes" && blocks.length === 1
    ? Array.from({ length: total }, () => blocks[0])
    : Array.from({ length: total }, (_, i) => blocks[i] || "");
  return (
    <VStack gap={14}>
      <div><Label>Addresses — separate each with a blank line</Label><Textarea value={raw} onChange={setRaw} rows={10} /></div>
      <Grid3>
        <div><Label>Label Grid</Label><SelectInput value={grid} onChange={setGrid} style={{ width: "100%" }} options={[["3x10", "3 x 10 (30/sheet)"], ["2x7", "2 x 7 (14/sheet)"], ["2x5", "2 x 5 (10/sheet)"]]} /></div>
        <div><Label>Font Size</Label><SelectInput value={size} onChange={setSize} style={{ width: "100%" }} options={[["8", "Small"], ["9", "Normal"], ["10.5", "Large"]]} /></div>
        <div><Label>Repeat First Address</Label><SelectInput value={repeat} onChange={setRepeat} style={{ width: "100%" }} options={[["no", "No — one per label"], ["yes", "Yes — fill whole sheet"]]} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Horizontal Offset (mm)</Label><Input value={offX} onChange={setOffX} /></div>
        <div><Label>Vertical Offset (mm)</Label><Input value={offY} onChange={setOffY} /></div>
      </Grid2>
      <StatRow items={[["Grid", gridDesc], ["Addresses pasted", blocks.length], ["Labels on sheet", total]]} />
      <PrintBar note="Print one test page on plain paper and hold it against your label sheet before printing for real. Set print scale to 100%." />
      <PaperSheet wmm={210} hmm={297} zoom={0.5} pad={0}>
        <div style={{
          display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)`,
          width: "100%", height: "100%", padding: `${12 + parseFloat(offY || 0)}mm ${8 + parseFloat(offX || 0)}mm`,
          boxSizing: "border-box", gap: "0mm",
        }}>
          {cells.map((addr, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "3mm", boxSizing: "border-box" }}>
              <div style={{ fontSize: size + "pt", lineHeight: 1.3, whiteSpace: "pre-wrap" }}>{addr}</div>
            </div>
          ))}
        </div>
      </PaperSheet>
    </VStack>
  );
}

function NameBadgeMaker() {
  const [event, setEvent] = useState("ToolsRift Community Meetup");
  const [raw, setRaw] = useState("Priya Sharma, Head of Design\nArjun Mehta, Backend Engineer\nSara Ahmed, Product Manager\nRahul Verma\nMeera Iyer, Founder");
  const [size, setSize] = useState("standard");
  const [color, setColor] = useState("#0891B2");
  usePrintStyle("A4 portrait", "10mm");
  const people = raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    const [name, ...rest] = l.split(",");
    return { name: name.trim(), role: rest.join(",").trim() };
  });
  const isLarge = size === "large";
  const cols = 2, rows = isLarge ? 3 : 4;
  const per = cols * rows;
  const pages = [];
  for (let i = 0; i < people.length; i += per) pages.push(people.slice(i, i + per));
  return (
    <VStack gap={14}>
      <Grid2>
        <div><Label>Event Title</Label><Input value={event} onChange={setEvent} /></div>
        <div><Label>Accent Colour</Label><SelectInput value={color} onChange={setColor} style={{ width: "100%" }} options={[["#0891B2", "Cyan"], ["#059669", "Emerald"], ["#7C3AED", "Violet"], ["#DC2626", "Red"], ["#111827", "Black"]]} /></div>
      </Grid2>
      <div><Label>Attendees — one per line, optional ", role" after the name</Label><Textarea value={raw} onChange={setRaw} rows={8} /></div>
      <div><Label>Badge Size</Label><SelectInput value={size} onChange={setSize} style={{ width: "100%" }} options={[["standard", "Standard 90 x 54 mm (8 per sheet)"], ["large", "Large 90 x 90 mm (6 per sheet)"]]} /></div>
      <StatRow items={[["Attendees", people.length], ["Badges per sheet", per], ["Sheets to print", pages.length || 1]]} />
      <PrintBar note="Each sheet holds up to 8 (or 6) badges. Print one test sheet on plain paper before using perforated badge stock." />
      {(pages.length ? pages : [[]]).map((page, pi) => (
        <PaperSheet key={pi} wmm={210} hmm={297} zoom={0.5} pad={10}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)`, width: "100%", height: "100%", gap: "4mm" }}>
            {Array.from({ length: per }).map((_, i) => {
              const p = page[i];
              return (
                <div key={i} style={{ border: `0.75pt dashed #D1D5DB`, borderRadius: "3mm", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4mm", textAlign: "center" }}>
                  {p ? (
                    <>
                      <div style={{ fontSize: "7pt", letterSpacing: "0.08em", textTransform: "uppercase", color, fontWeight: 700, marginBottom: "3mm" }}>{event}</div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: isLarge ? "20pt" : "16pt", fontWeight: 700, color: "#111827" }}>{p.name}</div>
                      {p.role && <div style={{ fontSize: "9pt", color: "#6B7280", marginTop: "1.5mm" }}>{p.role}</div>}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </PaperSheet>
      ))}
    </VStack>
  );
}

function CertificateMaker() {
  const [recipient, setRecipient] = useState("Aarav Kapoor");
  const [reason, setReason] = useState("outstanding contribution to the Q3 Community Hackathon");
  const [title, setTitle] = useState("Certificate of Achievement");
  const [date, setDate] = useState(isoToday());
  const [signatory, setSignatory] = useState("Meera Iyer, Programme Director");
  const [border, setBorder] = useState("classic");
  const [color, setColor] = useState("#0891B2");
  usePrintStyle("A4 landscape", "0mm");
  const borderStyle = border === "classic"
    ? { border: `2.2pt solid ${color}`, outline: `0.6pt solid ${color}`, outlineOffset: "3mm" }
    : border === "double"
    ? { border: `1.2pt solid ${color}`, boxShadow: `inset 0 0 0 3.4mm #fff, inset 0 0 0 3.7mm ${color}` }
    : { border: `3pt double ${color}` };
  return (
    <VStack gap={14}>
      <Grid2>
        <div><Label>Certificate Title</Label><Input value={title} onChange={setTitle} /></div>
        <div><Label>Recipient Name</Label><Input value={recipient} onChange={setRecipient} /></div>
      </Grid2>
      <div><Label>Awarded For</Label><Input value={reason} onChange={setReason} placeholder="outstanding contribution to…" /></div>
      <Grid3>
        <div><Label>Date</Label><NativeInput type="date" value={date} onChange={setDate} /></div>
        <div><Label>Border Style</Label><SelectInput value={border} onChange={setBorder} style={{ width: "100%" }} options={[["classic", "Classic frame"], ["double", "Double line"], ["ornate", "Ornate double rule"]]} /></div>
        <div><Label>Accent Colour</Label><SelectInput value={color} onChange={setColor} style={{ width: "100%" }} options={[["#0891B2", "Cyan"], ["#B45309", "Gold"], ["#1D4ED8", "Blue"], ["#065F46", "Green"]]} /></div>
      </Grid3>
      <div><Label>Signatory</Label><Input value={signatory} onChange={setSignatory} placeholder="Name, Title" /></div>
      <PrintBar />
      <PaperSheet wmm={297} hmm={210} zoom={0.42} pad={14} bg="#FFFDF7">
        <div style={{ ...borderStyle, height: "100%", padding: "14mm", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ fontSize: "9pt", letterSpacing: "0.25em", textTransform: "uppercase", color, marginBottom: "6mm" }}>This certificate is presented to</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "30pt", fontWeight: 700, color: "#111827", marginBottom: "6mm" }}>{title}</div>
          <div style={{ fontFamily: "'Brush Script MT',cursive,Georgia,serif", fontSize: "26pt", fontWeight: 700, color, borderBottom: "0.75pt solid #D1D5DB", padding: "0 8mm 3mm" }}>{recipient || "Recipient Name"}</div>
          <div style={{ fontSize: "11pt", color: "#374151", marginTop: "7mm", maxWidth: "180mm" }}>in recognition of {reason || "their achievement"}</div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "160mm", marginTop: "16mm" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "0.5pt solid #9CA3AF", paddingTop: "2mm", fontSize: "9pt", minWidth: "60mm" }}>{date}</div>
              <div style={{ fontSize: "7.5pt", color: "#9CA3AF" }}>Date</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderTop: "0.5pt solid #9CA3AF", paddingTop: "2mm", fontSize: "9pt", minWidth: "60mm" }}>{signatory || "Signatory"}</div>
              <div style={{ fontSize: "7.5pt", color: "#9CA3AF" }}>Signature</div>
            </div>
          </div>
        </div>
      </PaperSheet>
    </VStack>
  );
}

function LetterheadGenerator() {
  const [company, setCompany] = useState("Rift Studio Pvt. Ltd.");
  const [tagline, setTagline] = useState("Design & Engineering Collective");
  const [address, setAddress] = useState("221B Banjara Hills Road, Hyderabad, Telangana 500034, India");
  const [contact, setContact] = useState("hello@riftstudio.example  ·  +91 98765 43210  ·  riftstudio.example");
  const [color, setColor] = useState("#0891B2");
  usePrintStyle("A4 portrait", "0mm");
  return (
    <VStack gap={14}>
      <Grid2>
        <div><Label>Company Name</Label><Input value={company} onChange={setCompany} /></div>
        <div><Label>Tagline</Label><Input value={tagline} onChange={setTagline} /></div>
      </Grid2>
      <div><Label>Address</Label><Input value={address} onChange={setAddress} /></div>
      <Grid2>
        <div><Label>Contact Line</Label><Input value={contact} onChange={setContact} /></div>
        <div><Label>Accent Colour</Label><SelectInput value={color} onChange={setColor} style={{ width: "100%" }} options={[["#0891B2", "Cyan"], ["#059669", "Emerald"], ["#7C3AED", "Violet"], ["#DC2626", "Red"], ["#111827", "Black"]]} /></div>
      </Grid2>
      <PrintBar note="Prints the letterhead frame only — the body area is left blank for your letter." />
      <PaperSheet wmm={210} hmm={297} zoom={0.5} pad={0}>
        <div style={{ padding: "16mm 18mm", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <div style={{ borderBottom: `1.5pt solid ${color}`, paddingBottom: "6mm", marginBottom: "10mm" }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "22pt", fontWeight: 700, color: "#111827" }}>{company || "Company Name"}</div>
            {tagline && <div style={{ fontSize: "10pt", color, marginTop: "1mm" }}>{tagline}</div>}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: "0.5pt solid #D1D5DB", paddingTop: "3mm", fontSize: "8pt", color: "#6B7280", display: "flex", justifyContent: "space-between" }}>
            <span>{address}</span>
            <span>{contact}</span>
          </div>
        </div>
      </PaperSheet>
    </VStack>
  );
}

const ENVELOPES = { dl: [220, 110, "DL — 220 x 110 mm"], c5: [229, 162, "C5 — 229 x 162 mm"], c6: [162, 114, "C6 — 162 x 114 mm"], us10: [241, 105, "US #10 — 9.5 x 4.125 in"] };
function EnvelopeAddresser() {
  const [envType, setEnvType] = useState("dl");
  const [sender, setSender] = useState("Rift Studio Pvt. Ltd.\n221B Banjara Hills Road\nHyderabad, Telangana 500034");
  const [recipient, setRecipient] = useState("Ms. Priya Sharma\n48 MG Road, 4th Floor\nBengaluru, Karnataka 560001");
  const [showSender, setShowSender] = useState("yes");
  usePrintStyle("A4 landscape", "0mm");
  const [w, h, envDesc] = ENVELOPES[envType];
  return (
    <VStack gap={14}>
      <Grid2>
        <div><Label>Envelope Size</Label><SelectInput value={envType} onChange={setEnvType} style={{ width: "100%" }} options={[["dl", "DL (standard business)"], ["c5", "C5 (A4 folded once)"], ["c6", "C6 (A4 folded twice)"], ["us10", "US #10"]]} /></div>
        <div><Label>Show Sender Address</Label><SelectInput value={showSender} onChange={setShowSender} style={{ width: "100%" }} options={[["yes", "Yes"], ["no", "No — recipient only"]]} /></div>
      </Grid2>
      <Grid2>
        <div><Label>Sender Address</Label><Textarea value={sender} onChange={setSender} rows={4} /></div>
        <div><Label>Recipient Address</Label><Textarea value={recipient} onChange={setRecipient} rows={4} /></div>
      </Grid2>
      <StatRow items={[["Size", envDesc], ["Width", w + " mm"], ["Height", h + " mm"]]} />
      <PrintBar note="Feed the envelope to match your printer's orientation — check with a plain-paper test first." />
      <PaperSheet wmm={w} hmm={h} zoom={0.85} pad={8} bg="#FFFFFF">
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {showSender === "yes" && (
            <div style={{ position: "absolute", top: "4mm", left: "4mm", fontSize: "7.5pt", lineHeight: 1.4, whiteSpace: "pre-wrap", color: "#374151" }}>{sender}</div>
          )}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-45%)", fontSize: "10pt", lineHeight: 1.5, whiteSpace: "pre-wrap", color: "#111827", textAlign: "left" }}>{recipient}</div>
          <div style={{ position: "absolute", top: "3mm", right: "3mm", width: "18mm", height: "14mm", border: "0.5pt dashed #9CA3AF", fontSize: "6pt", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "center" }}>Stamp</div>
        </div>
      </PaperSheet>
    </VStack>
  );
}

function PageBorderPrintable() {
  const [style, setStyle] = useState("double");
  const [thickness, setThickness] = useState("2");
  const [color, setColor] = useState("#0891B2");
  const [title, setTitle] = useState("");
  const [paper, setPaper] = useState("a4p");
  usePrintStyle(PAPER[paper][2], "8mm");
  const [w, h] = PAPER[paper];
  const t = parseFloat(thickness) || 2;
  const frame = style === "double"
    ? { border: `${t}pt solid ${color}`, outline: `${Math.max(0.5, t / 3)}pt solid ${color}`, outlineOffset: "3mm" }
    : style === "dashed"
    ? { border: `${t * 1.4}pt dashed ${color}` }
    : style === "corners"
    ? { border: `${t}pt solid transparent` } // corner brackets drawn separately below
    : { border: `${t}pt solid ${color}` };
  return (
    <VStack gap={14}>
      <Grid3>
        <div><Label>Border Style</Label><SelectInput value={style} onChange={setStyle} style={{ width: "100%" }} options={[["simple", "Simple line"], ["double", "Double line"], ["dashed", "Dashed"], ["corners", "Corner brackets"]]} /></div>
        <div><Label>Thickness</Label><SelectInput value={thickness} onChange={setThickness} style={{ width: "100%" }} options={[["1", "Thin"], ["2", "Medium"], ["3.5", "Thick"]]} /></div>
        <div><Label>Colour</Label><SelectInput value={color} onChange={setColor} style={{ width: "100%" }} options={[["#0891B2", "Cyan"], ["#111827", "Black"], ["#B45309", "Gold"], ["#7C3AED", "Violet"]]} /></div>
      </Grid3>
      <Grid2>
        <div><Label>Optional Title</Label><Input value={title} onChange={setTitle} placeholder="Certificate of Participation" /></div>
        <div><Label>Paper</Label><SelectInput value={paper} onChange={setPaper} style={{ width: "100%" }} options={[["a4p", "A4 portrait"], ["a4l", "A4 landscape"], ["ltp", "Letter portrait"]]} /></div>
      </Grid2>
      <PrintBar note="A blank framed page for handouts, notices and worksheets — write or paste your own content on it, then print." />
      <PaperSheet wmm={w} hmm={h} zoom={0.5} pad={10}>
        <div style={{ ...frame, height: "100%", boxSizing: "border-box", position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10mm" }}>
          {style === "corners" && [["0mm", "0mm", "8mm 0 0 8mm"], ["0mm", "0mm", ""]].length && (
            <>
              {[
                { top: 0, left: 0, borderWidth: `${t}pt 0 0 ${t}pt` },
                { top: 0, right: 0, borderWidth: `${t}pt ${t}pt 0 0` },
                { bottom: 0, left: 0, borderWidth: `0 0 ${t}pt ${t}pt` },
                { bottom: 0, right: 0, borderWidth: `0 ${t}pt ${t}pt 0` },
              ].map((c, i) => (
                <div key={i} style={{ position: "absolute", ...c, width: "22mm", height: "22mm", borderStyle: "solid", borderColor: color }} />
              ))}
            </>
          )}
          {title && <div style={{ fontFamily: "Georgia,serif", fontSize: "16pt", fontWeight: 700, color: "#111827" }}>{title}</div>}
        </div>
      </PaperSheet>
    </VStack>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
const TOOL_COMPONENTS = {
  "vcard-generator": vCardQRGenerator,
  "wifi-qr-generator": WifiQRGenerator,
  "qr-code-studio": QRCodeStudio,
  "email-link-generator": EmailLinkGenerator,
  "sms-link-generator": SmsLinkGenerator,
  "whatsapp-link-generator": WhatsAppLinkGenerator,
  "phone-link-generator": PhoneLinkGenerator,
  "contact-list-formatter": ContactListFormatter,
  "ical-event-generator": ICalEventGenerator,
  "quick-notepad": QuickNotepad,
  "todo-list-maker": TodoListMaker,
  "kanban-board": KanbanBoard,
  "checklist-maker": ChecklistMaker,
  "meeting-cost-calculator": MeetingCostCalculator,
  "weekly-planner-printable": WeeklyPlannerPrintable,
  "monthly-calendar-printable": MonthlyCalendarPrintable,
  "countdown-to-date": CountdownToDate,
  "time-slot-generator": TimeSlotGenerator,
  "signature-pad": SignaturePad,
  "address-label-sheet": AddressLabelSheet,
  "name-badge-maker": NameBadgeMaker,
  "certificate-maker": CertificateMaker,
  "letterhead-generator": LetterheadGenerator,
  "envelope-addresser": EnvelopeAddresser,
  "page-border-printable": PageBorderPrintable,
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
    document.title = `${cat?.name || 'Category'} – Office & Productivity | ToolsRift`;
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
    document.title = "Free Office & Productivity Tools – vCard, iCal, QR, Notes | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search office & productivity tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(8,145,178,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.accent, textDecoration:"none" }}>{THEME?.name||"Office & Productivity"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(8,145,178,0.12)", color:C.accent, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(8,145,178,0.25)" }}>{TOOLS.length} tools</span>
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

function ToolsRiftOffice() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="office"/>}
    </div>
  );
}

export default ToolsRiftOffice;
