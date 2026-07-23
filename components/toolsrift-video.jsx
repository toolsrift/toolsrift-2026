import { useState, useEffect, useRef } from "react";
import { getCategoryById } from "../lib/categoryThemes";
// PHASE 2: import { trackUse, isLimitReached, getRemaining, DAILY_LIMIT } from '../lib/usage';
// PHASE 2: import UpgradeModal from './UpgradeModal';
// PHASE 2: import UsageCounter from './UsageCounter';
import CategoryLayout from './shared/CategoryLayout';
import CategoryDashboard from './shared/CategoryDashboard';
import ToolPageLayout from './shared/ToolPageLayout';

const THEME = getCategoryById("video");
const PAGE_THEME = getCategoryById("video");
const BRAND = { name: "ToolsRift", tagline: "Video Tools" };

const C = {
  bg: "#06090F", surface: "#0D1117", border: "rgba(255,255,255,0.06)",
  accent: "#C2410C", accentD: "#9A3412",
  text: "#E2E8F0", muted: "#64748B",
  success: "#10B981", warn: "#F59E0B", danger: "#EF4444",
};

const GLOBAL_CSS = `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'); *{box-sizing:border-box;margin:0;padding:0} ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px} ::selection{background:rgba(194,65,12,0.3)} button:hover{filter:brightness(1.1)} select option{background:#0D1117} textarea{resize:vertical} .fade-in{animation:fadeIn .25s ease} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}} @keyframes trShake{0%,100%{transform:translate(0,0) rotate(0)}20%{transform:translate(-6px,4px) rotate(-4deg)}40%{transform:translate(6px,-4px) rotate(4deg)}60%{transform:translate(-5px,-3px) rotate(-3deg)}80%{transform:translate(5px,3px) rotate(3deg)}} .tr-nav-cats{display:flex;gap:4px;align-items:center} .tr-nav-badge{display:inline-flex} @media(max-width:640px){ .tr-nav-cats{display:none!important} .tr-nav-badge{display:none!important} }`;

const T = {
  body: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, color:C.text },
  mono: { fontFamily:"'JetBrains Mono',monospace", fontSize:13 },
  label: { fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.05em" },
  h1: { fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:C.text },
  h2: { fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:C.text },
};

// ── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ children, color = "rose" }) {
  const map = { rose:"rgba(194,65,12,0.15)", blue:"rgba(59,130,246,0.15)", green:"rgba(16,185,129,0.15)", amber:"rgba(245,158,11,0.15)", red:"rgba(239,68,68,0.15)" };
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
    primary:{ background:`linear-gradient(135deg,${ACCENT},${ACCENTD})`, color:"#fff", boxShadow:`0 2px 8px rgba(194,65,12,0.25)` },
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
    <div style={{ textAlign:"center", padding:"20px 16px", background:"rgba(194,65,12,0.08)", border:`1px solid rgba(194,65,12,0.2)`, borderRadius:10 }}>
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
          ...(cat ? [{ "@type": "ListItem", "position": 2, "name": cat.name, "item": `https://toolsrift.com/video` }] : []),
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
  // ── edit ─────────────────────────────────────────────────────────────────
  { id:"video-trimmer", cat:"edit", name:"Video Trimmer", desc:"Cut and trim MP4, WebM or MOV video right in your browser with a scrubbable start/end preview — nothing is uploaded to any server.", icon:"✂️", free:true },
  { id:"video-merger", cat:"edit", name:"Video Merger", desc:"Join two or more video clips into a single file, in the order you choose, entirely inside your browser with no upload.", icon:"➕", free:true },
  { id:"video-rotate", cat:"edit", name:"Video Rotator", desc:"Rotate a video 90°, 180° or 270°, or flip it horizontally or vertically, and export the corrected clip locally.", icon:"🔄", free:true },
  { id:"video-crop", cat:"edit", name:"Video Cropper", desc:"Crop a video to a chosen rectangle or a preset aspect ratio like 9:16 or 1:1, previewed live before you export.", icon:"⬛", free:true },
  { id:"video-mute", cat:"edit", name:"Video Muter", desc:"Strip the audio track from a video to produce a silent clip, useful before adding your own soundtrack or voiceover.", icon:"🔇", free:true },
  { id:"video-speed", cat:"edit", name:"Video Speed Changer", desc:"Speed up or slow down a video from 0.25x to 4x, with an option to keep or drop the audio pitch correction.", icon:"⏩", free:true },
  { id:"video-watermark", cat:"edit", name:"Video Watermark Adder", desc:"Overlay a text watermark onto a video at a chosen position, size, colour and opacity, then export the branded clip.", icon:"🏷️", free:true },
  // ── convert ──────────────────────────────────────────────────────────────
  { id:"video-converter", cat:"convert", name:"Video Format Converter", desc:"Convert video between MP4, WebM, MOV, AVI, MKV and GIF container formats entirely in your browser, no uploads.", icon:"🔁", free:true },
  { id:"video-compressor", cat:"convert", name:"Video Compressor", desc:"Shrink a video's file size with an adjustable quality slider, so it fits an email attachment or upload limit.", icon:"🗜️", free:true },
  { id:"video-to-audio", cat:"convert", name:"Video to Audio Extractor", desc:"Pull just the audio track out of a video file and export it as an MP3, AAC or WAV, without re-uploading anywhere.", icon:"🎵", free:true },
  { id:"video-resize", cat:"convert", name:"Video Resizer", desc:"Resize a video to a target resolution like 1080p, 720p or a custom width and height, keeping or ignoring the aspect ratio.", icon:"📐", free:true },
  { id:"video-reverse", cat:"convert", name:"Video Reverser", desc:"Play a video backwards from end to start — a classic effect rendered locally with no watermark and no upload.", icon:"⏪", free:true },
  { id:"video-loop", cat:"convert", name:"Video Looper", desc:"Repeat a short clip a chosen number of times, or up to a target duration, to create a seamless looping video.", icon:"🔁", free:true },
  { id:"video-bitrate-changer", cat:"convert", name:"Video Bitrate Changer", desc:"Set an exact target video bitrate or estimate the output file size before exporting, for precise size control.", icon:"📊", free:true },
  // ── gif ──────────────────────────────────────────────────────────────────
  { id:"video-to-gif", cat:"gif", name:"Video to GIF Converter", desc:"Turn any clip into a looping animated GIF with adjustable frame rate, width and start/end trim points.", icon:"🎞️", free:true },
  { id:"gif-to-video", cat:"gif", name:"GIF to Video Converter", desc:"Convert an animated GIF into a shareable MP4 or WebM video file, which is far smaller and plays everywhere.", icon:"📹", free:true },
  { id:"video-thumbnail", cat:"gif", name:"Video Thumbnail Grabber", desc:"Grab a single frame from any point in a video and download it as a JPG or PNG thumbnail image.", icon:"🖼️", free:true },
  { id:"video-frames-extractor", cat:"gif", name:"Video Frame Extractor", desc:"Extract a set number of evenly spaced frames from a video as individual images, bundled into one ZIP download.", icon:"🎬", free:true },
  { id:"video-contact-sheet", cat:"gif", name:"Video Contact Sheet Maker", desc:"Generate a single grid image of evenly spaced preview frames from a video — a classic film contact sheet.", icon:"🗂️", free:true },
  { id:"video-social-crop", cat:"gif", name:"Social Media Video Cropper", desc:"Crop and pad a video to the exact aspect ratio each platform wants — 9:16 Reels/Shorts, 1:1 feed, or 4:5 portrait.", icon:"📱", free:true },
  // ── record ───────────────────────────────────────────────────────────────
  { id:"webcam-recorder", cat:"record", name:"Webcam Recorder", desc:"Record video straight from your webcam and microphone in the browser and download the clip when you stop.", icon:"📷", free:true },
  { id:"screen-recorder", cat:"record", name:"Screen Recorder", desc:"Record your screen, a window or a browser tab directly in the browser and download the capture as a video file.", icon:"🖥️", free:true },
  { id:"video-info", cat:"record", name:"Video Info Viewer", desc:"Inspect a video's duration, resolution, frame rate, codec, bitrate and file size without uploading it anywhere.", icon:"ℹ️", free:true },
  { id:"video-fps-changer", cat:"record", name:"Video Frame Rate Changer", desc:"Change a video's frame rate up or down — for example converting 60fps footage to a smooth 30fps or 24fps export.", icon:"🎚️", free:true },
  { id:"video-brightness-contrast", cat:"record", name:"Video Brightness & Contrast Editor", desc:"Adjust a video's brightness, contrast and saturation with live before/after preview, then export the graded clip.", icon:"🎨", free:true },
];

const CATEGORIES = [
  { id:"edit", name:"Trim & Edit", icon:"✂️", desc:"Trim, merge, rotate, crop and mute video clips." },
  { id:"convert", name:"Convert & Compress", icon:"🔄", desc:"Change video format, shrink file size, extract audio or frames." },
  { id:"gif", name:"GIF & Images", icon:"🖼️", desc:"Turn video into GIFs, thumbnails and image sequences." },
  { id:"record", name:"Record & Capture", icon:"🎥", desc:"Record your webcam or screen directly in the browser." },
];

const TOOL_META = {
  "video-trimmer": {
    title: "Free Video Trimmer — Cut Clips Online, No Upload | ToolsRift",
    desc: "Free online video trimmer. Cut MP4, WebM or MOV clips to any start and end point with a scrubbable preview — processed entirely in your browser, nothing uploaded.",
    keywords: "video trimmer, cut video online, trim mp4 free, video cutter no upload, online video editor",
    faq: [
      ["Is my video uploaded anywhere?", "No. This trimmer runs entirely in your browser on a WebAssembly build of FFmpeg, so your file never leaves your device and is never sent to a server."],
      ["What formats can I trim?", "MP4, WebM, MOV and most other common formats your browser can decode. The output is exported as MP4 by default."],
      ["Is there a length limit?", "There is no limit we impose. The practical ceiling is your device's memory — very long or high-resolution files work best on a desktop or laptop rather than a phone."],
    ],
    howTo: "Load your video, drag the start and end handles on the scrubber to your trim points, preview the result, and export — the cut file downloads straight to your device.",
  },
  "video-merger": {
    title: "Free Video Merger — Join Clips Online | ToolsRift",
    desc: "Free online video merger. Combine two or more MP4, WebM or MOV clips into a single video, in the order you choose, entirely in your browser with no upload.",
    keywords: "video merger, join video clips, combine mp4 online, merge videos free, video joiner no upload",
    faq: [
      ["Do the clips need to match resolution?", "For the smoothest result, similar resolution and frame rate work best. Mismatched clips are still joined, but the output uses the first clip's resolution as the base."],
      ["Can I reorder the clips before merging?", "Yes. Add your files and drag them into the order you want before pressing merge — the final video plays them back in that sequence."],
      ["Is audio kept from every clip?", "Yes, each clip's own audio track carries through in the merged output, so no re-recording or syncing is needed."],
    ],
    howTo: "Add two or more video files, drag them into the order you want, then press Merge. The combined video is processed locally and ready to download.",
  },
  "video-rotate": {
    title: "Free Video Rotator — Rotate & Flip Online | ToolsRift",
    desc: "Free online video rotator. Rotate a clip 90°, 180° or 270°, or flip it horizontally or vertically, to fix sideways phone footage — processed entirely in your browser.",
    keywords: "rotate video online, flip video free, fix sideways video, video rotator no upload, rotate mp4",
    faq: [
      ["Why is my phone video sideways?", "Phones often record with an orientation flag instead of physically rotating the pixels, and some players ignore that flag. This tool bakes the rotation into the actual video frames so it plays upright everywhere."],
      ["Can I flip instead of rotate?", "Yes. Horizontal flip mirrors left-right (useful for webcam recordings) and vertical flip mirrors top-bottom, independent of the rotation angle."],
      ["Does rotating reduce quality?", "There is a small re-encode involved, but at a high quality setting the visible difference is negligible for normal viewing."],
    ],
    howTo: "Load your video, choose a rotation angle or flip direction, check the live preview, and export the corrected file.",
  },
  "video-crop": {
    title: "Free Video Cropper — Crop to Any Ratio Online | ToolsRift",
    desc: "Free online video cropper. Crop a clip to a custom rectangle or a preset ratio like 9:16, 1:1 or 4:5, with a live preview — processed entirely in your browser.",
    keywords: "crop video online, video cropper free, crop video to square, video aspect ratio crop, crop mp4 no upload",
    faq: [
      ["Can I crop to a specific aspect ratio?", "Yes. Presets for 9:16 (Reels/Shorts), 1:1 (square) and 4:5 (portrait feed) are built in, or you can drag a custom crop rectangle over the preview frame."],
      ["Will cropping cut off part of my subject?", "The live preview shows exactly what stays in frame before you export, so you can reposition the crop rectangle until your subject is centred."],
      ["Does the crop apply to the whole video?", "Yes, the same crop rectangle is applied to every frame from start to end, producing one consistently cropped output file."],
    ],
    howTo: "Load your video, drag the crop rectangle over the preview or pick a ratio preset, then export — the cropped clip downloads to your device.",
  },
  "video-mute": {
    title: "Free Video Muter — Remove Audio Online | ToolsRift",
    desc: "Free online tool to remove the audio track from a video. Produces a silent MP4 with the visuals untouched, ready for a new soundtrack — processed entirely in your browser.",
    keywords: "remove audio from video, mute video online, video without sound, strip audio mp4, silent video maker",
    faq: [
      ["Does this change the video quality?", "No. The video stream is copied without re-encoding wherever possible, so visual quality is identical to the source — only the audio track is dropped."],
      ["Why would I want a silent video?", "Common reasons are adding your own voiceover or music track afterwards, avoiding a copyright claim on background audio, or removing unwanted background noise from a recording."],
      ["Can I add new audio afterwards?", "Yes, once you have a silent video you can bring it into any video editor and lay a new soundtrack or narration over it."],
    ],
    howTo: "Load your video and press Remove Audio. The tool strips the audio track and gives you a silent MP4 to download.",
  },
  "video-speed": {
    title: "Free Video Speed Changer — Speed Up or Slow Down | ToolsRift",
    desc: "Free online video speed changer. Speed up or slow down a clip from 0.25x to 4x, with optional audio pitch correction, entirely processed in your browser.",
    keywords: "video speed changer, speed up video online, slow motion video maker, change video speed free, fast forward video",
    faq: [
      ["Does speeding up a video change the audio pitch?", "By default the audio is resampled to match the new speed, which raises pitch when speeding up and lowers it when slowing down — like a classic tape effect. You can disable audio entirely if you prefer."],
      ["What speed range is supported?", "From 0.25x (four times slower, for smooth slow motion) up to 4x (four times faster, for timelapse-style clips)."],
      ["Will a slowed-down video look choppy?", "Slowing down reuses existing frames rather than generating new ones between them, so very slow settings on low-frame-rate source footage can look less smooth than footage shot at a high frame rate."],
    ],
    howTo: "Load your video, choose a speed multiplier between 0.25x and 4x, decide whether to keep the audio, and export the retimed clip.",
  },
  "video-watermark": {
    title: "Free Video Watermark Adder — Add Text Overlay | ToolsRift",
    desc: "Free online tool to add a text watermark to a video. Choose position, size, colour and opacity, then export the branded clip — processed entirely in your browser.",
    keywords: "add watermark to video, video watermark online, brand video free, text overlay video, watermark mp4 no upload",
    faq: [
      ["Can I control where the watermark appears?", "Yes. Choose from the four corners or the centre, and adjust the font size, colour and opacity to suit your footage."],
      ["Does the watermark stay for the whole video?", "Yes, it is burned into every frame from start to end, so it cannot be trimmed off downstream the way a removable overlay could be."],
      ["Can I add a logo image instead of text?", "This tool adds a text watermark. For an image logo, use the Video Merger or a general video editor to composite a logo layer, or request an image-watermark tool."],
    ],
    howTo: "Load your video, type your watermark text and choose its position, colour and opacity, then export the watermarked file.",
  },
  "video-converter": {
    title: "Free Video Converter — MP4, WebM, MOV, AVI | ToolsRift",
    desc: "Free online video format converter. Convert between MP4, WebM, MOV, AVI and MKV entirely in your browser using FFmpeg WebAssembly — nothing is uploaded.",
    keywords: "video converter online, convert mp4 to webm, mov to mp4 converter, free video format converter, avi to mp4",
    faq: [
      ["Which formats can I convert between?", "MP4, WebM, MOV, AVI and MKV as containers, using the H.264 (MP4/MOV/AVI) or VP8/VP9 (WebM) codecs depending on your chosen output."],
      ["Why convert to WebM instead of MP4?", "WebM files are usually smaller for the same visual quality and are natively supported by all modern browsers, making them ideal for websites."],
      ["Will converting reduce quality?", "Any format conversion re-encodes the video, so there is technically a small generation loss, but at the default high-quality setting it is not visible in normal playback."],
    ],
    howTo: "Load your video, choose the output format you need, and press Convert. The re-encoded file is ready to download once processing finishes.",
  },
  "video-compressor": {
    title: "Free Video Compressor — Shrink File Size Online | ToolsRift",
    desc: "Free online video compressor. Reduce a video's file size with an adjustable quality slider so it fits an email or upload limit — processed entirely in your browser.",
    keywords: "compress video online, reduce video file size, video compressor free, shrink mp4 size, compress video no upload",
    faq: [
      ["How much smaller can my video get?", "It depends heavily on the source: a phone video with a high bitrate can often shrink by 50-80% at a moderate quality setting with little visible difference."],
      ["What does the quality slider actually change?", "It adjusts the CRF (constant rate factor), FFmpeg's quality-vs-size control — lower values mean higher quality and larger files, higher values mean smaller files with more visible compression."],
      ["Why compress instead of just resizing?", "Resizing shrinks the frame dimensions, while compression reduces the bitrate at the same resolution — this tool focuses on bitrate, so use the Resizer alongside it for maximum size reduction."],
    ],
    howTo: "Load your video, drag the quality slider to balance size against sharpness, and export. The compressed file typically downloads much faster than the original.",
  },
  "video-to-audio": {
    title: "Free Video to Audio Converter — Extract MP3 | ToolsRift",
    desc: "Free online video to audio extractor. Pull the audio track out of any video and export it as MP3, AAC or WAV — processed entirely in your browser, nothing uploaded.",
    keywords: "video to mp3 converter, extract audio from video, video to audio online, mp4 to mp3 free, video sound extractor",
    faq: [
      ["What audio formats can I export to?", "MP3 for wide compatibility, AAC for smaller high-quality files (used by MP4/M4A), or uncompressed WAV if you need the audio for further editing."],
      ["Does this work on any video file?", "Yes, as long as the video actually contains an audio track — files with no sound will produce an error rather than a silent audio file."],
      ["Is the extracted audio quality reduced?", "The audio stream is pulled out largely as-is, so quality closely matches the source; converting to MP3 applies standard lossy compression at a solid default bitrate."],
    ],
    howTo: "Load your video, choose MP3, AAC or WAV as the output format, and press Extract. The audio-only file downloads once processing completes.",
  },
  "video-resize": {
    title: "Free Video Resizer — Change Resolution Online | ToolsRift",
    desc: "Free online video resizer. Resize a clip to 1080p, 720p or a custom width and height, with an option to lock the aspect ratio — processed entirely in your browser.",
    keywords: "resize video online, change video resolution, video resizer free, 1080p to 720p converter, custom video size",
    faq: [
      ["Should I lock the aspect ratio?", "In almost every case yes — locking it prevents stretching or squashing. Only unlock it if you deliberately want a non-proportional resize."],
      ["Can I make a video larger than the original?", "Yes, though upscaling cannot add real detail that was not captured, so a heavily upscaled video will look softer than genuinely high-resolution footage."],
      ["What resolution should I pick for social media?", "1080x1920 for vertical Reels/Shorts/Stories, 1080x1080 for a square feed post, and 1920x1080 for standard horizontal YouTube uploads are the common defaults."],
    ],
    howTo: "Load your video, pick a preset resolution or enter a custom width and height, and export. The resized file is ready to download.",
  },
  "video-reverse": {
    title: "Free Video Reverser — Play Video Backwards | ToolsRift",
    desc: "Free online video reverser. Play any clip backwards from end to start, a classic effect rendered entirely in your browser with no watermark and no upload.",
    keywords: "reverse video online, play video backwards, video reverser free, backwards video maker, reverse mp4 no upload",
    faq: [
      ["Is the audio reversed too?", "Yes, by default the audio track is reversed along with the picture, which usually sounds unnatural — you can mute the audio instead if you only want the reversed visuals."],
      ["How long does reversing take?", "Reversing requires decoding and re-encoding every frame, so longer or higher-resolution clips take proportionally longer than a simple trim or format change."],
      ["Does reversing work on any video?", "Yes, though very long clips need to be held in memory during processing, so extremely long videos work best on a desktop browser with plenty of RAM."],
    ],
    howTo: "Load your video and press Reverse. Once processing finishes, preview the backwards clip and download it.",
  },
  "video-loop": {
    title: "Free Video Looper — Repeat a Clip Online | ToolsRift",
    desc: "Free online video looper. Repeat a short clip a chosen number of times, or up to a target total duration, to build a seamless looping video in your browser.",
    keywords: "loop video online, repeat video clip, video looper free, make looping video, seamless video loop maker",
    faq: [
      ["Can I loop to an exact target length instead of a count?", "Yes. Switch to duration mode, enter the total length you want, and the tool works out how many repeats are needed and trims the final repeat to fit exactly."],
      ["Will there be a visible jump between loops?", "If your source clip's first and last frames are similar, the loop feels seamless. Mismatched start and end frames will show a visible cut at each repeat, which is a property of the source footage, not the tool."],
      ["Is there a limit to how many times I can loop?", "Very high repeat counts on long clips produce very large files and take longer to process — for background loops, a handful of repeats or a duration-based target is usually enough."],
    ],
    howTo: "Load your video, choose to repeat it a set number of times or up to a target duration, and export the looped file.",
  },
  "video-bitrate-changer": {
    title: "Free Video Bitrate Changer — Exact Size Control | ToolsRift",
    desc: "Free online video bitrate changer. Set an exact target bitrate or estimate the resulting file size before exporting, for precise control over the output size.",
    keywords: "video bitrate changer, set video bitrate online, video file size calculator, change bitrate mp4, control video export size",
    faq: [
      ["What is video bitrate?", "Bitrate is how much data is used per second of video, usually measured in kbps or Mbps. Higher bitrate means better quality but a larger file for the same length of video."],
      ["How do I hit an exact target file size?", "Enter your target size and the video's duration, and the tool works out and applies the bitrate needed to land close to that size — useful for meeting strict upload limits."],
      ["Is bitrate the same as resolution?", "No. Resolution is the frame dimensions in pixels; bitrate is how much data describes each second regardless of resolution. You can have a small, low-bitrate 1080p file or a large, high-bitrate one."],
    ],
    howTo: "Load your video, either enter a target bitrate directly or a target file size to calculate one, and export the file at that setting.",
  },
  "video-to-gif": {
    title: "Free Video to GIF Converter — Make Animated GIFs | ToolsRift",
    desc: "Free online video to GIF converter. Turn any clip into a looping animated GIF with adjustable frame rate, width and trim points, entirely in your browser.",
    keywords: "video to gif converter, make gif from video online, mp4 to gif free, create animated gif, video to gif no watermark",
    faq: [
      ["Why is my GIF file so large?", "GIF is an old, relatively inefficient format — reducing the frame rate (10-15fps is usually plenty) and the output width (400-500px for social sharing) are the two most effective ways to shrink it."],
      ["Can I trim the clip before converting?", "Yes, set the start and end points on the source video first so only the section you want becomes the GIF."],
      ["Does the GIF loop automatically?", "Yes, standard animated GIFs loop by default in every browser, messaging app and social platform that supports them."],
    ],
    howTo: "Load your video, trim to the section you want, set the frame rate and width, and export — the animated GIF downloads ready to share.",
  },
  "gif-to-video": {
    title: "Free GIF to Video Converter — GIF to MP4 | ToolsRift",
    desc: "Free online GIF to video converter. Convert an animated GIF into a much smaller MP4 or WebM video that plays everywhere — processed entirely in your browser.",
    keywords: "gif to mp4 converter, gif to video online, convert gif free, animated gif to video, gif to webm",
    faq: [
      ["Why convert a GIF to video instead of keeping it as a GIF?", "Video formats compress far more efficiently than GIF, so the same animation is typically 5-10 times smaller as an MP4, and many platforms (like Twitter/X and Instagram) actually convert uploaded GIFs to video internally anyway."],
      ["Will the video loop like the GIF did?", "The exported file itself does not force looping, but most players and social platforms auto-loop short, silent videos in a very similar way to a GIF."],
      ["Does the animation quality change?", "Video encoding generally reproduces GIF content very cleanly since GIFs already have a limited colour palette, so visual quality is preserved while file size drops significantly."],
    ],
    howTo: "Load your GIF file, choose MP4 or WebM as the output, and press Convert. The compact video file downloads once processing finishes.",
  },
  "video-thumbnail": {
    title: "Free Video Thumbnail Grabber — Extract a Frame | ToolsRift",
    desc: "Free online video thumbnail grabber. Grab any single frame from a video and download it as a JPG or PNG image — processed entirely in your browser, no upload.",
    keywords: "video thumbnail generator, extract frame from video, video screenshot online, grab video frame free, mp4 to jpg",
    faq: [
      ["How precisely can I pick the frame?", "Scrub the video to the exact moment you want using the timeline, then capture — the tool grabs the frame currently showing in the preview."],
      ["JPG or PNG — which should I choose?", "JPG gives a smaller file and is fine for most thumbnails; PNG is lossless and better if the frame contains sharp text or graphics you want to keep crisp."],
      ["Does this need the FFmpeg engine to load?", "No, this tool reads the frame directly from the video element and a canvas, so it works instantly without downloading the larger video-processing engine."],
    ],
    howTo: "Load your video, scrub to the frame you want, and press Capture. Download the still image as a JPG or PNG.",
  },
  "video-frames-extractor": {
    title: "Free Video Frame Extractor — Export Frames as Images | ToolsRift",
    desc: "Free online video frame extractor. Pull a set number of evenly spaced frames from a video as individual images, bundled into one ZIP download — no upload.",
    keywords: "extract frames from video, video to images online, video frame extractor free, mp4 to jpg sequence, video to png frames",
    faq: [
      ["How many frames can I extract?", "Choose any count up to 60 in one export. Extracting more frames from a longer video simply spaces them further apart across the timeline."],
      ["What is in the downloaded file?", "A single ZIP archive containing every extracted frame as a numbered JPG or PNG image, ready to unzip on your device."],
      ["Are the frames evenly spaced?", "Yes, the extractor divides the video's duration by your chosen frame count and captures one frame at each even interval, covering the whole clip."],
    ],
    howTo: "Load your video, set how many frames you want and pick JPG or PNG, then press Extract. A ZIP of numbered frame images downloads automatically.",
  },
  "video-contact-sheet": {
    title: "Free Video Contact Sheet Maker — Preview Grid | ToolsRift",
    desc: "Free online video contact sheet maker. Generate a single grid image of evenly spaced preview frames from a video — a classic film contact sheet, no upload.",
    keywords: "video contact sheet, video preview grid, thumbnail grid maker, video storyboard image, film strip preview generator",
    faq: [
      ["What is a contact sheet used for?", "It gives a one-image overview of a video's content — useful for previewing footage before editing, cataloguing a video library, or sharing a visual summary without sending the whole file."],
      ["Can I control the grid size?", "Yes, choose the number of columns and rows, and the tool captures exactly that many evenly spaced frames to fill the grid."],
      ["What format is the output?", "A single PNG image containing all the frame thumbnails arranged in your chosen grid, with an optional timestamp label on each tile."],
    ],
    howTo: "Load your video, set the number of columns and rows for the grid, and press Generate. Download the finished contact sheet as one PNG image.",
  },
  "video-social-crop": {
    title: "Free Social Media Video Cropper — Reels, Shorts, TikTok | ToolsRift",
    desc: "Free online social media video cropper. Crop and pad a video to the exact ratio each platform wants — 9:16 Reels/Shorts/TikTok, 1:1 feed, or 4:5 portrait.",
    keywords: "crop video for instagram, tiktok video size converter, reels aspect ratio crop, video to 9:16 online, social media video cropper",
    faq: [
      ["Which ratio should I use for Reels, Shorts and TikTok?", "All three platforms are built around 9:16 vertical video, so that preset covers Instagram Reels, YouTube Shorts and TikTok in one export."],
      ["What if my source video is horizontal?", "You can either crop in to fill the vertical frame (losing the edges) or pad with blurred or solid bars to keep the whole frame visible — both options are offered."],
      ["Is 4:5 different from 9:16?", "Yes, 4:5 is the taller-than-square portrait ratio Instagram and Facebook use for feed posts, while 9:16 is the full-height ratio used for Stories and Reels."],
    ],
    howTo: "Load your video, choose the target platform ratio, decide between crop-to-fill or pad-to-fit, and export the correctly framed clip.",
  },
  "webcam-recorder": {
    title: "Free Webcam Recorder — Record Video Online | ToolsRift",
    desc: "Free online webcam recorder. Record video and audio from your webcam and microphone directly in the browser and download the clip — no software to install.",
    keywords: "webcam recorder online, record video from camera, browser webcam recording, free webcam video maker, online video recorder",
    faq: [
      ["Does this upload my recording anywhere?", "No. Recording uses your browser's built-in MediaRecorder API and the video is generated and downloaded locally — nothing is sent to a server at any point."],
      ["Do I need to install anything?", "No software or extension is required. Your browser will ask for camera and microphone permission the first time you record, which you can revoke at any time."],
      ["What format does it record in?", "Recordings are saved as WebM, which is natively supported by all modern browsers and can be converted to MP4 with the Video Format Converter if needed."],
    ],
    howTo: "Press Start, allow camera and microphone access when prompted, record your clip, then press Stop and download the file.",
  },
  "screen-recorder": {
    title: "Free Screen Recorder — Record Your Screen Online | ToolsRift",
    desc: "Free online screen recorder. Capture your screen, a single window or a browser tab directly in the browser and download the recording — no software to install.",
    keywords: "screen recorder online, free screen recording tool, record screen browser, capture tab video, online screen capture",
    faq: [
      ["Does this record my system audio too?", "Depending on your browser and operating system, you can usually choose to include tab or system audio alongside your microphone when the sharing prompt appears."],
      ["Is my recording uploaded anywhere?", "No. The capture uses your browser's built-in screen-sharing and MediaRecorder APIs, and the resulting file is generated and downloaded entirely on your device."],
      ["Can I record just one browser tab instead of my whole screen?", "Yes, when you press Start your browser's built-in picker lets you choose between your entire screen, a specific application window, or a single browser tab."],
    ],
    howTo: "Press Start Recording, choose your screen, window or tab in the browser's picker, then press Stop when finished and download the video.",
  },
  "video-info": {
    title: "Free Video Info Viewer — Check Resolution & Codec | ToolsRift",
    desc: "Free online video info viewer. Inspect a video's duration, resolution, frame rate, codec, bitrate and file size instantly, without uploading the file anywhere.",
    keywords: "video metadata viewer, check video resolution online, video codec checker, video info tool free, video properties viewer",
    faq: [
      ["What details does it show?", "Duration, resolution (width and height), estimated frame rate, video and audio codec, approximate bitrate, container format and file size."],
      ["Why is the frame rate only an estimate for some files?", "Exact frame rate detection depends on what your browser exposes for a given file; most common formats report it precisely, while a few less common ones may show a close estimate instead."],
      ["Do I need to upload my file to see this information?", "No, every detail is read locally from the file and the browser's video decoder — nothing about your file is sent anywhere."],
    ],
    howTo: "Load your video and its details appear automatically — duration, resolution, frame rate, codec, bitrate and file size, ready to copy.",
  },
  "video-fps-changer": {
    title: "Free Video Frame Rate Changer — Convert FPS | ToolsRift",
    desc: "Free online video frame rate changer. Convert footage between frame rates like 60fps, 30fps and 24fps entirely in your browser, with no upload required.",
    keywords: "change video frame rate, convert 60fps to 30fps, video fps converter online, frame rate changer free, video to 24fps",
    faq: [
      ["Why would I lower the frame rate?", "Lowering from 60fps to 30fps roughly halves the file size for the same duration and matches the frame rate most social platforms and TVs expect, at the cost of slightly less smooth motion."],
      ["Can I raise the frame rate instead?", "You can convert to a higher frame rate, but the tool duplicates or blends existing frames to reach it rather than inventing genuinely new motion detail — true frame interpolation needs specialised software."],
      ["What is 24fps used for?", "24fps is the traditional cinematic frame rate, giving footage a distinct film-like motion quality compared with the smoother look of 30fps or 60fps."],
    ],
    howTo: "Load your video, choose a target frame rate, and export. The re-timed file downloads once processing finishes.",
  },
  "video-brightness-contrast": {
    title: "Free Video Brightness & Contrast Editor — Color Grade | ToolsRift",
    desc: "Free online video brightness, contrast and saturation editor. Adjust the look of a clip with a live before/after preview, then export the graded video.",
    keywords: "video brightness contrast editor, adjust video color online, video color correction free, brighten video online, video saturation editor",
    faq: [
      ["Can I preview the change before exporting?", "Yes, a live before/after preview updates as you move the sliders, so you can judge the look before committing to the full export."],
      ["What do brightness, contrast and saturation each do?", "Brightness shifts how light or dark the whole image is, contrast controls the gap between the darkest and lightest areas, and saturation controls how vivid or muted the colours look."],
      ["Will this fix a badly underexposed video?", "Basic correction can meaningfully improve a slightly dark or flat clip, but footage that is extremely underexposed or overexposed has lost detail that adjustment alone cannot fully recover."],
    ],
    howTo: "Load your video, drag the brightness, contrast and saturation sliders while watching the live preview, then export the adjusted clip.",
  },
};

// ══════════════════════════════════════════════════════════════════════════════
//  SHARED VIDEO ENGINE
// ══════════════════════════════════════════════════════════════════════════════

let _ffmpeg = null;
let _ffmpegLoading = null;

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load " + src));
    document.head.appendChild(s);
  });
}

// Loads the single-threaded FFmpeg WebAssembly build (no SharedArrayBuffer /
// crossOriginIsolated headers required, unlike the multi-threaded core), so
// ads keep working on every page. Cached across tool switches in one visit.
async function getFFmpegEngine(onProgress) {
  if (_ffmpeg) return _ffmpeg;
  if (!_ffmpegLoading) {
    _ffmpegLoading = (async () => {
      await loadScriptOnce("https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js");
      const { createFFmpeg } = window.FFmpeg;
      const ffmpeg = createFFmpeg({
        corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
        log: false,
      });
      if (onProgress) ffmpeg.setProgress(({ ratio }) => onProgress(Math.max(0, Math.min(1, ratio))));
      await ffmpeg.load();
      _ffmpeg = ffmpeg;
      return ffmpeg;
    })();
  }
  return _ffmpegLoading;
}

async function fileToU8(file) { return new Uint8Array(await file.arrayBuffer()); }

// Runs one FFmpeg pass: writes inputs into the virtual FS, executes args,
// reads the named output back out as a Blob, and cleans up the virtual FS.
async function runFFmpeg({ inputs, args, outputName, mime, onProgress }) {
  const ffmpeg = await getFFmpegEngine(onProgress);
  for (const [name, file] of inputs) ffmpeg.FS("writeFile", name, await fileToU8(file));
  await ffmpeg.run(...args);
  const data = ffmpeg.FS("readFile", outputName);
  for (const [name] of inputs) { try { ffmpeg.FS("unlink", name); } catch (e) {} }
  try { ffmpeg.FS("unlink", outputName); } catch (e) {}
  return new Blob([data.buffer.slice(0)], { type: mime });
}

function useObjectUrl(blob) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) { setUrl(null); return; }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

function extOf(name) { const m = /\.([a-z0-9]+)$/i.exec(name || ""); return m ? m[1].toLowerCase() : "mp4"; }
function baseNameOf(name) { return (name || "video").replace(/\.[a-z0-9]+$/i, ""); }
function fmtBytes(n) { if (n < 1024) return n + " B"; if (n < 1048576) return (n / 1024).toFixed(1) + " KB"; return (n / 1048576).toFixed(2) + " MB"; }
function fmtTime(s) { if (!isFinite(s)) return "0:00"; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return m + ":" + String(sec).padStart(2, "0"); }

function FilePicker({ file, setFile, accept = "video/*", label = "Choose a video file" }) {
  const inputRef = useRef(null);
  return (
    <div>
      <Label>File</Label>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Btn variant="secondary" onClick={() => inputRef.current?.click()}>📁 {label}</Btn>
        <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
          onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
        {file && <span style={{ fontSize: 12, color: C.muted }}>{file.name} · {fmtBytes(file.size)}</span>}
      </div>
    </div>
  );
}

function VideoPreview({ file, videoRef, onMeta, style = {} }) {
  const url = useObjectUrl(file);
  if (!url) return null;
  return (
    <video ref={videoRef} src={url} controls playsInline
      style={{ width: "100%", maxHeight: 340, borderRadius: 10, background: "#000", ...style }}
      onLoadedMetadata={e => onMeta && onMeta({ duration: e.target.duration, width: e.target.videoWidth, height: e.target.videoHeight })} />
  );
}

function ProcessBar({ busy, progress, error, onRun, disabled, label = "▶ Process" }) {
  return (
    <VStack gap={10}>
      <button onClick={onRun} disabled={busy || disabled} style={{ ...bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`), alignSelf: "center", opacity: busy || disabled ? 0.55 : 1 }}>
        {busy ? `⏳ Processing… ${Math.round(progress * 100)}%` : label}
      </button>
      {busy && (
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.round(progress * 100)}%`, background: `linear-gradient(90deg,${C.accent},${C.accentD})`, transition: "width .2s" }} />
        </div>
      )}
      {error && <Result mono={false}>⚠ {error}</Result>}
    </VStack>
  );
}

function ResultDownload({ blob, filename, mediaType = "video" }) {
  const url = useObjectUrl(blob);
  if (!blob || !url) return null;
  return (
    <VStack gap={10}>
      <Label>Result</Label>
      {mediaType === "video" ? (
        <video src={url} controls playsInline style={{ width: "100%", maxHeight: 340, borderRadius: 10, background: "#000" }} />
      ) : mediaType === "audio" ? (
        <audio src={url} controls style={{ width: "100%" }} />
      ) : (
        <img src={url} alt="Result" style={{ width: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 10, background: "#000" }} />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{fmtBytes(blob.size)}</span>
        <Btn onClick={() => downloadBlobFile(blob, filename)}>⬇ Download</Btn>
      </div>
    </VStack>
  );
}

function downloadBlobFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.style.display = "none";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Minimal "stored" (uncompressed) ZIP writer — enough to bundle a handful of
// image frames without pulling in a compression library.
function crc32(buf) {
  let c, crcTable = crc32.table;
  if (!crcTable) {
    crcTable = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function buildZip(files) {
  // files: [{ name, data: Uint8Array }]
  const chunks = []; const central = [];
  let offset = 0;
  const dosTime = 0, dosDate = 0x21;
  for (const f of files) {
    const nameBytes = new TextEncoder().encode(f.name);
    const crc = crc32(f.data);
    const size = f.data.length;
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true); lv.setUint16(6, 0, true); lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true); lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true); lv.setUint32(18, size, true); lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true); lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    chunks.push(local, f.data);
    const cd = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0, true); cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, size, true); cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    central.push(cd);
    offset += local.length + f.data.length;
  }
  const centralSize = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
  const total = chunks.reduce((s, c) => s + c.length, 0) + centralSize + end.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) { out.set(c, p); p += c.length; }
  for (const c of central) { out.set(c, p); p += c.length; }
  out.set(end, p);
  return out;
}

// ══════════════════════════════════════════════════════════════════════════════
//  TOOLS
// ══════════════════════════════════════════════════════════════════════════════

// ── edit ─────────────────────────────────────────────────────────────────────

function VideoTrimmer() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const onMeta = (m) => { setDuration(m.duration); setStart(0); setEnd(m.duration); };
  const run = async () => {
    if (!file || end <= start) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-ss", String(start), "-to", String(end), "-c", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not trim this file — try a different format or a shorter clip. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={onMeta} />
      {file && duration > 0 && (
        <>
          <Grid2>
            <div><Label>Start ({fmtTime(start)})</Label><input type="range" min={0} max={duration} step={0.1} value={start} onChange={e => setStart(Math.min(parseFloat(e.target.value), end - 0.1))} style={{ width: "100%" }} /></div>
            <div><Label>End ({fmtTime(end)})</Label><input type="range" min={0} max={duration} step={0.1} value={end} onChange={e => setEnd(Math.max(parseFloat(e.target.value), start + 0.1))} style={{ width: "100%" }} /></div>
          </Grid2>
          <StatBox value={fmtTime(Math.max(0, end - start))} label="Trimmed duration" />
        </>
      )}
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="✂ Trim Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-trimmed.mp4"} />
      <Note>Trimming uses stream copy where possible, so it is fast and lossless — the cut points snap to the nearest keyframe, which is usually within a fraction of a second of your chosen time.</Note>
    </VStack>
  );
}

function VideoMerger() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const addFiles = (list) => setFiles(f => [...f, ...Array.from(list)]);
  const remove = (i) => setFiles(f => f.filter((_, idx) => idx !== i));
  const move = (i, dir) => setFiles(f => {
    const a = f.slice(); const j = i + dir;
    if (j < 0 || j >= a.length) return a;
    [a[i], a[j]] = [a[j], a[i]]; return a;
  });

  const run = async () => {
    if (files.length < 2) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const ffmpeg = await getFFmpegEngine(setProgress);
      const names = [];
      for (let i = 0; i < files.length; i++) {
        const n = `clip${i}.${extOf(files[i].name)}`;
        ffmpeg.FS("writeFile", n, await fileToU8(files[i]));
        names.push(n);
      }
      const listTxt = names.map(n => `file '${n}'`).join("\n");
      ffmpeg.FS("writeFile", "list.txt", new TextEncoder().encode(listTxt));
      await ffmpeg.run("-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "out.mp4");
      const data = ffmpeg.FS("readFile", "out.mp4");
      names.forEach(n => { try { ffmpeg.FS("unlink", n); } catch (e) {} });
      try { ffmpeg.FS("unlink", "list.txt"); ffmpeg.FS("unlink", "out.mp4"); } catch (e) {}
      setResult(new Blob([data.buffer.slice(0)], { type: "video/mp4" }));
    } catch (e) { setError("Could not merge these clips — they may use different codecs. Try converting them to the same format first with the Video Format Converter. (" + (e.message || e) + ")"); }
    setBusy(false);
  };

  return (
    <VStack gap={16}>
      <div>
        <Label>Video Files (in the order you want them joined)</Label>
        <Btn variant="secondary" onClick={() => inputRef.current?.click()}>📁 Add Videos</Btn>
        <input ref={inputRef} type="file" accept="video/*" multiple style={{ display: "none" }} onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />
      </div>
      {files.length > 0 && (
        <VStack gap={6}>
          {files.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 8 }}>
              <span style={{ fontSize: 12, color: C.muted, width: 20 }}>{i + 1}.</span>
              <span style={{ flex: 1, fontSize: 13 }}>{f.name}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{fmtBytes(f.size)}</span>
              <Btn size="sm" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}>↑</Btn>
              <Btn size="sm" variant="ghost" onClick={() => move(i, 1)} disabled={i === files.length - 1}>↓</Btn>
              <Btn size="sm" variant="danger" onClick={() => remove(i)}>✕</Btn>
            </div>
          ))}
        </VStack>
      )}
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={files.length < 2} label="➕ Merge Videos" />
      <ResultDownload blob={result} filename="merged.mp4" />
      <Note>For a clean merge, clips with the same resolution, frame rate and codec work best. Mixed-format clips may fail — convert them to the same format first if merging errors out.</Note>
    </VStack>
  );
}

function VideoRotate() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("90cw");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const FILTERS = {
    "90cw": "transpose=1", "90ccw": "transpose=2", "180": "transpose=1,transpose=1",
    "fliph": "hflip", "flipv": "vflip",
  };
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", FILTERS[mode], "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not rotate this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Rotation</Label><SelectInput value={mode} onChange={setMode} style={{ width: "100%" }} options={[["90cw", "Rotate 90° clockwise"], ["90ccw", "Rotate 90° counter-clockwise"], ["180", "Rotate 180°"], ["fliph", "Flip horizontal (mirror)"], ["flipv", "Flip vertical"]]} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🔄 Rotate Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-rotated.mp4"} />
    </VStack>
  );
}

function VideoCrop() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [ratio, setRatio] = useState("916");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const RATIOS = { "916": [9, 16], "11": [1, 1], "45": [4, 5], "169": [16, 9], "43": [4, 3] };
  const cropFilter = () => {
    if (!meta) return "";
    const [rw, rh] = RATIOS[ratio];
    const targetRatio = rw / rh;
    const srcRatio = meta.width / meta.height;
    let w, h;
    if (srcRatio > targetRatio) { h = meta.height; w = Math.floor(h * targetRatio); }
    else { w = meta.width; h = Math.floor(w / targetRatio); }
    w -= w % 2; h -= h % 2;
    return `crop=${w}:${h}:(in_w-${w})/2:(in_h-${h})/2`;
  };
  const run = async () => {
    if (!file || !meta) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", cropFilter(), "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not crop this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); setMeta(null); }} />
      <VideoPreview file={file} onMeta={setMeta} />
      <div><Label>Crop To</Label><SelectInput value={ratio} onChange={setRatio} style={{ width: "100%" }} options={[["916", "9:16 — Reels / Shorts / TikTok"], ["11", "1:1 — Square feed post"], ["45", "4:5 — Portrait feed post"], ["169", "16:9 — Widescreen"], ["43", "4:3 — Classic"]]} /></div>
      {meta && <Note>Source is {meta.width}×{meta.height}. The crop centres on the middle of the frame, trimming the edges to fit the chosen ratio.</Note>}
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file || !meta} label="⬛ Crop Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-cropped.mp4"} />
    </VStack>
  );
}

function VideoMute() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-c", "copy", "-an", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not remove the audio from this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🔇 Remove Audio" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-muted.mp4"} />
      <Note>The video stream is copied without re-encoding, so this is fast and does not reduce visual quality — only the audio track is dropped.</Note>
    </VStack>
  );
}

function VideoSpeed() {
  const [file, setFile] = useState(null);
  const [speed, setSpeed] = useState("2");
  const [keepAudio, setKeepAudio] = useState("yes");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    const s = parseFloat(speed) || 1;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const pts = `setpts=${(1 / s).toFixed(6)}*PTS`;
      const args = keepAudio === "yes"
        ? ["-i", inName, "-filter_complex", `[0:v]${pts}[v];[0:a]atempo=${clampAtempo(s)}[a]`, "-map", "[v]", "-map", "[a]", "out.mp4"]
        : ["-i", inName, "-vf", pts, "-an", "out.mp4"];
      const blob = await runFFmpeg({ inputs: [[inName, file]], args, outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress });
      setResult(blob);
    } catch (e) { setError("Could not change the speed of this file — if it has no audio track, try Keep Audio: No. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <Grid2>
        <div><Label>Speed Multiplier</Label><SelectInput value={speed} onChange={setSpeed} style={{ width: "100%" }} options={[["0.25", "0.25x — 4x slower"], ["0.5", "0.5x — 2x slower"], ["0.75", "0.75x"], ["1.5", "1.5x"], ["2", "2x faster"], ["3", "3x faster"], ["4", "4x faster"]]} /></div>
        <div><Label>Audio</Label><SelectInput value={keepAudio} onChange={setKeepAudio} style={{ width: "100%" }} options={[["yes", "Keep audio (pitch-adjusted)"], ["no", "Remove audio"]]} /></div>
      </Grid2>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="⏩ Change Speed" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-" + speed + "x.mp4"} />
    </VStack>
  );
}
// FFmpeg's atempo filter only accepts 0.5–2.0 per instance; chain instances for extreme values.
function clampAtempo(s) {
  if (s >= 0.5 && s <= 2) return s.toFixed(4);
  if (s > 2) return "2.0,atempo=" + (s / 2).toFixed(4);
  return "0.5,atempo=" + (s / 0.5).toFixed(4);
}

function VideoWatermark() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("ToolsRift");
  const [pos, setPos] = useState("br");
  const [size, setSize] = useState("28");
  const [color, setColor] = useState("white");
  const [opacity, setOpacity] = useState("0.8");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const POS = { tl: "x=20:y=20", tr: "x=w-tw-20:y=20", bl: "x=20:y=h-th-20", br: "x=w-tw-20:y=h-th-20", c: "x=(w-tw)/2:y=(h-th)/2" };
  const run = async () => {
    if (!file || !text.trim()) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const esc = text.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
      const filter = `drawtext=text='${esc}':fontsize=${size}:fontcolor=${color}@${opacity}:${POS[pos]}:box=1:boxcolor=black@0.25:boxborderw=8`;
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", filter, "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not add the watermark. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Watermark Text</Label><Input value={text} onChange={setText} placeholder="Your text or brand" /></div>
      <Grid3>
        <div><Label>Position</Label><SelectInput value={pos} onChange={setPos} style={{ width: "100%" }} options={[["tl", "Top left"], ["tr", "Top right"], ["bl", "Bottom left"], ["br", "Bottom right"], ["c", "Center"]]} /></div>
        <div><Label>Font Size</Label><SelectInput value={size} onChange={setSize} style={{ width: "100%" }} options={[["18", "Small"], ["28", "Medium"], ["42", "Large"]]} /></div>
        <div><Label>Colour</Label><SelectInput value={color} onChange={setColor} style={{ width: "100%" }} options={[["white", "White"], ["black", "Black"], ["yellow", "Yellow"], ["red", "Red"]]} /></div>
      </Grid3>
      <div><Label>Opacity ({Math.round(parseFloat(opacity) * 100)}%)</Label><input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={e => setOpacity(e.target.value)} style={{ width: "100%" }} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file || !text.trim()} label="🏷️ Add Watermark" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-watermarked.mp4"} />
    </VStack>
  );
}

// ── convert ──────────────────────────────────────────────────────────────────

const CONVERT_FORMATS = { mp4: ["libx264", "aac"], webm: ["libvpx", "libvorbis"], mov: ["libx264", "aac"], avi: ["mpeg4", "libmp3lame"], mkv: ["libx264", "aac"] };
function VideoConverter() {
  const [file, setFile] = useState(null);
  const [fmt, setFmt] = useState("webm");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const [vcodec, acodec] = CONVERT_FORMATS[fmt];
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-c:v", vcodec, "-c:a", acodec, "out." + fmt],
        outputName: "out." + fmt, mime: "video/" + fmt, onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not convert this file to " + fmt.toUpperCase() + ". (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Convert To</Label><SelectInput value={fmt} onChange={setFmt} style={{ width: "100%" }} options={[["mp4", "MP4 (H.264 — most compatible)"], ["webm", "WebM (VP8 — smaller, web-native)"], ["mov", "MOV (QuickTime)"], ["avi", "AVI"], ["mkv", "MKV (Matroska)"]]} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label={"🔁 Convert to " + fmt.toUpperCase()} />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "." + fmt} />
    </VStack>
  );
}

function VideoCompressor() {
  const [file, setFile] = useState(null);
  const [crf, setCrf] = useState("28");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-c:v", "libx264", "-crf", crf, "-preset", "veryfast", "-c:a", "aac", "-b:a", "128k", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not compress this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  const savedPct = file && result ? Math.round((1 - result.size / file.size) * 100) : null;
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Quality vs Size (CRF {crf} — lower is higher quality)</Label><input type="range" min={18} max={40} step={1} value={crf} onChange={e => setCrf(e.target.value)} style={{ width: "100%" }} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🗜️ Compress Video" />
      {savedPct !== null && <Note>{savedPct > 0 ? `Reduced file size by about ${savedPct}%.` : "This setting did not shrink the file — try a higher CRF value."}</Note>}
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-compressed.mp4"} />
    </VStack>
  );
}

function VideoToAudio() {
  const [file, setFile] = useState(null);
  const [fmt, setFmt] = useState("mp3");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const CODECS = { mp3: "libmp3lame", aac: "aac", wav: "pcm_s16le" };
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vn", "-c:a", CODECS[fmt], "out." + fmt],
        outputName: "out." + fmt, mime: "audio/" + fmt, onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not extract audio — this file may not contain an audio track. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Output Format</Label><SelectInput value={fmt} onChange={setFmt} style={{ width: "100%" }} options={[["mp3", "MP3 — widely compatible"], ["aac", "AAC — smaller, high quality"], ["wav", "WAV — uncompressed"]]} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🎵 Extract Audio" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "." + fmt} mediaType="audio" />
    </VStack>
  );
}

const RESIZE_PRESETS = { "1920x1080": [1920, 1080], "1280x720": [1280, 720], "1080x1920": [1080, 1920], "1080x1080": [1080, 1080], custom: null };
function VideoResize() {
  const [file, setFile] = useState(null);
  const [preset, setPreset] = useState("1280x720");
  const [customW, setCustomW] = useState("1280");
  const [customH, setCustomH] = useState("720");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [w, h] = preset === "custom" ? [parseInt(customW, 10) || 2, parseInt(customH, 10) || 2] : RESIZE_PRESETS[preset];
  const run = async () => {
    if (!file) return;
    const ew = w - (w % 2), eh = h - (h % 2);
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", `scale=${ew}:${eh}`, "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not resize this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Target Resolution</Label><SelectInput value={preset} onChange={setPreset} style={{ width: "100%" }} options={[["1920x1080", "1920×1080 — Full HD"], ["1280x720", "1280×720 — HD"], ["1080x1920", "1080×1920 — Vertical HD"], ["1080x1080", "1080×1080 — Square"], ["custom", "Custom size"]]} /></div>
      {preset === "custom" && (
        <Grid2>
          <div><Label>Width</Label><Input value={customW} onChange={setCustomW} /></div>
          <div><Label>Height</Label><Input value={customH} onChange={setCustomH} /></div>
        </Grid2>
      )}
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="📐 Resize Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + `-${w}x${h}.mp4`} />
    </VStack>
  );
}

function VideoReverse() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", "reverse", "-af", "areverse", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not reverse this file — very long clips may run out of memory. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="⏪ Reverse Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-reversed.mp4"} />
      <Note>Reversing decodes and re-encodes every frame, so it takes longer than a trim or format change and needs the whole clip in memory.</Note>
    </VStack>
  );
}

function VideoLoop() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("count");
  const [count, setCount] = useState("3");
  const [targetDur, setTargetDur] = useState("30");
  const [srcDuration, setSrcDuration] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      let repeats;
      if (mode === "count") repeats = Math.max(1, parseInt(count, 10) || 1) - 1;
      else repeats = srcDuration > 0 ? Math.max(0, Math.ceil((parseFloat(targetDur) || 0) / srcDuration) - 1) : 0;
      const args = mode === "duration"
        ? ["-stream_loop", String(repeats), "-i", inName, "-t", targetDur, "-c", "copy", "out.mp4"]
        : ["-stream_loop", String(repeats), "-i", inName, "-c", "copy", "out.mp4"];
      const blob = await runFFmpeg({ inputs: [[inName, file]], args, outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress });
      setResult(blob);
    } catch (e) { setError("Could not loop this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={m => setSrcDuration(m.duration)} />
      <div><Label>Loop Mode</Label><SelectInput value={mode} onChange={setMode} style={{ width: "100%" }} options={[["count", "Repeat a set number of times"], ["duration", "Repeat up to a target duration"]]} /></div>
      {mode === "count"
        ? <div><Label>Number of Repeats</Label><Input value={count} onChange={setCount} /></div>
        : <div><Label>Target Duration (seconds)</Label><Input value={targetDur} onChange={setTargetDur} /></div>}
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🔁 Loop Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-looped.mp4"} />
    </VStack>
  );
}

function VideoBitrateChanger() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("bitrate");
  const [bitrate, setBitrate] = useState("2000");
  const [targetMB, setTargetMB] = useState("10");
  const [srcDuration, setSrcDuration] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const effectiveKbps = mode === "size" && srcDuration > 0
    ? Math.max(100, Math.floor((parseFloat(targetMB) * 8192) / srcDuration) - 128)
    : parseInt(bitrate, 10) || 2000;
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-c:v", "libx264", "-b:v", effectiveKbps + "k", "-maxrate", effectiveKbps + "k", "-bufsize", (effectiveKbps * 2) + "k", "-c:a", "aac", "-b:a", "128k", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not re-encode this file at that bitrate. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={m => setSrcDuration(m.duration)} />
      <div><Label>Mode</Label><SelectInput value={mode} onChange={setMode} style={{ width: "100%" }} options={[["bitrate", "Set exact bitrate"], ["size", "Target a file size"]]} /></div>
      {mode === "bitrate"
        ? <div><Label>Video Bitrate (kbps)</Label><Input value={bitrate} onChange={setBitrate} /></div>
        : <div><Label>Target File Size (MB)</Label><Input value={targetMB} onChange={setTargetMB} /></div>}
      <StatBox value={effectiveKbps + " kbps"} label="Video bitrate that will be used" />
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="📊 Set Bitrate & Export" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-" + effectiveKbps + "k.mp4"} />
    </VStack>
  );
}

// ── gif & images ─────────────────────────────────────────────────────────────

// Grabs frames from a video at specific timestamps using an offscreen <video>
// + <canvas>, with no FFmpeg engine involved — fast, and avoids the WASM
// download for simple preview-quality frame capture.
function captureFramesAt(file, times, { mime = "image/jpeg", quality = 0.9 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true; video.playsInline = true; video.src = url;
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read this video file.")); };
    video.onloadedmetadata = async () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        const frames = [];
        for (const t of times) {
          await new Promise((res) => {
            const onSeeked = () => { video.removeEventListener("seeked", onSeeked); res(); };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = Math.min(Math.max(t, 0), Math.max(0, video.duration - 0.05));
          });
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise(res => canvas.toBlob(res, mime, quality));
          frames.push({ time: t, blob, width: canvas.width, height: canvas.height });
        }
        URL.revokeObjectURL(url);
        resolve({ frames, duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      } catch (e) { URL.revokeObjectURL(url); reject(e); }
    };
  });
}

function VideoToGif() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [fps, setFps] = useState("10");
  const [width, setWidth] = useState("480");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const onMeta = (m) => { setDuration(m.duration); setStart(0); setEnd(Math.min(m.duration, 5)); };
  const run = async () => {
    if (!file || end <= start) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const vf = `fps=${fps},scale=${width}:-1:flags=lanczos`;
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-ss", String(start), "-to", String(end), "-vf", vf, "out.gif"],
        outputName: "out.gif", mime: "image/gif", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not create the GIF — try a shorter clip or a smaller width. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={onMeta} />
      {duration > 0 && (
        <Grid2>
          <div><Label>Start ({fmtTime(start)})</Label><input type="range" min={0} max={duration} step={0.1} value={start} onChange={e => setStart(Math.min(parseFloat(e.target.value), end - 0.1))} style={{ width: "100%" }} /></div>
          <div><Label>End ({fmtTime(end)})</Label><input type="range" min={0} max={duration} step={0.1} value={end} onChange={e => setEnd(Math.max(parseFloat(e.target.value), start + 0.1))} style={{ width: "100%" }} /></div>
        </Grid2>
      )}
      <Grid2>
        <div><Label>Frame Rate</Label><SelectInput value={fps} onChange={setFps} style={{ width: "100%" }} options={[["8", "8 fps — smallest file"], ["10", "10 fps — recommended"], ["15", "15 fps — smoother"], ["24", "24 fps — very smooth, large file"]]} /></div>
        <div><Label>Width (px)</Label><SelectInput value={width} onChange={setWidth} style={{ width: "100%" }} options={[["320", "320px"], ["480", "480px — recommended"], ["640", "640px"], ["960", "960px"]]} /></div>
      </Grid2>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🎞️ Create GIF" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + ".gif"} mediaType="image" />
      <Note>Longer clips, higher frame rates and larger widths all increase the GIF's file size quickly — keep the trim short for a shareable result.</Note>
    </VStack>
  );
}

function GifToVideo() {
  const [file, setFile] = useState(null);
  const [fmt, setFmt] = useState("mp4");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const args = fmt === "mp4"
        ? ["-i", "in.gif", "-movflags", "faststart", "-pix_fmt", "yuv420p", "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "out.mp4"]
        : ["-i", "in.gif", "-c:v", "libvpx", "-pix_fmt", "yuv420p", "out.webm"];
      const blob = await runFFmpeg({
        inputs: [["in.gif", file]], args, outputName: "out." + fmt, mime: "video/" + fmt, onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not convert this GIF. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} accept="image/gif" label="Choose a GIF file" />
      {file && <img src={URL.createObjectURL(file)} alt="GIF preview" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 10 }} />}
      <div><Label>Output Format</Label><SelectInput value={fmt} onChange={setFmt} style={{ width: "100%" }} options={[["mp4", "MP4 — most compatible"], ["webm", "WebM — smaller, web-native"]]} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="📹 Convert to Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "." + fmt} />
    </VStack>
  );
}

function VideoThumbnail() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [t, setT] = useState(0);
  const [fmt, setFmt] = useState("jpg");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const capture = async () => {
    if (!file) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const { frames } = await captureFramesAt(file, [t], { mime: fmt === "png" ? "image/png" : "image/jpeg" });
      setResult(frames[0].blob);
    } catch (e) { setError("Could not capture a frame from this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={m => { setDuration(m.duration); setT(m.duration / 2); }} />
      {duration > 0 && <div><Label>Timestamp ({fmtTime(t)})</Label><input type="range" min={0} max={duration} step={0.05} value={t} onChange={e => setT(parseFloat(e.target.value))} style={{ width: "100%" }} /></div>}
      <div><Label>Format</Label><SelectInput value={fmt} onChange={setFmt} style={{ width: "100%" }} options={[["jpg", "JPG — smaller file"], ["png", "PNG — lossless"]]} /></div>
      <ProcessBar busy={busy} progress={0} error={error} onRun={capture} disabled={!file} label="🖼️ Capture Frame" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-thumb." + fmt} mediaType="image" />
      <Note>This reads the frame directly from the video element and a canvas, so it works instantly without downloading the video-processing engine.</Note>
    </VStack>
  );
}

function VideoFramesExtractor() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [count, setCount] = useState("10");
  const [fmt, setFmt] = useState("jpg");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file || duration <= 0) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const n = Math.max(1, Math.min(60, parseInt(count, 10) || 10));
      const times = Array.from({ length: n }, (_, i) => (duration * (i + 0.5)) / n);
      const { frames } = await captureFramesAt(file, times, { mime: fmt === "png" ? "image/png" : "image/jpeg" });
      const files = [];
      for (let i = 0; i < frames.length; i++) {
        const buf = new Uint8Array(await frames[i].blob.arrayBuffer());
        files.push({ name: `frame-${String(i + 1).padStart(3, "0")}.${fmt}`, data: buf });
      }
      const zipBytes = buildZip(files);
      setResult(new Blob([zipBytes], { type: "application/zip" }));
    } catch (e) { setError("Could not extract frames from this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={m => setDuration(m.duration)} />
      <Grid2>
        <div><Label>Number of Frames (1–60)</Label><Input value={count} onChange={setCount} /></div>
        <div><Label>Format</Label><SelectInput value={fmt} onChange={setFmt} style={{ width: "100%" }} options={[["jpg", "JPG"], ["png", "PNG"]]} /></div>
      </Grid2>
      <ProcessBar busy={busy} progress={0} error={error} onRun={run} disabled={!file} label="🎬 Extract Frames" />
      {result && (
        <VStack gap={10}>
          <Label>Result</Label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.muted }}>{count} frames · {fmtBytes(result.size)} ZIP</span>
            <Btn onClick={() => downloadBlobFile(result, baseNameOf(file?.name) + "-frames.zip")}>⬇ Download ZIP</Btn>
          </div>
        </VStack>
      )}
    </VStack>
  );
}

function VideoContactSheet() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [cols, setCols] = useState("4");
  const [rows, setRows] = useState("4");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file || duration <= 0) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const cc = Math.max(1, Math.min(8, parseInt(cols, 10) || 4));
      const rr = Math.max(1, Math.min(8, parseInt(rows, 10) || 4));
      const n = cc * rr;
      const times = Array.from({ length: n }, (_, i) => (duration * (i + 0.5)) / n);
      const { frames, width, height } = await captureFramesAt(file, times, { mime: "image/jpeg", quality: 0.85 });
      const tileW = 320, tileH = Math.round((height / width) * 320);
      const canvas = document.createElement("canvas");
      canvas.width = tileW * cc; canvas.height = tileH * rr;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111827"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < frames.length; i++) {
        const img = await createImageBitmap(frames[i].blob);
        const col = i % cc, row = Math.floor(i / cc);
        ctx.drawImage(img, col * tileW, row * tileH, tileW, tileH);
        ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(col * tileW + 4, row * tileH + tileH - 18, 44, 14);
        ctx.fillStyle = "#fff"; ctx.font = "11px monospace"; ctx.fillText(fmtTime(frames[i].time), col * tileW + 7, row * tileH + tileH - 7);
      }
      const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
      setResult(blob);
    } catch (e) { setError("Could not build the contact sheet. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} onMeta={m => setDuration(m.duration)} />
      <Grid2>
        <div><Label>Columns</Label><Input value={cols} onChange={setCols} /></div>
        <div><Label>Rows</Label><Input value={rows} onChange={setRows} /></div>
      </Grid2>
      <ProcessBar busy={busy} progress={0} error={error} onRun={run} disabled={!file} label="🗂️ Generate Contact Sheet" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-contact-sheet.png"} mediaType="image" />
    </VStack>
  );
}

function VideoSocialCrop() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [ratio, setRatio] = useState("916");
  const [mode, setMode] = useState("crop");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const RATIOS = { "916": [9, 16, "Reels / Shorts / TikTok"], "11": [1, 1, "Square feed"], "45": [4, 5, "Portrait feed"] };
  const buildFilter = () => {
    const [rw, rh] = RATIOS[ratio];
    const targetRatio = rw / rh;
    if (mode === "crop") {
      const srcRatio = meta.width / meta.height;
      let w, h;
      if (srcRatio > targetRatio) { h = meta.height; w = Math.floor(h * targetRatio); } else { w = meta.width; h = Math.floor(w / targetRatio); }
      w -= w % 2; h -= h % 2;
      return `crop=${w}:${h}:(in_w-${w})/2:(in_h-${h})/2`;
    }
    let cw, ch;
    if (meta.width / meta.height > targetRatio) { cw = meta.width; ch = Math.round(meta.width / targetRatio); } else { ch = meta.height; cw = Math.round(meta.height * targetRatio); }
    cw -= cw % 2; ch -= ch % 2;
    return `scale='min(${cw},iw)':'min(${ch},ih)':force_original_aspect_ratio=decrease,pad=${cw}:${ch}:(ow-iw)/2:(oh-ih)/2:black`;
  };
  const run = async () => {
    if (!file || !meta) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", buildFilter(), "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not reframe this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); setMeta(null); }} />
      <VideoPreview file={file} onMeta={setMeta} />
      <Grid2>
        <div><Label>Platform Ratio</Label><SelectInput value={ratio} onChange={setRatio} style={{ width: "100%" }} options={Object.entries(RATIOS).map(([k, v]) => [k, `${v[0]}:${v[1]} — ${v[2]}`])} /></div>
        <div><Label>Method</Label><SelectInput value={mode} onChange={setMode} style={{ width: "100%" }} options={[["crop", "Crop to fill (loses edges)"], ["pad", "Pad to fit (keeps whole frame)"]]} /></div>
      </Grid2>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file || !meta} label="📱 Reframe Video" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-social.mp4"} />
    </VStack>
  );
}

// ── record & capture ─────────────────────────────────────────────────────────

function useMediaRecorder() {
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const start = async (getStream) => {
    setError(null); setResult(null);
    try {
      const s = await getStream();
      setStream(s);
      chunksRef.current = [];
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(t => window.MediaRecorder && MediaRecorder.isTypeSupported(t)) || "";
      const rec = new MediaRecorder(s, mimeType ? { mimeType } : undefined);
      rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        setResult(new Blob(chunksRef.current, { type: "video/webm" }));
        s.getTracks().forEach(t => t.stop());
        setStream(null);
        clearInterval(timerRef.current);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch (e) {
      setError(e && e.name === "NotAllowedError" ? "Permission was denied — allow camera/microphone or screen-sharing access to record." : "Could not start recording. (" + (e.message || e) + ")");
    }
  };
  const stop = () => { if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop(); setRecording(false); };
  useEffect(() => () => { clearInterval(timerRef.current); if (stream) stream.getTracks().forEach(t => t.stop()); }, []); // eslint-disable-line
  return { recording, stream, result, error, elapsed, start, stop, setResult };
}

function WebcamRecorder() {
  const rec = useMediaRecorder();
  const videoRef = useRef(null);
  useEffect(() => { if (videoRef.current) videoRef.current.srcObject = rec.stream || null; }, [rec.stream]);
  return (
    <VStack gap={16}>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", maxHeight: 360, borderRadius: 10, background: "#000", display: rec.stream ? "block" : "none" }} />
      {!rec.stream && !rec.result && <Result mono={false}>Press Start to allow camera and microphone access, then begin recording.</Result>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {!rec.recording
          ? <button onClick={() => rec.start(() => navigator.mediaDevices.getUserMedia({ video: true, audio: true }))} style={bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`)}>📷 Start Recording</button>
          : <button onClick={rec.stop} style={bigBtn("linear-gradient(135deg,#EF4444,#DC2626)")}>⏹ Stop ({fmtTime(rec.elapsed)})</button>}
      </div>
      {rec.error && <Result mono={false}>⚠ {rec.error}</Result>}
      <ResultDownload blob={rec.result} filename="webcam-recording.webm" />
    </VStack>
  );
}

function ScreenRecorder() {
  const rec = useMediaRecorder();
  const videoRef = useRef(null);
  useEffect(() => { if (videoRef.current) videoRef.current.srcObject = rec.stream || null; }, [rec.stream]);
  useEffect(() => {
    if (!rec.stream) return;
    const track = rec.stream.getVideoTracks()[0];
    if (track) track.onended = () => rec.stop();
  }, [rec.stream]); // eslint-disable-line
  return (
    <VStack gap={16}>
      <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", maxHeight: 360, borderRadius: 10, background: "#000", display: rec.stream ? "block" : "none" }} />
      {!rec.stream && !rec.result && <Result mono={false}>Press Start, then choose your screen, a window or a browser tab to share.</Result>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        {!rec.recording
          ? <button onClick={() => rec.start(() => navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }))} style={bigBtn(`linear-gradient(135deg,${C.accent},${C.accentD})`)}>🖥️ Start Recording</button>
          : <button onClick={rec.stop} style={bigBtn("linear-gradient(135deg,#EF4444,#DC2626)")}>⏹ Stop ({fmtTime(rec.elapsed)})</button>}
      </div>
      {rec.error && <Result mono={false}>⚠ {rec.error}</Result>}
      <ResultDownload blob={rec.result} filename="screen-recording.webm" />
      <Note>You can also stop by using your browser's own "Stop sharing" control, which ends the recording the same way as the Stop button here.</Note>
    </VStack>
  );
}

function VideoInfo() {
  const [file, setFile] = useState(null);
  const [basic, setBasic] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const onMeta = (m) => setBasic(m);
  useEffect(() => {
    if (!file || !basic) return;
    let cancelled = false;
    setLoading(true); setError(null); setDetail(null);
    (async () => {
      try {
        const ffmpeg = await getFFmpegEngine();
        let log = "";
        ffmpeg.setLogger(({ message }) => { log += message + "\n"; });
        const inName = "probe." + extOf(file.name);
        ffmpeg.FS("writeFile", inName, await fileToU8(file));
        try { await ffmpeg.run("-i", inName, "-f", "null", "-"); } catch (e) { /* expected on some builds */ }
        try { ffmpeg.FS("unlink", inName); } catch (e) {}
        ffmpeg.setLogger(() => {});
        if (cancelled) return;
        const vMatch = /Video:\s*([a-zA-Z0-9_]+)[^,]*,[^,]*,\s*(\d+)x(\d+)[^,]*(?:,\s*(\d+)\s*kb\/s)?[^,]*,\s*([\d.]+)\s*fps/.exec(log);
        const aMatch = /Audio:\s*([a-zA-Z0-9_]+)[^,]*,\s*(\d+)\s*Hz,\s*([a-z.0-9]+)(?:[^,]*,\s*[a-z0-9]+)?(?:,\s*(\d+)\s*kb\/s)?/.exec(log);
        setDetail({
          videoCodec: vMatch ? vMatch[1] : "—", fps: vMatch && vMatch[5] ? vMatch[5] : "—",
          videoBitrate: vMatch && vMatch[4] ? vMatch[4] + " kb/s" : "—",
          audioCodec: aMatch ? aMatch[1] : "no audio track", audioHz: aMatch ? aMatch[2] + " Hz" : "—",
          audioBitrate: aMatch && aMatch[4] ? aMatch[4] + " kb/s" : "—",
        });
      } catch (e) { if (!cancelled) setError("Could not read detailed stream info for this file, but the basic details above are still accurate."); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [file, basic]);
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setBasic(null); setDetail(null); setError(null); }} />
      <VideoPreview file={file} onMeta={onMeta} />
      {basic && (
        <>
          <Grid3>
            <StatBox value={fmtTime(basic.duration)} label="Duration" />
            <StatBox value={`${basic.width}×${basic.height}`} label="Resolution" />
            <StatBox value={fmtBytes(file.size)} label="File size" />
          </Grid3>
          <DataTable
            columns={["Property", "Value"]}
            rows={[
              ["Container", extOf(file.name).toUpperCase()],
              ["Video codec", loading ? "Reading…" : (detail ? detail.videoCodec : "—")],
              ["Frame rate", loading ? "Reading…" : (detail ? detail.fps + " fps" : "—")],
              ["Video bitrate", loading ? "Reading…" : (detail ? detail.videoBitrate : "—")],
              ["Audio codec", loading ? "Reading…" : (detail ? detail.audioCodec : "—")],
              ["Audio sample rate", loading ? "Reading…" : (detail ? detail.audioHz : "—")],
              ["Average bitrate (est.)", ((file.size * 8) / basic.duration / 1000).toFixed(0) + " kb/s"],
            ]}
          />
          {error && <Note>{error}</Note>}
        </>
      )}
    </VStack>
  );
}

function VideoFpsChanger() {
  const [file, setFile] = useState(null);
  const [fps, setFps] = useState("30");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-r", fps, "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not change the frame rate of this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      <VideoPreview file={file} />
      <div><Label>Target Frame Rate</Label><SelectInput value={fps} onChange={setFps} style={{ width: "100%" }} options={[["24", "24 fps — cinematic"], ["25", "25 fps — PAL"], ["30", "30 fps — standard"], ["50", "50 fps"], ["60", "60 fps — smooth motion"]]} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🎚️ Change Frame Rate" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-" + fps + "fps.mp4"} />
    </VStack>
  );
}

function VideoBrightnessContrast() {
  const [file, setFile] = useState(null);
  const [brightness, setBrightness] = useState("0");
  const [contrast, setContrast] = useState("1");
  const [saturation, setSaturation] = useState("1");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const cssPreview = `brightness(${1 + parseFloat(brightness)}) contrast(${contrast}) saturate(${saturation})`;
  const run = async () => {
    if (!file) return;
    setBusy(true); setProgress(0); setError(null); setResult(null);
    try {
      const inName = "in." + extOf(file.name);
      const filter = `eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`;
      const blob = await runFFmpeg({
        inputs: [[inName, file]],
        args: ["-i", inName, "-vf", filter, "-c:a", "copy", "out.mp4"],
        outputName: "out.mp4", mime: "video/mp4", onProgress: setProgress,
      });
      setResult(blob);
    } catch (e) { setError("Could not adjust this file. (" + (e.message || e) + ")"); }
    setBusy(false);
  };
  return (
    <VStack gap={16}>
      <FilePicker file={file} setFile={f => { setFile(f); setResult(null); setError(null); }} />
      {file && <VideoPreview file={file} style={{ filter: cssPreview }} />}
      <Note>The preview above is a live CSS approximation — press Process to render the real, exportable version.</Note>
      <div><Label>Brightness ({brightness})</Label><input type="range" min={-0.5} max={0.5} step={0.05} value={brightness} onChange={e => setBrightness(e.target.value)} style={{ width: "100%" }} /></div>
      <div><Label>Contrast ({contrast})</Label><input type="range" min={0.5} max={2} step={0.05} value={contrast} onChange={e => setContrast(e.target.value)} style={{ width: "100%" }} /></div>
      <div><Label>Saturation ({saturation})</Label><input type="range" min={0} max={2.5} step={0.05} value={saturation} onChange={e => setSaturation(e.target.value)} style={{ width: "100%" }} /></div>
      <ProcessBar busy={busy} progress={progress} error={error} onRun={run} disabled={!file} label="🎨 Apply & Export" />
      <ResultDownload blob={result} filename={baseNameOf(file?.name) + "-graded.mp4"} />
    </VStack>
  );
}

const TOOL_COMPONENTS = {
  "video-trimmer": VideoTrimmer,
  "video-merger": VideoMerger,
  "video-rotate": VideoRotate,
  "video-crop": VideoCrop,
  "video-mute": VideoMute,
  "video-speed": VideoSpeed,
  "video-watermark": VideoWatermark,
  "video-converter": VideoConverter,
  "video-compressor": VideoCompressor,
  "video-to-audio": VideoToAudio,
  "video-resize": VideoResize,
  "video-reverse": VideoReverse,
  "video-loop": VideoLoop,
  "video-bitrate-changer": VideoBitrateChanger,
  "video-to-gif": VideoToGif,
  "gif-to-video": GifToVideo,
  "video-thumbnail": VideoThumbnail,
  "video-frames-extractor": VideoFramesExtractor,
  "video-contact-sheet": VideoContactSheet,
  "video-social-crop": VideoSocialCrop,
  "webcam-recorder": WebcamRecorder,
  "screen-recorder": ScreenRecorder,
  "video-info": VideoInfo,
  "video-fps-changer": VideoFpsChanger,
  "video-brightness-contrast": VideoBrightnessContrast,
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
    document.title = `${cat?.name || 'Category'} – Video Tools | ToolsRift`;
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
    document.title = "Free Video Tools – Trim, Convert, Compress, GIF | ToolsRift";
  }, []);
  return (
    <CategoryLayout theme={PAGE_THEME} currentTool={null} tools={TOOLS} subcats={CATEGORIES}>
      <CategoryDashboard
        theme={PAGE_THEME}
        tools={TOOLS}
        subcats={CATEGORIES}
        searchPlaceholder="Search video tools..."
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
    <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:56, borderBottom:`1px solid ${scrolled?"rgba(194,65,12,0.2)":C.border}`, position:"sticky", top:0, background:`rgba(6,9,15,${scrolled?0.97:0.85})`, backdropFilter:"blur(12px)", zIndex:100, transition:"background 0.2s,border-color 0.2s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" aria-label="ToolsRift home" style={{display:"flex",alignItems:"center",flexShrink:0}}><img src="/logo.svg" alt="ToolsRift" style={{height:26,display:"block"}}/></a>
        <span style={{ color:"rgba(255,255,255,0.2)", fontSize:14 }}>›</span>
        <a href="#/" style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:500, color:C.accent, textDecoration:"none" }}>{THEME?.name||"Video Tools"}</a>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <span className="tr-nav-badge" style={{ background:"rgba(194,65,12,0.12)", color:C.accent, fontSize:11, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:"3px 10px", borderRadius:20, letterSpacing:"0.02em", border:"1px solid rgba(194,65,12,0.25)" }}>{TOOLS.length} tools</span>
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

function ToolsRiftVideo() {
  const route = useAppRouter();
  const showChrome = route.page !== 'home' && route.page !== 'tool';
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{GLOBAL_CSS}</style>
      {showChrome && <Nav />}
      {route.page==="home" && <HomePage />}
      {route.page==="tool" && <ToolPage toolId={route.toolId} />}
      {route.page==="category" && <CategoryPage catId={route.catId} />}
      {showChrome && <SiteFooter currentPage="video"/>}
    </div>
  );
}

export default ToolsRiftVideo;
