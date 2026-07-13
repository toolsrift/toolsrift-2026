import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolCard from './shared/ToolCard';
import ToolPageLayout from './shared/ToolPageLayout';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';

const BRAND = { name: "ToolsRift", tagline: "PDF Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  red: "#EF4444", redD: "#DC2626",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(239,68,68,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ─── CDN library loader ───
// Cached per src: the tools below can be mounted repeatedly (hash routing) and
// must not re-inject the same <script> or race a half-loaded global.
const PDFJS_SRC    = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
const PDFLIB_SRC   = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';

const _scriptCache = {};
function loadScript(src) {
  if (_scriptCache[src]) return _scriptCache[src];
  _scriptCache[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => { delete _scriptCache[src]; reject(new Error(`Could not load ${src}. Check your connection and retry.`)); };
    document.body.appendChild(s);
  });
  return _scriptCache[src];
}

async function loadPdfJs() {
  await loadScript(PDFJS_SRC);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return window.pdfjsLib;
}

async function loadPdfLib() {
  await loadScript(PDFLIB_SRC);
  return window.PDFLib;
}

function downloadBlob(data, filename, type) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ErrorNote({ children }) {
  if (!children) return null;
  return (
    <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6 }}>
      {children}
    </div>
  );
}

function InfoNote({ children, tone="blue" }) {
  const bg = tone === 'amber' ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.08)";
  const bd = tone === 'amber' ? "rgba(245,158,11,0.3)" : "rgba(59,130,246,0.2)";
  return (
    <div style={{ padding:12, background:bg, border:`1px solid ${bd}`, borderRadius:8, fontSize:12, color:C.text, lineHeight:1.6 }}>
      {children}
    </div>
  );
}

// ─── Shared text-layout extraction (used by the Markdown/JSON/table/chunk tools) ───
// pdf.js gives us positioned glyph runs. Group them into visual lines so downstream
// tools can reason about headings, paragraphs and columns instead of a soup of spans.
async function extractPageLines(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const content = await page.getTextContent();

  const items = content.items
    .filter(it => it.str && it.str.trim())
    .map(it => ({
      text: it.str,
      x: it.transform[4],
      y: it.transform[5],
      // transform[3] is the vertical scale — a reliable proxy for rendered font size.
      size: Math.abs(it.transform[3]) || it.height || 0,
      width: it.width || 0,
    }));

  // Bucket into lines by baseline, tolerant of sub-pixel drift within a line.
  const lines = [];
  for (const it of items) {
    const tol = Math.max(2, it.size * 0.5);
    const line = lines.find(l => Math.abs(l.y - it.y) <= tol);
    if (line) { line.items.push(it); line.y = (line.y + it.y) / 2; }
    else lines.push({ y: it.y, items: [it] });
  }

  lines.sort((a, b) => b.y - a.y);              // top of page first
  for (const l of lines) {
    l.items.sort((a, b) => a.x - b.x);          // left to right
    l.text = l.items.map(i => i.text).join(' ').replace(/\s+/g, ' ').trim();
    l.size = Math.max(...l.items.map(i => i.size));
    l.x = l.items[0].x;
  }

  return { lines: lines.filter(l => l.text), width: viewport.width, height: viewport.height };
}

async function extractDocLines(pdf) {
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) pages.push({ page: i, ...(await extractPageLines(pdf, i)) });
  return pages;
}

function medianFontSize(pages) {
  const sizes = pages.flatMap(p => p.lines.map(l => l.size)).filter(Boolean).sort((a, b) => a - b);
  return sizes.length ? sizes[Math.floor(sizes.length / 2)] : 12;
}

function Badge({ children, color = "red" }) {
  const map = { red:"rgba(239,68,68,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)" };
  const textMap = { red:"#FCA5A5", blue:"#60A5FA", green:"#34D399", amber:"#FCD34D" };
  return (
    <span style={{ background:map[color]||map.red, color:textMap[color]||textMap.red, borderRadius:4, padding:"2px 8px", fontSize:11, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="primary", size="md", href, disabled, style={} }) {
  const ACCENT = C.red; const ACCENTD = C.redD;
  const base = { display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, border:"none", cursor:disabled?"not-allowed":"pointer", borderRadius:8, fontWeight:600, transition:"all .15s", fontFamily:"'Plus Jakarta Sans',sans-serif", textDecoration:"none", opacity:disabled?0.5:1 };
  const sz = { sm:{padding:"6px 14px",fontSize:12}, md:{padding:"9px 20px",fontSize:13}, lg:{padding:"12px 28px",fontSize:14} }[size];
  const v = {
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(239,68,68,0.25)` },
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
      onFocus={e => e.target.style.borderColor=C.red} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function Textarea({ value, onChange, placeholder, rows=6, mono=false, style={} }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:13, fontFamily:mono?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',sans-serif", outline:"none", lineHeight:1.6, ...style }}
      onFocus={e => e.target.style.borderColor=C.red} onBlur={e => e.target.style.borderColor=C.border} />
  );
}

function NumInput({ value, onChange, min, max, style={} }) {
  const clamp = (n) => {
    if (Number.isNaN(n)) return min ?? 0;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    return n;
  };
  return (
    <input type="number" value={value} min={min} max={max}
      onChange={e => onChange(clamp(parseInt(e.target.value, 10)))}
      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, fontFamily:"'JetBrains Mono',monospace", outline:"none", ...style }}
      onFocus={e => e.target.style.borderColor=C.red} onBlur={e => e.target.style.borderColor=C.border} />
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(239,68,68,0.08)", border:`1px solid rgba(239,68,68,0.2)`, borderRadius:10 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:32, fontWeight:700, color:C.red }}>{value}</div>
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
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:C.red }}>{value}</div>
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
  // View & Read
  { id:"pdf-viewer", cat:"view", name:"PDF Viewer", desc:"View and preview PDF files directly in your browser with zoom and page navigation controls", icon:"📄", free:true },
  { id:"pdf-page-count", cat:"view", name:"PDF Page Counter", desc:"Quickly count the number of pages in any PDF document without opening it", icon:"📄", free:true },
  { id:"pdf-metadata", cat:"view", name:"PDF Metadata Viewer", desc:"Read and display PDF metadata including title, author, creation date, and more", icon:"📅", free:true },
  { id:"pdf-text-extractor", cat:"view", name:"PDF Text Extractor", desc:"Extract all text content from PDF documents for editing or analysis", icon:"📄", free:true },
  
  // Edit & Modify
  { id:"pdf-merger", cat:"edit", name:"PDF Merger", desc:"Combine multiple PDF files into a single document in your preferred order", icon:"📄", free:true },
  { id:"pdf-splitter", cat:"edit", name:"PDF Splitter", desc:"Split large PDF files into smaller documents by page ranges or individual pages", icon:"📄", free:true },
  { id:"pdf-page-extractor", cat:"edit", name:"PDF Page Extractor", desc:"Extract specific pages from PDF and save them as a new separate document", icon:"📄", free:true },
  { id:"pdf-rotator", cat:"edit", name:"PDF Rotator", desc:"Rotate PDF pages 90, 180, or 270 degrees clockwise or counter-clockwise", icon:"📄", free:true },
  { id:"pdf-reorder", cat:"edit", name:"PDF Page Reorder", desc:"Rearrange and reorder PDF pages by dragging and dropping to your desired sequence", icon:"📄", free:true },
  { id:"pdf-delete-pages", cat:"edit", name:"PDF Page Deleter", desc:"Remove unwanted pages from PDF documents and save the cleaned version", icon:"📄", free:true },
  
  // Convert
  { id:"pdf-to-jpg", cat:"convert", name:"PDF to JPG Converter", desc:"Convert PDF pages to high-quality JPG images with customizable resolution and quality", icon:"🔄", free:true },
  { id:"pdf-to-png", cat:"convert", name:"PDF to PNG Converter", desc:"Convert PDF pages to PNG images with transparent background support", icon:"🎨", free:true },
  { id:"jpg-to-pdf", cat:"convert", name:"JPG to PDF Converter", desc:"Convert JPG images to PDF format with custom page size and orientation options", icon:"✨", free:true },
  { id:"png-to-pdf", cat:"convert", name:"PNG to PDF Converter", desc:"Convert PNG images to PDF while preserving transparency and image quality", icon:"🌄", free:true },
  { id:"pdf-to-text", cat:"convert", name:"PDF to Text Converter", desc:"Extract and save all text content from PDF as plain text TXT file", icon:"📄", free:true },
  { id:"word-to-pdf", cat:"convert", name:"Word to PDF Converter", desc:"Convert Word documents to PDF format with formatting preservation", icon:"✨", free:true },
  
  // Security
  { id:"pdf-password-protect", cat:"security", name:"PDF Password Protector", desc:"Secure your PDF files with password encryption to prevent unauthorized access", icon:"🔑", free:true },
  { id:"pdf-unlock", cat:"security", name:"PDF Password Remover", desc:"Remove password protection from PDF files when you have the correct password", icon:"🔑", free:true },
  { id:"pdf-watermark", cat:"security", name:"PDF Watermark Tool", desc:"Add custom text watermarks to all pages of your PDF for copyright protection", icon:"📄", free:true },
  { id:"pdf-redact", cat:"security", name:"PDF Redaction Tool", desc:"Black out and permanently remove sensitive information from PDF documents", icon:"▬", free:true },
  
  // Optimize
  { id:"pdf-compressor", cat:"optimize", name:"PDF Compressor", desc:"Reduce PDF file size while maintaining quality for faster sharing and storage", icon:"📄", free:true },
  { id:"pdf-optimizer", cat:"optimize", name:"PDF Optimizer", desc:"Optimize PDF for web viewing with fast page-by-page loading linearization", icon:"⚡", free:true },
  { id:"pdf-metadata-editor", cat:"optimize", name:"PDF Metadata Editor", desc:"Edit PDF properties including title, author, subject, keywords, and creator information", icon:"📄", free:true },
  
  // Tools
  { id:"pdf-page-numbering", cat:"tools", name:"PDF Page Numbering", desc:"Add customizable page numbers to PDF pages with position and format control", icon:"✨", free:true },
  { id:"pdf-margin-adder", cat:"tools", name:"PDF Margin Tool", desc:"Add or adjust margins around PDF pages for printing or binding preparation", icon:"📄", free:true },
  { id:"pdf-cropper", cat:"tools", name:"PDF Cropper", desc:"Crop PDF pages to remove unwanted borders and whitespace around content", icon:"📄", free:true },
  { id:"pdf-bookmarks", cat:"tools", name:"PDF Bookmark Manager", desc:"View, add, edit, and organize PDF bookmarks and table of contents", icon:"📄", free:true },
  { id:"pdf-form-filler", cat:"tools", name:"PDF Form Filler", desc:"Fill in interactive PDF forms with text fields, checkboxes and dropdowns", icon:"📄", free:true },

  // Data & AI
  { id:"pdf-to-markdown", cat:"data", name:"PDF to Markdown", desc:"Convert PDF documents to clean Markdown for LLMs, notes and static sites", icon:"📝", free:true },
  { id:"pdf-to-json", cat:"data", name:"PDF to JSON", desc:"Extract PDF text as structured JSON with page, position and font data", icon:"🧾", free:true },
  { id:"pdf-table-extractor", cat:"data", name:"PDF Table Extractor", desc:"Detect tables in a PDF and export them as CSV spreadsheets", icon:"📊", free:true },
  { id:"pdf-chunker", cat:"data", name:"PDF Chunker for RAG", desc:"Split PDF text into overlapping token-sized chunks for embeddings and RAG", icon:"🧩", free:true },
];

const CATEGORIES = [
  { id:"view", name:"View & Read", icon:"📄", desc:"View, preview and extract information from PDF files" },
  { id:"edit", name:"Edit & Modify", icon:"📄", desc:"Merge, split, rotate, and modify PDF documents" },
  { id:"convert", name:"Convert", icon:"🔄", desc:"Convert PDF to images, text, and other formats" },
  { id:"security", name:"Security", icon:"📄", desc:"Protect, encrypt, and secure PDF documents" },
  { id:"optimize", name:"Optimize", icon:"⚡", desc:"Compress and optimize PDF files for web and storage" },
  { id:"tools", name:"Tools", icon:"📄", desc:"Additional PDF utilities and helper tools" },
  { id:"data", name:"Data & AI", icon:"🤖", desc:"Turn PDFs into Markdown, JSON, CSV and RAG-ready chunks" },
];

const TOOL_META = {
  "pdf-viewer": {
    title: "Free PDF Viewer — View PDF Files Online in Browser | ToolsRift",
    desc: "View and preview PDF documents directly in your browser with zoom, page navigation, and full-screen mode. No installation required, 100% free.",
    faq: [
      ["How do I view a PDF file online?", "Simply upload your PDF file using the file picker, and it will render instantly in the viewer. You can zoom in/out, navigate pages, and view in full-screen mode."],
      ["Is my PDF file secure?", "Yes, all PDF processing happens in your browser. Your files never leave your device and are not uploaded to any server."],
      ["What PDF versions are supported?", "This viewer supports most common PDF versions including PDF 1.0 through 2.0, covering the vast majority of PDF files."]
    ]
  },
  "pdf-page-count": {
    title: "Free PDF Page Counter — Count PDF Pages Online | ToolsRift",
    desc: "Instantly count the number of pages in any PDF document without opening it. Fast, accurate, and works entirely in your browser.",
    faq: [
      ["How does the PDF page counter work?", "Upload your PDF file and the tool will instantly analyze it and display the total page count along with file size and other basic information."],
      ["Can I count pages in password-protected PDFs?", "No, password-protected PDFs must be unlocked first before the page count can be determined."],
      ["Is there a file size limit?", "For best performance, we recommend files under 50MB. Larger files may take longer to process depending on your device."]
    ]
  },
  "pdf-metadata": {
    title: "Free PDF Metadata Viewer — Read PDF Properties Online | ToolsRift",
    desc: "View PDF metadata including title, author, subject, keywords, creation date, and modification date. Extract document properties instantly.",
    faq: [
      ["What metadata can I view?", "You can view title, author, subject, keywords, creator application, producer, creation date, modification date, PDF version, and more."],
      ["How do I remove metadata from a PDF?", "Use our EXIF Remover tool or PDF Metadata Editor to strip or modify metadata from your PDF files."],
      ["Why is some metadata missing?", "Not all PDFs contain complete metadata. The information displayed depends on what was embedded when the PDF was created."]
    ]
  },
  "pdf-text-extractor": {
    title: "Free PDF Text Extractor — Extract Text from PDF Online | ToolsRift",
    desc: "Extract all text content from PDF documents for editing, copying, or analysis. Preserves text structure and formatting.",
    faq: [
      ["Can I extract text from scanned PDFs?", "This tool extracts embedded text. For scanned PDFs (images), you would need OCR (optical character recognition) functionality."],
      ["Is the formatting preserved?", "The tool extracts raw text content. Basic line breaks and paragraph structure are preserved, but complex formatting may be simplified."],
      ["Can I extract text from specific pages?", "Currently this extracts all text. For specific pages, use the PDF Page Extractor first, then extract text from that subset."]
    ]
  },
  "pdf-merger": {
    title: "Free PDF Merger — Combine Multiple PDFs Online | ToolsRift",
    desc: "Merge multiple PDF files into one document. Upload PDFs, arrange them in order, and download the combined result instantly.",
    faq: [
      ["How many PDFs can I merge at once?", "You can merge up to 10 PDF files in a single operation. For more, merge in batches and then merge the results."],
      ["Will the quality be reduced?", "No, PDFs are merged without re-rendering, so there is no quality loss. All content, fonts, and images are preserved."],
      ["Can I change the order before merging?", "Yes, you can rearrange uploaded PDFs by dragging and dropping them into your preferred order before merging."]
    ]
  },
  "pdf-splitter": {
    title: "Free PDF Splitter — Split PDF by Page Range Online | ToolsRift",
    desc: "Split large PDF files into smaller documents by page ranges. Extract specific sections or individual pages as separate PDFs.",
    faq: [
      ["How do I specify page ranges?", "Enter page ranges like '1-5, 8, 10-12' to extract those specific pages as separate PDFs or use the visual page selector."],
      ["Can I split into individual pages?", "Yes, select the 'One page per file' option to split every page into its own separate PDF file."],
      ["Is the original PDF modified?", "No, splitting creates new PDF files. Your original PDF file remains unchanged."]
    ]
  },
  "pdf-page-extractor": {
    title: "Free PDF Page Extractor — Extract Pages from PDF | ToolsRift",
    desc: "Extract specific pages from PDF and save as a new document. Select individual pages or ranges to create focused PDF files.",
    faq: [
      ["What's the difference between extract and split?", "Extract creates one PDF from selected pages. Split creates multiple PDFs from ranges. Extract is best when you need specific pages in one file."],
      ["Can I extract non-consecutive pages?", "Yes, you can select any combination of pages, like pages 1, 5, 7-9, and 15, and they'll be combined into one new PDF."],
      ["Does extracting preserve bookmarks?", "Basic page content is preserved. Bookmarks and annotations may be lost depending on their scope and references."]
    ]
  },
  "pdf-rotator": {
    title: "Free PDF Rotator — Rotate PDF Pages Online | ToolsRift",
    desc: "Rotate PDF pages 90, 180, or 270 degrees. Fix orientation of scanned documents or pages that display sideways.",
    faq: [
      ["Can I rotate specific pages only?", "Yes, you can select which pages to rotate. Rotate all pages, odd pages, even pages, or specific page numbers."],
      ["Is the rotation permanent?", "The rotation is saved in the output PDF. Your original file is not modified unless you replace it with the rotated version."],
      ["Will rotation affect image quality?", "No, rotation is a lossless operation. PDF pages are rotated at the document level without re-rendering content."]
    ]
  },
  "pdf-reorder": {
    title: "Free PDF Page Reorder Tool — Rearrange PDF Pages | ToolsRift",
    desc: "Rearrange PDF pages by dragging and dropping. Reorganize document pages in any order and save as new PDF.",
    faq: [
      ["How do I reorder pages?", "Upload your PDF, then drag and drop the page thumbnails to rearrange them in your desired order before downloading."],
      ["Can I reverse the page order?", "Yes, use the 'Reverse All' button to instantly flip the page order, or manually drag pages to any sequence."],
      ["Is there a limit on page count?", "For performance, the visual reorder interface works best with PDFs under 100 pages. Larger documents may be slower."]
    ]
  },
  "pdf-delete-pages": {
    title: "Free PDF Page Deleter — Remove Pages from PDF Online | ToolsRift",
    desc: "Delete unwanted pages from PDF documents. Select pages to remove and download the cleaned PDF without those pages.",
    faq: [
      ["Can I delete multiple pages at once?", "Yes, select all the pages you want to remove using checkboxes or by specifying page numbers, then delete them in one operation."],
      ["Can I undo page deletion?", "The tool creates a new PDF without the deleted pages. Your original file is never modified, so you always have the original to work from."],
      ["What happens to page numbers after deletion?", "Pages are removed and the remaining pages are renumbered sequentially. If page 3 is deleted, old page 4 becomes new page 3."]
    ]
  },
  "pdf-to-jpg": {
    title: "Free PDF to JPG Converter — Convert PDF Pages to Images | ToolsRift",
    desc: "Convert PDF pages to high-quality JPG images. Customize resolution, quality, and download each page as a separate image file.",
    faq: [
      ["Can I convert all pages or just specific ones?", "You can convert all pages or select specific page numbers. Each page will be rendered as a separate JPG image."],
      ["What resolution should I use?", "For screen viewing, 150 DPI is fine. For printing, use 300 DPI or higher. Higher DPI creates larger file sizes but better quality."],
      ["Can I adjust the JPG quality?", "Yes, you can set the quality from 1-100. Higher quality means larger file sizes but better image fidelity. 85-95 is recommended for most uses."]
    ]
  },
  "pdf-to-png": {
    title: "Free PDF to PNG Converter — Convert PDF to PNG Images | ToolsRift",
    desc: "Convert PDF pages to PNG images with transparency support. Perfect for web graphics and presentations with lossless quality.",
    faq: [
      ["What's the difference between PNG and JPG output?", "PNG is lossless and supports transparency, making it ideal for graphics. JPG is lossy but creates smaller files, better for photos."],
      ["Does PNG support transparency from PDF?", "If your PDF has transparent elements, they will be preserved in PNG output. JPG does not support transparency."],
      ["Which format is better for web use?", "PNG for graphics, logos, and diagrams. JPG for photos and complex images. PNG files are larger but higher quality."]
    ]
  },
  "jpg-to-pdf": {
    title: "Free JPG to PDF Converter — Convert Images to PDF Online | ToolsRift",
    desc: "Convert JPG images to PDF format. Upload multiple images and combine them into a single PDF with custom page size and margins.",
    faq: [
      ["Can I convert multiple JPG files to one PDF?", "Yes, upload multiple JPG images and they will be combined into a single PDF with each image on its own page."],
      ["What page size should I use?", "A4 is standard for documents. Letter for US documents. Or choose 'Fit to Image' to make each page match the image dimensions."],
      ["Can I change the image order?", "Yes, drag and drop the uploaded images to rearrange them before converting to PDF."]
    ]
  },
  "png-to-pdf": {
    title: "Free PNG to PDF Converter — Convert PNG Images to PDF | ToolsRift",
    desc: "Convert PNG images to PDF while preserving transparency and quality. Combine multiple PNGs into one PDF document.",
    faq: [
      ["Will transparency be preserved?", "PDF supports transparency. If your PNG has transparent areas, they will appear as white in the PDF unless you use advanced PDF features."],
      ["Can I mix PNG and JPG in one PDF?", "This tool is for PNG to PDF. To mix formats, convert them separately then use the PDF Merger to combine them."],
      ["What's the maximum image size?", "For best performance, keep individual images under 10MB and total combined size under 50MB."]
    ]
  },
  "pdf-to-text": {
    title: "Free PDF to Text Converter — Extract PDF Text as TXT File | ToolsRift",
    desc: "Convert PDF to plain text TXT file. Extract all text content and download as editable text document.",
    faq: [
      ["Is this different from the Text Extractor?", "The Text Extractor shows text in the browser. This tool creates a downloadable TXT file for saving or further editing."],
      ["Will formatting be preserved?", "Basic line breaks and paragraphs are preserved. Advanced formatting like fonts, colors, and layout is stripped in plain text."],
      ["Can I convert scanned PDFs?", "Scanned PDFs are images and don't contain text data. You would need OCR (optical character recognition) to extract text from scanned documents."]
    ]
  },
  "word-to-pdf": {
    title: "Free Word to PDF Converter — Convert DOCX to PDF Online | ToolsRift",
    desc: "Convert Word documents to PDF format with formatting preservation. Upload DOCX files and download as professional PDFs.",
    faq: [
      ["What Word formats are supported?", "This tool supports modern DOCX format. For older DOC files, save them as DOCX in Word first, then convert."],
      ["Is formatting preserved?", "Basic formatting like fonts, styles, and paragraphs is preserved. Complex features like macros and advanced tables may not convert perfectly."],
      ["Why isn't Word-to-PDF available in the browser?", "Converting Word documents to PDF needs full document-rendering libraries that can't run entirely client-side yet. As a free workaround, open the document in your word processor and use Print → Save as PDF."]
    ]
  },
  "pdf-password-protect": {
    title: "Free PDF Password Protect Tool — Encrypt PDF Online | ToolsRift",
    desc: "Add password protection to PDF files. Secure documents with user passwords to prevent unauthorized access and viewing.",
    faq: [
      ["What type of encryption is used?", "The tool uses AES-256 encryption, which is the industry standard for PDF security and very secure."],
      ["Can I set different passwords for viewing and editing?", "Yes, you can set a user password (required to open) and an owner password (required to edit or print)."],
      ["Can password protection be removed?", "Yes, but only if you know the password. Use the PDF Unlock tool with the correct password to remove protection."]
    ]
  },
  "pdf-unlock": {
    title: "Free PDF Password Remover — Unlock Protected PDFs Online | ToolsRift",
    desc: "Remove password protection and editing restrictions from PDF files you own. Runs entirely in your browser — the file is never uploaded.",
    howTo: "Upload the protected PDF. If it needs a password to open, enter it. The tool decrypts the document, re-renders every page, and rebuilds an unencrypted PDF you can download.",
    faq: [
      ["Can I unlock a PDF without the password?", "No. If the PDF needs a password to open, you must enter the correct one. This tool cannot crack or bypass an unknown password. PDFs that open freely but block editing or printing can be unlocked without any password."],
      ["Will the unlocked PDF look the same?", "It will look the same, but it becomes image-based. Each page is re-rendered as a picture, so the text is no longer selectable or searchable and the file is larger. Stripping PDF encryption without a server is only possible this way."],
      ["What if I forgot my password?", "It cannot be recovered. PDF encryption is designed to resist exactly that."],
      ["Is this legal?", "Only remove protection from documents you own or have permission to modify. Bypassing protection on someone else's document may be unlawful where you live."]
    ]
  },
  "pdf-watermark": {
    title: "Free PDF Watermark Tool — Add Watermark to PDF Online | ToolsRift",
    desc: "Add custom text watermarks to PDF pages. Protect copyright with visible text overlays on all pages of your document.",
    faq: [
      ["Can I customize the watermark appearance?", "Yes, you can set the text, font size, color, opacity, rotation angle, and position of the watermark."],
      ["Will the watermark appear on every page?", "By default yes, but you can choose to apply watermarks to specific pages or page ranges only."],
      ["Can I add image watermarks?", "This tool supports text watermarks. For image/logo watermarks, use the dedicated PDF Logo tool."]
    ]
  },
  "pdf-redact": {
    title: "Free PDF Redaction Tool — Remove Sensitive Info from PDF | ToolsRift",
    desc: "Permanently black out sensitive information in PDF documents. The text underneath is destroyed, not just covered. Secure, free and fully in-browser.",
    howTo: "Upload a PDF, then drag on the page to draw black boxes over anything sensitive. Move between pages — boxes are kept per page. When you apply the redaction, every page is re-rendered as an image with the boxes painted in, so the covered content no longer exists in the file.",
    faq: [
      ["Is redaction permanent?", "Yes. Each page is rasterised and the black boxes are painted onto the bitmap, so the original text and vector content is discarded. Unlike drawing a rectangle in a PDF editor, the hidden words cannot be selected, copied or recovered."],
      ["What is the trade-off?", "Because the pages are rebuilt as images, the whole document stops being searchable and selectable, and the file size grows. Keep an unredacted original if you may need the text later."],
      ["How do I select areas to redact?", "Click and drag to draw a rectangle over the sensitive area. Draw as many as you need, on any page, then apply them all at once. Undo removes the last box on the current page."],
      ["Can I redact a password-protected PDF?", "Not directly — unlock it first with the PDF Password Remover, then redact the result."]
    ]
  },
  "pdf-compressor": {
    title: "Free PDF Compressor — Reduce PDF File Size Online | ToolsRift",
    desc: "Compress PDF files to reduce size while maintaining quality. Optimize large PDFs for faster email sharing and web upload.",
    faq: [
      ["How much compression can I expect?", "Compression ratio depends on content. PDFs with images can often be reduced 40-70%. Text-only PDFs may compress less."],
      ["Will compression reduce quality?", "The tool uses smart compression that balances size and quality. Images are optimized, but text remains crisp and readable."],
      ["Can I choose compression level?", "Yes, select from Low (maximum quality), Medium (balanced), or High (maximum compression) based on your needs."]
    ]
  },
  "pdf-optimizer": {
    title: "Free PDF Optimizer — Optimize PDF for Web Viewing | ToolsRift",
    desc: "Optimize PDF for fast web loading with linearization. Enable page-at-a-time downloading for better user experience.",
    faq: [
      ["What is PDF linearization?", "Linearization restructures the PDF so web browsers can display the first page before the entire file downloads, improving perceived speed."],
      ["Is this different from compression?", "Yes, optimization focuses on file structure for fast web viewing. Compression reduces file size. Use both for best results."],
      ["Will optimization reduce file size?", "Optimization may slightly reduce size through structural improvements, but use the Compressor tool for significant size reduction."]
    ]
  },
  "pdf-metadata-editor": {
    title: "Free PDF Metadata Editor — Edit PDF Properties Online | ToolsRift",
    desc: "Edit PDF metadata including title, author, subject, keywords, and creator. Update document properties and information.",
    faq: [
      ["What metadata fields can I edit?", "You can edit title, author, subject, keywords, creator, and producer fields. Other technical metadata is typically read-only."],
      ["Why edit PDF metadata?", "Metadata improves document organization, searchability, and SEO. It also provides proper attribution and copyright information."],
      ["Can I remove all metadata?", "Yes, clear all fields to remove metadata, or use the EXIF Remover tool to strip all metadata at once."]
    ]
  },
  "pdf-page-numbering": {
    title: "Free PDF Page Numbering Tool — Add Page Numbers to PDF | ToolsRift",
    desc: "Add customizable page numbers to PDF pages. Choose position, format, starting number, and font style for your page numbers.",
    faq: [
      ["Where can I position the page numbers?", "Choose from top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right positions with adjustable margins."],
      ["Can I start numbering from a specific page?", "Yes, you can start numbering from any page and set the starting number (useful if this PDF is part of a larger document)."],
      ["What number formats are available?", "Choose from standard numbers (1, 2, 3), Roman numerals (i, ii, iii or I, II, III), or letters (a, b, c or A, B, C)."]
    ]
  },
  "pdf-margin-adder": {
    title: "Free PDF Margin Tool — Add Margins to PDF Pages | ToolsRift",
    desc: "Add or adjust margins around PDF pages for printing or binding. Set custom margin sizes for all sides of your document.",
    faq: [
      ["Why add margins to a PDF?", "Margins are useful for printing, binding, or adding space for annotations. They prevent content from being cut off at page edges."],
      ["Can I set different margins for each side?", "Yes, set custom values for top, bottom, left, and right margins independently."],
      ["Will adding margins change the page size?", "You can choose to expand the page size or scale content to fit within the new margins while keeping page size constant."]
    ]
  },
  "pdf-cropper": {
    title: "Free PDF Cropper — Crop PDF Pages Online | ToolsRift",
    desc: "Crop PDF pages to remove unwanted borders and whitespace. Trim margins and focus on the main content area.",
    faq: [
      ["How do I specify the crop area?", "You can visually select the crop area by dragging a rectangle, or enter specific coordinates and dimensions."],
      ["Will cropping affect all pages?", "You can crop all pages with the same dimensions or crop each page individually with custom settings."],
      ["Can I undo cropping?", "The tool creates a new cropped PDF. Your original file is never modified, so you can always go back to it."]
    ]
  },
  "pdf-bookmarks": {
    title: "Free PDF Bookmark Manager — Add & Edit PDF Bookmarks | ToolsRift",
    desc: "View, add, edit, and organize PDF bookmarks and table of contents. Create hierarchical navigation for long documents.",
    faq: [
      ["What are PDF bookmarks?", "Bookmarks are a navigational table of contents in the PDF sidebar. They let readers quickly jump to specific sections."],
      ["Can I create nested bookmarks?", "Yes, create hierarchical bookmark structures with parent and child entries to organize complex documents."],
      ["Why isn't bookmark editing available yet?", "Editing a PDF's outline/bookmark structure isn't supported by the in-browser PDF engine yet. It's free like every other tool — we're just still building it."]
    ]
  },
  "pdf-form-filler": {
    title: "Free PDF Form Filler — Fill Interactive PDF Forms Online | ToolsRift",
    desc: "Fill interactive PDF forms with text fields, checkboxes, radio buttons and dropdowns. Flatten and download the completed form. 100% in your browser.",
    howTo: "Upload a fillable PDF. Every form field it contains is listed automatically — type into text fields, tick checkboxes and choose dropdown values. Optionally tick 'Flatten' to bake your answers permanently into the page, then download the completed PDF.",
    faq: [
      ["What types of form fields are supported?", "Text fields, checkboxes, radio button groups, dropdowns and option lists. Digital signature fields cannot be signed here — use the PDF Watermark tool to place a signature image instead."],
      ["What does flattening do?", "Flattening draws your answers directly onto the page and removes the interactive fields. The values can no longer be edited, which is useful when sending a final copy."],
      ["My PDF shows no fields. Why?", "The document has no interactive AcroForm fields — it is either a flat document or a scan. A form you can only type into in Acrobat's 'Fill & Sign' mode is not a real form field."],
      ["Is my form data uploaded anywhere?", "No. The PDF is parsed and rewritten entirely in your browser. Nothing is sent to a server."]
    ]
  },

  "pdf-to-markdown": {
    title: "Free PDF to Markdown Converter — PDF to MD for LLMs | ToolsRift",
    desc: "Convert PDF documents to clean Markdown online. Detects headings, lists and paragraphs — ideal for feeding PDFs to ChatGPT, Claude, RAG pipelines and static sites.",
    howTo: "Upload a PDF with a real text layer. The tool reads the positioned text, infers heading levels from relative font sizes, converts bullet and numbered lists, and rebuilds paragraphs. Copy the Markdown or download it as a .md file.",
    faq: [
      ["Why convert a PDF to Markdown?", "Language models and RAG pipelines work far better on structured Markdown than on raw PDF text, because headings and lists preserve the document's hierarchy. Markdown also drops straight into static site generators and note apps like Obsidian."],
      ["How are headings detected?", "Each line's font size is compared against the median font size of the whole document. Lines that are noticeably larger become H1, H2 or H3. This is a heuristic, so unusual layouts may need a quick manual pass."],
      ["Does it work on scanned PDFs?", "No. A scan contains pictures of words, not text, so there is nothing to extract. Run the scan through OCR first."],
      ["Are tables preserved?", "Tables are emitted as plain text lines. For real tabular output, use the PDF Table Extractor to get CSV."]
    ]
  },

  "pdf-to-json": {
    title: "Free PDF to JSON Converter — Structured PDF Text Extraction | ToolsRift",
    desc: "Extract PDF text as structured JSON with page numbers, x/y coordinates and font sizes. Perfect for parsers, data pipelines and automated document processing.",
    howTo: "Upload a PDF, choose whether to include coordinates and font sizes, and the tool returns a JSON document with one entry per page and one entry per line of text. Copy it or download a .json file.",
    faq: [
      ["What does the JSON contain?", "A page count, then for each page its width, height and every line of text. With coordinates enabled, each line also carries its x/y position on the page and its font size."],
      ["Why do I need coordinates?", "Positions let you reconstruct layout — identify columns, headers and footers, or find the value that sits to the right of a known label. Turn them off if you only want the words."],
      ["What are the coordinate units?", "PDF points, measured from the bottom-left corner of the page. There are 72 points to an inch."],
      ["Does it work on scanned PDFs?", "No — a scan has no text layer to extract. OCR the document first."]
    ]
  },

  "pdf-table-extractor": {
    title: "Free PDF Table Extractor — Convert PDF Tables to CSV | ToolsRift",
    desc: "Detect tables inside a PDF and export them as CSV spreadsheets. Extract rows and columns from reports, invoices and statements — free and fully in-browser.",
    howTo: "Upload a PDF and pick a page. The tool clusters the horizontal positions of the text to work out where the columns are, groups text into rows, and shows the result as a table. Download it as CSV for Excel, Sheets or pandas.",
    faq: [
      ["How does table detection work?", "The tool looks at the left edge of every piece of text on the page and finds x positions that repeat down the page — those are the columns. Text is then snapped to its nearest column and grouped into rows by vertical position."],
      ["Which tables work best?", "Tables with clearly aligned columns and a real text layer. Tables that rely on merged cells, wrapped multi-line cells or heavy nesting will come out imperfectly and are worth a quick check."],
      ["Nothing was detected on my page.", "Either the page has no table, its columns are not aligned enough to detect, or the PDF is a scan with no text layer. Try the neighbouring pages first."],
      ["Can I extract every page at once?", "Not yet — tables are extracted one page at a time so you can verify each result before exporting."]
    ]
  },

  "pdf-chunker": {
    title: "Free PDF Chunker for RAG — Split PDFs into Token Chunks | ToolsRift",
    desc: "Split PDF text into overlapping, token-sized chunks ready for embeddings, vector databases and RAG pipelines. Export as JSON or JSONL. No uploads.",
    howTo: "Upload a PDF and set your chunk size and overlap in approximate tokens. The tool rebuilds paragraphs from the PDF, packs them into chunks that stay under your size limit, and carries the tail of each chunk into the next so context is never cut mid-idea. Export as .json or .jsonl.",
    faq: [
      ["Why chunk a PDF?", "Embedding models have a fixed context window, and retrieval quality drops when a chunk mixes unrelated topics. Chunking on paragraph boundaries with a small overlap keeps each chunk coherent and retrievable."],
      ["How are tokens counted?", "Using the standard rough estimate of about four characters per token for English prose. It is an approximation — verify against your model's own tokenizer if you are close to a hard limit."],
      ["What chunk size should I use?", "512 tokens with 50 tokens of overlap is a solid default for most embedding models. Use smaller chunks for precise fact retrieval and larger ones when answers need more surrounding context."],
      ["What is the difference between JSON and JSONL?", "JSON gives one array of chunk objects. JSONL puts one chunk per line, which streams better and is what most vector-database loaders expect."]
    ]
  }
};

// PDF Viewer Component
function PdfViewer() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
    setCurrentPage(1);
    setLoading(false);
    renderPage(pdf, 1, 1);
  };

  const renderPage = async (pdf, pageNum, zoomLevel) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoomLevel });
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
  };

  useEffect(() => {
    if (pdfDoc) renderPage(pdfDoc, currentPage, zoom);
  }, [currentPage, zoom, pdfDoc]);

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", marginBottom:12, color:C.text, fontSize:13 }} />
      </div>
      {loading && <div style={{ textAlign:"center", color:C.muted }}>Loading PDF...</div>}
      {numPages && (
        <>
          <div style={{ display:"flex", gap:12, alignItems:"center", justifyContent:"space-between", flexWrap:"wrap" }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <Btn size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>← Prev</Btn>
              <span style={{ fontSize:13, color:C.text }}>Page {currentPage} of {numPages}</span>
              <Btn size="sm" onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))} disabled={currentPage >= numPages}>Next —'</Btn>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <Btn size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>-</Btn>
              <span style={{ fontSize:13, color:C.text }}>{Math.round(zoom * 100)}%</span>
              <Btn size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>+</Btn>
            </div>
          </div>
          <div style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:16, background:"rgba(0,0,0,0.3)", overflow:"auto", maxHeight:600 }}>
            <canvas ref={canvasRef} style={{ display:"block", margin:"0 auto" }} />
          </div>
        </>
      )}
    </VStack>
  );
}

// PDF Page Count Component
function PdfPageCount() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      const fileSize = (selectedFile.size / 1024).toFixed(2);
      setResult({ pageCount, fileSize, fileName: selectedFile.name });
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {loading && <div style={{ textAlign:"center", color:C.muted }}>Analyzing PDF...</div>}
      {result && !result.error && (
        <Grid3>
          <BigResult value={result.pageCount} label="Total Pages" />
          <StatBox value={`${result.fileSize} KB`} label="File Size" />
          <StatBox value="PDF" label="Format" />
        </Grid3>
      )}
      {result?.error && <Result mono={false} style={{ color:C.danger }}>Error: {result.error}</Result>}
    </VStack>
  );
}

// PDF Metadata Viewer Component
function PdfMetadata() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const title = pdfDoc.getTitle() || 'N/A';
      const author = pdfDoc.getAuthor() || 'N/A';
      const subject = pdfDoc.getSubject() || 'N/A';
      const keywords = pdfDoc.getKeywords() || 'N/A';
      const creator = pdfDoc.getCreator() || 'N/A';
      const producer = pdfDoc.getProducer() || 'N/A';
      const creationDate = pdfDoc.getCreationDate()?.toString() || 'N/A';
      const modDate = pdfDoc.getModificationDate()?.toString() || 'N/A';
      setMetadata({ title, author, subject, keywords, creator, producer, creationDate, modDate, pageCount: pdfDoc.getPageCount() });
    } catch (err) {
      setMetadata({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {loading && <div style={{ textAlign:"center", color:C.muted }}>Reading metadata...</div>}
      {metadata && !metadata.error && (
        <VStack gap={8}>
          <div><Label>Title</Label><Result mono={false}>{metadata.title}</Result></div>
          <div><Label>Author</Label><Result mono={false}>{metadata.author}</Result></div>
          <div><Label>Subject</Label><Result mono={false}>{metadata.subject}</Result></div>
          <div><Label>Keywords</Label><Result mono={false}>{metadata.keywords}</Result></div>
          <div><Label>Creator</Label><Result mono={false}>{metadata.creator}</Result></div>
          <div><Label>Producer</Label><Result mono={false}>{metadata.producer}</Result></div>
          <div><Label>Creation Date</Label><Result mono={false}>{metadata.creationDate}</Result></div>
          <div><Label>Modification Date</Label><Result mono={false}>{metadata.modDate}</Result></div>
          <div><Label>Page Count</Label><Result mono={false}>{metadata.pageCount}</Result></div>
        </VStack>
      )}
      {metadata?.error && <Result mono={false} style={{ color:C.danger }}>Error: {metadata.error}</Result>}
    </VStack>
  );
}

// PDF Text Extractor Component
function PdfTextExtractor() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setLoading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      setText(fullText);
    } catch (err) {
      setText(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {loading && <div style={{ textAlign:"center", color:C.muted }}>Extracting text...</div>}
      {text && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <Label>Extracted Text</Label>
            <CopyBtn text={text} />
          </div>
          <Textarea value={text} onChange={() => {}} rows={16} mono={true} style={{ fontSize:12 }} />
        </div>
      )}
    </VStack>
  );
}

// PDF Merger Component
function PdfMerger() {
  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    setMerging(true);
    try {
      const mergedPdf = await window.PDFLib.PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error merging PDFs: ' + err.message);
    }
    setMerging(false);
  };

  return (
    <VStack>
      <div>
        <Label>Select PDF Files to Merge (2-10 files)</Label>
        <input type="file" accept=".pdf" multiple onChange={handleFiles} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {files.length > 0 && (
        <div>
          <Label>Selected Files ({files.length})</Label>
          <Result mono={false}>
            {files.map((f, i) => (
              <div key={i}>{i + 1}. {f.name} ({(f.size / 1024).toFixed(1)} KB)</div>
            ))}
          </Result>
        </div>
      )}
      <Btn onClick={mergePdfs} disabled={files.length < 2 || merging}>
        {merging ? 'Merging...' : `Merge ${files.length} PDFs`}
      </Btn>
    </VStack>
  );
}

// PDF Splitter Component
function PdfSplitter() {
  const [file, setFile] = useState(null);
  const [pageRanges, setPageRanges] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [splitting, setSplitting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
    setNumPages(pdf.getPageCount());
  };

  const splitPdf = async () => {
    if (!file || !pageRanges.trim()) return;
    setSplitting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const ranges = pageRanges.split(',').map(r => r.trim());
      
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        let startPage, endPage;
        if (range.includes('-')) {
          [startPage, endPage] = range.split('-').map(n => parseInt(n.trim()));
        } else {
          startPage = endPage = parseInt(range);
        }
        
        const newPdf = await window.PDFLib.PDFDocument.create();
        for (let p = startPage; p <= endPage; p++) {
          if (p >= 1 && p <= numPages) {
            const [copiedPage] = await newPdf.copyPages(sourcePdf, [p - 1]);
            newPdf.addPage(copiedPage);
          }
        }
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `split_${i + 1}_pages_${startPage}-${endPage}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert('Error splitting PDF: ' + err.message);
    }
    setSplitting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {numPages > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Total pages: {numPages}</div>}
      </div>
      <div>
        <Label>Page Ranges (e.g., 1-5, 7, 10-12)</Label>
        <Input value={pageRanges} onChange={setPageRanges} placeholder="1-3, 5, 7-9" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Separate ranges with commas. Each range will create a separate PDF.</div>
      </div>
      <Btn onClick={splitPdf} disabled={!file || !pageRanges.trim() || splitting}>
        {splitting ? 'Splitting...' : 'Split PDF'}
      </Btn>
    </VStack>
  );
}

// PDF Page Extractor Component
function PdfPageExtractor() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
    setNumPages(pdf.getPageCount());
  };

  const extractPages = async () => {
    if (!file || !pages.trim()) return;
    setExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await window.PDFLib.PDFDocument.create();
      
      const pageList = pages.split(',').flatMap(part => {
        part = part.trim();
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [parseInt(part)];
      });
      
      for (const pageNum of pageList) {
        if (pageNum >= 1 && pageNum <= numPages) {
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_pages.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error extracting pages: ' + err.message);
    }
    setExtracting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {numPages > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Total pages: {numPages}</div>}
      </div>
      <div>
        <Label>Pages to Extract (e.g., 1, 3-5, 8)</Label>
        <Input value={pages} onChange={setPages} placeholder="1, 3-5, 8" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>All specified pages will be combined into one PDF.</div>
      </div>
      <Btn onClick={extractPages} disabled={!file || !pages.trim() || extracting}>
        {extracting ? 'Extracting...' : 'Extract Pages'}
      </Btn>
    </VStack>
  );
}

// PDF Rotator Component
function PdfRotator() {
  const [file, setFile] = useState(null);
  const [rotation, setRotation] = useState('90');
  const [pageRange, setPageRange] = useState('all');
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const rotatePdf = async () => {
    if (!file) return;
    setRotating(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const rotationDegrees = parseInt(rotation);
      
      pages.forEach((page, i) => {
        if (pageRange === 'all' || 
            (pageRange === 'odd' && i % 2 === 0) || 
            (pageRange === 'even' && i % 2 === 1)) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(window.PDFLib.degrees((currentRotation + rotationDegrees) % 360));
        }
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rotated.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error rotating PDF: ' + err.message);
    }
    setRotating(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Rotation Angle</Label>
        <SelectInput value={rotation} onChange={setRotation} options={[
          { value:'90', label:'90° Clockwise' },
          { value:'180', label:'180°' },
          { value:'270', label:'270° Clockwise (90° Counter)' }
        ]} />
      </div>
      <div>
        <Label>Apply to Pages</Label>
        <SelectInput value={pageRange} onChange={setPageRange} options={[
          { value:'all', label:'All Pages' },
          { value:'odd', label:'Odd Pages' },
          { value:'even', label:'Even Pages' }
        ]} />
      </div>
      <Btn onClick={rotatePdf} disabled={!file || rotating}>
        {rotating ? 'Rotating...' : 'Rotate PDF'}
      </Btn>
    </VStack>
  );
}

// PDF Reorder Component
function PdfReorder() {
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
    const count = pdf.getPageCount();
    setNumPages(count);
    setOrder(Array.from({ length: count }, (_, i) => i + 1).join(', '));
  };

  const reorderPdf = async () => {
    if (!file || !order.trim()) return;
    setReordering(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await window.PDFLib.PDFDocument.create();
      
      const pageOrder = order.split(',').map(n => parseInt(n.trim()));
      
      for (const pageNum of pageOrder) {
        if (pageNum >= 1 && pageNum <= numPages) {
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
          newPdf.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reordered.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error reordering PDF: ' + err.message);
    }
    setReordering(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {numPages > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Total pages: {numPages}</div>}
      </div>
      {numPages > 0 && (
        <div>
          <Label>Page Order (comma-separated page numbers)</Label>
          <Textarea value={order} onChange={setOrder} rows={3} placeholder="1, 3, 2, 5, 4" />
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Enter page numbers in the order you want them to appear.</div>
        </div>
      )}
      <Btn onClick={reorderPdf} disabled={!file || !order.trim() || reordering}>
        {reordering ? 'Reordering...' : 'Reorder Pages'}
      </Btn>
    </VStack>
  );
}

// PDF Delete Pages Component
function PdfDeletePages() {
  const [file, setFile] = useState(null);
  const [pagesToDelete, setPagesToDelete] = useState('');
  const [numPages, setNumPages] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const arrayBuffer = await selectedFile.arrayBuffer();
    const pdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
    setNumPages(pdf.getPageCount());
  };

  const deletePages = async () => {
    if (!file || !pagesToDelete.trim()) return;
    setDeleting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const newPdf = await window.PDFLib.PDFDocument.create();
      
      const deleteList = pagesToDelete.split(',').flatMap(part => {
        part = part.trim();
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(n => parseInt(n.trim()));
          return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }
        return [parseInt(part)];
      });
      
      const deleteSet = new Set(deleteList);
      
      for (let i = 1; i <= numPages; i++) {
        if (!deleteSet.has(i)) {
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [i - 1]);
          newPdf.addPage(copiedPage);
        }
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pages_deleted.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error deleting pages: ' + err.message);
    }
    setDeleting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {numPages > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Total pages: {numPages}</div>}
      </div>
      <div>
        <Label>Pages to Delete (e.g., 2, 4-6, 9)</Label>
        <Input value={pagesToDelete} onChange={setPagesToDelete} placeholder="2, 4-6, 9" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Specify which pages to remove from the PDF.</div>
      </div>
      <Btn onClick={deletePages} disabled={!file || !pagesToDelete.trim() || deleting}>
        {deleting ? 'Deleting...' : 'Delete Pages'}
      </Btn>
    </VStack>
  );
}

// PDF to JPG Component
function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState('85');
  const [dpi, setDpi] = useState('150');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const convertToJpg = async () => {
    if (!file) return;
    setConverting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const scale = parseInt(dpi) / 72;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `page_${i}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/jpeg', parseInt(quality) / 100);
      }
    } catch (err) {
      alert('Error converting PDF: ' + err.message);
    }
    setConverting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>DPI (Resolution)</Label>
        <SelectInput value={dpi} onChange={setDpi} options={[
          { value:'72', label:'72 DPI (Screen)' },
          { value:'150', label:'150 DPI (Good)' },
          { value:'300', label:'300 DPI (Print)' },
          { value:'600', label:'600 DPI (High)' }
        ]} />
      </div>
      <div>
        <Label>JPG Quality (1-100)</Label>
        <Input value={quality} onChange={setQuality} placeholder="85" />
      </div>
      <Btn onClick={convertToJpg} disabled={!file || converting}>
        {converting ? 'Converting...' : 'Convert to JPG'}
      </Btn>
    </VStack>
  );
}

// PDF to PNG Component
function PdfToPng() {
  const [file, setFile] = useState(null);
  const [dpi, setDpi] = useState('150');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const convertToPng = async () => {
    if (!file) return;
    setConverting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const scale = parseInt(dpi) / 72;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `page_${i}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      }
    } catch (err) {
      alert('Error converting PDF: ' + err.message);
    }
    setConverting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>DPI (Resolution)</Label>
        <SelectInput value={dpi} onChange={setDpi} options={[
          { value:'72', label:'72 DPI (Screen)' },
          { value:'150', label:'150 DPI (Good)' },
          { value:'300', label:'300 DPI (Print)' },
          { value:'600', label:'600 DPI (High)' }
        ]} />
      </div>
      <Btn onClick={convertToPng} disabled={!file || converting}>
        {converting ? 'Converting...' : 'Convert to PNG'}
      </Btn>
    </VStack>
  );
}

// JPG to PDF Component
function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setConverting(true);
    try {
      const pdfDoc = await window.PDFLib.PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const image = await pdfDoc.embedJpg(arrayBuffer);
        
        let page;
        if (pageSize === 'fit') {
          page = pdfDoc.addPage([image.width, image.height]);
        } else if (pageSize === 'a4') {
          page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
        } else {
          page = pdfDoc.addPage([612, 792]); // Letter in points
        }
        
        const { width, height } = page.getSize();
        const scale = Math.min(width / image.width, height / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        
        page.drawImage(image, {
          x: (width - scaledWidth) / 2,
          y: (height - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images_to_pdf.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error converting to PDF: ' + err.message);
    }
    setConverting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Select JPG Images</Label>
        <input type="file" accept="image/jpeg,image/jpg" multiple onChange={handleFiles} style={{ display:"block", color:C.text, fontSize:13 }} />
        {files.length > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{files.length} image(s) selected</div>}
      </div>
      <div>
        <Label>Page Size</Label>
        <SelectInput value={pageSize} onChange={setPageSize} options={[
          { value:'fit', label:'Fit to Image' },
          { value:'a4', label:'A4 (210 × 297 mm)' },
          { value:'letter', label:'Letter (8.5 × 11 in)' }
        ]} />
      </div>
      <Btn onClick={convertToPdf} disabled={files.length === 0 || converting}>
        {converting ? 'Converting...' : 'Convert to PDF'}
      </Btn>
    </VStack>
  );
}

// PNG to PDF Component
function PngToPdf() {
  const [files, setFiles] = useState([]);
  const [pageSize, setPageSize] = useState('a4');
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const convertToPdf = async () => {
    if (files.length === 0) return;
    setConverting(true);
    try {
      const pdfDoc = await window.PDFLib.PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const image = await pdfDoc.embedPng(arrayBuffer);
        
        let page;
        if (pageSize === 'fit') {
          page = pdfDoc.addPage([image.width, image.height]);
        } else if (pageSize === 'a4') {
          page = pdfDoc.addPage([595.28, 841.89]);
        } else {
          page = pdfDoc.addPage([612, 792]);
        }
        
        const { width, height } = page.getSize();
        const scale = Math.min(width / image.width, height / image.height);
        const scaledWidth = image.width * scale;
        const scaledHeight = image.height * scale;
        
        page.drawImage(image, {
          x: (width - scaledWidth) / 2,
          y: (height - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images_to_pdf.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error converting to PDF: ' + err.message);
    }
    setConverting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Select PNG Images</Label>
        <input type="file" accept="image/png" multiple onChange={handleFiles} style={{ display:"block", color:C.text, fontSize:13 }} />
        {files.length > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>{files.length} image(s) selected</div>}
      </div>
      <div>
        <Label>Page Size</Label>
        <SelectInput value={pageSize} onChange={setPageSize} options={[
          { value:'fit', label:'Fit to Image' },
          { value:'a4', label:'A4 (210 × 297 mm)' },
          { value:'letter', label:'Letter (8.5 × 11 in)' }
        ]} />
      </div>
      <Btn onClick={convertToPdf} disabled={files.length === 0 || converting}>
        {converting ? 'Converting...' : 'Convert to PDF'}
      </Btn>
    </VStack>
  );
}

// PDF to Text Component
function PdfToText() {
  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    };
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const convertToText = async () => {
    if (!file) return;
    setConverting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      
      const blob = new Blob([fullText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted_text.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error converting PDF: ' + err.message);
    }
    setConverting(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <Btn onClick={convertToText} disabled={!file || converting}>
        {converting ? 'Converting...' : 'Convert to Text File'}
      </Btn>
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚠️ This extracts embedded text only. Scanned PDFs (images) require OCR.
      </div>
    </VStack>
  );
}

// Word to PDF Component (not available client-side yet)
function WordToPdf() {
  return (
    <div style={{ padding:48, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
      <div style={{ fontSize:40, marginBottom:12 }}>ℹ️</div>
      <div style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:8 }}>Not available in your browser yet</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:4, lineHeight:1.6 }}>Word-to-PDF conversion needs full document rendering that can't run entirely in your browser yet — and your files are never uploaded to any server. Tip: open the document in your word processor and choose Print → Save as PDF.</div>
    </div>
  );
}

// PDF Password Protect Component
function PdfPasswordProtect() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState(false);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setNotice(false);
  };

  const protectPdf = () => {
    if (!file || !password) return;
    setNotice(true);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Password</Label>
        <Input value={password} onChange={setPassword} placeholder="Enter secure password" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
      </div>
      <Btn onClick={protectPdf} disabled={!file || !password}>Add Password Protection</Btn>
      {notice && (
        <div style={{ padding:14, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6 }}>
          <strong>In-browser PDF encryption isn't available yet.</strong><br />
          Standard PDF password protection needs an encryption engine that browsers can't run fully client-side, and ToolsRift never uploads your file to a server — so this tool can't lock your PDF right now. Your file stayed entirely on your device. A private, in-browser encryptor is on our roadmap.
        </div>
      )}
      <div style={{ padding:12, background:"rgba(59,130,246,0.08)", border:`1px solid rgba(59,130,246,0.2)`, borderRadius:8, fontSize:12, color:C.text }}>
        🔒 100% local — files are processed in your browser and never uploaded.
      </div>
    </VStack>
  );
}

// PDF Unlock Component
// pdf.js decrypts the document (with the password, if one is set), then each page is
// rasterised and rebuilt into a fresh, unencrypted PDF. This is why the output is
// image-based: pdf-lib cannot re-emit the original encrypted content streams.
function PdfUnlock() {
  const [file, setFile]         = useState(null);
  const [password, setPassword] = useState('');
  const [needsPw, setNeedsPw]   = useState(false);
  const [pages, setPages]       = useState(0);
  const [progress, setProgress] = useState('');
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState(null);

  const reset = () => { setNeedsPw(false); setPages(0); setErr(null); setProgress(''); };

  // Probe without a password so we can tell a permissions-locked file (opens fine)
  // from a user-password file (throws PasswordException).
  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); reset(); setBusy(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const data = new Uint8Array(await f.arrayBuffer());
      const pdf  = await pdfjsLib.getDocument({ data }).promise;
      setPages(pdf.numPages);
    } catch (ex) {
      if (ex?.name === 'PasswordException') setNeedsPw(true);
      else setErr(`Could not read this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  const unlockPdf = async () => {
    setBusy(true); setErr(null);
    try {
      const pdfjsLib = await loadPdfJs();
      const PDFLib   = await loadPdfLib();
      // pdf.js may transfer the buffer to its worker — hand it a private copy.
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf  = await pdfjsLib.getDocument(password ? { data, password } : { data }).promise;

      const out = await PDFLib.PDFDocument.create();
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rebuilding page ${i} of ${pdf.numPages}…`);
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });     // 2x for legible raster
        const canvas   = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        const png    = await out.embedPng(canvas.toDataURL('image/png'));
        const outPg  = out.addPage([viewport.width / 2, viewport.height / 2]);
        outPg.drawImage(png, { x:0, y:0, width: outPg.getWidth(), height: outPg.getHeight() });
      }
      setProgress('');
      downloadBlob(await out.save(), 'unlocked.pdf', 'application/pdf');
    } catch (ex) {
      setProgress('');
      if (ex?.name === 'PasswordException') setErr('That password is incorrect. Check it and try again.');
      else setErr(`Could not unlock this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload Protected PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {file && <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{file.name}{pages ? ` — ${pages} pages` : ''}</div>}
      </div>

      {needsPw && (
        <div>
          <Label>Password</Label>
          <Input value={password} onChange={setPassword} placeholder="Enter PDF password" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
        </div>
      )}

      {file && !needsPw && pages > 0 && (
        <InfoNote>
          This PDF opens without a password — it is locked only against editing, printing or copying. Unlocking will remove those restrictions.
        </InfoNote>
      )}

      <Btn onClick={unlockPdf} disabled={!file || busy || (needsPw && !password)}>
        {busy ? (progress || 'Working…') : 'Unlock PDF'}
      </Btn>

      <ErrorNote>{err}</ErrorNote>

      <InfoNote tone="amber">
        <strong>The unlocked PDF is image-based.</strong> Each page is re-rendered as a picture, so the result is not searchable or selectable and the file will be larger. This is the only way to strip encryption without sending your file to a server. You must have the right to remove protection from the document.
      </InfoNote>
      <InfoNote>🔒 100% local — nothing you upload ever leaves your browser.</InfoNote>
    </VStack>
  );
}

// PDF Watermark Component
function PdfWatermark() {
  const [file, setFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [fontSize, setFontSize] = useState('48');
  const [opacity, setOpacity] = useState('0.3');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const addWatermark = async () => {
    if (!file || !watermarkText) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * parseInt(fontSize)) / 4,
          y: height / 2,
          size: parseInt(fontSize),
          font: font,
          color: window.PDFLib.rgb(0.5, 0.5, 0.5),
          opacity: parseFloat(opacity),
          rotate: window.PDFLib.degrees(45),
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error adding watermark: ' + err.message);
    }
    setProcessing(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Watermark Text</Label>
        <Input value={watermarkText} onChange={setWatermarkText} placeholder="CONFIDENTIAL" />
      </div>
      <Grid2>
        <div>
          <Label>Font Size</Label>
          <Input value={fontSize} onChange={setFontSize} placeholder="48" />
        </div>
        <div>
          <Label>Opacity (0-1)</Label>
          <Input value={opacity} onChange={setOpacity} placeholder="0.3" />
        </div>
      </Grid2>
      <Btn onClick={addWatermark} disabled={!file || !watermarkText || processing}>
        {processing ? 'Adding Watermark...' : 'Add Watermark'}
      </Btn>
    </VStack>
  );
}

// PDF Redact Component (not available client-side yet)
// PDF Redaction Component — true redaction, not a black rectangle over live text.
// Each page is rasterised, the marked areas are painted out on the bitmap, and the
// PDF is rebuilt from those bitmaps. The original text/vector content is discarded,
// so redacted words cannot be recovered by selecting or copying.
function PdfRedact() {
  const [file, setFile]     = useState(null);
  const [pdf, setPdf]       = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [rects, setRects]   = useState({});     // { [pageNum]: [{x,y,w,h}] } as 0..1 fractions
  const [drawing, setDrawing] = useState(null); // in-progress rect, fractions
  const [busy, setBusy]     = useState(false);
  const [progress, setProgress] = useState('');
  const [err, setErr]       = useState(null);
  const canvasRef  = useRef(null);
  const overlayRef = useRef(null);
  // The in-progress rect also lives in a ref: React batches state updates, so a fast
  // drag can deliver mousemove and mouseup in one batch and `drawing` would still
  // hold the mousedown point, silently dropping the box.
  const drawRef = useRef(null);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setErr(null); setRects({}); setPageNum(1); setPdf(null); setBusy(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const data = new Uint8Array(await f.arrayBuffer());
      setPdf(await pdfjsLib.getDocument({ data }).promise);
    } catch (ex) {
      setErr(ex?.name === 'PasswordException'
        ? 'This PDF is password-protected. Unlock it first with the PDF Password Remover.'
        : `Could not read this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  // Render the current page into the preview canvas whenever it changes.
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      const page = await pdf.getPage(pageNum);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(680 / base.width, 2);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    })();
    return () => { cancelled = true; };
  }, [pdf, pageNum]);

  const toFraction = (e) => {
    const box = overlayRef.current.getBoundingClientRect();
    return {
      x: Math.min(Math.max((e.clientX - box.left) / box.width, 0), 1),
      y: Math.min(Math.max((e.clientY - box.top) / box.height, 0), 1),
    };
  };

  const onDown = (e) => {
    const p = toFraction(e);
    drawRef.current = { x0:p.x, y0:p.y, x1:p.x, y1:p.y };
    setDrawing(drawRef.current);
  };
  const onMove = (e) => {
    if (!drawRef.current) return;
    const p = toFraction(e);
    drawRef.current = { ...drawRef.current, x1:p.x, y1:p.y };
    setDrawing(drawRef.current);
  };
  const onUp = () => {
    const d = drawRef.current;
    drawRef.current = null;
    setDrawing(null);
    if (!d) return;
    const r = {
      x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1),
      w: Math.abs(d.x1 - d.x0), h: Math.abs(d.y1 - d.y0),
    };
    if (r.w < 0.005 || r.h < 0.005) return;   // ignore stray clicks
    setRects(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), r] }));
  };

  const clearPage = () => setRects(prev => ({ ...prev, [pageNum]: [] }));
  const undo = () => setRects(prev => ({ ...prev, [pageNum]: (prev[pageNum] || []).slice(0, -1) }));

  const totalRects = Object.values(rects).reduce((n, a) => n + a.length, 0);

  const applyRedaction = async () => {
    setBusy(true); setErr(null);
    try {
      const PDFLib = await loadPdfLib();
      const out = await PDFLib.PDFDocument.create();
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Redacting page ${i} of ${pdf.numPages}…`);
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas   = document.createElement('canvas');
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;

        // Paint the marked areas onto the bitmap — the text underneath is gone.
        ctx.fillStyle = '#000';
        for (const r of rects[i] || []) {
          ctx.fillRect(r.x * canvas.width, r.y * canvas.height, r.w * canvas.width, r.h * canvas.height);
        }

        const png   = await out.embedPng(canvas.toDataURL('image/png'));
        const outPg = out.addPage([viewport.width / 2, viewport.height / 2]);
        outPg.drawImage(png, { x:0, y:0, width: outPg.getWidth(), height: outPg.getHeight() });
      }
      setProgress('');
      downloadBlob(await out.save(), 'redacted.pdf', 'application/pdf');
    } catch (ex) {
      setProgress('');
      setErr(`Could not redact this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  const pageRects = rects[pageNum] || [];
  const preview = drawing && {
    x: Math.min(drawing.x0, drawing.x1), y: Math.min(drawing.y0, drawing.y1),
    w: Math.abs(drawing.x1 - drawing.x0), h: Math.abs(drawing.y1 - drawing.y0),
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>

      {busy && !pdf && <div style={{ textAlign:"center", color:C.muted }}>Loading…</div>}
      <ErrorNote>{err}</ErrorNote>

      {pdf && (
        <>
          <InfoNote>Drag on the page to draw a black box over anything you want removed. Boxes are saved per page.</InfoNote>

          <div style={{ position:'relative', display:'inline-block', maxWidth:'100%', alignSelf:'center', lineHeight:0 }}>
            <canvas ref={canvasRef} style={{ maxWidth:'100%', height:'auto', borderRadius:8, border:`1px solid ${C.border}` }} />
            <div
              ref={overlayRef}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
              style={{ position:'absolute', inset:0, cursor:'crosshair' }}
            >
              {[...pageRects, ...(preview ? [preview] : [])].map((r, i) => (
                <div key={i} style={{
                  position:'absolute',
                  left:`${r.x * 100}%`, top:`${r.y * 100}%`,
                  width:`${r.w * 100}%`, height:`${r.h * 100}%`,
                  background:'#000', border:'1px solid #EF4444',
                }} />
              ))}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', justifyContent:'center' }}>
            <Btn variant="secondary" size="sm" onClick={() => setPageNum(p => Math.max(1, p - 1))} disabled={pageNum <= 1}>← Prev</Btn>
            <span style={{ fontSize:13, color:C.muted }}>Page {pageNum} of {pdf.numPages}</span>
            <Btn variant="secondary" size="sm" onClick={() => setPageNum(p => Math.min(pdf.numPages, p + 1))} disabled={pageNum >= pdf.numPages}>Next →</Btn>
            <Btn variant="ghost" size="sm" onClick={undo} disabled={!pageRects.length}>Undo</Btn>
            <Btn variant="ghost" size="sm" onClick={clearPage} disabled={!pageRects.length}>Clear page</Btn>
          </div>

          <Btn onClick={applyRedaction} disabled={busy || !totalRects}>
            {busy ? (progress || 'Working…') : `Apply ${totalRects} Redaction${totalRects === 1 ? '' : 's'} & Download`}
          </Btn>

          <InfoNote tone="amber">
            <strong>Redaction is permanent and rasterises the document.</strong> Every page is rebuilt as an image, so hidden text under the boxes is destroyed — but the whole PDF also stops being searchable or selectable, and the file gets larger. Always verify the output before sharing it.
          </InfoNote>
        </>
      )}

      <InfoNote>🔒 100% local — files are processed in your browser and never uploaded.</InfoNote>
    </VStack>
  );
}

// PDF Compressor Component
function PdfCompressor() {
  const [file, setFile] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setOriginalSize((selectedFile.size / 1024).toFixed(2));
    setResult(null);
    setError('');
  };

  const compressPdf = async () => {
    if (!file) return;
    if (!window.PDFLib) { setError('The PDF engine is still loading — please try again in a moment.'); return; }
    setProcessing(true); setError(''); setResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'compressed.pdf'; a.click();
      URL.revokeObjectURL(url);
      setResult({ before: file.size, after: pdfBytes.byteLength });
    } catch (err) {
      setError('Could not process this PDF: ' + err.message);
    }
    setProcessing(false);
  };

  const saved = result ? Math.max(0, result.before - result.after) : 0;
  const pct = result && result.before ? ((saved / result.before) * 100).toFixed(1) : '0';

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {originalSize > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Original size: {originalSize} KB</div>}
      </div>
      <Btn onClick={compressPdf} disabled={!file || processing}>{processing ? 'Optimizing...' : 'Compress & Download'}</Btn>
      {result && (
        <div style={{ padding:14, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6 }}>
          <strong>Optimized PDF downloaded.</strong><br />
          {(result.before/1024).toFixed(1)} KB → {(result.after/1024).toFixed(1)} KB
          {saved > 0 ? ` (${pct}% smaller).` : ' (already well-optimized — little structural overhead to remove).'}
        </div>
      )}
      {error && (
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>{error}</div>
      )}
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text, lineHeight:1.6 }}>
        ⚠️ This tool strips structural overhead in your browser. Deep re-compression of scanned or image-heavy PDFs isn't possible fully client-side yet — for those, shrink the images first with the ToolsRift <a href="/images" style={{ color:'#60A5FA' }}>Image Compressor</a>, then rebuild the PDF.
      </div>
    </VStack>
  );
}

// PDF Optimizer Component
function PdfOptimizer() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError('');
  };

  const optimizePdf = async () => {
    if (!file) return;
    if (!window.PDFLib) { setError('The PDF engine is still loading — please try again in a moment.'); return; }
    setProcessing(true); setError(''); setResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'optimized.pdf'; a.click();
      URL.revokeObjectURL(url);
      setResult({ before: file.size, after: pdfBytes.byteLength });
    } catch (err) {
      setError('Could not optimize this PDF: ' + err.message);
    }
    setProcessing(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <Btn onClick={optimizePdf} disabled={!file || processing}>{processing ? 'Optimizing...' : 'Optimize & Download'}</Btn>
      {result && (
        <div style={{ padding:14, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, fontSize:13, color:C.text, lineHeight:1.6 }}>
          <strong>Optimized PDF downloaded.</strong><br />
          Re-serialized with compressed object streams. {(result.before/1024).toFixed(1)} KB → {(result.after/1024).toFixed(1)} KB.
        </div>
      )}
      {error && (
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>{error}</div>
      )}
      <div style={{ padding:12, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚡ Rewrites the PDF with object streams for smaller size and faster page-at-a-time web loading — entirely in your browser.
      </div>
    </VStack>
  );
}

// PDF Metadata Editor Component
function PdfMetadataEditor() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      setTitle(pdfDoc.getTitle() || '');
      setAuthor(pdfDoc.getAuthor() || '');
      setSubject(pdfDoc.getSubject() || '');
      setKeywords(pdfDoc.getKeywords() || '');
    } catch (err) {
      alert('Error reading PDF: ' + err.message);
    }
  };

  const saveMetadata = async () => {
    if (!file) return;
    setSaving(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      
      if (title) pdfDoc.setTitle(title);
      if (author) pdfDoc.setAuthor(author);
      if (subject) pdfDoc.setSubject(subject);
      if (keywords) pdfDoc.setKeywords(keywords);
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metadata_updated.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error saving metadata: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {file && (
        <>
          <div><Label>Title</Label><Input value={title} onChange={setTitle} placeholder="Document title" /></div>
          <div><Label>Author</Label><Input value={author} onChange={setAuthor} placeholder="Author name" /></div>
          <div><Label>Subject</Label><Input value={subject} onChange={setSubject} placeholder="Document subject" /></div>
          <div><Label>Keywords</Label><Input value={keywords} onChange={setKeywords} placeholder="keyword1, keyword2" /></div>
          <Btn onClick={saveMetadata} disabled={saving}>
            {saving ? 'Saving...' : 'Save Metadata'}
          </Btn>
        </>
      )}
    </VStack>
  );
}

// PDF Page Numbering Component
function PdfPageNumbering() {
  const [file, setFile] = useState(null);
  const [position, setPosition] = useState('bottom-center');
  const [startNum, setStartNum] = useState('1');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const addPageNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(window.PDFLib.StandardFonts.Helvetica);
      
      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const pageNum = (parseInt(startNum) + i).toString();
        let x, y;
        
        if (position === 'bottom-center') {
          x = width / 2 - 10;
          y = 20;
        } else if (position === 'bottom-right') {
          x = width - 40;
          y = 20;
        } else {
          x = 20;
          y = 20;
        }
        
        page.drawText(pageNum, {
          x, y,
          size: 12,
          font: font,
          color: window.PDFLib.rgb(0.3, 0.3, 0.3),
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'numbered.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error adding page numbers: ' + err.message);
    }
    setProcessing(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Position</Label>
        <SelectInput value={position} onChange={setPosition} options={[
          { value:'bottom-left', label:'Bottom Left' },
          { value:'bottom-center', label:'Bottom Center' },
          { value:'bottom-right', label:'Bottom Right' }
        ]} />
      </div>
      <div>
        <Label>Starting Number</Label>
        <Input value={startNum} onChange={setStartNum} placeholder="1" />
      </div>
      <Btn onClick={addPageNumbers} disabled={!file || processing}>
        {processing ? 'Adding Numbers...' : 'Add Page Numbers'}
      </Btn>
    </VStack>
  );
}

// PDF Margin Adder Component
function PdfMarginAdder() {
  const [file, setFile] = useState(null);
  const [margin, setMargin] = useState('20');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setDone(false);
    setError('');
  };

  const addMargins = async () => {
    if (!file) return;
    if (!window.PDFLib) { setError('The PDF engine is still loading — please try again in a moment.'); return; }
    setProcessing(true); setError(''); setDone(false);
    try {
      const m = parseFloat(margin) || 0;
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      const newDoc = await window.PDFLib.PDFDocument.create();
      const count = srcDoc.getPageCount();
      for (let i = 0; i < count; i++) {
        const src = srcDoc.getPage(i);
        const { width, height } = src.getSize();
        const embedded = await newDoc.embedPage(src);
        const np = newDoc.addPage([width + m * 2, height + m * 2]);
        np.drawPage(embedded, { x: m, y: m, width, height });
      }
      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'with-margins.pdf'; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError('Could not add margins: ' + err.message);
    }
    setProcessing(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Margin Size (points)</Label>
        <Input value={margin} onChange={setMargin} placeholder="20" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>72 points = 1 inch. White margins are added around every page.</div>
      </div>
      <Btn onClick={addMargins} disabled={!file || processing}>{processing ? 'Adding Margins...' : 'Add Margins & Download'}</Btn>
      {done && (
        <div style={{ padding:14, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, fontSize:13, color:C.text }}>
          <strong>Done.</strong> Your PDF with {parseFloat(margin) || 0}pt margins has been downloaded.
        </div>
      )}
      {error && (
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>{error}</div>
      )}
    </VStack>
  );
}

// PDF Cropper Component
function PdfCropper() {
  const [file, setFile] = useState(null);
  const [crop, setCrop] = useState('20');
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
    setDone(false);
    setError('');
  };

  const cropPdf = async () => {
    if (!file) return;
    if (!window.PDFLib) { setError('The PDF engine is still loading — please try again in a moment.'); return; }
    setProcessing(true); setError(''); setDone(false);
    try {
      const c = parseFloat(crop) || 0;
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      pdfDoc.getPages().forEach(p => {
        const { width, height } = p.getSize();
        const nw = Math.max(1, width - c * 2);
        const nh = Math.max(1, height - c * 2);
        p.setCropBox(c, c, nw, nh);
      });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'cropped.pdf'; a.click();
      URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      setError('Could not crop this PDF: ' + err.message);
    }
    setProcessing(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Crop Margin (points from each edge)</Label>
        <Input value={crop} onChange={setCrop} placeholder="20" />
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>72 points = 1 inch. Trims the visible area evenly on all sides.</div>
      </div>
      <Btn onClick={cropPdf} disabled={!file || processing}>{processing ? 'Cropping...' : 'Crop & Download'}</Btn>
      {done && (
        <div style={{ padding:14, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, fontSize:13, color:C.text }}>
          <strong>Done.</strong> Your cropped PDF has been downloaded.
        </div>
      )}
      {error && (
        <div style={{ padding:12, background:"rgba(239,68,68,0.1)", border:`1px solid rgba(239,68,68,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>{error}</div>
      )}
    </VStack>
  );
}

// PDF Bookmarks Component (not available client-side yet)
function PdfBookmarks() {
  return (
    <div style={{ padding:48, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
      <div style={{ fontSize:40, marginBottom:12 }}>ℹ️</div>
      <div style={{ color:C.text, fontWeight:700, fontSize:17, marginBottom:8 }}>Not available in your browser yet</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:4, lineHeight:1.6 }}>Editing a PDF's bookmark/outline structure isn't supported by the in-browser PDF engine yet. Your files are never uploaded. We're working on adding this — check back soon.</div>
    </div>
  );
}

// PDF Form Filler Component — reads AcroForm fields via pdf-lib and writes them back.
function PdfFormFiller() {
  const [file, setFile]     = useState(null);
  const [fields, setFields] = useState(null);
  const [values, setValues] = useState({});
  const [flatten, setFlatten] = useState(false);
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState(null);
  const bytesRef = useRef(null);

  const readField = (PDFLib, fd) => {
    const name = fd.getName();
    if (fd instanceof PDFLib.PDFTextField)   return { name, type:'text',     value: fd.getText() || '' };
    if (fd instanceof PDFLib.PDFCheckBox)    return { name, type:'checkbox', value: fd.isChecked() };
    if (fd instanceof PDFLib.PDFDropdown)    return { name, type:'dropdown', value: fd.getSelected()[0] || '', options: fd.getOptions() };
    if (fd instanceof PDFLib.PDFRadioGroup)  return { name, type:'radio',    value: fd.getSelected() || '',    options: fd.getOptions() };
    if (fd instanceof PDFLib.PDFOptionList)  return { name, type:'option',   value: fd.getSelected()[0] || '', options: fd.getOptions() };
    return { name, type:'unsupported', value:'' };
  };

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setErr(null); setFields(null); setValues({}); setBusy(true);
    try {
      const PDFLib = await loadPdfLib();
      const bytes  = await f.arrayBuffer();
      bytesRef.current = bytes;
      const doc  = await PDFLib.PDFDocument.load(bytes);
      const list = doc.getForm().getFields().map(fd => readField(PDFLib, fd));
      setFields(list);
      setValues(Object.fromEntries(list.map(fl => [fl.name, fl.value])));
    } catch (ex) {
      setErr(`Could not read this PDF's form: ${ex.message}`);
    }
    setBusy(false);
  };

  const save = async () => {
    setBusy(true); setErr(null);
    try {
      const PDFLib = await loadPdfLib();
      const doc  = await PDFLib.PDFDocument.load(bytesRef.current);
      const form = doc.getForm();
      const skipped = [];
      for (const fl of fields) {
        const v = values[fl.name];
        try {
          if      (fl.type === 'text')     form.getTextField(fl.name).setText(String(v ?? ''));
          else if (fl.type === 'checkbox') { const cb = form.getCheckBox(fl.name); v ? cb.check() : cb.uncheck(); }
          else if (fl.type === 'dropdown' && v) form.getDropdown(fl.name).select(v);
          else if (fl.type === 'radio'    && v) form.getRadioGroup(fl.name).select(v);
          else if (fl.type === 'option'   && v) form.getOptionList(fl.name).select(v);
        } catch {
          skipped.push(fl.name);   // field rejected the value (e.g. read-only) — keep going
        }
      }
      if (flatten) form.flatten();
      downloadBlob(await doc.save(), 'filled-form.pdf', 'application/pdf');
      if (skipped.length) setErr(`Saved, but these fields could not be set (they may be read-only): ${skipped.join(', ')}`);
    } catch (ex) {
      setErr(`Could not save the filled PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  const setVal = (name, v) => setValues(prev => ({ ...prev, [name]: v }));
  const fillable = fields?.filter(f => f.type !== 'unsupported') || [];

  return (
    <VStack>
      <div>
        <Label>Upload a fillable PDF form</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {file && <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{file.name}</div>}
      </div>

      {busy && <div style={{ textAlign:"center", color:C.muted }}>Working…</div>}
      <ErrorNote>{err}</ErrorNote>

      {fields && fields.length === 0 && (
        <InfoNote tone="amber">
          This PDF has no interactive form fields. It may be a flat document or a scan — in that case use the <strong>PDF Editor</strong> or <strong>PDF Watermark</strong> tool to place text on the page.
        </InfoNote>
      )}

      {fillable.length > 0 && (
        <>
          <Label>{fillable.length} field{fillable.length === 1 ? '' : 's'} found</Label>
          <VStack gap={14}>
            {fillable.map(fl => (
              <div key={fl.name}>
                <Label>{fl.name}</Label>
                {fl.type === 'text' && (
                  <Input value={values[fl.name] || ''} onChange={v => setVal(fl.name, v)} placeholder="Enter value" />
                )}
                {fl.type === 'checkbox' && (
                  <label style={{ display:'flex', alignItems:'center', gap:8, color:C.text, fontSize:13, cursor:'pointer' }}>
                    <input type="checkbox" checked={!!values[fl.name]} onChange={e => setVal(fl.name, e.target.checked)} />
                    {values[fl.name] ? 'Checked' : 'Unchecked'}
                  </label>
                )}
                {(fl.type === 'dropdown' || fl.type === 'radio' || fl.type === 'option') && (
                  <SelectInput
                    value={values[fl.name] || ''}
                    onChange={v => setVal(fl.name, v)}
                    options={[{ value:'', label:'— none —' }, ...fl.options.map(o => ({ value:o, label:o }))]}
                    style={{ width:'100%' }}
                  />
                )}
              </div>
            ))}
          </VStack>

          <label style={{ display:'flex', alignItems:'center', gap:8, color:C.text, fontSize:13, cursor:'pointer' }}>
            <input type="checkbox" checked={flatten} onChange={e => setFlatten(e.target.checked)} />
            Flatten form (bake values into the page so they can no longer be edited)
          </label>

          <Btn onClick={save} disabled={busy}>Download Filled PDF</Btn>
        </>
      )}

      <InfoNote>🔒 100% local — files are processed in your browser and never uploaded.</InfoNote>
    </VStack>
  );
}

// ─── Data & AI tools ───────────────────────────────────────────────────────
// All four read the positioned text layer via extractDocLines() and reshape it.
// They work on PDFs with a real text layer; scans need OCR first.

function NoTextLayerNote() {
  return (
    <InfoNote tone="amber">
      No text was found. This PDF is probably a scan — it holds pictures of words, not words.
      Run it through an OCR tool first, then come back.
    </InfoNote>
  );
}

// PDF to Markdown — heading levels are inferred from font size vs. the document median.
function PdfToMarkdown() {
  const [file, setFile] = useState(null);
  const [md, setMd]     = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState(null);
  const [empty, setEmpty] = useState(false);

  const convert = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setErr(null); setMd(''); setEmpty(false); setBusy(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const data  = new Uint8Array(await f.arrayBuffer());
      const pdf   = await pdfjsLib.getDocument({ data }).promise;
      const pages = await extractDocLines(pdf);
      const med   = medianFontSize(pages);

      let out = '';
      pages.forEach((p, pi) => {
        if (pi > 0) out += '\n---\n\n';
        let prevY = null;
        for (const l of p.lines) {
          const ratio = med ? l.size / med : 1;
          let line = l.text;

          if (/^[•·▪◦‣]\s*/.test(line))            line = '- ' + line.replace(/^[•·▪◦‣]\s*/, '');
          else if (/^\d+[.)]\s+/.test(line))       line = line.replace(/^(\d+)[.)]\s+/, '$1. ');
          else if (ratio >= 1.6)                   line = '# '   + line;
          else if (ratio >= 1.32)                  line = '## '  + line;
          else if (ratio >= 1.15)                  line = '### ' + line;

          // A vertical gap much larger than the line height means a new paragraph.
          if (prevY !== null && (prevY - l.y) > l.size * 1.9) out += '\n';
          out += line + '\n';
          prevY = l.y;
        }
        out += '\n';
      });

      const body = out.replace(/\n{3,}/g, '\n\n').trim();
      if (!body) setEmpty(true);
      setMd(body);
    } catch (ex) {
      setErr(`Could not convert this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={convert} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {busy && <div style={{ textAlign:"center", color:C.muted }}>Converting to Markdown…</div>}
      <ErrorNote>{err}</ErrorNote>
      {empty && <NoTextLayerNote />}
      {md && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Label>Markdown</Label>
            <div style={{ display:'flex', gap:8 }}>
              <CopyBtn text={md} />
              <Btn size="sm" variant="secondary" onClick={() => downloadBlob(md, (file?.name || 'document').replace(/\.pdf$/i, '') + '.md', 'text/markdown')}>Download .md</Btn>
            </div>
          </div>
          <Textarea value={md} onChange={() => {}} rows={18} mono style={{ fontSize:12 }} />
          <InfoNote>Headings are inferred from relative font size, so unusual layouts may need a quick manual pass.</InfoNote>
        </>
      )}
    </VStack>
  );
}

// PDF to JSON — structured page/line output for pipelines and parsers.
function PdfToJson() {
  const [file, setFile]   = useState(null);
  const [json, setJson]   = useState('');
  const [positions, setPositions] = useState(true);
  const [pagesData, setPagesData] = useState(null);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);

  const build = (pages, withPos) => JSON.stringify({
    pages: pages.length,
    content: pages.map(p => ({
      page: p.page,
      width: Math.round(p.width),
      height: Math.round(p.height),
      lines: withPos
        ? p.lines.map(l => ({ text: l.text, x: +l.x.toFixed(1), y: +l.y.toFixed(1), fontSize: +l.size.toFixed(1) }))
        : p.lines.map(l => l.text),
    })),
  }, null, 2);

  const convert = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setErr(null); setJson(''); setBusy(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const data  = new Uint8Array(await f.arrayBuffer());
      const pdf   = await pdfjsLib.getDocument({ data }).promise;
      const pages = await extractDocLines(pdf);
      setPagesData(pages);
      setJson(build(pages, positions));
    } catch (ex) {
      setErr(`Could not convert this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  const togglePositions = (v) => {
    setPositions(v);
    if (pagesData) setJson(build(pagesData, v));
  };

  const hasText = pagesData && pagesData.some(p => p.lines.length);

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={convert} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <label style={{ display:'flex', alignItems:'center', gap:8, color:C.text, fontSize:13, cursor:'pointer' }}>
        <input type="checkbox" checked={positions} onChange={e => togglePositions(e.target.checked)} />
        Include x/y coordinates and font sizes
      </label>
      {busy && <div style={{ textAlign:"center", color:C.muted }}>Extracting…</div>}
      <ErrorNote>{err}</ErrorNote>
      {pagesData && !hasText && <NoTextLayerNote />}
      {json && hasText && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Label>JSON</Label>
            <div style={{ display:'flex', gap:8 }}>
              <CopyBtn text={json} />
              <Btn size="sm" variant="secondary" onClick={() => downloadBlob(json, (file?.name || 'document').replace(/\.pdf$/i, '') + '.json', 'application/json')}>Download .json</Btn>
            </div>
          </div>
          <Textarea value={json} onChange={() => {}} rows={18} mono style={{ fontSize:12 }} />
        </>
      )}
    </VStack>
  );
}

// PDF Table Extractor — clusters x positions into columns, groups lines into rows.
function PdfTableExtractor() {
  const [file, setFile]   = useState(null);
  const [pdfPages, setPdfPages] = useState(null);
  const [pageNum, setPageNum]   = useState(1);
  const [rows, setRows]   = useState(null);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);

  const detect = (page) => {
    const lines = page.lines.filter(l => l.items.length >= 2);
    if (lines.length < 2) return [];

    // Column detection: cluster the left edge of every glyph run across the page.
    const xs = lines.flatMap(l => l.items.map(i => i.x)).sort((a, b) => a - b);
    const cols = [];
    for (const x of xs) {
      const last = cols[cols.length - 1];
      if (last && x - last.max <= 12) { last.max = x; last.xs.push(x); }
      else cols.push({ max: x, xs: [x] });
    }
    const centers = cols
      .filter(c => c.xs.length >= Math.max(2, lines.length * 0.25))   // a real column repeats down the page
      .map(c => c.xs.reduce((a, b) => a + b, 0) / c.xs.length);

    if (centers.length < 2) return [];

    return lines.map(l => {
      const cells = Array(centers.length).fill('');
      for (const it of l.items) {
        let best = 0;
        for (let c = 1; c < centers.length; c++) {
          if (Math.abs(it.x - centers[c]) < Math.abs(it.x - centers[best])) best = c;
        }
        cells[best] = (cells[best] ? cells[best] + ' ' : '') + it.text;
      }
      return cells.map(c => c.trim());
    }).filter(r => r.filter(Boolean).length >= 2);
  };

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setErr(null); setRows(null); setPageNum(1); setBusy(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const data  = new Uint8Array(await f.arrayBuffer());
      const pdf   = await pdfjsLib.getDocument({ data }).promise;
      const pages = await extractDocLines(pdf);
      setPdfPages(pages);
      setRows(detect(pages[0]));
    } catch (ex) {
      setErr(`Could not read this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  const gotoPage = (n) => { setPageNum(n); setRows(detect(pdfPages[n - 1])); };

  const csv = rows?.length
    ? rows.map(r => r.map(c => /[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(',')).join('\n')
    : '';

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      {busy && <div style={{ textAlign:"center", color:C.muted }}>Scanning for tables…</div>}
      <ErrorNote>{err}</ErrorNote>

      {pdfPages && (
        <div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'center', flexWrap:'wrap' }}>
          <Btn variant="secondary" size="sm" onClick={() => gotoPage(pageNum - 1)} disabled={pageNum <= 1}>← Prev</Btn>
          <span style={{ fontSize:13, color:C.muted }}>Page {pageNum} of {pdfPages.length}</span>
          <Btn variant="secondary" size="sm" onClick={() => gotoPage(pageNum + 1)} disabled={pageNum >= pdfPages.length}>Next →</Btn>
        </div>
      )}

      {rows && rows.length === 0 && (
        <InfoNote tone="amber">No table-like layout detected on page {pageNum}. Try another page — this works best on aligned, multi-column tables with a text layer.</InfoNote>
      )}

      {rows && rows.length > 0 && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Label>{rows.length} rows × {rows[0].length} columns</Label>
            <div style={{ display:'flex', gap:8 }}>
              <CopyBtn text={csv} />
              <Btn size="sm" variant="secondary" onClick={() => downloadBlob(csv, `table-page-${pageNum}.csv`, 'text/csv')}>Download .csv</Btn>
            </div>
          </div>
          <div style={{ overflowX:'auto', border:`1px solid ${C.border}`, borderRadius:8 }}>
            <table style={{ borderCollapse:'collapse', width:'100%', fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
              <tbody>
                {rows.slice(0, 60).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    {r.map((c, j) => (
                      <td key={j} style={{ padding:'6px 10px', color:C.text, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 60 && <div style={{ fontSize:12, color:C.muted }}>Showing the first 60 rows. The CSV download contains all {rows.length}.</div>}
        </>
      )}
    </VStack>
  );
}

// PDF Chunker — splits the text into overlapping chunks sized for embedding models.
function PdfChunker() {
  const [file, setFile]   = useState(null);
  const [chunkSize, setChunkSize] = useState(512);
  const [overlap, setOverlap]     = useState(50);
  const [paras, setParas] = useState(null);
  const [chunks, setChunks] = useState(null);
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);

  // Rough but standard heuristic: ~4 characters per token for English text.
  const toks = (s) => Math.ceil(s.length / 4);

  // A paragraph longer than one whole chunk has to be broken up, or it would
  // produce a chunk that blows past the size the user asked for. Prefer sentence
  // boundaries; fall back to a hard character split for a single monster sentence.
  const splitLong = (p, size) => {
    if (toks(p.text) <= size) return [p];
    const sentences = p.text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [p.text];
    const out = [];
    let cur = '';
    for (const s of sentences) {
      if (cur && toks(cur + s) > size) { out.push({ page: p.page, text: cur.trim() }); cur = ''; }
      if (toks(s) > size) {
        const maxChars = size * 4;
        for (let i = 0; i < s.length; i += maxChars) out.push({ page: p.page, text: s.slice(i, i + maxChars).trim() });
      } else {
        cur += s;
      }
    }
    if (cur.trim()) out.push({ page: p.page, text: cur.trim() });
    return out.filter(x => x.text);
  };

  const buildChunks = (paragraphs, size, ov) => {
    const paras = paragraphs.flatMap(p => splitLong(p, size));
    const out = [];
    let buf = [], bufToks = 0;

    const emit = () => {
      const text = buf.map(p => p.text).join('\n\n');
      out.push({ index: out.length, page_start: buf[0].page, page_end: buf[buf.length - 1].page, approx_tokens: toks(text), text });
    };

    for (const p of paras) {
      const t = toks(p.text);
      if (buf.length && bufToks + t > size) {
        emit();
        // Carry the tail of this chunk into the next so context isn't cut mid-idea,
        // taking only whole paragraphs that fit inside the overlap budget.
        const keep = [];
        let kept = 0;
        for (let i = buf.length - 1; i >= 0; i--) {
          const kt = toks(buf[i].text);
          if (kept + kt > ov) break;
          keep.unshift(buf[i]); kept += kt;
        }
        buf = keep; bufToks = kept;
        // If the overlap plus this paragraph would still overflow, drop the overlap.
        if (bufToks + t > size) { buf = []; bufToks = 0; }
      }
      buf.push(p); bufToks += t;
    }
    if (buf.length) emit();
    return out;
  };

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f); setErr(null); setChunks(null); setBusy(true);
    try {
      const pdfjsLib = await loadPdfJs();
      const data  = new Uint8Array(await f.arrayBuffer());
      const pdf   = await pdfjsLib.getDocument({ data }).promise;
      const pages = await extractDocLines(pdf);

      // Rebuild paragraphs so chunks break on meaning, not mid-sentence.
      const paragraphs = [];
      for (const p of pages) {
        let cur = [], prevY = null;
        const push = () => { if (cur.length) { paragraphs.push({ page: p.page, text: cur.join(' ') }); cur = []; } };
        for (const l of p.lines) {
          if (prevY !== null && (prevY - l.y) > l.size * 1.9) push();
          cur.push(l.text);
          prevY = l.y;
        }
        push();
      }
      setParas(paragraphs);
      setChunks(paragraphs.length ? buildChunks(paragraphs, chunkSize, overlap) : []);
    } catch (ex) {
      setErr(`Could not read this PDF: ${ex.message}`);
    }
    setBusy(false);
  };

  const rebuild = (size, ov) => { if (paras?.length) setChunks(buildChunks(paras, size, ov)); };

  const json  = chunks ? JSON.stringify(chunks, null, 2) : '';
  const jsonl = chunks ? chunks.map(c => JSON.stringify(c)).join('\n') : '';
  const base  = (file?.name || 'document').replace(/\.pdf$/i, '');

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>

      <Grid2>
        <div>
          <Label>Chunk size (approx. tokens)</Label>
          <NumInput value={chunkSize} min={50} onChange={n => { setChunkSize(n); rebuild(n, Math.min(overlap, n - 1)); }} />
        </div>
        <div>
          <Label>Overlap (approx. tokens)</Label>
          <NumInput value={overlap} min={0} max={chunkSize - 1} onChange={n => { setOverlap(n); rebuild(chunkSize, n); }} />
        </div>
      </Grid2>

      {busy && <div style={{ textAlign:"center", color:C.muted }}>Chunking…</div>}
      <ErrorNote>{err}</ErrorNote>
      {chunks && chunks.length === 0 && <NoTextLayerNote />}

      {chunks && chunks.length > 0 && (
        <>
          <Grid3>
            <StatBox value={chunks.length} label="Chunks" />
            <StatBox value={Math.round(chunks.reduce((n, c) => n + c.approx_tokens, 0) / chunks.length)} label="Avg tokens" />
            <StatBox value={chunks.reduce((n, c) => n + c.approx_tokens, 0).toLocaleString()} label="Total tokens" />
          </Grid3>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Label>Preview</Label>
            <div style={{ display:'flex', gap:8 }}>
              <CopyBtn text={json} />
              <Btn size="sm" variant="secondary" onClick={() => downloadBlob(json, `${base}-chunks.json`, 'application/json')}>.json</Btn>
              <Btn size="sm" variant="secondary" onClick={() => downloadBlob(jsonl, `${base}-chunks.jsonl`, 'application/x-ndjson')}>.jsonl</Btn>
            </div>
          </div>
          <Textarea value={json} onChange={() => {}} rows={16} mono style={{ fontSize:12 }} />
          <InfoNote>Token counts are estimated at ~4 characters per token. Check against your model's tokenizer if you are close to a hard limit.</InfoNote>
        </>
      )}
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "pdf-viewer": PdfViewer,
  "pdf-page-count": PdfPageCount,
  "pdf-metadata": PdfMetadata,
  "pdf-text-extractor": PdfTextExtractor,
  "pdf-merger": PdfMerger,
  "pdf-splitter": PdfSplitter,
  "pdf-page-extractor": PdfPageExtractor,
  "pdf-rotator": PdfRotator,
  "pdf-reorder": PdfReorder,
  "pdf-delete-pages": PdfDeletePages,
  "pdf-to-jpg": PdfToJpg,
  "pdf-to-png": PdfToPng,
  "jpg-to-pdf": JpgToPdf,
  "png-to-pdf": PngToPdf,
  "pdf-to-text": PdfToText,
  "word-to-pdf": WordToPdf,
  "pdf-password-protect": PdfPasswordProtect,
  "pdf-unlock": PdfUnlock,
  "pdf-watermark": PdfWatermark,
  "pdf-redact": PdfRedact,
  "pdf-compressor": PdfCompressor,
  "pdf-optimizer": PdfOptimizer,
  "pdf-metadata-editor": PdfMetadataEditor,
  "pdf-page-numbering": PdfPageNumbering,
  "pdf-margin-adder": PdfMarginAdder,
  "pdf-cropper": PdfCropper,
  "pdf-bookmarks": PdfBookmarks,
  "pdf-form-filler": PdfFormFiller,
  "pdf-to-markdown": PdfToMarkdown,
  "pdf-to-json": PdfToJson,
  "pdf-table-extractor": PdfTableExtractor,
  "pdf-chunker": PdfChunker,
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
          { "@type": "ListItem", "position": 2, "name": "PDF Tools", "item": "https://toolsrift.com/pdf" },
          { "@type": "ListItem", "position": 3, "name": tool?.name || tool?.id || "" }
        ]
      }) }} />
    </>
  );
}

function CategoryPage({ catId }) {
  const cat = CATEGORIES.find(c => c.id === catId);
  const catTools = TOOLS.filter(t => t.cat === catId);

  useEffect(() => {
    document.title = `${cat?.name || 'Category'} — PDF Tools | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.red }}>← Back to home</a>
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
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.red; e.currentTarget.style.transform = "translateY(-2px)"; }}
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


const PAGE_THEME = getCategoryById('pdf');

// ─── Category home: search + responsive ToolCard grid ───
function CategoryHomePage() {
  useEffect(() => {
    document.title = 'Free PDF Tools Online — ToolsRift';
  }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search PDF tools..."
      />
    </CategoryLayout>
  );
}

// ─── Tool detail: sidebar nav + ToolPageLayout wrapper ───
function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const meta     = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} — Free PDF Tool | ToolsRift`;
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'} tools={TOOLS} subcats={CATEGORIES}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>← Back to PDF Tools</a>
      </div>
    </CategoryLayout>
  );

  const toolData = {
    id:          tool.id,
    name:        tool.name,
    description: meta?.desc || tool.desc,
    howTo:       meta?.howTo,
    faq:         meta?.faq,
  };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId} tools={TOOLS} subcats={CATEGORIES}>
      <a href="#/"
        style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginTop:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
        onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
        onMouseLeave={e => e.currentTarget.style.color='#64748B'}
      >
        ← Back to PDF Tools
      </a>
      <ToolPageLayout
        theme={PAGE_THEME}
        tool={toolData}
        tools={TOOLS}
        subcats={CATEGORIES}
        related={TOOLS.filter(t => t.id !== tool.id && t.cat === tool.cat).slice(0, 8)}
      >
        <ToolComp />
      </ToolPageLayout>
    </CategoryLayout>
  );
}

// ─── Main app ───
function ToolsRiftPDF() {
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

export default ToolsRiftPDF;
