import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
import { getCategoryById } from '../lib/categoryThemes';
import CategoryLayout from './shared/CategoryLayout';
import PremiumCategoryLanding from './shared/PremiumCategoryLanding';
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
  { id:"pdf-form-filler", cat:"tools", name:"PDF Form Filler", desc:"Fill in interactive PDF forms with text, checkboxes, and signatures", icon:"📄", free:true },
];

const CATEGORIES = [
  { id:"view", name:"View & Read", icon:"📄", desc:"View, preview and extract information from PDF files" },
  { id:"edit", name:"Edit & Modify", icon:"📄", desc:"Merge, split, rotate, and modify PDF documents" },
  { id:"convert", name:"Convert", icon:"🔄", desc:"Convert PDF to images, text, and other formats" },
  { id:"security", name:"Security", icon:"📄", desc:"Protect, encrypt, and secure PDF documents" },
  { id:"optimize", name:"Optimize", icon:"⚡", desc:"Compress and optimize PDF files for web and storage" },
  { id:"tools", name:"Tools", icon:"📄", desc:"Additional PDF utilities and helper tools" },
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
      ["Why is this a Pro feature?", "Word to PDF conversion requires document rendering libraries with licensing restrictions, so it's available in our Pro plan."]
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
    desc: "Remove password protection from PDF files when you have the correct password. Unlock PDFs for editing and printing.",
    faq: [
      ["Can I unlock a PDF without the password?", "No, you must enter the correct password to unlock the PDF. This tool cannot crack or bypass unknown passwords."],
      ["What if I forgot my password?", "Unfortunately, if you've forgotten the password, it cannot be recovered. PDF encryption is designed to be secure against unauthorized access."],
      ["Will unlocking reduce quality?", "No, unlocking simply removes the password protection. The PDF content remains completely unchanged."]
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
    desc: "Permanently black out and remove sensitive information from PDF documents. Secure redaction for confidential data.",
    faq: [
      ["Is redaction permanent?", "Yes, redacted content is permanently removed from the PDF. It's not just covered with a black box'the underlying text/data is deleted."],
      ["Can redacted information be recovered?", "No, proper redaction permanently removes the content. Make sure to keep an unredacted backup if you might need the original."],
      ["How do I select areas to redact?", "Click and drag to draw rectangles over sensitive information. Multiple areas can be selected before applying redaction."]
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
      ["Why is this a Pro feature?", "Bookmark manipulation requires advanced PDF editing capabilities with licensing costs, available in our Pro plan."]
    ]
  },
  "pdf-form-filler": {
    title: "Free PDF Form Filler — Fill Interactive PDF Forms Online | ToolsRift",
    desc: "Fill in interactive PDF forms with text, checkboxes, radio buttons, and signatures. Save completed forms as new PDFs.",
    faq: [
      ["What types of form fields are supported?", "Text fields, checkboxes, radio buttons, dropdown menus, and signature fields are all supported."],
      ["Can I save partially completed forms?", "Yes, download the PDF at any time with the current form data. You can open and continue editing it later."],
      ["Why is this a Pro feature?", "Form field manipulation requires advanced PDF libraries with licensing restrictions, available in our Pro plan."]
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
              <Btn size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>— Prev</Btn>
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
        —'— This extracts embedded text only. Scanned PDFs (images) require OCR.
      </div>
    </VStack>
  );
}

// Word to PDF Component (Pro)
function WordToPdf() {
  return (
    <div style={{ padding:48, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
      <div style={{ fontSize:48, marginBottom:14 }}>—''</div>
      <div style={{ color:C.text, fontWeight:700, fontSize:18, marginBottom:8 }}>Pro Feature</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6 }}>Word to PDF conversion requires advanced document rendering and is available in our Pro plan.</div>
      <Btn onClick={() => window.location.hash = '#/'}>View Pro Plans</Btn>
    </div>
  );
}

// PDF Password Protect Component
function PdfPasswordProtect() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [protecting, setProtecting] = useState(false);

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

  const protectPdf = async () => {
    if (!file || !password) return;
    setProtecting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      
      // Note: pdf-lib doesn't support password encryption directly
      // This is a simplified version - real implementation would need additional libraries
      alert('Password protection requires server-side encryption libraries. For security, we recommend using desktop software like Adobe Acrobat or open-source tools like PDFtk for password protection.');
      
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setProtecting(false);
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
      <Btn onClick={protectPdf} disabled={!file || !password || protecting}>
        {protecting ? 'Protecting...' : 'Add Password Protection'}
      </Btn>
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        —"' For production use, we recommend desktop tools for encryption. Browser-based encryption has security limitations.
      </div>
    </VStack>
  );
}

// PDF Unlock Component
function PdfUnlock() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const unlockPdf = () => {
    if (!file || !password) return;
    alert('PDF unlocking requires server-side processing or desktop software. Browser-based PDF libraries cannot decrypt password-protected PDFs for security reasons. Please use Adobe Acrobat or similar desktop software.');
  };

  return (
    <VStack>
      <div>
        <Label>Upload Protected PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <div>
        <Label>Password</Label>
        <Input value={password} onChange={setPassword} placeholder="Enter PDF password" style={{ fontFamily:"'JetBrains Mono',monospace" }} />
      </div>
      <Btn onClick={unlockPdf} disabled={!file || !password}>Unlock PDF</Btn>
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        —"" Browser-based PDF unlocking has security limitations. Use desktop software for best results.
      </div>
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

// PDF Redact Component (Pro)
function PdfRedact() {
  return (
    <div style={{ padding:48, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
      <div style={{ fontSize:48, marginBottom:14 }}>—''</div>
      <div style={{ color:C.text, fontWeight:700, fontSize:18, marginBottom:8 }}>Pro Feature</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6 }}>Secure PDF redaction with permanent content removal is available in our Pro plan.</div>
      <Btn onClick={() => window.location.hash = '#/'}>View Pro Plans</Btn>
    </div>
  );
}

// PDF Compressor Component
function PdfCompressor() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const [originalSize, setOriginalSize] = useState(0);

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setOriginalSize((selectedFile.size / 1024).toFixed(2));
  };

  const compressPdf = () => {
    if (!file) return;
    alert('PDF compression requires image processing and recompression libraries. For best results, use desktop software like Adobe Acrobat, Smallpdf, or iLovePDF online service.');
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
        {originalSize > 0 && <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Original size: {originalSize} KB</div>}
      </div>
      <div>
        <Label>Compression Level</Label>
        <SelectInput value={level} onChange={setLevel} options={[
          { value:'low', label:'Low (Best Quality)' },
          { value:'medium', label:'Medium (Balanced)' },
          { value:'high', label:'High (Smallest Size)' }
        ]} />
      </div>
      <Btn onClick={compressPdf} disabled={!file}>Compress PDF</Btn>
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        —'— For effective compression, we recommend using specialized services like Smallpdf or iLovePDF.
      </div>
    </VStack>
  );
}

// PDF Optimizer Component
function PdfOptimizer() {
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const optimizePdf = () => {
    if (!file) return;
    alert('PDF linearization (fast web view) requires restructuring the PDF file format. This is best done with server-side tools like QPDF or Adobe Acrobat Pro.');
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <Btn onClick={optimizePdf} disabled={!file}>Optimize for Web</Btn>
      <div style={{ padding:12, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ⚡ Optimization enables page-at-a-time loading in web browsers for faster viewing.
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

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const addMargins = () => {
    if (!file) return;
    alert('Adding margins requires modifying page dimensions and scaling content. This is best done with specialized PDF libraries or desktop software like Adobe Acrobat.');
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
        <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>72 points = 1 inch</div>
      </div>
      <Btn onClick={addMargins} disabled={!file}>Add Margins</Btn>
    </VStack>
  );
}

// PDF Cropper Component
function PdfCropper() {
  const [file, setFile] = useState(null);

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const cropPdf = () => {
    if (!file) return;
    alert('PDF cropping requires modifying page media boxes and crop boxes. Use desktop software like Adobe Acrobat or specialized PDF tools for precise cropping.');
  };

  return (
    <VStack>
      <div>
        <Label>Upload PDF File</Label>
        <input type="file" accept=".pdf" onChange={handleFile} style={{ display:"block", color:C.text, fontSize:13 }} />
      </div>
      <Btn onClick={cropPdf} disabled={!file}>Crop PDF</Btn>
      <div style={{ padding:12, background:"rgba(245,158,11,0.1)", border:`1px solid rgba(245,158,11,0.3)`, borderRadius:8, fontSize:12, color:C.text }}>
        ✂— For precise cropping, we recommend Adobe Acrobat or similar desktop tools.
      </div>
    </VStack>
  );
}

// PDF Bookmarks Component (Pro)
function PdfBookmarks() {
  return (
    <div style={{ padding:48, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
      <div style={{ fontSize:48, marginBottom:14 }}>—''</div>
      <div style={{ color:C.text, fontWeight:700, fontSize:18, marginBottom:8 }}>Pro Feature</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6 }}>PDF bookmark management requires advanced document structure manipulation, available in our Pro plan.</div>
      <Btn onClick={() => window.location.hash = '#/'}>View Pro Plans</Btn>
    </div>
  );
}

// PDF Form Filler Component (Pro)
function PdfFormFiller() {
  return (
    <div style={{ padding:48, textAlign:'center', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16 }}>
      <div style={{ fontSize:48, marginBottom:14 }}>—''</div>
      <div style={{ color:C.text, fontWeight:700, fontSize:18, marginBottom:8 }}>Pro Feature</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:22, lineHeight:1.6 }}>Interactive PDF form filling and field manipulation is available in our Pro plan.</div>
      <Btn onClick={() => window.location.hash = '#/'}>View Pro Plans</Btn>
    </div>
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
};

function Breadcrumb({ tool, cat }) {
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.muted, marginBottom:20 }}>
        <a href="https://toolsrift.com" style={{ color:C.muted, textDecoration:"none" }}>—— ToolsRift</a>
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

function ToolPage({ toolId }) {
  const tool = TOOLS.find(t=>t.id===toolId);
  const meta = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const cat = CATEGORIES.find(c=>c.id===tool?.cat);
  // PHASE 1: all tools free, no gating
  const [allowed] = useState(true);
  // PHASE 2: const [upgradeReason, setUpgradeReason] = useState(null);
  // PHASE 2: useEffect(() => { if (isLimitReached()) { setUpgradeReason('daily_limit'); setAllowed(false); return; } trackUse(toolId); setAllowed(true); setUpgradeReason(null); }, [toolId]);

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} —" Free Tool | ToolsRift`;
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Tool not found</div>
      <a href="#/" style={{ color:C.red }}>— Back to home</a>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"24px 20px 60px" }}>
      <Breadcrumb tool={tool} cat={cat} />
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, gap:16 }}>
        <div>
          <h1 style={{ ...T.h1, marginBottom:6, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28 }}>{tool.icon}</span> {tool.name}
          </h1>
          <p style={{ fontSize:14, color:C.muted, lineHeight:1.6, maxWidth:600 }}>{meta?.desc || tool.desc}</p>
        </div>
        <Badge color={tool.free?"green":"amber"}>{tool.free?"Free":"Pro"}</Badge>
      </div>
      {/* PHASE 2: {upgradeReason && <UpgradeModal reason={upgradeReason} onClose={() => setUpgradeReason(null)} />} */}
      <Card className="fade-in"><ToolComp /></Card>
      {meta?.howTo && (
        <div style={{ background:'rgba(59,130,246,0.05)', border:'1px solid rgba(59,130,246,0.12)', borderRadius:16, padding:'28px 32px', marginBottom:24, marginTop:24 }}>
          <h2 style={{ fontSize:17, fontWeight:700, color:'#F1F5F9', margin:'0 0 12px', fontFamily:"'Sora', sans-serif" }}>—"— How to Use This Tool</h2>
          <p style={{ fontSize:14, color:'#94A3B8', lineHeight:1.8, margin:0 }}>{meta.howTo}</p>
        </div>
      )}
      {meta?.faq && (
        <div style={{ marginTop:48 }}>
          <h2 style={{ ...T.h2, marginBottom:20 }}>Frequently Asked Questions</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {meta.faq.map(([q,a],i) => (
              <details key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 18px", cursor:"pointer" }}>
                <summary style={{ fontWeight:600, fontSize:14, color:C.text, listStyle:"none", display:"flex", justifyContent:"space-between" }}>
                  {q} <span style={{ color:C.muted }}>+</span>
                </summary>
                <p style={{ marginTop:10, fontSize:13, color:C.muted, lineHeight:1.7 }}>{a}</p>
              </details>
            ))}
          </div>
          <script type="application/ld+json">{JSON.stringify({
            "@context":"https://schema.org",
            "@type":"FAQPage",
            "mainEntity":meta.faq.map(([q,a])=>({
              "@type":"Question",
              "name":q,
              "acceptedAnswer":{"@type":"Answer","text":a}
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
  const cat = CATEGORIES.find(c => c.id === catId);
  const catTools = TOOLS.filter(t => t.cat === catId);

  useEffect(() => {
    document.title = `${cat?.name || 'Category'} —" PDF Tools | ToolsRift`;
  }, [catId]);

  if (!cat) return (
    <div style={{ padding:40, textAlign:"center", color:C.muted }}>
      <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
      <div style={{ fontSize:16, marginBottom:8, color:C.text }}>Category not found</div>
      <a href="#/" style={{ color:C.red }}>— Back to home</a>
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

// �"��� Category home: search + responsive ToolCard grid �������������������������������������������������"�
function CategoryHomePage() {
  useEffect(() => {
    document.title = 'Free PDF Tools Online —" ToolsRift';
  }, []);

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null}>
      <PremiumCategoryLanding
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search PDF tools..."
      />
    </CategoryLayout>
  );
}

// �"��� Tool detail: sidebar nav + ToolPageLayout wrapper �����������������������������������������������"�
function ToolDetailPage({ toolId }) {
  const tool     = TOOLS.find(t => t.id === toolId);
  const meta     = TOOL_META[toolId];
  const ToolComp = TOOL_COMPONENTS[toolId];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const acc = PAGE_THEME.color;

  useEffect(() => {
    document.title = meta?.title || `${tool?.name} —" Free PDF Tool | ToolsRift`;
    setDrawerOpen(false);
  }, [toolId]);

  if (!tool || !ToolComp) return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId || 'unknown'}>
      <div style={{ padding:40, textAlign:'center', color:'#64748B', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>—"</div>
        <p style={{ color:'#E2E8F0', marginBottom:8, fontSize:16 }}>Tool not found</p>
        <a href="#/" style={{ color:acc }}>— Back to PDF Tools</a>
      </div>
    </CategoryLayout>
  );

  const sidebarTools = TOOLS.filter(t => t.cat === tool.cat);
  const toolData = {
    name:        tool.name,
    description: meta?.desc || tool.desc,
    howTo:       meta?.howTo,
    faq:         meta?.faq,
  };

  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={toolId}>
      <style>{`
        .trp-detail{display:grid;grid-template-columns:220px 1fr;gap:24px;padding:16px 0 60px}
        @media(max-width:768px){.trp-detail{grid-template-columns:1fr;padding:16px 0 96px}}
        .trp-sidebar{display:block}
        @media(max-width:768px){.trp-sidebar{display:none}}
        .trp-mobile-bar{display:none}
        @media(max-width:768px){.trp-mobile-bar{display:flex}}
      `}</style>

      <div className="trp-detail">
        {/* Desktop sidebar */}
        <aside className="trp-sidebar">
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
                  <a
                    key={t.id}
                    href={`#/tool/${t.id}`}
                    style={{
                      display:'flex', alignItems:'center', gap:10, minHeight:44,
                      padding:'10px 16px', textDecoration:'none',
                      background: isActive ? `${acc}18` : 'transparent',
                      borderLeft: isActive ? `2px solid ${acc}` : '2px solid transparent',
                      transition:'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent'; }}
                  >
                    <span style={{ fontSize:15, flexShrink:0 }}>{t.icon}</span>
                    <span style={{ fontSize:13, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', lineHeight:1.3, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      {t.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ minWidth:0 }}>
          <a href="#/"
            style={{ display:'inline-flex', alignItems:'center', gap:6, color:'#64748B', fontSize:13, textDecoration:'none', marginBottom:16, fontFamily:"'Plus Jakarta Sans',sans-serif" }}
            onMouseEnter={e => e.currentTarget.style.color='#E2E8F0'}
            onMouseLeave={e => e.currentTarget.style.color='#64748B'}
          >
            — Back to PDF Tools
          </a>
          <ToolPageLayout theme={PAGE_THEME} tool={toolData}>
            <ToolComp />
          </ToolPageLayout>
        </div>
      </div>

      {/* Mobile: floating bottom bar */}
      <div className="trp-mobile-bar" style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:200, background:'rgba(6,9,15,0.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'12px 16px', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif", overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'60%' }}>
          {tool.icon} {tool.name}
        </span>
        <button
          onClick={() => setDrawerOpen(d => !d)}
          style={{ background:acc, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", minHeight:44, flexShrink:0 }}
        >
          {drawerOpen ? '✕ Close' : '—"— All Tools'}
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:199, background:'#0D1117', borderTop:`2px solid ${acc}`, maxHeight:'60vh', overflowY:'auto', padding:'8px 0 80px' }}>
          {sidebarTools.map(t => {
            const isActive = t.id === toolId;
            return (
              <a key={t.id} href={`#/tool/${t.id}`} onClick={() => setDrawerOpen(false)}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', minHeight:52, textDecoration:'none', background:isActive?`${acc}18`:'transparent', borderLeft:isActive?`3px solid ${acc}`:'3px solid transparent' }}
              >
                <span style={{ fontSize:20 }}>{t.icon}</span>
                <span style={{ fontSize:14, fontWeight:isActive?600:400, color:isActive?'#F1F5F9':'#94A3B8', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{t.name}</span>
              </a>
            );
          })}
        </div>
      )}
    </CategoryLayout>
  );
}

// �"��� Main app �����������������������������������������������������������������������������������������������������������������������������������"�
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
